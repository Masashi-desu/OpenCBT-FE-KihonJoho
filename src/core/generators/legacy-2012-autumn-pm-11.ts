import { code, p, table } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2012-autumn-pm-09-13-support';
import { languageFigure } from './legacy-2012-autumn-pm-09-13-figures';
import { timerCases } from './legacy-2012-autumn-pm-11-data';

export const autumn2012PmJavaReferenceTitle = 'Java APIの参照（独自編集）';

const program1 = [
  'public interface TimerAction {',
  '    public void onStart(Timer timer, long instant);',
  '    public void onAlarm(Timer timer, long instant);',
  '    public void onCancel(Timer timer, long instant);',
  '}',
].join('\n');
const program2a = [
  'public class Timer {',
  '    private static int sequence;',
  '    private String name;',
  '    private Worker worker;',
  '    private Thread thread;',
  '    private TimerAction timerAction;',
  '',
  '    private Timer(String name, TimerAction timerAction,',
  '                  int delay) {',
  '        this.name = name;',
  '        this.timerAction = timerAction;',
  '        worker = new Worker(delay);',
  '        thread = new Thread(worker, getThreadSequenceName());',
  '    }',
  '',
  '    synchronized private static String getThreadSequenceName() {',
  '        return "Timer-" + sequence++;',
  '    }',
  '',
  '    private void start() { thread.start(); }',
  '',
  '    public static Timer createTimer(String name,',
  '                                    TimerAction action, int delay) {',
  '        Timer timer = new Timer(name, action, delay);',
  '        timer.start();',
  '        return timer;',
  '    }',
  '',
  '    public String getName() { return name; }',
  '    public void cancel() { worker.cancel(); }',
  '    public void close() throws InterruptedException {',
  '        thread.join();',
  '    }',
  '',
  '    private class Worker implements Runnable {',
  '        private final long endAt;',
  '        private volatile boolean canceled;',
  '',
  '        private Worker(int delay) {',
].join('\n');
const program2b = [
  '            endAt = currentTime() + delay * 1000;',
  '        }',
  '',
  '        public void run() {',
  '            timerAction.onStart(Timer.this, currentTime());',
  '            long delta;',
  '            while ([a]) {',
  '                try {',
  '                    Thread.sleep(delta);',
  '                } catch (InterruptedException e) {',
  '                    if (canceled) {',
  '                        [b];',
  '                    }',
  '                }',
  '            }',
  '            if (canceled) {',
  '                timerAction.onCancel(Timer.this, currentTime());',
  '            } else {',
  '                timerAction.onAlarm(Timer.this, currentTime());',
  '            }',
  '        }',
  '',
  '        private void cancel() {',
  '            canceled = true;',
  '            Timer.this.thread.interrupt();',
  '        }',
  '',
  '        private long currentTime() {',
  '            return System.currentTimeMillis();',
  '        }',
  '    }',
  '}',
].join('\n');

function program3(index: number) {
  const { delays, order } = timerCases[index];
  return [
    'import java.util.Date;',
    '',
    'public class TimerTest [c] TimerAction {',
    '    Timer longTimer, shortTimer;',
    '',
    '    private void test() [d] InterruptedException {',
    ...order.map(name => '        ' + name + 'Timer = Timer.createTimer("' + name + ' timer", [e], ' + delays[name] + ');'),
    '        shortTimer.close();',
    '        longTimer.close();',
    '    }',
    '',
    '    private void log(String msg, Timer timer, long instant) {',
    '        System.out.println(timer.getName() + ": " + msg',
    '                               + " at " + new Date(instant));',
    '    }',
    '',
    '    public void onStart(Timer timer, long instant) {',
    '        log("onStart", timer, instant);',
    '    }',
    '',
    '    public void onAlarm(Timer timer, long instant) {',
    '        log("onAlarm", timer, instant);',
    '        if (timer == shortTimer) {',
    '            [f];',
    '        }',
    '    }',
    '',
    '    public void onCancel(Timer timer, long instant) {',
    '        log("onCancel", timer, instant);',
    '    }',
    '',
    '    public static void main(String[] args) [d]',
    '                                       InterruptedException {',
    '        new TimerTest().test();',
    '    }',
    '}',
  ].join('\n');
}

const overload = [
  'private void log(String msg, long instant) {',
  '    System.out.println(Thread.currentThread().getName()',
  '             + ": " + msg + " at " + new Date(instant));',
  '}',
].join('\n');
const api = [
  ['Thread(Runnable target, String name)', '指定した名前のスレッドを組み立てる。開始すると、そのスレッドで target の run が実行される。'],
  ['Thread.currentThread()', 'この呼出しを実行しているスレッド自身を取得する。'],
  ['Thread.sleep(long millis)', '呼出しを実行中のスレッドを、指定したミリ秒数だけ休止させる。休止中の割込みは InterruptedException で通知される。'],
  ['Thread.getName()', '対象のスレッドに付けた名前を取得する。'],
  ['Thread.interrupt()', '対象のスレッドに割込みを要求する。そのスレッドが sleep や join で待機しているときは、待機側で InterruptedException が発生する。'],
  ['Thread.join()', '対象が終了するまで呼出し側が待機する。待機中に呼出し側が割り込まれると InterruptedException が発生する。'],
  ['Date(long date)', '1970年1月1日 00:00:00 UTC を基準に、引数をミリ秒単位の時刻に対応付ける。'],
  ['Date.toString()', '曜日・月の英語3文字略称、日、時:分:秒、タイムゾーン略称、西暦年の順で時刻を表示する。問題の表示例は日本標準時（JST）。'],
];

export const q11 = createLanguageDefinition(11, 'コールバックと割込みを用いるJavaタイマ', 'タイマの生成順・遅延・観測時刻', 'abcdef2', 'エアウカカアキ',
  'タイマごとの実行スレッド、終了時刻を再計算するループ、volatileと割込み、表示されるスレッド名の対応を保持する。生成順と遅延時間を一緒に変える。Java APIの補助資料は必要な動作を独自編集した資料へ置き換える。', index => {
    const { order } = timerCases[index];
    const [alarm, cancel] = ['short', 'long'].map(name => 'Timer-' + order.findIndex(entry => entry === name));
    const threadPairs = [['main', 'main'], ['main', 'Timer-0'], ['main', 'Timer-1'], ['Timer-0', 'main'],
      ['Timer-0', 'Timer-1'], ['Timer-1', 'main'], ['Timer-1', 'Timer-0']];
    const key = 'アイウエオカキ'[threadPairs.findIndex(([a, c]) => a === alarm && c === cancel)];
    return {
      pages: [
        page(57, [
          p('問11　次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。\n（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'),
          p('〔プログラムの説明〕\nスレッドを利用してタイマ処理を行うプログラムである。タイマ処理の基本機能は，秒単位で指定した時間（以下，遅延時間という）が経過したときに，インタフェースで指定したメソッドを呼び出すことである。次のクラス及びインタフェースから成る。'),
          p('（1）クラス Timer は，タイマ処理の機能を定義し実装する。\n① クラスメソッド createTimer：クラス Timer のインスタンス（以下，タイマという）を生成し，直ちにタイマ処理を開始する。引数で，タイマの名前，インタフェース TimerAction を実装するインスタンス及び遅延時間を指定する。\n② メソッド getName：タイマの名前を返す。\n③ メソッド cancel：タイマ処理をキャンセルする。\n④ メソッド close：タイマ処理が終了するまで待機する。\n⑤ 内部クラス Worker：タイマ処理を実装し，そのインスタンスは，スレッドとして実行される。実行スレッドは，スレッド名 Timer-n（nは0から始まるスレッド生成のシーケンス番号）が与えられ，次の処理を行う。\n（a）現在時刻に，タイマの生成時に指定された遅延時間を加えて，タイマの終了時刻を設定する。\n（b）実行開始時に，タイマの生成時に指定された TimerAction のインスタンスに開始の事象を通知する。\n（c）開始通知後，スレッドは終了時刻になるまで休止する。\n（d）終了時刻になったとき，終了の事象を TimerAction のインスタンスに通知し，タイマ処理の実行を終了する。\n（e）タイマ処理がキャンセルされた場合は，終了時刻になるのを待たずにキャンセルの事象を TimerAction のインスタンスに通知し，タイマ処理の実行を終了する。\nここで，フィールド canceled は，複数スレッドから非同期にアクセスされるので volatile 修飾子を付けて宣言しておく。'),
        ]),
        page(58, [
          p('（2）インタフェース TimerAction は，タイマ処理で事象が発生したときにタイマから事象の通知を受けるメソッドを定義する。タイマを利用するプログラムは，このインタフェースの全メソッドを実装しなければならない。各メソッドの引数は，事象が発生した Timer のインスタンス及び事象発生の時刻である。\n① メソッド onStart：タイマ処理の開始時に呼び出される。\n② メソッド onAlarm：タイマ生成時に指定した遅延時間が経過したときに呼び出される。\n③ メソッド onCancel：タイマ処理がキャンセルされたときに呼び出される。'),
          p('クラス TimerTest は，タイマ処理のテストプログラムである。メソッド main は，TimerTest のインスタンスを生成し，メソッド test を実行する。test は，二つのタイマを生成し，終了を待つ。メソッド onAlarm が，shortTimer を引数として呼び出された場合，longTimer のタイマ処理をキャンセルする。\nこのテストを実行したところ，図1の結果が得られた。プログラムの実行速度は十分に速いものとし，各メソッドの処理時間は秒単位の時刻の測定に影響がないものとする。'),
          languageFigure(11, 'original-output', index, '図1 テストプログラムの実行結果'),
        ]),
        page(59, [p('〔プログラム1〕'), code(program1, 'java'), p('〔プログラム2〕'), code(program2a, 'java')]),
        page(60, [code(program2b, 'java')]),
        page(61, [p('〔プログラム3〕'), code(program3(index), 'java')]),
        page(62, [p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['(delta = endAt + currentTime()) < 0', '(delta = endAt + currentTime()) > 0',
            '(delta = endAt - currentTime()) < 0', '(delta = endAt - currentTime()) > 0'], 'エ', 'java'),
          bank(1, 'b', ['break', 'canceled = false', 'continue', 'delta = 0', 'endAt = 0', 'return'], 'ア', 'java'),
          bank(1, 'cd', ['expands', 'extends', 'implements', 'subclasses', 'throw', 'throws'], 'ウカ', 'java'),
          bank(1, 'e', ['longTimer', 'new Runnable()', 'new Timer()', 'new TimerAction()', 'shortTimer', 'this'], 'カ', 'java'),
          bank(1, 'f', ['longTimer.cancel()', 'onCancel(longTimer, instant)', 'onCancel(shortTimer, instant)', 'onCancel(timer, instant)', 'shortTimer.cancel()', 'timer.cancel()'], 'ア', 'java'),
        ]),
        page(63, [
          p('設問2　クラス TimerTest に，メソッド log をオーバロードする次のメソッドを追加した。このメソッドは，タイマの名前の代わりにスレッド名を表示する。'),
          code(overload, 'java'),
          p('メソッド onAlarm 及び onCancel で，このオーバロードしたメソッド log を呼び出すように変更したところ，図2の実行結果が得られた。図2の3行目及び4行目の［　］に入れる文字列の組合せとして正しい答えを，解答群の中から選べ。ここで，メソッド main を実行するスレッドの名前は main とする。また，［a］～［f］には正しい答えが入っているものとする。'),
          languageFigure(11, 'modified-output', index, '図2 TimerTest 変更後の実行結果'),
        ], [bank(2, '2', threadPairs.map(([a, c]) => 'g1：' + a + '　g2：' + c), key)]),
      ],
      contexts: [{ title: autumn2012PmJavaReferenceTitle, presentation: 'text_figure', blocks: [
        p('冊子p.77–78のAPI（Application Programming Interface、プログラムから機能を利用するための仕様）に対応する要点を、Oracle Java SE 7のThreadとDateの仕様から独自に整理した。'),
        table('ThreadとDateの動作', ['操作', '動作'], api),
      ] }],
      explanation: '休止する長さは終了時刻から現在時刻を引いた残り時間であり、正の間だけ繰り返す。キャンセルによる割込みでループを break し、後続の onCancel を実行する。TimerTest は TimerAction を implements し、close の InterruptedException を test と main の throws で宣言する。this をコールバックの受け手とし、shortTimer の終了時に longTimer.cancel() を呼ぶ。スレッド名の連番は生成順で決まる。onAlarm を記録する短いタイマは ' + alarm + '、割込み後に自分で onCancel を記録する長いタイマは ' + cancel + ' である。',
    };
  });
