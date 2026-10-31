/** Manually frozen from the original page images and the official answer sheets.
 * This file does not import generator data or calculate expected source answers.
 * Current review: one agent, 2026-10-19; no external review is claimed.
 */
export const legacy2019QuantitativeReview = [
  { source: "2019h31h-fe-am-1", page: 3, answer: "ウ", choices: ["0.001011", "0.001101", "0.00111", "0.0111"], reference: [7, 5], form: "正の十進除算の結果を二進有限小数から選ぶ", prerequisites: ["10進数", "2進数"], media: ["paragraph"] },
  { source: "2019h31h-fe-am-2", page: 3, answer: "ウ", choices: ["16進数0FとのANDをとる。", "16進数0FとのORをとる。", "16進数7FとのANDをとる。", "16進数FFとのXOR（排他論理和）をとる。"], reference: [7, 4], form: "パリティ以外の下位ビットを抽出する演算を選ぶ", prerequisites: ["最上位", "パリティビット", "下位7ビット"], media: ["paragraph"] },
  { source: "2019h31h-fe-am-6", page: 5, answer: "ア", choices: ["[1, 2, 3, 1, 2, 3]", "[1, 2, 3, 3, 2, 1]", "[3, 2, 1, 1, 2, 3]", "[3, 2, 1, 3, 2, 1]"], reference: [1, 1], form: "同一初期状態の三スタック・再帰処理後のBの全状態を選ぶ", prerequisites: ["いずれの初期状態", "push", "[a₁, a₂, …, aₙ₋₁, aₙ]"], media: ["paragraph", "code"] },
  { source: "2019h31h-fe-am-11", page: 7, answer: "エ", choices: ["8", "9", "12", "16"], reference: [4, 1], form: "正方フォントの縦ドット数を問う", prerequisites: ["正方フォント", "1ポイントは1/72インチ"], media: ["paragraph"] },
  { source: "2019h31h-fe-am-25", page: 12, answer: "ウ", choices: ["77", "96", "775", "969"], reference: [4, 1], form: "固定容量に記録できる音声の最大整数分を問う", prerequisites: ["8ビット", "×10⁶バイト", "最大何分"], media: ["paragraph"] },
  { source: "2019h31h-fe-am-49", page: 22, answer: "ア", choices: ["640", "1280", "1600", "6400"], reference: [2, 4, 2, 2, 2], form: "初年度に影響度大のみを修正する費用期待値を問う", prerequisites: ["初年度", "影響度大の不良だけ", "年間発見率", "影響度小"], media: ["paragraph", "list"] },
  { source: "2019h31h-fe-am-54", page: 24, answer: "イ", choices: ["8", "9", "12", "13"], reference: [1, 1, 8], form: "工数表と設計テスト倍率から最少整数人を問う", prerequisites: ["少なくとも何人", "コーディングのほかに", "設計及びテスト"], media: ["paragraph", "table"] },
  { source: "2019h31h-fe-am-78", page: 34, answer: "エ", choices: ["800", "1500", "1600", "2400"], reference: [1, 1, 2, 3], form: "五商品の需要・仕入・利益表から機会損失を合計", prerequisites: ["機会損失", "何千円"], media: ["paragraph", "table"] },
  { source: "2019r01a-fe-am-2", page: 3, answer: "ウ", choices: ["16進表記00のビット列と排他的論理和をとる。", "16進表記00のビット列と論理積をとる。", "16進表記FFのビット列と排他的論理和をとる。", "16進表記FFのビット列と論理積をとる。"], reference: [2], form: "全ビットを反転する演算を選ぶ", prerequisites: ["8ビット", "全ビットを反転"], media: ["paragraph"] },
  { source: "2019r01a-fe-am-6", page: 6, answer: "ウ", choices: ["1/100", "1/20", "1/10", "1/5"], reference: [1, 0], form: "独立な一様整数乱数二つの差の確率", prerequisites: ["0以上n未満", "一様な確率", "整数型"], media: ["paragraph", "code"] },
  { source: "2019r01a-fe-am-12", page: 8, answer: "エ", choices: ["125", "250", "80000", "125000"], reference: [1, 1], form: "GHzと平均CPIから一秒当たりの万命令数を問う", prerequisites: ["1命令を平均", "1秒間", "何万命令"], media: ["paragraph"] },
  { source: "2019r01a-fe-am-16", page: 10, answer: "ウ", choices: ["0.09", "0.10", "0.18", "0.19"], reference: [9], form: "同じ二台の並列・直列構成の稼働率の差", prerequisites: ["少なくともいずれか一方", "2台とも", "処理装置以外の要因は考慮しない"], media: ["paragraph"] },
  { source: "2019r01a-fe-am-30", page: 17, answer: "エ", choices: ["1.2", "6.4", "8.0", "9.6"], reference: [1, 0, 0], form: "20%制御情報を付加した周期転送の回線利用率", prerequisites: ["20%が制御情報として付加", "1Mビット=10⁶ビット"], media: ["paragraph"] },
  { source: "2019r01a-fe-am-54", page: 27, answer: "イ", choices: ["12", "21", "22", "42"], reference: [10, 2], form: "増員前後の一対一打合せ回数の差", prerequisites: ["1対1", "他の全てのメンバと1回ずつ"], media: ["paragraph", "list"] },
] as const;

export const legacy2019QuantitativeCapacities = {
  "2019h31h-fe-am-1": 7, "2019h31h-fe-am-2": 9, "2019h31h-fe-am-6": 9,
  "2019h31h-fe-am-11": 8, "2019h31h-fe-am-25": 12, "2019h31h-fe-am-49": 324,
  "2019h31h-fe-am-54": 27, "2019h31h-fe-am-78": 79, "2019r01a-fe-am-2": 3,
  "2019r01a-fe-am-6": 9, "2019r01a-fe-am-12": 9, "2019r01a-fe-am-16": 4,
  "2019r01a-fe-am-30": 12, "2019r01a-fe-am-54": 10,
} as const;

export const legacy2019QuantitativePaperHashes = {
  springQuestions: "55210d293f5fd96673cc1131acea3f8237209b4599d95d48bad02964abe62eb6",
  springAnswers: "0f871ce45cf3824b208591be14f7898b21bf4109b59aa82833d3693302f033df",
  autumnQuestions: "4cd404654bb4f465befc78a3ac44c79bcd0f019b12b68f93a38d9836710c7cb0",
  autumnAnswers: "074c4437b57dc5ba96b6f87da90d4b2fa905d436f4c606690010e1262f32e4e0",
} as const;
