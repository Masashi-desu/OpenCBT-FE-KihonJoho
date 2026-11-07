import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { readDistributionBundle } from '../scripts/distribution-files';
import { sourceScope, sourceExclusions } from '../scripts/source-inventory';
import review from '../scripts/source-evidence/stage3-s3-001-review.json';
import answers from './fixtures/legacy-2016-spring-am-official-answers.json';
import { validateBundle } from '../src/core/validation';
import { generationCoverage } from '../src/core/generation-coverage';
import { contentHash, sha256 } from '../src/core/hash';
import { menuSourceGroups, menuSubjectOptions, chooseMenuSourceGroup } from '../src/core/menu-selection';
import { sourceCollections } from '../src/core/source-collections';
import { sourceQuestionLabel, displayQuestionNumber } from '../src/core/source-label';
import { mixProfile } from '../src/core/mix-profile';
import { selectQuestions } from '../src/core/selection';
import { prepareRun, startRun, appendRunQuestion, updateAnswer, validateRun, finishRun, remaining } from '../src/core/session';
import { bookmarkSource, bookmarkTemplate, makeBookmark, bookmarkGroupSelection } from '../src/core/bookmarks';
import { searchableQuestions, questionSearchDocuments, findSearchDocuments, emptySearch } from '../src/core/search';
import { stage3MorningDefinitions } from '../src/core/generators/stage3-morning-install';
import { bindQuestion, parametersForSeed } from '../src/core/generation';
import { validateSourceFigure } from '../src/core/source-figures';
import { validateSourceFormat } from '../src/core/generation-formats';
import { Content } from '../src/ui/Content';
import { AnswerChoices } from '../src/ui/AnswerChoices';
import { assertSpring2016SVG } from './fixtures/legacy-2016-spring-fundamentals-svg';
import { decodeSpring2016, spring2016Trees } from '../src/core/generators/legacy-2016-spring-fundamentals-models';
import { materialPages } from '../src/ui/MaterialViewer';
import { questionStudyTerms } from '../src/core/study-terms';
import { refKey, refOf, type Selection, type Run } from '../src/core/types';

const bundle=readDistributionBundle();
await validateBundle(bundle);
const collection='2016h28h-fe-am',id='set-annual-'+collection;
const expected=Array.from({length:80},(_,i)=>i+1).filter(n=>![46,56,60,63,66].includes(n));
const annual=sourceCollections(bundle,'A').find(s=>s.id===id)!;
assert(annual,'S3-001 must be admitted in the complete actual distribution; no reduced candidate fallback');
const byRef=new Map(bundle.questions.map(q=>[refKey(refOf(q)),q]));
const originalsById=new Map(annual.questionRefs.map(ref=>[ref.questionId,byRef.get(refKey(ref))!]));
const coverage=generationCoverage(bundle);
const sourceNumber=(q:Run['issued'][number])=>Number(q.origin.sourceRefs.find(r=>r.locator.questionNumber)?.locator.questionNumber);
const select=(kind:'annual'|'mix',mode:'study'|'practice'='practice'):Selection=>({kind,mode,subject:'A',year:2016,size:'public',bindingMode:kind==='annual'?'original_data':'generated_values',
  ...(kind==='annual'?{sourceCollectionId:id}:{mixProfileCollectionId:id})});

test('S3-001 release admission requires the recorded source, independent and real-app review while retaining all material holds',()=>{
  assert.equal(review.status,'reviewed_source_and_normal_app');assert.equal(review.releaseUnitReady,true);
  for(const gate of [review.rootSourceReview,review.independent,review.normalApp]){
    assert.equal(gate.status,'pass');assert(gate.evidence && typeof gate.evidence==='object');
    const e=gate.evidence as {path?:unknown;sha256?:unknown};assert.equal(typeof e.path,'string');assert.match(String(e.sha256),/^[a-f0-9]{64}$/);
  }
  assert.equal(review.questions.length,75);assert(review.questions.every(q=>Object.values(q.checks).every(c=>c==='pass')&&q.testFiles.length>0));
  assert.equal(review.wholeScopeReady,false);assert.equal(review.held.length,5);
});

test('S3-001 retains all80 obligations and publishes exactly75 source/base/generator pairs, with all five material holds absent',async()=>{
  assert.equal(review.expectedTotal,80);assert.deepEqual(review.includedNumbers,expected);
  assert.deepEqual(review.held.map(h=>h.number),[46,56,60,63,66]);
  assert(review.held.every(h=>h.reason.length>10 && !h.bodyPublished));assert.equal(review.wholeScopeReady,false);
  assert.equal(expected.length,75);assert.deepEqual(annual.questionRefs.map(r=>sourceNumber(byRef.get(refKey(r))!)),expected);
  assert.deepEqual(stage3MorningDefinitions.map(d=>Number(d.source.split('-').at(-1))),expected);
  for(const n of expected){
    const original=originalsById.get(`question-ipa-${collection}-${n}`)!;
    assert.equal(original.origin.kind,'official_reprint');assert.equal(original.learning.area,answers.questions[n-1].area);
    assert.equal(original.correctAnswer.choiceId,original.choices['アイウエ'.indexOf(answers.questions[n-1].key)].id);
    const {base,template}=bookmarkTemplate(bundle,refOf(original),coverage);
    for(const q of [original,base]){const pages=materialPages(q);assert.deepEqual(pages[0].content.blocks,q.prompt.blocks);assert.equal(pages.filter(p=>p.commonReference).length,2);}
    if(n===4||n===80)for(const q of [original,base])assert(questionStudyTerms(q,bundle.assets).some(t=>t.sources?.includes(collection+'-'+n)),'source-specific study aids are connected in the ordinary runtime');
    assert.equal(await contentHash(base),template.originalContentSha256);assert.equal(template.generatorRef.id,'generator-source-'+collection+'-'+n);
    assert.equal(bookmarkSource(bundle,refOf(base),coverage).id,original.id);
    assert(original.contexts.some(c=>c.content.attribution.sourceRefs.some(r=>r.locator.page===2)));
    assert(original.contexts.some(c=>c.content.attribution.sourceRefs.some(r=>r.locator.page===3)));
    for(const assetId of original.assetRefs){const a=bundle.assets.find(a=>a.id===assetId)!;const bytes=fs.readFileSync('public/data/'+a.path);assert.equal(await sha256(bytes),a.sha256);assert.equal(bytes.length,a.byteLength);assert(a.alt.length>30);}
  }
  for(const held of review.held){
    for(const prefix of ['question-ipa-','question-template-source-'])assert(!bundle.questions.some(q=>q.id===prefix+collection+'-'+held.number));
    assert(!bundle.templates.some(t=>t.id==='template-source-'+collection+'-'+held.number));
    assert(!bundle.assets.some(a=>a.id==='asset-ipa-'+collection+'-'+held.number));
  }
});

test('S3-001 morning remains selectable while its same-period afternoon follows source obligations',()=>{
  const groups=menuSourceGroups(bundle),group=groups.find(g=>g.collections.some(s=>s.id===id))!;
  const afternoonExpected=sourceScope.some(source=>source.startsWith('2016h28h-fe-pm-')&&!Object.hasOwn(sourceExclusions,source));
  assert(group);assert.equal(group.title,'旧制度 · 2016年度 春期');assert.equal(group.collections.length,afternoonExpected?2:1);
  assert.deepEqual(menuSubjectOptions(group).map(o=>[o.title,o.available]),[['旧制度・午前',true],['旧制度・午後',afternoonExpected]]);
  for(const kind of ['annual','mix'] as const){
    const chosen=chooseMenuSourceGroup(groups,select(kind),group.id), key=kind==='annual'?'sourceCollectionId':'mixProfileCollectionId';
    assert.equal(chosen.subject,'A');assert.equal(chosen[key],id);
    if(afternoonExpected) {
      const afternoon=chooseMenuSourceGroup(groups,chosen,group.id,'B');
      assert.equal(afternoon.subject,'B');assert.equal(afternoon[key],'set-annual-2016-spring-pm');
    } else assert.throws(()=>chooseMenuSourceGroup(groups,chosen,group.id,'B'),{code:'SOURCE_COLLECTION'});
  }
});

test('S3-001 uses75 admitted questions, official150 minutes and independently fixed49/9/17 area counts',()=>{
  const p=mixProfile(bundle,select('mix'));assert.equal(p.publicCount,75);assert.equal(p.questionCount,75);assert.equal(p.fullCount,undefined);
  assert.deepEqual(p.quota,{technology:49,management:9,strategy:17});assert.equal(p.timeLimitSeconds,9000);
  assert.throws(()=>mixProfile(bundle,{...select('mix'),size:'full'}),{code:'PROFILE_SCOPE'});
  for(const kind of ['annual','mix'] as const){const selected=selectQuestions(bundle,select(kind),a=>a);assert.equal(selected.questions.length,75);assert.equal(selected.exam.questionCount,75);assert.equal(selected.exam.timeLimitSeconds,9000);assert.equal(selected.exam.practiceScope,'public_subset');}
});

test('S3-001 search and bookmarks expose all75 originals, preserve source numbers after gaps and never expose held questions',()=>{
  const own=new Set(expected.map(n=>'question-ipa-'+collection+'-'+n));
  assert.deepEqual(searchableQuestions(bundle).filter(q=>own.has(q.id)).map(q=>q.id).sort(),[...own].sort());
  const docs=questionSearchDocuments(bundle),found=findSearchDocuments(docs,{...emptySearch,year:2016,subject:'A',kind:'question'});
  assert.equal(docs.filter(d=>own.has(d.question.id)).length,75);assert.equal(found.filter(d=>own.has(d.question.id)).length,75);
  for(const n of [1,47,57,61,64,67,80]){
    const original=originalsById.get('question-ipa-'+collection+'-'+n)!;
    assert.match(sourceQuestionLabel(original),new RegExp('問'+n+'$'));assert.equal(displayQuestionNumber(original,0),String(n));
    const mark=makeBookmark(bundle,refOf(original),100000),{base}=bookmarkTemplate(bundle,refOf(original),coverage);
    assert.deepEqual(makeBookmark(bundle,refOf(base),100000),mark);
    assert.deepEqual(selectQuestions(bundle,bookmarkGroupSelection([mark]),a=>a).set.questionRefs,[refOf(base)]);
  }
  for(const held of review.held)assert(!docs.some(d=>d.question.id==='question-ipa-'+collection+'-'+held.number));
});

test('S3-001 actual annual and generated sessions preserve answers through JSON restore,150-minute timing and75-question grading',async()=>{
  for(const kind of ['annual','mix'] as const){
    const selection=select(kind),prepared=selectQuestions(bundle,selection,a=>a);
    let run=startRun(await prepareRun(bundle,selection,{},100000,undefined,prepared),101000);
    assert.equal(run.issued.length,75);assert.equal(remaining(run,101000),9000);assert.equal(run.instances.length,kind==='mix'?75:0);
    assert.deepEqual(run.issued.map(sourceNumber).sort((a,b)=>a-b),expected);
    run=updateAnswer(run,run.issued[0].correctAnswer.choiceId,102000);
    const saved=JSON.parse(JSON.stringify(run)) as Run;await validateRun(saved);
    assert.equal(saved.session.entries[0].selectedChoiceId,run.issued[0].correctAnswer.choiceId);assert.equal(remaining(saved,103000),8998);
    const finished=finishRun(saved,'completed',104000);await validateRun(finished);
    assert.equal(finished.result!.total,75);assert.equal(finished.result!.correct,1);assert.equal(finished.result!.unanswered,74);
    const wrong=structuredClone(finished);wrong.exam.questionCount=80;await assert.rejects(validateRun(wrong),{code:'SESSION_CONFIG'});
  }
});

test('S3-001 can start a75-question mix after the two original Q1 conditions were consumed in one saved bookmark practice',async ctx=>{
  const original=bundle.questions.find(q=>q.id==='question-ipa-'+collection+'-1')!;
  const {base,template}=bookmarkTemplate(bundle,refOf(original),coverage),seeds=new Map<number,string>();
  for(let i=0;i<4096&&seeds.size<3;i++){
    const seed=i.toString(16).padStart(32,'0'),index=(await parametersForSeed(seed,template)).values[0];
    if(index<3&&!seeds.has(index))seeds.set(index,seed);
  }
  assert.equal(seeds.size,3);let seed=seeds.get(0)!;
  const random=crypto.getRandomValues.bind(crypto);
  ctx.mock.method(crypto,'getRandomValues',(array:Uint8Array)=>{
    if(array instanceof Uint8Array&&array.length===16){array.set(Uint8Array.from(seed.match(/../g)!,x=>parseInt(x,16)));return array;}
    return random(array);
  });
  const selection=bookmarkGroupSelection([makeBookmark(bundle,refOf(original),100000)]);
  let run=startRun(await prepareRun(bundle,selection,{},100000),101000);
  seed=seeds.get(1)!;run=await appendRunQuestion(run,refOf(base),102000,run.instances);
  assert.deepEqual(run.instances.map(i=>i.parameters.values),[[0],[1]]);
  const saved=JSON.parse(JSON.stringify(finishRun(run,'completed',103000))) as Run;await validateRun(saved);
  seed=seeds.get(2)!;
  const mixed=await prepareRun(bundle,select('mix','study'),{},104000,undefined,undefined,saved.instances);
  await validateRun(mixed);assert.equal(mixed.issued.length,75);
  assert.deepEqual(mixed.instances.find(i=>i.templateRef.id===template.id)!.parameters.values,[2]);
});

test('S3-001 every688 finite binding renders through ordinary Content/AnswerChoices, with shared matrices and strict correlated diagrams',async()=>{
  let total=0;
  for(const definition of stage3MorningDefinitions){
    const n=Number(definition.source.split('-').at(-1)),base=bundle.questions.find(q=>q.id==='question-template-source-'+definition.source)!,template=bundle.templates.find(t=>t.id==='template-source-'+definition.source)!;
    assert.equal(definition.fields.length,1);
    for(let value=definition.fields[0].minimum;value<=definition.fields[0].maximum;value++){
      const q=await bindQuestion(base,template,[value],'s3-render-'+n+'-'+value,'2026-11-01T00:00:00Z');
      validateSourceFormat(q,template);
      for(const b of [...q.prompt.blocks,...q.choices.flatMap(c=>c.content.blocks),...q.contexts.flatMap(c=>c.content.blocks)])if(b.type==='diagram')validateSourceFigure(b.scene);
      const prompt=render(h(Content,{content:q.prompt,bundle,assetUrls:{},showAttribution:false}));
      const choices=render(h(AnswerChoices,{question:q,entry:{choiceOrder:q.choices.map(c=>c.id)},bundle,assetUrls:{},disabled:false,revealed:false}));
      assert(!prompt.includes('<img'));assert(!choices.includes(' 正答'));assert.equal((choices.match(/type="radio"/g)??[]).length,4);
      if(n===8||n===35)assert.equal((choices.match(/<table/g)??[]).length,1);
      if(n===5)assert(!choices.includes('<table'));
      if([2,5,7,8].includes(n)){const values=decodeSpring2016(n,[value]);assertSpring2016SVG(n,prompt+choices,values,n===5?spring2016Trees[values[0]]:undefined);}
      total++;
    }
  }
  assert.equal(total,688);
  assert.throws(()=>validateSourceFigure({kind:'source_figure',profile:'legacy-2016-spring-am-23-logic',values:[1,2,3,0]}));
  assert.throws(()=>validateSourceFigure({kind:'source_figure',profile:'legacy-2016-spring-am-49',values:[0,0,1,1,1,2]}));
});
