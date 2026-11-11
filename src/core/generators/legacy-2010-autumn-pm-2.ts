import { code, p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2010-autumn-pm-01-04-shared';
import { draw } from './legacy-2010-autumn-pm-01-04-figures';
import { databaseCase } from './legacy-2010-autumn-pm-01-04-models';

const normalization = [
  '受付番号と類似受付番号の組合せを主キーとし，繰返し要素を排除した',
  '既に当該正規形に準じていたので，適用は不要だった',
  'データ参照時の処理性能を考慮し，質問と回答を一つの表で管理するようにした',
  '利用者表，サポート員表及び種別表を作成し，主キー以外の項目における関数従属性を排除した',
  '類似表を作成し，主キーの一部における関数従属性を排除した',
];
const sql = (text: string) => code(text, 'sql');
const sqlBank = (choices: string[]) => [p('解答群'), ...choices.flatMap((text, index) => [p('アイウエオカ'[index]), sql(text)])];

function sqlConditions(index: number) {
  const { keyword, category, width, model, similarGroup } = databaseCase(index);
  const wildcard = ["'%" + keyword + "%'", "'_" + keyword + "_'"];
  const match = ['ANY', 'IN', 'LIKE'].flatMap(operator => wildcard.map(pattern =>
    '質問 ' + operator + ' ' + (operator === 'LIKE' ? pattern : '(' + pattern + ')')));
  const subselect = "対応表.種別ID = (SELECT 種別ID FROM 種別表 WHERE 種別 = '" + category + "')";
  const join = '対応表.受付番号 = 類似表.受付番号';
  const filter = "AND 種別表.種別 = '" + category + "'";
  const allJoins = '対応表.種別ID = 種別表.種別ID AND ' + join;
  const count = [
    subselect + '\nGROUP BY 類似表.類似受付番号',
    subselect + '\nAND ' + join + ' GROUP BY 類似表.受付番号',
    allJoins + '\n' + filter + ' GROUP BY 類似表.受付番号',
    allJoins + '\n' + filter + ' GROUP BY 類似表.類似受付番号',
  ];
  const column = "製品型番 CHAR(" + width + ") DEFAULT '" + model + "'";
  const alter = [
    'ALTER TABLE 対応表 ADD ' + column + ' NOT NULL',
    'ALTER TABLE 対応表 MODIFY ' + column + ' NOT NULL',
    'CREATE TABLE 対応表 (' + column + ')',
    "INSERT INTO 対応表 製品型番 VALUES '" + model + "'",
  ];
  const selectGroup = similarGroup ? '類似受付番号' : '類似表.受付番号';
  return { match, count, alter, selectGroup };
}

export function autumn2010Pm2Pages(index: number) {
  const { company, examples, topic, keyword, category, model, whole, similarGroup } = databaseCase(index);
  const { match, count, alter, selectGroup } = sqlConditions(index);
  return [[
    p('問2　コールセンターの対応記録管理に関する次の記述を読んで，設問1〜4に答えよ。'),
    p(company + '社では，新しいソフトウェア製品の発売と同時に，そのソフトウェア製品に関する質問を受けるコールセンターを開設することにした。コールセンターでの対応内容は，すべてデータベースに記録する。'),
    p('〔コールセンターの業務〕'),
    p('（1） 製品を購入した利用者には，一意な利用者IDが発行されている。質問を受ける際は，この利用者IDを通知してもらう。'),
    p('（2） 対応内容をデータベースに記録する際，その質問の原因を特定する種別を設定する。種別とは，“' + examples[0] + '”，“' + examples[1] + '”などの情報である。それぞれの種別に対して一意に種別IDを割り当てる。'),
    p('（3） データベースを検索し，過去に同じ種別IDをもつ類似の質問があった場合は，その受付番号を類似受付番号として記録しておく。'),
    p('図1は，これらの業務を基に，データベースを構成するデータ項目を抽出したものである。下線付きの項目は主キーを表す。'),
    draw('database', 0, '図1　データベースを構成するデータ項目'),
  ], [
    p('設問1　図1に示したデータ項目を正規化して図2に示す表を設計し，運用を始めた。実施した正規化に関する説明文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    draw('normalization', 0, '図2　正規化検討後の表'),
    p('図1に示した状態は非正規形と呼ばれ，1事実1か所の関係が成立していないので，重複更新，事前登録，関係喪失などの問題がある。このため，第1正規化から順に第3正規化までを行うことにした。'),
    p('まず，第1正規化の作業では，［a］。次に，第2正規化の作業では，［b］。そして，第3正規化の作業では，［c］。'),
    ...bank('解答群', normalization),
  ], [
    p('設問2　ある利用者から“' + topic + '”に関する質問を受けた。過去に類似の質問があったかどうかを確認するため，' +
      (whole ? '“' + keyword + '”というキーワードの直前と直後に任意の1文字ずつがあり，それだけで全文となる質問をすべて抽出する。'
        : '“' + keyword + '”というキーワードを含む質問をすべて抽出する。') +
      '次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    sql('SELECT 対応表.受付番号, 利用者表.利用者名, 対応表.質問\n   FROM 対応表, 利用者表\n   WHERE 対応表.利用者ID = 利用者表.利用者ID\n         AND ［空欄］'),
    ...sqlBank(match),
    p('設問3　製品のバージョンアップに当たり，コールセンターの対応記録を参考にして機能改善を検討することにした。種別が“' + category +
      '”であった質問を抽出し，' + (similarGroup ? '類似件数の多い順に表示する。'
        : '現在の質問の受付番号ごとに，その質問について記録した過去の類似質問の件数を数え，多い順に表示する。') +
      '次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    sql('SELECT ' + selectGroup + ', COUNT(*) FROM 対応表, 種別表, 類似表\n   WHERE ［空欄］\n   ORDER BY COUNT(*) DESC'),
    ...sqlBank(count),
  ], [
    p('設問4　新たに提供する製品に関する質問を記録するために，現在の表に製品型番の列を追加して製品を識別できるようにする。表の拡張と同時に，これまで蓄積した情報の製品型番の列にはすべて“' + model + '”を設定する。正しいSQL文を，解答群の中から選べ。'),
    ...sqlBank(alter),
  ]];
}

export const legacy2010AutumnPm2Definition = define(2, 'コールセンターの対応記録管理',
  '設問1 a=ア・b=オ・c=エ・設問2=オ・設問3=エ・設問4=ア', '検索の語と一致条件、集計する種別と受付番号、製品型番',
  '検索に使う語と文字列の一致条件、集計対象の受付番号・種別、追加する製品型番を変えます。',
  'p.9〜12。非正規形の繰返しと主キー、五つの表と複合主キー、正規化の段階、LIKEのパターン、二つの結合、WHEREとGROUP BYとORDER BY、既存表への列追加・既存行への既定値を保持。', index => {
    const { keyword, model, whole, similarGroup } = databaseCase(index);
    const { match, count, alter } = sqlConditions(index);
    return {
      prompt: autumn2010Pm2Pages(index).flat(),
      ...answers([strings(normalization), ...[match, count, alter].map(group => group.map(text => [sql(text)]))], [
        single('1a', '設問1 a', 0, 0), single('1b', '設問1 b', 0, 4), single('1c', '設問1 c', 0, 3),
        single('2', '設問2', 1, whole ? 5 : 4), single('3', '設問3', 2, similarGroup ? 3 : 2),
        single('4', '設問4', 3, 0),
      ]),
      explanation: 'SQL（Structured Query Language）は関係データベースを操作する言語である。LIKEはパターン一致，INは列挙した値との一致，ANYは比較演算と組み合わせて複数値と比較する。第1正規化は繰返す類似受付番号を1行1値とし，受付番号との組合せをキーにする。第2正規化は受付番号だけに従属する内容と，両番号の組合せで決まる類似表を分ける。第3正規化は利用者ID・サポート員ID・種別IDによる間接的な従属を各表に分離する。' +
        'SQLのLIKEで' + (whole ? '_はちょうど任意の1文字を表すため，“' + keyword + '”の両側に一つずつ置く。' : '%は0文字以上の任意の列を表すため，“' + keyword + '”を両側から囲む。') +
        '件数集計では対応表を種別IDで種別表と，受付番号で類似表と結合して，指定種別に絞る。' +
        (similarGroup ? '過去に似ているとされた質問ごとに数えるので類似受付番号を' : '現在の質問ごとに数えるので類似表の受付番号を') +
        'グループ化し，COUNT(*)の降順に並べる。既存表に列を加えるにはALTER TABLE ADDを使い，DEFAULTで既存行の値を' +
        model + 'とする。',
    };
  });
