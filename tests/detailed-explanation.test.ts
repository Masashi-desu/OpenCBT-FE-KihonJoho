import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { inertDetailHtml } from "../src/ui/detail-document";
import { DetailReferences } from "../src/ui/DetailReferences";
import { AttributionLine } from "../src/ui/Content";
import { QuestionFooter } from "../src/ui/QuestionFooter";
import { fixture } from "./fixtures";
import { contentHash, sha256 } from "../src/core/hash";
import { schema } from "../src/core/validation";
import { prepareRun, startRun, finishRun } from "../src/core/session";
import {
  canOpenDetail, detailContext, detailMessage, detailRouteHash, parseDetailRoute,
  loadDetailPackage, validateDetailManifest, validDetailParameters,
  validateDetailAttribution,
  type DetailManifest, type DetailRoute,
} from "../src/core/detailed-explanation";
import { validateDetailPackages } from "../scripts/validate-detail-packages";

const ref = { directory: "explanations/question-test/", revision: 1,
  initialParameters: { contentId: "overview" } };
const attr = { origin: "original" as const, sourceRefs: [], rightsRefs: ["rights-original"], creatorIds: ["codex"] };
const appBase = new URL("https://example.test/OpenCBT/");
async function resourceFixture() {
  // Protocol-only test document, never included in public/ or assigned to a real question.
  const page = new TextEncoder().encode("<!doctype html><html lang=ja><body>Protocol test</body></html>");
  const manifest: DetailManifest = { apiVersion: 1, revision: 1, title: "Protocol test", attribution: attr,
    files: [{ path: "index.html", mediaType: "text/html", sha256: await sha256(page) }] };
  const requested: string[] = [];
  const fetcher = (async (url: URL | RequestInfo) => {
    requested.push(String(url));
    return String(url).endsWith("manifest.json") ? new Response(JSON.stringify(manifest)) : new Response(page);
  }) as typeof fetch;
  return { manifest, page, fetcher, requested };
}

test("optional reference: old question hashes and regular explanation remain intact", async () => {
  const question = fixture().questions.find(q => !q.detailedExplanationRef)!, before = await contentHash(question);
  schema("question", question);
  assert.equal(question.detailedExplanationRef, undefined);
  const extended = { ...question, detailedExplanationRef: ref };
  schema("question", extended);
  assert.deepEqual(extended.explanation, question.explanation);
  assert.notEqual(await contentHash(extended), before);
  assert.equal(await contentHash(question), before);
  for (const directory of ["https://evil.test/", "../explanations/test/", "explanations/a/../test/", "explanations/%74est/", "explanations/test/?x=1"])
    assert.throws(() => schema("question", { ...question, detailedExplanationRef: { ...ref, directory } }));
  for (const initialParameters of [null, { expression: {} }, { value: null }, { value: "x".repeat(201) }])
    assert.throws(() => schema("question", { ...question, detailedExplanationRef: { ...ref, initialParameters } }));
});

test("detail routes carry only validated initial view parameters and stable question index", () => {
  const route: DetailRoute = { sessionId: "session-test", entryIndex: 12, from: "review",
    initialParameters: { choiceId: "choice-a", contentId: "comparison", step: 2, showAll: false } };
  assert.deepEqual(parseDetailRoute(detailRouteHash(route)), route);
  for (const hash of ["#/detail/test/-1/review", "#/detail/test/1/menu", "#/detail/test/9007199254740992/exam",
    "#/detail/%2Ftest/1/exam", "#/detail/test/1/review?initial=%7Bbad", "#/detail/test/1/review?initial=null"])
    assert.equal(parseDetailRoute(hash), undefined);
  assert.equal(validDetailParameters({ count: Infinity }), false);
  assert.equal(validDetailParameters(Object.fromEntries(Array.from({ length: 33 }, (_, i) => [`key${i}`, i]))), false);
});

test("manifest pins API, revision, local paths, file kinds and hashes", async () => {
  const { manifest } = await resourceFixture();
  validateDetailManifest(manifest);
  assert.throws(() => validateDetailManifest({ ...manifest, apiVersion: 2 }));
  assert.throws(() => validateDetailManifest({ ...manifest, files: [] }));
  assert.throws(() => validateDetailManifest({ ...manifest, files: [manifest.files[0], manifest.files[0]] }));
  assert.throws(() => validateDetailManifest({ ...manifest, files: [{ ...manifest.files[0], path: "../index.html" }] }));
  assert.throws(() => validateDetailManifest({ ...manifest, files: [{ ...manifest.files[0], mediaType: "text/javascript" }] }));
});

test("detail attribution resolves reviewed sources, authors and material permissions", async () => {
  const { manifest } = await resourceFixture(), bundle = fixture();
  validateDetailAttribution(manifest, bundle);
  for (const attribution of [
    { ...attr, origin: "official" as const }, { ...attr, creatorIds: ["unknown"] },
    { ...attr, rightsRefs: ["unknown"] },
    { ...attr, sourceRefs: [{ sourceId: "unknown", locator: { section: "test" } }] },
  ]) assert.throws(() => validateDetailAttribution({ ...manifest, attribution }, bundle));
  bundle.rights.find((right) => right.id === "rights-original")!.uses.browserDisplay = "unknown";
  assert.throws(() => validateDetailAttribution(manifest, bundle));
});

test("optional bibliography validates references without replacing material provenance or permissions", async () => {
  const { manifest } = await resourceFixture(), bundle = fixture();
  // Existing manifests do not require a bibliography.
  validateDetailManifest(manifest);
  validateDetailAttribution(manifest, bundle);
  const references = { title: "参考資料（定義・計算量の確認）", sourceRefs: [
    { sourceId: "source-nist-sort-quick", locator: { section: "Definition / Note" } },
  ] };
  const extended = { ...manifest, references };
  validateDetailManifest(extended);
  validateDetailAttribution(extended, bundle);
  for (const invalid of [
    { sourceRefs: references.sourceRefs }, { ...references, title: "" },
    { ...references, sourceRefs: [] },
    { ...references, sourceRefs: [references.sourceRefs[0], references.sourceRefs[0]] },
  ]) assert.throws(() => validateDetailManifest({ ...manifest, references: invalid }));
  assert.throws(() => validateDetailAttribution({ ...extended, references: {
    ...references, sourceRefs: [{ sourceId: "missing-source", locator: { section: "Definition" } }],
  } }, bundle));
  const unavailable = structuredClone(bundle);
  unavailable.sources.find(source => source.id === "source-nist-sort-quick")!.availability = "not_published";
  assert.throws(() => validateDetailAttribution(extended, unavailable));
  for (const origin of ["official", "adapted"] as const)
    assert.throws(() => validateDetailAttribution({ ...extended, attribution: { ...attr, origin } }, bundle));
  const denied = structuredClone(bundle);
  denied.rights.find(right => right.id === "rights-original")!.uses.browserDisplay = "unknown";
  assert.throws(() => validateDetailAttribution(extended, denied));
});

test("NIST bibliography, lesson rights and IPA question credits retain separate display scopes", () => {
  const bundle = fixture(), question = bundle.questions.find(q => q.id === "question-ipa-2026-a-2")!;
  const manifest: DetailManifest = JSON.parse(fs.readFileSync("public/explanations/ipa-2026-a-2/manifest.json", "utf8"));
  const references = renderToStaticMarkup(createElement(DetailReferences, { references: manifest.references!, bundle }));
  assert.match(references, /<h2[^>]*>参考資料（定義・計算量の確認）<\/h2>/);
  assert.equal((references.match(/<a /g) ?? []).length, 9);
  for (const ref of manifest.references!.sourceRefs) {
    const source = bundle.sources.find(s => s.id === ref.sourceId)!;
    assert(references.includes(source.url));
    assert(references.includes(source.title));
  }
  assert(!references.includes("IPA公開問題"));
  assert(!references.includes("ライセンス表記"));
  const lessonCredit = renderToStaticMarkup(createElement(AttributionLine, {
    content: { blocks: [], attribution: manifest.attribution }, bundle,
  }));
  assert.match(lessonCredit, /本プロジェクトの独自記述/);
  assert(lessonCredit.includes(bundle.rights.find(r => r.id === "rights-original")!.attributionText));
  assert(!lessonCredit.includes("xlinux.nist.gov"));
  const questionCredit = renderToStaticMarkup(createElement(QuestionFooter, {
    question, bundle, revealed: true, alwaysExpanded: true,
    onSource: () => {}, onLicenses: () => {},
  }));
  assert.match(questionCredit, /2026年度 基本情報技術者試験 科目A 問2/);
  assert.match(questionCredit, /情報処理推進機構（IPA）/);
  assert.match(questionCredit, /ライセンス表記/);
  assert(!questionCredit.includes("xlinux.nist.gov"));
  assert(!questionCredit.includes("参考資料（定義・計算量の確認）"));
});

test("distribution validates present packages and unlisted files without requiring missing optional directories", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-detail-"));
  try {
    const bundle = fixture(); bundle.questions[0].detailedExplanationRef = ref;
    assert.equal(await validateDetailPackages(bundle, root), 0);
    const directory = path.join(root, ref.directory);
    fs.mkdirSync(directory, { recursive: true });
    const { manifest, page } = await resourceFixture();
    fs.writeFileSync(path.join(directory, "manifest.json"), JSON.stringify(manifest));
    fs.writeFileSync(path.join(directory, "index.html"), page);
    assert.equal(await validateDetailPackages(bundle, root), 1);
    fs.writeFileSync(path.join(directory, "extra.js"), "unlisted");
    await assert.rejects(validateDetailPackages(bundle, root), /DETAIL_UNLISTED_FILE/);
    fs.unlinkSync(path.join(directory, "extra.js"));
    fs.writeFileSync(path.join(directory, "index.html"), "changed");
    await assert.rejects(validateDetailPackages(bundle, root), /DETAIL_PACKAGE/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("optional loading supports deployment subdirectories and does not fetch absent references", async () => {
  const { fetcher, requested } = await resourceFixture();
  assert.equal(await loadDetailPackage(undefined, appBase, undefined, fetcher), undefined);
  assert.equal(requested.length, 0);
  const loaded = await loadDetailPackage(ref, appBase, undefined, fetcher);
  assert(loaded);
  assert.deepEqual(requested, ["https://example.test/OpenCBT/explanations/question-test/manifest.json",
    "https://example.test/OpenCBT/explanations/question-test/index.html"]);
});

test("missing, incompatible, corrupt, excessive or cancelled detail resources are all unavailable", async () => {
  const { manifest, fetcher } = await resourceFixture();
  for (const response of [new Response("missing", { status: 404 }), new Response("<!doctype html>SPA fallback"),
    new Response(JSON.stringify({ ...manifest, revision: 2 })), new Response("{}"),
    new Response("", { headers: { "content-length": String(2097153) } })]) {
    assert.equal(await loadDetailPackage(ref, appBase, undefined, (async () => response.clone()) as typeof fetch), undefined);
  }
  const corrupt = (async (url: URL | RequestInfo) => String(url).endsWith("manifest.json")
    ? new Response(JSON.stringify(manifest)) : new Response("corrupt")) as typeof fetch;
  assert.equal(await loadDetailPackage(ref, appBase, undefined, corrupt), undefined);
  const cancelled = new AbortController(); cancelled.abort();
  const aborting = (async (_url: URL | RequestInfo, init?: RequestInit) => {
    init?.signal?.throwIfAborted(); return new Response("{}");
  }) as typeof fetch;
  assert.equal(await loadDetailPackage(ref, appBase, cancelled.signal, aborting), undefined);
  assert.equal(await loadDetailPackage({ ...ref, directory: "../bad/" }, appBase, undefined, fetcher), undefined);
});

test("detail context uses the saved generated values and shuffled choice IDs without mutations", async () => {
  const run = startRun(await prepareRun(fixture(), { subject: "B", kind: "mix", year: 2026,
    mode: "study", size: "public", bindingMode: "generated_values" }, {}, 100000), 100001);
  const question = run.issued[0], entry = run.session.entries[0];
  question.detailedExplanationRef = ref;
  entry.revealed = true;
  entry.choiceOrder.reverse();
  entry.selectedChoiceId = entry.choiceOrder[1];
  const route: DetailRoute = { sessionId: run.session.id, entryIndex: 0, from: "exam",
    initialParameters: { contentId: "choices", choiceId: entry.choiceOrder[2] } };
  const before = structuredClone(run), context = detailContext(run, route, "dark");
  assert.deepEqual(context.question, question);
  assert.deepEqual(context.generation?.parameters, run.instances[0].parameters);
  assert.deepEqual(context.choiceOrder.map((c) => c.id), entry.choiceOrder);
  assert.equal(context.choiceOrder[0].label, "ア");
  assert.equal(context.selectedChoiceId, entry.selectedChoiceId);
  assert.deepEqual(context.initialParameters, route.initialParameters);
  context.question.choices.reverse();
  context.generation!.parameters.values[0]++;
  assert.deepEqual(run, before);
  entry.revealed = false;
  assert.equal(canOpenDetail(run, 0, "exam"), false);
  assert.throws(() => detailContext(run, route, "light"));
  const completed = finishRun(run, "completed", 100010);
  assert.equal(canOpenDetail(completed, 0, "review"), true);
  assert.equal(detailContext(completed, { ...route, from: "review" }, "light").generation?.generatorRef.version,
    run.instances[0].generatorRef.version);
});

test("unbound annual questions pass saved original content with no generator parameters", async () => {
  const run = startRun(await prepareRun(fixture(), { subject: "A", kind: "annual", year: 2026,
    mode: "study", size: "public", bindingMode: "original_data" }, {}, 100000), 100001);
  run.issued[0].detailedExplanationRef = ref;
  run.session.entries[0].revealed = true;
  const context = detailContext(run, { sessionId: run.session.id, entryIndex: 0, from: "exam", initialParameters: {} }, "light");
  assert.equal(context.generation, null);
  assert.deepEqual(context.question, run.issued[0]);
});

test("sandbox replies require the exact frame, opaque origin, protocol and navigation token", () => {
  const source = {} as Window, token = "token-test";
  const event = { source, origin: "null", data: { type: "opencbt:detail:ready", apiVersion: 1, token } };
  assert.equal(detailMessage(event, source, token), "ready");
  assert.equal(detailMessage({ ...event, origin: "https://example.test" }, source, token), undefined);
  assert.equal(detailMessage(event, {} as Window, token), undefined);
  assert.equal(detailMessage(event, source, "other"), undefined);
  assert.equal(detailMessage({ ...event, data: { ...event.data, apiVersion: 2 } }, source, token), undefined);
});

test("sandbox resize accepts only authenticated positive integer content heights", () => {
  const source = {} as Window, token = "layout-token";
  const event = { source, origin: "null", data: { type: "opencbt:detail:resize", apiVersion: 1, token, height: 1524 } };
  assert.deepEqual(detailMessage(event, source, token), { type: "resize", height: 1524 });
  assert.deepEqual(detailMessage({ ...event, data: { ...event.data, height: 1 } }, source, token), { type: "resize", height: 1 });
  for (const height of [undefined, null, "1524", 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.equal(detailMessage({ ...event, data: { ...event.data, height } }, source, token), undefined);
  assert.equal(detailMessage({ ...event, origin: "https://example.test" }, source, token), undefined);
  assert.equal(detailMessage(event, {} as Window, token), undefined);
  assert.equal(detailMessage(event, null, token), undefined);
  assert.equal(detailMessage(event, source, "previous-mount"), undefined);
  assert.equal(detailMessage({ ...event, data: { ...event.data, apiVersion: 2 } }, source, token), undefined);
});

test("CSS preparation stays inert under main CSP without rewriting script strings or raw text", () => {
  const raw = '<!-- <style>comment</style> --><script>const s="<style>body{color:red}</style>";</script><textarea><style>text</style></textarea><title>literal <style></title>';
  const html = raw + '<STYLE media="screen > print" type="text/css">body{color:red}</STYLE><style>.a{color:green}</style>';
  const prepared = inertDetailHtml(html);
  assert(prepared.startsWith(raw));
  assert.equal((prepared.match(/type="text\/opencbt-prepared-css"/g) ?? []).length, 2);
  assert(prepared.includes('media="screen > print"'));
  assert(!prepared.slice(raw.length).match(/<style\b/i));
  assert(prepared.includes(btoa('body{color:red}')));
});
