import { ask, bank, code, heading, p, page } from './legacy-2014-autumn-pm-09-13-source';

export const autumn2014Pm11Period = `import java.util.Date;

public final class Period {
    private static final Date EPOCH = new Date(0L);
    private final Date start, end;

    public Period(Date start, Date end) {
        if (start == null || end == null) {
            throw new NullPointerException();
        }
        if (start.compareTo(EPOCH) < 0
                || end.compareTo(EPOCH) < 0) {
            throw new IllegalArgumentException();
        }
        this.start = start;
        this.end = end;
    }

    public Date getStart() { return start; }

    public Date getEnd() { return end; }

    public long getLength() {
        return end.getTime() - start.getTime();
    }

    public boolean isBackward() {
        return end.compareTo(start) < 0;
    }

    public boolean contains(Date time) {
        return (time.compareTo(start) >= 0
                    && time.compareTo(end) < 0)
               || (time.compareTo(start) [a] 0
                    && time.compareTo(end) [b] 0);
    }
}`;

export const autumn2014Pm11TestStart = `import java.util.Date;

public class PeriodTest {
    private static final long DELTA = 60 * 60 * 1000L;

    // コンストラクタが，正しくない引数に対して仕様どおりに例外を投げること
    // を確認する。引数expectedは，期待される例外の型をクラスで指定する。
    private static void testException(Date start, Date end,
                  Class<? extends RuntimeException> expected) {
        try {
            Period period = new Period(start, end);
        } catch (RuntimeException e) {
            if (e.getClass() == expected) {
                return;
            }
            throw new RuntimeException("unexpected exception", e);
        }
        throw new RuntimeException("no " + expected + " thrown");
    }

    // 期間の長さ及び方向（始点と終点の前後関係）の整合性を確認する。
    private static void testConsistency(Period period,
                                        long length) {
        if (period.getLength() != length) {
            throw new RuntimeException("invalid getLength() value");
        }
        if (period.isBackward() != (length [c] 0)) {
            throw new RuntimeException("isBackward failed");
        }
    }

    // メソッドcontainsが，期間に含まれるデータ及び含まれないデータ
    // に対して正しく判定することを確認する。また，メソッドの引数が
    // nullのとき，NullPointerExceptionを投げることを確認する。
    private static void testContains(Period period, long[] valid,
                                     long[] invalid) {
        for (long time : valid) {
            if (!period.contains(new Date(time))) {
                throw new RuntimeException("failed with valid: " + time);
            }
        }
        for (long time : invalid) {
            if (period.contains(new Date(time))) {
                throw new RuntimeException("failed with invalid: "
                                           + time);
            }
        }
        try {
            period.contains(null);`;

export const autumn2014Pm11TestEnd = `            throw new RuntimeException("no NPE thrown");
        } catch (NullPointerException e) {
        }
    }

    public static void main(String[] args) {
        testException(null, new Date(0L), [d]);
        testException(new Date(0L), null, [d]);
        testException(new Date(-1L), new Date(0L), [e]);
        testException(new Date(0L), new Date(-1L), [e]);

        long now = System.currentTimeMillis();
        Date start = new Date(now);
        Date end = new Date(now + DELTA);
        final Period period = new Period(start, end);
        testConsistency(period, DELTA);
        testContains(period,
            new long[] { now, now + 1, now + DELTA - 1 },
            new long[] { now - 1, now + DELTA, now + DELTA + 1 });

        Date backwardEnd = new Date(now - DELTA);
        final Period backwardPeriod = new Period(start, backwardEnd);
        testConsistency(backwardPeriod, -DELTA);
        testContains(backwardPeriod,
            new long[] { now, now - 1, now - DELTA + 1 },
            new long[] { now + 1, now - DELTA, now - DELTA - 1 });

        final Period nullPeriod = new Period(start, start);
        testConsistency(nullPeriod, 0);
        testContains(nullPeriod, new long[0],
                         new long[] { now - 1, now, now + 1 });
        /* α */
    }
}`;

export const autumn2014Pm11Mutation = `        start.setTime(now - DELTA);
        end.setTime(now + DELTA * 2);
        testConsistency(period, [g]);
        testContains(period,
            new long[] { now, now + 1, now + DELTA - 1 },
            new long[] { now - 1, now + DELTA, now + DELTA + 1 });
        Date newStart = period.getStart();
        newStart.setTime(newStart.getTime() - DELTA);
        Date newEnd = period.getEnd();
        newEnd.setTime(newEnd.getTime() + DELTA);
        testConsistency(period, [g]);
        testContains(period,
            new long[] { now, now + 1, now + DELTA - 1 },
            new long[] { now - 1, now + DELTA, now + DELTA + 1 });`;

export const autumn2014Pm11Pages = [
  page(60,
    heading('問11　次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'),
    heading('〔プログラムの説明〕'),
    p('D君は，社内向けの応用プログラム（以下，アプリケーションという）で共通に使うライブラリを開発するチームに属している。ライブラリの次のバージョンで，時間に関するクラスを幾つか用意することになり，D君は期間（時間間隔）を表すクラスPeriodの開発を担当することになった。このクラスは，“有効期間は，今週月曜日の午前0時から金曜日の終わりまで（土曜日の午前0時以降は，無効）”など，ある日付及び時刻（以下，日時という）から別の日時までの時間間隔を表すことを想定している。期間の基準になる日時を始点，終わりを表す日時を終点という。また，ある始点から過去に遡って期間を表すことも想定している。D君が定めたクラスPeriodの外部仕様は，次のとおりである。'),
    p('クラスPeriodは，始点から終点までの期間を表す。期間には，始点は含まれるが終点は含まれない。始点と終点が同じ日時の場合は，期間が空であると定義し，いかなる日時も含まないものとする。'),
    p('(1) コンストラクタは，引数で与えられた始点（start）と終点（end）から期間を表すインスタンスを生成する。日時は，クラスDateのインスタンスで与えられ，協定世界時1970年1月1日午前0時（以下，この日時をエポックという）以降でなければならない。引数start又はendがnullの場合は，NullPointerExceptionを，日時がエポックよりも前の場合は，IllegalArgumentExceptionを投げる。'),
    p('(2) メソッドgetStart：始点を返す。'),
    p('(3) メソッドgetEnd：終点を返す。'),
    p('(4) メソッドgetLength：期間の長さ（ミリ秒）を返す。終点が始点よりも前の場合は，負の値で返す。期間が空の場合は，0を返す。'),
    p('(5) メソッドisBackward：終点が始点よりも前の場合は，trueを返す。それ以外は，falseを返す。期間が空の場合は，falseを返す。'),
    p('(6) メソッドcontains：引数で与えられた日時が期間に含まれる場合は，trueを返す。それ以外は，falseを返す。期間が空の場合は，falseを返す。引数が')),
  page(61,
    p('nullの場合は，NullPointerExceptionを投げる。'),
    p('この仕様でチームの承認を得て，次のプログラム1を作成した。'),
    heading('〔プログラム1〕'), code(autumn2014Pm11Period,'java'),
    p('次に，D君は，テスト用にプログラム2を作成した。問題が検出されなければ，プログラム2は何も出力せずに終了する。問題を検出した場合は，RuntimeExceptionを投げる。')),
  page(62,heading('〔プログラム2〕'),code(autumn2014Pm11TestStart,'java')),
  page(63,
    code(autumn2014Pm11TestEnd,'java'),
    heading('設問1'), p('プログラム1及び2中の' + ask + 'ただし，プログラム2を実行したとき，例外は発生せず正常に終了するものとする。'),
    bank('abc')),
  page(64,
    bank('de'), heading('設問2'), p('次の記述中の' + ask),
    p('チーム内でのコードレビューも終わり，クラスPeriodを含むライブラリが評価版として社内にリリースされた。それからしばらくして，アプリケーション開発チームから，アプリケーションの実行中にPeriodのインスタンスが表す期間が変わってしまうという指摘を受けた。D君は，プログラムを見直したがクラスもフィールドも最終（final）なので，生成後にインスタンスの状態が変化することはないと考えた。そこで，D君は，アプリケーション開発チームと一緒にデバッグを行った。'),
    p('その結果，アプリケーションでは，PeriodのメソッドgetStartで始点を取得し，そのDateインスタンスの表す日時を変更して別のPeriodのインスタンスを生成するときの引数に使用していることが分かった。これが原因で，先に生成済みのPeriodのインスタンスの始点が変更されていた。すなわち，Periodインスタンス自体は不変でも，それから参照されるDateインスタンスは可変なので，表している期間が変わってしまうことがある。したがって，Periodのインスタンスで始点及び終点を保持する場合は，外部からの変更ができないようにする必要がある。また，クラスDateは，最終（final）ではないので，どのような下位クラスでも作成可能であり，上書きしたメソッドについて挙動の変更が可能である。これらは，データの改ざんを許すことになるので，セキュリティ上の問題でもある。これらの問題を修正するために，D君は，クラスPeriodに次')),
  page(65,
    p('の変更を加えた。'),
    p('(1) コンストラクタの処理において，this.startの代入文の右辺をnew Date(start.getTime())に変更した。this.endの代入文についても同様の変更をした。この変更によって，フィールドstart及びendは，それぞれ引数と同じ値をもつ別のjava.util.Dateのインスタンスを参照する。'),
    p('(2) メソッドgetStartの返却値を［f］に変更した。メソッドgetEndについても同様の変更をした。'),
    p('D君は，プログラム2のメソッドmainのαで示した部分に次のプログラムを追加し，正しく修正されたことを確認した。'),
    code(autumn2014Pm11Mutation,'java'), bank('f'), bank('g')),
];
