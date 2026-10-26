/** 2017spring common notation only, from physical3–4. This is independent of
 * CASL/JIS/Java API appendices and does not assert rights for those materials. */
export const legacy2017Pm8CommonIntroduction="擬似言語を使用した問題では、各問題文中に注記がない限り、次の記述形式が適用されているものとする。";
export const legacy2017Pm8NotationRows=[
 {kind:"declaration",height:80,syntax:["○"],description:["手続、変数などの名前、型などを宣言する。"]},
 {kind:"comment",height:80,syntax:["/* 文 */"],description:["文に注釈を記述する。"]},
 {kind:"statements",height:120,syntax:["・変数 ← 式","・手続（引数、…）"],description:["変数に式の値を代入する。","手続を呼び出し、引数を受け渡す。"]},
 {kind:"single",height:150,syntax:["条件式","処理"],description:["単岐選択処理を示す。","条件式が真のときは処理を実行する。"]},
 {kind:"double",height:210,syntax:["条件式","処理1","処理2"],description:["双岐選択処理を示す。","条件式が真のときは処理1を実行し、偽のときは処理2を実行する。"]},
 {kind:"pretest",height:160,syntax:["条件式","処理"],description:["前判定繰返し処理を示す。","条件式が真の間、処理を繰り返し実行する。"]},
 {kind:"posttest",height:160,syntax:["処理","条件式"],description:["後判定繰返し処理を示す。","処理を実行し、条件式が真の間、処理を繰り返し実行する。"]},
 {kind:"counted",height:260,syntax:["変数: 初期値、条件式、増分","処理"],description:["繰返し処理を示す。","開始時点で変数に初期値（式で与えられる）が格納され、条件式が真の間、処理を繰り返す。また、繰り返すごとに、変数に増分（式で与えられる）を加える。"]},
] as const;
export const legacy2017Pm8OperatorRows=[
 ["単項演算","＋、−、not"],["乗除演算","×、÷、%"],["加減演算","＋、−"],["関係演算","＞、＜、≧、≦、＝、≠"],["論理積","and"],["論理和","or"],
] as const;
export const legacy2017Pm8DivisionNote="注記 整数同士の除算では、整数の商を結果として返す。%演算子は、剰余算を表す。";

export const legacy2017Pm8NotationDescription="2017春期の共通記法。単岐/双岐選択は▲開始/▼終端。前判定・後判定・変数型の繰返しは上下■。後判定の条件式は処理の後に記す。"+legacy2017Pm8NotationRows.map(r=>r.syntax.join("、")+"："+r.description.join("")).join("\n");
export const legacy2017Pm8OperatorDescription="演算子の優先順位は単項、乗除、加減、関係、論理積、論理和の順に高い。単項は＋・−・not、乗除は×・÷・%、加減は＋・−、関係は＞・＜・≧・≦・＝・≠、論理積はand、論理和はor。";
