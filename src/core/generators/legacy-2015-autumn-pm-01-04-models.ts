/** Values shared by the generated prompts, their answer choices and their drawings. */
export const autumn2015Pm1Limits = [5, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

export const autumn2015Pm2CaseCount = 12;
const inputValues = [0.625, 1.25, 1.5, 0.75];
const decodeValues = [0.75, 1.5, 0.375, 0.5];
const exponentValues = [5, 4, 3, 6];
const factorShifts = [[3, 1], [2, 0], [2, 1]] as const;

export function autumn2015Pm2Inputs(index: number) {
  const variant = index % exponentValues.length;
  const exponent = exponentValues[variant];
  const [firstShift, secondShift] = factorShifts[Math.floor(index / exponentValues.length)];
  return {
    input: inputValues[variant], decodeValue: decodeValues[variant], exponent,
    firstShift, secondShift, a: 1.5 * 2 ** exponent, b: -1.5 * 2 ** (exponent - 1),
  };
}

export function autumn2015Pm2Word(value: number) {
  if (value === 0) return 0;
  const sign = value < 0 ? 1 : 0;
  const magnitude = Math.abs(value);
  const exponent = Math.floor(Math.log2(magnitude));
  const fraction = Math.floor((magnitude / 2 ** exponent - 1) * 2 ** 23);
  return sign * 2 ** 31 + (exponent + 127) * 2 ** 23 + fraction;
}

export function autumn2015Pm2Words(index: number) {
  const c = autumn2015Pm2Inputs(index);
  const product = c.a * (2 ** c.firstShift + 2 ** c.secondShift);
  const bits = autumn2015Pm2Word(product);
  const exponent = (bits >>> 23) & 255;
  const fraction = bits & 0x7fffff;
  const erroneousFraction = fraction ^ 0x080000;
  return [c.decodeValue, c.a, c.b].map(autumn2015Pm2Word).concat(
    [exponent - 127, exponent, exponent + 1].flatMap(candidateExponent =>
      [fraction, erroneousFraction].map(candidateFraction => candidateExponent * 2 ** 23 + candidateFraction)),
  );
}

export const autumn2015Pm2VisibleBits = [31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, '…', 0] as const;
export function autumn2015Pm2VisibleWord(word: number) {
  return autumn2015Pm2VisibleBits.map(bit => bit === '…' ? bit : (word >>> bit) & 1);
}

export const autumn2015Pm3CaseCount = 12;
const recallWindows = [
  { start: '20150110', end: '20150120', example: '20150115' },
  { start: '20160226', end: '20160302', example: '20160229' },
  { start: '20191229', end: '20200102', example: '20191231' },
  { start: '20151103', end: '20151109', example: '20151106' },
] as const;
const recallProducts = [
  { component: '007551', package: '009220', price: 80, quantity: 400, packagePrice: 400, perPackage: 3 },
  { component: '005183', package: '009223', price: 120, quantity: 300, packagePrice: 500, perPackage: 2 },
  { component: '002460', package: '009224', price: 90, quantity: 200, packagePrice: 450, perPackage: 4 },
] as const;
export function autumn2015Pm3Inputs(index: number) {
  return { ...recallWindows[index % recallWindows.length], ...recallProducts[Math.floor(index / recallWindows.length)] };
}

type SourceTable = { name: string; columns: string[]; keys: number[]; rows: (string | number)[][] };
export function autumn2015Pm3Tables(index: number, stage: number): SourceTable[] {
  const c = autumn2015Pm3Inputs(index);
  const parts: SourceTable = { name: '部品表', columns: ['部品番号', '部品名', '単価'], keys: [0], rows: stage === 0
    ? [[c.component, 'スイッチ', c.price]]
    : [[c.package, 'スイッチモジュール', c.packagePrice]] };
  if (stage === 1) return [parts, {
    name: 'パッケージ表', columns: ['部品番号', '同梱部品', '同梱点数'], keys: [0, 1],
    rows: [[c.package, '000058', 1], [c.package, c.component, c.perPackage]],
  }];
  return [{
    name: '顧客表', columns: ['顧客番号', '顧客名', '住所', '代表電話'], keys: [0],
    rows: [['0181', '情報電機株式会社', '東京都文京区本駒込○○－△', '99-9999-9999']],
  }, parts, {
    name: '出荷表', columns: ['出荷番号', '顧客番号', '部品番号', '出荷数', '出荷金額', '出荷日'], keys: [0],
    rows: [['150412', '0181', c.component, c.quantity, c.price * c.quantity, c.example],
      ['150413', '0059', '000890', 100, 48000, c.example]],
  }];
}

const referenceDomains = ['example.com', 'foo.example.com', 'www.foo.example.com', 'www.example.com', 'www.bar.example.com'];
const domainBoundary = ['com', 'foo.example.com', 'www.notfoo.example.com', 'www.bar.example.com', 'notfoo.example.com'];
const domainOrg = ['org', 'example.com', 'foo.example.org', 'example.org', 'shop.example.org'];
type CookieInput = { response: string; next: string; domains: readonly string[] };
export const autumn2015Pm4Cases: readonly CookieInput[] = [
  { response: 'www.foo.example.com', next: 'www.bar.example.com', domains: referenceDomains },
  { response: 'www.foo.example.com', next: 'foo.example.com', domains: referenceDomains },
  { response: 'www.bar.example.com', next: 'orders.www.bar.example.com', domains: referenceDomains },
  { response: 'api.notfoo.example.com', next: 'orders.notfoo.example.com', domains: domainBoundary },
  { response: 'api.shop.example.org', next: 'shop.example.org', domains: domainOrg },
  { response: 'api.foo.example.com', next: 'www.bar.example.com', domains: referenceDomains },
  { response: 'api.foo.example.com', next: 'www.foo.example.com', domains: referenceDomains },
  { response: 'foo.example.com', next: 'example.com', domains: referenceDomains },
  { response: 'www.example.com', next: 'www.foo.example.com', domains: referenceDomains },
  { response: 'www.foo.example.com', next: 'orders.foo.example.com', domains: ['example.com', 'foo.example.com', 'com', 'www.foo.example.com', 'www.foo.example.com'] },
  { response: 'shop.example.org', next: 'example.org', domains: ['shop.example.org', 'org', 'example.com', 'example.org', 'example.org'] },
  { response: 'store.api.notfoo.example.com', next: 'api.notfoo.example.com', domains: ['com', 'foo.example.com', 'store.api.notfoo.example.com', 'www.bar.example.com', 'notfoo.example.com'] },
];

export function autumn2015Pm4Cookies(index: number) {
  return autumn2015Pm4Cases[index].domains.map((domain, i) => ({ name: 'c' + (i + 1), domain }));
}
