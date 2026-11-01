import { figure, p, table, type GeneratedBody } from './definition';
import type { Question } from '../types';
import { legacy2017AutumnAmCommonAlt, legacy2017AutumnAmCommonHeading, legacy2017AutumnAmCommonPremise } from './legacy-2017-autumn-am-common';

// The reviewed2016 p3 has the same nine logic-symbol rows and inversion
// note as the existing managed symbol renderer. Source identity and page
// numbering remain2016, independently of the reused React drawing code.
export const spring2016CommonProfile='legacy-2016-spring-am-common-gates';
export const spring2016CommonAlt=()=>legacy2017AutumnAmCommonAlt().replace(legacy2017AutumnAmCommonHeading+'。'+legacy2017AutumnAmCommonPremise,'2. 論理回路。');
export const spring2016CommonPremise = '各問題文中に注記がない限り，次の表記ルールが適用されているものとする。';
export const spring2016StandardRows = [
  ['JIS Q 9001','JIS Q 9001:2008'], ['JIS Q 14001','JIS Q 14001:2004'],
  ['JIS Q 15001','JIS Q 15001:2006'], ['JIS Q 20000-1','JIS Q 20000-1:2012'],
  ['JIS Q 20000-2','JIS Q 20000-2:2013'], ['JIS Q 27000','JIS Q 27000:2014'],
  ['JIS Q 27001','JIS Q 27001:2014'], ['JIS Q 27002','JIS Q 27002:2014'],
  ['JIS X 0160','JIS X 0160:2012'], ['ISO 21500','ISO 21500:2012'],
  ['ITIL','ITIL 2011 edition'], ['PMBOK','PMBOKガイド 第5版'], ['共通フレーム','共通フレーム2013'],
];
export function spring2016CommonContexts(): NonNullable<GeneratedBody['contexts']> {
  return [
    {title:'問題文中で共通に使用される表記ルール（p.2）',blocks:[p(spring2016CommonPremise),p('1. 規格・標準'),table('規格・標準',['試験問題での表記','規格・標準の名称'],structuredClone(spring2016StandardRows))]},
    {title:'問題文中で共通に使用される表記ルール（p.3）',presentation:'text_figure',blocks:[figure(spring2016CommonProfile,[0],'図記号と説明',spring2016CommonAlt())]},
  ];
}

/** Recognize only the two reviewed common appendices of this booklet. A
 * question-specific passage must retain its original place before the prompt. */
export function isSpring2016CommonContext(question:Question,context:Question['contexts'][number]):boolean{
  if(!question.origin.sourceRefs.some(r=>r.sourceId==='source-ipa-2016h28h-fe-am-qs' &&
    r.locator.year===2016 && r.locator.period==='春期' && r.locator.timeSlot==='午前' && r.locator.questionNumber))return false;
  const page=context.title==='問題文中で共通に使用される表記ルール（p.2）'?2:context.title==='問題文中で共通に使用される表記ルール（p.3）'?3:undefined;
  if(!page)return false;
  const blocks=context.content.blocks;
  if(question.origin.kind==='official_reprint')return context.id===`context-2016h28h-fe-am-common-${page}` &&
    blocks.length===1 && blocks[0].type==='image' && blocks[0].assetId===`asset-ipa-2016h28h-fe-am-common-${page}` &&
    context.content.attribution.sourceRefs.some(r=>r.sourceId==='source-ipa-2016h28h-fe-am-qs'&&r.locator.page===page&&!r.locator.questionNumber);
  if(page===3)return blocks.length===1 && blocks[0].type==='diagram' && blocks[0].scene.kind==='source_figure' &&
    blocks[0].scene.profile===spring2016CommonProfile && blocks[0].scene.values.length===1 && blocks[0].scene.values[0]===0;
  return blocks.length===3 && blocks[0].type==='paragraph' && blocks[0].text===spring2016CommonPremise &&
    blocks[2].type==='table' && JSON.stringify(blocks[2].rows)===JSON.stringify(spring2016StandardRows);
}
