import {field,p,list,strings,figure,variableNotes,type GenerationDefinition} from "./definition";
import domains from "./legacy-2018-development-figure-domains.json";
const checked=(values:number[],bounds:number[][])=>{if(values.length!==bounds.length||values.some((n,i)=>!Number.isInteger(n)||n<bounds[i][0]||n>bounds[i][1]))throw Error("PARAMETER_CONSTRAINT");};
export const legacy2018ShorteningCases=[
  [6,3,4,2,4,1],
  [7,2,3,2,3,1],
  [4,3,3,2,5,2],
  [5,2,4,2,4,1],
  [8,3,3,2,3,1],
  [5,3,3,2,6,2],
  [7,4,4,2,4,1],
  [6,2,2,2,2,1],
  [6,3,3,2,6,2],
] as const;
export function legacy2018DevelopmentFigureAllowed(profile:string,values:number[]){
  const bounds=domains[profile as keyof typeof domains];if(!bounds)return false;
  if(values.length!==bounds.length||values.some((n,i)=>!Number.isInteger(n)||n<bounds[i][0]||n>bounds[i][1]))return false;
  return profile!=="legacy-2018-shorten-network"||legacy2018ShorteningCases.some(days=>days.every((n,i)=>n===values[i]));
}
export function legacy2018DevelopmentFigureAlt(profile:string,values:number[]){
  if(!legacy2018DevelopmentFigureAllowed(profile,values))throw Error("PARAMETER_CONSTRAINT");
  if(profile==="legacy-2018-coverage-flow")return`上から処理1、判定A>${values[0]} ${values[2]?"and":"or"} B=${values[1]}。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。`;
  return`作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。${values.map((n,i)=>`${"ABCDEF"[i]}=${n}日`).join("、")}。同じ表記の凡例を付ける。`;
}
const pair=([a,b]:number[])=>`(A=${a}、B=${b})`,two=(rows:number[][])=>rows.map(pair).join("、");
function coveragePairs(threshold:number,other:number,and:boolean){
  const a=(delta:number)=>threshold+(and?-delta:delta),b=(delta:number)=>other+delta;
  return{initial:[[a(-2),b(1)],[a(-1),b(0)]],choices:[[[a(-3),b(0)],[a(1),b(2)]],[[a(-3),b(2)],[a(2),b(0)]],[[a(-2),b(0)],[a(2),b(0)]],[[a(1),b(0)],[a(2),b(2)]]]};
}
const edges=[[0,1],[0,2],[2,1],[1,4],[2,3],[3,4]] as const;
const projectDuration=(days:readonly number[])=>{const earliest=Array(5).fill(0);for(const node of [0,2,1,3,4])for(let e=0;e<edges.length;e++)if(edges[e][0]===node)earliest[edges[e][1]]=Math.max(earliest[edges[e][1]],earliest[node]+days[e]);return earliest[4];};
const subsets=[["A","C","E"],["A","D"],["B","C","E"],["B","D"]];
export const legacy2018DevelopmentMathDefinitions:GenerationDefinition[]=[
  {source:"2018h30h-fe-am-49",title:"判定条件網羅から複数条件網羅への追加",sourceAnswer:"エ",reference:[2,0,0],fields:[field("比較しきい値から4を引いた値",0,2),field("Bの比較値",0,2),field("論理演算",0,1)],notes:variableNotes+" 原の流れ図・処理1/2・Yes/No分岐、判定条件網羅の既存2組、追加する2組を一つとして選ぶ4択を保持。しきい値4/5/6、Bの値0/1/2、or/andの18条件。andでは既存2組のA条件の真偽を反転し、既存2組で判定全体の真/偽を満たす前提を一緒に更新。正答だけでなく誤答が既存の条件を重複し未網羅の組合せを残す役割を検査する。全数値は1桁整数、二つの比較と論理判定で追加2組を選び、元にない丸めや補助真理値表を出題前へ追加しない。",build:values=>{checked(values,[[0,2],[0,2],[0,1]]);const threshold=values[0]+4,other=values[1],and=Boolean(values[2]),data=coveragePairs(threshold,other,and),condition=([a,b]:number[])=>`${Number(a>threshold)}${Number(b===other)}`,existing=new Set(data.initial.map(condition)),all=["00","01","10","11"],truth=data.choices.map(rows=>all.every(key=>new Set([...existing,...rows.map(condition)]).has(key)));if(truth.filter(Boolean).length!==1)throw Error("PARAMETER_CONSTRAINT");return{prompt:[p("プログラムの流れ図で示される部分に関するテストデータを、判定条件網羅（decision coverage）によって設定した。このテストデータを複数条件網羅（multiple condition coverage）による設定に変更するとき、加えるべきテストデータのうち、適切なものはどれか。ここで、( )で囲んだ部分は、一組みのテストデータを表すものとする。"),figure("legacy-2018-coverage-flow",[threshold,other,values[2]],"プログラムの流れ図",legacy2018DevelopmentFigureAlt("legacy-2018-coverage-flow",[threshold,other,values[2]])),list(["判定条件網羅によるテストデータ"]),p(two(data.initial))],choices:strings(data.choices.map(two)),correctIndex:truth.indexOf(true),explanation:`判定全体が真と偽になることと、個々の条件の真偽の全組合せを通すことは別である。A>${threshold}とB=${other}の真偽には、偽/偽、偽/真、真/偽、真/真の4組がある。既存の${two(data.initial)}は${and?"真/偽と真/真":"偽/偽と偽/真"}なので、残る${and?"偽/偽と偽/真":"真/偽と真/真"}を両方満たす2組を追加する。${two(data.choices[truth.indexOf(true)])}で4組が全てそろう。他の選択肢は既存と同じ真偽の組を含み、未網羅の組を残す。${and?"and":"or"}の短絡評価で右条件を実際に評価しない実装があっても、入力条件の論理的な全組合せと、プログラムが採る分岐結果を区別して考える。`};}},
  {source:"2018h30h-fe-am-51",title:"複数経路を持つ日程の2日短縮",sourceAnswer:"エ",reference:[0],fields:[field("6作業の日程条件",0,8)],notes:variableNotes+" 原の5結合点・6作業A〜F・有向接続・作業名/所要日数の上下と凡例、選択対象A〜Eを各1日/全体2日の短縮、作業集合の4択を保持。所要日数の異なる9条件で、A-D/B-C-D/B-E-Fの競合する経路の最大を計算する。各択の作業は同時に1日ずつ短縮し、一つの初期クリティカルパスだけを計算して正答を作らない。各作業は1桁整数、最少日数は5〜11日の簡単な加算で、精度/丸めを増やさない。固定4択のA,C,Eは全経路を各1日短縮する役割なので2日短縮の正答にはならない。残る3択が正答となる実条件を用意。",build:values=>{checked(values,[[0,8]]);const days=[...legacy2018ShorteningCases[values[0]]],before=projectDuration(days),after=subsets.map(tasks=>projectDuration(days.map((n,i)=>n-Number(tasks.includes("ABCDEF"[i]))))),truth=after.map(n=>before-n===2);if(truth.filter(Boolean).length!==1)throw Error("PARAMETER_CONSTRAINT");const best=truth.indexOf(true),paths=[days[0]+days[3],days[1]+days[2]+days[3],days[1]+days[4]+days[5]];return{prompt:[p("図のアローダイアグラムにおいて、プロジェクト全体の期間を短縮するために、作業A〜Eの幾つかを1日ずつ短縮する。プロジェクト全体の期間を2日短縮できる作業の組合せはどれか。"),figure("legacy-2018-shorten-network",days,"作業のアローダイアグラム",legacy2018DevelopmentFigureAlt("legacy-2018-shorten-network",days))],choices:strings(subsets.map(tasks=>tasks.join("、"))),correctIndex:best,explanation:`開始から終了までの経路はA-D=${paths[0]}日、B-C-D=${paths[1]}日、B-E-F=${paths[2]}日で、初期の全体期間は最大の${before}日。各択の作業をそれぞれ1日短縮して全経路を再計算すると、短縮する作業ごとの全体期間は${subsets.map((tasks,i)=>`${tasks.join("・")}で${after[i]}日`).join("、")}となる。${subsets[best].join("、")}を短縮したときの${after[best]}日だけが2日短縮に当たる。短縮前の最長経路だけを見ず、短縮後に別の経路が最長になる場合も含めて、全ての作業の終了を確認する。`};}},
];
