import type { Block, Content, Question, Template } from "../types";
import { DataError } from "../errors";
import { sourceFigureAlt } from "../source-figures";
import { bindBodyAnswers, type GeneratedBody, type GenerationDefinition } from "./definition";
import { legacyAfternoonPublicNotes } from "./legacy-afternoon-public-notes";
import { validate2017AutumnFixedMaterials } from "./legacy-2017-autumn-fixed-materials";
import { validate2018SpringFixedMaterials } from "./legacy-2018-spring-material-validation";

/** Fixed source material credits belong to their individual content/diagram
 * slots. Shared language references cannot inherit the main question's right. */
export function bindLegacyAfternoonQuestion(base: Question, template: Template, definition: GenerationDefinition,
  values: number[], instanceId: string, at: string): Question {
  const publicNotes = legacyAfternoonPublicNotes[definition.source];
  if (!publicNotes) throw new DataError("SOURCE_FORMAT", "旧午後の公開用の改変説明がありません。");
  validate2017AutumnFixedMaterials(base,definition);
  validate2018SpringFixedMaterials(base,definition);
  const body = definition.build(values);
  if (base.id !== `question-template-source-${definition.source}` || base.choiceShuffleAllowed ||
    template.baseQuestionRef.questionId !== base.id || template.baseQuestionRef.revision !== base.revision ||
    base.choices.length !== body.choices.length || base.contexts.length !== (body.contexts ?? []).length)
    throw new DataError("SOURCE_FORMAT", "旧午後の基準問題と生成形式が一致しません。");
  let diagram = 0;
  const content = (blocks: Block[], original: Content): Content => {
    if (blocks.length !== original.blocks.length)
      throw new DataError("SOURCE_FORMAT", "旧午後の本文・参照資料の単位が一致しません。");
    return { attribution: structuredClone(original.attribution), blocks: blocks.map((block, index) => {
      if (block.type !== "diagram") return structuredClone(block);
      const source = original.blocks[index];
      if (source.type !== "diagram") throw new DataError("SOURCE_FORMAT", "原資料の図位置が一致しません。");
      return { ...structuredClone(block), id: `diagram-generated-${++diagram}`,
        attribution: structuredClone(source.attribution),
        alt: block.scene.kind === "source_figure" ? sourceFigureAlt(block.scene.profile, block.scene.values) : block.alt };
    }) };
  };
  const question = structuredClone(base);
  question.id = `question-${instanceId}`; question.revision = 1;
  question.origin.derivedFrom = [template.baseQuestionRef];
  question.origin.changes.push({ at, actorId: template.editorIds[0], kind: "wording",
    summary: "旧午後の原形式を保持して対象・条件・値を改変",
    details: publicNotes,
    affectsAnswer: true, answerDetails: body.explanation });
  question.prompt = content(body.prompt, base.prompt);
  question.contexts = (body.contexts ?? []).map((context, index) => ({ ...base.contexts[index],
    title: context.title, content: content(context.blocks, base.contexts[index].content),
    ...(context.presentation ? { presentation: context.presentation } : {}) }));
  question.contextRefs = question.contexts.map(context => context.id);
  question.choices = body.choices.map((blocks, index) => ({ id: `choice-value-${index + 1}`,
    content: content(blocks, base.choices[index].content) }));
  const own = { origin: "original" as const, sourceRefs: [], rightsRefs: ["rights-original"], creatorIds: template.editorIds };
  bindBodyAnswers(question, body, own);
  question.explanation = { attribution: own, blocks: [{ type: "paragraph", text: body.explanation }] };
  question.assetRefs = [...new Set(question.contexts.flatMap(context => context.content.blocks
    .flatMap(block => block.type === "image" ? [block.assetId] : [])))];
  validate2017AutumnFixedMaterials(question,definition);
  validate2018SpringFixedMaterials(question,definition);
  return question;
}

function comparable(blocks: Block[]) {
  return JSON.stringify(blocks.map(block => block.type !== "diagram" ? block : {
    type: block.type, caption: block.caption, scene: block.scene,
    ...(block.captionPresentation ? { captionPresentation: block.captionPresentation } : {}),
    ...(block.sourceLabels ? { sourceLabels: block.sourceLabels } : {}),
  }));
}
function matches(question: Question, body: GeneratedBody) {
  return comparable(question.prompt.blocks) === comparable(body.prompt) &&
    JSON.stringify(question.answerParts) === JSON.stringify(body.answerParts) &&
    JSON.stringify(question.correctAnswer.parts) === JSON.stringify(body.partAnswers) &&
    question.choices.length === body.choices.length && question.choices.every((choice, index) =>
      choice.id === `choice-value-${index + 1}` && comparable(choice.content.blocks) === comparable(body.choices[index])) &&
    question.contexts.length === (body.contexts ?? []).length && question.contexts.every((context, index) =>
      context.title === body.contexts![index].title && context.presentation === body.contexts![index].presentation &&
      comparable(context.content.blocks) === comparable(body.contexts![index].blocks)) &&
    question.explanation.blocks.length > 0 && question.explanation.blocks.every(block => block.type === "paragraph") &&
    question.explanation.blocks.map(block => block.type === "paragraph" ? block.text : "").join("\n") === body.explanation;
}

/** These enumerated domains have independent per-major content tests. A
 * structural match alone would not detect a missing premise or stale bank. */
export function validateLegacyAfternoonFormat(question: Question, definition: GenerationDefinition) {
  validate2017AutumnFixedMaterials(question,definition);
  validate2018SpringFixedMaterials(question,definition);
  // Reviewed source-owned errata/language appendices are fixed references,
  // not fixed images of a generated question. Their exact IDs/order are also
  // checked against the registered body below; catalog rights checks still run.
  const fixedReferences = ["2017h29h-fe-pm-12", "2017h29h-fe-pm-13", "2017h29a-fe-pm-5",
    "2017h29a-fe-pm-8", "2017h29a-fe-pm-11", "2017h29a-fe-pm-12", "2017h29a-fe-pm-13",
    "2018h30h-fe-pm-8", "2018h30h-fe-pm-10", "2018h30h-fe-pm-12", "2018h30h-fe-pm-13"].includes(definition.source);
  const imageRefs = [...new Set(question.contexts.flatMap(context => context.content.blocks
    .flatMap(block => block.type === "image" ? [block.assetId] : [])))];
  if (question.choiceShuffleAllowed || (!fixedReferences && imageRefs.length) ||
    JSON.stringify(question.assetRefs) !== JSON.stringify(imageRefs) ||
    [question.prompt, ...question.choices.map(choice => choice.content)]
      .some(content => content.blocks.some(block => block.type === "image")))
    throw new DataError("SOURCE_FORMAT", "旧午後の記号順・本文形式が一致しません。");
  let found = false;
  const visit = (index: number, values: number[]) => {
    if (found) return;
    if (index === definition.fields.length) {
      try { found = matches(question, definition.build(values)); }
      catch (error) { if (!(error instanceof Error) || error.message !== "PARAMETER_CONSTRAINT") throw error; }
      return;
    }
    const field = definition.fields[index];
    for (let value = field.minimum; value <= field.maximum; value++) visit(index + 1, [...values, value]);
  };
  visit(0, []);
  if (!found) throw new DataError("SOURCE_FORMAT", "旧午後の問い・全前提・選択肢・正答・説明が同じ生成条件に一致しません。");
}
