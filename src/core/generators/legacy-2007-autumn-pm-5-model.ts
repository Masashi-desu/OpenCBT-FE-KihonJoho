export const saleCases = [
  { maximum: 10, selection: '最新', cutoff: '以降', order: '新しい', existing: false },
  { maximum: 8, selection: '最古', cutoff: '以降', order: '新しい', existing: false },
  { maximum: 12, selection: '最高額', cutoff: '以降', order: '古い', existing: true },
  { maximum: 6, selection: '最低額', cutoff: '以前', order: '古い', existing: false },
] as const;
export const saleSchema = [
  { name: '商品表', fields: ['商品コード', '商品名', '商品カテゴリ', '登録日時', '商品価格'], keys: 1 },
  { name: '購入表', fields: ['購入番号', '購入日時', '会員 ID', '購入金額'], keys: 1 },
  { name: '購入明細表', fields: ['購入番号', '商品コード', '購入数量'], keys: 2 },
] as const;

export const newSaleFlow = (index: number) => {
  const { selection } = saleCases[index];
  return [
    ['開始'], ['会員 ID'], [selection + '購入実績', 'の抽出'], ['中間表 A'], ['商品カテゴリ', 'の抽出'],
    ['中間表 B'], ['登録商品', 'の抽出'], ['中間表 C'], ['新規登録商品', 'の表示'], ['新規商品', 'データ'], ['終了'],
  ];
};
export const relatedSaleFlow = (index: number) => {
  const { existing } = saleCases[index];
  return [
    ['開始'], ['検索した', '商品コード', 'と会員 ID'], ['購入番号', 'の抽出'], ['中間表 D'], ['同時購入商品', 'の抽出'],
    ['中間表 E'], ['検索した商品', 'の削除'], ['中間表 F'], ['関連商品', 'の抽出'], ['中間表 G'],
    [existing ? '未購入商品' : '購入済商品', 'の削除'], ['中間表 H'], ['関連商品', 'の表示'], ['関連商品', 'データ'], ['終了'],
  ];
};
export const relatedFlowNotes = [
  ['商品コードで検索し，', '会員 ID が異なるすべて', 'の購入番号を取り出す。'],
  ['購入番号で検索し，', '同じ値の購入番号の', 'レコードを取り出す。'],
  ['商品コードを突き合わせ，', '検索した商品コードと同じ', '商品コードをもつレコード', 'をすべて取り除く。'],
  ['商品コードで検索し，', '一致したレコードを', '取り出す。'],
] as const;
