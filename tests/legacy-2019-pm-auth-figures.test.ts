/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Legacy2019PmAuthFigure} from "../src/ui/Legacy2019PmAuthFigures";
import {readLegacy2019PmAuthNetwork as network,readLegacy2019PmAuthSequence as sequence} from "./fixtures/legacy-2019-pm-auth-figure-reader";
import localDomains from "../src/core/generators/legacy-2019-pm-auth-figure-domains.json";
import yearDomains from "./fixtures/legacy-2019-spring-local-domains.json";
const render=(name:string)=>renderToStaticMarkup(createElement(Legacy2019PmAuthFigure,{profile:`legacy-2019-auth-${name}`,values:[0],caption:`図 ${name}`}),{identifierPrefix:`pm1-${name}-`});
test("2019 spring PM1 rendered source geometry retains all network hosts,wires,ten directed messages and solid/dashed semantics",()=>{assert.equal(Object.keys(localDomains).length,2);for(const[profile,domain]of Object.entries(localDomains)){assert.deepEqual(domain,[[0,0]]);assert.deepEqual(yearDomains[profile as keyof typeof yearDomains],domain);}assert.deepEqual(network(render("network")),{hosts:7,wires:9,ports:9});assert.deepEqual(sequence(render("sequence")),{lifelines:4,messages:10,replyMessages:5,boxes:11});});
test("2019 spring PM1 independent visible geometry reader rejects disconnected host,reversed wire,wrong reply style and swapped sender labels",()=>{
 const n=render("network"),s=render("sequence");for(const wrong of[n.replace('y2="330"','y2="329"'),n.replace(">プロキシ<",">認証<"),n.replace('stroke-dasharray="10 7"',"")]){assert.notEqual(wrong,n);assert.throws(()=>network(wrong));}
 for(const wrong of[s.replace('x1="411" y1="115" x2="189"','x1="411" y1="115" x2="250"'),s.replace('marker-end="url(#', 'marker-missing="url(#'),s.replace('stroke-dasharray="10 7"',""),s.replace(">③<",">⑤<")]){assert.notEqual(wrong,s);assert.throws(()=>sequence(wrong));}
 const combined=n+s,ids=[...combined.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 assert.throws(()=>renderToStaticMarkup(createElement(Legacy2019PmAuthFigure,{profile:"legacy-2019-auth-network",values:[1],caption:"図"})),/PARAMETER_CONSTRAINT/);
});
