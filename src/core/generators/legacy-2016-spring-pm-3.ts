import { code, field, p, strings, variableNotes } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { spring2016PmBank, spring2016PmCase, spring2016PmMarks, spring2016PmParts } from './legacy-2016-spring-pm-01-04-shared';
import {
  spring2016Pm0104Diagram as diagram, spring2016Pm0104Profiles as f,
  spring2016Pm3Cases,
} from './legacy-2016-spring-pm-figures-01-04';

const obtainable = [
  'アトラクションの待ち時間', '休園日', '入園者数', '入園者のアトラクション利用状況', '入園者の滞在時間',
];
const attractionNumber = '利用表.アトラクション番号';
const fee = 'アトラクション表.料金';
const visitorNumber = '入園者表.入園者番号';
const countSql = [
  'AVG(' + attractionNumber + ')', 'COUNT(*)', 'MAX(' + attractionNumber + ')', 'SUM(' + attractionNumber + ')',
];
const ticket = "入園者表.券種 = '01'";
const modes = [
  { aggregate: 'MAX', comparison: '<', correct: 3, detail: '最も新しい入園日が年初より前なら，年初以降の入園日は一つもない。' },
  { aggregate: 'MIN', comparison: '>=', correct: 0, detail: '最も古い入園日が年初以降なら，前年以前の入園日は一つもない。' },
  { aggregate: 'MAX', comparison: '>=', correct: 1, detail: '最も新しい入園日が年初以降なら，年初以降に少なくとも1回は入園した。' },
  { aggregate: 'MAX', comparison: '<', correct: 3, detail: '最も新しい入園日が年初より前なら，年初以降の入園日は一つもない。' },
] as const;

export const legacy2016SpringPm3Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-3',
  title: '遊園地の入園者情報を管理する関係データベース',
  version: '3.2.0',
  sourceAnswer: '設問1 a=オ、b=エ／設問2 c=イ／設問3 d=ウ／設問4=エ',
  fields: [field('精算額の下限・入園年の抽出条件', 0, 3)],
  reference: [0],
  publicNotes: '導入前・導入後・会員情報追加後の図と四つの設問を保持します。料金、精算額の下限、会員を抽出する年とSQLの集約・比較条件を変更し、表・SQL・選択肢・解説を同じ条件から組み立てます。',
  notes: variableNotes + ' 原物理14〜17頁の3図8表（主キー下線・利用表の複合主キー）、SQL3本、5欄17固有択22参照を保持。退園まで途中退出なし、会員は少なくとも1回入園済み、非会員の会員番号NULL、入園券01のみ・合計額の降順と等号を明示。料金と閾値は50円刻み以上で元と同程度。独立SQLiteで実際の全SQL候補を実行し、境界の日・額、パスポート・重複利用・複数グループ・NULLを含む参照集合と照合する。',
  build(values) {
    const i = spring2016PmCase(values), { threshold, cutoff } = spring2016Pm3Cases[i], m = modes[i];
    const amountSql = [
      ticket + ' AND\n' + fee + ' >= ' + threshold + '\nGROUP BY ' + attractionNumber,
      ticket + '\nGROUP BY ' + visitorNumber + '\nHAVING MAX(' + fee + ') >= ' + threshold,
      ticket + '\nGROUP BY ' + visitorNumber + '\nHAVING SUM(' + fee + ') >= ' + threshold,
      ticket + '\nGROUP BY ' + attractionNumber + '\nHAVING SUM(' + fee + ') >= ' + threshold,
    ];
    const cutoffChoices = [
      (cutoff - 1) + '年以前に1回も入園していない会員',
      cutoff + '年以降に1回以上，入園した会員',
      cutoff + '年以降に1回だけ，入園した会員',
      cutoff + '年以降に1回も入園していない会員',
    ];
    return {
      prompt: [
        p('問3 遊園地の入園者情報を管理する関係データベースに関する次の記述を読んで，設問1〜4に答えよ。'),
        p('遊園地Yでは，各アトラクションの入り口にICカードの読取り機を設置して，入園者の利用状況を収集するシステムを導入した。入園者は，全てのアトラクションを追加料金なしで利用できるパスポートか，アトラクション利用の都度，料金が課金される入園券のいずれかを購入し，対応するICカードを受け取る。ICカードは退園時に料金を精算してから返却する。ここで，入園者は退園まで遊園地を出ることはないものとする。'),
        p('遊園地Yでは，システム導入前は入園者の情報を図1に示す表で構成されるデータベースで管理していた。下線付きの項目は主キーを表す。'),
        diagram(f.q3Tables, [i, 0], '図1 システム導入前の表の構成とデータの格納例'),
        p('設問1 システムの導入に当たり，データベースの表を図2に示すとおり再設計した。次の記述中の空欄に入れる適切な答えを，解答群の中から選べ。'),
        p('入園者表に退園時刻の項目を追加することによって，［a］が分かるようになった。また，利用表を追加することによって，［b］が分かるようになった。各アトラクションには一意のアトラクション番号を割り振って，利用表から分離したアトラクション表を作成した。'),
        diagram(f.q3Tables, [i, 1], '図2 システム導入後の表の構成とデータの格納例'),
        ...spring2016PmBank('a，bに関する解答群', obtainable),
        p('設問2 アトラクションごとの延べ利用者数を表示する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。'),
        code('SELECT ' + attractionNumber + ', アトラクション表.アトラクション名,\n' +
          '       ［c］\nFROM 利用表, アトラクション表\n' +
          'WHERE ' + attractionNumber + ' = アトラクション表.アトラクション番号\n' +
          'GROUP BY ' + attractionNumber + ', アトラクション表.アトラクション名', 'sql'),
        p('設問2 解答群'),
        ...countSql.map((sql, n) => code(spring2016PmMarks[n] + '　' + sql, 'sql')),
        p('設問3 入園券でアトラクションを利用した入園者のうち，退園時の精算において' + threshold.toLocaleString('en-US') + '円以上を支払った入園者について，精算額が多い入園者から降順に，入園者番号と精算額を表示する。入園券の購入者は入園者表の券種に“01”が設定されている。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。'),
        code('SELECT ' + visitorNumber + ', SUM(' + fee + ') AS 支払金額\n' +
          'FROM 入園者表, 利用表, アトラクション表\n' +
          'WHERE ' + visitorNumber + ' = 利用表.入園者番号 AND\n' +
          '      ' + attractionNumber + ' = アトラクション表.アトラクション番号 AND\n' +
          '      ［d］\nORDER BY 支払金額 DESC', 'sql'),
        p('設問3 解答群'),
        ...amountSql.map((sql, n) => code(spring2016PmMarks[n] + '　' + sql, 'sql')),
        p('設問4 パスポートを購入する際に提示することで料金が割引になる会員証を発行することになった。そこで，図3に示すとおり，会員情報を格納する会員表を作成し，入園者表に会員番号を格納する項目を追加する。次のSQL文で抽出できるようになる会員についての正しい答えを，解答群の中から選べ。ここで，1回も入園していない会員はいないものとする。また，会員登録をしていない入園者の場合，入園者表の会員番号にはNULLを設定する。'),
        diagram(f.q3Tables, [i, 2], '図3 会員情報を追加した表の構成とデータの格納例'),
        code("SELECT 会員表.会員番号, 会員表.氏名\nFROM 会員表, 入園者表\n" +
          "WHERE 会員表.会員番号 = 入園者表.会員番号\nGROUP BY 会員表.会員番号, 会員表.氏名\n" +
          "HAVING " + m.aggregate + "(入園者表.入園日) " + m.comparison + " '" + cutoff + "0101'", 'sql'),
        ...spring2016PmBank('設問4 解答群', cutoffChoices),
      ],
      ...spring2016PmParts([
        strings(obtainable), countSql.map(sql => [code(sql, 'sql')]),
        amountSql.map(sql => [code(sql, 'sql')]), strings(cutoffChoices),
      ], [
        { id: 'a', label: '設問1 a', group: 0, correct: 4 },
        { id: 'b', label: '設問1 b', group: 0, correct: 3 },
        { id: 'c', label: '設問2 c', group: 1, correct: 1 },
        { id: 'd', label: '設問3 d', group: 2, correct: 2 },
        { id: 'q4', label: '設問4', group: 3, correct: m.correct },
      ]),
      explanation: [
        'a：入園時刻と退園時刻の差が滞在時間になる。途中で遊園地を出ないので，この差に園外で過ごした時間は含まれない。入園者数は導入前の入園者表でも数えられる。',
        'b：利用表は入園者番号と利用時刻の組を主キーとして，どのアトラクションを利用したかを記録する。利用時刻は記録するが，列に並び始めた時刻や休園日を記録する表ではない。',
        'c：アトラクション番号と名称ごとの行数をCOUNT(*)で数える。同じ入園者が2回使えば2行を数える。AVG・MAX・SUMをアトラクション番号に適用しても利用数は求まらない。',
        'd：券種01に限定し，入園者番号でグループ化して，アトラクション料金のSUMが' + threshold + '円以上のグループだけをHAVINGで選ぶ。閾値と等しい精算額も含める。WHEREで1件の料金を絞ったりMAXを使ったりすると，複数回の利用で下限に達した人を落とす。アトラクション番号で集約すると入園者ごとの精算額にならない。',
        '設問4：会員番号で結合して会員別に集約する。非会員のNULLは等号で結合しない。' + cutoff + '年1月1日を境界として，' + m.detail + '集約値だけで入園回数が正確に1回かどうかは分からない。',
        'ICはIntegrated Circuit（集積回路），SQLはStructured Query Language（関係データベースを操作する言語）。COUNTは件数，AVGは平均，MAXは最大値，MINは最小値，SUMは合計。NULLは値がないことを表す。',
      ].join('\n'),
    };
  },
};
