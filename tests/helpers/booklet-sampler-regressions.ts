import test from "node:test";
import assert from "node:assert/strict";
import {fixture} from "../fixtures";
import facts from "../fixtures/knowledge-pairs.json";
import {refOf, type Selection, type Template} from "../../src/core/types";
import {bookmarkGroupSelection, makeBookmark} from "../../src/core/bookmarks";
import {generationCoverage} from "../../src/core/generation-coverage";
import {answerSignature, checkParameters, contractFor} from "../../src/core/generation";
import {selectQuestions} from "../../src/core/selection";
import {appendRunQuestion, finishRun, prepareRun, startRun, updateAnswer, validateRun} from "../../src/core/session";
import {seedControl, seedsFor, isAfternoon, finiteSeedBudget} from "./generation-paths/issuance";

// Source-owned sampler regressions keep their full independent inputs and
// seed budgets; ordinary shared pool/policy contracts stay in random-bindings.
export const bookletSamplerRegressionInventory = {
  "2025-a": {
    "scope": "2025-a",
    "count": 1,
    "caseNames": [
      "2025-a: all reviewed finite precision pools are reachable by the actual seeded sampler"
    ],
    "sourceIds": [
      "2025-a-19",
      "2025-a-4"
    ],
    "work": {
      "precisionPools": [
        {
          "source": "2025-a-19",
          "candidates": 6002,
          "maximumSeeds": 131072
        },
        {
          "source": "2025-a-4",
          "candidates": 291,
          "maximumSeeds": 131072
        }
      ]
    }
  },
  "2025-b": {
    "scope": "2025-b",
    "count": 1,
    "caseNames": [
      "2025-b: all reviewed finite precision pools are reachable by the actual seeded sampler"
    ],
    "sourceIds": [
      "2025-b-5"
    ],
    "work": {
      "precisionPools": [
        {
          "source": "2025-b-5",
          "candidates": 592,
          "maximumSeeds": 131072
        }
      ]
    }
  },
  "2026-a": {
    "scope": "2026-a",
    "count": 2,
    "caseNames": [
      "2026-a: GPU and every reference/rotated binding can be issued on all four random practice paths",
      "2026-a: next-question draws revisit GPU and all bindings while retaining prior answers and rejecting adjacent repeats"
    ],
    "sourceIds": [
      "2026-a-3"
    ],
    "work": {
      "gpuInputs": 12,
      "initialRoutes": 4,
      "initialRuns": 48,
      "appendRoutes": 3,
      "questionsPerAppendRun": 24,
      "adjacentRepeatFailureCasesPerRoute": 2
    }
  },
  "2019-autumn-pm": {
    "scope": "2019-autumn-pm",
    "count": 1,
    "caseNames": [
      "2019-autumn-pm: only the exact reviewed2019 autumnQ2 five-field domain extends exhaustive coverage to all1125 inputs"
    ],
    "sourceIds": [
      "2019r01a-fe-pm-2"
    ],
    "work": {
      "finiteInputs": 1125,
      "maximumSeeds": 32768
    }
  }
} as const;

const gpuValues = Array.from({ length: 3 }, (_, rotation) =>
  Array.from({ length: 4 }, (_, target) => [target, rotation]),
).flat();

function gpuSelections() {
  const bundle = fixture(),
    row = generationCoverage(bundle).rows.find((r) => r.original.id === "question-ipa-2026-a-3")!,
    template = row.linked[0],
    individual: Selection = {
      subject: "A", kind: "bookmark", mode: "study",
      bookmarkQuestionRef: refOf(row.original), bindingMode: "generated_values",
    },
    group = bookmarkGroupSelection([makeBookmark(bundle, refOf(row.original))]),
    endless: Selection = {
      subject: "A", kind: "mix", mode: "endless", bindingMode: "generated_values",
      questionRefs: [template.baseQuestionRef],
    },
    mix: Selection = {
      subject: "A", kind: "mix", mode: "study", year: 2026, size: "public",
      bindingMode: "generated_values",
    },
    fixed = selectQuestions(bundle, mix),
    base = bundle.questions.find((q) => q.id === template.baseQuestionRef.questionId)!;
  // Isolate the reported series inside the normal fixed-length mix policy.
  fixed.questions = [base];
  fixed.set.questionRefs = [template.baseQuestionRef];
  fixed.set.generationBindings = [{ questionRef: template.baseQuestionRef, templateRef: { id: template.id, revision: template.revision } }];
  fixed.exam.questionCount = 1;
  return { bundle, template, routes: [
    { selection: individual, prepared: selectQuestions(bundle, individual) },
    { selection: group, prepared: selectQuestions(bundle, group) },
    { selection: endless, prepared: selectQuestions(bundle, endless) },
    { selection: mix, prepared: fixed },
  ] };
}

function verifyGpu(question: ReturnType<typeof fixture>["questions"][number], target: number) {
  const fact = facts.find((f) => f.source === "2026-a-3")!,
    [term, meaning] = fact.pairs[target];
  assert(question.prompt.blocks.some((b) => "text" in b && b.text.includes(term)));
  assert.equal(answerSignature(question), meaning);
  const choices = question.choices.map((c) => c.content.blocks.map((b) => "text" in b ? b.text : "").join("\n"));
  assert.deepEqual(choices.slice().sort(), fact.pairs.map(([, meaning]) => meaning).sort());
  assert.equal(choices.filter((choice) => choice === meaning).length, 1);
}

export function registerBookletSamplerRegressionTests(scope: string): void {
  assert(Object.hasOwn(bookletSamplerRegressionInventory, scope), 'unknown booklet sampler-regression scope');
  if (scope === "2025-a") {
    test("2025-a: all reviewed finite precision pools are reachable by the actual seeded sampler", async (ctx) => {
  const bundle = fixture(), pools = new Map<string, number[][]>([
    ["2025-a-19", []],
    ["2025-a-4", []],
  ]);
  // These independently enumerated pools match the reviewed input design used
  // by calculation-difficulty.test.ts; no expected candidates come from draws.
  for (const price of [400, 500, 600, 800, 1000])
    for (const cost of [100, 200])
      for (const days of [15, 20, 25])
        for (const seats of [10, 15, 20])
          for (let quarters = 8; quarters <= 32; quarters++)
            for (let profit = 50000; profit <= 200000; profit += 25000) {
              const fixed = ((price - cost) * days * seats * quarters) / 4 - profit;
              if (fixed < 50000 || fixed > 500000 || fixed % 2500 !== 0) continue;
              pools.get("2025-a-19")!.push([price, cost, fixed, profit, days, seats]);
            }
  for (let bf = 1000; bf <= 8000; bf += 500)
    for (let tr = 500; tr <= 2000; tr += 500)
      for (let delta = 50; delta <= 150; delta += 50)
        for (let years = 1; years <= 6; years++) {
          if (tr <= delta * years || ((bf + delta * years) * 100) % (bf + tr) !== 0) continue;
          pools.get("2025-a-4")!.push([bf, tr, delta, years]);
        }
  assert.deepEqual([...pools.values()].map((values) => values.length), [6002,291]);
  for (const [source, candidates] of pools) {
    const template = bundle.templates.find((t) => contractFor(t)!.source === source)!;
    candidates.forEach((values) => checkParameters(template, values));
    const seeds = await seedsFor(template, candidates, 131072);
    assert.equal(seeds.size, candidates.length);
    ctx.diagnostic(`${source}: all ${candidates.length} reviewed candidate inputs are reachable.`);
  }
});
  }
  if (scope === "2025-b") {
    test("2025-b: all reviewed finite precision pools are reachable by the actual seeded sampler", async (ctx) => {
  const bundle = fixture(), pools = new Map<string, number[][]>([
    ["2025-b-5", []],
  ]);
  // These independently enumerated pools match the reviewed input design used
  // by calculation-difficulty.test.ts; no expected candidates come from draws.
  for (const r1 of [4, 6, 8, 10])
    for (const r2 of [4, 6, 8, 10])
      for (const c1 of [6, 8, 10])
        for (const c2 of [1, 2])
          for (let offset = -4; offset <= 4; offset++) {
            const values = [r1 * c1 + offset, r1 * c2 - offset, r2 * c1 - offset, r2 * c2 + offset];
            if (offset === 0 || values[0] < 20 || values[0] > 100 ||
              values[2] < 20 || values[2] > 100 || values[1] < 1 || values[1] > 20 ||
              values[3] < 1 || values[3] > 20) continue;
            pools.get("2025-b-5")!.push(values);
          }
  assert.deepEqual([...pools.values()].map((values) => values.length), [592]);
  for (const [source, candidates] of pools) {
    const template = bundle.templates.find((t) => contractFor(t)!.source === source)!;
    candidates.forEach((values) => checkParameters(template, values));
    const seeds = await seedsFor(template, candidates, 131072);
    assert.equal(seeds.size, candidates.length);
    ctx.diagnostic(`${source}: all ${candidates.length} reviewed candidate inputs are reachable.`);
  }
});
  }
  if (scope === "2026-a") {
    test("2026-a: GPU and every reference/rotated binding can be issued on all four random practice paths", async (ctx) => {
  const { bundle, template, routes } = gpuSelections(),
    seeds = await seedsFor(template, gpuValues),
    control = seedControl(ctx),
    original = structuredClone(bundle);
  for (const { selection, prepared } of routes)
    for (const values of gpuValues) {
      control.seed = seeds.get(JSON.stringify(values))!;
      control.draws = 0;
      const run = await prepareRun(bundle, selection, {}, 100000, undefined, prepared);
      assert.equal(control.draws, 1, `${selection.kind}/${selection.mode}: ${values}`);
      assert.deepEqual(run.instances[0].parameters.values, values);
      assert(run.session.entries[0].issuedContent.bindingPerformed);
      assert(run.issued[0].origin.isModified);
      verifyGpu(run.issued[0], values[0]);
      await validateRun(structuredClone(run));
    }
  assert.deepEqual(bundle, original);
});
    test("2026-a: next-question draws revisit GPU and all bindings while retaining prior answers and rejecting adjacent repeats", async (ctx) => {
  const { bundle, template, routes } = gpuSelections(),
    seeds = await seedsFor(template, gpuValues), control = seedControl(ctx);
  for (const { selection, prepared } of routes.slice(0, 3)) {
    control.seed = seeds.get("[0,0]")!;
    let run = updateAnswer(startRun(await prepareRun(bundle, selection, {}, 100000, undefined, prepared), 101000), "choice-value-1", 102000);
    const saved = structuredClone(run);
    for (const [index, values] of [...gpuValues, ...gpuValues].entries()) {
      if (index) {
        control.seed = seeds.get(JSON.stringify(values))!;
        control.draws = 0;
        run = await appendRunQuestion(run, undefined, 103000 + index * 1000);
        assert.equal(control.draws, 1);
      }
      assert.deepEqual(run.instances[index].parameters.values, values);
      verifyGpu(run.issued[index], values[0]);
    }
    assert.deepEqual(run.issued[0], saved.issued[0]);
    assert.deepEqual(run.session.entries[0], saved.session.entries[0]);
    const beforeFailure = structuredClone(run);
    // Repeating the exact input, or rotating only the preceding target's
    // choices, still fails within the finite retry limit.
    for (const values of [[3, 2], [3, 0]]) {
      control.seed = seeds.get(JSON.stringify(values))!;
      await assert.rejects(appendRunQuestion(run, undefined, 150000), { code: "GENERATION_CAPACITY" });
      assert.deepEqual(run, beforeFailure);
    }
    const completed = finishRun(run, "completed", 160000);
    assert.equal(completed.result!.total, 24);
    assert.equal(completed.result!.correct, 1);
    await validateRun(structuredClone(completed));
  }
});
  }
  if (scope === "2019-autumn-pm") {
    test("2019-autumn-pm: only the exact reviewed2019 autumnQ2 five-field domain extends exhaustive coverage to all1125 inputs", async () => {
  const bundle = fixture(), row = generationCoverage(bundle).rows.find(row => row.linked[0].id === "template-source-2019r01a-fe-pm-2")!,
    template = row.linked[0], contract = contractFor(template)!;
  assert.equal(finiteSeedBudget(template, contract, isAfternoon(row.original)), 32768);
  const mutants: ((template: Template, contract: NonNullable<ReturnType<typeof contractFor>>) => void)[] = [
    t => { t.id = "template-source-2019r01a-fe-pm-3"; },
    t => { t.generatorRef.id = "generator-source-2019r01a-fe-pm-3"; },
    t => { t.generatorRef.version = "3.3.0"; },
    (_t, c) => { c.source = "2019r01a-fe-pm-3"; },
    (_t, c) => { c.version = "3.3.0"; },
    (_t, c) => { c.fields.push({ ...c.fields[0] }); },
    (_t, c) => { c.fields.reverse(); },
    t => { t.parameterDomain.values.length = 4; },
    t => { t.parameterDomain.values.minimum = -1; },
    t => { t.parameterDomain.values.maximum = 5; },
    t => { t.referenceParameters.values = [2, 4, 2, 1, 1]; },
    (_t, c) => { c.reference = [2, 4, 2, 1, 1]; },
    ...contract.fields.flatMap((_, index) => [
      (_t: Template, c: NonNullable<ReturnType<typeof contractFor>>) => { c.fields[index].name += "未査読"; },
      (_t: Template, c: NonNullable<ReturnType<typeof contractFor>>) => { c.fields[index].minimum--; },
      (_t: Template, c: NonNullable<ReturnType<typeof contractFor>>) => { c.fields[index].maximum++; },
      (t: Template) => { t.parameterDomain.fields![index].maximum++; },
    ]),
  ];
  for (const mutate of mutants) {
    const t = structuredClone(template), c = structuredClone(contract); mutate(t, c);
    assert.throws(() => finiteSeedBudget(t, c, true), { code: "ERR_ASSERTION" });
  }
  assert.throws(() => finiteSeedBudget(template, contract, false), { code: "ERR_ASSERTION" });
  const candidates: number[][] = [];
  for (let thread = 2; thread <= 4; thread++) for (let fraction = 0; fraction <= 4; fraction++)
    for (let limit = 0; limit <= 4; limit++) for (let half = 0; half <= 2; half++)
      for (let indirect = 0; indirect <= 4; indirect++) candidates.push([thread, fraction, limit, half, indirect]);
  assert.equal(candidates.length, 1125);
  candidates.forEach(values => checkParameters(template, values));
  assert.equal((await seedsFor(template, candidates, finiteSeedBudget(template, contract, true))).size, 1125);
});
  }
}
