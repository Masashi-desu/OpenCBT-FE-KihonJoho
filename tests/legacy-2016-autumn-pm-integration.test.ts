import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {readDistributionBundle} from '../scripts/distribution-files';
import review from '../scripts/source-evidence/legacy-2016-autumn-pm-source-review.json';
import {autumn2016PmSets,S3_003_ASSET_PAGES,S3_003_QUESTION_SHA,S3_003_ANSWER_SHA} from '../scripts/legacy-2016-autumn-pm-metadata';
import {makeAutumn2016PmRecords} from '../scripts/legacy-2016-autumn-pm-records';
import {autumn2016PmPageAssetId} from '../src/core/generators/legacy-2016-autumn-pm-materials';
import {specs as a} from '../scripts/legacy-2016-autumn-pm-01-04-specs';
import {specs as b} from '../scripts/legacy-2016-autumn-pm-05-08-specs';
import {specs as c} from '../scripts/legacy-2016-autumn-pm-09-13-specs';
import {validateBundle} from '../src/core/validation';
import {contentHash,sha256} from '../src/core/hash';
import {generationCoverage} from '../src/core/generation-coverage';
import {sourceCollections} from '../src/core/source-collections';
import {menuSourceGroups,menuSubjectOptions,chooseMenuSourceGroup} from '../src/core/menu-selection';
import {selectQuestions} from '../src/core/selection';
import {mixProfile} from '../src/core/mix-profile';
import {prepareRun,startRun,updatePartAnswer,finishRun,remaining,validateRun} from '../src/core/session';
import {gradeAnswer,answerLabels} from '../src/core/answers';
import {bookmarkSource,bookmarkTemplate,makeBookmark} from '../src/core/bookmarks';
import {questionSearchDocuments} from '../src/core/search';
import {bindQuestion} from '../src/core/generation';
import {sourceFigureDomains,validateSourceFigure} from '../src/core/source-figures';
import {Content} from '../src/ui/Content';
import {AnswerChoices} from '../src/ui/AnswerChoices';
import {materialPages} from '../src/ui/MaterialViewer';
import {refOf,refKey,type Run,type Selection,type Question} from '../src/core/types';

const specs=[...a,...b,...c],bundle=readDistributionBundle();
await validateBundle(bundle);
const book='2016h28a-fe-pm',scope='2016-autumn-pm',id='set-annual-'+scope;
const ref=(n:number,base=false)=>({questionId:(base?'question-template-source-':'question-ipa-')+book+'-'+n,revision:1});
const originals=specs.map(spec=>bundle.questions.find(q=>q.id===ref(spec.number).questionId)!);
const select=(kind:'annual'|'mix',mode:'study'|'practice'='study'):Selection=>({kind,mode,subject:'B',year:2016,size:'public',bindingMode:kind==='annual'?'original_data':'generated_values',...(kind==='annual'?{sourceCollectionId:id}:{mixProfileCollectionId:id})});
const mark=(q:Question)=>q.correctAnswer.parts!.map((answer,i)=>{assert.equal(answer.kind,'choice');if(answer.kind!=='choice')throw Error('unexpected answer');return 'アイウエオカキクケコサシ'[q.answerParts![i].choiceIds.indexOf(answer.choiceId)];});

test('S3-003 retains all13 official obligations and76 answer fields with one original/base/generator/mix binding per major',async()=>{
 assert.equal(specs.length,13);assert(originals.every(Boolean));assert.equal(review.officialTargets,13);assert.equal(review.officialAnswerFields,76);
 const coverage=generationCoverage(bundle);
 for(const spec of specs){const q=originals[spec.number-1],row=review.rows[spec.number-1];assert.equal(q.origin.kind,'official_reprint');assert.equal(q.answerParts!.length,row.officialFieldCount);assert.deepEqual(mark(q),row.officialFields.map(f=>f.key));assert(!q.origin.isModified);assert.equal(q.correctAnswer.attribution.sourceRefs[0].locator.page,row.officialAnswerPaperPage);assert.equal(row.officialAnswerPaperPage,1);
  const {base,template}=bookmarkTemplate(bundle,refOf(q),coverage);assert.equal(base.id,ref(spec.number,true).questionId);assert.equal(template.generatorRef.id,'generator-source-'+book+'-'+spec.number);assert.equal(await contentHash(base),template.originalContentSha256);
  assert.equal(row.materialPotentialIssue,null);assert(!q.correctAnswer.parts!.some(p=>p.kind!=='choice'));
 }
 assert.equal(originals.reduce((n,q)=>n+q.answerParts!.length,0),76);
 assert.deepEqual(bundle.sets.find(s=>s.id==='set-mix-'+scope)!.questionRefs,specs.map(s=>ref(s.number,true)));
});

test('S3-003 source assets have exact checked bytes and exclude the whole JIS page while preserving the necessary CASL excerpt',async()=>{
 const assets=bundle.assets.filter(asset=>asset.id.startsWith('asset-ipa-'+book+'-'));
 assert.equal(assets.length,80);assert.equal(S3_003_ASSET_PAGES.length,80);
 assert.deepEqual(assets.map(a=>Number(a.id.match(/p(\d+)/)![1])),S3_003_ASSET_PAGES);
 for(const asset of assets){const bytes=fs.readFileSync('public/data/'+asset.path);assert.equal(await sha256(bytes),asset.sha256);assert.equal(bytes.length,asset.byteLength);assert.equal(asset.width,1432);assert(asset.alt.length>80);
  const n=Number(asset.id.match(/p(\d+)/)![1]);assert.equal(asset.height,n===73?1230:2026);assert.equal(asset.id.endsWith('-casl-excerpt'),n===73);
 }
 const crop=assets.find(a=>a.id.includes('p073'))!;assert.equal(crop.sha256,'a63239604660d75093cca7fa3242b2be526d9b21ffa4e6b6b191c7ae7551ea1e');assert(!crop.alt.includes('JIS X 0201'));
 const sources=bundle.sources.filter(s=>s.id.startsWith('source-ipa-'+book));
 for(const source of sources){if(source.id.endsWith('-qs'))assert.equal(source.sha256,S3_003_QUESTION_SHA);else if(source.id.endsWith('-ans'))assert.equal(source.sha256,S3_003_ANSWER_SHA);}
 for(const q of originals){assert.deepEqual(q.prompt.blocks.flatMap(b=>b.type==='image'?[b.assetId]:[]),specs[originals.indexOf(q)].pages.map(p=>`asset-ipa-${book}-p${String(p).padStart(3,'0')}`));assert(q.prompt.attribution.rightsRefs.length);}
});

test('S3-003 year/term group selects morning77 or afternoon13 in both annual and mix modes without renaming them A/B',()=>{
 const groups=menuSourceGroups(bundle),group=groups.find(g=>g.collections.some(c=>c.id===id))!;assert(group);assert.equal(group.title,'旧制度 · 2016年度 秋期');
 assert.deepEqual(menuSubjectOptions(group).map(o=>[o.title,o.available]),[['旧制度・午前',true],['旧制度・午後',true]]);
 assert.equal(sourceCollections(bundle,'A').find(c=>c.id==='set-annual-2016h28a-fe-am')!.questionRefs.length,77);
 for(const kind of ['annual','mix']as const){const afternoon=chooseMenuSourceGroup(groups,select(kind),group.id,'B');assert.equal(afternoon.subject,'B');const key=kind==='annual'?'sourceCollectionId':'mixProfileCollectionId';assert.equal(afternoon[key],id);assert.equal(selectQuestions(bundle,afternoon,a=>a).questions.length,13);const morning=chooseMenuSourceGroup(groups,afternoon,group.id,'A');assert.equal(morning.subject,'A');assert.equal(selectQuestions(bundle,morning,a=>a).questions.length,77);}
 assert.equal(mixProfile(bundle,select('mix')).publicCount,13);
});

function combinations<T>(xs:T[],k:number):T[][]{if(k===0)return[[]];return xs.flatMap((x,i)=>combinations(xs.slice(i+1),k-1).map(ys=>[x,...ys]));}
test('S3-003 preserves every75 legal7-major selections and150-minute limit from the actual official cover',()=>{
 const policies=autumn2016PmSets();assert.equal(policies.sets.length,2);assert.equal(policies.exams.length,4);
 let count=0;
 for(const four of combinations([2,3,4,5,6,7],4))for(const lang of [9,10,11,12,13]){const numbers=[1,...four,8,lang].sort((a,b)=>a-b);
  for(const kind of ['annual','mix']as const){const selection={...select(kind,'practice'),selectedQuestionRefs:numbers.map(n=>ref(n))};const chosen=selectQuestions(bundle,selection,a=>a);assert.equal(chosen.questions.length,7);assert.deepEqual(chosen.questions.map(q=>Number(q.origin.sourceRefs[0].locator.questionNumber)),numbers);assert.equal(chosen.exam.questionCount,7);assert.equal(chosen.exam.timeLimitSeconds,9000);}
  count++;
 }
 assert.equal(count,75);
});

test('S3-003 official and generated76-field answers survive save/restore and aggregate the actual field denominator',async()=>{
 for(const kind of ['annual','mix']as const){const selection=select(kind),prepared=selectQuestions(bundle,selection,a=>a);let run=startRun(await prepareRun(bundle,selection,{},100000,undefined,prepared),101000);
  assert.equal(run.issued.length,13);
  for(let i=0;i<13;i++){run.session.currentIndex=i;for(const answer of run.issued[i].correctAnswer.parts!){assert.equal(answer.kind,'choice');if(answer.kind==='choice')run=updatePartAnswer(run,answer.partId,answer.choiceId,102000);}}
  const saved=JSON.parse(JSON.stringify(run))as Run;await validateRun(saved);assert.deepEqual(saved.session.entries,run.session.entries);
  const finished=finishRun(saved,'completed',103000);await validateRun(finished);assert.equal(finished.result!.correct,13);assert.deepEqual(finished.result!.partSummary,{total:76,correct:76,incorrect:0,unanswered:0,unscored:0,learningAccuracyPercent:100});
  const altered=structuredClone(saved);altered.session.currentIndex=0;const cleared=updatePartAnswer(altered,altered.issued[0].answerParts![0].id,undefined,103000);assert.equal(gradeAnswer(cleared.issued[0],cleared.session.entries[0]).outcome,'unanswered');
  const practice={...select(kind,'practice'),selectedQuestionRefs:[1,2,3,4,5,8,9].map(n=>ref(n))},preparedPractice=selectQuestions(bundle,practice,a=>a),timed=startRun(await prepareRun(bundle,practice,{},100000,undefined,preparedPractice),101000);assert.equal(timed.issued.length,7);assert.equal(remaining(timed,101000),9000);
 }
});

test('S3-003 all90 finite generated inputs render required content before answering through ordinary Content and AnswerChoices',async()=>{
 let total=0;
 for(const spec of specs){const {base,template}=bookmarkTemplate(bundle,ref(spec.number),generationCoverage(bundle));
  for(let v=spec.definition.fields[0].minimum;v<=spec.definition.fields[0].maximum;v++){const q=await bindQuestion(base,template,[v],`render-s3-003-${spec.number}-${v}`,'2026-11-02T00:00:00Z');const all=[...q.prompt.blocks,...q.choices.flatMap(c=>c.content.blocks),...q.contexts.flatMap(c=>c.content.blocks)];
   assert(!all.some(b=>b.type==='code'&&b.language==='text'),'required content must not enter initially closed PDF auxiliary text');for(const block of all)if(block.type==='diagram'){validateSourceFigure(block.scene);assert(block.scene.kind==='source_figure'&&Object.hasOwn(sourceFigureDomains,block.scene.profile));}
   const prompt=render(h(Content,{content:q.prompt,bundle,assetUrls:{},showAttribution:false}));assert(!prompt.includes('<details'));assert(!prompt.includes('display:none'));
   const choices=render(h(AnswerChoices,{question:q,entry:{choiceOrder:q.choices.map(c=>c.id)},bundle,assetUrls:{},disabled:false,revealed:false}));assert(!choices.includes('正答'));assert(choices.includes('radio'));assert.equal(q.answerParts!.length,spec.original.answerParts!.length);assert(answerLabels(q).length>5);total++;
  }
 }
 assert.equal(total,90);
});

test('S3-003 every original is searchable and bookmarkable with fixed references available before answering',()=>{
 const documents=questionSearchDocuments(bundle),coverage=generationCoverage(bundle);
 for(const q of originals){assert.equal(documents.filter(d=>d.question.id===q.id).length,1);const {base}=bookmarkTemplate(bundle,refOf(q),coverage);assert.equal(bookmarkSource(bundle,refOf(base),coverage).id,q.id);assert.deepEqual(makeBookmark(bundle,refOf(base),100000),makeBookmark(bundle,refOf(q),100000));
  for(const content of [q,base]){const pages=materialPages(content);assert(pages.length);assert.deepEqual(pages.filter(p=>p.id.startsWith('prompt-')).flatMap(p=>p.content.blocks),content.prompt.blocks);for(const id of content.assetRefs)assert(bundle.assets.some(a=>a.id===id));}
 }
 assert.equal(originals[0].contexts.flatMap(c=>c.content.blocks).filter(b=>b.type==='image').length,1);
 assert(originals[11].assetRefs.some(id=>id.endsWith('-p073-casl-excerpt')));
});

test('S3-003 authoring factory retains source-bank labels, separately credited editorial notices and exact fixed-reference capabilities',async()=>{
 const records=await makeAutumn2016PmRecords({specs,assets:bundle.assets.filter(a=>a.id.startsWith('asset-ipa-'+book)),sources:bundle.sources.filter(s=>s.id.startsWith('source-ipa-'+book)),rights:bundle.rights.filter(r=>r.id.startsWith('rights-ipa-'+book)),reviews:Object.fromEntries(originals.map((q,i)=>[i+1,q.review])),checkedOn:'2026-11-02'});
 assert.equal(records.questions.length,26);assert.equal(records.templates.length,13);assert.equal(records.assets.length,80);
 for(const record of records.questions){const actual=bundle.questions.find(q=>q.id===record.id)!;assert.deepEqual({...record,distribution:'included'},actual);}
 for(const record of records.templates){const actual=bundle.templates.find(t=>t.id===record.id)!;const base=bundle.questions.find(q=>q.id===record.baseQuestionRef.questionId)!;assert.deepEqual({...record,distribution:'included',originalContentSha256:await contentHash(base)},actual);}
});

test('S3-003 editorial errata notices and unchanged official references retain independently specified attributions',()=>{
 for(const q of [originals[0],bundle.questions.find(q=>q.id===ref(1,true).questionId)!]){
  const notice=q.contexts.find(c=>c.title==='原資料を読む際の補足')!;assert(notice);assert.equal(notice.content.attribution.origin,'original');assert.deepEqual(notice.content.attribution.rightsRefs,['rights-original']);assert.deepEqual(notice.content.attribution.sourceRefs,[]);
  const errata=q.contexts.find(c=>c.title==='問1 公式正誤表と訂正文')!;assert(errata);assert.equal(errata.content.attribution.origin,'official');assert.deepEqual(errata.content.attribution.rightsRefs,['rights-ipa-2016h28a-fe-pm-common']);assert.equal(errata.content.attribution.sourceRefs[0].locator.page,2);
 }
 const q8=originals[7];assert.deepEqual(q8.contexts.flatMap(c=>c.content.blocks).flatMap(b=>b.type==='image'?[b.assetId]:[]),['asset-ipa-2016h28a-fe-pm-p004','asset-ipa-2016h28a-fe-pm-p005']);
 for(const q of [originals[11],bundle.questions.find(q=>q.id===ref(12,true).questionId)!]){const excerpt=q.contexts.find(c=>c.content.blocks.some(b=>b.type==='image'&&b.assetId==='asset-ipa-2016h28a-fe-pm-p073-casl-excerpt'))!;assert(excerpt);assert.equal(excerpt.content.attribution.origin,'adapted');assert.equal(excerpt.content.attribution.sourceRefs[0].locator.page,73);}
 assert.throws(()=>autumn2016PmPageAssetId(73),{code:'SOURCE_MATERIAL'});assert.equal(autumn2016PmPageAssetId(73,true),'asset-ipa-2016h28a-fe-pm-p073-casl-excerpt');assert.throws(()=>autumn2016PmPageAssetId(72,true),{code:'SOURCE_MATERIAL'});
});
