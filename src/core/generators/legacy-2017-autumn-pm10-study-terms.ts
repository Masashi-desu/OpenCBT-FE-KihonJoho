import type{StudyTerm}from'../study-acronyms';
export const legacy2017AutumnPm10StudyTerms:StudyTerm[]=[
 {term:'COBOL',expansion:'Common Business Oriented Language',meaning:'事務処理向けに設計されたプログラミング言語。この問題では、入庫レコードの作成と、出庫時の料金計算・更新を二つのサブプログラムに分ける。'},
 {term:'PIC',expansion:'Picture',meaning:'データ項目の形式や桁数を指定するCOBOLの記述。利用番号は8桁、日時は12桁、料金は6桁。夜間料金表は3桁の数値を24個並べた72桁の文字列を再定義して参照する。'},
 {term:'索引ファイルと呼出し法',meaning:'主キーでレコードを特定できるファイルでも、利用する処理によって呼出し法は異なる。入庫時はOPEN EXTENDで末尾へ順に追加し、出庫時は利用番号をキーにREADして同じレコードをREWRITEする。'},
 {term:'INTEGER-OF-DATE',meaning:'日付を通算日へ変換するCOBOLの組込み関数。この問題では1601年1月1日を起点とする値を24倍し時を加えることで、月末・年末をまたぐ経過時間も同じ引算で求める。'},
 {term:'TEST BEFORE',meaning:'繰返しの本体を実行する前に終了条件を調べる指定。W-CNTを1から増やす場合、W-HRS個の課金単位を処理する終了条件はW-CNT>W-HRSであり、0単位なら一度も実行しない。'},
 {term:'課金単位と夜間の判定',meaning:'各課金単位は入庫時刻の分を保って1時間ずつ始まり、開始から1分以上経過すると課金する。夜間かどうかは各単位の開始時刻で決まり、途中で夜間境界を通ってもその単位の料金を分割しない。'},
].map(t=>({...t,sources:['2017h29a-fe-pm-10']}));
