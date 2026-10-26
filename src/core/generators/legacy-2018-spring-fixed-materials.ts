/** Browser-pure fixed appendix identities for this booklet only. This records
 * content structure, not material permission, files, metadata or admission. */
import type {GeneratedBody} from './definition';
export type Spring2018FixedMaterialMajor=8|10|13;
export type Spring2018FixedMaterialGroup={id:string;title:string;pages:number[]};
const groups:Record<Spring2018FixedMaterialMajor,Spring2018FixedMaterialGroup[]>={
 8:[{id:'common',title:'疑似言語の共通仕様',pages:[4,5]}],
 10:[{id:'erratum',title:'公式正誤表（問10）',pages:[2]}],
 13:[{id:'spreadsheet',title:'表計算の仕様',pages:[80,81,82,83,84,85]},{id:'common',title:'疑似言語の共通仕様',pages:[4,5]}],
};
export function spring2018FixedMaterialGroups(number:Spring2018FixedMaterialMajor){return structuredClone(groups[number]);}
export const spring2018FixedMaterialAssetId=(number:Spring2018FixedMaterialMajor,page:number)=>`asset-ipa-2018h30h-fe-pm-${number}-p${page}`;
export const spring2018FixedMaterialContextId=(number:Spring2018FixedMaterialMajor,id:string)=>`context-2018h30h-fe-pm-${number}-${id}`;
export const spring2018FixedMaterialCaption=(page:number)=>`平成30年度春期 付属資料 物理p.${page}`;
export function spring2018FixedMaterialContexts(number:Spring2018FixedMaterialMajor):NonNullable<GeneratedBody['contexts']>{return groups[number].map(group=>({title:group.title,presentation:'text_figure',blocks:group.pages.map(page=>({type:'image',assetId:spring2018FixedMaterialAssetId(number,page),caption:spring2018FixedMaterialCaption(page)}))}));}
export function spring2018FixedMaterialContextIds(number:Spring2018FixedMaterialMajor){return groups[number].map(g=>spring2018FixedMaterialContextId(number,g.id));}
