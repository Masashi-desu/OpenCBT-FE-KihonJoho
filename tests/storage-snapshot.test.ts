import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fixture } from "./fixtures";
import { prepareSnapshot } from "../src/core/storage-snapshot";

test("snapshot identity covers the complete unissued catalog and does not alter the input", async () => {
  const bundle = fixture(), before = JSON.stringify(bundle), a = await prepareSnapshot("session-one", bundle, {});
  assert.equal(a.snapshot.bundleKey, createHash("sha256").update(before).digest("hex"));
  assert.equal(JSON.stringify(bundle), before);
  const otherSession = await prepareSnapshot("session-two", structuredClone(bundle), {});
  assert.equal(a.snapshot.bundleKey, otherSession.snapshot.bundleKey);
  assert.notEqual(a.snapshot.id, otherSession.snapshot.id);
  const changed = structuredClone(bundle);
  changed.questions.at(-1)!.review.notes += "（検証用の変更）";
  assert.notEqual(a.snapshot.bundleKey, (await prepareSnapshot("session-three", changed, {})).snapshot.bundleKey);
});

test("withdrawal lookup includes every original and all derived references, including unissued content", async () => {
  const bundle = fixture(), model = bundle.questions[0];
  const original = structuredClone(model), derived = structuredClone(model), unissued = structuredClone(model);
  original.id = "question-review-original"; original.revision = 1; original.origin.derivedFrom = [];
  derived.id = "question-review-base"; derived.revision = 2;
  derived.origin.derivedFrom = [
    { questionId: "question-review-original", revision: 1 },
    { questionId: "question-review-earlier", revision: 7 },
    { questionId: "question-review-earlier", revision: 7 },
  ];
  unissued.id = "question-review-unissued"; unissued.revision = 4;
  unissued.origin.derivedFrom = [{ questionId: "question-review-original", revision: 1 }];
  bundle.questions = [original, derived, unissued];
  const prepared = await prepareSnapshot("session-one", bundle, {});
  assert.deepEqual([...prepared.shared.questionRefs].sort(), [
    "question-review-base@2", "question-review-earlier@7", "question-review-original@1", "question-review-unissued@4",
  ]);

});

test("identical Blob bytes share content while MIME and question asset IDs survive", async () => {
  const bytes = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const first = new Blob([bytes], { type: "image/png" }), second = new Blob([bytes], { type: "image/png" }),
    otherType = new Blob([bytes], { type: "image/webp" });
  const { snapshot, assets } = await prepareSnapshot("session-assets", fixture(), {
    "asset-one": first, "asset-two": second, "asset-other-type": otherType,
  });
  const expectedHash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(snapshot.assetRefs["asset-one"], `${expectedHash}:image/png`);
  assert.equal(snapshot.assetRefs["asset-two"], snapshot.assetRefs["asset-one"]);
  assert.notEqual(snapshot.assetRefs["asset-other-type"], snapshot.assetRefs["asset-one"]);
  assert.equal(snapshot.assetKeys.length, 2);
  assert.deepEqual(Object.keys(snapshot.assetRefs), ["asset-one", "asset-two", "asset-other-type"]);
  for (const asset of assets) assert.deepEqual(new Uint8Array(await asset.blob.arrayBuffer()), bytes);
  const different = await prepareSnapshot("session-assets", fixture(), { "asset-one": new Blob([Uint8Array.of(0)]) });
  assert.notEqual(different.snapshot.assetRefs["asset-one"], snapshot.assetRefs["asset-one"]);
});
