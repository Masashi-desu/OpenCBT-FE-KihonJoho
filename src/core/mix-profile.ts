import type { Bundle, Selection } from "./types";
import { refKey, refOf } from "./types";
import { DataError } from "./errors";
import { isLegacyQuestion, isCurrentSubjectMixQuestion, selectedMixProfileCollection, sourceCollections, sourceCollectionTitle } from "./source-collections";
import { collectionQuestions, selectedCollectionQuestions } from "./question-selection";

const areaOrder = ["technology", "management", "strategy", "algorithm", "security"];

/** Largest remainders preserve the requested total without rounding each area
 * independently. Integer remainders also give deterministic ties. */
export function scaleAreaCounts(counts: Record<string, number>, total: number): Record<string, number> {
  const keys = areaOrder.filter(area => counts[area] > 0);
  const denominator = keys.reduce((sum, area) => sum + counts[area], 0);
  if (!Number.isSafeInteger(total) || total < 1 || !Number.isSafeInteger(denominator) || denominator < 1 ||
    Object.entries(counts).some(([area, n]) => !areaOrder.includes(area) || !Number.isSafeInteger(n) || n < 0 || !Number.isSafeInteger(n * total)))
    throw new DataError("PROFILE", "分野構成の件数が不正です。");
  const result = Object.fromEntries(keys.map(area => [area, Math.floor(counts[area] * total / denominator)]));
  let remaining = total - Object.values(result).reduce((sum, n) => sum + n, 0);
  for (const area of [...keys].sort((a, b) =>
    (counts[b] * total % denominator) - (counts[a] * total % denominator) || areaOrder.indexOf(a) - areaOrder.indexOf(b))) {
    if (remaining-- <= 0) break;
    result[area]++;
  }
  return result;
}

export function mixProfile(bundle: Bundle, selection: Selection) {
  const allYears = selection.mixScope === "all";
  // Use the newest current-format publication for the short practice length;
  // the area weights and random pool below cover all eligible publications.
  const latest = allYears ? sourceCollections(bundle, selection.subject)
    .find(set => collectionQuestions(bundle, set).every(q => !isLegacyQuestion(q))) : undefined;
  if (allYears && !latest) throw new DataError("MIX_PROFILE", "この科目の問題集を利用できません。");
  const collection = selectedMixProfileCollection(bundle, allYears
    ? { ...selection, mixProfileCollectionId: latest!.id } : selection);
  const allQuestions = collectionQuestions(bundle, collection);
  if (allYears && selection.selectedQuestionRefs !== undefined)
    throw new DataError("QUESTION_SELECTION", "全年度ミックスでは大問を選択できません。");
  const questions = allYears ? [...new Map(sourceCollections(bundle, selection.subject)
    .flatMap(set => collectionQuestions(bundle, set)).filter(isCurrentSubjectMixQuestion)
    .map(q => [refKey(refOf(q)), q])).values()] : selectedCollectionQuestions(bundle, collection, selection);
  const legacy = !allYears && questions.some(isLegacyQuestion);
  const slots = new Set(questions.flatMap(q => q.origin.sourceRefs.flatMap(r => r.locator.timeSlot ? [r.locator.timeSlot] : [])));
  if (legacy && (slots.size !== 1 || !questions.every(isLegacyQuestion)))
    throw new DataError("MIX_PROFILE", "異なる試験区分の問題集を基準にできません。");
  const counts: Record<string, number> = {};
  for (const q of questions) counts[q.learning.area] = (counts[q.learning.area] ?? 0) + 1;
  const fullCount = legacy || (selection.mixScope === "collection" && selection.subject === "B" &&
    (!counts.algorithm || !counts.security)) ? undefined : selection.subject === "A" ? 60 : 20;
  if (selection.size === "full" && fullCount === undefined)
    throw new DataError("PROFILE_SCOPE", legacy ? "旧制度は問題集の問数で練習してください。"
      : "この問題集は本番の分野構成を満たさないため、問題集の問数で練習してください。");
  const quota = selection.size !== "full" ? allYears ? scaleAreaCounts(counts, allQuestions.length) : counts
    : selection.subject === "B"
      ? { algorithm: 16, security: 4 } : scaleAreaCounts(counts, fullCount!);
  const practice = collection.examConfigRefs.map(ref => bundle.exams.find(e =>
    e.id === ref.id && e.revision === ref.revision && e.mode === "practice"))
    .find(e => e?.timeLimitSeconds !== undefined);
  if (legacy && !practice) throw new DataError("EXAM_REF", "旧制度の試験時間が設定されていません。");
  return { collection, questions, legacy, quota, publicCount: allQuestions.length, fullCount,
    questionCount: Object.values(quota).reduce((sum, n) => sum + n, 0),
    timeLimitSeconds: selection.size === "full" ? (selection.subject === "A" ? 5400 : 6000)
      : practice?.timeLimitSeconds ?? (allYears ? allQuestions.length : questions.length) * (selection.subject === "A" ? 90 : 300),
    title: allYears ? "ランダムミックス・生成問題（すべての年度）"
      : `ランダムミックス・生成問題（基準：${sourceCollectionTitle(bundle, collection)}）` };
}
