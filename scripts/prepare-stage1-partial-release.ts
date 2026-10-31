import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {isDeepStrictEqual} from "node:util";
import {pathToFileURL} from "node:url";
import type {Bundle, Catalog, SetRecord} from "../src/core/types";
import {catalogKinds, catalogFileRecords, CATALOG_MAX_BYTES} from "../src/core/catalog-files";
import {readDistributionBundle, encodeRecordPacks} from "./distribution-files";

export const stage1AMCollections = [
  {id:"2017h29h-fe-am",held:[55,66]}, {id:"2017h29a-fe-am",held:[55]},
  {id:"2018h30h-fe-am",held:[39,47,62]}, {id:"2018h30a-fe-am",held:[39,65]},
  {id:"2019h31h-fe-am",held:[41,51,67]}, {id:"2019r01a-fe-am",held:[55,57]},
] as const;
const approvedCatalog = "6dca67a7a3ca281db9fe0baaa8470a755e9f06f4b0d0da0e4aefb86aec9787ed";
const sha = (raw:Uint8Array) => createHash("sha256").update(raw).digest("hex");
type Node = {id:string};
/** Select the reviewed AM closure, never the candidate's older public cohort.
 * This transport does not grant admission: material, content, app and successor
 * checks must still accept the resulting exact bytes before release. */
export function stage1PartialReleaseRecordFiles(baseline:Bundle, approved:Bundle, readBaseline:(name:string)=>Uint8Array) {
  if (approved.catalogHash !== approvedCatalog) throw Error("AM_APPROVED_CATALOG");
  const index = new Map<string,{kind:typeof catalogKinds[number];node:Node}>();
  for (const kind of catalogKinds) for (const node of approved[kind]) {
    if (index.has(node.id)) throw Error("AM_DUPLICATE_ID");
    index.set(node.id,{kind,node});
  }
  const ids = new Set<string>();
  for (const collection of stage1AMCollections) {
    const numbers = Array.from({length:80},(_,i)=>i+1).filter(n=>!(collection.held as readonly number[]).includes(n));
    for (const n of numbers) for (const id of [`question-ipa-${collection.id}-${n}`,`question-template-source-${collection.id}-${n}`,`template-source-${collection.id}-${n}`]) {
      if (!index.has(id)) throw Error("AM_MISSING_ELIGIBLE: "+id);
      ids.add(id);
    }
    for (const n of collection.held) for (const prefix of ["question-ipa-","question-template-source-","template-source-"])
      if (index.has(`${prefix}${collection.id}-${n}`)) throw Error("AM_HELD_INCLUDED");
    for (const id of [`set-annual-${collection.id}`,`exam-${collection.id}-practice`,`exam-${collection.id}-study`]) {
      if (!index.has(id)) throw Error("AM_MISSING_COLLECTION");
      ids.add(id);
    }
    const annual = index.get(`set-annual-${collection.id}`)!.node as SetRecord;
    if (!isDeepStrictEqual(annual.questionRefs.map(r=>r.questionId),numbers.map(n=>`question-ipa-${collection.id}-${n}`))) throw Error("AM_ANNUAL_ORDER");
  }
  const collect = (value:unknown):void => {
    if (typeof value === "string" && index.has(value) && !ids.has(value)) {ids.add(value);pending.push(value);}
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  const pending = [...ids];
  while (pending.length) collect(index.get(pending.pop()!)!.node);
  const added = Object.fromEntries(catalogKinds.map(kind=>[kind,[...ids].filter(id=>index.get(id)!.kind===kind).map(id=>index.get(id)!.node)])) as Record<typeof catalogKinds[number],Node[]>;
  if (added.questions.length!==934 || added.templates.length!==467 || added.assets.length!==471 || added.sets.length!==6 || added.exams.length!==12) throw Error("AM_CLOSURE_COUNT");
  const baselineIndex = new Map(catalogKinds.flatMap(kind=>baseline[kind].map(node=>[node.id,{kind,node}] as const)));
  for (const kind of catalogKinds) for (const node of added[kind]) {
    const old = baselineIndex.get(node.id);
    if (old && (old.kind!==kind || !isDeepStrictEqual(old.node,node))) throw Error("AM_EXISTING_COLLISION: "+node.id);
    if (old && ["questions","templates","sets","exams"].includes(kind)) throw Error("AM_ALREADY_REGISTERED: "+node.id);
  }
  const mix = baseline.sets.find(s=>s.id==="set-mix-a");
  const approvedMix = approved.sets.find(s=>s.id==="set-mix-a");
  if (!mix?.generationBindings || !approvedMix?.generationBindings) throw Error("AM_MIX_MISSING");
  const templateIds = new Set(added.templates.map(t=>t.id));
  const append = approvedMix.generationBindings.filter(b=>templateIds.has(b.templateRef.id));
  if (append.length!==467 || new Set(append.map(b=>b.templateRef.id)).size!==467) throw Error("AM_MIX_APPEND");
  const nextMix:SetRecord = {...structuredClone(mix),revision:mix.revision+1,
    questionRefs:[...mix.questionRefs,...append.map(b=>b.questionRef)],generationBindings:[...mix.generationBindings,...append]};
  const catalog:Catalog = structuredClone(baseline.catalog);catalog.revision++;
  const files = new Map<string,Uint8Array>();
  const removed:string[] = [], preserved:string[] = [];
  for (const kind of catalogKinds) {
    catalog.files[kind] = [];
    for (const entry of baseline.catalog.files[kind]) {
      const raw=readBaseline(entry.path);
      if (sha(raw)!==entry.sha256) throw Error("AM_BASELINE_FILE: "+entry.path);
      const parsed=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(raw));
      const records=catalogFileRecords(entry,parsed) as Node[];
      if (kind==="sets" && records.some(r=>r.id==="set-mix-a")) {
        const replacement=encodeRecordPacks(kind,records.map(r=>r.id==="set-mix-a"?nextMix:r));
        for (const pack of replacement) {catalog.files[kind].push(pack.entry);files.set(pack.entry.path,pack.bytes);}
        removed.push(entry.path);
      } else {catalog.files[kind].push(entry);files.set(entry.path,raw);preserved.push(entry.path);}
    }
    const additions=added[kind].filter(r=>!baselineIndex.has(r.id)).sort((a,b)=>a.id.localeCompare(b.id));
    for (const pack of encodeRecordPacks(kind,additions)) {
      if (files.has(pack.entry.path)) throw Error("AM_PACK_COLLISION");
      catalog.files[kind].push(pack.entry);files.set(pack.entry.path,pack.bytes);
    }
    if (catalog.files[kind].length>500) throw Error("AM_FILE_LIMIT");
  }
  const raw = Buffer.from(JSON.stringify(catalog,null,2)+"\n");
  if (raw.byteLength>CATALOG_MAX_BYTES) throw Error("AM_CATALOG_SIZE");
  files.set("catalog.json",raw);
  return {catalog,catalogHash:sha(raw),files,added,removed,preserved,held:stage1AMCollections.flatMap(c=>c.held.map(n=>`${c.id}-${n}`))};
}

/** Writes only a new ignored review directory. Installation is a separately
 * reviewed action, after validating the complete transport and asset hashes. */
export function prepareStage1PartialRelease(approvedRoot:string,baselineRoot:string,output:string) {
  const approved=readDistributionBundle(approvedRoot), baseline=readDistributionBundle(baselineRoot);
  const result=stage1PartialReleaseRecordFiles(baseline,approved,n=>fs.readFileSync(path.join(baselineRoot,n)));
  const assets=stage1PartialReleaseAssetFiles(baseline.assets,result.added.assets as Bundle["assets"],
    (owner,name)=>fs.readFileSync(path.join(owner==="baseline"?baselineRoot:approvedRoot,name)));
  if (!path.resolve(output).includes(path.sep+"output"+path.sep+"source-review"+path.sep)) throw Error("AM_PRIVATE_OUTPUT_REQUIRED");
  fs.mkdirSync(output,{recursive:false});
  for (const [name,raw] of [...result.files,...assets]) {
    const file=path.join(output,"data",name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,raw,{flag:"wx"});
  }
  const report={inputCatalogSHA256:approved.catalogHash,baselineCatalogSHA256:baseline.catalogHash,preparedCatalogSHA256:result.catalogHash,
    addedCounts:Object.fromEntries(catalogKinds.map(k=>[k,result.added[k].filter(r=>!baseline[k].some(b=>b.id===r.id)).length])),
    held:result.held,removedRecordFiles:result.removed,preservedRecordFiles:result.preserved,releaseAdmission:false};
  fs.writeFileSync(path.join(output,"report.json"),JSON.stringify(report,null,2)+"\n",{flag:"wx"});
  return report;
}

/** Exact asset byte collection shared by the real transport and negative
 * controls. It cannot establish rights or ordinary application admission. */
export function stage1PartialReleaseAssetFiles(baseline:readonly Bundle["assets"][number][], additions:readonly Bundle["assets"][number][], read:(owner:"baseline"|"approved",name:string)=>Uint8Array) {
  const files=new Map<string,Uint8Array>();
  for (const [owner,records] of [["baseline",baseline],["approved",additions]] as const)
    for (const asset of records) {
      if (!/^assets\/[a-zA-Z0-9-]+\.(?:webp|png|jpg|jpeg|svg)$/.test(asset.path)) throw Error("AM_ASSET_PATH");
      const raw=new Uint8Array(read(owner,asset.path));
      if (sha(raw)!==asset.sha256 || raw.byteLength!==asset.byteLength) throw Error("AM_ASSET_HASH: "+asset.id);
      const old=files.get(asset.path);if(old && !Buffer.from(old).equals(raw))throw Error("AM_ASSET_PATH_COLLISION");
      files.set(asset.path,raw);
    }
  return files;
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  if(process.argv.length!==5) throw Error("Usage: tsx scripts/prepare-stage1-partial-release.ts APPROVED_DATA BASELINE_DATA NEW_REVIEW_OUTPUT");
  console.log(JSON.stringify(prepareStage1PartialRelease(...process.argv.slice(2) as [string,string,string]),null,2));
}
