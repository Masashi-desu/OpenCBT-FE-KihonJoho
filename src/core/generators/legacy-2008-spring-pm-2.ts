import { code, p, table } from './definition';
import { spring2008PmPageAssetId, spring2008PmReference } from './legacy-2008-spring-pm-materials';
import { answers, bankBlocks, define, single } from './legacy-2008-spring-pm-01-05-shared';
import { draw } from './legacy-2008-spring-pm-01-05-figures';

import { matchCases } from './legacy-2008-spring-pm-2-model';
const references = [2, 3] as const;

type Change = { success: string; failure?: string; after?: string };
const changes: readonly Change[] = [
  { success: '・Counter ← Counter + 1', after: '・i ← i + Patlen' },
  { success: '・Counter ← Counter + 1\n│  ・i ← i + Patlen' },
  { success: '・Counter ← Counter + 1\n│  ・i ← i + Patlen', failure: '・i ← i + 1' },
  { success: '・Counter ← Counter + 1\n│  ・i ← i + 1', failure: '・i ← i + Patlen' },
];
const changeCode = ({ success, failure, after }: Change) => [
  '▲ k = Patlen', '│  ' + success, ...(failure ? ['├', '│  ' + failure] : []), '▼', ...(after ? [after] : []),
].join('\n');

function matchBanks(index: number) {
  const { base } = matchCases[index];
  const end = base === 0 ? 'Textlen' : '(Textlen + 1)';
  return [
    ['i + Patlen ≦ ' + end, 'i + Patlen < ' + end, 'i + Textlen ≦ Patlen', 'i + Textlen < Patlen'].map(value => [code(value)]),
    ['SourceText[i] = Pattern[k]', 'SourceText[j] = Pattern[k]', 'SourceText[k] = Pattern[i]', 'SourceText[k] = Pattern[j]'].map(value => [code(value)]),
    changes.map(change => [code(changeCode(change).replace('k = Patlen', base ? 'k = (Patlen + 1)' : 'k = Patlen'))]),
  ];
}

export function spring2008Pm2Pages(index: number) {
  const { base } = matchCases[index], banks = matchBanks(index);
  return [[
    p('問2　次のプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    p('〔プログラムの説明〕'),
    p('長さが Textlen の文字列 SourceText の中で，長さが Patlen の文字列 Pattern と一致する部分の文字列（以下，部分文字列という）の出現回数を数える関数 MatchCounter である。ここで，0＜Patlen≦Textlen である。'),
    p('（1）MatchCounterの処理手順は，次のとおりである。'),
    p('① 一致する部分文字列の出現回数を数える変数 Counter の値を0に初期化する。'),
    p('② SourceText の比較開始位置を先頭から順に1文字ずつ後ろにずらしながら，その比較開始位置から始まる長さ Patlen の文字列と Pattern が一致するかどうかを調べ，一致したら出現回数 Counter の値に1を加算する。'),
    p('③ Counter の値を返す。'),
    p('（2）MatchCounter の引数と返却値の仕様を表に示す。文字列は文字型配列の各要素に1文字ずつ格納されている。また，各配列の添字は' + base + 'から始まる。'),
    table('表　MatchCounter の引数と返却値の仕様', ['引数／返却値', 'データ型', '入力／出力', '意味'], [
      ['SourceText[]', '文字型', '入力', '検索される文字列が格納されている1次元配列'],
      ['Textlen', '整数型', '入力', '検索される文字列の長さ'],
      ['Pattern[]', '文字型', '入力', '検索する文字列が格納されている1次元配列'],
      ['Patlen', '整数型', '入力', '検索する文字列の長さ'],
      ['返却値', '整数型', '出力', 'SourceText の中で Pattern と一致した部分文字列の出現回数'],
    ]),
  ], [
    p('〔プログラム〕'),
    code([
      '○整数型: MatchCounter(文字型: SourceText[], 整数型: Textlen,',
      '                      文字型: Pattern[], 整数型: Patlen)',
      '○整数型: Counter, i, j, k',
      '○論理型: Matchflg', '', '・Counter ← 0', '・i ← ' + base,
      '■ ［a］',
      '│  ・j ← i',
      '│  ・k ← ' + base,
      '│  ・Matchflg ← true',
      '│  ■ (k < ' + (base ? '(Patlen + 1)' : 'Patlen') + ') and (Matchflg = true)',
      '│  │  ▲ ［b］',
      '│  │  │  ・j ← j + 1',
      '│  │  │  ・k ← k + 1',
      '│  │  ├',
      '│  │  │  ・Matchflg ← false',
      '│  │  ▼',
      '│  ■', '',
      '│  ┌ α部分',
      '│  ▲ k = ' + (base ? '(Patlen + 1)' : 'Patlen'),
      '│  │  ・Counter ← Counter + 1',
      '│  ▼', '│  ・i ← i + 1', '│  └', '■', '・return Counter',
    ].join('\n')),
    p('設問1　プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    ...bankBlocks('aに関する解答群', banks[0]), ...bankBlocks('bに関する解答群', banks[1]),
  ], [
    p('設問2　Pattern と一致した部分文字列は以降の検索対象から外すように，このプログラムを変更する。'),
    p('例えば，SourceText と Pattern が図に示す文字列であるとき，プログラムでは，比較開始位置を①，②，③，…と移動して，一致する部分文字列の出現回数を求めるので，下線の部分文字列と二重下線の部分文字列がともに数えられる。これに対して，一致した部分文字列を検索対象から外す場合は，比較開始位置を①，②，⑤，…と移動するので，二重下線の部分文字列は数えられない。' + (base ? '図の丸数字は配列の開始添字にかかわらず先頭を①とする位置の番号である。' : '')),
    draw('match', index, '図　比較開始位置を変更する場合の例'),
    p('このとき，プログラム中の α 部分の変更内容として正しい答えを，解答群の中から選べ。'),
    ...bankBlocks('解答群', banks[2]),
  ]];
}

export const legacy2008SpringPm2Definition = define(2, '部分文字列の出現回数と非重複検索', '設問1 a=ア・b=イ・設問2=ウ',
  '配列の開始添字・検索される文字列・パターン', '配列の添字基準と、重なる一致がある検索対象・パターンを変更します。',
  'p.6〜8。0＜Patlen≦Textlen、開始添字の定義、最後の比較、探索の制御線・継続行、丸数字と重複表示、元設問の4択×3・共通p.2〜3参照を保持。非重複の枝の構造上、正答の位置を固定。', index => {
    const { base } = matchCases[index];
    const banks = matchBanks(index);
    return {
      prompt: spring2008Pm2Pages(index).flat(),
      contexts: [spring2008PmReference('共通に使用される擬似言語の記述形式', references)],
      ...answers(banks, [single('a', '設問1 a', 0, 0), single('b', '設問1 b', 1, 1), single('s2', '設問2', 2, 2)]),
      explanation: 'a：最後の候補を含め，比較する末尾が文字列の範囲内になる条件は i＋Patlen≦Textlen' + (base ? '＋1' : '') +
        '。b：SourceText の現在位置 j と Pattern の現在位置 k の文字を比べる。設問2：一致時は出現回数を1加え，一致部分の長さ Patlen だけ開始位置を進める。不一致時は1文字だけ進めて次の開始位置を逃さない。',
    };
  }, { answerVariation: 'fixed', fixedReferenceAssetIds: references.map(spring2008PmPageAssetId) });
