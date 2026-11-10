import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2012-spring-pm-09-13-support';
import { booksSheet, historySheet, usersSheet } from './legacy-2012-spring-pm-13-data';
import { spring2012PmPageAssetId, spring2012PmReference } from './legacy-2012-spring-pm-materials';

const books = languageFigure(13, 'books-sheet', '図1 ワークシート“図書情報”', index => ({
  kind: 'grids', tables: [booksSheet(index)], note: '行203については設問2で説明する。',
}));
const users = languageFigure(13, 'users-sheet', '図2 ワークシート“利用者情報”', index => ({
  kind: 'grids', tables: [usersSheet(index)],
}));
const history = languageFigure(13, 'history-sheet', '図3 ワークシート“貸出履歴”', index => ({
  kind: 'grids', tables: [historySheet(index)],
}));
const sim = languageFigure(13, 'similarity-definition', '利用者iとjの類似度の定義', () => ({
  kind: 'output', text: '        ⎧ Σ(k=1〜200)(xₖᵢ × xₖⱼ) / 200    (i ≠ j)\nsᵢⱼ ＝  ⎨\n        ⎩ 0                               (i = j)',
}));
const recomm = languageFigure(13, 'recommendation-definition', '利用者iへの図書kの推薦度の定義', () => ({
  kind: 'output', text: '        ⎧ 0                       (xₖᵢ = 1 又は図書ID kの図書が貸出し中の場合)\nrₖᵢ ＝  ⎨\n        ⎩ Σ(j=1〜50)(sᵢⱼ × xₖⱼ)   (それ以外)',
}));
export const q13Figures = [books, users, history, sim, recomm];

const lookup = (value: string, column: number) => `垂直照合(${value}, 利用者情報!A$2〜C$51, ${column}, 0)`;
const attributeRange = '利用者情報!G$2〜I$5';
const borrowerRange = '図書情報!C$2〜C$201';
const overdueRange = '図書情報!F$2〜F$201';
const bookRelative = '相対(図書情報!A1, K, 2)';
const readRelative = '相対(A1, K, B204)';
const borrowCondition = (book: string, remaining: string, overdue: string) =>
  `論理積(相対(A1, B203, 2) ${book} null, 相対(利用者情報!A1, D203, 3) ${remaining} 0,\n       相対(利用者情報!A1, D203, 4) ${overdue} '*')`;
const alternateProduct = (x: string, y: string) => `相対(A1, ${x}) * 相対(A1, ${y})`;
const references = [3, 4, 82, 83, 84, 85, 86, 87] as const;
const contexts = [
  spring2012PmReference('疑似言語の記述形式（公式共通資料）', references.slice(0, 2)),
  spring2012PmReference('表計算ソフトの機能・用語（公式付属資料）', references.slice(2)),
];

const borrowing = `○マクロ：Borrowing
▲ ［e］                             /* 貸出し可能か？ */
│ ・相対(A1, B203, 2) ← D203
│ ・相対(A1, B203, 3) ← I1
│ ・B203 ← null
│ ・D203 ← null
▼`;
const recommendBooks = `○マクロ：RecommendBooks
○数値型：J, K, NumBook, NumUser
・NumBook ← 200
・NumUser ← 50
■ J : 1, J ≦ NumUser, 1
│ ・相対(A1, 201, J) ← 0
│ ▲ B204 ≠ J
│ │ ■ K : 1, K ≦ NumBook, 1
│ │ │ ・相対(A1, 201, J) ← 相対(A1, 201, J) ＋ ［f］
│ │ ■
│ │ ・相対(A1, 201, J) ← 相対(A1, 201, J) ／ NumBook
│ ▼
■
■ K : 1, K ≦ NumBook, 1
│ ・相対(A1, K, 51) ← 0
│ ▲ ［g］
│ │ ■ J : 1, J ≦ NumUser, 1
│ │ │ ・相対(A1, K, 51) ← 相対(A1, K, 51) ＋ ［h］
│ │ ■
│ ▼
■`;

export const q13 = createLanguageDefinition(13, '図書の貸出し管理と利用履歴による推薦', '日付・貸出期限・利用者属性・貸出履歴の入力',
  'abcdefgh', '設問1 a=オ，b=ウ，c=ウ，d=キ／設問2 e=ア／設問3 f=カ，g=ア，h=キ',
  '原冊子p.63〜70。セル番地・空値・下限0・絶対参照・3条件の論理積・i=jの除外・類似度の分母200・貸出中と既読の除外を維持する。日付、貸出日数・上限・対象ID、履歴の条件を変え、行列から図表を再計算する。式の正答が固定なのはシート位置と貸出・推薦の規則を維持するため。図の省略行は原問の表示を保ち、基準図の見える値に一致する整合した計算例を使う。', i => ({
    pages: [
      page(63, [
        p('問13 次の表計算，ワークシート及びマクロの説明を読んで，設問1〜3に答えよ。'),
        heading('〔表計算の説明〕'),
        p('表計算ソフトを用いて，ある大学学部所有の図書を管理するプロトタイプシステムを作成した。プロトタイプシステムは“図書情報”と“利用者情報”の二つのワークシートから成る。'),
        heading('〔ワークシート：図書情報〕'),
        p('学部で所有している図書のうち200冊を抽出し，図1のワークシート“図書情報”を作成した。'), books.block(i),
        p('（1）セルB2〜B201には，該当する図書名を入力する。セルA2〜A201には，1から始まる連番で図書IDを入力する。'),
        p('（2）セルC2〜C201には，図書が貸出し中であれば，借りた利用者の利用者IDを入力する。そうでなければ空値である。'),
        p('（3）セルD2〜D201には，図書が貸出し中であれば，貸し出した日付を入力する。そうでなければ空値である。'),
        p('（4）セルE2〜E201には，返却期日を算出して格納する。貸出し中でなければ空値'),
      ]),
      page(64, [
        p('である。'),
        p('（5）セルF2〜F201には，返却期日を過ぎても返却されていない図書に関して，延滞日数を求める式を入力する。この式は，返却期日を過ぎていなければ0に，貸出し中でなければ空値になる。'),
        p('（6）セルI1には，本日の日付を求める式を入力する。'),
        p('（7）日付の表記はyy-mm-ddで表示されるが，表計算ソフトの内部では1970年1月1日からの経過日数を整数値で保持している。計算にはこの値を利用する。'),
        heading('〔ワークシート：利用者情報〕'),
        p('利用対象者を50名抽出し，利用者ごとの情報から図2に示すワークシート“利用者情報”を作成した。'), users.block(i),
        p('（1）セルB2〜B51には，氏名を入力する。セルA2〜A51には，1から始まる連番で利用者IDを入力する。'),
        p('（2）セルC2〜C51には，属性（教員，大学院生，学部生，その他）を入力する。'),
        p('（3）セルD2〜D51には，貸出上限までの現在の残り冊数（以下，残り貸出冊数という）を求める式を入力する。'),
        p('（4）セルE2〜E51には，延滞状態の図書が1冊でもあれば“＊”に，延滞状態の図書が無いときは空値になる式を入力する。'),
        p('（5）セルG2〜G5には属性の名称を，セルH2〜H5とセルI2〜I5には，それぞれの属性に応じた貸出上限冊数と貸出日数を入力する。'),
      ]),
      page(65, [
        p('設問1 ワークシート“図書情報”及び“利用者情報”に関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        p('返却期日を算出するために，次の式をワークシート“図書情報”のセルE2に入力し，セルE3〜E201に複写する。'),
        code('IF(C2 ≠ null, ［a］, null)', 'text'),
        p('延滞日数を算出するために，次の式をワークシート“図書情報”のセルF2に入力し，セルF3〜F201に複写する。'),
        code('IF(C2 ≠ null, ［b］, null)', 'text'),
        p('残り貸出冊数を算出するために，次の式をワークシート“利用者情報”のセルD2に入力し，セルD3〜D51に複写する。'),
        code('［c］', 'text'),
        p('延滞状態を表示するために，次の式をワークシート“利用者情報”のセルE2に入力し，セルE3〜E51に複写する。'),
        code('［d］', 'text'),
      ], [bank(1, 'a', [
        `D2＋垂直照合(C2, ${attributeRange}, 3, 0)`, `D2＋${lookup('C2', 1)}`, `D2＋${lookup('C2', 3)}`,
        `D2＋垂直照合(${lookup('C2', 1)}, ${attributeRange},\n     3, 0)`,
        `D2＋垂直照合(${lookup('C2', 3)}, ${attributeRange},\n     3, 0)`,
        'D2＋水平照合(C2, 利用者情報!A$2〜C$51, 1, 0)',
        `D2＋水平照合(${lookup('C2', 1)}, ${attributeRange},\n     3, 0)`,
        `D2＋水平照合(${lookup('C2', 3)}, ${attributeRange},\n     3, 0)`,
      ], 'オ', 'text')]),
      page(66, [
        p('設問2 利用者が図書を借りる際，その情報を登録するマクロ Borrowing をワークシート“図書情報”に格納した。ワークシート“図書情報”のセルB203に図書IDを，セルD203に利用者IDを入力して，マクロ Borrowing を実行すると，次に示す三つの条件を満たすとき，貸出登録される。'),
      ], [
        bank(1, 'b', ['E2 − I$1', 'I$1 − E2', 'IF(E2 ≧ I$1, 0, I$1 − E2)', 'IF(E2 ≧ I$1, E2, I$1)', 'IF(E2 ≧ I$1, I$1, E2)', 'IF(E2 ≧ I$1, I$1 − E2, 0)'], 'ウ', 'text'),
        bank(1, 'c', [2, 3].flatMap(column => [
          `垂直照合(C2, G$2〜I$5, ${column}, 0)`,
          `垂直照合(C2, G$2〜I$5, ${column}, 0) ＋ 条件付個数(${borrowerRange}, = A2)`,
          `垂直照合(C2, G$2〜I$5, ${column}, 0) − 条件付個数(${borrowerRange}, = A2)`,
        ]), 'ウ', 'text'),
        bank(1, 'd', [
          "IF(D2 ＞ 0, '*', null)", "IF(D2 ＝ 0, '*', null)",
          `IF(合計(${borrowerRange}) ＝ C2, '*', null)`, `IF(合計(${borrowerRange}) ≠ C2, '*', null)`,
          `IF(合計(${overdueRange}) ＝ F2, '*', null)`, `IF(合計(${overdueRange}) ≠ F2, '*', null)`,
          `IF(条件付合計(${borrowerRange}, = A2, ${overdueRange}) ＞ 0, '*',\n   null)`,
          `IF(条件付合計(${borrowerRange}, = A2, ${overdueRange}) ＝ 0, '*',\n   null)`,
        ], 'キ', 'text'),
      ], [-1, -1, -1]),
      page(67, [
        p('（1）対象図書が貸出し中でない。'), p('（2）対象利用者の残り貸出冊数が1以上である。'),
        p('（3）対象利用者が現在借りている全ての図書が延滞状態でない。'),
        p('空欄に入れる正しい答えを，解答群の中から選べ。'), heading('〔マクロ：Borrowing〕'), code(borrowing, 'pseudocode'),
      ], [bank(2, 'e', ['＝', '≠'].flatMap(book => ['＞', '＝'].flatMap(remaining => ['≠', '＝'].map(overdue =>
        borrowCondition(book, remaining, overdue)))), 'ア', 'text')]),
      page(68, [
        p('設問3 全利用者の過去の貸出履歴に基づき図書を推薦する機能について検討するために，ワークシート“貸出履歴”及びマクロ RecommendBooks を作成した。'),
        heading('〔ワークシート：貸出履歴〕'), history.block(i),
        p('（1）図書IDをセルA2〜A201に，利用者IDをセルB1〜AY1に入力する。セルB2〜AY201には，利用者が図書を借りたことがあるならば1を，無ければ0を入力する。'),
        p('（2）セルB204に利用者IDを入力してマクロ RecommendBooks を実行すると，セルAZ2〜AZ201にその利用者に対する個々の図書の推薦度の値を表示する。'),
        p('（3）利用者IDにiを指定したとき，各図書の推薦度は次の方法で算出する。'),
        p('① 指定した利用者と残りの全ての利用者間の類似度を数値で表現し，セルB202〜AY202に求める。利用者IDがi，jの利用者間の類似度は，次式で定義する sᵢⱼ で表現する。'),
        sim.block(i),
        p('ここで，xₖᵢは，利用者ID iの利用者が，図書ID kの図書を借りたことがあるならば1，そうでなければ0である。'),
        p('② 利用者ID iの図書ID kに対する推薦度 rₖᵢ は類似度 sᵢⱼ を用いて表現し，セ'),
      ]),
      page(69, [
        p('ルAZ2〜AZ201に表示する。'), recomm.block(i),
        p('マクロ RecommendBooks 中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        heading('〔マクロ：RecommendBooks〕'), code(recommendBooks, 'pseudocode'),
      ]),
      page(70, [], [
        bank(3, 'fh', [
          alternateProduct('B204, K', 'J, K'), alternateProduct('B204, K', 'K, J'),
          alternateProduct('J, K', 'J, K'), alternateProduct('J, K', 'K, 51'),
          alternateProduct('J, K', 'K, J'), alternateProduct('K, B204', 'K, J'),
          alternateProduct('K, J', '201, J'), alternateProduct('K, J', '201, K'),
        ], 'カキ', 'text'),
        bank(3, 'g', ['論理積', '論理和'].flatMap(operation => [0, 1].flatMap(read =>
          ['＝', '≠'].map(loan => `${operation}(${readRelative} ＝ ${read}, ${bookRelative} ${loan} null)`))), 'ア', 'text'),
      ]),
    ],
    contexts,
    explanation: 'aでは利用者IDを利用者情報の第1列で照合して第3列の属性を得る。その属性を右側の表で照合して第3列の貸出日数を得て，貸出日に足す。bは期日を過ぎた日数だけを計上し，期日以前を0とする。cは属性ごとの上限から同じ利用者IDの貸出数を引く。dは同じ利用者の延滞日数の合計が正のときに印を付ける。eでは対象図書の利用者IDが空，利用者の残り冊数が正，利用者に延滞の印がないという三条件が全て必要。fは行Kで指定利用者と利用者Jの貸出有無を掛け，gは指定利用者に貸出履歴がなく現在も貸出し中でない場合だけ真。hでは同じ利用者Jの貸出有無と行202の類似度を掛けて足す。',
  }), { fixedReferenceAssetIds: references.map(spring2012PmPageAssetId), answerVariation: 'fixed' });
