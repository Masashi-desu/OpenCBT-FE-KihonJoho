/** Native source structures for IPA 2015 autumn afternoon Q9–13.
 * Values, captions, and code were transcribed from the cited problem booklet.
 * The authoring-only image alternative text is separate from runtime source. */
export type NativeBlock =
  | { kind: 'prose' | 'heading'; text: string }
  | { kind: 'code'; id: string; language: string; text: string }
  | { kind: 'figure'; profile: string; caption: string };
export type NativeAnswerBank = {
  id: string;
  fields: { id: string; section: number | null; correct: number }[];
  options: string[];
  language: string;
};
export type LogOutputRow = { id?: string; name?: string; level: number; text: string };
export type HistogramSeries = { label: string; rows: { rating: number; count: number; stars: number }[] };
export type TotalIdRow = { score: number | null; ids: string[] } | { omitted: string };

export const autumn2015Pm0913Source: Record<number, NativeBlock[]> = {
  9: [
    { kind: "prose", text: "選択の注意。問9から問13までの5問のうち1問を選択し、選択した問題については、答案用紙の選択欄の「選」をマークして解答する。2問以上マークした場合には、はじめの1問について採点する。" },
    { kind: "prose", text: "問9（C）。次のCプログラムの説明及びプログラムを読んで、設問1、2に答えよ。" },
    { kind: "prose", text: "プログラムの説明。入退室が制限されているエリア（以下、制限エリアという）の入退室の状況を記録したファイルを読み込んで、入退室状況を印字するプログラムである。" },
    { kind: "prose", text: "X社では、ICカードを用いた入退室システムを導入して、制限エリアの入退室を管理している。図1にX社の制限エリアのレイアウトを示す。ドアは5か所（ドア番号11、12、21、22、31）あり、各ドアの内外にカードリーダが設置されている。入室時と退室時には、カードリーダにICカードをかざしてドアを開錠する。各ドアのカードリーダにICカードをかざす都度、その入退室の状況を記録した1行の入退室レコードが入退室ログに書き込まれる。" },
    { kind: "prose", text: "制限エリアには、機密度に応じたレベルが設定されている。レベルは、外部からその部屋へ入るまでに開錠して通過する必要があるドアの数で表す。ドア番号は10の位がレベルを表す。入退室できるレベルはICカードごとに設定されている。" },
    { kind: 'figure', profile: "room-layout", caption: "図1 X社の制限エリアのレイアウト" },
    { kind: "prose", text: "(1) 入退室レコードは33桁の固定長の文字列で、次に示す項目から成る。" },
    { kind: 'figure', profile: "record-layout", caption: "入退室レコードの項目" },
    { kind: "prose", text: "(1)の続き。" },
    { kind: "prose", text: "① カードIDは、ICカードを識別するIDであり、英数字から成る。" },
    { kind: "prose", text: "② 日付と時刻は、カードリーダにICカードをかざした日付と時刻である。" },
    { kind: "prose", text: "③ 入退は、\"I\"（入室）又は\"O\"（退室）である。" },
    { kind: "prose", text: "④ 可否は、\"A\"（開錠）又は\"R\"（拒否）である。" },
    { kind: "prose", text: "⑤ 名前は、ICカードの使用者を識別する名前であり、英数字と空白から成る。" },
    { kind: "prose", text: "⑥ レコードの終端には、改行文字が付いている。" },
    { kind: "prose", text: "(2) 入退室ログから印字したい日付・時間帯の入退室レコードを抽出し、カードID、日付及び時刻（先頭の18桁）で昇順に整列したファイルをAccess.Logとする。図2にAccess.Logのレコードの例を示す。" },
    { kind: 'figure', profile: "normal-input", caption: "図2 Access.Logのレコードの例" },
    { kind: "prose", text: "(3) Access.Logから読み込んだ1レコードごとに、カードID、名前、日時、ドア番号、入退、可否から成る1行を、図3に示す様式で印字する。日時以降の項目は、ICカードをかざしたドアのレベルに応じて19、39、59桁目のいずれかから印字する。" },
    { kind: 'figure', profile: "normal-output", caption: "図3 図2のレコードの例を用いた印字結果" },
    { kind: "prose", text: "(3)の続き。" },
    { kind: "prose", text: "① カードID及び名前は、同一カードIDが続くとき、先頭の行だけに印字する。" },
    { kind: "prose", text: "② 日時は、\"月-日 時:分\"の形式で印字する。" },
    { kind: "prose", text: "③ 入退は、\"I\"なら\"IN\"と、\"O\"なら\"OUT\"と印字する。" },
    { kind: "prose", text: "④ 可否は、\"A\"なら何も印字せず、\"R\"なら\"IN\"又は\"OUT\"の直前に\"(R)\"を印字する。" },
    { kind: "prose", text: "(4) ライブラリ関数strcmp(s1, s2)は、文字列s1とs2を比較し、s1 < s2のとき負の値を、s1 = s2のとき0を、s1 > s2のとき正の値を、それぞれ返す。また、ライブラリ関数strcpy(s1, s2)は、文字列s2をs1に複写する。" },
    { kind: "heading", text: "〔プログラム〕" },
    { kind: 'code', id: "q9-main", language: "c", text: String.raw`#include <stdio.h>
#include <string.h>

FILE *logFile;
int logEOF = 0;
char cardID[5] = "----", date[9] = "--------", time[7] = "------",
     door[3] = "--", dir[2] = "-", act[2] = "-",
     name[11] = "----------";
① → char lastID[5] = "----";

void getRecord();
② → void putRecord();

void main() {
    logFile = fopen("Access.Log", "r");
    getRecord();
    while (logEOF != EOF) {
③ →     putRecord();
④ →     getRecord();
⑤ → }
    fclose(logFile);
}

void getRecord() {
    if (fscanf(logFile, "%4c%8c%6c%2c%1c%1c%10c\n",
               cardID, date, time, door, dir, act, name) == EOF)
        ⟦a⟧;
    /* ファイルの終わりに達したとき fscanf は EOF（負の整数定数）を返す */
}` },
    { kind: 'code', id: "q9-put-record", language: "c", text: String.raw`void putRecord() {
    int putSpace;

    if (strcmp(cardID, lastID) == 0)
        printf("%18s", " ");
    else {
        printf("\n%4s  %10s  ", cardID, name);
⑥ →     ⟦b⟧;
⑦ → }
    putSpace = ⟦c⟧;
    while (0 < putSpace--) {
        printf("%20s", " ");
⑧ → }
    printf("%.2s-%.2s %.2s:%.2s %2s ",
           date+4, date+6, time, time+2, door);
    if (strcmp(act, "R") == 0) printf("%s", "(R)");
    if (strcmp(dir, "I") == 0) printf("%s\n", "IN");
    else                       printf("%s\n", "OUT");
}` },
    { kind: "prose", text: "設問1。プログラム中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: "prose", text: "設問2。次の記述中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: "prose", text: "プログラムを変更して、入退室順序の整合性を検査する処理を追加する。" },
    { kind: "prose", text: "各入退室者は、最初は外部（レベル0）にいて、最後は外部に出るものとする。正しく入退室していれば、制限エリアのレベルは0から始まり、ドアを通過する都度、レベルが1ずつ変化し、最後は0に戻るはずである。しかし、抽出した日付・時間帯よりも前（後）に入室（退室）している場合や、ICカードをかざさずに人の後についてドアを通過した場合などには、順序の不整合が起きる。なお、カードリーダにICカードをかざしてドアが開錠した場合は、必ず入退室するものとする。" },
    { kind: "prose", text: "(1) 順序の不整合が起きた場合は、本来入退室の記録があるべき行のレベル1の印字位置に\"***** Level x-->y\"と印字する。これは、入退室者がこの前後にレベルxからyへ移動したはずであるが、その記録がないことを意味する。" },
    { kind: "prose", text: "(2) 図4に、不整合がある入力レコードの例を示す。図4のレコードを用いて変更後のプログラムを実行すると、印字結果は図5のようになる。" },
    { kind: 'figure', profile: "missing-input", caption: "図4 不整合がある入力レコードの例" },
    { kind: 'figure', profile: "missing-output", caption: "図5 不整合がある入力レコードの例（図4）のときの印字結果" },
    { kind: "prose", text: "プログラムを次のように変更する。" },
    { kind: "prose", text: "(1) プログラムに、次の文を追加する。" },
    { kind: 'figure', profile: "insertion-table", caption: "プログラムに追加する文" },
    { kind: "prose", text: "(2) プログラムの末尾に、次の二つの関数を追加する。" },
    { kind: 'code', id: "q9-extra-functions", language: "c", text: String.raw`void checkLevel() {
    int afterLevel, beforeLevel, doorLevel;

    doorLevel = door[0] - '0';
    beforeLevel = doorLevel;
    afterLevel = doorLevel;
    if (strcmp(dir, "I") == 0)
        beforeLevel = doorLevel - 1;
    else
        afterLevel = doorLevel - 1;
    if (strcmp(act, "R") == 0)
        afterLevel = beforeLevel;
    if (level != beforeLevel)
        printf("***** Level %d-->%d\n%18s", ⟦f⟧, ⟦g⟧, " ");
    level = afterLevel;
}

void clearLevel() {
    if (logEOF == EOF || (strcmp(cardID, lastID) != 0))
        if (level > 0) {
            printf("%18s***** Level %d-->0\n", " ", level);
            level = 0;
        }
}` },
  ],
  10: [
    { kind: "prose", text: "問10（COBOL）。次のCOBOLプログラムの説明及びプログラムを読んで、設問1、2に答えよ。" },
    { kind: "prose", text: "プログラムの説明。D社では、ある製品の満足度を調べるために、アンケート調査を実施し、得られた1,000件の回答をアンケート結果ファイルに登録した。このプログラムは、アンケート結果ファイルを読み込み、集計結果をグラフで表示する。" },
    { kind: "prose", text: "(1) アンケート結果ファイルは、図1に示すレコード様式の順ファイルである。" },
    { kind: 'figure', profile: "record-layout", caption: "図1 アンケート結果ファイルのレコード様式" },
    { kind: "prose", text: "① 回答IDは、一意に割り振られた0001〜1000の番号である。" },
    { kind: "prose", text: "② 価格満足度、機能満足度及びデザイン満足度は、それぞれの満足度の高から低を5〜1の5段階で評価したものである。" },
    { kind: "prose", text: "(2) 集計した満足度の分布をヒストグラムで表示する。図2に集計結果の表示例を示す。" },
    { kind: "prose", text: "① 価格（Price）、機能（Function）及びデザイン（Design）の各項目のヒストグラムを並べて表示する。" },
    { kind: "prose", text: "② 各ヒストグラムは、項目名の行と満足度5〜1の行の6行から成る。" },
    { kind: "prose", text: "③ 各満足度の行は、満足度の値、その満足度の選択数、選択数を長さで表す横棒の順に表示する。" },
    { kind: "prose", text: "④ 選択数は、値が0の場合以外は先行する数字0を除いて、値が0の場合は1桁の数字0を、右寄せで表示する。" },
    { kind: "prose", text: "⑤ 横棒は、選択数20ごとに記号\"*\"を一つ用いて表示する。選択数が20に満たない端数は切り捨てる。" },
    { kind: 'figure', profile: "histogram", caption: "図2 集計結果の表示例" },
    { kind: "heading", text: "〔プログラム〕" },
    { kind: 'code', id: "q10-program-1", language: "cobol", text: String.raw` 1 DATA DIVISION.
 2 FILE SECTION.
 3 FD ANS-FILE.
 4 01 ANS-REC.
 5    02 ANS-ID      PIC 9(4).
 6    02 ANS-SATIS   OCCURS 3.
 7       03 ANS-VAL PIC 9(1).
 8 WORKING-STORAGE SECTION.
 9 77 S-PRICE      PIC 9(1) VALUE 1.
10 77 S-FUNCTION   PIC 9(1) VALUE 2.
11 77 S-DESIGN     PIC 9(1) VALUE 3.
12 77 ANS-FLAG     PIC 9(1) VALUE 0.
13    88 ANS-EOF   VALUE 1.
14 01 HIST-REC.
15    02 HIST-VAL  PIC 9(1).
16    02           PIC X(1) VALUE SPACE.
17    02 HIST-NUM  PIC ⟦a⟧.
18    02           PIC X(1) VALUE SPACE.
19    02 HIST-PLOT PIC X(50).
20 01 CNT-REC.
21    02 CNT-SATIS     OCCURS 3.
22       03 CNT-VAL   OCCURS 5.
23          04 CNT-NUM PIC 9(4) VALUE 0.` },
    { kind: 'code', id: "q10-program-2", language: "cobol", text: String.raw`24 77 PLOT-NUM  PIC 9(2).
25 77 I         PIC 9(1).
26 77 J         PIC 9(1).
27 PROCEDURE DIVISION.
28 MAIN-PROC.
29     OPEN INPUT ANS-FILE.
30     PERFORM READ-PROC.
31     PERFORM DISP-PROC.
32     CLOSE ANS-FILE.
33     STOP RUN.
34 READ-PROC.
35     PERFORM UNTIL ANS-EOF
36         READ ANS-FILE
37             AT END
38                 SET ANS-EOF TO TRUE
39             NOT AT END
40                 PERFORM VARYING I FROM 1 BY 1 UNTIL I > 3
41                     MOVE ANS-VAL(I) TO J
42                     ADD 1 TO CNT-NUM(I, J)
43                 END-PERFORM
44         END-READ
45     END-PERFORM.
46 DISP-PROC.
47     PERFORM VARYING I FROM 1 BY 1 UNTIL I > 3
48         EVALUATE I
49             WHEN S-PRICE
50                 DISPLAY "Price"
51             WHEN S-FUNCTION
52                 DISPLAY "Function"
53             WHEN S-DESIGN
54                 DISPLAY "Design"
55         END-EVALUATE
56         PERFORM VARYING J FROM 5 BY -1 UNTIL J = 0
57             MOVE J TO HIST-VAL
58             MOVE ⟦b⟧ TO HIST-NUM
59             DIVIDE ⟦b⟧ BY 20 GIVING PLOT-NUM
60             MOVE SPACE TO HIST-PLOT
61             IF PLOT-NUM > 0 THEN
62                 MOVE ALL "*" TO HIST-PLOT(⟦c⟧)
63             END-IF
64             DISPLAY ⟦d⟧
65         END-PERFORM
66     END-PERFORM.` },
    { kind: "prose", text: "設問1。プログラム中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: "prose", text: "設問2。各回答の3項目の満足度を加算した値（以下、総合満足度という）を求め、総合満足度ごとの回答IDの一覧を追加して表示するよう、プログラムを変更する。追加した部分の表示例を図3に示す。表1中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: "prose", text: "① 総合満足度の昇順に、その値と該当する全ての回答IDを表示する。" },
    { kind: "prose", text: "② 回答IDは、総合満足度ごとに昇順に表示する。" },
    { kind: "prose", text: "③ 回答IDは、10件ごとに改行して表示する。" },
    { kind: "prose", text: "④ 回答が1件もない総合満足度の値に対しては、表示を省略する。" },
    { kind: 'figure', profile: "total-output", caption: "図3 総合満足度ごとの回答ID一覧の表示例" },
    { kind: 'figure', profile: "changes", caption: "表1 プログラムの変更内容" },
  ],
  11: [
    { kind: "prose", text: "問11（Java）。次のJavaプログラムの説明及びプログラムを読んで、設問に答えよ。" },
    { kind: "prose", text: "Javaプログラムで使用するAPIの説明は、この冊子の末尾を参照するよう注記されている。" },
    { kind: "prose", text: "プログラムの説明。固定バイト長のブロック（以下、ブロックという）を単位としてデータを保管している装置（以下、ブロックデバイスという）に対し、ブロックのデータ（以下、ブロックデータという）へのアクセスを管理するプログラムである。図1にプログラム構成の概要を示す。図中の四角はプログラムの構成要素を、矢印はブロックデータの流れを示す。ここで、このプログラムでは、ブロックデバイスからの読込みだけを考える。" },
    { kind: 'figure', profile: "architecture", caption: "図1 プログラム構成の概要" },
    { kind: "prose", text: "ブロックデバイス内の各ブロックは、インデックス値で指定する。最初のブロックのインデックス値は、0である。" },
    { kind: "prose", text: "ブロックアクセサは、アプリケーションから要求されたブロックデータをブロックデバイスから取得して、アプリケーションに渡す役割をする。ブロックアクセサはキャッシュを使用し、ブロックデバイスから取得したブロックデータをキャッシュする。アプリケーションから要求されたブロックデータがキャッシュされていれば、キャッシュから取得したブロックデータをアプリケーションに渡す。" },
    { kind: "prose", text: "キャッシュは、FIFO（First In, First Out）とLRU（Least Recently Used）の2種類の管理方針に基づく実装が用意されていて、アプリケーションはどの実装を使用するかを指定する。" },
    { kind: "prose", text: "(1) クラスBlockAccessorは、ブロックアクセサを表す。" },
    { kind: "prose", text: "① コンストラクタは、ブロックデバイスをオープンし、引数で指定されたキャッシュの管理方針に基づくキャッシュを生成する。" },
    { kind: "prose", text: "② メソッドreadBlockは、引数で指定されたインデックス値のブロックデータを返す。ブロックデータがキャッシュにあれば、それを返す。なければ、ブロックデバイスから取得し、キャッシュした後、そのブロックデータを返す。" },
    { kind: "prose", text: "(2) クラスBlockDeviceは、読取り専用のブロックデバイスを表す。実装は、バイト配列の配列であるフィールドblocksを使用し、ブロックデバイスを仮想的に表す。ただし、ブロックデータの値は全て0である。" },
    { kind: "prose", text: "① 静的メソッドopenは、ブロックデバイスのインスタンスを返す。" },
    { kind: "prose", text: "② メソッドgetBlockSizeは、ブロックのサイズをバイト数で返す。" },
    { kind: "prose", text: "③ メソッドreadBlockは、引数で指定されたインデックス値のブロックデータを引数で指定されたバッファに読み込む。" },
    { kind: "prose", text: "(3) 抽象クラスCacheは、ブロックアクセサからキャッシュ機能を使用するためのクラスを表す。" },
    { kind: "prose", text: "① キャッシュの管理方針（FIFO及びLRU）を表す入れ子列挙Cache.Policyを定義する。" },
    { kind: "prose", text: "② 静的メソッドcreateCacheは、引数で指定されたキャッシュの管理方針と一致する実装クラスのインスタンスを生成して返す。" },
    { kind: "prose", text: "③ 抽象メソッドgetCachedBlockDataは、引数で指定されたインデックス値のブロックデータがキャッシュされていれば、それを返す。キャッシュされていなければ、nullを返す。" },
    { kind: "prose", text: "④ 抽象メソッドcacheBlockDataは、引数で指定されたインデックス値及びその値に対応するブロックデータをキャッシュする。キャッシュできるブロックデータ数が上限に達している場合は、管理方針に従ってキャッシュされているブロックデータを削除してから、指定されたブロックデータをキャッシュする。" },
    { kind: "prose", text: "(4) 抽象クラスListBasedCacheは、リスト構造を使用して抽象クラスCacheの一部を実装する。キャッシュできるブロックデータ数の上限値は、フィールドCACHE_SIZEで表す。" },
    { kind: "prose", text: "① メソッドgetCachedBlockData及びcacheBlockDataは、抽象クラスCacheで定義されている同名のメソッドを実装する。" },
    { kind: "prose", text: "② 抽象メソッドhitは、要求されたブロックデータがキャッシュ中に見つかったときに呼び出される。引数は、見つかったブロックデータとそのインデックス値の対（以下、キャッシュエントリという）である。" },
    { kind: "prose", text: "(5) 入れ子クラスListBasedCache.Entryは、キャッシュに格納するキャッシュエントリを表す。" },
    { kind: "prose", text: "① コンストラクタは、引数で指定されたインデックス値及びブロックデータをもつキャッシュエントリを生成する。" },
    { kind: "prose", text: "② メソッドgetIndex及びgetBlockDataは、それぞれインデックス値及びブロックデータを返す。" },
    { kind: "prose", text: "(6) 入れ子クラスListBasedCache.Fifoは、キャッシュエントリの管理をFIFOで行う。" },
    { kind: "prose", text: "① メソッドhitは、無操作である。" },
    { kind: "prose", text: "(7) 入れ子クラスListBasedCache.Lruは、キャッシュエントリの管理をLRUで行う。" },
    { kind: "prose", text: "① メソッドhitは、指定されたキャッシュエントリをリストの先頭に移動する。" },
    { kind: "prose", text: "なお、上記コンストラクタやメソッドを呼び出すときの引数に誤りはないものとする。" },
    { kind: "heading", text: "〔プログラム1〕" },
    { kind: 'code', id: "q11-program-1a", language: "java", text: String.raw`public class BlockAccessor {
    private final Cache cache;
    private final BlockDevice device;

    public BlockAccessor(Cache.Policy policy) {
        device = BlockDevice.open();
        cache = Cache.createCache(policy);
    }

    public byte[] readBlock(int index) {
        byte[] blockData = cache.getCachedBlockData(index);
        if (blockData == null) {
            blockData = new byte[device.getBlockSize()];
            device.readBlock(index, blockData);
            cache.cacheBlockData(index, blockData);
        }
        return blockData.clone();
    }
}` },
    { kind: "heading", text: "〔プログラム2〕" },
    { kind: 'code', id: "q11-program-2", language: "java", text: String.raw`class BlockDevice {
    private final byte[][] blocks = new byte[100][512];

    static BlockDevice open() {
        return new BlockDevice();
    }

    int getBlockSize() {
        return ⟦a⟧.length;
    }

    void readBlock(int index, byte[] buffer) {
        byte[] block = blocks[index];
        System.arraycopy(block, 0, buffer, 0, block.length);
    }
}` },
    { kind: "heading", text: "〔プログラム3〕" },
    { kind: 'code', id: "q11-program-3", language: "java", text: String.raw`public abstract class Cache {
    public enum Policy {
        FIFO, LRU;
    }

    static ⟦b⟧ createCache(Policy policy) {
        switch (policy) {
        case FIFO:
            return new ListBasedCache.Fifo();
        case LRU:
            return new ListBasedCache.Lru();
        }
        throw new UnsupportedOperationException();
    }

    abstract byte[] getCachedBlockData(int index);
    abstract void cacheBlockData(int index, byte[] blockData);
}` },
    { kind: "heading", text: "〔プログラム4〕" },
    { kind: 'code', id: "q11-program-4a", language: "java", text: String.raw`import java.util.ArrayList;
import java.util.List;

abstract class ListBasedCache extends Cache {
    final List<Entry> entries = new ArrayList<Entry>();
    private static final int CACHE_SIZE = 20;

    byte[] getCachedBlockData(int index) {
        for (Entry entry : entries) {
            if (entry.getIndex() ⟦c⟧ index) {
                hit(entry);
                return entry.getBlockData();
            }
        }
        return null;
    }

    void cacheBlockData(int index, byte[] blockData) {
        if (⟦d⟧) {
            entries.remove(⟦e⟧);
        }
        entries.add(0, new Entry(index, blockData));
    }

    abstract void hit(Entry entry);

    private static class Entry {
        private final int index;
        private final byte[] blockData;

        private Entry(int index, byte[] blockData) {
            this.index = index;
            this.blockData = blockData;
        }

        int getIndex() { return index; }
        byte[] getBlockData() { return blockData; }
    }

    static class Fifo extends ⟦f⟧ {
        void hit(Entry entry) { }
    }

    static class Lru extends ⟦f⟧ {
        void hit(Entry entry) {
            entries.remove(⟦g⟧);
            entries.add(0, entry);
        }
    }
}` },
    { kind: "prose", text: "設問。プログラム中の空欄に入れる正しい答えを、解答群の中から選べ。" },
  ],
  12: [
    { kind: "prose", text: "問12（アセンブラ）。次のアセンブラプログラムの説明及びプログラムを読んで、設問1〜3に答えよ。" },
    { kind: "prose", text: "プログラム1の説明。副プログラムBITINSは、図1に示すように、ビット列A（長さ16ビット）をビット列B（長さ16ビット）の指定された位置に挿入し、ビット列C（長さ32ビット）を作成する。図1中のn（0≦n≦16）は、挿入位置（先頭からのビット数）を表す。" },
    { kind: 'figure', profile: "bitins", caption: "図1 ビット列の挿入" },
    { kind: "prose", text: "(1) GR0〜GR3には、それぞれ次の内容が設定されて、主プログラムから渡される。" },
    { kind: "prose", text: "GR0: ビット列A" },
    { kind: "prose", text: "GR1: ビット列Bが格納されている領域のアドレス" },
    { kind: "prose", text: "GR2: n" },
    { kind: "prose", text: "GR3: ビット列Cを格納する2語の領域の先頭アドレス" },
    { kind: "prose", text: "(2) 副プログラムから戻るとき、汎用レジスタGR1〜GR7の内容は元に戻す。" },
    { kind: "heading", text: "〔プログラム1〕" },
    { kind: 'code', id: "q12-program-1", language: "casl2", text: String.raw` 1 BITINS START
 2        RPUSH
 3        LD   GR6,=⟦a⟧
 4        SUBA GR6,GR2    ; GR6 ← シフト数
 5        LD   GR1,0,GR1  ; GR1 ← ビット列B
 6        LD   GR4,GR1    ; GR4 ← ビット列B
 7        LD   GR5,GR0    ; GR5 ← ビット列A
 8        SRL  GR1,0,GR6
 9        SLL  GR1,0,GR6  ; GR1 ← ビット列Bの左nビット
10        SLL  GR4,0,GR2
11        SRL  GR4,0,GR2  ; GR4 ← ビット列Bの右(16-n)ビット
12        ⟦b⟧
13        SLL  GR5,0,GR6
14        OR   GR1,GR0
15        OR   GR4,GR5
16        ST   GR1,0,GR3
17        ST   GR4,1,GR3
18        RPOP
19        RET
20        END` },
    { kind: "prose", text: "設問1。プログラム1中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: "prose", text: "設問2。次の記述中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: "prose", text: "主プログラムから渡されたnが10で、ビット列Aとビット列Bが図2のとき、行番号15のOR命令実行直前のGR4の内容は⟦c⟧であり、GR5の内容は⟦d⟧である。" },
    { kind: 'figure', profile: "input", caption: "図2 主プログラムから渡されたビット列Aとビット列B" },
    { kind: "prose", text: "設問3。連続するN語を16×Nビットから成るビット列Yとする。図3に示すように、ビット列X（長さ16ビット）をビット列Yの指定された位置に挿入し、N+1語のビット列Zを作成する副プログラムBITINSLを、副プログラムBITINSを使って作成した。図3中のm（0≦m≦16×N）は、挿入位置（先頭からのビット数）を表す。プログラム2中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: 'figure', profile: "bitinsl", caption: "図3 N語から成るビット列への挿入" },
    { kind: "prose", text: "(1) GR0〜GR4には、それぞれ次の内容が設定されて、主プログラムから渡される。" },
    { kind: "prose", text: "GR0: ビット列X" },
    { kind: "prose", text: "GR1: ビット列Yが格納されている領域の先頭アドレス" },
    { kind: "prose", text: "GR2: m" },
    { kind: "prose", text: "GR3: ビット列Zを格納するN+1語の領域の先頭アドレス" },
    { kind: "prose", text: "GR4: N" },
    { kind: "prose", text: "(2) 副プログラムから戻るとき、汎用レジスタGR1〜GR7の内容は元に戻す。" },
    { kind: "heading", text: "〔プログラム2〕" },
    { kind: 'code', id: "q12-program-2", language: "casl2", text: String.raw`BITINSL START
        RPUSH
LOOP1   CPA  GR2,=17
        ⟦e⟧
        CALL COPY       ; ビット列Yの先頭から挿入位置の直前の
        SUBA GR2,=16    ; 語までを結果の領域へコピー
        JUMP LOOP1
INS     CALL BITINS
        LAD  GR1,1,GR1
        LAD  GR3,2,GR3
        SUBA GR4,=1
        ⟦f⟧
LOOP2   CALL COPY       ; ビット列Yの残りの部分を
        JNZ  LOOP2      ; 結果の領域へコピー
FIN     RPOP
        RET
; ビット列Yの1語を結果の領域へコピー
COPY    LD   GR5,0,GR1
        ST   GR5,0,GR3
        LAD  GR1,1,GR1
        LAD  GR3,1,GR3
        SUBA GR4,=1
        RET
        END` },
  ],
  13: [
    { kind: "prose", text: "問13（表計算）。次の表計算のワークシート及びマクロの説明を読んで、設問1、2に答えよ。" },
    { kind: "prose", text: "表計算の説明。あるPC販売店では、セット値引きを導入することにした。セット値引きでは、指定された3種類の商品を同時に購入する場合、各商品を単品で購入する場合に比べて購入金額を安くする。セット値引きとなる商品の組合せ（以下、セットという）と値引きを適用していく順序は、商品の仕入状況と販売状況に基づいて適宜見直しを行う。セット値引きの導入に合わせて、これまで手書きであった購入伝票の作成について、表計算ソフトを使って行うことにした。" },
    { kind: "prose", text: "ワークシート「価格表」。商品の単価を記載したワークシート「価格表」の例を図1に示す。" },
    { kind: 'figure', profile: "price-sheet", caption: "図1 ワークシート “価格表” の例" },
    { kind: "prose", text: "ワークシート「価格表」の説明の続き。" },
    { kind: "prose", text: "(1) 販売している商品は50品目あり、セルA2〜A51には1から始まる連番で商品番号を入力する。" },
    { kind: "prose", text: "(2) セルB2〜B51には商品名を、セルC2〜C51には商品コードを、セルD2〜D51には単価を入力する。商品名と商品コードは、それぞれ重複するものはない。" },
    { kind: "prose", text: "ワークシート「セット値引き表」。セットと値引き額を記載したワークシート「セット値引き表」の例を図2に示す。" },
    { kind: 'figure', profile: "set-sheet", caption: "図2 ワークシート “セット値引き表” の例" },
    { kind: "prose", text: "(1) セットは10種類あり、値引きを適用していく順に入力する。" },
    { kind: "prose", text: "(2) セルA3〜A12には、1から始まる連番でセット番号を入力する。" },
    { kind: "prose", text: "(3) セルB3〜B12には、セット名を入力する。" },
    { kind: "prose", text: "(4) セットは3種類の商品の組合せから成り、セルC3〜H12には組み合わせる商品の商品コードと数量を入力する。商品コードは、ワークシート「価格表」に登録されているものを用いる。" },
    { kind: "prose", text: "(5) セルI3〜I12には、セットの値引き額を入力する。" },
    { kind: "prose", text: "(6) 列K〜Mは、セット値引き適用処理のための作業領域に用いる。" },
    { kind: "prose", text: "ワークシート「購入伝票」。購入する商品の一覧（購入内容）、セット値引き適用状況の一覧（セット値引き内容）、合計金額などを表示するワークシート「購入伝票」の例を図3に示す。" },
    { kind: 'figure', profile: "invoice-sheet", caption: "図3 ワークシート “購入伝票” の例" },
    { kind: "prose", text: "ワークシート「購入伝票」の説明の続き。" },
    { kind: "prose", text: "(1) 1回に購入できる商品は20品目以下である。ワークシート「購入伝票」のセルB7〜C26の各行に、商品名と数量を1件ずつ入力すると、各行の列Dと列Eにそれぞれ単価と金額（数量×単価）が、セルE1に金額の合計が表示される。ワークシート「価格表」に登録されていない商品名を入力することはない。また、同一の商品を2行以上入力することができる。" },
    { kind: "prose", text: "(2) マクロCalc_Discount_Priceを実行すると、セルC30〜C39に、セット値引きを適用するセットについてだけ数量が設定され、対応する各行の列Eにセット値引き金額（数量×値引き額）が、セルE2にセット値引き金額の合計が表示される。" },
    { kind: "prose", text: "設問1。ワークシート「購入伝票」に関する次の説明中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: "prose", text: "(1) セルA7〜A26には、1から始まる連番を入力する。" },
    { kind: "prose", text: "(2) セルE1には、購入する商品の合計金額を求めるための式を入力する。" },
    { kind: "prose", text: "(3) セルE2には、セット値引き金額の合計を求めるための式を入力する。" },
    { kind: "prose", text: "(4) セルE3には、購入金額を求めるための式を入力する。" },
    { kind: "prose", text: "(5) 商品ごとの単価を表示するために、セルD7に次の式を入力し、セルD8〜D26に複写する。" },
    { kind: 'code', id: "q13-invoice-a", language: "text", text: String.raw`IF(B7 = null, null, 垂直照合(B7, ⟦a⟧, 0))` },
    { kind: "prose", text: "(6) 商品ごとの金額を求めるために、セルE7に次の式を入力し、セルE8〜E26に複写する。" },
    { kind: 'code', id: "q13-invoice-price", language: "text", text: String.raw`IF(D7 = null, null, C7 * D7)` },
    { kind: "prose", text: "(7) セルB30〜B39には、ワークシート「セット値引き表」のセット名を、同表と同じ順序で表示するための式を入力する。" },
    { kind: "prose", text: "(8) セルC30〜C39には、マクロCalc_Discount_Priceを用いて、数量を設定する。" },
    { kind: "prose", text: "(9) ワークシート「セット値引き表」の値引き額を、同表と同じ順序で表示するために、セルD30に次の式を入力し、セルD31〜D39に複写する。" },
    { kind: 'code', id: "q13-invoice-b", language: "text", text: String.raw`⟦b⟧` },
    { kind: "prose", text: "(10) セット値引き金額を求めるために、セルE30に次の式を入力し、セルE31〜E39に複写する。" },
    { kind: 'code', id: "q13-invoice-discount", language: "text", text: String.raw`IF(C30 = null, null, C30 * D30)` },
    { kind: "prose", text: "設問2。セット値引き適用処理に関する次の説明及びマクロ中の空欄に入れる正しい答えを、解答群の中から選べ。" },
    { kind: "prose", text: "セット値引き適用処理の説明。「セット値引き表」に記載されているセットに対して、セット番号が小さいものから順にセット化して、値引きを適用していく。" },
    { kind: "prose", text: "(1) セットを構成する商品の商品番号を表示するために、ワークシート「セット値引き表」のセルK3に次の式を入力し、セルK4〜K12に複写する。" },
    { kind: 'code', id: "q13-set-cd", language: "text", text: String.raw`照合検索(C3, ⟦c⟧, ⟦d⟧)` },
    { kind: "prose", text: "同様の方法で、セルL3〜L12とセルM3〜M12にも、セットを構成する商品の商品番号を表示するための式を入力する。" },
    { kind: "prose", text: "(2) ワークシート「購入伝票」にマクロCalc_Discount_Priceを格納する。" },
    { kind: "prose", text: "マクロの説明。マクロCalc_Discount_Priceは、次の手順で処理を行う。" },
    { kind: "prose", text: "(1) 購入する各商品の数量を求め、配列Goods_Numに格納する。商品番号がi（i = 1, 2, …, 50）の商品の数量は、Goods_Num[i - 1]に格納される。" },
    { kind: "prose", text: "(2) セット番号が1, 2, …, 10の順に、セット値引きの対象となる数量を求めるために(3)〜(5)の処理を繰り返す。" },
    { kind: "prose", text: "(3) 配列Goods_Numについて、セットを構成する3種類の商品の数量を調べ、セットにできる最大の数量Set_Numを求める。" },
    { kind: "prose", text: "(4) 数量Set_Numが0でない場合は、ワークシート「購入伝票」のセットの数量のセルに数量Set_Numを格納し、セット値引きの対象とした3種類の商品の数量を、配列Goods_Numから減らす。" },
    { kind: "prose", text: "(5) 数量Set_Numが0の場合は、ワークシート「購入伝票」のセットの数量のセルに空値nullを格納する。" },
    { kind: "heading", text: "〔マクロ：Calc_Discount_Price〕" },
    { kind: 'code', id: "q13-macro", language: "pseudocode", text: String.raw`○マクロ: Calc_Discount_Price
○数値型: Goods_Num[50], Set_Num, Num, Val, I, J
○文字列型: Name
繰返し I: 0, I ≦ 49, 1
    Name ← ⟦e⟧
    Goods_Num[I] ← 条件付合計(B7:B26, = Name, C7:C26)
繰返し終わり
繰返し I: 0, I ≦ 9, 1
    Val ← Goods_Num[相対(セット値引き表!K3, I, 0) - 1] /
          相対(セット値引き表!D3, I, 0)
    Set_Num ← 整数部(Val)
    繰返し J: 1, J ≦ 2, 1
        Val ← Goods_Num[相対(セット値引き表!K3, I, J) - 1] /
              相対(セット値引き表!D3, I, J * 2)
        Num ← 整数部(Val)
        条件 ⟦f⟧
            Set_Num ← Num
        分岐終わり
    繰返し終わり
    条件 Set_Num ≠ 0
        相対(C30, I, 0) ← Set_Num
        繰返し J: 0, J ≦ 2, 1
            Goods_Num[相対(セット値引き表!K3, I, J) - 1] ←
                Goods_Num[相対(セット値引き表!K3, I, J) - 1] -
                相対(セット値引き表!D3, I, J * 2) ⟦g⟧
        繰返し終わり
    それ以外
        相対(C30, I, 0) ← null
    分岐終わり
繰返し終わり` },
  ],
};

export const autumn2015Pm0913Banks: Record<number, NativeAnswerBank[]> = {
  9: [
    { id: "a,b", language: "c",
      fields: [{"id": "a","section": 1,"correct": 3}, {"id": "b","section": 1,"correct": 7}],
      options: [
        "cardID = lastID",
        "lastID = cardID",
        "logEOF = 0",
        "logEOF = EOF",
        "strcpy(cardID, \"    \")",
        "strcpy(cardID, lastID)",
        "strcpy(lastID, \"    \")",
        "strcpy(lastID, cardID)",
      ] },
    { id: "c", language: "c",
      fields: [{"id": "c","section": 1,"correct": 0}],
      options: [
        "door[0] - '0' - 1",
        "door[0] - '0'",
        "door[0] - '0' + 1",
        "door[0] - '3'",
      ] },
    { id: "d,e", language: "c",
      fields: [{"id": "d","section": 2,"correct": 4}, {"id": "e","section": 2,"correct": 1}],
      options: [
        "行③",
        "行④",
        "行⑤",
        "行⑥",
        "行⑦",
        "行⑧",
      ] },
    { id: "f,g", language: "c",
      fields: [{"id": "f","section": 2,"correct": 3}, {"id": "g","section": 2,"correct": 1}],
      options: [
        "afterLevel",
        "beforeLevel",
        "doorLevel",
        "level",
      ] },
  ],
  10: [
    { id: "a", language: "cobol",
      fields: [{"id": "a","section": 1,"correct": 2}],
      options: [
        "9(4)",
        "B(3)9",
        "Z(3)9",
        "Z(4)",
      ] },
    { id: "b", language: "cobol",
      fields: [{"id": "b","section": 1,"correct": 3}],
      options: [
        "CNT-NUM(6 - I, J)",
        "CNT-NUM(I, 5 - J)",
        "CNT-NUM(I, 6 - J)",
        "CNT-NUM(I, J)",
      ] },
    { id: "c", language: "cobol",
      fields: [{"id": "c","section": 1,"correct": 0}],
      options: [
        "1:PLOT-NUM",
        "1:PLOT-NUM + 1",
        "PLOT-NUM",
        "PLOT-NUM + 1",
      ] },
    { id: "d", language: "cobol",
      fields: [{"id": "d","section": 1,"correct": 2}],
      options: [
        "HIST-NUM",
        "HIST-PLOT",
        "HIST-REC",
        "HIST-VAL",
      ] },
    { id: "e", language: "cobol",
      fields: [{"id": "e","section": 2,"correct": 1}],
      options: [
        "SRT-ID",
        "SRT-REC",
        "SRT-SUM",
      ] },
    { id: "f,g", language: "cobol",
      fields: [{"id": "f","section": 2,"correct": 6}, {"id": "g","section": 2,"correct": 2}],
      options: [
        "POS > 1",
        "POS > 10",
        "SRT-SUM NOT = LAST-SUM",
        "SRT-SUM NOT = LAST-SUM AND POS > 1",
        "SRT-SUM NOT = LAST-SUM AND POS > 10",
        "SRT-SUM NOT = LAST-SUM OR POS > 1",
        "SRT-SUM NOT = LAST-SUM OR POS > 10",
      ] },
  ],
  11: [
    { id: "a", language: "java",
      fields: [{"id": "a","section": null,"correct": 2}],
      options: [
        "blocks",
        "blocks[]",
        "blocks[0]",
        "blocks[][]",
        "blocks[0][]",
        "blocks[][0]",
      ] },
    { id: "b", language: "java",
      fields: [{"id": "b","section": null,"correct": 0}],
      options: [
        "Cache",
        "Cache<? extends Policy>",
        "enum",
        "Policy",
        "Policy<? extends Cache>",
        "void",
      ] },
    { id: "c", language: "java",
      fields: [{"id": "c","section": null,"correct": 3}],
      options: [
        "!=",
        "<",
        "<=",
        "==",
        ">",
        ">=",
      ] },
    { id: "d", language: "java",
      fields: [{"id": "d","section": null,"correct": 4}],
      options: [
        "!entries.isEmpty()",
        "entries.isEmpty()",
        "entries.size() != CACHE_SIZE",
        "entries.size() != index",
        "entries.size() == CACHE_SIZE",
        "entries.size() == index",
      ] },
    { id: "e", language: "java",
      fields: [{"id": "e","section": null,"correct": 1}],
      options: [
        "CACHE_SIZE",
        "CACHE_SIZE - 1",
        "CACHE_SIZE + 1",
        "index",
        "index - 1",
        "index + 1",
      ] },
    { id: "f", language: "java",
      fields: [{"id": "f","section": null,"correct": 5}],
      options: [
        "ArrayList",
        "ArrayList<Cache>",
        "Cache",
        "List",
        "List<Cache>",
        "ListBasedCache",
      ] },
    { id: "g", language: "java",
      fields: [{"id": "g","section": null,"correct": 2}],
      options: [
        "0",
        "CACHE_SIZE - 1",
        "entry",
        "entry.getIndex()",
        "entry.getIndex() - 1",
        "entry.getIndex() + 1",
      ] },
  ],
  12: [
    { id: "a", language: "casl2",
      fields: [{"id": "a","section": 1,"correct": 2}],
      options: [
        "0",
        "8",
        "16",
        "32",
      ] },
    { id: "b", language: "casl2",
      fields: [{"id": "b","section": 1,"correct": 2}],
      options: [
        "SLL GR0,0,GR2",
        "SLL GR0,0,GR6",
        "SRL GR0,0,GR2",
        "SRL GR0,0,GR6",
      ] },
    { id: "c,d", language: "casl2",
      fields: [{"id": "c","section": 2,"correct": 1}, {"id": "d","section": 2,"correct": 6}],
      options: [
        "0000 0000 0001 0111",
        "0000 0000 0001 1000",
        "0000 0010 1001 0110",
        "0000 0011 1011 1100",
        "0101 1100 0000 0000",
        "0110 0000 0000 0000",
        "1010 0101 1000 0000",
        "1110 1111 0000 0000",
      ] },
    { id: "e,f", language: "casl2",
      fields: [{"id": "e","section": 3,"correct": 1}, {"id": "f","section": 3,"correct": 4}],
      options: [
        "JMI FIN",
        "JMI INS",
        "JPL FIN",
        "JPL INS",
        "JZE FIN",
        "JZE INS",
      ] },
  ],
  13: [
    { id: "a", language: "text",
      fields: [{"id": "a","section": 1,"correct": 4}],
      options: [
        "価格表!A$2:D$51, 2",
        "価格表!A$2:D$51, 3",
        "価格表!A$2:D$51, 4",
        "価格表!B$2:D$51, 2",
        "価格表!B$2:D$51, 3",
      ] },
    { id: "b", language: "text",
      fields: [{"id": "b","section": 1,"correct": 2}],
      options: [
        "セット値引き表!A3",
        "セット値引き表!A$3",
        "セット値引き表!I3",
        "セット値引き表!I$3",
      ] },
    { id: "c,d", language: "text",
      fields: [{"id": "c","section": 2,"correct": 2}, {"id": "d","section": 2,"correct": 0}],
      options: [
        "価格表!A$2:A$51",
        "価格表!B$2:B$51",
        "価格表!C$2:C$51",
        "価格表!D$2:D$51",
      ] },
    { id: "e", language: "text",
      fields: [{"id": "e","section": 2,"correct": 4}],
      options: [
        "価格表!A2",
        "価格表!B2",
        "価格表!C2",
        "相対(価格表!A2, I, 0)",
        "相対(価格表!B2, I, 0)",
        "相対(価格表!C2, I, 0)",
      ] },
    { id: "f", language: "text",
      fields: [{"id": "f","section": 2,"correct": 0}],
      options: [
        "Num < Set_Num",
        "Num > Set_Num",
        "Num = 0",
        "Num ≠ 0",
        "Num ≠ Set_Num",
        "Set_Num = 0",
        "Set_Num ≠ 0",
      ] },
    { id: "g", language: "text",
      fields: [{"id": "g","section": 2,"correct": 4}],
      options: [
        "+ 1",
        "+ Set_Num",
        "- 1",
        "- Set_Num",
        "* Set_Num",
        "/ Set_Num",
      ] },
  ],
};

export const autumn2015Pm9Records: { fields: { label: string; widths: number[]; example: string[] }[]; normal: { input: string[][]; output: LogOutputRow[] }; missing: { input: string[][]; output: LogOutputRow[] }; insertions: string[][] } = {
  fields: [
    {"label":"カードID","widths":[4],"example":["S001"]},
    {"label":"日付","widths":[4,2,2],"example":["2015","10","18"]},
    {"label":"時刻","widths":[2,2,2],"example":["09","00","00"]},
    {"label":"ドア番号","widths":[2],"example":["11"]},
    {"label":"入退","widths":[1],"example":["I"]},
    {"label":"可否","widths":[1],"example":["A"]},
    {"label":"名前","widths":[10],"example":["Sys Op Lib"]},
    {"label":"改行","widths":[1],"example":["\\n"]},
  ],
  normal: {
    input: [
      ["S001","20151018","090000","11","I","A","Sys Op Lib"],
      ["S001","20151018","091004","21","I","A","Sys Op Lib"],
      ["S001","20151018","092008","31","I","A","Sys Op Lib"],
      ["S001","20151018","093012","31","O","A","Sys Op Lib"],
      ["S001","20151018","094016","21","O","A","Sys Op Lib"],
      ["S001","20151018","095020","11","O","A","Sys Op Lib"],
      ["V001","20151018","110048","12","I","A","Visitor 01"],
      ["V001","20151018","111052","22","I","R","Visitor 01"],
      ["V001","20151018","112056","12","O","A","Visitor 01"],
    ],
    output: [
      {"id":"S001","name":"Sys Op Lib","level":1,"text":"10-18 09:00 11 IN"},
      {"level":2,"text":"10-18 09:10 21 IN"},
      {"level":3,"text":"10-18 09:20 31 IN"},
      {"level":3,"text":"10-18 09:30 31 OUT"},
      {"level":2,"text":"10-18 09:40 21 OUT"},
      {"level":1,"text":"10-18 09:50 11 OUT"},
      {"id":"V001","name":"Visitor 01","level":1,"text":"10-18 11:00 12 IN"},
      {"level":2,"text":"10-18 11:10 22 (R)IN"},
      {"level":1,"text":"10-18 11:20 12 OUT"},
    ],
  },
  missing: {
    input: [
      ["T001","20151018","100024","11","I","A","Test Use 1"],
      ["T001","20151018","102028","31","I","A","Test Use 1"],
      ["T001","20151018","104032","21","O","A","Test Use 1"],
    ],
    output: [
      {"id":"T001","name":"Test Use 1","level":1,"text":"10-18 10:00 11 IN"},
      {"level":1,"text":"***** Level 1-->2"},
      {"level":3,"text":"10-18 10:20 31 IN"},
      {"level":1,"text":"***** Level 3-->2"},
      {"level":2,"text":"10-18 10:40 21 OUT"},
      {"level":1,"text":"***** Level 1-->0"},
    ],
  },
  insertions: [
    ["①","int level = 0;"],
    ["②","void checkLevel();\nvoid clearLevel();"],
    ["⟦d⟧","checkLevel();"],
    ["⟦e⟧","clearLevel();"],
  ],
};

export const autumn2015Pm10Data: { histogram: HistogramSeries[]; totals: TotalIdRow[]; changes: string[][] } = {
  histogram: [
    { label: "Price", rows: [
      {"rating":5,"count":69,"stars":3},
      {"rating":4,"count":255,"stars":12},
      {"rating":3,"count":378,"stars":18},
      {"rating":2,"count":229,"stars":11},
      {"rating":1,"count":69,"stars":3},
    ] },
    { label: "Function", rows: [
      {"rating":5,"count":59,"stars":2},
      {"rating":4,"count":238,"stars":11},
      {"rating":3,"count":381,"stars":19},
      {"rating":2,"count":258,"stars":12},
      {"rating":1,"count":64,"stars":3},
    ] },
    { label: "Design", rows: [
      {"rating":5,"count":81,"stars":4},
      {"rating":4,"count":244,"stars":12},
      {"rating":3,"count":362,"stars":18},
      {"rating":2,"count":245,"stars":12},
      {"rating":1,"count":68,"stars":3},
    ] },
  ],
  totals: [
    {"score":3,"ids":["0774","0850"]},
    {"score":5,"ids":["0067","0084","0220","0230","0232","0269","0285","0297","0651","0682"]},
    {"score":null,"ids":["0709","0712","0748","0762","0782","0797","0810","0823","0853","0963"]},
    {"score":6,"ids":["0021","0044","0068","0106","0107","0124","0134","0139","0183","0193"]},
    {"score":null,"ids":["0194","0203","0208","0239","0241","0259","0268","0306","0334","0379"]},
    {"score":null,"ids":["0390","0409","0443","0462","0528","0529","0533","0539","0540","0574"]},
    {"score":null,"ids":["0594","0596","0601","0610","0647","0656","0661","0666","0680","0688"]},
    {"score":null,"ids":["0694","0726","0744","0775","0807","0812","0821","0888","0894","0896"]},
    {"score":null,"ids":["0899","0904","0912","0913","0938","0939","0945","0973","0974","0975"]},
    {"score":null,"ids":["0986"]},
    {"omitted":"（中略）"},
    {"score":14,"ids":["0839","0947"]},
  ],
  changes: [
    ["行番号7と8の間に追加", String.raw`SD SRT-FILE.
01 SRT-REC.
   02 SRT-SUM PIC 9(2).
   02 SRT-ID  PIC 9(4).`],
    ["行番号26と27の間に追加", String.raw`77 SRT-FLAG PIC 9(1) VALUE 0.
   88 SRT-EOF VALUE 1.
01 T-SATIS-REC.
   02 T-SATIS-SUM PIC Z(2).
   02 T-SATIS-IDS OCCURS 10.
      03          PIC X(1) VALUE SPACE.
      03 T-SATIS-ID PIC X(4).
77 LAST-SUM PIC 9(2).
77 POS      PIC 9(2).`],
    ["行番号30、31を変更", String.raw`SORT SRT-FILE ASCENDING KEY ⟦e⟧
     INPUT PROCEDURE IS READ-PROC
     OUTPUT PROCEDURE IS DISP-PROC.`],
    ["行番号40〜43を変更", String.raw`MOVE 0 TO SRT-SUM
PERFORM VARYING I FROM 1 BY 1 UNTIL I > 3
    MOVE ANS-VAL(I) TO J
    ADD 1 TO CNT-NUM(I, J)
    ADD ANS-VAL(I) TO SRT-SUM
END-PERFORM
MOVE ANS-ID TO SRT-ID
RELEASE SRT-REC`],
    ["行番号66の後ろに追加", String.raw`DISPLAY "Total".
MOVE 1 TO LAST-SUM POS.
PERFORM UNTIL SRT-EOF
    RETURN SRT-FILE
        AT END
            SET SRT-EOF TO TRUE
        NOT AT END
            IF ⟦f⟧ THEN
                IF POS > 1 THEN
                    DISPLAY T-SATIS-REC
                END-IF
                MOVE SPACE TO T-SATIS-REC
                IF ⟦g⟧ THEN
                    MOVE SRT-SUM TO T-SATIS-SUM LAST-SUM
                END-IF
                MOVE 1 TO POS
            END-IF
            MOVE SRT-ID TO T-SATIS-ID(POS)
            ADD 1 TO POS
    END-RETURN
END-PERFORM.
DISPLAY T-SATIS-REC.`],
  ],
};

export const autumn2015Pm13Worksheets: { price: string[][]; sets: string[][]; invoice: string[][] } = {
  price: [
    ["1","商品番号","商品名","商品コード","単価（円）"],
    ["2","1","ミニタワーPC","PC001","39,800"],
    ["3","2","スリムPC","PC002","42,800"],
    ["4","3","コンパクトPC","PC003","37,800"],
    ["5","4","ノートPC","PC004","42,800"],
    ["6","5","無線LAN（ルータ）","WLRTR","12,420"],
    ["7","6","無線LAN（子機）","WLCLT","2,480"],
    ["8","7","プリンタ（USB接続）","PRUSB","12,000"],
    ["9","8","プリンタ（無線接続）","PRWLE","18,000"],
    ["10","9","ネットワークHDD（2TB）","ND200","25,000"],
    ["11","10","ネットワークHDD（4TB）","ND400","35,000"],
    ["12","11","ネットワークHDD（6TB）","ND600","45,000"],
    ["13","12","キーボード（USB接続）","KBUSB","5,000"],
    ["14","13","キーボード（無線接続）","KBWLE","7,500"],
    ["15","14","テンキーボード","TENKB","1,000"],
    ["16","15","マウス（USB接続）","MSUSB","2,000"],
    ["51","50","ディスプレイケーブル","CBDSP","1,280"],
  ],
  sets: [
    ["1","セット番号","セット名","商品1","","商品2","","商品3","","","","商品1の商品番号","商品2の商品番号","商品3の商品番号"],
    ["2","","","商品コード","数量","商品コード","数量","商品コード","数量","値引き額（円）","","","",""],
    ["3","1","ミニタワーセット1","PC001","1","KBUSB","1","MSUSB","1","-5,000","","1","12","15"],
    ["4","2","スリムセット1","PC002","1","KBUSB","1","MSUSB","1","-4,800","","2","12","15"],
    ["5","3","コンパクトセット1","PC003","1","KBUSB","1","MSUSB","1","-4,500","","3","12","15"],
    ["6","4","ミニタワーセット2","PC001","1","DSP24","1","PRUSB","1","-4,400","","1","18","7"],
    ["7","5","スリムセット2","PC002","1","DSP24","1","PRUSB","1","-4,200","","2","18","7"],
    ["8","6","コンパクトセット2","PC003","1","DSP24","1","PRUSB","1","-4,000","","3","18","7"],
    ["9","7","ノートセット","PC004","1","MSUSB","1","TENKB","1","-3,000","","4","15","14"],
    ["10","8","プリンタ無線セット","PRWLE","1","WLRTR","1","WLCLT","1","-2,500","","8","5","6"],
    ["11","9","HDD無線セット","ND400","1","WLRTR","1","WLCLT","2","-2,200","","10","5","6"],
    ["12","10","周辺機器セット","HD100","1","PRUSB","1","DSP200","1","-2,000","","22","7","17"],
  ],
  invoice: [
    ["1","","","","合計金額（円）","249,710"],
    ["2","","","","合計セット値引き金額（円）","-15,500"],
    ["3","","","","購入金額（円）","234,210"],
    ["4","","","","",""],
    ["5","購入内容","","","",""],
    ["6","No.","商品名","数量","単価（円）","金額（円）"],
    ["7","1","ミニタワーPC","2","39,800","79,600"],
    ["8","2","ノートPC","1","42,800","42,800"],
    ["9","3","ディスプレイ（24インチ）","1","38,650","38,650"],
    ["10","4","キーボード（USB接続）","2","5,000","10,000"],
    ["11","5","マウス（USB接続）","2","2,000","4,000"],
    ["12","6","テンキーボード","1","1,000","1,000"],
    ["13","7","無線LAN（ルータ）","1","12,420","12,420"],
    ["14","8","無線LAN（子機）","2","2,480","4,960"],
    ["15","9","プリンタ（無線接続）","1","18,000","18,000"],
    ["16","10","ネットワークHDD（4TB）","1","35,000","35,000"],
    ["17","11","ディスプレイケーブル","1","1,280","1,280"],
    ["18","12","マウス（USB接続）","1","2,000","2,000"],
    ["19","13","","","",""],
    ["26","20","","","",""],
    ["27","","","","",""],
    ["28","セット値引き内容","","","",""],
    ["29","セット番号","セット名","数量","値引き額（円）","セット値引き金額（円）"],
    ["30","1","ミニタワーセット1","2","-5,000","-10,000"],
    ["31","2","スリムセット1","","-4,800",""],
    ["36","7","ノートセット","1","-3,000","-3,000"],
    ["37","8","プリンタ無線セット","1","-2,500","-2,500"],
    ["38","9","HDD無線セット","","-2,200",""],
    ["39","10","周辺機器セット","","-2,000",""],
  ],
};
