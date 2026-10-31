/** Source p12 manually traced, including every tied input and output bubble.
 * Numeric geometry for the new drawing is separately fixed for label/pin checks. */
export const legacy2018AutumnNandFacts={
 source:"2018h30a-fe-am-22",physicalPage:12,answer:"イ",reference:[0],targets:["NAND","AND","OR","NOR"],originalGateCounts:[3,5,8,10],
 shape:"M 0 -25 L 30 -25 A 25 25 0 0 1 30 25 L 0 25 Z",bubble:[60,0,5],inputOffsets:[-12,12],outputOffset:65,
 shortInputYs:[50,80,170,200],tallInputYs:[40,140,240,340],visibleInputX:15,wireStartX:30,
 basePositions:[[[90,65],[90,185],[240,125]],[[90,65],[90,185],[240,65],[240,185],[390,125]],[[90,40],[90,140],[90,240],[90,340],[240,90],[240,290],[400,190],[520,190]],[[90,40],[90,140],[90,240],[90,340],[240,90],[240,290],[360,90],[360,290],[480,190],[600,190]]],
 baseInputs:[[["A","B"],["C","D"],["g1","g2"]],[["A","B"],["C","D"],["g1","g1"],["g2","g2"],["g3","g4"]],[["A","A"],["B","B"],["C","C"],["D","D"],["g1","g2"],["g3","g4"],["g5","g6"],["g7","g7"]],[["A","A"],["B","B"],["C","C"],["D","D"],["g1","g2"],["g3","g4"],["g5","g5"],["g6","g6"],["g7","g8"],["g9","g9"]]],
 originalRoles:["AB+CD。4入力NANDとは0000等で不一致。","AB/CDを作って最後にNAND。原の唯一の一致回路。","(A+B)(C+D)。AND4/OR4とは区別する。","NOR4。NAND4とは0010等で不一致。"],
 changes:"全4原回路を基準として固定。ANDでは2番目末尾へNAND反転器1個を追加し、ORでは4番目末尾のNAND反転器1個を外す。その他の全入力・素子・配線を保持する。生成図だけ入力A/B/C/Dと出力Yを明示し、元の入力順への定義を解答前に置く。",
};
