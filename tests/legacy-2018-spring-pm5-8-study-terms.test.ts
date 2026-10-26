import test from'node:test';import assert from'node:assert/strict';
import{legacy2018SpringPm5To8StudyTerms as terms,legacy2018SpringPm6StudyTerms as evm,legacy2018SpringPm7StudyTerms as profit}from'../src/core/generators/legacy-2018-spring-pm5-8-study-terms';
import{legacy2018HealthStudyTerms as health}from'../src/core/generators/legacy-2018-pm-health-study-terms';import{legacy2018HeapStudyTerms as heap}from'../src/core/generators/legacy-2018-pm-heap-study-terms';
import{downHeapReference}from'./fixtures/legacy-2018-pm-heap-reference';
test('29 after-answer terms have exact four-major scopes and preserve only the reviewed narrow health/heap entries',()=>{
 assert.equal(terms.length,29);assert.equal(new Set(terms.map(t=>t.sources!.join('/')+'/'+t.term)).size,29);
 for(const n of[5,6,7,8])assert.equal(terms.filter(t=>t.sources!.includes(`2018h30h-fe-pm-${n}`)).length,({5:3,6:10,7:6,8:10})[n]);
 assert(terms.every(t=>t.sources!.length===1&&/^2018h30h-fe-pm-[5678]$/.test(t.sources![0])));assert.deepEqual(terms.filter(t=>t.sources![0].endsWith('-5')),health);assert.deepEqual(terms.filter(t=>t.sources![0].endsWith('-8')),heap);
 assert.deepEqual(evm.map(t=>t.term),['EVM','BAC','PV','EV','AC','SV','CV','SPI','CPI','KLOC']);assert.deepEqual(profit.map(t=>t.term),['変動費と変動費率','固定費','限界利益率','損益分岐点売上高','値下げと利益の関係','費用直線の傾きと切片']);
 assert(terms.every(t=>!/(?:JIS|Java API|2017|秋期|午前)/.test(t.meaning)));
});
test('EVM signed differences, separate forecasts, profit rates and equal-child heap claims match independent arithmetic/source boundaries',()=>{
 const by=(name:string)=>terms.find(t=>t.term===name)!.meaning;
 const pv=10,ev=8,ac=9;assert.equal(ev-pv,-2);assert.equal(ev-ac,-1);assert(ev/pv<1&&ev/ac<1);assert.match(by('SV'),/EV−PV/);assert.match(by('SV'),/負なら/);assert.match(by('CV'),/EV−AC/);assert.match(by('CV'),/正の距離/);assert.match(by('SPI'),/EV／PV/);assert.match(by('CPI'),/EV／AC/);assert.match(by('CPI'),/今後は計画どおり/);assert.match(by('KLOC'),/1,000行/);
 for(const [rate,f,s]of[[75,34000,200000],[80,24000,200000]]){const variable=rate*s/100,p=s-variable-f,breakEven=f*100/(100-rate),discount=p*100/s;assert.equal(breakEven*(100-rate)/100-f,0);assert(p>0);assert.equal(s*(100-discount)/100-variable-f,0);assert(f*100/(101-rate)<breakEven);}
 assert.match(by('限界利益率'),/1−r/);assert.match(by('損益分岐点売上高'),/F÷\(1−r\)/);assert.match(by('固定費'),/総額が等しい/);assert.match(by('値下げと利益の関係'),/変動費総額を変えない/);assert.match(by('費用直線の傾きと切片'),/傾きが変動費率/);
 const equal=[0,5,5],steps=downHeapReference(equal,2);assert.equal(steps[0].chosen,2);assert.deepEqual(equal,[5,5,0]);assert.match(by('下方への再構成'),/等しいとき右の子/);assert.match(by('空の領域と1要素の領域'),/hnum>0/);
});
