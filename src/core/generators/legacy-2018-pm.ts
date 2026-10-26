import {field,figure,p,strings,variableNotes,type GenerationDefinition} from "./definition";

const integer=(n:number)=>Math.round(n).toLocaleString("en-US");
/** Geometry is part of a managed figure, never executable source data. The
 * original has no numeric ticks: the four styles and relative slopes matter. */
export function legacy2018CostCurves(highest:number){
  if(!Number.isInteger(highest)||highest<0||highest>3)throw Error("PARAMETER_CONSTRAINT");
  const rise=[110,210,100,40];[rise[1],rise[highest]]=[rise[highest],rise[1]];
  return [160,25,50,12].map((intercept,i)=>({intercept,rise:rise[i],dash:[undefined,"14 9","2 10","24 9"][i]}));
}
export function legacy2018ProfitInputs(values:number[]){
  const bounds=[[0,1],[0,2],[1,3],[0,3]];
  if(values.length!==4||values.some((n,i)=>!Number.isInteger(n)||n<bounds[i][0]||n>bounds[i][1])||values[0]===0&&values[1]===2)throw Error("PARAMETER_CONSTRAINT");
  const [ratioCase,profitCase,scale,highest]=values,ratio=[75,80][ratioCase],discount=[4,8,12][profitCase];
  const salesX=200000*scale,salesY=240000*scale,profitX=salesX*discount/100,fixed=salesX*(100-ratio-discount)/100;
  return {ratio,discount,scale,highest,salesX,salesY,profitX,profitY:salesY*(100-ratio)/100-fixed,fixed};
}
export function legacy2018PmFigureAlt(profile:string,values:number[]):string {
  if(profile==="legacy-2018-profit-table"){
    const x=legacy2018ProfitInputs([...values,1]);
    return `表1 収益検討表。列はケース、X、Y。販売数（千個）は${integer(1000*x.scale)}、${integer(1200*x.scale)}。売上高（千円）は${integer(x.salesX)}、${integer(x.salesY)}。変動費（千円）と固定費（千円）は両ケースとも網掛けで表示していない。利益（千円）は${integer(x.profitX)}、${integer(x.profitY)}。`;
  }
  if(profile==="legacy-2018-cost-curves"){
    const lines=legacy2018CostCurves(values[0]);
    if(values.length!==1)throw Error("PARAMETER_CONSTRAINT");
    const slopes=lines.map((c,i)=>({rise:c.rise,name:"①②③④"[i]})).sort((a,b)=>a.rise-b.rise).map(c=>c.name);
    return `図1 4社の売上高と費用の関係を示したグラフ。横軸は売上高、縦軸は費用、原点は0で、数値目盛りはない。①は実線、②は破線、③は点線、④は長破線。4本とも正の切片をもち右上がりの直線で、縦軸との交点は上から①③②④。傾きは小さい順に${slopes.join("、")}。`;
  }
  throw Error("UNKNOWN_LEGACY_2018_FIGURE");
}
const managed=(profile:string,values:number[],caption:string)=>figure(profile,values,caption,legacy2018PmFigureAlt(profile,values));
const counts=[5,5,5,5,3,4,3,4],offsets=[0,5,10,15,20,23,27,30];
const partIds=["a","b","c","d","e","graph","f","g"];
/** One whole three-page old-system afternoon major question, eight slots. */
export const legacy2018AfternoonDefinitions:GenerationDefinition[]=[{
  source:"2018h30h-fe-pm-7",title:"旧制度・午後：収益と損益分岐点",sourceAnswer:"設問1 a=エ、b=イ、c=エ、d=イ、e=イ／設問2=イ／設問3 f=イ、g=ア",
  fields:[field("variableCostRatioCase",0,1),field("profitMarginCase",0,2),field("quantityAndMoneyScale",1,3),field("highestSlopeCurve",0,3)],reference:[0,1,1,1],
  notes:variableNotes+" 2018春午後問7全3頁の本文・収益表の非表示セル・4本の直線図・設問1〜3の8欄（5/5/5/5/3/4/3/4択）を維持。変動費率75/80%、利益率4/8/12%、数量と金額の整数倍率1〜3、最大の傾きをもつ直線を変える。75%と利益率12%の組合せは固定費と利益の誤答間隔が原の半分未満になるため明示拒否。72宣言入力中60有効、12拒否。正答は整数で求まり丸めを加えない。原選択肢cの誤答にある千円単位の表示で生じる端数について、生成版では誤答だけを千円単位へ四捨五入し、誤った除数/固定費による誤答の役割を保持する。原資料に丸め方式の指定があるとは扱わない。表の変動費と固定費の値は解答前に表示しない。設問1の値下げは販売数・変動費総額を変えず、設問3の費用率改善は固定費一定として分ける。図は数値目盛りのない4本の一次関数、軸・原点・線種・①〜④を保持する。共有profileと全年度セットは未登録。",
  build:values=>{
    const x=legacy2018ProfitInputs(values),r=x.ratio/100,margin=(100-x.ratio)/100;
    const ratioChoices=[x.ratio-50,x.ratio-35,x.ratio-15,x.ratio,x.ratio+5];
    const wrongFixed=x.fixed+x.salesX*.15;
    const numeric=[ratioChoices,[x.profitX,x.fixed,wrongFixed,x.fixed+x.salesX*.35,x.fixed+x.salesX*.5],
      [Math.round(x.fixed/r),wrongFixed,Math.round(wrongFixed/r),x.fixed/margin,wrongFixed/margin],
      [x.discount/2,x.discount,x.discount*1.25,x.discount*1.5,x.discount*2]];
    if(numeric.some(group=>new Set(group.map(integer)).size!==group.length))throw Error("PARAMETER_CONSTRAINT");
    const choices=[...numeric.flatMap(group=>strings(group.map(integer))),...strings(["と変わらない","よりも大きい","よりも小さい"]),...strings(["①","②","③","④"]),...strings(["上げる","下げる","0にする"]),...strings(["原材料の単価を下げる","社員の給与を上げる","販売数を増やす","販売単価を下げる"])];
    const correct=[3,1,3,1,1,x.highest,1,0];
    return {prompt:[
      p("旧制度・午後 問7。収益の検討に関する次の記述を読んで、設問1〜3に答えよ。"),
      p("小規模な部品メーカであるR社は、部品Tだけを生産して大手機械メーカに販売している。"),
      p("設問1 次の記述中の［a］〜［e］に入れる適切な答えを、解答群の中から選べ。"),
      p(`利益計画を策定するために、部品Tの販売数について2通りの検討を行った。表1は、部品Tの販売数を${integer(1000*x.scale)}千個見込むケースXと、${integer(1200*x.scale)}千個見込むケースYについての収益検討表である。両ケースの、売上高に対する変動費の比率（以下、変動費率という）は等しく、固定費は同額である。`),
      managed("legacy-2018-profit-table",values.slice(0,3),"表1 収益検討表"),
      p("注記 網掛けの部分は表示していない。"),
      p("表1から、変動費率は［a］%、固定費は［b］千円である。よって、利益が0になる売上高（以下、損益分岐点売上高という）は、［c］千円となる。"),
      p("R社では、販売先から値下げ要求があることを想定して、販売数及び変動費を変えずに販売単価を下げた場合の値下げ率（値下げ額÷値下げ前の販売単価）と利益の計算を行った。利益がマイナスにならない最大の値下げ率は、ケースXでは［d］%であり、ケースYではケースX［e］。"),
      p("設問2 R社は、変動費と固定費の合計（以下、費用という）と売上高の関係を他の3社と比較して、分析した。その結果、変動費率はR社が他社と比べて最も高いことが分かった。売上高と費用の関係を示したグラフを、図1に示す。図1のグラフ①〜④のうち、R社に該当するものを、解答群の中から選べ。"),
      managed("legacy-2018-cost-curves",[x.highest],"図1 4社の売上高と費用の関係を示したグラフ"),
      p("設問3 R社は、変動費率を下げる取組みを開始した。次の記述中の［f］、［g］に入れる適切な答えを、解答群の中から選べ。"),
      p("R社は、固定費を変えずに変動費率だけを下げることによって、損益分岐点売上高を［f］こととした。そのために、［g］取組みを開始した。"),
    ],choices,
      answerParts:counts.map((count,i)=>({id:`part-${partIds[i]}`,label:["設問1 a","設問1 b","設問1 c","設問1 d","設問1 e","設問2","設問3 f","設問3 g"][i],choiceIds:Array.from({length:count},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),
      partAnswers:correct.map((answer,i)=>({kind:"choice" as const,partId:`part-${partIds[i]}`,choiceId:`choice-value-${offsets[i]+answer+1}`})),
      explanation:`a：売上高の増分${integer(x.salesY-x.salesX)}千円に対して利益の増分は${integer(x.profitY-x.profitX)}千円なので、限界利益率は${100-x.ratio}%、変動費率は${x.ratio}%。b：ケースXで売上高${integer(x.salesX)}×${100-x.ratio}%−利益${integer(x.profitX)}=${integer(x.fixed)}千円が固定費。c：損益分岐点売上高は固定費÷限界利益率=${integer(x.fixed)}÷${margin}=${integer(x.fixed/margin)}千円。d：販売数・変動費総額を固定した値下げでは、売上高の減少分だけ利益が減る。ケースXの最大値下げ率は利益÷値下げ前の売上高=${integer(x.profitX)}÷${integer(x.salesX)}=${x.discount}%。e：ケースYの売上高当たりの固定費はXより小さく、利益率はYの方が高い。従って最大の値下げ率もXより大きい。設問2：費用＝変動費率×売上高＋固定費なので、傾きが変動費率を表す。図中で最も傾きが大きい${"①②③④"[x.highest]}を選ぶ。切片が最も高い線とは限らない。f：固定費一定で変動費率を下げると、限界利益率が大きくなるため損益分岐点売上高は下がる。g：原材料の単価を下げる取組みは、同じ販売単価なら変動費率を下げる。給与を上げること、販売数だけを増やすこと、販売単価を下げることは、この固定費一定で変動費率だけを下げる目的の施策ではない。`,
    };
  },
}];
