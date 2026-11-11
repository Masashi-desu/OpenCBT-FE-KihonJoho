type Row = readonly [line: number, indent: number, code: string, comment?: string];
type Rail = readonly [start: number, end: number];
export type NewtonProgram = {
  rows: readonly Row[];
  rails: readonly Rail[];
  omitted?: readonly { start: number; end: number; indent: number; label: string }[];
};
export const newtonPrograms = {
  '8-program-1': {
    rows: [
      [1,0,'○主プログラム：プログラム1'],[2,0,'○整数型：i'],[3,0,'○実数型：d, f, x'],[4,0,'○実数型：a3, a2, a1, a0, b2, b1, b0'],
      [5,0,'・read(x, a3, a2, a1, a0)','/* x, a3〜a0の値を読み込む。 */'],
      [6,0,'・b2 ← 3.0 × a3'],[7,0,'・b1 ← 2.0 × a2'],[8,0,'・b0 ← a1'],
      [9,1,'i: 1, i ≦ 100, 1','/* 繰返し回数は100回とする。 */'],
      [10,2,'・f ← ((a3 × x + a2) × x + a1) × x + a0'],
      [11,2,'・d ← (b2 × x + b1) × x + b0'],
      [12,2,'・print(x, f, d)','/* x, f, dの値を印字する。 */'],
      [13,2,'・x ← x − f ÷ d'],[14,0,''],[15,0,'/* プログラム1の終わり */'],
    ], rails: [[9,14]],
  },
  '8-program-2': {
    rows: [
      [1,0,'○主プログラム：プログラム2'],[2,0,'○整数型：i, k, n','/* 1 ≦ n ≦ 9 とする。 */'],
      [3,0,'○実数型：d, f, x'],[4,0,'○実数型：a[10], b[10]','/* 添字は0から始まる。 */'],
      [5,0,'・read(n, x)','/* n, xの値を読み込む。 */'],
      [6,1,'k: n, k ≧ 0, −1','/* kをn, n−1, …, 0として繰り返し， */'],
      [7,2,'・read(a[k])','/* 係数a[k]の値を順に読み込む。 */'],[8,0,''],
      [9,0,''],[10,0,''],[11,0,''],
      [12,1,'i: 1, i ≦ 100, 1','/* 繰返し回数は100回とする。 */'],
      [13,0,''],[14,0,''],[15,0,''],[16,0,''],[17,0,''],[18,0,''],
      [19,2,'・print(x, f, d)','/* x, f, dの値を印字する。 */'],
      [20,2,'・x ← x − f ÷ d'],[21,0,''],[22,0,'/* プログラム2の終わり */'],
    ], rails: [[6,8],[12,21]], omitted: [
      {start:9,end:11,indent:0,label:'手順(2)の処理'},
      {start:13,end:18,indent:2,label:'手順(3)の①と②の処理'},
    ],
  },
  '8-b': {
    rows: [
      [9,1,'k: n, k ≧ 1, −1','/* kをn, n−1, …, 1として繰り返す。 */'],
      [10,2,'・［b］'],[11,0,''],
    ], rails: [[9,11]],
  },
  '8-cd': {
    rows: [
      [13,0,'・f ← a[n] × x + a[n−1]'],[14,0,'・d ← ［c］'],
      [15,1,'k: n−2, k ≧ 0, −1','/* kをn−2, n−3, …, 0として繰り返す。 */'],
      [16,2,'・f ← f × x + a[k]'],[17,2,'・d ← d × x + ［d］'],[18,0,''],
    ], rails: [[15,18]],
  },
} satisfies Record<string, NewtonProgram>;
export type ProgramId = keyof typeof newtonPrograms;
export const programAlt = (program: NewtonProgram) =>
  program.rows.map(([number, indent, code, comment]) => number + ' ' + '　'.repeat(indent) + code + (comment ? '　' + comment : ''))
    .join('\n') + (program.omitted?.map(omission => '\n' + omission.start + '〜' + omission.end + '　' + omission.label).join('') ?? '') +
    '\n' + program.rails.map(([start,end]) => start + '行目から' + end + '行目は繰返し。').join('');

export const coefficientArrays = [
  { label:'配列a', columns:['0','1','2','…','n−1','n','…'], cells:['a₀','a₁','a₂','…','aₙ₋₁','aₙ','…'] },
  { label:'配列b', columns:['0','1','…','n−3','n−2','n−1','…'], cells:['1×a₁','2×a₂','…','(n−2)×aₙ₋₂','(n−1)×aₙ₋₁','n×aₙ','…'] },
] as const;

const originalCubic = [
  ['2.500000','−2.625000','2.750000'],
  ['3.454545','4.969947','14.07438'],
  ['3.101425','8.741682(−1)','9.247965'],
  ['3.006900','5.548452(−2)','8.082941'],
  ['3.000035','2.833717(−4)','8.000425'],
  ['3.000000','7.527369(−9)','8.000000'],
  ['3.000000','0.000000','8.000000'],
  ['3.000000','0.000000','8.000000'],
];
const originalQuartic = [
  ['2.000010','−3.552714(−15)','3.996803(−15)'],
  ['2.888899','6.243232(−1)','2.809423'],
  ['2.666674','1.975398(−1)','1.185225'],
  ['2.500006','6.250281(−2)','5.000169(−1)'],
  ['2.375004','1.977628(−2)','2.109446(−1)'],
];
const conditions = [
  { cubic:[1,-3,-1,3], roots:[3,1,-1], start:2.5, quarticRoot:2, units:1, comparison:[6,7] },
  { cubic:[1,-6,8,0], roots:[4,2,0], start:3.75, quarticRoot:3, units:3, comparison:[6,7] },
  { cubic:[1,-9,23,-15], roots:[5,3,1], start:4.5, quarticRoot:4, units:1, comparison:[6,7] },
  { cubic:[1,-12,44,-48], roots:[6,4,2], start:5.75, quarticRoot:5, units:1, comparison:[5,6] },
] as const;

const polynomial = (coefficients: readonly number[], x: number) =>
  coefficients.reduce((acc, coefficient) => acc * x + coefficient);
const formatNumber = (value: number) => {
  if (value === 0) return '0.000000';
  if (Math.abs(value) >= 1) return value.toPrecision(7).replace('-', '−');
  const [mantissa, exponent] = value.toExponential(6).split('e');
  return mantissa.replace('-', '−')+'('+exponent.replace('-', '−')+')';
};
function calculate(coefficients: readonly number[], initial: number, count: number) {
  const degree = coefficients.length - 1;
  const derivative = coefficients.slice(0,-1).map((coefficient, index) => coefficient*(degree-index));
  let x = initial;
  return Array.from({length:count}, () => {
    const f = polynomial(coefficients,x), d = polynomial(derivative,x);
    const row = [x,f,d].map(formatNumber);
    x -= f/d;
    return row;
  });
}

export function partialFormula(values: readonly number[], x: number) {
  let partial = values[0].toFixed(1);
  for (const coefficient of values.slice(1,-1)) {
    partial = '('+partial+' × '+x+(coefficient < 0 ? ' − ' : ' ＋ ')+Math.abs(coefficient).toFixed(1)+')';
  }
  return partial+' × '+x;
}

export function newtonAt(index: number) {
  const c = conditions[index], r = c.quarticRoot;
  const quartic = [1,-4*r,6*r*r,-4*r**3,r**4];
  const near = Number(r+'.'+String(c.units).padStart(5,'0'));
  const cubicRows = index === 0 ? originalCubic : calculate(c.cubic,c.start,8);
  const quarticRows = index === 0 ? originalQuartic : calculate(quartic,near,5);
  const residual = c.units ** 4;
  const exactA = '−' + (quartic[4]-1) + '.' + String(10n**20n-BigInt(residual)).padStart(20,'0');
  const fNotation = formatNumber(residual/10**20);
  const intermediate = index === 0 ? '−16.00000' : formatNumber(polynomial(quartic.slice(0,-1),near)*near);
  const exactF = residual === 1 ? '10⁻²⁰' : (residual/10)+'×10⁻¹⁹';
  return { ...c, quartic, near, cubicRows, quarticRows, exactA, exactF, fNotation, intermediate };
}
