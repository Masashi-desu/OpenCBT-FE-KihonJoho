import type { AnswerPart, Attribution, Block, PartAnswer, Question } from "../types";
import { DataError } from "../errors";
import { validateAnswerDefinition } from "../answers";

export type GeneratedBody = {
  prompt: Block[];
  choices: Block[][];
  explanation: string;
  correctIndex?: number;
  answerParts?: AnswerPart[];
  partAnswers?: PartAnswer[];
  contexts?: {
    title: string;
    presentation?: "text" | "text_figure";
    blocks: Block[];
  }[];
};
/** Keep the source's answer structure; a compound source cannot become one choice. */
export function bindBodyAnswers(q: Question, body: GeneratedBody, attribution: Attribution) {
  if (Boolean(q.answerParts) !== Boolean(body.answerParts) ||
    Boolean(body.answerParts) !== Boolean(body.partAnswers) ||
    body.answerParts && body.correctIndex !== undefined)
    throw new DataError("SOURCE_FORMAT", "原問題と生成問題の解答欄構成が一致しません");
  if (body.answerParts) {
    q.answerParts = structuredClone(body.answerParts);
    q.correctAnswer = { parts: structuredClone(body.partAnswers!), attribution };
  } else {
    const choice = q.choices[body.correctIndex ?? 0];
    if (!choice) throw new DataError("ANSWER_REF", "生成した正答が選択肢にありません");
    q.correctAnswer = { choiceId: choice.id, attribution };
  }
  validateAnswerDefinition(q);
}
export type GenerationDefinition = {
  source: string;
  title: string;
  fields: { name: string; minimum: number; maximum: number }[];
  reference: number[];
  sourceAnswer: string;
  notes: string;
  version?: "3.2.0" | "3.3.0" | "3.4.0" | "3.5.0" | "3.6.0";
  answerVariation?: "fixed";
  build: (values: number[]) => GeneratedBody;
};
export const field = (name: string, minimum: number, maximum: number) => ({
  name,
  minimum,
  maximum,
});
export const p = (text: string): Block => ({ type: "paragraph", text });
export const code = (text: string, language = "pseudocode"): Block => ({
  type: "code",
  text,
  language,
});
export const table = (
  caption: string,
  columns: string[],
  rows: string[][],
): Block => ({ type: "table", caption, columns, rows });
export const list = (items: string[], ordered = false): Block => ({
  type: "list",
  items,
  ordered,
});
export const strings = (items: string[]): Block[][] => items.map((s) => [p(s)]);
export const programs = (items: string[]): Block[][] =>
  items.map((s) => [code(s)]);
export const figure = (
  profile: string,
  values: number[],
  caption: string,
  alt: string,
): Block => ({
  type: "diagram",
  id: `diagram-${profile}`,
  rendererRef: { id: "renderer-source-figures", version: "1.0.0" },
  caption,
  alt,
  scene: { kind: "source_figure", profile, values },
  attribution: {
    origin: "original",
    sourceRefs: [],
    rightsRefs: ["rights-original"],
    creatorIds: ["codex"],
  },
});
export const pairs = (items: string[][], columns = ["a", "b"]): Block[][] =>
  items.map((row) => [table("空欄の組合せ", columns, [row])]);
export function alternatives(
  correct: string,
  candidates: string[],
  count = 4,
): string[] {
  const unique = [...new Set([correct, ...candidates])];
  if (unique.length < count)
    throw new Error("Insufficient distinct distractors");
  return unique.slice(0, count);
}
export const variableNotes =
  "原問題の問い方・正誤条件・解答対象・選択肢の役割と文章／表／図／空欄の形式を維持して抽象化し、対象・条件・値を対応する位置へバインドする。本文、図、選択肢、正答、独自解説を同じ入力から確定する。固定問題画像を生成問題へ流用しない。";
export function ownContexts(
  body: GeneratedBody,
  attribution: Question["prompt"]["attribution"],
): Question["contexts"] {
  return (body.contexts ?? []).map((c, i) => ({
    id: `context-generated-${i + 1}`,
    title: c.title,
    ...(c.presentation ? { presentation: c.presentation } : {}),
    content: { attribution, blocks: c.blocks },
  }));
}
