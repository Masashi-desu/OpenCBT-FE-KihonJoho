import { code, p, strings, table } from './definition';
import { autumn2007PmPageAssetId, autumn2007PmReference } from './legacy-2007-autumn-pm-materials';
import { answers, bank, define, single } from './legacy-2007-autumn-pm-01-05-shared';
import { draw } from './legacy-2007-autumn-pm-01-05-figures';
import { decimalDigits, formatCases } from './legacy-2007-autumn-pm-4-model';

const references = [2, 3] as const;
const countChoices = ['0', '1', '2', '3', '4'];
function inputs(index: number) {
  const { base, start, float, digits } = formatCases[index];
  const a = ['Fint − ' + base, 'Fint − Fint ÷ ' + base, 'Fint − (Fint ÷ ' + base + ') × ' + base,
    'Fint ÷ ' + base, '(Fint ÷ ' + base + ') × ' + base];
  const isNegative = 'Out[' + start + '] = "−"';
  const b = ['L = ' + start, 'L = ' + start + ' or ' + isNegative, 'L = ' + start + ' or (L = ' + (start + 1) + ' and ' + isNegative + ')',
    'L = ' + (start + 1), 'L = ' + (start + 1) + ' and ' + isNegative];
  const cd = ['Fdec − Int(Fdec)', 'Fdec − Int(Fdec × ' + base + ')',
    'Fdec − Int(Fdec ÷ ' + base + ')', 'Fdec × ' + base, 'Fdec ÷ ' + base];
  const charDigits = Array.from({ length: base }, (_, i) => '"' + i + '"').join(',');
  const program = [
    '○FloatFormat(実数型: Float, 整数型: Num, 文字型: Out[], 整数型: Len)',
    '○実数型: F, Fdec',
    '○整数型: Fint, Idx, L, N',
    '○文字型: Chr[] = {' + charDigits + '}, T',
    '・L ← ' + start,
    '/* 符号の処理 */',
    '▲ Float ≧ 0.0',
    '│  ・F ← Float',
    '├─────',
    '│  ・F ← −Float',
    '│  ・Out[' + start + '] ← "−"',
    '│  ・L ← ' + (start + 1),
    '▼',
    '/* 整数部の処理 */',
    '・Push("#")          /* スタックに番兵として"#"を積む。 */',
    '・Fint ← Int(F)',
    '■ Fint ＞ 0',
    '│  ・Idx ← Fint − (Fint ÷ ' + base + ') × ' + base + '  ← α',
    '│  ・Push(Chr[' + (start ? 'Idx + 1' : 'Idx') + '])',
    '│  ・Fint ← ［a］',
    '■',
    '・T ← Pop()          /* スタックから取り出す。 */',
    '■ T ≠ "#"',
    '│  ・Out[L] ← T',
    '│  ・L ← L + 1',
    '│  ・T ← Pop()',
    '■',
    '/* 小数点の処理 */',
    '▲ ［b］',
    '│  ・Out[L] ← "0"',
    '│  ・L ← L + 1',
    '▼',
    '・Out[L] ← "."',
    '・L ← L + 1',
    '/* 小数部の処理 */',
    '・Fdec ← F − Int(F)',
    '■ N: 1, N ≦ Num, 1',
    '│  ・Fdec ← ［c］  ← β',
    '│  ・Idx ← Int(Fdec)',
    '│  ・Out[L] ← Chr[' + (start ? 'Idx + 1' : 'Idx') + ']',
    '│  ・L ← L + 1',
    '│  ・Fdec ← ［d］',
    '■',
    '・Len ← ' + (start ? 'L − 1' : 'L'),
  ];
  return { base, start, float, digits, a, b, cd, program };
}
export function autumn2007Pm4Pages(index: number, print = true) {
  const { base, start, float, digits, a, b, cd, program } = inputs(index);
  const baseName = base + '進';
  const pages = [
    [p('次のプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
      p('〔プログラムの説明〕'),
      p('スタックを使って，実数値を' + baseName + '数字列（文字列）に変換する副プログラム FloatFormat である。'),
      p('（1）FloatFormat は，実数 Float の値を' + baseName + '数字列に変換し，その先頭の数字から順に1文字ずつ文字型配列 Out[] に格納する。'),
      p('（2）小数点以下は，引数 Num（Num≧1）で指定されたけた数までを格納する。'),
      p('（3）FloatFormat の引数の仕様を表に示す。'),
      table('表　FloatFormat の引数の仕様', ['引数', 'データ型', '入力／出力', '意味'],
        [['Float', '実数型', '入力', '変換対象の実数'], ['Num', '整数型', '入力', '文字列に変換する際の小数点以下のけた数（Num≧1）。小数第 Num＋1 位以下は切捨て'],
          ['Out[]', '文字型', '出力', '変換結果を格納する文字型の配列'], ['Len', '整数型', '出力', '配列 Out[] に格納された変換結果の文字数']]),
      p('（4）実数 Float の値を' + baseName + '数字列に変換する手順は，次のとおりである。'),
      p('① Float の値が負の場合は，負符号を表す“−”を Out[] に格納し，Float の値を正数に変換する。'),
      p('② 整数部を，1の位から上位に向かって，1けたずつ' + baseName + '数字に変換し，スタックに積む。'),
      p('③ スタックに積み終わったら，スタックに積んだ文字を順番に取り出して Out[] に格納することによって，整数部の' + baseName + '数字を正しい順番に並べ替える。'),
      p('④ 整数部が0の場合は“0”をOut[]に格納する。'),
      p('⑤ 小数点を表す“.”をOut[]に格納する。'),
      p('⑥ 小数部を，小数第1位から第 Num 位まで，1けたずつ' + baseName + '数字に変換し，Out[] に格納する。')],
    [p('（5）Push() はスタックに1文字を積む関数，Pop() はスタックから1文字を取り出す関数である。Int() は小数点以下を切り捨てる関数である。'),
      p('（6）配列の添字は' + start + 'から始まり，文字型配列 Out[] の要素数は十分に大きいものとする。また，プログラム中の各演算であふれは発生しないものとする。'),
      p('（7）FloatFormat の変換例を図に示す。'),
      draw('format', index, '図　FloatFormat の変換例')],
    [p('〔プログラム〕'), code(program.join('\n'))],
    [p('設問1　プログラム中の空欄 a〜d に入れる正しい答えを，解答群の中から選べ。')],
  ];
  if (print) pages[3].push(...bank('aに関する解答群', a), ...bank('bに関する解答群', b), ...bank('c，dに関する解答群', cd));
  pages[3].push(p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
    p('Float ＝ ' + float.replace('-', '−') + '，Num ＝ ' + digits +
      ' として FloatFormat を呼び出した場合，プログラム中の α の部分は［e］回実行され，β の部分は［f］回実行される。'));
  if (print) pages[3].push(...bank('解答群', countChoices));
  return pages;
}

export const autumn2007Pm4 = define(4, 'スタックによる実数の文字列変換', 'a=エ／b=ウ／c=エ／d=ア／e=ア／f=ウ',
  '変換先の基数・配列の添字・入力実数・小数点以下のけた数',
  '整数部と小数部の処理を追跡して空欄と実行回数を求める。',
  'Num≧1と切捨て、番兵、添字、各演算のあふれなし、条件・繰返しの制御線、αとβ、6欄×5択を保持。生成条件は基数6/8/4と配列の添字形式及び入力を変え、計算手順の意味は保持。', index => {
    const { base, float, digits, a, b, cd } = inputs(index);
    const converted = decimalDigits(float, base, digits), whole = converted.split('.')[0].replace('−', '');
    const loops = whole === '0' ? 0 : whole.length;
    return { prompt: autumn2007Pm4Pages(index, false).flat(),
      contexts: [autumn2007PmReference('疑似言語の記述形式', references)],
      ...answers([strings(a), strings(b), strings(cd), strings(countChoices)], [single('a', '設問1 a', 0, 3),
        single('b', '設問1 b', 1, 2), single('c', '設問1 c', 2, 3), single('d', '設問1 d', 2, 0),
        single('e', '設問2 e', 3, loops), single('f', '設問2 f', 3, digits)]),
      explanation: '各回で整数部の最下位のけたを積み，Fint を' + base +
        'で整数除算して次のけたを得る。出力が空か負符号だけなら整数部の0を補う。小数部を' + base +
        '倍して整数部を次のけたとし，その整数部を引いて次に回す。入力 ' + float.replace('-', '−') +
        ' は「' + converted + '」となる。整数部が0ならαは実行されず，0でなければ整数部のけた数だけ実行される。ここではαは' +
        loops + '回，βは Num に等しい' + digits + '回である。',
    };
  }, { fixedReferenceAssetIds: references.map(autumn2007PmPageAssetId) });
