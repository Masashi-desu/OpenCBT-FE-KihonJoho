import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, table } from './definition';
import {
  autumn2014Pm0508Banks as banks, q6Classes, q6ClassNames, q6Ledger, q6Meets, q6Repeats, q6Tables, q6Weeks,
} from './legacy-2014-autumn-pm-05-08-source';
import { answerField, body, choiceBank, promptPages, selectInput } from './legacy-2014-autumn-pm-05-08-shared';

const settings = [
  { goal: 30, cap: 30, login3: 5, connect4: 12, minutes: 10, meets: q6Meets },
  { goal: 25, cap: 45, login3: 5, connect4: 10, minutes: 15, meets: [[25, 14, 4, 3], [18, 16, 15, 16]] },
  { goal: 52, cap: 23, login3: 6, connect4: 15, minutes: 10, meets: [[32, 17, 5, 3], [20, 19, 17, 19]] },
];
const sum = (ns: readonly number[]) => ns.reduce((a, b) => a + b, 0);
function time(s: string) {
  const [hours, minutes] = s.split(':').map(Number);
  return hours * 60 + minutes;
}
function build(values: number[]) {
  const s = selectInput(values, settings), weeks = q6Weeks.map(row => [...row]);
  weeks[0][2] = s.login3;
  weeks[2][3] = s.connect4;
  const tables: Record<string, ReturnType<typeof q6Tables>[keyof ReturnType<typeof q6Tables>]> = q6Tables(weeks, s.meets);
  const prompt = promptPages(31, 35, id => {
    const t = tables[id];
    return table(t.caption, t.columns, t.rows);
  }, text => text.replace('サービスデスク問合せ数が30以下', 'サービスデスク問合せ数が' + s.cap + '以下')
    .replace('受付から30分以内', '受付から' + s.goal + '分以内').replace('平均10分短縮', '平均' + s.minutes + '分短縮'));
  const ledgerDesk = q6Ledger.filter(([, , , category, detail, assigned]) => assigned === 'サービスデスク' ||
    category === '操作' || category === 'ログイン' || (!category && detail.includes('パスワード')));
  const done = ledgerDesk.filter(([, start, end]) => time(end) - time(start) <= s.goal).length;
  const percentage = Math.round(done * 100 / ledgerDesk.length);
  const reduced = q6ClassNames.filter((_, row) => weeks[row][3] * 2 <= weeks[row][0]);
  const reductionChoice = banks['6a'].find(value => typeof value === 'string' &&
    value.split('と').length === reduced.length && value.split('と').every(name => reduced.includes(name)));
  if (typeof reductionChoice !== 'string') throw new Error('PARAMETER_CONSTRAINT');
  const groups = new Map<string, number>();
  q6Classes.forEach(([, , team], row) => groups.set(team, (groups.get(team) ?? 0) + weeks[row][3]));
  const busiest = [...groups].sort((a, b) => b[1] - a[1])[0][0];
  const first = [0, 1, 2, 3].find(week => sum(weeks.map(row => row[week])) <= 150 && weeks[0][week] + weeks[1][week] <= s.cap);
  if (first === undefined || first === 0) throw new Error('PARAMETER_CONSTRAINT');
  const staffing = first === 3 ? 3 : first - 1;
  const strictlyIncreasing = (row: number) => s.meets[row].every((m, w) =>
    !w || m * weeks[row][w - 1] > s.meets[row][w - 1] * weeks[row][w]);
  const loginUp = strictlyIncreasing(0), opsUp = strictlyIncreasing(1);
  const trend = loginUp ? opsUp ? 0 : 3 : opsUp ? 2 : 1;
  const growth = [1, 3, 4], week5 = weeks.map((row, i) => row[3] * (growth.includes(i) ? 1.25 : 1));
  const repeats5 = q6Repeats.map((n, i) => n * (growth.includes(i) ? 1.25 : 1));
  const total = sum(week5), changed = sum(repeats5.slice(2)), minutes = changed * s.minutes, faq = sum(repeats5) / 4;
  return body(prompt, ['61', '6a', '6b', '6c', '6d', '6e', '6f', '6g'].map(choiceBank), [
    answerField('1', '61', percentage), answerField('a', '6a', reductionChoice), answerField('b', '6b', busiest),
    answerField('c', '6c', banks['6c'][staffing]), answerField('d', '6d', banks['6d'][trend]),
    answerField('e', '6e', total), answerField('f', '6f', minutes), answerField('g', '6g', faq),
  ], '表2でサービスデスクが回答する問合せは' + ledgerDesk.map(row => row[0]).join('，') + 'の' + ledgerDesk.length +
    '件。受付から' + s.goal + '分以内は' + done + '件なので達成率は' + percentage + '%（設問1）。' +
    '表3で第4週の数を2倍して第1週の数以下なのは' + reductionChoice + '（a）。第4週の担当別合計は' +
    [...groups].map(([name, n]) => name + n + '件').join('，') + 'で，最多は' + busiest + '（b）。' +
    '総数150以下とサービスデスク' + s.cap + '以下を初めて同時に満たすのは第' + (first + 1) + '週。' +
    (first === 3 ? '追加導入のため第5週の増員は維持する。' : '翌週の第' + (first + 2) + '週に減員する。') +
    '（c）。ログインと操作の各列は括弧内の数を当該区分の件数で割り，' + banks['6d'][trend] + '（d）。' +
    '第5週は操作・目標管理・販売実績のみを1.25倍にして' + total + '件（e）。以前の同種問合せは区分別に同じ割合なので' +
    repeats5.join('，') + '件。従来サービスデスクが回答しない区分の' + changed + '件に限り1件' + s.minutes +
    '分を短縮して' + minutes + '分（f）。FAQは全区分の同種問合せ' + sum(repeats5) + '件の半数が対象で，その半数を削減するので' +
    faq + '件（g）。');
}

export const legacy2014AutumnPm6Definition: AfternoonBookletDefinition = {
  source: '2014h26a-fe-pm-6', title: 'サービスデスクの問合せ対応',
  version: '3.7.0', reference: [0], fields: [field('回答目標・人員の閾値・問合せ数', 0, settings.length - 1)],
  sourceAnswer: 'オ／オ／イ／イ／エ／エ／ア／イ',
  notes: '物理・冊子p31–35。四表、担当、網掛け、比の小数第3位の四捨五入、両閾値と第5週の例外、区分別増加率と同種比率、FAQの対象と削減率、8欄を保持。SLAと増員閾値・週別件数・1件の短縮時間を三条件で可変化。',
  publicNotes: '回答完了の目標時間、要員を戻す条件、週ごとの問合せ数及び回答の短縮時間を変更しました。',
  build,
};
