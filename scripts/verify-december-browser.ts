// Generates a Playwright CLI script. It operates only on its dedicated
// headless context; real source assets and the production catalog are used.
import fs from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SourceFigure } from "../src/ui/SourceFigure";
import { Content } from "../src/ui/Content";
import { readDistributionBundle } from "./distribution-files";
import { decemberProgramDefinitions } from "../src/core/generators/sample-2022-dec-programs";
const out = "output/playwright/december-b";
fs.mkdirSync(out, { recursive: true });
const figures = [
  ...[0,1].flatMap(a=>[0,1].map(b=>({profile:"priority-queue-class",values:[a,b]}))),
  ...[4,5,6,7].map(n=>({profile:"sample-tree-14",values:[n]})),
  ...[1,2,3].flatMap(a=>[0,1,2].map(b=>({profile:"sample-minimax",values:[a,b]}))),
].map(({profile,values}) => renderToStaticMarkup(createElement(SourceFigure, {
  scene: { kind: "source_figure", profile, values }, caption: `${profile} ${values[0]}`,
}))).join("\n");
fs.writeFileSync(`${out}/figures.html`, `<!doctype html><html lang="ja"><meta charset="utf-8"><link rel="stylesheet" href="/src/ui/tokens.css"><link rel="stylesheet" href="/src/ui/style.css"><style>body{padding:24px;display:block;background:var(--surface);color:var(--text)}figure{max-width:1000px;margin:24px auto}</style>${figures}</html>`);
const bundle=readDistributionBundle(), utf8=decemberProgramDefinitions.find(d=>d.source==="sample-2022-dec-b-16")!;
const attribution=bundle.questions.find(q=>q.id==="question-template-source-sample-2022-dec-b-16")!.prompt.attribution;
const utf8Cases=[2,3,4].flatMap(count=>[0,1].map(example=>{
  const body=utf8.build([count,example]);
  return renderToStaticMarkup(createElement("article",{"data-byte-count":count},
    createElement(Content,{content:{attribution,blocks:body.prompt},bundle,assetUrls:{},credit:false}),
    createElement("p",{className:"review-explanation"},body.explanation)));
})).join("\n");
fs.writeFileSync(`${out}/utf8-cases.html`,`<!doctype html><html lang="ja"><meta charset="utf-8"><link rel="stylesheet" href="/src/ui/tokens.css"><link rel="stylesheet" href="/src/ui/style.css"><style>body{display:block;padding:24px;background:var(--surface);color:var(--text)}article{max-width:1000px;margin:32px auto}</style>${utf8Cases}</html>`);
fs.writeFileSync(`${out}/verify.js`, `async page => {
  const check=(ok,message)=>{if(!ok)throw Error(message)}, errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:5199/';
  // Continue the source collection started through the real menu.
  await page.locator('.answer-choices').waitFor();
  const examURL=page.url();
  for(let i=0;i<20;i++){
    await page.locator('.question-rail button').nth(i).click();
    await page.waitForFunction(()=>[...document.querySelectorAll('.reading-scroll img')].every(img=>img.complete&&img.naturalWidth>0));
    check(await page.locator('.answer-choices input').count()===[6,5,7,4,7,4,6,4,4,6,4,4,4,8,4,9,10,10,5,7][i],'original choices '+i);
    check((await page.locator('main').innerText()).includes('出典：基本情報技術者試験（科目B試験） サンプル問題セット'),'required citation');
    const correct=page.locator('.answer-choices label').nth([5,2,5,3,4,0,5,3,2,5,0,3,2,7,0,7,5,3,3,5][i]);
    if(!await correct.locator('input').isChecked())await correct.click();
  }
  await page.reload();await page.locator('.answer-choices').waitFor();
  check(await page.locator('.question-rail .answered').count()===20,'original selections persist');
  for(const width of [1440,390,320])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.evaluate(theme=>{localStorage.setItem('opencbt-fe-kihonjoho-theme',theme)},theme);
    for(let n=1;n<=20;n++){
      await page.goto(url+'#/search/question/question-ipa-sample-2022-dec-b-'+n);await page.reload();
      await page.locator('.search-question-material img').first().waitFor();
      await page.waitForFunction(()=>[...document.querySelectorAll('.search-question-material img')].every(img=>img.complete&&img.naturalWidth>0));
      await page.getByRole('button',{name:'正答・解説を表示',exact:true}).click();
      check((await page.locator('.search-explanation').innerText()).includes('正答：'+['カ','ウ','カ','エ','オ','ア','カ','エ','ウ','カ','ア','エ','ウ','ク','ア','ク','カ','エ','エ','カ'][n-1]),'official answer');
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'original page overflow');
      if([8,9,15,19,20].includes(n)&&((width===1440&&theme==='light')||(width===390&&theme==='dark')))await page.screenshot({path:'${out}/original-'+n+'-'+width+'-'+theme+'.png',fullPage:true});
      await page.getByRole('button',{name:'類題を解く',exact:true}).click();
      await page.locator('.answer-choices').waitFor();
      check(!(await page.locator('.reading-scroll img').count()),'no fixed source images in adaptation');
      check(await page.locator('.answer-choices input').count()===[6,5,7,4,7,4,6,4,4,6,4,4,4,8,4,9,10,10,5,7][n-1],'adapted choice count');
      check((await page.locator('main').innerText()).includes('改変'),'adaptation disclosure');
      if(n===16){
        const visible=await page.locator('.reading-scroll').innerText();
        if(visible.includes('3バイトのビットパターン'))check(visible.includes('実際のUTF-8では符号化しない'),'UTF-8 scalar distinction before answering');
        else check(!visible.includes('サロゲート符号位置'),'no stale three-byte note');
      }
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'generated page overflow');
      if([8,9,15,19,20].includes(n)&&((width===1440&&theme==='light')||(width===390&&theme==='dark')))await page.screenshot({path:'${out}/generated-'+n+'-'+width+'-'+theme+'.png',fullPage:true});
    }
  }
  for(const theme of ['light','dark']){
    await page.setViewportSize({width:1100,height:900});
    await page.goto(url+'${out}/figures.html');
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    await page.evaluate(()=>document.fonts.ready);
    const bad=await page.locator('svg text').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBBox(),v=n.ownerSVGElement.viewBox.baseVal;return r.x<0||r.y<0||r.x+r.width>v.width+1||r.y+r.height>v.height+1}).map(n=>n.textContent));
    check(!bad.length,'figure text outside canvas: '+bad.join(','));
    for(let i=0;i<17;i++)await page.locator('figure').nth(i).screenshot({path:'${out}/figure-'+i+'-'+theme+'.png'});
    await page.screenshot({path:'${out}/figures-'+theme+'.png',fullPage:true});
  }
  await page.goto(url+'${out}/utf8-cases.html');
  for(const article of await page.locator('article').all()){
    const count=await article.getAttribute('data-byte-count'),visible=await article.innerText();
    check(count==='3'?visible.includes('D800(16)〜DFFF(16)')&&visible.includes('実際のUTF-8では符号化しない'):visible.includes('この'+count+'バイト版')&&!visible.includes('本問の3バイト整数域'),'six UTF-8 contexts');
  }
  check(!errors.length,'browser exceptions: '+errors.join(','));
  return {originals:20,generated:20,widths:[1440,390,320],themes:['light','dark'],sourceCollection:true,persistence:true,figureVariants:17,errors};
}`);
console.log(`Generated ${out}/verify.js and 17 figure variants.`);
