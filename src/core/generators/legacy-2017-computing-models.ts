/** Annual model values; no source fixtures, shared registry or renderer import. */
export const legacy2017AvailabilityProfile="legacy-2017-four-device-availability";
export const legacy2017DirectoryProfile="legacy-2017-directory-tree";
export const legacy2017ReplacementProfile="legacy-2017-page-replacement-choices";
export const legacy2017AvailabilityFormulas=["(1 − (1 − R²)²)²","1 − (1 − R²)²","(1 − (1 − R)²)²","1 − (1 − R)⁴"];
export const legacy2017DirectoryChoices=["¥A → ..¥B → .¥A¥B","¥B → .¥B¥A → ..¥B","¥B → ¥A → ¥B","¥B¥A → ..¥B"];
export const legacy2017DirectoryTargets=["¥B¥A¥B","¥B¥B¥B","¥B","¥B¥B"];
export const legacy2017PageChoices=[[3,2],[3,6],[4,3],[5,4]];
export const legacy2017PageAccesses=[
 [1,3,1,3,4,1,1,2,1,5],
 [1,3,2,1,4,5,2,3,4,5],
 [1,2,5,4,5,2,1,1,3,2],
 [2,4,3,3,5,2,1,5,4,5],
];
export const legacy2017JobPatterns=[
 {execute:[5,3,2,4],print:[5,4,3,2]},
 {execute:[6,2,2,4],print:[5,4,3,2]},
 {execute:[4,4,2,4],print:[6,4,3,2]},
];
export function legacy2017JobTimes(pattern:number,unit:number){
 const plan=legacy2017JobPatterns[pattern];let cpu=0,printer=0;const rows=plan.execute.map((n,i)=>{const execute=n*unit,print=plan.print[i]*unit;cpu+=execute;printer=Math.max(cpu,printer)+print;return {job:"ABCD"[i],execute,print,cpuEnd:cpu,printEnd:printer};});
 return {rows,answer:printer,options:[rows[0].execute+rows[0].print,cpu+rows[3].print,printer,rows.reduce((n,r)=>n+r.execute+r.print,0)]};
}
export function legacy2017PageReplacementTrace(sequence:readonly number[]){
 const memory:number[]=[],inserted=new Map<number,number>(),lastUse=new Map<number,number>();let fifo=0,lru=0;
 const traces:{page:number;hit:boolean;evicted:number|null;memory:number[]}[][]=[[],[]];
 // FIFO keeps arrival timestamps; LRU is simulated independently below by
 // minimum last-use timestamps. Empty-frame fills are not replacements.
 for(const [time,page]of sequence.entries()){const hit=memory.includes(page);let evicted:number|null=null;if(!hit){if(memory.length===3){memory.sort((a,b)=>inserted.get(a)!-inserted.get(b)!);evicted=memory.shift()!;fifo++;}memory.push(page);inserted.set(page,time);}traces[0].push({page,hit,evicted,memory:[...memory]});}
 memory.length=0;for(const [time,page]of sequence.entries()){const hit=memory.includes(page);let evicted:number|null=null;if(!hit){if(memory.length===3){memory.sort((a,b)=>lastUse.get(a)!-lastUse.get(b)!);evicted=memory.shift()!;lru++;}memory.push(page);}lastUse.set(page,time);traces[1].push({page,hit,evicted,memory:[...memory].sort((a,b)=>lastUse.get(a)!-lastUse.get(b)!)});}
 return [{replacements:fifo,trace:traces[0]},{replacements:lru,trace:traces[1]}];
}
export const legacy2017PageReplacements=(sequence:readonly number[])=>legacy2017PageReplacementTrace(sequence).map(r=>r.replacements);
