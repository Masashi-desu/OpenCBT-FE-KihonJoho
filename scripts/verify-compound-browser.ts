// Generates a CLI-driven check using synthetic data in an isolated context.
// Only this browser's catalog response and IndexedDB are changed.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { compoundRun } from "../tests/fixtures/compound-question";
import { startRun, validateRun } from "../src/core/session";
import { validateBundle } from "../src/core/validation";

const url = process.argv[2] ?? "http://127.0.0.1:5199/";
const directory = "output/playwright/compound-answers";
fs.mkdirSync(directory, { recursive: true });
const digest = (text: string) => createHash("sha256").update(text).digest("hex");
const cases = [];
for (const width of [1440, 390, 320]) for (const theme of ["light", "dark"]) {
  const run = startRun(await compoundRun(false, Date.now()));
  run.set.title = "複数解答欄の検証";
  const questionRaw = JSON.stringify(run.issued[0]), file = "questions/test-compound.json";
  run.bundle.catalog = structuredClone(run.bundle.catalog);
  run.bundle.catalog.files.questions.push({ path: file, sha256: digest(questionRaw) });
  run.bundle.catalog.revision++;
  const catalogRaw = JSON.stringify(run.bundle.catalog);
  run.bundle.catalogHash = digest(catalogRaw);
  run.session.snapshot.catalogRevision = run.bundle.catalog.revision;
  run.session.snapshot.catalogSha256 = run.bundle.catalogHash;
  await validateBundle(run.bundle);
  await validateRun(run);
  const { bundle, assets: _assets, ...saved } = run;
  cases.push({ width, theme, run: saved, bundle, questionRaw, catalogRaw });
}
fs.writeFileSync(`${directory}/cases.json`, JSON.stringify(cases));
const payloadURL = new URL("@fs/" + path.resolve(`${directory}/cases.json`).replace(/^\//, ""), url).href;
fs.writeFileSync(`${directory}/verify.js`, `async page => {
  const check=(ok,message)=>{if(!ok)throw Error(message)}, errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const cases=await (await page.request.get(${JSON.stringify(payloadURL)})).json(), url=${JSON.stringify(url)};
  let current=cases[0];
  await page.route('**/data/catalog.json',route=>route.fulfill({contentType:'application/json',body:current.catalogRaw}));
  await page.route('**/data/questions/test-compound.json',route=>route.fulfill({contentType:'application/json',body:current.questionRaw}));
  await page.goto(url);
  await page.getByRole('button',{name:'開始前の説明へ',exact:true}).waitFor();
  const install=async value=>page.evaluate(async value=>{
    localStorage.setItem('opencbt-fe-kihonjoho-theme',value.theme);
    const request=indexedDB.open('opencbt-fe-kihonjoho-v2',3);
    const db=await new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
    const tx=db.transaction(['catalogSnapshots','sessions'],'readwrite');
    tx.objectStore('catalogSnapshots').put({id:value.run.session.id,bundle:value.bundle,assets:{}});
    tx.objectStore('sessions').put({id:value.run.session.id,...value.run,title:value.run.set.title});
    await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();
  },value);
  const choose=async(part,choice)=>page.locator('label').filter({has:page.locator('input[name="answer-'+part+'"][value="'+choice+'"]')}).click();
  const resume=async()=>{
    const button=page.getByRole('button',{name:'再開',exact:true}).first();
    if(await page.locator('.answer-choices').first().evaluate(el=>el.disabled)) {
      if(!await button.isVisible())await page.getByRole('button',{name:'学習メニューを開く',exact:true}).click();
      await button.click();
    }
    await page.waitForFunction(()=>document.querySelector('.answer-choices')?.disabled===false);
  };
  for(const value of cases){
    current=value;
    await page.setViewportSize({width:value.width,height:900});
    await install(value);
    await page.goto(url+'#/exam/'+value.run.session.id);await page.reload();
    await page.locator('.compound-answers').waitFor();await resume();
    check(await page.locator('.answer-choices').count()===4,'four answer groups');
    check(!(await page.locator('.compound-answers').innerText()).includes('採点対象外'),'answers hidden');
    await choose('part-a','choice-two');await choose('part-b','choice-three');await choose('part-c','choice-one');
    await choose('part-a','choice-two');
    await page.reload();await page.locator('.compound-answers').waitFor();await resume();
    check(!await page.locator('input[name="answer-part-a"]:checked').count(),'cleared slot persisted');
    check(await page.locator('input[name="answer-part-b"]:checked').inputValue()==='choice-three','unordered slot retained');
    check(await page.locator('input[name="answer-part-c"]:checked').inputValue()==='choice-one','unordered swapped slot retained');
    await choose('part-a','choice-two');await choose('part-f','choice-three');
    const reveal=page.getByRole('button',{name:'正答を見る',exact:true});
    if(!await reveal.isVisible())await page.getByRole('button',{name:'学習メニューを開く',exact:true}).click();
    await reveal.click();
    check((await page.locator('.compound-answers').innerText()).includes('順不同'),'unordered answers visible');
    check((await page.locator('.compound-answers').innerText()).includes('採点対象外'),'no-correct-answer excluded');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page overflow '+value.width);
    check(await page.locator('.choice-body').evaluateAll(nodes=>nodes.every(n=>n.scrollWidth<=n.clientWidth+1)),'choice overflow');
    await page.screenshot({path:'${directory}/'+value.width+'-'+value.theme+'.png',fullPage:true});
    await page.getByRole('button',{name:'終了',exact:true}).click();
    await page.getByRole('button',{name:'終了して結果を見る',exact:true}).click();
    await page.locator('.result-card').waitFor();
    check((await page.locator('.accuracy').innerText()).includes('100'),'whole-question accuracy');
    check((await page.locator('.result-card').innerText()).includes('正解3／採点対象3欄'),'part totals');
    await page.reload();await page.locator('.result-card').waitFor();
    check((await page.locator('.result-card').innerText()).includes('採点対象外1'),'excluded count survives reload');
    await page.locator('.result-row').first().click();
    await page.locator('.compound-answers').waitFor();
    check(await page.locator('.answer-choices:disabled').count()===4,'review read-only');
    check((await page.locator('.compound-answers').innerText()).includes('あなたの解答'),'review answers visible');
  }
  check(!errors.length,'browser exceptions: '+errors.join(','));
  return {cases:cases.length,widths:[1440,390,320],themes:['light','dark'],reload:true,review:true,errors};
}`);
console.log(`Generated ${directory}/verify.js for six isolated browser cases.`);
