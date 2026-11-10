import { code, p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2013-spring-pm-01-04-shared';
import { memberCases } from './legacy-2013-spring-pm-01-04-models';
import { draw } from './legacy-2013-spring-pm-01-04-figures';

const marks = 'アイウエ';
const dataTables = ['会員表', '会計表', '店舗表', '明細表', 'メニュー表'];
const aggregates = [
  'SUM(ALL 会計表.会計金額) AS 売上金額,\nMAX(会計表.会員番号) AS 延べ来客数,\nAVG(売上金額 / 延べ来客数) AS 平均会計額',
  'SUM(ALL 会計表.会計金額) AS 売上金額,\nMAX(会計表.会計コード) AS 延べ来客数,\nAVG(会計表.会計金額) AS 平均会計額',
  'SUM(会計表.会計金額) AS 売上金額,\nCOUNT(DISTINCT 会計表.会計コード) AS 延べ来客数,\nAVG(売上金額 / 延べ来客数) AS 平均会計額',
  'SUM(会計表.会計金額) AS 売上金額,\nCOUNT(会計表.会計コード) AS 延べ来客数,\nAVG(会計表.会計金額) AS 平均会計額',
];
const dateRules = [
  { aggregate: 'MAX', comparator: '<', correct: 1, detail: '最も新しい来店日が年初より前なので，年初以降は来店していない' },
  { aggregate: 'MAX', comparator: '>=', correct: 0, detail: '最も新しい来店日が年初以降なので，年初以降に1回以上来店している' },
  { aggregate: 'MIN', comparator: '<', correct: 2, detail: '最も古い来店日が年初より前なので，年初より前に1回以上来店している' },
  { aggregate: 'MIN', comparator: '>=', correct: 3, detail: '最も古い来店日が年初以降なので，年初より前には来店していない' },
] as const;

function choicesSql(options: readonly string[]) {
  return [p('解答群'), ...options.map((choice, index) => code(marks[index] + '　' + choice.replaceAll('\n', '\n　　'), 'sql'))];
}

function inputQueries(index: number) {
  const input = memberCases[index];
  const month = String(input.month).padStart(2, '0');
  const from = input.year + month + '01';
  const through = input.year + month + String(input.lastDay);
  const cutoff = input.year + 1;
  const rule = dateRules[index];
  const joinMember = '会員表.会員番号 = 会計表.会員番号';
  const joinStore = '店舗表.店舗コード = 会計表.店舗コード';
  const sameEmployee = " = '" + input.employee + "'";
  const employeeStore = '(SELECT 店舗コード FROM 従業員表\n                     WHERE 従業員コード' + sameEmployee + ')';
  const aggregateSql = 'SELECT 店舗表.店舗コード, 店舗表.店舗名,\n' +
    '       ［c］\nFROM 店舗表, 会計表\nWHERE ' + joinStore + ' AND\n' +
    "      会計表.来店日 BETWEEN '" + from + "' AND '" + through + "'\nGROUP BY 店舗表.店舗コード, 店舗表.店舗名";
  const dateSql = 'SELECT 会員表.会員番号, 会員表.氏名\nFROM 会員表, 会計表\nWHERE ' + joinMember +
    "\nGROUP BY 会員表.会員番号, 会員表.氏名\nHAVING " + rule.aggregate + '(会計表.来店日) ' + rule.comparator + " '" + cutoff + "0101'";
  const employeeSql = 'SELECT DISTINCT 会員表.会員番号, 会員表.氏名, 会員表.住所\nFROM 会員表, 会計表\nWHERE ［d］';
  const employeeOptions = [
    joinMember + ' AND\n(会員表.担当美容師' + sameEmployee + ' OR\n 会計表.担当美容師' + sameEmployee + ')',
    joinMember + ' AND\n会員表.担当美容師' + sameEmployee + ' AND\n会計表.担当美容師' + sameEmployee +
      ' AND\n会計表.店舗コード = ' + employeeStore,
    joinMember + ' AND\n会計表.店舗コード = ' + employeeStore,
    joinMember + ' AND\n会計表.店舗コード = ANY ' + employeeStore,
  ];
  return { cutoff, aggregateSql, dateSql, employeeSql, employeeOptions };
}

function dateChoices(year: number) {
  return [
    year + '年になってから，1回以上，来店した会員', year + '年になってから，1回も来店していない会員',
    year + '年より前に，1回以上，来店した会員', year + '年より前に，1回も来店していない会員',
  ];
}

export function spring2013Pm3Pages(index: number) {
  const input = memberCases[index];
  const { cutoff, aggregateSql, dateSql, employeeSql, employeeOptions } = inputQueries(index);
  return [
    [
      p('問3　会員情報を管理する関係データベースの設計と運用に関する次の記述を読んで，設問1〜4に答えよ。'),
      p('ある地域で5店舗のヘアサロンを経営しているZ社では，会員登録した顧客に対して紙製の会員証を発行し，氏名や住所などの会員情報は表計算ソフトを利用して管理していた。今回，顧客サービスの向上を目的に，会員情報を管理するシステム（以下，管理システムという）を導入し，会員証のICカード化を行うとともに会員情報と来店記録のデータベース化を実施した。'),
      p('管理していた会員情報の例とその形式は，図1のとおりである。'),
      draw('database', [index, 0], '図1　管理していた会員情報の例とその形式'),
    ],
    [
      p('まず，会員情報と来店記録を管理するために図2に示すデータベースを設計した。下線付きの項目は主キーを表す。'),
      draw('database', [index, 1], '図2　会員情報と来店記録データのデータベースへの格納例'),
      p('設問1　会員特典として，ポイント制度を導入することにした。ポイント情報の管理に関する次の記述中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      p('会員が料金を支払う際に会員証を提示すると，会計金額に応じて，' + input.accruedUnit + 'につき1ポイントが付与される。会計時に付与されたポイント（以下，付与ポイントという）と，会員が現在保有しているポイント（以下，保有ポイントという）は，レシートに印字される。'),
      p('会計の際，会員が希望すれば，保有ポイントと引き換えに表1に示す割引サービスを受けられる。このとき保有ポイントから引かれるポイントを利用ポイントという。付与ポイントは，割引後の料金から算出する。'),
    ],
    [
      table('表1　ポイントによる割引サービス', ['利用ポイント数', '割引率（%）'], input.thresholds.map((threshold, i) => [String(threshold), String(input.rates[i])])),
      p('管理システムで会員の保有ポイントを参照する機会が多いので，参照の都度，保有ポイントの集計処理を実行することは避けたい。保有ポイントを管理するのに適した表は，［a］である。また，会員がポイントをどのように活用しているかの傾向を分析できるよう，ポイントの付与と利用の履歴を管理したい。付与ポイント及び利用ポイントを管理するのに適した表は，［b］である。'),
      ...bank('解答群', dataTables),
      p('設問2　2012年9月にデータベース及び管理システムの開発が完了し，10月から運用を開始した。' + input.year + '年' + input.month + '月について，店舗ごとの売上金額，延べ来客数，会計コード単位の平均会計額を表示したい。次のSQL文中の［c］に入れる正しい答えを，解答群の中から選べ。ここで，売上金額は会計金額の合計とする。ポイントによる割引サービスを利用した場合は，会計表の会計金額には割引後の金額が設定されている。'),
      code(aggregateSql, 'sql'),
    ],
    [
      ...choicesSql(aggregates),
      p('設問3　会員の来店を促す目的で，次のSQL文によって表示される会員に対して，割引券を送付することにした。表示される会員の説明として適切な答えを，解答群の中から選べ。ここで，会員は，1度は来店したことがあるものとする。'),
      code(dateSql, 'sql'),
      ...bank('解答群', dateChoices(cutoff)),
    ],
    [
      p('設問4　顧客サービスを向上させるために，“指名美容師”と“過去の来店時に担当した美容師”を確認できるよう，会員表と会計表に担当美容師の項目を追加した。担当美容師は，図3に示す従業員表の従業員コードを外部キーとして参照する。指名美容師がいない会員の場合，会員表の担当美容師としてNULLを設定する。'),
      p('情報の追加後，従業員コード“' + input.employee + '”の美容師が所属する店舗が変わるので，会員表の担当美容師に登録している会員と，当該美容師が過去に担当したことがある会員に，所属店舗移動の案内を送付することにした。該当する会員の会員番号を表示する次のSQL文中の［d］に入れる正しい答えを，解答群の中から選べ。'),
      draw('database', [index, 2], '図3　従業員表とデータの格納例'),
      code(employeeSql, 'sql'),
      ...choicesSql(employeeOptions),
    ],
  ];
}

export const legacy2013SpringPm3Definition = define(3, '会員情報を管理する関係データベースの設計と運用', '設問1 a=ア・b=イ、設問2 c=エ、設問3=イ、設問4 d=ア',
  'ポイント制度・集計年月・来店条件・美容師コード',
  'ポイントの制度、店舗別集計の対象年月、会員抽出のSQLの条件と通知対象の美容師を変えます。',
  '冊子p.13〜17。三つの図の表構成と主キー下線、付与と利用の定義、割引後金額、1回以上来店、日付両端、NULL、五欄と原順5・5・4・4・4択を保持。SQLは表示だけに用い、独立SQLite試験で集約、年初境界、異なる店舗、重複来店、NULLとORを照合する。', index => {
    const { cutoff, employeeOptions } = inputQueries(index);
    const input = memberCases[index];
    return {
      prompt: spring2013Pm3Pages(index).flat(),
      ...answers([strings(dataTables), aggregates.map(sql => [code(sql, 'sql')]), strings(dateChoices(cutoff)),
        employeeOptions.map(sql => [code(sql, 'sql')])], [
        single('a', '設問1 a', 0, 0), single('b', '設問1 b', 0, 1), single('c', '設問2 c', 1, 3),
        single('s3', '設問3', 2, dateRules[index].correct), single('d', '設問4 d', 3, 0),
      ]),
      explanation: '設問1のaは会員ごとに一つの現在値なので会員表，bは会計ごとの履歴なので会計表に置く。明細表は会計の中のメニューごとの情報であり，ここにポイントを置くと一回の会計が複数行になり得る。\n' +
        '設問2は' + input.year + '年' + input.month + '月の会計を店舗ごとにまとめ，割引後の会計金額をSUM（合計），会計コードをCOUNT（件数），会計金額をAVG（平均）で集計する。MAXは最大値で件数にはならない。別名を同じSELECTの集約式に入れても，個々の会計金額の平均を表さない。\n' +
        '設問3は' + cutoff + '年の年初と比較する。' + dateRules[index].detail + '会員が該当する。\n' +
        '設問4は会員番号で結合し，指名又は会計時の担当のいずれかが従業員コード' + input.employee + 'に一致すれば対象となる。担当がNULLでも別の条件が真なら選ぶ。店舗の一致だけでは別の美容師の来店も含まれる。DISTINCTで同じ会員の重複を除く。SQL（Structured Query Language）は関係データベースを操作するための言語である。',
    };
  });
