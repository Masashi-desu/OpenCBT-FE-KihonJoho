import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Legacy2017DevelopmentFigure} from '../../src/ui/Legacy2017DevelopmentFigures';
import {Diagram} from '../../src/ui/Content';
import type {Block} from '../../src/core/types';
import {developmentActivityTopology} from './legacy-2017-development-facts';
const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const attrs=(s:string)=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const tags=(s:string,t:string)=>[...s.matchAll(new RegExp(`<${t}\\b([^>]*)>`,'g'))].map(m=>attrs(m[1]));
const texts=(s:string)=>[...s.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map(m=>({a:attrs(m[1]),text:decode(m[2])}));
const xy=(a:Record<string,string>)=>[Number(a.x),Number(a.y)],line=(a:Record<string,string>)=>['x1','y1','x2','y2'].map(k=>Number(a[k]));
const group=(s:string,key:string,value:string)=>{const m=s.match(new RegExp(`<g\\b(?=[^>]*${key}="${value}")[^>]*>([\\s\\S]*?)<\\/g>`));assert(m,`${key}=${value}`);return m[1];};
export const developmentFlowGeometry={
 wires:{'start-first':'M 360 25 L 360 80','first-true-assign':'M 480 130 L 620 130 L 620 175','first-false-merge':'M 360 180 L 360 275','first-assign-merge':'M 620 235 L 620 275 L 360 275','first-merge-second':'M 360 275 L 360 320','second-true-assign':'M 510 370 L 620 370 L 620 415','second-false-merge':'M 360 420 L 360 520','second-assign-merge':'M 620 475 L 620 520 L 360 520','second-merge-end':'M 360 520 L 360 565'},
 diamonds:['360,80 480,130 360,180 240,130','360,320 510,370 360,420 210,370'],
 rects:[[530,175,180,60],[530,415,180,60]],
 labels:[['first-condition',360,130,'X > 1'],['second-condition',360,370,'A = 2 or B = 0'],['first-assignment',620,205,'(X ÷ 2) → X'],['second-assignment',620,445,'(X + 1) → X'],['first-true',505,110,'真'],['first-false',330,205,'偽'],['second-true',535,350,'真'],['second-false',330,445,'偽']],
 description:'上からX>1を判定し、真なら(X÷2)をXへ代入、偽なら代入を迂回して合流する。次にA=2 or B=0を判定し、真なら(X+1)をXへ代入、偽なら代入を迂回して下で合流する。両方の判定は全ての実行で到達する。',
};
const reviewedCurves=[
 ['M 95 280 C 200 270 305 210 365 45','M 95 45 C 105 170 190 250 350 280','M 95 280 L 365 45','M 95 280 C 150 260 145 180 200 120 C 250 50 300 45 365 45'],
 ['M 95 280 C 190 274 295 235 370 60','M 95 55 C 110 185 210 255 360 280','M 95 280 L 370 65','M 95 280 C 135 265 135 165 190 100 C 235 65 300 60 370 60'],
 ['M 95 280 C 210 262 325 170 370 50','M 95 40 C 110 150 175 230 365 280','M 95 280 L 350 40','M 95 280 C 160 270 175 190 220 120 C 265 50 315 40 370 40'],
];
const curveDescriptions=['テスト消化につれて発見の増え方が加速する右上がりの曲線','テスト消化につれて累積件数が減少する右下がりの曲線','テスト消化に比例して累積件数が増え続ける直線','当初増えた後、追加のバグ発見が少なくなり、累積件数が頭打ちへ近づくS字状の曲線'];
export const developmentSvg=(profile:string,values:number[])=>renderToStaticMarkup(createElement(Legacy2017DevelopmentFigure,{profile,values,caption:'2017年度の独立図形検査'}));
function description(svg:string){const m=svg.match(/<desc id="([^"]+)">([^<]+)<\/desc>/);assert(m);assert(svg.includes(`aria-describedby="${m[1]}"`));assert.doesNotMatch(svg,/opacity="0"|visibility="hidden"|display="none"/);return decode(m[2]);}
export function readDevelopmentFlow(svg:string){
 assert.match(svg,/viewBox="0 0 800 590"/);assert.equal(description(svg),developmentFlowGeometry.description);
 const marker=tags(svg,'marker');assert.equal(marker.length,1);assert.deepEqual({...marker[0],id:'id'},{id:'id',viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto'});assert.deepEqual(tags(svg,'path').filter(p=>!('data-flow-wire'in p)),[{d:'M 1 1 L 9 5 L 1 9',fill:'none',stroke:'currentColor','stroke-width':'1.5'}]);
 const actual=tags(svg,'path').filter(p=>'data-flow-wire'in p);assert.equal(actual.length,9);for(const w of actual){const key=w['data-flow-wire'];assert.equal(w.d,developmentFlowGeometry.wires[key as keyof typeof developmentFlowGeometry.wires]);assert.equal(w.fill,'none');assert.equal(w['marker-end'],key==='first-assign-merge'||key==='second-assign-merge'?`url(#${marker[0].id})`:undefined);}
 assert.deepEqual(tags(svg,'polygon').map(p=>p.points),developmentFlowGeometry.diamonds);assert.deepEqual(tags(svg,'rect').map(a=>['x','y','width','height'].map(k=>Number(a[k]))),developmentFlowGeometry.rects);
 assert.deepEqual(texts(svg).map(t=>[t.a['data-flow-label'],...xy(t.a),t.text]),developmentFlowGeometry.labels);
 return{decisions:['X > 1','A = 2 or B = 0'],assignments:['(X ÷ 2) → X','(X + 1) → X'],bothReached:true};
}
/** Evaluate the actual visible cubic path, not its data label or alt. */
function curvePoints(path:string){
 const pieces=[...path.matchAll(/([MCL]) ([\d .]+)/g)];assert.equal(pieces.map(p=>p[0].trim()).join(' '),path);assert.equal(pieces[0][1],'M');let point=pieces[0][2].trim().split(/\s+/).map(Number);const samples=[point];
 for(const [,kind,raw]of pieces.slice(1)){const n=raw.trim().split(/\s+/).map(Number),start=point;assert.equal(n.length,kind==='L'?2:6);for(let step=1;step<=100;step++){const t=step/100,u=1-t;point=kind==='L'?[start[0]+t*(n[0]-start[0]),start[1]+t*(n[1]-start[1])]:[u**3*start[0]+3*u*u*t*n[0]+3*u*t*t*n[2]+t**3*n[4],u**3*start[1]+3*u*u*t*n[1]+3*u*t*t*n[3]+t**3*n[5]];samples.push(point);}}
 return samples;
}
export function readDevelopmentCurve(svg:string,variant:number,choice:number){
 assert.equal(tags(svg,'figure')[0]['aria-label'],`縦軸は累積バグ件数、横軸はテスト項目消化件数。${curveDescriptions[choice]}。`);const title=svg.match(/<title[^>]*>([^<]*)<\/title>/);assert(title);assert.equal(decode(title[1]),`2017年度の独立図形検査。${curveDescriptions[choice]}。`);assert.match(svg,/viewBox="0 0 440 360"/);assert.equal(description(svg),`縦軸は累積バグ件数、横軸はテスト項目消化件数。${curveDescriptions[choice]}。`);
 const axes=tags(svg,'path').filter(a=>'data-chart-axis'in a);assert.deepEqual(axes.map(a=>[a['data-chart-axis'],a.d]),[['y','M 95 25 L 95 280'],['x','M 95 280 L 390 280']]);assert.equal(tags(svg,'marker').length,0);assert.equal(tags(svg,'path').length,3);
 assert.deepEqual(texts(svg).map(t=>[t.a['data-chart-label'],...xy(t.a),t.text]),[['y',55,75,'累積バグ件数'],['x',245,325,'テスト項目消化件数']]);assert.match(texts(svg)[0].a.style,/writing-mode:vertical-rl/);
 const paths=tags(svg,'path').filter(p=>'data-bug-curve'in p);assert.equal(paths.length,1);const path=paths[0].d;assert.equal(path,reviewedCurves[variant][choice]);assert.equal(paths[0].fill,'none');
 const points=curvePoints(path),slopes=points.slice(1).map((p,i)=>{assert(p[0]>points[i][0]);assert(p[0]>=95&&p[0]<=390&&p[1]>=25&&p[1]<=280);return(points[i][1]-p[1])/(p[0]-points[i][0]);});
 const declining=slopes.every(n=>n<0),nondecreasing=slopes.every(n=>n>=-1e-9),constant=slopes.every(n=>Math.abs(n-slopes[0])<1e-9),plateau=nondecreasing&&slopes.at(-1)!<slopes[0]*.1&&Math.max(...slopes)>slopes[0]*2;
 const role=declining?'declining-cumulative-invalid':constant?'constant-discovery-rate':plateau?'discovery-rate-falls-to-plateau':'accelerating-discovery';if(role==='accelerating-discovery'){assert(nondecreasing);assert(slopes.at(-1)!>slopes[0]*2);}
 assert.equal(role,['accelerating-discovery','declining-cumulative-invalid','constant-discovery-rate','discovery-rate-falls-to-plateau'][choice]);return{role,points,slopes};
}
const activityCenters=[[46,178],[253,178],[445,49],[473,178],[499,306],[693,178],[900,178]];
export function developmentActivitySvg(block:Extract<Block,{type:'diagram'}>){return renderToStaticMarkup(createElement(Diagram,{scene:block.scene,alt:block.alt,caption:block.caption,rendererRef:block.rendererRef}));}
export function readDevelopmentActivity(svg:string){
 assert.match(svg,/class="activity-network-scene" viewBox="0 0 1000 500"/);const nodes=tags(svg,'circle').filter(a=>a.class==='activity-node');assert.deepEqual(nodes.map(a=>[Number(a.cx),Number(a.cy),Number(a.r)]),activityCenters.map(p=>[...p,25]));const marker=tags(svg,'marker');assert.equal(marker.length,1);assert.equal(marker[0].orient,'auto-start-reverse');
 const endpoints=(from:number,to:number)=>{const a=activityCenters[from],b=activityCenters[to],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);return[a[0]+25*dx/length,a[1]+25*dy/length,b[0]-27*dx/length,b[1]-27*dy/length];};
 const durations:number[]=[];for(const[name,from,to]of developmentActivityTopology.filter(([name])=>!name.startsWith('dummy'))){const g=group(svg,'data-activity',name),ts=texts(g),edge=tags(g,'line');assert.equal(edge.length,1);line(edge[0]).forEach((n,i)=>assert(Math.abs(n-endpoints(from,to)[i])<1e-9));assert.equal(edge[0]['marker-end'],`url(#${marker[0].id})`);assert.equal(ts.length,2);assert.equal(ts[0].text,name);assert.match(ts[1].text,/^[1-5]?\d$/);durations.push(Number(ts[1].text));const a=activityCenters[from],b=activityCenters[to],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;assert.deepEqual(xy(ts[0].a),[mx+dy/length*21,my-dx/length*21]);assert.deepEqual(xy(ts[1].a),[mx-dy/length*25,my+dx/length*25]);}
 const dummies=tags(svg,'line').filter(a=>a.class==='dummy-edge');assert.equal(dummies.length,3);developmentActivityTopology.slice(8).forEach(([,from,to],i)=>{line(dummies[i]).forEach((n,j)=>assert(Math.abs(n-endpoints(from,to)[j])<1e-9));assert.equal(dummies[i]['marker-end'],`url(#${marker[0].id})`);assert(Number(dummies[i].y2)>Number(dummies[i].y1));});assert.deepEqual(texts(group(svg,'class','activity-legend')).map(t=>t.text),['凡例','作業名','所要日数','：ダミー作業']);return durations;
}
