/** All original p9–12 and the official answer image were visually checked. */
export const legacy2019PmMemoryReview={
  source:"2019h31h-fe-pm-2",pages:[9,10,11,12],reference:[0,0,3],capacity:96,
  questionSha256:"bfd415139913f156ea36b5de5f3d8a6fba7efd721b67c1be12ec45cc693df0dd",answerSha256:"8085576c2b5d6db18c9b9ecb00c7b0b9b120eb2be8ac977961b4c81e8c3a52d8",
  sourceAnswers:["ウ","エ","ア","ア","エ"],choiceGroups:[5,4,4,9,9],
  originalReferenceOrder:[4,2,1,5,4,2,3,4,2,1,5,3,5],originalFaults:{FIFO3:9,FIFO4:10,LRU3:10,LRU4:8},
  premises:["仮想ページと1対1","存在している場合は1、存在していない場合は0","A〜H","網掛けの部分は表示していない","仮想ページと対応付けられていない物理ページ","存在ビットを0","存在ビットを1","全て空きページ"],
  pairChoices:[["仮想","補助記憶装置から読み込む"],["仮想","補助記憶装置に書き出す"],["物理","補助記憶装置から読み込む"],["物理","補助記憶装置に書き出す"]],
  changeChoices:["1回増える","1回減る","2回増える","2回減る","3回増える","3回減る","4回増える","4回減る","変わらない"],
  sourceMedia:"本文/番号付きページ管理3規則/三列のページ対応図/空欄の組合せ3群/増減9択2群。a1〜a4は4欄でなく1組合せ欄a、b1/b2、c1/c2もそれぞれ1組。",
  bounds:"物理配置4×参照順12×比較元フレーム数2条件=96。13参照・ページ番号1〜5を維持。原9増減択の範囲を超える回転5（FIFO3→4が5回減少）は入力域に含めず、別の原問を除外したとの扱いにしない。",
  tieAndInitialState:"全割当フレームが空きという原初期状態。図1の存在bit1の状態は設問1の別例であり、参照列の初期状態へ流用しない。空きフレームが複数あるときの番号の優先順位は原問が規定せず、ページfault数に影響しない。FIFO読み込み時刻/LRU最終参照時刻は参照一回ごとに一つだけ更新され、常駐ページ同士の最小時刻に同率は生じない。",
  independentValidation:"生成器のキューと独立した常駐集合+読込み時刻/最終参照時刻モデルで96入力の本文数値・a全5組/bc各4組/de各9記述を検査。小領域の全3^0+…+3^7参照列×frame1..3×2policyも比較。FIFOのhit更新、LRUのhit無更新、初期空き/初回faultの欠落を変異検査する。",
  rights:{material:"2019春午後問2の本文・図1・a/b/c/d/e全解答群・正答",pages:[9,10,11,12],source:"https://www.ipa.go.jp/shiken/faq.html",assessment:"原4頁を目視し、第三者の引用出典・規格本文やJava API説明は特定しなかった。図1の省略注記も保持する。IPA教育用途条件の出典/改変明記付き同梱・ブラウザ表示・生成へのプロジェクト判断として、別の大問や付録に流用しない。独自解説・描画実装は区別し、原図依存部分をIPA派生として扱う。",status:"source_reviewed_pending_parent_distribution_integration"},
} as const;
export const legacy2019ReviewedPageLayouts=[
  ["E","A","D","G","B","F","C","H"],["B","F","D","A","G","C","H","E"],
  ["H","C","A","F","B","E","G","D"],["D","G","F","C","A","H","E","B"],
] as const;
export const legacy2019ReviewedPageCandidates=[
  [[1,2,3,4],[2,3,5,7],[2,5,7,3],[5,1,4,7],[5,2,7,3]],
  [[1,2,3,4],[1,3,4,6],[4,1,6,3],[2,6,4,1],[1,4,6,3]],
  [[1,2,3,4],[2,3,5,8],[3,5,2,8],[8,3,1,6],[5,3,2,8]],
  [[1,2,3,4],[1,4,5,8],[5,8,4,1],[4,7,6,3],[8,5,4,1]],
] as const;
export const legacy2019ReviewedReferenceStrings=["4215423421535","2154234215354","1542342153542","5423421535421","4234215354215","3421535421542","4215354215423","2153542154234","1535421542342","5354215423421","3542154234215","5421542342153"] as const;
