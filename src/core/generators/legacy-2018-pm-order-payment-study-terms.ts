import type {StudyTerm} from '../study-acronyms';
export const legacy2018OrderPaymentStudyTerms:StudyTerm[]=[
  {
    "term": "COBOL",
    "meaning": "事務処理などを記述するプログラミング言語。この問では注文と入金の順ファイルを突き合わせ，出荷待ち情報と結果リストを出力する。",
    "expansion": "Common Business-Oriented Language"
  },
  {
    "term": "PICTURE（PIC）",
    "meaning": "データ項目の桁や形式を指定する句。PICはPICTUREの記述で，9は数字，Xは英数字の位置を表す。Zや浮動符号は数字編集に用いる。"
  },
  {
    "term": "順ファイル",
    "meaning": "レコードを順次読み書きするファイル。この問の注文・入金ファイルは注文番号の昇順で，同じ入力内の注文番号は重複しない。"
  },
  {
    "term": "突合せ",
    "meaning": "二つのファイルのキーを比較し，対応するレコードを調べる処理。この問では両方が一致する場合と片方だけにある場合を分ける。"
  },
  {
    "term": "EOF",
    "meaning": "入力ファイルの終わり。この問のORD-EOFとRCP-EOFは，親項目の注文番号が99999999であることを示す条件名である。",
    "expansion": "End Of File"
  },
  {
    "term": "88水準の条件名",
    "meaning": "親データの値が条件のVALUEに当てはまることを表す名前。条件名用の別の記憶領域は持たず，この問のSET TO TRUEは親の番号へ99999999を設定する。"
  },
  {
    "term": "READ INTO / AT END",
    "meaning": "READ INTOは成功した入力レコードを指定項目へ転送する。AT ENDは入力の終わりの処理を記述し，この問ではEOF条件を真にする。"
  },
  {
    "term": "SET TO TRUE",
    "meaning": "COBOLの条件名を真にする文。この問ではORD-EOF又はRCP-EOFに対応する親項目へVALUEを設定し，以後の読込みを止める条件にする。"
  },
  {
    "term": "INITIALIZE",
    "meaning": "対象項目をカテゴリに応じて初期化する文。この問の指定では名前のある数値・数字編集項目をゼロなどにし，英数字項目を空白にする。名前のないFILLERは対象外である。"
  },
  {
    "term": "FILLER",
    "meaning": "名前を付けずに確保する項目。この問の結果リストでは項目間の空白を確保し，主処理のMOVE SPACE TO PRT-RECで領域全体を空白にしておく。"
  },
  {
    "term": "MOVE",
    "meaning": "送り側の値を受取り側へ転送する文。受取り側のカテゴリに合わせた転送や編集が行われる。送り側のレコードを読み進める文ではない。"
  },
  {
    "term": "PERFORM UNTIL",
    "meaning": "終了条件が成立するまで処理を繰り返す文。原プログラムのTEST指定省略では実行前に条件を調べ，両入力のEOFでループを終える。"
  },
  {
    "term": "EVALUATE TRUE",
    "meaning": "WHENに書かれた条件を順に調べ，成立する処理へ分岐する指定。この問では注文番号が小さい・等しい・大きい場合を分ける。"
  },
  {
    "term": "省略複合条件",
    "meaning": "COBOLでは同じ主語や比較演算子を省略して条件をつなげられる。ORD-CODE = 1 OR 2は，ORD-CODE = 1 OR ORD-CODE = 2の意味である。"
  },
  {
    "term": "WRITE FROM",
    "meaning": "出力レコードへ送り側の内容を転送して書き込む指定。この問のWRITE WAT-REC FROM ORD-DATAは現在の注文を出荷待ちへ保存する。"
  },
  {
    "term": "結果コード",
    "meaning": "結果リストの判定を示す2文字。この問では00は出荷対象，10は対応する注文のない入金，20は請求金額と入金金額の不一致を示す。"
  },
  {
    "term": "数字編集",
    "meaning": "数値を表示用の文字列へ整える形式。Z,ZZZ,ZZ9は9文字，--,---,--9は10文字で，先頭の不要なゼロを空白にし，桁区切りや負の符号を表示する。値が0でも末尾の9には0が表示される。"
  },
  {
    "term": "INTEGER-OF-DATE",
    "meaning": "YYYYMMDD形式の日付を通算日数へ変換する組込み関数。この問では実行日から注文日の通算日数を引き，注文日の翌日を1日目とする日数差を求める。"
  },
  {
    "term": "CURRENT-DATE",
    "meaning": "実行時の日時情報を返す組込み関数。この問では先頭8文字をCR-DATE-Xへ転送し，注記どおりYYYYMMDD形式の実行日を得る。"
  },
  {
    "term": "W-CNT",
    "meaning": "経過日数を受け取るPIC 9(3)の数値項目。0〜999を表現できるが，1000は収まらない。表現可能な日数では，fで所定の日数を過ぎたかを比較する。原題には表現不能時の受取値やその後の動作を定める処理は示されていない。"
  },
  {
    "term": "出荷待ちファイル",
    "meaning": "銀行振込又はコンビニ払いで入金未確認の注文を保存する出力。前回の出荷待ちと前日の新規注文が次回の注文入力になる。"
  },
  {
    "term": "ADD",
    "meaning": "指定した数値を加算する文。選択肢のADD 1 TO PRT-NOは印字番号を増やす処理で，結果リストへ書き込む役割ではない。"
  },
  {
    "term": "COMPUTE",
    "meaning": "算術式を計算し受取り項目へ結果を格納する文。この問では差額及び日付関数の差を計算する。受取り項目の桁数と式の計算結果を区別する。"
  },
  {
    "term": "DISPLAY",
    "meaning": "項目などの内容を表示する文。設問2では期限を過ぎた未入金注文の注文番号を表示する処理であり，結果リストのWRITEとは役割が異なる。"
  }
].map(t=>({...t,sources:['2018h30h-fe-pm-10']}));
export const legacy2018OrderPaymentInheritedStudyTerms=[] as const;
export function isLegacy2018OrderPaymentSource(q:{subject:string;origin:{sourceRefs:{sourceId:string;locator:{questionNumber?:string;year?:number}}[]}}){return q.subject==='B'&&q.origin.sourceRefs.some(r=>r.sourceId==='source-ipa-2018h30h-fe-pm-10-qs'&&r.locator.questionNumber==='10'&&r.locator.year===2018);}
