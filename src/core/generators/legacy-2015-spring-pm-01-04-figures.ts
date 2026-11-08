import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { childrenTable, householdTables, relationTables, reportRows, type SourceTable } from './legacy-2015-spring-pm-01-04-models';

const prefix = 'legacy-2015-spring-pm-';
export const spring2015Pm0104Profiles = {
  network: prefix + '1-network',
  report: prefix + '1-report',
  virtual: prefix + '2-virtual-machines',
  dynamic: prefix + '2-dynamic-compiler',
  household: prefix + '3-household-form',
  relations: prefix + '3-relations',
  children: prefix + '3-children-view',
  dns: prefix + '4-dns',
  sequence: prefix + '4-search-sequence',
} as const;
const f = spring2015Pm0104Profiles;

const describeTables = (tables: SourceTable[]) => tables.map(t =>
  t.name + '。列は' + t.columns.join('、') + '。' +
  (t.primary === undefined ? '' : '下線で示す主キーは' + t.columns[t.primary] + '。') +
  t.rows.map(row => row.map(cell => cell || '空欄').join('、') + '。').join(''),
).join('\n');

const descriptions: Record<string, string> = {
  [f.network]: '取引先の社内ネットワーク（一部）の横線に二つの取引先PCとFW3が接続し、PC間に省略記号がある。FW3はインターネットを介してK社内のネットワーク（一部）のFW1につながる。FW1から右のRPSと下のFW2へ線が伸び、FW2はWebサーバ、DBサーバ及び社内PC二台と省略記号を示したLANへつながる。FWはファイアウォール、RPSはリバースプロキシサーバ。',
  [f.report]: '表1の列は指摘事項、原因。' + reportRows.map(row =>
    row.map(value => value ?? '網掛けで非表示').join('／') + '。').join('') +
    '注記：網掛けの部分は表示していない。',
  [f.virtual]: '言語Xによる原始プログラムを①中間コードのプログラムへ変換する。そこから破線の矢印で同じ中間コードを複数環境へ配布する。二つの例ではハードウェアA及びB上に仮想計算機Vがあり、各環境で②中間コードの入力からインタプリタによる実行へ進む。省略記号は他の環境への配布を示す。',
  [f.dynamic]: '中間コードには主プログラムと関数Fがある。仮想計算機V内の①インタプリタは中間コードを入力して実行し、②呼出し回数をプロファイル情報に送る。関数Fの中間コードは③動的コンパイラに入力し、関数Fの実行形式プログラムへ変換する。④変換した関数Fを実行する。',
  [f.household]: describeTables(householdTables),
  [f.relations]: describeTables(relationTables),
  [f.children]: describeTables([childrenTable]),
  [f.dns]: '端末内のアプリケーションとサーチリストを持つDNSリゾルバ、端末外のA社DNSサーバ、外部のDNSサーバが順に並ぶ。実線の矢印は問合せ、破線は結果。アプリケーションからDNSリゾルバ、DNSリゾルバからA社のDNSサーバ、A社のDNSサーバから外部DNSサーバへ問合せ、その逆向きに結果を返す。',
  [f.sequence]: '左からアプリケーション、DNSリゾルバ、A社のDNSサーバのレーン。上から、アプリケーション→リゾルバへwww.bunkyoを問合せ、リゾルバ→A社DNSに同じ名前を問合せ、A社DNS→リゾルバにエラーを返す。リゾルバ→A社DNSにwww.bunkyo.example.co.jpを問合せ、A社DNS→リゾルバにそのIPアドレスを返し、リゾルバ→アプリケーションに同じIPアドレスを返す。応答は破線、照会は実線。',
};

export const legacy2015SpringPm0104Figures: BookletFigureDefinition[] = Object.values(f).map(profile => ({
  profile,
  domain: [[0, 0]],
  validate(values) {
    if (values.length !== 1 || values[0] !== 0) throw Error('FIGURE_DOMAIN');
  },
  alt: () => descriptions[profile],
}));

export function spring2015Pm0104Diagram(profile: string, caption: string) {
  const entry = legacy2015SpringPm0104Figures.find(item => item.profile === profile);
  if (!entry) throw Error('FIGURE_PROFILE');
  return figure(profile, [0], caption, entry.alt([0]));
}
