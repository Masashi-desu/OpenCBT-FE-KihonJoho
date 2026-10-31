import { knowledgeDefinitions } from "./knowledge";
import type { GenerationDefinition } from "./definition";
import {contentHash} from "../hash";
import type {AdapterNode,DefinitionContract,DefinitionMetadata,DependencyInputMap,NativeDefinition,ReviewedBodyGroup} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2018-modern.json";

/** Source identities remain annual, but these reviewed questions share the
 * canonical input family. The parent integrates this map into mix de-duplication
 * before registration. No import of generators/index.ts (which would cycle).
 */
export const legacy2018CanonicalAliases = [
  {source:"2018h30a-fe-am-6",canonicalSource:"2026-a-2",parameterMap:"identity"},
  {source:"2018h30a-fe-am-25",canonicalSource:"2024-a-6",parameterMap:"identity"},
  {source:"2018h30a-fe-am-32",canonicalSource:"2024-a-8",parameterMap:"identity"},
  {source:"2018h30a-fe-am-74",canonicalSource:"2023-a-19",parameterMap:"identity"},
  {source:"2018h30a-fe-am-11",canonicalSource:"sample-2022-dec-a-11",parameterMap:"identity"},
] as const;
/** Image review fixed this contract on 2026-10-19. Do not derive it from the
 * current canonical implementation: a later change requires annual re-review. */
export const legacy2018AliasContracts=[
  {source:"2018h30a-fe-am-6",canonicalSource:"2026-a-2",sourceAnswer:"ウ",version:"3.2.0",reference:[0,0],fields:[{name:"問う対象・判定する条件",minimum:0,maximum:3},{name:"選択肢の配置",minimum:0,maximum:2}]},
  {source:"2018h30a-fe-am-25",canonicalSource:"2024-a-6",sourceAnswer:"ア",version:"3.2.0",reference:[0,0],fields:[{name:"問う対象・判定する条件",minimum:0,maximum:3},{name:"選択肢の配置",minimum:0,maximum:2}]},
  {source:"2018h30a-fe-am-32",canonicalSource:"2024-a-8",sourceAnswer:"ウ",version:"3.2.0",reference:[0,0],fields:[{name:"問う対象・判定する条件",minimum:0,maximum:3},{name:"選択肢の配置",minimum:0,maximum:2}]},
  {source:"2018h30a-fe-am-74",canonicalSource:"2023-a-19",sourceAnswer:"エ",version:"3.2.0",reference:[0,0],fields:[{name:"問う対象・判定する条件",minimum:0,maximum:3},{name:"選択肢の配置",minimum:0,maximum:2}]},
] as const;
/** Compare complete JSON metadata without invoking getters or losing own
 * undefined/symbol/non-enumerable properties through JSON.stringify. */
function sameData(a:unknown,b:unknown,omitBuild=false):boolean{
 if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return Object.is(a,b);
 if(Array.isArray(a)!==Array.isArray(b))return false;
 const proto=Object.getPrototypeOf(a);if(proto!==(Array.isArray(a)?Array.prototype:Object.prototype)&&proto!==null)return false;
 const keys=(v:object)=>Reflect.ownKeys(v).filter(k=>!omitBuild||k!=='build');const ak=keys(a),bk=keys(b);
 if(ak.length!==bk.length||ak.some(k=>typeof k!=='string'||!bk.includes(k)))return false;
 return ak.every(k=>{const x=Object.getOwnPropertyDescriptor(a,k)!,y=Object.getOwnPropertyDescriptor(b,k)!;return 'value'in x&&'value'in y&&x.enumerable===y.enumerable&&sameData(x.value,y.value);});
}
type ReviewRow={canonical:{metadata:DefinitionMetadata;metadataSha256:string};adapter:{metadata:DefinitionMetadata;metadataSha256:string};group:ReviewedBodyGroup;dependencyInputs:DependencyInputMap[]};
function contract(row:ReviewRow,side:'canonical'|'adapter'):DefinitionContract{return{metadata:structuredClone(row[side].metadata),inputs:row.group.orderedInputs.map(values=>({values:[...values],expected:{kind:'group-member' as const,groupId:row.group.id}})),groups:[structuredClone(row.group)]};}
/** Both compatibility eager and new lazy paths retain the identity build. */
function identityDefinition(metadata:DefinitionMetadata,dependency:Pick<GenerationDefinition,'build'>):GenerationDefinition{const m=structuredClone(metadata);return{...m,build:values=>{if(values.length!==m.fields.length||values.some((v,i)=>!Number.isInteger(v)||v<m.fields[i].minimum||v>m.fields[i].maximum))throw Error('PARAMETER_CONSTRAINT');return dependency.build(values);}};}

export function makeLegacy2018AliasDefinitions(canonicalDefinitions:readonly GenerationDefinition[]):GenerationDefinition[]{return legacy2018CanonicalAliases
  .filter(x=>!x.canonicalSource.startsWith("sample-"))
  .map(alias=>{
    const canonical=canonicalDefinitions.find(d=>d.source===alias.canonicalSource),contract=legacy2018AliasContracts.find(c=>c.source===alias.source);
    if(!canonical||!contract||canonical.sourceAnswer!==contract.sourceAnswer||(canonical.version??"3.2.0")!==contract.version||JSON.stringify(canonical.fields)!==JSON.stringify(contract.fields)||JSON.stringify(canonical.reference)!==JSON.stringify(contract.reference))throw Error(`LEGACY_CANONICAL_REVIEW_REQUIRED: ${alias.source}`);
    const{build:_,...metadata}={...canonical,source:alias.source,version:contract.version,fields:contract.fields.map(f=>({...f})),reference:[...contract.reference],notes:canonical.notes+` 2018秋期旧午前の原問画像を${alias.canonicalSource}の公式原問画像と照合し、問い・前提・全選択肢が一致することを確認した。年度別の原問題・正答・出典を保持し、手で固定した入力域・基準入力・生成器版と管理済みbuildを再利用する。全入力の表示内容hashと独立意味の検査が変化した場合は年度別再査読を要求する。改変基準問題の言い換え・選択肢順は既存canonicalの査読を継承し、公式原択の再録とは区別する。`};
    return identityDefinition(metadata,canonical);
  });}
export const legacy2018AliasDefinitions=makeLegacy2018AliasDefinitions(knowledgeDefinitions);

/** Metadata-only new API. Existing raw defaults above are compatibility
 * exports, never an implicit fallback for this explicit effective pool. */
export async function makeLegacy2018AliasCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 if(!Array.isArray(pool))throw Error("LEGACY_2018_MODERN_POOL_REQUIRED");
 const native:NativeDefinition[]=[],adapters:AdapterNode[]=[];
 for(const row of reviewed.rows as unknown as ReviewRow[]){
  const source=row.canonical.metadata.source,found=pool.filter(d=>Object.getOwnPropertyDescriptor(d,'source')?.value===source);
  if(found.length!==1)throw Error(`LEGACY_2018_MODERN_CANONICAL_${found.length?'DUPLICATE':'MISSING'}: ${source}`);
  const canonical=found[0];if(!sameData(canonical,row.canonical.metadata,true))throw Error(`LEGACY_2018_MODERN_CANONICAL_REVIEW_REQUIRED: ${source}`);
  for(const side of['canonical','adapter']as const)if(await contentHash(row[side].metadata)!==row[side].metadataSha256)throw Error("LEGACY_2018_MODERN_CONTRACT_REVIEW_REQUIRED");
  native.push({definition:canonical,contract:contract(row,'canonical')});
  adapters.push({source:row.adapter.metadata.source,dependencies:[source],dependencyInputs:structuredClone(row.dependencyInputs),contract:contract(row,'adapter'),create:deps=>identityDefinition(row.adapter.metadata,deps.get(source))});
 }return{native,adapters};
}
