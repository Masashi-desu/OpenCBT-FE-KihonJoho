import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { readDistributionBundle } from "../scripts/distribution-files";
import { generationCoverage, validateGenerationCoverage } from "../src/core/generation-coverage";
import type { Bundle, Question, Template, SetRecord } from "../src/core/types";

// Independent reference: the unoptimized scan, kept verbatim apart from its
// function name. Expectations never come from the indexed implementation.
function scanCoverage(b: Bundle) {
  const official = b.questions.filter(
      (q) => q.origin.kind === "official_reprint",
    ),
    rows = official.map((original) => {
      const bases = b.questions.filter((q) =>
        q.origin.derivedFrom.some(
          (r) =>
            r.questionId === original.id && r.revision === original.revision,
        ),
      );
      const templates = b.templates.filter(
        (t) =>
          bases.some(
            (q) =>
              q.id === t.baseQuestionRef.questionId &&
              q.revision === t.baseQuestionRef.revision,
          ) &&
          t.lifecycle === "active" &&
          t.distribution === "included",
      );
      const linked = templates.filter((t) =>
        b.sets.some(
          (s) =>
            s.id === `set-mix-${original.subject.toLowerCase()}` &&
            s.generationBindings.some(
              (g) =>
                g.templateRef.id === t.id &&
                g.templateRef.revision === t.revision &&
                g.questionRef.questionId === t.baseQuestionRef.questionId &&
                g.questionRef.revision === t.baseQuestionRef.revision,
            ),
        ),
      );
      return { original, templates, linked };
    });
  return {
    rows,
    total: official.length,
    covered: rows.filter((r) => r.linked.length > 0).length,
  };
}

const actualBundle = readDistributionBundle();
function compare(bundle: Bundle, label: string) {
  const saved = structuredClone(bundle), expected = scanCoverage(bundle), actual = generationCoverage(bundle);
  assert.deepEqual(Object.keys(actual), Object.keys(expected), label);
  assert.equal(actual.total, expected.total, label);
  assert.equal(actual.covered, expected.covered, label);
  assert.equal(actual.rows.length, expected.rows.length, label);
  for (let i = 0; i < expected.rows.length; i++) {
    assert.strictEqual(actual.rows[i].original, expected.rows[i].original, `${label} original ${i}`);
    for (const name of ["templates", "linked"] as const) {
      assert.equal(actual.rows[i][name].length, expected.rows[i][name].length, `${label} ${name} multiplicity ${i}`);
      for (let j = 0; j < expected.rows[i][name].length; j++)
        assert.strictEqual(actual.rows[i][name][j], expected.rows[i][name][j], `${label} ${name} identity/order ${i}/${j}`);
    }
  }
  assert.deepEqual(bundle, saved, `${label} no input mutation`);
  return actual;
}
const original = (id: string, subject: "A" | "B", revision = 1) => ({
  id, revision, subject, lifecycle: "active", distribution: "included",
  origin: { kind: "official_reprint", derivedFrom: [], sourceRefs: [] },
} as unknown as Question);
const base = (id: string, parent: Question, revision = 1) => ({
  ...original(id, parent.subject, revision),
  origin: { kind: "official_adaptation", derivedFrom: [{ questionId: parent.id, revision: parent.revision }], sourceRefs: [] },
} as unknown as Question);
const template = (id: string, question: Question, revision = 1) => ({
  id, revision, lifecycle: "active", distribution: "included",
  baseQuestionRef: { questionId: question.id, revision: question.revision },
} as Template);
const binding = (t: Template) => ({
  templateRef: { id: t.id, revision: t.revision }, questionRef: { ...t.baseQuestionRef },
});
const mix = (subject: "a" | "b", templates: Template[]) => ({
  schemaVersion: "3.0.0", id: `set-mix-${subject}`, revision: 1, title: "coverage test",
  subject: subject === "a" ? "A" : "B", questionRefs: [], examConfigRefs: [],
  distribution: "included", generationBindings: templates.map(binding),
} as SetRecord);
function tiny(): Bundle {
  const a = original("original@a:1|2", "A"), b = original("original@b:2|1", "B"), c = original("original@a:1", "A", 2);
  const aa = base("base@a:1|2", a), bb = base("base@b:2|1", b), cc = base("base@a:1", c, 2);
  const ta = template("template@a:1|2", aa), tb = template("template@b:2|1", bb), tc = template("template@a:1", cc, 2);
  // Deliberately interleave originals/bases and use a different template order.
  return { ...actualBundle, questions: [a, aa, b, bb, c, cc], templates: [tb, tc, ta], sets: [mix("b", [tb]), mix("a", [ta, tc])] };
}

test("indexed coverage retains every original/template identity, order and count of the actual734-family catalog", t => {
  const slowStart = performance.now(), expected = scanCoverage(actualBundle), slowMS = performance.now() - slowStart;
  const fastStart = performance.now(), actual = generationCoverage(actualBundle), fastMS = performance.now() - fastStart;
  assert.equal(expected.total, 734); assert.equal(expected.covered, 734);
  compare(actualBundle, "actual734");
  // Timing is diagnostic only; machine speed and load never decide acceptance.
  t.diagnostic(JSON.stringify({ scanMS: slowMS, indexedMS: fastMS, originals: actual.total, templates: actualBundle.templates.length }));
});

test("indexed coverage equals the old scan for missing, extra, duplicate and source/revision controls", () => {
  const cases: [string, (b: Bundle) => void][] = [
    ["empty all arrays", b => { b.questions = []; b.templates = []; b.sets = []; }],
    ["no originals", b => { b.questions = b.questions.filter(q => q.origin.kind !== "official_reprint"); }],
    ["no bases", b => { b.questions = b.questions.filter(q => q.origin.kind === "official_reprint"); }],
    ["no templates", b => { b.templates = []; }],
    ["no sets", b => { b.sets = []; }],
    ["missing original", b => { b.questions.splice(0, 1); }],
    ["missing base", b => { b.questions.splice(1, 1); }],
    ["missing template", b => { b.templates.splice(1, 1); }],
    ["missing set", b => { b.sets.splice(1, 1); }],
    ["missing binding", b => { b.sets[1].generationBindings.splice(0, 1); }],
    ["extra unpaired original", b => { b.questions.push(original("unpaired-original", "B")); }],
    ["extra unpaired base", b => { b.questions.push(base("unpaired-base", original("absent", "A"))); }],
    ["extra unpaired template", b => { b.templates.push(template("unpaired-template", original("absent", "A"))); }],
    ["extra unrelated set/binding", b => { const s = structuredClone(b.sets[1]); s.id = "set-question-not-mix-a"; b.sets.push(s); }],
    ["duplicate original same object", b => { b.questions.push(b.questions[0]); }],
    ["duplicate original equal clone", b => { b.questions.unshift(structuredClone(b.questions[0])); }],
    ["duplicate base same object", b => { b.questions.push(b.questions[1]); }],
    ["duplicate base equal clone", b => { b.questions.unshift(structuredClone(b.questions[1])); }],
    ["duplicate template same object", b => { b.templates.push(b.templates[0]); }],
    ["duplicate template equal clone", b => { b.templates.unshift(structuredClone(b.templates[0])); }],
    ["duplicate set same object", b => { b.sets.push(b.sets[1]); }],
    ["duplicate set equal clone", b => { b.sets.unshift(structuredClone(b.sets[1])); }],
    ["duplicate binding same object", b => { b.sets[1].generationBindings.push(b.sets[1].generationBindings[0]); }],
    ["duplicate binding equal clone", b => { b.sets[1].generationBindings.unshift(structuredClone(b.sets[1].generationBindings[0])); }],
    ["duplicate derivedFrom", b => { b.questions[1].origin.derivedFrom.push(b.questions[1].origin.derivedFrom[0]); }],
    ["multiple derivedFrom originals", b => { const q = b.questions[2]; b.questions[1].origin.derivedFrom.push({ questionId: q.id, revision: q.revision }); }],
    ["multiple bases share one reference and different origins", b => { const q = structuredClone(b.questions[1]); q.origin.derivedFrom = [{ questionId: b.questions[2].id, revision: b.questions[2].revision }]; b.questions.push(q); }],
    ["inactive original remains counted", b => { b.questions[0].lifecycle = "withdrawn"; }],
    ["excluded original remains counted", b => { b.questions[0].distribution = "excluded"; }],
    ["inactive base still links", b => { b.questions[1].lifecycle = "withdrawn"; }],
    ["excluded base still links", b => { b.questions[1].distribution = "excluded"; }],
    ["inactive template excluded", b => { b.templates[2].lifecycle = "withdrawn"; }],
    ["excluded template excluded", b => { b.templates[2].distribution = "excluded"; }],
    ["extraneous lifecycle on a mix is ignored (malformed control)", b => { (b.sets[1] as SetRecord & { lifecycle: string }).lifecycle = "withdrawn"; }],
    ["excluded mix still links", b => { b.sets[1].distribution = "excluded"; }],
    ["different original revision", b => { b.questions[0].revision++; }],
    ["different derivedFrom revision", b => { b.questions[1].origin.derivedFrom[0].revision++; }],
    ["different base revision", b => { b.questions[1].revision++; }],
    ["different template base revision", b => { b.templates[2].baseQuestionRef.revision++; }],
    ["different template revision", b => { b.templates[2].revision++; }],
    ["different binding template revision", b => { b.sets[1].generationBindings[0].templateRef.revision++; }],
    ["different binding base revision", b => { b.sets[1].generationBindings[0].questionRef.revision++; }],
    ["different binding base identity", b => { b.sets[1].generationBindings[0].questionRef.questionId = b.questions[3].id; }],
    ["different template identity", b => { b.sets[1].generationBindings[0].templateRef.id += "@foreign"; }],
    ["different template base identity", b => { b.templates[2].baseQuestionRef.questionId += "@foreign"; }],
    ["different derivedFrom identity", b => { b.questions[1].origin.derivedFrom[0].questionId += "@foreign"; }],
    ["wrong subject mix", b => { b.sets[1].id = "set-mix-b"; }],
    ["mix case mismatch", b => { b.sets[1].id = "set-mix-A"; }],
    ["opposite original subject", b => { b.questions[0].subject = "B"; }],
    ["source name does not determine coverage", b => { b.questions[0].origin.sourceRefs = [{ sourceId: "source-ipa-2019r01a-fe-am-1", locator: { section: "問1", year: 2019, timeSlot: "午前" } }]; }],
    ["noncanonical source name does not determine coverage", b => { b.questions[0].origin.sourceRefs = [{ sourceId: "not-a-source@1:2|3", locator: { section: "noncanonical" } }]; }],
    ["original self-derived reference", b => { const q = b.questions[0]; q.origin.derivedFrom = [{ questionId: q.id, revision: q.revision }]; b.templates.push(template("self-template", q)); }],
    ["same template identity different revision", b => { const t = structuredClone(b.templates[2]); t.revision++; b.templates.push(t); b.sets[1].generationBindings.push(binding(t)); }],
    ["same base identity different revision", b => { const q = structuredClone(b.questions[1]); q.revision++; b.questions.push(q); const t = template("second-base-revision", q); b.templates.push(t); b.sets[1].generationBindings.push(binding(t)); }],
    ["NaN original revision never equals itself", b => { b.questions[0].revision = NaN; b.questions[1].origin.derivedFrom[0].revision = NaN; }],
    ["NaN base revision never equals itself", b => { b.questions[1].revision = NaN; b.templates[2].baseQuestionRef.revision = NaN; }],
    ["NaN binding revision never equals itself", b => { b.templates[2].revision = NaN; b.sets[1].generationBindings[0].templateRef.revision = NaN; }],
    ["infinite and negative zero revisions use strict equality", b => { b.questions[0].revision = Infinity; b.questions[1].origin.derivedFrom[0].revision = Infinity; b.questions[1].revision = -0; b.templates[2].baseQuestionRef.revision = 0; b.sets[1].generationBindings[0].questionRef.revision = -0; }],
  ];
  compare(tiny(), "baseline delimiters/@/order");
  for (const [name, mutate] of cases) { const b = tiny(); mutate(b); compare(b, name); }
});

test("indexed coverage preserves combined duplicates, order and all four reference components under deterministic mutations", () => {
  let seed = 0x734467;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let round = 0; round < 128; round++) {
    const b = tiny();
    for (let step = 0; step < 12; step++) {
      switch (next() % 8) {
        case 0: b.questions.push(b.questions[next() % b.questions.length]); break;
        case 1: b.templates.push(b.templates[next() % b.templates.length]); break;
        case 2: b.sets.push(b.sets[next() % b.sets.length]); break;
        case 3: { const s = b.sets[next() % b.sets.length]; s.generationBindings.push(structuredClone(s.generationBindings[next() % s.generationBindings.length])); break; }
        case 4: b.templates[next() % b.templates.length].baseQuestionRef.revision = next() % 3; break;
        case 5: b.templates[next() % b.templates.length].distribution = next() & 1 ? "included" : "excluded"; break;
        case 6: b.questions.reverse(); b.templates.reverse(); b.sets.reverse(); break;
        case 7: { const s = b.sets[next() % b.sets.length]; s.generationBindings[next() % s.generationBindings.length].templateRef.id += "@foreign"; break; }
      }
    }
    compare(b, `combined ${round}`);
  }
});

test("coverage recomputes each call after input or returned-array mutations and retains complete validation", () => {
  const b = tiny(); b.catalog = { ...b.catalog, generationCoverage: "complete" };
  validateGenerationCoverage(b);
  const first = compare(b, "first");
  first.rows[0].templates.splice(0); first.rows[1].linked.splice(0); first.rows.reverse();
  compare(b, "returned arrays cannot pollute another call");
  b.templates.push(b.templates[0]); compare(b, "new template duplicate is observed");
  assert.throws(() => validateGenerationCoverage(b), { code: "GENERATION_COVERAGE" });
  b.templates.pop(); b.sets[1].generationBindings[0].questionRef.revision++;
  compare(b, "changed binding is observed");
  assert.throws(() => validateGenerationCoverage(b), { code: "GENERATION_COVERAGE" });
  b.catalog.generationCoverage = "partial"; assert.doesNotThrow(() => validateGenerationCoverage(b));
  b.catalog.generationCoverage = "complete"; b.sets[1].generationBindings[0].questionRef.revision--;
  compare(b, "restored input is observed"); validateGenerationCoverage(b);
});


test("coverage keeps the scan's empty official/base/template short circuits before unrelated malformed tails", () => {
  const empty = tiny(); empty.questions = [];
  empty.templates = undefined as unknown as Template[]; empty.sets = undefined as unknown as SetRecord[];
  compare(empty, "no official never reads missing templates/sets");
  const noOfficial = tiny(); noOfficial.questions = noOfficial.questions.filter(q => q.origin.kind !== "official_reprint");
  noOfficial.templates.push(null as unknown as Template); noOfficial.sets.push(null as unknown as SetRecord);
  compare(noOfficial, "no official never reads malformed tails");
  const noBases = tiny(); noBases.questions = noBases.questions.filter(q => q.origin.kind === "official_reprint");
  noBases.templates.push(null as unknown as Template); noBases.sets.push(null as unknown as SetRecord);
  compare(noBases, "no bases never reads malformed template/set tails");
  const noTemplates = tiny(); noTemplates.templates = [];
  noTemplates.sets = undefined as unknown as SetRecord[];
  compare(noTemplates, "no templates never reads missing sets");
  const inactiveTemplates = tiny(); for (const t of inactiveTemplates.templates) t.lifecycle = "withdrawn";
  inactiveTemplates.sets.push(null as unknown as SetRecord);
  compare(inactiveTemplates, "no active templates never reads malformed set tail");
});


test("resolved mix queries preserve some-short-circuiting of unrelated malformed set and binding tails", () => {
  const resolved = tiny();
  for (const s of resolved.sets) s.generationBindings.push(null as unknown as SetRecord["generationBindings"][number]);
  resolved.sets.push(null as unknown as SetRecord);
  compare(resolved, "all needed queries resolved before malformed tails");
  const unrelated = tiny(), a = unrelated.sets[1].generationBindings[0];
  unrelated.sets[1].generationBindings.splice(1, 0,
    { templateRef: { id: "foreign-template", revision: 1 } } as SetRecord["generationBindings"][number],
    { templateRef: { id: a.templateRef.id, revision: a.templateRef.revision + 1 } } as SetRecord["generationBindings"][number],
    { templateRef: { ...a.templateRef } } as SetRecord["generationBindings"][number]);
  compare(unrelated, "foreign or resolved template never reads missing questionRef");
  for (const target of ["set", "binding"] as const) {
    const unresolved = tiny(); unresolved.sets[1].generationBindings.pop();
    if (target === "set") unresolved.sets.push(null as unknown as SetRecord);
    else unresolved.sets[1].generationBindings.push(null as unknown as SetRecord["generationBindings"][number]);
    assert.throws(() => scanCoverage(unresolved), TypeError, `old scan rejects needed malformed ${target}`);
    assert.throws(() => generationCoverage(unresolved), TypeError, `index rejects needed malformed ${target}`);
  }
});
