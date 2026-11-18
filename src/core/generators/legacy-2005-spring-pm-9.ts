import { code, p } from './definition';
import { draw, stockConditions } from './legacy-2005-spring-pm-06-09-figures';
import { bank, draftQuestion, numbered, type Page } from './legacy-2005-spring-pm-06-09-support';
import { spring2005PmReference } from './legacy-2005-spring-pm-materials';

const midpoint = ['LAD    GR5,1,GR5', 'LAD    GR5,2,GR5', 'SLL    GR5,1', 'SLL    GR5,2', 'SRL    GR5,1'];
const direction = ['JMI    RTSET', 'JMI    SLOOP', 'JPL    RTSET', 'JPL    SLOOP',
  'LAD    GR2,1,GR2', 'LD     GR5,GR6'];
const counts = ['0', '1', '2', '3', '4', '7', '8'];
const instructions = [
  'BSEARCH   START',
  '          RPUSH',
  '          LAD    GR3,1          ; 左端標識 LT の初期設定',
  '          LD     GR4,0,GR2      ; 右端標識 RT の初期設定',
  '          LAD    GR2,-1,GR2     ; 表の基底アドレス',
  '          LAD    GR0,-1         ; 戻り値の初期設定',
  'SLOOP     CPL    GR3,GR4        ; LT > RT ?',
  '          JPL    EXIT',
  '          LD     GR5,GR3        ; ┐',
  '          ADDL   GR5,GR4        ; ├ LT, RT の中央の位置 MID の計算',
  '          ［a］                  ; ┘',
  '          LD     GR6,GR5        ; ┐',
  '          SLL    GR6,1          ; ├ 商品番号[MID] のアドレス計算',
  '          ADDL   GR6,GR2        ; ┘',
  '          CPL    GR1,0,GR6      ; KEY = 商品番号[MID] ?',
  '          JZE    FIND',
  '          ［b］',
  '          LAD    GR3,1,GR5      ; MID+1 → LT',
  '          JUMP   SLOOP',
  'RTSET     LAD    GR4,-1,GR5     ; MID-1 → RT',
  '          JUMP   SLOOP',
  'FIND      LD     GR0,1,GR6',
  'EXIT      RPOP',
  '          RET',
  '          END',
];
const lines = numbered(instructions).split('\n');

function follow(key: number, numbers: readonly number[]) {
  let low = 0;
  let high = numbers.length - 1;
  let rightUpdates = 0;
  const checked: number[] = [];
  while (low <= high) {
    const middle = low + Math.trunc((high - low) / 2);
    const item = numbers[middle];
    checked.push(item);
    if (item === key) break;
    if (key < item) {
      high = middle - 1;
      rightUpdates++;
    } else {
      low = middle + 1;
    }
  }
  return { checked, rightUpdates };
}

export const q9 = draftQuestion(9, 'CASL II：在庫表を商品番号で二分探索する',
  '検索キーと在庫表の各語', 'a=オ b=ア 設問2=ウ',
  '在庫表の先頭N、1語ずつの商品番号と在庫量、昇順、見つからない場合の−1、GR1～GR7の復元、付属資料、全25行のプログラムを保持。設問2の検索キー・在庫表のデータを変え、行20の実行回数を可変とする。',
  index => {
    const { key, products } = stockConditions[index];
    const { checked, rightUpdates } = follow(key, products);
    const symbol = 'アイウエオカキ'[counts.indexOf(String(rightUpdates))];
    const pages: Page[] = [
      { page: 35, blocks: [
        p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラムの説明〕'),
        p('ある商店の在庫状況を記録した在庫表から，商品番号をキーとして，商品の在庫量を2分探索法で検索する副プログラム BSEARCH である。'),
        p('（1）在庫表は，先頭に扱い商品数 N，その後ろに商品番号とその商品の在庫量の対を商品番号順（昇順）に格納したものである。扱い商品数，商品番号，在庫量は，それぞれ0以上の整数値で1語に格納されている。'),
        draw('9-format', index),
        p('（2）主プログラムは，商品番号（検索キー）を GR1 に，在庫表の先頭アドレスを GR2 に設定し，BSEARCH を呼ぶ。'),
        p('（3）BSEARCH は，検索キーに対応する在庫量を GR0 に設定し，主プログラムに戻る。該当する商品番号が在庫表に存在しない場合は，−1 を GR0 に設定し，主プログラムに戻る。'),
        p('（4）副プログラムから戻るとき，汎用レジスタ GR1～GR7 の内容は元に戻す。'),
        p('〔プログラム〕（行番号）'),
        code(lines.slice(0, 15).join('\n'), 'casl2'),
      ] },
      { page: 36, blocks: [
        code(lines.slice(15).join('\n'), 'casl2'),
        p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      ], banks: [bank('a', midpoint, 'オ', 'casl2', 1), bank('b', direction, 'ア', 'casl2', 1)] },
      { page: 36, blocks: [
        p('設問2　GR1 と GR2 を次のように設定して副プログラム BSEARCH を呼び出したとき，行番号20の命令は何回実行されるか，正しい答えを，解答群の中から選べ。'),
        draw('9-stock-example', index),
      ], banks: [bank('s', counts, symbol, undefined, 2, '解答群')] },
    ];
    return {
      pages,
      explanation: 'CASL II では，1語幅の LT と RT の和を SRL で1ビット論理右シフトすると，a の位置で整数の中央 MID が得られる。' +
        '商品番号の位置は在庫表の先頭から 2×MID−1 語。在庫量はその次の語である。' +
        'b の JMI は検索キーが中央の商品番号より小さいときに RTSET へ進み，行20で右端を MID−1 に狭める。' +
        'キー ' + key + ' のとき，比較する商品番号は' + checked.join('，') + 'の順なので，行20を' + rightUpdates + '回実行する。' +
        '一致すれば在庫量を読み，範囲が空になれば初期値−1のまま返る。RPUSH・RPOPで他の汎用レジスタを元に戻す。',
      contexts: [spring2005PmReference('IPA公式付属資料　アセンブラ言語の仕様', [61, 62, 63, 64, 65, 66])],
    };
  });
