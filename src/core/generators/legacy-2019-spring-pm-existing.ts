/** Formal booklet adapters. The nine private producers and canonical176 roots
 * remain unchanged. Source-position banks are separate from answer widgets. */
import{spring2019FormalSourceUnits,spring2019FinalizeSourceUnits,spring2019RestoreSourceChoice}from'./legacy-2019-spring-source-form';
import type{Block,PartAnswer}from'../types';
import{figure,p,type GeneratedBody,type GenerationDefinition}from'./definition';
import{legacy2019AfternoonAuthDefinitions}from'./legacy-2019-pm-auth';
import{legacy2019AfternoonMemoryDefinitions}from'./legacy-2019-pm-memory';
import{legacy2019AfternoonDatabaseDefinitions}from'./legacy-2019-pm-database';
import{legacy2019AfternoonLoadBalanceDefinitions}from'./legacy-2019-pm-load-balance';
import{legacy2019AfternoonInspectionDefinitions}from'./legacy-2019-pm-inspection';
import{legacy2019AfternoonChangeDefinitions}from'./legacy-2019-pm-change';
import{legacy2019AfternoonIntegrationDefinitions}from'./legacy-2019-pm-integration';
import{legacy2019AfternoonHuffmanDefinitions}from'./legacy-2019-pm-huffman';
import{legacy2019RankingDefinitions}from'./legacy-2019-pm-ranking';
type Layout={number:number;definition:GenerationDefinition;groups:number[][];after:number[][];captions:string[]};
export const spring2019ExistingLayouts:Layout[]=[
 {number:1,definition:legacy2019AfternoonAuthDefinitions[0],groups:[[0,1,2],[3],[4]],after:[[23,0],[26,1,2]],captions:['a〜cに関する解答群','dに関する解答群','eに関する解答群']},
 {number:2,definition:legacy2019AfternoonMemoryDefinitions[0],groups:[[0],[1],[2],[3,4]],after:[[10,0],[16,1,2],[21,3]],captions:['aに関する解答群','bに関する解答群','cに関する解答群','d，eに関する解答群']},
 {number:3,definition:legacy2019AfternoonDatabaseDefinitions[0],groups:[[0],[1],[2],[3,4],[5]],after:[[12,0,1,2],[14,3],[22,4]],captions:['aに関する解答群','bに関する解答群','cに関する解答群','d，eに関する解答群','fに関する解答群']},
 {number:4,definition:legacy2019AfternoonLoadBalanceDefinitions[0],groups:[[0],[1],[2],[3],[4]],after:[[22,0,1,2],[23,3],[31,4]],captions:['aに関する解答群','bに関する解答群','cに関する解答群','解答群','解答群']},
 {number:5,definition:legacy2019AfternoonInspectionDefinitions[0],groups:[[0],[1,2],[3],[4]],after:[[24,0,1],[27,2],[31,3]],captions:['aに関する解答群','b，cに関する解答群','dに関する解答群','eに関する解答群']},
 {number:6,definition:legacy2019AfternoonChangeDefinitions[0],groups:[[0],[1],[2],[3],[4],[5,6],[7]],after:[[12,0,1],[23,2,3,4,5,6]],captions:['aに関する解答群','bに関する解答群','cに関する解答群','dに関する解答群','eに関する解答群','f，gに関する解答群','hに関する解答群']},
 {number:7,definition:legacy2019AfternoonIntegrationDefinitions[0],groups:[[0],[1],[2,3],[4],[5],[6]],after:[[9,0,1,2],[13,3,4],[15,5]],captions:['aに関する解答群','bに関する解答群','c，dに関する解答群','eに関する解答群','fに関する解答群','gに関する解答群']},
 {number:8,definition:legacy2019AfternoonHuffmanDefinitions[0],groups:[[0],[1],[2,3],[4],[5]],after:[[15,0,1],[28,2],[33,3,4]],captions:['aに関する解答群','bに関する解答群','c，dに関する解答群','eに関する解答群','fに関する解答群']},
 {number:10,definition:legacy2019RankingDefinitions[0],groups:[[0],[1],[2,3],[4],[5]],after:[[18,0,1,2],[21,3,4]],captions:['aに関する解答群','bに関する解答群','c，dに関する解答群','eに関する解答群','fに関する解答群']},
];
const choice=(b:GeneratedBody,id:string)=>{const n=Number(id.replace('choice-value-',''));if(!Number.isInteger(n)||n<1||n>b.choices.length)throw Error('SOURCE_FORMAT');return b.choices[n-1];};
function compactBanks(body:GeneratedBody,l:Layout):GeneratedBody{
 const parts=body.answerParts!;if(!parts||!body.partAnswers)throw Error('SOURCE_FORMAT');
 const choices:Block[][]=[],maps=new Map<string,Map<string,string>>();
 for(const group of l.groups){const first=parts[group[0]];if(!first)throw Error('SOURCE_FORMAT');const ids=first.choiceIds.map(id=>{choices.push(structuredClone(choice(body,id)));return`choice-value-${choices.length}`;});
  for(const at of group){const part=parts[at];if(!part||part.choiceIds.length!==first.choiceIds.length)throw Error('SOURCE_BANK_SHARED');const map=new Map<string,string>();part.choiceIds.forEach((id,i)=>{if(JSON.stringify(choice(body,id))!==JSON.stringify(choice(body,first.choiceIds[i])))throw Error('SOURCE_BANK_SHARED');map.set(id,ids[i]);});maps.set(part.id,map);}
 }
 if(maps.size!==parts.length)throw Error('SOURCE_FORMAT');
 const remap=(part:string,id:string)=>{const v=maps.get(part)?.get(id);if(!v)throw Error('SOURCE_FORMAT');return v;};
 const answers:PartAnswer[]=body.partAnswers.map(a=>a.kind==='choice'?{...a,choiceId:remap(a.partId,a.choiceId)}:a.kind==='unordered'?{...a,partIds:[...a.partIds],choiceIds:a.choiceIds.map((id,i)=>remap(a.partIds[i],id))}:structuredClone(a));
 return{...body,choices,answerParts:parts.map(part=>({...part,choiceIds:part.choiceIds.map(id=>remap(part.id,id))})),partAnswers:answers};
}
/** Restore the question paper's Japanese comma in prose only. SQL/program
 * text, parameters, identifiers and independent explanation are not rewritten. */
const sourceTypography=(b:Block):Block=>b.type==='paragraph'?{...b,text:b.text.replaceAll('、','，')}:b.type==='list'?{...b,items:b.items.map(s=>s.replaceAll('、','，'))}:b.type==='table'?{...b,caption:b.caption.replaceAll('、','，'),columns:b.columns.map(s=>s.replaceAll('、','，')),rows:b.rows.map(r=>r.map(s=>s.replaceAll('、','，')))}:b;
function built(l:Layout,values:number[]):GeneratedBody{
 const compact=compactBanks(l.definition.build(values),l),body={...compact,choices:compact.choices.map(bs=>bs.map(b=>spring2019RestoreSourceChoice(l.number,sourceTypography(b))))},prompt:Block[]=[];
 if(l.number===1||l.number===8)prompt.push(p(`次の問${l.number}は必須問題です。必ず解答してください。`));
 else if(l.number===2)prompt.push(p('次の問2から問7までの6問については，この中から4問を選択し，選択した問題については，答案用紙の選択欄の選をマークして解答してください。なお，5問以上マークした場合には，はじめの4問について採点します。'));
 else prompt.push(p('選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。'));
 for(let i=0;i<body.prompt.length;i++){
  const b=body.prompt[i];
  if(b.type==='paragraph'&&(/原冊子では問[18]は必須問題/.test(b.text)||b.text.startsWith('原冊子の選択欄')||b.text.startsWith('原冊子の注意：')))continue;
  if(l.number===10&&i===0)continue;
  const clean=b.type==='paragraph'?{...b,text:b.text.replace(/^旧制度・午後 問([0-9]+)。/,'問$1 ')}:b;prompt.push(...spring2019FormalSourceUnits(l.number,i,clean,body.prompt).map(sourceTypography));
  const position=l.after.find(row=>row[0]===i);
  for(const group of position?.slice(1)??[]){const part=body.answerParts![l.groups[group][0]],entries=part.choiceIds.map((id,i)=>`「${'アイウエオカキクケコ'[i]}」${choice(body,id).map(b=>b.type==='paragraph'?b.text:b.type==='table'?b.rows.map(r=>r.join('、')).join('；'):'').join('。')}`).join('。');prompt.push(figure(`legacy-2019-spring-pm${l.number}-bank`,[...values,group],l.captions[group],`${l.captions[group]}。${entries}`));}
 }
 if(prompt.filter(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile===`legacy-2019-spring-pm${l.number}-bank`).length!==l.groups.length)throw Error('SOURCE_BANK_POSITION');
 const contexts=l.number===8?[{title:'共通に使用される擬似言語の記述形式（原p3〜4）',presentation:'text_figure' as const,blocks:[3,4].map(page=>({type:'image' as const,assetId:`asset-ipa-2019h31h-fe-pm-8-p${page}`,caption:`平成31年度春期 共通記法 物理p.${page}`}))}]:body.contexts;
 return{...body,prompt:spring2019FinalizeSourceUnits(l.number,prompt),contexts};
}
export const legacy2019SpringExistingDefinitions:GenerationDefinition[]=spring2019ExistingLayouts.map(l=>({...l.definition,...l.number===6?{title:'旧制度・午後：社内システムの仕様変更の扱い'}:{},version:l.definition.version??'3.2.0',notes:l.definition.notes.replace('共有profile未登録/全配布未完。','').replace('旧午後Run/mix/保存UI/図hookは未統合。','通常出題経路と保存表示の受入は冊子全体で別に確認する。').replace('共有Run/選択方式/図hook/用語は別統合待ち。','通常出題経路・資料表示・用語の受入は冊子全体で別に確認する。').replace('現在のmodern mixはlegacy除外、旧午後固定設定/共有registry/図hook/実Run容量は未検証。','有限候補からの出題では，直前と同じ入力・正答内容を避ける条件を保つ。通常出題経路の受入は冊子全体で別に確認する。').replace('27入力/18正答内容/同答最多3、直前同答除外後24以上だが有限履歴/128再試行/実legacyRunの保証は未完。','27入力/18正答内容/同答最多3。直前と同じ正答内容を除いても24以上の入力が残る。有限候補からの抽選の評価と通常出題経路の受入は冊子全体で別に確認する。')+' 当該年度のIPA原本文/公式解答と固定参考はroot素材scope645dcb7b…の限定判断を受領。原のword/signature/順と素材別帰属を保持し，通常App/冊子配布の受入とは分ける。 正式旧午後の原位置に全解答群を表示し、原共用群を同一IDへ対応付ける。private producer/metadata/canonical176は変更しない。',build:v=>built(l,v)}));
export function spring2019ExistingBank(profile:string,values:number[]){
 const l=spring2019ExistingLayouts.find(l=>profile===`legacy-2019-spring-pm${l.number}-bank`);if(!l||values.length!==l.definition.fields.length+1||values.some(v=>!Number.isInteger(v)))throw Error('PARAMETER_CONSTRAINT');
 const group=values.at(-1)!;if(group<0||group>=l.groups.length)throw Error('PARAMETER_CONSTRAINT');const body=built(l,values.slice(0,-1)),part=body.answerParts![l.groups[group][0]];
 return{number:l.number,group,caption:l.captions[group],entries:part.choiceIds.map((id,i)=>({label:'アイウエオカキクケコ'[i],blocks:choice(body,id)}))};
}
