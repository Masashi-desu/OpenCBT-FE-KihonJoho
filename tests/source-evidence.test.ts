import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { validateSourceEvidence, verifyCachedPapers, type SourceEvidence } from "../scripts/verify-source-evidence";

const readEvidence = () => JSON.parse(fs.readFileSync("scripts/source-evidence/ipa-pre-2023.json", "utf8")) as SourceEvidence;

test("acquisition evidence keeps spring/autumn/special and sample publication dates separate", () => {
  const evidence = readEvidence(), papers = validateSourceEvidence(evidence);
  assert.equal(papers.length, 93);
  for (let year = 2009; year <= 2019; year++) {
    const sets = evidence.collections.filter(c => c.year === year);
    assert.equal(sets.length, 4);
    for (const period of [year === 2011 ? "特別" : "春期", "秋期"])
      assert.deepEqual(sets.filter(c => c.period === period).map(c => c.timeSlot).sort(), ["午前", "午後"]);
    assert(sets.filter(c => c.timeSlot === "午前").every(c => c.questionNumbers.length === 80 && c.answerKey?.length === 80));
    assert(sets.filter(c => c.timeSlot === "午後").every(c => c.questionNumbers.length === 13 && !c.answerKey));
  }
  const samples = evidence.collections.filter(c => c.kind === "sample");
  assert.deepEqual(samples.map(c => c.questionNumbers.length).sort((a, b) => a - b), [6, 20, 60]);
  assert(samples.every(c => c.year === undefined));
});

test("an official answer table with no correct answer or unordered blanks is never flattened into one answer", () => {
  const evidence = readEvidence();
  const afternoon = evidence.collections.find(c => c.id === "2019r01a-fe-pm")!;
  assert(afternoon);
  assert.equal(afternoon.answerKey, undefined);
  afternoon.answerKey = Array(13).fill("ア");
  assert.throws(() => validateSourceEvidence(evidence), /SOURCE_EVIDENCE_COMPOUND/);
});

test("acquisition checks cannot certify content, third-party rights or generation", () => {
  const evidence = readEvidence();
  evidence.collections[0].review.thirdParty = "confirmed";
  assert.throws(() => validateSourceEvidence(evidence), /SOURCE_EVIDENCE_REVIEW/);
  const external = readEvidence();
  external.collections[0].questionPaper.url = "https://example.org/past-paper.pdf";
  assert.throws(() => validateSourceEvidence(external), /SOURCE_EVIDENCE_URL/);
  const duplicate = readEvidence();
  duplicate.collections.push(duplicate.collections[0]);
  assert.throws(() => validateSourceEvidence(duplicate), /SOURCE_EVIDENCE_DUPLICATE/);
});

test("cached paper verification rejects changed bytes even when the name and byte length match", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-source-evidence-test-"));
  try {
    const raw = Buffer.from("%PDF-1.4\nsource-A"), file = path.join(dir, "paper.pdf");
    fs.writeFileSync(file, raw);
    const papers = [{ url: "https://www.ipa.go.jp/test.pdf", sha256: createHash("sha256").update(raw).digest("hex"), byteLength: raw.byteLength, pageCount: 1 }];
    assert.equal(verifyCachedPapers(papers, dir), 1);
    fs.writeFileSync(file, Buffer.from("%PDF-1.4\nsource-B"));
    assert.throws(() => verifyCachedPapers(papers, dir), /SOURCE_EVIDENCE_CACHE/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
