import type { Bundle } from "../types";
import { DataError } from "../errors";
import { bindQuestion } from "../generation";
import { additionalDefinition, registerAdditionalDefinitions } from "./index";
import type { GenerationDefinition } from "./definition";

const generator = /^generator-source-((?:2017h29[ha]|2018h30[ha]|2019h31h|2019r01a)-fe-am-(?:[1-9]|[1-7]\d|80))$/;
let prepared: Promise<readonly GenerationDefinition[]> | undefined;

/** Catalog validation still owns all rights, references and release gates.
 * Only implementations requested by the supplied AM templates are installed. */
export async function ensureLegacyMorningGenerators(bundle: Bundle, executableTemplates?: ReadonlySet<string>) {
  const templates = bundle.templates.filter(t => generator.test(t.generatorRef.id) &&
    (!executableTemplates || executableTemplates.has(`${t.id}@${t.revision}`)));
  if (!templates.length) return;
  for (const t of templates) {
    const d = additionalDefinition(t.generatorRef.id);
    if (d && (d.version ?? "3.2.0") !== t.generatorRef.version)
      throw new DataError("GENERATOR_REF", "旧午前の生成器版が一致しません");
  }
  const missing = templates.filter(t => !additionalDefinition(t.generatorRef.id));
  if (!missing.length) return;
  if (!prepared) {
    prepared = import("./legacy-morning-registry").then(({makeLegacyMorningRegistry}) =>
      makeLegacyMorningRegistry({ ...bundle, bindCore: bindQuestion }));
    prepared.catch(() => { prepared = undefined; });
  }
  const definitions = await prepared;
  const requested = [...new Set(missing.map(t => t.generatorRef.id))].map(id => {
    const source = generator.exec(id)![1], d = definitions.find(d => d.source === source);
    if (!d || templates.some(t => t.generatorRef.id === id && t.generatorRef.version !== (d.version ?? "3.2.0")))
      throw new DataError("GENERATOR_REF", "旧午前の査読済み生成器がありません");
    return d;
  });
  registerAdditionalDefinitions(requested);
}
