import type {Legacy2018NumericReview} from "./legacy-2018-review";
const review=(number:number,page:number,title:string,answer:string,reference:number[],choices:string[],premises:string[]):Legacy2018NumericReview=>({collection:"2018h30h-fe-am",number,page,title,answer,reference,choices,premises,precision:"原は数値計算の正答を問わず、4択と本文/コード/参照本文の構成を保持。追加の丸めなし。",materialReview:"原物理4/15/17/21と別紙解答p1を全画像で照合。本文に第三者規格の引用表示・外部図版・写真は確認しなかった。原素材はIPA教育目的FAQで個別用途を判断し、参考にしたRFC/IBM資料の本文や図を転載しない。独自解説・改変生成を原文再録と区別する。"});
export const legacy2018TechnicalKnowledgeReview:Legacy2018NumericReview[]=[
review(3,4,"ディープラーニングとルールによる推論","ウ",[0,0,0],["“AならばBである”というルールを人間があらかじめ設定して、新しい知識を論理式で表現したルールに基づく推論の結果として、解を求めるものである。","厳密な解でなくてもなるべく正解に近い解を得るようにする方法であり、特定分野に特化せずに、広範囲で汎用的な問題解決ができるようにするものである。","人間の脳神経回路を模倣して、認識などの知能を実現する方法であり、ニューラルネットワークを用いて、人間と同じような認識ができるようにするものである。","判断ルールを作成できる医療診断などの分野に限定されるが、症状から特定の病気に絞り込むといった、確率的に高い判断ができる。"],["AIのディープラーニングの特徴を尋ねる","長文の4択","原正答はニューラルネット一般の広い説明。独自解説で多層学習との関係と完全な人間認識再現の保証でないことを補足"]),
review(28,15,"埋込みSQLのカーソルと位置付け更新","ア",[0,0,0],["カーソル","スキーマ","テーブル","ビュー"],["埋込みSQLプログラムの一部","Xは何を表す名前か","OPEN/FETCH INTO/UPDATE WHERE CURRENT OF/CLOSE","ホスト変数:NAME/:DEPT/:SALARY","原は給与を1.1倍。SQL表示は実行しない"]),
review(34,17,"盲写宛先のヘッダと配送用情報","ア",[0,0,0],["Bcc","Date","Received","X-Mailer"],["原はSMTPでメッセージが転送される過程で削除されるフィールドを尋ねる","原画像と公式キーを保持","生成基準はTo/Cc宛てのコピーと配送用情報への宛先移動後という条件を明示した改変","Bccの全方式/全コピー/全中継で無条件に削除という説明をしない"]),
review(43,21,"アプリケーションの必要機能と最小のアクセス権限","エ",[0],["管理者権限","更新権限","更新権限と参照権限","参照権限"],["原は検索して表示する機能だけ","アクセス用アカウント","情報セキュリティ管理上適切な権限","参照はレコード参照/更新はレコード登録変更削除/管理者はテーブル参照登録変更削除","レコードとテーブルの対象を解答前へ保持"]),
];
/** These roles and alternative assertions were manually reviewed. They do not
 * import production tables or infer truth from the generator's answer. */
export const legacy2018TechnicalKnowledgeFacts={
  3:{stem:"AIにおけるディープラーニングの特徴はどれか。",changed:["学習データから結合の重みを調整せず、人間が列挙した論理式のルールだけを順に適用して結論を導く方法である。","問題ごとに用意した経験則だけで探索候補を減らし、ニューラルネットワークの学習を行わずに近似解を求める方法である。","医師が記入した症状と病名の対応規則だけを照合し、データから特徴を学習せずに診断候補を絞る方法である。"],roles:["人手の論理ルール推論","近似的な汎用問題解決","ニューラルネットによる認識","医療の人手判断規則"],truth:[false,false,true,false],explanation:["多層","全てディープラーニングになるわけではない","医療にも","完全に再現する保証でもない"]},
  28:{stem:"次の埋込みSQLを用いたプログラムの一部において、Xは何を表す名前か。",code:"EXEC SQL OPEN X;\nEXEC SQL FETCH X INTO :NAME, :DEPT, :SALARY;\nEXEC SQL UPDATE 従業員\n         SET 給与 = 給与 * 1.1\n         WHERE CURRENT OF X;\nEXEC SQL CLOSE X;",falseObjects:[["スキーマ","インデックス"],["テーブル","トリガ"],["ビュー","シーケンス"]],meanings:{カーソル:"現在行への位置付け",スキーマ:"名前空間",インデックス:"検索の索引",テーブル:"格納表",トリガ:"更新等で起動する処理",ビュー:"問合せで定義する表",シーケンス:"採番"},explanation:["現在行を更新","ホスト変数","スキーマ","仮想的な表","連続する番号"]},
  34:{stem:"電子メールのヘッダフィールドのうち、SMTPでメッセージを送信するとき、宛先を配送用情報へ移した後、To/Cc宛てのコピーに盲写宛先を表示しないために取り除くものはどれか。",falseFields:[["Date","From"],["Received","Message-ID"],["X-Mailer","Subject"]],meanings:{Bcc:"盲写宛先",Date:"作成日時",From:"著者",Received:"配送経路の記録","Message-ID":"メッセージの識別子","X-Mailer":"送信ソフト",Subject:"件名"},explanation:["Blind Carbon Copy","エンベロープ","別コピー","空のBcc","全ての中継サーバが全コピーから常に削除"]},
  43:{prefix:"利用者情報を格納しているデータベースに対して、",functions:["利用者情報を検索して表示する機能だけ","利用者情報のレコードを登録、変更、削除する機能だけ","利用者情報のレコードを検索して表示し、登録、変更、削除する機能","利用者情報を格納するテーブル自体を参照し、登録、変更、削除する機能だけ"],suffix:"をもつアプリケーションがある。このアプリケーションがデータベースにアクセスするときに用いるアカウントに与えるデータベースのアクセス権限として、情報セキュリティ管理上、適切なものはどれか。ここで、権限の名称と権限の範囲は次のとおりとする。",premises:["〔権限の名称と権限の範囲〕","参照権限：レコードの参照が可能","更新権限：レコードの登録、変更、削除が可能","管理者権限：テーブルの参照、登録、変更、削除が可能"],needs:[["read"],["insert","change","delete"],["read","insert","change","delete"],["tableRead","tableCreate","tableAlter","tableDrop"]],grants:[["tableRead","tableCreate","tableAlter","tableDrop"],["insert","change","delete"],["read","insert","change","delete"],["read"]],explanation:["最小の権限","レコードの操作とテーブル自体の管理","全権限を継承するという別の仕様を持ち込まない"]},
};
export const legacy2018TechnicalKnowledgePrimary=[
 {url:"https://www.postgresql.org/docs/18/ddl-schemas.html",scope:"schemaは名前空間。個別製品のnamespace共有仕様を原問の3権限定義へ持ち込まない。"},
 {url:"https://www.postgresql.org/docs/17/indexes.html",scope:"索引の検索補助と更新負担。本文転載なし。"},
 {url:"https://www.postgresql.org/docs/current/trigger-definition.html",scope:"更新等の事象で起動するtrigger。本文転載なし。"},
 {url:"https://www.postgresql.org/docs/current/sql-createsequence.html",scope:"sequenceの採番/欠番の可能性。本文転載なし。"},
 {url:"https://www.ibm.com/docs/en/zos-basic-skills?topic=storage-what-is-dynamic-address-translation",scope:"仮想から実アドレスへの変換とTLBによる高速化の事実確認。本文/図は転載しない。"},
 {url:"https://www.ibm.com/docs/en/hla-and-tf/1.6.0?topic=entries-registers",scope:"レジスタの演算accumulator等の役割。特定アーキテクチャのレジスタ番号や制約を一般化しない。"},
 {url:"https://www.ibm.com/think/topics/deep-learning",scope:"多層ニューラルネットワークと学習。引用転載なし。原問の広いニューラルネット説明を同一概念と一般化しない。特定の層数を全方式共通の定義として固定しない。"},
 {url:"https://www.ibm.com/docs/en/db2/11.5.x?topic=SSEPGG_11.5.0%2Fcom.ibm.db2.luw.apdv.embed.doc%2Fdoc%2Fc0005685.htm",scope:"embedded SQLのOPEN/FETCH/CURRENT OF/CLOSEの役割。コードの転載なし。一次資料の検索取得全文からOPEN/FETCH/CURRENT OF/CLOSEの各動作を照合。特定製品のCOMMIT挙動やエラー番号を全SQLへ一般化しない。"},
 {url:"https://www.rfc-editor.org/rfc/rfc5321.html#appendix-B",scope:"ヘッダ宛先から配送用RCPTへの移動とBcc削除のSHOULD。全中継でのMUSTとしない。"},
 {url:"https://www.rfc-editor.org/rfc/rfc5322.html#section-3.6.3",scope:"Bccの削除/盲写用別コピーの保持/空欄という複数方式。To/Ccコピーへ限定した生成前提の明確化。本文の転載なし。"},
].map(e=>({...e,checkedOn:"2026-10-19",use:"fact_verification_only_no_source_text_or_figure_redistribution"}));
