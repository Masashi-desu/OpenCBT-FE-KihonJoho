import { p, pairs, strings, table } from './definition';
import { autumn2013AmDiagram } from './legacy-2013-autumn-am-01-26-figures';
import { define, knowledge, marks, source, textBody } from './legacy-2013-autumn-am-01-26-shared';

const vennExpressions = [
  ['（Ā∩B∩C）∪（A∩B∩C̄）', 2, '一方の項はAの外でBとCの共通部，もう一方はCの外でAとBの共通部である。両方を合わせると，Bに属し，AとCの一方だけに属する二領域が残る。'],
  ['（Ā∩B）∪（A∩B∩C̄）', 0, 'Aの外でBに属する部分はBだけとB・Cだけ。もう一方はA・Bだけであり，この三領域を合わせる。'],
  ['（A∩C̄）∪（Ā∩B∩C̄）', 1, 'Cの外でAに属する部分はAだけとA・Bだけ。残る項はAとCの外でBに属するBだけの部分である。'],
] as const;
const venn = define(1, '積集合を構成する要素と補集合', vennExpressions.length,
  '二つの積集合の和を三円の網掛けで選ぶ。四図は原順・原配置のまま、積に使う集合と補集合を変更して8領域で比較する。', index => {
    const [expression, correctIndex, explanation] = vennExpressions[index];
    return { prompt: [p(source[1].prompt.replace(vennExpressions[0][0], expression))],
      choices: [...marks].map((mark, option) => [autumn2013AmDiagram('venn', option, '選択肢' + mark + 'のベン図')]),
      correctIndex, explanation };
  });

const shifts = [[0xABCD, 2], [0xC008, 2], [0x9A60, 3]] as const;
const hex = (number: number) => number.toString(16).toUpperCase().padStart(4, '0');
const shift = define(2, 'レジスタの16進値とシフト幅', shifts.length,
  '32ビット幅、16進数4桁、右論理シフトを維持。左へのシフトと上位16ビット側を誤って埋める候補を入れ、原の16進尺度順を保つ。', index => {
    const [input, steps] = shifts[index], result = input >>> steps;
    const highBit = 1 << (16 - steps);
    const choices = [result, result | highBit, (input << steps) & 0xFFFF, result | (0xFFFF ^ (highBit - 1))].sort((a, b) => a - b).map(hex);
    const prompt = source[2].prompt.replace('ABCD', hex(input)).replace('2ビットだけ右', steps + 'ビットだけ右');
    return textBody(prompt, choices, choices.indexOf(hex(result)), '先頭は0で埋め，右端の' + steps + 'ビットを捨てる。' +
      'したがって16進数' + hex(input) + 'を2の' + steps + '乗で割った整数部に対応する16進数' + hex(result) + 'を得る。');
  });

const digitCases = [[4, 7, 6, 2], [2, 5, 4, 3], [2, 8, 3, 1]] as const;
const digit = define(3, '検査数字と後続3桁', digitCases.length,
  '後続3桁に重み2、3、4を掛け、先頭1桁と合計した10での余りから先頭桁を求める。残りの桁の剰余、重みの漏れや取り違えを誤答にする。', index => {
    const [check, second, third, fourth] = digitCases[index];
    const sum = second * 2 + third * 3 + fourth * 4;
    const modulo = (value: number) => (value % 10 + 10) % 10;
    const answer = modulo(check - sum);
    const options = [sum % 10, modulo(check - (sum - third * 3)), modulo(check - (sum - fourth)), answer].sort((a, b) => a - b);
    const prompt = source[3].prompt.replace('C＝4', 'C＝' + check).replace('N₂＝7，N₃＝6，N₄＝2',
      'N₂＝' + second + '，N₃＝' + third + '，N₄＝' + fourth);
    return { prompt: [p(prompt), p(source[3].material!)], choices: strings(options.map(String)), correctIndex: options.indexOf(answer),
      explanation: '後続3桁の重み付き和は' + second + '×2＋' + third + '×3＋' + fourth + '×4＝' + sum +
        'である。これにN₁を足したとき10で割った余りが' + check + 'となる1〜9の値は' + answer + 'である。' };
  });

const rates = [64000, 80000, 40000];
const sampling = define(4, '圧縮しないビット転送速度', rates.length,
  '8ビット／標本、非圧縮、マイクロ秒を固定。正答は丸め不要。誤答に1ビット又は3ビット相当、二進接頭辞の取り違えによる1.024倍を置く。', index => {
    const rate = rates[index];
    const answer = 8000000 / rate;
    const bitTime = Math.floor(10000000 / rate) / 10;
    const options = index === 0 ? source[4].choices : [bitTime, bitTime * 3, answer, answer * 1.024].map(String);
    const prompt = source[4].prompt.replace('64,000', rate.toLocaleString('en-US'));
    return textBody(prompt, options, 2, 'パルス符号変調（Pulse Code Modulation、PCM）で1標本は8ビット。' +
      '毎秒の標本数は' + rate.toLocaleString('en-US') + '÷8＝' + (rate / 8).toLocaleString('en-US') +
      'であり，間隔はその逆数なので' + answer + 'マイクロ秒である。');
  });

const queueOrders = [[1,2,3,4,5,6], [5,4,3,2,1,6], [2,5,1,6,4,3]] as const;
const queue = define(5, '空の待ち行列への挿入順', queueOrders.length,
  'ENQ・DEQの定義と6回の挿入・4回の途中取出しを維持。挿入データの順を変え、早く出る二つと最後に残る二つを数値順に比較する。', index => {
    const values = queueOrders[index], enqueues = values.map(value => 'ENQ ' + value);
    const operations = [...enqueues.slice(0, 3), 'DEQ', ...enqueues.slice(3, 5), 'DEQ', enqueues[5], 'DEQ', 'DEQ'];
    const contents: number[] = [], popped: number[] = [];
    for (const operation of operations) {
      if (operation === 'DEQ') popped.push(contents.shift()!);
      else contents.push(Number(operation.slice(4)));
    }
    const [answer, next] = contents;
    const options = [values[0], values[1], answer, next].sort((a, b) => a - b);
    return { prompt: source[5].prompt.replace(/ENQ 1，.*DEQの操作/, operations.join('，') + 'の操作').split('\n').map(p),
      choices: strings(options.map(String)), correctIndex: options.indexOf(answer),
      explanation: '先に入れたものから出る。記載のDEQで' + popped.join('，') +
        'の順に取り出した後，待ち行列は先頭から' + answer + '，' + next + 'となるので，次のDEQは' + answer + 'を取り出す。' };
  });

const lists = knowledge(6, 'リスト実装と着目する費用',
  '配列実装とポインタ実装の説明を選ぶ方向を維持。後者について必要な領域と順次参照の時間を本文で区別する。',
  '最大長分を先に確保する配列では，要素数が最大長に達しなければ未使用領域が生じる。配列の中間要素は添字で直接参照できるが，任意の位置への挿入・削除は後続要素を移動する場合がある。次要素へのポインタは配列の各要素には不要。', [
    { prompt: 'リストは，配列で実現する場合とポインタで実現する場合とがある。ポインタによる単方向の連結リストで実現した場合の，領域の使い方の特徴として適切なものはどれか。',
      correctIndex: 3, explanation: '連結リストではデータの領域に加え，次要素の位置を記録するポインタの領域が必要である。配列のように最大長の連続領域を確保する必要はない。' },
    { prompt: 'リストは，配列で実現する場合とポインタで実現する場合とがある。先頭へのポインタだけが分かる単方向の連結リストで，中央の要素を読み出すまでの時間の特徴として適切なものはどれか。',
      correctIndex: 2, explanation: '中央の要素には先頭からリンクを順にたどって到達する。到達までにたどるリンク数は中央位置の添字，したがって全体の要素数に比例する。' },
  ]);

const insertions = [
  { inputs: [16,43,73,24,85], other: 3 },
  { inputs: [18,45,75,28,84], other: 6 },
  { inputs: [12,42,77,14,84], other: 3 },
];
const positions = (key: number) => [0, 1, 4].map(offset => (key + offset) % 10);
const hash = define(7, '衝突の順序を決める5個の整数', insertions.length,
  '0〜9の配列を0初期化し、正整数を順に0・1・4のオフセットで試す。直接・第2・第3候補への格納をそれぞれ扱い、添字の昇順を維持する。', index => {
    const { inputs, other } = insertions[index];
    const array = Array<number>(10).fill(0), locations: number[] = [];
    for (const input of inputs) {
      const location = positions(input).find(location => array[location] === 0);
      if (location === undefined) throw Error('PARAMETER_CONSTRAINT');
      array[location] = input;
      locations.push(location);
    }
    const target = inputs[4], answer = locations[4];
    const options = [other, ...positions(target)].sort((a, b) => a - b);
    const prompt = source[7].prompt.replace('16，43，73，24，85', inputs.join('，')).replace('85が', target + 'が');
    return { prompt: [p(prompt), ...source[7].material!.split('\n').map(p)],
      choices: strings(options.map(location => 'A[' + location + ']')), correctIndex: options.indexOf(answer),
      explanation: '先の4件は順に' + locations.slice(0, 4).map(location => 'A[' + location + ']').join('，') +
        'へ格納される。' + target + 'の候補は' + positions(target).map(location => 'A[' + location + ']').join('，') +
        'の順で，最初の空きがA[' + answer + ']である。' };
  });

const booleanChoices = [['No','No'], ['No','Yes'], ['Yes','No'], ['Yes','Yes']];
const flow = define(8, '左の判定で否定する条件の組合せ', 4,
  '二つの流れ図を維持し、左の論理和の否定位置だけを変える。Pの短絡とQの処理回避の枝は原配置、解答表のa・b列と組合せ順は原順。', index => {
    const correctIndex = [0, 2, 1, 3][index];
    const [a, b] = booleanChoices[correctIndex];
    return { prompt: [p(source[8].prompt), autumn2013AmDiagram('flow', index, '左と右の流れ図'),
      table('解答群', ['', 'a', 'b'], booleanChoices.map((row, i) => [marks[i], ...row]))],
      choices: pairs(booleanChoices), correctIndex,
      explanation: 'Pの項だけで論理和が成立するP＝' + a + 'のときはQを判定せず処理へ進むのでaは' + a +
        '。Pの項が成立しないときはQの項も成立しないQ＝' + b + 'のときに処理を通らないのでbは' + b + '。' };
  });

const throughputCases = [[80,200,80], [50,200,80], [60,288,75]] as const;
const throughput = define(9, '命令数、プロセッサ性能、使用率', throughputCases.length,
  '万ステップ、MIPS、使用率から件／秒を求める。一桁の単位違い、使用率の無視、使用率で割る計算を誤答とし、正答は整数。', index => {
    const [instructions, mips, utilization] = throughputCases[index];
    const maximum = mips * 100 / instructions;
    const answer = maximum * utilization / 100;
    const options = [answer / 10, answer, maximum, Math.round(maximum * 100 / utilization)];
    const prompt = source[9].prompt.replace('80万', instructions + '万').replace('200 MIPS', mips + ' MIPS').replace('80％', utilization + '％');
    return textBody(prompt, options.map(String), 1, 'MIPS（Million Instructions Per Second、毎秒100万命令）の値に使用率を掛ける。' +
      '実行可能な命令は毎秒' + (mips * utilization / 100) + '百万ステップであり，1件当たり' + instructions +
      '万ステップで割ると' + answer + '件／秒となる。');
  });

export const autumn2013Am01To09 = [venn, shift, digit, sampling, queue, lists, hash, flow, throughput];
