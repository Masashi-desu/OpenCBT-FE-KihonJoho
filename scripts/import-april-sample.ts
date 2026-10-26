// Imports only the six visually and semantically reviewed April 2022 samples.
// Render first with render-april-source.py. No remote acquisition or OCR here.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { aprilBReview as review } from "../tests/fixtures/pre-2023-sample-review";
import type { Question, Source, Rights, Asset, Catalog, SetRecord, Exam } from "../src/core/types";
import { readDistributionBundle } from "./distribution-files";
import { catalogKinds } from "../src/core/catalog-files";

const input = path.resolve(process.argv[2] ?? "output/source-import/april"), root = path.resolve("public/data");
const pages = JSON.parse(fs.readFileSync(path.join(input, "pages.json"), "utf8")) as {number:number;page:number;name:string;width:number;height:number;byteLength:number;sha256:string;text:string}[];
const catalog: Catalog = JSON.parse(fs.readFileSync(path.join(root, "catalog.json"), "utf8"));
const prior = readDistributionBundle(root);
const stem = "sample-2022-apr-b", checkedOn = "2026-10-19", qs = `source-ipa-${stem}-qs`, ans = `source-ipa-${stem}-ans`, rightsId = `rights-ipa-${stem}`;
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
  section: answer ? `科目B試験サンプル問題 問${number} 解答` : `科目B試験サンプル問題 問${number}`,
  page, exam: "基本情報技術者試験", period: "2022年4月公表 サンプル問題", subject: "科目B", questionNumber: String(number),
} });
const attr = (number: number, page: number, answer = false): Question["prompt"]["attribution"] => ({ origin: "official", sourceRefs: [ref(number, page, answer)], rightsRefs: [rightsId], creatorIds: ["ipa"] });
const own: Question["prompt"]["attribution"] = { origin: "original", sourceRefs: [], rightsRefs: ["rights-original"], creatorIds: ["codex"] };
const common = { schemaVersion: "3.0.0", publisher: "独立行政法人情報処理推進機構（IPA）", publishedOn: "2022-04-25", updatedOn: "2022-05-25", checkedOn,
  dateNote: "2022年4月25日公表。5月25日に解答・出題趣旨等を追記したPDF。掲載ページの更新日2023年2月6日や受験年度とは区別する。",
  availability: "officially_published", supports: ["annual-sets", "random-mix", "answer-validation"], limits: "現行制度のサンプル6問であり、2022年度の実施問題や本番全問題ではない。", url: review.questionPaper.url, sha256: review.questionPaper.sha256 };
for (const answer of [false, true]) write("sources", `ipa-${stem}-${answer ? "ans" : "qs"}`, {
  ...common, id: answer ? ans : qs, title: `基本情報技術者試験 科目B試験サンプル問題（2022年4月公表）${answer ? "解答・出題趣旨" : "問題"}`,
  type: answer ? "official_answer" : "official_sample", scope: answer ? "PDF p.11の6問の公式正答。出題趣旨は独自解説と区別。" : "PDF p.2〜10のサンプル全6問。",
  sections: [answer ? "p.11 解答・出題趣旨" : "p.2〜10 問1〜6", "各ページの著作権表示", "p.12 擬似言語仕様への参照"], facts: [answer ? "正答はカ、ウ、ア、イ、ウ、オ。" : "アルゴリズム5問と情報セキュリティ1問。"],
} satisfies Source);
write("sources", "ipa-sample-2022-apr-policy", {
  schemaVersion: "3.0.0", id: "source-ipa-sample-2022-apr-policy", title: "2022年4月公表サンプル問題の利用条件", publisher: common.publisher,
  url: review.terms, publishedOn: "2022-04-25", updatedOn: "2023-02-06", checkedOn, dateNote: "掲載ページの公表日と更新日。添付PDFの追記日とは区別。", type: "policy",
  scope: "同ページの基本情報技術者試験科目B試験サンプル問題6問。", availability: "officially_published", sections: ["サンプル問題に関する留意点"],
  facts: ["著作権を放棄していない。教育目的など制度の意義に反しない問題集・テキスト利用には、法令の特別な定めがある場合を除き許諾・使用料は不要。", review.attribution],
  supports: ["source-attribution", "rights-review"], limits: "GitHub同梱・画像化・ブラウザ表示・改変を個別に名指しする許諾ではない。過去問題FAQの改変表示条件と併せて本プロジェクトで用途別評価する。",
} satisfies Source);
write("rights", `ipa-${stem}`, {
  schemaVersion: "3.0.0", id: rightsId, holders: [common.publisher], basis: "official_policy",
  evidence: [{ sourceId: "source-ipa-sample-2022-apr-policy", locator: { section: "サンプル問題に関する留意点" } }, { sourceId: "source-ipa-faq", locator: { section: "その他／試験の過去問題の使用方法／留意点" } }],
  scope: "2022年4月公表FE科目Bサンプル6問の本文・図表・選択肢・公式正答。教育目的のアプリでの同梱・表示と、出典・改変を明示した派生問題の原部分。独自解説・追加の作図実装はrights-originalで区別。",
  uses: { repositoryRedistribution: "allowed", browserDisplay: "allowed", adaptation: "allowed" }, attributionText: review.attribution + "／©2022 独立行政法人情報処理推進機構（IPA）",
  modificationNoticeRequired: true, licenseId: "LicenseRef-IPA-Public-Questions", thirdParty: { status: "none_identified", notes: review.materialReview, rightsRefs: [] }, checkedOn,
  assessmentNotes: "個別ページの教育目的利用条件を適用。本アプリの教材同梱・表示・学習目的の改変は、その教育目的利用に含まれるとのプロジェクト判断。著作権保持・指定出典を表示し、改変はFAQの方針に合わせ原問題と区別する。個別ページは改変を明文で扱っておらず、この用途別判断は個別の許諾取得又は法的保証ではない。第三者素材やIPA公式画面・ロゴへ拡張しない。",
} satisfies Rights);

const labels = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ"];
const topics = ["条件分岐", "配列の逆順化", "単方向リスト", "疎行列", "文字列の出現頻度", "クラウドの責任分担"];
const questionRefs: SetRecord["questionRefs"] = [];
for (const item of review.questions) {
  const assets: string[] = [];
  const blocks: Question["prompt"]["blocks"] = [];
  for (const page of item.pages) {
    const rendered = pages.find(p => p.number === item.number && p.page === page);
    if (!rendered) throw Error(`Missing rendered question ${item.number} page ${page}`);
    const bytes = fs.readFileSync(path.join(input, rendered.name));
    if (hash(bytes) !== rendered.sha256 || bytes.length !== rendered.byteLength) throw Error("Rendered asset hash differs");
    fs.copyFileSync(path.join(input, rendered.name), path.join(root, "assets", rendered.name));
    const assetId = `asset-ipa-${stem}-${item.number}-p${page}`; assets.push(assetId);
    write("assets", rendered.name.replace(/\.webp$/, ""), { schemaVersion: "3.0.0", id: assetId, path: "assets/" + rendered.name,
      mediaType: "image/webp", sha256: rendered.sha256, width: rendered.width, height: rendered.height, byteLength: rendered.byteLength,
      alt: `2022年4月公表FE科目Bサンプル問題 問${item.number} 原資料p.${page}。本文・前提・図表・解答群を原ページのまま保持。補助文字と出典PDFも参照できる。`, attribution: attr(item.number, page),
    } satisfies Asset);
    blocks.push({ type: "image", assetId, caption: `原資料 p.${page}` }, { type: "code", language: "text", text: rendered.text });
  }
  const id = `question-ipa-${stem}-${item.number}`;
  const q: Question = {
    schemaVersion: "3.0.0", id, revision: 1, lifecycle: "active", subject: "B",
    learning: { area: item.number === 6 ? "security" : "algorithm", tags: ["sample-2022-april"], topics: [topics[item.number - 1]], keywords: [...item.premises] },
    origin: { kind: "official_reprint", sourceRefs: [ref(item.number, item.pages[0])], derivedFrom: [], changes: [{ at: "2026-10-19T00:00:00Z", actorId: "codex", kind: "layout", summary: "原ページを画像化し補助文字を併記", details: "原ページ全体と著作権表示を保持。PDF抽出文字は空欄・図表の完全な代替ではなく、原画像と公式PDFを正本とする。", affectsAnswer: false }], isModified: false, modificationBasis: "official_source" },
    contributors: [{ actorId: "ipa", role: "author" }, { actorId: "codex", role: "editor" }, { actorId: "codex", role: "verifier" }], contexts: [], contextRefs: [],
    prompt: { attribution: attr(item.number, item.pages[0]), blocks },
    choices: item.choices.map((_, i) => ({ id: `choice-${i + 1}`, content: { attribution: attr(item.number, item.pages.at(-1)!), blocks: [{ type: "paragraph", text: labels[i] }] } })),
    correctAnswer: { choiceId: `choice-${labels.indexOf(item.answer) + 1}`, attribution: attr(item.number, 11, true) },
    explanation: { attribution: own, blocks: [{ type: "paragraph", text: item.explanation }] }, assetRefs: assets, choiceShuffleAllowed: false, distribution: "included",
    review: { checkedOn, reviewerIds: ["codex"], checks: { publication: "pass", terms: "pass", thirdParty: "pass", transcription: "pass", answer: "pass", explanation: "pass" }, notes: "公式PDFの各問題ページ・全選択肢・注意書き・解答p.11を目視照合。独立した参照解法と全選択肢のテストを適用。全文画像を正本とし抽出文字の空欄脱落は画像で保持する。独自解説は公式解説ではない。同一AIの査読であり担当を分離した二重確認ではない。" },
  };
  write("questions", `ipa-${stem}-${item.number}`, q); questionRefs.push({ questionId: id, revision: 1 });
}
for (const mode of ["study", "practice"] as const) write("exams", `${stem}-${mode}`, {
  schemaVersion: "3.0.0", id: `exam-${stem}-${mode}`, revision: 1, subject: "B", title: `2022年4月公表 サンプル問題 ${mode === "study" ? "学習" : "時間付き練習"}`, mode, questionCount: 6,
  questionOrder: "set", choiceOrder: "fixed", duplicatePolicy: "lineage_unique", shortagePolicy: "block", ...(mode === "practice" ? { timeLimitSeconds: 1800, practiceScope: "public_subset" } : {}),
} satisfies Exam);
write("sets", stem, { schemaVersion: "3.0.0", id: `set-${stem}`, revision: 1, title: "2022年4月公表 サンプル問題", subject: "B", questionRefs,
  examConfigRefs: ["study", "practice"].map(mode => ({ id: `exam-${stem}-${mode}`, revision: 1 })), distribution: "included", generationBindings: [],
} satisfies SetRecord);
const before = JSON.parse(fs.readFileSync(path.join(root, "catalog.json"), "utf8")) as Catalog;
if (JSON.stringify(before.files) !== JSON.stringify(catalog.files)) catalog.revision++;
fs.writeFileSync(path.join(root, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
console.log("Imported 6 April 2022 originals, 9 source page assets, citations and educational-use assessments. Run generation preparation and all checks before distribution.");
