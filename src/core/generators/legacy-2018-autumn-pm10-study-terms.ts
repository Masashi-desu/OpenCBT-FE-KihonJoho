import type{StudyTerm}from'../study-acronyms';
export const legacy2018AutumnPm10StudyTerms:StudyTerm[]=[
 {term:'COBOL',expansion:'Common Business-Oriented Language',meaning:'事務処理に用いられるプログラミング言語。この問題では従業員ごとの資格日付を索引ファイルへ書き戻す。'},
 {term:'EOF',expansion:'End Of File',meaning:'ファイルの終わり。次の従業員番号が来ない最後の従業員も，RETURNのAT ENDで書き戻す必要がある。'},
 {term:'SORT／RETURN',meaning:'SORTは合格レコードを従業員番号順に整列し，RETURNはその並びから次のレコードを受け取る。元の合格ファイルが既に整列しているとは仮定しない。'},
 {term:'索引ファイル',meaning:'キーでレコードを呼び出せるファイル。本問は従業員番号を主キーとし，合格者の既存レコードが必ず存在する。'},
 {term:'REWRITE',meaning:'読み出した既存レコードを書き換える文。本問では社員境界と入力終端で，それまで更新していた社員を保存する。'},
 {term:'OCCURS',meaning:'同じ項目を繰り返して定義する句。QLF-DATEは4要素で，資格種別1〜4を添字にして合格日を格納する。'},
 {term:'コントロールブレーク',meaning:'整列されたキーの変化を区切りとして前の群を確定する処理。入力終端でも最後の群を確定する。'},
 {term:'保有者数と合格者数',meaning:'既存の保有状況は過去分を含む。今回RETURNしたレコードを数える集計は当該処理期の合格者数であり，受験者数や累積保有者数ではない。'}
].map(t=>({...t,sources:['2018h30a-fe-pm-10']}));
