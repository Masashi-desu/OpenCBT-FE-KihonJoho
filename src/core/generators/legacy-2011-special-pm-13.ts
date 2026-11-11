import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2011-special-pm-09-13-support';
import { special2011PmPageAssetId, special2011PmReference } from './legacy-2011-special-pm-materials';

const levels = ['取引停止', '慎重', '現状維持', '積極', '最優先'];
const thresholds = [
  [[0, 90, 130, 150, 200], [0, 5, 20, 40, 70]],
  [[0, 95, 125, 145, 190], [0, 10, 25, 45, 65]],
  [[0, 90, 140, 160, 210], [0, 8, 22, 44, 68]],
  [[0, 95, 135, 155, 205], [0, 6, 24, 42, 72]],
];
const coefficients = [[0, 0.5, 1, 1.5, 2], [0, 0.2, 0.5, 1, 1.5]];
const payments = [
  [0, 0, 0, 0, 0], [0, 0, 1, 2, 2], [0, 1, 2, 2, 2], [0, 2, 2, 3, 3], [0, 2, 2, 3, 3],
];
const finance = [
  [1, 491, 351, 60, 497, 2438, 2212, 2543, 2611],
  [2, 1011, 742, 275, 553, 121806, 75058, 29972, 50346],
  [3, 855, 680, 301, 818, 23169, 36507, 31572, 47483],
  [4, 587, 800, 50, 211, 0, 0, 0, 0],
  [5, 1347, 976, 292, 706, 93930, 1894, 75405, 50346],
  [17, 2330, 1900, 200, 397, 60896, 46210, 82942, 98770],
  [18, 1829, 1722, 267, 852, 24811, 19113, 14800, 93530],
  [19, 433, 380, 310, 1087, 7979, 3333, 5221, 2403],
  [20, 739, 532, 444, 1167, 77803, 30729, 38580, 81151],
  [21, 543, 489, 59, 430, 5216, 4610, 2675, 10400],
];
export function creditCase(index: number) {
  const rows = finance.map(([id, current, liabilities, equity, capital, previous, two, three, order]) => ({
    id: 'K' + id, row: id + 2 + index,
    current: current + index * (2 * id + 13), liabilities, equity: equity + index * (id + 4), capital,
    sales: [previous, two, three].map((value, position) => value > 0 ? value + index * (id + position + 1) * 10 : 0),
    order: order > 0 ? order + index * id * 17 : 0,
  }));
  const terms = payments.map((row, i) => row.map((value, j) =>
    index > 0 && i === 1 && j === 3 ? 1 : index > 1 && i === 2 && j === 4 ? 3 : value));
  return { rows, terms, thresholds: thresholds[index], coefficients, rowShift: index };
}
const fmt = (value: number) => value.toLocaleString('ja-JP');
function levelIndex(value: number, bounds: number[]) { return bounds.filter(bound => bound <= value).length - 1; }
function bands(bounds: number[]) {
  return bounds.map((min, i) => i === 0 ? bounds[1] + '％未満' : i === 4 ? min + '％以上' : min + '～' + bounds[i + 1] + '％未満');
}
function computedRows(index: number) {
  const spec = creditCase(index);
  return spec.rows.map(row => {
    const r1 = Number((100 * row.current / row.liabilities).toFixed(1));
    const r2 = Number((100 * row.equity / row.capital).toFixed(1));
    const i1 = levelIndex(r1, spec.thresholds[0]), i2 = levelIndex(r2, spec.thresholds[1]);
    const limit1 = Math.round((row.current - row.liabilities) * spec.coefficients[0][i1] * 1000) || 0;
    const limit2 = Math.round(row.equity * spec.coefficients[1][i2] * 1000);
    const limit = Math.max(0, Math.min(limit1, limit2));
    const months = spec.terms[i1][i2];
    const balance = row.sales.slice(0, months).reduce((sum, sale) => sum + sale, 0);
    return { ...row, r1, r2, i1, i2, limit1, limit2, limit, months, balance, allowed: limit > 0 && balance + row.order <= limit };
  });
}
const dots = (size: number, labels: Record<number, string> = {}) => Array.from({ length: size }, (_, i) => labels[i] ?? '⋮');
function showOmission<T>(items: T[], placeholder: T) {
  return [...items.slice(0, 5), placeholder, ...items.slice(5)];
}

export const ratingTable = languageFigure(13, 'credit-criteria', '表1　取引先の信用度の評価と与信枠の計算式', index => {
  const spec = creditCase(index);
  const formulas = [
    ['0', '（流動資産－流動負債）×0.5', '（流動資産－流動負債）×1', '（流動資産－流動負債）×1.5', '（流動資産－流動負債）×2'],
    ['0', '自己資本×0.2', '自己資本×0.5', '自己資本×1', '自己資本×1.5'],
  ];
  return { kind: 'tables', tables: [{ headers: ['評価指標', '', 'レベル', '信用度', '与信枠の計算式'],
    rows: spec.thresholds.flatMap((bounds, rule) => bands(bounds).map((band, i) => [
      i === 0 ? '基準' + (rule + 1) : '', i === 0 ? (rule === 0 ? '流動比率' : '自己資本比率') : '', band, levels[i], formulas[rule][i],
    ])),
    merges: [0, 5].flatMap(row => [0, 1].map(column => ({ row, column, rowSpan: 5, colSpan: 1 }))),
  }] };
});
export const siteTable = languageFigure(13, 'payment-terms', '表2　信用度に基づく支払いサイト', index => ({
  kind: 'tables', note: '単位　月数', tables: [{ headers: ['基準1＼基準2', ...levels], rows:
    creditCase(index).terms.map((row, i) => [levels[i], ...row.map((value, j) => i && j ? String(value) : '－')]) }],
}));
export const ratingSheet = languageFigure(13, 'rating-worksheet', '図1　ワークシート“信用度評価基準”', index => {
  const spec = creditCase(index);
  return { kind: 'tables', tables: [{ headers: ['', 'A', 'B', 'C', 'D', 'E', 'F'], rows: [
    [String(1 + index), '評価指標', '', 'レベル', '下限値（％）', '信用度', '与信枠係数'],
    ...spec.thresholds.flatMap((bounds, rule) => bands(bounds).map((band, i) => [
      String(2 + index + rule * 5 + i), i === 0 ? '基準' + (rule + 1) : '',
      i === 0 ? (rule === 0 ? '流動比率' : '自己資本比率') : '', band,
      String(bounds[i]), levels[i], spec.coefficients[rule][i].toFixed(1),
    ]))],
    merges: [{ row: 0, column: 1, rowSpan: 1, colSpan: 2 },
      ...[1, 6].flatMap(row => [1, 2].map(column => ({ row, column, rowSpan: 5, colSpan: 1 })))],
  }] };
});
export const limitSheet = languageFigure(13, 'limit-worksheet', '図2　ワークシート“与信枠”', index => {
  const rows = computedRows(index).map(row => [
    String(row.row), row.id, fmt(row.current), fmt(row.liabilities), row.r1.toFixed(1),
    fmt(row.equity), fmt(row.capital), row.r2.toFixed(1), levels[row.i1], levels[row.i2], fmt(row.limit1), fmt(row.limit2), fmt(row.limit),
  ]);
  return { kind: 'tables', tables: [{ headers: ['', ...'ABCDEFGHIJKL'], rows: [
    [String(1 + index), '取引先', '財務データ', '', '', '', '', '', '信用度', '', '計算値（千円）', '', '与信枠（千円）'],
    [String(2 + index), '', '流動資産\n（百万円）', '流動負債\n（百万円）', '流動比率\n（％）', '自己資本\n（百万円）', '総資本\n（百万円）', '自己資本比率\n（％）',
      '基準1', '基準2', '基準1での計算値', '基準2での計算値', ''],
    ...showOmission(rows, dots(13)),
  ], merges: [
    { row: 0, column: 1, rowSpan: 2, colSpan: 1 }, { row: 0, column: 2, rowSpan: 1, colSpan: 6 },
    { row: 0, column: 8, rowSpan: 1, colSpan: 2 }, { row: 0, column: 10, rowSpan: 1, colSpan: 2 }, { row: 0, column: 12, rowSpan: 2, colSpan: 1 },
  ] }] };
});
export const paymentSheet = languageFigure(13, 'payment-worksheet', '図3　ワークシート“支払いサイト”', index => ({
  kind: 'tables', tables: [{ headers: ['', ...'ABCDEF'], rows: [
    [String(1 + index), '基準1＼基準2', ...levels],
    ...creditCase(index).terms.map((row, i) => [String(2 + index + i), levels[i], ...row.map(String)]),
  ] }],
}));
export const managementSheet = languageFigure(13, 'management-worksheet', '図4　ワークシート“与信管理”', index => {
  const rows = computedRows(index).map(row => [
    String(row.row), row.id, '…', levels[row.i1], levels[row.i2], '…', fmt(row.limit), String(row.months),
    ...row.sales.map(fmt), fmt(row.balance), fmt(row.order), row.allowed ? '○' : '×',
  ]);
  return { kind: 'tables', tables: [{ headers: ['', 'A', '…', 'H', 'I', '…', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'], rows: [
    [String(1 + index), '取引先', '…', '信用度', '', '…', '与信枠\n（千円）', '支払いサイト\n（月数）',
      '前月売上\n（千円）', '2か月前売上\n（千円）', '3か月前売上\n（千円）', '受注可否判定', '', ''],
    [String(2 + index), '', '…', '基準1', '基準2', '…', '', '', '1', '2', '3', '前月売掛残\n（千円）', '当月注文額\n（千円）', '判定結果'],
    ...showOmission(rows, dots(14, { 2: '…', 5: '…' })),
  ], merges: [
    { row: 0, column: 1, rowSpan: 2, colSpan: 1 }, { row: 0, column: 3, rowSpan: 1, colSpan: 2 },
    { row: 0, column: 6, rowSpan: 2, colSpan: 1 }, { row: 0, column: 7, rowSpan: 2, colSpan: 1 },
    { row: 0, column: 11, rowSpan: 1, colSpan: 3 },
  ] }] };
});

const functionsVertical = '範囲の左端列を上から下に走査し，検索の指定によって指定される条件を満たすセルが現れる最初の行を探す。その行に対して，範囲の左端列から列を1，2，…と数え，範囲に含まれる列の位置で指定した列にあるセルの値を返す。\n・検索の指定が0の場合の条件：式の値と一致する値を検索する。\n・検索の指定が1の場合の条件：式の値以下の最大値を検索する。このとき，左端列は上から順に昇順に整列されている必要がある。';
const functionNotes = [
  ['水平照合（式，範囲，行の位置，検索の指定）', '範囲の上端行を左から右に走査し，検索の指定によって指定される条件を満たすセルが現れる最初の列を探す。その列に対して，範囲の上端行から行を1，2，…と数え，範囲に含まれる行の位置で指定した行にあるセルの値を返す。\n・検索の指定が0の場合の条件：式の値と一致する値を検索する。\n・検索の指定が1の場合の条件：式の値以下の最大値を検索する。このとき，上端行は左から順に昇順に整列されている必要がある。'],
  ['表引き（範囲，行の位置，列の位置）', '範囲の左上端から行と列をそれぞれ1，2，…と数え，範囲に含まれる行の位置と列の位置で指定した場所にあるセルの値を返す。'],
  ['照合一致（式，範囲，検索の指定）', '1行又は1列を対象とする範囲に対して，範囲の左端又は上端から走査し，検索の指定によって指定される条件を満たす最初のセルを探す。範囲の左端又は上端から1，2，…と数え，範囲の中で見つかったセルの位置の数を返す。\n・検索の指定が0の場合の条件：式の値と一致する値を検索する。\n・検索の指定が1の場合の条件：式の値以下の最大値を検索する。このとき，範囲は左端又は上端から順に昇順に整列されている必要がある。\n・検索の指定が－1の場合の条件：式の値以上の最小値を検索する。このとき，範囲は左端又は上端から順に降順に整列されている必要がある。'],
  ['条件付合計（検索の範囲，検索条件の記述，合計の範囲）', '行数及び列数がともに同じ大きさの検索の範囲及び合計の範囲に対して，検索と合計を行う。検索の範囲に含まれるセルのうち，検索条件の記述で指定される条件を満たすセルをすべて探す。検索条件の記述を満たした各セルを左上端から数えた位置と，合計の範囲中で同じ位置にある各セルの値を合計して返す。\n検索条件の記述は比較演算子と式の組で記述し，検索の範囲に含まれる各セルと式の値を，指定した比較演算子によって評価する。'],
];
export const verticalTable = languageFigure(13, 'vertical-functions', '表3　ワークシート“与信枠”で用いる関数', () => ({
  kind: 'tables', tables: [{ headers: ['書式', '説明'], rows: [['垂直照合（式，範囲，列の位置，検索の指定）', functionsVertical]] }],
}));
export const managementFunctions = languageFigure(13, 'management-functions', '表4　ワークシート“与信管理”で用いる可能性のある関数', () => ({
  kind: 'tables', tables: [{ headers: ['書式', '説明'], rows: functionNotes }],
}));

export function creditBanks(index: number) {
  const row = 3 + index, start = 2 + index, middle = 7 + index, end = 11 + index, head = 1 + index;
  const field = (column: string) => column + row;
  const range = (rule: number, last: string) => '信用度評価基準！$D$' + (rule ? middle : start) + '～$' + last + '$' + (rule ? end : middle - 1);
  const args = (column: string, rule: number, lookup: number, mode: number) =>
    field(column) + '，' + range(rule, lookup === 2 ? 'E' : 'F') + '，' + lookup + '，' + mode;
  const limits = ['（' + field('B') + '－' + field('C') + '）', field('E'), field('F')];
  const calculation = (base: number, column: string, rule: number, lookup: number, mode: number) =>
    limits[base] + '＊垂直照合（' + args(column, rule, lookup, mode) + '）';
  const limit = field('J') + '～' + field('K'), minimum = '最小（' + limit + '）', maximum = '最大（' + limit + '）';
  const payment = '支払いサイト！$B$' + start + '～$F$' + (start + 4);
  const siteRow = '支払いサイト！$A$' + start + '～$A$' + (start + 4);
  const siteColumn = '支払いサイト！$B$' + head + '～$F$' + head;
  const coordinate = (direction: string, column: string, values: string, mode: number, coordinate?: number) =>
    direction + '（' + field(column) + '，' + values + '，' + (coordinate ? coordinate + '，' : '') + mode + '）';
  const select = (fn: string, first: string, second: string) => fn + '（' + payment + '，\n' + first + '，\n' + second + '）';
  const exact = (axis: 'row' | 'column', mode: number) =>
    coordinate('照合一致', axis === 'row' ? 'H' : 'I', axis === 'row' ? siteRow : siteColumn, mode);
  const conventional = (swap: boolean, axis: 'row' | 'column') =>
    coordinate((axis === 'row') === !swap ? '垂直照合' : '水平照合', axis === 'row' ? 'H' : 'I', axis === 'row' ? siteRow : siteColumn, 0, 3);
  const history = field('N') + '～' + field('P');
  const conditional = (op: string) => `条件付合計（N$${start}～P$${start}，'${op}${field('M')}'，${history}）`;
  const total = '（' + field('Q') + '＋' + field('R') + '）';
  const zero = field('L') + '＝0';
  const choice = (clause: string) => `IF（${clause}，'×'，'○'）`;
  const comparison = (s: string, op: string) => s + op + field('L');
  const logic = (name: string, lhs: string, rhs: string) => name + '（' + lhs + '，' + rhs + '）';
  return {
    ab: ['D', 'G'].flatMap(col => [0, 1].flatMap(rule => [2, 3].map(output => args(col, rule, output, 1)))),
    cd: [calculation(0, 'D', 0, 2, 1), calculation(0, 'D', 0, 3, 0), calculation(0, 'D', 0, 3, 1),
      calculation(0, 'D', 1, 3, 0), calculation(0, 'G', 0, 3, 0), calculation(1, 'D', 1, 3, 1),
      calculation(1, 'G', 0, 3, 0), calculation(1, 'G', 0, 3, 1), calculation(1, 'G', 1, 3, 1), calculation(2, 'G', 1, 3, 0)],
    e: [`IF（${minimum}＜0，0，${minimum}）`, `IF（${maximum}＜0，0，${maximum}）`, minimum, maximum],
    f: ['照合一致', '表引き'].flatMap(fn => [false, true].map(swap => select(fn, conventional(swap, 'row'), conventional(swap, 'column'))))
      .concat([false, true].flatMap(swap => [0, 1].map(mode => select('表引き', exact(swap ? 'column' : 'row', mode), exact(swap ? 'row' : 'column', mode))))),
    g: [field('N'), '合計（' + history + '）', '合計（' + history + '）＋' + field('R'),
      ...['=', '＜', '≦'].flatMap(op => [conditional(op), conditional(op) + '＋' + field('R')])],
    h: [choice(comparison(field('Q'), '＞')), choice(comparison(field('Q'), '≧')), choice(comparison(total, '＞')), choice(comparison(total, '≧')),
      ...['論理積', '論理和'].flatMap(fn => (fn === '論理積' ? [total] : [field('Q'), total])
        .flatMap(lhs => ['＞', '≧'].map(op => choice(logic(fn, comparison(lhs, op), zero)))))],
  };
}

export const spreadsheetPages = [76, 77, 78];
const spreadsheetReference = special2011PmReference('IPA公式付属資料　表計算ソフトの機能・用語', spreadsheetPages);
export const q13 = createLanguageDefinition(13, '表計算で取引先の与信管理を行う', 'creditWorksheet', 'abcdefgh', 'アキウケアオクケ',
  '信用度の範囲照合、二基準の係数と与信枠、行列の完全一致、前月売掛残の条件付合計、受注可否の境界を維持する。ワークシートの表の開始行、財務データ、信用度の下限値及び支払いサイトを同時に変更する。',
  index => {
    const first = 3 + index, next = first + 1, last = first + 20, head = 2 + index, end = 11 + index;
    const bankItems = creditBanks(index);
    const cells = (letter: string) => 'セル' + letter + first + 'に入力し，セル' + letter + next + '～' + letter + last + 'に複写する。';
    return {
      pages: [
        page(61, [heading('問13　次の表計算及びワークシートの説明を読んで，設問1，2に答えよ。'), heading('〔表計算の説明〕'),
          p('企業が行う取引には，商品を販売してから一定期間後に販売代金を取引先から回収する方法がある。回収していない状態の代金のことを売掛金という。取引先の信用度を様々な角度から評価して，取引に対する売掛金の限度額である与信枠を設定し，売掛金を確実に回収できるように管理することを与信管理という。K社では，21の取引先ごとに月1回の注文を受けると，即日納品をして，月末に請求を行っている。K社では，与信管理を次の手順で行っている。'),
          p('① 取引先の流動資産，流動負債，自己資本などの情報を収集する。\n② 流動比率及び自己資本比率を表1に示すレベルに当てはめ，取引先の信用度を評価するとともに，それぞれのレベルに対応する与信枠の計算式を用いて，基準1及び基準2の計算値を求める。\n③ 基準1と基準2の計算値のうち，小さい方を与信枠とする。ただし，小さい方の値が負の場合，0とする。'),
          ratingTable.block(index),
          p('④ ②の二つの基準に基づく信用度の組合せから，表2に示すとおり，上限を3か月とした支払いサイトを決めている。ここで，支払いサイトとは請求から支払期限までの月数である。表2中の“－”は，取引停止であることを示している。\n⑤ 前月の売掛金の残額に当月の注文額を加えた額が与信枠を超える場合，及び取引停止の場合には，当月の注文を受けない。')]),
        page(62, [siteTable.block(index),
          p('設問1　取引先の信用度評価と与信枠の計算に関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          heading('〔ワークシート：信用度評価基準〕'),
          p('二つの基準のそれぞれのレベルに応じた信用度及び与信枠を求める計算式で利用する係数（以下，与信枠係数という）を登録した図1のワークシート“信用度評価基準”を作成した。'),
          ratingSheet.block(index),
          p(`（1） 流動比率のレベルごとの下限値をセルD${head}～D${head + 4}に，自己資本比率のレベルごとの下限値をセルD${head + 5}～D${end}に入力する。\n（2） 流動比率及び自己資本比率のレベルに応じた信用度をセルE${head}～E${head + 4}及びセルE${head + 5}～E${end}に入力する。\n（3） 流動比率及び自己資本比率のレベルに応じた与信枠係数をセルF${head}～F${head + 4}及`)]),
        page(63, [p(`びセルF${head + 5}～F${end}に入力する。`), heading('〔ワークシート：与信枠〕'),
          p('取引先の信用度及び与信枠を求めるために，図2のワークシート“与信枠”を作成した。ここで，複数のワークシート間でデータを参照するには“ワークシート名！セル”又は“ワークシート名！範囲”という形式で指定する。'),
          limitSheet.block(index),
          p(`（1） セルA${first}～G${last}に，取引先ごとの名称及び財務データ（流動資産，流動負債，流動比率，自己資本，総資本，自己資本比率）を入力する。`),
          p('（2） 基準1の信用度の評価結果を求めるために次の計算式を' + cells('H')), code('垂直照合（［a］）', 'text'),
          p('基準2の信用度の評価結果を求めるために次の計算式を' + cells('I')), code('垂直照合（［b］）', 'text'),
          p(`（3） 基準1での計算値を求めるために次の計算式をセルJ${first}に入力し，セルJ${next}～`)], undefined, undefined, true),
        page(64, [p(`J${last}に複写する。`), code('［c］＊1000', 'text'),
          p('基準2での計算値を求めるために次の計算式を' + cells('K')), code('［d］＊1000', 'text'),
          p(`（4） 二つの基準によって求めた計算値のうち，小さい方を与信枠とするために次の計算式をセルL${first}に入力し，セルL${next}～L${last}に複写する（小さい方の値が負の値である場合，0とする）。`),
          code('［e］', 'text'), p('（5） ワークシート“与信枠”で用いる関数を表3に示す。'), verticalTable.block(index)],
          [bank(1, 'ab', bankItems.ab, 'アキ', 'text')], undefined, true),
        page(65, [p('設問2　取引先の与信管理に関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          heading('〔ワークシート：支払いサイト〕'),
          p(`表2の信用度に基づく支払いサイトに対応した図3のワークシート“支払いサイト”を作成した。セルB${head}～F${head + 4}に決められた支払いサイトの月数を入力する。ここで，取引停止“－”に対しては数値0を入力する。`)],
          [bank(1, 'cd', bankItems.cd, 'ウケ', 'text'), bank(1, 'e', bankItems.e, 'ア', 'text')], [-1, -1]),
        page(66, [paymentSheet.block(index), heading('〔ワークシート：与信管理〕'),
          p('取引先の信用度評価結果に基づく支払いサイトの決定及び与信枠に基づく当月受注の可否の判定を行うため，図2のワークシート“与信枠”にM列以降を追加して，図4のワークシート“与信管理”を作成した。'),
          managementSheet.block(index),
          p('（1） 信用度の評価結果の組合せから決定される支払いサイトを求めるために次の計算式を' + cells('M')), code('［f］', 'text')]),
        page(67, [p(`（2） セルN${first}～P${last}に，取引先ごとの前月～3か月前の売上を入力する。セルN${head}～P${head}に，売上月に対する当月からさかのぼった数を入力する。`),
          p(`（3） 前月までの売上金額に対して支払いサイトに応じて回収した結果の売掛金の残額（以下，前月売掛残という）を求めるために，次の計算式をセルQ${first}に入力し，セルQ${next}～Q${last}に複写する。ここで，各取引先に対する売掛金回収は，前倒し及び延滞はなく，支払いサイトどおりに行われているものとする。`),
          code('［g］', 'text'), p(`（4） 当月注文額をセルR${first}～R${last}に入力する。`),
          p(`（5） 前月売掛残と当月注文額の合計と与信枠を比較し，受注可否の判定を行う。前月売掛残と当月注文額の合計が，与信枠を超える場合又は与信枠が0の場合，受注不可とする。受注可の場合は“○”，受注不可の場合は“×”を表示する次の計算式をセルS${first}に入力し，セルS${next}～S${last}に複写する。`),
          code('［h］', 'text'), p('（6） 表3の関数に加えて，ワークシート“与信管理”に用いる可能性のある関数を，表4に示す。'), managementFunctions.block(index)]),
        page(68, [], [bank(2, 'f', bankItems.f, 'オ', 'text'), bank(2, 'g', bankItems.g, 'ク', 'text')]),
        page(69, [], [bank(2, 'h', bankItems.h, 'ケ', 'text')]),
      ],
      contexts: [spreadsheetReference],
      explanation: `aとbは流動比率・自己資本比率の列から，各基準の下限値以下の最大値で信用度を引く。cとdは同じ検索で係数列を返し，それぞれ流動資産と流動負債の差，自己資本に掛ける。百万円から千円に変換するので式の後で1000を掛ける。eは二計算値の小さい方を取り，負なら0。fは基準1を行，基準2を列として完全一致の位置を求めてから表引きする。gはN${head}～P${head}の月数が支払いサイト以下の売上だけを足す。月数の行を固定し，注文額は含めない。hは与信枠が0，または前月売掛残と当月注文額の合計が与信枠を超えたときに×。与信枠が正で合計と等しい場合は○。`,
    };
  }, { fixedReferenceAssetIds: spreadsheetPages.map(special2011PmPageAssetId) });

export const q13Figures = [ratingTable, siteTable, ratingSheet, limitSheet, verticalTable, paymentSheet, managementSheet, managementFunctions];
