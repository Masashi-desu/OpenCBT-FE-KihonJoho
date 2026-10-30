import type{GenerationDefinition,GeneratedBody}from'./definition';
/** Fixed common specifications, not images of a generated question. Root registration is pending. */
export function autumnRequiredContexts(source:string):NonNullable<GeneratedBody['contexts']>{
 const n=Number(source.split('-').at(-1)),pages=n===2||n===8?[3,4]:n===13?[3,4,85,86,87,88,89,90]:[];
 return pages.length?[{title:n===13?'共通疑似言語・表計算の記述形式（原p3/4・85〜90）':'共通に使用される疑似言語の記述形式（原p3/4）',presentation:'text_figure',blocks:pages.map(page=>({type:'image',assetId:`asset-ipa-2019r01a-fe-pm-p${page}`,caption:`原資料 p${page}`}))}]:[];
}
export function withAutumnRequiredMaterials(d:GenerationDefinition):GenerationDefinition{return{...d,build(values){const b=d.build(values),common=autumnRequiredContexts(d.source);return{...b,...(common.length||b.contexts?{contexts:[...common,...(b.contexts??[])]}:{})};}};}
