import type { GenerationDefinition } from "./definition";
import {contentHash} from "../hash";
import type {AdapterNode,BodyHashCodec,DefinitionContract,DefinitionMetadata,DependencyInputMap,NativeDefinition} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2019-december.json";

export type Legacy2019CanonicalBinding = {
  source: string;
  canonicalSource: string;
  sourceAnswer: string;
  reference: number[];
  domain: [number, number][];
  fields: GenerationDefinition["fields"];
  version: "3.2.0";
  answerVariation: "fixed" | "variable";
};
/** Manually frozen against the final 2022 contract after source-image review.
 * These names are part of the contract, not read from a moving canonical. */
const fieldNames: Record<number,string[]> = {
  3:["Qの極性","Rの極性"],10:["外部の発生原因"],12:["アクセス時間の条件"],14:["クライアント台数","プリンタ台数"],
  16:["着目する条件・記述"],24:["抽出の方向","数量の加算"],28:["問う条件"],29:["PCポート番号の差","HTTPポート"],32:["着目する条件・記述"],
  44:["Aの日数","Eの日数"],45:["問う対象"],46:["問う条件"],47:["着目する条件・記述"],50:["利益構成","金額倍率"],54:["問う対象"],56:["消費者が発信する内容"],
  2:["出力桁数"],6:["変換","元の模様"],7:["数字列"],8:["引数n"],15:["連続送信時間のT倍"],19:["着目する条件・記述"],22:["多重度の条件"],35:["着目する条件・記述"],37:["問う条件"],39:["着目する条件・記述"],43:["問う対象"],57:["原料量の倍率","原料Aの追加6単位"],59:["基準売上高の100百万円単位","目標利益の6百万円単位"],
};
const link = (period: "spring" | "autumn", number: number, canonical: number, answer: string,
  reference: number[], domain: [number, number][]): Legacy2019CanonicalBinding => ({
    source: `${period === "spring" ? "2019h31h" : "2019r01a"}-fe-am-${number}`,
    canonicalSource: `sample-2022-dec-a-${canonical}`, sourceAnswer: answer, reference, domain,
    fields: domain.map(([minimum,maximum],i)=>({name:fieldNames[canonical][i],minimum,maximum})),version:"3.2.0",answerVariation:[2,16].includes(canonical)?"fixed":"variable",
  });

/** Only 29 image-compared, substantively identical source questions are linked.
 * Similar subjects with different source trees/choices (spring Q5/Q67) are not
 * aliases. These candidates are unregistered until the annual import is ready.
 */
export const legacy2019CanonicalBindings: Legacy2019CanonicalBinding[] = [
  link("spring", 3, 3, "エ", [0,0], [[0,1],[0,1]]),
  link("spring", 9, 10, "ウ", [0], [[0,2]]),
  link("spring", 10, 12, "イ", [0], [[0,3]]),
  link("spring", 14, 14, "エ", [3,2], [[2,4],[2,3]]),
  link("spring", 19, 16, "ア", [0], [[0,2]]),
  link("spring", 28, 24, "イ", [0,0], [[0,1],[0,2]]),
  link("spring", 33, 28, "エ", [3], [[0,3]]),
  link("spring", 34, 29, "ア", [0,0], [[0,5],[0,2]]),
  link("spring", 38, 32, "ア", [0], [[0,2]]),
  link("spring", 53, 44, "エ", [2,2], [[1,3],[1,3]]),
  link("spring", 55, 45, "イ", [1], [[0,3]]),
  link("spring", 57, 46, "エ", [3], [[0,3]]),
  link("spring", 59, 47, "エ", [0], [[0,2]]),
  link("spring", 65, 50, "ア", [0,1], [[0,3],[1,2]]),
  link("spring", 71, 54, "エ", [3], [[0,3]]),
  link("spring", 72, 56, "エ", [0], [[0,2]]),
  link("autumn", 1, 2, "エ", [8], [[5,8]]),
  link("autumn", 9, 6, "エ", [3,0], [[0,3],[0,2]]),
  link("autumn", 10, 7, "イ", [0], [[0,5]]),
  link("autumn", 11, 8, "ウ", [5], [[3,8]]),
  link("autumn", 17, 15, "エ", [1], [[1,3]]),
  link("autumn", 20, 19, "エ", [0], [[0,2]]),
  link("autumn", 25, 22, "イ", [0], [[0,3]]),
  link("autumn", 36, 35, "イ", [0], [[0,2]]),
  link("autumn", 44, 37, "エ", [3], [[0,3]]),
  link("autumn", 46, 39, "イ", [0], [[0,2]]),
  link("autumn", 53, 43, "ウ", [2], [[0,3]]),
  link("autumn", 76, 57, "ウ", [1,0], [[1,3],[0,2]]),
  link("autumn", 78, 59, "イ", [1,3], [[1,2],[1,6]]),
];

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
function identityDefinition(metadata:DefinitionMetadata,dependency:Pick<GenerationDefinition,'build'>):GenerationDefinition{const m=structuredClone(metadata);return{...m,build:values=>{if(values.length!==m.fields.length||values.some((v,i)=>!Number.isInteger(v)||v<m.fields[i].minimum||v>m.fields[i].maximum))throw Error('PARAMETER_CONSTRAINT');return dependency.build(values);}};}

/** The caller supplies canonical definitions so an annual package cannot hide
 * another registry or silently fall back to a different generator version.
 * Canonical family IDs are also exposed for the parent's mix deduplication.
 */
export function makeLegacy2019CanonicalDefinitions(canonicalDefinitions: readonly GenerationDefinition[]): GenerationDefinition[] {
  return legacy2019CanonicalBindings.map(binding => {
    const canonical = canonicalDefinitions.find(d => d.source === binding.canonicalSource);
    if (!canonical || JSON.stringify(canonical.reference) !== JSON.stringify(binding.reference) ||
      JSON.stringify(canonical.fields) !== JSON.stringify(binding.fields) ||
      canonical.sourceAnswer !== binding.sourceAnswer || (canonical.version??"3.2.0")!==binding.version ||
      (canonical.answerVariation??"variable")!==binding.answerVariation)
      throw new Error(`LEGACY_CANONICAL_REVIEW_REQUIRED: ${binding.source}`);
    const{build:_,...metadata}={ ...canonical, source: binding.source,version:binding.version, reference: [...binding.reference], fields: binding.fields.map(f => ({ ...f })),
      notes: `${canonical.notes} 2019年度の独立した原問題${binding.source}に対応する。原画像の本文・全選択肢・注記・図表の実質同一性を照合済み。管理済み生成器の再利用元（canonical source）は${binding.canonicalSource}であり、fieldsの名前/範囲・reference・正答固定宣言・生成器版を年度別契約で固定する。全151有効出力の内容hashと独立意味検証を別途固定し、将来の本体変更は年度別再査読を必要とする。原問題の年度別出典・権利・公式正答参照を維持する。`,};
    return identityDefinition(metadata,canonical);
  });
}

/** Explicit effective metadata and159 mapped outcomes only. Binding validation
 * domain/variable facts never become own definition metadata. No raw fallback. */
export async function makeLegacy2019CanonicalCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 if(!Array.isArray(pool))throw Error('LEGACY_2019_CANONICAL_POOL_REQUIRED');
 const native:NativeDefinition[]=[],adapters:AdapterNode[]=[];
 for(const row of reviewed.rows as unknown as ReviewRow[]){
  const source=row.canonical.metadata.source,found=pool.filter(d=>Object.getOwnPropertyDescriptor(d,'source')?.value===source);
  if(found.length!==1)throw Error(`LEGACY_2019_CANONICAL_${found.length?'DUPLICATE':'MISSING'}: ${source}`);
  const canonical=found[0];if(!sameData(canonical,row.canonical.metadata,true))throw Error(`LEGACY_2019_CANONICAL_REVIEW_REQUIRED: ${source}`);
  for(const side of['canonical','adapter']as const)if(await contentHash(row[side].metadata)!==row[side].metadataSha256)throw Error('LEGACY_2019_CANONICAL_CONTRACT_REVIEW_REQUIRED');
  native.push({definition:canonical,contract:contract(row,'canonical')});
  adapters.push({source:row.adapter.metadata.source,dependencies:[source],dependencyInputs:structuredClone(row.dependencyInputs),contract:contract(row,'adapter'),create:deps=>identityDefinition(row.adapter.metadata,deps.get(source))});
 }return{native,adapters};
}
