export const networkCases = [
  { prefixes: ['172.16.0','172.31.0'], gateway: 'GATEWAY', gatewayHost: [101,101], web: 'SV01', webHost: [91,92,93], webSide: 1 },
  { prefixes: ['10.24.11','10.25.12'], gateway: 'EDGE', gatewayHost: [104,107], web: 'APP02', webHost: [21,23,24], webSide: 0 },
  { prefixes: ['192.168.18','192.168.40'], gateway: 'CORE', gatewayHost: [120,130], web: 'WEB03', webHost: [64,69,72], webSide: 1 },
  { prefixes: ['172.19.1','172.22.2'], gateway: 'LINK', gatewayHost: [201,205], web: 'APP04', webHost: [33,34,35], webSide: 0 },
] as const;
export function network(index:number) {
  const {prefixes,gateway,gatewayHost,web,webHost,webSide}=networkCases[index];
  const ips=prefixes.map((prefix,i)=>prefix+'.'+gatewayHost[i]);
  const webIps=webHost.map(host=>prefixes[webSide]+'.'+host);
  const clientRows=prefixes.map((prefix,group)=>[1,2,3].map(i=>['PC'+(group+1)+'00'+i,prefix+'.'+i]));
  return {ips,webIps,clientRows,gateway,web,webSide};
}

export const moduleNames='ABCDEFGHIJ';
export const sequence=['A','B','C','D','E','G','H','F','G','I','J'] as const;
export const overlayCases = [
  {sizes:[10,8,6,5,6,4,6,2,3,15], alpha:'F'},
  {sizes:[12,7,6,6,7,3,5,4,3,17], alpha:'H'},
  {sizes:[9,8,7,5,5,5,7,2,3,17], alpha:'I'},
  {sizes:[11,7,7,6,6,5,7,1,3,16], alpha:'E'},
] as const;

type Segment = {id: string; modules:string; children?:readonly Segment[]};
export const overlays: readonly Segment[] = [
  {id:'P0',modules:'A',children:[{id:'P1',modules:'BC'},{id:'P2',modules:'DEFGHI'},{id:'P3',modules:'J'}]},
  {id:'Q0',modules:'A',children:[{id:'Q1',modules:'BC'},{id:'Q2',modules:'D',children:[
    {id:'Q3',modules:'EF'},{id:'Q4',modules:'GHI'},
  ]},{id:'Q5',modules:'J'}]},
  {id:'R0',modules:'A',children:[{id:'R1',modules:'BC'},{id:'R2',modules:'D',children:[
    {id:'R3',modules:'E'},{id:'R4',modules:'F'},{id:'R5',modules:'G',children:[{id:'R6',modules:'H'},{id:'R7',modules:'I'}]},
  ]},{id:'R8',modules:'J'}]},
];

export function segmentRows(segment:Segment) {
  const rows: string[][]=[];
  function collect(node: Segment) {
    rows.push([node.id,[...node.modules].join('，')]);
    node.children?.forEach(collect);
  }
  collect(segment);
  return rows.sort((a,b)=>a[0].localeCompare(b[0],'en'));
}
function route(node: Segment, module: string): string[] | undefined {
  if(node.modules.includes(module))return [node.id];
  for(const child of node.children??[]) {
    const path=route(child,module);
    if(path)return [node.id,...path];
  }
}
export function memory(index:number) {
  const {sizes,alpha}=overlayCases[index];
  function capacity(node:Segment): number {
    const own=[...node.modules].reduce((sum,module)=>sum+sizes[moduleNames.indexOf(module)],0);
    return own+Math.max(0,...(node.children??[]).map(capacity));
  }
  const initial=capacity(overlays[0]);
  const max=overlays.map(capacity);
  const eventCounts=overlays.map(root=>{
    let loaded:string[]=[];
    const events:string[]=[];
    const atAlpha=sequence.map(module=>{
      const desired=route(root,module)!;
      let i=0;
      while(i<desired.length&&desired[i]===loaded[i])i++;
      if(i<desired.length) {
        loaded=desired;
        events.push(...desired.slice(i));
      }
      return events.length;
    });
    return { events, untilAlpha: atAlpha[sequence.indexOf(alpha)] };
  });
  return {sizes,alpha,max,initial,eventCounts};
}

export const dhCases = [
  {prime:7,base:5,keyA:3,keyB:5},
  {prime:11,base:2,keyA:3,keyB:4},
  {prime:13,base:2,keyA:3,keyB:7},
  {prime:17,base:3,keyA:3,keyB:5},
] as const;
export function modularPower(base:number,exponent:number,prime:number) {
  return Number((BigInt(base) ** BigInt(exponent)) % BigInt(prime));
}

export const expressions = ['(2+4)×3+5×6','4×(9+3)−2÷8','(7−2)×(8+1)+3×5','5÷(2+3)−7×4'] as const;
export const precedence: Record<string,number> = {'(':4,'×':2,'÷':2,'+':1,'−':1,')':0,EOS:-1};
export function postfix(index:number) {
  const expression=expressions[index], stack=['EOS'];
  const output:string[]=[];
  const priority=(value:string)=>precedence[value]??3;
  for(const c of expression) {
    while (priority(c)<=priority(stack.at(-1)!) && stack.at(-1)!=='(') output.push(stack.pop()!);
    if(c===')') stack.pop();
    else stack.push(c);
  }
  const partial=output.join('');
  while (stack.at(-1)!=='EOS')output.push(stack.pop()!);
  return {expression,partial,full:output.join('')};
}

export const hrCases = [
  {month:4, monthLabel:'4月', previousMonth:3, prevLast:31, minimumYears:1, gradeIncrease:2, newHireIncrease:1, checkedYear:17},
  {month:10, monthLabel:'10月', previousMonth:9, prevLast:30, minimumYears:2, gradeIncrease:3, newHireIncrease:1, checkedYear:17},
  {month:4, monthLabel:'4月', previousMonth:3, prevLast:31, minimumYears:1, gradeIncrease:3, newHireIncrease:2, checkedYear:18},
  {month:10, monthLabel:'10月', previousMonth:9, prevLast:30, minimumYears:2, gradeIncrease:2, newHireIncrease:1, checkedYear:18},
] as const;
export function hrRevisionLines(index:number) {
  const {monthLabel,minimumYears,gradeIncrease,newHireIncrease}=hrCases[index];
  const floor=gradeIncrease===2?'2級又は1級の場合':'1〜'+gradeIncrease+'級の場合';
  return [
    [{text:'会社は，毎年'+monthLabel+'1日に職務変更も昇格もしていない社員の',changed:false}],
    [{text:'うち入社してから'+minimumYears+'年以上の社員は，',changed:true},
      {text:'階級を'+gradeIncrease+'上げる。これを昇級という。',changed:false}],
    [{text:'ただし，昇級前の階級が'+floor+'は1級となる。',changed:false}],
    [{text:'また，入社後'+minimumYears+'年に満たない社員は，',changed:false},
      {text:'階級を'+newHireIncrease+'だけ上げる。',changed:true}],
  ];
}
export const hrFileLayouts: readonly (readonly (readonly [string,boolean])[])[] = [
  [['部署コード',true],['部署名',false]],
  [['職務コード',true],['職務名',false]],
  [['社員コード',true],['社員名',false],['入社年月日',false],['部署コード',false],['職務コード',false],['職群',false],['階級',false]],
  [['社員コード',false],['希望職務コード',false],['許可フラグ',false]],
  [['社員コード',false],['昇格理由',false]],
  [['社員コード',false],['異動先部署コード',false]],
];
export function hireReport(index:number) {
  const {checkedYear,month,gradeIncrease}=hrCases[index];
  const date='H'+checkedYear+'.'+String(month).padStart(2,'0')+'.01';
  const newGrade=(14-gradeIncrease)+'級';
  return {date,rows:[
    ['1200851','情報 太郎','営業一部','一般職','18級','技術','営業二部','一般職','18級','営業'],
    ['2000509','技術 花子','営業一部','一般職',newGrade,'事務','営業一部','一般職','14級','事務'],
    ['9971006','資格 弘海','営業一部','管理職','20級','技術','営業二部','一般職','1級','技術'],
  ]};
}
