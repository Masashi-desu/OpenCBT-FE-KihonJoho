/** A whole-booklet candidate only. This module neither grants material
 * permission nor writes public files; deployment requires a separate receipt. */
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import type { Attribution, Bundle, Question, SetRecord, Source } from "../src/core/types";
import { refOf } from "../src/core/types";
import { contentHash } from "../src/core/hash";
import { schema } from "../src/core/validation";
import { validateSourceFormat } from "../src/core/generation-formats";
import { checkFile, required2017SpringAfternoonReleaseCodePins as workspacePins, type FilePin } from "./stage-2017-spring-afternoon";
import { spring2019Afternoon as paper, spring2019OriginalId, assertSpring2019OriginalAnswers,
  spring2019QuestionSelection, spring2019Exam } from "./legacy-2019-spring-afternoon-booklet";
import { spring2019MaterialAssessmentSHA, spring2019PolicySource, assertSpring2019MaterialReceipt,
  spring2019MaterialScope, type Spring2019MaterialReceipt } from "./legacy-2019-spring-material-scope";
import { spring2019Pm9ReferenceRecords, type Spring2019Pm9ReferenceEvidence } from "./legacy-2019-spring-pm9-reference";
import { spring2019Pm9ReferenceBlock, spring2019Pm9ReferenceNoticeBlock } from "../src/core/generators/legacy-2019-spring-pm9-model";

export type Spring2019Records = Pick<Bundle,"sources"|"rights"|"assets"|"questions"|"templates">;
export type Spring2019Candidate = Spring2019Records & Pick<Bundle,"sets"|"exams">;
const source = (n: number) => `2019h31h-fe-pm-${n}`;
const baseId = (n: number) => `question-template-source-${source(n)}`;
const templateId = (n: number) => `template-source-${source(n)}`;
export const spring2019AssetPages = [
  [5,6,7,8],[9,10,11,12],[13,14,15,16,17],[18,19,20,21,22],
  [23,24,25,26,27,28,29],[30,31,32,33,34],[35,36,37,38],
  [39,40,41,42,43,44,45,46,3,4],[47,48,49,50,51],[52,53,54,55,56,57],
  [58,59,60,61,62,63,77,78],[64,65,66,67,68,79,80,81,82,83,84],
  [69,70,71,72,73,74,75,76,3,4,85,86,87,88,89,90],
] as const;
export interface Spring2019Review {
  status:"pass"; number: number; recordsSha256: string; reviewerIds: string[];
  codePinsSHA256: string;
  checks: Record<"transcription"|"materials"|"independentSemantics"|"display","pass">;
  evidence: FilePin[];
}
export interface Spring2019MajorInput {
  number: number; prepared: Spring2019Records; assetsRoot: string; review: Spring2019Review;
}
export interface Spring2019Packet {
  questionPaper: FilePin; answerPaper: FilePin; acquisition: FilePin;
  instructions: { page: 1|2; file: FilePin }[];
  instructionReview: FilePin; cropBoundaryReview: FilePin; materialScopeReview: FilePin;
  policySource: Source; policySourceReview: FilePin;
  pixelReview: FilePin; codePins: FilePin[];
  // These prove the replacement reference and current notice separately from IPA.
  independentReference: { evidence: Spring2019Pm9ReferenceEvidence; sourcePins: FilePin[]; notice: FilePin };
  // A checked index row must exist before release. Candidate generation does not write it.
  noticeIndexReview: FilePin;
}
const equal = (a: unknown,b: unknown) => assert.deepEqual(a,b);
function samePins(a: FilePin[],b: FilePin[]) {
  const rows=(pins: FilePin[])=>[...pins].sort((a,b)=>a.path.localeCompare(b.path)).map(p=>[p.path,p.sha256,p.byteLength]);
  assert.equal(new Set(a.map(p=>p.path)).size,a.length); equal(rows(a),rows(b));
}
export function spring2019LearningPayload(q: Question) {
  const { id,revision,lifecycle,subject,learning,contexts,contextRefs,prompt,choices,answerParts,
    correctAnswer,explanation,assetRefs,choiceShuffleAllowed }=q;
  return { id,revision,lifecycle,subject,learning,contexts,contextRefs,prompt,choices,answerParts,
    correctAnswer,explanation,assetRefs,choiceShuffleAllowed };
}
type FixedGroup = { id: string; title: string; caption: string; pages: number[] };
function fixedGroups(n: number): FixedGroup[] {
  if(n===8)return[{id:"common",title:"共通に使用される擬似言語の記述形式（原p3〜4）",caption:"共通記法",pages:[3,4]}];
  if(n===11)return[{id:"api",title:"Javaプログラムで使用するAPIの説明（原p77〜78）",caption:"Java API参考",pages:[77,78]}];
  if(n===12)return[{id:"casl",title:"アセンブラ言語の仕様（原p79〜84，p81は命令表上部のみ）",caption:"アセンブラ言語の仕様",pages:[79,80,81,82,83,84]}];
  if(n===13)return[{id:"common",title:"共通に使用される擬似言語の記述形式（原p3〜4）",caption:"擬似言語の記述形式",pages:[3,4]},
    {id:"sheet",title:"表計算ソフトの機能・用語（原p85〜90）",caption:"表計算ソフトの機能",pages:[85,86,87,88,89,90]}];
  return [];
}
function originalCredit(n: number, pages: readonly number[], kind="qs"): Attribution {
  return {origin:"official",sourceRefs:pages.map(page=>({sourceId:`source-ipa-${source(n)}-${kind}`,
    locator:{section:`平成31年度 春期 基本情報技術者試験 午後 問${n}${kind==="ans"?" 解答例":kind==="qs"?" 原問題":" "+kind}`,
      page,year:2019,period:"春期",exam:"基本情報技術者試験",subject:"旧制度・午後",timeSlot:"午後",questionNumber:String(n)}})),
    rightsRefs:[`rights-ipa-${source(n)}${kind==="qs"||kind==="ans"?"":"-"+kind}`],creatorIds:["ipa"]};
}
function spring2019BookletSource(): Source { return {schemaVersion:"3.0.0",id:"source-ipa-2019h31h-fe-pm-booklet",title:"平成31年度 春期 基本情報技術者試験 午後 表紙・問題選択方法",
 publisher:"独立行政法人情報処理推進機構（IPA）",url:paper.questionPaper.url,sha256:paper.questionPaper.sha256,checkedOn:"2026-10-29",type:"official_problem",availability:"officially_published",
 scope:"物理p1の時間・問題選択方法と物理p2の問題一覧。印刷pageは物理pageと同じ。",sections:["物理p1 表紙・150分・問題選択","物理p2 問題一覧"],dateNote:"試験年度から個別PDFの公開日を推測しない。",
 facts:["13大問。問1・8必須、問2〜7から4、問9〜13から1の計7大問・150分。","全78操作欄・77解答定義・78採点対象。問7c/dだけ順不同。正解なしの欄はない。公式配点・評価点とは別。"],
 supports:["annual-sets","random-mix","answer-validation"],limits:"時間と選択方法の出典のみ。個別素材・独立参考・既知の原コードの限界は各source/rightを参照する。"}; }
async function checkedPolicySource(pin:FilePin):Promise<Source>{
 const value=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(await checkFile(pin))) as Source;
 schema("source",value); equal(value,spring2019PolicySource);return value;
}
async function checkedMaterialScopes(pin:FilePin):Promise<Spring2019MaterialReceipt>{
 assert.equal(pin.sha256,spring2019MaterialAssessmentSHA,"spring_material_assessment_identity");
 const assessment=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(await checkFile(pin))) as Spring2019MaterialReceipt["assessment"];
 const receipt={sha256:pin.sha256,assessment};assertSpring2019MaterialReceipt(receipt);
 for(const n of paper.majorNumbers){const groups=fixedGroups(n),body=spring2019AssetPages[n-1].filter(page=>!groups.some(g=>g.pages.includes(page)));
  spring2019MaterialScope(receipt,n,"qs",body);for(const g of groups)spring2019MaterialScope(receipt,n,g.id,g.pages);}
 return receipt;
}
async function checkedReference(packet:Pick<Spring2019Packet,"independentReference"|"noticeIndexReview">,material:Spring2019MaterialReceipt){
 const {evidence,sourcePins,notice}=packet.independentReference;assert.equal(sourcePins.length,6);assert.equal(new Set(sourcePins.map(p=>p.path)).size,6);
 for(const row of evidence.sources){const pin=sourcePins.find(p=>p.path===row.path);assert(pin,"spring_unicode_source_pin_missing");equal([pin.sha256,pin.byteLength],[row.sha256,row.byteLength]);await checkFile(pin);}
 const expected=spring2019Pm9ReferenceRecords(evidence,material);
 equal([notice.sha256,notice.byteLength],[expected.notice.sha256,expected.notice.byteLength]);
 assert.equal(new TextDecoder("utf-8",{fatal:true}).decode(await checkFile(notice)),expected.notice.text);
 const entries=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(await checkFile(packet.noticeIndexReview))) as {file:string;sha256:string;scope:string;licenseId:string;title:string}[];
 assert(Array.isArray(entries));const rows=entries.filter(e=>e.file==="Unicode-2019-spring-Q9-V3-LICENSE.txt");assert.equal(rows.length,1,"spring_q9_notice_index_missing");
 equal([rows[0].sha256,rows[0].licenseId],[expected.notice.sha256,"Unicode-3.0"]);
 assert(rows[0].scope.includes("2019")&&rows[0].scope.includes("問9")&&rows[0].scope.includes("95"),"spring_q9_notice_scope");
 return expected;
}
function assetFile(root:string,relative:string){assert(path.isAbsolute(root));const base=fs.realpathSync(root),file=fs.realpathSync(path.resolve(root,relative));assert(file.startsWith(base+path.sep),"spring_asset_realpath_boundary");return file;}
export function assertSpring2019ReferenceTrace(q:Question){
 assert.equal(q.id,spring2019OriginalId(9));assert.equal(q.origin.kind,"official_reprint");assert.equal(q.origin.isModified,true);assert.equal(q.origin.modificationBasis,"official_source");
 assert(q.origin.changes.some(c=>c.kind==="diagram"&&c.summary==="問9の参照資料を独立95文字参考へ置換"&&c.affectsAnswer===false),"spring_q9_replacement_trace_missing");
}
export function assertSpring2019RecordReviews(p:Spring2019Records){
 for(const q of p.questions){assert(Object.values(q.review.checks).every(v=>v==="pass"),"spring_content_review_pending");assert(q.review.reviewerIds.length,"spring_content_reviewer_missing");}
}

const unicodeSourceIds:string[] = ["source-unicode-2019h31h-fe-pm9-jis-archive", "source-unicode-2019h31h-fe-pm9-cp932-archive", "source-unicode-17-2019h31h-fe-pm9-ucd", "source-unicode-2019h31h-fe-pm9-mapping-policy", "source-unicode-2019h31h-fe-pm9-terms", "source-unicode-2019h31h-fe-pm9-license"];
// Preserved source limits are candidate data, not an expanded material grant.
const criticalSourceLimits:Record<string,string> = {"source-ipa-2019h31h-fe-pm-9-qs": "原本文/全プログラム/2図/24固有択30refs/原1.3参照文は保持。JIS原表/文言は対象外。別source/right/現行通知の独立95行参考へ置換する改変traceを解答前に接続する。原8bit入力/%c出力byteをUnicode符号化へ変えない。", "source-ipa-2019h31h-fe-pm-11-api": "当該API77/78の3型8操作11項目の短い試験用機能要約だけを固定参考として扱う。Oracle文書全体・コード例の再許諾や，IPAの著作者・契約・原典版の証明ではない。", "source-ipa-2019h31h-fe-pm-12-qs": "原コードの符号なし引数全域での正しさは保証しない。位置15・長さ65521・4096語では16bitADDLの桁あふれ後CPLがOFを上書きし，対象全ビットを1にできない独立反例を再現した。原の44/24，採点講評8/4，0長/語境界と各改変例の検算は全域保証ではない。原本文/原コード/公式6解答を保持し，公式訂正や未記載の上限追加とは扱わない。", "source-ipa-2019h31h-fe-pm-12-casl": "物理p81は上部[0,0,1432,1240]のみ。命令表のOF末尾と最後の―までを保持し，JIS1.3の見出し/説明/文字表/全下部pixelは対象外。", "source-ipa-2019h31h-fe-pm-13-qs": "原マクロは指定商品を購入していない会員の商品最終日を配列へ代入せず，両販売額0の比較で未代入要素を参照し得る。当該付属仕様では配列の初期値や未代入参照の扱いの明記を確認できない。原本文・マクロ・公式解答は保持する。改変例の販売明細では，全会員が指定商品を購入しており，最終購入日が実データから定まる。"};
export function assertSpring2019SourceLimits(records:Spring2019Records){
 for(const s of records.sources){assert(typeof s.limits==="string"&&s.limits.length,"spring_source_limits_missing");if(s.id in criticalSourceLimits)equal(s.limits,criticalSourceLimits[s.id]);}
}
type PixelRow={page:number;name:string;width:number;height:number;byteLength:number;sha256:string;rawImageExtraction:{method:string;sourceDecodedRGBSHA256:string;decodedRGBSHA256:string;webpDecodedRGBSHA256:string;crop:null|number[];rotationClockwise:number;resized:boolean;allPixelsEqual:boolean}};
export function assertSpring2019PixelMetadata(value:{sourcePDFSHA256:string;physicalPages:number;questionReferences:number;pageNumbers:number[];pages:PixelRow[]}){
 equal([value.sourcePDFSHA256,value.physicalPages,value.questionReferences],[paper.questionPaper.sha256,88,90]);
 equal(value.pageNumbers,Array.from({length:88},(_,i)=>i+3));equal(value.pages.map(r=>r.page),value.pageNumbers);
 for(const row of value.pages){const raw=row.rawImageExtraction;assert(/^[a-f0-9]{64}$/.test(row.sha256));assert(Number.isSafeInteger(row.byteLength)&&row.byteLength>0);
  equal([raw.method,raw.rotationClockwise,raw.resized,raw.allPixelsEqual],["original_DCT_stream_to_lossless_RGB_WebP",0,false,true]);
  assert(/^[a-f0-9]{64}$/.test(raw.decodedRGBSHA256));equal(raw.decodedRGBSHA256,raw.webpDecodedRGBSHA256);
  if(row.page===81){equal(raw.crop,[0,0,1432,1240]);equal([row.width,row.height,row.byteLength,row.sha256,raw.decodedRGBSHA256],[1432,1240,242320,"ab2449f619cb3700ebb3f8e1ca76e62de6daa094b226a940b8714aae3403ac47","268fd54474f62d5c8247db7a9d39d0886d8a371cf53496d13e8c9f3e051a9ca8"]);}
  else{equal(raw.crop,null);equal([row.width,row.height],[1432,2026]);equal(raw.sourceDecodedRGBSHA256,raw.decodedRGBSHA256);}
 }return new Map(value.pages.map(row=>[row.page,row]));
}
async function checkedPixels(pin:FilePin){const value=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(await checkFile(pin)));return assertSpring2019PixelMetadata(value);}
function equalPixel(asset:Spring2019Records["assets"][number],pixels:Map<number,PixelRow>){const page=asset.attribution.sourceRefs[0]?.locator.page;assert(typeof page==="number");const row=pixels.get(page);assert(row,"spring_asset_pixel_page_missing");equal([path.basename(asset.path),asset.width,asset.height,asset.byteLength,asset.sha256],[row.name,row.width,row.height,row.byteLength,row.sha256]);}

function physicalAssetCount(candidate: Spring2019Candidate) {
  const physicalAssets = new Map<string, { sha256: string; width: number; height: number; byteLength: number }>();
  for (const asset of candidate.assets) {
    const identity = { sha256: asset.sha256, width: asset.width, height: asset.height, byteLength: asset.byteLength };
    const previous = physicalAssets.get(asset.path); if (previous) equal(identity, previous); else physicalAssets.set(asset.path, identity);
  }
  assert.equal(physicalAssets.size,88,"spring_physical_asset_file_count"); return physicalAssets.size;
}
function shape(n: number,p: Spring2019Records) {
  assert(Number.isSafeInteger(n)&&n>=1&&n<=13,"spring_major_number");
  assert.equal(p.questions.length,2); assert.equal(p.templates.length,1);
  const original=p.questions.find(q=>q.id===spring2019OriginalId(n));
  const base=p.questions.find(q=>q.id===baseId(n)),template=p.templates[0]; assert(original&&base);
  assertSpring2019OriginalAnswers(original,n);
  assert.equal(original.origin.isModified,n===9);
  if(n===9)assertSpring2019ReferenceTrace(original);
  assert.equal(base.origin.kind,"official_adaptation"); assert.equal(base.origin.isModified,true);
  equal(base.origin.derivedFrom,[refOf(original)]);
  equal(template.baseQuestionRef,refOf(base)); assert.equal(template.id,templateId(n));
  assert.equal(template.generatorRef.id,`generator-source-${source(n)}`);
  assert.equal(template.distribution,"excluded"); assert.equal(template.bindingBasis,"official_source");
  assert.equal(p.rights.length,n===13?3:[8,9,11,12].includes(n)?2:1);
  for(const right of p.rights) {
    assert(Object.values(right.uses).every(v=>v==="allowed"),"spring_material_use_not_reviewed");
    assert(["none_identified","present_cleared"].includes(right.thirdParty.status),"spring_third_party_pending");
  }
  assertSpring2019SourceLimits(p);
  const sourceIds=new Set(p.sources.map(s=>s.id)),rightsIds=new Set(p.rights.map(r=>r.id));
  const materialGroups=fixedGroups(n), groups=materialGroups.map(group=>group.id);
  equal([...sourceIds].sort(),[`source-ipa-${source(n)}-qs`,`source-ipa-${source(n)}-ans`,
    ...groups.map(g=>`source-ipa-${source(n)}-${g}`),...(n===1?[spring2019PolicySource.id]:[]),...(n===9?unicodeSourceIds:[])].sort());
  equal([...rightsIds].sort(),[`rights-ipa-${source(n)}`,...groups.map(g=>`rights-ipa-${source(n)}-${g}`),...(n===9?["rights-unicode-2019h31h-fe-pm9"]:[])].sort());
  for(const r of p.rights.filter(r=>r.id!=="rights-unicode-2019h31h-fe-pm9")) {
    assert.equal(r.licenseId,"LicenseRef-IPA-Public-Questions","spring_material_license");
    assert.equal(r.modificationNoticeRequired,true,"spring_material_change_notice");
    assert.equal(r.basis,"official_policy","spring_material_basis");
    equal(r.holders,["独立行政法人情報処理推進機構（IPA）"]);
    assert.equal(r.checkedOn,"2026-10-29");
    assert.equal(r.thirdParty.status,"none_identified"); equal(r.thirdParty.rightsRefs,[]);
    const material=r.id===`rights-ipa-${source(n)}`?{id:"qs",title:"原問題",pages:spring2019AssetPages[n-1].filter(page=>!materialGroups.some(group=>group.pages.includes(page)))}:
      materialGroups.find(group=>r.id===`rights-ipa-${source(n)}-${group.id}`);
    assert(material,"spring_unexpected_material_right");
    equal(r.evidence,[{sourceId:"source-ipa-2019h31h-fe-pm-policy",locator:{section:"その他／試験の過去問題の使用方法／留意点"}},...originalCredit(n,material.pages,material.id).sourceRefs]);
    assert.equal(r.attributionText,`出典：平成31年度 春期 基本情報技術者試験 午後 問${n} ${material.title}／©2019 独立行政法人情報処理推進機構（IPA）`);
    assert(r.evidence.some(ref=>ref.sourceId==="source-ipa-2019h31h-fe-pm-policy"),"spring_policy_evidence_missing");
    assert(!r.evidence.some(ref=>ref.sourceId==="source-ipa-faq"),"spring_old_global_policy_not_adopted");
  }
  for(const s of p.sources.filter(s=>s.id!==spring2019PolicySource.id&&!unicodeSourceIds.includes(s.id))) {
    assert.equal(s.availability,"officially_published");
    assert(s.id.startsWith(`source-ipa-${source(n)}-`),"spring_foreign_source");
    const answer=s.id===`source-ipa-${source(n)}-ans`;
    assert.equal(s.type,answer?"official_answer":"official_problem","spring_source_role_type");
    const expected=answer?paper.answerPaper:paper.questionPaper;
    equal([s.url,s.sha256],[expected.url,expected.sha256]);
  }
  const credit=(a: Attribution)=>{
    assert(a.sourceRefs.every(r=>sourceIds.has(r.sourceId)),"spring_foreign_material_source");
    assert(a.rightsRefs.every(r=>rightsIds.has(r)||r==="rights-original"),"spring_foreign_material_right");
  };
  for(const q of p.questions) {
    assert.equal(q.distribution,"excluded"); assert.equal(q.lifecycle,"active"); assert.equal(q.subject,"B");
    assert.equal(q.learning.area,n===6?"management":n===7?"strategy":"technology");
    assert.equal(q.choiceShuffleAllowed,false); assertSpring2019RecordReviews(p);
    assert(q.origin.sourceRefs.length&&q.origin.sourceRefs.every(r=>r.sourceId===`source-ipa-${source(n)}-qs`&&
      r.locator.year===2019&&r.locator.period==="春期"&&r.locator.timeSlot==="午後"&&r.locator.questionNumber===String(n)));
    equal(q.contextRefs,q.contexts.map(c=>c.id)); credit(q.correctAnswer.attribution);
    for(const c of [q.prompt,q.explanation,...q.choices.map(c=>c.content),...q.contexts.map(c=>c.content)]) {
      credit(c.attribution);
      for(const b of c.blocks) {
        if(b.type==="diagram") credit(b.attribution);
        if(b.type==="image") assert(p.assets.some(a=>a.id===b.assetId),"spring_missing_material_asset");
      }
    }
  }
  // Canonical base structure is checked below against the source-owned
  // generator. The original must map to those same fields and fixed materials.
  equal(original.answerParts!.map(part=>({...part,choiceIds:part.choiceIds.map(id=>id.replace(/^choice-original-/,"choice-value-"))})),base.answerParts);
  equal(original.contexts,base.contexts); equal(original.contextRefs,base.contextRefs);
  const expectedContexts=materialGroups.map(group=>({id:`context-${source(n)}-${group.id}`,title:group.title,presentation:"text_figure",
    content:{attribution:originalCredit(n,group.pages,group.id),blocks:group.pages.map(page=>({type:"image",assetId:`asset-ipa-${source(n)}-p${page}`,caption:`平成31年度春期 ${group.caption} 物理p.${page}${n===12&&page===81?"（JIS1.3を除く命令表上部）":""}`}))}}));
  if(n===9){const block=spring2019Pm9ReferenceBlock();equal(original.contexts,[{id:"context-2019h31h-fe-pm-9-independent-reference",title:block.caption,presentation:"text_figure",content:{attribution:structuredClone(block.attribution),blocks:[block]}}]);}
  else equal(original.contexts,expectedContexts);
  const bodyPages=spring2019AssetPages[n-1].filter(page=>!materialGroups.some(group=>group.pages.includes(page)));
  equal(original.prompt.attribution,originalCredit(n,bodyPages));
  equal(original.prompt.blocks,[...(n===9?[spring2019Pm9ReferenceNoticeBlock()]:[]),...bodyPages.map(page=>({type:"image",assetId:`asset-ipa-${source(n)}-p${page}`,caption:`原資料 問${n} 物理p.${page}（印刷p.${page}）`}))]);
  equal(original.correctAnswer.attribution,originalCredit(n,[1],"ans"));
  equal(original.assetRefs,spring2019AssetPages[n-1].map(page=>`asset-ipa-${source(n)}-p${page}`));
  equal(base.assetRefs,materialGroups.flatMap(group=>group.pages.map(page=>`asset-ipa-${source(n)}-p${page}`)));
  for (const [i,choice] of original.choices.entries()) {
    const reference=base.choices[i]; assert(reference);
    equal(choice.content.attribution.sourceRefs,reference.content.attribution.sourceRefs);
    equal(choice.content.attribution.rightsRefs,[`rights-ipa-${source(n)}`]);
    equal(choice.content.attribution.creatorIds,["ipa"]); assert.equal(choice.content.attribution.origin,"official");
  }
  const pages=p.assets.map(a=>{
    assert.equal(a.mediaType,"image/webp"); credit(a.attribution); assert.equal(a.attribution.sourceRefs.length,1);
    const loc=a.attribution.sourceRefs[0].locator;
    assert(typeof loc.page==="number");
    const group=materialGroups.find(group=>group.pages.includes(loc.page!));
    equal(a.id,`asset-ipa-${source(n)}-p${loc.page}`);
    equal(a.attribution,originalCredit(n,[loc.page],group?.id??"qs"));
    equal([loc.year,loc.period,loc.timeSlot,loc.questionNumber],[2019,"春期","午後",String(n)]);
    if(loc.page===81) equal([n,a.width,a.height,a.sha256],[12,1432,1240,"ab2449f619cb3700ebb3f8e1ca76e62de6daa094b226a940b8714aae3403ac47"]);
    return loc.page;
  });
  equal(pages,[...spring2019AssetPages[n-1]]);
  for(const [kind,rows] of Object.entries(p)) {
    assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
    for(const r of rows) schema(kind==="rights"?kind:kind.slice(0,-1),r);
  }
  if(n===13)equal(template.referenceParameters,{values:[1]});
  validateSourceFormat(base,template); return {original,base,template};
}

/** Callers supply separately approved excluded records. A boolean cannot
 * replace the source, image, content and code evidence pinned here. */
export async function build2019SpringAfternoonCandidate(inputs: Spring2019MajorInput[],packet: Spring2019Packet) {
  equal([...inputs].map(i=>i.number).sort((a,b)=>a-b),[...paper.majorNumbers]);
  assert(inputs.every(input=>input.review?.status==="pass"),"spring_major_review_pending");
  assert(packet,"spring_packet_pending");inputs=structuredClone(inputs);packet=structuredClone(packet);
  equal([packet.questionPaper.sha256,packet.questionPaper.byteLength],[paper.questionPaper.sha256,paper.questionPaper.byteLength]);
  equal([packet.answerPaper.sha256,packet.answerPaper.byteLength],[paper.answerPaper.sha256,paper.answerPaper.byteLength]);
  equal(packet.instructions.map(i=>i.page),[1,2]);
  for(const pin of [packet.questionPaper,packet.answerPaper,packet.acquisition,...packet.instructions.map(i=>i.file),
    packet.instructionReview,packet.cropBoundaryReview,packet.materialScopeReview,packet.policySourceReview,packet.pixelReview]) await checkFile(pin);
  samePins(packet.codePins,await workspacePins());
  equal(packet.policySource,await checkedPolicySource(packet.policySourceReview));
  const material=await checkedMaterialScopes(packet.materialScopeReview);
  const reference=await checkedReference(packet,material);
  const pixels=await checkedPixels(packet.pixelReview);
  const candidate: Spring2019Candidate={sources:[],rights:[],assets:[],questions:[],templates:[],sets:[],exams:[]};
  const metadataEdits: {id:string;field:string;before:string;after:string}[]=[];
  for(const input of [...inputs].sort((a,b)=>a.number-b.number)) {
    const {number:n,prepared:p,review}=input; assert(review?.status==="pass","spring_major_review_pending");const {base,template}=shape(n,p);
    assert.equal(template.originalContentSha256,await contentHash(base));
    assert.equal(review.status,"pass","spring_major_review_pending");assert.equal(review.codePinsSHA256,await contentHash(packet.codePins),"spring_major_review_stale_code");
    assert.equal(review.number,n); assert.equal(review.recordsSha256,await contentHash(p));
    assert(review.reviewerIds.length&&review.evidence.length);
    assert(["transcription","materials","independentSemantics","display"].every(k=>review.checks[k as keyof typeof review.checks]==="pass"));
    for(const pin of review.evidence) await checkFile(pin);
    assert(path.isAbsolute(input.assetsRoot));
    for(const asset of p.assets) {
      const file=assetFile(input.assetsRoot,asset.path);
      equalPixel(asset,pixels);
      await checkFile({path:file,sha256:asset.sha256,byteLength:asset.byteLength});
    }
    assert.equal(review.recordsSha256,await contentHash(p),"spring_input_changed_during_review");
    const admitted=structuredClone(p);
    // Source.limits/scope and all rights are unchanged. In particular Q9's
    // independent facts, Q12 overflow and Q13 unassigned source0 limits survive.
    equal(admitted.sources,p.sources);equal(admitted.rights,p.rights);
    if(n===1)equal(p.sources.find(s=>s.id===spring2019PolicySource.id),packet.policySource);
    if(n===9){equal(p.sources.filter(s=>unicodeSourceIds.includes(s.id)),reference.sources);equal(p.rights.filter(r=>r.id==="rights-unicode-2019h31h-fe-pm9"),reference.rights);}
    for(const q of admitted.questions) {
      q.distribution="included";
      // Review checks/notes and modification notices are already explicitly
      // reviewed inputs. Never promote a fail/pending bit or invent a pass note.
      equal(spring2019LearningPayload(q),spring2019LearningPayload(p.questions.find(b=>b.id===q.id)!));
    }
    admitted.templates[0].distribution="included";
    admitted.templates[0].originalContentSha256=await contentHash(admitted.questions.find(q=>q.id===baseId(n))!);
    for(const k of ["sources","rights","assets","questions","templates"] as const) (candidate[k] as unknown[]).push(...admitted[k]);
  }
  candidate.sources.push(spring2019BookletSource());
  candidate.exams=[spring2019Exam("study",false),spring2019Exam("practice",false),spring2019Exam("study",true),spring2019Exam("practice",true)];
  const originals=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===spring2019OriginalId(n))!));
  const bases=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===baseId(n))!));
  candidate.sets=[{schemaVersion:"3.0.0",id:"set-annual-2019-spring-pm",revision:1,title:"2019年度 春期・午後",subject:"B",distribution:"included",questionRefs:originals,
    examConfigRefs:candidate.exams.slice(0,2).map(e=>({id:e.id,revision:e.revision})),generationBindings:[],questionSelection:spring2019QuestionSelection(originals)},
    {schemaVersion:"3.0.0",id:"set-mix-2019-spring-pm",revision:1,title:"2019年度 春期・旧午後 ランダムミックス",subject:"B",distribution:"included",questionRefs:bases,
      examConfigRefs:candidate.exams.slice(2).map(e=>({id:e.id,revision:e.revision})),generationBindings:bases.map((questionRef,i)=>({questionRef,templateRef:{id:templateId(i+1),revision:candidate.templates[i].revision}}))}];
  for(const [kind,rows] of Object.entries(candidate)) {assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);for(const r of rows)schema(kind==="rights"?kind:kind.slice(0,-1),r);}
  physicalAssetCount(candidate);
  equal([candidate.sources.length,candidate.rights.length,candidate.questions.length,candidate.templates.length,candidate.assets.length],[39,19,26,13,90]);
  samePins(packet.codePins,await workspacePins());
  return {candidate,metadataEdits,candidateSHA256:await contentHash(candidate),status:"candidate_pending_normal_app_release_gate"};
}
export async function spring2019GlobalMixPatch(existing: SetRecord,candidate: Spring2019Candidate) {
  assert.equal(existing.id,"set-mix-b"); assert.equal(candidate.templates.length,13);
  const after=structuredClone(existing);
  after.revision++;
  for(const n of paper.majorNumbers) {
    const q=candidate.questions.find(q=>q.id===baseId(n)),t=candidate.templates.find(t=>t.id===templateId(n));assert(q&&t);
    assert(!after.questionRefs.some(r=>r.questionId===q.id)); assert(!after.generationBindings.some(b=>b.templateRef.id===t.id));
    const questionRef=refOf(q);after.questionRefs.push(questionRef);after.generationBindings.push({questionRef,templateRef:{id:t.id,revision:t.revision}});
  }
  schema("set",after);return {before:structuredClone(existing),after};
}

export const spring2019ReleaseChecks=["npmCheck","annualStudy13","annualPractice75Selections7At9000",
  "randomMix","searchBookmarks","answerGrading","saveResumeHistory","sourceLicenseDisplay",
  "visualLightDarkMobile","existingCurrentAnd2022Regression"] as const;
export interface Spring2019ReleaseReceipt {
  candidateSHA256: string; assetsRoot: string; codePins: FilePin[];
  materialScopeReview: FilePin; policySourceReview: FilePin;
  pixelReview:FilePin; independentReference:Spring2019Packet["independentReference"]; noticeIndexReview:FilePin;
  checks: Record<typeof spring2019ReleaseChecks[number],{status:"pass";evidence:FilePin[]}>;
}
export const spring2019ReleaseCodePins=workspacePins;
export async function check2019SpringAfternoonRelease(candidate: Spring2019Candidate,receipt: Spring2019ReleaseReceipt) {
  assert(receipt?.checks,"spring_release_receipt_pending");
  assert.equal(receipt.candidateSHA256,await contentHash(candidate),"spring_stale_release_candidate");
  const material=await checkedMaterialScopes(receipt.materialScopeReview);
  const reference=await checkedReference(receipt,material);
  const pixels=await checkedPixels(receipt.pixelReview);
  equal(candidate.sources.filter(s=>unicodeSourceIds.includes(s.id)),reference.sources);equal(candidate.rights.filter(r=>r.id==="rights-unicode-2019h31h-fe-pm9"),reference.rights);
  const policy=await checkedPolicySource(receipt.policySourceReview);
  equal(candidate.sources.filter(source=>source.id===policy.id),[policy]);
  equal(candidate.sources.filter(source=>source.id==="source-ipa-2019h31h-fe-pm-booklet"),[spring2019BookletSource()]);
  const physicalAssets=physicalAssetCount(candidate);
  equal([candidate.sources.length,candidate.rights.length,candidate.questions.length,candidate.templates.length,
    candidate.assets.length,candidate.sets.length,candidate.exams.length],[39,19,26,13,90,2,4]);
  for(const n of paper.majorNumbers) {
    const belongs=(id: string,prefix: string)=>id===prefix+source(n)||id.startsWith(prefix+source(n)+"-");
    const p: Spring2019Records={
      sources:candidate.sources.filter(s=>belongs(s.id,"source-ipa-")||(n===1&&s.id===spring2019PolicySource.id)||(n===9&&unicodeSourceIds.includes(s.id))),
      rights:candidate.rights.filter(r=>belongs(r.id,"rights-ipa-")||(n===9&&r.id==="rights-unicode-2019h31h-fe-pm9")),
      assets:candidate.assets.filter(a=>a.attribution.sourceRefs[0]?.locator.questionNumber===String(n)),
      questions:structuredClone(candidate.questions.filter(q=>[spring2019OriginalId(n),baseId(n)].includes(q.id))),
      templates:structuredClone(candidate.templates.filter(t=>t.id===templateId(n))),
    };
    assert(p.questions.every(q=>q.distribution==="included")&&p.templates.every(t=>t.distribution==="included"));
    const registeredBase=p.questions.find(q=>q.id===baseId(n));assert(registeredBase);
    // The stored hash identifies the included record. The excluded copies
    // below serve only the preparation-shape validation, not hash identity.
    assert.equal(p.templates[0].originalContentSha256,await contentHash(registeredBase));
    for(const q of p.questions)q.distribution="excluded";
    for(const t of p.templates)t.distribution="excluded";
    shape(n,p);
  }
  for(const [kind,rows] of Object.entries(candidate)) {
    assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
    for(const row of rows)schema(kind==="rights"?kind:kind.slice(0,-1),row);
  }
  const annual=candidate.sets.find(s=>s.id==="set-annual-2019-spring-pm");assert(annual);
  const originals=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===spring2019OriginalId(n))!));
  equal(annual.questionRefs,originals);equal(annual.questionSelection,spring2019QuestionSelection(originals));
  assert.equal(annual.distribution,"included");equal(annual.generationBindings,[]);
  equal(annual.examConfigRefs,[spring2019Exam("study",false),spring2019Exam("practice",false)].map(e=>({id:e.id,revision:e.revision})));
  equal(candidate.exams,[spring2019Exam("study",false),spring2019Exam("practice",false),spring2019Exam("study",true),spring2019Exam("practice",true)]);
  const mix=candidate.sets.find(s=>s.id==="set-mix-2019-spring-pm");assert(mix);assert.equal(mix.distribution,"included");
  equal(mix.examConfigRefs,[spring2019Exam("study",true),spring2019Exam("practice",true)].map(e=>({id:e.id,revision:e.revision})));
  const bases=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===baseId(n))!));
  equal(mix.questionRefs,bases);equal(mix.generationBindings,bases.map((questionRef,i)=>({questionRef,templateRef:{id:templateId(i+1),revision:candidate.templates[i].revision}})));
  assert(path.isAbsolute(receipt.assetsRoot));
  const publicRoot=path.dirname(path.resolve(receipt.assetsRoot));
  equal(fs.realpathSync(receipt.noticeIndexReview.path),assetFile(publicRoot,"notices/index.json"));
  equal(fs.realpathSync(receipt.independentReference.notice.path),assetFile(publicRoot,"notices/Unicode-2019-spring-Q9-V3-LICENSE.txt"));
  for(const asset of candidate.assets) {
    const file=assetFile(receipt.assetsRoot,asset.path);equalPixel(asset,pixels);
    await checkFile({path:file,sha256:asset.sha256,byteLength:asset.byteLength});
  }
  samePins(receipt.codePins,await workspacePins());
  for(const key of spring2019ReleaseChecks) {
    const check=receipt.checks[key];assert(check?.status==="pass"&&check.evidence.length,"spring_missing_release_check:"+key);
    for(const pin of check.evidence)await checkFile(pin);
  }
  samePins(receipt.codePins,await workspacePins());
  return {scope:paper.id,status:"release_checks_pass",candidateSHA256:receipt.candidateSHA256,
    majors:13,answerFields:78,scoredAnswerFields:78,answerDefinitionGroups:77,assets:90,physicalAssetFiles:physicalAssets,broaderPre2023Readiness:"separate_unchanged_not_claimed_complete",pushPerformed:false};
}
