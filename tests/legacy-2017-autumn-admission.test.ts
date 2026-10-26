import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { contentHash } from "../src/core/hash";
import { inventory2017AutumnAfternoon, build2017AutumnAfternoonCandidate, autumn2017AssetPages,
  autumn2017Crop, Autumn2017StageError, type Autumn2017OfficialPacket } from "../scripts/stage-2017-autumn-afternoon";
import { prepared2017AutumnAfternoon } from "./fixtures/prepared-2017-autumn-afternoon";
import { apply2017AutumnPublicMetadata } from "../scripts/stage-2017-autumn-afternoon-public-metadata";
import { autumn2017LearningPayload } from "../scripts/stage-2017-autumn-afternoon";

test("Autumn admission keeps13 targets, source-specific90 materials and independent corrected p81 pin", async () => {
  assert.deepEqual(autumn2017AssetPages.map(pages => pages.length),[3,4,5,5,6,5,5,10,7,5,9,10,16]);
  assert.equal(autumn2017AssetPages.flat().length,90);
  assert.deepEqual(autumn2017AssetPages[11],[64,65,66,67,79,80,81,82,83,84]);
  assert.equal(autumn2017Crop.webp,"5a2b6a5dc3e28214571e8bc82341f584a8c1969a1d327e3dc65333127d86aa5e");
  const report = await inventory2017AutumnAfternoon([]);
  assert.equal(report.expectedMajors,13); assert.equal(report.preparedMajors,0); assert.equal(report.normalAppRegistered,0);
  assert.equal(report.rows.length,13); assert.equal(report.status,"incomplete");
  assert.equal(report.issues.filter(issue => issue.startsWith("missing_autumn_major:")).length,13);
  assert(report.issues.includes("autumn_official_packet_missing"));
  await assert.rejects(build2017AutumnAfternoonCandidate([],undefined as unknown as Autumn2017OfficialPacket),Autumn2017StageError);
});
test("Local schema/generator success cannot waive rights/review or write a partial Autumn catalog", async () => {
  const before = await contentHash(fs.readFileSync("public/data/catalog.json"));
  const rows = await prepared2017AutumnAfternoon();
  const inputs = rows.map(({ number,records }) => ({ number,prepared:records,assetsRoot:process.cwd()+"/output/nonexistent-unadmitted-assets" }));
  const recordHashes = await Promise.all(inputs.map(input => contentHash(input.prepared)));
  const report = await inventory2017AutumnAfternoon(inputs);
  assert.equal(report.preparedMajors,13); assert.equal(report.normalAppRegistered,0); assert.equal(report.status,"incomplete");
  assert(report.issues.some(issue => issue.includes("unreviewed_autumn_question") || issue.includes("unverified_autumn_material_rights")));
  assert.equal(report.issues.filter(issue => issue.startsWith("autumn_major_review_missing_or_stale:")).length,13);
  await assert.rejects(build2017AutumnAfternoonCandidate(inputs,undefined as unknown as Autumn2017OfficialPacket),Autumn2017StageError);
  assert.deepEqual(await Promise.all(inputs.map(input => contentHash(input.prepared))),recordHashes);
  assert.equal(await contentHash(fs.readFileSync("public/data/catalog.json")),before);
});
test("Autumn shape inspection rejects foreign source/right/image references even when local review flags are set", async () => {
  const records = (await prepared2017AutumnAfternoon())[5].records;
  // Only a local test carrier: no evidence receipt or assets is supplied, so
  // even this positive shape remains globally incomplete and cannot be admitted.
  const carrier = structuredClone(records);
  for (const q of carrier.questions) for (const key of Object.keys(q.review.checks) as (keyof typeof q.review.checks)[]) q.review.checks[key] = "pass";
  for (const right of carrier.rights) {
    right.uses = { repositoryRedistribution:"allowed",browserDisplay:"allowed",adaptation:"allowed" };
    right.thirdParty.status = "none_identified";
  }
  carrier.templates[0].originalContentSha256 = await contentHash(carrier.questions.find(q => q.origin.kind === "official_adaptation")!);
  const inspect = (prepared: typeof carrier) => inventory2017AutumnAfternoon([{ number:6,prepared,assetsRoot:process.cwd()+"/output/nonexistent-unadmitted-assets" }]);
  const positive = await inspect(carrier);
  assert.equal(positive.status,"incomplete");
  assert(!positive.issues.some(issue => issue.startsWith("autumn_major_shape:6:")),"real current source graph passes only the shape step");
  for (const mode of ["source", "right", "asset", "document", "context"]) {
    const changed = structuredClone(carrier);
    if (mode === "source") changed.questions[0].prompt.attribution.sourceRefs[0].sourceId = "source-other-booklet";
    if (mode === "right") changed.questions[0].prompt.attribution.rightsRefs[0] = "rights-other-booklet";
    if (mode === "asset") { const block = changed.questions[0].prompt.blocks[0]; assert(block.type === "image"); block.assetId = "asset-unreviewed-full-paper"; }
    if (mode === "document") changed.sources[0].sha256 = "0".repeat(64);
    if (mode === "context") changed.questions[0].contextRefs = ["context-missing"];
    const report = await inspect(changed);
    assert(report.issues.some(issue => issue.startsWith("autumn_major_shape:6:")),mode);
    assert.equal(report.normalAppRegistered,0); assert.equal(report.status,"incomplete");
  }
});
test("Autumn public metadata preserves all material and refuses to normalize an unreviewed hold or changed source limitation", async () => {
  const records = (await prepared2017AutumnAfternoon())[5].records;
  const held = structuredClone(records), before = await contentHash(held);
  assert.throws(() => apply2017AutumnPublicMetadata(6,held),/cannot_waive_material_hold/);
  assert.equal(await contentHash(held),before);
  const carrier = structuredClone(records);
  for (const q of carrier.questions) for (const key of Object.keys(q.review.checks) as (keyof typeof q.review.checks)[]) q.review.checks[key] = "pass";
  for (const right of carrier.rights) { right.uses = { repositoryRedistribution:"allowed",browserDisplay:"allowed",adaptation:"allowed" }; right.thirdParty.status = "none_identified"; }
  const rights = structuredClone(carrier.rights), assets = structuredClone(carrier.assets), payloads = carrier.questions.map(autumn2017LearningPayload);
  const changed = structuredClone(carrier); changed.sources[0].limits += " 新たな未確認条件";
  const changedBefore = await contentHash(changed);
  assert.throws(() => apply2017AutumnPublicMetadata(6,changed),/source_limits_changed_requires_review/);
  assert.equal(await contentHash(changed),changedBefore);
  const edits = apply2017AutumnPublicMetadata(6,carrier);
  assert(edits.length > 0); assert.deepEqual(carrier.rights,rights); assert.deepEqual(carrier.assets,assets);
  assert.deepEqual(carrier.questions.map(autumn2017LearningPayload),payloads);
  assert(carrier.questions.every(q => q.distribution === "excluded"));
  assert(carrier.sources.every(source => typeof source.limits === "string" && !/excluded|準備|未受入/.test(source.limits)));
});
