/** Fixed by viewing physical question p38–43, shared notation p4–5,
 * covers p1/89, contents p3 and official answer p1 on2026-10-20.
 * This is source/design evidence; it does not register a candidate. */
export const legacy2018HeapReview={
 checkedOn:"2026-10-20",source:"2018h30h-fe-pm-8",collection:"2018h30h-fe-pm",number:8,
 questionSha256:"bb172e6225037b05e18aec455f7aec8ec66f3e82838c92a27bb50d2d203dbfb9",answerSha256:"50c0b5defdb6a579048671d6a371e1ecf982ad59d370c08d1909e16d0f7b0777",
 pages:[38,39,40,41,42,43],printedPages:[37,38,39,40,41,42],commonNotationPages:[4,5],coverPages:[1,89],contentsPage:3,
 exam:{minutes:150,mandatory:[1,8],chooseFourFrom:[2,3,4,5,6,7],chooseOneFrom:[9,10,11,12,13],majorsAnswered:7,excessRule:"問2〜7を5問以上選択した場合は先の4問、問9〜13を2問以上選択した場合は先の1問を採点するという原指示。アプリで全13問を150分の必須本番同等と扱わない。"},
 sourceHeap:[60,30,45,15,5,10,20],groups:[6,4,4,4,6],labels:["設問1 a","設問1 b","設問2 c","設問2 d","設問2 e"],sourceAnswer:["イ","エ","エ","イ","イ"],
 originalChoices:[
  ["heap[k] > heap[lchild(k)]","heap[k] > heap[parent(k)]","heap[k] > heap[rchild(k)]","heap[k] < heap[lchild(k)]","heap[k] < heap[parent(k)]","heap[k] < heap[rchild(k)]"],
  ["heap[hnum−1]","heap[k]","parent(hnum−1)","parent(k)"],
  ["5","10","15","20"],
  ["以下のときには","以上のときには","よりも大きいときには","よりも小さいときには"],
  ["1","2","3","4","5","6"]
 ],
 premises:["昇順に整列","親は一つ又は二つの子","親の値は子の値よりも常に大きいか等しい","丸は節","丸の中の数値は各節が保持する値","親をもたない節を根","根は最大の値","配列の要素番号は0から","hnum > 0","heap[0]は根","左の子はheap[2×i+1]","右の子はheap[2×i+2]","子が一つの場合は左側の子","parentは(i−1)÷2の小数点以下切捨て","swapは二つの要素の値を交換","最初last=hnum−1","整列対象領域の最後の要素番号","最初は配列heap全体が整列対象領域","行番号3の直後のαでは図2のとおり","行番号4から7までの1回目の繰返し","行番号5のswap実行直後","右側の子の値が左側の子の値［d］","tmpを次のnとして(2)に戻る","行番号15で最初にnに代入される値"],
 sourceTables:[
  {caption:"表1 副プログラムmakeHeapの引数の仕様",columns:["引数","データ型","入出力","説明"],rows:[["data[]","整数型","入力","データが格納されている1次元配列"],["heap[]","整数型","出力","ヒープの性質を満たすようにデータを格納する1次元配列"],["hnum","整数型","入力","データの個数"]]},
  {caption:"表2 副プログラムswapの引数の仕様",columns:["引数","データ型","入出力","説明"],rows:[["heap[]","整数型","入力／出力","交換対象のデータが格納されている1次元配列"],["i","整数型","入力","交換対象の要素番号"],["j","整数型","入力","交換対象の要素番号"]]},
  {caption:"表3 副プログラムheapSortの引数の仕様",columns:["引数","データ型","入出力","説明"],rows:[["data[]","整数型","入力","整列対象のデータが格納されている1次元配列"],["heap[]","整数型","出力","整列済みのデータが格納されている1次元配列"],["hnum","整数型","入力","データの個数"]]},
  {caption:"表4 副プログラムdownHeapの引数の仕様",columns:["引数","データ型","入出力","説明"],rows:[["heap[]","整数型","入力／出力","整列対象のデータが格納されている1次元配列"],["hlast","整数型","入力","整列対象領域の最後の要素番号"]]}
 ],
 commonNotation:{individualNotesTakePrecedence:true,initializationBeforeCondition:true,incrementAfterBody:true,preAndPostConditionDistinct:true,integerDivision:"整数同士の除算は整数の商。負数の丸め方向をこの共通文だけから補わない。本問のparentで必要な除算はk>0で非負。",operators:["単項＋/−/not","×/÷/%","＋/−",">/</≧/≦/=/≠","and","or"],booleans:["true","false"],standaloneMaterial:"物理p4/5は本試験独自の擬似言語の記述形式と演算子/優先順位。JIS X0201の文字コード表やJava API資料を含めない。"},
 variablePlan:{status:"prepared_unregistered_candidate",fields:[{name:"internalChildren",minimum:0,maximum:1},{name:"leafPermutation",minimum:0,maximum:23}],reference:[0,12],valid:48,rejected:0,capacity:"内部2子30/45の左右と4葉5/10/15/20の位置を変え、同じ7節maxheapと実追跡を保つ。配列の並び変更は追跡入力の実条件変更であり、選択肢順の変更を容量にしない。",fixed:"maxheap/昇順/0始まり/hnum7/全関数と2プログラム/全4表/全5欄24択の役割。a/b/dは一般コードの意味を問う固定正答、c/eは実heapから変わる。",precision:"全値は原の整数5/10/15/20/30/45/60のまま、7節/6辺/7配列要素/初回のswapとdownHeapという元の追跡負担。計算精度/丸め/選択肢間隔を増やさない。",generalCountermodels:"0/1/2の長さ1〜6の1092入力から全a6×b4を検算し、未定義添字も誤答の反例とする。dは左右値0..2の9組、同値3組を含め実コードが右子を選ぶ条件を照合。"},
 materials:{body:"ヒープ/配列/図3領域と独自プログラムの説明、全5欄24択。全6頁の原画像を確認し、規格本文・外部図表・引用出所・写真を特定しなかった。注記の不在だけではなく内容とIPA作問の文脈から個別評価する。",common:"物理p4/5の宣言/注釈/代入/呼出し/条件分岐/繰返し/演算優先/整数商。原文に別出所又は規格文言引用を識別せず、本試験の共通記法としてIPA教育目的条件へ照らす。",otherAppendices:"CASL/JIS文字コード/Java API/表計算の未確認付録へこの判断を流用しない。問題9以降と訂正表の問10を問8assetへ混入させない。",basis:"https://www.ipa.go.jp/shiken/faq.html",uses:["repositoryRedistribution","browserDisplay","adaptation"],limits:"同一AIの教材用途判断。外部専門家又は権利者の個別許可ではない。共有profile/schema/runtime/保存/配布と186全体は未完了。"},
 completed:["全本文/設問/全24択/複合5欄の年度module","全48入力/実SVGの全図・プログラム・制御の独立検算","原全6頁+未改変共通2頁の個別素材staging","588問題/2304画像倍率/696解説用語の隔離SSR表示","全48正式alt/JSON/実AX96図2016行と原p40/p42の全42行、実client全49ケースの採点/JSON状態復元"],
 pending:["原問題/共通画像全体のAX完全性。全コード2図と原p40/p42の全文は専用client/CDPで確認済みだが、他の原画像の全文を含めて検証したとは扱わない","新5profileのshared renderer/schema/registry/sourceKey","未改変共通contextのofficial出典と共通image assetRefsを実bindAdditionalQuestionでも保持する統合","実アプリの旧PM必須/選択と150分/7大問、旧AM80問/150分","全用語の原/生成/保存sourceKey表示","実Run/IndexedDB保存再開/採点/CSP/配布","年度全186件"]
} as const;
