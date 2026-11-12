import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, variableNotes, type GeneratedBody } from './definition';
import { autumn2015PmAnswers, autumn2015PmCase, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';

export const collection='2009h21h-fe-pm';
export const officialKeys={5:'ウイアエウイ',6:'ウイエウイエ',7:'オアアウウオ',8:'イウイイアオ'} as const;
export type Major=keyof typeof officialKeys;
export type Banks=readonly (readonly (string|Block)[])[];
type BankMarker={bank:number;heading:string};
export type Page=readonly [number,readonly (Block|BankMarker)[]];

export const bankAt=(bank:number,heading:string):BankMarker=>({bank,heading});
export const caseIndex=(values:number[])=>autumn2015PmCase(values,3);
export function answers(banks:Banks, groups:readonly number[], positions:readonly number[], labels:readonly string[]=['a','b','c','d','e','f']) {
  const contents=banks.map(bank=>bank.map(option=>[typeof option==='string'?p(option):option]));
  return autumn2015PmAnswers(contents,groups.map((bank,i)=>autumn2015PmSingle(labels[i]==='設問2'?'2':labels[i],labels[i],bank,positions[i])));
}
export function prompt(pages:readonly Page[]):Block[] {
  return pages.flatMap(([,entries])=>entries.filter((entry):entry is Block=>!('bank' in entry)));
}
function text(block:Block):string {
  switch(block.type) {
    case 'paragraph':case 'code':return block.text;
    case 'table':return block.caption+'。'+block.columns.join('，')+'。'+block.rows.map(row=>row.join('，')).join('。');
    case 'list':return block.items.join('。');
    case 'diagram':return block.caption+'。'+block.alt;
    default:throw Error('SOURCE_FORMAT');
  }
}
export function sourceAlt(pages:readonly Page[],banks:Banks) {
  return Object.fromEntries(pages.map(([number,entries])=>[number,entries.map(entry=>
    'bank' in entry?entry.heading+'。'+banks[entry.bank].map((option,i)=>'アイウエオカキク'[i]+'　'+(typeof option==='string'?option:text(option))).join('。'):
      text(entry)).join('\n')]));
}
export function common(major:Major,title:string,condition:string,notes:string,publicNotes:string,build:(values:number[])=>GeneratedBody):AfternoonBookletDefinition {
  return {source:collection+'-'+major,title,sourceAnswer:Array.from(officialKeys[major]).join('／'),reference:[0],
    version:'3.7.0',fields:[field(condition,0,3)],notes:variableNotes+' '+notes,publicNotes,build};
}
export const pseudocodePages=[3,4] as const;
export const pseudoAssets=pseudocodePages.map(page=>'asset-ipa-'+collection+'-p'+String(page).padStart(3,'0'));
export function pseudoReference():NonNullable<GeneratedBody['contexts']>[number] {
  const title='共通に使用される擬似言語の記述形式';
  return {title,presentation:'text_figure',blocks:pseudocodePages.map((page,i)=>({type:'image',assetId:pseudoAssets[i],
    caption:title+'（印刷p.'+page+'／PDF p.'+page+'）'}))};
}
