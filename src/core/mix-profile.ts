import type { Bundle, Selection } from "./types";
import { refKey, refOf } from "./types";
import { DataError } from "./errors";
import { isLegacyQuestion, selectedMixProfileCollection, sourceCollectionTitle } from "./source-collections";

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
  const collection = selectedMixProfileCollection(bundle, selection);
  const originals = new Map(bundle.questions.map(q => [refKey(refOf(q)), q]));
  const questions = collection.questionRefs.map(ref => originals.get(refKey(ref))!);
  const legacy = questions.some(isLegacyQuestion);
  const slots = new Set(questions.flatMap(q => q.origin.sourceRefs.flatMap(r => r.locator.timeSlot ? [r.locator.timeSlot] : [])));
  if (legacy && (slots.size !== 1 || !questions.every(isLegacyQuestion)))
    throw new DataError("MIX_PROFILE", "異なる試験区分の問題集を基準にできません。");
  const counts: Record<string, number> = {};
  for (const q of questions) counts[q.learning.area] = (counts[q.learning.area] ?? 0) + 1;
  const fullCount = legacy ? undefined : selection.subject === "A" ? 60 : 20;
  if (selection.size === "full" && fullCount === undefined)
    throw new DataError("PROFILE_SCOPE", "旧制度は問題集の問数で練習してください。");
  const quota = selection.size !== "full" ? counts : selection.subject === "B"
    ? { algorithm: 16, security: 4 } : scaleAreaCounts(counts, fullCount!);
  const practice = collection.examConfigRefs.map(ref => bundle.exams.find(e =>
    e.id === ref.id && e.revision === ref.revision && e.mode === "practice"))
    .find(e => e?.timeLimitSeconds !== undefined);
  if (legacy && !practice) throw new DataError("EXAM_REF", "旧制度の試験時間が設定されていません。");
  return { collection, questions, legacy, quota, publicCount: questions.length, fullCount,
    questionCount: Object.values(quota).reduce((sum, n) => sum + n, 0),
    timeLimitSeconds: selection.size === "full" ? (selection.subject === "A" ? 5400 : 6000)
      : practice?.timeLimitSeconds ?? questions.length * (selection.subject === "A" ? 90 : 300),
    title: `ランダムミックス・生成問題（基準：${sourceCollectionTitle(bundle, collection)}）` };
}
