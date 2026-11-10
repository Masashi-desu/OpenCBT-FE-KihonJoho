import { code, p, table } from './definition';
import { adderCases, displayedTrees, flowCases, flowFixes, gateLabels, gateOutput, logicExpressions, logicText, memoryCases, memoryRows, parityCases,
  parityEven, schedule, special2011AmDiagram, taskCases, treeCases, treeNotation, type Gate, type Tree }
  from './legacy-2011-special-am-01-26-figures';
import { choiceBody, define, source } from './legacy-2011-special-am-01-26-shared';

const lines = (text: string) => text.split('\n').map(p);
const materialTable = (caption: string, columns: string[], rows: string[][]) =>
  ({ ...table(caption, columns, rows), captionPresentation: 'accessible' as const });
const ascending = (numbers: number[]) => numbers.sort((a, b) => a - b);

const expression = define(1, '変数に付く否定線', 4,
  '外側の否定線と二つの和の論理積，積和二つと和積二つを保持する。入力極性を同じ変数のすべての出現箇所にバインドする。', index => {
    const { a, an, bn, c } = logicExpressions(index);
    return {
      prompt: [p('次の論理式と等しいものはどれか。ここで，・は論理積，＋は論理和を表す。'),
        p('Xに付いた上線はXの否定を表す。'), special2011AmDiagram('logic', index * 5)],
      choices: [1, 2, 3, 4].map(option => [special2011AmDiagram('logic', index * 5 + option)]), correctIndex: 0,
      explanation: '外側の否定をド・モルガンの法則で二つの括弧へ分配する。左の和を否定すると' + logicText(a) +
        'と' + logicText(bn) + 'の積，右の和を否定すると' + logicText(an) + 'と' + logicText(c) +
        'の積になる。この二つの積の論理和が答えになる。',
    };
  });

const errorCases = [[102, 197, 505], [101, 197, 510], [103, 199, 504], [101, 196, 501]] as const;
const approximate = [1, 2, 5] as const;
const relativeError = define(2, 'X・Y・Zの真の値', errorCases.length,
  '近似値は整数，真の値は百分の一桁。絶対誤差と真値の比を交差積で比較し，原問の四候補を維持する。', index => {
    const entries = errorCases[index].map((value, i) => ({ key: 'XYZ'[i], value,
      approximate: approximate[i], error: Math.abs(value - 100 * approximate[i]) }));
    const ranked = [...entries].sort((a, b) => a.error * b.value - b.error * a.value);
    const answer = ranked.map(entry => entry.key).join('，');
    return choiceBody([p(source[2].prompt), materialTable('実数の真の値と近似値', ['実数', '真の値', '近似値'],
      entries.map(entry => [entry.key, (entry.value / 100).toFixed(2), String(entry.approximate)]))],
    source[2].choices, answer, '相対誤差は |近似値 − 真の値| ÷ |真の値|。各相対誤差は ' +
      entries.map(entry => entry.key + 'が' + entry.error + '÷' + entry.value).join('，') + 'なので，小さい順は' + answer + '。');
  });

const probabilities = [[50, 30, 10, 5, 5], [60, 25, 10, 3, 2], [25, 25, 25, 15, 10], [20, 20, 20, 20, 20]];
const encodings = ['0', '10', '110', '1110', '1111'];
const bits = define(3, '文字A〜Eの出現確率', probabilities.length,
  '5文字と原問の接頭語符号を固定し，整数の確率の合計を100％にする。等確率時の単純平均などを含む小数1桁の4候補を昇順で保つ。', index => {
    const frequencies = probabilities[index];
    const weighted = frequencies.reduce((total, frequency, i) => total + frequency * encodings[i].length, 0);
    return choiceBody([p(source[3].prompt), materialTable('ビット表記と出現確率',
      ['文字', 'ビット表記', '出現確率（％）'], frequencies.map((frequency, i) => ['ABCDE'[i], encodings[i], String(frequency)]))],
    source[3].choices, (weighted / 100).toFixed(1), '各文字の符号長を出現確率で重み付けする。100文字分では ' +
      frequencies.map((frequency, i) => frequency + '×' + encodings[i].length).join('＋') + '＝' + weighted +
      ' ビットなので，1文字当たりは ' + (weighted / 100).toFixed(1) + ' ビットになる。');
  });

const transitions = [
  ['abcde', 'abede', 'ebede', 'aeeee'], ['abcde', 'abede', 'eeede', 'abeee'],
  ['abcde', 'abede', 'eeede', 'ebeee'], ['abcde', 'abede', 'ebede', 'ebeee'],
] as const;
const stateChoices = [
  source[4].choices, ['+0010', '−.△', '12.2', '9.△'],
  ['+.', '−1', '12.2', '9.2'], source[4].choices,
] as const;
const states = define(4, '状態遷移と検査する文字列', transitions.length,
  '左端から検査，初期状態a，eになった時点で不合格，△は空白，五つの入力種別を維持する。', index => {
    const matrix = transitions[index];
    const trace = (input: string) => {
      const states = ['a'];
      for (const symbol of input) {
        const column = symbol === '△' ? 0 : /^\d$/.test(symbol) ? 1 : '+−'.includes(symbol) ? 2 : symbol === '.' ? 3 : 4;
        states.push(matrix['abcd'.indexOf(states.at(-1)!)][column]);
        if (states.at(-1) === 'e') break;
      }
      return states;
    };
    const choices = stateChoices[index], traces = choices.map(trace);
    const answer = choices[traces.findIndex(path => path.at(-1) === 'e')];
    return choiceBody([...lines(source[4].prompt), materialTable('文字による状態遷移',
      ['現在の状態', '空白', '数字', '符号', '小数点', 'その他'], matrix.map((row, i) => ['abcd'[i], ...row]))],
    choices, answer, '各文字列を左端からたどると，' +
      traces.map((path, i) => choices[i] + 'は' + path.join('→')).join('，') + '。検査中にeに達するのは' + answer + 'である。');
  });

const binaryTree = define(5, '挿入する七つの整数と順序', treeCases.length,
  '空木から各値を逐次比較して挿入する。四つの図に同じ七つの値を使い，左右の配置を表示する。', index => {
    const { shift, order } = treeCases[index];
    const values = order.map(value => value + shift);
    const root: Tree = { value: values[0] };
    for (const value of values.slice(1)) {
      let node = root;
      while (true) {
        const direction = value < node.value ? 'left' : 'right';
        const child = node[direction];
        if (child) node = child;
        else {
          node[direction] = { value };
          break;
        }
      }
    }
    const candidates = displayedTrees(index).map(treeNotation);
    return {
      prompt: [p(source[5].prompt.replace('8，12，5，3，10，7，6', values.join('，')))],
      choices: candidates.map((_, choice) => [special2011AmDiagram('tree', index * 4 + choice)]),
      correctIndex: candidates.indexOf(treeNotation(root)),
      explanation: values[0] + 'を根に置き，各値を根から比較して，小さければ左，大きければ右へ進む。' +
        'この順で挿入すると，根の左の子は' + root.left!.value + '，右の子は' + root.right!.value +
        '。残る値も同じ規則で空いた枝へ置くと図の位置になる。',
    };
  });

const divisorCases = [[775, 527], [693, 525], [935, 595], [644, 420]] as const;
const divisor = define(6, '再帰関数の引数xとy', divisorCases.length,
  '剰余と停止条件を変えず，3桁の整数を使う。0，最大公約数，最初の余り，第2引数を昇順で比較する。余りと正答が一致しないケースを用いる。', index => {
    const [x, y] = divisorCases[index];
    let a: number = x, b: number = y;
    const steps: string[] = [];
    while (b > 0) {
      const remainder = a % b;
      steps.push(a + ' mod ' + b + '＝' + remainder);
      [a, b] = [b, remainder];
    }
    return choiceBody([p(source[6].prompt.replace('775, 527', x + ', ' + y)), code(source[6].material, 'text')],
      [0, a, x % y, y], a, steps.join('，') + '。第2引数が0になった呼出しが第1引数の' + a + 'を返す。');
  });

const flow = define(7, '加算の上限と誤っている処理', flowCases.length,
  '1から上限までを加算する流れ図で，①初期化，②上限判定，③加算，④カウンタ更新の位置を維持する。', index => {
    const { max } = flowCases[index];
    const [initial, limit, sum, next] = flowFixes(index);
    const choices = [
      '①の処理を“' + initial + ' → x”にする。', '②の条件判定を“i：' + limit + '”にする。',
      '③の処理を“' + sum + '”にする。', '④の処理を“' + next + '”にする。',
    ];
    const defect = ['初期値が1なので合計に1が余分に入る', '判定上限が1小さいので最後の値が加わらない',
      '加算結果をiに代入しているのでxに合計が残らない', 'iが更新されないので判定を抜けられない'][index];
    return choiceBody([p(source[7].prompt.replace('100まで', max + 'まで')), special2011AmDiagram('flow', index)],
      choices, choices[index], defect + '。xを0に初期化し，iが' + max +
      '以下の間はxにiを足し，iだけを1ずつ進めれば，xは' + max * (max + 1) / 2 + 'になる。');
  });

const load = define(10, '命令のレジスタ番号・番地と主記憶の内容', memoryCases.length,
  'ベースレジスタ加算と1回の主記憶参照を固定する。番地や主記憶の内容を変え，オフセット無視・再間接参照を候補にする。', index => {
    const { register, base, operand } = memoryCases[index];
    const mem = new Map(memoryRows(index)), address = base + operand, data = mem.get(address)!;
    const candidates = index === 0 ? source[10].choices : ascending([data, mem.get(operand)!, mem.get(data)!, mem.get(address === 300 ? 301 : 300)!]);
    return choiceBody([...lines(source[10].prompt), code('LOAD GR, ' + register + ', ' + operand, 'text'),
      special2011AmDiagram('memory', index)], candidates, data,
    '有効アドレスは命令の' + operand + 'にベースレジスタ' + register + 'の' + base + 'を加えた' + address +
      'である。その番地の内容' + data + 'を1回読み出してGRに入れる。');
  });

const cacheCases = [[60, 10, 15], [70, 20, 35], [60, 20, 36], [65, 15, 55]] as const;
const cache = define(11, '主記憶・キャッシュ・実効アクセス時間', cacheCases.length,
  'ナノ秒単位を固定し，命中時と非命中時の加重平均を求める。派生ではミス時のアクセス時間を明示する。', index => {
    const [memory, cached, effective] = cacheCases[index];
    const ratio = (memory - effective) / (memory - cached);
    const options = index === 0 ? source[11].choices : ascending([ratio, Math.round((1 - ratio) * 100) / 100,
      Math.round((cached / memory) * 100) / 100, Math.round(((memory + cached - effective) / memory) * 100) / 100]);
    const stem = source[11].prompt.replace(/(60|10|15)ナノ秒/g, (_, value: string) =>
      ({ '60': memory, '10': cached, '15': effective }[value] ?? value) + 'ナノ秒');
    return choiceBody(index === 0 ? stem : stem + '\nここで，キャッシュミス時のアクセス時間は主記憶のアクセス時間とする。',
      options, ratio, 'ヒット率をhとすると，実効時間は ' + cached + '×h＋' + memory + '×(1−h)＝' + effective +
      '。整理するとh＝' + (memory - effective) + '÷' + (memory - cached) + '＝' + ratio + 'である。');
  });

const availabilityCases = [[80, 20, 180, 20], [70, 30, 180, 20], [60, 40, 160, 40], [95, 5, 160, 40]] as const;
const availability = define(16, '装置aとbのMTBFとMTTR', availabilityCases.length,
  '直列接続と単位の時間を保持する。積，個別稼働率，二つの平均を小数2桁の昇順で比較する。', index => {
    const [aUp, aDown, bUp, bDown] = availabilityCases[index];
    const a = aUp / (aUp + aDown), b = bUp / (bUp + bDown);
    const choices = ascending([a * b, a, b, (a + b) / 2]).map(value => value.toFixed(2));
    return choiceBody([p(source[16].prompt), p('単位　時間'), materialTable('装置のMTBFとMTTR',
      ['装置', 'MTBF', 'MTTR'], [['a', String(aUp), String(aDown)], ['b', String(bUp), String(bDown)]])], choices,
    (a * b).toFixed(2), '各装置の稼働率はMTBF÷(MTBF＋MTTR)。aは' + a + '，bは' + b +
      '。直列では両方が稼働している必要があるので，積の' + (a * b).toFixed(2) + 'である。');
  });

const cpu = define(18, '二つのタスクのCPU時間と入出力時間', taskCases.length,
  '等間隔の目盛と二つのタスクの順序，CPU 1台，I/O要求を発生順に一つずつ処理する条件を保持する。同時動作・全区間の単純和・別の待ち時間を含む誤答と比較する。', index => {
    const tasks = taskCases[index];
    const { rows, busy, end } = schedule(tasks, true), parallelEnd = schedule(tasks, false).end;
    const percent = (duration: number) => Math.round(100 * busy / duration);
    const answer = percent(end), allIo = tasks.flat().reduce((sum, n) => sum + n, 0);
    const candidates = index === 0 ? source[18].choices : ascending([answer, percent(parallelEnd), percent(allIo), percent(end + tasks[0][0] + tasks[1][0])]);
    const timeline = rows.flatMap((row, task) => row.filter(phase => phase.kind === 'I/O').map(phase => ({
      name: 'AB'[task], ...phase,
    }))).sort((a, b) => a.start - b.start).map(phase => phase.name + 'の' + phase.start + '〜' + phase.end).join('，');
    return choiceBody([p(source[18].prompt), special2011AmDiagram('timeline', index)], candidates, answer,
      'I/Oを発生順に一つずつ処理すると，I/Oの区間は時刻' + timeline + 'となる。両タスクが完了する時刻は' +
      end + '，CPUの実行時間の合計は' + busy + 'なので，使用率は ' + busy + '÷' + end + '×100≒' + answer + '％。');
  });

const throughputCases = [[1000, 10, 200, 70, 80], [2500, 5, 200, 80, 70],
  [1000, 8, 250, 60, 90], [1250, 6, 250, 75, 75]] as const;
const throughput = define(19, '1件当たりの処理時間・ブロック数・CPU使用率の上限', throughputCases.length,
  '二台の独立したサーバ，各CPU1個，各処理条件の列挙を維持する。どちらが上限を決めるかが変わる。', index => {
    const [web, blocks, block, webLimit, databaseLimit] = throughputCases[index];
    const database = blocks * block, webCapacity = Math.floor(webLimit * 10_000 / web);
    const dbCapacity = Math.floor(databaseLimit * 10_000 / database);
    const answer = Math.min(webCapacity, dbCapacity);
    const choices = index === 0 ? source[19].choices : ascending([answer, Math.max(webCapacity, dbCapacity),
      Math.floor(1_000_000 / Math.max(web, database)), webCapacity + dbCapacity]).map(value => value.toLocaleString('en-US'));
    const material = source[19].material.replace('時間を1ミリ秒', '時間を' + web / 1000 + 'ミリ秒')
      .replace('10データブロック', blocks + 'データブロック').replace('0.2ミリ秒', block / 1000 + 'ミリ秒')
      .replace('サーバが70％，データベースサーバが80％', 'サーバが' + webLimit + '％，データベースサーバが' + databaseLimit + '％');
    return choiceBody([p(source[19].prompt), ...lines(material)], choices, answer.toLocaleString('en-US'),
      '1件のCPU時間はWebが' + web / 1000 + 'ミリ秒，データベースが' + blocks + '×' + block / 1000 +
      '＝' + database / 1000 + 'ミリ秒。各上限ではWebが' + webCapacity + ' TPS，データベースが' + dbCapacity +
      ' TPS。両方を通るので小さい方の' + answer + ' TPSが上限となる。');
  });

const compileCases = [[2000, 30, 1000, 150000], [2500, 50, 1200, 150000],
  [3000, 40, 960, 200000], [1600, 20, 780, 120000]] as const;
const compilation = define(23, '100行当たりの実行・コンパイル時間と固定オーバヘッド', compileCases.length,
  '入力をマイクロ秒で管理し，コンパイル方式が厳密に短くなる最小整数を求める。同時間となるケースも含む。原問の条件を全て保持する。', index => {
    const [interpreted, compiled, compiler, fixed] = compileCases[index];
    const perLineSaving = interpreted - compiled - compiler;
    const answer = Math.floor(fixed / perLineSaving) + 1;
    const choices = index === 0 ? source[23].choices : ascending([
      answer, Math.ceil(fixed / interpreted), Math.ceil(fixed / (interpreted + compiler)),
      Math.ceil(fixed / (interpreted - compiled - compiler / 2)),
    ]);
    const material = source[23].material.replace('0.2秒', interpreted / 10000 + '秒').replace('0.003秒', compiled / 10000 + '秒')
      .replace('0.1秒', compiler / 10000 + '秒').replace('0.15秒', fixed / 1000000 + '秒');
    return choiceBody([p(source[23].prompt), ...lines(material)], choices, answer,
      '1行当たりの実行時間とコンパイル時間を比べると，コンパイル方式は' + perLineSaving + 'マイクロ秒短い。' +
      '固定オーバヘッドの' + fixed + 'マイクロ秒を上回るには，行数nについて ' + perLineSaving + '×n＞' + fixed +
      ' が必要である。n＝' + (answer - 1) + 'では満たさず，n＝' + answer + 'で初めて満たす。');
  });

const parity = define(24, '偶奇条件と第1段・第2段のゲート', parityCases.length,
  '4ビットの入力数の偶奇と出力値を問い，四つの二段論理回路を維持する。共通表記の否定とXORの接続を照合する。', index => {
    const even = parityEven[index];
    const circuits = parityCases[index];
    const correctIndex = circuits.findIndex(([first, second, final, inverted]) => Array.from({ length: 16 }, (_, n) => {
      const bits = [0, 1, 2, 3].map(bit => Boolean(n & (1 << bit)));
      const output = gateOutput(final, gateOutput(first, bits[0], bits[1]), gateOutput(second, bits[2], bits[3])) !== inverted;
      return output === ((bits.filter(Boolean).length % 2 === 0) === even);
    }).every(Boolean));
    const oddPrompt = source[24].prompt.replace('出力が1に，奇数個のとき出力が0', '出力が0に，奇数個のとき出力が1');
    const adjustedEven = index >= 2 ? !even : even;
    const baseStem = adjustedEven ? source[24].prompt : oddPrompt;
    const stem = index < 2 ? baseStem : baseStem.replace('4ビットの入力データに対し，', '4ビットの入力データについて，第' +
      (index === 2 ? 1 : 3) + 'ビットだけを反転させた値を考える。反転後に') +
      ' ここで，回路には反転前の4ビットを入力する。';
    const [first, second, , inverted] = circuits[correctIndex];
    const firstStage = first === second ? '二つの排他的論理和はそれぞれ，担当する2ビットに1が奇数個あるとき1を出す。'
      : '第1段の一方は論理一致なので，排他的論理和の出力を反転した値を出す。';
    return { prompt: [p(stem)], choices: circuits.map((_, i) => [special2011AmDiagram('parity', index * 4 + i)]),
      correctIndex, explanation: (index >= 2 ? '1ビットだけを反転すると1の個数の偶奇が入れ替わる。' : '') + firstStage + '第2段で排他的論理和を取ると，二つの出力が異なるときに1になる。' +
        (inverted ? '最後の否定素子でその結果を反転する。' : '最後に反転せず取り出す。') +
        'この回路では入力の1の個数が' + (even ? '偶数（0を含む）' : '奇数') + 'のときだけ1を出す。' };
  });

const adderOptions: readonly (readonly (readonly [Gate, Gate])[])[] = [
  [['XOR', 'AND'], ['NAND', 'NOR'], ['NOR', 'XOR'], ['AND', 'OR']],
  [['XOR', 'AND'], ['AND', 'XOR'], ['NOR', 'XOR'], ['AND', 'OR']],
  [['XOR', 'AND'], ['XNOR', 'AND'], ['XOR', 'NAND'], ['AND', 'OR']],
  [['XOR', 'AND'], ['AND', 'XOR'], ['NAND', 'XNOR'], ['AND', 'XNOR']],
];
const adder = define(25, '素子A・Bと出力線の対応・出力ビットの極性', adderOptions.length,
  '1けたの2進加算，二つの出力，二素子の組合せ表を維持する。入替えは図，反転の条件は本文で明示する。', index => {
    const { swap, invertSum, invertCarry } = adderCases[index];
    const values = [[false, false], [false, true], [true, false], [true, true]] as const;
    const candidates = adderOptions[index];
    const correctIndex = candidates.findIndex(([first, second]) => values.every(([x, y]) => {
      const sum = (x !== y) !== invertSum, carry = (x && y) !== invertCarry;
      return gateOutput(first, x, y) === (swap ? carry : sum) && gateOutput(second, x, y) === (swap ? sum : carry);
    }));
    const extra = invertSum ? 'ここで，zは和の1けた目を反転した値とし，cはけた上げをそのまま出力する。'
      : invertCarry ? 'ここで，zは和の1けた目をそのまま出力し，cはけた上げを反転した値とする。' : '';
    const stem = extra ? source[25].prompt.replace('z（和の1けた目）及びc（けた上げ）', '和の1けた目とけた上げを表す二つの信号z及びc') : source[25].prompt;
    return {
      prompt: [p(extra ? stem + '\n' + extra : stem), special2011AmDiagram('adder', index)],
      choices: candidates.map(pair => [materialTable('AとBの素子の組合せ', ['A', 'B'], [pair.map(gate => gateLabels[gate])])]),
      correctIndex,
      explanation: '通常の和の1けた目は片方だけが1のとき1となり，けた上げは両方が1のとき1となる。' +
        (extra ? '指定された出力を反転する。' : '') + '図の接続ではAが' + gateLabels[candidates[correctIndex][0]] +
        '，Bが' + gateLabels[candidates[correctIndex][1]] + 'になる。',
    };
  });

export const calculation2011SpecialAm0126 = [
  expression, relativeError, bits, states, binaryTree, divisor, flow, load, cache, availability, cpu, throughput, compilation, parity, adder,
];
