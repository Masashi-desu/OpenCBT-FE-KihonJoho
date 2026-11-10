import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2012-autumn-pm-01-04-shared';
import { draw } from './legacy-2012-autumn-pm-01-04-figures';
import { processCases } from './legacy-2012-autumn-pm-01-04-models';

const operations = [
  'sの状態が解放状態ならば確保状態にし，確保状態ならば解放状態になるまで待ってから確保状態にする',
  'sの状態が解放状態ならば確保状態にし，確保状態ならば何もしない',
  'sの状態が解放状態ならば確保状態になるまで待ち，確保状態ならば解放状態になるまで待つ',
  'sの状態が解放状態ならば確保状態になるまで待ち，確保状態ならば何もしない',
  'sの状態が確保状態ならば解放状態にし，解放状態ならば何もしない',
  'sの状態が確保状態ならば解放状態になるまで待ち，解放状態ならば何もしない',
];

function schedule(first: number, nested: boolean) {
  const second = first === 1 ? 2 : 1;
  return nested ? ['y' + first + 'の確保', 'y' + second + 'の確保', 'y' + second + 'の解放', 'y' + first + 'の解放']
    : ['y' + first + 'の確保', 'y' + first + 'の解放', 'y' + second + 'の確保', 'y' + second + 'の解放'];
}
function schedules() {
  return [schedule(1, false), schedule(1, true), schedule(2, true), schedule(2, false)].map(steps => steps.join('，'));
}

export function autumn2012Pm1Pages(index: number) {
  const input = processCases[index], p1 = schedule(input.first, true).join('，');
  return [
    [
      p('次の問1から問7までの7問については，この中から5問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，6問以上マークした場合には，はじめの5問について採点します。'),
      p('問1　プロセスの排他制御に関する次の記述を読んで，設問1〜3に答えよ。'),
      p('複数のプロセスが，共有するデータ（以下，共有データという）を書き換える処理を，並行して実行する場合がある。このようにプロセス間でデータを共有する方法の一つとして，プロセス間で共有するメモリ（以下，共有メモリという）に共有データを格納する方法がある。ここでは，CPUが一つで共有メモリをもつコンピュータX上で，二つのプロセスp1，p2が共有メモリを使用して並行に処理を実行する場合を考える。'),
      p('プロセスp1，p2が共有データyに対して計算処理をする場合を，図1に示す。ここで，各プロセスの計算処理は，次のとおりである。'),
      p('〔計算処理〕\n① 共有データyの値を読み込む。\n② 読み込んだ値を用いて計算する。\n③ 計算結果をyに書き込む。'),
      draw('shared', [0], '図1　共有メモリによるデータの共有'),
    ],
    [
      p('設問1　図1に示すプロセスp1，p2が共有データyに対して次の処理を実行する場合を考える。'),
      p('プロセスp1：yの値を' + input.add + 'だけ増加させる。\nプロセスp2：yの値を' + input.remove + 'だけ減少させる。'),
      p('プロセスの実行前の共有データyの値が' + input.initial + 'であり，yに対する排他制御をしないとき，プロセスp1，p2が並行に1回だけ処理を実行した直後において，yが取り得ない値を，解答群の中から選べ。'),
      ...bank('解答群', input.values),
      p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('プロセスの排他制御の仕組みとして，共有データがいずれかのプロセスに確保されている状態（以下，確保状態という）又はどのプロセスにも確保されていない状態（以下，解放状態という）のいずれかの状態をもつ同期変数を使用する方法を考える。図1のプロセスp1，p2の計算処理で使用する共有データyに対して同期変数sを用いて排他制御する場合を，図2に示す。'),
      draw('sync', [0], '図2　同期変数sを用いた排他制御'),
    ],
    [
      p('図2において，同期変数の状態を変更する関数ℓとuがあり，同期変数を引数で指定する。各プロセスは，共有データを排他制御して計算処理をする場合，関数ℓの呼出し，計算処理，関数uの呼出しの順番で処理を実行する。このとき，共有データyを排他制御するために，関数ℓとuの引数として同期変数sを指定する。'),
      p('関数ℓの操作内容は［a］処理であり，関数uの操作内容は［b］処理である。ここで，“同期変数の状態を調べて，変更する処理”は中断のない処理として実行されるものとする。ただし，プロセスが待ちの状態になったら，CPUは別のプロセスに割り付けられるものとする。'),
      ...bank('解答群', operations),
      p('設問3　プロセスp1，p2が使用する共有データが二つあり，共有データy1に対して同期変数s1を用いて排他制御し，共有データy2に対して同期変数s2を用いて排他制御する場合を考える。プロセスp1が，' + p1 + 'の順序で同期変数を操作するとき，プロセスp2がy1，y2の確保と解放を行う順序によってはデッドロックが発生する可能性がある。デッドロックが発生する可能性のあるプロセスp2の操作の順序を，解答群の中から選べ。'),
      ...bank('解答群', schedules()),
    ],
  ];
}

export const legacy2012AutumnPm1Definition = define(1, 'プロセスの排他制御', '設問1=イ、設問2 a=ア・b=オ、設問3=ウ',
  '共有値・更新幅・先行して確保する資源', '共有値と更新量，二つの資源を確保する順序を変えます。',
  'p.5〜7。単一CPU、読込み・計算・書込み、状態確認変更の不可分性と待ち時のCPU割当、二資源の確保・解放を維持。設問1は小さい整数の加減算2回以内と昇順4択、設問3は直列・同順二重・逆順二重の4択。設問2では取得・解放の役割を変えると他欄の計算処理が成立しなくなるため処理の意味を固定。',
  index => {
    const data = processCases[index];
    const reachable = [data.initial - data.remove, data.initial + data.add - data.remove, data.initial + data.add].sort((a, b) => a - b);
    return {
      prompt: autumn2012Pm1Pages(index).flat(),
      ...answers([strings(data.values.map(String)), strings(operations), strings(schedules())], [
        single('s1', '設問1', 0, data.values.findIndex(value => !reachable.includes(value))),
        single('a', '設問2 a', 1, 0),
        single('b', '設問2 b', 1, 4),
        single('s3', '設問3', 2, data.first === 1 ? 2 : 1),
      ]),
      explanation: '各プロセスが1回ずつ読み込み，計算し，書き込む。順に実行した結果は' + (data.initial + data.add - data.remove)
        + '。互いに変更前の値を読んだときには最後の書込みだけが残り，' + (data.initial - data.remove) + '又は' + (data.initial + data.add)
        + 'となる。したがって候補のうち' + data.values.find(value => !reachable.includes(value)) + 'は得られない。ℓは解放を待って確保し，uは確保を解放する。状態確認と更新は一体で行い，待ち中のCPUは他方が使える。p1がy'
        + data.first + 'を確保し，p2がy' + (data.first === 1 ? 2 : 1) + 'を確保すると，両者が相手の資源を待ち続ける。先に確保した資源を解放する順序や同じ順序での確保にはこの循環待ちがない。',
    };
  });
