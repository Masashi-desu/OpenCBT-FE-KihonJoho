import test, { before } from "node:test";
import assert from "node:assert/strict";
import { fixture, installFixtureGenerators } from "./fixtures";
import { prepareRun, validateRun } from "../src/core/session";
import { bookmarkTemplates } from "../src/core/bookmarks";
import { schema, DataError } from "../src/core/validation";
import { refKey, refOf, type Ref, type Run } from "../src/core/types";

// Retain the pre-index reference procedure as the independent lookup oracle.
// The rest of validateRun still checks issued hashes, instances and answers.
function previousEndlessReferences(run: Run): void {
  const bases = run.set.questionRefs.map(ref => run.bundle.questions.find(q => refKey(refOf(q)) === refKey(ref)));
  if (bases.some(base => !base || base.lifecycle !== "active" || base.distribution !== "included"))
    throw new DataError("REFERENCE", "周回する元問題を利用できません");
  const subject = bases.every(base => base!.subject === bases[0]!.subject) ? bases[0]!.subject : "mixed";
  if (subject !== run.exam.subject)
    throw new DataError("SESSION_CONFIG", "周回する問題群の科目が一致しません");
  if (run.selection.questionRefs !== undefined) {
    const refs = run.selection.kind === "bookmark"
      ? bookmarkTemplates(run.bundle, run.selection.questionRefs).map(({ base }) => refOf(base))
      : run.selection.questionRefs;
    const expected = [...new Set(refs.map(refKey))].sort(), actual = run.set.questionRefs.map(refKey).sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual))
      throw new DataError("SESSION_CONFIG", "保存した周回対象が一致しません");
  }
  for (const ref of run.set.questionRefs) {
    const bindings = run.set.generationBindings.filter(g => refKey(g.questionRef) === refKey(ref));
    const template = bindings.length === 1 && run.bundle.templates.find(t =>
      t.id === bindings[0].templateRef.id && t.revision === bindings[0].templateRef.revision);
    if (!template || refKey(template.baseQuestionRef) !== refKey(ref) ||
      template.lifecycle !== "active" || template.distribution !== "included")
      throw new DataError("BINDING_REF", "周回する生成定義が一致しません");
  }
}

async function outcome(action: () => void | Promise<void>): Promise<{ status: "accepted" | "rejected"; code?: string; message?: string }> {
  try { await action(); return { status: "accepted" }; }
  catch (error) {
    const e = error as Error & { code?: string };
    return { status: "rejected", code: e.code ?? e.name, ...(e.code ? { message: e.message } : {}) };
  }
}

let a: Run, b: Run, mixed: Run, afternoon: Run;
before(async () => {
  await installFixtureGenerators();
  const bundle = fixture();
  a = await prepareRun(bundle, { subject: "A", kind: "mix", mode: "endless", bindingMode: "generated_values" }, {}, 100000);
  b = await prepareRun(bundle, { subject: "B", kind: "mix", mode: "endless", bindingMode: "generated_values" }, {}, 100000);
  const am = bundle.templates.find(t => t.id === "template-source-2017h29h-fe-am-1")!;
  const currentB = bundle.templates.find(t => t.id === "template-source-2026-b-1")!;
  mixed = await prepareRun(bundle, { subject: "mixed", kind: "mix", mode: "endless", bindingMode: "generated_values",
    questionRefs: [am.baseQuestionRef, currentB.baseQuestionRef] }, {}, 100000);
  afternoon = await prepareRun(bundle, { subject: "B", kind: "mix", mode: "endless", bindingMode: "generated_values",
    questionRefs: bundle.templates.filter(t => /^template-source-2019r01a-fe-pm-/.test(t.id)).map(t => t.baseQuestionRef) }, {}, 100000);
});

function unissuedTarget(run: Run): Ref {
  const issued = new Set(run.session.entries.map(e => refKey(e.questionRef)));
  return run.set.questionRefs.find(ref => !issued.has(refKey(ref)))!;
}
function targetRecords(run: Run, ref: Ref) {
  const question = run.bundle.questions.find(q => refKey(refOf(q)) === refKey(ref))!;
  const binding = run.set.generationBindings.find(g => refKey(g.questionRef) === refKey(ref))!;
  const template = run.bundle.templates.find(t => t.id === binding.templateRef.id && t.revision === binding.templateRef.revision)!;
  return { question, binding, template };
}
async function compareWithPrevious(run: Run, label: string) {
  const saved = structuredClone(run);
  const expected = await outcome(() => previousEndlessReferences(run));
  assert.deepEqual(await outcome(() => validateRun(run)), expected, label);
  assert.deepEqual(run, saved, label + ": validation must not mutate any snapshot, record or array");
  return expected;
}

test("local endless indexes preserve complete A607/B49, mixed and old-afternoon pools", async () => {
  assert.equal(a.set.questionRefs.length, 607);
  assert.equal(b.set.questionRefs.length, 49);
  assert.equal(mixed.set.questionRefs.length, 2);
  assert.equal(afternoon.set.questionRefs.length, 13);
  for (const [label, run] of [["A", a], ["B", b], ["mixed", mixed], ["old afternoon", afternoon]] as const)
    assert.deepEqual(await compareWithPrevious(run, label), { status: "accepted" });
});

test("local indexes match old reference errors for missing, revised, inactive and mismatched records", async () => {
  const cases: [string, (run: Run, ref: Ref) => void][] = [
    ["missing question", (r, ref) => { r.bundle.questions = r.bundle.questions.filter(q => refKey(refOf(q)) !== refKey(ref)); }],
    ["wrong question revision", (r, ref) => { targetRecords(r, ref).question.revision++; }],
    ["wrong question subject", (r, ref) => { targetRecords(r, ref).question.subject = "B"; }],
    ["inactive question", (r, ref) => { targetRecords(r, ref).question.lifecycle = "withdrawn"; }],
    ["excluded question", (r, ref) => { targetRecords(r, ref).question.distribution = "excluded"; }],
    ["missing binding", (r, ref) => { r.set.generationBindings = r.set.generationBindings.filter(g => refKey(g.questionRef) !== refKey(ref)); }],
    ["ambiguous bindings", (r, ref) => { const g = structuredClone(targetRecords(r, ref).binding); g.templateRef.id += "-other"; r.set.generationBindings.push(g); }],
    ["missing template", (r, ref) => { const t = targetRecords(r, ref).template; r.bundle.templates = r.bundle.templates.filter(x => x !== t); }],
    ["wrong template revision", (r, ref) => { targetRecords(r, ref).template.revision++; }],
    ["wrong binding revision", (r, ref) => { targetRecords(r, ref).binding.templateRef.revision++; }],
    ["inactive template", (r, ref) => { targetRecords(r, ref).template.lifecycle = "withdrawn"; }],
    ["excluded template", (r, ref) => { targetRecords(r, ref).template.distribution = "excluded"; }],
    ["template binds another base", (r, ref) => { targetRecords(r, ref).template.baseQuestionRef = { ...r.set.questionRefs.find(x => refKey(x) !== refKey(ref))! }; }],
    ["template binds another revision", (r, ref) => { targetRecords(r, ref).template.baseQuestionRef.revision++; }],
    ["missing base precedes binding error", (r, ref) => { const records = targetRecords(r, ref); records.question.lifecycle = "withdrawn"; records.template.lifecycle = "withdrawn"; }],
    ["subject error precedes binding error", (r, ref) => { const records = targetRecords(r, ref); records.question.subject = "B"; records.template.lifecycle = "withdrawn"; }],
    ["explicit pool error precedes binding error", (r, ref) => { r.selection.questionRefs = r.set.questionRefs.filter(x => refKey(x) !== refKey(ref)); targetRecords(r, ref).template.lifecycle = "withdrawn"; }],
  ];
  for (const [label, mutate] of cases) {
    const run = structuredClone(a), ref = unissuedTarget(run);
    mutate(run, ref);
    assert.equal((await compareWithPrevious(run, label)).status, "rejected", label);
  }
});

test("duplicate questions and templates retain first-match behavior and exact revision identity", async () => {
  for (const kind of ["question", "template"] as const)
    for (const badFirst of [false, true]) {
      const run = structuredClone(a), ref = unissuedTarget(run), records = targetRecords(run, ref);
      const duplicate = structuredClone(kind === "question" ? records.question : records.template);
      duplicate.lifecycle = "withdrawn";
      if (kind === "question") {
        if (badFirst) run.bundle.questions.unshift(duplicate as typeof records.question);
        else run.bundle.questions.push(duplicate as typeof records.question);
      } else {
        if (badFirst) run.bundle.templates.unshift(duplicate as typeof records.template);
        else run.bundle.templates.push(duplicate as typeof records.template);
      }
      assert.equal((await compareWithPrevious(run, kind + "/badFirst=" + badFirst)).status, badFirst ? "rejected" : "accepted");
    }
  const run = structuredClone(a), ref = unissuedTarget(run), { template } = targetRecords(run, ref);
  // Bundle records are not validated here. String revision "1" must not hide
  // the actual numeric revision, unlike a concatenated template-key shortcut.
  const wrongType = structuredClone(template);
  (wrongType as unknown as { revision: string }).revision = String(template.revision);
  wrongType.lifecycle = "withdrawn";
  run.bundle.templates.unshift(wrongType);
  assert.deepEqual(await compareWithPrevious(run, "string and numeric template revisions"), { status: "accepted" });
});

test("lookup prefixes avoid unused malformed tails and unrelated revisions do not duplicate bindings", async () => {
  const run = structuredClone(a), ref = unissuedTarget(run), records = targetRecords(run, ref);
  const unrelated = structuredClone(records.binding);
  unrelated.questionRef.revision++;
  run.set.generationBindings.push(unrelated);
  run.bundle.questions.push(null as unknown as typeof records.question);
  run.bundle.templates.push(null as unknown as typeof records.template);
  assert.deepEqual(await compareWithPrevious(run, "unused malformed tails"), { status: "accepted" });
});

test("fresh call-local indexes see repaired and newly corrupted snapshot records", async () => {
  const run = structuredClone(a), ref = unissuedTarget(run), records = targetRecords(run, ref);
  assert.deepEqual(await compareWithPrevious(run, "initial"), { status: "accepted" });
  records.question.lifecycle = "withdrawn";
  assert.equal((await compareWithPrevious(run, "changed question after prior call")).code, "REFERENCE");
  records.question.lifecycle = "active";
  records.template.distribution = "excluded";
  assert.equal((await compareWithPrevious(run, "changed template after prior call")).code, "BINDING_REF");
  records.template.distribution = "included";
  const duplicate = structuredClone(records.binding); duplicate.templateRef.id += "-other";
  run.set.generationBindings.push(duplicate);
  assert.equal((await compareWithPrevious(run, "new duplicate binding after prior call")).code, "BINDING_REF");
  run.set.generationBindings.pop();
  assert.deepEqual(await compareWithPrevious(run, "repaired snapshot"), { status: "accepted" });
});

test("schema failures still precede any access to endless bundle indexes", async () => {
  for (const kind of ["session", "exam", "set"] as const) {
    const run = structuredClone(a);
    run[kind].schemaVersion = "invalid";
    Object.defineProperty(run.bundle, "questions", { get() { throw new Error("EARLY_BUNDLE_ACCESS"); } });
    assert.equal((await outcome(() => schema(kind, run[kind]))).code, "SCHEMA");
    assert.equal((await outcome(() => validateRun(run))).code, "SCHEMA", kind);
  }
});
