import { calculationChoices } from "./calculation-options";

export const fractionBases = [2, 8, 10, 16] as const;

// Eighths terminate in all four bases: at most three binary/decimal places,
// or one octal/hexadecimal place. No rounding or recurring notation is needed.
function eighthInBase(numerator: number, base: number, integer = 0) {
  let remainder = numerator;
  let digits = "";
  do {
    remainder *= base;
    digits += Math.floor(remainder / 8).toString(base).toUpperCase();
    remainder %= 8;
  } while (remainder);
  return `${integer.toString(base).toUpperCase()}.${digits}`;
}

export function radixFraction(values: number[]) {
  const [from, to, numerator, integer] = values;
  const raw = eighthInBase(numerator, from, integer);
  const decimal = integer + numerator / 8;
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
    ? calculationChoices("2023-a-1", numerator / 8).map(n => String(Number((integer + Number(n)).toFixed(3))))
    : [numerator, ...mistakes].map(n => eighthInBase(n, to, integer));
  if (integer > 0) {
    // One distractor omits the source integer's leading digit. The other two
    // retain the reviewed fractional mistakes, so both parts matter.
    const integerDigits = integer.toString(from);
    const omitted = parseInt(integerDigits.slice(1) || "0", from);
    answers[3] = eighthInBase(numerator, to, omitted);
  }
  const places = Math.max(...answers.map(a => a.split(".")[1].length));
  answers = answers.map(a => {
    const [whole, fraction] = a.split(".");
    return `${whole}.${fraction.padEnd(places, "0")}`;
  });
  const [whole, digits] = raw.split(".");
  const weights = [
    ...(integer ? [...whole].map((digit, i) =>
      `${parseInt(digit, from)}×${from}の${whole.length - i - 1}乗`) : []),
    ...[...digits].map((digit, i) =>
      `${parseInt(digit, from)}×${from}の−${i + 1}乗`),
  ].join("＋");
  const integerSteps: string[] = [], steps: string[] = [];
  if (to !== 10) {
    if (integer > 0) {
      let quotient = integer;
      do {
        const remainder = quotient % to;
        integerSteps.push(`${quotient}÷${to}＝${Math.floor(quotient / to)} 余り${remainder}${remainder >= 10 ? `（${remainder.toString(to).toUpperCase()}）` : ""}`);
        quotient = Math.floor(quotient / to);
      } while (quotient);
    }
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
    explanation: `${integer ? `整数部分の各桁は、右から${from}の0乗、1乗、…の重みをもつ。` : ""}${from}進小数の小数点以下の各桁は、左から${from}の−1乗、−2乗、…の重みをもつ。${weights}＝${decimal}（10進数）。${integerSteps.length ? `整数部分を変換先の基数${to}で繰り返し割り、余りを逆順に並べる。${integerSteps.join("、")}。` : ""}${to === 10 ? "" : `小数部分に変換先の基数${to}を繰り返し掛け、整数部分を順に並べる。${steps.join("、")}。`}したがって、${from}進小数${raw}＝${to}進小数${answers[0]}。`,
  };
}
