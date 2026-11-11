import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2011-special-pm-01-04-shared';
import { draw } from './legacy-2011-special-pm-01-04-figures';
import { cpuCase, loadColumns } from './legacy-2011-special-pm-01-04-models';

const symbols = [
  ['op', '8', '00h〜FFhで示されるいずれかの命令コードが指定される。'],
  ['r₁', '2', '0〜3で示されるいずれかのレジスタ番号が指定される。'],
  ['r₂', '2', '0〜3で示されるいずれかのレジスタ番号が指定される。'],
  ['X', '2', '指標レジスタ修飾を行うときは，指標レジスタ修飾に使用するレジスタを表す1〜3で示されるいずれかのレジスタ番号が指定される。\n指標レジスタ修飾を行わないときは，0が指定される。'],
  ['D', '1', '1語命令のときは，1が指定される。\n2語命令のときは，0が指定される。'],
  ['I', '1', '間接アドレス指定を行うときは，1が指定される。\n間接アドレス指定を行わないときは，0が指定される。'],
  ['adr', '16', '0〜999で示されるいずれかの値（番地を表す値）が指定される。'],
];
const addressing = [
  ['0', '0', 'adr＋[Xで指定されたレジスタ]'],
  ['0', '1', '[adr＋[Xで指定されたレジスタ]]'],
  ['1', '1', '[r₂で指定されたレジスタ]'],
];
const opcodes = [
  ['10h', '実効アドレスに格納されている内容又はソースレジスタの内容を，r₁で指定されたレジスタに足し込む。'],
  ['20h', '実効アドレスに格納されている内容又はソースレジスタの内容を，r₁で指定されたレジスタに設定する。'],
  ['30h', 'r₁で指定されたレジスタの内容を，実効アドレスに格納する。'],
  ['FFh', 'プログラムを終了する。'],
];
const instructionLabels = ['1', '2', '3', '3（2語目）', '4', '5', '6'];

export function special2011Pm1Pages(index: number) {
  const { initial, program, values, dst, base, loadRegisters, loadMemory, loadOptions } = cpuCase(index);
  return [[
    p('問1　機械語命令に関する次の記述を読んで，設問1，2に答えよ。'),
    p('この機械語が実行されるCPUの1語は16ビットで，CPUには1語長の汎用レジスタが四つ（レジスタ番号0〜3）ある。主記憶容量は1,000語（番地0〜999）あり，命令語は700番地以降に格納される。命令語の形式は図1に示すとおりである。命令には1語命令と2語命令があり，1語命令の場合は1語目だけで構成される。'),
    draw('instruction', 0, '図1　命令語の形式'),
    p('注1）1語命令のときにはr₂，2語命令のときにはX'),
    p('図1で使用している記号の説明を表1に，命令の実効アドレスの算出方法を表2に，命令の対象となるデータが設定されているレジスタ（以下，ソースレジスタという）の指定方法を表3に，命令の仕様（一部）を表4に示す。数字の末尾にhが付いているものは16進数表記である。'),
  ], [
    table('表1　記号の説明', ['記号', 'ビット数', '内容'], symbols),
    table('表2　実効アドレスの算出方法', ['D', 'I', '実効アドレス'], addressing),
    p('注　[ ]は，[ ]内のレジスタ又は番地に格納されている内容を示す。'),
    table('表3　ソースレジスタの指定方法', ['D', 'I', 'ソースレジスタ'], [['1', '0', 'r₂で指定されたレジスタ']]),
    table('表4　命令の仕様（一部）', ['命令コード', '動作'], opcodes),
  ], [
    p('設問1　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('命令を実行する前のレジスタの内容は，図2のとおりとする。この状態で図3のプログラムを先頭の700番地から順に実行した。'),
    p('命令語2の実行が終わった時点での，レジスタ番号1のレジスタの内容は［a］である。命令語5の実行が終わった時点での，レジスタ番号1のレジスタの内容は［b］であり，レジスタ番号3のレジスタの内容は［c］である。'),
    table('図2　レジスタの内容', ['レジスタ番号', '内容'], initial.map((value, i) => [String(i), String(value)])),
    table('図3　プログラム', ['主記憶番地', '内容', '命令語'], program.map((word, i) => [String(700 + i), word, instructionLabels[i]])),
    ...bank('解答群', values),
  ], [
    p('設問2　レジスタと主記憶の内容が図4に示す値のとき，レジスタ番号' + dst + 'のレジスタに' + base +
      'を設定する命令語の記述として誤りであるものを，解答群の中から選べ。'),
    table('図4　レジスタと主記憶の内容（レジスタ）', ['レジスタ番号', '内容'], loadRegisters.map(row => row.map(String))),
    table('図4　レジスタと主記憶の内容（主記憶）', ['主記憶番地', '内容'], loadMemory.map(row => row.map(String))),
    table('解答群　1語目（op，r₁，r₂又はX，D，I）／2語目（adr）', ['記号', ...loadColumns],
      loadOptions.map((row, i) => ['アイウエオ'[i], ...row])),
  ]];
}

export const legacy2011SpecialPm1Definition = define(1, '機械語命令と実効アドレス',
  '1a=ア・1b=エ・1c=オ・2=エ', 'レジスタ初期値・アドレス・命令のレジスタ番号',
  'プログラムの初期値と、ロードする値・レジスタを変えます。',
  'p.5〜8。16ビットのビット位置・未使用領域，1語目・2語目，D/Iと指標レジスタ修飾，' +
  '700番地からの実行・命令3の2語構成・命令2と5の時点，設問2の否定方向と2語目の有無を保持する。', index => {
    const { trace, initial, values, base, dst, loadOptions, results } = cpuCase(index);
    const [a, b, c] = [trace[1][1], trace[4][1], trace[4][3]];
    return {
      prompt: special2011Pm1Pages(index).flat(),
      ...answers([strings(values.map(String)), loadOptions.map(row => [table('命令語のフィールド', loadColumns, [row])])], [
        single('1a', '設問1 a', 0, values.indexOf(a)),
        single('1b', '設問1 b', 0, values.indexOf(b)),
        single('1c', '設問1 c', 0, values.indexOf(c)),
        single('2', '設問2', 1, results.findIndex(value => value !== base)),
      ]),
      explanation: '命令語1はR0の' + initial[0] + 'をR1に設定する。命令語2はそのR1をR3の' + initial[3] +
        'に足すので，R1は' + a + '，R3は' + c + 'になる。命令語3はadrの0とR1を足した番地' + a +
        'へR2の' + initial[2] + 'を書き込む。命令語4はR1を間接アドレスとしてその番地の値をR0に足し，命令語5はそのR0の' +
        b + 'をR1へ移す。設問2のア〜オがR' + dst + 'に設定する値は順に' + results.join('，') +
        'である。エは指標レジスタを足した後にメモリから実効アドレスを読み，その番地をさらに読むので' + base + 'にならない。',
    };
  });
