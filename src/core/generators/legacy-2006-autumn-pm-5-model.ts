export const mixtureCases=[
  { farms:['J','K','L'], mix:'M', remainder:2 },
  { farms:['P','Q','R'], mix:'N', remainder:0 },
  { farms:['S','T','U'], mix:'H', remainder:1 },
  { farms:['A','B','C'], mix:'W', remainder:2 },
] as const;

export function mixtureLabels(index:number) {
  const { farms,mix,remainder }=mixtureCases[index];
  const vars=farms.map(farm=>'w'+farm.toLowerCase());
  const [first,second]=[0,1,2].filter(i=>i!==remainder);
  const field='牧場区分';
  const eq=(name:string,equals:boolean)=>'（'+field+(equals?'＝':'≠')+'“'+name+'”）';
  const anyOf=(equals:boolean,or:boolean)=>farms.map(name=>eq(name,equals)).join(or?' or ':' and ');
  const tests=[
    anyOf(false,true),
    eq(mix,false)+' or （'+eq(farms[0],false)+' and '+eq(farms[1],false)+'\n    and '+eq(farms[2],false)+'）',
    eq(mix,false)+' or '+eq(farms[0],false)+' or '+eq(farms[1],false)+'\n    or '+eq(farms[2],false),
    anyOf(true,true),
    eq(mix,true)+' or （'+eq(farms[0],false)+' and '+eq(farms[1],false)+'\n    and '+eq(farms[2],false)+'）',
    field+'≠“'+mix+'”',
    field+'＝“'+mix+'”',
  ];
  const volume='牛乳の必要量', percentage=(i:number)=>farms[i]+'牧場の割合';
  const amounts=[
    volume+' − '+vars[first],
    volume+' − '+vars[first]+' − '+vars[second],
    volume+' − '+vars[second],
    volume+' × （100 − '+percentage(first)+' − '+percentage(second)+'）÷ 100',
    volume+' × '+percentage(remainder)+' ÷ 100',
  ];
  return { farms,mix,remainder,vars,first,second,tests,volume,percentage,amounts };
}
