import { code, p, table } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2012-autumn-pm-09-13-support';
import { languageFigure } from './legacy-2012-autumn-pm-09-13-figures';
import { lotteryCases } from './legacy-2012-autumn-pm-9-data';

function source(digits: number) {
  return [
    ' 1 #include <stdlib.h>',
    ' 2 #include <string.h>',
    '',
    ' 3 #define LOT_DNUM ' + digits + '   /* くじの桁数 */',
    ' 4 #define LOT_GNUM 6   /* くじの等級数 */',
    '',
    ' 5 void check_winning_lot(char *[], char **[LOT_GNUM],',
    ' 6                        int [LOT_GNUM]);',
    ' 7 int check_lot(char *, char *);',
    '',
    ' 8 void check_winning_lot(char *lots[],',
    ' 9                        char **win_list[LOT_GNUM],',
    '10                        int winner[LOT_GNUM]) {',
    '11     int i, j, k;',
    '',
    '12     for (i = 0; i < LOT_GNUM; i++) {',
    '13         winner[i] = 0;',
    '14         for (j = 0; lots[j] != NULL; j++) {',
    '15             for (k = 0; [a]; k++) {',
    '16                 winner[i] += check_lot(lots[j], win_list[i][k]);',
    '17             }',
    '18         }',
    '19     }',
    '20 }',
    '',
    '21 int check_lot(char *lot, char *win) {',
    '22     int lenw, result = 1, i;',
    '',
    '23     lenw = strlen(win);',
    '24     win += lenw;',
    '25     lot [b];',
    '26     for (i = 0; [c]; i++) {',
    '27         if (*(--lot) != *(--win)) {',
    '28             result = 0;',
    '29         }',
    '30     }',
    '31     return result;',
    '32 }',
  ].join('\n');
}

const selection = '次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。\nなお，2問以上マークした場合には，はじめの1問について採点します。';

export const q9 = createLanguageDefinition(9, '末尾照合によるくじの当選・前後賞の集計', 'くじの桁数と当選数字列', 'abcdef', 'エエイキエイ',
  '等級別のNULL終端表、右端からの比較、先頭の0と循環する前後賞、全6解答欄を保持する。桁数・当選番号・繰上りと繰下りの例を一緒に変更する。どの桁数や番号でも終端判定・比較開始位置・借りと繰上りの正しい式は共通なので，全解答欄の正答は固定する。', index => {
    const { digits, numbers, example } = lotteryCases[index];
    const width = (value: number) => String(value).padStart(digits, '0');
    const zero = '0'.repeat(digits);
    const last = '9'.repeat(digits);
    const next = width(Number(example) + 1), previous = width(Number(example) - 1);
    return {
      pages: [
        page(44, [
          p(selection),
          p('問9　次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\n関数 check_winning_lot は，複数本のくじのくじ番号を当選番号と比較し，当たりを確認するプログラムである。\n（1）くじ番号は，' + digits + '桁の数字から成る文字列である。数字だけから成る文字列を数字列という。\n（2）くじの当たりは1～6等の6等級から成り，図1に示すように各等級には一つ以上の当選番号がある。各等級での当選番号の桁数と個数は異なる。'),
          table('図1 当選番号の例', ['等級', '当選番号'], numbers.map((tier, i) => [i + 1 + '等', (tier[0].length === digits ? '' : '下' + tier[0].length + '桁　') + tier.join('，')])),
          p('（3）当選番号は' + digits + '桁以下の数字列であり，くじ番号の最下位桁から当選番号の桁数だけ取り出した数字列が当選番号と一致したくじが当たりとなる。\nなお，くじ番号によっては，複数の等級の当たりとなる場合もある。図1の例では，くじ番号“' + numbers[0][0] + '”のくじは，1等と6等の当たりとなる。\n（4）関数 check_winning_lot の引数は次のとおりである。ここで，引数の値に誤りはないものとする。\n　lots　　確認するくじのくじ番号表\n　win_list　当選番号表\n　winner　当選本数表'),
        ]),
        page(45, [
          p('（5）確認するくじのくじ番号表 lots の要素 lots[i] には，くじ番号の数字列へのポインタが格納されている。最後の要素 lots[N1]（N1は，確認するくじの本数）には，空ポインタ定数（NULL）が格納されている。\n（6）当選番号表 win_list の要素 win_list[i] には，i＋1等の番号表へのポインタが格納されている。win_list[i] が指す i＋1等の番号表の要素 win_list[i][j] には，当選番号の数字列へのポインタが格納されている。最後の要素 win_list[i][Ni]（Niは，i＋1等の当選番号の個数）には，図2に示すように空ポインタ定数が格納されている。'),
          languageFigure(9, 'winner-pointers', index, '図2 当選番号表の例'),
          p('（7）当選本数表 winner の要素 winner[i] には，i＋1等の当たりのくじの本数が格納される。\n（8）関数 check_winning_lot で使用している関数 check_lot と strlen の仕様は次のとおりである。'),
          code('int check_lot(char *lot, char *win);', 'c'),
          p('機能：くじ番号と当選番号を，最下位から1桁ずつ順に当選番号の桁数分だけ比較し，一致するかどうかを調べる。\n引数：lot　くじ番号\n　　　win　当選番号\n返却値：確認結果（0：一致しない，1：一致する）'),
        ]),
        page(46, [
          code('unsigned int strlen(const char *s);', 'c'),
          p('機能：文字列の長さを求める。\n引数：s　文字列\n返却値：終端を示すナル文字に先行する文字の個数'),
          p('〔プログラム〕（行番号）'), code(source(digits), 'c'),
        ]),
        page(47, [
          p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。ただし，f1とf2に入れる答えは，fに関する解答群の中から組合せとして正しいものを選ぶものとする。\nくじの当たりを増やすために，' + digits + '桁の当選番号に対して前後賞が用意されることになった。これに合わせて関数 check_winning_lot に，前後賞の当選結果を自動判定する処理を追加する。ここで，プログラム中の［　］には正しい答えが入っているものとする。\n（1）関数 check_winning_lot の引数を次のとおりに変更する。ここで，引数の値に誤りはないものとする。\n　lots　　確認するくじのくじ番号表\n　win_list　当選番号表'),
        ], [
          bank(1, 'a', ['k < LOT_DNUM', 'k <= LOT_DNUM', 'win_list[i][k] == NULL', 'win_list[i][k] != NULL', '*win_list[i][k] == NULL', '*win_list[i][k] != NULL'], 'エ', 'c'),
          bank(1, 'b', ['= lenw', '= LOT_DNUM', '+= lenw', '+= LOT_DNUM'], 'エ', 'c'),
          bank(1, 'c', ['(i < lenw) && (result == 0)', '(i < lenw) && (result == 1)', '(i < LOT_DNUM) && (result == 0)', '(i < LOT_DNUM) && (result == 1)', 'result == 0', 'result == 1'], 'イ', 'c'),
        ], [0, 0, 0]),
        page(48, [
          p('　winner　当選本数表\n　special　前後賞の当選本数表'),
          p('（2）前後賞は，' + digits + '桁の当選番号に対して用意される。例えば，当選番号“' + example + '”に対する前後賞の番号は，“' + previous + '”と“' + next + '”となる。当選番号“' + zero + '”に対する前後賞の番号は“' + last + '”と“' + width(1) + '”，“' + last + '”に対する前後賞の番号は“' + width(Number(last) - 1) + '”と“' + zero + '”とする。\n（3）前後賞の当選結果の確認は，確認するくじのくじ番号を数値とみなし，それよりも1だけ少ない数値と多い数値を表す数字列を作成し，その数字列を当選番号と比較することによって行う。このとき，くじ番号“' + zero + '”よりも1だけ少ない数値を表す数字列は“' + last + '”に，くじ番号“' + last + '”よりも1だけ多い数値を表す数字列は“' + zero + '”にする。\n（4）前後賞の当選本数表の要素 special[i] には，i＋1等の前後賞の当たりのくじの本数が格納される。\n（5）処理の追加に対応するために，プログラムを表1のとおりに変更する。'),
          languageFigure(9, 'program-changes-first', index, '表1 プログラムの変更内容'),
        ]),
        page(49, [languageFigure(9, 'program-changes-second', index, '表1 プログラムの変更内容（続き）')], [
          bank(2, 'd', ['i', 'j', 'LOT_DNUM', 'LOT_DNUM + 1', 'LOT_DNUM + i', 'LOT_DNUM + j', 'LOT_DNUM - 1', 'LOT_DNUM - i', 'LOT_DNUM - j'], 'キ', 'c'),
          bank(2, 'e', ['*lots[j]', '*lots[j] + m', '*lots[j] + m + 1', '*(lots[j] + m)', '*(lots[j] + m + 1)'], 'エ', 'c'),
          bank(2, 'f', ["f1：'0'　f2：'1'", "f1：'0'　f2：'9'", "f1：'1'　f2：'0'", "f1：'1'　f2：'9'", "f1：'9'　f2：'0'", "f1：'9'　f2：'1'"], 'イ'),
        ]),
      ],
      explanation: '当選番号の走査は，各等級のNULLで止める。くじは' + digits + '桁なので lot を LOT_DNUM 進め，lenw 桁まで，かつ不一致が見つからない間に限って右端から比較する。前後賞では添字 LOT_DNUM−1 から実際の各文字を取り出す。減算の借りでは0を9に，増算の繰上りでは9を0に変え，伝播が解決した桁でそれぞれのフラグを立てる。数字列の両端では ' + zero + ' と ' + last + ' の間を循環する。前後賞の比較対象はくじと同じ' + digits + '桁の当選番号に限る。冊子は strlen の戻り型を unsigned int と記しているが，標準Cの <string.h> では size_t である。この問題で扱う短い文字列では，長さの比較結果は同じである。',
    };
  }, { answerVariation: 'fixed' });
