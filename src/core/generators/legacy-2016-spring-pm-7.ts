import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, table } from './definition';
import { spring2016PmPageAssetId } from './legacy-2016-spring-pm-materials';
import { spring2016Pm0508Body as body, spring2016Pm0508Choices as choices, spring2016Pm0508Figure as figure,
  spring2016Pm0508Profile as profile } from './legacy-2016-spring-pm-05-08-shared';

const products = ['S', 'T', 'U', 'V', 'W', 'X'];
const originalSales = [
  [4782, 5217, 2400], [1321, 1729, 951], [1312, 3465, 2079],
  [4732, 24121, 4824], [3100, 4013, 1605], [1689, 2712, 1356],
];
const profiles = [
  { dataOrder: [0, 1, 2, 3, 4, 5], cost: 300, customers: 600, purchases: 1240 },
  { dataOrder: [4, 2, 1, 3, 0, 5], cost: 300, customers: 300, purchases: 1505 },
  { dataOrder: [5, 1, 0, 3, 4, 2], cost: 400, customers: 700, purchases: 1105 },
  { dataOrder: [1, 0, 2, 3, 5, 4], cost: 600, customers: 300, purchases: 1205 },
  { dataOrder: [2, 5, 4, 3, 1, 0], cost: 360, customers: 720, purchases: 1205 },
  { dataOrder: [4, 2, 5, 3, 0, 1], cost: 480, customers: 250, purchases: 1505 },
];
const abBank = ['S', 'T', 'U', 'W', 'X'];
const cdBank = ['商品が欠品しないようにする', '商品の素材や味を見直す', '商品の認知度を高める', 'より価格が高い商品を勧める'];
const eBank = ['価格を上げれば', '購入人数が増えれば', '来店客数が増えれば', 'リピート率が上がれば'];
const gBank = [
  '投資効果はあるが，リピート率は低下', '投資効果はないが，リピート率は向上',
  '投資効果はあり，リピート率も向上', '投資効果はなく，リピート率も低下',
];
const originalF = [[1147, 444], [1412, -968], [2439, 60], [2823, 444]];
const nfmt = (value: number) => value.toLocaleString('ja-JP').replace('-', '－');
const pct = (customers: number, purchases: number) => 100 * (purchases - customers) / purchases;
export const spring2016Pm7Example = [5, 5, 3, 1, 1, 1];
export const spring2016Pm7ExampleAlt = (repeated: boolean) => '購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。' +
  (repeated ? '2回目以降の延べ購入回数10回を網掛けで示す。' : '');
export const spring2016Pm7ChartAlt = (rows: readonly { customers: number; rate: number; sales: number; label: string }[]) =>
  '横軸は購入人数（人）0〜6,000，縦軸はリピート率（%）0〜100。バブルの大きさは売上金額。左からおよその座標（人，%）は' +
  [...rows].sort((a, b) => a.customers - b.customers).map(row =>
    (row.label ? '［' + row.label + '］' : '') + '（' + nfmt(row.customers) + '，' + row.rate.toFixed(1) + '）').join('、') + '。';

export function spring2016Pm7Model(values: number[]) {
  const scenario = profile(values, profiles);
  const rows = scenario.dataOrder.map((index, i) => {
    const [customers, purchases, sales] = originalSales[index];
    return { product: products[i], customers, purchases, sales, rate: pct(customers, purchases),
      label: index === 0 ? 'a' : index === 2 ? 'b' : '' };
  });
  const target = rows.find(row => row.label === 'b')!;
  const addedSales = scenario.purchases * 300 * 2 / 1000;
  const total = target.sales + addedSales;
  const effect = addedSales - scenario.cost;
  const estimatedRate = pct(target.customers + scenario.customers, target.purchases + scenario.purchases);
  const improved = estimatedRate > target.rate, worthwhile = effect > scenario.cost;
  const wrongBase = target.sales + scenario.customers * 600 / 1000;
  const fValues = values[0] === 0 ? originalF : [
    [addedSales, effect],
    [total / 2, total / 2 - target.sales - scenario.cost],
    [wrongBase, wrongBase - target.sales - scenario.cost],
    [total, effect],
  ];
  // Generated profiles retain a single whole-thousand display step.
  if (fValues.flat().some(value => !Number.isSafeInteger(value))) throw new Error('PARAMETER_CONSTRAINT');
  return { ...scenario, rows, target, addedSales, total, effect, estimatedRate, improved, worthwhile, fValues };
}

function spring2016Pm7Build(values: number[]) {
  const m = spring2016Pm7Model(values);
  const targetName = m.target.product;
  const result = body([
    p('問7 販売データの分析に関する記述を読んで，設問1，2に答えよ。'),
    p('B社は，洋菓子を店舗販売する小売店である。B社は，来期の事業方針として，顧客が自社の商品を繰り返し購入する回数を増やすことによって，売上を増加させることを考えた。そのために，効果的な販売促進活動につなげることを目的として，既に導入しているID-POSを利用して，顧客一人一人の購買履歴を分析した。'),
    p('ID-POSは，各顧客に顧客IDを設定し，顧客IDとその顧客の商品の購買履歴を管理するシステムであり，誰が，いつ，何を，幾つ購入したのかが分かる仕組みである。'),
    p('設問1 顧客の購買履歴の分析に関する次の記述中及び図中の［空欄］に入れる適切な答えを，解答群の中から選べ。'),
    p('B社は，ID-POSの購買履歴を活用し，ある商品カテゴリーを対象に，商品を購入した顧客と，その顧客が同じ商品を再び購入する傾向にあるかどうかの分析を行った。分析の方法として，購入人数と延べ購入回数からリピート率を算出した。'),
    p('購入人数は，対象期間中に同一顧客が複数回購入したときも1人としてカウントした場合の人数であり，延べ購入回数は，顧客が購入した延べの回数である。例えば，ある対象期間中に5回購入した顧客が2人，3回購入した顧客が1人，1回だけ購入した顧客が3人いた場合，購入人数は6人，延べ購入回数は16回となる（図1参照）。'),
    figure(7, 'purchases', values, '図1 購入人数と延べ購入回数の説明', spring2016Pm7ExampleAlt(false)),
    p('ここで，リピート率の算出式は，'),
    p('リピート率＝（延べ購入回数－購入人数）÷延べ購入回数×100'),
    p('とする。リピート率は，延べ購入回数に対して，2回目以降の延べ購入回数（＝延べ購入回数－購入人数）の割合を示す指標である。図1の例では，延べ購入回数が16回であり，2回目以降の延べ購入回数は図2に示すように10回であるので，リピート率は62.5%となる。'),
    figure(7, 'repeat-purchases', values, '図2 2回目以降の延べ購入回数の説明', spring2016Pm7ExampleAlt(true)),
    p('B社の商品のうちで日常的に販売されている商品S〜Xについて，顧客は，1回の購入で平均して同一商品を2個購入している。また，限られた一部の顧客だけが購入を繰り返すというような購入回数の大きな偏りはなかった。各商品の購入人数と延べ購入回数，売上金額は表1のとおりである。'),
    table('表1 各商品の購入人数，延べ購入回数，売上金額', ['商品', '購入人数（人）', '延べ購入回数（回）', '売上金額（千円）'],
      m.rows.map(row => [row.product, nfmt(row.customers), nfmt(row.purchases), nfmt(row.sales)])),
    p('これらの商品の購買履歴の分析を行うために，図3のバブルチャートを作成した。ここで，バブルの大きさは，売上金額を表す。'),
    figure(7, 'bubble-chart', values, '図3 購買履歴の分析結果', spring2016Pm7ChartAlt(m.rows)),
    p('今回分析した商品の中で，商品Vは，購入人数が多くリピート率も高いことから，商品Vを繰り返し購入してくれる顧客が多いと考えられる。商品［a］は，購入人数は多いが，リピート率が低いので，商品そのものに魅力がないと考えられ，売上を増加させるためには，［c］必要がある。商品［b］は，購入人数は少ないが，リピート率が高いので，限られた顧客に人気が高い商品と考えられる。したがって，試食会を開催するなどして，［d］ことによって［e］，売上の増加が見込まれる。'),
    p('設問2 売上拡大の施策に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。'),
    p('B社では，広告を行って新規顧客を開拓し，その新規顧客にも繰り返し購入してもらうことで売上の増加を図る計画を立て，商品' + targetName + 'について効果を見積もってみた。費用と効果の見積りを表2に示す。'),
    p('商品' + targetName + 'の価格は300円，1回の購入で商品' + targetName + 'を平均2個購入するものとする。また，効果見積りは，過去1年間の実績値に対する値とする。'),
    p('ここで，効果額は，売上金額の増加額から広告費用を引いた額とする。投資効果は，広告費用に対する効果額の割合であり，その割合が1よりも大きければ，投資効果があると評価する。'),
    table('表2 費用と効果の見積り', ['区分', '項目', '見積り'], [
      ['費用', '広告費用', nfmt(m.cost) + '千円'], ['効果', '購入人数の増加', nfmt(m.customers) + '人'],
      ['効果', '延べ購入回数の増加', nfmt(m.purchases) + '回'],
    ]),
    p('この施策によって，商品' + targetName + 'の［f］となる。したがって，この施策は，商品' + targetName + 'に関しては［g］すると考えられる。'),
  ], [
    { id: 'ab', choices: choices(abBank) }, { id: 'cd', choices: choices(cdBank) }, { id: 'e', choices: choices(eBank) },
    { id: 'f', choices: choices(m.fValues.map(([total, effect]) => '売上金額は' + nfmt(total) + '千円となり，効果額は' + nfmt(effect) + '千円')) },
    { id: 'g', choices: choices(gBank) },
  ], [
    { id: 'a', bank: 'ab', correct: abBank.indexOf(m.rows.find(row => row.label === 'a')!.product) },
    { id: 'b', bank: 'ab', correct: abBank.indexOf(targetName) },
    { id: 'c', bank: 'cd', correct: 1 }, { id: 'd', bank: 'cd', correct: 2 }, { id: 'e', bank: 'e', correct: 1 },
    { id: 'f', bank: 'f', correct: 3 }, { id: 'g', bank: 'g', correct: m.worthwhile ? (m.improved ? 2 : 0) : (m.improved ? 1 : 3) },
  ],
  '設問1：リピート率は延べ購入回数のうち初回購入を除いた割合である。人数が多く率の低い［a］は商品' +
  m.rows.find(row => row.label === 'a')!.product + 'で，味や素材の見直しが適切。人数が少なく率の高い［b］は商品' +
  targetName + 'で，試食会で認知度を高めて購入人数を増やす。来店するだけでは購入人数は増えたとはいえず，既に高いリピート率を上げることを直接の目的にしない。' +
  '設問2：購入1回当たり300円×2個＝600円なので，' + nfmt(m.purchases) + '回の増加で' + nfmt(m.addedSales) +
  '千円増える。新しい売上は' + nfmt(m.target.sales) + '＋' + nfmt(m.addedSales) + '＝' + nfmt(m.total) +
  '千円，効果額は増加額から広告費用' + nfmt(m.cost) + '千円を引いた' + nfmt(m.effect) + '千円である。' +
  '効果額は広告費用' + (m.worthwhile ? 'を超えるので投資効果はある。' : '以下なので投資効果はない。') +
  'リピート率は約' + m.target.rate.toFixed(1) + '%から約' + m.estimatedRate.toFixed(1) + '%へ' +
  (m.improved ? '向上' : '低下') + 'する。購入人数と延べ購入回数の両方に増加分を足して比較する。' +
  'ID-POSはIdentification - Point of Sale（顧客識別情報付き販売時点情報管理）で，顧客別に購買履歴を分析する。');
  result.contexts = [{ title: '公式正誤表（問7 表2）',
    blocks: [{ type: 'image', assetId: spring2016PmPageAssetId(2), caption: '原冊子p.32 表2の延べ購入回数の単位の訂正' }] }];
  return result;
}

export const legacy2016SpringPm7Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-7', title: '購買履歴のリピート率と広告投資効果',
  version: '3.3.0', reference: [0], fields: [field('商品別購入履歴と広告施策の見積条件の組', 0, profiles.length - 1)],
  sourceAnswer: 'ア／ウ／イ／ウ／イ／エ／ア',
  fixedReferenceAssetIds: [spring2016PmPageAssetId(2)],
  notes: '物理PDF p.30–34。7欄。a/b共有5、c/d共有4、e/f/g各4。図1/2の分布説明、図3の2軸・売上円・空欄、表1/2、同一顧客の初回と延べ、平均2個、年間実績、投資効果の厳密な1超を保持。物理p.2の公式正誤表に従い本文中の1,240人を1,240回とし、原画像と訂正は別資料として示す。商品別の履歴と広告による増分・費用を6組で可変にし、丸めのない円→千円換算と全4通りの投資効果／率の分岐を検算する。選択肢fの参照値は公式解答群を保持し、生成時は基準売上の計上漏れ、1個のみ計上、人数を回数として計上する誤りを用いる。',
  publicNotes: '各商品に対応する購買履歴と広告の費用・効果の見積りを変更し，分析表，図，正答，解説を更新しました。購入回数の単位は公式正誤表の訂正に従いました。',
  build: spring2016Pm7Build,
};
