export const networkCases = [
  { web:'203.0.113.2', mail:'203.0.113.3', mag:'192.168.0.2', member:'192.168.0.3', dbOnMag:false, https:443, dbPort:4194, ssh:22, client:'198.51.100.2' },
  { web:'203.0.113.2', mail:'203.0.113.3', mag:'192.168.0.2', member:'192.168.0.3', dbOnMag:true, https:8443, dbPort:4194, ssh:2222, client:'198.51.100.10' },
  { web:'203.0.113.12', mail:'203.0.113.13', mag:'192.168.0.2', member:'192.168.0.3', dbOnMag:false, https:443, dbPort:4294, ssh:22, client:'198.51.100.15' },
] as const;
export function routerLines(index:number) {
  const n=networkCases[index];
  return [
    'if0,'+n.web+',80','if0,'+n.mail+',25',n.mail+',if0,25','if2,'+n.web+',80',
    'if2,'+n.web+','+n.https,'if2,'+n.mail+',25','if2,'+n.mail+',110','if0,［a］',n.web+',［b］',
  ];
}

export type Signal = '0'|'1'|'Q'|'Q̅';
export const jkCases: {feedback:[Signal,Signal]; example:[Signal,Signal]}[] = [
  {feedback:['Q','Q̅'],example:['Q̅','1']},
  {feedback:['1','0'],example:['1','Q']},
  {feedback:['1','Q'],example:['1','1']},
];
export const jkTruthRows = [
  ['0','0','0','0'], ['0','0','1','1'], ['0','1','0','0'], ['0','1','1','0'],
  ['1','0','0','1'], ['1','0','1','1'], ['1','1','0','1'], ['1','1','1','0'],
];

export const excitationRows = [
  ['［b］','','0→0'], ['任意','1','1→0'], ['1','任意','0→1'], ['［c］','','1→1'],
] as const;

export const schedules=[
  { arrivals:[0,10,30,50], lengths:[120,90,60,30], quantum:20, inputIo:true, outputIo:true },
  { arrivals:[0,10,30,70], lengths:[130,110,80,30], quantum:20, inputIo:true, outputIo:false },
  { arrivals:[0,10,40,50], lengths:[110,90,50,30], quantum:30, inputIo:false, outputIo:true },
] as const;
export const processNames=['A','B','C','D'];
export function processSteps(i:number){
  const c=schedules[i];
  return [
    {name:'前処理（CPUを使用）',io:false},
    {name:c.inputIo?'データの入力':'主記憶上の値の準備（CPUを使用）',io:c.inputIo},
    {name:'計算処理（CPUを使用）',io:false},
    {name:c.outputIo?'データの出力':'主記憶上の結果の整形（CPUを使用）',io:c.outputIo},
    {name:'後処理（CPUを使用）',io:false},
  ];
}
export function shortestRemaining(i:number){
  const {arrivals,lengths}=schedules[i];
  const remaining:number[]=[...lengths], timeline:number[]=[], finish:number[]=[];
  while(remaining.some(n=>n>0)){
    const time=timeline.length*10;
    const active=remaining.map((rest,index)=>({rest,index})).filter(({rest,index})=>rest>0&&arrivals[index]<=time)
      .sort((a,b)=>a.rest-b.rest);
    if(!active.length||active[0].rest===active[1]?.rest)throw Error('PARAMETER_CONSTRAINT');
    const index=active[0].index;
    remaining[index]-=10;timeline.push(index);
    if(!remaining[index])finish[index]=time+10;
  }
  return {timeline,finish,turnaround:finish.map((t,j)=>t-arrivals[j])};
}
export function readyRows(i:number){
  const {arrivals}=schedules[i], timeline=shortestRemaining(i).timeline;
  return processNames.map((_,j)=>Array.from({length:27},(_,t)=>{
    if(t>=9||arrivals[j]>t*10||!timeline.slice(t).includes(j))return '';
    return timeline[t]===j?'○':'－';
  }));
}

export type Relation = {name:string; columns:string[]; rows:string[][]; primary:number; widths:number[]};
export const bookInfo=[
  ['14030101','情報処理技術の歴史','情報太郎','情報社'],
  ['14030102','ITで創る未来','東京都子','駒込出版'],
];
const dateCases=[
  ['2014-09-05','2014-09-08','2014-09-10','2014-09-08','2014-09-12'],
  ['2014-09-06','2014-09-10','2014-09-10','2014-09-09','2014-09-13'],
  ['2014-10-01','2014-10-07','2014-10-10','2014-10-09','2014-10-17'],
];
const bookCols=['書籍番号','書籍名','著者','出版社'];
const bookWidths=[112,182,112,112];
export function bookRelations(index:number, modern:boolean):Relation[]{
  const [loan1,due1,back1,loan2,due2]=dateCases[index];
  if(!modern)return [{name:'書籍表',columns:[...bookCols,'貸出日','返却予定日','社員番号'],primary:0,
    rows:[[...bookInfo[0],'null','null','null'],[...bookInfo[1],loan2,due2,'110028']],widths:[...bookWidths,112,112,95]}];
  return [
    {name:'書籍表',columns:bookCols,rows:bookInfo,primary:0,widths:bookWidths},
    {name:'貸出表',columns:['貸出番号','書籍番号','社員番号','貸出日','返却予定日','返却日'],primary:0,widths:[100,110,104,112,112,112],
      rows:[['140158',bookInfo[0][0],'080172',loan1,due1,back1],['140159',bookInfo[1][0],'110028',loan2,due2,'null']]},
  ];
}
