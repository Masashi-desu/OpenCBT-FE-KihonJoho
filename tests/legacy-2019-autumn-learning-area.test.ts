import test from 'node:test';
import assert from 'node:assert/strict';
import { readDistributionBundle } from '../scripts/distribution-files';
import { contentHash } from '../src/core/hash';
import { bindQuestion } from '../src/core/generation';
import { makeBookmark, filterBookmarks, bookmarkGroupSelection } from '../src/core/bookmarks';
import { questionSearchDocuments, findSearchDocuments, emptySearch } from '../src/core/search';
import { prepareRun, startRun, validateRun } from '../src/core/session';
import { refOf } from '../src/core/types';
import { originalId, baseId, selection } from './helpers/legacy-2019-autumn-app';

// Reviewed question roles, independent of the producer and learning metadata:
// Q1 security,Q2 parallelism,Q3 database,Q4 network,Q5 software design;
// Q6 testing/project progress,Q7 business profitability,Q8 algorithms;
// Q9 C,Q10 COBOL,Q11 Java,Q12 CASL II,Q13 spreadsheet programming.
// Old-PM security/programming remain in the technology area, as in the five
// already released old-PM booklets. Q6 and Q7 retain their distinct areas.
const expectedAreas = [
  'technology','technology','technology','technology','technology',
  'management','strategy','technology','technology','technology',
  'technology','technology','technology',
] as const;
const now = Date.UTC(2026,9,30);

test('all13 autumn source roles have reviewed areas on the original, typed base and bound question', async () => {
  const b=readDistributionBundle();
  assert.equal(b.questions.filter(q=>q.id.startsWith('question-ipa-2019r01a-fe-pm-')).length,13);
  assert.equal(b.questions.filter(q=>q.id.startsWith('question-template-source-2019r01a-fe-pm-')).length,13);
  for(let n=1;n<=13;n++) {
    const original=b.questions.find(q=>q.id===originalId(n))!,base=b.questions.find(q=>q.id===baseId(n))!;
    const t=b.templates.find(t=>t.baseQuestionRef.questionId===base.id)!;
    for(const q of[original,base,bindQuestion(base,t,t.referenceParameters.values,`area-review-${n}`,new Date(now).toISOString())]) {
      assert.equal(q.subject,'B');assert.equal(q.learning.area,expectedAreas[n-1],`${q.id}: source role ${n}`);
    }
    assert.equal(t.originalContentSha256,await contentHash(base));
  }
});

test('COBOL Q10 is searchable as technology and bookmark area pools keep Q6 management and Q7 strategy', async () => {
  const b=readDistributionBundle(),source=(n:number)=>b.questions.find(q=>q.id===originalId(n))!;
  const bookmarks=[6,7,10].map(n=>makeBookmark(b,refOf(source(n)),now));
  for(const [area,n]of[['technology',10],['management',6],['strategy',7]]as const) {
    const visible=filterBookmarks(bookmarks,{subject:'B',area});assert.deepEqual(visible.map(x=>x.id),[originalId(n)]);
    const run=startRun(await prepareRun(b,bookmarkGroupSelection(visible),{},now),now);
    assert.equal(run.issued.length,1);assert.equal(run.issued[0].learning.area,area);
    assert.equal(run.session.entries[0].questionRef.questionId,baseId(n));await validateRun(JSON.parse(JSON.stringify(run)));
  }
  const docs=questionSearchDocuments(b),q10=docs.find(d=>d.question.id===originalId(10))!;
  assert(q10.keywords.includes('テクノロジ'));assert(!q10.keywords.includes('マネジメント'));
  assert(findSearchDocuments(docs,{...emptySearch,subject:'B',year:2019,query:'COBOL テクノロジ',kind:'question'}).some(d=>d.question.id===originalId(10)));
});

test('annual and generated autumn runs preserve reviewed areas through their actual saved typed source and hashes', async () => {
  const b=readDistributionBundle();
  for(const kind of['annual','mix']as const) {
    const run=startRun(await prepareRun(b,selection(b,kind,'study'),{},now),now);
    assert.deepEqual(run.issued.map(q=>q.learning.area),expectedAreas);assert.equal(run.issued.length,13);
    const restored=JSON.parse(JSON.stringify(run));await validateRun(restored);
    assert.deepEqual(restored.issued,run.issued);assert.deepEqual(restored.instances,run.instances);
    const wrong=JSON.parse(JSON.stringify(run));wrong.issued[9].learning.area='management';await assert.rejects(validateRun(wrong));
  }
});
