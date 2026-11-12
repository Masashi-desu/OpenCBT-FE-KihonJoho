import type { AnswerPart, Bundle, Entry, Question } from "../core/types";
import { labels } from "../core/types";
import { displayedAnswerParts, gradeAnswer, partAnswerLabels, selectedPartChoice } from "../core/answers";
import { Content } from "./Content";
import { tableChoiceName, diagramChoiceName } from "./tableChoiceName";
import { legacyAfternoonSourceChoices } from "../core/generators/legacy-afternoon-definitions";
import { isLegacy2017Pm4OriginalTable } from "./Legacy2017Pm4Text";
import { Legacy2016SpringFundamentalsAnswerChoices, isSpring2016DivisionQuestion } from './Legacy2016SpringFundamentalsAnswerChoices';
import { Legacy2018AmChoiceMatrix } from './Legacy2018AmChoiceMatrix';

export const outcomeLabels = { correct: "正解", incorrect: "不正解", unanswered: "未解答", unscored: "採点対象外" } as const;
export function AnswerChoices({ question: q, entry, bundle, assetUrls, disabled, revealed, showResponse = false, onAnswer, onPartAnswer }: {
  question: Question; entry: Pick<Entry, "choiceOrder" | "selectedChoiceId" | "selectedPartChoices">;
  bundle: Bundle; assetUrls: Record<string, string>; disabled: boolean; revealed: boolean; showResponse?: boolean;
  onAnswer?: (choiceId: string | undefined) => void; onPartAnswer?: (partId: string, choiceId: string | undefined) => void;
}) {
  if (q.origin.kind!=='official_reprint' && q.origin.sourceRefs.some(r=>
    (r.sourceId==='source-ipa-2016h28h-fe-am-qs' && r.locator.questionNumber==='35') ||
    (r.sourceId==='source-ipa-2016h28a-fe-am-qs' && r.locator.year===2016 && r.locator.period==='秋期' &&
      r.locator.timeSlot==='午前' && r.locator.questionNumber==='18') ||
    (r.sourceId==='source-ipa-2009h21a-fe-am-qs' && r.locator.year===2009 && r.locator.period==='秋期' &&
      r.locator.timeSlot==='午前' && ['25', '36'].includes(r.locator.questionNumber ?? '')) ||
    (r.sourceId==='source-ipa-2009h21h-fe-am-qs' && r.locator.year===2009 && r.locator.period==='春期' &&
      r.locator.timeSlot==='午前' && ['22', '25', '39', '40', '51'].includes(r.locator.questionNumber ?? '')) ||
    (r.sourceId==='source-ipa-2008h20a-fe-am-qs' && r.locator.year===2008 && r.locator.period==='秋期' &&
      r.locator.timeSlot==='午前' && ['1', '19', '34'].includes(r.locator.questionNumber ?? ''))))
    return <Legacy2018AmChoiceMatrix question={q} entry={entry} bundle={bundle} assetUrls={assetUrls} disabled={disabled}
      revealed={revealed} showResponse={showResponse} onAnswer={onAnswer} onPartAnswer={onPartAnswer}/>;
  if (isSpring2016DivisionQuestion(q)) return <Legacy2016SpringFundamentalsAnswerChoices
    question={q} entry={entry} bundle={bundle} assetUrls={assetUrls} disabled={disabled}
    revealed={revealed} showResponse={showResponse} onAnswer={onAnswer} onPartAnswer={onPartAnswer}/>;
  const grade = revealed && q.answerParts ? gradeAnswer(q, entry) : undefined;
  const field = (part?: AnswerPart) => {
    const order = part ? entry.choiceOrder.filter(id => part.choiceIds.includes(id)) : entry.choiceOrder;
    const key = part && q.correctAnswer.parts!.find(a => a.kind === "unordered" ? a.partIds.includes(part.id) : a.partId === part.id);
    const checklist = key && key.kind === "unordered" && key.presentation === "checklist" ? key : undefined;
    const selectedIds = checklist ? checklist.partIds.map(id => selectedPartChoice(entry, id)).filter(id => id !== undefined)
      : [part ? selectedPartChoice(entry, part.id) : entry.selectedChoiceId].filter(id => id !== undefined);
    const correctIds = !key ? [q.correctAnswer.choiceId] : key.kind === "choice" && key.officialCreditReason === undefined
      ? [key.choiceId] : key.kind === "unordered" ? key.choiceIds : [];
    const choose = (id: string | undefined) => part ? onPartAnswer?.(part.id, id) : onAnswer?.(id);
    const toggleChecklist = (id: string, partIds: readonly string[]) => {
      const selectedSlot = partIds.find(slot => selectedPartChoice(entry, slot) === id);
      const slot = selectedSlot ?? partIds.find(slot => selectedPartChoice(entry, slot) === undefined);
      if (slot) onPartAnswer?.(slot, selectedSlot ? undefined : id);
    };
    const labelFor = (index: number) => labels[index] ?? String(index + 1);
    return <fieldset key={part?.id ?? "single"} className="answer-choices" disabled={disabled}>
      <legend className={part ? "answer-part-title" : "sr-only"}>
        {part?.label ?? "解答を選択"}{checklist && `（${checklist.partIds.length}つ選択）`}
      </legend>
      {checklist && <p className="answer-part-result" aria-live="polite">{selectedIds.length}／{checklist.partIds.length}選択済み</p>}
      {order.map((id, index) => {
        const choice = q.choices.find(c => c.id === id)!, selected = selectedIds.includes(id), correct = revealed && correctIds.includes(id);
        const label = labelFor(index);
        const explicitName = q.origin.kind === "official_reprint" && !isLegacy2017Pm4OriginalTable(q, id) ? undefined
          : tableChoiceName(choice.content, bundle) ?? diagramChoiceName(choice.content, bundle);
        return <label key={id} className={`answer-choice ${selected ? "selected" : ""} ${correct ? "correct" : ""}`}>
          <input className="sr-only" type={checklist ? "checkbox" : "radio"} name={part ? `answer-${part.id}` : "answer"} value={id} checked={selected}
            aria-label={explicitName === undefined ? undefined : `${label} ${explicitName}${correct ? " 正答" : ""}`}
            disabled={checklist && !selected && selectedIds.length === checklist.partIds.length}
            onChange={() => checklist ? toggleChecklist(id, checklist.partIds) : choose(id)}
            onClick={checklist ? undefined : () => { if (selected) choose(undefined); }}
            onKeyDown={checklist ? undefined : event => { if (event.key === " ") { event.preventDefault(); if (!event.repeat) choose(selected ? undefined : id); } }} />
          <span className="choice-label">{label}</span>
          <span className="choice-body">{legacyAfternoonSourceChoices(q) ? `本文の「${label}」`
            : q.origin.kind === "official_reprint" && !isLegacy2017Pm4OriginalTable(q, id)
            ? `原文の「${choice.content.blocks[0].type === "paragraph" ? choice.content.blocks[0].text : label}」`
            : <Content content={choice.content} bundle={bundle} assetUrls={assetUrls} showAttribution={false} answerChoice />}</span>
          {correct && <span className="sr-only">正答</span>}
        </label>;
      })}
      {revealed && part && <div className="answer-part-result">
        <p>正答：{partAnswerLabels(q, part, entry.choiceOrder)}</p>
        {showResponse && <p>あなたの解答：{selectedIds.length ? order.filter(id => selectedIds.includes(id)).map(id => labelFor(order.indexOf(id))).join("・") : "未解答"} · {outcomeLabels[grade!.parts!.find(p => p.partId === part.id)!.outcome]}</p>}
      </div>}
    </fieldset>;
  };
  return q.answerParts ? <div className="compound-answers">{displayedAnswerParts(q).map(part => field(part))}</div> : field();
}
