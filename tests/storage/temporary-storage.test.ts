import test from "node:test";
import assert from "node:assert/strict";
import { TemporaryStorage } from "../../src/core/temporary-storage";
import { fixture, installFixtureGenerators } from "../fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, touch, RETENTION_MS } from "../../src/core/session";
import { makeBookmark } from "../../src/core/bookmarks";
await installFixtureGenerators();
const bundle = fixture(), question = bundle.questions.find(q => q.id === "question-ipa-2017h29h-fe-am-20")!;
const initial = startRun(await prepareRun(bundle, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: question.id, revision: question.revision } }, {}));

test("temporary records preserve generated conditions, choices, answers and results without sharing mutable run objects", () => {
  const store = new TemporaryStorage(), run = finishRun(updateAnswer(initial, initial.issued[0].choices[0].id), "completed");
  store.save(run);
  const exact = JSON.stringify(run); run.session.entries[0].selectedChoiceId = "changed";
  assert.equal(JSON.stringify(store.load(run.session.id)), exact);
  const loaded = store.load(run.session.id); loaded.issued[0].choices.reverse();
  assert.equal(JSON.stringify(store.load(run.session.id)), exact);
  assert.deepEqual(store.recent(), JSON.parse(exact).instances);
  assert.deepEqual(store.history()[0].result, JSON.parse(exact).result);
});

test("temporary revisions reject stale updates and references, and a new tab starts empty", () => {
  const store = new TemporaryStorage(); store.save(initial);
  assert.throws(() => store.save(initial), /既に記録/);
  const next = touch(structuredClone(initial)); store.save(next);
  assert.equal(store.load(initial.session.id).session.revision, next.session.revision);
  assert.throws(() => new TemporaryStorage().load(initial.session.id), /一時記録がありません/);
  assert.equal(new TemporaryStorage().history().length, 0);
});

test("temporary bookmarks keep batch counts, existing identities, detached reads and independent deletion", () => {
  const store = new TemporaryStorage(), mark = makeBookmark(bundle, { questionId: question.id, revision: question.revision });
  assert.equal(store.saveBookmarks([mark, mark]), 1);
  assert.equal(store.saveBookmarks([{ ...mark, title: "replacement" }]), 0);
  const read = store.listBookmarks(); read[0].title = "mutated";
  assert.equal(store.listBookmarks()[0].title, mark.title);
  store.save(initial); store.deleteRuns(); assert.equal(store.listBookmarks().length, 1);
  store.deleteBookmark(mark.id); assert.equal(store.listBookmarks().length, 0);
});

test("temporary retention and withdrawal checks include unissued content and keep unrelated records isolated", () => {
  const store = new TemporaryStorage(); store.save(initial);
  const next = structuredClone(initial); next.session.id = "session-temporary-second"; store.save(next);
  store.link(initial.session.id, next.session.id);
  assert.equal(store.history().find(r => r.id === initial.session.id)?.replacementSessionId, next.session.id);
  store.deleteRuns([next.session.id]); assert.equal(store.history().length, 1);
  const policy = structuredClone(bundle), unissued = bundle.questions.find(q => !initial.issued.some(i => i.id === q.id))!;
  policy.catalog.withdrawals.push({ questionRef: { questionId: unissued.id, revision: unissued.revision }, category: "conditions_changed", reason: "test", recordedOn: "2026-11-04" });
  store.maintain(policy, RETENTION_MS); assert.equal(store.history().length, 0);
  const expired = structuredClone(initial); expired.session.updatedAt = new Date(Date.now() - RETENTION_MS - 1).toISOString(); store.save(expired);
  store.maintain(bundle, RETENTION_MS); assert.equal(store.history().length, 0);
});
