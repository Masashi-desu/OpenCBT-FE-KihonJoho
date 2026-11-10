import { code, p, table } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2013-autumn-pm-09-13-support';
import { directoryConditions, directoryOutput } from './legacy-2013-autumn-pm-09-13-models';
import { languageFigure } from './legacy-2013-autumn-pm-09-13-figures';

export const autumn2013PmJavaReferenceTitle = 'Java APIの参照（独自編集）';
const javaReference = () => ({
  title: autumn2013PmJavaReferenceTitle,
  blocks: [
    p('この問題で使う Java SE 7 のAPI（Application Programming Interface、プログラムから機能を呼び出すための取り決め）の要点を示す。'),
    table('使用する操作', ['型と操作', 'この問題で必要な動作'], [
      ['List<E>', '順序のある要素列。型Eの値を格納し、先頭を添字0で参照する。'],
      ['List.add(e)', '末尾にeを置く。追加を行った呼出しではtrueを返す。'],
      ['List.addAll(c)', 'cを反復した順に、全要素をリストの末尾へ置く。リストが変わればtrue。'],
      ['List.get(index)', '添字indexの要素を取得する。'],
      ['List.isEmpty()', '要素数が0のときだけtrue。'],
      ['List.size()', '現在の要素数を取得する。'],
      ['new ArrayList<E>()', '要素をまだ持たない可変長のListを作る。'],
      ['Arrays.asList(a)', '配列aと同じ順序・長さの固定長Listを作る。'],
      ['String.startsWith(prefix)', '先頭がprefixに一致すればtrue。'],
      ['String.split(regex)', 'regexに合う箇所を区切りとして分割した配列を得る。末尾の空要素は結果に残らない。例えば “root//leaf/” を “/+” で分割すると “root” と “leaf” の2要素になる。'],
      ['String.equals(other)', 'otherもStringで、文字の並びが等しければtrue。'],
    ]),
  ],
});

const javaPrefix = `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DirectoryNode {
    public final DirectoryNode parent;
    public final String name;
    public final List<DirectoryNode> children =
        new ArrayList<DirectoryNode>();

    public DirectoryNode() {
        this(［a］);
    }`;

const javaBody = `    private DirectoryNode(String name, DirectoryNode parent) {
        this.name = name;
        this.parent = parent;
    }

    public DirectoryNode add(String path) {
        if (［b］) {
            throw new IllegalArgumentException();
        }
        // 第1引数は文字列pathに含まれるディレクトリのリストである
        return add(Arrays.asList(path.split("/+")), 0);
    }

    private DirectoryNode add(List<String> path, int i) {
        DirectoryNode child = findChild(path.get(i));
        if (child == null) {
            children.add(child = new DirectoryNode(path.get(i), this));
        }
        if (path.size() > i + 1) {
            return child.add(path, i + 1);
        }
        return child;
    }

    public String path() {
        if (［c］) { // 自ノードがルートノードなら"/"を返す
            return "/";
        }
        return parent.path() + name + "/";
    }

    private DirectoryNode findChild(String name) {
        for (DirectoryNode child : children) {
            if (child.name.equals(name)) {
                return child;
            }
        }
        return null;
    }

    public List<DirectoryNode> find(String name) {
        List<DirectoryNode> ret = new ArrayList<DirectoryNode>();
        DirectoryNode node = findChild(name);
        if (node != null) {
            ret.add(［d］);
        }
        for (DirectoryNode child : children) {
            ret.addAll(child.find(［e］));
        }
        return ret;`;

const javaEnd = '    }\n}';
const javaLeafChange = `        if (［f］) {
            return parent.path() + name;
        }`;

function tester(index: number) {
  const { additions, rejected } = directoryConditions[index];
  return `public class DirectoryNodeTester {
    public static void main(String[] args) {
        try {
            DirectoryNode root = new DirectoryNode();
            DirectoryNode usr = root.add("usr");
            usr.add("` + additions[0] + `");
            usr.add("` + additions[1] + `");
            usr.add("` + additions[2] + `");
            root.add("` + additions[3] + `");
            for (DirectoryNode n : root.children) {
                System.out.println(n.name);
            }
            for (DirectoryNode n : root.find("local")) {
                System.out.println(n.path());
            }
            usr.add("` + rejected + `");
        } catch (IllegalArgumentException e) {
            System.out.println("IllegalArgument");
        }
    }
}`;
}

const counts = ['6', '7', '8', '9', '10'];
const marks = 'アイウエオ';
export const autumn2013Pm11 = createLanguageDefinition(11, '木構造の生成（Java）', '追加するディレクトリパス',
  'abcde2f', '設問1 a=イ，b=エ，c=エ，d=ウ，e=イ／設問2 ウ／設問3 f=エ',
  'テスト用パスの枝の深さ・既存ノードの再利用・空または絶対パスの拒否を変え、木のインスタンス数と実行例に反映します。プログラムの字下げ、根と葉の区別、共有解答群、同じ名前の別ノードを全て探す条件を保持します。必要なAPIを独自に記述した参照資料を付けます。',
  index => {
    const original = directoryOutput(index, false), changed = directoryOutput(index, true);
    return {
      pages: [
        page(55, [
          p('問11　次のJavaプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。Javaプログラムで使用するAPIの説明は付属資料を参照する。'),
          p('〔プログラムの説明〕ディレクトリパス（以下，パスという）から木構造を生成する。パスは木構造のファイルシステムでディレクトリを特定する文字列で、ディレクトリ名を“/”で区切る。“/”から始まる絶対パスはルートディレクトリを起点とし、“/”から始まらない相対パスは任意のノードを起点とする。'),
          p('木構造の各ノードは一つのディレクトリを、ルートノードはルートディレクトリを表す。図1の楕円一つはノード一つに対応し、“と”で囲まれた文字列がノード名である。ルートノード名は空文字列とする。usrの絶対パスは“/usr”、usrからの“local/lib”は絶対パス“/usr/local/lib”と同じノードlibを指す。'),
          languageFigure(11, 'directory-tree', index, '図1　木構造の例'),
          p('DirectoryNodeクラスの1インスタンスが1ノードを表す。nameは名前、parentは親への参照、childrenは子ノードのリストを保持する。引数のないコンストラクタはルートを生成する。クラスDirectoryNodeは次のメソッドをもつ。'),
        ]),
        page(56, [
          p('（1）public DirectoryNode add(String path)　指定されたパスがこのノードを起点にノードを特定できるように木構造を拡張し、そのノードを返す。空文字列又は絶対パスならIllegalArgumentExceptionを投げる。連続する“/”は一つとして扱い、末尾の“/”は無視する。したがって“local//lib/”は“local/lib”とみなす。'),
          p('（2）public String path()　このノードの絶対パスを返す。末尾は常に“/”であり、例えば図1の最下段のlibなら“/usr/local/lib/”を返す。'),
          p('（3）public List<DirectoryNode> find(String name)　このノードの各子ノードを頂点とする全ての部分木から、引数nameの名前をもつノードを全て探し、リストで返す。'),
          p('DirectoryNodeTesterはテスト用プログラムで、実行結果は図2のとおりである。'),
          languageFigure(11, 'execution-output', index, '図2　クラスDirectoryNodeTesterの実行結果'),
          p('〔プログラム1〕'), code(javaPrefix, 'java'),
        ]),
        page(57, [code(javaBody, 'java')]),
        page(58, [
          code(javaEnd, 'java'), p('〔プログラム2〕'), code(tester(index), 'java'),
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'a', ['""', '"", null', 'null', 'null, ""'], 'イ', 'java'),
          bank(1, 'b', [
            '!path.startsWith("/") && !"".equals(path)', '!path.startsWith("/") || !"".equals(path)',
            'path.startsWith("/") && "".equals(path)', 'path.startsWith("/") || "".equals(path)',
          ], 'エ', 'java'),
          bank(1, 'c', ['parent != ""', 'parent != null', 'parent == ""', 'parent == null'], 'エ', 'java'),
        ]),
        page(59, [
          p('設問2　クラスDirectoryNodeTesterを実行したときに生成される、DirectoryNodeのインスタンスの個数として正しい答えを選べ。'),
          p('設問3　次の記述中の空欄に入れる正しい答えを選べ。メソッドpathが返す文字列の末尾は常に“/”である。ルートノードであるか子ノードをもつときにだけ末尾が“/”になるように、メソッドpathの最後のreturn文の直前に次の3行を挿入した。実行結果は図3となる。'),
          code(javaLeafChange, 'java'),
          languageFigure(11, 'leaf-output', index, '図3　クラスDirectoryNode変更後のクラスDirectoryNodeTesterの実行結果'),
        ], [
          bank(1, 'de', ['child', 'name', 'node', 'null', 'parent', 'root'], 'ウイ', 'java'),
          bank(2, '2', counts, marks[counts.indexOf(String(original.count))]),
          bank(3, 'f', ['!children.isEmpty()', 'children != null', 'children == null', 'children.isEmpty()'], 'エ', 'java'),
        ], [-1, 0, 3]),
      ],
      contexts: [javaReference()],
      explanation: 'ルートは空文字列とnullの親で作る。addは絶対パスまたは空文字列を拒否し、正規表現で連続する区切りをまとめる。pathでは親がnullならルートである。findで直下から見つかったnodeを加え、各部分木へ同じnameを渡す。パスの共通部分は既存ノードを再利用するため、生成されるインスタンスはルートを含め' + original.count + '個。変更後は子が空のノードだけ末尾を外し、検索で得たパスは' + changed.lines.slice(2, -1).join('，') + 'になる。',
    };
  });
