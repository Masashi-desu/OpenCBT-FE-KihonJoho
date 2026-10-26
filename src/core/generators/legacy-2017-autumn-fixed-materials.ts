import type { Question } from "../types";
import type { GenerationDefinition } from "./definition";
import { DataError } from "../errors";
import { sortedJson } from "../hash";
import input from "./legacy-2017-autumn-fixed-materials.json";

// Module-owned, current provenance only. This is not a permission receipt and
// does not change distribution or any rights. Catalog admission remains gated.
const reviewed = structuredClone(input) as Record<string, typeof input["2017h29a-fe-pm-11"]>;
const equal = (a: unknown,b: unknown) => JSON.stringify(sortedJson(a)) === JSON.stringify(sortedJson(b));
export function validate2017AutumnFixedMaterials(question: Question, definition: GenerationDefinition) {
  const material = reviewed[definition.source];
  if (!material) return;
  const contexts = question.contexts.map(context => ({ id:context.id,title:context.title,
    ...(context.presentation ? { presentation:context.presentation } : {}),attribution:context.content.attribution }));
  const body = definition.build([...definition.reference]);
  if (!equal(question.contextRefs,material.contextRefs) || !equal(contexts,material.contexts) ||
    !equal(question.assetRefs,material.assetRefs) ||
    !equal(question.contexts.map(context => context.content.blocks),body.contexts?.map(context => context.blocks)))
    throw new DataError("SOURCE_MATERIAL","秋期旧午後の固定資料・個別出典・権利範囲が一致しません。");
}
