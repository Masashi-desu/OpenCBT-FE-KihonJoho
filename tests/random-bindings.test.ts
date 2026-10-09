import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import facts from "./fixtures/knowledge-pairs.json";
import { refOf, refKey, type Selection, type Template, type Bundle, type Question, type Run, type Instance } from "../src/core/types";
import { bookmarkGroupSelection, makeBookmark } from "../src/core/bookmarks";
import { generationCoverage } from "../src/core/generation-coverage";
import {
  answerSignature,
  answerCanVary,
  bindQuestion,
  checkParameters,
  contractFor,
  parametersForSeed,
} from "../src/core/generation";
import { nextQuestionRef, selectQuestions } from "../src/core/selection";
import {
  appendRunQuestion,
  finishRun,
  prepareRun,
  startRun,
  updateAnswer,
  validateRun,
} from "../src/core/session";

// Control only the parameter seed. IDs, question draws and choice shuffles use
// their normal randomness, so the tests exercise the public issuance paths.
function seedControl(ctx: TestContext) {
  const random = crypto.getRandomValues.bind(crypto);
  const control = { seed: "", draws: 0 };
  ctx.mock.method(crypto, "getRandomValues", (array: Uint8Array) => {
    if (array instanceof Uint8Array && array.length === 16) {
      assert.match(control.seed, /^[a-f0-9]{32}$/);
      array.set(Uint8Array.from(control.seed.match(/../g)!, (n) => parseInt(n, 16)));
      control.draws++;
      return array;
    }
    return random(array);
  });
  return control;
}

async function seedsFor(t: Template, candidates: number[][], maximum = 4096) {
  const missing = new Set(candidates.map((v) => JSON.stringify(v))),
    seeds = new Map<string, string>();
  for (let index = 0; index < maximum && missing.size; index++) {
    const seed = index.toString(16).padStart(32, "0"),
      key = JSON.stringify((await parametersForSeed(seed, t)).values);
    if (missing.delete(key)) seeds.set(key, seed);
  }
  assert.equal(missing.size, 0, `${t.id}: unreachable inputs ${[...missing].join(", ")}`);
  return seeds;
}

test("all reviewed finite precision pools are reachable by the actual seeded sampler", async (ctx) => {
  const bundle = fixture(), pools = new Map<string, number[][]>([
    ["2025-a-19", []], ["2025-a-4", []], ["2025-b-5", []],
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
  assert.deepEqual([...pools.values()].map((values) => values.length), [6002, 291, 592]);
  for (const [source, candidates] of pools) {
    const template = bundle.templates.find((t) => contractFor(t)!.source === source)!;
    candidates.forEach((values) => checkParameters(template, values));
    const seeds = await seedsFor(template, candidates, 131072);
    assert.equal(seeds.size, candidates.length);
    ctx.diagnostic(`${source}: all ${candidates.length} reviewed candidate inputs are reachable.`);
  }
});

function routesFor(bundle: Bundle, original: Question, template: Template) {
  const base = bundle.questions.find((q) => refKey(refOf(q)) === refKey(template.baseQuestionRef))!,
    individual: Selection = {
      subject: original.subject, kind: "bookmark", mode: "study",
      bookmarkQuestionRef: refOf(original), bindingMode: "generated_values",
    },
    group = bookmarkGroupSelection([makeBookmark(bundle, refOf(original))]),
    endless: Selection = {
      subject: original.subject, kind: "mix", mode: "endless",
      bindingMode: "generated_values",
    },
    mix: Selection = {
      subject: original.subject, kind: "mix", mode: "study", year: 2026,
      size: "public", bindingMode: "generated_values",
    };
  return [individual, group, endless, mix, { ...mix, mode: "practice" as const }].map((selection) => {
    const prepared = selectQuestions(bundle, selection, <T>(items: T[]) => [
      ...items.filter((q) => (q as Question).id === base.id),
      ...items.filter((q) => (q as Question).id !== base.id),
    ]);
    assert.equal(prepared.questions[0].id, base.id);
    // Keep the actual menu's candidate pool and policies, isolating one issued
    // slot to exhaust its bindings without unrelated random parameter draws.
    prepared.questions = [base];
    if (prepared.exam.questionCount !== undefined) prepared.exam.questionCount = 1;
    return { selection, prepared };
  });
}

test("all 103 series remain selectable in every applicable menu and actual endless random draw", async (ctx) => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows;
  for (const subject of ["A", "B"] as const) {
    const expected = rows.filter((row) => row.original.subject === subject)
      .map((row) => refKey(row.linked[0].baseQuestionRef)).sort();
    for (const mode of ["study", "practice", "endless"] as const)
      for (const year of [2023, 2024, 2025, 2026])
        for (const size of ["public", "full"] as const)
          for (const target of expected) {
            const prepared = selectQuestions(bundle, {
              subject, kind: "mix", mode, year, size, bindingMode: "generated_values",
            }, <T>(items: T[]) => [
              ...items.filter((q) => refKey(refOf(q as Question)) === target),
              ...items.filter((q) => refKey(refOf(q as Question)) !== target),
            ]);
            assert.deepEqual(prepared.set.questionRefs.map(refKey).sort(), expected);
            assert.equal(refKey(refOf(prepared.questions[0])), target);
          }
    const selection: Selection = { subject, kind: "mix", mode: "endless", bindingMode: "generated_values" },
      run = startRun(await prepareRun(bundle, selection, {}, 100000), 101000),
      refs = structuredClone(run.set.questionRefs),
      random = crypto.getRandomValues.bind(crypto);
    // Unequal historical frequency must not remove any series from the pool.
    run.session.entries.push(...Array.from({ length: 10 }, () => structuredClone(run.session.entries[0])));
    let targetIndex = 0, step = refs.length - 1;
    const mock = ctx.mock.method(crypto, "getRandomValues", (array: Uint32Array) => {
      if (array instanceof Uint32Array && array.length === 1) {
        assert(step >= 1);
        array[0] = step === targetIndex ? 0 : step;
        step--;
        return array;
      }
      return random(array);
    });
    for (targetIndex = 0; targetIndex < refs.length; targetIndex++) {
      step = refs.length - 1;
      assert.deepEqual(nextQuestionRef(run), refs[targetIndex]);
      assert.equal(step, 0);
    }
    mock.mock.restore();
    assert.deepEqual(run.set.questionRefs, refs);
  }
});

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

test("GPU and every reference/rotated binding can be issued on all four random practice paths", async (ctx) => {
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

test("every small-domain binding survives all five issuance paths and endless history, including baseline answers", async (ctx) => {
  const bundle = fixture(), control = seedControl(ctx);
  let templates = 0, inputs = 0, initialDraws = 0, appendedDraws = 0;
  for (const row of generationCoverage(bundle).rows) {
    const template = row.linked[0], fields = contractFor(template)!.fields;
    if (fields.reduce((n, f) => n * (f.maximum - f.minimum + 1), 1) > 256) continue;
    const candidates = fields.reduce<number[][]>((rows, f) => rows.flatMap((v) =>
      Array.from({ length: f.maximum - f.minimum + 1 }, (_, i) => [...v, f.minimum + i]),
    ), [[]]).filter((v) => {
      try {
        checkParameters(template, v);
        return true;
      } catch (e) {
        if ((e as { code?: string }).code !== "PARAMETER_CONSTRAINT") throw e;
        return false;
      }
    });
    assert(candidates.length > 1, template.id);
    const seeds = await seedsFor(template, candidates),
      routes = routesFor(bundle, row.original, template),
      precedents: Run[] = [],
      history: Instance[] = [];
    for (const values of candidates) {
      for (const { selection, prepared } of routes) {
        control.seed = seeds.get(JSON.stringify(values))!;
        control.draws = 0;
        const run = await prepareRun(bundle, selection, {}, 100000, undefined, prepared);
        assert.equal(control.draws, 1, `${template.id}/${selection.kind}/${selection.mode}: ${values}`);
        assert.deepEqual(run.instances[0].parameters.values, values, template.id);
        await validateRun(run);
        initialDraws++;
        if (selection.kind === "mix" && selection.mode === "endless") {
          history.push(run.instances[0]);
          if (!precedents.length || (precedents.length === 1 &&
            (!answerCanVary(template) || answerSignature(run.issued[0]) !== answerSignature(precedents[0].issued[0]))))
            precedents.push(startRun(run, 101000));
        }
      }
    }
    assert.equal(precedents.length, 2, `${template.id}: needs two eligible predecessors`);
    const base = bundle.questions.find((q) => refKey(refOf(q)) === refKey(template.baseQuestionRef))!;
    for (const values of candidates) {
      const question = bindQuestion(base, template, values, "history-check", "2026-10-09T00:00:00.000Z"),
        preceding = precedents.find((run) =>
          JSON.stringify(run.instances[0].parameters.values) !== JSON.stringify(values) &&
          (!answerCanVary(template) || answerSignature(run.issued[0]) !== answerSignature(question)),
        )!;
      assert(preceding, `${template.id}: ${values}`);
      control.seed = seeds.get(JSON.stringify(values))!;
      control.draws = 0;
      // History contains every binding, including the desired one. Open-ended
      // draws must only exclude this run's actual preceding condition/answer.
      const appended = await appendRunQuestion(preceding, template.baseQuestionRef, 102000, history);
      assert.equal(control.draws, 1, `${template.id}: ${values}`);
      assert.deepEqual(appended.instances[1].parameters.values, values);
      assert.deepEqual(appended.issued[0], preceding.issued[0]);
      appendedDraws++;
    }
    templates++;
    inputs += candidates.length;
  }
  ctx.diagnostic(`${templates} domains, ${inputs} valid inputs, ${initialDraws} initial draws across five paths, ${appendedDraws} draws with complete prior history.`);
});

test("all larger domains retain 64 seeded bindings on every issuance path and after endless history", async (ctx) => {
  const bundle = fixture(), control = seedControl(ctx);
  let templates = 0, inputs = 0, initialDraws = 0, appendedDraws = 0;
  for (const row of generationCoverage(bundle).rows) {
    const template = row.linked[0], fields = contractFor(template)!.fields;
    if (fields.reduce((n, f) => n * (f.maximum - f.minimum + 1), 1) <= 256) continue;
    const routes = routesFor(bundle, row.original, template),
      candidates: { seed: string; values: number[]; answer: string }[] = [],
      precedents: Run[] = [], history: Instance[] = [];
    for (let index = 0; index < 64; index++) {
      const seed = index.toString(16).padStart(32, "0"),
        { values } = await parametersForSeed(seed, template);
      let answer = "";
      for (const { selection, prepared } of routes) {
        control.seed = seed;
        control.draws = 0;
        const run = await prepareRun(bundle, selection, {}, 100000, undefined, prepared);
        assert.equal(control.draws, 1, `${template.id}/${selection.kind}/${selection.mode}: ${values}`);
        assert.deepEqual(run.instances[0].parameters.values, values);
        await validateRun(run);
        answer = answerSignature(run.issued[0]);
        initialDraws++;
        if (selection.kind === "mix" && selection.mode === "endless") {
          history.push(run.instances[0]);
          if (!precedents.length || (precedents.length === 1 &&
            (!answerCanVary(template) || answer !== answerSignature(precedents[0].issued[0]))))
            precedents.push(startRun(run, 101000));
        }
      }
      candidates.push({ seed, values, answer });
    }
    assert.equal(precedents.length, 2, template.id);
    for (const { seed, values, answer } of candidates) {
      const preceding = precedents.find((run) =>
        JSON.stringify(run.instances[0].parameters.values) !== JSON.stringify(values) &&
        (!answerCanVary(template) || answerSignature(run.issued[0]) !== answer),
      )!;
      assert(preceding, `${template.id}: ${values}`);
      control.seed = seed;
      control.draws = 0;
      const appended = await appendRunQuestion(preceding, template.baseQuestionRef, 102000, history);
      assert.equal(control.draws, 1, `${template.id}: ${values}`);
      assert.deepEqual(appended.instances[1].parameters.values, values);
      assert.deepEqual(appended.issued[0], preceding.issued[0]);
      appendedDraws++;
    }
    templates++;
    inputs += candidates.length;
  }
  ctx.diagnostic(`${templates} larger domains, ${inputs} seeded inputs, ${initialDraws} initial draws across five paths, ${appendedDraws} draws with prior history.`);
});

test("next-question draws revisit GPU and all bindings while retaining prior answers and rejecting adjacent repeats", async (ctx) => {
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
