// Reproducible checks for a dedicated, isolated headless Playwright CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";

const url = process.argv[2] ?? "http://127.0.0.1:5197/", output = "output/playwright/binary";
fs.mkdirSync(output, { recursive: true });
const viewport = viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(12000,size.height+200)");
fs.writeFileSync(output + "/verify.js", `async page => {
  page.setDefaultTimeout(15000); ${viewport}
  const check=(ok,message)=>{if(!ok)throw Error(message)},conditions=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));let f;
  const settle=async()=>{await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);};
  const geometry=()=>f.evaluate(()=>Object.fromEntries(['.diagram-viewport','.navigation'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{y:r.y+scrollY,width:r.width,height:r.height}]})));
  const seek=async i=>{await f.locator('#seek').evaluate((n,i)=>{n.value=String(i);n.dispatchEvent(new Event('input',{bubbles:true}))},i);await settle()};
  for(const width of [1280,390,320])for(const theme of ['light','dark']){
    await setViewport({width,height:609});await page.goto(${JSON.stringify(url)});
    await page.evaluate(theme=>localStorage.setItem('opencbt-fe-kihonjoho-theme',theme),theme);
    await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-sample-2022-dec-a-2")});
    await page.locator('.detail-frame.ready').waitFor();f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();await settle();
    check(await f.locator('html').getAttribute('data-theme')===theme,'theme');
    const g=await geometry();
    for(let option=0;option<4;option++){
      await f.locator('#option').selectOption(String(option));await settle();
      const result=await f.evaluate(option=>{
        const expected=window.BinaryEngine.trace(13,8,option),failures=[],seek=document.querySelector('#seek');
        const initial=document.querySelector('.navigation').getBoundingClientRect().y+scrollY;
        for(let i=0;i<expected.states.length;i++){
          seek.value=String(i);seek.dispatchEvent(new Event('input',{bubbles:true}));const s=expected.states[i];
          if(document.querySelector('#step-title').textContent!==s.title||document.querySelector('#step-text').textContent!==s.text)failures.push('explanation '+i);
          if(document.querySelectorAll('.current').length!==1||document.querySelector('.current').dataset.node!==s.phase)failures.push('current '+i);
          for(let cell=0;cell<8;cell++)if(document.querySelector('[data-node="cell-'+cell+'"] .value').textContent!==String(s.cells[cell]??'—'))failures.push('cell '+i+'/'+cell);
          if(Math.abs(document.querySelector('.navigation').getBoundingClientRect().y+scrollY-initial)>.5)failures.push('position '+i);
          if(document.documentElement.scrollWidth>innerWidth+1)failures.push('overflow '+i);
        }
        return {failures,states:expected.states.length};
      },option);
      check(!result.failures.length,'all states '+JSON.stringify({width,theme,option,result}));
      check(await f.locator('#next').isDisabled(),'end next');
      check(!(await f.locator('#scene').textContent()).includes('次へ'),'completed diagram has result-specific guidance');
      await f.locator('#prev').press('Enter');check((await f.locator('#counter').innerText()).startsWith('33 /'),'reverse');
    }
    await f.locator('#option').selectOption('3');await seek(2);
    check((await f.locator('#step-text').innerText()).includes('jは13のまま'),'store before update');
    await f.locator('#next').press('Enter');check((await f.locator('#step-text').innerText()).includes('13から6'),'update after store');
    const text=await f.locator('#step-text').innerText();
    await f.locator('#input-j').fill('');check(await f.locator('#input-error').isVisible(),'input error');
    check(await f.locator('#step-text').innerText()===text,'invalid retains state');
    await f.locator('#option').selectOption('0');check(await f.locator('#option').inputValue()==='3','invalid keeps choice');
    check(Math.abs((await geometry())['.navigation'].y-g['.navigation'].y)<1,'error stable navigation');
    await f.locator('#input-j').fill('0013');check((await f.locator('#counter').innerText()).startsWith('4 /'),'equivalent input retains position');
    await f.locator('[data-node="a"]').press('Enter');check(await f.locator('#selection').isVisible(),'select diagram');
    await f.locator('#close-selection').press('Enter');check(await f.locator('[data-node="a"]').evaluate(n=>n===document.activeElement),'focus return');
    await f.locator('[data-node="a"]').press('Space');await f.locator('[data-node="a"]').press('Escape');check(await f.locator('#selection').isHidden(),'escape closes');
    await f.locator('[data-node="cell-0"]').press('Enter');check((await f.locator('#selection-text').innerText()).includes('1 × 1 ＝ 1'),'positional weight');
    await f.locator('[data-node="cell-0"]').press('Enter');check(await f.locator('#selection').isHidden(),'reselect closes');
    await settle();const h=await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height);
    await f.locator('summary').press('Enter');await settle();
    await page.waitForFunction(h=>document.querySelector('.detail-frame').getBoundingClientRect().height>h+30,h);
    await f.locator('summary').press('Enter');await settle();
    await page.waitForFunction(h=>Math.abs(document.querySelector('.detail-frame').getBoundingClientRect().height-h)<2,h);
    check(Math.abs((await geometry())['.navigation'].y-g['.navigation'].y)<1,'supplement stable');
    await f.locator('#input-j').fill('1');await seek(33);check((await f.locator('#step-text').innerText()).includes('00000001'),'lower boundary');
    await f.locator('#input-j').fill('99');await seek(33);check((await f.locator('#step-text').innerText()).includes('01100011'),'upper boundary');
    await f.locator('#input-j').fill('100');check(await f.locator('#input-error').isVisible(),'upper invalid');
    await f.locator('#reset').press('Enter');check(await f.locator('#input-j').inputValue()==='99','reset restores valid');
    await f.locator('#input-j').fill('13');await seek(2);
    await f.locator('.diagram-viewport').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/step-'+width+'-'+theme+'.png'});
    await seek(33);await f.locator('.explanation').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/complete-'+width+'-'+theme+'.png'});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'outer overflow');
    const nested=await f.evaluate(()=>[...document.querySelectorAll('body *')].filter(n=>{const s=getComputedStyle(n);return ['auto','scroll'].includes(s.overflowY)&&n.scrollHeight>n.clientHeight+2&&!n.matches('input')}).map(n=>n.className));
    check(!nested.length,'nested vertical scroll '+nested);
    check(await f.locator('[data-node]').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return r.height>=44&&r.width>=44})),'44px diagram targets');
    await f.evaluate(()=>document.documentElement.style.fontSize='200%');await settle();const enlarged=await geometry();
    for(const i of [0,2,3,16,33]){await seek(i);check(Math.abs((await geometry())['.navigation'].y-enlarged['.navigation'].y)<1,'enlarged stable');check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'enlarged width');}
    await f.locator('#reset').press('Enter');await f.locator('#next').press('Enter');check((await f.locator('#counter').innerText()).startsWith('2 /'),'keyboard at 200%');
    conditions.push({width,theme,allFourChoices:true,statesPerChoice:34,font200:true});
  }
  await page.goto(${JSON.stringify(url + "explanations/ipa-sample-2022-dec-a-2/index.html")});
  check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone title and credit');
  check(!errors.length,'page errors '+errors.join(','));return {conditions,errors};
}`);

const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-sample-2022-dec-a-2")!;
let run;
// Choose a real generated narrow-width question to exercise the saved contract.
for (let attempt = 0; attempt < 128; attempt++) {
  run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
  if (run.instances[0].parameters.values[0] === 5) break;
}
if (!run || run.instances[0].parameters.values[0] !== 5) throw Error("No five-digit saved fixture");
run = updateAnswer(run, run.issued[0].choices[1].id); run.session.entries[0].revealed = true;
run = finishRun(run, "completed"); await validateRun(run);
fs.writeFileSync(output + "/saved.js", `async page=>{
  page.setDefaultTimeout(15000);${viewport}
  await setViewport({width:1280,height:900});await page.goto(${JSON.stringify(url)});
  const check=(ok,message)=>{if(!ok)throw Error(message)};
  await page.evaluate(async run=>{
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2',4),db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject});
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets:{}});run.instances.forEach(i=>tx.objectStore('generatedInstances').put(i));
    tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});tx.objectStore('results').put(run.result);
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});db.close();
  },${JSON.stringify(run)});
  await page.goto(${JSON.stringify(url + `#/detail/${run.session.id}/0/review`)});await page.locator('.detail-frame.ready').waitFor();
  const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();const context=await f.evaluate(()=>window.OpenCBTDetail.context),before=JSON.stringify(context);
  check(context.generation.parameters.values[0]===5,'saved width');check(await f.locator('[data-node^="cell-"]').count()===5,'five array cells');
  const choices=await f.locator('#option option').allTextContents();
  for(let i=0;i<4;i++){const id='choice-value-'+(i+1);check(choices[i]===context.choiceOrder.find(c=>c.id===id).label,'saved labels');}
  await f.locator('#input-j').fill('31');await f.locator('#seek').evaluate(n=>{n.value=n.max;n.dispatchEvent(new Event('input',{bubbles:true}))});
  check((await f.locator('#step-text').innerText()).includes('11111'),'saved max input');
  check(await f.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===before,'frozen context unchanged');
  check(await f.evaluate(()=>{try{parent.document.body;return false}catch{return Object.isFrozen(window.OpenCBTDetail.context)}}),'isolated host');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  const saved=await page.evaluate(async id=>{const open=indexedDB.open('opencbt-fe-kihonjoho-v2',4),db=await new Promise(resolve=>open.onsuccess=()=>resolve(open.result));const req=db.transaction('sessions').objectStore('sessions').get(id);return await new Promise(resolve=>req.onsuccess=()=>resolve(req.result))},${JSON.stringify(run.session.id)});
  check(JSON.stringify(saved.issued)===${JSON.stringify(JSON.stringify(run.issued))},'saved problem');check(JSON.stringify(saved.session.entries)===${JSON.stringify(JSON.stringify(run.session.entries))},'saved answer and order');check(JSON.stringify(saved.result)===${JSON.stringify(JSON.stringify(run.result))},'saved result');
  return {savedWidth:5,choiceOrder:true,answer:true,result:true,return:true};
}`);
console.log(`Generated ${output}/verify.js and saved.js for isolated headless Playwright CLI.`);
