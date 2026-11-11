import { code, p } from './definition';
import { heading, selectionInstruction } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2011-special-pm-09-13-support';

export const seatCases = [
  { free: 0, ordered: 'SABC', forwardWhenZero: true },
  { free: 0, ordered: 'CBAS', forwardWhenZero: true },
  { free: 1, ordered: 'SABC', forwardWhenZero: false },
  { free: 1, ordered: 'CBAS', forwardWhenZero: true },
] as const;

const seatRows = [
  ['A', 'AASSS', 'SSSAA'], ['B', 'AAASSS', 'SSSAAA'], ['C', 'AAAASSS', 'SSSAAAA'],
  ['⋮', '', ''], ['K', 'BBBBAAA', 'AAABBBB'], ['L', 'BBBBAAA', 'AAABBBB'],
  ['⋮', '', ''], ['Q', 'CCCCBBB', 'BBBCCCC'], ['R', 'CCCCBBB', 'BBBCCCC'],
  ['⋮', '', ''], ['Y', 'CCCCCCC', 'CCCCCCC'], ['Z', 'CCCCCCC', 'CCCCCCC'],
] as const;
export const q9Seats = languageFigure(9, 'theatre-seats', '図1　U劇場の座席配置', () =>
  ({ kind: 'seats', rows: seatRows.map(([row, before, after]) => ({ row, before, after })), marked: { row: 'L', number: 6 }, stage: 'ステージ' }));

const structs = `typedef struct {
    char seat_class;  /* 座席種別 */
    int  reserved;    /* 予約状態 */
} SEAT;
typedef struct {
    char seat_row;    /* 座席の列名 */
    int  seat_no;     /* 座席の番 */
} POSITION;`;

export function checkSeatsProgram(index: number) {
  return String.raw`#define ROWNUM  26    /* 座席の列数 */

${structs}

static char row_s[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

void check_seats(char, int, SEAT *[ROWNUM], POSITION *);

void check_seats(char class, int num, SEAT *hall[ROWNUM],
                 POSITION *pos) {
    int cnt, found = 0, no, row;

    for (row = 0; row < ROWNUM; row++) {
        cnt = 0;
        for (no = 0; hall[row][no].seat_class != '\0'; no++) {
            if ((hall[row][no].seat_class == class) &&
                (hall[row][no].reserved == ${seatCases[index].free})) {
                if (++cnt >= num) {
                    ［a］;
                    break;
                }
            } else {
                ［b］;
            }
        }
        if (found != 0) {
            break;
        }
    }

    if (found != 0) {
        pos->seat_row = ［c］;
        pos->seat_no  = ［d］;
    } else {
        pos->seat_row = '\0';
    }
}`;
}

export function checkServiceProgram(index: number) {
  const { ordered, forwardWhenZero } = seatCases[index];
  return String.raw`#define ROWNUM  26    /* 座席の列数 */
#define CLSNUM   4    /* 座席種別数 */

${structs}

static char class_s[CLSNUM] = "${ordered}";

void check_service(char, int, SEAT *[ROWNUM], int);
void check_seats(char, int, SEAT *[ROWNUM], POSITION *);
void print_seats(char, int, POSITION *);

void check_service(char class, int num, SEAT *hall[ROWNUM], int opt)
{
    int i;
    char c;
    POSITION pos;

    check_seats(class, num, hall, &pos);
    print_seats(class, num, &pos);
    if (pos.seat_row == '\0') {
        for (i =0; i < CLSNUM; i++) {
            if (opt ${forwardWhenZero ? '==' : '!='} 0) {
                c = class_s[i];
            } else {
                c = class_s[CLSNUM - i - 1];
            }
            if (class != c) {
                check_seats(c, num, hall, &pos);
                print_seats(c, num, &pos);
            }
        }
    }
}`;
}

export const seatBanks = {
  ab: ['cnt = 0', 'cnt--', 'cnt++', 'found = 0', 'found = 1'],
  cd: ['no', 'no - num', 'no - num + 1', 'no - num + 2', 'row', 'row + 1', 'row_s[row]', 'row_s[row + 1]'],
  e: ['よりも料金の高いすべての座席種別', 'よりも料金の安いすべての座席種別', 'よりも一つ料金の高い座席種別', 'よりも一つ料金の安い座席種別', 'を除くすべての座席種別'],
  fg: ['高い', '安い'],
};
export const q9 = createLanguageDefinition(9, 'Cで連続した空き座席を探す', 'seatSearch', 'abcdefg', 'オアキエオアイ',
  '行優先の走査、同一列での連続、番の1始まり、希望種別が見つからない場合の全代替種別を保持する。予約状態を表す値、種別配列の順とoptの分岐条件を同じ位置にバインドする。',
  index => {
    const { free, ordered, forwardWhenZero } = seatCases[index];
    const startsExpensive = (ordered[0] === 'S') === forwardWhenZero;
    const program1 = checkSeatsProgram(index);
    const branch = program1.indexOf('    } else {\n        pos->seat_row');
    return {
      pages: [
        page(40, [p(selectionInstruction), heading('問9　次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          heading('〔プログラム1の説明〕'),
          p('U劇場の座席予約システムにおいて，希望する座席種別と座席数を指定すると，連続した空き（未予約）座席があるかどうかを調べるプログラムである。'),
          p('（1） U劇場の座席配置は図1に示すとおりである。'), q9Seats.block(index),
          p('① U劇場には，ステージ側から列名がA～Zの26列の座席があり，各列の座席数は異なる。\n② 各列の座席は，ステージに向かって一番左から順に1，2，…と数え，列名のA～Zと，この数（以下，番という）を組み合わせた座席番号で識別される。例えば，“L列6番”の座席とは，12列目（L列）のステージに向かって一番左から6番目の座席を示す。')]),
        page(41, [p('③ 各座席には，料金の違いを示す種別（以下，座席種別という）が割り振られている。座席種別は，料金が高いものから順にS，A，B，Cの四つがある。図1中の座席の文字は座席種別を表している。'),
          p('（2） 空き座席を探すときには，ステージに向かって最前列の一番左（A列1番）から開始して，同一の列に希望する座席種別と座席数の連続した空きがあるかどうかを調べる。A列で見つからなかった場合は，順次B列，C列，…と後列を対象にして同様に調べる。'),
          p('（3） 関数 check_seats の引数は次のとおりである。ここで，引数の値に誤りはないものとする。\nclass　希望の座席種別\nnum　希望の座席数\nhall　座席表\npos　確認結果（POSITION型の構造体へのポインタ）\n① 連続した空き座席が見つかった場合，最初に見つかった空きの中で，ステージに向かって一番左に位置する座席の座席番号をposが指す構造体に格納する。\n② 連続した空き座席が見つからなかった場合，posが指す構造体の座席の列名にナル文字を格納する。'),
          p('（4） 構造体 SEAT の構造は次のとおりである。'), code(structs.split('typedef struct {').slice(1, 2).map(t => 'typedef struct {' + t.trimEnd())[0], 'c'),
          p('（5） 構造体 POSITION の構造は次のとおりである。'), code('typedef struct {' + structs.split('typedef struct {')[2], 'c'),
          p('（6） 座席表hallの要素hall[i][j]はSEAT型の構造体であり，各席の座席種別と予約状態が次のとおり格納されている。ここで，添字iの0～25が列名A～Zに，添字jの0～Ni-1が番1～Ni（Niは，添字iに対応する列の座席数）に対応している。\nhall[i][j].seat_class：座席種別を表す“S”，“A”，“B”，“C”のいずれかの文字が格納されている。')]),
        page(42, [p(`hall[i][j].reserved：予約状態が格納されている。${free}は空きを，${1 - free}は予約済を表す。\n各列のステージに向かって一番右の座席の次の要素の座席種別hall[i][Ni].seat_classには，ナル文字が格納されている。`),
          heading('〔プログラム1〕'), code(program1.slice(0, branch - 1), 'c')]),
        page(43, [code(program1.slice(branch), 'c'), p('設問1　プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　関数 check_seats を使って，希望する座席種別の連続した空き座席があるかどうかを調べ，その結果を出力する。希望する座席種別の連続した空き座席がない場合には，ほかの座席種別で希望する座席数の連続した空き座席があるかどうかを調べ，その結果を出力するプログラムを作成した。作成したプログラムに関する説明文中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('（1） 関数 check_service の引数は次のとおりである。ここで，引数の値に誤りはないものとする。\nclass　希望の座席種別\nnum　希望の座席数\nhall　座席表\nopt　結果の出力順'),
          p('（2） 関数 check_service で使用している関数 print_seats の仕様は次のとおりである。'),
          code('void print_seats(char class, int num, POSITION *pos)', 'c'),
          p('機能：指定の座席種別の連続した空き座席があるかどうかの確認結果を出力する。\n引数：class　座席種別\n　　　num　座席数\n　　　pos　確認結果（POSITION型の構造体へのポインタ）')],
          [bank(1, 'ab', seatBanks.ab, 'オア', 'c'), bank(1, 'cd', seatBanks.cd, 'キエ', 'c')], [1, 1]),
        page(44, [heading('〔プログラム2〕'), code(checkServiceProgram(index), 'c')]),
        page(45, [heading('〔プログラム2の説明〕'),
          p('（1） 希望する座席種別の連続した空き座席があるかどうかを調べ，その結果を出力する。'),
          p('（2） 希望する座席種別の連続した空き座席がない場合には，希望する座席種別［e］に対して，結果の出力順optが0の場合は座席種別の料金が［f］ものから順に，結果の出力順optが0以外の場合は座席種別の料金が［g］ものから順に希望する座席数の連続した空きがあるかどうかを調べ，その結果を順次出力する。')],
          [bank(2, 'e', seatBanks.e, 'オ'), bank(2, 'f', seatBanks.fg, startsExpensive ? 'ア' : 'イ'),
            bank(2, 'g', seatBanks.fg, startsExpensive ? 'イ' : 'ア')]),
      ],
      explanation: `aでは必要数に達した時だけfoundを1にする。異なる種別又は予約済の席に達したら，bで連続数を0に戻す。cは列の添字をrow_sで文字へ変換する。見つけた末尾の添字noからnum−1だけ戻し，番は1始まりなのでdはno - num + 2。希望種別がなければ，eはclass != cを満たすすべての種別。optが0のときは${startsExpensive ? '高い' : '安い'}順，それ以外は逆順で，fとgが決まる。`,
    };
  });
