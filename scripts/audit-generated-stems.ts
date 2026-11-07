import { pathToFileURL } from "node:url";
import { readDistributionBundle } from "./distribution-files";
import { bindQuestion, parametersForSeed } from "../src/core/generation";
import { additionalDefinition } from "../src/core/generators";
import { ensureLegacyMorningGenerators } from "../src/core/generators/legacy-morning-install";
import { ensureStage3MorningGenerators } from "../src/core/generators/stage3-morning-install";
import { sortedJson } from "../src/core/hash";

const exhaustiveLimit = 50_000;
const seedCount = 64;
const at = "2026-11-07T00:00:00Z";

// Consider only material visible before answering. Ignore identifiers, credits,
// alt-only edits and presentation whitespace so they cannot satisfy the audit.
function stemKey(prompt: unknown, contexts: unknown) {
  return JSON.stringify(sortedJson([prompt, contexts]), (key, value) => {
    if (["id", "alt", "attribution"].includes(key)) return undefined;
    return typeof value === "string" ? value.replace(/\s+/gu, " ").trim() : value;
  });
}

function* tuples(fields: readonly { minimum: number; maximum: number }[], prefix: number[] = []): Generator<number[]> {
  const field = fields[prefix.length];
  if (!field) {
    yield prefix;
    return;
  }
  for (let value = field.minimum; value <= field.maximum; value++)
    yield* tuples(fields, [...prefix, value]);
}

export async function auditGeneratedStems(bundle = readDistributionBundle()) {
  await ensureLegacyMorningGenerators(bundle);
  ensureStage3MorningGenerators(bundle);
  const fixed = [];
  for (const template of bundle.templates) {
    const definition = additionalDefinition(template.generatorRef.id);
    const base = bundle.questions.find(question => question.id === template.baseQuestionRef.questionId
      && question.revision === template.baseQuestionRef.revision);
    if (!base) throw new Error(`Missing generation base for ${template.id}`);

    const stem = (values: number[]) => {
      if (definition) {
        const body = definition.build(values);
        return stemKey(body.prompt, (body.contexts ?? []).map(context => context.blocks));
      }
      const question = bindQuestion(base, template, values, "stem-audit", at);
      return stemKey(question.prompt.blocks, question.contexts.map(context => context.content.blocks));
    };
    const reference = stem(template.referenceParameters.values);
    const exhaustive = definition !== undefined && definition.fields.reduce(
      (size, {minimum, maximum}) => size * (maximum - minimum + 1), 1,
    ) <= exhaustiveLimit;
    let varied = false;
    let checked = 0;
    if (exhaustive) {
      for (const values of tuples(definition.fields)) {
        try {
          varied = stem(values) !== reference;
          checked++;
        } catch (error) {
          if (!(error instanceof Error) ||
              !["PARAMETER_CONSTRAINT", "Insufficient distinct distractors"].includes(error.message)) throw error;
        }
        if (varied) break;
      }
    } else {
      for (let seed = 0; seed < seedCount && !varied; seed++) {
        const {values} = await parametersForSeed(seed.toString(16).padStart(32, "0"), template);
        varied = stem(values) !== reference;
        checked++;
      }
    }
    if (!varied) fixed.push({
      generator: `${template.generatorRef.id}@${template.generatorRef.version}`,
      title: template.title,
      exhaustive,
      checked,
    });
  }
  fixed.sort((a, b) => a.generator.localeCompare(b.generator, "en"));
  return {total: bundle.templates.length, varied: bundle.templates.length - fixed.length, fixed};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(await auditGeneratedStems(), null, 2));
