// Generate reproducible checks for an isolated headless Playwright CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture, installFixtureGenerators } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";

const url = process.argv[2] ?? "http://127.0.0.1:5199/", output = "output/playwright/transaction";
fs.mkdirSync(output, { recursive: true });
const viewport = viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(12000,size.height+200)");
fs.writeFileSync(output + "/verify.js", `async page => {
  page.setDefaultTimeout(15000); ${viewport}
  const check=(ok,message)=>{if(!ok)throw Error(message)},conditions=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));let f;
  const settle=async()=>{await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1)};
  const geometry=()=>f.evaluate(()=>Object.fromEntries(['.diagram-viewport','.navigation'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{y:r.y+scrollY,width:r.width,height:r.height}]})));
  const seek=async i=>{await f.locator('#seek').evaluate((n,i)=>{n.value=String(i);n.dispatchEvent(new Event('input',{bubbles:true}))},i);await settle()};
  const expected={normal:['active','committing','committed'],cancel:['active','aborting','aborted'],failure:['active','committing','aborting','aborted']};
  for(const width of [1280,390,320])for(const theme of ['light','dark']){
    await setViewport({width,height:609});await page.goto(${JSON.stringify(url)});
    await page.evaluate(theme=>localStorage.setItem('opencbt-fe-kihonjoho-theme',theme),theme);
    await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2019r01a-fe-am-28")});
    await page.locator('.detail-frame.ready').waitFor();f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();await settle();
    check(await f.locator('html').getAttribute('data-theme')===theme,'theme');
    check(await f.locator('#standalone-title').isHidden()&&await f.locator('#standalone-credit').isHidden(),'embedded deduplication');
    const g=await geometry();
    const stable=async()=>{const current=await geometry();for(const selector of Object.keys(g))for(const key of ['y','width','height'])check(Math.abs(current[selector][key]-g[selector][key])<1,'stable '+selector+' '+key+' '+JSON.stringify({width,theme,current,g}))};
    for(const [scenario,states] of Object.entries(expected)){
      await f.locator('#scenario').selectOption(scenario);await settle();check(await f.locator('#prev').isDisabled(),'initial prev');
      const texts=[];
      for(let i=0;i<states.length;i++){
        if(i)await f.locator('#next').press('Enter');await settle();
        check(await f.locator('.current').count()===1&&await f.locator('.current').getAttribute('data-node')===states[i],'current '+scenario+'/'+i);
        check(await f.locator('.recent').count()===(i?1:0),'one latest edge');
        check(await f.locator('#counter').innerText()===i+' / '+(states.length-1)+' 遷移','counter');
        texts.push(await f.locator('#step-text').innerText());await stable();
        check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'inner overflow');
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'outer overflow');
        check(await f.locator('.current').evaluate(n=>{const r=n.getBoundingClientRect(),v=n.closest('.diagram-viewport').getBoundingClientRect();return r.left>=v.left-1&&r.right<=v.right+1}),'current visible');
      }
      check(await f.locator('#next').isDisabled(),'terminal next');
      for(let i=states.length-2;i>=0;i--){await f.locator('#prev').press('Enter');check(await f.locator('#step-text').innerText()===texts[i],'reverse snapshot');}
      await f.locator('#seek').press('End');check((await f.locator('#counter').innerText()).startsWith((states.length-1)+' /'),'slider end');
      await f.locator('#seek').press('Home');check((await f.locator('#counter').innerText()).startsWith('0 /'),'slider home');
    }
    await f.locator('#scenario').selectOption('failure');await seek(2);
    check((await f.locator('#step-text').innerText()).includes('コミット完了前'),'failure before completion');
    for(const id of ['active','committing','committed','aborting','aborted']){
      await f.locator('[data-node='+id+']').press('Enter');check(await f.locator('[data-node='+id+']').getAttribute('aria-pressed')==='true','select state');
      await stable();await f.locator('#close-selection').press('Enter');
      check(await f.locator('[data-node='+id+']').evaluate(n=>n===document.activeElement),'state focus return');
      await f.locator('[data-node='+id+']').press('Space');await f.locator('[data-node='+id+']').press('Escape');check(await f.locator('#close-selection').isHidden(),'escape');
      await f.locator('[data-node='+id+']').press('Enter');await f.locator('[data-node='+id+']').press('Enter');check(await f.locator('#close-selection').isHidden(),'toggle state');
    }
    for(let i=1;i<=4;i++){
      const button=f.locator('[data-choice=choice-'+i+']');await button.press('Enter');
      check(await button.getAttribute('aria-pressed')==='true','choice selected');
      check(await f.locator('.forbidden').count()===(i===2?1:0),'independent option judgment');
      check((await f.locator('#step-title').innerText()).includes(i===2?'起こらない・本問の正答':'起こり得る'),'choice explanation');await stable();
      check(await f.locator('.current').getAttribute('data-node')==='aborting','choice preserves playback');
      if(i===2){await f.locator('.diagram-viewport').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/choice-'+width+'-'+theme+'.png'})}
      await f.locator('#close-selection').press('Enter');check(await button.evaluate(n=>n===document.activeElement),'choice focus return');
    }
    await f.locator('[data-choice=choice-2]').press('Enter');await f.locator('#next').press('Enter');check(await f.locator('#close-selection').isHidden(),'step clears selection');
    await f.locator('[data-choice=choice-2]').press('Enter');await f.locator('#scenario').selectOption('normal');check((await f.locator('#counter').innerText()).startsWith('0 /')&&await f.locator('#close-selection').isHidden(),'scenario resets');
    await settle();const h=await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height);
    await f.locator('summary').press('Enter');await settle();await page.waitForFunction(h=>document.querySelector('.detail-frame').getBoundingClientRect().height>h+30,h);await stable();
    await f.locator('summary').press('Enter');await settle();await page.waitForFunction(h=>Math.abs(document.querySelector('.detail-frame').getBoundingClientRect().height-h)<2,h);
    const nested=await f.evaluate(()=>[...document.querySelectorAll('body *')].filter(n=>['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+2&&!n.matches('input')).map(n=>n.className));check(!nested.length,'single vertical scroll '+nested);
    check(await f.locator('button,input,select,summary,[data-node]').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return !r.height||r.width>=43.5&&r.height>=43.5})),'44px targets');
    await f.locator('.diagram-viewport').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/initial-'+width+'-'+theme+'.png'});
    await f.evaluate(()=>document.documentElement.style.fontSize='200%');await settle();const enlarged=await geometry();
    for(const [scenario,states]of Object.entries(expected)){
      await f.locator('#scenario').selectOption(scenario);
      for(let i=0;i<states.length;i++){await seek(i);check(Math.abs((await geometry())['.navigation'].y-enlarged['.navigation'].y)<1,'200% stable');check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% width')}
    }
    await f.locator('#reset').press('Enter');check(await f.locator('#scenario').inputValue()==='normal'&&(await f.locator('#counter').innerText()).startsWith('0 /'),'reset');
    await f.locator('[data-node=committing]').press('Enter');await settle();await f.locator('.explanation').scrollIntoViewIfNeeded();await settle();
    await page.screenshot({path:${JSON.stringify(output)}+'/font200-'+width+'-'+theme+'.png'});
    conditions.push({width,theme,paths:3,states:10,choices:4,font200:true});
  }
  await page.locator('.detail-page .question-footer.expanded').scrollIntoViewIfNeeded();
  check(await page.locator('.detail-references').isVisible()&&await page.locator('.detail-page .question-footer.expanded').isVisible(),'references and footer in page flow');
  await page.goto(${JSON.stringify(url + "explanations/ipa-2019-autumn-am-28/index.html")});
  check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone title and credit');
  await page.goto(${JSON.stringify(url + "#/search?q=トランザクション&type=detail")});
  await page.getByRole('link',{name:'トランザクションの状態遷移',exact:true}).waitFor();
  check((await page.locator('body').innerText()).includes('トランザクションの状態遷移'),'searchable lesson');
  check(!errors.length,'page errors '+errors.join(','));return {conditions,errors};
}`);

await installFixtureGenerators();
const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2019r01a-fe-am-28")!;
const runs = new Map<number, Awaited<ReturnType<typeof finishRun>>>();
for (let attempt = 0; attempt < 256 && runs.size < 4; attempt++) {
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
  const variant = run.instances[0].parameters.values[0];
  if (runs.has(variant)) continue;
  run = updateAnswer(run, run.issued[0].choices[1].id); run.session.entries[0].revealed = true;
  run = finishRun(run, "completed"); await validateRun(run); runs.set(variant, run);
}
if (runs.size !== 4) throw Error("Missing a saved generator variant");
const ordered = [...runs].sort(([a], [b]) => a - b).map(([, run]) => run);
const savedBundle = ordered[0].bundle;
if (ordered.some(run => JSON.stringify(run.bundle) !== JSON.stringify(savedBundle))) throw Error("Saved source snapshots differ");
const savedRuns = ordered.map(({ bundle: _bundle, ...run }) => run);
fs.writeFileSync(output + "/saved.js", `async page=>{
  page.setDefaultTimeout(15000);${viewport}await setViewport({width:1280,height:900});await page.goto('about:blank');await page.goto(${JSON.stringify(url)});
  const check=(ok,message)=>{if(!ok)throw Error(message)},runs=${JSON.stringify(savedRuns)},bundle=${JSON.stringify(savedBundle)},checks=[];
  await page.evaluate(async ({runs,bundle})=>{
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2'),db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject});
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    for(const run of runs){tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle,assets:{}});run.instances.forEach(i=>tx.objectStore('generatedInstances').put(i));tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});tx.objectStore('results').put(run.result)}
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});db.close();
  },{runs,bundle});
  const pairs=[['アボート処理中','コミット処理中'],['アボート処理中','コミット済'],['アボート済','コミット済'],['コミット済','アボート処理中']];
  for(const width of [1280,320])for(const [v,run]of runs.entries()){
    await setViewport({width,height:width===1280?900:609});
    await page.goto('about:blank');await page.goto(${JSON.stringify(url)}+'#/detail/'+run.session.id+'/0/review');await page.locator('.detail-frame.ready').waitFor();
    const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame(),context=await f.evaluate(()=>window.OpenCBTDetail.context),before=JSON.stringify(context);
    check(context.generation.parameters.values[0]===v,'saved variant');
    const option=f.locator('[data-choice=choice-value-2]');check((await option.innerText()).includes(pairs[v][0])&&(await option.innerText()).includes(pairs[v][1]),'saved state pair');
    await option.press('Enter');check(await f.locator('.forbidden').count()===1,'saved forbidden diagram');check((await f.locator('#step-title').innerText()).includes('本問の正答'),'saved answer');
    check(await f.locator('.cross').evaluate(n=>{const r=n.getBoundingClientRect(),v=n.closest('.diagram-viewport').getBoundingClientRect();return r.left>=v.left&&r.right<=v.right}),'selected transition visible');
    await f.locator('.diagram-viewport').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/generated-'+v+'-'+width+'.png'});
    await f.locator('#scenario').selectOption('failure');await f.locator('#seek').press('End');
    check(await f.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===before,'frozen context unchanged');
    check(await f.evaluate(()=>{try{parent.document.body;return false}catch{return Object.isFrozen(window.OpenCBTDetail.context)}}),'isolated host');
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
    const saved=await page.evaluate(async id=>{const open=indexedDB.open('opencbt-fe-kihonjoho-v2'),db=await new Promise(resolve=>open.onsuccess=()=>resolve(open.result));const req=db.transaction('sessions').objectStore('sessions').get(id);const record=await new Promise(resolve=>req.onsuccess=()=>resolve(req.result));db.close();return record},run.session.id);
    check(JSON.stringify(saved.issued)===JSON.stringify(run.issued),'saved problem');check(JSON.stringify(saved.session.entries)===JSON.stringify(run.session.entries),'saved answers/order');check(JSON.stringify(saved.result)===JSON.stringify(run.result),'saved result');
    await page.getByRole('button',{name:'詳細解説を見る',exact:true}).click();await page.locator('.detail-frame.ready').waitFor();
    checks.push({width,variant:v,return:true,problem:true,answers:true,result:true});
  }
  return checks;
}`);
console.log(`Generated ${output}/verify.js and saved.js for isolated headless Playwright CLI.`);
