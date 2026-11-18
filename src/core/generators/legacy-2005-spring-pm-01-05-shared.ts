import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, variableNotes, type GeneratedBody } from './definition';
import { autumn2015PmAnswers as answers, autumn2015PmBank as bank,
  autumn2015PmCase as selectCase, autumn2015PmSingle as single } from './legacy-2015-autumn-pm-01-04-shared';

export { answers, bank, selectCase, single };
export const marks = 'アイウエオカキクケコ';
export const caseCount = 4;
export const asCode = (values: readonly string[], language = 'pseudocode') => values.map(value=>[code(value,language)]);

export function define(number: number, title: string, sourceAnswer: string, fieldName: string,
  modifications: string, review: string, build: (index: number) => GeneratedBody,
  policy: Pick<AfternoonBookletDefinition, 'answerVariation'|'fixedReferenceAssetIds'> = {}): AfternoonBookletDefinition {
  return {
    source: '2005h17h-fe-pm-'+number, title, sourceAnswer, version: '3.7.0',
    fields: [field(fieldName,0,caseCount-1)], reference: [0], publicNotes: modifications, notes: variableNotes+' '+review,
    build(values){return build(selectCase(values,caseCount-1));}, ...policy,
  };
}

export function originalAlt(blocks: readonly Block[][], first: number): Record<number,string> {
  return Object.fromEntries(blocks.map((page,index)=>[first+index,page.map(block=>{
    if(block.type==='paragraph'||block.type==='heading'||block.type==='code')return block.text;
    if(block.type==='formula')return block.alt;
    if(block.type==='diagram')return block.caption+'\n'+block.alt;
    if(block.type==='table')return block.caption+'\n'+[block.columns,...block.rows].map(row=>row.join('｜')).join('\n');
    throw Error('ORIGINAL_PAGE_ALT');
  }).join('\n')]));
}
export function bankBlocks(label: string, options: readonly Block[][]): Block[] {
  return [p(label), ...options.flatMap((value,index)=>[p(marks[index]),...value])];
}
export const equation = (text:string,alt:string):Block=>({type:'formula',format:'latex',text,alt});
