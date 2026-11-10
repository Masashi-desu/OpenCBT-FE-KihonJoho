import { autumn2015PmCase } from './legacy-2015-autumn-pm-01-04-shared';

export const caseIndex = (values:number[]) => autumn2015PmCase(values,3);

export const bookNames = ['UML入門','XML（上）','XMLセット','XML（下）'] as const;
export const bookNumbers = ['5001','5011','6001','5012'] as const;
export const formatted = (n: number) => n.toLocaleString('en-US');
export function orderModel(index: number) {
  const [book, upper, lower, qty, discount, maximum, exact] = [
    [2000,2500,3500,2,1,10,false], [2200,2600,3400,3,2,12,true],
    [1800,2400,3200,2,3,8,false], [2100,2700,3100,3,5,9,true],
  ][index] as [number,number,number,number,number,number,boolean];
  const prices = [book,upper,(upper+lower)*(100-discount)/100,lower];
  const quantities = [qty,1,1];
  const subtotals = quantities.map((n,i)=>prices[i]*n);
  return {prices,quantities,subtotals,total:subtotals.reduce((a,b)=>a+b,0),discount,maximum,exact,
    number:String(12345+index*21), date:String(20110920+index), customer:['P書店','R書店','S書店','T書店'][index]};
}

export const stages = ['外部設計','内部設計','プログラム開発','結合テスト','総合テスト'] as const;
export const staffingInputs = [
  {size:480, staff:13, rates:[100,60,30,80,100]},
  {size:480, staff:14, rates:[100,60,32,75,100]},
  {size:528, staff:16, rates:[96,60,33,80,96]},
  {size:540, staff:16, rates:[100,60,36,90,108]},
] as const;
export const dateLabel = (month: number) => `平成${24+Math.floor(month/12)}年${1+month%12}月`;
export const scheduleOptions = [[3,4],[3,5],[4,3],[4,5]] as const;
export function staffingModel(index:number) {
  const {size,staff,rates} = staffingInputs[index];
  const efforts = rates.map(rate=>size*10/rate);
  const schedule = (dev1:number,dev2:number) => {
    const build = (dev:number,start:number) => {
      let month=start;
      return [3,3,dev,2,3].flatMap((length,phase)=>Array.from({length},()=>{
        return {month:month++,phase,need:Math.ceil(efforts[phase]/length)};
      }));
    };
    const plan = [build(dev1,0),build(dev2,6)];
    const last = plan[1].at(-1)!.month;
    const calendar = Array.from({length:last+1},(_,m)=>plan.map(period=>period.find(item=>item.month===m)));
    const idle = calendar.flatMap((items,m)=>items.some(item=>item&&item.phase!==2) ? [] : [m]);
    const totals = calendar.map(items=>items.reduce((sum,item)=>sum+(item?.need ?? 0),0));
    return {plan,calendar,idle,totals};
  };
  const chosen = schedule(5,4);
  const peak = Math.max(...chosen.totals), at = chosen.totals.indexOf(peak);
  const nearby = chosen.totals.slice(at-1,at+2);
  const target = nearby.reduce((a,b)=>a+b,0)/3;
  return {size,staff,rates,efforts,schedule,chosen,peak,at,nearby,target,external:Math.ceil(efforts[0]/3)-staff};
}

export const channels = ['小売店','量販店','CVS','ネット通販','外食','加工'] as const;
export const metricNames = ['売上金額','売上数量','売上単価','市場規模','市場占有率'] as const;
export const marketRows = [
  [[3400,850,4000,12143,28],[3360,800,4200,10839,31]],
  [[3330,900,3700,16650,20],[4025,1150,3500,18295,22]],
  [[1092,260,4200,7280,15],[1150,230,5000,8214,14]],
  [[805,230,3500,4025,20],[726,220,3300,4840,15]],
  [[7200,2400,3000,18000,40],[5760,1800,3200,15158,38]],
  [[6210,2700,2300,20700,30],[7200,3000,2400,20000,36]],
] as const;
export const axisPairs = [[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[3,0],[3,4],[4,0],[4,3]] as const;
export const channelPairs = [[2,0],[2,3],[2,1],[0,2],[3,2],[3,0],[3,1],[1,2],[1,0],[1,3]] as const;
const resultPairs = [[9,3],[3,5],[9,3],[3,5]] as const;
export function marketModel(index:number) {
  const rowOrder = [[0,1,2,3,4,5],[0,2,1,3,4,5],[3,2,1,0,4,5],[0,3,2,1,4,5]][index];
  const data = rowOrder.map(row=>marketRows[row].map(values=>{
    if (index===0) return [...values];
    const [,qty,price,,share] = values;
    const newQty=qty+[0,-10,10,20][index];
    const newSales=Math.round(newQty*price/1000);
    return [newSales,newQty,price,Math.round(newSales*100/share),share];
  }));
  const diff = data.map(([before,after])=>after.map((value,m)=>100*(value/before[m]-1)));
  const revenueTotal = (period:number) => data.reduce((sum,row)=>sum+row[period][0],0);
  const share = (row:number,period:number) => 100*data[row][period][0]/revenueTotal(period);
  const a = data.findIndex(([,after])=>after[2]===Math.max(...data.map(([,v])=>v[2])));
  const d = data.findIndex(([,after])=>after[1]===Math.max(...data.map(([,v])=>v[1])));
  const g1 = diff.findIndex(v=>Math.abs(v[3]-20)<2&&Math.abs(v[4]+25)<2);
  const g2 = diff.findIndex(v=>v[1]>=25&&v[2]<0);
  return {data,diff,share,a,d,g1,g2,axes:resultPairs[index]};
}

export const endMark = '»', startMark = '«';
const transitions = [
  [1,12,13,14,15],[1,1,2,24,25],[3,4,33,34,35],
  [3,3,43,5,6],[51,4,53,5,6],[3,4,63,64,65],
] as const;
export const transitionText = transitions.map((row,i)=>row.map(value=>{
  const states = ['開始','左辺','代入','変数','定数','演算','終端'];
  if (value>=10) return 'err ← '+value;
  return value===i ? '' : 'st ← “'+states[value]+'”';
}));
export function characterCode(ch:string) {
  if (ch===startMark) return 0;
  if (ch===endMark) return 1;
  if (/[A-Za-z#]/.test(ch)) return 2;
  if (/\d/.test(ch)) return 3;
  if (ch==='=') return 10;
  return '+-'.includes(ch) ? 11 : 12;
}
export function parserError(statement: string) {
  if (/[^A-Za-z0-9=+*/-]/.test(statement)) return -1;
  let state = 0;
  for (const ch of statement+endMark) {
    const code = characterCode(ch);
    const column = code===1 ? 4 : code===10 ? 2 : code>=11 ? 3 : code-2;
    state = transitions[state][column];
    if (state>=10) return state;
  }
  return 0;
}
const examples = [
  {statement:'Ans=X1+10*X2', invalid:['Answer=One+Two+Three+','HexaSum=7FFF+0001','Position=Index++','X1+10*X2=Ans'], moveBefore:'Ans=wk#2+10+wk#1', move:-3},
  {statement:'Sum=A2-14/B4', invalid:['Val=A--B','Part1*2=Val','Val=A+20U','Data=U1+V2/'], moveBefore:'Sum=wk#2-12-wk#1', move:-3},
  {statement:'Z3=P4+25*Q7', invalid:['Num=8FG+001','Data=P1/Q2*','Y1-Y2=Res','Count=X//Y'], moveBefore:'Z3=wk#2+50+wk#1', move:-3},
  {statement:'Total=M2-99/N1', invalid:['T1/2=Total','Flag=On+Off*','Amount=U**V','Amount=5N4+100'], moveBefore:'Total=wk#2-55-wk#1', move:-3},
] as const;
export function parserModel(index:number) {
  const {statement,invalid,moveBefore,move}=examples[index];
  let replaced=statement;
  const output:string[]=[];
  let first=0, replaceStart=0, replaceEnd=0, firstReplaced='';
  for (;;) {
    const ops=[...replaced].flatMap((char,k)=>characterCode(char)>=11 ? [{k,priority:characterCode(char)}] : []);
    if (!ops.length) break;
    const choice=ops.reduce((best,op)=>op.priority>best.priority ? op : best);
    const left=replaced.slice(0,choice.k).match(/[A-Za-z0-9#]+$/)![0];
    const right=replaced.slice(choice.k+1).match(/^[A-Za-z0-9#]+/)![0];
    const start=choice.k-left.length, end=choice.k+right.length+1;
    const temp='wk#'+(output.length+1);
    output.push(temp+'='+replaced.slice(start,end));
    replaced=replaced.slice(0,start)+temp+replaced.slice(end);
    if (output.length===1) {
      first=choice.k+1;
      replaceStart=start+1;
      replaceEnd=end+1;
      firstReplaced=replaced;
    }
  }
  const from = moveBefore.lastIndexOf('wk#1');
  const moveFrom=from;
  const moved = moveBefore.slice(0,moveFrom+move-1)+moveBefore.slice(moveFrom-1);
  return {statement,invalid,errors:invalid.map(parserError),output:[...output,replaced],first,
    replaceStart,replaceEnd,firstReplaced,moveBefore,move,moveFrom,moved};
}
