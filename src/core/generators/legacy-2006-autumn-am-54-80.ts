import { DataError } from '../errors';
import { code, field, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { autumn2006Am5480Source as source } from './legacy-2006-autumn-am-54-80-source';
import { autumn2006Am5480Knowledge as knowledge } from './legacy-2006-autumn-am-54-80-knowledge';
import { autumn2006AmOC, autumn2006AmScatter, autumn2006Am5480Figure as chart } from './legacy-2006-autumn-am-54-80-figures';

const int=(n:number)=>n.toLocaleString('en-US');
function correct(values:boolean[]) {
  const at=values.indexOf(true);
  if(at<0 || at!==values.lastIndexOf(true)) throw new DataError('ANSWER_REF','2006年度秋期旧午前の正答を一意に確定できません');
  return at;
}

const lines=[[64000,1000,2,20],[48000,1200,3,25],[80000,1800,2,10],[96000,1500,4,20]];
function utilization(i:number):GeneratedBody {
  const [rate,bytes,seconds,overhead]=lines[i];
  const payload=100*bytes*8/(rate*seconds), used=payload*(1+overhead/100);
  const options=i===0?[...source[55].choices]:[used/8,payload,used,used*seconds**2].sort((a,b)=>a-b).map(n=>n.toFixed(1));
  const prompt=source[55].prompt.replace('64,000',int(rate)).replace('1,000',int(bytes)).replace('2秒',seconds+'秒').replace('20％',overhead+'％');
  return {prompt:[p(prompt)],choices:strings(options),correctIndex:correct(options.map(v=>v===used.toFixed(1))),
    explanation:'1回の転送に必要な量は'+int(bytes)+'×8×(1＋'+overhead+'/100)＝'+int(bytes*8*(1+overhead/100))+
      'ビット。'+seconds+'秒に送れる量は'+int(rate*seconds)+'ビットなので，その比を100倍すると約'+used.toFixed(1)+'％になる。'};
}

const records=[
  ['100','3100','10','東京都','2006年5月'],['100','1200','60','東京都','2006年11月'],['100','1200','20','東京都','2007年1月'],
  ['200','1100','10','大阪府','2006年6月'],['200','2200','20','大阪府','2006年10月'],
  ['300','3200','10','北海道','2006年7月'],['300','1200','30','北海道','2006年9月'],
  ['400','4030','40','東京都','2006年8月'],['400','2200','40','東京都','2006年9月'],['400','1200','20','東京都','2006年12月'],
];
const attributes=['A','B','C','D','E'];
function dependencies(i:number):GeneratedBody {
  const dependent=[3,1,2,4][i], cities=['広島県','京都府','宮城県','東京都'];
  const data=i===0?records:records.map((row,j)=>{
    const group=Number(row[0])/100-1, local=j-[0,3,5,7][group];
    const varying=[String(100+group*100+i*20),String(1300+((group+1)*10+(local+1)*10)*i),
      String(11+group*5+local*10),cities[(group+local+i)%4],(2006+i)+'年'+(group+2+local*2)+'月'];
    const base=[varying[0],String(1100+group*300),String(12+group*10),cities[(group+i)%4],(2006+i)+'年'+(group+5)+'月'];
    varying[dependent]=base[dependent];
    return varying;
  });
  const determines=(j:number)=>{
    const seen=new Map<string,string>();
    for(const row of data) {
      if(seen.has(row[0])&&seen.get(row[0])!==row[j]) return false;
      seen.set(row[0],row[j]);
    }
    return true;
  };
  const index=correct([1,2,3,4].map(determines));
  return {prompt:[p(source[60].prompt),table('属性A〜Eの値',attributes,data)],choices:strings(attributes.slice(1)),correctIndex:index,
    explanation:'同じAを持つ複数行で値が必ず一致する属性を探す。'+attributes[index+1]+'はAが同じ範囲の行で等しく，他の属性は同じAでも値が変わる行がある。'};
}

const shipments=[
  {year:'2006',codes:['NP200','FP233'],qty:[3,2,1,2],dateFilter:1,codeFilter:0},
  {year:'2007',codes:['SD410','GT521'],qty:[2,2,7,1],dateFilter:0,codeFilter:1},
  {year:'2008',codes:['MK230','LS343'],qty:[2,4,3,4],dateFilter:1,codeFilter:0},
  {year:'2009',codes:['FK510','JL615'],qty:[2,1,2,1],dateFilter:1,codeFilter:1},
];
function aggregate(i:number):GeneratedBody {
  const {year,codes,qty,dateFilter,codeFilter}=shipments[i];
  const dates=[year+'-10-10',year+'-10-11'];
  const rows=qty.map((n,j)=>[codes[j%2],dates[Math.floor(j/2)],String(n)]);
  const options=source[62].choices.map(text=>text.replace('NP200',codes[codeFilter]).replace('2006-10-11',dates[dateFilter]));
  const results=[(qty[codeFilter]+qty[codeFilter+2])/2,qty.length,Math.max(...qty),qty[2*dateFilter]+qty[2*dateFilter+1]];
  return {prompt:[p(source[62].prompt),table('出庫記録',['商品番号','日付','数量'],rows)],
    choices:options.map(choice=>[code(choice,'sql')]),correctIndex:correct(results.map(value=>value===Math.max(...results))),
    explanation:'アのAVGは指定した商品だけの平均，イのCOUNTは全行数，ウのMAXは全行の数量の最大，エのSUMは指定日の数量の合計である。結果はアから順に'+
      results.join('，')+'となる。'};
}

const stock=[
  [100,50,50,3,5,4,50,100],[80,40,60,2,5,4,40,100],[80,30,30,3,7,5,30,70],[80,40,30,8,14,9,40,70],
];
function stockCost(i:number):GeneratedBody {
  const [begin,lot1,lot2,first,second,third,sold1,sold2]=stock[i];
  const movements=[['9月1日','前月繰越',String(begin),String(first)],['6日','仕入',String(lot1),String(second)],
    ['10日','売上',String(sold1),''],['17日','仕入',String(lot2),String(third)],['25日','売上',String(sold2),''],
    ['30日','次月繰越',String(begin+lot1+lot2-sold1-sold2),'']];
  const sale1=sold1*second;
  const sale2=lot2*third+(sold2-lot2)*first;
  const total=sale1+sale2;
  const backFromBeginning=Math.min(sold2,begin-sold1);
  const backFromFirstLot=Math.min(sold2-backFromBeginning,lot1);
  const fifo=(sold1+backFromBeginning)*first+backFromFirstLot*second+(sold2-backFromBeginning-backFromFirstLot)*third;
  const avg1=(begin*first+lot1*second)/(begin+lot1);
  const avg2=((begin+lot1-sold1)*avg1+lot2*third)/(begin+lot1-sold1+lot2);
  const monthly=(begin*first+lot1*second+lot2*third)*(sold1+sold2)/(begin+lot1+lot2);
  const options=i===0?[...source[73].choices]:[fifo,sold1*avg1+sold2*avg2,monthly,total].map(Math.round).sort((a,b)=>a-b).map(int);
  const variants=source[73].prompt;
  return {prompt:[p(variants),table('受払記録',['日付','区分','個数','単価（万円）'],movements)],
    choices:strings(options),correctIndex:correct(options.map(value=>value===int(total))),
    explanation:'後入先出法では売上の直前に入った商品から順に払い出す。10日は'+sold1+'個を単価'+second+
      '万円で，25日は'+lot2+'個を単価'+third+'万円，残り'+(sold2-lot2)+'個を単価'+first+'万円で払い出す。合計は'+int(total)+'万円である。'};
}

const items=[[110,2],[60,40],[10,4],[130,1],[50,12],[1,25],[10,2],[150,2],[20,2],[50,1]];
const productCases=[
  {amounts:items, options:[[1,2],[2,5],[2,6],[4,8]]},
  {amounts:[[70,8],[40,50],[40,2],[48,3],[90,3],[2,27],[60,4],[100,1],[14,2],[42,1]],options:[[1,2],[2,5],[1,5],[2,6]]},
  {amounts:[[90,2],[70,3],[50,56],[20,32],[50,3],[18,2],[100,2],[180,1],[12,4],[40,2]],options:[[1,2],[3,7],[3,4],[4,8]]},
  {amounts:[[30,70],[90,1],[82,2],[60,2],[20,16],[60,4],[40,4],[90,7],[25,2],[33,1]],options:[[1,2],[1,5],[2,8],[1,8]]},
];
function abc(i:number):GeneratedBody {
  const {amounts,options}=productCases[i];
  const result=amounts.map(([count,price],j)=>({id:j+1,count,price,sales:count*price}));
  const sorted=[...result].sort((a,b)=>b.sales-a.sales);
  const rows=result.map(row=>[String(row.id),int(row.count),int(row.price),int(row.sales)]);
  const [first,second]=sorted;
  const total=result.reduce((sum,row)=>sum+row.sales,0);
  rows.push(['合計',int(result.reduce((sum,row)=>sum+row.count,0)),'',int(total)]);
  return {prompt:[p(source[74].prompt),table('年間販売数・単価・年間売上高',['商品番号','年間販売数','単価','年間売上高'],rows)],
    choices:strings(options.map(pair=>pair.join('と'))),correctIndex:correct(options.map(pair=>pair.includes(first.id)&&pair.includes(second.id))),
    explanation:'ABC分析は年間売上高が大きい順に分類する。選択肢はいずれも2商品なので，それより売上高の大きな商品を飛ばさない組を選ぶ。先頭の2商品は'+
      first.id+'（'+int(first.sales)+'）と'+second.id+'（'+int(second.sales)+'）である。'};
}

function oc(i:number):GeneratedBody {
  const {positions,levels}=autumn2006AmOC(i);
  return {prompt:[p(source[75].prompt),chart('75-oc',i,'OC曲線の合格率と不良率')],
    choices:strings([...source[75].choices]),correctIndex:2,
    explanation:'不良率がp2となる位置で合格率はL2であり，不良率がそれより増えると曲線は下がるので，合格率はL2以下になる。' +
      'p1より小さいときの不合格率は1.0−L1未満であり，p2直前の不合格率は1.0−L2へ近づく。'+
      (i===0?'':'この図の基準位置は横軸に沿って順に'+positions.join('，')+'％，対応する合格率は'+levels.join('，')+'である。')};
}

function correlation(i:number):GeneratedBody {
  const ask=i%2===0?'負':'正';
  const choose=autumn2006AmScatter(i);
  const expected=choose.indexOf(ask==='負'?1:3);
  return {prompt:[p(source[77].prompt.replace('負の相関',ask+'の相関'))],
    choices:choose.map((_,j)=>[chart('77-option-'+String(j+1),i,'散布図')]),correctIndex:expected,
    explanation:ask+'の相関では，横軸の値が大きくなるほど，縦軸の値も全体として'+(ask==='負'?'小さく':'大きく')+
      'なる傾向がある。選択肢'+ 'アイウエ'[expected]+'がその傾向を示す。山なりの関係では増加と減少が混在する。'};
}

const cakes=[
  {uses:[[6,2],[3,4]],profits:[600,400],limits:[360,240]},
  {uses:[[4,2],[2,4]],profits:[520,410],limits:[180,210]},
  {uses:[[6,2],[2,6]],profits:[500,550],limits:[240,320]},
  {uses:[[5,3],[2,5]],profits:[650,450],limits:[250,340]},
];
function optimize(i:number):GeneratedBody {
  const {uses:[[mK,mL],[nK,nL]],profits:[mValue,nValue],limits:[limitK,limitL]}=cakes[i];
  const divide=mK*nL-mL*nK;
  const m=(limitK*nL-limitL*nK)/divide, n=(mK*limitL-mL*limitK)/divide;
  const loneM=Math.floor(Math.min(limitK/mK,limitL/mL))*mValue;
  const loneN=Math.floor(Math.min(limitK/nK,limitL/nL))*nValue;
  const total=m*mValue+n*nValue;
  if(!Number.isInteger(m)||!Number.isInteger(n)||m<0||n<0||total<=Math.max(loneM,loneN))
    throw new DataError('PARAMETER_CONSTRAINT','利益最大化問題の交点が不正です');
  const high=(Math.floor(limitK/mK)+5)*mValue+Math.ceil(n/2)*nValue;
  const options=i===0?[...source[78].choices]:[loneM,loneN,total,high].sort((a,b)=>a-b).map(int);
  return {prompt:[p(source[78].prompt.replace(/([KL]の1日の最大製造能力は)\d+個/g,(text,prefix:string)=>prefix+(text.startsWith('K')?limitK:limitL)+'個')),
      table('箱詰めの組合せと1商品当たりの利益',['商品','K（個）','L（個）','販売利益（円）'],
        [['商品M',String(mK),String(mL),int(mValue)],['商品N',String(nK),String(nL),int(nValue)]])],
    choices:strings(options),correctIndex:correct(options.map(value=>value===int(total))),
    explanation:'MとNの個数を使い，KとLの使用数がそれぞれ'+limitK+'個，'+limitL+'個以内になる条件を立てる。両方を使い切る交点はMが'+
      m+'個，Nが'+n+'個となる。Mだけ（'+int(loneM)+'円），Nだけ（'+int(loneN)+'円）より利益が大きく，最大は'+int(total)+'円である。'};
}

const structured:Readonly<Record<number,{build:(i:number)=>GeneratedBody;notes:string;fixed?:boolean}>>={
  55:{build:utilization,notes:'速度・平均転送量・送信周期・制御情報の百分率を同じ位置にバインドし，選択肢は1桁小数の昇順。',fixed:true},
  60:{build:dependencies,notes:'5属性と10行の表で依存関係を判定し，同じ属性Aから決まる列を可変にする。列順は固定。'},
  62:{build:aggregate,notes:'出庫記録の4行，AVG・COUNT・MAX・SUMの順を保持し，数量・対象名・日付を変更。'},
  73:{build:stockCost,notes:'在庫2ロットを加える月間受払の後入先出法。先に入れたロットを第1売上で完売し，継続記録法と期末総合結果が一致。誤答は先入先出，移動平均，総平均を比較して昇順。',fixed:true},
  74:{build:abc,notes:'全2商品ずつの候補のうち，年間売上高降順先頭の組だけが条件を満たす。数値と選択肢の組を可変とする。'},
  75:{build:oc,notes:'OC曲線の二つの基準点を移動し，原4肢の確率・不等号の順を固定。曲線全体を連動させる。',fixed:true},
  77:{build:correlation,notes:'同じ尺度の4散布図で相関方向を判定。点群と向きを変え，選択肢の入替えだけに頼らない。'},
  78:{build:optimize,notes:'2種類の資源・商品と利益を可変にして制約内の最大値を求める。選択肢は金額昇順。'},
};

export const legacy2006AutumnAm54To80Definitions:GenerationDefinition[]=Object.entries(source).map(([n,item])=>{
  const number=Number(n), model=structured[number];
  return {source:'2006h18a-fe-am-'+n,title:item.title,sourceAnswer:item.key,fields:[field('対象・判断条件',0,3)],reference:[0],
    version:'3.7.0',notes:variableNotes+' 原冊子p.'+item.page+'。'+(model?.notes??'択順と判定形式を保ち，対象と状況を変える。'),
    ...(model?.fixed?{answerVariation:'fixed' as const}:{}),
    build(values){
      const [i]=values;
      if(values.length!==1||!Number.isSafeInteger(i)||i<0||i>3) throw new DataError('PARAMETER_CONSTRAINT','2006年度秋期旧午前の入力が範囲外です');
      if(model) return model.build(i);
      const selected=knowledge[number][i];
      return {prompt:[p(selected.prompt)],choices:strings([...selected.options]),correctIndex:selected.correctIndex,explanation:selected.explanation};
    },
  };
});
