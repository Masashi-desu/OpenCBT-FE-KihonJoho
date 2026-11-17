// Reviewed independently against the IPA original, relevant RFCs, and the
// concrete operating conditions. The truth target is specified by meaning.
export type Fact = readonly [role: string, text: RegExp];
export type KnowledgeRow = {
  readonly anchors: readonly RegExp[];
  readonly targets: readonly string[];
  readonly base: readonly Fact[];
  readonly alternate?: Readonly<Record<number, readonly Fact[]>>;
  readonly distinction: string;
};
const fact = (role: string, text: RegExp): Fact => [role,text];
export const knowledgeReview: Readonly<Record<number, KnowledgeRow>> = {
  28: {
    anchors:[/入出力処理が主体.*タイプ A.*同数/,/CPU 処理が主体.*タイプ A.*重ねられる/,/入出力処理が主体.*タイプ A.*CPU 処理と重ならない/,/CPU 処理が主体.*タイプ A.*CPU 処理と重ならない/],
    targets:['priorityIOA','priorityIOB','sliceCPUB','sliceCPUA'],
    base:[fact('sliceCPUA',/タイムスライス.*A.*長く.*B.*短く/),fact('sliceCPUB',/タイムスライス.*A.*短く.*B.*長く/),
      fact('priorityIOA',/優先度方式.*A.*高く.*B.*低く/),fact('priorityIOB',/優先度方式.*A.*低く.*B.*高く/)],
    distinction:'入出力をCPUに重ねるなら入出力主体を先に開始させる。交互に処理して切替え負担を減らす条件ではCPU主体の割当て時間を長くする。',
  },
  30: {
    anchors:[/^スプーリング/,/^キーボード入力/,/^ジョブスケジューリング/,/^通信先に対する代理サーバ/],
    targets:['spool','buffer','schedule','proxy'],
    base:[fact('buffer',/入力データを主記憶のキュー/),fact('schedule',/ジョブの実行順序/),fact('proxy',/代理の装置/),fact('spool',/低速な装置への出力データ.*磁気ディスク/)],
    distinction:'主記憶で入力を一時保持すること、実行順を決めること、通信を仲介すること、低速出力を外部記憶で待たせることを区別する。',
  },
  31: {
    anchors:[/における RPC/,/登録ユーザの認証/,/ストアドプロシージャの実行/,/ネットワークファイル共有/],
    targets:['rpc','authentication','stored','files'],
    base:[fact('authentication',/登録済か否か/),fact('stored',/データベースに対する一連の処理手順/),
      fact('rpc',/プログラム間.*処理の一部を他のコンピュータ/),fact('files',/磁気ディスクを共有資源として遠隔利用/)],
    distinction:'RPCは遠隔処理を呼ぶ汎用機構。ストアドプロシージャの説明にはDB側処理という限定があり、RPCの一般の定義にはならない。RFC 1831 §3。',
  },
  34: {
    anchors:[/フェールセーフ設計/,/入力間違い/,/主回線の障害時/,/故障した機能を使わず/],
    targets:['safe','input','fallback','degrade'],
    base:[fact('safe',/センサが故障.*ロボットアーム.*停止/),fact('input',/数字以外.*正しい入力/),fact('fallback',/専用回線に障害.*公衆回線/),fact('degrade',/データ入力処理だけ.*障害復旧時/)],
    distinction:'停止による安全確保、誤操作防止、回線切替え、残存機能だけの継続は目的が異なる。',
  },
  35: {
    anchors:[/大量のデータを目的別に整理/,/方針を定め.*責任分担/,/型，長さ，意味などの定義/,/移行元の項目と移行先の項目/],
    targets:['warehouse','admin','dictionary','map'],
    base:[fact('admin',/^データアドミニストレーション$/),fact('warehouse',/^データウェアハウス$/),fact('dictionary',/^データディクショナリ$/),fact('map',/^データマッピング$/)],
    distinction:'分析用に集約した業務データ自体を保存するものと、データ資源を管理する活動、項目の定義を持つもの、項目間の対応を決める作業を区別する。',
  },
  36: {
    anchors:[/コンパイラにおける最適化/,/インタプリタ向けコード/,/クロスコンパイル/,/実行時の追跡出力/],
    targets:['performance','intermediate','cross','trace'],
    base:[fact('intermediate',/インタプリタ用の中間コード/),fact('cross',/異なるアーキテクチャ/),fact('performance',/処理効率を高めたオブジェクトコード/),fact('trace',/ルーチン名.*変数の内容を表示/)],
    distinction:'実行効率を改善するのが最適化。出力形式、実行先の異なる機械、追跡情報の挿入もコンパイラで実現し得る別機能。',
  },
  37: {
    anchors:[/^オブジェクト指向モデル/,/^データフロー計算モデル/,/変数を介して状態を更新/,/関数適用と式の評価/],
    targets:['objects','dataflow','imperative','functional'],
    base:[fact('dataflow',/データの流れ.*データがそろったとき/),fact('imperative',/命令から命令へ順次.*変数/),
      fact('objects',/データは外部から隠ぺい.*メソッド/),fact('functional',/関数の値の計算（評価）/)],
    distinction:'計算を起動する条件としてデータ依存、命令順、オブジェクトの操作及び式の評価を区別する。',
  },
  38: {
    anchors:[/^Web アプリケーションサーバ/,/パケットフィルタ型/,/データベース管理システム/,/DNS リゾルバ/],
    targets:['generated','reject','database','dns'],
    base:[fact('reject',/不正パケットを排除/),fact('database',/データベースを管理/),fact('generated',/HTML 文書を動的に生成/),fact('dns',/ホスト名を IP アドレスに変換/)],
    distinction:'Web要求から表示内容を組み立てる、通信の通過を制御する、DBを管理する、名前を解決する責務を区別する。',
  },
  40: {
    anchors:[/“自動車”のサブクラス/,/“自転車”のサブクラス/,/“プリンタ”のサブクラス/,/“机”のサブクラス/],
    targets:['subtype','subtype','subtype','subtype'],
    base:[fact('component',/^エンジン$/),fact('attribute',/^製造番号$/),fact('component',/^タイヤ$/),fact('subtype',/^トラック$/)],
    alternate:{
      1:[fact('subtype',/^折り畳み自転車$/),fact('attribute',/^車体番号$/),fact('component',/^ブレーキ$/),fact('component',/^ペダル$/)],
      2:[fact('component',/^給紙トレイ$/),fact('subtype',/^レーザープリンタ$/),fact('component',/^電源ユニット$/),fact('attribute',/^最大用紙幅$/)],
      3:[fact('component',/^天板$/),fact('attribute',/^幅$/),fact('subtype',/^学習机$/),fact('component',/^引出し$/)],
    },
    distinction:'is-aを満たす種類だけがサブクラス。部品や性質は親の一種ではない。',
  },
  41: {
    anchors:[/外部設計工程の論理データ設計/,/記憶媒体の選定/,/目標応答時間と記憶容量/,/レコード内の各データ項目/],
    targets:['logical','media','estimate','layout'],
    base:[fact('logical',/項目の洗い出し.*データ構造/),fact('media',/データファイル編成と媒体/),fact('estimate',/アクセス時間.*容量の見積り/),fact('layout',/データレコードのレイアウト/)],
    distinction:'利用する論理項目とその関係、記録する媒体や編成、応答・容量の見積り、項目の物理バイト配置のいずれか。',
  },
  42: {
    anchors:[/モジュール間やサブシステム間のインタフェース/,/実際の業務に近い手順/,/完成したシステム全体/,/独立したモジュールの内部処理/],
    targets:['integration','operations','system','unit'],
    base:[fact('operations',/^運用テスト$/),fact('integration',/^結合テスト$/),fact('system',/^システムテスト$/),fact('unit',/^単体テスト$/)],
    distinction:'境界の接続、現場手順、全体の要件、個々のモジュール仕様の検証は目的と範囲が異なる。',
  },
  47: {
    anchors:[/^オンラインシステムの障害対策/,/拠点全体の災害/,/トランザクションが正常に完了しなかった/,/確定済み更新がすべてログ/],
    targets:['period','safeCopy','undo','redo'],
    base:[fact('unsafeColocation',/オリジナルファイルと同一の場所/),fact('undoByRedo',/開始直前.*ロールフォワード/),
      fact('incompleteUpdates',/一定時間ごと.*障害発生直前の最新データ/),fact('period',/システムの特性に応じた時期/)],
    alternate:{
      1:[fact('safeCopy',/同時には被災しにくい別拠点/),fact('sourceNotNeeded',/フォワードすれば.*復旧元は不要/),fact('unsafeColocation',/同一建物.*すべて|同一建物.*失われない/),fact('periodOnly',/頻繁にバックアップ.*保管先を分ける必要はない/)],
      2:[fact('unsafeColocation',/同じ場所.*取り消される/),fact('undo',/ロールバック.*変更を取り消し/),fact('undoByRedo',/ロールフォワード.*変更の取消し/),fact('periodOnly',/サービス終了時.*取り消せる/)],
      3:[fact('sourceNotNeeded',/バックアップは常に不要/),fact('undoByRedo',/処理を取り消せば.*確定済み更新を再現/),fact('redo',/順番にロールフォワード/),fact('periodOnly',/更新ログを復旧に使う必要はない/)],
    },
    distinction:'媒体の同時喪失に備え、途中の処理は取消し、確定した更新は必要な範囲のログから再適用する。周期バックアップのみで時点を保証できない。',
  },
  48: {
    anchors:[/MTBF を長くできる/,/現地へ移動せず/,/現在の故障発生箇所/,/移動距離を構造的に短く/],
    targets:['prevention','remote','breakdown','decentralize'],
    base:[fact('remote',/^遠隔保守/),fact('breakdown',/^故障発生箇所.*臨時保守/),fact('decentralize',/^保守センタ.*分散配置/),fact('prevention',/^予防保守/)],
    distinction:'故障の前の対策と、故障後に早く対処するための遠隔診断・事後修理・拠点配置を区別する。',
  },
  49: {
    anchors:[/オブジェクトコードを解析/,/新しい環境に適合するシステムへ作り直す/,/一括して構造化された形式/,/小さな改善を積み重ねる/],
    targets:['reverse','reengineer','restructure','refactor'],
    base:[fact('reengineer',/^リエンジニアリング$/),fact('restructure',/^リストラクチャリング$/),fact('reverse',/^リバースエンジニアリング$/),fact('refactor',/^リファクタリング$/)],
    distinction:'仕様の復元、システム全体の改築、構造への一括変換、振舞いを保つ小さい内部修正は目的や更新範囲が異なる。分類は文脈に限定する。',
  },
  51: {
    anchors:[/IP アドレスは分かっているが MAC アドレスが未知/,/IP アドレスが未設定/,/宛先到達不能や TTL/,/パケット中の IP アドレスを変換/],
    targets:['link','address','control','translate'],
    base:[fact('link',/^ARP$/),fact('address',/^DHCP$/),fact('control',/^ICMP$/),fact('translate',/^NAT$/)],
    distinction:'ARPは同一リンクのIPv4からMACへの対応解決。DHCPの設定、ICMPの制御通知、NATのIP変換と区別する。RFC 826。',
  },
};
