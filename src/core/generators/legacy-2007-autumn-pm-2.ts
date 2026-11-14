import { code, p, strings } from './definition';
import { answers, bank, bankBlocks, define, single } from './legacy-2007-autumn-pm-01-05-shared';
import { draw } from './legacy-2007-autumn-pm-01-05-figures';
import { sqlCases } from './legacy-2007-autumn-pm-2-model';

const blanks = ['移送履歴表', '支店表', '配達地域表', '配達品表', 'AND', 'IN', 'NOT IN', 'OR'];
const prompts = {
  title: '関係データベースに関する次の記述を読んで，設問1〜3に答えよ。',
  company: '運送事業を営むX社は，集配場所として，ある地域を網羅するように配置された支店と，それらの支店を管理する集配センタをもつ。支店が配達を受けもつ地域（以下，管轄地区という）は，重複せずに割り振られている。支店では，顧客から届け先に配達する品物（以下，配達品という）を受け付け，預り番号というX社全体で一意の番号を付与する。',
  collection: '支店は，配達品の届け先がその支店の受けもつ管轄地区にあれば配達を行い，そうでなければ，その支店を管理する集配センタに配達品を移送する。支店から支店への配達品の移送は必ず集配センタを経由する。集配センタでは，支店から移送された配達品を受け入れ，配達品の届け先を受けもつ支店がその集配センタの管理する支店であればその支店に，そうでなければ届け先を受けもつ支店を管理している集配センタに配達品を移送する。図1に配達品移送時の支店と集配センタの関係を示す。',
  database: 'X社では，図2に示す構造の関係データベースを用いて，配達品の状態を把握している。図中の下線はキー項目を表す。',
  schema: [
    '配達地域表：管轄地区ごとに，配達を受けもつ支店コード（Sで始まる3けた）をもつ。',
    '支店表：支店コードごとに，支店を管理する集配センタコード（Aで始まる3けた）をもつ。',
    '配達品表：預り番号ごとに，配達品の依頼元や届け先などの情報を保持する。',
    "移送履歴表：配達品が集配場所（支店や集配センタ）を出入りするごとに，その日時と出入りした履歴を保持する。入出区分には配達品が集配場所に入るときには'I'を，出るときには'O'を格納する。",
  ],
};
function inputs(index: number) {
  const {center, branch, managed, local, parcel, latest} = sqlCases[index];
  const countChoices = [
    `SELECT COUNT(支店コード) FROM 支店表\n    WHERE 集配センタコード NOT IN ('${center}')`,
    `SELECT COUNT(支店コード) FROM 支店表\n    WHERE 集配センタコード = '${center}'`,
    `SELECT COUNT(支店コード) FROM 支店表 WHERE 支店コード = '${center}'`,
    `SELECT 支店コード FROM 支店表 WHERE 集配センタコード = '${center}'`,
    `SELECT 集配センタコード FROM 支店表\n    WHERE 支店コード = '${center}' ORDER BY 集配センタコード`,
  ].map(query => [code(query)]);
  const fill = `SELECT 届け先管轄地区, 届け先住所, 届け先氏名 FROM ［a］\n    WHERE 受付支店コード = '${branch}' ［b］\n        届け先管轄地区 ［c］ (SELECT 管轄地区 FROM 配達地域表\n            WHERE 支店コード = '${branch}')`;
  const time = latest ? 'MAX' : 'MIN';
  const lookup = `SELECT 通過日時, 通過店コード, 入出区分 FROM 移送履歴表\n    WHERE 預り番号 = '${parcel}' AND\n        通過日時 = (SELECT ${time}(通過日時) FROM 移送履歴表\n            WHERE 預り番号 = '${parcel}')`;
  const findings = ['が最も長い期間保管されていた支店', 'の依頼元', 'のすべての移送履歴',
    'の最新の集配場所と日時', 'を受け付けてから配達するまでに経過した日数と時間']
    .map((ending, slot) => '預り番号が' + parcel + 'である配達品' + (!latest && slot === 0 ? 'の最初の集配場所と日時' : ending));
  return { countChoices, fill, lookup, findings, managed, local, latest, center, branch, parcel };
}
export function autumn2007Pm2Pages(index: number, print = true) {
  const { countChoices, fill, lookup, findings, managed, local, center, branch } = inputs(index);
  const pages = [
    [p(prompts.title), p(prompts.company), p(prompts.collection), draw('delivery', index, '図1　配達品移送時の支店と集配センタとの関係'), p(prompts.database)],
    [draw('delivery-schema', 0, '図2　関係データベースの構造'), ...prompts.schema.map(p),
      p('設問1　集配センタ ' + center + ' が' + (managed ? '管理している' : '管理していない') + '支店の数を求めるSQL文として正しい答えを，解答群の中から選べ。')],
    [p('設問2　次のSQL文は，支店 ' + branch + ' でこれまでに受け付けた配達品のうち，' +
      (local ? 'その支店が直接配達を受けもった' : 'その支店の管轄地区外へ移送した') + '届け先の一覧を作成するものである。SQL文中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      code(fill)],
  ];
  if (print) {
    pages[1].push(...bankBlocks('解答群', countChoices));
    pages[2].push(...bank('解答群', blanks));
  }
  pages[2].push(p('設問3　移送履歴表に対して次のSQL文による問合せを行った。この問合せの結果として判明することを，解答群の中から選べ。'), code(lookup));
  if (print) pages[2].push(...bank('解答群', findings));
  return pages;
}
export const autumn2007Pm2 = define(2, '集配の関係データベースと問い合わせ', '設問1=イ／a=エ／b=オ／c=カ／設問3=エ',
  '集配センタ・対象支店・管轄条件・移送日時の集約',
  '支店数の集計、配達品の条件指定、履歴の時点を問い合わせる。',
  '管轄の重複なし、移送の経路、複合キー、I/Oの意味と問う形式5欄を維持。可変条件で担当/非担当、管轄内/外、最新/最初を問う。SQL独立実行で行/列、重複、空集合を確認。', index => {
    const { countChoices, findings, managed, local, latest, center, branch } = inputs(index);
    return { prompt: autumn2007Pm2Pages(index, false).flat(),
      ...answers([countChoices, strings(blanks), strings(findings)], [single('s1', '設問1', 0, managed ? 1 : 0),
        single('a', '設問2 a', 1, 3), single('b', '設問2 b', 1, 4), single('c', '設問2 c', 1, local ? 5 : 6),
        single('s3', '設問3', 2, latest ? 3 : 0)]),
      explanation: '設問1では支店表を集配センタ ' + center + ' の' + (managed ? '担当' : '担当外') +
        'で絞り，支店コードをCOUNTで数える。設問2の列は配達品表にあり，受付支店が ' + branch +
        ' であることと，届け先管轄地区がその支店の管轄' + (local ? 'に入る' : 'に入らない') +
        'ことの両方をANDで指定する。設問3では預り番号を固定し，' + (latest ? 'MAXで最大' : 'MINで最小') +
        'の通過日時の行から，その日時の集配場所，日時，入出区分を得る。',
    };
  });
