// Generate scenario scripts for a dedicated headless Playwright CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture, installFixtureGenerators } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";

const url = new URL(process.argv[2] ?? "http://127.0.0.1:5196/").href;
const output = "output/playwright/led", target = "question-ipa-2016h28a-fe-am-21";
fs.mkdirSync(output, { recursive: true });
const setup = `page.setDefaultTimeout(15000);
  ${viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(5000,size.height+200)")}
  const check = (pass, message) => { if (!pass) throw Error(message); };
  const frame = async () => {
    const node = page.locator('.detail-frame.ready'); await node.waitFor();
    return (await node.elementHandle()).contentFrame();
  };
  const settle = f => f.waitForFunction(() => Math.abs(innerHeight - Math.ceil(document.body.getBoundingClientRect().bottom + scrollY)) <= 1);`;

fs.writeFileSync(output + "/verify.js", `async page => {
  ${setup}
  const origin = ${JSON.stringify(url)}, destination = origin + '#/search/detail/${target}', output = ${JSON.stringify(output)};
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const [width, theme] of [[1280,'light'],[1280,'dark'],[390,'light'],[320,'dark']]) {
    await setViewport({width, height: 680});
    await page.goto(origin);
    await page.evaluate(t => localStorage.setItem('opencbt-fe-kihonjoho-theme',t), theme);
    await page.goto('about:blank'); await page.goto(destination);
    const f = await frame(), input = f.locator('#hex'), seek = f.locator('#seek'), comparison = f.locator('#comparison');
    check(await f.locator('html').getAttribute('data-theme') === theme, 'theme');
    check(await f.locator('#standalone-title').isHidden() && await f.locator('#standalone-credit').isHidden(), 'host owns title and sources');
    check(await input.inputValue() === '92', 'original byte');
    const diagram = f.locator('#diagram'), next = f.locator('#next'), prev = f.locator('#prev');
    const states = () => f.locator('#led-display .segment').evaluateAll(ns => Object.fromEntries(ns.map(n => [n.dataset.segment, n.dataset.state])));
    const wiring = () => f.locator('.wire-row').evaluateAll(ns => ns.map(n => ({
      port: Number(n.dataset.port), terminal: n.dataset.terminal, state: n.dataset.state,
      phase: n.dataset.phase, flowing: getComputedStyle(n.querySelector('.wire-arrow')).display !== 'none',
      digit: n.querySelector('strong').textContent,
    })));
    const geometry = () => f.evaluate(() => ['#diagram','.navigation','.circuit','.wire-bank','#led-display','.supply-label'].map(s => {
      const r = document.querySelector(s).getBoundingClientRect(); return [r.top + scrollY, r.height, r.width];
    }));
    const saved = [], savedWiring = [], differences = [['b','f','Dt'], ['a','b','d'], [], ['e','Dt']];
    await settle(f);
    if (width === 1280) {
      await diagram.locator('.segment[data-segment=f]').click();
      check(await seek.inputValue() === '5' && await f.locator('#terminal-5').evaluate(n => document.activeElement === n), 'direct SVG click and focus');
    } else {
      await f.locator('#port-0 .wire-line').click();
      check(await seek.inputValue() === '10', 'click a wire on the narrow layout');
    }
    for (const font of [100,200]) {
      await f.evaluate(v => { document.documentElement.style.fontSize = v + '%'; }, font);
      await f.locator('#reset').press('Enter'); await settle(f);
      const baseline = await geometry();
      const supplyText = f.locator('.supply-label > span');
      const highlightedSize = await supplyText.evaluate(n => parseFloat(getComputedStyle(n).fontSize));
      const stable = async () => {
        await settle(f);
        const current = await geometry();
        check(current.every((rect,i) => rect.every((value,j) => Math.abs(value-baseline[i][j]) < 1)), 'stable ' + JSON.stringify({width,theme,font,baseline,current}));
        check(await f.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), 'iframe width');
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), 'page width');
        check(await f.locator('button,input').evaluateAll(ns => ns.every(n => {
          const r=n.getBoundingClientRect(); return !r.height || (r.width >= 43.5 && r.height >= 43.5 && n.scrollWidth <= n.clientWidth+1);
        })), '44px controls and unclipped labels ' + width + '/' + font);
      };
      for (let step = 0; step <= 11; step++) {
        if (step) await next.press('Enter');
        await stable();
        check(await seek.inputValue() === String(step), 'navigation step');
        check(await comparison.isVisible() === (step === 11), 'comparison only at completion');
        const result = await states();
        const rows = await wiring();
        const bits = await diagram.locator('.bit').evaluateAll(ns => ns.map(n => [n.id, n.querySelector('strong').textContent, n.dataset.phase]));
        check(bits.map(bit => bit[0]).join(',') === 'bit-7,bit-6,bit-5,bit-4,bit-3,bit-2,bit-1,bit-0', 'binary is MSB first');
        const supplyActive = step === 0 || (step >= 3 && step <= 10 && '10010010'[step-3] === '0');
        check(await f.locator('#supply').getAttribute('data-active') === String(supplyActive), 'Vcc at reading or active current');
        const fontSize = await supplyText.evaluate(n => parseFloat(getComputedStyle(n).fontSize));
        check(supplyActive ? fontSize === highlightedSize : fontSize < highlightedSize, 'Vcc changes size inside reserved space');
        for (const [n, terminal] of ['a','b','c','d','e','f','g','Dt'].entries()) {
          const row = rows[n], digit = step >= (n >= 4 ? 1 : 2) ? '01001001'[n] : '–';
          const phase = step === 10 - n ? 'current' : (step === 1 && n >= 4 || step === 2 && n <= 3) ? 'conversion' : '';
          check(row.port === n && row.terminal === terminal && row.state === result[terminal], 'wire from P' + n + ' to ' + terminal);
          check(row.phase === phase && bits[7-n][2] === phase && row.digit === digit && bits[7-n][1] === digit, 'bit assignment P' + n + ' at ' + step);
          check(row.flowing === (phase === 'current' && digit === '0'), 'arrow only for active-low current');
        }
        for (const [index, segment] of [...'gfedcba'].map((s,i) => [i+1,s]).concat([[0,'Dt']])) {
          check(result[segment] === (step < index+3 ? 'pending' : '10010010'[index] === '0' ? 'on' : 'off'), 'state ' + segment);
        }
        if (step >= 3 && step <= 10) {
          check(await diagram.locator('[aria-current=step]').count() === 2, 'current endpoint pair');
          check(await f.locator('#port-' + (10-step)).getAttribute('aria-current') === 'step', 'current port');
        }
        if (font === 100 && width === 1280 && theme === 'light' && [0,1,3,5].includes(step)) {
          await page.screenshot({path: output + '/step-' + step + '-desktop.png', fullPage: true});
        }
        saved[step] = JSON.stringify(result);
        savedWiring[step] = JSON.stringify(rows);
      }
      check((await f.locator('#step-text').innerText()).includes('ウの図と一致'), 'original correct choice');
      const choices = comparison.locator('button');
      for (let i=0; i<4; i++) {
        const button = choices.nth(i); await button.press('Space'); await stable();
        const changed = await diagram.locator('.segment[data-different=true]').evaluateAll(ns => ns.map(n => n.dataset.segment));
        check(JSON.stringify(changed) === JSON.stringify(differences[i]), 'choice differences ' + i);
        const wireDifferences = await diagram.locator('.wire-row[data-different=true]').evaluateAll(ns => ns.map(n => n.dataset.terminal));
        check(JSON.stringify(wireDifferences) === JSON.stringify(changed), 'difference follows wiring');
        if (i === 0 && (font === 100 && width === 1280 && theme === 'light' || width === 320)) {
          await page.screenshot({path: output + '/choice-' + width + '-' + font + '.png', fullPage: true});
          if (width === 320) {
            await button.scrollIntoViewIfNeeded();
            await page.screenshot({path: output + '/choice-controls-' + font + '.png'});
          }
        }
        await button.press(i % 2 ? 'Space' : 'Escape');
        check(await button.evaluate(n => document.activeElement === n && n.getAttribute('aria-pressed') === 'false'), 'close selection and focus');
      }
      for (let step=10; step>=0; step--) {
        await prev.press('Enter');
        check(JSON.stringify(await states()) === saved[step], 'reverse result');
        check(JSON.stringify(await wiring()) === savedWiring[step], 'reverse wiring');
      }
      await f.locator('#port-7').press('Enter'); check(await seek.inputValue() === '3', 'port jump');
      await f.locator('#terminal-0').press('Space'); check(await seek.inputValue() === '10', 'terminal jump');
      await seek.press('End'); await choices.first().press('Enter');
      await input.fill('９２'); check(await choices.first().getAttribute('aria-pressed') === 'true', 'same value preserves comparison');
      await input.fill('9'); await stable();
      check(await f.locator('#hex-error').isVisible() && JSON.stringify(await states()) === saved[11], 'incomplete keeps state');
      if (width === 320 && font === 100) await page.screenshot({path: output + '/invalid-mobile.png', fullPage: true});
      await input.dispatchEvent('compositionstart'); await input.fill('00');
      check(JSON.stringify(await states()) === saved[11], 'composition does not update'); await input.dispatchEvent('compositionend');
      check(await f.locator('#hex-error').isHidden() && Object.values(await states()).every(x => x==='on'), '00: all on');
      check(await choices.first().getAttribute('aria-pressed') === 'false', 'new value clears comparison');
      await input.fill('fF'); await stable();
      check(Object.values(await states()).every(x => x==='off'), 'FF: all off');
      await f.locator('#port-7').press('Enter');
      check((await wiring()).every(row => !row.flowing), 'FF: no current');
      await input.fill('00');
      check((await wiring()).filter(row => row.flowing).map(row => row.port).join(',') === '7', '00: current at selected port');
      await input.fill('FF'); await seek.press('End');
      check((await f.locator('#step-text').innerText()).includes('一致する選択肢はありません'), 'no matches');
      await f.locator('#reset').press('Enter'); await stable();
      check(await input.inputValue() === '92' && await comparison.isHidden(), 'reset, height shrinks');
      check(await f.evaluate(() => ![...document.querySelectorAll('body *')].some(n =>
        ['auto','scroll'].includes(getComputedStyle(n).overflowY) && n.scrollHeight>n.clientHeight+2 && !n.matches('input'))), 'no nested vertical scroll');
    }
    await page.locator('.detail-page .question-footer.expanded').scrollIntoViewIfNeeded();
    check(await page.locator('.detail-references').isVisible() && await page.locator('.footer-changes').isVisible(), 'sources, modification and references');
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
    await page.getByRole('button',{name:'詳細解説を見る',exact:true}).click(); await frame();
    checks.push({width,theme,fonts:[100,200],steps:12});
  }
  await page.goto(origin + '#/search?q=7セグメントLED&type=detail');
  await page.getByRole('link',{name:'7セグメントLEDの点灯判定',exact:true}).click(); await frame();
  await page.goto(origin + 'explanations/ipa-2016-autumn-am-21/index.html');
  check(await page.locator('#standalone-title').isVisible() && await page.locator('#standalone-credit').isVisible(), 'standalone source');
  check(!errors.length, errors.join(', ')); return checks;
}`);

await installFixtureGenerators();
const bundle = fixture(), q = bundle.questions.find(q => q.id === target)!;
const runs = new Map<number, Awaited<ReturnType<typeof finishRun>>>();
const wanted = new Set([2, 7]);
for (let attempt = 0; attempt < 80 && runs.size < wanted.size; attempt++) {
  let run = startRun(await prepareRun(bundle, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values",
    bookmarkQuestionRef: { questionId: q.id, revision: q.revision } }, {}));
  const index = run.instances[0].parameters.values[0];
  if (!wanted.has(index) || runs.has(index)) continue;
  run = updateAnswer(run, run.issued[0].choices[0].id);
  run.session.entries[0].revealed = true;
  run = finishRun(run, "completed"); await validateRun(run); runs.set(index, run);
}
if (runs.size !== wanted.size) throw Error("Missing generated LED inputs");
const savedRuns = [...runs.values()].map(({ bundle: _bundle, ...run }) => run);
fs.writeFileSync(output + "/saved-fixtures.json", JSON.stringify({ bundle, runs: savedRuns }));
fs.writeFileSync(output + "/saved.js", `async page => {
  ${setup}
  const origin = ${JSON.stringify(url)}, results = [];
  await setViewport({width: 900, height: 680}); await page.goto(origin);
  const runs = await page.evaluate(async () => {
    const response = await fetch('/output/playwright/led/saved-fixtures.json');
    if (!response.ok) throw Error('Missing local saved-fixtures.json');
    const {bundle,runs} = await response.json();
    const open = indexedDB.open('opencbt-fe-kihonjoho-v2'), db = await new Promise((resolve,reject) => { open.onsuccess=()=>resolve(open.result); open.onerror=reject; });
    const tx = db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    for (const run of runs) {
      tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle,assets:{}});
      for(const i of run.instances) tx.objectStore('generatedInstances').put(i);
      tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});
      tx.objectStore('results').put(run.result);
    }
    await new Promise((resolve,reject) => {tx.oncomplete=resolve;tx.onerror=reject;}); db.close();
    return runs;
  });
  for (const run of runs) {
    await page.goto('about:blank'); await page.goto(origin+'#/detail/'+run.session.id+'/0/review');
    const f = await frame(), context = await f.evaluate(() => window.OpenCBTDetail.context), before = JSON.stringify(context);
    const index = run.instances[0].parameters.values[0], expected = index === 2 ? '80' : '79';
    check(context.generation.parameters.values[0] === index && await f.locator('#hex').inputValue() === expected, 'saved byte');
    await f.locator('#seek').press('End');
    check(await f.locator('#choices button strong').allTextContents().then(a => a.join('') === context.choiceOrder.map(c => c.label).join('')), 'saved order');
    for (const [i, choice] of context.choiceOrder.entries()) {
      const mask = context.question.choices.find(c => c.id === choice.id).content.blocks[0].scene.values[0];
      const actual = await f.locator('#choices button').nth(i).locator('.segment').evaluateAll(ns => ns.reduce((m,n,i) => m + (n.dataset.state==='on' ? 2**i : 0),0));
      check(actual === mask, 'saved choice drawing');
    }
    await f.locator('#hex').fill('00');
    check(await f.evaluate(() => JSON.stringify(window.OpenCBTDetail.context)) === before, 'frozen context');
    await f.locator('#reset').press('Enter'); check(await f.locator('#hex').inputValue() === expected, 'saved reset');
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
    const saved = await page.evaluate(async id => {
      const open=indexedDB.open('opencbt-fe-kihonjoho-v2'), db=await new Promise(r=>open.onsuccess=()=>r(open.result));
      const req=db.transaction('sessions').objectStore('sessions').get(id), record=await new Promise(r=>req.onsuccess=()=>r(req.result));
      db.close(); return record;
    },run.session.id);
    for(const [a,b] of [[saved.issued,run.issued],[saved.session.entries,run.session.entries],[saved.result,run.result]]) check(JSON.stringify(a)===JSON.stringify(b),'saved problem, answers and result intact');
    results.push({index, expected});
  }
  return results;
}`);
console.log(`Generated ${output}/verify.js and saved.js for a dedicated headless Playwright CLI session.`);
