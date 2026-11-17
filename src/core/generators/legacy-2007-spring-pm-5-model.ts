export const mergeCases = [
  { width:5, update:'U', remove:'D', order:'昇順', orderTime:'発生日時' },
  { width:4, update:'A', remove:'R', order:'昇順', orderTime:'受付日時' },
  { width:6, update:'M', remove:'X', order:'降順', orderTime:'依頼日時' },
  { width:3, update:'C', remove:'E', order:'降順', orderTime:'記録日時' },
] as const;
export const fields = ['会員番号','名前','電子メールアドレス','サービス等級'];
