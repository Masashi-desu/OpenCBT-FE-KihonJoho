/** Spring2018 source-local presentation adapter. The private producers remain
 * unchanged; shared source banks have one ordered identity in the new body. */
import type {Block} from '../types';
import {figure,p,type GeneratedBody,type GenerationDefinition} from './definition';
import {legacy2018PasswordDefinitions} from './legacy-2018-pm-password';
import {legacy2018LogicAfternoonDefinitions} from './legacy-2018-pm-logic';
import {legacy2018MembersDefinitions} from './legacy-2018-pm-members';
import {legacy2018CloudDefinitions} from './legacy-2018-pm-cloud';
export type Spring2018FirstMajor=1|2|3|4;
export const spring2018FirstDefinitions={1:legacy2018PasswordDefinitions[0],2:legacy2018LogicAfternoonDefinitions[0],3:legacy2018MembersDefinitions[0],4:legacy2018CloudDefinitions[0]} as const;
export const spring2018FirstBankNames={1:['a','b','c','d','e'],2:['a','b，c','d，e'],3:['設問1','a','b','c'],4:['a','b','c','設問2']} as const;
const indices:Record<Spring2018FirstMajor,number[][]>={1:[[0,1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16],[17,18,19,20]],2:[[0,1,2,3],[4,5,6,7,8],[14,15,16,17,18,19]],3:[[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]],4:[[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15,16]]};
export const spring2018FirstLegacyFigureProfiles={1:['legacy-2018-password-basic','legacy-2018-password-salted'],2:['legacy-2018-gate-composition','legacy-2018-half-adder'],3:['legacy-2018-members-tables','legacy-2018-members-sql-scaffold'],4:['legacy-2018-cloud-topology']} as const;
export function spring2018FirstInput(number:Spring2018FirstMajor,values:number[]){return spring2018FirstDefinitions[number].build(values);}
export function spring2018FirstBank(number:Spring2018FirstMajor,values:number[],bank:number){const body=spring2018FirstInput(number,values),ids=indices[number][bank];if(!ids)throw Error('SPRING2018_BANK_INDEX');return ids.map(i=>structuredClone(body.choices[i]));}
export function spring2018FirstBankCaption(number:Spring2018FirstMajor,bank:number){const name=spring2018FirstBankNames[number][bank];if(name===undefined)throw Error('SPRING2018_BANK_INDEX');return name.startsWith('設問')?'解答群':`${name}に関する解答群`;}
export function spring2018FirstBankText(number:Spring2018FirstMajor,values:number[],bank:number){return spring2018FirstBank(number,values,bank).map((blocks,i)=>'アイウエオカキク'[i]+'　'+blocks.map(b=>b.type==='paragraph'||b.type==='code'?b.text:(()=>{throw Error('SPRING2018_BANK_BLOCK');})()).join('\n')).join('\n');}
export function spring2018FirstProfiles(number:Spring2018FirstMajor){return [...spring2018FirstLegacyFigureProfiles[number].map((_,i)=>`legacy-2018-spring-pm${number}-figure-${i}`),...(number===2?[0,1,2].map(i=>`legacy-2018-spring-pm2-table-${i}`):[]),`legacy-2018-spring-pm${number}-bank`];}
export function spring2018FirstProfile(number:Spring2018FirstMajor,profile:string,values:number[]){
 const prefix=`legacy-2018-spring-pm${number}-`,native=profile.startsWith(prefix)?profile.slice(prefix.length):'';
 if(native==='bank'){const arity=spring2018FirstDefinitions[number].fields.length;if(values.length!==arity+1)throw Error('SPRING2018_PROFILE_VALUES');const domain=values.slice(0,-1),bank=values.at(-1)!;spring2018FirstInput(number,domain);if(!Number.isSafeInteger(bank)||bank<0||bank>=indices[number].length)throw Error('SPRING2018_BANK_INDEX');return{kind:'bank' as const,domain,bank,blocks:spring2018FirstBank(number,domain,bank),caption:spring2018FirstBankCaption(number,bank),alt:spring2018FirstBankText(number,domain,bank)};}
 if(/^figure-[0-2]$/.test(native)){const index=Number(native.slice(-1)),legacy=spring2018FirstLegacyFigureProfiles[number][index];if(!legacy)throw Error('SPRING2018_PROFILE');const body=spring2018FirstInput(number,number===1?values:number===2?[values[0],0]:number===3?(index===0?values:values.slice(1)):[0,0]),block=body.prompt.find(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile===legacy&&(number!==3||index!==1||b.scene.values[0]===values[0]));if(!block||block.type!=='diagram'||block.scene.kind!=='source_figure'||JSON.stringify(block.scene.values)!==JSON.stringify(values))throw Error('SPRING2018_PROFILE_VALUES');return{kind:'legacy' as const,index,legacy,caption:block.caption,alt:block.alt,values:[...values]};}
 if(number===2&&/^table-[0-2]$/.test(native)){const index=Number(native.slice(-1)),body=spring2018FirstInput(2,values),tables=body.prompt.filter((b):b is Extract<Block,{type:'table'}>=>b.type==='table'),block=tables[index];if(!block)throw Error('SPRING2018_PROFILE');return{kind:'table' as const,index,caption:block.caption,alt:block.caption+'。'+block.rows.map(r=>r.join('，')).join('。'),block:structuredClone(block)};}
 throw Error('SPRING2018_PROFILE');
}
export const spring2018FirstSelectionNotice='選択した問題は、選択欄の［選］をマークしてください。マークがない場合は、採点されません。';
export const spring2018FirstGeneralNotice='次の問2から問7までの6問については、この中から4問を選択し、選択した問題については、答案用紙の選択欄の［選］をマークして解答してください。なお、5問以上マークした場合には、はじめの4問について採点します。';
const corrections:Record<Spring2018FirstMajor,Record<string,string>>={1:{
 '設問1 本文中の［a］、［b］に入れる適切な答えを、解答群の中から選べ。':'設問1 本文中の［　］に入れる適切な答えを、解答群の中から選べ。',
 '設問2 次の記述中の［c］、［d］に入れる適切な答えを、解答群の中から選べ。':'設問2 次の記述中の［　］に入れる適切な答えを、解答群の中から選べ。',
 '設問3 次の記述中の［e］に入れる適切な答えを、解答群の中から選べ。':'設問3 次の記述中の［　］に入れる適切な答えを、解答群の中から選べ。'},2:{},3:{'選択した問題は、選択欄の丸で囲まれた「選」をマークしてください。マークがない場合は、採点されません。':spring2018FirstSelectionNotice},4:{'設問1 本文中の空欄に入れる正しい答えを、解答群の中から選べ。':'設問1 本文中の［　］に入れる正しい答えを、解答群の中から選べ。'}};
function corrected(number:Spring2018FirstMajor,text:string){if(corrections[number][text])return corrections[number][text];if(number===2){if(text.startsWith('設問1 '))return text.replace('図1中の［a］','図1中の［　］');if(text.startsWith('設問2 '))return text.replace('図2中の［b］、［c］','図2中の［　］');if(text.startsWith('設問3 '))return text.replace('［d］、［e］','［　］');}if(number===3&&text.startsWith('設問'))return text.replace(/次のSQL文の［[abc]］/,'次のSQL文の［　］');return text;}
export function spring2018FirstSourceText(number:Spring2018FirstMajor,text:string){return corrected(number,text);}
export function spring2018FirstAdapt(number:Spring2018FirstMajor,values:number[]):GeneratedBody{
 const raw=spring2018FirstInput(number,values),body=structuredClone(raw),out:Block[]=[];let tableIndex=0;
 const bank=(n:number)=>{const profile=`legacy-2018-spring-pm${number}-bank`,v=[...values,n],data=spring2018FirstProfile(number,profile,v);out.push(figure(profile,v,data.caption,data.alt));};
 if(number===2)out.push(p(spring2018FirstGeneralNotice));
 if(number===4)out.push(p(spring2018FirstSelectionNotice));
 for(const [i,old]of raw.prompt.entries()){
  const b=structuredClone(old);if(b.type==='paragraph')b.text=corrected(number,b.text);
  if(b.type==='diagram'&&b.scene.kind==='source_figure'){const index=spring2018FirstLegacyFigureProfiles[number].indexOf(b.scene.profile as never);if(index<0)throw Error('SPRING2018_OLD_PROFILE');b.scene.profile=`legacy-2018-spring-pm${number}-figure-${index}`;b.id='diagram-'+b.scene.profile;if(number===3&&old.type==='diagram'&&old.scene.kind==='source_figure'&&old.scene.profile==='legacy-2018-members-sql-scaffold')b.captionPresentation='accessible';}
  if(number===2&&b.type==='table'){const profile=`legacy-2018-spring-pm2-table-${tableIndex++}`,data=spring2018FirstProfile(2,profile,values);out.push(figure(profile,[...values],data.caption,data.alt));}else out.push(b);
  if(number===1){if(i===12){bank(0);bank(1);}if(i===19){bank(2);bank(3);}if(i===23)bank(4);}
  if(number===2){if(i===5)bank(0);if(i===7)bank(1);if(i===14)bank(2);}
  if(number===3){if(old.type==='paragraph'&&old.text.startsWith('設問1 '))bank(0);if(old.type==='diagram'&&old.scene.kind==='source_figure'&&old.scene.profile==='legacy-2018-members-sql-scaffold')bank(old.scene.values[0]+1);}
  if(number===4){if(i===36){bank(0);bank(1);bank(2);}if(i===37)bank(3);}
 }
 body.prompt=out;
 if(number===2){const map=[0,1,2,3,4,5,6,7,8,4,5,6,7,8,9,10,11,12,13,14,9,10,11,12,13,14];body.choices=[...raw.choices.slice(0,9),...raw.choices.slice(14,20)].map(c=>structuredClone(c));for(const part of body.answerParts!)part.choiceIds=part.choiceIds.map(id=>'choice-value-'+(map[Number(id.slice(13))-1]+1));for(const a of body.partAnswers!){if(a.kind!=='choice')throw Error('SPRING2018_PART_KIND');a.choiceId='choice-value-'+(map[Number(a.choiceId.slice(13))-1]+1);}}
 return body;
}
export function spring2018FirstDefinition(number:Spring2018FirstMajor):GenerationDefinition{const old=spring2018FirstDefinitions[number];return{...old,version:'3.2.0',notes:`原資料の全設問、注意、解答群と共有関係を保ち、表・図・空欄を画面用に組み直した。${number===1?'ハッシュ・ソルトの省略表記と正答を固定し、誤ったハッシュの性質の記述を変更する。':number===2?'論理回路の目標演算と重み・しきい値を同じ役割の位置へ反映する。':number===3?'対象学年とイベント条件を関連するSQLへ反映する。生成版に限り登録済み保護者番号・非NULLの前提を解答前に補う。':'仮想マシンの通信処理量と投稿枚数を関連する値・解説へ反映する。設問2は二欄の順不同を保つ。'}原の出題形式と選択肢の役割は維持する。`,build:values=>spring2018FirstAdapt(number,values)};}
