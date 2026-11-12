import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { refOf, refKey, type Selection, type Template, type Bundle, type Question } from "../../../src/core/types";
import { bookmarkGroupSelection, makeBookmark } from "../../../src/core/bookmarks";
import { parametersForSeed, contractFor } from "../../../src/core/generation";
import { selectQuestions } from "../../../src/core/selection";
import declarations from "../../../scripts/source-inventory-extensions.json";
import { inventoryCollectionIdentity } from "../../../scripts/source-inventory-extension-contract";

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

const preMandatorySecurity = new Set(["2010-autumn-pm", "2011-special-pm", "2011-autumn-pm", "2012-spring-pm", "2012-autumn-pm", "2013-spring-pm", "2013-autumn-pm", "2010-spring-pm", "2009-autumn-pm", "2009-spring-pm"]);

const afternoonAdmissions = new Map(declarations.collections
  .filter(collection => collection.collectionId.endsWith("-pm"))
  .map(collection => [inventoryCollectionIdentity(collection.collectionId).scope, collection.excluded.map(row => row.number)]));

export function afternoonPaperSelection(scope: string, excluded: readonly number[] = afternoonAdmissions.get(scope) ?? []) {
  const beforeMandatorySecurity = preMandatorySecurity.has(scope);
  const numbers = Array.from({ length: 13 }, (_, index) => index + 1).filter(number => !excluded.includes(number));
  const required = beforeMandatorySecurity ? [8] : [1, 8];
  const general = numbers.filter(number => number <= 7 && !required.includes(number));
  const languages = numbers.filter(number => number >= 9);
  const choose = beforeMandatorySecurity ? 5 : 4;
  assert(required.every(number => numbers.includes(number)) && general.length >= choose && languages.length > 0,
    `${scope}: admitted questions cannot follow the original seven-question selection policy`);
  const omitted = general.length - choose;
  const generalCount = omitted === 2 ? general.length * (general.length - 1) / 2 : omitted === 1 ? general.length : 1;
  return { numbers, required, general, choose, languages, count: generalCount * languages.length };
}

export function expectedAfternoonSelectionCount(scope: string) {
  return afternoonPaperSelection(scope).count;
}

export function legalAfternoonSelections(collection: Bundle["sets"][number], originals: readonly Question[]) {
  // Source inventory and official question numbers determine the expected policy.
  const scope = collection.id.replace(/^set-annual-/, "");
  const expected = afternoonPaperSelection(scope), policy = collection.questionSelection;
  const byRef = new Map(originals.map(question => [refKey(refOf(question)), question]));
  const numbers = collection.questionRefs.map(ref => {
    const question = byRef.get(refKey(ref));
    assert(question && isAfternoon(question), `${collection.id}: unknown original ${refKey(ref)}`);
    const sourceNumbers = new Set(question.origin.sourceRefs.flatMap(({ locator }) =>
      locator.timeSlot === "午後" && locator.questionNumber !== undefined ? [Number(locator.questionNumber)] : []));
    assert.equal(sourceNumbers.size, 1, `${question.id}: ambiguous original question number`);
    return [...sourceNumbers][0];
  });
  assert.deepEqual(numbers, expected.numbers, `${collection.id}: published admissions must match the reviewed inventory`);
  const refs = new Map(numbers.map((number, index) => [number, collection.questionRefs[index]]));
  const questionRefs = (selected: readonly number[]) => selected.map(number => refs.get(number)!);
  assert(policy);
  assert.deepEqual(policy.requiredQuestionRefs, questionRefs(expected.required));
  assert.deepEqual(policy.optionalGroups.map(group => ({ refs: group.questionRefs, choose: group.choose })), [
    { refs: questionRefs(expected.general), choose: expected.choose },
    { refs: questionRefs(expected.languages), choose: 1 },
  ]);
  const selections = [];
  for (let mask = 0; mask < (1 << expected.general.length); mask++) {
    const included = expected.general.filter((_, index) => (mask & (1 << index)) !== 0);
    if (included.length !== expected.choose) continue;
    for (const language of expected.languages)
      selections.push(questionRefs([...expected.required, ...included, language].sort((a, b) => a - b)));
  }
  assert.equal(selections.length, expected.count);
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
