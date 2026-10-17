// Produce Playwright CLI fixtures only under ignored output/. No lesson files are distributed.
import fs from "node:fs";
import { viewportHelper } from './playwright-viewport.mjs';
import path from "node:path";
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, finishRun, validateRun } from "../src/core/session";
import { contentHash, sha256 } from "../src/core/hash";

const base = process.argv[2] ?? "http://127.0.0.1:5185/";
const output = "output/playwright/detail";
fs.mkdirSync(output, { recursive: true });
const bundle = fixture();
const source = bundle.questions.find((q) => q.id === "question-ipa-2026-b-2")!;
let run = startRun(await prepareRun(bundle, {
  subject: "B", kind: "bookmark", mode: "study", bindingMode: "generated_values",
  bookmarkQuestionRef: { questionId: source.id, revision: source.revision },
}, {}));
run.issued[0].detailedExplanationRef = {
  directory: "explanations/question-test/", revision: 1,
  initialParameters: { contentId: "first", choiceId: run.issued[0].choices[1].id },
};
run.session.entries[0].revealed = true;
run.session.entries[0].selectedChoiceId = run.session.entries[0].choiceOrder[1];
run.session.entries[0].issuedContent.contentSha256 = await contentHash(run.issued[0]);
run.instances[0].contentSha256 = run.session.entries[0].issuedContent.contentSha256;
run = finishRun(run, "completed");
await validateRun(run);
const blobs: Record<string, string> = {};
for (const id of run.issued.flatMap((q) => q.assetRefs)) {
  const asset = bundle.assets.find((a) => a.id === id)!;
  blobs[id] = fs.readFileSync(path.join("public/data", asset.path)).toString("base64");
}
const documents = {
  "index.html": '<!doctype html><html lang="ja"><head><title>Protocol fixture</title><link rel="stylesheet" href="style.css"></head><body><h2>Protocol fixture</h2><p id="content"></p><button id="switch">Other content</button><button id="grow">Expand</button><button id="shrink">Collapse</button><pre id="values"></pre><p id="isolation"></p><div id="spacer" style="height:1200px"></div><script src="main.js"></script></body></html>',
  "style.css": 'body{font:16px sans-serif;margin:16px;background:white;color:#222}html[data-theme="dark"] body{background:#181818;color:#eee}pre{white-space:pre-wrap;overflow-wrap:anywhere}button{font:inherit}',
  "main.js": `const api = window.OpenCBTDetail;
document.querySelector('#content').textContent = api.context.initialParameters.contentId;
document.querySelector('#values').textContent = JSON.stringify({ generation: api.context.generation,
  choiceOrder: api.context.choiceOrder, selectedChoiceId: api.context.selectedChoiceId,
  choiceId: api.context.initialParameters.choiceId });
let parentBlocked = false, storageBlocked = false;
try { parent.document.body; } catch { parentBlocked = true; }
try { localStorage.length; } catch { storageBlocked = true; }
document.querySelector('#isolation').textContent = JSON.stringify({parentBlocked, storageBlocked,
  frozen: Object.isFrozen(api.context.question)});
document.querySelector('#switch').onclick = () => { document.querySelector('#content').textContent = 'other'; };
document.querySelector('#grow').onclick = () => { document.querySelector('#spacer').style.height = '2000px'; };
document.querySelector('#shrink').onclick = () => { document.querySelector('#spacer').style.height = '100px'; };
api.onThemeChange(theme => { document.body.dataset.theme = theme; });
api.ready();`,
};
const manifest = {
  apiVersion: 1, revision: 1, title: "Protocol fixture",
  attribution: run.issued[0].explanation.attribution,
  files: await Promise.all(Object.entries(documents).map(async ([file, text]) => ({
    path: file, mediaType: file.endsWith("html") ? "text/html" : file.endsWith("css") ? "text/css" : "text/javascript",
    sha256: await sha256(text),
  }))),
};
const resources = { "manifest.json": JSON.stringify(manifest), ...documents };
const payload = { run, blobs };
const expected = { parameters: run.instances[0].parameters, choices: run.session.entries[0].choiceOrder,
  selected: run.session.entries[0].selectedChoiceId, hash: run.session.entries[0].issuedContent.contentSha256 };
fs.writeFileSync(`${output}/seed.js`, `async page => {
  ${viewportHelper}
  await page.goto(${JSON.stringify(base)});
  await page.getByRole('button',{name:'開始前の説明へ',exact:true}).and(page.locator(':enabled')).waitFor();
  // Simulate stale canonical assets; current entries must use the matching hashed pair.
  await page.route('**/explanations/host.html',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Stale host</title><p>Legacy cached host</p>'}));
  await page.route('**/explanations/runtime.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'throw Error("Stale runtime must not execute")'}));
  await page.route('**/explanations/question-test/**', route => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    const resources = ${JSON.stringify(resources)};
    return route.fulfill({status: 200, contentType: name.endsWith('json') ? 'application/json' :
      name.endsWith('js') ? 'text/javascript' : name.endsWith('css') ? 'text/css' : 'text/html', body: resources[name]});
  });
  await page.evaluate(async ({run, blobs}) => {
    const open = indexedDB.open('opencbt-fe-kihonjoho-v2', 3);
    const db = await new Promise((resolve, reject) => {open.onsuccess=()=>resolve(open.result);open.onerror=reject;});
    const assets = Object.fromEntries(Object.entries(blobs).map(([id, data]) => [id,
      new Blob([Uint8Array.from(atob(data), char=>char.charCodeAt(0))], {type:'image/webp'})]));
    const tx = db.transaction(['catalogSnapshots','generatedInstances','sessions','results'], 'readwrite');
    tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets});
    run.instances.forEach(instance=>tx.objectStore('generatedInstances').put(instance));
    tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,
      selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});
    tx.objectStore('results').put(run.result);
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject;});
    db.close();
  }, ${JSON.stringify(payload)});
  await page.goto(${JSON.stringify(base + "#/review/" + run.session.id)});
  await page.getByRole('button', {name:'詳細解説を見る'}).waitFor();
}`);
fs.writeFileSync(`${output}/verify.js`, `async page => {
  ${viewportHelper}
  const expected = ${JSON.stringify(expected)};
  const scrollBefore = await page.evaluate(() => {
    const pane=document.querySelector('.reading-scroll'); pane.scrollTo({top:120,behavior:'instant'});
    return pane.scrollTop;
  });
  const check = (condition, message) => { if (!condition) throw Error(message); };
  await page.getByRole('button', {name:'詳細解説を見る'}).click();
  await page.locator('.detail-frame.ready').waitFor();
  let frame = await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  check(await frame.locator('#content').textContent() === 'first', 'initial content');
  const hostName=new URL(frame.url()).pathname.split('/').pop();
  check(hostName.startsWith('host-')&&hostName.endsWith('.html')&&hostName.length===42,'content-versioned host bypasses stale canonical assets');
  const values = JSON.parse(await frame.locator('#values').textContent());
  check(JSON.stringify(values.generation.parameters) === JSON.stringify(expected.parameters), 'saved parameters');
  check(JSON.stringify(values.choiceOrder.map(choice=>choice.id)) === JSON.stringify(expected.choices), 'choice order');
  check(values.selectedChoiceId === expected.selected, 'saved answer');
  const isolation = JSON.parse(await frame.locator('#isolation').textContent());
  check(isolation.parentBlocked && isolation.storageBlocked && isolation.frozen, 'isolation and immutable context');
  for (const width of [1362,390,320]) {
    await setViewport({width,height:width===1362?608:844});
    const fits=()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY+parseFloat(getComputedStyle(document.body).marginBottom)))<=1;
    await frame.waitForFunction(fits);
    const initial=await page.locator('.detail-frame').evaluate(n=>n.clientHeight);
    await frame.locator('#grow').click();
    await page.waitForFunction(initial=>document.querySelector('.detail-frame').clientHeight>initial+700,initial).catch(()=>{throw Error('content did not grow at '+width)});
    await frame.waitForFunction(fits);
    await frame.locator('#shrink').click();
    await page.waitForFunction(initial=>document.querySelector('.detail-frame').clientHeight<initial-1000,initial).catch(()=>{throw Error('content did not shrink at '+width)});
    await frame.waitForFunction(fits);
    check(await frame.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight+1),'no nested document scrolling '+width);
    check(await page.locator('.detail-frame').evaluate(n=>{
      const r=n.getBoundingClientRect(),next=n.nextElementSibling.getBoundingClientRect();
      return next.top>=r.bottom-1&&getComputedStyle(n.nextElementSibling).position==='static';
    }),'attribution follows natural content '+width);
    check(await page.locator('.detail-page > .question-footer').evaluate(n=>{
      const style=getComputedStyle(n);
      return style.position==='static'&&style.maxHeight==='none'&&style.overflowY==='visible'&&n.scrollHeight<=n.clientHeight+1;
    }),'source footer is fully in page flow '+width);
    await frame.locator('#grow').click();
    await frame.waitForFunction(fits);
    await page.locator('.detail-frame').evaluate(n=>scrollTo({top:n.getBoundingClientRect().top+scrollY+100,behavior:'instant'}));
    const before=await page.evaluate(()=>scrollY);
    const box=await page.locator('.detail-frame').boundingBox();
    await page.mouse.move(box.x+box.width/2,300);await page.mouse.wheel(0,250);
    await page.waitForFunction(before=>scrollY>before+50,before).catch(()=>{throw Error('wheel did not reach parent at '+width)});
    check(await frame.evaluate(()=>scrollY===0),'wheel over lesson scrolls parent only '+width);
    await frame.locator('#spacer').evaluate(n=>n.style.height='1200px');
    await frame.waitForFunction(fits);
  }
  await setViewport({width:1362,height:608});
  await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await frame.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY+parseFloat(getComputedStyle(document.body).marginBottom)))<=1);
  await frame.getByRole('button', {name:'Other content'}).click();
  check(await frame.locator('#content').textContent() === 'other', 'child-owned switching');
  await page.evaluate(()=>window.dispatchEvent(new StorageEvent('storage',{key:'opencbt-fe-kihonjoho-theme',newValue:'dark'})));
  await frame.waitForFunction(()=>document.body.dataset.theme==='dark');
  await page.getByRole('button', {name:'通常解説へ戻る'}).click();
  await page.getByRole('button', {name:'詳細解説を見る'}).waitFor();
  check(!page.url().includes('/detail/'), 'return route');
  check(await page.evaluate(()=>document.querySelector('.reading-scroll').scrollTop)===scrollBefore,'reading position restored');
  await page.getByRole('button', {name:'詳細解説を見る'}).click();
  await page.locator('.detail-frame.ready').waitFor();
  await page.goBack();
  await page.getByRole('button', {name:'詳細解説を見る'}).waitFor();
  await page.goForward();
  await page.locator('.detail-frame.ready').waitFor();
  await page.evaluate(()=>location.hash=location.hash.split('?')[0]+'?initial='+encodeURIComponent(JSON.stringify({contentId:'alternate'})));
  await page.locator('.detail-frame.ready').waitFor();
  frame = await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  await frame.locator('#content').filter({hasText:'alternate'}).waitFor();
  await page.reload();
  await page.locator('.detail-frame.ready').waitFor();
  await setViewport({width:390,height:844});
  frame = await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  check(await frame.evaluate(()=>document.documentElement.dataset.overlayScrollbars !== undefined), 'overlay installed');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth), 'mobile overflow');
  await page.screenshot({path:${JSON.stringify(output + "/mobile.png")},fullPage:true});
  const actual = await page.evaluate(async sessionId => {
    const request = indexedDB.open('opencbt-fe-kihonjoho-v2',3);
    const db = await new Promise(resolve=>{request.onsuccess=()=>resolve(request.result);});
    const get=db.transaction('sessions').objectStore('sessions').get(sessionId);
    const saved=await new Promise(resolve=>{get.onsuccess=()=>resolve(get.result);});db.close();
    return {hash:saved.session.entries[0].issuedContent.contentSha256,selected:saved.session.entries[0].selectedChoiceId};
  }, ${JSON.stringify(run.session.id)});
  check(actual.hash===expected.hash && actual.selected===expected.selected,'saved content unchanged');
  await page.getByRole('button',{name:'通常解説へ戻る'}).click();
  await page.getByRole('button',{name:'詳細解説を見る'}).waitFor();
  await page.unroute('**/explanations/question-test/**');
  await page.route('**/explanations/question-test/**',route=>route.fulfill({status:404,body:'missing'}));
  await page.reload();
  await page.locator('.explanation').waitFor();
  await page.waitForTimeout(500);
  check(await page.getByRole('button',{name:'詳細解説を見る'}).count()===0,'missing resource behaves as absent');
  check(await page.locator('.error-banner').count()===0,'optional failure does not invalidate review');
  return 'Detail foundation: natural height, grow/shrink, parent-only wheel scrolling, values, choice IDs, switching, isolation, theme, history, reload, mobile, retention and missing resources passed';
}`);
fs.writeFileSync(`${output}/failures.js`, `async page => {
  ${viewportHelper}
  const resources = ${JSON.stringify(resources)};
  const manifest = JSON.parse(resources['manifest.json']);
  const hash = text => page.evaluate(async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(text)))].map(byte=>byte.toString(16).padStart(2,'0')).join(''), text);
  const saved = () => page.evaluate(async sessionId => {
    const request=indexedDB.open('opencbt-fe-kihonjoho-v2',3);
    const db=await new Promise(resolve=>{request.onsuccess=()=>resolve(request.result);});
    const get=db.transaction('sessions').objectStore('sessions').get(sessionId);
    const value=await new Promise(resolve=>{get.onsuccess=()=>resolve(get.result);});db.close();
    return {status:value.session.status,entry:value.session.entries[0],result:value.result};
  }, ${JSON.stringify(run.session.id)});
  const before=await saved();
  await page.unroute('**/explanations/question-test/**');
  await page.route('**/explanations/question-test/**',route=>{
    const name=new URL(route.request().url()).pathname.split('/').pop();
    return route.fulfill({status:200,contentType:'text/plain',body:resources[name]});
  });
  for (const code of [
    "throw new Error('protocol fixture exception')",
    "Promise.reject(new Error('protocol fixture rejection'))",
    "document.querySelector('#content').textContent='never-ready'",
    "OpenCBTDetail.ready(); setTimeout(()=>location.reload(),100)",
    "const image=new Image(); image.src='data:image/png;base64,AAAA'; document.body.append(image); OpenCBTDetail.ready()",
  ]) {
    resources['main.js']=code;
    manifest.files.find(file=>file.path==='main.js').sha256=await hash(code);
    resources['manifest.json']=JSON.stringify(manifest);
    await page.reload();
    await page.getByRole('button',{name:'詳細解説を見る'}).waitFor();
    await page.getByRole('button',{name:'詳細解説を見る'}).click();
    await page.locator('.explanation').waitFor({state:'visible',timeout:12000});
    if (await page.getByRole('button',{name:'詳細解説を見る'}).count()!==0 ||
      await page.locator('.error-banner').count()!==0 || JSON.stringify(await saved())!==JSON.stringify(before))
      throw Error('optional initialization failure changed review: '+code);
  }
  return 'Initialization exception, Promise rejection, timeout, child navigation and invalid image preserve the complete saved result';
}`);
fs.writeFileSync(`${output}/scroll.js`, `async page => {
  ${viewportHelper}
  const check=(ok,message)=>{if(!ok)throw Error(message)},results=[],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for (const [name,id,pane] of [['sort','question-ipa-2026-a-2','.context-pane'],['arrow','question-ipa-2024-a-13','#inspection-reservation']]) {
    await page.goto(${JSON.stringify(base)}+'#/search/detail/'+id+'?type=detail');
    await page.reload();
    await page.locator('.detail-frame.ready').waitFor();
    const frame=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
    const settle=async()=>{
      await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await frame.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);
    };
    const noNested=async()=>{
      await settle();
      check(await frame.evaluate(()=>scrollY===0&&document.documentElement.scrollHeight<=innerHeight+1),'lesson document scrolls '+name);
      check(await frame.locator(pane).evaluate(n=>getComputedStyle(n).overflowY==='visible'&&n.scrollHeight<=n.clientHeight+1),'explanation scrolls '+name);
      check(await page.locator('.detail-page > .question-footer').evaluate(n=>getComputedStyle(n).position==='static'&&getComputedStyle(n).overflowY==='visible'&&n.scrollHeight<=n.clientHeight+1),'footer scrolls '+name);
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'parent width overflow '+name);
    };
    for(const width of [1362,390,320]) for(const theme of ['light','dark']) {
      await setViewport({width,height:width===1362?608:844});
      await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();
      await frame.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);
      await noNested();
      if(name==='sort') {
        await frame.locator('#first').focus();await frame.locator('#first').press('Enter');
        check(await frame.locator('#seek').inputValue()==='0','playback starts at the first step');
        const next=await frame.locator('#next').boundingBox();
        await page.evaluate(b=>scrollBy({top:b.y+b.height/2-(innerHeight-24),behavior:'instant'}),next);
        await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const edge=await frame.locator('#next').boundingBox();
        await page.mouse.click(edge.x+edge.width/2,edge.y+edge.height/2);
        check(await frame.locator('#seek').inputValue()==='1','pointer reaches the iframe control at the viewport bottom');
        const heights=[];
        for(const tab of ['comparison','question-choices','simulator']) {
          await frame.locator('#tab-'+tab).click();await settle();
          heights.push(await page.locator('.detail-frame').evaluate(n=>n.clientHeight));
        }
        check(new Set(heights).size>1,'lesson height must change with tabs');
        await frame.locator('#algorithm-help summary').click();
      } else {
        // Keep the diagram below the mobile navigation before pointer input.
        await page.locator('.detail-frame').evaluate(n=>scrollTo({top:n.getBoundingClientRect().top+scrollY-140,behavior:'instant'}));
        await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        await frame.locator('[data-id="F"] .edge-label-bg').click();
        await settle();
        check(await frame.locator('[data-id="F"]').getAttribute('aria-pressed')==='true','pointer selects F '+width+' '+theme);
        await frame.locator('.extra summary').click();
      }
      await noNested();
      const before=await page.locator('.detail-frame').evaluate(n=>n.clientHeight);
      const style=await frame.addStyleTag({content:pane+' p,'+pane+' summary{font-size:26px}'});
      await noNested();
      check(await page.locator('.detail-frame').evaluate(n=>n.clientHeight)>=before,'enlarged explanation keeps its natural page height '+name);
      await style.evaluate(n=>n.remove());await noNested();
      if(name==='sort')await frame.locator('#algorithm-help summary').click();
      else {
        await frame.locator('.extra summary').click();await settle();await frame.locator('#close-inspection').click();
        check(await frame.locator('#inspection-panel').getAttribute('hidden')!==null,'inspection closes '+width+' '+theme);
      }
      await noNested();
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.screenshot({path:${JSON.stringify(output)}+'/scroll-'+name+'-'+width+'-'+theme+'.png',fullPage:true});
      if(width===1362)await page.screenshot({path:${JSON.stringify(output)}+'/scroll-'+name+'-short-'+theme+'.png'});
      await frame.locator(pane).scrollIntoViewIfNeeded();
      await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.screenshot({path:${JSON.stringify(output)}+'/scroll-'+name+'-explanation-'+width+'-'+theme+'.png'});
      await page.locator('.detail-page > .question-footer').scrollIntoViewIfNeeded();
      check(await page.locator('.detail-page > .question-footer').evaluate(n=>n.getBoundingClientRect().bottom<=innerHeight+1),'footer reachable with page scrolling '+name);
      results.push({name,width,theme});
    }
  }
  check(!errors.length,'lesson errors: '+errors.join(', '));
  return {singlePageScroll:'passed',tabsAndDisclosureResize:'passed',fontEnlargement:'passed',results,errors};
}`);
const legacyInit = {
  type: "opencbt:detail:init", apiVersion: 1, token: "legacy-fixture",
  context: { apiVersion: 1, theme: "light" }, assets: {},
  html: '<!doctype html><html><body><p style="height:1200px">Legacy fixed-height host</p><script>OpenCBTDetail.ready()</script></body></html>',
  scrollbarCss: fs.readFileSync("src/ui/scrollbars.css", "utf8"),
};
const legacyPage = '<!doctype html><html><body><iframe title="Legacy host" sandbox="allow-scripts" style="height:320px;width:100%" src="' +
  new URL("explanations/host.html", base).href + '"></iframe><script>const frame=document.querySelector("iframe");' +
  'frame.onload=()=>frame.contentWindow.postMessage(' + JSON.stringify(legacyInit).replace(/</g, "\\u003c") + ',"*");' +
  'addEventListener("message",event=>{if(event.source===frame.contentWindow&&event.data.type==="opencbt:detail:ready")document.body.dataset.ready="yes"})</script></body></html>';
fs.writeFileSync(`${output}/legacy.js`, `async page=>{
  await page.unroute('**/explanations/host.html');
  await page.unroute('**/explanations/runtime.js');
  await page.route('**/legacy-detail-host-fixture.html',route=>route.fulfill({status:200,contentType:'text/html',body:${JSON.stringify(legacyPage)}}));
  await page.goto(${JSON.stringify(new URL("legacy-detail-host-fixture.html", base).href)});
  await page.waitForFunction(()=>document.body.dataset.ready==='yes');
  const frame=await (await page.locator('iframe').elementHandle()).contentFrame();
  if(!await frame.evaluate(()=>document.documentElement.scrollHeight>innerHeight&&getComputedStyle(document.documentElement).overflowY!=='clip'))throw Error('legacy parent cannot read its fixed-height frame');
  await frame.evaluate(()=>scrollTo({top:400,behavior:'instant'}));
  if(!await frame.evaluate(()=>scrollY>0))throw Error('legacy iframe cannot scroll');
  return 'Cached legacy app keeps its readable fixed-height iframe while new app bypasses stale host assets';
}`);
console.log(`Playwright CLI fixtures: ${output}/{seed,verify,failures,scroll,legacy}.js (server ${base})`);
