import { code, p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2012-spring-pm-01-04-shared';
import { draw } from './legacy-2012-spring-pm-01-04-figures';
import { canteenCases } from './legacy-2012-spring-pm-01-04-models';

const requirementChoices = ['要望1', '要望2', '要望3', '要望4'];
const tableChoices = ['精算表', '精算表と明細表', '精算表と料理表', '精算表と明細表と料理表', '明細表', '料理表', '料理表と明細表'];
const invoiceJoin = '精算表.精算コード = 明細表.精算コード';
const dishJoin = '明細表.料理コード = 料理表.料理コード';
const byStaff = 'GROUP BY 精算表.社員番号';
const refund = 'SELECT 精算表.社員番号, SUM(明細表.皿数) AS 購入皿数\n   FROM 料理表, 精算表, 明細表\n   WHERE ';

function sqlBank(choices: string[]) {
  return [p('解答群'), ...choices.map((choice, index) => code('アイウエ'[index] + '  ' + choice, 'sql'))];
}

function refundChoices(food: string) {
  const name = "料理表.料理名 = '" + food + "'";
  return [
    invoiceJoin + ' AND\n明細表.料理コード = (SELECT 料理表.料理コード FROM 料理表\n                        WHERE ' + name + ')',
    invoiceJoin + ' AND\n' + dishJoin + '\n' + byStaff + '\nHAVING ' + name,
    invoiceJoin + ' AND\n' + dishJoin + ' AND\n' + name,
    invoiceJoin + ' AND\n' + dishJoin + ' AND\n' + name + '\n' + byStaff,
  ];
}

function rankingChoices(minimum: number) {
  const afterWhere = minimum ? '\n      AND 料理表.カロリー >= ' + minimum : '';
  const byDish = '\n   GROUP BY 料理表.料理名, 料理表.カロリー\n   ORDER BY 販売皿数 DESC';
  const exact = '料理表.料理コード = 明細表.料理コード';
  const inQuery = '料理表.料理コード IN (SELECT\n      明細表.料理コード FROM 明細表 WHERE 明細表.皿数 IS NOT NULL)';
  return ['COUNT', 'SUM'].flatMap(operator => [exact, inQuery].map(where =>
    'SELECT 料理表.料理名, 料理表.カロリー, ' + operator + '(明細表.皿数) AS 販売皿数\n   FROM 料理表, 明細表 WHERE ' +
    where + afterWhere + byDish));
}

export function spring2012Pm3Pages(index: number) {
  const { foods: [, food], period, calories } = canteenCases[index];
  return [
    [
      p('問3　社員食堂の利用記録データベースの設計と運用に関する次の記述を読んで，設問1〜4に答えよ。'),
      p('A社では，社員証のICカード化に伴い，社員証を用いた社員食堂の精算システムを構築することにした。トレーに載せた料理を精算機の前に置くと，料理皿に埋め込まれたICチップのデータから料金が計算され，合計金額が表示される。合計金額を確認した後に社員証をかざすと，精算ができる。精算データはデータベースに記録され，1か月分の精算額が，まとめて翌月の給料から引き落とされる。'),
      p('A社のシステム部門では，精算データを記録するデータベースとして，当初，図1に示す表を設計した。'),
      draw('canteen', [index, 0], '図1　表構成とデータの格納例'),
      p('精算システムの機能に関して関係者にヒアリングした結果，給料からの引落し額の算出以外にも次に示す四つの要望が挙がった。'),
      p('要望1：ある社員の，ある日の精算の明細を表示できること'),
      p('要望2：ある日の売上合計額（精算額の合計）を算出できること'),
      p('要望3：料理の一覧を表示できること'),
      p('要望4：ある日の，ある料理の販売皿数を算出できること'),
      p('そこで，四つの要望に対応できるように図2のとおり，1回の精算に対して一つの精算コードを割り当てた三つの表で構成するように設計を変更した。下線付きの項目は主キーを表す。'),
    ],
    [
      draw('canteen', [index, 1], '図2　変更後の表構成とデータの格納例'),
      p('設問1　図1に示した表構成のままでも対応できる要望として正しい答えを，解答群の中から選べ。'),
      ...bank('解答群', requirementChoices),
      p('設問2　料理名が“' + food + '”の単価に誤りがあることが判明したので，購入者に差額を返金することになった。“' +
        food + '”購入者の社員番号と購入皿数を求める。次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      code(refund + '［空欄］', 'sql'),
    ],
    [
      ...sqlBank(refundChoices(food)),
      p('設問3　次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。'),
      p('A社の健康管理部門から，精算時に料理の合計カロリーを表示する機能と，ある社員の，' + (period || 'ある期間') +
        'における1回の精算当たりの平均カロリーを求める機能の追加を要望された。このため，料理表にカロリーの列を追加することにした。'),
      p('しかし，平均カロリーを求めるには［a］を結合しなければならないので，多くの検索と計算の処理が必要となることが予想できた。精算時に合計カロリーを計算するので，その情報を記録しておけば，検索及び計算量は少なくなる。そこで，［b］に，精算単位の合計カロリーの列を追加することにした。これによって，前述の平均カロリーを求める場合は，［b］だけを参照すればよいので，処理の高速化が期待できる。'),
      ...bank('解答群', tableChoices),
    ],
    [
      p('設問4　設問3のカロリーに関する機能を追加した後，食堂利用者にカロリーを意識して料理を選んでもらうために，人気料理とそのカロリーを掲示することにした。' +
        (calories ? 'カロリーが' + calories + '以上の料理を対象として，' : '') +
        '販売皿数の多い順に，料理名，カロリー及び販売皿数を求める。正しいSQL文を，解答群の中から選べ。'),
      ...sqlBank(rankingChoices(calories)),
    ],
  ];
}

export const legacy2012SpringPm3Definition = define(3, '社員食堂の利用記録データベース', '設問1=イ、設問2=エ、設問3 a=エ・b=ア、設問4=ウ',
  '食堂の取引例・返金対象の料理・平均の期間・掲示するカロリーの下限', '格納例の取引・料理，返金対象，カロリーを集計する条件を変えます。',
  'p.12〜15。表の列と主キーの下線，集計単位，四つの要望と5解答欄を保持。対象料理とデータを連動し，販売皿数の降順を保ったまま派生ではカロリー下限を本文と全SQLへ追加する。結合と集計に必要な列は原問の対応上固定する。',
  index => {
    const { foods: [, food], calories } = canteenCases[index];
    return {
      prompt: spring2012Pm3Pages(index).flat(),
      ...answers([strings(requirementChoices), refundChoices(food).map(sql => [code(sql, 'sql')]), strings(tableChoices),
        rankingChoices(calories).map(sql => [code(sql, 'sql')])], [
        single('1', '設問1', 0, 1), single('2', '設問2', 1, 3), single('a', '設問3 a', 2, 3),
        single('b', '設問3 b', 2, 0), single('4', '設問4', 3, 2),
      ]),
      explanation: '図1には日付と精算額があるため，日付で絞って合計すれば要望2に対応できる。' + food +
        'の購入皿数には精算コード・料理コードでの結合，料理名によるWHEREの絞込み，社員番号によるGROUP BYが要る。精算当たりのカロリーは社員・日付，皿数，料理1皿のカロリーを使うので三表を結合する。精算表に合計カロリーを1精算1行で持てば，精算表だけで平均を求められる。' +
        (calories ? '掲示はカロリーが' + calories + '以上の料理に絞る。' : '') +
        '販売皿数は行数COUNTでなく皿数SUMである。料理コードで結合し，料理名とカロリーでまとめ，販売皿数の降順にする。',
    };
  });
