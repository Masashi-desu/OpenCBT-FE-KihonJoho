/** Source images p11–13 and official answer p1 were visually read before
 * fixing these facts. No expected table is scraped from production output. */
export const legacy2018LogicReview={
  checkedOn:"2026-10-19",collection:"2018h30h-fe-pm",source:"2018h30h-fe-pm-2",number:2,pages:[11,12,13],printedPages:[10,11,12],reference:[0,0],
  questionSha256:"bb172e6225037b05e18aec455f7aec8ec66f3e82838c92a27bb50d2d203dbfb9",answerSha256:"50c0b5defdb6a579048671d6a371e1ecf982ad59d370c08d1909e16d0f7b0777",
  groups:[4,5,5,6,6],labels:["設問1 a","設問2 b","設問2 c","設問3 d","設問3 e"],sourceAnswer:["エ","オ","ア","オ","ア"],
  gateChoices:["AND","NAND","NOR","OR"],halfAdderChoices:["AND","NAND","NOR","OR","XOR"],
  sourceParameters:[[-5,-5,-8],[-5,-5,-2],[5,5,-5],[5,5,2],[5,5,8],[5,5,15]],
  sourceTruthRows:[["0","0","0","0","1","1"],["0","1","0","1","1","0"],["1","0","0","1","1","0"],["1","1","1","1","0","0"]],
  sourceXorRows:[["0","0","0"],["0","1","1"],["1","0","1"],["1","1","0"]],
  sourceExampleRows:[["0","0","0.5×0＋0.5×0","0.3","0"],["0","1","0.5×0＋0.5×1","0.3","1"],["1","0","0.5×1＋0.5×0","0.3","1"],["1","1","0.5×1＋0.5×1","0.3","1"]],
  premiseTerms:["主要な論理演算の真理値表","1桁の2進数X、Y","その和の下位桁をZ","桁上がりをC","1ビットの入力X、Y","Wx、Wyで重み付けして加算","パラメタTをしきい値","Wx×X＋Wy×Y ≧ T","Wx×X＋Wy×Y ＜ T","以下、パラメタ","入出力関係という"],
  configurations:[{known:"NAND",final:"AND",target:"XOR",truth:[0,1,1,0]},{known:"OR",final:"AND",target:"XOR",truth:[0,1,1,0]},{known:"NOR",final:"OR",target:"XNOR",truth:[1,0,0,1]},{known:"AND",final:"OR",target:"XNOR",truth:[1,0,0,1]}],
  parameters:[
    {weights:[5,5],example:3,vectors:[[-5,-5,-8],[-5,-5,-2],[5,5,-5],[5,5,2],[5,5,8],[5,5,15]]},
    {weights:[4,6],example:3,vectors:[[-4,-6,-8],[-4,-6,-2],[4,6,-4],[4,6,3],[4,6,9],[4,6,15]]},
    {weights:[6,3],example:2,vectors:[[-6,-3,-8],[-6,-3,-2],[6,3,-5],[6,3,2],[6,3,8],[6,3,12]]},
    {weights:[3,7],example:2,vectors:[[-3,-7,-9],[-3,-7,-2],[3,7,-3],[3,7,2],[3,7,9],[3,7,15]]},
    {weights:[4,6],example:4,vectors:[[-4,-6,-6],[-4,-6,-3],[4,6,-4],[4,6,4],[4,6,10],[4,6,15]]},
    {weights:[5,5],example:5,vectors:[[-5,-5,-5],[-5,-5,-4],[5,5,-5],[5,5,5],[5,5,10],[5,5,15]]},
  ],
  equalities:[{parameter:4,candidate:0,input:[0,1]},{parameter:4,candidate:3,input:[1,0]},{parameter:4,candidate:4,input:[1,1]},{parameter:5,candidate:0,input:[0,1]},{parameter:5,candidate:0,input:[1,0]},{parameter:5,candidate:3,input:[0,1]},{parameter:5,candidate:3,input:[1,0]},{parameter:5,candidate:4,input:[1,1]}],
  precision:"入力X/Y/Z/Cは0/1、重みとTは小数第1位まで。十分の一単位の符号付き整数として全4入力を評価し、丸めは行わない。原26択のゲートと6パラメタの役割（NAND/NOR/常時1/OR/AND/常時0）を全条件で保持する。等号が実際に成立する重み条件4/5に加え、全候補で加重和がT未満/等しい/超える場合の出力判定を境界の単体反例で検査する。原問の半加算器b/cを変化させるために入力の意味や演算を変更しない。",
  media:"真理値表3点、二段ゲート回路1図と半加算器1図。表の見出しは入力列を二列と各演算の出力に再組版するが、全行全値・出力対象・空欄/26択は維持。原図の接続点二つと非接続交差の橋形、全ゲートへの二入力、最終段とZ/Cの出力を管理SVGで再構成する。",
  materialReview:"物理p11〜13全頁と解答p1を目視。IPA独自の真理値表・回路・重み付き加算による設問で、規格本文、外部転載図表、API説明、写真などの第三者素材を特定しなかった。図形記号や論理演算名が現れることのみを権利許諾又は著作権の否定の根拠にせず、実際の素材と教育利用FAQの条件から判断した。本文/表/図/正答のIPA原部分と独自実装/解説を区別し、他大問の保留素材へ流用しない。",
  pending:["年度専用2profile/domain/alt/UIの共有登録","年度セットとミックスの登録","実アプリ保存再開と採点/CSP","全186件の未実装分と午後任意選択UI"],
};
