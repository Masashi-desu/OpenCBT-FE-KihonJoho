/** A whole-booklet candidate only. This module neither grants material
 * permission nor writes public files; deployment requires a separate receipt. */
import assert from "node:assert/strict";
import path from "node:path";
import type { Attribution, Bundle, Question, SetRecord, Source } from "../src/core/types";
import { refOf } from "../src/core/types";
import { contentHash } from "../src/core/hash";
import { schema } from "../src/core/validation";
import { validateSourceFormat } from "../src/core/generation-formats";
import { checkFile, required2017SpringAfternoonReleaseCodePins as workspacePins, type FilePin } from "./stage-2017-spring-afternoon";
import { autumn2018Afternoon as paper, autumn2018OriginalId, assertAutumn2018OriginalAnswers,
  autumn2018QuestionSelection, autumn2018Exam } from "./legacy-2018-autumn-afternoon-booklet";
import { legacyAfternoonPublicNotes } from "../src/core/generators/legacy-afternoon-public-notes";

export type Autumn2018Records = Pick<Bundle,"sources"|"rights"|"assets"|"questions"|"templates">;
export type Autumn2018Candidate = Autumn2018Records & Pick<Bundle,"sets"|"exams">;
const source = (n: number) => `2018h30a-fe-pm-${n}`;
const baseId = (n: number) => `question-template-source-${source(n)}`;
const templateId = (n: number) => `template-source-${source(n)}`;
export const autumn2018AssetPages = [
  [6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23],
  [24,25,26,27,28,29],[30,31,32,33],[34,35,36,37,38],
  [39,40,41,42,43,44,4,5],[45,46,47,48,49,50,51],[52,53,54,55,56],
  [57,58,59,60,61,62,2,75,76,77],[63,64,65,66,78,79,80,81,82,83],
  [67,68,69,70,71,72,73,74,4,5,84,85,86,87,88,89],
] as const;
export interface Autumn2018Review {
  number: number; recordsSha256: string; reviewerIds: string[];
  checks: Record<"transcription"|"materials"|"independentSemantics"|"display","pass">;
  evidence: FilePin[];
}
export interface Autumn2018MajorInput {
  number: number; prepared: Autumn2018Records; assetsRoot: string; review: Autumn2018Review;
}
export interface Autumn2018Packet {
  questionPaper: FilePin; answerPaper: FilePin; acquisition: FilePin;
  instructions: { page: 1|3; file: FilePin }[];
  instructionReview: FilePin; cropBoundaryReview: FilePin; materialScopeReview: FilePin;
  policySource: Source; policySourceReview: FilePin;
  pixelReview: FilePin; codePins: FilePin[];
}
const equal = (a: unknown,b: unknown) => assert.deepEqual(a,b);
function samePins(a: FilePin[],b: FilePin[]) {
  const rows=(pins: FilePin[])=>[...pins].sort((a,b)=>a.path.localeCompare(b.path)).map(p=>[p.path,p.sha256,p.byteLength]);
  assert.equal(new Set(a.map(p=>p.path)).size,a.length); equal(rows(a),rows(b));
}
export function autumn2018LearningPayload(q: Question) {
  const { id,revision,lifecycle,subject,learning,contexts,contextRefs,prompt,choices,answerParts,
    correctAnswer,explanation,assetRefs,choiceShuffleAllowed }=q;
  return { id,revision,lifecycle,subject,learning,contexts,contextRefs,prompt,choices,answerParts,
    correctAnswer,explanation,assetRefs,choiceShuffleAllowed };
}
type FixedGroup = { id: string; title: string; pages: number[] };
function fixedGroups(n: number): FixedGroup[] {
  if (n===8) return [{id:"common",title:"共通に使用される擬似言語の記述形式（原物理p4/5）",pages:[4,5]}];
  if (n===11) return [
    {id:"erratum",title:"問11 APIの正誤表（原物理p2，文字を保持して時計回り90度の可読表示）",pages:[2]},
    {id:"api",title:"問11 Java API説明（原物理p75〜77）",pages:[75,76,77]}];
  if (n===12) return [{id:"casl",title:"CASL IIの仕様（原物理p78〜83，p80は命令表上部のみ）",pages:[78,79,80,81,82,83]}];
  if (n===13) return [
    {id:"common",title:"共通に使用される擬似言語の記述形式",pages:[4,5]},
    {id:"sheet",title:"表計算ソフトの機能・用語",pages:[84,85,86,87,88,89]}];
  return [];
}
function originalCredit(n: number, pages: readonly number[], kind="qs"): Attribution {
  return {origin:"official",sourceRefs:pages.map(page=>({sourceId:`source-ipa-${source(n)}-${kind}`,
    locator:{section:`平成30年度 秋期 基本情報技術者試験 午後 問${n}${kind==="ans"?" 解答例":kind==="qs"?" 原問題":" "+kind}`,
      page,year:2018,period:"秋期",exam:"基本情報技術者試験",subject:"旧制度・午後",timeSlot:"午後",questionNumber:String(n)}})),
    rightsRefs:[`rights-ipa-${source(n)}${kind==="qs"||kind==="ans"?"":"-"+kind}`],creatorIds:["ipa"]};
}
function autumn2018BookletSource(): Source { return {schemaVersion:"3.0.0",id:"source-ipa-2018h30a-fe-pm-booklet",title:"平成30年度 秋期 基本情報技術者試験 午後 表紙・問題選択方法",
    publisher:"独立行政法人情報処理推進機構（IPA）",url:paper.questionPaper.url,sha256:paper.questionPaper.sha256,checkedOn:"2026-10-28",type:"official_problem",availability:"officially_published",
    scope:"物理p1の時間と物理p3の問題選択方法。p2の問11正誤表は個別素材として保持する。",sections:["物理p1 表紙・150分","物理p3 問題選択"],dateNote:"試験年度から個別PDFの公開日を推測しない。",
    facts:["13大問。問1・8必須、問2〜7から4、問9〜13から1の計7大問・150分。","全73操作欄・69解答定義。順不同4組と問13aの公式「正解なし」1欄を保持し、学習採点の対象は72欄。公式配点・評価点とは別。"],
    supports:["annual-sets","random-mix","answer-validation"],limits:"時間と選択方法の出典のみ。個別素材の条件は各source/rightを参照する。"}; }
async function checkedPolicySource(pin: FilePin): Promise<Source> {
  assert.equal(pin.sha256,"e9f8c25b9ed4244c0070a8284061738e5d3a249912c8da525273d7d691dc4b9a","autumn_policy_review_identity");
  const value=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(await checkFile(pin))) as Source;
  schema("source",value); assert.equal(value.id,"source-ipa-2018h30a-fe-pm-policy");
  assert.equal(value.url,"https://www.ipa.go.jp/shiken/faq.html");
  assert.equal(value.sha256,"012df4a569820886658a449d5f38d8d3f8a204d7aa444e0d3ed29b1a67c2a994");
  assert.equal(value.checkedOn,"2026-10-28"); return value;
}
async function checkedMaterialScopes(pin: FilePin) {
  assert.equal(pin.sha256,"ee72a1db868eeddd97a6fa278d5caa914572af8c3ceaa4be4c3b931b10207dfe","autumn_material_assessment_identity");
  const value=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(await checkFile(pin))) as {
    status:string; collection:string; sourcePDFSHA256:string; answerPDFSHA256:string; distributionAdmission:boolean;
    uses:{id:string;questionNumber:number;physicalQSPages:number[];physicalAnswerPages:number[];repositoryRedistribution:string;browserDisplay:string;adaptation:string}[]};
  equal([value.status,value.collection,value.sourcePDFSHA256,value.answerPDFSHA256,value.distributionAdmission],
    ["accepted_material_scopes_only_not_booklet_distribution",paper.id,paper.questionPaper.sha256,paper.answerPaper.sha256,false]);
  assert.equal(value.uses.length,19); assert.equal(new Set(value.uses.map(scope=>scope.id)).size,19);
  for(const n of paper.majorNumbers) {
    const materials=fixedGroups(n),bodyPages=autumn2018AssetPages[n-1].filter(page=>!materials.some(group=>group.pages.includes(page)));
    for(const group of [{id:"body",pages:bodyPages},...materials]) {
      const id=group.id==="body"?`S204-body-${n}`:`S204-${group.id}-q${n}`,scope=value.uses.find(scope=>scope.id===id);
      assert(scope,"autumn_missing_material_scope:"+id); assert.equal(scope.questionNumber,n);
      equal(scope.physicalQSPages,group.pages); equal(scope.physicalAnswerPages,group.id==="body"?[1]:[]);
      equal([scope.repositoryRedistribution,scope.browserDisplay,scope.adaptation],["allowed","allowed",group.id==="body"?"allowed_with_source_changes_notice":"allowed_only_as_fixed_reference_in_modified_exam_problem"]);
    }
  }
}
function physicalAssetCount(candidate: Autumn2018Candidate) {
  const physicalAssets = new Map<string, { sha256: string; width: number; height: number; byteLength: number }>();
  for (const asset of candidate.assets) {
    const identity = { sha256: asset.sha256, width: asset.width, height: asset.height, byteLength: asset.byteLength };
    const previous = physicalAssets.get(asset.path); if (previous) equal(identity, previous); else physicalAssets.set(asset.path, identity);
  }
  assert.equal(physicalAssets.size,87,"autumn_physical_asset_file_count"); return physicalAssets.size;
}
function shape(n: number,p: Autumn2018Records) {
  assert(Number.isSafeInteger(n)&&n>=1&&n<=13,"autumn_major_number");
  assert.equal(p.questions.length,2); assert.equal(p.templates.length,1);
  const original=p.questions.find(q=>q.id===autumn2018OriginalId(n));
  const base=p.questions.find(q=>q.id===baseId(n)),template=p.templates[0]; assert(original&&base);
  assertAutumn2018OriginalAnswers(original,n);
  assert.equal(original.origin.isModified,false);
  assert.equal(base.origin.kind,"official_adaptation"); assert.equal(base.origin.isModified,true);
  equal(base.origin.derivedFrom,[refOf(original)]);
  equal(template.baseQuestionRef,refOf(base)); assert.equal(template.id,templateId(n));
  assert.equal(template.generatorRef.id,`generator-source-${source(n)}`);
  assert.equal(template.distribution,"excluded"); assert.equal(template.bindingBasis,"official_source");
  assert.equal(p.rights.length,[11,13].includes(n)?3:[8,12].includes(n)?2:1);
  for(const right of p.rights) {
    assert(Object.values(right.uses).every(v=>v==="allowed"),"autumn_material_use_not_reviewed");
    assert(["none_identified","present_cleared"].includes(right.thirdParty.status),"autumn_third_party_pending");
  }
  const sourceIds=new Set(p.sources.map(s=>s.id)),rightsIds=new Set(p.rights.map(r=>r.id));
  const materialGroups=fixedGroups(n), groups=materialGroups.map(group=>group.id);
  equal([...sourceIds].sort(),[`source-ipa-${source(n)}-qs`,`source-ipa-${source(n)}-ans`,
    ...groups.map(g=>`source-ipa-${source(n)}-${g}`)].sort());
  equal([...rightsIds].sort(),[`rights-ipa-${source(n)}`,...groups.map(g=>`rights-ipa-${source(n)}-${g}`)].sort());
  for(const r of p.rights) {
    assert.equal(r.licenseId,"LicenseRef-IPA-Public-Questions","autumn_material_license");
    assert.equal(r.modificationNoticeRequired,true,"autumn_material_change_notice");
    assert.equal(r.basis,"official_policy","autumn_material_basis");
    equal(r.holders,["独立行政法人情報処理推進機構（IPA）"]);
    assert.equal(r.checkedOn,"2026-10-28");
    assert.equal(r.thirdParty.status,"none_identified"); equal(r.thirdParty.rightsRefs,[]);
    const material=r.id===`rights-ipa-${source(n)}`?{id:"qs",title:"原問題",pages:autumn2018AssetPages[n-1].filter(page=>!materialGroups.some(group=>group.pages.includes(page)))}:
      materialGroups.find(group=>r.id===`rights-ipa-${source(n)}-${group.id}`);
    assert(material,"autumn_unexpected_material_right");
    equal(r.evidence,[{sourceId:"source-ipa-2018h30a-fe-pm-policy",locator:{section:"その他／試験の過去問題の使用方法／留意点"}},...originalCredit(n,material.pages,material.id).sourceRefs]);
    assert.equal(r.attributionText,`出典：平成30年度 秋期 基本情報技術者試験 午後 問${n} ${material.title}／©2018 独立行政法人情報処理推進機構（IPA）`);
    assert(r.evidence.some(ref=>ref.sourceId==="source-ipa-2018h30a-fe-pm-policy"),"autumn_policy_evidence_missing");
    assert(!r.evidence.some(ref=>ref.sourceId==="source-ipa-faq"),"autumn_old_global_policy_not_adopted");
  }
  for(const s of p.sources) {
    assert.equal(s.availability,"officially_published");
    assert(s.id.startsWith(`source-ipa-${source(n)}-`),"autumn_foreign_source");
    const answer=s.id===`source-ipa-${source(n)}-ans`;
    assert.equal(s.type,answer?"official_answer":"official_problem","autumn_source_role_type");
    const expected=answer?paper.answerPaper:paper.questionPaper;
    equal([s.url,s.sha256],[expected.url,expected.sha256]);
  }
  const credit=(a: Attribution)=>{
    assert(a.sourceRefs.every(r=>sourceIds.has(r.sourceId)),"autumn_foreign_material_source");
    assert(a.rightsRefs.every(r=>rightsIds.has(r)||r==="rights-original"),"autumn_foreign_material_right");
  };
  for(const q of p.questions) {
    assert.equal(q.distribution,"excluded"); assert.equal(q.lifecycle,"active"); assert.equal(q.subject,"B");
    assert.equal(q.learning.area,n===6?"management":n===7?"strategy":"technology");
    assert.equal(q.choiceShuffleAllowed,false); assert(Object.values(q.review.checks).every(v=>v==="pass"),"autumn_content_review_pending");
    assert(q.origin.sourceRefs.length&&q.origin.sourceRefs.every(r=>r.sourceId===`source-ipa-${source(n)}-qs`&&
      r.locator.year===2018&&r.locator.period==="秋期"&&r.locator.timeSlot==="午後"&&r.locator.questionNumber===String(n)));
    equal(q.contextRefs,q.contexts.map(c=>c.id)); credit(q.correctAnswer.attribution);
    for(const c of [q.prompt,q.explanation,...q.choices.map(c=>c.content),...q.contexts.map(c=>c.content)]) {
      credit(c.attribution);
      for(const b of c.blocks) {
        if(b.type==="diagram") credit(b.attribution);
        if(b.type==="image") assert(p.assets.some(a=>a.id===b.assetId),"autumn_missing_material_asset");
      }
    }
  }
  // Canonical base structure is checked below against the source-owned
  // generator. The original must map to those same fields and fixed materials.
  equal(original.answerParts!.map(part=>({...part,choiceIds:part.choiceIds.map(id=>id.replace(/^choice-original-/,"choice-value-"))})),base.answerParts);
  equal(original.contexts,base.contexts); equal(original.contextRefs,base.contextRefs);
  const expectedContexts=materialGroups.map(group=>({id:`context-${source(n)}-${group.id}`,title:group.title,presentation:"text_figure",
    content:{attribution:originalCredit(n,group.pages,group.id),blocks:group.pages.map(page=>({type:"image",assetId:`asset-ipa-${source(n)}-p${page}`,caption:`平成30年度秋期 付属資料 物理p.${page}`}))}}));
  equal(original.contexts,expectedContexts);
  const bodyPages=autumn2018AssetPages[n-1].filter(page=>!materialGroups.some(group=>group.pages.includes(page)));
  equal(original.prompt.attribution,originalCredit(n,bodyPages));
  equal(original.prompt.blocks,bodyPages.map(page=>({type:"image",assetId:`asset-ipa-${source(n)}-p${page}`,caption:`原資料 問${n} 物理p.${page}（印刷p.${page-1}）`})));
  equal(original.correctAnswer.attribution,originalCredit(n,[1],"ans"));
  equal(original.assetRefs,autumn2018AssetPages[n-1].map(page=>`asset-ipa-${source(n)}-p${page}`));
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
    equal([loc.year,loc.period,loc.timeSlot,loc.questionNumber],[2018,"秋期","午後",String(n)]);
    if(loc.page===80) equal([n,a.width,a.height,a.sha256],[12,1432,1240,"fed94df072cc7db8e5da721f460a6ea5274e73c7478912087e6eb2e19b30f845"]);
    if(loc.page===2) equal([n,a.width,a.height,a.sha256],[11,2026,1432,"b7f4d241060ce243045d32d068fb35ed8b19ba2c5568b9fed74b1cc70fe35404"]);
    return loc.page;
  });
  equal(pages,[...autumn2018AssetPages[n-1]]);
  for(const [kind,rows] of Object.entries(p)) {
    assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
    for(const r of rows) schema(kind==="rights"?kind:kind.slice(0,-1),r);
  }
  validateSourceFormat(base,template); return {original,base,template};
}

/** Callers supply separately approved excluded records. A boolean cannot
 * replace the source, image, content and code evidence pinned here. */
export async function build2018AutumnAfternoonCandidate(inputs: Autumn2018MajorInput[],packet: Autumn2018Packet) {
  equal([...inputs].map(i=>i.number).sort((a,b)=>a-b),[...paper.majorNumbers]);
  equal([packet.questionPaper.sha256,packet.questionPaper.byteLength],[paper.questionPaper.sha256,paper.questionPaper.byteLength]);
  equal([packet.answerPaper.sha256,packet.answerPaper.byteLength],[paper.answerPaper.sha256,paper.answerPaper.byteLength]);
  equal(packet.instructions.map(i=>i.page),[1,3]);
  for(const pin of [packet.questionPaper,packet.answerPaper,packet.acquisition,...packet.instructions.map(i=>i.file),
    packet.instructionReview,packet.cropBoundaryReview,packet.materialScopeReview,packet.policySourceReview,packet.pixelReview]) await checkFile(pin);
  samePins(packet.codePins,await workspacePins());
  equal(packet.policySource,await checkedPolicySource(packet.policySourceReview));
  await checkedMaterialScopes(packet.materialScopeReview);
  const candidate: Autumn2018Candidate={sources:[structuredClone(packet.policySource)],rights:[],assets:[],questions:[],templates:[],sets:[],exams:[]};
  const metadataEdits: {id:string;field:string;before:string;after:string}[]=[];
  for(const input of [...inputs].sort((a,b)=>a.number-b.number)) {
    const {number:n,prepared:p,review}=input; const {base,template}=shape(n,p);
    assert.equal(template.originalContentSha256,await contentHash(base));
    assert.equal(review.number,n); assert.equal(review.recordsSha256,await contentHash(p));
    assert(review.reviewerIds.length&&review.evidence.length);
    assert(["transcription","materials","independentSemantics","display"].every(k=>review.checks[k as keyof typeof review.checks]==="pass"));
    for(const pin of review.evidence) await checkFile(pin);
    assert(path.isAbsolute(input.assetsRoot));
    for(const asset of p.assets) {
      const file=path.resolve(input.assetsRoot,asset.path); assert(file.startsWith(path.resolve(input.assetsRoot)+path.sep));
      await checkFile({path:file,sha256:asset.sha256,byteLength:asset.byteLength});
    }
    const admitted=structuredClone(p);
    for(const s of admitted.sources) {
      const before=s.limits;
      assert(typeof before==="string","autumn_source_limits_type");
      let limits=before;
      if(s.id===`source-ipa-${source(n)}-qs`) limits="当該問の原本文・図表・注記・全選択肢の出典。付属資料と独自解説は、それぞれ別の出典・権利情報を表示する。";
      else if(s.id===`source-ipa-${source(n)}-ans`) limits="当該問の公式解答の出典。アプリの解説・用語補足は本プロジェクトの独自記述。";
      else if(s.id.endsWith("-common")) limits="当該冊子の疑似言語の記法・演算子・制御構造と注記。原問題と生成問題から参照する。";
      else if(s.id.endsWith("-erratum")) limits="当該冊子に添付された問11の公式正誤表。問題本文と分けて参照できる。";
      else if(s.id.endsWith("-sheet")) limits="当該冊子の表計算の仕様と注記。マクロの疑似言語は別の共通仕様も参照する。";
      else if(s.id.endsWith("-casl")) limits="原物理p78〜83の必要なアセンブラ仕様。p80は命令・全凡例の上部だけを抜粋し、JIS1.3の見出し・本文・表を含まない。数値演算の問題で、文字符号表は参照しない。";
      else if(s.id.endsWith("-api")) limits="当該冊子の原物理p75〜77にある8型9操作の試験用機能要約だけ。Oracle HTMLやAPI全文の利用許諾を示すものではなく、原文・署名を変更しない固定参考として別の権利範囲を表示する。";
      s.limits=limits;
      if(limits!==before) metadataEdits.push({id:s.id,field:"limits",before,after:limits});
    }
    for(const q of admitted.questions) {
      q.distribution="included";
      q.review.notes="原全頁・全解答欄・全解答群の対応と、今回の素材範囲・独立検算・原形式の査読を記録。通常アプリと配布の受入は、この問題集の検証記録でも確認する。";
      if(q.origin.kind==="official_adaptation") for(const c of q.origin.changes)
        if(c.summary==="原形式を保った画面用の管理描画と可変条件") c.details=legacyAfternoonPublicNotes[source(n)];
      equal(autumn2018LearningPayload(q),autumn2018LearningPayload(p.questions.find(b=>b.id===q.id)!));
    }
    admitted.templates[0].distribution="included";
    admitted.templates[0].originalContentSha256=await contentHash(admitted.questions.find(q=>q.id===baseId(n))!);
    for(const k of ["sources","rights","assets","questions","templates"] as const) (candidate[k] as unknown[]).push(...admitted[k]);
  }
  candidate.sources.push(autumn2018BookletSource());
  candidate.exams=[autumn2018Exam("study",false),autumn2018Exam("practice",false),autumn2018Exam("study",true),autumn2018Exam("practice",true)];
  const originals=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===autumn2018OriginalId(n))!));
  const bases=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===baseId(n))!));
  candidate.sets=[{schemaVersion:"3.0.0",id:"set-annual-2018-autumn-pm",revision:1,title:"2018年度 秋期・午後",subject:"B",distribution:"included",questionRefs:originals,
    examConfigRefs:candidate.exams.slice(0,2).map(e=>({id:e.id,revision:e.revision})),generationBindings:[],questionSelection:autumn2018QuestionSelection(originals)},
    {schemaVersion:"3.0.0",id:"set-mix-2018-autumn-pm",revision:1,title:"2018年度 秋期・旧午後 ランダムミックス",subject:"B",distribution:"included",questionRefs:bases,
      examConfigRefs:candidate.exams.slice(2).map(e=>({id:e.id,revision:e.revision})),generationBindings:bases.map((questionRef,i)=>({questionRef,templateRef:{id:templateId(i+1),revision:candidate.templates[i].revision}}))}];
  for(const [kind,rows] of Object.entries(candidate)) {assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);for(const r of rows)schema(kind==="rights"?kind:kind.slice(0,-1),r);}
  physicalAssetCount(candidate);
  equal([candidate.sources.length,candidate.rights.length,candidate.questions.length,candidate.templates.length,candidate.assets.length],[34,19,26,13,89]);
  return {candidate,metadataEdits,candidateSHA256:await contentHash(candidate),status:"candidate_pending_normal_app_release_gate"};
}
export async function autumn2018GlobalMixPatch(existing: SetRecord,candidate: Autumn2018Candidate) {
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

export const autumn2018ReleaseChecks=["npmCheck","annualStudy13","annualPractice75Selections7At9000",
  "randomMix","searchBookmarks","answerGrading","saveResumeHistory","sourceLicenseDisplay",
  "visualLightDarkMobile","existingCurrentAnd2022Regression"] as const;
export interface Autumn2018ReleaseReceipt {
  candidateSHA256: string; assetsRoot: string; codePins: FilePin[];
  materialScopeReview: FilePin; policySourceReview: FilePin;
  checks: Record<typeof autumn2018ReleaseChecks[number],{status:"pass";evidence:FilePin[]}>;
}
export const autumn2018ReleaseCodePins=workspacePins;
export async function check2018AutumnAfternoonRelease(candidate: Autumn2018Candidate,receipt: Autumn2018ReleaseReceipt) {
  assert.equal(receipt.candidateSHA256,await contentHash(candidate),"autumn_stale_release_candidate");
  await checkedMaterialScopes(receipt.materialScopeReview);
  const policy=await checkedPolicySource(receipt.policySourceReview);
  equal(candidate.sources.filter(source=>source.id===policy.id),[policy]);
  equal(candidate.sources.filter(source=>source.id==="source-ipa-2018h30a-fe-pm-booklet"),[autumn2018BookletSource()]);
  const physicalAssets=physicalAssetCount(candidate);
  equal([candidate.sources.length,candidate.rights.length,candidate.questions.length,candidate.templates.length,
    candidate.assets.length,candidate.sets.length,candidate.exams.length],[34,19,26,13,89,2,4]);
  for(const n of paper.majorNumbers) {
    const belongs=(id: string,prefix: string)=>id===prefix+source(n)||id.startsWith(prefix+source(n)+"-");
    const p: Autumn2018Records={
      sources:candidate.sources.filter(s=>belongs(s.id,"source-ipa-")),
      rights:candidate.rights.filter(r=>belongs(r.id,"rights-ipa-")),
      assets:candidate.assets.filter(a=>a.attribution.sourceRefs[0]?.locator.questionNumber===String(n)),
      questions:structuredClone(candidate.questions.filter(q=>[autumn2018OriginalId(n),baseId(n)].includes(q.id))),
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
  const annual=candidate.sets.find(s=>s.id==="set-annual-2018-autumn-pm");assert(annual);
  const originals=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===autumn2018OriginalId(n))!));
  equal(annual.questionRefs,originals);equal(annual.questionSelection,autumn2018QuestionSelection(originals));
  assert.equal(annual.distribution,"included");equal(annual.generationBindings,[]);
  equal(annual.examConfigRefs,[autumn2018Exam("study",false),autumn2018Exam("practice",false)].map(e=>({id:e.id,revision:e.revision})));
  equal(candidate.exams,[autumn2018Exam("study",false),autumn2018Exam("practice",false),autumn2018Exam("study",true),autumn2018Exam("practice",true)]);
  const mix=candidate.sets.find(s=>s.id==="set-mix-2018-autumn-pm");assert(mix);assert.equal(mix.distribution,"included");
  equal(mix.examConfigRefs,[autumn2018Exam("study",true),autumn2018Exam("practice",true)].map(e=>({id:e.id,revision:e.revision})));
  const bases=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===baseId(n))!));
  equal(mix.questionRefs,bases);equal(mix.generationBindings,bases.map((questionRef,i)=>({questionRef,templateRef:{id:templateId(i+1),revision:candidate.templates[i].revision}})));
  assert(path.isAbsolute(receipt.assetsRoot));
  for(const asset of candidate.assets) {
    const file=path.resolve(receipt.assetsRoot,asset.path);assert(file.startsWith(path.resolve(receipt.assetsRoot)+path.sep));
    await checkFile({path:file,sha256:asset.sha256,byteLength:asset.byteLength});
  }
  samePins(receipt.codePins,await workspacePins());
  for(const key of autumn2018ReleaseChecks) {
    const check=receipt.checks[key];assert(check?.status==="pass"&&check.evidence.length,"autumn_missing_release_check:"+key);
    for(const pin of check.evidence)await checkFile(pin);
  }
  return {scope:paper.id,status:"release_checks_pass",candidateSHA256:receipt.candidateSHA256,
    majors:13,answerFields:73,scoredAnswerFields:72,answerDefinitionGroups:69,assets:89,physicalAssetFiles:physicalAssets,broaderPre2023Readiness:"separate_unchanged_not_claimed_complete",pushPerformed:false};
}
