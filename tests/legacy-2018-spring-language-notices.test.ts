import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Attribution, Bundle } from "../src/core/types";
import { Content } from "../src/ui/Content";
import { isLegacy2018SpringNativeText, Legacy2018SpringNativeParagraph, legacy2018SpringNativeTextContracts } from "../src/ui/Legacy2018SpringNativeText";
import { legacy2018SpringPm9Definition as d9 } from "../src/core/generators/legacy-2018-spring-pm9";
import { legacy2018SpringPm10Definition as d10 } from "../src/core/generators/legacy-2018-spring-pm10";
import { legacy2018SpringPm11Definition as d11 } from "../src/core/generators/legacy-2018-spring-pm11";
import { legacy2018SpringPm12Definition as d12 } from "../src/core/generators/legacy-2018-spring-pm12";

// Fixed by rereading QS physical44/50/56/63. This does not transcribe any
// additional paragraph or change the original producer's source spelling.
const expected: Record<number, {text: string; mark: string; frame: string; inputs: number}> = {
  9: {text: "次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の○選をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。", mark: "○選", frame: "general", inputs: 9},
  10: {text: "選択した問題は，選択欄の○選をマークしてください。マークがない場合は，採点されません。", mark: "○選", frame: "selection", inputs: 18},
  11: {text: "選択した問題は、選択欄の（選）をマークしてください。マークがない場合は、採点されません。", mark: "（選）", frame: "selection", inputs: 40},
  12: {text: "選択した問題は、選択欄の（選）をマークしてください。マークがない場合は、採点されません。", mark: "（選）", frame: "selection", inputs: 12},
};
const definitions = {9:d9,10:d10,11:d11,12:d12};

test("問9〜12の79生成入力は字面不変の先頭注意だけを登録し、1丸囲みと原の枠種を描く", () => {
  for (const [n, d] of Object.entries(definitions)) {
    const number = Number(n), facts = expected[number]; let inputs = 0;
    const visit = (values: number[]) => {
      if (values.length < d.fields.length) {
        const f = d.fields[values.length]; for (let v=f.minimum;v<=f.maximum;v++) visit([...values,v]); return;
      }
      const body = d.build(values), before = structuredClone(body), first = body.prompt[0]; assert(first.type === "paragraph");
      assert.equal(first.text, facts.text); assert.equal(isLegacy2018SpringNativeText(number,"paragraph",first.text),true);
      const html = renderToStaticMarkup(createElement(Legacy2018SpringNativeParagraph,{number,text:first.text}));
      assert(html.startsWith(`<p class="spring2018-native-notice spring2018-native-notice-${facts.frame}"`));
      assert.equal((html.match(/data-spring2018-circle="選"/g)??[]).length,1);
      assert.equal((html.match(/data-spring2018-blank=/g)??[]).length,0);
      assert.equal(html.replace(/<[^>]*>/g,""),facts.text.replace(facts.mark,"選"));
      assert.deepEqual(body,before); inputs++;
    };
    visit([]); assert.equal(inputs,facts.inputs);
    const entries = legacy2018SpringNativeTextContracts().filter(c=>c.number===number);
    assert.equal(entries.length,1); assert.equal(entries[0].text,facts.text);
    assert.equal(entries[0].regions.length,1); assert.equal(entries[0].regions[0].kind,"circle");
  }
});

test("注意に似た他段落・code・他問・一字変更を登録せず、普通の括弧を一括変換しない", () => {
  for (const [n, facts] of Object.entries(expected)) {
    const number = Number(n);
    for (const text of [facts.text+"!",facts.text.replace(facts.mark,"選"),"（選）","○選","これは（選）についての説明である。"])
      assert.equal(isLegacy2018SpringNativeText(number,"paragraph",text),false);
    assert.equal(isLegacy2018SpringNativeText(number,"code",facts.text),false);
    assert.equal(isLegacy2018SpringNativeText(2018,"paragraph",facts.text),false);
    assert.throws(()=>renderToStaticMarkup(createElement(Legacy2018SpringNativeParagraph,{number,text:facts.text+"!"})),/SPRING_NATIVE_TEXT_SOURCE/);
  }
});

test("本番Contentは公式source/year/春期/午後/問番号の完全一致でだけ注意枠へ接続する", () => {
  const empty = {sources:[],rights:[],assets:[],questions:[],templates:[],sets:[],exams:[]} as unknown as Bundle;
  for (const n of [9,10,11,12]) {
    const a: Attribution = {origin:"adapted",sourceRefs:[{sourceId:`source-ipa-2018h30h-fe-pm-${n}-qs`,locator:{section:`平成30年度 春期 午後 問${n} 冒頭注意`,year:2018,period:"春期",timeSlot:"午後",questionNumber:String(n),page:({9:44,10:50,11:56,12:63}as Record<number,number>)[n]}}],rightsRefs:["rights-original"],creatorIds:["codex"]};
    const render = (attribution: Attribution) => renderToStaticMarkup(createElement(Content,{content:{attribution,blocks:[{type:"paragraph",text:expected[n].text}]},bundle:empty,assetUrls:{},showAttribution:false}));
    const html = render(a); assert.equal((html.match(/data-spring2018-circle=/g)??[]).length,1); assert(!html.includes("<p><p"));
    for (const bad of [
      {...a,origin:"original" as const},
      {...a,sourceRefs:a.sourceRefs.map(r=>({...r,sourceId:r.sourceId+"-foreign"}))},
      {...a,sourceRefs:a.sourceRefs.map(r=>({...r,locator:{...r.locator,year:2017}}))},
      {...a,sourceRefs:a.sourceRefs.map(r=>({...r,locator:{...r.locator,period:"秋期"}}))},
      {...a,sourceRefs:a.sourceRefs.map(r=>({...r,locator:{...r.locator,timeSlot:"午前"}}))},
      {...a,sourceRefs:a.sourceRefs.map(r=>({...r,locator:{...r.locator,questionNumber:"1"}}))},
    ]) assert(!render(bad).includes("data-spring2018-circle="));
  }
});
