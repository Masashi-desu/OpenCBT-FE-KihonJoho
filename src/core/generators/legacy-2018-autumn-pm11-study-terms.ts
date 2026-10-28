import type{StudyTerm}from'../study-acronyms';
export const legacy2018AutumnPm11StudyTerms:StudyTerm[]=[
 {term:'API',expansion:'Application Programming Interface',meaning:'機能を呼び出す名前・引数・返値などの取り決め。この問のJava API付属資料は8型9操作の機能要約で，原正誤表を別に参照する。'},
 {term:'Reader／read',meaning:'Readerは文字入力ストリームの抽象クラス。readは次の文字をintで返し，入力終端は−1。charへ変換する前に終端を判定する。'},
 {term:'FileReader',meaning:'ファイルの内容を文字として読むReaderの派生クラス。プログラム6はファイル名を渡して生成し，try-with-resourcesで閉じる。'},
 {term:'IOException',meaning:'入出力処理に失敗したときの例外を表す型。throwsはメソッドの例外宣言であり，クラスがFragmentを実装するimplementsとは違う。'},
 {term:'CharSequence',meaning:'文字の並びを表すインタフェース。StringやStringBuilderの内容を扱える。コンストラクタはtoStringでその時点の文字列を保存する。'},
 {term:'List／ArrayList',meaning:'Listは順序を持つ要素列のインタフェース，ArrayListはその実装。addで追加したフラグメントの順序を拡張forで保つ。'},
 {term:'Map／get',meaning:'キーと値を対応付けるインタフェースと値を取り出す操作。本問では全置換キーが必ず存在し，各値は一つ以上の文字列のListである。'},
 {term:'String／String.join',meaning:'Stringは変更できない文字列の型。joinは指定した区切りを要素間へ入れて連結する。本問の区切りは改行で，先頭・末尾へ余分な改行を足さない。'},
 {term:'StringBuilder',meaning:'文字を追加できる文字列構築用の型。appendは末尾へ追加し，同じビルダを返す。toStringは現在の内容をStringにする。'},
 {term:'implementsとextends',meaning:'クラスがインタフェースを実装するときはimplementsを使う。クラスによるクラス継承のextendsや，型宣言に使うinterfaceとは役割が違う。'},
 {term:'フラグメント',meaning:'ひな形の個々の置換指示又は置換指示以外の部分。前後や隣接置換の間には，文字数0のPassThroughができてもよい。'},
 {term:'escape',meaning:'直後の1文字を区切りとして解釈せず，そのまま文字列へ加える扱い。連続するバックスラッシュは奇数個目が次の1文字を消費する。'}
].map(t=>({...t,sources:['2018h30a-fe-pm-11']}));
