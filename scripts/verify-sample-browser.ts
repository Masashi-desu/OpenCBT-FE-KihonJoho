// Generates a Playwright CLI script. It operates only on its dedicated
// headless context; real source assets and the production catalog are used.
import fs from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SourceFigure } from "../src/ui/SourceFigure";
const out = "output/playwright/april-sample";
fs.mkdirSync(out, { recursive: true });
const figures = [
  ...[0,1].map(n => ({ profile: "list-element-class", values: [n] })),
  ...[0,1,2,3].map(n => ({ profile: "bigram-example", values: [n] })),
].map(({profile,values}) => renderToStaticMarkup(createElement(SourceFigure, {
  scene: { kind: "source_figure", profile, values }, caption: `${profile} ${values[0]}`,
}))).join("\n");
fs.writeFileSync(`${out}/figures.html`, `<!doctype html><html lang="ja"><meta charset="utf-8"><link rel="stylesheet" href="/src/ui/tokens.css"><link rel="stylesheet" href="/src/ui/style.css"><style>body{padding:24px;display:block;background:var(--surface);color:var(--text)}figure{max-width:1000px;margin:24px auto}</style>${figures}</html>`);
fs.writeFileSync(`${out}/verify.js`, `async page => {
  const check=(ok,message)=>{if(!ok)throw Error(message)}, errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:5199/';
  // Continue the source collection started through the real menu.
  await page.locator('.answer-choices').waitFor();
  const examURL=page.url();
  for(let i=0;i<6;i++){
    await page.locator('.question-rail button').nth(i).click();
    await page.waitForFunction(()=>[...document.querySelectorAll('.reading-scroll img')].every(img=>img.complete&&img.naturalWidth>0));
    check(await page.locator('.answer-choices input').count()===[7,4,6,4,4,10][i],'original choices '+i);
    check((await page.locator('main').innerText()).includes('出典：基本情報技術者試験 科目B試験サンプル問題'),'required citation');
    await page.locator('.answer-choices label').nth([5,2,0,1,2,4][i]).click();
  }
  await page.reload();await page.locator('.answer-choices').waitFor();
  check(await page.locator('.question-rail .answered').count()===6,'original selections persist');
  for(const width of [1440,390,320])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.evaluate(theme=>{localStorage.setItem('opencbt-fe-kihonjoho-theme',theme)},theme);
    for(let n=1;n<=6;n++){
      await page.goto(url+'#/search/question/question-ipa-sample-2022-apr-b-'+n);await page.reload();
      await page.locator('.search-question-material img').first().waitFor();
      await page.waitForFunction(()=>[...document.querySelectorAll('.search-question-material img')].every(img=>img.complete&&img.naturalWidth>0));
      await page.getByRole('button',{name:'正答・解説を表示',exact:true}).click();
      check((await page.locator('.search-explanation').innerText()).includes('正答：'+['カ','ウ','ア','イ','ウ','オ'][n-1]),'official answer');
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'original page overflow');
      if(n===3||n===5)await page.screenshot({path:'${out}/original-'+n+'-'+width+'-'+theme+'.png',fullPage:true});
      await page.getByRole('button',{name:'類題を解く',exact:true}).click();
      await page.locator('.answer-choices').waitFor();
      check(!(await page.locator('.reading-scroll img').count()),'no fixed source images in adaptation');
      check(await page.locator('.answer-choices input').count()===[7,4,6,4,4,10][n-1],'adapted choice count');
      check((await page.locator('main').innerText()).includes('改変'),'adaptation disclosure');
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'generated page overflow');
      if(n===3||n===5)await page.screenshot({path:'${out}/generated-'+n+'-'+width+'-'+theme+'.png',fullPage:true});
    }
  }
  for(const theme of ['light','dark']){
    await page.setViewportSize({width:1100,height:900});
    await page.goto(url+'${out}/figures.html');
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    const bad=await page.locator('svg text').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBBox(),v=n.ownerSVGElement.viewBox.baseVal;return r.x<0||r.y<0||r.x+r.width>v.width+1||r.y+r.height>v.height+1}).map(n=>n.textContent));
    check(!bad.length,'figure text outside canvas: '+bad.join(','));
    await page.screenshot({path:'${out}/figures-'+theme+'.png',fullPage:true});
  }
  check(!errors.length,'browser exceptions: '+errors.join(','));
  return {originals:6,generated:6,widths:[1440,390,320],themes:['light','dark'],sourceCollection:true,persistence:true,figureVariants:6,errors};
}`);
console.log(`Generated ${out}/verify.js and six figure variants.`);
