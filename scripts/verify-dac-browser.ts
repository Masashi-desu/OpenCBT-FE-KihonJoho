// Reproducible checks for a dedicated, isolated headless Playwright CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture, installFixtureGenerators } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";

const url = process.argv[2] ?? "http://127.0.0.1:5198/", output = "output/playwright/dac";
fs.mkdirSync(output, { recursive: true });
const viewport = viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(12000,size.height+200)");
fs.writeFileSync(output + "/verify.js", `async page => {
  page.setDefaultTimeout(15000); ${viewport}
  const check=(ok,message)=>{if(!ok)throw Error(message)}, conditions=[], errors=[];
  page.on('pageerror',e=>errors.push(e.message));let f;
  const settle=async()=>{await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1)};
  const geometry=()=>f.evaluate(()=>Object.fromEntries(['.diagram','.navigation'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y+scrollY,width:r.width,height:r.height}]})));
  const closeParts=async()=>{const g=await f.evaluate(()=>{const a=document.querySelector('.calibration').getBoundingClientRect(),b=document.querySelector('.calculation').getBoundingClientRect(),c=document.querySelector('.bit-caption').getBoundingClientRect(),d=document.querySelector('.bit-viewport').getBoundingClientRect();return{gap:b.left>=a.right?b.left-a.right:b.top-a.bottom,bits:d.top-c.bottom,inDiagram:document.querySelector('#bits').closest('.diagram')!==null}});check(g.inDiagram&&g.gap>=-1&&g.gap<=16.5&&g.bits>=-1&&g.bits<=8,'complementary layout '+JSON.stringify(g));};
  const step=async i=>{await f.locator('#step-select').selectOption(String(i));await settle()};
  const configure=async values=>{for(const [key,value] of Object.entries(values))await f.locator('#'+key).fill(String(value));await settle()};
  for(const width of [1280,390,320])for(const theme of ['light','dark']){
    await setViewport({width,height:width===1280?609:720});await page.goto(${JSON.stringify(url)});
    await page.evaluate(theme=>localStorage.setItem('opencbt-fe-kihonjoho-theme',theme),theme);
    await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2017h29h-fe-am-20")});
    await page.locator('.detail-frame.ready').waitFor();f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();await settle();
    check(await f.locator('html').getAttribute('data-theme')===theme,'theme');
    const initial=await geometry(), snapshots=[];
    for(let i=0;i<6;i++){
      await step(i);await closeParts();snapshots.push(await f.locator('#formula').innerText());const g=await geometry();
      check(Math.abs(g['.navigation'].y-initial['.navigation'].y)<1,'stable navigation '+JSON.stringify({width,theme,i,initial,g}));
      check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'iframe width '+width);
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page width '+width);
      check(await f.locator('#choice-check').isVisible()===(i===5),'only final comparison');
      check(await f.locator('button').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return !r.height||r.width>=43.5&&r.height>=43.5})),'44px button width and height at step '+i);
      if(i===2)check(await f.locator('.bit-viewport').evaluate(n=>{const bit=n.querySelector('.bit.lsb').getBoundingClientRect(),view=n.getBoundingClientRect();return bit.left>=view.left&&bit.right<=view.right+1}),'LSB is visible in its step');
      if(width===1280&&theme==='light'&&[0,3].includes(i)){await f.locator(i===0?'.stage-heading':'.calculation').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/step-'+i+'.png'})}
    }
    check(await f.locator('#formula .fraction [data-source=voltage]').innerText().then(s=>s.endsWith('2.5')),'exact original numerator');
    check(await f.locator('#formula .fraction [data-source=interval]').innerText().then(s=>s.endsWith('128')),'exact original denominator');
    check(await f.locator('#choice-rows tr').count()===4&&await f.locator('#choice-rows .matches').count()===1,'all four options');
    check((await f.locator('#choice-rows .matches').innerText()).startsWith('ア'),'official A');
    for(let i=4;i>=0;i--){await f.locator('#prev').press('Enter');check(await f.locator('#formula').innerText()===snapshots[i],'reverse '+i)}
    check(await f.locator('#prev').isDisabled(),'initial button');
    await f.locator('#seek').press('End');check((await f.locator('#counter').innerText()).includes('6 / 6'),'slider end');
    await f.locator('#seek').press('Home');await f.locator('#next').press('Enter');check((await f.locator('#counter').innerText()).includes('2 / 6'),'next button');
    await step(3);
    await f.locator('#formula [data-source=voltage]').press('Enter');
    check(await f.locator('#voltage-source').getAttribute('aria-pressed')==='true','formula selects voltage source');
    check((await f.locator('#explain').innerText()).includes('2.5−0＝2.5 V'),'numerator origin');
    await f.locator('#close-bit').press('Enter');
    check(await f.locator('#formula [data-source=voltage]').evaluate(n=>n===document.activeElement),'formula focus returns');
    await f.locator('#interval-source').press('Enter');
    check(await f.locator('#formula [data-source=interval]').getAttribute('aria-pressed')==='true','source selects denominator');
    check((await f.locator('#explain').innerText()).includes('128−0＝128段階'),'denominator origin');
    await f.locator('#interval-source').press('Enter');check(await f.locator('#close-bit').isHidden(),'repeat source clears');
    await f.locator('#volts').fill('5');
    check((await f.locator('#formula [data-source=voltage]').innerText()).endsWith('5'),'source edit updates numerator');
    check(await f.locator('#output').innerText()==='5 V','source edit updates output');
    await f.locator('#volts').fill('2.5');await f.locator('#close-bit').press('Enter');
    check(await f.locator('#close-bit').isHidden(),'focus restoration does not reselect field');
    await f.locator('#formula [data-source=bit]').press('Enter');
    check(await f.locator('.weight').last().getAttribute('aria-pressed')==='true','LSB term selects its bit');
    check((await f.locator('#bit-explain').innerText()).includes('(2.5/128) × 1'),'bit explanation uses same A and B');
    await f.locator('#close-bit').press('Enter');await f.locator('#volts').press('Escape');
    check(await f.locator('#volts').evaluate(n=>n===document.activeElement),'source field focus retained');
    check(Math.abs((await geometry())['.navigation'].y-initial['.navigation'].y)<1,'linked selection keeps navigation');
    await f.locator('#reference').fill('64');check(await f.locator('#code').inputValue()==='64','reference edit aligns probe');check(await f.locator('.bit-toggle').allTextContents().then(x=>x.join('')==='01000000'),'reference edit aligns bits');
    await f.locator('#reference').fill('128');check(await f.locator('#code').inputValue()==='128','reference restored in probe');
    await f.locator('.bit-toggle').last().press('Enter');check(await f.locator('#code').inputValue()==='129','LSB adds one');
    check(await f.locator('#reference').inputValue()==='128','probe preserves known calibration');
    check(await f.locator('.bit-toggle').allTextContents().then(x=>x.join('')==='10000001'),'bit edit synchronizes decimal and binary');
    check(await f.locator('#output').innerText()==='2.51953125 V','LSB voltage');
    await f.locator('.weight').last().press('Enter');check(await f.locator('#bit-detail').isVisible(),'select bit');
    check((await f.locator('#bit-explain').innerText()).includes('0.01953125 V'),'selected weight');
    if(width===1280&&theme==='light'){await f.locator('#bit-detail').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output + "/selected.png")}})}
    const selected=await geometry();check(Math.abs(selected['.navigation'].y-initial['.navigation'].y)<1,'selection keeps operation '+JSON.stringify({width,theme,initial,selected}));
    await f.locator('#close-bit').press('Enter');check(await f.locator('.weight').last().evaluate(n=>n===document.activeElement),'focus returns');
    await f.locator('.weight').last().press('Enter');await f.locator('.weight').last().press('Escape');check(await f.locator('#bit-detail').isHidden(),'escape closes');
    await f.locator('.weight').first().press('Enter');await f.locator('.weight').first().press('Enter');check(await f.locator('#bit-detail').isHidden(),'same selection closes');
    await configure({code:127});await f.locator('#code').fill('128');check(await f.locator('.bit-toggle').allTextContents().then(x=>x.join('')==='10000000'),'decimal edit synchronizes bits');check(await f.locator('#output').innerText()==='2.5 V','carry keeps unit interval');
    const before=await f.locator('#formula').innerText();await f.locator('#reference').fill('');check(await f.locator('#input-error').isVisible(),'invalid');
    if(width===390&&theme==='dark'){await f.locator('#input-error').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output + "/invalid.png")}})}
    check(await f.locator('#formula').innerText()===before,'retain valid formula');const oldCode=await f.locator('#code').inputValue();
    await f.locator('.bit-toggle').last().press('Enter');check(await f.locator('#code').inputValue()===oldCode,'invalid blocks bit mutation');
    check(Math.abs((await geometry())['.navigation'].y-initial['.navigation'].y)<1,'error keeps operation');
    await configure({reference:255});await step(5);check(await f.locator('#choice-rows .matches').count()===1,'max calibration comparison');
    check((await f.locator('#choice-rows .matches').innerText()).startsWith('イ'),'255 denominator applies only when calibrated there');
    await configure({reference:3,volts:1,code:1});check(await f.locator('#output').innerText()==='1/3 V','exact fraction');
    check(await f.locator('#choice-rows .matches').count()===0,'changed conditions no saved answer claim');
    await configure({code:0});check(await f.locator('#output').innerText()==='0 V','zero code');
    await step(4);check(await f.locator('#formula [data-source=probe]').evaluate(n=>n.getBoundingClientRect().width>=44),'single digit probe target');
    await f.locator('#bits').selectOption('12');await configure({reference:4095,volts:'0.001',code:4095});
    check(await f.locator('.bit-toggle').count()===12,'12 bits');check(await f.locator('#output').innerText()==='0.001 V','max code');
    await f.locator('.weight').first().press('Enter');check((await f.locator('#bit-explain').innerText()).includes('2048'),'high weight');
    await f.locator('#reset').press('Enter');await step(3);await f.locator('#volts').fill('2.500');check(await f.locator('#volts').inputValue()==='2.500','equivalent input preserves field');
    await f.locator('#volts').evaluate(n=>{n.value='5';n.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}))});
    check((await f.locator('#formula [data-source=voltage]').innerText()).endsWith('2.5'),'IME retains valid');await f.locator('#volts').dispatchEvent('compositionend');
    check((await f.locator('#formula [data-source=voltage]').innerText()).endsWith('5'),'IME commit');
    await f.locator('#reset').press('Enter');await step(5);
    await f.locator('.diagram').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/diagram-'+width+'-'+theme+'.png'});
    await f.locator('#choice-check').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output)}+'/choices-'+width+'-'+theme+'.png'});
    const height=await page.locator('.detail-frame').evaluate(n=>n.getBoundingClientRect().height);
    await f.locator('summary').press('Enter');await settle();await page.waitForFunction(h=>document.querySelector('.detail-frame').getBoundingClientRect().height>h+30,height);
    await f.locator('summary').press('Enter');await settle();await page.waitForFunction(h=>Math.abs(document.querySelector('.detail-frame').getBoundingClientRect().height-h)<2,height);
    const nested=await f.evaluate(()=>[...document.querySelectorAll('body *')].filter(n=>['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+2&&!n.matches('input')).map(n=>n.className));
    check(nested.length===0,'single vertical scrolling '+nested);
    const small=await f.locator('button,input,select,summary').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().width&&n.getBoundingClientRect().height<43.5).map(n=>n.id||n.className));check(small.length===0,'44px targets '+small);
    await f.evaluate(()=>document.documentElement.style.fontSize='200%');await settle();await step(0);const enlarged=await geometry();
    for(let i=0;i<6;i++){await step(i);await closeParts();check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% width '+i);check(Math.abs((await geometry())['.navigation'].y-enlarged['.navigation'].y)<1,'200% stable navigation '+JSON.stringify({width,i,enlarged,g:await geometry()}))}
    await f.locator('.bit-toggle').last().press('Enter');await settle();
    for(let i=0;i<6;i++){await step(i);check(Math.abs((await geometry())['.navigation'].y-enlarged['.navigation'].y)<1,'200% one-bit output keeps navigation '+JSON.stringify({width,i,enlarged,g:await geometry()}))}
    await f.locator('#volts').fill('');await settle();
    check(Math.abs((await geometry())['.navigation'].y-enlarged['.navigation'].y)<1,'200% error keeps operation position');
    await f.locator('#volts').fill('2.5');await settle();
    await f.locator('#next').press('Tab');await f.locator('#prev').press('Enter');check((await f.locator('#counter').innerText()).includes('5 / 6'),'keyboard backwards');
    conditions.push({width,theme,steps:6,font200:true,stable:true});
  }
  await page.goto(${JSON.stringify(url + "explanations/ipa-2017-spring-am-20/index.html")});
  check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone');
  check(errors.length===0,'browser errors '+errors.join(','));
  return {conditions,allSteps:true,allChoices:true,reciprocalSources:true,synchronizedCode:true,complementaryLayout:true,resolutionInDiagram:true,bitSelection:true,focus:true,invalidRecovery:true,IME:true,singleScroll:true,standalone:true};
}`);

await installFixtureGenerators();
const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2017h29h-fe-am-20")!;
let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
run = updateAnswer(run, run.issued[0].choices[1].id); run.session.entries[0].revealed = true;
run = finishRun(run, "completed"); await validateRun(run);
// The saved check below keeps this lesson's input contract explicit.
fs.writeFileSync(output + "/saved.js", `async page=>{
  page.setDefaultTimeout(15000);${viewport}
  await setViewport({width:1280,height:900});await page.goto(${JSON.stringify(url)});
  const check=(ok,message)=>{if(!ok)throw Error(message)};
  await page.evaluate(async run=>{
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2'),db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject});
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets:{}});run.instances.forEach(i=>tx.objectStore('generatedInstances').put(i));
    tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});tx.objectStore('results').put(run.result);
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});db.close();
  },${JSON.stringify(run)});
  await page.goto(${JSON.stringify(url + `#/detail/${run.session.id}/0/review`)});await page.locator('.detail-frame.ready').waitFor();
  const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  const context=await f.evaluate(()=>window.OpenCBTDetail.context),before=JSON.stringify(context),v=context.generation.parameters.values;
  const expected={bits:v[0],reference:2**(v[0]-1),volts:v[1]/2};
  for(const [key,value] of Object.entries(expected))check(await f.locator('#'+key).inputValue()===String(value),'saved '+key);
  await f.locator('#step-select').selectOption('5');const labels=await f.locator('#choice-rows tr td:first-child').allTextContents();
  for(let i=0;i<4;i++)check(labels[i].startsWith(context.choiceOrder[i].label+'：'),'saved option order');
  await f.locator('#volts').fill('1');check(await f.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===before,'immutable context');
  check(await f.evaluate(()=>{try{parent.document.body;return false}catch{return Object.isFrozen(window.OpenCBTDetail.context)}}),'isolated host');
  await f.locator('#reset').press('Enter');check(await f.locator('#volts').inputValue()===String(expected.volts),'reset saved');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  await page.getByRole('button',{name:'詳細解説を見る',exact:true}).click();await page.locator('.detail-frame.ready').waitFor();
  await page.goBack();await page.getByRole('button',{name:'詳細解説を見る',exact:true}).waitFor();
  const saved=await page.evaluate(async id=>{const open=indexedDB.open('opencbt-fe-kihonjoho-v2'),db=await new Promise(resolve=>open.onsuccess=()=>resolve(open.result));const req=db.transaction('sessions').objectStore('sessions').get(id);return await new Promise(resolve=>req.onsuccess=()=>resolve(req.result))},${JSON.stringify(run.session.id)});
  check(JSON.stringify(saved.issued)===${JSON.stringify(JSON.stringify(run.issued))},'saved question');check(JSON.stringify(saved.session.entries)===${JSON.stringify(JSON.stringify(run.session.entries))},'answer/order');check(JSON.stringify(saved.result)===${JSON.stringify(JSON.stringify(run.result))},'result');
  await page.goto(${JSON.stringify(url + "#/search?q=D%2FA&type=detail")});
  await page.getByRole('link',{name:'D/A変換・1ビット分の電圧を求める',exact:true}).click();await page.locator('.detail-frame.ready').waitFor();
  return {savedInputs:expected,choiceOrder:true,answer:true,result:true,contextFrozen:true,normalExplanationLink:true,return:true,search:true};
}`);
console.log(`Generated ${output}/{verify,saved}.js for isolated headless Playwright CLI.`);
