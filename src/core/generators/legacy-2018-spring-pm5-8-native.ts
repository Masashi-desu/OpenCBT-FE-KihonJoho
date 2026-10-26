/** Source-local formal layout adapters. Existing private producers stay intact.
 * Shared schema/Content/registry and distribution admission are separate. */
import type {Block} from '../types';
import {spring2018FixedMaterialContexts} from './legacy-2018-spring-fixed-materials';
import type {GeneratedBody,GenerationDefinition} from './definition';
import {legacy2018HealthDefinitions} from './legacy-2018-pm-health';
import {legacy2018EvmAfternoonDefinitions} from './legacy-2018-pm-evm';
import {legacy2018AfternoonDefinitions} from './legacy-2018-pm';
import {legacy2018HeapAfternoonDefinitions} from './legacy-2018-pm-heap';
export type Spring2018Major=5|6|7|8;
export type Spring2018Bank={key:string;title:string;text:string;rows:number[][];items:{symbol:string;text:string}[];cells?:string[][]};
const fail=():never=>{throw Error('SPRING_2018_SOURCE_FORMAT');};
export const spring2018LegacyDefinitions:Record<Spring2018Major,GenerationDefinition>={5:legacy2018HealthDefinitions[0],6:legacy2018EvmAfternoonDefinitions[0],7:legacy2018AfternoonDefinitions[0],8:legacy2018HeapAfternoonDefinitions[0]};
export const spring2018ValidTuples:Record<Spring2018Major,number[][]>={
 5:[[0],[1]],
 6:Array.from({length:2},(_,s)=>Array.from({length:8},(_,f)=>Array.from({length:4},(_,g)=>[s+1,f,g]))).flat(2),
 7:Array.from({length:2},(_,r)=>Array.from({length:3},(_,p)=>Array.from({length:3},(_,s)=>Array.from({length:4},(_,g)=>[r,p,s+1,g])))).flat(3).filter(v=>!(v[0]===0&&v[1]===2)),
 8:Array.from({length:2},(_,a)=>Array.from({length:24},(_,b)=>[a,b])).flat(),
};
const symbols='アイウエオカキクケコ';
const textOf=(b:Block[])=>{if(b.length!==1||b[0].type!=='paragraph')return fail();return b[0].text;};
export const spring2018SelectionNotice='選択した問題は，選択欄の［選］をマークしてください。マークがない場合は，採点されません。';
export const spring2018RequiredNotice='次の問8は必須問題です。必ず解答してください。';
function remapSharedEvm(b:GeneratedBody){
 const c=b.answerParts?.[3],d=b.answerParts?.[4];if(!c||!d||c.choiceIds.length!==6||d.choiceIds.length!==6)return fail();
 const ids=b.choices.map((_,i)=>`choice-value-${i+1}`),kept=ids.filter(id=>!d.choiceIds.includes(id)),map=new Map(kept.map((id,i)=>[id,`choice-value-${i+1}`]));
 if(JSON.stringify(c.choiceIds.map(id=>b.choices[ids.indexOf(id)]))!==JSON.stringify(d.choiceIds.map(id=>b.choices[ids.indexOf(id)])))return fail();
 d.choiceIds.forEach((id,i)=>map.set(id,map.get(c.choiceIds[i])!));
 b.choices=kept.map(id=>b.choices[ids.indexOf(id)]);
 b.answerParts=b.answerParts!.map(p=>({...p,choiceIds:p.choiceIds.map(id=>map.get(id)??fail())}));
 b.partAnswers=b.partAnswers!.map(a=>{if(a.kind!=='choice')return fail();return {...a,choiceId:map.get(a.choiceId)??fail()};});
}
function bank(b:GeneratedBody,part:number,key:string,title:string,rows:number[][],cells?:string[][]):Spring2018Bank{
 const ids=b.choices.map((_,i)=>`choice-value-${i+1}`),items=b.answerParts![part].choiceIds.map((id,i)=>({symbol:symbols[i],text:textOf(b.choices[ids.indexOf(id)])}));
 if(rows.flat().length!==items.length||new Set(rows.flat()).size!==items.length||rows.flat().some(i=>!items[i]))return fail();
 const text=[title,...items.map(x=>`${x.symbol}　${x.text}`)].join('\n');return{key,title,text,rows,items,...(cells?{cells}:{} )};
}
const p=(text:string):Block=>({type:'paragraph',text});
/** Every bank is present in the question body, where the source places it. */
export function spring2018Prepare(major:Spring2018Major,values:number[]){
 const b=structuredClone(spring2018LegacyDefinitions[major].build(values));if(major===6)remapSharedEvm(b);
 const banks:Spring2018Bank[]=[];
 if(major===5){banks.push(bank(b,0,'ab','a，bに関する解答群',Array.from({length:10},(_,i)=>[i])),bank(b,2,'c','cに関する解答群',Array.from({length:6},(_,i)=>[i])),bank(b,3,'d','dに関する解答群',Array.from({length:4},(_,i)=>[i])),bank(b,4,'e','eに関する解答群',Array.from({length:5},(_,i)=>[i])));}
 if(major===6){
  const t=b.prompt.find(x=>x.type==='table'&&x.caption==='eに関する解答群');if(t?.type!=='table')return fail();const cells=t.rows.map(row=>row.slice(1));
  // Preserve the source's three cells, without an invented visible header.
  for(let i=0;i<6;i++)b.choices[22+i]=[p(cells[i].join(' ／ '))];
  banks.push(bank(b,0,'a','aに関する解答群',[[0,1,2,3]]),bank(b,1,'forecast','解答群',[[0,1,2,3],[4,5,6,7]]),bank(b,2,'b','bに関する解答群',[[0],[1],[2],[3]]),bank(b,3,'cd','c，dに関する解答群',[[0,1],[2,3],[4,5]]),bank(b,5,'e','eに関する解答群',[[0],[1],[2],[3],[4],[5]],cells));
 }
 if(major===7){for(const[i,key]of ['a','b','c','d','e','graph','f','g'].entries()){const n=b.answerParts![i].choiceIds.length;banks.push(bank(b,i,key,key==='graph'?'解答群':`${key}に関する解答群`,key==='g'?Array.from({length:n},(_,j)=>[j]):[Array.from({length:n},(_,j)=>j)]));}}
 if(major===8){banks.push(bank(b,0,'a','aに関する解答群',[[0,1],[2,3],[4,5]]),bank(b,1,'b','bに関する解答群',[[0,1],[2,3]]),bank(b,2,'c','cに関する解答群',[[0,1,2,3]]),bank(b,3,'d','dに関する解答群',[[0,1],[2,3]]),bank(b,4,'e','eに関する解答群',[[0,1,2],[3,4,5]]));}
 const byKey=(key:string)=>p(banks.find(x=>x.key===key)?.text??fail()),out:Block[]=[];
 for(const [i,raw]of b.prompt.entries()){
  let x=structuredClone(raw);
  if(x.type==='paragraph'){
   if(major===5&&i===0)x.text=spring2018SelectionNotice;
   if(major!==5&&i===0){out.push(p(major===8?spring2018RequiredNotice:spring2018SelectionNotice));x.text=x.text.replace(/^旧制度・午後 問([678])(?:（必須問題）)?。/,'問$1 ');}
   if(major===5&&(i===30||i===34))x.text=x.text.replace('空欄','［　］');
   if(major===6){if(i===9)x.text=x.text.replace('［a］','［　］');if(i===12||i===23)x.text=x.text.replace('空欄','［　］');if(i===16)x.text=x.text.replace('［設問2］','［　］');}
   if(major===7){if(i===2)x.text=x.text.replace('［a］〜［e］','［　］');if(i===10)x.text=x.text.replace('［f］、［g］','［　］');}
   if(major===8){if(i===21)x.text=x.text.replace('［a］、［b］','［　］');if(i===22)x.text=x.text.replace('［c］、［d］、［e］','［　］');}
   if(major===5&&[33,49,50,51].includes(i)){out.push(byKey(({33:'ab',49:'c',50:'d',51:'e'} as Record<number,string>)[i]));continue;}
  }
  if(major===6&&x.type==='table'&&x.caption==='eに関する解答群'){out.push(byKey('b'),byKey('cd'),byKey('e'));continue;}
  if(major===8&&x.type==='diagram'&&x.scene.kind==='source_figure'&&x.scene.profile.includes('-program-'))x.caption=x.scene.profile.endsWith('-one')?'〔プログラム1〕':'〔プログラム2〕';
  // The source places a's bank after table3, before subquestion2.
  if(major===6&&i===12)out.push(byKey('a'));
  if(major===6&&i===23)out.push(byKey('forecast'));
  if(major===7&&i===8)out.push(...['a','b','c','d','e'].map(byKey));
  if(major===7&&i===10)out.push(byKey('graph'));
  if(major===8&&i===22)out.push(byKey('a'),byKey('b'));
  out.push(x);
 }
 if(major===7)out.push(byKey('f'),byKey('g'));
 if(major===8)out.push(byKey('c'),byKey('d'),byKey('e'));
 if(major===8)b.contexts=spring2018FixedMaterialContexts(8);
 b.prompt=out;return{body:b,banks};
}
const dictionaries=new Map<Spring2018Major,Map<string,Spring2018Bank|null>>();
export function spring2018NativeFragment(major:Spring2018Major,text:string){
 let known=dictionaries.get(major);if(!known){known=new Map();for(const values of spring2018ValidTuples[major]){const {body,banks}=spring2018Prepare(major,values);for(const b of banks)known.set(b.text,b);for(const b of body.prompt)if(b.type==='paragraph'&&(b.text.includes('［')||b.text.startsWith('〔')||b.text===spring2018RequiredNotice))if(!known.has(b.text))known.set(b.text,null);}dictionaries.set(major,known);}
 return{known:known.has(text),bank:known.get(text)??null};
}
