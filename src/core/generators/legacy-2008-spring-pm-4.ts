import { code, p, strings, table } from './definition';
import { spring2008PmPageAssetId, spring2008PmReference } from './legacy-2008-spring-pm-materials';
import { answers, bank, bankBlocks, define, single } from './legacy-2008-spring-pm-01-05-shared';
import { draw } from './legacy-2008-spring-pm-01-05-figures';
import { listCases, listTrace } from './legacy-2008-spring-pm-4-model';

const references = [2, 3] as const;
const headers = ['引数／返却値', 'データ型', '入力／出力', '意味'];
const a = ['First', 'First + 1', 'First − 1', 'Listsize', 'Listsize + 1', 'Listsize − 1'];
const bcd = ['Current', 'First', 'List[Current].Next', 'List[First].Next', 'List[Temp].Next', 'Temp'];
const originalTrails = [
  'cgi, cpu, usb', 'usb, cgi, cpu', 'usb, cgi, usb, cgi, cpu, usb, cgi, cpu, dos',
  'usb, cgi, usb, cpu, cgi', 'usb, cgi, usb, cpu, cgi, usb', 'usb, usb, cgi, usb, cgi, cpu',
];
function trails(index: number): string[] {
  if (index === 0) return originalTrails;
  const { queries, trial } = listCases[index];
  const correct = listTrace(index);
  const listed: readonly string[] = trial;
  const head = listed[0], targets = queries.map(query => listed[query]);
  const fixedOrder = targets.flatMap(target => listed.slice(0, listed.indexOf(target)));
  return [
    targets.join(', '),
    targets.map(target => listed[listed.indexOf(target) - 1]).join(', '),
    [...correct, targets.at(-1)].join(', '),
    correct.slice(1).join(', '),
    correct.join(', '),
    fixedOrder.join(', ') === correct.join(', ') ? [head, ...fixedOrder].join(', ') : fixedOrder.join(', '),
  ];
}
function listStructure() {
  return [
    '構造体型: List[100] {',
    '  整数型: Next = −1,  /* 次の要素の添字，初期値は−1 */',
    '  文字列型: Value     /* 要素の値，可変長文字列 */',
    '}',
  ];
}

export function spring2008Pm4Pages(index: number) {
  const { base, initial, example, trial, queries } = listCases[index];
  const current = 'Listsize' + (base ? ' + 1' : '');
  const former = 'Listsize' + (base ? '' : ' − 1');
  return [[
    p('問4　次のプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    p('〔プログラムの説明〕'),
    p('（1）リストを作成するのに用いる副プログラム MakeList と，作成したリストを逐次探索する関数 OrganizingSearch である。OrganizingSearch は，見つかった要素がリストの先頭にくるように要素を並べ替える。'),
    p('（2）リストは構造体の配列で表現する。構造体の定義は，次のとおりである。'),
    code(listStructure().join('\n')),
    p('ここで，List は大域変数であり，配列の添字は' + base + 'から始まる。添字が n の要素 List[n] の Next と Value は，それぞれ List[n].Next，List[n].Value で表す。'),
    p('（3）副プログラム MakeList は，1回の呼出しで，引数の文字列を値とする要素を作成し，リストの最後に追加する。MakeList は探索対象のリストが完成するまで続けて呼び出される。整数型の大域変数 Listsize には，作成したリストの要素数を格納する。リストの要素は，List[' +
      base + '] から，List[' + former + '] に格納する。'),
    p('リストに登録する要素の個数は，配列の大きさ以下とする。また，リストの先頭の要素が格納されている配列 List の添字は，整数型の大域変数 First に格納する。First の初期値は−1とする。リストが空の状態から，MakeList の引数として ' +
      initial.map(value => "'" + value + "'").join('，') + ' の順に与えて作成したリストの例を図1に示す。'),
    draw('list', index * 3, '図1　リストの例'),
  ], [
    p('（4）副プログラム MakeList の引数の仕様を表1に示す。'),
    table('表1　MakeList の引数の仕様', ['引数', ...headers.slice(1)], [['Mvalue', '文字列型', '入力', 'リストに追加する文字列']]),
    p('（5）関数 OrganizingSearch は，リストの先頭から引数で与えられた文字列を探索し，文字列が見つかれば，見つかった要素がリストの先頭になるようにリストの要素を並べ替え，見つかった要素が格納されている配列 List の添字を返却する。見つからなければ−1を返却する。図1のリストの例で，文字列 ' +
      "'" + initial[example] + "' を見つけた直後のリストの状態を図2に示す。この例では，OrganizingSearch の返却値は" + (example + base) + 'となる。'),
    draw('list', index * 3 + 1, "図2　'" + initial[example] + "' を見つけた直後のリストの状態"),
    p('（6）関数 OrganizingSearch の引数と返却値の仕様を表2に示す。'),
    table('表2　OrganizingSearch の引数と返却値の仕様', headers, [
      ['Svalue', '文字列型', '入力', '探索する文字列'],
      ['返却値', '整数型', '出力', 'Svalue と一致した文字列を Value としてもつ要素の添字。一致する要素がなければ−1'],
    ]),
  ], [
    p('〔プログラム〕'),
    code([
      '○大域: 整数型: Listsize = 0   /* リストの要素数 */',
      '○大域: 整数型: First = −1     /* リストの先頭要素の添字 */',
      ...listStructure().map((line, lineNumber) => (lineNumber === 0 ? '○大域: ' : '       ') + line),
      '', '/* 副プログラム MakeList */', '○MakeList(文字列型: Mvalue)',
      '', '▲ Listsize ≠ 0', '│  ・List[' + former + '].Next ← ［a］', '├', '│  ・First ← ' + base, '▼',
      '・List[' + current + '].Value ← Mvalue', '・Listsize ← Listsize + 1', '/* 副プログラム MakeList の終わり */',
      '', '/* 関数 OrganizingSearch */', '○整数型: OrganizingSearch(文字列型: Svalue)', '○整数型: Current', '○整数型: Temp',
      '', '・Current ← First', '', '■ Current ≠ −1', '│  ▲ List[Current].Value = Svalue', '│  │  ▲ Current ≠ First',
      '│  │  │  ・［b］ ← List[Current].Next', '│  │  │  ・List[Current].Next ← ［c］', '│  │  │  ・First ← ［d］',
      '│  │  ▼', '│  │  ・break                 /* 繰返し処理から抜け出す。 */', '│  ├',
      '│  │  ・Temp ← Current       ← α', '│  │  ・Current ← List[Current].Next', '│  ▼', '■',
      '・return Current', '/* 関数 OrganizingSearch の終わり */',
    ].join('\n')),
  ], [
    p('設問1　プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    ...bankBlocks('aに関する解答群', a.map(term => [code(term)])), ...bankBlocks('b〜dに関する解答群', bcd.map(term => [code(term)])),
    p('設問2　図3に示すリストに対して，文字列 ' + queries.map(query => "'" + trial[query] + "'").join('，') +
      ' の順に探索した場合，プログラム中の α の部分が実行された直後の List[Temp].Value の値を順に並べたものとして正しい答えを，解答群の中から選べ。'),
    draw('list', index * 3 + 2, '図3　リスト'), ...bank('解答群', trails(index)),
  ]];
}

export const legacy2008SpringPm4Definition = define(4, '単方向リストの自己組織化探索', '設問1 a=エ・b=オ・c=イ・d=ア・設問2=オ',
  '配列の開始添字・初期リスト・探索文字列', '開始添字、リストに登録する文字列、末尾追加と先頭移動の追跡例を変更します。',
  'p.12〜15。単方向リンク、ListsizeとFirst、末端−1、作成後に探索する前提、α実行時だけのトレース、疑似言語制御線、共通p.2〜3を保持。', index => {
    const { base } = listCases[index], trace = listTrace(index);
    return {
      prompt: spring2008Pm4Pages(index).flat(),
      contexts: [spring2008PmReference('共通に使用される擬似言語の記述形式', references)],
      ...answers([a.map(term => [code(term)]), bcd.map(term => [code(term)]), strings(trails(index))], [
        single('a', '設問1 a', 0, base ? 4 : 3), single('b', '設問1 b', 1, 4),
        single('c', '設問1 c', 1, 1), single('d', '設問1 d', 1, 0), single('s2', '設問2', 2, 4),
      ]),
      explanation: 'a：新しい要素の添字は使用済み要素数' + (base ? '＋1' : '') +
        '。b：直前の要素 Temp の Next を現在要素の後続へ移す。c：現在要素の後続をそれまでの先頭 First に変える。d：Current を先頭にする。探索値と一致しなかった位置だけで α が実行され，そのつど Temp は現在位置になる。その値を先頭の更新も反映して並べると ' +
        trace.join('，') + ' となる。',
    };
  }, { fixedReferenceAssetIds: references.map(spring2008PmPageAssetId) });
