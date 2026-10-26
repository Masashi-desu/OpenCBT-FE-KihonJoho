import {field,p,table,figure,strings,variableNotes,type GenerationDefinition} from './definition';
import {legacy2017Pm3Source,legacy2017Pm3Scenario,legacy2017Pm3Profile,legacy2017Pm3FigureAlt} from './legacy-2017-pm3-data';
export const legacy2017Pm3Definition:GenerationDefinition={source:'2017h29h-fe-pm-3',title:'旧制度・午後：住民問合せデータベースの制約',version:'3.2.0',sourceAnswer:'設問1=ア／設問2 a=エ、b=ア／設問3 c=ア、d=ア',fields:[field('登録状態の運用条件',0,3)],reference:[0],notes:variableNotes+' 原19論理単位/5欄/21択と4関係表/主キー下線5本/2行の見直し表/11行DDLを維持。codeにcaption属性がないため原図2captionを直後の独立paragraphへ写す20native blocks。状態集合2/3/3/4個と運用本文/全該当択/独自説明を同位置へbind。CHECKは集合制約でありレビュー完了/遷移順を強制しない。主キー/未回答NULL/複数の問合せによる同一ルール参照/原のレビュー前UNIQUEを固定。図1の管理作図と可変条件は改変。共有profile/Schema/AppUX/本番Run/旧150分選択/配布はpending。',build(values){
 if(!Array.isArray(values)||values.length!==1||Object.getOwnPropertyNames(values).sort().join(',')!=='0,length'||Object.getOwnPropertySymbols(values).length||!Object.hasOwn(Object.getOwnPropertyDescriptor(values,'0')??{},'value'))throw Error('PARAMETER_CONSTRAINT');
 const s=legacy2017Pm3Source(),m=legacy2017Pm3Scenario(values[0]),groups=s.groups.map(g=>[...g.choices] as string[]);groups[4]=m.dChoices;
 const prompt=s.orderedBlocks.flatMap(b=>{
  if(b.kind==='figure')return [figure(legacy2017Pm3Profile,[0],b.caption,legacy2017Pm3FigureAlt())];
  if(b.kind==='table'){const rows:string[][]=b.rows.map(r=>[...r]);rows[1][1]=m.cell;return [table(b.caption,[...b.headers],rows)];}
  if(b.kind==='choice-group'){const i=s.groups.findIndex(g=>g.id===b.group);return [p((i===0?'解答群':s.groups[i].id+'に関する解答群')+'\n'+groups[i].map((t,j)=>'アイウエオカ'[j]+'　'+t).join('\n'))];}
  if(b.kind==='code')return [{type:'code' as const,language:'sql',text:b.text},p(b.caption)];
  return [p(b.text)];
 });
 const offsets=[0,3,9,13,17],counts=[3,6,4,4,4],ids=['q1','a','b','c','d'],labels=['設問1','設問2 a','設問2 b','設問3 c','設問3 d'],indices=[0,3,0,0,0];
 return {prompt,choices:strings(groups.flat()),answerParts:ids.map((id,i)=>({id:'part-'+id,label:labels[i],choiceIds:Array.from({length:counts[i]},(_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:ids.map((id,i)=>({kind:'choice' as const,partId:'part-'+id,choiceId:'choice-value-'+(offsets[i]+indices[i]+1)})),explanation:[
 '設問1：旧複合主キーでは区分IDと対象物IDがともに同じペアを重複登録できない。ルールIDで個々の行を識別すれば，同じペアの複数ルールを区別できる。区分か対象物のどちらかが異なるペアは旧表でも登録可能であり，ルールIDを新設する理由にはならない。',
 '設問2 a：外部キーは参照制約で，非NULLのルールIDが参照先の既存ルールに対応することを保証する。非NULL/NULLの許否，一意性，行内条件，主キーの識別はそれぞれ別の役割で，単独では参照先の存在を保証しない。',
 '設問2 b：未回答の問合せでは追加ルールIDにNULLを保存し，後日作成したルールのIDへ更新する必要があるので非NULL制約は適用できない。複数の受付が同じルールを参照できるためUNIQUEも不要で，受付Noの既存主キーを追加ルールIDの主キーへ置き換えない。参照先のルール表自体の主キーは非NULLであり，問合せ側のNULLとは区別する。',
 '設問3 c：区分IDと対象物IDの組合せのUNIQUEを残すと，同じペアの複数ルールが引き続き拒否されるのでこれを削除する。ルール表の対象物IDのNOT NULL，対象物表への参照，ルールIDのPRIMARY KEYは保持する。未回答のNULLをルール表の対象物IDへ混同しない。',
 '設問3 d：許容状態は'+m.states.join('・')+'であり，CHECK(登録状態 IN('+m.states.map(s=>"'"+s+"'").join(',')+'))で集合の値域を検査する。CHECK単独はNULL/UNKNOWNを許すが，原の登録状態NOT NULLがNULLを別に拒否する。CHECK(登録状態 IS NULL)は原のNOT NULLと両立せず正常な状態も拒否する。文字列リテラルを並べたUNIQUEは列の一意制約を値域宣言と混同しており，WHEREはこのCREATE TABLEへ追加する制約構文ではない。検索の対象は公開の状態である。CHECKは課内レビューの完了や状態遷移の順序を強制するものではない。'
 ].join('\n')};
}};
