import type { Bundle, Question, Selection, SetRecord } from "./types";
import { refKey, refOf } from "./types";
import { DataError } from "./errors";

export function isLegacyQuestion(question: Question): boolean {
  return question.origin.sourceRefs.some(ref => !!ref.locator.timeSlot);
}

/** Old morning questions use subject A's single-answer learning pool. Old
 * afternoon questions retain their own format and must not enter subject B's
 * current 20-question pool merely because their learning subject is B. */
export function isCurrentSubjectMixQuestion(question: Question): boolean {
  if (!isLegacyQuestion(question)) return true;
  const slots = new Set(question.origin.sourceRefs.flatMap(ref => ref.locator.timeSlot ? [ref.locator.timeSlot] : []));
  return question.subject === "A" && slots.size === 1 && slots.has("午前");
}

/** A year alone cannot distinguish spring/autumn or two sample publications. */
export function sourceCollections(bundle: Bundle, subject: Selection["subject"]): SetRecord[] {
  const originals = new Map(bundle.questions
    .filter(q => q.origin.kind === "official_reprint" && q.lifecycle === "active" && q.distribution === "included")
    .map(q => [refKey(refOf(q)), q]));
  return bundle.sets.filter(set => set.subject === subject && set.distribution === "included" &&
    set.questionRefs.length > 0 && set.generationBindings.length === 0 &&
    set.questionRefs.every(ref => originals.get(refKey(ref))?.subject === subject))
    .sort((a, b) => {
      const year = (set: SetRecord) => {
        const ref = originals.get(refKey(set.questionRefs[0]))?.origin.sourceRefs[0];
        return ref?.locator.year ?? Number(bundle.sources.find(s => s.id === ref?.sourceId)?.publishedOn?.slice(0, 4) ?? 0);
      };
      return year(b) - year(a) || b.id.localeCompare(a.id);
    });
}

export function selectedSourceCollection(bundle: Bundle, selection: Selection): SetRecord | undefined {
  if (selection.kind !== "annual") return undefined;
  const id = selection.sourceCollectionId ?? `set-annual-${selection.year}-${selection.subject.toLowerCase()}`;
  const collection = sourceCollections(bundle, selection.subject).find(set => set.id === id);
  if (!collection) throw new DataError("SOURCE_COLLECTION", "選択した公開問題集を利用できません。");
  return collection;
}

export function selectedMixProfileCollection(bundle: Bundle, selection: Selection): SetRecord {
  const id = selection.mixProfileCollectionId ?? `set-annual-${selection.year}-${selection.subject.toLowerCase()}`;
  const collection = bundle.sets.find(set => set.id === id);
  const originals = new Map(bundle.questions.map(q => [refKey(refOf(q)), q]));
  if (!collection || collection.subject !== selection.subject || collection.distribution !== "included" ||
    !collection.questionRefs.length || collection.generationBindings.length ||
    new Set(collection.questionRefs.map(refKey)).size !== collection.questionRefs.length ||
    !collection.questionRefs.every(ref => {
      const q = originals.get(refKey(ref));
      return q?.subject === selection.subject && q.origin.kind === "official_reprint" &&
        q.lifecycle === "active" && q.distribution === "included";
    })) throw new DataError("MIX_PROFILE", "分野構成の基準問題集を利用できません。");
  return collection;
}

export function sourceCollectionTitle(bundle: Bundle, collection: SetRecord): string {
  const keys = new Set(collection.questionRefs.map(refKey));
  return bundle.questions.some(q => keys.has(refKey(refOf(q))) && isLegacyQuestion(q))
    ? `旧制度 · ${collection.title}` : collection.title;
}
