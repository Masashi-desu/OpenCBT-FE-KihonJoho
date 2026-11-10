import { p, strings, table } from './definition';
import { addressCases, spring2013AmDiagram } from './legacy-2013-spring-am-01-26-figures';
import { define, knowledge, source, textBody } from './legacy-2013-spring-am-01-26-shared';

const addressing = define(10, '命令と主記憶の間のアドレス解決経路', addressCases.length,
  '命令部・アドレス部・主記憶・データを保ち、矢印の経路、間接参照又は加算元の違いを図へ反映する。アドレス計算の結果を先取りする補助表は置かない。', index => {
    const model = addressCases[index], { address, target, kind } = model;
    const correctIndex = ['indirect', 'indexed', 'relative', 'direct'].indexOf(kind);
    let explanation = 'アドレス部に書かれた' + address + '番地にデータ自体があり，その番地をそのまま使用するので直接アドレス指定である。';
    if (kind === 'indirect') explanation = 'アドレス部の' + address + 'を主記憶の番地として読み，そこに格納された' +
      target + 'をさらに番地としてデータを読むので間接アドレス指定である。';
    if ('register' in model) explanation = 'アドレス部の' + address + 'に' + model.register + 'の内容' + (target - address) +
      'を加えた' + target + 'が実効アドレスになる。' + source[10].choices[correctIndex] + 'に当たる。';
    return { prompt: [p(source[10].prompt), spring2013AmDiagram('address', index, '命令と主記憶')],
      choices: strings(source[10].choices), correctIndex, explanation };
  });

const interrupt = knowledge(11, '内部・外部割込みと発生原因', '実行中の命令に由来する原因と外部機器・タイマに由来する原因を変更し、元の「適切な例を選ぶ」問いを保持する。',
  'MPU（Micro Processing Unit，マイクロプロセッサ）の割込みは発生原因で区別する。ウォッチドッグタイマの期限切れは実行命令自体から起きた例外ではない。ゼロ除算，未定義命令及び存在しないアドレスへのアクセスは，命令の実行に伴う内部割込みである。',
  [
    { prompt: source[11].prompt.replace('外部割込みの例', '内部割込みの例'), correctIndex: 2,
      choices: ['入出力装置が転送を完了したときに発生する割込み', '外部タイマから周期信号が到着したときに発生する割込み',
        '未定義命令を実行しようとしたときに発生する割込み', 'キーボードから入力信号が到着したときに発生する割込み'],
      explanation: '未定義命令の検出はMPU（Micro Processing Unit，マイクロプロセッサ）が命令を実行する過程で起こる内部割込みである。ほかの三つは外部のタイマや入出力機器からの通知である。' },
    { prompt: source[11].prompt.replace('外部割込みの例', '補助記憶装置からデータを読み込むシステムでの外部割込みの例'), correctIndex: 3,
      choices: ['不正な命令コードを解釈したときに発生する割込み', '許可されていない主記憶領域を読み出そうとしたときに発生する割込み',
        '特権命令を非特権状態で実行しようとしたときに発生する割込み', 'ディスク装置が読出し処理の完了を通知したときに発生する割込み'],
      explanation: 'CPU（Central Processing Unit，中央処理装置）での命令実行を直接の原因とする前三つは内部割込み。ディスク装置からの読出し完了通知は外部割込みである。' },
  ]);

const accessCases = [[40,20,400,580],[50,30,420,480],[40,30,410,600],[35,25,400,640]] as const;
const cache = define(12, 'CPU X・Yのキャッシュと主記憶のアクセス時間', accessCases.length,
  '構成図のキャッシュと主記憶容量、アクセス時間表の軸・単位、等時間と他条件同一の前提を保持。アクセス差の比で解けて小数第2位まで丸め不要。', index => {
    const [cacheX, cacheY, memoryX, memoryY] = accessCases[index], hitDifference = cacheX - cacheY, missDifference = memoryY - memoryX;
    const hit = (missDifference / (hitDifference + missDifference)).toFixed(2);
    return { prompt: [p(source[12].prompt), spring2013AmDiagram('cache', 0, '図 構成'),
      table('表 アクセス時間（単位 ナノ秒）', ['', 'CPU X', 'CPU Y'],
        [['キャッシュメモリ', String(cacheX), String(cacheY)], ['主記憶', String(memoryX), String(memoryY)]])],
      choices: strings(source[12].choices), correctIndex: source[12].choices.indexOf(hit),
      explanation: 'CPU（Central Processing Unit，中央処理装置）Xはヒット時に' + hitDifference + 'ナノ秒遅く，ミス時に' +
        missDifference + 'ナノ秒速い。ヒット率をhとすると，処理時間が等しい条件は' + hitDifference + '×h＝' +
        missDifference + '×（1−h）。h＝' + hit + 'となる。' };
  });

const bluetooth = knowledge(13, '機器を接続する通信方式', '近距離で機器を接続する方式の説明を選ぶ。接続数・伝送媒体・利用条件の混同を区別する。',
  'Bluetoothは免許不要の2.4GHz帯の電波を使用する。通信距離は環境や機器の仕様で変わり，最低1,000mを保証しない。赤外線のように機器の発光部と受光部を向かい合わせる必要はない。127台という選択肢はUSBのアドレス数との混同である。',
  [
    { prompt: source[13].prompt.replace('Bluetooth', 'USB 2.0'), correctIndex: 0,
      choices: ['1台のホストには，ハブを含めて最大127台のデバイスをアドレスで識別できる。', '規格では，1,000m以上離れた場所でも通信可能であると定められている。',
        '指向性のある赤外線を使い，接続対象の機器同士を向かい合わせて通信を行う。', '免許不要の2.4GHz帯の電波を利用して通信する。'],
      explanation: 'USB（Universal Serial Bus）は機器を接続する有線の規格である。USB 2.0では7ビットのアドレスのうち0は初期状態用で，1〜127をハブを含むデバイスの識別に使う。' },
    { prompt: source[13].prompt.replace('Bluetooth', 'IrDAの赤外線通信'), correctIndex: 2,
      choices: ['1台のホストには，ハブを含めて最大127台のデバイスをアドレスで識別できる。', '規格では，1,000m以上離れた場所でも通信可能であると定められている。',
        '指向性のある赤外線を使い，接続対象の機器同士の送受光部を向かい合わせて通信を行う。', '免許不要の2.4GHz帯の電波を利用して通信する。'],
      explanation: 'IrDA（Infrared Data Association，赤外線通信の標準化団体）の赤外線通信では，指向性のある光を発光部から受光部へ届ける。127台はUSB（Universal Serial Bus）の機器アドレス，2.4GHz帯はBluetoothなどの電波通信に関する記述である。' },
  ]);

const reliability = knowledge(14, 'システムの設計目的', '部分故障時の機能維持、遠隔地による災害対策、ネットワーク越しの分散処理の説明を同じ問い方で区別する。',
  'フォールトトレラントシステムの目標は部分的に故障しても必要なサービスを維持することである。遠隔地の予備は災害対策，資源共有は分散処理であり，並行処理結果を照合するだけでは故障時のサービス継続は保証されない。',
  [
    { prompt: source[14].prompt.replace('フォールトトレラントシステム', '遠隔バックアップサイトを用いる災害対策システム'), correctIndex: 1,
      explanation: '拠点全体に及ぶ災害に備えて，予備の設備やデータを離れた拠点に用意する。機器の部分故障に耐えるだけの構成では，地域全体への被害に備えられない。' },
    { prompt: source[14].prompt.replace('フォールトトレラントシステム', 'ネットワークによる分散処理システム'), correctIndex: 2,
      explanation: '分散処理システムではネットワークで結ばれた複数のコンピュータが処理を分担し，必要な資源を共有する。予備拠点の確保や，同じ計算結果の照合とは目的が異なる。' },
  ]);

const availabilityCases = [[45,5],[40,10],[35,15],[30,20]] as const;
const availability = define(15, '平均故障間隔と平均修理時間', availabilityCases.length,
  '同じ機器二つの直列を維持する。比は小数1桁、2乗は小数2桁で丸め不要。単体、片方の稼働率を1と平均、並列を誤答にする。改変ケースに故障・修理の独立を明記。', index => {
    const [mtbf, mttr] = availabilityCases[index], tenths = mtbf * 10 / (mtbf + mttr);
    const choices = [tenths * tenths, tenths * 10, 50 + 5 * tenths, 100 - (10 - tenths) ** 2]
      .map(value => (value / 100).toFixed(2));
    const prompt = source[15].prompt.replace('45時間', mtbf + '時間').replace('5時間の装置', mttr + '時間の装置') +
      (index === 0 ? '' : '二つの装置の故障と修理は，互いに独立とする。');
    return textBody(prompt, choices, 0, '単体の稼働率はMTBF（Mean Time Between Failures，平均故障間隔）をMTBFとMTTR（Mean Time To Repair，平均修理時間）の和で割った' +
      choices[1] + 'である。直列では二つとも稼働する必要があるので，' + choices[1] + '×' + choices[1] + '＝' + choices[0] + 'となる。');
  });

const metrics = knowledge(16, '性能量又は時間の定義', '定義から用語を選ぶ方向を固定し、測る値と開始・終了時点を変える。元の四つの用語を保持する。',
  'スループットは単位時間当たりの処理量である。ターンアラウンドタイムは仕事の投入から完了まで，レスポンスタイムは要求から応答開始まで，タイムスライスは実行権を割り当てる時間の単位である。',
  [
    { prompt: 'コンピュータシステムで，仕事の投入からその仕事の処理結果が全て得られるまでの時間を表す用語はどれか。', correctIndex: 1,
      explanation: 'ターンアラウンドタイムは仕事を投入してから処理結果が全て得られるまでの時間。レスポンスタイムは最初の応答まで，タイムスライスはCPUの割当時間である。' },
    { prompt: 'コンピュータシステムで，ラウンドロビン方式によって各タスクに順番に割り当てるCPU時間の単位を表す用語はどれか。', correctIndex: 2,
      explanation: 'タイムスライスは順番にタスクへ割り当てるCPU（Central Processing Unit，中央処理装置）の利用時間の単位。仕事や応答の待ち時間とは異なる。' },
    { prompt: 'コンピュータシステムで，端末から処理を要求して最初の応答が返り始めるまでの時間を表す用語はどれか。', correctIndex: 3,
      explanation: 'レスポンスタイムは要求に対する最初の応答までの時間。ターンアラウンドタイムは仕事を投入してから最後まで完了するまでを測る。' },
  ]);

const investigationRows = [
  ['・同一マシンに他のシステムを共存させたことによる負荷の増加\n・接続クライアント数の増加による通信量の増加', 'a'],
  ['・非定型検索による膨大な処理時間を要するSQL文の発行', 'b'],
  ['・フラグメンテーションによるディスクI/Oの増加', 'c'],
  ['・データベースバッファの容量の不足', 'd'],
];
const investigationItems = ['c', 'a', 'b', 'd'];
const investigationExplanations: Record<string, string> = {
  a: '同居システムやクライアント数の増加はアプリケーション外の変化なので，外的要因の変化の確認を行う。',
  b: '実行時間の長いSQL（Structured Query Language，データベース問合せ言語）文が原因候補なので，遅い処理を特定する。',
  c: 'フラグメンテーションではデータが分散して格納され，ディスクI/O（Input/Output，入出力）が増える。データの格納状況を確認する。',
  d: 'データベースバッファが不足すると，メモリで済む参照の割合が落ちる。キャッシュメモリのヒット率を調査する。',
};
const investigation = define(17, '性能悪化の原因と対応する調査項目', investigationItems.length,
  '原の原因表と四択を維持する。本文と表によりa〜dのどの原因の調査方法かを特定する。', index => {
    const item = investigationItems[index];
    return { prompt: [p(source[17].prompt.replace('調査項目c', '調査項目' + item)),
      table('想定原因と調査項目', ['想定原因', '調査項目'], investigationRows)],
      choices: strings(source[17].choices), correctIndex: ['b','a','d','c'].indexOf(item), explanation: investigationExplanations[item] };
  });

const taskCases = [
  [[3,5,2],[2,6,2],[1,5,1]],
  [[3,3,2],[2,3,2],[1,5,1]],
  [[3,3,2],[2,3,2],[1,6,1]],
  [[3,3,2],[2,7,2],[1,6,1]],
] as const;
const idleTime = define(18, '優先度別のCPUとI/Oの処理時間', taskCases.length,
  '高・中・低の3タスクが同時に実行可能。CPU・I/O・CPUの順、単位、I/Oは競合せずOSオーバヘッドなしを保持する。I/O時間を変え、優先度の再評価時点の違いでも遊休時間が同じケースを用いる。', index => {
    const times = taskCases[index];
    const tasks = times.map(([first]) => ({ second: false, done: false, remaining: first as number, readyAt: 0 }));
    let clock = 0, idle = 0;
    while (tasks.some(task => !task.done)) {
      const current = tasks.findIndex(task => !task.done && task.readyAt <= clock);
      if (current < 0) {
        const next = Math.min(...tasks.filter(task => !task.done).map(task => task.readyAt));
        idle += next - clock;
        clock = next;
        continue;
      }
      const task = tasks[current], [, io, second] = times[current];
      clock += task.remaining;
      if (task.second) task.done = true;
      else Object.assign(task, { second: true, remaining: second, readyAt: clock + io });
    }
    return { prompt: [p(source[18].prompt), table('単独実行時の動作順序と処理時間（単位 ミリ秒）',
      ['優先度', '単独実行時の動作順序と処理時間（単位 ミリ秒）'], times.map(([first, io, second], i) =>
        ['高中低'[i], 'CPU（' + first + '） → I/O（' + io + '） → CPU（' + second + '）']))],
      choices: strings(source[18].choices), correctIndex: source[18].choices.indexOf(String(idle)),
      explanation: '実行可能なタスクを優先度の高い順に動かし，I/O（Input/Output，入出力）中はほかのタスクを実行できる。' +
        'CPU（Central Processing Unit，中央処理装置）の総実行時間は' + (clock - idle) +
        'ミリ秒で，全部が終了するのは開始から' + clock + 'ミリ秒後なので，遊休時間は' + idle + 'ミリ秒である。' };
  });

export const spring2013Am10To18 = [addressing, interrupt, cache, bluetooth, reliability, availability, metrics, investigation, idleTime];
