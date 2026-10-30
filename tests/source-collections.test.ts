import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture } from "./fixtures";
import { refOf, type Selection, type SourceRef } from "../src/core/types";
import { sourceLocationLabel, sourceQuestionLabel, questionSubjectLabel } from "../src/core/source-label";
import { sourceCollections, sourceCollectionTitle, isCurrentSubjectMixQuestion } from "../src/core/source-collections";
import { selectQuestions } from "../src/core/selection";
import {schema}from "../src/core/validation";
import { searchQuestionTitle } from "../src/core/search";
import { SourceLink } from "../src/ui/QuestionFooter";
import { prepareRun, validateRun } from "../src/core/session";

function legacyFixture() {
  const b = fixture();
  const original = b.questions.find(q => q.id === "question-ipa-2023-b-1")!;
  const currentSet = b.sets.find(s => s.id === "set-annual-2023-b")!;
  const currentExam = b.exams.find(e => e.id === currentSet.examConfigRefs[0].id)!;
  for (const period of ["春期", "秋期"]) {
    // Synthetic source positions exercise selection and attribution, without
    // claiming to be transcriptions of an old exam.
    const q = structuredClone(original);
    q.id = `question-test-legacy-${period === "春期" ? "spring" : "autumn"}`;
    q.learning.tags = [];
    q.origin.sourceRefs[0].locator = {
      section: "選択処理のテスト用資料位置", year: 2019, period,
      exam: "基本情報技術者試験", timeSlot: "午後", questionNumber: "1 設問1 a",
    };
    b.questions.push(q);
    const exam = { ...currentExam, id: `exam-${q.id}`, mode: "practice" as const, timeLimitSeconds: 9000 };
    b.exams.push(exam);
    b.sets.push({ ...structuredClone(currentSet), id: `set-${q.id}`, title: `2019年度 ${period} 午後`,
      questionRefs: [refOf(q)], generationBindings: [], examConfigRefs: [{ id: exam.id, revision: exam.revision }] });
  }
  return b;
}

test("source labels retain the source's time slot and period, independently of learning subject", () => {
  const b = legacyFixture();
  const q = b.questions.at(-1)!;
  assert.equal(q.subject, "B");
  assert.equal(questionSubjectLabel(q), "旧制度・午後");
  assert.equal(sourceQuestionLabel(q), "2019年度 秋期 午後 問1 設問1 a");
  assert.equal(searchQuestionTitle(q), sourceQuestionLabel(q));
  assert.equal(sourceQuestionLabel(b.questions.at(-2)!), "2019年度 春期 午後 問1 設問1 a");
  const html = renderToStaticMarkup(createElement(SourceLink, { reference: q.origin.sourceRefs[0], bundle: b }));
  assert(html.includes("2019年度 秋期 基本情報技術者試験 午後 問1 設問1 a"));
  assert(!html.includes("科目B"));
});

test("sample attribution does not turn its publication date into an exam year", () => {
  const ref: SourceRef = { sourceId: "source-test", locator: {
    section: "サンプル", period: "2022年4月公表 サンプル問題", subject: "科目B", questionNumber: "1",
  } };
  assert.equal(sourceLocationLabel(ref), "2022年4月公表 サンプル問題 科目B 問1");
  assert(!sourceLocationLabel(ref).includes("年度"));
});

test("old source labels display a duplicated subject/time slot once and retain distinct source information", () => {
  const ref: SourceRef = {sourceId: "source-test", locator: {
    section: "出典表示の検証用", year: 2017, period: "秋期", exam: "基本情報技術者試験",
    subject: "午前", timeSlot: "午前", questionNumber: "64",
  }};
  assert.equal(sourceLocationLabel(ref, true), "2017年度 秋期 基本情報技術者試験 午前 問64");
  ref.locator.subject = "旧制度・午前";
  assert.equal(sourceLocationLabel(ref), "2017年度 秋期 旧制度・午前 問64");
  ref.locator.subject = "分類が別の資料";
  assert.equal(sourceLocationLabel(ref), "2017年度 秋期 分類が別の資料 午前 問64");
});

test("two synthetic collections coexist with the real same-year booklet and retain their own references and duration", () => {
  const b = legacyFixture();
  const sameYear = sourceCollections(b, "B").filter(s => s.title.startsWith("2019"));
  const sets = sameYear.filter(s => s.id.startsWith("set-question-test-legacy-"));
  assert.deepEqual(sameYear.filter(s => !sets.includes(s)).map(s => [s.id, s.questionRefs.length]), [["set-annual-2019-spring-pm", 13], ["set-annual-2019-autumn-pm", 13]]);
  assert.equal(sameYear.length, 4);
  assert.equal(sets.length, 2);
  for (const set of sets) {
    const selection: Selection = { subject: "B", kind: "annual", sourceCollectionId: set.id,
      mode: "practice", size: "full", bindingMode: "original_data" };
    const selected = selectQuestions(b, selection, a => a);
    assert.deepEqual(selected.questions.map(refOf), set.questionRefs);
    assert.equal(selected.exam.timeLimitSeconds, 9000);
    assert.equal(selected.set.title, sourceCollectionTitle(b, set));
    assert(selected.set.title.startsWith("旧制度 · "));
  }
  const withoutExam = structuredClone(b);
  withoutExam.exams = [];
  assert.throws(() => selectQuestions(withoutExam, { subject: "B", kind: "annual", sourceCollectionId: sets[0].id,
    mode: "practice", size: "full", bindingMode: "original_data" }), { code: "EXAM_REF" });
});

test("saved year selections keep their original collection, and an unknown explicit collection never falls back", () => {
  const b = legacyFixture();
  const selection: Selection = { subject: "B", kind: "annual", year: 2023, mode: "study", size: "public", bindingMode: "original_data" };
  assert(selectQuestions(b, selection).questions.every(q => q.origin.sourceRefs[0].locator.year === 2023));
  assert.throws(() => selectQuestions(b, { ...selection, sourceCollectionId: "set-missing" }), { code: "SOURCE_COLLECTION" });
  assert.throws(() => selectQuestions(b, { ...selection, sourceCollectionId: "set-annual-2023-b", kind: "mix" }), { code: "SELECTION" });
  const broken = structuredClone(b.sets.find(s => s.id === "set-annual-2023-b")!);
  broken.id = "set-broken";
  broken.questionRefs[0].revision += 999;
  b.sets.push(broken);
  assert(!sourceCollections(b, "B").some(s => s.id === broken.id));
});

test("existing current-format titles and annual question order are preserved", () => {
  const b = fixture();
  for (const subject of ["A", "B"] as const) {
    const selected = selectQuestions(b, { subject, kind: "annual", year: 2026, mode: "study", size: "full", bindingMode: "original_data" });
    assert.equal(selected.set.title, "2026年度 公開問題");
    assert.equal(sourceQuestionLabel(selected.questions[0]), `2026年度 科目${subject} 問1`);
    assert.equal(questionSubjectLabel(selected.questions[0]), `科目${subject}`);
    assert.deepEqual(selected.questions.map(q => q.origin.sourceRefs[0].locator.questionNumber),
      Array.from({ length: subject === "A" ? 20 : 6 }, (_, i) => String(i + 1)));
  }
});

test("the exact selected collection survives a saved run without relying on a year, and cannot be reinterpreted as a mix", async () => {
  const b = fixture();
  const selection: Selection = { subject: "A", kind: "annual", sourceCollectionId: "set-annual-2024-a",
    mode: "study", size: "public", bindingMode: "original_data" };
  const run = await prepareRun(b, selection, {}, 100000);
  const saved = structuredClone(run);
  await validateRun(saved);
  assert.equal(saved.selection.sourceCollectionId, selection.sourceCollectionId);
  assert.equal(saved.selection.year, undefined);
  assert(saved.issued.every(q => q.origin.sourceRefs[0].locator.year === 2024));
  saved.selection.kind = "mix";
  await assert.rejects(validateRun(saved), { code: "SESSION_CONFIG" });
});

test("an explicit saved annual identity must match the snapshot booklet and every issued reference", async () => {
  const selection: Selection = { subject: "B", kind: "annual", sourceCollectionId: "set-sample-2022-apr-b",
    mode: "study", size: "public", bindingMode: "original_data" };
  const run = await prepareRun(fixture(), selection, {}, 100000);
  await validateRun(structuredClone(run));
  for (const id of ["set-missing", "set-sample-2022-dec-b", "set-annual-2026-b", "set-annual-2026-a"]) {
    const changed = structuredClone(run);
    changed.selection.sourceCollectionId = id;
    await assert.rejects(validateRun(changed), { code: "SESSION_CONFIG" }, id);
  }
  const missing = structuredClone(run);
  missing.bundle.sets = missing.bundle.sets.filter(set => set.id !== selection.sourceCollectionId);
  await assert.rejects(validateRun(missing), { code: "SESSION_CONFIG" });
  const reordered = structuredClone(run);
  reordered.set.questionRefs.reverse();
  await assert.rejects(validateRun(reordered), { code: "SESSION_CONFIG" });
  const wrongRevision = structuredClone(run);
  wrongRevision.session.entries[0].questionRef.revision++;
  await assert.rejects(validateRun(wrongRevision), { code: "SESSION_CONFIG" });
  const subset = structuredClone(run);
  subset.set.questionRefs.pop(); subset.issued.pop(); subset.session.entries.pop(); subset.exam.questionCount = subset.exam.questionCount! - 1;
  await assert.rejects(validateRun(subset), { code: "SESSION_CONFIG" });
  const wrongBinding = structuredClone(run);
  wrongBinding.selection.bindingMode = "generated_values";
  await assert.rejects(validateRun(wrongBinding), { code: "SESSION_CONFIG" });
});

test("explicit annual validation uses the saved snapshot, ignores display titles and retains the booklet duration", async () => {
  const selection: Selection = { subject: "B", kind: "annual", sourceCollectionId: "set-sample-2022-apr-b",
    mode: "practice", size: "public", bindingMode: "original_data" };
  const run = await prepareRun(fixture(), selection, {}, 100000);
  const renamed = structuredClone(run);
  renamed.set.title = "保存時の表示名"; renamed.exam.title = "保存時の試験表示名";
  renamed.bundle.sets.find(set => set.id === selection.sourceCollectionId)!.title = "改訂した問題集表示名";
  renamed.bundle.exams.forEach(exam => { exam.title = "改訂した試験表示名"; });
  await validateRun(renamed);
  const shortened = structuredClone(run); shortened.exam.timeLimitSeconds = shortened.exam.timeLimitSeconds! - 1;
  await assert.rejects(validateRun(shortened), { code: "SESSION_CONFIG" });
  const wrongMode = structuredClone(run); wrongMode.selection.mode = "study";
  await assert.rejects(validateRun(wrongMode), { code: "SESSION_CONFIG" });
  const snapshot = structuredClone(run);
  snapshot.bundle.exams.find(exam => exam.id === "exam-sample-2022-apr-b-practice")!.timeLimitSeconds = 1777;
  snapshot.exam.timeLimitSeconds = 1777;
  await validateRun(snapshot); // The current distributed duration is not consulted.
});

test("year-only annual histories keep their issued references and settings without a new collection lookup", async () => {
  const run = await prepareRun(fixture(), { subject: "B", kind: "annual", year: 2026,
    mode: "practice", size: "public", bindingMode: "original_data" }, {}, 100000);
  assert.equal(run.selection.sourceCollectionId, undefined);
  run.selection.year = 2025;
  run.bundle.sets = run.bundle.sets.filter(set => set.id !== "set-annual-2026-b");
  await validateRun(structuredClone(run));
});


test("old morning remains eligible in subject A mix and endless pools while the old afternoon format stays outside current subject B pools",()=>{
  const b=fixture(),template=structuredClone(b.templates.find(t=>b.questions.find(q=>q.id===t.baseQuestionRef.questionId)?.subject==="A")!);
  const base=structuredClone(b.questions.find(q=>q.id===template.baseQuestionRef.questionId)!);
  base.id="question-test-old-morning-base";base.learning.tags=[];
  base.origin.sourceRefs[0].locator={section:"synthetic selection position",year:2017,period:"春期",timeSlot:"午前",questionNumber:"1"};
  template.id="template-test-old-morning";template.baseQuestionRef=refOf(base);b.questions.push(base);b.templates.push(template);
  assert(isCurrentSubjectMixQuestion(base));
  const chooseOldFirst=<T>(rows:T[])=>[...rows].sort((a:any,z:any)=>Number(z.id===base.id||z.questionId===base.id)-Number(a.id===base.id||a.questionId===base.id));
  const mix=selectQuestions(b,{subject:"A",kind:"mix",year:2026,mode:"study",size:"public",bindingMode:"generated_values"},chooseOldFirst);
  assert(mix.questions.some(q=>q.id===base.id));assert(mix.set.questionRefs.some(r=>r.questionId===base.id));
  const endless=selectQuestions(b,{subject:"A",kind:"mix",mode:"endless",bindingMode:"generated_values"},chooseOldFirst);
  assert.equal(endless.questions[0].id,base.id);
  const afternoon=structuredClone(base);afternoon.subject="B";afternoon.origin.sourceRefs[0].locator.timeSlot="午後";
  assert(!isCurrentSubjectMixQuestion(afternoon));
  const mismatched=structuredClone(base);mismatched.subject="B";assert(!isCurrentSubjectMixQuestion(mismatched));
  const mixed=structuredClone(base);mixed.origin.sourceRefs.push({...structuredClone(mixed.origin.sourceRefs[0]),locator:{section:"別資料",timeSlot:"午後"}});assert(!isCurrentSubjectMixQuestion(mixed));
});

test("a full old-morning collection keeps all80 references in source order and the booklet's150-minute duration",()=>{
  const b=fixture(),original=b.questions.find(q=>q.id==="question-ipa-2026-a-1")!,annual=structuredClone(b.sets.find(s=>s.id==="set-annual-2026-a")!);
  const refs=Array.from({length:80},(_,i)=>{const q=structuredClone(original);q.id="question-test-old-morning-"+(i+1);q.learning.tags=[];q.origin.sourceRefs[0].locator={section:"synthetic all80 position",year:2017,period:"秋期",timeSlot:"午前",questionNumber:String(i+1)};b.questions.push(q);return refOf(q);});
  const exam={...b.exams[0],id:"exam-test-old-morning",mode:"practice" as const,timeLimitSeconds:9000};b.exams.push(exam);
  annual.id="set-test-old-morning";annual.title="2017年度 秋期 午前";annual.questionRefs=refs;annual.examConfigRefs=[{id:exam.id,revision:exam.revision}];b.sets.push(annual);
  const selected=selectQuestions(b,{subject:"A",kind:"annual",sourceCollectionId:annual.id,mode:"practice",size:"full",bindingMode:"original_data"},a=>a);
  assert.equal(selected.questions.length,80);assert.equal(selected.exam.questionCount,80);assert.equal(selected.exam.timeLimitSeconds,9000);assert.deepEqual(selected.questions.map(refOf),refs);assert.equal(selected.set.title,"旧制度 · 2017年度 秋期 午前");schema("exam",selected.exam);
  assert.throws(()=>schema("exam",{...selected.exam,questionCount:81}),{code:"SCHEMA"});assert.throws(()=>schema("exam",{...selected.exam,timeLimitSeconds:9001}),{code:"SCHEMA"});
});
