// Generate reproducible checks for an owned, isolated headless Playwright CLI.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";

// Chromium's iframe hit-testing can clip a tall OOPIF to the owned headless
// window even when the emulated page scrolls. Reserve paint space for the lesson.
const flowViewportHelper = viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(12000,size.height+200)");

const url = process.argv[2] ?? "http://127.0.0.1:5191/", output = "output/playwright/flow";
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(output + "/verify.js", `async page => {
  page.setDefaultTimeout(15000);
  ${flowViewportHelper}
  const check=(ok,message)=>{if(!ok)throw Error(message)}, errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await setViewport({width:1280,height:900});
  await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2023-a-11")});
  await page.locator('.detail-frame.ready').waitFor();
  const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  const settle=async()=>{
    await page.locator('.detail-frame').scrollIntoViewIfNeeded();
    await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);
  };
  const configure=async(a,b,exit='eq',sub='lt')=>{
    await f.locator('#reset').press('Enter');
    await f.locator('#initial-a').fill(String(a));await f.locator('#initial-b').fill(String(b));
    await f.locator('#exit-op').selectOption(exit);await f.locator('#subtract-op').selectOption(sub);
    await settle();
    check((await f.locator('#current-title').innerText()).startsWith('①'),'apply starts after ①');
    check(await f.locator('#m-value').innerText()==='m＝'+a&&await f.locator('#n-value').innerText()==='n＝'+b,'applied values match inputs');
  };
  const snapshot=()=>f.evaluate(()=>({
    state:document.querySelector('.state').textContent,explanation:document.querySelector('#explanation').textContent,
    active:document.querySelector('.node.current').dataset.node,
    trail:[...document.querySelector('#trail').children].map(n=>n.getAttribute('d')),
    end:document.querySelector('#end-node').classList.contains('completed'),
    current:document.querySelector('#history [aria-current]').getAttribute('aria-label')
  }));
  check(await f.locator('#previous').isDisabled(),'initial previous disabled');
  check(await f.locator('#apply').count()===0,'apply button removed');
  check(await f.locator('#settings select').count()===1&&await f.locator('.diagram-canvas select').count()===2,'operators edit the objects in the diagram');
  await f.locator('#next').press('Enter');await f.locator('#initial-a').fill('3');
  check(await f.locator('#m-value').innerText()==='m＝3'&&await f.locator('#history li').count()===1,'initial input applies immediately and resets history');
  await f.locator('#next').press('Enter');await f.locator('#exit-op').focus();await f.locator('#exit-op').selectOption('ne');
  check((await f.locator('#current-title').innerText()).startsWith('①')&&await f.locator('#history li').count()===1,'operator changes apply immediately');
  check(await f.locator('#exit-op').evaluate(n=>n===document.activeElement),'editing keeps select focus');
  await f.locator('#next').press('Enter');const unchanged=await snapshot();
  await f.locator('#initial-a').fill('03');
  check(JSON.stringify(await snapshot())===JSON.stringify(unchanged),'same numeric setting preserves history');
  await f.locator('#initial-a').evaluate(n=>{n.value='6';n.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));});
  check(JSON.stringify(await snapshot())===JSON.stringify(unchanged),'IME composition preserves state until committed');
  await f.locator('#initial-a').dispatchEvent('compositionend');
  check(await f.locator('#m-value').innerText()==='m＝6'&&await f.locator('#history li').count()===1,'IME commit applies once');
  await configure(6,9);
  const patterns=[['choice-1',6,3,'①②③④②⑥','a＝2b'],['choice-2',3,6,'①②③⑤②⑥','2a＝b'],['choice-3',9,6,'①②③④②③⑤②⑥','2a＝3b'],['choice-4',6,9,'①②③⑤②③④②⑥','3a＝2b']];
  for(const [id,a,b,path,relation] of patterns){
    await f.locator('#initial-pattern').focus();await f.locator('#initial-pattern').selectOption(id);
    check(await f.locator('#initial-a').inputValue()===String(a)&&await f.locator('#initial-b').inputValue()===String(b),'choice example inputs');
    check(await f.locator('#initial-pattern').evaluate(n=>n===document.activeElement),'choice selection retains focus');
    const states=[await snapshot()];let executed='①';
    while(!await f.locator('#next').isDisabled()){await f.locator('#next').press('Enter');await settle();executed+=(await f.locator('#current-title').innerText())[0];states.push(await snapshot());}
    check(executed===path,'official choice path '+id);
    check((await f.locator('#explanation').innerText()).includes('移項して整理すると '+relation),'derive relation from actual expressions '+id);
    check((await f.locator('#printed').innerText()).includes('：3（終了）'),'choice prints 3');
    if(id!=='choice-4')check((await f.locator('#explanation').innerText()).includes('指定経路とは異なります'),'distinguish wrong official choice');
    if(id==='choice-3'){
      const original=page.viewportSize(),height=await page.evaluate(()=>document.documentElement.scrollHeight);
      await setViewport({width:original.width,height:height+1});await settle();
      await f.locator('.workspace').screenshot({path:'${output}/pattern-2a-3b.png'});await setViewport(original);
    }
    for(let i=states.length-2;i>=0;i--){await f.locator('#previous').press('Enter');await settle();check(JSON.stringify(await snapshot())===JSON.stringify(states[i]),'choice backward explanation and state '+id+'/'+i);}
  }
  await f.locator('#initial-a').fill('5');await f.locator('#initial-b').fill('7');check(await f.locator('#initial-pattern').inputValue()==='','arbitrary inputs clear choice');
  await f.locator('#initial-a').fill('9');await f.locator('#initial-b').fill('6');check(await f.locator('#initial-pattern').inputValue()==='choice-3','manual ratio selects matching official choice');
  await f.locator('#exit-op').selectOption('ne');await f.locator('#initial-pattern').selectOption('choice-2');
  check(await f.locator('#exit-op').inputValue()==='ne','choice preserves comparison edits');
  await f.locator('#next').press('Enter');await f.locator('#next').press('Enter');
  check((await f.locator('#explanation').innerText()).includes('移項して整理すると a≠b'),'changed operator uses actual symbolic condition');
  await f.locator('#initial-a').fill('');await f.locator('#initial-pattern').selectOption('choice-3');
  check(await f.locator('#input-error').isHidden()&&await f.locator('#m-value').innerText()==='m＝9','choice resolves invalid draft');
  const examples=[[6,9,'eq','①②③⑤②③④②⑥',3],[3,6,'eq','①②③⑤②⑥',3],[6,9,'ne','①②⑥',6]];
  for(const [a,b,exit,path,printed] of examples){
    await configure(a,b,exit);const states=[await snapshot()];let executed='①';
    while(!await f.locator('#next').isDisabled()){
      await f.locator('#next').click();await settle();executed+=(await f.locator('#current-title').innerText())[0];states.push(await snapshot());
    }
    check(executed===path,'requested path '+executed+' expected '+path+' for '+a+','+b+','+exit);check((await f.locator('#printed').innerText()).includes('：'+printed+'（終了）'),'requested output');
    for(let i=states.length-2;i>=0;i--){await f.locator('#previous').click();await settle();check(JSON.stringify(await snapshot())===JSON.stringify(states[i]),'exact backward restoration '+i);}
    for(let i=1;i<states.length;i++){await f.locator('#next').click();await settle();check(JSON.stringify(await snapshot())===JSON.stringify(states[i]),'exact forward restoration '+i);}
    if(exit==='eq'&&a===6){await f.locator('.diagram-stage').screenshot({path:'${output}/desktop-completed.png'});}
    await f.locator('#reset').click();check(await f.locator('#history li').count()===1,'reset clears history');
    check(await f.locator('#m-value').innerText()==='m＝'+a&&await f.locator('#n-value').innerText()==='n＝'+b,'reset preserves settings');
  }
  await configure(6,9,'ne','lt');check(await f.locator('#label-3-5').textContent()==='到達不能','unreachable label');
  await f.locator('#next').click();
  check((await f.locator('#explanation').innerText()).includes('6 ≠ 9'),'explanation follows actual comparison');
  const valid=await snapshot();
  for(const raw of ['', '1.5','0','-1','9007199254740992']){
    await f.locator('#initial-a').fill(raw);
    check(await f.locator('#initial-a').getAttribute('aria-invalid')==='true','input invalid '+raw);
    check(await f.locator('#input-error').isVisible(),'input error visible');check(JSON.stringify(await snapshot())===JSON.stringify(valid),'invalid apply preserves state');
  }
  await f.locator('#exit-op').selectOption('eq');check(await f.locator('#exit-op').inputValue()==='ne','invalid draft keeps the diagram editor consistent');
  check(JSON.stringify(await snapshot())===JSON.stringify(valid),'invalid draft also preserves state during operator edit');
  await configure(1,1,'gt','lt');while(!await f.locator('#next').isDisabled())await f.locator('#next').click();
  check((await f.locator('#stop-reason').innerText()).includes('循環'),'cycle reason');await f.locator('#previous').click();check(!await f.locator('#next').isDisabled(),'can undo stop');
  await configure(9007199254740991,1,'lt','gt');while(!await f.locator('#next').isDisabled())await f.locator('#next').click();
  check((await f.locator('#stop-reason').innerText()).includes('整数精度'),'precision reason');await f.locator('#reset').click();check(!await f.locator('#next').isDisabled(),'can reset precision stop');
  await configure(6,9);
  await f.locator('.node[data-node="2"]').press('Enter');check(await f.locator('#inspection').isVisible(),'keyboard selection');
  await f.locator('.node[data-node="2"]').press('Space');check(await f.locator('#inspection').isHidden(),'keyboard reselect');
  await f.locator('.node[data-node="3"]').press('Enter');await f.locator('#close-inspection').press('Enter');
  check(await f.locator('.node[data-node="3"]').evaluate(n=>n===document.activeElement),'close restores focus');
  await f.locator('.node[data-node="1"]').press('Enter');await f.locator('.node[data-node="1"]').press('Escape');
  check(await f.locator('#inspection').isHidden(),'Escape closes');
  await f.locator('.node[data-node="3"]').press('Enter');await f.locator('#exit-op').focus();await f.locator('#exit-op').press('Escape');
  check(await f.locator('#inspection').isVisible()&&await f.locator('#exit-op').evaluate(n=>n===document.activeElement),'Escape in select does not steal focus');
  await f.locator('.node[data-node="3"]').press('Escape');
  await f.locator('#initial-a').fill('3');await f.locator('#initial-b').fill('6');
  await f.locator('#exit-op').focus();await f.locator('#exit-op').press('Tab');
  check(await f.locator('#subtract-op').evaluate(n=>n===document.activeElement),'Tab reaches the second inline dropdown');
  // macOS headless Chromium does not change even a bare native select with
  // ArrowDown; inspect native focus order and use selectOption for selection.
  await f.locator('#subtract-op').selectOption('le');
  check(await f.locator('#history li').count()===1,'native dropdown change applies');
  await f.locator('#subtract-op').press('Tab');
  check(await f.locator('#next').evaluate(n=>n===document.activeElement),'Tab reaches playback after dropdowns');
  await f.locator('#next').press('Enter');check((await f.locator('#current-title').innerText()).startsWith('②'),'keyboard next');
  const operators=await f.evaluate(()=>{
    const $=id=>document.getElementById(id), assert=(ok,message)=>{if(!ok)throw Error(message)};
    const accepted={eq:[0],ne:[-1,1],lt:[-1],le:[-1,0],gt:[1],ge:[0,1]}, labels={'＝':[0],'≠':[-1,1],'＜':[-1],'≦':[-1,0],'＞':[1],'≧':[0,1],'すべて':[-1,0,1],'到達不能':[]};
    let steps=0;
    for(const exit of Object.keys(accepted))for(const sub of Object.keys(accepted)){
      $('initial-a').value='6';$('initial-b').value='9';$('exit-op').value=exit;$('subtract-op').value=sub;$('exit-op').dispatchEvent(new Event('change',{bubbles:true}));$('reset').click();
      for(const edge of ['2-6','2-3','3-5','3-4']){
        const outcomes=[-1,0,1].filter(r=>edge==='2-6'?accepted[exit].includes(r):edge==='2-3'?!accepted[exit].includes(r):!accepted[exit].includes(r)&&(edge==='3-5'?accepted[sub].includes(r):!accepted[sub].includes(r)));
        assert(JSON.stringify(labels[$('label-'+edge).textContent])===JSON.stringify(outcomes),'restricted label '+exit+'/'+sub+'/'+edge);
      }
      let m=6,n=9,node=1;const seen=new Set();
      while(!$('next').disabled){
        const r=m<n?-1:m>n?1:0;
        node=[1,4,5].includes(node)?2:node===2?(accepted[exit].includes(r)?6:3):(accepted[sub].includes(r)?5:4);
        const candidate=node===4?BigInt(m)-BigInt(n):node===5?BigInt(n)-BigInt(m):null;
        const overflow=candidate!==null&&(candidate>9007199254740991n||candidate< -9007199254740991n);
        if(!overflow){if(node===4)m=Number(candidate);if(node===5)n=Number(candidate);}
        $('next').click();steps++;
        assert(document.querySelector('.node.current').dataset.node===String(node),'actual node');
        assert($('m-value').textContent==='m＝'+m&&$('n-value').textContent==='n＝'+n,'actual arithmetic');
        if(overflow)assert($('stop-reason').textContent.includes('整数精度'),'overflow');
        if(steps>20000)throw Error('UI did not stop');
      }
    }
    $('initial-a').value='1000';$('initial-b').value='1';$('exit-op').value='eq';$('subtract-op').value='lt';$('initial-a').dispatchEvent(new Event('input',{bubbles:true}));
    const stageBefore=document.querySelector('.diagram-stage').getBoundingClientRect().height;
    for(let i=0;i<520&&!$('next').disabled;i++)$('next').click();
    assert($('history').children.length===512&&$('stop-reason').textContent.includes('実行上限'),'512 step stop');
    assert(Math.abs(document.querySelector('.diagram-stage').getBoundingClientRect().height-stageBefore)<1,'long history preserves diagram size');
    assert($('history').scrollHeight<=$('history').clientHeight+1,'long history has no vertical scroller');
    $('previous').click();assert(!$('next').disabled,'limit stop reversible');$('reset').click();assert($('history').children.length===1,'reset limit');
    return {pairs:36,steps,limit:512};
  });
  check(await page.locator('.question-footer.expanded').count()>=1,'source footer always expanded');
  await settle();check(await f.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight+1),'single document scroll');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  check(await page.getByRole('button',{name:'詳細解説を見る',exact:true}).isVisible(),'return to normal explanation');
  check(errors.length===0,'page errors '+errors.join(','));return {examples:3,officialPatterns:4,derivedRelations:true,restoration:true,liveInput:true,inlineOperators:true,inputErrors:5,keyboard:true,operators,errors};
}`);

fs.writeFileSync(output + "/layout.js", `async page=>{
  page.setDefaultTimeout(15000);
  ${flowViewportHelper}
  const check=(ok,message)=>{if(!ok)throw Error(message)};let conditions=0,states=0;
  await page.goto('about:blank');await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2023-a-11")});await page.locator('.detail-frame.ready').waitFor();
  const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  for(const width of [1280,834,540,390,320])for(const theme of ['light','dark'])for(const font of [100,150]){
    await setViewport({width,height:width===1280?600:700});
    await page.getByRole('button',{name:theme==='dark'?'ダークモード':'ライトモード',exact:true}).click();
    await page.locator('.detail-frame').scrollIntoViewIfNeeded();
    await f.evaluate(font=>{document.documentElement.style.fontSize=font+'%';document.querySelector('#reset').click()},font);
    await f.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);
    const result=await f.evaluate(()=>{
      const $=id=>document.getElementById(id),assert=(ok,message)=>{if(!ok)throw Error(message)};
      const geometry=()=>[...document.querySelectorAll('#settings,.diagram-stage,.diagram-viewport,#flowchart,.playback,.buttons')].flatMap(n=>{const r=n.getBoundingClientRect();return [r.x,r.y+scrollY,r.width,r.height]});
      const base=geometry(),stable=()=>{const r=geometry();assert(r.every((v,i)=>Math.abs(v-base[i])<1),'geometry changed')};
      const corners=()=>{
        const stage=document.querySelector('.diagram-stage').getBoundingClientRect(),history=document.querySelector('.history').getBoundingClientRect(),chart=$('flowchart').getBoundingClientRect(),legend=document.querySelector('.legend').getBoundingClientRect();
        assert(history.top>=stage.top&&history.top<chart.top+100&&Math.abs(stage.right-history.right)<=17,'history is at top right');
        assert(history.right<=stage.right&&history.width<=stage.width,'history stays inside diagram');
        assert(legend.top>=chart.bottom-1&&Math.abs(legend.right-stage.right)<1&&legend.bottom<=stage.bottom+1,'legend is at bottom right');
        const controls=[...document.querySelector('.settings-row').children].map(n=>n.getBoundingClientRect());
        assert(controls.every(r=>Math.abs((r.top+r.height/2)-(controls[0].top+controls[0].height/2))<1),'one control row');
        assert($('settings').getBoundingClientRect().bottom<=stage.top+1,'settings above diagram');
        assert($('initial-a').getBoundingClientRect().width<100&&$('initial-b').getBoundingClientRect().width<100,'compact initial inputs');
        assert(!document.body.textContent.includes('適用中：'),'redundant applied summary removed');
        assert(!$('apply')&&document.querySelectorAll('#settings select').length===1&&$('initial-pattern'),'only choice selection in toolbar');
        for(const select of document.querySelectorAll('.branch-control select')){
          const r=select.getBoundingClientRect();assert(r.left>=chart.left&&r.right<=chart.right&&r.top>=chart.top&&r.bottom<=chart.bottom,'operator editor is in diagram');
          for(const shape of document.querySelectorAll('.node rect,.node polygon,.terminal rect')){const s=shape.getBoundingClientRect();assert(r.right<=s.left||r.left>=s.right||r.bottom<=s.top||r.top>=s.bottom,'operator editor does not cover shape')}
          for(const path of document.querySelectorAll('#edges path')){const length=path.getTotalLength(),matrix=path.getScreenCTM();for(let i=0;i<=100;i++){const point=path.getPointAtLength(length*i/100),p=new DOMPoint(point.x,point.y).matrixTransform(matrix);assert(p.x<=r.left||p.x>=r.right||p.y<=r.top||p.y>=r.bottom,'operator editor does not cover connector')}}
        }
        for(const shape of document.querySelectorAll('.node rect,.node polygon,.terminal rect')){const r=shape.getBoundingClientRect();assert(history.right<=r.left||history.left>=r.right||history.bottom<=r.top||history.top>=r.bottom,'history does not cover shapes')}
        const current=$('history').querySelector('[aria-current]'),h=$('history').getBoundingClientRect(),r=current.getBoundingClientRect();
        assert(r.left>=h.left-1&&r.right<=h.right+1,'current history entry visible');
        assert($('history').scrollHeight<=$('history').clientHeight+1,'history has no vertical scroller');
      };
      const configure=(a,b,exit,sub)=>{$('initial-a').value=a;$('initial-b').value=b;$('exit-op').value=exit;$('subtract-op').value=sub;$('initial-a').dispatchEvent(new Event('input',{bubbles:true}));if(!$('initial-a').hasAttribute('aria-invalid')&&!$('initial-b').hasAttribute('aria-invalid'))$('reset').click()};
      configure('6','9','eq','lt');stable();let count=1;
      while(!$('next').disabled){$('next').click();stable();corners();count++}
      while(!$('previous').disabled){$('previous').click();stable();corners()}
      for(const id of ['choice-1','choice-2','choice-3','choice-4']){
        $('initial-pattern').value=id;$('initial-pattern').dispatchEvent(new Event('change',{bubbles:true}));stable();corners();
        while(!$('next').disabled){$('next').click();stable();corners()}
      }
      for(const n of document.querySelectorAll('.node')){n.dispatchEvent(new MouseEvent('click',{bubbles:true}));stable();n.dispatchEvent(new MouseEvent('click',{bubbles:true}));stable()}
      $('baseline').open=true;stable();$('baseline').open=false;stable();
      configure('','9','eq','lt');assert(!$('input-error').hidden,'error shown');stable();
      configure('9007199254740991','9007199254740990','ne','ge');stable();$('next').click();stable();$('next').click();stable();
      configure('6','9','ne','lt');stable();assert($('label-3-5').textContent==='到達不能','long label');
      assert(!$('label-3-5').hidden,'unreachable condition remains visible beside editor');
      configure('6','9','lt','ne');stable();assert($('label-3-5').textContent==='＞'&&!$('label-3-5').hidden,'restricted outcome remains visible beside raw operator');
      configure('6','9','eq','lt');corners();
      assert(document.documentElement.scrollWidth<=innerWidth+1,'iframe page horizontal overflow');
      for(const n of document.querySelectorAll('button,input,select,summary'))if(n.getClientRects().length)assert(n.getBoundingClientRect().height>=44,'44px target '+n.id);
      const labels=[...document.querySelectorAll('.branch-labels text,.node-number,.current-marker')];
      for(const label of labels){if(getComputedStyle(label).visibility==='hidden')continue;const r=label.getBoundingClientRect();for(const shape of document.querySelectorAll('.node rect,.node polygon')){const s=shape.getBoundingClientRect();assert(r.right<=s.left||r.left>=s.right||r.bottom<=s.top||r.top>=s.bottom,'label/shape overlap '+label.textContent)}}
      return count;
    });states+=result;conditions++;
    await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await f.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'parent horizontal overflow');
    check(await f.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight+1),'no nested vertical scrolling');
    const before=await page.locator('.detail-frame').evaluate(n=>n.clientHeight);await f.locator('#baseline').evaluate(n=>n.open=true);
    await page.waitForFunction(before=>document.querySelector('.detail-frame').clientHeight>before+100,before);
    await f.locator('#baseline').evaluate(n=>n.open=false);await page.waitForFunction(before=>Math.abs(document.querySelector('.detail-frame').clientHeight-before)<2,before);
    check(await page.locator('.detail-main > .question-footer').evaluate(n=>getComputedStyle(n).position==='static'),'footer in page flow');
    if(font===100&&((width===1280&&theme==='light')||(width===320&&theme==='dark'))){
      const original=page.viewportSize(),height=await page.evaluate(()=>document.documentElement.scrollHeight);
      await setViewport({width,height:height+1});await f.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'${output}/'+width+'-'+theme+'.png',fullPage:true});
      await f.locator('.diagram-stage').screenshot({path:'${output}/chart-'+width+'-'+theme+'.png'});
      if(width===320){await f.locator('#subtract-op').focus();check(await f.locator('#subtract-op').evaluate(n=>{const r=n.getBoundingClientRect(),v=n.closest('.diagram-viewport').getBoundingClientRect();return r.left>=v.left&&r.right<=v.right}),'keyboard focus reveals inline editor on narrow screen');await f.locator('.diagram-viewport').screenshot({path:'${output}/inline-'+width+'-'+theme+'.png'});}
      await setViewport(original);
    }
  }
  await page.setViewportSize({width:320,height:700});await page.goto(${JSON.stringify(url + "explanations/ipa-2023-a-11/index.html")});
  check(await page.locator('#standalone-title').isVisible()&&await page.locator('#standalone-credit').isVisible(),'standalone provenance');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'standalone width');await page.locator('#next').press('Enter');
  return {conditions,forwardStates:states,officialPatterns:4,compactToolbar:true,inlineEditors:true,historyCorner:true,legendCorner:true,historyVisible:true,allSteps:true,selection:true,errors:true,largeValues:true,font150:true,hostGrowthShrink:true,standalone:true};
}`);

const b = fixture();
let run = startRun(await prepareRun(b, { subject: "A", kind: "annual", year: 2023, mode: "study", size: "public", bindingMode: "original_data" }, {}));
const index = run.issued.findIndex(q => q.id === "question-ipa-2023-a-11");
run.session.currentIndex = index; run = updateAnswer(run, "choice-4"); run.session.entries[index].revealed = true;
run = finishRun(run, "completed"); await validateRun(run);
fs.writeFileSync(output + "/saved.js", `async page=>{
  page.setDefaultTimeout(15000);
  const check=(ok,message)=>{if(!ok)throw Error(message)};
  await page.goto(${JSON.stringify(url)});await page.reload();await page.evaluate(async run=>{
    const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3),db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=reject});
    const ids=[...new Set(run.issued.flatMap(q=>q.assetRefs))],assets=Object.fromEntries(await Promise.all(ids.map(async id=>{
      const asset=run.bundle.assets.find(a=>a.id===id),response=await fetch(new URL('data/'+asset.path,location.href));
      if(!response.ok)throw Error('missing saved asset '+id);return [id,await response.blob()];
    })));
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets});run.instances.forEach(i=>tx.objectStore('generatedInstances').put(i));
    tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});tx.objectStore('results').put(run.result);
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});db.close();
  },${JSON.stringify(run)});
  await page.goto(${JSON.stringify(url + `#/detail/${run.session.id}/${index}/review`)});await page.locator('.detail-frame.ready').waitFor();
  const f=await(await page.locator('.detail-frame').elementHandle()).contentFrame();
  const initial=await f.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context));
  await f.locator('#initial-pattern').selectOption('choice-3');await f.locator('#next').press('Enter');
  check(await f.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===initial,'immutable problem context');
  const isolation=await f.evaluate(()=>{try{parent.document.body;return false}catch{return Object.isFrozen(window.OpenCBTDetail.context)}});check(isolation,'isolated host');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  const saved=await page.evaluate(async id=>{const open=indexedDB.open('opencbt-fe-kihonjoho-v2',3),db=await new Promise(resolve=>open.onsuccess=()=>resolve(open.result));const req=db.transaction('sessions').objectStore('sessions').get(id);return await new Promise(resolve=>req.onsuccess=()=>resolve(req.result))},${JSON.stringify(run.session.id)});
  check(JSON.stringify(saved.issued)===${JSON.stringify(JSON.stringify(run.issued))},'saved content retained');
  check(JSON.stringify(saved.session.entries)===${JSON.stringify(JSON.stringify(run.session.entries))},'saved answers and order retained');
  check(JSON.stringify(saved.result)===${JSON.stringify(JSON.stringify(run.result))},'saved result retained');
  return {savedProblem:true,answer:true,choiceOrder:true,result:true,immutableContext:true,return:true};
}`);
console.log(`Generated ${output}/{verify,layout,saved}.js for the isolated headless Playwright CLI.`);
