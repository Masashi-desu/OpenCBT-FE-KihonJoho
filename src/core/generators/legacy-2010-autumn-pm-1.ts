import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2010-autumn-pm-01-04-shared';
import { draw } from './legacy-2010-autumn-pm-01-04-figures';
import { hex, shape, thermometerCase } from './legacy-2010-autumn-pm-01-04-models';

function instructions(output: number, status: number) {
  return [Math.min(output, status), Math.max(output, status)].map(port => 'INPUT ' + port)
    .concat(['OUTPUT 1', 'OUTPUT 2', 'OUTPUT 3']);
}
const caption1 = '図1　温度モニタのシステム構成図の一部';

export function autumn2010Pm1Pages(index: number) {
  const { demo, digit, ports: [output, status, data], temperature, shapes, bcd, binary } = thermometerCase(index);
  const shapeWord = hex(shape(Math.floor(temperature / 10)), 2) + hex(shape(temperature % 10), 2);
  return [[
    p('問1　温度モニタに関する次の記述を読んで，設問1〜3に答えよ。'),
    p('図1に温度モニタのシステム構成図の一部を示す。'),
    p('温度の検出範囲は0〜99℃とし，対応するA/D変換器の出力値は，0〜99の16ビット符号なし2進数とする。このシステムは，タイマ割込み発生時に起動される割込みプログラムの中で温度検出器の出力値をA/D変換器を介して取り込み，2個の7セグメントLEDからなる表示器に表示する。1個の7セグメントLEDには10進数の数字1けたを表示する。検出された温度0〜99℃に対して，表示器では“00”〜“99”として表示する。'),
    p('LEDの各セグメントは，対応する出力ポートのビットの値が1のとき点灯し，0のとき消灯する。7セグメントLEDに，“0”〜“9”の数字を表示するために，対応する8ビットのデータを数字の字形に合わせて設定する。これらを形状データという。'),
    p('割込みプログラムが起動するA/D変換の開始から，表示処理の完了までの時間は，タイマ割込み間隔に比べて十分短い。'),
    draw('thermometer', index, caption1),
    p('注　“' + demo + '”を表示した例である。ここで，出力ポートのビット0とビット8には常に0が設定され，小数点を表示するセグメントは消灯しているものとする。'),
  ], [
    p('割込みプログラム中で，各機器に対するデータの読込み及び書込みは各機器に割り当てられたI/Oポート番号を指定して行う。7セグメントLEDが接続されている出力ポートにはI/Oポート番号' + output + 'が，A/D変換器にはI/Oポート番号' + status + 'と' + data + 'がそれぞれ割り当てられている。表1に出力ポートとA/D変換器の動作概要を示す。'),
    table('表1　出力ポートとA/D変換器の動作概要', ['機器', 'I/Oポート番号', '動作概要'], [
      ['出力ポート', String(output), '番号' + output + 'のI/Oポートに形状データを書き込むと出力ポートの各ビットに値が設定され，LEDの各セグメントの点灯と消灯が行われる。'],
      ['A/D変換器', String(status), '番号' + status + 'のI/Oポートに値1を書き込むとA/D変換が開始される。'],
      ['A/D変換器', String(status), '番号' + status + 'のI/Oポートから読み込んだ値が0ならば，変換中を示す。'],
      ['A/D変換器', String(status), '番号' + status + 'のI/Oポートから読み込んだ値が0以外ならば，A/D変換が完了し出力値が確定していることを示す。'],
      ['A/D変換器', String(data), 'A/D変換完了後に番号' + data + 'のI/Oポートから読み込むとA/D変換器の出力値（0〜99）が得られる。'],
    ]),
    p('注　読込みデータ及び書込みデータはすべて16ビット'),
    p('設問1　下位けたの7セグメントLEDに図2のように“' + digit + '”を表示したい。出力ポートのビット7〜0に設定すべき形状データとして正しい答えを，解答群の中から選べ。ここで，形状データはビット7を最上位ビットとする16進数で表記する。'),
    draw('digit', index, '図2　“' + digit + '”の表示'),
    ...bank('解答群', shapes),
  ], [
    p('設問2　タイマ割込み発生時に起動される割込みプログラムについて，その処理の流れを図3に示す。図3の処理中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('なお，処理中で使用している擬似命令の意味は表2のとおりとする。'),
    table('表2　擬似命令', ['命令の形式', '命令の動作'], [
      ['INPUT I/Oポート番号', '番号で指定したI/Oポートに接続されている機器からデータを読み込み，GRに設定する。'],
      ['OUTPUT I/Oポート番号', 'GRに設定したデータを，番号で指定したI/Oポートに接続されている機器に書き込む。'],
      ['CALL DISPLAY', '手続DISPLAYを呼び出す。'],
    ]),
    p('注　GRはCPUのレジスタ'),
    draw('interrupt', index, '図3　割込みプログラムの処理の流れ'),
    ...bank('解答群', instructions(output, status)),
  ], [
    p('設問3　割込みプログラムの中で呼び出す手続DISPLAYの仕様と実行例は次のとおりである。実行例に関する記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('〔手続DISPLAYの仕様〕'),
    p('DISPLAYはGRに設定されたデータが示す値を表示器に表示する。7セグメントLEDに“0”〜“9”の数字を表示するために，それぞれ8ビットからなる10個の形状データを表としてプログラム中に保持している。'),
    p('GRに設定されたデータは，検出した温度に対応する0〜99の16ビット符号なし2進数であり，このまま出力ポートに設定しても意図した表示にはならない。GRの内容を図4のとおり2けたのBCD（2進化10進数）に変換し，表を引き，各けたに対応した形状データを図5のとおりにGRに設定して出力ポートに書き込む。'),
    draw('bcd', 0, '図4　BCD変換後のGRの内容'),
    draw('shapeWord', 0, '図5　出力ポートに書き込むGRの内容'),
    p('〔手続DISPLAYの実行例〕'),
    p('図5のGRの内容が16進数表記で' + shapeWord + 'であったとき，BCD値を格納していた図4のGRの内容は16進数表記で［c］であり，割込みプログラムから手続DISPLAYに渡されたGRの内容は16進数表記で［d］である。'),
    ...bank('cに関する解答群', bcd),
    ...bank('dに関する解答群', binary),
  ]];
}

export const legacy2010AutumnPm1Definition = define(1, '温度モニタ', '設問1=イ・設問2 a=エ・b=イ・設問3 c=ウ・d=ウ',
  'タイマ間隔、出力と変換のポート、表示する数字・表示例、変換値',
  '出力先・変換のポート番号と割込み間隔、点灯させる数字、表示する温度を変更します。',
  'p.5〜8。16ビットの入出力、上位と下位の対応、各セグメントへの結線、点灯条件、タイマと割込み処理の順序、変換中と完了の条件、擬似命令、BCDと形状データの配置を保持。', index => {
    const { digit, ports: [output, status, data], temperature, shapes, bcd, binary } = thermometerCase(index);
    const command = instructions(output, status), tens = Math.floor(temperature / 10), ones = temperature % 10;
    const bcdWord = '0' + tens + '0' + ones, binaryWord = hex(temperature, 4), byte = hex(shape(digit), 2);
    return {
      prompt: autumn2010Pm1Pages(index).flat(),
      ...answers([strings(shapes), strings(command), strings(bcd), strings(binary)], [
        single('1', '設問1', 0, shapes.indexOf(byte)),
        single('2a', '設問2 a', 1, command.indexOf('OUTPUT ' + status)),
        single('2b', '設問2 b', 1, command.indexOf('INPUT ' + status)),
        single('3c', '設問3 c', 2, bcd.indexOf(bcdWord)),
        single('3d', '設問3 d', 3, binary.indexOf(binaryWord)),
      ]),
      explanation: 'LED（Light Emitting Diode）は発光ダイオード，A/D（Analog to Digital）変換はアナログ量のデジタル化，I/O（Input/Output）は入出力，BCD（Binary Coded Decimal）は各10進数字を4ビットで表す2進化10進数を意味する。図2の点灯箇所を図1でビット7から0へたどると，' + shape(digit).toString(2).padStart(8, '0') +
        'となり，16進数では' + byte + '。GRの1をOUTPUT ' + status + 'で書くと変換を開始し，INPUT ' + status +
        'で読み取った状態が0の間は待つ。状態が0以外ならINPUT ' + data + 'で変換値を得てDISPLAYを呼ぶ。' +
        '表示用の上位バイトは数字' + tens + '，下位バイトは数字' + ones + 'の形状を表す。BCDは図4の4ビットずつに0・' +
        tens + '・0・' + ones + 'を置いた' + bcdWord + '。変換値そのものは10進数の' + temperature +
        'であり，16ビットの符号なし2進数を16進数で書くと' + binaryWord + 'になる。',
    };
  });
