import { code, p, table, type GeneratedBody } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';

type SourcePart = GeneratedBody['prompt'][number] | { type: 'panel'; profile: string; caption: string };
type Page = { page: number; parts: SourcePart[] };
const page = (physical: number, ...parts: SourcePart[]): Page => ({ page: physical, parts });
const panel = (profile: string, caption: string): SourcePart => ({ type: 'panel', profile, caption });
const intro = (n: number, language: string, range: string) => heading('問' + n + '　次の' + language + 'を読んで，設問' + range + 'に答えよ。');
const bankInstruction = '［　］に入れる正しい答えを，解答群の中から選べ。';

const cipherC = String.raw`#define RSIZ 5  /* 換字表の行数 */
#define CSIZ 13 /* 換字表の列数 */

void enc_str(char[], char[RSIZ][CSIZ]);

void enc_str(char str[], char xchg_t[RSIZ][CSIZ]) {
    int cp[2], /* 置換対象文字の換字表中の列位置 */
        rp[2], /* 置換対象文字の換字表中の行位置 */
        pos[2], /* 置換対象文字の文字列中の位置 */
        flg, i = 0, col, row, p = 0;

    while (str[p] != '\0') {
        flg = 0;
        for (row = 0; row < RSIZ; row++) {
            for (col = 0; col < CSIZ; col++) {
                if (str[p] == xchg_t[row][col]) {
                    flg = 1;
                    break;
                }
            }
            if (flg != 0) break;
        }
        if (flg != 0) { /* α */
            cp[i]    = col;
            rp[i]    = row;
            pos[i++] = p;
            if (i == 2) {
                if (str[pos[0]] == str[pos[1]]) {
                    str[pos[0]] = str[pos[1]] =
                        xchg_t[(rp[0] + 1) % RSIZ][(cp[0] + 1) % CSIZ];
                } else {
                    if (rp[0] == rp[1]) {
                        str[pos[0]] = xchg_t[rp[1]][cp[1]];
                        str[pos[1]] = xchg_t[rp[0]][cp[0]];
                    } else if (cp[0] == cp[1]) {
                        str[pos[0]] = xchg_t[rp[0]][(cp[0] + 1) % CSIZ];
                        str[pos[1]] = xchg_t[rp[1]][(cp[1] + 1) % CSIZ];
                    } else {
                        str[pos[0]] = xchg_t[rp[1]][cp[0]];
                        str[pos[1]] = xchg_t[rp[0]][cp[1]];
                    }
                }
                i = 0; /* β */
            }
        }
        p++;
    }
    if (i != 0) {
        str[pos[0]] = xchg_t[RSIZ - 1 - rp[0]][CSIZ - 1 - cp[0]];
    }
}`;
const timeCobol = [
`1  DATA DIVISION.
2  FILE SECTION.
3  FD LOG-FILE.
4  01 LOG-REC.
5      02 LOG-DATE    PIC 9(8).
6      02 LOG-TIME    PIC 9(4).
7      02 LOG-FLAG    PIC 9(1).
8          88 LOG-IN  VALUE 0.
9          88 LOG-OUT VALUE 1.
10     02 LOG-ENUM    PIC X(6).
11 FD ATD-FILE.
12 01 ATD-REC.
13     02 ATD-ENUM    PIC X(6).
14     02 ATD-HST.
15         03 ATD-ELM   OCCURS 31.
16             04 ATD-IN  PIC 9(4).
17             04 ATD-OUT PIC 9(4).
18     02 ATD-SUM     PIC 9(5).`,
`19 WORKING-STORAGE SECTION.
20 77 KEY-FLAG       PIC 9(1).
21     88 ATD-VALID  VALUE 0.
22     88 ATD-INVALID VALUE 1.
23 77 EOF-FLAG PIC 9(1) VALUE 0.
24     88 LOG-EOF  VALUE 1.
25 01 W-DATE.
26     02 FILLER [a].
27     02 IDX    PIC 9(2).
28 01 W-TIME-FROM.
29     02 HF     PIC 9(2).
30     02 MF     PIC 9(2).
31 01 W-TIME-TO.
32     02 HT     PIC 9(2).
33     02 MT     PIC 9(2).
34 01 W-TIME-ACCUM.
35     02 HA     [b].
36     02 MA     PIC 9(2).
37 77 W-MINUTE  PIC 9(5).
38 PROCEDURE DIVISION.
39 MAIN-PROC.
40     OPEN INPUT LOG-FILE
41          I-O   ATD-FILE.
42     PERFORM READ-PROC.
43     CLOSE ATD-FILE LOG-FILE.
44     STOP RUN.
45 READ-PROC.
46     PERFORM UNTIL LOG-EOF
47         READ LOG-FILE
48             AT END
49                 SET LOG-EOF TO TRUE
50             NOT AT END
51                 PERFORM UPDATE-PROC
52         END-READ
53     END-PERFORM.
54 UPDATE-PROC.
55     MOVE LOG-ENUM TO ATD-ENUM.
56     SET ATD-VALID TO TRUE.
57     READ ATD-FILE
58         INVALID KEY
59             SET ATD-INVALID TO TRUE
60             MOVE LOG-ENUM TO ATD-ENUM
61             [c]
62             MOVE ZERO TO ATD-SUM
63     END-READ.`,
`64     MOVE LOG-DATE TO W-DATE.
65     EVALUATE TRUE
66       WHEN LOG-IN
67         MOVE LOG-TIME TO ATD-IN(IDX)
68       WHEN LOG-OUT
69         MOVE LOG-TIME TO ATD-OUT(IDX) W-TIME-TO
70         MOVE ATD-IN(IDX) TO W-TIME-FROM
71         MOVE ATD-SUM TO W-TIME-ACCUM
72         PERFORM CALC-PROC
73         MOVE [d] TO ATD-SUM
74     END-EVALUATE.
75     IF ATD-VALID THEN
76         REWRITE ATD-REC
77     ELSE
78         WRITE ATD-REC
79     END-IF.
80 CALC-PROC.
81     COMPUTE W-MINUTE = (HT - HF + HA) * 60 + MT - MF + MA.
82     DIVIDE W-MINUTE BY 60 GIVING HA REMAINDER MA.`,
];

export const spring2015PmHtmlPunctuation = '!#$%()*+,-.:;=?@[\\]^_`{|}~';
export const spring2015PmHtmlEntities = [['<','&lt;'],['>','&gt;'],['&','&amp;'],['"','&quot;']];
const encoderFirst = `import java.util.HashMap;
import java.util.Map;

abstract public class Encoder {
    private Map<Character, String> conversionTable =
        new HashMap<Character, String>();

    protected void addConversion(char c, String s) {
        conversionTable.put(c, s);
    }

    protected void addNoConversion(char c) {
        conversionTable.[a];
    }

    protected void addNoConversion(char[] collection) {
        for (char c : collection) {
            addNoConversion(c);
        }
    }

    abstract protected String encode(char c);

    public String encode(String s) {
        if (s == null) {
            return null;`;
const encoderLast = `        }
        String result = "";
        for (char c [b]) {
            String t = [c];
            if (t == null) {
                t = encode(c);
            }
            result += t;
        }
        return result;
    }
}`;
const htmlEncoder = `public class HtmlEncoder extends Encoder {
    private static String ALPHAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static String NUMERICS = "0123456789";
    private static String PUNCTUATIONS =
        ${JSON.stringify(spring2015PmHtmlPunctuation)};

    public HtmlEncoder() {
        addNoConversion(ALPHAS.toCharArray());
        addNoConversion(ALPHAS.toLowerCase().toCharArray());
        addNoConversion(NUMERICS.toCharArray());
        addNoConversion(PUNCTUATIONS.toCharArray());
        addConversion('<', "&lt;");
        addConversion('>', "&gt;");
        addConversion('&', "&amp;");
        addConversion('"', "&quot;");
    }

    protected String encode(char c) {
        return [d];
    }
}`;
const jsEncoderFirst = `public class JavaScriptEncoder extends Encoder {
    private static String ALPHAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static String NUMERICS = "0123456789";

    public JavaScriptEncoder() {
        addNoConversion(ALPHAS.toCharArray());
        addNoConversion(ALPHAS.toLowerCase().toCharArray());
        addNoConversion(NUMERICS.toCharArray());
    }

    protected String encode(char c) {`;
const jsEncoderLast = String.raw`        if (c [e] 256) {
            return String.format("\\x%02X", (int) c);
        }
        return String.format("\\u%04X", (int) c);
    }
}`;
const htmlEncoderTest = `public class HtmlEncoderTest {
    static public void main(String[] args) {
        new HtmlEncoder().encode("<script>alert('注意!');</script>");
    }
}`;

const fact = ` 1 FACT   START
 2        RPUSH
 3        LD    GR0,=1
 4        SUBL  GR1,=1
 5        [a]
 6        JUMP  FIN
 7 NEXT   LD    GR2,=1
 8 LP     LAD   GR2,1,GR2
 9        CALL  MULT
10        [b]
11        JNZ   LP
12 FIN    RPOP
13        RET
14        END`;
const multiply = `MULT    START              ; シフトによる乗算
        RPUSH
        LD    GR1,GR0      ; 被乗数をGR1に保持
        LD    GR0,=0       ; 乗算結果の初期化
        LD    GR3,=15
        LD    GR2,GR2
LP      JZE   FIN
        JPL   CONT
        LD    GR4,GR1
        [c]
        ADDL  GR0,GR4
CONT    LAD   GR3,-1,GR3
        SLL   GR2,1
        JUMP  LP
FIN     RPOP
        RET
        END`;
const recursionFirst = ` 1 FACT2  START
 2        RPUSH
 3        CALL  RSUB       ; 再帰処理の本体を呼ぶ
 4        RPOP
 5        RET              ; 主プログラムへ戻る
 6 RSUB   LD    GR4,GR1
 7        SUBL  GR4,=1
 8        JPL   NEXT       ; n≥2の場合NEXTへ
 9        LD    GR0,=1     ; GR0 ← F(0), F(1)の値
10        RET
11 NEXT   PUSH  0,GR1
12        LAD   GR1,-1,GR1
13        CALL  RSUB       ; F(n−1)を計算`;
const recursionLast = `14        POP   GR2
15        CALL  MULT
16        RET
17        END`;

export const spring2015PmErratum = 'ここで，関数“表引き”は，行の位置として0が指定された場合には，nullを返すものとする。';
const startLearning = `○マクロ: StartLearning
○数値型: ItemRow, UnitRow
・ItemRow ← 照合一致(O2, I2～I53, 0)
・UnitRow ← 照合一致(切捨て(O2, -2), A2～A13, 0)
▲ 論理積([e])
│ ・相対(L1, ItemRow, 0) ← 本日()
│ ▲ 相対(E1, UnitRow, 0) = null
│ │ ・相対(E1, UnitRow, 0) ← [f]
│ ▼
▼`;

export const spring2015Pm0913Pages: Record<number, Page[]> = {
  9: [
    page(42, p('次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の選をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。'),
      intro(9, 'Cプログラムの説明及びプログラム', '1，2'), heading('プログラムの説明'),
      p('平文の文字列を暗号化する手法として，平文の文字を換字表に従って別の文字に置き換える方法がある。関数enc_strは，与えられた平文を，換字表を用いて暗号文に変換するプログラムである。'),
      p('(1) 平文は，JIS X 0201（7ビット及び8ビットの情報交換用符号化文字集合）の文字で構成されている。'),
      p('(2) 置換の対象となる文字（以下，置換対象文字という）は，英字（A～Z，a～z），数字（0～9），空白文字，“.”及び“,”の65種類の文字であり，換字表に格納されている。'),
      p('(3) 換字表は5行13列の2次元文字型配列であり，全ての要素に異なる文字が格納されている。'),
      p('(4) 換字表による置換の方法について，図1に示す平文と暗号文の対応の例を用いて説明する。平文の文字列の先頭から置換対象文字を2文字ずつ選び出して行い，置換されたそれぞれの文字を暗号文の文字として，暗号文中で平文と同じ位置に入れる。ここで，置換対象文字の組合せによって，置換後の文字の組合せが決まる。置換対象文字数が奇数の場合，最後の置換対象文字については1文字で置換を行う。置換対象文字以外の文字については，平文中の文字をそのまま暗号文中で平文と同じ位置に入れる。'),
      panel('pairing','図1　平文と暗号文の対応の例')),
    page(43, p('(5) 関数enc_strの仕様は次のとおりである。ここで，引数の値に誤りはないものとする。'),
      p('機能：文字列strを，換字表xchg_tを用いて平文から暗号文に変換する。\n引数：str　文字列\n　　　xchg_t　換字表')),
    page(44, heading('プログラム'), code(cipherC,'c')),
    page(45, heading('設問1'), p('図2の平文と換字表を引数として関数enc_strを実行したとき，プログラムの動作に関する次の記述中の' + bankInstruction),
      panel('cipher-table','図2　平文と換字表の例'),
      p('(1) プログラムのαの行が最初に実行されるとき，変数flgの値は1，iの値は0，colの値は[a]，rowの値は[b]になっている。'),
      p('(2) プログラムのβの行が最初に実行されるとき，引数str，配列cp，rp，posに格納されている値は，図3に示すとおりである。'),
      panel('cipher-trace','図3　引数str，配列cp，rp，posに格納されている値')),
    page(46, p('(3) プログラムのβの行が5回目に実行されるとき，pos[1]の値は9，引数str[9]の値は[d]になっている。'),
      p('(4) プログラムのβの行が6回目に実行されるとき，pos[1]の値は[e]になっている。'),
      heading('設問2'), p('図2に示す換字表を使って平文“IPA”を暗号文に変換した結果として正しい答えを，解答群の中から選べ。')),
  ],
  10: [
    page(47, intro(10,'COBOLプログラムの説明及びプログラム','1，2'), heading('プログラムの説明'),
      p('C社では，全従業員の出社時刻と退社時刻を入口のゲートで自動的に記録し，出退勤記録ファイルに格納している。このプログラムは，1か月分の出退勤記録ファイルを読み込み，出社した従業員の勤務管理ファイルに書き込むものである。'),
      p('(1) 出退勤記録ファイルは，図1に示すレコード様式の順ファイルで，ある月の1か月分の出退勤記録が格納されている。'),
      panel('attendance-input','図1　出退勤記録ファイルのレコード様式'),
      p('① レコードは日付，時刻，出退勤フラグの昇順に格納されている。\n② 日付には，年，月，日が，それぞれ4桁，2桁，2桁の西暦で格納されている。\n③ 時刻には，出社又は退社の時刻の時，分が，それぞれ2桁の24時間表記で格納されている。\n④ 出退勤フラグには，出社時は0が，退社時は1が格納されている。\n⑤ 従業員番号には，従業員ごとに一意な6桁の番号が格納されている。\n⑥ 同一従業員の出社時の記録と退社時の記録は，必ず対になっている。同じ日付のレコードは1組だけである。\n⑦ 出社時刻は6時から22時までである。退社時刻は同じ日付の24時までである。')),
    page(48, p('(2) 勤務管理ファイルは，図2に示すレコード様式の従業員番号をキーとする索引ファイルである。'),
      panel('attendance-output','図2　勤務管理ファイルのレコード様式'),
      p('① 勤務履歴1～31には，当該月の1～31日の出社時刻及び退社時刻が格納される。出社しなかった日と暦にない日の出社時刻及び退社時刻には，9999が格納される。\n② 出社時刻及び退社時刻には，時，分が，それぞれ2桁の24時間表記で格納される。\n③ 勤務時間には，1か月の勤務時間の合計が，3桁の時間と2桁の分で格納される。毎日の出社時刻から退社時刻までの時間が1日の勤務時間である。途中の休み時間も勤務時間に含める。'),
      heading('プログラム（行番号）'), code(timeCobol[0],'cobol')),
    page(49, code(timeCobol[1],'cobol')),
    page(50, code(timeCobol[2],'cobol'), heading('設問1'), p('プログラム中の' + bankInstruction)),
    page(51, heading('設問2'),
      p('C社では22時以降の勤務を深夜手当の対象としている。勤務管理ファイルのレコードに深夜勤務時間の領域を追加し，1か月の深夜勤務時間の合計も集計するようにプログラムを変更する。表1中の' + bankInstruction + 'ここで，表1中の[d]には設問1の正しい答えが入っているものとする。'),
      panel('attendance-change','表1　プログラムの変更内容')),
  ],
  11: [
    page(52, intro(11,'Javaプログラムの説明及びプログラム','1，2'), p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'), heading('プログラムの説明'),
      p('D社では，利用者が入力した文字列をHTMLに埋め込むことによって，動的にWebページを生成するアプリケーションを開発している。このようなアプリケーションでは，利用者が入力した文字列をHTMLに埋め込む際の処理が不適切な場合，情報漏えいの発生などシステムの安全な運用を脅かすおそれがある。'),
      p('利用者が入力した文字列をHTMLに埋め込む前には，サニタイズすることが必要である。サニタイズとは，システムの安全な運用を脅かす文字列を，無害な文字列に変換することをいう。文字列の変換方法は，文字列を埋め込む場所によって異なる。'),
      p('当該アプリケーションでは，HTMLのタグの間（ただし，“<script>”と“</script>”との間は除く）に文字列を埋め込むケースと，JavaScriptの文字列として埋め込むケースの二つのケースでサニタイズする必要がある。サニタイズは，変換前の文字列中の各文字を，それぞれ次のように変換することによって行うことにした。'),
      p('(1) HTMLのタグの間に文字列を埋め込むケース\n① 英数字と次に示す文字は，そのまま出力する。'), code(spring2015PmHtmlPunctuation,'text'),
      p('② 表1に示す文字は，実体参照に変換する。'), table('表1　文字と実体参照の対応',['文字','実体参照'],spring2015PmHtmlEntities),
      p('③ その他の文字は，“&#ddd;”に変換する。ここで，dddは変換対象文字の文字コードを表す，最大で5桁の10進数である。また，変換前の文字列に含まれる各文字は，2バイトで表すことができるものとする。')),
    page(53, p(String.raw`(2) JavaScriptの文字列として埋め込むケース
① 英数字は，そのまま出力する。
② 文字コードが256未満の英数字以外の文字は，“\xXX”に変換する。ここで，XXは変換対象の文字の文字コードを表す，2桁の16進数である。
③ その他の文字は，“\uXXXX”に変換する。ここで，XXXXは変換対象の文字の文字コードを表す，4桁の16進数である。また，変換前の文字列に含まれる各文字は，2バイトで表すことができるものとする。`),
      p('クラスEncoderは，サニタイズを行うクラスが継承する抽象クラスである。パブリックメソッドencodeは，引数で与えられた文字列をサニタイズし，結果を返す。クラスHtmlEncoderは，HTMLのタグに埋め込む文字列をサニタイズするクラスである。クラスJavaScriptEncoderは，JavaScriptの文字列として埋め込む文字列をサニタイズするクラスである。'),
      heading('プログラム1'), code(encoderFirst,'java')),
    page(54, code(encoderLast,'java'), heading('プログラム2'), code(htmlEncoder,'java'),
      heading('プログラム3'), code(jsEncoderFirst,'java')),
    page(55, code(jsEncoderLast,'java'), heading('設問1'), p('プログラム1～3中の' + bankInstruction)),
    page(56, heading('設問2'), p('プログラム4を実行したときに，プログラム2のメソッドencodeが呼び出される回数として正しい答えを，解答群の中から選べ。ここで，プログラム1～3中の空欄には正しい答えが入っているものとする。'),
      heading('プログラム4'), code(htmlEncoderTest,'java')),
  ],
  12: [
    page(57, intro(12,'アセンブラプログラムの説明及びプログラム','1～3'), heading('プログラム1，2の説明'),
      p('非負整数nについて，階乗の値F(n)を求める副プログラムFACTである。'),
      code('F(n) = 1                  (n = 0, 1)\nF(n) = n × (n−1) × … × 1   (n ≥ 2)','text'),
      p('例えば，F(3) = 3 × 2 × 1 = 6である。'),
      p('(1) FACTは，nがGR1に設定されて呼ばれ，計算結果をGR0に設定して呼出し元に戻る。nは，F(n)の値が16ビット符号なし2進整数の範囲に収まるように与えられる。FACTは副プログラムMULTを利用する。\n(2) MULTは，16ビット符号なし2進数同士の乗算を行う副プログラムであり，被乗数と乗数がそれぞれGR0，GR2に設定されて呼ばれ，乗算結果をGR0に設定して呼出し元に戻る。乗算結果の桁あふれは発生しないものとする。\n(3) 副プログラムから戻るとき，汎用レジスタGR1～GR7の内容は元に戻す。'),
      heading('プログラム1（行番号）'), code(fact,'casl2')),
    page(58, heading('プログラム2'), code(multiply,'casl2'), heading('設問1'), p('プログラム1，2中の' + bankInstruction)),
    page(59, heading('設問2'), p('プログラム1のFACTを使用してF(4)を求めるとき，行番号12のRPOP命令実行直前のGR2に設定されている値として正しい答えを，解答群の中から選べ。'),
      heading('設問3'), p('F(n)は次のように再帰的に表現することができる。'), code('F(n) = 1             (n = 0, 1)\nF(n) = n × F(n−1)    (n ≥ 2)','text'),
      p('上記に基づいて，プログラム3のFACT2を作成した。ここで，FACT2はFACTと同様に呼ばれる。また，FACT2に制御が移り，行番号2のRPUSH命令を実行した直後のSPの値をBとする。次の記述中の' + bankInstruction),
      p('FACT2を使用してF(3)を求めるとき，行番号11の命令を初めて実行した直後のSPの値は[d]である。また，当該SPで示される番地に格納されている値は[e]である。'),
      heading('プログラム3（行番号）'), code(recursionFirst,'casl2')),
    page(60, code(recursionLast,'casl2')),
  ],
  13: [
    page(61, intro(13,'表計算のワークシート及びマクロの説明','1～3'), heading('表計算の説明'),
      p('ある会社では，社員ごとの社内向け学習教材の学習進捗状況を表計算ソフトで管理している。'),
      heading('ワークシート：学習進捗管理（単元記述部分）'),
      p('(1) 社員ごとにワークシート“学習進捗管理”が用意され，学習進捗状況が記載される。ワークシート“学習進捗管理”の単元記述部分である列A～Gの例を，図1に示す。'),
      panel('unit-sheet','図1　ワークシート“学習進捗管理”（単元記述部分）の例'),
      p('(2) 学習教材は12の単元から構成されており，単元にはそれぞれ固有のIDが割り振られている。\n(3) セルA2～A13には，単元のIDが昇順に格納されている。単元のIDは100から昇順に100刻みで付与されている。\n(4) セルB2～B13には，単元名が格納されている。'),
      p('(5) 各単元は複数の項目から構成されている。セルC2～C13には，単元に含まれる項目の学習順序（以下，項目学習順序という）が格納されている。セルの値が“任意”の場合はどの項目から学習してもよいことを示し，セルの値が“順次”の場合は各項目を項目のIDが小さいものから順番に学習しなければならないことを示している。')),
    page(62,
      p('(6) セルD2～D13には，その単元の学習を開始してから完了するまでの学習に要する標準的な日数（以下，標準日数という）が格納されている。'),
      p('(7) セルE2～E13とセルF2～F13には，それぞれ対応する単元の学習を開始した日（以下，学習開始日という），学習を完了した日（以下，学習完了日という）がそれぞれマクロStartLearningとFinishLearningを用いて設定される。日付はyyyy-mm-ddの形式で表示されるが，表計算ソフトの内部では1970年1月1日からの経過日数を整数値で保持している。計算にはこの内部の整数値を利用する。'),
      p('(8) セルG2～G13には，それぞれの単元の学習に関する判定結果が表示される。学習完了日が設定されたとき，学習に要した日数が標準日数以下の場合には“○”が表示され，そうでなければ“△”が表示される。学習開始日も学習完了日も学習に要した日数に含まれる。ここで，休日は考慮せず，休日も1日と数える。例えば，学習開始日が2014年5月10日で学習完了日が2014年5月12日の場合，学習に要した日数は3日である。また，学習完了日が設定されていない場合には空値が表示される。'),
      heading('設問1'), p('ワークシート“学習進捗管理”に関する次の記述中の' + bankInstruction),
      p('それぞれの単元の学習が標準日数内に完了したかどうかを表示するために，次の式をセルG2に入力し，セルG3～G13に複写する。'), code('IF(F2＝null, [a])','text')),
    page(63, heading('ワークシート：学習進捗管理（項目記述部分）'),
      p('(1) この学習教材の項目の総数は52である。ワークシート“学習進捗管理”の項目記述部分である列I～Mの例を，図2に示す。'),
      panel('item-sheet','図2　ワークシート“学習進捗管理”（項目記述部分）の例'),
      p('(2) セルI2～I53には，項目のIDが昇順に格納されている。項目のIDは，その項目が属する単元のIDの下2桁を01から始まる連番にしたものである。\n(3) セルJ2～J53には，項目名が格納されている。'),
      p('(4) セルK2～K53には，それぞれの項目が学習開始可能であれば“可”が表示され，そうでなければ“不可”が表示される。学習開始可能であるとは，次の条件①，②をともに満たしていることをいう。\n① 項目が属する単元が学習開始可能である。単元が学習開始可能であるとは，単元のIDが100であるか，又は，より小さいIDの単元の学習が全て完了していることをいう。\n② 次の条件(a)又は(b)のどちらかを満たしている。\n(a) 項目が属する単元の項目学習順序が“任意”である。')),
    page(64, p('(b) 項目が属する単元の項目学習順序が“順次”であり，その項目のIDの下2桁が01であるか，又は，その単元の中でより小さいIDの項目の学習が全て完了している。'),
      p('(5) セルL2～L53とセルM2～M53には，それぞれ対応する項目の学習開始日，学習完了日がそれぞれマクロStartLearningとマクロFinishLearningを用いて設定される。'),
      heading('設問2'), p('ワークシート“学習進捗管理”に関する次の記述中の' + bankInstruction + spring2015PmErratum),
      p('(1) それぞれの項目が学習開始可能か否かを表示するために，セルK2に“可”を入力する。\n(2) 次の式をセルK3に入力し，セルK4～K53に複写する。'),
      code(`IF(論理積(
    論理和(
        切捨て(I3, -2)＝100,
        表引き($F$2～$F$13, [b], 1)≠null),
    論理和(
        垂直照合(切捨て(I3, -2), $A$2～$C$13, 3, 0)＝[c],
        剰余(I3, 100)＝1,
        [d])),
   '可','不可')`,'text')),
    page(65, heading('設問3'), p('学習開始日を設定するマクロStartLearningと学習完了日を設定するマクロFinishLearningをワークシート“学習進捗管理”に格納した。マクロStartLearning中の' + bankInstruction),
      p('(1) セルO2に学習を開始する項目のIDを入力し，マクロStartLearningを実行すると，次の①，②をともに満たす場合，対応する項目の学習開始日にマクロが実行された日付を設定する。\n① その項目が学習開始可能である。\n② その項目の学習開始日が空値である。\nまた，その項目が属する単元の学習開始日が空値ならば，単元の学習開始日にもマクロが実行された日付を設定する。'),
      p('(2) マクロStartLearningの実行時のセルO2には，セルI2～I53にあるいずれかの項目のIDが正しく入力されているものとする。\n(3) マクロStartLearningでは，マクロの実行日を取得するために表1に示す関数を用いる。'),
      table('表1　マクロStartLearningで用いる関数',['書式','説明'],[['本日()','1970年1月1日からこの関数を実行した日までの経過日数を整数値で返す。']])),
    page(66, heading('マクロ：StartLearning'), code(startLearning,'pseudocode')),
  ],
};
