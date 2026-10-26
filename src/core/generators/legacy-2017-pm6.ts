/** Unregistered preparation only. Source-owned arithmetic, never an oracle import. */
import {DataError} from '../errors';
import type {Block} from '../types';
import type {GenerationDefinition,GeneratedBody} from './definition';
import {pm6Source,pm6N,pm6Given,pm6Managed,pm6Profile} from './legacy-2017-pm6-data';
export function pm6Input(v:unknown):asserts v is number[]{
 if(!Array.isArray(v)||Object.getPrototypeOf(v)!==Array.prototype||Reflect.ownKeys(v).length!==3||v.length!==2)throw new DataError('GENERATION_PARAMETERS','PM6は二つの条件です');
 for(let i=0;i<2;i++){const d=Object.getOwnPropertyDescriptor(v,String(i));if(!d||!('value'in d)||!d.enumerable||!Number.isSafeInteger(d.value)||Object.is(d.value,-0)||d.value<0||d.value>3)throw new DataError('GENERATION_PARAMETERS','PM6条件は0〜3の整数です');}
}
export function pm6Calendar(v:number[],pair:number[]=[4,4]){
 pm6Input(v);const n=pm6N[v[0]],effort=[[30*n,700,1400,525,420],[30*n-39,630,1272,480,381]],duration=[[3,3,pair[0],2,3],[3,3,pair[1],2,3]],need=effort.map((ws,s)=>ws.map((w,i)=>Math.ceil(w/(10*duration[s][i]))));
 const a=Math.ceil(4*Math.max(need[0][0],need[1][0])/5),phase:number[][]=[[],[]];
 for(let s=0;s<2;s++){let m=s?6:0;duration[s].forEach((d,p)=>{for(let j=0;j<d;j++)phase[s][m++]=p;});}
 const rows=Array.from({length:Math.max(...phase.map(p=>p.length))},(_,m)=>{let left=a;const people=[0,1].map(s=>{const p=phase[s][m],total=p===undefined?0:need[s][p],own=p===undefined||p===2?0:Math.min(left,total);left-=own;return{phase:p??null,total,A:own,B:total-own};});return{month:m,people,unusedA:left};});
 return{a,need,rows,gaps:rows.filter(r=>r.unusedA>0).map(r=>r.month)};
}
export function pm6Document(values:number[]){
 pm6Input(values);const doc=structuredClone(pm6Source),n=pm6N[values[0]],{a}=pm6Calendar(values);
 doc.tables[0].rows![0].values[0]=(3*n).toFixed(1);doc.tables[0].rows![2].values[0]=((30*n-39)/10).toFixed(1);
 const bank=[n-a,3,Math.floor(4*n/5),a,n,3*n];doc.choiceGroups.ab.values=bank;
 const t=doc.tables[2];for(const x of t.staffing!['一期開発']['B社']){if(['2018-03','2018-04'].includes(x.month))x.value=27-a;if(['2018-05','2018-06','2018-07'].includes(x.month))x.value=14-a;}
 for(const x of t.staffing!['二期開発']['B社']){const i=['2018-03','2018-04','2018-05','2018-06','2018-07'].indexOf(x.month);if(i>=0)x.value=pm6Given[values[1]][i];}
 return doc;
}
function compact(ms:{month:string;state:string;value:number|null}[]){const parts:string[]=[];for(let i=0;i<ms.length;i++){let j=i;while(j+1<ms.length&&ms[j+1].state===ms[i].state&&ms[j+1].value===ms[i].value)j++;const x=ms[i];parts.push(x.month+(j>i?'〜'+ms[j].month:'')+':'+(x.state==='shown'?x.value:x.state==='hidden'?'網掛け・非表示':'作業なし・斜線'));i=j;}return parts.join('、');}
export function pm6UnitAlt(index:number,values:number[]):string{
 const doc=pm6Document(values),u=doc.units[index];if(!u)throw new DataError('FIGURE_PROFILE','PM6単位');
 if(u.kind==='table'){const t=doc.tables.find(t=>t.id===u.tableId)!;if(t.id==='table1')return t.caption+'。列：段階、区分、外部設計、内部設計、プログラム開発、結合テスト、総合テスト。'+t.rows!.map(r=>r.stage+' '+r.kind+' '+r.values.map(v=>v===null?'網掛け・非表示':v).join('、')).join('。');return t.caption+'。2017年4月〜2018年12月。'+Object.entries(t.schedules!).map(([s,ps])=>s+' '+ps.map(p=>p.phase+' '+p.start+'〜'+p.end).join('、')).join('。')+'。'+Object.entries(t.staffing!).flatMap(([s,cs])=>Object.entries(cs).map(([c,ms])=>s+c+' '+compact(ms))).join('。');}
 if(u.kind==='fraction-equation')return u.left+' '+u.operator+' 分子 '+u.numerator+'、分母 '+u.denominator;
 if(u.kind==='choice-group'){const g=doc.choiceGroups[u.groupId! as keyof typeof doc.choiceGroups];return u.text+'。'+g.values.map((x,i)=>g.labels[i]+' '+x).join('。');}
 return(u.marker??u.label??'')+(u.text??'');
}
export const pm6ChoiceIds={ab:Array.from({length:6},(_,i)=>'choice-value-'+(i+1)),c:Array.from({length:4},(_,i)=>'choice-value-'+(i+7)),d:Array.from({length:4},(_,i)=>'choice-value-'+(i+11)),ef:Array.from({length:6},(_,i)=>'choice-value-'+(i+15))};
function build(values:number[]):GeneratedBody{
 pm6Input(values);const v=[...values],doc=pm6Document(v),cal=pm6Calendar(v),a=cal.a,n=pm6N[v[0]],given=pm6Given[v[1]],before=[27-a+given[0],27-a+given[1],14-a+given[2]],target=before.reduce((a,b)=>a+b,0)/3,e=target-before[0],f=target-before[2];
 const ab=doc.choiceGroups.ab.values,c=doc.choiceGroups.c.values,d=doc.choiceGroups.d.values,ef=doc.choiceGroups.ef.values,groups=[...ab,...c,...d,...ef];
 const prompt:Block[]=doc.units.map((u,i)=>{if((pm6Managed as readonly number[]).includes(i))return{type:'diagram',id:'diagram-legacy-2017-pm6-'+u.id,rendererRef:{id:'renderer-source-figures',version:'1.0.0'},caption:u.kind==='table'?doc.tables.find(t=>t.id===u.tableId)!.caption:u.text?.slice(0,60)??'各月の要員数の式',alt:pm6UnitAlt(i,v),scene:{kind:'source_figure',profile:pm6Profile,values:[i,...v]},attribution:{origin:'adapted',sourceRefs:[u.physicalPage,...(u.continuesOnPhysicalPage?[u.continuesOnPhysicalPage]:[])].map(page=>({sourceId:'source-ipa-2017h29h-fe-pm-6-qs',locator:{section:'平成29年度 春期 基本情報技術者試験 午後 問6',year:2017,period:'春期',exam:'基本情報技術者試験',timeSlot:'午後',subject:'午後',questionNumber:'6',page}})),rightsRefs:['rights-ipa-2017h29h-fe-pm-6','rights-original'],creatorIds:['codex']}};return{type:'paragraph',text:(u.marker?u.marker+' ':'')+u.text!};});
 const answerParts=['a','b','c','d','e','f'].map((id,i)=>({id:'part-'+id,label:id,choiceIds:[...pm6ChoiceIds[(['ab','ab','c','d','ef','ef']as const)[i]]]}));
 const cMonth=cal.gaps[0],cIndex=c.findIndex(x=>x===((cMonth+3)%12+1)+'月'),dIndex=doc.choiceGroups.d.pairs.findIndex(pair=>pm6Calendar(v,pair).gaps.length===0);
 const index=[ab.indexOf(a),ab.indexOf(n-a),cIndex,dIndex,ef.indexOf(e),ef.indexOf(f)];if(index.some(i=>i<0))throw new DataError('GENERATION_PARAMETERS','PM6の正答が一意ではありません');
 return{prompt,choices:groups.map(x=>[{type:'paragraph',text:String(x)}]),answerParts,partAnswers:index.map((j,i)=>({kind:'choice',partId:answerParts[i].id,choiceId:answerParts[i].choiceIds[j]})),explanation:`工程ごとに工数（人月）を配分月数（月）で割り、小数点以下を切り上げる。外部設計の人数は一期${n}人、二期${cal.need[1][0]}人。両期で80％以上を満たす最少のA社人数は${a}人で、一期外部設計のB社人数は${n-a}人となる。両programを4か月にした表2では2018年7月にA社を割り当てる工程がなくなる。提示された4案のうち一期4・二期3にすれば解消する。別記された一期5・二期4も成立する。表3は追加要件後の与件であり、非表示部分を表1から逆算しない。3月・4月・5月のB総要員数は${before.join('・')}人、合計${before.reduce((a,b)=>a+b,0)}人なので、各月${target}人にする。4月の一期から${e}人を3月へ、二期から${f}人を5月へ移す。対象作業量は保存される。非表示月があるため、この3か月の値を全期間の最大人数とは断定しない。`};
}
export const legacy2017Pm6Definitions:GenerationDefinition[]=[{source:'2017h29h-fe-pm-6',title:'プロジェクトの要員計画',fields:[{name:'外部設計工数の組合せ',minimum:0,maximum:3},{name:'追加要件後の二期プログラム月別人数の組合せ',minimum:0,maximum:3}],reference:[0,0],sourceAnswer:'エアウウウオ',version:'3.2.0',notes:'原33単位/3表/分数式/6ordered欄20固有択32参照/AB・EF共有を保持。N14/11/12/13と表3の独立given4の全16条件。工程ごとの切上げを80％最少人数より先に行う。表3非表示値を表1から埋めず、日/週/時間の仮定や全期間最大40を追加しない。原8枠/①〜⑥/168セルと注記は解答前に残す。未登録準備のみ。',build}];
