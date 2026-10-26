/** A whole-booklet candidate only. This module neither grants material
 * permission nor writes public files; deployment requires a separate receipt. */
import assert from "node:assert/strict";
import path from "node:path";
import type { Attribution, Bundle, Question, SetRecord } from "../src/core/types";
import { refOf } from "../src/core/types";
import { contentHash } from "../src/core/hash";
import { schema } from "../src/core/validation";
import { validateSourceFormat } from "../src/core/generation-formats";
import { checkFile, required2017SpringAfternoonReleaseCodePins as workspacePins, type FilePin } from "./stage-2017-spring-afternoon";
import { spring2018Afternoon as paper, spring2018OriginalId, assertSpring2018OriginalAnswers,
  spring2018QuestionSelection, spring2018Exam } from "./legacy-2018-spring-afternoon-booklet";
import { legacyAfternoonPublicNotes } from "../src/core/generators/legacy-afternoon-public-notes";

export type Spring2018Records = Pick<Bundle,"sources"|"rights"|"assets"|"questions"|"templates">;
export type Spring2018Candidate = Spring2018Records & Pick<Bundle,"sets"|"exams">;
const source = (n: number) => `2018h30h-fe-pm-${n}`;
const baseId = (n: number) => `question-template-source-${source(n)}`;
const templateId = (n: number) => `template-source-${source(n)}`;
export const spring2018AssetPages = [
  [6,7,8,9,10],[11,12,13],[14,15,16,17],[18,19,20,21,22],
  [23,24,25,26,27,28],[29,30,31,32,33,34],[35,36,37],
  [38,39,40,41,42,43,4,5],[44,45,46,47,48,49],[50,51,52,53,54,55,2],
  [56,57,58,59,60,61,62],[63,64,65,66,67,74,75,76,77,78,79],
  [68,69,70,71,72,73,80,81,82,83,84,85,4,5],
] as const;
export interface Spring2018Review {
  number: number; recordsSha256: string; reviewerIds: string[];
  checks: Record<"transcription"|"materials"|"independentSemantics"|"display","pass">;
  evidence: FilePin[];
}
export interface Spring2018MajorInput {
  number: number; prepared: Spring2018Records; assetsRoot: string; review: Spring2018Review;
}
export interface Spring2018Packet {
  questionPaper: FilePin; answerPaper: FilePin; acquisition: FilePin;
  instructions: { page: 1|3; file: FilePin }[];
  instructionReview: FilePin; cropBoundaryReview: FilePin; unicodeReview: FilePin;
  pixelReview: FilePin; codePins: FilePin[];
}
const equal = (a: unknown,b: unknown) => assert.deepEqual(a,b);
function samePins(a: FilePin[],b: FilePin[]) {
  const rows=(pins: FilePin[])=>[...pins].sort((a,b)=>a.path.localeCompare(b.path)).map(p=>[p.path,p.sha256,p.byteLength]);
  assert.equal(new Set(a.map(p=>p.path)).size,a.length); equal(rows(a),rows(b));
}
export function spring2018LearningPayload(q: Question) {
  const { id,revision,lifecycle,subject,learning,contexts,contextRefs,prompt,choices,answerParts,
    correctAnswer,explanation,assetRefs,choiceShuffleAllowed }=q;
  return { id,revision,lifecycle,subject,learning,contexts,contextRefs,prompt,choices,answerParts,
    correctAnswer,explanation,assetRefs,choiceShuffleAllowed };
}
function shape(n: number,p: Spring2018Records) {
  assert(Number.isSafeInteger(n)&&n>=1&&n<=13,"spring_major_number");
  assert.equal(p.questions.length,2); assert.equal(p.templates.length,1);
  const original=p.questions.find(q=>q.id===spring2018OriginalId(n));
  const base=p.questions.find(q=>q.id===baseId(n)),template=p.templates[0]; assert(original&&base);
  assertSpring2018OriginalAnswers(original,n);
  assert.equal(original.origin.isModified,n===12);
  assert.equal(base.origin.kind,"official_adaptation"); assert.equal(base.origin.isModified,true);
  equal(base.origin.derivedFrom,[refOf(original)]);
  equal(template.baseQuestionRef,refOf(base)); assert.equal(template.id,templateId(n));
  assert.equal(template.generatorRef.id,`generator-source-${source(n)}`);
  assert.equal(template.distribution,"excluded"); assert.equal(template.bindingBasis,"official_source");
  assert.equal(p.rights.length,n===13?3:n===12?3:[8,10].includes(n)?2:1);
  for(const right of p.rights) {
    assert(Object.values(right.uses).every(v=>v==="allowed"),"spring_material_use_not_reviewed");
    assert(["none_identified","present_cleared"].includes(right.thirdParty.status),"spring_third_party_pending");
  }
  const sourceIds=new Set(p.sources.map(s=>s.id)),rightsIds=new Set(p.rights.map(r=>r.id));
  const groups=n===8?["common"]:n===10?["erratum"]:n===12?["casl"]:n===13?["spreadsheet","common"]:[];
  equal([...sourceIds].sort(),[`source-ipa-${source(n)}-qs`,`source-ipa-${source(n)}-ans`,
    ...groups.map(g=>`source-ipa-${source(n)}-${g}`),
    ...(n===12?["source-unicode-17-ucd-q12","source-unicode-v3-q12"]:[])].sort());
  equal([...rightsIds].sort(),[`rights-ipa-${source(n)}`,...groups.map(g=>`rights-ipa-${source(n)}-${g}`),
    ...(n===12?["rights-unicode-17-q12"]:[])].sort());
  const unicodeSources=new Map([
    ["source-unicode-17-ucd-q12",["https://www.unicode.org/Public/17.0.0/ucd/UnicodeData.txt","2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c"]],
    ["source-unicode-v3-q12",["https://www.unicode.org/license.txt","e7a93b009565cfce55919a381437ac4db883e9da2126fa28b91d12732bc53d96"]],
  ]);
  for(const s of p.sources) {
    assert.equal(s.availability,"officially_published");
    if(n===12&&unicodeSources.has(s.id)) equal([s.url,s.sha256],unicodeSources.get(s.id));
    else {
      assert(s.id.startsWith(`source-ipa-${source(n)}-`),"spring_foreign_source");
      const expected=s.type==="official_answer"?paper.answerPaper:paper.questionPaper;
      equal([s.url,s.sha256],[expected.url,expected.sha256]);
    }
  }
  const credit=(a: Attribution)=>{
    assert(a.sourceRefs.every(r=>sourceIds.has(r.sourceId)),"spring_foreign_material_source");
    assert(a.rightsRefs.every(r=>rightsIds.has(r)||r==="rights-original"),"spring_foreign_material_right");
  };
  for(const q of p.questions) {
    assert.equal(q.distribution,"excluded"); assert.equal(q.lifecycle,"active"); assert.equal(q.subject,"B");
    assert.equal(q.learning.area,n===6?"management":n===7?"strategy":"technology");
    assert.equal(q.choiceShuffleAllowed,false); assert(Object.values(q.review.checks).every(v=>v==="pass"),"spring_content_review_pending");
    assert(q.origin.sourceRefs.length&&q.origin.sourceRefs.every(r=>r.sourceId===`source-ipa-${source(n)}-qs`&&
      r.locator.year===2018&&r.locator.period==="春期"&&r.locator.timeSlot==="午後"&&r.locator.questionNumber===String(n)));
    equal(q.contextRefs,q.contexts.map(c=>c.id)); credit(q.correctAnswer.attribution);
    for(const c of [q.prompt,q.explanation,...q.choices.map(c=>c.content),...q.contexts.map(c=>c.content)]) {
      credit(c.attribution);
      for(const b of c.blocks) {
        if(b.type==="diagram") credit(b.attribution);
        if(b.type==="image") assert(p.assets.some(a=>a.id===b.assetId),"spring_missing_material_asset");
      }
    }
  }
  const pages=p.assets.map(a=>{
    assert.equal(a.mediaType,"image/webp"); credit(a.attribution); assert.equal(a.attribution.sourceRefs.length,1);
    const loc=a.attribution.sourceRefs[0].locator;
    equal([loc.year,loc.period,loc.timeSlot,loc.questionNumber],[2018,"春期","午後",String(n)]);
    if(loc.page===76) equal([n,a.width,a.height,a.sha256],[12,1432,1240,"fc293fd67f28ab4dcbe0c961cf6e6d12384b2525651dcf199a81ac5d647e988b"]);
    return loc.page;
  });
  equal(pages,[...spring2018AssetPages[n-1]]);
  if(n===12) {
    const r=p.rights.find(r=>r.id==="rights-unicode-17-q12"); assert(r);
    assert.equal(r.licenseId,"Unicode-3.0");
    for(const q of p.questions) assert(q.origin.changes.some(c=>c.kind==="diagram"&&c.affectsAnswer===false));
  }
  for(const [kind,rows] of Object.entries(p)) {
    assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
    for(const r of rows) schema(kind==="rights"?kind:kind.slice(0,-1),r);
  }
  validateSourceFormat(base,template); return {original,base,template};
}

/** Callers supply separately approved excluded records. A boolean cannot
 * replace the source, image, content and code evidence pinned here. */
export async function build2018SpringAfternoonCandidate(inputs: Spring2018MajorInput[],packet: Spring2018Packet) {
  equal([...inputs].map(i=>i.number).sort((a,b)=>a-b),[...paper.majorNumbers]);
  equal([packet.questionPaper.sha256,packet.questionPaper.byteLength],[paper.questionPaper.sha256,paper.questionPaper.byteLength]);
  equal([packet.answerPaper.sha256,packet.answerPaper.byteLength],[paper.answerPaper.sha256,paper.answerPaper.byteLength]);
  equal(packet.instructions.map(i=>i.page),[1,3]);
  for(const pin of [packet.questionPaper,packet.answerPaper,packet.acquisition,...packet.instructions.map(i=>i.file),
    packet.instructionReview,packet.cropBoundaryReview,packet.unicodeReview,packet.pixelReview]) await checkFile(pin);
  samePins(packet.codePins,await workspacePins());
  const candidate: Spring2018Candidate={sources:[],rights:[],assets:[],questions:[],templates:[],sets:[],exams:[]};
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
      assert(typeof before==="string","spring_source_limits_type");
      let limits=before;
      if(s.id===`source-ipa-${source(n)}-qs`) limits="当該問の原本文・図表・注記・全選択肢の出典。付属資料と独自解説は、それぞれ別の出典・権利情報を表示する。";
      else if(s.id===`source-ipa-${source(n)}-ans`) limits="当該問の公式解答の出典。アプリの解説・用語補足は本プロジェクトの独自記述。";
      else if(s.id.endsWith("-common")) limits="当該冊子の疑似言語の記法・演算子・制御構造と注記。原問題と生成問題から参照する。";
      else if(s.id.endsWith("-erratum")) limits="当該冊子に添付された問10の公式正誤表。問題本文と分けて参照できる。";
      else if(s.id.endsWith("-spreadsheet")) limits="当該冊子の表計算の仕様と注記。マクロの疑似言語は別の共通仕様も参照する。";
      else if(s.id.endsWith("-casl")) limits="原p74〜79の必要なアセンブラ仕様。p76は命令・全凡例の上部だけを抜粋し、文字符号表とその導入部分を含まない。必要な文字の符号値は別の独立参考資料を参照する。";
      else if(s.id==="source-unicode-v3-q12") limits="UnicodeData 17.0.0から独立編集した12文字の参考資料に適用する通知全文。IPA本文やJIS資料の利用条件とは別に保持する。";
      s.limits=limits;
      if(limits!==before) metadataEdits.push({id:s.id,field:"limits",before,after:limits});
    }
    for(const q of admitted.questions) {
      q.distribution="included";
      if(q.origin.kind==="official_adaptation") for(const c of q.origin.changes)
        if(c.summary==="原形式を保った画面用の管理描画と可変条件") c.details=legacyAfternoonPublicNotes[source(n)];
      equal(spring2018LearningPayload(q),spring2018LearningPayload(p.questions.find(b=>b.id===q.id)!));
    }
    admitted.templates[0].distribution="included";
    admitted.templates[0].originalContentSha256=await contentHash(admitted.questions.find(q=>q.id===baseId(n))!);
    for(const k of ["sources","rights","assets","questions","templates"] as const) (candidate[k] as unknown[]).push(...admitted[k]);
  }
  candidate.sources.push({schemaVersion:"3.0.0",id:"source-ipa-2018h30h-fe-pm-booklet",title:"平成30年度 春期 基本情報技術者試験 午後 表紙・問題選択方法",
    publisher:"独立行政法人情報処理推進機構（IPA）",url:paper.questionPaper.url,sha256:paper.questionPaper.sha256,checkedOn:"2026-10-27",type:"official_problem",availability:"officially_published",
    scope:"物理p1の時間と物理p3の問題選択方法。p2の問10正誤表は個別素材として保持する。",sections:["物理p1 表紙・150分","物理p3 問題選択"],dateNote:"試験年度から個別PDFの公開日を推測しない。",
    facts:["13大問。問1・8必須、問2〜7から4、問9〜13から1の計7大問・150分。","全74解答欄。順不同2欄を一つの正答定義で扱い、定義組数は73。公式配点・評価点とは別。"],
    supports:["annual-sets","random-mix","answer-validation"],limits:"時間と選択方法の出典のみ。個別素材の条件は各source/rightを参照する。"});
  candidate.exams=[spring2018Exam("study",false),spring2018Exam("practice",false),spring2018Exam("study",true),spring2018Exam("practice",true)];
  const originals=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===spring2018OriginalId(n))!));
  const bases=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===baseId(n))!));
  candidate.sets=[{schemaVersion:"3.0.0",id:"set-annual-2018-spring-pm",revision:1,title:"2018年度 春期・午後",subject:"B",distribution:"included",questionRefs:originals,
    examConfigRefs:candidate.exams.slice(0,2).map(e=>({id:e.id,revision:e.revision})),generationBindings:[],questionSelection:spring2018QuestionSelection(originals)},
    {schemaVersion:"3.0.0",id:"set-mix-2018-spring-pm",revision:1,title:"2018年度 春期・旧午後 ランダムミックス",subject:"B",distribution:"included",questionRefs:bases,
      examConfigRefs:candidate.exams.slice(2).map(e=>({id:e.id,revision:e.revision})),generationBindings:bases.map((questionRef,i)=>({questionRef,templateRef:{id:templateId(i+1),revision:candidate.templates[i].revision}}))}];
  for(const [kind,rows] of Object.entries(candidate)) {assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);for(const r of rows)schema(kind==="rights"?kind:kind.slice(0,-1),r);}
  equal([candidate.sources.length,candidate.rights.length,candidate.questions.length,candidate.templates.length,candidate.assets.length],[34,19,26,13,85]);
  return {candidate,metadataEdits,candidateSHA256:await contentHash(candidate),status:"candidate_pending_normal_app_release_gate"};
}
export async function spring2018GlobalMixPatch(existing: SetRecord,candidate: Spring2018Candidate) {
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

export const spring2018ReleaseChecks=["npmCheck","annualStudy13","annualPractice75Selections7At9000",
  "randomMix","searchBookmarks","answerGrading","saveResumeHistory","sourceLicenseDisplay",
  "visualLightDarkMobile","existingCurrentAnd2022Regression"] as const;
export interface Spring2018ReleaseReceipt {
  candidateSHA256: string; assetsRoot: string; codePins: FilePin[];
  checks: Record<typeof spring2018ReleaseChecks[number],{status:"pass";evidence:FilePin[]}>;
}
export const spring2018ReleaseCodePins=workspacePins;
export async function check2018SpringAfternoonRelease(candidate: Spring2018Candidate,receipt: Spring2018ReleaseReceipt) {
  assert.equal(receipt.candidateSHA256,await contentHash(candidate),"spring_stale_release_candidate");
  equal([candidate.sources.length,candidate.rights.length,candidate.questions.length,candidate.templates.length,
    candidate.assets.length,candidate.sets.length,candidate.exams.length],[34,19,26,13,85,2,4]);
  for(const n of paper.majorNumbers) {
    const belongs=(id: string,prefix: string)=>id===prefix+source(n)||id.startsWith(prefix+source(n)+"-");
    const p: Spring2018Records={
      sources:candidate.sources.filter(s=>belongs(s.id,"source-ipa-")||n===12&&["source-unicode-17-ucd-q12","source-unicode-v3-q12"].includes(s.id)),
      rights:candidate.rights.filter(r=>belongs(r.id,"rights-ipa-")||n===12&&r.id==="rights-unicode-17-q12"),
      assets:candidate.assets.filter(a=>a.attribution.sourceRefs[0]?.locator.questionNumber===String(n)),
      questions:structuredClone(candidate.questions.filter(q=>[spring2018OriginalId(n),baseId(n)].includes(q.id))),
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
  const annual=candidate.sets.find(s=>s.id==="set-annual-2018-spring-pm");assert(annual);
  const originals=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===spring2018OriginalId(n))!));
  equal(annual.questionRefs,originals);equal(annual.questionSelection,spring2018QuestionSelection(originals));
  assert.equal(annual.distribution,"included");equal(annual.generationBindings,[]);
  equal(annual.examConfigRefs,[spring2018Exam("study",false),spring2018Exam("practice",false)].map(e=>({id:e.id,revision:e.revision})));
  equal(candidate.exams,[spring2018Exam("study",false),spring2018Exam("practice",false),spring2018Exam("study",true),spring2018Exam("practice",true)]);
  const mix=candidate.sets.find(s=>s.id==="set-mix-2018-spring-pm");assert(mix);assert.equal(mix.distribution,"included");
  equal(mix.examConfigRefs,[spring2018Exam("study",true),spring2018Exam("practice",true)].map(e=>({id:e.id,revision:e.revision})));
  const bases=paper.majorNumbers.map(n=>refOf(candidate.questions.find(q=>q.id===baseId(n))!));
  equal(mix.questionRefs,bases);equal(mix.generationBindings,bases.map((questionRef,i)=>({questionRef,templateRef:{id:templateId(i+1),revision:candidate.templates[i].revision}})));
  assert(path.isAbsolute(receipt.assetsRoot));
  for(const asset of candidate.assets) {
    const file=path.resolve(receipt.assetsRoot,asset.path);assert(file.startsWith(path.resolve(receipt.assetsRoot)+path.sep));
    await checkFile({path:file,sha256:asset.sha256,byteLength:asset.byteLength});
  }
  samePins(receipt.codePins,await workspacePins());
  for(const key of spring2018ReleaseChecks) {
    const check=receipt.checks[key];assert(check?.status==="pass"&&check.evidence.length,"spring_missing_release_check:"+key);
    for(const pin of check.evidence)await checkFile(pin);
  }
  return {scope:paper.id,status:"release_checks_pass",candidateSHA256:receipt.candidateSHA256,
    majors:13,answerFields:74,answerDefinitionGroups:73,assets:85,broaderPre2023Readiness:"separate_unchanged_not_claimed_complete",pushPerformed:false};
}
