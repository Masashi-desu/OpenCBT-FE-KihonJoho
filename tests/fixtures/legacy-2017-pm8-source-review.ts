/** Fixed source transcription review. Candidate/material decisions are recorded separately.
 * All question physical35–40/common3–4/cover1–2 and answerphysical1 read.
 * Notes stay scoped to 2017spring PM8, never all annual appendices. */
export const legacy2017Pm8SourceReview={
 source:"2017h29h-fe-pm-8",title:"最短経路の探索",pages:[35,36,37,38,39,40],commonPages:[3,4],answerPage:1,
 status:"complete_major_locally_verified_shared_integration_and_parent_review_pending",
 required:true,minutes:150,annualSelection:"問1/8必須、問2〜7から4、問9〜13から1の7大問。現行B20問とは区別。",
 sourceAnswer:["イ","オ","キ","イ","イ","カ","ア"],
 labels:["設問1 a","設問1 b","設問1 c","設問1 d","設問2 e","設問2 f","設問2 g"],
 choiceCounts:[4,5,8,8,5,6,6],
 premises:["N>1","spからdpへの経路は少なくとも一つ存在","地点番号と配列の要素番号は0から","経路は双方向","Distance[i][i]=0、隣接しない場合は−1","∞は最大値を表す定数","sDistの初期値∞","sRouteは全要素−1","pDistは全要素∞","pFixedは全要素false、最短距離確定でtrue","pDist[sp]=0","未確定から最小pDistを選ぶ","同距離は厳密な小なり比較なので最初の小番号が残る","Distance>0かつ未確定の隣接点だけ緩和","短くなったときだけpDist/pRoute更新","pRouteは直前の経由地点を表す","最短路の地点番号は目的地から出発地まで逆順でsRouteへ","設問2だけpRouteの全初期値を0とする","αは行28のsPoint代入値、βは行30〜38実行直後","cは行44と48の両空欄に同じ式を入れる"],
 materialObservation:"当該6頁と共通2頁の全図表/疑似言語/注記に第三者出典やJIS/CASL/API文言の具体的転載は現時点で特定しない。利用条件判断はlegacy-2017-pm8-material-review.jsonへ分離。付録/他大問へ拡張せず、未登録候補を公開又は配布readyに数えない。",
} as const;
export const legacy2017Pm8OriginalEdges=[[0,1,2],[0,2,8],[0,3,4],[1,4,3],[2,4,2],[2,5,3],[3,5,8],[4,6,9],[5,6,3]] as const;
/** Reviewed finite, non-proportional real weight conditions. These are not
 * additional public questions or independently registered generation capacity.
 * Positions correspond to the nine source edges above; labels stay 0..6. */
export const legacy2017Pm8ReviewedWeightConditions=[
 [2,8,4,3,2,3,8,9,3],
 [2,8,4,2,2,3,8,9,3],
 [2,9,4,3,2,2,8,8,3],
 [3,9,5,3,2,3,8,9,4],
 [2,9,5,4,2,3,8,9,2],
 [3,9,5,4,1,3,9,8,3],
 [2,8,4,3,1,3,9,8,3],
 [2,8,5,3,2,3,8,9,3],
] as const;
export const legacy2017Pm8OriginalMatrix=[
 [0,2,8,4,-1,-1,-1],[2,0,-1,-1,3,-1,-1],[8,-1,0,-1,2,3,-1],[4,-1,-1,0,-1,8,-1],[-1,3,2,-1,0,-1,9],[-1,-1,3,8,-1,0,3],[-1,-1,-1,-1,9,3,0],
];
export const legacy2017Pm8OriginalChoices={
 a:["not(pFixed[i])","not(pFixed[j])","pFixed[i]","pFixed[j]"],b:["dp","nPoint","nPoint − 1","sp","sPoint"],
 cd:["pRoute[dp]","pRoute[i]","pRoute[j]","pRoute[sp]","sRoute[dp]","sRoute[i]","sRoute[j]","sRoute[sp]"],
 e:[2,3,4,5,6],
 f:[[0,2,8,4,5,10,14],[0,2,8,4,5,10,Infinity],[0,2,8,4,5,11,14],[0,2,8,4,5,11,Infinity],[0,2,8,4,5,12,14],[0,2,8,4,5,12,Infinity]],
 g:[[0,0,0,0,1,3,0],[0,0,0,0,1,3,5],[0,0,0,0,2,2,0],[0,0,0,0,2,2,5],[0,0,4,0,1,2,0],[0,0,4,0,2,2,5]],
};
export const legacy2017Pm8OriginalProgram=[
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
/** Numbered blocks, nesting and marker positions must accompany this text;
 * this string array alone is not the finished source-format rendering. */
export const legacy2017Pm8ProgramControls={
 loops:[[6,10],[12,39],[14,19],[23,27],[30,38],[43,47]],conditions:[[15,17],[20,22],[24,26],[31,37],[33,36]],alpha:28,beta:39,blanks:{a:[24],b:[29],c:[44,48],d:[45]},
};
