import { p, strings } from './definition';
import { answers, bank, code, define, marks, single, table } from './legacy-2013-autumn-pm-01-04-shared';
import { baseballCases, baseballTableKeys, type BaseballTable } from './legacy-2013-autumn-pm-01-04-models';
import { autumn2013Pm0104Diagram as diagram, autumn2013Pm0104Profiles as f } from './legacy-2013-autumn-pm-01-04-figures';

const aBank = ['インデックスを設定', '第1正規化', '第2正規化', '第3正規化', 'セキュリティを強化'];
const group = 'GROUP BY チーム表.チーム番号, チーム表.チーム名';
const sqlBanks = [
  group + '\nORDER BY 勝点 ASC, 総得点 ASC', group + '\nORDER BY 勝点 DESC, 総得点 DESC',
  'ORDER BY 勝点, 総得点 ASC', 'ORDER BY 勝点, 総得点 DESC',
];
const countAndOrder = [['COUNT(*)', 'DESC'], ['MAX(打席表.打者)', 'ASC'], ['MIN(打席表.投手)', 'ASC'], ['SUM(打席表.打点)', 'DESC']];
const matchResults = (teams: number) => [
  teams * (teams - 2), teams * (teams - 1), teams * teams,
  2 * (teams - 1) ** 2, 2 * teams * (teams - 1), 2 * teams * teams,
];

function aggregationOptions(event: string) {
  return ['選手ごとの' + event + '数', 'チームごとの勝点', 'チームごとの総得点', 'チームごとの' + event + '数', 'リーグの総得点', 'リーグの' + event + '数'];
}

export function autumn2013Pm2Pages(i: number) {
  const { teams, batting } = baseballCases[i];
  const show = (type: BaseballTable, caption: string) => diagram(f.baseball, [i, baseballTableKeys.indexOf(type)], caption);
  return [
    [
      p('問2　選手情報を管理する関係データベースの設計及び運用に関する次の記述を読んで，設問1〜4に答えよ。'),
      p('ある少年野球リーグの事務局では，登録選手の氏名や成績などの個人情報を管理するために，関係データベースを構築することにした。このリーグには，近隣の' + teams + 'チームが参加している。'),
      p('まず，リーグに所属するチームと登録選手の情報を管理するために，図1に示すチーム表と選手表を設計した。下線付きの項目は，主キーを表す。'),
      show('team', 'チーム表'), show('player', '選手表'), p('図1　チーム表と選手表のデータ格納例'),
      p('設問1　チームの対戦成績を管理する表を設計する。次の記述中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      p('このリーグでは，毎年4月から翌年の3月までを1シーズンとし，試合は各チームが他のチームの全てと1回だけ対戦する総当たり方式で行う。'),
      p('このデータベースでは，各チームの対戦成績や，勝利投手，敗戦投手などの情報を管理する。チーム成績は勝点によって順位付けする。勝点は，勝利チームに3点，敗戦チームに0点，引分けの場合は両チームに1点ずつを付与する。'),
      p('最初，図1に示すチーム表に，必要な項目を追加することを考えたが，総当たりで対戦することから，表に繰返し項目が発生することになる。これを改善するために，［a］した。また，管理する情報の性質上，チーム表や選手表は更新しながら継続的に使用するが，対戦成績はシーズンごとに表を作成して管理'),
    ],
    [
      p('したい。さらに，勝利投手や敗戦投手といった，個々の試合に関する情報を管理するには，別の表にした方が扱いやすいと判断して，図2に示す日程表と結果表を作成することにした。ここで，1シーズンで作成される結果表のレコード件数は，［b］件になる。'),
      show('schedule', '日程表'), show('result', '結果表'), p('図2　日程表と結果表のデータ格納例'),
      ...bank('aに関する解答群', aBank), ...bank('bに関する解答群', matchResults(teams)),
    ],
    [
      p('設問2　勝点が多いチームから降順にチーム番号，チーム名，勝点，総得点を表示する。このとき，勝点が等しい場合は，総得点の降順に表示する。次のSQL文の［c］に入れる正しい答えを，解答群の中から選べ。'),
      code('sql', 'SELECT チーム表.チーム番号, チーム表.チーム名,\n       SUM(結果表.勝点) AS 勝点, SUM(結果表.得点) AS 総得点\nFROM チーム表, 結果表\nWHERE チーム表.チーム番号=結果表.チーム番号\n［c］'),
      p('解答群'), ...sqlBanks.flatMap((value, j) => [p(marks[j]), code('sql', value)]),
      p('設問3　選手個人の打撃成績を管理するために，図3に示す打席表と打撃表を作成した。' +
        (i === 0 ? 'ホームランを打った数' : '打撃結果の名称が「' + batting + '」の打席数') +
        '（以下，' + batting + '数という）が多い選手から降順に選手番号，選手名，' + batting +
        '数を表示する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。ただし，d1とd2に入れる答えは，dに関する解答群の中から組合せとして正しいものを選ぶものとする。'),
      code('sql', "SELECT 打席表.打者, 選手表.氏名, ［d1］ AS 集計数\nFROM 打席表, 選手表\nWHERE 打席表.打者=選手表.選手番号 AND\n      打席表.打撃結果=(SELECT 打撃表.打撃結果 FROM 打撃表\n                     WHERE 打撃表.名称='" + batting + "')\nGROUP BY 打席表.打者, 選手表.氏名\nORDER BY 集計数 ［d2］"),
    ],
    [
      show('plate', '打席表'), p('注1　打席番号には，試合番号で示す試合における通番を格納する。例えば，1回表の攻撃が5人で終わった場合，1回裏の攻撃は打席番号006から始まる。\n注2　表裏には，表の攻撃の場合に1を，裏の攻撃の場合に2を格納する。'),
      show('batting', '打撃表'), p('図3　打席表と打撃表のデータ格納例'),
      table('dに関する解答群', ['記号', 'd1', 'd2'], countAndOrder.map((row, j) => [marks[j], ...row])),
    ],
    [
      p('設問4　このリーグでは，チーム表や選手表は更新しながら継続的に使用する。対戦成績と打撃成績はシーズンごとに表を作成するが，過去の情報も参照できるように，シーズン終了後も蓄積しておく。'),
      p('リーグに所属する選手情報の管理について，次の記述中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      p('新しい選手の情報は，選手表に追加すればよい。リーグを離れる選手の情報は，蓄積されている情報の参照を考慮して，削除せずに残しておいた方がよい。'),
      p('ある選手がシーズン途中に別のチームへ移籍する場合，選手表のチーム番号を更新すると，例えば，SQL文を用いて当該シーズンにおける［e］の集計はできなくなる。移籍前の情報は，抹消日を格納した上でそのまま残して，当該選手に新しい選手番号を割り振って登録する方法もあるが，その場合は，SQL文を用いて［f］の集計ができなくなる。そこで，このリーグでは，選手の移籍にも柔軟に対処できるように，選手の情報を図4に示すとおり所属選手表と選手表で管理するように変更した。ただし，移籍して元のチームに戻ることはないものとする。'),
      show('membership', '所属選手表'), show('revised', '選手表'), p('図4　変更後の表構成とデータ格納例'),
      ...bank('解答群', aggregationOptions(batting)),
    ],
  ];
}

export const legacy2013AutumnPm2Definition = define(2, '選手情報を管理する関係データベースの設計及び運用', '設問1 a=イ・b=イ、設問2 c=イ、設問3 d=ア、設問4 e=エ・f=ア',
  '総当たりのチーム数・打撃結果の集計対象・例示得点', baseballCases.length,
  '総当たりの参加チーム数と例示結果の得点，及び打撃表の集計対象を変え，解答群とSQLの条件に反映します。',
  '原冊子p.10〜14、図1〜4に計8表と主キーの下線、2本のSQLの字下げ、d1/d2の一組4候補、共有するe/fを6欄の原順で保持。1シーズンは4月から翌年3月、2チームに1行ずつ、勝点3/0/1、総得点で同点決着、打席通番と表裏、移籍で元のチームに戻らない条件を保持。チーム数6・8・10・12、候補は対戦相手数や二重計上をモデル化し整数・丸めなし。独立SQLiteでSQL全択を検算する。', i => {
    const { teams, batting } = baseballCases[i];
    const options = matchResults(teams);
    return {
      prompt: autumn2013Pm2Pages(i).flat(),
      ...answers([strings(aBank), strings(options.map(String)), sqlBanks.map(sql => [code('sql', sql)]),
        countAndOrder.map(([fn, order]) => [code('sql', fn + '\n' + order)]), strings(aggregationOptions(batting))], [
        single('a', '設問1 a', 0, 1), single('b', '設問1 b', 1, 1),
        single('c', '設問2 c', 2, 1), single('d', '設問3 d', 3, 0),
        single('e', '設問4 e', 4, 3), single('f', '設問4 f', 4, 0),
      ]),
      explanation: '設問1では，繰返し項目をなくす第1正規化を行う。各チームは他の' + (teams - 1) + 'チームと1回対戦し，結果表では両チームの結果を別々に1行ずつ記録する。全体で' + options[1] + '行となる。\n' +
        '設問2ではチーム番号とチーム名でグループ化し，集計した勝点と総得点の両方を降順にする。\n' +
        '設問3では打撃表で「' + batting + '」の打席だけに絞るため，選手ごとにCOUNT(*)で件数を求め，DESCで多い順にする。\n' +
        '設問4では所属の上書きで移籍前の所属が分からなくなり，チームごとの' + batting + '数を求められない。選手番号を分けると同一選手として集計できず，選手ごとの' + batting + '数を求められない。所属期間を選手番号から分離すると両方に対応できる。',
    };
  });
