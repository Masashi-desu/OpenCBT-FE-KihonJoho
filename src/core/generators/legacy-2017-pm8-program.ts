/** Original48 numbered lines, independently checked against the annual source fixture. No learner-supplied code is executed. */
export const legacy2017Pm8ProgramText=[
 "○副プログラム: ShortestPath(整数型: Distance[][], 整数型: nPoint, 整数型: sp, 整数型: dp, 整数型: sRoute[], 整数型: sDist)",
 "○整数型: pDist[nPoint], pRoute[nPoint]","○論理型: pFixed[nPoint]","○整数型: sPoint, i, j, newDist",
 "・sDist ← ∞ /* 出発地から目的地までの最短距離に初期値を格納する */",
 "■i: 0, i < nPoint, 1","・sRoute[i] ← −1 /* 最短経路上の地点の地点番号に初期値を格納する */",
 "・pDist[i] ← ∞ /* 出発地から各地点までの最短距離に初期値を格納する */","・pFixed[i] ← false /* 各地点の最短距離の確定状態に初期値を格納する */","■",
 "・pDist[sp] ← 0 /* 出発地から出発地自体への最短距離に0を設定する */","■true /* 最短経路探索処理 */","・i ← 0",
 "■i < nPoint /* 未確定の地点を一つ探す */","▲not(pFixed[i])","・break /* 最内側の繰返しから抜ける */","▼","・i ← i + 1","■",
 "▲i = nPoint /* 出発地から全ての地点までの最短距離が確定 */","・break /* していれば、最短経路探索処理を抜ける */","▼",
 "■j: i + 1, j < nPoint, 1 /* 最短距離がより短い地点を探す */","▲［a］ and pDist[j] < pDist[i]","・i ← j","▼","■",
 "・sPoint ← i","・pFixed[［b］] ← true /* 出発地からの最短距離を確定する */","■j: 0, j < nPoint, 1",
 "▲Distance[sPoint][j] > 0 and not(pFixed[j])","・newDist ← pDist[sPoint] + Distance[sPoint][j]","▲newDist < pDist[j]","・pDist[j] ← newDist","・pRoute[j] ← sPoint","▼","▼","■","■",
 "・sDist ← pDist[dp]","・j ← 0","・i ← dp","■i ≠ sp","・［c］ ← i","・i ← ［d］","・j ← j + 1","■","・［c］ ← sp",
];
export const legacy2017Pm8ProgramFrames={
 loops:[[6,10],[12,39],[14,19],[23,27],[30,38],[43,47]],conditions:[[15,17],[20,22],[24,26],[31,37],[33,36]],alpha:28,beta:39,blanks:{a:[24],b:[29],c:[44,48],d:[45]},
};

export const legacy2017Pm8ProgramDescription="ShortestPathの全48行。行6〜10、12〜39、14〜19、23〜27、30〜38、43〜47が繰返し。行15〜17、20〜22、24〜26、31〜37、33〜36が条件分岐。空欄aは行24、bは行29、cは行44と48、dは行45。αは行28、βは行39。"+legacy2017Pm8ProgramText.map((s,i)=>`${i+1}行 ${s}`).join("\n");
