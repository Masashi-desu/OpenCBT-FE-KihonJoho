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
import { sourceCollections } from "../src/core/source-collections";
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

function isAfternoon(original: Question) {
  const slots = new Set(original.origin.sourceRefs.flatMap(ref => ref.locator.timeSlot ? [ref.locator.timeSlot] : []));
  return original.subject === "B" && slots.size === 1 && slots.has("午後");
}

function legalAfternoonSelections(collection: Bundle["sets"][number]) {
  // Independently enumerate the source cover's omitted pair and language;
  // neither the production group counter nor shuffled question order is used.
  const refs = collection.questionRefs, policy = collection.questionSelection;
  assert.equal(refs.length, 13); assert(policy);
  assert.deepEqual(policy.requiredQuestionRefs, [refs[0], refs[7]]);
  assert.deepEqual(policy.optionalGroups.map(group => ({ refs: group.questionRefs, choose: group.choose })),
    [{ refs: refs.slice(1, 7), choose: 4 }, { refs: refs.slice(8), choose: 1 }]);
  const selections = [];
  for (let first = 1; first <= 6; first++) for (let second = first + 1; second <= 6; second++)
    for (let language = 8; language <= 12; language++)
      selections.push([refs[0], ...refs.slice(1, 7).filter((_, i) => i + 1 !== first && i + 1 !== second), refs[7], refs[language]]);
  assert.equal(selections.length, 75);
  return selections;
}

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
  // Old afternoon is excluded from the current B pool. Its individual,
  // explicit bookmark group and explicit endless pool are real one-major
  // issuance routes. Booklet study/practice retain paper order and all selected
  // majors, and are tested below without shrinking a legal seven-major run.
  const routes = isAfternoon(original)
    ? [individual, group, { ...endless, questionRefs: [refOf(base)] }]
    : [individual, group, endless, mix, { ...mix, mode: "practice" as const }];
  assert.equal(routes.length, isAfternoon(original) ? 3 : 5);
  return routes.map((selection) => {
    const prepared = selectQuestions(bundle, selection, <T>(items: T[]) => [
      ...items.filter((q) => (q as Question).id === base.id),
      ...items.filter((q) => (q as Question).id !== base.id),
    ]);
    assert.equal(prepared.questions[0].id, base.id);
    if (isAfternoon(original)) {
      assert.equal(prepared.questions.length, 1);
      assert.deepEqual(prepared.set.questionRefs, [template.baseQuestionRef]);
    } else {
      // Preserve the existing189 routes and actual candidate pools, isolating
      // their issued slot from unrelated parameter draws as before.
      prepared.questions = [base];
      if (prepared.exam.questionCount !== undefined) prepared.exam.questionCount = 1;
    }
    return { selection, prepared };
  });
}

test("all registered series remain in every applicable publication pool and draw only within nonzero area quotas", async (ctx) => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows;
  for (const subject of ["A", "B"] as const) {
    const subjectRows = rows.filter(row => row.original.subject === subject);
    const currentRows = subjectRows.filter(row => {
      const slots = new Set(row.original.origin.sourceRefs.flatMap(r => r.locator.timeSlot ? [r.locator.timeSlot] : []));
      return !slots.size || subject === "A" && slots.size === 1 && slots.has("午前");
    });
    const expected = currentRows
      .map((row) => refKey(row.linked[0].baseQuestionRef)).sort();
    const visited = new Set<string>();
    for (const collection of sourceCollections(bundle, subject)) {
      const owned = new Set(collection.questionRefs.map(refKey));
      const collectionRows = subjectRows.filter(row => owned.has(refKey(refOf(row.original))));
      const legacy = collectionRows.some(row => row.original.origin.sourceRefs.some(r => r.locator.timeSlot));
      if (collectionRows.some(row => isAfternoon(row.original))) {
        assert(collectionRows.every(row => isAfternoon(row.original)));
        const cases = [{ mode: "study" as const, refs: collection.questionRefs },
          ...legalAfternoonSelections(collection).map(refs => ({ mode: "practice" as const, refs }))];
        for (const item of cases) {
          const ownedSelection = new Set(item.refs.map(refKey));
          const selectedRows = collection.questionRefs.filter(ref => ownedSelection.has(refKey(ref)))
            .map(ref => collectionRows.find(row => refKey(refOf(row.original)) === refKey(ref))!);
          const expectedBases = selectedRows.map(row => row.linked[0].baseQuestionRef);
          const config: Selection = { subject, kind: "mix", mode: item.mode, mixProfileCollectionId: collection.id,
            size: "public", bindingMode: "generated_values",
            ...(item.mode === "practice" ? { selectedQuestionRefs: [...item.refs].reverse() } : {}) };
          const prepared = selectQuestions(bundle, config, items => [...items].reverse());
          assert.deepEqual(prepared.questions.map(refOf), expectedBases);
          assert.deepEqual(prepared.set.questionRefs, expectedBases);
          assert.equal(prepared.exam.questionOrder, "set");
          assert.equal(prepared.exam.questionCount, item.mode === "practice" ? 7 : 13);
          assert.equal(prepared.exam.timeLimitSeconds, item.mode === "practice" ? 9000 : undefined);
          const quota: Record<string, number> = {};
          selectedRows.forEach(row => { quota[row.original.learning.area] = (quota[row.original.learning.area] ?? 0) + 1; });
          assert.deepEqual(prepared.quota, quota);
          // Annual and generated routes must retain exactly the same chosen
          // major families in paper order, never replace a language by area.
          const annual = selectQuestions(bundle, { ...config, kind: "annual", sourceCollectionId: collection.id,
            mixProfileCollectionId: undefined, bindingMode: "original_data" });
          assert.deepEqual(annual.questions.map(refOf), selectedRows.map(row => refOf(row.original)));
          assert.equal(annual.exam.questionCount, prepared.exam.questionCount);
          assert.equal(annual.exam.timeLimitSeconds, prepared.exam.timeLimitSeconds);
          expectedBases.forEach(ref => visited.add(refKey(ref)));
        }
        ctx.diagnostic(`${collection.id}: all13 study and all75 legal seven-major paper-order mixes retained.`);
        continue;
      }
      const poolRows = legacy ? collectionRows : currentRows;
      const pool = poolRows.map(row => refKey(row.linked[0].baseQuestionRef)).sort();
      for (const mode of ["study", "practice"] as const)
        for (const size of legacy ? ["public"] as const : ["public", "full"] as const)
          for (const row of poolRows) {
            const target = refKey(row.linked[0].baseQuestionRef);
            const prepared = selectQuestions(bundle, {
              subject, kind: "mix", mode, mixProfileCollectionId: collection.id, size, bindingMode: "generated_values",
            }, <T>(items: T[]) => [
              ...items.filter((q) => refKey(refOf(q as Question)) === target),
              ...items.filter((q) => refKey(refOf(q as Question)) !== target),
            ]);
            assert.deepEqual(prepared.set.questionRefs.map(refKey).sort(), pool);
            if ((prepared.quota[row.original.learning.area] ?? 0) > 0)
              assert.equal(refKey(refOf(prepared.questions[0])), target);
            else assert(!prepared.questions.some(q => refKey(refOf(q)) === target), "zero-quota areas must not be issued");
            visited.add(target);
          }
    }
    assert.deepEqual([...visited].sort(), subjectRows.map(row => refKey(row.linked[0].baseQuestionRef)).sort());
    const selection: Selection = { subject, kind: "mix", mode: "endless", bindingMode: "generated_values" },
      run = startRun(await prepareRun(bundle, selection, {}, 100000), 101000),
      refs = structuredClone(run.set.questionRefs),
      random = crypto.getRandomValues.bind(crypto);
    assert.deepEqual(refs.map(refKey).sort(), expected);
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
    const afternoonRows = subjectRows.filter(row => isAfternoon(row.original));
    if (afternoonRows.length) {
      const explicitRefs = afternoonRows.map(row => row.linked[0].baseQuestionRef);
      assert(explicitRefs.every(ref => !refs.some(current => refKey(current) === refKey(ref))), "old PM must stay out of the current endless pool");
      for (const target of explicitRefs) {
        const explicit = selectQuestions(bundle, { subject, kind: "mix", mode: "endless", bindingMode: "generated_values",
          questionRefs: explicitRefs }, <T>(items: T[]) => [...items.filter(q => refKey(refOf(q as Question)) === refKey(target)),
            ...items.filter(q => refKey(refOf(q as Question)) !== refKey(target))]);
        assert.deepEqual(explicit.set.questionRefs, explicitRefs);
        assert.deepEqual(refOf(explicit.questions[0]), target);
      }
    }
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

// Only this source-reviewed 1081-input domain is admitted above the existing
// exhaustive256 bound. Identity, version and both declared domains are pinned;
// any future enlargement or another old-PM domain still fails for review.
function finiteSeedBudget(template: Template, contract: NonNullable<ReturnType<typeof contractFor>>, afternoon: boolean) {
  const fields = contract.fields,
    capacity = fields.reduce((n, f) => n * (f.maximum - f.minimum + 1), 1);
  if (template.id === "template-source-2018h30a-fe-pm-13") {
    assert(afternoon);
    assert.equal(contract.source, "2018h30a-fe-pm-13");
    assert.equal(contract.version, "3.2.0");
    assert.deepEqual(template.generatorRef, { id: "generator-source-2018h30a-fe-pm-13", version: "3.2.0" });
    const reviewedFields = [{ name: "待ち時間を分析する利用状況の例", minimum: 0, maximum: 1080 }];
    assert.deepEqual(fields, reviewedFields);
    assert.deepEqual(template.parameterDomain, { values: { length: 1, minimum: 0, maximum: 1080 }, fields: reviewedFields });
    assert.deepEqual(contract.reference, [0]);
    assert.deepEqual(template.referenceParameters.values, [0]);
    assert.equal(capacity, 1081);
    return 32768;
  }
  if (afternoon) assert(capacity <= 256, `${template.id}: all finite afternoon inputs require exhaustive coverage`);
  return capacity <= 256 ? 4096 : undefined;
}

test("only the exact reviewed2018 autumnQ13 domain expands exhaustive finite sampler coverage", () => {
  const bundle = fixture(), row = generationCoverage(bundle).rows.find(row => row.linked[0].id === "template-source-2018h30a-fe-pm-13")!,
    template = row.linked[0], contract = contractFor(template)!;
  assert.equal(finiteSeedBudget(template, contract, isAfternoon(row.original)), 32768);
  const mutants: ((template: Template, contract: NonNullable<ReturnType<typeof contractFor>>) => void)[] = [
    t => { t.id = "template-source-2018h30a-fe-pm-12"; },
    t => { t.generatorRef.id = "generator-source-2018h30a-fe-pm-12"; },
    t => { t.generatorRef.version = "3.3.0"; },
    (_t, c) => { c.source = "2018h30a-fe-pm-12"; },
    (_t, c) => { c.version = "3.3.0"; },
    (_t, c) => { c.fields[0].name = "未査読の入力"; },
    (_t, c) => { c.fields[0].minimum = 1; },
    (_t, c) => { c.fields[0].maximum = 1081; },
    (_t, c) => { c.fields.push({ ...c.fields[0] }); },
    t => { t.parameterDomain.fields![0].maximum = 1081; },
    t => { t.parameterDomain.values.maximum = 1081; },
    t => { t.parameterDomain.values.length = 2; },
    t => { t.referenceParameters.values = [1]; },
    (_t, c) => { c.reference = [1]; },
  ];
  for (const mutate of mutants) {
    const t = structuredClone(template), c = structuredClone(contract);
    mutate(t, c);
    assert.throws(() => finiteSeedBudget(t, c, true), { code: "ERR_ASSERTION" });
  }
  assert.throws(() => finiteSeedBudget(template, contract, false), { code: "ERR_ASSERTION" });
  for (const old of generationCoverage(bundle).rows.filter(r => isAfternoon(r.original) && r.linked[0].id !== template.id)) {
    const t = old.linked[0], c = structuredClone(contractFor(t)!);
    assert.equal(finiteSeedBudget(t, c, true), 4096);
    c.fields = [{ name: "未査読の拡大域", minimum: 0, maximum: 256 }];
    assert.throws(() => finiteSeedBudget(t, c, true), { code: "ERR_ASSERTION" });
  }
  const current = generationCoverage(bundle).rows.find(r => !isAfternoon(r.original) && contractFor(r.linked[0])!.fields.reduce((n, f) => n * (f.maximum - f.minimum + 1), 1) > 256)!;
  assert.equal(finiteSeedBudget(current.linked[0], contractFor(current.linked[0])!, false), undefined);
});

test("every small-domain binding survives every applicable issuance path and endless history, including all old afternoon inputs", async (ctx) => {
  const bundle = fixture(), control = seedControl(ctx);
  let templates = 0, inputs = 0, initialDraws = 0, appendedDraws = 0;
  let afternoonInputs = 0, afternoonInitialDraws = 0, afternoonAppendedDraws = 0;
  const afternoonTemplates: string[] = [];
  for (const row of generationCoverage(bundle).rows) {
    const template = row.linked[0], contract = contractFor(template)!, fields = contract.fields,
      afternoon = isAfternoon(row.original), maximumSeeds = finiteSeedBudget(template, contract, afternoon);
    if (maximumSeeds === undefined) continue;
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
    if (template.id === "template-source-2018h30a-fe-pm-13") assert.equal(candidates.length, 1081);
    const seeds = await seedsFor(template, candidates, maximumSeeds),
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
        if (afternoon) afternoonInitialDraws++;
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
      if (afternoon) afternoonAppendedDraws++;
    }
    templates++;
    inputs += candidates.length;
    if (afternoon) { afternoonTemplates.push(template.id); afternoonInputs += candidates.length; }
  }
  assert.deepEqual(afternoonTemplates.sort(), generationCoverage(bundle).rows.filter(row => isAfternoon(row.original)).map(row => row.linked[0].id).sort());
  assert.equal(afternoonInitialDraws, afternoonInputs * 3); assert.equal(afternoonAppendedDraws, afternoonInputs);
  assert.equal(initialDraws - afternoonInitialDraws, (inputs - afternoonInputs) * 5);
  ctx.diagnostic(`${templates} domains, ${inputs} valid inputs, ${initialDraws} initial draws, ${appendedDraws} draws with complete prior history; current-format domains retain all five paths.`);
  ctx.diagnostic(`Old afternoon: ${afternoonTemplates.length} domains, all ${afternoonInputs} finite inputs, ${afternoonInitialDraws} initial draws on three applicable explicit routes, ${afternoonAppendedDraws} history draws; all75 booklet selections separately retained.`);
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
