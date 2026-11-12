import { p, table } from './definition';
import { circuitOutputs, conversionCases, draw, gridCases, heapCases, parityCases } from './legacy-2008-autumn-am-01-26-figures';
import { body, define, latex, source, textBody } from './legacy-2008-autumn-am-01-26-shared';

const conversion = define(1, '変換先の基数・けた数・格納順', 4,
  '商と余りを入れる位置・処理順を選ぶ元の流れ図。基数、配列の格納順とループ範囲を変更する。', index => {
    const { radix, bound, width, reverse, label } = conversionCases[index];
    const prompt = index === 0 ? source[1].prompt :
      '次の流れ図は，10進整数 j（0＜j＜' + bound + '）を' + width + 'けたの' + radix + '進数に変換する処理を表している。' +
      radix + '進数は' + (reverse ? '上位' : '下位') + 'けたから順に，配列の要素 ' + label + '(1) から ' + label + '(' + width +
      ') に格納される。流れ図の a 及び b に入る処理はどれか。ここで，j div ' + radix + ' は j を' + radix +
      'で割った商の整数部分を，j mod ' + radix + ' は j を' + radix + 'で割った余りを表す。';
    const candidates = source[1].choices.map(choice =>
      choice.replaceAll(' 2', ' ' + radix).replaceAll('NISHIN', label).split('；'));
    return body([p(prompt), draw('conversion', index, '進数変換の流れ図')],
      candidates.map(cells => [table('空欄に入る処理', ['a', 'b'], [cells])]), 3,
      '各回の余り j mod ' + radix + ' が現在の最下位けたになるので，j を上書きする前に ' + label +
      '(k) に格納する。次いで商 j div ' + radix + ' を j に戻し，次のけたを求める。' +
      (reverse ? 'k は配列末尾から逆順に進むため，完成した配列の先頭側が上位けたとなる。'
        : 'k は配列先頭から順に進むため，最初に得た最下位けたが添字1になる。'));
  }, true);

const complement = define(3, '2の補数の8ビット負数', 4,
  '8ビットのまま，原解答群と同じ連続4個の正の候補を用い，入力によって正答の位置を変える。', index => {
    const [signed, offset] = ([[-82, 2], [-61, 0], [-70, 1], [-109, 3]] as const)[index];
    const bits = (number: number) => number.toString(2).padStart(8, '0');
    const input = bits(256 + signed);
    const options = Array.from({ length: 4 }, (_, i) => bits(-signed - offset + i));
    return textBody(source[3].prompt.replace('10101110', input), options, offset,
      '8ビットの最上位ビットが1なので負数である。' + input + ' の全ビットを反転して1を加えると ' +
      bits(-signed) + ' となる。よって絶対値は ' + bits(-signed) + ' である。');
  });

const floorFraction = define(5, '整数部分の符号と小数部分の式', 4,
  '床関数の例・整数bと0＜c＜1を維持し，aの小数部分の正負と係数を変更する。', index => {
    const cases = [
      { equation: '−(b＋c)', floor: '−b−1', term: '1−c', options: ['c', '−c', '1−c', 'c−1'] },
      { equation: 'b＋c', floor: 'b', term: 'c', options: ['c', '−c', '1−c', 'c−1'] },
      { equation: '−b−c/2', floor: '−b−1', term: '1−c/2', options: ['c/2', '−c/2', '1−c/2', 'c/2−1'] },
      { equation: 'b＋(c＋1)/2', floor: 'b', term: '(c＋1)/2', options: ['(1−c)/2', '−(c＋1)/2', '(c−1)/2', '(c＋1)/2'] },
    ];
    const { equation, floor, term, options } = cases[index];
    return textBody(source[5].prompt.replace('−(b＋c)', equation), options, options.indexOf(term),
      '0＜c＜1 の範囲で，a 以下の最大の整数は ' + floor + ' になる。a＝' + equation + ' から ' + floor +
      ' を引くと，整数 b の項が消え，a − int(a)＝' + term + ' となる。');
  });

const words = define(6, '利用できる数字と文字列の長さ', 4,
  '空白は末尾だけ・数字の繰返し可・先頭は数字の条件を保ち，数字の範囲又は列長を変更する。', index => {
    const [base, length] = ([[10, 3], [8, 3], [5, 4], [6, 4]] as const)[index];
    const terms = Array.from({ length }, (_, i) => base ** (i + 1));
    const count = terms.reduce((sum, value) => sum + value, 0);
    return textBody(source[6].prompt.replace('0～9', '0～' + (base - 1)).replace('長さ3', '長さ' + length),
      [count, count + 1, base * (base + 1) ** (length - 1), (base + 1) ** length], 0,
      '数字が並ぶのは最初の1文字から連続した部分だけであり，残りは全て空白となる。数字部分の長さが1～' + length +
      'のときの通り数を合計すると ' + terms.join('＋') + '＝' + count + ' 通りである。');
  }, true);

function interleavings(horizontal: number, vertical: number) {
  let total = 1;
  for (let i = 1; i <= vertical; i++) total = total * (horizontal + i) / i;
  return total;
}
const route = define(7, '格子の縦横と経由点R', 4,
  'Pは左下，Qは右上。横・縦の区間数と経由点Rの位置を変更し，両区間の最短経路を掛ける。', index => {
    const { width, height, column, row } = gridCases[index];
    const first = interleavings(column, row), second = interleavings(width - column, height - row);
    const count = first * second;
    const distractors = index === 0 ? [16, 24, 32] : [
      first + second, first * (width - column + 1), first * interleavings(width - column, height - row + 1),
    ];
    return textBody([p(source[7].prompt), draw('grid', index, 'P・R・Qを含む格子')],
      [...distractors, count].sort((a, b) => a - b), distractors.filter(option => option < count).length,
      '最短経路では右又は上にだけ進む。PからRまでは右' + column + '区間，上' + row + '区間の順序を選ぶので' +
      first + '通り。RからQまでは右' + (width - column) + '区間，上' + (height - row) + '区間の順序を選ぶので' +
      second + '通り。二つを組み合わせると ' + first + '×' + second + '＝' + count + ' 通りである。');
  });

function divisor(a: number, b: number): number {
  return b === 0 ? a : divisor(b, a % b);
}
function fraction(numerator: number, denominator: number) {
  const gcd = divisor(numerator, denominator);
  return [numerator / gcd, denominator / gcd] as const;
}
const lottery = define(8, 'くじの総数と当たり本数', 4,
  '同時に2本を引く非復元のまま総数と当たり数を変え，順序なし・復元・特定の2本等の誤りと区別する。', index => {
    const [total, wins] = ([[5, 2], [6, 3], [7, 2], [8, 3]] as const)[index];
    const pairs = [[1, total ** 2], [1, total * (total - 1)],
      [wins * (wins - 1), total * (total - 1)], [wins ** 2, total ** 2]];
    const choices = pairs.map(([n, d]) => fraction(n, d));
    const [n, d] = choices[2];
    const prompt = source[8].prompt.replace('5本のくじ', total + '本のくじ').replace('うち2本', 'うち' + wins + '本');
    return body(prompt, choices.map(([a, b]) => [latex('\\frac{' + a + '}{' + b + '}', a + '/' + b)]), 2,
      '同時に引く2本を一時的に順序付けると，1本目が当たる確率は ' + wins + '/' + total +
      '，1本目が当たった後に残りから2本目も当たる確率は ' + (wins - 1) + '/' + (total - 1) + ' である。積は ' + n + '/' + d + ' となる。');
  }, true);

const equality = define(9, 'eqの比較対象と確認する戻り値', 4,
  '元の二段のeqと必要十分条件の問いを維持し，内側の比較対及び1か0かを変更する。', index => {
    const [x, pivot, z, expected] = ([
      ['A', 'B', 'C', 1], ['A', 'C', 'B', 0], ['B', 'A', 'C', 1], ['B', 'C', 'A', 0],
    ] as const)[index];
    const first = x + '＝' + pivot, second = pivot + '＝' + z;
    const notFirst = x + '≠' + pivot, notSecond = pivot + '≠' + z;
    const same = '(' + first + ' かつ ' + second + ') 又は (' + notFirst + ' かつ ' + notSecond + ')';
    const different = '(' + first + ' かつ ' + notSecond + ') 又は (' + notFirst + ' かつ ' + second + ')';
    const choices = [
      expected ? same : different,
      '(' + first + ' かつ ' + second + ') 又は (' + notFirst + ' 又は ' + notSecond + ')',
      '(' + first + ' かつ ' + second + ') 又は ' + x + '＝' + z,
      '(' + first + ' 又は ' + second + ') 又は ' + x + '＝' + z,
    ];
    const prompt = source[9].prompt.replace('eq(eq(A, B), eq(B, C))', 'eq(eq(' + x + ', ' + pivot + '), eq(' + pivot + ', ' + z + '))')
      .replace('1が返ってくる', expected + 'が返ってくる');
    return textBody(prompt, choices, 0, expected
      ? '外側の eq は内側の2つの戻り値が一致すると1になる。従って，2つの比較が両方とも真か，両方とも偽であることが必要十分である。'
      : '外側の eq は内側の2つの戻り値が異なると0になる。従って，どちらか一方の比較だけが真であることが必要十分である。');
  }, true);

const truthTable = define(10, '三つの入力の真理値表', 4,
  '入力xyzの8行と括弧付き論理式の四候補を保ち，4種類の演算結果を切り替える。', index => {
    const resultIndex = [2, 0, 1, 3][index];
    const results = (x: number, y: number, z: number) => [(x & y) | z, (x | y) & z, x & (y | z), x | (y & z)];
    const rows = Array.from({ length: 8 }, (_, i) => {
      const x = i >> 2, y = (i >> 1) & 1, z = i & 1;
      return [x, y, z, results(x, y, z)[resultIndex]].map(String);
    });
    const explanation = [
      'xとyがともに1であるか，zが1のときにだけ結果が1になる。',
      'xとyの少なくとも一方が1で，かつzが1のときにだけ結果が1になる。',
      'xが1で，かつyとzの少なくとも一方が1のときにだけ結果が1になる。',
      'xが1であるか，yとzがともに1のときにだけ結果が1になる。',
    ][resultIndex];
    return textBody([p(source[10].prompt), table('真理値表', ['x', 'y', 'z', '演算結果'], rows)],
      source[10].choices, resultIndex, explanation + ' 括弧の内側から演算すると ' + source[10].choices[resultIndex] + ' に一致する。');
  });

const checkDigit = define(11, '数列・検査数字と空欄位置', 4,
  '重み3，2，1及び法7を維持し，数列の既知部分・空欄の位置を変更する。', index => {
    const cases = [
      { digits: [4, 2, 4], hole: 2, options: [0, 2, 4, 6] },
      { digits: [1, 5, 3], hole: 1, options: [0, 1, 3, 5] },
      { digits: [6, 3, 2], hole: 0, options: [0, 2, 4, 6] },
      { digits: [5, 1, 2], hole: 2, options: [2, 3, 4, 5] },
    ];
    const { digits, hole, options } = cases[index];
    const digit = digits.reduce((sum, value, i) => sum + value * (3 - i), 0) % 7;
    const printed = digits.map((value, i) => i === hole ? '□' : String(value)).concat(String(digit)).join(', ');
    const sum = digits.reduce((result, value, i) => i === hole ? result : result + value * (3 - i), 0);
    return textBody(source[11].prompt.replace('4, 2, □, 6', printed), options, options.indexOf(digits[hole]),
      '既知の項を重み付きで足すと ' + sum + ' である。□の重みは ' + (3 - hole) + '。□が ' + digits[hole] +
      ' のとき，合計 ' + (sum + digits[hole] * (3 - hole)) + ' を7で割った余りが ' + digit + ' になる。');
  });

const heap = define(12, 'ヒープの節の値と追加する要素', 4,
  '同じ位置A・末尾の位置＊・最小ヒープを保ち，節の値と挿入値を変え，交換が根・親・Aで止まる場合と不要な場合を出す。', index => {
    const { values, inserted } = heapCases[index];
    const data = [...values, inserted];
    let cursor = data.length - 1;
    const trail = ['＊'];
    while (cursor > 0) {
      const parent = Math.floor((cursor - 1) / 2);
      if (data[parent] <= data[cursor]) break;
      [data[cursor], data[parent]] = [data[parent], data[cursor]];
      trail.push(['根', '左の子', '', '', 'A'][parent]);
      cursor = parent;
    }
    const choices: number[] = [inserted, values[1], values[3], values[4]].sort((a, b) => a - b);
    return textBody([p(source[12].prompt.replace('要素7', '要素' + inserted)), draw('heap', index, '追加前の最小ヒープ')],
      choices, choices.indexOf(data[4]), '追加した ' + inserted + ' は，親より小さい場合だけ親と交換する。' +
      (trail.length === 1 ? '親より小さくないため，＊から移動しない。' : '追加値は ' + trail.join(' → ') + ' の順に移動する。') +
      ' Aの位置にある値は ' + data[4] + ' である。');
  });

const search = define(13, '整列された表の要素数', 4,
  '成功が保証された二分探索の最大キー比較回数。2の累乗付近を含む表の大きさを選ぶ。', index => {
    const length = [2000, 1023, 1024, 2048][index], count = Math.floor(Math.log2(length)) + 1;
    const options = [9, 10, 11, 12];
    return textBody(source[13].prompt.replace('2,000', length.toLocaleString('en-US')), options, options.indexOf(count),
      '中央値との比較で探索範囲の最大サイズは毎回ほぼ半分になる。' + (2 ** (count - 1)).toLocaleString('en-US') +
      '≦' + length.toLocaleString('en-US') + '＜' + (2 ** count).toLocaleString('en-US') +
      ' なので，候補が1個になった最後の比較を含めて最大' + count + '回である。');
  });

const recurrence = define(14, '階乗の再帰で取り除く因子と基底', 4,
  'aに入る再帰式の四択を維持し，階乗の添字のずれ又は一度に取り除く因子の数を変更する。', index => {
    const cases = [
      { argument: 'n', condition: 'n＞0', base: 'n＝0のとき，F(n)＝1',
        options: ['n＋F(n−1)', 'n−1＋F(n)', 'n×F(n−1)', '(n−1)×F(n)'], correct: 2, explanation: 'n!＝n×(n−1)! である。' },
      { argument: 'n＋1', condition: 'n＞0', base: 'n＝0のとき，F(n)＝1',
        options: ['(n＋1)×F(n−1)', 'n＋1＋F(n−1)', 'n×F(n−1)', 'n×F(n)'], correct: 0, explanation: '(n＋1)!＝(n＋1)×n! で，F(n−1)＝n! である。' },
      { argument: 'n', condition: 'n＞1', base: 'n＝0又は1のとき，F(n)＝1',
        options: ['n＋(n−1)×F(n−2)', 'n×(n−1)×F(n−2)', 'n×F(n−2)', '(n−1)×F(n)'], correct: 1, explanation: 'n!＝n×(n−1)×(n−2)! と，連続する二因子を取り出せる。' },
      { argument: 'n＋2', condition: 'n＞0', base: 'n＝0のとき，F(n)＝2',
        options: ['n＋2＋F(n−1)', 'n×F(n−1)', '(n＋1)×F(n−1)', '(n＋2)×F(n−1)'], correct: 3, explanation: '(n＋2)!＝(n＋2)×(n＋1)! で，F(n−1)＝(n＋1)! である。' },
    ];
    const { argument, condition, base, options, correct, explanation } = cases[index];
    const prompt = source[14].prompt.replace('n の階乗', (index === 0 ? 'n' : '(' + argument + ')') + ' の階乗');
    return textBody([p(prompt), p(condition + 'のとき，F(n)＝［a］'), p(base)], options, correct,
      explanation + ' 引数を小さくすれば基底に到達し，空欄 a は ' + options[correct] + ' となる。');
  });

const rewards = define(15, '改善提案ごとの金額と期間', 4,
  'Y/Nを二条件に当てはめる決定表と改善提案2件を保つ。提案値を変え，10万円・1週間の境界も含める。', index => {
    const cases = [
      [[20, 3, '3日'], [5, 14, '2週間']],
      [[8, 6, '6日'], [4, 2, '2日']],
      [[7, 5, '5日'], [10, 7, '1週間']],
      [[10, 8, '8日'], [25, 21, '3週間']],
    ] as const;
    const awards = [500, 1000, 1000, 3000];
    const proposals = cases[index];
    const eligible = proposals.map(([amount, days]) => awards[(amount < 10 ? 0 : 2) + (days < 7 ? 0 : 1)]);
    const sum = eligible[0] + eligible[1];
    const candidates = index === 3 ? [2000, 3500, 4000, 6000] : [1000, 1500, 2000, 3500];
    const yen = (value: number) => value.toLocaleString('en-US');
    const rules = table('賞金の決定表', ['条件と処置', '規則1', '規則2', '規則3', '規則4'], [
      ['改善額10万円未満', 'Y', 'Y', 'N', 'N'],
      ['期間短縮1週間未満', 'Y', 'N', 'Y', 'N'],
      ['賞金：500円', 'X', '―', '―', '―'],
      ['賞金：1,000円', '―', 'X', 'X', '―'],
      ['賞金：3,000円', '―', '―', '―', 'X'],
    ]);
    return textBody([p(source[15].prompt), rules, p('〔改善提案〕'), ...proposals.map(([amount, , duration], i) =>
      p('改善提案' + (i + 1) + '：改善額' + amount + '万円，期間短縮' + duration))],
      candidates.map(yen), candidates.indexOf(sum),
      proposals.map(([amount, days], i) => '提案' + (i + 1) + 'は改善額が10万円未満の条件に' +
        (amount < 10 ? '該当' : '非該当') + '，期間短縮が1週間未満の条件に' + (days < 7 ? '該当' : '非該当') +
        'なので' + yen(eligible[i]) + '円。').join(' ') + ' 合計は' + yen(sum) + '円である。');
  });

const parity = define(17, '入力ビット数と求めるパリティ', 4,
  '二組のXORを合流する回路図の四択。入力ビット数と出力1になる偶奇を変え，元の共通図記号・注記を保持する。', index => {
    const { bits, even } = parityCases[index];
    const condition = even ? '1の入力数が0個又は偶数個のとき出力が1に，奇数個のとき出力が0になる' :
      '1の入力数が奇数個のとき出力が1に，0個又は偶数個のとき出力が0になる';
    const prompt = bits + 'ビットの入力データに対し，' + condition +
      '回路はどれか。ここで，図中の論理素子の記号は次のとおりである。';
    return body([p(prompt), draw('gateLegend', 0, 'AND・OR・XOR・NOTの記号')],
      circuitOutputs.map((_, i) => [draw('parityCircuit', (bits === 4 ? 0 : circuitOutputs.length) + i, 'パリティ回路の候補')]),
      even ? 3 : 2, '各組のXORは，組内の1の数が奇数なら1になる。さらにその2出力をXORに入れると，' +
      bits + 'ビット全体の1の数が奇数の場合だけ1になる。' + (even ?
        '求める出力は0個又は偶数個で1なので，最後にNOTで反転する。' : '奇数個で1という条件を満たすため，最後のXORをそのまま出力する。'));
  });

const cache = define(19, 'キャッシュ時間・ヒット率・主記憶時間', 4,
  '原問はヒットとミスの時間内訳を指定しない。ヒット時／ミス時の加重平均と，キャッシュ参照を常に数える計算の双方で，最小候補が一意に一致する表を用いる。', index => {
    const cases = [
      [[10, 60, 70], [10, 70, 70], [20, 70, 50], [20, 80, 50]],
      [[12, 80, 60], [12, 75, 65], [12, 85, 90], [12, 70, 70]],
      [[10, 70, 60], [12, 80, 60], [16, 82, 60], [20, 85, 60]],
      [[18, 75, 65], [14, 75, 70], [12, 75, 55], [20, 75, 60]],
    ];
    const rows = cases[index];
    const totals = rows.map(([hit, rate, miss]) => (hit * rate + miss * (100 - rate)) / 100);
    const correct = totals.indexOf(Math.min(...totals));
    const conditions = ['', '各組合せのキャッシュメモリのアクセス時間は12ナノ秒である。',
      '各組合せの主記憶のアクセス時間は60ナノ秒である。', '各組合せのキャッシュメモリのヒット率は75%である。'];
    return body(conditions[index] + source[19].prompt, rows.map(row => [table('アクセス時間とヒット率',
      ['キャッシュメモリのアクセス時間（ナノ秒）', 'キャッシュメモリのヒット率（%）', '主記憶のアクセス時間（ナノ秒）'],
      [row.map(String)])]), correct,
      'ヒット時のキャッシュ時間とミス時の主記憶時間を，発生割合に応じて平均する。ア～エの順に ' +
      totals.join('，') + ' ナノ秒で，最短は ' + totals[correct] + ' ナノ秒。ミス時にもキャッシュ参照時間を別途加えるときも，最短の組合せは同じである。');
  });

const disk = define(21, '回転速度・シーク時間・容量と転送ブロック', 4,
  '平均回転待ちを半周，転送をブロックとトラックの容量比で求める構成を保つ。原問の誤答と同様に全周待ち又は半ブロック転送と取り違えた結果を候補にする。', index => {
    const [rpm, seek, capacity, block] = ([
      [5000, 20, 15000, 4000], [6000, 18, 10000, 3000], [4000, 16, 12000, 3200], [3000, 15, 16000, 4800],
    ] as const)[index];
    const rotation = 60000 / rpm, transfer = rotation * block / capacity;
    const values = [
      seek + rotation / 2 + transfer / 2, seek + rotation / 2 + transfer,
      seek + rotation + transfer / 2, seek + rotation + transfer,
    ];
    const show = (value: number) => value.toLocaleString('en-US');
    const prompt = source[21].prompt.replace('5,000回転/分', show(rpm) + '回転/分')
      .replace('20ミリ秒', seek + 'ミリ秒').replace('15,000バイト', show(capacity) + 'バイト').replace('4,000バイト', show(block) + 'バイト');
    return textBody(prompt, values.map(value => value.toFixed(1)), 1,
      '1周に ' + rotation + ' ミリ秒かかり，平均回転待ちは半周分の ' + rotation / 2 +
      ' ミリ秒になる。1ブロックの転送は1周の ' + show(block) + '/' + show(capacity) +
      ' なので ' + transfer + ' ミリ秒。平均シーク時間と合わせて ' + seek + '＋' + rotation / 2 + '＋' +
      transfer + '＝' + values[1].toFixed(1) + ' ミリ秒である。');
  }, true);

export const calculations2008AutumnAm0126 = [
  conversion, complement, floorFraction, words, route, lottery, equality, truthTable, checkDigit, heap,
  search, recurrence, rewards, parity, cache, disk,
];
