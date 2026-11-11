import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { caseCount, caseIndex, combinationAt } from './legacy-2011-special-pm-05-08-model';

export const files = [
  ['顧客マスタファイル',['顧客番号','顧客住所','顧客氏名']],
  ['売上伝票ファイル',['購入日付','顧客番号','商品コード','購入個数','購入金額']],
  ['あて先ファイル',['顧客番号','顧客住所','顧客氏名','応募券枚数','招待券枚数','購入金額合計']],
] as const;

export const reportLabels = ['懸賞応募券総枚数','催物招待券総枚数','あて先ファイルレコード件数'] as const;
type Line = { text: string; depth?: number; kind?: 'step' | 'declaration'; comment?: string };
type Rail = { depth: number; start: number; end: number; kind: 'loop' | 'branch'; divider?: number };
type Sheet = { lines: readonly Line[]; rails: readonly Rail[]; alpha?: boolean };
const step = (text: string, depth = 0, comment?: string): Line => ({ text,depth,kind:'step',comment });
const declaration = (text: string, comment?: string): Line => ({ text,kind:'declaration',comment });
const control = (text: string, depth = 0): Line => ({ text,depth });
const gap: Line = {text:''};
export const init = 'R ← Init(S, N, K)', next = 'R ← Next(S, N)', dump = 'Dump(S, N)';
export const programs = (index:number): readonly Sheet[] => {
  const {n,k} = combinationAt(index);
  return [
    { alpha:true, lines:[
      declaration('主プログラム: Main'),declaration('整数型: S['+n+'], K, N, R','/*  1 ≦ K ≦ N  */'),
      step('K ← '+k,0,'/*  選択する要素の個数  */'),step('N ← '+n,0,'/*  要素の個数  */'),
      step(init),control('R = 0'),step(next,1),gap,
    ],rails:[{depth:0,start:5,end:7,kind:'loop'}]},
    { lines:[
      declaration('整数型関数: Init(整数型: S[], 整数型: N, 整数型: K)'),declaration('整数型: L'),
      control('1 ≦ K and K ≦ N'),control('L: 1, L ≦ N, 1',1),control('L ≦ K',2),
      step('S[L] ← 1',3),gap,step('S[L] ← 0',3),gap,gap,step('return 0',1),gap,step('return -1',1),gap,
    ],rails:[{depth:0,start:2,divider:11,end:13,kind:'branch'},{depth:1,start:3,end:9,kind:'loop'},
      {depth:2,start:4,divider:6,end:8,kind:'branch'}]},
    { lines:[
      declaration('整数型関数: Next(整数型: S[], 整数型: N)'),declaration('整数型: C, L, R'),
      step('C ← 0'),step('L ← 1'),step('R ← -1'),control('L ＜ N and R = -1'),control('S[L] = 1',1),
      control('S[L+1] = 0',2),step('S[L] ← 0',3),step('S[L+1] ← 1',3),step('Init(S, L-1, C)',3),step('R ← 0',3),
      gap,step('C ← C + 1',3),gap,gap,step('L ← L + 1',1),gap,step('return R'),
    ],rails:[{depth:0,start:5,end:17,kind:'loop'},{depth:1,start:6,end:15,kind:'branch'},
      {depth:2,start:7,divider:12,end:14,kind:'branch'}]},
  ];
};

export const answerPrograms: readonly Sheet[] = [
  {lines:[step(init),control('R = 0'),step(dump,1),step(next,1),gap],rails:[{depth:0,start:1,end:4,kind:'loop'}]},
  {lines:[step(init),control('R = 0'),step(next,1),step(dump,1),gap],rails:[{depth:0,start:1,end:4,kind:'loop'}]},
  {lines:[step(init),step(dump),control('R = 0'),step(next,1),step(dump,1),gap],rails:[{depth:0,start:2,end:5,kind:'loop'}]},
  {lines:[step(init),control('R = 0'),step(dump,1),step(next,1),gap,step(dump)],rails:[{depth:0,start:1,end:4,kind:'loop'}]},
];
export const bitText = (array: readonly number[]) => array.join('，');
export const codeText = ({lines,rails,alpha}: Sheet) => lines.map((line,i) => {
  const starts = rails.find(rail => rail.start===i), ends = rails.find(rail => rail.end===i), divides = rails.find(rail => rail.divider===i);
  const depth = starts?.depth ?? ends?.depth ?? divides?.depth ?? line.depth ?? 0;
  const sign = starts ? (starts.kind==='loop'?'■ ':'▲ ') : ends ? (ends.kind==='loop'?'■':'▼') :
    divides ? '─' : line.kind==='declaration' ? '○' : line.kind==='step' ? '・' : '';
  return '  '.repeat(depth) + sign + line.text + (line.comment ? '    '+line.comment : '') +
    (alpha && i===4?'  （ここからα）':alpha && i===7?'  （ここまでα）':'');
}).join('\n');

const optionLetters = 'アイウエ';
export const drawings = {
  '5-files': { caption:'図1　各ファイルのレコード様式', alt:() => files.map(([name,fields]) => name+'：'+fields.join('｜')).join('\n') },
  '5-input-output': { caption:'図2　あて先作成プログラムの入出力関連', alt:() =>
    '売上伝票ファイル→整列→作業ファイル。作業ファイルと顧客マスタファイルをあて先作成に入力する。あて先作成からあて先ファイルと合計表を出力する。' },
  '5-flow': { caption:'図3　あて先作成プログラムの流れ', alt:() =>
    'あて先作成：初期処理→主処理→終了処理→終了。\n主処理：繰返し1（終了条件α）。前処理→顧客処理→判断［a］。Yesなら招待券処理，Noなら招待券処理を飛ばす。続けて判断［b］。Yesならあて先処理，Noならあて先処理を飛ばす。繰返し1の末尾→終了。\n顧客処理：繰返し2（終了条件β）。金額集計処理→判断（網掛けで非表示）。Yesなら応募券処理，Noなら応募券処理を飛ばす。売上伝票処理→繰返し2の末尾→終了。\n注　網掛けの部分は，表示していない。' },
  '5-output': { caption:'図4　表2のテストデータを用いた場合の合計表の出力結果', alt:() =>
    '合計表。'+reportLabels[0]+'は網掛け，'+reportLabels[1]+'は［c］，'+reportLabels[2]+'は［d］。\n注　網掛けの部分は，表示していない。' },
  '7-matrix-example': { caption:'表3　利得行列', alt:() =>
    '行はプレイヤAの戦略A-1，戦略A-2。列はプレイヤBの戦略B-1，戦略B-2。四つのセルに（プレイヤAの利得，プレイヤBの利得）の順で表示。戦略A-1と戦略B-1のセルだけが網掛け。' },
  '8-bits': { caption:'要素の選択と配列S', alt:(index:number) => {
    const {n,k,selected} = combinationAt(index);
    return '(1) 要素番号1～'+n+'のうち'+selected.join('，')+'を選択。\n(2) 要素番号1～'+n+'の配列Sは'+
      bitText(Array.from({length:n},(_,i)=>Number(selected.includes(i+1))))+'。\n図1　'+n+'個の要素中から'+k+'個の要素を選ぶ例とそのプログラム中での表現';
  } },
  '8-code': { caption:'〔プログラム〕', alt:(index:number) => programs(index).map(codeText).join('\n\n') },
  '8-option-a': { caption:'aに関する解答群 ア', alt:() => codeText(answerPrograms[0]) },
  '8-option-i': { caption:'aに関する解答群 イ', alt:() => codeText(answerPrograms[1]) },
  '8-option-u': { caption:'aに関する解答群 ウ', alt:() => codeText(answerPrograms[2]) },
  '8-option-e': { caption:'aに関する解答群 エ', alt:() => codeText(answerPrograms[3]) },
};
export type DrawingId = keyof typeof drawings;
export const drawingIds = Object.keys(drawings) as DrawingId[];
export const optionIds = ['8-option-a','8-option-i','8-option-u','8-option-e'] as const;
export const drawingAlt = (id: DrawingId,index:number) => (drawings[id].alt as (index:number)=>string)(index);
export const profile = (id:DrawingId) => 'legacy-2011-special-pm-'+id;
const caption = (id:DrawingId,index:number) => {
  if(id!=='8-bits') return drawings[id].caption;
  const {n,k}=combinationAt(index);
  return '図1　'+n+'個の要素中から'+k+'個の要素を選ぶ例とそのプログラム中での表現';
};
export const renderFigure = (id:DrawingId,index:number) => figure(profile(id),[index],caption(id,index),drawingAlt(id,index));
export const answerProgramAlts = optionIds.map((id,i) => optionLetters[i]+'　'+drawingAlt(id,0));
export const legacy2011SpecialPm0508Figures: readonly BookletFigureDefinition[] = drawingIds.map(id=>({
  profile:profile(id),domain:[[0,caseCount-1]],
  validate(values) {
    try { caseIndex(values); } catch { throw new DataError('FIGURE_PROFILE','図と入力域が一致しません'); }
  },
  alt(values) { return drawingAlt(id,caseIndex(values)); },
}));
