/** Source baseline and proposed finite model review, fixed independently of
 * production implementations. All four source pages and answer sheets were
 * viewed; the generated SVG still needs the shared UI/browser integration.
 */
export const legacy2019AlgorithmReview = [
  { source: "2019h31h-fe-am-5", page: 4, reference: [0,0], answer: "イ", capacity: 16, media: ["paragraph"], prerequisites: ["2分探索木として適切", "数字1〜9", "各ノード（節）の値"] },
  { source: "2019h31h-fe-am-7", page: 6, reference: [0], answer: "エ", capacity: 6, media: ["paragraph","diagram"], prerequisites: ["最大公約数", "引き算の繰返し", "何回の比較"] },
  { source: "2019r01a-fe-am-4", page: 5, reference: [1,1], answer: "ア", capacity: 9, media: ["paragraph"], prerequisites: ["a≠0", "b≠0", "t>1", "g(t)/f(t)の極限"] },
  { source: "2019r01a-fe-am-8", page: 6, reference: [0], answer: "ウ", capacity: 8, media: ["paragraph"], prerequisites: ["最小限必要", "ポップ操作が実行されたときには必ず文字を出力", "スタック間の文字の移動は行わない"] },
] as const;

export const legacy2019GcdCases = [
  { A:876,B:204,comparisons:11 }, { A:720,B:252,comparisons:9 },
  { A:630,B:180,comparisons:5 }, { A:468,B:132,comparisons:10 },
  { A:924,B:252,comparisons:6 }, { A:936,B:204,comparisons:11 },
] as const;
export const legacy2019StackCases = ["STACK","TACKS","ACKST","TSKCA","CSATK","KATCS","SACKT","CKSTA"] as const;

/** Each entry lists root, two depth-one nodes, four depth-two nodes, and two
 * lower leaves. 'parent' specifies which depth-two node owns the lower leaves.
 * These values are a handwritten design record, not a generator dump.
 */
export const legacy2019ReviewedTrees = [
  [
    { values:[1,2,3,4,5,6,7,8,9],parent:5 },
    { values:[4,2,8,1,3,6,9,5,7],parent:5 },
    { values:[7,6,8,4,5,3,9,1,2],parent:5 },
    { values:[9,7,8,1,2,5,6,3,4],parent:5 },
  ],
  [
    { values:[6,4,8,2,5,7,9,1,3],parent:3 },
    { values:[4,3,8,1,2,6,9,5,7],parent:5 },
    { values:[7,6,8,4,5,3,9,1,2],parent:5 },
    { values:[9,7,8,1,2,5,6,3,4],parent:5 },
  ],
  [
    { values:[1,2,3,4,5,6,7,8,9],parent:5 },
    { values:[4,3,8,1,2,6,9,5,7],parent:5 },
    { values:[6,2,8,1,4,7,9,3,5],parent:4 },
    { values:[9,7,8,1,2,5,6,3,4],parent:5 },
  ],
  [
    { values:[1,2,3,4,5,6,7,8,9],parent:5 },
    { values:[4,3,8,1,2,6,9,5,7],parent:5 },
    { values:[7,6,8,4,5,3,9,1,2],parent:5 },
    { values:[4,2,6,1,3,5,8,7,9],parent:6 },
  ],
] as const;
