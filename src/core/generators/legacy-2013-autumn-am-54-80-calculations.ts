import { field, figure, p, strings, table, type GeneratedBody, type GenerationDefinition } from './definition';
import { autumn2013Am5480Profiles as profile, legacy2013AutumnAm5480Figures as figures } from './legacy-2013-autumn-am-54-80-figures';
import {
  autumn2013AmEffortCases, autumn2013AmScreenEffort, autumn2013AmProductionCases,
  autumn2013AmReceiptCount, autumn2013AmReceiptRows,
} from './legacy-2013-autumn-am-54-80-models';
import { autumn2013Am5480Source as source } from './legacy-2013-autumn-am-54-80-source';

export type FiniteProblem = {
  fields: GenerationDefinition['fields'];
  notes: string;
  build: (index: number) => GeneratedBody;
};

export const yen = (n: number) => n.toLocaleString('en-US');
export function autumn2013Am5480Figure(id: string, index: number, caption: string) {
  const registered = figures.find(item => item.profile === id);
  if (!registered) throw new Error('FIGURE_PROFILE');
  return { ...figure(id, [index], caption, registered.alt([index])), captionPresentation: 'accessible' as const };
}

function effort(index: number): GeneratedBody {
  const { counts: [small, mid, large, complex], review, managementPercent } = autumn2013AmEffortCases[index];
  const [smallEffort, midEffort, largeEffort, complexEffort] =
    [autumn2013AmScreenEffort[0][0], autumn2013AmScreenEffort[1][1], ...autumn2013AmScreenEffort[2].slice(1)];
  const work = (small * smallEffort + mid * midEffort + large * largeEffort + complex * complexEffort) / 10;
  const management = (work + review) * managementPercent / 100;
  const total = work + review + management;
  const choices = [work, work + review, work * (100 + managementPercent) / 100 + review, total];
  const statement = `全部で100画面から構成されるシステムの画面作成作業において，規模が小かつ複雑度が単純な画面が${small}，中規模かつ普通の画面が${mid}，大規模かつ普通の画面が${large}，大規模かつ複雑な画面が${complex}である場合の工数を，表の標準作業日数を用いて標準タスク法で見積もると何人日になるか。ここで，全部の画面のレビューに${review}人日を要し，作業の管理にレビューを含めた作業工数の${managementPercent}％を要するものとする。`;
  return {
    prompt: [p(index === 0 ? source[54].prompt : statement), autumn2013Am5480Figure(profile.effort, 0, '画面当たりの標準作業日数')],
    choices: strings(choices.map(String)), correctIndex: 3,
    explanation: `画面の作成工数は${small}×0.4＋${mid}×0.9＋${large}×1.0＋${complex}×1.2＝${work}人日。レビュー${review}人日を加えた${work + review}人日の${managementPercent}％が管理工数${management}人日なので、合計${total}人日。管理工数の計算からレビューを外すと${choices[2]}人日となり不足する。`,
  };
}

function production(index: number): GeneratedBody {
  const { availableA, availableB, profitX, profitY } = autumn2013AmProductionCases[index];
  const x = (2 * availableA - availableB) / 3, y = (2 * availableB - availableA) / 3;
  const answer = x * profitX + y * profitY;
  const xOnly = Math.min(availableA / 2, availableB) * profitX;
  const yOnly = Math.min(availableA, availableB / 2) * profitY;
  const switched = y * profitX + x * profitY;
  const candidates = [xOnly, yOnly, answer, switched].sort((a, b) => a - b);
  const statement = `製品X及びYを生産するために2種類の原料A，Bが必要である。製品1個の生産に必要となる原料の量と調達可能量は表に示すとおりである。製品XとYの1個当たりの販売利益が，それぞれ${profitX}円，${profitY}円であるとき，最大利益は何円か。`;
  return {
    prompt: [p(index === 0 ? source[75].prompt : statement), table('原料の必要量と調達可能量',
      ['原料', '製品Xの1個当たりの必要量', '製品Yの1個当たりの必要量', '調達可能量'],
      [['A', '2', '1', String(availableA)], ['B', '1', '2', String(availableB)]])],
    choices: strings(candidates.map(yen)), correctIndex: candidates.indexOf(answer),
    explanation: `Xをx個、Yをy個とすると、原料制約は2x＋y≦${availableA}、x＋2y≦${availableB}。利益が最大になる候補は、両制約の交点と各軸上の端点である。交点ではXが${x}個、Yが${y}個で、利益は${profitX}×${x}＋${profitY}×${y}＝${yen(answer)}円。Xだけは${yen(xOnly)}円、Yだけは${yen(yOnly)}円で、交点が最大である。交点の生産個数を取り違えるとBを${y + 2 * x}使い、調達可能量を超える。`,
  };
}

function fifo(index: number): GeneratedBody {
  const [opening, first, sale1, second, sale2] = autumn2013AmReceiptRows(index);
  const quantity = sale1.issued + sale2.issued;
  const takenFromFirst = quantity - opening.received;
  const cost = opening.received * opening.price + takenFromFirst * first.price;
  const inventoryValue = opening.received * opening.price + first.received * first.price;
  const averageBeforeFirstSale = inventoryValue / (opening.received + first.received);
  const beforeSecondCount = opening.received + first.received - sale1.issued;
  const beforeSecondValue = beforeSecondCount * averageBeforeFirstSale + second.received * second.price;
  const moving = sale1.issued * averageBeforeFirstSale + sale2.issued * beforeSecondValue / (beforeSecondCount + second.received);
  const monthly = quantity * (inventoryValue + second.received * second.price) / (opening.received + first.received + second.received);
  const comparison = cost - 160 * (opening.received / 100);
  return {
    prompt: [p(source[77].prompt), autumn2013Am5480Figure(profile.receipt, index, '商品の前月繰越と受払い')],
    choices: strings([comparison, cost, moving, monthly].map(yen)), correctIndex: 1,
    explanation: `先に受け入れた分から払い出す。15日は前月繰越の${sale1.issued}個を${opening.price}円で計上する。25日は前月繰越の残り${opening.received - sale1.issued}個を${opening.price}円、5日仕入れの${takenFromFirst}個を${first.price}円で計上する。売上原価は${opening.received}×${opening.price}＋${takenFromFirst}×${first.price}＝${yen(cost)}円である。30日の翌月繰越は売上に含めない。`,
  };
}

export const autumn2013Am5480Calculations: Readonly<Record<number, FiniteProblem>> = {
  54: {
    fields: [field('画面内訳・レビュー日数・管理率の組合せ', 0, autumn2013AmEffortCases.length - 1)],
    notes: '100画面の四分類、3×3の日数表、レビュー込みの管理率を保持。全4組の見積りは丸めなしの整数人日。画面作成のみ、管理なし、レビュー分の管理漏れ、全工数を昇順で提示する。',
    build: effort,
  },
  75: {
    fields: [field('原料の調達可能量と単価の組合せ', 0, autumn2013AmProductionCases.length - 1)],
    notes: '原の二原料・二製品・1個当たり利益と資源制約を保持。各軸の端点、整数の交点、交点の製品数を入れ替えた実行不能な点の四つを整数円で昇順表示。原の最小間隔1000円に対し条件の最小間隔800円。',
    build: production,
  },
  77: {
    fields: [field('数量倍率と単価加算の組合せ', 0, autumn2013AmReceiptCount - 1)],
    notes: '原の六行、受入・払出の結合見出し、先入先出の当月売上原価を保持。受払個数1～3倍、3単価に0・5・10円加算。移動平均と月次総平均を誤答として連動し、下側の原比較値は実在の在庫評価式とみなさず原の差160円を数量倍率に比例させる限定調整。四択は昇順の整数円で追加丸めなし。',
    build: fifo,
  },
};
