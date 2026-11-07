import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { GeneratedBody } from "../../src/core/generators/definition";
import cohort from "./reviewed-stem-cohort.json";
import { legacy2019NetworkLockSchedule } from "./legacy-2019-autumn-network-oracle";
import { developmentSvg, readDevelopmentCurve } from "./legacy-2017-development-svg";

// Manually reviewed propositions, kept independent of the production cases.
// Four matchers identify the claims, followed by the independently selected
// truth mask. Their order is the source's answer-slot order.
// Shared entries explicitly name equivalent sources in the cohort.
const facts = String.raw`
2016h28a-fe-am-13|0100|必ず個別配布|サーバ側の該当|物理ファイルを直接|待受けサービス
2016h28a-fe-am-14|1000|残るサーバ一台当たり|必ず一台だけ|結果の一致だけ|拡張することはできない
2016h28a-fe-am-19|0100|最後に参照|最初に読み込んだ|単位時間当たり|累積の参照回数
2016h28a-fe-am-26|1000|間を流れるデータ|実体間の関連だけ|正確な時刻|配線位置だけ
2016h28a-fe-am-37|0010|記述を不正に|複製して持ち出す|サービス利用を妨害|通信を傍受
2016h28a-fe-am-38|0001|認証値の照合|暗号方式を自動判定|自然言語の要約|内容を理解できない
2016h28a-fe-am-39|0100|秘密鍵を同じ値|失効情報を提供|平文を必ず復元|有効期限を無条件
2016h28a-fe-am-40|0100|有効なまま|速やかに失効|全利用者で共通|本人確認せず
2016h28h-fe-am-11|1000|隣接する要素|常にキャッシュへ同時|分岐先は|同じアドレスの一つ
2016h28h-fe-am-19|1000|異なるアーキテクチャ|効率を高める|相互参照を解決|解釈しながら
2016h28h-fe-am-21|0010|型の不整合|命名規則の違反|実行済み部分の割合|制御フロー図だけ
2016h28h-fe-am-26|1000|複数現れることがある|必ず重複|一行だけ|自動的に一意
2016h28h-fe-am-29|1000|NULLを認めない|物理的に隣接|全て復元|常に保証
2016h28h-fe-am-40|0100|有効期限は設けない|使用後は無効|現パスワード|確認せず送信先
2016h28h-fe-am-41|0100|自動で失効|停止する手順|承認者を定めない|確認する必要はない
2016h28h-fe-am-42|0010|残しておく|合意なし|無効化を確認|退職後も
2016h28h-fe-am-44|0010|ファイル名|そのもののバイト列|展開して得られた|作成日時
2016h28h-fe-am-45|0010|ファイル名だけを変更|失敗しても|物理的に破壊|ケーブルを外して
2016h28h-fe-am-47|0100|レコード全体|独立したデータ引数|大域変数|制御引数
2016h28h-fe-am-50|0010|含め忘れ|一方の修正が失われ|データ量の増加|版を記録しなかった
2016h28h-fe-am-53|0010|^どちらの|^一方の|共通して含まれる|所要日数が最も長い
2016h28h-fe-am-55|0100|重大な影響|限られた範囲|CPU使用率|基本ソフトウェアだけ
2016h28h-fe-am-7|0010|^n＋|^n×F\(n−1\)|^n×F\(n−2\)|^\(n−2\)×
2016h28h-fe-am-9|0100|必ず2倍速|ほとんど短くならない|全ての装置|周期は比例
2017h29a-fe-am-10|0010|タイマー装置|入出力装置|専用の命令|ページフォールト
2017h29a-fe-am-12|0010|パリティを一台だけ|パリティを分散|二台に同じ内容|冗長な情報を保存せず
2017h29a-fe-am-13|0100|出力を照合|すぐに引き継げる|停止したまま|独立した業務
2017h29a-fe-am-14|0010|必ず事業者へ|どのSaaSにも|保守に関する自社の負担|検討する必要がなくなる
2017h29a-fe-am-16|0100|動的領域を解放せず|ページングに時間|必要時にだけ|小さく分断
2017h29a-fe-am-17|0100|繰り返し読み|同時更新を防ぐ|アドレスを相手|タスクを中断
2017h29a-fe-am-20|1000|枠数を減らす|枠数を増やす|所要時間だけ|読出し速度だけ
2017h29a-fe-am-22|0100|電気信号を回転|物理量を検出|命令を解釈|決めた順にだけ
2017h29a-fe-am-26|1000|^2相コミットメント$|^グループコミットメント$|マルチスレッド化|^ストアドプロシージャ$
2017h29a-fe-am-29|0001|^ACID特性$|^関数従属性$|^候補キーの一意性$|^データ独立性$
2017h29a-fe-am-3|0100|時間の経過だけ|前に外乱を観測|差を観測した後|一定に保つ
2017h29a-fe-am-30|0010|主記憶の作業|一時変数|更新後情報|更新前情報
2017h29a-fe-am-32|0100|学習表|期限付きで割り当てる|全ポートへ再送|分割する
2017h29a-fe-am-33|0100|保存して再利用|通過を許可又は拒否|グローバルIPアドレスに書き換え|ドメイン名から
2017h29a-fe-am-36|0100|公的機関|C&Cサーバ|証明書を発行|一括して遮断
2017h29a-fe-am-37|0001|バージョン情報|キャッシュ内|応答の増幅|ゾーン転送を要求
2017h29a-fe-am-38|0100|^AES$|^DH$|^DSA$|^RSA$
2017h29a-fe-am-39|0100|SQL命令|ブラウザで実行|候補を大量|サーバの処理を妨害
2017h29a-fe-am-40|1000|整合性を確認|全ての暗号文|文字の位置|第三者による閲覧を防ぐ
2017h29a-fe-am-41|0100|自己増殖|復旧の対価|必ず自動修復|同意を得て
2017h29a-fe-am-42|0100|IPアドレスやドメイン名|標準化を進める|対応を行うチーム|攻撃を行う集団
2017h29a-fe-am-43|0010|リスク源の特定|発生可能性の分析|対応策の選択|評価基準の設定
2017h29a-fe-am-44|1000|登録済みの送信元|起動するときだけ|ポート番号|暗号化するが
2017h29a-fe-am-49|0100|^0、10|^17、18、19、64、65、66$|^18、18|^20、30
2017h29a-fe-am-56|1000|間隔を.*短くする|同じディスクだけ|復元訓練を省略|必ず不要になる
2017h29a-fe-am-57|0100|サージ防護|非常用発電機|通信経路を二系統|電子データ
2017h29a-fe-am-58|0010|内容と実施した処置|整合を確認|記録せず|保存期間
2017h29a-fe-am-59|0010|役職が高い|記録の確認は省略|事実を確認|作業内容を決定
2017h29a-fe-am-6|1000|事象に対応|自分自身を呼び出し|記憶し|開始前の状態
2017h29a-fe-am-60|0100|収集証拠|監査意見|開始・終了時刻|設計だけ
2017h29a-fe-am-63|0010|住所を取り出す|紙に印刷|故障前に現れる|分析せず
`.trim();
const moreFacts = String.raw`
2017h29a-fe-am-64|1000|第三者機関|優先して調達|独自の環境主張|証書として取引
2017h29a-fe-am-7|0010|内部状態|サブクラスで再定義|引数の型や個数|上位クラスを定義
2017h29a-fe-am-70|0100|製造ノウハウ|共通の接続仕様|自社専用|自社内だけ
2017h29a-fe-am-72|1000|注文が確定した後|基準生産計画|作業指示票|同時並行
2017h29a-fe-am-73|0100|直流電力|ビルの空調|使用済み家電|湯を沸かし
2017h29a-fe-am-74|0010|固定値|交換日|多層のニューラル|固定回路
2017h29a-fe-am-75|0100|投資方針|安定したサービス運用|運用の適切性|財務諸表
2017h29a-fe-am-76|0100|日常の実務|集合研修|全く行わない|独習
2017h29a-fe-am-79|0100|雇用関係を結ぶが|雇用するのはA|必ず終了|も生じない
2017h29a-fe-am-8|0100|起動しておかなければ|Windows用のPerl|Javaのクラス|UNIX計算機
2017h29h-fe-am-1|1000|^A ∩ B ＝ A$|^A ∪ B ＝ A$|^A ∩ B ＝ B$|^A ∩ C ＝ C$
2017h29h-fe-am-12|0100|画像変換|複数サーバに分割できず|Webリクエスト|独立したファイル
2017h29h-fe-am-27|0100|全行を順に|ハッシュ表|整列し|全行を追加
2017h29h-fe-am-33|0100|^宛先IPアドレス$|^宛先MACアドレス$|^送信元IPアドレス$|^送信元MACアドレス$
2017h29h-fe-am-39|1000|注文情報を扱う企業|個人の消費者|株主の家庭|近隣の事業者
2017h29h-fe-am-4|0100|後方へ移動|先頭ポインタを更新|格納番地を直接|連続領域だけ
2017h29h-fe-am-41|1000|時計のずれ|生体認証|その時点に存在|作成時刻を変更
2017h29h-fe-am-43|1000|^WebサーバとDBサーバをDMZ|^WebサーバとDBサーバを内部|^WebサーバをDMZ|^Webサーバを外部
2017h29h-fe-am-46|0010|画面の項目|日程と体制|分岐や繰返し|業務の範囲
2017h29h-fe-am-47|1000|作成者が成果物|モデレータ|会議をせず|自動実行
2017h29h-fe-am-48|1000|継承、関連、集約、依存|正規化|標本化|連接
2017h29h-fe-am-56|0100|知らせない|共に再検証|対象から外して|本番稼働後
2017h29h-fe-am-58|0100|全ての指摘を削除|追加証拠を確認|確認しない|報告を取りやめ
2017h29h-fe-am-60|0100|成果を確認せず|成果を評価|責任が専門家|確認する必要がない
2017h29h-fe-am-63|0010|アプリケーション|サーバの利用権|利用者が所有|製造工程
2017h29h-fe-am-64|0100|必要はない|私用領域への影響|無条件|認証を省略
2017h29h-fe-am-65|0100|機能間で受け渡す|開発時に従う技術標準|どこまでをシステム|情報の項目
2017h29h-fe-am-7|1000|ハッシュ値|規則を決めず|先頭から走査|保持しない
2017h29h-fe-am-70|0100|営業利益率|継続利用率|出荷までの日数|研修の修了率
2017h29h-fe-am-72|0100|全て同じ完成品|部品表|後工程|品質を考慮せず
2017h29h-fe-am-75|0100|反対意見を発言させない|共通点と争点|合う意見だけ|予約だけ
2017h29h-fe-am-77|0001|株式|仕入代金|返済|機械装置
2017h29h-fe-am-79|0100|必ず著作権侵害|表現の複製|機械語|基本プログラム
2017h29h-fe-am-9|1000|主記憶にも|追い出すときまで|古い値を有効|書込みを認めない
2018h30a-fe-am-10|0001|^インデックスレジスタ$|^データレジスタ$|^プログラムカウンタ$|^命令レジスタ$
2018h30a-fe-am-13|0100|Webサーバだけ|APサーバ側|必ずゼロ|必要はなくなる
2018h30a-fe-am-14|0010|^③、④、②、①$|^④、②、③、①$|^④、③、②、①$|^④、③、①、②$
2018h30a-fe-am-17|0100|補助記憶|別の実行可能|外部へ送る|必ず停止
2018h30a-fe-am-18|0100|同じ長さ|優先度が最も高い|最初に到着|終了したタスク
2018h30a-fe-am-19|0100|^意味解析$|^構文解析$|^最適化$|^機械語の実行$
2018h30a-fe-am-2|0010|^排他的論理和|^否定論理積|^論理積|^論理和
2018h30a-fe-am-20|0100|トークン列|主記憶へ配置|外部参照|停止位置
2018h30a-fe-am-23|1000|^アルカリマンガン乾電池$|^ニッケル水素蓄電池$|^鉛蓄電池$|^リチウムイオン電池$
2018h30a-fe-am-24|0001|^感性|^自然言語|^ノンバーバル|^マルチモーダル
2018h30a-fe-am-27|0010|データ型に反して|値域と異なる|符号化方式|区分語がなく
2018h30a-fe-am-29|0100|必ず同時|待ち合わせる|使わず更新|必ずなくなる
2018h30a-fe-am-3|0100|重みを学習|規則を適用|画素数|最短時間
2018h30a-fe-am-32|0100|^リピータ|^ブリッジ|^ルータ|^ゲートウェイ
2018h30a-fe-am-35|0001|^LTE|^MAC|^MDM|^VoIP
2018h30a-fe-am-36|1000|読めない|著作権の帰属|動作が正しい|全て不可能
2018h30a-fe-am-38|1000|対応する秘密鍵|平文で配る|誰でも|必ず同じ
2018h30a-fe-am-41|0100|攻撃を命令|分散して配信|パスワード|配線だけ
2018h30a-fe-am-42|1000|許可された検査データ|暗号鍵|通知することだけ|主観だけ
2018h30a-fe-am-43|1000|ディスクに保存|署名|マルウェア定義|ファイル名だけ
2018h30a-fe-am-44|1000|端末間通信を.*遮断|SSIDを短く|共通の接続用|帯域制限
2018h30a-fe-am-45|0001|^192[.]0[.]2[.]10|^198[.]51[.]100[.]7/c[.]example/b[.]example$|^198[.]51[.]100[.]7/b[.]example/c[.]example$|^198[.]51[.]100[.]7/c[.]example/d[.]example$
2018h30a-fe-am-46|1000|ライフライン|物理的なメモリ|行番号だけ|命令長だけ
2018h30a-fe-am-47|0100|必ず同じ値|独立した残高|必ず二つ用意|口座Bを作れない
2018h30a-fe-am-48|0100|^共通結合$|^制御結合$|^データ結合$|^内容結合$
`.trim();
const laterFacts = String.raw`
2018h30a-fe-am-50|1000|テストを先に作り|完了した後|テストを削除|リファクタリングできない
2018h30a-fe-am-51|1000|横棒|階層的|網図|追加費用
2018h30a-fe-am-58|0100|承認された媒体|承認を受けず|申請と承認の記録|検知して停止
2018h30a-fe-am-59|0010|施錠した容器|契約で定め|記録せず|数量を確認
2018h30a-fe-am-60|0100|^株主$|^監査役$|^業務担当者$|^経営者$
2018h30a-fe-am-61|1000|投資完了後|実施前|実現済み|収集せず
2018h30a-fe-am-62|0100|持ち込む|機能を.*利用|業務プロセス全般|製造する
2018h30a-fe-am-63|1000|全体最適化|サービスの組合せ|一つの命令|個別に最適化
2018h30a-fe-am-64|1000|影響範囲|目的がまだ決まらない|現行版を確認せず|試験や記録を全て省き
2018h30a-fe-am-67|1000|需要が減り|認知がまだ乏しく|急拡大|大きく安定
2018h30a-fe-am-7|0100|その値も含めて|^添字は0から始め、要素数より小さい|1から始め|2小さい
2018h30a-fe-am-71|0100|収集できない|センサーと通信装置|自分だけで|閉域網では
2018h30a-fe-am-72|1000|^反射などの光学的|無線給電|人工衛星|必ず読み取れる
2018h30a-fe-am-73|1000|基本的な機能を無料|注文後|代金を預かり|オンラインと実店舗
2018h30a-fe-am-79|0001|従業員名簿|顔画像|指紋|統計情報
2018h30a-fe-am-8|0100|二つ以上のクラス|複数のインタフェース|整数型|ポインタ型
2018h30a-fe-am-80|0100|^受託者の責任者|直接受けて従う|自ら確認|^発注者の要請を
2018h30h-fe-am-10|0001|整数除算|仮想ページ|命令コード|タイマー
2018h30h-fe-am-11|1000|ブロック転送|全要素が必ず|物理容量も自動|例外として通知
2018h30h-fe-am-17|0100|最短|カレントディレクトリ|ホームディレクトリ|ルートディレクトリ
2018h30h-fe-am-25|1000|再生開始や停止|圧縮符号化|メタデータ|表示素子
2018h30h-fe-am-26|0100|現実のカメラ|仮想の環境|ファイル名|小さく印刷
2018h30h-fe-am-28|0010|^カーソル$|^スキーマ$|^テーブル$|^ビュー$
2018h30h-fe-am-34|0010|^Bcc$|^Date$|^Received$|^X-Mailer$
2018h30h-fe-am-36|1000|データベース命令|ダウンロード・実行|接続要求|肩越し
2018h30h-fe-am-37|1000|高い権限|公開ポート|部品を交換|可逆圧縮
2018h30h-fe-am-38|0010|^Bさんだけ|^BさんとCさん|^Cさんだけ|^Aさんだけ
2018h30h-fe-am-40|1000|署名をDNS|IPアドレス|上司|永久に保管
2018h30h-fe-am-42|0100|企画・設計時|既知の弱点|業務機能|運用後の変更を調べない
2018h30h-fe-am-45|1000|高くなる可能性|必ずゼロ|変化しない|指紋や静脈自体
2018h30h-fe-am-55|1000|根本原因|記録から消す|一次回答だけ|履歴を廃棄
2018h30h-fe-am-56|0100|各拠点|少数拠点|分散した要員|私的連絡先
2018h30h-fe-am-57|0100|任意の時点|オンラインバックアップ|同じ媒体|拡張子
2018h30h-fe-am-58|0100|確認済み|追加の調査|命令する|不足を隠し
2018h30h-fe-am-59|1000|個人的な報酬|独立した監査部門|支援する|独立した立場で
2018h30h-fe-am-61|0100|日時だけ|特徴を学習|一定時間|紙のマニュアル
2018h30h-fe-am-66|0010|^キャッシュフロー|^市場の|^垂直統合$|^リードタイム
2018h30h-fe-am-7|0010|必ず削除|キーの比較をせず|実際のキーを比較|二分探索木の根
2018h30h-fe-am-71|0010|散水|温室|紙だけ|家畜
2018h30h-fe-am-72|0010|頻度|心理的|販売数量|使用した人
2018h30h-fe-am-73|0100|品種が頻繁|工程を標準化|受注ごと|試作品
2018h30h-fe-am-76|0010|^OC曲線$|^ゴンペルツ曲線$|^バスタブ曲線$|^ロジスティック曲線$
2018h30h-fe-am-77|0010|^売掛金$|^資本金$|^社債$|^投資有価証券$
2019h31h-fe-am-20|1000|個別ライセンス|全て無視|企業による利用を禁止|無条件で公開
2019h31h-fe-am-23|1000|変換段数を減らし|電圧の調整をせず|故障が起こらなく|通常の変圧器
2019h31h-fe-am-26|1000|複数定義|使うことはできない|同じ名前|同じ値
2019h31h-fe-am-39|1000|素因数分解|同じ秘密鍵|数学的に不可能|秘密鍵を公開
2019h31h-fe-am-40|0010|保険|資金を積み立て|業務を中止|発生確率を下げる
2019h31h-fe-am-42|0100|不備|圧力|納得|正しく伝える
2019h31h-fe-am-59|0010|所属させる|経営者へ報告|研修や継続学習|引き受けない
2019h31h-fe-am-60|0010|取得・確認|復元試験|一か所だけ|契約で
2019h31h-fe-am-62|0010|再生を要求|検索を実行|毎朝決まった|注文の都度
2019h31h-fe-am-63|1000|販売と返品|画像で保存|教材|承認順
2019h31h-fe-am-66|0100|検索条件|復旧目標|宛先と金額|権限
2019h31h-fe-am-72|1000|投資家|一般消費者|行政機関|個人が
2019h31h-fe-am-77|0100|原因|結果|属性|手段
`.trim();
const finalFacts = String.raw`
2019r01a-fe-am-29|0010|^update X/read W|^update Y/read W|^read W/update Y/update Z/update X$|^update Z/update X
2019r01a-fe-am-32|0001|データリンク層|ネットワーク層|相互に変換|物理層
2019r01a-fe-am-40|0100|本人確認|保証はない|必ず復元|必ず再作成
2019r01a-fe-am-43|0010|隔離環境|ログを関連付け|集中的|許可又は拒否
2019r01a-fe-am-48|0100|実行を開始|戻り値|削除する|暗号化
2019r01a-fe-am-49|0100|xが正のテストだけ|達成条件が一致|xが0のテストだけ|Cだけは実行されない
2019r01a-fe-am-50|1000|^テストファースト$|^ペアプログラミング$|^継続的インテグレーション$|^コードの共同所有$
2019r01a-fe-am-56|1000|欠落・重複しない|必ず自動|記録を削除|別々に注文
2019r01a-fe-am-58|1000|結果と判定の記録|記憶だけ|再試験を省き|再現を不可能
2019r01a-fe-am-59|0100|自分で監査|利害関係を確認|報酬が増える|資格名だけ
2019r01a-fe-am-60|1000|履歴を照合|自分で承認|代わりに変更|記録を確認せず
2019r01a-fe-am-62|1000|業務画面|ロボットアーム|磁気テープ|モーター
2019r01a-fe-am-63|0010|文字数だけ|固定費|販促や品ぞろえ|停電時
2019r01a-fe-am-73|1000|分類モデルを学習|名前の順|カウンタ|固定した時刻
2019r01a-fe-am-74|0100|影響に関係なく|優先順位と必要資源|一切含めない|知らせない
2023-a-14|0010|台帳|認証を行い|未登録の端末|取り消し
2025-a-15|0010|有効にして|連絡先と対応手順|常に無効|定期的に
2025-a-8|0100|URLの文字列だけ|証明書|パスワード|キャッシュ
2026-a-18|0100|特徴を.*学習|固定した.*しきい値|分類モデル|予測モデル
2026-a-9|0001|^パスワード認証、指紋認証$|^スマートカード|^顔認証|^パスワード認証、ハードウェア
sample-2022-dec-a-21|1000|参照権限を与える|必ず必要|削除される|削除する必要
sample-2022-dec-a-23|1000|メタデータを管理|画像は削除|長さだけ|蓄積しない
sample-2022-dec-a-33|0010|使い切った後|自動で修正|正常終了|使わずに復元
sample-2022-dec-a-34|1000|ポートへ接続|監査記録|プロトコル入力|攻撃パターン
sample-2022-dec-a-41|0010|一切更新しない|スプリントを延長|再交渉|品質を下げる
sample-2022-dec-a-42|1000|影響は開始直後が大きく、修正コストは完了直前|影響も修正コストも、開始直後|影響も修正コストも、完了直前|影響は完了直前
sample-2022-dec-a-53|0100|補助金|仮説を見直し|大規模投資|計画を変えず
`.trim();

const reviewedFacts = new Map(
  [facts, moreFacts, laterFacts, finalFacts].flatMap(part => part.split("\n").map(line => {
    const [source, mask, ...patterns] = line.split("|");
    assert.equal(patterns.length, 4, source);
    assert.match(mask, /^0*10*$/u);
    return [source, { mask, patterns }] as const;
  })),
);
const records = new Map(cohort.rows.map(row => [row.source, row]));
export function assertReviewedStemMeaning(source: string, body: GeneratedBody, values: number[]): boolean {
  const row = records.get(source);
  if (!row || row.outcome !== "revised" || values[0] !== row.selector) return false;
  assert.deepEqual(values, [row.selector, ...row.reference.slice(1)], source);
  const review = row.equivalents.map(id => reviewedFacts.get(id)).find(Boolean);
  const prompt = body.prompt.map(block => block.type === "paragraph" || block.type === "code" ? block.text : "").join("\n");
  assert(prompt.includes(row.stemAnchor), source);
  assert.equal(body.choices.length, 4);
  assert.equal(new Set(body.choices.map(c => JSON.stringify(c))).size, 4);
  const transcript = { prompt: body.prompt, choices: body.choices, explanation: body.explanation };
  assert.equal(createHash("sha256").update(JSON.stringify(transcript)).digest("hex"), row.approvedContentSha256, source + " reviewed wording");
  if (source === "2016h28a-fe-am-3" || source === "2017h29h-fe-am-53") {
    assertStructuredFigures(source, body);
    return true;
  }
  assert(review, "Missing independent propositions for " + source);
  const alternatives = body.choices.map(blocks => blocks.map(block =>
    block.type === "paragraph" ? block.text : block.type === "table" ? block.rows[0].join("/") : "",
  ).join("\n"));
  const patterns = review.patterns.map(pattern => new RegExp(pattern, "u"));
  for (const [i, text] of alternatives.entries()) {
    assert(patterns[i].test(text), source + " alternative " + i);
    assert.equal(patterns.filter(pattern => pattern.test(text)).length, 1, source + " ambiguous claim " + i);
  }
  assert.equal(body.correctIndex, review.mask.indexOf("1"), source);
  assert(body.explanation.trim().length > 25, source);
  assertComputationalCases(source, body, alternatives, prompt);
  return true;
}
function assertComputationalCases(source: string, body: GeneratedBody, alternatives: string[], prompt: string) {
  if (source === "2019r01a-fe-am-29") {
    assert(prompt.includes("専有ロック") && prompt.includes("全て保持"));
    const winners = body.choices.map(blocks => {
      assert(blocks[0].type === "table");
      return !legacy2019NetworkLockSchedule(blocks[0].rows[0], true).deadlock;
    });
    assert.deepEqual(winners, [false, false, true, false]);
  }
  if (source === "2017h29h-fe-am-1") {
    const valid = [true, true, true, true];
    for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) for (let c = 0; c < 8; c++) {
      if ((a & b) !== a) continue;
      [(a & b) === a, (a | b) === a, (a & b) === b, (a & c) === c].forEach((truth, i) => { valid[i] &&= truth; });
    }
    assert.deepEqual(valid, [true, false, false, false]);
  }
  if (source === "2016h28h-fe-am-7") {
    assert(prompt.includes("非負の偶数") && prompt.includes("n＝0"));
    for (let n = 2; n <= 12; n += 2) {
      const product = (last: number) => Array.from({length: last / 2}, (_, i) => 2 * (i + 1)).reduce((p, x) => p * x, 1);
      assert.equal(product(n), n * product(n - 2));
      assert.notEqual(product(n), n + product(n - 2));
    }
  }
  if (source === "2018h30a-fe-am-2") {
    assert(prompt.includes("最も右の1だけ"));
    assert(prompt.includes("Bの各ビットを反転"));
    for (let a = 1; a < 256; a++) {
      const lowest = Array.from({length: 8}, (_, bit) => 2 ** bit).find(bit => Math.floor(a / bit) % 2)!;
      const b = a - 1, c = 255 - b;
      assert.equal(a & c, lowest);
    }
  }
  if (["2017h29a-fe-am-49", "2019h31h-fe-am-47"].includes(source)) {
    const boundaries = [18, 65].flatMap(n => [n - 1, n, n + 1]);
    assert.deepEqual(alternatives[body.correctIndex!].split("、").map(Number), boundaries);
  }
  if (["2018h30a-fe-am-7", "sample-2022-dec-a-9"].includes(source)) {
    for (let length = 1; length <= 12; length++) {
      const walked = Array.from({length}, (_, i) => i);
      assert(walked.every(i => i >= 0 && i < length));
      assert.equal(new Set(walked).size, length);
    }
    assert(prompt.includes("0から始まる"));
  }
  if (source === "2018h30a-fe-am-14") {
    const dependencies = [[4, 3], [3, 2], [2, 1]];
    const valid = alternatives.map(text => {
      const order = [...text].flatMap(c => "①②③④".includes(c) ? ["①②③④".indexOf(c) + 1] : []);
      return dependencies.every(([before, after]) => order.indexOf(before) < order.indexOf(after));
    });
    assert.deepEqual(valid, [false, false, true, false]);
  }
  if (source === "2018h30a-fe-am-45") {
    const ownDomains = new Set(["a.example", "b.example"]);
    assert(prompt.includes("a.exampleとb.example"));
    const valid = body.choices.map(blocks => {
      assert(blocks[0].type === "table");
      const [ip, from, to] = blocks[0].rows[0];
      return ip === "198.51.100.7" && !ownDomains.has(from) && !ownDomains.has(to);
    });
    assert.deepEqual(valid, [false, false, false, true]);
  }
  if (source === "2018h30h-fe-am-28") {
    assert(prompt.includes("CREATE TABLE X"));
    assert(prompt.includes("OPEN C") && prompt.includes("CURRENT OF C") && prompt.includes("CLOSE C"));
  }
}
function assertStructuredFigures(source: string, body: GeneratedBody) {
  // Independent diagram observations are supplied below. The renderer's
  // actual scene inputs must match the reviewed edges / measured curve.
  if (source === "2016h28a-fe-am-3") {
    const figures = body.choices.map(blocks => {
      assert(blocks[0].type === "diagram" && blocks[0].scene.kind === "source_figure");
      return blocks[0].scene.values;
    });
    assert.deepEqual(figures, [
      [0,0,1,2,0,0,0,0,0,0], [0,1,1,0,2,2,0,0,0,0],
      [0,1,0,2,0,2,0,0,0,0], [0,0,0,2,0,0,0,0,1,1],
    ]);
    const truth = figures.map(values => {
      const [firstOutput, secondOutput, closingOutput, from, to, final, ...loops] = values;
      const swapped = loops.pop();
      const edges = [
        [0, 1, firstOutput], [1, 2, secondOutput], [from, to, closingOutput],
      ];
      if (swapped || final === 0 || loops.some(output => output !== 0)) return false;
      let state = 0;
      for (let coin = 1; coin <= 2; coin++) {
        const next = edges.filter(edge => edge[0] === state);
        if (next.length !== 1 || next[0][2] !== (coin === 2 ? 1 : 0)) return false;
        state = next[0][1];
        if ((state === final) !== (coin === 2)) return false;
      }
      return true;
    });
    assert.deepEqual(truth, [false, false, true, false]);
    assert.equal(body.correctIndex, truth.indexOf(true));
  } else {
    const curves = body.choices.map(blocks => {
      assert(blocks[0].type === "diagram" && blocks[0].scene.kind === "source_figure");
      return blocks[0].scene.values;
    });
    const truth = curves.map(values => {
      const [variant, choice] = values;
      const curve = readDevelopmentCurve(developmentSvg("legacy-2017-cumulative-bug-curve", values), variant, choice);
      return curve.slopes.every((slope, i, all) => slope > 0 && (i === 0 || slope > all[i - 1] + 1e-7));
    });
    assert.deepEqual(truth, [true, false, false, false]);
    assert.equal(body.correctIndex, truth.indexOf(true));
    assert(body.explanation.includes("増分"));
  }
}
