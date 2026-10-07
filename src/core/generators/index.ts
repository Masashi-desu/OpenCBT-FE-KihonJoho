import type { Question, Template, Block } from "../types";
import { DataError } from "../errors";
import { knowledgeDefinitions } from "./knowledge";
import { subjectADefinitions } from "./subject-a";
import { subjectBDefinitions } from "./subject-b";
import { securityDefinitions } from "./security";
import { ownContexts, p } from "./definition";
import { sourceFigureAlt, validateSourceFigure } from "../source-figures";
import { withCorrections } from "./corrections";

export const additionalDefinitions = [
  ...knowledgeDefinitions,
  ...subjectADefinitions,
  ...subjectBDefinitions,
  ...securityDefinitions,
].map(withCorrections);
if (
  new Set(additionalDefinitions.map((d) => d.source)).size !==
  additionalDefinitions.length
)
  throw Error("Duplicate source generator");
export const additionalContracts = additionalDefinitions.map((d) => ({
  id: `source-${d.source}`,
  source: d.source,
  title: d.title,
  fields: d.fields,
  reference: d.reference,
  notes: d.notes,
  version: d.version ?? "3.0.0",
}));
export function additionalDefinition(id: string) {
  return additionalDefinitions.find(
    (d) => `generator-source-${d.source}` === id,
  );
}
export function checkAdditionalParameters(t: Template, values: number[]) {
  const d = additionalDefinition(t.generatorRef.id);
  if (!d || !["3.0.0", d.version ?? "3.0.0"].includes(t.generatorRef.version))
    throw new DataError("GENERATOR_REF", "未登録の全問対応生成器");
  try {
    (t.generatorRef.version === "3.0.0" ? (d.legacyBuild ?? d.build) : d.build)(
      values,
    );
  } catch (e) {
    if (e instanceof Error && e.message === "PARAMETER_CONSTRAINT")
      throw new DataError("PARAMETER_CONSTRAINT", "計算条件を満たしません");
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
  const d = additionalDefinition(t.generatorRef.id);
  if (!d) throw new DataError("GENERATOR_REF", "未登録の生成器");
  const body = (
      t.generatorRef.version === "3.0.0" ? (d.legacyBuild ?? d.build) : d.build
    )(values),
    q = structuredClone(base),
    attr = t.attribution;
  let diagramIndex = 0;
  const fixDiagrams = (blocks: Block[]) =>
    blocks.map((b) =>
      b.type === "diagram"
        ? {
            ...b,
            id: `diagram-generated-${++diagramIndex}`,
            attribution: structuredClone(attr),
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
  q.prompt = { attribution: attr, blocks: fixDiagrams(body.prompt) };
  q.contexts = ownContexts(body, attr).map((c) => ({
    ...c,
    content: { ...c.content, blocks: fixDiagrams(c.content.blocks) },
  }));
  q.contextRefs = q.contexts.map((c) => c.id);
  q.choices = body.choices.map((blocks, i) => ({
    id: `choice-value-${i + 1}`,
    content: { attribution: attr, blocks: fixDiagrams(blocks) },
  }));
  const own = {
    origin: "original" as const,
    sourceRefs: [],
    rightsRefs: ["rights-original"],
    creatorIds: t.editorIds,
  };
  q.correctAnswer = {
    choiceId: q.choices[body.correctIndex ?? 0].id,
    attribution: own,
  };
  q.explanation = { attribution: own, blocks: [p(body.explanation)] };
  q.assetRefs = [];
  q.choiceShuffleAllowed = true;
  return q;
}
export function validateAdditionalFormat(q: Question, t: Template) {
  const d = additionalDefinition(t.generatorRef.id);
  if (!d || !["3.0.0", d.version ?? "3.0.0"].includes(t.generatorRef.version))
    throw new DataError("GENERATOR_REF", "生成形式の未登録");
  const reference = (
      t.generatorRef.version === "3.0.0" ? (d.legacyBuild ?? d.build) : d.build
    )(d.reference),
    types = (blocks: Block[]) => blocks.map((b) => b.type).join(",");
  if (
    types(q.prompt.blocks) !== types(reference.prompt) ||
    q.choices.length !== reference.choices.length ||
    q.choices.some(
      (c, i) => types(c.content.blocks) !== types(reference.choices[i]),
    ) ||
    q.contexts.length !== (reference.contexts ?? []).length ||
    q.contexts.some(
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
  for (const content of [
    q.prompt,
    ...q.contexts.map((c) => c.content),
    ...q.choices.map((c) => c.content),
  ])
    for (const block of content.blocks)
      if (block.type === "diagram") {
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
