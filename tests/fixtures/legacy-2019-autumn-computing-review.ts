/** Excluded annual preparation batch. Child personally viewed physical9/10/12/13/14/15/16
 * plus official answer p1. OCR is a search aid; diagrams were read as images. */
export const legacy2019AutumnComputingReview=[
 {number:13,page:9,answer:"ア",capacity:9,reference:[0,1],source:"2019r01a-fe-am-13",roles:["全対象割込みを差し引く","Aを1回数えない","Aを全て数えない","割込みを数えない"],format:"本文/小数時間3列2行表/AとBの2行時間図/数値四択。高A/低B、多重割込み許可、0〜5ms、呼出復帰overhead無視。",precision:"原0.5/1.5ms、2/2.5/3.5/5。生成はA0.5/0.6/0.7、B1.2/1.5/1.8。与値/出力は小数第1位以内、丸めなし、最小択間隔0.5ms以上。"},
 {number:14,page:9,answer:"イ",capacity:3,reference:[0],source:"2019r01a-fe-am-14",roles:["PCへ別インタフェースで直接2接続","PC→display1→display2","USBハブ中心で分岐","ネットワークハブ中心で分岐"],format:"四つの具体的接続説明から接続方法を選ぶ。Thunderboltの接続ポートが2口/4Kディスプレイ2台/最初PCからという順を原択へ保持。",precision:"targetはchain/USBstar/networkstar。starだけでは二正答になるため対象を本文へ限定。PCの対応台数/帯域を新規推定しない。"},
 {number:15,page:10,answer:"ア",capacity:4,reference:[0],source:"2019r01a-fe-am-15",roles:["mirroring","bit/ECC","byte/dedicatedparity","block/dedicatedparity"],format:"機構説明を読みRAID1〜4の四つの名称から選ぶ。原はmirroring/冗長diskによる復元。",precision:"分類の機構を変える4条件。現行製品の支持/台数/性能保証やバックアップ不要の説明へ拡張しない。RAID2/3の用語は参照ごとの歴史差を認識し、本問のbitECC/byteparity条件を明示する。"},
 {number:21,page:12,answer:"イ",capacity:4,reference:[0],source:"2019r01a-fe-am-21",roles:["一つ前の取込み値をbit逆順","strobe立上り時の上位shift値","確定値をbit逆順","一つ前の取込み値"],format:"8bitserialin/parallelout、上位shift/最下位取込み/正論理/clock立上り/strobe立上り/16進。data/strobe/clock波形、時間右向き、source10clockでstrobeは第9と第10の間。",precision:"原9有効sample110001101→末尾10001101=8D、前8個11000110=C6、反転B1/63。生成は2桁uppercasehex・全4択一意。初期値は9sample前提で押し出される。"},
 {number:22,page:13,answer:"イ",capacity:4,reference:[0],source:"2019r01a-fe-am-22",roles:["AND全行表","XOR全行表","NOR全行表","NAND全行表"],format:"A/B入力、2NOT/2AND/1ORと実結線、X出力。四つの2段見出し入力/出力、A/B/X、00/01/10/11行を保持。",precision:"元は(!A&B)|(A&!B)のXOR。別条件は二重NOTでAND、入力2NOTでNOR、AND後の2NOTでNAND。結線は意味の入力として独立評価し、表値を答えに合わせてシャッフルしない。"},
 {number:23,page:13,answer:"ウ",capacity:4,reference:[0],source:"2019r01a-fe-am-23",roles:["区分番号範囲","桁ごとの分類意味","内容の連想","連続する識別番号"],format:"商品コードの希望条件から四つの体系名を選ぶ。原はコードから内容が容易に分かること。",precision:"表意と桁別の意味の違いを明示し、同一条件で複数の方式を正答にしない。"},
 {number:24,page:14,answer:"エ",capacity:2,reference:[0],source:"2019r01a-fe-am-24",roles:["5.1音声","携帯電話音声","camera静止画","ワンセグ動画"],format:"技術名の説明を四用途の記述から選ぶ。H.264/MPEG-4 AVC表記/全原択を保持。",precision:"H.264動画/JPEG静止画の二対象。原の音声利用例だけでは一方式が一意でないので音声codecへ安易に変更しない。規格名と規格本文転載は区別する。"},
 {number:26,page:15,answer:"ウ",capacity:6,reference:[0,0],source:"2019r01a-fe-am-26",roles:["科目HAVING平均下限","科目WHERE行下限","学生HAVING平均下限","学生WHERE行下限"],format:"schema得点(学生番号,科目,点数)、二列実線下線primarykey、全科目平均/80以上、SQLSELECT/FROM/GROUPBY空欄aと四SQL句。",precision:"student/subject集約2×閾値80/70/90。平均判定前に低い点数を落とす誤りとGROUPBY後WHEREの文法不正を独立反例で区別。二列の組主キーを単独一意性へ変えない。"},
 {number:27,page:16,answer:"イ",capacity:4,reference:[0],source:"2019r01a-fe-am-27",roles:["join","projection","selection","union"],format:"関係モデルの操作説明→日本語+英語演算名を選ぶ。原は特定属性だけを取り出す射影。",precision:"集合として重複を除く意味を保持。組/属性、共通属性のjoin/直積、union/SQLUNIONALLを区別。"},
 {number:28,page:16,answer:"イ",capacity:4,reference:[0],source:"2019r01a-fe-am-28",roles:["abort処理中→abort済","不可能な直接遷移","commit処理中→abort処理中","commit処理中→commit済"],format:"五状態/一つのtransaction/取ることのないnegative質問/四行の遷移前後表/ア〜エ行記号。",precision:"Bはabort中→commit中、abort中→commit済、abort済→commit済、commit済→abort中の4不可能対。他3正当遷移は原のまま。表行ラベルを固定するため生成choiceShuffleAllowed=false。"},
]as const;
export const legacy2019AutumnComputingOriginalChoices={
 13:["2","2.5","3.5","5"],
 14:["PCと計測機器とをRS-232Cで接続し、PCとプリンタとをUSBを用いて接続する。","Thunderbolt接続ポートが2口ある4Kディスプレイ2台を、PCのThunderbolt接続ポートから1台目のディスプレイにケーブルで接続し、さらに、1台目のディスプレイと2台目のディスプレイとの間をケーブルで接続する。","キーボード、マウス及びプリンタをUSBハブにつなぎ、USBハブとPCとを接続する。","数台のネットワークカメラ及びPCをネットワークハブに接続する。"],
 15:["RAID1","RAID2","RAID3","RAID4"],21:["63","8D","B1","C6"],
 22:[[0,0,0,1],[0,1,1,0],[1,0,0,0],[1,1,1,0]],23:["区分コード","桁別コード","表意コード","連番コード"],
 24:["5.1チャンネルサラウンドシステムで使用されている音声圧縮技術","携帯電話で使用されている音声圧縮技術","ディジタルカメラで使用されている静止画圧縮技術","ワンセグ放送で使用されている動画圧縮技術"],
 26:["科目 HAVING AVG(点数) >= 80","科目 WHERE 点数 >= 80","学生番号 HAVING AVG(点数) >= 80","学生番号 WHERE 点数 >= 80"],
 27:["結合（join）","射影（projection）","選択（selection）","和（union）"],28:["ア","イ","ウ","エ"],
}as const;
export const legacy2019AutumnComputingSource={collection:"2019r01a-fe-am",checkedOn:"2026-10-19",questionSha256:"4cd404654bb4f465befc78a3ac44c79bcd0f019b12b68f93a38d9836710c7cb0",answerSha256:"074c4437b57dc5ba96b6f87da90d4b2fa905d436f4c606690010e1262f32e4e0",status:"prepared_in113_entry_shared_registration_pending",figures:["legacy-2019-interrupt-timing","legacy-2019-serial-wave","legacy-2019-composed-logic","legacy-2019-truth-table","legacy-2019-score-relation"],rights:"原10問に第三者引用注記/規格本文図表を特定しなかったが、注記の不在だけで許諾を推定しない。規格番号や機構の事実に言及する原記述と規格内容自体の転載を区別して個別確認を継続。図の実結線はIPA原問から独自SVG化し、外部の回路/波形/RAID図は転載しない。",
 facts:[
 {url:"https://www.intel.com/content/www/us/en/support/articles/000008091/server-products/sasraid.html",read:"一次検索本文でmirroringとparity分類を確認。現行機器の必要台数/速度/製品推奨はこの旧問へ追加しない。"},
 {url:"https://www.redbooks.ibm.com/redpapers/pdfs/redp5234.pdf",read:"一次検索本文でRAID2bit/RAID3byte+専用parityを確認。製品/台数の固有条件や図は転記しない。"},
 {url:"https://www.redbooks.ibm.com/redbooks/pdfs/sg247071.pdf",read:"一次検索本文124頁でRAID2HammingECCとRAID2/3用語の範囲差を確認。本問の明示した機構へ限定し、教材差を唯一の絶対分類と説明しない。"},
 {url:"https://www.itu.int/rec/T-REC-H.264/e",read:"公開勧告一覧のタイトルで動画圧縮の分野と2019以前の版の存在を確認。規格の本文/図表の転載許諾をこの公開一覧から推定しない。"},
 {url:"https://ieeexplore.ieee.org/document/125072/",read:"JPEG開発側の1992論文abstractで正式名とstill-image compressionを一次確認。論文の説明文や図は転載しない。"},
 {url:"https://support.apple.com/guide/studio-display/connect-displays-and-accessories-apda4b9a9e25/2026/mac/26",read:"一次検索本文でdownstream→次のdisplayというdaisychain構成を確認。2026Thunderbolt5製品や対応台数は2019の原例へ追加しない。"},
 ],limits:"44条件を独立検証、全10原crop/実original/base/template/素材/図媒体/用語/全条件表示を準備。年度候補113/全186、残73。全てexcludedで共有登録/実Run/ミックス/用語lookupは未完。原図の問いを維持し、同一aliasと推定しない。"}as const;
