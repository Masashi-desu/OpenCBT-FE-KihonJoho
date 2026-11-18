// 査読済みの選択肢の識別条件。答えが示す特性は生成器の正答位置から取り込まない。
type Fact = { prompt: RegExp; options: readonly RegExp[]; trueOption: RegExp };

const numericErrors = [/ほぼ等しい.+減算.+有効けた/,/最大値を超える/,/四捨五入，切上げ又は切捨て/,/加算.+下位のけたが欠落/];
const addressing = [/^間接アドレス$/,/^指標付きアドレス$/,/^即値オペランド$/,/^直接アドレス$/];
const displays = [/電極.+発光する特殊な有機化合物/,/電子銃.+電子ビームが蛍光体に当たり発光/,/光の透過を画素ごとに制御.+カラーフィルタ/,/放電によって発生する紫外線と蛍光体/];
export const memoryHierarchy = new Map([
  ['CPUのレジスタ',0],
  ['CPUの1次キャッシュメモリ',1],
  ['CPUの2次キャッシュメモリ',2],
  ['主記憶',3],
  ['磁気ディスク',4],
  ['光ディスク',5],
  ['磁気テープ',6],
]);

export const knowledgeFacts: Record<number, readonly Fact[]> = {
  5: [
    {prompt:/けた落ち/,options:numericErrors,trueOption:/ほぼ等しい.+減算.+有効けた/},
    {prompt:/オーバフロー/,options:numericErrors,trueOption:/最大値を超える/},
    {prompt:/丸め誤差/,options:numericErrors,trueOption:/四捨五入，切上げ又は切捨て/},
    {prompt:/情報落ち/,options:numericErrors,trueOption:/加算.+下位のけたが欠落/},
  ],
  16: [
    {prompt:/フリップフロップ/,options:[/^DRAM$/,/^RDRAM$/,/^SDRAM$/,/^SRAM$/],trueOption:/^SRAM$/},
    {prompt:/コンデンサ.+リフレッシュ/,options:[/^SRAM$/,/^DRAM$/,/^マスクROM$/,/^EEPROM$/],trueOption:/^DRAM$/},
    {prompt:/外部のバスクロック.+コンデンサ/,options:[/^非同期DRAM$/,/^非同期SRAM$/,/^SDRAM$/,/^EEPROM$/],trueOption:/^SDRAM$/},
    {prompt:/製造工程で内容を決め.+出荷後/,options:[/^マスクROM$/,/^SRAM$/,/^DRAM$/,/^EEPROM$/],trueOption:/^マスクROM$/},
  ],
  17: [
    {prompt:/命令読出し後のメモリ参照を行わず/,options:addressing,trueOption:/^即値オペランド$/},
    {prompt:/主記憶位置の内容を更に番地として/,options:addressing,trueOption:/^間接アドレス$/},
    {prompt:/インデックスレジスタの値を加え/,options:addressing,trueOption:/^指標付きアドレス$/},
    {prompt:/記された番地そのものを使って/,options:addressing,trueOption:/^直接アドレス$/},
  ],
  24: [
    {prompt:/記憶媒体のフォーマット処理/,options:[/物理フォーマットの処理に先立って.+論理/,/物理フォーマットでは.+パーティションを作成/,/論理フォーマットでは.+ファイルシステムの管理領域/,/論理フォーマットでは.+不良セクタの検査を同時.+予備領域/],trueOption:/論理フォーマットでは.+ファイルシステムの管理領域/},
    {prompt:/パーティションを作成する処理/,options:[/ファイルシステムの全管理情報だけ/,/アドレス範囲.+パーティション情報/,/磁化状態を機械的に修復/,/全セクタを検査.+代替セクタ/],trueOption:/アドレス範囲.+パーティション情報/},
    {prompt:/製造時.+物理フォーマット/,options:[/ディレクトリの管理情報だけ/,/論理区画の開始位置と長さだけ/,/媒体を記録用に初期化.+物理セクタ/,/消去したファイルの場所だけ/],trueOption:/媒体を記録用に初期化.+物理セクタ/},
    {prompt:/クイックフォーマット/,options:[/ファイルシステムの管理情報.+不良セクタ検査は省略/,/全セクタを読み書きして検査.+物理フォーマット/,/ファイルシステムを作らず.+物理的なトラック/,/予備セクタを全てファイルシステム/],trueOption:/ファイルシステムの管理情報.+不良セクタ検査は省略/},
  ],
  26: [
    {prompt:/液晶ディスプレイ/,options:displays,trueOption:/光の透過を画素ごとに制御/},
    {prompt:/有機ELディスプレイ/,options:displays,trueOption:/特殊な有機化合物を挟んだ/},
    {prompt:/CRTディスプレイ/,options:displays,trueOption:/電子銃から発射/},
    {prompt:/プラズマディスプレイ/,options:displays,trueOption:/発生する紫外線と蛍光体/},
  ],
};
