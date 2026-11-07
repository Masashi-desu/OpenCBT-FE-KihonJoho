import { code, field, p, table, type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { answerBody, choiceBankText, heading, pageAlt, selectCase, springLanguageReferences } from './legacy-2016-spring-pm-09-13-support';
import { blockText, type SourcePage } from './legacy-2016-autumn-pm-09-13-support';

const reference = springLanguageReferences([71, 72, 73, 74, 75, 76], true);
const displayTimes = ['2708', '2347', '3125', '1638', '2116', '2649', '3618', '2951'];
const jumpAnswers = ['JMI LOOP12', 'JMI LOOP13', 'JPL LOOP12', 'JPL LOOP13', 'JUMP LOOP12', 'JUMP LOOP13', 'JZE LOOP12', 'JZE LOOP13'];
const tieAnswers = ['チーム番号の昇順に出力される', 'チーム番号の降順に出力される', 'どのチームが先に出力されるかは時々で異なる'];
const dAnswers = ['JMI LOOP21', 'JMI LOOP22', 'JPL LOOP21', 'JUMP LOOP21', 'JUMP LOOP22', 'JZE LOOP22'];
const eAnswers = ['JMI LOOP21', 'JPL LOOP21', 'JPL LOOP22', 'JUMP LOOP22', 'JZE LOOP21', 'JZE LOOP22'];

export function spring2016Pm12Race(ascending: boolean) {
  return `RACE    START
LOOP11  CALL  INPUT
        LD    GR0,GR0
        JMI   IEND
        ADDA  GR2,TOTAL,GR1    ; タイム
        ST    GR2,TOTAL,GR1
        JUMP  LOOP11
IEND    LD    GR3,=9
        LD    GR0,=#7FFF       ; 最大値
LOOP12  LD    GR2,GR0
        LD    GR4,=${ascending ? 1 : 9}
LOOP13  CPA   GR2,TOTAL,GR4
        JPL   CHANGE
        JUMP  NEXT
CHANGE  LD    GR2,TOTAL,GR4    ; GR2←新たなタイムの最小値
        LD    GR1,GR4          ; GR1←そのチーム番号
${ascending ? 'NEXT    ADDA  GR4,=1\n        CPA   GR4,=10' : 'NEXT    SUBA  GR4,=1'}
        [a]
        SRL   GR2,3           ; 平均タイム
        CALL  OUTPUT
        ST    GR0,TOTAL,GR1    ; 処理済みとして最大値を設定
        SUBA  GR3,=1
        [b]
        RET
TOTAL   DC    0,0,0,0,0,0,0,0,0,0    ; (チーム数＋1)個の領域
        END`;
}

export const spring2016Pm12Output = ` 1 OUTPUT  START
 2         RPUSH
 3         OR    GR1,=#0030
 4         ST    GR1,TEAM
 5         LAD   GR3,TIME
 6         LD    GR4,=0
 7         LD    GR5,=3          ; ループ回数
 8 LOOP21  LD    GR6,DIVISOR,GR4 ; GR6 ← 除数
 9         LD    GR7,=0          ; GR7 ← 商
10 LOOP22  CPA   GR2,GR6
11         JMI   SETTIME
12         SUBA  GR2,GR6
13         ADDA  GR7,=1
14         [d]
15 SETTIME OR    GR7,=#0030
16         ST    GR7,0,GR3
17         ADDA  GR4,=1
18         ADDA  GR3,=1
19         SUBA  GR5,=1
20         [e]
21         OR    GR2,=#0030
22         ST    GR2,0,GR3
23         OUT   TEAM,LEN
24         RPOP
25         RET
26 TEAM    DS    1
27         DC    ' '
28 TIME    DS    4
29 LEN     DC    6
30 DIVISOR DC    600,60,10
31         END`;

function subtractions(time: string) {
  // The units-of-seconds digit is the remaining value; there is no divisor 1.
  return Number(time[0]) + Number(time[1]) + Number(time[2]);
}
function countOptions(index: number) {
  if (index === 0) return ['9', '17', '20', '270', '299'];
  const time = displayTimes[index], minutes = Number(time.slice(0, 2)), seconds = Number(time.slice(2));
  return [
    Number(time[0]) + Number(time[1]),
    subtractions(time),
    subtractions(time) + Number(time[3]),
    Math.floor((60 * minutes + seconds) / 10),
    60 * minutes + seconds,
  ].map(String);
}
function pages(index: number): SourcePage[] {
  const time = displayTimes[index], team = index === 0 ? '7' : String(index + 1), program = spring2016Pm12Race(index >= 4);
  const [output1, output2] = [
    spring2016Pm12Output.split('\n').slice(0, 23).join('\n'),
    spring2016Pm12Output.split('\n').slice(23).join('\n'),
  ];
  return [
    {page: 57, blocks: [
      p('問12 次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜4に答えよ。'),
      heading('〔プログラムの説明〕'),
      p('10,000 m競走に，1チーム8名で，9チーム72名が参加し，各チームの合計タイムを競う。プログラムRACEは，個人別のタイムを所属するチーム番号とともに入力し，チーム別合計タイムを求め，チーム別合計タイムの昇順に，チーム番号とそのチームの1名当たりの平均タイムを出力する。'),
      p('(1) 個人ごとの入力データ及びチームごとの出力データの形式は図1のとおりとする。ここで，60分以上のデータはないものとする。'),
      table('図1 入出力データの形式', ['n', '△', 'm', 'm', 's', 's'], [
        ['チーム番号', '空白文字', '分の十位', '分の一位', '秒の十位', '秒の一位'],
      ]),
      p('n：チーム番号（“1”〜“9”の数字）。△：空白文字。mm：分（“00”〜“59”の数字列）。ss：秒（“00”〜“59”の数字列）。'),
      p('(2) プログラムRACEの入力データと出力結果の例を図2に示す。'),
      table('図2 入力データと出力結果の例', ['入力データ（72名分）', '出力結果（9チーム分の成績順の平均タイム）'], [
        ['5△2708','1△2835'], ['1△2719','5△2927'], ['9△2805','⋮'], ['⋮','8△3029'], ['4△3118',''], ['5△3256',''],
      ]),
      p('(3) データの入力処理と出力処理は，それぞれ副プログラムINPUTとOUTPUTを呼び出して行う。'),
      p('(4) 副プログラムINPUTは，呼ばれるごとに図1に示す形式の個人のデータを1件読み込む。読み込んだデータのチーム番号及び秒数に変換したタイムを2進数で，それぞれGR1とGR2に設定し，GR0には正の値を設定して，呼出し元に返す。'),
    ]},
    {page: 58, blocks: [
      p('全員のデータを読み終わっている場合は，GR0に−1を設定して呼出し元に返す。'),
      p('(5) 副プログラムOUTPUTは，GR1とGR2のそれぞれに2進数で設定されたチーム番号と平均タイム（1秒未満を切り捨てた秒数）を，図1に示す形式に変換して書き出す。'),
      heading('〔プログラム1〕'),
      code(program, 'casl2'),
      p('設問1 プログラム1中の［a］、［b］に入れる正しい答えを，解答群の中から選べ。'),
    ], banks: [choiceBankText('設問1', jumpAnswers)]},
    {page: 59, blocks: [
      p('設問2 次の記述中の［c］に入れる正しい答えを，解答群の中から選べ。'),
      p('同じ合計タイムのチームが複数ある場合，［c］。'),
      p('設問3 副プログラムOUTPUTを次に示す。プログラム2中の［d］、［e］に入れる正しい答えを，解答群の中から選べ。'),
      heading('〔プログラム2〕'),
      code(output1, 'casl2'),
    ], banks: [choiceBankText('設問2', tieAnswers)]},
    {page: 60, blocks: [
      code(output2, 'casl2'),
      p('設問4 次の記述中の［f］に入れる正しい答えを，解答群の中から選べ。'),
      p('出力されたデータが次のとき，プログラム2の行番号12のSUBA命令は［f］回実行された。'),
      table('出力されたデータ', ['チーム', '空白', '分の十位', '分の一位', '秒の十位', '秒の一位'], [
        [team, '△', ...time],
      ]),
    ], banks: [choiceBankText('d', dAnswers), choiceBankText('e', eAnswers), choiceBankText('設問4', countOptions(index))]},
  ];
}
export function spring2016Pm12OriginalPageAlt() {
  const original = pages(0), alt = pageAlt(original);
  const section2 = original[2].blocks.map(blockText), section3 = original[3].blocks.map(blockText);
  alt[59] = [...section2.slice(0, 2), ...original[2].banks!, ...section2.slice(2)].join('\n\n');
  alt[60] = [section3[0], ...original[3].banks!.slice(0, 2), ...section3.slice(1), original[3].banks![2]].join('\n\n');
  return alt;
}
function build(values: number[]): GeneratedBody {
  const index = selectCase(values, displayTimes.length), time = displayTimes[index], ascending = index >= 4;
  return answerBody(pages(index).flatMap(page => page.blocks), [
    {names: ['a', 'b'], labels: ['設問1 a', '設問1 b'], options: jumpAnswers, keys: [ascending ? 1 : 3, 2], language: 'casl2'},
    {names: ['c'], labels: ['設問2 c'], options: tieAnswers, keys: [ascending ? 0 : 1]},
    {names: ['d'], labels: ['設問3 d'], options: dAnswers, keys: [4], language: 'casl2'},
    {names: ['e'], labels: ['設問3 e'], options: eAnswers, keys: [1], language: 'casl2'},
    {names: ['f'], labels: ['設問4 f'], options: countOptions(index), keys: [index === 0 ? 0 : 1]},
  ], `a：${ascending ? 'GR4を1から増やし，10と比較した結果が負（チーム9まで）の間' : 'GR4を9から減らし，次のチーム番号が正の間'}，LOOP13で最小値を探し続ける。b：出力のたびにGR3を減らし，未出力のチームが残る間はLOOP12に戻る。c：CPAで現在の最小値より小さいときだけ更新するため，同タイムでは${ascending ? '小さい' : '大きい'}チーム番号を先に採用する。\nd：減算と商の加算の後はLOOP22に無条件で戻り，残りが除数未満か比較する。e：GR5を減らして残りの桁がある間はLOOP21で次の除数を読む。f：${time.slice(0, 2)}分${time.slice(2)}秒では600秒を${time[0]}回，60秒を${time[1]}回，10秒を${time[2]}回引く。秒の一位${time[3]}は残りをそのまま出力するので，行12は${subtractions(time)}回。`, reference.contexts);
}
export const legacy2016SpringPm12Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-12', title: '旧制度・午後：CASL IIによる競走のチーム別順位',
  fields: [field('走査と出力例の条件番号', 0, 7)], reference: [0], version: '3.6.0',
  sourceAnswer: '設問1 a=エ，b=ウ／設問2 c=イ／設問3 d=オ，e=イ／設問4 f=ア',
  notes: 'PDF p57–60の6欄。8名×9チーム、60分未満、合計昇順、平均は秒未満切捨て。最大合計28792秒で符号付き16bitの上限および#7FFFの番兵未満。走査を2方向、出力例8通りで検査。命令・マクロのp71–76を参照し、p73の1.3文字コード表は除く。文字値の読取りは設問に不要。CASL IIの命令追跡を独立した合計・ソート・整数除算と照合する。',
  publicNotes: '原プログラムのチーム集計・順位・出力形式を保ち，最小値の走査方向と平均タイムの例を変更します。付属資料は必要な命令とマクロです。',
  fixedReferenceAssetIds: reference.assets, build,
};
