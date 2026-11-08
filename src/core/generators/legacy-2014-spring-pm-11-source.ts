import { ask, bank, code, heading, p, page, panel } from './legacy-2014-spring-pm-09-13-source';

export const spring2014Pm11Program1 = `import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

class Article {
    private static final Map<String, Article> ARTICLES =
            new TreeMap<String, Article>();
    private final String id, headline, body;
    private final boolean free;

    private Article(String id, String headline,
                    String body, boolean free) {
        this.id = id;
        this.headline = headline;
        this.body = body;
        this.free = free;
    }

    static Article create(String id, String headline,
                          String body, boolean free) {
        Article article = new Article(id, headline, body, free);
        ARTICLES.put(id, article);
        return article;
    }

    static Article getArticle(String id) {
        return ARTICLES.get(id);
    }

    static Set<String> getIds() {
        return ARTICLES.keySet();
    }

    String getId() { return id; }
    String getHeadline() { return headline; }
    String getBody() { return body; }
    boolean isFree() { return free; }
}`;
export const spring2014Pm11Program2a = `abstract class User {
    private final String name;

    User(String name) {
        this.name = name;
    }

    String getName() {
        return name;`;
export const spring2014Pm11Program2b = `    }

    abstract boolean testAndMark(Article article);
}`;
export const spring2014Pm11Program3 = `class Guest extends User {
    Guest() {
        super("ゲスト");
    }

    boolean testAndMark(Article article) {
        return [a];
    }
}`;
export const spring2014Pm11Program4 = `import java.util.TimeZone;

class Member extends User {
    private static final long MILLIS_PER_DAY = 24 * 60 * 60 * 1000L;
    private Article browsedArticle;            // 閲覧済みの有料記事
    private long browseDate = Long.MIN_VALUE;  // 記事を閲覧した日付

    Member(String name) {
        [b];
    }

    boolean testAndMark(Article article) {
        if (article.isFree()) {
            return true;
        }
        long today = today();
        if (browseDate [c] today) {
            return browsedArticle == article;
        }
        // 閲覧済みの有料記事と日付を記録
        browsedArticle = article;
        browseDate = today;
        return true;
    }

    private long today() {
        long time = System.currentTimeMillis(); // 現時刻（協定世界時）
        TimeZone tz = TimeZone.getDefault();
        time += tz.getOffset(time);             // ローカル時間に変換
        return time / MILLIS_PER_DAY;
    }
}`;
export const spring2014Pm11Program5 = `class PaidMember extends Member {
    PaidMember(String name) {
        [b];
    }

    boolean testAndMark(Article article) {
        return [d];
    }
}`;
export const spring2014Pm11OriginalArticles = [
  {id:'0001',headline:'PC入門',body:'PC初心者…',free:true},
  {id:'0002',headline:'スマホ特集',body:'最新のスマホ…',free:false},
  {id:'0003',headline:'アプリガイド',body:'使えるアプリ…',free:true},
];
export type Article = typeof spring2014Pm11OriginalArticles[number];
export function javaArticleRegistration(articles: readonly Article[]) {
  return articles.map(({id,headline,body,free})=>
    `        Article.create("${id}", "${headline}", "${body}", ${free});`).join('\n');
}
export const spring2014Pm11Program6 = `public class SubscriptionSite {
    public static void main(String[] args) {
        User[] readers = {
            new Guest(),
            new Member("登録会員Ａ"),
            new PaidMember("有料会員Ｂ")
        };
${javaArticleRegistration(spring2014Pm11OriginalArticles)}
        for ([e]) {
            for ([f]) {
                Article article = Article.getArticle(id);
                String body;
                if (reader.testAndMark(article)) {
                    body = article.getBody();
                } else {
                    body = "＜閲覧不可＞";
                }
                System.out.printf("%s: 記事「%s」%s%n",
                    reader.getName(), article.getHeadline(), body);
            }
        }
    }
}`;

export const spring2014Pm11Pages = [
  page(58,p('問11 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'),
    heading('プログラムの説明'),
    p('雑誌記事のオンライン購読サイトをモデルとしたプログラムである。記事には，無料記事と有料記事がある。サイトの利用者は，誰でも無料記事を閲覧できる。利用者は，名前を登録することで登録会員となり，無料記事に加え，有料記事を1日に1本だけ無料で閲覧できる。登録は無料である。登録会員は，購読料を支払うことで有料会員となり，全ての記事を無制限に閲覧できる。'),
    p('このプログラムは，次のクラスから成る。'),
    p('（1）クラス Article：記事を表す。各記事には，記事識別子（id）が割り当てられる。各記事は，見出し（headline），本文（body）及び無料記事を表すフラグ（free）から成る。記事識別子と記事は，1対1に対応し，同一記事に対してArticleのインスタンスは高々1個しか存在しない。'),
    p('① 静的メソッド create：引数で与えられた記事識別子及び記事のデータから Article のインスタンスを生成し，登録する。記事識別子に重複はないものとする。\n② 静的メソッド getArticle：引数で与えられた記事識別子から登録されている記事である Article のインスタンスを返す。記事識別子に誤りはないものとする。\n③ 静的メソッド getIds：登録されている全記事の記事識別子の集合を返す。\n④ メソッド isFree：無料記事であれば true を返す。そうでなければ，false を返す。\n⑤ その他，記事のデータを返すメソッドが用意されている。'),
    p('（2）抽象クラス User：利用者を表す。\n① コンストラクタ：引数で与えられた利用者名をもつインスタンスを生成する。\n② メソッド getName：利用者名を返す。\n③ 抽象メソッド testAndMark：引数で与えられた記事が閲覧可能かどうかを調べ，閲覧可能であれば true を返す。そうでなければ，false を返す。この')),
  page(59,
    p('メソッドが true を返したとき，サイトは利用者に記事を表示するものとし，必要に応じて記事が閲覧済みであることを記録する。'),
    p('（3）クラス Guest：未登録の利用者（ゲスト）を表す。\n① コンストラクタ：利用者名を“ゲスト”とするインスタンスを生成する。\n② メソッド testAndMark：引数で与えられた記事が無料記事であれば true を返す。そうでなければ，false を返す。'),
    p('（4）クラス Member：登録会員を表す。\n① コンストラクタ：引数で与えられた利用者名をもつインスタンスを生成する。\n② メソッド testAndMark：引数で与えられた記事が無料記事であれば，true を返す。有料記事の場合は，今日最初の有料記事の閲覧のとき，又は今日閲覧済みの有料記事と同一であるときは，true を返す。それら以外のときは，false を返す。加えて，今日最初の有料記事の閲覧のときには，閲覧済みの記事として今日の日付とともに記録する。\n③ メソッド today：今日の日付（ローカル時間）を1970年1月1日からの日数で返す。'),
    p('（5）クラス PaidMember：有料会員を表す。\n① コンストラクタ：引数で与えられた利用者名をもつインスタンスを生成する。\n② メソッド testAndMark：全ての記事に対して true を返す。'),
    p('（6）クラス SubscriptionSite：上記クラスのテスト用プログラムである。メソッド main を実行すると，図1の結果が得られる。'),
    p('なお，Member 及び PaidMember のコンストラクタに与える利用者名の衝突は，ないものとする。'),
    panel('subscription','図1 メソッド main の実行結果')),
  page(60,heading('プログラム1'),code(spring2014Pm11Program1,'java'),
    heading('プログラム2'),code(spring2014Pm11Program2a,'java')),
  page(61,code(spring2014Pm11Program2b,'java'),
    heading('プログラム3'),code(spring2014Pm11Program3,'java'),
    heading('プログラム4'),code(spring2014Pm11Program4,'java')),
  page(62,heading('プログラム5'),code(spring2014Pm11Program5,'java'),
    heading('プログラム6'),code(spring2014Pm11Program6,'java')),
  page(63,heading('設問1'),p('プログラム中の'+ask),bank('ad'),bank('b'),bank('c'),bank('ef')),
  page(64,heading('設問2'),
    p('プログラム6で記事識別子 "0003" の記事の無料記事を表すフラグの値を false にしてプログラムを実行したとき，"＜閲覧不可＞" は何回出力されるか，正しい答えを，解答群の中から選べ。ここで，プログラム中の［a］～［f］には正しい答えが入っているものとし，プログラムは日をまたいで実行しないものとする。'),bank('s2')),
];
export const spring2014Pm11Banks = {
  ad:{options:['!article.isFree()','article.isFree()','false','this.article != article','this.article == article','this.article == null','true']},
  b:{options:['new User(name)','super()','super(name)','super.name = name','this()','this(name)','this.name = name','User(name)']},
  c:{options:['!=','<','==','>','instanceof']},
  ef:{options:['int i = 0; i < Article.getIds().size(); i++','int i = 0; i < readers.length; i++','Member reader : readers','PaidMember reader : readers','String id : Article.articles','String id : Article.getIds()','User reader : readers']},
  s2:{options:['0回','1回','2回','3回','4回','5回']},
};
