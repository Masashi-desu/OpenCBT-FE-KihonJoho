// Independent review of the concepts named by each option.
export type ReviewedOption = readonly [pattern: RegExp, correct: boolean];
export type ReviewedCase = readonly [condition: RegExp, options: readonly ReviewedOption[]];
const matches = (patterns: readonly RegExp[], correct: number): ReviewedOption[] =>
  patterns.map((pattern, index) => [pattern, index === correct]);

const memories = [/コンデンサに電荷/, /製造時にデータが書き込まれる/, /紫外線照射で消去/, /フリップフロップで構成/];
const parallelism = [/ベクトルレジスタ長の組に分割/, /パイプラインを更に細分化/, /複数のパイプライン.*複数の命令/, /命令語を長く.*複数の機能ユニット/];
const stages = [/^実効アドレス計算$/, /^入出力装置起動$/, /^分岐アドレス計算$/, /^割込み発生$/];
const cachePurposes = [/アドレス変換を高速/, /ページング処理を高速/, /アクセス速度とプロセッサの処理速度の差/, /プログラムを常駐/];
const diskModel = [/アクセス時間は.*回転速度.*短くなる/, /アクセス時間は.*前処理時間.*後処理時間も含む/,
  /記憶容量は.*トラック当たり.*トラック数だけ/, /データ転送速度は.*回転速度と回転待ち時間/];
const interfaces = [/^IEEE 1394$/, /^IrDA$/, /^PIAFS$/, /^RS-232C$/];
const usbModes = [/^アイソクロナス転送$/, /^インタラプト転送$/, /^コントロール転送$/, /^バルク転送$/];
const devices = [/^OCR$/, /^OMR$/, /^イメージスキャナ$/, /^タブレット$/];

export const knowledgeFacts: Record<number, readonly ReviewedCase[]> = {
  16: [
    [/^DRAMの説明/, matches(memories, 0)], [/^マスクROMの説明/, matches(memories, 1)],
    [/^紫外線消去型EPROMの説明/, matches(memories, 2)], [/^SRAMの説明/, matches(memories, 3)],
  ],
  17: [
    [/^スーパスカラの説明/, matches(parallelism, 2)], [/^ストリップマイニングの説明/, matches(parallelism, 0)],
    [/^スーパパイプラインの説明/, matches(parallelism, 1)], [/^VLIWの説明/, matches(parallelism, 3)],
  ],
  18: [
    [/主記憶へのアクセス.*命令解読とオペランド読出し/, matches(stages, 0)],
    [/対象装置と操作を解読.*装置がデータ転送を始めるまで/, matches(stages, 1)],
    [/相対アドレスで指定.*命令解読と分岐先の命令読出し/, matches(stages, 2)],
    [/装置の動作完了とCPUによる割込み処理ルーチンの実行/, matches(stages, 3)],
  ],
  20: [
    [/^処理装置で用いられるキャッシュメモリの使用目的/, matches(cachePurposes, 2)],
    [/TLBにページ表の一部を保持する/, matches(cachePurposes, 0)],
    [/補助記憶から主記憶へまとめて先読み/, matches(cachePurposes, 1)],
    [/使用頻度の高い処理.*プログラムの使用領域を明示的に確保/, matches(cachePurposes, 3)],
  ],
  21: [
    [/^磁気ディスク装置の性能に関する記述/, matches(diskModel, 0)],
    [/装置のアクセス時間とホスト側の処理時間を分けて測定/,
      matches([/アクセス時間は.*長くなる/, /ホスト側の前処理と後処理も含めた所要時間は.*それらの時間を加え/,
        diskModel[2], diskModel[3]], 1)],
    [/各トラックの記憶容量が同じ磁気ディスク装置を比較/,
      matches([/アクセス時間は.*長くなる/, diskModel[1], /記憶容量は.*トラック数，シリンダ数を掛け/, diskModel[3]], 2)],
    [/トラックを移動せず，1トラック全体を連続して読み出す/,
      matches([/アクセス時間は.*長くなる/, diskModel[1], diskModel[2], /データ転送速度は.*記憶容量を1回転の時間で割っ/], 3)],
  ],
  22: [
    [/磁気ディスクのバックアップを取るため.*ストリーマ（テープドライブ）/,
      matches([/記録データの部分書換え機能/, /書込み時の記録密度を変更/, /複数の書込みヘッド/,
        /読み書きを連続して行い.*ブロックごとにスタート/], 3)],
    [/任意のブロックを指定して書き換えられる別の磁気ディスク装置/,
      matches([/必要な部分だけを書き換え/, /記録密度を毎回切り替える/, /常に複数の書込みヘッド/, /先頭から順に走査/], 0)],
    [/一定の記録密度.*読出し速度が変動する/,
      matches([/テープ上の任意のアドレス/, /速度変動をバッファで吸収/, /同じデータを同時に書き込めば/,
        /必ずブロックごとにテープを停止/], 1)],
    [/走行速度と各トラックの記録密度は同じ.*別々のトラックへ同時/,
      matches([/ランダムアクセスで上書き/, /読出し元の速度に合わせて各トラックの記録密度を変える/,
        /複数トラックへ並列に書き込む.*合計の書込み速度を上げ/, /ブロックごとにテープを停止させる必要/], 2)],
  ],
  23: [
    [/携帯電話同士.*赤外線/, matches(interfaces, 1)], [/ディジタルビデオカメラとPC.*高速シリアルバス/, matches(interfaces, 0)],
    [/PHSの無線区間.*ディジタルデータ/, matches(interfaces, 2)], [/コンピュータとモデム.*非同期シリアル通信/, matches(interfaces, 3)],
  ],
  24: [
    [/主としてマウスやジョイスティック/, matches(usbModes, 1)], [/USBオーディオ.*一定周期でのデータ供給/, matches(usbModes, 0)],
    [/接続時の記述子取得と機器の設定/, matches(usbModes, 2)], [/外部ストレージ.*周期や時間の保証を必要としない/, matches(usbModes, 3)],
  ],
  26: [
    [/ポインティングデバイス.*CADシステム/, matches(devices, 3)], [/印刷文書の文字を認識して文字コード/, matches(devices, 0)],
    [/答案用紙の所定の欄が鉛筆で塗られている/, matches(devices, 1)], [/写真の色と濃淡を画素の列.*ラスター画像/, matches(devices, 2)],
  ],
};
