import{field,figure,p,programs,strings,variableNotes,type GenerationDefinition}from'./definition';
import{legacy2017AutumnPm11Model as model,legacy2017AutumnPm11Profiles as profiles,legacy2017AutumnPm11Figure as inspect,legacy2017AutumnPm11Banks as banks}from'./legacy-2017-autumn-pm11-model';
export const legacy2017AutumnPm11Program1=`import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

public class TableSorter {
    private Map<[a]> orderMap = new HashMap<[a]>();

    public void putSortOrder(String key, Comparator<String> order) {
        orderMap.put(key, order);
    }

    public void sort(String[][] table, final OrderBy... orderBys) {
        Arrays.sort(table, new Comparator<String[]>() {
            public int compare(String[] s1, String[] s2) {
                for ([b]) {
                    int order = orderMap.get(orderBy.key).
                        compare(s1[c], s2[c]);
                    if (order [d] 0) {
                        return [e];
                    }
                }
                return 0;
            }
        });
    }

    public static class OrderBy {
        final String key;
        final int col;
        final boolean isReversed;
        public OrderBy(String key, int col) {
            this(key, col, false);
        }
        public OrderBy(String key, int col, boolean isReversed) {
            this.key = key;
            this.col = col;
            this.isReversed = isReversed;
        }
    }
}`;
export function legacy2017AutumnPm11Program2(values:number[]){const m=model(values);return`import java.util.Comparator;

public class TableSorterTester {
    public static void main(String... args) {
        String[][] data = new String[][] {
${m.rows.map(r=>`            {${r.map(s=>JSON.stringify(s)).join(', ')}},`).join('\n')}
        };
        TableSorter sorter = new TableSorter();
        sorter.putSortOrder("lex", new Comparator<String>() {
            public int compare(String o1, String o2) {
                return o1.compareTo(o2);
            }
        });
        sorter.putSortOrder("num", new Comparator<String>() {
            public int compare(String o1, String o2) {
                return new Integer(o1).compareTo(new Integer(o2));
            }
        });
        sorter.sort(data, new TableSorter.OrderBy("lex", 0),
                    new TableSorter.OrderBy("num", 1, true));
        for (String[] row : data) {
            for (String col : row) {
                System.out.printf("%s ", col);
            }
            System.out.println();
        }
    }
}`;}
export const legacy2017AutumnPm11Replacement2=`sorter.sort(data, new TableSorter.OrderBy("lex", 2),
            new TableSorter.OrderBy("lex", 0));`;
export const legacy2017AutumnPm11Replacement3=`sorter.putSortOrder("numC", new Comparator<String>() {
    public int compare(String s1, String s2) {
        return new Integer(s1.replace(",", "")).
            compareTo(new Integer(s2.replace(",", "")));
    }
});
sorter.sort(data, new TableSorter.OrderBy("numC", 2),
            new TableSorter.OrderBy("lex", 0));`;
export const legacy2017AutumnPm11ApiAssetIds=[76,77,78].map(n=>`asset-ipa-2017h29a-fe-pm-11-api-p${n}`);
export const legacy2017AutumnPm11Definition:GenerationDefinition={source:'2017h29a-fe-pm-11',title:'旧制度・午後：Javaによる表の行の並べ替え',version:'3.2.0',fields:[field('五つの行の数値条件',0,7)],reference:[0],sourceAnswer:'設問1 a=ウ、b=ウ、c=エ、d=ア、e=ウ／設問2=イ／設問3=イ',
 notes:variableNotes+' 秋原58〜63全6頁、5行3列の図1/5矢印、図2出力、プログラム2個、α矢印と置換2個、7独立欄30択、a/c各2矩形を保持。果物名/行の役割/入力件数を固定し、第2列1桁と第3列3/4桁（カンマ）を同役割へ8条件でバインド。各数値の等値グループは維持し優先比較・数値/辞書順・逆順の判定を変える。先指定優先/全同値安定/0始まりを固定。全正答と全択を独立した安定グループ分割と実Java8互換コンパイルで検算する。必要APIは固定原76〜78を別source/rightの参照資料へ保持し、Oracle API HTML/全文は入れない。root2026-10-26後続素材判断の範囲に限定。schema/dispatcher/registry/通常App未登録、原/基準/生成shuffle=false。',
 build(values){const m=model(values),draw=(n:number,group?:number)=>{const vs=group===undefined?values:[m.v,group],f=inspect(profiles[n],vs);return figure(profiles[n],vs,f.caption,f.alt);},counts=[4,4,4,4,4,5,5],offsets=[0,4,8,12,16,20,25],answers=[2,2,3,0,2,m.secondAnswer,m.thirdAnswer];return{
 contexts:[{title:'Javaプログラムで使用するAPIの説明',blocks:legacy2017AutumnPm11ApiAssetIds.map((assetId,i)=>({type:'image' as const,assetId,caption:`原資料 APIの説明 p${76+i}`}))}],
 prompt:[p('選択した問題は、選択欄の（選）をマークしてください。マークがない場合は、採点されません。'),p('問11 次のJavaプログラムの説明及びプログラムを読んで、設問1〜3に答えよ。'),p('（Javaプログラムで使用するAPIの説明は、この冊子の末尾を参照してください。）'),p('プログラムの説明'),
 p('文字列の配列を要素にもつ配列で表現された表中の行を、並べ替えるプログラムである。表は行の配列として、行は文字列の配列として構成される。各行の指定した列が、指定した順序に並ぶように、行を並べ替える。'),p('図1は、表の最左列の文字列を辞書順に、最左列の文字列が等しい行は右隣の列の文字列を数値とみなしたときに降順になるように並べ替えた例である。'),draw(0),
 p('クラスTableSorterは、表中の行を並べ替える機能を提供する。次のメソッドと入れ子クラスOrderByをもつ。'),
 p('(1) putSortOrder(String key, Comparator<String> order) ― このクラスのメソッドsortで指定可能な順序を登録する。'),p('key ― 表を並べ替える順序を示すために使用する文字列（以下、順序指定子という）。'),p('order ― インタフェースComparator型のオブジェクトで、keyで指定した順序指定子が示す順序を規定する。'),
 p('(2) sort(String[][] table, final OrderBy... orderBys) ― 条件として指定した列が指定した順序になるように、表中の行を並べ替える。条件は複数指定できる。並び順の決定には先に指定した条件が優先される。先に指定した条件で並び順が決まらない行については、後に指定した条件を加えて決定する。指定した全ての条件で順序が決まらない行については、並べ替える前の並び順を維持する。'),
 p('table ― 整列対象の表を格納したString型の配列を要素にもつ配列を指定する。'),p('orderBys ― 条件を必要なだけ指定する。'),
 p('クラスTableSorterの入れ子クラスOrderByは並べ替えの条件を表すクラスである。フィールドkeyは順序指定子、フィールドcolは比較対象の列の位置を示す数（行を表すString型配列の添字）である。フィールドisReversedがfalseであれば、この条件が表す順序が順序指定子keyで指定されるオブジェクトのメソッドcompareが返す大小関係での昇順で並べ替えることを意味し、trueであれば、降順で並べ替えることを意味する。'),
 p('クラスTableSorterTesterはテスト用のプログラムである。実行結果を図2に示す。'),draw(1),draw(2),draw(3),
 p('設問1 プログラム1中の［　］に入れる正しい答えを、解答群の中から選べ。'),draw(4,0),draw(4,1),draw(4,2),draw(4,3),draw(4,4),
 p('設問2 プログラム2のαで示した2行を次の2行と入れ替えて実行したとき、実行結果の1行目に出力される内容として正しい答えを、解答群の中から選べ。'),draw(5,0),draw(4,5),
 p('設問3 プログラム2のαで示した2行を次の行と入れ替えて実行したとき、実行結果の3行目に出力される内容として正しい答えを、解答群の中から選べ。'),draw(5,1),draw(4,6)],
 choices:[...banks.flatMap(b=>programs([...b])),...strings(m.options.map(r=>r.join(' '))),...strings(m.options.map(r=>r.join(' ')))],answerParts:counts.map((n,i)=>({id:i<5?`part-${'abcde'[i]}`:`part-${i-3}`,label:i<5?`設問1 ${'abcde'[i]}`:`設問${i-3}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),partAnswers:answers.map((n,i)=>({kind:'choice' as const,partId:i<5?`part-${'abcde'[i]}`:`part-${i-3}`,choiceId:`choice-value-${offsets[i]+n+1}`})),
 explanation:`a：順序指定子はString、値はComparator<String>である。CharacterやStringの値ではputSortOrderとget後のcompareに一致しない。b：orderBysの各OrderByを先頭から順に調べる拡張for。添字だけを回す候補やtableの各行を回す候補ではorderByが定義されない。c：行はString[]なので[orderBy.col]で列を取り出す。配列にgetはなくcol単独も定義されていない。d：現在の条件で大小が決まったorder!=0のときだけ返し、同値なら次の条件へ進む。<や>では片側しか扱えず、==なら同値時に打ち切る。e：逆順指定trueなら符号を反転し、falseなら元の符号を返す。無条件の正負又は逆の条件では一方の順を満たさない。設問2：第3列を数値ではなく文字列として比較し、同値なら第1列辞書順。順序は${m.second.map(r=>r.join(' ')).join('／')}なので先頭は「${m.second[0].join(' ')}」。設問3：カンマを除いて整数に変換した第3列を優先し、同値なら第1列辞書順。順序は${m.third.map(r=>r.join(' ')).join('／')}なので3行目は「${m.third[2].join(' ')}」。全ての条件で同値なら元の行順が残る。API3頁はこの操作の機能・返値を確認する必要資料であり、独自解説と分けて示す。`,
 };},
};
