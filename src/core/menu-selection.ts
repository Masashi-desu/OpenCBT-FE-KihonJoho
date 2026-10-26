import type { Bundle, Selection, SetRecord, SourceRef } from "./types";
import { refKey, refOf } from "./types";
import { DataError } from "./errors";
import { sourceCollections, sourceCollectionTitle } from "./source-collections";

export type MenuSourceGroup = {
  id: string;
  title: string;
  year?: number;
  period?: string;
  timeSlot?: string;
  collections: SetRecord[];
};

/** A menu group never merges question references. Its concrete subject set ID
 * is still the only collection identity saved in a Selection or Run. */
export function menuSourceGroups(bundle: Bundle): MenuSourceGroup[] {
  const originals = new Map(bundle.questions.map(q => [refKey(refOf(q)), q]));
  const buckets = new Map<string, { set: SetRecord; locator?: SourceRef["locator"] }[]>();
  for (const set of [...sourceCollections(bundle, "A"), ...sourceCollections(bundle, "B")]) {
    const locators = set.questionRefs.map(ref => {
      const refs = originals.get(refKey(ref))!.origin.sourceRefs;
      return (refs.find(r => r.locator.questionNumber) ?? refs[0])?.locator;
    });
    const locator = locators[0];
    // Keep legacy morning/afternoon and each period/publication separate.
    // Incomplete or conflicting publication metadata must not merge sets.
    const identity = (l: typeof locator) => JSON.stringify([l?.year, l?.period, l?.exam, l?.timeSlot]);
    const key = locator && (locator.year !== undefined || locator.period) &&
      locators.every(l => identity(l) === identity(locator))
      ? identity(locator) : `set:${set.id}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push({ set, locator });
    buckets.set(key, bucket);
  }
  const result: MenuSourceGroup[] = [];
  for (const bucket of buckets.values()) {
    // Two sets for the same subject cannot be silently selected as one edition.
    const ambiguous = new Set(bucket.map(({ set }) => set.subject)).size !== bucket.length;
    for (const entries of ambiguous ? bucket.map(entry => [entry]) : [bucket]) {
      entries.sort((a, b) => a.set.subject.localeCompare(b.set.subject));
      const first = entries[0];
      result.push({ id: first.set.id, title: sourceCollectionTitle(bundle, first.set),
        year: first.locator?.year, period: first.locator?.period, timeSlot: first.locator?.timeSlot,
        collections: entries.map(entry => entry.set) });
    }
  }
  const order = (group: MenuSourceGroup) => {
    const q = originals.get(refKey(group.collections[0].questionRefs[0]))!;
    const l = (q.origin.sourceRefs.find(r => r.locator.questionNumber) ?? q.origin.sourceRefs[0])?.locator;
    const publication = l?.period?.match(/^(\d{4})年(\d{1,2})月/);
    const year = group.year ?? Number(publication?.[1] ?? 0);
    const period = publication ? Number(publication[2]) : l?.period === "秋期" ? 10 : l?.period === "特別試験" ? 6 : l?.period === "春期" ? 4 : 0;
    return year * 100 + period;
  };
  return result.sort((a, b) => order(b) - order(a) || a.title.localeCompare(b.title, "ja") || a.id.localeCompare(b.id));
}

export function menuSourceGroup(groups: readonly MenuSourceGroup[], selection: Selection) {
  const id = (selection.kind === "mix" ? selection.mixProfileCollectionId : selection.sourceCollectionId) ??
    `set-annual-${selection.year}-${selection.subject.toLowerCase()}`;
  return groups.find(group => group.collections.some(set => set.id === id));
}

export function chooseMenuSourceGroup(
  groups: readonly MenuSourceGroup[], selection: Selection, groupId: string,
  requestedSubject?: Selection["subject"],
): Selection {
  const group = groups.find(g => g.id === groupId);
  if (!group) throw new DataError("SOURCE_COLLECTION", "選択した公開問題集を利用できません。");
  const collection = group.collections.find(c => c.subject === (requestedSubject ?? selection.subject)) ??
    (requestedSubject === undefined ? group.collections[0] : undefined);
  if (!collection) throw new DataError("SOURCE_COLLECTION", "この問題集に選択した科目は含まれていません。");
  const kind = selection.kind === "mix" ? "mix" : "annual";
  const next: Selection = { ...selection, kind, subject: collection.subject,
    size: kind === "annual" || group.timeSlot ? "public" : selection.size ?? "public",
    bindingMode: kind === "annual" ? "original_data" : "generated_values" };
  delete next.selectedQuestionRefs;
  delete next.sourceCollectionId;
  delete next.mixProfileCollectionId;
  if (kind === "annual") next.sourceCollectionId = collection.id;
  else next.mixProfileCollectionId = collection.id;
  if (group.year === undefined) delete next.year;
  else next.year = group.year;
  return next;
}

export function menuSubjectOptions(group?: MenuSourceGroup, constrained = true) {
  if (constrained && group?.timeSlot) return group.collections.map(collection => ({
    subject: collection.subject as "A" | "B", badge: group.timeSlot!,
    title: `旧制度・${group.timeSlot}`, description: "当時の試験区分・問題形式で出題します", available: true,
  }));
  return (["A", "B"] as const).map(subject => {
    const available = !constrained || !!group?.collections.some(c => c.subject === subject);
    return { subject, badge: subject, title: `科目${subject}`, available,
      description: !available ? group ? "この問題集には含まれません" : "問題集を選択してください" : subject === "A"
        ? "知識・基礎理論・マネジメント" : "アルゴリズム・情報セキュリティ" };
  });
}

export function menuSubjectNotice(group?: MenuSourceGroup, finite = true) {
  // These publication dates precede the new exam. They are not old morning/
  // afternoon exams; use the primary source's period, not the displayed year.
  if (finite && !group?.timeSlot && /^2022年(?:4|12)月公表 サンプル問題$/.test(group?.period ?? "")) {
    return "2023年度からの試験形式に向けて公表されたサンプルです。";
  }
  return undefined;
}

/** Menu-only transitions; saved runs and their exact collection IDs are never
 * migrated here. Finite selection memory is owned by the calling component. */
export function patchMenuSelection(
  bundle: Bundle | undefined, old: Selection, value: Partial<Selection>, finite: Selection,
): { selection: Selection; finite: Selection } {
  if (value.mode === "endless") {
    const next: Selection = { ...old, ...value, kind: "mix", bindingMode: "generated_values" };
    delete next.sourceCollectionId;
    delete next.mixProfileCollectionId;
    delete next.selectedQuestionRefs;
    return { selection: next, finite: old.mode === "endless" ? finite : old };
  }
  const restoring = old.mode === "endless" && value.mode !== undefined;
  const restored = restoring ? { ...finite, subject: old.subject } : old;
  let next: Selection = { ...restored, ...value };
  if (value.mode !== undefined && value.mode !== restored.mode) delete next.selectedQuestionRefs;
  if (next.kind === "mix") { delete next.sourceCollectionId; next.bindingMode = "generated_values"; }
  else delete next.mixProfileCollectionId;
  if (bundle && next.kind !== "bookmark" &&
    ((value.subject !== undefined && value.subject !== restored.subject) ||
      (value.kind !== undefined && value.kind !== restored.kind) ||
      (value.year !== undefined && value.year !== restored.year) || restoring)) {
    const groups = menuSourceGroups(bundle);
    // An explicit missing set remains an error instead of becoming another book.
    const group = value.year !== undefined && value.year !== restored.year
      ? menuSourceGroup(groups, { ...next, sourceCollectionId: undefined, mixProfileCollectionId: undefined })
      : menuSourceGroup(groups, restored);
    if (group) next = chooseMenuSourceGroup(groups, next, group.id, value.subject);
  }
  return { selection: next, finite };
}
