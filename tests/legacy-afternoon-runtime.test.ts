import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures/legacy-afternoon-main-preservation";
import { refOf, type Bundle } from "../src/core/types";
import { bindQuestion, validateTemplateContract } from "../src/core/generation";
import { validateSourceFormat } from "../src/core/generation-formats";
import { legacyAfternoonDefinitions } from "../src/core/generators/legacy-afternoon-definitions";
import { prepareRun, validateRun } from "../src/core/session";
import { schema } from "../src/core/validation";
import { contentHash } from "../src/core/hash";
import { legacy2017Pm1Records } from "../scripts/import-legacy-2017-pm1";
import { legacy2017Pm2Records } from "../scripts/import-legacy-2017-pm2";
import { legacy2017Pm3Records } from "../scripts/import-legacy-2017-pm3";
import { legacy2017Pm4Records } from "../scripts/import-legacy-2017-pm4";
import { legacy2017Pm5Records } from "../scripts/import-legacy-2017-pm5";
import { pm6Records } from "../scripts/import-legacy-2017-pm6";
import { pm7Records } from "../scripts/import-legacy-2017-pm7";
import { legacy2017Pm8Records } from "../scripts/import-legacy-2017-pm8";
import { legacy2017Pm9Records } from "../scripts/import-legacy-2017-pm9";
import { legacy2017Pm10Records } from "../scripts/import-legacy-2017-pm10";
import { legacy2017Pm11Records } from "../scripts/import-legacy-2017-pm11";
import { legacy2017Pm12Records } from "../scripts/import-legacy-2017-pm12";
import { legacy2017Pm13Records } from "../scripts/import-legacy-2017-pm13";
import metadata1 from "./fixtures/legacy-2017-pm1-original-metadata.json";
import metadata2 from "./fixtures/legacy-2017-pm2-original-metadata.json";
import metadata3 from "./fixtures/legacy-2017-pm3-original-metadata.json";
import metadata4 from "./fixtures/legacy-2017-pm4-original-metadata.json";
import metadata5 from "./fixtures/legacy-2017-pm5-original-metadata.json";
import metadata8 from "./fixtures/legacy-2017-pm8-pages.json";
import metadata9 from "./fixtures/legacy-2017-pm9-original-metadata.json";
import metadata10 from "./fixtures/legacy-2017-pm10-original-metadata.json";
import metadata11 from "./fixtures/legacy-2017-pm11-original-metadata.json";
import metadata12 from "./fixtures/legacy-2017-pm12-original-metadata.json";
import metadata13 from "./fixtures/legacy-2017-pm13-original-metadata.json";
import evidence from "../scripts/source-evidence/ipa-pre-2023.json";

// Use the source-reviewed pure assemblers, not private injected registries or
// a pre-built ignored output. No partial booklet is admitted to distribution.
const factories = [
  () => legacy2017Pm1Records({ collection: metadata1.collection, rendered: metadata1 }).then(x => x.bundle),
  () => legacy2017Pm2Records({ collection: metadata2.collection, rendered: metadata2 }).then(x => x.bundle),
  () => legacy2017Pm3Records({ collection: metadata3.collection, rendered: metadata3 }).then(x => x.bundle),
  () => legacy2017Pm4Records({ collection: metadata4.collection, rendered: metadata4 }).then(x => x.bundle),
  () => legacy2017Pm5Records({ collection: metadata5.collection, rendered: metadata5 }).then(x => x.bundle),
  () => pm6Records().then(x => x.records),
  () => pm7Records().then(x => x.records),
  () => legacy2017Pm8Records({ collection: evidence.collections.find(collection => collection.id === "2017h29h-fe-pm")!, rendered: metadata8 }).then(x => x.bundle),
  () => legacy2017Pm9Records(metadata9).then(x => x.bundle),
  () => legacy2017Pm10Records({ collection: evidence.collections.find(collection => collection.id === "2017h29h-fe-pm")!, rendered: metadata10 }).then(x => x.bundle),
  () => legacy2017Pm11Records({ collection: evidence.collections.find(collection => collection.id === "2017h29h-fe-pm")!, rendered: metadata11 }).then(x => x.bundle),
  () => legacy2017Pm12Records(metadata12).then(x => x.bundle),
  () => legacy2017Pm13Records(metadata13).then(x => x.bundle),
];
const majorNumbers = Array.from({ length: 13 }, (_, index) => index + 1);
for (const [index, factory] of factories.entries()) test(`PM${majorNumbers[index]}: managed runtime binds without modifying public roots, retains per-material credits, and saves/reopens`, async () => {
  const records = await factory();
  const base = records.questions.find(question => question.id.startsWith("question-template-"))!;
  const template = records.templates[0];
  const definition = legacyAfternoonDefinitions.find(definition => `generator-source-${definition.source}` === template.generatorRef.id)!;
  validateTemplateContract(template);
  const visit = (field: number, values: number[]) => {
    if (field !== definition.fields.length) {
      const domain = definition.fields[field];
      for (let value = domain.minimum; value <= domain.maximum; value++) visit(field + 1, [...values, value]);
      return;
    }
    const generated = bindQuestion(base, template, values, "runtime-test", "2026-10-26T00:00:00Z");
    schema("question", generated); validateSourceFormat(generated, template);
    assert.equal(generated.choiceShuffleAllowed, false);
    assert.deepEqual(generated.prompt.attribution, base.prompt.attribution);
    assert.deepEqual(generated.contexts.map(context => context.content.attribution), base.contexts.map(context => context.content.attribution));
    const diagrams = (question: typeof base) => [question.prompt, ...question.contexts.map(context => context.content), ...question.choices.map(choice => choice.content)]
      .flatMap(content => content.blocks.flatMap(block => block.type === "diagram" ? [block.attribution] : []));
    assert.deepEqual(diagrams(generated), diagrams(base));
    const altered = structuredClone(generated);
    altered.prompt.blocks.unshift({ type: "paragraph", text: "追加された未確認の前提" });
    assert.throws(() => validateSourceFormat(altered, template), error =>
      error instanceof Error && "code" in error && ["SOURCE_FORMAT", "SOURCE_MATERIAL"].includes(String(error.code)));
  };
  visit(0, []);
  const bundle = fixture();
  for (const key of ["questions", "templates", "sources", "rights", "assets"] as const) {
    for (const record of records[key]) (bundle[key] as { id: string }[]).push(structuredClone(record));
  }
  for (const record of [...bundle.questions, ...bundle.templates]) record.distribution = "included";
  bundle.templates.find(row => row.id === template.id)!.originalContentSha256 =
    await contentHash(bundle.questions.find(row => row.id === base.id)!);
  const mix = bundle.sets.find(set => set.id === "set-mix-b")!;
  mix.questionRefs.push(refOf(base));
  mix.generationBindings.push({ questionRef: refOf(base), templateRef: { id: template.id, revision: template.revision } });
  const original = records.questions.find(question => question.origin.kind === "official_reprint")!;
  const run = await prepareRun(bundle as Bundle, { kind: "bookmark", mode: "study", subject: "B",
    bookmarkQuestionRef: refOf(original), bindingMode: "generated_values" }, {});
  assert.equal(run.issued.length, 1); assert.equal(run.instances.length, 1);
  await validateRun(run);
  await validateRun(JSON.parse(JSON.stringify(run)));
});
