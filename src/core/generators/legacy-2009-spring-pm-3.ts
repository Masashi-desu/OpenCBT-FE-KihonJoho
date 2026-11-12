import { code, p, strings, table } from './definition';
import { answers, bank, define, erAssetId, erContext, marks, single } from './legacy-2009-spring-pm-01-04-shared';
import { draw } from './legacy-2009-spring-pm-01-04-figures';

const normalization = [
  '実行性能の向上を図り，料理表と分量表に分けた。',
  '主キーを一意にするため，料理名に料理IDを割り振った。',
  '商品とその分量という繰返しの要素を排除した。',
  '情報の独立性を高めるため，商品名に商品IDを割り振った。',
];
const recipes = [
  { selection: 'じゃがいも', root: 'じゃがいも', stock: [1, 1, 1, 1, 0] },
  { selection: '玉ねぎ', root: 'じゃがいも', stock: [1, 1, 0, 1, 0] },
  { selection: 'にんじん', root: 'じゃがいも', stock: [1, 0, 1, 0, 1] },
  { selection: 'さつまいも', root: 'さつまいも', stock: [0, 1, 1, 1, 1] },
] as const;

function recipeCase(index: number) {
  const { selection, root, stock } = recipes[index];
  const dish = [
    ['0001', 'ビーフカレー', '大きめに切った材料を，油を引いたなべで…'],
    ['0002', 'ロールキャベツ', 'みじん切りにした玉ねぎをよくいため，…'], ['⋮', '⋮', '⋮'],
  ];
  const product = [
    ['000001', 'にんじん', '野菜'], ['000002', '玉ねぎ', '野菜'], ['000003', root, '野菜'],
    ['⋮', '⋮', '⋮'], ['001001', '牛肉', '肉'], ['001002', '羊肉', '肉'], ['⋮', '⋮', '⋮'],
  ];
  let position = 0;
  const inventory = product.map(row => [...row, row[0] === '⋮' ? '⋮' : String(stock[position++])]);
  const filter = "商品表.商品名 = '" + selection + "'";
  const join = '料理表.料理ID = 分量表.料理ID AND 分量表.商品ID = 商品表.商品ID';
  const subquery = '(SELECT 分量表.料理ID FROM 分量表, 商品表\n        WHERE ' + filter + ')';
  const names = [
    '料理表.料理ID = ' + subquery,
    join + '\n        AND ' + filter,
    join + '\n        OR ' + filter,
    '料理表.料理ID IN ' + subquery,
  ];
  const unavailable = '(SELECT 分量表.料理ID FROM 分量表\n     JOIN 商品表 ON 分量表.商品ID = 商品表.商品ID\n     WHERE 商品表.在庫 = 0)';
  const available = [
    '商品表.在庫 != 0 AND ' + filter, '商品表.在庫 != 0 OR ' + filter,
    '料理表.料理ID IN\n  ' + unavailable + '\n  AND ' + filter,
    '料理表.料理ID NOT IN\n  ' + unavailable + '\n  AND ' + filter,
  ];
  return { selection, dish, product, inventory, names, available };
}
const erChoice = (choice: number) => draw('recipeEr', choice, 'E-R図の候補');
const sqlBank = (options: string[]) => [p('解答群'), ...options.flatMap((sql, index) => [p(marks[index]), code(sql, 'sql')])];

export function spring2009Pm3Pages(index: number) {
  const { selection, dish, product, inventory, names, available } = recipeCase(index);
  return [[
    p('問3　関係データベースの設計と操作に関する次の記述を読んで，設問1〜4に答えよ。'),
    p('あるスーパーマーケットでは，野菜，魚，肉の各売場に，来店客が食材名を入力するとその食材を使った料理名と4人分のレシピを表示し，印刷して持ち帰ることもできる端末を設置することにした。このシステムは，料理名，使用する食材，レシピなどを関係データベースで管理し，要件に応じて適切な情報を抽出する。'),
    p('このシステムで使用する表は図1のとおりである。原資料で網掛けされた主キーの項目を，次の表では見出しに示す。'),
    table('図1　表の構成：料理表', ['料理ID（主キー）', '料理名', '作り方'], dish),
    table('図1　表の構成：商品表', ['商品ID（主キー）', '商品名', '種別'], product),
    table('図1　表の構成：分量表', ['料理ID（複合主キー）', '商品ID（複合主キー）', '分量'],
      [['0001', '000001', '中1本'], ['0001', '000002', '中3個'], ['0001', '001001', '200グラム'], ['⋮', '⋮', '⋮']]),
    p('設問1　データベースを設計するに当たって，エンティティの関係を表すE-R図を作成した。図1の構成におけるE-R図を，解答群の中から選べ。'),
    p('解答群'),
    ...[0, 1, 2].flatMap(i => [p(marks[i]), erChoice(i)]),
  ], [
    p('設問2　図1の表は，料理ごとに作り方，使用する商品（食材）とその分量を記入して作成したレシピの表を正規化して得られたものである。データベース設計における第1正規化に基づいて実施した処置を，解答群の中から選べ。'),
    ...bank('解答群', normalization),
    p('設問3　野菜売場の端末で来店客が好みの野菜を一つ選択したときに，その野菜を使用する料理名をすべて抽出して表示したい。来店客が“' +
      selection + '”を選択した場合，次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    code('SELECT 料理表.料理名 FROM 料理表, 分量表, 商品表\n   WHERE ［空欄］', 'sql'),
    ...sqlBank(names),
  ], [
    p('設問4　設問3のSQL文では，当日に在庫がない商品を材料に使用する料理名まで表示してしまう。このため，図2に示すとおり，開店時に在庫がある場合は1，ない場合は0を設定する項目“在庫”を追加し，使用する食材すべてについて在庫がある料理名だけを表示できるように商品表を変更する。また，同時にSQL文の可読性を向上させるため，表の結合にはJOIN句を用いる。次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    table('図2　変更した商品表', ['商品ID（主キー）', '商品名', '種別', '在庫'], inventory),
    code('SELECT 料理表.料理名 FROM 料理表\n   JOIN 分量表 ON 料理表.料理ID = 分量表.料理ID\n   JOIN 商品表 ON 分量表.商品ID = 商品表.商品ID\n   WHERE ［空欄］', 'sql'),
    ...sqlBank(available),
  ]];
}

export const legacy2009SpringPm3Definition = define(3, '料理レシピの関係データベース', '設問1=イ・設問2=ウ・設問3=イ・設問4=エ',
  '選択する食材と開店時の在庫', '選択する野菜と各食材の在庫を変更します。',
  'p.12〜14とp.5。料理・商品・分量の主キーと複合主キー、多対多と共通の表記、繰返し要素の排除、在庫1/0、1食材選択とすべての食材の在庫を保持。', index => {
    const { selection, names, available } = recipeCase(index);
    return {
      prompt: spring2009Pm3Pages(index).flat(), contexts: [erContext],
      ...answers([[0, 1, 2].map(i => [erChoice(i)]), strings(normalization),
        names.map(sql => [code(sql, 'sql')]), available.map(sql => [code(sql, 'sql')])], [
        single('sub1', '設問1', 0, 1), single('sub2', '設問2', 1, 2),
        single('sub3', '設問3', 2, 1), single('sub4', '設問4', 3, 3),
      ]),
      explanation: '一つの料理は複数の商品を使え，一つの商品は複数の料理に使える。分量は料理と商品の多対多の関連がもつ情報である。第1正規化では繰返し要素を取り除き，料理と商品の組ごとに分量を管理する。設問3は料理IDと商品IDで三表を結び，商品名が' +
        selection + 'の行を抽出する。設問4はどれか一つでも在庫0の食材を含む料理IDを副問合せで求め，NOT INで除外する。選択した食材だけの在庫を調べると，他の食材の欠品が残る。',
    };
  }, { fixedReferenceAssetIds: [erAssetId] });
