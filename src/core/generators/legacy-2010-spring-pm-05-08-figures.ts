import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { ascending,businessAt,caseCount,caseIndex,deliveryAt,deliveryDate,deliveryDestinations,deliveryLayouts,sortAt } from './legacy-2010-spring-pm-05-08-model';

export const messages=[
  ['顧客','担当者','① 配達先情報などを提示'],['担当者','管理システム','② 配達先情報などを登録'],
  ['管理システム','担当者','③ 配達可能日などを表示'],['担当者','顧客','④ 配達可能日を提示'],
  ['顧客','担当者','⑤ 配達を希望する日付を指定'],['担当者','管理システム','⑥ 配達予定日を登録'],
  ['管理システム','担当者','⑦ 予約番号を表示'],['担当者','顧客','⑧ 予約番号を提示'],
  ['管理システム','担当者','⑨ 配達依頼リストを出力'],['担当者','業者','⑩ 配達依頼リストを送付'],
  ['業者','担当者','⑪ 配達完了を連絡'],['担当者','管理システム','⑫ 配達完了日を登録'],
] as const;
export const recordCaptions={
  '5-accept':'図2　受付ファイルのレコード様式',
  '5-carrier':'図3　業者ファイルのレコード様式',
  '5-region':'図4　郵便番号別業者ファイルのレコード様式',
  '5-reservation':'図5　予約ファイルのレコード様式',
  '5-totals':'図8　集計結果ファイルのレコード様式',
} as const;
export type RecordId=keyof typeof recordCaptions;

const chartNames=['6-curve-a','6-curve-i','6-curve-u'] as const;
export const curveIds=chartNames;
const curveDescriptions=[
  '序盤に増え，中盤の傾きが小さく，終盤に急増して検査項目総数で残存バグ件数の予測値に達する。',
  '序盤から中盤にかけて増え，終盤は増加が見られないまま，予測値より下で検査項目総数に達する。',
  '原点から一定の傾きで増え，検査項目総数で残存バグ件数の予測値に達する。',
];
export const rateFormula=(id:'6-design-rate'|'6-manufacture-rate')=>{
  const stage=id==='6-design-rate'?'設計':'製造';
  return {
    label:stage+'工程でのバグ摘出率',
    numerator:stage+'工程でのバグ摘出件数（実績値）',
    denominator:'全工程でのバグ総件数（'+(id==='6-design-rate'?'予測値':'実績値')+'）',
  };
};

export function forceLabels(i:number){
  const {entryEasy,supplierStrong,substitutesMany}=businessAt(i);
  return [
    ['新規参入者の脅威','［c］，参入が'+(entryEasy?'容易':'困難')+'である。'],
    ['売り手の交渉力','［d］，売り手の交渉力が'+(supplierStrong?'強い':'弱い')+'。'],
    ['競争業者間の敵対関係の強さ','中小企業を含めて競合が多く，厳しい競争を繰り返している。'],
    ['買い手の交渉力','競争業者が多く，製品も類似しているので，買い手の交渉力が強い。'],
    ['代替製品の脅威','［e］，代替製品は'+(substitutesMany?'多数ある':'少ない')+'。'],
  ] as const;
}

type CodeRow={text:string;depth:number;comment?:string;blank?:'a'|'b'|'c';align?:number};
type Rail={start:number;end:number;depth:number;kind:'branch'|'loop';divider?:number};
export type Sheet={rows:readonly CodeRow[];rails:readonly Rail[];alpha?:number;beta?:readonly [number,number]};
const row=(text:string,depth=0,comment?:string,blank?:CodeRow['blank'],align?:number):CodeRow=>({text,depth,comment,blank,align});
const gap=row('');
export const programSheets:readonly Sheet[]=[
  {rows:[
    row('/* プログラム Sort */'),row('○Sort(整数型: list[], 整数型: num)'),row('○整数型: i, num1, num2'),
    row('○整数型: slist1[], slist2[]',0,'/* 配列の宣言 */'),row('',1,undefined,'a'),
    row('・ num1 ← num ÷ 2',1,'/* slist1の要素数計算 */'),row('・ num2 ← num − num1',1,'/* slist2の要素数計算 */'),
    row('i:0, i ＜ num1, 1',2),row('・ slist1[i] ← list[i]',2),gap,gap,
    row('i:0, i ＜ num2, 1',2),row('・ slist2[i] ← ',2,undefined,'b'),gap,
    row('・ Sort(slist1, num1)',1),row('・ Sort(slist2, num2)',1),row('・ Merge(slist1, num1, slist2, num2, list)',1),
    gap,gap,row('/* プログラム Sort の終わり */'),
  ],rails:[
    {start:4,end:18,depth:0,kind:'branch'},{start:7,end:9,depth:1,kind:'loop'},{start:11,end:13,depth:1,kind:'loop'},
  ],alpha:17},
  {rows:[
    row('/* 副プログラム Merge */'),row('○Merge(整数型: slist1[], 整数型: num1,'),
    row('整数型: slist2[], 整数型: num2,',0,undefined,undefined,7),row('整数型: list[] )',0,undefined,undefined,7),
    row('○整数型: i, j'),row('・ i ← 0'),row('・ j ← 0'),row('',1,undefined,'c'),
    row('slist1[i] ＜ slist2[j]',2),row('・ list[i+j] ← slist1[i]',2),row('・ i ← i + 1',2),gap,
    row('・ list[i+j] ← slist2[j]',2),row('・ j ← j + 1',2),gap,gap,
    row('(i ＜ num1) or (j ＜ num2)',1),row('i ＜ num1',2),row('・ list[i+j] ← slist1[i]',2),row('・ i ← i + 1',2),
    gap,row('・ list[i+j] ← slist2[j]',2),row('・ j ← j + 1',2),gap,gap,row('/* 副プログラム Merge の終わり */'),
  ],rails:[
    {start:7,end:15,depth:0,kind:'loop'},{start:8,end:14,depth:1,kind:'branch',divider:11},
    {start:16,end:24,depth:0,kind:'loop'},{start:17,end:23,depth:1,kind:'branch',divider:20},
  ],beta:[16,24]},
];
const placements=[
  ['i','j'],['i+num1','j+num2'],['j+num1','i+num2'],['i+num2','j+num1'],
] as const;
export const optionSheets:readonly Sheet[]=placements.map(([left,right])=>({
  rows:[
    row('i ＜ num1',1),row('・ list['+left+'] ← slist1[i]',1),row('・ i ← i + 1',1),gap,
    row('j ＜ num2',1),row('・ list['+right+'] ← slist2[j]',1),row('・ j ← j + 1',1),gap,
  ],rails:[{start:0,end:3,depth:0,kind:'loop'},{start:4,end:7,depth:0,kind:'loop'}],
}));
export function codeText({rows,rails,alpha,beta}:Sheet){
  return rows.map(({text,depth,comment,blank,align},i)=>{
    const start=rails.find(rail=>rail.start===i),end=rails.find(rail=>rail.end===i),divider=rails.find(rail=>rail.divider===i);
    const symbol=start?(start.kind==='loop'?'■ ':'▲ '):end?(end.kind==='loop'?'■':'▼'):divider?'─':'';
    const actualDepth=align??2*(start?.depth??end?.depth??divider?.depth??depth);
    return ' '.repeat(actualDepth)+symbol+text+(blank?'［'+blank+'］':'')+(comment?'    '+comment:'')+
      (i===alpha?' ← α（直前のMerge呼出し後）':'')+
      (i===beta?.[0]?' （ここからβ）':i===beta?.[1]?' （ここまでβ）':'');
  }).join('\n');
}
export const optionIds=['8-option-a','8-option-i','8-option-u','8-option-e'] as const;
const codeOptions=Object.fromEntries(optionIds.map((id,i)=>[id,{caption:'設問3の解答群 '+('アイウエ'[i]),alt:()=>codeText(optionSheets[i])}])) as
  Record<typeof optionIds[number],{caption:string;alt:()=>string}>;

export type ArrayNode={id:string;x:number;y:number;values:readonly number[]};
const sortEdges=[
  ['all','left'],['all','right'],['left','single'],['left','leftPair'],['right','midPair'],['right','rightPair'],
  ['leftPair','l1'],['leftPair','l2'],['midPair','m1'],['midPair','m2'],['rightPair','r1'],['rightPair','r2'],
  ['l1','leftSorted'],['l2','leftSorted'],['m1','midSorted'],['m2','midSorted'],['r1','rightSorted'],['r2','rightSorted'],
  ['single','leftFinal'],['leftSorted','leftFinal'],['midSorted','rightFinal'],['rightSorted','rightFinal'],
  ['leftFinal','final'],['rightFinal','final'],
] as const;
export { sortEdges };
export function sortTree(index:number):readonly ArrayNode[]{
  const {diagram:arr}=sortAt(index), at=(id:string,x:number,y:number,values:readonly number[])=>({id,x,y,values});
  const l=arr.slice(1,3),m=arr.slice(3,5),r=arr.slice(5);
  return [
    at('all',500,39,arr),at('left',365,105,arr.slice(0,3)),at('right',646,105,arr.slice(3)),
    at('single',304,174,arr.slice(0,1)),at('leftPair',408,174,l),at('midPair',574,174,m),at('rightPair',727,174,r),
    at('l1',366,243,[l[0]]),at('l2',445,243,[l[1]]),at('m1',534,243,[m[0]]),at('m2',612,243,[m[1]]),
    at('r1',689,243,[r[0]]),at('r2',766,243,[r[1]]),at('leftSorted',408,312,ascending(l)),
    at('midSorted',574,312,ascending(m)),at('rightSorted',727,312,ascending(r)),
    at('leftFinal',365,381,ascending(arr.slice(0,3))),at('rightFinal',646,381,ascending(arr.slice(3))),
    at('final',500,450,ascending(arr)),
  ];
}

const recordDrawings=Object.fromEntries(Object.entries(recordCaptions).map(([id,caption])=>[id,{
  caption,alt:(i:number)=>'左から '+deliveryLayouts(i)[id as RecordId].join('｜')+'。',
}])) as Record<RecordId,{caption:string;alt:(i:number)=>string}>;
const curveDrawings=Object.fromEntries(curveIds.map((id,i)=>[id,{
  caption:'eに関する解答群 '+('アイウ'[i]),
  alt:()=>'横軸は検査項目の完了数，縦軸はバグ摘出件数（累積）。原点は0。縦の破線は検査項目総数，横の破線は残存バグ件数の予測値。'+curveDescriptions[i],
}])) as Record<typeof curveIds[number],{caption:string;alt:()=>string}>;
const drawings={
  '5-messages':{caption:'図1　配達サービスにおける情報の流れ',
    alt:()=>messages.map(([from,to,label])=>label+'。'+from+'から'+to+'へ。').join('\n')},
  ...recordDrawings,
  '5-report':{caption:'図6　配達依頼リストの例',alt:(i:number)=>{
    const {carrier,issue,reservations,items,item}=deliveryAt(i);
    return '配達依頼リスト。作成日 '+deliveryDate(issue)+'，業者名 '+carrier+'，配達予定日 '+deliveryDate(issue+1)+'，配達先件数3。\n'+
      'No.｜配達先情報｜予約番号｜'+item+'の個数｜'+item+'番号\n'+deliveryDestinations.map(([address,name],j)=>
        [j+1,address+' '+name,reservations[j],items[j].length,items[j].join('，')].join('｜')).join('\n')+'\n3｜…｜…｜…｜…';
  }},
  '5-processing':{caption:'図7　配達依頼リストを作成する処理の流れ',alt:()=>
    'ファイルA→処理B→処理C→処理D→処理E→中間ファイル。ファイル［c］は処理Dのもう一つの入力。'+
    '中間ファイル→処理F→集計結果ファイル。中間ファイル，集計結果ファイル，業者ファイルを処理Gに入力し，配達依頼リストを出力する。'},
  '6-design-rate':{caption:'設計工程でのバグ摘出率の式',alt:()=>{const f=rateFormula('6-design-rate');return f.label+'＝'+f.numerator+'／'+f.denominator+'×100。';}},
  '6-manufacture-rate':{caption:'製造工程でのバグ摘出率の式',alt:()=>{const f=rateFormula('6-manufacture-rate');return f.label+'＝'+f.numerator+'／'+f.denominator+'×100。';}},
  ...curveDrawings,
  '7-forces':{caption:'図　A社の事業地域における健康飲料業界の分析結果',alt:(i:number)=>
    forceLabels(i).map(([head,description],j)=>['上','左','中央','右','下'][j]+'の枠 '+head+'。'+description).join('\n')+
    '\n上・左・右・下から中央の競争業者間の敵対関係に向かう矢印。'},
  '8-tree':{caption:'図　整列処理の流れ',alt:(i:number)=>{
    const {diagram:[a,b,c,d,e,f,g]}=sortAt(i), join=(v:readonly number[])=>'［'+v.join('，')+'］';
    return '配列list '+join([a,b,c,d,e,f,g])+'。プログラムの説明の（2）①（分割）：'+join([a,b,c])+'と'+join([d,e,f,g])+
      'に分割。前者は'+join([a])+'と'+join([b,c])+'，後者は'+join([d,e])+'と'+join([f,g])+'。各2要素を単一要素に分ける。'+
      '（2）②（併合）：各2要素は'+[ascending([b,c]),ascending([d,e]),ascending([f,g])].map(join).join('，')+
      '。左の単一要素と左側の2要素を併合して'+join(ascending([a,b,c]))+'，右側の二つを併合して'+join(ascending([d,e,f,g]))+
      '。最後に配列list '+join(ascending([a,b,c,d,e,f,g]))+'。';
  }},
  '8-programs':{caption:'〔プログラム〕',alt:()=>programSheets.map(codeText).join('\n\n')},
  ...codeOptions,
};
export type DrawingId=keyof typeof drawings;
export const drawingIds=Object.keys(drawings) as DrawingId[];
export const drawingCaption=(id:DrawingId)=>drawings[id].caption;
export const drawingAlt=(id:DrawingId,index:number)=>(drawings[id].alt as (index:number)=>string)(index);
export const profile=(id:DrawingId)=>'legacy-2010-spring-pm-'+id;
export const renderFigure=(id:DrawingId,index:number)=>figure(profile(id),[index],drawingCaption(id),drawingAlt(id,index));
export const legacy2010SpringPm0508Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id),domain:[[0,caseCount-1]],
  validate(values){try{caseIndex(values);}catch{throw new DataError('FIGURE_PROFILE','図と入力域が一致しません');}},
  alt(values){return drawingAlt(id,caseIndex(values));},
}));
