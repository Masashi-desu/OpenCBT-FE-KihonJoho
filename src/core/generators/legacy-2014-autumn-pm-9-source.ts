import { ask, bank, code, heading, p, page, panel } from './legacy-2014-autumn-pm-09-13-source';

export const autumn2014Pm9InputCode = String.raw`#include <stdio.h>
#include <string.h>

#define BitS  0x08
#define BitO  0x04
#define BitR  0x01

FILE          *NewFile,   *OldFile;
int            NewEof,     OldEof;
char           NewID[9],   OldID[9];
char           NewName[11],OldName[11];
unsigned char  NewAttr,    OldAttr;
char           NewDate[9], OldDate[9];

void ReadNewRecord() {

    fscanf(NewFile, "%s %s %c %s", NewID, NewName, &NewAttr, NewDate);
    if (feof(NewFile) != 0) {
        NewEof = EOF;                 /* EOF: 負の整数定数 */
        strcpy(NewID, "\xFF");         /* \xFF: 8ビット符号の最大値 */
    }
}

void ReadOldRecord() {

    fscanf(OldFile, "%s %s %c %s", OldID, OldName, &OldAttr, OldDate);
    if (feof(OldFile) != 0) {
        OldEof = EOF;
        strcpy(OldID, "\xFF");
    }
}

void main() {

    NewFile = fopen("NewFile", "rb");
    OldFile = fopen("OldFile", "rb");
    NewEof = 0;
    OldEof = 0;
    ReadNewRecord();
    ReadOldRecord();`;

export const autumn2014Pm9MergeCode = String.raw`    while ([a]) {
        /* α 開始 */
        if (strcmp(NewID, OldID) == 0) {
            if ([b]) {
                printf("\n%-8s  %-10s", NewID, NewName);
                if ((NewAttr & BitS) > (OldAttr & BitS))
                    printf("  特権 S 付加");
                if ((NewAttr & BitS) < (OldAttr & BitS))
                    printf("  特権 S 解除");
                if ((NewAttr & BitO) > (OldAttr & BitO))
                    printf("  特権 O 付加");
                if ((NewAttr & BitO) < (OldAttr & BitO))
                    printf("  特権 O 解除");
            }
            [c]
        }
        else {
            if ([d]) {
                printf("\n%-8s  %-10s  利用者 ID 追加", NewID, NewName);
                if ((NewAttr & BitS) == BitS)  printf("  特権 S 付加");
                if ((NewAttr & BitO) == BitO)  printf("  特権 O 付加");
                ReadNewRecord();
            }
            else {
                printf("\n%-8s  %-10s  利用者 ID 削除", OldID, OldName);
                if ((OldAttr & BitS) == BitS)  printf("  特権 S 解除");
                if ((OldAttr & BitO) == BitO)  printf("  特権 O 解除");
                ReadOldRecord();
            }
        }
        /* α 終了 */
    }
    fclose(OldFile);
    fclose(NewFile);
}`;

export const autumn2014Pm9UsageCode = String.raw`        if (strcmp(NewID, OldID) <= 0) {
            if (([e]) || ([f])) {
                printf("\n%-8s  %-10s", NewID, NewName);
                if ([e])
                    printf("  現在使用不可");
                if ([f])
                    printf("  期間中未使用");
            }
            ReadNewRecord();
        }
        else
            ReadOldRecord();`;

export const autumn2014Pm9Pages = [
  page(47,
    p('次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の○選をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。'),
    heading('問9　次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    p('B社では，セキュリティ管理のために，システムファイルから定期的に，システムの運用・保守用の利用者ID一覧を作成し，ファイルで保管している。'),
    p('これらの利用者IDに付加できる特権には，システムファイルの更新などができるシステム特権（以下，特権Sという）及びバックアップ作業などのために全てのファイルを参照できるオペレーション特権（以下，特権Oという）の2種類がある。'),
    p('B社では，セキュリティ管理強化の一環で，利用者IDの追加・削除や特権の付加・解除が，申請に基づいて正しくシステムに反映されているかどうかを検証することになった。そのために，最新及び1世代前の利用者ID一覧を比較して，この間の利用者ID及び特権の登録内容の差異を印字するプログラムを作成する。'),
    heading('〔プログラムの説明〕'),
    p('(1) 最新の利用者ID一覧をファイルNewFileから，1世代前の利用者ID一覧をファイルOldFileから，それぞれ読み込む。レコードは利用者IDの昇順に整列されている。'),
    p('(2) 1レコードは，利用者ID（1〜8桁），利用者名（1〜10桁），属性（1桁）及び最終使用日（8桁）の4項目から成る。各項目は，空白文字で区切られている。'),
    p('① 利用者ID及び利用者名は，英数字から成る文字列である。'),
    p('② 属性は，次に示す内容の8ビット長のビット列である。'),
    panel('attribute', '属性の8ビット配置'),
    p('上位4ビット：固定値0100\nビットs：特権Sが付加されていれば1，付加されていなければ0\nビットo：特権Oが付加されていれば1，付加されていなければ0\nビットg及びr：その他の属性'),
    p('③ 最終使用日は，数字から成る文字列で，その利用者IDで最後にログインした年月日を表す。登録後，一度もログインしていない場合は，全桁が“0”である。')),
  page(48,
    p('(3) 利用者ID及び特権の登録内容の差異は，次のように印字する。'),
    p('① NewFile中にあってOldFile中にない利用者IDの場合\n利用者ID，利用者名の後に“利用者 ID 追加”と印字する。この利用者IDに特権Sが付加されていれば“特権 S 付加”，特権Oが付加されていれば“特権 O 付加”を追加印字する。'),
    p('② OldFile中にあってNewFile中にない利用者IDの場合\n利用者ID，利用者名の後に“利用者 ID 削除”と印字する。この利用者IDに特権Sが付加されていれば“特権 S 解除”，特権Oが付加されていれば“特権 O 解除”を追加印字する。'),
    p('③ NewFile及びOldFileの両方にあり，特権Sと特権Oの少なくとも一方の付加状況が変わった利用者IDの場合\n利用者ID，利用者名の後に“特権 S 付加”，“特権 S 解除”，“特権 O 付加”，“特権 O 解除”の該当する全てを印字する。'),
    p('(4) 入力ファイルNewFile及びOldFileのデータ例を図1に，図1のデータ例を用いた実行結果を図2に，それぞれ示す。'),
    panel('input', '図1　入力ファイルNewFile及びOldFileのデータ例'),
    panel('differences', '図2　図1のデータ例を用いた実行結果'),
    p('(5) ライブラリ関数strcmp(s1, s2)は，文字列s1とs2を比較し，s1＜s2のとき負の値を，s1＝s2のとき0を，s1＞s2のとき正の値を，それぞれ返す。')),
  page(49, heading('〔プログラム〕'), code(autumn2014Pm9InputCode, 'c')),
  page(50, code(autumn2014Pm9MergeCode, 'c')),
  page(51,
    heading('設問1'), p('プログラム中の' + ask), bank('a'), bank('b'), bank('c'), bank('d'),
    heading('設問2'), p('次の記述中の' + ask),
    p('利用者IDが有効に使用されているかどうかを検証するために，一定期間未使用，又は現在使用不可の利用者ID一覧を印字するプログラムを作成する。'),
    p('(1) 最新の利用者ID一覧をファイルNewFileから，一定期間前の世代の利用者ID一覧をファイルOldFileから，それぞれ読み込む。'),
    p('(2) 次の①，②の少なくとも一方に該当する利用者IDについて，利用者ID，利用者名の後に，①に該当する場合は“現在使用不可”を，②に該当する場合は“期間中未使用”を印字する。'),
    p('① NewFile中にあって，属性のビットrが1である利用者ID')),
  page(52,
    p('ここで，属性のビットrは，利用者IDが使用可能なら0，使用不可なら1である。'),
    p('② NewFile及びOldFileの両方にあって，最終使用日の値が等しい利用者ID（全桁が“0”同士で等しい場合を含む）'),
    p('(3) 図3に，図1のデータ例を用いた実行結果を示す。'),
    panel('usage', '図3　図1のデータ例を用いた使用状況の印字結果'),
    p('この処理を実装するためには，プログラム中のwhile文のブロック内（αで示した部分）を次のように変更すればよい。ここで，プログラム中の［a］には，正しい答えが入っているものとする。'),
    code(autumn2014Pm9UsageCode, 'c'), bank('ef')),
];
