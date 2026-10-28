import type{StudyTerm}from'../study-acronyms';
export const legacy2018AutumnPm12StudyTerms:StudyTerm[]=[
 {term:'CASL II',meaning:'本試験で用いるアセンブラ言語の名称。本問の値は数値の年・月・日と日数であり，文字コードの表は必要ない。'},
 {term:'GR',expansion:'General Register',meaning:'汎用レジスタ。GR0を返値に使い，各副プログラムから戻るときGR1〜GR7は元の値へ戻す。'},
 {term:'FR',expansion:'Flag Register',meaning:'演算・比較結果を表すフラグレジスタ。後続の命令で更新されるので，桁あふれを起こした加算の直後に分岐する。'},
 {term:'OF',expansion:'Overflow Flag',meaning:'桁あふれフラグ。論理加算ADDLでは16bitの範囲を越える桁上がりがあると1になる。符号の正負だけを検査するJMIやJPLとは異なる。'},
 {term:'LADとLD',meaning:'LADは実効アドレスをレジスタへ格納し，LDはそのアドレスにある値を読み込む。月の累積表のアドレスと，表の中の日数は別のものである。'},
 {term:'ADDLとADDA',meaning:'ADDLは符号なしの論理加算，ADDAは符号付きの算術加算。本問の日数は0〜65535なので，日数累計の桁あふれをADDL直後のJOVで調べる。'},
 {term:'JZE／JNZ／JOV',meaning:'それぞれ零，非零，OF=1の場合の条件分岐。年が等しい終了条件，4で割った余り，桁あふれの通知を区別する。'},
 {term:'XOR',expansion:'Exclusive OR',meaning:'排他的論理和。値0又は1へ1をXORすると，0と1が反転する。全bitを反転する#FFFFや，常に1にするORとは違う。'},
 {term:'うるう年',meaning:'4で割り切れる年は原則うるう年だが，100で割り切れ400で割り切れない年は平年。2000年と2400年はうるう年，2100年は平年となる。'},
 {term:'RPUSH／RPOP',meaning:'汎用レジスタの内容をまとめて退避・復元するマクロ。GR0は返値として残し，GR1〜GR7を保存する。OFを更新する加算と分岐の順序も保持する。'}
].map(t=>({...t,sources:['2018h30a-fe-pm-12']}));
