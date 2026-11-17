export const floatCases = [
  { width:24, exponent:7, mantissa:16, bias:64, negative:false },
  { width:20, exponent:7, mantissa:12, bias:64, negative:true },
  { width:20, exponent:3, mantissa:16, bias:4, negative:false },
  { width:16, exponent:7, mantissa:8, bias:64, negative:true },
] as const;

export const gateCases = [
  { a:1,b:0,c:1, firstAnd:true, secondOr:true },
  { a:1,b:1,c:0, firstAnd:true, secondOr:true },
  { a:0,b:1,c:0, firstAnd:true, secondOr:true },
  { a:1,b:0,c:0, firstAnd:false, secondOr:false },
] as const;
export const pipelineCases = [
  { options:[[0,5,10],[0,3,6],[0,1,2],[0,0,1]], fastest:1 },
  { options:[[0,5,10],[0,2,4],[0,1,3],[0,0,2]], fastest:2 },
  { options:[[0,3,6],[0,5,10],[0,1,2],[0,2,5]], fastest:3 },
  { options:[[0,5,10],[0,0,2],[0,1,2],[0,4,8]], fastest:4 },
] as const;
export const architectureCases = [
  { cache:256, memory:256, times:[40,20,400,580] },
  { cache:512, memory:512, times:[65,15,400,550] },
  { cache:128, memory:128, times:[50,40,250,440] },
  { cache:512, memory:256, times:[30,20,300,540] },
] as const;
export const diskCases = [
  { disks:4, rows:4, copies:false },
  { disks:3, rows:5, copies:false },
  { disks:3, rows:4, copies:true },
  { disks:4, rows:5, copies:true },
] as const;
export const bitsByDisk = (index:number) => {
  const {disks,rows,copies}=diskCases[index];
  return Array.from({length:disks},(_,column)=>Array.from({length:rows},(_,row)=>copies?row:row*disks+column));
};

export const letters = [
  [['＋',['a'],['＊',['−',['b'],['c']],['d']]],2],
  [['−',['＊',['a'],['b']],['＋',['c'],['d']]],0],
  [['＊',['a'],['＋',['−',['b'],['c']],['d']]],1],
  [['＊',['＋',['a'],['b']],['−',['c'],['d']]],3],
] as const;
export type Expression = readonly [string,Expression?,Expression?];
export function visit(node:Expression, order:number):string {
  const [value,left,right]=node;
  if(!left||!right)return value;
  const before=visit(left,order), after=visit(right,order);
  if(order===0)return value+before+after;
  if(order===1)return '('+before+value+after+')';
  return before+after+value;
}
export const machineCases=[
  { run:1, repeat:3, words:['01011','01111','10111','11110'] },
  { run:0, repeat:3, words:['00101','10100','01000','00100'] },
  { run:1, repeat:2, words:['01100','00101','01011','01110'] },
  { run:0, repeat:2, words:['10110','00101','11000','10100'] },
] as const;
