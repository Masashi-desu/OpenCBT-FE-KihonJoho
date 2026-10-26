// Prepare native IndexedDB checks for a named, isolated Playwright CLI profile.
// The harness imports real core modules; it does not fake IndexedDB semantics.
import fs from "node:fs";
const base = process.argv[2] ?? "http://127.0.0.1:5199/";
const out = "output/playwright/storage";
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/harness.html`, '<!doctype html><meta charset="utf-8"><title>Isolated native IndexedDB verification</title><p>Dedicated storage verification context</p>');
fs.writeFileSync(`${out}/initialize.js`, `async page => {
  // Disable only this dedicated page's development hot reload while other year
  // agents edit files. This does not change the server or any user browser.
  await page.unroute('**/@vite/client');
  await page.routeWebSocket(/.*/, () => {});
  await page.goto(${JSON.stringify(base + out + '/harness.html')});
  return page.evaluate(async () => { window.storageHarness = await import('/scripts/storage-browser-harness.ts'); return window.storageHarness.initialize(); });
}`);
fs.writeFileSync(`${out}/acceptance.js`, 'async page => page.evaluate(() => window.storageHarness.acceptance())');
for (const count of [1, 43, 360, 1000]) for (const assets of [false, true])
  fs.writeFileSync(`${out}/v4-${assets ? 'original' : 'generated'}-${count}.js`, `async page => page.evaluate(() => window.storageHarness.scale(${count}, false, ${assets}))`);
for (const count of [43, 360]) for (const assets of [false, true]) {
  fs.writeFileSync(`${out}/seed-v3-${assets ? 'original' : 'generated'}-${count}.js`, `async page => page.evaluate(() => window.storageHarness.seedLegacy(${count}, ${assets}))`);
  fs.writeFileSync(`${out}/v3-${assets ? 'original' : 'generated'}-${count}.js`, `async page => page.evaluate(() => window.storageHarness.scale(${count}, true, ${assets}))`);
}
for (const originals of [false, true])
  fs.writeFileSync(`${out}/wide-${originals ? 'original' : 'generated'}-43.js`, `async page => page.evaluate(() => window.storageHarness.wideScale(43, ${originals}))`);
fs.writeFileSync(`${out}/app.js`, `async page => {
  const errors=[]; page.on('pageerror',e=>errors.push(e.message)); const base=${JSON.stringify(base)};
  const ready=async()=>{await page.locator('.loading-bar').waitFor({state:'hidden'});if(await page.locator('.error-banner').count())throw Error(await page.locator('.error-banner').innerText());};
  await page.goto(base+"output/playwright/storage/harness.html");
  await page.addInitScript(()=>{window.__storageProgress=[];new MutationObserver(()=>{const text=document.querySelector('.loading-bar')?.textContent;if(text?.includes('保存した学習記録を確認しています')&&window.__storageProgress.at(-1)!==text)window.__storageProgress.push(text);}).observe(document,{subtree:true,childList:true,characterData:true});});
  const start=Date.now();await page.goto(base+'#/menu');await page.getByRole('button',{name:'開始前の説明へ',exact:true}).waitFor();await ready();const menuMs=Date.now()-start,progress=await page.evaluate(()=>window.__storageProgress);
  const reload=Date.now();await page.reload();await page.getByRole('button',{name:'開始前の説明へ',exact:true}).waitFor();await ready();const menuReloadMs=Date.now()-reload;
  const historyStart=Date.now();await page.getByRole('button',{name:'履歴・復習',exact:true}).click();await page.locator('.history-card').first().waitFor();await ready();const historyMs=Date.now()-historyStart,count=await page.locator('.history-card').count();
  const restore=Date.now();await page.locator('.history-card').first().getByRole('button',{name:'結果・復習',exact:true}).click();await page.locator('.result-card').waitFor();await ready();await page.getByRole('button',{name:'回答を順番に確認する',exact:true}).click();await page.locator('.answer-choices').waitFor();const reviewMs=Date.now()-restore;
  const reviewReload=Date.now();await page.reload();await page.locator('.answer-choices').waitFor();await ready();const reviewReloadMs=Date.now()-reviewReload;
  await page.goto(base+'#/search/question/question-ipa-sample-2022-dec-a-1');await page.getByRole('button',{name:'類題を解く',exact:true}).waitFor();const begin=Date.now();await page.getByRole('button',{name:'類題を解く',exact:true}).click();await page.waitForURL(/#\\/exam\\//);await page.locator('.answer-choices').waitFor();await ready();const beginGeneratedMs=Date.now()-begin;
  if(errors.length)throw Error(errors.join(';'));return{count,menuMs,menuReloadMs,historyMs,reviewMs,reviewReloadMs,beginGeneratedMs,progress:{updates:progress.length,first:progress[0],last:progress.at(-1)},errors};
}`);
console.log(`Prepared native storage checks in ${out}; initialize, acceptance, each scale, and app checks run in the same dedicated headless session.`);
fs.writeFileSync(`${out}/failure.js`, `async page => {
 const base=${JSON.stringify(base)};
 await page.evaluate(()=>sessionStorage.removeItem('storage-abort-once'));
 await page.evaluate(()=>window.storageHarness.seedLegacy(1,true));
 await page.addInitScript(()=>{if(sessionStorage.getItem('storage-abort-once'))return;const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){const result=key===undefined?put.call(this,value):put.call(this,value,key);if(this.name==='catalogSnapshots'&&value.bundleKey){sessionStorage.setItem('storage-abort-once','1');IDBObjectStore.prototype.put=put;this.transaction.abort();}return result;};});
 await page.goto(base+'#/menu');await page.locator('.error-banner').waitFor();await page.locator('.loading-bar').waitFor({state:'hidden'});const failed=await page.locator('.error-banner').innerText();if(!failed.includes('起動に必要なデータを確認できません'))throw Error(failed);
 const legacyPreserved=await page.evaluate(()=>new Promise((resolve,reject)=>{const opening=indexedDB.open('opencbt-fe-kihonjoho-v2');opening.onsuccess=()=>{const db=opening.result,r=db.transaction('catalogSnapshots').objectStore('catalogSnapshots').get('session-storage-10000');r.onsuccess=()=>{resolve(Boolean(r.result?.bundle));db.close();};r.onerror=()=>reject(r.error);};}));if(!legacyPreserved)throw Error('failed migration lost legacy snapshot');
 await page.reload();await page.getByRole('button',{name:'開始前の説明へ',exact:true}).waitFor();await page.locator('.loading-bar').waitFor({state:'hidden'});if(await page.locator('.error-banner').count())throw Error('retry error remains');
 await page.route('**/data/catalog.json',route=>route.abort('internetdisconnected'));await page.reload();await page.locator('.error-banner').waitFor();await page.locator('.loading-bar').waitFor({state:'hidden'});const network=await page.locator('.error-banner').innerText();if(!network.includes('起動に必要なデータを確認できません'))throw Error(network);
 await page.unroute('**/data/catalog.json');await page.reload();await page.getByRole('button',{name:'開始前の説明へ',exact:true}).waitFor();await page.locator('.loading-bar').waitFor({state:'hidden'});if(await page.locator('.error-banner').count())throw Error('network retry error remains');
 return {failed,legacyPreserved,retry:true,network,networkRetry:true,busyCleared:true};
}`);
