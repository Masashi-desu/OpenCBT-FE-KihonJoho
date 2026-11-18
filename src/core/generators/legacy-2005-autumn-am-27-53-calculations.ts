import { p, strings, table } from './definition';
import { finite, original } from './legacy-2005-autumn-am-27-53-shared';

const cpuScenarios = [
  [[3,3,3,3,2], [2,5,2,2,3], [3,2,2,3,2], [3,2,3,1,4], [3,4,2,5,2]],
  [[2,3,3,2,3], [3,3,2,3,4], [2,4,2,3,2], [3,4,3,4,3], [2,2,3,4,3]],
  [[4,3,3,3,2], [2,4,2,2,3], [3,4,3,3,2], [4,4,2,3,3], [3,3,3,2,3]],
  [[3,3,4,4,4], [3,3,3,2,2], [3,3,4,4,3], [4,2,2,2,4], [3,4,3,3,3]],
];

function idleMs(high: number[], low: number[]) {
  const jobs = [high, low].map(bursts => ({ bursts, stage: 0, cpuRemaining: bursts[0], readyAt: 0 }));
  let time = 0, idle = 0;
  while (jobs.some(job => job.stage < job.bursts.length)) {
    const job = jobs.find(job => job.stage < job.bursts.length && job.readyAt <= time);
    if (!job) {
      const next = Math.min(...jobs.filter(job => job.stage < job.bursts.length).map(job => job.readyAt));
      idle += next - time;
      time = next;
      continue;
    }
    const highAvailable = jobs[0].stage < high.length ? jobs[0].readyAt : Infinity;
    const slice = job === jobs[0] ? job.cpuRemaining : Math.min(job.cpuRemaining, highAvailable - time);
    time += slice;
    job.cpuRemaining -= slice;
    if (job.cpuRemaining !== 0) continue;
    job.readyAt = time + (job.bursts[job.stage + 1] ?? 0);
    job.stage += 2;
    job.cpuRemaining = job.bursts[job.stage] ?? 0;
  }
  return idle;
}

const scheduling = finite(28, 'タスクA〜EのCPU時間と入出力時間', 'ウ',
  'タスクAの高優先、各タスクのCPU3区間／非競合I/O2区間、時刻0開始とOSオーバヘッドなしを維持する。1〜5msの整数で処理時間を変え、プリエンプションを行う場合とCPU区間に途中割込みを入れない場合で遊休ゼロの組が同じになる4条件を独立確認する。', index => {
    const jobs = cpuScenarios[index];
    const [high, ...alternatives] = jobs;
    const idle = alternatives.map(low => idleMs(high, low));
    const correctIndex = idle.indexOf(0);
    if (idle.filter(value => value === 0).length !== 1) throw Error('遊休がゼロの候補が一つではありません');
    return {
      prompt: [p(original(28).prompt), table('タスクの処理時間', ['タスク', '優先度', '単独実行時の動作順序と処理時間（ミリ秒）'],
        jobs.map((burst, i) => ['ABCDE'[i], i === 0 ? '高' : '低', burst.map((time, j) => (j % 2 ? 'I/O' : 'CPU') + '（' + time + '）').join(' → ')]))],
      choices: strings(original(28).choices), correctIndex,
      explanation: '入出力の競合はなく，両タスクが入出力中の時間や，一方が終了して残りが入出力中の時間だけCPUが遊休する。CPU（Central Processing Unit、中央処理装置）の割当てに高優先タスクの復帰をすぐ反映する場合，遊休の合計は' +
        idle.map((ms, i) => 'ABCDE'[i + 1] + 'との組で' + ms + 'ミリ秒').join('，') +
        'となる。CPU区間の途中で割り込まない場合も，タスクAと' + 'ABCDE'[correctIndex + 1] + 'の組だけが両タスクの完了まで遊休なく実行できる。',
    };
  });

const sharedBodies = [
  ['a1　xの値を参照し e とする。','b1　xの値を参照し h とする。'],
  ['a2　xの値を参照し f とする。','b2　xの値を参照し i とする。'],
  ['a3　e＋f を計算し g とする。','b3　h×i を計算し j とする。'],
  ['a4　g によって x の値を更新する。','b4　j によって x の値を更新する。'],
];
const steps = original(29).choices;
const scenarios = [
  { initial: 3, target: 12, choices: steps },
  { initial: 4, target: 32, choices: steps },
  { initial: 5, target: 50, choices: ['b1 → b2 → b3 → b4 → a1 → a2 → a3 → a4', steps[1], 'a1 → a2 → a3 → a4 → b1 → b2 → b3 → b4', steps[3]] },
  { initial: 6, target: 12, choices: [...steps.slice(0, 3), 'a1 → a2 → a3 → b1 → b2 → b3 → b4 → a4'] },
];

function execution(initial: number, order: string) {
  let x = initial;
  let e = 0, f = 0, g = 0, h = 0, i = 0, j = 0;
  for (const step of order.split(' → ')) {
    switch (step) {
      case 'a1': e = x; break;
      case 'a2': f = x; break;
      case 'a3': g = e + f; break;
      case 'a4': x = g; break;
      case 'b1': h = x; break;
      case 'b2': i = x; break;
      case 'b3': j = h * i; break;
      case 'b4': x = j; break;
      default: throw Error('実行順のラベルに誤りがあります');
    }
  }
  return { x, e, f, h, i };
}

const interleaving = finite(29, '共有変数の初期値と求める更新結果', 'イ',
  '同期制御のない加算・乗算、二つの処理の四段階と全候補8操作を維持する。初期3〜6、目標12〜50、2桁中心の計算とし、順序の変更で最後に保存する式と参照した値を変える。', index => {
    const { initial, target, choices } = scenarios[index];
    const results = choices.map(choice => execution(initial, choice));
    const correctIndex = results.findIndex(row => row.x === target);
    if (results.filter(row => row.x === target).length !== 1) throw Error('実行順の正答が一つではありません');
    const { e, f, h, i } = results[correctIndex];
    return {
      prompt: [p(original(29).prompt.replace('初期値が3', '初期値が' + initial).replace('値が12', '値が' + target)),
        table('代入文の分解', ['タスク A（x＝x＋x）', 'タスク B（x＝x×x）'], sharedBodies)],
      choices: strings(choices), correctIndex,
      explanation: 'a1・a2で読み取った値を加算し，b1・b2で読み取った値を乗算する。書込みはa4とb4だけである。正答の順で' +
        'Aは' + e + 'と' + f + '，Bは' + h + 'と' + i + 'を読む。各候補の最終値は' +
        results.map((row, i) => 'アイウエ'[i] + 'が' + row.x).join('，') + 'となる。',
    };
  });

const memoryFeatures = [
  'あらかじめプログラムを幾つかの単位に分けて補助記憶に格納しておき，プログラムの指定に基づいて主記憶に読み込む。',
  '主記憶とプログラムを固定長の単位に分割し，効率よく記憶管理する。これによって，少ない主記憶で大きなプログラムの実行を可能にする。',
  'プログラムを一時的に停止させ，使用中の主記憶の内容を補助記憶に退避する。再開時には，退避した内容を主記憶に再ロードし，元の状態に戻す。',
];
const memoryNames = ['オーバレイ', 'ページング', 'スワッピング'];
const orders = [[0,1,2], [2,0,1], [2,1,0], [1,0,2]];
const management = finite(30, '機能a〜cに割り付ける記憶管理の動作', 'ア',
  '記憶管理の三つの特徴と4候補のa〜cの組合せ表を維持する。特徴の割付けを四つの異なる条件で変え、選択肢表の候補は原順で固定する。', index => {
    const assignment = orders[index];
    const expected = assignment.map(value => memoryNames[value]).join('｜');
    const correctIndex = original(30).choices.indexOf(expected);
    return {
      prompt: [p(original(30).prompt), table('記憶管理機能', ['機能', '特徴'], assignment.map((value, i) => ['abc'[i], memoryFeatures[value]]))],
      choices: original(30).choices.map(choice => [table('用語の組合せ', ['a', 'b', 'c'], [choice.split('｜')])]),
      correctIndex,
      explanation: 'オーバレイはプログラムの指定に基づく部分読込み，ページングは固定長単位の管理，スワッピングは一時停止・退避と再ロードである。' +
        assignment.map((value, i) => 'abc'[i] + 'が' + memoryNames[value]).join('，') + 'に対応する。',
    };
  });

const retention = [6, 4, 8, 5];
const tapeCandidates = [[12,13,14,15], [10,11,12,13], [16,17,18,19], [10,11,12,13]];
const tapes = finite(50, '復元を保証する月数', 'ウ',
  '月初1日のフル、2日以後の日次差分1か月分1本、同一日がなければ対象月末まで、必要期間中の任意日の復元を保持する。4〜8か月の整数と、1〜2本の差の候補（古い月の基準又は差分の見落とし、余分な一本）を扱う。', index => {
    const months = retention[index], options = tapeCandidates[index];
    const examples = [
      ['10月31日', '4月30日'],
      ['平年の6月30日', '2月28日'],
      ['平年の10月31日', '2月28日'],
      ['平年の7月31日', '2月28日'],
    ];
    const [today, oldest] = examples[index];
    return {
      prompt: [p(original(50).prompt), p('〔処理条件〕'),
        p('（1）毎月初日（1日）にフルバックアップを取る。フルバックアップは1回につき磁気テープ1本を必要とする。'),
        p('（2）フルバックアップを取った翌日から次のフルバックアップまでは，毎日，差分バックアップを取る。差分バックアップは，差分バックアップ用として別の磁気テープ1本に追記し，1か月分が1本に記録できる。'),
        p('（3）常に' + months + 'か月前の同一日までのデータについて，指定日の状態にファイルを復元できることを保証する。ただし，' + months +
          'か月前の同一日が存在しない場合は，当該月の月末日以降のデータについて，指定日の状態に復元できることを保証する。' +
          '（例：' + today + 'の場合，' + oldest + '以降のデータについて，指定日の状態にファイルを復元できることを保証する。')],
      choices: strings(options.map(String)), correctIndex: options.indexOf(2 * (months + 1)),
      explanation: '同一日を含む復元範囲は，今月と過去' + months + 'か月で合計' + (months + 1) +
        'か月にまたがる。今月も月の途中になると今月用の差分を使用する。最も古い月でも2日以降を復元するには月初のフルとその月の差分が必要になる。したがって最大で' +
        (months + 1) + 'か月分のフルと差分を両方確保し，' + 2 * (months + 1) + '本となる。',
    };
  });

export const calculationDefinitions = [scheduling, interleaving, management, tapes];
