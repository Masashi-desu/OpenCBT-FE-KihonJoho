import type {GenerationDefinition} from "./definition";
import {contentHash} from "../hash";
import type {AdapterNode,BodyHashCodec,DefinitionContract,DefinitionMetadata,DependencyInputMap,NativeDefinition} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2018-autumn-usb.json";
/** Caller supplies the effective canonical pool; no source-year/raw registry
 * import or implicit fallback can hide a wrapper applied by final integration. */
export const legacy2018AutumnCanonicalContract={source:"2018h30a-fe-am-12",canonicalSource:"2017h29h-fe-am-10",title:"インタフェース規格の特徴",sourceAnswer:"エ",version:"3.2.0",reference:[3],fields:[{name:"問うインタフェース",minimum:0,maximum:3}],canonicalNotes:"原問題の問い方・正誤条件・解答対象・選択肢の役割と文章／表／図／空欄の形式を維持して抽象化し、対象・条件・値を対応する位置へバインドする。本文、図、選択肢、正答、独自解説を同じ入力から確定する。固定問題画像を生成問題へ流用しない。 全4原説明全文と名称→説明方向を維持し、実際のインタフェースを同じ位置へバインドする4入力。USBにもisochronousがあることだけで原ウをUSBの記述とせず、broadcastを含む全条件を査読する。5Gbit/sは転送モード値と明記し実効速度の保証へ置換しない。規格本文/符号表/図の転載はせず、IPA作問と一次資料での機能事実の検算を区別する。"} as const;
export const legacy2018AutumnCanonicalAliases=[{source:legacy2018AutumnCanonicalContract.source,canonicalSource:legacy2018AutumnCanonicalContract.canonicalSource,parameterMap:"identity" as const,comparison:"2018秋AM12原物理p7と2017春AM10原物理p7を両画像で比較。USB3.0という問いの方向、4対1G/serialATA/iso+broadcast/SuperSpeed5Gの全4説明、公式エが一致。空白・折返し・句読点の正規化と年度出典は区別。"}];

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

const row=reviewed.rows[0] as unknown as ReviewRow;
function canonicalFrom(pool:readonly GenerationDefinition[]):GenerationDefinition{
 if(!Array.isArray(pool))throw Error('LEGACY_2018_CANONICAL_POOL_REQUIRED');const found=pool.filter(d=>Object.getOwnPropertyDescriptor(d,'source')?.value===row.canonical.metadata.source);
 if(found.length!==1)throw Error('LEGACY_2018_USB_CANONICAL_REQUIRED');if(!sameData(found[0],row.canonical.metadata,true))throw Error('LEGACY_2018_USB_CANONICAL_REVIEW_REQUIRED');return found[0];
}
export function makeLegacy2018AutumnCanonicalDefinitions(pool:readonly GenerationDefinition[]):GenerationDefinition[]{return[identityDefinition(row,canonicalFrom(pool))];}
/** Preserve the old raw JSON.stringify SHA codec and all metadata omissions. */
export async function makeLegacy2018AutumnCanonicalCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 const canonical=canonicalFrom(pool);for(const side of['canonical','adapter']as const)if(await contentHash(row[side].metadata)!==row[side].metadataSha256)throw Error('LEGACY_2018_USB_CONTRACT_REVIEW_REQUIRED');
 return{native:[{definition:canonical,contract:contract(row,'canonical')}],adapters:[{source:row.adapter.metadata.source,dependencies:[row.canonical.metadata.source],dependencyInputs:structuredClone(row.dependencyInputs),contract:contract(row,'adapter'),create:deps=>identityDefinition(row,deps.get(row.canonical.metadata.source))}]};
}
