import { p, strings, table } from './definition';
import { answers, define, marks, single } from './legacy-2004-spring-pm-01-05-shared';
import { countRows, draw, newsCases, newsCategories, newsFlowFigure, recordFigure, recordTitles } from './legacy-2004-spring-pm-01-05-figures';

const fieldBank = ['端末種別', '抽出開始時刻', '抽出開始年月日', '登録時刻', '登録年月日', '分類', '利用者ID'];
const sortBank = ['概要', '画像ファイルのアドレス', '詳細', '抽出開始時刻', '登録時刻', '登録年月日', '発生時刻', '発生年月日', '分類'];
const yyyyMmDd = (date: string) => Number(date.slice(0, 4)) + '年' + Number(date.slice(4, 6)) + '月' + Number(date.slice(6, 8)) + '日';
const hhMm = (time: string) => Number(time.slice(0, 2)) + '時' + time.slice(2) + '分';
const hour = (h: number) => String(h).padStart(2, '0');
const dayMs = 24 * 60 * 60 * 1000;
const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

function timestamp(date: string, time: string): number {
  return Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6)),
    Number(time.slice(0, 2)), Number(time.slice(2, 4)));
}
function dateParts(timestamp: number) {
  const iso = new Date(timestamp).toISOString();
  return [iso.slice(0, 10).replaceAll('-', ''), iso.slice(11, 16).replace(':', '')];
}

export function newsData(index: number) {
  const { previous, current, categories, cutoffHour, limit } = newsCases[index];
  const currentTime = timestamp(current[0], current[1]);
  const start = dateParts(Math.max(currentTime - dayMs, timestamp(previous[0], previous[1])));
  const timeBank = ['0000', current[1], previous[1], dateParts(currentTime - 2 * dayMs)[0],
    dateParts(currentTime - dayMs)[0], current[0]].map(item => '“' + item + '”');
  const selected = categories.map(category => countRows[newsCategories.indexOf(category)]);
  const totals = selected.map(row => sum(row.slice(cutoffHour)));
  const selectedCount = sum(totals);
  const cappedCount = sum(totals.map(total => Math.min(limit, total)));
  const countBank = [cappedCount, sum(selected.map(row => Math.min(limit, sum(row.slice(cutoffHour - 1))))),
    selectedCount, sum(selected.map(sum)), 2 * categories.length * limit,
    sum(countRows.map(row => sum(row.slice(cutoffHour)))), sum(countRows.map(sum))]
    .sort((a, b) => a - b).map(String);
  if (new Set(countBank).size !== 7) throw Error('重複する登録件数候補');
  return { start, timeBank, selectedCount, cappedCount, countBank, totals };
}

const fieldOptions = strings(fieldBank), sortOptions = strings(sortBank);

const textBank = (options: readonly string[]) =>
  [p('解答群'), ...options.map((option, index) => p(marks[index] + '　' + option))];

export const spring2004Pm5Pages = (index: number) => {
  const { current, limit } = newsCases[index];
  const { timeBank, countBank } = newsData(index);
  const record = (row: number) => draw(recordFigure, recordTitles[row], index, row);
  const question = (number: number) => p('設問' + number + '　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。');
  return [
    [
      p('問5　プログラム設計に関する次の記述を読んで，設問1～4に答えよ。'),
      p('利用者の好みに合わせて国内ニュースを提供するシステムを設計する。このシステムの概要は，次のとおりである。'),
      p('〔システムの概要〕'),
      p('（1）提供するニュースは，ニュースファイルに次の様式で格納されている。ニュースファイルは，1件のニュースを1レコードとする順ファイルであり，ニュースが登録された順に記録されている。'),
      record(0),
      p('登録年月日は，ニュースが登録された年月日を表す8けたの文字列である。例えば，2004年4月1日の場合，“20040401”となる。登録時刻は，ニュースが登録された時分を表す4けたの文字列である。例えば，午後6時30分の場合，“1830”となる。発生年月日は，ニュースが発生した年月日であり，登録年月日と同様の様式である。発生時刻は，ニュースが発生した時刻であり，登録時刻と同様の様式である。分類は，ニュースの分類であり，“医療”，“教育”，“経済”，“芸能”，“サイエンス”，“社会”，“スポーツ”，“政治”のいずれかが格納される。更にニュースの見出し，概要，詳細及び関連する画像ファイルのアドレスが含まれる。'),
      p('（2）利用者の情報は，利用者ファイルに次の様式で登録されている。利用者ファイルは，利用者IDをキーとする索引ファイルである。'),
      record(1),
      p('利用者ファイルには，利用者の好みのニュースの分類が一つ以上五つまで分類1から順に登録されている。分類が五つに満たない場合，残りの分類には“NIL”'),
    ],
    [
      p('（空を示す）が格納される。システムが提供するニュースは，登録されている分類ごとに，発生年月日，発生時刻の新しいものから最大' + limit + '件ずつである。'),
      p('前回利用年月日と前回利用時刻は，利用者が最後にシステムを利用した日時である。前回利用年月日，前回利用時刻は，ニュースファイルの登録年月日，登録時刻とそれぞれ同じ様式の文字列である。'),
      p('（3）利用者がシステムを利用する日時が，最後に利用した日時から24時間を超える場合，現在時刻の24時間前から登録されたすべてのニュースを対象に抽出を行う。利用者がシステムを利用する日時が，最後に利用した日時から24時間以内の場合，最後に利用した日時以降に登録されたニュースを対象に抽出を行う。'),
      p('（4）システムは，利用者の端末種別に基づき，提供する抽出結果の様式を変更する。利用者の端末が携帯電話などの場合，端末種別は“簡易”であり，ニュースの概要を提供する。パソコンなどの場合，端末種別は“詳細”であり，ニュースの詳細や画像を提供する。'),
    ],
    [
      draw(newsFlowFigure, '図　処理の流れ', index),
      p('〔処理の説明〕'),
      p('（1）要求受付処理では，次の様式の利用者の要求情報に含まれる利用者IDを基に，利用者ファイルから利用者IDの一致するレコードを選択する。'),
      p('なお，様式中の端末種別には，“簡易”か“詳細”かの区分が格納される。'),
      record(2),
    ],
    [
      p('さらに，要求情報と選択したレコードから，次の様式のレコードを一時ファイルAに書き出す。'),
      record(3),
      p('最後に，利用者ファイルの該当利用者レコードの前回利用年月日，前回利用時刻の値を，それぞれ現在の年月日，時刻に更新する。'),
      p('（2）ニュース抽出処理では，一時ファイルAを基に，ニュースファイルから次の二つの条件を同時に満たすレコードを抽出する。'),
      p('① ニュースファイルのレコードの登録年月日，登録時刻が，一時ファイルAの抽出開始年月日，抽出開始時刻以降である。'),
      p('② ニュースファイルのレコードの分類が，一時ファイルAの分類1～5のどれかと一致する。'),
      p('これらの条件を満たすレコードに，必要な情報を加えて一時ファイルBに書き出す。'),
      p('（3）ニュース整列処理では，一時ファイルBを整列して，一時ファイルCへ書き出す。'),
      p('（4）結果出力処理では，一時ファイルCから分類ごとに最大' + limit + '件を抽出し，その結果を，端末種別に従って次の様式で書き出す。'),
      record(4), record(5),
      p('（5）ここで，各処理間の情報受渡しは，図に示すファイルだけで行われるものとする。'),
    ],
    [
      question(1),
      p('ある利用者の利用者ファイルのレコードが次のとおりであった。'),
      record(6),
      p('この利用者が' + yyyyMmDd(current[0]) + 'の' + hhMm(current[1]) + 'にシステムを利用した場合，要求受付処理において，一時ファイルAの抽出開始年月日には［a］が，抽出開始時刻には［b］が格納される。'),
      ...textBank(timeBank),
      p('設問2　ニュース抽出処理で出力される一時ファイルBのレコード様式は，次のとおりである。この様式中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      record(7),
      ...textBank(fieldBank),
    ],
    [
      question(3),
      p('ニュース整列処理では，ニュース抽出処理で出力されたレコードを対象に整列処理を行う。このとき，第1整列キーは［e］で文字コードの昇順とし，第2整列キーは［f］で降順，第3整列キーは［g］で降順とする。'),
      ...textBank(sortBank),
      question(4),
      p('ある利用者の利用者ファイルのレコードが次のとおりであった。'),
      record(8),
      p('2004年4月1日の11時00分における，分類ごとのニュースの登録件数が次の表のとおりであったとする。この利用者が同年月日の同時刻にシステムを利用した場合，ニュース整列処理で一時ファイルCに書き出されるレコードの件数は［h］件であり，結果出力処理で表示されるニュースの件数は［i］件である。'),
    ],
    [
      table('表　ニュースの登録件数（1時間ごとの登録件数）', ['分類', ...Array.from({ length: 11 }, (_, h) =>
        hour(h) + ':00～' + hour(h) + ':59')],
        countRows.map((row, category) => [newsCategories[category], ...row.map(String)])),
      ...textBank(countBank),
    ],
  ];
};

export const spring2004Pm5 = define(5, 'ニュース抽出と分類毎の先頭出力', 'オイアカケクキウア', '要求日時、対象分類と分類別の上限',
  '入力した要求日時、前回の利用日時、抽出分類と出力件数の上限を可変にする。',
  '処理間が図示のファイルだけでつながる前提、登録と発生の日時、24時間境界と日付・時刻の空欄、c/dの順不同、3整列キー及び2件数の形式を維持する。', index => {
    const { categories, limit } = newsCases[index];
    const { start, timeBank, countBank, selectedCount, cappedCount, totals } = newsData(index);
    const banks = [strings(timeBank), fieldOptions, sortOptions, strings(countBank)];
    return {
      prompt: spring2004Pm5Pages(index).flat(),
      ...answers(banks, [
        single('a', '設問1 a', 0, timeBank.indexOf('“' + start[0] + '”')),
        single('b', '設問1 b', 0, timeBank.indexOf('“' + start[1] + '”')),
        { ids: ['c', 'd'], labels: ['設問2 c', '設問2 d'], bank: 1, correct: [0, 5] },
        single('e', '設問3 e', 2, 8), single('f', '設問3 f', 2, 7), single('g', '設問3 g', 2, 6),
        single('h', '設問4 h', 3, countBank.indexOf(String(selectedCount))),
        single('i', '設問4 i', 3, countBank.indexOf(String(cappedCount))),
      ]),
      explanation: '開始日時は前回の利用日時と現在の24時間前のうち新しい方なので' + yyyyMmDd(start[0]) + 'の' + hhMm(start[1]) +
        '。一時ファイルBに残すのは，後続処理で分類ごとに整列するための分類と，結果の様式を切り替えるための端末種別である。' +
        '整列キーは分類の昇順，発生年月日，発生時刻の降順。設問4で登録日時と分類の両方を満たすのは' +
        categories.map((category, i) => category + ' ' + totals[i] + '件').join('，') + 'で，整列後も合計' + selectedCount +
        '件となる。結果出力は各分類' + limit + '件までなので合計' + cappedCount + '件である。',
    };
  });
