import type {Legacy2018NumericReview} from "./legacy-2018-review";
/** Independently transcribed after reading physical p24/25 and answer p1.
 * The source figures, not OCR or an existing modern diagram, are authoritative. */
export const legacy2018DevelopmentMathReview:Legacy2018NumericReview[]=[
  {collection:"2018h30h-fe-am",number:49,page:24,title:"判定条件網羅から複数条件網羅への追加",answer:"エ",reference:[2,0,0],choices:["(A=3、B=0)、(A=7、B=2)","(A=3、B=2)、(A=8、B=0)","(A=4、B=0)、(A=8、B=0)","(A=7、B=0)、(A=8、B=2)"],premises:["プログラムの流れ図","判定条件網羅（decision coverage）によって既存テストを設定","複数条件網羅（multiple condition coverage）へ変更","( )内は一組みのテストデータ","既存は(A=4、B=1)、(A=5、B=0)","図はA>6 or B=0、Yesで処理2、Noで処理2を迂回"],precision:"A/Bは1桁整数。既存2組はFF/FTで判定全体の偽/真を満たし、追加するTF/TTが必要。18入力でしきい値4〜6・B比較値0〜2・or/andを変え、andではA条件の真偽を反転して既存の判定網羅も更新する。全4追加候補の各2組を固定した数値offset/役割へ照合し、実SVGの判定から真理値を独立評価。元にない真理値表を解答前へ足さない。",materialReview:"IPAの原問本文・4択・流れ図と公式正答を画像照合。第三者の規格本文/引用図表の表示を特定しなかった。管理SVGは原の処理1/判定/処理2/迂回/合流とYes/Noを再構成した改変として出典を表示する。外部仕様本文・図表を転載せず、隣接問50を切出しに含めない。"},
  {collection:"2018h30h-fe-am",number:51,page:25,title:"複数経路を持つ日程の2日短縮",answer:"エ",reference:[0],choices:["A、C、E","A、D","B、C、E","B、D"],premises:["5結合点のアローダイアグラム","全6作業A〜F","選択対象のA〜Eの幾つかをそれぞれ1日ずつ短縮（図のFは短縮対象外）","プロジェクト全体を2日短縮する組","矢印上が作業名/下が所要日数という凡例","A6/B3/C4/D2/E4/F1"],precision:"各作業は1桁整数で、3経路の単純加算と4集合の全経路再計算を行う。原経路はA-D=8、B-C-D=9、B-E-F=8で、B/Dを縮めると全経路7日。9条件は各3条件ずつイ/ウ/エが正答となる。A/C/Eは全経路を各1日縮めるのでアを正答に変えるための別構成へ差し替えない。元にない費用最小化や作業選択の単一名へ変換しない。",materialReview:"IPAの原問本文・全4作業集合・5結合点/6矢印/全所要日数/凡例と公式正答を画像照合。第三者の規格本文/引用図表を特定しなかった。管理SVGは原の全有向接続と上下ラベル/凡例を再構成した改変として表示し、隣接問52以降を切出しに含めない。"},
];
export const legacy2018DevelopmentMathCrops:Record<string,[number,number]>={"2018h30h-fe-am-49":[.080,.680],"2018h30h-fe-am-51":[.080,.370]};
export const legacy2018DevelopmentMathBounds:Record<string,{content:[number,number];previousEnd:number;nextStart:number}>={"2018h30h-fe-am-49":{content:[.095,.667],previousEnd:0,nextStart:.733},"2018h30h-fe-am-51":{content:[.095,.357],previousEnd:0,nextStart:.409}};
export const legacy2018CoverageFacts={
  stem:"プログラムの流れ図で示される部分に関するテストデータを、判定条件網羅（decision coverage）によって設定した。このテストデータを複数条件網羅（multiple condition coverage）による設定に変更するとき、加えるべきテストデータのうち、適切なものはどれか。ここで、( )で囲んだ部分は、一組みのテストデータを表すものとする。",
  originalInitial:[[4,1],[5,0]],originalCondition:{threshold:6,equal:0,operator:"or"},
  initialOffsets:[[-2,1],[-1,0]],
  choiceOffsets:[[[-3,0],[1,2]],[[-3,2],[2,0]],[[-2,0],[2,0]],[[1,0],[2,2]]],
  sourceChoiceConditions:[["01","10"],["00","11"],["01","11"],["11","10"]],
  figure:{process1:{x:220,y:40,width:220,height:60},decision:"330,160 510,220 330,280 150,220",process2:{x:220,y:340,width:220,height:60},yes:[330,280,330,340],no:"510,220 650,220 650,440 330,440",exit:[330,400,330,485]},
  conditions:"複数条件網羅は2条件の論理的な全4組合せ。判定条件網羅は判定全体の真/偽。短絡評価によりBを実際に評価しない場合と入力条件の論理値を混同しない。",
};
export const legacy2018ShorteningFacts={
  stem:"図のアローダイアグラムにおいて、プロジェクト全体の期間を短縮するために、作業A〜Eの幾つかを1日ずつ短縮する。プロジェクト全体の期間を2日短縮できる作業の組合せはどれか。",
  nodes:[[80,95],[335,95],[190,270],[470,270],[630,95]],
  edgeByTask:{A:[0,1],B:[0,2],C:[2,1],D:[1,4],E:[2,3],F:[3,4]},
  days:[[6,3,4,2,4,1],[7,2,3,2,3,1],[4,3,3,2,5,2],[5,2,4,2,4,1],[8,3,3,2,3,1],[5,3,3,2,6,2],[7,4,4,2,4,1],[6,2,2,2,2,1],[6,3,3,2,6,2]],
  alternatives:[["A","C","E"],["A","D"],["B","C","E"],["B","D"]],
  sourcePaths:[{tasks:["A","D"],days:8},{tasks:["B","C","D"],days:9},{tasks:["B","E","F"],days:8}],
  sourceAfterChoices:[8,8,8,7],
  manualCorrectIndices:[3,1,2,3,1,2,3,1,2],
  legend:{from:[715,270],to:[855,270],name:"作業名",unit:"所要日数"},
};
