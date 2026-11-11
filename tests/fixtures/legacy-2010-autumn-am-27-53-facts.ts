type Claims=readonly [RegExp,RegExp,RegExp,RegExp];
type Case=readonly [condition:RegExp,claims:Claims,correctClaim:number];
const ipa='https://www.ipa.go.jp/shiken/mondai-kaiotu/2010h22.html';
const graphics:Claims=[/最終段階.*映像化/,/ウィンドウ内の見える部分だけ/,/表面に柄や模様/,/物体の表面に陰付け/];
const relations:Claims=[/^結合$/,/^削除$/,/^射影$/,/^選択$/];
const maintenance:Claims=[/^再編成$/,/^データベースダンプ$/,/^バックアップ$/,/^ロールバック$/];
const layer:Claims=[/経路選択と中継/,/アプリケーションに.*ファイル転送/,/ビットを送受信.*信号/,/隣接ノード間のフレーム/];
const equipment:Claims=[/^ゲートウェイ$/,/^ブリッジ$/,/^リピータ$/,/^ルータ$/];
const addresses:Claims=[/^あて先IPアドレス$/,/^あて先MACアドレス$/,/^発信元IPアドレス$/,/^発信元MACアドレス$/];
const continuity:Claims=[/有効性を検証.*テスト/,/許容される最大停止時間/,/手順について関係者を集め教育/,/環境の変化.*内容を見直す/];
const risk:Claims=[/損失の発生率を低下/,/保険に加入.*損失の負担を分担/,/リスクの原因を除去/,/単位に分解するか集約/];
const network:Claims=[/^シンクライアントエージェント$/,/^ストリクトルーティング$/,/^バックドア$/,/^フォレンジック$/];
const oop:Claims=[/^カプセル化$/,/^クラス化$/,/^集約化$/,/^汎化$/];
const web:Claims=[/^Ajax$/,/^CSS$/,/^RSS$/,/^SNS$/];

// These cases identify the semantics of every choice, independent of generated keys.
export const facts:Record<number,{basis:string[];cases:Case[]}>={
  28:{basis:[ipa,'https://registry.khronos.org/OpenGL/specs/gl/glspec46.core.pdf'],cases:[
    [/^3次元グラフィックス処理におけるクリッピング/,graphics,1],
    [/^3次元グラフィックス処理におけるレンダリング/,graphics,0],
    [/^3次元グラフィックス処理におけるテクスチャマッピング/,graphics,2],
    [/^3次元グラフィックス処理におけるシェーディング/,graphics,3],
  ]},
  30:{basis:[ipa,'https://www.postgresql.org/docs/current/queries.html'],cases:[
    [/表から特定の列を得る/,relations,2],[/元の表を書き換えず.*条件に合う行/,relations,3],
    [/共通する属性値で対応付け/,relations,0],[/指定した行が格納されなくなる/,relations,1],
  ]},
  32:{basis:[ipa,'https://www.postgresql.org/docs/current/maintenance.html','https://www.postgresql.org/docs/current/backup.html'],cases:[
    [/アクセス効率を低下させない/,maintenance,0],[/確定前のトランザクションを中止/,maintenance,3],
    [/再実行できるSQL文.*物理コピー/,maintenance,1],[/媒体障害に備え.*別の媒体に物理的に複製/,maintenance,2],
  ]},
  34:{basis:[ipa,'https://www.itu.int/rec/T-REC-X.200-199407-I/en'],cases:[
    [/^OSI基本参照モデルにおけるネットワーク層/,[/ルーティングや中継/,/最も利用者に近い部分/,/物理的な通信媒体の特性/,/隣接ノード間の伝送制御手順/],0],
    [/^OSI基本参照モデルにおける応用層/,layer,1],[/^OSI基本参照モデルにおける物理層/,layer,2],
    [/^OSI基本参照モデルにおけるデータリンク層/,layer,3],
  ]},
  35:{basis:[ipa,'https://www.ieee802.org/1/','https://www.rfc-editor.org/rfc/rfc1812.html'],cases:[
    [/^複数のLAN.*データリンク層のプロトコル情報/,equipment,1],[/^伝送距離を延ばす.*物理層の信号/,equipment,2],
    [/異なるIPネットワーク.*あて先IPアドレスと経路表/,equipment,3],[/異なるアプリケーションプロトコル.*相互変換/,equipment,0],
  ]},
  36:{basis:[ipa,'https://www.rfc-editor.org/rfc/rfc1812.html','https://www.rfc-editor.org/rfc/rfc2827.html'],cases:[
    [/^ルータがパケットの経路決定/,addresses,0],[/学習済みの転送表.*出力ポート/,addresses,1],
    [/到着ポート.*発信した装置.*転送表に学習/,addresses,3],[/発信したと名乗る端末.*許可したIPv4アドレス範囲/,addresses,2],
  ]},
  40:{basis:[ipa,'https://pages.nist.gov/800-63-4/sp800-63b.html'],cases:[
    [/行動的特徴を用いているものはどれか。$/,[/血管の分岐点の分岐角度/,/署名するときの速度や筆圧/,/どう孔から外側/,/隆線.*マニューシャ/],1],
    [/身体的特徴を用いているものはどれか。$/,[/手指の静脈/,/署名するときのペンの移動速度/,/キーを押す時間/,/歩幅の時間的な変化/],0],
    [/筆記具や画像の撮影を使わず，文字入力の操作/, [/手指の静脈/,/顔を撮像/,/キーを押す時間/,/指紋の隆線と分岐/],2],
  ]},
  42:{basis:[ipa,'https://www.bousai.go.jp/kyoiku/kigyou/keizoku/'],cases:[
    [/ビジネスインパクト分析/,continuity,1],[/手順が実際に機能するか検証/,continuity,0],
    [/実行を担う関係者.*習熟/,continuity,2],[/主要取引先が変わり.*前提条件が現状と異なった/,continuity,3],
  ]},
  43:{basis:[ipa,'https://csrc.nist.gov/pubs/sp/800/39/final'],cases:[
    [/^リスク移転に該当/,risk,1],[/負担先を変えず.*確率を低減/,risk,0],
    [/活動をやめてリスクを回避/,[/活動を続けながら.*発生率を低下/,/保険.*負担を分担/,/活動自体を中止.*リスクを除く/,/単位に分解して評価/],2],
  ]},
  44:{basis:[ipa,'https://www.rfc-editor.org/rfc/rfc791.html','https://csrc.nist.gov/pubs/sp/800/86/final'],cases:[
    [/侵入者が通常のアクセス経路以外/,network,2],[/証拠を保全し.*発生経緯を分析/,network,3],
    [/送信元経路指定.*別の中継点を挟まず/,network,1],
  ]},
  45:{basis:[ipa],cases:[
    [/^DFDの表記方法/,[/2本の平行線は同期/,/円には，データを蓄積/,/四角には，入力画面や帳票/,/矢印には，データを表す名前/],3],
    [/^DFDのデータストアに名前/,[/平行線に.*蓄積するファイル/,/円に.*蓄積するファイル/,/四角に.*蓄積するファイル/,/矢印に.*蓄積するファイル/],0],
    [/^DFDの処理に名前/,[/平行線に.*変換処理の名前/,/円に.*入出力データを変換する処理/,/四角に.*内部の変換処理/,/矢印に.*変換処理の名前/],1],
  ]},
  46:{basis:[ipa,'https://www.omg.org/spec/UML/2.5.1/'],cases:[
    [/属性と振る舞いを一つにまとめた構造/,oop,0],[/全体・部分の関係.*独立のライフサイクル/,oop,2],
    [/共通する属性や振る舞いを取り出して.*上位のクラス/,oop,3],
  ]},
  47:{basis:[ipa,'https://docs.oracle.com/javase/tutorial/java/concepts/'],cases:[
    [/^オブジェクト指向におけるクラスとインスタンス/,[/インスタンスはクラスの仕様を定義/,/クラスの定義に基づいてインスタンス/,/一つのインスタンス.*複数のクラス/,/一つのクラス.*ただ一つ存在/],1],
    [/^一つの注文クラス.*二つの注文を生成/,[/同じ注文クラス.*注文番号の値は別々/,/注文ごとに別のクラス/,/一つのインスタンスにしか保持/,/クラス定義で一つに固定/],0],
    [/在庫品オブジェクトをまだ生成していない/,[/インスタンスがなければ.*定義できない/,/必ず一つの在庫品インスタンス/,/一つもない時点でも.*定義は存在/,/生成すると.*定義は消去/],2],
  ]},
  48:{basis:[ipa,'https://istqb.org/certifications/certified-tester-foundation-level'],cases:[
    [/^ブラックボックステスト/,[/コーディングが終了した段階.*ソースリスト/,/機能仕様やインタフェースの仕様に基づき/,/処理手順.*ロジック経路/,/すべての条件判定.*真と偽/],1],
    [/実行可能な全経路の網羅/,[/変数名だけを列挙/,/機能仕様やインタフェースの仕様だけ/,/実行可能なロジック経路を列挙/,/判定が真と偽になることだけ/],2],
    [/単独の条件による二分岐.*分岐の結果を網羅/,[/実行する行の数だけ/,/機能仕様の入出力だけ/,/同じ判定結果を通る経路を複数回/,/各条件判定で真と偽をそれぞれ1回以上/],3],
  ]},
  49:{basis:[ipa,'https://xhr.spec.whatwg.org/','https://www.w3.org/TR/css/','https://www.rssboard.org/rss-specification'],cases:[
    [/JavaScriptの非同期通信.*画面遷移を伴わず/,web,0],[/HTML文書.*表示を指定/,web,1],
    [/記事の見出し，リンク.*購読用ソフトウェア/,web,2],
  ]},
  50:{basis:[ipa,'https://www.jpo.go.jp/support/ipr/kenrishingai.html','https://www.wipo.int/wipolex/en/legislation/details/6858'],cases:[
    [/^組込みシステムの特許/,[/ハードウェア部分だけが.*ライセンスを得ないと権利侵害/,/ハードウェア部分のライセンスを得れば.*模倣して製品化/,/異なる会社が保有.*ライセンスを得て製品化することはできない/,/独自に新規開発.*特許出願することはできない/],0],
    [/国内で有効な他社特許.*異なる会社.*効力が及ばない事情はない/,[/別の会社のソフトウェア特許も実施できる/,/両方の特許の権利者から.*実施許諾を得る/,/それぞれから許諾を得ることはできない/,/独自開発すれば.*許諾は不要/],1],
    [/ハードウェアについて国内特許の実施許諾.*別途自社で新規開発/,[/他社特許にも許諾が自動的に及ぶ/,/出願を行う権利は一律に失われる/,/実施許諾とは別に，発明の要件.*検討できる/,/それ以前に実施した.*許諾が自動的/],2],
  ]},
};
