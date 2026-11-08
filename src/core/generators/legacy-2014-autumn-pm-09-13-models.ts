export type UserRecord = { id: string; name: string; attribute: number; date: string };
type ExampleRow = [id: string, name: string, attribute: string, date: string];
const newRecords: ExampleRow[] = [
  ['AE001','UserE1','41','20140419'], ['AE002','UserE2','48','20141014'],
  ['AE003','UserE3','48','20140716'], ['AP005','UserP5','46','20141015'], ['AP006','UserP6','44','00000000'],
];
const oldRecords: ExampleRow[] = [
  ['AE001','UserE1','40','20140419'], ['AE002','UserE2','44','20140712'],
  ['AE003','UserE3','4C','20140716'], ['AP004','UserP4','45','20140715'], ['AP005','UserP5','44','20140713'],
];
const caseCount = 8;
export const autumn2014Pm0913CaseCount = caseCount;

export function autumn2014Pm9Model(index: number) {
  const disabledBit = index < 4 ? 1 : 0;
  const changes = [
    [], [1,0x04,0x08,'20140712'], [2,0x00,0x04,'20141001'], [4,0x08,0x04,'20140802'],
    [0,0x08,0x00,'20140419'], [1,0x04,0x08,'20140712'], [3,0x00,0x08,'20140713'], [4,0x0C,0x04,'20140602'],
  ] as const;
  const [changed, newMask, oldMask, lastLogin] = changes[index];
  const mapRecords = (source: ExampleRow[], fresh: boolean): UserRecord[] =>
    source.map(([id,name,hex,date], position) => ({
      id,
      name,
      attribute: parseInt(hex,16) ^ (disabledBit ? 0 : 1) ^
        (position === changed ? (fresh ? newMask! : oldMask!) : 0),
      date: fresh && position === changed ? lastLogin! : date,
    }));
  const newInput = mapRecords(newRecords,true);
  const oldInput = mapRecords(oldRecords,false);
  const differences: string[][] = [];
  const usage: string[][] = [];
  let fresh = 0;
  let previous = 0;
  while (fresh < newInput.length || previous < oldInput.length) {
    const next = newInput[fresh];
    const old = oldInput[previous];
    if (!next || old && old.id < next.id) {
      const messages = ['利用者 ID 削除'];
      if (old.attribute & 8) messages.push('特権 S 解除');
      if (old.attribute & 4) messages.push('特権 O 解除');
      differences.push([old.id,old.name,messages.join('　')]);
      previous++;
      continue;
    }
    const same = old?.id === next.id;
    const messages = same ? [] : ['利用者 ID 追加'];
    const oldPrivileges = same ? old.attribute : 0;
    for (const [mask, label] of [[8,'S'],[4,'O']] as const) {
      if ((next.attribute & mask) !== (oldPrivileges & mask)) {
        messages.push('特権 ' + label + ((next.attribute & mask) ? ' 付加' : ' 解除'));
      }
    }
    if (messages.length) differences.push([next.id,next.name,messages.join('　')]);
    const status = [];
    if ((next.attribute & 1) === disabledBit) status.push('現在使用不可');
    if (same && old.date === next.date) status.push('期間中未使用');
    if (status.length) usage.push([next.id,next.name,status.join('　')]);
    fresh++;
    if (same) previous++;
  }
  return { disabledBit,newInput,oldInput,differences,usage };
}

const months = ['04','05','06','07','08','09','10','11','12','01','02','03'];
type Mark = '*' | '@' | '#';
const monthlySourceRows = [5,5,4,5,5,6,6,7,7,8,8,9,7,4,4,3,4,4,4,6,6,7,7,7];
const sourceZ: Record<Mark,(number | null)[]> = {
  '*': [null,1,1,1,1,1,1,2,2,2,2,2],
  '@': [2,3,4,5,6,7,7,8,9,10,11,null],
  '#': [14,14,14,14,13,13,13,13,13,13,12,12],
};
export function autumn2014Pm10Model(index: number) {
  const cumulativePriority = index >= 4;
  // Both original charts are illustrative. Their visible bins do not supply
  // exact monthly sales and the two sets of bins cannot come from one ledger.
  const monthlyAmounts = index === 0 ? undefined : monthlySourceRows.map((row,month) => {
    const offset = month === (index*3)%24 ? (index%2 ? 1 : -1) : 0;
    return (row+offset-1)*100000 + 1000*(1+(index*13+month*7)%99);
  });
  const monthlyRows = monthlyAmounts?.map(amount=>Math.floor((amount+99999)/100000)) ?? monthlySourceRows;
  const zRows = Array.from({length:24},()=>Array<string>(12).fill(''));
  const draw = (column: number, row: number, mark: Mark) => { zRows[24-row][column]=mark+mark; };
  if (!monthlyAmounts) {
    for (const mark of ['*','@','#'] as const) {
      sourceZ[mark].forEach((row,column)=>{ if(row !== null)draw(column,row,mark); });
    }
  } else {
    let recent = monthlyAmounts.slice(0,12).reduce((a,b)=>a+b,0);
    let total = 0;
    for (let column=0; column<12; column++) {
      const amount=monthlyAmounts[column+12];
      total+=amount;
      recent+=amount-monthlyAmounts[column];
      const row=(n:number)=>Math.floor((n+499999)/500000);
      draw(column,row(amount),'*');
      if(cumulativePriority){
        draw(column,row(recent),'#');
        draw(column,row(total),'@');
      } else {
        draw(column,row(total),'@');
        draw(column,row(recent),'#');
      }
    }
  }
  return { months, monthlyAmounts, monthlyRows, zRows, cumulativePriority };
}

const spanExpressions = ['DELTA','DELTA * 2','DELTA / 2','DELTA * 3','DELTA','DELTA / 3','DELTA * 2','DELTA / 2'];
const deltaMinutes = [60,40,50,25,80,45,70,90];
export function autumn2014Pm11Model(index: number) {
  return { includeStart:index < 4, span:spanExpressions[index], minutes:deltaMinutes[index] };
}

const asmCases = [
  { order:'昇順', first:[103,5067,68,79,7], counted:[2,4,1,3], digits:['298','30','9','3240','508'] },
  { order:'昇順', first:[219,9048,21,110,9], counted:[8,3,5], digits:['200','45','0','4040','605'] },
  { order:'昇順', first:[490,2144,96,54,37], counted:[3,4,1,2], digits:['906','100','8','8040','310'] },
  { order:'昇順', first:[109,4122,72,19,74], counted:[2,1], digits:['123','80','9','9999','203'] },
  { order:'降順', first:[803,7003,57,49,3], counted:[1,2,4,3], digits:['332','70','9','3110','705'] },
  { order:'降順', first:[705,5001,17,84,7], counted:[4,4,2,3], digits:['490','66','8','3010','990'] },
  { order:'降順', first:[209,7012,30,23,2], counted:[5,7,8], digits:['300','90','0','9999','605'] },
  { order:'降順', first:[371,3411,44,51,6], counted:[5,2,8,8], digits:['204','50','4','4321','900'] },
] as const;
export function autumn2014Pm12Model(index: number) {
  const { order, first, counted, digits } = asmCases[index];
  const descending = order === '降順';
  const compare = (a: number,b: number) => descending ? b-a : a-b;
  const firstSorted = [...first].sort(compare);
  const sorting = [...counted] as number[];
  let swaps = 0;
  let comparisons = 0;
  for(let passes=sorting.length-1;passes>0;passes--){
    for(let offset=0;offset<passes;offset++){
      comparisons++;
      if(compare(sorting[offset],sorting[offset+1])<0)continue;
      [sorting[offset],sorting[offset+1]]=[sorting[offset+1],sorting[offset]];
      swaps++;
    }
  }
  const output = [...digits].map(Number).sort(compare).map(value=>String(value).padStart(4,' '));
  const bcd = [...digits[0].padStart(4,'0')].map(c=>Number(c).toString(2).padStart(4,'0'));
  return { order,descending,first,firstSorted,counted,digits,output,bcd,swaps,comparisons };
}

const fareCases = [
  [4,1,43,30,43,47,24,13,100,10,40,70,3,5,10,10,20,30,50,5,50],
  [1,4,38,34,43,41,31,16,120,9,43,71,4,5,10,12,22,35,52,5,55],
  [5,2,46,27,40,38,25,18,110,8,40,68,3,6,10,11,21,32,54,5,60],
  [2,5,41,39,47,43,27,21,130,10,44,74,4,5,10,10,25,35,55,5,65],
  [4,1,44,37,31,40,23,15,120,10,41,70,4,6,10,12,22,32,52,6,50],
  [1,5,35,30,46,48,30,14,100,10,43,73,3,5,10,10,20,30,50,6,55],
  [4,1,48,45,37,34,20,19,140,11,45,75,4,5,10,12,24,36,56,6,60],
  [5,1,28,39,45,36,28,20,115,9,40,73,3,6,10,10,25,30,60,6,65],
] as const;
export const station = (number: number) => String(number).padStart(3,'0');
export const tenthKm = (distance: number) => (distance/10).toFixed(1);
export function autumn2014Pm13Model(index: number) {
  const [from,to,b2,b3,b4,b5,b31,b32,base,l1,l2,l3,u2,u3,u4,c1,c2,c3,c4,window,ratio] = fareCases[index];
  const early = [b2,b3,b4,b5];
  const late = [b31,b32,0];
  // The paper leaves these cells out. The synthetic values are used only to
  // keep the stated full-line length and audit formula ranges, never shown.
  const total = index === 0 ? 942 : 900 + index*8;
  const unseenTotal = total - [...early,...late].reduce((sum,value)=>sum+value,0);
  const unseen = Array.from({length:25},(_,i)=>Math.floor(unseenTotal/25)+(i<unseenTotal%25 ? 1 : 0));
  const line = [...early,...unseen,...late];
  const limits = [l1,l2,l3,999999];
  const units = [1,u2,u3,u4];
  const prices = [c1,c2,c3,c4];
  const start = Math.min(from,to);
  const end = Math.max(from,to);
  const distance = line.slice(start-1,end-1).reduce((sum,value)=>sum+value,0);
  let accumulated = 0;
  const sections = limits.map((limit,i)=>{
    const included = Math.min(distance,limit*10);
    const distanceHere = included-accumulated;
    accumulated = included;
    return { limit,unit:units[i],unitPrice:prices[i],distance:distanceHere,
      cost:Math.floor((distanceHere+units[i]*10-1)/(units[i]*10))*prices[i] };
  });
  const distanceFare = sections.reduce((sum,section)=>sum+section.cost,0);
  return { from,to,base,early,late,line,total,sections,distance,distanceFare,fare:base+distanceFare,window,ratio };
}
