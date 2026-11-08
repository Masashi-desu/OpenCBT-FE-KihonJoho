import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, variableNotes, type GeneratedBody } from './definition';
import { autumn2015PmAnswers as answers, autumn2015PmBank as bank, autumn2015PmCase as selectCase,
  autumn2015PmSingle as single } from './legacy-2015-autumn-pm-01-04-shared';
export { answers, bank, single };
export const marks='アイウエオカキクケコ';
export const unordered=(ids:string[],labels:string[],bank:number,correct:number[])=>({ids,labels,bank,correct});
export function define(number:number,title:string,sourceAnswer:string,input:string,count:number,publicNotes:string,
  review:string,build:(index:number)=>GeneratedBody):AfternoonBookletDefinition{
  return {source:'2014h26h-fe-pm-'+number,title,sourceAnswer,version:'3.2.0',fields:[field(input,0,count-1)],reference:[0],
    publicNotes,notes:variableNotes+' '+review,build(values){return build(selectCase(values,count-1));}};
}
export function originalPageAlt(pages:Block[][],first:number) {
  return Object.fromEntries(pages.map((blocks,i)=>[first+i,blocks.map(b=>{
    if(b.type==='paragraph'||b.type==='code'||b.type==='heading')return b.text;
    if(b.type==='formula')return b.alt;
    if(b.type==='diagram')return b.caption+'\n'+b.alt;
    if(b.type==='table')return b.caption+'\n'+[b.columns,...b.rows].map(row=>row.join('／')).join('\n');
    throw Error('ORIGINAL_PAGE_ALT');
  }).join('\n')]));
}
export function markedBank(label:string, choices:readonly string[]) {
  return [p(label),...choices.map((choice,i)=>p(marks[i]+'　'+choice))];
}
