import type {Legacy2018NumericReview} from "./legacy-2018-review";
export const legacy2018TechnicalCircuitReview:Legacy2018NumericReview[]=[{collection:"2018h30h-fe-am",number:23,page:13,title:"真理値表に一致する3入力多数決回路",answer:"ア",reference:[0,0,0],choices:["AB/BC/ACのAND→OR→OR","AB/BC/ACのXOR→OR→OR","AB/BC/ACのOR→AND→NAND","AB/BC/ACのXOR→AND→NAND"],premises:["真理値表に示す3入力多数決回路","入力A/B/Cと出力Yの二段見出し","000から111の全8行","各回路は5ゲート/三つの入力対/2段合成","原全4図を維持し表だけ別の関数へ変えない"],precision:"真理値8状態は全列挙。丸め/計算負担の拡大なし。全4回路の8ビットの真理値を互いにも比較し同義誤答を拒否。",materialReview:"原物理p13と別紙公式解答p1を画像照合。IPAの設問/真理値表/論理回路図で、第三者図の引用・規格本文・写真は確認しなかった。原図の媒体を保持した管理図への置換を改変と記録し、原画像は問題単位で切出す。"}];
export const legacy2018TechnicalCircuitFacts={
 stem:"真理値表に示す3入力多数決回路はどれか。",
 truth:[0,0,0,1,0,1,1,1],
 originalGateNames:[["AND","AND","AND","OR","OR"],["XOR","XOR","XOR","OR","OR"],["OR","OR","OR","AND","NAND"],["XOR","XOR","XOR","AND","NAND"]],
 changedGateNames:[["XOR","XOR","XOR","OR","NAND"],["OR","OR","OR","XOR","NAND"],["XOR","XOR","XOR","OR","XOR"]],
 originalTruth:[[0,0,0,1,0,1,1,1],[0,1,1,1,1,1,1,0],[1,1,1,0,1,0,0,0],[1,1,1,1,1,1,1,1]],
 shapes:{AND:"M 0 0 L 42 0 A 30 30 0 0 1 42 60 L 0 60 Z",OR:"M 0 0 Q 42 0 72 30 Q 42 60 0 60 Q 18 30 0 0 Z",XOR:"M -10 0 Q 8 30 -10 60"},
 translations:[[210,50],[210,150],[210,250],[420,110],[600,165]],
 circuitLabels:[{text:"A",x:35,y:65,wire:"A-upper",endpoint:[55,65]},{text:"B",x:35,y:95,wire:"B-upper",endpoint:[55,95]},{text:"C",x:35,y:195,wire:"C-middle",endpoint:[55,195]},{text:"Y",x:738,y:195,wire:"output",endpoint:[720,195]}],
 tableHeaders:[{text:"入力",x:205,y:55},{text:"出力",x:385,y:55},{text:"A",x:115,y:105},{text:"B",x:205,y:105},{text:"C",x:295,y:105},{text:"Y",x:385,y:105}],
 tableHeaderRegions:{input:[70,30,340,80],output:[340,30,430,80],columnCenters:[115,205,295,385]},
 inputPaths:{"A-upper":"M 55 65 L 210 65","A-lower":"M 95 65 L 95 86 Q 78 95 95 104 L 95 186 Q 78 195 95 204 L 95 265 L 210 265","B-upper":"M 55 95 L 210 95","B-middle":"M 125 95 L 125 165 L 210 165","C-middle":"M 55 195 L 210 195","C-lower":"M 155 195 L 155 256 Q 138 265 155 274 L 155 295 L 210 295"},
};
