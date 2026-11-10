import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2013-spring-pm-01-04-shared';
import { colorCases, colorRows } from './legacy-2013-spring-pm-01-04-models';
import { draw } from './legacy-2013-spring-pm-01-04-figures';

const bitChoices = ['011', '101', '110'];
const colorChoices = ['青', '赤', '黄', '黒', 'シアン', '白', 'マゼンタ', '緑'];
const valueChoices = [2, 4, 8, 16, 32, 60, 64, 120, 128, 240];
const planeCountWords = ['零', '一', '二', '三', '四', '五', '六', '七', '八'];

function color(bits: string) {
  return colorRows.find(row => row[2] === bits)![1].split('（')[0];
}

function planes(first: number, count: number) {
  return Array.from({ length: count }, (_, index) => 'プレーン' + (first + index)).join(count === 2 ? 'と' : '，');
}

export function spring2013Pm1Pages(index: number) {
  const input = colorCases[index];
  const count = input.red + input.other * 2;
  const [red, green, blue] = input.head;
  const allocation = [
    planes(1, input.red) + 'を赤に',
    planes(1 + input.red, input.other) + 'を緑に',
    planes(1 + input.red + input.other, input.other) + 'を青に割り当てる。',
  ].join('，');
  return [
    [
      p('次の問1から問7までの7問については，この中から5問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，6問以上マークした場合には，はじめの5問について採点します。'),
      p('問1　カラー画像に関する次の記述を読んで，設問1〜3に答えよ。'),
      p('赤，緑，青の色の光（以下，色という）を，光の3原色という。赤，緑，青の色を発光させて重ね合わせることによって様々な色を表現することができる。緑と青の色を重ね合わせるとシアンに，青と赤の色を重ね合わせるとマゼンタに，赤と緑の色を重ね合わせると黄に，赤緑青全ての色を重ね合わせると白になる。光の3原色のどれも発光していないと黒になる。光の3原色による色の表現を，図1に示す。ここで，図1中の記号は，表1に示す色を表す。'),
      draw('color', 0, '図1　光の3原色による色の表現'),
      table('表1　記号と色の対応', ['記号', '色'], colorRows.map(([mark, label]) => [mark, label])),
    ],
    [
      p('設問1　ディスプレイにカラー画像を表示するために，1画素を3ビットで表現することにする。3ビットの先頭（左端）から各ビットに赤，緑，青の色の情報を順に割り当て，2階調（1のとき発光，0のとき非発光）で表現する。この3ビットのビットパターンで8色を表現することができる。色とビットパターンの対応を表2に示す。［a］に入れる正しい答えを，解答群の中から選べ。'),
      draw('colorBits', index, '表2　色とビットパターンの対応'),
      ...bank('解答群', bitChoices),
    ],
    [
      p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('ディスプレイに画像を表示するとき，画像データは，ビデオRAM（以下，VRAMという）と呼ばれるメモリに格納されている。'),
      p('カラー画像データをVRAMに格納する方法の一つに，プレーンドアクセス方式がある。プレーンドアクセス方式では，VRAM上にディスプレイの画素数と同じ数のビットをもつプレーンという区分を複数用意する。各プレーンの先頭に位置するビットをディスプレイの最左上の画素に対応づけ，ディスプレイの左から右，上から下の画素へと順にプレーンのビットを割り当てる。赤，緑，青それぞれの色を2階調で表現する場合，色の情報を格納するために，VRAM上にプレーン1，プレーン2，プレーン3と呼ぶ，三つの区分を用意する。プレーン1，プレーン2，プレーン3のそれぞれを，赤，緑，青の色に割り当て，各プレーンの同じ位置のビットを取り出した3ビットで，1画素を表現する。'),
      p('例えば，プレーン1の先頭ビットが' + red + '，プレーン2の先頭ビットが' + green + '，プレーン3の先頭ビットが' + blue + 'のとき，ディスプレイの最左上の画素の色は［b］となる。'),
      p('VRAMの内容が図2のとおりであった場合，各プレーンの先頭から数えて' + input.nth + '番目のビットに対応するディスプレイの画素の色は［c］となる。ここで，VRAMの内容は16進数で表記している。'),
      draw('vram', index, '図2　VRAMの内容（プレーンドアクセス方式）'),
    ],
    [
      ...bank('解答群（設問2）', colorChoices),
      p('設問3　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('設問2のプレーンドアクセス方式では，赤，緑，青それぞれの色に一つのプレーンを用意することによって，8色を表現することができた。一つの色に複数のプレーンを用意することによって，その色の階調数を増やすことができる。その結果，より多くの色を表現することができるようになる。'),
      p('（1）VRAM上に' + planeCountWords[count] + 'つの区分を用意し，各区分をプレーン1，プレーン2，…，プレーン' + count + 'と呼ぶ。各プレーンの同じ位置のビットを取り出した' + count + 'ビットで，1画素を表現する。' + allocation + 'このとき，赤は' + 2 ** input.red + '階調，緑と青はそれぞれ［d］階調となり，この' + count + 'ビットで［e］色を表現することができる。'),
      p('（2）縦' + input.height + '×横' + input.width + '画素のディスプレイに' + input.colors + '色を表現するためには，少なくとも［f］kバイトのVRAMが必要である。ここで，1kバイトは1,000バイトとする。'),
      ...bank('解答群（設問3）', valueChoices),
    ],
  ];
}

export const legacy2013SpringPm1Definition = define(1, 'カラー画像', '設問1 a=イ、設問2 b=オ・c=ア、設問3 d=イ・e=オ・f=コ',
  '混色の対象・ビット位置・プレーン数・画面条件',
  '色の組合せ、各プレーンから取り出すビット、階調数とディスプレイ条件を変えます。',
  '冊子p.5〜8。六つの欄、原順3・8・8・10・10・10択、三原色の領域、網掛けの空欄、画素の左上からの対応、16進数、10進のkバイトを保持。0/1の固定3ビット、8桁の2進数、階調は2の累乗、容量は整数kバイトに限定し、原問の意味のある選択肢間隔を維持。', index => {
    const input = colorCases[index];
    const bitPattern = colorRows.find(row => row[0] === input.secondary)![2];
    const nthBits = input.bytes.map(byte => (Number.parseInt(byte, 16) >> (8 - input.nth)) & 1).join('');
    const levels = 2 ** input.other;
    const colors = 2 ** (input.red + 2 * input.other);
    const bitsPerPixel = Math.log2(input.colors);
    const kb = input.height * input.width * bitsPerPixel / 8000;
    return {
      prompt: spring2013Pm1Pages(index).flat(),
      ...answers([strings(bitChoices), strings(colorChoices), strings(valueChoices.map(String))], [
        single('a', '設問1 a', 0, bitChoices.indexOf(bitPattern)),
        single('b', '設問2 b', 1, colorChoices.indexOf(color(input.head))),
        single('c', '設問2 c', 1, colorChoices.indexOf(color(nthBits))),
        single('d', '設問3 d', 2, valueChoices.indexOf(levels)),
        single('e', '設問3 e', 2, valueChoices.indexOf(colors)),
        single('f', '設問3 f', 2, valueChoices.indexOf(kb)),
      ]),
      explanation: '赤・緑・青の順に発光を1とする。設問1は' + color(bitPattern) + 'のビットパターン' + bitPattern + '。設問2は先頭の並びが' + input.head + 'なので' + color(input.head) + '，' + input.nth + '番目は' + input.bytes.join('，') + 'をそれぞれ8ビットに直して取り出すと' + nthBits + 'なので' + color(nthBits) + '。設問3は緑と青に各' + input.other + 'ビットを使うので各' + levels + '階調，全プレーンの組合せは' + colors + '色。' + input.colors + '色には1画素当たり' + bitsPerPixel + 'ビットが必要なので，' + input.height + '×' + input.width + '×' + bitsPerPixel + '÷8÷1,000＝' + kb + 'kバイト。VRAM（Video Random Access Memory）は画面に表示する画像データを格納するメモリである。',
    };
  });
