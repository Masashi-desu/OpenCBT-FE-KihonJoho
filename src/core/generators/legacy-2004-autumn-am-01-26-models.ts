export const stateColumns=['空白','数字','符号','小数点','その他'];
const baseStates=[
  ['a','b','c','d','e'],['a','b','e','d','e'],['e','b','e','d','e'],['a','e','e','e','e'],
];
export function transitions(index:number) {
  const rows=baseStates.map(row=>[...row]);
  if(index===1||index===3)rows[3][1]='b';
  if(index===2)rows[0][3]='e';
  if(index===3)rows[3][0]='e';
  return rows;
}
export const treeNodes=[
  {rank:6,x:338,y:30,p:-1,left:false},
  {rank:4,x:222,y:89,p:0,left:true},
  {rank:8,x:454,y:89,p:0,left:false},
  {rank:2,x:149,y:147,p:1,left:true},
  {rank:5,x:272,y:147,p:1,left:false},
  {rank:7,x:382,y:147,p:2,left:true},
  {rank:12,x:516,y:147,p:2,left:false},
  {rank:1,x:96,y:205,p:3,left:true},
  {rank:3,x:207,y:205,p:3,left:false},
  {rank:10,x:454,y:205,p:6,left:true},
  {rank:14,x:578,y:205,p:6,left:false},
  {rank:9,x:414,y:262,p:9,left:true},
  {rank:11,x:493,y:262,p:9,left:false},
  {rank:13,x:540,y:262,p:10,left:true},
  {rank:15,x:628,y:262,p:10,left:false},
] as const;
export const treeCases=[
  {target:12,options:[9,10,13,14],scale:1,shift:0},
  {target:4,options:[1,2,5,6],scale:1,shift:10},
  {target:10,options:[6,8,11,13],scale:2,shift:3},
  {target:8,options:[5,9,10,12],scale:3,shift:7},
] as const;
export function tree(index:number) {
  const {target,options,scale,shift}=treeCases[index], v=(rank:number)=>rank*scale+shift;
  return {target:v(target),options:options.map(v),nodes:treeNodes.map(node=>({...node,value:v(node.rank)}))};
}
export const hashCases=[
  {key:'54321',mod:13,choices:[1,2,7,11]},
  {key:'61842',mod:11,choices:[1,3,6,10]},
  {key:'75342',mod:17,choices:[3,4,7,11]},
  {key:'46981',mod:19,choices:[3,7,9,11]},
] as const;
export type Gate='AND'|'OR'|'NOT';
export const logicCases=[
  {inputs:[1,0,1],first:'AND',second:'OR'},
  {inputs:[0,1,0],first:'AND',second:'OR'},
  {inputs:[1,0,1],first:'OR',second:'AND'},
  {inputs:[0,1,0],first:'OR',second:'AND'},
] as const;
export const addressPairs=[[20,25],[17,23],[24,35],[13,31]] as const;
