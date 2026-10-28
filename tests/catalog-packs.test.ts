import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fixture } from "./fixtures";
import { encodeRecordPacks, compactDistribution, readDistributionBundle } from "../scripts/distribution-files";
import { catalogFileRecords, RECORD_FILE_MAX_BYTES, PACK_MAX_RECORDS } from "../src/core/catalog-files";
import { readCatalog } from "../src/core/catalog-reader";
import { contentHash } from "../src/core/hash";
import { validateBundle } from "../src/core/validation";

const digest = (raw: Uint8Array) => createHash("sha256").update(raw).digest("hex");

test("generation preparation reads packed inputs, revises only the requested series and preserves packed source/asset records", async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-packed-generation-")), root = path.join(temporary, "public/data");
  try {
    fs.cpSync(path.resolve("public/data"), root, { recursive: true });
    compactDistribution(root, 0);
    const before = readDistributionBundle(root);
    const oldPM = before.templates.filter(t => t.generatorRef.id.startsWith("generator-source-2017h29h-fe-pm-"));
    assert.equal(oldPM.length, 13, "selective refresh must include the complete new booklet in its preservation domain");
    assert(before.catalog.files.sources.every(f => f.recordCount));
    execFileSync(path.resolve("node_modules/.bin/tsx"), [path.resolve("scripts/prepare-generation-data.ts"), "--refresh-sources=sample-2022-apr-b-1"], { cwd: temporary, stdio: "pipe" });
    const after = readDistributionBundle(root);
    assert.deepEqual(after.questions.map(q => q.id), before.questions.map(q => q.id));
    assert.deepEqual(after.templates.map(t => t.id), before.templates.map(t => t.id));
    for (const files of Object.values(after.catalog.files)) assert(files.every(file => file.recordCount !== undefined));
    await validateBundle(after);
    assert.equal(after.questions.length, before.questions.length);
    assert.equal(after.templates.length, before.templates.length);
    assert.deepEqual(after.catalog.files.sources, before.catalog.files.sources);
    assert.deepEqual(after.catalog.files.assets, before.catalog.files.assets);
    for (const template of oldPM) {
      const preserved = after.templates.find(row => row.id === template.id)!;
      assert(preserved);
      assert.equal(await contentHash(preserved), await contentHash(template), template.id);
    }
    const pmBindings = (bundle: typeof before) => bundle.sets.find(set => set.id === "set-mix-b")!.generationBindings
      .filter(binding => binding.templateRef.id.startsWith("template-source-2017h29h-fe-pm-"))
      .sort((a, b) => a.templateRef.id.localeCompare(b.templateRef.id));
    assert.equal(pmBindings(before).length, 13);
    assert.deepEqual(pmBindings(after), pmBindings(before), "the current-B refresh retains old-PM coverage links");
    for (const id of ["set-annual-2017-spring-pm", "set-mix-2017-spring-pm"])
      assert.deepEqual(after.sets.find(set => set.id === id), before.sets.find(set => set.id === id));
    for (const q of before.questions) {
      const revised = after.questions.find(n => n.id === q.id)!;
      if (q.id === "question-template-source-sample-2022-apr-b-1") {
        assert.equal(revised.revision, q.revision + 1);
        const template = after.templates.find(t => t.baseQuestionRef.questionId === q.id)!;
        assert.equal(template.baseQuestionRef.revision, revised.revision);
        assert.equal(template.originalContentSha256, await contentHash(revised));
      } else {
        assert.equal(revised.revision, q.revision);
        assert.equal(await contentHash(revised), await contentHash(q));
      }
    }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});
test("generic generation refresh refuses explicit and bulk old-PM rebuilds before changing any packed input byte", () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-booklet-refresh-refusal-"));
  const root = path.join(temporary, "public/data");
  const snapshot = (directory: string): unknown[] => fs.readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name)).map(entry => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? { name: entry.name, directory: snapshot(file) }
        : { name: entry.name, bytes: fs.statSync(file).size, sha256: digest(fs.readFileSync(file)) };
    });
  try {
    fs.cpSync(path.resolve("public/data"), root, { recursive: true });
    compactDistribution(root, 0);
    const before = snapshot(root);
    for (const [argument, message] of [
      ["--refresh-sources=2017h29h-fe-pm-1", /Unknown refresh source 2017h29h-fe-pm-1/],
      ["--refresh-sources=2017h29a-fe-pm-1", /Unknown refresh source 2017h29a-fe-pm-1/],
      ["--refresh-all", /BOOKLET_REVIEW_REQUIRED: 2017h29[ha]-fe-pm-/],
      ["--refresh-additional", /BOOKLET_REVIEW_REQUIRED: 2017h29[ha]-fe-pm-/],
    ] as const) {
      assert.throws(() => execFileSync(path.resolve("node_modules/.bin/tsx"),
        [path.resolve("scripts/prepare-generation-data.ts"), argument], { cwd: temporary, stdio: "pipe" }),
      error => {
        const failure = error as Error & { status?: number; stderr?: Buffer };
        assert.equal(failure.status, 1);
        assert.match(String(failure.stderr), message);
        return true;
      });
      assert.deepEqual(snapshot(root), before, argument + " must leave all files and directories unchanged");
    }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});
const rawJson = (v: unknown) => Buffer.from(JSON.stringify(v));
function transport(records: unknown[], onlyQuestions = false) {
  const catalog = structuredClone(fixture().catalog);
  if (onlyQuestions) for (const kind of Object.keys(catalog.files)) catalog.files[kind] = [];
  const files = encodeRecordPacks("questions", records), raw = new Map(files.map(f => [f.entry.path, f.bytes]));
  catalog.files.questions = files.map(f => f.entry);
  raw.set("catalog.json", rawJson(catalog));
  return { catalog, files, raw, read: async (p: string) => raw.get(p) ?? fs.readFileSync("public/data/" + p) };
}

test("packing the actual distributed originals/bases preserves every revision, content hash and generator reference", async () => {
  const before = fixture(), t = transport(before.questions);
  const after = await readCatalog(t.read);
  assert.equal(after.questions.length, before.questions.length);
  assert.equal(t.files.length, Math.ceil(before.questions.length / PACK_MAX_RECORDS));
  const originals = new Map(before.questions.map(q => [q.id, q]));
  for (const q of after.questions) {
    assert.equal(q.revision, originals.get(q.id)!.revision);
    assert.equal(await contentHash(q), await contentHash(originals.get(q.id)));
  }
  assert.deepEqual(after.templates.map(t => t.id).sort(), before.templates.map(t => t.id).sort());
});

test("4,470 synthetic question records load in 70 question requests with no more than eight in flight", async ctx => {
  // Capacity/transport test only; repeated source content is never distributed
  // or claimed to be new learning questions.
  const source = fixture().questions.find(q => q.origin.kind === "official_reprint")!;
  const records = Array.from({ length: 4470 }, (_, i) => ({ ...source, id: `question-load-${i}` }));
  const t = transport(records, true), seen: string[] = [];
  let active = 0, maximum = 0;
  const start = performance.now();
  const b = await readCatalog(async p => {
    seen.push(p); maximum = Math.max(maximum, ++active);
    await new Promise<void>(resolve => setImmediate(resolve));
    const bytes = await t.read(p); active--;
    return bytes;
  }, async b => {
    assert.equal(b.questions.length, 4470);
    const ids = new Set(b.questions.map(q => q.id));
    assert.equal(ids.size, records.length);
    for (const q of b.questions) {
      const index = Number(q.id.replace("question-load-", ""));
      assert.deepEqual(q, records[index]);
    }
  });
  assert.equal(b.questions.length, 4470);
  assert.equal(seen.filter(p => p.startsWith("questions/")).length, 70);
  assert.equal(maximum, 8);
  assert(t.files.every(f => f.bytes.length <= RECORD_FILE_MAX_BYTES && f.entry.recordCount! <= 64));
  ctx.diagnostic(`4,470 records / 70 question files / ${Math.round(performance.now() - start)} ms locally; this is not a real-network latency guarantee.`);
});

test("record packs enforce count, object shape, byte limit, hashes and UTF-8 before validation", async () => {
  const t = transport([fixture().questions[0]], true), entry = t.files[0].entry;
  for (const value of [{}, [], [null], [[]], [{}, {}]]) assert.throws(() => catalogFileRecords(entry, value), { code: "RECORD_PACK" });
  assert.throws(() => catalogFileRecords({ ...entry, recordCount: undefined }, [{}]), { code: "RECORD_FILE" });
  assert.throws(() => catalogFileRecords({ ...entry, recordCount: 65 }, Array(65).fill({})), { code: "RECORD_PACK" });
  const damaged = Buffer.from(t.files[0].bytes); damaged[5] ^= 1;
  t.raw.set(entry.path, damaged);
  let validated = false;
  await assert.rejects(readCatalog(t.read, async () => { validated = true; }), { code: "FILE_HASH" });
  assert(!validated);
  await assert.rejects(readCatalog(async () => new Uint8Array(1048577)), { code: "SIZE" });
  assert.throws(() => encodeRecordPacks("questions", [{ text: "x".repeat(RECORD_FILE_MAX_BYTES) }]), /SIZE/);
  const large = encodeRecordPacks("questions", Array.from({ length: 5 }, (_, i) => ({ id: String(i), text: "x".repeat(600000) })));
  assert.deepEqual(large.map(f => f.entry.recordCount), [3, 2]);
});

test("the Node tools use the same pack protocol and compaction never removes unrelated files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-pack-"));
  try {
    const catalog = structuredClone(fixture().catalog);
    for (const kind of Object.keys(catalog.files)) catalog.files[kind] = [];
    fs.mkdirSync(path.join(root, "questions"));
    const qs = fixture().questions.slice(0, 2);
    catalog.files.questions = qs.map((q, i) => {
      const raw = rawJson(q), relative = `questions/test-${i}.json`;
      fs.writeFileSync(path.join(root, relative), raw);
      return { path: relative, sha256: digest(raw) };
    });
    fs.writeFileSync(path.join(root, "catalog.json"), rawJson(catalog));
    fs.writeFileSync(path.join(root, "unrelated.txt"), "keep");
    assert(compactDistribution(root, 0));
    const packed = readDistributionBundle(root);
    assert.equal(packed.catalog.revision, catalog.revision + 1);
    assert.deepEqual(packed.questions.map(q => q.id).sort(), qs.map(q => q.id).sort());
    assert(!fs.existsSync(path.join(root, "questions/test-0.json")));
    assert.equal(fs.readFileSync(path.join(root, "unrelated.txt"), "utf8"), "keep");
    assert.equal(compactDistribution(root, 0), false);
    const file = packed.catalog.files.questions[0];
    const invalid = Buffer.from('[{"id":"bad-\xff"}]', "latin1");
    fs.writeFileSync(path.join(root, file.path), invalid);
    file.sha256 = digest(invalid); file.recordCount = 1;
    fs.writeFileSync(path.join(root, "catalog.json"), rawJson(packed.catalog));
    assert.throws(() => readDistributionBundle(root), /encoded data|UTF-8/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
