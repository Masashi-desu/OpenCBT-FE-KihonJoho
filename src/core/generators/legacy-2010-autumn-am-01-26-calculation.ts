import type { Block } from '../types';
import { p, table } from './definition';
import { autumn2010AmDiagram as draw, lampCases, logicCircuits, recoveryCases, taskDurations } from './legacy-2010-autumn-am-01-26-figures';
import { choiceBody, define, source } from './legacy-2010-autumn-am-01-26-shared';

const visibleTable = (caption: string, columns: string[], rows: string[][]) =>
  ({ ...table(caption, columns, rows), captionPresentation: 'accessible' as const });
const ordered = (values: number[]) => values.sort((a, b) => a - b);
const formula = (text: string, alt: string): Block => ({ type: 'formula', format: 'latex', text, alt });
const hexCases = ['3A.5C', '4B.2C', '2E.94', '5C.7C'];
const hexadecimal = define(1, '16進数の整数部と小数部', hexCases.length,
  '整数部・小数部各2けた，縦組み分数4択。二つの近接候補は末尾を誤読した分数，粗い分数は16を分母にした場合。末尾は4又はCで，原問と同じ約分の負担とする。', index => {
    const input = hexCases[index];
    const [whole, fraction] = input.split('.');
    const raw = Number.parseInt(whole + fraction, 16);
    const numerator = raw / 4;
    const choices = index === 0 ? source[1].choices : [
      Math.floor(raw / 16) + '/16', numerator + '/64', (raw - 1) + '/256', (raw + 1) + '/256',
    ];
    return {
      prompt: [p(source[1].prompt.replace('3A.5C', input))],
      choices: choices.map(choice => [formula('\\frac{' + choice.replace('/', '}{') + '}', choice)]),
      correctIndex: choices.indexOf(numerator + '/64'),
      explanation: whole + 'を10進数にすると' + Number.parseInt(whole, 16) + '。小数部は' +
        Number.parseInt(fraction, 16) + '/256になる。合わせると' + raw + '/256であり，分子と分母を4で割ると' +
        numerator + '/64になる。',
    };
  });

const weather = ['晴れ', '曇り', '雨'];
const weatherCases = [
  { transitions: [[40, 40, 20], [30, 40, 30], [30, 50, 20]], from: 2, to: 0 },
  { transitions: [[50, 30, 20], [30, 50, 20], [20, 40, 40]], from: 0, to: 1 },
  { transitions: [[30, 50, 20], [40, 30, 30], [10, 30, 60]], from: 1, to: 2 },
  { transitions: [[40, 50, 10], [20, 50, 30], [30, 30, 40]], from: 2, to: 2 },
];
const markov = define(3, '3状態の遷移確率と初日・2日後の天気', weatherCases.length,
  '三つの天気，1日遷移の例示，2日後，％表記を維持。途中状態を一つに絞る，経路を一つ落とす，1日後を用いる誤りと比較する。', index => {
    const { transitions, from, to } = weatherCases[index];
    const paths = transitions[from].map((p, via) => p * transitions[via][to] / 100);
    const sum = paths.reduce((a, b) => a + b);
    const skip = index === 1 ? Math.max(...paths) : Math.min(...paths);
    const choices = index === 0 ? source[3].choices : ordered([Math.max(...paths), sum - skip, transitions[from][to], sum]);
    const row = transitions[0];
    const text = source[3].prompt.replace('40％の確率で晴れ，40％の確率で曇り，20％の確率で雨',
      row[0] + '％の確率で晴れ，' + row[1] + '％の確率で曇り，' + row[2] + '％の確率で雨')
      .replace('雨の2日後が晴れ', weather[from] + 'の2日後が' + weather[to]);
    return choiceBody([p(text), p('単位　％'), visibleTable('天気の翌日への遷移確率', ['', ...weather.map(item => '翌日' + item)],
      transitions.map((row, i) => [weather[i], ...row.map(String)]))], choices, sum,
    '翌日の天気を晴れ，曇り，雨に分け，各経路で2回の遷移確率を掛け合わせる。三つは' +
      paths.join('％，') + '％で，同時に起こらないので合計は' + sum + '％になる。');
  });

const arrivalOrders = ['ABCD', 'BACD', 'DABC', 'DCAB'];
const stack = define(5, 'スタックへ到着する4件の順序', arrivalOrders.length,
  '4件の到着順，一つのスタック，後入れ先出しの制約を固定。候補は同じ四つの記号の順列，先頭のA〜Dの順を維持する。', index => {
    const arrival = arrivalOrders[index];
    const choices = index === 3 ? [...source[5].choices.slice(0, 3), 'D, C, B, A'] : source[5].choices;
    const allowed = (choice: string) => {
      const input = [...arrival].reverse(), stack: string[] = [];
      for (const value of choice.split(', ')) {
        while (stack.at(-1) !== value && input.length) stack.push(input.pop()!);
        if (stack.pop() !== value) return false;
      }
      return true;
    };
    const result = choices.find(allowed)!;
    return choiceBody(source[5].prompt.replace('A, B, C, D', [...arrival].join(', ')), choices, result,
      'スタックに積む操作は到着順に限られ，取り出せるのは最上部の値だけである。' + result +
      'の各値を出すには，その値が最上部に来るまで必要な分だけ積めばよい。他の候補では必要な値を取り出す前に別の値がその上に積まれる。');
  });

const parents = [[0, 1, 1, 3, 3, 5, 5, 5], [0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 1, 2, 2, 3, 4, 5], [0, 1, 1, 1, 1, 1, 1, 1]];
const leaves = define(6, '根と各節点の親を示す8個の配列値', parents.length,
  '1始まりの配列，親番号と根の0，8節点で葉の数を問う。子が0の節点だけを数える。', index => {
    const array = parents[index];
    const nodes = array.map((_, i) => i + 1);
    const leaves = nodes.filter(node => !array.includes(node));
    return choiceBody([p(source[6].prompt), visibleTable('各節点の親を記録した配列', ['i', ...nodes.map(String)],
      [['A[i]', ...array.map(String)]])], source[6].choices, leaves.length,
    '葉は子を持たない節点である。配列に一度でも親番号として現れる節点を除くと，節点' +
      leaves.join('，') + 'が残る。A[k]＝0の0は根を示す記号で，節点として数えない。');
  });

const hashInputs = ['54321', '54140', '63254', '97800'];
const hash = define(7, 'ハッシュ法に渡す5けたの整数', hashInputs.length,
  '5けた，けたの総和，法13，0〜12の配列位置と表示の省略記号を固定する。', index => {
    const input = hashInputs[index], sum = [...input].reduce((total, digit) => total + Number(digit), 0);
    const positions = [['0', ''], ['1', ''], ['2', ''], ['⋮', '⋮'], ['11', ''], ['12', '']];
    return choiceBody([p(source[7].prompt.replace('54321', input)), visibleTable('ハッシュ値と配列位置', ['位置', '配列'], positions)],
      source[7].choices, sum % 13, 'けたを足すと' + [...input].join('＋') + '＝' + sum + '。' + sum +
      'を13で割った余りが' + sum % 13 + 'なので，配列の位置' + sum % 13 + 'に入る。');
  });

const nsCases = [20, 200, 100, 50];
const mips = define(9, '平均命令実行時間（ナノ秒）', nsCases.length,
  'ナノ秒とMIPSの単位，整数の選択肢の昇順を維持し，1000を割り切れる時間にする。', index => {
    const ns = nsCases[index];
    return choiceBody(source[9].prompt.replace('20ナノ秒', ns + 'ナノ秒'), source[9].choices, 1000 / ns,
      '1秒は10億ナノ秒なので，1秒当たりの命令数は10億÷' + ns + '。1 MIPSは毎秒100万命令だから，' +
      '10億÷' + ns + '÷100万＝' + 1000 / ns + ' MIPSになる。');
  });

const diskCases = [[1000, 6000, 10, 10], [2000, 7500, 8, 20], [3000, 5000, 9, 10], [4000, 10000, 11, 20]] as const;
const disk = define(14, 'バイト数・回転数・シーク時間・転送速度', diskCases.length,
  'ミリ秒・バイト・Mバイト/秒，コントローラ時間を含む条件を保持。半回転と一回転，転送時間の1桁の換算違いを小数1桁の昇順で比較する。', index => {
    const [size, rpm, seek, speed] = diskCases[index];
    const rotation = 60_000 / rpm, latency = rotation / 2, transfer = size / (speed * 1000);
    const decimals = ordered([seek + latency + transfer, seek + latency + transfer * 10,
      seek + rotation + transfer, seek + rotation + transfer * 10]).map(value => value.toFixed(1));
    const spec = [['回転数', rpm.toLocaleString('en-US') + '回転／分'], ['平均シーク時間', seek + 'ミリ秒'], ['転送速度', speed + ' Mバイト／秒']];
    return choiceBody([p(source[14].prompt.replace('1,000バイト', size.toLocaleString('en-US') + 'バイト')),
      visibleTable('磁気ディスク装置の仕様', ['項目', '値'], spec)], decimals, (seek + latency + transfer).toFixed(1),
    '1回転は60,000÷' + rpm + '＝' + rotation + 'ミリ秒。平均回転待ち時間はその半分の' + latency +
      'ミリ秒で，転送時間は' + transfer + 'ミリ秒。シーク時間' + seek + 'ミリ秒を加え，合計は' +
      (seek + latency + transfer).toFixed(1) + 'ミリ秒になる。');
  });

const storageStems = [
  source[15].prompt,
  source[15].prompt.replace('NAS（Network Attached Storage）', '各PCがファイルシステムを持ち，ストレージとSAN（Storage Area Network）で結ばれた場合'),
  source[15].prompt.replace('NAS（Network Attached Storage）', 'ストレージ側でファイルシステムを管理し，PCとはLANとは別の専用ネットワークで結ぶ場合'),
  source[15].prompt.replace('NAS（Network Attached Storage）', 'ストレージをLANに接続し，各PC側でファイルシステムを管理する場合'),
];
const storageDescriptions = [
  'NASはストレージ側でファイルシステムを管理し，PCはLAN上でファイルにアクセスする。',
  'LANとは別に専用ネットワークの二重線があり，ファイルシステムを表すだ円は各PCの側にある。',
  '二重線でPCとストレージを接続し，ファイルシステムを表すだ円がストレージ側にある。',
  'ストレージをLANへ直接接続し，各PC側にファイルシステムを表すだ円がある。',
];
const storage = define(15, 'ファイルシステムの所在とアクセス経路', storageStems.length,
  'PC3台，LAN・ストレージ，だ円と二重線を保持。ファイルシステムの管理側と専用網の有無を独立に判定する。', index => ({
    prompt: [p(storageStems[index])], choices: [0, 1, 2, 3].map(i => [draw('storage', i)]), correctIndex: [3, 0, 1, 2][index],
    explanation: storageDescriptions[index] + 'この二つの条件を同時に満たす構成を選ぶ。',
  }));

const metricCases = [
  { names: ['信頼性', '可用性'], rows: [['T', 'S'], ['T', 'T/(T＋S)'], ['T＋S', 'S'], ['T＋S', 'T/(T＋S)']] },
  { names: ['信頼性', '可用性'], rows: [['T', 'S'], ['S', 'S/(T＋S)'], ['T＋S', 'T/(T＋S)'], ['S', 'T/(T＋S)']] },
  { names: ['保守性', '可用性'], rows: [['T', 'T/(T＋S)'], ['S', 'S/(T＋S)'], ['S', 'T/(T＋S)'], ['T＋S', 'T/(T＋S)']] },
  { names: ['信頼性', '保守性'], rows: [['T', 'S'], ['S', 'T'], ['T＋S', 'T'], ['S', 'T＋S']] },
];
const reliability = define(17, '時間区間の記号と問うRASISの指標', metricCases.length,
  '故障と回復の矢印，tとsの平均の定義，二指標の組合せ表，時間区間の意味を固定する。保守性では修理時間の指標MTTRを用いる。', index => {
    const { up, down } = recoveryCases[index], { names, rows } = metricCases[index];
    const values: Record<string, string> = { 信頼性: up.toUpperCase(), 保守性: down.toUpperCase(), 可用性: up.toUpperCase() + '/(T＋S)' };
    const answer = names.map(name => values[name]);
    const stem = source[17].prompt.replace('信頼性（Reliability）と可用性（Availability）',
      names.map(name => name + ({ 信頼性: '（Reliability）', 保守性: '（Serviceability）', 可用性: '（Availability）' }[name] ?? '')).join('と'));
    return {
      prompt: [p(stem + 'ここで，次のとおりとする。'),
        formula('T=\\frac{1}{n}\\sum_{i=1}^{n}t_i,\\quad S=\\frac{1}{n}\\sum_{i=1}^{n}s_i', 'Tはt₁からtₙまでの平均，Sはs₁からsₙまでの平均。'),
        draw('recovery', index)],
      choices: rows.map(row => [visibleTable('RASISの指標の組合せ', names, [row])]),
      correctIndex: rows.findIndex(row => row.every((value, i) => value === answer[i])),
      explanation: '図で回復から次の故障までの平均稼働時間は' + values.信頼性 + '，故障から回復までの平均修理時間は' +
        values.保守性 + 'である。可用性を稼働時間の割合で表すと' + values.可用性 +
        'になる。したがって' + names[0] + 'は' + answer[0] + '，' + names[1] + 'は' + answer[1] + '。',
    };
  });

const rates = [[0.9, 0.8], [0.8, 0.7], [0.9, 0.6], [0.7, 0.5]];
const availability = define(19, '2組の並列部分の装置の稼働率', rates.length,
  '並列組二つの直列接続，A/CとB/Dはそれぞれ同じ確率，少なくとも1台が稼働する条件を保持する。原問と同じ小数2桁の最も近い候補を問う。', index => {
    const [a, b] = rates[index];
    const first = 1 - (1 - a) ** 2, second = 1 - (1 - b) ** 2, product = first * second;
    const candidates = index === 0 ? source[19].choices :
      ordered([a * b, 1 - (1 - a * b) ** 2, product, 1 - (1 - a) * (1 - b)]).map(value => value.toFixed(2));
    const stem = source[19].prompt.replace('AとCが0.9，BとDが0.8', 'AとCが' + a + '，BとDが' + b);
    return choiceBody([p(stem), draw('series', 0)], candidates, product.toFixed(2),
      '左の並列部分は両方が止まる場合だけ停止し，稼働率は1−(1−' + a + ')²＝' + first.toFixed(2) +
      '。右は1−(1−' + b + ')²＝' + second.toFixed(2) + '。両方が稼働する必要があるので積は' +
      product.toFixed(4) + 'となり，最も近い候補は' + product.toFixed(2) + 'である。');
  });

const resources = define(20, 'CPUと資源Rの各処理時間', taskDurations.length,
  'CPU2台と排他資源1個，同時開始，実行順序と開始時点の空きを維持する。各タスクがRを要求する時刻の先後を変える。', index => {
    const durations = taskDurations[index];
    const first = durations[0][0] < durations[1][0] ? 0 : 1;
    const complete = (first: number) => {
      const a = durations[first], b = durations[1 - first];
      const aDone = a[0] + a[1];
      const bDone = Math.max(aDone, b[0]) + b[1];
      return { ends: [aDone + a[2], bDone + b[2]], aDone, bDone };
    };
    const { ends, aDone, bDone } = complete(first), end = Math.max(...ends);
    const choices = index === 0 ? source[20].choices : ordered([
      Math.max(...durations.map(row => row.reduce<number>((a, b) => a + b, 0))),
      end, Math.max(...complete(1 - first).ends), durations.flat().reduce<number>((a, b) => a + b, 0),
    ]);
    return choiceBody([p(source[20].prompt), draw('resources', index)], choices, end,
      '二つのタスクがそれぞれCPUを使い，タスク' + 'AB'[first] + 'が先にRを要求する。' +
      'Rの使用が終わる時刻は' + aDone + 'と' + bDone + 'ミリ秒。そこから最後のCPU処理を行うと，終了は' +
      ends.join('と') + 'ミリ秒となる。両方が終了するのは遅い方の' + end + 'ミリ秒後である。');
  });

const circuit = define(24, '否定器の後段と最終段の論理素子', logicCircuits.length,
  '二つの否定器，1個の中段素子，二つの論理積と1個の最終段素子，分岐線，式中の否定線と積和・和積の構成を保持する。原問イ・エは互いに同値だがいずれも回路の誤答。', index => {
    const { middle, final } = logicCircuits[index];
    return {
      prompt: [p(source[24].prompt), draw('circuit', index)],
      choices: [0, 1, 2, 3].map(i => [draw('expression', 4 * index + i)]), correctIndex: [2, 1, 2, 1][index],
      explanation: 'AとBをそれぞれ反転し，その値を' + middle + 'に入れる。中段の出力をA，Bそれぞれと論理積にし，' +
        'その二つの値を' + final + 'に入力する。入力00，01，10，11の順にXは' +
        ['0，1，1，0', '1，0，0，1', '0，1，1，1', '1，1，1，0'][index] + 'となり，これと同じ真理値表を持つ式が答えである。',
    };
  });

const lamp = define(25, '回路の入力信号の極性と照明の点灯条件', lampCases.length,
  'A又はBだけを切り替えると他方に関わらず点灯・消灯が切り替わる条件を維持する。派生では信号の反転と，同じスイッチ位置での点灯状態を明示する。', index => {
    const { invert, equalLights } = lampCases[index];
    const reverse = invert[0] !== invert[1];
    const gate = reverse !== equalLights ? '論理一致' : 'XOR';
    const [ask, condition, setup] = source[25].prompt.split('\n');
    const details = index === 0 ? setup : setup + 'スイッチの位置を0又は1で表し，両方が同じ位置のとき照明を' +
      (equalLights ? '点灯' : '消灯') + 'させる。図のとおり，回路の手前で' +
      (invert[0] && invert[1] ? 'AとBの信号をそれぞれ' : invert[0] ? 'Aの信号だけを' : 'Bの信号だけを') + '反転する。';
    const choices = index === 0 ? source[25].choices : ['AND', 'NAND', '論理一致', 'XOR'];
    return choiceBody([p(ask), p(condition), p(details), draw('lamps', index)], choices, gate,
      '片方の位置を変えるたびに点灯状態が反転するには，二つの入力の一致・不一致で出力が決まる必要がある。' +
      (index === 0 ? '四つの候補の中でこれを満たすのはXORである。' : '図の信号反転を考慮すると，論理回路は二つの入力が' +
        (gate === 'XOR' ? '異なるとき' : '等しいとき') + 'に点灯信号を出すので，' + gate + 'になる。'));
  });

export const calculation2010AutumnAm0126 = [
  hexadecimal, markov, stack, leaves, hash, mips, disk, storage, reliability, availability, resources, circuit, lamp,
];
