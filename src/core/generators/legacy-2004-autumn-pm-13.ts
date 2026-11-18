import { code, list, p } from './definition';
import { autumnLanguageFigure, autumnLanguageQuestion, bank, numbered, page } from './legacy-2004-autumn-pm-10-13-support';
import { autumn2004PmPageAssetId, autumn2004PmReference } from './legacy-2004-autumn-pm-materials';

const originalCase = { first: '143726', last: '170125', graduations: 100, teams: 9 };
const conditions = [
  { first: '101515', last: '111622', graduations: 60, teams: 4 },
  { first: '131045', last: '142101', graduations: 70, teams: 6 },
  { first: '055025', last: '061018', graduations: 80, teams: 7 },
  { first: '154937', last: '240000', graduations: 100, teams: 9 },
];
const digitLayouts = ['hhmmss', 'hhmmssdd'];
function layout(extended: boolean) {
  const digits = [...digitLayouts[Number(extended)]];
  return { digits, alt: digits.length + '文字。左から時の十位・一位、分の十位・一位、秒の十位・一位' +
    (extended ? '、1秒未満の目盛の十位・一位。' : '。') };
}
export const clockFormatFigure = autumnLanguageFigure(13, 'clock-format', '図1　時刻の形式', () => layout(false));
export const extendedClockFormatFigure = autumnLanguageFigure(13, 'extended-clock-format', '1秒未満の目盛を含む時刻の形式', () => layout(true));
function teamMemory(teams: number) {
  return { teams, offsets: [0, 12, 12 * (teams - 1)], alt:
    'GR1のアドレスからチーム番号順に' + teams + '組を並べる。各組の前半0〜5番がスタート、後半6〜11番がゴールの時刻。' +
    '第1組はGR1＋0、第2組はGR1＋12、最終組はGR1＋' + (12 * (teams - 1)) + 'から始まる。' };
}
export const relayArgumentsFigure = autumnLanguageFigure(13, 'relay-arguments', '図2　副プログラム EKIDEN の引数',
  index => teamMemory(conditions[index].teams));

const pagesOfCasl = [58, 59, 60, 61, 62, 63];
export const digitCharacterNotesTitle = 'この設問で使う数字文字の符号';
const charContext = {
  title: digitCharacterNotesTitle,
  presentation: 'text' as const,
  blocks: [p('数字文字は1文字を1語に格納する。文字「0」の符号は16進数0030であり、「1」から「9」は、これに各数字の値を足した符号で表す。')],
};
const answer1 = bank(1, 'ab', [
  'ADDA GR7,=1', 'JMI ADJUST', 'JNZ ADJUST', 'JPL ADJUST', 'JZE ADJUST', 'LD GR7,=-1', 'LD GR7,=1', 'SUBA GR7,=1',
], 'イキ', 'casl2');
const answer4 = bank(4, 'cd', [
  'JMI LOOP1', 'JMI REP', 'JPL LOOP1', 'JPL REP', 'JZE LOOP1', 'JZE REP',
], 'イエ', 'casl2');

function borrowTrail(first: string, last: string) {
  let borrow = 0;
  const trace: string[] = [];
  const borrowed: string[] = [];
  const columnNames = ['時の十位', '時の一位', '分の十位', '分の一位', '秒の十位', '秒の一位'];
  for (let i = 5; i >= 0; i--) {
    const result = Number(last[i]) - Number(first[i]) - borrow;
    trace.push(String(result));
    borrow = Number(result < 0);
    if (borrow) borrowed.push(columnNames[i]);
  }
  return { trace, borrowed };
}

export const q13 = autumnLanguageQuestion(13, '時刻差を求める副プログラムと駅伝の最短タイム', '時刻・秒未満の目盛数・参加チーム数の組',
  'abxycd', 'イキエエイエ',
  '時刻の組とけた下がり数、秒未満の目盛数、参加チーム数を連動して変更し、6桁の時刻差、8桁への拡張、チームごとの比較の各問いを維持する。',
  (index, original) => {
    const { first, last, graduations, teams } = original ? originalCase : conditions[index];
    const { trace, borrowed } = borrowTrail(first, last);
    const upper = graduations / 10;
    const other = upper === 10 ? 6 : upper;
    const extension = [other + ',' + other, other + ',10', '10,' + other, '10,10', '10,100', '100,10', '100,100'];
    const child2 = { ...bank(2, 'x', ['1', '2', '3', '4', '5', '6'], 'アイウエオカ'[borrowed.length - 1]), ownLabel: '設問2の解答群' };
    const child3 = { ...bank(3, 'y', extension, upper === 10 ? 'エ' : 'イ', 'casl2'), ownLabel: '設問3の解答群' };
    const text1 = '「hh」は時（00〜24）、「mm」は分（00〜59）、「ss」は秒（00〜59）を表す。';
    const text3 = original ? 'ddは百分の一秒を表し、00〜99とする。1日の終わりは24000000である。' :
      'ddは1秒を' + graduations + '等分した目盛で、00〜' + (graduations - 1) + 'をとる。1日の終わりは24000000である。';
    return {
      pages: [
        page(53, [
          p('次のアセンブラプログラムの説明及びプログラムを読んで、設問1〜4に答えよ。'),
          p('〔プログラムの説明〕副プログラム TIME は、図1の形式で与えられた時刻1と時刻2について、時刻2−時刻1を求める。'),
          original ? p('図1　時刻の形式。' + layout(false).alt) : clockFormatFigure.block(index), p(text1),
          list([
            '主プログラムから呼び出すとき、GR1に時刻1、GR2に時刻2、GR3に結果の格納領域の先頭アドレスを設定する。',
            '両時刻は同じ日とし、000000≦時刻1＜時刻2≦240000である。',
            'TIMEからの復帰時には呼出し時の汎用レジスタの内容に戻す。',
          ], true),
          p('〔プログラム〕（行番号）'), numbered('casl2', 1, `TIME    START
        RPUSH
        LD      GR4,=5      ; ループカウンタ
        LD      GR7,=0      ; 下位けたへのけた下がりの調整値
        ADDL    GR1,GR4     ; GR1 ← 時刻1の最終けたのアドレス
        ADDL    GR2,GR4     ; GR2 ← 時刻2の最終けたのアドレス
        ADDL    GR3,GR4
LOOP    LD      GR5,0,GR1   ; GR5 ← 時刻1の1けた
        LD      GR6,0,GR2   ; GR6 ← 時刻2の対応けた
        SUBA    GR6,GR7     ; 下位けたへのけた下がりの調整
        CPA     GR6,GR5
        [a]
        LD      GR7,=0
        JUMP    CALC
ADJUST  ADDA    GR6,ADD,GR4 ; 上位けたの1に相当する値を加算`),
        ]),
        page(54, [
          numbered('casl2', 16, `        [b]
CALC    SUBA    GR6,GR5
        OR      GR6,='0'    ; 文字コードに変換
        ST      GR6,0,GR3
        SUBA    GR4,=1
        JMI     FINISH
        LAD     GR1,-1,GR1
        LAD     GR2,-1,GR2
        LAD     GR3,-1,GR3
        JUMP    LOOP
FINISH  RPOP
        RET
ADD     DC      0,10,6,10,6,10
        END`),
          p('設問1　プログラム中の各空欄に入れる正しい答えを、解答群の中から選べ。'),
        ], [answer1]),
        page(54, [
          p('設問2　時刻1と時刻2が次のとおりであるとき、行番号15のADDA命令は何回実行されるか。正しい答えを解答群から選べ。'),
          code('時刻1　' + first + '\n時刻2　' + last, 'text'),
        ], [child2]),
        page(55, [
          p('設問3　図の8文字の時刻を処理するため、TIMEの行番号3と行番号28を次のように変更した。空欄に入れる値の組を解答群から選べ。'),
          original ? p('時刻の形式。' + layout(true).alt) : extendedClockFormatFigure.block(index),
          p(text3), p('〔プログラムの変更〕（行番号）'),
          code('  3          LD      GR4,=7       ; ループカウンタ\n               ⋮\n 28  ADD     DC      0,10,6,10,6,10,[y]', 'casl2'),
        ], [child3]),
        page(56, [
          p('設問4　変更前のTIMEを用いて駅伝のある区間の最高タイム（最小の所要時間）とそのチーム番号を出力する副プログラム EKIDEN を作成した。空欄に入れる正しい答えを選べ。'),
          p('チーム数は' + teams + '、チーム番号は1〜' + teams + 'である。GR1に図2の領域の先頭アドレスを設定して呼び出す。スタート・ゴールとも図1の時刻形式を用いる。'),
          original ? p('図2　副プログラム EKIDEN の引数。' + teamMemory(teams).alt) : relayArgumentsFigure.block(index),
          list([
            '出力はn△hhmmssの8文字とする。nはチーム番号の文字、△は間隔文字を表す。',
            '同タイムであれば、最小のチーム番号を出力する。',
            '全チームがスタートした日のうちにゴールする。',
            'EKIDENからの復帰時はGR1〜GR7を元に戻す。',
          ], true),
          code(`EKIDEN  START
        RPUSH
        LD      GR7,=5      ; 最高タイムの初期値を設定
INIT    LD      GR0,MAX,GR7
        ST      GR0,BEST,GR7
        SUBA    GR7,=1
        JMI     BEGIN
        JUMP    INIT
BEGIN   LD      GR7,='1'    ; チーム番号`, 'casl2'),
        ]),
        page(57, [code(`LOOP1   LAD     GR4,BEST    ; 最高タイム
        LAD     GR3,CTIME   ; 処理中のチームのタイムを設定する領域
        LAD     GR2,6,GR1   ; 処理中のチームのゴール時刻
        CALL    TIME        ; 処理中のチームのタイムを計算
        LD      GR5,=6      ; ループカウンタ
LOOP2   LD      GR0,0,GR3
        CPL     GR0,0,GR4   ; 処理中のチームのタイムと最高タイムの比較
        [c]
        JPL     NEXT        ; 処理中のチームのタイム ＞ 最高タイム
        LAD     GR3,1,GR3   ; 処理中のチームの次のけた
        LAD     GR4,1,GR4   ; 最高タイムの次のけた
        SUBA    GR5,=1
        JNZ     LOOP2
        JUMP    NEXT        ; 処理中のチームのタイム ＝ 最高タイム
REP     ST      GR0,0,GR4   ; 残りのけたを最高タイムへ記録
        LAD     GR3,1,GR3
        LAD     GR4,1,GR4
        LD      GR0,0,GR3
        SUBA    GR5,=1
        [d]
        ST      GR7,TEAM    ; 処理中のチームの番号を出力領域に設定
NEXT    CPA     GR7,='${teams}'    ; 全チームの処理終了？
        JZE     FIN
        LAD     GR1,12,GR1  ; ポインタを次のチームへ進める
        ADDA    GR7,=1      ; チーム番号を表す文字コードに1を加算
        JUMP    LOOP1
FIN     OUT     TEAM,LENG
        RPOP
        RET
LENG    DC      8
TEAM    DS      1
        DC      ' '
BEST    DS      6
MAX     DC      '999999'
CTIME   DS      6
        END`, 'casl2')], [answer4]),
      ],
      contexts: [autumn2004PmReference('CASL IIの仕様', pagesOfCasl), charContext],
      explanation:
        'TIMEは右端から1けたずつ比較する。aは直前のCPAで時刻2の値からけた下がりを引いた値が時刻1の値より小さいとき、ADJUSTへ分岐するJMI。' +
        'bは次のけたで引く1をGR7に設定するLDである。前のけたのGR7が0でも1でも、ここで1を上書きする。' +
        '行番号15で補正する前の差は' + last + '−' + first + 'の最下位から ' + trace.join('、') +
        '。負になったけた（' + borrowed.join('、') + '）でだけ行番号15を実行し、計' + borrowed.length + '回である。' +
        '拡張後は1秒が' + graduations + '目盛。ddの十位には' + upper + 'を足すと1秒分になり、一位には10を足すと十位1になるので、表の右端に' + upper + ',10を追加する。' +
        'EKIDENは' + teams + '組を番号順に処理する。cで初めて小さいけたに出会った場合にREPへ移り、dはGR5が正の間だけ残りのけたをコピーする。' +
        '同じけたはそのまま使い、全て等しい場合は記録済みの小さいチーム番号を維持する。',
    };
  }, { fixedReferenceAssetIds: pagesOfCasl.map(autumn2004PmPageAssetId) });
