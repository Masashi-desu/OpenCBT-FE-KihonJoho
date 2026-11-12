import { code, p, table } from './definition';
import { correlations, draw } from './legacy-2008-spring-am-01-26-figures';
import { body, define, latex, source, textBody } from './legacy-2008-spring-am-01-26-shared';

const extraction = define(1, 'ビット数・変換先の基数・取り出す桁幅', 4,
  '下位桁からスタックへ送る三手順とa/b表。基数に対応した下位ビットのマスクとシフト幅を変える。', index => {
    const [width, bits] = ([[16, 4], [12, 3], [8, 2], [8, 1]] as const)[index];
    const radix = 2 ** bits;
    const hexWidth = Math.ceil(width / 4);
    const hexadecimal = (n: number) => n.toString(16).toUpperCase().padStart(hexWidth, '0') + '₁₆';
    const low = hexadecimal(radix - 1), high = hexadecimal(2 ** width - radix);
    const prompt = source[1].prompt.replace('16ビット', width + 'ビット').replace('16進数の各けた', radix + '進数の各けた')
      .replace('4回', width / bits + '回');
    const rows = [low, high].flatMap(mask => ['左', '右'].map(direction =>
      ['n AND ' + mask, direction + 'に' + bits + 'ビット']));
    return body([p(prompt), p('〔手順〕'), p('（1）［a］を x に代入する。'), p('（2）x をスタックにプッシュする。'),
      p('（3）n を［b］論理シフトする。')], rows.map(cells => [table('aとbの組合せ', ['a', 'b'], [cells])]), 1,
      radix + 'は2の' + bits + '乗なので，' + radix + '進数の1けたは2進数の' + bits + 'ビットである。nと' + low +
      'のANDで下位' + bits + 'ビットだけを取り出して積み，nを右へ' + bits + 'ビット論理シフトすると次のけたが下位に移る。');
  });

const fraction = define(2, '16進で2桁に収まる10進分数', 4,
  '16進小数の小数第1・2位を読む四候補。小数第2位に対応する分数を切り替え、桁数を固定する。', index => {
    const [n, d, correct] = ([[1, 32, 3], [1, 256, 0], [1, 128, 1], [5, 256, 2]] as const)[index];
    const digit = n * 256 / d;
    return textBody(source[2].prompt.replace('1/32', n + '/' + d), source[2].choices, correct,
      '16進小数の第1位は1/16，第2位は1/256を表す。' + n + '/' + d + '＝' + digit +
      '/256なので，第1位は0，第2位は' + digit + 'となり，16進数では' + source[2].choices[correct] + 'である。');
  });

const complement = define(3, 'nビットの符号桁と下位のビット列', 4,
  'nビットの2の補数表現から値・数式を選ぶ。連続1の下端、符号桁のみ、符号桁と最下位が1の入力を用意する。', index => {
    const cases = [
      { prompt: source[3].prompt, options: ['-(2^{n-1}-1)', '-1', '0', '2^n-1'], correct: 1,
        explanation: '最上位の重みは−2の(n−1)乗で，下位の1を全て足すと2の(n−1)乗−1になる。和は−1である。' },
      { prompt: '負数を2の補数で表すとき，最下位のビットだけが0で，他が全て1である n ビット（n≧4）の2進数「1111…10」が表す数値又はその数式はどれか。',
        options: ['-(2^{n-1}-2)', '-2', '-1', '2^n-2'], correct: 1,
        explanation: '最上位の重みは−2の(n−1)乗。残りの1の位の重みは，下位が全て1の場合から最下位の1を引くので2の(n−1)乗−2になり，和は−2となる。' },
      { prompt: '負数を2の補数で表すとき，最上位のビットだけが1で，他が全て0である n ビット（n≧4）の2進数「1000…00」が表す数値又はその数式はどれか。',
        options: ['-2^{n-1}', '-(2^{n-1}-1)', '0', '2^{n-1}'], correct: 0,
        explanation: '最上位のビットだけが1なので，最上位の重み−2の(n−1)乗がそのままこの2の補数表現の値になる。' },
      { prompt: '負数を2の補数で表すとき，最上位と最下位のビットが1で，他が全て0である n ビット（n≧4）の2進数「1000…01」が表す数値又はその数式はどれか。',
        options: ['-2^{n-1}', '-(2^{n-1}-1)', '-1', '2^{n-1}+1'], correct: 1,
        explanation: '最上位の重みは−2の(n−1)乗，最下位の重みは1である。この二つの和は−(2の(n−1)乗−1)になる。' },
    ];
    const { prompt, options, correct, explanation } = cases[index];
    return body(prompt, options.map(option => [latex(option, option.replaceAll('-', '−').replace('^{n−1}', 'の(n−1)乗').replace('^n', 'のn乗'))]),
      correct, explanation);
  });

const shifts = define(4, 'シフト演算で求める定数倍', 4,
  'オーバーフローしない左シフトと加算の組合せを保つ。四操作の結果に対応する倍率を本文側で指定する。', index => {
    const multipliers = [10, 20, 12, 18];
    const detail = ['（4x＋x）×2', '（4x＋x）×4', '8x＋4x', '（8x＋x）×2'][index];
    return textBody(source[4].prompt.replace('10倍', multipliers[index] + '倍'), source[4].choices, index,
      '左へkビットシフトすると値は2のk乗倍になる。選択した操作を式にすると' + detail + '＝' + multipliers[index] + 'xである。');
  });

type Floating = readonly [string, number, '＋' | '−', string, number];
const floatCases: readonly (readonly Floating[])[] = [
  [['10.101', -16, '−', '1.001', -15], ['10.101', 16, '−', '1.001', 16], ['1.01', 18, '＋', '1.01', -5], ['1.001', 20, '＋', '1.1111', 21]],
  [['10.101', 19, '−', '1.001', -6], ['10.101', 13, '−', '1.001', 14], ['1.01', 18, '＋', '1.01', 6], ['1.001', 20, '＋', '1.1111', 21]],
  [['10.101', -12, '−', '1.001', -11], ['10.101', 22, '−', '1.001', -4], ['1.01', 14, '＋', '1.01', 8], ['1.001', 20, '＋', '1.1111', 21]],
  [['10.101', 14, '−', '1.001', 15], ['10.101', 14, '−', '1.001', 14], ['1.01', 18, '＋', '1.01', 7], ['1.001', 22, '＋', '1.1111', -4]],
];
const floating = define(5, '仮数部のビット数と二数の指数差', 4,
  '2進仮数と2のべきの加減算。精度を21〜24ビットとし、指数を合わせると小さい方の有効ビットが精度を越える候補を一つにする。', index => {
    const precision = [23, 21, 22, 24][index], correct = [2, 0, 1, 3][index];
    const options = floatCases[index].map(([a, ae, operator, b, be]) => [latex(
      '(' + a + ')_2\\times 2^{' + ae + '}' + (operator === '＋' ? '+' : '-') + '(' + b + ')_2\\times 2^{' + be + '}',
      '(' + a + ')₂×2の' + String(ae).replace('-', '−') + '乗 ' + operator + ' (' + b + ')₂×2の' + String(be).replace('-', '−') + '乗',
    )]);
    return body(source[5].prompt.replace('23ビット', precision + 'ビット'), options, correct,
      '加減算では二数の小数点の位置をそろえる。絶対値が小さい方の仮数を右へずらすと，この式では小さい方の末尾の1が有効桁の範囲を外れる。' +
      '絶対値の差が大きいことで小さい値の情報を失うので，情報落ちとなる。');
  });

const words = define(7, '使用する文字と最大の列長', 4,
  '元の「長さ1以上」の全数を数える構成を維持し、文字数と最大長を変える。最大長だけ・空列の算入・次の長さの数を区別する。', index => {
    const [size, length] = ([[2, 7], [2, 5], [3, 4], [3, 5]] as const)[index];
    const names = size === 2 ? 'AとB' : 'A，B及びC';
    const count = Array.from({ length }, (_, i) => size ** (i + 1)).reduce((sum, n) => sum + n, 0);
    return textBody(size + '個の文字' + names + 'を使って，長さ1以上' + length + '以下の文字列は何通りできるか。',
      [size ** length, count, count + 1, size ** (length + 1)], 1,
      '各位置で' + size + '個の文字を選べるので，長さkの文字列は' + size + 'のk乗通り。空文字列を除き，k＝1から' +
      length + 'まで合計すると' + count + '通りである。');
  });

const correlation = define(8, '四つの散布図のうち判定する相関係数', 4,
  '六点・回帰直線・原図の4候補順を保つ。符号と強さの4組を本文の判定対象へ切り替える。', index => {
    const correct = [2, 3, 1, 0][index], r = correlations[correct];
    const target = String(r).replace('-', '−');
    const prompt = source[8].prompt.replace('が−0.9のもの', 'が' + target + 'のもの');
    return body(prompt, correlations.map((_, i) => [draw('scatter', i, '標本の分布と回帰直線')]), correct,
      '回帰直線は' + (r < 0 ? '右下がり' : '右上がり') + 'なので相関の符号は' + (r < 0 ? '負' : '正') +
      'である。絶対値' + Math.abs(r) + 'は，' + (Math.abs(r) === 0.9 ? '点が直線に近く並ぶ方' : '点が直線から比較的大きく散らばる方') + 'に対応する。');
  });

const truth = define(9, '論理変数xyzと真理値表の結果', 4,
  'T/Fの8行と論理積・論理和・否定上線を維持し、演算結果に応じた論理式を選ぶ。', index => {
    const correct = [1, 0, 2, 3][index];
    const values = (x: boolean, y: boolean, z: boolean) => [
      (x && y) || (y && z), (x && y) || (!y && z), (x && y) || (!y && !z), (x && !y) || (!y && !z),
    ];
    const bool = [true, false], show = (value: boolean) => value ? 'T' : 'F';
    const rows = bool.flatMap(x => bool.flatMap(y => bool.map(z => [x, y, z, values(x, y, z)[correct]].map(show))));
    const explanation = [
      'yが真で，xかzの少なくとも一方が真なら結果が真になる。',
      'yが真の行ではxと，yが偽の行ではzと，結果が一致する。',
      'yが真の行ではxと，yが偽の行ではzを否定した値と，結果が一致する。',
      'yが偽で，xが真又はzが偽の場合に結果が真になる。',
    ][correct];
    return body([p(source[9].prompt.replace('Aの上線はAの否定', 'A̅はAの否定')),
      table('真理値表', ['x', 'y', 'z', 'f(x, y, z)'], rows)],
      source[9].choices.map((_, i) => [draw('logic', i, '論理式')]), correct, explanation + ' 4候補の式を各行で評価すると，この式だけが8行すべてに一致する。');
  });

const parity = define(10, '三つの7ビット文字コードと付けるパリティ', 4,
  '3個の2桁16進コードの先頭に付加する1ビットを問う。偶数／奇数と元コードの1の個数を変える。', index => {
    const inputs = [[0x30, 0x3f, 0x7a], [0x31, 0x3e, 0x7a], [0x32, 0x33, 0x49], [0x22, 0x55, 0x70]][index];
    const wantsOdd = index % 2;
    const flags = [0, 1, 5, 6];
    const hex = (value: number) => value.toString(16).padStart(2, '0').toUpperCase();
    const ones = inputs.map(byte => byte.toString(2).replaceAll('0', '').length);
    const top = ones.map(n => (n % 2) ^ wantsOdd);
    const mask = top.reduce((a, bit) => (a << 1) + bit, 0);
    const prompt = source[10].prompt.replace('偶数', wantsOdd ? '奇数' : '偶数').replace('30，3F，7A', inputs.map(hex).join('，'));
    const options = flags.map(flag => inputs.map((value, i) => hex(value | (((flag >> (2 - i)) & 1) << 7))).join('，'));
    return textBody(prompt, options, flags.indexOf(mask),
      '元の7ビットの1の数は，表示順に' + ones.join('，') + '個。8ビット全体の1の数を' + (wantsOdd ? '奇数' : '偶数') +
      'にする先頭ビットは順に' + top.join('，') + 'で，1を付ける場合は元の16進数に80₁₆を加える。');
  });

const grammar = define(11, 'BNFの基底列と左右へ加えるビット', 4,
  '非終端S、2ビットの基底列、左右に1ビット加える再帰形、4個の6ビット候補を維持。', index => {
    const cases = [
      ['01', '0', '1', ['000111', '010010', '010101', '011111']],
      ['10', '1', '0', ['100101', '110010', '111000', '100000']],
      ['10', '0', '1', ['001101', '001011', '010101', '011111']],
      ['01', '1', '0', ['111000', '101001', '110010', '110100']],
    ] as const;
    const [base, left, right, options] = cases[index];
    const wanted = left.repeat(2) + base + right.repeat(2);
    return textBody([p(source[11].prompt), code('<S> ::= ' + base + ' | ' + left + '<S>' + right, 'text')], options,
      options.findIndex(option => option === wanted),
      '6ビット列には再帰規則を2回使い，真ん中のSは基底規則で' + base + 'にする。左右に' + left +
      'と' + right + 'を2回ずつ付けるので，結果は' + wanted + 'となる。');
  });

const searchTree = define(12, '全ての下位節点がそろう探索木の総数', 4,
  '元の左右の子の条件・不存在も含む2分探索を保つ。節点が15/31/63/127の完全な木を使う。', index => {
    const levels = index + 4, count = 2 ** levels - 1;
    const prompt = source[12].prompt.replace('総数が15', '総数が' + count);
    return textBody(prompt, [levels - 1, levels, 2 ** (levels - 1) - 1, count], 1,
      '各レベルの節点数は1，2，4と2倍ずつ増える。全部で' + count + '節点なので' + levels +
      'レベルある。探索では根から一方の子だけをたどり，最も深い場合に1レベルずつ計' + levels + '節点を比較する。');
  });

const hashing = define(14, '基準キーとキー範囲の上限', 4,
  '同じ剰余をもつキーの個数を問う。法97を維持して剰余と上限を切り替え、四択は9〜12を維持する。', index => {
    const [key, last] = ([[1094, 1000], [1005, 900], [1080, 950], [1183, 1100]] as const)[index];
    const remainder = key % 97;
    const count = Math.floor((last - remainder) / 97) + 1;
    const prompt = source[14].prompt.replace('キー1094', 'キー' + key).replace('1〜1000', '1〜' + last);
    return textBody(prompt, [9, 10, 11, 12], count - 9,
      key + 'を97で割った余りは' + remainder + '。範囲内で同じ値になるキーは' + remainder + 'から97ずつ増え，' +
      (remainder + (count - 1) * 97) + 'までの' + count + '個である。');
  });

const gcd = define(15, '引き算で最大公約数を求める整数の組', 4,
  'L/Sの比較、二方向の減算、等値での出力を含む流れ図。複数の減算段階をもつ元と同程度の整数を用意。', index => {
    const [a, b] = ([[876, 204], [486, 216], [625, 225], [714, 210]] as const)[index];
    let left: number = a, right: number = b, comparisons = 1;
    while (left !== right) {
      if (left > right) left -= right;
      else right -= left;
      comparisons++;
    }
    // The first distractor counts division-with-remainder stages, not individual comparisons.
    let quotientStages = 0, high: number = a, low: number = b;
    while (low) {
      [high, low] = [low, high % low];
      quotientStages++;
    }
    const options = [quotientStages, comparisons - 2, comparisons - 1, comparisons];
    const prompt = source[15].prompt.replace('A が876，B が204', 'A が' + a + '，B が' + b);
    return textBody([p(prompt), draw('gcd', 0, '引き算の繰返しによるユークリッドの互除法')], options, 3,
      'LとSを比較するたびに大きい値から小さい値を1回引く。' + (comparisons - 1) +
      '回の減算で両方が' + left + 'になる。減算を行わずに等しいと判定する最後の1回も比較なので，合計は' + comparisons + '回である。');
  });

const mips = define(19, 'クロック周波数と2種類の命令の実行時間・出現率', 4,
  '2行の命令種別表、GHzとMIPS、約何MIPSかという精度を維持。出現頻度とクロック数を独立に変更する。', index => {
    const [ghz, long, short, share] = ([[1, 10, 5, 60], [1.8, 12, 4, 70], [1.5, 9, 4, 40], [0.8, 10, 5, 20]] as const)[index];
    const mean = (long * share + short * (100 - share)) / 100;
    const millions = 1000 * ghz;
    const correct = Math.round(millions / mean);
    const options = index === 0 ? [34, 100, 125, 133] : [
      Math.round(millions / long), Math.round(millions / short), Math.round(2 * millions / (long + short)), correct,
    ].sort((a, b) => a - b);
    return textBody([p(source[19].prompt.replace('1 GHz', ghz + ' GHz')),
      table('CPUの命令種別', ['命令種別', '実行時間（クロック）', '出現頻度（%）'], [
        ['命令1', String(long), String(share)], ['命令2', String(short), String(100 - share)],
      ])], options, options.indexOf(correct),
      '命令1と命令2の出現頻度を使った加重平均は' + long + '×' + share + '%＋' + short + '×' + (100 - share) +
      '%＝' + mean + 'クロック／命令である。' + ghz + ' GHzは' + millions + '百万クロック／秒なので，' + millions + '÷' +
      mean + '≒' + correct + ' MIPSとなる。');
  });

const imageArea = define(25, 'スキャナとプリンタの解像度', 4,
  '読み取った画素数を一定とし、dpiの線寸法の比と面積比を区別する。2倍と3倍、それぞれ拡大／縮小を用意。', index => {
    const [input, output] = ([[600, 300], [300, 600], [900, 300], [300, 900]] as const)[index];
    const scale = Math.max(input, output) / Math.min(input, output), squared = scale ** 2;
    const options = ['1/' + squared, '1/' + scale, String(scale), String(squared)];
    const prompt = source[25].prompt.replace('600 dpi', input + ' dpi')
      .replace(/解像度300 dpiのプリンタ/, '解像度' + output + ' dpiのプリンタ') +
      (index === 0 ? '' : 'ここで，読み取った画像の画素数を変えずに印刷する。');
    const correct = input > output ? 3 : 0;
    return body(prompt, options.map(option => {
      const [n, denominator] = option.split('/');
      return [latex(denominator ? '\\frac{' + n + '}{' + denominator + '}' : n, option)];
    }), correct, '読み取った画素数は同じままで，印刷時の1インチ当たりの画素数が変わる。縦横の各長さは ' + input + '/' + output +
      ' 倍なので，面積はその2乗の ' + options[correct] + ' 倍になる。');
  });

export const calculations2008SpringAm0126 = [
  extraction, fraction, complement, shifts, floating, words, correlation, truth, parity, grammar, searchTree, hashing, gcd, mips, imageArea,
];
