import fs from "node:fs";
const base = process.argv[2] ?? "http://127.0.0.1:5176/";
const directory = "output/playwright/colors";
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(`${directory}/verify.js`, `async page => {
  const base=${JSON.stringify(base)}, check=(value,message)=>{if(!value)throw Error(message)};
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  const read=()=>({ theme:document.documentElement.dataset.theme, background:getComputedStyle(document.body).backgroundColor,
    colors:Object.fromEntries(['--canvas','--surface','--ink','--muted','--line','--accent','--scrollbar-thumb','--scrollbar-thumb-active','--visual-compare','--visual-move','--visual-pivot','--visual-sorted','--visual-fixed','--text-danger'].map(key=>[key,getComputedStyle(document.documentElement).getPropertyValue(key).trim()])) });
  const matchesRole=async (scope,selector,property,token)=>scope.evaluate(({selector,property,token})=>{
    const node=document.querySelector(selector), probe=document.createElement('span');
    probe.style[property]='var('+token+')'; probe.style.position='fixed'; probe.hidden=true; document.body.append(probe);
    const result={actual:getComputedStyle(node)[property],expected:getComputedStyle(probe)[property]}; probe.remove(); return result.actual===result.expected;
  },{selector,property,token});
  await page.setViewportSize({width:1252,height:900});
  const observed=[];
  for(const theme of ['light','dark']) {
    await page.goto(base+'#/menu'); await page.getByRole('heading',{name:'模擬試験',exact:true}).waitFor();
    await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();
    for(const [hash,heading] of [['#/menu','模擬試験'],['#/search?q=ソート','検索'],['#/bookmarks','ブックマーク'],['#/history','履歴・復習'],['#/licenses','ライセンス表記']]) {
      await page.goto(base+hash); await page.getByRole('heading',{name:heading,exact:true}).waitFor();
      check(await matchesRole(page,'body','backgroundColor','--canvas'),'canvas '+hash+' '+theme);
      check(await matchesRole(page,'body','color','--ink'),'text '+hash+' '+theme);
      check(await page.evaluate(()=>document.querySelector('meta[name="theme-color"]').content===getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim()),'browser theme metadata '+theme);
    }
    await page.goto(base+'#/search/detail/question-ipa-2026-a-2'); await page.locator('.detail-frame.ready').waitFor();
    const frame=page.frameLocator('.detail-frame'), handle=await page.locator('.detail-frame').elementHandle(), child=await handle.contentFrame();
    const parentPalette=await page.evaluate(read), childPalette=await child.evaluate(read);
    check(JSON.stringify(parentPalette)===JSON.stringify(childPalette),'same common palette '+theme);
    check(await matchesRole(child,'body','backgroundColor','--canvas'),'detail canvas '+theme);
    check(await matchesRole(child,'.visual-panel','backgroundColor','--surface'),'detail panel '+theme);
    check(await matchesRole(child,'.overlay-scrollbar-thumb','backgroundColor','--scrollbar-thumb'),'detail scrollbar '+theme);
    await frame.locator('#next').click(); await frame.locator('#next').click(); await frame.locator('#next').click();
    check(await matchesRole(child,'[data-state="compare"] .bar-column','backgroundColor','--visual-compare'),'comparison role '+theme);
    await frame.locator('#sequence').fill('1,2,3'); await frame.locator('#apply-input').click();
    check(await matchesRole(child,'.error','color','--text-danger'),'shared input error '+theme);
    await frame.locator('#default-input').click();
    await page.screenshot({path:'${directory}/detail-'+theme+'.png',fullPage:true,animations:'disabled'});
    observed.push(parentPalette);
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click(); await page.locator('#search-explanation').waitFor();
    await page.goto(base+'#/search?q=ソート'); await page.locator('.search-loading').waitFor({state:'hidden'});
    await page.screenshot({path:'${directory}/search-'+theme+'.png',fullPage:true,animations:'disabled'});
  }
  await page.setViewportSize({width:390,height:844}); await page.goto(base+'#/search?q=ソート'); await page.locator('.search-loading').waitFor({state:'hidden'});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow');
  await page.screenshot({path:'${directory}/mobile-dark.png',fullPage:true,animations:'disabled'});
  check(errors.length===0,'JS errors: '+errors.join(', '));
  return {colors:'passed',views:['menu','search','bookmarks','history','licenses','detail'],themes:observed,jsErrors:errors};
}\n`);
console.log(`Generated ${directory}/verify.js for an isolated headless Playwright CLI session.`);

const docsBase = process.argv[3];
if (docsBase) {
  fs.writeFileSync(`${directory}/verify-docs.js`, `async page => {
    const base=${JSON.stringify(docsBase)}, observed=[], errors=[];
    const check=(value,message)=>{if(!value)throw Error(message)};
    page.on('pageerror',error=>errors.push(error.message));
    await page.setViewportSize({width:1360,height:900});
    await page.goto(base+'screens'); await page.getByRole('heading',{level:1}).waitFor();
    const toggle=page.locator('.VPNavBarAppearance .VPSwitchAppearance');
    for(const theme of ['light','dark']) {
      if((await toggle.getAttribute('aria-checked')==='true')!==(theme==='dark')) await toggle.click();
      const result=await page.evaluate(()=>{
        const css=getComputedStyle(document.documentElement), probe=document.createElement('span');
        probe.style.backgroundColor='var(--canvas)'; probe.style.color='var(--ink)'; probe.hidden=true; document.body.append(probe);
        const resolved=getComputedStyle(probe), body=getComputedStyle(document.body);
        const result={theme:document.documentElement.classList.contains('dark')?'dark':'light',
          background:body.backgroundColor, expectedBackground:resolved.backgroundColor, color:body.color, expectedColor:resolved.color,
          canvas:css.getPropertyValue('--canvas').trim(), vpBg:css.getPropertyValue('--vp-c-bg').trim(),
          accent:css.getPropertyValue('--accent').trim(), vpBrand:css.getPropertyValue('--vp-c-brand-1').trim()};
        probe.remove(); return result;
      });
      check(result.theme===theme,'documentation theme '+theme);
      check(result.background===result.expectedBackground && result.color===result.expectedColor,'documentation palette '+theme);
      check(result.canvas===result.vpBg && result.accent===result.vpBrand,'documentation color adapters '+theme);
      await page.screenshot({path:'${directory}/docs-'+theme+'.png',fullPage:false,animations:'disabled'});
      observed.push(result);
    }
    check(errors.length===0,'documentation JS errors: '+errors.join(', '));
    return {documentation:'passed',themes:observed,jsErrors:errors};
  }\n`);
  console.log(`Generated ${directory}/verify-docs.js for documentation color verification.`);
}
