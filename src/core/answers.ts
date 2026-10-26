import type { AnswerOutcome, AnswerPart, Entry, Question } from "./types";
import { labels } from "./types";
import { DataError } from "./errors";

function fail(message: string): never { throw new DataError("ANSWER_PARTS", message); }
export function selectedPartChoice(entry: Pick<Entry, "selectedPartChoices">, partId: string): string | undefined {
  return entry.selectedPartChoices && Object.hasOwn(entry.selectedPartChoices, partId) ? entry.selectedPartChoices[partId] : undefined;
}
export function validateAnswerDefinition(q: Question) {
  const ids = new Set(q.choices.map(c => c.id));
  if (!q.answerParts) {
    if (q.correctAnswer.parts) fail("単一選択に複数解答の正答は使えません");
    if (!q.correctAnswer.choiceId || !ids.has(q.correctAnswer.choiceId)) throw new DataError("ANSWER_REF", q.id);
    return;
  }
  if (q.correctAnswer.choiceId !== undefined || !q.correctAnswer.parts?.length || !q.answerParts.length) fail("複数解答の定義が不正です");
  const parts = new Map(q.answerParts.map(p => [p.id, p]));
  if (parts.size !== q.answerParts.length) fail("解答欄IDが重複しています");
  const usedChoices = new Set<string>(), covered = new Set<string>();
  for (const part of q.answerParts) {
    if (!part.choiceIds.length || new Set(part.choiceIds).size !== part.choiceIds.length || part.choiceIds.some(id => !ids.has(id)))
      fail("解答欄の選択肢参照が不正です");
    part.choiceIds.forEach(id => usedChoices.add(id));
  }
  for (const answer of q.correctAnswer.parts) {
    const answerIds = answer.kind === "unordered" ? answer.partIds : [answer.partId];
    if (answer.kind === "unordered" && (answer.partIds.length < 2 || answer.partIds.length !== answer.choiceIds.length))
      fail("順不同の解答欄数と正答数が一致しません");
    for (const id of answerIds) {
      const part = parts.get(id);
      if (!part || covered.has(id)) fail("正答の解答欄参照が不正又は重複しています");
      covered.add(id);
      if (answer.kind === "choice" && !part.choiceIds.includes(answer.choiceId)) fail("解答欄の正答が選択肢にありません");
      if (answer.kind === "unordered") {
        if (answer.choiceIds.some(choice => !part.choiceIds.includes(choice))) fail("順不同の正答が選択肢にありません");
        const first = parts.get(answer.partIds[0])!;
        if (part.choiceIds.length !== first.choiceIds.length || part.choiceIds.some(choice => !first.choiceIds.includes(choice)))
          fail("順不同の解答欄は同じ解答群を参照してください");
      }
      if (answer.kind === "no_correct_answer" && !answer.reason.trim()) fail("正解なしの公式根拠がありません");
    }
  }
  if (covered.size !== parts.size || usedChoices.size !== ids.size) fail("解答欄又は選択肢に未対応部分があります");
}
export function validateEntryAnswers(q: Question, entry: Pick<Entry, "selectedChoiceId" | "selectedPartChoices">) {
  if (entry.selectedPartChoices !== undefined && (!entry.selectedPartChoices || typeof entry.selectedPartChoices !== "object" || Array.isArray(entry.selectedPartChoices)))
    throw new DataError("ANSWER_REF", "解答欄の保存形式が不正です");
  if (!q.answerParts) {
    if (entry.selectedPartChoices !== undefined || entry.selectedChoiceId !== undefined && !q.choices.some(c => c.id === entry.selectedChoiceId))
      throw new DataError("ANSWER_REF", "保存した単一選択の解答が不正です");
  } else {
    if (entry.selectedChoiceId !== undefined) throw new DataError("ANSWER_REF", "複数解答を単一選択へ変換できません");
    for (const [partId, choiceId] of Object.entries(entry.selectedPartChoices ?? {})) {
      const part = q.answerParts.find(p => p.id === partId);
      if (!part || !part.choiceIds.includes(choiceId)) throw new DataError("ANSWER_REF", "解答欄の選択肢が不正です");
    }
  }
}
export function gradeAnswer(q: Question, entry: Pick<Entry, "selectedChoiceId" | "selectedPartChoices">) {
  validateEntryAnswers(q, entry);
  if (!q.answerParts) return {
    outcome: (!entry.selectedChoiceId ? "unanswered" : entry.selectedChoiceId === q.correctAnswer.choiceId ? "correct" : "incorrect") as AnswerOutcome,
  };
  const outcomes = new Map<string, AnswerOutcome>();
  for (const answer of q.correctAnswer.parts!) {
    if (answer.kind === "no_correct_answer") outcomes.set(answer.partId, "unscored");
    else if (answer.kind === "choice") {
      const selected = selectedPartChoice(entry, answer.partId);
      outcomes.set(answer.partId, !selected ? "unanswered" : selected === answer.choiceId ? "correct" : "incorrect");
    } else {
      // Multiset comparison: repeated correct values need the same multiplicity.
      // A missing slot stays unanswered; each selected value consumes one match.
      const remaining = [...answer.choiceIds];
      for (const partId of answer.partIds) {
        const selected = selectedPartChoice(entry, partId), index = selected ? remaining.indexOf(selected) : -1;
        outcomes.set(partId, !selected ? "unanswered" : index < 0 ? "incorrect" : "correct");
        if (index >= 0) remaining.splice(index, 1);
      }
    }
  }
  const parts = q.answerParts.map(part => ({ partId: part.id, outcome: outcomes.get(part.id)! }));
  const scored = parts.filter(p => p.outcome !== "unscored");
  const outcome: AnswerOutcome = !scored.length ? "unscored" : scored.some(p => p.outcome === "unanswered") ? "unanswered"
    : scored.some(p => p.outcome === "incorrect") ? "incorrect" : "correct";
  return { outcome, parts };
}
export function hasCompleteAnswer(q: Question, entry: Pick<Entry, "selectedChoiceId" | "selectedPartChoices">) {
  return gradeAnswer(q, entry).outcome !== "unanswered";
}
export function partAnswerLabels(q: Question, part: AnswerPart, order: readonly string[]) {
  const answer = q.correctAnswer.parts!.find(a => a.kind === "unordered" ? a.partIds.includes(part.id) : a.partId === part.id)!;
  if (answer.kind === "no_correct_answer") return `正解なし（採点対象外）：${answer.reason}`;
  const choices = order.filter(id => part.choiceIds.includes(id));
  const ids = answer.kind === "unordered" ? answer.choiceIds : [answer.choiceId];
  return ids.map(id => labels[choices.indexOf(id)] ?? String(choices.indexOf(id) + 1)).join("・") + (answer.kind === "unordered" ? "（順不同）" : "");
}
export function answerLabels(q: Question, order = q.choices.map(c => c.id)): string {
  if (q.answerParts) return q.answerParts.map(p => `${p.label}：${partAnswerLabels(q, p, order)}`).join("、");
  const index = order.indexOf(q.correctAnswer.choiceId!);
  return labels[index] ?? String(index + 1);
}
export function compoundAnswerSignature(q: Question): string {
  const text = (id: string) => JSON.stringify(q.choices.find(c => c.id === id)!.content.blocks);
  return JSON.stringify(q.correctAnswer.parts!.map(a => a.kind === "choice" ? [a.partId, text(a.choiceId)]
    : a.kind === "unordered" ? [a.partIds, a.choiceIds.map(text).sort()] : [a.partId, "no_correct_answer"]));
}
