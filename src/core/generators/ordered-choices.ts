import { DataError } from "../errors";
import type { Question } from "../types";

// Reviewed against the source answer groups. "authored" keeps the generator's
// correspondence to the source table, labels, or structured answer group.
const authored = new Set([
  "2023-a-10", "2023-a-13", // Positions and work names in the source diagrams.
  "sample-2022-dec-a-50", "2019h31h-fe-am-65", // Investment cases a–d.
  "2017h29a-fe-am-53", "2018h30h-fe-am-51", "2019r01a-fe-am-52", // Groups of named activities.
  "2016h28a-fe-am-64", // Alternatives 1–4 in the evaluation table.
  "2016h28a-fe-am-33", // Consecutive pairs of candidate addresses.
  "2016h28h-fe-am-34", "2017h29a-fe-am-35", "2018h30h-fe-am-32", // Ordered addresses.
  "2017h29h-fe-am-34", "2019r01a-fe-am-15", // Address classes and numbered RAID levels.
  "2016h28h-fe-am-5", "2018h30a-fe-am-26", // Ordered rows of value pairs.
  "sample-2022-dec-b-1", "sample-2022-dec-b-2", "sample-2022-dec-b-15", "sample-2022-dec-b-18",
]);
const ascending = new Set([
  "2016h28a-fe-am-11", "2016h28a-fe-am-29", "2016h28a-fe-am-48", "2016h28a-fe-am-72",
  "2016h28h-fe-am-1", "2016h28h-fe-am-49",
  "2017h29h-fe-am-23", "2017h29h-fe-am-49",
  "2018h30a-fe-am-11", "2018h30a-fe-am-16", "2018h30a-fe-am-52", "2018h30a-fe-am-68", "2018h30a-fe-am-75",
  "2019h31h-fe-am-53", "2019r01a-fe-am-8", "2019r01a-fe-am-76",
  "sample-2022-dec-a-11", "sample-2022-dec-a-13", "sample-2022-dec-a-44",
  "sample-2022-dec-a-57", "sample-2022-dec-a-58",
  "2024-b-4", "2025-b-4",
]);
type Order = "authored" | "number" | "numeric-pair" | "service" | "section" | "pointers";

export function sourceChoiceOrder(generatorId: string): Order | undefined {
  const source = generatorId.replace(/^generator-source-/, "");
  if (authored.has(source)) return "authored";
  if (ascending.has(source)) return "number";
  if (source === "2023-a-2") return "pointers";
  if (source === "2025-b-5") return "numeric-pair";
  if (generatorId === "generator-retention") return "service";
  if (generatorId === "generator-security-log") return "section";
  if (generatorId === "generator-coin-change") return "authored";
}

function invalidChoice(): never {
  throw new DataError("SOURCE_FORMAT", "順序を保持する選択肢が原資料の形式と一致しません");
}

function numeric(text: string): number {
  const normalized = text.normalize("NFKC").replaceAll(",", "");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) invalidChoice();
  return Number(normalized);
}

function orderKey(choice: Question["choices"][number], order: Exclude<Order, "authored">): number[] {
  const [block] = choice.content.blocks;
  if (order === "numeric-pair") {
    if (block?.type !== "table" || block.rows.length !== 1 || block.rows[0].length !== 2) invalidChoice();
    return block.rows[0].map(numeric);
  }
  if (block?.type !== "paragraph") invalidChoice();
  if (order === "number") return [numeric(block.text)];
  if (order === "service") {
    const label = /^サービス([A-D])$/.exec(block.text);
    if (!label) invalidChoice();
    return ["ABCD".indexOf(label[1])];
  }
  if (order === "pointers") {
    const labels = block.text.split("，");
    if (labels.some(label => !/^[a-f]$/.test(label))) invalidChoice();
    return labels.map(label => "abcdef".indexOf(label));
  }
  if (block.text === "該当なし") return [4];
  const items = block.text.split("、").map(item => /^\(([一二三四])\)$/.exec(item));
  if (items.some(item => !item)) invalidChoice();
  return items.map(item => "一二三四".indexOf(item![1]));
}

function compareKeys(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

/** Order the choice records as a unit so the correct-answer ID follows its value. */
export function preserveChoiceOrder(question: Question, generatorId: string): Question {
  const order = sourceChoiceOrder(generatorId);
  if (order) question.choiceShuffleAllowed = false;
  if (order && order !== "authored") {
    question.choices = orderedChoices(question, order);
  }
  return question;
}

function orderedChoices(question: Question, order: Exclude<Order, "authored">): Question["choices"] {
  return question.choices
    .map(choice => ({ choice, key: orderKey(choice, order) }))
    .sort((a, b) => compareKeys(a.key, b.key))
    .map(entry => entry.choice);
}

export function validateChoiceOrder(question: Question, generatorId: string): void {
  const order = sourceChoiceOrder(generatorId);
  if (!order) return;
  if (question.choiceShuffleAllowed ||
      order !== "authored" && orderedChoices(question, order).some((choice, i) => choice !== question.choices[i])) {
    invalidChoice();
  }
}
