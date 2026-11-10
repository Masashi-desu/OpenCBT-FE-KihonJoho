type Claims = readonly [RegExp, RegExp, RegExp, RegExp];
type Case = readonly [condition: RegExp, claims: Claims, correctClaim: number];
type Series = { basis: readonly string[]; cases: readonly Case[] };
const ipa = 'https://www.ipa.go.jp/shiken/mondai-kaiotu/2011h23.html';

const drawing: Claims = [/静止画間の差分.*簡易な動画/, /図形や線などを部品.*変形や組合せ/, /筆先.*ビットマップ画像/, /複数の素材をシナリオ/];
const java: Claims = [/^HTML$/, /^Java VM$/, /^JDBC$/, /^SQL$/];
const recovery: Claims = [/^ダンプファイル$/, /^チェックポイントファイル$/, /^バックアップファイル$/, /^ログファイル$/];
const databaseMechanisms: Claims = [/参照先のない行.*禁止/, /読み出すときの入出力を減らす/, /破損したデータをバックアップ時点/, /断片化.*領域を回収/];
const analytics: Claims = [/^データウェアハウス$/, /^データディクショナリ$/, /^データマート$/, /^データマイニング$/];
const networkHeader: Claims = [/^MACアドレス$/, /^シーケンス番号$/, /^プロトコル番号$/, /^ポート番号$/];
const mediaAccess: Claims = [/論理的な順位.*送信権を順次/, /伝送媒体が使用中.*衝突.*ランダム/, /環状.*特殊なフレームを巡回/, /タイムスロットを割り当て/];
const networkDevice: Claims = [/^スイッチングハブ（レイヤ2スイッチ）$/, /^ブリッジ$/, /^リピータ$/, /^ルータ$/];
const networkService: Claims = [/IPアドレスの設定を自動化/, /ディレクトリサービスにアクセス/, /電子メールを転送/, /プライベートIPアドレスをグローバルIPアドレスに変換/];
const ntp: Claims = [/業務プログラムの応答時間/, /タイムサーバ.*時刻を合わせる/, /共用ファイルの更新時刻/, /電子メールを受信した時刻/];
const appProtocols: Claims = [/^FTP$/, /^HTTP$/, /^SMTP$/, /^TELNET$/];
const crypto: Claims = [/^AES$/, /^DSA$/, /^IDEA$/, /^RSA$/];
const timestamps: Claims = [/^タイムスタンプ$/, /^電子透かし$/, /^電子保存$/, /^配達証明$/];
const relations: Claims = [/^エンティティ間の関連$/, /^エンティティの型とインスタンスの関連$/, /^データとプロセスの関連$/, /^プロセス間の関連$/];
const review: Claims = [/^ウォークスルー$/, /^机上デバッグ$/, /^トップダウンテスト$/, /^並行シミュレーション$/];
const testDesign: Claims = [/入力範囲の境界とその前後/, /各群から代表値/, /各分岐の結果がすべて実行/, /条件と動作の組合せを決定表/];
const estimates: Claims = [/ステップ数を積算/, /WBSを作成し，各作業の工数/, /外部入出力や内部論理ファイル/, /過去の類似例.*実績と差異/];

// Conditions, claim meanings, and truth are held independently of the generator.
// Claim patterns verify all alternatives, including the false choices and their roles.
export const facts: Record<number, Series> = {
  28: { basis: [ipa, 'https://www.w3.org/TR/SVG2/'], cases: [
    [/^ドローソフト/, drawing, 1], [/^ペイントソフト/, drawing, 2], [/^マルチメディアオーサリングソフト/, drawing, 3],
  ] },
  32: { basis: [ipa, 'https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/module-summary.html'], cases: [
    [/Java.*データベース.*API/, java, 2], [/バイトコードを実行する仮想機械/, java, 1],
    [/表の定義，検索，更新.*言語/, java, 3], [/見出し，段落，リンク.*構造/, java, 0],
  ] },
  33: { basis: [ipa, 'https://www.postgresql.org/docs/current/backup.html'], cases: [
    [/更新前や更新後の値.*更新記録/, recovery, 3], [/再実行できるSQL文.*物理コピー/, recovery, 0],
    [/媒体障害.*別媒体へ物理コピー/, recovery, 2],
  ] },
  34: { basis: [ipa, 'https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK'], cases: [
    [/外部キー定義を行う目的/, [/レコード間の参照一貫性/, /格納場所を近く.*検索，更新/, /テーブル間の相互の関係.*復旧/, /格納エリアの虫食い状態/], 0],
    [/一緒に読み出す行を格納時に近く/, databaseMechanisms, 1],
    [/媒体障害.*バックアップを復元/, databaseMechanisms, 2],
    [/空きが散在した表.*再編成/, [/参照先のない行.*禁止/, /複数の表の行を互いに近く/, /破損したデータをバックアップ時点/, /断片化.*領域を回収/], 3],
  ] },
  35: { basis: [ipa, 'https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/data-dictionary-and-dynamic-performance-views.html'], cases: [
    [/DBMSが管理するデータ，利用者/, analytics, 1], [/全社の実績データ.*時系列に統合/, analytics, 0],
    [/販売部門.*項目と期間に絞って/, analytics, 2],
  ] },
  36: { basis: [ipa, 'https://www.rfc-editor.org/rfc/rfc9293.html', 'https://www.rfc-editor.org/rfc/rfc791.html'], cases: [
    [/TCP及びUDP.*通信相手のアプリケーション/, networkHeader, 3], [/Ethernetリンク.*フレームの宛先/, networkHeader, 0],
    [/TCP.*送信バイト列のどの位置/, networkHeader, 1], [/IPv4.*どのプロトコルに渡す/, networkHeader, 2],
  ] },
  37: { basis: [ipa, 'https://www.ieee802.org/3/'], cases: [
    [/^CSMA\/CD方式/, mediaAccess, 1],
    [/物理的なリング.*トークンリング/, [/物理的にバス接続.*送信権/, /媒体が空いていれば.*衝突/, /環状の接続.*特殊なフレームを巡回/, /タイムスロットを割り当て/], 2],
    [/時間枠を割り当てる時分割/, mediaAccess, 3],
  ] },
  38: { basis: [ipa, 'https://www.rfc-editor.org/rfc/rfc1812.html', 'https://www.ieee802.org/1/'], cases: [
    [/信号波形を増幅・整形.*物理層/, networkDevice, 2], [/宛先IPアドレスと経路表/, networkDevice, 3],
    [/多数の端末.*MACアドレス.*2ポート機器/, networkDevice, 0],
  ] },
  39: { basis: [ipa, 'https://www.rfc-editor.org/rfc/rfc2131.html', 'https://www.rfc-editor.org/rfc/rfc4511.html', 'https://www.rfc-editor.org/rfc/rfc5321.html', 'https://www.rfc-editor.org/rfc/rfc3022.html'], cases: [
    [/^DHCPの説明/, networkService, 0], [/^LDAPの説明/, networkService, 1], [/^SMTPの説明/, networkService, 2],
  ] },
  40: { basis: [ipa, 'https://www.rfc-editor.org/rfc/rfc5905.html'], cases: [
    [/^NTP（Network Time Protocol）の用途/, ntp, 1], [/レスポンスタイム測定の用途/, ntp, 0],
    [/差分バックアップ.*更新時刻.*対象選別/, [/要求に応答するまでの時間/, /時計を時刻サーバ/, /基準時刻より後に更新/, /別のサーバへ送る/], 2],
  ] },
  41: { basis: [ipa, 'https://www.rfc-editor.org/rfc/rfc854.html', 'https://www.rfc-editor.org/rfc/rfc959.html', 'https://www.rfc-editor.org/rfc/rfc9110.html', 'https://www.rfc-editor.org/rfc/rfc5321.html'], cases: [
    [/リモートログイン.*仮想端末/, appProtocols, 3], [/制御用接続とデータ転送用接続/, appProtocols, 0],
    [/GET.*ステータスコード/, appProtocols, 1], [/メールサーバ間で電子メールを配送/, appProtocols, 2],
  ] },
  42: { basis: [ipa, 'https://csrc.nist.gov/pubs/fips/197/final', 'https://csrc.nist.gov/pubs/fips/186-4/final', 'https://www.rfc-editor.org/rfc/rfc3058.html', 'https://www.rfc-editor.org/rfc/rfc8017.html'], cases: [
    [/大きな数の素因数分解.*公開鍵/, crypto, 3], [/ブロック長が128.*128，192，256/, crypto, 0],
    [/離散対数問題.*ディジタル署名/, crypto, 1], [/ブロック長が64.*128ビットの鍵/, crypto, 2],
  ] },
  43: { basis: [ipa, 'https://doi.org/10.6028/NIST.IR.7948', 'https://1.ieee802.org/security/802-1x/'], cases: [
    [/^認証デバイスに関する記述/, [/IEEE 802\.1X.*200kバイト以上/, /大容量の電力.*非接触型ICカードの方/, /成人には虹彩の経年変化がない.*更新がほとんど不要/, /静電容量方式.*LED照明/], 2],
    [/受動型の非接触ICカード.*給電・検出/, [/受動型.*内蔵電池でしか/, /接触型.*電力を電気接点/, /非接触.*データを保持できない/, /静電容量式.*カメラで撮影/], 1],
    [/光学式と静電容量式.*虹彩認証の測定原理/, [/光学式.*静電容量だけ/, /瞳孔の直径だけ/, /静電容量式.*静脈像を撮影/, /静電容量式.*隆線と谷.*容量の差/], 3],
  ] },
  45: { basis: [ipa, 'https://www.rfc-editor.org/rfc/rfc3161.html', 'https://www.post.japanpost.jp/service/fuka_service/haitatsu/'], cases: [
    [/不正にコピーされて転売/, timestamps, 1], [/特定の時刻には存在.*変更されていない/, timestamps, 0],
    [/郵便を受取人へ配達した事実/, timestamps, 3],
  ] },
  46: { basis: [ipa, 'https://doi.org/10.1145/320434.320440'], cases: [
    [/^E-R図/, relations, 0], [/^データフロー図.*入力されるデータ/, relations, 2], [/^業務フローチャート.*前後関係/, relations, 3],
  ] },
  47: { basis: [ipa, 'https://istqb.org/certifications/certified-tester-foundation-level'], cases: [
    [/作成者と複数の関係者が設計書をレビュー/, review, 0], [/入力例を用いて文を順に追い.*紙上/, review, 1],
    [/上位モジュールから結合.*スタブ/, review, 2], [/監査対象.*独立の検証プログラム.*照合/, review, 3],
  ] },
  48: { basis: [ipa, 'https://docs.oracle.com/javase/tutorial/java/concepts/'], cases: [
    [/^オブジェクト指向の特徴/, [/操作をあらかじめ指定/, /カプセル化.*相互依存性を高める/, /上位にあるすべてのクラスの変更/, /継承.*変更箇所を局所化/], 3],
    [/公開する操作と内部のデータ表現を分ける/, [/内部変数.*直接更新/, /契約を保てば.*内部表現を変え/, /必ずすべての親クラス/, /必ず継承関係/], 1],
    [/注文をクラスとして定義.*抽象化/, [/必要な属性や振る舞い.*無関係な詳細を省く/, /かかわらず全て含める/, /互いに無関係.*同じ内部実装/, /必ず全ての上位クラス/], 0],
  ] },
  49: { basis: [ipa, 'https://istqb.org/certifications/certified-tester-foundation-level'], cases: [
    [/^ホワイトボックステスト/, [/外部仕様に基づいて/, /同値分割の技法/, /内部構造に基づいて/, /入力と出力の関係から/], 2],
    [/同値分割によるテストの説明/, testDesign, 1], [/境界値分析によるテストの説明/, testDesign, 0],
  ] },
  50: { basis: [ipa, 'https://csrc.nist.gov/pubs/sp/800/128/upd1/final'], cases: [
    [/^ソフトウェア開発.*構成管理に起因しない/, [/改版手続に従わず/, /単体テストレベルのバグ/, /版数が対応付けられていない/, /派生元.*すべての派生プログラムに反映されない/], 1],
    [/業務システムの改修.*構成管理に起因しない/, [/正しい版.*データ件数の見積り/, /ライブラリの版を固定していなかった/, /ソースコードの版を記録せず/, /派生製品の版を管理せず/], 0],
    [/アプリケーションを保守.*構成管理に起因しない/, [/承認前の修正.*直接上書き/, /対応する版を記録せず/, /最大入力長のテストを計画に含めず/, /設定ファイルの版を記録せず/], 2],
  ] },
  52: { basis: [ipa, 'https://www.ifpug.org/'], cases: [
    [/^ファンクションポイント法の説明/, estimates, 2], [/^プログラムのステップ数に基づく/, estimates, 0],
    [/^WBSを使った開発工数/, estimates, 1], [/^開発規模の類推見積り/, estimates, 3],
  ] },
  53: { basis: [ipa], cases: [
    [/ウォータフォール型のソフトウェア開発.*運用テスト/, [/外部設計の誤り.*マニュアル.*コーディングの誤りに比べて修復コストは高い/, /コーディングの誤り.*要求定義の誤りに比べて修復コストは高い/, /テストケースの誤り.*外部設計の誤りに比べて修復コストは高い/, /内部設計の誤り.*コーディングの誤りに比べて修復コストは安い/], 0],
    [/要求定義の誤りとテストケースだけの誤り.*作業規模は同程度/, [/要求定義だけを書き直せば/, /後続の成果物も修正.*要求定義の誤りの修復コストは高い/, /テストケースだけの誤りでも後続工程を全て/, /修正対象が同じ.*修復コストは等しい/], 1],
    [/手順書の表記誤りと外部設計の仕様誤り.*作業規模は同程度/, [/利用者の目に触れる.*外部設計の誤りより修復コストは高い/, /両方とも運用テスト.*修復コストは等しい/, /実装とテストにも波及.*手順書の表記誤りより修復コストは高い/, /テストケースだけを直せば.*修復コストは低い/], 2],
  ] },
};
