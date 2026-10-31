import {contentHash} from "../hash";
import {strings,type GenerationDefinition,type GeneratedBody} from "./definition";
import type {AdapterNode,DefinitionContract,DefinitionMetadata,NativeDefinition} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2017-business.json";
/** Caller supplies the final effective canonical pool; no year/index imports. */
export const legacy2017BusinessAdapterBinding={
 source:"2017h29h-fe-am-76",canonicalSource:"2018h30a-fe-am-76",version:"3.2.0",
 canonicalMetadataSha256:"e76bc07b578d60a05fdc7f4cfe34bf223f1ad2daea646ff26d417310b762e13e",
 canonicalContentHashes:["abaffb46d568b3344f21d6aaf0c4442e48c47b69fc1ed052e16dc65c6ba96412","0d28c60cdc72f75ce99abe587e590590251b2edb503f857bb1d3b77bb1411f95","ba15bfd7aa37e4d42fd81f743b29600e49cb7ca58907ec4bbea0be82a85b6a2e","7ad56e62aa2b27a87cc104e787359cc3c69763d2cb0459eb982f81fe9d32fc1d"],
} as const;
const annualChoices=[
 "事態の進展とともに様々な事象が想定される問題について対応策を検討し、望ましい結果に至るプロセスを定める方法である。",
 "収集した情報を相互の関連によってグループ化し、解決すべき問題点を明確にする方法である。",
 "複雑な要因が絡み合う事象について、その事象間の因果関係を明らかにする方法である。",
 "目的・目標を達成するための手段・方策を順次展開し、最適な手段・方策を追求していく方法である。",
];
/** A source-specific transform: the 2017 wording differs in exactly two choices. */
export function adaptLegacy2017BusinessBody(raw:GeneratedBody):GeneratedBody{
 const body=structuredClone(raw);
 body.choices=strings(annualChoices);
 return body;
}
function canonicalFrom(pool:readonly GenerationDefinition[]):GenerationDefinition{
 const matches=pool.filter(d=>d.source===legacy2017BusinessAdapterBinding.canonicalSource);
 if(matches.length!==1)throw Error("LEGACY_2017_BUSINESS_CANONICAL_REQUIRED");
 return matches[0];
}
function adaptedDefinition(build:GenerationDefinition["build"]):GenerationDefinition{
 return {...structuredClone(reviewed.adapter.metadata) as DefinitionMetadata,build};
}
function assertAdapterInput(values:number[]):void{
 if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>3)throw Error("PARAMETER_CONSTRAINT");
}
/** Existing eager preparation path; its output and public metadata stay unchanged. */
export async function makeLegacy2017BusinessAdaptedDefinitions(pool:readonly GenerationDefinition[]):Promise<GenerationDefinition[]>{
 const c=legacy2017BusinessAdapterBinding,d=canonicalFrom(pool);
 if(d.version!==c.version||await contentHash(JSON.parse(JSON.stringify(d)))!==c.canonicalMetadataSha256)throw Error("LEGACY_2017_BUSINESS_CANONICAL_REVIEW_REQUIRED");
 const bodies:GeneratedBody[]=[];
 for(let v=0;v<4;v++){
  const raw=d.build([v]);
  if(await contentHash(raw)!==c.canonicalContentHashes[v])throw Error("LEGACY_2017_BUSINESS_CANONICAL_BODY_REVIEW_REQUIRED");
  bodies.push(adaptLegacy2017BusinessBody(raw));
 }
 return[adaptedDefinition(values=>{assertAdapterInput(values);return structuredClone(bodies[values[0]]);})];
}
function contract(row:typeof reviewed.canonical|typeof reviewed.adapter):DefinitionContract{
 return {
  metadata:structuredClone(row.metadata) as DefinitionMetadata,
  inputs:row.outputs.map(output=>({values:[...output.values],expected:{kind:"body",sha256:output.sha256}})),
 };
}
/**
 * Isolated composition input, not a registry. Contracts were lifted scalar-for-
 * scalar from the reviewed commit; no build is called to create expectations.
 * create reads metadata only; each later input consumes exactly its mapped body.
 */
export async function makeLegacy2017BusinessCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 const canonical=canonicalFrom(pool),c=legacy2017BusinessAdapterBinding;
 for(const row of[reviewed.canonical,reviewed.adapter])
  if(await contentHash(row.metadata)!==row.metadataSha256)throw Error("LEGACY_2017_BUSINESS_CONTRACT_REVIEW_REQUIRED");
 const node:AdapterNode={
  source:c.source,dependencies:[c.canonicalSource],
  dependencyInputs:structuredClone(reviewed.dependencyInputs),contract:contract(reviewed.adapter),
  create:dependencies=>{
   const dependency=dependencies.get(c.canonicalSource);
   return adaptedDefinition(values=>{assertAdapterInput(values);return adaptLegacy2017BusinessBody(dependency.build(values));});
  },
 };
 return {native:[{definition:canonical,contract:contract(reviewed.canonical)}],adapters:[node]};
}
