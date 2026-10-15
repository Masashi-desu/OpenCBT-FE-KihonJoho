import { calculationChoices } from "./calculation-options";

export const fractionBases = [2, 8, 10, 16] as const;

// Eighths terminate in all four bases: at most three binary/decimal places,
// or one octal/hexadecimal place. No rounding or recurring notation is needed.
function eighthInBase(numerator: number, base: number) {
  let remainder = numerator;
  let digits = "";
  do {
    remainder *= base;
    digits += Math.floor(remainder / 8).toString(base).toUpperCase();
    remainder %= 8;
  } while (remainder);
  return `0.${digits}`;
}

export function radixFraction(values: number[]) {
  const [from, to, numerator] = values;
  const raw = eighthInBase(numerator, from);
  const decimal = numerator / 8;
  // Preserve the reviewed source choices for the decimal baseline. In other
  // bases, model swapped binary weights, complement confusion and omitted or
  // added weights. Filter collisions before taking three distinct distractors.
  const reversed = ((numerator & 1) << 2) | (numerator & 2) | (numerator >> 2);
  const mistakes = [...new Set([
    reversed,
    ((numerator << 1) & 7) | (numerator >> 2),
    (numerator >> 1) | ((numerator & 1) << 2),
    8 - numerator,
    numerator ^ 4,
    numerator ^ 2,
    numerator ^ 1,
  ])].filter(n => n > 0 && n !== numerator).slice(0, 3);
  let answers = to === 10
    ? calculationChoices("2023-a-1", decimal)
    : [numerator, ...mistakes].map(n => eighthInBase(n, to));
  const width = Math.max(...answers.map(a => a.length));
  answers = answers.map(a => a.padEnd(width, "0"));
  const digits = raw.slice(2);
  const weights = [...digits].map((digit, i) =>
    `${parseInt(digit, from)}×${from}の−${i + 1}乗`).join("＋");
  const steps: string[] = [];
  if (to !== 10) {
    let remainder = numerator;
    do {
      const product = remainder * to / 8;
      const digit = Math.floor(product);
      steps.push(`${remainder / 8}×${to}＝${product}（整数部分${digit}${digit >= 10 ? `は${digit.toString(to).toUpperCase()}` : ""}）`);
      remainder = remainder * to % 8;
    } while (remainder);
  }
  return {
    prompt: `${from}進小数${raw}を${to}進小数に変換したものはどれか。`,
    answers,
    explanation: `${from}進小数の小数点以下の各桁は、左から${from}の−1乗、−2乗、…の重みをもつ。${weights}＝${decimal}（10進数）。${to === 10 ? "" : `小数部分に変換先の基数${to}を繰り返し掛け、整数部分を順に並べる。${steps.join("、")}。`}したがって、${from}進小数${raw}＝${to}進小数${answers[0]}。`,
  };
}
