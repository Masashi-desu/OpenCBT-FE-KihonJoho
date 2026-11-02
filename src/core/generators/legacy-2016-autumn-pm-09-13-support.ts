/** Source-local presentation helpers for IPA H28 autumn afternoon Q9–13. */
import type { Block } from '../types';
import { DataError } from '../errors';
import { p, type GeneratedBody } from './definition';
import { autumn2016PmPageAssetId } from './legacy-2016-autumn-pm-materials';
export type Sheet = {caption?:string;header?:boolean;columns:string[];rows:string[][];widths?:number[];merges?:{row:number;col:number;rowSpan:number;colSpan:number}[]};
export type Panel = {kind:'piecewise';lhs:string;rows:[string,string][]} | {kind:'output';fields:string[];note:string} | {kind:'sheets';sheets:Sheet[]} | { kind:'code'; text:string; language:string;framed?:boolean } | {kind:'table';columns:string[];rows:string[][];note?:string;header?:boolean} | {kind:'record';rows:{label:string;cells:{text:string;width:number}[]}[];repeat?:string} | {kind:'list';generic:boolean;n:number};
export type SourcePage = { page:number; blocks:Block[]; banks?:string[] };
export function selectCase(values:readonly number[], count:number):number {
 const descriptor=Array.isArray(values)?Object.getOwnPropertyDescriptor(values,'0'):undefined;
 if(!Array.isArray(values)||values.length!==1||Reflect.ownKeys(values).length!==2||!descriptor||!('value'in descriptor)||!Number.isSafeInteger(descriptor.value)||values[0]<0||values[0]>=count)throw new DataError('PARAMETER_CONSTRAINT','問題条件の番号が範囲外です');return values[0];
}
export const sourcePageAsset=autumn2016PmPageAssetId;
export const sourceAttribution=(n:number)=>({origin:'adapted' as const,sourceRefs:[{sourceId:`source-ipa-2016h28a-fe-pm-${n}-qs`,locator:{section:'問題',year:2016,period:'秋期',timeSlot:'午後',subject:'旧制度・午後',questionNumber:String(n),exam:'基本情報技術者試験'}}],rightsRefs:[`rights-ipa-2016h28a-fe-pm-${n}`],creatorIds:['codex']});
export function sourceDiagram(n:number,suffix:string,index:number,caption:string,alt:string):Block{return{type:'diagram',id:`diagram-legacy-2016-autumn-pm-${n}-${suffix}`,rendererRef:{id:'renderer-source-figures',version:'1.0.0'},caption,alt,scene:{kind:'source_figure',profile:`legacy-2016-autumn-pm-${n}-${suffix}`,values:[index]},attribution:sourceAttribution(n)};}
export function panelAlt(panel:Panel):string{
 if(panel.kind==='piecewise')return panel.lhs+'＝'+panel.rows.map(([value,condition])=>value+'（'+condition+'）').join('，');
 if(panel.kind==='output')return panel.fields.join(' ')+'\n注記 '+panel.note;
 if(panel.kind==='sheets')return panel.sheets.map(sheet=>(sheet.caption??'')+'\n'+sheet.columns.join('｜')+'\n'+sheet.rows.map(row=>row.join('｜')).join('\n')).join('\n\n');
 if(panel.kind==='code')return panel.text;
 if(panel.kind==='table')return panel.columns.join('｜')+'\n'+panel.rows.map(row=>row.join('｜')).join('\n')+(panel.note?'\n注記 '+panel.note:'');
 if(panel.kind==='record')return panel.rows.map(row=>row.label+'：'+row.cells.map(cell=>cell.text+`（${cell.width}桁）`).join('｜')).join('\n')+(panel.repeat?'\n'+panel.repeat:'');
 return panel.generic?'ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。':`ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=${panel.n}。`;
}
export const heading=(text:string):Block=>({type:'heading',level:3,text});
export function fixedReferences(pages:readonly number[],excerpt73=false):{assets:string[];contexts:NonNullable<GeneratedBody['contexts']>}{
 const assets=pages.map(page=>sourcePageAsset(page,excerpt73&&page===73));return{assets,contexts:pages.map((page,i)=>({title:page===2?'IPA公式訂正（原問題と併せて参照）':`IPA公式付属資料（冊子物理${page}頁）${page===73&&excerpt73?'・CASL II説明の抜粋（文字コード表を除く）':''}`,presentation:'text_figure',blocks:[{type:'image',assetId:assets[i],caption:page===2?'平成28年度秋期 基本情報技術者試験 午後 正誤表':`平成28年度秋期 基本情報技術者試験 午後 付属資料${page===73&&excerpt73?'（上部抜粋）':''}`}]}))};
}
export type AnswerBank={names:string[];labels?:string[];options:string[];keys:number[];language?:string};
export function answerBody(prompt:Block[],banks:AnswerBank[],explanation:string,contexts?:GeneratedBody['contexts']):GeneratedBody{
 let offset=0;const choices:Block[][]=[],answerParts:NonNullable<GeneratedBody['answerParts']>=[],partAnswers:NonNullable<GeneratedBody['partAnswers']>=[];
 for(const bank of banks){const ids=bank.options.map((text,index)=>{choices.push([bank.language?{type:'code',language:bank.language,text}:p(text)]);return`choice-value-${offset+index+1}`;});bank.names.forEach((name,i)=>{answerParts.push({id:'part-'+name,label:bank.labels?.[i]??name,choiceIds:[...ids]});partAnswers.push({kind:'choice',partId:'part-'+name,choiceId:ids[bank.keys[i]]});});offset+=bank.options.length;}
 return{prompt,choices,answerParts,partAnswers,explanation,...(contexts?{contexts}: {})};
}
export function blockText(block:Block):string{
 switch(block.type){case'paragraph':case'heading':case'code':return block.text;case'list':return block.items.join('\n');case'table':return block.caption+'\n'+block.columns.join('｜')+'\n'+block.rows.map(r=>r.join('｜')).join('\n');case'diagram':return block.caption+'\n'+block.alt;case'image':return block.caption;default:return'';}
}
export function pageAlt(pages:SourcePage[]):Record<number,string>{return Object.fromEntries(pages.map(page=>[page.page,[...page.blocks.map(blockText),...(page.banks??[])].join('\n\n')]));}
export const choiceBankText=(label:string,options:string[])=>label+'に関する解答群\n'+options.map((option,i)=>'アイウエオカキクケコサシスセソタチツテト'[i]+' '+option).join('\n');
export const selectionInstruction='次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の○選をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。';
