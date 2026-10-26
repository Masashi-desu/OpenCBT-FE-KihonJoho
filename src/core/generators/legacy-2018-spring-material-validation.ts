import type { Question } from "../types";
import type { GenerationDefinition } from "./definition";
import { DataError } from "../errors";
import { sortedJson } from "../hash";
import input from "./legacy-2018-spring-fixed-material-identities.json";

// Current identities and per-material credits, not a permission receipt.
// The twelve Unicode character facts are fixed, independent of generated values.
const identities = structuredClone(input) as Record<string, unknown>;
const equal = (a: unknown, b: unknown) => JSON.stringify(sortedJson(a)) === JSON.stringify(sortedJson(b));
export function validate2018SpringFixedMaterials(question: Question, definition: GenerationDefinition) {
  const expected = identities[definition.source];
  if (!expected) return;
  // Generated diagram IDs are instance-local. No material field or attribution
  // is otherwise normalized: replacements, omissions and altered facts fail.
  const contexts = structuredClone(question.contexts);
  for (const context of contexts) for (const block of context.content.blocks)
    if (block.type === "diagram" && block.scene.kind === "source_figure" &&
      block.scene.profile === "legacy-2018-spring-pm12-unicode-reference")
      block.id = "diagram-legacy-2018-spring-pm12-unicode-reference";
  if (!equal({ contextRefs: question.contextRefs, contexts, assetRefs: question.assetRefs }, expected))
    throw new DataError("SOURCE_MATERIAL", "春期旧午後の固定資料・個別出典・権利範囲が一致しません。");
}
