import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { readDistributionBundle } from '../scripts/distribution-files';
import review from '../scripts/source-evidence/stage3-s3-002-review.json';
import answers from './fixtures/legacy-2016-autumn-am-official-answers.json';
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
import { stage3AutumnMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import { bindQuestion, parametersForSeed } from '../src/core/generation';
import { validateSourceFigure } from '../src/core/source-figures';
import { validateSourceFormat } from '../src/core/generation-formats';
import { SourceFigure } from '../src/ui/SourceFigure';
import { Content } from '../src/ui/Content';
import { AnswerChoices } from '../src/ui/AnswerChoices';
import { materialPages } from '../src/ui/MaterialViewer';
import { questionStudyTerms } from '../src/core/study-terms';
import { refKey, refOf, type Selection, type Run } from '../src/core/types';
import { sourceScope, sourceExclusions } from '../scripts/source-inventory';

const bundle=readDistributionBundle();
await validateBundle(bundle);
const collection='2016h28a-fe-am',id='set-annual-'+collection;
const expected=Array.from({length:80},(_,i)=>i+1).filter(n=>![55,56,57].includes(n));
const annual=sourceCollections(bundle,'A').find(s=>s.id===id)!;
assert(annual,'S3-002 must be admitted in the complete actual distribution; no reduced candidate fallback');
const byRef=new Map(bundle.questions.map(q=>[refKey(refOf(q)),q]));
const coverage=generationCoverage(bundle);
const sourceNumber=(q:Run['issued'][number])=>Number(q.origin.sourceRefs.find(r=>r.locator.questionNumber)?.locator.questionNumber);
const select=(kind:'annual'|'mix',mode:'study'|'practice'='practice'):Selection=>({kind,mode,subject:'A',year:2016,size:'public',bindingMode:kind==='annual'?'original_data':'generated_values',
  ...(kind==='annual'?{sourceCollectionId:id}:{mixProfileCollectionId:id})});

test('S3-002 release admission requires the recorded source, independent and real-app review while retaining all material holds',()=>{
  assert.equal(review.status,'reviewed_source_and_normal_app');assert.equal(review.releaseUnitReady,true);
  for(const gate of [review.rootSourceReview,review.independent,review.normalApp]){
    assert.equal(gate.status,'pass');assert(gate.evidence && typeof gate.evidence==='object');
    const e=gate.evidence as {path?:unknown;sha256?:unknown};assert.equal(typeof e.path,'string');assert.match(String(e.sha256),/^[a-f0-9]{64}$/);
  }
  assert.equal(review.questions.length,77);assert(review.questions.every(q=>Object.values(q.checks).every(c=>c==='pass')&&q.testFiles.length>0));
  assert.equal(review.wholeScopeReady,false);assert.equal(review.held.length,3);
});

test('S3-002 retains all80 obligations and publishes exactly77 source/base/generator pairs, with all three material holds absent',async()=>{
  assert.equal(review.expectedTotal,80);assert.deepEqual(review.includedNumbers,expected);
  assert.deepEqual(review.held.map(h=>h.number),[55,56,57]);
  assert(review.held.every(h=>h.reason.length>10 && !h.bodyPublished));assert.equal(review.wholeScopeReady,false);
  assert.equal(expected.length,77);assert.deepEqual(annual.questionRefs.map(r=>sourceNumber(byRef.get(refKey(r))!)),expected);
  assert.deepEqual(stage3AutumnMorningDefinitions.map(d=>Number(d.source.split('-').at(-1))),expected);
  for(const n of expected){
    const original=byRef.get(refKey({questionId:`question-ipa-${collection}-${n}`,revision:1}))!;
    assert.equal(original.origin.kind,'official_reprint');assert.equal(original.learning.area,({T:'technology',M:'management',S:'strategy'} as const)[answers.records[n-1].officialArea as 'T'|'M'|'S']);
    assert.equal(original.correctAnswer.choiceId,original.choices['アイウエ'.indexOf(answers.records[n-1].officialKey)].id);
    const {base,template}=bookmarkTemplate(bundle,refOf(original),coverage);
    for(const q of [original,base]){const pages=materialPages(q);assert.deepEqual(pages[0].content.blocks,q.prompt.blocks);assert.equal(pages.filter(p=>p.commonReference).length,2);}
    if(n===8||n===41)for(const q of [original,base])assert(questionStudyTerms(q,bundle.assets).some(t=>t.sources?.includes(collection+'-'+n)),'source-specific study aids are connected in the ordinary runtime');
    assert.equal(await contentHash(base),template.originalContentSha256);assert.equal(template.generatorRef.id,'generator-source-'+collection+'-'+n);
    assert.equal(bookmarkSource(bundle,refOf(base),coverage).id,original.id);
    if(n===15){
      const text=original.explanation.blocks.map(b=>'text'in b?b.text:'').join('');
      assert.match(text,/原問題の本文には.*独立性は明示されていません/);
      assert.match(text,/公式正答に対応する独立な故障モデル/);
      assert(!text.includes('補足した独立条件から'),'original explanation cannot pretend the generated premise is in the original');
      assert(!original.origin.isModified);
      assert(base.prompt.blocks.some(b=>b.type==='paragraph'&&b.text.includes('2台の故障は独立')));
    }
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

test('S3-002 morning stays selectable in its year/period group while afternoon availability follows independent source obligations',()=>{
  const groups=menuSourceGroups(bundle),group=groups.find(g=>g.collections.some(s=>s.id===id))!;
  const afternoonExpected=sourceScope.some(source=>source.startsWith('2016h28a-fe-pm-')&&!Object.hasOwn(sourceExclusions,source));
  assert(group);assert.equal(group.title,'旧制度 · 2016年度 秋期');assert.equal(group.collections.length,afternoonExpected?2:1);
  assert.deepEqual(menuSubjectOptions(group).map(o=>[o.title,o.available]),[['旧制度・午前',true],['旧制度・午後',afternoonExpected]]);
  for(const kind of ['annual','mix'] as const){const chosen=chooseMenuSourceGroup(groups,select(kind),group.id);assert.equal(chosen.subject,'A');assert.equal(chosen[kind==='annual'?'sourceCollectionId':'mixProfileCollectionId'],id);
    if(afternoonExpected){const afternoon=chooseMenuSourceGroup(groups,chosen,group.id,'B');assert.equal(afternoon.subject,'B');const key=kind==='annual'?'sourceCollectionId':'mixProfileCollectionId';assert.notEqual(afternoon[key],id);assert(group.collections.some(s=>s.subject==='B'&&s.id===afternoon[key]));}
    else assert.throws(()=>chooseMenuSourceGroup(groups,chosen,group.id,'B'),{code:'SOURCE_COLLECTION'});
  }
});

test('S3-002 uses77 admitted questions, official150 minutes and independently fixed50/7/20 area counts',()=>{
  const p=mixProfile(bundle,select('mix'));assert.equal(p.publicCount,77);assert.equal(p.questionCount,77);assert.equal(p.fullCount,undefined);
  assert.deepEqual(p.quota,{technology:50,management:7,strategy:20});assert.equal(p.timeLimitSeconds,9000);
  assert.throws(()=>mixProfile(bundle,{...select('mix'),size:'full'}),{code:'PROFILE_SCOPE'});
  for(const kind of ['annual','mix'] as const){const selected=selectQuestions(bundle,select(kind),a=>a);assert.equal(selected.questions.length,77);assert.equal(selected.exam.questionCount,77);assert.equal(selected.exam.timeLimitSeconds,9000);assert.equal(selected.exam.practiceScope,'public_subset');}
});

test('S3-002 search and bookmarks expose all77 originals, preserve source numbers after gaps and never expose held questions',()=>{
  const own=new Set(expected.map(n=>'question-ipa-'+collection+'-'+n));
  assert.deepEqual(searchableQuestions(bundle).filter(q=>own.has(q.id)).map(q=>q.id).sort(),[...own].sort());
  const docs=questionSearchDocuments(bundle),found=findSearchDocuments(docs,{...emptySearch,year:2016,subject:'A',kind:'question'});
  assert.equal(docs.filter(d=>own.has(d.question.id)).length,77);assert.equal(found.filter(d=>own.has(d.question.id)).length,77);
  for(const n of [1,54,58,61,64,67,80]){
    const original=byRef.get(refKey({questionId:'question-ipa-'+collection+'-'+n,revision:1}))!;
    assert.match(sourceQuestionLabel(original),new RegExp('問'+n+'$'));assert.equal(displayQuestionNumber(original,0),String(n));
    const mark=makeBookmark(bundle,refOf(original),100000),{base}=bookmarkTemplate(bundle,refOf(original),coverage);
    assert.deepEqual(makeBookmark(bundle,refOf(base),100000),mark);
    assert.deepEqual(selectQuestions(bundle,bookmarkGroupSelection([mark]),a=>a).set.questionRefs,[refOf(base)]);
  }
  for(const held of review.held)assert(!docs.some(d=>d.question.id==='question-ipa-'+collection+'-'+held.number));
});

test('S3-002 actual annual and generated sessions preserve answers through JSON restore,150-minute timing and77-question grading',async()=>{
  for(const kind of ['annual','mix'] as const){
    const selection=select(kind),prepared=selectQuestions(bundle,selection,a=>a);
    let run=startRun(await prepareRun(bundle,selection,{},100000,undefined,prepared),101000);
    assert.equal(run.issued.length,77);assert.equal(remaining(run,101000),9000);assert.equal(run.instances.length,kind==='mix'?77:0);
    assert.deepEqual(run.issued.map(sourceNumber).sort((a,b)=>a-b),expected);
    run=updateAnswer(run,run.issued[0].correctAnswer.choiceId,102000);
    const saved=JSON.parse(JSON.stringify(run)) as Run;await validateRun(saved);
    assert.equal(saved.session.entries[0].selectedChoiceId,run.issued[0].correctAnswer.choiceId);assert.equal(remaining(saved,103000),8998);
    const finished=finishRun(saved,'completed',104000);await validateRun(finished);
    assert.equal(finished.result!.total,77);assert.equal(finished.result!.correct,1);assert.equal(finished.result!.unanswered,76);
    const wrong=structuredClone(finished);wrong.exam.questionCount=80;await assert.rejects(validateRun(wrong),{code:'SESSION_CONFIG'});
  }
});

test('S3-002 every441 finite binding renders through ordinary Content/AnswerChoices, with shared matrices and strict correlated diagrams',async()=>{
  let total=0;
  for(const definition of stage3AutumnMorningDefinitions){
    const n=Number(definition.source.split('-').at(-1)),base=bundle.questions.find(q=>q.id==='question-template-source-'+definition.source)!,template=bundle.templates.find(t=>t.id==='template-source-'+definition.source)!;
    assert.equal(definition.fields.length,1);
    for(let value=definition.fields[0].minimum;value<=definition.fields[0].maximum;value++){
      const q=await bindQuestion(base,template,[value],'s3-render-'+n+'-'+value,'2026-11-01T00:00:00Z');
      validateSourceFormat(q,template);
      for(const b of [...q.prompt.blocks,...q.choices.flatMap(c=>c.content.blocks),...q.contexts.flatMap(c=>c.content.blocks)])if(b.type==='diagram')validateSourceFigure(b.scene);
      const prompt=render(h(Content,{content:q.prompt,bundle,assetUrls:{},showAttribution:false}));
      const choices=render(h(AnswerChoices,{question:q,entry:{choiceOrder:q.choices.map(c=>c.id)},bundle,assetUrls:{},disabled:false,revealed:false}));
      assert(!prompt.includes('<img'));assert(!choices.includes(' 正答'));assert.equal((choices.match(/type="radio"/g)??[]).length,4);
      if(n===18){
        assert.equal((choices.match(/<table/g)??[]).length,1,'source18 retains one shared a/b/c matrix');
        assert.equal((choices.match(/<thead/g)??[]).length,1);
        const rows=[...(choices.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)?.[1]??'').matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].map(m=>m[0]);
        assert.equal(rows.length,4);
        q.choices.forEach((choice,i)=>{const block=choice.content.blocks[0];assert(block.type==='table');assert(rows[i].includes('value="'+choice.id+'"'));for(const cell of block.rows[0])assert(rows[i].includes(cell),'shared matrix must bind each displayed row to its own choices');});
        if(value===0){
          const reverse=[...q.choices].reverse(),markup=render(h(AnswerChoices,{question:q,entry:{choiceOrder:reverse.map(c=>c.id)},bundle,assetUrls:{},disabled:false,revealed:false}));
          const rowIds=[...markup.matchAll(/type="radio"[^>]*value="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(rowIds,reverse.map(c=>c.id));
          for(const change of ['original','otherSource','otherYear','otherPeriod','otherTimeSlot'] as const){
            const other=structuredClone(q);
            if(change==='original')other.origin.kind='official_reprint';
            else for(const ref of other.origin.sourceRefs)if(ref.locator.questionNumber==='18'){
              if(change==='otherSource')ref.sourceId='source-ipa-2016h28h-fe-am-qs';
              else if(change==='otherYear')ref.locator.year=2017;
              else if(change==='otherPeriod')ref.locator.period='春期';
              else ref.locator.timeSlot='午後';
            }
            const html=render(h(AnswerChoices,{question:other,entry:{choiceOrder:other.choices.map(c=>c.id)},bundle,assetUrls:{},disabled:false,revealed:false}));assert(!html.includes('class="legacy-am-matrix"'),'matrix dispatch is limited to reviewed autumn18 adaptations');
          }
        }
      }
      for(const block of [...q.prompt.blocks,...q.choices.flatMap(c=>c.content.blocks)])if(block.type==='diagram'&&block.scene.kind==='source_figure'){
        const markup=render(h(SourceFigure,{scene:block.scene,caption:block.caption}));
        assert.equal((markup.match(/class="diagram-scroll"/g)??[]).length,1,'each source figure has exactly one scroll/focus host');
      }
      total++;
    }
  }
  assert.equal(total,441);
});
