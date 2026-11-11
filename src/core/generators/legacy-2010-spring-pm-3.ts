import { code, p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2010-spring-pm-01-04-shared';
import { draw } from './legacy-2010-spring-pm-01-04-figures';
import { databaseScenario, subjects } from './legacy-2010-spring-pm-01-04-database';

const sql = (text: string) => code(text, 'sql');
const sqlBank = (choices: string[]) => [p('解答群'), ...choices.flatMap((text, index) => [p('アイウエ'[index]), sql(text)])];
const extend = ['学期の増減', '試験回数の増減', '試験科目の増減', '生徒の増減'];
const score = subjects.join(' + ');
const matchStudentHistory = '生徒表.生徒番号 = 履歴表.生徒番号';
const matchStudentScores = '生徒表.生徒番号 = 成績表.生徒番号';
const matchHistoryScores = '履歴表.生徒番号 = 成績表.生徒番号';
const matchScoresExam = '成績表.試験ID = 試験表.試験ID';
const matchHistoryTeacher = '履歴表.教員番号 = 教員表.教員番号';
function sqlChoices(index: number) {
  const { forTotal: [year, grade], forMean: [meanYear, meanGrade], exam, name } = databaseScenario(index);
  const totalFilter = '履歴表.年度 = ' + year + ' AND 履歴表.学年 = ' + grade;
  const examFilter = "試験表.試験名 = '" + exam + "'";
  const examSelect = 'SELECT 試験ID FROM 試験表\n                         WHERE ' + examFilter;
  const totals = [
    totalFilter + '\nAND ' + examFilter,
    totalFilter + '\nAND ' + examFilter + ' AND 成績表.年度 = ' + year,
    totalFilter + '\nAND 試験表.試験ID = (' + examSelect + ')',
    totalFilter + '\nAND 試験表.試験ID = ANY(' + examSelect + ')',
  ];
  const meanFilter = 'AND 履歴表.年度 = ' + meanYear + ' AND 履歴表.学年 = ' + meanGrade;
  const byClassTeacher = '\nGROUP BY クラス, 教員表.氏名';
  const average = [
    [matchHistoryScores, 'AND ' + matchHistoryTeacher, meanFilter].join('\n') + byClassTeacher,
    [matchHistoryScores, 'AND ' + matchHistoryTeacher, meanFilter, 'AND 成績表.年度 = ' + meanYear].join('\n') + byClassTeacher,
    [matchHistoryScores, meanFilter, 'AND 成績表.試験ID = ANY(SELECT 試験ID FROM 試験表)'].join('\n') + byClassTeacher,
    [matchHistoryScores, meanFilter, 'AND 履歴表.教員番号 = ANY(SELECT 教員番号 FROM 教員表)'].join('\n') + byClassTeacher,
  ];
  const byName = [matchStudentScores, 'AND ' + matchScoresExam, "AND 生徒表.氏名='" + name + "'"].join('\n');
  const scalarName = "成績表.生徒番号 = (SELECT 生徒番号 FROM 生徒表 WHERE 氏名='" + name + "')";
  const named = [
    byName,
    byName + '\nAND 生徒表.生徒番号 = (SELECT 生徒番号 FROM 生徒表)',
    scalarName + '\nGROUP BY 試験表.試験ID',
    scalarName + '\nGROUP BY 成績表.年度',
  ];
  return { totals, average, named };
}

export function spring2010Pm3Pages(index: number) {
  const { terms, rounds, counts, exams, forTotal: [year, grade], forMean: [meanYear, meanGrade], exam, name } = databaseScenario(index);
  const { totals, average, named } = sqlChoices(index);
  const note = p('注　試験名には，試験の名称（' + exams.join('，') + '）が格納される。');
  const sqlBlank = '［空欄］';
  return [[
    p('問3　関係データベースに関する次の記述を読んで，設問1〜4に答えよ。'),
    p('ある中学校では，これまで表計算ソフトを使用して管理していた試験の成績をデータベース化することになった。この中学校に在籍している，又は過去に在籍したことがある生徒及び教員の情報を管理するデータベースは既に運用中であり，これらと連携させて運用する。'),
    p('現在運用中のデータベースの構造は図1のとおりである。下線付きの項目は主キーを表す。'),
    draw('database', 0, '図1　現在運用中のデータベースの構造'),
    p('この中学校は，1年度が' + terms + '期に分かれており，それぞれの期中に' +
      (rounds.length === 2 ? '中間試験と期末試験' : '初回試験，中間試験及び期末試験') +
      'を実施している。試験科目は，国語，数学，英語，理科，社会の5科目である。また，試験は学年別，科目別に統一した問題で行われている。'),
  ], [
    p('設問1　成績を管理するデータベースの構造について，案A及び案Bが提案された。次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('案A　生徒番号，年度，試験IDを主キーとして管理する。'),
    draw('relation', 0, '成績表', true),
    p('注　国語，数学，英語，理科，社会には，それぞれの科目の得点が格納される。'),
    draw('relation', 1, '試験表', true),
    note,
    p('案B　生徒番号，年度，試験ID，科目IDを主キーとして管理する。'),
    draw('relation', 2, '成績表', true),
    p('注　得点には，当該試験の科目IDで識別される科目の得点が格納される。'),
    draw('relation', 1, '試験表', true),
    note,
    draw('relation', 3, '科目表', true),
    p('注　科目名には，科目の名称（国語，数学，英語，理科，社会）が格納される。'),
    p('データベースを設計する上で，拡張性の考慮は重要である。その点，案Bは案Aと比較して［a］に対して柔軟に対応することができる。その反面，表の増加に伴い，データを検索する際のSQL文が複雑になりやすく，また，1人の生徒の1年間の成績を格納するために必要な成績表のレコード件数は，案Aでは［b］件で済むが，案Bでは［c］件となる。扱うデータの総量にもよるが，長期の運用を考えた場合，これらの点はデータ操作時の性能にも影響を与えるおそれがある。'),
    p('データベースの設計においては，運用時の利用形態を想定した上で，操作性，拡張性，実行性能などを多角的に評価する必要がある。この中学校では操作性を重視して案Aを採用した。'),
  ], [
    ...bank('aに関する解答群', extend),
    ...bank('b，cに関する解答群', counts),
    p('設問2　' + year + '年度' + grade + '学年の' + exam + '試験を対象に，生徒ごとの全科目合計点を求め，降順に整列して表示する。次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    sql('SELECT 生徒表.氏名, クラス, ' + score + '\n   FROM 生徒表, 履歴表, 成績表, 試験表\n   WHERE ' + matchStudentHistory +
      '\n         AND ' + matchHistoryScores + '\n         AND ' + matchScoresExam + '\n         AND ' + sqlBlank + '\n   ORDER BY ' + score + ' DESC'),
    ...sqlBank(totals),
  ], [
    p('設問3　' + meanYear + '年度' + meanGrade + '学年を対象に，1年間に実施したすべての試験の各科目の平均点をクラスごとに求め，担任教員の氏名とともに表示する。次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    sql('SELECT クラス, 教員表.氏名, AVG(国語), AVG(数学), AVG(英語),\n       AVG(理科), AVG(社会)\n   FROM 履歴表, 成績表, 教員表\n   WHERE ' +
      sqlBlank + '\n   ORDER BY クラス'),
    ...sqlBank(average),
  ], [
    p('設問4　生徒“' + name + '”の成績を，試験IDの昇順に表示する。次のSQL文の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('なお，生徒“' + name + '”が複数人いた場合は，過去に在籍したことがある生徒も含めて生徒番号の昇順に表示する。'),
    sql('SELECT 生徒表.生徒番号, 成績表.年度, 試験名, 国語, 数学, 英語,\n       理科, 社会\n   FROM 生徒表, 成績表, 試験表\n   WHERE ' +
      sqlBlank + '\n   ORDER BY 生徒表.生徒番号, 成績表.年度, 試験表.試験ID'),
    ...sqlBank(named),
  ]];
}

export const legacy2010SpringPm3Definition = define(3, '学校の成績データベース', '設問1 a=ウ・b=ウ・c=カ・設問2=イ・設問3=イ・設問4=ア',
  '学期と試験の日程，集計する年度・学年・試験，生徒氏名',
  '学期・試験の構成、集計対象の年度・学年・試験名、検索する生徒の氏名を変更します。',
  'p.17〜21。主キーの下線・教員番号注記・五科目・試験名全件・案A/B，SQLの4表と3表の等価結合・複数年度・同姓同名の結果順を保持。', index => {
    const { counts, exams, forTotal: [year], forMean: [meanYear], name } = databaseScenario(index), { totals, average, named } = sqlChoices(index);
    return {
      prompt: spring2010Pm3Pages(index).flat(),
      ...answers([strings(extend), strings(counts.map(String)), ...[totals, average, named].map(group => group.map(text => [sql(text)]))], [
        single('a', '設問1 a', 0, 2), single('b', '設問1 b', 1, counts.indexOf(exams.length)),
        single('c', '設問1 c', 1, counts.indexOf(exams.length * subjects.length)),
        single('2', '設問2', 2, 1), single('3', '設問3', 3, 1), single('4', '設問4', 4, 0),
      ]),
      explanation: '案Bは科目を科目IDで管理し，科目ごとの行に得点を格納する。科目を増減するときは科目表の行で対応できる。試験は年' +
        exams.length + '回なので，案Aは1試験1件の' + exams.length + '件，案Bは1試験5件の' + exams.length * subjects.length +
        '件になる。SQL（Structured Query Language、データベース操作言語）では，合計点の抽出で履歴と成績の両方を' + year +
        '年度にそろえる。平均点も両表を' + meanYear + '年度にそろえ，担任番号を教員表に結合してクラスと氏名でまとめる。' +
        '“' + name + '”の検索は生徒番号と試験IDで表を結合して氏名を条件とし，同名の生徒もすべて残す。',
    };
  });
