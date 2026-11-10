import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure, table, type GeneratedBody } from './definition';
import { applicantModel, bitModel, investmentModel, progressModel, spring2012Pm0508Case } from './legacy-2012-spring-pm-05-08-model';
import { answerBanks, discountText, signed } from './legacy-2012-spring-pm-05-08-source';

export const spring2012Pm0508Profile = (id: string) => 'legacy-2012-spring-pm-' + id;
export const masked = '（網掛けの非表示部分）';
export const maskNote = '注記　網掛けの部分は表示していない。';
export const pvNote = '現在価値は小数第2位を四捨五入している。';
export const applicantFields = ['受験番号','姓','名','学校コード','高校卒業年度'];
export const schoolFields = ['学校コード','学校名'];
export const recordLayouts = {
  'ファイル1，2': ['学校\nコード','受験者数'],
  'ファイル3，4': ['学校\nコード','今年度\n受験者数','前年度\n受験者数'],
  'ファイル5': ['学校\nコード','順位','今年度\n受験者数','前年度\n受験者数'],
  'ファイル8': ['学校\nコード','順位','受験者数'],
  'ファイル11': ['学校\nコード','今年度\n順位','今年度\n受験者数','前年度\n順位','前年度\n受験者数'],
} as const;
export const applicantFlow = (extra:boolean) => {
  const prior = extra ? ['前年度受験者','処理1','ファイルX','処理2','ファイルY','処理3','ファイルZ','処理4','ファイル8']
    : ['前年度受験者','集計','ファイル2'];
  const merged = extra ? ['突合せ','ファイル9','整列','ファイル10','順位付け','ファイル11','リスト作成','出身校リスト2']
    : ['突合せ','ファイル3','整列','ファイル4','順位付け','ファイル5','リスト作成','出身校リスト'];
  const layouts = extra ? ['ファイル8','ファイル11'] as const : ['ファイル1，2','ファイル3，4','ファイル5'] as const;
  return { prior, merged, layouts };
};
const flowAlt = (extra: boolean) => {
  const {prior, merged, layouts} = applicantFlow(extra);
  return '今年度受験者→集計→ファイル1。' + prior.join('→') + '。ファイル1と' + prior.at(-1) +
    'を突合せに入力する。' + merged.join('→') + '。リスト作成への入力は指定順位，' + merged[5] + '，学校名。\n' +
    layouts.map(name => name + 'のレコード様式：' + recordLayouts[name].map(field => field.replace('\n','')).join('｜')).join('\n');
};
export const applicantHeaders = (extra: boolean) => ['順位','学校名','今年度受験者数',...(extra ? ['前年度順位'] : []),'前年度受験者数'];
export const applicantList = (index: number, extra: boolean) => ({
  type:'table' as const, caption:extra ? '図5 出身校リスト2の例' : '図2 出身校リストの例',
  columns:applicantHeaders(extra), rows:applicantModel(index).data(extra),
  captionPresentation:'accessible' as const,
  sourceLabels:[{text:'出身校別受験者数リスト'+(extra?'2':''),position:'top-center' as const}],
});

export const investmentRows = [
  ['投資額','investment'], ['減価償却費','depreciation'], ['コスト削減額','saving'], ['法人税額','tax'],
  ['税引き後効果','afterTax'], ['投資後効果','effect'], ['割引率','discount'], ['現在価値','pv'], ['NPV','npv'],
] as const;
export function investmentTable(index: number, mode: 'lump' | 'split') {
  const f = investmentModel(index);
  const values = mode === 'lump' ? f.lumpRows : f.splitRows;
  return investmentRows.map(([label, field]) => [label, ...values.map((row, i) => {
    if (mode === 'lump' && i === 1 && ['effect','discount','pv'].includes(field)) return '［b］';
    if (mode === 'split' && i === 3 && ['depreciation','saving','tax','afterTax'].includes(field)) return '［c］';
    if (field === 'investment' && row[field] === 0) return '';
    if (field === 'npv') return i !== 0 ? '' : mode === 'split' ? masked : signed(f.lumpNpv);
    if (field === 'discount') return discountText(f.discount);
    if (mode === 'lump' && i > 0 && ['effect','pv'].includes(field)) return masked;
    if (mode === 'split' && i > 0 && field === 'effect') return masked;
    return signed(row[field]);
  })]);
}
export const depreciationTable = (index: number) => {
  const model = investmentModel(index);
  return { type:'table' as const, caption:'表3 減価償却期間を5年に変更したときの表1の各年の減価償却費',
    columns:['年',...model.years.map(String)], rows:[['減価償却費',...model.longRows.map(row=>String(row.depreciation))]],
    captionPresentation:'accessible' as const,
    sourceLabels:[{text:'単位　百万円',position:'top-end' as const}] };
};

export const progressPlanColumns = ['設計分担','メンバ',...[1,2,3].flatMap(week => ['第'+week+'週 計画工数（時間）','第'+week+'週 計画進捗率（％）']),'計画工数の総合計（時間）'];
export const progressActualColumns = ['設計分担','メンバ','計画工数の総合計',...[1,2].flatMap(week =>
  ['第'+week+'週の週末時点 実績工数の累積','第'+week+'週の週末時点 残り工数'])];
const rowsAlt = (rows: readonly (readonly string[])[]) => rows.map(row => row.join('｜')).join('\n');

export type ProgramLine = { text: string; cost?: number; alpha?: boolean };
const line = (text:string,cost?:number,alpha?:boolean): ProgramLine => ({text,cost,alpha});
const oneBody = [
  line('▲ ［a］'),line('│ ・RC ← 2                  /* 返却値は2 */'),line('├────────'),
  line('│ ▲ ［b］'),line('│ │ ・RC ← 0                /* 返却値は0 */'),line('│ ├────────'),
  line('│ │ ・RC ← 1                /* 返却値は1 */'),line('│ ▼'),line('▼'),
  line('・return RC                 /* RCを返却値として返す */'),
];
export const programOne = [
  line('○整数型関数：BitTest（8ビット論理型：Data，8ビット論理型：Mask）'),
  line('○整数型：RC                 /* 返却値 */'), ...oneBody,
];
export function programTwo(index: number) {
  const [copy,init,loop,test,add,shift,ret] = bitModel(index).two;
  return [
    line('○整数型関数：BitCount（8ビット論理型：Data）'),line('○8ビット論理型：Work'),line('○整数型：Count, Loop'),
    line('・Work ← Data',copy),line('・Count ← 0',init),line('■ Loop: 0, Loop ＜ 8, 1',loop),
    line('│ ▲ Workの最下位ビットが1',test),line('│ │ ・Count ← Count ＋ 1',add),line('│ ▼'),
    line('│ ・Workを右へ1ビット論理シフトする',shift),line('■'),
    line('・return Count              /* Countを返却値として返す */',ret),
  ];
}
export function programThree(index: number) {
  const [copy,init,loop,add,clear,ret] = bitModel(index).three;
  return [
    line('○整数型関数：BitCount（8ビット論理型：Data）'),line('○8ビット論理型：Work'),line('○整数型：Count'),
    line('・Work ← Data',copy),line('・Count ← 0',init),line('■ Work中に1のビットがある',loop),
    line('│ ・Count ← Count ＋ 1',add),line('│ ・Work ← Work & (Work − 1)',clear,true),line('■'),
    line('・return Count              /* Countを返却値として返す */',ret),
  ];
}
export const fixes = [
  { title:'修正案①（変更なし）', lines:oneBody.map(row=>line(row.text.split('/*')[0].trimEnd())) },
  { title:'修正案②', lines:[line('▲ ［b］'),line('│ ・RC ← 0'),line('├────────'),line('│ ▲ ［a］'),
    line('│ │ ・RC ← 2'),line('│ ├────────'),line('│ │ ・RC ← 1'),line('│ ▼'),line('▼'),line('・return RC')] },
  { title:'修正案③', lines:[line('・RC ← 1'),line('▲ ［b］'),line('│ ・RC ← 0'),line('▼'),
    line('▲ ［a］'),line('│ ・RC ← 2'),line('▼'),line('・return RC')] },
] as const;

export const programAlt = (rows: readonly ProgramLine[]) => rows.map(row =>
  (row.cost === undefined ? '' : '処理量' + row.cost + '　') + row.text + (row.alpha ? '　← α' : '')).join('\n');
export const bitExamples = (index:number) => bitModel(index).samples.map(([data,mask]) => {
  const positions = [...mask].flatMap((bit, i) => bit === '1' ? [7 - i] : []);
  const selected = positions.map(i => data[7-i]).join('');
  const result = selected.includes('0') ? selected.includes('1') ? 1 : 0 : 2;
  return { data, mask, positions, result };
});
export const bitCostTable = (index:number) => {
  const bits = bitModel(index);
  return table('表1 プログラム2，3の処理量の比較', ['','最小','最大'], [
    ['プログラム2',String(bits.min2),'［d］'], ['プログラム3','［e］',String(bits.max3)],
  ]);
};

export const drawings = {
  '5-applicant-record': { caption:'図1 今年度受験者ファイル及び前年度受験者ファイルのレコード様式', alt:()=>applicantFields.join('｜') },
  '5-school-record': { caption:'図3 学校名ファイルのレコード様式', alt:()=>schoolFields.join('｜') },
  '5-flow': { caption:'図4 出身校リスト作成処理の流れと各ファイルのレコード様式', alt:()=>flowAlt(false) },
  '5-match-table': { caption:'表1 突合せ処理での出力レコードの各項目の内容', alt:()=>
    'レコードの有無：ファイル1｜ファイル2。出力：学校コード｜今年度受験者数｜前年度受験者数。\n' +
    'あり｜あり｜網掛け｜網掛け｜網掛け\nあり｜なし｜網掛け｜［a：今年度受験者数，前年度受験者数の2列］\n' +
    'なし｜あり｜［b：学校コード，今年度受験者数の2列］｜網掛け\n' + maskNote },
  '5-flow-extra': { caption:'図6 出身校リスト2作成処理の流れと主なファイルのレコード様式', alt:()=>flowAlt(true) },
  '6-plan-table': { caption:'表1 設計工程におけるメンバ別の設計分担，計画工数及び計画進捗率',
    alt:(i:number)=>rowsAlt([progressPlanColumns, ...progressModel(i).planRows]) },
  '6-actual-table': { caption:'表2 各メンバの実績工数及び残り工数',
    alt:(i:number)=>'単位　時間\n'+rowsAlt([progressActualColumns, ...progressModel(i).actualRows]) },
  '7-lump-table': { caption:'表1 一括投資する場合の生産管理システム導入のNPV計算',
    alt:(i:number)=>'単位　百万円\n'+rowsAlt([['年',...investmentModel(i).years.map(String)], ...investmentTable(i,'lump')])+'\n'+maskNote+'\n'+pvNote },
  '7-split-table': { caption:'表2 分割投資する場合の生産管理システム導入のNPV計算',
    alt:(i:number)=>'単位　百万円\n'+rowsAlt([['年',...investmentModel(i).years.map(String)], ...investmentTable(i,'split')])+'\n'+maskNote+'\n'+pvNote },
  '8-examples': { caption:'図1 BitTestの実行例', alt:(i:number)=>bitExamples(i).map(({data,mask,positions,result},j) =>
    '例'+(j+1)+'。ビット番号7 6 5 4 3 2 1 0。Data '+data+'，Mask '+mask+'。対応線の位置：'+positions.join('，')+'。返却値 '+result+'。').join('\n') },
  '8-program-one': { caption:'〔プログラム1〕', alt:()=>programAlt(programOne) },
  '8-program-two': { caption:'〔プログラム2〕', alt:(i:number)=>programAlt(programTwo(i)) },
  '8-program-three': { caption:'〔プログラム3〕', alt:(i:number)=>programAlt(programThree(i)) },
  '8-fix-options': { caption:'プログラム1の処理部分の修正案', alt:()=>fixes.map(({title,lines})=>title+'\n'+programAlt(lines)).join('\n\n') },
} as const;
export type DrawingId = keyof typeof drawings;
export const drawingIds = Object.keys(drawings) as DrawingId[];
const optionDrawings = {
  '5-ab-option': { bank:'5ab', count:7, caption:'突合せ処理の候補' },
  '7-b-option': { bank:'7b', count:8, caption:'投資後効果・割引率・現在価値の候補' },
  '7-c-option': { bank:'7c', count:4, caption:'減価償却費・コスト削減額・法人税額・税引き後効果の候補' },
} as const;
export type OptionDrawingId = keyof typeof optionDrawings;
export const optionDrawingIds = Object.keys(optionDrawings) as OptionDrawingId[];
export const optionCells = (id: OptionDrawingId, index:number, option:number) =>
  answerBanks(index)[optionDrawings[id].bank][option].split('｜');

export function spring2012Pm0508Figure(id: DrawingId, index:number) {
  const {caption,alt} = drawings[id];
  return figure(spring2012Pm0508Profile(id), [index], caption, alt(index));
}
export function spring2012Pm0508Option(id: OptionDrawingId, index:number, option:number): GeneratedBody['prompt'][number] {
  const result = figure(spring2012Pm0508Profile(id), [index,option], optionDrawings[id].caption, optionCells(id,index,option).join('｜'));
  return { ...result, captionPresentation:'accessible' } as typeof result;
}
export const legacy2012SpringPm0508Figures: readonly BookletFigureDefinition[] = [
  ...drawingIds.map(id => ({
    profile:spring2012Pm0508Profile(id), domain:[[0,3] as const], validate(values:number[]) {spring2012Pm0508Case(values);},
    alt:([index]:number[])=>drawings[id].alt(index),
  })),
  ...optionDrawingIds.map(id => ({
    profile:spring2012Pm0508Profile(id), domain:[[0,3] as const,[0,optionDrawings[id].count-1] as const],
    validate(values:number[]) {
      if (values.length!==2 || !Number.isInteger(values[1]) || values[1]<0 || values[1]>=optionDrawings[id].count)
        throw Error('FIGURE_PROFILE');
      spring2012Pm0508Case([values[0]]);
    },
    alt:([index,option]:number[])=>optionCells(id,index,option).join('｜'),
  })),
];
