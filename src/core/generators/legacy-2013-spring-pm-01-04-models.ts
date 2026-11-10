export const colorRows = [
  ['R', '赤（Red）', '100'], ['G', '緑（Green）', '010'], ['B', '青（Blue）', '001'],
  ['C', 'シアン（Cyan）', '011'], ['M', 'マゼンタ（Magenta）', '101'], ['Y', '黄（Yellow）', '110'],
  ['W', '白（White）', '111'], ['K', '黒（blacK）', '000'],
] as const;

export const colorCases = [
  { secondary: 'M', head: '011', bytes: ['23', 'D2', 'A4'], nth: 6, red: 1, other: 2, height: 600, width: 800, colors: 16 },
  { secondary: 'C', head: '110', bytes: ['C6', '39', 'A5'], nth: 3, red: 2, other: 1, height: 400, width: 600, colors: 16 },
  { secondary: 'Y', head: '101', bytes: ['96', 'A6', 'D3'], nth: 5, red: 2, other: 2, height: 400, width: 640, colors: 16 },
  { secondary: 'C', head: '100', bytes: ['73', '56', '5C'], nth: 4, red: 1, other: 3, height: 400, width: 600, colors: 4 },
] as const;

export const pageCases = [
  { trace: [1,4,3,2,1,4,5,1,4,3,2,5,1], resident: [1,2,3], requested: 4, policy: 'LRU', physical: [1,4] },
  { trace: [5,3,1,2,4,5,1,2,4,3,4,1,1], resident: [1,3,4], requested: 5, policy: 'LFU', physical: [4,3] },
  { trace: [1,3,4,1,4,5,2,1,5,1,3,2,4], resident: [2,4,5], requested: 1, policy: 'LIFO', physical: [2,5] },
  { trace: [1,1,2,5,4,3,1,2,4,5,1,3,4], resident: [1,2,5], requested: 3, policy: 'LRU', physical: [5,1] },
] as const;

export const memberCases = [
  { accruedUnit: '千円', thresholds: [10,20,30], rates: [5,15,30], year: 2012, month: 12, lastDay: 31, employee: '2008005', store: '02' },
  { accruedUnit: '500円', thresholds: [10,20,30], rates: [5,10,20], year: 2013, month: 11, lastDay: 30, employee: '2010012', store: '01' },
  { accruedUnit: '2,000円', thresholds: [5,10,20], rates: [5,15,25], year: 2014, month: 10, lastDay: 31, employee: '2011023', store: '03' },
  { accruedUnit: '千円', thresholds: [20,30,40], rates: [10,20,30], year: 2015, month: 11, lastDay: 30, employee: '2012008', store: '04' },
] as const;

export const securityCases = [
  { tries: 3, availableBetweenProjects: false },
  { tries: 2, availableBetweenProjects: true },
  { tries: 4, availableBetweenProjects: false },
  { tries: 5, availableBetweenProjects: true },
] as const;

type DatabaseTable = { title: string; columns: string[]; rows: string[][]; keys: number[] };

export function databaseTables(index: number, group: number): DatabaseTable[] {
  const input = memberCases[index];
  const memberColumns = ['会員番号', '氏名', '住所', '電話番号', '性別', '生年月日'];
  const memberValues = ['00001', '情報花子', '東京都文京区桜丘2-28', '03-1111-2222', '女性', '19870613'];
  if (group === 0) return [{ title: '', columns: memberColumns, rows: [memberValues], keys: [] }];
  if (group === 2) return [{
    title: '従業員表', columns: ['従業員コード', '氏名', '住所', '電話番号', '生年月日', '店舗コード'],
    rows: [[input.employee, '美容太郎', '東京都文京区青葉3丁目', '03-1234-5678', '19850105', input.store]], keys: [0],
  }];
  const visit = index === 0 ? '20130511' : String(input.year) + String(input.month).padStart(2, '0') + '11';
  return [
    { title: '会員表', columns: memberColumns, rows: [memberValues.map((value, i) => i === 4 ? '02' : value)], keys: [0] },
    { title: '店舗表', columns: ['店舗コード', '店舗名', '住所', '電話番号'], rows: [['01', '桜丘店', '東京都文京区桜丘1-2', '03-8888-9999']], keys: [0] },
    { title: 'メニュー表', columns: ['メニューコード', '商品名', '単価'], rows: [['001', 'カット', '5000'], ['002', 'パーマ', '5000']], keys: [0] },
    { title: '会計表', columns: ['会計コード', '会員番号', '店舗コード', '来店日', '会計金額'], rows: [['120001', '00001', '01', visit, '10000']], keys: [0] },
    { title: '明細表', columns: ['会計コード', 'メニューコード'], rows: [['120001', '001'], ['120001', '002']], keys: [0, 1] },
  ];
}

export function securityRules(index: number) {
  return [
    '社員及び協力社員は，プロジェクトに参画している期間中だけ開発室に入室可能とする。',
    'ICカードには，①耐タンパ性をもつものを使用し，ICカードIDだけを情報としてもつ。',
    '②入退室管理システムは入退室のログを収集する。',
    '入退室のログから，開発室又は執務室への入退室ごとの出入りした社員又は協力社員，日時，出入口が特定できる。',
    'パスワードは8桁の数字（00000000〜99999999）とする。',
    '有効期間中は，ICカードとパスワードによって開発室や執務室への入室ができる。',
    '入室時又はパスワードの変更時に，' + securityCases[index].tries + '回連続してパスワードを誤って入力した場合，開発室や執務室への入室はできなくなる。',
  ];
}

export function colorBitRows(index: number) {
  const { secondary } = colorCases[index];
  return colorRows.map(([mark, label, bits]) => [
    label, mark === secondary ? '［a］' : 'CMY'.includes(mark) ? '' : bits,
  ] as const);
}

export const userInfoExtra = ['（上記以外の利用者情報）', '氏名，有効期間の開始日，利用者区分，プロジェクト番号，パスワードなど'];

export function userInfoRows(index: number) {
  const { tries } = securityCases[index];
  return [
    ['利用者ID', '社員の場合は社員番号を設定し，協力社員の場合は契約時に個人ごとに付与される契約番号を設定する。'],
    ['ICカードID', 'ICカードを識別する一意のID'],
    ['ICカードの状態', '“仮パスワード”，“有効”，“返却”，“一時利用停止”のいずれかである。ICカードを発給したときは，“仮パスワード”を設定する。' + tries + '回連続してパスワードを誤って入力した場合，“一時利用停止”になる。'],
    ['入室許可の状態', '“開発室許可”，“執務室だけ許可”，“入室不可”のいずれかである。'],
    ['有効期間の終了日', '社員の場合は，退職予定の年月日を設定しておく。協力社員の場合は契約期間に基づいて契約終了予定の年月日を設定しておく。'],
  ];
}
