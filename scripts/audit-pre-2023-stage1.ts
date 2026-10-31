import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { auditPre2023Readiness } from "./audit-pre-2023-readiness";
import { readDistributionBundle } from "./distribution-files";
import type { SourceEvidence } from "./verify-source-evidence";

// User-authorized stage1 scope, independent of catalog/review omissions.
export const stage1ContentScope = Object.freeze([
  ...["2017h29h-fe-am", "2017h29a-fe-am", "2018h30h-fe-am", "2018h30a-fe-am", "2019h31h-fe-am", "2019r01a-fe-am"]
    .map(id => Object.freeze({ id, count: 80 })),
  Object.freeze({ id: "2022-apr-sample-b", count: 6 }),
  Object.freeze({ id: "2022-dec-sample-a", count: 60 }),
  Object.freeze({ id: "2022-dec-sample-b", count: 20 }),
]);
type FullReadiness = ReturnType<typeof auditPre2023Readiness>;
/** Content-only view. App flows, actual test execution and selected-main
 * integration are separate gates. The complete-scope audit is unchanged. */
export function stage1ContentReadiness(full: FullReadiness) {
  const collections = stage1ContentScope.map(expected => {
    const matching = full.collections.filter(c => c.id === expected.id);
    if (matching.length !== 1) throw Error(`STAGE1_SCOPE: ${expected.id}`);
    const collection = matching[0];
    if (collection.count !== expected.count || collection.questions.length !== expected.count ||
        new Set(collection.questions.map(q => q.number)).size !== expected.count ||
        collection.questions.some(q => !Number.isInteger(q.number) || q.number < 1 || q.number > expected.count))
      throw Error(`STAGE1_COUNT: ${expected.id}`);
    const questions = collection.questions.map(q => ({ ...q, pending: [...new Set([
      ...q.pending,
      ...(!q.questionId ? ["missing_original"] : []),
      ...(!q.originalSemanticsReviewed ? ["originalSemantics"] : []),
    ])] }));
    return { ...collection, questions, ready: questions.filter(q => q.pending.length === 0).length };
  });
  const questions = collections.flatMap(c => c.questions);
  const ready = questions.filter(q => q.pending.length === 0).length;
  const missingByCheck = Object.fromEntries([...new Set(questions.flatMap(q => q.pending))].sort()
    .map(check => [check, questions.filter(q => q.pending.includes(check)).length]));
  return {
    status: ready === 566 ? "ready" as const : "not_ready" as const,
    scope: "stage1_content_only" as const,
    summary: { collections: 9, requestedUnits: 566, legacyMorningUnits: 480, sampleUnits: 86, ready },
    collections, missingByCheck,
    fullScope: { status: full.status, summary: { ...full.summary } },
    completionNote: "内容・登録・査読の部分判定。実テスト、通常Appの表示・保存・履歴、最新main候補の検証を別に完了する。全範囲のreadinessは変更しない。",
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const evidence = JSON.parse(fs.readFileSync(new URL("./source-evidence/ipa-pre-2023.json", import.meta.url), "utf8")) as SourceEvidence;
  const report = stage1ContentReadiness(auditPre2023Readiness(readDistributionBundle(), evidence));
  if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Stage1 content: ${report.summary.ready}/${report.summary.requestedUnits} ready across ${report.summary.collections} collections`);
    console.log(JSON.stringify({ missingByCheck: report.missingByCheck, fullScope: report.fullScope }, null, 2));
    console.log(report.completionNote);
  }
  if (report.status !== "ready") process.exitCode = 1;
}
