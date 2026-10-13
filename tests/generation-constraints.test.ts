import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { refOf } from "../src/core/types";
import { contentHash } from "../src/core/hash";
import { checkParameters, parametersForSeed } from "../src/core/generation";
import { additionalDefinition } from "../src/core/generators";
import { prepareRun, validateRun } from "../src/core/session";

// Published 3.2.0 produces rotated arrays as the five choices. A periodic
// array has too few distinct rotations; it was already rejected by build().
// Validation must classify this as a retryable input, preserving valid output.
const source = "generator-source-2023-b-4";
const failingSeed = "000000000000000000000000000007e6";
const firstDraw = [6, 3, 16, 16, 25];

function hashArray([size, offset, ...values]: number[]): string {
  const slots = new Map<number, number>();
  for (const value of values) {
    const empty = [value % size, (value + offset) % size].find(
      (i) => !slots.has(i),
    );
    if (empty !== undefined) slots.set(empty, value);
  }
  return `{${Array.from({ length: size }, (_, i) => slots.get(i) ?? -1).join(", ")}}`;
}

test("periodic hash arrays are rejected as input constraints without changing the published generator", async () => {
  const bundle = fixture();
  const template = bundle.templates.find((t) => t.generatorRef.id === source)!;
  const generator = additionalDefinition(source)!;
  assert.equal(template.generatorRef.version, "3.2.0");
  for (const values of [firstDraw, [6, 3, 3, 3, 3], [8, 4, 1, 1, 1]]) {
    // Independent placement explains why these inputs cannot supply five choices.
    const result = hashArray(values).slice(1, -1).split(", ");
    const rotations = Array.from({ length: values[0] }, (_, i) =>
      [...result.slice(i), ...result.slice(0, i)].join(", "),
    );
    assert(new Set(rotations).size < 5);
    assert.throws(
      () => generator.build(values),
      /Insufficient distinct distractors/,
    );
    assert.throws(() => checkParameters(template, values), {
      code: "PARAMETER_CONSTRAINT",
    });
  }
  const baseline = generator.build(template.referenceParameters.values);
  assert.equal(baseline.choices.length, 5);
  const texts = baseline.choices.map((c) =>
    c.map((b) => (b.type === "paragraph" ? b.text : "")).join(""),
  );
  assert.equal(new Set(texts).size, 5);
  assert.equal(
    texts[baseline.correctIndex ?? 0],
    hashArray(template.referenceParameters.values),
  );
});

test("the failing seed retries inside the sampler and actual bookmark issuance while retaining stored content", async (ctx) => {
  const bundle = fixture();
  const before = JSON.stringify(bundle);
  const template = bundle.templates.find((t) => t.generatorRef.id === source)!;
  const parameters = await parametersForSeed(failingSeed, template);
  assert.notDeepEqual(parameters.values, firstDraw);
  assert.deepEqual(await parametersForSeed(failingSeed, template), parameters);
  checkParameters(template, parameters.values);

  const original = bundle.questions.find(
    (q) => q.id === "question-ipa-2023-b-4",
  )!;
  const random = crypto.getRandomValues.bind(crypto);
  ctx.mock.method(crypto, "getRandomValues", (array: Uint8Array) => {
    if (array instanceof Uint8Array && array.length === 16) {
      array.set(
        Uint8Array.from(failingSeed.match(/../g)!, (n) => parseInt(n, 16)),
      );
      return array;
    }
    return random(array);
  });
  const run = await prepareRun(
    bundle,
    {
      subject: "B",
      kind: "bookmark",
      mode: "study",
      bookmarkQuestionRef: refOf(original),
      bindingMode: "generated_values",
    },
    {},
    1_800_000,
  );
  assert.equal(run.instances.length, 1);
  const instance = run.instances[0];
  assert.deepEqual(instance.parameters, parameters);
  assert.equal(instance.generatorRef.version, "3.2.0");
  const choices = instance.question.choices.map((c) => ({
    id: c.id,
    text: c.content.blocks
      .map((b) => (b.type === "paragraph" ? b.text : ""))
      .join(""),
  }));
  assert.equal(choices.length, 5);
  assert.equal(new Set(choices.map((c) => c.text)).size, 5);
  assert.deepEqual(
    choices
      .filter((c) => c.text === hashArray(parameters.values))
      .map((c) => c.id),
    [instance.question.correctAnswer.choiceId],
  );
  assert.equal(instance.contentSha256, await contentHash(instance.question));
  await validateRun(run);
  assert.equal(JSON.stringify(bundle), before);
});

test("unexpected generator failures still stop generation", (ctx) => {
  const template = fixture().templates.find(
    (t) => t.generatorRef.id === source,
  )!;
  const generator = additionalDefinition(source)!;
  const error = new Error("unexpected programming failure");
  ctx.mock.method(generator, "build", () => {
    throw error;
  });
  assert.throws(
    () => checkParameters(template, template.referenceParameters.values),
    (e) => e === error,
  );
});
