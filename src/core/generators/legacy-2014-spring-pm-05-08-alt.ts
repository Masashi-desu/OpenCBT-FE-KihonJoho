import { q6Percentages, q6Stages, q7VerticalBank, q8Program,
  spring2014Pm0508Banks, spring2014Pm0508Pages } from './legacy-2014-spring-pm-05-08-source';
import {
  interval, q5Add, q5CLinks, q5Data, q5DLinks, q5Events, q5Interface, q6Flows, q6Functions, q6Productivity,
  q6SizeColumns, q6VisibleStages, q6VisibleTotals, q7Edges, q7VisibleSchedule, q7WorkTable, q8AllocTable, q8Cells,
  q8FreeTable, shaded, type Table,
} from './legacy-2014-spring-pm-05-08-model';
const labels = 'アイウエオカキクケコ';
const textTable = ({ caption, columns, rows }: Table) =>
  [caption, columns.join('｜'), ...rows.map(row => row.join('｜'))].join('\n');

export const spring2014Pm0508Captions: Record<string, string> = {
  'q5-c-flow': '図1　C社システムの構成',
  'q5-d-flow': '図2　D社システムの構成（一部）',
  'q5-timing': '表3　在庫を更新するタイミングとインタフェースの設定内容',
  'q5-triple': 'c〜fの解答群の候補',
  'q6-flow': '図1　名簿データ管理システムの処理フロー図',
  'q6-totals': '表3　処理ごとのファンクション数と開発規模一覧',
  'q6-stages': '表4　処理別工程ごとの工数一覧',
  'q7-network': '図1　作成途中のアローダイアグラム',
  'q7-schedule': '表2　要員計画表の一部',
  'q7-vertical': 'dに関する解答群の候補',
  'q8-initial': '領域の初期状態',
  'q8-after-alloc': '割当て実行後の領域',
  'q8-after-free': '解放実行後の領域',
  'q8-program': '関数Allocのプログラム',
};
const lines = (entries: readonly (readonly string[])[]) => entries.map(row => row.join('｜')).join('\n');

export function q0508FigureAlt(id: string, values: number[]): string {
  const [input, choice] = values;
  switch (id) {
    case 'q5-c-flow':
    case 'q5-d-flow':
      return (id === 'q5-c-flow' ? '凡例：AシステムからBシステムに対して情報Cを渡す。\n' : '') +
        (id === 'q5-c-flow' ? q5CLinks : q5DLinks).map(([from, to, name]) => from + '→' + to + '：' + name).join('\n');
    case 'q5-timing': {
      const { positions } = q5Data(input);
      return '在庫を更新するタイミング｜品番コード｜在庫区分・入出庫区分・数量\n' +
        '品番コードは全行，更新を行う在庫品の品番コード。\n' +
        q5Events.map(([system, event], row) => {
          const place = positions.findIndex(position => position === row);
          return system + '｜' + event + '｜' + (place < 0 ? shaded : '［' + 'cdef'[place] + '］');
        }).join('\n');
    }
    case 'q5-triple': return q5Data(input).choices[choice].join('｜');
    case 'q6-flow': return '左に入力データ，右に抽出データ。\n' + q6Flows.map(([from, to]) => from + '→' + to).join('\n');
    case 'q6-totals': {
      const t = q6VisibleTotals(input);
      return '処理名｜' + q6SizeColumns.join('｜') + '\n' + t.rows.map(row =>
        row.process + '｜上段 ' + row.count.join('｜') + '｜（斜線）\n下段 ' + row.size.join('｜') + '｜' +
        row.total + '｜処理別工数 ' + row.effort).join('\n') +
        '\nファンクション別開発規模合計｜' + t.totals.join('｜') + '｜' + shaded;
    }
    case 'q6-stages': return '処理名｜' + q6Stages.map((name, i) => name + ' ' + q6Percentages[i] + '%').join('｜') +
      '｜処理別工数合計（人月）\n' + lines(q6VisibleStages(input).map(row => [row.process, ...row.cells, row.effort]));
    case 'q7-network': return 'ノード1〜12。描かれた矢線は' + q7Edges.map(([from, to, task]) => from + '→' + to + '：No' + task).join('，') + '。';
    case 'q7-schedule': return '開始時刻｜作業｜必要人数\n' + q7VisibleSchedule(input).map(({ time, tasks, people }) =>
      time + '時｜' + (tasks ? tasks.filter(Boolean).map(n => n > 0 ? 'No' + n : 'No7の続き').join('，') : shaded) + '｜' + people).join('\n') +
      '\nこの後は波線で省略。13〜15時の必要人数3欄は一つの［d］。';
    case 'q7-vertical': return q7VerticalBank[choice].join('／');
    case 'q8-initial':
    case 'q8-after-alloc':
    case 'q8-after-free': {
      const { active, label, list } = q8Cells(input, id === 'q8-initial' ? 0 : id === 'q8-after-alloc' ? 1 : 2);
      return '左から省略記号，セル0〜9，省略記号。' + (active.some(Boolean) ?
        '割当済みのセルは' + active.flatMap((used, i) => used ? [i] : []).join('，') + '。ほかは空き。' : '全て空き。') +
        '\n' + label + '：{ ' + list.map(interval).join('，') + ' }';
    }
    case 'q8-program': return q8Program;
    default: throw Error('FIGURE_PROFILE: ' + id);
  }
}

const tables: Record<string, Table> = {
  'q5-add': q5Add, 'q5-interface': q5Interface, 'q6-functions': q6Functions(0), 'q6-productivity': q6Productivity,
  'q7-work': q7WorkTable(0), 'q8-alloc-table': q8AllocTable, 'q8-free-table': q8FreeTable(0),
};
function bankAlt(id: string) {
  const name = id === '5cf' ? 'c〜f' : id === '73' ? '' : id[1] + (id.length === 3 ? '，' + id[2] : '');
  return [name ? name + 'に関する解答群' : '解答群', ...spring2014Pm0508Banks[id].map((option, i) => labels[i] + '　' + option)].join('\n');
}
export const spring2014Pm0508PageAlt = Object.fromEntries(Object.entries(spring2014Pm0508Pages).map(([page, rows]) => [page,
  rows.map(token => {
    if (token.startsWith('#')) return bankAlt(token.slice(1));
    if (!token.startsWith('§')) return token;
    const id = token.slice(1);
    if (tables[id]) return textTable(tables[id]);
    const alt = q0508FigureAlt(id, [0]);
    return (spring2014Pm0508Captions[id] ?? '') + '\n' + alt;
  }).join('\n\n'),
]));
