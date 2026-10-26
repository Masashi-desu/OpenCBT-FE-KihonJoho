import {field,figure,p,strings,table,variableNotes,type GenerationDefinition} from "./definition";
export type Legacy2018Gate="AND"|"OR"|"NAND"|"NOR"|"XOR";
const gate=(name:Legacy2018Gate,x:number,y:number)=>name==="AND"?x&y:name==="OR"?x|y:name==="NAND"?1-(x&y):name==="NOR"?1-(x|y):x^y;
const pairs=[[0,0],[0,1],[1,0],[1,1]];
const gateNames:Legacy2018Gate[]=["AND","NAND","NOR","OR"];
const configurations:{target:"XOR"|"XNOR";known:Legacy2018Gate;final:Legacy2018Gate}[]=[{target:"XOR",known:"NAND",final:"AND"},{target:"XOR",known:"OR",final:"AND"},{target:"XNOR",known:"NOR",final:"OR"},{target:"XNOR",known:"AND",final:"OR"}];
/** Integers are tenths. Displayed one-decimal arithmetic never gains a hidden
 * rounding convention, including an exact equality at the threshold. */
const parameters=[
  {wx:5,wy:5,example:3,nand:-8,nor:-2,always:-5,or:2,and:8,never:15},
  {wx:4,wy:6,example:3,nand:-8,nor:-2,always:-4,or:3,and:9,never:15},
  {wx:6,wy:3,example:2,nand:-8,nor:-2,always:-5,or:2,and:8,never:12},
  {wx:3,wy:7,example:2,nand:-9,nor:-2,always:-3,or:2,and:9,never:15},
  {wx:4,wy:6,example:4,nand:-6,nor:-3,always:-4,or:4,and:10,never:15},
  {wx:5,wy:5,example:5,nand:-5,nor:-4,always:-5,or:5,and:10,never:15},
];
const decimal=(n:number)=>(n<0?"−":"")+(Math.abs(n)/10).toFixed(1);
export function legacy2018LogicConfiguration(index:number){if(!Number.isInteger(index)||index<0||index>3)throw Error("PARAMETER_CONSTRAINT");return {...configurations[index]};}
export function legacy2018LogicFigureAlt(profile:string,values:number[]):string{
  if(profile==="legacy-2018-gate-composition"){
    if(values.length!==1)throw Error("PARAMETER_CONSTRAINT");const c=legacy2018LogicConfiguration(values[0]);
    return `図1 ${c.target}の論理回路。二つの入力はそれぞれ上段の${c.known}と下段の空欄aの両方へ接続する。上段と下段の出力を${c.final}へ入力し、その出力が回路全体の出力となる。黒丸は分岐の接続点、丸く迂回した交差は接続しない。`;
  }
  if(profile==="legacy-2018-half-adder"&&values.length===1&&values[0]===0)return "図2 半加算器の論理回路。1桁の二進数入力XとYはそれぞれ上段の空欄bと下段の空欄cの両方へ接続する。上段の出力は和の下位桁Z、下段の出力は桁上がりC。黒丸は分岐の接続点、丸く迂回した交差は接続しない。";
  throw Error("UNKNOWN_LEGACY_2018_LOGIC_FIGURE");
}
const diagram=(profile:string,values:number[],caption:string)=>figure(profile,values,caption,legacy2018LogicFigureAlt(profile,values));
const ids=["a","b","c","d","e"],counts=[4,5,5,6,6],offsets=[0,4,9,14,20];
export const legacy2018LogicAfternoonDefinitions:GenerationDefinition[]=[{
  source:"2018h30h-fe-pm-2",title:"旧制度・午後：論理回路としきい値演算",sourceAnswer:"設問1 a=エ／設問2 b=オ、c=ア／設問3 d=オ、e=ア",fields:[field("目標演算と既知ゲートの組",0,3),field("重みとしきい値の組",0,5)],reference:[0,0],
  notes:variableNotes+" 2018春午後問2の全3頁・5欄26択を維持。主要4演算の真理値表、目標XOR/XNORの表と二段回路、半加算器のX/Y入力・Z/C出力、しきい値の≧/＜、Wx/Wy/Tの定義と4行の計算例を保持する。4つの目標/既知ゲート構成と6つの重み/しきい値を同じ位置へバインドした24入力を全列挙する。名称差替え・シャッフルだけではなく、目標真理値と組合せ、重みの非対称性、等号成立条件を変える。表3と26択は同じ入力から生成する。小数は十分の一の整数で検算し小数1桁だけ表示、元にない丸めや精度を加えない。半加算器の和/桁上がりは固定し、正答を変えるために減算器へ置き換えない。配線は二入力を両ゲートへ分岐し、交点の黒丸と非接続の橋形を区別する。XOR/XNORの図題・表題・本文・解説を同一入力から更新する。共有profile/年度セットは未登録。",
  build:values=>{
    if(values.length!==2||values.some((n,i)=>!Number.isInteger(n)||n<0||n>[3,5][i]))throw Error("PARAMETER_CONSTRAINT");
    const [circuitIndex,parameterIndex]=values,c=legacy2018LogicConfiguration(circuitIndex),w=parameters[parameterIndex];
    const target=pairs.map(([x,y])=>c.target==="XOR"?x^y:1-(x^y));
    const a=gateNames.findIndex(candidate=>pairs.every(([x,y],i)=>gate(c.final,gate(c.known,x,y),gate(candidate,x,y))===target[i]));
    if(a<0)throw Error("PARAMETER_CONSTRAINT");
    const vectors=[[-w.wx,-w.wy,w.nand],[-w.wx,-w.wy,w.nor],[w.wx,w.wy,w.always],[w.wx,w.wy,w.or],[w.wx,w.wy,w.and],[w.wx,w.wy,w.never]];
    const vector=(v:number[])=>`［${v.map(decimal).join(", ")}］`,fullTarget=c.target==="XOR"?"XOR（排他的論理和）":"XNOR（否定排他的論理和）";
    return {prompt:[
      p("旧制度・午後 問2。論理回路に関する次の記述を読んで、設問1〜3に答えよ。"),p("主要な論理演算の真理値表を表1に示す。"),
      table("表1 主要な論理演算の真理値表",["入力","入力","AND（論理積）の出力","OR（論理和）の出力","NAND（否定論理積）の出力","NOR（否定論理和）の出力"],pairs.map(([x,y])=>[x,y,gate("AND",x,y),gate("OR",x,y),gate("NAND",x,y),gate("NOR",x,y)].map(String))),
      p(`設問1 表1に示した論理演算を行う論理回路を用いて、表2に示す${fullTarget}の論理演算を行う論理回路を図1のとおり作成した。図1中の［a］に入れる正しい答えを、解答群の中から選べ。`),
      table(`表2 ${fullTarget}の真理値表`,["入力","入力","出力"],pairs.map(([x,y],i)=>[String(x),String(y),String(target[i])])),diagram("legacy-2018-gate-composition",[circuitIndex],`図1 ${fullTarget}の論理回路`),
      p("設問2 1桁の2進数X、Yを入力して、その和の下位桁をZ、桁上がりをCに出力する半加算器の論理回路を図2に示す。図2中の［b］、［c］に入れる正しい答えを、解答群の中から選べ。"),diagram("legacy-2018-half-adder",[0],"図2 半加算器の論理回路"),
      p("設問3 論理回路に関する次の記述中の［d］、［e］に入れる正しい答えを、解答群の中から選べ。"),
      p("この論理回路は、1ビットの入力X、YをそれぞれパラメタWx、Wyで重み付けして加算した結果を求め、パラメタTをしきい値として、次のとおりに動作する。"),
      p("Wx×X＋Wy×Y ≧ T のとき、1をZに出力する。"),p("Wx×X＋Wy×Y ＜ T のとき、0をZに出力する。"),
      p(`例えば、パラメタWxが${decimal(w.wx)}、Wyが${decimal(w.wy)}、Tが${decimal(w.example)}（以下、パラメタ${vector([w.wx,w.wy,w.example])}のように表記する）の場合、表3に示すとおり、この論理回路における入力と出力の関係（以下、入出力関係という）はOR（論理和）になる。`),
      table(`表3 パラメタ${vector([w.wx,w.wy,w.example])}の場合の入出力関係`,["入力X","入力Y","Wx×X＋Wy×Y","T","出力Z"],pairs.map(([x,y])=>[String(x),String(y),`${decimal(w.wx)}×${x}＋${decimal(w.wy)}×${y}`,decimal(w.example),w.wx*x+w.wy*y>=w.example?"1":"0"])),
      p("同様に、(1) AND（論理積）になる入出力関係は、パラメタ［d］で実現できる。(2) NAND（否定論理積）になる入出力関係は、パラメタ［e］で実現できる。"),
    ],choices:[...strings(gateNames),...strings([...gateNames,"XOR"]),...strings([...gateNames,"XOR"]),...strings(vectors.map(vector)),...strings(vectors.map(vector))],
      answerParts:counts.map((count,i)=>({id:`part-${ids[i]}`,label:["設問1 a","設問2 b","設問2 c","設問3 d","設問3 e"][i],choiceIds:Array.from({length:count},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),partAnswers:[a,4,0,4,0].map((answer,i)=>({kind:"choice" as const,partId:`part-${ids[i]}`,choiceId:`choice-value-${offsets[i]+answer+1}`})),
      explanation:`a：表2の4入力の出力を、候補の各演算で作った回路と比較する。上段の${c.known}と下段の${gateNames[a]}の出力を${c.final}へ入力すると、順に${target.join("、")}となり${c.target}と一致する。各入力は両方のゲートへ分岐し、橋形の交差では別の線と接続しない。b/c：XとYの和を2進数で表すと、00→00、01→01、10→01、11→10。下位桁ZはXOR、桁上がりCはANDである。d：${vector(vectors[4])}では、片方の入力が1の場合の加重和よりしきい値が大きく、両方が1の加重和はしきい値以上となるのでANDを表す。e：${vector(vectors[0])}では、00・01・10の加重和がしきい値以上、11だけがしきい値未満となりNANDを表す。加重和がTと等しい場合は本文の≧により出力1となる。XORはExclusive ORで入力が異なるとき1、XNORはExclusive NORで入力が等しいとき1。NANDはANDの否定、NORはORの否定であり、入力が1個でも1のORと区別する。`,
    };
  },
}];
