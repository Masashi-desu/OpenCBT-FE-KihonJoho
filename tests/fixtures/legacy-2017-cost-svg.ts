import assert from "node:assert/strict";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Legacy2017Figure} from "../../src/ui/Legacy2017Figures";
/** Read the actual renderer output. Expectations do not use the renderer's data
 * model or the production generator's cost formulas. */
export function legacy2017RenderedCostTable(profile:string,values:number[]){
 const svg=renderToStaticMarkup(React.createElement(Legacy2017Figure,{profile,values,caption:"開発方法と費用・月当たりの人数"})),cells=new Map<string,string>(),headings=new Map<string,string>();
 for(const m of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)){
  const text=m[2].replace(/<[^>]+>/g,"").replaceAll(",","");const cell=m[1].match(/data-cell="([^"]+)"/),heading=m[1].match(/data-heading="([^"]+)"/);
  if(cell){assert.ok(!cells.has(cell[1]));cells.set(cell[1],text);}if(heading){assert.ok(!headings.has(heading[1]));headings.set(heading[1],text);}
 }
 assert.equal(cells.size,28);assert.deepEqual([...headings.entries()],[["method","開発方法"],["purchase","購入費（万円）"],["external","委託費（万円）"],["monthly-people","月当たりの人数（人）"],["phase-0","作成工程"],["phase-1","改造工程"],["phase-2","評価工程"]]);assert.equal([...svg.matchAll(/<line /g)].length,15);
 const rows=Array.from({length:4},(_,r)=>Array.from({length:7},(_,c)=>{const text=cells.get(`${r}-${c}`);assert.ok(text!==undefined);return text;}));return {rows,headings,svg};
}
