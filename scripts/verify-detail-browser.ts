// Produce Playwright CLI fixtures only under ignored output/. No lesson files are distributed.
import fs from "node:fs";
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
  "index.html": '<!doctype html><html lang="ja"><head><title>Protocol fixture</title><link rel="stylesheet" href="style.css"></head><body><h2>Protocol fixture</h2><p id="content"></p><button id="switch">Other content</button><pre id="values"></pre><p id="isolation"></p><div style="height:1200px"></div><script src="main.js"></script></body></html>',
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
  await page.goto(${JSON.stringify(base)});
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
  const expected = ${JSON.stringify(expected)};
  const scrollBefore = await page.evaluate(() => {
    const pane=document.querySelector('.reading-scroll'); pane.scrollTo({top:120,behavior:'instant'});
    return pane.scrollTop;
  });
  const check = (condition, message) => { if (!condition) throw Error(message); };
  await page.getByRole('button', {name:'詳細解説を見る'}).click();
  await page.locator('.detail-frame.ready').waitFor();
  let frame = page.frames().find(frame=>frame.url().includes('/explanations/host.html'));
  check(await frame.locator('#content').textContent() === 'first', 'initial content');
  const values = JSON.parse(await frame.locator('#values').textContent());
  check(JSON.stringify(values.generation.parameters) === JSON.stringify(expected.parameters), 'saved parameters');
  check(JSON.stringify(values.choiceOrder.map(choice=>choice.id)) === JSON.stringify(expected.choices), 'choice order');
  check(values.selectedChoiceId === expected.selected, 'saved answer');
  const isolation = JSON.parse(await frame.locator('#isolation').textContent());
  check(isolation.parentBlocked && isolation.storageBlocked && isolation.frozen, 'isolation and immutable context');
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
  frame = page.frames().find(frame=>frame.url().includes('/explanations/host.html'));
  await frame.locator('#content').filter({hasText:'alternate'}).waitFor();
  await page.reload();
  await page.locator('.detail-frame.ready').waitFor();
  await page.setViewportSize({width:390,height:844});
  frame = page.frames().find(frame=>frame.url().includes('/explanations/host.html'));
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
  return 'Detail foundation: values, choice IDs, switching, isolation, theme, history, reload, mobile, retention and missing resources passed';
}`);
fs.writeFileSync(`${output}/failures.js`, `async page => {
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
console.log(`Playwright CLI fixture scripts: ${output}/seed.js, verify.js and failures.js (server ${base})`);
