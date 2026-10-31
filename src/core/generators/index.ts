import {bindLegacy2019Spring42Materials,validateLegacy2019Spring42Materials}from './legacy-2019-spring-42-material';
import {bindCommonFramework65Explanation,validateCommonFramework65Materials} from './common-framework65-material';
import { legacyMaterialCredit, validateLegacyMaterial } from "./legacy-material-contracts";
import { activityNetworkRenderer, readActivityNetwork } from "../activity-network";
import type { Question, Template, Block } from "../types";
import { DataError } from "../errors";
import { effectivePublicDefinitions } from "./effective-public";
import { legacyAfternoonDefinition } from "./legacy-afternoon-definitions";
import { bindLegacyAfternoonQuestion, validateLegacyAfternoonFormat } from "./legacy-afternoon-binding";
import { bindBodyAnswers, ownContexts, p, type GenerationDefinition } from "./definition";
import { sourceFigureAlt, validateSourceFigure } from "../source-figures";
import { knowledgeForms } from "./knowledge-formats";
import { subjectAFormatDefinitions } from "./subject-a-formats";
import { bindMorningContent, isLegacyMorningSource, morningCommonContexts, morningBlockRoles } from "./legacy-morning-format";

// Active entries may be extended; canonical public roots retain their own array.
export const additionalDefinitions: GenerationDefinition[] = [...effectivePublicDefinitions];
const asContract = (d: GenerationDefinition) => ({
  id: `source-${d.source}`,
  source: d.source,
  title: d.title,
  fields: d.fields,
  reference: d.reference,
  notes: d.notes,
  version: d.version ?? "3.2.0",
});
export const additionalContracts = additionalDefinitions.map(asContract);
/** Managed application code only; data records cannot provide implementations.
 * Check the complete batch before changing either parallel registry. */
export function registerAdditionalDefinitions(definitions: readonly GenerationDefinition[]) {
  const sources = new Set<string>();
  for (const d of definitions) {
    if (sources.has(d.source) || additionalDefinitions.some(current => current.source === d.source && current !== d))
      throw new DataError("GENERATOR_REF", "生成器の重複登録");
    sources.add(d.source);
  }
  for (const d of definitions) if (!additionalDefinitions.includes(d)) {
    additionalDefinitions.push(d);
    additionalContracts.push(asContract(d));
  }
}
export function additionalContract(id: string, version: string) {
  const d = definitionForVersion(id, version);
  return d ? asContract(d) : undefined;
}
export function additionalDefinition(id: string) {
  return legacyAfternoonDefinition(id) ?? additionalDefinitions.find(
    (d) => `generator-source-${d.source}` === id,
  );
}
export function definitionForVersion(id: string, version: string) {
  const d = additionalDefinition(id);
  if (!d) return undefined;
  if (version === (d.version ?? "3.2.0")) return d;
  return undefined;
}
export function checkAdditionalParameters(t: Template, values: number[]) {
  const d = definitionForVersion(t.generatorRef.id, t.generatorRef.version);
  if (!d) throw new DataError("GENERATOR_REF", "未登録の全問対応生成器");
  try {
    d.build(values);
  } catch (e) {
    if (e instanceof Error && e.message === "PARAMETER_CONSTRAINT")
      throw new DataError("PARAMETER_CONSTRAINT", "計算条件を満たしません");
    if (e instanceof Error && e.message === "Insufficient distinct distractors")
      throw new DataError(
        "PARAMETER_CONSTRAINT",
        "必要な数の異なる選択肢を作れない入力です",
      );
    throw e;
  }
}
export function bindAdditionalQuestion(
  base: Question,
  t: Template,
  values: number[],
  instanceId: string,
  at: string,
): Question {
  validateLegacy2019Spring42Materials(base, t);
  const materialCredit = legacyMaterialCredit(base, t);
  const d = definitionForVersion(t.generatorRef.id, t.generatorRef.version);
  if (!d) throw new DataError("GENERATOR_REF", "未登録の生成器");
  if (legacyAfternoonDefinition(t.generatorRef.id))
    return bindLegacyAfternoonQuestion(base, t, d, values, instanceId, at);
  const body = d.build(values),
    q = structuredClone(base),
    attr = t.attribution;
  const morning = isLegacyMorningSource(d.source), common = morning ? morningCommonContexts(base, d.source) : [];
  const nativeContexts = base.contexts.filter(c => !common.some(ref => ref.id === c.id));
  if (morning && nativeContexts.length !== (body.contexts ?? []).length)
    throw new DataError("SOURCE_FORMAT", "旧午前の参照資料が基準と一致しません");
  let diagramIndex = 0;
  const fixDiagrams = (blocks: Block[]) =>
    blocks.map((b) =>
      b.type === "diagram"
        ? {
            ...b,
            id: `diagram-generated-${++diagramIndex}`,
            attribution: structuredClone(morning ? b.attribution : materialCredit ?? attr),
            alt:
              b.scene.kind === "source_figure"
                ? sourceFigureAlt(b.scene.profile, b.scene.values)
                : b.alt,
          }
        : b,
    );
  q.id = `question-${instanceId}`;
  q.revision = 1;
  q.origin.kind = "official_adaptation";
  q.origin.isModified = true;
  q.origin.modificationBasis = "official_source";
  q.origin.derivedFrom = [t.baseQuestionRef];
  q.origin.changes.push({
    at,
    actorId: t.editorIds[0],
    kind: "wording",
    summary: "対象・条件・値をバインドした改変問題",
    details: `${d.notes} ${d.fields.map((f, i) => `${f.name}=${values[i]}`).join("、")}。`,
    affectsAnswer: true,
    answerDetails: body.explanation,
  });
  const prompt = morning ? bindMorningContent(body.prompt, base.prompt, t.editorIds) : { attribution: attr, blocks: body.prompt };
  q.prompt = { ...prompt, blocks: fixDiagrams(prompt.blocks) };
  q.contexts = ownContexts(body, attr).map((c, i) => {
    const content = morning ? bindMorningContent(c.content.blocks, nativeContexts[i].content, t.editorIds) : c.content;
    return {
    ...c,
    content: { ...content, blocks: fixDiagrams(content.blocks) },
  }; }).concat(common);
  q.contextRefs = q.contexts.map((c) => c.id);
  q.choices = body.choices.map((blocks, i) => {
    const content = morning ? bindMorningContent(blocks, base.choices[i].content, t.editorIds) : { attribution: attr, blocks };
    return {
    id: `choice-value-${i + 1}`,
    content: { ...content, blocks: fixDiagrams(content.blocks) },
  }; });
  const own = {
    origin: "original" as const,
    sourceRefs: [],
    rightsRefs: ["rights-original"],
    creatorIds: t.editorIds,
  };
  bindBodyAnswers(q, body, own);
  q.explanation = { attribution: own, blocks: [p(body.explanation)] };
  q.assetRefs = [];
  bindLegacy2019Spring42Materials(q, base, t);
  bindCommonFramework65Explanation(q, base, t, d);
  validateCommonFramework65Materials(q, t, d);
  validateLegacyMaterial(q, t);
  return q;
}
export function validateAdditionalFormat(q: Question, t: Template) {
  validateLegacy2019Spring42Materials(q, t);
  validateLegacyMaterial(q, t);
  const d = definitionForVersion(t.generatorRef.id, t.generatorRef.version);
  if (!d) throw new DataError("GENERATOR_REF", "生成形式の未登録");
  if (legacyAfternoonDefinition(t.generatorRef.id)) {
    validateLegacyAfternoonFormat(q, d);
    return;
  }
  validateCommonFramework65Materials(q, t, d);
  const reference = d.build(d.reference),
    types = (blocks: Block[]) => (isLegacyMorningSource(d.source) ? morningBlockRoles(blocks) : blocks.map(b => b.type)).join(",");
  const common = isLegacyMorningSource(d.source) ? morningCommonContexts(q, d.source) : [];
  const contexts = q.contexts.filter(c => !common.some(ref => ref.id === c.id));
  if (
    types(q.prompt.blocks) !== types(reference.prompt) ||
    Boolean(q.answerParts) !== Boolean(reference.answerParts) ||
    q.answerParts?.some((part, i) => !reference.answerParts?.[i] ||
      part.id !== reference.answerParts[i].id || part.label !== reference.answerParts[i].label ||
      part.choiceIds.length !== reference.answerParts[i].choiceIds.length) ||
    q.answerParts?.length !== reference.answerParts?.length ||
    q.choices.length !== reference.choices.length ||
    q.choices.some(
      (c, i) => types(c.content.blocks) !== types(reference.choices[i]),
    ) ||
    contexts.length !== (reference.contexts ?? []).length ||
    contexts.some(
      (c, i) =>
        c.presentation !== reference.contexts![i].presentation ||
        types(c.content.blocks) !== types(reference.contexts![i].blocks),
    )
  )
    throw new DataError("SOURCE_FORMAT", "原資料の生成形式と一致しません");
  if (
    q.assetRefs.length ||
    [
      q.prompt,
      ...q.contexts.map((c) => c.content),
      ...q.choices.map((c) => c.content),
    ].some((c) => c.blocks.some((b) => b.type === "image"))
  )
    throw new DataError("SOURCE_FORMAT", "生成問題に固定画像が含まれています");
  if (
    knowledgeForms[d.source] ||
    subjectAFormatDefinitions.some((f) => f.source === d.source)
  ) {
    // These source forms have small, enumerated subjects. Comparing their
    // semantic scaffold also rejects reversed questions with identical blocks.
    const choices = (items: Block[][]) =>
      items.map((blocks) => JSON.stringify(blocks)).sort();
    const actual = choices(q.choices.map((c) => c.content.blocks));
    const matches = Array.from(
      { length: d.fields[0].maximum + 1 },
      (_, target) => d.build([target, 0]),
    ).some(
      (body) =>
        JSON.stringify(q.prompt.blocks) === JSON.stringify(body.prompt) &&
        JSON.stringify(actual) === JSON.stringify(choices(body.choices)),
    );
    if (!matches)
      throw new DataError(
        "SOURCE_FORMAT",
        "原問題の問い方・判定条件・選択肢の役割と一致しません",
      );
  }
  const nativeMaterials = [q.prompt, ...contexts.map(c => c.content), ...q.choices.map(c => c.content)];
  const referenceMaterials = [reference.prompt, ...(reference.contexts ?? []).map(c => c.blocks), ...reference.choices];
  for (const content of [q.prompt, ...q.contexts.map(c => c.content), ...q.choices.map(c => c.content)])
    for (const block of content.blocks)
      if (block.type === "diagram") {
        const materialIndex = nativeMaterials.indexOf(content),
          structuredIndex = content.blocks.filter(b => b.type !== "paragraph").indexOf(block),
          sourceSlot = referenceMaterials[materialIndex]?.filter(b => b.type !== "paragraph")[structuredIndex];
        // A managed old-AM alias may retain the shared activity renderer.
        // It must occupy the same structured source slot; common pages and
        // unrelated definitions cannot gain another renderer through this path.
        if (isLegacyMorningSource(d.source) && block.rendererRef.id === activityNetworkRenderer.id &&
          block.rendererRef.version === activityNetworkRenderer.version && sourceSlot?.type === "diagram" &&
          sourceSlot.rendererRef.id === activityNetworkRenderer.id && sourceSlot.rendererRef.version === activityNetworkRenderer.version) {
          readActivityNetwork(block.scene);
          continue;
        }
        if (
          block.rendererRef.id !== "renderer-source-figures" ||
          block.rendererRef.version !== "1.0.0"
        )
          throw new DataError(
            "RENDERER_REF",
            "生成図の描画器が登録契約と不一致",
          );
        validateSourceFigure(block.scene);
      }
}
