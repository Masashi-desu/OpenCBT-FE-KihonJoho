import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2008-spring-pm-10-13-support';

type Pair = readonly [string, string];
type Format = {
  properties: readonly Pair[];
  pairs: readonly Pair[];
  reversed: boolean;
  outer: string;
  entry: string;
  comment: string;
};
const examples: readonly Format[] = [
  { properties: [['color', 'red'], ['font', 'serif']], pairs: [['width', '200'], ['height', '120'], ['color', 'blue']], reversed: false,
    outer: 'data', entry: 'entry', comment: 'This is a comment.' },
  { properties: [['tone', 'cool'], ['size', '12']], pairs: [['rate', '60'], ['size', '18'], ['tone', 'warm']], reversed: true,
    outer: 'style', entry: 'item', comment: 'Visual settings.' },
  { properties: [['line', 'solid'], ['gap', '4']], pairs: [['margin', '5'], ['padding', '8'], ['line', 'dashed']], reversed: false,
    outer: 'layout', entry: 'setting', comment: 'Layout settings.' },
  { properties: [['name', 'map'], ['zoom', '2']], pairs: [['layer', 'road'], ['zoom', '3'], ['level', 'city']], reversed: true,
    outer: 'map', entry: 'option', comment: 'Map settings.' },
];

const divider = '---------------';
const tag = (f: Format, key: string, value: string) => `<${f.entry} key="${key}">${value}</${f.entry}>`;
const propertyComment = (comment: string) => '# ' + comment;
const xmlComment = (comment: string) => '<!-- ' + comment + ' -->';

function output(suffix: string, caption: string, description: (sample: Format) => string) {
  return languageFigure(12, suffix, caption, index => {
    const text = description(examples[index]);
    return { kind: 'output', text, alt: text };
  });
}
const test1 = output('test1-output', '図1 プログラム1-2のメソッドmainの実行結果', f => f.properties.map(([key, value]) => key + '=' + value).join('\n'));
const tagShape = output('entry-format', '図2 タグ形式におけるエントリ', f => tag(f, 'キー', '値'));
const test2 = output('test2-output', '図3 プログラム2-5のメソッドmainの実行結果（全プログラムの変更後）', f =>
  [...f.pairs.map(([k, v]) => k + '=' + v), divider, `<${f.outer}>`,
    ...f.pairs.map(([k, v]) => tag(f, k, v)), `</${f.outer}>`].join('\n'));
const propertyCommentFigure = output('properties-comment', '図4 プロパティ形式でのコメントの出力例', f => propertyComment(f.comment));
const tagCommentFigure = output('tag-comment', '図5 タグ形式でのコメントの出力例', f => xmlComment(f.comment));
const additions = [
  'public void writeComment(String comment) {\n    System.out.println("# " + comment);\n}',
  'public void writeComment(String comment) {\n    System.out.println("<!-- " + comment + " -->");\n}',
  'public void writeComment(String comment);',
  'public void writeComment(String comment) { }',
];
const codeInsertions = languageFigure(12, 'code-insertion', '表 コードの追加先と追加内容', () => {
  const rows = additions.map((row, i) => ['［' + 'efgh'[i] + '］', row]);
  return { kind: 'tables', tables: [{ headings: ['追加先', '追加内容'], rows, codeColumns: [1] }],
    alt: rows.map(([location, source]) => location + '\n' + source).join('\n') };
});
export const q12Figures = [test1, tagShape, test2, propertyCommentFigure, tagCommentFigure, codeInsertions];

const properties = `public class ToProperties {
    public void write(String key, String value) {
        System.out.println(key + "=" + value);
    }
}`;
const propertiesTest = (f: Format) => `public class Test1 {
    public static void main(String[] args) {
        ToProperties writer = new ToProperties();
${f.properties.map(([key, value]) => `        writer.write("${key}", "${value}");`).join('\n')}
    }
}`;
const writer = `public interface KeyValueWriter {
    public void initialize();
    public void write(［a］);
    public void complete();
}`;
const tags = (f: Format) => String.raw`public class ToTags implements KeyValueWriter {
    public void initialize() {
        System.out.println("<${f.outer}>");
    }
    public void write(String key, String value) {
        System.out.println("<${f.entry} key=\"" + key + "\">"
                           + value + "</${f.entry}>");
    }
    public void complete() {
        System.out.println("</${f.outer}>");
    }
}`;
const adapter = `public class KeyValueWriterAdapter
                   implements KeyValueWriter {
    public void initialize() { }
    public void write(［a］) { }
    public void complete() { }
}`;
const newProperties = `public ［b］ {
    public void write(String key, String value) {
        System.out.println(key + "=" + value);
    }
}`;
function testData(f: Format) {
  const items = f.pairs.map(([key, value]) => f.reversed ? [value, key] : [key, value]);
  const literal = items.map(([first, second]) => `{"${first}", "${second}"}`);
  return `public class Test2 {
    static String[][] pairs = { ${literal.join(',\n                                ')} };`;
}
const testBody = `    public static void main(String[] args) {
        write(new ToProperties());
        System.out.println("${divider}");
        write(new ToTags());
    }
    private static void write(［c］ out) {
        out.initialize();
        for (String[] pair : pairs) {
            out.write(［d］);
        }
        out.complete();
    }
}`;

export const q12 = createLanguageDefinition(12, 'Java：インタフェースによるプロパティ・タグ形式の出力', 'キーと値の配列順・タグ形式・テスト対象', 'abcdefgh',
  '設問1 aウ bイ cア dア／設問2 eエ fイ gア hウ',
  'インタフェース、空実装クラス、二種類の出力とコメント拡張、六つの図表、8欄を保持。タグ名、キー・値の入力組及び配列内での順序を変え、メソッドに渡す引数と全出力例を連動。コメントは改行と連続ハイフンを除く。',
  index => {
    const f = examples[index];
    const [keyIndex, valueIndex] = f.reversed ? [1, 0] : [0, 1];
    return {
      pages: [
        page(45, [
          p('問12 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('キーとそのキーに関連付けられた値をある形式に従って出力するプログラムである。'),
          p('プログラム1-1は，与えられた二つの文字列をキー及びそのキーに関連付けられた値として“キー＝値”の形式（以下，プロパティ形式という）で出力する。クラスToPropertiesのメソッドwriteの引数keyはキー，引数valueは値である。キー及び値は英数字からなる文字列である。'),
          p('プログラム1-2は，クラスToPropertiesのテストプログラムである。メソッドmainを実行すると，図1に示す結果が得られる。'),
          test1.block(index),
          p('このプロパティ形式に加えて，“<”と“>”で囲まれたタグを使用する形式（以下，タグ形式という）で出力できるようにする。タグ形式では，キーと値の組を図2に示す形式で表し，その組をエントリという。'),
          tagShape.block(index),
          p(`エントリの並びを，タグ<${f.outer}>及び</${f.outer}>で囲んで出力する。`),
          p('これを実現するために，次のプログラムを新たに作成し，プログラム1-1に変更を加えた。'),
          p('（1）プログラム2-1は，プロパティ形式とタグ形式の出力を統一して扱うインタフェースKeyValueWriterを定義する。メソッドinitializeは，必要な前処理を行い，メソッドwriteは，引数で与えられたキーと値を出力し，メソッドcompleteは，後処理を行う。出力形式は，これらのメソッドの実装で決まる。'),
          p('（2）プログラム2-2は，インタフェースKeyValueWriterを実装するクラスToTagsである。'),
        ]),
        page(46, [
          p('（3）プログラム2-3は，インタフェースKeyValueWriterで定義されている全メソッドの省略時の実装を与えるクラスKeyValueWriterAdapterである。各メソッドの実装は，必ず空である。'),
          p('（4）プログラム2-4は，プログラム1-1をクラスKeyValueWriterAdapterに適用できるように変更したものである。'),
          p(`（5）プログラム2-5は，変更されたクラスToProperties及びクラスToTagsの出力を検査するテストプログラムである。${index === 0 ? '' : ` 配列pairsの各対には${f.reversed ? '値，キー' : 'キー，値'}の順に文字列を格納する。`}`),
          p('全プログラムの変更後，プログラム2-5のメソッドmainを実行すると，図3に示す実行結果が得られる。'),
          test2.block(index),
          p('〔プログラム1-1〕'), code(properties, 'java'),
          p('〔プログラム1-2〕'), code(propertiesTest(f), 'java'),
        ]),
        page(47, [
          p('〔プログラム2-1〕'), code(writer, 'java'),
          p('〔プログラム2-2〕'), code(tags(f), 'java'),
          p('〔プログラム2-3〕'), code(adapter, 'java'),
          p('〔プログラム2-4〕'), code(newProperties, 'java'),
          p('〔プログラム2-5〕'), code(testData(f), 'java'),
        ]),
        page(48, [
          code(testBody, 'java'),
          p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'a', ['K key, V value', 'Object key, Object value', 'String key, String value', 'String[] key, String[] value'], 'ウ', 'java'),
          bank(1, 'b', ['abstract class ToProperties extends KeyValueWriterAdapter', 'class ToProperties extends KeyValueWriterAdapter',
            'class ToProperties extends ToTags', 'class ToProperties implements KeyValueWriter', 'class ToProperties implements ToTags'], 'イ', 'java'),
          bank(1, 'c', ['KeyValueWriter', 'KeyValueWriterAdapter', 'Test2', 'ToProperties', 'ToTags'], 'ア', 'java'),
          bank(1, 'd', ['pair[0], pair[1]', 'pair[1], pair[0]', 'pair[i], pair[i + 1]', 'pairs[][0], pairs[][1]', 'pairs[][1], pairs[][0]'], f.reversed ? 'イ' : 'ア', 'java'),
        ]),
        page(49, [
          p(`設問2 プログラムを更に拡張して，与えられた文字列をコメントとして出力できるようにする。すなわち，プロパティ形式では与えられた文字列の先頭に“# ”を付加して出力し，タグ形式では与えられた文字列を“<!-- ”及び“ -->”で囲んで出力する。例えば，与えられた文字列が“${f.comment}”のとき，プロパティ形式では図4のとおりに，タグ形式では図5のとおりに出力する。ただし，コメントとして与えられた文字列は，改行文字及び文字列“--”を含まないものとする。`),
          propertyCommentFigure.block(index), tagCommentFigure.block(index),
          p('この拡張のために，次の表に示す各コードをプログラムに追加した。各コードの追加先のプログラムとして，表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          codeInsertions.block(index),
        ], [bank(2, 'efgh', ['プログラム2-1', 'プログラム2-2', 'プログラム2-3', 'プログラム2-4'], 'エイアウ')]),
      ],
      explanation: `a：両出力形式ともキーと値をString引数で受ける。b：ToPropertiesは出力だけを上書きし，ほかは空実装のKeyValueWriterAdapterから継承する。c：同じwrite処理で取り扱う二つのクラスの共通型はKeyValueWriter。d：pair[${keyIndex}]がキー，pair[${valueIndex}]が値なのでこの順に渡す。e：プロパティ形式の実装はToProperties。f：タグ形式の実装はToTags。g：共通のメソッド宣言はインタフェース。h：省略時の空実装はKeyValueWriterAdapter。空実装のクラス自身はコメントを出力しない。`,
    };
  });
