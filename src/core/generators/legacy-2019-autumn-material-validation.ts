import type { Question } from "../types";
import type { GenerationDefinition } from "./definition";
import { DataError } from "../errors";
import { sortedJson } from "../hash";
import input from "./legacy-2019-autumn-fixed-material-identities.json";

// Current fixed references only: source p3/4, and p85–90 for the spreadsheet.
// Their full assets, source scope and attribution have a separate material review.
const identities = structuredClone(input) as Record<string, { original: unknown; adapted: unknown }>;
const equal = (a: unknown, b: unknown) => JSON.stringify(sortedJson(a)) === JSON.stringify(sortedJson(b));
export function validate2019AutumnFixedMaterials(question: Question, definition: GenerationDefinition) {
  if (!Object.hasOwn(identities, definition.source)) return;
  const kind = question.origin.kind === "official_reprint" ? "original" :
    question.origin.kind === "official_adaptation" ? "adapted" : undefined;
  if (!kind || !equal({ contextRefs: question.contextRefs, contexts: question.contexts, assetRefs: question.assetRefs }, identities[definition.source][kind]))
    throw new DataError("SOURCE_MATERIAL", "秋期旧午後の固定資料・個別出典・権利範囲・表示順が一致しません。");
}
