import type { Question, Template, Block } from "../types";
import { DataError } from "../errors";
import { knowledgeDefinitions } from "./knowledge";
import { subjectADefinitions } from "./subject-a";
import { subjectBDefinitions } from "./subject-b";
import { securityDefinitions } from "./security";
import { april2022Definitions } from "./sample-2022-april";
import { decemberProgramDefinitions } from "./sample-2022-dec-programs";
import { decemberScenarioDefinitions } from "./sample-2022-dec-scenarios";
import { decemberADefinitions } from "./sample-2022-dec-a";
import { bindBodyAnswers, ownContexts, p, type GenerationDefinition } from "./definition";
import { sourceFigureAlt, validateSourceFigure } from "../source-figures";
import { withCorrections } from "./corrections";
import { knowledgeForms } from "./knowledge-formats";
import { subjectAFormatDefinitions } from "./subject-a-formats";
import {
  calculationSources,
  calculationNotes,
  checkCalculationInputs,
} from "./calculation-options";

const restoredDeclarations = new Set([
  "2023-b-5",
  "2024-b-5",
  "2025-b-4",
  "2025-b-5",
  "2026-b-1",
  "2026-b-5",
]);
const wordingRevisedSources = new Set([
  "2023-a-2",
  "2023-a-6",
  "2023-a-10",
  "2023-a-11",
  "2023-a-13",
  "2024-a-10",
  "2024-a-19",
  "2025-a-13",
  "2025-a-16",
  "2025-a-17",
  "2026-a-1",
  "2026-a-8",
  "2026-a-9",
  "2026-a-11",
  "2026-a-15",
  "2026-a-18",
  "2023-b-1",
  "2023-b-2",
  "2023-b-3",
  "2023-b-4",
  "2023-b-5",
  "2023-b-6",
  "2024-b-1",
  "2024-b-2",
  "2024-b-3",
  "2024-b-4",
  "2024-b-5",
  "2024-b-6",
  "2025-b-3",
  "2025-b-4",
  "2025-b-5",
  "2026-b-1",
  "2026-b-4",
  "2026-b-5",
]);

// These revisions remove answer cues or restore the source's example choices.
const knowledgeQualityNotes: Record<string, string> = {
  "2024-a-5": " 定義を前提として具体例を選ぶ原形式を維持し、四つの選択肢を独自のWebサービス利用事例にした。入出力の連結・画面への組込み・データの統合・部分更新を区別する。",
  "2024-a-10": " 攻撃名から有効な対策を選ぶ。正答の方針を先に示す目的の補足を出題本文から除いた。",
  "2025-a-1": " 用語から説明を選ぶ。事前学習・強化学習・検索拡張生成の定義や実施段階を前置きせず、ファインチューニングの事前学習済みモデルという原前提だけを保持する。",
  "2026-a-11": " 発生した問題から対策を選ぶ。問題の状況を維持し、テストやレビューなど解法を先に示す補足目的を除いた。",
  "2026-a-12": " グラフの使い方を選ぶ。表示量をそのまま読める独自の対象名を累積フロー図・ガントチャートへ置き換え、各グラフの軸・表示方法・用途を区別する。",
};

export const additionalDefinitions = [
  ...knowledgeDefinitions,
  ...subjectADefinitions,
  ...subjectAFormatDefinitions,
  ...subjectBDefinitions,
  ...securityDefinitions,
  ...april2022Definitions,
  ...decemberProgramDefinitions,
  ...decemberScenarioDefinitions,
  ...decemberADefinitions,
]
  .map(withCorrections)
  .map((d) =>
    calculationSources.includes(d.source)
      ? {
          ...d,
          version: "3.3.0" as const,
          notes: d.notes + calculationNotes,
          build(values: number[]) {
            checkCalculationInputs(d.source, values);
            return d.build(values);
          },
        }
      : { ...d, version: "3.2.0" as const },
  )
  .map(d => wordingRevisedSources.has(d.source) ? { ...d, version: "3.4.0" as const } : d)
  .map(d => knowledgeQualityNotes[d.source]
    ? { ...d, version: "3.5.0" as const, notes: d.notes + knowledgeQualityNotes[d.source] }
    : d)
  .map(d => restoredDeclarations.has(d.source)
    ? {
        ...d,
        version: "3.6.0" as const,
        notes: d.notes + " 原問題で宣言している変数を、要素数や作業値の数値置換・宣言の省略で失わない。",
      }
    : d);
if (
  new Set(additionalDefinitions.map((d) => d.source)).size !==
  additionalDefinitions.length
)
  throw Error("Duplicate source generator");
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
export function additionalContract(id: string, version: string) {
  const d = definitionForVersion(id, version);
  return d ? asContract(d) : undefined;
}
export function additionalDefinition(id: string) {
  return additionalDefinitions.find(
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
  const d = definitionForVersion(t.generatorRef.id, t.generatorRef.version);
  if (!d) throw new DataError("GENERATOR_REF", "未登録の生成器");
  const body = d.build(values),
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
  bindBodyAnswers(q, body, own);
  q.explanation = { attribution: own, blocks: [p(body.explanation)] };
  q.assetRefs = [];
  return q;
}
export function validateAdditionalFormat(q: Question, t: Template) {
  const d = definitionForVersion(t.generatorRef.id, t.generatorRef.version);
  if (!d) throw new DataError("GENERATOR_REF", "生成形式の未登録");
  const reference = d.build(d.reference),
    types = (blocks: Block[]) => blocks.map((b) => b.type).join(",");
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
