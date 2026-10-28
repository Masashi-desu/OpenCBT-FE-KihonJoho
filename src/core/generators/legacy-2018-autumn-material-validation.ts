import type { Question } from "../types";
import type { GenerationDefinition } from "./definition";
import { DataError } from "../errors";
import { sortedJson } from "../hash";
import input from "./legacy-2018-autumn-fixed-material-identities.json";

// Current fixed appendix identities and individual credits only. This is
// neither a material permission receipt nor a historical Question snapshot.
// All four sources use fixed image references; no field or array is normalized.
const identities = structuredClone(input) as Record<string, unknown>;
const equal = (a: unknown, b: unknown) => JSON.stringify(sortedJson(a)) === JSON.stringify(sortedJson(b));
export function validate2018AutumnFixedMaterials(question: Question, definition: GenerationDefinition) {
  if (!Object.hasOwn(identities, definition.source)) return;
  const expected = identities[definition.source];
  if (!equal({ contextRefs: question.contextRefs, contexts: question.contexts, assetRefs: question.assetRefs }, expected))
    throw new DataError("SOURCE_MATERIAL", "秋期旧午後の固定資料・個別出典・権利範囲・表示順が一致しません。");
}
