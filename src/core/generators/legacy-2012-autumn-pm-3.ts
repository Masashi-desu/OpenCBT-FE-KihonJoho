import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2012-autumn-pm-01-04-shared';
import { draw } from './legacy-2012-autumn-pm-01-04-figures';
import { mimeCases, mimeLines } from './legacy-2012-autumn-pm-01-04-models';

const qp = 'quoted-printable';
const b64 = 'base64';
const encodings = [
  [b64, qp, b64, qp], [b64, qp, qp, b64], [qp, b64, b64, qp], [qp, b64, qp, b64],
];

function quotedByte(byte: number) {
  return byte < 0x20 || byte > 0x7e || byte === 0x3d ? '=' + byte.toString(16).toUpperCase().padStart(2, '0') : String.fromCharCode(byte);
}

function example(index: number) {
  const input = mimeCases[index], bytes = new TextEncoder().encode(input.sample);
  const literal = [...bytes].map(quotedByte).join('').replaceAll(' ', '△');
  const base64 = btoa(String.fromCharCode(...bytes));
  return input.base64First ? [base64, literal] : [literal, base64];
}

function lengths(count: number) { return [4 * Math.ceil(count / 3), 3 * count, 4 * count, 9 * count]; }
function delimiters(names: string[]) {
  return [...names.map(name => '--' + name), ...names, ...names.map(name => name + '--')];
}

export function autumn2012Pm3Pages(index: number) {
  const input = mimeCases[index], encoded = example(index), { names } = mimeLines(index);
  const shown = input.sample.replaceAll(' ', '△');
  return [
    [
      p('問3　電子メールで用いるMIME形式に関する次の記述を読んで，設問1，2に答えよ。'),
      p(index === 0
        ? 'インターネットの電子メールは，規格上，US-ASCIIのような7ビット符号で書かれたテキストしか送信できない。そのため，UTF-8のような8ビット符号で書かれたテキストや，画像データなどのバイナリデータを電子メールで送信する際は，MIME（Multipurpose Internet Mail Extensions）と呼ばれる書式（以下，MIME形式という）に従ってメッセージを作成する。'
        : 'ここでは，電子メールでUS-ASCIIのような7ビット符号で書かれたテキストだけを送信できる経路を想定する。UTF-8で書かれたテキストや，画像データなどのバイナリデータを送信する際は，MIME（Multipurpose Internet Mail Extensions）と呼ばれる書式（以下，MIME形式という）に従ってメッセージを作成する。'),
      p('MIME形式では，7ビット符号で書かれたテキスト以外のコンテンツを，base64やquoted-printableなどの方式で7ビット符号に変換（以下，エンコードという）する。ただし，エンコードを行うコンピュータのメモリ上では，7ビット符号を，先頭に0のビットを1ビット付加した8ビット（1バイト）として取り扱う。'),
      p('base64によるエンコードでは，コンテンツを先頭から6ビットごとに区切り，各6ビットを，ビットパターンごとに定められた，US-ASCIIの図形文字1文字に変換する。'),
      p('一方，quoted-printableによるエンコードでは，コンテンツをバイト列とみなし，US-ASCIIの制御文字又は図形文字“=”と一致するバイト，及び先頭ビットが1のバイトを，“=XX”（XXは2桁の16進数字列）の形の3文字のUS-ASCIIの図形文字列に置き換える。US-ASCIIの図形文字（“=”を除く）と一致するバイトは置き換えない。幾つかの例外があるが，ここでは考慮しなくてよいものとする。'),
      p('例えば，UTF-8で書かれたテキスト“' + shown + '”（“©”には16進数でC2A9の2バイトの符号が，他の文字にはUS-ASCIIと同じ1バイトの符号が，それぞれ割り当てられている）を［a1］でエンコードすると“' + encoded[0]
        + '”になる。同じテキストを［a2］でエンコードすると“' + encoded[1] + '”となり，いずれもUS-ASCIIに含まれる図形文字だけから成る7ビット符号のバイト列となる。ここで，“△”は空白（符号は16進数で20）を表すものとする。'),
      p('エンコード後のデータ量に着目すると，大部分がUS-ASCIIに含まれる図形文字で構成されているテキストのエンコードには［a3］が適しており，バイナリデータのエンコードには［a4］が適している。'),
    ],
    [
      p('UTF-8では，平仮名1文字に先頭ビットが1であるバイト三つから成る符号を割り当てているので，UTF-8で書かれた' + input.hiragana + '文字の平仮名から成るテキストをquoted-printableでエンコードすると，［b］文字の文字列となる。'),
      p('設問1　記述中の空欄に入れる正しい答えを，解答群の中から選べ。ただし，a1〜a4に入れる答えは，aに関する解答群の中から組合せとして正しいものを選ぶものとする。'),
      table('aに関する解答群', ['選択肢', 'a1', 'a2', 'a3', 'a4'], encodings.map((row, i) => ['アイウエ'[i], ...row])),
      ...bank('bに関する解答群', lengths(input.hiragana)),
    ],
    [
      p('設問2　MIME形式を使用すると，1通の電子メールに複数のコンテンツを格納することができる。1通の電子メールに二つのコンテンツを格納したMIME形式のメッセージは，図1のようになる。'),
      draw('message', [0], '図1　二つのコンテンツを格納したMIME形式のメッセージ'),
      p('boundary="delimiter"のdelimiterには，格納したコンテンツの区切りを示す文字列を指定する。delimiterの先頭に“--”を付けたものが一つのコンテンツの開始を示し，delimiterを“--”で囲ったものが最後のコンテンツの終了を示す。delimiterには，コンテンツに含まれる行が，誤ってコンテンツの区切りと認識されることのないような文字列を，選択しなければならない。'),
      p('“コンテンツごとの属性を示すヘッダ”には，テキストや画像などのコンテンツの種類や，エンコードの方式などを指定する。エンコードの方式には“base64”や“quoted-printable”のほか，コンテンツがエンコードされていない7ビット符号のテキストであることを示す“7bit”などが指定できる。'),
      p('図1中の“コンテンツ1”が7ビット符号のテキストであって，図2に示す3行をコンテンツに含むとき，delimiterとしてふさわしくない文字列を，解答群の中から三つ選べ。'),
    ],
    [
      draw('mimeLines', [index], '図2　“コンテンツ1”に含まれる3行'),
      ...bank('解答群', delimiters(names)),
    ],
  ];
}

export const legacy2012AutumnPm3Definition = define(3, '電子メールのMIME形式', '設問1 a=エ・b=エ、設問2=オ・カ・ケ（3項選択）',
  'UTF-8の例・平仮名数・境界候補と内容行', '符号化例，平仮名の文字数，境界文字列の候補と衝突する内容行を変えます。',
  'p.13〜16。7ビット符号の8ビット格納・quoted-printableの例外省略・空白記号△・3バイトUTF-8を保持。ASCII中心テキストとバイナリの方式の対比、長さの桁数、表の4行、3行図と9択の順、同一欄の3項選択を維持。RFCは技術事実だけ照合し、MIME図と例はIPA出典を保持。',
  index => {
    const input = mimeCases[index], { names, lines } = mimeLines(index), candidates = delimiters(names);
    const collisions = candidates.flatMap((delimiter, i) => lines.some(line => line === '--' + delimiter || line === '--' + delimiter + '--') ? [i] : []);
    const length = input.hiragana * 9;
    const result = answers([
      encodings.map(row => [table('符号化方式の組合せ', ['a1', 'a2', 'a3', 'a4'], [row])]),
      strings(lengths(input.hiragana).map(String)), strings(candidates),
    ], [
      single('a', '設問1 a', 0, input.base64First ? 1 : 3),
      single('b', '設問1 b', 1, 3),
      { ids: ['s2-choice-1', 's2-choice-2', 's2-choice-3'], labels: ['設問2', '設問2・選択2', '設問2・選択3'], bank: 2, correct: collisions },
    ]);
    return {
      prompt: autumn2012Pm3Pages(index).flat(),
      ...result,
      partAnswers: result.partAnswers!.map(answer => answer.kind === 'unordered' ? { ...answer, presentation: 'checklist' } : answer),
      explanation: '符号化例のうち“=C2=A9”で始まるものはquoted-printable，6ビットごとに置換するものはbase64。ASCIIの図形文字が主体なら置換を抑えられるquoted-printableが適し，バイナリではbase64の方が増加を抑えやすい。平仮名'
        + input.hiragana + '文字はUTF-8で' + (input.hiragana * 3) + 'バイト，各バイトが3文字になるので' + length
        + '文字。内容行が開始の“--delimiter”又は終了の“--delimiter--”に一致する境界候補は，'
        + collisions.map(i => candidates[i]).join('，') + 'である。',
    };
  });
