/** Read visible source-table text and geometry, not renderer's data model. */
import assert from 'node:assert/strict';import review from './legacy-2017-pm3-review.json';
const decode=(s:string)=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#x27;/g,"'");
function attr(s:string,k:string){const m=s.match(new RegExp('(?:^|\\s)'+k+'="([^"]*)"'));assert(m,k);return decode(m[1]);}
function tags(svg:string,tag:string,key:string){return [...svg.matchAll(new RegExp('<'+tag+'\\b([^>]*\\b'+key+'="[^"]*"[^>]*)>([\\s\\S]*?)<\\/'+tag+'>|<'+tag+'\\b([^>]*\\b'+key+'="[^"]*"[^>]*)\\/?>','g'))].map(m=>({a:m[1]??m[3],text:decode((m[2]??'').replace(/<[^>]*>/g,''))}));}
export function readLegacy2017Pm3Figure(svg:string){
 assert(!/<script\b/.test(svg));const source=review.original.orderedBlocks.find(b=>b.kind==='figure')!;const expected=source.tables!;
 const frames=tags(svg,'rect','data-pm3-frame'),headers=tags(svg,'text','data-pm3-header'),data=tags(svg,'text','data-pm3-data'),keys=tags(svg,'line','data-pm3-primary-key'),captions=tags(svg,'text','data-pm3-table-caption');
 assert.equal(frames.length,4);assert.equal(headers.length,14);assert.equal(data.length,14);assert.equal(keys.length,5);assert.deepEqual(captions.map(c=>c.text),expected.map(t=>t.caption));assert.equal(tags(svg,'line','data-pm3-column-divider').length,10);assert.equal(tags(svg,'line','data-pm3-row-divider').length,4);
 const bounds=frames.map(f=>({x:Number(attr(f.a,'x')),y:Number(attr(f.a,'y')),w:Number(attr(f.a,'width')),h:Number(attr(f.a,'height'))}));assert(bounds[0].x+bounds[0].w<bounds[1].x);assert(bounds[0].y===bounds[1].y);assert(bounds[2].y>bounds[0].y+bounds[0].h);assert(bounds[3].y>bounds[2].y+bounds[2].h);
 let foundKeys=0;
 expected.forEach((t,i)=>{const box=bounds[i],hs=headers.filter(h=>h.text&&Number(attr(h.a,'y'))>box.y&&Number(attr(h.a,'y'))<box.y+box.h/2&&Number(attr(h.a,'x'))>=box.x&&Number(attr(h.a,'x'))<box.x+box.w).sort((a,b)=>Number(attr(a.a,'x'))-Number(attr(b.a,'x'))),ds=data.filter(d=>Number(attr(d.a,'y'))>box.y+box.h/2&&Number(attr(d.a,'y'))<box.y+box.h&&Number(attr(d.a,'x'))>=box.x&&Number(attr(d.a,'x'))<box.x+box.w).sort((a,b)=>Number(attr(a.a,'x'))-Number(attr(b.a,'x')));assert.deepEqual(hs.map(h=>h.text),t.headers);assert.deepEqual(ds.map(d=>d.text),t.rows[0]);assert(Number(attr(captions[i].a,'y'))<box.y);
  hs.forEach((h,j)=>{const x=Number(attr(h.a,'x')),y=Number(attr(h.a,'y')),length=Number(attr(h.a,'textLength'));assert(length>0&&x+length<box.x+box.w);assert(Number(attr(ds[j].a,'x'))===x);const matches=keys.filter(k=>Number(attr(k.a,'x1'))===x&&Number(attr(k.a,'x2'))===x+length&&Number(attr(k.a,'y1'))>y&&Number(attr(k.a,'y1'))<y+10&&attr(k.a,'y1')===attr(k.a,'y2'));assert.equal(matches.length,t.primaryKeyColumns.includes(j)?1:0,h.text);foundKeys+=matches.length;});
 });
 assert.equal(foundKeys,5);const desc=decode(svg.match(/<desc[^>]*>([\s\S]*?)<\/desc>/)![1]);for(const t of expected)for(const s of [...t.headers,...t.rows.flat()])assert(desc.includes(s));
 return{tables:4,headers:14,data:14,primaryKeyUnderlines:foundKeys,captions:captions.map(c=>c.text)};
}
