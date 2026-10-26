/** Release-scoped projection of the frozen official 2017 spring PM review.
 * The complete feature-side review stays unchanged; physical pages.
 * Inventory/answer-table review is separate from full semantic/material review.
 */
export const legacy2017PaperReview = {
  checkedOn: "2026-10-19",
  listedAt: "https://www.ipa.go.jp/shiken/mondai-kaiotu/2017h29.html",
  listingPublishedOn: "2017-10-15", listingUpdatedOn: "2018-01-12",
  attachmentDateNote: "年度ページの公開/更新日を個別添付PDFの公開/更新日へ転用しない。添付別の明記は未確認。",
  terms: "https://www.ipa.go.jp/shiken/faq.html",
  selection: { afternoon: { minutes: 150, required: [1,8], chooseFourFrom: [2,3,4,5,6,7], chooseOneFrom: [9,10,11,12,13], answeredMajorQuestions: 7 } },
  papers: {
    "2017h29h-fe-pm": {questionSha256:"7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8",answerSha256:"7d83ed5839b533c1a2bc804698e08eb6bb55865ef1aef3f74e15c42faad7772b",pages:88,count:13},
  },
  limits:"2017春期・旧午後の冊子同定と表紙の方式だけを対象とする。個別本文・生成器・素材条件・表示は問題別の査読記録で確認し、他の冊子や未確認のJIS文字符号表へ拡張しない。",
};
export type Legacy2017Collection = keyof typeof legacy2017PaperReview.papers;
