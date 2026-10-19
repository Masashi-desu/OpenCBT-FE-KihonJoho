// Generate reproducible checks for an isolated headless Playwright CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";

const url = process.argv[2] ?? "http://127.0.0.1:5197/", output = "output/playwright/cache";
fs.mkdirSync(output, { recursive: true });
const viewport = viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(12000,size.height+200)");
fs.writeFileSync(output + "/verify.js", `async page => {
  page.setDefaultTimeout(15000);
  ${viewport}
  const check=(ok,message)=>{if(!ok)throw Error(message)}, conditions=[], errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let f;
  const settle=async()=>{await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);};
  const geometry=()=>f.evaluate(()=>Object.fromEntries(['.topology','.flow','.navigation'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y+scrollY,width:r.width,height:r.height}]})));
  const step=async i=>{await f.locator('#step-select').selectOption(String(i));await settle()};
  const configure=async values=>{for(const [key,value] of Object.entries(values))await f.locator('#'+key).fill(String(value));await settle()};
  const checkMemoryColors=async()=>{
    const result=await f.evaluate(()=>{
      const color=n=>getComputedStyle(n).color;
      const cache=color(document.querySelector('.cache-case .memory-name')),main=color(document.querySelector('.ram-case .memory-name'));
      const expected=memory=>memory==='cache'?cache:main;
      const fields=['xh','yh','xm','ym'].every(key=>color(document.getElementById(key))===expected(key.endsWith('h')?'cache':'main'));
      const labels=[...document.querySelectorAll('.matrix .memory-name,.memory-term,.ratio-label .memory-name')].every(n=>color(n)===expected(n.dataset.memory));
      const tokens=[...document.querySelectorAll('.math-token')].every(n=>color(n)===expected(n.dataset.key.endsWith('h')?'cache':'main'));
      const frames=getComputedStyle(document.querySelector('.cache-case')).borderTopColor===cache&&getComputedStyle(document.querySelector('.ram-case')).borderTopColor===main;
      const ratio=document.querySelector('.ratio');
      const bar=!ratio||(getComputedStyle(ratio).backgroundColor===main&&getComputedStyle(document.querySelector('.ratio-hit')).backgroundColor===cache);
      const noConnections=document.querySelector('.flow svg')===null;
      return {cache,main,distinct:cache!==main,fields,labels,tokens,frames,bar,noConnections};
    });
    check(result.distinct&&result.fields&&result.labels&&result.tokens&&result.frames&&result.bar&&result.noConnections,'cache/hit and main-memory/miss correspondence uses consistent colors without connection lines '+JSON.stringify(result));
  };
  for(const width of [1280,1140,390,320])for(const theme of ['light','dark']){
    await setViewport({width,height:width===1140?609:720});await page.goto(${JSON.stringify(url)});
    await page.evaluate(theme=>localStorage.setItem('opencbt-fe-kihonjoho-theme',theme),theme);
    await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2024-a-3")});
    await page.locator('.detail-frame.ready').waitFor();f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();await settle();
    check(await f.locator('html').getAttribute('data-theme')===theme,'theme '+theme);
    const initial=await geometry(), snapshots=[];
    for(let i=0;i<10;i++){
      await step(i);snapshots.push(await f.locator('#formula-box').innerText());
      await checkMemoryColors();
      check(await f.locator('.formula-guide').count()===([2,3].includes(i)?1:0),'formula explanation follows the average-time expression only');
      if([2,3].includes(i)){
        const guide=await f.locator('.formula-guide').innerText();
        check(guide.includes('ヒット時の時間 × h')&&guide.includes('ミス時の時間 × (1−h)')&&guide.includes('割合で重み付けした平均'),'weighted mean definition');
        check(await f.locator('.formula-guide').evaluate(n=>n.previousElementSibling.classList.contains('formula-line')),'definition immediately follows the numerical formula');
      }
      const g=await geometry();
      check(Math.abs(g['.navigation'].y-initial['.navigation'].y)<1,'stable navigation '+JSON.stringify({width,theme,i,initial,g}));
      check(Math.abs(g['.topology'].width-initial['.topology'].width)<1,'full width topology');
      check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'iframe horizontal overflow '+width);
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page horizontal overflow '+width);
    }
    check(snapshots[7].includes('200h ＝ 180'),'rearranged coefficients');check(snapshots[8].includes('0.90'),'correct rate');check(snapshots[9].includes('76 ns'),'verify original time');
    check(await f.locator('#choice-rows tr').count()===4&&await f.locator('#choice-rows .matches').count()===1,'all official choices');
    check((await f.locator('#choice-rows .matches').innerText()).startsWith('イ'),'correct original choice');
    for(let i=8;i>=0;i--){await f.locator('#prev').press('Enter');check(await f.locator('#formula-box').innerText()===snapshots[i],'reverse snapshot '+i)}
    check(await f.locator('#prev').isDisabled(),'initial previous');
    await f.locator('[data-cpu=y]').press('Enter');check(await f.locator('#arch-main-time').innerText()==='580 ns ↗','CPU Y times');
    await checkMemoryColors();
    await f.locator('#arch-cache-time').press('Enter');check(await f.locator('#yh').evaluate(n=>n===document.activeElement),'diagram opens matching editor');
    await configure({cache:512,main:1024});await step(8);check((await f.locator('#formula-box').innerText()).includes('0.90'),'capacity excluded');
    const state=await f.locator('#formula-box').innerText(),g=await geometry();await f.locator('#xh').fill('');
    check(await f.locator('#input-error').isVisible(),'error visible');check(await f.locator('#formula-box').innerText()===state,'invalid retains calculation');
    check(Math.abs((await geometry())['.navigation'].y-g['.navigation'].y)<1,'error preserves operation location');
    await configure({xh:20,xm:100,yh:20,ym:100});check((await f.locator('#formula-box').innerText()).includes('すべてのヒット率で一致'),'all h');
    await step(9);check((await f.locator('#explain').innerText()).includes('唯一')===false,'any case not unique');
    await configure({xh:30,xm:100,yh:40,ym:110});await step(8);check((await f.locator('#formula-box').innerText()).includes('一致するヒット率なし'),'no solution');
    await configure({xh:10,xm:100,yh:20,ym:200});check((await f.locator('#formula-box').innerText()).includes('範囲外'),'outside solution');
    await configure({xh:10,xm:100,yh:20,ym:100});check((await f.locator('#formula-box').innerText()).includes('0.00'),'endpoint zero');
    await configure({xh:10,xm:100,yh:10,ym:200});check((await f.locator('#formula-box').innerText()).includes('1.00'),'endpoint one');
    await configure({xh:10,xm:100,yh:12,ym:99});check((await f.locator('#formula-box').innerText()).includes('1/3'),'fraction retained');
    await f.locator('#reset').press('Enter');await step(9);
    for(const [part,selector] of [['calculation','.calculation'],['choices','#choice-check']]){
      await f.locator(selector).scrollIntoViewIfNeeded();await settle();
      await page.screenshot({path:${JSON.stringify(output)}+'/'+part+'-'+width+'-'+theme+'.png'});
    }
    const before=await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height);
    await f.locator('summary').press('Enter');await settle();
    await page.waitForFunction(before=>document.querySelector('.detail-frame').getBoundingClientRect().height>before+30,before);
    await f.locator('summary').press('Enter');await settle();
    await page.waitForFunction(before=>Math.abs(document.querySelector('.detail-frame').getBoundingClientRect().height-before)<2,before);
    const nested=await f.evaluate(()=>[...document.querySelectorAll('body *')].filter(n=>{const s=getComputedStyle(n);return ['auto','scroll'].includes(s.overflowY)&&n.scrollHeight>n.clientHeight+2&&!n.matches('input')}).map(n=>n.className));
    check(nested.length===0,'no inner vertical scrolling '+nested);
    await f.evaluate(()=>document.documentElement.style.fontSize='200%');await settle();
    check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200 percent width');
    await f.locator('#reset').press('Enter');await f.locator('#next').press('Enter');
    check((await f.locator('#counter').innerText()).includes('02'),'keyboard at 200 percent');
    const enlarged=await geometry();
    for(let i=0;i<10;i++){await step(i);await checkMemoryColors();check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'enlarged step width '+i);check(Math.abs((await geometry())['.navigation'].y-enlarged['.navigation'].y)<1,'enlarged stable navigation '+JSON.stringify({width,i,enlarged,g:await geometry()}));}
    await configure({xh:100000000,xm:0,yh:0,ym:99999999,cache:100000000,main:1});await step(9);
    for(const i of [0,2,3,4,5,9]){await step(i);await checkMemoryColors();}
    check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'large input width');
    await f.locator('#reset').press('Enter');await step(8);const valid=await f.locator('#formula-box').innerText();
    await f.locator('#xh').evaluate(n=>{n.value='80';n.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}))});
    check(await f.locator('#formula-box').innerText()===valid,'IME retains committed values');
    await f.locator('#xh').dispatchEvent('compositionend');check(await f.locator('#formula-box').innerText()!==valid,'IME commit updates equation');
    conditions.push({width,theme,steps:10,font200:true,stable:true});
  }
  await page.goto(${JSON.stringify(url + "explanations/ipa-2024-a-3/index.html")});
  check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone attribution');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'standalone overflow');
  check(errors.length===0,'browser errors '+errors.join(','));
  return {conditions,allSteps:true,allChoices:true,colorOnly:true,states:['unique','any','none','outside','zero','one','fraction','invalid'],focus:true,singleScroll:true,standalone:true};
}`);

const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2024-a-3")!;
let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
run = updateAnswer(run, run.issued[0].choices[1].id); run.session.entries[0].revealed = true;
run = finishRun(run, "completed"); await validateRun(run);
fs.writeFileSync(output + "/saved.js", `async page=>{
  page.setDefaultTimeout(15000);${viewport}
  await setViewport({width:1280,height:900});await page.goto(${JSON.stringify(url)});
  const check=(ok,message)=>{if(!ok)throw Error(message)};
  await page.evaluate(async run=>{
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3),db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject});
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets:{}});run.instances.forEach(i=>tx.objectStore('generatedInstances').put(i));
    tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});tx.objectStore('results').put(run.result);
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});db.close();
  },${JSON.stringify(run)});
  await page.goto(${JSON.stringify(url + `#/detail/${run.session.id}/0/review`)});await page.locator('.detail-frame.ready').waitFor();
  const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  const context=await f.evaluate(()=>window.OpenCBTDetail.context),before=JSON.stringify(context);
  const v=context.generation.parameters.values,expected={xh:v[2]+(100-v[0])*v[1],yh:v[2],xm:v[3],ym:v[3]+v[0]*v[1]};
  for(const [key,value] of Object.entries(expected))check(await f.locator('#'+key).inputValue()===String(value),'saved input '+key);
  await f.locator('#step-select').selectOption('9');
  const labels=await f.locator('#choice-rows tr td:first-child').allTextContents();
  for(let i=0;i<4;i++)check(labels[i].startsWith(context.choiceOrder[i].label+'：'),'saved choice order');
  await f.locator('#xh').fill('1');check(await f.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===before,'immutable context');
  check(await f.evaluate(()=>{try{parent.document.body;return false}catch{return Object.isFrozen(window.OpenCBTDetail.context)}}),'isolated host');
  await f.locator('#reset').press('Enter');check(await f.locator('#xh').inputValue()===String(expected.xh),'reset uses saved input');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  const saved=await page.evaluate(async id=>{const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3),db=await new Promise(resolve=>open.onsuccess=()=>resolve(open.result));const req=db.transaction('sessions').objectStore('sessions').get(id);return await new Promise(resolve=>req.onsuccess=()=>resolve(req.result))},${JSON.stringify(run.session.id)});
  check(JSON.stringify(saved.issued)===${JSON.stringify(JSON.stringify(run.issued))},'saved problem');check(JSON.stringify(saved.session.entries)===${JSON.stringify(JSON.stringify(run.session.entries))},'saved answer and order');check(JSON.stringify(saved.result)===${JSON.stringify(JSON.stringify(run.result))},'saved result');
  return {savedInputs:expected,choiceOrder:true,answer:true,result:true,contextFrozen:true,return:true};
}`);
fs.writeFileSync(output + "/states.js", `async page=>{
  ${viewport}
  await setViewport({width:1140,height:609});await page.goto(${JSON.stringify(url)});
  await page.evaluate(()=>localStorage.setItem('opencbt-fe-kihonjoho-theme','light'));
  await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2024-a-3")});
  await page.locator('.detail-frame.ready').waitFor();let f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  await f.locator('#step-select').selectOption('3');await f.locator('.formula-guide').scrollIntoViewIfNeeded();
  await page.screenshot({path:${JSON.stringify(output + "/formula-guide.png")}});
  await f.locator('#step-select').selectOption('4');await f.locator('.calculation').scrollIntoViewIfNeeded();
  await page.screenshot({path:${JSON.stringify(output + "/equation.png")}});
  await setViewport({width:390,height:720});await f.locator('#xh').fill('');
  await f.locator('#input-error').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output + "/invalid.png")}});
  await f.locator('#xh').fill('40');await f.locator('#step-select').selectOption('8');
  for(const [key,value] of Object.entries({xh:20,xm:100,yh:20,ym:100}))await f.locator('#'+key).fill(String(value));
  await f.locator('.calculation').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output + "/all-rates.png")}});
  return {equation:true,error:true,any:true};
}`);
fs.writeFileSync(output + "/colors.js", `async page=>{
  ${viewport}
  await setViewport({width:1140,height:1200});await page.goto(${JSON.stringify(url)});
  await page.evaluate(()=>localStorage.setItem('opencbt-fe-kihonjoho-theme','dark'));
  await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2024-a-3")});
  await page.locator('.detail-frame.ready').waitFor();const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  await f.locator('#step-select').selectOption('3');await f.locator('.topology').scrollIntoViewIfNeeded();
  await page.screenshot({path:${JSON.stringify(output + "/memory-colors.png")}});
  return {cache:await f.locator('.cache-case').innerText(),main:await f.locator('.ram-case').innerText(),formula:await f.locator('.formula-guide').innerText()};
}`);
fs.writeFileSync(output + "/correspondence.js", `async page=>{
  ${viewport}
  await setViewport({width:1140,height:1000});await page.goto(${JSON.stringify(url)});
  await page.evaluate(()=>localStorage.setItem('opencbt-fe-kihonjoho-theme','dark'));
  await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2024-a-3")});
  await page.locator('.detail-frame.ready').waitFor();const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  for(const [i,name] of [[2,'x'],[3,'y'],[4,'equation'],[9,'verification']]){
    await f.locator('#step-select').selectOption(String(i));
    await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await f.locator('.flow').scrollIntoViewIfNeeded();
    await page.screenshot({path:${JSON.stringify(output)}+'/correspondence-'+name+'.png'});
  }
  return {colorOnly:true,steps:[3,4,5,10]};
}`);
console.log(`Generated ${output}/{verify,saved,states,colors,correspondence}.js for isolated headless Playwright CLI.`);
