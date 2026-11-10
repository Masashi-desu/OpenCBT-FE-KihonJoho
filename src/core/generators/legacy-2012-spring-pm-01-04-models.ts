const powerGlyphs: Record<string, string> = { '−': '⁻', '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export const power = (exponent: number) => [...String(exponent)].map(char => powerGlyphs[char]).join('');

export const floatingCases = [
  { encodedExponent: 5, numerator: 11, lowerNumerator: 3, a: 1.25, b: 1.5, exponent: 5,
    aligned: ['0.011', '0.101', '0.11', '1.01', '1.1'], products: ['1.0', '1.11', '1.1101', '1.111', '1.1111'] },
  { encodedExponent: 6, numerator: 13, lowerNumerator: 5, a: 1.5, b: 1, exponent: 4,
    aligned: ['0.01', '0.1', '0.11', '1.0', '1.1'], products: ['1.0', '1.01', '1.1', '1.11', '1.111'] },
  { encodedExponent: 7, numerator: 9, lowerNumerator: 7, a: 1.5, b: 1.5, exponent: 6,
    aligned: ['0.011', '0.101', '0.11', '1.01', '1.1'], products: ['1.0', '1.001', '1.01', '1.1', '1.111'] },
  { encodedExponent: 8, numerator: 15, lowerNumerator: 3, a: 1.125, b: 1.25, exponent: 4,
    aligned: ['0.01', '0.101', '0.11', '1.001', '1.01'], products: ['1.00101', '1.01', '1.011', '1.01101', '1.1'] },
] as const;

export function binaryFraction(value: number) {
  const text = value.toString(2);
  return text.includes('.') ? text : text + '.0';
}
export function normalize(value: number) {
  const exponent = Math.floor(Math.log2(value));
  return { fraction: value / 2 ** exponent, exponent };
}

const bits = (value: number, width: number) => value.toString(2).padStart(width, '0');
export function floatWord(exponent: number, fraction: number) {
  return '0' + bits(exponent + 127, 8) + bits((fraction - 1) * 2 ** 23, 23);
}

export function floatingData(index: number) {
  const { encodedExponent, numerator, lowerNumerator, a, b, exponent, aligned, products } = floatingCases[index];
  const bExponent = exponent - 1;
  const difference = normalize(a * 2 ** exponent - b * 2 ** bExponent);
  const product = normalize(a * b * 2 ** (exponent + bExponent));
  const exponentChoices = [exponent - 2, exponent - 1, exponent, exponent + 1, bExponent + 127, exponent + 127];
  const displayExponent = encodedExponent - 127;
  const numberOptions = [lowerNumerator, numerator].flatMap(mantissa =>
    [displayExponent - 3, displayExponent, encodedExponent, encodedExponent + 127].map(exp => mantissa + '×2' + power(exp)));
  const differenceOptions = ['0'.repeat(32), ...[bExponent, exponent, exponent + 1].flatMap(exp =>
    [floatWord(exp, 1), floatWord(exp, 1.5)])];
  return { a, b, exponent, bExponent, numerator, displayExponent, difference, product, aligned, products, numberOptions, exponentChoices,
    bitWords: [floatWord(-1, 1.5), floatWord(displayExponent, numerator / 8), floatWord(exponent, a), floatWord(bExponent, b), ...differenceOptions] };
}

export const optimizationNames = [
  '関数のインライン展開', '共通部分式の削除', '定数の畳込み', '定数伝播', '無用命令の削除', 'ループ内不変式の移動', 'ループのアンローリング',
];
export const optimizationDescriptions = [
  '関数を呼び出す箇所に，呼び出される関数のプログラムを展開する。',
  '同じ式が複数の箇所に存在し，それらの式で使用している変数の値が変更されず，式の値が変化しないとき，その式の値を作業用変数に格納する文を追加し，複数の同じ式をその作業用変数で置き換える。',
  'プログラム中の定数同士の計算式を，その計算結果で置き換える。',
  '変数を定数で置き換える。',
  'プログラムの実行結果に影響しない文を削除する。',
  'ループ中で値の変化しない式があるとき，その式をループの外に移動する。',
  'ループ中の繰返しの処理を展開する。',
];

export const originalProgram = '■ i: 0, i ≦ 1, 1\n│  • x[i] ← y[i] + m + n\n│  • v[i] ← w[i] + m + n\n■';
export const optimizedPrograms = [
  '■ i: 0, i ≦ 1, 1\n│  • t ← m + n\n│  • x[i] ← y[i] + t\n│  • v[i] ← w[i] + t\n■',
  '• t ← m + n\n■ i: 0, i ≦ 1, 1\n│  • x[i] ← y[i] + t\n│  • v[i] ← w[i] + t\n■',
  '• t ← m + n\n• x[0] ← y[0] + t\n• v[0] ← w[0] + t\n• x[1] ← y[1] + t\n• v[1] ← w[1] + t\n• i ← 2',
];

export const optimizerCases = [
  { argument: 10, threshold: 10, onTrue: 5, onFalse: 15, operands: [307000000, 305000000, -303000000, 4] },
  { argument: 8, threshold: 10, onTrue: 7, onFalse: 16, operands: [612000000, 609000000, -604000000, 8] },
  { argument: 12, threshold: 10, onTrue: 3, onFalse: 14, operands: [-185000000, -183000000, 181000000, -2] },
  { argument: 9, threshold: 11, onTrue: 4, onFalse: 13, operands: [272000000, 267000000, -266000000, 6] },
] as const;

export const signedDisplay = (value: number) => value.toFixed(1).replace('-', '−');

export function optimizerData(index: number) {
  const { argument, threshold, onTrue, onFalse, operands } = optimizerCases[index];
  const [y0, y1, m, n] = operands.map(Math.fround), sum = Math.fround(m + n);
  const without = [y0, y1].map(value => Math.fround(Math.fround(value + m) + n));
  const withOptimization = [y0, y1].map(value => Math.fround(value + sum));
  const condition = argument >= threshold;
  const result = argument + (condition ? onTrue : onFalse);
  const panels = [
    '○整数型：r\n     ⋮\n• r ← func(' + argument + ')\n     ⋮',
    '○整数型：r\n     ⋮\n▲ ' + argument + ' ≧ ' + threshold + '\n│   • #w ← ' + argument + ' + ' + onTrue +
      '\n├────\n│   • #w ← ' + argument + ' + ' + onFalse + '\n▼\n• r ← #w\n     ⋮',
    '○整数型：r\n     ⋮\n▲ ' + condition + '\n│   • #w ← ' + (argument + onTrue) + '\n├────\n│   • #w ← ' +
      (argument + onFalse) + '\n▼\n• r ← #w\n     ⋮',
    '○整数型：r\n     ⋮\n• r ← ' + result + '\n     ⋮',
  ];
  const func = '○整数型関数：func(整数型：p)\n○整数型：w\n▲ p ≧ ' + threshold +
    '\n│   • w ← p + ' + onTrue + '     /* p + ' + onTrue + 'の結果を返す */\n├────\n│   • w ← p + ' +
    onFalse + '    /* p + ' + onFalse + 'の結果を返す */\n▼\n• return w';
  return { argument, threshold, operands, without, withOptimization, result, panels, func };
}

type LunchTable = { title: string; columns: string[]; keyColumns: number[]; rows: string[][] };
export const canteenCases = [
  { invoice: '03100186', staff: '050221', day: '20120310', foods: ['ごはん', '肉じゃが'],
    codes: ['0001', '0002'], prices: [100, 280], plates: [1, 1], period: '', calories: 0 },
  { invoice: '03140124', staff: '050314', day: '20120314', foods: ['みそ汁', '焼き魚'],
    codes: ['0011', '0012'], prices: [80, 340], plates: [2, 1], period: '指定した1週間', calories: 220 },
  { invoice: '04010238', staff: '050809', day: '20120401', foods: ['サラダ', '豆腐ハンバーグ'],
    codes: ['0021', '0022'], prices: [160, 300], plates: [1, 2], period: '指定した1か月', calories: 350 },
  { invoice: '04040108', staff: '051206', day: '20120404', foods: ['小鉢', 'カレー'],
    codes: ['0031', '0032'], prices: [120, 450], plates: [3, 1], period: '指定した2週間', calories: 500 },
] as const;

export function canteenTables(index: number, expanded: boolean): LunchTable[] {
  const { invoice, staff, day, foods, codes, prices, plates } = canteenCases[index];
  const amount = String(prices[0] * plates[0] + prices[1] * plates[1]);
  if (!expanded) return [
    { title: '精算表', columns: ['社員番号', '日付', '精算額'], keyColumns: [], rows: [[staff, day, amount]] },
  ];
  return [
    { title: '精算表', columns: ['精算コード', '社員番号', '日付', '精算額'], keyColumns: [0], rows: [[invoice, staff, day, amount]] },
    { title: '明細表', columns: ['精算コード', '料理コード', '皿数'], keyColumns: [0, 1],
      rows: codes.map((code, i) => [invoice, code, String(plates[i])]) },
    { title: '料理表', columns: ['料理コード', '料理名', '単価'], keyColumns: [0],
      rows: codes.map((code, i) => [code, foods[i], String(prices[i])]) },
  ];
}

export const transferCases = [
  { tx: 10, latency: 100 }, { tx: 8, latency: 71 }, { tx: 12, latency: 90 }, { tx: 11, latency: 110 },
] as const;
export function transferData(index: number) {
  const { tx, latency } = transferCases[index];
  const gap = 0.5, ack = 0.5, payload = 1, packet = 1.2, packets = 1000;
  const step = tx + gap, cycle = tx + latency + ack + gap, window = Math.ceil(cycle / step);
  const perOne = cycle * packets / 1000, perTwo = cycle * (packets / 2) / 1000, fastest = step * packets / 1000;
  const round1 = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;
  const times = [tx / packet, step / packet, tx, fastest, perTwo / packet, latency / 2, perTwo, perOne / packet, latency, perOne]
    .map(round1).sort((a, b) => a - b).map(String);
  const buffers = [window - 2, window - 1, window, (window - 2) * packet, (window - 1) * packet, window * packet, (window + 1) * packet]
    .map(round1).sort((a, b) => a - b).map(String);
  return { tx, latency, gap, ack, payload, packet, step, cycle, window, perOne, perTwo, fastest, times, buffers };
}
