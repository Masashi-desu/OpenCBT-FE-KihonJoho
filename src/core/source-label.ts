import type { Question, SourceRef } from "./types";

export function questionSubjectLabel(question: Question): string {
  const slot = question.origin.sourceRefs.find(ref => ref.locator.timeSlot)?.locator.timeSlot;
  return slot ? `旧制度・${slot}` : `科目${question.subject}`;
}

/** The source's period and time slot identify legacy questions, independently
 * of the current learning subject used to select practice questions. */
export function sourceLocationLabel(ref: SourceRef, includeExam = false): string {
  const l = ref.locator;
  return [
    l.year === undefined ? undefined : `${l.year}年度`,
    l.period,
    includeExam ? l.exam : undefined,
    l.subject,
    // Preparatory sources use both "午前" and "旧制度・午前" as the
    // source subject. Keep that source wording without repeating its time slot.
    l.timeSlot && l.subject !== l.timeSlot && l.subject !== `旧制度・${l.timeSlot}` ? l.timeSlot : undefined,
    l.questionNumber && `問${l.questionNumber}`,
  ].filter(Boolean).join(" ");
}

export function sourceQuestionLabel(question: Question): string {
  const ref = question.origin.sourceRefs.find(r => r.locator.questionNumber);
  if (!ref) return `科目${question.subject} · ${question.learning.topics?.[0] ?? "独自問題"}`;
  // A missing source subject is not evidence for renaming an old time slot.
  if (ref.locator.subject || ref.locator.timeSlot) return sourceLocationLabel(ref);
  return sourceLocationLabel({ ...ref, locator: { ...ref.locator, subject: `科目${question.subject}` } });
}
