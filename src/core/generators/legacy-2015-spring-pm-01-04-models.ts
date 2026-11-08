export const routes = [
  ['取引先PC', 'FW3'], ['FW3', 'FW1'], ['FW1', 'RPS'], ['FW1', 'FW2'], ['FW2', 'Webサーバ'],
] as const;

export const jitCases = [
  { calls: 400, compileAt: 101, staticCount: 400, dynamicCount: 2000, interpretNs: 500, compiledNs: 10, startMs: 100, compileMsPerThousand: 100 },
  { calls: 500, compileAt: 121, staticCount: 500, dynamicCount: 2500, interpretNs: 400, compiledNs: 20, startMs: 100, compileMsPerThousand: 100 },
  { calls: 300, compileAt: 81, staticCount: 600, dynamicCount: 5000, interpretNs: 200, compiledNs: 20, startMs: 80, compileMsPerThousand: 100 },
  { calls: 200, compileAt: 121, staticCount: 400, dynamicCount: 2000, interpretNs: 500, compiledNs: 25, startMs: 100, compileMsPerThousand: 100 },
] as const;

export const birthCases = [
  { year: 1940, from: 20030402, to: 20090401 },
  { year: 1950, from: 20020402, to: 20080401 },
  { year: 1960, from: 20040402, to: 20100401 },
] as const;

export const reportRows = [
  ['取引先の担当者が別の取引先の発注情報や出荷情報にアクセス可能である。', null],
  ['取引先の担当者がWebサーバ上の任意のファイルをダウンロード可能である。', '①受注管理アプリケーションでのファイルのダウンロード処理に問題がある。'],
  ['攻撃者によってWebページ内にスクリプトが埋め込まれてしまう［b］の脆弱性があるので，取引先の担当者が他のWebサイトに誘導されて，利用者IDとパスワードを奪取される可能性がある。', null],
  [null, '②取引先の担当者がログイン時にパスワードを連続して間違えても利用者IDがロックされない。'],
] as const;

export const localDnsHosts = [
  'mail.example.co.jp', 'www.example.co.jp', 'www.bunkyo.example.co.jp',
  'www.minato.example.co.jp', 'mail.corp', 'www.corp',
];

export type SourceTable = { name: string; columns: string[]; rows: string[][]; primary?: number; widths: number[] };
export const householdTables: SourceTable[] = [
  {
    name: '世帯主', columns: ['氏名', '住所', '電話番号', '登録日', '班'], widths: [100,150,134,134,45],
    rows: [['情報太郎', '桜ヶ丘３０４－８', '999-999-9999', '2005年4月7日', '2']],
  },
  {
    name: '世帯情報', columns: ['氏名', '続柄', '性別', '生年月日', '備考'], widths: [100,105,70,158,130],
    rows: [
      ['情報太郎', '本人', '男', '1969年1月23日', ''],
      ['情報花子', '配偶者', '女', '1972年8月24日', ''],
      ['情報一郎', '子', '男', '2004年6月13日', ''],
      ['情報二郎', '子', '男', '2007年1月5日', ''],
      ['', '', '', '', ''],
    ],
  },
];
const continuation = (n: number) => Array<string>(n).fill('⋮');
export const relationTables: SourceTable[] = [
  {
    name: '世帯表', columns: ['世帯番号', '世帯主番号', '住所', '電話番号', '登録日', '班'], primary: 0,
    rows: [['0181', '0412', '桜ヶ丘３０４－８', '999-999-9999', '20050407', '02'], continuation(6)],
    widths: [83, 92, 147, 131, 86, 53],
  },
  {
    name: '会員表', columns: ['会員番号', '世帯番号', '氏名', '続柄', '性別', '生年月日', '備考'], primary: 0,
    rows: [['0412', '0181', '情報太郎', '01', '01', '19690123', ''], ['0413', '0181', '情報花子', '02', '02', '19720824', ''], continuation(7)],
    widths: [84, 86, 101, 58, 55, 92, 116],
  },
  {
    name: '続柄表', columns: ['続柄', '名称'], primary: 0, widths: [66, 88],
    rows: [['01', '本人'], ['02', '配偶者'], continuation(2)],
  },
  {
    name: '性別表', columns: ['性別', '名称'], primary: 0, widths: [66, 88],
    rows: [['01', '男性'], ['02', '女性']],
  },
];
export const childrenTable: SourceTable = {
  name: '子供会表', columns: ['会員番号', '世帯番号', '電話番号', '氏名', '生年月日'], widths: [90,90,130,100,99],
  rows: [['0414', '0181', '999-999-9999', '情報一郎', '20040613'], ['0415', '0181', '999-999-9999', '情報二郎', '20070105'], continuation(5)],
};

export const dnsSteps = [
  [0, 1, 'IPアドレスの問合せ', '（www.bunkyo）', false],
  [1, 2, 'IPアドレスの問合せ', '（www.bunkyo）', false],
  [2, 1, 'エラーを返す（見つからない）', '', true],
  [1, 2, 'IPアドレスの問合せ', '（www.bunkyo.example.co.jp）', false],
  [2, 1, 'www.bunkyo.example.co.jpの', 'IPアドレスを返す', true],
  [1, 0, 'www.bunkyo.example.co.jpの', 'IPアドレスを返す', true],
] as const;
