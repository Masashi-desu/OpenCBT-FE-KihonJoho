import assert from "node:assert/strict";
const attrs=(s:string)=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const expectedSizes=[[500,100,800,800],[400,200,600,800],[600,100,400,800]];
const geometry=[[[40,166.7],[206.7,100],[306.7,266.7],[573.4,266.6]],[[40,152.4],[192.4,114.3],[306.7,228.6],[535.3,304.7]],[[40,228.6],[268.6,114.3],[382.9,152.4],[535.3,304.7]]];
export function readAutumnPlatformMemorySvg(svg:string,v:number){
 assert(Number.isInteger(v)&&v>=0&&v<3);
 const a=attrs(svg.match(/<svg\b[^>]*>/)![0]);assert.equal(a.viewBox,"0 0 900 200");assert.equal(a.role,"img");
 const title=svg.match(/<title id="([^"]+)">([^<]*)<\/title>/)!,desc=svg.match(/<desc id="([^"]+)">([^<]*)<\/desc>/)!;
 assert.equal(a["aria-labelledby"],title[1]);assert.equal(a["aria-describedby"],desc[1]);assert.equal(title[2],"メモリマップ");
 assert.equal(desc[2],`メモリマップ。左からセグメント1が${expectedSizes[v][0]}kバイト、セグメント2が${expectedSizes[v][1]}kバイト、セグメント3が${expectedSizes[v][2]}kバイト、空き領域が${expectedSizes[v][3]}kバイト。四つの区画はこの順に隣接している。`);
 const rects=[...svg.matchAll(/<rect\b[^>]*>/g)].map(m=>attrs(m[0]));assert.equal(rects.length,4);
 for(let i=0;i<4;i++){const r=rects[i];assert.equal(r["data-memory-region"],String(i));assert.deepEqual([Number(r.x),Number(r.width)],geometry[v][i]);assert.equal(r.y,"35");assert.equal(r.height,"75");assert.equal(r.fill,"none");if(i)assert(Math.abs(Number(rects[i-1].x)+Number(rects[i-1].width)-Number(r.x))<.001);}
 const labels=[...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map(m=>({a:attrs(m[1]),body:m[2]}));assert.equal(labels.length,8);
 for(let i=0;i<4;i++){
  const label=labels.find(t=>t.a["data-memory-label"]===String(i))!,size=labels.find(t=>t.a["data-memory-size"]===String(i))!,center=Number(rects[i].x)+Number(rects[i].width)/2;
  assert.equal(Number(label.a.x),center);assert.equal(label.a.y,i===1?"61":"75");assert.equal(label.a["text-anchor"],"middle");
  const text=label.body.replace(/<[^>]+>/g,"");assert.equal(text,i===3?"空き":`セグメント${i+1}`);
  if(i===1){const ts=[...label.body.matchAll(/<tspan\b([^>]*)>([^<]*)<\/tspan>/g)].map(m=>({a:attrs(m[1]),text:m[2]}));assert.equal(ts.length,2);assert(ts.every(t=>Number(t.a.x)===center));assert.equal(ts[1].a.dy,"26");}
  assert.equal(Number(size.a.x),center);assert.equal(size.a.y,"150");assert.equal(size.a.style,"font-size:22px");assert.equal(size.a["text-anchor"],"middle");assert.equal(size.body,`${expectedSizes[v][i]}kバイト`);
 }
 // Return the actual drawn text, not profile values or production constants.
 return labels.filter(t=>t.a["data-memory-size"]!==undefined).sort((a,b)=>Number(a.a.x)-Number(b.a.x)).map(t=>Number(t.body.replace("kバイト","")));
}
