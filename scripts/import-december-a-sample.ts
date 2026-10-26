// Imports only the sixty visually and semantically reviewed December 2022 A samples.
// Render first with render-december-a-source.py. No remote acquisition or OCR here.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { decemberAReview as review } from "../tests/fixtures/dec-2022-a-review";
import type { Question, Source, Rights, Asset, Catalog, SetRecord, Exam } from "../src/core/types";
import { readDistributionBundle } from "./distribution-files";
import { catalogKinds } from "../src/core/catalog-files";

const input = path.resolve(process.argv[2] ?? "output/source-import/dec-a"), root = path.resolve("public/data");
const pages = JSON.parse(fs.readFileSync(path.join(input, "pages.json"), "utf8")) as {number:number;page:number;name:string;width:number;height:number;byteLength:number;sha256:string;text:string}[];
const catalog: Catalog = JSON.parse(fs.readFileSync(path.join(root, "catalog.json"), "utf8"));
const prior = readDistributionBundle(root);
const stem = "sample-2022-dec-a", checkedOn = "2026-10-19", qs = `source-ipa-${stem}-qs`, ans = `source-ipa-${stem}-ans`, rightsId = `rights-ipa-${stem}`;
const hash = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");
const write = (kind: keyof Catalog["files"], name: string, value: unknown) => {
  if (!(catalogKinds as readonly string[]).includes(kind)) throw Error("Unknown catalog kind");
  const id = (value as {id:string}).id;
  const existing = prior[kind as typeof catalogKinds[number]].find(r => r.id === id);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(value)) throw Error(`Existing reviewed record differs: ${id}`);
    return; // Preserve its file position, including membership of a record pack.
  }
  const rel = `${kind}/${name}.json`, file = path.join(root, rel), bytes = Buffer.from(JSON.stringify(value, null, 2) + "\n");
  if (fs.existsSync(file) && !fs.readFileSync(file).equals(bytes)) throw Error(`Refusing to overwrite a different record: ${rel}`);
  fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes);
  catalog.files[kind] = [...catalog.files[kind].filter(f => f.path !== rel), { path: rel, sha256: hash(bytes) }];
};
const ref = (number: number, page: number, answer = false) => ({ sourceId: answer ? ans : qs, locator: {
  section: answer ? `科目A試験サンプル問題 問${number} 解答` : `科目A試験サンプル問題 問${number}`,
  page, exam: "基本情報技術者試験", period: "2022年12月公表 サンプル問題", subject: "科目A", questionNumber: String(number),
} });
const attr = (number: number, page: number, answer = false): Question["prompt"]["attribution"] => ({ origin: "official", sourceRefs: [ref(number, page, answer)], rightsRefs: [rightsId], creatorIds: ["ipa"] });
const own: Question["prompt"]["attribution"] = { origin: "original", sourceRefs: [], rightsRefs: ["rights-original"], creatorIds: ["codex"] };
const common = { schemaVersion: "3.0.0", publisher: "独立行政法人情報処理推進機構（IPA）", publishedOn: "2022-12-26", checkedOn,
  dateNote: "2022年12月26日公表のサンプル問題セット。受験年度とは区別する。",
  availability: "officially_published", supports: ["annual-sets", "random-mix", "answer-validation"], limits: "現行制度のサンプル60問であり、2022年度の実施問題や本番全問題ではない。", url: review.questionPaper.url, sha256: review.questionPaper.sha256 };
for (const answer of [false, true]) write("sources", `ipa-${stem}-${answer ? "ans" : "qs"}`, {
  ...common, id: answer ? ans : qs, url: answer ? review.answerPaper.url : review.questionPaper.url, sha256: answer ? review.answerPaper.sha256 : review.questionPaper.sha256, title: `基本情報技術者試験 科目A試験サンプル問題（2022年12月公表）${answer ? "解答" : "問題"}`,
  type: answer ? "official_answer" : "official_sample", scope: answer ? "別紙p.1の60問の公式正答。独自解説はこの解答表の転載ではない。" : "PDF p.4〜29のサンプル全60問と共通の表記ルールp.2〜3。",
  sections: answer ? ["p.1 解答・著作権表示"] : ["p.4〜29 問1〜60", "p.2〜3 共通の表記ルール", "p.32 著作権表示"], facts: [answer ? `正答は${review.questions.map(q=>q.answer).join("、")}。` : "科目A試験のサンプル60問を掲載。分野の区分は本プロジェクトでシラバスの内容に照らして付す。"],
} satisfies Source);
write("sources", "ipa-sample-2022-dec-a-policy", {
  schemaVersion: "3.0.0", id: "source-ipa-sample-2022-dec-a-policy", title: "2022年12月公表サンプル問題の利用条件", publisher: common.publisher,
  url: review.terms, publishedOn: "2022-12-26", checkedOn, dateNote: "個別ページに記された公表日。受験年度やPDFの作成日へ読み替えない。", type: "policy",
  scope: "同ページの基本情報技術者試験科目A試験サンプル問題60問。", availability: "officially_published", sections: ["サンプル問題に関する留意点"],
  facts: ["著作権を放棄していない。教育目的など制度の意義に反しない問題集・テキスト利用には、法令の特別な定めがある場合を除き許諾・使用料は不要。", review.attribution],
  supports: ["source-attribution", "rights-review"], limits: "GitHub同梱・画像化・ブラウザ表示・改変を個別に名指しする許諾ではない。過去問題FAQの改変表示条件と併せて本プロジェクトで用途別評価する。",
} satisfies Source);
write("rights", `ipa-${stem}`, {
  schemaVersion: "3.0.0", id: rightsId, holders: [common.publisher], basis: "official_policy",
  evidence: [{ sourceId: "source-ipa-sample-2022-dec-a-policy", locator: { section: "サンプル問題に関する留意点" } }, { sourceId: "source-ipa-faq", locator: { section: "その他／試験の過去問題の使用方法／留意点" } }],
  scope: "2022年12月公表FE科目Aサンプル60問の本文・図表・選択肢・公式正答。教育目的のアプリでの同梱・表示と、出典・改変を明示した派生問題の原部分。独自解説・追加の作図実装はrights-originalで区別。",
  uses: { repositoryRedistribution: "allowed", browserDisplay: "allowed", adaptation: "allowed" }, attributionText: review.attribution + "／©2022 独立行政法人情報処理推進機構（IPA）",
  modificationNoticeRequired: true, licenseId: "LicenseRef-IPA-Public-Questions", thirdParty: { status: "none_identified", notes: review.materialReview, rightsRefs: [] }, checkedOn,
  assessmentNotes: "個別ページの教育目的利用条件を適用。本アプリの教材同梱・表示・学習目的の改変は、その教育目的利用に含まれるとのプロジェクト判断。著作権保持・指定出典を表示し、改変はFAQの方針に合わせ原問題と区別する。個別ページは改変を明文で扱っておらず、この用途別判断は個別の許諾取得又は法的保証ではない。第三者素材やIPA公式画面・ロゴへ拡張しない。",
} satisfies Rights);

const labels = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ"];

const questionRefs: SetRecord["questionRefs"] = [];
for (const item of review.questions) {
  const assets: string[] = [];
  const blocks: Question["prompt"]["blocks"] = [];
  for (const page of [...item.pages,2,3]) {
    const rendered = pages.find(p => p.number === (page<=3?0:item.number) && p.page === page);
    if (!rendered) throw Error(`Missing rendered question ${item.number} page ${page}`);
    const bytes = fs.readFileSync(path.join(input, rendered.name));
    if (hash(bytes) !== rendered.sha256 || bytes.length !== rendered.byteLength) throw Error("Rendered asset hash differs");
    fs.copyFileSync(path.join(input, rendered.name), path.join(root, "assets", rendered.name));
    const assetId = `asset-ipa-${stem}-${page<=3?"notation":item.number}-p${page}`; assets.push(assetId);
    write("assets", rendered.name.replace(/\.webp$/, ""), { schemaVersion: "3.0.0", id: assetId, path: "assets/" + rendered.name,
      mediaType: "image/webp", sha256: rendered.sha256, width: rendered.width, height: rendered.height, byteLength: rendered.byteLength,
      alt: `2022年12月公表FE科目Aサンプル問題 ${page<=3?"共通の表記ルール":"問"+item.number} 原資料p.${page}。本文・前提・図表・解答群を原ページのまま保持。補助文字と出典PDFも参照できる。`, attribution: page<=3?{...attr(item.number,page),sourceRefs:[{sourceId:qs,locator:{section:"共通の表記ルール",page,exam:"基本情報技術者試験",period:"2022年12月公表 サンプル問題",subject:"科目A"}}]}:attr(item.number, page),
    } satisfies Asset);
    blocks.push({ type: "image", assetId, caption: `原資料 p.${page}` }, { type: "code", language: "text", text: rendered.text });
  }
  const id = `question-ipa-${stem}-${item.number}`;
  const q: Question = {
    schemaVersion: "3.0.0", id, revision: 1, lifecycle: "active", subject: "A",
    learning: { area: item.number<=41 ? "technology" : item.number<=48 ? "management" : "strategy", tags: ["sample-2022-december"], topics: [item.topic], keywords: [item.topic,...item.premises] },
    origin: { kind: "official_reprint", sourceRefs: [ref(item.number, item.pages[0])], derivedFrom: [], changes: [{ at: "2026-10-19T00:00:00Z", actorId: "codex", kind: "layout", summary: "原ページを画像化し補助文字を併記", details: "原ページ全体と著作権表示を保持。PDF抽出文字は空欄・図表の完全な代替ではなく、原画像と公式PDFを正本とする。", affectsAnswer: false }], isModified: false, modificationBasis: "official_source" },
    contributors: [{ actorId: "ipa", role: "author" }, { actorId: "codex", role: "editor" }, { actorId: "codex", role: "verifier" }], contexts: [], contextRefs: [],
    prompt: { attribution: attr(item.number, item.pages[0]), blocks },
    choices: item.choices.map((_, i) => ({ id: `choice-${i + 1}`, content: { attribution: attr(item.number, item.pages.at(-1)!), blocks: [{ type: "paragraph", text: labels[i] }] } })),
    correctAnswer: { choiceId: `choice-${labels.indexOf(item.answer) + 1}`, attribution: attr(item.number, 1, true) },
    explanation: { attribution: own, blocks: [{ type: "paragraph", text: item.explanation }] }, assetRefs: assets, choiceShuffleAllowed: false, distribution: "included",
    review: { checkedOn, reviewerIds: ["codex"], checks: { publication: "pass", terms: "pass", thirdParty: "pass", transcription: "pass", answer: "pass", explanation: "pass" }, notes: "公式PDFの各問題ページ・全選択肢・注意書き・別紙解答p.1を目視照合。独立した参照解法と全選択肢のテストを適用。全文画像を正本とし抽出文字の空欄脱落は画像で保持する。独自解説は公式解説ではない。同一AIの査読であり担当を分離した二重確認ではない。" },
  };
  write("questions", `ipa-${stem}-${item.number}`, q); questionRefs.push({ questionId: id, revision: 1 });
}
for (const mode of ["study", "practice"] as const) write("exams", `${stem}-${mode}`, {
  schemaVersion: "3.0.0", id: `exam-${stem}-${mode}`, revision: 1, subject: "A", title: `2022年12月公表 サンプル問題 ${mode === "study" ? "学習" : "時間付き練習"}`, mode, questionCount: 60,
  questionOrder: "set", choiceOrder: "fixed", duplicatePolicy: "lineage_unique", shortagePolicy: "block", ...(mode === "practice" ? { timeLimitSeconds: 5400, practiceScope: "public_subset" } : {}),
} satisfies Exam);
write("sets", stem, { schemaVersion: "3.0.0", id: `set-${stem}`, revision: 1, title: "2022年12月公表 サンプル問題", subject: "A", questionRefs,
  examConfigRefs: ["study", "practice"].map(mode => ({ id: `exam-${stem}-${mode}`, revision: 1 })), distribution: "included", generationBindings: [],
} satisfies SetRecord);
const before = JSON.parse(fs.readFileSync(path.join(root, "catalog.json"), "utf8")) as Catalog;
if (JSON.stringify(before.files) !== JSON.stringify(catalog.files)) catalog.revision++;
fs.writeFileSync(path.join(root, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
console.log("Imported 60 December 2022 A originals, 62 source page assets, citations and educational-use assessments. Run generation preparation and all checks before distribution.");
