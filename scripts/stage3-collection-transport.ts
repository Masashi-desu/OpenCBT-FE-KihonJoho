import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import type { Bundle, Question } from '../src/core/types';
import { catalogFileRecords, catalogKinds, CATALOG_MAX_BYTES } from '../src/core/catalog-files';
import { encodeRecordPacks, readDistributionBundle } from './distribution-files';
import { isStage3MorningCollection, type Stage3MorningRecords } from './stage3-morning-records';
import { sortedJson } from '../src/core/hash';
import { hasAssetSignature } from '../src/core/asset-signature';

const hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
/** Transports only an explicit reviewed collection closure. Preserve every
 * unrelated record and material byte, and replace only the containing mix
 * metadata pack. No directory glob can admit a prepared/held question. */
export function stage3CollectionFiles(baseline:Bundle, selected:Stage3MorningRecords, read:(name:string)=>Uint8Array) {
  assert.equal(selected.sets.length,1);const annual=structuredClone(selected.sets[0]);
  const collection=annual.id.slice('set-annual-'.length);
  assert.equal(annual.id,'set-annual-'+collection);
  assert(isStage3MorningCollection(collection),'only explicitly supported booklet identities');
  const numbers=annual.questionRefs.map(r=>Number(r.questionId.split('-').at(-1)));
  assert(numbers.length>0 && new Set(numbers).size===numbers.length);
  assert(numbers.every(n=>Number.isInteger(n)&&n>=1&&n<=80));
  assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b));
  const originalIds=new Set(annual.questionRefs.map(r=>r.questionId)),templates=new Set(selected.templates.map(t=>t.id));
  assert.equal(selected.questions.length,numbers.length*2);assert.equal(templates.size,numbers.length);
  assert.deepEqual([...templates],numbers.map(n=>'template-source-'+collection+'-'+n));
  assert.deepEqual(selected.questions.filter(q=>q.origin.kind==='official_reprint').map(q=>q.id),[...originalIds]);
  const allowed=new Set([...originalIds,...numbers.map(n=>'question-template-source-'+collection+'-'+n)]);
  assert(selected.questions.every(q=>allowed.has(q.id)) && new Set(selected.questions.map(q=>q.id)).size===allowed.size);
  assert(selected.templates.every((t,i)=>t.baseQuestionRef.questionId==='question-template-source-'+collection+'-'+numbers[i] &&
    t.generatorRef.id==='generator-source-'+collection+'-'+numbers[i] && t.baseQuestionRef.revision===1));
  assert.deepEqual([...originalIds],numbers.map(n=>'question-ipa-'+collection+'-'+n));
  assert.deepEqual(selected.exams.map(e=>e.id),['exam-'+collection+'-study','exam-'+collection+'-practice']);
  assert(selected.exams.every(e=>e.questionCount===numbers.length && e.subject==='A'));
  assert.equal(selected.exams[1].timeLimitSeconds,9000);
  assert.deepEqual(annual.examConfigRefs,selected.exams.map(e=>({id:e.id,revision:e.revision})));
  const neededAssets=new Set(selected.questions.flatMap(q=>q.assetRefs));
  assert.equal(neededAssets.size,selected.assets.length);
  assert.equal(new Set(selected.assets.map(a=>a.id)).size,selected.assets.length);
  assert(selected.assets.every(a=>neededAssets.has(a.id)));
  for(const q of selected.questions) assert(Object.values(q.review.checks).every(v=>v==='pass'));
  for(const r of selected.rights) assert(Object.values(r.uses).every(v=>v==='allowed') && ['none_identified','present_cleared'].includes(r.thirdParty.status));
  const added=structuredClone(selected);
  for(const q of added.questions)q.distribution='included';
  for(const t of added.templates)t.distribution='included';
  for(const s of added.sets)s.distribution='included';
  for(const template of added.templates){
    const base=added.questions.find(q=>q.id===template.baseQuestionRef.questionId);
    assert(base && base.revision===template.baseQuestionRef.revision);
    template.originalContentSha256=hash(Buffer.from(JSON.stringify(sortedJson(base))));
  }
  const existing=new Map(catalogKinds.flatMap(k=>baseline[k].map(row=>[row.id,{kind:k,row}] as const)));
  const oldAssetPaths=new Set(baseline.assets.map(a=>a.path.toLowerCase())),newAssetPaths=new Set<string>();
  for(const asset of added.assets){
    assert(/^assets\/[a-z0-9/_-]+\.(?:png|webp|svg)$/.test(asset.path) && !asset.path.split('/').some(p=>p==='.'||p==='..'||!p),'normalized asset path');
    const p=asset.path.toLowerCase();
    if(!existing.has(asset.id))assert(!oldAssetPaths.has(p),'new asset collides with a retained material path');
    assert(!newAssetPaths.has(p),'new asset paths must be unique');newAssetPaths.add(p);
  }
  for(const kind of catalogKinds)for(const row of added[kind]){
    const old=existing.get(row.id);
    assert(!old || old.kind===kind && isDeepStrictEqual(old.row,row),'existing record collision: '+row.id);
    if(old) assert(['sources','rights','assets'].includes(kind),'collection already registered: '+row.id);
  }
  const mix=baseline.sets.find(s=>s.id==='set-mix-a');assert(mix);
  const appended=added.templates.map(t=>({questionRef:structuredClone(t.baseQuestionRef),templateRef:{id:t.id,revision:t.revision}}));
  const nextMix={...structuredClone(mix),revision:mix.revision+1,questionRefs:[...mix.questionRefs,...appended.map(b=>b.questionRef)],generationBindings:[...mix.generationBindings,...appended]};
  const catalog=structuredClone(baseline.catalog);catalog.revision++;
  const files=new Map<string,Uint8Array>(),removed:string[]=[],preserved:string[]=[];
  for(const kind of catalogKinds){
    catalog.files[kind]=[];
    for(const entry of baseline.catalog.files[kind]){
      const bytes=read(entry.path);assert.equal(hash(bytes),entry.sha256);
      const records=catalogFileRecords(entry,JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
      if(kind==='sets' && records.some(r=>(r as {id:string}).id===mix.id)){
        for(const pack of encodeRecordPacks(kind,records.map(r=>(r as {id:string}).id===mix.id?nextMix:r))){catalog.files[kind].push(pack.entry);files.set(pack.entry.path,pack.bytes);}
        removed.push(entry.path);
      }else{catalog.files[kind].push(entry);files.set(entry.path,bytes);preserved.push(entry.path);}
    }
    for(const pack of encodeRecordPacks(kind,added[kind].filter(r=>!existing.has(r.id)))){
      assert(!files.has(pack.entry.path),'pack collision');catalog.files[kind].push(pack.entry);files.set(pack.entry.path,pack.bytes);
    }
    assert(catalog.files[kind].length<=500);
  }
  const bytes=Buffer.from(JSON.stringify(catalog,null,2)+'\n');assert(bytes.length<=CATALOG_MAX_BYTES);
  files.set('catalog.json',bytes);return {files,removed,preserved,catalog,added,nextMix};
}
/** Fresh ignored destination only; callers inspect and validate the actual
 * candidate before choosing the exact files to install into a release tree. */
export function writeStage3CollectionCandidate(baselineRoot:string, selected:Stage3MorningRecords, materials:ReadonlyMap<string,string>, destination:string) {
  assert(!fs.existsSync(destination),'fresh destination required');
  const baseline=readDistributionBundle(baselineRoot),result=stage3CollectionFiles(baseline,selected,p=>fs.readFileSync(path.join(baselineRoot,p)));
  const allAssets=[...baseline.assets,...result.added.assets.filter(a=>!baseline.assets.some(b=>b.id===a.id))];
  const materialBytes=new Map<string,Buffer>();
  for(const asset of allAssets){
    const from=materials.get(asset.id)??path.join(baselineRoot,asset.path),bytes=fs.readFileSync(from);
    assert.equal(hash(bytes),asset.sha256,asset.id);assert.equal(bytes.length,asset.byteLength,asset.id);
    assert(hasAssetSignature(asset,bytes),'asset signature: '+asset.id);
    assert(!path.isAbsolute(asset.path)&&!asset.path.split('/').some(p=>p==='..'||p==='.'),'normalized asset path');
    materialBytes.set(asset.path,bytes);
  }
  fs.mkdirSync(destination,{recursive:true});
  for(const [relative,bytes] of [...result.files,...materialBytes]){const target=path.join(destination,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
  for(const asset of allAssets)assert.equal(hash(fs.readFileSync(path.join(destination,asset.path))),asset.sha256,'final material bytes: '+asset.id);
  const actual=readDistributionBundle(destination);assert.equal(actual.questions.length,baseline.questions.length+selected.questions.length);
  for(const kind of catalogKinds)for(const row of baseline[kind])assert.deepEqual(actual[kind].find(r=>r.id===row.id),kind==='sets'&&row.id==='set-mix-a'?result.nextMix:row);
  return {...result,actual};
}
