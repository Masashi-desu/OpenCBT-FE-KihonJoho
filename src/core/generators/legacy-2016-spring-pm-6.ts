import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, table } from './definition';
import { spring2016Pm0508Body as body, spring2016Pm0508Choices as choices,
  spring2016Pm0508Profile as profile } from './legacy-2016-spring-pm-05-08-shared';

const scenarios = [
  { amounts: [4700, 3800, 4500], matches: [42, 44, 32], mKnows: false, nFewerProjects: false, nRisk3: true },
  { amounts: [4700, 4200, 4500], matches: [42, 44, 29], mKnows: false, nFewerProjects: true, nRisk3: true },
  { amounts: [4800, 3400, 4500], matches: [44, 43, 34], mKnows: false, nFewerProjects: false, nRisk3: false },
  { amounts: [4900, 4000, 4600], matches: [45, 43, 30], mKnows: false, nFewerProjects: true, nRisk3: true },
  { amounts: [4800, 3500, 4300], matches: [39, 47, 32], mKnows: true, nFewerProjects: false, nRisk3: false },
];
const companies = ['L', 'M', 'N'];
const weights = [20, 10, 30, 20, 30];
const estimateRating = (amount: number) => amount <= 4000 ? 4 : amount <= 5000 ? 2 : 0;
const natural = (n: number) => n.toLocaleString('ja-JP');
const cBank = [
  'C社内のシステムに関するプロジェクトの管理経験を有する，N社以外のベンダ要員を増員する。',
  'C社の会計業務に関する業務マニュアルを整備し，N社の要員に研修を実施する。',
  'パッケージの機能をC社の業務向けにカスタマイズするために，N社の要員を増員する。',
  'パッケージを適用する際のC社の業務プロセス，運用フローの見直しについて，C社内の有識者社員から成る検討要員を増員する。',
];
const dBank = ['解決されずに残っている課題の増加', '業務プロセス，運用フローの改訂作業量の増加',
  '業務プロセス，運用フローのレビューでの指摘の増加', '作り込み機能の増加'];
const riskNames = [
  '要求機能に対するパッケージの適合度が低いので，業務プロセス，運用フローの変更項目が多く，業務設計が遅延する。',
  'C社の会計業務に対する理解が進まず，適用可能な業務プロセス，運用フローの合意が取れず，業務設計が遅延する。',
  'プロジェクト経験数が想定よりも少なく，プロジェクト遂行能力が十分でないので，重大な課題の解決が進まない。',
];
const probability = ['', '低い', '普通', '高い'];
const severity = ['', '小', '中', '大'];

export function spring2016Pm6Model(values: number[]) {
  const m = profile(values, scenarios);
  const knowledge = [4, m.mKnows ? 4 : 0, 4], experience = [4, 4, m.nFewerProjects ? 0 : 2];
  const risks = [
    [[1, 3], [1, 3], [2, 3]],
    [[1, 2], [m.mKnows ? 1 : 3, 2], [1, 2]],
    [[1, 3], [1, 3], [m.nRisk3 ? 2 : 1, 3]],
  ];
  const ratings = companies.map((_, index) => [
    m.matches[index] >= 40 ? 4 : m.matches[index] >= 30 ? 2 : 0,
    2, knowledge[index], experience[index], estimateRating(m.amounts[index]),
  ]);
  const costPerRisk = m.amounts.map(amount => amount / 10);
  const adjustedCosts = m.amounts.map((amount, index) =>
    amount + risks.filter(row => row[index][0] * row[index][1] >= 6).length * costPerRisk[index]);
  const score = (row: number[]) => row.reduce((total, grade, i) => total + grade * weights[i], 0);
  const totals = ratings.map(score);
  const adjustedTotals = ratings.map((row, index) => score([...row.slice(0, 4), estimateRating(adjustedCosts[index])]));
  const highest = totals.indexOf(Math.max(...totals));
  const eChoices = [costPerRisk[1], costPerRisk[2], costPerRisk[0], 2 * costPerRisk[2]];
  return { ...m, ratings, risks, costPerRisk, adjustedCosts, totals, adjustedTotals, highest, eChoices };
}

function spring2016Pm6Build(values: number[]) {
  const m = spring2016Pm6Model(values);
  const ratings = m.ratings.map(row => row.map((value, i) => value * weights[i]));
  const evaluationRows = [
    ['評価基準', '要求機能数50に対する適合数：80%以上 4、60%以上80%未満 2、60%未満 0',
      '拡張性：有 2、無 0', '高 4、中 2、低 0', '多 4、中 2、少 0',
      'C社予算上限5,000万円に対する見積金額：80%以下 4、80%超100%以下 2、100%超 0', ''],
    ['重み', ...weights.map(String), ''],
    ...companies.flatMap((company, i) => [
      [company + '社 提案内容', '適合数：' + m.matches[i], '有', m.ratings[i][2] === 4 ? '高' : '低',
        ({ 0: '少', 2: '中', 4: '多' })[m.ratings[i][3] as 0 | 2 | 4], natural(m.amounts[i]), ''],
      [company + '社 評点', i === 2 ? '網掛け' : String(ratings[i][0]), ...ratings[i].slice(1, 4).map(String),
        i === 1 ? '［a］' : String(ratings[i][4]), i === 0 ? String(m.totals[0]) : '網掛け'],
    ]),
  ];
  return body([
    p('問6 ソフトウェアパッケージ導入時の調達先選定に関する次の記述を読んで，設問1，2に答えよ。'),
    p('C社では，会計システムの再構築を考えており，プロジェクト計画の策定中である。本プロジェクトの目的は，業務の効率向上と，標準化による運用保守コストの削減である。目的実現のための方式案として，ソフトウェアパッケージ（以下，パッケージという）の活用を検討している。ここで，業務プロセス及び運用フローについては，パッケージの機能だけで実現する計画である。'),
    p('〔比較検討の進め方〕パッケージの比較検討は，次の手順で進める。'),
    p('手順1：C社の業務要件に近いと思われるパッケージを調査した結果，有力と判断した3種類のパッケージ製品について，要件定義から本番稼働までの概算見積を含む提案を，それぞれのパッケージベンダ（L社，M社，N社）に依頼する。各社提案について，評価項目に基づいた評価を実施する。'),
    p('手順2：提案されたパッケージを導入した場合のリスク分析を行い，対策を検討した上で，リスクに対する評価を実施し，総合的に判断する。'),
    p('設問1 本プロジェクトのプロジェクトマネージャ（PM）は，手順1に従い，L社，M社，N社からの提案内容を評価した。その結果を表1に示す。評価項目における各社の評点は，評価項目ごとの評価基準に重みを乗じて算出し，評点の合計を総合評価とする。PMが行った作業に関する次の記述中及び表中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    table('表1 各社提案の評価', ['項目', 'パッケージの機能の適合度', 'パッケージの機能の拡張性', 'ベンダの業界知識', 'ベンダのプロジェクト経験数', '概算見積金額（万円）', '総合評価'], evaluationRows),
    p('注記　網掛けの部分は表示していない。表1で総合評価の値が最も高いのは［b］社であった。'),
    p('設問2 手順2でPMが行ったリスク評価，及びパッケージ選択に関する次の記述中及び表中の［空欄］に入れる最も適切な答えを，解答群の中から選べ。'),
    p('〔パッケージ導入に関するリスク分析の状況〕C社のプロジェクト管理規程では，表2に示すリスク評価マトリックスを用いて，発生確率と影響度の積の値で対策の優先度を決定する。値が6以上のリスク項目は，リスク発生時の対策が必要と判断する。プロジェクト計画時に，対策が必要なリスク項目ごとに，概算見積費用の10%を，リスク発生時の対策費用として盛り込むことにしている。PMが表1を基にリスクを洗い出し，評価を行った結果を表3に示す。'),
    table('表2 リスク評価マトリックス', ['発生確率＼影響度', '小（1）', '中（2）', '大（3）'], [
      ['高い（3）', '3', '6（点網）', '9（斜線）'], ['普通（2）', '2', '4', '6（点網）'], ['低い（1）', '1', '2', '3'],
    ]),
    p('凡例　斜線：非常に高い優先度、点網：高い優先度、白地：低い優先度。'),
    table('表3 PMによるリスク評価の結果', ['項番', 'リスク', ...companies.flatMap(company =>
      [company + '社 発生確率', company + '社 影響度', company + '社 リスク対策内容'])],
    m.risks.map((row, i) => [String(i + 1), riskNames[i], ...row.flatMap(([prob, impact], j) =>
      [probability[prob], severity[impact], i === 0 && j === 2 ? '［c］' : '網掛け'])])),
    p('注記　網掛けの部分は表示していない。'),
    p('リスク評価の結果から，例えば項番1のリスクに対するN社パッケージへの対応として，プロジェクト立上げ時点に予防措置を講じていたとしても，［d］を契機にリスク対策を発動しなければならなくなったときのために，［e］万円のリスク対策費用を盛り込む必要があるといえる。'),
    p('リスク評価結果から必要となるリスク対策費用を各社の概算見積金額に加えて，各社提案の評価をやり直した結果，総合評価の値の大小関係に変わりがないことから，表1の総合評価の値が最も大きいパッケージを採択して会計システムを再構築するプロジェクト計画の策定を進めることにした。'),
  ], [
    { id: 'a', choices: choices([0, 60, 120]) }, { id: 'b', choices: choices(companies) }, { id: 'c', choices: choices(cBank) },
    { id: 'd', choices: choices(dBank) }, { id: 'e', choices: choices(m.eChoices) },
  ], [
    { id: 'a', bank: 'a', correct: [0, 60, 120].indexOf(ratings[1][4]) }, { id: 'b', bank: 'b', correct: m.highest },
    { id: 'c', bank: 'c', correct: 3 }, { id: 'd', bank: 'd', correct: 1 }, { id: 'e', bank: 'e', correct: 1 },
  ],
  '設問1：M社の概算見積金額は' + natural(m.amounts[1]) + '万円で，5,000万円に対して' + (m.amounts[1] / 50) +
  '%である。評価基準の' + m.ratings[1][4] + 'に重み30を乗じ，評点は' + ratings[1][4] + '。' +
  '評点を合計するとL社' + m.totals[0] + '，M社' + m.totals[1] + '，N社' + m.totals[2] + 'となり，' +
  companies[m.highest] + '社が最も高い。設問2：N社の項番1は2×3＝6で対策が必要である。' +
  'パッケージだけで運用する前提なので，機能を作り込まず，業務プロセスと運用フローの見直しを行う。' +
  'リスクが現実化しつつあることは，改訂作業量の増加から把握できる。N社の当該リスク1件に備える費用は' +
  natural(m.amounts[2]) + '万円の10%で' + m.costPerRisk[2] + '万円。' +
  '全件分を加えた見積はL社' + natural(m.adjustedCosts[0]) + '万円，M社' + natural(m.adjustedCosts[1]) + '万円，N社' +
  natural(m.adjustedCosts[2]) + '万円で，再評価後も総合評価の順位は変わらない。');
}

export const legacy2016SpringPm6Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-6', title: 'パッケージ導入の加重評価とリスク対策費',
  version: '3.3.0', reference: [0], fields: [field('各提案の適合数・見積額・リスク条件の組', 0, scenarios.length - 1)],
  sourceAnswer: 'ウ／ア／エ／イ／イ',
  notes: '物理PDF p.26–29。5欄、解答群3/3/4/4/4。重み付き評価・非表示の評点、確率と影響度の積、6以上、項目ごとに10%、パッケージ標準機能だけで実現、対策後の大小関係を維持。入力は整数の万円と件数。60%/80%及び見積80%の境界を含む5案を全列挙し、独立に加重評価・対策費・全解答群の正否を計算する。業務プロセス見直しと改訂作業量の直接的対応を問うc/dは固定する。',
  publicNotes: '各社の提案条件・概算見積金額と関連するリスクを変更し，評価表，正答，解説を更新しました。',
  build: spring2016Pm6Build,
};
