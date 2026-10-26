import type {StudyTerm} from '../study-acronyms';
export const legacy2017Pm10StudyTerms:StudyTerm[]=[
 {term:'COBOL',expansion:'Common Business Oriented Language',meaning:'事務処理向けに設計されたプログラミング言語。この問題では、売上伝票の整列、月ごとの集計、索引ファイルへの書出しを段落に分けて記述している。'},
 {term:'コントロールブレイク',meaning:'整列済みデータの集計キーが変わった時点で、直前の集計を確定して次の集計へ切り替える処理。ここでは売上年月が変わると、前月の金額を書き出し、領域を初期化して新しい年月を設定する。'},
 {term:'SORT・整列キー',meaning:'指定した項目の大小に従ってレコードを並べる処理。この問題では売上日を昇順にすることで、同じ年月の伝票を連続させる。支店番号や支店ごとの伝票番号では、全支店の月別集計に必要な順序を保証できない。'},
 {term:'EOF',expansion:'End Of File',meaning:'ファイルの終わりに達した状態。次の月の伝票が来ない最終月でも、RETURNのAT ENDで書出し段落を呼ぶため、最後の月と第4四半期の集計を確定できる。'},
 {term:'条件名・88レベル',meaning:'データ項目が指定した値や範囲にあるかを名前で表すCOBOLの記述。この問題のQUART-MONTHは、事業年度に対応する四半期末の月かどうかを表し、月次合計を表示するタイミングに使う。'},
 {term:'PIC',expansion:'Picture',meaning:'COBOLでデータ項目の形式や桁数を指定する記述。この問題では伝票金額は6桁、支店別月間金額は9桁、全支店の月合計は10桁である。表の数値を追う際に、項目ごとの役割を混同しないことが大切である。'},
].map(term=>({...term,sources:['2017h29h-fe-pm-10']}));
