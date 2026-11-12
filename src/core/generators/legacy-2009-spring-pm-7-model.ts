type Kind='T'|'S'|'R';
const trend=[116,112,122,117,123,133,130,138,133,144,151,158,152,147,157,166,155,172,179,166,172,191,178,203,193,214,216,210,223,204,215,229,234,201,251,228];
const seasonal=[196,137,185,210,225,179,195,83,206,158,263,334,192,135,185,212,234,179,207,85,205,157,265,326,191,142,187,221,243,132,204,65,216,154,281,353];
const irregular=[102,101,92,104,99,99,108,98,94,95,98,107,107,101,97,103,102,110,102,98,94,111,101,112,91,107,110,104,106];
const sets=[
  { kinds:['T','S','R'], history:[100,95,93,92,105,115,110], alpha:6, last:100 },
  { kinds:['S','T','R'], history:[82,91,98,105,111,123,126], alpha:6, last:103 },
  { kinds:['R','S','T'], history:[138,133,125,120,117,114,112], alpha:6, last:129 },
  { kinds:['T','R','S'], history:[88,92,100,99,108,117,120], alpha:7, last:107 },
] as const;
export const kindText:Record<Kind,string>={T:'傾向変動と不規則変動',S:'季節変動と不規則変動',R:'不規則変動だけ'};
export const kindsByChoice:readonly (readonly Kind[])[]=[['S','T','R'],['S','R','T'],['T','S','R'],['T','R','S'],['R','S','T']];
export function demandAt(index:number) {
  const {kinds,history,alpha,last}=sets[index];
  const example='XYZ'[kinds.indexOf('R')];
  const months=kinds.map(kind=>{
    if(kind==='R') return [...irregular.map((value,month)=>value+(index===2?19:index===3?1:0)+(index===0?0:(month*7+index)%5-2)),...history];
    if(index===0) return kind==='T'?trend:seasonal;
    return kind==='T'?trend.map((value,month)=>index===2?320-value:Math.round(value*(index===3?1.13:.89)+15)):
      seasonal.map((value,month)=>Math.round((value-200)*(index===1?.72:index===2?.88:.82)+205+(month*index)%5));
  });
  const mean=(values:readonly number[])=>values.reduce((sum,value)=>sum+value,0)/values.length;
  const moving=mean(history.slice(3,6));
  const exp=(alpha*history[5]+(10-alpha)*last)/10;
  const other=[Math.round(mean(history.slice(0,6))),Math.round(mean(history.slice(2,5))),( (10-alpha)*history[5]+alpha*last)/10,history[6]];
  const choices=index===0?[98,101,104,106,109,110]:[moving,exp,...other].sort((a,b)=>a-b);
  return { kinds,history,alpha,last,example,months,moving,exp,choices,
    row:kindsByChoice.findIndex(option=>option.every((kind,i)=>kind===kinds[i])),
  };
}
