import type { AnswerPart, Bundle, Entry, Question } from "../core/types";
import { labels } from "../core/types";
import { gradeAnswer, partAnswerLabels, selectedPartChoice } from "../core/answers";
import { Content } from "./Content";
import { tableChoiceName, diagramChoiceName } from "./tableChoiceName";

export const outcomeLabels = { correct: "正解", incorrect: "不正解", unanswered: "未解答", unscored: "採点対象外" } as const;
export function AnswerChoices({ question: q, entry, bundle, assetUrls, disabled, revealed, showResponse = false, onAnswer, onPartAnswer }: {
  question: Question; entry: Pick<Entry, "choiceOrder" | "selectedChoiceId" | "selectedPartChoices">;
  bundle: Bundle; assetUrls: Record<string, string>; disabled: boolean; revealed: boolean; showResponse?: boolean;
  onAnswer?: (choiceId: string | undefined) => void; onPartAnswer?: (partId: string, choiceId: string | undefined) => void;
}) {
  const grade = revealed && q.answerParts ? gradeAnswer(q, entry) : undefined;
  const field = (part?: AnswerPart) => {
    const order = part ? entry.choiceOrder.filter(id => part.choiceIds.includes(id)) : entry.choiceOrder;
    const selectedId = part ? selectedPartChoice(entry, part.id) : entry.selectedChoiceId;
    const key = part && q.correctAnswer.parts!.find(a => a.kind === "unordered" ? a.partIds.includes(part.id) : a.partId === part.id);
    const correctIds = !key ? [q.correctAnswer.choiceId] : key.kind === "choice" ? [key.choiceId] : key.kind === "unordered" ? key.choiceIds : [];
    const choose = (id: string | undefined) => part ? onPartAnswer?.(part.id, id) : onAnswer?.(id);
    return <fieldset key={part?.id ?? "single"} className="answer-choices" disabled={disabled}>
      <legend className={part ? "answer-part-title" : "sr-only"}>{part?.label ?? "解答を選択"}</legend>
      {order.map((id, index) => {
        const choice = q.choices.find(c => c.id === id)!, selected = selectedId === id, correct = revealed && correctIds.includes(id);
        const label = labels[index] ?? String(index + 1);
        const explicitName = q.origin.kind === "official_reprint" ? undefined
          : tableChoiceName(choice.content, bundle) ?? diagramChoiceName(choice.content, bundle);
        return <label key={id} className={`answer-choice ${selected ? "selected" : ""} ${correct ? "correct" : ""}`}>
          <input className="sr-only" type="radio" name={part ? `answer-${part.id}` : "answer"} value={id} checked={selected}
            aria-label={explicitName === undefined ? undefined : `${label} ${explicitName}${correct ? " 正答" : ""}`}
            onChange={() => choose(id)} onClick={() => { if (selected) choose(undefined); }}
            onKeyDown={event => { if (event.key === " ") { event.preventDefault(); if (!event.repeat) choose(selected ? undefined : id); } }} />
          <span className="choice-label">{label}</span>
          <span className="choice-body">{q.origin.kind === "official_reprint"
            ? `原文の「${choice.content.blocks[0].type === "paragraph" ? choice.content.blocks[0].text : label}」`
            : <Content content={choice.content} bundle={bundle} assetUrls={assetUrls} showAttribution={false} />}</span>
          {correct && <span className="sr-only">正答</span>}
        </label>;
      })}
      {revealed && part && <div className="answer-part-result">
        <p>正答：{partAnswerLabels(q, part, entry.choiceOrder)}</p>
        {showResponse && <p>あなたの解答：{selectedId ? labels[order.indexOf(selectedId)] ?? String(order.indexOf(selectedId) + 1) : "未解答"} · {outcomeLabels[grade!.parts!.find(p => p.partId === part.id)!.outcome]}</p>}
      </div>}
    </fieldset>;
  };
  return q.answerParts ? <div className="compound-answers">{q.answerParts.map(part => field(part))}</div> : field();
}
