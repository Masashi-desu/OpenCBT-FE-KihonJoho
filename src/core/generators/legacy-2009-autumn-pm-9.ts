import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-autumn-pm-09-13-support';

type Pair = readonly [readonly string[], readonly string[]];
type Case = { example: readonly string[]; addends: readonly [Pair, Pair] };
const cases: readonly Case[] = [
  { example: ['46284', '059827463', '859201283', '844157134', '007652918', '723147641'],
    addends: [
      [['231456813', '123456789', '234567890', '478617283'], ['999999999', '123456789', '009283741']],
      [['85923', '726438423', '734239982', '017238764', '500000000', '321987472'],
        ['5472937', '726325476', '292278313', '499999999', '783917811']],
    ] },
  { example: ['57360', '101405908', '662905117', '096380024', '327654991', '001209803'],
    addends: [
      [['13540', '183055014', '742098512', '200000000', '620409883'], ['3240892', '367514812', '800000000', '510378433']],
      [['30918', '565431752', '114237980', '050004983', '600000000', '375109457'],
        ['2742316', '241231427', '809874231', '399999999', '495017506']],
    ] },
  { example: ['19482', '256237200', '499017608', '010110033', '598902486', '831500052'],
    addends: [
      [['407523', '382536800', '195708411', '790151010', '467231005', '271405829'], ['1038194', '202315661', '510120821']],
      [['17221', '415902987', '139250993', '893823001', '730000000', '300000000'],
        ['5291379', '879439813', '310219012', '270000000', '700000000']],
    ] },
  { example: ['73125', '054914064', '617549868', '408261023', '009761315', '595054700'],
    addends: [
      [['841423760', '999999999', '900000000', '580241927'], ['8150416', '100000000', '589654461']],
      [['54145', '651413275', '472991632', '543872177', '750000000', '875407621'],
        ['2941233', '259267811', '211050884', '200000000', '571081659']],
    ] },
];

function carries([left, right]: Pair) {
  const iterations = Math.max(left.length, right.length);
  let totalCarries = 0;
  let carry = 0;
  for (let i = 1; i <= iterations; i++) {
    const sum = Number(left.at(-i) ?? 0) + Number(right.at(-i) ?? 0) + carry;
    carry = sum >= 1_000_000_000 ? 1 : 0;
    totalCarries += carry;
  }
  return { iterations, totalCarries };
}
const example = languageFigure(9, 'decimal-chunks', '図 正の多倍長整数の格納例', index => {
  const { example } = cases[index];
  return { kind: 'tables', tables: [
    { headers: [], showHeaders: false, rows: [['切分け', ...example]] },
    { headers: ['要素番号', ...example.map((_, i) => String(example.length - i - 1))],
      rows: [['配列data', ...example.map(group => String(Number(group)))]] },
  ] };
});
const inputPairs = languageFigure(9, 'addition-pairs', '設問2の多倍長整数', index => {
  const pairs = cases[index].addends;
  return { kind: 'tables', tables: pairs.map(([left, right], i) => {
    const columns = Math.max(left.length, right.length);
    const align = (parts: readonly string[]) => [...Array<string>(columns - parts.length).fill(''), ...parts];
    return { headers: [], showHeaders: false, rows: [[`（${i + 1}）`, ...align(left)], ['', ...align(right)]] };
  }) };
});
export const q9Figures = [example, inputPairs];

const c = (source: string) => code(source, 'c');
const typeDeclaration = `typedef struct{
           int length;
           long data[ARRAY_MAX];
        }MP;`;
const mainCode = String.raw`#include <stdio.h>
#include <string.h>

#define ARRAY_MAX 100
#define NUM_DIGIT 9
#define NUM_DIGIT_TH_POWER_OF_TEN 1000000000

${typeDeclaration}

void set(MP*, const char[]);
void print(const MP*);
void add(const MP*, const MP*, MP*);

/* 文字列から多倍長整数を扱う構造体に変換 */
void set(MP *num, const char str[]){
   int str_idx = strlen(str) - 1;
   int num_idx = 0;
   int i;
   long mul;

   while(［a］){
      num->data[num_idx] = 0;
      mul = 1;
      for(i = 0; ［b］; i++){
         num->data[num_idx] += mul * (str[str_idx--] - '0');
         mul ［c］;
      }
      num_idx++;
   }
   num->length = num_idx;
}

/* 多倍長整数の出力 */
void print(const MP *num){
   int i;

   printf("%ld", num->data[num->length - 1]);
   for(［d］){
      /* ゼロ詰めして必ず9けたを表示する。 */
      printf("%09ld", num->data[i]);
   }
   printf("\n");
}`;
const addCode = `/* 二つの多倍長整数の加算 */
void add(const MP *a, const MP *b, MP *c){
   int i;
   int i_max;

   if(a->length > b->length){
      i_max = a->length;
   }else{
      i_max = b->length;
   }
   c->data[0] = 0;

   for(i = 0; i < i_max; i++){
      if(i < a->length) c->data[i] += a->data[i];
      if(i < b->length) c->data[i] += b->data[i];

      if(c->data[i] >= NUM_DIGIT_TH_POWER_OF_TEN){  /* ← α */
         c->data[i + 1] = 1;                       /* ← β */
         c->data[i] -= NUM_DIGIT_TH_POWER_OF_TEN;
      }else{
         c->data[i + 1] = 0;
      }
   }
   if(c->data[i] == 0){
      c->length = i;
   }else{
      c->length = i + 1;
   }
}`;

const letters = 'アイウエオカキク';
export const q9 = createLanguageDefinition(9, 'C：正の多倍長整数の入出力と加算', '格納例と加算する二組の多倍長整数', 'abcdefg',
  '設問1 aオ bウ cイ dエ／設問2 eオ fイ gエ',
  '下位から9けたずつ格納するMP型、set・print・addの処理、字下げ、α・βの指示位置、二設問7欄を維持する。格納例と二組の加数を変え、加算の反復数と繰上がり数を変える。',
  index => {
    const { example: digits, addends } = cases[index];
    const first = carries(addends[0]);
    const second = carries(addends[1]);
    const keys = [first.iterations, first.totalCarries, second.totalCarries].map(n => letters[n]).join('');
    return {
      pages: [
        page(39, [
          p('次の問9から問13までの5問については，この中から1問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。'),
          p('問9 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('C言語では整数型の変数に格納できる値には上限がある。これを超える正の整数（以下，正の多倍長整数という）の入出力と加算を行うプログラムである。'),
          p('（1）正の多倍長整数は，次に示すMP型の構造体を用いて表現する。'), c(typeDeclaration),
          p('正の多倍長整数を，下位から9けたずつに切り分けて，構造体MPのメンバである配列dataの要素番号の小さい方から順番に値を格納する。例えば，'
            + digits.join('') + 'という整数の場合，図のとおりになる。'),
          example.block(index),
          p('構造体のメンバlengthには，実際に値を格納した要素数を入れる。図の場合は' + digits.length + 'である。'),
        ]),
        page(40, [
          p('（2）関数の仕様は，次のとおりである。'),
          c('void set(MP *num, const char str[]);'),
          p('引数：num MP型の構造体で表現された多倍長整数。str 文字列で表現された多倍長整数であって，1〜9の数字で始まる。'),
          p('機能：文字列で与えられた多倍長整数strを変換して，MP型の構造体numに格納する。numのメンバdataは，変換後の数値を格納するのに十分な要素数が確保されているものとする。'),
          p('返却値：なし'), c('void print(const MP *num);'),
          p('引数：num MP型の構造体で表現された多倍長整数。'), p('機能：多倍長整数を出力する。'), p('返却値：なし'),
          c('void add(const MP *a, const MP *b, MP *c);'),
          p('引数：a，b，c MP型の構造体で表現された多倍長整数であり，cは，a及びbではないものとする。'),
          p('機能：二つの多倍長整数a，bの和を多倍長整数cに格納する。cのメンバdataは，加算処理を行うのに十分な要素数が確保されているものとする。'),
          p('返却値：なし'), p('（3）次のライブラリ関数を用いる。'),
          c('size_t strlen(const char *s);'), p('機能：sが指す文字列の長さを計算する。'),
          p('返却値：終端を示すナル文字に先行する文字の個数を返す。'),
        ]),
        page(41, [p('〔プログラム〕'), c(mainCode)]),
        page(42, [c(addCode), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['str_idx != 0', 'str_idx < 0', 'str_idx <= 0', 'str_idx > 0', 'str_idx >= 0'], 'オ', 'c'),
          bank(1, 'b', ['i < NUM_DIGIT', 'i < NUM_DIGIT && str_idx <= 0', 'i < NUM_DIGIT && str_idx >= 0',
            'i < NUM_DIGIT || str_idx <= 0', 'i < NUM_DIGIT || str_idx >= 0'], 'ウ', 'c'),
        ]),
        page(43, [
          p('設問2 プログラムの動作について，次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('関数addを用いて以下の（1）に示す二つの多倍長整数を加算する場合，プログラム中のα部分は［e］回実行され，β部分は［f］回実行される。また，以下の（2）に示す二つの多倍長整数を加算する場合，β部分は［g］回実行される。'),
          inputPairs.block(index),
        ], [
          bank(1, 'c', ['%= 10', '*= 10', '+= 10', '-= 10', '/= 10'], 'イ', 'c'),
          bank(1, 'd', ['i = 0; i <= num->length - 1; i++', 'i = 0; i <= num->length - 2; i++',
            'i = num->length - 1; i >= 0; i--', 'i = num->length - 2; i >= 0; i--'], 'エ', 'c'),
          { ...bank(2, 'efg', Array.from({ length: 8 }, (_, i) => String(i)), keys), label: 'e〜gに関する解答群' },
        ], [-1, -1, 2]),
      ],
      explanation: 'a：添字0の文字を処理するまで続ける。b：一要素のけた数の上限に達するか，元の文字列の先頭を処理し終えると内側の繰返しを止める。'
        + 'c：右から左へ進むごとに重みを10倍する。d：最上位の要素は表示済みなので，その一つ下から要素0まで，9けたにそろえて出力する。'
        + 'e：αは長い方の要素数と同じ' + first.iterations + '回。f：βは要素の和と繰上がりの合計が10億に達するたびに実行し，（1）では'
        + first.totalCarries + '回。（2）では同じ条件に' + second.totalCarries + '回達するのでgは' + second.totalCarries + 'である。',
    };
  });
