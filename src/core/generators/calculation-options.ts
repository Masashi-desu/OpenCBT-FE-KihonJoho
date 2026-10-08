// Reviewed against the IPA question booklets (2023–2026) on 2026-10-08.
// Values are in correct-first order. Relative option spacing is an authoring
// constraint, not a psychometric estimate of exam difficulty.
type Profile = {
  values: number[];
  digits: number;
  quantum: number;
  maximum?: number;
  fixedDigits?: boolean;
};
const profiles: Record<string, Profile> = {
  "2023-a-1": {
    values: [0.75, 0.12, 0.55, 0.84],
    digits: 3,
    quantum: 0.001,
    maximum: 1,
  },
  "2024-a-3": {
    values: [0.9, 0.75, 0.95, 0.96],
    digits: 2,
    quantum: 0.01,
    maximum: 1,
    fixedDigits: true,
  },
  "2024-a-4": { values: [80, 69, 73, 77], digits: 0, quantum: 1, maximum: 100 },
  "2024-a-13": { values: [120, 105, 115, 125], digits: 0, quantum: 5 },
  "2025-a-4": {
    values: [0.92, 0.88, 0.9, 0.94],
    digits: 2,
    quantum: 0.01,
    maximum: 1,
    fixedDigits: true,
  },
  "2025-a-7": { values: [80, 10, 53, 67], digits: 0, quantum: 1, maximum: 100 },
  "2025-a-14": { values: [31, 27, 28, 29], digits: 0, quantum: 1 },
  "2025-a-19": { values: [5, 3.75, 4, 4.2], digits: 2, quantum: 0.01 },
  "2026-a-14": {
    values: [1.99, 0.01, 0.19, 1.4],
    digits: 2,
    quantum: 0.01,
    fixedDigits: true,
  },
};
export const calculationSources = [
  ...Object.keys(profiles),
  "2025-b-4",
  "2025-b-5",
  "2026-a-17",
];
export const calculationNotes =
  " 原問題の選択肢の桁数・正答からの相対的な間隔を基準に誤答を生成する。利益・変動費・制御情報等の取り違えから得る誤答を優先し、正答への近接・重複・範囲外を除く。入力値は手計算できる刻みで抽選し、原問題にない細かい丸めを必要とする入力を使わない。";

export function calculationChoices(
  source: string,
  correct: number,
  mistakes: number[] = [],
  unit = "",
) {
  const profile = profiles[source];
  if (!profile || !Number.isFinite(correct) || correct <= 0)
    throw Error("PARAMETER_CONSTRAINT");
  const { values, quantum, digits, maximum, fixedDigits } = profile;
  const scale = correct / values[0];
  const gaps = values.slice(1).map((n) => (n - values[0]) * scale);
  // Allow quantization, but never turn a broad source option set into ±0.01.
  const minimumGap = Math.max(quantum, Math.min(...gaps.map(Math.abs)) / 2);
  const quantize = (n: number) =>
    Number((Math.round(n / quantum) * quantum).toFixed(digits));
  const answer = quantize(correct);
  if (Math.abs(answer - correct) > 1e-8) throw Error("PARAMETER_CONSTRAINT");
  const result = [answer];
  const candidates = [
    ...mistakes,
    ...gaps.map((gap) => correct + gap),
    // Reflect source-sized gaps when a bounded rate would exceed 100%.
    ...gaps.map((gap) => correct - gap),
    ...[2, 3, 4].flatMap((factor) =>
      gaps.flatMap((gap) => [correct + factor * gap, correct - factor * gap]),
    ),
  ];
  for (const candidate of candidates) {
    const n = quantize(candidate);
    if (
      !Number.isFinite(n) ||
      n < 0 ||
      (maximum !== undefined && n > maximum) ||
      result.includes(n) ||
      Math.abs(n - answer) + 1e-8 < minimumGap
    )
      continue;
    result.push(n);
    if (result.length === 4) break;
  }
  if (result.length !== 4) throw Error("PARAMETER_CONSTRAINT");
  return result.map(
    (n) => `${fixedDigits ? n.toFixed(digits) : String(n)}${unit}`,
  );
}

// Whole-person options retain the source's seven pairs and partial-calculation
// distractors instead of perturbing every cell by one or two persons.
export function theoreticalCountChoices(
  v: number[],
  correct: number[],
): string[][] {
  const [a, b, c, d] = v;
  const source = [
    [80, 6],
    [44, 33],
    [58, 8],
    [70, 7],
    [75, 2],
    [80, 8],
    [82, 6],
  ];
  const candidates = [
    correct,
    [(a + b) / 2, (c + d) / 2],
    [c, d],
    [(a + c) / 2, (b + d) / 2],
    [(correct[0] * 75) / 80, (correct[1] * 2) / 6],
    [correct[0], d],
    [a, correct[1]],
    ...source
      .slice(1)
      .map(([x, y]) => [(correct[0] * x) / 80, (correct[1] * y) / 6]),
    ...source
      .slice(1)
      .map(([x, y]) => [correct[0] * (2 - x / 80), correct[1] * (2 - y / 6)]),
  ];
  const result: string[][] = [];
  for (const pair of candidates) {
    const row = pair.map((n) => String(Math.round(n)));
    if (
      row.some((n) => Number(n) < 0) ||
      result.some((r) => r.join(":") === row.join(":"))
    )
      continue;
    if (
      result.length &&
      Math.max(
        ...row.map((n, i) => Math.abs(Number(n) - correct[i]) / correct[i]),
      ) < 0.0125
    )
      continue;
    result.push(row);
    if (result.length === 7) return result;
  }
  throw Error("PARAMETER_CONSTRAINT");
}

export function checkCalculationInputs(source: string, v: number[]) {
  let valid = true;
  if (source === "2023-a-1") valid = v[1] === 1 && v[0] % 2 === 0;
  if (source === "2024-a-13") valid = v.every((n) => n % 5 === 0);
  if (source === "2025-a-4") {
    const [bf, tr, delta, years] = v;
    valid =
      tr > delta * years && ((bf + delta * years) * 100) % (bf + tr) === 0;
  }
  if (source === "2025-a-7") {
    const [gb, mbps, minutes, overhead] = v;
    const rate = (gb * 8000 * (100 + overhead)) / (mbps * minutes * 60);
    valid = rate >= 20 && rate <= 100;
  }
  if (source === "2025-a-19") {
    const [price, cost, fixed, profit, days, seats] = v;
    const denominator = (price - cost) * days * seats;
    // Exact quarter-person answers remove the extra rounding task in the old
    // generator; profit remains an equality as in the original question.
    valid =
      denominator > 0 &&
      fixed % 2500 === 0 &&
      ((fixed + profit) * 4) % denominator === 0 &&
      (fixed + profit) / denominator >= 2 &&
      (fixed + profit) / denominator <= 10;
  }
  if (source === "2025-b-5") {
    const [a, b, c, d] = v,
      total = a + b + c + d;
    valid =
      ((a + b) * (a + c)) % total === 0 &&
      ((c + d) * (b + d)) % total === 0 &&
      a * d !== b * c;
  }
  if (source === "2026-a-14") {
    const [h, b, m] = v;
    valid =
      b * 60 > m &&
      Math.floor(((h * 60 - m) * 10000) / (h * 60)) >
        Math.floor(((h - b) * 10000) / h);
  }
  if (!valid) throw Error("PARAMETER_CONSTRAINT");
}

type Draw = (minimum: number, maximum: number) => Promise<number>;
// Use the same seeded random stream as all other generators. Correlated cafe
// and contingency-table draws make exact, clean inputs practical to generate.
export async function sampleCalculationInputs(
  source: string,
  draw: Draw,
): Promise<number[] | undefined> {
  const pick = async (items: number[]) =>
    items[await draw(0, items.length - 1)];
  const step = async (min: number, max: number, size: number) =>
    (await draw(min / size, max / size)) * size;
  switch (source) {
    case "2023-a-1":
      return [await pick([2, 4, 6, 8, 10, 12, 14]), 1];
    case "2024-a-3":
      return [
        await pick([75, 80, 85, 90, 95, 96]),
        await draw(1, 5),
        await step(5, 30, 5),
        await step(100, 600, 100),
      ];
    case "2024-a-4":
      return [
        await step(1000, 6000, 500),
        await step(500, 2000, 100),
        await step(0, 40, 10),
        await step(5, 40, 5),
      ];
    case "2024-a-13": {
      const values: number[] = [];
      for (let i = 0; i < 8; i++) values.push(await step(5, 60, 5));
      return values;
    }
    case "2025-a-4":
      return [
        await step(1000, 8000, 500),
        await step(500, 2000, 500),
        await step(50, 150, 50),
        await draw(1, 6),
      ];
    case "2025-a-7":
      return [
        await draw(1, 5),
        await step(40, 400, 20),
        await draw(3, 15),
        await pick([10, 20, 25]),
      ];
    case "2025-a-19": {
      const price = await pick([400, 500, 600, 800, 1000]);
      const cost = await pick([100, 200]);
      const days = await pick([15, 20, 25]),
        seats = await pick([10, 15, 20]);
      const quarters = await draw(8, 32),
        profit = await step(50000, 200000, 25000);
      return [
        price,
        cost,
        ((price - cost) * days * seats * quarters) / 4 - profit,
        profit,
        days,
        seats,
      ];
    }
    case "2026-a-14":
      return [
        await pick([2000, 4000, 5000, 8000, 10000]),
        await step(20, 200, 10),
        await pick([15, 30, 60, 90, 120]),
      ];
    case "2026-a-17": {
      const values: number[] = [];
      for (let i = 0; i < 4; i++) {
        const previous = await step(500, 3000, 500);
        values.push(
          previous,
          await step(0, 1000, 100),
          (previous * (await step(10, 90, 10))) / 100,
        );
      }
      return values;
    }
    case "2025-b-5": {
      const r1 = await pick([4, 6, 8, 10]),
        r2 = await pick([4, 6, 8, 10]);
      const c1 = await pick([6, 8, 10]),
        c2 = await pick([1, 2]),
        offset = await draw(-4, 4);
      return [
        r1 * c1 + offset,
        r1 * c2 - offset,
        r2 * c1 - offset,
        r2 * c2 + offset,
      ];
    }
    default:
      return undefined;
  }
}
