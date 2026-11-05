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
  const settleCards=async()=>{
    await f.locator('.lsb-case').evaluateAll(rows=>Promise.allSettled(rows.flatMap(row=>row.getAnimations().map(animation=>animation.finished))));
    await settle();
  };
  const geometry=()=>f.evaluate(()=>Object.fromEntries(['.diagram','.navigation'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y+scrollY,width:r.width,height:r.height}]})));
  const closeParts=async()=>{
    const g=await f.evaluate(()=>{
      const a=document.querySelector('.calibration').getBoundingClientRect(), b=document.querySelector('.calculation').getBoundingClientRect();
      const figure=document.querySelector('.lsb-figure'), controls=figure.querySelector('.bit-caption').getBoundingClientRect();
      const comparison=figure.querySelector('.lsb-comparison').getBoundingClientRect(), cases=[...figure.querySelectorAll('.lsb-case')];
      const rule=figure.querySelector('.lsb-rule').getBoundingClientRect();
      return {gap:b.left>=a.right?b.left-a.right:b.top-a.bottom, controlsGap:rule.top-controls.bottom, comparisonGap:comparison.top-rule.bottom,
        together:cases.length===2&&cases.every(row=>row.querySelector('.bit-viewport')&&row.querySelector('.lsb-voltage'))&&comparison.bottom<=a.top};
    });
    check(g.together&&g.gap>=-1&&g.gap<=16.5&&g.controlsGap>=-1&&g.controlsGap<=8&&g.comparisonGap>=-1&&g.comparisonGap<=8,'each output owns its input diagram '+JSON.stringify(g));
  };
  const caseBits=bit=>f.locator('#lsb-input-'+bit+' .bit-toggle');
  const caseWeights=bit=>f.locator('#lsb-input-'+bit+' .weight');
  const currentCase=()=>f.locator('.lsb-case[aria-current="true"]');
  const currentBits=()=>currentCase().locator('.bit-toggle');
  const currentVoltage=()=>currentCase().locator('.lsb-voltage');
  const step=async i=>{await f.locator('#step-select').selectOption(String(i));await settle()};
  const configure=async values=>{for(const [key,value] of Object.entries(values))await f.locator('#'+key).fill(String(value));await settle()};
  for(const width of [1280,390,320])for(const theme of ['light','dark']){
    await setViewport({width,height:width===1280?609:720});await page.goto(${JSON.stringify(url)});
    await page.evaluate(theme=>localStorage.setItem('opencbt-fe-kihonjoho-theme',theme),theme);
    await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2017h29h-fe-am-20")});
    await page.locator('.detail-frame.ready').waitFor();f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();await settle();
    if(width===320&&theme==='dark'){
      await setViewport({width:1280,height:720});await settle();
      await setViewport({width,height:720});await settle();
    }
    check(await f.locator('html').getAttribute('data-theme')===theme,'theme');
    const initialConditions='ディジタル値0を入力したときの出力電圧が0Vとなり、ディジタル値128を入力したときの出力電圧が2.5Vとなる場合、最下位の1ビットの変化による当該D/A 変換器の出力電圧の変化は何Vかを求める';
    check(await f.locator('#known-conditions').innerText()===initialConditions,'known conditions prose');
    check(await f.locator('#known-conditions').evaluate(n=>{
      const card=document.querySelector('.diagram'), figure=card.querySelector('.lsb-figure');
      return card.firstElementChild===n&&n.getBoundingClientRect().bottom<=figure.getBoundingClientRect().top&&getComputedStyle(n).textAlign==='center';
    }),'known conditions centered at the top inside the diagram card');
    check((await caseBits(0).allTextContents()).join('')==='10000000'&&(await caseBits(1).allTextContents()).join('')==='10000001','each output displays its full binary input');
    for(const bit of [0,1])check((await caseWeights(bit).allTextContents()).join(' ')==='重み128 重み64 重み32 重み16 重み8 重み4 重み2 C 重み1','each output displays its weights');
    check(await f.locator('#lsb-voltage-0').innerText()==='2.5 V'&&await f.locator('#lsb-voltage-1').innerText()==='？ V','comparison starts with the known and unknown outputs');
    const cardState=await f.locator('#lsb-flip').evaluate(button=>{
      button.click();
      const cards=[...document.querySelectorAll('.lsb-case')];
      return {top:cards[0].id, animated:cards.every(card=>card.getAnimations().length===1)};
    });
    check(cardState.top==='lsb-input-1'&&cardState.animated,'the new current card moves to the top with animation');
    check(await f.locator('#code').inputValue()==='129'&&await f.locator('#lsb-input-1').getAttribute('aria-current')==='true'&&await currentBits().last().innerText()==='1','comparison flips the actual probe from 0 to 1');
    check(await f.locator('#reference').inputValue()==='129'&&await f.locator('#volts').inputValue()==='2.51953125','bit flip synchronizes both lower fields');
    await f.locator('#lsb-flip').press('Enter');
    check(await f.locator('#code').inputValue()==='128'&&await f.locator('#lsb-input-0').getAttribute('aria-current')==='true'&&await currentBits().last().innerText()==='0','comparison flips the actual probe from 1 to 0');
    check(await f.locator('.lsb-case').first().getAttribute('id')==='lsb-input-0','rapid return moves the current card back on top');
    await f.locator('#lsb-flip').blur();
    await settleCards();
    if(width!==1280)check(await f.evaluate(()=>{
      const bottoms=selector=>[...document.querySelectorAll(selector)].map(n=>n.getBoundingClientRect().bottom).sort((a,b)=>a-b);
      const views=bottoms('.bit-viewport'), bars=bottoms('.overlay-scrollbar-horizontal:not([hidden])');
      return bars.length===views.length&&views.every((bottom,i)=>Math.abs(bottom-bars[i])<=3);
    }),'horizontal scrollbars follow the reordered bit rows');
    const initial=await geometry(), snapshots=[];
    for(let i=0;i<6;i++){
      await step(i);await closeParts();snapshots.push(await f.locator('#formula').innerText());const g=await geometry();
      check(Math.abs(g['.navigation'].y-initial['.navigation'].y)<1,'stable navigation '+JSON.stringify({width,theme,i,initial,g}));
      check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'iframe width '+width);
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page width '+width);
      check(await f.locator('#choice-check').isVisible()===(i===5),'only final comparison');
      check(await f.locator('#lsb-difference').innerText()===(i<3?'ΔV':'ΔV = 0.01953125 V'),'difference revealed by the calculation step');
      check(await f.locator('button').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return !r.height||r.width>=43.5&&r.height>=43.5})),'44px button width and height at step '+i);
      if(i===0||i===2)check(await f.locator('.bit-viewport').evaluateAll(nodes=>nodes.every(n=>{const bit=n.querySelector('.bit.lsb').getBoundingClientRect(),view=n.getBoundingClientRect();return bit.left>=view.left&&bit.right<=view.right+1})),'both LSBs are visible on entry and at the bit step');
      if(width===1280&&theme==='light'&&i===3)await f.locator('.lsb-figure').screenshot({path:${JSON.stringify(output)}+'/integrated.png'});
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
    check(await f.locator('#known-conditions').innerText()===initialConditions.replace('2.5V','5V'),'voltage updates prose');
    check((await f.locator('#formula [data-source=voltage]').innerText()).endsWith('5'),'source edit updates numerator');
    check(await currentVoltage().innerText()==='5 V','source edit updates output');
    await f.locator('#volts').fill('2.5');await f.locator('#close-bit').press('Enter');
    check(await f.locator('#close-bit').isHidden(),'focus restoration does not reselect field');
    await f.locator('#formula [data-source=bit]').press('Enter');
    check(await caseWeights(0).last().getAttribute('aria-pressed')==='true','LSB term selects the current input’s bit');
    check((await f.locator('#bit-explain').innerText()).includes('(2.5 ÷ 128) × 1'),'bit explanation uses same A and B');
    await f.locator('#close-bit').press('Enter');await f.locator('#volts').press('Escape');
    check(await f.locator('#volts').evaluate(n=>n===document.activeElement),'source field focus retained');
    check(Math.abs((await geometry())['.navigation'].y-initial['.navigation'].y)<1,'linked selection keeps navigation');
    await configure({reference:64,volts:5});
    check(await f.locator('#code').inputValue()==='64','reference edit aligns probe');
    check(await currentBits().allTextContents().then(x=>x.join('')==='01000000'),'reference edit aligns bits');
    check(await f.locator('#known-conditions').innerText()===initialConditions.replace('128','64').replace('2.5V','5V'),'prose follows both edited conditions');
    check((await f.locator('#interval-source').innerText()).includes('＋64')&&(await f.locator('#voltage-source').innerText()).includes('＋5 V'),'diagram uses both edited conditions');
    check((await f.locator('#formula .fraction [data-source=interval]').innerText()).endsWith('64')&&(await f.locator('#formula .fraction [data-source=voltage]').innerText()).endsWith('5'),'fraction uses both edited conditions');
    check((await f.locator('#formula').innerText()).includes('0.078125 V')&&await currentVoltage().innerText()==='5 V','unit and output use both edited conditions');
    check(await f.locator('#lsb-voltage-0').innerText()==='5 V'&&await f.locator('#lsb-voltage-1').innerText()==='5.078125 V'&&await f.locator('#lsb-difference').innerText()==='ΔV = 0.078125 V','comparison uses the edited calibration');
    await configure({reference:128,volts:2.5});check(await f.locator('#code').inputValue()==='128','reference restored in probe');
    await caseBits(1).nth(1).press('Enter');
    check(await f.locator('#code').inputValue()==='193'&&(await caseBits(0).allTextContents()).join('')==='11000000'&&(await caseBits(1).allTextContents()).join('')==='11000001','a bit flip uses its own input as the starting code');
    check(await caseBits(1).nth(1).evaluate(button=>button===document.activeElement),'reordering preserves focus on the moved control');
    await configure({code:128});
    await currentBits().last().press('Enter');check(await f.locator('#code').inputValue()==='129','LSB adds one');
    check(await f.locator('#lsb-input-1').getAttribute('aria-current')==='true'&&await f.locator('#lsb-voltage-1').innerText()==='2.51953125 V','bit-row operation updates the comparison');
    check(await f.locator('#reference').inputValue()==='129'&&await f.locator('#volts').inputValue()==='2.51953125','probe updates the lower fields');
    check(await f.locator('#known-conditions').innerText()===initialConditions.replace('128','129').replace('2.5V','2.51953125V'),'probe updates the conditions above');
    check(await f.locator('#lsb-difference').innerText()==='ΔV = 0.01953125 V','changing code keeps the calibrated voltage step');
    check(await currentBits().allTextContents().then(x=>x.join('')==='10000001'),'bit edit synchronizes decimal and binary');
    check(await currentVoltage().innerText()==='2.51953125 V','LSB voltage');
    await caseWeights(0).last().press('Enter');
    check((await f.locator('#bit-explain').innerText()).includes('入力コード128では、この桁は0'),'weight explanation follows the other input');
    await caseWeights(1).last().press('Enter');check(await f.locator('#bit-detail').isVisible(),'switching rows keeps the weight explanation open');
    check((await f.locator('#bit-explain').innerText()).includes('入力コード129では、この桁は1'),'weight explanation follows the selected row');
    if(width===1280&&theme==='light'){await f.locator('#bit-detail').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output + "/selected.png")}})}
    const selected=await geometry();check(Math.abs(selected['.navigation'].y-initial['.navigation'].y)<1,'selection keeps operation '+JSON.stringify({width,theme,initial,selected}));
    await f.locator('#close-bit').press('Enter');check(await caseWeights(1).last().evaluate(n=>n===document.activeElement),'focus returns to the selected row');
    await caseWeights(1).last().press('Enter');await caseWeights(1).last().press('Escape');check(await f.locator('#bit-detail').isHidden(),'escape closes');
    await caseWeights(1).first().press('Enter');await caseWeights(1).first().press('Enter');check(await f.locator('#bit-detail').isHidden(),'same selection closes');
    await configure({code:127});await f.locator('#code').fill('128');check(await currentBits().allTextContents().then(x=>x.join('')==='10000000'),'decimal edit synchronizes bits');check(await currentVoltage().innerText()==='2.5 V','carry keeps unit interval');
    const before=await f.locator('#formula').innerText();await f.locator('#reference').fill('');check(await f.locator('#input-error').isVisible(),'invalid');
    if(width===390&&theme==='dark'){await f.locator('#input-error').scrollIntoViewIfNeeded();await page.screenshot({path:${JSON.stringify(output + "/invalid.png")}})}
    check(await f.locator('#known-conditions').innerText()===initialConditions,'invalid input retains valid prose');
    check(await f.locator('#formula').innerText()===before,'retain valid formula');const oldCode=await f.locator('#code').inputValue();
    await currentBits().last().press('Enter');check(await f.locator('#code').inputValue()===oldCode,'invalid blocks bit mutation');
    await f.locator('#lsb-flip').press('Enter');check(await f.locator('#code').inputValue()===oldCode,'invalid blocks comparison flip');
    check(Math.abs((await geometry())['.navigation'].y-initial['.navigation'].y)<1,'error keeps operation');
    await configure({code:134});await step(5);
    check(await f.locator('#reference').inputValue()==='134'&&await f.locator('#volts').inputValue()==='2.6171875','typed code updates the lower fields exactly');
    check((await f.locator('#formula').innerText()).includes('2.6171875')&&(await f.locator('#choice-rows .matches').innerText()).includes('× 134 ＝ 2.6171875'),'formula and choice comparison use the same point');
    if(width===1280&&theme==='dark'){
      await setViewport({width,height:1120});await settleCards();
      await f.locator('#diagram').screenshot({path:${JSON.stringify(output)}+'/synchronized.png'});
      await setViewport({width,height:609});await settle();
    }
    await configure({reference:255,volts:2.5});check(await f.locator('#choice-rows .matches').count()===1,'max calibration comparison');
    check((await f.locator('#choice-rows .matches').innerText()).startsWith('イ'),'255 denominator applies only when calibrated there');
    await configure({reference:3,volts:1,code:1});check(await currentVoltage().innerText()==='1/3 V','exact fraction');
    check(await f.locator('#choice-rows .matches').count()===0,'changed conditions no saved answer claim');
    await configure({code:0});check(await currentVoltage().innerText()==='0 V','zero code');
    check(await f.locator('#reference').inputValue()==='0'&&await f.locator('#volts').inputValue()==='0'&&await f.locator('#volts').getAttribute('readonly')!==null,'zero point synchronizes both inputs');
    check(await f.locator('#formula .fraction').count()===0&&(await f.locator('#choice-note').innerText()).includes('直接比べます')&&await f.locator('#choice-rows .matches').count()===0,'zero has no division or false choice match');
    check(await f.locator('#lsb-voltage-0').innerText()==='0 V'&&await f.locator('#lsb-voltage-1').innerText()==='1/3 V'&&await f.locator('#lsb-difference').innerText()==='ΔV = 1/3 V','comparison shows exact fractions at the lower boundary');
    await step(4);check(await f.locator('#formula [data-source=probe]').evaluate(n=>n.getBoundingClientRect().width>=44),'single digit probe target');
    await f.locator('#bits').selectOption('12');await configure({reference:4095,volts:'0.001',code:4095});
    check(await caseBits(0).count()===12&&await caseBits(1).count()===12,'12 bits in each row');check(await currentVoltage().innerText()==='0.001 V','max code');
    check(await f.locator('#lsb-code-0').innerText()==='(4094)'&&await f.locator('#lsb-code-1').innerText()==='(4095)'&&await f.locator('#lsb-input-1').getAttribute('aria-current')==='true','comparison stays in range at the upper boundary');
    await caseWeights(1).first().press('Enter');check((await f.locator('#bit-explain').innerText()).includes('2048'),'high weight');
    await f.locator('#reset').press('Enter');await step(3);await f.locator('#volts').fill('2.500');check(await f.locator('#volts').inputValue()==='2.500','equivalent input preserves field');
    check(await f.locator('#known-conditions').innerText()===initialConditions,'equivalent input keeps the calculation value in prose');
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
    await currentBits().last().press('Enter');await settle();
    for(let i=0;i<6;i++){await step(i);check(Math.abs((await geometry())['.navigation'].y-enlarged['.navigation'].y)<1,'200% one-bit output keeps navigation '+JSON.stringify({width,i,enlarged,g:await geometry()}))}
    await f.locator('#volts').fill('');await settle();
    check(Math.abs((await geometry())['.navigation'].y-enlarged['.navigation'].y)<1,'200% error keeps operation position');
    await f.locator('#volts').fill('2.51953125');await settle();
    check(await f.locator('#input-error').isHidden(),'the exact derived voltage restores the previous value');
    await f.locator('#next').press('Tab');await f.locator('#prev').press('Enter');check((await f.locator('#counter').innerText()).includes('5 / 6'),'keyboard backwards');
    conditions.push({width,theme,steps:6,font200:true,stable:true});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('about:blank');
  await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2017h29h-fe-am-20")});
  await page.locator('.detail-frame.ready').waitFor();f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  check(await f.locator('#lsb-flip').evaluate(button=>{
    button.click();
    const cards=[...document.querySelectorAll('.lsb-case')];
    return cards[0].getAttribute('aria-current')==='true'&&cards.every(card=>card.getAnimations().length===0);
  }),'reduced motion changes the card order without animation');
  await configure({reference:3});
  await f.locator('#bits').selectOption('2');
  check(await f.locator('#input-error').isHidden()&&await f.locator('#code').inputValue()==='3'&&await f.locator('#volts').inputValue()==='0.05859375','narrower resolution uses the current code and exact voltage step');
  await configure({code:0});await step(5);
  check(await f.locator('#choice-rows .matches').count()===1&&(await f.locator('#choice-rows .matches').innerText()).startsWith('ア'),'zero still identifies the correct voltage step');
  await page.goto(${JSON.stringify(url + "explanations/ipa-2017-spring-am-20/index.html")});
  check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone');
  check(errors.length===0,'browser errors '+errors.join(','));
  return {conditions,allSteps:true,allChoices:true,reciprocalSources:true,synchronizedCode:true,lsbComparison:true,knownConditionsProse:true,complementaryLayout:true,resolutionInDiagram:true,bitSelection:true,focus:true,invalidRecovery:true,IME:true,singleScroll:true,standalone:true};
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
  check(await f.locator('#lsb-code-0').innerText()==='('+expected.reference+')'&&await f.locator('#lsb-voltage-0').innerText()===expected.volts+' V','comparison starts from the saved calibration');
  check((await f.locator('#known-conditions').innerText()).includes('ディジタル値'+expected.reference+'を入力したときの出力電圧が'+expected.volts+'Vとなる場合、'),'saved conditions prose');
  await f.locator('#step-select').selectOption('3');
  check((await f.locator('#formula .fraction [data-source=interval]').innerText()).endsWith(String(expected.reference))&&(await f.locator('#formula .fraction [data-source=voltage]').innerText()).endsWith(String(expected.volts)),'fraction uses saved conditions');
  await f.locator('#step-select').selectOption('5');const labels=await f.locator('#choice-rows tr td:first-child').allTextContents();
  for(let i=0;i<4;i++)check(labels[i].startsWith(context.choiceOrder[i].label+'：'),'saved option order');
  await f.locator('#volts').fill('1');check(await f.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===before,'immutable context');
  check(await f.evaluate(()=>{try{parent.document.body;return false}catch{return Object.isFrozen(window.OpenCBTDetail.context)}}),'isolated host');
  await f.locator('#reset').press('Enter');check(await f.locator('#volts').inputValue()===String(expected.volts),'reset saved');check((await f.locator('#known-conditions').innerText()).includes('ときの出力電圧が'+expected.volts+'Vとなる場合、'),'reset restores prose');
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
