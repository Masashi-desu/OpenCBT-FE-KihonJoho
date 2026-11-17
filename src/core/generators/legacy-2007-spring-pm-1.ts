import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2007-spring-pm-01-05-shared';
import { draw } from './legacy-2007-spring-pm-01-05-figures';
import { registerCases, wordHex } from './legacy-2007-spring-pm-1-model';

const dChoices = ['51','52','61','62'];
function operands(index: number) {
  const { registers, shift, fixed, multiplier } = registerCases[index];
  const [r1,r2,r3,r4,r5] = registers;
  const val = r1|r2, high = r4 >>> shift, low = (r4 << shift)&0xffff, swapped = high|low;
  const a = index === 0 ? ['9375','9395','9575','9595'] : [val, r1 + r2 & 0xffff, r1 ^ r2, r1 & r2].map(wordHex);
  const bc = index === 0 ? ['005F','008B','00C3','2A00','2A5F','8B00','8BC3','C38B'] :
    [r3 >>> 8, r4 & 0xff, high, (r3 << shift)&0xffff, ((r3 << shift)&0xffff)|(r3 >>> shift), low, swapped, r4].map(wordHex);
  const target = wordHex(r5 * multiplier);
  return { registers, shift, fixed, multiplier, a, bc, target, val, low, swapped };
}
export function spring2007Pm1Pages(index: number, print = true) {
  const { registers, shift, fixed, multiplier, a, bc, target } = operands(index);
  const pages = [
    [p('機械語命令の実行に関する次の記述を読んで，設問に答えよ。'),
      p('（1）1語は16ビットで，命令語は1語長である。命令語の形式は図1のとおりである。'),
      draw('word', 0, '図1　命令語の形式'),
      p('（2）op，r及びvの意味を表1に示す。レジスタは，1語長で16個（レジスタ番号0〜F）ある。op，r，v及びレジスタの内容は，16進数で表示する。'),
      table('表1　op，r及びvの意味', ['記号','意味'], [['op','命令コード（00≦op≦FF）'],['r','レジスタ番号（0≦r≦F）'],['v','レジスタ番号又は定数（0≦v≦F）']]),
      p('（3）命令の仕様（一部）を表2に示す。'),
      table('表2　命令の仕様（一部）', ['名称','op（命令コード）','動作'], [
        ['LR（Load Register）','10','レジスタ v の内容をレジスタ r に設定する。'],
        ['AR（Add Register）','20','レジスタ r とレジスタ v の内容の和を求め，結果をレジスタ r に設定する。'],
        ['OR（Or Register）','30','レジスタ r とレジスタ v の内容の論理和を求め，結果をレジスタ r に設定する。'],
        ['SL（Shift Left）','40','レジスタ r の内容を定数 v ビットだけ左へシフトする。シフトした結果，空いたビット位置には0を設定する。'],
        ['SR（Shift Right）','50','レジスタ r の内容を定数 v ビットだけ右へシフトする。シフトした結果，空いたビット位置には0を設定する。'],
      ])],
    [p('設問　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。レジスタ1〜5の内容は，図2のとおりとする。'),
      draw('registers', index, '図2　レジスタ1〜5の内容'),
      p('（1）図2の状態で，次の命令語を実行するとレジスタ2の内容は［a］になる。'), p('命令語：3021'),
      p('（2）図2の状態で，次の4個の命令語を順に実行するとレジスタ3の内容は［b］に，レジスタ4の内容は［c］になる。'),
      p('命令語：1034'), p('　　　　403' + shift), p('　　　　504' + shift), p('　　　　3043'),
      p('（3）図2の状態で，次の4個の命令語を順に実行するとレジスタ5の内容は' + multiplier +
        '倍になる（レジスタ5：' + wordHex(registers[4]) + ' → ' + target + '）。'),
      p('命令語：1065'), p('　　　　406' + fixed), p('　　　　40［d］'), p('　　　　2056')],
  ];
  if (print) pages.push([...bank('aに関する解答群', a), ...bank('b，cに関する解答群', bc), ...bank('dに関する解答群', dChoices)]);
  return pages;
}
export const spring2007Pm1 = define(1,'機械語命令によるレジスタの演算','a=ア／b=カ／c=キ／d=ア',
  'レジスタ内容、固定シフト量と要求する倍率','16進数の命令語を命令部とオペランド部に分けて実行する。',
  '16bit語・16レジスタ・op/r/v・0詰め・4欄と択順を保持。演習用の命令体系で第三者図版なし。元のOR、8bit入替え、加算とシフトの倍率を別の値で解く。',index=>{
    const { a,bc,multiplier,fixed,registers,val,low,swapped } = operands(index);
    const correctD = dChoices.findIndex(option=>{
      const [r,v] = [...option].map(Number);
      const values = [registers[4],registers[4] << fixed];
      values[r-5] <<= v;
      return values[0]+values[1] === registers[4]*multiplier;
    });
    return { prompt:spring2007Pm1Pages(index,false).flat(),
      ...answers([strings(a),strings(bc),strings(dChoices)],[single('a','a',0,a.indexOf(wordHex(val))),single('b','b',1,bc.indexOf(wordHex(low))),
        single('c','c',1,bc.indexOf(wordHex(swapped))),single('d','d',2,correctD)]),
      explanation:'3021はORで，レジスタ2と1の論理和は'+wordHex(val)+'。レジスタ4を3に複写して左へ8ビットずらすと'+
        wordHex(low)+'，4を右へ8ビットずらしてから3との論理和を取ると'+wordHex(swapped)+
        '。最後の列では元の値を6へ複写してから固定の左シフトを行う。'+dChoices[correctD]+'を加えると5と6の値の和が元の'+
        multiplier+'倍になる。',
    };
  });
