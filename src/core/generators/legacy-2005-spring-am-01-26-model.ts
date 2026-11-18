export const conversionCases=[
  {radix:2, limit:100, size:8, array:'NISHIN'},
  {radix:3, limit:150, size:5, array:'SANSHIN'},
  {radix:5, limit:500, size:4, array:'GOSHIN'},
  {radix:8, limit:400, size:3, array:'HASSHIN'},
] as const;
export const weatherNames=['晴れ','雨','曇り'] as const;
export const weatherCases=[
  {rates:[[4,2,4],[3,2,5],[3,3,4]], from:1, to:0},
  {rates:[[5,2,3],[2,5,3],[2,3,5]], from:1, to:2},
  {rates:[[3,4,3],[4,4,2],[5,2,3]], from:2, to:1},
  {rates:[[4,4,2],[3,5,2],[2,3,5]], from:0, to:2},
] as const;
export const parityMachineCases=[
  {digit:1, even:true},
  {digit:0, even:true},
  {digit:1, even:false},
  {digit:0, even:false},
] as const;
const rankTrees=[
  [1,2,3,4,5,6,7,8,9],
  [4,2,8,1,3,6,9,5,7],
  [7,6,8,4,5,3,9,1,2],
  [9,7,8,1,2,5,6,3,4],
] as const;
export const treeValues=[
  [1,2,3,4,5,6,7,8,9],
  [4,6,7,9,11,12,15,17,21],
  [12,15,16,20,24,30,32,33,40],
  [3,5,6,8,12,17,21,29,32],
] as const;
export const treeSchedule=[
  [0,1,2,3],
  [1,3,0,2],
  [2,0,3,1],
  [0,2,1,3],
] as const;
export function treeLabels(condition:number, choice:number) {
  const ordered=treeValues[condition];
  return rankTrees[treeSchedule[condition][choice]].map(rank=>ordered[rank-1]);
}
export const stackCases=[
  {ops:'++-++++--+', top:[192,55,326,7,29], target:1},
  {ops:'+++-++-++-', top:[20,47,316,100,82], target:4},
  {ops:'++++--++-+', top:[113,20,42,290,78], target:5},
  {ops:'+++-++--++', top:[93,37,128,41,21], target:2},
] as const;
export type Circuit = 'A' | 'B' | readonly ['NOT',Circuit] | readonly ['AND'|'OR',Circuit,Circuit];
const not=(node:Circuit):Circuit=>['NOT',node];
const and=(left:Circuit,right:Circuit):Circuit=>['AND',left,right];
const or=(left:Circuit,right:Circuit):Circuit=>['OR',left,right];
const nand=not(and('A','B')), aOrNotB=or('A',not('B')), aOrAB=or('A',and('A','B'));
const aAndNotB=and('A',not('B')), notAAndB=and(not('A'),'B');
export const circuits=[
  [or(and('A','B'),not('B')),nand,aOrNotB,aOrAB,not(aAndNotB)],
  [and(or('A','B'),not('B')),aAndNotB,aOrNotB,aOrAB,not(aAndNotB)],
  [and(or('A','B'),not('A')),nand,aOrNotB,notAAndB,not(notAAndB)],
  [or(and('A','B'),not('A')),nand,aOrNotB,aOrAB,or(not('A'),'B')],
] as const;
export const computerComponents=['制御装置','記憶装置','演算装置'] as const;
export const computerCases=[
  [0,1,2],[2,1,0],[1,2,0],[0,2,1],
] as const;
export const computerAnswerRows=[
  [2,1,0],[1,0,2],[0,2,1],[0,1,2],
] as const;
export const componentLabels=['a','b','c'] as const;
