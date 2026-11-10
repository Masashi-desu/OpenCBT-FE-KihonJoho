import { code, p, table } from './definition';
import { addresses, autumn2011AmDiagram, cacheRows, gateKinds, rotationWidths, routeCases, stackCases, taskStates }
  from './legacy-2011-autumn-am-01-26-figures';
import { choiceBody, define, source } from './legacy-2011-autumn-am-01-26-shared';

const formatNumber = (value: number) => value.toLocaleString('en-US');
const lines = (value: string) => value.split('\n').map(p);
const maskInputs = [[16, 4], [16, 2], [16, 8], [15, 3]] as const;
const mask = define(1, '2進数のビット数と出力の基数', maskInputs.length,
  '下位の桁から格納、aとbの組合せ表、3手順、論理シフトとXXXX₁₆の定義を固定する。基数は2の累乗で、ビット数は1桁の幅で割り切れる。', index => {
    const [bits, width] = maskInputs[index], low = 2 ** width - 1, high = 0xffff ^ low;
    const hex = (value: number) => value.toString(16).toUpperCase().padStart(4, '0') + '₁₆';
    const rows = [low, high].flatMap(mask => ['左', '右'].map(direction => ['n AND ' + hex(mask), direction + 'に' + width + 'ビット']));
    const prompt = source[1].prompt.replace('16ビット', bits + 'ビット').replace('16進数の各桁', 2 ** width + '進数の各桁')
      .replace('4回', bits / width + '回');
    return {
      prompt: [p(prompt), ...lines(source[1].material.split('\n解答表')[0])],
      choices: rows.map(row => [{ ...table('aとbの組合せ', ['a', 'b'], [row]), captionPresentation: 'accessible' }]),
      correctIndex: 1,
      explanation: '基数' + 2 ** width + 'の1桁は' + width + 'ビットに相当する。' + hex(low) +
        'との論理積で下位' + width + 'ビットだけを残してxに格納し，nを右に' + width +
        'ビット論理シフトすると次の桁が同じ位置へ来る。これを' + bits / width + '回繰り返す。',
    };
  });

const decimalCases = [5.625, 3.25, 6.375, 4.125];
const bits8 = (value: number) => (value & 255).toString(2).padStart(8, '0');
const fixedPoint = define(2, '表現する負の10進数', decimalCases.length,
  '8ビット、ビット4と3の間の小数点、2の補数を固定する。小数は1/8の整数倍。1の補数と2の補数、誤って半分の絶対値を表す値、正の符号を比較。', index => {
    const magnitude = decimalCases[index], scaled = magnitude * 16;
    const positive = index === 0 ? 76 : scaled;
    const choices = [positive, ~scaled, -scaled, -scaled / 2].map(bits8);
    const prompt = source[2].prompt.replace('5.625', String(magnitude));
    return choiceBody([p(prompt), autumn2011AmDiagram('fixedPoint', 0)], choices, bits8(-scaled),
      '小数部は4ビットなので，' + magnitude + 'に16を掛けると' + scaled + 'となる。正の値は' + bits8(scaled) +
      '。8ビット内で反転し1を加えると' + bits8(-scaled) + 'となり，これが負の値を表す。');
  });

const equationCases = [[100, 1000, 2, 4], [100, 1000, 3, 5], [200, 1000, 4, 5], [200, 2000, 3, 2]] as const;
const cubic = define(3, '基準と目標の未知数・時間・演算速度の比', equationCases.length,
  '未知数の3乗比例と演算速度への反比例を固定し、整数比を用いる。1〜4乗を使う昇順候補で計算負担を原問に合わせる。', index => {
    const [start, next, seconds, speed] = equationCases[index], ratio = next / start;
    const times = [1, 2, 3, 4].map(power => seconds * ratio ** power / speed);
    const stem = source[3].prompt.replace('100元', formatNumber(start) + '元').replace('1,000元', formatNumber(next) + '元')
      .replace('2秒', seconds + '秒').replace('4倍の演算速度', speed + '倍の演算速度');
    return choiceBody(stem, times.map(formatNumber), formatNumber(times[2]),
      '未知数は' + ratio + '倍になり，同じコンピュータなら時間は' + ratio + '³＝' + ratio ** 3 +
      '倍になる。演算速度は' + speed + '倍なので，' + seconds + '×' + ratio ** 3 + '÷' + speed + '＝' + formatNumber(times[2]) + '秒。');
  });

const grammarCases = [
  { symbols: 'ABCD', enclosed: '＋', bare: '＊' }, { symbols: 'PQRS', enclosed: '−', bare: '＋' },
  { symbols: 'ABCD', enclosed: '＊', bare: '−' }, { symbols: 'WXYZ', enclosed: '＋', bare: '−' },
] as const;
const grammar = define(4, '生成規則の演算子と変数の集合', grammarCases.length,
  '変数，括弧を要する二項演算，括弧なしの二項演算の3規則と、変数4個、式の4択を維持する。', index => {
    const { symbols, enclosed, bare } = grammarCases[index], [a, b, c, d] = [...symbols];
    const rules = '〔規則〕\n＜式＞ ::= ＜変数＞ | (＜式＞' + enclosed + '＜式＞) | ＜式＞' + bare + '＜式＞\n＜変数＞ ::= ' +
      [...symbols].join(' | ');
    const left = '(' + a + enclosed + b + ')', right = '(' + c + enclosed + d + ')';
    const candidates = [a + enclosed + '(' + b + enclosed + c + ')' + bare + d,
      left + enclosed + right, left + bare + right, '(' + a + bare + b + ')' + enclosed + '(' + c + bare + d + ')'];
    return choiceBody([p(source[4].prompt), code(rules, 'text')], candidates, candidates[2],
      enclosed + 'で二つの式を結ぶときは，全体に括弧が必要である。' + bare + 'を使う規則で式を二つに分け，左を' +
      left + '，右を' + right + 'に展開できるのは' + candidates[2] + 'である。');
  });

function stackOutput(top: string, operations: string) {
  const first = [...top].reverse(), second: string[] = [], output: string[] = [];
  for (const op of operations.split('，')) {
    if (op === 'f') second.push(first.pop()!);
    else output.push(second.pop()!);
  }
  return output.join('');
}
const stacks = define(5, 'スタック1の順序と必要な出力順', stackCases.length,
  'fは1から2へ移し，gは2から出力。初期のスタック2は空で，全選択肢がf・gを各4回使う。目標の出力と初期状態を変える。', index => {
    const { top, target } = stackCases[index], choices = source[5].choices;
    const answer = choices.find(choice => stackOutput(top, choice) === target)!;
    const stem = source[5].prompt.replace('b，c，d，a', [...target].join('，'));
    return choiceBody([p(stem), autumn2011AmDiagram('stacks', index)], choices, answer,
      'fはスタック1の最上部をスタック2の最上部に移し，gはスタック2の最上部を出す。初期値' +
      [...top].join('，') + 'に対して' + answer + 'と実行すると，gが出す値は順に' + [...target].join('，') + 'になる。');
  });

const hashCases = [[16, 43, 73, 24, 85], [16, 42, 72, 23, 85], [18, 42, 72, 25, 85], [19, 40, 76, 46, 89]] as const;
const hashing = define(6, '順番に格納する五つの整数', hashCases.length,
  '0初期化の10要素、k，k＋1，k＋4の剰余、先に空いている位置、入力の順序を固定する。最初・二番目・三番目の候補と剰余による折返しを含む。', index => {
    const values = hashCases[index], occupied = new Set<number>();
    const assigned = values.map(value => {
      const slot = [0, 1, 4].map(delta => (value + delta) % 10).find(slot => !occupied.has(slot))!;
      occupied.add(slot);
      return slot;
    });
    const last = values.at(-1)!, answer = assigned.at(-1)!;
    const stem = source[6].prompt.replace('16，43，73，24，85', values.join('，')).replace('85が格納', last + 'が格納');
    return choiceBody([p(stem), ...lines(source[6].material)], source[6].choices, 'A[' + answer + ']',
      '先の4個は順にA[' + assigned.slice(0, 4).join(']，A[') + ']を埋める。最後の' + last + 'は' +
      [0, 1, 4].map(delta => (last + delta) % 10).join('，') + 'を順に調べ，最初に空いているA[' + answer + ']に入る。');
  });

const rotation = define(7, '末尾から先頭へ移す単語の個数', rotationWidths.length,
  '添字0始まり、末尾を先に一時退避、降順のループ i：n−1，−1，0 とその注記、aの代入を維持する。幅kでは先頭k枠を一時領域として確保する。', index => {
    const count = rotationWidths[index], order = 'TANGO[i＋' + count + ']';
    const stem = index ? '要素番号が0から始まる配列TANGOがある。n個の単語がTANGO[' + count + ']からTANGO[n＋' +
      (count - 1) + ']に入っている。ここで，n＞' + count + 'とする。図は，最後の' + count + '個の単語を元の順序のまま先頭のTANGO[' +
      count + ']からTANGO[' + (count * 2 - 1) + ']へ移動し，それ以前の単語を順に' + count +
      '個分後ろにずらして単語表を再構成する流れ図である。TANGO[0]からTANGO[' + (count - 1) +
      ']は一時領域として使う。aに入れる処理として，適切なものはどれか。' : source[7].prompt;
    const choices = source[7].choices.map(choice => choice.replace('TANGO[i＋1]', order));
    return choiceBody([p(stem), autumn2011AmDiagram('rotation', index)], choices, 'TANGO[i] → ' + order,
      '末尾の' + count + '個は先に一時領域へ退避している。次に降順にTANGO[i]を' + order +
      'へ写すと，未使用の値を先に上書きせず' + count + '個分だけ後ろにずらせる。最後に一時領域の単語も先頭に戻る。');
  });

const address = define(9, '命令のアドレス部から実効アドレスを得る構成', addresses.length,
  '命令部・アドレス部、主記憶と矢印、方式名4択を維持する。メモリ上の値をたどる、指標加算、PC相対、直接参照の4経路を切り替える。', index => {
    const { mode, operand, effective, register } = addresses[index], choices = source[9].choices;
    const reason = mode === 'indirect' ? '主記憶のアドレス' + operand + 'の内容' + effective + 'を次のアドレスとして使う。' :
      register ? 'アドレス部の' + operand + 'と' + register + 'の' + (effective - operand) + 'を加え，実効アドレス' + effective + 'を得る。' :
        'アドレス部の' + operand + 'を実効アドレスとして，そのまま主記憶のデータを読む。';
    return choiceBody([p(source[9].prompt), autumn2011AmDiagram('addressing', index)], choices, choices[index], reason + '従って' + choices[index] + 'である。');
  });

const cache = define(11, 'キャッシュと主記憶のアクセス時間・ヒット率', 4,
  'A・Bはキャッシュなし、C・Dはあり、二段見出しの時間表、短い順の4択を保持。派生ではミス時の時間の定義を本文に明示する。', index => {
    const rates = cacheRows(index).map(([name, has, time, hit, memory]) => {
      const average = has === 'なし' ? Number(memory) : (Number(time) * Number(hit) + Number(memory) * (100 - Number(hit))) / 100;
      return { name, average };
    });
    const order = [...rates].sort((a, b) => a.average - b.average).map(row => row.name).join('，');
    const extra = index ? ' ここで，キャッシュがあるときのヒット時はキャッシュメモリの時間，ミス時は主記憶の時間を用いる。' : '';
    return choiceBody([p(source[11].prompt + extra), autumn2011AmDiagram('cache', index)], source[11].choices, order,
      'キャッシュがない構成は主記憶の時間を用いる。キャッシュがある構成はヒットとミスの時間をそれぞれの確率で重み付けする。' +
      rates.map(({ name, average }) => name + 'は' + average).join('，') + 'ナノ秒なので，' + order + 'の順になる。');
  });

const diskCases = [
  { start: 100, up: true, requests: [120, 90, 70, 80, 140, 110, 60] },
  { start: 100, up: true, requests: [120, 90, 70, 80, 110, 115, 60] },
  { start: 100, up: false, requests: [180, 90, 70, 80, 200, 110, 160] },
  { start: 150, up: false, requests: [200, 90, 70, 100, 210, 140, 160] },
] as const;
const seek = define(14, 'ヘッド位置・移動方向と入出力要求の列', diskCases.length,
  'シリンダ番号順の一方向走査、要求がなくなれば反転、要求追加なしの五条件を保持する。移動量は原問と同じ昇順四択。', index => {
    const { start, up, requests } = diskCases[index];
    const ahead = requests.filter(item => up ? item >= start : item <= start).sort((a, b) => up ? a - b : b - a);
    const behind = requests.filter(item => up ? item < start : item > start).sort((a, b) => up ? b - a : a - b);
    const path = [start, ...ahead, ...behind], total = path.slice(1).reduce((sum, current, i) => sum + Math.abs(current - path[i]), 0);
    const prompt = source[14].prompt.replace('番号100', '番号' + start).replace(diskCases[0].requests.join('，'), requests.join('，'));
    const conditions = source[14].material.replace('増加する方向', (up ? '増加' : '減少') + 'する方向');
    return choiceBody([p(prompt), ...lines(conditions)], source[14].choices, total,
      '指定された方向にある要求を先に処理し，最後の要求の位置で反転する。処理経路は' + path.join(' → ') + '。差の絶対値の合計は' + total + '。');
  });

const standbyCases = [
  { standby: 'コールドスタンバイシステム', best: 'デュアルシステム' },
  { standby: 'ウォームスタンバイシステム', best: 'デュアルシステム' },
  { standby: 'ホットスタンバイシステム', best: 'デュアルシステム' },
  { standby: 'コールドスタンバイシステム', best: 'ホットスタンバイシステム' },
] as const;
const availability = define(15, '稼働率を比較する冗長構成', standbyCases.length,
  '稼働率が高い順という方向、同一の構成コンピュータ、4通りの並びを固定する。派生では各故障周期で稼働を再開する条件を明示する。', index => {
    const { standby, best } = standbyCases[index], simplex = 'シンプレックスシステム';
    const choices = [[standby, simplex, best], [standby, best, simplex], [simplex, standby, best], [best, standby, simplex]]
      .map(order => order.join('，'));
    const stem = source[15].prompt.replace('コールドスタンバイシステム', standby).replace('デュアルシステム', best);
    const assumption = index === 0 ? '' : ' 故障の発生間隔は各構成で同じとし，予備機に切り替える方が故障機を修理するより短い。' +
      (index === 3 ? ' ホットスタンバイでは予備機が稼働準備済みなので，コールドスタンバイより切替停止が短い。' :
        ' デュアルでは正常な側で直ちに処理を続けられ，スタンバイでは短時間の切替停止がある。');
    return choiceBody(stem + assumption, choices, choices[3],
      best + 'は故障時に' + (index === 3 ? '準備済みの予備機に切り替えるため停止が短い。' : '正常側で処理を続けられる。') +
      standby + 'では切替えに時間を要し，単一系の' + simplex + 'では代替機がなく修理まで停止する。従って' + choices[3] + 'の順になる。');
  });

const routes = define(19, '回線の稼働率と直接・迂回経路の地点', routeCases.length,
  '直接回線1本、迂回回線2本の直列、稼働率は全回線で同じという条件、0.001刻みの昇順4択を維持する。派生では稼働の独立性を本文に明示する。', index => {
    const { origin, via, dest, availability: pLine } = routeCases[index];
    const pair = pLine ** 2, total = 1 - (1 - pLine) * (1 - pair);
    const choices = [pLine ** 3, pair, total, 1 - (1 - pLine) ** 3].map(value => value.toFixed(3));
    const stem = source[19].prompt.replaceAll('東京', origin).replaceAll('大阪', via).replaceAll('福岡', dest).replace('0.9', String(pLine)) +
      (index ? ' 各回線の稼働は独立とする。' : '');
    return choiceBody([p(stem), autumn2011AmDiagram('routes', index)], choices, total.toFixed(3),
      '迂回回線は2本とも稼働する必要があり，確率は' + pLine + '²＝' + pair.toFixed(3) +
      '。直接回線と迂回回線の両方が使えない確率は(1−' + pLine + ')×(1−' + pair.toFixed(3) +
      ')である。1から引くと' + total.toFixed(3) + 'になる。');
  });

const taskTransitions = [[2, 1], [0, 1], [3, 1], [2, 3]] as const;
const taskReasons = [
  '優先度の高いタスクが実行可能になると，今のタスクはCPUを明け渡し，次に割り当てられるまで実行可能状態になる。',
  'タスクの生成直後は実行に必要な準備を済ませて実行可能状態に入り，CPUの割当てを待つ。',
  '入出力が完了すると，待ちの原因がなくなるので，待ち状態から実行可能状態へ移る。',
  '実行中に入出力を要求すると，その処理を待つために待ち状態へ移る。',
];
const task = define(20, '尋ねるタスクの状態遷移', taskTransitions.length,
  '実行・実行可能・待ちと生成・終了の矢印、イベントの4択を固定する。問いに指定する遷移元と遷移先を切り替える。', index => {
    const [from, to] = taskTransitions[index], choices = source[20].choices;
    const statement = '図はマルチタスクで動作するコンピュータにおけるタスクの状態遷移を表したものである。';
    const stem = index === 0 ? source[20].prompt : statement + (from === 0 ?
      '図の左側から実行可能状態へ入るのはどの場合か。' : taskStates[from] + 'のタスクが' + taskStates[to] + 'に遷移するのはどの場合か。');
    return choiceBody([p(stem), autumn2011AmDiagram('task', 0)], choices, choices[index], taskReasons[index]);
  });

const logicCases = [
  { expr: 'A̅・B＋A・B̅＋A̅・B̅', truth: '1110', description: 'AとBが共に1のときだけ0になる。' },
  { expr: 'A̅・B＋A・B̅＋A・B', truth: '0111', description: '少なくとも一方が1なら1になる。' },
  { expr: 'A・B＋A・A̅＋B・B̅', truth: '0001', description: '第2項と第3項は，値とその否定の積なので常に0。AとBが共に1のときだけ1になる。' },
  { expr: 'A̅・B̅＋A・A̅＋B・B̅', truth: '1000', description: '第2項と第3項は常に0。AとBが共に0のときだけ第1項が1になる。' },
] as const;
const logic = define(26, '三つの積項を持つ論理式', logicCases.length,
  '三つの2因子の積項、上線による否定、論理積・和の記号、入力A・Bと出力X、論理ゲート4図を保持する。四つの入力組で検算できる。', index => {
    const { expr, truth, description } = logicCases[index];
    const prompt = source[26].prompt.replace(logicCases[0].expr, expr);
    const correctIndex = ['0001', '1110', '0111', '1000'].indexOf(truth);
    return {
      prompt: [p(prompt)], choices: gateKinds.map((_, i) => [autumn2011AmDiagram('gate', i)]), correctIndex,
      explanation: '入力(A，B)＝(0，0)，(0，1)，(1，0)，(1，1)の順で出力は' + [...truth].join('，') + '。' +
        description + 'よって' + source[26].choices[correctIndex] + 'と一致する。',
    };
  });

export const calculation2011AutumnAm0126 = [
  mask, fixedPoint, cubic, grammar, stacks, hashing, rotation, address, cache, seek, availability, routes, task, logic,
];
