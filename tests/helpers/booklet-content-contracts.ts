/** Per-source content/format/rendering contracts from full-coverage.test.ts.
 * Existing callback bodies and64 seeded inputs are retained without weakening
 * the all-choice, finite-capacity or diagram assertions. Old multi-answer PM
 * definitions keep their separate independent per-major content tests. */
import { bookletRows, partitionBookletRows } from "./generation-paths/scope";
import {
  test,
  assert,
  fixture,
  installFixtureGenerators,
  additionalDefinitions,
  amCapacityBySource,
  stage3Counts,
  stage3FixedSignatures,
  autumn2016Counts,
  autumn2016FixedSignatures,
  isAutumn2016Source,
  isNativeStage3Source,
  bindQuestion,
  parametersForSeed,
  answerSignature,
  answerCanVary,
  schema,
  validateSourceFormat,
  validateSourceFigure,
  activityNetworkRenderer,
  readActivityNetwork,
  diagramMarkup,
  assertDiagramMarkup
} from "./booklet-content-support";

export async function registerBookletContentContractTests(scope: string) {
  await installFixtureGenerators();
  const rows = bookletRows(fixture(), scope), originals = new Set(rows.map(row => row.original.id)),
    definitions = additionalDefinitions.filter(d => originals.has(`question-ipa-${d.source}`));
  assert(definitions.length > 0, `${scope}: no single-answer content contracts; do not register an empty successful wrapper`);
  for (const d of definitions)
  test(`${d.source}: baseline, source answer and 64 seeded parameter sets`, async () => {
    const b = fixture(),
      t = b.templates.find(
        (t) => t.generatorRef.id === `generator-source-${d.source}`,
      )!,
      base = b.questions.find((q) => q.id === t.baseQuestionRef.questionId)!,
      original = b.questions.find((q) => q.id === `question-ipa-${d.source}`)!;
    const correctOriginal = original.choices.find(
      (c) => c.id === original.correctAnswer.choiceId,
    )!.content.blocks[0];
    assert(correctOriginal.type === "paragraph");
    assert.equal(correctOriginal.text, d.sourceAnswer);
    assert.equal(base.choices.length, original.choices.length);
    assert.equal(base.origin.derivedFrom[0].questionId, original.id);
    const before = JSON.stringify(base),
      answers = new Set<string>();
    for (let i = 0; i < 64; i++) {
      const seed = i.toString(16).padStart(32, "0"),
        params = await parametersForSeed(seed, t);
      assert.deepEqual(params, await parametersForSeed(seed, t));
      const q = bindQuestion(
        base,
        t,
        params.values,
        `instance-${d.source}-${i}`,
        "2026-10-06T16:00:00Z",
      );
      schema("question", q);
      validateSourceFormat(q, t);
      assert.equal(q.choices.length, original.choices.length);
      assert.equal(
        new Set(q.choices.map((c) => JSON.stringify(c.content.blocks))).size,
        q.choices.length,
      );
      assert(q.origin.isModified);
      assert.equal(q.assetRefs.length, 0);
      assert(q.explanation.blocks.length > 0);
      answers.add(answerSignature(q));
      for (const content of [
        q.prompt,
        ...q.contexts.map((c) => c.content),
        ...q.choices.map((c) => c.content),
      ])
        for (const block of content.blocks)
          if (block.type === "diagram") {
            if (block.scene.kind === "source_figure") {
              assert.equal(block.rendererRef.id, "renderer-source-figures");
              assert.equal(block.rendererRef.version, "1.0.0");
              validateSourceFigure(block.scene);
            } else {
              assert.equal(block.rendererRef.id, activityNetworkRenderer.id);
              assert.equal(block.rendererRef.version, activityNetworkRenderer.version);
              readActivityNetwork(block.scene);
            }
            assertDiagramMarkup(block, diagramMarkup(block), amCapacityBySource.has(d.source) || isNativeStage3Source(d.source));
          }
    }
    const reviewedAM = amCapacityBySource.get(d.source);
    if (reviewedAM) assert.equal(answerCanVary(t), reviewedAM.answerCanVary, d.source);
    if (answerCanVary(t))
      assert(
        answers.size >= 2,
        `${d.source} must change answer content, not only option order`,
      );
    else if (reviewedAM) {
      // A fixed answer-variation policy can still bind different objects or
      // operands in the rendered correct choice. Compare its exact reviewed
      // finite signatures; source-specific all-choice meaning is separate.
      assert.equal(d.answerVariation, "fixed");
      assert.equal(reviewedAM.answerCanVary, false);
      const finiteAnswers = new Set<string>(), displays = new Set<string>();
      let valid = 0, rejected = 0, retainedReference = false;
      function visit(values: number[]) {
        if (values.length < d.fields.length) {
          const field = d.fields[values.length];
          for (let n = field.minimum; n <= field.maximum; n++) visit([...values, n]);
          return;
        }
        try { d.build(values); } catch (e) {
          assert((e as Error).message === "PARAMETER_CONSTRAINT" || (e as {code?: string}).code === "PARAMETER_CONSTRAINT");
          rejected++; return;
        }
        const q = bindQuestion(base, t, values, "fixed-am-capacity", "2026-10-31T00:00:00.000Z");
        finiteAnswers.add(answerSignature(q));
        displays.add(JSON.stringify([q.prompt, q.contexts, q.choices]));
        retainedReference ||= JSON.stringify(values) === JSON.stringify(t.referenceParameters.values);
        valid++;
      }
      visit([]);
      assert.equal(valid, reviewedAM.validInputCount, d.source);
      assert.equal(rejected, reviewedAM.rejectedInputCount, d.source);
      assert.equal(finiteAnswers.size, reviewedAM.distinctAnswerSignatures, d.source);
      assert(finiteAnswers.size >= 1);
      assert([...answers].every(signature => finiteAnswers.has(signature)), d.source + " seeded answers remain inside reviewed finite capacity");
      assert(valid >= 2 && displays.size >= 2 && retainedReference, d.source + " must retain substantive conditions and reference");
    } else if (isNativeStage3Source(d.source)) {
      const n=Number(d.source.split("-").at(-1)),autumn=isAutumn2016Source(d.source),count=autumn?autumn2016Counts.get(d.source)!:stage3Counts.get(n)!;
      assert.equal(d.answerVariation,"fixed"); assert.equal(answerCanVary(t),false);
      const finiteAnswers=new Set<string>(), displays=new Set<string>();
      for(let index=0;index<count;index++) {
        const q=bindQuestion(base,t,[index],"fixed-stage3-capacity","2026-11-01T00:00:00Z");
        schema("question",q); validateSourceFormat(q,t);
        finiteAnswers.add(answerSignature(q)); displays.add(JSON.stringify([q.prompt,q.contexts,q.choices]));
      }
      assert.equal(finiteAnswers.size,(autumn?autumn2016FixedSignatures:stage3FixedSignatures).get(n),d.source);
      assert.equal(displays.size,count,d.source + " must retain all substantively distinct conditions");
      assert([...answers].every(signature => finiteAnswers.has(signature)));
      for(const values of [[],[-1],[count],[.5],[0,0]])assert.throws(()=>d.build(values),/PARAMETER_CONSTRAINT/);
    } else if (d.source === "2024-a-20") {
      assert.equal(d.source, "2024-a-20");
      assert.equal(answers.size, 1);
      assert(
        new Set(
          Array.from({ length: 8 }, (_, i) =>
            JSON.stringify(d.build([i]).choices),
          ),
        ).size === 8,
      );
    } else if (d.source === "sample-2022-dec-a-18") {
      assert.equal(d.answerVariation,"fixed");assert.equal(answers.size,1);
      const variants=Array.from({length:d.fields[0].maximum+1},(_,i)=>d.build([i]));
      assert.equal(new Set(variants.map(b=>JSON.stringify(b.choices))).size,variants.length);
      assert(variants.length>=3);
    } else {
      assert(["sample-2022-dec-a-2", "sample-2022-dec-b-7", "sample-2022-dec-b-10", "sample-2022-dec-b-12", "sample-2022-dec-b-16"].includes(d.source));
      assert.equal(d.answerVariation, "fixed");
      assert.equal(answers.size, 1);
      const low=d.fields.map(f=>f.minimum), high=d.fields.map(f=>f.maximum);
      assert.notDeepEqual(d.build(low).prompt,d.build(high).prompt,"fixed-answer algorithms must vary meaningful problem conditions");
    }
    assert.equal(JSON.stringify(base), before);
  });
}

/** Actual source-to-callback partition for inspection and CI-manifest authoring.
 * Old afternoon has no entry in additionalDefinitions: its multi-answer format
 * remains covered by independent per-major suites, not this single-choice loop. */
export function bookletContentContractInventory(bundle = fixture()) {
  const groups = partitionBookletRows(bundle), seen = new Set<string>(), rows = [];
  for (const [scope, owned] of groups) {
    const ids = new Set(owned.map(row => row.original.id)),
      definitions = additionalDefinitions.filter(d => ids.has(`question-ipa-${d.source}`));
    for (const definition of definitions) {
      assert(!seen.has(definition.source), `${definition.source}: duplicate content contract scope`);
      seen.add(definition.source);
    }
    rows.push({ scope, count: definitions.length, names: definitions.map(d => `${d.source}: baseline, source answer and 64 seeded parameter sets`),
      sourceIds: definitions.map(d => d.source), notApplicable: definitions.length === 0 });
  }
  assert.deepEqual([...seen].sort(), additionalDefinitions.map(d => d.source).sort(), "every original installed single-answer definition requires exactly one source callback");
  return rows;
}
