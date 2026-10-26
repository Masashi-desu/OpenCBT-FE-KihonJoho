import type{StudyTerm}from'../study-acronyms';
export const legacy2017AutumnPm12StudyTerms:StudyTerm[]=[
 {term:'GR',expansion:'General Register',meaning:'汎用レジスタ。1語16ビットで数値やビット列を保持する。この問題ではGR0で一致位置又は−1を返し、GR1〜GR7は呼出し前の内容へ戻す。'},
 {term:'FR',expansion:'Flag Register',meaning:'演算結果を示す旗のレジスタ。OF・SF・ZFをもち、命令ごとの設定規則は別の必要仕様資料で確認する。'},
 {term:'OF',expansion:'Overflow Flag',meaning:'オーバフローの旗。論理左シフトSLLでは最後に押し出されたビットが入るので、JOVで検査して2語のビット列を連結する。'},
 {term:'SFとZF',expansion:'Sign Flag / Zero Flag',meaning:'SFは符号、ZFは零の旗。JMIは負、JPLは正、JZEは零の条件で分岐する。OFで調べるシフト時の押出しビットと混同しない。'},
 {term:'論理シフトと算術右シフト',meaning:'SLL/SRLは空いたビットへ0を入れる論理シフト。SRAは最上位の符号ビットを保つので、#8000をn−1ビット右へ動かすと上位nビットが1のマスクになる。'},
 {term:'CASL IIとCOMET II',meaning:'CASL IIはこの試験のアセンブラ言語、COMET IIは対象の仮想計算機の名称。略語の展開を推測せず、原仕様の語・番地・レジスタ・命令を使う。数値のビット演算に文字の符号表は必要ない。'},
].map(t=>({...t,sources:['2017h29a-fe-pm-12']}));
