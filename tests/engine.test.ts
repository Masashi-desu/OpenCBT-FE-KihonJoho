import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fixture } from "./fixtures";
import { type Selection } from "../src/core/types";
import { validateBundle, validateFormula } from "../src/core/validation";
import { parametersForSeed, bindArraySum } from "../src/core/generation";
import { selectQuestions, quotasFor } from "../src/core/selection";
import {
  prepareRun,
  startRun,
  finishRun,
  updateAnswer,
  remaining,
  validateRun,
} from "../src/core/session";
import { contentHash } from "../src/core/hash";
const selection: Selection = {
  subject: "B",
  kind: "mix",
  year: 2026,
  mode: "study",
  size: "public",
  bindingMode: "generated_values",
};
const legacyTemplate = () => ({
  t: JSON.parse(
    fs.readFileSync("docs/public/data/templates/array-sum.json", "utf8"),
  ),
  base: JSON.parse(
    fs.readFileSync("docs/public/data/questions/diagram-base.json", "utf8"),
  ),
});
test("distribution gate: real sources, official answer keys, JIS exclusion and Schema", async () => {
  const b = fixture();
  await validateBundle(b);
  assert.equal(b.questions.length, 206);
  assert.equal(
    b.questions.filter((q) => q.origin.kind === "official_reprint").length,
    103,
  );
  assert(!b.questions.some((q) => q.id === "question-ipa-2025-b-6"));
  const keys = {
    2023: { A: "ウウエエイウイエウウエウエウエイウウエア", B: "アクエエエア" },
    2024: { A: "ウエイエウアウウウエウエウウエエアエエア", B: "イエエイオウ" },
    2025: { A: "エイイウアウエエウアウエエエウエイエエイ", B: "カアイクオク" },
    2026: { A: "イウイイイイエアウウアウアエウアイアアイ", B: "エカアエイケ" },
  };
  for (const q of b.questions.filter(
    (q) => q.origin.kind === "official_reprint",
  )) {
    const r = q.origin.sourceRefs[0],
      year = r.locator.year as keyof typeof keys,
      n = Number(r.locator.questionNumber);
    assert.equal(
      q.choices.find((c) => c.id === q.correctAnswer.choiceId)!.content
        .blocks[0].type,
      "paragraph",
    );
    assert.equal(
      (
        q.choices.find((c) => c.id === q.correctAnswer.choiceId)!.content
          .blocks[0] as { text: string }
      ).text,
      keys[year][q.subject][n - 1],
    );
  }
});
test("annual originals remain in source order and have no binding", async () => {
  const b = fixture(),
    s = { ...selection, subject: "A" as const, kind: "annual" as const };
  const chosen = selectQuestions(b, s);
  assert.deepEqual(
    chosen.questions.map((q) =>
      Number(q.origin.sourceRefs[0].locator.questionNumber),
    ),
    Array.from({ length: 20 }, (_, i) => i + 1),
  );
  const r = await prepareRun(b, s, {}, 100000);
  assert(
    r.session.entries.every(
      (e) => !e.issuedContent.bindingPerformed && !e.issuedContent.isModified,
    ),
  );
  await validateRun(r);
});
test("random mix preserves each reference-year area quota, including 60-question A", () => {
  const b = fixture();
  for (const year of [2023, 2024, 2025, 2026])
    for (const size of ["public", "full"] as const) {
      const s = {
        ...selection,
        subject: "A" as const,
        kind: "mix" as const,
        year,
        size,
      };
      for (let n = 0; n < 8; n++) {
        const out = selectQuestions(b, s);
        assert.equal(out.questions.length, size === "full" ? 60 : 20);
        const quota = quotasFor(b, s);
        for (const [area, count] of Object.entries(quota))
          assert.equal(
            out.questions.filter((q) => q.learning.area === area).length,
            count,
          );
        assert(
          out.questions.every((q) =>
            b.templates.some((t) => t.baseQuestionRef.questionId === q.id),
          ),
        );
        assert.equal(out.exam.duplicatePolicy, "instance_unique");
      }
    }
});
test("B generation mix: 5:1 short and 16:4 full; missing generator blocks", () => {
  const b = fixture();
  const s = { ...selection, kind: "mix" as const };
  assert.equal(
    selectQuestions(b, s).questions.filter(
      (q) => q.learning.area === "security",
    ).length,
    1,
  );
  const out = selectQuestions(b, { ...s, size: "full" });
  assert.equal(out.questions.length, 20);
  assert.equal(
    out.questions.filter((q) => q.learning.area === "security").length,
    4,
  );
  const missing = structuredClone(b);
  missing.templates = missing.templates.filter(
    (t) =>
      !missing.questions.some(
        (q) =>
          q.id === t.baseQuestionRef.questionId &&
          q.learning.area === "security",
      ),
  );
  assert.throws(
    () => selectQuestions(missing, { ...s, size: "full" }),
    /テンプレートがありません/,
  );
});
test("all 729 parameter combinations keep body, diagram, choices, answer and explanation coherent", () => {
  const { t, base } = legacyTemplate(),
    original = JSON.stringify(base);
  for (let a = 1; a <= 9; a++)
    for (let c = 1; c <= 9; c++)
      for (let d = 1; d <= 9; d++) {
        const q = bindArraySum(
            base,
            t,
            [a, c, d],
            "instance-unit",
            "2026-10-06T12:00:00Z",
          ),
          total = a + c + d;
        assert(q.origin.isModified);
        assert.equal(
          (
            q.choices.find((c) => c.id === q.correctAnswer.choiceId)!.content
              .blocks[0] as { text: string }
          ).text,
          String(total),
        );
        const table = q.prompt.blocks.find((b) => b.type === "table")!;
        assert.deepEqual(
          table.type === "table" ? table.rows.map((r) => Number(r[1])) : [],
          [a, c, d],
        );
        const diagram = q.prompt.blocks.find((b) => b.type === "diagram")!;
        assert.deepEqual(
          diagram.type === "diagram" && diagram.scene.kind === "array"
            ? diagram.scene.cells.map((c) => c.value)
            : [],
          [a, c, d],
        );
        assert(
          (q.explanation.blocks[0] as { text: string }).text.includes(
            `最終値は${total}`,
          ),
        );
        assert.equal(
          new Set(
            q.choices.map(
              (c) => (c.content.blocks[0] as { text: string }).text,
            ),
          ).size,
          4,
        );
      }
  assert.equal(JSON.stringify(base), original);
});
test("seed contract is deterministic and bounded; binding reference values is still modified", async () => {
  const { t, base } = legacyTemplate(),
    seed = "0123456789abcdef0123456789abcdef";
  const p = await parametersForSeed(seed, t);
  // Independent SHA-256 reference vector, calculated from the specified UTF-8 input.
  assert.deepEqual(p.values, [2, 7, 8]);
  assert.deepEqual(p, await parametersForSeed(seed, t));
  assert(p.values.every((v) => v >= 1 && v <= 9));
  assert(
    bindArraySum(
      base,
      t,
      t.referenceParameters.values,
      "instance-base",
      "2026-10-06T12:00:00Z",
    ).origin.isModified,
  );
  await assert.rejects(parametersForSeed("bad", t));
});
test("original snapshot is persisted before generation and generated questions survive validation", async () => {
  const b = fixture(),
    before = JSON.stringify(b);
  let called = false;
  const r = await prepareRun(
    b,
    { ...selection, bindingMode: "generated_values" },
    {},
    Date.now(),
    async (_, original) => {
      called = true;
      assert.equal(JSON.stringify(original), before);
    },
  );
  assert(called);
  assert.equal(r.instances.length, r.issued.length);
  assert(r.session.entries.every((e) => e.issuedContent.bindingPerformed));
  assert.equal(JSON.stringify(b), before);
  await validateRun(r);
  assert.equal(
    await contentHash(
      r.bundle.questions.find(
        (q) => q.id === b.templates[0].baseQuestionRef.questionId,
      ),
    ),
    b.templates[0].originalContentSha256,
  );
});
test("deadline persists and late answers expire; unanswered counts in denominator", async () => {
  const b = fixture();
  let run = startRun(
    await prepareRun(
      b,
      { ...selection, subject: "A", kind: "annual", mode: "practice" },
      {},
      Date.now(),
    ),
    Date.now(),
  );
  const started = Date.parse(run.session.startedAt!);
  assert.equal(remaining(run, started), 1800);
  const deadline = Date.parse(run.session.deadlineAt!);
  run = updateAnswer(run, run.issued[0].correctAnswer.choiceId, started + 1000);
  run = updateAnswer(run, run.issued[0].choices[0].id, deadline);
  assert.equal(run.session.status, "expired");
  assert.equal(run.session.endedAt, run.session.deadlineAt);
  assert.equal(run.result!.correct, 1);
  assert.equal(run.result!.unanswered, 19);
  assert.equal(run.result!.learningAccuracyPercent, 5);
  await validateRun(run);
});
test("choice IDs, original hash, references, duplicate IDs and distribution failures are rejected", async () => {
  const b = fixture();
  for (const change of [
    (x: typeof b) => {
      x.questions[0].correctAnswer.choiceId = "choice-missing";
    },
    (x: typeof b) => {
      x.questions.push(x.questions[0]);
    },
    (x: typeof b) => {
      x.templates[0].originalContentSha256 = "0".repeat(64);
    },
    (x: typeof b) => {
      x.questions[0].prompt.attribution.sourceRefs = [
        { sourceId: "source-missing", locator: { section: "missing" } },
      ];
    },
    (x: typeof b) => {
      x.questions[0].distribution = "docs_only";
    },
  ]) {
    const bad = structuredClone(b);
    change(bad);
    await assert.rejects(validateBundle(bad));
  }
  let run = startRun(await prepareRun(b, selection, {}));
  run.session.entries[0].selectedChoiceId = "choice-missing";
  await assert.rejects(validateRun(run));
});
test("formula commands are limited and pseudocode remains display-only", () => {
  validateFormula("\\frac{1}{2} + \\sum_{i=1}^{4} i");
  for (const input of [
    "\\href{https://bad}{x}",
    "\\htmlClass{bad}{x}",
    "$x$",
    "x%comment",
    "\\begin{matrix}x\\begin{matrix}y\\end{matrix}\\end{matrix}",
  ])
    assert.throws(() => validateFormula(input));
  assert(!fs.readFileSync("src/ui/Content.tsx", "utf8").includes("eval("));
});

test("invalidated sessions retain the reason and stop accepting answers", async () => {
  const b = fixture(),
    running = startRun(
      await prepareRun(
        b,
        { ...selection, subject: "A", kind: "annual", mode: "practice" },
        {},
      ),
    );
  const invalid = finishRun(running, "invalidated", Date.now(), "clock_change");
  assert.equal(invalid.session.invalidationReason, "clock_change");
  assert.equal(invalid.result, undefined);
  await validateRun(invalid);
  assert.throws(() => updateAnswer(invalid, invalid.issued[0].choices[0].id));
  const broken = structuredClone(running);
  broken.session.examConfigRef.id = "exam-missing";
  await assert.rejects(validateRun(broken), /参照/);
});
test("withdrawn content cannot remain in the active distribution", async () => {
  const b = fixture();
  b.catalog.withdrawals.push({
    questionRef: { questionId: b.questions[0].id, revision: 1 },
    category: "rights_request",
    reason: "Fixture removal",
    recordedOn: "2026-10-06",
  });
  await assert.rejects(validateBundle(b), /取り下げ/);
});

test("withdrawal replacements must resolve to an included immutable question revision", async () => {
  const b = fixture();
  assert(b.catalog.withdrawals.length > 0);
  for (const withdrawal of b.catalog.withdrawals)
    assert(
      b.questions.some(
        (q) =>
          q.id === withdrawal.replacement?.questionId &&
          q.revision === withdrawal.replacement?.revision,
      ),
    );
  const stale = structuredClone(b);
  stale.catalog.withdrawals[0].replacement!.revision = 3;
  await assert.rejects(validateBundle(stale), { code: "REFERENCE" });
  const missing = structuredClone(b);
  missing.catalog.withdrawals[0].replacement!.questionId = "question-missing";
  await assert.rejects(validateBundle(missing), { code: "REFERENCE" });
});
