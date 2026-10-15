import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fixture } from "./fixtures";
import { restorePreRadix } from "./radix-history";
import previous from "./fixtures/pre-radix-revisions.json";
import { contentHash } from "../src/core/hash";
import { loadDetailPackage } from "../src/core/detailed-explanation";
import { bindQuestion } from "../src/core/generation";
import { makeBookmark } from "../src/core/bookmarks";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun, appendRunQuestion } from "../src/core/session";

const root = "public/explanations/ipa-2023-a-1/", sandbox: any = vm.createContext({});
vm.runInContext(fs.readFileSync(root + "radix-engine.js", "utf8"), sandbox);
const E = sandbox.RadixEngine;
const plain = (v: any) => JSON.parse(JSON.stringify(v, (_k, v) => typeof v === "bigint" ? String(v) : v));
type Ratio = { n: bigint; d: bigint };
const same = (a: Ratio, b: Ratio) => assert.equal(a.n * b.d, b.n * a.d);

// Independent oracle: evaluate the whole shifted digit strings, subtracting
// the nonrepeating prefix. It does not sum per-digit weights or call the engine.
function reference(raw: string, base: number): Ratio {
  const text = raw.trim().toUpperCase(), negative = text.startsWith("-"), clean = text.replace(/^[+-]/, "");
  const [integer, fractional = ""] = clean.split("."), [finite, cycle = ""] = fractional.replace(")", "").split("(");
  const read = (s: string) => [...s].reduce((v, c) => BigInt(base) * v + BigInt("0123456789ABCDEF".indexOf(c)), 0n);
  const prefix = read(integer + finite), scale = BigInt(base) ** BigInt(finite.length);
  const d = cycle ? scale * (BigInt(base) ** BigInt(cycle.length) - 1n) : scale;
  const n = cycle ? read(integer + finite + cycle) - prefix : prefix;
  return { n: negative ? -n : n, d };
}
function verify(raw: string, from: number, to: number) {
  const m = E.build(raw, from, to), expected = reference(raw, from);
  same(m.input.value, expected);
  if (m.output.exact) same(reference(m.output.text, to), expected);
  else {
    const displayed = reference(m.output.text.replace("…", ""), to), sign = expected.n < 0n ? -1n : 1n;
    const diff = sign * (expected.n * displayed.d - displayed.n * expected.d);
    assert(diff > 0n && diff * BigInt(to) ** 64n < expected.d * displayed.d);
  }
  let sum: Ratio = { n: 0n, d: 1n }, targetValue: Ratio = { n: 0n, d: 1n };
  const sums: Ratio[] = [{ ...sum }];
  for (const [i, step] of m.steps.entries()) {
    if (["add", "repeat-add"].includes(step.kind)) {
      same(step.before, sum);
      sum = { n: sum.n * step.contribution.d + step.contribution.n * sum.d, d: sum.d * step.contribution.d };
      same(step.after, sum);
    } else if (step.kind === "divide") {
      assert.equal(step.before, step.next * BigInt(to) + BigInt(step.digit));
      assert(step.digit >= 0 && step.digit < to);
      assert.equal(step.cell.exponent, m.steps.slice(0, i).filter((s: any) => s.kind === "divide").length);
    } else if (step.kind === "multiply") {
      same(step.product, { n: step.before.n * BigInt(to), d: step.before.d });
      same(step.product, { n: BigInt(step.digit) * step.next.d + step.next.n, d: step.next.d });
      assert(step.next.n >= 0n && step.next.n < step.next.d);
      assert.equal(step.cell.exponent, -1 - m.steps.slice(0, i).filter((s: any) => s.kind === "multiply").length);
    } else if (step.kind === "cycle") {
      same(step.next, m.output.operations[step.repeatAt].before);
      assert.equal(m.steps.at(-1), step);
    }
    if (step.cell && ["divide", "multiply"].includes(step.kind)) {
      const c = step.cell.contribution;
      targetValue = { n: targetValue.n * c.d + c.n * targetValue.d, d: targetValue.d * c.d };
    }
    const s = E.snapshot(m, i + 1); same(s.sum, sum); same(s.represented, targetValue); sums.push({ ...sum });
  }
  same(sum, { n: expected.n < 0n ? -expected.n : expected.n, d: expected.d });
  const sourceExponents = m.steps.filter((s: any) => s.kind === "add").map((s: any) => s.cell.exponent);
  assert.deepEqual(plain(sourceExponents), [...m.input.integer].map((_, i) => i).concat([...m.input.finite].map((_, i) => -1 - i)));
  // Seeking backward recomputes the exact previous sum, carry and known digits.
  for (let i = m.steps.length; i >= 0; i--) {
    const s = E.snapshot(m, i); same(s.sum, sums[i]);
    assert.equal(s.known.length, m.target.filter((c: any) => c.step <= i).length);
    const divisions = m.steps.slice(0, i).filter((s: any) => s.kind === "divide"), multiplications = m.steps.slice(0, i).filter((s: any) => s.kind === "multiply");
    assert.equal(s.nextInteger, divisions.at(-1)?.next ?? m.input.magnitude.n / m.input.magnitude.d);
    same(s.nextFraction, multiplications.at(-1)?.next ?? { n: m.input.magnitude.n % m.input.magnitude.d, d: m.input.magnitude.d });
  }
  return m;
}

test("all five requested conversions and reversals are exact, including recurring inputs and zero digits", () => {
  for (const [from, raw, to, expected] of [[16, "0.C", 10, "0.75"], [10, "19.625", 2, "10011.101"], [10, "13.625", 8, "15.5"], [10, "0.9", 16, "0.E(6)"], [10, "0.1", 2, "0.0(0011)"]] as const) {
    const model = verify(raw, from, to); assert.equal(model.output.text, expected);
    const reverse = verify(expected, to, from); assert.equal(reverse.output.text, raw);
  }
  assert.equal(verify("0.c", 16, 10).output.text, "0.75");
  assert.equal(verify("-19.625", 10, 2).output.text, "-10011.101");
  assert.equal(verify("-0", 10, 2).output.text, "0");
  assert.equal(verify("0.(9)", 10, 2).output.text, "1");
  assert.equal(verify(".e(6)", 16, 10).output.text, "0.9");
  assert.equal(verify("0.(3)", 10, 10).output.text, "0.(3)");
  assert.equal(verify("0.(0)", 10, 16).output.text, "0");
  assert.equal(verify("000.000", 8, 2).output.text, "0");
});

test("all 16 base combinations and independently evaluated finite/recurring signed values", () => {
  for (const from of [2, 8, 10, 16]) for (const to of [2, 8, 10, 16]) {
    for (let n = 0; n < 16; n++) {
      const integer = (n * 19 + 1).toString(from), fractional = (n * 7 + 3).toString(from), cycle = (n + 1).toString(from);
      verify(`${n % 2 ? "-" : ""}${integer}.${fractional}`, from, to);
      verify(`${n % 2 ? "" : "-"}${integer}.${fractional}(${cycle})`, from, to);
    }
  }
});

test("512 digit inputs, huge integers, 64-digit exact termination, cycle closure and truncation boundaries", () => {
  const huge = E.build("F".repeat(512), 16, 2);
  assert.equal(huge.output.text, "1".repeat(2048));
  same(huge.input.value, { n: (1n << 2048n) - 1n, d: 1n });
  const finite = E.build("0." + "0".repeat(62) + "1", 2, 2); assert.equal(finite.output.digits.length, 63); assert(finite.output.exact);
  const boundary = E.build("0." + "0".repeat(63) + "1", 2, 2); assert.equal(boundary.output.digits.length, 64); assert(boundary.output.exact);
  const cycle = E.build("0.(" + "0".repeat(63) + "1)", 2, 2); assert.equal(cycle.output.repeatAt, 0); assert(cycle.output.exact); assert.equal(cycle.output.digits.length, 64);
  for (const raw of ["0." + "0".repeat(64) + "1", "0.(" + "0".repeat(64) + "1)", "0." + "1".repeat(511)]) {
    const m = verify(raw, 2, 2); assert(m.output.truncated); assert.equal(m.output.digits.length, 64); assert(m.output.text.endsWith("…")); assert.equal(m.steps.at(-1).kind, "truncate");
  }
  assert.equal(E.parse("0.(" + "1".repeat(511) + ")", 2).magnitude.n, 1n);
  assert.throws(() => E.parse("F".repeat(513), 16), /512/);
  assert.throws(() => E.parse("0.(" + "1".repeat(512) + ")", 2), /512/);
});

test("malformed punctuation, unsupported digits, signs and bases give concrete errors", () => {
  for (const raw of ["", " ", ".", "-", "--1", "1..2", "1(2)", "1.()", "0.(1)2", "0.((1))", "0.(1)(2)", "0.1)", "0.(1", "1e2", "NaN", "Infinity", "0xC", "1 0", "1,0"]) assert.throws(() => E.parse(raw, 10));
  for (const [base, digit] of [[2, "2"], [8, "8"], [10, "A"], [16, "G"]] as const) assert.throws(() => E.parse(digit, base));
  assert.throws(() => E.parse("1", 3));
  assert.throws(() => E.parse("0.G", 16), /G.*使えません/);
  for (const raw of ["+1", "1.", ".1", "-.1"]) verify(raw, 10, 2);
});

test("optional lesson registration preserves saved bodies and all generated initial values without mutating context", async () => {
  const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2023-a-1")!, template = b.templates.find(t => t.id === "template-hex-fraction")!, base = b.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
  assert.equal(await contentHash(base), template.originalContentSha256);
  assert(original.explanation.blocks.some((block: any) => block.text.includes("12/16＝0.75")));
  for (const q of Object.values(previous.questions)) {
    const current = b.questions.find(p => p.id === q.id)!;
    assert.deepEqual(current.prompt, q.prompt); assert.deepEqual(current.choices, q.choices); assert.deepEqual(current.correctAnswer, q.correctAnswer);
    assert.equal(makeBookmark(b, { questionId: q.id, revision: q.revision }, 0).questionRef.revision, original.revision);
  }
  for (const version of ["2.1.0", "2.2.0"]) for (let n = 1; n < 16; n++) {
    const context = { generation: { generatorRef: { id: "generator-hex-fraction", version }, parameters: { values: [n, 1] } } }, before = JSON.stringify(context);
    const initial = E.initialState(context); assert(initial.saved); same(E.parse(initial.raw, 16).value, { n: BigInt(n), d: 16n }); assert.equal(JSON.stringify(context), before);
    if (n % 2 === 0) { const question = bindQuestion(base, template, [n, 1], "radix-test", "2026-10-15T00:00:00Z"); assert.deepEqual(question.detailedExplanationRef, base.detailedExplanationRef); }
  }
  assert.equal(E.initialState(null).raw, "0.C");
  for (const kind of ["annual", "mix"] as const) {
    const historical = restorePreRadix(fixture());
    let run = startRun(await prepareRun(historical, { subject: "A", kind, year: 2023, mode: kind === "annual" ? "study" : "endless", size: "public", bindingMode: kind === "annual" ? "original_data" : "generated_values", ...(kind === "mix" ? { questionRefs: [previous.template.baseQuestionRef] } : {}) }, {}, 100000), 100001);
    const issued = structuredClone(run.issued); await validateRun(run);
    run = updateAnswer(run, run.issued[0].correctAnswer.choiceId, 100002);
    if (kind === "mix") run = await appendRunQuestion(run, undefined, 100003);
    const completed = finishRun(run, "completed", 100004); await validateRun(completed);
    assert.deepEqual(completed.issued.slice(0, issued.length), issued);
    assert(issued.every(q => !q.detailedExplanationRef));
  }
});

test("managed package hashes, original attribution, official references, theme and scrollbar copies load", async () => {
  const b = fixture(), q = b.questions.find(q => q.id === "question-ipa-2023-a-1")!;
  const fetcher = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname))) as typeof fetch;
  const pkg = await loadDetailPackage(q.detailedExplanationRef!, new URL("https://radix.invalid/"), undefined, fetcher);
  assert(pkg); assert.equal(pkg.manifest.files.length, 7); assert.equal(pkg.manifest.attribution.origin, "original");
  assert.equal(pkg.manifest.references?.sourceRefs.length, 2);
  for (const [file, source] of [["theme.css", "tokens.css"], ["scrollbars.css", "scrollbars.css"]]) assert.equal(new TextDecoder().decode(pkg.files[file].bytes), fs.readFileSync("src/ui/" + source, "utf8"));
});
