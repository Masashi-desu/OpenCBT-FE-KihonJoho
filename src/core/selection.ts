import {
  type Bundle,
  type Selection,
  type Question,
  type Exam,
  type SetRecord,
  type Run,
  type Ref,
  refOf,
  refKey,
} from "./types";
import { shuffle, newId } from "./hash";
import { DataError } from "./validation";
import {
  bookmarkTemplate,
  bookmarkTemplates,
  makeBookmark,
} from "./bookmarks";
export function familyOf(
  q: Question,
  b: Bundle,
  seen = new Set<string>(),
): string[] {
  const key = refKey(refOf(q));
  if (seen.has(key)) throw new DataError("DERIVATION_CYCLE", key);
  return [
    key,
    ...q.learning.tags.filter((t) => t.startsWith("family-")),
    ...q.origin.derivedFrom.flatMap((r) => {
      const parent = b.questions.find((p) => refKey(refOf(p)) === refKey(r));
      if (!parent) throw new DataError("REFERENCE", refKey(r));
      return familyOf(parent, b, new Set([...seen, key]));
    }),
  ];
}
export function quotasFor(b: Bundle, s: Selection): Record<string, number> {
  if (s.subject === "B")
    return s.size === "full"
      ? { algorithm: 16, security: 4 }
      : { algorithm: 5, security: 1 };
  const ref = b.questions.filter(
    (q) => q.subject === "A" && q.learning.tags.includes(`annual-${s.year}`),
  );
  if (ref.length !== 20)
    throw new DataError("PROFILE", "基準年度の公開問題が不足しています");
  const factor = s.size === "full" ? 3 : 1;
  return Object.fromEntries(
    ["technology", "management", "strategy"].map((a) => [
      a,
      ref.filter((q) => q.learning.area === a).length * factor,
    ]),
  );
}
export function nextQuestionRef(
  run: Run,
  order: <T>(a: T[]) => T[] = shuffle,
): Ref {
  if (run.selection.mode !== "endless")
    return run.session.entries[run.session.currentIndex].questionRef;
  const candidates = [...run.set.questionRefs];
  if (!candidates.length)
    throw new DataError("SHORTAGE", "次に出題する問題がありません");
  return order(candidates)[0];
}

// Build an immutable random pool independently of the menu or bookmark list.
export function selectEndlessQuestions(
  b: Bundle,
  questionRefs: readonly Ref[],
  title: string,
  order: <T>(a: T[]) => T[] = shuffle,
): ReturnType<typeof selectQuestions> {
  const refs = [...new Map(questionRefs.map((ref) => [refKey(ref), ref])).values()];
  if (!refs.length)
    throw new DataError("SHORTAGE", "周回する問題がありません");
  const candidates = refs.map((ref) => {
    const base = b.questions.find((q) => refKey(refOf(q)) === refKey(ref)),
      templates = b.templates.filter((t) =>
        refKey(t.baseQuestionRef) === refKey(ref) &&
        t.lifecycle === "active" && t.distribution === "included",
      );
    if (!base || base.lifecycle !== "active" || base.distribution !== "included" ||
      b.catalog.withdrawals.some((w) => refKey(w.questionRef) === refKey(ref)) ||
      templates.length !== 1)
      throw new DataError("BINDING_REF", "周回する問題の生成定義を利用できません");
    return { base, template: templates[0] };
  });
  const subject = candidates.every(({ base }) => base.subject === candidates[0].base.subject)
    ? candidates[0].base.subject
    : "mixed";
  const exam: Exam = {
    schemaVersion: "3.0.0",
    id: newId("exam-selected"),
    revision: 1,
    title,
    subject,
    mode: "study",
    questionOrder: "shuffle",
    choiceOrder: "shuffle",
    duplicatePolicy: "random_reuse",
    shortagePolicy: "block",
  };
  const set: SetRecord = {
    schemaVersion: "3.0.0",
    id: newId("set-selected"),
    revision: 1,
    title,
    subject,
    distribution: "included",
    questionRefs: candidates.map(({ base }) => refOf(base)),
    examConfigRefs: [{ id: exam.id, revision: exam.revision }],
    generationBindings: candidates.map(({ base, template }) => ({
      questionRef: refOf(base),
      templateRef: { id: template.id, revision: template.revision },
    })),
  };
  return { questions: order(candidates.map(({ base }) => base)).slice(0, 1), exam, set, quota: {} };
}

export function selectQuestions(
  b: Bundle,
  s: Selection,
  order: <T>(a: T[]) => T[] = shuffle,
): {
  questions: Question[];
  exam: Exam;
  set: SetRecord;
  quota: Record<string, number>;
} {
  if (s.mode === "endless") {
    if (s.kind !== "mix" && s.kind !== "bookmark")
      throw new DataError("SELECTION", "無限周回は生成問題を使います");
    if (s.kind === "bookmark" && !s.questionRefs?.length)
      throw new DataError("BOOKMARK_REF", "練習するブックマークを選んでください。");
    const refs = s.kind === "bookmark"
      ? bookmarkTemplates(b, s.questionRefs!).map(({ base }) => refOf(base))
      : s.questionRefs ?? b.templates.filter((t) =>
        t.lifecycle === "active" && t.distribution === "included" &&
        b.questions.some((q) => q.subject === s.subject && refKey(refOf(q)) === refKey(t.baseQuestionRef)),
      ).map((t) => t.baseQuestionRef);
    const prepared = selectEndlessQuestions(b, refs,
      s.kind === "bookmark" ? "ブックマーク全件・無限周回" : "無限周回・生成問題", order);
    if (s.subject !== prepared.exam.subject)
      throw new DataError("SELECTION", "周回する問題群の科目が一致しません。");
    return prepared;
  }
  if (s.subject === "mixed" || s.questionRefs !== undefined)
    throw new DataError("SELECTION", "問題群の指定は無限周回で使います");
  if (s.kind !== "bookmark" &&
    (!s.year || !s.size))
    throw new DataError("SELECTION", "年度と出題数を選んでください");
  if (s.kind === "bookmark") {
    if (!s.bookmarkQuestionRef || s.mode !== "study")
      throw new DataError(
        "BOOKMARK_REF",
        "ブックマークの問題を選んでください。",
      );
    const { template, base } = bookmarkTemplate(b, s.bookmarkQuestionRef);
    if (s.subject !== base.subject)
      throw new DataError("BOOKMARK_REF", "選択した問題の科目が一致しません。");
    const title = `ブックマーク練習 · ${makeBookmark(b, s.bookmarkQuestionRef).title}`;
    const exam: Exam = {
      schemaVersion: "3.0.0",
      id: newId("exam-bookmark"),
      revision: 1,
      title,
      subject: base.subject,
      mode: "study",
      questionOrder: "set",
      choiceOrder: "shuffle",
      duplicatePolicy: "random_reuse",
      shortagePolicy: "block",
    };
    const set: SetRecord = {
      schemaVersion: "3.0.0",
      id: newId("set-bookmark"),
      revision: 1,
      title,
      subject: base.subject,
      distribution: "included",
      questionRefs: [refOf(base)],
      examConfigRefs: [{ id: exam.id, revision: exam.revision }],
      generationBindings: [
        {
          questionRef: refOf(base),
          templateRef: { id: template.id, revision: template.revision },
        },
      ],
    };
    return {
      questions: [base],
      exam,
      set,
      quota: {},
    };
  }
  let candidates: Question[],
    quota: Record<string, number> = {},
    title: string,
    id: string;
  if (s.kind === "annual") {
    candidates = b.questions
      .filter(
        (q) =>
          q.subject === s.subject &&
          q.origin.kind === "official_reprint" &&
          q.learning.tags.includes(`annual-${s.year}`),
      )
      .sort(
        (a, c) =>
          Number(a.origin.sourceRefs[0]?.locator.questionNumber) -
          Number(c.origin.sourceRefs[0]?.locator.questionNumber),
      );
    title = `${s.year}年度 公開問題`;
    id = `annual-${s.year}-${s.subject.toLowerCase()}`;
  } else {
    candidates = b.questions.filter(
      (q) =>
        q.subject === s.subject &&
        b.templates.some(
          (t) =>
            refKey(t.baseQuestionRef) === refKey(refOf(q)) &&
            t.lifecycle === "active" &&
            t.distribution === "included",
        ),
    );
    quota = quotasFor(b, s);
    title = `ランダムミックス・生成問題（${s.subject === "A" ? s.year + "年度の分野構成" : "アルゴリズム・情報セキュリティ"}）`;
    id = `mix-${s.subject.toLowerCase()}`;
  }
  if (!candidates.length)
    throw new DataError("SHORTAGE", "収録問題がありません");
  let chosen: Question[] = [];
  const families = new Set<string>();
  const unique = (q: Question) => familyOf(q, b).every((k) => !families.has(k));
  const add = (q: Question) => {
    chosen.push(q);
    familyOf(q, b).forEach((k) => families.add(k));
  };
  if (s.kind === "mix") {
    for (const [area, count] of Object.entries(quota)) {
      if (count === 0) continue;
      const pool = order(candidates.filter((q) => q.learning.area === area));
      if (!pool.length)
        throw new DataError(
          "SHORTAGE",
          `${area}に値・図・正答を生成できるテンプレートがありません。生成できない固定問題で補充せず、開始を止めます。`,
        );
      for (let done = 0; done < count; ) {
        for (const q of order([...pool])) {
          chosen.push(q);
          if (++done === count) break;
        }
      }
    }
    chosen = order(chosen);
  } else {
    for (const q of candidates)
      if (unique(q)) add(q);
      else
        throw new DataError(
          "DUPLICATE_LINEAGE",
          "同系列の問題が重複しています",
        );
  }
  const storedSet = b.sets.find((x) => x.id === `set-${id}`);
  if (!storedSet) throw new DataError("REFERENCE", "問題セットがありません");
  // A start creates immutable local settings; never overwrite the distributed set's ID/revision.
  const set: SetRecord = {
    ...storedSet,
    id: newId("set-selected"),
    revision: 1,
    title,
    questionRefs: candidates.map(refOf),
  };
  const exam: Exam = {
    schemaVersion: "3.0.0",
    id: newId("exam-selected"),
    revision: 1,
    title,
    subject: s.subject,
    mode: s.mode,
    questionCount: chosen.length,
    questionOrder: s.kind === "mix" ? "shuffle" : "set",
    choiceOrder: s.kind === "mix" ? "shuffle" : "fixed",
    duplicatePolicy: s.kind === "mix" ? "instance_unique" : "lineage_unique",
    shortagePolicy: "block",
  };
  if (s.mode === "practice") {
    exam.timeLimitSeconds = chosen.length * (s.subject === "A" ? 90 : 300);
    Object.assign(exam, {
      practiceScope:
        s.kind === "mix" && s.size === "full" ? "full_exam" : "public_subset",
    });
    if (s.subject === "B" && s.kind === "mix" && s.size === "full")
      Object.assign(exam, { quotas: { algorithm: 16, security: 4 } });
  }
  set.examConfigRefs = [{ id: exam.id, revision: exam.revision }];
  return { questions: chosen, exam, set, quota };
}
