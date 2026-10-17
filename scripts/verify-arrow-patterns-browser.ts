// Generate interaction checks for the shared lesson in an isolated headless CLI session.
import fs from "node:fs";
import { viewportHelper } from "./playwright-viewport.mjs";
import { fixture } from "../tests/fixtures";
import { prepareRun, startRun, finishRun, validateRun } from "../src/core/session";

const url = process.argv[2] ?? "http://127.0.0.1:5188/", output = "output/playwright/arrow";
fs.mkdirSync(output, { recursive: true });
const helpers = `
  ${viewportHelper}
  const check=(value,message)=>{if(!value)throw Error(message)};
  const frame=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  const settle=async()=>{
    await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await frame.waitForFunction(()=>Math.abs(innerHeight-Math.ceil(document.body.getBoundingClientRect().bottom+scrollY))<=1);
  };
  const total=async()=>(await frame.locator('[data-id="end"]').getAttribute('aria-label')).match(/最早([0-9]+)日/)[1]+'日';
  const choose=async id=>{
    const target=frame.locator('[data-id="'+id+'"]');
    if(await target.getAttribute('aria-pressed')!=='true')await target.locator('.edge-label-bg,.event-circle').click();
    check(await frame.locator('#inspection-panel').isVisible(),'selection opens '+id);
    await settle();
  };
  const edit=async(id,value)=>{await choose(id);await frame.locator('#duration').fill(String(value));await frame.locator('#apply-duration').click();await settle()};
  const reset=async()=>{await frame.locator('#reset').click();await settle()};
`;
fs.writeFileSync(output + "/patterns.js", `async page=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(${JSON.stringify(url + "#/search/detail/question-ipa-2025-a-14")});
  await page.reload();await page.locator('.detail-frame.ready').waitFor();
  ${helpers}
  await setViewport({width:1280,height:1000});await settle();
  check(await frame.locator('#pattern').inputValue()==='2025-a-14','source selects 2025');
  check(await total()==='31日','official total');
  check(await frame.locator('.edge').count()===11&&await frame.locator('.event-node').count()===8,'2025 topology');
  check(await frame.locator('#inspection-panel').isHidden(),'minimal initial state');
  await frame.locator('#show-critical').check();await frame.locator('#show-times').check();
  check((await frame.locator('#path-summary').innerText()).includes('A → B → G → ダミー(0日) → D → I'),'official path');
  const initial={A:3,B:6,C:8,D:6,E:5,F:14,G:11,H:15,I:5};
  for(const [id,expected] of [['A',32],['B',32],['C',31],['D',32],['E',31],['F',31],['G',32],['H',31],['I',32]]){
    await reset();await edit(id,initial[id]+1);check(await total()===expected+'日','editor '+id);
    await frame.locator('#duration').press('Escape');check(await frame.locator('[data-id="'+id+'"]').evaluate(n=>document.activeElement===n),'focus '+id);
  }
  await reset();await choose('I');await frame.locator('#duration').fill('-1');await frame.locator('#apply-duration').click();
  check(await total()==='31日'&&await frame.locator('#duration').getAttribute('aria-invalid')==='true','invalid keeps valid state');
  await reset();await edit('H',17);check((await frame.locator('#path-summary').innerText()).includes('パス 2本'),'multiple paths');
  await page.screenshot({path:'${output}/2025-two-paths.png',fullPage:true});
  await reset();await choose('dummy-g');await frame.locator('#toggle-dummy').click();check(await total()==='29日','G dependency disabled');
  await reset();await edit('E',100);await choose('dummy-e');await frame.locator('#toggle-dummy').click();
  check(await total()==='103日','detached work still required');await choose('end');
  check((await frame.locator('.formula').innerText()).includes('E完了点 103'),'terminal completion formula');
  await reset();await frame.locator('#first').click();
  for(let i=1;i<12;i++){await frame.locator('#next').click();await settle();}
  check((await frame.locator('#step-label').innerText()).startsWith('12 / 12'),'all 12 steps');
  await frame.locator('#pattern').selectOption('2024-a-13');await settle();check(await total()==='120日','2024 retained');
  await edit('B',25);check(await total()==='125日','2024 edit');
  await frame.locator('#pattern').selectOption('2025-a-14');await settle();
  check((await frame.locator('#step-label').innerText()).startsWith('12 / 12'),'step survives pattern switch');
  await reset();await edit('E',7);await frame.locator('#first').click();await frame.locator('#play').click();
  await frame.locator('#pattern').selectOption('2024-a-13');await settle();
  check(await total()==='125日'&&await frame.locator('#play').getAttribute('aria-pressed')==='false','switch pauses and preserves other pattern');
  await frame.locator('#pattern').selectOption('2025-a-14');await settle();check(await total()==='32日','2025 edited state survives');
  for(const width of [1280,390,320]){
    await setViewport({width,height:width===1280?900:844});
    for(const theme of ['light','dark']){
      await page.getByRole('button',{name:theme==='light'?'ライトモード':'ダークモード',exact:true}).click();
      await frame.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
      await reset();
      const layout=()=>frame.evaluate(()=>({diagram:document.querySelector('#diagram-viewport').getBoundingClientRect().height,play:document.querySelector('.diagram-actions').getBoundingClientRect().top+scrollY}));
      const fixed=await layout();
      check(await frame.locator('.edge-label-hit,.event-hit').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return r.width>=44&&r.height>=44})), '44px diagram targets '+width);
      for(const id of [...Object.keys(initial),'dummy-e','dummy-g','start','branch','lower','join','upper','merge','preend','end']){
        await choose(id);let box=await layout();check(Math.abs(box.play-fixed.play)<1&&Math.abs(box.diagram-fixed.diagram)<1,'stable selection '+id+' '+width);
        if(await frame.locator('summary').isVisible()){await frame.locator('summary').click();await settle();box=await layout();check(Math.abs(box.play-fixed.play)<1,'stable expansion '+id);}
        await frame.locator('#close-inspection').click();await settle();
      }
      await choose('merge');check((await frame.locator('.formula').innerText()).includes('max(9 + 8, 3 + 14, 20 + 0) = 20日'),'merge formula');
      check(await frame.locator('[data-term]').count()===3,'all incoming comparisons');
      await frame.locator('[data-term="dummy-g"]').click();check(await frame.locator('[data-id="dummy-g"]').evaluate(n=>n.classList.contains('determining')),'comparison highlights arrow');
      await reset();await settle();
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page horizontal overflow');
      check(await frame.evaluate(()=>!['auto','scroll'].includes(getComputedStyle(document.querySelector('#inspection-reservation')).overflowY)),'single vertical scroll');
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await settle();
      await page.screenshot({path:'${output}/2025-'+width+'-'+theme+'.png',fullPage:true});
      if(width<600)await page.screenshot({path:'${output}/2025-top-'+width+'-'+theme+'.png'});
      await choose('I');await frame.locator('[data-id="I"] .edge-label-bg').click();check(await frame.locator('#inspection-panel').isHidden(),'same object deselects');
      await frame.locator('#first').click();for(let i=1;i<12;i++){await frame.locator('#next').click();await settle();check(Math.abs((await layout()).play-fixed.play)<1,'stable step '+i);}
    }
  }
  await setViewport({width:390,height:600});await reset();await choose('I');
  await frame.evaluate(()=>document.documentElement.style.fontSize='150%');await settle();
  check(await frame.locator('#duration').isVisible(),'text enlargement remains editable');
  await frame.evaluate(()=>document.documentElement.style.fontSize='');await settle();
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  check((await page.locator('#search-explanation').innerText()).includes('31日（エ）'),'return to matching explanation');
  check(!errors.length,errors.join(', '));return {pattern:'2025-a-14',allNineEditors:true,steps:12,switchPreservesState:true,widths:[1280,390,320],themes:['light','dark'],errors};
}`);

const b = fixture(), original = b.questions.find(q => q.id === "question-ipa-2025-a-14")!;
let run = startRun(await prepareRun(b, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values", bookmarkQuestionRef: { questionId: original.id, revision: original.revision } }, {}));
run.session.entries[0].revealed = true; run = finishRun(run, "completed"); await validateRun(run);
const values = run.instances[0].parameters.values;
const [a, bb, c, d, e, f, g, h, i] = values, join = a + Math.max(bb, e), days = Math.max(Math.max(join + c, a + f, join + g) + d, join + h) + i;
fs.writeFileSync(output + "/generated-2025.js", `async page=>{
  await page.goto(${JSON.stringify(url)});
  await page.evaluate(async run=>{
    const request=indexedDB.open('opencbt-fe-kihonjoho-v2',3),db=await new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=reject});
    const tx=db.transaction(['catalogSnapshots','generatedInstances','sessions','results'],'readwrite');
    tx.objectStore('catalogSnapshots').put({id:run.session.id,bundle:run.bundle,assets:{}});
    run.instances.forEach(instance=>tx.objectStore('generatedInstances').put(instance));
    tx.objectStore('sessions').put({id:run.session.id,session:run.session,exam:run.exam,set:run.set,selection:run.selection,issued:run.issued,title:run.set.title,result:run.result});
    tx.objectStore('results').put(run.result);await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=reject});db.close();
  },${JSON.stringify(run)});
  await page.goto(${JSON.stringify(url + `#/detail/${run.session.id}/0/review`)});await page.locator('.detail-frame.ready').waitFor();
  ${helpers}
  check(await frame.locator('#pattern').inputValue()==='2025-a-14'&&await total()===${JSON.stringify(days + "日")},'generated saved conditions');
  const credit=page.locator('.detail-page > .question-footer');
  check((await credit.innerText()).includes('2025年度'),'generated source credits');
  const before=await frame.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context));
  await edit('A',${values[0] + 1});await frame.locator('#pattern').selectOption('2024-a-13');await credit.locator('a[href*=\"2024r\"]').waitFor();check(!(await credit.innerText()).includes('©2025'),'generated view switches credits');await frame.locator('#pattern').selectOption('2025-a-14');await credit.locator('a[href*=\"2025r\"]').waitFor();await settle();
  check(await total()===${JSON.stringify(days + 1 + "日")},'generated edits survive switch');await reset();check(await total()===${JSON.stringify(days + "日")},'reset saved values');
  check(await frame.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===before,'immutable issued problem');
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  return {savedValues:${JSON.stringify(values)},total:${days},immutableContext:true,resetSavedValues:true};
}`);
fs.writeFileSync(output + "/credits.js", `async page=>{
  ${viewportHelper}
  const check=(value,message)=>{if(!value)throw Error(message)}, errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const footer=page.locator('.detail-page > .question-footer');
  let frame;
  const open=async id=>{
    await page.goto(${JSON.stringify(url)}+'#/search/detail/'+id);
    await page.locator('.detail-frame.ready').waitFor();await footer.waitFor();
    frame=await (await page.locator('.detail-frame').elementHandle()).contentFrame();
  };
  const credit=async(year,pageNumber)=>{
    await footer.locator('a[href*="'+year+'r"]').waitFor();
    const value=await footer.innerText();
    check(value.includes(year+'年度')&&value.includes('©'+year),'active year and copyright '+year);
    check(!value.includes('©'+(year===2024?2025:2024)),'inactive source excluded '+year);
    check(value.includes('原資料に基づく改変あり')&&!value.includes('公式公開問題')&&!value.includes('改変なし'),'lesson attribution '+year);
    check((await footer.locator('.footer-source a').getAttribute('href')).endsWith('#page='+pageNumber),'active source page '+year);
    check(await page.locator('.detail-page > .material-credit').count()===0,'no duplicate credit line');
    check(await page.locator('.detail-page > .question-footer').count()===1,'single detail footer');
    check(await footer.evaluate(n=>getComputedStyle(n).maxHeight==='none'&&n.scrollHeight<=n.clientHeight+1),'natural footer height');
  };
  await setViewport({width:1316,height:609});
  await open('question-ipa-2025-a-14');await credit(2025,8);
  const context=await frame.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context));
  await frame.locator('#pattern').selectOption('2024-a-13');await credit(2024,6);
  await footer.getByRole('button',{name:'出典・改変詳細',exact:true}).click();
  let dialog=page.getByRole('dialog');check((await dialog.innerText()).includes('2024年度')&&!(await dialog.innerText()).includes('©2025'),'active source dialog');
  await dialog.getByRole('button',{name:'閉じる',exact:true}).click();
  await frame.locator('[data-id="A"] .edge-label-bg').click();await frame.locator('#duration').fill('50');await frame.locator('#apply-duration').click();
  await credit(2024,6);check((await footer.innerText()).includes('作業日数・ダミーの依存関係の変更'),'modification scope');
  await frame.evaluate(()=>{window.OpenCBTDetail.setPresentation('not-registered');parent.postMessage({type:'opencbt:detail:presentation',apiVersion:1,token:'wrong',id:'2025-a-14'},'*')});
  await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await credit(2024,6);
  check(await frame.evaluate(()=>JSON.stringify(window.OpenCBTDetail.context))===context,'read-only question context');
  await frame.locator('#pattern').selectOption('2025-a-14');await credit(2025,8);
  await footer.getByRole('button',{name:'出典・改変詳細',exact:true}).click();dialog=page.getByRole('dialog');
  check((await dialog.innerText()).includes('2025年度')&&!(await dialog.innerText()).includes('©2024'),'updated source dialog');
  await dialog.getByRole('button',{name:'閉じる',exact:true}).click();
  for(const width of [1316,390,320]){
    await setViewport({width,height:609});
    for(const year of [2024,2025]){
      await frame.locator('#pattern').selectOption(year===2024?'2024-a-13':'2025-a-14');await credit(year,year===2024?6:8);
      await footer.scrollIntoViewIfNeeded();
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no footer overflow '+width);
      await page.screenshot({path:'${output}/credits-'+year+'-'+width+'.png'});
    }
  }
  await open('question-ipa-2024-a-13');await credit(2024,6);await frame.locator('#pattern').selectOption('2025-a-14');await credit(2025,8);
  await page.getByRole('button',{name:'通常解説へ戻る',exact:true}).click();
  check((await page.locator('.search-question:not([hidden]) > .question-footer').innerText()).includes('2024年度'),'return keeps original question credits');
  for(const id of ['question-ipa-2023-a-1','question-ipa-2023-a-11','question-ipa-2026-a-2']){
    await open(id);check(await footer.isVisible()&&await page.locator('.detail-page > .material-credit').count()===0,'legacy manifest single footer '+id);
    check((await footer.innerText()).includes('独自解説・追加表現'),'original contribution retained '+id);
  }
  check(!errors.length,errors.join(', '));return {activeCredits:true,noDuplicates:true,activeDialog:true,unknownNotificationsIgnored:true,questionUnchanged:true,widths:[1316,390,320],otherLessons:3,errors};
}`);
console.log("Generated patterns.js, generated-2025.js and credits.js in " + output);
