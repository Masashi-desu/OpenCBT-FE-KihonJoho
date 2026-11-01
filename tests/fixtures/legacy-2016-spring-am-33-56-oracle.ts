/** Independently reviewed knowledge contracts. No generator import. The
 * option meanings are not inferred from a generated answer index. */
import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';

/** Q55 always asks the meaning of the same system category. Every option is
 * a system description; ownership, use, architecture and deployment do not
 * replace the severity-of-failure criterion. These16 judgments are fixed
 * reviewer facts, not copied from a production answer table. */
export const q55ReviewedCases=[
 {prompt:'ミッションクリティカルシステムの意味として，適切なものはどれか。',options:[
  {text:'OSなどのように，業務システムを稼働させる上で必要不可欠なシステム',matchesMeaning:false,reason:'基盤としての役割の説明であり，障害が企業活動や社会へ及ぼす影響の重大性を定義していない。'},
  {text:'システム運用条件が，性能の限界に近い状態の下で稼働するシステム',matchesMeaning:false,reason:'運用時の負荷の大きさであり，障害発生時の影響の重大性とは異なる。'},
  {text:'障害が起きると，企業活動や社会に重大な影響を及ぼすシステム',matchesMeaning:true,reason:'障害による企業活動又は社会への重大な影響という定義を満たす。原公式解答ウとも一致する。'},
  {text:'先行して試験導入され，成功すると本格的に導入されるシステム',matchesMeaning:false,reason:'パイロット導入の説明であり，障害時の影響の重大性を定義していない。'}]},
 {prompt:'ミッションクリティカルシステムの意味として，適切なものはどれか。',options:[
  {text:'企業内の部署で共通に利用する処理を，各業務システムへ提供するシステム',matchesMeaning:false,reason:'共通機能を提供する役割の説明であり，その停止による影響の重大性は示されていない。'},
  {text:'性能試験を目的として，処理量を増やし応答時間や処理能力を測定するシステム',matchesMeaning:false,reason:'性能を測定する試験用途の説明であり，障害が企業活動や社会へ与える影響の定義ではない。'},
  {text:'障害が起きると，企業活動や社会に重大な影響を及ぼすシステム',matchesMeaning:true,reason:'故障時の重大な業務・社会影響を直接示しており，問われた意味を満たす。'},
  {text:'限られた部署で試験導入し，効果を確認してから導入範囲を広げるシステム',matchesMeaning:false,reason:'試験導入から展開する方法の説明であり，障害の影響が重大であるという定義ではない。'}]},
 {prompt:'ミッションクリティカルシステムの意味として，適切なものはどれか。',options:[
  {text:'ネットワークを介して複数のコンピュータに処理を分担させるシステム',matchesMeaning:false,reason:'分散処理という構成の説明であり，構成だけでは障害が事業や社会へ与える影響は決まらない。'},
  {text:'障害が発生しても企業活動や社会への影響が小さく，復旧まで停止を許容できるシステム',matchesMeaning:false,reason:'停止による影響が小さく許容できると明示されており，重大な影響という条件を満たさない。'},
  {text:'障害が起きると，企業活動や社会に重大な影響を及ぼすシステム',matchesMeaning:true,reason:'障害がもたらす影響の重大性によってシステムを説明している。'},
  {text:'業務データを定期的に別の記憶媒体へ複製して保管するシステム',matchesMeaning:false,reason:'バックアップという機能の説明であり，そのシステム自体の障害影響の重大性を定義していない。'}]},
 {prompt:'ミッションクリティカルシステムの意味として，適切なものはどれか。',options:[
  {text:'業務システムの開発時だけ利用し，実運用のデータから切り離してプログラムを試験するシステム',matchesMeaning:false,reason:'開発時の試験環境という利用目的の説明であり，障害の重大性の定義ではない。'},
  {text:'通常業務と切り離した環境で，利用者の操作訓練だけを行うシステム',matchesMeaning:false,reason:'操作訓練のためのシステムという用途の説明であり，企業や社会への重大な障害影響を定義していない。'},
  {text:'障害が起きると，企業活動や社会に重大な影響を及ぼすシステム',matchesMeaning:true,reason:'障害による企業活動や社会への重大な影響という同じ判定条件を満たす。'},
  {text:'システムの稼働状況を定期的に収集し，グラフや帳票で管理者へ提示するシステム',matchesMeaning:false,reason:'監視・報告機能の説明であり，そのシステムの障害影響の重大性を示す定義ではない。'}]},
];
export function assertQ55ReviewedBody(candidate:number,body:GeneratedBody){
 assert(Number.isInteger(candidate)&&candidate>=0&&candidate<q55ReviewedCases.length);
 const expected=q55ReviewedCases[candidate];
 assert.deepEqual(body.prompt,[{type:'paragraph',text:expected.prompt}],'Q55 keeps the original system-category meaning question');
 assert.equal(body.choices.length,4);
 body.choices.forEach((blocks,i)=>{assert.deepEqual(blocks,[{type:'paragraph',text:expected.options[i].text}]);assert(expected.options[i].text.endsWith('システム'));assert(expected.options[i].reason.length>20);});
 const truth=expected.options.flatMap((option,i)=>option.matchesMeaning?[i]:[]);assert.equal(truth.length,1);assert.equal(body.correctIndex,truth[0]);
 assert.match(body.explanation,/^ミッションクリティカルは障害による事業や社会への影響が重大であることを表す。/);
}
export type KnowledgeReview={targets:string[];roles:string[][];promptTerms:string[];changedChoices?:Record<number,string[]>;why:string[];sources:string[]};
export const knowledgeReview:Record<number,KnowledgeReview>={
33:{targets:['address-port-sharing','address-allocation','name-lookup','access-authentication'],roles:[['address-allocation','name-lookup','address-port-sharing','access-authentication']],promptTerms:['プライベートIPアドレス','設定情報を自動的に配布','ドメイン名を指定','共通の認証サーバ'],why:['DHCP: network configuration and address allocation','DNS: named resource records','NAPT: multiple addresses/ports mapped to one address','RADIUS: access authentication/authorization'],sources:['rfc2131','rfc1034','rfc3022','rfc2865']},
36:{targets:['search-results-poison','dns-cache-poison','browser-script','human-deception'],roles:[['dns-cache-poison','search-results-poison','browser-script','human-deception']],promptTerms:['検索結果の上位','名前解決サーバ','閲覧者のブラウザ','担当者になりすました電話'],why:['DNS cache poisoning falsifies cached resolution data','SEO poisoning manipulates search results','XSS executes injected script in a victim browser','Social engineering exploits human trust'],sources:['seo-primary','owasp-xss','rfc1034']},
37:{targets:['sql-command-injection','distributed-denial','memory-boundary','reflected-script'],roles:[['sql-command-injection','distributed-denial','memory-boundary','reflected-script']],promptTerms:['SQLインジェクション攻撃','分散サービス妨害（DDoS）攻撃','バッファオーバフロー','反射型クロスサイトスクリプティング'],why:['Untrusted input reaches database commands','Many remote traffic sources cause service unavailability','Access outside allocated memory damages execution/data','Request-supplied script is reflected in a server response'],sources:['owasp-sqli','owasp-xss','official-answers']},
38:{targets:['secret-information-collection','port-probe','dictionary-password-trials','input-sanitization'],roles:[['input-sanitization','port-probe','secret-information-collection','dictionary-password-trials']],promptTerms:['スパイウェア','ポートスキャン','辞書攻撃','サニタイジング'],why:['Removal/replacement of hazardous input is sanitization, not secret collection','Sequential port access probes service exposure','Secret collection of user data is spyware','Trying dictionary words as passwords is dictionary attack'],sources:['nist-spyware','official-answers']},
39:{targets:['certificate-issuance','certificate-issuance'],roles:[['shared-key-management','certificate-issuance','transaction-signature-management','password-management'],['private-key-disclosure','certificate-issuance','transaction-decryption','payment-approval']],promptTerms:['認証局（CA）','認証局（CA）'],changedChoices:{1:['取引当事者の秘密鍵を全て預かり，他の取引当事者へ配布する。','取引当事者の公開鍵に対するディジタル証明書を発行する。','取引当事者に代わって，電子商取引の内容を常に復号する。','取引当事者間の全ての決済の承認を行う。']},why:['CA binds subject identity and public key through a signed certificate','CA does not mean the common manager of transaction secrets, signatures or passwords','Disclosing private keys, decrypting commerce, and approving payments are not CA certificate issuance'],sources:['rfc5280','official-answers']},
40:{targets:['registered-random-reset','registered-random-reset'],roles:[['registered-current-password','registered-random-reset','unverified-current-password','unverified-random-reset'],['hash-as-password','registered-random-reset','unverified-predictable-code','name-only-change']],promptTerms:['合い言葉が一致した後','合い言葉が一致した後'],changedChoices:{1:['あらかじめ登録された利用者のメールアドレス宛てに，現パスワードのハッシュ値を送信し，次回からそのハッシュ値でログインさせる。','あらかじめ登録された利用者のメールアドレス宛てに，パスワード再登録用ページへアクセスするための，推測困難なURLを送信する。','新たにメールアドレスを入力させ，そのメールアドレス宛てに，利用者名から計算できる再登録用コードを送信する。','合い言葉が一致したので，以後は誰でもその利用者名だけでパスワードを変更できるようにする。']},why:['A pre-established side channel plus unpredictable reset token is the correct role','Sending an existing password, unverified destination, predictable token, bearer password hash, or name-only change is unsafe','Original security-question premise remains; not a modern recommendation to rely on security questions alone'],sources:['owasp-recovery','official-answers']},
41:{targets:['provider-app-construction','retained-customer-controls'],roles:[['discard-continuity','discard-access-policy','provider-app-construction','discard-company-security'],['discard-continuity','discard-leaver-control','retained-customer-controls','discard-information-policy']],promptTerms:['SaaS（Software as a Service）','SaaS（Software as a Service）'],changedChoices:{1:['提供者がアプリケーションを運用するので，サービス停止時に利用企業が業務を継続する方法を検討する必要はない。','提供者がアプリケーションを運用するので，利用企業は退職者のアカウントを無効にする必要はない。','提供者がアプリケーションを構築・運用するが，利用企業は自社の利用者のアクセス権や業務継続の方針を管理する。','提供者がアプリケーションを運用するので，利用企業が機密情報の取扱いの社内ルールを定める必要はない。']},why:['SaaS supplies provider-hosted applications; provider construction scope is distinct from customer controls','Customer business continuity, accounts and information governance remain necessary','Original log-capacity claim concerns constructing the provider application, not erasing customer log-review duties'],sources:['nist-cloud','official-answers']},
42:{targets:['personal-business','personal-business'],roles:[['company-business','company-private','personal-private','personal-business']],promptTerms:['BYODの説明','BYODの説明'],changedChoices:{1:['従業員が企業から貸与された端末を業務だけに利用することであり，紛失による機密情報の漏えいのリスクがある。','従業員が企業から貸与された端末を私的な買物に利用することであり，不審なサイトへのアクセスによる感染のリスクがある。','従業員が私的に保有する端末を私的な写真の保存だけに利用することであり，故障による個人データの消失のリスクがある。','従業員が私的に保有する端末を業務に利用することであり，私用アプリのクラウド同期設定によって業務データが管理外へ送信されるリスクがある。']},why:['Both personal ownership and business use are required','Loss and infection can also happen on company devices but do not make them BYOD','Personal-only use is outside BYOD business use; unmanaged personal sync can expose business information'],sources:['nist-byod','official-answers']},
43:{targets:['application-filter','request-distribution','encrypted-private-access','cooperative-failover'],roles:[['encrypted-private-access','application-filter','cooperative-failover','request-distribution']],promptTerms:['SQLインジェクションなどの攻撃','複数のWebサーバへの要求を振り分け','暗号化したトンネル','一つのシステムとして協調動作'],why:['SSL-VPN: protected remote network connection','WAF: application traffic rules and attack filtering','Cluster: cooperating computers including failover','Load balancing: distribution of requests'],sources:['owasp-waf','official-answers']},
44:{targets:['evidence-content-equality','evidence-content-equality'],roles:[['password-one-way-storage','recover-modified-content','evidence-content-equality','prove-password-not-intercepted'],['hash-preimage-recovery','hash-access-control','evidence-content-equality','universal-decryption-key']],promptTerms:['ディジタルフォレンジックス','ディジタルフォレンジックス'],changedChoices:{1:['取得した証拠ファイルのハッシュ値から，削除前のファイル内容を逆算する。','証拠ファイルのハッシュ値を公開するだけで，ファイル内容を閲覧できる者を限定する。','証拠となり得るデータについて，原本と複製の同一性を証明する。','証拠ファイルのハッシュ値を暗号鍵として使い，全ての暗号化通信を復号する。']},why:['Hash comparison verifies content identity/integrity of forensic copies','Password storage is another application, not the asked forensic purpose','A hash is not content recovery, access control, interception detector or universal decryption key'],sources:['nist-forensic','official-answers']},
45:{targets:['all-area-overwrite','all-area-overwrite'],roles:[['compression-not-erasure','mbr-only','all-area-overwrite','filename-only'],['filesystem-delete','partition-only','all-area-overwrite','hide-folder']],promptTerms:['正常に動作するPCの磁気ディスク','正常に動作するPCの磁気ディスク'],changedChoices:{1:['機密ファイルを削除した後，ごみ箱を空にする。','磁気ディスクのパーティション情報だけを消去する。','ランダムなビット列で，磁気ディスクの全領域を複数回上書きする。','機密ファイルを格納しているフォルダを非表示にする。']},why:['Under the source healthy magnetic-disk premise, overwrite reaches data areas','Compression, MBR changes, file name/attribute changes and logical deletion leave data content','Not generalized to SSDs, broken media or mandatory multiple passes for every disposal threat model'],sources:['nist-media2014','official-answers']},
47:{targets:['minimum-coupling','minimum-coupling'],roles:[['common','control','data','external'],['common','control','stamp','external']],promptTerms:['モジュール結合度が最も低い','モジュール結合度が最も低い'],changedChoices:{1:['複数のモジュールが共通域の変数を直接読み書きする。','モジュールの動作モードを指定する制御フラグを引数で渡す。','必要な一部の項目を含むレコード全体を引数として渡す。','外部宣言された同じデータを複数のモジュールが共有する。']},why:['Independent rank data < stamp < control < external < common < content','Case0 includes needed scalar data only, case1 has no data-coupled option and its composite-record stamp is the weakest offered','Always asks lowest, never changes direction to highest'],sources:['irs-coupling','official-answers']},
48:{targets:['state-event-transition','condition-action-rules'],roles:[['non-state-computation','ignore-state','state-event-transition','flow-decision-table-confusion'],['boundary-values','state-transitions-only','condition-action-rules','statement-coverage']],promptTerms:['状態遷移テスト','決定表テスト'],changedChoices:{1:['入力値の有効範囲の境界の直前，境界上，直後の値だけを選んで確認する手法','イベントによってシステムの状態がどの状態へ変わるかだけを整理する手法','条件の組合せと実行すべき動作を表に整理し，各規則に対する動作を確認する手法','プログラムの各命令を少なくとも一度は実行して確認する手法']},why:['State transition testing deals with event/state combinations','Decision tables deal with combinations of conditions and corresponding actions','Boundary value testing and statement coverage are separate test design criteria'],sources:['istqb-syllabus','official-answers']},
50:{targets:['not-configuration','not-configuration'],roles:[['uncontrolled-change','not-configuration','unidentified-related-versions','untracked-derived-fixes'],['uncontrolled-change','not-configuration','unidentified-related-versions','untracked-derived-fixes']],promptTerms:['構成管理に起因しない','構成管理に起因しない'],changedChoices:{1:['変更を承認した記録を残さずに本番用ソースを置き換え，どの修正が入ったのか分からなくなった。','応答時間の要求を満たすかを測定していなかったため，性能テストで処理速度の不足が判明した。','設計書と実行プログラムの対応する版が記録されておらず，どの設計を実装したものか判別できない。','同じ基盤から派生した製品に必要な修正が反映されたかを追跡できない。']},why:['Configuration management identifies items/versions, controls changes, and tracks product configuration','Unit-test defect escape (case0) and missing performance validation (case1) are test quality issues','Negative question: choose the one not caused by configuration management'],sources:['nasa-configuration','official-answers']},
51:{targets:['hierarchical-decomposition','time-bars','critical-path','time-cost-optimization'],roles:[['time-cost-optimization','critical-path','time-bars','hierarchical-decomposition']],promptTerms:['WBS（Work Breakdown Structure）','ガントチャート','クリティカルパス法（CPM）','時間と費用のトレードオフを分析'],why:['Time/cost analysis optimizes costs against duration','CPM uses dependency network and durations to identify project-controlling paths','Gantt shows schedule intervals as bars','WBS decomposes work hierarchically'],sources:['nasa-planning','nasa-wbs','official-answers']},
52:{targets:['scope','cost','time','risk'],roles:[['cost','scope','time','risk']],promptTerms:['目的及び範囲','費用の見積り','作業の順序や所要期間','不確実な事象'],why:['Cost covers budget and cost estimates/control','Scope covers objectives/deliverables/work boundaries','Time covers sequencing/duration/schedule','Risk covers uncertain events affecting project objectives'],sources:['nasa-planning','official-answers']},
53:{targets:['critical-path-activity','critical-path-activity'],roles:[['hardest-activity','critical-path-activity','resource-availability','longest-single-duration'],['noncritical-expensive','critical-path-activity','noncritical-largest-float','noncritical-earliest-start']],promptTerms:['優先的に資源を投入','優先的に資源を投入'],changedChoices:{1:['クリティカルパス上になく，最も費用が高いスケジュールアクティビティ','クリティカルパス上のスケジュールアクティビティ','クリティカルパス上になく，最も多くの余裕時間をもつスケジュールアクティビティ','クリティカルパス上になく，最も早く開始できるスケジュールアクティビティ']},why:['Only project-controlling critical paths determine completion time','Difficulty, individual duration, available resources or cost alone do not identify that path','After shortening, recalculate paths; multiple critical paths may require additional work'],sources:['nasa-planning','official-answers']},
55:{targets:['severe-failure-impact','severe-failure-impact','severe-failure-impact','severe-failure-impact'],roles:[['platform-system','near-capacity-system','severe-failure-impact','pilot-system'],['shared-service-system','performance-test-system','severe-failure-impact','trial-deployment-system'],['distributed-system','tolerable-failure-impact','severe-failure-impact','backup-system'],['development-test-system','training-system','severe-failure-impact','monitoring-system']],promptTerms:Array(4).fill('ミッションクリティカルシステムの意味'),changedChoices:{1:q55ReviewedCases[1].options.map(o=>o.text),2:q55ReviewedCases[2].options.map(o=>o.text),3:q55ReviewedCases[3].options.map(o=>o.text)},why:q55ReviewedCases.flatMap(c=>c.options.map(o=>o.reason)),sources:['official-answers']},
};

export const independentSources={
 'official-answers':'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_ans.pdf',
 rfc2131:'https://www.rfc-editor.org/rfc/rfc2131.html',rfc1034:'https://www.rfc-editor.org/rfc/rfc1034.html',rfc3022:'https://www.rfc-editor.org/rfc/rfc3022.html',rfc2865:'https://www.rfc-editor.org/rfc/rfc2865.html',rfc5280:'https://www.rfc-editor.org/rfc/rfc5280.html',
 'seo-primary':'https://www.cyber.gc.ca/en/guidance/search-engine-optimization-poisoning-itsap00013',
 'owasp-sqli':'https://community.owasp.org/attacks/SQL_Injection','owasp-xss':'https://community.owasp.org/attacks/xss/',
 'owasp-recovery':'https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html','owasp-waf':'https://community.owasp.org/Web_Application_Firewall',
 'nist-cloud':'https://csrc.nist.gov/pubs/sp/800/145/final','nist-spyware':'https://csrc.nist.gov/glossary/term/spyware','nist-byod':'https://csrc.nist.gov/pubs/sp/1800/22/final',
 'nist-forensic':'https://csrc.nist.gov/pubs/sp/800/86/final','nist-media2014':'https://csrc.nist.gov/pubs/sp/800/88/r1/final',
 'irs-coupling':'https://www.irs.gov/irm/part2/irm_02-005-012',
 'istqb-syllabus':'https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf',
 'nasa-planning':'https://www.nasa.gov/reference/6-1-technical-planning/','nasa-configuration':'https://www.nasa.gov/reference/6-5-configuration-management/',
 'nasa-wbs':'https://www.nasa.gov/wp-content/uploads/2023/08/nasa-work-breakdown-structure-handbook.pdf',
};

/** Read as assertions about the solution, not substrings taken from the
 * generator at test time. All begin at the actual explanation conclusion. */
export const reviewedConclusionPatterns:Record<number,RegExp[]>={
33:[/^NAPTはIPアドレスとポート番号を対応付け，複数端末で一つのグローバルIPアドレスを共有する。/,/^DHCPは端末へIPアドレスやネットワーク設定を配布する。/,/^DNSはドメイン名に対応する資源レコードを提供する。/,/^RADIUSはネットワークアクセス装置と認証サーバの間で認証・認可情報などを交換する。/],
36:[/^検索結果を操作して悪意あるサイトへ誘導するのはSEOポイズニングである。/,/^DNSキャッシュに偽の名前とアドレスの対応を入れるのはDNSキャッシュポイズニングである。/,/^Webサイトを通して閲覧者のブラウザに不正なスクリプトを実行させるのはクロスサイトスクリプティングである。/,/^人の心理や行動を悪用して秘密情報を得るのはソーシャルエンジニアリングである。/],
37:[/^SQLインジェクションは，入力文字列によって意図しないデータベース命令を実行させる攻撃である。/,/^多数の送信元などからトラフィックを集中させ，サービスを利用できなくする説明が該当する。/,/^割り当てたメモリ領域の境界を越えてアクセスし，異常動作や不正コード実行を引き起こす説明が該当する。/,/^攻撃者が送らせた文字列が応答に反映され，閲覧者のブラウザで不正スクリプトとして実行される説明が該当する。/],
38:[/^利用者の意図に反して情報を収集するプログラムがスパイウェアである。/,/^TCPポートに順次アクセスして利用可能なサービスを調べるプログラムがポートスキャナである。/,/^辞書中の語を認証情報の候補として順に試すプログラムが辞書攻撃に該当する。/,/^入力の危険な表現を取り除くなどの処理がサニタイジングである。/],
39:[/^認証局は主体と公開鍵の対応を証明するディジタル証明書を発行する。/,/^証明書の発行は認証局の役割であり，取引内容の復号や決済の承認ではない。/],
40:[/^登録済みの送信先に推測困難な再登録用URLを送る。/,/^登録済み宛先の確認と推測困難な再登録用情報が必要である。/],
41:[/^SaaSのアプリケーションや基盤の構築・開発は提供者側の範囲である。/,/^SaaSでも利用企業側のアクセス権管理，業務継続，情報の取扱いの管理責任は残る。/],
42:[/^BYODは従業員が個人所有の端末を業務に使うことをいう。/,/^所有者が従業員であり，利用目的に業務が含まれるのがBYODである。/],
43:[/^WAFはWebアプリケーションへの通信を検査し，SQLインジェクションなどの攻撃を検出・遮断する。/,/^複数サーバへ要求を振り分けるのはロードバランシング機能である。/,/^暗号化した仮想的な専用接続を提供するのはSSL-VPN機能である。/,/^複数のコンピュータが協調して可用性などを高める構成がクラスタ構成である。/],
44:[/^収集前後などでハッシュ値を比較し，原本と複製の内容が同じであることや取得後に変更されていないことを確認する。/,/^ハッシュ値の比較はデータの同一性の確認に使う。/],
45:[/^この問題は正常に動作する磁気ディスクが対象である。全領域の上書きが，他の選択肢と異なりデータ本体を消去する。/,/^ファイルの参照情報を消すことや非表示化では，磁気ディスク上のデータ本体が残る。原条件で全領域を上書きする選択肢を選ぶ。/],
47:[/^必要なデータ項目だけを引数で渡すデータ結合が最も弱い。/,/^この選択肢集合にはデータ結合がなく，レコード全体を渡すスタンプ結合が最も弱い。/],
48:[/^状態遷移テストは状態とイベントの組合せによる遷移・動作を確認する。/,/^決定表テストは条件の組合せと対応する動作の規則を扱う。/],
50:[/^単体テストで検出すべきバグの多発はテスト品質の問題である。/,/^性能要求の検証不足は性能・テストの問題である。/],
51:[/^WBSは作業を階層的に分解する。/,/^ガントチャートは横棒で作業の期間や進捗を表す。/,/^CPMは作業の依存関係と所要期間から，全体期間を決めるクリティカルパスを特定する。/,/^日数と費用の関係を評価し，総費用を最適化するために用いる。/],
52:[/^スコープはプロジェクトの目的，成果物，実施する作業の範囲を扱う。/,/^費用の見積り，予算，費用実績を扱うのはコストマネジメントである。/,/^作業順序，期間，スケジュールを扱うのはタイムマネジメントである。/,/^目標に影響する不確実性を扱うのはリスクマネジメントである。/],
53:[/^全体の完了時刻を決めているクリティカルパス上の作業を短縮する。/,/^資源投入で期間を短縮するクラッシングは，全体の完了を支配するクリティカルパスの作業を優先する。/],
55:Array(4).fill(/^ミッションクリティカルは障害による事業や社会への影響が重大であることを表す。/),
};

/** Full reviewed generated stems. Missing entries mean the source stem stays
 * fixed, not that the test may accept an arbitrary new question direction. */
export const reviewedChangedPrompts:Record<number,Record<number,string>>={
33:{1:'ネットワークに接続する端末に，利用可能なIPアドレスやデフォルトゲートウェイなどの設定情報を自動的に配布するものはどれか。',2:'ホストのドメイン名を指定して，そのホストのIPアドレスなどの資源情報を問い合わせる仕組みを実現するものはどれか。',3:'ネットワークアクセス装置からの認証要求を，共通の認証サーバで処理するために用いるプロトコルはどれか。'},
36:{1:'名前解決サーバが保持する対応情報に偽のIPアドレスを登録させ，利用者を偽サイトへ誘導する攻撃の名称はどれか。',2:'脆弱なWebサイトの出力に不正なスクリプトを混入させ，閲覧者のブラウザで実行させる攻撃の名称はどれか。',3:'担当者になりすました電話などによって人の心理的な隙を突き，パスワードなどの秘密情報を聞き出す手口の名称はどれか。'},
37:{1:'分散サービス妨害（DDoS）攻撃の説明として，適切なものはどれか。',2:'バッファオーバフローを悪用する攻撃の説明として，適切なものはどれか。',3:'反射型クロスサイトスクリプティング攻撃の説明として，適切なものはどれか。'},
38:{1:'ポートスキャンを行うプログラムに該当するものはどれか。',2:'辞書攻撃を行うプログラムに該当するものはどれか。',3:'入力文字列のサニタイジングを行うプログラムに該当するものはどれか。'},
43:{1:'クライアントから複数のWebサーバへの要求を振り分け，一台のWebサーバに処理が集中しないようにするためのものはどれか。',2:'社外の端末から暗号化したトンネルを経由して社内ネットワークへ接続するためのものはどれか。',3:'複数のコンピュータを一つのシステムとして協調動作させるためのものはどれか。'},
48:{1:'システム結合テストにおける決定表テストに関する記述として，適切なものはどれか。'},
51:{1:'ソフトウェア開発プロジェクトにおいてガントチャートを使用する目的として，適切なものはどれか。',2:'ソフトウェア開発プロジェクトにおいてクリティカルパス法（CPM）を使用する目的として，適切なものはどれか。',3:'ソフトウェア開発プロジェクトにおいて時間と費用のトレードオフを分析する目的として，適切なものはどれか。'},
52:{1:'プロジェクトを予算内で完了するため，費用の見積り，予算の設定及び実績の管理を行うマネジメントプロセスはどれか。',2:'プロジェクトの作業の順序や所要期間を定め，予定どおり完了するようにスケジュールを管理するマネジメントプロセスはどれか。',3:'プロジェクトの目標に影響する不確実な事象を識別・分析し，対応を計画するマネジメントプロセスはどれか。'},
};
