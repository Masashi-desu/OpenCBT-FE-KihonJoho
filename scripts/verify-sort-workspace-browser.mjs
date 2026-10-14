// Generate a regression fixture for a dedicated headless Playwright CLI session.
import fs from 'node:fs';
const url = process.argv[2] ?? 'http://127.0.0.1:5188/';
const output = 'output/playwright/sort';
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(output + '/workspace.js', `async page => {
  const check=(ok,message)=>{if(!ok)throw Error(message)}, errors=[], results=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',m=>{if(m.text().startsWith('SORT-'))errors.push(m.text())});
  await page.addInitScript(()=>{window.addEventListener('error',e=>console.log('SORT-ERROR',e.message,e.error?.stack),true);window.addEventListener('securitypolicyviolation',e=>console.log('SORT-CSP',e.violatedDirective,e.blockedURI));});
  await page.unroute('**/explanations/ipa-2026-a-2/manifest.json');
  await page.goto(${JSON.stringify(url + '#/search/detail/question-ipa-2026-a-2?type=detail')});
  await page.reload();
  await page.locator('.detail-frame.ready').waitFor();
  const f=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  // Keep the opaque iframe below the app's sticky mobile navigation for pointer checks.
  const frameInView=async()=>page.locator('.detail-frame').evaluate(n=>scrollTo(0,Math.max(0,n.getBoundingClientRect().top+scrollY-150)));
  const kinds=['quick','bubble','selection','insertion','merge','heap','shell'];
  const geometry=()=>{
    const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.top+scrollY,r.width,r.height]};
    return [...box('.playback'),...box('.context-pane'),...box('.diagram-stage')];
  };
  const stable=async expected=>check(JSON.stringify(await f.evaluate(geometry))===JSON.stringify(expected),'operation positions changed');
  let state='start';
  try {
  for(const width of [1362,1280,390,320]) {
    state=width+'/viewport';
    await page.setViewportSize({width,height:width>600?1313:844});
    await frameInView();
    await f.locator('#default-input').click();
    await f.locator('#algorithm-select').selectOption('quick');
    const baseline=await f.evaluate(geometry);
    check(await f.evaluate(()=>{
      const v=document.querySelector('.visual-panel'), w=document.querySelector('.workspace');
      return v.parentElement===w&&Math.abs(v.getBoundingClientRect().width-w.clientWidth)<1;
    }),'diagram must occupy the workspace width without a side card');
    for(const kind of kinds) {
      state=width+'/'+kind;
      await f.locator('#algorithm-select').selectOption(kind); await stable(baseline);
      const tested=await f.evaluate(expected=>{
        const seek=document.querySelector('#seek'), failures=[];
        for(let i=0;i<=Number(seek.max);i++) {
          seek.value=String(i);seek.dispatchEvent(new Event('input',{bubbles:true}));
          const actual=['.playback','.context-pane','.diagram-stage'].flatMap(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.top+scrollY,r.width,r.height]});
          if(JSON.stringify(actual)!==JSON.stringify(expected))failures.push(i);
        }
        return {steps:Number(seek.max)+1,failures};
      },baseline);
      check(!tested.failures.length,kind+' moves controls at steps '+tested.failures.join(','));
      await f.locator('#first').click();
      await f.locator('.bar-button').first().click();await stable(baseline);
      check(await f.locator('#inspection-view').isVisible()&&await f.locator('#step-view').isHidden(),'element replaces step explanation');
      await f.locator('.bar-button').first().click();check(await f.locator('#inspection-view').isHidden(),'reselection closes element');
      for(const id of ['algorithm-help','counts-help','diagram-help']) {
        state=width+'/'+kind+'/'+id;
        await frameInView();await f.locator('#'+id+' summary').click();await stable(baseline);
        await f.waitForFunction(id=>document.querySelector('#'+id).open&&document.querySelectorAll('.context-pane details[open]').length===1,id,{timeout:3000,polling:100});
        check(await f.locator('.context-pane details[open]').count()===1,'only requested supplement visible: '+id);
      }
      await frameInView();await f.locator('#diagram-help summary').click();
      if(kind==='heap') {
        const step=await f.locator('#seek').inputValue();
        await f.locator('#toggle-tree').click();await stable(baseline);
        check(await f.locator('#heap-view').isVisible()&&await f.locator('#array-view').isHidden(),'tree uses the same diagram area');
        check(await f.evaluate(()=>{const r=document.querySelector('.diagram-stage').getBoundingClientRect();return [...document.querySelectorAll('.node-index')].every(n=>{const b=n.getBoundingClientRect();return b.top>=r.top&&b.bottom<=r.bottom})}),'all tree position labels fit the diagram');
        await f.locator('#next').click();await stable(baseline);
        const same=await f.evaluate(()=>JSON.stringify([...document.querySelectorAll('.tree-node')].map(n=>n.dataset.value))===JSON.stringify([...document.querySelectorAll('.bar-button')].map(n=>n.dataset.value)));
        check(same,'tree and array share the current snapshot');
        await f.locator('#toggle-tree').click();await stable(baseline);
        check(await f.locator('#seek').inputValue()===String(Number(step)+1),'view toggle keeps playback');
      }
      results.push({width,kind,steps:tested.steps});
    }
    await f.locator('#sequence').fill('1,2,3');await f.locator('#apply-input').click();await stable(baseline);
    check(await f.locator('#input-error').isVisible(),'invalid input explained');
    await f.locator('#sequence').fill('99,0,99,0,45,45,12,8,7,1');await f.locator('#apply-input').click();await stable(baseline);
    await f.locator('#algorithm-select').selectOption('shell');await f.locator('#next').click();await stable(baseline);
    check(await f.locator('.bar-button').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().width>=44)),'element touch widths');
    check(await f.evaluate(()=>{
      const chart=document.querySelector('.chart-scroll').getBoundingClientRect();
      return [...document.querySelectorAll('.bar-value')].every(n=>{const r=n.getBoundingClientRect();return r.top>=chart.top-1&&r.bottom<=chart.bottom+1});
    }),'maximum values stay inside the chart');
    check(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page width overflow');
    check(await f.evaluate(()=>document.querySelector('.diagram-stage').scrollWidth<=document.querySelector('.diagram-stage').clientWidth),'no spurious diagram scrollbar');
    await f.locator('#default-input').click();await f.locator('#algorithm-select').selectOption('quick');
    for(const theme of ['light','dark']) {
      state=width+'/'+theme;
      await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();
      await f.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme,{timeout:3000,polling:100});
      await frameInView();await f.evaluate(()=>scrollTo(0,0));
      await f.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.screenshot({path:'${output}/workspace-'+width+'-'+theme+'.png',fullPage:true,animations:'disabled'});
      await stable(baseline);
    }
    await f.locator('.context-pane').evaluate(n=>n.style.fontSize='26px');
    await frameInView();await f.locator('#algorithm-help summary').click();await stable(baseline);
    await f.locator('#algorithm-help').evaluate(n=>n.open=false);
    await f.locator('.context-pane').evaluate(n=>n.style.fontSize='');
  }
  await page.setViewportSize({width:1362,height:1313});
  await f.locator('#algorithm-select').selectOption('heap');await f.locator('#next').click();await f.locator('#toggle-tree').click();
  await f.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'${output}/workspace-tree.png',fullPage:true,animations:'disabled'});
  check(!errors.length,'JS errors: '+errors.join(', '));
  return {results,explanationTransitions:'passed',fixedControls:'passed',fontEnlargement:'passed',jsErrors:errors};
  } catch(error) {throw Error(JSON.stringify({failure:String(error),state,url:page.url(),errors,results,details:!f.isDetached()?await f.locator('details').evaluateAll(ns=>ns.map(n=>({id:n.id,open:n.open}))):'detached'}));}
}`);
console.log('Generated ' + output + '/workspace.js');
