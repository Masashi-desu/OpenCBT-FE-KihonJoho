import { DataError } from '../errors';

/** Source-local transcription of QS physical 23–27, with the official physical-2 erratum. */
export const legacy2017AutumnPm5Pages = [23, 24, 25, 26, 27] as const;
export const legacy2017AutumnPm5ErratumAssetId = 'asset-ipa-2017h29a-fe-pm-5-erratum-p2';
export const legacy2017AutumnPm5Erratum = {
  before: '入金は，買上げ前に行うことができる。',
  after: '得意先は，入金を，買上げ前にも，買上げ後にも行うことができる。',
  locator: '公式正誤表：冊子22ページ（PDF物理23ページ）上から5行目',
} as const;

export function legacy2017AutumnPm5Variant(values: number[]) {
  if (!Array.isArray(values) || Object.getOwnPropertyNames(values).sort().join(',') !== '0,length' || Object.getOwnPropertySymbols(values).length)
    throw new DataError('GENERATION_PARAMETERS', '2017秋午後問5の条件は整数1個です');
  const descriptor = Object.getOwnPropertyDescriptor(values, '0');
  if (!descriptor || !Object.hasOwn(descriptor, 'value') || !Number.isSafeInteger(descriptor.value) || descriptor.value < 0 || descriptor.value > 3)
    throw new DataError('GENERATION_PARAMETERS', '2017秋午後問5の条件は0〜3です');
  return descriptor.value as number;
}

export const legacy2017AutumnPm5Table1 = [
  ['得意先', '得意先の情報'], ['商品', 'E社が取り扱う商品の情報'],
  ['買上げ', '1伝票単位の買上げ情報'], ['買上げ明細', '1伝票を構成する商品単位の買上げ情報'],
  ['月間買上げ', '得意先の月間買上げ額と，月間買上げ額に対して充当された金額（消込額）に関する情報'],
  ['入金', '得意先からの入金額と，その入金を月間買上げに充当した金額（充当額）に関する情報'],
  ['消込', 'ある入金からある月間買上げに対して，充当した金額（消込充当額）の情報'],
] as const;
export const legacy2017AutumnPm5Table2 = [
  ['月間買上げ', '月間買上げ額', 'ある得意先の，ある年月1か月分の買上げ金額'],
  ['月間買上げ', '消込額', '月間買上げ額のうち，既に充当された金額'],
  ['入金', '入金額', 'ある得意先から入金された金額'],
  ['入金', '充当額', '入金額のうち，月間買上げに既に充当した金額'],
  ['消込', '消込充当額', 'ある入金からある月間買上げに対して，消込み処理で充当した金額'],
] as const;

const keyVariants: string[][][] = [
  [['消込番号','月間買上げ番号'],['消込番号','入金番号'],['得意先ID','消込番号'],['得意先ID','月間買上げ番号'],['得意先ID','入金番号'],['入金番号','月間買上げ番号']],
  [['消込日','月間買上げ番号'],['消込日','入金番号'],['消込充当額','消込日'],['得意先ID','月間買上げ番号'],['得意先ID','入金番号'],['入金番号','月間買上げ番号']],
  [['消込充当額','月間買上げ番号'],['消込充当額','入金番号'],['得意先ID','消込日'],['消込日','月間買上げ番号'],['消込日','入金番号'],['入金番号','月間買上げ番号']],
  [['得意先ID','消込充当額'],['消込日','入金番号'],['消込充当額','消込日'],['消込充当額','月間買上げ番号'],['消込充当額','入金番号'],['入金番号','月間買上げ番号']],
];
const bVariants = [
  ['入金額＝充当額','入金額＞充当額','入金額＜充当額','充当額＝0'],
  ['入金額≧充当額','入金額＞充当額','入金額≦充当額','充当額＝0'],
  ['入金額＝充当額','入金額＞充当額','充当額＞0','充当額＝0'],
  ['入金額≧充当額','入金額＞充当額','充当額＞0','入金額＝充当額'],
];
const cVariants = [
  ['月間買上げ額＞0','月間買上げ額＞消込額','消込額＝0','消込額＞0','消込額＝月間買上げ額','消込額＞月間買上げ額'],
  ['月間買上げ額≧消込額','月間買上げ額＞消込額','消込額＝0','消込額＞0','消込額＝月間買上げ額','消込額≧月間買上げ額'],
  ['月間買上げ額＞0','月間買上げ額＞消込額','月間買上げ額＝消込額','消込額＞0','消込額≧月間買上げ額','消込額＝0'],
  ['月間買上げ額≧消込額','月間買上げ額＞消込額','消込額＞0','消込額＝0','消込額＝月間買上げ額','月間買上げ額＞0'],
];
const dVariants = [
  ['買上げ年月の降順','買上げ年月の昇順','消込額の降順','月間買上げ額の昇順','得意先IDの昇順'],
  ['買上げ年月の降順','買上げ年月の昇順','消込額の昇順','月間買上げ額の降順','得意先IDの降順'],
  ['買上げ年月の降順','買上げ年月の昇順','月間買上げ額の昇順','消込額の昇順','得意先IDの昇順'],
  ['買上げ年月の降順','買上げ年月の昇順','月間買上げ額の降順','消込額の降順','得意先IDの降順'],
];
export function legacy2017AutumnPm5Groups(values: number[]) {
  const v = legacy2017AutumnPm5Variant(values);
  return structuredClone({
    a: keyVariants[v], b: bVariants[v], c: cVariants[v], d: dVariants[v],
    ef: [
      '[月間買上げ].月間買上げ額＋[月間買上げ].消込額',
      '[月間買上げ].月間買上げ額−[月間買上げ].消込額',
      '[月間買上げ].消込額−[月間買上げ].月間買上げ額',
      '[入金].入金額＋[入金].充当額',
      '[入金].入金額−[入金].充当額',
      '[入金].充当額−[入金].入金額',
    ],
  });
}

export const legacy2017AutumnPm5Profiles = [
  'legacy-2017-autumn-pm5-selection', 'legacy-2017-autumn-pm5-er',
  'legacy-2017-autumn-pm5-table1', 'legacy-2017-autumn-pm5-table2',
  'legacy-2017-autumn-pm5-instruction1', 'legacy-2017-autumn-pm5-bank-a',
  'legacy-2017-autumn-pm5-instruction2', 'legacy-2017-autumn-pm5-flow',
  'legacy-2017-autumn-pm5-bank-b', 'legacy-2017-autumn-pm5-bank-c',
  'legacy-2017-autumn-pm5-bank-d', 'legacy-2017-autumn-pm5-bank-ef',
  'legacy-2017-autumn-pm5-description',
] as const;

export const legacy2017AutumnPm5Description = '図2中のαの部分では，入金表から［b］の条件を満たすレコードを，得意先IDの昇順，入金日の昇順に整列して取得する。消込み①の繰返し処理では，取得したレコードを順に処理する。βの部分では，消込み①の繰返しで処理中のレコードの得意先IDと同じ得意先IDをもつ月間買上げ表のレコードのうち，［c］の条件を満たすレコードを，［d］に整列して取得する。消込み②の繰返し処理では，取得したレコードを順に処理する。';

export const legacy2017AutumnPm5Flow = [
  ['start','開始'],
  ['select-payment','・入金表から，［b］の条件を満たすレコードを整列して取得する'],
  ['first-payment','・αで取得したレコードのうち先頭のものを[入金]とする'],
  ['payment-loop','消込み①\n[入金]がない'],
  ['select-month','・月間買上げ表から，[入金].得意先IDと同じ得意先IDをもち，［c］の条件を満たすレコードを整列して取得する'],
  ['first-month','・βで取得したレコードのうち先頭のものを[月間買上げ]とする'],
  ['payment-rest','・変数1 ← ［e］'],
  ['month-loop','消込み②\n[月間買上げ]がない'],
  ['month-rest','・変数2 ← ［f］'],
  ['compare','変数1 ＞ 変数2'],
  ['finish-month','・[月間買上げ].消込額 ← [月間買上げ].月間買上げ額\n・[月間買上げ]で月間買上げ表を更新する\n・[入金].充当額 ← [入金].充当額＋変数2\n・[入金]で入金表を更新する\n・消込表に，変数2の値を消込充当額として，消込みに使用した入金と月間買上げの情報をもつレコードを登録する\n・変数1 ← 変数1−変数2'],
  ['finish-payment','・[月間買上げ].消込額 ← [月間買上げ].消込額＋変数1\n・[月間買上げ]で月間買上げ表を更新する\n・[入金].充当額 ← [入金].入金額\n・[入金]で入金表を更新する\n・消込表に，変数1の値を消込充当額として，消込みに使用した入金と月間買上げの情報をもつレコードを登録する'],
  ['next-month','・βで取得したレコードのうち次のものを[月間買上げ]とする'],
  ['month-end','消込み②'],
  ['next-payment','・αで取得したレコードのうち次のものを[入金]とする'],
  ['payment-end','消込み①'], ['end','終了'],
] as const;

export function legacy2017AutumnPm5Figure(profile: string, values: number[]) {
  legacy2017AutumnPm5Variant(values);
  if (!(legacy2017AutumnPm5Profiles as readonly string[]).includes(profile)) throw new DataError('SOURCE_FIGURE', '問5の未登録作図です');
  const kind = profile.slice('legacy-2017-autumn-pm5-'.length), groups = legacy2017AutumnPm5Groups(values);
  const labels: Record<string,string> = {
    description:legacy2017AutumnPm5Description,
    selection:'選択した問題は，選択欄の（選）をマークしてください。マークがない場合は，採点されません。',
    er:'図1　関係データベースのE-R図', table1:'表1　各表の説明',table2:'表2　主な表の属性の説明',
    instruction1:'設問1　図1中の空欄に入れる属性の組みとして適切な答えを，解答群の中から選べ。',
    instruction2:'設問2　図2は，消込み処理の流れ図である。次の記述及び図2中の空欄に入れる適切な答えを，解答群の中から選べ。',
    'bank-a':'aに関する解答群','bank-b':'bに関する解答群','bank-c':'cに関する解答群','bank-d':'dに関する解答群','bank-ef':'e，fに関する解答群',flow:'図2　消込み処理の流れ図',
  };
  let text = labels[kind];
  if (kind==='table1') text+='。'+legacy2017AutumnPm5Table1.map(r=>r.join('：')).join('。');
  if (kind==='table2') text+='。'+legacy2017AutumnPm5Table2.map(r=>r.join('：')).join('。');
  if (kind.startsWith('bank-')) {
    const key=kind.slice(5) as keyof typeof groups;
    text+='。'+groups[key].map((x,i)=>'アイウエオカ'[i]+' '+(Array.isArray(x)?x.join('，'):x)).join('。');
  }
  if (kind==='er') text+='。7表：消込（a，消込充当額，消込日），入金（主キー入金番号，得意先ID，入金額，入金日，充当額），商品（主キー商品コード，商品名，単価），月間買上げ（主キー月間買上げ番号，得意先ID，買上げ年月，月間買上げ額，消込額），得意先（主キー得意先ID，得意先名，住所，電話番号），買上げ（主キー買上げ伝票番号，買上げ日，得意先ID，月間買上げ番号），買上げ明細（複合主キー買上げ伝票番号と明細番号，商品コード，数量，買上げ金額）。矢印は1対多を示す。得意先→入金/月間買上げ/買上げ，入金→消込，月間買上げ→消込/買上げ，商品→買上げ明細，買上げ→買上げ明細。属性名の実線の下線は主キーを示す。';
  if (kind==='flow') text+='。'+legacy2017AutumnPm5Flow.map(x=>x[1]).join('。')+'。αは入金選択，βは月間買上げ選択を指す。[X]はX表の処理中のレコード，[X].Yはその属性を表す。';
  return {kind,caption:labels[kind],alt:text,groups};
}
