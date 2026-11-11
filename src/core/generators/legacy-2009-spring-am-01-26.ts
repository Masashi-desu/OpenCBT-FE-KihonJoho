import { p, table } from './definition';
import { calculations2009SpringAm0126 } from './legacy-2009-spring-am-01-26-calculations';
import { adderWiring, draw, targetWiring, transferCases } from './legacy-2009-spring-am-01-26-figures';
import { knowledge2009SpringAm0126 } from './legacy-2009-spring-am-01-26-knowledge';
import { body, define, source } from './legacy-2009-spring-am-01-26-shared';

const translation = define(22, '翻訳・結合・ロードの流れと追加の入力', 4,
  'コンパイラ、リンカ、ローダと、元の四候補の三列を維持する。条件に応じて既知の追加モジュールを渡す。', index => {
    const { description } = transferCases[index];
    const prompt = source[22].prompt + (description ? ' ' + description : '');
    return body([p(prompt), draw('translation', index, '翻訳して実行するまでの流れ')],
      source[22].choices.map(choice => [table('翻訳処理の入出力', ['a', 'b', 'c'], [choice.split('・')])]),
      [0, 2, 1, 3][index], 'コンパイラは原始プログラムを目的プログラムへ翻訳する。リンカは目的プログラムとライブラリモジュールなどを結合してロードモジュールを生成し，ローダがこれを読み込む。');
  });

const equivalence = define(24, '上段の入力極性と下段の接続', 4,
  '原問の記号・4回路を保持する。上段のANDへ入る極性と、下段をNOT又は直接分岐する条件を変えて等価回路を求める。', index => {
    const prompt = '図の論理回路と同じ出力が得られる論理回路はどれか。ここで，論理素子の記号は次のとおりである。';
    const explanations = [
      'Bが0ならNOT(B)が1なのでXは1になる。Bが1ならNOT(B)が0でANDの出力はAとなる。A OR NOT(B)と同じである。',
      'Bが0ならNOT(B)が1になる。Bが1ならXはNOT(A)に等しい。AとBがともに1の場合だけ0となるので，ANDの否定に等しい。',
      'Aが0なら上段のANDも下段も0である。Aが1なら下段が1になる。出力は常にAであり，A OR (A AND B)と同じである。',
      'Aが0なら下段が1になり，Aが1なら上段の出力はBとなる。NOT(A) OR Bに等しく，ド・モルガンの法則からNOT(A AND NOT(B))に等しい。',
    ];
    return body([p(prompt), draw('gateLegend', 0, '論理素子の記号'), draw('gateTarget', index, '比較する論理回路')],
      targetWiring.map((_, i) => [draw('gateChoice', i, '候補の論理回路')]), [1, 0, 2, 3][index], explanations[index]);
  });

const halfAdder = define(25, '上段・下段の出力の割当てと反転', 4,
  '二入力を二つの素子へ分岐する半加算器と組合せの四択を保持する。和と桁上げの出力先や出力段のNOTを変える。', index => {
    const { upper, lower, inversion } = adderWiring[index];
    const negated: Record<string, string> = {
      排他的論理和: '論理一致', 論理積: '否定論理積', 否定論理積: '論理積', 否定論理和: '論理和', 論理和: '否定論理和',
    };
    const pairs = source[25].choices.map(choice => {
      const [sum, carry] = choice.split('・');
      const [a, b] = upper === 'z' ? [sum, carry] : [carry, sum];
      return [inversion === 'A' ? negated[a] : a, inversion === 'B' ? negated[b] : b];
    });
    const note = inversion ? ' 図中の出力に付く三角形と白丸は否定（NOT）を表す。' : '';
    return body([p(source[25].prompt + note), draw('adder', index, 'xとyを加算する半加算器')],
      pairs.map(pair => [table('半加算器の素子', ['A', 'B'], [pair])]), 0,
      '和の下位桁zはxとyが異なるときだけ1で，けた上げcはxとyがともに1のときだけ1になる。Aは' + upper + '，Bは' + lower +
      'へつながる。' + (inversion ? '素子' + inversion + 'の後で出力を反転するため，その素子には最終出力と逆の値を出す演算を選ぶ。' : '') +
      'Aは' + pairs[0][0] + '，Bは' + pairs[0][1] + 'である。');
  });

export const legacy2009SpringAm01To26Definitions = [
  ...calculations2009SpringAm0126, ...knowledge2009SpringAm0126, translation, equivalence, halfAdder,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
