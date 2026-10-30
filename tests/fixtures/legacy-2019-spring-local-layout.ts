import assert from "node:assert/strict";
export function legacy2019OrderedPmGroupLayout(groups:readonly number[],keys:readonly string[]=groups.map((_,i)=>String(i))){
 assert.equal(keys.length,groups.length);const unique:{key:string;count:number;offset:number}[]=[],offsets:number[]=[];let total=0;
 groups.forEach((count,i)=>{assert(Number.isInteger(count)&&count>0);const old=unique.find(g=>g.key===keys[i]);if(old){assert.equal(old.count,count,"Shared source group count differs");offsets.push(old.offset);}else{offsets.push(total);unique.push({key:keys[i],count,offset:total});total+=count;}});return{unique,offsets,total};
}
/** Only the reviewed PM7 exception is admitted;other unordered sources remain rejected. */
export function legacy2019ValidateUnorderedContract(source:string,sourceGroups:readonly(readonly string[])[],requested:readonly(readonly string[])[]=[],noCorrectAnswer=false){
 assert(!noCorrectAnswer,"No-correct-answer requires separate reviewed staging");
 if(source==="2019h31h-fe-pm-7"){assert.deepEqual(sourceGroups,[["1-c","1-d"]]);assert.deepEqual(requested,[["part-c","part-d"]]);}
 else{assert.deepEqual(sourceGroups,[],"Only the reviewed PM7 source admits unordered slots");assert.deepEqual(requested,[],"Ordered source cannot request an unordered group");}
}
