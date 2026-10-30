import type { Question } from "../types";
import type { GenerationDefinition } from "./definition";
import { DataError } from "../errors";
import { sortedJson } from "../hash";
import input from "./legacy-2019-spring-fixed-material-identities.json";

// These are current fixed-reference identities, not past question snapshots.
// A separate source/material review establishes permission and correctness.
const identities = structuredClone(input) as Record<string, { original: unknown; adapted: unknown }>;
const equal = (a: unknown, b: unknown) => JSON.stringify(sortedJson(a)) === JSON.stringify(sortedJson(b));
export function validate2019SpringFixedMaterials(question: Question, definition: GenerationDefinition) {
  if (!Object.hasOwn(identities, definition.source)) return;
  const kind = question.origin.kind === "official_reprint" ? "original" :
    question.origin.kind === "official_adaptation" ? "adapted" : undefined;
  if (!kind || !equal({ contextRefs: question.contextRefs, contexts: question.contexts, assetRefs: question.assetRefs }, identities[definition.source][kind]))
    throw new DataError("SOURCE_MATERIAL", "春期旧午後の固定資料・個別出典・権利範囲・表示順が一致しません。");
}
