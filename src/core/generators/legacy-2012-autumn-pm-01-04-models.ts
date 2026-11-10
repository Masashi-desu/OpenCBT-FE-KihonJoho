export const processCases = [
  { initial: 5, add: 2, remove: 1, values: [4, 5, 6, 7], first: 1 },
  { initial: 9, add: 1, remove: 2, values: [7, 8, 9, 10], first: 2 },
  { initial: 12, add: 3, remove: 1, values: [11, 13, 14, 15], first: 1 },
  { initial: 16, add: 1, remove: 3, values: [13, 14, 15, 17], first: 2 },
] as const;

export const purchases = [
  { product: 'エコ鉛筆黒', category: '文具', minimum: 10, code: 'A0001', amount: '900', quantity: '20',
    x: [
      ['XK001', '情報商事株式会社', '東京都文京区桜坂2-28', '03-1111-2222'],
      ['XK022', '（株）情報商事', '神奈川県横浜市大湊1-5', '045-987-6543'],
    ], y: [
      ['0008', '情報商事', '新宿区青葉2丁目1番地', '03-1234-5678'],
      ['0105', '情報商事（株）', '文京区桜坂2丁目28番', '03-1111-2222'],
    ] },
  { product: 'エコボールペン青', category: '筆記具', minimum: 8, code: 'A0012', amount: '880', quantity: '16',
    x: [
      ['XK004', '緑野資材株式会社', '中町2丁目4番', '000-1234-1000'],
      ['XK038', '緑野資材販売（株）', '西町1丁目8番', '000-1234-2000'],
    ], y: [
      ['0028', '緑野物産', '東町1丁目8番', '000-1234-3000'],
      ['0118', '緑野資材株式会社', '中町2-4', '000-1234-4000'],
    ] },
  { product: '再生メモ帳', category: '紙製品', minimum: 12, code: 'A0025', amount: '720', quantity: '12',
    x: [
      ['XK006', '青葉紙業株式会社', '南町5丁目3番', '000-2345-1000'],
      ['XK055', '（株）青葉紙業', '西町3丁目6番', '000-2345-2000'],
    ], y: [
      ['0048', '青葉紙業販売', '北町3丁目6番', '000-2345-3000'],
      ['0127', '青葉紙業（株）', '南町5丁目3番', '000-2345-4000'],
    ] },
  { product: '詰替え消しゴム', category: '事務用品', minimum: 15, code: 'A0040', amount: '1320', quantity: '24',
    x: [
      ['XK009', '白川商事株式会社', '西町7丁目4番', '000-3456-1000'],
      ['XK083', '（株）白川商事', '南町5丁目8番', '000-3456-2000'],
    ], y: [
      ['0063', '白川商事', '北町5丁目8番', '000-3456-3000'],
      ['0187', '白川商事（株）', '西町7-4', '000-3456-1000'],
    ] },
] as const;

type PurchaseTable = { title: string; columns: string[]; keys: number[]; rows: string[][] };
export function purchaseTables(index: number, group: number): PurchaseTable[] {
  const data = purchases[index];
  const vendors = ['取引先コード', '社名', '所在地', '電話番号'];
  if (group > 0) {
    const [division, rows] = group === 1 ? ['X', data.x] as const : ['Y', data.y] as const;
    return [{ title: division + '事業部の取引先表', columns: vendors, keys: [0], rows: rows.map(row => [...row]) }];
  }
  return [
    { title: '取引先表', columns: vendors, keys: [0], rows: [[...data.x[0]]] },
    { title: '部表', columns: ['部コード', '部名'], keys: [0], rows: [['0001', 'X事業部営業部']] },
    { title: '商品表', columns: ['商品コード', '品目コード', '商品名', '定価'], keys: [0],
      rows: [[data.code, 'S01', data.product, index === 0 ? '50' : '70']] },
    { title: '品目表', columns: ['品目コード', '品目名'], keys: [0], rows: [['S01', data.category]] },
    { title: '発注表', columns: ['発注コード', '取引先コード', '部コード', '発注日', '納品日'], keys: [0],
      rows: [['120001', data.x[0][0], '0001', '20120110', '20120112']] },
    { title: '明細表', columns: ['発注コード', '商品コード', '数量', '購入額'], keys: [0, 1],
      rows: [['120001', data.code, data.quantity, data.amount], ['120001', 'A0027', '10', '1200']] },
  ];
}

export const mimeCases = [
  { sample: '© IPA 2012.', base64First: false, hiragana: 6, stem: 'case', opening: 1, closing: 2 },
  { sample: '© LAB 2013.', base64First: true, hiragana: 3, stem: 'part', opening: 0, closing: 1 },
  { sample: '© LAB 2014.', base64First: false, hiragana: 5, stem: 'item', opening: 2, closing: 0 },
  { sample: '© LAB 2015.', base64First: true, hiragana: 7, stem: 'text', opening: 2, closing: 1 },
] as const;

export function mimeLines(index: number) {
  const { stem, opening, closing } = mimeCases[index];
  const names = [stem + '1', stem + '2', stem + '3'];
  const lines = names.map((name, position) => position === opening ? '--' + name : position === closing ? '--' + name + '--' : name);
  return { names, lines };
}

export const incidents = [
  { product: '自転車用品', company: 'D', input: '利用者IDとパスワードの入力を行うログイン', credentials: false },
  { product: '園芸用品', company: 'E', input: '会員が配送先の郵便番号を入力する住所検索', credentials: true },
  { product: '楽器用品', company: 'F', input: '会員が商品名を入力する在庫検索', credentials: false },
  { product: '登山用品', company: 'G', input: '会員が注文番号を入力する注文照会', credentials: true },
] as const;

export const incidentResponseRows = [
  ['会員', '① 全ての会員に対する謝罪\n② 事故の公表と被害状況の説明\n③ 会員への事故対応の依頼'],
  ['Webサイト', '④ 被害状況の把握及び原因の特定\n⑤ SQLインジェクション攻撃を防ぐためのWebサイトの改修\n⑥ Webサイトへのアクセスの常時監視\n⑦ ネットワークを介した攻撃によるネットワークアクセス負荷上昇に対応するためのネットワーク回線の二重化'],
] as const;
