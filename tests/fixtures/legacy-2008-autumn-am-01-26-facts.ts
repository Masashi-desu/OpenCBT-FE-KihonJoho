// Independent review of the concepts named by the four distractor roles.
export type ReviewedOption = readonly [pattern: RegExp, correct: boolean];
export type ReviewedCase = readonly [condition: RegExp, options: readonly ReviewedOption[]];

const matches = (patterns: readonly RegExp[], correct: number): ReviewedOption[] =>
  patterns.map((pattern, index) => [pattern, index === correct]);

const errors = [/^打切り誤差$/, /^けた落ち$/, /^情報落ち$/, /^絶対誤差$/];
const memory = [/キャッシュなどに用いられる/, /紫外線で全内容の消去/, /周期的にデータの再書込み/, /ブロック単位で電気的に消去/];
const methods = [/^仮想記憶$/, /^キャッシュメモリ方式$/, /^ダイレクトメモリアクセス$/, /^メモリインタリーブ$/];
const optical = [/^CD-R$/, /^CD-RW$/, /^DVD-RAM$/, /^DVD-ROM$/];
const display = [/ガス放電に伴う/, /薄膜トランジスタ.*透過率/, /電圧を加えると発光する有機化合物/, /電子銃.*電子ビーム.*蛍光体/];
const printer = [/1インチ.*ドット数と1分間.*ページ数/, /縦横のドット数と1秒間.*文字数/,
  /行の間隔と1秒間.*行数/, /文字の種類と1秒間.*文字数/];

const external = [/電源異常による/, /入出力が完了/, /メモリパリティエラー/];
function events(internal: RegExp, at: number) {
  const patterns = [...external];
  patterns.splice(at, 0, internal);
  return matches(patterns, at);
}

export const knowledgeFacts: Record<number, readonly ReviewedCase[]> = {
  4: [
    [/絶対値の大きな数と絶対値の小さな数.*有効けた.*反映されない/, matches(errors, 2)],
    [/無限級数.*有限個の項まで.*残りの項/, matches(errors, 0)],
    [/ほぼ等しい二つの値の差.*上位のけたが相殺/, matches(errors, 1)],
    [/近似値と真の値との差の絶対値.*正規化しない/, matches(errors, 3)],
  ],
  16: [
    [/^フラッシュメモリに関する/, matches(memory, 3)],
    [/^SRAMに関する/, matches(memory, 0)],
    [/^紫外線消去型EPROMに関する/, matches(memory, 1)],
    [/^DRAMに関する/, matches(memory, 2)],
  ],
  18: [
    [/^内部割込みに分類/, events(/ゼロで除算を実行/, 1)],
    [/未定義の命令を実行し得る.*内部割込み/, events(/未定義の命令コードを実行/, 2)],
    [/ユーザモードで動作する.*内部割込み/, events(/許可されない特権命令/, 3)],
    [/割込みを要求する専用命令.*内部割込み/, events(/割込み要求命令を実行/, 0)],
  ],
  20: [
    [/主記憶を幾つかのアクセス単位に分割.*並行動作/, matches(methods, 3)],
    [/補助記憶装置を併用.*大きなアドレス空間/, matches(methods, 0)],
    [/最近使ったデータの複製.*高速な小容量メモリ/, matches(methods, 1)],
    [/CPUが個々のデータを読み書きせず.*専用の制御装置/, matches(methods, 2)],
  ],
  22: [
    [/記録層として有機色素.*レーザ光.*ピット/, matches(optical, 0)],
    [/^CDの規格.*相変化.*消去と書換えを繰り返せる/, matches(optical, 1)],
    [/^DVDの規格.*相変化型.*セクタ単位で書換えと検証/, matches(optical, 2)],
    [/^DVDの規格.*製造時に設けたピット.*利用者は書き込めない/, matches(optical, 3)],
  ],
  23: [
    [/^USBハブの説明として/, matches([/ハブ同士はクロスケーブル/, /電源を入れる前に行う必要/,
      /複数のコンピュータ同士を接続/, /ハブを含めて最大127台/], 3)],
    [/セルフパワー方式.*外部機器を接続.*接続・給電/, matches([/クロスケーブル/, /別電源から電力を得て.*下流の機器に供給/,
      /複数のコンピュータ同士を接続/, /電力も使わずに.*給電/], 1)],
    [/^コンピュータ1台のUSBポートに複数の外部機器/, matches([/一つの上流接続を複数の下流接続に分岐/,
      /同じUSBアドレスを共有/, /複数のコンピュータを接続して.*ホスト間/, /1個のUSBアドレスで区別/], 0)],
    [/稼働中のコンピュータにハブと外部機器を追加/, matches([/クロスケーブル/, /必ずコンピュータを停止/,
      /動作中の着脱に対応.*起動後にもUSBハブを接続/, /USBアドレスを消費しない/], 2)],
  ],
  24: [
    [/^シリアル ATA の特徴/, matches([/SAS.*双方向の互換性/, /デイジーチェーン/, /パラレル ATA.*ケーブル.*互換性/,
      /ホットスワップ対応が可能/], 3)],
    [/^SAS（Serial Attached SCSI） の特徴/, matches([/SATAドライブを接続できるSASコントローラ/,
      /SCSIのパラレルバスで接続/, /パラレルATA.*ケーブル.*互換性/, /電源を切っているときにしか/], 0)],
    [/^パラレル ATA の特徴/, matches([/SASと双方向の互換性/, /同じチャネルに2台の装置を接続/,
      /シリアルATA.*ケーブル.*互換性/, /稼働中のホットスワップを前提/], 1)],
    [/^外部接続用の eSATA の特徴/, matches([/SASと双方向の互換性/, /デイジーチェーン/,
      /外部接続用のコネクタ.*コンピュータと外部機器を接続/, /信号ケーブルだけで常に.*電源を供給/], 2)],
  ],
  25: [
    [/^プラズマディスプレイパネルの発光方式/, matches(display, 0)],
    [/^透過型TFT液晶ディスプレイパネルの表示方式/, matches(display, 1)],
    [/^有機ELディスプレイパネルの発光方式/, matches(display, 2)],
    [/^CRTディスプレイの発光方式/, matches(display, 3)],
  ],
  26: [
    [/^レーザプリンタの性能を表す指標/, matches(printer, 0)],
    [/ドットインパクト方式.*1文字のドット構成.*順次印字/, matches(printer, 1)],
    [/1行ずつまとめて印刷するラインプリンタ.*行の密度.*行単位/, matches(printer, 2)],
    [/活字を打ち付けるシリアルプリンタ.*活字が印字できる文字の範囲.*文字単位/, matches(printer, 3)],
  ],
};
