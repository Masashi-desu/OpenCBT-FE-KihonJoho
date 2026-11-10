import { code, p } from './definition';
import {
  adjacencyMatrix, graphChoices, graphTargets, ledMasks, ledSegments, siteCases, spring2012AmDiagram, stateLabels, ticketCases,
} from './legacy-2012-spring-am-01-26-figures';
import { choiceBody, define, source } from './legacy-2012-spring-am-01-26-shared';

const fractions = [
  { radix: 8, tenths: [3, 4, 5, 8] },
  { radix: 5, tenths: [1, 2, 3, 7] },
  { radix: 4, tenths: [1, 2, 4, 5] },
  { radix: 15, tenths: [2, 3, 5, 7] },
] as const;

const gcd = (left: number, right: number): number => right === 0 ? left : gcd(right, left % right);
function terminates(radix: number, denominator: number) {
  while (denominator > 1) {
    const factor = gcd(radix, denominator);
    if (factor === 1) return false;
    denominator /= factor;
  }
  return true;
}
const finite = define(1, '変換先の基数と10進小数', fractions.length,
  '小数第1位までの10進小数を選ぶ四択を昇順のまま保持し、基数と候補を連動する。既約分母を基数の素因数だけで割り切れる候補が一つ。', index => {
    const { radix, tenths } = fractions[index];
    const denominators = tenths.map(value => 10 / gcd(value, 10));
    const correct = denominators.findIndex(value => terminates(radix, value));
    const choices = tenths.map(value => '0.' + value);
    const prompt = source[1].prompt.replace('8進数', radix + '進数');
    return choiceBody(prompt, choices, choices[correct],
      '既約分数にしたときの分母は選択肢の順に' + denominators.join('，') + '。有限小数になるのは分母が' +
      radix + 'の累乗を割り切るときで，分母' + denominators[correct] + 'の' + choices[correct] + 'が該当する。');
  });

const binary = 'b₁b₂⋯bₙ';
const multipleCases = [
  { multiplier: 3, choices: source[2].choices, powers: '2＋1' },
  { multiplier: 5, choices: [binary + '0＋' + binary, binary + '00＋' + binary, binary + '000', binary + '01'], powers: '4＋1' },
  { multiplier: 6, choices: [binary + '000−' + binary, binary + '00＋' + binary, binary + '00＋' + binary + '0', binary + '10'], powers: '4＋2' },
  { multiplier: 9, choices: [binary + '000＋1', binary + '000＋' + binary + '0', binary + '0000−' + binary, binary + '000＋' + binary], powers: '8＋1' },
] as const;
const multiply = define(2, '非負の2進数の定数倍', multipleCases.length,
  '非負の任意のビット列の末尾への0・1の追加と加減算で表した四式を比較する。ある入力だけで一致する式を恒等式と区別する。', index => {
    const { multiplier, choices, powers } = multipleCases[index];
    const [left, right] = powers.split('＋').map(Number);
    const answer = binary + '0'.repeat(Math.log2(left)) + '＋' + binary + '0'.repeat(Math.log2(right));
    return {
      prompt: [p(source[2].prompt.replace('3倍', multiplier + '倍'))],
      choices: choices.map(value => [p(value)]),
      correctIndex: choices.indexOf(answer),
      explanation: '2進数の末尾に0をk個加えると，その数は2のk乗倍になる。' + multiplier + '＝' + powers +
        'なので，二つの位取りの倍数を足した' + answer + 'が任意の非負整数について成立する。',
    };
  });

const adjacency = define(3, '四節点の無向グラフの隣接行列', graphTargets.length,
  'n×nの対称行列、節点の添字、枝の有無を1／0とする定義を保持する。四つのグラフを固定し、行列の非対角要素を変える。', index => {
    const edges = graphChoices[graphTargets[index]];
    const matrix = adjacencyMatrix(index);
    const correctIndex = graphChoices.findIndex(option => option.every(([a, b]) => matrix[a - 1][b - 1] === 1) &&
      option.length * 2 === matrix.flat().filter(value => value === 1).length);
    return {
      prompt: [p(source[3].prompt), spring2012AmDiagram('matrix', index)],
      choices: graphChoices.map((_, i) => [spring2012AmDiagram('graph', i)]), correctIndex,
      explanation: '対称な要素を一度ずつ数えると，枝がある組は' +
        edges.map(([left, right]) => 'V' + left + 'とV' + right).join('，') + '。その他の組を結ぶ枝はない。',
    };
  });

const postfixCases = [
  { left: '＋', outer: '×', right: '−', priority: '÷' },
  { left: '−', outer: '÷', right: '＋', priority: '×' },
  { left: '×', outer: '＋', right: '−', priority: '×' },
  { left: '÷', outer: '−', right: '＋', priority: '÷' },
] as const;
const postfix = define(4, '二つの括弧内と括弧間の四則演算', postfixCases.length,
  '代入先Yを先頭、代入記号を最後に置く例と、五つのオペランド、二つの括弧、演算の優先順位を保持する。', index => {
    const { left, outer, right, priority } = postfixCases[index];
    const infix = 'Y＝(A' + left + 'B)' + outer + '(C' + right + 'D' + priority + 'E)';
    const answer = 'YAB' + left + 'CDE' + priority + right + outer + '＝';
    const options = [
      'YAB' + left + 'C' + right + 'DE' + priority + outer + '＝', answer,
      'YAB' + left + 'EDC' + priority + right + outer + '＝',
      'YBA' + left + 'CD' + right + 'E' + priority + outer + '＝',
    ];
    return {
      prompt: [p(source[4].prompt), p(infix)],
      choices: options.map(value => [p(value)]), correctIndex: options.indexOf(answer),
      explanation: '左の括弧はAB' + left + '。右の括弧ではD' + priority + 'Eを先に行うので，CDE' +
        priority + right + 'となる。二つを並べて' + outer + 'を後置し，Yへの代入まで書くと' + answer + '。',
    };
  });

const ticketSelections = [
  [[10], [10, 50], [10, 100], [50, 100]],
  [[10], [100], [10, 100], [50, 100]],
  [[10], [10, 50, 100], [10, 100], [50, 100]],
  [[20, 100], [10, 20], [10, 100], [100]],
] as const;
const coinText = (coins: readonly number[]) => coins.map(coin => coin + '円硬貨').join('又は');
const vendor = define(5, '切符の価格・受入硬貨・遷移元', ticketCases.length,
  'Q₀は未投入、硬貨1枚ごとに一つの矢印をたどる。価格以上で切符・釣銭を出すEへの矢印を太線で示し、価格・額面・遷移元を本文と図で揃える。', index => {
    const { price, unit, coins, from } = ticketCases[index];
    const text = source[5].prompt.replaceAll('70円', price + '円').replace('Q₄', stateLabels[from])
      .replace('10円硬貨，50円硬貨，100円硬貨', coins.map(coin => coin + '円硬貨').join('，'));
    const candidates = ticketSelections[index].map(option => coinText(option) + 'が投入された。');
    const accepted = coins.filter(coin => from * unit + coin >= price);
    return choiceBody([...text.split('\n').map(p), spring2012AmDiagram('vendor', index)], candidates, coinText(accepted) + 'が投入された。',
      '最小額面の' + unit + '円を繰り返し入れたときの隣接する状態をたどると，' + stateLabels[from] + 'は' + from * unit +
      '円を投入済みの状態。価格' + price + '円まであと' + (price - from * unit) + '円なので，' + coinText(accepted) + 'でEへ移る。');
  });

const structureCases = [
  { putFirst: false, takeFirst: false },
  { putFirst: false, takeFirst: true },
  { putFirst: true, takeFirst: false },
  { putFirst: true, takeFirst: true },
] as const;
function structureCode(putFirst: boolean, takeFirst: boolean) {
  const put = putFirst ? '    for (i = p; i > 0; i = i - 1) {\n        A[i + 1] = A[i];\n    }\n    A[1] = x;\n    p = p + 1;' :
    '    p = p + 1;\n    A[p] = x;';
  const take = takeFirst ? '    x = A[1];\n    for (i = 1; i < p; i = i + 1) {\n        A[i] = A[i + 1];\n    }' :
    '    x = A[p];';
  return 'function f(x) {\n' + put + '\n    return None;\n}\nfunction g() {\n' + take + '\n    p = p - 1;\n    return x;\n}';
}
const structure = define(6, '配列の格納位置と取出し位置', structureCases.length,
  '十分な配列、pの初期値0、二つの関数と4択を保持する。可変条件では位置を詰める処理を字下げ付きで示し、g()を呼ぶ前に要素が存在する条件を明示する。', index => {
    const { putFirst, takeFirst } = structureCases[index];
    const target = putFirst === takeFirst ? 'スタック' : 'キュー';
    const stem = source[6].prompt + (index ? ' ここで，g()は格納済みデータが1個以上あるときだけ呼び出す。' : '');
    return choiceBody([p(stem), code(structureCode(putFirst, takeFirst))], source[6].choices, target,
      'f(x)はデータを使用中の区間の' + (putFirst ? '先頭' : '末尾') + 'に格納し，g()は' +
      (takeFirst ? '先頭' : '末尾') + 'のデータを取り出す。' +
      (putFirst === takeFirst ? '後から入れたものが先に出るのでスタックである。' : '先に入れたものが先に出るのでキューである。'));
  });

const listCases = [
  { reverse: false, checkpoint: false },
  { reverse: true, checkpoint: false },
  { reverse: false, checkpoint: true },
  { reverse: true, checkpoint: true },
] as const;
const pointer = define(7, '単方向リストのリンクの向きと中間ポインタ', listCases.length,
  '多数のデータ、先頭・末尾ポインタ、両端への挿入と削除を保持し、リンクの向きと途中からたどれる条件を変える。対象の隣接要素を直接参照できない端の削除を比較する。', index => {
    const { reverse, checkpoint } = listCases[index];
    const extra = [
      reverse ? '各要素から先頭方向に隣接する要素にだけリンクをたどれるものとする。' :
        '各要素から末尾方向に隣接する要素にだけリンクをたどれるものとする。',
      checkpoint ? '中央付近を指すポインタも一つあり，それ以外には途中の要素を直接参照できない。' : '',
    ].join('');
    const text = index ? source[7].prompt.replace('次の操作', extra + '次の操作') : source[7].prompt;
    const end = reverse ? '先頭' : '末尾';
    const answer = 'リストの' + end + 'のデータを削除する。';
    return choiceBody(text, source[7].choices, answer,
      'リンクと逆向きに' + end + 'の隣の要素を直接求めることはできない。' + end +
      'を削除する場合は，新たに' + end + 'となる要素を' + (checkpoint ? '中央付近から' : reverse ? '末尾から' : '先頭から') +
      '順にたどる。端の挿入とリンク方向の隣接要素が分かる側の削除には，その走査が不要である。');
  });

const superscript = ['', '', '²', '³'];
const exponent = (value: string, power: number) => value + superscript[power];
const groupedSites = (value: string, a: number, b: number) =>
  a === b ? exponent('(' + value.replace('?', superscript[a]) + ')', 2) :
    '(' + value.replace('?', superscript[a]) + ')(' + value.replace('?', superscript[b]) + ')';
const reliability = define(17, 'ディスクと各サイトの端末台数・稼働条件', siteCases.length,
  '図のCPU・磁気ディスク・二つのサイトと装置別1台の稼働率を表示する。サイトごとの少なくとも1台、両サイトの同時稼働を維持し、図とディスクの閾値を同期する。', index => {
    const { disks, sites: [a, b], allDisks } = siteCases[index];
    const stem = source[17].prompt.replace('磁気ディスクは2台とも正常でなければならず',
      '磁気ディスクは' + (allDisks ? disks + '台とも' : disks + '台のうち少なくとも1台が') + '正常でなければならず') +
      (index ? ' CPUは正常でなければならず，各装置の稼働は互いに独立とする。' : '');
    const correctDisk = allDisks ? exponent('D', disks) : '(1−' + exponent('(1−D)', disks) + ')';
    const wrongDisk = allDisks ? exponent('(1−D)', disks) : '(1−' + exponent('D', disks) + ')';
    const correctSites = groupedSites('1−(1−T)?', a, b), wrongSites = groupedSites('1−T?', a, b);
    const expressions = [correctDisk + 'C' + wrongSites, correctDisk + 'C' + correctSites,
      wrongDisk + 'C' + wrongSites, wrongDisk + 'C' + correctSites];
    return {
      prompt: [p(stem), spring2012AmDiagram('reliability', index)],
      choices: expressions.map(value => [p(value)]), correctIndex: 1,
      explanation: '装置が独立に稼働するとして，ディスクの条件を満たす確率は' + correctDisk +
        '，CPUはC。各サイトでは全端末が停止する場合を1から引く。両サイトの条件も同時に満たす必要があるので，積は' +
        expressions[1] + 'となる。',
    };
  });

const timeTerms = ['応答時間', '回線伝送時間', '端末処理時間', 'サーバ処理時間'] as const;
const unknownTimes = [3, 2, 1, 0];
const timeSigns = ['＋', '−'] as const;
const responseTime = define(19, 'トランザクション時間の既知項目と求める項目', unknownTimes.length,
  '一つのトランザクション、他のオーバヘッド無視、時間を求める加減算4式を保持する。四つの測定項目のうち未知の項目を切り替える。', index => {
    const unknown = unknownTimes[index], target = timeTerms[unknown], measured = timeTerms.filter((_, i) => i !== unknown);
    const stem = index ? 'オンラインリアルタイム処理における一つのトランザクションについて，端末とサーバの記録から' +
      measured.join('，') + 'が分かるとき，' + target + 'を求める式として適切なものはどれか。ここで，他のオーバヘッドは無視するものとする。'
      : source[19].prompt;
    const candidates = timeSigns.flatMap(first => timeSigns.map(second =>
      target + '＝' + measured[0] + first + measured[1] + second + measured[2]));
    const answer = target + '＝' + measured.join(unknown === 0 ? '＋' : '−');
    return {
      prompt: [p(stem)],
      choices: candidates.map(value => [p(value)]), correctIndex: candidates.indexOf(answer),
      explanation: '他のオーバヘッドを無視すると，応答時間＝回線伝送時間＋端末処理時間＋サーバ処理時間である。' +
        'この式で未知の' + target + 'を左辺にすると，' + answer + 'になる。',
    };
  });

const jobCases = [
  { jobs: 4, word: '四つ', cpu: 20, data: 400 },
  { jobs: 3, word: '三つ', cpu: 15, data: 300 },
  { jobs: 4, word: '四つ', cpu: 10, data: 300 },
  { jobs: 5, word: '五つ', cpu: 20, data: 400 },
] as const;
const jobs = define(20, 'ジョブ数・CPU処理時間・印刷データ量', jobCases.length,
  '多重度1、1台のプリンタ、スプーリング後に印刷、CPUと印刷の同時動作、他時間の無視を保持する。丸めを要さず印刷1件がCPU1件より長い範囲で四つの昇順候補。', index => {
    const { jobs: count, word, cpu, data } = jobCases[index];
    const material = source[20].material.replace('20分', cpu + '分').replace('400Mバイト', data + 'Mバイト');
    const print = data / 100 * 10;
    const answer = cpu + count * print;
    const choices = [count * cpu + print, count * print, answer, count * (cpu + print)].sort((a, b) => a - b);
    return choiceBody([p(source[20].prompt.replace('四つ', word)), ...material.split('\n').map(p)], choices, answer,
      '最初のCPU処理は' + cpu + '分で終了し，その時点で1件目の印刷を開始できる。1件' + print +
      '分の印刷中に次のジョブのCPU処理が終わるので，プリンタは待たずに' + count + '件を連続して印刷する。' +
      cpu + '＋' + count + '×' + print + '＝' + answer + '分である。');
  });

const ledCases = [0x6d, 0x66, 0xcf, 0xa7] as const;
const display = define(25, '出力ポートの16進数', ledCases.length,
  'P7が最上位、P0が最下位、1で点灯する規則、抵抗・接地、7セグメントと小数点、四つの表示状態を保持する。入力値を切り替える。', index => {
    const value = ledCases[index], hex = value.toString(16).toUpperCase(), bits = value.toString(2).padStart(8, '0');
    const lit = ledSegments.filter((_, bit) => (value & (1 << bit)) !== 0);
    return {
      prompt: [p(source[25].prompt.replace('6D', hex)), spring2012AmDiagram('ledCircuit', 0)],
      choices: ledMasks.map((_, i) => [spring2012AmDiagram('ledChoice', i)]),
      correctIndex: ledMasks.findIndex(mask => mask === value),
      explanation: hex + 'を8ビットで表すと' + bits + '（左からP7〜P0）である。1になっているポートに対応する' +
        lit.join('，') + 'が点灯し，残りは消灯する。',
    };
  });

const pcmCases = [
  { minutes: 60, rate: 44.1 },
  { minutes: 30, rate: 44.1 },
  { minutes: 30, rate: 22.05 },
  { minutes: 120, rate: 44.1 },
] as const;
const pcm = define(26, '音声の時間と標本化周波数', pcmCases.length,
  '非圧縮、モノラル、16ビット、Mバイトの概数、倍間隔の昇順4択を保持する。標本化周波数は基準値又はその半分で、時間も倍・半分から選ぶ。', index => {
    const { minutes, rate } = pcmCases[index], bytes = minutes * 60 * (rate * 1000) * 2;
    const choices = source[26].choices.map(Number);
    const answer = choices.reduce((nearest, value) => Math.abs(value - bytes / 1_000_000) < Math.abs(nearest - bytes / 1_000_000) ? value : nearest);
    const stem = source[26].prompt.replace('60分', minutes + '分').replace('44.1kHz', rate + 'kHz');
    return choiceBody(stem, choices, answer,
      'モノラルで1標本は16ビット＝2バイト。' + rate + 'kHzは毎秒' + rate * 1000 + '標本，' + minutes + '分は' +
      minutes * 60 + '秒なので，' + bytes.toLocaleString('ja-JP') + 'バイトになる。選択肢で最も近いのは' + answer + 'Mバイトである。');
  });

export const calculation2012SpringAm0126 = [
  finite, multiply, adjacency, postfix, vendor, structure, pointer, reliability, responseTime, jobs, display, pcm,
];
