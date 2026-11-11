import { code, p, strings, table } from './definition';
import { answers, bank, define, marks, single } from './legacy-2009-autumn-pm-01-04-shared';
import { additions, binary, carryChoices, partialCarry, rippleCarry, triples } from './legacy-2009-autumn-pm-01-04-models';
import { draw } from './legacy-2009-autumn-pm-01-04-figures';

const aOptions = ['AND', 'NAND', 'NOR', 'OR', 'XOR'];
const bOptions = ['AND', 'NAND', 'NOR', 'OR'];
const cOptions = ['00', '01', '10', '11'];
const cHead = ['C₁', 'C₂'];
const signedHead = ['C₁', 'C₂', 'C₃', 'C₄'];
const cells = (values: readonly number[]) => values.map(String);
const printable = (value: number) => String(value).replace('-', '−');
const rows = (options: readonly string[]) => options.map((option, i) => [marks[i], ...option]);
const answerTable = (caption: string, head: string[], options: readonly string[]) =>
  options.map(option => [table(caption, head, [[...option]])]);

export function autumn2009Pm1Pages(index: number) {
  const { a, b } = additions[index];
  return [[
    p('問1　半加算器と全加算器に関する次の記述を読んで，設問1〜3に答えよ。'),
    p('（1） 1ビット同士を加算する半加算器の真理値表を，表1に示す。'),
    code('      X\n ＋   Y\n ──────\n    C Z    C：けた上がり', 'text'),
    table('表1　半加算器の真理値表', ['X', 'Y', 'C', 'Z'],
      binary.flatMap(x => binary.map(y => cells([x, y, Math.floor((x + y) / 2), (x + y) % 2])))),
    p('（2） 下位からのけた上がりCᵢₙを考慮して1ビット同士を加算する全加算器の真理値表を，表2に示す。'),
    code('      X\n      Y\n ＋  Cᵢₙ   Cᵢₙ：下位からのけた上がり\n ──────\n    C Z    C：けた上がり', 'text'),
  ], [
    table('表2　全加算器の真理値表', ['Cᵢₙ', 'X', 'Y', 'C', 'Z'],
      triples.map(([c, x, y]) => cells([c, x, y, Math.floor((c + x + y) / 2), (c + x + y) % 2]))),
    p('設問1　半加算器を実現する論理回路を，図1に示す。図1中の［空欄］に入れる正しい答えを，解答群の中から選べ。ただし，ANDは論理積，ORは論理和，XORは排他的論理和，NANDは否定論理積，NORは否定論理和を表す。'),
    draw('halfAdder', 0, '図1　半加算器を実現する論理回路'),
    ...bank('解答群', aOptions),
  ], [
    p('設問2　全加算器を実現する論理回路について，次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('全加算器は，図2に示すように半加算器を2段に接続して実現する。半加算器1はXとYを加算し，半加算器2は半加算器1の結果とCᵢₙを加算する。このとき，半加算器1のけた上がりをC₁，半加算器2のけた上がりをC₂とする。X，Y，Cᵢₙと，C₁，C₂との関係は表3のとおりになる。'),
    draw('fullAdder', 0, '図2　全加算器を実現する論理回路'),
    draw('carryTable', index, '表3　X，Y，Cᵢₙと，C₁，C₂との関係'),
    ...bank('bに関する解答群', bOptions),
  ], [
    table('cに関する解答群', ['', ...cHead], rows(cOptions)),
    p('設問3　A，B及びSを2の補数表現による4ビットの符号付2進整数とし，それぞれのビット表現をA₄A₃A₂A₁，B₄B₃B₂B₁及びS₄S₃S₂S₁で表す（符号ビットはA₄，B₄及びS₄）。'),
    p('図3は，AとBの加算を行い，結果をSに求める加算器であり，半加算器と全加算器で実現されている。ここで，C₁〜C₄は半加算器及び全加算器からのけた上がりを表す。'),
    p('この加算器に，Aとして' + printable(a) + 'を，Bとして' + printable(b) +
      '（いずれも10進表記）を与えたとき，図3のC₁〜C₄の値として正しい組合せを，解答群の中から選べ。'),
    draw('rippleAdder', 0, '図3　AとBを加算してSを求める加算器'),
    table('解答群', ['', ...signedHead], rows(carryChoices)),
  ]];
}

export const legacy2009AutumnPm1Definition = define(1, '半加算器と全加算器', '設問1 a=オ・設問2 b=エ・c=ウ・設問3=エ',
  '2の補数の入力と真理値表の空欄行', '真理値表の空欄行と4ビット加算器の入力を変更します。',
  'p.6〜9。論理ゲートの意味、けた上がりの方向、2の補数、符号ビット、二つの組合せ表の列順を保持。aとbは加算器の構成により固定。', index => {
    const { a, b, blankRow } = additions[index];
    const [c, x, y] = triples[blankRow];
    const partial = partialCarry(c, x, y).join('');
    const final = rippleCarry(a, b);
    return {
      prompt: autumn2009Pm1Pages(index).flat(),
      ...answers([strings(aOptions), strings(bOptions), answerTable('けた上がり', cHead, cOptions),
        answerTable('各ビットのけた上がり', signedHead, carryChoices)], [
        single('a', '設問1 a', 0, 4), single('b', '設問2 b', 1, 3),
        single('c', '設問2 c', 2, cOptions.indexOf(partial)), single('sub3', '設問3', 3, carryChoices.indexOf(final)),
      ]),
      explanation: '半加算器の下位桁ZはXとYが異なるときに1となるのでaはXORである。二つの半加算器のいずれかがけた上がりを出せば全加算器はけた上がるのでbはORである。空欄行のCᵢₙ，X，Yは' +
        [c, x, y].join('，') + 'で，まずXとYを加え，次にその下位桁とCᵢₙを加える。C₁，C₂は' + [...partial].join('，') +
        'となる。設問3は2の補数を下位桁から順に加算すると，C₁〜C₄は' + [...final].join('，') + 'となる。',
    };
  });
