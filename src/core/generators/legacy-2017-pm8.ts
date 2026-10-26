import {field,figure,p,programs,strings,table,variableNotes,type GenerationDefinition} from "./definition";
import {legacy2017Pm8Model,legacy2017Pm8ArrayText as arrayText} from "./legacy-2017-pm8-model";
import {legacy2017Pm8ProgramDescription} from "./legacy-2017-pm8-program";
import {legacy2017Pm8CommonIntroduction,legacy2017Pm8DivisionNote,legacy2017Pm8NotationDescription,legacy2017Pm8OperatorDescription} from "./legacy-2017-pm8-common";

const a=["not(pFixed[i])","not(pFixed[j])","pFixed[i]","pFixed[j]"],b=["dp","nPoint","nPoint − 1","sp","sPoint"],cd=["pRoute[dp]","pRoute[i]","pRoute[j]","pRoute[sp]","sRoute[dp]","sRoute[i]","sRoute[j]","sRoute[sp]"];
export const legacy2017Pm8Definition:GenerationDefinition={
 source:"2017h29h-fe-pm-8",title:"旧制度・午後：最短経路の探索",version:"3.2.0",sourceAnswer:"設問1 a=イ、b=オ、c=キ、d=イ／設問2 e=イ、f=カ、g=ア",
 fields:[field("辺の距離の条件",0,7)],reference:[0],
 notes:variableNotes+" 2017春午後の必須問8全6頁を、一つの大問・7独立解答欄として保持する。共通記法p3〜4、7地点9双方向辺、引数表6行、距離行列49セル、手続説明(1)〜(6)、48行の制御枠付き疑似言語、α/β、同じcの2箇所、追跡表、全34固有選択肢を保持。c/dは同じ8択IDを参照し、重複選択を禁じない。8条件は単純な一様倍ではない実距離の変更。各図/行列/追跡値/配列択/解説を同期する。pRouteの全要素0は設問2だけの前提で、設問1の初期化へ追加しない。正コード穴は8条件×49出発/目的地の別解・有界interpreterで確認し、偶然一致を一般正当性としない。strictな小なりと地点番号の昇順走査を保持。全7欄の正答IDは固定だが、fの正しい数列が実際に変わるのでcompoundの実正答内容は可変である。距離条件と追跡する配列値・最短路を一緒に変更する。原資料にない丸めを追加しない。共通記法p3〜4の個別素材査読とIPA条件判断は年別stagerへ記録し、共有profile/大問選択方式は統合待ちとして区別する。",
 build:values=>{
  if(values.length!==1)throw Error("PARAMETER_CONSTRAINT");const m=legacy2017Pm8Model(values[0]);
  const graphAlt="丸は地点番号0〜6、線分は双方向に移動できる直接経路。"+m.edges.map(e=>`地点${e.from}と${e.to}の距離${e.distance}`).join("、")+"。";
  const offsets=[0,4,9,9,17,22,28],counts=[4,5,8,8,5,6,6],labels=["設問1 a","設問1 b","設問1 c","設問1 d","設問2 e","設問2 f","設問2 g"];
  return {
   contexts:[{title:"共通に使用される擬似言語の記述形式（原p3〜4）",presentation:"text_figure",blocks:[
    p(legacy2017Pm8CommonIntroduction),
    figure("legacy-2017-pm8-common-notation",[0],"宣言、注釈及び処理", legacy2017Pm8NotationDescription),
    figure("legacy-2017-pm8-common-operators",[0],"演算子と優先順位",legacy2017Pm8OperatorDescription),p(legacy2017Pm8DivisionNote),p("論理型の定数：true、false。"),
   ]}],
   prompt:[
    p("次の問8は必須問題です。必ず解答してください。"),p("問8 次のプログラムの説明及びプログラムを読んで、設問1、2に答えよ。"),
    p("副プログラムShortestPathは、N個（N＞1）の地点と、地点間を直接結ぶ経路及び距離が与えられたとき、出発地から目的地に至る最短経路とその距離を求めるプログラムである。最短経路とは、ある地点から別の地点へ最短距離で移動する際の経由地を結んだ経路である。副プログラムShortestPathでは、出発地の隣接地点から開始して、目的地に向かって最短距離を順次確定する。ある地点の隣接地点とは、その地点から他の地点を経由せずに直接移動できる地点のことである。"),
    p("図1は、地点数Nが7の経路の例で、経路をグラフで表現したものである。図1において、丸は地点を示し、各地点には0から始まる番号（以下、地点番号という）が順番に割り当てられている。線分は地点間を直接結ぶ経路を示し、線分の上に示す数字はその距離を表す。また、経路上は、双方に移動できる。"),
    figure("legacy-2017-pm8-graph",values,"図1 地点数Nが7の経路の例",graphAlt),
    p("プログラムの説明"),p("(1) 副プログラムShortestPathの引数の仕様を、表1に示す。ここで、出発地から目的地までを結ぶ経路は、少なくとも一つ存在するものとする。また、配列の要素番号は、0から始まる。"),
    table("表1 副プログラムShortestPathの引数の仕様",["引数","データ型","入出力","説明"],[
     ["Distance[][]","整数型","入力","地点間の距離が格納されている2次元配列"],["nPoint","整数型","入力","地点数"],["sp","整数型","入力","出発地の地点番号"],["dp","整数型","入力","目的地の地点番号"],["sRoute[]","整数型","出力","出発地から目的地までの最短経路上の地点の地点番号を目的地から出発地までの順に設定する1次元配列"],["sDist","整数型","出力","出発地から目的地までの最短距離"],
    ]),
    p("(2) Distance[i][j]（i＝0、…、nPoint−1：j＝0、…、nPoint−1）には、地点iから地点jまでの距離が格納されている。ただし、地点iと地点jが同一の地点の場合は0、地点iが地点jの隣接地点ではない場合は−1が格納されている。図1の例における配列Distanceの内容は、表2のとおりである。"),
    table("表2 図1の例における配列Distanceの内容",["i＼j",...Array.from({length:7},(_,i)=>String(i))],m.matrix.map((row,i)=>[String(i),...row.map(n=>n===-1?"−1":String(n))])),
    p("(3) 行番号5〜10では、変数、配列に初期値を格納する。"),
    p("① 最短距離を返却する変数sDistに初期値として∞（最大値を表す定数）を格納し、出発地から目的地までの最短距離が設定されていないことを示す。"),
    p("② 最短経路を返却する要素数がnPointである配列sRouteの全ての要素に初期値として−1を格納し、最短経路上の地点の地点番号が設定されていないことを示す。"),
    p("③ 出発地から各地点までの最短距離を設定する配列をpDistとする。pDistは1次元配列であり、要素数はnPointである。配列pDistの全ての要素に初期値として∞を格納する。"),
    p("④ 出発地から各地点までの最短距離が確定しているかどうかを識別するための配列をpFixedとする。pFixedは1次元配列であり、要素数はnPointである。配列pFixedの全ての要素に初期値としてfalseを格納し、最短距離が未確定であることを示す。最短距離が確定したときにtrueを設定する。例えば、出発地から地点iまでの最短距離が確定したとき、pFixed[i]はtrueとなり、その最短距離はpDist[i]に設定されている。pFixed[i]がfalseの場合は、地点iまでの最短距離は未確定であり、pDist[i]の値は最短距離として確定されていない。"),
    p("(4) 行番号11では、出発地から出発地自体への最短距離pDist[sp]に0を設定する。"),
    p("(5) 行番号12〜39の最短経路探索処理では、出発地から各地点までの最短距離を算出しながら、最短経路を求める。"),
    p("① 行番号13〜22：配列pFixedを調べ、出発地から全ての地点までの最短距離が確定していれば、最短経路探索処理を抜けて(6)に進む。"),
    p("② 行番号23〜29：出発地からの最短距離が未確定の地点の中で、出発地からの距離が最も短い地点を探し、その地点をsPointとし、その地点の最短距離を確定する。"),
    p("③ 行番号30〜38：各地点に対して（ア）、（イ）を実行し、①に戻る。"),
    p("（ア）地点sPointの隣接地点であり、かつ、出発地からの最短距離が未確定であるかどうかを調べる。"),
    p("（イ）（ア）の条件を満たす地点jに関して、出発地から地点sPointを経由して地点jに到達する経路の距離を求め、その距離が既に算出してあるpDist[j]よりも短ければ、pDist[j]及びpRoute[j]を更新する。ここで、pDist[j]は、出発地から地点jまでの仮の最短距離となる。pRoute[j]には、そのときの、地点jの直前の経由地の地点番号を設定する。"),
    p("(6) 行番号40〜48では、出発地から目的地までの最短距離をsDistに、最短経路上の地点の地点番号を目的地から出発地までの順に配列sRouteに設定する。"),
    figure("legacy-2017-pm8-program",[0],"プログラム ShortestPath（行1〜48）",legacy2017Pm8ProgramDescription),
    p("設問1 プログラム中の［a］〜［d］に入れる正しい答えを、解答群の中から選べ。"),
    p("設問2 次の記述中の［e］〜［g］に入れる正しい答えを、解答群の中から選べ。"),
    p("図1において、出発地の地点番号spの値が0、目的地の地点番号dpの値が6の場合について、プログラムの動きを追跡する。行番号12〜39の最短経路探索処理の繰返しで、行番号28のαにおいてsPointに代入された値は、繰返しの1回目は0、2回目は1、3回目は［e］となる。また、行番号30〜38の処理が終了した直後のβにおける配列pDistと配列pRouteの値を、表3に示す。最短経路探索処理の繰返しが3回目のときのβにおける配列pDistの値は［f］となり、配列pRouteの値は［g］となる。ここで、配列pRouteの全ての要素には初期値として0が格納されているものとする。"),
    table("表3 βにおける配列pDistと配列pRouteの値",["最短経路探索処理の繰返し","配列pDist","配列pRoute"],[...m.trace.slice(0,2).map((t,i)=>[`${i+1}回目`,arrayText(t.distances),arrayText(t.previous)]),["3回目","［f］","［g］"],["⋮","⋮","⋮"]]),
   ],
   choices:[...programs(a),...programs(b),...programs(cd),...strings([2,3,4,5,6].map(String)),...strings(m.fChoices.map(arrayText)),...strings(m.gChoices.map(arrayText))],
   answerParts:counts.map((count,i)=>({id:`part-${"abcdefg"[i]}`,label:labels[i],choiceIds:Array.from({length:count},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),
   partAnswers:[1,4,6,1,1,5,0].map((index,i)=>({kind:"choice" as const,partId:`part-${"abcdefg"[i]}`,choiceId:`choice-value-${offsets[i]+index+1}`})),
   explanation:`a：候補jが未確定であるnot(pFixed[j])を条件にして、pDist[j]が現在の候補iより小さい場合だけiを更新する。pFixed[i]は候補jの状態を調べず、pFixed[j]は確定済み地点を選ぶため不適切。b：選んだ地点番号sPointのpFixed要素をtrueにする。dpは目的地、spは出発地、nPoint−1は末尾地点、nPointは配列の範囲外であり、選んだ地点を一般に表さない。c：逆順の結果の書込先はsRoute[j]。pRouteは各地点の直前の経由地を保持する配列であり、sRouteの添字i、dp、spは結果の連続格納位置jを一般に表さない。同じcを行44と48の両方へ入れる。d：現在の地点iの直前の経由地pRoute[i]をたどる。dp、j、spを添字に固定した参照やsRouteの参照は、その地点iの直前の経由地を一般に返さない。e：確定する地点は0、1、3の順なので3。f：3回目のβではpDistは${arrayText(m.trace[2].distances)}。地点3から地点5へ進む候補は${m.matrix[0][3]}＋${m.matrix[3][5]}＝${m.trace[2].distances[5]}であり、まだ地点2を経由する処理も地点5から地点6への処理も実行していない。地点6は未更新の∞のまま。g：この時点のpRouteは${arrayText(m.trace[2].previous)}。地点4の直前は1、地点5の直前は3、未更新の地点6は設問2の初期値0である。同距離ではstrictな小なり比較なので、先に昇順で選んだ候補を置き換えない。最後まで実行した最短距離は${m.distance}、sRouteの有効部分は目的地から${m.reverse.join("、")}の順となる。`,
  };
 },
};
