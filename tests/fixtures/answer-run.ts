import assert from "node:assert/strict";
import type { Run } from "../../src/core/types";
import { updateAnswer, updatePartAnswer } from "../../src/core/session";

// Session/API regression helper only. Content correctness is tested separately
// against independently reviewed source keys and per-major semantic oracles.
export function answerRun(run: Run, correct: boolean, at?: number): Run {
  const question = run.issued[run.session.currentIndex];
  if (!question.answerParts) return updateAnswer(run, correct ? question.correctAnswer.choiceId :
    question.choices.find(choice => choice.id !== question.correctAnswer.choiceId)!.id, at);
  let changed = false;
  for (const answer of question.correctAnswer.parts!) {
    if (answer.kind === "no_correct_answer") continue;
    const values = answer.kind === "choice" ? [[answer.partId, answer.choiceId]] : answer.partIds.map((id, i) => [id, answer.choiceIds[i]]);
    for (const [partId, choiceId] of values) {
      let chosen = choiceId;
      if (!correct && !changed) {
        const part = question.answerParts.find(part => part.id === partId)!;
        chosen = part.choiceIds.find(id => answer.kind === "choice" ? id !== choiceId : !answer.choiceIds.includes(id))!;
        assert(chosen, "A requested incorrect scored answer needs a real distractor"); changed = true;
      }
      run = updatePartAnswer(run, partId, chosen, at);
    }
  }
  if (!correct) assert(changed, "An unscored-only question cannot be answered incorrectly");
  return run;
}
