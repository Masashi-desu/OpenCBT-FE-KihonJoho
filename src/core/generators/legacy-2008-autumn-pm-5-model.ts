export const musicFields = [
  ['楽曲番号', '曲名', '演奏者名', '演奏時間', '制作会社', 'ジャンル', '楽曲データの大きさ', '楽曲データの格納場所'],
  ['会員番号', '暗号化したパスワード', '氏名', '入会日'],
  ['会員番号', 'ダウンロード日付', 'ダウンロード時刻', '楽曲番号'],
];
export const musicKeyCounts = [1, 1, 3];

export const musicCases = [
  { field: 'ジャンル', period: '1週間', limit: 'any', date: '2008-10-19',
    rows: [['クラシック', '23,456', '54'], ['ジャズ', '4,012', '130'], ['ポップス', '123,456', '434'], ['演歌', '34,567', '120'], ['民謡', '7,410', '87']] },
  { field: '演奏者名', period: '2週間', limit: 'once', date: '2008-11-09',
    rows: [['演奏者P', '412', '8'], ['演奏者Q', '321', '7'], ['演奏者R', '512', '9'], ['演奏者S', '194', '6'], ['演奏者T', '350', '7']] },
  { field: '制作会社', period: '10日間', limit: 'any', date: '2008-11-30',
    rows: [['制作会社U', '680', '19'], ['制作会社V', '780', '25'], ['制作会社W', '830', '32'], ['制作会社X', '410', '15'], ['制作会社Y', '390', '12']] },
  { field: 'ジャンル', period: '3週間', limit: 'once', date: '2008-12-21',
    rows: [['クラシック', '1,246', '44'], ['ジャズ', '893', '34'], ['ポップス', '2,500', '96'], ['演歌', '384', '18'], ['民謡', '512', '17']] },
] as const;

export const screenChoices = ['曲名', '演奏者名', '演奏時間', '制作会社', 'ジャンル'];
export const musicScreenResult = [
  ['852596', '情報処理の歌', 'i.n.f.o'],
  ['864295', 'THE情報処理', 'i.n.f.o'],
  ['959806', '君と情報処理', 'i.n.f.o'],
];

export const musicModules = [
  { key: 'all', label: '処理', parent: '' },
  { key: 'initial', label: '初期処理', parent: 'all' },
  { key: 'main', label: '主処理', parent: 'all' },
  { key: 'final', label: '終了処理', parent: 'all' },
  { key: 'login', label: 'ログイン処理', parent: 'main' },
  { key: 'download', label: 'ダウンロード処理', parent: 'main' },
  { key: 'logout', label: 'ログアウト処理', parent: 'main' },
  { key: 'credential', label: '会員番号と|パスワード入力', parent: 'login' },
  { key: 'member', label: '会員ファイル|の検索', parent: 'login' },
  { key: 'password', label: 'パスワード|の照合', parent: 'login' },
  { key: 'error', label: 'エラー処理', parent: 'login' },
  { key: 'select', label: '楽曲選択処理', parent: 'download' },
  { key: 'downloadMain', label: 'ダウンロード|主処理', parent: 'download' },
  { key: 'searchView', label: '楽曲検索画面|の表示', parent: 'select' },
  { key: 'songs', label: '楽曲管理ファイル|の検索', parent: 'select' },
  { key: 'selectView', label: '楽曲選択画面|の表示', parent: 'select' },
  { key: 'songDownload', label: '楽曲の|ダウンロード', parent: 'downloadMain' },
  { key: 'record', label: 'ダウンロード|実績ファイルへの|レコード追加', parent: 'downloadMain' },
] as const;
