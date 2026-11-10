import { code, p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2012-autumn-pm-01-04-shared';
import { draw } from './legacy-2012-autumn-pm-01-04-figures';
import { purchases } from './legacy-2012-autumn-pm-01-04-models';

const duplicateChoices = ['更新すべきデータが更新されない', '削除すべきデータが残る', '情報が漏えいする',
  '挿入したはずのデータが消える', 'トランザクションが遅延する'];
const matchChoices = ['社名', '所在地', '電話番号', '取引先コード'];
const tableChoices = ['商品表', '取引先表', '発注表', '品目表', '部表', '明細表'];
const joinOrder = '発注表.発注コード = 明細表.発注コード';
const matchColumns = [1, 2, 3, 0];
const marks = 'アイウエオカキ';

function sqlBank(label: string, choices: string[]) {
  return [p(label), ...choices.map((choice, index) => code(marks[index] + '  ' + choice, 'sql'))];
}
function whereChoices(product: string) {
  const filter = "商品表.商品名 = '" + product + "'";
  const where = joinOrder + ' AND\n';
  return [
    where + '商品表.商品コード = 明細表.商品コード AND\n' + filter,
    where + '明細表.購入額 = (SELECT AVG(商品表.定価) FROM 商品表\n                   WHERE ' + filter + ')',
    where + '明細表.購入額 = (SELECT SUM(商品表.定価) FROM 商品表\n                   WHERE ' + filter + ')',
    where + '明細表.商品コード = (SELECT COUNT(*) FROM 商品表\n                     WHERE ' + filter + ')',
  ];
}
function havingChoices(minimum: number) {
  return ['COUNT(*)', 'COUNT(DISTINCT 発注表.発注コード)', 'COUNT(発注表.発注コード)',
    'MAX(明細表.購入額)', 'MAX(明細表.数量)', 'SUM(明細表.購入額)', 'SUM(明細表.数量)']
    .map(value => 'HAVING ' + value + ' >= ' + minimum);
}

export function autumn2012Pm2Pages(index: number) {
  const input = purchases[index];
  return [
    [
      p('問2　購買情報を管理する関係データベースの設計及び運用に関する次の記述を読んで，設問1〜4に答えよ。'),
      p('B社では，購買業務の効率化を目的に，社内組織を変更して，これまでX事業部とY事業部に個別に存在していた購買部門を統合した。'),
      p('これに伴い，それぞれの事業部が関係データベースで個別に管理していた購買データも統合した。統合後の表構成は図1のとおりであり，統合前からX事業部とY事業部ともに同じ表構成で管理していた。下線付きの項目は主キーを表す。'),
      draw('purchase', [index, 0], '図1　表構成と統合後のデータの格納例'),
    ],
    [
      p('設問1　データを統合したときに実施した“名寄せ”と呼ばれる作業に関する次の記述中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      p('同じ情報が，表現が異なるデータとして社内に複数存在する場合がある。それぞれが，関連性のないデータベースで個別に管理されているのであれば，データの重複といった問題は発生しない。しかし，データベースの統合が必要になった場合，単純にデータを寄せ集めると，同じ情報を表すデータであるにもかかわらず別のデータとして格納されてしまい，［a］，［b］といった問題が発生する。'),
      p('このような場合，同じ情報を表すデータを一つのデータにまとめる“名寄せ”と呼ばれる作業が必要となる。B社では，名寄せを次の手順で実施した。'),
      p('（1）統合対象の表のデータを見比べて，表現は異なっていても同じ情報を表しているデータかどうかを識別するのに最も適した項目を特定する。\n（2）（1）で特定した項目で突合せを行い，同じ情報を表すデータを一つのデータにまとめる。'),
      p('それぞれの事業部の取引先表から（1）の作業のために抽出した，名寄せが必要となる典型的なデータを，図2及び図3に示す。これらのデータから，突合せを行う項目は［c］が適切と判断できる。'),
      draw('purchase', [index, 1], '図2　X事業部の取引先表から抽出したデータ'),
      draw('purchase', [index, 2], '図3　Y事業部の取引先表から抽出したデータ'),
    ],
    [
      ...bank('a，bに関する解答群', duplicateChoices),
      ...bank('cに関する解答群', matchChoices),
      p('設問2　統合された購買部門で分析したところ，同じ商品であっても，取引先によって購入単価が異なることが分かった。商品名“' + input.product + '”について，取引先コードと平均購入単価を，金額が安い順に表示する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。ここで，商品名は一意に管理できているものとする。'),
      code('SELECT 発注表.取引先コード,\n       SUM(明細表.購入額) / SUM(明細表.数量) AS 平均購入単価\n  FROM 発注表, 商品表, 明細表\n  WHERE ［d］\n  GROUP BY 発注表.取引先コード\n  ORDER BY 平均購入単価', 'sql'),
    ],
    [
      ...sqlBank('解答群', whereChoices(input.product)),
      p('設問3　より安く商品を購入するために，購買部門の発注担当者は，商品の発注時に割引率を確認してから発注先を選定することにした。発注先選定時の検索処理に関する次の記述中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      p('商品コードごとの平均割引率は，［e］と［f］を結合すると求められる。加えて，取引先コードごとに集計したり，“以前は高かったが，最近は安くなった”といった傾向を把握したりしたい場合は，更に［g］を結合することで求められる。'),
      ...bank('解答群', tableChoices),
    ],
    [
      p('設問4　複数の取引先から' + input.category + 'を購入していたが，品ぞろえは同じだったので，1社に一括発注することによって割引率を上げてもらうよう交渉することにした。' + input.category + 'について' + input.minimum + '回以上の発注実績がある取引先を対象に，購入金額が多い順に取引先コードと金額を表示する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。'),
      code('SELECT 発注表.取引先コード, SUM(明細表.購入額) AS 合計購入金額\n  FROM 発注表, 明細表, 商品表, 品目表\n  WHERE ' + joinOrder + ' AND\n        明細表.商品コード = 商品表.商品コード AND\n        商品表.品目コード = 品目表.品目コード AND\n        品目表.品目名 = \'' + input.category + '\'\n  GROUP BY 発注表.取引先コード\n  ［h］\n  ORDER BY 合計購入金額 DESC', 'sql'),
      ...sqlBank('解答群', havingChoices(input.minimum)),
    ],
  ];
}

export const legacy2012AutumnPm2Definition = define(2, '購買情報を管理する関係データベース', '設問1 a=ア・b=イ（順不同）・c=ウ、設問2 d=ア、設問3 e=ア・f=カ（順不同）・g=ウ、設問4 h=イ',
  '名寄せの表・商品・品目・発注回数', '取引先表の一致項目，対象商品と品目，発注回数の条件を変えます。',
  'p.8〜12。主キーの下線、8解答欄、a/b・e/fの順不同、商品名の一意性、数量で重み付けした平均、昇順・降順、明細行と発注の違いを保持。データ型・結合の役割・明細数に依存する誤答は固定し、本文・表の対象データと回数閾値で具体化。発注数は同じ二桁程度、選択肢のSQL構造・候補数は原順を維持。',
  index => {
    const input = purchases[index];
    const matched = matchColumns.findIndex(col => input.x.some(x => input.y.some(y => x[col] === y[col])));
    return {
      prompt: autumn2012Pm2Pages(index).flat(),
      ...answers([strings(duplicateChoices), strings(matchChoices), whereChoices(input.product).map(item => [code(item, 'sql')]),
        strings(tableChoices), havingChoices(input.minimum).map(item => [code(item, 'sql')])], [
        { ids: ['a', 'b'], labels: ['設問1 a', '設問1 b'], bank: 0, correct: [0, 1] },
        single('c', '設問1 c', 1, matched), single('d', '設問2 d', 2, 0),
        { ids: ['e', 'f'], labels: ['設問3 e', '設問3 f'], bank: 3, correct: [0, 5] },
        single('g', '設問3 g', 3, 2), single('h', '設問4 h', 4, 1),
      ]),
      explanation: '同じ取引先を別のレコードにすると，一方だけの更新や削除によって古い値や不要な行が残る。図2・3で突合せできる項目は'
        + matchChoices[matched] + '。' + input.product + 'の平均購入単価は，発注コードと商品コードで三表を結合し，商品名で絞り，取引先ごとの購入額合計を数量合計で割る。割引率には定価を持つ商品表と数量・購入額を持つ明細表が必要で，取引先と発注日を得るには発注表を加える。'
        + input.category + 'の取引先を' + input.minimum + '回以上の発注で絞るには，明細が複数行に分かれても発注を重複計上しないよう，取引先ごとにCOUNT(DISTINCT 発注表.発注コード)を用いる。',
    };
  });
