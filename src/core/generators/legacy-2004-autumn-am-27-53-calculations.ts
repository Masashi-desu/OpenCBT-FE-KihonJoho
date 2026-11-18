import { p, strings } from './definition';
import { finite, original } from './legacy-2004-autumn-am-27-53-shared';

const grouped = (n: number) => n.toLocaleString('en-US');
const imageTransfers = [
  { megabytes: 15, width: 1000, height: 750 }, { megabytes: 18, width: 800, height: 750 },
  { megabytes: 18, width: 1200, height: 600 }, { megabytes: 12, width: 1000, height: 500 },
] as const;

const fleets = [
  { computers: 1000, days: 20, useHours: 8, cap: 2 }, { computers: 800, days: 25, useHours: 6, cap: 2 },
  { computers: 1200, days: 15, useHours: 8, cap: 3 }, { computers: 1500, days: 24, useHours: 8, cap: 4 },
] as const;

const runtimes = [
  { interpret: 200, native: 3, compile: 100, overhead: 150 },
  { interpret: 300, native: 5, compile: 130, overhead: 210 },
  { interpret: 250, native: 5, compile: 135, overhead: 180 },
  { interpret: 400, native: 20, compile: 200, overhead: 250 },
] as const;

export const calculationDefinitions = [
  finite(29, '画像の横・縦の画素数と転送速度', 'ウ',
    'PCカードの転送速度、非圧縮の24ビット色情報、長時間換算の1秒当たりの枚数を保持。バイト換算の誤り、固定100万画素の誤り、1画素1バイトの誤りを同程度の選択肢間隔で比較する。', index => {
      const { megabytes, width, height } = imageTransfers[index];
      const rate = megabytes * 1000000;
      const pixels = width * height;
      const answer = rate / (3 * pixels);
      const display = (n: number) => String(Math.round(n * 10) / 10);
      const stem = 'データ転送速度が' + megabytes + ' Mバイト／秒のPCカードを用いるとき，' + grouped(width) + '×' + grouped(height) +
        '画素の画像は，1秒間に約何枚転送できるか。ここで，画像は圧縮せず，1画素は24ビットで表すものとする。';
      return { prompt: [p(stem)], choices: strings([rate / (24 * pixels), megabytes / 3, answer, rate / pixels].map(display)),
        correctIndex: 2, explanation: '1画素は24÷8＝3バイト。1枚は' + grouped(width) + '×' + grouped(height) + '×3＝' +
          grouped(pixels * 3) + 'バイトなので、' + grouped(rate) + '÷' + grouped(pixels * 3) + '＝約' + display(answer) + '枚／秒となる。' };
    }),
  finite(38, 'パソコン台数・観測日数・稼働時間・許容故障台数', 'ウ',
    '台数、使用日数、1日平均使用時間、許容される平均故障台数を変更。MTBFを求めるため全台の延べ時間を使い、日・時間を混同する誤り、閾値を割らない誤りを検査する。', index => {
      const { computers, days, useHours, cap } = fleets[index];
      const exposure = computers * days * useHours, required = exposure / cap;
      const stem = 'A社では，' + grouped(computers) + '台のパソコンを使用している。これらのパソコンについて，平均故障台数を' + days +
        '日間で' + cap + '台以下に抑えたい。これらのパソコンのMTBFは少なくとも何時間必要か。ここで，パソコンの平均使用時間は1日' + useHours + '時間とする。';
      const options = index === 0 ? original(38).choices : [exposure / days, computers * days, required, exposure].map(grouped);
      return { prompt: [p(stem)], choices: strings(options), correctIndex: 2,
        explanation: 'MTBF（Mean Time Between Failures、平均故障間隔）を求めるため、全台の延べ使用時間' +
          grouped(computers) + '×' + days + '×' + useHours + '＝' + grouped(exposure) + '時間を使う。これを許容する平均故障台数' +
          cap + 'で割ると、必要なMTBFは' + grouped(required) + '時間以上となる。' };
    }),
  finite(44, '方式別の処理時間と固定オーバヘッド', 'エ',
    '100行当たりの実行時間差、コンパイル費用、起動等の固定オーバヘッド、他の時間を無視する条件を維持して値を変える。整数の行数を小さい順に並べ、等しいときは「短くなる」に含めない。', index => {
      const { interpret, native, compile, overhead } = runtimes[index];
      const saving = interpret - native - compile;
      const threshold = Math.floor(100 * overhead / saving) + 1;
      const options = [Math.round(100 * overhead / (interpret + compile)), Math.round(100 * overhead / interpret),
        Math.round(100 * (compile + overhead) / interpret), threshold];
      const seconds = (ms: number) => String(ms / 1000);
      return { prompt: [p(original(44).prompt), p('〔条件〕\n（1）実行時間はプログラムの行数に比例する。\n（2）同じ100行のバイトコードのプログラムをインタプリタで実行すると' +
        seconds(interpret) + '秒かかり，コンパイルしてから実行すると' + seconds(native) + '秒かかる。\n（3）コンパイル時間は100行当たり' + seconds(compile) +
        '秒かかる。\n（4）コンパイル方式の場合は，プログラムの行数に関係なくファイル入出力，コンパイラ起動などのために常に' + seconds(overhead) +
        '秒のオーバヘッドがかかる。\n（5）プログラムファイルのダウンロード時間など，そのほかの時間は無視して考える。')],
        choices: strings(options.map(String)), correctIndex: 3,
        explanation: '100行当たりに短縮できる時間は' + seconds(interpret) + '−' + seconds(native) + '−' + seconds(compile) + '＝' +
          seconds(saving) + '秒。行数をnとすると、短縮時間 ' + seconds(saving) + '×n÷100 が固定オーバヘッド' + seconds(overhead) +
          '秒を超える最小の整数nは' + threshold + '行である。' };
    }),
];
