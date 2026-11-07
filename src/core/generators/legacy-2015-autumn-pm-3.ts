import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, strings, variableNotes } from './definition';
import { autumn2015Pm0104Diagram as diagram, autumn2015Pm0104Profiles as profiles } from './legacy-2015-autumn-pm-01-04-figures';
import { autumn2015Pm3CaseCount, autumn2015Pm3Inputs } from './legacy-2015-autumn-pm-01-04-models';
import { autumn2015PmAnswers, autumn2015PmBank as bank, autumn2015PmCase, autumn2015PmSingle as single } from './legacy-2015-autumn-pm-01-04-shared';
import { pm3Choices as choices, pm3Text as text } from './legacy-2015-autumn-pm-01-04-text';

const displayDate = (date: string) => Number(date.slice(0, 4)) + '年' + Number(date.slice(4, 6)) + '月' + Number(date.slice(6)) + '日';
const columns = 'SELECT 顧客表.顧客番号, 顧客表.顧客名,\n       出荷表.出荷番号, 出荷表.出荷日, 出荷表.出荷数';
const recallQuery = (condition: string) => columns +
  '\nFROM 顧客表, 出荷表\nWHERE 出荷表.顧客番号 = 顧客表.顧客番号 AND\n      ' + condition +
  ' AND\n      ［a］\nORDER BY 顧客表.顧客番号';
const totalsQuery = 'SELECT ［c］ AS 合計出荷金額\nFROM 出荷表\nWHERE ［b］ AND\n      ［a］';

export const legacy2015AutumnPm3Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-3',
  title: '電子部品の出荷データを管理する関係データベースの運用',
  sourceAnswer: '設問1 a=ウ、設問2 b=エ、設問3 c=エ、設問4 d=イ・e=ア',
  version: '3.2.0',
  fields: [field('リコール対象の期間・部品・出荷例', 0, autumn2015Pm3CaseCount - 1)],
  reference: [0],
  publicNotes: '原問の表とSQLの空欄を保ち、回収対象の部品番号、両端を含む対象期間、出荷と同梱のデータ例を変えています。',
  notes: variableNotes + ' 物理・印刷p.13〜16、5欄21択。対象期間は両端を含む。単品と対象部品を同梱するパッケージの抽出、合計、既存行の保持・回収表の結合という問いは固定し、同じ演算子が正答である。図は主キーの下線を保持し、パッケージの入れ子を認めず、先行SQLの空欄へ答えを先出ししない。ANYの副問合せを原のまま表示する。',
  build(values) {
    const index = autumn2015PmCase(values, autumn2015Pm3CaseCount - 1);
    const c = autumn2015Pm3Inputs(index);
    const range = choices.a.map(x => x.replaceAll('20150110', c.start).replaceAll('20150120', c.end));
    const includes = choices.b.map(x => x.replaceAll('007551', c.component));
    const recovery = choices.e.map(items => items.join('と'));
    const sqlBank = (items: readonly string[]) => [p('解答群'), ...items.flatMap((item, i) =>
      [p('アイウエ'[i]), code(item, 'sql')])];
    return {
      prompt: [
        p(text.heading), p(text.opening), diagram(profiles.relations, [index, 0], '図1 表の構成とデータの格納例'),
        p(text.s1.replace('007551', c.component).replace('2015年1月10日', displayDate(c.start)).replace('2015年1月20日', displayDate(c.end))),
        code(recallQuery("出荷表.部品番号 = '" + c.component + "'"), 'sql'), ...sqlBank(range),
        ...text.s2.map(p), diagram(profiles.relations, [index, 1], '図2 パッケージ表の構成とデータの格納例'),
        code(recallQuery('［b］'), 'sql'), ...sqlBank(includes),
        p(text.s3), code(totalsQuery, 'sql'), ...sqlBank(choices.c),
        p(text.s4), p(text.extend), p(text.recovery),
        ...bank('dに関する解答群', choices.d), ...bank('eに関する解答群', recovery),
      ],
      ...autumn2015PmAnswers([
        ...[range, includes, choices.c].map(items => items.map(x => [code(x, 'sql')])),
        strings([...choices.d]), strings(recovery),
      ], [
        single('a', '設問1 a', 0, 2), single('b', '設問2 b', 1, 3), single('c', '設問3 c', 2, 3),
        single('d', '設問4 d', 3, 1), single('e', '設問4 e', 4, 0),
      ]),
      explanation: [
        'a：' + displayDate(c.start) + 'から' + displayDate(c.end) + 'までの両端と中間日を含める。BETWEENは両端を含む。ORやINの二つの等値では中間日を漏らし，リテラル列への原問のANYも範囲を指定しない。',
        'b：単品' + c.component + 'の出荷、又は同梱部品が' + c.component + 'であるパッケージの出荷が対象。副問合せは同梱部品を条件にパッケージの部品番号を返す。図2の' + c.package +
          'はこの条件を満たす。ANDでは対象が狭過ぎ，パッケージ番号を同梱部品の値と取り違えるウはこのパッケージを抽出できない。',
        'c：対象の出荷金額の総和はSUMで求める。AVGは平均、COUNTは件数、MAXは最大値を返す。',
        'd：出荷ごとに回収日と再出荷番号を記録するので、出荷表が列追加先。顧客・部品・パッケージを単位とする表では同じ対象の異なる出荷を区別できない。',
        'e：出荷表には日と金額、回収表には回収対象となった元の出荷番号がある。両表を照合して対象の元出荷を除外する。再出荷時の番号で除外してはならない。他の組合せは金額又は回収対象の元出荷を得られない。',
      ].join('\n'),
    };
  },
};
