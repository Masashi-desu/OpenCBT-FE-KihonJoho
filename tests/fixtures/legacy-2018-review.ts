/** Hand-fixed against the rendered question and answer PDFs, 2026-10-19.
 * This is a work-in-progress review fixture, not a declaration of publication.
 * PDF page numbers are physical (the afternoon booklet has an unnumbered page).
 */
export const legacy2018PaperReview = {
  checkedOn: "2026-10-19",
  listedAt: "https://www.ipa.go.jp/shiken/mondai-kaiotu/2018h30.html",
  terms: "https://www.ipa.go.jp/shiken/faq.html",
  attribution: "出典：平成30年度 春期／秋期 基本情報技術者試験 午前／午後 問番号を個別に表示",
  limits: "教育目的の同梱・ブラウザ表示・改変をIPA FAQに照らすプロジェクト判断。包括的な第三者許諾ではない。年度186問／大問は未完成であり、共有カタログへ未登録。",
  papers: {
    "2018h30h-fe-am": { questionSha256: "75ed3191ffee7083b776c29cdcb12b0a9f27196edaa32fed8642ff157d34af23", answerSha256: "9124bdb21ac2b6f3bee526882f20be48cb2e77f6b4a6062b1dc12298241dcf40", pages:40, count:80,
      answers: "ア エ ウ ア ウ ウ ウ エ エ イ ウ エ ア イ ア ウ エ ア イ ア ウ エ ア エ エ イ イ ア エ ウ エ エ ア ア ア エ ウ イ ア イ ア エ エ ウ イ ウ イ イ エ エ エ ウ イ ア ア イ エ イ ア イ イ エ ウ ア エ イ イ イ ウ ア ア エ ウ イ ウ ア イ エ エ ウ".split(" ") },
    "2018h30a-fe-am": { questionSha256: "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e", answerSha256: "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d", pages:40, count:80,
      answers: "エ ウ ア エ ウ ウ エ エ エ ウ ウ エ エ イ ウ イ ウ ア エ ウ エ イ エ イ ア エ イ ウ ア エ エ ウ エ ウ ア ア エ ウ イ ア エ ウ ウ エ ウ エ イ ウ イ イ エ エ イ エ ア イ イ エ エ エ エ ウ イ イ ア イ ア エ エ ア イ エ エ エ ウ ウ イ ア エ ア".split(" ") },
    "2018h30h-fe-pm": { questionSha256:"bb172e6225037b05e18aec455f7aec8ec66f3e82838c92a27bb50d2d203dbfb9",answerSha256:"50c0b5defdb6a579048671d6a371e1ecf982ad59d370c08d1909e16d0f7b0777",pages:89,count:13 },
    "2018h30a-fe-pm": { questionSha256:"11c85fd0985431b938392d2e163cd83158917973ade6205e273be5bfc6e703ad",answerSha256:"c8891b8c075a7b5654625fe5051776ef17a8b9196958ef6adf8450d83ff69bb5",pages:93,count:13 },
  },
};
export type Legacy2018Collection = keyof typeof legacy2018PaperReview.papers;
export type Legacy2018NumericReview = { collection: Legacy2018Collection; number:number; page:number; title:string; answer:string; choices:string[]; reference:number[]; premises:string[]; precision:string; materialReview:string };
const ownPaper = "原ページと別紙解答p.1を画像照合。対象ページに他者の引用表示・規格本文・写真は見当たらない。原文・表はIPA作問部分としてFAQで用途別評価し、独自生成・解説を区別する。同一AIの査読であり外部法的判断ではない。";
export const legacy2018NumericReview: Legacy2018NumericReview[] = [
  {collection:"2018h30a-fe-am",number:77,page:36,title:"先入先出法による売上原価",answer:"イ",choices:["26290","26450","27250","27586"],reference:[1,0],premises:["前月繰越100個@200円","5日仕入50個@215円","15日売上70個","20日仕入100個@223円","25日売上60個","30日翌月繰越120個","先入先出法の当月売上原価"],precision:"基準FIFOは100×200＋30×215＝26450。27250は移動平均、27586は月次総平均。26290は根拠不明の原比較値として差160を数量に連動する限定調整（QA-04）であり、特定の誤った評価法とは断定しない。全9入力で3評価法の候補は整数となり、原間隔の比率を保つ。",materialReview:"公式問題物理p.36の問77の6行の表・単価欄・全択と公式解答p.1を画像照合。引用表示・第三者規格文言・写真を認めなかった。先に表示される問76を含めず問題別切出しを用いる。"},
  {collection:"2018h30h-fe-am",number:32,page:17,title:"サブネット内でPCに割り振れないIPv4アドレス",answer:"エ",choices:["200.170.70.17","200.170.70.20","200.170.70.30","200.170.70.31"],reference:[4,1,1],premises:["ネットワークアドレス200.170.70.16","マスク255.255.255.240","同一ネットワークをPCが利用","割り振ってはいけないIPアドレス"],precision:"原問の二行の条件と同一接頭辞の全4択を画像照合。原値/28のホスト部4ビット、16〜31の範囲にあり、31だけがブロードキャスト。全12入力をビット演算とホスト全列挙で独立検算。",materialReview:"公式問題物理p.17の問32と公式解答p.1を画像照合。アドレス値・IPA独自の設問文章と択のみであり、引用表示・第三者規格文言・図表転載を認めなかった。問33以降を画像に入れない。"},
  {collection:"2018h30a-fe-am",number:37,page:18,title:"AESの全鍵探索の最大試行回数",answer:"エ",choices:["256","2^128","2^255","2^256"],reference:[2],premises:["AES-256で暗号化されていることが分かっている","暗号文が与えられている","ブルートフォース攻撃","試行回数の最大値"],precision:"原択の指数128/255/256を画像照合し、指数表記を2^nで再組版。鍵長そのもの・指数を半分・平均探索回数・全鍵数を区別。NIST FIPS197の3鍵長の事実を確認した全3入力をBigIntで独立検査。",materialReview:"公式問題物理p.18の問37と公式解答p.1を画像照合。原問題に規格文言引用・第三者図表転載は認めなかった。生成する鍵長の一次確認はhttps://www.nist.gov/publications/advanced-encryption-standard-aes-0（2026-10-19）。規格本文や図は転記せず、方式名と数値の事実のみ用いる。"},
  { collection:"2018h30h-fe-am",number:1,page:3,title:"2の補数の下位ビットと剰余",answer:"ア",choices:["その整数値が正ならば3","その整数値が負ならば−3","その整数値が負ならば3","その整数値の正負にかかわらず0"],reference:[2,1],premises:["負数を2の補数","最下位2ビット","商の絶対値の小数点以下を切り捨て"],precision:"整数剰余。負数の除算は0方向に切捨て。下位ビットの整数値と負数の剰余を混同しない。",materialReview:ownPaper },
  { collection:"2018h30h-fe-am",number:52,page:25,title:"工程工数による進捗加重平均",answer:"ウ",choices:["40","44","54","59"],reference:[2,5],premises:["基本設計からプログラム設計まで計画どおり終了","全プログラムの開発工数は等しい","3000本中1200本"],precision:"百分率は整数。工数配分0.08/0.16/0.20/0.25/0.31。完了工程・現在工程の進捗・1段階過大の誤答を保持。",materialReview:ownPaper },
  { collection:"2018h30h-fe-am",number:53,page:25,title:"工数の三乗根による開発期間",answer:"イ",choices:["16","40","64","160"],reference:[4,5],premises:["期間＝2.5×工数の1/3乗","工数の単位は人月","期間の単位は月"],precision:"4096の三乗根16と平方根64を区別。係数適用漏れ／根の指数の取り違えを誤答にする。全選択肢が整数になる候補だけを許可。",materialReview:ownPaper },
  { collection:"2018h30h-fe-am",number:54,page:26,title:"ファンクションポイントの補正",answer:"ア",choices:["18","24","30","32"],reference:[1,2,1,3],premises:["外部入力1個・重み4","外部出力2個・重み5","内部論理ファイル1個・重み10","補正係数0.75"],precision:"重み付き和24に0.75を乗ずる。補正漏れ・1.25倍・補正係数による除算を誤答にする。丸めは行わない。",materialReview:ownPaper },
  { collection:"2018h30h-fe-am",number:67,page:31,title:"規模の経済と範囲の経済",answer:"イ",choices:["スケールメリットはあるが、シナジー効果はない。","スケールメリットはないが、シナジー効果はある。","スケールメリットとシナジー効果がともにある。","スケールメリットとシナジー効果がともにない。"],reference:[0,1,0],premises:["6種類のケースA〜F","同一生産量で単独と共同のコストを比較","倍増した生産量で単位コストを比較"],precision:"万円・万本の整数。2倍との比較を両製品・共同生産の両規模で行う。",materialReview:ownPaper },
  { collection:"2018h30h-fe-am",number:78,page:35,title:"先入先出法の月末在庫評価",answer:"エ",choices:["3300","3600","3660","3700"],reference:[1,0],premises:["当月分の全受払い","先入先出法","月末在庫の評価額"],precision:"在庫30個は130円20個と110円10個。3300は直近単価一律、3600は月次総平均120円、3660は移動平均122円の誤答。数量倍率・全価格への10円単位加算で原問の間隔と精度を維持。",materialReview:ownPaper },
  { collection:"2018h30a-fe-am",number:1,page:3,title:"16進小数の分数化",answer:"エ",choices:["31/32","31/125","31/512","73/512"],reference:[2,4],premises:["16進数の小数0.248","10進数の分数"],precision:"3桁の16進小数を整数/4096として約分。原入力は584/4096＝73/512。十進の桁と誤認した分数、異なる分母との混成を保持。",materialReview:ownPaper },
  { collection:"2018h30a-fe-am",number:9,page:6,title:"命令出現率によるMIPS",answer:"エ",choices:["10","50","70","100"],reference:[0,2],premises:["動作クロック700MHz","必要クロック4/8/10","出現率30/60/10%","約何MIPS"],precision:"加重平均7クロック、700/7＝100MIPS。入力は整数で平均に0.5より細かい小数を生じさせず、選択肢は原比率0.1/0.5/0.7/1を保持（QA-04）。",materialReview:ownPaper },
  { collection:"2018h30a-fe-am",number:11,page:7,title:"データバス幅と冗長ビット",answer:"ウ",choices:["7","8","9","10"],reference:[7],premises:["データバス幅2のn乗ビット","冗長ビットはn+2","128ビット"],precision:"与えたn+2の関係式を固定する整数問題。実装固有のECC構成から必要ビット数を推測しない。",materialReview:ownPaper },
  { collection:"2018h30a-fe-am",number:54,page:26,title:"FP・導入教育・管理を含む総工数",answer:"エ",choices:["51","60","65","66"],reference:[5,1,1],premises:["500FP","導入と教育の合計10人月","開発と導入教育の合計の10%が管理工数","1人月10FP"],precision:"管理工数の対象が開発＋導入教育であることを保持。開発工数のみへ率を掛ける・管理を省く・導入教育を省く候補を区別。整数人月のみ。",materialReview:ownPaper },
  { collection:"2018h30a-fe-am",number:57,page:27,title:"SLA可用性から停止上限",answer:"イ",choices:["0.3","2.1","3.0","3.6"],reference:[3,1],premises:["営業日30日","午前8時から午後10時","可用性99.5%以上","サービス時間帯中に計画停止を行わない"],precision:"30×14×0.005＝2.1時間。日数20/30・可用性99/99.5%だけを変え、原選択肢の2/14/20/24時間への比率を保持（QA-04）。小数第1位まで正確に求まる。",materialReview:ownPaper },
  { collection:"2018h30a-fe-am",number:68,page:32,title:"一次需要曲線の内挿",answer:"エ",choices:["30000","35000","40000","45000"],reference:[6,2,3,6],premises:["設定価格と需要の関係は1次式","3000円で需要0","1000円で60000個","1500円の需要"],precision:"価格500円・需要10000個単位を原形式の3条件へバインド。計算結果が5000個の整数倍の候補のみ。原選択肢の5000個間隔を保ち、負の需要や既知最大需要を超える誤答を避ける。",materialReview:ownPaper },
  { collection:"2018h30a-fe-am",number:75,page:35,title:"廃棄費用を含む仕入期待利益",answer:"ウ",choices:["4","5","6","7"],reference:[10,3],premises:["仕入数ごとの販売個数予想確率の表","1個当たり利益1000円","売れ残り1個当たり廃棄ロス300円","利益の期待値が最大"],precision:"表の30/30/30/10%を丸めず整数分子で計算。売上利益と廃棄損失を分け、仕入数4〜7の全候補を比較。同率最大は拒否。",materialReview:ownPaper },
];
/** Normalized vertical clips selected from the reviewed source image. Full
 * width is retained. Every clip includes the heading, notes, media and all four
 * choices, and ends before the adjacent question. This avoids importing another
 * question or a pending third-party excerpt through a shared page asset. */
export const legacy2018CropReview:Record<string,readonly [number,number]>={
  "2018h30a-fe-am-77":[0.415,0.850],
  "2018h30h-fe-am-32":[0.085,0.345],"2018h30a-fe-am-37":[0.690,0.845],
  "2018h30h-fe-am-1":[0.08,0.38],"2018h30h-fe-am-52":[0.40,0.695],"2018h30h-fe-am-53":[0.695,0.89],
  "2018h30h-fe-am-54":[0.075,0.395],"2018h30h-fe-am-67":[0.435,0.92],"2018h30h-fe-am-78":[0.210,0.602],
  "2018h30a-fe-am-1":[0.08,0.222],"2018h30a-fe-am-9":[0.32,0.615],"2018h30a-fe-am-11":[0.08,0.27],
  "2018h30a-fe-am-54":[0.493,0.72],"2018h30a-fe-am-57":[0.658,0.94],"2018h30a-fe-am-68":[0.407,0.66],"2018h30a-fe-am-75":[0.30,0.64],
};
