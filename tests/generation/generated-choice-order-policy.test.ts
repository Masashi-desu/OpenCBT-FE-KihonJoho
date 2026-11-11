import assert from "node:assert/strict";
import test from "node:test";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {AnswerChoices} from "../../src/ui/AnswerChoices";
import {SourceFigure} from "../../src/ui/SourceFigure";
import {fixture,installFixtureGenerators} from "../fixtures";
import {bindQuestion,parametersForSeed} from "../../src/core/generation";
import {validateSourceFormat} from "../../src/core/generation-formats";
import {contentHash} from "../../src/core/hash";
import {refOf,type Question,type Run,type Selection} from "../../src/core/types";
import {selectQuestions} from "../../src/core/selection";
import {prepareRun,startRun,updateAnswer,finishRun,validateRun} from "../../src/core/session";

test("生成後も基準問題の固定順/並替え許可を保持し、実出題の正答IDとJSON復元へ反映する",async context=>{
 // Deterministic Fisher-Yates: zero swaps rotate four elements, so a hidden
 // unconditional true cannot happen to pass through a coincidental identity.
 const random=context.mock.method(crypto,"getRandomValues",<T extends ArrayBufferView|null>(array:T):T=>{
  assert.ok(array);new Uint8Array(array.buffer,array.byteOffset,array.byteLength).fill(0);return array;
 });
 try{
  for(const permitted of [false,true]){
   const b=fixture(),t=b.templates.find(t=>t.id==="template-source-sample-2022-dec-a-1")!;assert.ok(t);
   const base=b.questions.find(q=>q.id===t.baseQuestionRef.questionId)!;base.choiceShuffleAllowed=permitted;t.originalContentSha256=await contentHash(base);
   const original=b.questions.find(q=>base.origin.derivedFrom.some(r=>r.questionId===q.id))!;assert.ok(original);
   const selection:Selection={subject:base.subject,kind:"bookmark",mode:"study",bindingMode:"generated_values",bookmarkQuestionRef:refOf(original)},prepared=selectQuestions(b,selection);
   assert.equal(prepared.exam.choiceOrder,"shuffle");
   const run=await prepareRun(b,selection,{},100000,undefined,prepared),q=run.issued[0],order=q.choices.map(c=>c.id);
   assert.equal(q.choiceShuffleAllowed,permitted);assert.equal(run.instances[0].question.choiceShuffleAllowed,permitted);
   if(permitted)assert.notDeepEqual(run.session.entries[0].choiceOrder,order);else assert.deepEqual(run.session.entries[0].choiceOrder,order);
   const answer=q.correctAnswer.choiceId!;assert.ok(order.includes(answer));const correctDisplayIndex=run.session.entries[0].choiceOrder.indexOf(answer);assert.ok(correctDisplayIndex>=0);
   const resumed=JSON.parse(JSON.stringify(run)) as Run;await validateRun(resumed);assert.deepEqual(resumed.session.entries[0].choiceOrder,run.session.entries[0].choiceOrder);assert.equal(resumed.issued[0].correctAnswer.choiceId,answer);
   const completed=finishRun(updateAnswer(startRun(resumed,101000),resumed.session.entries[0].choiceOrder[correctDisplayIndex],102000),"completed",103000);
   assert.equal(completed.result!.entries[0].outcome,"correct");const roundTrip=JSON.parse(JSON.stringify(completed)) as Run;await validateRun(roundTrip);assert.deepEqual(roundTrip.result,completed.result);
  }
 }finally{random.mock.restore();}
});

const at = "2026-11-06T00:00:00Z";
const choices = (q: Question) => q.choices.map(c => c.content.blocks.map(b => {
  if (b.type === "paragraph" || b.type === "code") return b.text;
  assert.equal(b.type, "table");
  return b.rows[0].join("|");
}).join("\n"));

test("原資料に順序のある解答群の基準・生成・採点参照を照合する", async () => {
  await installFixtureGenerators();
  const b = fixture();
  const numberedSources = [
    "2016h28a-fe-am-11", "2016h28a-fe-am-29", "2016h28a-fe-am-48", "2016h28a-fe-am-72",
    "2016h28h-fe-am-1", "2016h28h-fe-am-49", "2017h29h-fe-am-23", "2017h29h-fe-am-49",
    "2018h30a-fe-am-11", "2018h30a-fe-am-16", "2018h30a-fe-am-52", "2018h30a-fe-am-68", "2018h30a-fe-am-75",
    "2019h31h-fe-am-53", "2019r01a-fe-am-8", "2019r01a-fe-am-76",
    "sample-2022-dec-a-11", "sample-2022-dec-a-13", "sample-2022-dec-a-44",
    "sample-2022-dec-a-57", "sample-2022-dec-a-58", "2024-b-4", "2025-b-4",
  ];
  const exact = new Map<string, string[]>([
    ["2016h28a-fe-am-64", ["案1", "案2", "案3", "案4"]],
    ["2017h29h-fe-am-34", ["クラスA", "クラスB", "クラスC", "クラスD"]],
    ["2019r01a-fe-am-15", ["RAID1", "RAID2", "RAID3", "RAID4"]],
    ["2023-a-10", ["a", "b", "c", "d"]],
    ["sample-2022-dec-a-50", ["a", "b", "c", "d"]],
    ["2019h31h-fe-am-65", ["a", "b", "c", "d"]],
    ["2023-a-13", ["B", "C", "D", "E"]],
    ["retention", ["サービスA", "サービスB", "サービスC", "サービスD"]],
  ]);
  const grouped = [
    "2016h28a-fe-am-33", "2016h28h-fe-am-34", "2017h29a-fe-am-35", "2018h30h-fe-am-32",
    "2016h28h-fe-am-5", "2018h30a-fe-am-26",
    "sample-2022-dec-b-1", "sample-2022-dec-b-2", "sample-2022-dec-b-15", "sample-2022-dec-b-18",
    "2023-a-2", "2017h29a-fe-am-53", "2018h30h-fe-am-51", "2019r01a-fe-am-52",
    "2025-b-5", "security-log", "coin-change",
  ];
  const ids = new Set([...numberedSources, ...exact.keys(), ...grouped]);
  let checked = 0;
  for (const t of b.templates) {
    const source = t.generatorRef.id.replace(/^generator-(source-)?/, "");
    if (!ids.has(source)) continue;
    const base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
    assert.equal(base.choiceShuffleAllowed, false, source);
    const reference = bindQuestion(base, t, t.referenceParameters.values, "order-reference", at);
    assert.deepEqual(choices(reference), choices(base), source);
    const originals = {
      "2023-a-2": ["a，b，e，f", "a，e，f", "a，f", "b，e"],
      "2025-b-5": ["44|33", "58|8", "70|7", "75|2", "80|6", "80|8", "82|6"],
      "security-log": ["(一)、(二)", "(一)、(二)、(三)", "(一)、(二)、(四)", "(一)、(三)", "(一)、(三)、(四)", "(一)、(四)", "(二)、(三)", "(二)、(三)、(四)", "(二)、(四)", "(三)、(四)"],
    } as Record<string, string[]>;
    if (originals[source]) assert.deepEqual(choices(reference), originals[source]);
    if (source === "2023-a-10") {
      for (const layout of [0, 1]) for (const terminator of [0, 1]) {
        const q = bindQuestion(base, t, [terminator, layout], "waf-order", at);
        const diagram = q.prompt.blocks.find(block => block.type === "diagram");
        assert(diagram?.scene.kind === "source_figure");
        const markup = renderToStaticMarkup(createElement(SourceFigure, { scene: diagram.scene, caption: diagram.caption }));
        const labels = [...markup.matchAll(/<text [^>]* y="([0-9]+)"[^>]*>([abcd])<\/text>/g)];
        assert.deepEqual(labels.map(match => match[2]), ["a", "b", "c", "d"]);
        const protocolByY = new Map([...markup.matchAll(/<text [^>]* y="([0-9]+)"[^>]*>(HTTPS?)<\/text>/g)].map(match => [match[1], match[2]]));
        const protocols = labels.map(match => protocolByY.get(match[1]));
        assert.deepEqual(protocols, terminator === 0 ? ["HTTPS", "HTTP", "HTTP", undefined] : ["HTTPS", "HTTPS", "HTTP", undefined]);
        const firstPlain = labels[protocols.indexOf("HTTP")][2];
        assert.equal(choices(q)[q.choices.findIndex(c => c.id === q.correctAnswer.choiceId)], firstPlain);
        const firewall = markup.indexOf(">ファイアウォール</text>");
        const accelerator = markup.indexOf(">SSLアクセラレータ</text>");
        assert(firewall > 0 && accelerator > 0);
        assert.equal(firewall < accelerator, layout === 0);
      }
    }
    for (let seed = 0; seed < 24; seed++) {
      const { values } = await parametersForSeed(seed.toString(16).padStart(32, "0"), t);
      const q = bindQuestion(base, t, values, "order-seeded", at);
      validateSourceFormat(q, t);
      assert.equal(q.choiceShuffleAllowed, false, source);
      assert(q.choices.some(c => c.id === q.correctAnswer.choiceId), source);
      if (exact.has(source)) assert.deepEqual(choices(q), exact.get(source), source);
      if (numberedSources.includes(source)) {
        const numbers = choices(q).map(s => Number(s.replaceAll(",", "")));
        assert(numbers.every((n, i) => i === 0 || n > numbers[i - 1]), source);
        assert.throws(() => validateSourceFormat({ ...q, choices: [...q.choices].reverse() }, t), { code: "SOURCE_FORMAT" });
      }
      assert.throws(() => validateSourceFormat({ ...q, choiceShuffleAllowed: true }, t), { code: "SOURCE_FORMAT" });
    }
    checked++;
  }
  assert.equal(checked, ids.size);
  const unordered = b.templates.find(t => t.id === "template-source-2026-a-2")!;
  const base = b.questions.find(q => q.id === unordered.baseQuestionRef.questionId)!;
  assert.equal(bindQuestion(base, unordered, unordered.referenceParameters.values, "order-unordered", at).choiceShuffleAllowed, true);
});

test("2016秋午前問64は表の各条件から案1〜4が正答になり、練習と復元で案番号順を保つ", async () => {
  await installFixtureGenerators();
  const b = fixture();
  const t = b.templates.find(t => t.id === "template-source-2016h28a-fe-am-64")!;
  const base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
  const original = b.questions.find(q => q.id === base.origin.derivedFrom[0].questionId)!;
  const wins = new Set<string>();
  for (let i = 0; i <= t.parameterDomain.values.maximum; i++) {
    const q = bindQuestion(base, t, [i], "weighted-order", at);
    const table = q.prompt.blocks.find(block => block.type === "table");
    assert(table?.type === "table");
    const plans = table.columns.slice(2);
    assert.deepEqual(plans, ["案1", "案2", "案3", "案4"]);
    assert.deepEqual(choices(q), plans);
    const totals = plans.map((_, column) =>
      table.rows.reduce((sum, row) => sum + Number(row[1]) * Number(row[column + 2]), 0));
    const winners = plans.filter((_, j) => totals.every((other, k) => j === k || totals[j] > other));
    assert.equal(winners.length, 1);
    assert.equal(choices(q)[q.choices.findIndex(c => c.id === q.correctAnswer.choiceId)], winners[0]);
    assert(q.explanation?.blocks.some(block => block.type === "paragraph" && block.text.includes(totals.join("，")) && block.text.includes("最大の" + winners[0])));
    wins.add(winners[0]);
  }
  assert.deepEqual([...wins].sort(), ["案1", "案2", "案3", "案4"]);
  const selection: Selection = {
    subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values",
    bookmarkQuestionRef: refOf(original),
  };
  const run = await prepareRun(b, selection, {}, 100000, undefined, selectQuestions(b, selection));
  assert.deepEqual(choices(run.issued[0]), ["案1", "案2", "案3", "案4"]);
  assert.deepEqual(run.session.entries[0].choiceOrder, run.issued[0].choices.map(c => c.id));
  const displayed = renderToStaticMarkup(createElement(AnswerChoices, {
    question: run.issued[0], entry: run.session.entries[0], bundle: b,
    assetUrls: {}, disabled: false, revealed: false,
  }));
  assert.deepEqual([...displayed.matchAll(/class="choice-label">([アイウエ])<\/span>[\s\S]*?<p[^>]*>(案[1-4])<\/p>/g)]
    .map(match => [match[1], match[2]]), [["ア", "案1"], ["イ", "案2"], ["ウ", "案3"], ["エ", "案4"]]);
  const completed = finishRun(updateAnswer(startRun(run, 101000), run.issued[0].correctAnswer.choiceId!, 102000), "completed", 103000);
  assert.equal(completed.result!.entries[0].outcome, "correct");
  const restored = JSON.parse(JSON.stringify(completed)) as Run;
  await validateRun(restored);
  assert.deepEqual(restored.session.entries[0].choiceOrder, run.session.entries[0].choiceOrder);
});
