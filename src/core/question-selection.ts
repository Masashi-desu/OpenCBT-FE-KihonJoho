import type { Bundle, Question, Ref, Selection, SetRecord } from "./types";
import { refKey, refOf } from "./types";
import { DataError } from "./errors";

/** This policy belongs to the complete source booklet. Local sessions retain
 * the original booklet in their snapshot and issue only the chosen majors. */
export function validateQuestionSelection(bundle: Bundle, collection: SetRecord) {
  const policy = collection.questionSelection;
  if (!policy) return;
  const fail = () => { throw new DataError("QUESTION_SELECTION", "問題集の必須・選択問題の設定が不正です。"); };
  const all = collection.questionRefs.map(refKey);
  const specified = [...policy.requiredQuestionRefs,
    ...policy.optionalGroups.flatMap(group => group.questionRefs)].map(refKey);
  if (collection.generationBindings.length || !policy.sourceRefs.length || policy.excessPolicy !== "paper_order" ||
    !policy.optionalGroups.length || !policy.requiredQuestionRefs.length ||
    new Set(policy.optionalGroups.map(group => group.id)).size !== policy.optionalGroups.length ||
    new Set(specified).size !== specified.length || new Set(all).size !== all.length || specified.length !== all.length ||
    all.some(key => !specified.includes(key)) || specified.some(key => !all.includes(key)) ||
    policy.optionalGroups.some(group => !group.id || !group.label || !Number.isSafeInteger(group.choose) ||
      group.choose < 1 || group.choose > group.questionRefs.length) ||
    policy.sourceRefs.some(ref => !bundle.sources.some(source => source.id === ref.sourceId)) ||
    collection.questionRefs.some(ref => {
      const question = bundle.questions.find(q => refKey(refOf(q)) === refKey(ref));
      const slots = new Set(question?.origin.sourceRefs.flatMap(r => r.locator.timeSlot ? [r.locator.timeSlot] : []));
      return question?.origin.kind !== "official_reprint" || slots.size !== 1 || !slots.has("午後");
    })) fail();
}

export function collectionQuestions(bundle: Bundle, collection: SetRecord): Question[] {
  const byRef = new Map(bundle.questions.map(question => [refKey(refOf(question)), question]));
  return collection.questionRefs.map(ref => {
    const question = byRef.get(refKey(ref));
    if (!question) throw new DataError("REFERENCE", "問題集の問題参照が見つかりません。");
    return question;
  });
}

/** Never silently truncate excess selections. The menu prevents them and a
 * saved run must preserve the same legal selection and paper order. */
export function selectedCollectionQuestions(bundle: Bundle, collection: SetRecord, selection: Selection) {
  const questions = collectionQuestions(bundle, collection);
  const policy = collection.questionSelection;
  validateQuestionSelection(bundle, collection);
  if (!policy || selection.mode !== "practice") {
    if (selection.selectedQuestionRefs !== undefined)
      throw new DataError("QUESTION_SELECTION", "選択問題の指定は旧午後の時間付き練習で使います。");
    return questions;
  }
  if ((selection.kind === "annual" ? selection.sourceCollectionId : selection.mixProfileCollectionId) !== collection.id)
    throw new DataError("QUESTION_SELECTION", "選択問題のある問題集を明示して選んでください。");
  const refs = selection.selectedQuestionRefs ?? [];
  if (!Array.isArray(refs) || refs.some(ref => !ref || typeof ref.questionId !== "string" ||
    !Number.isSafeInteger(ref.revision) || ref.revision < 1))
    throw new DataError("QUESTION_SELECTION", "選択問題の参照が不正です。");
  const selected = new Set(refs.map(refKey));
  const all = new Set(collection.questionRefs.map(refKey));
  if (selected.size !== refs.length || refs.some(ref => !all.has(refKey(ref))) ||
    policy.requiredQuestionRefs.some(ref => !selected.has(refKey(ref))) ||
    policy.optionalGroups.some(group => group.questionRefs.filter(ref => selected.has(refKey(ref))).length !== group.choose))
    throw new DataError("QUESTION_SELECTION", "必須問題と、各区分で指定された数の選択問題を選んでください。");
  return questions.filter(question => selected.has(refKey(refOf(question))));
}

export function sameQuestionRefs(left: readonly Ref[], right: readonly Ref[]) {
  return left.length === right.length && left.every((ref, index) => refKey(ref) === refKey(right[index]));
}
