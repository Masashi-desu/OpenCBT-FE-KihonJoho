import { code, p } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2013-spring-pm-09-13-support';
import { languageFigure } from './legacy-2013-spring-pm-09-13-figures';
import { decimalY, ladderCases, ladderPath } from './legacy-2013-spring-pm-09-13-models';

export const spring2013PmJavaReferenceTitle = 'Java APIの参照（独自編集）';
const javaReference = {
  title: spring2013PmJavaReferenceTitle,
  presentation: 'text' as const,
  blocks: [
    p('List<E>では，位置は0から数える。get(int index)はその位置の要素を取り出し，位置が範囲外ならIndexOutOfBoundsExceptionになる。add(E element)は要素を末尾へ追加する。indexOf(Object element)は一致する最初の位置を返し，見付からなければ−1を返す。ArrayList(int initialCapacity)は容量を指定した空のリストを用意し，容量分の要素を追加するわけではない。'),
    p('SortedMap<K,V>はキーを順序付ける。containsKey(Object key)はキーが登録済みかを調べる。get(Object key)は対応する値を取り出し，キーがなければnullを返す。put(K key,V value)は対応を登録する。headMap(K toKey)は指定キーより小さいキーだけを対象とし，そのlastKey()は対象中の最大キーを返す。引数なしのTreeMap()は自然順序を用いる空のマップを作る。'),
    p('参照元　Oracle Java Platform, Standard Edition 7 API Specification（List，ArrayList，Map，SortedMap，TreeMap）。'),
  ],
};

export const q11 = createLanguageDefinition(11, 'あみだくじの横線の登録と探索', '縦軸の範囲と横線の接続', '1abcdef', 'ウイウイウアイ',
  '座標の範囲と横線の接続を図，テストプログラム，出力へ反映し，降順の位置交換と実Java処理系で全ての始点を照合する。', index => {
    const { size, bottom, top, rungs } = ladderCases[index];
    const lower = decimalY(bottom), upper = decimalY(top);
    const first = [
      'import java.util.ArrayList;',
      'import java.util.List;',
      'import java.util.SortedMap;',
      'import java.util.TreeMap;',
      '',
      'public class GhostLeg {',
      '    private List<VerticalLine> verticalLines;',
      '',
      '    public [a](int n) {',
      '        verticalLines = new ArrayList<VerticalLine>(n);',
      '        for (int i = 0; i < n; i++) {',
      '            verticalLines.add([b]);',
      '        }',
      '    }',
    ].join('\n');
    const second = [
      '    public void addHorizontalLine(int x1, int x2, double y) {',
      '        // 設問3（α）',
      '        VerticalLine v1 = verticalLines.get(x1);',
      '        // 設問3（β）',
      '        VerticalLine v2 = verticalLines.get(x2);',
      '        if (x1 != x2 && !v1.hasHorizontalLineAt(y) &&',
      '                       !v2.hasHorizontalLineAt(y)) {',
      '            // 設問3（γ）',
      '            v1.putHorizontalLine(y, v2);',
      '            v2.putHorizontalLine(y, v1);',
      '        }',
      '        // 設問3（δ）',
      '    }',
      '',
      '    public int trace(int x) {',
      '        double y = ' + upper + ';',
      '        VerticalLine v = verticalLines.get(x);',
      '        while ((y = v.getNextY(y)) > [c]) {',
      '            v = [d];',
      '        }',
      '        return verticalLines.indexOf(v);',
      '    }',
      '',
      '    private static class VerticalLine {',
      '        SortedMap<Double, VerticalLine> horizontalLines =',
      '            new TreeMap<Double, VerticalLine>();',
      '',
      '        VerticalLine() {',
      '            horizontalLines.put(' + lower + ', null);',
      '        }',
      '',
      '        boolean hasHorizontalLineAt(double y) {',
      '            return horizontalLines.containsKey(y);',
      '        }',
      '',
      '        void putHorizontalLine(double y, VerticalLine opposite) {',
      '            horizontalLines.put(y, opposite);',
      '        }',
      '',
      '        double getNextY(double y) {',
      '            // マップhorizontalLinesが保持するキーの中で，',
      '            // 引数yよりも小さいもののうち，最大のものを返す。',
      '            return horizontalLines.headMap(y).lastKey();',
      '        }',
      '',
      '        VerticalLine getOpposite(double y) {',
      '            return horizontalLines.get(y);',
      '        }',
      '    }',
      '}',
    ].join('\n');
    const testProgram = [
      'public class GhostLegTester {',
      '    public static void main(String[] args) {',
      '        GhostLeg gh = new GhostLeg(' + size + ');',
      ...rungs.map(([x1, x2, y]) => '        gh.addHorizontalLine(' + x1 + ', ' + x2 + ', ' + decimalY(y) + ');'),
      '        for (int i = 0; i < ' + size + '; i++) {',
      '            System.out.printf("%d -> %d%n", i, gh.trace(i));',
      '        }',
      '    }',
      '}',
    ].join('\n');
    const outcomes = Array.from({ length: size }, (_, start) => ladderPath(index, start).at(-1)![0]);
    return {
      pages: [
        page(53, [
          p('問11　次のJavaプログラムの説明及びプログラムを読んで，設問1～3に答えよ。\n' +
            (index === 0 ? '（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'
              : '（Javaプログラムで使用するAPIは資料の「Java APIの参照」を参照してください。）')),
          p('〔プログラムの説明〕\nあみだくじの作成と結果の表示を行うプログラムである。'),
          p('あみだくじとは，複数の平行に並ぶ縦線と，2本の縦線だけに水平に接続する複数の横線から成るくじである。横線は縦線の上端及び下端には接続せず，縦線の同一箇所に複数の横線が接続されることもない。くじをたどる手順は次のとおりである。'),
          p('（1）1本の縦線を選択し，上端から下方向にたどり始める。\n（2）途中に，接続する横線があるときは必ず曲がり，もう一方の縦線までたどる。\n（3）縦線に到達したら，また下方向にたどる。\n（4）下端に到達するまで（2）と（3）を繰り返す。\n（5）下端に到達したときの縦線の位置が，くじを引いた結果である。'),
          p('あみだくじの例を図1に示す。図中の太線は，左端の縦線を選択したときにたどった経路である。'),
          languageFigure(11, 'ladder', index, '図1 あみだくじの例'),
          p('クラスGhostLegは，あみだくじを作成し，作成したあみだくじをたどるプログラムである。\n（1）縦線を左からの順番で保持する。左端を0番目とする。\n（2）縦線の長さを' + decimalY(top - bottom) + 'とし，上端の縦軸座標を' + upper + '，下端の縦軸座標を' + lower + 'とする。\n（3）横線の両端の縦軸座標は等しく，' + lower + 'よりも大きく' + upper + '未満である。'),
        ]),
        page(54, [
          p('（4）縦線の本数を引数とするコンストラクタをもつ。\n（5）次のメソッドをもつ。'),
          p('① void addHorizontalLine(int x1, int x2, double y)\n横線を追加するメソッドである。左からx1番目の縦線とx2番目の縦線を縦軸座標yで接続する横線を追加する。ただし，x1とx2が等しいか，2本の縦線のいずれか又は両方に，既に縦軸座標yで接続する横線があるときには追加しない。\nあみだくじは，クラスGhostLegのインスタンスを生成した後，このメソッドを任意の回数だけ呼び出し，横線を追加することによって完成する。'),
          p('② int trace(int x)\nくじを引いた結果を返すメソッドである。左からx番目の縦線を選択し，あみだくじをたどった結果を返す。'),
          p('クラスGhostLegTesterはテスト用のプログラムである。このプログラムは，図1に示したあみだくじを作り，左から順にくじを引き，結果を表示する。実行結果を，図2に示す。'),
          p('図2 クラスGhostLegTesterの実行結果'), code(outcomes.map((end, start) => start + ' -> ' + end).join('\n'), 'text'),
          p('〔プログラム1〕'), code(first, 'java'),
        ]),
        page(55, [code(second, 'java')]),
        page(56, [
          p('〔プログラム2〕'), code(testProgram, 'java'),
          p('設問1　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。\nクラスGhostLegの内部クラスVerticalLineは1本の縦線を表すクラスであり，インスタンスは，そのインスタンスが示す縦線に接続している横線を保持している。この内部クラスでは，横線を，［　］として表現している。'),
          p('設問2　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, '1', ['クラスHorizontalLineのインスタンスの列', 'その横線が接続する縦軸座標とクラスHorizontalLineのインスタンスのマップ', 'その横線が接続する縦軸座標とその横線に接続するもう1本の縦線のマップ', 'その横線に接続する2本の縦線のマップ'], 'ウ'),
          bank(2, 'a', ['ghostLeg', 'GhostLeg', 'void ghostLeg', 'void GhostLeg'], 'イ', 'java'),
        ], [2, 3]),
        page(57, [
          p('設問3　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。\nメソッドaddHorizontalLineの呼出しにおいて，引数x1又はx2に相当する縦線がないときにはIndexOutOfBoundsExceptionが投げられる。一方，引数yには追加する横線の縦軸座標を指定するので，その値は' + lower + 'よりも大きく' + upper + '未満でなければならないが，それ以外の値を指定しても例外は投げない。\nこれを，引数x1及びx2の値によらず，引数yの値が横線の縦軸座標として取り得る範囲から外れているときにIllegalArgumentExceptionを投げるようにするには，プログラム1中のコメント“// 設問3（［e］）”の1行を次のif文に置き換えればよい。'),
          code('if ([f]) {\n    throw new IllegalArgumentException();\n}', 'java'),
        ], [
          bank(2, 'b', ['0', 'i', 'new VerticalLine()', 'null'], 'ウ', 'java'),
          bank(2, 'c', [decimalY(bottom - 1), lower, 'x', 'y'], 'イ', 'java'),
          bank(2, 'd', ['horizontalLines.get(x)', 'horizontalLines.get(y)', 'v.getOpposite(y)', 'verticalLines.get(x)'], 'ウ', 'java'),
          bank(3, 'e', ['α', 'β', 'γ', 'δ'], 'ア'),
          bank(3, 'f', ['y <= ' + lower + ' && y >= ' + upper, 'y <= ' + lower + ' || y >= ' + upper, 'y > ' + lower + ' && y < ' + upper, 'y > ' + lower + ' || y < ' + upper], 'イ', 'java'),
        ], [-1, -1, -1, 1, 1]),
      ],
      contexts: [javaReference],
      explanation: '横線は縦軸座標をキー，反対側の縦線を値とするマップに登録する。GhostLegのコンストラクタで，縦線ごとに別のVerticalLineを作る。現在の高さより低い横線のうち最も高いものを調べて反対側へ進み，下端' + lower + 'で終了する。図1の全始点の到達先は左から' + outcomes.join('，') + '。範囲外のyをx1，x2より先に判定するので，最初のgetより前のαで y <= ' + lower + ' || y >= ' + upper + ' を検査する。',
    };
  });
