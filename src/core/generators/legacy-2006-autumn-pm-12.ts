import { p } from './definition';
import { autumn2006PmJavaReference } from './legacy-2006-autumn-pm-materials';
import { bank, createLanguageDefinition, languageFigure, numbered, page } from './legacy-2006-autumn-pm-10-13-support';

const variants=[
  {titles:['Java Programming','Perl Programming','Ruby Programming'], magazine:'JITEC News', editions:[3912,4001], users:['Taro','Hana'], limit:3},
  {titles:['C Algorithms','SQL Queries','Data Reports'], magazine:'Library Notes', editions:[272,301], users:['Aki','Ren'], limit:2},
  {titles:['Coding in C','Shell Guide','Data Tables'], magazine:'Monthly Study', editions:[18,21], users:['Yui','Ken'], limit:1},
  {titles:['Network Basics','Computer Design','Office Tools'], magazine:'Systems Monthly', editions:[59,67], users:['Mai','Jun'], limit:4},
];
const sampleOutput=(i:number)=>{
  const {titles,magazine,editions,users:[one,two],limit}=variants[i];
  const book=(j:number)=>'Book: '+titles[j]+' (P00'+(j+1)+')';
  const issue=(j:number)=>'Magazine: '+magazine+', No.'+editions[j]+' (M00'+(j+1)+')';
  const texts=[issue(0),issue(1),book(0),book(2)];
  const lines=texts.flatMap((book,j)=>[one+' is checking out '+book,...(j>=limit?['    => failed: exceeding checkout limit']:[])]);
  lines.push(one+' returned '+issue(0),two+' is checking out '+issue(0),two+' is checking out '+book(0));
  if(limit>=3) lines.push('    => failed: unavailable');
  else if(limit===1) lines.push('    => failed: exceeding checkout limit');
  return lines.join('\n');
};
export const q12Output=languageFigure(12,'output','図　実行結果',i=>{
  const text=sampleOutput(i);
  return {kind:'output',text,alt:text};
});
const edits=[
  ['行番号50の直後に追加','Set<Magazine> latestMagazines = new HashSet<Magazine>();'],
  ['行番号58の直後に追加','if (book instanceof Magazine)\n    updateLatestMagazineList((Magazine) book);'],
  ['行番号62の直後に追加',`if (book instanceof Magazine) {
    Magazine magazine = (Magazine) book;
    if (latestMagazines.contains(magazine))
        ［b］("latest issue");
}`],
  ['行番号78の直後に追加',`void updateLatestMagazineList(Magazine magazine) {
    for (Magazine magazine2 : latestMagazines)
        if (magazine2.name.equals(magazine.name)) {
            if (magazine.issueNo ［d］ magazine2.issueNo) {
                return;
            } else {
                latestMagazines.remove(magazine2);
                break;
            }
        }
    ［e］;
}`],
];
export const q12Changes=languageFigure(12,'changes','雑誌の最新号を貸し出さないための追加内容',()=>({
  kind:'table',columns:['処置','追加内容'],rows:edits,codeColumn:1,
  alt:'処置｜追加内容\n'+edits.map(row=>row.join('\n')).join('\n\n'),
}));
const first=`import java.util.*;

abstract class Book {
    String name;
    String id;
    Book(String name, String id) {
        this.name = name;
        this.id = id;
    }
    public boolean equals(Object object) {
        return (object instanceof Book)
\t               && id.equals(((Book) object).id);
    }
    public int hashCode() {
        return id.hashCode();
    }
}

class RegularBook extends Book {
    RegularBook(String name, String id) {
        ［a］;
    }
    public String toString() {
        return "Book: " + name + " (" + id + ")";
    }
}

class Magazine extends Book {
    int issueNo;
    Magazine(String name, int issueNo, String id) {
        ［a］;
        this.issueNo = issueNo;
    }
    public String toString() {
        return "Magazine: " + name + ", No." + issueNo
\t                                        + " (" + id + ")";
    }
}

class User {
    String name;
    String id;
    User(String name, String id) {
        this.name = name;
        this.id = id;
    }
    public String toString() {
        return "User: " + name + " (" + id + ")";
    }
}`;
const second=(i:number)=>{
  const {titles,magazine,editions,users:[one,two],limit}=variants[i];
  return `class Library {
    Set<Book> availables = new HashSet<Book>();
    Map<Book, User> checkedOut = new HashMap<Book, User>();
    int limit;
    Library(Book[] books, int limit) {
        for (Book book : books) register(book);
        this.limit = limit;
    }
    void register(Book book) {
        availables.add(book);
    }
    void checkoutBook(User user, Book book) throws Exception {
        if (! availables.contains(book))
            ［b］("unavailable");
        int count = 0;
        for (Map.Entry<Book, User> entry :
\t                                   checkedOut.entrySet())
            if (entry.getValue().equals(user)) count++;
        if (count >= limit)
            ［b］("exceeding checkout limit");
        availables.remove(book);
        checkedOut.put(book, user);
    }
    void returnBook(Book book) {
        for (Map.Entry<Book, User> entry :
\t                                   checkedOut.entrySet())
            if (entry.getKey().equals(book)) {
                ［c］(book);
                availables.add(book);
                return;
            }
    }
    public static void main(String[] args) {
        Book
            java = new RegularBook("${titles[0]}", "P001"),
            perl = new RegularBook("${titles[1]}", "P002"),
            ruby = new RegularBook("${titles[2]}", "P003"),
            jit39_12 = new Magazine("${magazine}", ${editions[0]}, "M001"),
            jit40_01 = new Magazine("${magazine}", ${editions[1]}, "M002");
        Book[] books = {java, perl, ruby, jit39_12, jit40_01};
        Library library = new Library(books, ${limit});
        User taro = new User("${one}", "ID-01");
        User hana = new User("${two}", "ID-02");
        Book[] books1 = {jit39_12, jit40_01, java, ruby};
        for (Book book : books1)
            try {
                System.out.print("${one} is checking out " + book);
                library.checkoutBook(taro, book);
                System.out.println();
            }`;
};
const third=(i:number)=>{
  const {users:[one,two]}=variants[i];
  return `            catch (Exception e) {
                System.out.println("\\n" + "    => failed: "
\t                                        + e.getMessage());
            }
        library.returnBook(jit39_12);
        System.out.println("${one} returned " + jit39_12);
        Book[] books2 = {jit39_12, java};
        for (Book book : books2)
            try {
                System.out.print("${two} is checking out " + book);
                library.checkoutBook(hana, book);
                System.out.println();
            }
            catch (Exception e) {
                System.out.println("\\n" + "    => failed: "
\t                                        + e.getMessage());
            }
    }
}`;
};

export const q12=createLanguageDefinition(12,'Java：図書の貸出し・返却と雑誌の最新号','貸出上限・図書・巻号','abcde',
  'エカイアア','図書の登録・貸出・返却の原形式とAPIの事実を保持し，冊数上限、刊行号およびテスト実行例を連動。', (i,original)=>{
    const {limit}=variants[i];
    return {pages:[
      page(43,[
        p('次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('（Javaプログラムで使用するAPIの説明は，'+(original?'この冊子の末尾':'参考資料')+'を参照してください。）'),
        p('〔プログラムの説明〕'),
        p('図書の貸出しと返却の処理をするプログラムである。図書には書籍と雑誌があり，利用者が借りることのできる図書の冊数には上限がある。'),
        p('（1）抽象クラスBookは，図書に共通の属性と処理を定義する。属性nameは図書の名前であり，属性idは図書に一意に付けられた識別子である。'),
        p('（2）クラスRegularBookは書籍を表す。'),
        p('（3）クラスMagazineは雑誌を表す。属性issueNoは，雑誌の創刊号からの号数で，古い号から昇順の値をもつ。各雑誌について，issueNoが最大のものが最新号である。'),
        p('（4）クラスUserは図書の利用者を表す。属性nameは利用者の名前であり，属性idは利用者に一意に付けられた識別子である。'),
        p('（5）クラスLibraryは，貸出しと返却の処理をする。属性availablesは貸出し可能な図書の集合を表し，属性checkedOutは貸出し中の図書の集合を表す。属性limitは利用者が借りることのできる図書の冊数の上限を与える。メソッドcheckoutBookは，貸出し処理を実行する。指定された図書が既に貸し出されている場合と利用者が既に貸出し冊数の上限まで図書を借りている場合，例外を投げる。メソッドreturnBookは返却処理を実行する。'),
        p('メソッドmainはテスト用のメインプログラムである。実行結果を図に示す。'),
        q12Output.block(i),
      ]),
      page(44,[p('〔プログラム〕\n（行番号）'),numbered('java',1,first)]),
      page(45,[numbered('java',49,second(i))]),
      page(46,[numbered('java',97,third(i)),p('設問1 プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')],
        [bank(1,'a',['new Book()','new Book(name, id)','super()','super(name, id)','this.name = name; this.id = id'],'エ','java'),
          bank(1,'b',['return Exception','return new Exception','System.err.println','System.out.println','throw Exception','throw new Exception'],'カ','java'),
          bank(1,'c',['checkedOut.add','checkedOut.remove','entry.add','entry.remove'],'イ','java')]),
      page(47,[
        p('設問2 雑誌について，最新号の貸出しを禁止する処理を追加したい。このため，次のようにプログラムを変更する。次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。ただし，各雑誌の各号は1冊ずつしかなく，雑誌の登録は，必ずしも古い号から行われるとは限らない。また，［b］には設問1の正しい答えが入っているものとする。'),
        q12Changes.block(i),
      ],[bank(2,'d',['<','>','!=','=='],'ア','java'),bank(2,'e',['latestMagazines.add(magazine)','register((Magazine) book)','return','returnBook(magazine)'],'ア','java')]),
    ],contexts:[autumn2006PmJavaReference(12)],
      explanation:'aでは引数付きの親クラスのコンストラクタで名前とIDを初期化する。bはその場で処理を中断して，mainのcatchに例外を伝える。cでは貸出中のマップから図書を取り除いてから，貸出可能な集合へ戻す。'+
        '同名雑誌で新たに登録する号が既存の号より小さいときは最新号を変えない。新しい号なら既存の最新号を除いて，新しい号を集合へ追加する。'+
        'この例の貸出上限は'+limit+'冊で，図の失敗理由は貸出状況とその上限に従う。'};
  },{answerVariation:'fixed'});
