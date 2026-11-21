import { code, figure, p, table } from './definition';
import { answers, define, single } from './legacy-2004-spring-pm-01-05-shared';
import { spring2004Pm3Figure } from './legacy-2004-spring-pm-3-figures';
import { huffmanCase } from './legacy-2004-spring-pm-3-model';

const percent = (part: number, whole: number) => (Math.round(part * 1000 / whole) / 10).toFixed(1);
const numberChoices = (choices: readonly (number | string)[]) => choices.map(choice => [p(String(choice))]);

export function independentHuffmanDisplay(text: string) {
  return [text.slice(0, 23) + '　～（中略）～', text.slice(-22)];
}

export const spring2004Pm3 = define(3, 'ハフマン符号化による文字列圧縮', 'イキイエエ', '出現回数の条件',
  '図1の歌詞を独立編集した入力例へ置き換える。生成版は入力例・出現回数・併合の操作・ビット列と解答群を同じ条件から生成する。',
  '原問の37種・100文字、全角1文字16ビット、併合時の並べ替えと同値時の順序、図1〜4、2設問5欄と4解答群を保持。' +
  'aとbは原形式の文字種類数・全角の幅に依存して固定。c、d、eは出現回数に連動。数値の選択肢は原順序と同様に昇順。',
  condition => {
    const { rows, stages, text, total, totalBits } = huffmanCase(condition);
    const distinct = rows.length;
    const bits = Math.ceil(Math.log2(distinct));
    const fullWidth = total * 16;
    const fixedWidth = total * bits;
    const highest = stages.get(3)![0].count;
    const middle = stages.get(3)![1].count;
    const lowest = stages.get(3)![2].count;
    const finalMerge = middle + lowest;
    const maxLength = Math.max(...rows.map(row => row.length));
    const fixedPercentage = percent(fixedWidth, fullWidth);
    const huffmanPercentage = percent(totalBits, fullWidth);
    const widthChoices = [1, 6, 7, 16, 20, 33, 37, 47, 100];
    const fixedChoices = ['2.3', '6.0', '6.3', '16.2', '16.7', '37.0', '37.5', '43.2'];
    const mergeChoices = [lowest, middle, highest, finalMerge, total].sort((left, right) => left - right);
    const huffmanChoices = [
      (Number(huffmanPercentage) / 10).toFixed(1), maxLength.toFixed(1), percent(rows[16].runningBits, fullWidth), huffmanPercentage,
      percent(maxLength * total, fullWidth), percent(8 * total, fullWidth), percent(totalBits, fixedWidth), percent(bits, maxLength),
    ].sort((left, right) => Number(left) - Number(right));
    if (mergeChoices.length !== new Set(mergeChoices).size || huffmanChoices.length !== new Set(huffmanChoices).size)
      throw Error('PARAMETER_CONSTRAINT');
    const frequencyTables = [[0, 11], [11, 22], [22, 33], [33, 37]].map(([from, to], index) => {
      const chunk = rows.slice(from, to);
      return table(index ? '図2 文字の種類と出現回数（続き）' : '図2 文字の種類と出現回数',
        ['文字の種類', ...chunk.map(row => row.symbol)], [['出現回数', ...chunk.map(row => String(row.count))]]);
    });
    const codeTables = [[0, 7], [7, 17], [17, 27], [27, 37]].map(([from, to], index) => {
      const chunk = rows.slice(from, to);
      return table(index ? '図4 対応するビット列（続き）' : '図4 文字の出現回数と対応するビット列に関する情報',
        ['文字の種類', ...chunk.map(row => row.symbol)], [
          ['出現回数', ...chunk.map(row => String(row.count))],
          ['対応ビット列', ...chunk.map(row => row.bits)],
          ['ビット長', ...chunk.map(row => String(row.length))],
          ['出現ビット長', ...chunk.map(row => String(row.weightedBits))],
          ['出現ビット累計', ...chunk.map(row => String(row.runningBits))],
        ]);
    });
    return {
      prompt: [
        p('データ圧縮の方法の一つであるハフマン符号化について、次の記述を読んで設問1、2に答えよ。'),
        p('ハフマン符号化は、圧縮する文字列に含まれる文字の種類に着目し、出現回数の偏りを利用してデータを圧縮する方法である。'),
        p(`図1に示す${total}文字の文字列の圧縮を考える。全角1文字を16ビット（2バイト）で表現すると、文字列全体の長さは${fullWidth.toLocaleString('en-US')}ビットになる。文字の種類とその出現回数は図2に示す。`),
        p('図1 対象となる文字列（△は空白。独立編集した入力例）'),
        code(independentHuffmanDisplay(text).join('\n'), 'text'),
        ...frequencyTables,
        p('設問1　次の記述中の空欄に入れる正しい答えを、それぞれの解答群から選べ。'),
        p(`図2の文字列は${distinct}種類の文字から成る。その全てを固定長のビット列で識別するには、1種類の文字に［a］ビットを割り当てればよい。この表現では文字列全体が［a］ビット／文字×${total}文字の長さになる。全角1文字を16ビットで表現する場合を100％とすると、固定長で表現した長さは［b］％となる。`),
        table('表 文字の表現方式と対象文字列の長さ', ['表現の方式', '1文字の長さ ビット', '対象文字列の長さ ビット', '圧縮の割合 %'], [
          ['全角1文字を16ビットで表現', '16', fullWidth.toLocaleString('en-US'), '100'],
          [distinct + '種類を固定長で表現', '［a］', '（省略）', '［b］'],
        ]),
        p('〔ハフマン符号化の手順〕文字の出現回数の偏りを利用すると、文字列を更に短いビット列で表現できる。'),
        p('(1) 文字を出現回数の多い順に並べる。同じ出現回数の文字は、文字コードの昇順にする。仮想の文字の出現回数が同じ場合は、並べ替えの直前の順序に従う。'),
        p('(2) 末尾の二つの文字を組にし、両方の出現回数を合計した一つの仮想の文字を末尾に置く。'),
        p('(3) 文字が二つ残るまで、文字の種類が一つ減った状態に対して (1) と (2) を繰り返す。'),
        p('(4) 最後の二つの文字に、それぞれ1又は0の1ビットを割り当てる。'),
        p('(5) 最後の二つの文字から順に、まとめる前の二つの文字へ戻る。一段戻るごとに直前のビット列の右端に1又は0を付けて割り当てる。元の全種類にビット列を割り当てるまで続ける。'),
        p('(6) 得られたビット列で元の文字列を表現する。'),
        p('設問2　次の記述中の空欄に入れる正しい答えを、それぞれの解答群から選べ。'),
        p(`図3は手順 (1)〜(3) の実際の操作を示す。①は［c］、②は［d］となる。図4のビット列で${total}文字を表現すると、全角1文字を16ビットで表現する場合の約［e］％のビット数になる。`),
        figure(spring2004Pm3Figure.profile, [condition], '図3 実際の操作', spring2004Pm3Figure.alt([condition])),
        p('図3の注　各列上部の(1)・(2)は、手順(1)・(2)の結果を示す。「…」の部分は表示を省略する。'),
        p('ハフマン符号の長さは文字の出現回数によって変わる。符号化したビット列を先頭から追うと各文字の符号を一意に識別できる。'),
        ...codeTables,
        p('図4の注　出現ビット長は、ビット長×出現回数で計算する。'),
      ],
      ...answers([widthChoices, fixedChoices, mergeChoices, huffmanChoices].map(numberChoices), [
        single('a', '設問1 a 1文字を識別するビット数', 0, widthChoices.indexOf(bits)),
        single('b', '設問1 b 固定長による圧縮の割合', 1, fixedChoices.indexOf(fixedPercentage)),
        single('c', '設問2 c 図3の①', 2, mergeChoices.indexOf(middle)),
        single('d', '設問2 d 図3の②', 2, mergeChoices.indexOf(finalMerge)),
        single('e', '設問2 e ハフマン符号による圧縮の割合', 3, huffmanChoices.indexOf(huffmanPercentage)),
      ]),
      explanation:
        `2^${bits - 1}では${distinct}種類を識別できず、2^${bits}なら識別できるので a は${bits}。固定長は${total}×${bits}＝${fixedWidth}ビットで、b は${fixedWidth}÷${fullWidth}×100＝${fixedPercentage}％。図3で残る三つを出現回数の多い順に並べると ${highest}、${middle}、${lowest} となり、中央の c は${middle}。末尾の二つを併合するので d は${middle}＋${lowest}＝${finalMerge}。図4の出現ビット長を全種類について合計すると${totalBits}ビットなので、e は${totalBits}÷${fullWidth}×100を小数第1位まで表示した${huffmanPercentage}％。`,
    };
  });
