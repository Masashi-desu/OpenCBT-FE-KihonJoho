/** Independently fixed from QS40–42. New formal geometry corrects omissions
 * in the immutable private preview, without weakening its code/control reader. */
import assert from'node:assert/strict';
import{readHeapProgram}from'./legacy-2018-pm-heap-oracle';
import{heapProgramReview}from'./legacy-2018-pm-heap-figure-review';
const attr=(tag:string,key:string)=>{const m=tag.match(new RegExp(`(?:^|\\s)${key}="([^"]*)"`));assert(m,`${key}: ${tag}`);return m[1];};
const coords=(tag:string,keys:string[])=>keys.map(k=>Number(attr(tag,k)));
function group(svg:string,index:number){const m=svg.match(new RegExp(`<g[^>]*data-region-cell="${index}"[^>]*>([\\s\\S]*?)</g>`));assert(m);return m[1];}
export function readSpring2018HeapRegions(svg:string){
 const labels=['0','1',null,'k−1','k','k+1',null,'hnum−1'];
 for(const [i,label]of labels.entries()){
  const g=group(svg,i),rects=[...g.matchAll(/<rect\b([^>]*)/g)],texts=[...g.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)];
  if(label===null){assert.equal(rects.length,0);assert.equal(texts.length,0);const lines=[...g.matchAll(/<line\b([^>]*)/g)];assert.equal(lines.length,2);for(const [j,line]of lines.entries()){assert.equal(attr(line[1],'stroke-dasharray'),'5 5');assert.deepEqual(coords(line[1],['x1','y1','x2','y2']),[160+i*110,j?120:70,270+i*110,j?120:70]);}}
  else{assert.equal(rects.length,1);assert.deepEqual(coords(rects[0][1],['x','y','width','height']),[160+i*110,70,110,50]);assert.equal(texts.length,1);assert.equal(texts[0][2],label);assert.deepEqual(coords(texts[0][1],['x','y']),[215+i*110,45]);}
 }
 for(const [key,expected]of [['data-target-range',[640,150,215,150]],['data-sorted-range',[765,150,1005,150]]]as const){const tag=svg.match(new RegExp(`<line ${key}="true"([^>]*)`))![1];assert.deepEqual(coords(tag,['x1','y1','x2','y2']),expected);const start=attr(tag,'marker-start'),end=attr(tag,'marker-end');assert.equal(start,end);const id=start.match(/^url\(#([^)]*)\)$/)![1],m=svg.match(new RegExp(`<marker id="${id}"([^>]*)>([\\s\\S]*?)</marker>`));assert(m);assert.equal(attr(m[1],'orient'),'auto-start-reverse');assert.equal(attr(m[1],'markerUnits'),'userSpaceOnUse');assert.deepEqual(coords(m[1],['markerWidth','markerHeight','refX','refY']),[10,10,10,5]);assert(m[2].includes('d="M0 0 L10 5 L0 10 Z"'));}
 const last=svg.match(/<line data-last-pointer="true"([^>]*)/)![1];assert.deepEqual(coords(last,['x1','y1','x2','y2']),[655,180,655,120]);assert(640<655&&655<765,'the last pointer separates the two range arrows');
 return{visibleIndexLabels:6,omittedGaps:2,dashedHorizontalEdges:4,rangeArrows:2,rangeArrowheads:4};
}
export function readSpring2018HeapTypedProgram(svg:string,which:'one'|'two'){
 const expected:Record<string,number>=which==='one'?{'makeHeap-declaration':3,'makeHeap-variables':1,'swap-declaration':3,'swap-variable':1}:{'heapSort-declaration':3,'last-variable':1,'downHeap-declaration':2,'downHeap-variables':1};
 let count=0;for(const m of svg.matchAll(/<g data-statement="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)){const spans=[...m[2].matchAll(/<tspan\b([^>]*)>([^<]*)<\/tspan>/g)];assert.equal(spans.length,expected[m[1]]??0,m[1]);for(const span of spans){assert.equal(attr(span[1],'data-source-integer-type'),'true');assert.equal(attr(span[1],'text-decoration'),'underline');assert.equal(span[2],'整数型');}count+=spans.length;}
 assert.equal(count,which==='one'?8:7);assert.equal((svg.match(/data-source-integer-type=/g)??[]).length,count);
 const flat=svg.replace(/<tspan\b[^>]*data-source-integer-type="true"[^>]*>整数型<\/tspan>/g,'整数型').replace(/<text data-line-heading="(?:heapSort|downHeap)"[^>]*>（行番号）<\/text>/g,'');
 if(which==='two')readHeapProgram(flat,which);else readSourceProgramOne(flat);
 return{underlinedTypes:count};
}
const decode=(s:string)=>s.replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#x27;',"'");
/** Read the actual segmented swap, rather than assuming whitespace reserves a box. */
function readSourceProgramOne(svg:string){
 const rows=[...svg.matchAll(/<g data-statement="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)].map(m=>{
  const texts=[...m[2].matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)];
  if(m[1]==='swap-k-b'){
   assert.equal(texts.length,2);assert.equal(attr(texts[0][1],'data-source-segment'),'prefix');assert.equal(attr(texts[1][1],'data-source-segment'),'close');
   assert.deepEqual(coords(texts[0][1],['x','y']),[124,292]);assert.deepEqual(coords(texts[1][1],['x','y']),[460,292]);
   assert.equal(decode(texts[0][2]),'・swap(heap, k, ');assert.equal(decode(texts[1][2]),')');
   return[m[1],124,292,`${decode(texts[0][2])}[b]${decode(texts[1][2])}`];
  }
  assert.equal(texts.length,1,m[1]);const t=texts[0];if(m[1].startsWith('blank-'))assert.equal(attr(t[1],'text-anchor'),'middle');
  return[m[1],...coords(t[1],['x','y']),decode(t[2])];
 });
 const wanted=heapProgramReview.one.map(row=>row[0]==='swap-k-b'?['swap-k-b',124,292,'・swap(heap, k, [b])']:row[0]==='blank-b'?['blank-b',395,292,'b']:[...row]);assert.deepEqual(rows,wanted);
 assert.deepEqual([...svg.matchAll(/<rect data-blank="([^"]+)"([^>]*)/g)].map(m=>[m[1],...coords(m[2],['x','y','width','height'])]),[['a',98,237,90,35],['b',350,273,90,35]]);
 const controls=[...svg.matchAll(/<g data-control="([^"]+)" data-kind="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g)];assert.equal(controls.length,heapProgramReview.controls.one.length);
 for(const[i,m]of controls.entries()){
  const[name,kind,x,top,bottom,otherwise]=heapProgramReview.controls.one[i];assert.equal(m[1],name);assert.equal(m[2],kind);
  assert.deepEqual([...m[3].matchAll(/<line\b([^>]*)/g)].map(t=>coords(t[1],['x1','y1','x2','y2'])),[[x,top+5,x,bottom-5],...(otherwise===null?[]:[[x,otherwise,x+20,otherwise]])]);
  if(kind==='loop'){assert(!m[3].includes('<polygon'));assert.deepEqual([...m[3].matchAll(/<rect\b([^>]*)/g)].map(t=>coords(t[1],['x','y','width','height'])),[[x-5,top-5,10,10],[x-5,bottom-5,10,10]]);}
  else{assert(!m[3].includes('<rect'));const triangles=[...m[3].matchAll(/<polygon\b([^>]*)/g)];assert.deepEqual(triangles.map(t=>attr(t[1],'points')),[`${x-6},${top+5} ${x},${top-6} ${x+6},${top+5}`,`${x-6},${bottom-5} ${x},${bottom+6} ${x+6},${bottom-5}`]);for(const t of triangles)assert.equal(attr(t[1],'style'),'fill:currentColor');}
 }
}
