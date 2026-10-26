import type { Question, Template, Block } from "../types";
import { DataError } from "../errors";
import { managedLegacyFigure, managedLegacyFigureAlt, validateManagedLegacyValues } from "../managed-legacy-figures";

const source = "2017h29h-fe-pm-3";
const original = `question-ipa-${source}`;
const base = `question-template-source-${source}`;
const template = `template-source-${source}`;
const generator = `generator-source-${source}`;
const ref = (page: number) => ({sourceId: `source-ipa-${source}-qs`, locator: {
  section: "平成29年度 春期 基本情報技術者試験 午後 問3", page, year: 2017,
  period: "春期", exam: "基本情報技術者試験", subject: "午後", timeSlot: "午後", questionNumber: "3",
}});
const adapted = (pages: number[]) => ({origin: "adapted" as const, sourceRefs: pages.map(ref),
  rightsRefs: [`rights-ipa-${source}`, "rights-original"], creatorIds: ["codex"]});
const credit = () => adapted([13]);
const ownCredit = () => ({origin: "original", sourceRefs: [], rightsRefs: ["rights-original"], creatorIds: ["codex"]});
const canonical = (v: unknown): string => JSON.stringify(v, (_, value) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))) : value);
const equal = (a: unknown, b: unknown) => canonical(a) === canonical(b);
const materialError = () => new DataError("SOURCE_MATERIAL", "原資料の図・出典・生成参照と一致しません");
function diagrams(q: Question) {
  return [q.prompt, ...q.contexts.map(c => c.content), ...q.choices.map(c => c.content), q.explanation]
    .flatMap(c => c.blocks.filter((b): b is Extract<Block, {type: "diagram"}> => b.type === "diagram"));
}
function triggered(q: Question, t: Template) {
  return q.id === base || q.id === original || t.id === template ||
    t.generatorRef.id === generator || t.baseQuestionRef.questionId === base ||
    q.origin.derivedFrom.some(r => r.questionId === base || r.questionId === original) ||
    [q.origin.sourceRefs, t.attribution.sourceRefs,
      ...[q.prompt, ...q.contexts.map(c => c.content), ...q.choices.map(c => c.content), q.explanation]
        .map(c => c.attribution.sourceRefs),
      ...diagrams(q).map(b => b.attribution.sourceRefs), q.correctAnswer.attribution.sourceRefs]
      .flat().some(r => r.sourceId === `source-ipa-${source}-qs` || r.sourceId === `source-ipa-${source}-ans`) ||
    diagrams(q).some(b => b.scene.kind === "source_figure" && b.scene.profile === managedLegacyFigure.profile);
}
/** Enforce the full Block upstream. Content.Diagram only forwards scene/caption. */
export function validateLegacyMaterial(q: Question, t: Template): boolean {
  if (!triggered(q, t)) return false;
  const expectedParent = q.id === base ? original : base;
  if (t.id !== template || t.revision !== 1 || t.generatorRef.id !== generator || t.generatorRef.version !== "3.2.0" ||
      t.baseQuestionRef.questionId !== base || t.baseQuestionRef.revision !== 1 ||
      q.revision !== 1 || q.id === original || q.origin.kind !== "official_adaptation" ||
      !q.origin.isModified || q.origin.modificationBasis !== "official_source" ||
      !equal(q.origin.derivedFrom, [{questionId: expectedParent, revision: 1}]) ||
      !equal(q.origin.sourceRefs, [13,14,15,16].map(ref)) ||
      !equal(t.attribution, adapted([13,14,15,16])) || !equal(t.editorIds, ["codex"]) ||
      !equal(q.prompt.attribution, adapted([13,14,15,16])) ||
      !equal(q.correctAnswer.attribution, ownCredit()) || !equal(q.explanation.attribution, ownCredit())) throw materialError();
  const all = diagrams(q), b = q.prompt.blocks[5];
  if (all.length !== 1 || b?.type !== "diagram" || all[0] !== b ||
      b.scene.kind !== "source_figure" || b.scene.profile !== managedLegacyFigure.profile ||
      b.rendererRef.id !== "renderer-source-figures" || b.rendererRef.version !== "1.0.0" ||
      b.caption !== managedLegacyFigure.caption || b.alt !== managedLegacyFigureAlt([0]) ||
      !equal(b.attribution, credit())) throw materialError();
  validateManagedLegacyValues(b.scene.values);
  return true;
}
/** Only the reviewed base at the reviewed slot may supply this credit. */
export function legacyMaterialCredit(baseQuestion: Question, t: Template) {
  if (!validateLegacyMaterial(baseQuestion, t)) return undefined;
  if (baseQuestion.id !== base || baseQuestion.revision !== 1) throw materialError();
  const b = baseQuestion.prompt.blocks[5];
  if (b.type !== "diagram") throw materialError();
  return structuredClone(b.attribution);
}
