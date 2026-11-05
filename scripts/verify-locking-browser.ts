// Generate reproducible checks for a dedicated headless Playwright CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture, installFixtureGenerators } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";
const url = process.argv[2] ?? "http://127.0.0.1:5199/", output = "output/playwright/locking";
fs.mkdirSync(output, { recursive: true });
const viewport = viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(16000,size.height+200)");
fs.writeFileSync(output + "/verify.js", `async page => {
  page.setDefaultTimeout(15000); ${viewport}
  const check=(ok,message)=>{if(!ok)throw Error(message)},conditions=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message)); let f;
  const settle=async()=>{await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1)};
  const geometry=()=>f.evaluate(()=>Object.fromEntries(['.diagram-viewport','.navigation'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{y:r.y+scrollY,width:r.width,height:r.height}]})));
  for(const width of [1280,390,320])for(const theme of ['light','dark']){
    await setViewport({width,height:609});await page.goto(${JSON.stringify(url)});
    await page.evaluate(theme=>localStorage.setItem('opencbt-fe-kihonjoho-theme',theme),theme);
    await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2019r01a-fe-am-29")});
    await page.locator('.detail-frame.ready').waitFor(); f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();await settle();
    check(await f.locator('html').getAttribute('data-theme')===theme,'theme');
    check(await f.locator('#standalone-title').isHidden()&&await f.locator('#standalone-credit').isHidden(),'deduplication');
    check(await f.locator('.diagram-viewport').evaluate(n=>n.querySelector('svg').getBoundingClientRect().top-n.getBoundingClientRect().top>=16),'card top spacing');
    const choices=await f.evaluate(()=>window.LockingEngine.choices(window.OpenCBTDetail.context));
    for(const font of [100,200]){
      await f.evaluate(font=>document.documentElement.style.fontSize=font+'%',font);await settle();const baseline=await geometry();
      const stable=async()=>{const g=await geometry();for(const selector of Object.keys(g))for(const key of ['y','width','height'])check(Math.abs(g[selector][key]-baseline[selector][key])<1,'stable '+selector+'/'+key+' '+JSON.stringify({width,font,g,baseline}))};
      for(const c of choices){
        await f.locator('#scenario').selectOption(c.id);await settle();const trace=await f.evaluate(order=>window.LockingEngine.trace(order),c.order),texts=[],cursors={A:null,B:null},captured=new Set();
        for(let i=0;i<trace.length;i++){
          if(i)await f.locator('#next').press('Enter');await settle();await stable();
          const s=trace[i];check(await f.locator('#step-title').innerText()===s.title,'step '+c.id+'/'+i);
          if(['acquire','resume','wait'].includes(s.kind))cursors[s.tx]=s.index;
          if(s.kind==='commit')cursors[s.tx]=null;
          const active=await f.locator('.transaction[data-active=true]').evaluateAll(nodes=>nodes.map(n=>n.dataset.transaction));
          check(JSON.stringify(active)===JSON.stringify(s.deadlock?['A','B']:s.tx?[s.tx]:[]),'step actor '+c.id+'/'+i);
          for(const tx of ['A','B']){
            const current=await f.locator('[data-transaction='+tx+'] [aria-current=step]').evaluateAll(nodes=>nodes.map(n=>n.dataset.target));
            check(JSON.stringify(current)===JSON.stringify(cursors[tx]===null?[]:[tx+'-'+cursors[tx]]),'execution cursor '+tx+'/'+i);
            if(cursors[tx]!==null)check(await f.locator('[data-target='+tx+'-'+cursors[tx]+'] .cursor-marker').count()===1,'non-color cursor');
          }
          if(s.kind==='queued')check((await f.locator('[data-transaction='+s.tx+'] .phase').textContent()).includes('発行のみ'),'blocked issue is not execution');
          if(s.tx)check((await f.locator('[data-transaction='+s.tx+'] .lane-title').textContent()).startsWith('今回：'),'non-color actor');
          if(s.tx){
            const id=cursors[s.tx]===null?'[data-transaction='+s.tx+'] .lane-title':'[data-target='+s.tx+'-'+cursors[s.tx]+'] .cursor-marker';
            check(await f.locator(id).evaluate(n=>{const r=n.getBoundingClientRect(),v=n.closest('.diagram-viewport').getBoundingClientRect();return r.left>=v.left-1&&r.right<=v.right+1}),'active actor/cursor visible '+s.kind+'/'+width+'/'+font);
          }
          check(await f.locator('#counter').innerText()===i+' / '+(trace.length-1)+' ステップ','counter');
          for(const d of ['W','X','Y','Z'])check((await f.locator('[data-target=data-'+d+']').textContent()).includes(s.locks[d].length?s.locks[d].join('・')+' ［'+(d==='W'?'S':'X')+'］':'保持者なし'),'owner '+d);
          texts.push(await f.locator('#step-text').innerText());
          check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'inner overflow');
          check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'outer overflow');
          check(await f.locator('button,input,select,[data-target]').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return !r.height||r.width>=43.5&&r.height>=43.5})),'44px');
          if(font===100&&c.id==='choice-3'&&((width===1280&&theme==='light')||(width===320&&theme==='dark'))&&['wait','queued','release','resume'].includes(s.kind)&&!captured.has(s.kind)){
            captured.add(s.kind);await page.screenshot({path:${JSON.stringify(output)}+'/cursor-'+s.kind+'-'+width+'-'+theme+'.png',fullPage:true});
          }
        }
        check(await f.locator('#next').isDisabled(),'terminal next');
        check(trace.at(-1).deadlock===(c.id!=='choice-3'),'independent original verdict');
        if(font===100&&(c.id==='choice-1'||c.id==='choice-3')){await f.locator('.diagram-viewport').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/result-'+c.id+'-'+width+'-'+theme+'.png'})}
        for(let i=trace.length-2;i>=0;i--){await f.locator('#prev').press('Enter');check(await f.locator('#step-text').innerText()===texts[i],'reverse snapshot')}
        check(await f.locator('#prev').isDisabled(),'initial prev');await f.locator('#seek').press('End');check((await f.locator('#counter').innerText()).startsWith((trace.length-1)+' /'),'slider end');
        await f.locator('#seek').press('Home');check((await f.locator('#counter').innerText()).startsWith('0 /'),'slider home');
      }
      for(const id of ['A-0','A-1','A-2','A-3','B-0','B-1','B-2','B-3','data-W','data-X','data-Y','data-Z']){
        const n=f.locator('[data-target='+id+']');await n.press('Enter');check(await n.getAttribute('aria-pressed')==='true','selected');await stable();
        await f.locator('#close-selection').press('Enter');check(await n.evaluate(n=>n===document.activeElement),'focus return');
        await n.press('Space');await n.press('Escape');check(await f.locator('#close-selection').isHidden(),'escape');
        await n.press('Enter');await n.press('Enter');check(await f.locator('#close-selection').isHidden(),'toggle');
      }
      await f.locator('[data-target=A-0]').press('Enter');await f.locator('#next').press('Enter');check(await f.locator('#close-selection').isHidden(),'move clears');
      await f.locator('[data-target=A-0]').press('Enter');await f.locator('#scenario').selectOption('choice-3');check(await f.locator('#close-selection').isHidden(),'scenario clears');
      await settle();const h=await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height);
      await f.locator('#rules-toggle').press('Enter');await settle();check(await f.locator('#rules').isVisible(),'rules');await stable();
      check(await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height)>h+30,'height grow');
      await f.locator('#compare-toggle').press('Enter');await settle();check(await f.locator('#rules').isHidden()&&await f.locator('#compare').isVisible(),'exclusive supplements');await stable();
      await f.locator('#compare-toggle').press('Enter');await settle();check(Math.abs(await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height)-h)<2,'height shrink');
      check(await f.evaluate(()=>![...document.querySelectorAll('body *')].some(n=>['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+2&&!n.matches('input'))),'single vertical scroll');
      await f.locator('#reset').press('Enter');check(await f.locator('#scenario').inputValue()==='choice-3'&&(await f.locator('#counter').innerText()).startsWith('0 /'),'reset');
      if(font===200){await f.locator('.diagram-viewport').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/font200-'+width+'-'+theme+'.png'})}
    }
    await page.locator('.detail-page .question-footer.expanded').scrollIntoViewIfNeeded();check(await page.locator('.detail-references').isVisible(),'references');
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();await page.getByRole('button',{name:'詳細解説を見る',exact:true}).click();await page.locator('.detail-frame.ready').waitFor();
    conditions.push({width,theme,choices:4,fonts:[100,200]});
  }
  await page.goto(${JSON.stringify(url + "explanations/ipa-2019-autumn-am-29/index.html")});check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone');
  await page.goto(${JSON.stringify(url + "#/search?q=2相ロッキング&type=detail")});await page.getByRole('link',{name:'2相ロッキングプロトコル',exact:true}).waitFor();
  check(!errors.length,'errors '+errors.join(','));return {conditions,errors};
}`);

await installFixtureGenerators();
const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2019r01a-fe-am-29")!;
const runs = new Map<number, Awaited<ReturnType<typeof finishRun>>>();
for (let attempt = 0; attempt < 1024 && runs.size < 16; attempt++) {
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
  const variant = run.instances[0].parameters.values[0];
  if (runs.has(variant)) continue;
  run = updateAnswer(run, run.issued[0].choices[1].id); run.session.entries[0].revealed = true;
  run = finishRun(run, "completed"); await validateRun(run); runs.set(variant, run);
}
if (runs.size !== 16) throw Error("Missing a saved generator variant");
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
  for(const width of [1280,320])for(const [v,run]of runs.entries()){
    await setViewport({width,height:width===1280?900:609});
    await page.goto('about:blank');await page.goto(${JSON.stringify(url)}+'#/detail/'+run.session.id+'/0/review');await page.locator('.detail-frame.ready').waitFor();
    const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame(),context=await f.evaluate(()=>window.OpenCBTDetail.context),before=JSON.stringify(context);
    check(context.generation.parameters.values[0]===v,'saved variant');
    const expected=await f.evaluate(()=>window.LockingEngine.choices(window.OpenCBTDetail.context));
    for(const c of expected){
      await f.locator('#scenario').selectOption(c.id);
      check((await f.locator('#scenario option:checked').innerText()).includes(c.order.map(d=>d==='W'?'read W':'update '+d).join(' → ')),'saved order');
      await f.locator('#seek').press('End');
      check((await f.locator('#step-title').innerText()).includes(c.id==='choice-value-3'?'デッドロックなし':'デッドロック：'),'saved result');
    }
    if(v===0||v===15){await f.locator('.diagram-viewport').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/generated-'+v+'-'+width+'.png'})}
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
