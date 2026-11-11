// 問題紙面と各方式の定義から固定した判定表。生成器の選択肢順や正答位置を参照しない。
export type Fact = { target: RegExp; description: RegExp };
export const autumn2009AmFacts: Record<number, readonly Fact[]> = {
  4: [
    { target: /シーケンス制御/, description: /順序又は条件.*各段階を逐次/ },
    { target: /フィードフォワード制御/, description: /あらかじめ外乱.*修正動作/ },
    { target: /フィードバック制御/, description: /制御量を常に検出.*制御に反映/ },
    { target: /ファジィ制御/, description: /やや多い.*やや少ない.*あいまい性/ },
  ],
  6: [
    { target: /挿入ソート/, description: /整列済み.*正しい位置.*追加/ },
    { target: /選択ソート/, description: /最小値.*除いた部分.*最小値/ },
    { target: /クイックソート/, description: /基準値.*小さな値.*大きな値.*分割/ },
    { target: /バブルソート/, description: /隣り合った.*比較と入替え/ },
  ],
  7: [
    { target: /データフロー方式/, description: /データの流れ.*すべてのデータがそろった/ },
    { target: /逐次実行型/, description: /命令から命令へ順次.*変数.*定義は分離/ },
    { target: /オブジェクト指向/, description: /隠ぺい.*メソッド.*ひとまとまり/ },
    { target: /関数型/, description: /入れ子構造.*関数の値の計算（評価）/ },
  ],
  8: [
    { target: /HTTPトンネリング/, description: /HTTPプロトコル.*ファイアウォール.*通過/ },
    { target: /CSSによるスタイル指定/, description: /スタイルシート.*デザインを統一/ },
    { target: /HTTPの要求・応答/, description: /ブラウザからの要求.*Webサーバが応答.*テキスト・画像・音声・動画/ },
    { target: /Ajax/, description: /非同期.*動的に画面を再描画/ },
  ],
  9: [
    { target: /一般的なPCの主記憶用/, description: /^DRAM$/ },
    { target: /リフレッシュなしで保持.*CPUキャッシュ/, description: /^SRAM$/ },
    { target: /ディジタルカメラ.*音楽データ/, description: /^フラッシュメモリ$/ },
    { target: /製造時に固定.*書換え不要/, description: /^マスクROM$/ },
  ],
  10: [
    { target: /ライトスルー方式/, description: /両方に同時にデータを書き込む/ },
    { target: /メモリインタリーブ/, description: /複数のバンク.*並列にアクセス/ },
    { target: /キャッシュメモリを配置する方式/, description: /高速かつ小容量のメモリを配置/ },
    { target: /命令キャッシュとデータキャッシュを分ける方式/, description: /命令用とデータ用の二つに分離/ },
  ],
  11: [
    { target: /パラレルATA/, description: /内蔵.*CD-ROM.*DVD.*パラレル/ },
    { target: /パラレルSCSI/, description: /デイジーチェーン.*パラレル/ },
    { target: /USB/, description: /ハブ.*ツリー状.*シリアル/ },
    { target: /IrDA/, description: /赤外線.*シリアル/ },
  ],
  15: [
    { target: /ホットスタンバイ/, description: /ダウンを検出.*直ちに引き継ぐ/ },
    { target: /大規模バッチ/, description: /処理量の大きいジョブ.*代わって.*実行/ },
    { target: /負荷超過/, description: /オーバロード.*オーバロードした分の処理/ },
    { target: /両方に処理を複製/, description: /同時に同じ処理.*処理を完了/ },
  ],
  18: [
    { target: /該当なし/, description: /効率が良く.*遅く一定/ },
    { target: /場合の可変長方式/, description: /効率が良く.*遅く不定/ },
    { target: /場合の固定長方式/, description: /効率が悪く.*速く一定/ },
    { target: /該当なし/, description: /効率が悪く.*速く不定/ },
  ],
  20: [
    { target: /上流CASE/, description: /DFDの作成支援/ },
    { target: /テスト設計・実施/, description: /テストデータの作成支援/ },
    { target: /下流CASE/, description: /プログラムの自動生成/ },
    { target: /共通部品を保守/, description: /ライブラリの管理支援/ },
  ],
  22: [
    { target: /^DRAM/, description: /コンデンサ.*電荷.*主記憶/ },
    { target: /^マスクROM/, description: /製造時.*データが書き込まれる/ },
    { target: /^紫外線消去型EPROM/, description: /紫外線照射で消去/ },
    { target: /^SRAM/, description: /フリップフロップ.*キャッシュ/ },
  ],
  23: [
    { target: /マザーボード/, description: /電子回路基板/ },
    { target: /チップセット/, description: /データの受渡しを管理.*回路群/ },
    { target: /System on a Chip/, description: /すべての機能.*同一プロセスで集積/ },
    { target: /System in Package/, description: /個別に最適化.*パッケージ.*それぞれのチップ/ },
  ],
  26: [
    { target: /直前に誤って行った編集を取り消/, description: /Undo機能/ },
    { target: /操作方法を利用中に調べ/, description: /オンラインヘルプ/ },
    { target: /頻繁に行う操作を効率よく/, description: /ショートカットキー/ },
    { target: /時間が掛かる処理がどこまで進んだか/, description: /プログレスバー/ },
  ],
};
