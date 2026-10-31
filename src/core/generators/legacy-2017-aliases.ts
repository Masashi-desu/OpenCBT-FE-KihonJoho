import type {GenerationDefinition} from "./definition";
import {contentHash} from "../hash";
import type {AdapterNode,BodyHashCodec,DefinitionContract,DefinitionMetadata,DependencyInputMap,NativeDefinition} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2017-modern.json";

/** Hand-fixed after both official question images and the 2017 answer tables
 * were read. No runtime import of the shared registry (and no hidden fallback).
 * The caller must supply the final, normalized canonical definitions. */
export const legacy2017CanonicalBindings=[
 {source:"2017h29h-fe-am-17",canonicalSource:"sample-2022-dec-a-15",sourceAnswer:"エ",version:"3.2.0",reference:[1],fields:[{name:"連続送信時間のT倍",minimum:1,maximum:3}]},
 {source:"2017h29h-fe-am-44",canonicalSource:"sample-2022-dec-a-37",sourceAnswer:"エ",version:"3.2.0",reference:[3],fields:[{name:"問う条件",minimum:0,maximum:3}]},
 {source:"2017h29h-fe-am-52",canonicalSource:"sample-2022-dec-a-43",sourceAnswer:"ウ",version:"3.2.0",reference:[2],fields:[{name:"問う対象",minimum:0,maximum:3}]},
 {source:"2017h29h-fe-am-67",canonicalSource:"sample-2022-dec-a-52",sourceAnswer:"ア",version:"3.2.0",reference:[0],fields:[{name:"問う対象",minimum:0,maximum:3}]},
 {source:"2017h29a-fe-am-48",canonicalSource:"sample-2022-dec-a-39",sourceAnswer:"イ",version:"3.2.0",reference:[0],fields:[{name:"着目する条件・記述",minimum:0,maximum:2}]},
 {source:"2017h29h-fe-am-56",canonicalSource:"2024-a-14",sourceAnswer:"ウ",version:"3.5.0",reference:[0,0,1,0],fields:[{name:"情報共有の時期",minimum:0,maximum:1},{name:"運用テストへの開発支援",minimum:0,maximum:1},{name:"運用要件への参加",minimum:0,maximum:1},{name:"運用テストと引渡しの共同確認",minimum:0,maximum:1}]},
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
type ReviewRow={canonical:{metadata:DefinitionMetadata;metadataSha256:string};adapter:{metadata:DefinitionMetadata;metadataSha256:string};codec:BodyHashCodec;outputs:{values:number[];sha256:string}[];rejections:{values:number[];error:{name:string;message:string;code?:string}}[];dependencyInputs:DependencyInputMap[]};
function contract(row:ReviewRow,side:'canonical'|'adapter'):DefinitionContract{
 return{metadata:structuredClone(row[side].metadata),inputs:row.dependencyInputs.map(map=>{const body=row.outputs.find(o=>JSON.stringify(o.values)===JSON.stringify(map.values));if(body)return{values:[...map.values],expected:{kind:'body' as const,sha256:body.sha256,codec:row.codec}};const rejected=row.rejections.find(o=>JSON.stringify(o.values)===JSON.stringify(map.values));if(!rejected)throw Error('IDENTITY_CONTRACT_INPUT_REQUIRED');return{values:[...map.values],expected:{kind:'reject' as const,...rejected.error}};})};
}
function identityDefinition(row:ReviewRow,dependency:Pick<GenerationDefinition,'build'>):GenerationDefinition{
 const metadata=structuredClone(row.adapter.metadata);return{...metadata,build:values=>{if(values.length!==metadata.fields.length||values.some((v,i)=>!Number.isInteger(v)||v<metadata.fields[i].minimum||v>metadata.fields[i].maximum))throw Error('PARAMETER_CONSTRAINT');return dependency.build(values);}};
}

const rows=reviewed.rows as unknown as ReviewRow[];
function canonicalFrom(pool:readonly GenerationDefinition[],row:ReviewRow,explicit=false):GenerationDefinition{
 const source=row.adapter.metadata.source,expected=row.canonical.metadata.source;
 if(!Array.isArray(pool))throw Error(explicit?'LEGACY_2017_CANONICAL_POOL_REQUIRED':`LEGACY_CANONICAL_REVIEW_REQUIRED: ${source}`);
 const found=pool.filter(d=>Object.getOwnPropertyDescriptor(d,'source')?.value===expected);
 if(found.length!==1)throw Error(explicit?`LEGACY_2017_CANONICAL_${found.length?'DUPLICATE':'MISSING'}: ${source}`:`LEGACY_CANONICAL_REVIEW_REQUIRED: ${source}`);
 if(!sameData(found[0],row.canonical.metadata,true))throw Error(explicit?`LEGACY_2017_CANONICAL_METADATA_REVIEW_REQUIRED: ${source}`:`LEGACY_CANONICAL_REVIEW_REQUIRED: ${source}`);return found[0];
}
export function makeLegacy2017CanonicalDefinitions(definitions:readonly GenerationDefinition[]):GenerationDefinition[]{return rows.map(row=>identityDefinition(row,canonicalFrom(definitions,row)));}
/** Every successful or rejected input reads its explicitly reviewed canonical
 * once. There is no local AM56 exactly-one shortcut or error reclassification. */
export async function makeLegacy2017CanonicalCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 const native:NativeDefinition[]=[],adapters:AdapterNode[]=[];
 for(const row of rows){const canonical=canonicalFrom(pool,row,true);for(const side of['canonical','adapter']as const)if(await contentHash(row[side].metadata)!==row[side].metadataSha256)throw Error('LEGACY_2017_IDENTITY_CONTRACT_REVIEW_REQUIRED');
  native.push({definition:canonical,contract:contract(row,'canonical')});adapters.push({source:row.adapter.metadata.source,dependencies:[row.canonical.metadata.source],dependencyInputs:structuredClone(row.dependencyInputs),contract:contract(row,'adapter'),create:deps=>identityDefinition(row,deps.get(row.canonical.metadata.source))});
 }return{native,adapters};
}
