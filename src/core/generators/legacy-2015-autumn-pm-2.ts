import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, strings, variableNotes } from './definition';
import { autumn2015Pm0104Diagram as diagram, autumn2015Pm0104Profiles as profiles } from './legacy-2015-autumn-pm-01-04-figures';
import { autumn2015Pm2CaseCount, autumn2015Pm2Inputs, autumn2015Pm2Word } from './legacy-2015-autumn-pm-01-04-models';
import { autumn2015PmAnswers, autumn2015PmBank as bank, autumn2015PmCase, autumn2015PmSingle as single } from './legacy-2015-autumn-pm-01-04-shared';
import { pm2Choices as choices, pm2Text as text } from './legacy-2015-autumn-pm-01-04-text';

const superscript = (n: number) => String(n).replace(/\d/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]);

export const legacy2015AutumnPm2Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-2',
  title: '浮動小数点数',
  sourceAnswer: '設問1=イ、設問2=オ、設問3 a=オ・b=イ、設問4 c=ウ',
  version: '3.2.0',
  fields: [field('単精度表現する値・加算の指数・定数倍', 0, autumn2015Pm2CaseCount - 1)],
  reference: [0],
  publicNotes: '単精度の32ビット図と計算手順を保ち、符号化する値、読み取るビット列、加算の指数、定数倍の二つの項を変えています。仮数部へ収まらない桁を切り捨てる規則は原問と同じです。',
  notes: variableNotes + ' 物理・印刷p.10〜12、5欄30択。α=0又は1≦|α|＜2、−126≦β≦127、バイアス127、隠れた整数1、仮数ビットの切捨て、全0の規則を保持。Aは1.1₂、Bは絶対値がAの半分で負。定数倍は2の冪二つの和、6択は元の3指数×2仮数の順、非表示ビットは常に0。',
  build(values) {
    const index = autumn2015PmCase(values, autumn2015Pm2CaseCount - 1);
    const c = autumn2015Pm2Inputs(index);
    const power = superscript(c.exponent);
    const first = 2 ** c.firstShift;
    const second = 2 ** c.secondShift;
    const multiplier = first + second;
    const rawExponent = (autumn2015Pm2Word(c.input) >>> 23) & 255;
    const hex = rawExponent.toString(16).toUpperCase().padStart(2, '0');
    const hexChoices = choices.s1.map(x => '(' + x + ')₁₆');
    const exponentChoices = [-2, -1, 0, 1, 125, 126, 127].map(offset => c.exponent + offset);
    const product = c.a * multiplier;
    const resultBits = autumn2015Pm2Word(product);
    const exponentField = (resultBits >>> 23) & 255;
    const word = (subindex: number, title: string, hide = false) => diagram(profiles.word, [index, subindex], title, hide);
    return {
      prompt: [
        p(text.notice), p(text.heading), p(text.definition), diagram(profiles.bits, [0], '図1 32ビット単精度浮動小数点形式'),
        ...text.rules.map(p), p(text.notation),
        p(text.s1.replace('0.625', String(c.input))), ...bank('解答群', hexChoices),
        p(text.s2), word(0, '設問2の単精度表現', true), ...bank('解答群', choices.s2),
        ...text.s3.map(p), word(1, 'Aの単精度表現'), word(2, 'Bの単精度表現'),
        p(text['add-intro']), p(text.align.replaceAll('2⁵', '2' + power)), p(text.add.replace('2⁵', '2' + power)),
        ...bank('aに関する解答群', choices.a), ...bank('bに関する解答群', exponentChoices),
        p(text.s4[0]), p(text.s4[1].replace('A×10', 'A×' + multiplier)),
        p('① A×' + first + 'の値を求める。A×' + first + '＝(1.1)₂×2' + power + '×' + first +
          '＝(1.1)₂×2' + power + '×2' + superscript(c.firstShift) + '＝(1.1)₂×2' + superscript(c.exponent + c.firstShift) + '。'),
        p('② A×' + second + 'の値を同様に求める。'), p('③ ①と②の結果を加算する。'),
        p(text.result), p('cに関する解答群'),
        ...Array.from({ length: 6 }, (_, j) => word(j + 3, 'アイウエオカ'[j])),
      ],
      ...autumn2015PmAnswers([
        strings(hexChoices), strings(choices.s2.map(String)), strings([...choices.a]), strings(exponentChoices.map(String)),
        Array.from({ length: 6 }, (_, j) => [word(j + 3, '単精度表現', true)]),
      ], [
        single('s1', '設問1', 0, choices.s1.indexOf(hex as typeof choices.s1[number])),
        single('s2', '設問2', 1, choices.s2.indexOf(c.decodeValue as typeof choices.s2[number])),
        single('a', '設問3 a', 2, 4), single('b', '設問3 b', 3, 1), single('c', '設問4 c', 4, 2),
      ]),
      explanation: [
        '設問1：' + c.input + 'を絶対値が1以上2未満の仮数に正規化すると指数は' + (rawExponent - 127) +
          '。指数部は127を加えた' + rawExponent + 'で，16進数では(' + hex + ')₁₆。0や最大付近の指数部を選ぶ問題ではない。',
        '設問2：符号は0。指数部から127を引き，仮数部の前に省略された1を戻して，指数の2の冪を掛けると' + c.decodeValue + 'になる。指数部をそのまま使ったり，仮数の1を落としたりしない。',
        '設問3：A=' + c.a + '、B=' + c.b + '。Bの指数を' + c.exponent + 'にそろえると絶対値の仮数は(0.11)₂。和はAの半分なので，正規化した仮数は(1.1)₂、指数は' + (c.exponent - 1) +
          'になる。bは指数部に格納するバイアス加算後の値ではない。',
        '設問4：A×' + first + 'とA×' + second + 'を足すと' + product + '。正規化後の指数は' + (exponentField - 127) +
          'で，指数部は' + exponentField + '、仮数部は先頭1を除いた小数部。ウだけが両方を満たす。ア・イはバイアスを加えておらず，オ・カは指数が1大きい。イ・エ・カは仮数部の1ビットも異なる。',
      ].join('\n'),
    };
  },
};
