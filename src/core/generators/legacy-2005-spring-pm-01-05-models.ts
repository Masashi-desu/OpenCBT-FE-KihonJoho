export const hex=(value:number)=>value.toString(16).toUpperCase().padStart(4,'0');
const listPlacement=[
  [0,10,4,22,16,2,6,12,20,8,18,14],
  [4,10,2,14,22,6,0,20,8,18,16,12],
  [8,16,2,20,10,4,14,6,0,22,12,18],
  [14,8,20,0,12,4,18,2,22,10,6,16],
] as const;
const listValues=[0x91,0x93,0x95,0x99,0x9b,0x9f,0xa0,0xa1,0xa2,0xa9,0xab,0xb0];
const insertion=[[4,8],[2,7],[3,9],[5,10]] as const;
const deletion=[4,5,6,8] as const;
const sublistSlots=[[26,28,24],[28,24,26],[24,28,26],[28,26,24]] as const;
export function listExample(index:number) {
  const base=[0x100,0x180,0x220,0x300][index], root=base-1;
  const values=index===0?listValues:Array.from({length:12},(_,i)=>[0,0x40,0x68,0xa0][index]+(5+index)*i);
  const elements=listPlacement[index].map((position,i)=>({
    address:base+position,value:values[i],next:i===11?0:base+listPlacement[index][i+1],
  }));
  const [firstGap,secondGap]=insertion[index];
  const sublist=[
    {address:base+sublistSlots[index][0],value:index===0?0x9c:values[firstGap]+2,next:base+sublistSlots[index][1]},
    {address:base+sublistSlots[index][1],value:index===0?0xa5:values[secondGap]+2,next:base+sublistSlots[index][2]},
    {address:base+sublistSlots[index][2],value:index===0?0xa7:values[secondGap]+4,next:0},
  ];
  const cells=new Map<number,number|null>([[root,elements[0].address]]);
  for(const element of [...elements,...sublist]){
    cells.set(element.address,element===elements[7]?null:element.value);
    cells.set(element.address+1,element.next);
  }
  const groups=[[[root-1,'⋮'],[root,hex(cells.get(root)!)]],[],[],[]] as [number,string][][];
  for(let pos=0;pos<=29;pos++){
    const value=cells.get(base+pos);
    groups[Math.floor((pos+2)/8)].push([base+pos,value==null?'［空欄］':hex(value)]);
  }
  const deleteNode=elements[deletion[index]];
  const remove=[elements[deletion[index]-1].address+1,deleteNode.next];
  const linkTargets=[sublist[0].address,elements[firstGap+1].address,sublist[1].address,elements[secondGap+1].address];
  const edits=[elements[firstGap].address+1,sublist[0].address+1,elements[secondGap].address+1,sublist[2].address+1];
  return {base,root,elements,sublist,groups,remove,linkTargets,edits,deleteNode,unknown:elements[7]};
}

export const replaceCases=[
  {a:'aabcabb',s:'ab',d:'ABC'},
  {a:'aabaaa',s:'aa',d:'Q'},
  {a:'abcabca',s:'abc',d:'YZ'},
  {a:'ababaqaba',s:'aba',d:'UV'},
] as const;
export function replaceExample(index:number) {
  const {a,s,d}=replaceCases[index];
  const output:string[]=[];
  for(let pos=0;pos<a.length;){
    let match=0;
    while(match<s.length&&a[pos+match]===s[match])match++;
    if(match===s.length){output.push(d);pos+=match;}
    else {output.push(a[pos]);pos++;}
  }
  const ours=output.join(''), columns=Math.max(10,a.length+1,ours.length+1);
  const arrays=[a,s,d,ours].map(value=>[...value].map(char=>'“'+char+'”').concat('EOS'));
  return {a,s,d,ours,columns,arrays};
}

export const heapCases=[
  [91,86,72,72,45,69,24,55,1,12],
  [90,64,79,55,8,78,16,30,19,7],
  [94,77,75,59,73,68,42,6,24,38],
  [80,65,78,40,58,29,60,30,21,57],
] as const;
export function firstHeapStep(index:number) {
  const source=heapCases[index], heap=[0,...source], last=source.length, trail=[last,1];
  const swap=(p:number,q:number)=>{[heap[p],heap[q]]=[heap[q],heap[p]];};
  swap(1,last);
  let current=1;
  while(current*2<last){
    const left=current*2, right=left+1;
    const next=right<last&&heap[right]>heap[left]?right:left;
    if(heap[current]>=heap[next])break;
    swap(current,next);trail.push(next);current=next;
  }
  return {last,initialValue:source.at(-1)!,endingIndex:current,swaps:trail.length-1,trail};
}

type ScheduleRow=readonly [year:number,day:number,period:number,order:number,subject:string,instructor:string];
const template:readonly ScheduleRow[]=[
  [1,2,1,1,'哲学','井上紘司'],[1,2,1,2,'政治学','小林慎一'],[1,2,2,1,'英語Ⅰ','間宮剛士'],
  [1,2,3,1,'歴史学','新田敦'],[1,2,5,1,'環境論','田中武彦'],[1,3,1,1,'体育','岡忠'],[1,3,1,2,'体育','下山恵'],
  [2,2,1,1,'社会学','瀬川譲治'],[2,2,2,1,'現代経済','竹上松次'],[2,2,2,2,'情報倫理','城力守衛'],
  [2,2,3,1,'憲法','桑原堅次'],[2,2,4,1,'行動科学','水田隆雄'],[2,3,1,1,'会計Ⅰ','島田幸作'],
  [2,3,1,2,'独語Ⅱ','森田五郎'],[3,2,1,1,'国際政治','鈴木馨子'],[3,3,1,1,'会計Ⅱ','藤原俊夫'],
  [3,3,1,2,'仏語Ⅲ','山田陽一'],[3,3,2,1,'認知科学','星野玉子'],[4,3,2,1,'経営学','中沢晃子'],
];
const targets=[15,8,7,5];
const adjustedSubjects=['会計Ⅱ','応用経済','文化社会学','健康科学'];
export function schedule(index:number) {
  const chosen=targets[index];
  const rows=template.map((row,i):ScheduleRow=>i===chosen?[row[0],row[1],row[2],row[3],adjustedSubjects[index],row[5]]:row);
  const selected=rows[chosen], prior=rows[chosen-1];
  const first=selected.findIndex((value,i)=>i<3&&prior[i]!==value);
  const caption=selected[0]+'年次の'+['','日','月','火','水','木','金','土'][selected[1]]+'曜日'+selected[2]+'時限の'+selected[4];
  const example=rows.filter(row=>row[0]===1);
  const out:string[]=[];
  let last:readonly number[]=[];
  for(const [year,day,period,,subject,instructor] of example){
    if(year!==last[0]){out.push('G'+year);last=[];}
    if(day!==last[1]){out.push('D'+day);last=[year];}
    if(period!==last[2])out.push('T'+period);
    out.push(subject,instructor);last=[year,day,period];
  }
  return {rows,selected,caption,processes:first<0?[]:Array.from({length:3-first},(_,i)=>first+i+1),example,out};
}
