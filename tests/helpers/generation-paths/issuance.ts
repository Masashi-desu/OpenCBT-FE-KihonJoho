import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { refOf, refKey, type Selection, type Template, type Bundle, type Question } from "../../../src/core/types";
import { bookmarkGroupSelection, makeBookmark } from "../../../src/core/bookmarks";
import { parametersForSeed, contractFor } from "../../../src/core/generation";
import { selectQuestions } from "../../../src/core/selection";

// Control only the parameter seed. IDs, question draws and choice shuffles use
// their normal randomness, so the tests exercise the public issuance paths.
export function seedControl(ctx: TestContext) {
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

export async function seedsFor(t: Template, candidates: number[][], maximum = 4096) {
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

export function isAfternoon(original: Question) {
  const slots = new Set(original.origin.sourceRefs.flatMap(ref => ref.locator.timeSlot ? [ref.locator.timeSlot] : []));
  return original.subject === "B" && slots.size === 1 && slots.has("午後");
}

const preMandatorySecurity = new Set(["2012-autumn-pm", "2013-spring-pm", "2013-autumn-pm"]);

export function expectedAfternoonSelectionCount(scope: string) {
  return preMandatorySecurity.has(scope) ? 105 : 75;
}

export function legalAfternoonSelections(collection: Bundle["sets"][number]) {
  // Enumerate the two omissions and the language independently of the
  // production rule. The listed booklet covers leave question 1 optional.
  const refs = collection.questionRefs, policy = collection.questionSelection;
  const scope = collection.id.replace(/^set-annual-/, "");
  const beforeMandatorySecurity = preMandatorySecurity.has(scope);
  const firstRequired = beforeMandatorySecurity ? [] : [refs[0]];
  const general = refs.slice(beforeMandatorySecurity ? 0 : 1, 7);
  const languages = refs.slice(8);
  assert.equal(refs.length, 13);
  assert(policy);
  assert.deepEqual(policy.requiredQuestionRefs, [...firstRequired, refs[7]]);
  assert.deepEqual(policy.optionalGroups.map(group => ({ refs: group.questionRefs, choose: group.choose })),
    [{ refs: general, choose: beforeMandatorySecurity ? 5 : 4 }, { refs: languages, choose: 1 }]);
  const selections = [];
  for (let first = 0; first < general.length; first++) for (let second = first + 1; second < general.length; second++)
    for (const language of languages)
      selections.push([...firstRequired, ...general.filter((_, i) => i !== first && i !== second), refs[7], language]);
  assert.equal(selections.length, expectedAfternoonSelectionCount(scope));
  return selections;
}

export function routesFor(bundle: Bundle, original: Question, template: Template) {
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

// Only these source-reviewed 1081/1125-input domains are admitted above the
// existing exhaustive256 bound. Identity, version, both declared domains and
// references are pinned; future enlargement still fails for review.
export function finiteSeedBudget(template: Template, contract: NonNullable<ReturnType<typeof contractFor>>, afternoon: boolean) {
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
  if (template.id === "template-source-2019r01a-fe-pm-2") {
    assert(afternoon);
    assert.equal(contract.source, "2019r01a-fe-pm-2");
    assert.equal(contract.version, "3.2.0");
    assert.deepEqual(template.generatorRef, { id: "generator-source-2019r01a-fe-pm-2", version: "3.2.0" });
    const reviewedFields = [
      { name: "threadCount", minimum: 2, maximum: 4 },
      { name: "parallelFractionCase", minimum: 0, maximum: 4 },
      { name: "limitCase", minimum: 0, maximum: 4 },
      { name: "halfRangeCase", minimum: 0, maximum: 2 },
      { name: "indirectAddressCase", minimum: 0, maximum: 4 },
    ];
    assert.deepEqual(fields, reviewedFields);
    assert.deepEqual(template.parameterDomain, { values: { length: 5, minimum: 0, maximum: 4 }, fields: reviewedFields });
    assert.deepEqual(contract.reference, [2, 4, 2, 1, 0]);
    assert.deepEqual(template.referenceParameters.values, [2, 4, 2, 1, 0]);
    assert.equal(capacity, 1125);
    return 32768;
  }
  if (afternoon) assert(capacity <= 256, `${template.id}: all finite afternoon inputs require exhaustive coverage`);
  return capacity <= 256 ? 4096 : undefined;
}
