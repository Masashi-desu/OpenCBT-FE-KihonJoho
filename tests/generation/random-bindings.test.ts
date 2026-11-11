import fs from 'node:fs';
import {bookletSamplerRegressionInventory}from'../helpers/booklet-sampler-regressions';
import {scopeForQuestion}from'../../scripts/ci/booklet-scope.mjs';
import test, {before} from "node:test";
import assert from "node:assert/strict";
import {fixture, installFixtureGenerators} from "../fixtures";
import {refOf, refKey, type Selection, type Template, type Question} from "../../src/core/types";
import {generationCoverage} from "../../src/core/generation-coverage";
import {contractFor} from "../../src/core/generation";
import {nextQuestionRef, selectQuestions} from "../../src/core/selection";
import {prepareRun, startRun} from "../../src/core/session";
import {isAfternoon, finiteSeedBudget} from "../helpers/generation-paths/issuance";

test("every registered series remains reachable in the complete endless publication pool", async (ctx) => {
  const bundle = fixture(), rows = generationCoverage(bundle).rows;
  for (const subject of ["A", "B"] as const) {
    const subjectRows = rows.filter(row => row.original.subject === subject);
    const currentRows = subjectRows.filter(row => {
      const slots = new Set(row.original.origin.sourceRefs.flatMap(r => r.locator.timeSlot ? [r.locator.timeSlot] : []));
      return !slots.size || subject === "A" && slots.size === 1 && slots.has("午前");
    });
    const expected = currentRows
      .map((row) => refKey(row.linked[0].baseQuestionRef)).sort();
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
    assert.equal(finiteSeedBudget(t, c, true), t.id === "template-source-2019r01a-fe-pm-2" ? 32768 : 4096);
    c.fields = [{ name: "未査読の拡大域", minimum: 0, maximum: 256 }];
    assert.throws(() => finiteSeedBudget(t, c, true), { code: "ERR_ASSERTION" });
  }
  const current = generationCoverage(bundle).rows.find(r => !isAfternoon(r.original) && contractFor(r.linked[0])!.fields.reduce((n, f) => n * (f.maximum - f.minimum + 1), 1) > 256)!;
  assert.equal(finiteSeedBudget(current.linked[0], contractFor(current.linked[0])!, false), undefined);
});

// Match executable App setup without changing raw shared fixture imports.
before(installFixtureGenerators);

// Global registration proof; expensive source work executes in its booklet.
test('physical sampler regression wrappers retain every reviewed pool, source and callback in the CI manifest',()=>{
 const manifest=JSON.parse(fs.readFileSync('scripts/ci/public-test-manifest.json','utf8')).files,expected:string[]=[],bundle=fixture();
 for(const row of Object.values(bookletSamplerRegressionInventory)){
  const file=`tests/booklets/${row.scope}/sampler-regressions.test.ts`;expected.push(file);assert.equal(fs.readFileSync(file,'utf8').split(`registerBookletSamplerRegressionTests("${row.scope}");`).length,2);assert.deepEqual(manifest[file]?.scopes,[row.scope]);assert.equal(manifest[file]?.count,row.count);assert.deepEqual(manifest[file]?.names,row.caseNames);
  for(const id of row.sourceIds){const q=bundle.questions.find(q=>q.id==='question-ipa-'+id)!;assert(q);assert.equal(scopeForQuestion(q),row.scope);}
 }
 assert.deepEqual(Object.keys(manifest).filter(p=>/^tests\/booklets\/[^/]+\/sampler-regressions\.test\.ts$/.test(p)).sort(),expected.sort());
 assert.equal(Object.values(bookletSamplerRegressionInventory).reduce((n,r)=>n+r.count,0),5);
 const pools=[...bookletSamplerRegressionInventory['2025-a'].work.precisionPools,...bookletSamplerRegressionInventory['2025-b'].work.precisionPools];assert.deepEqual(pools.map(p=>[p.source,p.candidates,p.maximumSeeds]),[['2025-a-19',6002,131072],['2025-a-4',291,131072],['2025-b-5',592,131072]]);
});
