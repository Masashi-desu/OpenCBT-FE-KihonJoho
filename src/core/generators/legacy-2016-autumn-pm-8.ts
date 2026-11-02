import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, table, type GeneratedBody } from './definition';
import { autumn2016PmReference, autumn2016PmPageAssetId } from './legacy-2016-autumn-pm-materials';
import { autumn2016Pm0508Index, autumn2016Pm0508NativeBody, autumn2016Pm0508Body, autumn2016Pm0508Figure, paragraphChoices } from './legacy-2016-autumn-pm-05-08-shared';

export const autumn2016Pm8WhiteControl = '□', autumn2016Pm8BlackControl = '■';
/** Managed translation of the nine source table rows. This helper supplies
 * displayed table3 outputs; tests use a separate declarative formatter and a
 * source-table transition oracle rather than calling this for expectations. */
export function autumn2016Pm8Edit(pattern: string, value: string): string {
  const controls = [...pattern].filter(c => c === '□' || c === '■').length;
  if (!pattern.length || !/^\d+[+-]$/.test(value) || value.length !== controls + 1 || /^0+-$/.test(value)) throw Error('INVALID_EDIT_INPUT');
  const output = [...pattern], fill = pattern[0]; let signif = false, v = 0;
  for (let pos = 0; pos < output.length; pos++) {
    const char = output[pos];
    if (char === '□' || char === '■') {
      if (!signif && char === '□' && value[v] === '0') output[pos] = fill;
      else if (!signif && value[v] === '0') { output[pos] = fill; signif = value[v + 1] !== '+'; }
      else { output[pos] = value[v]; signif = value[v + 1] !== '+'; }
      v++;
    } else if (!signif) output[pos] = fill;
  }
  return output.join('');
}
export function autumn2016Pm8Model(values: number[]) {
  const index = autumn2016Pm0508Index(values), digits = ['12', '34', '56', '78'][index];
  const rows = [[' □□,□□□', '01234+'], ['*□□,□□□#', '00000+'], ['*□□□.□□#', `000${digits}-`], ['*□□■.□□#', `000${digits}+`]];
  const aBank = ['*******#', '********', '******0#', '******0*'];
  const bcBank = [`*****${digits}#`, `*****${digits}*`, `****.${digits}#`, `****.${digits}*`, `***0.${digits}#`, `***0.${digits}*`];
  const outputs = rows.map(([pattern, value]) => autumn2016Pm8Edit(pattern, value));
  return { index, digits, rows, outputs, aBank, bcBank,
    answers: [aBank.indexOf(outputs[1]), bcBank.indexOf(outputs[2]), bcBank.indexOf(outputs[3]), 1, 3, 3] };
}
export const autumn2016Pm8CaseRows = [
  ['1', '□', 'off', '0', '網掛け（判定しない）', 'fill文字', 'off'],
  ['2', '■', 'off', '0', '＋以外', 'fill文字', 'on'],
  ['3', '■', 'off', '0', '＋', 'fill文字', 'off'],
  ['4', '□又は■', 'off', '1〜9', '＋以外', 'Value[v]', 'on'],
  ['5', '□又は■', 'off', '1〜9', '＋', 'Value[v]', 'off'],
  ['6', '□又は■', 'on', '0〜9', '＋以外', 'Value[v]', 'on'],
  ['7', '□又は■', 'on', '0〜9', '＋', 'Value[v]', 'off'],
  ['8', '□と■以外', 'off', '網掛け（判定しない）', '網掛け（判定しない）', 'fill文字', 'off'],
  ['9', '□と■以外', 'on', '網掛け（判定しない）', '網掛け（判定しない）', 'そのまま残す', 'on'],
];
export const autumn2016Pm8DEBank = ['“1”≦Value[v] and Value[v]≦“9”', 'Value[v]＝“0”', 'Value[v＋1]＝“－”', 'Value[v＋1]＝“＋”', 'Value[v＋1]≠“－”', 'Value[v＋1]≠“＋”'];
export const autumn2016Pm8FBank = ['2，4及び7', '3，5及び7', '4及び7', '5及び7'];
export const autumn2016Pm8ProgramLines = [
  '○関数：Edit（文字型：Pattern[]，文字型：Value[]）', '○文字型：fill', '○論理型：signif', '○整数型：p，v',
  '・fill ← Pattern[0]', '・signif ← off', '・v ← 0',
  '■ p：0，p ＜ Length(Pattern[])，1　/* Length()は引数の文字列長を返す */',
  '▲ Pattern[p]＝“□” or Pattern[p]＝“■”　/* 表2のケース1〜7の処理 */',
  '現在の変数・配列要素の内容が，表2のケース1〜7のどれに該当するかを決定し，',
  'そのケースに従ってPattern[p]とsignifの更新処理を行う。',
  '・v ← v＋1', '/* 表2のケース8，9の処理 */', '▲ signif＝off', '・Pattern[p] ← fill',
];
export const autumn2016Pm8DetailLines = [
  '▲ signif＝off', '▲ Pattern[p]＝“□” and Value[v]＝“0”', '/* 何もしない */',
  '', '▲ Value[v＋1]≠“＋”', '・signif ← on',
  '▲ ［d］', '・Pattern[p] ← fill', '', '・Pattern[p] ← Value[v]',
  '', '▲ ［e］', '・signif ← off', '・Pattern[p] ← Value[v]',
];
export const autumn2016Pm8ProgramAlt = (detail = false) => detail
  ? '詳細化した疑似言語。signifがoffなら、Pattern[p]が白抜き制御文字かつValue[v]が0のとき何もしない。それ以外はValue[v+1]が＋でなければsignifをonにし、その後のd条件が真ならPattern[p]にfill、偽ならValue[v]を代入。signifが初めからonの枝では、e条件が真ならsignifをoffにし、条件外で必ずPattern[p]にValue[v]を代入する。元の単岐・双岐の境界、非実行コメント、二つの空欄を保持する。'
  : 'Editの宣言、文字型fill、論理型signif、整数型p/v。fillをPattern[0]、signifをoff、vを0で初期化。pを0からLength(Pattern[])未満まで1ずつ増やす反復。Pattern[p]が白抜き又は黒塗り制御文字なら、破線内で表2のケース1〜7を判定しPattern[p]/signifを更新し、vを1増やす。それ以外ではsignifがoffのときだけPattern[p]にfillを代入する。Length()は引数文字列の長さ。反復と両分岐の開始・終端を元の制御線で示す。';
export function autumn2016Pm8RawBody(values: number[]): GeneratedBody {
  const m = autumn2016Pm8Model(values), quoted = (items: string[]) => paragraphChoices(items.map(text => '“' + text.replaceAll(' ', '␣') + '”'));
  const result = autumn2016Pm0508Body([
    p('次の問8は必須問題です。必ず解答してください。'), p('問8 次のプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
    p('事務計算においては，数値を見やすく表示（印字）するために，例えば3桁ごとに区切りの“，”を挿入するなどの編集処理がよく行われる。'),
    p('関数Editは，指定された編集パターンに従って，数値を編集するプログラムである。表1に，関数Editを用いた編集例を示す。例1では，3桁ごとに区切りの“，”を挿入している。例2では，例1の編集に加え，上位の空いた桁を“＊”で埋めている。例3では，数値の右端から2桁目と3桁目の間に“．”を挿入している。'),
    table('表1 関数Editを用いた編集例', ['数値', '例1：␣□□,□□□', '例2：*□□,□□□', '例3：␣□□□.□□'], [['123', '␣␣␣␣123', '****123', '␣␣␣1.23'], ['1234', '␣␣1,234', '**1,234', '␣␣12.34'], ['12345', '␣12,345', '*12,345', '␣123.45']]),
    p('ここで，編集パターン中の文字“□”及び“■”は，数字と対応付けられた制御文字を表している。また，“␣”は空白文字を表している。白抜きと黒塗りの制御記号を区別する。'),
    p('〔プログラムの説明〕'),
    p('(1) 関数Editは，次の形式で呼び出され，二つの引数をもつ。関数：Edit（文字型：Pattern[]，文字型：Value[]）。Pattern[]には，編集パターンの文字列が格納されている。Value[]には，編集する数値を表す文字列が格納されている。各配列の添字は，0から始まる。文字列Pattern[]のi番目の文字は，Pattern[i－1]と表記する。文字列Value[]についても同様である。'),
    p('(2) Pattern[]は，1文字以上から成る文字列であって，表示可能な図形文字及び制御文字（“□”及び“■”）から構成される。'),
    p('(3) Value[]は，数値を表す文字列であって，数字“0”〜“9”の並びの後に，数値が正又は0なら“＋”を，負なら“－”を付加した形式である。数字の個数は，Pattern[]中の文字“□”及び“■”の個数と一致するように，必要であれば前方に“0”を付加する。例えば，Pattern[]の内容が“*□□,□□□”のとき，Value[]には，数値が123なら“00123＋”，0なら“00000＋”，－123なら“00123－”を指定する。'),
    p('(4) 関数Editは，Value[]で与えられた数値をPattern[]に従って編集し，編集結果でPattern[]を置き換える。'),
    p('〔編集方法〕Pattern[]中の各文字について，先頭から順に1文字ずつ，次の①〜③のいずれか一つの操作を実行していく。① 関数Editが呼び出されたときのPattern[]中の先頭の文字（以下，fill文字という）で置き換える。② Value[]中の対応する桁の数字で置き換える。③ 置き換えないで，そのまま残す。'),
    p('(5) 論理型変数signifは，on又はoffの値を取る。この変数の実行開始時の値はoffであり，Value[]中に最上位から“0”が連続した後に“0”でない数字が見つかるとonになる，などの使い方をする。'),
    p('(6) 関数Editが呼び出されるとき，各引数には正しい値が設定されているものとする。'),
    autumn2016Pm0508Figure(8, 'program', [m.index], '〔プログラム〕', autumn2016Pm8ProgramAlt()),
    table('表2 現在の変数・配列要素の内容に応じた更新処理', ['ケース', 'Pattern[p]', 'signif（現在）', 'Value[v]', 'Value[v＋1]', 'Pattern[p]（更新）', 'signif（更新）'], autumn2016Pm8CaseRows),
    p('注記 網掛け部分は，内容を判定しない。'),
    p('設問1 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。引数Pattern[]及びValue[]に幾つかのデータを与えて，関数Editを実行した結果を，表3に示す。'),
    table('表3 関数Editの実行結果', ['実行前のPattern[]', '実行前のValue[]', '実行後のPattern[]'], m.rows.map(([pattern, value], i) => ['“' + pattern.replaceAll(' ', '␣') + '”', '“' + value + '”', i === 0 ? '“' + m.outputs[0].replaceAll(' ', '␣') + '”' : '［' + 'abc'[i - 1] + '］'])),
    p('設問2 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。プログラム中の破線で囲んだ部分の処理（表2のケース1〜7の処理）を，詳細なプログラムとして記述すると，次のようになる。'),
    autumn2016Pm0508Figure(8, 'detail-program', [m.index], '〔プログラム中の破線部分の処理〕', autumn2016Pm8ProgramAlt(true)),
    p('設問3 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('関数Editでは，例えば，fill文字を“␣”とする編集パターンを指定することによって，数値が正なら“␣␣1,234␣”，負なら“␣␣1,234－”と編集することができる。表2のケース1〜7のうち，数値が正なら数値の後に続く文字をfill文字で置き換えるために用意されたケースは［f］である。'),
  ], [ { id: 'a', choices: quoted(m.aBank) }, { id: 'bc', choices: quoted(m.bcBank) }, { id: 'de', choices: paragraphChoices(autumn2016Pm8DEBank) }, { id: 'f', choices: paragraphChoices(autumn2016Pm8FBank) } ],
  [{ id: 'a', bank: 'a', correct: m.answers[0] }, { id: 'b', bank: 'bc', correct: m.answers[1] }, { id: 'c', bank: 'bc', correct: m.answers[2] }, { id: 'd', bank: 'de', correct: 1 }, { id: 'e', bank: 'de', correct: 3 }, { id: 'f', bank: 'f', correct: 3 }],
  `白抜き制御文字はsignifがoffで0のときfillに置き換えたままoffを保つ。黒塗り制御文字は0でも次が＋でなければonにする。そのためゼロのaは全てfillの8個の＊になる。bは小数点までoffなので小数点も＊となり“${m.outputs[2]}”，cは黒塗り制御文字により小数点の前でonになるため小数点が残り，末尾の＋でoffに戻るので“${m.outputs[3]}”となる。dはValue[v]＝0でfillを出す条件。eは最後の数字の次が＋であることを調べ，後続文字をfillで消すためoffにする条件。表2のケース5と7が，それぞれoffから/既にonから最後の正の数字を出してoffに戻る。ケース3は0をfillにする場合であり，ケース2/4はonにする。負の数は末尾－なのでonが続き，後続の図形文字を残す。配列は0始まりで，Lengthの条件を満たす間だけ反復する。`);
  result.contexts = [autumn2016PmReference('共通に使用する擬似言語の記述形式', [4, 5])];
  return result;
}
export const autumn2016Pm8Body = (values: number[]): GeneratedBody => autumn2016Pm0508NativeBody(8, values, autumn2016Pm8RawBody(values));
export const legacy2016AutumnPm8Definition: AfternoonBookletDefinition = {
  source: '2016h28a-fe-pm-8', title: '制御文字による数値編集と疑似言語の状態遷移', version: '3.3.0', reference: [0], fields: [field('編集する下位二桁の組', 0, 3)], sourceAnswer: 'イ／ア／エ／イ／エ／エ',
  notes: '原6頁、6欄、a4/bc共有6/de共有6/f4の20固有択32参照。白抜き/黒塗り制御文字、全9状態表、off/on、fill、数字個数、末尾符号、配列0始まり、Length、非実行コメント、二つの原構造疑似言語図を保持。4条件は表3のb/c実入力を12/34/56/78へ変え、全6解答文字列と正答を同じ入力から生成する。原の表1説明例だけの置換ではない。独立遷移表と宣言的formatterを別に検算し、0/最終桁/負符号と全9caseを全列挙する。',
  publicNotes: '原の数値編集規則・全解答群・疑似言語を保ち，実際に実行結果を問う数値とその選択肢を変更した問題です。',
  fixedReferenceAssetIds: [autumn2016PmPageAssetId(4), autumn2016PmPageAssetId(5)], build: autumn2016Pm8Body,
};
