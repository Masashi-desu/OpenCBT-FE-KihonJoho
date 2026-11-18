import { code, p, strings, table } from './definition';
import { answers, bank, bankBlocks, define, single, sqlChoices } from './legacy-2006-spring-pm-01-05-shared';

const employee = [
  ['S035', '浅井健司'], ['S612', '上野佳子'], ['S052', '佐藤剛'], ['S054', '鈴木太郎'],
  ['S042', '田中順'], ['S609', '中村和子'], ['S048', '渡辺正'],
] as const;
const relatives = [
  [['浅井一', '父'], ['浅井裕子', '母'], ['浅井美智子', '妻'], ['浅井あずさ', '子'], ['浅井大', '子']],
  [['上野博', '父'], ['上野春子', '母'], ['上野恵美', '姉']], [],
  [['鈴木淳子', '妻'], ['鈴木翔', '子']], [['田中奈津子', '妻'], ['田中雄太', '子']],
  [['中村浩', '父'], ['中村悦子', '母']], [],
] as const;
const originalAges = [[70, 65, 34, 11, 5], [55, 53, 27], [], [23, 1], [30, 4], [60, 52], []];
const cases = [
  { employeeAges: [34, 23, 23, 22, 31, 25, 26], familyAges: originalAges },
  { employeeAges: [34, 23, 40, 43, 45, 25, 42], familyAges: originalAges },
  { employeeAges: [34, 62, 46, 22, 22, 61, 49], familyAges: [[70,65,34,11,5],[82,68,51],[],[48,1],[44,4],[80,76],[]] },
  { employeeAges: [34, 23, 23, 41, 40, 25, 26], familyAges: [[70,65,34,11,5],[55,53,27],[],[23,1],[64,18],[60,52],[]] },
];
const resultChoices = [
  ['S042', 'S048', 'S052', 'S054'], ['S042', 'S054'], ['S048', 'S052', 'S609', 'S612'],
  ['S054'], ['S609', 'S612'], [],
];
const existsChoices = [
  'EXISTS (SELECT * FROM 家族表)',
  'NOT EXISTS (SELECT * FROM 家族表)',
  'EXISTS\n  (SELECT * FROM 家族表 WHERE 家族表.社員ID = 社員表.社員ID)',
  'NOT EXISTS\n  (SELECT * FROM 家族表 WHERE 家族表.社員ID = 社員表.社員ID)',
];
const familyChoices = ['家族がいない', '家族がいる'];
const rows = (items: readonly string[]) => items.length ? items.join('\n') : '問合せ結果0件';
const results = resultChoices.map(items => [code(rows(items), 'text')]);

function displayedTables(index: number) {
  const { employeeAges, familyAges } = cases[index];
  return [
    table('社員表', ['社員ID', '氏名', '年齢'], employee.map(([id, name], i) => [id, name, String(employeeAges[i])])),
    table('家族表', ['社員ID', '家族氏名', '年齢', '続柄'], employee.flatMap(([id], i) =>
      relatives[i].map(([name, relation], j) => [id, name, String(familyAges[i][j]), relation]))),
  ];
}

export function spring2006Pm1Pages(index: number, print = true) {
  return [
    [p('関係データベースに関する次の記述を読んで，設問1，2に答えよ。'),
      p('ある会社には，次の社員表，家族表からなる関係データベースがある。'), ...displayedTables(index),
      p('設問1　SQL文①とSQL文②を実行した結果について，次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('SQL文①'),
      code('SELECT 社員ID FROM 社員表\n  WHERE 年齢 > (SELECT AVG(年齢) FROM 家族表) ORDER BY 社員ID', 'sql'),
      p('SQL文②'),
      code('SELECT 社員ID FROM 社員表\n  WHERE 年齢 > (SELECT AVG(年齢) FROM 家族表\n    WHERE 家族表.社員ID = 社員表.社員ID) ORDER BY 社員ID', 'sql'),
      p('SQL文①を実行した結果は［a］となる。'),
      p('SQL文②を実行した結果は［b］となる。')],
    [...(print ? bankBlocks('解答群', results) : []),
      p('設問2　SQL文③と同じ実行結果が得られると考え，SQL文④を実行したところ，異なる結果が得られた。その理由を説明する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('SQL文③'),
      code('SELECT 社員ID FROM 社員表\n  WHERE 年齢 < (SELECT MIN(年齢) FROM 家族表\n    WHERE 家族表.社員ID = 社員表.社員ID)', 'sql'),
      p('SQL文④'),
      code('SELECT 社員ID FROM 社員表\n  WHERE 年齢 < ALL (SELECT 年齢 FROM 家族表\n    WHERE 家族表.社員ID = 社員表.社員ID)', 'sql'),
      p('SQL文④の限定子ALLを使った限定比較の場合には，［c］社員も抽出されるが，SQL文③のように集合関数と比較述語を使った場合は，［c］社員は抽出されない。つまり，SQL文④の実行結果には，次のSQL文⑤によって抽出される社員も併せて抽出されることになる。'),
      p('SQL文⑤'), code('SELECT 社員ID FROM 社員表 WHERE ［d］', 'sql')],
    print ? [...bank('cに関する解答群', familyChoices), ...bankBlocks('dに関する解答群', sqlChoices(existsChoices))] : [],
  ];
}

function queries(index: number) {
  const { employeeAges, familyAges } = cases[index];
  const all = familyAges.flat();
  const total = (ages: readonly number[]) => ages.reduce((sum, age) => sum + age, 0);
  const query = (ageList: (i: number) => readonly number[]) => employee.filter((_, i) => {
    const group = ageList(i);
    return group.length > 0 && employeeAges[i] * group.length > total(group);
  }).map(([id]) => id).sort();
  const selected = [query(() => all), query(i => familyAges[i])];
  const indices = selected.map(set => resultChoices.findIndex(choice => rows(choice) === rows(set)));
  if (indices.includes(-1)) throw Error('RELATIONAL_RESULT_UNAVAILABLE');
  return { all, totalAge: total(all), selected, indices };
}

export const spring2006Pm1 = define(
  1, '相関副問合せと限定比較ALL', 'a=カ／b=イ／c=ア／d=エ',
  '社員と家族の年齢の組合せ',
  '社員表と家族表の行・年齢を使って，全体の平均と社員ごとの平均を比較し，家族がいない社員に対するALLの振る舞いを判定する。',
  '原資料の表2枚、SQL文5本、相関の有無と空集合の比較を保持。7人・家族14名、等値と空集合を含め、原解答群の行・ID順を維持したまま年齢を変える。比較は合計÷人数又は年齢との積で行え、丸めは不要。作品・実在企業資料の出典表示なし。',
  index => {
    const { all, totalAge, selected, indices } = queries(index);
    const report = (set: readonly string[]) => set.length ? set.join('、') : '0件';
    return {
      prompt: spring2006Pm1Pages(index, false).flat(),
      ...answers([results, strings(familyChoices), sqlChoices(existsChoices)], [
        single('a','a',0,indices[0]), single('b','b',0,indices[1]), single('c','c',1,0), single('d','d',2,3),
      ]),
      explanation: 'SQL（Structured Query Language、データベースの検索や更新を記述する言語）文①は全家族の平均年齢'+totalAge+'÷'+all.length+'と比べるので、'+report(selected[0])+'。SQL文②は社員IDごとの家族の平均年齢と比べるので、'+report(selected[1])+'。平均と等しい社員は含まない。家族がいなければAVGとMINはNULLを返し、大小比較の結果が真にならない。ALLは副問合せが空なら反例となる行がなく真になる。SQL文⑤は社員IDで相関させたNOT EXISTSを用い、対応する家族の行がない社員だけを抽出する。',
    };
  },
);
