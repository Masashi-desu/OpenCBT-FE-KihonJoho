// Generate executable checks for an owned, isolated headless Playwright CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, finishRun, validateRun } from "../src/core/session";

const url = process.argv[2] ?? "http://127.0.0.1:5189/", output = "output/playwright/radix";
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(output + "/verify.js", `async page => {
  ${viewportHelper}
  const check=(ok,message)=>{if(!ok)throw Error(message)}, errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  // Virtualize only playback timeouts so native RAF and host resizing keep running.
  await page.addInitScript(()=>{
    const nativeSet=window.setTimeout.bind(window),nativeClear=window.clearTimeout.bind(window),timers=new Map();let now=0,id=-1;
    window.setTimeout=(callback,delay,...args)=>{if(delay!==2600)return nativeSet(callback,delay,...args);const handle=id--;timers.set(handle,{at:now+delay,callback,args});return handle};
    window.clearTimeout=handle=>{if(!timers.delete(handle))nativeClear(handle)};
    window.__radixTimers={advance(ms){const end=now+ms;let count=0;for(;;){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;if(++count>10000)throw Error('playback timer did not stop');now=next[1].at;timers.delete(next[0]);next[1].callback(...next[1].args)}now=end}};
  });
  await setViewport({width:1280,height:900});
  await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2023-a-1")});
  await page.reload();
  await page.locator('.detail-frame.ready').waitFor();
  const f=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  const settle=async()=>{
    await f.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);
  };
  const runFor=ms=>f.evaluate(ms=>window.__radixTimers.advance(ms),ms);
  const state=()=>f.evaluate(()=>({step:document.querySelector('#step-count').textContent,known:[...document.querySelectorAll('#target-digits .digit-value')].map(n=>n.textContent),current:[...document.querySelectorAll('[aria-current="step"]')].map(n=>n.dataset.cell),calculation:document.querySelector('#calculation').textContent}));
  const advance=async(context)=>{check(!await f.locator('#next').isDisabled(),'unexpected state at '+context+' '+JSON.stringify(await state())+' input '+await f.locator('#number').inputValue());await f.locator('#next').click()};
  const geometry=()=>f.evaluate(()=>[...document.querySelectorAll('#diagrams,.digit-viewport,.playback,.playback-buttons')].flatMap(n=>{const r=n.getBoundingClientRect();return [r.top+scrollY,r.left,r.width,r.height]}).concat(document.querySelector('#calculation-title').getBoundingClientRect().top+scrollY));
  const stable=async original=>{const now=await geometry();check(now.every((v,i)=>Math.abs(v-original[i])<1),'stable diagram/playback geometry '+JSON.stringify({original,now}));};
  const result=()=>f.locator('#result > span').nth(1).innerText();
  const configure=async(raw,from,to)=>{
    await f.locator('#from-base').selectOption(String(from));
    await f.locator('#to-base').selectOption(String(to));
    await f.locator('#number').fill(raw);await settle();
    check((await f.locator('#step-count').innerText()).startsWith('0 /'),'configuration resets playback');
  };
  check(await result()==='0.75','initial result');
  check(await f.locator('#result').getAttribute('aria-label')==='正確な変換結果：0.75、10進数','accessible result includes base');
  check(await f.locator('#play').getAttribute('aria-pressed')==='false','initially paused');
  check(await f.locator('#target-digits .digit-value').evaluateAll(ns=>ns.every(n=>n.textContent==='?')),'all output digits unknown initially');
  check(await f.locator('.progress-result,#confirmed,#source-sum,#target-sum,#carry,#progress-note').count()===0,'redundant progress summary removed');
  check(await page.locator('main > .question-footer.expanded').count()===1,'expanded rights footer');
  await settle();
  const capture=async path=>{const original=page.viewportSize(),height=await page.evaluate(()=>document.documentElement.scrollHeight);await setViewport({width:original.width,height:height+1});await page.evaluate(()=>scrollTo(0,0));await settle();await page.screenshot({path,fullPage:true});await setViewport(original);await settle()};
  await capture('${output}/desktop-initial.png');
  const examples=[[16,'0.C',10,'0.75'],[10,'19.625',2,'10011.101'],[10,'13.625',8,'15.5'],[10,'0.9',16,'0.E(6)'],[10,'0.1',2,'0.0(0011)']];
  for(const [from,raw,to,expected] of examples){
    await configure(raw,from,to);check(await result()===expected,'example result '+raw);
    const baseline=await geometry(), snapshots=[await state()];
    while(!await f.locator('#next').isDisabled()){
      await advance('forward');await stable(baseline);snapshots.push(await state());
      check(await f.locator('#play').getAttribute('aria-pressed')==='false','manual advance paused');
    }
    check((await f.locator('#step-count').innerText()).includes('完了'),'completed');
    if(expected.includes('('))check((await f.locator('#calculation-detail').innerText()).includes('循環全体の値にはなりません'),'cycle diagram caveat stays with active calculation');
    for(let i=snapshots.length-2;i>=0;i--){await f.locator('#previous').click();check(JSON.stringify(await state())===JSON.stringify(snapshots[i]),'exact rollback '+raw+' '+i);await stable(baseline);}
    await f.locator('#play').click();await runFor(2700);check((await f.locator('#step-count').innerText()).startsWith('1 /'),'auto advances one');
    await f.locator('#play').click();const paused=await state();await runFor(5500);check(JSON.stringify(await state())===JSON.stringify(paused),'paused state retained');
    await f.locator('#play').click();await runFor(2700);check((await f.locator('#step-count').innerText()).startsWith('2 /'),'resume continues');
    await advance('manual advance pauses autoplay');check(await f.locator('#play').getAttribute('aria-pressed')==='false','manual next pauses');
    await f.locator('#play').click();await runFor(2700*snapshots.length);
    check((await f.locator('#step-count').innerText()).includes('完了'),'automatic completion');
    check(await f.locator('#play').getAttribute('aria-pressed')==='false','stops at end');
    const completed=await state();await runFor(5500);check(JSON.stringify(await state())===JSON.stringify(completed),'no automatic looping');
    check(await f.locator('#play').innerText()==='もう一度再生','replay action');await f.locator('#play').click();check((await f.locator('#step-count').innerText()).startsWith('0 /'),'replay resets');await f.locator('#previous').isDisabled();
    await f.locator('[data-column="s0"]').first().click();check(await f.locator('#play').getAttribute('aria-pressed')==='false','weight cell selection pauses');
    check(await f.locator('[data-cell="s0"]').getAttribute('aria-pressed')==='true','digit selected');
    await f.locator('[data-cell="s0"]').press('Escape');check(await f.locator('[data-cell="s0"]').getAttribute('aria-pressed')==='false','escape clears selection');
    check(await f.locator('[data-cell="s0"]').evaluate(n=>n===document.activeElement),'focus restored');
    await f.locator('[data-cell="t0"]').press('Enter');check(await f.locator('[data-cell="t0"]').getAttribute('aria-pressed')==='true','keyboard digit');
    await f.locator('[data-cell="t0"]').press('Space');check(await f.locator('[data-cell="t0"]').getAttribute('aria-pressed')==='false','reselect clears');
    await f.locator('#reverse').click();check(await result()===raw,'reverse '+expected);check(await f.locator('#number').inputValue()===expected,'reverse uses exact output');
    const inverse=[await state()];while(!await f.locator('#next').isDisabled()){await advance('inverse forward');inverse.push(await state())}
    for(let i=inverse.length-2;i>=0;i--){await f.locator('#previous').click();check(JSON.stringify(await state())===JSON.stringify(inverse[i]),'inverse rollback '+expected+' '+i)}
    await f.locator('#play').click();await runFor(2700);await f.locator('#play').click();const inversePaused=await state();await runFor(5500);check(JSON.stringify(await state())===JSON.stringify(inversePaused),'inverse pause');
    await f.locator('#play').click();await runFor(2700*inverse.length);check((await f.locator('#step-count').innerText()).includes('完了')&&await f.locator('#play').getAttribute('aria-pressed')==='false','inverse resume and end');
    await f.locator('#reverse').click();check(await result()===expected,'reverse round trip');
  }
  await configure('0.C',16,10);const validLayout=await geometry();
  for(const raw of ['', '0.G', '0..C', '0.()', '0.(C)2','F'.repeat(513)]){
    await f.locator('#number').fill(raw);check(await f.locator('#number').getAttribute('aria-invalid')==='true','invalid input '+raw.slice(0,8));
    check((await f.locator('#input-error').innerText()).length>0,'inline reason');
    for(const id of ['next','previous','play','reverse'])check(await f.locator('#'+id).isDisabled(),'invalid disables '+id);
    await stable(validLayout);
  }
  await configure('-19.625',10,2);check(await result()==='-10011.101','negative result');check((await f.locator('#calculation-detail').innerText()).includes('絶対値'),'absolute value note');
  await configure('0.'+'0'.repeat(64)+'1',2,2);check(await f.locator('#reverse').isDisabled(),'truncated reverse disabled');check((await f.locator('#result').innerText()).includes('≈')&&(await result()).endsWith('…'),'approximation marks');check((await f.locator('#result-note').innerText()).includes('切り捨て'),'truncation explanation');
  await configure('F'.repeat(512),16,2);check((await result()).length===2048,'512-digit source');
  await f.locator('#source-digits').evaluate(n=>n.scrollLeft=n.scrollWidth);await f.locator('[data-cell="s511"]').click();
  const visible=await f.locator('[aria-current="step"]').first().evaluate(n=>{const r=n.getBoundingClientRect(),v=n.closest('.digit-viewport').getBoundingClientRect();return r.left>=v.left&&r.right<=v.right});check(visible,'current digit visible in long diagram');
  await configure('0.C',16,10);await f.locator('#play').click();await f.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});check(await f.locator('#play').getAttribute('aria-pressed')==='false','visibility pauses');await f.evaluate(()=>delete document.hidden);
  for(let visit=0;visit<2;visit++){
    await f.locator('#play').click();
    await f.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
    check(await f.locator('#play').getAttribute('aria-pressed')==='false','cached page pauses');const cached=await state();await runFor(5500);check(JSON.stringify(await state())===JSON.stringify(cached),'cached page stays paused');
    await f.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    check(await f.locator('#play').getAttribute('aria-pressed')==='false','history restore does not auto-resume');
    await f.locator('#play').click();await runFor(2700);check((await f.locator('#step-count').innerText()).startsWith((visit+1)+' /'),'manual playback works after history restore');await f.locator('#play').click();
  }
  await configure('0.C',16,10);
  await advance('C decomposition');await advance('C decomposition');check((await f.locator('#calculation-detail').innerText()).includes('12'),'C maps to 12');check(await f.locator('#calculation-detail .fraction').first().getAttribute('aria-label')==='分子 12、分母 16','unreduced 12/16 shown');
  check((await f.locator('#calculation-detail').innerText()).includes('加算前')&&(await f.locator('#calculation-detail').innerText()).includes('加算後'),'running sum retained in current addition');
  await f.locator('[data-cell="t2"]').click();
  check((await f.locator('#calculation-title').innerText()).includes('小数部を掛け算で求める'),'fractional computation uses unified explanation');
  check((await f.locator('#calculation-detail').innerText()).includes('次に使う小数部分：0'),'next fraction retained in current multiplication');
  check(!(await f.locator('#calculation-detail').innerText()).includes('選んだ桁が表す10進数の値'),'short grid contribution is not repeated');
  await f.locator('#calculation-detail button').click();
  await f.locator('#overview summary').click();check(await f.locator('#calculation-table tr').count()===3,'full table includes output integer zero');await f.locator('#overview summary').click();
  await f.locator('#reset').press('Enter');check((await f.locator('#step-count').innerText()).startsWith('0 /'),'keyboard reset');
  await f.locator('#play').click();await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();check(page.url().includes('/search/question/'),'return route');check((await page.locator('#search-explanation').innerText()).includes('12/16＝0.75'),'regular explanation');
  check(errors.length===0,'exceptions '+errors.join(','));
  return {examples:5,reverse:true,allStepsForwardBackward:true,autoplayPauseResumeEndReplay:true,digitSelection:true,keyboard:true,invalidInput:true,negative:true,limit512:true,truncation:true,visibilityPause:true,historyRestore:true,errors};
}`);

fs.writeFileSync(output + "/layout.js", `async page => {
  ${viewportHelper}
  const check=(ok,message)=>{if(!ok)throw Error(message)}, errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2023-a-1")});await page.reload();await page.locator('.detail-frame.ready').waitFor();
  const f=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  const settle=async()=>{await f.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1)};
  const capture=async path=>{const original=page.viewportSize(),height=await page.evaluate(()=>document.documentElement.scrollHeight);await setViewport({width:original.width,height:height+1});await page.evaluate(()=>scrollTo(0,0));await settle();await page.screenshot({path,fullPage:true});await setViewport(original);await settle()};
  const geometry=()=>f.evaluate(()=>[...document.querySelectorAll('#diagrams,.digit-viewport,.playback,.playback-buttons')].flatMap(n=>{const r=n.getBoundingClientRect();return [r.top+scrollY,r.left,r.width,r.height]}).concat(document.querySelector('#calculation-title').getBoundingClientRect().top+scrollY));
  const stable=async baseline=>{const g=await geometry();check(g.every((v,i)=>Math.abs(v-baseline[i])<1),'stable geometry '+JSON.stringify({baseline,g}))};
  const aligned=()=>f.evaluate(()=>[...document.querySelectorAll('.digit-grid')].every(table=>{
    const rows=[...table.tBodies[0].rows].map(row=>[...row.querySelectorAll('[data-column]')]);
    if(rows.length!==5||getComputedStyle(table).borderCollapse!=='collapse')return false;
    return rows[0].every((cell,i)=>{const r=cell.getBoundingClientRect();return rows.every(row=>{const s=row[i]?.getBoundingClientRect();return row[i]?.dataset.column===cell.dataset.column&&Math.abs(s.left-r.left)<1&&Math.abs(s.width-r.width)<1})})&&rows.every(row=>[...row[0].parentElement.cells].every((cell,i,cells)=>i<=1||Math.abs(cells[i-1].getBoundingClientRect().right-cell.getBoundingClientRect().left)<1));
  }));
  for(const width of [1362,1280,390,320])for(const theme of ['light','dark']){
    await setViewport({width,height:width===1362?1313:700});await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();await f.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
    for(const from of [2,8,10,16])for(const to of [2,8,10,16]){
      await f.locator('#from-base').selectOption(String(from));await f.locator('#to-base').selectOption(String(to));await f.locator('#number').fill('10.1');await settle();
      const baseline=await geometry();let steps=0;
      check(await f.evaluate(()=>{const playback=document.querySelector('.playback'),diagrams=document.querySelector('#diagrams');return playback.getBoundingClientRect().bottom<=diagrams.getBoundingClientRect().top+1&&Boolean(playback.compareDocumentPosition(diagrams)&Node.DOCUMENT_POSITION_FOLLOWING)}),'playback precedes both diagrams visually and in keyboard order');
      check(await aligned(),'shared grid lines and vertically aligned digit columns '+width+' '+from+' '+to);
      const compact=await f.evaluate(()=>{const input=document.querySelector('.inputs').getBoundingClientRect(),result=document.querySelector('.conversion-output').getBoundingClientRect(),source=document.querySelector('#source-digits').getBoundingClientRect(),calculation=document.querySelector('#calculation').getBoundingClientRect(),target=document.querySelector('#target-digits').closest('section').getBoundingClientRect();return {oldContainer:document.querySelectorAll('.result-area').length,resultTop:result.top,inputTop:input.top,right:result.right,inputRight:input.right,beforeGap:calculation.top-source.bottom,afterGap:target.top-calculation.bottom,viewport:innerWidth}});
      check(compact.oldContainer===0,'independent result container removed');
      if(compact.viewport>620)check(compact.resultTop<=compact.inputTop+1,'desktop result at the top');
      else check(await f.evaluate(()=>{const inputs=document.querySelector('.inputs').getBoundingClientRect(),result=document.querySelector('.conversion-output').getBoundingClientRect(),fields=[...document.querySelectorAll('.inputs input,.inputs select')].map(n=>n.getBoundingClientRect()),buttons=[...document.querySelectorAll('.playback-buttons button')].map(n=>n.getBoundingClientRect());return result.top>=inputs.bottom&&fields.every(r=>Math.abs(r.top-fields[0].top)<1)&&buttons.every(r=>Math.abs(r.top-buttons[0].top)<1)}),'mobile conditions in one row, result below, playback in one row');
      if(compact.viewport>800)check(compact.right>compact.inputRight,'result right of the input controls');
      check(compact.beforeGap>=0&&compact.beforeGap<=24&&compact.afterGap>=0&&compact.afterGap<=24,'calculation lies between and close to both diagrams '+JSON.stringify(compact));
      if(width===1362){await page.evaluate(()=>scrollTo(0,0));const frameBox=await page.locator('.detail-frame').boundingBox(),targetBottom=await f.locator('#target-digits').evaluate(n=>n.getBoundingClientRect().bottom);check(frameBox.y+targetBottom<=1313,'both diagrams and current calculation fit the annotated viewport')}
      while(!await f.locator('#next').isDisabled()){await f.locator('#next').click();await stable(baseline);steps++;}
      await f.locator('#target-digits .digit').first().click();await stable(baseline);check(await aligned(),'selection keeps grid columns aligned');await f.locator('#calculation-detail button').click();await stable(baseline);
      await f.locator('#overview summary').click();await settle();await stable(baseline);
      check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no lesson horizontal overflow '+width+' '+from+' '+to);
      check(await f.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight+1),'no nested document scroll');
      check(await f.locator('.calculation').evaluate(n=>getComputedStyle(n).overflowY==='visible'),'explanation naturally extends');
      check(await f.locator('button,input,select').evaluateAll(ns=>ns.filter(n=>n.getClientRects().length).every(n=>n.getBoundingClientRect().height>=44)),'44px targets');
      await f.locator('#overview summary').click();results.push({width,theme,from,to,steps});
    }
    await f.locator('#reset').click();await f.locator('[data-cell="s1"]').click();await settle();
    const baseline=await geometry();for(const invalid of ['0..C','0.G','F'.repeat(513)]){await f.locator('#number').fill(invalid);await settle();await stable(baseline)}
    await f.locator('#from-base').selectOption('16');await f.locator('#to-base').selectOption('2');await f.locator('#number').fill('F'.repeat(512));check(await f.locator('#target-digits .digit').count()===2048,'all 2048 output digits retained');
    for(const id of ['s511','t2047','t0']){await f.locator('[data-cell="'+id+'"]').click();check(await f.locator('[data-cell="'+id+'"]').evaluate(n=>{const r=n.getBoundingClientRect(),v=n.closest('.digit-viewport').getBoundingClientRect(),label=n.closest('.digit-grid').querySelector('.grid-label').getBoundingClientRect();return r.left>=label.right&&r.right<=v.right}),'long current digit visible past the row labels '+id);check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'long number contained')}
    await f.locator('#to-base').selectOption('10');await f.locator('#number').fill('0.E(6)');await settle();await f.locator('[data-cell="s2"]').click();check((await f.locator('#calculation-detail').innerText()).includes('全体の寄与'),'recurring input block');
    await f.locator('#reset').click();await f.locator('[data-cell="s1"]').click();
    await capture('${output}/layout-'+width+'-'+theme+'.png');
    await f.evaluate(()=>document.documentElement.style.fontSize='125%');await settle();check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'text zoom overflow');
    const expanded=await geometry();await f.locator('#next').click();await stable(expanded);await f.evaluate(()=>document.documentElement.style.fontSize='');await settle();
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));check(await page.locator('footer').last().isVisible(),'footer reachable');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no outer overflow');
  }
  check(errors.length===0,'exceptions '+errors.join(','));return {cases:results.length,playbackAboveDiagrams:true,desktopResultTopRight:true,mobileResultBelowConditions:true,mobileFieldsAndButtonsInOneRow:true,oldResultContainerRemoved:true,calculationBetweenDiagrams:true,sharedGridLines:true,verticalColumnAlignment:true,allBaseCombinations:true,allFiniteSteps:true,widths:[1362,1280,390,320],themes:['light','dark'],textZoom:125,geometryStable:true,singlePageScroll:true,errors};
}`);
const layout = fs.readFileSync(output + "/layout.js", "utf8");
for (const width of [1362, 1280, 390, 320]) fs.writeFileSync(output + `/layout-${width}.js`, layout.replace("[1362,1280,390,320]", `[${width}]`));

fs.writeFileSync(output + "/breakpoints.js", `async page => {
  const check=(ok,message)=>{if(!ok)throw Error(message)}, cases=[];
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(${JSON.stringify(url + "explanations/ipa-2023-a-1/index.html")});await page.reload();
  const geometry=()=>page.evaluate(()=>[...document.querySelectorAll('#source-digits,#target-digits,.playback-buttons button,#calculation-title')].flatMap(n=>{const r=n.getBoundingClientRect();return [r.top+scrollY,r.left,r.width,r.height]}));
  for(const width of [1362,960,801,800,621,620,541,540,390,320])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1313});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await page.locator('#reset').click();const baseline=await geometry();
    for(const raw of ['', '0.G', '0..C', 'F'.repeat(513)]){await page.locator('#number').fill(raw);const current=await geometry();check(current.every((v,i)=>Math.abs(v-baseline[i])<1),'error preserves layout at '+width+' '+theme+' '+raw.slice(0,6));}
    await page.locator('#reset').click();
    while(!await page.locator('#next').isDisabled()){await page.locator('#next').click();const current=await geometry();check(current.every((v,i)=>i===current.length-1||Math.abs(v-baseline[i])<1),'playback preserves buttons and calculation position '+width+' '+theme)}
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow '+width+' '+theme);
    cases.push({width,theme});
  }
  return {cases:cases.length,breakpointBoundaries:true,errorStability:true,buttonStability:true,noOverflow:true};
}`);

fs.writeFileSync(output + "/motion.js", `async page => {
  ${viewportHelper}
  const check=(ok,message)=>{if(!ok)throw Error(message)}, errors=[],cases=[];
  page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2023-a-1")});await page.reload();await page.locator('.detail-frame.ready').waitFor();
  const f=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  const configure=async(raw,from,to)=>{await f.locator('#from-base').selectOption(String(from));await f.locator('#to-base').selectOption(String(to));await f.locator('#number').fill(raw)};
  const rect=selector=>f.locator(selector).evaluate(n=>{const r=n.getBoundingClientRect();return {left:r.left,top:r.top}});
  const inspect=async(kind,expected,origin,target)=>{
    await f.locator('.flying-value[data-transfer="'+kind+'"]').waitFor();
    const state=await f.locator('.flying-value[data-transfer="'+kind+'"]').evaluate((n,target)=>{
      const a=n.getAnimations()[0];a.pause();a.currentTime=0;
      const r=n.getBoundingClientRect(),to=document.querySelector(target).getBoundingClientRect();
      const start={left:r.left,top:r.top};a.currentTime=a.effect.getTiming().duration-0.01;
      const end=n.getBoundingClientRect();a.currentTime=0;
      return {text:n.textContent,start,end:{left:end.left,top:end.top},target:{left:to.left,top:to.top}};
    },target);
    check(state.text===expected,'the actual calculated value travels '+JSON.stringify(state));
    check(Math.abs(state.start.left-origin.left)<1&&Math.abs(state.start.top-origin.top)<1,'flight starts at the number '+JSON.stringify({state,origin}));
    check(Math.abs(state.end.left-state.target.left)<1&&Math.abs(state.end.top-state.target.top)<1,'flight lands on the corresponding number '+JSON.stringify(state));
  };
  const finish=()=>f.locator('.flying-value').evaluate(n=>n.getAnimations()[0].finish());
  const settled=()=>f.waitForFunction(()=>!document.querySelector('.flying-value'));
  const clean=()=>f.evaluate(()=>!document.querySelector('.flying-value,.transfer-pending,.flow-origin'));
  for(const width of [1362,320])for(const theme of ['light','dark']){
    await setViewport({width,height:1313});await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();
    await f.locator('#reset').click();await f.locator('#next').click();
    await inspect('addition','0',await rect('[data-cell="s0"] .digit-value'),'#calculation-detail .formula');await finish();await settled();
    await f.locator('[data-cell="s1"]').click();
    const weights=await f.evaluate(()=>{const color=s=>getComputedStyle(document.querySelector(s)).color;return color('#calculation-detail .input-weight')===color('#source-digits .weight')&&color('#source-digits .weight')!==color('#target-digits .weight')});check(weights,'input and output weights have distinct colors matching the formula');
    await f.locator('[data-cell="t0"]').click();await f.locator('#next').click();
    check(await f.locator('#calculation-title').innerText()==='小数部を掛け算で求める','unnumbered heading');
    check(await f.locator('#calculation-detail .product-value').innerText()==='7.5','first multiplication product');
    const digit='#calculation-detail [data-flow="digit"]';
    await inspect('digit','7',await rect(digit),'[data-cell="t1"] .digit-value');
    const blue=await f.evaluate(()=>{const color=getComputedStyle(document.querySelector('#target-digits .current .state')).color;return ['#result','#calculation-detail [data-flow="digit"]','#target-digits .current .digit-value'].every(s=>getComputedStyle(document.querySelector(s)).color===color)});
    check(blue,'answer, extracted integer and current digit use the same blue');
    const outputWeight=await f.evaluate(()=>{const color=s=>getComputedStyle(document.querySelector(s)).color;return color('#calculation-detail .output-weight')===color('#target-digits .weight')&&color('#target-digits .weight')!==color('#result')&&color('#source-digits .weight')!==color('#result')});check(outputWeight,'both weight colors stay distinct from the answer');
    check(await f.locator('[data-cell="t1"] .digit-value').evaluate(n=>getComputedStyle(n).visibility==='hidden'),'digit waits for arrival');
    await finish();await settled();check(await clean(),'placement cleans up');
    const carryOrigin=await rect('#calculation-detail [data-flow="carry"]');
    check(await f.locator('#calculation-detail [data-flow="carry"]').innerText()==='0.5','exact remainder');await f.locator('#next').click();
    await inspect('carry','0.5',carryOrigin,'#calculation-detail [data-flow="operand"]');
    check(await f.locator('#calculation-detail [data-flow="operand"]').textContent()==='0.5','remainder is the next operand');
    check(await f.locator('[data-cell="t2"] .digit-value').evaluate(n=>getComputedStyle(n).visibility==='hidden'),'destination remains pending during carry');
    await f.locator('.flying-value').evaluate(n=>n.getAnimations()[0].currentTime=325);
    await f.locator('#calculation').scrollIntoViewIfNeeded();await page.screenshot({path:'${output}/carry-'+width+'-'+theme+'.png'});
    await finish();await f.locator('.digit-flight').waitFor();
    await inspect('digit','5',await rect(digit),'[data-cell="t2"] .digit-value');
    await page.screenshot({path:'${output}/integer-origin-'+width+'-'+theme+'.png'});
    await finish();await settled();check(await clean(),'both stages clean up');
    check(await f.locator('[data-cell="t2"] .digit-value').isVisible(),'final digit revealed');cases.push({width,theme});
  }
  await setViewport({width:1362,height:1313});
  await configure('19.625',10,2);await f.locator('[data-cell="t4"]').click();
  const quotient=await rect('#calculation-detail [data-flow="carry"]');await f.locator('#next').click();
  await inspect('carry','9',quotient,'#calculation-detail [data-flow="operand"]');await finish();await f.locator('.digit-flight').waitFor();
  await inspect('digit','1',await rect('#calculation-detail [data-flow="digit"]'),'[data-cell="t3"] .digit-value');await finish();await settled();
  await configure('0.9375',10,16);await f.locator('[data-cell="t0"]').click();await f.locator('#next').click();
  await inspect('digit','15',await rect('#calculation-detail [data-flow="digit"]'),'[data-cell="t1"] .digit-value');
  check((await f.locator('#calculation-detail').innerText()).includes('数字 F'),'hexadecimal mapping retained');await finish();await settled();check(await f.locator('[data-cell="t1"] .digit-value').innerText()==='F','15 placed as F');
  await configure('0.9',10,16);await f.locator('[data-cell="t1"]').click();
  const recurring=await rect('#calculation-detail [data-flow="carry"]');await f.locator('#next').click();
  await inspect('carry','0.4',recurring,'#calculation-detail [data-flow="operand"]');await finish();await f.locator('.digit-flight').waitFor();await finish();await settled();
  await f.locator('#next').click();check(await clean()&&(await f.locator('#calculation-title').innerText()).includes('循環'),'cycle ends without a stray animation');
  await configure('0.('+'0'.repeat(20)+'1)',2,16);await f.locator('[data-cell="t0"]').click();await f.locator('#next').click();
  check(await f.locator('#calculation-detail .product-value .fraction').getAttribute('aria-label')==='分子 16、分母 2097151','long cycle product stays an exact fraction');
  await f.locator('#reset').click();check(await clean(),'reset destroys animations');
  for(const action of ['previous','selection','input','visibility','reduced','replay']){
    await page.emulateMedia({reducedMotion:'no-preference'});await f.locator('#reset').click();await f.locator('[data-cell="t1"]').click();await f.locator('#next').click();await f.locator('.carry-flight').waitFor();
    if(action==='previous')await f.locator('#previous').click();
    else if(action==='selection')await f.locator('[data-cell="s1"]').click();
    else if(action==='input')await f.locator('#number').fill('0.E');
    else if(action==='visibility'){await f.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await f.evaluate(()=>delete document.hidden)}
    else if(action==='reduced')await page.emulateMedia({reducedMotion:'reduce'});
    else await f.locator('#play').click();
    await f.waitForFunction(()=>!document.querySelector('.flying-value,.transfer-pending,.flow-origin'));check(await clean(),'interruption restores all numbers: '+action);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await f.locator('#reset').click();await f.locator('[data-cell="t1"]').click();await f.locator('#next').click();check(await clean(),'reduced motion performs both steps immediately');
  await f.locator('#reverse').click();check(await clean(),'reverse clears animation');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();check(errors.length===0,'exceptions '+errors.join(','));
  return {cases:cases.length,sourceToCalculation:true,carryToOperand:true,integerToDigit:true,quotientCarry:true,hexadecimalMapping:true,recurringCarry:true,exactFractionFallback:true,sameBlue:true,cancellation:true,reducedMotion:true,errors};
}`);

const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2023-a-1")!;
let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
run.session.entries[0].revealed = true; run = finishRun(run, "completed"); await validateRun(run);
const value = run.instances[0].parameters.values[0], raw = "0." + value.toString(16).toUpperCase();
fs.writeFileSync(output + "/generated.js", `async page => {
  ${viewportHelper}
  const check=(ok,message)=>{if(!ok)throw Error(message)};await setViewport({width:1280,height:900});
  await page.goto(${JSON.stringify(url)});await page.reload();await page.evaluate(async run=>{
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3), db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject});
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets:{}});run.instances.forEach(i=>tx.objectStore('generatedInstances').put(i));tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});tx.objectStore('results').put(run.result);await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});
  },${JSON.stringify(run)});
  await page.goto(${JSON.stringify(url + `#/detail/${run.session.id}/0/review`)});await page.locator('.detail-frame.ready').waitFor();
  const f=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  check(await f.locator('#number').inputValue()===${JSON.stringify(raw)},'saved generated input');
  check((await f.locator('#calculation-detail').innerText()).includes('保存済み条件'),'saved condition label');
  await f.locator('#number').fill('1');check(!(await f.locator('#calculation-detail').innerText()).includes('保存済み条件'),'edited input is not labeled as saved');await f.locator('#reset').click();check(await f.locator('#number').inputValue()===${JSON.stringify(raw)},'reset uses saved input');
  const isolation=await f.evaluate(()=>{let blocked=false;try{parent.document.body}catch{blocked=true}return {blocked,frozen:Object.isFrozen(window.OpenCBTDetail.context)}});check(isolation.blocked&&isolation.frozen,'isolated frozen host');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  const saved=await page.evaluate(async id=>{const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3),db=await new Promise(resolve=>open.onsuccess=()=>resolve(open.result));const q=db.transaction('sessions').objectStore('sessions').get(id);return await new Promise(resolve=>q.onsuccess=()=>resolve(q.result))},${JSON.stringify(run.session.id)});
  check(saved.session.entries[0].issuedContent.contentSha256===${JSON.stringify(run.session.entries[0].issuedContent.contentSha256)},'saved content hash retained');check(saved.issued[0].correctAnswer.choiceId===${JSON.stringify(run.issued[0].correctAnswer.choiceId)},'saved answer retained');
  await page.setViewportSize({width:320,height:700});await page.goto(${JSON.stringify(url + "explanations/ipa-2023-a-1/index.html")});check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone title and provenance');check((await page.locator('#result').innerText()).includes('0.75'),'standalone initial result');await page.locator('#next').click();check((await page.locator('#step-count').innerText()).startsWith('1 /'),'standalone steps');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'standalone width');
  return {savedInput:${JSON.stringify(raw)},reset:true,immutableContext:true,savedContentRetained:true,standalone:true};
}`);
console.log(`Generated ${output}/{verify,layout,generated,breakpoints,motion}.js for the isolated headless Playwright CLI.`);
