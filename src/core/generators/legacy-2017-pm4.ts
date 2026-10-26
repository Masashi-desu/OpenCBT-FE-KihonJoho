import {field,p,list,table,figure,variableNotes,type GenerationDefinition}from'./definition';
import{legacy2017Pm4Source,legacy2017Pm4Scenario,legacy2017Pm4Profile,legacy2017Pm4FigureAlt}from'./legacy-2017-pm4-data';
export const legacy2017Pm4Definition:GenerationDefinition={source:'2017h29h-fe-pm-4',title:'旧制度・午後：無線LANにおけるデータの送信',version:'3.2.0',sourceAnswer:'設問1 a=ウ、b=ア／設問2 c=ア／設問3=イ',fields:[field('W1の平均待機時間の条件',0,3)],reference:[0],notes:variableNotes+' 原18論理単位を14prompt/19choiceへ対応し、cの各択はc1/c2の組合せ表1個。原7手順/Roman3項目/比較2下線/図1の2時間線3中空矢印/図注/全前提を保持。W1平均101.5/144.5/198.5/326.5とaの全数値/解説を同位置bindし、正答約30/27/24/19。平均的比較を厳密2倍にせず、B24Mbpsの未提示frame時間やIEEE必須値を作らない。管理React図/list/uは共有入庫前のprivate/excluded候補。',build(values){
 if(!Array.isArray(values)||values.length!==1||Object.getOwnPropertyNames(values).sort().join(',')!=='0,length'||Object.getOwnPropertySymbols(values).length||!Object.hasOwn(Object.getOwnPropertyDescriptor(values,'0')??{},'value'))throw Error('PARAMETER_CONSTRAINT');
 const s=legacy2017Pm4Source(),m=legacy2017Pm4Scenario(values[0]),prompt=s.units.filter(u=>!['a-group','b-group','c-group','q3-group'].includes(u.id)).map(u=>{
  if(u.kind==='figure')return figure(legacy2017Pm4Profile,[0],u.caption!,legacy2017Pm4FigureAlt());
  if(u.kind==='ordered-list')return list([...(u.items??[])],true);
  return p(u.id==='rate'?u.text!.replace('101.5',m.w1MeanMicroseconds):u.text!);
 });
 const choices=[...m.aChoices.map(n=>[p(String(n))]),...s.groups[1].choices.map(text=>[p(text as string)]),...s.groups[2].choices.map(row=>[table('cに関する解答群',['c1','c2'],[row as string[]])]),...s.groups[3].choices.map(text=>[p(text as string)])];
 const ids=['a','b','c','q3'],counts=[4,3,6,6],offsets=[0,4,7,13],indices=[2,0,0,1],labels=['設問1 a：aに関する解答群','設問1 b：bに関する解答群','設問2 c：cに関する解答群（c1・c2の組合せ）','設問3：解答群'],cycle=Number(m.w1MeanMicroseconds)+248+16+24;
 return{prompt,choices,answerParts:ids.map((id,i)=>({id:'part-'+id,label:labels[i],choiceIds:Array.from({length:counts[i]},(_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:ids.map((id,i)=>({kind:'choice' as const,partId:'part-'+id,choiceId:'choice-value-'+(offsets[i]+indices[i]+1)})),explanation:[
 '設問1 a：データ本体1,460バイトは11,680ビット。1回の送信周期はW1平均'+m.w1MeanMicroseconds+'＋データ248＋W2の16＋ACKの24＝'+cycle+'マイクロ秒であり，11,680÷'+cycle+'より約'+m.correctA+'Mビット／秒となる。バイトのまま全周期で割る誤りと，データ送信時間だけで割って待機・ACKを省く誤りを区別する。',
 '設問1 b：平均的には①の方が短い。同じ帯域を使う他の機器の送信中には待機するので，②では機器Bの占有時間の影響を受ける。常に厳密に2倍になるとは限らない。衝突や再送信がなくても，送信待ちの時間は加わる。',
 '設問2 c：BとCの物理層速度が54から24Mビット／秒へ下がると，同じデータフレームの送信が遅くなり，AがBの送信終了まで待機する時間が長くなる。そのためAのデータ送信速度は低下する。W1の値や待機回数が物理速度だけで増えるわけではなく，AとCの物理層速度54自体や送信するデータ量は変わらない。AとBの速度の相対比だけが変わっても，Aの実データ送信速度の向上を意味しない。',
 '設問3：伝送効率はデータ送信速度÷物理層の通信速度である。ⅠはACKの送信時間だけが減る場合でも効率が向上し，W2の削減を必要としない。ⅡはW1で待機する回数を減らすため効率が向上する。Ⅲでは物理層速度が上がるとフレーム送信時間が短くなる一方，速度に依存しないW1とW2の占める割合が相対的に増し，伝送効率は低下する。したがってⅠとⅡの組合せが正しい。'
 ].join('\n')};
}};
