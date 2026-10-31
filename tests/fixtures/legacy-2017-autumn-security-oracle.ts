import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';
import facts from './legacy-2017-autumn-security-facts.json';
const text=(blocks:GeneratedBody['choices'][number])=>{assert.equal(blocks.length,1);const b=blocks[0];assert(b.type==='paragraph');return b.text;};
const riskCore=['analyze','evaluate','identify'];
/** Independent reviewed classifications of actual operations, not producer indices. */
export function legacy2017AutumnSecurityOracle(source:string,body:GeneratedBody,values:number[]){
 assert.equal(values.length,1);assert(Number.isInteger(values[0]));const f=facts.conditions.find(r=>r.source===source&&r.variant===values[0]);assert(f);const n=Number(source.split('-').at(-1));assert.equal(body.prompt.length,n===44?2:1);assert.equal(body.choices.length,4);const p=body.prompt[0];assert(p.type==='paragraph');assert.equal(p.text,f.fullStem);assert.deepEqual(body.choices.map(text),f.fullChoices);assert.equal(body.explanation,f.explanation);
 let truth:boolean[];
 if(n===38){const traits=f.mechanismSignature;assert(traits);truth=traits.map(t=>t.keyModel==='asymmetric'&&t.mechanism==='composite_modulus_factorization_related');assert.equal(traits[1].mechanism,'dh_key_agreement_FFC_or_ECC_unspecified_by_original');assert.equal(traits[0].mechanism,values[0]===0?'keyed_128bit_block_transform':'secret_key_keystream_generator');}
 else{const ref=facts.primaryClassification.records.find(r=>r.source===source&&r.variant===values[0]);assert(ref);if(n===43){truth=ref.classification.choices.map(c=>{assert(Array.isArray(c));return JSON.stringify([...c].sort())===JSON.stringify(riskCore);});}else truth=ref.classification.choices.map(c=>c===ref.classification.query);}
 assert.deepEqual(truth,f.truth);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));
 if(n===44){const b=body.prompt[1];assert(b.type==='diagram'&&b.scene.kind==='source_figure');assert.equal(b.caption,'データベースへの接続と盗聴位置');assert.equal(b.scene.profile,'legacy-2017-database-transport');assert.deepEqual(b.scene.values,[0]);assert.equal(b.alt,'クライアントとサーバの二つの外枠。クライアントの中は上にアプリケーション、下にデータベース接続プログラム、サーバの中は上にデータベース、下にデータベース接続プログラム。それぞれ上下の内枠を線で接続し、下のプログラムから共有の横線へ接続する。横線の両端は塗りつぶした四角。横線中央から、下にある「攻撃者による盗聴」の枠へ下向き破線矢印が伸びる。');}
 assert.doesNotMatch(body.explanation,/自動修復|数学的に同値|必ず秘密を隠す|DHは有限体に限定/);return truth;
}
/** Same-length tampering is observable in content, but not in the length pair. */
export function signatureLengthCounterexamples(){const words=['0000','0001','0010','0100','1000','1111'],signature='signed-original';return words.flatMap((a,i)=>words.slice(i+1).map(b=>({a,b,observedA:[signature.length,a.length],observedB:[signature.length,b.length]})));}
export function riskTriples(){const names=['identify','analyze','evaluate','treat','accept','monitor'];const rows=[];for(let a=0;a<names.length;a++)for(let b=a+1;b<names.length;b++)for(let c=b+1;c<names.length;c++){const triple=[names[a],names[b],names[c]];rows.push({triple,valid:JSON.stringify([...triple].sort())===JSON.stringify(riskCore)});}return rows;}
