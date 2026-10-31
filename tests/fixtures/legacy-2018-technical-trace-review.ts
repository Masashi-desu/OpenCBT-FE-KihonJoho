import type {Legacy2018NumericReview} from "./legacy-2018-review";
const review=(number:number,page:number,title:string,answer:string,reference:number[],choices:string[],premises:string[]):Legacy2018NumericReview=>({collection:"2018h30h-fe-am",number,page,title,answer,reference,choices,premises,precision:"図の全条件/整数の状態遷移/全4択を原画像で照合。丸めや原にない計算補助情報を加えない。",materialReview:"物理p3/5/6と公式答p1を全画像で照合。IPA作図と設問で、引用表示・規格本文・第三者画像は見当たらなかった。独自管理図への置換は改変と記録する。原ページ全体を配布せず注記と全4択を含む問題別切出しにする。"});
export const legacy2018TechnicalTraceReview:Legacy2018NumericReview[]=[
 review(2,3,"格子上で指定点を通る最短経路","エ",[0],["16","24","32","60"],["図の線上","PからRを通ってQへ","最短経路","横5/縦4/Rは右2上2。数値ラベルや式を図へ追加しない"]),
 review(5,5,"空のスタックに対するPUSHとPOP","ウ",[0],["上から1/7/3","上から3/4/6","上から3/7/1","上から6/4/3"],["二操作PUSH n/POPの定義","整数値n","空の初期状態","6push/3popの元9操作順","全4選択肢は開口が上の縦スタック"]),
 review(6,5,"二つの配列で表すリストへの挿入","ウ",[0,3],["3","5","7","8"],["二つの1次元配列boxとnext","同じ添字の対が一要素","boxは値/nextは後続番号","リストの3番目と4番目の間へHを挿入","Hは8番","next[0]は先頭","0は末尾/空白は未連結","両配列の全0〜9添字を解答前へ保持"]),
 review(9,6,"フェッチした命令の格納先","エ",[0,0,0],["アキュムレータ","データキャッシュ","プログラムレジスタ（プログラムカウンタ）","命令レジスタ"],["フェッチされた命令の格納順序","主記憶→a→命令デコーダ","a/decoderはプロセッサの囲み内","全4択。解法説明を図へ追加しない"]),
];
export const legacy2018TechnicalTraceFacts={
 grids:[[5,4,2,2],[4,3,1,1],[4,3,1,2],[4,4,1,1],[4,4,2,3],[4,5,1,1],[5,4,1,2],[5,3,2,2]],
 gridAnswer:[60,20,12,40,30,70,45,24],
 stackOperations:[[1,5,0,7,6,4,0,0,3],[1,5,7,0,6,0,4,0,3],[1,5,7,0,6,4,0,0,3],[1,5,7,6,4,0,0,0,3],[1,5,0,7,6,0,4,3,0],[1,5,7,0,0,6,4,3,0],[1,5,7,6,0,4,0,0,3],[1,5,0,7,6,4,0,3,0]],
 listOrders:[[1,5,3,7,2],[1,3,5,2,7],[1,7,2,5,3],[1,2,7,3,5]],
 gridLabelOffsets:{P:[-27,22],Q:[22,-20],R:[-28,-21]},
 listRowLabels:[{text:"box",x:65,y:110},{text:"next",x:65,y:255}],
 fetchLabels:[{box:"processor",text:"プロセッサ",x:517.5,y:70},{box:"memory",text:"主記憶",x:130,y:142.5},{box:"a",text:"a",x:407.5,y:142.5},{box:"decoder",text:"命令デコーダ",x:625,y:142.5}],
 fetchChoices:[["アキュムレータ","状態レジスタ"],["データキャッシュ","TLB"],["プログラムレジスタ（プログラムカウンタ）","スタックポインタ"]],
 fetchRoles:{アキュムレータ:"演算結果",状態レジスタ:"フラグ",データキャッシュ:"データの複製",TLB:"アドレス変換情報","プログラムレジスタ（プログラムカウンタ）":"次命令の位置",スタックポインタ:"スタックの位置",命令レジスタ:"フェッチした命令"},
};
/** Crop review covers all ten technical sources, including the knowledge and
 * scheduling/circuit modules. Bounds were read independently from source pixels. */
export const legacy2018TechnicalCrops:Record<string,[number,number]>={"2018h30h-fe-am-2":[.385,.645],"2018h30h-fe-am-3":[.080,.405],"2018h30h-fe-am-5":[.080,.405],"2018h30h-fe-am-6":[.440,.800],"2018h30h-fe-am-9":[.465,.800],"2018h30h-fe-am-16":[.080,.900],"2018h30h-fe-am-23":[.080,.680],"2018h30h-fe-am-28":[.300,.550],"2018h30h-fe-am-34":[.580,.715],"2018h30h-fe-am-43":[.080,.455]};
export const legacy2018TechnicalBounds:Record<number,{content:[number,number];previousEnd:number;nextStart:number}>={2:{content:[.398,.628],previousEnd:.330,nextStart:.937},3:{content:[.092,.387],previousEnd:0,nextStart:.452},5:{content:[.092,.393],previousEnd:0,nextStart:.455},6:{content:[.455,.781],previousEnd:.393,nextStart:.937},9:{content:[.478,.780],previousEnd:.414,nextStart:.937},16:{content:[.092,.882],previousEnd:0,nextStart:.937},23:{content:[.092,.643],previousEnd:0,nextStart:.937},28:{content:[.312,.531],previousEnd:.246,nextStart:.594},34:{content:[.591,.695],previousEnd:.530,nextStart:.755},43:{content:[.092,.443],previousEnd:0,nextStart:.937}};
