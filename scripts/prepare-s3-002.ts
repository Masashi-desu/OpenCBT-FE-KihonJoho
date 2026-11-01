/** Explicit fresh staging only. Source/meaning/application admission is separate. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import type {Asset,Rights,Source} from '../src/core/types';
import facts from '../tests/fixtures/legacy-2016-autumn-am-source-facts.json';
import official from '../tests/fixtures/legacy-2016-autumn-am-official-answers.json';
import sourceReview from './source-evidence/legacy-2016-autumn-am-source-review.json';
import {stage3AutumnMorningDefinitions} from '../src/core/generators/stage3-morning-install';
import {autumn2016CommonAlt,autumn2016CommonPremise,autumn2016StandardRows} from '../src/core/generators/legacy-2016-autumn-am-common';
import {makeStage3MorningRecords,stage3MorningSourceRef,type Stage3MorningFact} from './stage3-morning-records';
import {writeStage3CollectionCandidate} from './stage3-collection-transport';

const collection='2016h28a-fe-am',checkedOn=facts.reviewedOn;
const reviewRoot='output/source-review/s3-002-2016-autumn-am/source-audit',right='rights-ipa-'+collection;
const held=[55,56,57],numbers=Array.from({length:80},(_,i)=>i+1).filter(n=>!held.includes(n));
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
function png(file:string){const bytes=fs.readFileSync(file);assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));return{path:file,sha256:hash(bytes),byteLength:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};}
export function autumn2016ReviewedFacts():Stage3MorningFact[]{
  assert.equal(facts.officialTargets,80);assert.deepEqual(facts.rows.map(r=>r.number),Array.from({length:80},(_,i)=>i+1));
  assert.deepEqual(facts.materialHeldNumbers,held);assert.deepEqual(sourceReview.materials.eligibleNumbers,numbers);
  assert.deepEqual(sourceReview.materials.heldNumbers,held);assert.equal(facts.materialEligibleCount,77);
  assert.deepEqual(stage3AutumnMorningDefinitions.map(d=>d.source),numbers.map(n=>collection+'-'+n));
  for(const row of facts.rows.filter(r=>held.includes(r.number)))assert.equal(row.bodyIncluded,false,'held text cannot enter the source fixture');
  return facts.rows.filter(r=>numbers.includes(r.number)).map(row=>{
    assert(row.bodyIncluded&&row.status==='eligible_materials_reviewed'&&row.crop&&row.fullAlt,'reviewed literal source row');
    const crop=row.crop;assert.equal(crop.path,path.join(reviewRoot,'crops',`q${String(row.number).padStart(2,'0')}.png`));
    assert.equal(crop.sourcePagePNG,`pages/page-${String(row.pdfPage).padStart(2,'0')}.png`);
    const image=png(crop.path);assert.deepEqual([image.sha256,image.width,image.height,image.byteLength],[crop.sha256,crop.width,crop.height,crop.byteLength]);
    assert.equal(row.officialKey,official.records[row.number-1].officialKey);assert.equal(row.source,collection+'-'+row.number);
    assert.deepEqual([image.width,image.height],[crop.cropBox[2]-crop.cropBox[0],crop.cropBox[3]-crop.cropBox[1]]);
    const page=png(path.join(reviewRoot,crop.sourcePagePNG));assert.equal(page.sha256,crop.sourcePageSHA256);
    assert(crop.cropBox[0]>=0&&crop.cropBox[1]>=0&&crop.cropBox[2]<=page.width&&crop.cropBox[3]<=page.height);
    assert.equal(row.learningArea,({T:'technology',M:'management',S:'strategy'} as Record<string,string>)[official.records[row.number-1].officialArea]);
    return{source:row.source,number:row.number,page:row.pdfPage,officialKey:row.officialKey,alt:row.fullAlt,
      area:row.learningArea as Stage3MorningFact['area'],choiceShuffleAllowed:row.choiceShuffleAllowed,
      crop:{...image,cropBox:[...crop.cropBox]}};
  });
}
export function autumn2016PublicSourcesAndRights():{sources:Source[];rights:Rights[]}{
  const meta=facts.metadata;
  for(const[file,h]of [['questions.pdf',meta.questionSHA256],['answers.pdf',meta.answerSHA256]])assert.equal(hash(fs.readFileSync(path.join(reviewRoot,'primary',file))),h,'fresh official paper bytes');
  const sources:Source[]=[...([false,true] as const).map(answer=>({schemaVersion:'3.0.0',id:'source-ipa-'+collection+(answer?'-ans':'-qs'),
    title:`平成28年度 秋期 基本情報技術者試験 午前 ${answer?'解答例':'問題冊子'}`,publisher:meta.publisher,url:answer?meta.answerURL:meta.questionURL,
    sha256:answer?meta.answerSHA256:meta.questionSHA256,checkedOn,type:answer?'official_answer':'official_problem',availability:'officially_published',
    scope:'全80問の公式資料。今回の掲載対象は問55〜57を除く77問と共通表記p2–3。',sections:answer?['p1 全80問の公式正答・分野']:['p1 全80問・150分','p2–3 共通表記','p4–37 問1–80'],
    dateNote:'2016年度秋期の公式試験資料。独立したPDF公開日は確認できておらず、取得日と区別する。',facts:['原問番号・欠番と実際の掲載問数を保持し、公式全80問と区別する。'],
    supports:['annual-sets','random-mix','answer-validation'],limits:'IPAの公開は第三者素材の包括許諾ではない。掲載対象外の条件を推定しない。'} as Source)),
    ...(['faq','siteinfo'] as const).map(name=>{const fetched=meta.retrievedSources.find(r=>r.path==='primary/'+name+'.html');assert(fetched&&fetched.status===200);const actual=fs.readFileSync(path.join(reviewRoot,'primary',name+'.html'));assert.equal(hash(actual),fetched.sha256);
      return{schemaVersion:'3.0.0',id:'source-ipa-'+collection+'-'+name,title:name==='faq'?'IPA 試験FAQ（過去問題の使用）':'IPA ウェブサイトのご利用について',publisher:meta.publisher,url:fetched.url,
        sha256:fetched.sha256,checkedOn,type:'policy',availability:'officially_published',scope:'2016年度秋期旧午前の掲載対象77問と共通表記の教材利用条件。',sections:[name==='faq'?'その他／過去問題の使用方法と留意点':'著作権について・商標について'],
        dateNote:'確認日と公開日を区別する。',facts:name==='faq'?['公表過去問題の教育等の目的での利用と出典・改変表示、著作権留保の案内。']:['出所と個別条件、第三者の商標等の権利を維持する。'],
        supports:['ingestion','attribution'],limits:'Git同梱・ブラウザ表示・可変問題化の用途別判断であり、個別許諾取得又は第三者素材の包括的な利用承諾ではない。'} as Source;})];
  const rights:Rights[]=[{schemaVersion:'3.0.0',id:right,holders:['独立行政法人情報処理推進機構'],basis:'official_policy',
    evidence:[{sourceId:'source-ipa-'+collection+'-faq',locator:{section:'その他／過去問題の使用方法と留意点'}},{sourceId:'source-ipa-'+collection+'-siteinfo',locator:{section:'著作権について'}}],
    scope:'2016年度秋期旧午前の問55〜57を除く77問のIPA作問部分・全選択肢・図表・正答と、共通表記p2–3。規格・第三者資料の本文への許可を意味しない。',
    uses:{repositoryRedistribution:'allowed',browserDisplay:'allowed',adaptation:'allowed'},licenseId:'LicenseRef-IPA-Past-Exam',modificationNoticeRequired:true,
    attributionText:'出典：平成28年度 秋期 基本情報技術者試験 午前。©2016 独立行政法人情報処理推進機構。',checkedOn,
    thirdParty:{status:'none_identified',notes:'掲載対象の原画像・全択・注記・全図表を個別査読。共通p2は規格名称と版、p3はIPAの記号表。問58は基準名への参照と一般的機能の短語であり、原基準の文章・図を新規転載しない。第三者表現の利用条件が未確認の問55〜57を含めない。',rightsRefs:[]},
    assessmentNotes:'学習用Git同梱・ブラウザ表示・原形式に沿う可変化を教育目的利用として用途別に判断し、出典・改変表示と権利留保を維持する。IPA原資料へMIT/CC0を付与せず、独自解説は公式解説と区別する。問58に関する当時のMETI資料取得の未完事項は、基準本文を新規利用しない今回の掲載判断と分けて記録する。'}];
  return{sources,rights};
}
export function autumn2016CommonAssets():{assets:Asset[];files:Map<string,string>}{
  const files=new Map<string,string>(),alts=[autumn2016CommonPremise+' 1. 規格・標準。表は試験問題での表記と規格・標準の名称の2列。'+autumn2016StandardRows.map(r=>r[0]+'：'+r[1]).join('。'),autumn2016CommonAlt()];
  const assets=[2,3].map((page,i)=>{const image=png(path.join(reviewRoot,'pages',`page-0${page}.png`)),id='asset-ipa-'+collection+'-common-'+page;files.set(id,image.path);
    return{schemaVersion:'3.0.0',id,path:'assets/stage3-'+collection+'-common-'+page+'.png',mediaType:'image/png',sha256:image.sha256,width:image.width,height:image.height,byteLength:image.byteLength,
      alt:alts[i],attribution:{origin:'official',sourceRefs:[stage3MorningSourceRef(collection,undefined,page)],rightsRefs:[right],creatorIds:['ipa']}} as Asset;});return{assets,files};
}
export async function prepareS3002(out:string,baselineRoot='public/data'){
  const rows=autumn2016ReviewedFacts(),common=autumn2016CommonAssets(),policy=autumn2016PublicSourcesAndRights();
  const records=await makeStage3MorningRecords({collectionId:collection,facts:rows,definitions:stage3AutumnMorningDefinitions,commonAssets:common.assets,...policy,checkedOn});
  // The official reprint has no explicit failure-independence premise. Its own
  // explanation must distinguish the answer model from the generated addition.
  const original15=records.questions.find(q=>q.id==='question-ipa-'+collection+'-15')!;
  const explanation15=original15.explanation.blocks[0];assert(explanation15.type==='paragraph');
  assert(explanation15.text.includes('補足した独立条件から'));
  explanation15.text='原問題の本文には、2台の故障の独立性は明示されていません。ここでは公式正答に対応する独立な故障モデルで計算します。生成問題では、この独立条件を解答前の本文に明記しています。'+explanation15.text.replace('補足した独立条件から','故障が独立であるモデルでは');
  for(const row of rows)common.files.set('asset-ipa-'+row.source,row.crop.path);
  const result=writeStage3CollectionCandidate(path.resolve(baselineRoot),records,common.files,path.resolve(out));
  return{...result,actualAdmission:false as const};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),base=args.find(a=>a.startsWith('--baseline-root=')),plain=args.filter(a=>a!==base);
  assert(plain.length===2&&plain[0]==='--out','explicit fresh --out and optional --baseline-root required');
  const result=await prepareS3002(plain[1],base?.slice('--baseline-root='.length));console.log(JSON.stringify({candidate:plain[1],eligible:result.added.templates.length,total:result.actual.templates.length,actualAdmission:false}));
}
