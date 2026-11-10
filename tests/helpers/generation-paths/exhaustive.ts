import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../../fixtures";
import { refOf, refKey, type Selection, type Question, type Run, type Instance, type Bundle } from "../../../src/core/types";
import { generationCoverage } from "../../../src/core/generation-coverage";
import { answerSignature, answerCanVary, bindQuestion, checkParameters, contractFor, parametersForSeed } from "../../../src/core/generation";
import { selectQuestions } from "../../../src/core/selection";
import { sourceCollections } from "../../../src/core/source-collections";
import { appendRunQuestion, prepareRun, startRun, validateRun } from "../../../src/core/session";
import { seedControl, seedsFor, isAfternoon, legalAfternoonSelections, routesFor, finiteSeedBudget, expectedAfternoonSelectionCount } from "./issuance";
import { bookletRows, bookletKinds, generationPathTestName } from "./scope";

type Row = ReturnType<typeof generationCoverage>["rows"][number];

async function checkPublicationPools(ctx: TestContext, bundle: Bundle, rows: Row[], scope: string) {
  const allRows = generationCoverage(bundle).rows,
    ownedOriginals = new Set(rows.map(row => refKey(refOf(row.original)))),
    subject = rows[0].original.subject,
    subjectRows = allRows.filter(row => row.original.subject === subject),
    currentRows = subjectRows.filter(row => {
      const slots = new Set(row.original.origin.sourceRefs.flatMap(r => r.locator.timeSlot ? [r.locator.timeSlot] : []));
      return !slots.size || subject === "A" && slots.size === 1 && slots.has("午前");
    });
  assert(rows.every(row => row.original.subject === subject));
  const visited = new Set<string>(), expectedVisited = new Set<string>();
  for (const collection of sourceCollections(bundle, subject).filter(collection => collection.questionRefs.every(ref => ownedOriginals.has(refKey(ref))))) {
    const owned = new Set(collection.questionRefs.map(refKey));
    const collectionRows = subjectRows.filter(row => owned.has(refKey(refOf(row.original))));
    assert(collectionRows.length > 0, `${scope}: empty publication collection`);
    const legacy = collectionRows.some(row => row.original.origin.sourceRefs.some(r => r.locator.timeSlot));
    if (collectionRows.some(row => isAfternoon(row.original))) {
      assert(collectionRows.every(row => isAfternoon(row.original)));
      collectionRows.forEach(row => expectedVisited.add(refKey(row.linked[0].baseQuestionRef)));
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
      ctx.diagnostic(`${collection.id}: all13 study and all${cases.length - 1} legal seven-major paper-order mixes retained.`);
      continue;
    }
    const poolRows = legacy ? collectionRows : currentRows;
    poolRows.forEach(row => expectedVisited.add(refKey(row.linked[0].baseQuestionRef)));
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
  assert(visited.size > 0, `${scope}: no publication pool was tested`);
  assert.deepEqual([...visited].sort(), [...expectedVisited].sort());
}

async function checkEveryFiniteInput(ctx: TestContext, bundle: Bundle, rows: Row[], scope: string) {
  const control = seedControl(ctx);
  let templates = 0, inputs = 0, initialDraws = 0, appendedDraws = 0;
  let afternoonInputs = 0, afternoonInitialDraws = 0, afternoonAppendedDraws = 0;
  const afternoonTemplates: string[] = [];
  for (const row of rows) {
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
    if (template.id === "template-source-2019r01a-fe-pm-2") assert.equal(candidates.length, 1125);
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
  assert.deepEqual(afternoonTemplates.sort(), rows.filter(row => isAfternoon(row.original)).map(row => row.linked[0].id).sort());
  assert.equal(afternoonInitialDraws, afternoonInputs * 3); assert.equal(afternoonAppendedDraws, afternoonInputs);
  assert.equal(initialDraws - afternoonInitialDraws, (inputs - afternoonInputs) * 5);
  assert(templates > 0, `${scope}: no finite inputs were tested`);
  ctx.diagnostic(`${scope}: ${templates} domains, ${inputs} valid inputs, ${initialDraws} initial draws, ${appendedDraws} draws with complete prior history; current-format domains retain all five paths.`);
  if (afternoonTemplates.length) ctx.diagnostic(`${scope}: old afternoon: ${afternoonTemplates.length} domains, all ${afternoonInputs} finite inputs, ${afternoonInitialDraws} initial draws on three applicable explicit routes, ${afternoonAppendedDraws} history draws; all${expectedAfternoonSelectionCount(scope)} booklet selections separately retained.`);
}

async function checkLargerSeededInputs(ctx: TestContext, bundle: Bundle, rows: Row[], scope: string) {
  const control = seedControl(ctx);
  let templates = 0, inputs = 0, initialDraws = 0, appendedDraws = 0;
  for (const row of rows) {
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
  assert(templates > 0, `${scope}: no larger-domain inputs were tested`);
  ctx.diagnostic(`${scope}: ${templates} larger domains, ${inputs} seeded inputs, ${initialDraws} initial draws on applicable issuance paths, ${appendedDraws} draws with prior history.`);
}

/** Physical booklet wrappers call this with a literal identity. The fixture
 * remains the complete distribution bundle: only the rows to exercise change,
 * never the candidate pools, generators, inputs, routes or validation rules. */
export function registerBookletGenerationTests(scope: string) {
  const observed = fixture(), rows = bookletRows(observed, scope), kinds = bookletKinds(rows);
  const cases = { pool: checkPublicationPools, small: checkEveryFiniteInput, large: checkLargerSeededInputs };
  for (const kind of kinds.applicable)
    test(generationPathTestName(scope, kind), async ctx => {
      // Each callback owns the same full fresh fixture as the original tests.
      const bundle = fixture(), actualRows = bookletRows(bundle, scope);
      assert.deepEqual(actualRows.map(row => row.original.id), rows.map(row => row.original.id));
      await cases[kind](ctx, bundle, actualRows, scope);
    });
}
