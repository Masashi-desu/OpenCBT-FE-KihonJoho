import { code, p } from './definition';
import { draw, logicExpressions } from './legacy-2009-spring-am-01-26-figures';
import { body, define, latex, source, textBody } from './legacy-2009-spring-am-01-26-shared';

const shift = define(1, '左シフトのビット数', 4, 'あふれなし、正のxと左シフト後の加算を保持する。', index => {
  const bits = index + 2;
  const shifted = 2 ** bits;
  return textBody(source[1].prompt.replace('2ビット左', bits + 'ビット左'),
    [2 ** (bits - 1) + 1, shifted, shifted + 1, shifted + 2], 2,
    '左へ1ビット動かすごとに値は2倍になる。' + bits + 'ビットの左シフトで' + shifted +
    'xになり，xを加えると' + (shifted + 1) + 'xになる。');
});

const hashing = define(2, 'ハッシュに変換するキー値', 4,
  '11進数から10進数、下4けたの取り出し、0.5倍の順序と4けたのゼロ埋めを保持する。原問以外は基数・切出し位置・実行順序を取り違えた値を使う。', index => {
    const key = ['55550', '43410', '32457', '61173'][index];
    const decimal = [...key].reduce((value, digit) => value * 11 + Number(digit), 0);
    const tail = decimal % 10_000;
    const address = Math.floor(tail / 2);
    const formatted = (value: number) => String(value).padStart(4, '0');
    const choices = index === 0 ? source[2].choices : [
      address,
      Math.floor(Number(key.slice(-4)) / 2),
      Math.floor(Number(String(decimal).slice(0, 4)) / 2),
      Math.floor(parseInt(key, 9) % 10_000 / 2),
    ].sort((a, b) => a - b).map(formatted);
    return textBody(source[2].prompt.replace('55550', key), choices, choices.indexOf(formatted(address)),
      '各けたを11のべき乗で重み付けすると10進数で' + decimal + 'である。下4けたは' + formatted(tail) +
      'なので，0.5倍して小数点以下を切り捨てたアドレスは' + formatted(address) + 'である。');
  });

const search = define(7, '配列の整列順と要素数', 4, '整列済み配列と2分探索の比較回数を保持する。昇順・降順で範囲を半減する同じ計算を使う。', index => {
  const size = [null, 1024, 4096, 65536][index];
  const order = index === 1 || index === 3 ? '降順' : '昇順';
  const prompt = size === null ? source[7].prompt :
    order + 'に整列されたn個（n＝' + size.toLocaleString('en-US') + '）のデータが配列に格納されている。探索したい値を2分探索法で探索するときの，およその比較回数を求める式はどれか。';
  const expressions = ['\\log_2 n', '(\\log_2 n+1)/2', 'n', 'n^2'];
  return body(prompt, expressions.map((value, i) => [latex(value, source[7].choices[i])]), 0,
    '2分探索では，整列順に応じて比較結果の片側を捨てる。k回で候補数がおよそn÷2ᵏとなるので，1件に近づく比較回数はlog₂ n程度である。' +
    (size === null ? '' : 'nが' + size + 'の場合は約' + Math.log2(size) + '回である。'));
}, true);

const recursion = define(8, '再帰関数の呼出し引数', 4, '自然数、n≦1で1を返す停止条件とn−1への再帰を維持する。引数だけを変え、原問の誤りに対応する候補を用いる。', index => {
  const n = [5, 4, 6, 7][index];
  function evaluate(value: number): number { return value <= 1 ? 1 : value + evaluate(value - 1); }
  const value = evaluate(n);
  return textBody([p(source[8].prompt.replace('f(5)', 'f(' + n + ')')), code(source[8].material, 'text')],
    [n + 1, 2 * n - 1, value, n ** 2], 2,
    'f(1)＝1で再帰が止まる。それより大きな引数ではその値を一つずつ足すので，f(' + n + ')は' +
    Array.from({ length: n }, (_, i) => n - i).join('＋') + '＝' + value + 'である。');
});

const mips = define(9, '平均命令実行時間（ナノ秒）', 4, '10億ナノ秒と100万命令の単位換算を維持し、逆数の答えが整数となる値を使う。', index => {
  const nanoseconds = [20, 25, 50, 100][index];
  const value = 1000 / nanoseconds;
  const choices = [value / 10, value / 5, nanoseconds, value].sort((a, b) => a - b);
  return textBody(source[9].prompt.replace('20ナノ秒', nanoseconds + 'ナノ秒'), choices, choices.indexOf(value),
    '1秒は10億ナノ秒である。1秒に実行できる命令数は10億÷' + nanoseconds + 'で，その数を100万で割った' +
    value + 'がMIPSの値になる。');
});

const network = define(16, '既存回線の稼働率と目標稼働率', 4,
  '直接回線と二つの直列回線によるバックアップを保持する。基準・生成には新設回線も独立に稼働することを明記する。', index => {
    const [direct, side, target] = [[90, 80, 95], [80, 80, 88], [80, 75, 89], [75, 80, 90]][index];
    const needed = (target - direct) * 100 / ((100 - direct) * side);
    const format = (value: number) => (value / 100).toFixed(2).replace(/0$/, '');
    const choices = index === 0 ? source[16].choices : [
      (target - direct) / direct, (target - direct) / (100 - direct), needed, target / 100,
    ].sort((a, b) => a - b).map(value => value.toFixed(3));
    const prompt = '東京〜大阪及び東京〜名古屋がそれぞれ独立した通信回線で接続されている。東京〜大阪の稼働率は' +
      format(direct) + '，東京〜名古屋の稼働率は' + format(side) + 'である。東京〜大阪の稼働率を' +
      format(target) + '以上に改善するために，大阪〜名古屋にバックアップ回線を新設することを計画している。新設回線の稼働は既存の回線から独立しているとする。新設される回線の稼働率は最低限幾ら必要か。';
    return textBody(prompt, choices, choices.indexOf(needed.toFixed(3)),
      '直接回線が稼働すれば通信でき，停止したときは東京〜名古屋と大阪〜名古屋がともに稼働する必要がある。新設回線をrとすると全体は' +
      format(direct) + '＋' + format(100 - direct) + '×' + format(side) + '×rであり，これを' +
      format(target) + '以上にする最小のrは' + needed.toFixed(3) + 'である。');
  });

const turnaround = define(18, 'CPU・入出力・その他の時間', 4,
  'CPU時間とその他の時間を固定し、全体を半分にする入出力時間の割合を選ぶ。元の分数と昇順を保持する。', index => {
    const [cpu, io, other] = [[300, 600, 100], [150, 400, 50], [100, 600, 100], [300, 800, 100]][index];
    const total = cpu + io + other;
    const allowed = total / 2 - cpu - other;
    const denominators = [6, 4, 3, 2];
    const answer = denominators.indexOf(io / allowed);
    const prompt = 'プログラムのCPU実行時間が' + cpu + 'ミリ秒，入出力時間が' + io + 'ミリ秒，その他のオーバヘッドが' +
      other + 'ミリ秒の場合，ターンアラウンドタイムを半分に改善するには，入出力時間を現在の何倍にすればよいか。CPU実行時間とその他のオーバヘッドは変わらないものとする。';
    return body(prompt, denominators.map(value => [latex('\\frac{1}{' + value + '}', '1／' + value)]), answer,
      '全体は' + total + 'ミリ秒で，目標は' + total / 2 + 'ミリ秒である。CPU実行時間とその他のオーバヘッドの合計' +
      (cpu + other) + 'ミリ秒を差し引くと，入出力に使えるのは' + allowed + 'ミリ秒なので，現在の入出力時間の1／' +
      denominators[answer] + 'である。');
  });

const paths = define(21, 'カレントディレクトリと相対指定', 4,
  '原問の五つのパス規則と候補順を保持する。相対指定の先頭、親への移動回数と現在位置を変える。', index => {
    const [current, relative] = [
      ['¥a¥a¥b¥c', '.¥..¥..¥a¥b¥file'], ['¥a¥a¥b¥c', '.¥..¥..¥..¥b¥file'],
      ['¥a¥a¥b¥c', '..¥file'], ['¥a¥a¥b', 'a¥b¥file'],
    ][index];
    const pieces = current.split('¥').filter(Boolean);
    for (const segment of relative.split('¥')) {
      if (segment === '..') pieces.pop();
      else if (segment !== '.') pieces.push(segment);
    }
    const answer = '¥' + pieces.join('¥');
    const prompt = source[21].prompt.replace('¥a¥a¥b¥c', current).replace('.¥..¥..¥a¥b¥file', relative);
    return textBody([p(prompt), ...source[21].material.split('\n').map(p)], source[21].choices, source[21].choices.indexOf(answer),
      '現在位置を' + current + 'とする。「.」は移動せず，「..」ごとに一つ上がる。続くディレクトリ名を順に追加してファイル名をつなぐと' +
      answer + 'である。');
  });

const logic = define(3, '内側と外側の論理演算', 4,
  '外側の否定と二つの項を保持する。内側の演算・入力の極性を変え、論理演算の分配と各リテラルの反転を問う。', index => {
    const { outer, negatedOuter } = logicExpressions(index);
    return body([p('次の論理式と等しいものはどれか。ここで，・は論理積，＋は論理和，上線は否定を表す。'),
      draw('logicExpression', index * 5, 'もとの論理式')],
      [1, 2, 3, 4].map(choice => [draw('logicExpression', index * 5 + choice, '候補の論理式')]), 0,
      '外側の否定を二つの項に配ると，項を結ぶ' + outer + 'が' + negatedOuter +
      'になる。各項にも同じ法則を使い，論理積と論理和を入れ替えて入力の極性を反転すると，この論理式が得られる。');
  });

export const calculations2009SpringAm0126 = [shift, hashing, logic, search, recursion, mips, network, turnaround, paths];
