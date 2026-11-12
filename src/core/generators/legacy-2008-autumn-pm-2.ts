import { code, p, table } from './definition';
import { autumn2008PmPageAssetId, autumn2008PmReference } from './legacy-2008-autumn-pm-materials';
import { answers, bankBlocks, define, single } from './legacy-2008-autumn-pm-01-05-shared';
import { draw } from './legacy-2008-autumn-pm-01-05-figures';
import { printCases } from './legacy-2008-autumn-pm-2-model';

const referencePages = [2, 3] as const;
const tableHeaders = ['引数', 'データ型', '入力／出力', '意味'];
const textArray = '整形対象の文字列を格納した1次元配列';

function printModel(index: number) {
  const { base, separator, margin, width, height, first, second } = printCases[index];
  const baseMargin = base === 0 ? 'Margin' : '(Margin + 1)';
  const bankA = [
    'CurrentP: ' + base + ', CurrentP < MaxC, 1', 'CurrentP: ' + base + ', StartP < EndP, 1',
    'CurrentP: ' + baseMargin + ', CurrentP < MaxC, 1', 'CurrentP: ' + baseMargin + ', StartP < EndP, 1',
  ];
  const bankB = ['= EOS', '= ' + separator, '≠ EOS', '≠ ' + separator].map(term => 'Str[StartP] ' + term);
  const bankC = ['EndP < (StartP + MaxC)', 'EndP < MaxC', 'StartP < (EndP + MaxC)', 'StartP < MaxC'];
  const bankD = ['= EOS', '= NL', '≠ EOS', '≠ NL'].map(term => 'CurrentP: ' + base + ', Line[CurrentP] ' + term + ', 1');
  return { base, separator, baseMargin, margin, width, height, first, second, banks: [bankA, bankB, bankC, bankD].map(list => list.map(text => [code(text)])) };
}

export function autumn2008Pm2Pages(index: number) {
  const { base, separator, baseMargin, margin, width, height, first, second, banks } = printModel(index);
  const separatorText = separator === 'NL' ? '改行文字' : '入力用改行文字（システム定数LB）';
  return [[
    p('問2　次のプログラムの説明及びプログラムを読んで，設問に答えよ。'),
    p('〔プログラムの説明〕'),
    p('文字型の1次元配列 Str に格納されている文字列を，整形して出力する副プログラム PrintOut である。'),
    p('（1）文字列は，英数字，記号及び' + separatorText + 'で構成される。'),
    p('（2）文字列は，文字型の1次元配列の各要素に1文字ずつ格納され，文字列の最後の要素の次の要素には，システム定数EOSが格納されている。'),
    p('（3）PrintOut の仕様は，次のとおりである。出力結果の例を図に，引数の仕様を表1に示す。'),
    p('① 指定した文字数（引数 Margin）だけ，左側に余白を設ける。'),
    p('② 指定した1行の最大文字数（引数 MaxC）で改行する。'),
    p('③ 指定した1ページの最大行数（引数 MaxL）で改ページする。' +
      (index === 0 ? '' : '図では Margin＝' + margin + '，MaxC＝' + width + '，MaxL＝' + height + ' とする。入力は ' +
        first + ' が' + (width + 4) + '個，' + separator + '，' + second + ' が' + (width - 2) + '個，' + separator + '，続いて c が並ぶ。')),
    draw('printExample', index, '図　出力結果の例'),
    p('（4）PrintOut は，次の副プログラム及びシステム関数を用いる。各副プログラム及びシステム関数の引数の仕様を表2〜4に示す。'),
    p('① 副プログラム GetPosition：文字列の指定した位置から行末となる文字位置を探索し，その位置を引数 EndP に返す。行末の条件は，EOS が見つかったとき，' +
      separatorText + 'が見つかったとき，又は MaxC＋1文字に達したときのいずれかである。'),
    p('② 副プログラム PutLine：指定された文字列を出力し，最後に改行を行う。'),
    p('③ システム関数 PutChr：指定された1文字を出力する。PutChr(NL) で印字位置は次の行の左端に移動し，PutChr(FF) で印字位置は次ページの左上端に移動する。ここで，NL は改行文字を，FF は改ページ文字を表すシステム定数である。'),
    p('（5）配列の添字は' + base + 'から始まる。'),
  ], [
    table('表1　PrintOut の引数の仕様', tableHeaders, [
      ['Str[]', '文字型', '入力', textArray], ['Margin', '整数型', '入力', '左側の余白の文字数。Margin≧0，1≦(Margin＋MaxC)≦100'],
      ['MaxC', '整数型', '入力', '1行に出力する最大文字数。MaxC≧1，1≦(Margin＋MaxC)≦100'],
      ['MaxL', '整数型', '入力', '1ページに出力する最大行数。MaxL≧1'],
    ]),
    table('表2　GetPosition の引数の仕様', tableHeaders, [
      ['Str[]', '文字型', '入力', textArray], ['StartP', '整数型', '入力', '探索の開始位置'],
      ['MaxC', '整数型', '入力', '1行に出力する最大文字数'], ['EndP', '整数型', '出力', '探索の結果，得られた行末位置'],
    ]),
    table('表3　PutLine の引数の仕様', tableHeaders, [['Line[]', '文字型', '入力', '出力対象の文字列を格納した1次元配列']]),
    table('表4　PutChr の引数の仕様', tableHeaders, [['Chr', '文字型', '入力', '出力対象の1文字']]),
  ], [
    p('〔プログラム〕'),
    code([
      '○PrintOut(文字型: Str[], 整数型: Margin, 整数型: MaxC, 整数型: MaxL)',
      '○文字型: Line[101]', '○整数型: StartP, LineC, MarginP, CurrentP, EndP',
      '・StartP ← ' + base, '・LineC ← 0',
      '■ MarginP: ' + base + ', MarginP < ' + baseMargin + ', 1',
      '│  ・Line[MarginP] ← " " /* 空白文字 */', '■', '',
      '■ Str[StartP] ≠ EOS    /* EOS: 文字列の終わりを表すシステム定数 */',
      '│  ・GetPosition(Str[], StartP, MaxC, EndP)',
      '│  ■ ［a］', '│  │  ・Line[CurrentP] ← Str[StartP]', '│  │  ・StartP ← StartP + 1', '│  ■',
      '│  ・Line[CurrentP] ← EOS', '│  ・PutLine(Line[])', '│  ・LineC ← LineC + 1',
      '│  ▲ LineC ≧ MaxL', '│  │  ・PutChr(FF)       /* FF: 改ページを表すシステム定数 */',
      '│  │  ・LineC ← 0', '│  ▼', '│  ▲ ［b］', '│  │  ・StartP ← StartP + 1', '│  ▼', '■', '',
      '○GetPosition(文字型: Str[], 整数型: StartP, 整数型: MaxC, 整数型: EndP)',
      '・EndP ← StartP',
      '■ (Str[EndP] ≠ EOS) and (Str[EndP] ≠ ' + separator + ') and (［c］)',
      '│  ・EndP ← EndP + 1', '■', '',
      '○PutLine(文字型: Line[])', '○整数型: CurrentP', '■ ［d］',
      '│  ・PutChr(Line[CurrentP])', '■', '・PutChr(NL)           /* NL: 改行を表すシステム定数 */',
    ].join('\n')),
  ], [
    p('設問　プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    ...banks.flatMap((choices, i) => bankBlocks('abcd'[i] + 'に関する解答群', choices)),
  ]];
}

export const legacy2008AutumnPm2Definition = define(2, '文字列整形と改行・改ページ',
  'a=エ・b=イ・c=ア・d=ウ', '配列の開始位置・入力の改行記号・印字条件',
  '配列の添字の始点、入力文字列の改行文字、行とページの印字条件を変更します。',
  'p.6〜9。EOS、入力改行と出力改行、余白を除いた最大行長、行数制限、疑似言語の制御線・字下げと共通p.2〜3を保持。', index => {
    const { base, separator, baseMargin, banks } = printModel(index);
    return {
      prompt: autumn2008Pm2Pages(index).flat(),
      contexts: [autumn2008PmReference('共通に使用される擬似言語の記述形式', referencePages)],
      ...answers(banks, [single('a', 'a', 0, 3), single('b', 'b', 1, 1), single('c', 'c', 2, 0), single('d', 'd', 3, 2)]),
      explanation: 'a：添字' + baseMargin + 'から書き始め，入力位置 StartP が行末 EndP に達する直前までコピーする。' +
        'b：行末が入力改行文字' + separator + 'のときだけ，その文字を消費する。' +
        'c：探索の開始位置に MaxC を足した位置に達すると，その行の本文は既に MaxC 文字である。' +
        'd：余白を含めた行を添字' + base + 'から読み，EOS の手前まで出力してから NL を出力する。' +
        '行数が MaxL に達したとき，FF を出力して次のページへ移る。',
    };
  }, { fixedReferenceAssetIds: referencePages.map(autumn2008PmPageAssetId) });
