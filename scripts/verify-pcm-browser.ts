// Generate scenarios for a dedicated headless Chromium session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture, installFixtureGenerators } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";

const url = new URL(process.argv[2] ?? "http://127.0.0.1:5197/").href;
const output = "output/playwright/pcm", id = "question-ipa-2016h28h-fe-am-4";
fs.mkdirSync(output, { recursive: true });
const setup = `page.setDefaultTimeout(15000);
  ${viewportHelper.replace("Math.max(1800,size.height+200)", "Math.max(5000,size.height+200)")}
  const url = ${JSON.stringify(url)}, output = ${JSON.stringify(output)};
  const check = (value, message) => { if (!value) throw Error(message); };
  const detail = async () => {
    const node = page.locator('.detail-frame.ready'); await node.waitFor();
    return (await node.elementHandle()).contentFrame();
  };
  const settle = async frame => {
    // Keep the iframe onscreen while its ResizeObserver and animation frame report height.
    const iframe = page.locator('.detail-frame.ready');
    await iframe.evaluate(node => {
      const rect = node.getBoundingClientRect();
      if (Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0) < 120) node.scrollIntoView({block:'start'});
    });
    try {
      await frame.waitForFunction(() => Math.abs(innerHeight - Math.ceil(document.body.getBoundingClientRect().bottom + scrollY)) <= 1,
        undefined, {polling:50,timeout:5000});
    } catch (error) {
      const viewport = await iframe.evaluate(n => ({top:n.getBoundingClientRect().top,bottom:n.getBoundingClientRect().bottom,view:innerHeight}));
      const body = await frame.evaluate(() => ({innerHeight,scrollY,body:document.body.getBoundingClientRect().bottom,
        step:document.querySelector('#seek').value,font:getComputedStyle(document.documentElement).fontSize}));
      throw Error(error.message + ' ' + JSON.stringify({viewport,body}));
    }
  };`;

fs.writeFileSync(output + "/verify.js", `async page => {
  ${setup}
  const errors = [], results = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1280,390,320]) for (const theme of ['light','dark']) {
    await setViewport({width,height:680});
    await page.goto(url);
    await page.evaluate(value => localStorage.setItem('opencbt-fe-kihonjoho-theme', value), theme);
    await page.goto('about:blank');
    await page.goto(url + '#/search/detail/${id}');
    const frame = await detail(), el = id => frame.locator('#' + id), seek = el('seek'), formula = el('formula');
    check(await frame.locator('html').getAttribute('data-theme') === theme, 'theme');
    check(await el('standalone-title').isHidden() && await el('standalone-credit').isHidden(), 'host owns title and attribution');
    for (const font of [100,200]) {
      await frame.evaluate(value => document.documentElement.style.fontSize = value + '%', font);
      await seek.press('Home'); await settle(frame);
      const geometry = () => frame.evaluate(() => ['#diagram','.graph','.navigation'].map(s => {
        const r = document.querySelector(s).getBoundingClientRect(); return [r.y + scrollY,r.height,r.width];
      }));
      const start = await geometry();
      const stable = async () => {
        await settle(frame);
        const actual = await geometry();
        check(actual.every((rect,i) => rect.every((v,j) => Math.abs(v-start[i][j]) < 1)),
          'stable graph and navigation ' + JSON.stringify({width,theme,font,start,actual}));
        check(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'iframe horizontal fit');
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'page horizontal fit');
        check(await frame.locator('button,input').evaluateAll(controls => controls.every(n => {
          const r = n.getBoundingClientRect(); return !r.height || (r.width >= 43.5 && r.height >= 43.5 && n.scrollWidth <= n.clientWidth + 1);
        })), 'touch targets and label fit ' + [width,theme,font]);
      };
      check(await el('samples').isHidden() && await formula.isHidden(), 'continuous waveform first');
      const equations = ['','0 → Δt → 2 × Δt','段階','ビット','8,000 標本／秒','0.000125 秒','125 μs'];
      const term = kind => formula.locator('[data-value="' + kind + '"]');
      const color = locator => locator.evaluate(node => getComputedStyle(node).color);
      const scenario = 'PCM方式によって音声をサンプリング（標本化）して8ビットのディジタルデータに変換し、圧縮せずにリアルタイムで転送したところ、転送速度は 64,000 ビット／秒のときのサンプリング間隔は何マイクロ秒かを調べる。';
      check(await frame.locator('#diagram > :first-child').textContent() === scenario, 'exact scenario at top of card');
      check(await color(el('scenario-bits')) === await color(el('condition-bits')), 'scenario and plot bit width');
      check(await color(el('scenario-rate')) === await color(el('condition-rate')), 'scenario and plot transfer rate');
      for (let step = 1; step <= 6; step++) {
        await el('next').press('Enter'); await stable();
        check(await seek.inputValue() === String(step), 'advance one step');
        const text = await formula.innerText();
        check(text.includes(step === 2 ? 'を丸める' : equations[step]), 'formula at ' + step + ': ' + text);
        check((await el('guides').getAttribute('d')).split('M').length === 4, 'three marks');
        if (step <= 3) {
          const samples = el('samples').locator('button');
          for (let index = 0; index < 3; index++) {
            const point = samples.nth(index);
            await point.press('Space');
            check((await el('step-title').innerText()).includes('標本' + (index + 1)),
              'selected sample reaches explanation ' + [width,theme,font,step,index]);
            if (step === 2) check(await point.getAttribute('data-in-formula') === 'true', 'selected quantization point');
            if (step === 3) check(/[01]{8}（8ビット）/.test(await formula.innerText()), 'binary code');
            const kind = step === 3 ? 'level' : 'amplitude';
            const value = el('sample-value'), amplitude = ['約0.644','約0.598','約0.258'][index];
            const level = ['164','152','66'][index];
            check(await term(kind).innerText() === (step === 3 ? level : amplitude), 'formula uses the selected sample');
            check((await value.innerText()).endsWith(step === 3 ? level : amplitude), 'number by the selected point');
            check(await color(value) === await color(term(kind)), 'sample and formula share color');
            check(await value.evaluate(node => {
              const label = node.getBoundingClientRect(), plot = node.closest('.diagram').getBoundingClientRect();
              const point = node.parentElement.querySelector('[data-in-formula=true] span').getBoundingClientRect();
              return label.left >= plot.left && label.right <= plot.right && label.bottom <= point.top + 1;
            }), 'sample label fits clear of its marker ' + [width,theme,font,step,index]);
            check(Boolean(await el('amplitude-guide').getAttribute('d')) === (step !== 3), 'amplitude projection');
            await stable();
            if (step === 2 && index === 0 && theme === 'dark' && (width === 1280 || width === 320)) {
              await page.screenshot({path: output + '/quantization-' + width + '-' + font + '.png',fullPage:font === 100});
            }
            await point.press('Escape');
            check(await point.getAttribute('aria-pressed') === 'false' && await point.evaluate(n => n === document.activeElement), 'selection closes and restores focus');
          }
        }
        if (step === 4) {
          check(await color(el('scenario-bits')) === await color(term('bits')), 'scenario and formula bit width');
          check(await color(el('scenario-rate')) === await color(term('rate')), 'scenario and formula transfer rate');
          check(await color(term('rate')) !== await color(term('bits')), 'rate and bit width are distinct');
        }
        if (step === 1 || step >= 5) {
          const intervalColor = await color(el('scenario-interval'));
          check(await color(el('interval-link')) === intervalColor, 'scenario and diagram interval');
          check(await term('interval').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).color))
            .then(colors => colors.length > 0 && colors.every(value => value === intervalColor)), 'scenario and formula interval');
        }
        if (step >= 5) {
          check(await el('interval-value').innerText() === await term('interval').last().innerText(), 'bracket equals formula interval');
        }
        if (font === 100 && theme === 'light' && width === 1280 && [1,3,6].includes(step)) {
          await page.screenshot({path: output + '/step-' + step + '-desktop.png',fullPage:true});
        }
      }
      check((await el('step-note').innerText()).includes('選択肢ウの 125 μs と一致'), 'original answer');
      const choices = el('choices').locator('button');
      for (const [index,count] of [25,9,3,3].entries()) {
        const button = choices.nth(index); await button.press('Enter'); await stable();
        const guides = await el('candidate-guides').getAttribute('d');
        check(guides.split('M').length - 1 === count, 'candidate time positions');
        const guideColor = await el('candidate-guides').evaluate(node => getComputedStyle(node).stroke);
        check(await term('candidate').evaluate(node => getComputedStyle(node).textDecorationColor) === guideColor, 'candidate in formula and graph');
        check((await el('step-note').innerText()).includes(index === 2 ? 'と一致します' : 'と一致しません'), 'candidate check');
        check(await el('scenario').textContent() === scenario, 'candidate comparison keeps the question conditions');
        if (index === 0 && width === 320 && theme === 'dark') {
          await page.evaluate(() => scrollTo(0,0));
          await page.screenshot({path: output + '/compare-mobile-' + font + '.png',fullPage:font === 100});
          if (font === 200) {
            await button.scrollIntoViewIfNeeded();
            await page.screenshot({path: output + '/compare-mobile-200-choices.png'});
          }
        }
        await button.press(index % 2 ? 'Enter' : 'Escape');
        check(await el('candidate-guides').getAttribute('d') === '', 'comparison closes');
      }
      await el('interval-link').press('Enter');
      check(await seek.inputValue() === '5', 'interval bracket jumps to its equation');
      for (let step = 4; step >= 0; step--) {
        await el('prev').press('Enter'); await stable();
        check(await seek.inputValue() === String(step), 'one step back');
      }
    }
    check(await page.locator('.detail-references').isVisible() && await page.locator('.footer-changes').isVisible(), 'sources and changes');
    check(await frame.evaluate(() => ![...document.querySelectorAll('body *')].some(n =>
      ['auto','scroll'].includes(getComputedStyle(n).overflowY) && n.scrollHeight > n.clientHeight + 2 && !n.matches('input'))), 'no nested vertical scrolling');
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
    await page.getByRole('button',{name:'詳細解説を見る',exact:true}).click(); await detail();
    results.push({width,theme,fonts:[100,200],steps:7});
  }
  await page.goto(url + '#/search?q=PCM&type=detail');
  await page.getByRole('link',{name:'PCMの標本化と転送速度',exact:true}).click();
  const frame = await detail();
  await frame.locator('#next').press('Enter'); await settle(frame);
  const point = frame.locator('.sample').nth(1);
  // Center the target before clicking across the iframe while the page uses smooth scrolling.
  await point.evaluate(node => node.scrollIntoView({block:'center',behavior:'instant'}));
  await point.click();
  check(await point.getAttribute('aria-pressed') === 'true', 'click point in the narrow embedded plot');
  await page.goto(url + 'explanations/ipa-2016-spring-am-4/index.html');
  check(await page.locator('#standalone-title').isVisible() && await page.locator('#standalone-credit').isVisible(), 'standalone title and sources');
  check(!errors.length, errors.join(', ')); return results;
}`);

await installFixtureGenerators();
const bundle = fixture(), question = bundle.questions.find(q => q.id === id)!;
const runs = new Map<number, Awaited<ReturnType<typeof finishRun>>>();
for (let attempt = 0; attempt < 100 && runs.size < 4; attempt++) {
  let run = startRun(await prepareRun(bundle, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values",
    bookmarkQuestionRef: { questionId: question.id, revision: question.revision } }, {}));
  const index = run.instances[0].parameters.values[0];
  if (runs.has(index)) continue;
  run = updateAnswer(run, run.issued[0].choices[0].id);
  run.session.entries[0].revealed = true;
  run = finishRun(run, "completed");
  await validateRun(run);
  runs.set(index, run);
}
if (runs.size !== 4) throw Error("Missing generated PCM conditions");
const savedRuns = [...runs.values()].map(({ bundle: _bundle, ...run }) => run);
fs.writeFileSync(output + "/saved-fixtures.json", JSON.stringify({ bundle, runs: savedRuns }));
fs.writeFileSync(output + "/saved.js", `async page => {
  ${setup}
  await setViewport({width:390,height:680}); await page.goto(url);
  const runs = await page.evaluate(async () => {
    const response = await fetch('/output/playwright/pcm/saved-fixtures.json');
    if (!response.ok) throw Error('Missing local saved-fixtures.json');
    const {bundle,runs} = await response.json();
    const open = indexedDB.open('opencbt-fe-kihonjoho-v2');
    const db = await new Promise((resolve,reject) => { open.onsuccess=()=>resolve(open.result); open.onerror=reject; });
    const tx = db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    for (const run of runs) {
      tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle,assets:{}});
      for (const i of run.instances) tx.objectStore('generatedInstances').put(i);
      tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});
      tx.objectStore('results').put(run.result);
    }
    await new Promise((resolve,reject) => { tx.oncomplete=resolve; tx.onerror=reject; }); db.close();
    return runs;
  });
  for (const run of runs) {
    await page.goto('about:blank'); await page.goto(url + '#/detail/' + run.session.id + '/0/review');
    const frame = await detail(), context = await frame.evaluate(() => window.OpenCBTDetail.context);
    const index = run.instances[0].parameters.values[0], [bits,rate,interval] = [[8,64000,125],[4,16000,250],[4,32000,125],[8,32000,250]][index];
    check(context.generation.parameters.values[0] === index, 'saved condition');
    check(await frame.locator('#condition-bits').innerText() === '1標本 ' + bits + 'ビット', 'saved bit width');
    check((await frame.locator('#condition-rate').innerText()).startsWith(rate.toLocaleString('ja-JP')), 'saved rate');
    check(await frame.locator('#scenario-bits').textContent() === bits + 'ビット', 'scenario uses saved bit width');
    check(await frame.locator('#scenario-rate').textContent() === rate.toLocaleString('ja-JP') + ' ビット／秒', 'scenario uses saved rate');
    await frame.locator('#seek').press('End');
    check((await frame.locator('#formula').innerText()).endsWith(interval + ' μs'), 'saved interval');
    for (const [i,choice] of context.choiceOrder.entries()) {
      const button = frame.locator('#choices button').nth(i), block = context.question.choices.find(c => c.id === choice.id).content.blocks[0];
      check(await button.innerText() === choice.label + ' ' + block.text, 'saved choices and display order');
      await button.press('Enter');
      check((await frame.locator('#step-note').innerText()).includes(Number(block.text) === interval ? 'と一致します' : 'と一致しません'), 'saved comparison');
    }
    check(await frame.evaluate(before => Object.isFrozen(window.OpenCBTDetail.context) &&
      JSON.stringify(window.OpenCBTDetail.context) === before, JSON.stringify(context)), 'frozen context');
    await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
    const saved = await page.evaluate(async id => {
      const open = indexedDB.open('opencbt-fe-kihonjoho-v2'), db = await new Promise(r => open.onsuccess=()=>r(open.result));
      const req = db.transaction('sessions').objectStore('sessions').get(id), record = await new Promise(r => req.onsuccess=()=>r(req.result));
      db.close(); return record;
    },run.session.id);
    for (const [a,b] of [[saved.issued,run.issued],[saved.session.entries,run.session.entries],[saved.result,run.result]]) {
      check(JSON.stringify(a) === JSON.stringify(b), 'saved problem, answers and result');
    }
  }
  return 'all four generated PCM conditions';
}`);
console.log(`Generated ${output}/verify.js and saved.js for a dedicated headless Chromium session.`);
