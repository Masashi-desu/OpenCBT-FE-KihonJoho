import type { Bundle, Ref, Selection, SetRecord } from "../core/types";
import { refKey } from "../core/types";
import { collectionQuestions } from "../core/question-selection";

export function QuestionSelection({ bundle, collection, selection, onChange }: {
  bundle: Bundle; collection: SetRecord; selection: Selection; onChange: (refs: Ref[]) => void;
}) {
  const policy = collection.questionSelection;
  if (!policy || selection.mode !== "practice") return null;
  const selected = selection.selectedQuestionRefs ?? policy.requiredQuestionRefs;
  const has = (ref: Ref) => selected.some(value => refKey(value) === refKey(ref));
  const questions = collectionQuestions(bundle, collection);
  const title = (ref: Ref) => {
    const question = questions.find(q => refKey({ questionId: q.id, revision: q.revision }) === refKey(ref))!;
    const number = question.origin.sourceRefs.find(source => source.locator.questionNumber)?.locator.questionNumber;
    const topic = question.learning.topics?.[0];
    return `問${number ?? questions.indexOf(question) + 1}${topic ? `（${topic}）` : ""}`;
  };
  const practice = collection.examConfigRefs.map(ref => bundle.exams.find(exam =>
    exam.id === ref.id && exam.revision === ref.revision && exam.mode === "practice"))
    .find(exam => exam?.timeLimitSeconds !== undefined);
  return <div className="question-selection">
    <h3>解答する大問を選択</h3>
    <p>全{collection.questionRefs.length}大問を収録しています。必須問題と各区分の選択問題を、冊子の順で出題します。
      {practice && `制限時間は${practice.timeLimitSeconds! / 60}分です。`}</p>
    <p>必須：{policy.requiredQuestionRefs.map(title).join("・")}</p>
    {policy.optionalGroups.map(group => {
      const count = group.questionRefs.filter(has).length;
      return <fieldset className="mode-field" key={group.id}>
        <legend>{group.label}（{group.choose}大問を選択・現在{count}大問）</legend>
        <div className="question-selection-options">
          {group.questionRefs.map(ref => <label key={refKey(ref)}>
            <input type={group.choose === 1 ? "radio" : "checkbox"} name={`selected-major-${group.id}`}
              checked={has(ref)} disabled={group.choose > 1 && !has(ref) && count >= group.choose}
              onChange={() => onChange([...policy.requiredQuestionRefs,
                ...policy.optionalGroups.flatMap(option => option.questionRefs.filter(candidate =>
                  option.id === group.id && group.choose === 1 ? refKey(candidate) === refKey(ref)
                    : refKey(candidate) === refKey(ref) ? !has(candidate) : has(candidate)))])} />
            {title(ref)}
          </label>)}
        </div>
      </fieldset>;
    })}
    <p className="subtle">選ばなかった大問は採点に含めません。全大問を解く場合は「学習・復習」を選んでください。</p>
  </div>;
}
