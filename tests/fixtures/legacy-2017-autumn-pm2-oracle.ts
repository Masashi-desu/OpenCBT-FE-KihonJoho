/** Independent state-space reference. No producer/model imports. */
import assert from 'node:assert/strict';
export const autumnPm2Worksheet=[{initial:100,plus:30,minus:50,free:1},{initial:120,plus:40,minus:60,free:0},{initial:200,plus:50,minus:80,free:1},{initial:160,plus:20,minus:40,free:0}];
export function independentLostUpdates(initial:number,plus:number,minus:number){
 const paths:string[]=[],outcomes=new Set<number>();
 function visit(pc:number[],local:number[],value:number,trace:string){if(pc[0]===3&&pc[1]===3){paths.push(trace);outcomes.add(value);return;}
  for(let process=0;process<2;process++)if(pc[process]<3){const nextPc=[...pc],nextLocal=[...local];let nextValue=value;const step=nextPc[process]++;if(step===0)nextLocal[process]=value;else if(step===1)nextLocal[process]+=process===0?plus:-minus;else nextValue=nextLocal[process];visit(nextPc,nextLocal,nextValue,trace+String(process+1));}
 }visit([0,0],[0,0],initial,'');assert.equal(paths.length,20);return{outcomes,paths};
}
type State={pc:number[];local:number[];value:number;sem:number};
/** Model each of the eight printed operations literally, with atomic P/V.
 * Blocked operations have no transition, allowing the other CPU process. */
export function independentSemaphore(initial:number,plus:number,minus:number,free:number,p:number,v:number){
 const queue:State[]=[{pc:[0,0],local:[0,0],value:initial,sem:free}],seen=new Set<string>();let overlap=false,deadlock=false,completed=0;const finals=new Set<number>();
 for(let at=0;at<queue.length;at++){const s=queue[at],key=JSON.stringify(s);if(seen.has(key))continue;seen.add(key);if(s.pc.every(pc=>pc===5)){completed++;finals.add(s.value);continue;}
  if(s.pc.filter(pc=>pc>=1&&pc<=3).length===2)overlap=true;let enabled=0;
  for(let who=0;who<2;who++){if(s.pc[who]===5)continue;const n:State=structuredClone(s),pc=s.pc[who];let can=true;
   if(pc===0){if(p===0){if(s.sem===1)can=false;else n.sem=1;}else if(p===1){if(s.sem===0)n.sem=1;}else if(p===2){if(s.sem===0)can=false;else n.sem=0;}else if(p===3){if(s.sem===1)n.sem=0;}else assert.fail('unknown P');}
   else if(pc===1)n.local[who]=s.value;
   else if(pc===2)n.local[who]+=who===0?plus:-minus;
   else if(pc===3)n.value=n.local[who];
   else if(v===0){if(s.sem===0)can=false;}else if(v===1){if(s.sem===1)can=false;}else if(v===2)n.sem=0;else if(v===3)n.sem=1;else assert.fail('unknown V');
   if(can){enabled++;n.pc[who]++;queue.push(n);}
  }
  if(enabled===0)deadlock=true;
 }
 return{safe:!overlap&&!deadlock&&completed>0&&finals.size===1&&finals.has(initial+plus-minus),overlap,deadlock,states:seen.size,completed,finals};
}
type Operation={kind:'take'|'release';resource:number};
export function independentLockOrder(text:string):Operation[]{const operations=[...text.matchAll(/y([12])の(確保|解放)/g)].map(m=>({kind:m[2]==='確保'?'take':'release',resource:Number(m[1])-1}as const));assert.equal(operations.length,4);return operations;}
export function independentDeadlock(first:Operation[],second:Operation[]){
 const queue=[{pc:[0,0],owner:[-1,-1]}],seen=new Set<string>();let deadlock=false;
 for(let i=0;i<queue.length;i++){const s=queue[i],key=JSON.stringify(s);if(seen.has(key))continue;seen.add(key);if(s.pc.every(pc=>pc===4))continue;let enabled=0;
  for(let who=0;who<2;who++){const op=(who===0?first:second)[s.pc[who]];if(!op)continue;if(op.kind==='take'&&s.owner[op.resource]!==-1)continue;
   const n=structuredClone(s);if(op.kind==='take')n.owner[op.resource]=who;else{assert.equal(n.owner[op.resource],who);n.owner[op.resource]=-1;}n.pc[who]++;queue.push(n);enabled++;
  }if(enabled===0)deadlock=true;
 }return{deadlock,states:seen.size};
}
export const autumnPm2PTexts=[
 'セマフォ変数Sの値が0であれば1に変更し，終了する。1であれば0になるまで待った後，1に変更して終了する',
 'セマフォ変数Sの値が0であれば1に変更し，終了する。1であれば何もせずに終了する',
 'セマフォ変数Sの値が1であれば0に変更し，終了する。0であれば1になるまで待った後，0に変更して終了する',
 'セマフォ変数Sの値が1であれば0に変更し，終了する。0であれば何もせずに終了する',
];
export const autumnPm2VTexts=['セマフォ変数Sの値が0であれば1になるまで待った後，終了する','セマフォ変数Sの値が1であれば0になるまで待った後，終了する','セマフォ変数Sの値を0にして終了する','セマフォ変数Sの値を1にして終了する'];
