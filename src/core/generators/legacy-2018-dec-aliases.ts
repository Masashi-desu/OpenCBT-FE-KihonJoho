import {decemberADefinitions} from "./sample-2022-dec-a";
import type {GenerationDefinition} from "./definition";
import {contentHash} from "../hash";
import type {AdapterNode,DefinitionContract,DefinitionMetadata,DependencyInputMap,NativeDefinition,ReviewedBodyGroup} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2018-december.json";

/** Manually fixed after both official source images were compared. The annual
 * source identity remains separate; the parent must deduplicate canonical inputs. */
export const legacy2018DecemberContracts=[
  {source:"2018h30h-fe-am-24",canonicalSource:"sample-2022-dec-a-20",sourceAnswer:"エ",version:"3.2.0",reference:[3],fields:[{name:"検査する条件",minimum:0,maximum:3}]},
  {source:"2018h30a-fe-am-31",canonicalSource:"sample-2022-dec-a-26",sourceAnswer:"エ",version:"3.2.0",reference:[4,1],fields:[{name:"データ量の3MB単位",minimum:2,maximum:6},{name:"速度の1.5Mbps単位",minimum:1,maximum:2}]},
  {source:"2018h30h-fe-am-41",canonicalSource:"sample-2022-dec-a-36",sourceAnswer:"ア",version:"3.2.0",reference:[0],fields:[{name:"問う対象",minimum:0,maximum:3}]},
  {source:"2018h30h-fe-am-65",canonicalSource:"sample-2022-dec-a-51",sourceAnswer:"エ",version:"3.2.0",reference:[3],fields:[{name:"問う条件",minimum:0,maximum:3}]},
  {source:"2018h30h-fe-am-74",canonicalSource:"sample-2022-dec-a-55",sourceAnswer:"イ",version:"3.2.0",reference:[1],fields:[{name:"問う対象",minimum:0,maximum:3}]},
  {source:"2018h30h-fe-am-60",canonicalSource:"sample-2022-dec-a-48",sourceAnswer:"イ",version:"3.2.0",reference:[0],fields:[{name:"監査で確認する特性",minimum:0,maximum:2}]},
  {source:"2018h30a-fe-am-7",canonicalSource:"sample-2022-dec-a-9",sourceAnswer:"エ",version:"3.2.0",reference:[0],fields:[{name:"着目する条件・記述",minimum:0,maximum:2}]},
  {source:"2018h30h-fe-am-17",canonicalSource:"sample-2022-dec-a-18",sourceAnswer:"エ",version:"3.2.0",answerVariation:"fixed",reference:[0],fields:[{name:"着目する条件・記述",minimum:0,maximum:3}]},
  {source:"2018h30h-fe-am-4",canonicalSource:"sample-2022-dec-a-4",sourceAnswer:"ア",version:"3.2.0",reference:[0],fields:[{name:"入力記号列",minimum:0,maximum:5}],clarification:"旧原問には『入力記号は左から順に読み込まれる』の明示がない。原問題の画像・正答は変更せず、生成基準・生成問題にだけ解答前の入力方向の明確化を追加する改変として表示する。原問の注意書きが全文同一とはしない。原図の6遷移・初期状態と通常の記号列の解釈に矛盾せず、原値の正答も変わらない。"},
] as const;
export const legacy2018DecemberAliases=legacy2018DecemberContracts.map(c=>({source:c.source,canonicalSource:c.canonicalSource,parameterMap:"identity" as const,...("clarification"in c?{clarification:c.clarification}:{})}));
export const legacy2018DecemberClarifications:Record<string,string>=Object.fromEntries(legacy2018DecemberContracts.flatMap(c=>"clarification"in c?[[c.source,c.clarification]]:[]));
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

export function makeLegacy2018DecemberDefinitions(definitions:readonly GenerationDefinition[]):GenerationDefinition[]{
  return legacy2018DecemberContracts.map(c=>{
    const d=definitions.find(d=>d.source===c.canonicalSource);
    if(!d||d.sourceAnswer!==c.sourceAnswer||(d.version??"3.2.0")!==c.version||(d.answerVariation??null)!==("answerVariation"in c?c.answerVariation:null)||JSON.stringify(d.fields)!==JSON.stringify(c.fields)||JSON.stringify(d.reference)!==JSON.stringify(c.reference))throw Error(`LEGACY_CANONICAL_REVIEW_REQUIRED: ${c.source}`);
    const{build:_,...metadata}={...d,source:c.source,version:c.version,reference:[...c.reference],fields:c.fields.map(f=>({...f})),notes:d.notes+` 2018年度の原問題${c.source}と${c.canonicalSource}の原問題画像を、媒体・全条件・全注記・全4択で照合し、同一部分と明示した差異を区別した。年度別出典・公式正答・rightsを別に保持する。入力契約を手で固定し、全入力の独立oracleと表示内容hashの変化時には年度別再査読を要求する。`+("clarification"in c?` ${c.clarification}`:"")};
    return identityDefinition(metadata,d);
  });
}
export const legacy2018DecemberDefinitions=makeLegacy2018DecemberDefinitions(decemberADefinitions);

/** Metadata-only new API. Existing raw defaults above are compatibility
 * exports, never an implicit fallback for this explicit effective pool. */
export async function makeLegacy2018DecemberCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 if(!Array.isArray(pool))throw Error("LEGACY_2018_DECEMBER_POOL_REQUIRED");
 const native:NativeDefinition[]=[],adapters:AdapterNode[]=[];
 for(const row of reviewed.rows as unknown as ReviewRow[]){
  const source=row.canonical.metadata.source,found=pool.filter(d=>Object.getOwnPropertyDescriptor(d,'source')?.value===source);
  if(found.length!==1)throw Error(`LEGACY_2018_DECEMBER_CANONICAL_${found.length?'DUPLICATE':'MISSING'}: ${source}`);
  const canonical=found[0];if(!sameData(canonical,row.canonical.metadata,true))throw Error(`LEGACY_2018_DECEMBER_CANONICAL_REVIEW_REQUIRED: ${source}`);
  for(const side of['canonical','adapter']as const)if(await contentHash(row[side].metadata)!==row[side].metadataSha256)throw Error("LEGACY_2018_DECEMBER_CONTRACT_REVIEW_REQUIRED");
  native.push({definition:canonical,contract:contract(row,'canonical')});
  adapters.push({source:row.adapter.metadata.source,dependencies:[source],dependencyInputs:structuredClone(row.dependencyInputs),contract:contract(row,'adapter'),create:deps=>identityDefinition(row.adapter.metadata,deps.get(source))});
 }return{native,adapters};
}
