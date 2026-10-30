/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Legacy2019Pm8Figure} from "./fixtures/legacy-2019-spring-local-pm8-figures";
import {readLegacy2019Pm8Tree as tree,readLegacy2019Pm8Arrays as arrays,readLegacy2019Pm8Program as program,readLegacy2019Pm8Ratio as ratio} from "./fixtures/legacy-2019-pm8-figure-reader";
const render=(name:string)=>renderToStaticMarkup(createElement(Legacy2019Pm8Figure,{profile:`legacy-2019-huffman-${name}`,values:[0],caption:"原形式の図"}),{identifierPrefix:`pm8-${name}-`});
test("2019 spring PM8 actual circles/branches/bits/path and child-to-parent array arrows preserve source fixed alpha",()=>{tree(render("alpha-tree"));tree(render("alpha-path"),true);arrays(render("alpha-arrays"));ratio(render("ratio"));});
test("2019 spring PM8 visible full programs preserve every source line, comment, blank and nested control span",()=>{assert.equal(program(render("program1"),1).length,25);assert.equal(program(render("program2"),2).length,8);});
test("2019 spring PM8 readers reject reversed branch bit, moved arrow/value/control/else, missing comment/blank and swapped fraction",()=>{
 const a=render("alpha-tree");assert.throws(()=>tree(a.replace('x="500" y="60" text-anchor="middle">19','x="500" y="60" text-anchor="middle">18')));const b=render("alpha-path");assert.throws(()=>tree(b.replace('x="390" y="65" text-anchor="middle">0','x="390" y="65" text-anchor="middle">1'),true));const ar=render("alpha-arrays");assert.throws(()=>arrays(ar.replace('198,315 198,535 946,535 946,315','198,315 198,535 820,535 820,315')));
 const p=render("program1");assert.throws(()=>program(p.replace(/(>parent\[i\] ← size)  \/\* 子に親の要素番号を格納 \*\/(<\/text>)/,'$1$2'),1));assert.throws(()=>program(p.replace('x1="140" y1="931" x2="140" y2="1182"','x1="140" y1="931" x2="140" y2="1227"'),1));assert.throws(()=>program(p.replace('>c</text>','></text>'),1));const q=render("program2");assert.throws(()=>program(q.replace('x1="185" y1="258" x2="210" y2="258"','x1="185" y1="213" x2="210" y2="213"'),2));const r=render("ratio");assert.throws(()=>ratio(r.replace('x="740" y="47"','x="740" y="140"')));
});
