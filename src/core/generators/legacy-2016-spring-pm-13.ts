import { code, field, p, table, type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { answerBody, choiceBankText, heading, pageAlt, selectCase, springLanguageReferences } from './legacy-2016-spring-pm-09-13-support';
import type { SourcePage } from './legacy-2016-autumn-pm-09-13-support';

const reference = springLanguageReferences([4, 5, 77, 78, 79, 80, 81, 82]);
const productCodes = ['A001', 'A002', 'B101', 'B201', 'C010', 'C011', 'C012', 'D070', 'D080'];
const policies = ['維持', '維持', '注意', '見直し', '注意', '見直し', '注意', '見直し'];
const answerBanks = [
  [
    '条件付合計($C5:$K5, > C5, $C5:$K5)',
    '条件付合計($C5:$K5, > C5, $C5:$K5) + C5',
    '条件付合計($C5:$K5, ≧ C5, $C5:$K5)',
    '条件付合計($C5:$K5, ≧ C5, $C5:$K5) − C5',
  ],
  [
    '表引き($A$25:$A$27, 条件付個数($B$25:$B$27, < C6), 1)',
    '表引き($A$25:$A$27, 条件付個数($D$25:$D$27, ≦ C6), 1)',
    '表引き($A$25:$A$27, 照合一致(C6, $B$25:$B$27, 1), 1)',
    '表引き($A$25:$A$27, 照合一致(C6, $D$25:$D$27, −1), 1)',
  ],
  [
    "IF(論理積(C9 < 1, C14 < 1), 'Y', 'N')",
    "IF(論理積(C9 > 1, C14 > 1), 'N', 'Y')",
    "IF(論理和(C9 < 1, C14 < 1), 'Y', 'N')",
    "IF(論理和(C9 > 1, C14 > 1), 'N', 'Y')",
  ],
  [3, 4].flatMap(weight => [4, 5].map(row =>
    `水平照合(IF(C18 = 'Y', ${weight}, 0) + IF(C19 = 'Y', 2, 0) +\n    IF(C20 = 'Y', 1, 0), $C30:$J34, ${row}, 0)`)),
  [
    '相対(C2, 0, total_col) = 相対(販売データ!D2, data_row, 0)',
    '相対(C2, 0, total_col) ≠ 相対(販売データ!B2, data_row, 0)',
    '相対(C2, 0, total_col) ≠ 相対(販売データ!D2, data_row, 0)',
    '相対(C2, total_row, 0) = 相対(販売データ!B2, data_row, 0)',
    '相対(C2, total_row, 0) = 相対(販売データ!D2, data_row, 0)',
    '相対(C2, total_row, 0) ≠ 相対(販売データ!B2, data_row, 0)',
  ],
  [
    'subtotal ← subtotal +\n    相対(販売データ!A1, data_row, 5) * 相対(販売データ!A1, data_row, 6)',
    'subtotal ← subtotal +\n    相対(販売データ!A2, total_row, 5) * 相対(販売データ!A2, total_row, 6)',
    'subtotal ← subtotal +\n    相対(販売データ!F2, data_row, 0) * 相対(販売データ!G2, data_row, 0)',
    'total_row ← 0',
    'total_row ← total_row + 1',
    'total_row ← total_row + 5',
  ],
];
const macro = `○マクロ: Sales_Total
○数値型: data_row, total_row, total_col, subtotal
・data_row ← 0
・total_row ← 0
・subtotal ← 0
■ 相対(販売データ!A2, data_row, 0) ≠ null
  ・相対(A3, total_row, 0) ← 相対(販売データ!A2, data_row, 0)
  ・total_col ← 0
  ■ 相対(A3, total_row, 0) = 相対(販売データ!A2, data_row, 0)
    ■ [e]
      ・[f]
      ・data_row ← data_row + 1
    ■
    ・相対(C3, total_row, total_col)
        ← 四捨五入(subtotal / 1000, 0)
    ・subtotal ← 0
    ・total_col ← total_col + 1
  ■
  ・[g]
■`;

const shownProducts = (items: string[]) => [...items.slice(0, 3), '…', ...items.slice(-2)];
const money = (value: number) => new Intl.NumberFormat('en-US').format(value);
const ratio = (value: number) => (value * 100).toFixed(1) + '%';
const yearStart = (index: number) => index ? 2013 + index : 2013;
const reductionLimit = (index: number) => [85, 83, 84, 86, 87, 88, 89, 85][index];
const flag = (value: boolean) => value ? 'Y' : 'N';
const salesRows = [
  [35376, 11544, 13005, 28000, 12100, 12100, 19100, 7480, 12310],
  [36592, 10376, 12510, 26700, 11900, 11900, 21100, 7110, 15230],
  [39480, 9032, 13392, 25200, 11700, 11700, 23900, 6170, 12830],
];
export function spring2016Pm13Sales(index: number) {
  if (!index) throw new Error('Original worksheet omits some product sales');
  return salesRows.map((row, year) => row.map((value, product) =>
    value + index * ((product === 5 && index % 2 === 0 ? 0 : product % 4) + 1) * (year + 1) * 32));
}

const headingRow = ['2', '', '商品コード', ...shownProducts(productCodes), '合計'];
const sourceAnalysis = [
  ['3', '2013', '売上高', '35,376', '11,544', '13,005', '…', '7,480', '12,310', '151,847'],
  ['4', '', '対前年比率', '－', '－', '－', '…', '－', '－', '－'],
  ['5', '', '構成比率', '23.3%', '7.6%', '8.6%', '…', '4.9%', '8.1%', ''],
  ['6', '', '構成比率累計', '23.3%', '81.6%', '65.8%', '…', '100.0%', '74.0%', ''],
  ['7', '', '管理区分', 'A', 'B', 'A', '…', 'C', 'B', ''],
  ['8', '2014', '売上高', '36,592', '10,376', '12,510', '…', '7,110', '15,230', '155,194'],
  ['9', '', '対前年比率', '103.4%', '89.9%', '96.2%', '…', '95.1%', '123.7%', '102.2%'],
  ['10', '', '構成比率', '23.6%', '6.7%', '8.1%', '…', '4.6%', '9.8%', ''],
  ['11', '', '構成比率累計', '23.6%', '90.1%', '76.6%', '…', '100.0%', '68.5%', ''],
  ['12', '', '管理区分', 'A', 'C', 'B', '…', 'C', 'A', ''],
  ['13', '2015', '売上高', '39,480', '9,032', '13,392', '…', '6,170', '12,830', '159,524'],
  ['14', '', '対前年比率', '107.9%', '87.0%', '107.1%', '…', '86.8%', '84.2%', '102.8%'],
  ['15', '', '構成比率', '24.7%', '5.7%', '8.4%', '…', '3.9%', '8.0%', ''],
  ['16', '', '構成比率累計', '24.7%', '90.6%', '70.2%', '…', '100.0%', '78.3%', ''],
  ['17', '', '管理区分', 'A', 'C', 'B', '…', 'C', 'B', ''],
  ['18', '判定', '売上高2年連続減', 'N', 'Y', 'N', '…', 'Y', 'N', ''],
  ['19', '', '対前年比85%未満', 'N', 'N', 'N', '…', 'N', 'Y', ''],
  ['20', '', '管理区分2年連続C', 'N', 'Y', 'N', '…', 'Y', 'N', ''],
  ['21', '', '取扱方針', '維持', '見直し', '維持', '…', '見直し', '注意', ''],
];
function salesAnalysis(index: number) {
  if (!index) return sourceAnalysis;
  const sales = spring2016Pm13Sales(index);
  const totals = sales.map(row => row.reduce((sum, value) => sum + value, 0));
  const accumulated = sales.map((row, year) => row.map(value =>
    (value + row.filter(other => other > value).reduce((sum, other) => sum + other, 0)) / totals[year]));
  const categories = accumulated.map(row => row.map(value => value <= .70 ? 'A' : value <= .90 ? 'B' : 'C'));
  const row = (n: number, a: string, b: string, cells: string[], sum = '') => [String(n), a, b, ...shownProducts(cells), sum];
  const result = sales.flatMap((values, year) => {
    const firstRow = 3 + 5 * year;
    return [
      row(firstRow, String(yearStart(index) + year), '売上高', values.map(money), money(totals[year])),
      row(firstRow + 1, '', '対前年比率', values.map((value, product) => year ? ratio(value / sales[year - 1][product]) : '－'),
        year ? ratio(totals[year] / totals[year - 1]) : '－'),
      row(firstRow + 2, '', '構成比率', values.map(value => ratio(value / totals[year]))),
      row(firstRow + 3, '', '構成比率累計', accumulated[year].map(ratio)),
      row(firstRow + 4, '', '管理区分', categories[year]),
    ];
  });
  const flags = productCodes.map((_, product) => [
    sales[0][product] > sales[1][product] && sales[1][product] > sales[2][product],
    sales[2][product] * 100 < reductionLimit(index) * sales[1][product],
    categories[1][product] === 'C' && categories[2][product] === 'C',
  ]);
  return [
    ...result,
    row(18, '判定', '売上高2年連続減', flags.map(bits => flag(bits[0]))),
    row(19, '', `対前年比${reductionLimit(index)}%未満`, flags.map(bits => flag(bits[1]))),
    row(20, '', '管理区分2年連続C', flags.map(bits => flag(bits[2]))),
    row(21, '', '取扱方針', flags.map(bits => policies[Number(bits[0]) * 4 + Number(bits[1]) * 2 + Number(bits[2])])),
  ];
}
const management = [['A', '0%', '70%'], ['B', '70%', '90%'], ['C', '90%', '100%']];
const salesAnalysisLabels = ['', 'A', 'B', 'C', 'D', 'E', '…', 'J', 'K', 'L'];
const judgement = (limit: number) => [
  ['直近の2年の売上高が連続して前年より減少', 'N', 'N', 'N', 'N', 'Y', 'Y', 'Y', 'Y'],
  [`直近の年の対前年比率が${limit}%未満`, 'N', 'N', 'Y', 'Y', 'N', 'N', 'Y', 'Y'],
  ['直近の2年の管理区分が連続してC', 'N', 'Y', 'N', 'Y', 'N', 'Y', 'N', 'Y'],
  ['取扱方針', ...policies],
];
const originalData = [
  [2, 0, 1, 4, 'A001', 1109, 800, 300], [3, 0, 1, 5, 'A001', 1115, 800, 170],
  [4, 0, 1, 6, 'A001', 1119, 800, 180], [5, 0, 1, 6, 'A001', 1107, 800, 50],
  [6, 0, 1, 7, 'A001', 1104, 800, 120],
  [2292, 1, 12, 24, 'D080', 1118, 1000, 90], [2293, 1, 12, 28, 'D080', 1106, 1000, 230],
  [2294, 2, 1, 4, 'A001', 1117, 800, 220], [2295, 2, 1, 6, 'A001', 1104, 800, 110],
] as const;
function salesData(index: number) {
  const rows = originalData.map(([row, year, month, day, product, customer, price, count]) =>
    [String(row), String(yearStart(index) + year), String(month), String(day), product, String(customer), money(price), String(count + index * 10)]);
  const omissions = Array(8).fill('⋮');
  return [['1', '年', '月', '日', '商品コード', '得意先コード', '単価', '数量'], ...rows.slice(0, 5), omissions, ...rows.slice(5), omissions];
}
function pages(index: number): SourcePage[] {
  const limit = reductionLimit(index), criteria = judgement(limit);
  return [
    {page: 61, blocks: [
      p('問13 次の表計算のワークシート及びマクロの説明を読んで，設問1，2に答えよ。'),
      heading('〔表計算の説明〕'),
      p('卸売業のP社は，家庭用品部門で販売している商品の取扱いを見直すことにした。そこで，販売管理システムから対象商品の連続した過去3年間の販売データを抽出し，表計算ソフトを利用して販売状況の分析を行い，今後の取扱いを検討することにした。'),
      p('対象商品は，商品コードA001，A002，B101，B201，C010，C011，C012，D070及びD080の9商品である。販売データは，各年の1月1日から12月31日までの1年を単位として分析し，分析する対象の各年で売上高が0の商品はない。'),
      heading('〔ワークシート：販売分析〕'),
      p('対象商品の販売状況を分析する指標を計算して，今後の取扱いを判定するワークシート“販売分析”を作成した。ワークシート“販売分析”の例を図1に示す。'),
      p('(1) ワークシートのセルA1〜L21は“売上高分析表”である。“売上高分析表”では，対象商品の年ごとの売上高を基にして，販売状況を分析する指標を求めている。'),
      p('① セルC2〜K2には，対象商品の商品コードが昇順に格納されている。'),
      p('② マクロSales_Totalを実行すると，セルA3，セルA8及びセルA13には，分析する過去3年の西暦年が昇順に格納され，セルC3〜K3，セルC8〜K8及びセルC13〜K13には，対象商品の当該年の売上高が，千円未満を四捨五入した千円単位の値で格納される。'),
      p('③ 対前年比率は，各商品の前年の売上高を基準にした当該年の売上高の割合である。'),
      p('④ 構成比率は，当該年の対象9商品の売上高の合計に占める各商品の売上高の割合である。'),
      p('⑤ 構成比率累計は，当該年の各商品の構成比率を，大きいものから順に当該商品まで累計した値である。ここで，当該商品と構成比率の同じ商品が複数あったときは，当該商品の分だけを加算する。'),
    ]},
    {page: 62, blocks: [
      table('図1 ワークシート“販売分析”の例・売上高分析表（単位 千円）', salesAnalysisLabels,
        [['1', '売上高分析表', '', '', '', '', '', '', '', '千円'], headingRow, ...salesAnalysis(index)]),
      table('図1 管理区分表', ['', 'A', 'B', 'C', 'D', 'E'], [
        ['23', '管理区分表', '', '', '', ''], ['24', '管理区分', '構成比率累計の範囲', '', '', ''],
        ...management.map(([category, lower, upper], i) => [String(25 + i), category, lower, 'を超え', upper, '以下']),
      ]),
      table('図1 取扱判定表', ['', 'A', 'B', 'C', 'D', 'E', '…', 'J'], [
        ['29', '取扱判定表', '', '', '', '', '', ''], ['30', '', '判定コード', '0', '1', '2', '…', '7'],
        ...criteria.slice(0, 3).map(([label, ...flags], i) =>
          [String(31 + i), i === 0 ? '条件' : '', label.replace('直近の2年の売上高が連続して前年より減少', '売上高2年連続減').replace('直近の年の対前年比率が', '対前年比').replace('直近の2年の管理区分が連続してC', '管理区分2年連続C'), ...flags.slice(0, 3), '…', flags[7]]),
        ['34', '', '取扱方針', ...policies.slice(0, 3), '…', policies[7]],
      ]),
      p('注記 対前年比率，構成比率及び構成比率累計は，%形式で小数第2位を四捨五入した値を表示している。'),
    ]},
    {page: 63, blocks: [
      p('⑥ 管理区分は，各商品の構成比率累計が，表1の構成比率累計の範囲のどの区分に属するかを判定した結果であり，商品の管理方法を決定する指標である。'),
      table('表1 管理区分の判定基準', ['管理区分', '構成比率累計の範囲', '商品の管理方法'],
        management.map(([category, lower, upper], i) => [category, `${lower}を超え，${upper}以下`, ['重要管理商品', '通常管理商品', '簡易管理商品'][i]])),
      p('⑦ セルC18〜K20には，表2に示した各条件の真偽を商品ごとに判定した結果を設定する。セルC21〜K21には，各条件の真偽の組合せに基づいて，各商品の今後の取扱方針を設定する。'),
      table('表2 今後の取扱方針を判定する条件', ['条件', ...Array.from({length: 8}, () => '')], criteria),
      p('(a) “Y”は条件が真，“N”は条件が偽であることを表す。(b) 取扱方針は，条件の真，偽が各列の組合せに該当する商品の，今後の取扱方針を表す。'),
      p('(2) ワークシートのセルA23〜E27は“管理区分表”である。“管理区分表”には，管理区分と対応する構成比率累計の範囲が，表1のとおり格納されている。'),
      p('(3) ワークシートのセルA29〜J34は“取扱判定表”である。'),
      p('① セルC31〜J34には取扱方針を判定するための条件の組合せと，その組合せに基づいた取扱方針が，表2のとおりに格納されている。'),
      p('② セルC30〜J30には，セルC31〜J33の各列の条件の“Y”を1，“N”を0とし，上から順に2進数の3桁目，2桁目，1桁目として並べたものを10進数に変換した値が，判定コードとして格納されている。'),
    ]},
    {page: 64, blocks: [
      p('設問1 ワークシート“販売分析”の作成に関する記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      p('(1) セルL3，セルL8及びセルL13には，当該年の対象9商品の売上高の合計を求める式を入力する。'),
      p('(2) セルC4〜L4には，“－”を入力する。セルC9〜L9及びセルC14〜L14には，対前年比率を求める式を入力する。'),
      p('(3) セルC5〜K5，セルC10〜K10及びセルC15〜K15には，構成比率を求める式を入力する。'),
      p('(4) セルC6には，構成比率累計を求める次の式を入力し，セルD6〜K6，セルC11〜K11及びセルC16〜K16に複写する。'),
      code('［a］', 'text'),
      p('(5) セルC7には，管理区分を表示する次の式を入力し，セルD7〜K7，セルC12〜K12及びセルC17〜K17に複写する。'),
      code('［b］', 'text'),
      p('(6) セルC18には，直近2年の売上高が連続して前年よりも減少しているかどうかを判定する次の式を入力し，セルD18〜K18に複写する。'),
      code('［c］', 'text'),
      p(`(7) セルC19〜K19には，当該商品の直近の年の対前年比率が${limit}%未満かどうかを判定する式を入力する。`),
      p('(8) セルC20〜K20には，当該商品の直近2年の管理区分が連続して“C”かどうかを判定する式を入力する。'),
      p('(9) セルC21には，“取扱判定表”の条件がセルC18〜C20の値と一致する列に対応する取扱方針を表示する次の式を入力し，セルD21〜K21に複写する。'),
      code('［d］', 'text'),
    ]},
    {page: 65, blocks: [], banks: answerBanks.slice(0, 4).map((bank, i) => choiceBankText('abcd'[i], bank))},
    {page: 66, blocks: [
      p('設問2 図2に示すワークシート“販売データ”のデータを基に，〔ワークシート：販売分析〕の説明の(1)の②で示した処理を実行するマクロSales_Totalを作成して，ワークシート“販売分析”に格納した。マクロSales_Totalの［e］〜［g］に入れる正しい答えを，解答群の中から選べ。'),
      heading('〔ワークシート：販売データ〕'),
      p('ワークシート“販売データ”の例を図2に示す。'),
      table('図2 ワークシート“販売データ”の例', ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], salesData(index)),
      p('(1) ワークシート“販売データ”には，販売管理システムから，対象商品の連続した過去3年間のデータを抽出して格納してある。'),
      p('(2) 行1には，見出しが格納されている。行2以降には，販売した年，月，日，商品コード，得意先コード，単価及び数量のデータが，年を第1キー，商品コードを第2キーとして昇順に格納されている。'),
      p('(3) データが格納されていないセルの値は，nullである。'),
    ]},
    {page: 67, blocks: [heading('〔マクロ：Sales_Total〕'), code(macro, 'pseudocode')], banks: [choiceBankText('e', answerBanks[4])]},
    {page: 68, blocks: [], banks: [choiceBankText('f，g', answerBanks[5])]},
  ];
}
export const spring2016Pm13OriginalPageAlt = () => pageAlt(pages(0));
function build(values: number[]): GeneratedBody {
  const index = selectCase(values, 8), limit = reductionLimit(index);
  return answerBody(pages(index).flatMap(page => page.blocks), [
    ...answerBanks.slice(0, 5).map((options, i) => ({
      names: ['abcde'[i]], labels: [`設問${i < 4 ? 1 : 2} ${'abcde'[i]}`], options, keys: [[1, 0, 0, 3, 0][i]], language: 'text',
    })),
    {names: ['f', 'g'], labels: ['設問2 f', '設問2 g'], options: answerBanks[5], keys: [2, 5], language: 'text'},
  ], `a：C5より大きい構成比率を合計し，当該商品のC5だけを加える。≧で合計すると同率の他商品まで加えてしまう。$C・$Kは列方向に複写しても固定し，年を移るときは行を変える。b：構成比率累計C6が厳密に超えた下限を数える。0%、70%、90%のうち超えた数が，管理区分表の行番号になる。70%ちょうどならA、90%ちょうどならBである。c：2年分の対前年比率が両方とも1未満ならY。同率は減少に含めない。d：Yを1とみなして重み4・2・1を付け，判定コードを1行目で完全一致検索する。取扱方針は表の5行目であり，${limit}%未満の条件は判定コードの第2ビットを決める。\ne：集計先の列に対応する商品コードと販売データの現在行D列のコードが一致する間だけ繰り返す。f：現在の販売行のF列（単価）×G列（数量）をsubtotalに加える。商品単位で加算を終えてから千円単位に四捨五入する。g：年が切り替わったら売上高の書込み先を5行進める。A3・A8・A13に年が入り，C3〜K3・C8〜K8・C13〜K13にその年の集計が入る。図で省略された原取引の内訳は分からない。`, reference.contexts);
}
export const legacy2016SpringPm13Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-13', title: '旧制度・午後：表計算による販売分析',
  fields: [field('売上データと判定閾値の条件番号', 0, 7)], reference: [0], version: '3.6.0',
  answerVariation: 'fixed',
  sourceAnswer: '設問1 a=イ，b=ア，c=ア，d=エ／設問2 e=ア，f=ウ，g=カ',
  notes: 'PDF p61–68の7欄。相対参照と絶対列の範囲、同率商品の累計、管理区分境界、前年比の厳密な不等号、千円単位の四捨五入、null終端、年・商品順、全9商品の売上ありを保持。基準の原表示値・省略は維持。改変例の売上高、売上明細・集計年、前年比閾値を8条件で変更し、非表示の原取引は補わない。設問は集計結果の数値ではなく式とマクロの空欄を問う。セルの複写先、判定コードの重み、集計行間隔を保つため、判定結果や集計値が変わっても7欄の正答は共通となる。正答を変えるためだけの列移動や解答群の並べ替えは採らない。改変の例示集計の独立再計算、関数・選択肢・マクロの照合を実施。',
  publicNotes: '元のワークシート・集計マクロ・複写の構造を保ち，例示の売上高・数量・対象年・判定閾値を変更します。',
  fixedReferenceAssetIds: reference.assets, build,
};
