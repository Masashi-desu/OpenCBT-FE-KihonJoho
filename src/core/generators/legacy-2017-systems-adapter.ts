import type {AdapterNode,DefinitionContract,DefinitionMetadata,NativeDefinition} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2017-systems.json";
import {contentHash,sortedJson} from "../hash";
import {strings,type GenerationDefinition,type GeneratedBody} from "./definition";
/** Final effective definitions are supplied by the caller. No year/index import.
 * The mechanism is shared; the two official questions do NOT have identical text. */
export const legacy2017SystemsAdapterBinding={source:"2017h29h-fe-am-35",canonicalSource:"2019h31h-fe-am-35",version:"3.2.0",sourceAnswer:"ウ",fields:[{name:"機能・条件",minimum:0,maximum:2}],reference:[0],canonicalReviewedCommit:"771b8d3",canonicalBodyHashes:["3c4579864de82d2691c936d04eccde3368c9225b70a48335a487ada66ea138a3","1809ad112af40178e8f4e4bf97dc096f1ca390a342ba97ff1f1d183ec099c302","591958b31066e5f578dbd6969d10fedc17c2a0076a634bdded58b20ced6d40a8"]} as const;
const annualChoices=[
 "RFIDを用いるIoT（Internet of Things）技術の一つであり、物流ネットワークを最適化するためのソフトウェアアーキテクチャ",
 "音楽や動画、オンラインゲームなどの様々なソフトウェアコンテンツをインターネット経由で効率的に配信するために開発された、ネットワーク上のサーバの最適配置手法",
 "データ転送と経路制御の機能を論理的に分離し、データ転送に特化したネットワーク機器とソフトウェアによる経路制御の組合せで実現するネットワーク技術",
 "データフロー図やアクティビティ図などの図を活用して、業務プロセスの問題点を発見し改善を行うための、業務分析と可視化ソフトウェアの技術",
];
/** The only source-specific body edit: retain the original 2017 four choices. */
export function adaptLegacy2017SystemsBody(raw:GeneratedBody):GeneratedBody{
 const body=structuredClone(raw);body.choices=strings(annualChoices);return body;
}
function canonicalFrom(pool:readonly GenerationDefinition[]):GenerationDefinition{
 const c=legacy2017SystemsAdapterBinding,matches=pool.filter(d=>d.source===c.canonicalSource);
 if(matches.length!==1)throw Error("LEGACY_2017_SYSTEMS_CANONICAL_REQUIRED");
 const d=matches[0],{build:_,...metadata}=d;
 if(JSON.stringify(Object.keys(metadata).sort())!==JSON.stringify(Object.keys(reviewed.canonical.metadata).sort())||JSON.stringify(sortedJson(metadata))!==JSON.stringify(sortedJson(reviewed.canonical.metadata)))throw Error("LEGACY_2017_SYSTEMS_CANONICAL_REVIEW_REQUIRED");
 return d;
}
function adaptedDefinition(build:GenerationDefinition["build"]):GenerationDefinition{
 return {...structuredClone(reviewed.adapter.metadata) as DefinitionMetadata,build:values=>{
  if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>2)throw Error("PARAMETER_CONSTRAINT");return build(values);
 }};
}
export async function makeLegacy2017SystemsAdaptedDefinitions(pool:readonly GenerationDefinition[]):Promise<GenerationDefinition[]>{
 const d=canonicalFrom(pool),c=legacy2017SystemsAdapterBinding,bodies:GeneratedBody[]=[];
 for(let v=0;v<3;v++){
  const raw=d.build([v]);if(await contentHash(raw)!==c.canonicalBodyHashes[v])throw Error("LEGACY_2017_SYSTEMS_CANONICAL_BODY_REVIEW_REQUIRED");
  bodies.push(adaptLegacy2017SystemsBody(raw));
 }
 return [adaptedDefinition(values=>structuredClone(bodies[values[0]]))];
}
function contract(row:typeof reviewed.canonical|typeof reviewed.adapter):DefinitionContract{
 return {metadata:structuredClone(row.metadata) as DefinitionMetadata,inputs:row.outputs.map(r=>({values:[...r.values],expected:{kind:"body",sha256:r.sha256}}))};
}
export async function makeLegacy2017SystemsCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 const canonical=canonicalFrom(pool),c=legacy2017SystemsAdapterBinding;
 for(const row of[reviewed.canonical,reviewed.adapter])if(await contentHash(row.metadata)!==row.metadataSha256)throw Error("LEGACY_2017_SYSTEMS_CONTRACT_REVIEW_REQUIRED");
 return {native:[{definition:canonical,contract:contract(reviewed.canonical)}],adapters:[{source:c.source,dependencies:[c.canonicalSource],dependencyInputs:structuredClone(reviewed.dependencyInputs),contract:contract(reviewed.adapter),create:dependencies=>{
  const dependency=dependencies.get(c.canonicalSource);return adaptedDefinition(values=>adaptLegacy2017SystemsBody(dependency.build(values)));
 }}]};
}
