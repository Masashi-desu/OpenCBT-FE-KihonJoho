import { code, p, table } from './definition';
import { bank, createLanguageDefinition, languageFigure, page, standaloneBank } from './legacy-2008-autumn-pm-10-13-support';
import { autumn2008PmPageAssetId, autumn2008PmReference } from './legacy-2008-autumn-pm-materials';

type Example = [pattern: string, hits: string[], misses: string[]];
type PatternCase = {
  begin: string; any: string; end: string; alpha: 'begin' | 'end';
  examples: Example[]; program: { pattern: string; data: string[] };
};
const cases: PatternCase[] = [
  { begin: '^', any: '.', end: '$', alpha: 'begin', examples: [
    ['', ['', 'home'], []], ['home', ['home', 'tachometer'], ['how', 'hope', 'me']],
    ['^ho.e', ['home', 'hope', 'hotel'], ['hot', 'hook', 'shore']],
    ['ho..$', ['home', 'hope', 'shore'], ['hop', 'hotel', 'hobby']],
  ], program: { pattern: 'ho.e$', data: ['home', 'shore', 'hotel'] } },
  { begin: '#', any: '?', end: '!', alpha: 'begin', examples: [
    ['', ['', 'map'], []], ['map', ['map', 'roadmap'], ['man', 'mat', 'ap']],
    ['#ma?k', ['mask', 'mark', 'market'], ['amark', 'ma', 'make']],
    ['ma?!', ['map', 'roadmap', 'mat'], ['ma', 'maple', 'matinee']],
  ], program: { pattern: 'ma?!', data: ['map', 'roadmap', 'maple'] } },
  { begin: '^', any: '.', end: '!', alpha: 'end', examples: [
    ['', ['', 'chip'], []], ['chip', ['chip', 'microchip'], ['chop', 'ch', 'ip']],
    ['^ch.p', ['chip', 'chop', 'chips'], ['microchip', 'ch', 'champ']],
    ['ch..!', ['chip', 'chop', 'microchip'], ['chi', 'chips', 'chime']],
  ], program: { pattern: 'ch.p!', data: ['chip', 'microchip', 'chips'] } },
  { begin: '@', any: '?', end: '$', alpha: 'end', examples: [
    ['', ['', 'lamp'], []], ['lamp', ['lamp', 'desklamp'], ['limp', 'lam', 'amp']],
    ['@la?p', ['lamp', 'lapp', 'lamps'], ['desklamp', 'lmp', 'limp']],
    ['l?m?$', ['lamp', 'limp', 'desklamp'], ['lam', 'lamps', 'lamex']],
  ], program: { pattern: 'l?mp$', data: ['lamp', 'desklamp', 'lamps'] } },
];
const quoted = (text: string) => JSON.stringify(text);

function matches({ begin, any, end }: PatternCase, pattern: string, str: string) {
  return Array.from({ length: str.length + 1 }, (_, start) => start).some(start => {
    let position = start;
    for (const token of pattern) {
      if (token === begin) { if (position !== 0) return false; }
      else if (token === end) { if (position !== str.length) return false; }
      else {
        if (position >= str.length || token !== any && token !== str[position]) return false;
        position++;
      }
    }
    return true;
  });
}
const output = languageFigure(12, 'matching-output', '図1 出力結果', index => {
  const sample = cases[index];
  const { pattern, data } = sample.program;
  const text = data.map(str => quoted(pattern) + ' ' + (matches(sample, pattern, str) ? 'matches' : "doesn't match") + ' ' + quoted(str) + '.').join('\n');
  return { kind: 'output', text, alt: text };
});

const change = languageFigure(12, 'alpha-condition', '図2 プログラム6のαの行の変更内容', index => {
  const { alpha, begin, end } = cases[index];
  const text = "} else if (c == '" + (alpha === 'begin' ? begin + "' && i == 0" : end + "' && i == pattern.length() - 1") + ') {';
  return { kind: 'output', text, alt: text };
});
export const q12Figures = [output, change];

const element = `public interface PatternElement {
    public boolean matches(String str, int index);
    public int length();
}`;
const one = `class OneChar implements PatternElement {
    private final char ch;
    OneChar(char ch) { this.ch = ch; }
    // 与えられた文字列strの位置indexの文字とこのパターン要素が
    // 表す1文字が一致すればtrueを，それ以外はfalseを返す。
    public boolean matches(String str, int index) {
        return str.length() > index && ［a］;
    }
    public int length() { return 1; }
}`;
const anyChar = `class AnyChar implements PatternElement {
    // 与えられた文字列strに，位置indexから文字が一つ以上あればtrueを，
    // それ以外はfalseを返す。
    public boolean matches(String str, int index) {
        return ［b］;
    }
    public int length() { return 1; }
}`;
const beginOf = `class BeginningOfString implements PatternElement {
    public boolean matches(String str, int index) {
        return index == 0;
    }
    public int length() { return 0; }
}`;
const endOf = `class EndOfString implements PatternElement {
    public boolean matches(String str, int index) {
        return index == str.length();
    }
    public int length() { return 0; }
}`;

function patternClass({ begin, any, end, alpha }: PatternCase) {
  return `import java.util.ArrayList;
import java.util.List;

public class Pattern {
    private List<PatternElement> expr;
    public Pattern(String pattern) {
        expr = compile(pattern);
    }

    public boolean matches(String str) {
        for (int i = 0; i <= str.length(); i++) {
            if (matches(str, i))
                return true;
        }
        return false;
    }

    private boolean matches(String str, int index) {
        for (PatternElement node : expr) {
            if (!node.matches(str, index))
                return false;
            index += node.length();
        }
        return true;
    }

    private List<PatternElement> compile(String pattern) {
        List<PatternElement> list = new ArrayList<PatternElement>();
        for (int i = 0; i < pattern.length(); i++) {
            char c = pattern.charAt(i);
            PatternElement node = null;
            if (c == '${any}') {
                node = new ［c］;
            } else if (c == '${begin}') {${alpha === 'begin' ? '    // ← α' : ''}
                node = new BeginningOfString();
            } else if (c == '${end}') {${alpha === 'end' ? '    // ← α' : ''}
                node = new EndOfString();
            } else {
                node = new ［d］;
            }
            list.add(node);
        }
        return list;
    }`;
}
function mainProgram({ pattern, data }: PatternCase['program']) {
  return `    public static void main(String[] args) {
        String[] data = { ${data.map(quoted).join(', ')} };
        Pattern pattern = new Pattern(${quoted(pattern)});
        for (String str : data) {
            String result;
            if (［e］) {
                result = "matches";
            } else {
                result = "doesn't match";
            }
            System.out.printf("\\\"${pattern}\\\" %s \\\"%s\\\".%n",
                              result, str);
        }
    }
}`;
}

export const q12 = createLanguageDefinition(12, 'Java：メタ文字を含むパターンの文字列照合', 'メタ文字・照合対象と位置条件', 'abcde2',
  '設問1 aウ bウ cイ dキ eエ／設問2 イ',
  '文字又は長さ0のアンカーを順に照合する構成、6プログラム・図のα・6欄を保持。メタ文字集合と対象文字列を変え、制限を適用するアンカーと位置を切り替える。Java付属のListとArrayListはp63を参照。',
  index => {
    const sample = cases[index];
    const { begin, any, end, alpha } = sample;
    const example = sample.examples[2][0];
    const marker = alpha === 'begin' ? begin : end;
    const position = alpha === 'begin' ? '先頭' : '末尾';
    const options = [
      "文字'" + marker + "'は，常に通常文字として扱われる。",
      "文字'" + marker + "'は，引数patternの" + position + 'にあるときだけメタ文字として扱われ，それ以外のときは，通常文字として扱われる。',
      "文字'" + marker + "'は，引数patternの" + position + 'にあるときだけメタ文字として扱われ，それ以外のときは，無視される。',
      "文字'" + marker + "'は，引数patternの" + position + 'にあるときだけメタ文字として扱われ，それ以外のときは，例外が発生する。',
    ];
    const rows = sample.examples.map(([pattern, hits, misses]) => [
      quoted(pattern), hits.map(quoted).join('，'), misses.map(quoted).join('，') || 'なし',
    ]);
    return {
      pages: [
        page(50, [
          p('問12 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'),
          p('〔プログラムの説明〕'),
          p('文字列照合用パターン（以下，パターンという）と，与えられた文字列を照合するプログラムである。パターン及び与えられた文字列は0個以上の文字からなる文字列である。パターンを構成する文字には，照合するときに特殊な意味をもつ文字（以下，メタ文字という）及びメタ文字以外の文字（以下，通常文字という）がある。表1にメタ文字とその意味を示す。'),
          table('表1 メタ文字とその意味', ['メタ文字', '意味'], [[begin, '文字列の先頭に一致'], [any, '任意の1文字に一致'], [end, '文字列の末尾に一致']]),
          p("通常文字は，その文字と一致する。例えば，通常文字'a'は1文字のaに一致する。"),
          p('与えられた文字列の全部又は一部にパターン全体が一致した場合，一致したものと判定する。パターンの文字数が0のとき，すべての文字列に一致する。表2にパターンとそのパターンに一致する文字列及び一致しない文字列の例を示す。'),
          table('表2 パターンとそのパターンに一致する文字列及び一致しない文字列の例', ['パターン', '一致する文字列の例', '一致しない文字列の例'], rows),
          p('プログラムは，与えられたパターンを1文字ずつ解析し，照合処理がしやすい形式に変換する。この解析及び変換処理をコンパイルと呼び，変換された照合処理の単位をパターン要素と呼ぶ。メタ文字は，そのメタ文字の意味を表すパターン要素に変換され，通常文字は，その文字を表すパターン要素に変換される。パターン全体は，'),
        ]),
        page(51, [
          p('パターン要素のリストで表される。例えば，パターン' + quoted(example) + 'は，' + [...example].map(token => "'" + token + "'").join('，').replace(/，([^，]*)$/, '及び$1') + 'に分けられ，それぞれが次のパターン要素に変換される。'),
          p('① 文字列の先頭を表すパターン要素\n② ' + "'" + example[1] + "'" + 'を表すパターン要素\n③ ' +
            "'" + example[2] + "'" + 'を表すパターン要素\n④ 任意の1文字を表すパターン要素\n⑤ ' + "'" + example[4] + "'" + 'を表すパターン要素'),
          p('次に，パターンと与えられた文字列との照合を，パターン要素のリストを評価しながら行う。リスト中のパターン要素（前の例では①〜⑤）と，与えられた文字列の先頭の文字から順に照合し，連続してすべてのパターン要素が一致したとき，パターンは与えられた文字列に一致すると判定する。'),
          p('インタフェースPatternElementは，パターン要素を表す。メソッドmatchesは，このパターン要素が，引数で与えられた文字列strの位置indexから一致するかどうかを調べ，一致すればtrueを，それ以外はfalseを返す。ただし，indexの値は0以上であるものとする。メソッドlengthは，このパターン要素に一致する文字列の長さを返す。'),
          p('インタフェースPatternElementを実装した各クラスを次に示す。'),
          p('（1）クラスOneCharは，通常文字1文字を表すパターン要素である。'),
          p('（2）クラスAnyCharは，任意の1文字を表すパターン要素である。'),
          p('（3）クラスBeginningOfString及びEndOfStringは，それぞれ文字列の先頭及び文字列の末尾を表すパターン要素である。'),
          p('クラスPatternは，コンストラクタで与えられたパターンをパターン要素のリストに変換する。メソッドmatchesは，与えられた文字列とパターン要素のリストを照合し，一致すればtrueを，それ以外はfalseを返す。メソッドmainはクラスPatternのテストを行う。メソッドmainを実行すると，図1のような出力結果が得られる。'),
          output.block(index),
          p('なお，このプログラムでは，1文字がcharで表現できるものとし，Unicodeの補助文字は考えないものとする。'),
        ], undefined, undefined, true),
        page(52, [p('〔プログラム1〕'), code(element, 'java'), p('〔プログラム2〕'), code(one, 'java'),
          p('〔プログラム3〕'), code(anyChar, 'java'), p('〔プログラム4〕'), code(beginOf, 'java'),
          p('〔プログラム5〕'), code(endOf, 'java')]),
        page(53, [p('〔プログラム6〕'), code(patternClass(sample), 'java')]),
        page(54, [code(mainProgram(sample.program), 'java'), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['!=', '<', '==', '>'].map(operator => 'str.charAt(index) ' + operator + ' ch'), 'ウ', 'java'),
          bank(1, 'b', ['<', '<=', '>', '>='].map(operator => 'str.length() ' + operator + ' index'), 'ウ', 'java'),
          bank(1, 'cd', ["AnyChar('" + any + "')", 'AnyChar()', 'AnyChar(c)', 'AnyChar(i)',
            "OneChar('" + any + "')", 'OneChar()', 'OneChar(c)', 'OneChar(i)'], 'イキ', 'java'),
          bank(1, 'e', ['!pattern.equals(str)', '!pattern.matches(str)', 'pattern.equals(str)', 'pattern.matches(str)'], 'エ', 'java'),
        ]),
        page(55, [
          p('設問2 プログラム6のαの行を図2のとおりに変更したとき，プログラムの動作はどうなるか。適切な記述を，解答群の中から選べ。'),
          change.block(index),
        ], [standaloneBank(2, options, 'イ')]),
      ],
      contexts: [autumn2008PmReference('Javaプログラムで使用するAPIの説明', [63])],
      explanation: 'a：位置indexに文字があるとき，charAt(index)と通常文字chを等号で比較する。b：任意の1文字は位置indexが長さより小さいときだけ一致する。c：メタ文字' +
        "'" + any + "'" + 'には引数を取らないAnyCharを作る。d：通常文字は実際の文字cをOneCharへ渡す。e：文字列の照合はPattern.matchesを呼び出す。設問2：αに位置の条件が加わるので，' +
        "'" + marker + "'" + 'はパターンの' + position + 'だけでアンカーとなる。それ以外の位置では最後のelseでOneCharになる。空文字列の先頭や末尾にも，対応する長さ0のアンカーは一致する。',
    };
  }, { fixedReferenceAssetIds: [autumn2008PmPageAssetId(63)] });
