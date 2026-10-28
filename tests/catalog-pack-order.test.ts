import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { compactDistribution, readDistributionBundle, encodeRecordPacks } from "../scripts/distribution-files";
import { catalogKinds, PACK_MAX_RECORDS, RECORD_FILE_MAX_BYTES } from "../src/core/catalog-files";

const digest = (raw: Uint8Array) => createHash("sha256").update(raw).digest("hex");
const json = (value: unknown) => Buffer.from(JSON.stringify(value) + "\n");

function copyListedMetadata(root: string, halfPacks = false) {
  const source = path.resolve("public/data"), raw = fs.readFileSync(path.join(source, "catalog.json")),
    catalog = JSON.parse(raw.toString("utf8"));
  if (halfPacks) {
    // A valid isolated 32-record layout works whether the real distribution
    // currently uses singletons or packs. No category exceeds 500 files.
    const actual = readDistributionBundle(source);
    for (const kind of catalogKinds) {
      const packs = [];
      for (let offset = 0; offset < actual[kind].length; offset += 32)
        packs.push(...encodeRecordPacks(kind, actual[kind].slice(offset, offset + 32)));
      assert(packs.length <= 500);
      catalog.files[kind] = packs.map(pack => pack.entry);
      for (const pack of packs) {
        const destination = path.join(root, pack.entry.path);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, pack.bytes);
      }
    }
    fs.writeFileSync(path.join(root, "catalog.json"), json(catalog));
    return;
  }
  fs.writeFileSync(path.join(root, "catalog.json"), raw);
  for (const kind of catalogKinds) for (const file of catalog.files[kind]) {
    const destination = path.join(root, file.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(source, file.path), destination);
  }
}

test("default compaction preserves the actual seven record arrays while changing only the catalog transport", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-pack-order-"));
  try {
    copyListedMetadata(root, true);
    const before = readDistributionBundle(root);
    assert(compactDistribution(root));
    const after = readDistributionBundle(root);
    for (const kind of catalogKinds) {
      assert.deepEqual(after[kind], before[kind], kind + " keeps exact record order and values");
      assert(after.catalog.files[kind].every(file => file.recordCount !== undefined));
      assert(after.catalog.files[kind].length <= 500);
      for (const file of after.catalog.files[kind]) {
        const raw = fs.readFileSync(path.join(root, file.path)), records = JSON.parse(raw.toString("utf8"));
        assert.equal(digest(raw), file.sha256);
        assert.equal(records.length, file.recordCount);
        assert(records.length <= PACK_MAX_RECORDS);
        assert(raw.length <= RECORD_FILE_MAX_BYTES);
      }
    }
    const { files: oldFiles, revision: oldRevision, ...oldMetadata } = before.catalog,
      { files: newFiles, revision: newRevision, ...newMetadata } = after.catalog;
    assert.deepEqual(newMetadata, oldMetadata);
    assert.equal(newRevision, oldRevision + 1);
    assert.notDeepEqual(newFiles, oldFiles);
    assert.notEqual(after.catalogHash, before.catalogHash);
    const metadataRequests = Object.values(newFiles).reduce((sum, files) => sum + files.length, 1);
    const oldRequests = Object.values(oldFiles).reduce((sum, files) => sum + files.length, 1);
    assert(metadataRequests < oldRequests);
    const saved = fs.readFileSync(path.join(root, "catalog.json"));
    assert.equal(compactDistribution(root), false);
    assert.deepEqual(fs.readFileSync(path.join(root, "catalog.json")), saved);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("an incremental single record is repacked after existing records without an ID sort or catalog churn", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-pack-append-"));
  try {
    copyListedMetadata(root);
    compactDistribution(root);
    const first = readDistributionBundle(root), catalog = structuredClone(first.catalog);
    // Transport-only synthetic record. It is never admitted or distributed as
    // a learning question and makes sorted-vs-catalog order observably distinct.
    const added = { ...first.sources[0], id: "0-order-probe" }, raw = json(added), relative = "sources/order-probe.json";
    fs.writeFileSync(path.join(root, relative), raw);
    catalog.files.sources.push({ path: relative, sha256: digest(raw) });
    fs.writeFileSync(path.join(root, "catalog.json"), json(catalog));
    assert(compactDistribution(root));
    const next = readDistributionBundle(root);
    assert.deepEqual(next.sources, [...first.sources, added]);
    for (const kind of catalogKinds.filter(kind => kind !== "sources")) {
      assert.deepEqual(next[kind], first[kind]);
      assert.deepEqual(next.catalog.files[kind], first.catalog.files[kind]);
    }
    assert(!fs.existsSync(path.join(root, relative)));
    assert.equal(next.catalog.revision, catalog.revision + 1);
    assert.equal(compactDistribution(root), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
