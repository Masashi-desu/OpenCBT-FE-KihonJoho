/** Test-only oracle. Expected values come from the separately pinned UCD17
 * fixture, never from the runtime array or renderer under examination. */
import assert from 'node:assert/strict';
import reference from './legacy-2018-spring-pm12-unicode-oracle.json';
export const springPm12IndependentUnicodeRows=reference.facts.map(f=>[f.label,f.value]);
export const springPm12IndependentUnicodeText=springPm12IndependentUnicodeRows.map(row=>row.join(' ')).join('\n');
export function assertSpringPm12UnicodeNative(html:string,inspectText:string,alt:string){
 assert.equal(reference.version,'17.0.0');assert.equal(reference.sourceSHA256,'2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c');
 assert.equal(springPm12IndependentUnicodeRows.length,12);assert.equal(new Set(springPm12IndependentUnicodeRows.map(r=>r[0])).size,12);assert.equal(new Set(springPm12IndependentUnicodeRows.map(r=>r[1])).size,12);
 const tables=[...html.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)];assert.equal(tables.length,1,'UNICODE_REFERENCE_ONE_TBODY');
 const rows=[...tables[0][1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>[...m[1].matchAll(/<td>([^<]*)<\/td>/g)].map(c=>c[1]));
 assert.equal(rows.length,12,'UNICODE_REFERENCE_EXACTLY12_ROWS');assert(rows.every(r=>r.length===2),'UNICODE_REFERENCE_TWO_CELLS');
 assert.equal(new Set(rows.map(r=>r[0])).size,12,'UNICODE_REFERENCE_UNIQUE_LABELS');assert.equal(new Set(rows.map(r=>r[1])).size,12,'UNICODE_REFERENCE_UNIQUE_VALUES');
 assert.deepEqual(rows,springPm12IndependentUnicodeRows,'ACTUAL_UNICODE_REFERENCE_MUST_MATCH_INDEPENDENT_UCD12');
 assert.equal(inspectText,springPm12IndependentUnicodeText,'UNICODE_SEARCH_FACTS_MUST_MATCH_INDEPENDENT_UCD12');
 assert.equal(alt,'独立参考：この問題で使用する文字と符号値（Unicode 17.0.0）。'+springPm12IndependentUnicodeText+'。別資料から必要な12事実を再構成した独立参考で、公式の付属文字表そのものではない。原問題の文字定数・1語16ビットの規則は変更していない。','UNICODE_ALT_MUST_MATCH_INDEPENDENT_UCD12');
 return rows;
}
