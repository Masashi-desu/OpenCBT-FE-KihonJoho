/** Exact reviewed source locator/answer metadata. No AM or autumn table and no content approval. */
export type Legacy2019SlotKey = { subquestion: number; slot: string; answer: string | null };
function slots(groups: readonly (readonly [number, string, string])[]): Legacy2019SlotKey[] {
  return groups.flatMap(([subquestion, labels, answers]) => {
    if (labels.length !== answers.length) throw new Error("Frozen source key mismatch");
    return [...labels].map((slot, i) => ({ subquestion, slot: slot === "-" ? "" : slot, answer: answers[i] === "×" ? null : answers[i] }));
  });
}
export const legacy2019Afternoon={"2019h31h-fe-pm": [
    { number: 1, pages: [5,8], title: "クラウドサービスの利用者認証", slots: slots([[1,"abc","カイウ"],[2,"de","エイ"]]) },
    { number: 2, pages: [9,12], title: "ページング方式の仮想記憶", slots: slots([[1,"a","ウ"],[2,"bc","エア"],[3,"de","アエ"]]) },
    { number: 3, pages: [13,17], title: "定期健康診断の関係データベース", slots: slots([[1,"abc","アウア"],[2,"de","エウ"],[3,"f","ア"]]) },
    { number: 4, pages: [18,22], title: "eラーニングシステムの負荷分散", slots: slots([[1,"abc","イアウ"],[2,"-","ア"],[3,"-","イ"]]) },
    { number: 5, pages: [23,29], title: "農産物の検査管理WebAPI", slots: slots([[1,"abc","カオエ"],[2,"d","イ"],[3,"e","オ"]]) },
    { number: 6, pages: [30,34], title: "仕様変更の取扱手順とコスト", slots: slots([[1,"ab","エイ"],[2,"cdefgh","キアウオエイ"]]) },
    { number: 7, pages: [35,38], title: "製造業の情報システム統合", slots: slots([[1,"abcd","アイアウ"],[2,"ef","ウウ"],[3,"g","イ"]]), unordered: [["1-c", "1-d"]] },
    { number: 8, pages: [39,46], title: "ハフマン符号による文字列圧縮", slots: slots([[1,"ab","アイ"],[2,"cd","ウエ"],[3,"ef","オイ"]]) },
    { number: 9, pages: [47,51], title: "C言語の文字コード出現回数集計", slots: slots([[1,"abc","イカイ"],[2,"defg","ウエイイ"]]) },
    { number: 10, pages: [52,57], title: "COBOLのテスト順位リスト", slots: slots([[1,"abcd","エアイカ"],[2,"ef","エア"]]) },
    { number: 11, pages: [58,63], title: "Javaによる迷路の駒操作", slots: slots([[1,"abcd","ウアエア"],[2,"ef","ウウ"]]), appendixPages: [77,78] },
    { number: 12, pages: [64,68], title: "CASL IIのビット領域操作", slots: slots([[1,"abcd","オオオカ"],[2,"ef","イオ"]]), appendixPages: [79,80,81,82,83,84] },
    { number: 13, pages: [69,76], title: "表計算の会員別販売集計", slots: slots([[1,"abc","カウウ"],[2,"def","オオイ"]]), appendixPages: [85,86,87,88,89,90] },
  ]} as const;
