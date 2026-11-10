import { code, p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2011-autumn-pm-01-04-shared';
import { draw } from './legacy-2011-autumn-pm-01-04-figures';
import { japaneseDate, organizationCases } from './legacy-2011-autumn-pm-01-04-models';

const aChoices = ['課名', '氏名', '表名', '部名'];
const bChoices = ['関係喪失', '検索性能', '事前登録', '重複更新'];
const cChoices = ['ある課に属する従業員の氏名の一覧', 'ある部に属する従業員の氏名の一覧', '従業員の氏名の一覧', '部署名の一覧'];
const aggregateChoices = [
  '課表.課コード = 従業員表.課コード\nGROUP BY 課表.課コード, 課表.課名',
  '課表.課コード = 従業員表.課コード\nGROUP BY 課表.部コード, 課表.課名',
  '従業員表.年齢 = ANY (SELECT COUNT(従業員表.年齢) FROM 従業員表)',
  '従業員表.年齢 = ANY\n  (SELECT COUNT(従業員表.年齢) FROM 従業員表 GROUP BY 課表.課コード)',
];
const viewChoices = [
  'ALTER TABLE 従業員表\n      ADD (従業員番号, 氏名, 課コード, 内線)',
  'ALTER TABLE 従業員表\n      DROP 入社年月日, 住所, 自宅電話, 年齢',
  'SELECT * FROM 従業員表 WHERE 従業員番号 IS NOT NULL',
  'SELECT 従業員番号, 氏名, 課コード, 内線 FROM 従業員表',
];
const dateFilter = (index: number) => {
  const { begin, end } = organizationCases[index];
  return "受注表.受注日 BETWEEN '" + begin + "' AND '" + end + "'";
};
const orderChoices = (index: number) => {
  const date = dateFilter(index);
  return [
    '受注表.従業員番号 = 従業員公開表.従業員番号 AND\n' + date, date,
    '受注表.受注日 IN (SELECT COUNT(*) FROM 受注表\n               WHERE ' + date + ')',
    '受注表.受注日 IN (SELECT SUM(受注表.受注額) FROM 受注表\n               WHERE ' + date + ')',
  ];
};
const sqlBank = (choices: string[]) => [p('解答群'), ...choices.map((item, i) => code('アイウエ'[i] + '  ' + item, 'sql'))];
const sqlChoices = (choices: string[]) => choices.map(item => [code(item, 'sql')]);

export function autumn2011Pm2Pages(index: number) {
  const { company, departments, sections, searchSection, begin, end, aggregate, aggregateText } = organizationCases[index];
  const section = departments[1] + sections[1][0];
  return [[
    p('問2　従業員データベースの設計と運用に関する次の記述を読んで，設問1〜4に答えよ。'),
    p(company + 'は，2011年4月1日の組織編成の変更に伴い，従業員データベースの再構築を行った。組織編成の変更前は図1に示すとおり，部だけで編成されていたが，事業の拡大及び従業員数の増加に合わせて，図2に示すとおり，部と課からなる組織編成となった。'),
    draw('organization', [index, 0], '図1　変更前の組織編成'),
    draw('organization', [index, 1], '図2　変更後の組織編成'),
    p('設問1　組織編成の変更を反映するために，図3に示す表中の部に関する情報の変更について，A案とB案を考えて比較検討した。図4に示すA案では，部名と課名の組合せに対して一意の部署コードを割り当てた。図5に示すB案では，部名と課名のそれぞれにコードを割り当て，従業員表の部コードを課コードに変更した。次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。'),
    draw('relations', [index, 0], '図3　変更前の従業員データベースの表構成'),
  ], [
    draw('relations', [index, 1], '図4　A案の表構成とデータの格納例'),
    draw('relations', [index, 2], '図5　B案の表構成とデータの格納例'),
    p('最初は，部名と課名の組合せに対して一意の部署コードを割り当てた，A案によって管理しようとした。しかし，これでは，［a］を変更する必要が生じた場合に複数行を修正する必要があるので，正規化における［b］の観点から好ましくない。また，例えば［c］を表示する際にLIKE述語を使用したデータ依存の検索が必要になるなど，柔軟性が低いことが分かった。このため，B案の構成でデータベースを再構築した。'),
    ...bank('aに関する解答群', aChoices),
  ], [
    ...bank('bに関する解答群', bChoices),
    ...bank('cに関する解答群', cChoices),
    p('設問2　B案の構成でデータベースを再構築した後に，課ごとの' + aggregateText + 'を算出し，表示する。次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    code('SELECT 課表.課コード, 課表.課名, ' + aggregate + '(従業員表.年齢)\n   FROM 課表, 従業員表\n   WHERE ［空欄］', 'sql'),
    ...sqlBank(aggregateChoices),
    p('設問3　従業員表は，受発注情報を管理する表などから，従業員番号を外部キーとして参照される。このため，従来は特に利用を制限せずに社内公開していたが，個人情報保護の観点から，必要最小限の情報だけを公開するビューを作成することにした。ビューで公開する項目は，従業員番号，氏名，課コード，内線とする。次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    code('CREATE VIEW 従業員公開表 AS ［空欄］', 'sql'),
  ], [
    ...sqlBank(viewChoices),
    p('設問4　設問3で作成したビューと図6に示す受注表を使用して，' + section + 'に在籍する従業員が，' +
      japaneseDate(begin) + 'から' + japaneseDate(end) + 'の期間中に受注した案件の受注総額を算出する。' + section +
      'の課コードは“' + searchSection + '”で，' + japaneseDate(begin) +
      '以降の従業員の異動はない。次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    draw('relations', [index, 3], '図6　受注表の構成'),
    code("SELECT SUM(受注表.受注額)\n   FROM 受注表, 従業員公開表\n   WHERE 従業員公開表.課コード = '" + searchSection + "' AND\n         ［空欄］", 'sql'),
    ...sqlBank(orderChoices(index)),
  ]];
}

export const legacy2011AutumnPm2Definition = define(2, '従業員データベースの再設計とSQL', '1a=エ・1b=エ・1c=イ・2=ア・3=エ・4=ア',
  '組織と格納例・課ごとの集計方法・受注の対象課と期間',
  '組織の例，課ごとの年齢の集計方法，集計対象の課コードと受注期間を変えます。',
  'p.9〜12。組織図2点、主キー下線を含む関係表4図、設問1〜4、6欄各4択。A案の部課連結とB案のキー分割、' +
    'LIKEと重複更新、SQL三本の改行、課コード結合、ビューに公開する4項目、社員の異動なしと受注日の両端を保持。', index => {
    const { aggregate, aggregateText, searchSection, begin, end } = organizationCases[index];
    return {
      prompt: autumn2011Pm2Pages(index).flat(),
      ...answers([strings(aChoices), strings(bChoices), strings(cChoices), sqlChoices(aggregateChoices), sqlChoices(viewChoices),
        sqlChoices(orderChoices(index))], [
        single('1a', '設問1 a', 0, 3), single('1b', '設問1 b', 1, 3), single('1c', '設問1 c', 2, 1),
        single('2', '設問2', 3, 0), single('3', '設問3', 4, 3), single('4', '設問4', 5, 0),
      ]),
      explanation: 'A案では部名が同じ部の各課の部署名に繰り返し含まれる。部名を変えると複数行の重複更新が必要になり、ある部の従業員を選ぶには部署名から部名をLIKEで調べる。ある課は部署コード一つで特定できる。' +
        'B案では課コードで課表と従業員表を結合し、課コードと課名を組にしてGROUP BYでグループ化する。' + aggregate +
        'でその' + aggregateText + 'が求められる。DDL（Data Definition Language、データ定義言語）のCREATE VIEWではSELECTで公開する4列を列挙する。' +
        '受注額の集計では従業員番号で受注表と公開ビューを結び、課コード' + searchSection + 'の従業員による' +
        japaneseDate(begin) + 'から' + japaneseDate(end) + 'までの受注を両端を含めてSUMで合計する。',
    };
  });
