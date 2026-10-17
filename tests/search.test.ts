import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fixture } from "./fixtures";
import {
  detailSearchDocuments, emptySearch, findSearchDocuments, normalizeSearch, parseSearchRoute,
  questionSearchDocuments, searchRouteHash, searchSnippet,
} from "../src/core/search";
import { questionDetailContext, validateDetailManifest } from "../src/core/detailed-explanation";

const base = new URL("https://search.invalid/opencbt/");
const files = (async (url: any) => new Response(fs.readFileSync("public" + new URL(String(url)).pathname.replace(/^\/opencbt/, "")))) as typeof fetch;

test("search covers every annual original once, preserves reading data and excludes generator definitions and unavailable questions", () => {
  const bundle = fixture(), before = JSON.stringify(bundle);
  const docs = questionSearchDocuments(bundle);
  const annualIds = new Set(bundle.sets.filter(set => set.id.startsWith("set-annual-")).flatMap(set => set.questionRefs.map(ref => ref.questionId)));
  assert.equal(docs.length, 103);
  assert.deepEqual(new Set(docs.map(doc => doc.question.id)), annualIds);
  assert.equal(new Set(docs.map(doc => doc.id)).size, docs.length);
  assert(docs.every(doc => !bundle.templates.some(template => template.baseQuestionRef.questionId === doc.question.id)));
  assert.equal(JSON.stringify(bundle), before);
  const unavailable = structuredClone(bundle);
  unavailable.questions.find(q => q.id === "question-ipa-2026-a-2")!.lifecycle = "withdrawn";
  unavailable.questions.find(q => q.id === "question-ipa-2026-a-1")!.distribution = "excluded";
  assert.equal(questionSearchDocuments(unavailable).length, 101);
});

test("keywords match actual prompts, options, explanation, referenced materials and reviewed term meanings", () => {
  const bundle = fixture(), docs = questionSearchDocuments(bundle);
  assert(findSearchDocuments(docs, { ...emptySearch, query: "最高情報責任者 2023" }).some(doc => doc.question.id === "question-ipa-2023-a-19"));
  assert(findSearchDocuments(docs, { ...emptySearch, query: "クラウド" }).some(doc => doc.question.id === "question-ipa-2023-a-15"));
  const question = bundle.questions.find(q => q.id === "question-ipa-2026-a-2")!;
  question.contexts.push({ id: "used", title: "参照される資料", content: { attribution: question.prompt.attribution, blocks: [{ type: "table", caption: "検索用の参照表", columns: ["入力"], rows: [["参照対象語XYZ"]] }] } },
    { id: "unused", title: "非参照資料", content: { attribution: question.prompt.attribution, blocks: [{ type: "paragraph", text: "非参照語ABC" }] } });
  question.contextRefs.push("used");
  question.choices[0].content.blocks.push({ type: "paragraph", text: "選択肢検査語DEF" });
  question.explanation.blocks.push({ type: "paragraph", text: "通常解説検査語GHI" });
  const changed = questionSearchDocuments(bundle);
  for (const query of ["参照対象語XYZ", "選択肢検査語DEF", "通常解説検査語GHI"]) assert.equal(findSearchDocuments(changed, { ...emptySearch, query })[0].question.id, question.id);
  assert.equal(findSearchDocuments(changed, { ...emptySearch, query: "非参照語ABC" }).length, 0);
});

test("search normalizes full width and case, uses AND across fields, keeps literal punctuation and intersects all filters", () => {
  const docs = questionSearchDocuments(fixture());
  assert.equal(normalizeSearch("　ＣＰＵ\tＡＢＣ　"), "cpu abc");
  assert.deepEqual(findSearchDocuments(docs, { ...emptySearch, query: "ｃｐｕ" }).map(doc => doc.id), findSearchDocuments(docs, { ...emptySearch, query: "CPU" }).map(doc => doc.id));
  const matches = findSearchDocuments(docs, { ...emptySearch, query: "CPU", subject: "A", year: 2026, kind: "question" });
  assert(matches.length > 0);
  assert(matches.every(doc => doc.question.subject === "A" && doc.year === 2026 && doc.kind === "question"));
  assert.equal(findSearchDocuments(docs, { ...emptySearch, query: "CPU 絶対に存在しない語ZYX" }).length, 0);
  assert.equal(findSearchDocuments(docs, { ...emptySearch, query: "[.*+?}" }).length, 0);
  assert.equal(findSearchDocuments(docs, { ...emptySearch, kind: "detail" }).length, 0);
});

test("verified detailed content is searchable, deduplicated and linked to its original even when lesson text is dynamic", async () => {
  const bundle = fixture(), calls: string[] = [], before = JSON.stringify(bundle);
  const counting = (async (url: any) => { calls.push(String(url)); return files(url); }) as typeof fetch;
  const docs = await detailSearchDocuments(bundle, base, undefined, counting);
  assert.equal(docs.length, 5); assert(docs.some(doc => doc.question.id === "question-ipa-2026-a-2"));
  assert.equal(calls.filter(url => url.endsWith("manifest.json")).length, 5);
  assert(calls.every(url => url.startsWith("https://search.invalid/opencbt/explanations/")));
  for (const query of ["ヒープ", "Quick Sort", "ピボット", "安定", "最悪", "シェル", "全角カンマ", "1,024"]) assert.equal(findSearchDocuments(docs, { ...emptySearch, query }).length, 1);
  assert.equal(findSearchDocuments(docs, { ...emptySearch, query: "ヒープ", subject: "B" }).length, 0);
  assert.equal(findSearchDocuments(docs, { ...emptySearch, query: "ヒープ", year: 2025 }).length, 0);
  assert(searchSnippet(docs.find(doc => doc.question.id === "question-ipa-2026-a-2")!, "安定").includes("安定"));
  assert(findSearchDocuments(docs, { ...emptySearch, query: "トータルフロート" }).some(doc => doc.question.id === "question-ipa-2024-a-13"));
  assert.equal(findSearchDocuments(docs, { ...emptySearch, query: "循環小数" })[0].question.id, "question-ipa-2023-a-1");
  assert.equal(findSearchDocuments(docs, { ...emptySearch, query: "3a＝2b" })[0].question.id, "question-ipa-2023-a-11");
  const arrow2025 = findSearchDocuments(docs, { ...emptySearch, query: "アローダイアグラム", year: 2025, kind: "detail" });
  assert.equal(arrow2025.length, 1);
  assert.equal(arrow2025[0].question.id, "question-ipa-2025-a-14");
  assert.equal(arrow2025[0].question.detailedExplanationRef?.initialParameters?.pattern, "2025-a-14");
  assert.equal(JSON.stringify(bundle), before);
});

test("missing, corrupted, unpermitted or aborted optional explanations are omitted while questions remain searchable", async () => {
  const bundle = fixture();
  const missing = (async () => new Response("", { status: 404 })) as typeof fetch;
  assert.deepEqual(await detailSearchDocuments(bundle, base, undefined, missing), []);
  const corrupt = (async (url: any) => String(url).endsWith("main.js") ? new Response("changed") : files(url)) as typeof fetch;
  assert.deepEqual(await detailSearchDocuments(bundle, base, undefined, corrupt), []);
  const denied = structuredClone(bundle);
  denied.rights.find(right => right.id === "rights-original")!.uses.browserDisplay = "not_allowed";
  assert.deepEqual(await detailSearchDocuments(denied, base, undefined, files), []);
  const controller = new AbortController(); controller.abort();
  let called = false;
  assert.deepEqual(await detailSearchDocuments(bundle, base, controller.signal, (async () => { called = true; throw Error(); }) as typeof fetch), []);
  assert.equal(called, false);
  assert.equal(questionSearchDocuments(bundle).length, 103);
});

test("optional search descriptors support old manifests and reject malformed or excessive content", () => {
  const manifest = JSON.parse(fs.readFileSync("public/explanations/ipa-2026-a-2/manifest.json", "utf8"));
  validateDetailManifest(manifest);
  const old = structuredClone(manifest); delete old.search; validateDetailManifest(old);
  for (const search of [{ ...manifest.search, text: "x".repeat(10001) }, { ...manifest.search, summary: "" },
    { ...manifest.search, keywords: ["same", "same"] }, { ...manifest.search, execute: "script" }, { text: "only text" }]) {
    assert.throws(() => validateDetailManifest({ ...manifest, search }));
  }
});

test("search routes retain query, filters and page across result, question and detail links and reject unsafe IDs", () => {
  for (const view of ["results", "question", "detail"] as const) {
    const route = { ...emptySearch, view, questionId: view === "results" ? undefined : "question-ipa-2026-a-2", query: "ピボット ＣＰＵ & <tag>", subject: "A" as const, year: 2026, kind: "detail" as const, page: 2 };
    assert.deepEqual(parseSearchRoute(searchRouteHash(route)), route);
  }
  for (const hash of ["#/search/question/..", "#/search/detail/%2Fetc", "#/search/question/%3Cscript%3E", "#/search/detail/%zz", "#/search/other/id", "#/search?q=" + "x".repeat(201)]) assert.equal(parseSearchRoute(hash), undefined);
  assert.equal(parseSearchRoute("#/search?page=-1&type=bad&subject=C&year=no")!.page, 1);
});

test("search explanation context is an independent read-only display copy without a generated run or selected answer", () => {
  const question = fixture().questions.find(q => q.id === "question-ipa-2026-a-2")!, before = JSON.stringify(question);
  const context = questionDetailContext(question, "dark");
  assert.equal(context.generation, null); assert.equal(context.selectedChoiceId, null);
  assert.equal(context.theme, "dark"); assert.equal(context.initialParameters.algorithm, "quick");
  assert.deepEqual(context.choiceOrder, question.choices.map((choice, i) => ({ id: choice.id, label: ["ア", "イ", "ウ", "エ"][i] })));
  context.question.prompt.blocks.length = 0;
  assert.equal(JSON.stringify(question), before);
});
