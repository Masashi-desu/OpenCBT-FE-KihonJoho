import type { Question } from '../types';
import { figure, p, table, type GeneratedBody } from './definition';
import {
  legacy2017AutumnAmCommonAlt,
  legacy2017AutumnAmCommonHeading,
  legacy2017AutumnAmCommonPremise,
} from './legacy-2017-autumn-am-common';

// Independently checked against2016 autumn QS p2–3. Unlike2016 spring,
// autumn p3 also contains the six-row circuit-symbol table.
export const autumn2016CommonProfile = 'legacy-2016-autumn-am-common-symbols';
export const autumn2016CommonPremise = '各問題文中に注記がない限り，次の表記ルールが適用されているものとする。';
export const autumn2016StandardRows = [
  ['JIS Q 9001','JIS Q 9001:2015'], ['JIS Q 14001','JIS Q 14001:2015'],
  ['JIS Q 15001','JIS Q 15001:2006'], ['JIS Q 20000-1','JIS Q 20000-1:2012'],
  ['JIS Q 20000-2','JIS Q 20000-2:2013'], ['JIS Q 27000','JIS Q 27000:2014'],
  ['JIS Q 27001','JIS Q 27001:2014'], ['JIS Q 27002','JIS Q 27002:2014'],
  ['JIS X 0160','JIS X 0160:2012'], ['ISO 21500','ISO 21500:2012'],
  ['ITIL','ITIL 2011 edition'], ['PMBOK','PMBOKガイド 第5版'], ['共通フレーム','共通フレーム2013'],
];
export const autumn2016CircuitRows = [
  {id:'resistor',label:'抵抗（R）'},
  {id:'capacitor',label:'コンデンサ（C）'},
  {id:'diode',label:'ダイオード（D）'},
  {id:'transistor',label:'トランジスタ（Tr）'},
  {id:'ground',label:'接地'},
  {id:'amplifier',label:'演算増幅器'},
] as const;
export function autumn2016CommonAlt():string{
  return legacy2017AutumnAmCommonAlt().replace(
    legacy2017AutumnAmCommonHeading+'。'+legacy2017AutumnAmCommonPremise,'2. 論理回路。')+
    ' 3. 回路記号。表は図記号と説明の2列、次の6行。'+
    '1行目、抵抗（R）は左右の導線の間のジグザグ線。'+
    '2行目、コンデンサ（C）は左右の導線の間の平行な2本の縦線。'+
    '3行目、ダイオード（D）は右向きの三角形とその右端の縦線。'+
    '4行目、トランジスタ（Tr）は2種類を並べ、いずれもベースの縦線から右上・右下へ枝を伸ばす。左の図は右下の枝の矢印が外向き、右の図は右上の枝の矢印が内向き。'+
    '5行目、接地は縦の導線の下端の横線とそこから左下へ伸びる3本の斜線。'+
    '6行目、演算増幅器は右向きの三角形。左上の入力は＋、左下の入力は−、右端が出力。';
}
export function autumn2016CommonContexts():NonNullable<GeneratedBody['contexts']>{
  return [
    {title:'問題文中で共通に使用される表記ルール（p.2）',blocks:[p(autumn2016CommonPremise),p('1. 規格・標準'),table('規格・標準',['試験問題での表記','規格・標準の名称'],structuredClone(autumn2016StandardRows))]},
    {title:'問題文中で共通に使用される表記ルール（p.3）',presentation:'text_figure',blocks:[figure(autumn2016CommonProfile,[0],'図記号と説明',autumn2016CommonAlt())]},
  ];
}
export function isAutumn2016CommonContext(question:Question,context:Question['contexts'][number]):boolean{
  if(!question.origin.sourceRefs.some(r=>r.sourceId==='source-ipa-2016h28a-fe-am-qs'&&
    r.locator.year===2016&&r.locator.period==='秋期'&&r.locator.timeSlot==='午前'&&r.locator.questionNumber))return false;
  const page=context.title==='問題文中で共通に使用される表記ルール（p.2）'?2:context.title==='問題文中で共通に使用される表記ルール（p.3）'?3:undefined;
  if(!page)return false;
  const blocks=context.content.blocks;
  if(question.origin.kind==='official_reprint')return context.id===`context-2016h28a-fe-am-common-${page}`&&
    blocks.length===1&&blocks[0].type==='image'&&blocks[0].assetId===`asset-ipa-2016h28a-fe-am-common-${page}`&&
    context.content.attribution.sourceRefs.some(r=>r.sourceId==='source-ipa-2016h28a-fe-am-qs'&&r.locator.page===page&&!r.locator.questionNumber);
  if(page===3)return blocks.length===1&&blocks[0].type==='diagram'&&blocks[0].scene.kind==='source_figure'&&
    blocks[0].scene.profile===autumn2016CommonProfile&&blocks[0].scene.values.length===1&&blocks[0].scene.values[0]===0;
  return blocks.length===3&&blocks[0].type==='paragraph'&&blocks[0].text===autumn2016CommonPremise&&
    blocks[1].type==='paragraph'&&blocks[1].text==='1. 規格・標準'&&blocks[2].type==='table'&&
    JSON.stringify(blocks[2].columns)===JSON.stringify(['試験問題での表記','規格・標準の名称'])&&
    JSON.stringify(blocks[2].rows)===JSON.stringify(autumn2016StandardRows);
}
