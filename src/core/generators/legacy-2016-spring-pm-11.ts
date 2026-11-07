import { code, field, p, table, type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { answerBody, choiceBankText, heading, pageAlt, selectCase } from './legacy-2016-spring-pm-09-13-support';
import type { SourcePage } from './legacy-2016-autumn-pm-09-13-support';

type Priority = 'LOW' | 'MIDDLE' | 'HIGH';
type Task = {subject: string; deadline: string; priority: Priority};
type Selection = {deadline: string; priority: Priority; changes: [index: number, task: Partial<Task>][]};
const originalTasks: Task[] = [
  {subject: 'メール送信', deadline: '201604181500', priority: 'HIGH'},
  {subject: 'ホテル予約', deadline: '20160420', priority: 'LOW'},
  {subject: 'チケット購入', deadline: '20160430', priority: 'MIDDLE'},
  {subject: '報告書作成', deadline: '20160428', priority: 'HIGH'},
  {subject: '会議室予約', deadline: '201605301200', priority: 'HIGH'},
  {subject: 'PC購入', deadline: '20160531', priority: 'HIGH'},
];
const selections: Selection[] = [
  {deadline: '20160501', priority: 'HIGH', changes: []},
  {deadline: '20160425', priority: 'LOW', changes: [[0, {priority: 'LOW'}]]},
  {deadline: '20160510', priority: 'MIDDLE', changes: [[3, {priority: 'MIDDLE', deadline: '201605091200'}]]},
  {deadline: '20160601', priority: 'HIGH', changes: [[0, {priority: 'MIDDLE'}]]},
  {deadline: '20160530', priority: 'HIGH', changes: [[3, {deadline: '20160530'}], [1, {priority: 'HIGH'}]]},
  {deadline: '20160515', priority: 'MIDDLE', changes: [[4, {priority: 'MIDDLE', deadline: '201605141200'}]]},
  {deadline: '20160430', priority: 'HIGH', changes: [[0, {deadline: '201604301500'}], [1, {priority: 'HIGH'}]]},
  {deadline: '20160530', priority: 'HIGH', changes: [[0, {priority: 'LOW'}], [4, {deadline: '201605290900'}]]},
];
const bankOrder = [5, 4, 2, 3, 1, 0];
const codeAnswers = [
  ['((ToDo) o).id.equals(id)', '(ToDo) o.id.equals(id)', 'id.equals(id)', 'o.id.equals(id)'],
  ['!todoList.contains(todo)', '!todoList.isEmpty()', 'todoList.contains(todo)', 'todoList.isEmpty()'],
  ['!= -1', '< todoList.size()', '== -1', '>= todoList.size()'],
  ['boolean selected = false', 'boolean selected = true', 'int selected = 0', 'int selected = todoList.size()'],
  ['+=', '=', '==', '|='],
];

const todo = `import java.util.UUID;

public class ToDo {
    public enum Priority { LOW, MIDDLE, HIGH }
    public enum State { NOT_YET_STARTED, STARTED, DONE }

    // 8桁又は12桁の数字から成る文字列と一致する正規表現
    private static final String DEADLINE_PATTERN = "\\\\d{8}|\\\\d{12}";

    private final String id;
    private String subject;
    private String deadline;
    private Priority priority;
    private State state;

    private ToDo(String subject, String deadline, Priority priority,
                 String id, State state) {
        if (!deadline.matches(DEADLINE_PATTERN)) {
            throw new IllegalArgumentException();
        }
        this.subject = subject;
        this.deadline = deadline;
        this.priority = priority;
        this.id = id;
        this.state = state;
    }

    public ToDo(String subject, String deadline, Priority priority) {
        this(subject, deadline, priority,
             UUID.randomUUID().toString(), State.NOT_YET_STARTED);
    }

    public ToDo(ToDo todo) {
        this(todo.subject, todo.deadline, todo.priority, todo.id, todo.state);
    }

    public String getSubject() { return subject; }
    public String getDeadline() { return deadline; }
    public Priority getPriority() { return priority; }
    public State getState() { return state; }
    public void setState(State state) { this.state = state; }
    public int hashCode() { return id.hashCode(); }

    public boolean equals(Object o) {
        return o instanceof ToDo && [a];
    }

    public String toString() {
        return String.format("主題: %s, 期限: %s, 優先度: %s, 状態: %s",
                             subject, deadline, priority, state);
    }
}`;
const todoList = `import java.util.ArrayList;
import java.util.List;

public class ToDoList {
    private List<ToDo> todoList = new ArrayList<ToDo>();

    public void add(ToDo todo) {
        if ([b]) {
            todoList.add(new ToDo(todo));
        }
    }

    public void update(ToDo todo) {
        int index = todoList.indexOf(todo);
        if (index [c]) {
            todoList.set(index, todo);
        }
    }

    public List<ToDo> select(Condition... conditions) {
        List<ToDo> result = new ArrayList<ToDo>();
        for (ToDo todo : todoList) {
            [d];
            for (Condition condition : conditions) {
                selected [e] condition.test(todo);
                if (!selected) break;
            }
            if (selected) {
                result.add(new ToDo(todo));
            }
        }
        return result;
    }
}`;
const condition = `public interface Condition {
    boolean test(ToDo todo);
}`;
function example(index: number) {
  const selection = selections[index], tasks = originalTasks.map(task => ({...task}));
  for (const [i, change] of selection.changes) Object.assign(tasks[i], change);
  return {selection, tasks};
}
const describe = (task: Task) => `主題: ${task.subject}, 期限: ${task.deadline}, 優先度: ${task.priority}`;
export function spring2016Pm11Programs(index: number) {
  const {selection, tasks} = example(index);
  const call = (task: Task, method: string) =>
    `        list.${method}(new ToDo("${task.subject}", "${task.deadline}", ToDo.Priority.${task.priority}));`;
  const tester = `public class ToDoListTester {
    public static void main(String[] args) {
        ToDoList list = new ToDoList();
${tasks.slice(0, 5).map(task => call(task, 'add')).join('\n')}
${call(tasks[5], 'update')}
        for (ToDo todo : list.select()) {
            todo.setState(ToDo.State.STARTED);
            list.update(todo);
        }
        Condition condition1 = new Condition() {
            public boolean test(ToDo todo) {
                return todo.getDeadline().compareTo("${selection.deadline}") < 0;
            }
        };
        Condition condition2 = new Condition() {
            public boolean test(ToDo todo) {
                return todo.getPriority().equals(ToDo.Priority.${selection.priority});
            }
        };
        for (ToDo todo : list.select(condition1, condition2)) {
            System.out.println(todo);
        }
    }
}`;
  return {todo, todoList, condition, tester};
}

export const spring2016Pm11EditorialTitle = 'Java APIの動作（独自作成の参考資料）';
const apiReference: NonNullable<GeneratedBody['contexts']> = [{
  title: spring2016Pm11EditorialTitle, presentation: 'text', blocks: [
    p('APIはApplication Programming Interface（アプリケーション・プログラミング・インタフェース）の略である。以下はこの問題で使う型・操作の動作を独自に整理した参考資料である。'),
    heading('java.util.List<E> と java.util.ArrayList<E>'),
    p('List<E> は要素を順序付きで扱うインタフェースで、Iterable<E> を継承する。Eは要素の型である。ArrayList<E>は配列を内部に持つListの実装で、引数なしの ArrayList() で要素数0から始められる。添字は先頭を0とする。'),
    table('Listで使う操作', ['呼出しの型と引数', '処理と戻り値'], [
      ['boolean add(E e)', '渡された要素eを末尾へ置く。この問題のリストでは追加後にtrueを返す。'],
      ['E set(int index, E e)', '添字indexの要素をeに変更し，置換前の要素を返す。indexが0未満かsize()以上ならIndexOutOfBoundsExceptionとなる。'],
      ['boolean contains(Object obj)', 'objと等しい要素をequalsで探し，見つかった場合はtrue、見つからなければfalseを返す。'],
      ['boolean isEmpty()', '要素数0のときだけtrueを返す。'],
      ['int size()', '現在入っている要素の個数を整数で返す。'],
      ['int indexOf(Object obj)', 'objと等しい要素のうち先頭に最も近いものの添字を返す。一つもなければ−1を返す。'],
    ]),
    heading('java.lang.String'),
    p('Stringは文字の並びを表すfinalクラスである。boolean matches(String regex) は引数regexに渡した正規表現が文字列全体に当てはまればtrue、それ以外はfalseを返す。この問題の式は8桁か12桁の数字列に当てはまる。'),
    p('int compareTo(String str) は引数strと先頭から辞書順で比較し、同じなら0、呼出し元が先なら負、後なら正を返す。一方がもう一方の先頭部分と一致するなら短い方が先になる。'),
    heading('java.util.UUID'),
    p('UUIDはUniversally Unique Identifier（汎用一意識別子）の略で、Javaでは128ビットの識別値を表すfinalクラスを指す。static UUID randomUUID() は引数を取らず、ランダムに生成したUUIDを返す。この問題ではToDoの識別にその文字列表現を用いる。'),
  ],
}];
function pages(index: number): SourcePage[] {
  const {tasks} = example(index), prog = spring2016Pm11Programs(index);
  const todoLines = prog.todo.split('\n'), todoListLines = prog.todoList.split('\n');
  const todoBoundary = todoLines.findIndex(line => line.includes('public boolean equals'));
  const listBoundary = todoListLines.findIndex(line => line.includes('return result'));
  return [
    {page: 51, blocks: [
      p('問11 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
      p('Javaプログラムで使用するAPIの説明は，付属の参考資料を参照してください。'),
      heading('〔プログラムの説明〕'),
      p('“すべきこと”（以下，ToDoという）を管理するプログラムである。'),
      p('(1) クラスToDoはToDoを表すクラスであり，コンストラクタで主題，期限，重要度を指定する。期限は，年月日を表す8桁又は年月日時分を表す12桁の数字から成る文字列（以下，日時という）であり，例えば，2016年4月16日を表す文字列は“20160416”，2016年4月16日午後1時0分を表す文字列は“201604161300”である。ここで，日時に誤りはないものとする。'),
      p('主題，期限，重要度を取得する各メソッドと，状態を設定及び取得するメソッド，ToDoを識別するフィールドidをもつ。'),
      p('列挙PriorityはToDoの重要度を表す列挙であり，重要度が低い順にLOW，MIDDLE，HIGHである。'),
      p('列挙StateはToDoの状態を表す列挙であり，NOT_YET_STARTEDは未着手，STARTEDは着手済み，DONEは完了を表す。'),
      p('(2) クラスToDoListはToDoのリストを保持するクラスである。リスト中に，フィールドidの値が同じToDoを複数個含まないことを保証する。ToDoを追加するメソッドaddと，ToDoの更新を行うメソッドupdate，条件に合うToDoのリストを返すメソッドselectをもつ。'),
      p('メソッドaddの引数に，既にリストに保持されているToDoを指定したとき，及びメソッドupdateの引数に，リストにないToDoを指定したときは何もしない。'),
      p('メソッドselectの引数には，条件を0個以上指定できる。条件を指定したときは，全ての条件に合致するToDoから成るリストを返す。条件を指定しないときは，保持する全てのToDoから成るリストを返す。'),
      p('(3) インタフェースConditionは，ToDoを選択する際の条件を表すクラスが実装するインタフェースである。メソッドtestは条件に合致するときにtrueを返す。'),
      p('(4) クラスToDoListTesterは，テスト用のクラスである。'),
    ]},
    {page: 52, blocks: [heading('〔プログラム1〕'), code(todoLines.slice(0, todoBoundary).join('\n').trimEnd(), 'java')]},
    {page: 53, blocks: [
      code(todoLines.slice(todoBoundary).join('\n'), 'java'),
      heading('〔プログラム2〕'), code(todoListLines.slice(0, listBoundary).join('\n'), 'java'),
    ]},
    {page: 54, blocks: [
      code(todoListLines.slice(listBoundary).join('\n'), 'java'),
      heading('〔プログラム3〕'), code(prog.condition, 'java'),
      heading('〔プログラム4〕'), code(prog.tester, 'java'),
    ]},
    {page: 55, blocks: [p('設問1 プログラム中の［a］〜［e］に入れる正しい答えを，解答群の中から選べ。')],
      banks: codeAnswers.map((bank, i) => choiceBankText('abcde'[i], bank))},
    {page: 56, blocks: [
      p('設問2 プログラム4の実行結果を図1に示す。［f］、［g］に入れる正しい答えを，解答群の中から選べ。'),
      code('［f］, 状態: STARTED\n［g］, 状態: STARTED', 'text'), p('図1 プログラム4の実行結果'),
    ], banks: [choiceBankText('設問2', bankOrder.map(i => describe(tasks[i])))]},
  ];
}
export function spring2016Pm11OriginalPageAlt() {
  const source = pages(0);
  source[0].blocks[1] = p('Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。');
  return pageAlt(source);
}
function build(values: number[]): GeneratedBody {
  const index = selectCase(values, selections.length), {selection, tasks} = example(index);
  const winners = tasks.slice(0, 5).filter(task => task.deadline < selection.deadline && task.priority === selection.priority);
  const options = bankOrder.map(i => describe(tasks[i]));
  return answerBody(pages(index).flatMap(page => page.blocks), [
    ...codeAnswers.map((bank, i) => ({
      names: ['abcde'[i]], labels: ['設問1 ' + 'abcde'[i]], options: bank, keys: [[0, 0, 0, 1, 1][i]], language: 'java',
    })),
    {names: ['f','g'], labels: ['設問2 f','設問2 g'], options, keys: winners.map(task => options.indexOf(describe(task)))},
  ], `a：oがToDoの場合にキャストしてidを比較する。自分のid同士を比較すると，異なるToDoも同じと判定してしまう。b：containsが偽のときだけ追加し，同じidの重複を防ぐ。c：indexOfが−1を返したときは置換しない。0は先頭の有効な添字である。d：条件なしも選択できるよう，selectedの初期値をtrueにする。e：条件の結果を代入し，一つでも偽になればbreakする。したがって，複数条件は全て成立したときだけ選ばれる。\n設問2：PC購入は更新対象のidがリストになく，追加されない。最初のselectには引数がないので，既存の5件の状態をSTARTEDに更新する。次のselectは，期限が辞書順で“${selection.deadline}”未満かつ重要度が${selection.priority}のものを選び，登録順のまま${winners.map(task => '「' + task.subject + '」').join('、')}を出力する。`, apiReference);
}
export const legacy2016SpringPm11Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-11', title: '旧制度・午後：JavaによるToDo管理',
  fields: [field('期限と重要度の条件番号', 0, 7)], reference: [0], version: '3.6.0',
  sourceAnswer: '設問1 a=ア，b=ア，c=ア，d=イ，e=イ／設問2 f=カ，g=エ',
  publicNotes: '原プログラムの構造を保ち，実行例の期限と重要度の条件を変更します。Java APIの参考資料は必要な動作を独自に整理しています。',
  notes: 'PDF p51–56の7欄、26固有択・32参照。期限8/12桁、0条件・全条件、重複id、未登録更新、コピーの状態を保持。8条件で比較基準日・優先度・対象データを同時変更、選択結果は常に2件。付属API p69–70の画像・文言は配布せず、型/引数/戻り値/範囲外例外の事実を別帰属の参考として独自に記述。Java 8互換コンパイル実行と独立リストモデルで全択を検算。',
  build,
};
