import { figure, p, strings, type GeneratedBody } from './definition';
import { planningHours, planningSalesAlt, planningSalesSolution, planningSalesValues } from './legacy-2017-autumn-planning-model';
import { spring2015Am54Alt, spring2015Am54Durations, spring2015Am54Profile, spring2015Am64Profile } from './legacy-2015-spring-am-54-80-figures';
import { spring2015Am5480Source as source } from './legacy-2015-spring-am-54-80-source';

function arrowNetwork(index: number): GeneratedBody {
  const [a, b, c, d, e, f, g, h, i] = spring2015Am54Durations[index];
  const joinB = a + Math.max(b, e);
  const joinC = Math.max(a + f, joinB + Math.max(c, g));
  const result = Math.max(joinC + d, joinB + h) + i;
  const possibleEarlier = [
    a + b + c + d + i, a + b + g + d + i, a + b + h + i,
    a + e + c + d + i, a + e + g + d + i, a + e + h + i, a + f + d + i,
  ];
  const countEarlier = index === 3 ? 1 : index === 7 ? 3 : 2;
  const earlier = [...new Set(possibleEarlier.filter(days => days < result))].sort((left, right) => left - right).slice(-countEarlier);
  // These wrong estimates make either B and E, or C and G, serial.
  const serialBE = Math.max(a + f + d, a + b + e + Math.max(Math.max(c, g) + d, h)) + i;
  const serialCG = Math.max(a + f + d, joinB + c + g + d, joinB + h) + i;
  const later = [...new Set([serialBE, serialCG].filter(days => days > result))].sort((left, right) => left - right)
    .slice(0, 3 - countEarlier);
  const choices = index === 0 ? source[54].choices : [...earlier, result, ...later].map(String);
  if (choices.length !== 4 || new Set(choices).size !== 4 || !choices.includes(String(result))) throw new Error('PARAMETER_CONSTRAINT');
  return {
    prompt: [p(source[54].prompt), figure(spring2015Am54Profile, [index], '作業日数のアローダイアグラム', spring2015Am54Alt([index]))],
    choices: strings(choices), correctIndex: choices.indexOf(String(result)),
    explanation: '破線のダミーは先行関係を表し，作業日数は0日。BとEがそろう結合点は最早' + joinB +
      '日，C・G・Fがそろう結合点は最早' + joinC + '日になる。D経由は' + (joinC + d) +
      '日，H経由は' + (joinB + h) + '日で合流する。遅い方を待ってIの' + i +
      '日を加えるので，最短は' + result + '日である。並行する作業の日数を直列に足さない。',
  };
}

function salesTime(index: number): GeneratedBody {
  const data = planningSalesValues([index]);
  const result = planningSalesSolution([index]);
  const stem = source[64].prompt.replace('0.1時間短縮', planningHours(data.saving) + '時間短縮')
    .replace('6件にするには', data.target + '件にするには');
  const choices = result.choices.map(planningHours);
  return {
    prompt: [p(stem), figure(spring2015Am64Profile, [index], '1日の業務活動の時間分析表', planningSalesAlt([index]))],
    choices: strings(choices), correctIndex: choices.indexOf(planningHours(result.correct)),
    explanation: '1件当たりの訪問は' + planningHours(data.visit / data.count) + '時間。準備は' +
      planningHours(data.preparation / data.count) + '時間から' + planningHours(data.saving) + '時間短縮する。' +
      data.target + '件分の訪問' + planningHours(result.visit) + '時間と準備' + planningHours(result.preparation) +
      '時間を総業務時間から引くと，その他業務には' + planningHours(result.other) + '時間を使える。従来の' +
      planningHours(data.other) + '時間からの削減は' + planningHours(result.correct) + '時間。',
  };
}

const times = [
  [[7, 3], [5, 6], [4, 2]], [[2, 3], [3, 2], [5, 8]], [[2, 3], [3, 2], [6, 8]], [[3, 3], [2, 7], [7, 2]],
  [[3, 2], [2, 3], [5, 8]], [[3, 2], [2, 3], [6, 8]], [[3, 2], [4, 3], [7, 4]], [[3, 2], [4, 3], [8, 4]],
];
const products = ['A', 'B', 'C'];
const offeredOrders = [[0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 1, 0]];
function machining(index: number): GeneratedBody {
  const durations = times[index];
  const completion = offeredOrders.map(order => {
    let machine1 = 0, machine2 = 0;
    for (const product of order) {
      machine1 += durations[product][0];
      machine2 = Math.max(machine1, machine2) + durations[product][1];
    }
    return machine2;
  });
  const minimum = Math.min(...completion);
  const correctIndex = completion.indexOf(minimum);
  return {
    prompt: [...source[78].prompt.split('\n').map(p), {
      type: 'table', caption: '製品ごとの加工時間', captionPresentation: 'accessible',
      columns: ['製品＼機械', 'M1', 'M2'], rows: durations.map((row, i) => [products[i], ...row.map(String)]),
    }],
    choices: strings(source[78].choices), correctIndex,
    explanation: 'M1は前の製品を加工し終えると次の製品を始める。各製品のM2開始は，その製品のM1完了と前の製品のM2完了の遅い方になる。' +
      'アからエの終了時刻は順に' + completion.join('、') + '。最短は' + source[78].choices[correctIndex] +
      'の' + minimum + 'である。',
  };
}

export const spring2015Am5480Calculations: Partial<Record<number, { count: number; build: (index: number) => GeneratedBody; notes: string }>> = {
  54: { count: spring2015Am54Durations.length, build: arrowNetwork,
    notes: '原のA〜Iと二つのダミー、八つの無番号結合点と凡例を固定する。作業日数を8条件で変更。候補値は原の四数値又は実経路の過小見積りと並行作業の誤った直列化。値域・候補間隔・正答の一意性を全経路の別解で照合。' },
  64: { count: 3, build: salesTime,
    notes: '2017秋問61と同じ集計・丸めなしの3相関条件を再利用し，元の階層表と別枠の件数，1件訪問時間と総時間一定を保つ。当該年度の原問IDと描画プロファイル。' },
  78: { count: times.length, build: machining,
    notes: 'M1→M2、M1の連続加工、3製品と斜線表、原四順序を保つ。加工時間を8条件で変更し，全六順序の独立検算で一意の最短が原四択に含まれることを確認。' },
};
