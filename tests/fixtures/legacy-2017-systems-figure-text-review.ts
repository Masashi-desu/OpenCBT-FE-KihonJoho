const edges=["a>b,a>c,a>d,a>e,b>f,b>g,b>h,e>i,e>j","a>b,a>c,a>d,a>e,b>f,b>g,b>h,f>i,f>j","a>b,a>c,a>e,b>d,b>f,b>g,b>h,e>i,e>j"];
export function systemsFigureText(profile:string,v:number[]){
 if(profile==="legacy-2017-multiplication-flow"){const n=[8,12,16][v[0]],initial=v[1]?`被乗数を${n-1}ビット左シフト → X`:"被乗数 → X";return {caption:"シフトと加算による乗算の流れ図",alt:`開始、XとYとZとiの初期化、aと1の比較、等しければZにXを加算、bの桁送り、iの加算、iと${n}の比較を行い、繰返し後にZを出力する流れ図。`,description:`開始後、${initial}、乗数→Y、0→Z、1→iとする。aと1を比較し、等しいときだけZにXを加える。続いてbを実行し、iに1を加える。iが${n}以下ならaの比較へ戻り、超えればZを出力して終了する。`};}
 if(profile==="legacy-2017-half-adder")return {caption:"半加算器の回路",alt:"二つの入力xとyが素子AとBの両方へ接続し、Aからz（和の1桁目）、Bからc（桁上げ）を出力する。黒丸は分岐接続点。",description:"入力xとyが素子AとBの両方へ接続する。Aの出力はz（和の1桁目）、Bの出力はc（桁上げ）。二つの黒丸は分岐の接続点で、橋形で交差する線は接続しない。"};
 if(profile==="legacy-2017-functional-dependencies"){const list=edges[v[0]].split(",").map(e=>e.replace(">","から")).join("、");return {caption:"属性a〜jの関数従属",alt:list+"への矢印で関数従属を表す。",description:list+"への九つの矢印で関数従属を表す。"};}
 if(profile==="legacy-2017-accounting-model")return {caption:"会計取引のUMLデータモデル",alt:"勘定と会計取引が関連し、関連の移動は金額を持ち借方と貸方へ分かれる。勘定側の多重度は2..*、会計取引側は*。一つの会計取引に関する借方金額の合計と貸方金額の合計は一致する。",description:"勘定の属性は勘定コードと科目名、会計取引の属性は取引番号、計上日、摘要。両者の関連は勘定側が2..*、会計取引側が*。関連クラスの移動は金額を持ち、借方と貸方が移動を継承する。制約は、一つの会計取引に関する借方金額の合計と貸方金額の合計が一致すること。"};
 if(profile==="legacy-2017-ftth-home-network")return {caption:"利用者宅内のLANとFTTH接続",alt:"利用者宅内の複数PCがハブ、装置A、ONUの順で接続し、ONUから宅外へFTTHの光ファイバケーブルが延びる。",description:"利用者宅内に複数のPC、ハブ、装置A、ONUがあり、PCからハブ、装置A、ONUの順に接続する。ONUから宅内の外へFTTHの光ファイバケーブルが延びる。"};
 throw Error("UNREVIEWED_FIGURE_TEXT");
}
