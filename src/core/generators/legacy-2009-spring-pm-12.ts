import { code, p } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2009-spring-pm-09-13-support';
import { spring2009PmPageAssetId, spring2009PmReference } from './legacy-2009-spring-pm-materials';

const layouts = [
  { operandHigh: 0, resultHigh: 0 },
  { operandHigh: 1, resultHigh: 0 },
  { operandHigh: 0, resultHigh: 1 },
  { operandHigh: 1, resultHigh: 1 },
];
export const caslPages = [59, 60, 61, 62, 63, 64];
const casl = (program: string) => code(program, 'casl2');
const branchOnBit = ['JMI   ADD32', 'JMI   LP', 'JOV   ADD32', 'JOV   LP', 'JPL   ADD32', 'JPL   LP'];
const branchOnCarry = ['JMI   ADJ1', 'JMI   ADJ2', 'JOV   ADJ1', 'JOV   ADJ2', 'JPL   ADJ1', 'JPL   ADJ2'];
const shiftLow = ['JNZ   LP', 'JPL   LP', 'JZE   LP', 'SLL   GR5,1', 'SRA   GR5,1', 'SRL   GR5,1'];
const highMultiplier = ['LD    GR1,0,GR1', 'LD    GR1,0,GR2', 'LD    GR1,1,GR1', 'LD    GR2,0,GR1', 'LD    GR2,0,GR2', 'LD    GR2,1,GR1'];
const lowWork = ['LD    GR6,0,GR1', 'LD    GR6,0,GR2', 'LD    GR6,0,GR3', 'LD    GR6,1,GR1', 'LD    GR6,1,GR2', 'LD    GR6,1,GR3'];
const order = (highOffset: number) => highOffset === 0 ? '上位16ビット，下位16ビット' : '下位16ビット，上位16ビット';

export function productPrograms(index: number) {
  const { operandHigh, resultHigh } = layouts[index];
  const operandLow = 1 - operandHigh, resultLow = 1 - resultHigh;
  const muls = `MULS    START                 ; 32ビット×16ビット → 32ビット
        RPUSH
        LAD   GR6,0           ; 積 上位語の初期化
        LAD   GR7,0           ; 積 下位語の初期化
        LD    GR4,${operandHigh},GR1       ; 被乗数 上位語の取出し
        LD    GR5,${operandLow},GR1       ; 被乗数 下位語の取出し
LP      SRL   GR2,1           ; 乗数を1ビット右にシフト
        ［a］
        JZE   FIN
        JUMP  NEXT            ; 加算処理をスキップ
ADD32   ADDL  GR6,GR4         ; 32ビット＋32ビット → 32ビット
        ADDL  GR7,GR5
        ［b］
        JUMP  NEXT
ADJ1    ADDL  GR6,=1          ; けた上げ処理
NEXT    SLL   GR4,1           ; 被乗数（32ビット）を1ビット左にシフト
        ［c］
        JOV   ADJ2
        JUMP  LP
ADJ2    OR    GR4,=1
        JUMP  LP
FIN     ST    GR6,${resultHigh},GR3       ; 乗算結果の格納
        ST    GR7,${resultLow},GR3
        RPOP
        RET
        END`;
  const mul = `MUL     START                 ; 32ビット×32ビット → 32ビット
        RPUSH
        PUSH  0,GR3
        PUSH  0,GR2
        LD    GR2,${operandLow},GR2       ; 乗数下位語を取り出してGR2に設定
        CALL  MULS            ; 被乗数×乗数下位語 → 積（A）
        POP   GR2
        ［d］
        LAD   GR3,SV          ; 結果の格納先として作業領域を設定
        CALL  MULS            ; 被乗数×乗数上位語 → 積（B）
        ［e］
        POP   GR3
        ADDL  GR6,${resultHigh},GR3       ; 積（A）の上位語と積（B）の下位語を加算
        ST    GR6,${resultHigh},GR3
        RPOP
        RET
SV      DS    2
        END`;
  return { muls, mul, operandHigh, resultHigh, resultLow };
}

export const q12 = createLanguageDefinition(12, 'CASL II：32ビットの符号なし整数の乗算', '被乗数・乗数と積の上位語・下位語の格納順序', 'abcde',
  '設問1 aウ bウ cエ／設問2 dオ eカ',
  '二つの副プログラム、16ビット語、コメントと欄配置を維持。入力と出力の上位語・下位語の配置を組み合わせ、取得先と書込先を同時に更新する。a〜cのビット判定・繰上がり・下位語シフトは配置によらず共通。積は32ビット以内とし、桁あふれは出題の範囲外。生成版では積の先行書込みに必要な非重複の条件を本文に示す。CASL II p.61のJIS文字表部分は含めない。',
  (index, originalPaper) => {
    const { muls, mul, operandHigh, resultHigh, resultLow } = productPrograms(index);
    const original = index === 0;
    const operands = order(operandHigh), result = order(resultHigh);
    const d = operandHigh === 0 ? highMultiplier : [...highMultiplier.slice(0, 5), 'LD    GR2,1,GR2'];
    const inputWords = original
      ? '被乗数と積は，それぞれ連続する2語に上位16ビット，下位16ビットの順に格納される。それぞれの上位語のアドレスは，GR1とGR3に設定して渡される。'
      : '被乗数は連続する2語に' + operands + 'の順，積は連続する2語に' + result
        + 'の順に格納される。それぞれの先頭語のアドレスは，GR1とGR3に設定して渡される。';
    const wrapperWords = original
      ? '被乗数，乗数，積は，それぞれ連続する2語に上位16ビット，下位16ビットの順に格納される。それぞれの上位語のアドレスは，GR1，GR2，GR3に設定して渡される。'
      : '被乗数と乗数はそれぞれ連続する2語に' + operands + 'の順，積は連続する2語に' + result
        + 'の順に格納される。それぞれの先頭語のアドレスは，GR1，GR2，GR3に設定して渡される。';
    return {
      contexts: [spring2009PmReference('アセンブラ言語の仕様（COMET II・CASL II）', caslPages)],
      pages: [
        page(50, [
          p('問12 次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'), p('32ビットの乗算を行う副プログラムMULSである。'),
          p('（1）MULSは，32ビットの被乗数と16ビットの乗数を受け取り，32ビットの積を返す。数値はすべて符号なし整数とし，積のオーバフローは考慮しない。'),
          p(inputWords), p('乗数はGR2に直接設定して渡される。'),
          p('（2）副プログラムMULSから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          p('〔プログラム1〕'), casl(muls),
        ]),
        page(51, [p('設問1 プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', branchOnBit, 'ウ', 'casl2'), bank(1, 'b', branchOnCarry, 'ウ', 'casl2'), bank(1, 'c', shiftLow, 'エ', 'casl2'),
        ]),
        page(52, [
          p('設問2 MULSを利用して，32ビット同士の乗算を行う副プログラムMULを作成した。プログラム2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('（1）MULは，被乗数と乗数を受け取り，積を返す。数値はすべて32ビットの符号なし整数とし，積のオーバフローは考慮しない。'),
          p(wrapperWords + (originalPaper ? '' : ' 被乗数，乗数及び積の格納領域は互いに重ならないものとする。')), p('（2）副プログラムMULから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          p('〔プログラム2〕'), casl(mul),
        ], [bank(2, 'd', d, operandHigh === 0 ? 'オ' : 'カ', 'casl2')]),
        page(53, [], [bank(2, 'e', lowWork, resultLow === 0 ? 'ウ' : 'カ', 'casl2')]),
      ],
      explanation: 'a：SRLが乗数から押し出した最下位ビットをOFに置く。1ならJOVでADD32へ進み，該当する被乗数を加算する。'
        + 'b：積の下位語のADDLが桁上がりを起こすとOFが1になり，ADJ1で積の上位語へ1を足す。'
        + 'c：下位語も論理左シフトし，押し出した最上位ビットが1なら，ADJ2で上位語の下端を1にする。'
        + 'd：スタックから復元したGR2が乗数の先頭を指す。先頭から' + operandHigh + '語目の上位語をGR2に読み込んでMULSに渡す。'
        + 'e：積（B）の先頭を指すGR3から' + resultLow + '語目の下位語をGR6へ読み込む。積（B）を16ビット左へずらしたとき，上位語は32ビットの範囲外となる。下位語を積（A）の上位語へ加える。積の格納先が入力と重なると，最初のMULSで後続処理の入力が上書きされるため，動作を検算した条件では領域を分ける。',
    };
  }, { fixedReferenceAssetIds: caslPages.map(spring2009PmPageAssetId) });
