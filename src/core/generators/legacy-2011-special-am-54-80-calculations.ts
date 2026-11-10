import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';
import { figure, p, strings, type GeneratedBody } from './definition';
import { capacityFigure, demandFigure, formatNumber, growthShareFigure, inspectionFigure, inventoryFigure, organizationFigure, tariffChoiceFigures } from './legacy-2011-special-am-54-80-figures';
import { capacityCases, demandCases, inspectionCases, inventoryMovements, matrixCells, matrixTargets, tariffFigures, tariffKinds } from './legacy-2011-special-am-54-80-models';
import { special2011Am5480Source as source } from './legacy-2011-special-am-54-80-source';

function draw(definition: BookletFigureDefinition, index: number, caption: string) {
  return figure(definition.profile, [index], caption, definition.alt([index]));
}
function uniqueIndex(choices: readonly boolean[]) {
  const answer = choices.indexOf(true);
  if (answer < 0 || answer !== choices.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2011年度特別試験旧午前の正答を一意に確定できません');
  return answer;
}

function tariff(index: number): GeneratedBody {
  const plots = tariffFigures(index);
  const descriptions = plots.map(points => {
    const slopes = points.slice(1).map(([x, y], i) => (y - points[i][1]) / (x - points[i][0]));
    if (slopes.every(slope => slope < 0)) return '使用量が増すと利用料金が下がる';
    if (slopes.at(-1) === 0) return '一定額に達すると利用料金が増えない';
    if (slopes.every(slope => slope === slopes[0])) return '使用量に比例して利用料金が増える';
    if (slopes.every((slope, i) => !i || slope < slopes[i - 1])) return '利用料金は増えるが増分の単価は下がる';
    return '利用料金が増え，増分の単価も上がる';
  });
  const rule = [
    '利用料金は増えるが増分の単価は下がる', '利用料金が増え，増分の単価も上がる',
    '一定額に達すると利用料金が増えない', '使用量に比例して利用料金が増える',
  ][index];
  const correctIndex = uniqueIndex(descriptions.map(description => description === rule));
  return {
    prompt: [p(index === 0 ? source[57].prompt : `コンピュータシステムの利用料金を${tariffKinds[index]}方式にしたときのグラフはどれか。`)],
    choices: tariffChoiceFigures.map((definition, i) => [draw(definition, index, source[57].choices[i])]),
    correctIndex,
    explanation: `${tariffKinds[index]}では${rule}。縦軸は総額なので，グラフの傾きが使用量を増やした分の単価を表す。`
      + descriptions.map((description, i) => `${'アイウエ'[i]}は${description}。`).join(''),
  };
}

function growthShare(index: number): GeneratedBody {
  const target = matrixTargets[index];
  const cell = matrixCells.find(cell => cell.label === target)!;
  const correctIndex = cell.highShare ? (cell.highGrowth ? 0 : 1) : (cell.highGrowth ? 2 : 3);
  const decisions = ['資金流入が大きく，将来の投資も必要', '資金の供給源となり，追加投資の必要性は小さい', '今の資金流入は小さいが，投資で成長できる可能性がある', '流入が小さく，追加投資より撤退を検討する'];
  return {
    prompt: [p(source[65].prompt.replace('，bに該当', `，${target}に該当`)), draw(growthShareFigure, index, '市場成長率と市場占有率の図')],
    choices: strings([...source[65].choices]), correctIndex,
    explanation: `${target}は市場成長率が${cell.highGrowth ? '高く' : '低く'}，市場占有率が${cell.highShare ? '大きい' : '小さい'}区画である。占有率が資金流入の大きさ，成長率が投資の必要性に関係するので，${decisions[correctIndex]}。他の記述は`
      + ['b', 'd', 'a', 'c'].filter(label => label !== target).join('・') + 'の区画に対応する。',
  };
}

function demand(index: number): GeneratedBody {
  const { noDemandPrice, observedPrice, observedDemand, targetPrice, firstChoice } = demandCases[index];
  const targetGap = noDemandPrice - targetPrice;
  const observedGap = noDemandPrice - observedPrice;
  const expected = observedDemand * targetGap / observedGap;
  const choices = Array.from({ length: 4 }, (_, i) => firstChoice + i * 5000);
  return {
    prompt: [p(source[67].prompt), draw(demandFigure, index, '価格と需要の三つの条件')],
    choices: strings(choices.map(formatNumber)),
    correctIndex: uniqueIndex(choices.map(choice => choice === expected)),
    explanation: `一次式なので，需要が0の価格からの値下げ幅に需要が比例する。値下げ幅が${formatNumber(observedGap)}円のとき需要は${formatNumber(observedDemand)}個，求める幅は${formatNumber(targetGap)}円。よって ${formatNumber(observedDemand)} × ${formatNumber(targetGap)} ÷ ${formatNumber(observedGap)} ＝ ${formatNumber(expected)}個となる。`,
  };
}

function capacity(index: number): GeneratedBody {
  const { target, durationTenths, machines, hours } = capacityCases[index];
  const requiredTenths = durationTenths.map(duration => target * duration);
  const availableTenths = machines.map((count, i) => count * hours[i] * 10);
  const correctIndex = uniqueIndex(requiredTenths.map((required, i) => required > availableTenths[i]));
  return {
    prompt: [p(source[71].prompt.replace('1,000個', `${formatNumber(target)}個`)),
      draw(capacityFigure, index, '各工程の製造時間・台数・生産能力')],
    choices: strings([...source[71].choices]), correctIndex,
    explanation: '工程ごとに，必要時間は製造個数×1個の時間，使用可能時間は台数×1台の生産能力。必要時間と使用可能時間は順に'
      + requiredTenths.map((required, i) => `${'ABCD'[i]}が${formatNumber(required / 10)}時間対${formatNumber(availableTenths[i] / 10)}時間`).join('，')
      + `。必要時間が上回るのは工程${'ABCD'[correctIndex]}だけである。`,
  };
}

function organization(index: number): GeneratedBody {
  const analyses = [
    { correctIndex: 1, detail: '経営者の下に生産・販売・研究開発・経理・人事が直接置かれ，専門機能で部門を分けている。' },
    { correctIndex: 0, detail: '経営者の下に事業ごとの責任単位があり，各事業がそれぞれ生産・販売・経理をもっている。' },
    { correctIndex: 2, detail: '刷新や移転という個別の活動を進めるために担当者を集め，それぞれの活動の責任者が指揮している。' },
    { correctIndex: 3, detail: '設計担当とテスト担当は，専門機能の長と刷新活動の責任者の両方から指揮を受ける。' },
  ] as const;
  const { correctIndex, detail } = analyses[index];
  return {
    prompt: [
      p(index === 2 ? '図の各担当者は，刷新又は移転が完了するまでその取組を担当する。' + source[73].prompt : source[73].prompt),
      draw(organizationFigure, index, '企業組織の指揮系統'),
    ],
    choices: strings([...source[73].choices]), correctIndex,
    explanation: detail + `この特徴は${source[73].choices[correctIndex]}に対応する。事業部制は事業単位，職能別は専門機能単位，プロジェクト型は個別の取組単位で組織を編成し，マトリックス型は二つの指揮系統を重ねる。`,
  };
}

function inspection(index: number): GeneratedBody {
  const { defectTenths, costs } = inspectionCases[index];
  const goodTenths = 10 - defectTenths;
  const expectedTenths = costs.map(([good, defect]) => goodTenths * good + defectTenths * defect);
  const correctIndex = uniqueIndex(expectedTenths.map(cost => cost === Math.min(...expectedTenths)));
  return {
    prompt: [p(source[75].prompt.replace('0.9', (goodTenths / 10).toFixed(1)).replace('0.1', (defectTenths / 10).toFixed(1))),
      draw(inspectionFigure, index, '受入検査の案別の費用')],
    choices: strings([...source[75].choices]), correctIndex,
    explanation: `良品費用×${(goodTenths / 10).toFixed(1)}に，不良品費用×${(defectTenths / 10).toFixed(1)}を加える。1個当たりの期待費用は`
      + expectedTenths.map((cost, i) => `案${'ABCD'[i]}が${formatNumber(cost / 10)}`).join('，')
      + `。最も低いのは案${'ABCD'[correctIndex]}である。`,
  };
}

function inventory(index: number): GeneratedBody {
  const movements = inventoryMovements(index);
  const layers: { units: number; price: number }[] = [];
  const lastInFirstOut: { units: number; price: number }[] = [];
  for (const { units, price } of movements) {
    if (price !== null) {
      layers.push({ units, price });
      lastInFirstOut.push({ units, price });
    } else {
      removeInventory(layers, -units, 'first');
      removeInventory(lastInFirstOut, -units, 'last');
    }
  }
  const expected = sumLayerCosts(layers);
  const count = layers.reduce((sum, layer) => sum + layer.units, 0);
  const arrivals = movements.filter(movement => movement.price !== null);
  const totalUnits = arrivals.reduce((sum, movement) => sum + movement.units, 0);
  const totalCost = arrivals.reduce((sum, movement) => sum + movement.units * movement.price!, 0);
  const choices = index === 0 ? [...source[76].choices] : [
    expected, sumLayerCosts(lastInFirstOut), totalCost * count / totalUnits, arrivals.at(-1)!.price! * count,
  ].sort((a, b) => a - b).map(formatNumber);
  return {
    prompt: [p(source[76].prompt), draw(inventoryFigure, index, '商品Aの受払記録')],
    choices: strings(choices), correctIndex: uniqueIndex(choices.map(choice => choice === formatNumber(expected))),
    explanation: '先入先出法では売上のたびに最も古い受入分から数量を引く。月末に残るのは'
      + layers.map(({ units, price }) => `単価${formatNumber(price)}円の${units}個`).join('と')
      + `である。数量×単価を合計すると${formatNumber(expected)}円となる。`,
  };
}

function removeInventory(layers: { units: number; price: number }[], quantity: number, end: 'first' | 'last') {
  let left = quantity;
  while (left > 0) {
    const layer = end === 'first' ? layers[0] : layers.at(-1);
    if (!layer) throw new DataError('PARAMETER_CONSTRAINT', '在庫数量を超える払出です');
    const taken = Math.min(left, layer.units);
    layer.units -= taken;
    left -= taken;
    if (layer.units === 0) {
      if (end === 'first') layers.shift();
      else layers.pop();
    }
  }
}
function sumLayerCosts(layers: readonly { units: number; price: number }[]) {
  return layers.reduce((sum, { units, price }) => sum + units * price, 0);
}

export const special2011Am5480Calculations: Record<number, { name: string; notes: string; build: (index: number) => GeneratedBody }> = {
  57: { name: '課金方式と料金曲線', notes: '四選択肢がそれぞれ同じ軸のグラフ。傾きの増減、上限と一定単価を判定し、図の配置を保持する。', build: tariff },
  65: { name: '事業分類の区画', notes: '二つの軸の向きと四つの区画を保持し、本文が参照する区画だけを変える。', build: growthShare },
  67: { name: '設定価格と需要', notes: '価格と需要の桁、一次式、入力例二つと空欄一つを維持。選択肢は同じ5,000個間隔で、昇順のまま正答を含める。', build: demand },
  71: { name: '必要個数と工程能力', notes: '四工程、1個の時間は小数第1位、台数と1台の時間は整数、同じ列と単位を維持。能力不足を一工程だけにする。', build: capacity },
  73: { name: '部門構造と指揮線', notes: '単一の組織図を根拠に四組織の種別を選ぶ。図には解答の分類名を置かず、部門名と指揮線を維持する。', build: organization },
  75: { name: '良品・不良品の確率と費用', notes: '確率は小数第1位、互いに補数。四案の二種類の費用を表で比較し、最小の期待費用は一意。', build: inspection },
  76: { name: '在庫受払数量と単価', notes: '原問と同じ6行・4受入・2払出、整数円。生成値の誤答は後入先出、総平均、最終仕入原価による値で、昇順と間隔を保持する。', build: inventory },
};
