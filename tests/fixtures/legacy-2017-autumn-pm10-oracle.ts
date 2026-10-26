/** Source-reviewed model independent of production Date.UTC and hour subtraction. */
export const autumnPm10Review={pages:[53,54,55,56,57],counts:[3,4,4,4,4,6,6],originalIndexes:[0,1,2,0,0,1,5],rates:[[300,100],[400,100],[500,200],[300,200],[400,200],[500,100]],programLineCounts:[21,43],limits:'No COBOL compiler used. Independent calendar arithmetic, unit-start events and statement/condition interpreters; ordinary App/profile/schema unregistered.'};
export type Civil={year:number;month:number;day:number;hour:number;minute:number};
const leap=(y:number)=>y%4===0&&(y%100!==0||y%400===0);
const monthDays=(y:number,m:number)=>[31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
export function autumnPm10CivilMinute(t:Civil){const previous=t.year-1;let day=365*previous+Math.floor(previous/4)-Math.floor(previous/100)+Math.floor(previous/400);for(let m=1;m<t.month;m++)day+=monthDays(t.year,m);day+=t.day-1;return day*1440+t.hour*60+t.minute;}
export function autumnPm10Advance(t:Civil,minutes:number){const x={...t};x.minute+=minutes;while(x.minute>=60){x.minute-=60;x.hour++;}while(x.hour>=24){x.hour-=24;x.day++;}while(x.day>monthDays(x.year,x.month)){x.day-=monthDays(x.year,x.month);x.month++;if(x.month>12){x.month=1;x.year++;}}return x;}
/** Charge every unit whose START precedes exit; integer minutes, no extra rounding. */
export function autumnPm10EventReference(input:Civil,output:Civil,day:number,night:number){const start=autumnPm10CivilMinute(input),end=autumnPm10CivilMinute(output),hours:number[]=[];let full=0,discounted=0;for(let at=start;at<end;at+=60){const h=Math.floor(at%1440/60);hours.push(h);full+=day;discounted+=h>=20||h<=5?night:day;}return{units:hours.length,full,discounted,chargedHours:hours};}
export const autumnPm10EFConditions=[(c:number,u:number,i:number)=>c===u,(c:number,u:number,i:number)=>c>u,(c:number,u:number,i:number)=>u===i,(c:number,u:number,i:number)=>i===24,(c:number,u:number,i:number)=>i===c,(c:number,u:number,i:number)=>i>24];
export function autumnPm10Loop(initialHour:number,units:number,e:number,f:number){let index=initialHour+1,cnt=1;const indexes:number[]=[];for(let guard=0;guard<100;guard++){
 if(autumnPm10EFConditions[e](cnt,units,index))return{status:'stopped',indexes};
 if(index<1||index>24)return{status:'out_of_range',indexes};indexes.push(index);index++;if(autumnPm10EFConditions[f](cnt,units,index))index=1;cnt++;
 }return{status:'non_terminating_within_bound',indexes};}
/** Each displayed candidate's role, interpreted on multiple independent states. */
export function autumnPm10AllOptionTruth(){
 const first=[true,false,false]; // program1 OPEN EXTEND appends sequentially, program2 keyed READ is a different operation
 const states=[[300,0,12345678],[600,123,87654321]];
 const a=[(fee:number,prm:number,no:number)=>({fee:fee+prm,prm}),(fee:number,prm:number,no:number)=>({fee,prm:fee}),(fee:number,prm:number,no:number)=>({fee:prm,prm}),(fee:number,prm:number,no:number)=>({fee,prm})].map(op=>states.every(([fee,prm,no])=>op(fee,prm,no).prm===fee&&op(fee,prm,no).fee===fee));
 const hours=[[3_650_006,3_650_000],[3_650_025,3_650_023]];
 const b=[(o:number,i:number)=>o*i,(o:number,i:number)=>o+i,(o:number,i:number)=>o-i,(o:number,i:number)=>o/i].map(op=>hours.every(([o,i])=>op(o,i)===o-i));
 const partial=[[2,23,0],[3,10,12],[0,0,0]];
 const c=[(u:number,i:number,o:number)=>u+1,(u:number,i:number,o:number)=>u+o,(u:number,i:number,o:number)=>u-1,(u:number,i:number,o:number)=>u-i].map(op=>partial.every(([u,i,o])=>op(u,i,o)===u+1));
 const d=[(h:number)=>h+1,(h:number)=>h-1,()=>1,(h:number)=>h].map(op=>[0,5,19,23].every(h=>op(h)===h+1));
 const expected=(h:number,u:number)=>Array.from({length:u},(_,j)=>(h+j)%24+1),cases=[0,5,19,22,23].flatMap(h=>[0,1,2,3,24,25].map(u=>[h,u]));
 const same=(x:ReturnType<typeof autumnPm10Loop>,h:number,u:number)=>x.status==='stopped'&&JSON.stringify(x.indexes)===JSON.stringify(expected(h,u));
 const e=autumnPm10EFConditions.map((_,j)=>cases.every(([h,u])=>same(autumnPm10Loop(h,u,j,5),h,u)));
 const f=autumnPm10EFConditions.map((_,j)=>cases.every(([h,u])=>same(autumnPm10Loop(h,u,1,j),h,u)));
 return[first,a,b,c,d,e,f];
}
