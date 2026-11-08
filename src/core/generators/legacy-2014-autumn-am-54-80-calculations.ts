import { figure, p, strings, type GeneratedBody } from './definition';
import { autumn2014Am5480Source as source } from './legacy-2014-autumn-am-54-80-source';
import { autumn2014Am77Alt, autumn2014Am77Profile, autumn2014Am77Tables } from './legacy-2014-autumn-am-54-80-figures';

const sourceTable = (caption: string, columns: string[], rows: string[][]): GeneratedBody['prompt'][number] =>
  ({type:'table',caption,columns,rows,captionPresentation:'accessible'});
const optionResult = (options:string[],result:string) => {
  const correctIndex=options.indexOf(result);
  if(correctIndex<0||options.length!==4||new Set(options).size!==4)throw new Error('PARAMETER_CONSTRAINT');
  return { choices:strings(options),correctIndex };
};
const effortCases = [
  [95,8,20,10,5,1,3,9], [90,7,20,10,6,1,3,8], [105,8,22,12,5,1,3,10],
  [100,9,25,10,5,1,3,9], [90,7,18,10,4,1,3,8], [95,9,22,10,5,1,3,9],
  [100,7,24,11,4,1,4,8], [100,8,20,12,6,1,3,9],
];
function effort(index: number): GeneratedBody {
  const [days,multiplier,n1,n2,n3,t1,t2,t3]=effortCases[index];
  const kinds=['入力処理','出力処理','計算処理'];
  const codingParts=[n1*t1,n2*t2,n3*t3];
  const coding=codingParts.reduce((sum,amount)=>sum+amount,0);
  const total=coding*(multiplier+1);
  const count=Math.ceil(total/days);
  const partial=[
    Math.ceil((coding-Math.min(...codingParts))*(multiplier+1)/days),
    Math.ceil(coding*multiplier/days),
    Math.ceil((coding-codingParts[1])*(multiplier+1)/days),
  ];
  const larger=[Math.ceil(total*4/(days*3)),Math.ceil(total*13/(days*9)),Math.ceil(coding*(multiplier+2)/days)];
  const lowCount=index%2?2:1;
  const below=[...new Set(partial)].filter(value=>value<count).sort((a,b)=>a-b).slice(-lowCount);
  const above=[...new Set(larger)].filter(value=>value>count).sort((a,b)=>a-b).slice(-3+lowCount);
  const choices=index===0?source[54].choices:[...below,count,...above].map(String);
  return {
    prompt:[p(source[54].prompt.replace('95日間',days+'日間').replace('8倍',multiplier+'倍')),
      sourceTable('プログラムの本数とコーディング所要工数',['','プログラムの本数','プログラム1本当たりのコーディング所要工数（人日）'],
        kinds.map((label,i)=>[label,String([n1,n2,n3][i]),String([t1,t2,t3][i])]))],
    ...optionResult(choices,String(count)),
    explanation:'コーディングの工数は'+codingParts.join('＋')+'＝'+coding+'人日。設計・テストを含めると'+coding+
      '×（1＋'+multiplier+'）＝'+total+'人日である。'+(count-1)+'人では'+((count-1)*days)+'人日、'+
      count+'人なら'+(count*days)+'人日を確保できるので、最少は'+count+'人。',
  };
}

const productionCases = [
  [1000,[[4,3,150],[3,2,160],[7,4,170],[12,7,180]]],
  [1000,[[5,3,160],[3,2,160],[6,4,160],[12,7,180]]],
  [900,[[4,3,140],[4,2,170],[7,4,160],[12,6,180]]],
  [1100,[[4,3,160],[3,2,170],[6,4,170],[11,6,190]]],
  [1200,[[4,3,150],[3,3,125],[6,4,180],[9,6,190]]],
  [800,[[5,3,140],[4,2,160],[8,4,150],[12,6,170]]],
  [1100,[[4,3,150],[4,2,200],[6,4,170],[11,7,180]]],
  [900,[[4,3,140],[3,2,140],[7,4,160],[13,6,190]]],
] as const;
const decimalInteger = (value:number) => value.toLocaleString('en-US');
function production(index: number): GeneratedBody {
  const [demand,rows]=productionCases[index];
  const choices=source[74].choices;
  const supply=rows.map(([,machines,hours])=>machines*hours);
  const demandHours=rows.map(([time])=>demand*time/10);
  const shortage=rows.flatMap(([time],i)=>demand*time>supply[i]*10?[choices[i]]:[]);
  if(shortage.length!==1)throw new Error('PARAMETER_CONSTRAINT');
  return {
    prompt:[p(source[74].prompt.replace('1,000個',decimalInteger(demand)+'個')),
      sourceTable('工程ごとの製造時間・保有機械台数・生産能力',
        ['工程','1個製造時間（時間）','保有機械台数（台）','生産能力（時間／台）'],
        rows.map(([time,machines,hours],i)=>[choices[i],(time/10).toFixed(1),String(machines),String(hours)]))],
    ...optionResult(choices,shortage[0]),
    explanation:'需要を満たすのに必要な時間は、A〜Dの順に'+demandHours.join('、')+
      '時間。保有台数と1台当たりの時間を掛けた供給は'+supply.join('、')+'時間。必要量が供給を上回るのは'+shortage[0]+'だけ。',
  };
}

const abcCases = [
  [70,[182,136,120,98,91,83,70,60,35]],
  [65,[245,170,130,95,80,65,45,30,20]],
  [65,[320,200,160,80,70,60,50,40,20]],
  [75,[210,160,125,90,80,70,65,60,40]],
  [70,[260,180,140,120,90,70,60,50,30]],
  [70,[285,230,185,80,60,55,45,35,25]],
  [75,[205,158,145,105,100,94,75,62,56]],
  [70,[250,195,120,95,90,85,80,50,35]],
] as const;
function abc(index: number): GeneratedBody {
  const [threshold,counts]=abcCases[index];
  const total=counts.reduce((sum,amount)=>sum+amount,0);
  let cumulative=0,last=0,count=0;
  while(cumulative*100<threshold*total){
    last=cumulative;
    cumulative+=counts[count++];
  }
  return {
    prompt:[p(source[76].prompt.replace('70％',threshold+'％')),
      sourceTable('製品別の不良品数',['製品',...'PQRSTUVWX','合計'],[['個数',...counts.map(String),String(total)]])],
    ...optionResult(source[76].choices,String(count)),
    explanation:'総数'+total+'個の'+threshold+'％は'+(total*threshold/100)+'個。上位'+(count-1)+'種類の累積は'+last+
      '個で届かず、上位'+count+'種類の'+cumulative+'個で初めて閾値以上になる。',
  };
}

function market(index: number): GeneratedBody {
  const rows=autumn2014Am77Tables[index];
  const answers=rows.flatMap((row,a)=>row.flatMap(([scoreA,scoreB],b)=>
    scoreA>rows[1-a][b][0]&&scoreB>rows[a][1-b][1]?[{a,b}]:[]));
  if(answers.length!==1)throw new Error('PARAMETER_CONSTRAINT');
  const {a,b}=answers[0];
  const choices=source[77].choices;
  const [scoreA,scoreB]=rows[a][b];
  const diagram=figure(autumn2014Am77Profile,[index],'A社とB社の市場シェア',autumn2014Am77Alt([index]));
  if(diagram.type!=='diagram')throw new Error('FIGURE_PROFILE');
  return {
    prompt:[p(source[77].prompt),{...diagram,captionPresentation:'accessible'}],
    ...optionResult(choices,choices[a*2+b]),
    explanation:'戦略a'+(a+1)+'・b'+(b+1)+'ではA社が'+scoreA+'％、B社が'+scoreB+
      '％。A社だけが戦略を変えると'+rows[1-a][b][0]+'％、B社だけが戦略を変えると'+rows[a][1-b][1]+
      '％になり、どちらも単独で切り替えて改善できない。この組合せがナッシュ均衡。',
  };
}

const fifoCases = [
  [2000,100,3000,130,3000], [1000,80,3000,120,2500], [3000,100,2000,140,4000], [1000,120,5000,180,4000],
  [4000,100,2000,160,5000], [2000,70,6000,110,5000], [4000,150,1000,60,4500], [2000,160,4000,130,3000],
] as const;
function fifo(index: number): GeneratedBody {
  const [opening,oldPrice,purchased,newPrice,issue]=fifoCases[index];
  const fromPurchase=issue-opening;
  const paid=opening*oldPrice+fromPurchase*newPrice;
  const correct=paid/issue;
  const simple=(oldPrice+newPrice)/2;
  const total=(opening*oldPrice+purchased*newPrice)/(opening+purchased);
  const nums=[oldPrice,correct,simple,total];
  if(fromPurchase<=0||fromPurchase>purchased||nums.some(n=>!Number.isSafeInteger(n)))throw new Error('PARAMETER_CONSTRAINT');
  return {
    prompt:[p(source[78].prompt),
      sourceTable('部品の受払記録',['取引日','取引内容','数量（個）','単価（円）','金額（円）'],[
        ['4月1日','前月繰越',decimalInteger(opening),String(oldPrice),decimalInteger(opening*oldPrice)],
        ['4月5日','購入',decimalInteger(purchased),String(newPrice),decimalInteger(purchased*newPrice)],
        ['4月10日','払出',decimalInteger(issue),'',''],
      ])],
    ...optionResult(nums.sort((a,b)=>a-b).map(String),String(correct)),
    explanation:'先に入った前月繰越'+decimalInteger(opening)+'個を'+oldPrice+'円で払い出し、不足分'+
      decimalInteger(fromPurchase)+'個は新しい購入分から'+newPrice+'円で払い出す。合計'+decimalInteger(paid)+
      '円を'+decimalInteger(issue)+'個で割ると、払出単価は'+correct+'円。',
  };
}
export const autumn2014Am5480Calculations: Partial<Record<number,{count:number; build(index:number):GeneratedBody; notes:string}>> = {
  54:{count:effortCases.length,build:effort,notes:'2019春54と同じ原値・四択・整数切上げ。三種の本数・工数・期間・追加倍を束縛し、過少・過大見積りを比較。'},
  74:{count:productionCases.length,build:production,notes:'1個の製造時間は0.1時間刻み。月需要、台数、時間を変え、一工程だけ不足させる。等量の境界を含む。'},
  76:{count:abcCases.length,build:abc,notes:'9品目の降順と合計。累積は百分率に丸めず、閾値に等しい例を含め、選択肢の3〜6を維持。'},
  77:{count:autumn2014Am77Tables.length,build:market,notes:'行・列見出し、単位と左右の役割を固定。各社シェア合計100以下で同率なし、四セルの単独変更を全検査。'},
  78:{count:fifoCases.length,build:fifo,notes:'受払の先後、日付と桁数を維持し、払出単価、旧単価、二単価の平均、総平均をすべて異なる整数円にする。'},
};
