import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {AttributionLine} from "../src/ui/Content";
import {fixture} from "./fixtures";
import type {Content,SourceRef} from "../src/core/types";
test("attribution preserves every page/section link from the same source, including repeated locators and reordered refs",()=>{
  const bundle=fixture(),source=bundle.sources[0],refs:SourceRef[]=[9,10,11,12].map(page=>({sourceId:source.id,locator:{section:"本文",page}}));
  refs.push({sourceId:source.id,locator:{section:"図注記",page:9}},structuredClone(refs[0]));
  const content:Content={attribution:{origin:"adapted",sourceRefs:refs,rightsRefs:[],creatorIds:[]},blocks:[]};
  for(const order of [refs,[refs[3],refs[1],refs[0],refs[2],refs[4],refs[5]]]){
    content.attribution.sourceRefs=order;const html=renderToStaticMarkup(createElement(AttributionLine,{content,bundle}));
    assert.equal((html.match(/<a /g)??[]).length,6);assert.equal((html.match(/#page=9"/g)??[]).length,3);
    assert.deepEqual([...html.matchAll(/#page=(\d+)"/g)].map(m=>Number(m[1])),order.map(r=>r.locator.page));
    assert(html.includes("原資料に基づく改変部分"));
  }
});
