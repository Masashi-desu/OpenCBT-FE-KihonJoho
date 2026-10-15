// Generates ignored fixtures for an isolated Playwright CLI session. Lesson
// resources are served from the real production build, without response mocks.
import fs from "node:fs";
import path from "node:path";
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, finishRun, validateRun } from "../src/core/session";
import type { Run } from "../src/core/types";
const url = process.argv[2] ?? "http://127.0.0.1:4185/";
const output = "output/playwright/sort"; fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(output + "/references.js", `async page => {
  const check=(value,message)=>{if(!value)throw Error(message)}, errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1252,height:1313});
  await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2026-a-2?type=detail")});
  await page.locator('.detail-frame.ready').waitFor();
  const reference=page.locator('.detail-references'), credit=page.locator('.detail-page > .material-credit');
  const footer=page.locator('main > .question-footer');
  check(await reference.getByRole('heading',{name:'参考資料（定義・計算量の確認）',exact:true}).count()===1,'bibliography heading');
  const links=await reference.locator('a').evaluateAll(nodes=>nodes.map(node=>({href:node.href,title:node.title,target:node.target,rel:node.rel})));
  check(links.length===9,'nine NIST references');
  const expected=['quicksort','bubblesort','selectionSort','insertionSort','mergesort','heapSort','shellsort','binarySearchTree','heap'];
  check(links.every((link,i)=>link.href==='https://xlinux.nist.gov/dads/HTML/'+expected[i]+'.html'&&link.title.startsWith('NIST Dictionary of Algorithms and Data Structures: ')&&link.target==='_blank'&&link.rel.includes('noopener')),'reference URLs and names');
  check(await reference.evaluate(node=>!node.closest('.question-footer')),'bibliography outside problem credits');
  check((await credit.innerText()).includes('本プロジェクトの独自記述')&&await credit.locator('a').count()===0,'lesson authorship independent of references');
  check((await footer.innerText()).includes('2026年度 基本情報技術者試験 科目A 問2')&&(await footer.innerText()).includes('情報処理推進機構（IPA）'),'original question source and holder retained');
  check(await footer.locator('a[href*="nist.gov"]').count()===0,'NIST absent from question license block');
  const handle=await page.locator('.detail-frame').elementHandle(), f=await handle.contentFrame();
  check(await f.locator('#standalone-sources').isHidden(),'no duplicated embedded bibliography');
  check(await f.locator('.bar-button').count()===8&&await f.locator('#algorithm-select option').count()===7,'working simulator retained');
  check(await footer.locator('.footer-expand').count()===0,'detail credits stay expanded');
  check(await footer.getByRole('button',{name:'ライセンス表記',exact:true}).isVisible(),'license action retained');
  for(const width of [1252,390,320]) {
    await page.setViewportSize({width,height:width===1252?1313:844});
    for(const theme of ['light','dark']) {
      await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();
      await f.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);
      await reference.scrollIntoViewIfNeeded();
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal page overflow '+width);
      check(await reference.locator('a').evaluateAll(nodes=>nodes.every(node=>node.getBoundingClientRect().height>=44)),'touch target height '+width);
      check(await reference.evaluate(node=>getComputedStyle(node).backgroundColor===getComputedStyle(document.querySelector('.sidebar')).backgroundColor),'common surface color');
      await page.screenshot({path:'${output}/references-'+width+'-'+theme+'.png',animations:'disabled'});
    }
  }
  const detailUrl=page.url();
  await footer.getByRole('button',{name:'ライセンス表記',exact:true}).click();
  await page.getByRole('dialog',{name:'ライセンス表記',exact:true}).waitFor();
  check((await page.getByRole('dialog').innerText()).includes('IPA'),'license scope remains available');
  check(page.url()===detailUrl,'license dialog retains detail URL');
  await page.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).click();
  check(await footer.getByRole('button',{name:'ライセンス表記',exact:true}).evaluate(node=>document.activeElement===node),'license focus restored');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  check(await reference.count()===0,'bibliography specific to detail view');
  check((await page.locator('#search-explanation').innerText()).includes('正答：ウ'),'normal answer retained');
  check(errors.length===0,'JS errors: '+errors.join(', '));
  return {referenceLinks:9,displayScopes:'separate',licenseDialog:'passed',simulator:'passed',widths:[1252,390,320],themes:['light','dark'],jsErrors:errors};
}`);
fs.writeFileSync(output + "/tabs.js", `async page => {
  const check=(value,message)=>{if(!value)throw Error(message)}, errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1252,height:1313});
  await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2026-a-2?type=detail")});await page.locator('.detail-frame.ready').waitFor();
  const handle=await page.locator('.detail-frame').elementHandle(), f=await handle.contentFrame();
  const tab=name=>f.getByRole('tab',{name,exact:true});
  const panel=async id=>{
    check(await f.locator('#'+id).isVisible(),'selected panel '+id);
    check(await f.getByRole('tabpanel').count()===1,'one visible panel');
    const states=await f.getByRole('tab').evaluateAll(nodes=>nodes.map(node=>({selected:node.getAttribute('aria-selected'),tabIndex:node.tabIndex})));
    check(states.filter(s=>s.selected==='true'&&s.tabIndex===0).length===1&&states.filter(s=>s.selected==='false'&&s.tabIndex===-1).length===2,'roving tab focus');
  };
  const layout=async mobile=>{
    const selector=await f.locator('#algorithm-select').boundingBox(), input=await f.locator('#sequence').boundingBox();
    check(mobile?input.y>selector.y+selector.height:Math.abs(selector.y-input.y)<2,'algorithm and input layout');
    check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'lesson width');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'application width');
    check(await f.getByRole('tab').evaluateAll(nodes=>nodes.every(node=>{const r=node.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth+1})),'touch segment controls');
  };
  await panel('simulator');await layout(false);
  check(await f.locator('#algorithm-select option').count()===7&&await f.locator('#algorithm-buttons').count()===0,'dropdown replaces seven buttons');
  for(const kind of ['quick','bubble','selection','insertion','merge','heap','shell']) {
    await f.locator('#algorithm-select').selectOption(kind);
    await f.locator('#seek').evaluate(node=>{node.value=node.max;node.dispatchEvent(new Event('input',{bubbles:true}))});
    check(JSON.stringify(await f.locator('.bar-button').evaluateAll(nodes=>nodes.map(node=>Number(node.dataset.value))))==='[1,2,3,4,5,6,7,8]','dropdown algorithm sorts '+kind);
  }
  await f.locator('#sequence').fill('99,0,2,2');await f.locator('#apply-input').click();await f.locator('#algorithm-select').selectOption('heap');
  await f.locator('#speed').selectOption('350');await f.locator('#play').click();await f.waitForFunction(()=>Number(document.querySelector('#seek').value)>0);
  await tab('選択肢を確認').click();await panel('question-choices');
  const position=await f.locator('#seek').inputValue();check(await f.locator('#play').getAttribute('aria-pressed')==='false','tab change pauses');
  await page.waitForTimeout(450);check(await f.locator('#seek').inputValue()===position,'hidden simulation stays at its step');
  check(await f.locator('#choice-links button').count()===4,'all choice explanations retained');
  await tab('7方式を比較').click();await panel('comparison');
  check(await f.getByRole('heading',{name:'O(n²)とO(n log n)',exact:true}).isVisible(),'complexity explanation belongs to comparison');
  await tab('動作を見る').click();await panel('simulator');
  check(await f.locator('#algorithm-select').inputValue()==='heap'&&await f.locator('#sequence').inputValue()==='99,0,2,2'&&await f.locator('#seek').inputValue()===position,'return keeps algorithm input and step');
  await tab('選択肢を確認').click();await f.locator('#choice-links button').filter({hasText:'バブルソート'}).click();await panel('simulator');
  check(await f.locator('#algorithm-select').inputValue()==='bubble'&&await f.locator('#seek').inputValue()==='0','choice card switches dropdown and resets');
  check(await f.locator('#algorithm-select').evaluate(node=>document.activeElement===node),'card focuses dropdown');
  await tab('動作を見る').focus();await tab('動作を見る').press('End');await panel('comparison');
  await tab('7方式を比較').press('Home');await panel('simulator');
  await tab('動作を見る').press('ArrowLeft');await panel('comparison');await tab('7方式を比較').press('ArrowRight');await panel('simulator');
  await f.locator('#default-input').click();
  for(const theme of ['light','dark']) {
    await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();
    await f.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);
    await page.screenshot({path:'${output}/tabs-'+theme+'.png',fullPage:true,animations:'disabled'});
  }
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});await layout(true);
    for(const [name,id] of [['選択肢を確認','question-choices'],['7方式を比較','comparison'],['動作を見る','simulator']]) {await tab(name).click();await panel(id);}
    await page.screenshot({path:'${output}/tabs-'+width+'.png',fullPage:true,animations:'disabled'});
  }
  check(errors.length===0,'JS errors: '+errors.join(', '));
  return {segments:'passed',dropdownAlgorithms:7,widths:[1252,390,320],themes:['light','dark'],hiddenPlaybackPaused:true,statePreserved:true,jsErrors:errors};
}`);
const b = fixture(), source = b.questions.find(q => q.id === "question-ipa-2026-a-2")!;
const runs: Run[] = [];
for (let tries = 0; runs.length < 4 && tries < 80; tries++) {
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: source.id, revision: source.revision } }, {}));
  const target = run.instances[0].parameters.values[0];
  if (runs.some(old => old.instances[0].parameters.values[0] === target)) continue;
  run.session.entries[0].revealed = true; run.session.entries[0].selectedChoiceId = run.session.entries[0].choiceOrder[1];
  run = finishRun(run, "completed"); await validateRun(run); runs.push(run);
}
if (runs.length !== 4) throw Error("Could not sample all saved target conditions");
let original = finishRun(startRun(await prepareRun(b, { subject: "A", kind: "annual", year: 2026, mode: "study", bindingMode: "original_data", size: "public" }, {})), "completed");
await validateRun(original); runs.push(original);
const blobs: Record<string, string> = {};
for (const id of original.issued.flatMap(q => q.assetRefs)) { const asset = b.assets.find(a => a.id === id)!; blobs[id] = fs.readFileSync(path.join("public/data", asset.path)).toString("base64"); }
const payload = { runs, blobs };
const expected = runs.slice(0, 4).map(run => ({ id: run.session.id, target: run.instances[0].parameters.values[0], order: run.session.entries[0].choiceOrder, selected: run.session.entries[0].selectedChoiceId }));
fs.writeFileSync(output + "/seed.js", `async page => {
  await page.unroute('**/explanations/ipa-2026-a-2/manifest.json');
  await page.goto(${JSON.stringify(url)});
  await page.evaluate(async ({runs, blobs}) => {
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3);
    const db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject});
    const assets=Object.fromEntries(Object.entries(blobs).map(([id,data])=>[id,new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],{type:'image/webp'})]));
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    for(const run of runs){
      tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets});
      run.instances.forEach(instance=>tx.objectStore('generatedInstances').put(instance));
      tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});
      tx.objectStore('results').put(run.result);
    }
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});db.close();
  },${JSON.stringify(payload)});
  await page.goto(${JSON.stringify(url + "#/review/" + expected[0].id)});
  await page.getByRole('button',{name:'詳細解説を見る'}).waitFor();
  return 'Seeded four genuine saved generated conditions and an annual original run.';
}`);
fs.writeFileSync(output + "/verify.js", `async page => {
  const check=(condition,message)=>{if(!condition)throw Error(message)};
  const expected=${JSON.stringify(expected)}, base=${JSON.stringify(url)};
  const names=['クイックソート','バブルソート','選択ソート','挿入ソート','マージソート','ヒープソート','シェルソート'];
  const kinds=['quick','bubble','selection','insertion','merge','heap','shell'];
  const targets=['クイックソート','挿入ソート','選択ソート','バブルソート'];
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error' && /Content Security Policy|Uncaught|Blocked form/.test(message.text()))errors.push(message.text())});
  const frame=()=>page.frames().find(f=>f.url().includes('/explanations/host'));
  for(const saved of expected){
    await page.goto(base+'#/review/'+saved.id);
    await page.getByRole('button',{name:'詳細解説を見る'}).click();await page.locator('.detail-frame.ready').waitFor();
    const f=frame();check(await f.locator('#algorithm-name').textContent()===targets[saved.target],'saved target initial view');
    const c=await f.evaluate(()=>OpenCBTDetail.context);
    check(JSON.stringify(c.choiceOrder.map(v=>v.id))===JSON.stringify(saved.order),'actual choice order');
    check(c.selectedChoiceId===saved.selected,'saved selection');
    check(await f.locator('#choice-links button').count()===4,'all four options explained');
    await f.getByRole('tab',{name:'選択肢を確認',exact:true}).click();
    await f.locator('#choice-links button').first().click();
    check(await f.locator('#seek').inputValue()==='0','child-owned option switching resets playback');
    await page.getByRole('button',{name:'通常解説へ戻る'}).click();await page.getByRole('button',{name:'詳細解説を見る'}).waitFor();
  }
  await page.goto(base+'#/detail/'+${JSON.stringify(original.session.id)}+'/1/review');await page.locator('.detail-frame.ready').waitFor();
  let f=frame();check(await f.locator('#algorithm-name').textContent()==='クイックソート','official original starts with quick');
  check((await f.locator('#choice-links').textContent()).includes('ウ · クイックソート'),'original choice mapping');
  await page.setViewportSize({width:1365,height:1000});
  for(let k=0;k<kinds.length;k++){
    await f.locator('#algorithm-select').selectOption(kinds[k]);
    const states=await f.evaluate(kind=>SortEngine.generateTrace(kind,[8,3,5,1,7,2,6,4]).steps,kinds[k]);
    const indices=[0,1,Math.floor(states.length/2),states.length-2,states.length-1,Math.floor(states.length/2),0];
    for(const i of indices){
      await f.locator('#seek').evaluate((node,i)=>{node.value=String(i);node.dispatchEvent(new Event('input',{bubbles:true}))},i);
      const actual=await f.evaluate(()=>({array:[...document.querySelectorAll('.bar-button')].map(v=>v.dataset.value),description:document.querySelector('#step-description').textContent,counts:Object.fromEntries(['comparisons','swaps','shifts','insertions','mergeWrites','copyBackWrites','holds'].map(key=>[key,Number(document.querySelector('#count-'+key).textContent)])),tree:[...document.querySelectorAll('.tree-node')].map(v=>Number(v.dataset.value))}));
      check(JSON.stringify(actual.array)===JSON.stringify(states[i].array.map(v=>v?String(v.value):'hole')),kinds[k]+' state replay');
      check(actual.description===states[i].description,kinds[k]+' description synchronized');
      check(JSON.stringify(actual.counts)===JSON.stringify(states[i].counts),kinds[k]+' counters synchronized');
      if(kinds[k]==='heap')check(JSON.stringify(actual.tree)===JSON.stringify(states[i].array.map(v=>v.value)),'tree equals bars');
    }
    await f.locator('#next').click();check(await f.locator('#seek').inputValue()==='1','next');
    await f.locator('#previous').click();check(await f.locator('#seek').inputValue()==='0','previous');
  }
  await f.locator('#speed').selectOption('350');await f.locator('#play').click();
  await f.waitForFunction(()=>Number(document.querySelector('#seek').value)>0);
  await f.locator('#previous').click();check(await f.locator('#play').getAttribute('aria-pressed')==='false','manual move pauses');
  await f.locator('#play').click();await f.locator('#algorithm-select').selectOption('merge');
  check(await f.locator('#seek').inputValue()==='0' && await f.locator('#play').getAttribute('aria-pressed')==='false','algorithm change resets running timer');
  const last=Number(await f.locator('#seek').getAttribute('max'));
  await f.locator('#seek').evaluate((node,last)=>{node.value=String(last-1);node.dispatchEvent(new Event('input',{bubbles:true}))},last);
  await f.locator('#play').click();await f.waitForFunction(()=>document.querySelector('#play').disabled);
  check(await f.locator('#play').getAttribute('aria-pressed')==='false','stops on final step');
  for(const values of ['0，99、2,2','4,3,2,1','0,0,0,0','1,2,3,4','99,0,99,0,45,45,12,8,7,1']){
    await f.locator('#sequence').fill(values);await f.getByRole('button',{name:'数列を適用',exact:true}).click();
    check(await f.locator('#input-error').isHidden(),'valid input');check(await f.locator('#seek').inputValue()==='0','input reset');
  }
  for(const values of ['1,2,3','1,2,,4','1,2.5,3,4','1,2,100,4']){
    await f.locator('#sequence').fill(values);await f.getByRole('button',{name:'数列を適用',exact:true}).click();check(await f.locator('#input-error').isVisible(),'invalid input has reason');
    check(await f.locator('.bar-button').count()===10,'invalid input retains prior valid array');
  }
  await page.setViewportSize({width:390,height:844});
  await f.locator('#algorithm-select').selectOption('shell');await f.locator('#next').click();
  const labelsVisible=await f.evaluate(()=>{
    document.querySelector('.visual-panel').scrollIntoView({block:'start',behavior:'instant'});
    const chart=document.querySelector('.chart-scroll').getBoundingClientRect();
    return [...document.querySelectorAll('.bar-value')].every(node=>{const b=node.getBoundingClientRect();return b.top>=chart.top && b.bottom<=chart.bottom});
  });
  check(labelsVisible,'ten-element maximum labels stay inside mobile chart');
  check(await f.locator('.bar-button').evaluateAll(nodes=>nodes.every(node=>node.getBoundingClientRect().width>=44)),'touch inspection targets at least 44px wide');
  await f.locator('#default-input').click();await f.locator('.bar-button').first().click();check((await f.locator('#inspection').textContent()).includes('位置0：値8'),'bar inspection');
  await f.locator('#sequence').fill('4,3,2,1');await f.getByRole('button',{name:'数列を適用',exact:true}).click();
  await f.locator('#algorithm-select').selectOption('insertion');
  const hold=await f.evaluate(()=>SortEngine.generateTrace('insertion',[4,3,2,1]).steps.findIndex(s=>s.operation==='hold'));
  await f.locator('#seek').evaluate((node,hold)=>{node.value=String(hold);node.dispatchEvent(new Event('input',{bubbles:true}))},hold);
  check(await f.locator('#held-view').isVisible() && await f.locator('[data-state=hole]').count()===1,'held value and real hole');
  await f.locator('#algorithm-select').selectOption('merge');
  const merge=await f.evaluate(()=>SortEngine.generateTrace('merge',[4,3,2,1]).steps.findIndex(s=>s.operation==='merge-write'));
  await f.locator('#seek').evaluate((node,i)=>{node.value=String(i);node.dispatchEvent(new Event('input',{bubbles:true}))},merge);
  check(await f.locator('#merge-groups .chosen').count()===1,'merge buffer write highlighted');
  await f.locator('#default-input').click();await f.locator('#algorithm-select').selectOption('heap');
  await f.locator('#seek').evaluate(node=>{node.value='15';node.dispatchEvent(new Event('input',{bubbles:true}))});
  await page.screenshot({path:'${output}/desktop-heap.png',fullPage:true});
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'outer mobile width '+width);
    check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'lesson mobile width '+width);
    check(await f.evaluate(()=>document.documentElement.dataset.overlayScrollbars!==undefined),'shared overlay bars');
    await f.locator('#algorithm-select').selectOption('shell');
    await page.screenshot({path:'${output}/mobile-'+width+'.png',fullPage:true});
  }
  await page.evaluate(()=>window.dispatchEvent(new StorageEvent('storage',{key:'opencbt-fe-kihonjoho-theme',newValue:'dark'})));
  await f.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
  await page.emulateMedia({reducedMotion:'reduce'});await f.locator('#next').click();
  check(await f.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches && !document.getAnimations().length),'reduced motion');
  await page.screenshot({path:'${output}/mobile-dark.png',fullPage:true});
  for(const theme of ['light','dark']){
    await page.evaluate(theme=>window.dispatchEvent(new StorageEvent('storage',{key:'opencbt-fe-kihonjoho-theme',newValue:theme})),theme);
    await f.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);
    const getPalette=()=>({background:getComputedStyle(document.body).backgroundColor,tokens:Object.fromEntries(['--canvas','--surface','--ink','--muted','--line','--accent'].map(key=>[key,getComputedStyle(document.documentElement).getPropertyValue(key).trim()]))});
    check(JSON.stringify(await page.evaluate(getPalette))===JSON.stringify(await f.evaluate(getPalette)),'same monochrome application palette '+theme);
  }
  await f.locator('#seek').press('End');check(await f.locator('#play').isDisabled(),'keyboard range End');
  await f.locator('#seek').press('Home');check(await f.locator('#seek').inputValue()==='0','keyboard range Home');
  await page.getByRole('button',{name:'通常解説へ戻る'}).click();await page.getByRole('button',{name:'詳細解説を見る'}).waitFor();
  check((await page.locator('.explanation').textContent()).includes('各ソート方式の動作'),'return to original question 2');
  await page.getByRole('button',{name:'詳細解説を見る'}).click();await page.locator('.detail-frame.ready').waitFor();
  await page.reload();await page.locator('.detail-frame.ready').waitFor();
  await page.getByRole('button',{name:'通常解説へ戻る'}).click();await page.getByRole('button',{name:'詳細解説を見る'}).waitFor();
  await page.route('**/explanations/ipa-2026-a-2/manifest.json',route=>route.fulfill({status:404,body:'missing'}));
  await page.goto(base+'#/detail/'+${JSON.stringify(original.session.id)}+'/1/review');
  await page.reload();
  await page.locator('.explanation').waitFor();await page.waitForTimeout(250);
  check((await page.locator('.explanation').textContent()).includes('各ソート方式の動作'),'unavailable fallback stays on question 2');
  check(await page.getByRole('button',{name:'詳細解説を見る'}).count()===0,'unavailable lesson behaves as absent');check(!errors.length,'no browser errors: '+errors.join(';'));
  return 'Sort UI passed: all seven, saved targets and options, replay and counts, controls, input, held/merge/tree, mobile 390/320, themes, reduced motion, keyboard, return/reload, missing package.';
}`);
console.log(`Sort browser fixtures generated under ${output}; all 4 saved targets, real resources.`);
