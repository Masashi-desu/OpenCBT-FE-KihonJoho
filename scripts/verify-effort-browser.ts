// Generate reproducible checks for a dedicated headless Playwright CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture, installFixtureGenerators } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";
const url = process.argv[2] ?? "http://127.0.0.1:5199/", output = "output/playwright/effort";
fs.mkdirSync(output, { recursive: true });
const viewport = viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(16000,size.height+200)");
fs.writeFileSync(output + "/verify.js", `async page => {
  page.setDefaultTimeout(15000);${viewport}
  const check=(ok,message)=>{if(!ok)throw Error(message)},conditions=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));let f;
  const settle=async()=>{await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1)};
  const geometry=()=>f.evaluate(()=>Object.fromEntries(['#diagram','.navigation','#step-select'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{y:r.y+scrollY,width:r.width,height:r.height}]})));
  for(const width of [1280,390,320])for(const theme of ['light','dark']){
    await setViewport({width,height:609});await page.goto(${JSON.stringify(url)});await page.evaluate(t=>localStorage.setItem('opencbt-fe-kihonjoho-theme',t),theme);
    await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2019h31h-fe-am-54")});
    await page.locator('.detail-frame.ready').waitFor();f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();await settle();
    check(await f.locator('html').getAttribute('data-theme')===theme,'theme');
    check(await f.locator('table,th,td').evaluateAll(ns=>ns.every(n=>['Top','Right','Bottom','Left'].every(side=>{const s=getComputedStyle(n);return s['border'+side+'Style']==='solid'&&parseFloat(s['border'+side+'Width'])>=1}))), 'table outer frame and cell grid');
    check(await f.locator('#standalone-title').isHidden()&&await f.locator('#standalone-credit').isHidden(),'deduplication');
    for(const font of [100,200]){
      await f.evaluate(v=>document.documentElement.style.fontSize=v+'%',font);await f.locator('#reset').press('Enter');await settle();const baseline=await geometry();
      const stable=async()=>{await settle();const g=await geometry();for(const s of Object.keys(g))for(const k of ['y','width','height'])check(Math.abs(g[s][k]-baseline[s][k])<1,'stable '+s+'/'+k+' '+JSON.stringify({width,theme,font,g,baseline}))};
      const texts=[];
      for(let i=0;i<8;i++){
        await f.locator('#step-select').selectOption(String(i));await stable();texts.push(await f.locator('#step-text').innerText());
        check(await f.locator('#counter').innerText()===(i+1)+' / 8 ステップ','counter');
        check(await f.locator('#capacity-check').isVisible()===(i===7),'capacity stage');
        check(await f.locator('#coding-value').innerText()===(i>=4?'95 人日':'— 人日'),'coding reveal');
        check(await f.locator('#extra-value').innerText()===(i>=5?'760 人日':'— 人日'),'extra reveal');
        check(await f.locator('#people-value').innerText()===(i>=6?'9 人':'— 人'),'people reveal');
        check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'inner overflow');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'outer overflow');
        check(await f.locator('button,input,select').evaluateAll(ns=>ns.every(n=>{const r=n.getBoundingClientRect();return !r.height||r.width>=43.5&&r.height>=43.5})),'44px');
        if(font===100&&[0,4,5,6,7].includes(i)&&((width===1280&&theme==='light')||(width===320&&theme==='dark'))){await page.screenshot({path:${JSON.stringify(output)}+'/step-'+i+'-'+width+'-'+theme+'.png',fullPage:true})}
      }
      for(let i=6;i>=0;i--){await f.locator('#prev').press('Enter');check(await f.locator('#step-text').innerText()===texts[i],'reverse')}
      check(await f.locator('#prev').isDisabled(),'first');await f.locator('#seek').press('End');check(await f.locator('#next').isDisabled(),'last');
      for(const source of ['A','B','C','D','E','F','G','H']){
        const origin=source==='G'?f.locator('#days'):f.locator('#diagram [data-source='+source+']').first();
        if(source==='G')await origin.focus();else await origin.press('Enter');
        check(await f.locator('[data-group='+source+']').getAttribute('class').then(s=>s?.includes('selected')),'selected '+source);await stable();
        await f.locator('#close-selection').press('Enter');check(await origin.evaluate(n=>n===document.activeElement),'focus return '+source);
        if(source!=='G'){await origin.press('Enter');await origin.press('Enter');check(await f.locator('#close-selection').isHidden(),'toggle');await origin.press('Space');await origin.press('Escape');check(await f.locator('#close-selection').isHidden(),'escape')}
      }
      for(const key of ['F','G','H'])for(let j=0;j<await f.locator('#formula [data-source='+key+']').count();j++){const ft=f.locator('#formula [data-source='+key+']').nth(j);await ft.press('Enter');check(await f.locator('[data-group='+key+']').getAttribute('class').then(s=>s?.includes('selected')),'formula source');await f.locator('#close-selection').press('Enter');check(await ft.evaluate(n=>n===document.activeElement),'exact formula return '+key+'/'+j)}
      await f.locator('#compare-toggle').press('Enter');await stable();check((await f.locator('#comparison').innerText()).includes('イ：9人')&&(await f.locator('#comparison').innerText()).includes('最少ではない'),'four choices');
      const height=await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height);
      await f.locator('#rules-toggle').press('Enter');await stable();check(await f.locator('#compare').isHidden()&&await f.locator('#rules').isVisible(),'exclusive');
      await f.locator('#rules-toggle').press('Enter');await settle();check(await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height)<height,'height shrink');
      await f.locator('#days').fill('100');await f.locator('#days').press('Escape');await settle();
      check((await f.locator('#step-text').innerText()).includes('9人')&&(await f.locator('#capacities').innerText()).includes('45人日余る'),'round up');
      await f.locator('#step-select').selectOption('6');check((await f.locator('#formula').innerText()).includes('55/100'),'exact fraction');
      const valid=await f.locator('#formula').innerText(),validGeometry=await geometry();await f.locator('#days').fill('');await settle();check(await f.locator('#input-error').isVisible()&&await f.locator('#formula').innerText()===valid,'invalid preserves');
      check(JSON.stringify(await geometry())===JSON.stringify(validGeometry),'error geometry');await f.locator('#days').fill('100');check(await f.locator('#input-error').isHidden(),'recover');
      await f.locator('#days').dispatchEvent('input',{isComposing:true});check(await f.locator('#formula').innerText()===valid,'composition');await f.locator('#days').dispatchEvent('compositionend');
      await f.locator('#other').fill('0');await f.locator('#step-select').selectOption('7');check(await f.locator('#people-value').innerText()==='1 人','zero extra');check((await f.locator('#multiplier-rule').textContent()).includes('全体は1倍'),'updated rule');
      await f.locator('#days').fill('9999');check(await f.locator('#people-value').innerText()==='1 人','one person');
      await f.locator('#compare-toggle').press('Enter');check((await f.locator('#choice-note').innerText()).includes('変更'),'edited comparison');await f.locator('#compare-toggle').press('Enter');
      await f.locator('#reset').press('Enter');await stable();check(await f.locator('#days').inputValue()==='95'&&await f.locator('#other').inputValue()==='8','reset');
      check(await f.evaluate(()=>![...document.querySelectorAll('body *')].some(n=>['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+2&&!n.matches('input'))),'single vertical scroll');
      if(font===200){await page.screenshot({path:${JSON.stringify(output)}+'/font200-'+width+'-'+theme+'.png',fullPage:true})}
    }
    await page.locator('.detail-page .question-footer.expanded').scrollIntoViewIfNeeded();check(await page.locator('.detail-references').isVisible(),'references');
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();await page.getByRole('button',{name:'詳細解説を見る',exact:true}).click();await page.locator('.detail-frame.ready').waitFor();
    conditions.push({width,theme,fonts:[100,200],steps:8});
  }
  await page.goto(${JSON.stringify(url + "explanations/ipa-2019-spring-am-54/index.html")});check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone');
  await page.goto(${JSON.stringify(url + "#/search?q=開発工数&type=detail")});await page.getByRole('link',{name:'開発工数と最少要員',exact:true}).waitFor();check(!errors.length,'errors '+errors.join(','));return{conditions,errors};
}`);

await installFixtureGenerators();
const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2019h31h-fe-am-54")!;
const runs = new Map<string, Awaited<ReturnType<typeof finishRun>>>(), wanted = ["1,0,7", "1,1,8", "3,2,9"];
for (let attempt = 0; attempt < 1000 && runs.size < wanted.length; attempt++) {
  let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
  const key = run.instances[0].parameters.values.join(","); if (!wanted.includes(key) || runs.has(key)) continue;
  run = updateAnswer(run, run.issued[0].choices[1].id); run.session.entries[0].revealed = true;
  run = finishRun(run, "completed"); await validateRun(run); runs.set(key, run);
}
if (runs.size !== wanted.length) throw Error("Missing saved effort input");
const ordered = wanted.map(key => runs.get(key)!), savedBundle = ordered[0].bundle;
const savedRuns = ordered.map(({ bundle: _bundle, ...run }) => run);
fs.writeFileSync(output + "/saved.js", `async page=>{
  page.setDefaultTimeout(15000);${viewport}await setViewport({width:1280,height:900});await page.goto('about:blank');await page.goto(${JSON.stringify(url)});
  const check=(ok,message)=>{if(!ok)throw Error(message)},runs=${JSON.stringify(savedRuns)},bundle=${JSON.stringify(savedBundle)},checks=[];
  await page.evaluate(async({runs,bundle})=>{
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2'),db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject}),tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    for(const run of runs){tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle,assets:{}});run.instances.forEach(i=>tx.objectStore('generatedInstances').put(i));tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});tx.objectStore('results').put(run.result)}
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});db.close();
  },{runs,bundle});
  for(const width of [1280,320])for(const run of runs){
    await setViewport({width,height:609});await page.goto('about:blank');await page.goto(${JSON.stringify(url)}+'#/detail/'+run.session.id+'/0/review');await page.locator('.detail-frame.ready').waitFor();
    const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame(),ctx=await f.evaluate(()=>window.OpenCBTDetail.context),before=JSON.stringify(ctx),values=run.instances[0].parameters.values;
    check(JSON.stringify(ctx.generation.parameters.values)===JSON.stringify(values),'saved values');check(await f.locator('#count0').inputValue()===String(values[0]*20),'saved counts');check(await f.locator('#days').inputValue()===String([85,95,105][values[1]]),'saved days');
    await f.locator('#seek').press('End');await f.locator('#compare-toggle').press('Enter');
    for(const choice of ctx.choiceOrder){const v=ctx.question.choices.find(c=>c.id===choice.id).content.blocks[0].text;check((await f.locator('#comparison').innerText()).includes(choice.label+'：'+v+'人'),'saved order')}
    await f.locator('#days').fill('100');check(await f.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===before,'context unchanged');
    check(await f.evaluate(()=>{try{parent.document.body;return false}catch{return Object.isFrozen(window.OpenCBTDetail.context)}}),'isolated frozen');await f.locator('#reset').press('Enter');check(await f.locator('#days').inputValue()===String([85,95,105][values[1]]),'saved reset');
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
    const saved=await page.evaluate(async id=>{const open=indexedDB.open('opencbt-fe-kihonjoho-v2'),db=await new Promise(r=>open.onsuccess=()=>r(open.result)),req=db.transaction('sessions').objectStore('sessions').get(id),record=await new Promise(r=>req.onsuccess=()=>r(req.result));db.close();return record},run.session.id);
    check(JSON.stringify(saved.issued)===JSON.stringify(run.issued),'saved problem');check(JSON.stringify(saved.session.entries)===JSON.stringify(run.session.entries),'saved answers');check(JSON.stringify(saved.result)===JSON.stringify(run.result),'saved result');checks.push({width,values});
  }return checks;
}`);
console.log(`Generated ${output}/verify.js and saved.js for isolated headless Playwright CLI.`);
fs.writeFileSync(output + "/visual.js", `async page=>{
  ${viewport}const results=[];
  for(const [width,theme]of [[1280,'light'],[320,'dark']]){
    await setViewport({width,height:900});await page.goto(${JSON.stringify(url + "explanations/ipa-2019-spring-am-54/index.html")});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
    for(const stage of ['0','5','7']){await page.locator('#step-select').selectOption(stage);await page.screenshot({path:${JSON.stringify(output)}+'/standalone-'+stage+'-'+width+'-'+theme+'.png',fullPage:true})}
    await page.locator('#days').fill('100');await page.locator('#days').press('Escape');await page.locator('#step-select').selectOption('6');await page.screenshot({path:${JSON.stringify(output)}+'/fraction-'+width+'-'+theme+'.png',fullPage:true});
    for(const id of ['count0','count1','count2','unit0','unit1','unit2'])await page.locator('#'+id).fill('999');await page.locator('#other').fill('20');
    const max=[];for(const stage of ['0','1','2','3','4','5','6','7']){await page.locator('#step-select').selectOption(stage);max.push(await page.evaluate(()=>({stage:document.querySelector('#counter').textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,y:document.querySelector('.navigation').getBoundingClientRect().y+scrollY})));}
    if(max.some(s=>s.overflow)||new Set(max.map(s=>s.y)).size!==1)throw Error('maximum values layout '+JSON.stringify(max));
    await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2019h31h-fe-am-54")});await page.locator('.detail-frame.ready').waitFor();const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
    await f.locator('#step-select').selectOption('7');await f.locator('.navigation').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/integrated-controls-'+width+'.png'});results.push({width,theme,max});
  }return results;
}`);
