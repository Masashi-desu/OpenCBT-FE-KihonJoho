import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fixture} from './fixtures';
import {contentHash} from '../src/core/hash';
import {check2018SpringAfternoonRelease,spring2018ReleaseChecks,spring2018ReleaseCodePins,
 type Spring2018Candidate,type Spring2018ReleaseReceipt} from '../scripts/stage-2018-spring-afternoon';

function registeredBooklet():Spring2018Candidate {
 const b=fixture(),source='2018h30h-fe-pm';
 return {sources:b.sources.filter(s=>s.id.startsWith('source-ipa-'+source)||['source-unicode-17-ucd-q12','source-unicode-v3-q12'].includes(s.id)),
  rights:b.rights.filter(r=>r.id.startsWith('rights-ipa-'+source)||r.id==='rights-unicode-17-q12'),
  assets:b.assets.filter(a=>a.id.startsWith('asset-ipa-'+source)),
  questions:b.questions.filter(q=>q.id.startsWith('question-ipa-'+source)||q.id.startsWith('question-template-source-'+source)),
  templates:b.templates.filter(t=>t.id.startsWith('template-source-'+source)),
  sets:b.sets.filter(s=>['set-annual-2018-spring-pm','set-mix-2018-spring-pm'].includes(s.id)),
  exams:b.exams.filter(e=>e.id.includes('2018-spring-pm'))};
}
// Handwritten unit-test receipt for the checker contract only. These synthetic
// check statuses do not certify rights, ordinary-App QA or an actual release.
async function checkerFixture(candidate:Spring2018Candidate):Promise<Spring2018ReleaseReceipt>{
 const file=path.resolve('package.json'),bytes=fs.readFileSync(file),proof={path:file,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
 return {candidateSHA256:await contentHash(candidate),assetsRoot:path.resolve('public/data'),codePins:await spring2018ReleaseCodePins(),
  checks:Object.fromEntries(spring2018ReleaseChecks.map(key=>[key,{status:'pass',evidence:[proof]}])) as Spring2018ReleaseReceipt['checks']};
}
test('registered booklet release checks the stored included-base hash before temporary preparation-shape validation',async()=>{
 const c=registeredBooklet(),before=structuredClone(c),receipt=await checkerFixture(c);
 assert.equal(c.questions.length,26);assert.equal(c.templates.length,13);
 for(const t of c.templates){const q=c.questions.find(q=>q.id===t.baseQuestionRef.questionId)!;assert.equal(q.distribution,'included');assert.equal(t.originalContentSha256,await contentHash(q));}
 const result=await check2018SpringAfternoonRelease(c,receipt);
 assert.equal(result.status,'release_checks_pass');assert.equal(result.majors,13);
 assert.equal(result.answerFields,74);assert.equal(result.pushPerformed,false);
 assert.deepEqual(c,before,'temporary excluded copies never change the registered records');
});
test('a mismatched included-base hash is rejected even when the receipt matches the changed candidate',async()=>{
 const c=registeredBooklet();c.templates[0].originalContentSha256='0'.repeat(64);
 await assert.rejects(check2018SpringAfternoonRelease(c,await checkerFixture(c)),{code:'ERR_ASSERTION'});
});
test('excluded records cannot be normalized into a released booklet by the preparation-shape check',async()=>{
 for(const kind of ['questions','templates']as const){const c=registeredBooklet();c[kind][0].distribution='excluded';
  await assert.rejects(check2018SpringAfternoonRelease(c,await checkerFixture(c)),{code:'ERR_ASSERTION'});}
});
