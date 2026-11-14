import { code, p, table } from './definition';
import { addressCases, draw, flowCases, trees, type Tree } from './legacy-2007-autumn-am-01-26-figures';
import { body, define, latex, source, textBody } from './legacy-2007-autumn-am-01-26-shared';

const hexadecimal = define(1, '16進小数の小数第1位', 4, '原問と同じ1桁の16進小数に対し、小数第1位の重みを用いる。解答は小さい順。', index => {
  const input = ['C', '2', '8', 'E'][index];
  const choices = [['0.12', '0.55', '0.75', '0.84'], ['0.02', '0.125', '0.25', '0.32'],
    ['0.08', '0.48', '0.5', '0.8'], ['0.14', '0.4375', '0.78', '0.875']][index];
  const decimal = Number.parseInt(input, 16);
  return textBody(source[1].prompt.replace('0.C', '0.' + input), choices, choices.indexOf(String(decimal / 16)),
    '16進数の小数第1位は1/16の位である。' + input + 'は10進数の' + decimal + 'なので，' + decimal + '/16＝' + decimal / 16 + 'になる。');
});

const bits = 'b₁b₂…bₙ';
const multiples = define(2, '非負の2進数を何倍するか', 4, '定数倍と末尾に連結する2進桁の式を維持。個別入力の偶然の一致ではなく非負の任意入力で成立する恒等式を選ぶ。', index => {
  const cases: readonly (readonly [number, readonly string[]])[] = [
    [3, [bits + '0＋' + bits, bits + '00−1', bits + '000', bits + '1']],
    [5, [bits + '00', bits + '00＋' + bits, bits + '01', bits + '00−1']],
    [6, [bits + '01＋' + bits, bits + '000', bits + '00＋' + bits + '0', bits + '00−1']],
    [9, [bits + '001', bits + '000−1', bits + '000', bits + '000＋' + bits]],
  ];
  const [multiplier, choices] = cases[index];
  const equalities = ['2×元の値＋元の値', '4×元の値＋元の値', '4×元の値＋2×元の値', '8×元の値＋元の値'];
  return textBody(source[2].prompt.replace('3倍', multiplier + '倍'), choices, index,
    '右に0をk個連結すると2のk乗倍になる。この式は' + equalities[index] + 'であり，任意の非負の入力に対して' +
    multiplier + '倍になる。特定の入力で偶然一致する式では，任意の入力について成立するとはいえない。');
});

const negative = define(3, '三つの負数表現で読む4ビット列', 4, '1の補数、2の補数、符号と絶対値の三つを同じ4ビット列で比較。順序の4候補を維持し、同値を避ける。', index => {
  const values = ['1101', '1001', '1011', '1110'];
  const value = values[index], unsigned = Number.parseInt(value, 2);
  const numbers = [unsigned - 15, unsigned - 16, 8 - unsigned];
  const order = ['a', 'b', 'c'].sort((x, y) => numbers[x.charCodeAt(0) - 97] - numbers[y.charCodeAt(0) - 97]);
  const lines = source[3].material.replace('1101', value).split('／');
  return textBody([p(source[3].prompt), ...lines.map(p)], source[3].choices, source[3].choices.indexOf(order.join('，')),
    'aは全ビットを反転した絶対値に負号を付けて' + numbers[0] + '，bはさらに1を足した絶対値に負号を付けて' +
    numbers[1] + '，cは下位3ビットを絶対値として' + numbers[2] + '。小さい順は' + order.join('，') + 'になる。');
});

const cubic = define(5, '連立一次方程式の元数、元の秒数と演算速度比', 4, '元数比10の3乗と旧・新の速度比を別に扱う。整数秒・10倍刻みの元の選択肢系列を維持。', index => {
  const [small, original, speed, large] = ([[100, 2, 4, 1000], [50, 3, 5, 500], [200, 4, 5, 2000], [20, 7, 2, 200]] as const)[index];
  const group = (n: number) => n.toLocaleString('en-US');
  const seconds = original * (large / small) ** 3 / speed;
  const prompt = source[5].prompt.replace('100元', small + '元').replace('2秒', original + '秒').replace('4倍', speed + '倍')
    .replace('1,000元', group(large) + '元');
  return textBody(prompt, [seconds / 100, seconds / 10, seconds, seconds * 10].map(group), 2,
    '元数を' + small + 'から' + group(large) + 'にすると，同じ演算速度での計算時間は10³倍である。演算速度は' +
    speed + '倍なので，' + original + '×1,000÷' + speed + '＝' + group(seconds) + '秒となる。');
});

function simpleFraction(n: number, d: number) {
  const original = d;
  let divisor = n;
  while (d) [divisor, d] = [d, divisor % d];
  return [n / divisor, original / divisor];
}
const balls = define(6, '白玉・赤玉の個数と問う色', 4, '非復元で2回同色。反対色・復元抽出の混同を同じ表記の分数で区別する。', index => {
  const [white, red, target] = ([[4, 5, '赤'], [3, 7, '白'], [5, 7, '赤'], [6, 4, '白']] as const)[index];
  const count = target === '赤' ? red : white, other = white + red - count, total = count + other;
  const candidates = [[other * (other - 1), total * (total - 1)], [other ** 2, total ** 2],
    [count ** 2, total ** 2], [count * (count - 1), total * (total - 1)]].map(([n, d]) => simpleFraction(n, d));
  return body(source[6].prompt.replace('白玉4個，赤玉5個', '白玉' + white + '個，赤玉' + red + '個').replace('2個とも赤', '2個とも' + target),
    candidates.map(([n, d]) => [latex('\\frac{' + n + '}{' + d + '}', n + '/' + d)]), 3,
    '最初に' + target + 'を引く確率は' + count + '/' + total + '。戻さないので2回目は' +
    (count - 1) + '/' + (total - 1) + 'となり，積を約分すると' + candidates[3].join('/') + 'となる。');
});

const inclusions = [
  ['', source[8].choices, 2, 'A∩Bの要素はAの要素なので，AとBの補集合との和集合にも含まれる。'],
  ['A ⊆ B とする。', ['B ⊆ A', '(A ∩ B) ⊆ A̅', '(A ∪ B) ⊆ A', 'A ⊆ (A ∩ B)'], 3,
    'Aの要素は仮定によりBにも含まれるため，Aの要素はすべてA∩Bの要素である。'],
  ['A ∩ B が空集合であるとする。', ['A ⊆ B̅', 'B ⊆ A', '(A ∪ B) ⊆ B', 'A ⊆ (A ∩ B)'], 0,
    '共通の要素がないので，Aの各要素はBには属さず，Bの補集合に属する。'],
  ['A ∪ B が全体集合であるとする。', ['A ⊆ B', 'B̅ ⊆ A', 'A ⊆ B̅', 'B ⊆ A'], 1,
    'Bに含まれない全体集合の要素は，和集合が全体集合になるためにはAに含まれていなければならない。'],
] as const;
const sets = define(8, '二集合について仮定する条件', 4, '積・和・補集合と包含の恒真性を保つ。無条件、部分集合、共通部分なし、全域被覆の反例を同じ記法で比較する。', index => {
  const [premise, choices, correct, explanation] = inclusions[index];
  return textBody(source[8].prompt.replace('について，', 'について，' + (premise ? premise + ' ' : '')), choices, correct, explanation);
});

const words = ['偽', '真'];
const rowsOf = (headers: string[], choices: readonly string[]) =>
  choices.map(choice => [table('解答の組合せ', headers, [choice.split('；')])]);

const implication = define(9, '既知の命題の真理値と残り二命題の否定', 4, '二つの論理和とPの指定からQ、Rを決定。二列×四候補の同じ真偽配列。', index => {
  const [first, q, r] = ([[true, true, true], [true, false, false], [false, false, true], [false, true, false]] as const)[index];
  let prompt = source[9].prompt;
  if (index) prompt = prompt.replace('P の真理値は真', 'P の真理値は' + words[Number(first)])
    .replace('(not P) or Q', (first ? '(not P)' : 'P') + ' or ' + (q ? 'Q' : '(not Q)'))
    .replace('(not Q) or R', (q ? '(not Q)' : 'Q') + ' or ' + (r ? 'R' : '(not R)'));
  return body(prompt, rowsOf(['Q', 'R'], source[9].choices), Number(q) * 2 + Number(r),
    '1番目の論理和でPの項が偽なので，Qは' + words[Number(q)] + 'となる。2番目の論理和ではこのQに関わる項が偽になり，Rは' +
    words[Number(r)] + 'と決まる。');
});

const signals = ['t1', 't2', 't3', 't4'];
const states = source[10].choices;
const transitionGrid = [['', 'S3', '', ''], ['S3', '', 'S2', ''], ['', '', 'S4', 'S1'], ['', 'S1', '', 'S2']];
const transitions = define(10, '初期状態と8個の入力信号', 4, '空欄で状態を維持する四状態×四信号の表。入力順を変えて表を逐次読む。', index => {
  const paths = [
    ['S1', [0, 1, 2, 3, 0, 1, 2, 3]], ['S2', [2, 1, 0, 3, 2, 0, 2, 2]],
    ['S4', [3, 3, 1, 3, 0, 0, 3, 0]], ['S3', [3, 0, 2, 0, 3, 2, 0, 0]],
  ] as const;
  const [start, sequence] = paths[index], trace: string[] = [start];
  for (const signal of sequence) trace.push(transitionGrid[signal][states.indexOf(trace.at(-1)!)] || trace.at(-1)!);
  const end = trace.at(-1)!;
  const prompt = source[10].prompt.replace('状態が S1', '状態が ' + start)
    .replace('t1，t2，t3，t4，t1，t2，t3，t4', sequence.map(step => signals[step]).join('，'));
  return textBody([p(prompt), table('状態遷移表', ['信号／状態', ...states], transitionGrid.map((row, i) => [signals[i], ...row]))],
    states, states.indexOf(end), '初期状態から順に表を引くと，' + trace.join(' → ') + ' となる。空欄では直前の状態を維持する。');
});

type Traversal = 'leftFirstIn' | 'rightFirstIn' | 'pre' | 'post';
function traverse(node: Tree, order: Traversal): string {
  if (typeof node === 'string') return node;
  const [mark, left, right] = node;
  const L = traverse(left, order), R = traverse(right, order);
  if (order === 'leftFirstIn') return L + mark + R;
  if (order === 'rightFirstIn') return traverse(right, 'leftFirstIn') + mark + traverse(left, 'leftFirstIn');
  return order === 'pre' ? mark + L + R : L + R + mark;
}
const recursiveTree = define(12, '2分木の接続と左右の子の配置', 4, '根・左右の子に別の木を置き、左、右、根の再帰を維持。前順・中順・反対優先の候補を区別。', index => {
  const tree = trees[index];
  const choices = ['rightFirstIn', 'pre', 'leftFirstIn', 'post'].map(mode => traverse(tree, mode as Traversal));
  return textBody([p(source[12].prompt), code(['Proc（ノード n） {', '  n に左の子 l があれば Proc(l) を呼び出す',
    '  n に右の子 r があれば Proc(r) を呼び出す', '  n に書かれた記号を出力する', '}'].join('\n')), draw('tree', index, '記号がある2分木')],
    choices, 3, '各ノードで左部分木，右部分木，自身の順に出力する。根の左側で「' + traverse(tree[1], 'post') + '」，右側で「' +
    traverse(tree[2], 'post') + '」，最後に根の「' + tree[0] + '」が出力される。');
});

const flow = define(14, '昇順・降順と探索区間の初期添字', 4, '中央値切捨て、三分岐、探索範囲が空になる条件とa/bを維持。整列方向と添字の下限を本文と図に反映。', index => {
  const [descending, zero] = flowCases[index];
  const prompt = source[14].prompt.replace('昇順', descending ? '降順' : '昇順') +
    (zero ? ' 配列の添字は0から n−1 までとする。' : '');
  return body([p(prompt), draw('flow', index, '2分探索法の流れ図')], rowsOf(['a', 'b'], source[14].choices),
    descending ? 1 : 2, 'A(k)＜xなら' + (descending ? '小さい添字の側' : '大きい添字の側') +
    'に候補があり，A(k)＞xでは反対側にある。候補にkを含めず，lo または hi を更新してから lo≦hi のときだけ繰り返す。');
});

const gcd = define(15, '再帰関数Fのxとy', 4, '剰余の再帰とy＝0の終了条件、元の答の桁を維持。長い除算を必要としない整数の組。', index => {
  const [x, y] = ([[231, 15], [42, 16], [155, 25], [161, 21]] as const)[index];
  let a: number = x, b: number = y;
  const trace: string[] = ['F(' + a + ', ' + b + ')'];
  while (b) {
    [a, b] = [b, a % b];
    trace.push('F(' + a + ', ' + b + ')');
  }
  return textBody([p(source[15].prompt.replace('231,15', x + ', ' + y)),
    latex('F(x,y)=\\begin{cases}x&(y=0)\\\\F(y,x\\operatorname{mod}y)&(y>0)\\end{cases}', source[15].material)],
  source[15].choices, source[15].choices.indexOf(String(a)), trace.join(' → ') + '。y＝0となった関数呼出しは，その時点の第1引数' + a + 'を返す。');
});

const logic = define(17, '同じ・異なる・常に0・常に1の出力条件', 4, '五記号の原紙凡例、二入力、二つのNOT、三つの同種ゲートの4図とその順を保つ。要求される真理値表を変える。', index => {
  const conditions = ['入力 X と Y の値が同じときにだけ，出力 Z に1を出力する', '入力 X と Y の値が異なるときにだけ，出力 Z に1を出力する',
    '入力 X と Y の値に関係なく，出力 Z に0を出力する', '入力 X と Y の値に関係なく，出力 Z に1を出力する'];
  const correct = [2, 3, 0, 1][index];
  const explanations = [
    'NAND二段で入力が両方1又は両方0の場合だけ出力1となる。最終段のNANDには，その場合に限って一つの0が入る。',
    'NOR二段で入力が異なる場合は，中間の二つとも0なので最終出力は1になる。入力が同じ場合の最終出力は0になる。',
    '上のANDが1になるのは入力が両方1の場合，下のANDが1になるのは両方0の場合である。両方が同時に1になることはなく，最終段もANDなので常に0。',
    '上のORが0になるのは入力が両方0の場合，下のORが0になるのは両方1の場合である。両方が同時に0になることはなく，最終段もORなので常に1。',
  ];
  return body([p(conditions[index] + '回路はどれか。ここで，次の記号は各回路を表す。'), draw('legend', 0, '論理回路の凡例')],
    source[17].choices.map((_, i) => [draw('gate', i, '回路' + 'アイウエ'[i])]), correct, explanations[index]);
});

const addressing = define(18, '命令から実効アドレスを求める参照先', 4, '命令のフィールド、レジスタ又はプログラムカウンタ、主記憶の接続を可変化。四方式を元の候補の順に判別する。', index => {
  const { effective, explanation } = addressCases[index];
  return textBody([p(source[18].prompt), draw('address', index, '命令と主記憶のアドレス')],
    source[18].choices, index, explanation + '。図の処理対象データの番地は' + effective + 'である。');
});

const cpu = define(19, 'クロック周波数（GHz）と平均CPI', 4, 'GHzと小数1〜2桁のクロック数を使い、秒当たりを万命令で選ぶ。元の並びを保持。', index => {
  const [frequency, cpi] = ([[1, 0.8], [2, 1.25], [0.6, 0.4], [2.4, 1.2]] as const)[index];
  const result = Math.round(frequency * 100_000 / cpi);
  const choices = [result / 1000, result / 500, Math.round(frequency * 100_000 * cpi), result].sort((a, b) => a - b);
  const prompt = source[19].prompt.replace('1GHz', frequency + 'GHz').replace('0.8クロック', cpi + 'クロック');
  return textBody(prompt, choices.map(choice => choice.toLocaleString('en-US')), choices.indexOf(result),
    '1 GHzは10億クロック/秒。' + frequency + '×10億クロックを1命令当たり' + cpi +
    'クロックで割り，10,000命令を1万命令として換算すると' + result.toLocaleString('en-US') + '万命令/秒となる。');
});

const cache = define(21, '両システムのキャッシュおよび主記憶レイテンシ', 4, '2行×2列とナノ秒、等しい実効アクセス時間を保つ。0〜1の固定4候補で逆算。', index => {
  const [cA, cB, mA, mB] = ([[15, 10, 50, 70], [18, 10, 50, 52], [17, 10, 50, 53], [15, 10, 50, 55]] as const)[index];
  const correct = [3, 0, 1, 2][index];
  return textBody([p(source[21].prompt), table('アクセス時間（単位 ナノ秒）', ['', 'システム A', 'システム B'],
    [['キャッシュメモリ', String(cA), String(cB)], ['主記憶', String(mA), String(mB)]])], source[21].choices, correct,
  'ヒット率をhとする。Aの実効時間は' + cA + 'h＋' + mA + '(1−h)，Bの実効時間は' + cB + 'h＋' + mB +
  '(1−h)である。' + (cA - cB) + 'h＝' + (mB - mA) + '(1−h)を解くと，h＝' + source[21].choices[correct] + 'となる。');
});

export const calculations2007AutumnAm0126 = [
  hexadecimal, multiples, negative, cubic, balls, sets, implication, transitions, recursiveTree, flow, gcd, logic, addressing, cpu, cache,
];
