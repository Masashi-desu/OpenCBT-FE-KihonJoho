import { code, p, strings, table } from './definition';
import { answers, bank, define, marks, single } from './legacy-2009-spring-pm-01-04-shared';
import { decodedChoiceRuns, encodeRun, imageCases } from './legacy-2009-spring-pm-01-04-models';
import { draw } from './legacy-2009-spring-pm-01-04-figures';

function imageCase(index: number) {
  const { example, first, second, decode } = imageCases[index];
  const binary = first.toString(2);
  const firstOptions = [binary, '0' + binary, encodeRun(first), '1' + encodeRun(first)];
  const secondOptions = ['14', '15', '16', '17'];
  const total = example.reduce<number>((length, run) => length + encodeRun(run).length, 0);
  const totalOptions = [total - 3, total - 2, total - 1, total].map(String);
  const encoded = decodedChoiceRuns(index)[decode].map(encodeRun).join('');
  return { example, first, second, decode, firstOptions, secondOptions, total, totalOptions, encoded };
}
const pictureChoice = (index: number, choice: number) => draw('pixelPicture', index * 5 + choice + 1, '復号した2値画像の候補');

export function spring2009Pm1Pages(index: number) {
  const { example, first, second, firstOptions, secondOptions, totalOptions, encoded } = imageCase(index);
  const exampleRun = example[0];
  const exampleBits = exampleRun.toString(2).padStart(2, '0');
  const countPrefix = exampleBits.length - 2;
  const secondBits = second.toString(2);
  const listedRuns = example.map((run, i) => (i % 2) + 'が' + run + '個').join('，');
  return [[
    p('問1　画像データの符号化に関する次の記述を読んで，設問1〜3に答えよ。'),
    p('図1は，8×8画素の白と黒だけで色分けされた2値画像の例である。画素を1番上の行の左から右へ，次に2番目の行の左から右へと順に1画素を1ビットで，白を0，黒を1で表すと，図2のように64ビットのビット列で表現することができる。'),
    draw('pixelPicture', index * 5, '図1　2値画像の例'),
    draw('bitGrid', index, '図2　画像のビット列表現'),
    p('（1） 図2のビット列を，同じ値が連続している部分（以下，ランという）ごとに区切り，各ランをその連続する個数（以下，ランレングスという）で表すことによって，少ないビット数でのビット列表現に書き換えることができる。図2では，左上から数えて' +
      listedRuns + 'の順に連続しているので，' + example.join('，') + 'という情報を使った表現に書き換える。これを，ランレングス符号化という。'),
    p('（2） 1番上の行の左端の画素は白で始まるものとする。ただし，その画素が黒の場合は，先頭に0個の白があるものとして符号化を行う。'),
  ], [
    p('（3） ランレングス符号化の方法は，次のとおりである。'),
    p('① ランレングスをnとし，nを2進数で表現したときのけた数をmとする。ただし，常にm≧2となるように，n＝0の2進数表現を00，n＝1の2進数表現を01とする。'),
    p('② nビットのランを図3のビット列に書き換える。'),
    draw('codeFormat', 0, '図3　符号化後のビット列表現'),
    p('（a） nを2進数で表現したときのけた数がmのとき，m−2個の連続する1とする。m＝2のときはこの部分のビット数は0であり，次の（b）から始まる。'),
    p('（b） 1個の0とする。'),
    p('（c） nの2進数表現とする。'),
    p('（4） 図2の例では，最初の白のランは' + exampleRun + '個で，n＝' + exampleRun + 'である。nを2進数で表現すると' +
      exampleBits + '（' + exampleBits.length + 'けた）となり，m＝' + exampleBits.length + 'である。m−2＝' +
      countPrefix + 'なので，けた数情報は' + (countPrefix ? '1'.repeat(countPrefix) : '空であり，区切りの0から始まる') +
      '。したがって，この部分の符号化後のビット列表現は' + encodeRun(exampleRun) + 'となり，' + encodeRun(exampleRun).length + 'ビットで表現できる。'),
    p('（5） 表にn，m及び符号化後のビット列を示す。'),
    table('表　n，m及び符号化後のビット列', ['n', 'm', '符号化後のビット列'], [
      ...[0, 1, 2, 3].map(value => [String(value), '2', encodeRun(value)]),
      [String(first), '3', '［a］'], ['⋮', '⋮', '⋮'], ['［b］', String(secondBits.length), encodeRun(second)],
      ['⋮', '⋮', '⋮'], ['27', '5', encodeRun(27)], ['⋮', '⋮', '⋮'],
    ]),
  ], [
    p('設問1　表中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    ...bank('aに関する解答群', firstOptions),
    ...bank('bに関する解答群', secondOptions),
    p('設問2　図2の64ビットのビット列をランレングス符号化すると，何ビットで表現できるか。正しい答えを，解答群の中から選べ。'),
    ...bank('解答群', totalOptions),
    p('設問3　ランレングス符号化後のビット列が，次のとおりであったとする。このビット列を復号した2値画像として正しい答えを，解答群の中から選べ。'),
    code(encoded, 'text'),
    p('解答群'),
    ...[0, 1, 2, 3].flatMap(i => [p(marks[i]), pictureChoice(index, i)]),
  ]];
}

export const legacy2009SpringPm1Definition = define(1, '2値画像のランレングス符号化', '設問1 a=ウ・b=イ・設問2=エ・設問3=エ',
  '画素列，ランレングスと復号対象', '画素の並び、表の符号化・復号対象、復号後の画像を変えます。',
  'p.6〜8。行優先、白0・黒1、先頭黒は長さ0の白を挿入、m≧2、m−2個の1と区切り0、図の5行と8行の選択肢を保持。', index => {
    const { example, first, second, decode, firstOptions, secondOptions, total, totalOptions, encoded } = imageCase(index);
    const lengths = decodedChoiceRuns(index)[decode];
    return {
      prompt: spring2009Pm1Pages(index).flat(),
      ...answers([strings(firstOptions), strings(secondOptions), strings(totalOptions),
        [0, 1, 2, 3].map(i => [pictureChoice(index, i)])], [
        single('a', '設問1 a', 0, 2), single('b', '設問1 b', 1, secondOptions.indexOf(String(second))),
        single('sub2', '設問2', 2, 3), single('sub3', '設問3', 3, decode),
      ]),
      explanation: 'nが' + first + 'の場合は3けたなので，けた数情報1と区切り0の後にnの2進数を付けて' +
        encodeRun(first) + 'になる。bの符号は区切りの後の値を読むと' + second + 'である。図2のラン長は' + example.join('，') +
        'で，符号長' + example.map(run => encodeRun(run).length).join('＋') + '＝' + total + 'ビットになる。設問3の' +
        encoded + 'を先頭から区切ると' + lengths.join('，') + 'である。白から開始して，長さ0の白も色の切替えに含める。',
    };
  });
