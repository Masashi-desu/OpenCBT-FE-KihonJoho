import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2005-spring-pm-01-05-shared';
import { heapCases, hex, listExample, replaceExample, schedule } from './legacy-2005-spring-pm-01-05-models';

export const profiles={
  'list-shape':'legacy-2005-spring-pm-1-list-shape',
  'list-memory':'legacy-2005-spring-pm-1-list-memory',
  'replace-arrays':'legacy-2005-spring-pm-2-replace-arrays',
  heap:'legacy-2005-spring-pm-4-heap',
  timetable:'legacy-2005-spring-pm-5-timetable',
  'record-layout':'legacy-2005-spring-pm-5-record-layout',
  'file-example':'legacy-2005-spring-pm-5-file-example',
  'editor-flow':'legacy-2005-spring-pm-5-editor-flow',
  'main-flow':'legacy-2005-spring-pm-5-main-flow',
} as const;
export type FigureKind=keyof typeof profiles;
export const recordColumns=['年次','曜日','時限','表示順','科目名','教員名'] as const;
const rules:Record<FigureKind,{count:number;alt:(index:number)=>string}>={
  'list-shape':{count:4,alt:index=>{
    const {elements}=listExample(index);
    return 'ROOTから要素'+elements.slice(0,3).map(element=>hex(element.value)).join('→')+
      '→…→'+hex(elements.at(-1)!.value)+'とつながる。各要素の第2語は次へのポインタ、最後の要素の第2語は0000。';
  }},
  'list-memory':{count:4,alt:index=>'番地と内容（16進数）。\n'+listExample(index).groups.map(group=>
    group.map(([address,value])=>(value==='⋮'?'⋮':hex(address))+'：'+value).join('、')).join('\n')+'。'},
  'replace-arrays':{count:4,alt:index=>replaceExample(index).arrays.map((values,i)=>
    'ASDB'[i]+'[]：'+values.map((value,n)=>n+' '+value).join('、')).join('\n')+'。'},
  heap:{count:4,alt:index=>'二分木の配列の位置と値。'+heapCases[index].map((value,i)=>'A['+(i+1)+']='+value).join('、')+
    '。A[i]の左の子はA[2×i]、右の子はA[2×i＋1]で、配列外に子はない。'},
  timetable:{count:4,alt:index=>'年次・曜日・時限・表示順・科目名・教員名。\n'+schedule(index).rows.map(row=>[row[0]+'年次',row[1]===2?'月曜':'火曜',
    row[2]+'時限',row[3],row[4],row[5]].join('／')).join('\n')+'。'},
  'record-layout':{count:1,alt:()=> '左から'+recordColumns.join('、')+'の六項目。'},
  'file-example':{count:4,alt:index=>{
    const {example,out}=schedule(index);
    return '既存システムの出力。\n'+example.map((row,i)=>(i+1)+' '+row.join('／')).join('\n')+
      '\n新システムへの入力。\n'+out.map((value,i)=>(i+1)+' '+value).join('\n')+'。';
  }},
  'editor-flow':{count:1,alt:()=> '編集の開始→初期値設定→レコード読込み。レコード終わりのYesはメッセージ出力へ、Noは値の範囲の検査へ。'+
    '検査後ERRORが真ならエラー処理へ、偽なら主処理へ。主処理後ERRORが真ならエラー処理へ、偽なら次のレコード読込みへ。'+
    'エラー処理後及びレコード終わりのときはメッセージ出力を行って終了。'},
  'main-flow':{count:1,alt:()=> '主処理の開始。NENJI：I_NENJIが＜なら処理1でGに続けてI_NENJIを出力、網掛け部分は省略、YOBI←0。＞ならエラー情報設定1、＝なら処理1を飛ばす。'+
    'YOBI：I_YOBIが＜なら処理2でDに続けてI_YOBIを出力、網掛け部分は省略、JIGEN←0。＞ならエラー情報設定2、＝なら処理2を飛ばす。'+
    'JIGEN：I_JIGENが＜なら処理3でTに続けてI_JIGENを出力、網掛け部分は省略、HYOJJUN←0。＞ならエラー情報設定3、＝なら処理3を飛ばす。'+
    '条件Xが判定Yに該当すれば処理4でI_KAMOKU、I_KYOINの順に出力し、網掛け部分は省略。反対側の分岐条件は省略され、エラー情報設定4に進む。各エラー情報設定後及び処理4の後は戻る。'},
};
export const legacy2005SpringPm0105Figures:readonly BookletFigureDefinition[]=(Object.keys(profiles) as FigureKind[]).map(kind=>{
  const {count,alt}=rules[kind];
  return {profile:profiles[kind],domain:[[0,count-1]],validate(values){selectCase(values,count-1);},alt(values){return alt(selectCase(values,count-1));}};
});
export function draw(kind:FigureKind,index:number,caption:string) {
  const {count,alt}=rules[kind];
  selectCase([index],count-1);
  return {...figure(profiles[kind],[index],caption,alt(index)),captionPresentation:'accessible' as const};
}
