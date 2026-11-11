import { code, p, strings, table } from './definition';
import { answers, bank, define, erAssetId, erContext, single } from './legacy-2009-autumn-pm-01-04-shared';
import { draw } from './legacy-2009-autumn-pm-01-04-figures';

const sqlWords = ['EXISTS', 'GROUP BY', 'IN', 'LIKE', 'NOT IN', 'ORDER BY'];
const joins = [
  '書類預託表.書類番号 = 書類表.書類番号', '書類預託表.書類番号 <> 書類表.書類番号',
  '書類預託表.預託日 <= 書類預託表.返却日', '棚表.棚配置日 = 書類預託表.預託日',
  '棚表.棚配置日 <= 書類預託表.預託日', '棚表.棚番号 = 書類預託表.棚番号', '棚表.棚番号 <> 書類預託表.棚番号',
];
const originals = [
  'ある箱に入っている書類を，同一の保管棚の別の箱に移す場合，箱表と書類預託表のそれぞれを更新すればよい。',
  'ある箱に入っている書類を，別の保管棚の別の箱に移す場合，書類預託表の棚番号だけを更新すればよい。',
  '保管している書類の保管棚とその位置を検索する場合，書類番号だけでは検索できない。',
  '保管棚の配置されている区画名称を変更する場合，区画表は更新しなくてよい。',
  '保管棚の配置を変更する場合，書類預託表は更新しなくてよい。',
];
const changes = [
  'ある箱に入っている書類を，同一の保管棚の別の箱に移す場合，書類預託表の箱番号だけを更新すればよい。',
  'ある箱に入っている書類を，別の保管棚にある箱番号も異なる箱に移す場合，書類預託表の棚番号と箱番号を更新すればよい。',
  '保管している書類の保管棚とその位置を検索する場合，書類番号を基に書類預託表と棚表を検索できる。',
  '保管棚の配置されている区画名称を変更する場合，区画表の区画名称を更新すればよい。',
  '保管棚の配置を変更する場合，書類預託表の預託番号を更新すればよい。',
];
const cases = [
  { occupied: false, section: 0, date: [2009, 10, 18], years: 1, update: 4 },
  { occupied: true, section: 0, date: [2010, 4, 18], years: 2, update: 0 },
  { occupied: false, section: 3, date: [2010, 10, 17], years: 1, update: 1 },
  { occupied: true, section: 2, date: [2011, 7, 10], years: 2, update: 3 },
] as const;

export const relations = [
  ['階数表', '階番号，階名称', '階番号'],
  ['区画表', '区画番号，階番号，区画名称', '区画番号，階番号'],
  ['棚表', '棚番号，階番号，区画番号，棚名称，棚配置日', '棚番号'],
  ['箱表', '箱番号，棚番号，箱名称', '箱番号，棚番号'],
  ['書類預託表', '預託番号，書類番号，箱番号，棚番号，預託日，返却日', '預託番号'],
  ['書類表', '書類番号，部署番号，書類名称', '書類番号'],
  ['部署表', '部署番号，部署名称', '部署番号'],
];

function queryCase(index: number, exact = false) {
  const { occupied, section, date, years, update } = cases[index];
  const [year, month, day] = date;
  const cutoff = String(year - years) + String(month).padStart(2, '0') + String(day).padStart(2, '0');
  const maintenance = [...originals];
  if (!exact) maintenance[1] = maintenance[1].replace('別の保管棚の別の箱', '別の保管棚にある箱番号も異なる箱');
  if (index > 0) {
    maintenance[update] = changes[update];
    maintenance[4] = changes[4];
  }
  const target = '書類を保管してい' + (occupied ? 'る' : 'ない') + '保管棚';
  const subquery = 'SELECT 棚表.階番号, COUNT(棚表.棚番号) FROM 棚表\n' +
    '   WHERE 棚表.棚番号\n' +
    '      ［a］ (SELECT 書類預託表.棚番号 FROM 書類預託表\n' +
    '              WHERE 書類預託表.返却日 IS NULL)\n' +
    (section ? '      AND 棚表.区画番号 = ' + section + '\n' : '') +
    '      ［b］ 棚表.階番号';
  const joinQuery = 'SELECT 書類預託表.書類番号, 書類表.書類名称, 書類預託表.預託日,\n' +
    '       棚表.階番号, 棚表.区画番号, 書類預託表.棚番号,\n' +
    '       書類預託表.箱番号\n' +
    '   FROM 棚表, 書類預託表, 書類表\n' +
    '   WHERE ［c］\n' +
    '      AND ［d］\n' +
    '      AND 書類預託表.返却日 IS NULL\n' +
    "      AND 書類預託表.預託日 <= '" + cutoff + "'";
  return { occupied, section, date, years, cutoff, target, subquery, joinQuery, maintenance, update };
}

export function autumn2009Pm2Pages(index: number, exact = false) {
  const { section, date, years, target, subquery, joinQuery, maintenance } = queryCase(index, exact);
  return [[
    p('問2　倉庫内の保管棚を用いた書類管理に関する次の記述を読んで，設問1〜3に答えよ。'),
    p('A社では，書類の保管管理（以下，書類管理という）を関係データベースを用いて行っている。書類管理の概要と書類管理データベースの概要は，次のとおりである。'),
    p('〔書類管理の概要〕'),
    p('（1） 書類は，倉庫に配置された保管棚の中の箱に入れて保管される。書類には，全社を通じて一意となる書類番号が付与されている。'),
    p('（2） 倉庫は1棟だけであり，3階建てで，各階は四つの区画に分けられている。各区画には複数の保管棚が配置されている。'),
    p('（3） 保管棚には，倉庫内でその保管棚を一意に識別できるように，棚番号が付与されている。保管棚は，倉庫内のどの区画に配置してもよい。また，一つの保管棚には，複数の箱がある。'),
    p('（4） 箱には，一つの保管棚の中で一意に識別できるように保管棚の段と列を組み合わせた箱番号が付与されている。例えば，3段目4列の箱番号は3-4となる。一つの箱には，複数の書類を保管できる。'),
    p('（5） 書類管理の担当者は，社内の部署から預かった書類を，保管棚のいずれかの箱に入れて保管する。保管の際，全社を通じて一意となる預託番号を付与する。'),
    p('（6） 預かった書類は返却依頼を受けて返却する。'),
    p('（7） 倉庫，保管棚及び箱の構成を図1に示す。'),
    draw('warehouse', 0, '図1　倉庫，保管棚及び箱の構成'),
  ], [
    p('〔書類管理データベースの概要〕'),
    p('（1） 階数表は，倉庫の階番号と階名称を管理する。'),
    p('（2） 区画表は，倉庫の各階における区画名称を管理する。'),
    p('（3） 棚表は，保管棚の配置された日付，位置（階番号と区画番号）及び棚名称を管理する。'),
    p('（4） 箱表は，箱名称を管理する。'),
    p('（5） 書類預託表は，部署から預かった書類の保管状況（預託日と返却日）を管理する。預託日には，書類を預かった日付が設定される。返却日には，書類を預かったときにNULLが設定され，書類を返却したときにその日付が設定される。'),
    p('（6） 書類表は，書類の預け元の部署番号と書類名称を管理する。'),
    p('（7） 部署表は，部署名称を管理する。'),
    p('（8） A社の書類管理データベースのE-R図を図2に，構造の一部を図3に示す。'),
    draw('er', 0, '図2　A社の書類管理データベースのE-R図'),
    table('図3　A社の書類管理データベースの構造（一部）', ['表', '項目', 'キー項目'], relations),
    ...(exact ? [p('注　下線はキー項目を表す。')] : []),
  ], [
    p('設問1　' + (section ? '各階の区画番号' + section + 'において，' : '') + target +
      'が各階に幾つあるかを検索する。次のSQL文中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    code(subquery, 'sql'),
    ...bank('解答群', sqlWords),
    p('設問2　' + (exact ? '預かってから1年を超え' : '検索日の' + years + '年前の同日以前に預かり') + '，未返却である書類を検索する。'),
    p('検索日を' + date[0] + '年' + date[1] + '月' + date[2] + '日とする場合，次のSQL文中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    code(joinQuery, 'sql'),
    ...bank('解答群', joins),
  ], [
    p('設問3　A社では倉庫内の利便性を高めるため，保管棚の配置を変更したり，ある箱に入っている書類を別の箱に移し替えたりしている。A社の書類管理データベースの説明として，正しい答えを解答群の中から選べ。'),
    ...bank('解答群', maintenance),
  ]];
}

export const legacy2009AutumnPm2Definition = define(2, '保管棚を用いた書類管理', '設問1 a=オ・b=イ・設問2 c/d=ア・カ（順不同）・設問3=オ',
  '棚の状態，区画，検索日と対象期間，配置更新', '棚の利用状況や区画，預託の検索日と期間，書類・棚の移動条件を変更します。',
  'p.10〜13とp.5。棚番号の一意性、箱と区画の複合キー、返却日のNULL、検索の基準日、c/dの別欄・順不同を保持。基準・生成は比較式が示す同日を含む境界を本文へ明示する。', index => {
    const { occupied, cutoff, maintenance, update } = queryCase(index);
    return {
      prompt: autumn2009Pm2Pages(index).flat(), contexts: [erContext],
      ...answers([strings(sqlWords), strings(joins), strings(maintenance)], [
        single('a', '設問1 a', 0, occupied ? 2 : 4), single('b', '設問1 b', 0, 1),
        { ids: ['c', 'd'], labels: ['設問2 c', '設問2 d'], bank: 1, correct: [0, 5] },
        single('sub3', '設問3', 2, update),
      ]),
      explanation: '返却日がNULLの預託から棚番号を取り出す。対象の棚番号がこの集合に' + (occupied ? 'あることをIN' : 'ないことをNOT IN') +
        'で判定し，階番号でGROUP BYして数える。書類番号で書類表と，棚番号で棚表と等価結合する。二つのAND条件は順不同であり，未返却かつ預託日が' +
        cutoff + '以前の行だけを残す。棚の位置は棚表，区画名は区画表，書類が入る箱と棚は書類預託表に格納される。設問3は「' + maintenance[update] + '」が当てはまる。',
    };
  }, { fixedReferenceAssetIds: [erAssetId] });
