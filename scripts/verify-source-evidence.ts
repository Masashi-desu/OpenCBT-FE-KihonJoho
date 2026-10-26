import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

type Paper = { url: string; sha256: string; byteLength: number; pageCount: number };
export type SourceEvidence = {
  checkedOn: string;
  status: string;
  distribution: string;
  policies: { url: string }[];
  collections: {
    id: string; kind: string; year?: number; period?: string; timeSlot?: string;
    publishedOn?: string; subject?: string; listedAt: string;
    questionPaper: Paper; answerPaper: Paper; questionNumbers: number[]; answerKey?: string[];
    review: Record<string, string>;
  }[];
};

function officialURL(value: string, pdf = false) {
  const u = new URL(value);
  if (u.protocol !== "https:" || u.hostname !== "www.ipa.go.jp" || u.port || u.username || u.password || u.search || u.hash ||
    (pdf && !u.pathname.endsWith(".pdf"))) throw Error(`SOURCE_EVIDENCE_URL: ${value}`);
}

/** This validates acquisition evidence, never a question's rights or correctness. */
export function validateSourceEvidence(evidence: SourceEvidence): Paper[] {
  if (evidence.status !== "preparation_only" || evidence.distribution !== "excluded")
    throw Error("SOURCE_EVIDENCE_STATUS: 調査資料を配布済みと扱わないでください");
  const ids = new Set<string>(), papers = new Map<string, Paper>();
  for (const policy of evidence.policies) officialURL(policy.url);
  for (const c of evidence.collections) {
    if (ids.has(c.id)) throw Error(`SOURCE_EVIDENCE_DUPLICATE: ${c.id}`);
    ids.add(c.id);
    officialURL(c.listedAt);
    if (c.kind === "past_exam") {
      if (!c.year || c.year >= 2023 || !c.period || !["午前", "午後"].includes(c.timeSlot ?? ""))
        throw Error(`SOURCE_EVIDENCE_POSITION: ${c.id}`);
    } else if (c.kind === "sample") {
      if (c.year !== undefined || !c.publishedOn || !c.subject)
        throw Error(`SOURCE_EVIDENCE_SAMPLE_DATE: ${c.id}`);
    } else throw Error(`SOURCE_EVIDENCE_KIND: ${c.id}`);
    if (c.review.publication !== "confirmed" || ["transcription", "thirdParty", "semantics", "generation"].some(k => c.review[k] !== "pending"))
      throw Error(`SOURCE_EVIDENCE_REVIEW: ${c.id}: 取得確認を内容査読へ自動昇格しません`);
    if (!c.questionNumbers.length || c.questionNumbers.some((n, i) => n !== i + 1))
      throw Error(`SOURCE_EVIDENCE_NUMBERS: ${c.id}`);
    if (c.answerKey && (c.answerKey.length !== c.questionNumbers.length || c.answerKey.some(a => !/^[アイウエオカキクケコ]$/.test(a))))
      throw Error(`SOURCE_EVIDENCE_ANSWERS: ${c.id}`);
    if (c.timeSlot === "午後" && c.answerKey !== undefined)
      throw Error(`SOURCE_EVIDENCE_COMPOUND: ${c.id}: 複数空欄を単一正答へ変換できません`);
    for (const p of [c.questionPaper, c.answerPaper]) {
      officialURL(p.url, true);
      if (!/^[0-9a-f]{64}$/.test(p.sha256) || !Number.isSafeInteger(p.byteLength) || p.byteLength < 5 ||
        !Number.isSafeInteger(p.pageCount) || p.pageCount < 1)
        throw Error(`SOURCE_EVIDENCE_PDF: ${p.url}`);
      const previous = papers.get(p.url);
      if (previous && JSON.stringify(previous) !== JSON.stringify(p)) {
        // A combined question/answer PDF can carry an additional answerPages locator.
        if (previous.sha256 !== p.sha256 || previous.byteLength !== p.byteLength || previous.pageCount !== p.pageCount)
          throw Error(`SOURCE_EVIDENCE_CONFLICT: ${p.url}`);
      }
      papers.set(p.url, p);
    }
  }
  return [...papers.values()];
}

export function verifyCachedPapers(papers: Paper[], directory: string): number {
  const cached = new Map<string, number>();
  const visit = (dir: string, depth = 0) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory() && depth < 1) visit(file, depth + 1);
      else if (entry.isFile() && entry.name.endsWith(".pdf")) {
        const raw = fs.readFileSync(file);
        if (raw.subarray(0, 5).toString() !== "%PDF-") throw Error(`SOURCE_EVIDENCE_SIGNATURE: ${file}`);
        cached.set(createHash("sha256").update(raw).digest("hex"), raw.byteLength);
      }
    }
  };
  visit(directory);
  for (const paper of papers) {
    if (cached.get(paper.sha256) !== paper.byteLength) throw Error(`SOURCE_EVIDENCE_CACHE: ${paper.url}`);
  }
  return papers.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const evidence = JSON.parse(fs.readFileSync(new URL("./source-evidence/ipa-pre-2023.json", import.meta.url), "utf8")) as SourceEvidence;
  const papers = validateSourceEvidence(evidence);
  if (process.argv[2]) console.log(`PDF bytes verified: ${verifyCachedPapers(papers, process.argv[2])}`);
  console.log(`Acquisition snapshot: ${evidence.collections.length} collections, ${papers.length} PDFs. This read-only check does not certify question imports; use sources:readiness for current per-question status.`);
}
