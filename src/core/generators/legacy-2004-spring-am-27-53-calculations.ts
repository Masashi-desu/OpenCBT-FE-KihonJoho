import { p, strings, table } from './definition';
import { finite, original } from './legacy-2004-spring-am-27-53-shared';

type Utilization = { months: number[]; rates: number[]; idle: number[]; choices: number[] };
const utilization: Utilization[] = [
  { months: [4, 5, 6], rates: [60, 80, 20], idle: [120, 20, 80], choices: [44, 53, 56, 63] },
  { months: [7, 8, 9], rates: [20, 50, 60], idle: [160, 50, 120], choices: [42, 45, 50, 55] },
  { months: [1, 2, 3], rates: [80, 40, 60], idle: [60, 60, 40], choices: [55, 60, 68, 72] },
  { months: [10, 11, 12], rates: [30, 70, 90], idle: [70, 120, 50], choices: [63, 70, 76, 83] },
];
const sum = (values: number[]) => values.reduce((total, item) => total + item, 0);

const q37 = finite(37, '各月の遊休時間と使用率の組', 'ウ', '各月の使用率と遊休時間を変更し、使用率を全運転時間で重みづけする4択を保つ。', index => {
  const { months, rates, idle, choices } = utilization[index];
  const elapsed = idle.map((value, i) => value * 100 / (100 - rates[i]));
  const active = elapsed.map((value, i) => value - idle[i]);
  const ratio = sum(active) * 100 / sum(elapsed);
  return {
    prompt: [p(index === 0 ? original(37).prompt :
      months[0] + '〜' + months[2] + '月におけるCPUの使用率と遊休時間を集計した。表から求めた3か月全体の平均使用率は何％か。'),
      table('月別のCPU使用率と遊休時間', ['月', '使用率（％）', '遊休時間の合計（時間）'],
        months.map((month, i) => [month, rates[i], idle[i]].map(String)))],
    choices: strings(choices.map(String)), correctIndex: choices.indexOf(ratio),
    explanation: '各月の全運転時間は、遊休時間を（1−使用率）で割って求める。表の順に ' + elapsed.join('、') + ' 時間である。使用時間はそれぞれ ' +
      active.join('、') + ' 時間なので、平均使用率は ' + sum(active) + '÷' + sum(elapsed) + '×100＝' + ratio +
      '％。月の運転時間が異なるため、分子に使用時間の合計、分母に運転時間の合計を使う。',
  };
});

type Capacity = { steps: number; step: number; accesses: number; latency: number; io: number; count: number; choices: number[] };
const capacity: Capacity[] = [
  { steps: 100, step: 1, accesses: 20, latency: 25, io: 80, count: 150, choices: [42, 60, 80, 90] },
  { steps: 80, step: 1, accesses: 20, latency: 20, io: 50, count: 150, choices: [50, 67, 75, 100] },
  { steps: 120, step: 1, accesses: 15, latency: 40, io: 70, count: 200, choices: [40, 50, 60, 70] },
  { steps: 60, step: 2, accesses: 24, latency: 25, io: 60, count: 125, choices: [60, 80, 90, 100] },
];

const q38 = finite(38, 'CPU命令・入出力時間・件数の増加率の組', 'イ',
  '現在の1件の内訳、改善後の入出力比、件数比を変更し、処理時間を延ばさないCPUステップ時間の割合を選ぶ。4択は整数の昇順とする。', index => {
    const { steps, step, accesses, latency, io, count, choices } = capacity[index];
    const cpu = steps * 10 * step, disk = accesses * latency, today = cpu + disk;
    const tomorrowDisk = disk * io / 100, budget = today * 100 / count;
    const tomorrowCpu = budget - tomorrowDisk;
    const maxRatio = tomorrowCpu * 100 / cpu;
    const statement = '次の条件で1年後の1日分のサーバ処理時間を現在以下にするには、CPUの1ステップ当たりの処理時間を現在の何％以下にすればよいか。\n' +
      '（1）データ1件にCPU命令' + steps + '万ステップと磁気ディスクへの入出力' + accesses + '回が必要である。\n' +
      '（2）現在、CPUは1ステップ当たり' + step + 'マイクロ秒、入出力は1回当たり' + latency + 'ミリ秒を要する。\n' +
      '（3）1年後、1件当たりの入出力時間は現在の' + io + '％になる。\n' +
      '（4）1年後の1日当たりの件数は現在の' + count + '％になる。\n' +
      '（5）待ち時間及びそのほかのオーバヘッドは考慮しない。';
    return { prompt: [p(index === 0 ? original(38).prompt : statement)], choices: strings(choices.map(String)),
      correctIndex: choices.indexOf(maxRatio),
      explanation: '現在の1件当たりの時間は、CPU ' + cpu + ' msと入出力 ' + disk + ' msで合計 ' + today + ' ms。件数が' + count +
        '％になるので、1件当たりの上限は ' + today + '÷' + (count / 100) + '＝' + budget + ' ms。新しい入出力には ' + tomorrowDisk +
        ' msを使うからCPUには ' + tomorrowCpu + ' msを使える。ステップ数が同じなので、1ステップ当たりの上限も ' +
        tomorrowCpu + '÷' + cpu + '×100＝' + maxRatio + '％となる。',
    };
  });

export const calculationDefinitions = [q37, q38];
