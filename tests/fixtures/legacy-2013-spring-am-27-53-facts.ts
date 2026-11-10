type Fact = {
  basis: string;
  cases: readonly { condition: RegExp; matches: RegExp; conclusion: RegExp; rejected: readonly RegExp[] }[];
};

const caseOf = (condition: RegExp, matches: RegExp, conclusion: RegExp, ...rejected: RegExp[]) =>
  ({ condition, matches, conclusion, rejected });

/** Study sources establish the meaning of the four roles, independently of build(), answer order and generated text storage. */
export const spring2013KnowledgeFacts: Readonly<Record<number, Fact>> = {
  33: {
    basis: 'ITU-T X.200層別機能 §§7.1, 7.5–7.7。 https://www.itu.int/rec/T-REC-X.200',
    cases: [
      caseOf(/ネットワーク層の説明/, /ルーティングや中継/, /経路を選び/, /最も利用者に近い/, /通信媒体の特性/, /隣接ノード間/),
      caseOf(/アプリケーション層の説明/, /最も利用者に近い/, /最上位層/, /ルーティングや中継/, /通信媒体の特性/, /隣接ノード間/),
      caseOf(/物理層の説明/, /通信媒体の特性/, /ビットを伝送/, /ルーティングや中継/, /最も利用者に近い/, /隣接ノード間/),
      caseOf(/データリンク層の説明/, /隣接ノード間/, /フレームを扱い/, /ルーティングや中継/, /最も利用者に近い/, /通信媒体の特性/),
    ],
  },
  34: {
    basis: 'RFC 2663 §4.1.2、RFC 2131、RFC 2516、NIST SP 800-41r1 §2.1。 https://www.rfc-editor.org/rfc/rfc2663.html https://www.rfc-editor.org/rfc/rfc2131.html https://www.rfc-editor.org/rfc/rfc2516.html https://csrc.nist.gov/pubs/sp/800/41/r1/final',
    cases: [
      caseOf(/1個のグローバルIPアドレスを使って複数/, /^NAPT/, /外部で使う一つのIPv4アドレス/, /^DHCP$/, /^PPPoE$/, /^パケットフィルタリング$/),
      caseOf(/手入力なしで利用できるIPアドレスや既定のゲートウェイ/, /^DHCP$/, /アドレスや既定ゲートウェイなどを配布/, /^NAPT/, /^PPPoE$/, /^パケットフィルタリング$/),
      caseOf(/イーサネット区間[\s\S]+PPPセッションを確立/, /^PPPoE$/, /イーサネット上でPPP/, /^DHCP$/, /^NAPT/, /^パケットフィルタリング$/),
      caseOf(/指定した宛先IPアドレスとポート番号に該当する通信だけを拒否/, /^パケットフィルタリング$/, /規則と照合して通過を制御/, /^DHCP$/, /^NAPT/, /^PPPoE$/),
    ],
  },
  36: {
    basis: 'NTP RFC 5905、FTP RFC 959、POP3 RFC 1939、TELNET RFC 854、TFTP RFC 1350、DHCP RFC 2131、DNS RFC 1035 §4.2／RFC 7766。 https://www.rfc-editor.org/',
    cases: [
      caseOf(/^UDPを使用/, /^NTP$/, /時刻同期/, /^FTP$/, /^POP3$/, /^TELNET$/),
      caseOf(/トランスポート層にTCPを使用/, /^FTP$/, /制御接続にもデータ接続にもTCP/, /^NTP$/, /^TFTP$/, /^DHCP$/),
      caseOf(/UDPとTCPの両方/, /^DNS$/, /TCPで問い合わせ/, /^NTP$/, /^FTP$/, /^TFTP$/),
    ],
  },
  37: {
    basis: '署名は発信元認証とデータ完全性 FIPS 186-5。ハッシュ照合はブロック単位で位置が分かるが経路での送信者認証なし。AEADはRFC 5116。 https://csrc.nist.gov/pubs/fips/186-5/final https://www.rfc-editor.org/rfc/rfc5116.html',
    cases: [
      caseOf(/自分の署名生成鍵[\s\S]+Aの署名検証鍵/, /送信者Aからのもの/, /Aから来たことと内容が変更されていない/, /改ざん部位/, /盗聴の検知/, /漏えいの防止/),
      caseOf(/別経路で受信者Bに配布済み[\s\S]+同じ順番の値と一つずつ照合/, /改ざんを含むブロック/, /値が合わないブロックの番号/, /送信者Aからのもの/, /盗聴の検知/, /漏えいの防止/),
      caseOf(/他の正規利用者だけが共通に保持する鍵[\s\S]+認証タグを検証/, /鍵を知らない第三者への.*漏えいの防止/, /第三者にはメッセージを読ませない/, /送信者Aからのもの/, /改ざん部位/, /盗聴の検知/),
    ],
  },
  38: {
    basis: 'IPA「安全なウェブサイトの作り方」メールヘッダインジェクション、JPCERT/CCフィッシング、NIST CSRC DDoS。 https://www.ipa.go.jp/security/vuln/websecurity/about.html https://www.jpcert.or.jp/ https://csrc.nist.gov/glossary/term/distributed_denial_of_service',
    cases: [
      caseOf(/偽のWebサイト[\s\S]+認証情報を入力/, /^フィッシング$/, /偽サイトへ誘導/, /^DDoS攻撃$/, /^ボット$/, /^メールヘッダインジェクション$/),
      caseOf(/多数の計算機[\s\S]+正規利用者への応答ができなくなる/, /^DDoS攻撃$/, /多数の送信元から要求/, /^フィッシング$/, /^ボット$/, /^メールヘッダインジェクション$/),
      caseOf(/差出人欄に改行[\s\S]+意図しない相手にもメールが送られる/, /^メールヘッダインジェクション$/, /ヘッダを追加/, /^DDoS攻撃$/, /^フィッシング$/, /^ボット$/),
    ],
  },
  39: {
    basis: '受信者の鍵対で機密性を実現。RFC 8017 §5.1 RSA暗号の暗号化／復号。 https://www.rfc-editor.org/rfc/rfc8017.html',
    cases: [
      caseOf(/Xさんは，Yさんに[\s\S]+暗号化して送信/, /^Yさんの公開鍵$/, /Yさんの秘密鍵で復号/, /^Xさんの公開鍵$/, /^Xさんの秘密鍵$/, /^Yさんの秘密鍵$/),
      caseOf(/YさんはXさんへの返信を秘密/, /^Xさんの公開鍵$/, /Xさんの公開鍵で暗号化/, /^Yさんの公開鍵$/, /^Xさんの秘密鍵$/, /^Yさんの秘密鍵$/),
      caseOf(/YさんがXさんに機密ファイルを返信[\s\S]+ファイルを含む電子メールだけ/, /^Xさんの公開鍵$/, /秘密鍵を持つXさんが内容を復号/, /^Yさんの公開鍵$/, /^Xさんの秘密鍵$/, /^Yさんの秘密鍵$/),
    ],
  },
  40: {
    basis: 'IPA「安全なウェブサイトの作り方」SQLインジェクション、パス名パラメータの未チェック、クロスサイトスクリプティング。OWASP SQL Injection Prevention／Cross Site Scripting Prevention Cheat Sheets。 https://www.ipa.go.jp/security/vuln/websecurity/about.html https://cheatsheetseries.owasp.org/',
    cases: [
      caseOf(/^SQLインジェクション攻撃/, /問合せや操作において.*特別な意味をもつ文字として解釈されない/, /命令と値を分離/, /HTMLタグ/, /上位ディレクトリ/, /長さが制限/),
      caseOf(/HTML本文に利用者の入力[\s\S]+クロスサイトスクリプティング/, /HTML本文へ出力.*特殊文字をエスケープ/, /その文脈で構文になる特殊文字/, /問合せや操作/, /上位ディレクトリ/, /長さが制限/),
      caseOf(/ファイルを開く処理[\s\S]+ディレクトリトラバーサル/, /ファイルパスを正規化.*外を指す場合は拒否/, /境界外を許可しない/, /問合せや操作/, /HTMLタグ/, /長さが制限/),
    ],
  },
  41: {
    basis: '原問は2013年の磁気ディスクの消去選択。NIST SP 800-88 Rev. 2のSanitization概念を参照し、媒体の機能・再使用可否で消去と破壊を区別。 https://csrc.nist.gov/pubs/sp/800/88/r2/final',
    cases: [
      caseOf(/正常に動作するPCの磁気ディスク[\s\S]+引き渡して廃棄/, /全領域を複数回上書き/, /全記録領域を上書き/, /複数回圧縮/, /マスタブートレコード/, /ファイル名を複数回変更/),
      caseOf(/故障し[\s\S]+全領域に書き込めない[\s\S]+再利用を禁止/, /破砕装置で磁気ディスクの記録媒体/, /ソフトウェアによる全領域の消去ができない/, /複数回圧縮/, /マスタブートレコード/, /全領域を複数回上書き/),
      caseOf(/正常なPCの磁気ディスク[\s\S]+別部署で再利用/, /全領域を複数回上書き/, /物理的に壊すと再利用できない/, /複数回圧縮/, /マスタブートレコード/, /物理的に破砕/),
    ],
  },
  43: {
    basis: 'S/MIME RFC 8551、Base64 RFC 4648、gzip RFC 1952、PNG W3C仕様。 https://www.rfc-editor.org/rfc/rfc8551.html https://www.rfc-editor.org/rfc/rfc4648.html https://www.rfc-editor.org/rfc/rfc1952.html https://www.w3.org/TR/png-3/',
    cases: [
      caseOf(/電子メールを暗号化/, /^S\/MIME$/, /暗号化やディジタル署名/, /^BASE64$/, /^GZIP$/, /^PNG$/),
      caseOf(/英字・数字などの文字だけを用いた表現/, /^BASE64$/, /6ビットずつ/, /^S\/MIME$/, /^GZIP$/, /^PNG$/),
      caseOf(/画素の透過情報を保存できる可逆圧縮の画像形式/, /^PNG$/, /アルファチャネル/, /^S\/MIME$/, /^BASE64$/, /^GZIP$/),
      caseOf(/画像形式に限定せずファイルのデータを圧縮/, /^GZIP$/, /バイト列を可逆圧縮/, /^S\/MIME$/, /^BASE64$/, /^PNG$/),
    ],
  },
  44: {
    basis: 'HTTPS RFC 9110 §4.3.4。AIDEはファイル整合性チェッカー、ClamAVはアンチウイルススキャナー。 https://www.rfc-editor.org/rfc/rfc9110.html https://aide.github.io/ https://docs.clamav.net/',
    cases: [
      caseOf(/HTTPSを用いて/, /電子証明書によるサーバ認証/, /証明書を検証して通信相手のサーバを認証/, /ファイルの改ざん検知/, /ウイルス検査/, /クライアントに対する侵入検知/),
      caseOf(/WebサーバでAIDE/, /ファイルの改ざん検知/, /ファイルの変更を検出/, /電子証明書によるサーバ認証/, /ウイルス検査/, /クライアントに対する侵入検知/),
      caseOf(/クライアントにClamAV/, /ウイルス検査/, /ウイルスなどのマルウェア/, /電子証明書によるサーバ認証/, /ファイルの改ざん検知/, /クライアントに対する侵入検知/),
    ],
  },
  45: {
    basis: 'IPA FEシラバス Ver.1.6 中分類17「システム開発技術」要求分析・ソフトウェア設計。 https://www.ipa.go.jp/shiken/syllabus/gaiyou.html',
    cases: [
      caseOf(/ソフトウェア方式設計で行うべき/, /既に決定しているソフトウェア要件を.*実現/, /全体構造やコンポーネント/, /顧客に意見/, /1行ごと/, /要求内容を図表/),
      caseOf(/顧客要求を基にしたソフトウェア要求分析/, /要求内容を図表.*詳細化して分析/, /矛盾や抜けを検討/, /顧客に意見/, /1行ごと/, /既に決定しているソフトウェア要件/),
      caseOf(/方式設計の後で行うソフトウェア詳細設計/, /各ユニットのデータ構造や処理手順/, /ユニットの入出力、データ構造、処理手順/, /顧客に意見/, /既に決定しているソフトウェア要件/, /要求内容を図表/),
    ],
  },
  46: {
    basis: 'IPA FEシラバス Ver.1.6「ソフトウェア要件定義・設計」機能・振る舞いの表現。OMG UML 2.5.1 §14。 https://www.ipa.go.jp/shiken/syllabus/gaiyou.html https://www.omg.org/spec/UML/2.5.1/',
    cases: [
      caseOf(/状態遷移図を用いること/, /センサの情報.*温室制御/, /現在の状態により動作が異なり得る/, /在庫棚卸システム$/, /稼働状況報告システム$/, /水道料金計算システム$/),
      caseOf(/入力条件と処理規則の組合せを記述する決定表/, /使用者の区分，契約種別，検針量/, /各組合せと実行する処理/, /在庫棚卸システム$/, /稼働状況報告システム$/, /温室制御システム$/),
      caseOf(/日ごとの増減を示す折れ線グラフ/, /日次の稼働状況.*報告システム/, /日付順の折れ線/, /在庫棚卸システム$/, /水道料金計算システム$/, /温室制御システム$/),
    ],
  },
  47: {
    basis: 'IPA FEシラバス Ver.1.6「ソフトウェア結合・テスト」及びISTQB Glossary stub／driver。 https://www.ipa.go.jp/shiken/syllabus/gaiyou.html https://glossary.istqb.org/',
    cases: [
      caseOf(/スタブを使用した/, /仮の下位モジュール/, /呼び出される下位の機能/, /指定した命令が実行されるたび/, /変数やレジスタ/, /仮の上位モジュール/),
      caseOf(/ドライバを使用した/, /仮の上位モジュール/, /テスト対象のモジュールを呼び出す/, /指定した命令が実行されるたび/, /変数やレジスタ/, /仮の下位モジュール/),
      caseOf(/命令トレースを使用した/, /指定した命令が実行されるたび/, /処理の経過をたどれる/, /変数やレジスタ/, /仮の上位モジュール/, /仮の下位モジュール/),
    ],
  },
  48: {
    basis: 'IPA FEシラバス Ver.1.6 のテスト・性能評価、ISTQB Glossary stress testing／usability testing／regression testing。 https://www.ipa.go.jp/shiken/syllabus/gaiyou.html https://glossary.istqb.org/',
    cases: [
      caseOf(/ストレステストの目的/, /処理能力の限界状態/, /限界やそれを超える負荷/, /使いやすさを評価/, /他のコンピュータと性能を比較/, /意図しない影響/),
      caseOf(/ユーザビリティテストの目的/, /使いやすさを評価/, /実際の利用者に想定する操作/, /処理能力の限界状態/, /他のコンピュータと性能を比較/, /意図しない影響/),
      caseOf(/ベンチマークテストの目的/, /他のコンピュータと性能を比較/, /共通の条件で実行/, /処理能力の限界状態/, /使いやすさを評価/, /意図しない影響/),
      caseOf(/リグレッションテストの目的/, /意図しない影響/, /変更がそれまで動いていた動作を意図せず壊していないか/, /処理能力の限界状態/, /使いやすさを評価/, /他のコンピュータと性能を比較/),
    ],
  },
  49: {
    basis: '特許庁「用語の解説」「特許権侵害への救済手続」とOSI Open Source Definition §§1–3。 https://www.jpo.go.jp/resources/statistics/chizai_katudo/h29/kaisetu.html https://www.jpo.go.jp/support/ipr/patent-kyusai.html https://opensource.org/osd',
    cases: [
      caseOf(/包括的な特許クロスライセンス/, /特許権の使用を相互に許諾/, /特許の実施を互いに許諾/, /ソースコードを無償公開/, /相手の製造をやめさせる/, /費用を互いに分担/),
      caseOf(/オープンソースとしての公開/, /ソフトウェアの改良及び再配布/, /ライセンスによって改良と再配布/, /特許権の使用を相互に許諾/, /相手の製造をやめさせる/, /費用を互いに分担/),
      caseOf(/特許権に基づく差止請求/, /相手の製造をやめさせる/, /侵害行為の停止又は予防/, /ソフトウェアの改良及び再配布/, /特許権の使用を相互に許諾/, /費用を互いに分担/),
    ],
  },
  50: {
    basis: 'IPA FEシラバス Ver.1.6 の構成管理、テスト、進捗管理。 https://www.ipa.go.jp/shiken/syllabus/gaiyou.html',
    cases: [
      caseOf(/構成管理に起因しない/, /単体テストレベルのバグ/, /テストと品質管理の課題/, /改版手続に従わず/, /版数が対応付けられていない/, /派生プログラムに反映されない/),
      caseOf(/テストの計画・実施に起因しない/, /版が対応付けられておらず/, /版の対応付けは構成管理/, /テストケースが漏れ/, /テストを実施しなかった/, /回帰テストを省略/),
      caseOf(/日程や進捗の管理に起因しない/, /派生版の対応関係を記録しておらず/, /変更履歴と反映先の対応は構成管理/, /作業期間を過小に見積もった/, /実績を追跡していなかった/, /同時に開始する日程/),
    ],
  },
  51: {
    basis: 'PMIのWBS解説は作業の階層・ワークパッケージ・アクティビティ・スコープ記述書を区別。原問の参照版は不記載、IPA日本語選択肢の再録と独自説明のみ。 https://www.pmi.org/learning/library/developing-elaborating-work-breakdown-structures-7241 https://www.pmi.org/learning/library/work-breakdown-structure-leverage-techniques-6204',
    cases: [
      caseOf(/PMBOKによれば，WBSで定義/, /階層的に要素分解したワークパッケージ/, /作業範囲を階層に分け/, /実行，監視・コントロール/, /除外事項及び制約条件/, /完了するために必要な作業/),
      caseOf(/プロジェクト・スコープ記述書で定義/, /除外事項及び制約条件/, /範囲外とし、どのような制約/, /階層的に要素分解/, /実行，監視・コントロール/, /完了するために必要な作業/),
      caseOf(/アクティビティの定義で明らか/, /完了するために必要な作業/, /完了するのに必要な個別の作業/, /階層的に要素分解/, /実行，監視・コントロール/, /除外事項及び制約条件/),
    ],
  },
  52: {
    basis: 'IPA FEシラバス Ver.1.6 のプロジェクト・スケジュール・マネジメントとOR・IE（予測、線形計画法）。 https://www.ipa.go.jp/shiken/syllabus/gaiyou.html',
    cases: [
      caseOf(/プロジェクトの日程計画/, /^PERT$/, /作業の所要時間と前後関係/, /^回帰分析$/, /^時系列分析$/, /^線形計画法$/),
      caseOf(/広さや来店者数と売上高との関係/, /^回帰分析$/, /目的変数.*説明変数/, /^PERT$/, /^時系列分析$/, /^線形計画法$/),
      caseOf(/毎月の販売実績[\s\S]+季節ごとに繰り返す変動/, /^時系列分析$/, /長期の傾向や周期的な変動/, /^PERT$/, /^回帰分析$/, /^線形計画法$/),
      caseOf(/原材料の使用上限[\s\S]+総利益が最大[\s\S]+生産量を連続量/, /^線形計画法$/, /一次式の制約の下で一次式の目的を最大化/, /^PERT$/, /^回帰分析$/, /^時系列分析$/),
    ],
  },
};
