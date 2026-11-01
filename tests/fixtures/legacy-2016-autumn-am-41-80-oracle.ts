import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import type {Block} from '../../src/core/types';
import type {GeneratedBody} from '../../src/core/generators/definition';
import knowledge from './legacy-2016-autumn-am-41-80-oracle.json';
/** Hand-reviewed expected truth, kept independent of the generator and its answer calculation. */
export const autumn2016Am4180Knowledge=knowledge;
export const bodyText=(blocks:readonly Block[]):string=>blocks.map(b=>b.type==='paragraph'?b.text:b.type==='list'?b.items.join('\n'):b.type==='table'?[b.columns.join(' '),...b.rows.map(r=>r.join(' '))].join('\n'):'').join('\n');
const numeric=(s:string)=>Number(s.replaceAll(',',''));
function oneTable(b:GeneratedBody){const ts=b.prompt.filter(q=>q.type==='table');assert.equal(ts.length,1);return ts[0] as Extract<Block,{type:'table'}>;}
function vals(b:GeneratedBody){return b.choices.map(x=>numeric(bodyText(x)));}
function fig(b:GeneratedBody){const q=b.prompt.find(q=>q.type==='diagram');assert(q?.type==='diagram'&&q.scene.kind==='source_figure');return q.scene.values;}
function trueNumber(b:GeneratedBody,expected:number){const c=vals(b);assert.equal(new Set(c).size,4);return c.map(v=>v===expected);}
export function assertAutumn2016Knowledge(n:number,i:number,b:GeneratedBody){
 const r=knowledge.questions[String(n) as keyof typeof knowledge.questions];assert(r,`independent knowledge missing ${n}`);assert(r.truths[i]);assert(r.principle.length>25&&r.references.length>0);
 assert.equal(createHash('sha256').update(bodyText([b.prompt[0]])).digest('hex'),r.promptSHA256[i],`${n}/${i}: reviewed question condition`);
 assert.equal(b.choices.length,4);const ss=b.choices.map(bodyText);
 const hashes=ss.map(s=>createHash('sha256').update(s).digest('hex'));assert.deepEqual(hashes,r.statementSHA256[i],`${n}/${i}: every reviewed assertion, not just the marked answer`);
 const expected=[...r.truths[i]].map(x=>x==='1');assert.equal(expected.filter(Boolean).length,1);assert.equal(b.correctIndex,expected.indexOf(true));return expected;
}
/** Exact reference solver reads the shown conditions; no production case/answer helper imported. */
export function autumn2016QuantitativeTruth(n:number,b:GeneratedBody):boolean[]{
 const prompt=bodyText(b.prompt);
 if(n===48){const match=prompt.match(/整数([\d,]+)～([\d,]+)を有効.*?([\d,]+)～([\d,]+)の場合は処理A.*?([\d,]+)～([\d,]+)の場合は処理B/);assert(match);const [lo,hi,a,z,z1,bhi]=match.slice(1).map(numeric);assert.equal(lo,a);assert.equal(hi,bhi);assert.equal(z+1,z1);const tests=new Set([lo-1,lo,z,z1,hi,hi+1]);for(const [left,right]of [[lo,z],[z1,hi]]){assert(right-left>=2);tests.add(left+1);}assert.match(prompt,/境界値でない/);assert.match(prompt,/無効同値クラス/);return trueNumber(b,tests.size);}
 if(n===54){const m=prompt.match(/開発期間(\d+)か月，開発工数(\d+)人月/);assert(m);const months=+m[1],work=+m[2],t=oneTable(b);assert.deepEqual(t.rows.map(r=>r[0]),['工数配分（%）','期間配分（%）']);const totals=t.rows.map(r=>r.slice(1).map(numeric));assert.equal(totals[0].reduce((a,b)=>a+b),100);assert.equal(totals[1].reduce((a,b)=>a+b),100);const people=totals[0].map((percent,j)=>(work*percent)/(months*totals[1][j]));assert(people.every(Number.isInteger));assert.equal(people.filter(x=>x===Math.max(...people)).length,1);assert.match(prompt,/各工程では開始から終了までの要員数は一定/);return trueNumber(b,Math.max(...people));}
 if(n===62){const t=oneTable(b),[a,bb]=t.rows[0].slice(1).map(numeric),[ya,yb]=t.rows[1].slice(1).map(numeric);assert.match(prompt,/毎年均等/);assert.match(prompt,/利率は考慮しない/);const left=bb*ya,right=a*yb;return [left===right,2*left===right,2*left===3*right,left===2*right];}
 if(n===64){const t=oneTable(b);assert.equal(t.rows.length,3);const scores=[0,0,0,0];for(const row of t.rows){const weight=numeric(row[1]);for(let j=0;j<4;j++)scores[j]+=weight*numeric(row[j+2]);}const best=Math.max(...scores);assert.equal(scores.filter(s=>s===best).length,1);assert.deepEqual(b.choices.map(bodyText),['案1','案2','案3','案4']);return scores.map(s=>s===best);}
 if(n===68){const match=prompt.match(/図の([abcd])に/);assert(match);assert.match(prompt,/ア～エはa～dのいずれかに対応/);const buyer=['Customer Value','Cost','Convenience','Communication']['abcd'.indexOf(match[1])];return b.choices.map(c=>bodyText(c).startsWith(buyer+'（'));}
 if(n===71){const h=prompt.match(/月間(\d+)時間/);assert(h);assert.match(prompt,/並行して製造することはできない/);const t=oneTable(b);const p=t.rows[0].slice(1).map(numeric),dur=t.rows[1].slice(1).map(numeric),max=t.rows[2].slice(1).map(numeric),capacity=+h[1]*60;let best=-Infinity;for(let x=0;x<=max[0];x++)for(let y=0;y<=max[1];y++){const time=x*dur[0]+y*dur[1];if(time>capacity)break;const z=Math.min(max[2],Math.floor((capacity-time)/dur[2]));best=Math.max(best,x*p[0]+y*p[1]+z*p[2]);}return trueNumber(b,best);}
 if(n===72){const[i,q,bcount,direct,indirect,stock]=fig(b);assert.match(prompt,new RegExp('Aを'+q+'個生産'));assert.match(prompt,new RegExp('在庫は'+stock+'個'));const tree={id:'A',children:[{id:'B',count:bcount,children:[{id:'D',count:1},{id:'E',count:1},{id:'C',count:indirect}]},{id:'C',count:direct}]};let c=0;const visit=(node:any,units:number)=>{if(node.id==='C')c+=units;for(const child of node.children??[])visit(child,units*child.count);};visit(tree,q);return trueNumber(b,c-stock);}
 if(n===78){const[index,_drawingMax,s,k,x]=fig(b);assert(s<x&&x<k);if(index){assert(2*x>k+s);assert.match(prompt,new RegExp('S（'+s+'個）'));assert.match(prompt,new RegExp('X（'+x+'個）'));}assert.match(prompt,/発注直後の発注量の変更は可能/);assert.match(prompt,/最大在庫量を超えてはならない/);return b.choices.map(bs=>{const text=bodyText(bs),m=text.match(/^([ESKX＋－−]+)(?:を追加発注する。|だけの発注を取り消す。)$/);assert(m);const coeff:Record<string,number>={E:0,S:0,K:0,X:0};let sign=1;for(const ch of m[1])if(ch==='＋')sign=1;else if(ch==='－'||ch==='−')sign=-1;else coeff[ch]+=sign;
 // The excess over the original maximum is X-S+delta: E cancels with max=E+S.
 const delta=text.includes('追加')?1:-1;const excess={E:delta*coeff.E,S:delta*coeff.S-1,K:delta*coeff.K,X:delta*coeff.X+1};
 if(index===0)return Object.values(excess).every(c=>c===0); // Identity for all legal symbol values, never latent drawing K.
 // Numeric S/X are shown in the prompt and K in the original diagram label.
 // E remains an arbitrary positive order quantity; no hidden maximum is substituted.
 const constant=excess.S*s+excess.K*k+excess.X*x;
 return excess.E===0&&constant===0;
 });}

 throw Error('ORACLE_MISSING '+n);
}
