/** Source answer sheet p.1, left column, read visually. Its right column's
 * unordered note belongs to Q10, never to Q4. */
export const sourceAnswers = ['イアオエオウ', 'イイイアエア', 'イウオウクウ', 'エオアエエオカ'];
export const bankSizes = [[4,4,5,4,5,5], [5,6,4,4,6,6], [6,9,7,7,8,7], [5,5,5,5,4,6,6]];

/** Truth criteria are independent of generator option positions. Use the
 * actual labels rendered in each bank, including the unused distractors. */
export const normalization = {
  'インデックスを設定': '検索経路',
  '第1正規化': '繰返し項目',
  '第2正規化': '部分関数従属',
  '第3正規化': '推移的関数従属',
  'セキュリティを強化': 'アクセス制御',
} as const;
export const migrationAggregate = {
  '選手ごとの対象数': '継続する選手ID',
  'チームごとの勝点': '結果表のチーム番号',
  'チームごとの総得点': '結果表のチーム番号',
  'チームごとの対象数': '試合日時点の所属',
  'リーグの総得点': '結果表を合計',
  'リーグの対象数': '打席表の該当行を数える',
} as const;
export const securityFacts = {
  keys: {
    '共通鍵': '同じ鍵で暗号化と復号',
    '受信側の公開鍵': '受信側が作った署名を検証',
    '受信側の秘密鍵': '受信側の署名作成',
    '送信側の公開鍵': '送信側が作った署名を検証',
    '送信側の秘密鍵': '送信側の署名作成',
  },
  layers: {
    'アプリケーション': 'HTTPなどのアプリケーションプロトコル',
    'データリンク': '隣接ノード間のフレーム',
    'トランスポート': 'TCP/UDP等の端点間制御',
    'ネットワーク': 'IPパケットの転送と経路選択',
  },
  outcomes: {
    'DoS攻撃の対策': '負荷や通信量の制限等',
    'ウイルス感染の検知': 'マルウェアの検査等',
    'セキュリティホールの修正': '脆弱な実装の修正',
    '送受信するデータの圧縮': '表現の冗長性の削減',
    '盗聴の対策': 'ペイロードの機密性',
    'なりすましの検知': '署名によるデータ出所の認証',
  },
} as const;
