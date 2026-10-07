import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { fixture } from "./fixtures";
import {
  readLicenseNotices,
  validateLicenseNotices,
} from "../scripts/licenses";
import { validateSourceInventory } from "../scripts/source-inventory";
import answerKeys from "./fixtures/official-answer-keys.json";
import { validateBundle } from "../src/core/validation";

test("declared scope cannot be reduced by deleting an original and its generator", () => {
  const b = fixture();
  assert.deepEqual(validateSourceInventory(b), {
    declared: 104,
    included: 103,
    excluded: 1,
  });
  b.questions = b.questions.filter((q) => q.id !== "question-ipa-2026-a-1");
  assert.throws(() => validateSourceInventory(b), /SOURCE_INVENTORY/);
});
test("all distributed original answers match independently extracted official answer keys", () => {
  const b = fixture();
  let checked = 0;
  for (const key of answerKeys) {
    assert.equal(
      b.sources.find((s) => s.id === key.sourceId)!.sha256,
      key.sha256,
    );
    for (const [i, label] of key.answers.entries()) {
      const q = b.questions.find(
        (q) =>
          q.id ===
          `question-${key.sourceId.replace("source-", "").replace("-ans", "")}-${i + 1}`,
      );
      assert(q, `${key.sourceId}:${i + 1}`);
      const answer = q.choices.find((c) => c.id === q.correctAnswer.choiceId)!
        .content.blocks[0];
      assert(answer.type === "paragraph");
      assert.equal(answer.text, label, q.id);
      assert.equal(q.correctAnswer.attribution.origin, "official");
      checked++;
    }
  }
  assert.equal(checked, 103);
});
test("license validation rejects notice damage, dependency changes and unlisted bundle packages", () => {
  const root = process.cwd(),
    notices = readLicenseNotices(root);
  validateLicenseNotices(root);
  const damaged = structuredClone(notices);
  damaged[0].sha256 = "0".repeat(64);
  assert.throws(
    () => validateLicenseNotices(root, [], damaged),
    /LICENSE_HASH/,
  );
  const wrongVersion = structuredClone(notices);
  wrongVersion.find((n) => n.packageName === "react")!.version = "0.0.0";
  assert.throws(
    () => validateLicenseNotices(root, [], wrongVersion),
    /LICENSE_VERSION/,
  );
  const wrongUpstream = structuredClone(notices);
  wrongUpstream.find((n) => n.packageName === "react")!.upstreamFiles = [
    "README.md",
  ];
  assert.throws(
    () => validateLicenseNotices(root, [], wrongUpstream),
    /LICENSE_TEXT/,
  );
  const missingReact = notices.filter((n) => n.packageName !== "react");
  assert.throws(
    () => validateLicenseNotices(root, [], missingReact),
    /LICENSE_COVERAGE/,
  );
  const packagePath = fs.mkdtempSync(
    path.join(os.tmpdir(), "opencbt-license-review-"),
  );
  try {
    fs.writeFileSync(
      path.join(packagePath, "package.json"),
      JSON.stringify({
        name: "unlisted-transitive-helper",
        version: "1.0.0",
        license: "MIT",
      }),
    );
    assert.throws(
      () => validateLicenseNotices(root, [packagePath]),
      /LICENSE_COVERAGE/,
    );
  } finally {
    fs.rmSync(packagePath, { recursive: true });
  }
  const lucide = notices.find((n) => n.packageName === "lucide-react")!;
  assert.equal(lucide.licenseId, "ISC AND MIT");
  assert.match(
    fs.readFileSync(`public/notices/${lucide.file}`, "utf8"),
    /Feather/,
  );
  for (const n of notices)
    assert.equal(
      createHash("sha256")
        .update(fs.readFileSync(`public/notices/${n.file}`))
        .digest("hex"),
      n.sha256,
    );
});
test("adaptation cannot discard original rights or disguise inherited expression as independent", async () => {
  const stripped = fixture(),
    q = stripped.questions.find(
      (q) => q.id === "question-template-source-2026-a-1",
    )!;
  q.prompt.attribution.rightsRefs = ["rights-original"];
  await assert.rejects(validateBundle(stripped), {
    code: "RIGHTS_INHERITANCE",
  });
  const disguised = fixture();
  const adapted = disguised.questions.find(
    (r) => r.id === "question-template-source-2026-a-1",
  )!;
  adapted.prompt.attribution.origin = "original";
  await assert.rejects(validateBundle(disguised), {
    code: "RIGHTS_PROVENANCE",
  });
  const missing = fixture(),
    dependent = missing.questions.find(
      (r) => r.id === "question-template-source-2026-a-1",
    )!;
  dependent.origin.sourceRefs[0].locator.questionNumber = "2";
  await assert.rejects(validateBundle(missing), { code: "SOURCE_INHERITANCE" });
});
