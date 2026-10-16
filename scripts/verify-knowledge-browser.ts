// Produces a check for an owned, isolated headless Playwright CLI session.
import fs from "node:fs";
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, appendRunQuestion, validateRun } from "../src/core/session";

const url = process.argv[2] ?? "http://127.0.0.1:5191/";
const directory = "output/playwright/knowledge-quality";
fs.mkdirSync(directory, { recursive: true });
const bundle = fixture();
const runs = [];
for (const source of ["2024-a-5", "2024-a-10", "2025-a-1", "2026-a-11", "2026-a-12"]) {
  const original = bundle.questions.find(q => q.id === `question-ipa-${source}`)!;
  let run = startRun(await prepareRun(bundle, {
    subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values",
    bookmarkQuestionRef: { questionId: original.id, revision: original.revision },
  }, {}));
  const subjects = new Map<number, number>();
  for (let attempt = 0; attempt < 64 && subjects.size < 4; attempt++) {
    if (attempt) run = await appendRunQuestion(run);
    const index = run.instances.length - 1;
    subjects.set(run.instances[index].parameters.values[0], index);
  }
  if (subjects.size !== 4) throw Error(`Missing knowledge subject: ${source}`);
  await validateRun(run);
  const cases = [...subjects.entries()].map(([target, index]) => ({
    target, index, prompt: run.issued[index].prompt.blocks.map(b => "text" in b ? b.text : "").join(""),
  }));
  const { bundle: _bundle, assets: _assets, ...saved } = run;
  runs.push({ source, run: saved, cases });
}
fs.writeFileSync(`${directory}/verify.js`, `async page => {
  const check = (ok, message) => { if (!ok) throw Error(message); };
  const errors = [], bundle = ${JSON.stringify(bundle)}, runs = ${JSON.stringify(runs)};
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(${JSON.stringify(url)});
  await page.getByRole('button', {name:'開始前の説明へ', exact:true}).waitFor();
  await page.evaluate(async ({bundle, runs}) => {
    const request = indexedDB.open('opencbt-fe-kihonjoho-v2', 3);
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const tx = db.transaction(['catalogSnapshots', 'generatedInstances', 'sessions'], 'readwrite');
    for (const {run} of runs) {
      tx.objectStore('catalogSnapshots').put({id:run.session.id, bundle, assets:{}});
      for (const instance of run.instances) tx.objectStore('generatedInstances').put(instance);
      tx.objectStore('sessions').put({id:run.session.id, ...run, title:run.set.title});
    }
    await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close();
  }, {bundle, runs});
  let cases = 0;
  for (const width of [1440, 390]) for (const theme of ['light', 'dark']) {
    await page.setViewportSize({width, height:900});
    await page.evaluate(theme => localStorage.setItem('opencbt-fe-kihonjoho-theme', theme), theme);
    await page.reload();
    for (const {source, run, cases: subjects} of runs) {
      await page.goto(${JSON.stringify(url + "#/exam/")} + run.session.id);
      await page.reload();
      await page.locator('.answer-choices').waitFor();
      await page.getByRole('button', {name:'再開', exact:true}).first().click();
      await page.waitForFunction(() => document.querySelector('.answer-choices')?.disabled === false);
      for (const subject of subjects) {
        await page.getByRole('button', {name:new RegExp('^問題 ' + (subject.index + 1) + '、')}).click();
        await page.waitForFunction(expected => document.querySelector('.reading-content')?.textContent === expected, subject.prompt);
        check(await page.locator('.answer-choice').count() === 4, source + ' four choices');
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), source + ' page overflow');
        check(await page.locator('.choice-body').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1)), source + ' choice overflow');
        check((await page.locator('.question-footer').innerText()).includes('改変あり'), source + ' attribution');
        if (source === '2025-a-1' && subject.target === 1)
          check(!(await page.locator('.reading-content').innerText()).includes('表現や規則'), 'pretraining clue');
        if ((source === '2025-a-1' && subject.target === 1) || (source === '2024-a-5' && subject.target === 0))
          await page.screenshot({path:'${directory}/' + source + '-' + width + '-' + theme + '.png', fullPage:true});
        cases++;
      }
    }
  }
  check(errors.length === 0, 'browser exceptions: ' + errors.join(', '));
  return {series:5, subjects:20, cases, widths:[1440,390], themes:['light','dark'], errors};
}`);
console.log(`Generated ${directory}/verify.js for 20 actual generated subjects.`);
