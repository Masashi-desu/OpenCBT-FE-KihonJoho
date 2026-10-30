/** Prepared whole spring PM8 annual candidate. Source/media/independent content
 * and real candidate records are reviewed; shared registry/Run/mix remain pending. */
import {field,p,table,figure,variableNotes,type GenerationDefinition} from "./definition";
import type {Block} from "../types";
import {legacy2019Pm8AlphaText,legacy2019Pm8AlphaFrequency,legacy2019Pm8Tree,legacy2019Pm8Beta} from "./legacy-2019-pm8-model";
export const legacy2019Pm8Program1=[
 "○副プログラム: Huffman(整数型: size, 整数型: parent[], 整数型: left[], 整数型: right[], 整数型: freq[])",
 "○整数型: i, j, nsize","○整数型: node[]","SortNode(size, parent, freq, nsize, node)","[ c ]","i ← node[0]  /* 最も小さい値をもつ要素組の要素番号 */","j ← node[1]  /* 2番目に小さい値をもつ要素組の要素番号 */","left[size] ← i","right[size] ← j","freq[size] ← freq[i] ＋ freq[j]  /* 子の値の合計 */","parent[i] ← size  /* 子に親の要素番号を格納 */","parent[j] ← size  /* 子に親の要素番号を格納 */","size ← size ＋ 1","SortNode(size, parent, freq, nsize, node)","繰返し終了",
 "○副プログラム: SortNode(整数型: size, 整数型: parent[], 整数型: freq[], 整数型: nsize, 整数型: node[])","○整数型: i","nsize ← 0","i: 0, i < size, 1","[ d ]","node[nsize] ← i","nsize ← nsize ＋ 1","選択終了","繰返し終了","Sort(freq, nsize, node)",
]as const;
export const legacy2019Pm8Program2=[
 "○副プログラム: Encode(整数型: k, 整数型: parent[], 整数型: left[])","[ e ]","Encode(parent[k], parent, left)","[ f ]","print(\"0\")  /* 0を表示する */","print(\"1\")  /* 1を表示する */","双岐選択終了","単岐選択終了",
]as const;
export const legacy2019Pm8CdChoices=["nsize ≧ 0","nsize ≧ 1","nsize ≧ 2","parent[i] < 0","parent[i] > 0","size ≦ nsize","size ≧ nsize"]as const;
export const legacy2019Pm8EChoices=["k ≧ 0","left[k] = −1","left[k] ≧ 0","parent[k] = −1","parent[k] ≧ 0"]as const;
export const legacy2019Pm8FChoices=["left[k] = k","left[parent[k]] = k","parent[k] = k","parent[left[k]] = k"]as const;
export function legacy2019Pm8FigureAlt(profile:string){const alpha=legacy2019Pm8Tree(legacy2019Pm8AlphaFrequency);
 if(profile==="legacy-2019-huffman-ratio")return"圧縮率は、ハフマン符号化によって圧縮したときの総ビット長を、2ビットの固定長で表現したときの総ビット長で割る。分子と分母を横線の上下に配置する。";
 if(profile==="legacy-2019-huffman-alpha-tree")return"図1。根19の左に9、右に葉Aの10。9の左に葉Cの4、右に5。5の左に葉Bの2、右に葉Dの3。丸の中は節の値、A〜Dは対応する文字。";
 if(profile==="legacy-2019-huffman-alpha-path")return"図2。図1と同じ結線の空の丸で節を表す。左枝0、右枝1。根から左0、右1、左0で葉Bへたどる矢印を描くので、説明例のBの符号は010となる。";
 if(profile==="legacy-2019-huffman-alpha-arrays")return`図3。要素番号0〜6。parentは${alpha.parent.join("、")}、leftは${alpha.left.join("、")}、rightは${alpha.right.join("、")}、freqは${alpha.freq.join("、")}。下の矢印は子から親への関係を示す。`;
 if(profile==="legacy-2019-huffman-program1")return"プログラム1、行1〜25。行5〜15は[c]を前判定条件とする繰返し。行19〜24はiを0から開始しi<sizeの間1ずつ増やす繰返し。その中の行20〜23は[d]が真のときだけ行21〜22を実行する単岐選択。行25のSortは繰返しの外。各行の記述："+legacy2019Pm8Program1.map((s,i)=>`${i+1}: ${s}`).join("。 ");
 if(profile==="legacy-2019-huffman-program2")return"プログラム2、行1〜8。行2〜8は[e]が真のときだけ中を実行する単岐選択。先に行3の再帰呼出しを実行する。行4〜7は[f]が真なら行5のprint(0)、偽なら行6のprint(1)を実行する双岐選択。各行の記述："+legacy2019Pm8Program2.map((s,i)=>`${i+1}: ${s}`).join("。 ");
 throw Error("UNKNOWN_LEGACY_2019_PM8_FIGURE");
}
const diagram=(profile:string,caption:string)=>figure(profile,[0],caption,legacy2019Pm8FigureAlt(profile));
const args=(caption:string,rows:string[][])=>table(caption,["引数","データ型","入出力","説明"],rows);
const rows={size:["size","整数型","入力／出力","節の個数"],parent:["parent[]","整数型","入力／出力","節の親を表す要素組の要素番号を格納した配列"],left:["left[]","整数型","入力／出力","節の左側の子を表す要素組の要素番号を格納した配列"],right:["right[]","整数型","入力／出力","節の右側の子を表す要素組の要素番号を格納した配列"],freq:["freq[]","整数型","入力／出力","節の値を格納した配列"]};
const input=(r:string[])=>r.map((s,i)=>i===2?"入力":s);
export const legacy2019AfternoonHuffmanDefinitions:GenerationDefinition[]=[{
 source:"2019h31h-fe-pm-8",title:"旧制度・午後：ハフマン符号による文字列圧縮",sourceAnswer:"設問1 a=ア、b=イ／設問2 c=ウ、d=エ／設問3 e=オ、f=イ",version:"3.2.0",fields:[field("設問1の文字出現回数の組",0,3)],reference:[0],
 notes:variableNotes+" 旧制度春午後問8の原8頁/6欄/24固有択(c,d共通7択)/延べ31参照を保持。説明例αは原19字10/2/4/3、図1〜3と四配列を固定。設問1だけ原と同じ13字の正の頻度4組へ変え、実符号と総bit長/2桁比率を連動させる。小数第3位四捨五入/最小択差0.03以上。aイ/エはprefix不成立、aウは別の有効prefix treeで最適ではないという原の実際の性質を保持する。bア/ウは原aエ/ウのbit長に対応し、bエ0.92の由来は推定せず固定誤答として保持。一般手続を完成するc/d/e/fは固定。配列0開始/初期−1/葉と根の−1、未親最小2個/同値先頭優先/安定Sort/再帰復帰順print、全引数表/コメント/制御構造を解答前に残し、未改変の共通記法p3/4はofficial参照本文として保持する。原の問8は必須で150分は午後全体。共有Run/選択方式/図hook/用語は別統合待ち。",
 build(values){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>3)throw Error("PARAMETER_CONSTRAINT");const b=legacy2019Pm8Beta(values[0]);const prompt:Block[]=[
 p("旧制度・午後 問8。ハフマン符号化を用いた文字列圧縮に関する次の記述を読んで、設問1〜3に答えよ。"),p("原冊子では問8は必須問題である。"),
 p("“A”〜“D”の4種類の文字から成る文字列をハフマン符号化によって圧縮する。ハフマン符号化では、出現回数の多い文字には短いビット列を、出現回数の少ない文字には長いビット列を割り当てる。ハフマン符号化による文字列の圧縮手順は、次の(1)〜(4)のとおりである。"),
 p(`(1) 文字列中の文字の出現回数を求め、出現回数表を作成する。例えば、文字列“${legacy2019Pm8AlphaText}”（以下、文字列αという）中の文字の出現回数表は、表1のようになる。`),
 table("表1 文字列α中の文字の出現回数表",["文字","A","B","C","D"],[["出現回数","10","2","4","3"]]),
 p("(2) 文字の出現回数表に基づいてハフマン木を作成する。ハフマン木の定義は、次のとおりである。節と枝で構成する二分木である。親である節は、子である節を常に二つもち、子の節の値の和を値としてもつ。子をもたない節（以下、葉という）は文字に対応し、出現回数を値としてもつ。親をもたない節（以下、根という）は文字列の文字数を値としてもつ。文字列αに対応するハフマン木の例を、図1に示す。"),
 diagram("legacy-2019-huffman-alpha-tree","図1 文字列αに対応するハフマン木の例"),p("図1注記：丸の中の数値は節がもつ値を表す。“A”〜“D”は葉に対応する文字を表す。"),
 p("ハフマン木は、次の手順で配列によって実現する。①節の値を格納する1次元配列を用意する。②文字の出現回数表に基づいて、各文字に対応する葉の値を、配列の先頭の要素から順に格納する。③親が作成されていない節を二つ選択し、選択した順に左側の子、右側の子とする親の節を一つ作成する。この節の値を、配列中で値が格納されている最後の要素の次の要素に格納する。節の選択は節の値の小さい順に行い、同じ値をもつ節が二つ以上ある場合は、配列の先頭に近い要素に値が格納されている節を選択する。④親が作成されていない節が一つになるまで③を繰り返す。"),
 p("(3) ハフマン木から文字のビット列（以下、ビット表現という）を次の手順で作成する。①親と左側の子をつなぐ枝に0、右側の子をつなぐ枝に1の値をもつビットを割り当てる。②文字ごとに根から対応する葉までたどったとき、枝のビット値を順に左から並べたものを各文字のビット表現とする。図2に示すとおり、根から矢印のようにたどると、文字列αの文字“B”のビット表現は“010”になる。"),
 diagram("legacy-2019-huffman-alpha-path","図2 文字列αにおける文字Bのビット表現の作成例"),p("図2注記：線分は枝を表し、枝の上の数値は各枝のビット値を表す。"),p("(4) 文字列の全ての文字を(3)で得られたビット表現に置き換えて、ビット列を作成する。"),
 p("設問1 次の記述中の［a］、［b］に入れる正しい答えを、それぞれの解答群の中から選べ。"),
 p(`文字列“${b.text}”を、ハフマン符号化を用いて表現する。各文字とビット表現を示した表は［a］である。ハフマン符号化によって圧縮すると、文字“A”〜“D”をそれぞれ2ビットの固定長で表現したときの当該文字列の総ビット長に対する圧縮率は［b］となる。ここで、圧縮率は次式で計算した値の小数第3位を四捨五入して求める。`),
 diagram("legacy-2019-huffman-ratio","圧縮率の計算式"),
 p("設問2 ハフマン木を作成するプログラム1の説明及びプログラム1を読んで、プログラム1中の［c］、［d］に入れる正しい答えを、解答群の中から選べ。"),
 p("［プログラム1の説明］(1) 四つの1次元配列parent、left、right及びfreqの同じ要素番号に対応する要素の組（以下、要素組という）によって、一つの節を表す。要素番号は0から始まる。四つの配列の大きさはいずれも十分に大きく、全ての要素は−1で初期化されている。"),
 p("(2) 図3に、図1に示したハフマン木を表現した場合の各配列の要素がもつ値を示す。配列parentには親を、配列leftには左側の子を、配列rightには右側の子を表す要素組の要素番号がそれぞれ格納され、配列freqには節の値が格納される。節が葉のとき、配列leftと配列rightの要素の値は、いずれも−1である。図3では、要素番号0〜3の要素組が、順に文字“A”〜“D”の葉に対応している。節が根のとき、配列parentの要素の値は−1である。"),
 diagram("legacy-2019-huffman-alpha-arrays","図3 図1に示したハフマン木を表現する四つの配列"),p("図3注記：矢印は、始点、終点の二つの要素組に対応する節が子と親の関係にあることを示す。"),
 p("(3) 副プログラムHuffmanは、①葉である節の個数size、②初期化された配列parent、③初期化された配列left、④初期化された配列right、⑤初期化した後、文字の出現回数が要素番号0から順に格納された配列freqを受け取り、ハフマン木を表現する配列を作成する。"),
 p("(4) 副プログラムSortNodeは、親が作成されていない節を抽出し、節の値の昇順に整列し、節を表す要素組の要素番号を順に配列nodeに格納し、その個数を変数nsizeに格納する。行番号19〜24で親が作成されていない節を表す要素組の要素番号を抽出し、行番号25で節の値の昇順に整列する。"),
 p("(5) 副プログラムSort（プログラムは省略）は、節を表す要素組の要素番号の配列を受け取り、要素番号に対応する要素組が表す節の値の昇順になるように整列する。節の値が同じときの順序は並べ替える前の順に従う。(6) 副プログラムHuffman、SortNode及びSortの引数の仕様を、表2〜4に示す。"),
 args("表2 副プログラムHuffmanの引数の仕様",[rows.size,rows.parent,rows.left,rows.right,rows.freq]),
 args("表3 副プログラムSortNodeの引数の仕様",[input(rows.size),input(rows.parent),input(rows.freq),["nsize","整数型","出力","配列node中の、整列対象とした節の個数"],["node[]","整数型","出力","節の値の昇順に整列した、親が作成されていない節を表す要素組の要素番号を格納した配列"]]),
 args("表4 副プログラムSortの引数の仕様",[input(rows.freq),["nsize","整数型","入力","配列node中の、整列対象の節の個数"],["node[]","整数型","入力／出力","節を表す要素組の要素番号を格納した配列"]]),
 p("プログラムの共通記法は、参照本文『共通に使用される擬似言語の記述形式（原p3〜4）』を参照する。"),
 diagram("legacy-2019-huffman-program1","プログラム1"),
 p("設問3 ハフマン木から文字のビット表現を作成して表示するプログラム2の説明及びプログラム2を読んで、プログラム2中の［e］、［f］に入れる正しい答えを、それぞれの解答群の中から選べ。"),
 p("［プログラム2の説明］(1) ビット表現を求めたい文字に対応する葉を表す要素組の要素番号を、副プログラムEncodeの引数kに与えて呼び出すと、ハフマン木から文字のビット表現を作成して表示する。(2) 副プログラムEncodeの引数の仕様を、表5に示す。"),
 args("表5 副プログラムEncodeの引数の仕様",[["k","整数型","入力","節を表す要素組の要素番号"],input(rows.parent),input(rows.left)]),
 p("(3) 副プログラムEncodeは、行番号2の条件が成り立つとき、副プログラムEncodeを再帰的に呼び出す。これによって、ハフマン木を葉から根までたどっていく。(4) 根にたどり着くと次は葉に向かってたどっていく。現在の節が親の左側のときは0を、右側の子のときは1を表示する。(5) 関数printは、引数で与えられた文字列を表示する。"),
 diagram("legacy-2019-huffman-program2","プログラム2"),
 ];
 const choices:Block[][]=[...b.codeTables.map(codes=>[table("aに関する解答群",["文字","A","B","C","D"],[["ビット表現",...codes]])]),...b.ratios.map(x=>[p(x)]),...legacy2019Pm8CdChoices.map(x=>[p(x)]),...legacy2019Pm8EChoices.map(x=>[p(x)]),...legacy2019Pm8FChoices.map(x=>[p(x)])],ids=(start:number,count:number)=>Array.from({length:count},(_,i)=>`choice-value-${start+i+1}`),id=(i:number)=>`choice-value-${i}`;
 return{prompt,choices,answerParts:[{id:"part-a",label:"設問1 a",choiceIds:ids(0,4)},{id:"part-b",label:"設問1 b",choiceIds:ids(4,4)},{id:"part-c",label:"設問2 c",choiceIds:ids(8,7)},{id:"part-d",label:"設問2 d",choiceIds:ids(8,7)},{id:"part-e",label:"設問3 e",choiceIds:ids(15,5)},{id:"part-f",label:"設問3 f",choiceIds:ids(20,4)}],partAnswers:[1,6,11,12,20,22].map((answer,i)=>({kind:"choice"as const,partId:`part-${"abcdef"[i]}`,choiceId:id(answer)})),explanation:`設問1の対象文字列の出現回数はA=${b.frequency[0]}、B=${b.frequency[1]}、C=${b.frequency[2]}、D=${b.frequency[3]}である。値の小さい未親の節を二つずつ選び、同値なら配列先頭の節を先にする。左枝0/右枝1で根から読むとA=${b.tree.codes[0]}、B=${b.tree.codes[1]}、C=${b.tree.codes[2]}、D=${b.tree.codes[3]}となる。総ビット長は${b.bits[1]}、固定長は13×2=${b.denominator}なので、圧縮率は${b.bits[1]}/${b.denominator}を指定どおり丸めた${b.ratios[1]}である。A=010、B=0、C=01の候補ではAとCBがどちらも010となり、A=100、B=1、C=00の候補ではAとBCがどちらも100となるので、一意に復号できない。ある符号語が他の符号語の接頭語にならない符号では、先頭から文字の区切りを決められる。接頭語をもつだけで常に復号不能とは限らず、この二候補は実際に同一ビット列となる反例で区別する。有効なprefix符号でも、小さい二節を選ぶ本手順と異なる木から作れば、総ビット長が最小とは限らない。説明例αは別の文字列であり、その頻度やA/Bの符号を設問1へ流用しない。cはnsize≧2で、未親の節が二つ以上ある間だけ併合する。残り一つが根となり終了する。dはparent[i]<0で、まだ親が作成されていない節だけを抽出する。値が小さくても既に親をもつ節を再利用しない。eはparent[k]≧0で、親をもつ間だけ再帰呼出しを続け、親が−1の根では終える。fはleft[parent[k]]=kで、現在の節が親の左の子かを調べる。葉から親へさかのぼる呼出しと、根側から戻って0/1を出力する順序を区別する。`};
 },
}];
