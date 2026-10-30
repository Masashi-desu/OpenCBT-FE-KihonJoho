import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import discovery from '../scripts/source-evidence/pre-2009-official-discovery-review.json';
import { auditPre2023Discovery as gate, finalizePre2023Readiness as finalStatus, DiscoveryGateError } from '../scripts/pre-2023-discovery-gate';
import { auditPre2023Readiness } from '../scripts/audit-pre-2023-readiness';
import { fixture } from './fixtures';
const clone=structuredClone;
const ledger=():typeof discovery=>clone(discovery);
const invalid=(error:unknown)=>error instanceof DiscoveryGateError&&error.code==='DISCOVERY_SCOPE';
const minimum=Array.from({length:5},(_,i)=>i+2004).flatMap(year=>['h','a'].flatMap(period=>['am','pm'].map(slot=>`${year}h${year-1988}${period}-fe-${slot}`))).sort();
// Independent normalization for synthetic new-listing tests. This is metadata
// only; it does not fetch or claim that the synthetic2003 PDFs exist.
function identities(d:typeof discovery){return d.yearListings.flatMap(y=>{
 const grouped=new Map<string,{id:string;listedAt:string;questionHref?:string;answerHref?:string}>();
 for(const link of y.links){const m=/(\d{4}h\d+[ha])_fe_(am|pm)_(qs|ans)\.pdf$/.exec(link.href)!;const id=m[1]+'-fe-'+m[2],r=grouped.get(id)??{id,listedAt:y.archivedOfficialYearPage};if(m[3]==='qs')r.questionHref=link.href;else r.answerHref=link.href;grouped.set(id,r);}
 return [...grouped.values()].map(r=>({id:r.id,listedAt:r.listedAt,questionHref:r.questionHref!,answerHref:r.answerHref!}));
 }).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);}
function reseal(d:typeof discovery,addStates=true){const rows=identities(d);d.listedYears=d.yearListings.map(y=>y.year).sort((a,b)=>a-b);d.listedQuestionCollections=rows.length;d.listedQuestionAndAnswerLinks=rows.length*2;d.scopeDiscovery.identitySha256=createHash('sha256').update(JSON.stringify(rows),'utf8').digest('hex');if(addStates)d.scopeDiscovery.booklets=rows.map(r=>({id:r.id,status:'pending',questionUnitsConfirmed:null,remaining:['full_pdf_identity_and_count','official_answers','individual_material_rights','inventory_scope']}));}

test('twenty archived official listing identities stay pending with unknown additional units and separate earlier/predecessor boundaries',()=>{
 const d=ledger(),before=clone(d),report=gate(d);
 assert.equal(report.ready,false);assert.equal(report.status,'pending_source_scope_review');assert.equal(report.listedCollections,20);assert.equal(report.listedQuestionAndAnswerLinks,40);assert.equal(report.confirmedQuestionUnits,null);
 assert.deepEqual(report.pendingCollections,minimum);assert.deepEqual(report.pendingBoundaries,['fe-before-2004','predecessor-systems']);
 assert.equal(report.identitySha256,d.scopeDiscovery.identitySha256);assert.deepEqual(d,before);assert(!Object.isFrozen(d));
 assert.match(report.note,/問数/);assert.match(report.note,/未完了/);
});

test('even all enumerated questions ready cannot bypass pending discovery; future toy scope-ready cannot replace question/capacity checks',()=>{
 const pending=gate(ledger());assert.equal(finalStatus(true,true,pending),'not_ready');
 // Handwritten future toy only; no real ledger resolution/permission exists.
 const futureToy={ready:true};assert.equal(finalStatus(false,true,futureToy),'not_ready');assert.equal(finalStatus(true,false,futureToy),'not_ready');assert.equal(finalStatus(true,true,futureToy),'ready');
 const evidence=JSON.parse(fs.readFileSync('scripts/source-evidence/ipa-pre-2023.json','utf8'));
 const actual=auditPre2023Readiness(fixture(),evidence);
 assert.deepEqual(actual.summary,{collections:67,requestedUnits:3062,missingOriginals:2911,originalSemanticsReviewed:151,ready:151});
 assert.equal(actual.scopeDiscovery.ready,false);assert.equal(actual.scopeDiscovery.listedCollections,20);assert.equal(actual.status,'not_ready');
 assert.throws(()=>auditPre2023Readiness(fixture(),evidence,undefined,{}),invalid);
});

test('deleting or shrinking the ledger cannot remove any of the independently confirmed20booklets',()=>{
 assert.throws(()=>gate(undefined),invalid);assert.throws(()=>gate({}),invalid);
 const edits:((d:typeof discovery)=>void)[]=[d=>{d.yearListings=[];d.scopeDiscovery.booklets=[];},d=>{d.scopeDiscovery.booklets.pop();},d=>{d.yearListings[0].links.splice(0,2);reseal(d);},d=>{d.yearListings.pop();reseal(d);},d=>{d.scopeDiscovery.boundaries.pop();}];
 for(const edit of edits){const d=ledger();edit(d);assert.throws(()=>gate(d),invalid);}
});

test('duplicates, unknown properties/statuses and date-only ready declarations fail closed without exclusions or promotion',()=>{
 const edits:((d:typeof discovery)=>void)[]=[d=>{d.yearListings.push(clone(d.yearListings[0]));},d=>{d.yearListings[0].links.push(clone(d.yearListings[0].links[0]));},d=>{d.scopeDiscovery.booklets[1]=clone(d.scopeDiscovery.booklets[0]);},d=>{d.scopeDiscovery.status='ready';},d=>{d.scopeDiscovery.booklets[0].status='excluded';},d=>{d.scopeDiscovery.booklets[0].status='incorporated_into_inventory';},d=>{d.status='ready';d.checkedOn='2026-10-22';},d=>{d.distribution='included';},d=>{Object.assign(d,{ready:true});},d=>{Object.assign(d.scopeDiscovery.booklets[0],{ready:true});},d=>{d.scopeDiscovery.boundaries[0].status='nonexistent';},d=>{d.scopeDiscovery.requiresSourceAndMaterialReview=false;}];
 for(const edit of edits){const d=ledger();edit(d);assert.throws(()=>gate(d),invalid);}
});

test('question/answer links must retain exact publisher/year/period/exam/slot and paired roles',()=>{
 const edits:((d:typeof discovery)=>void)[]=[d=>{d.yearListings[0].links[0].href=d.yearListings[0].links[0].href.replace('_2/','_1/');},d=>{d.yearListings[0].links[0].href=d.yearListings[0].links[0].href.replace('fe_am_qs','fe_pm_qs');},d=>{d.yearListings[0].links[0].href=d.yearListings[0].links[0].href.replace('2004h16a_fe','2005h17a_fe');},d=>{d.yearListings[0].links[0].href='https://example.com/test.pdf';},d=>{d.yearListings[0].links[0].label='解答';},d=>{d.yearListings[0].links.splice(1,1);},d=>{d.yearListings[0].archivedOfficialYearPage=d.yearListings[0].archivedOfficialYearPage.replace('www.jitec.ipa.go.jp','example.com');}];
 for(const edit of edits){const d=ledger();edit(d);assert.throws(()=>gate(d),invalid);}
});

test('stale identity digest, invented zero units, inferred80/13counts and claimed PDF/answer review cannot pass',()=>{
 const edits:((d:typeof discovery)=>void)[]=[d=>{d.scopeDiscovery.identitySha256='0'.repeat(64);},d=>{d.yearListings[0].archivedOfficialYearPage=d.yearListings[0].archivedOfficialYearPage.replace('20200713150011','20200713150012');},d=>{Object.assign(d,{questionUnitsConfirmed:0});},d=>{Object.assign(d.scopeDiscovery.booklets[0],{questionUnitsConfirmed:0});},d=>{Object.assign(d.scopeDiscovery.booklets[0],{questionUnitsConfirmed:80});},d=>{d.listedQuestionCollections=2132+20*80;},d=>{d.fullPDFCountOrKeysInspected=40;},d=>{d.newQuestionsRegistered=20;},d=>{d.scopeDiscovery.booklets[0].remaining=[];}];
 for(const edit of edits){const d=ledger();edit(d);assert.throws(()=>gate(d),invalid);}
 const badDate=ledger();badDate.checkedOn='2026-02-31';assert.throws(()=>gate(badDate),invalid);
});

test('synthetic new discoveries cannot use an old digest or omit pending rows; explicit new pending investigations stay visible',()=>{
 const d=ledger(),y=clone(d.yearListings[0]);y.year=2003;y.title='Synthetic2003 metadata only';y.archivedOfficialYearPage=y.archivedOfficialYearPage.replaceAll('2004h16','2003h15');y.links=y.links.map(l=>({...l,href:l.href.replaceAll('2004h16','2003h15')}));d.yearListings.unshift(y);d.listedYears.unshift(2003);d.listedQuestionCollections+=4;d.listedQuestionAndAnswerLinks+=8;
 assert.throws(()=>gate(d),/digest/);reseal(d,false);assert.throws(()=>gate(d),/pending investigation/);reseal(d,true);
 const report=gate(d);assert.equal(report.ready,false);assert.equal(report.listedCollections,24);assert.equal(report.confirmedQuestionUnits,null);assert.equal(report.pendingCollections.filter(id=>id.startsWith('2003')).length,4);assert(minimum.every(id=>report.pendingCollections.includes(id)));assert.equal(finalStatus(true,true,report),'not_ready');
 const empty=ledger(),emptyYear=clone(y);emptyYear.links=[];empty.yearListings.unshift(emptyYear);empty.listedYears.unshift(2003);assert.throws(()=>gate(empty),/explicit question\/answer investigations/);
});

test('descriptor/getter/undefined/sparse/cyclic metadata are refused without getter execution or caller freezing',()=>{
 for(const where of ['root','href','state','digest'] as const){const d=ledger();let calls=0;const descriptor={get(){calls++;throw Error('must not execute');},enumerable:true};if(where==='root')Object.defineProperty(d,'checkedOn',descriptor);if(where==='href')Object.defineProperty(d.yearListings[0].links[0],'href',descriptor);if(where==='state')Object.defineProperty(d.scopeDiscovery.booklets[0],'status',descriptor);if(where==='digest')Object.defineProperty(d.scopeDiscovery,'identitySha256',descriptor);assert.throws(()=>gate(d),invalid);assert.equal(calls,0);assert(!Object.isFrozen(d));}
 const d=ledger();Object.defineProperty(d,'hidden',{value:undefined,enumerable:true});assert.throws(()=>gate(d),invalid);
 const sparse=ledger();delete (sparse.yearListings as Partial<typeof sparse.yearListings>)[0];assert.throws(()=>gate(sparse),invalid);
 const cyclic=ledger();Object.assign(cyclic.scopeDiscovery,{cycle:cyclic});assert.throws(()=>gate(cyclic),invalid);
});

test('metadata amendment preserves every prior discovery fact and proof byte after reversing only the two declared gate additions',()=>{
 const d=ledger();const{scopeDiscovery:_,...old}=d;old.readinessGateImplementation='pending_separate_parent_reviewed_gate_after_current_coordinator_unit';
 const bytes=JSON.stringify(old,null,2)+'\n';assert.equal(createHash('sha256').update(bytes,'utf8').digest('hex'),'080ec15e88dd0b0286446328f1e5b209f414d46ec93675ad3caa08828b179e11');
 assert.equal(d.fullPDFCountOrKeysInspected,0);assert.equal(d.ownerDiscovery.fullPDFHashClaimed,false);assert.equal(d.questionUnitsConfirmed,null);assert(d.openWork.some(x=>x.includes('2003')));
});

test('actual sources-readiness CLI reports knownminimum67/3062 with930pending units and separate historical listing evidence and exits1',()=>{
 const json=spawnSync(process.execPath,['--import','tsx','scripts/audit-pre-2023-readiness.ts','--json'],{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(json.status,1,json.stderr);const report=JSON.parse(json.stdout);assert.equal(report.status,'not_ready');assert.equal(report.summary.collections,67);assert.equal(report.summary.requestedUnits,3062);assert.equal(report.scopeDiscovery.listedCollections,20);assert.equal(report.scopeDiscovery.unknownBoundaryUnits,null);assert.equal(report.scopeDiscovery.pendingCollections.length,20);
 const text=spawnSync(process.execPath,['--import','tsx','scripts/audit-pre-2023-readiness.ts'],{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(text.status,1,text.stderr);assert.match(text.stdout,/currently enumerated scope: 67 collections \/ 3062/);assert.match(text.stdout,/Accepted source inventory: 20 collections \/ 930 units; pending materials: 930; unknown boundary units: unknown/);
});
