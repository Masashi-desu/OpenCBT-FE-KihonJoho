import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';

type Relation = { columns: string[]; key: string[] };
const relation = (columns: string[], key: string[]): Relation => ({ columns, key });

export function invoiceRelations(index: number) {
  const address = index === 3 ? '配送先住所' : '住所';
  const head = ['伝票番号', '日付', '顧客コード', ...(index === 3 ? [address] : [])];
  const customer = relation(['顧客コード', '顧客名', ...(index === 3 ? [] : [address])], ['顧客コード']);
  const details = ['伝票番号', '商品コード', ...(index === 1 ? ['単位'] : []), '数量', ...(index === 2 ? ['単価'] : [])];
  const product = relation(['商品コード', ...(index === 1 ? [] : ['単位']), ...(index === 2 ? [] : ['単価'])], ['商品コード']);
  const header = relation(head, ['伝票番号']);
  const line = relation(details, ['伝票番号', '商品コード']);
  const mergedCustomer = relation(['伝票番号', '日付', '顧客コード', '顧客名', address], ['伝票番号']);
  const rows = [
    [relation(head.filter(column => column !== '日付'), ['伝票番号']), customer,
      relation(['伝票番号', '日付', ...details.slice(1)], ['伝票番号', '日付', '商品コード']), product],
    [header, customer, line, product],
    [mergedCustomer, line, product],
    [mergedCustomer, relation(['伝票番号', '商品コード', '単位', '数量', '単価'], ['伝票番号', '商品コード'])],
  ];
  return [[0, 1, 2, 3], [1, 0, 2, 3], [0, 2, 1, 3], [0, 2, 3, 1]][index].map(position => rows[position]);
}

export function invoiceInput(index: number) {
  return {
    header: relation(['伝票番号', '日付', '顧客コード', '顧客名', index === 3 ? '配送先住所' : '住所'], ['伝票番号']),
    repeated: ['商品コード', '単位', '数量', '単価'],
  };
}

export function customerData(index: number) {
  return [
    { title: '顧客データ', columns: ['顧客', '氏名', index === 2 ? '居住地域' : '性別', index === 3 ? '居住地域' : '生年月日'] },
    { title: index === 1 ? '販売代理店の売場別販売データ' : '販売代理店の日別販売データ',
      columns: ['販売代理店', index === 1 ? '売場' : '日付', '商品', '販売数量'] },
    { title: '顧客の商品購入データ', columns: ['顧客', '販売代理店', '商品', '販売数量'] },
  ];
}

export const firewallServices = [
  { server: 'Webサーバ', service: 'Webページの閲覧だけを社外に提供する', protocol: 'HTTP',
    explanation: 'Webページを閲覧するための要求と応答にHTTPを使う。ファイアウォールでインターネットからDMZへのHTTPの通過を禁止すると，公開Webページにアクセスできない。' },
  { server: 'ファイル転送サーバ', service: 'ファイル転送専用の制御接続を確立し，別のデータ接続で公開ファイルを取得するサービスだけを社外に提供する', protocol: 'FTP',
    explanation: 'ファイルの取得にはFTPの制御接続を確立する必要がある。FTPの通過をすべて禁止すると，制御接続を開始できず公開ファイルを取得できない。' },
  { server: 'メールサーバ', service: '社外のメールサーバから電子メールを受け付けるサービスだけを提供する', protocol: 'SMTP',
    explanation: '外部のメールサーバからDMZ内のメールサーバへの配送にはSMTPを使う。SMTPを禁止すると外部からの電子メールを受信できない。' },
  { server: '管理対象機器', service: '特定の社外保守委託先の監視装置だけが，DMZの機器からMIBの管理情報を取得できるようにする', protocol: 'SNMP',
    explanation: 'MIBの管理情報はSNMPで取得する。すべてのSNMPを禁止すると監視できなくなるため，許可した送信元から管理対象機器への通過が必要である。' },
];

export function fifoTransactions(index: number) {
  const numbers = [
    [[10, 100], [40, 120], [30, 0], [30, 140], [10, 110], [30, 0]],
    [[20, 90], [30, 110], [30, 0], [30, 130], [10, 100], [30, 0]],
    [[10, 130], [30, 110], [20, 0], [30, 90], [10, 140], [30, 0]],
    [[20, 140], [40, 120], [30, 0], [30, 100], [10, 130], [40, 0]],
  ][index];
  return numbers.map(([quantity, price], row) => ({
    day: [1, 4, 5, 7, 10, 30][row],
    type: ['繰越在庫', '購入', '払出し', '購入', '購入', '払出し'][row],
    quantity,
    price: price || undefined,
  }));
}

function bookletFigure(suffix: string, alt: BookletFigureDefinition['alt']): BookletFigureDefinition {
  return {
    profile: 'legacy-2008-autumn-am-' + suffix,
    domain: [[0, 3]],
    validate(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2008年度秋期旧午前の図の入力が範囲外です');
    },
    alt,
  };
}
const relationText = ({ columns, key }: Relation) => columns.map(column =>
  column + (key.includes(column) ? '（主キーの項目）' : '')).join('｜');

export const invoiceInputFigure = bookletFigure('57-repeating-invoice', ([index]) => {
  const { header, repeated } = invoiceInput(index);
  return relationText(header) + '｜#1｜#2｜#3｜…｜#n。#1から#nは繰返しで，各明細は' + repeated.join('｜') + '。';
});
export const invoiceChoiceFigures = [...'abcd'].map((letter, position) =>
  bookletFigure('57-relation-' + letter, ([index]) =>
    invoiceRelations(index)[position].map((row, rowIndex) => '関係' + (rowIndex + 1) + '：' + relationText(row)).join('。') + '。'));
export const customerDataFigure = bookletFigure('58-data-tables', ([index]) =>
  customerData(index).map(({ title, columns }) => title + '：' + columns.join('｜')).join('。') + '。');
export const firewallFigure = bookletFigure('66-firewall-topology', ([index]) =>
  'インターネットはファイアウォールに接続。ファイアウォールの右にはDMZのLANがあり，' +
  firewallServices[index].server + 'とDNSサーバが接続される。下には企業内ネットワークのLANがあり，複数のPCが接続される。');
export const fifoFigure = bookletFigure('72-inventory-transactions', ([index]) =>
  '列は日付｜商品Aの取引内容｜個数（個）｜単価（円）。' + fifoTransactions(index).map(row =>
    row.day + '日｜' + row.type + '｜' + row.quantity + '個｜' + (row.price === undefined ? '単価欄は斜線で該当なし' : row.price + '円')).join('。') + '。');

export const legacy2008AutumnAm5480Figures = [
  invoiceInputFigure, ...invoiceChoiceFigures, customerDataFigure, firewallFigure, fifoFigure,
];
