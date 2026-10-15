// Generate checks for an isolated, headless Playwright CLI session. The real
// distributed package is loaded without mocking its resources.
import fs from "node:fs";
import { viewportHelper } from './playwright-viewport.mjs';
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, finishRun, validateRun } from "../src/core/session";
const url = process.argv[2] ?? "http://127.0.0.1:5188/", output = "output/playwright/arrow";
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(output + "/verify.js", `async page => {
  ${viewportHelper}
  const check = (value, message) => { if (!value) throw Error(message); }, errors = [];
  await page.emulateMedia({reducedMotion:'reduce'});
  page.on('pageerror', error => errors.push(error.message));
  await setViewport({width:1280,height:1000});
  await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2024-a-13")});
  await page.reload();
  await page.locator('.detail-frame.ready').waitFor();
  const frame = await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  const total = async () => (await frame.locator('[data-id="end"]').getAttribute('aria-label')).match(/最早([0-9]+)日/)[1]+'日';
  const settle=async()=>{
    await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await frame.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);
  };
  const choose = async id => {
    await settle();
    const target=frame.locator('[data-id="'+id+'"]');
    if(await target.getAttribute('aria-pressed')!=='true')await target.locator('.edge-label-bg, .event-circle').click();
    await frame.locator('#inspection-panel:not([hidden])').waitFor().catch(()=>{throw Error('selection did not open: '+id+' '+JSON.stringify(page.viewportSize()))});
    await settle();
  };
  const reset = async () => { await frame.locator('#reset').click(); await settle(); check(await total()==='120日','original reset'); };
  check(await total()==='120日','initial total');
  check(await frame.locator('.edge').count()===10 && await frame.locator('.event-node').count()===7,'graph topology');
  check(await frame.locator('#inspection-panel').isHidden(),'minimal initial state');
  check(await frame.locator('#duration').count()===0,'no permanent editor');
  check(await frame.locator('select').count()===0,'conditions dropdown removed');
  check(await frame.locator('header, .toolbar, #total, #condition-note, .diagram-footer, .path-reservation').count()===0,'internal header and footer removed');
  check(await page.locator('main > .question-footer.expanded').count()===1,'source credits always expanded');
  check(await page.locator('main > .question-footer .footer-expand').count()===0,'no collapse action');
  check(await frame.locator('#inspection-placeholder').isVisible(),'reserved region visible before selection');
  await frame.locator('#show-critical').check();
  check(await frame.locator('.critical').count()===5,'initial continuous path including dummy');
  check((await frame.locator('#path-summary').innerText()).includes('A → C → ダミー(0日) → G → H'),'initial path');
  await frame.locator('#show-times').check();
  check(await frame.locator('.event-time').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).display!=='none')),'earliest labels');
  await page.screenshot({path:'${output}/desktop-initial.png',fullPage:true});
  const initial={A:30,B:5,C:30,D:20,E:40,F:25,G:30,H:30};
  const independent=v=>v.A+Math.max(v.B+v.E,Math.max(v.B,v.C)+v.F,Math.max(v.B,v.C,v.D)+v.G)+v.H;
  const edit=async (id,value)=>{await choose(id);await frame.locator('#duration').fill(String(value));await frame.locator('#apply-duration').click();};
  for (const id of Object.keys(initial)) {
    await reset(); await choose(id);
    check(await frame.locator('#duration').inputValue()===String(initial[id]),'current editor value '+id);
    check(await frame.locator('#duration').getAttribute('type')==='number','free numeric editor '+id);
    check(await frame.locator('#inspection-panel select').count()===0,'no duration dropdown '+id);
    await frame.locator('#duration').fill(String(initial[id]+17)); await frame.locator('#duration').press('Enter');
    check(await total()===independent({...initial,[id]:initial[id]+17})+'日','recalculation '+id);
    check((await frame.locator('[data-id="'+id+'"] .edge-label').textContent()).includes((initial[id]+17)+'日'),'diagram value matches committed input '+id);
    check((await frame.locator('#inspection-title').innerText()).includes('全体'+independent({...initial,[id]:initial[id]+17})+'日'),'result next to editor '+id);
    check(await frame.locator('.times dt').count()===6,'all earliest/latest/float values '+id);
    await frame.locator('#close-inspection').click(); await choose(id);
    check(await frame.locator('#duration').inputValue()===String(initial[id]+17),'duration retained '+id);
  }
  await reset(); await choose('A');
  for (const invalid of ['', '-1', '1.5', '1e2']) {
    await frame.locator('#duration').fill(invalid); await frame.locator('#apply-duration').click();
    check(await total()==='120日','invalid input leaves result intact '+invalid);
    check(await frame.locator('#duration').getAttribute('aria-invalid')==='true','invalid marked '+invalid);
    check((await frame.locator('#input-error').innerText()).includes('整数'),'inline error '+invalid);
  }
  await frame.locator('#duration').fill('0'); await frame.locator('#apply-duration').click(); check(await total()==='90日','zero accepted');
  await reset();
  for (const [id,value,expected,paths] of [['B',20,120,2],['B',25,125,1],['B',45,145,1],['B',50,150,1],['D',100,190,1],['F',90,180,1]]) {
    await reset(); await edit(id,value);
    check(await total()===expected+'日','edited scenario '+id+value);
    check((await frame.locator('#path-summary').innerText()).includes('パス '+paths+'本'),'all paths '+id+value);
  }
  await reset(); await edit('B',20);
  await page.screenshot({path:'${output}/desktop-two-paths.png',fullPage:true});
  await reset(); await choose('middle');
  check((await frame.locator('.formula').innerText())==='max(30 + 30, 35 + 0) = 60日','middle formula');
  check(await frame.locator('[data-term]').count()===2,'incoming tasks');
  await frame.locator('[data-term="dummy-upper"]').click(); check(await frame.locator('[data-id="dummy-upper"]').evaluate(n=>n.classList.contains('determining')),'term linked to arrow');
  for (const id of ['start','branch','upper','middle','lower','merge','end']) { await choose(id); check(await frame.locator('.formula').count()===1,'node formula '+id); check(await frame.locator('[data-edit],.node-edit-links').count()===0,'no edit navigation on events '+id); }
  await reset(); await choose('dummy-lower'); await frame.locator('#toggle-dummy').click();
  check(await total()==='115日','disabled lower dummy updates project');
  check(await frame.locator('[data-id="dummy-lower"]').evaluate(n=>n.classList.contains('disabled-edge')),'disabled dependency shown');
  await frame.locator('#toggle-dummy').click(); check(await total()==='120日','dummy restored');
  await choose('B'); await frame.locator('#duration').fill('70'); await frame.locator('#apply-duration').click();
  await choose('middle'); check((await frame.locator('#inspection-title').innerText()).includes('100日'),'upper dependency first active');
  await choose('dummy-upper'); await frame.locator('#toggle-dummy').click();
  await choose('middle'); check((await frame.locator('#inspection-title').innerText()).includes('60日'),'upper dependency excluded');
  await reset(); await frame.locator('#first').click(); check((await frame.locator('#step-label').innerText()).startsWith('1 / 9'),'trace start');
  await frame.locator('#next').click(); check((await frame.locator('#inspection-title').innerText()).includes('分岐点'),'trace next');
  await frame.locator('#previous').click(); check((await frame.locator('#inspection-title').innerText()).includes('開始'),'trace rewind');
  await frame.locator('#play').click(); await frame.waitForFunction(()=>document.querySelector('#step-label').textContent.startsWith('2 /'));
  await frame.locator('#play').click(); check(await frame.locator('#play').getAttribute('aria-pressed')==='false','pause');
  await frame.locator('#play').click(); await edit('B',25);
  check(await frame.locator('#play').getAttribute('aria-pressed')==='false','settings pause playback'); check((await frame.locator('#step-label').innerText())==='未開始','trace regenerated');
  await frame.locator('#first').click(); for(let i=1;i<9;i++) await frame.locator('#next').click();
  check((await frame.locator('#inspection-title').innerText()).includes('クリティカルパス'),'final path step');
  await frame.locator('#show-critical').uncheck(); check(await frame.locator('.critical').count()===0,'critical toggle remains usable at final step');
  await reset();
  await frame.locator('[data-id="F"]').focus(); await frame.locator('[data-id="F"]').press('Enter');
  check(await frame.locator('#duration').evaluate(n=>document.activeElement===n),'editor focus');
  await frame.locator('#duration').press('Escape'); check(await frame.locator('#inspection-panel').isHidden(),'Escape closes');
  check(await frame.locator('[data-id="F"]').evaluate(n=>document.activeElement===n),'focus restored to selected arrow');
  for (const id of [...Object.keys(initial),'dummy-upper','dummy-lower','start','branch','upper','middle','lower','merge','end']) {
    await choose(id);
    await frame.locator('[data-id="'+id+'"]').locator('.edge-label-bg, .event-circle').click();
    check(await frame.locator('#inspection-panel').isHidden()&&await frame.locator('#inspection-placeholder').isVisible(),'same object clears inspection '+id);
    check(await frame.locator('.selected,.related,.determining,.dimmed').count()===0,'same object clears selection highlighting '+id);
    check(await frame.locator('[data-id="'+id+'"]').getAttribute('aria-pressed')==='false','cleared selection accessibility '+id);
    check(await frame.locator('[data-id="'+id+'"]').evaluate(n=>document.activeElement===n),'cleared selection focus '+id);
    check(await total()==='120日','cleared selection preserves calculation '+id);
  }
  for (const [id,key] of [['A','Enter'],['middle','Space'],['dummy-lower','Enter']]) {
    const target=frame.locator('[data-id="'+id+'"]');
    await target.focus(); await target.press(key); check(await frame.locator('#inspection-panel').isVisible(),'keyboard selects '+id);
    await target.focus(); await target.press(key); check(await frame.locator('#inspection-panel').isHidden(),'keyboard reselect clears '+id);
  }
  await edit('B',20); await frame.locator('[data-id="B"] .edge-label-bg').click(); await choose('B');
  check(await frame.locator('#duration').inputValue()==='20'&&await total()==='120日','reselect preserves edited duration');
  await choose('dummy-lower'); await frame.locator('#toggle-dummy').click();
  await frame.locator('[data-id="dummy-lower"] .edge-label-bg').click(); await choose('dummy-lower');
  check(await frame.locator('#toggle-dummy').getAttribute('aria-pressed')==='false','reselect preserves disabled dependency');
  await reset(); await frame.locator('#first').click(); await frame.locator('#play').click();
  await frame.locator('[data-id="start"] .event-circle').click();
  check(await frame.locator('#inspection-panel').isHidden()&&await frame.locator('#play').getAttribute('aria-pressed')==='false','same replay object deselects and pauses');
  check(await frame.locator('#step-label').innerText()==='未開始','deselect clears replay step');
  for (const width of [1362,1280,390,320]) {
    await setViewport({width,height:width===1362?1313:width===1280?1000:844});
    for (const theme of ['light','dark']) {
      await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();
      await frame.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);
      await reset();
      const layout=()=>frame.evaluate(()=>{
        const scene=document.querySelector('.diagram-area').getBoundingClientRect(), slot=document.querySelector('#inspection-reservation').getBoundingClientRect(), playback=document.querySelector('.playback').getBoundingClientRect();
        return {height:scene.height,slot:slot.top+scrollY,slotHeight:slot.height,playback:playback.top+scrollY};
      });
      const reserved=await layout();let fixed=null;
      check(reserved.slotHeight>=(width<=600?320:280),'compact minimum explanation height '+width);
      const corners=await frame.evaluate(()=>{
        const a=document.querySelector('.diagram-area').getBoundingClientRect(),v=document.querySelector('#diagram-viewport').getBoundingClientRect(),p=document.querySelector('.playback').getBoundingClientRect(),r=document.querySelector('#reset').getBoundingClientRect(),s=document.querySelector('#inspection-reservation').getBoundingClientRect();
        return {left:p.left-a.left,right:a.right-r.right,playBelow:p.top>=v.bottom,resetBelow:r.top>=v.bottom,inside:p.bottom<=a.bottom&&r.bottom<=a.bottom,aboveInspection:p.bottom<=s.top&&r.bottom<=s.top};
      });
      check(corners.left<=24&&corners.right<=24&&corners.playBelow&&corners.resetBelow&&corners.inside&&corners.aboveInspection,'playback bottom left and reset bottom right inside the diagram '+width);
      for(const id of ['A','H','dummy-upper','dummy-lower','start','branch','upper','middle','lower','merge','end']) {
        await choose(id);const current=await layout();
        check(Math.abs(current.height-reserved.height)<1&&Math.abs(current.playback-reserved.playback)<1,'selection does not move playback '+id+' '+width);
        const elements=await frame.locator('#inspection-panel').evaluate(n=>{const r=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect(),s=getComputedStyle(n);return {x:r.left-p.left,y:r.top-p.top,width:r.width,regionWidth:n.parentElement.clientWidth,position:s.position,border:s.borderTopWidth,radius:s.borderTopLeftRadius,shadow:s.boxShadow}});
        if(!fixed)fixed=elements;
        check(Math.abs(elements.x-fixed.x)<1&&Math.abs(elements.y-fixed.y)<1,'uniform elements position '+id+' '+width);
        check(Math.abs(elements.width-elements.regionWidth)<1,'uses the full reserved width '+id+' '+width);
        check(elements.position==='static'&&elements.border==='0px'&&elements.radius==='0px'&&elements.shadow==='none','direct inline elements without a card '+id+' '+width);
      }
      await choose('lower');
      if(width>=1280) check(await frame.locator('#inspection-reservation').evaluate(n=>n.scrollHeight<=n.clientHeight+1),'lower event fits the available height '+width);
      await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.screenshot({path:'${output}/inline-node-'+width+'-'+theme+'.png',fullPage:true});
      await choose('F');
      const box=await frame.locator('#inspection-panel').evaluate(n=>{const r=n.getBoundingClientRect();return {x:r.x,width:r.width}}), viewport=await frame.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      check(box.x>=0&&box.x+box.width<=viewport.width+1,'elements within width '+width+' '+theme);
      check(viewport.scroll<=viewport.width+1,'no page overflow '+width+' '+theme);
      check(await frame.locator('#inspection-panel').evaluate(n=>{const p=n.getBoundingClientRect(),g=document.querySelector('#diagram').getBoundingClientRect();return p.top>=g.bottom}),'elements clear of nodes and arrows');
      await frame.locator('#duration').fill('90'); await frame.locator('#apply-duration').click(); check(await total()==='180日','mobile edit '+width+' '+theme);
      check((await frame.locator('[data-id="F"] .edge-label').textContent()).includes('90日'),'rendered duration consistency');
      check((await frame.locator('#inspection-title').innerText()).includes('180日'),'nearby total after edit');
      check(await frame.locator('#inspection-reservation').evaluate(n=>n.scrollHeight<=n.clientHeight+1),'task editor fits the reserved height '+width);
      await frame.locator('.extra summary').click();
      check(Math.abs((await layout()).playback-reserved.playback)<1,'expanded details do not move playback');
      check(await frame.locator('#inspection-reservation').evaluate(n=>getComputedStyle(n).overflowY==='visible'&&n.scrollHeight<=n.clientHeight+1),'explanation expands without an inner scrollbar');
      await frame.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);
      check(await frame.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight+1),'no nested lesson document scrolling');
      await frame.locator('.extra summary').click();
      await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.screenshot({path:'${output}/inline-edit-'+width+'-'+theme+'.png',fullPage:true});
      await frame.locator('#zoom-in').click(); check(await frame.locator('#zoom-value').innerText()==='125%','zoom');
      await frame.locator('#zoom-out').click();
      await frame.locator('#close-inspection').click();
      check(Math.abs((await layout()).playback-reserved.playback)<1,'closing retains reserved area');
      check(await frame.locator('#inspection-placeholder').isVisible(),'reservation retained after close');
      for (const id of ['B','middle','dummy-lower']) {
        await choose(id); await frame.locator('[data-id="'+id+'"]').locator('.edge-label-bg, .event-circle').click();
        check(await frame.locator('#inspection-panel').isHidden()&&await frame.locator('[data-id="'+id+'"]').getAttribute('aria-pressed')==='false','reselection clears at every width '+id+' '+width+' '+theme);
        check(Math.abs((await layout()).playback-reserved.playback)<1,'reselection retains playback position '+width);
      }
    }
  }
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  check(page.url().includes('/search/question/'),'return route');
  check((await page.locator('#search-explanation').innerText()).includes('120日'),'correct regular explanation');
  check(errors.length===0,'JS exceptions: '+errors.join(', '));
  return {originalDays:120,headerFooterRemoved:true,controlsInsideDiagram:true,sourceCreditsAlwaysExpanded:true,allEightGraphEditors:true,noEditNavigation:true,compactReservation:true,reselectionClears:true,reselectionPreservesChanges:true,conditionsDropdown:false,reservedRegion:true,fullWidthInlineElements:true,stablePlaybackPosition:true,invalidInput:true,dummies:true,editedScenarios:6,multiplePaths:true,stepPlayback:true,keyboard:true,widths:[1362,1280,390,320],themes:['light','dark'],errors};
}`);

const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2024-a-13")!;
let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
run.session.entries[0].revealed = true; run = finishRun(run, "completed"); await validateRun(run);
const values = run.instances[0].parameters.values, [a, bb, c, d, e, f, g, h] = values;
const days = a + Math.max(bb + e, Math.max(bb, c) + f, Math.max(bb, c, d) + g) + h;
fs.writeFileSync(output + "/generated.js", `async page => {
  ${viewportHelper}
  const check=(v,m)=>{if(!v)throw Error(m)};
  await page.goto(${JSON.stringify(url)});
  await page.evaluate(async run=>{
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3), db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject});
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets:{}});
    run.instances.forEach(instance=>tx.objectStore('generatedInstances').put(instance));
    tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});
    tx.objectStore('results').put(run.result); await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});
  },${JSON.stringify(run)});
  await page.goto(${JSON.stringify(url + `#/detail/${run.session.id}/0/review`)});
  await page.locator('.detail-frame.ready').waitFor();
  const frame=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  const total=async()=>(await frame.locator('[data-id="end"]').getAttribute('aria-label')).match(/最早([0-9]+)日/)[1]+'日';
  check(await total()===${JSON.stringify(days + "日")},'saved generated days');
  const inputs=await frame.evaluate(()=>Object.values(window.ArrowEngine.initialState(window.OpenCBTDetail.context).values).map(String));
  check(JSON.stringify(inputs)===${JSON.stringify(JSON.stringify(values.map(String)))},'saved inputs passed exactly');
  check((await frame.locator('#inspection-placeholder').innerText()).includes('保存済み条件'),'saved initial condition');
  check(await frame.locator('select').count()===0,'no conditions dropdown on generated detail');
  await frame.locator('[data-id="A"] .edge-label-bg').click();
  await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await frame.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);
  await frame.locator('#duration').fill(${JSON.stringify(String(values[0] + 1))});await frame.locator('#apply-duration').click();
  check(await total()===${JSON.stringify(days + 1 + "日")},'generated edit from diagram');
  await frame.locator('#reset').click();
  check(await total()===${JSON.stringify(days + "日")},'reset uses saved conditions');
  check(await page.locator('main > .question-footer.expanded').count()===1&&await page.locator('main > .question-footer .footer-expand').count()===0,'review credits always expanded');
  const isolation=await frame.evaluate(()=>{let blocked=false;try{parent.document.body}catch{blocked=true}return {blocked,frozen:Object.isFrozen(window.OpenCBTDetail.context)}});
  check(isolation.blocked&&isolation.frozen,'isolated immutable host');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  const saved=await page.evaluate(async id=>{const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3), db=await new Promise(resolve=>{open.onsuccess=()=>resolve(open.result)});const q=db.transaction('sessions').objectStore('sessions').get(id);return await new Promise(resolve=>{q.onsuccess=()=>resolve(q.result)})},${JSON.stringify(run.session.id)});
  check(saved.issued[0].correctAnswer.choiceId===${JSON.stringify(run.issued[0].correctAnswer.choiceId)},'saved answer retained');
  check(saved.session.entries[0].issuedContent.contentSha256===${JSON.stringify(run.session.entries[0].issuedContent.contentSha256)},'saved hash retained');
  return {savedGeneratedValues:inputs,days:${days},reset:true,isolated:true,savedContentRetained:true};
}`);
console.log(`Generated ${output}/verify.js and generated.js for the isolated Playwright CLI.`);
