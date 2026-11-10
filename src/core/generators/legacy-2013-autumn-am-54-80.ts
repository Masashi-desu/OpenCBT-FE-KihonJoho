import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { autumn2013Am5480Source as source } from './legacy-2013-autumn-am-54-80-source';
import { autumn2013Am5480Knowledge as knowledge } from './legacy-2013-autumn-am-54-80-knowledge';
import { autumn2013Am5480Figure, autumn2013Am5480Calculations as calculations, type FiniteProblem } from './legacy-2013-autumn-am-54-80-calculations';
import { autumn2013Am5480Profiles as profile } from './legacy-2013-autumn-am-54-80-figures';
import { autumn2013AmFishbone } from './legacy-2013-autumn-am-54-80-models';

const charging = [
  [source[58].prompt, 2, '逓減課金では使用量が増えるほど追加料金の単価が小さくなる。利用料金の合計は増え続ける一方、グラフの傾きが区間ごとに緩やかになるウが対応する。アは合計額が減り、イは上限で水平になり、エは追加単価が上がる。'],
  ['ITサービスにおけるコンピュータシステムの利用料金を逓増課金方式にしたときのグラフはどれか。', 3,
    '逓増課金では使用量が増えるほど追加料金の単価が大きくなる。利用料金は増加し、傾きは区間を進むたびに急になるのでエが対応する。'],
  ['ITサービスにおけるコンピュータシステムの利用料金を上限付き従量課金方式にしたときのグラフはどれか。', 1,
    '一定量までは使用量に比例するので、原点から一定の正の傾きで増える。それを超えた分には課金しないため合計料金は増えず、水平になるイが対応する。'],
] as const;

const portfolios = [
  source[69].prompt,
  '市場シェアは大きいが成長率の低い既存事業と，成長率は高いが市場シェアが小さい新規事業がある。図に示すマトリックス表を用いたポートフォリオ類型で，両事業の事業計画や競争優位性を分析する目的はどれか。',
  '市場シェアがともに大きい二事業があるが，一方の市場だけが高成長である。図に示すマトリックス表を用いたポートフォリオ類型で，この違いを踏まえて事業計画や競争優位性を分析する目的はどれか。',
] as const;
const portfolioExplanations = [
  '市場成長率と市場シェアから各事業の相対的な位置を把握し、どの事業に資金・人員を配分するかを検討する。広告効果、個々の品質改善や季節変動の評価が直接の目的ではない。',
  '既存事業は左下、新規事業は右上に位置する。成長性・競争上の立場の違いを整理して、事業の目標や資金・人員配分の優先順位を判断するために使う。',
  '両事業はともに左側だが、高成長事業は上、もう一つの事業は下に位置する。市場の伸びの違いを資源配分の判断に反映する。広告・品質・季節変動の評価とは異なる。',
] as const;

const fishbonePrompts = [
  source[76].prompt,
  '工場で測定値がばらつく現象をbとし，特性要因図に整理した。図はその一部である。a，bの関係はどれか。',
  '受付から回答までの時間が長くなる現象をaとし，特性要因図に整理した。図はその一部である。a，bの関係はどれか。',
] as const;

const visual: Readonly<Record<number, FiniteProblem>> = {
  58: {
    fields: [field('利用料金の算定方式', 0, charging.length - 1)],
    notes: '使用量と利用料金の軸、原点、四つの折れ線の形を保持。本文で問う方式を逓減、逓増、上限つき比例へ変える。図の順序を固定し、数値目盛は付けない。',
    build(index) {
      const [statement, correctIndex, explanation] = charging[index];
      return {
        prompt: [p(statement)], correctIndex, explanation,
        choices: source[58].choices.map((_, i) => [autumn2013Am5480Figure(profile.charge, i, '使用量と利用料金')]),
      };
    },
  },
  69: {
    fields: [field('比較する事業の競争上の条件', 0, portfolios.length - 1)],
    notes: '二軸と原の空の2×2分類図、事業の位置づけを評価する目的を選ぶ形式を保持。比較対象の市場シェアと成長率を変える。広告測定等を正答とする別軸の可変案は分析手法そのものを変えるため採らず、目的の正答は固定する。',
    build(index) {
      return {
        prompt: [p(portfolios[index]), autumn2013Am5480Figure(profile.portfolio, 0, '事業の強みと魅力度')],
        choices: strings(source[69].choices), correctIndex: 1, explanation: portfolioExplanations[index],
      };
    },
  },
  76: {
    fields: [field('特性要因図の現象と枝の割当て', 0, autumn2013AmFishbone.length - 1)],
    notes: '一つの現象と一つの枝、矢印の向き、原因・手段・属性・目的の四役割を保持。実際の現象を設定し、図でa・bのどちらが結果側かを変える。',
    build(index) {
      const { head, branch } = autumn2013AmFishbone[index];
      return {
        prompt: [p(fishbonePrompts[index]), autumn2013Am5480Figure(profile.fishbone, index, '特性要因図の一部')],
        choices: strings(['原因', '手段', '属性', '目的'].map(relation => `${branch}は${head}の${relation}である。`)),
        correctIndex: 0,
        explanation: `特性要因図の主線は結果${head}に向かい、枝${branch}はその結果に影響する要因として合流する。したがって${branch}は${head}の原因である。実現手段・属性・目的を示す関係ではない。`,
      };
    },
  },
};

export const legacy2013AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const n = Number(number);
  const finite = calculations[n] ?? visual[n];
  const reviewed = knowledge[n];
  const fields = finite?.fields ?? [field('説明の対象・判断条件', 0, reviewed.variants.length)];
  const count = fields[0].maximum + 1;
  return {
    source: '2013h25a-fe-am-' + n,
    title: original.title,
    sourceAnswer: original.key,
    version: '3.2.0',
    fields,
    reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (finite?.notes ?? reviewed.notes),
    ...(n === 69 ? { answerVariation: 'fixed' as const } : {}),
    build(values) {
      const index = selectCase(values, count);
      if (finite) return finite.build(index);
      const scenario = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return {
        prompt: [p(scenario.prompt)], choices: strings(scenario.choices ?? original.choices),
        correctIndex: scenario.correctIndex, explanation: scenario.explanation,
      };
    },
  };
});
