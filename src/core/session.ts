import type { Bundle, Run, Selection, Instance, Result, Question, Ref } from "./types";
import { refOf, refKey } from "./types";
import { newId, randomSeed, contentHash, shuffle } from "./hash";
import { schema, DataError } from "./validation";
import {
  bindQuestion,
  parametersForSeed,
  answerSignature,
  answerCanVary,
  checkParameters,
} from "./generation";
import { selectQuestions, familyOf, nextQuestionRef } from "./selection";
import { validateSourceFormat } from "./generation-formats";
import { bookmarkTemplates } from "./bookmarks";
export const RETENTION_MS = 180 * 24 * 60 * 60 * 1000;
export const expires = (at: number) =>
  new Date(at + RETENTION_MS).toISOString();
async function prepareQuestions(
  bundle: Bundle,
  set: Run["set"],
  exam: Run["exam"],
  bindingMode: Run["session"]["bindingMode"],
  questions: Question[],
  id: string,
  now: string,
  offset: number,
  recentInstances: Instance[],
) {
  const issued = structuredClone(questions),
    instances: Instance[] = [];
  const lastAnswer = new Map<string, string>();
  const latestSessions = new Map<string, string>(),
    usedParameters = new Set<string>();
  const history = [...recentInstances].sort(
    (a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.entryIndex - a.entryIndex,
  );
  // A resumed endless run must avoid its own preceding condition and answer.
  const latestByTemplate = new Map<string, Instance>();
  const reusable = exam.duplicatePolicy === "cycle_unique" || exam.duplicatePolicy === "random_reuse";
  if (reusable)
    for (const previous of history) {
      const key = `${previous.templateRef.id}@${previous.templateRef.revision}`,
        remembered = latestByTemplate.get(key);
      if (!remembered ||
        (previous.sessionId === id && remembered.sessionId !== id))
        latestByTemplate.set(key, previous);
    }
  const generationHistory = reusable
    ? [...latestByTemplate.values()]
    : history;
  for (const previous of generationHistory) {
    const key = `${previous.templateRef.id}@${previous.templateRef.revision}`;
    if (!lastAnswer.has(key))
      lastAnswer.set(key, answerSignature(previous.question));
    if (!latestSessions.has(key)) latestSessions.set(key, previous.sessionId);
    if (latestSessions.get(key) === previous.sessionId)
      usedParameters.add(
        `${key}:${JSON.stringify(previous.parameters.values)}`,
      );
  }
  // Fixed-length runs exclude every owned input; open-ended runs retain the last one.
  for (const previous of generationHistory.filter((i) => i.sessionId === id))
    usedParameters.add(
      `${previous.templateRef.id}@${previous.templateRef.revision}:${JSON.stringify(previous.parameters.values)}`,
    );
  const entries = [];
  for (let i = 0; i < questions.length; i++) {
    const base = questions[i],
      binding = set.generationBindings.find(
        (g) =>
          g.questionRef.questionId === base.id &&
          g.questionRef.revision === base.revision,
      );
    let instance: Instance | undefined;
    if (bindingMode === "generated_values" && !binding)
      throw new DataError(
        "BINDING_REF",
        "生成練習に生成できない固定問題が含まれています",
      );
    if (binding && bindingMode === "generated_values") {
      const t = bundle.templates.find(
        (t) =>
          t.id === binding.templateRef.id &&
          t.revision === binding.templateRef.revision,
      );
      if (!t)
        throw new DataError(
          "GENERATOR_REF",
          "生成テンプレートが見つかりません",
        );
      if ((await contentHash(base)) !== t.originalContentSha256)
        throw new DataError("TEMPLATE_ORIGINAL_HASH", "元データが一致しません");
      const instanceId = newId("instance"),
        key = `${t.id}@${t.revision}`;
      let seed = "",
        parameters: { values: number[] } | undefined,
        q: typeof base | undefined;
      for (let attempt = 0; attempt < 128; attempt++) {
        seed = randomSeed();
        parameters = await parametersForSeed(seed, t);
        const signature = `${key}:${JSON.stringify(parameters.values)}`;
        // Reference inputs and answers are valid candidates too. Only actual
        // practice history can exclude them, never their role as the baseline.
        if (usedParameters.has(signature)) continue;
        try {
          q = bindQuestion(base, t, parameters.values, instanceId, now);
        } catch (e) {
          if (e instanceof DataError && e.code === "PARAMETER_CONSTRAINT")
            continue;
          throw e;
        }
        const answer = answerSignature(q);
        if (
          answerCanVary(t) &&
          answer === lastAnswer.get(key)
        ) {
          q = undefined;
          continue;
        }
        usedParameters.add(signature);
        lastAnswer.set(key, answer);
        break;
      }
      if (!q || !parameters)
        throw new DataError(
          "GENERATION_CAPACITY",
          `${t.title}（${t.id}）で異なる入力と正答を生成できませんでした。出題数を減らすか再試行してください。`,
        );
      schema("question", q);
      issued[i] = q;
      instance = {
        schemaVersion: "3.0.0",
        id: instanceId,
        sessionId: id,
        entryIndex: offset + i,
        createdAt: now,
        templateRef: { id: t.id, revision: t.revision },
        baseQuestionRef: refOf(base),
        generatorRef: t.generatorRef,
        parameterSelection: "seeded",
        seed,
        parameters,
        question: q,
        contentSha256: await contentHash(q),
        bindingPerformed: true,
      };
      schema("instance", instance);
      instances.push(instance);
    }
    const q = issued[i];
    entries.push({
      questionRef: refOf(base),
      issuedContent: {
        bindingPerformed: Boolean(instance),
        isModified: q.origin.isModified,
        originKind: q.origin.kind,
        contentSha256: await contentHash(q),
      },
      choiceOrder:
        exam.choiceOrder === "shuffle" && q.choiceShuffleAllowed
          ? shuffle(q.choices.map((c) => c.id))
          : q.choices.map((c) => c.id),
      reviewFlag: false,
      revealed: false,
      ...(instance ? { generatedInstanceId: instance.id } : {}),
    });
  }
  return { issued, instances, entries };
}
export async function prepareRun(
  bundle: Bundle,
  selection: Selection,
  assets: Record<string, Blob>,
  at = Date.now(),
  beforeBinding?: (
    id: string,
    bundle: Bundle,
    assets: Record<string, Blob>,
  ) => Promise<void>,
  prepared = selectQuestions(bundle, selection),
  recentInstances: Instance[] = [],
): Promise<Run> {
  const { questions, exam, set } = prepared,
    now = new Date(at).toISOString(),
    id = newId("session");
  schema("exam", exam);
  schema("set", set);
  const originals = structuredClone(bundle);
  if (beforeBinding) await beforeBinding(id, originals, assets);
  // The unbound source lives in this independent, complete snapshot. Binding never writes to it.
  const bindingMode =
    selection.kind !== "annual" ? "generated_values" : "original_data";
  const { issued, instances, entries } = await prepareQuestions(
    originals,
    set,
    exam,
    bindingMode,
    questions,
    id,
    now,
    0,
    recentInstances,
  );
  const run: Run = {
    session: {
      schemaVersion: "3.0.0",
      id,
      revision: 1,
      setRef: { id: set.id, revision: set.revision },
      examConfigRef: { id: exam.id, revision: exam.revision },
      snapshot: {
        catalogId: bundle.catalog.id,
        catalogRevision: bundle.catalog.revision,
        catalogSha256: bundle.catalogHash,
      },
      status: "ready",
      createdAt: now,
      updatedAt: now,
      activeElapsedSeconds: 0,
      currentIndex: 0,
      entries,
      storage: "indexeddb",
      expiresAt: expires(at),
      bindingMode,
    },
    bundle: originals,
    issued,
    instances,
    exam,
    set,
    assets,
    selection: { ...structuredClone(selection), bindingMode },
  };
  if (selection.mode === "endless") {
    delete run.selection.year;
    delete run.selection.size;
  }
  schema("session", run.session);
  return run;
}
export function startRun(run: Run, at = Date.now()): Run {
  const next = structuredClone(run),
    s = next.session;
  s.status = "running";
  s.startedAt = new Date(at).toISOString();
  if (next.exam.mode === "practice")
    s.deadlineAt = new Date(
      at + next.exam.timeLimitSeconds! * 1000,
    ).toISOString();
  return touch(next, at);
}
export function touch(run: Run, at = Date.now()): Run {
  run.session.revision++;
  run.session.updatedAt = new Date(at).toISOString();
  run.session.expiresAt = expires(at);
  return run;
}
export function isOpenEnded(run: Run): boolean {
  return run.exam.mode === "study" && run.exam.questionCount === undefined;
}
export async function appendRunQuestion(
  run: Run,
  questionRef?: Ref,
  at = Date.now(),
  recentInstances: Instance[] = [],
): Promise<Run> {
  if (!isOpenEnded(run))
    throw new DataError("QUESTION_LIMIT", "問題数が決まっている練習には追加できません");
  if (run.session.status !== "running")
    throw new DataError("STATE", "解答中の練習にだけ問題を追加できます");
  questionRef ??= nextQuestionRef(run);
  if (
    !run.set.questionRefs.some(
      (r) => r.questionId === questionRef.questionId && r.revision === questionRef.revision,
    )
  )
    throw new DataError("REFERENCE", "選択したセットにない問題です");
  const base = run.bundle.questions.find(
    (q) => q.id === questionRef.questionId && q.revision === questionRef.revision,
  );
  if (!base || (run.exam.subject !== "mixed" && base.subject !== run.exam.subject) ||
    base.lifecycle !== "active" || base.distribution !== "included")
    throw new DataError("REFERENCE", "追加する問題を利用できません");
  if (run.exam.duplicatePolicy === "lineage_unique") {
    const family = new Set(familyOf(base, run.bundle));
    if (
      run.session.entries.some((e) => {
        const previous = run.bundle.questions.find(
          (q) => q.id === e.questionRef.questionId && q.revision === e.questionRef.revision,
        );
        return previous && familyOf(previous, run.bundle).some((key) => family.has(key));
      })
    )
      throw new DataError("SESSION_DUPLICATE", "同じ系列の問題は追加できません");
  }
  const next = structuredClone(run),
    offset = next.session.entries.length;
  // Preserve issued content while allowing finite parameter pools to keep
  // serving open-ended practice. Only the preceding condition is excluded.
  if ((next.selection.mode === "endless" && next.exam.duplicatePolicy === "cycle_unique") ||
    (next.selection.kind === "bookmark" && next.exam.duplicatePolicy === "instance_unique")) {
    await validateRun(run);
    next.exam = { ...next.exam, id: newId("exam-selected"), revision: 1, duplicatePolicy: "random_reuse" };
    next.set = {
      ...next.set, id: newId("set-selected"), revision: 1,
      examConfigRefs: [{ id: next.exam.id, revision: next.exam.revision }],
    };
    next.session.examConfigRef = { id: next.exam.id, revision: next.exam.revision };
    next.session.setRef = { id: next.set.id, revision: next.set.revision };
  }
  const prepared = await prepareQuestions(
    next.bundle,
    next.set,
    next.exam,
    next.session.bindingMode,
    [base],
    next.session.id,
    new Date(at).toISOString(),
    offset,
    [...recentInstances.filter((i) => i.sessionId !== run.session.id), ...next.instances],
  );
  next.issued.push(...prepared.issued);
  next.instances.push(...prepared.instances);
  next.session.entries.push(...prepared.entries);
  next.session.currentIndex = offset;
  touch(next, at);
  await validateRun(next);
  return next;
}
export function remaining(run: Run, at = Date.now()): number {
  return run.session.deadlineAt
    ? Math.max(0, Math.ceil((Date.parse(run.session.deadlineAt) - at) / 1000))
    : 0;
}
export function elapsed(run: Run, at = Date.now()): number {
  if (run.exam.mode === "practice")
    return Math.min(
      run.exam.timeLimitSeconds!,
      Math.max(0, Math.floor((at - Date.parse(run.session.startedAt!)) / 1000)),
    );
  return run.session.activeElapsedSeconds;
}
export function resultFor(run: Run, at = Date.now()): Result {
  const s = run.session;
  const entries = s.entries.map((e, i) => ({
    questionRef: refOf(run.issued[i]),
    ...(e.generatedInstanceId
      ? { generatedInstanceId: e.generatedInstanceId }
      : {}),
    outcome: !e.selectedChoiceId
      ? "unanswered"
      : e.selectedChoiceId === run.issued[i].correctAnswer.choiceId
        ? "correct"
        : "incorrect",
  }));
  const correct = entries.filter((e) => e.outcome === "correct").length,
    incorrect = entries.filter((e) => e.outcome === "incorrect").length;
  const r: Result = {
    schemaVersion: "3.0.0",
    id: `result-${s.id}`,
    sessionId: s.id,
    sessionRevision: s.revision,
    generatedAt: new Date(at).toISOString(),
    calculationVersion: "learning-accuracy-v1",
    total: entries.length,
    correct,
    incorrect,
    unanswered: entries.length - correct - incorrect,
    revealedCount: s.entries.filter((e) => e.revealed).length,
    learningAccuracyPercent: Math.round((correct / entries.length) * 1000) / 10,
    entries,
    validity: s.status === "invalidated" ? "invalidated" : "valid",
    notice:
      "学習正答率。各問を同じ重みで集計した値で、公式IRT評価点・合否・能力推定ではありません。",
  };
  schema("result", r);
  return r;
}
export function finishRun(
  run: Run,
  status: "completed" | "expired" | "abandoned" | "invalidated",
  at = Date.now(),
  reason: SessionReason = "data_error",
): Run {
  const next = structuredClone(run);
  if (!["running", "paused"].includes(next.session.status)) return next;
  next.session.status = status;
  if (status === "invalidated") next.session.invalidationReason = reason;
  delete next.session.pausedAt;
  const ended =
    status === "expired" ? Date.parse(next.session.deadlineAt!) : at;
  next.session.endedAt = new Date(ended).toISOString();
  next.session.activeElapsedSeconds = elapsed(next, ended);
  touch(next, Math.max(at, ended));
  if (status === "completed" || status === "expired")
    next.result = resultFor(next, ended);
  schema("session", next.session);
  return next;
}
type SessionReason = NonNullable<Run["session"]["invalidationReason"]>;
export function updateAnswer(
  run: Run,
  choiceId: string | undefined,
  at = Date.now(),
): Run {
  if (run.session.status !== "running")
    throw new DataError("STATE", "現在は解答できません");
  if (run.session.deadlineAt && remaining(run, at) === 0)
    return finishRun(run, "expired", at);
  const next = structuredClone(run),
    index = next.session.currentIndex;
  if (choiceId && !next.issued[index].choices.some((c) => c.id === choiceId))
    throw new DataError("ANSWER_REF", "選択肢が存在しません");
  if (choiceId) next.session.entries[index].selectedChoiceId = choiceId;
  else delete next.session.entries[index].selectedChoiceId;
  return touch(next, at);
}
export async function validateRun(run: Run) {
  if (
    run.selection.mode === "endless" &&
    ((run.selection.kind !== "mix" && run.selection.kind !== "bookmark") ||
      (run.selection.kind === "bookmark" && !run.selection.questionRefs?.length) ||
      run.selection.year !== undefined ||
      run.selection.size !== undefined ||
      run.exam.mode !== "study" ||
      run.exam.questionCount !== undefined ||
      !["cycle_unique", "random_reuse"].includes(run.exam.duplicatePolicy) ||
      run.session.bindingMode !== "generated_values")
  )
    throw new DataError("SESSION_CONFIG", "無限周回の保存設定が一致しません");
  if (
    run.session.setRef.id !== run.set.id ||
    run.session.setRef.revision !== run.set.revision ||
    run.session.examConfigRef.id !== run.exam.id ||
    run.session.examConfigRef.revision !== run.exam.revision
  )
    throw new DataError("SESSION_CONFIG", "保存した設定への参照が一致しません");
  schema("session", run.session);
  schema("exam", run.exam);
  schema("set", run.set);
  if (run.exam.subject !== run.set.subject || run.selection.subject !== run.exam.subject ||
    (run.selection.mode !== "endless" && run.selection.questionRefs !== undefined))
    throw new DataError("SESSION_CONFIG", "保存した問題群の科目・設定が一致しません");
  if (run.selection.mode === "endless") {
    const bases = run.set.questionRefs.map((ref) => run.bundle.questions.find(
      (q) => refKey(refOf(q)) === refKey(ref),
    ));
    if (bases.some((base) => !base || base.lifecycle !== "active" || base.distribution !== "included"))
      throw new DataError("REFERENCE", "周回する元問題を利用できません");
    const subject = bases.every((base) => base!.subject === bases[0]!.subject)
      ? bases[0]!.subject : "mixed";
    if (subject !== run.exam.subject)
      throw new DataError("SESSION_CONFIG", "周回する問題群の科目が一致しません");
    if (run.selection.questionRefs !== undefined) {
      const refs = run.selection.kind === "bookmark"
        ? bookmarkTemplates(run.bundle, run.selection.questionRefs).map(({ base }) => refOf(base))
        : run.selection.questionRefs;
      const expected = [...new Set(refs.map(refKey))].sort(),
        actual = run.set.questionRefs.map(refKey).sort();
      if (JSON.stringify(expected) !== JSON.stringify(actual))
        throw new DataError("SESSION_CONFIG", "保存した周回対象が一致しません");
    }
    for (const ref of run.set.questionRefs) {
      const bindings = run.set.generationBindings.filter((g) => refKey(g.questionRef) === refKey(ref)),
        template = bindings.length === 1 && run.bundle.templates.find((t) =>
          t.id === bindings[0].templateRef.id && t.revision === bindings[0].templateRef.revision,
        );
      if (!template || refKey(template.baseQuestionRef) !== refKey(ref) ||
        template.lifecycle !== "active" || template.distribution !== "included")
        throw new DataError("BINDING_REF", "周回する生成定義が一致しません");
    }
  }
  if (
    run.issued.length !== run.session.entries.length ||
    (run.exam.questionCount !== undefined && run.issued.length !== run.exam.questionCount)
  )
    throw new DataError("SESSION_COUNT", "問題数が一致しません");
  for (let i = 0; i < run.issued.length; i++) {
    const q = run.issued[i],
      e = run.session.entries[i];
    schema("question", q);
    const base = run.bundle.questions.find(
      (p) =>
        p.id === e.questionRef.questionId &&
        p.revision === e.questionRef.revision,
    );
    if (!base || !run.set.questionRefs.some((ref) => refKey(ref) === refKey(e.questionRef)) ||
      (run.exam.subject !== "mixed" && base.subject !== run.exam.subject) || q.subject !== base.subject)
      throw new DataError("REFERENCE", "保存した問題群の元データが一致しません");
    if (
      (await contentHash(q)) !== e.issuedContent.contentSha256 ||
      q.origin.isModified !== e.issuedContent.isModified ||
      q.origin.kind !== e.issuedContent.originKind
    )
      throw new DataError("SESSION_HASH", "保存した出題内容が一致しません");
    const binding = run.set.generationBindings.find(
        (g) =>
          g.questionRef.questionId === base.id &&
          g.questionRef.revision === base.revision,
      ),
      bound =
        Boolean(binding) && run.session.bindingMode === "generated_values";
    if (
      bound !== e.issuedContent.bindingPerformed ||
      bound !== Boolean(e.generatedInstanceId)
    )
      throw new DataError("BINDING_RECORD", "出題経路と実施記録が一致しません");
    if (bound) {
      const instance = run.instances.find(
        (x) => x.id === e.generatedInstanceId,
      );
      if (
        !instance ||
        instance.sessionId !== run.session.id ||
        instance.entryIndex !== i ||
        !q.origin.isModified ||
        (await contentHash(instance.question)) !== (await contentHash(q))
      )
        throw new DataError("BINDING_RECORD", "生成記録が一致しません");
      schema("instance", instance);
      const template = run.bundle.templates.find(
        (t) =>
          t.id === instance.templateRef.id &&
          t.revision === instance.templateRef.revision,
      );
      if (
        !template ||
        instance.generatorRef.id !== template.generatorRef.id ||
        instance.generatorRef.version !== template.generatorRef.version ||
        instance.baseQuestionRef.questionId !== base.id ||
        instance.baseQuestionRef.revision !== base.revision
      )
        throw new DataError("INSTANCE_BINDING", "生成記録の参照が一致しません");
      checkParameters(template, instance.parameters.values);
      validateSourceFormat(q, template);
    } else if ((await contentHash(base)) !== (await contentHash(q)))
      throw new DataError("ORIGINAL_CONTENT", "元データが上書きされています");
    const ids = q.choices.map((c) => c.id);
    if (
      new Set(e.choiceOrder).size !== ids.length ||
      e.choiceOrder.length !== ids.length ||
      e.choiceOrder.some((id) => !ids.includes(id)) ||
      (e.selectedChoiceId && !ids.includes(e.selectedChoiceId))
    )
      throw new DataError("ANSWER_REF", "保存した選択肢が不正です");
  }
  if (run.session.currentIndex >= run.issued.length)
    throw new DataError("SESSION_INDEX", "表示位置が不正です");
  if (
    run.exam.mode === "practice" &&
    run.session.startedAt &&
    Date.parse(run.session.deadlineAt!) !==
      Date.parse(run.session.startedAt) + run.exam.timeLimitSeconds! * 1000
  )
    throw new DataError("DEADLINE", "保存した期限が不正です");
  if (["cycle_unique", "random_reuse"].includes(run.exam.duplicatePolicy) && !isOpenEnded(run))
    throw new DataError("SESSION_CONFIG", "周回する練習の設定が一致しません");
  if (run.exam.duplicatePolicy !== "lineage_unique") {
    if (
      run.instances.length !== run.issued.length ||
      run.session.entries.some((e) => !e.issuedContent.bindingPerformed)
    )
      throw new DataError(
        "BINDING_RECORD",
        "生成ミックスに未生成の枠があります",
      );
    const keys = run.instances.map((i) => run.exam.duplicatePolicy === "cycle_unique"
      ? `${Math.floor(i.entryIndex / run.set.questionRefs.length)}:${refKey(i.baseQuestionRef)}`
      : run.exam.duplicatePolicy === "random_reuse" ? i.id
      : `${i.templateRef.id}@${i.templateRef.revision}:${JSON.stringify(i.parameters.values)}`);
    if (new Set(keys).size !== keys.length)
      throw new DataError(
        "SESSION_DUPLICATE",
        "生成記録、同じ入力又は旧周回の系列が重複しています",
      );
  }
  if (
    run.exam.mode === "practice" &&
    run.session.entries.some((e) => e.revealed)
  )
    throw new DataError("REVEAL", "形式練習中の正答表示記録が不正です");
  if (run.result) {
    schema("result", run.result);
    const expected = resultFor(run, Date.parse(run.result.generatedAt));
    if (JSON.stringify(expected) !== JSON.stringify(run.result))
      throw new DataError("RESULT", "保存した結果が一致しません");
  }
}
