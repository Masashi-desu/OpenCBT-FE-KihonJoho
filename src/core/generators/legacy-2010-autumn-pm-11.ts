import { code, p } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2010-autumn-pm-09-13-support';

const queueSizes = [3, 2, 4, 5] as const;
const broadcasts = [
  [['yamada', 'こんにちは。山田です。'], ['sato', 'こんにちは。'], ['yamada', '開発プランの資料は届いていますか。'], ['sato', 'はい、手元にあります。'], ['yamada', 'では、資料に沿ってご説明します。']],
  [['sato', '検証を始めます。'], ['sato', '一件目の結果が出ました。'], ['yamada', '結果を受け取りました。'], ['sato', '二件目に進みます。'], ['yamada', '記録しました。']],
  [['yamada', '計画表を更新しました。'], ['sato', '更新を確認します。'], ['sato', '第一案を確認しました。'], ['yamada', '次は第二案です。'], ['sato', '第二案も確認しました。']],
  [['sato', '配信を試します。'], ['yamada', 'こちらからも送ります。'], ['yamada', '二つ目を送ります。'], ['yamada', '三つ目を送ります。'], ['sato', '受信を確認しました。']],
] as const;

const program1 = (size: number) => `import java.util.LinkedList;

public class MessageQueue {
    // 格納できる最大のメッセージ数
    private final static int MAX_SIZE = ${size};
    private final LinkedList<String> queue = new LinkedList<String>();

    public synchronized void put(String message) {
        while (queue.size() >= MAX_SIZE) {
            try {
                wait();
            } catch (InterruptedException e) { }
        }
        queue.add(message);
        notifyAll();
    }

    public synchronized String take() {
        while (［a］) {
            try {
                wait();
            } catch (InterruptedException e) { }
        }
        String message = queue.removeFirst();
        notifyAll();
        return message;
    }
}`;
const program2a = `import java.util.HashMap;
import java.util.Map;

public class ConfServer implements Runnable {
    // ConfServer のインスタンス
    private static final ConfServer server;
    static {
        server = new ConfServer();
        new Thread(server).start();
    }

    // クライアントからのメッセージを格納するメッセージキュー
    private final MessageQueue queue = new MessageQueue();

    // セッション管理テーブル
    private final Map<Session, ConfClient> sessionsTable
              = new HashMap<Session, ConfClient>();

    public static Session login(ConfClient client) {
        if (client == null)
            throw new NullPointerException();
        return server.loginImpl(client);
    }

    private ConfServer() { }

    public void run() {
        while (true) {
            String message = queue.take();
            deliverMessage(message);
        }
    }

    private void writeMessage(Session session,
                                      String message) {
        ConfClient client = getClient(session);
        String s = client.getName() + ": " + message;
        queue.put(s);
    }

    private synchronized void deliverMessage(String message) {
        for (Session session : sessionsTable.keySet())
            ［b］.displayMessage(message);
    }

    private synchronized ConfClient getClient(Session session) {
        ConfClient client = sessionsTable.get(session);
        if (client == null)
            throw new IllegalStateException("無効なセッション");
        return client;
    }`;
const program2b = `    private synchronized Session loginImpl(ConfClient client) {
        if (sessionsTable.containsValue(client))
            throw new IllegalArgumentException(
                      client.getName() + "はログイン済み");
        Session session = new Session();
        sessionsTable.put(session, client);
        return session;
    }

    private synchronized void logoutImpl(Session session) {
        sessionsTable.remove(session);
    }

    public static class Session {
        private Session() { }

        public void writeMessage(String msg) {
            server.writeMessage(this, msg);
        }

        public void logout() {
            server.logoutImpl(［c］);
        }
    }
}`;
const program3 = `public abstract class ConfClient {
    private final String name;

    public ConfClient(String name) {
        if (name == null)
            throw new NullPointerException();
        this.name = name;
    }

    public final String getName() { return name; }

    public abstract void displayMessage(String message);

    public boolean equals(Object obj) {
        if (!(obj instanceof ConfClient))
            return false;
        return name.equals(((ConfClient)obj).name);
    }

    public int hashCode() {
        return name.hashCode();
    }
}`;
const program4 = (index: number) => `public class TestClient ［d］ ConfClient {
    TestClient(String name) { ［e］; }

    public void displayMessage(String message) {
        System.out.println(message + " >" + getName());
    }

    public static void main(String[] arg) {
        ConfServer.Session yamada
                  = ConfServer.login(new TestClient("山田"));
        ConfServer.Session sato
                  = ConfServer.login(new TestClient("佐藤"));

${broadcasts[index].map(([sender, message]) => `        ${sender}.writeMessage("${message}");`).join('\n')}

        // 全メッセージを配信し終わるように、1秒間待つ。
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) { }
        yamada.logout();
        sato.logout();
    }
}`;

const concurrencyOptions = [
  'クラスConfClientのインスタンスがそれぞれ別スレッドとして同時に動くことを想定すると，一度にフィールドqueueで参照されるLinkedListのインスタンスにアクセスが集中することが考えられる。そこで，一時点でqueueにアクセスできるスレッドを一つにして，システムに負荷がかかりすぎるのを防ぐ。',
  'クラスConfClientのインスタンスがそれぞれ別スレッドとして同時に動くことを想定すると，タイミングによってはフィールドqueueで参照されるLinkedListのインスタンスに格納されている他のスレッドが書き込んだメッセージを読み出すことができ，セキュリティ上問題となる。そこで，一時点でqueueにアクセスできるスレッドを一つにして，queueに既に書き込まれているメッセージを読み出せないようにする。',
  'クラスConfClientのインスタンスとクラスConfServerのインスタンスは別スレッドとして動くので，フィールドqueueで参照されるLinkedListのインスタンスに対しての操作が同時に実行されることがある。そこで，一時点でqueueにアクセスできるスレッドを一つにして，データの内部状態に矛盾が起きないようにする。',
  'クラスConfClientのインスタンスの個数が多いとフィールドqueueで参照されるLinkedListのインスタンスに格納するメッセージ数の増大によってメモリ不足によるエラーが発生し，ConfServerを実行しているスレッドが停止する可能性がある。そこで，ConfClientのインスタンスの個数を制限して，エラーを起こさないようにする。',
];

export const autumn2010PmJavaReference = {
  title: 'Java APIの補足（独自作成）',
  presentation: 'text' as const,
  blocks: [
    p('LinkedList<E>：new LinkedList<E>()で空のリストを作る。add(E)は末尾への追加で，成功するとtrueを返す。isEmpty()は要素がないときにtrue，size()は現在の要素数を返す。removeFirst()は先頭を取り出して削除する。空ならNoSuchElementExceptionとなる。LinkedList自体には同時更新を排他する機能がない。'),
    p('Map<K,V>とHashMap<K,V>：HashMapはMapの実装の一つで，new HashMap<K,V>()は対応のない空の状態を作る。keySet()は登録済みのキーの集合を返す。get(key)でそのキーの値を得る。put(key,value)は登録又は上書きし，remove(key)はその対応を取り除く。getで未登録のキーを指定した場合はnull。putとremoveの戻り値は以前の値（対応がなければnull）。containsValue(value)は等しい値が一件でもあるかを調べる。HashMapでは反復順序は定まらず，構造を複数スレッドで変更する場合は呼出し側で排他する。'),
    p('Object.wait()とnotifyAll()：モニタを所有するスレッドがwait()を呼ぶと，モニタを解放して待つ。notifyAll()は同じモニタで待つスレッドを再開の候補にする。待機を終えるスレッドはモニタを再取得する。起床した時点で条件が満たされるかは再確認する。'),
    p('照合資料：Oracle Java SE 6 API（java.util.LinkedList、java.util.Map、java.util.HashMap、java.lang.Object）。'),
  ],
};

export const q11 = createLanguageDefinition(11, 'Java：電子会議のメッセージキューと排他', 'キュー容量と発信順の条件', 'abcde2',
  '設問1 a=イ、b=カ、c=オ、d=イ、e=イ／設問2=ウ',
  '原52〜58頁・6欄30固有択30参照。単独サーバスレッド、先入れ先出し、満杯/空の待機、セッション管理、発信者を含む全ログイン先への配信、プログラム1〜4の全行と継続行を保持。3/2/4/5件のキュー容量と発信順・内容を変える。同じメソッドと型規則を問う6欄の正答式・理由は固定。原付録p72〜74は配布せず、一次API仕様の必要な操作を独自に記述。型、キュー状態、キー照合及び排他の反例を独立に検証。',
  index => ({
    pages: [
      page(52, [p('次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。\n'
        + (index === 0 ? '（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）' : '（プログラムで使用するAPIは，「Java APIの補足」を参照してください。）')),
        p('〔プログラムの説明〕\n電子会議システムのプログラムである。\n電子会議は，サーバに接続しているクライアント間で行われ，一つのクライアントは，会議の参加者1人に対応する。会議に参加するときは，電子会議システムのサーバにログインする。参加者の発言はクライアントからのメッセージとしてサーバに送られる。サーバは受信したメッセージを，発信元クライアントを含む全クライアントに配信する。会議から退出するときは，ログアウトする。\nこの電子会議システムのサーバを実装するために，次のクラスを定義する。'),
        p('（1）クラスMessageQueueは，クライアントからのメッセージを格納するための待ち行列（メッセージキュー）である。メッセージは，先入れ先出しで管理される。メソッドputは，引数messageで与えられたメッセージをメッセージキューに追加する。メッセージキューに格納できるメッセージ数には制限があり，満杯のときは，空きができるまで待つ。メソッドtakeは，メッセージキューの先頭からメッセージを取り出す。メッセージキューが空のときは，メッセージが追加されるまで待つ。'),
        p('（2）クラスConfServerは，サーバを定義する。クライアントとのログイン状態を管理し，メッセージの受信と配信を行う。ここでクライアントとは，（3）で説明する抽象クラスの型のインスタンスである。クラスConfServerは，クラスが初期化されるときにインスタンスが作成され，単独のスレッドとして動作する。メソッドrunは，メッセージキューからメッセージを取り出し，ログインしている全クライアントにそのメッセージを配信する。この操作を繰り返す。メソッドloginは，入れ子クラスConfServer.Sessionのインスタンスを生成し，それをキーとしてクライアントを管理テーブルに登録し，そのインスタンスを返す。クライアントが既に登録されている場合は，IllegalArgumentExceptionを投げる。クライアントが管理テーブルに登録されているとき，そのクライアントはサーバにログインしている状態であるとする。'),
        p('（3）抽象クラスConfClientは，サーバが必要とするクライアントの機能を定義する。サーバは，メソッドdisplayMessageを呼び出してクライアントにメッセージを配')]),
      page(53, [p('信する。クライアントは，このクラスを実装しなければならない。クライアントがサーバにメッセージを送信するときは，ログイン時に返されたクラスConfServer.SessionのインスタンスのメソッドwriteMessageを呼び出す。クライアントがログアウトするときは，同じインスタンスのメソッドlogoutを呼び出す。'),
        p('（4）サーバをテストするために，クラスTestClientを定義する。このクラスは，ConfClientで定義されたメソッドをテスト用に実装する。TestClientのインスタンスは，サーバに対してクライアントの役割をする。メソッドdisplayMessageは，メッセージを次の形式で出力する。'),
        p('発信クライアント名：メッセージ ＞受信クライアント名'),
        p('〔プログラム1〕'), code(program1(queueSizes[index]), 'java')], undefined, undefined, true),
      page(54, [p('〔プログラム2〕'), code(program2a, 'java')]),
      page(55, [code(program2b, 'java'), p('〔プログラム3〕'), code(program3, 'java')]),
      page(56, [p('〔プログラム4〕'), code(program4(index), 'java')]),
      page(57, [p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')], [
        bank(1, 'a', ['!queue.isEmpty()', 'queue.isEmpty()', 'queue.size() != MAX_SIZE', 'queue.size() < MAX_SIZE', 'queue.size() == MAX_SIZE'], 'イ', 'java'),
        bank(1, 'b', ['session.get(message)', 'session.get(server)', 'session.get(sessionsTable)', 'sessionsTable.get(message)', 'sessionsTable.get(server)', 'sessionsTable.get(session)'], 'カ', 'java'),
        bank(1, 'c', ['queue', 'server', 'session', 'sessionsTable', 'this'], 'オ', 'java'),
        bank(1, 'd', ['abstract', 'extends', 'implements', 'static', 'throws'], 'イ', 'java'),
        bank(1, 'e', ['super()', 'super(name)', 'super(this)', 'this()', 'this(name)'], 'イ', 'java'),
      ]),
      page(58, [p('設問2　クラスMessageQueueのメソッドput及びtakeには，synchronized修飾子が付けられている。これには理由が二つある。一つは，キューの状態（空又は満杯）によってスレッド間でメソッドwait及びnotifyAllを呼び出して同期を取るためである。もう一つの理由として適切な答えを，解答群の中から選べ。')],
        [{ ...bank(2, '2', concurrencyOptions, 'ウ'), label: '解答群' }]),
    ],
    contexts: [autumn2010PmJavaReference],
    explanation: `aはqueue.isEmpty()。容量${queueSizes[index]}のキューから取り出すとき，空の間だけ待つ。満杯で待つputとは条件が異なる。bはsessionsTable.get(session)。keySet()の各SessionをキーにConfClientを取得して配信し，発信者にも届く。cはthis。logoutを呼ばれたSession自身が登録キーである。dはextendsで抽象クラスを継承し，eのsuper(name)で親の唯一のコンストラクタへ名前を渡す。設問2はLinkedListの追加と削除が同時に内部構造を変更することを防ぐための排他制御。アクセス権を制御したり，クライアントの人数を制限したりする仕組みではない。送信順に取り出し，${broadcasts[index][0][1]}が最初のメッセージとなる。各メッセージの配信先同士の順序はHashMapに依存する。`,
  }), { answerVariation: 'fixed' });
