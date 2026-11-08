import { figure, p, strings, type GeneratedBody } from './definition';
import { spring2014Am5480Source as source } from './legacy-2014-spring-am-54-80-source';
import { legacy2014SpringAm5480Figures as figures, spring2014Am5480Profiles as profiles } from './legacy-2014-spring-am-54-80-figures';
import { spring2014AmCases as cases, spring2014AmEscrowLabels, spring2014AmEscrowSteps,
  spring2014AmProfitLoss, spring2014AmScatter } from './legacy-2014-spring-am-54-80-models';

const fmt=(value:number)=>value.toLocaleString('en-US');
const prompts=(text:string)=>text.split('\n').filter(Boolean).map(p);
const named=(caption:string,columns:string[],rows:string[][]):GeneratedBody['prompt'][number] =>
  ({type:'table',caption,columns,rows,captionPresentation:'accessible'});
function diagram(profile:string,index:number,caption:string) {
  const definition=figures.find(item=>item.profile===profile)!;
  const result=figure(profile,[index],caption,definition.alt([index]));
  if(result.type!=='diagram')throw new Error('FIGURE_PROFILE');
  return {...result,captionPresentation:'accessible' as const};
}
function answer(options:string[],value:string) {
  const correctIndex=options.indexOf(value);
  if(correctIndex<0||options.length!==4||new Set(options).size!==4)throw new Error('PARAMETER_CONSTRAINT');
  return {choices:strings(options),correctIndex};
}

function fp(index:number):GeneratedBody {
  const [size,productivity,setup,rate]=cases.fp[index];
  const development=size/productivity;
  const subtotal=development+setup;
  const total=subtotal*(100+rate)/100;
  const options=[development+setup*rate/100,subtotal,development*(100+rate)/100+setup,total];
  if(options.some(value=>!Number.isSafeInteger(value)))throw new Error('PARAMETER_CONSTRAINT');
  const text=source[54].prompt.replace('500FP',size+'FP').replace('工数が10人月','工数が'+setup+'人月')
    .replace('工数の10％','工数の'+rate+'％').replace('当たり10FP','当たり'+productivity+'FP');
  return {prompt:[p(text)],...answer(index?options.map(String):source[54].choices,String(total)),
    explanation:'開発は'+size+'÷'+productivity+'＝'+development+'人月。導入・教育の'+setup+'人月を加えた'+subtotal+
      '人月が管理工数の基準になる。管理工数はその'+rate+'％の'+(total-subtotal)+'人月なので，全工数は'+total+'人月。'};
}

function sla(index:number):GeneratedBody {
  const [days,start,end,missing]=cases.sla[index];
  const duration=end-start;
  const result=duration*days*missing/1000;
  const sameHalf=Math.abs((end-12)-start);
  const options=[sameHalf,duration,end,24].map(hours=>hours*days*missing/1000);
  if(options.some(value=>!Number.isInteger(value*10)))throw new Error('PARAMETER_CONSTRAINT');
  const text=source[57].prompt.replace('営業日は30日','営業日は'+days+'日')
    .replace('午前8時から午後10時','午前'+start+'時から午後'+(end-12)+'時')
    .replace('99.5％以上',((1000-missing)/10).toFixed(1)+'％以上');
  return {prompt:prompts(text),...answer(index?options.map(value=>value.toFixed(1)):source[57].choices,result.toFixed(1)),
    explanation:'1日'+duration+'時間、月'+days+'日なので対象は'+(duration*days)+'時間。計画停止がなく、停止を許すのは'+
      (missing/10)+'％までだから、最大'+result.toFixed(1)+'時間となる。24時間を分母に含めず、午前・午後の違いを反映する。'};
}

function weighted(index:number):GeneratedBody {
  const [weights,scores]=cases.weighted[index];
  const scoresByPlan=Array.from({length:4},(_,j)=>scores.reduce((sum,row,i)=>sum+weights[i]*row[j],0));
  const max=Math.max(...scoresByPlan);
  if(scoresByPlan.filter(value=>value===max).length!==1)throw new Error('PARAMETER_CONSTRAINT');
  const best=scoresByPlan.indexOf(max);
  return {prompt:[p(source[62].prompt),diagram(profiles.weighted,index,'改善案の重み付け評価')],
    ...answer(source[62].choices,source[62].choices[best]),
    explanation:'各評価点に行の重みを掛けて合計する。案1から順に'+scoresByPlan.join('、')+'点なので、最も高い案'+
      (best+1)+'を優先する。重みを掛けずに足すと、重要度の違いが反映されない。'};
}

function demand(index:number):GeneratedBody {
  const [zero,low,query,lowDemand]=cases.demand[index];
  const result=lowDemand*(zero-query)/(zero-low);
  if(!Number.isSafeInteger(result))throw new Error('PARAMETER_CONSTRAINT');
  const first=result-5000*((index+3)%4);
  const options=Array.from({length:4},(_,i)=>fmt(first+i*5000));
  const text=source[69].prompt.replace('(1) 設定価格を3,000円','(1) 設定価格を'+fmt(zero)+'円')
    .replace('(2) 設定価格を1,000円','(2) 設定価格を'+fmt(low)+'円')
    .replace('60,000個',fmt(lowDemand)+'個')
    .replace('(3) 設定価格を1,500円','(3) 設定価格を'+fmt(query)+'円');
  return {prompt:prompts(text),...answer(index?options:source[69].choices,fmt(result)),
    explanation:'価格と需要は一次式なので、需要が0になる'+fmt(zero)+'円からの価格差に需要が比例する。'+
      fmt(lowDemand)+'×（'+fmt(zero-query)+'÷'+fmt(zero-low)+'）＝'+fmt(result)+'個。価格差の起点を取り違えない。'};
}

const time=[6,10,15], unitProfit=[1800,2500,3000];
const orders=[[2,1,0],[0,2,1],[1,0,2],[0,1,2]];
function production(index:number):GeneratedBody {
  const [hours,...limits]=cases.production[index];
  const outcomes=orders.map(order=>{
    let remaining=hours*60;
    const quantities=[0,0,0];
    for(const i of order){
      const quantity=Math.min(limits[i],Math.floor(remaining/time[i]));
      quantities[i]=quantity;
      remaining-=quantity*time[i];
    }
    return {quantities,profit:quantities.reduce((sum,quantity,i)=>sum+quantity*unitProfit[i],0)};
  });
  const best=outcomes[3];
  return {
    prompt:[p(source[71].prompt.replace('月間200時間','月間'+hours+'時間')),named('製品別の利益・組立て時間・需要上限',['','製品X','製品Y','製品Z'],[
      ['1個当たりの利益（円）',...unitProfit.map(fmt)],['1個当たりの組立て所要時間（分）',...time.map(String)],
      ['月間需要量上限（個）',...limits.map(fmt)],
    ])],
    ...answer(index?outcomes.map(outcome=>fmt(outcome.profit)):source[71].choices,fmt(best.profit)),
    explanation:'1分当たり利益はXが300円、Yが250円、Zが200円。需要上限まで利益率が高い製品から時間を配分すると、X・Y・Zの個数は'+
      best.quantities.map(fmt).join('、')+'で最大'+fmt(best.profit)+'円になる。'+
      'これらの入力では時間を整数個に割り当てても、時間当たり利益で求めた上限が実現できる。',
  };
}

function escrow(index:number):GeneratedBody {
  const step=spring2014AmEscrowSteps[index];
  const corresponding:Record<number,number>={3:3,4:1,5:0,6:2};
  const choices=source[72].choices;
  const reasons:Record<number,string>={
    3:'買い手の代金が会社に預託された直後で、商品はまだ発送していない。会社から売り手へ入金を知らせる。',
    4:'入金の知らせを受けた売り手は、代金を会社が保持した状態で買い手へ商品を発送する。',
    5:'商品を受け取った買い手が会社へ受領を知らせる。会社はこの通知を待ってから売り手に支払う。',
    6:'買い手からの受領通知で預託条件が成立するので、会社が保持していた代金を売り手へ支払う。',
  };
  return {prompt:[p(source[72].prompt.replace('取引モデルの⑤','取引モデルの'+spring2014AmEscrowLabels[step-1])),
    diagram(profiles.escrow,index,'エスクローサービスの取引モデル')],
    ...answer(choices,choices[corresponding[step]]),explanation:reasons[step]};
}

function licence(index:number):GeneratedBody {
  const [departments,pcs,box,single,bundle]=cases.licence[index];
  const rest=pcs-departments;
  const groups=Math.floor(rest/5);
  const singles=rest%5;
  const boxesCost=departments*box;
  const exact=boxesCost+groups*bundle+singles*single;
  const spare=boxesCost+Math.ceil(rest/5)*bundle;
  const optimum=Math.min(exact,spare);
  const ignoredManuals=Math.min(Math.ceil(pcs/5)*bundle,Math.floor(pcs/5)*bundle+(pcs%5)*single);
  const short=boxesCost+groups*bundle+Math.max(0,singles-1)*single;
  const alternative=optimum===exact?boxesCost+Math.max(0,groups-1)*bundle+(singles+5)*single:exact;
  const options=[ignoredManuals,short,optimum,alternative].sort((a,b)=>a-b).map(fmt);
  return {
    prompt:[p(source[76].prompt.replace('六つの部署','一二三四五六七'[departments-1]+'つの部署').replace('合計30台','合計'+pcs+'台')),
      named('ソフトウェアの購入方法',['購入方法','使用権','マニュアル','価格（円）'],[
        ['単体で1本','1','1',fmt(box)],['1ライセンス','1','0',fmt(single)],['5ライセンス','5','0',fmt(bundle)],
      ])],
    ...answer(index?options:source[76].choices,fmt(optimum)),
    explanation:'各部署に冊子が要るので、マニュアル付きの単体を'+departments+'本用意する。残り'+rest+'台には5件組と1件を組み合わせる。'+
      '使用権をちょうど揃える方法は'+fmt(exact)+'円、残りを全て5件組で買う方法は'+fmt(spare)+'円なので、最少は'+fmt(optimum)+'円。'+
      '冊子付き単体の買い増しは、同じ使用権1件の単品より高くなる。',
  };
}

function scatter(index:number):GeneratedBody {
  const points=spring2014AmScatter(index);
  const means=points.reduce(([sx,sy],[x,y])=>[sx+x/points.length,sy+y/points.length],[0,0]);
  const signed=points.reduce((sum,[x,y])=>sum+(x-means[0])*(y-means[1]),0);
  const direction=signed>0?'正':'負';
  const choices=source[77].choices;
  return {prompt:[p(source[77].prompt),diagram(profiles.scatter,index,'製造上の要因と品質特性の散布図')],
    ...answer(choices,choices[signed>0?2:3]),
    explanation:'点の並びは左から右へ向かって'+(signed>0?'上がる':'下がる')+'傾向である。平均からのずれの積を合計すると'+
      direction+'なので、相関係数も'+direction+'になる。回帰式の向きや次数は、この図の傾向だけでは決まらない。'};
}

function breakEven(index:number):GeneratedBody {
  const m=spring2014AmProfitLoss(index);
  const variables=m.productionVariable+m.sellingVariable;
  const fixed=m.productionFixed+m.sellingFixed;
  const answerSales=fixed*m.sales/(m.sales-variables);
  const options=[
    m.productionFixed*m.sales/(m.sales-variables),
    fixed*m.sales/(m.sales-m.productionVariable),fixed,answerSales,
  ];
  if(index&&options.some(value=>!Number.isSafeInteger(value)))throw new Error('PARAMETER_CONSTRAINT');
  return {prompt:[p(source[78].prompt),diagram(profiles.profitLoss,index,'企業の損益計算書')],
    ...answer(index?options.sort((a,b)=>a-b).map(String):source[78].choices,String(answerSales)),
    explanation:'変動費は'+m.productionVariable+'＋'+m.sellingVariable+'＝'+variables+'百万円、固定費は'+m.productionFixed+
      '＋'+m.sellingFixed+'＝'+fixed+'百万円。売上に対する限界利益率は（'+m.sales+'−'+variables+'）÷'+m.sales+
      'なので、損益が0になる売上は'+answerSales+'百万円。売上原価と販売費・一般管理費の両方を含める。'};
}

export const spring2014Am5480Calculations:Partial<Record<number,{ count:number; build(index:number):GeneratedBody; notes:string }>> = {
  54:{count:cases.fp.length,build:fp,notes:'人月の整数精度を保ち、率の対象や管理工数の取り違いを四択で照合。'},
  57:{count:cases.sla.length,build:sla,notes:'営業時間帯と計画停止なしを維持。停止時間を小数第一位までの有限条件に制約。'},
  62:{count:cases.weighted.length,build:weighted,notes:'2016秋64と原表が一致。重みと評価点を変え、結合見出しと案1〜4の順序を保つ。'},
  69:{count:cases.demand.length,build:demand,notes:'0需要の価格、低価格の需要、内分価格の三条件と空欄を維持。四候補は5,000個間隔。'},
  71:{count:cases.production.length,build:production,notes:'2016秋71と元の数値が一致。各製品の個数は整数であり、最大利益は独立に列挙して検査。'},
  72:{count:spring2014AmEscrowSteps.length,build:escrow,notes:'図中の実在の順番③〜⑥を変える。矢印や手順と4つの行為の対応を検査。'},
  76:{count:cases.licence.length,build:licence,notes:'5件組、単品、マニュアル付き単体。余る使用権を許す整数最適化と四候補の役割を検査。'},
  77:{count:8,build:scatter,notes:'原図の33点・原点・目盛なしの軸を保持し、点の値を変え符号を検算。'},
  78:{count:cases.pl.length,build:breakEven,notes:'2種の費用の区分、結合セル、百万円、整数の損益分岐点を保持。'},
};
