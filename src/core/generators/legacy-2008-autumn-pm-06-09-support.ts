import type {Block} from '../types';
import type {AfternoonBookletDefinition} from './afternoon-booklet-extension-contract';
import {field,variableNotes,type GeneratedBody} from './definition';
import {answerBody,blockText,selectCase,type AnswerBank} from './legacy-2016-autumn-pm-09-13-support';

const kana='アイウエオカキク';
export type Bank={labels:string[];slots:string;options:string[];keys:string;language?:string;heading:string};
export type Page={number:number;blocks:Block[];banks?:Bank[];sourceOnlyBefore?:string};
export type CaseDraft={pages:Page[];explanation:string;contexts?:GeneratedBody['contexts']};
export function bank(slots:string,options:string[],keys:string,language?:string,section?:number,heading='解答群'):Bank {
  return {slots,options,keys,language,heading,labels:[...slots].map(slot=>slot==='2'?'設問2':section?'設問'+section+' '+slot:slot)};
}
export function body({pages,explanation,contexts}:CaseDraft) {
  const banks=pages.flatMap(page=>page.banks??[]);
  return answerBody(pages.flatMap(page=>page.blocks),banks.map(({slots,labels,options,keys,language})=>{
    const positions=[...keys].map(key=>kana.indexOf(key));
    if(positions.length!==slots.length||new Set(options).size!==options.length||positions.some(index=>index<0||index>=options.length))
      throw Error('ANSWER_CHOICES');
    return {names:[...slots],labels,options,keys:positions,language} satisfies AnswerBank;
  }),explanation,contexts);
}
export function sourceAlt({pages}:CaseDraft):Record<number,string> {
  return Object.fromEntries(pages.map(({number,blocks,banks=[],sourceOnlyBefore})=>[number,[
    ...(sourceOnlyBefore?[sourceOnlyBefore]:[]),
    ...blocks.map(blockText),
    ...banks.map(({heading,options})=>[heading,...options.map((text,i)=>kana[i]+'　'+text)].join('\n')),
  ].join('\n\n')]));
}
export function createDefinition(number:number,title:string,input:string,sourceAnswer:string,review:string,draft:(index:number)=>CaseDraft,
  fixedReferenceAssetIds?:string[]) {
  const definition:AfternoonBookletDefinition={
    source:'2008h20a-fe-pm-'+number,title,sourceAnswer,reference:[0],version:'3.7.0',
    fields:[field(input,0,3)],notes:variableNotes+' '+review,publicNotes:review,
    build:values=>body(draft(selectCase(values,4))),
    ...(fixedReferenceAssetIds?{fixedReferenceAssetIds}:{}),
  };
  return {definition,original:()=>body(draft(0)),originalPageAlt:()=>sourceAlt(draft(0))};
}
export const selectionInstruction='次の問6から問9までの4問については，この中から1問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。';
