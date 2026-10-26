import assert from "node:assert/strict";
/** Independent priority-ordered relaxation and exhaustive simple-path search.
 * No production generator/model/program interpreter is imported here. */
export function pm8Reference(matrix:number[][],sp:number,dp:number){
 const n=matrix.length;assert(n>1&&matrix.every(r=>r.length===n));for(let i=0;i<n;i++)for(let j=0;j<n;j++){assert(Number.isInteger(matrix[i][j]));assert.equal(matrix[i][j],matrix[j][i]);assert(i===j?matrix[i][j]===0:matrix[i][j]===-1||matrix[i][j]>0);}
 const distances=Array(n).fill(Infinity),previous=Array(n).fill(0),settled=new Set<number>(),queue:[[number,number]]|[number,number][]=[[0,sp]],trace:{point:number;distances:number[];previous:number[]}[]=[];distances[sp]=0;
 while(settled.size<n){queue.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let item=queue.shift();while(item&&settled.has(item[1]))item=queue.shift();if(!item){const remaining=Array.from({length:n},(_,i)=>i).find(i=>!settled.has(i))!;item=[Infinity,remaining];}const [cost,node]=item;assert.equal(cost,distances[node]);settled.add(node);
  for(let next=0;next<n;next++)if(matrix[node][next]>0&&!settled.has(next)&&cost+matrix[node][next]<distances[next]){distances[next]=cost+matrix[node][next];previous[next]=node;queue.push([distances[next],next]);}
  trace.push({point:node,distances:[...distances],previous:[...previous]});
 }
 const all:{route:number[];distance:number}[]=[];const walk=(route:number[],sum:number)=>{const last=route.at(-1)!;if(last===dp){all.push({route:[...route],distance:sum});return;}for(let next=0;next<n;next++)if(matrix[last][next]>0&&!route.includes(next))walk([...route,next],sum+matrix[last][next]);};walk([sp],0);assert(all.length);const distance=Math.min(...all.map(p=>p.distance)),shortest=all.filter(p=>p.distance===distance);assert.equal(distances[dp],distance);const reverse=[dp];while(reverse.at(-1)!==sp){assert(reverse.length<=n);reverse.push(previous[reverse.at(-1)!]);}assert(shortest.some(p=>JSON.stringify(p.route)===JSON.stringify([...reverse].reverse())));return {trace,distance,reverse,shortest,allSimplePaths:all.length};
}
/** A bounded, declarative evaluator of the four source blanks. Whitelisted
 * array/index forms are interpreted as data; no supplied code is executed. */
export function pm8SourceBlankInterpreter(matrix:number[][],holes:readonly[number,number,number,number],sp=0,dp=6){
 const n=matrix.length,d=Array(n).fill(Infinity),fixed=Array(n).fill(false),pRoute=Array(n).fill(0),sRoute=Array(n).fill(-1),points:number[]=[];d[sp]=0;
 for(let steps=0;steps<=n;steps++){
  let i=fixed.findIndex(b=>!b);if(i<0)break;if(steps===n)throw Error("NONTERMINATING_OR_INVALID_BLANK");
  for(let j=i+1;j<n;j++){const condition=[!fixed[i],!fixed[j],fixed[i],fixed[j]][holes[0]];if(condition&&d[j]<d[i])i=j;}
  const sPoint=i,index=[dp,n,n-1,sp,sPoint][holes[1]];if(index<0||index>=n)throw Error("INDEX_BOUNDS");fixed[index]=true;points.push(sPoint);
  for(let j=0;j<n;j++)if(matrix[sPoint][j]>0&&!fixed[j]&&d[sPoint]+matrix[sPoint][j]<d[j]){d[j]=d[sPoint]+matrix[sPoint][j];pRoute[j]=sPoint;}
 }
 let i=dp,j=0;const location=(which:number)=>{const array=which<4?pRoute:sRoute,index=[dp,i,j,sp][which%4];if(!Number.isInteger(index)||index<0||index>=n)throw Error("INDEX_BOUNDS");return {array,index};};
 while(i!==sp){if(j>=n)throw Error("BACKTRACK_CYCLE");const out=location(holes[2]);out.array[out.index]=i;const input=location(holes[3]);i=input.array[input.index];j++;}
 const last=location(holes[2]);last.array[last.index]=sp;return {distance:d[dp],reverse:sRoute.slice(0,j+1),points};
}
