import type {StudyTerm} from '../study-acronyms';
export const legacy2018SpringPm2StudyTerms:StudyTerm[]=[
 {term:'AND',expansion:'Logical AND',meaning:'論理積。二つの入力がともに1のときだけ1となる。半加算器の桁上がりCを表す。'},
 {term:'OR',expansion:'Logical OR',meaning:'論理和。少なくとも片方の入力が1のとき1となる。両方が1のときも1であり、XORと異なる。'},
 {term:'NAND',expansion:'NOT AND',meaning:'否定論理積。ANDの出力を否定したもので、二つの入力がともに1のときだけ0となる。'},
 {term:'NOR',expansion:'NOT OR',meaning:'否定論理和。ORの出力を否定したもので、二つの入力がともに0のときだけ1となる。'},
 {term:'XOR',expansion:'Exclusive OR',meaning:'排他的論理和。二つの入力が異なるとき1となる。半加算器の和の下位桁Zを表す。'},
 {term:'XNOR',expansion:'Exclusive NOR',meaning:'XORの出力を否定したもので、二つの入力が等しいとき1となる。生成条件で目標とする演算が変わっても、半加算器の和と桁上がりの役割は変えない。'},
 {term:'半加算器',meaning:'1桁の二進数X、Yを加え、和の下位桁Zと桁上がりCを出力する回路。入力11の結果は10となる。'},
 {term:'しきい値',meaning:'加重和と比較する境界の値。本問ではWx×X＋Wy×YがT以上なら出力1、T未満なら0である。ちょうどTと等しい場合を0にしない。'},
 {term:'接続点と交差',meaning:'図中の黒丸は配線の接続を表し、橋形に迂回した交差は接続しない。各入力を二つのゲートへ分岐する部分と、線が交差するだけの部分を区別する。'},
].map(term=>({...term,sources:['2018h30h-fe-pm-2']}));
