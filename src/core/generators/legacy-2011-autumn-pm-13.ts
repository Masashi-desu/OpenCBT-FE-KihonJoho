import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { autumn2011PmPageAssetId, autumn2011PmReference } from './legacy-2011-autumn-pm-materials';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2011-autumn-pm-09-13-support';

export const payrollCases = [
  { cutoff: 50, low: 49, rate: 15, company: 'K' },
  { cutoff: 49, low: 49, rate: 12, company: 'R' },
  { cutoff: 48, low: 47, rate: 18, company: 'S' },
  { cutoff: 47, low: 47, rate: 20, company: 'T' },
];
export const listedEmployees = [
  [2, 'H0006', 1, 1, 56, 22], [3, 'H0011', 1, 2, 54, 60], [4, 'H0003', 1, 3, 58, 60],
  [5, 'H0010', 2, 1, 54, 66], [6, 'H0018', 2, 1, 50, 34], [7, 'H0008', 2, 2, 55, 72],
  [25, 'H0067', 3, 2, 35, 60], [26, 'H0009', 3, 3, 55, 40], [27, 'H0013', 3, 3, 53, 80],
  [28, 'H0002', 4, 1, 58, 52], [29, 'H0016', 4, 1, 51, 98],
  [107, 'H0106', 5, 3, 23, 36], [108, 'H0107', 5, 3, 23, 20],
] as const;
const ranks = ['本部長', '部長', '課長', '主任', 'なし'];
const allowances = [200, 150, 100, 50, 0];
const roleFactors = [350, 300, 250, 200, 150];
const evaluationFactors = [75, 85, 100, 115, 125];
const departments = [1, 2, 3];
const points = [20, 15, 6];
const cappedTotals = [44709, 34134, 53814];
const displayedTotals = [43234, 33854, 53071];
const deptName = (dept: number) => '第' + dept + '本部';
const funds = (amount: number) => amount.toLocaleString('en-US');
const displayHundredths = (amount: number) => funds(Math.floor((amount + 50) / 100));
const roleFactorText = (factor: number) => (factor / 100).toFixed(1);
const evaluationText = (factor: number) => (factor / 100).toFixed(2);
const amountHeader = (label: string) => label + '\n（千円）';
const evalLimit = (i: number) => i * 20 + 1;
const newPayNote = '本部賞与合計上限，本部賞与合計及び賞与は，小数第1位を四捨五入した値を表示している。';

const payRules = languageFigure(13, 'allowance-rules', '表1 役職給', () => ({
  kind: 'grids', tables: [{ headers: ['役職', '役職給（千円）'], rows: ranks.map((role, i) => [role, String(allowances[i])]) }],
}));
const factorRules = languageFigure(13, 'coefficient-rules', '表2・表3 賞与計算に用いる係数', () => ({
  kind: 'grids', tables: [
    { caption: '表2 役職係数', headers: ['役職', '役職係数'], rows: ranks.map((role, i) => [role, roleFactorText(roleFactors[i])]) },
    { caption: '表3 個人評価係数', headers: ['個人評価点の範囲', '個人評価係数'], rows: evaluationFactors.map((factor, i) => [evalLimit(i) + '点～' + (i + 1) * 20 + '点', evaluationText(factor)]) },
  ],
}));
const paySheet = languageFigure(13, 'allowance-sheet', '図1 ワークシート“役職給”', () => ({
  kind: 'grids', tables: [{ headers: ['', 'A', 'B', 'C'], rows: [
    ['1', '役職', '役職ランク', '役職給（千円）'], ...ranks.map((role, i) => [String(i + 2), role, String(i + 1), String(allowances[i])]),
  ] }],
}));
const factorSheet = languageFigure(13, 'coefficient-sheet', '図2 ワークシート“賞与係数”', () => ({
  kind: 'grids', tables: [{ headers: ['', 'A', 'B', 'C'], rows: [
    ['1', '役職係数', '', ''], ['2', '役職', '役職ランク', '役職係数'],
    ...ranks.map((role, i) => [String(i + 3), role, String(i + 1), roleFactorText(roleFactors[i])]),
    ['8', '', '', ''], ['9', '個人評価係数', '', ''], ['10', '個人評価点の範囲の下限値', '個人評価係数', ''],
    ...evaluationFactors.map((factor, i) => [String(i + 11), String(evalLimit(i)), evaluationText(factor), '']),
  ] }],
}));
function employeeCells(index: number, row: typeof listedEmployees[number], revised: boolean) {
  const [address, id, rank, dept, age, evaluation] = row;
  const role = ranks[rank - 1], allowance = allowances[rank - 1];
  const agePay = age < payrollCases[index].cutoff ? age * 7 : 350;
  const pay = agePay + allowance, roleFactor = roleFactors[rank - 1];
  const personal = evaluationFactors[Math.floor((evaluation - 1) / 20)];
  const deptPoint = points[dept - 1];
  const base = [id, role, String(rank), deptName(dept)];
  const factors = [String(pay), roleFactorText(roleFactor), String(evaluation), evaluationText(personal)];
  if (revised) return [String(address + 4), ...base, '…', ...factors, String(deptPoint), displayHundredths(pay * (roleFactor + personal + deptPoint * (rank <= 3 ? 10 : 5)))];
  return [String(address), ...base, String(age), String(allowance), String(agePay), ...factors, displayHundredths(pay * (roleFactor + personal))];
}
function visibleRows(index: number, revised: boolean) {
  const rows = listedEmployees.map(employee => employeeCells(index, employee, revised));
  const ellipsis = Array.from({ length: rows[0].length }, () => '：');
  return [...rows.slice(0, 6), ellipsis, ...rows.slice(6, 11), ellipsis, ...rows.slice(11)];
}
const basicPay = languageFigure(13, 'base-pay-sheet', '図3 ワークシート“基本給・賞与計算”', index => ({
  kind: 'grids', tables: [{ headers: ['', ...'ABCDEFGHIJKL'], rows: [
    ['1', '社員\n番号', '役職', '役職\nランク', '本部', '年齢', amountHeader('役職給'), amountHeader('年齢給'), amountHeader('基本給'), '役職\n係数', '個人\n評価点', '個人\n評価係数', amountHeader('賞与')],
    ...visibleRows(index, false),
  ] }], note: '賞与は，小数第1位を四捨五入した値を表示している。',
}));
const revisedPay = languageFigure(13, 'revised-pay-sheet', '図4 ワークシート“新賞与計算”', index => ({
  kind: 'grids', tables: [{ headers: ['', 'A', 'B', 'C', 'D', '…', 'H', 'I', 'J', 'K', 'L', 'M'], rows: [
    ['1', '', '', '', '', '…', '', '本部', amountHeader('本部利益'), amountHeader('本部賞与合計\n上限'), '本部\n加点', amountHeader('本部賞与\n合計')],
    ...departments.map((dept, i) => {
      const limit = cappedTotals[i];
      const profit = Math.round(limit * 100 / payrollCases[index].rate);
      return [String(dept + 1), '', '', '', '', '…', '', deptName(dept), funds(profit), funds(Math.round(profit * payrollCases[index].rate / 100)), String(points[i]), funds(displayedTotals[i])];
    }),
    ['5', '社員\n番号', '役職', '役職\nランク', '本部', '…', amountHeader('基本給'), '役職\n係数', '個人\n評価点', '個人\n評価係数', '本部\n加点', amountHeader('賞与')],
    ...visibleRows(index, true),
  ] }], note: newPayNote,
}));
export const q13Figures = [payRules, factorRules, paySheet, factorSheet, basicPay, revisedPay];
const macro = `○マクロ：BonusCalc
○整数型：row，DeptPoint
■ ［f］
│  ・DeptPoint ← 0
│  ■
│  │  ・DeptPoint ← DeptPoint + 1
│  │  ・相対(L1, row, 0) ← DeptPoint
│  ■ ［g］
│  ・［h］
■`;
const salaryLookups = ['垂直照合', '水平照合'].flatMap(fn =>
  ['B1, 役職給!B$2～C$6, 2, 0', 'B1, 役職給!B$2～C$6, 3, 0', 'C2, 役職給!A$2～C$6, 2, 0', 'C2, 役職給!B$2～C$6, 2, 0'].map(args => fn + '(' + args + ')'));
const evaluationLookups = ['垂直照合', '水平照合'].flatMap(fn =>
  ['A$11～B$15', 'B$3～C$7'].flatMap(range => [0, 1].map(mode => fn + '(J2, 賞与係数!' + range + ', 2, ' + mode + ')')));
const formulae = [false, true].flatMap(inside =>
  ['C6＜3', 'C6≦3'].flatMap(condition => [[10, 20], [20, 10]].map(([lower, upper]) => {
    const partial = 'IF(' + condition + ', L6／' + lower + ', L6／' + upper + ')';
    return inside ? 'H6＊(I6＋K6＋' + partial + ')' : 'H6＊(I6＋K6)＋' + partial;
  })));
const sums = ['条件付合計', '照合検索'].flatMap(fn =>
  ['C', 'D'].flatMap(key => ['L', 'M'].map(result => {
    const range = (col: string) => col + '$6～' + col + '$112';
    return fn === '条件付合計' ? fn + '(' + range(key) + ', ＝I2, ' + range(result) + ')' : fn + '(I2, ' + range(key) + ', ' + range(result) + ')';
  })));
const rowChoice = ['1, row ＜ 3', '1, row ＜ 20', '1, row ≦ 3', '1, row ≦ 20', '2, row ＜ 4', '2, row ≦ 4', '6, row ＜ 112', '6, row ≦ 112'].map(value => 'row: ' + value + ', 1');
const tests = [
  '論理積(M2 ≦ K2, DeptPoint ≦ 20)', '論理積(M2 ≦ K2, L2 ≦ 20)',
  '論理積(相対(L1, row, 1) ＞ 相対(L2, row, −1), DeptPoint ＞ 20)', '論理積(相対(L1, row, 1) ≦ 相対(L1, row, −1), DeptPoint ≦ 20)',
  '論理和(M2 ＞ K2, DeptPoint ＞ 20)', '論理和(M2 ＞ K2, L2 ＞ 20)',
  '論理和(相対(L1, row, 1) ＞ 相対(L2, row, −1), DeptPoint ＞ 20)', '論理和(相対(L1, row, 1) ≦ 相対(L1, row, −1), DeptPoint ≦ 20)',
];
const writebacks = ['L1, row, 0', 'L1, row, −1', 'L2, row, 0', 'L2, row, −1'].flatMap((address, index) =>
  (index === 2 ? ['', ' ＋ 1'] : index === 3 ? [' ＋ 1', ' − 1'] : ['', ' ＋ 1', ' − 1']).map(operator => '相対(' + address + ') ← DeptPoint' + operator));
const referenceGroups = [[3, 4], [77, 78, 79, 80, 81, 82]] as const;

export const q13 = createLanguageDefinition(13, '表計算の基本給・賞与と本部加点の計算', 'payrollCase', 'abcdefgh', 'エエイキエウエウ',
  '役職給・年齢給・近似照合，セルを参照する賞与式と終了判定付きマクロを保持し，年齢給の境界と利益から上限への割合を変える。賞与合計上限が変わらないよう例の本部利益を調整する。', index => {
    const { cutoff, low, rate, company } = payrollCases[index];
    const ageOptions = ['＜' + low, '＜' + (low + 1), '≦' + (low + 2), '≧' + (low + 1)].flatMap(condition =>
      ['C2', 'E2'].map(input => 'IF(E2' + condition + ', ' + input + '＊7, 350)'));
    return {
      pages: [
        page(60, [heading('問13　次の表計算，ワークシート及びマクロの説明を読んで，設問1，2に答えよ。'), heading('〔表計算の説明〕'),
          p('三つの事業本部（以下，本部という）からなる ' + company + ' 社では，次のルールに従って，社員の基本給及び賞与の額を決めている。'),
          p('（1）基本給\n① 基本給は，毎月支給され，次の式で計算する。\n基本給＝年齢給＋役職給\n② 年齢給は，4月1日時点の年齢が' + cutoff + '歳未満の場合，その年齢に7,000円を乗じて算出され，' + cutoff + '歳以上の場合，固定額350,000円となる。\n③ 役職給の金額は，表1に示すとおりである。'),
          payRules.block(index),
          p('（2）賞与\n① 賞与は，次の式で計算する。\n賞与＝基本給×（役職係数＋個人評価係数）\n② 役職係数は，表2に示すとおりである。\n③ 個人評価係数は，表3に示すとおり個人評価点の範囲によって決まる。'), factorRules.block(index)]),
        page(61, [heading('〔ワークシート：役職給〕'), p('基本給の計算の基となる役職ごとの役職給を登録した図1のワークシート“役職給”を作成した。'), paySheet.block(index),
          p('役職をセル A2～A6 に，役職の序列を示す数値である役職ランクをセル B2～B6 に，役職給をセル C2～C6 に入力する。'),
          heading('〔ワークシート：賞与係数〕'), p('賞与の計算の基となる役職ごとの役職係数及び個人評価点に対応した個人評価係数を登録した図2のワークシート“賞与係数”を作成した。'), factorSheet.block(index)]),
        page(62, [p('（1）役職をセル A3～A7 に，役職ランクをセル B3～B7 に，役職係数をセル C3～C7 に入力する。\n（2）個人評価点の範囲の下限値をセル A11～A15 に，個人評価係数をセル B11～B15 に入力する。'),
          heading('〔ワークシート：基本給・賞与計算〕'),
          p(company + '社の三つの本部（第1本部，第2本部，第3本部）に所属する社員107名の基本給及び賞与を計算するためのワークシート“基本給・賞与計算”を作成した。そのワークシートを図3に示す。'), basicPay.block(index),
          p('設問1　ワークシート“基本給・賞与計算”に関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。')]),
        page(63, [p('（1）社員番号をセル A2～A108 に，役職をセル B2～B108 に，本部をセル D2～D108 に，4月1日時点での年齢をセル E2～E108 に入力する。役職ランクを参照する計算式をセル C2～C108 に入力する。'),
          p('（2）基本給を求めるための計算式を入力する。\n① 役職給を求める計算式［a］をセル F2 に入力し，セル F3～F108 に複写する。\n② 年齢給を求める計算式［b］をセル G2 に入力し，セル G3～G108 に複写する。\n③ 基本給を求める計算式をセル H2～H108 に入力する。'),
          p('（3）賞与を求めるための計算式を入力する。\n① 役職係数を求める計算式をセル I2～I108 に入力する。\n② 個人評価点をセル J2～J108 に入力する。\n③ 個人評価点に対応した個人評価係数を求めるための計算式［c］をセル K2 に入力し，セル K3～K108 に複写する。\n④ 賞与を求める計算式をセル L2～L108 に入力する。')],
          [bank(1, 'a', salaryLookups, 'エ'), bank(1, 'b', ageOptions, cutoff === low ? 'イ' : 'エ')]),
        page(64, [p('設問2　賞与の見直しに関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p(company + '社では，役職及び個人評価に加えて，本部ごとの利益（以下，本部利益という）を賞与に反映するために，本部利益に応じた評価点（以下，本部加点という）を加味するよう賞与の計算式を見直すことにした。'),
          heading('〔見直した賞与計算方式に関する説明〕'),
          p('（1）見直した賞与計算式は次のとおりである。\n① 役職が本部長，部長又は課長のとき\n賞与＝基本給×（役職係数＋個人評価係数＋本部加点／10）\n② 役職が主任又はなしのとき\n賞与＝基本給×（役職係数＋個人評価係数＋本部加点／20）'),
          p('（2）本部に属する社員の賞与の合計（以下，本部賞与合計という）が，本部利益の ' + rate + '% の金額（以下，本部賞与合計上限という）以下となる条件を満足する1～20の整数があるときは，その最大値を本部加点とする。無いときは，本部加点を0とする。'),
          p('条件を満足する本部加点を求め，それを加味した賞与計算を行うために，ワークシート“新賞与計算”とマクロ BonusCalc を作成した。そのワークシート及びマクロ BonusCalc の実行結果の表示例を図4に示す。')],
          [bank(1, 'c', evaluationLookups, 'イ')], [-1]),
        page(65, [revisedPay.block(index), heading('〔ワークシート：新賞与計算〕'),
          p('（1）本部名をセル I2～I4 に，本部利益をセル J2～J4 に，本部賞与合計上限を求める計算式をセル K2～K4 に入力する。\n（2）ワークシート“基本給・賞与計算”のセル A1～K108 をワークシート“新賞与計算”のセル A5～K112 に複写する。\n（3）所属本部によって決まる社員ごとの本部加点を求める計算式をセル L6～L112 に入力する。社員ごとの賞与を求める計算式［d］をセル M6 に入力し，セル M7～M112 に複写する。')]),
        page(66, [p('（4）本部ごとの賞与合計を求める計算式［e］をセル M2 に入力し，セル M3～M4 に複写する。'),
          heading('〔マクロの説明〕'),
          p('（1）マクロ BonusCalc は，各本部の条件を満足する本部加点を求めるマクロである。\n（2）マクロ BonusCalc の処理手順は次のとおりである。\n① 第1本部の本部加点の初期値を0とする。\n② 本部加点に1を加算する。\n③ 手順②で設定された本部加点に基づき，第1本部に所属する社員の賞与の合計である第1本部の本部賞与合計をワークシートの計算式から算出する。\n④ 第1本部の本部賞与合計と本部賞与合計上限の値を比較し，前者が後者を上回る，又は，本部加点が20を超えたときは，手順⑤に進む。それ以外のときは，手順②に戻る。\n⑤ このときの本部加点から1を減じた値を第1本部の本部加点とし，対応するセルに代入する。\n⑥ 同様に，第2本部及び第3本部の本部加点をそれぞれ対応するセルに代入する。'),
          heading('〔マクロ：BonusCalc〕'), code(macro, 'pseudocode')]),
        page(67, [], [bank(2, 'd', formulae, 'キ'), bank(2, 'e', sums, 'エ'), bank(2, 'f', rowChoice, 'ウ', 'pseudocode')]),
        page(68, [], [bank(2, 'g', tests, 'エ', 'pseudocode'), bank(2, 'h', writebacks, 'ウ', 'pseudocode')]),
      ],
      contexts: [autumn2011PmReference('疑似言語の記述形式', referenceGroups[0]), autumn2011PmReference('表計算ソフトの機能・用語', referenceGroups[1])],
      explanation: '役職ランク C2 を役職給表のB列で完全一致検索し，隣のC列から役職給を取得する。年齢が ' + cutoff + ' 歳未満なら E2×7（千円），それ以外は350とする。評価点は下限値が並ぶ表を近似照合する。本部加点の分母は役職ランク3以下で10，それ以外で20であり，加点は基本給を掛ける前の係数に加える。D列で所属本部を判定し，M列の賞与を集計する。row は L1 から下へ1～3行。本部賞与合計が上限以下で加点が20以下の間繰り返し，直前の加点を同じ本部のセルに戻す。',
    };
  }, { fixedReferenceAssetIds: referenceGroups.flat().map(autumn2011PmPageAssetId) });
