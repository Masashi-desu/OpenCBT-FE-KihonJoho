import { code, p, strings } from './definition';
import { birthCases } from './legacy-2015-spring-pm-01-04-models';
import { spring2015Pm0104Diagram as figure, spring2015Pm0104Profiles as profiles } from './legacy-2015-spring-pm-01-04-figures';
import { answers, bank, define, single, sqlBank } from './legacy-2015-spring-pm-01-04-shared';
import allBanks from './legacy-2015-spring-pm-01-04-banks.json';

const choices = allBanks[2] as { normalization: string[]; olderHouseholds: string[]; counts: string[]; view: string[] };
const title = '自治会員の情報を管理する関係データベースの設計及び運用';
const countsStatement = 'SELECT 世帯表.班, ［c］\n  FROM 世帯表, 会員表\n  WHERE 世帯表.世帯番号 = 会員表.世帯番号\n  GROUP BY 世帯表.班';
const viewStatement = 'CREATE VIEW 子供会表 AS\n   SELECT 会員表.会員番号, 会員表.世帯番号,\n          世帯表.電話番号, 会員表.氏名, 会員表.生年月日\n     FROM 世帯表, 会員表\n     WHERE ［d］';
function selections(index: number) {
  const dates = birthCases[index];
  return {
    older: choices.olderHouseholds.map(s => s.replaceAll('19400101', dates.year + '0101')
      .replaceAll('19391231', (dates.year - 1) + '1231')),
    view: choices.view.map(s => s.replaceAll('20030402', String(dates.from)).replaceAll('20090401', String(dates.to))),
  };
}

export function spring2015Pm3Pages(index: number) {
  const c = birthCases[index], sql = selections(index);
  return [
    [
      p('問3　' + title + 'に関する次の記述を読んで，設問1〜4に答えよ。'),
      p('X地区の自治会では，世帯数の増加と，個人情報管理の厳格化を背景に，手書きの帳票で管理していた自治会員の情報を電子化することにした。この自治会には，236世帯，667人が登録されていて，各世帯は1〜8班のいずれかに所属している。'),
      p('従来は図1に示すとおり，世帯ごとに，世帯主氏名，住所，電話番号，登録日，所属する班，同居者氏名，続柄，性別，生年月日などの情報を管理していた。'),
      figure(profiles.household, '図1　世帯情報を管理していた帳票と記入例'),
      p('図1の帳票を基に，図2に示す表構成をもつ関係データベースを作成した。下線付きの項目は，主キーを表す。'),
    ],
    [
      figure(profiles.relations, '図2　表構成とデータ格納例'),
      p('〔表の説明〕'),
      p('(1) 世帯表の世帯番号には，各世帯に一意に割り当てた番号が格納されている。'),
      p('(2) 世帯表の世帯主番号には，世帯主の会員番号が格納されている。'),
      p('(3) 会員表の会員番号には，各会員に一意に割り当てた番号が格納されている。'),
      p('(4) 会員表の世帯番号には，会員が属する世帯の世帯番号が格納されている。'),
      p('設問1　図2の表構成を完成するまでの設計について，次の記述中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      p('図1の帳票は非正規形なので，まず，［a］世帯情報を取り出して会員表を作成した。次に，［b］続柄表と性別表を作成した。続柄表と性別表のレコード件数は少ないが，例えば，帳票の記載で“男”と“男性”のように同じ意味を表すデータに対する定義の一意性を保証できる効果がある。'),
    ],
    [
      ...bank('解答群', choices.normalization),
      p('設問2　地区の福祉委員会から，' + c.year + '年よりも前に生まれた会員が含まれる世帯の世帯番号について，情報提供を求められた。該当する世帯番号を抽出する正しいSQL文を解答群の中から選べ。'),
      p('なお，同じ世帯番号は一つだけ抽出する。'),
      ...sqlBank(sql.older),
      p('設問3　班ごとの会員数に偏りがあるとの意見が挙がったので，班の再編を検討することになった。現在の状況を確認するために，班ごとの世帯数と会員数を集計する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。'),
      code(countsStatement, 'sql'),
      ...sqlBank(choices.counts),
    ],
    [
      p('設問4　地区の子供会役員から，子供会に所属する子供の情報を照会できるようにしてほしいとの要望が挙がったので，図3に示すビューを作成することにした。子供会には，生年月日が' + c.from + '〜' + c.to + 'の会員が所属する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。'),
      figure(profiles.children, '図3　子供会表（ビュー）の構成とデータの表示例'),
      code(viewStatement, 'sql'),
      ...sqlBank(sql.view),
    ],
  ];
}

export const legacy2015SpringPm3Definition = define(
  3, title, '設問1 a=イ・b=エ、設問2=ウ、設問3 c=ウ、設問4 d=エ',
  '生年の境界と子供会対象の生年月日', birthCases.length,
  '帳票と表、SQLの解答群を保ち、福祉委員会が抽出する生年の境界と子供会の対象期間を変えています。',
  '印刷p.13〜16／物理p.14〜17。第1・第3正規化、会員の所属、重複の除去、等価結合と両端を含む範囲を維持。表の例の児童は全候補の期間内。問いと正しいSQLの構造を保つため正答位置は固定し、境界と期間に応じて正答SQLのリテラルが変わる。',
  index => {
    const c = birthCases[index], sql = selections(index);
    return {
      prompt: spring2015Pm3Pages(index).flat(),
      ...answers([
        strings(choices.normalization), ...[sql.older, choices.counts, sql.view].map(items => items.map(text => [code(text, 'sql')])),
      ], [
        single('a', '設問1 a', 0, 1), single('b', '設問1 b', 0, 3),
        single('s2', '設問2', 1, 2), single('c', '設問3 c', 2, 2), single('d', '設問4 d', 3, 3),
      ]),
      explanation: '設問1：繰返しの世帯情報を会員ごとの行にする操作は第1正規化。非キーである続柄や性別のコードにその名称が従属するので，これを別表へ分けるのは第3正規化。障害回復や排他制御ではない。\n' +
        '設問2：' + c.year + '年より前は生年月日が' + c.year + '0101未満。世帯番号だけでGROUP BYすると，一世帯に該当者が複数でも一行になる。会員番号もグループ化すると重複を除けない。\n' +
        '設問3：等価結合後の一行が一会員。世帯数は同じ世帯番号をCOUNT(DISTINCT ...)で一度だけ数え，会員数はCOUNT(*)で数える。MAXは人数を数えない。\n' +
        '設問4：会員の所属する世帯と世帯表の行を世帯番号で結び，' + c.from + 'から' + c.to +
        'までをBETWEENで両端を含めて選ぶ。世帯主番号で結ぶと世帯主以外が落ち，端点のINだけでは中間の日を選べない。',
    };
  },
);
