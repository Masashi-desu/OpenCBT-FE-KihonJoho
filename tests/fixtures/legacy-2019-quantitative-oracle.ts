// Independent displayed-input oracle; production answer calculations are not imported.
import assert from "node:assert/strict";
import type { GeneratedBody } from "../../src/core/generators/definition";
import type { Block } from "../../src/core/types";

const text = (blocks: readonly Block[]) => blocks.map(b => b.type === "paragraph" || b.type === "code" ? b.text : b.type === "list" ? b.items.join("\n") : b.type === "table" ? JSON.stringify(b) : "").join("\n");
const options = (body: GeneratedBody) => body.choices.map(text);
const match = (value: string, pattern: RegExp) => { const m = value.match(pattern); assert(m, `missing ${pattern}: ${value}`); return m; };
const numericChoices = (body: GeneratedBody) => options(body).map(s => { assert.match(s, /^\d+(?:\.\d+)?$/); return Number(s); });
const tableOf = (body: GeneratedBody) => { const t = body.prompt.find(b => b.type === "table"); assert(t?.type === "table"); return t; };
const close = (a: number, b: number) => Math.abs(a - b) < 1e-8;
const fraction = (s: string) => { const m = match(s, /^(\d+)(?:\/(\d+))?$/); return Number(m[1]) / Number(m[2] ?? 1); };

/** Independent oracle consumes displayed blocks, not production answer functions. */
function truth(source: string, body: GeneratedBody): boolean[] {
  const prompt = text(body.prompt), choices = options(body);
  if (source === "2019h31h-fe-am-1") {
    const m = match(prompt, /(\d+)÷(\d+)/), targetN = Number(m[1]), targetD = Number(m[2]);
    return choices.map(s => {
      assert.match(s, /^0\.[01]+$/);
      const bits = s.slice(2), numerator = bits.split("").reduce((sum, b, i) => sum + Number(b) * 2 ** (bits.length - 1 - i), 0);
      return numerator * targetD === targetN * 2 ** bits.length;
    });
  }
  if (source === "2019h31h-fe-am-2") {
    const kept = Number(match(prompt, /下位(\d+)ビットだけ/)[1]);
    return choices.map(s => {
      const m = match(s, /16進数([0-9A-F]+)との(AND|OR|XOR)/), mask = Number.parseInt(m[1], 16);
      for (let input = 0; input < 256; input++) {
        const expected = Array.from({ length: kept }, (_, bit) => Math.floor(input / 2 ** bit) % 2 * 2 ** bit).reduce((a, b) => a + b, 0);
        const actual = m[2] === "AND" ? input & mask : m[2] === "OR" ? input | mask : input ^ mask;
        if (actual !== expected) return false;
      }
      return true;
    });
  }
  if (source === "2019h31h-fe-am-6") {
    assert(prompt.includes("再帰的に定義された関数f()"),"Original grammatical qualifier must be preserved");
    assert(!prompt.includes("再帰に定義された"));
    const original = match(prompt, /初期状態も\[([\d, ]+)\]/)[1].split(",").map(Number);
    const codeBlock = body.prompt.find(b => b.type === "code"); assert(codeBlock?.type === "code");
    assert.equal(codeBlock.text, "f() {\n  Aが空ならば {\n    何もしない。\n  } そうでない場合 {\n    Aからpopした値をCにpushする。\n    f()を呼び出す。\n    Cからpopした値をBにpushする。\n  }\n}");
    assert(prompt.includes("[a₁, a₂, …, aₙ₋₁, aₙ]"));
    const A = [...original], B = [...original], C = [...original];
    let frames = 0;
    while (A.length) { C.push(A.pop()!); frames++; }
    while (frames--) B.push(C.pop()!);
    return choices.map(s => JSON.stringify(s.match(/\d+/g)!.map(Number)) === JSON.stringify(B));
  }
  if (source === "2019h31h-fe-am-11") {
    const m = match(prompt, /(\d+)dpi.*?(\d+)ポイント/); assert(prompt.includes("1ポイントは1/72インチ"));
    const target = Number(m[1]) * Number(m[2]) / 72;
    assert(Number.isInteger(target)); return numericChoices(body).map(v => v === target);
  }
  if (source === "2019h31h-fe-am-25") {
    const m = match(prompt, /1秒間に([\d,]+)回.*?それぞれ(\d+)ビット.*?(\d+)×10⁶バイト/), rate = Number(m[1].replaceAll(",", "")), width = Number(m[2]), bytes = Number(m[3]) * 1e6;
    assert(prompt.includes("最大何分"));
    return numericChoices(body).map(minutes => minutes * 60 * rate * width <= bytes * 8 && (minutes + 1) * 60 * rate * width > bytes * 8);
  }
  if (source === "2019h31h-fe-am-49") {
    const size = Number(match(prompt, /規模：(\d+)kステップ/)[1]), density = Number(match(prompt, /潜在不良率：(\d+\.\d+)件/)[1]);
    const discovery = Number(match(prompt, /年間発見率：(\d+)%/)[1]), major = Number(match(prompt, /影響度大(\d+)%、影響度小(\d+)%/)[1]), cost = Number(match(prompt, /修正費用：影響度大(\d+)万円/)[1]);
    assert(prompt.includes("初年度は影響度大の不良だけを修正する"));
    let perDefect = 0;
    for (let d = 0; d < 100; d++) for (let m = 0; m < 100; m++) if (d < discovery && m < major) perDefect += cost;
    const target = perDefect / 10000 * size * density;
    return numericChoices(body).map(v => close(v, target));
  }
  if (source === "2019h31h-fe-am-54") {
    const m = match(prompt, /システムを(\d+)日間.*?コーディング所要工数の(\d+)倍/), days = Number(m[1]), multiplier = Number(m[2]);
    const table = tableOf(body); assert.deepEqual(table.columns, ["処理", "プログラムの本数", "1本当たりのコーディング所要工数（人日）"]);
    let work = 0;
    for (const row of table.rows) for (let program = 0; program < Number(row[1]); program++) for (let day = 0; day < Number(row[2]); day++) work += 1 + multiplier;
    let people = 0; while (people * days < work) people++;
    return numericChoices(body).map(v => v === people);
  }
  if (source === "2019h31h-fe-am-78") {
    const table = tableOf(body); assert.equal(table.rows.length, 5); assert(prompt.includes("何千円"));
    let target = 0;
    for (const row of table.rows) { const [profit, demand, stock] = row.slice(1).map(Number); for (let unit = stock; unit < demand; unit++) target += profit; }
    return numericChoices(body).map(v => v === target);
  }
  if (source === "2019r01a-fe-am-2") {
    const width = Number(match(prompt, /(\d+)ビット/)[1]), limit = 2 ** width;
    return choices.map(s => {
      const m = match(s, /16進表記([0-9A-F]+)のビット列と(排他的論理和|論理積)/), mask = Number.parseInt(m[1], 16);
      for (let input = 0; input < limit; input++) {
        const expected = limit - 1 - input;
        if ((m[2] === "排他的論理和" ? input ^ mask : input & mask) !== expected) return false;
      }
      return true;
    });
  }
  if (source === "2019r01a-fe-am-6") {
    const target = Number(match(prompt, /Cの値が(\d+)になる/)[1]), calls = [...prompt.matchAll(/Random\((\d+)\)/g)].map(m => Number(m[1]));
    assert.equal(calls.length, 2); assert(prompt.includes("0以上n未満")); assert(prompt.includes("各呼出しは独立")); assert(prompt.includes("C = A - B"));
    let matches = 0, total = 0;
    for (let a = 0; a < calls[0]; a++) for (let b = 0; b < calls[1]; b++) { total++; if (a - b === target) matches++; }
    return choices.map(s => close(fraction(s), matches / total));
  }
  if (source === "2019r01a-fe-am-12") {
    const m = match(prompt, /(\d+)GHz.*?1命令を平均(\d+(?:\.\d+)?)クロック/), ghz = Number(m[1]);
    const decimal = m[2].split("."), denominator = 10 ** (decimal[1]?.length ?? 0), cycleN = Number(decimal.join(""));
    assert(prompt.includes("何万命令"));
    return numericChoices(body).map(v => v * 10000 * cycleN === ghz * 1e9 * denominator);
  }
  if (source === "2019r01a-fe-am-16") {
    const avail = Number(match(prompt, /稼働率はいずれも(0\.\d+)/)[1]); assert(prompt.includes("故障は独立"));
    const probability = [1 - avail, avail]; let parallel = 0, series = 0;
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { const chance = probability[a] * probability[b]; if (a || b) parallel += chance; if (a && b) series += chance; }
    return numericChoices(body).map(v => close(v, parallel - series));
  }
  if (source === "2019r01a-fe-am-30") {
    const m = match(prompt, /(\d+)Mビット\/秒.*?平均(\d+)Mバイト.*?(\d+)秒ごと.*?転送量の(\d+)%/), rate = Number(m[1]) * 1e6, bytes = Number(m[2]) * 1e6, seconds = Number(m[3]), extra = Number(m[4]);
    assert(prompt.includes("1Mビット=10⁶ビット、1Mバイト=10⁶バイト"));
    const totalBits = bytes * 8 + bytes * 8 / 100 * extra;
    return numericChoices(body).map(v => close(v / 100 * rate * seconds, totalBits));
  }
  if (source === "2019r01a-fe-am-54") {
    const m = match(prompt, /(\d+)人のメンバ.*?メンバ(\d+)人を増員/), before = Number(m[1]), after = before + Number(m[2]);
    assert(prompt.includes("1対1")); assert(prompt.includes("他の全てのメンバと1回ずつ"));
    const pairs = (n: number) => { const result = new Set<string>(); for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) result.add(`${a},${b}`); return result; };
    const original = pairs(before), expanded = pairs(after), target = [...expanded].filter(pair => !original.has(pair)).length;
    return numericChoices(body).map(v => v === target);
  }
  throw new Error(`Unreviewed source ${source}`);
}
function verify(source: string, body: GeneratedBody) {
  assert.equal(body.choices.length, 4); const answers = truth(source, body);
  assert.equal(answers.filter(Boolean).length, 1, source + " " + JSON.stringify(body));
  assert.equal(answers[body.correctIndex!], true, source);
  assert(body.explanation.length >= 30);
}
function precisionAndSpacing(source: string, body: GeneratedBody) {
  const prompt = text(body.prompt), choices = options(body);
  const gap = (values: number[]) => Math.min(...values.flatMap((a, i) => values.slice(i + 1).map(b => Math.abs(a - b))));
  if (source === "2019h31h-fe-am-1") {
    const denominator = Number(match(prompt, /÷(\d+)/)[1]);
    const numbers = choices.map(s => { assert.match(s, /^0\.[01]{1,7}$/); return Number.parseInt(s.slice(2), 2) / 2 ** (s.length - 2); });
    assert(gap(numbers) >= 1 / (2 * denominator));
  } else if (source === "2019h31h-fe-am-2") {
    for (const choice of choices) assert.match(choice, /16進数[0-9A-F]{2}との/);
    assert.equal(choices[0].length, choices[2].length);
  } else if (source === "2019h31h-fe-am-6") {
    assert.equal(new Set(choices.map(s => s.length)).size, 1);
    for (const choice of choices) assert.match(choice, /^\[\d, \d, \d, \d, \d, \d\]$/);
  } else if (source === "2019r01a-fe-am-2") {
    const width = Number(match(prompt, /(\d+)ビット/)[1]);
    for (const choice of choices) assert.equal(match(choice, /16進表記([0-9A-F]+)/)[1].length * 4, width);
    assert.equal(choices[0].length, choices[2].length);
  } else if (source === "2019r01a-fe-am-6") {
    for (const choice of choices) assert.match(choice, /^\d{1,2}\/\d{1,3}$/);
    const numerators = choices.map(s => s.split("/")[0]);
    // A new non-unit numerator must never be unique to the correct choice.
    assert(numerators[body.correctIndex!] === "1" || numerators.filter(n => n !== "1").length >= 2);
    const n = Number(match(prompt, /A = Random\((\d+)\)/)[1]);
    assert(gap(choices.map(fraction)) >= 1 / (2 * n * n) - 1e-10);
  } else {
    const numbers = numericChoices(body), minimum = gap(numbers), correct = numbers[body.correctIndex!];
    if (source === "2019r01a-fe-am-16") {
      for (const choice of choices) assert.match(choice, /^0\.\d{2}$/);
      assert(minimum >= 0.01 - 1e-10);
    } else if (source === "2019r01a-fe-am-30") {
      for (const choice of choices) assert.match(choice, /^\d+\.\d$/);
      assert(minimum >= numbers[2] / 5 - 1e-10);
    } else if (source === "2019h31h-fe-am-49") {
      for (const choice of choices) assert.match(choice, /^\d+(?:\.\d)?$/);
      assert(minimum >= correct / 4 - 1e-10);
    } else {
      for (const choice of choices) assert.match(choice, /^\d+$/);
      assert(minimum >= 1);
      if (source === "2019h31h-fe-am-11") assert(minimum >= Number(match(prompt, /に(\d+)ポイント/)[1]) / 12);
      if (source === "2019h31h-fe-am-25") {
        const m = match(prompt, /1秒間に([\d,]+)回.*?(\d+)×10⁶バイト/);
        const exact = Number(m[2]) * 1e6 / Number(m[1].replaceAll(",", "")) / 60;
        assert(minimum >= Math.max(1, Math.floor(exact / 40) - 1));
      }
      if (source === "2019h31h-fe-am-78") { assert(minimum >= 100); assert(numbers.every(n => n % 100 === 0)); }
    }
  }
}
function expectedConstraint(source: string, values: number[]) {
  if (source === "2019h31h-fe-am-1") return 2 * values[0] >= 2 ** values[1];
  if (source === "2019h31h-fe-am-78") return 4 * values[2] === values[0] * values[1] + 5 * values[3];
  return source === "2019r01a-fe-am-54" && values[1] === 3;
}
function* inputs(fields: { minimum: number; maximum: number }[], prefix: number[] = []): Generator<number[]> {
  if (prefix.length === fields.length) { yield prefix; return; }
  const f = fields[prefix.length];
  for (let n = f.minimum; n <= f.maximum; n++) yield* inputs(fields, [...prefix, n]);
}

export { text, options, verify, precisionAndSpacing, expectedConstraint, inputs };
export function assertLegacy2019Quantitative(source: string, body: GeneratedBody) {
  verify(source,body); precisionAndSpacing(source,body);
}
