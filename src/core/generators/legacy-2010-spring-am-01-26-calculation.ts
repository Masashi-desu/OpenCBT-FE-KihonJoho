import type { Block } from '../types';
import { code, p, table } from './definition';
import { gateDiagram, ledOptions, spring2010AmDiagram as draw, tierDiagram } from './legacy-2010-spring-am-01-26-figures';
import { choiceBody, define, source } from './legacy-2010-spring-am-01-26-shared';

const sort = (values: number[]) => [...values].sort((a, b) => a - b);
const visibleTable = (caption: string, columns: string[], rows: string[][]) =>
  ({ ...table(caption, columns, rows), captionPresentation: 'accessible' as const });
const upperHex = (value: number) => value.toString(16).toUpperCase().padStart(2, '0');
const letter = (index: number) => 'アイウエ'[index];

const hexCases = [
  { whole: [5, 3, 1], fraction: [-2, -5, -6], shifts: [0, 0] },
  { whole: [4, 3, 0], fraction: [-3, -5, -7], shifts: [1, 0] },
  { whole: [5, 2, 0], fraction: [-3, -5, -6], shifts: [0, 1] },
  { whole: [6, 3, 1], fraction: [-3, -6, -8], shifts: [1, 1] },
];
const superscript = (exponent: number) => [...String(exponent)].map(value => value === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(value)]).join('');
const hexadecimal = define(1, '16進数2けたずつの整数部と小数部', hexCases.length,
  '整数・小数各2けた，整数3項・小数3項のべき乗を保つ。選択肢は整数側又は小数側のビット位置を1けたずらす組合せ。', index => {
    const { whole, fraction, shifts: [w, f] } = hexCases[index];
    const powers = (a: number, b: number) => [...whole.map(n => n + a), ...fraction.map(n => n + b)];
    const choices = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => powers(a, b));
    const correctIndex = 2 * w + f, answer = choices[correctIndex];
    const int = answer.slice(0, 3).reduce((sum, n) => sum + 2 ** n, 0);
    const fract = answer.slice(3).reduce((sum, n) => sum + 2 ** (8 + n), 0);
    const input = upperHex(int) + '.' + upperHex(fract);
    return {
      prompt: [p(source[1].prompt.replace('2A.4C', input))],
      choices: choices.map(exponents => [{
        type: 'formula', format: 'latex', text: exponents.map(n => '2^{' + n + '}').join('+'),
        alt: exponents.map(n => '2' + superscript(n)).join('＋'),
      }]),
      correctIndex,
      explanation: input + 'の各16進数字を4ビットで表すと，' + int.toString(2).padStart(8, '0') + '.' +
        fract.toString(2).padStart(8, '0') + 'になる。小数点の左隣を2⁰，右隣を2⁻¹として，1があるけたの重みだけを加えると' +
        answer.map(n => '2' + superscript(n)).join('＋') + 'となる。',
    };
  });

const truthOptions = ['0001', '0101', '1101', '1110'];
const truthRows = ['00', '01', '10', '11'];
const truth = define(2, 'XとのAND・ORを施した四行の真理値', 4,
  'X、Yの行順は00・01・10・11のまま。演算結果の両列を同じX□Yから作り，原資料の四つの真理値表を保持。', index => {
    const solution = truthOptions[[2, 0, 3, 1][index]];
    const givens = truthRows.map(([x, y], i) => [x, y, String(Number(x) & Number(solution[i])), String(Number(x) | Number(solution[i]))]);
    return {
      prompt: [p(source[2].prompt), visibleTable('観測された真理値表', ['X', 'Y', 'X AND (X□Y)', 'X OR (X□Y)'], givens)],
      choices: truthOptions.map(values => [visibleTable('X□Yの真理値表', ['X', 'Y', 'X□Y'],
        truthRows.map(([x, y], i) => [x, y, values[i]]))]),
      correctIndex: truthOptions.indexOf(solution),
      explanation: 'X＝0の行ではOR列がX□Yそのものになり，X＝1の行ではAND列がX□Yそのものになる。' +
        '行順00，01，10，11で読み取ると' + [...solution].join('，') + 'になる。',
    };
  });

const rpnCases = [[1, 3, 5, 4, 2], [2, 4, 9, 6, 3], [3, 5, 8, 6, 2], [2, 7, 5, 8, 2]];
const integer = (n: number) => String(n).replace('-', '－');
const rpn = define(3, 'A〜Eに与える1けたの整数', rpnCases.length,
  '同一の逆ポーランド表記と4演算を維持。除算は割り切れる整数に限定し，減算の逆順，最後の積を忘れる場合，括弧を取り違える場合を比較。', index => {
    const [a, b, c, d, e] = rpnCases[index], first = a + b, divided = d / e;
    const result = first * (c - divided);
    const values = index === 0 ? source[3].choices : sort([-result, divided, result, first * c - divided]).map(integer);
    const prompt = source[3].prompt.replace('A＝1，B＝3，C＝5，D＝4，E＝2', 'A＝' + a + '，B＝' + b + '，C＝' + c + '，D＝' + d + '，E＝' + e);
    return choiceBody(prompt, values, integer(result), '演算子に達するたびに直前の二つの値を演算する。A＋B＝' + first +
      '，D／E＝' + divided + '，C－D／E＝' + (c - divided) + 'を順に得る。最後に二つを掛けると' + result + 'になる。');
  });

const listCases = [
  { order: ['A', 'K', 'T'], addresses: [100, 200, 300, 400], position: 0 },
  { order: ['T', 'A', 'K'], addresses: [110, 210, 310, 410], position: 0 },
  { order: ['K', 'T', 'A'], addresses: [120, 220, 320, 420], position: 0 },
  { order: ['K', 'A', 'T'], addresses: [130, 230, 330, 430], position: 0 },
];
const pointerLabels = ['ab', 'cd', 'ef'];
const physical = ['A', 'T', 'K'];
const pointer = define(5, '双方向リストの順序・アドレス・挿入する二社員の間', listCases.length,
  '元表のアドレス順とリンク順を区別し，既存セルa〜fだけを比較。0は端を表し，新しいx・yは解答対象外。各選択肢内の文字順を維持。', index => {
    const { order, addresses, position } = listCases[index];
    const [left, right] = order.slice(position, position + 2), leftRow = physical.indexOf(left), rightRow = physical.indexOf(right);
    const addr = (person: string | undefined) => person ? addresses[physical.indexOf(person)] : 0;
    const initial = physical.map((name, i) => {
      const row = order.indexOf(name);
      return [addresses[i], '社員' + name, addr(order[row + 1]), row === 0 ? 0 : addr(order[row - 1])].map(String);
    });
    const after = physical.map((name, i) => [String(addresses[i]), '社員' + name, ...pointerLabels[i]]);
    after.push([String(addresses[3]), '社員G', 'x', 'y']);
    const changed = [pointerLabels[leftRow][0], pointerLabels[rightRow][1]];
    const reverse = [pointerLabels[leftRow][1], pointerLabels[rightRow][0]];
    const items = (values: string[]) => [...values].sort().join(', ');
    const choices = [items([...changed, ...reverse]), items([...changed, reverse[1]]), items(changed), items(reverse)];
    const columns = ['アドレス', '社員名', '次ポインタ', '前ポインタ'];
    return choiceBody([p(source[5].prompt.replace('社員Aと社員K', '社員' + left + 'と社員' + right)),
      table('表', columns, initial), table('追加後の表', columns, after)], choices, items(changed),
    '社員' + left + 'の次ポインタ' + changed[0] + 'と社員' + right + 'の前ポインタ' + changed[1] +
      'が，いずれも社員Gのアドレス' + addresses[3] + 'を指すように変わる。G自身のx・yは元表に存在せず，問いの範囲a〜fに含まれない。');
  });

const cpiCases = [
  { ratios: [20, 20, 60], cpi: [3, 5, 2], count: 1_000_000, clock: 1 },
  { ratios: [20, 30, 50], cpi: [4, 5, 2], count: 2_000_000, clock: 2 },
  { ratios: [30, 20, 50], cpi: [2, 6, 2], count: 1_000_000, clock: 2 },
  { ratios: [20, 40, 40], cpi: [3, 4, 1], count: 2_000_000, clock: 1 },
];
const cpi = define(9, '3種類の命令のCPI、構成比率、合計命令数、クロック周波数', cpiCases.length,
  '三種と％の表，GHz→ミリ秒，小数1桁を保持。平均CPIの一部だけ，重みを無視した場合，換算の一桁誤りを比較。', index => {
    const { ratios, cpi, count, clock } = cpiCases[index];
    const ratioSum = cpi.reduce((sum, value, i) => sum + value * ratios[i], 0), scale = count / (clock * 1_000_000);
    const time = (ratioSum * scale / 100).toFixed(1);
    const choices = index === 0 ? source[9].choices :
      sort([cpi[0] * ratios[0] * scale / 100, Number(time), Math.max(...cpi) * scale, Number(time) * 10]).map(value => value.toFixed(1));
    const prompt = source[9].prompt.replace('1,000,000', count.toLocaleString('en-US')).replace('1 GHz', clock + ' GHz');
    const op = ['浮動小数点加算', '浮動小数点乗算', '整数演算'];
    const rows = op.map((label, i) => [label, String(cpi[i]), String(ratios[i])]);
    return choiceBody([p(prompt), visibleTable('命令の構成とCPI', ['演算命令', 'CPI（Cycles Per Instruction）', '構成比率（％）'], rows)],
      choices, time, 'CPIは1命令当たりのクロックサイクル数である。構成比率で重みを付けた平均は' +
      ratioSum / 100 + 'サイクル。全命令のサイクル数を1秒当たりのクロック数で割って秒を求め，ミリ秒に直すと' + time + 'ミリ秒になる。');
  });

const yMain = [580, 460, 780, 880];
const cache = define(10, 'CPU Yの主記憶アクセス時間', yMain.length,
  'CPUと内蔵キャッシュ・主記憶の構成図，単位ナノ秒，等しい処理時間，ほかの影響がない条件と昇順の小数2桁。', index => {
    const memory = yMain[index], hit = ((memory - 400) / (memory - 400 + 20)).toFixed(2);
    return choiceBody([p(source[10].prompt), draw('cache', 0, '図　構成'), p('単位　ナノ秒'),
      table('表　アクセス時間', ['', 'CPU X', 'CPU Y'], [['キャッシュメモリ', '40', '20'], ['主記憶', '400', String(memory)]])],
    source[10].choices, hit, 'ヒット率をhとし，ヒット時はキャッシュ，ミス時は主記憶の時間をそれぞれ重み付けする。' +
      'CPU（Central Processing Unit、中央処理装置）XとYで平均が等しいので，40h＋400(1－h)＝20h＋' + memory +
      '(1－h)。20h＝' + (memory - 400) + '(1－h)を解くとh＝' + hit + 'となる。');
  });

const diskCases = [[4200, 5], [6000, 5], [6000, 2], [6000, 9]];
const disk = define(12, '磁気ディスクの毎分回転数・平均位置決め時間', diskCases.length,
  '平均位置決めと平均回転待ちだけの合計。原問と同じ約何ミリ秒の整数選択肢。転送時間を加えない。', index => {
    const [rpm, seek] = diskCases[index], half = 30_000 / rpm;
    const prompt = source[12].prompt.replace('4,200', rpm.toLocaleString('en-US')).replace('5ミリ秒の磁気', seek + 'ミリ秒の磁気');
    return choiceBody(prompt, source[12].choices, Math.round(seek + half),
      '1回転にかかる時間は60,000÷' + rpm + 'ミリ秒である。目的位置まで平均して半回転待つので，回転待ちは' +
      half.toFixed(2) + 'ミリ秒。位置決めの' + seek + 'ミリ秒を加え，最も近い整数は' + Math.round(seek + half) + 'ミリ秒になる。');
  });

const tierConstraints = [
  '',
  'クライアント側とDBサーバ側は別々のネットワークとし，両方のネットワークに接続するのはAPサーバだけとする。',
  'クライアントとAPサーバは同じネットワークに置き，DBサーバはそのネットワークに接続せず，APサーバに専用の線で直接つなぐ。',
  'APサーバとDBサーバは同じネットワークに置き，クライアントはそのネットワークに接続せず，APサーバに専用の線で直接つなぐ。',
];
const desiredLayout = ['bus', 'separated', 'direct-db', 'direct-client'];
const threeTiers = define(14, 'クライアント・APサーバ・DBサーバのネットワーク／直接接続条件', 4,
  '3層，各サーバ1台，APとDBの注記，四つの構成図を保持。派生は接続条件を本文へ明記し，論理層だけで物理構成を決めない。', index => {
    const ids = [0, 1, 2, 3].map(choice => 4 * index + choice);
    const correctIndex = ids.findIndex(id => {
      const diagram = tierDiagram(id), roles = [diagram.upper, diagram.other];
      return roles.includes('APサーバ') && roles.includes('DBサーバ') && diagram.layout === desiredLayout[index];
    });
    return {
      prompt: [p(source[14].prompt + tierConstraints[index])],
      choices: ids.map((id, i) => [draw('tiers', id, 'システム構成 ' + letter(i), true)]), correctIndex,
      explanation: '3層はクライアント，AP（Application、アプリケーション）サーバ，DB（Database、データベース）サーバで構成する。' +
        (index === 0 ? '四つの図のうち，アには三つの役割がすべてあり，ほかの構成はDBサーバを持たない。' :
          tierConstraints[index] + '三つの役割を持ち，指定された接続を満たすのは' + letter(correctIndex) + 'である。'),
    };
  });

const durationNames = ['処理待ち時間', 'CPU時間', '入出力時間', 'ターンアラウンドタイム'];
const durations = define(15, '関係式の左辺に求めるジョブの時間', 4,
  '四つの時間の関係式を選ぶ。原と同じオーバヘッド除外，四つの記号を一度ずつ使用し符号・順序を検討。', index => {
    const left = durationNames[index];
    const terms = durationNames.filter(term => term !== left);
    const total = durationNames[3];
    const rest = terms.filter(term => term !== total);
    let choices = [...source[15].choices], expected = choices[2];
    if (index !== 0 && index !== 3) {
      expected = left + ' ＝ ' + total + ' － ' + rest.join(' － ');
      choices = [left + ' ＝ ' + terms.join(' ＋ '), expected, left + ' ＝ ' + rest.join(' ＋ ') + ' － ' + total,
        left + ' ＝ ' + rest[1] + ' － ' + rest[0] + ' － ' + total];
    } else if (index === 3) {
      expected = left + ' ＝ ' + terms.join(' ＋ ');
      choices = [left + ' ＝ ' + terms[0] + ' ＋ ' + terms[1] + ' － ' + terms[2], left + ' ＝ ' + terms.join(' － '),
        left + ' ＝ ' + terms[0] + ' － ' + terms[1] + ' ＋ ' + terms[2], expected];
    }
    return choiceBody(index === 0 ? source[15].prompt : source[15].prompt.replace('関係を表す式', '関係から' + left + 'を求める式'),
      choices, expected, 'ほかのオーバヘッドがなければ，ジョブの依頼が到着してから終了までの時間はCPUで処理する時間と入出力を行う時間，処理を待つ時間の合計である。' +
      'この加法関係を求める量について解くと「' + expected + '」となる。');
  });

const availabilityCases = [[0.9, 2], [0.8, 1], [0.7, 3], [0.6, 4]];
const availability = define(16, '装置の稼働率と降順に数えた順位', availabilityCases.length,
  '二台の直列・並列，直列組の並列，並列組の直列の四図。並列部分の「少なくとも一方」と順位選択を維持。', index => {
    const [r, rank] = availabilityCases[index], serial = r * r, parallel = 1 - (1 - r) ** 2;
    const rates = [serial, parallel, 1 - (1 - serial) ** 2, parallel ** 2];
    const order = [...rates.keys()].sort((a, b) => rates[b] - rates[a]);
    return {
      prompt: [p(source[16].prompt.replace('0.9', r.toFixed(1)).replace('2番目', rank + '番目'))],
      choices: rates.map((_, i) => [draw('availability', i, 'システム ' + letter(i), true)]),
      correctIndex: order[rank - 1],
      explanation: '各装置の稼働を独立として計算する。直列は全て稼働する確率，並列は1から全て停止する確率を引いた値である。' +
        'ア〜エの稼働率は' + rates.map(rate => rate.toFixed(4)).join('，') + 'なので，' + rank + '番目に高いのは' + letter(order[rank - 1]) + 'である。',
    };
  });

const workloadCases = [[20, 4, 40], [15, 4, 40], [20, 4, 55], [20, 4, 70]];
const workload = define(17, '秒当たりの到着件数、1件当たりのI/O回数、1回の所要時間', workloadCases.length,
  'CPU時間が十分短く均等アクセス，秒とミリ秒を維持。必要台数は端数切上げ，元の整数昇順4択。', index => {
    const [rate, calls, ms] = workloadCases[index], amount = rate * calls * ms;
    const prompt = source[17].prompt.replace('20件／秒', rate + '件／秒').replace('4回の磁気', calls + '回の磁気')
      .replace('40ミリ秒／回', ms + 'ミリ秒／回');
    const answer = Math.ceil(amount / 1000);
    return choiceBody(prompt, source[17].choices, answer, '1秒間のディスク入出力は' + rate + '×' + calls + '＝' + rate * calls +
      '回。必要な装置占有時間は' + amount + 'ミリ秒である。各装置は1秒に1,000ミリ秒まで処理できるので，' +
      amount + '÷1,000を切り上げた' + answer + '台が最低限必要になる。');
  });

const instructionCases = [
  source[22].material,
  '／ (c, d, w1)\n＋ (b, w1, w2)\n＊ (w2, e, w3)\n／ (w3, f, w4)\n－ (w4, g, x)',
  '＊ (d, e, w1)\n／ (c, w1, w2)\n／ (w2, f, w3)\n＋ (b, w3, w4)\n－ (w4, g, x)',
  '／ (e, f, w1)\n－ (w1, g, w2)\n＊ (d, w2, w3)\n／ (c, w3, w4)\n＋ (b, w4, x)',
];
const address = define(22, '3アドレス命令5行の中間結果と最終演算', 4,
  'op(a,b,c)では第3オペランドが格納先。＊、／、＋、－の原資料の優先順位を維持し，命令列の括弧と結合を変える。', index => {
    const correct = source[22].choices[[3, 2, 0, 1][index]];
    return choiceBody([p(source[22].prompt), code(instructionCases[index], 'text')], source[22].choices, correct,
      '各行では前二つの値を左・右の順に演算し，第3オペランドに格納する。w1から順に定義式を最後のxへ代入する。' +
      '掛け算が割り算より先という設問の優先順位に従い，必要な括弧を残すと「' + correct + '」になる。');
  });

const led = define(23, '出力ポートの2けたの16進数', 4,
  'P7が最上位，P0が最下位。抵抗・接地・凡例，P0〜P7とa〜g・Dtの結線と1で点灯する前提を保持。', index => {
    const correctIndex = [2, 0, 1, 3][index], input = ledOptions[correctIndex], value = upperHex(input);
    return {
      prompt: [p(source[23].prompt.replace('6D', value)), draw('ledWiring', 0, '7セグメントLED点灯回路', true)],
      choices: ledOptions.map((_, i) => [draw('ledState', i, '表示状態 ' + letter(i), true)]),
      correctIndex,
      explanation: value + 'は2進数で' + input.toString(2).padStart(8, '0') + '。P0からP7の1をa〜g・Dtの配線に沿って読むと，' +
        source[23].choices[correctIndex] + ' LED（Light Emitting Diode）は発光ダイオード，MSBはMost Significant Bit，LSBはLeast Significant Bitを表す。',
    };
  });

const logicPredicates = ['値が同じとき', '値が異なるとき', '値がともに0のとき', '値がともに1のとき'];
const desiredLogic = ['1001', '0110', '1000', '0001'];
function evaluateGate(gate: number, x: number, y: number) {
  const result = gate % 2 === 0 ? x & y : x | y;
  return gate >= 2 ? result ^ 1 : result;
}
const circuit = define(26, '出力Zが1になる二入力の条件', 4,
  'X、Yの両分岐と下段の二つのNOT，二段のゲート，四図を保持。論理一致・排他的論理和・両方0・両方1を真理値で区別。', index => {
    const ids = [0, 1, 2, 3].map(i => index * 4 + i);
    const truth = ids.map(id => {
      const [upper, lower, last] = gateDiagram(id);
      return truthRows.map(([a, b]) => evaluateGate(last, evaluateGate(upper, +a, +b), evaluateGate(lower, 1 - +a, 1 - +b))).join('');
    });
    const correctIndex = truth.indexOf(desiredLogic[index]);
    return {
      prompt: [p(source[26].prompt.replace('値が同じとき', logicPredicates[index]))],
      choices: ids.map((id, i) => [draw('logic', id, '論理回路 ' + letter(i), true)]),
      correctIndex,
      explanation: 'X、Yを上段へ，反転した値を下段へ入れ，両段の出力に最後のゲートを適用する。入力順00，01，10，11でア〜エの出力は' +
        truth.join('，') + 'となる。要求された出力' + desiredLogic[index] + 'と一致するのは' + letter(correctIndex) + 'である。',
    };
  });

export const calculation2010SpringAm0126 = [hexadecimal, truth, rpn, pointer, cpi, cache, disk, threeTiers, durations, availability, workload, address, led, circuit];
