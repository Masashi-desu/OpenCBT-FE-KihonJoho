import { p, strings } from './definition';
import { answers, bank, choicesInOrder, code, define, marks, single, table } from './legacy-2013-autumn-pm-01-04-shared';
import { gateCases } from './legacy-2013-autumn-pm-01-04-models';
import { autumn2013Pm0104Diagram as diagram, autumn2013Pm0104Profiles as f } from './legacy-2013-autumn-pm-01-04-figures';

const gates = ['AND', 'NAND', 'NOR', 'OR', 'XOR'];
const circuitLabels = ['NOR', 'NAND', 'XOR', 'XNOR'];
const optionFigures = circuitLabels.map((_, i) => diagram(f.option, i, '論理回路 ' + marks[i]));
const logic = (x: number, y: number) => [x, y, x & y, x | y, x ^ y, 1 - (x & y), 1 - (x | y)];
const bits = [[0, 0], [0, 1], [1, 0], [1, 1]];

export function autumn2013Pm1Pages(i: number) {
  const c = gateCases[i];
  return [
    [
      p('次の問1から問7までの7問については，この中から5問を選択し，答案用紙の選択欄の選をマークして解答してください。なお，6問以上選択した場合には，はじめの5問について採点します。'),
      p('問1　論理演算と加算器に関する次の記述を読んで，設問1〜4に答えよ。'),
      p('真を1，偽を0として，主要な論理演算の真理値表を，表1に示す。'),
      table('表1　主要な論理演算の真理値表', ['A', 'B', 'A AND B', 'A OR B', 'A XOR B', 'A NAND B', 'A NOR B'], bits.map(([x, y]) => logic(x, y))),
      table('表1（続き）', ['A', 'NOT A'], [[0, 1], [1, 0]]),
      p('設問1　AND，OR，XOR，NOTの各論理演算を行う論理回路を用いて，' + c.first + 'と' + c.second +
        'の論理演算を行う論理回路を作成した。次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。ここで，X，Yは1ビットの入力，Zは1ビットの出力とする。'),
      p('（1）' + c.first + 'の論理回路は［a］である。\n（2）' + c.second + 'の論理回路は［b］である。'),
    ],
    [
      ...choicesInOrder('a，bに関する解答群', Array.from(marks.slice(0, 4)), optionFigures),
      p('設問2　各1ビットの入力X，Yを加算して，その結果を各1ビットのZと桁上がりCに出力する“半加算器”の真理値表を表2に，論理回路を図1に示す。図1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      code('text', '     X\n＋   Y\n──────\n   C Z'),
      table('表2　半加算器の真理値表', ['X', 'Y', 'C', 'Z'], bits.map(([x, y]) => [x, y, x & y, x ^ y])),
      diagram(f.half, i, '図1　半加算器の論理回路'),
    ],
    [
      ...bank('解答群', gates),
      p('設問3　各1ビットの入力X，Yと，下位桁からの1ビットの桁上がりCinを加算して，その結果を各1ビットのZと桁上がりのCに出力する“全加算器”の真理値表を表3に，論理回路を図2に示す。図2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      code('text', '     X\n     Y\n＋  Cin\n──────\n   C Z'),
      diagram(f.truth, 0, '表3　全加算器の真理値表'),
      diagram(f.full, 0, '図2　全加算器の論理回路'),
    ],
    [
      ...bank('解答群', gates.slice(0, 4)),
      p('設問4　2の補数表現による4ビットの符号付き2進整数を加算する加算器を図3に示す。加算器は，2進整数A₄A₃A₂A₁とB₄B₃B₂B₁を加算して，結果S₄S₃S₂S₁を出力する。添字は桁の位置を示しており，値が大きいほど上位の桁を表す。'),
      code('text', '   A₄ A₃ A₂ A₁\n＋ B₄ B₃ B₂ B₁\n─────────────\n   S₄ S₃ S₂ S₁'),
      diagram(f.ripple, 0, '図3　加算器の論理回路'),
      p('最上位ビットの加算において，A₄，B₄，C₃の値が表3の全加算器の真理値表のそれぞれX，Y，Cinの値のβ部分の組合せになるとき，桁あふれが生じる。これを検出するための論理回路を図4に，S₁〜S₄が全て0となる場合を検出する論理回路を図5に示す。図4中と図5中の空欄に入れる正しい答えを，解答群の中から選べ。'),
    ],
    [
      diagram(f.overflow, 0, '図4　桁あふれ検出の論理回路'),
      diagram(f.zero, 0, '図5　ゼロ検出の論理回路'),
      ...bank('c，dに関する解答群', gates),
    ],
  ];
}

export const legacy2013AutumnPm1Definition = define(1, '論理演算と加算器', '設問1 a=イ・b=ア、設問2=オ、設問3=エ、設問4 c=オ・d=ウ',
  '合成する論理演算と半加算器の空欄端子', gateCases.length,
  '設問1で作成する論理演算と，図1で問う出力端子を変えます。全加算器と4ビットの桁あふれ・ゼロ検出の条件を保持します。',
  '原冊子p.5〜9、3真理値表、加算の筆算表示、a/b共通4回路、5回路図、6欄を原順で保持。4条件で実際に問う論理演算と半加算器の空欄端子を変更。X、Y、Cinは各1ビット、桁あふれのβと旗の意味、2の補数4ビット、各欄の候補数・順序を保持。計算は全ビット組合せで独立照合し、丸めなし。', i => {
    const c = gateCases[i], a = circuitLabels.indexOf(c.first), b = circuitLabels.indexOf(c.second);
    const reasoning = [
      '入力を両方反転した後のANDはNOR，ORはNAND，XORはXORと同じ働きをする。XORの後に出力を反転するとXNORになる。',
      '半加算器では入力の和の下位ビットZがXOR，桁上がりCがANDになる。図1で問われている' + c.halfBlank +
        'には' + (c.halfBlank === 'Z' ? 'XOR' : 'AND') + 'を使う。',
      'いずれかの半加算器で桁上がりが出れば全体の桁上がりが出る。図2の空欄にはORを使う。',
      '表3のβでは最上位への桁上がりC₃と最上位からのC₄が異なるので，VFにはXORを使う。各ビット対がいずれも00のときだけZFを1にするため，二つのdをNORにしてANDでまとめる。',
    ];
    return {
      prompt: autumn2013Pm1Pages(i).flat(),
      ...answers([optionFigures.map(block => [block]), strings(gates), strings(gates.slice(0, 4)), strings(gates)], [
        single('a', '設問1 a', 0, a), single('b', '設問1 b', 0, b),
        single('sub2', '設問2', 1, c.halfBlank === 'Z' ? 4 : 0), single('sub3', '設問3', 2, 3),
        single('c', '設問4 c', 3, 4), single('d', '設問4 d', 3, 2),
      ]),
      explanation: '設問1の' + c.first + 'は' + marks[a] + '，' + c.second + 'は' + marks[b] + '。' + reasoning.join('\n'),
    };
  });
