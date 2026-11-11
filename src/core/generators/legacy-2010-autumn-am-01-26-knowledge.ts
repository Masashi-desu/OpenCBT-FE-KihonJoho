import { choiceBody, define, source } from './legacy-2010-autumn-am-01-26-shared';

const terms = ['けた落ち', 'オーバフロー', '丸め誤差', '情報落ち'];
const termsExplained = [
  '近い二つの値を引くと上位の有効けたが相殺され，残る有効けた数が少なくなる。',
  '表現範囲を超え，計算結果をその数値形式のまま保持できない。',
  '表現できない下位部分を指定された方法で丸めると，丸める前との値の差が生じる。',
  'けたをそろえて大きさが著しく異なる値を加えると，小さい方の下位のけたが表現範囲から外れる。',
];
const rounding = define(2, '説明を選ぶ浮動小数点演算の現象', terms.length,
  '減算時の有効けた，表現範囲超過，丸め，指数をそろえた加算での情報落ちを区別する。', index =>
    choiceBody(source[2].prompt.replace('けた落ち', terms[index]), source[2].choices, source[2].choices[index], termsExplained[index]));

const detectionStems = [
  source[4].prompt,
  '送信側は，文字を表すビット列ごとに，1の個数が偶数になるように検査ビットを付ける。受信側は，文字ごとにその偶奇を調べる。該当する誤り検査方式はどれか。',
  '送信側は，複数の文字をまとめ，各ビット位置について全ての文字のビットを集めて偶奇を求め，検査用の1文字を付ける。受信側で同じ位置ごとの偶奇を調べる方式はどれか。',
  '送信側は，複数の検査ビットを付け，それぞれ異なるビット集合の偶奇を検査できるようにする。受信側は検査結果の組合せから1ビットの誤り位置を特定して訂正できる。該当する方式はどれか。',
];
const detectionNotes = [
  'CRCはビット列を2進係数の多項式とみなし，生成多項式による剰余を使って伝送誤りを検査する。',
  '垂直パリティチェックでは，各文字の中のビットを一組として偶奇を調べる。検査ビットは文字ごとに付ける。',
  '水平パリティチェックでは，文字の並びに沿って同じビット位置の偶奇を調べる。全位置の検査ビットをまとめたものが検査文字になる。',
  'ハミング符号では，異なるビット集合の検査結果を組み合わせると，単一のビット誤りの位置を特定できる。',
];
const detection = define(4, '送信側で付ける検査情報と受信側の判定手順', detectionStems.length,
  '送受信の処理から方式名を選ぶ。剰余，文字ごとの偶奇，位置ごとの偶奇，誤り位置を特定できる組合せを区別する。', index =>
    choiceBody(detectionStems[index], source[4].choices, source[4].choices[index], detectionNotes[index]));

const javaStems = [
  source[8].prompt,
  'Javaとは別の言語で，Webページの要素をDOMを介して操作し，利用者の入力に応じて表示を変えるためにブラウザ内で実行されるものはどれか。',
  'Javaで作成され，ブラウザ内に組み込まず，mainメソッドを入口として起動する独立したプログラムはどれか。',
  '当時のJavaで作成され，ブラウザの対応機能を用いてWebページに埋め込み，そのページの一部として実行されるプログラムはどれか。',
];
const javaNotes = [
  'JavaBeansはJavaのクラスを再利用可能な部品として扱うための仕様で，プロパティなどの扱いに規約がある。',
  'JavaScriptはJavaとは独立した言語で，Webページ上でDOMを操作するスクリプトとして使われる。',
  'JavaアプリケーションはJavaの実行環境で独立して起動できる。通常のコマンド起動ではmainメソッドを入口とする。',
  'Javaアプレットは当時，対応するブラウザ環境でページに埋め込んで実行できたJavaのプログラム形態である。',
];
const java = define(8, 'Java周辺の部品仕様・言語・実行形態', javaStems.length,
  '目的から四つの名称を選ぶ。Javaアプレットは当時の実行環境を条件とする。', index =>
    choiceBody(javaStems[index], source[8].choices, source[8].choices[index], javaNotes[index]));

const processorModes = ['パイプライン制御', 'VLIW方式におけるコンパイル時の命令発行制御',
  'スーパスカラ方式の動的な命令発行', 'マイクロプログラム制御'];
const processorIndices = [2, 0, 1, 3];
const processorNotes = [
  '命令を段階に分け，ある命令を処理している段階と別の命令を処理している段階を時間的に重ねる。',
  'VLIWでは，同時に実行できる演算と担当する演算器をコンパイル時に決め，一つの長い命令にまとめる。',
  'スーパスカラ方式の動的な発行では，実行可能な複数の命令と演算器の空きを見て発行を決める。',
  'マイクロプログラム制御は一つの機械語命令を複数のマイクロ命令に対応付けて実行する。',
];
const processor = define(10, '説明を選ぶ命令実行方式', processorModes.length,
  '段階処理・静的割当て・動的割当て・マイクロ命令を区別。方式が併用され得るため，派生は各方式の特徴を具体的に指定する。', index =>
    choiceBody(source[10].prompt.replace('パイプライン制御', processorModes[index]), source[10].choices,
      source[10].choices[processorIndices[index]], processorNotes[index]));

const interruptionStems = [
  source[11].prompt,
  '電源系統の状態変化による外部割込みに分類されるものはどれか。',
  'CPUが周辺機器に任せた処理の終了を通知する外部割込みに分類されるものはどれか。',
  'この問題の割込み分類で，主記憶のデータの偶奇検査が異常を報告する外部割込みに分類されるものはどれか。',
];
const interruptionKeys = [1, 0, 2, 3];
const interruptionNotes = [
  'ゼロ除算は，CPUが実行中の命令に由来する演算例外なので内部割込みである。',
  '電源の瞬時停電などはCPUが処理する命令から生じる現象ではなく，電源異常の外部通知である。',
  '入出力装置が動作を完了するとCPUへ通知する。これは処理中の命令から生じる例外ではない。',
  'この問題の分類では，主記憶のパリティ検査によるハードウェア異常を外部割込みとして扱う。',
];
const interruption = define(11, '命令起因・電源・入出力・主記憶検査の割込み', interruptionStems.length,
  '割込みを発生させた要因を選ぶ問いを維持する。装置や命令セット固有の例外名を想定しない。', index =>
    choiceBody(interruptionStems[index], source[11].choices, source[11].choices[interruptionKeys[index]], interruptionNotes[index]));

const cacheStems = [
  source[12].prompt,
  '通常のハードウェア管理キャッシュで，読出し要求がキャッシュミスになった場合に関する記述のうち，適切なものはどれか。',
  '主記憶にないページを参照したときの仮想記憶の動作に関する記述のうち，適切なものはどれか。',
  'CPUと主記憶の間にキャッシュメモリを置く主な理由に関する記述のうち，適切なものはどれか。',
];
const cacheNotes = [
  'ライトスルーは書込みの都度主記憶も更新する。ライトバックは更新済みの行を追い出すときなどに主記憶へ反映する。',
  'ハードウェアが下位記憶階層から必要なデータを取得してキャッシュへ入れる。通常のキャッシュミスだけでOSの割込み処理は起こらない。',
  'ページが主記憶にない場合はページフォールトを契機にOSが必要なページを読み込む。キャッシュミスとは扱う記憶階層が異なる。',
  '高速なキャッシュに再利用されるデータがあると，主記憶へのアクセスを省けて平均アクセス時間が短くなる。',
];
const cache = define(12, 'キャッシュの書込み・キャッシュミス・仮想記憶・速度差', cacheStems.length,
  '正しい記述を選ぶ。書込み方式の比較，読出しミスの処理，仮想ページの取得，速度差を埋める役割を区別し，問う処理の範囲を本文で指定。', index => {
    const choices = [...source[12].choices];
    if (index === 1) choices[1] = 'キャッシュメモリにヒットしない場合は，通常，ハードウェアが下位の記憶階層からデータを取得する。';
    if (index === 2) choices[2] = '主記憶にないページを参照するとページフォールトが起こり，OSは必要なページを補助記憶から読み込む。';
    if (index === 3) choices[3] = '再利用されるデータを主記憶より高速なキャッシュに置くことで，平均アクセス時間を短縮する。';
    return choiceBody(cacheStems[index], choices, choices[index], cacheNotes[index]);
  });

const topologyStems = [
  source[13].prompt,
  'PCの二種類のインタフェースへ，計測機器とプリンタを1台ずつ直接つなぐ接続はどれか。',
  'PCのUSBポート一つを使い，複数のUSB周辺機器を一つの集線装置でまとめる接続はどれか。',
  'PCと複数のカメラが同一の有線LANの集線装置につながる接続はどれか。',
];
const topologyNotes = [
  '各機器から次の機器へ順につなぎ，鎖の一端をPCに接続する構成がデイジーチェーンである。',
  '一つの機器をRS-232C，もう一つをUSBに直接接続し，途中にハブを置かない。',
  'USBハブに各周辺機器を接続し，ハブの上流をPCのUSBポートにつなぐ。',
  'ネットワークハブの各ポートへPCやネットワークカメラを接続する。',
];
const topology = define(13, '機器の接続形態と集線装置', topologyStems.length,
  '接続の記述を選ぶ。数珠つなぎ，個別の直結，USBの集線，LANの集線を分ける。規格は名称のみ。', index =>
    choiceBody(topologyStems[index], source[13].choices, source[13].choices[index], topologyNotes[index]));

const backupKinds = ['ホットサイト', '複数の組織が共同利用する代替サイト', 'ウォームサイト', 'コールドサイト'];
const backupIndices = [1, 0, 2, 3];
const backupNotes = [
  'ホットサイトは待機側を稼働させ，データなどを継続的に更新して，災害時の切替えを速くする。',
  '共同利用型では復旧場所を複数の利用者で共用する。復旧時は利用者が保存していた媒体を持ち込む。',
  'ウォームサイトは復旧に必要な機器を準備しておき，障害時に保管したバックアップなどから環境を復元する。',
  'コールドサイトは予備の場所を先に用意し，障害後に機器とバックアップを持ち込んで復旧する。',
];
const backup = define(16, '説明を選ぶバックアップサイトの形態', backupKinds.length,
  '共同利用，常時更新，予備機器と媒体，場所のみの準備を区別する。', index =>
    choiceBody(source[16].prompt.replace('ホットサイト', backupKinds[index]), source[16].choices,
      source[16].choices[backupIndices[index]], backupNotes[index]));

const throughputStems = [
  source[18].prompt,
  'オペレータの手作業でジョブの間に遊休時間が生じるシステムがある。この遊休時間をなくしたときのスループットに関する記述のうち，適切なものはどれか。',
  'CPU性能は同じで，入出力が処理のボトルネックである二つのシステムがある。入出力速度とスループットの関係に関する記述のうち，適切なものはどれか。',
  'あるプログラムが入出力を待つ間に別のプログラムを実行できるようにした。多重プログラミングとスループットの関係に関する記述のうち，適切なものはどれか。',
];
const throughputAlternatives = [
  '',
  '実行内容が同じなら，ジョブの間の遊休時間をなくすと，単位時間当たりに完了できるジョブ数を増やせる。',
  '入出力が処理のボトルネックなら，入出力を速くすると，単位時間当たりに完了できるジョブ数を増やせる。',
  'あるプログラムの入出力待ち時間に別のプログラムを実行すると，CPUの遊休時間を減らしてスループットを上げられる。',
];
const throughput = define(18, 'スループットを左右する遊休・入出力・多重実行の条件', throughputStems.length,
  'スループットの適切な記述を選ぶ。派生では問う改善を限定し，別の改善を説明する候補は問われた手段の効果とみなさない。', index => {
    const choices = [...source[18].choices];
    if (index) {
      choices[index - 1] = throughputAlternatives[index];
      choices[3] = 'スプーリングによって，ジョブとジョブの間の手作業，入出力の速度，多重プログラミングの設定はすべて同時に改善される。';
    }
    const evidence = index ? throughputAlternatives[index] :
      'スプーリングは出力データをディスクに一時保存して，印刷の完了待ちとジョブの進行を分離する。処理の待ちが減り，単位時間当たりの完了件数が増え得る。';
    return choiceBody(throughputStems[index], choices, choices[index ? index - 1 : 3], evidence);
  });

const memoryStems = [
  source[21].prompt,
  '実行中のプロセスをいったん補助記憶へ退避し，後で主記憶に戻して実行を再開できるようにする処理を何というか。',
  '記憶領域の割当てと解放を繰り返すうち，空き領域が小さく分散し，連続した大きな領域を割り当てにくくなる現象を何というか。',
  'プログラムが不要になった動的なメモリ領域を解放しないため，利用できるメモリが徐々に少なくなる現象を何というか。',
];
const memoryNotes = [
  'ページの出し入れが頻発すると実際の処理に時間を使えず，システムの処理能力が急落する。',
  'プロセスの実行に必要な記憶内容を補助記憶へ退避し，後で読み戻す操作である。',
  '全体として空き容量があっても，空きが分散して必要な連続領域が得られない状態である。',
  '不要になった領域が解放されないため，プログラムが利用できるメモリが減っていく。',
];
const memory = define(21, '仮想記憶・記憶領域に関わる現象または処理', memoryStems.length,
  'ページの頻繁な移動，プロセスの退避，空きの分散，解放漏れを区別し，名前を選ぶ。', index =>
    choiceBody(memoryStems[index], source[21].choices, source[21].choices[index], memoryNotes[index]));

const compilerStems = [
  source[22].prompt,
  'コンパイル時に元のソース行や変数の情報を出力ファイルに付加する主な目的はどれか。',
  '機能を保ちながら，ソースコードの重複を減らし，構造を分かりやすく変更する主な目的はどれか。',
  '再ビルド時に変更されていないモジュールの生成済みコードを再利用する主な目的はどれか。',
];
const compilerNotes = [
  'この設問でいう最適化は，同じ計算結果を保って生成コードを改良し，プログラムをより速く実行できるようにする。',
  '元の行や変数に関する対応情報があれば，実行中に停止した位置や値をソース上で調べやすい。',
  '構造を整理して重複を取り除くと，変更箇所や処理の関係を追いやすくなる。',
  '生成済みの目的コードを再利用すると，変更のない部分のコンパイルを省けるため，再生成の所要時間を短くできる。',
];
const compiler = define(22, 'ソフトウェア開発・コンパイルで行う処理', compilerStems.length,
  '処理の主目的を選ぶ。生成コードの実行時間，デバッグ情報，保守性，生成時の処理時間を区別する。', index =>
    choiceBody(compilerStems[index], source[22].choices, source[22].choices[index], compilerNotes[index]));

const analysisStems = [
  source[23].prompt,
  '計測対象のプログラムを実行し，関数別の性能を調べるプロファイラで検出できるものはどれか。',
  '要求仕様とソースコードを照合するレビューによって検出できるもののうち，要求仕様との比較を必要とするものはどれか。',
  '用意したテストを実際に動かし，命令の実行有無を記録するカバレッジ測定で検出できるものはどれか。',
];
const analysisIndices = [1, 0, 2, 3];
const analysisNotes = [
  'ソースを調べるデータフロー解析は，代入後に値が使われない変数を実行せずに発見できる。',
  '関数の実行回数や時間は，実際の動作を計測するプロファイラで調べられる。',
  '仕様に必要な処理が実装されているかは，コードと要求を照合して確かめる。',
  '実際にテストを動かして通過した命令を記録すると，記録されなかった命令が分かる。',
];
const analysis = define(23, 'ソース解析・性能測定・仕様照合・カバレッジの手段', analysisStems.length,
  '何を検出できるかを四択から選ぶ。実行有無と照合相手を各手段の条件として明示する。', index =>
    choiceBody(analysisStems[index], source[23].choices, source[23].choices[analysisIndices[index]], analysisNotes[index]));

const chips = ['フラッシュメモリ', 'マスクROM', '紫外線消去型EPROM', 'DRAM'];
const chipIndices = [3, 0, 1, 2];
const chipNotes = [
  'フラッシュメモリは電気的に消去して書き直せる不揮発性メモリであり，消去・書換えの耐久回数には上限がある。',
  'マスクROMは製造工程で記憶内容を固定する。製造後の書換えはできない。',
  '紫外線消去型EPROMではチップの窓から紫外線を照射してデータを消去し，その後に書き込む。',
  'DRAMではセルの電荷が時間とともに失われるため，定期的なリフレッシュが必要になる。',
];
const chip = define(26, '説明を選ぶ記憶素子', chips.length,
  '書換え・消去・リフレッシュの方式を選ぶ。派生でマスクROMと紫外線消去型EPROMを明示する。', index => {
    const choices = [...source[26].choices];
    if (index) {
      choices[0] = '記憶内容は製造時に固定され，製造後は書き換えられない。';
      choices[1] = 'チップの窓を通して紫外線を照射してデータを消去する。';
      choices[3] = 'データ書換え時には，あらかじめ電気的に前のデータを消去してから書込みを行う。';
    }
    return choiceBody(source[26].prompt.replace('フラッシュメモリ', chips[index]), choices, choices[chipIndices[index]], chipNotes[index]);
  });

export const knowledge2010AutumnAm0126 = [
  rounding, detection, java, processor, interruption, cache, topology, backup, throughput, memory, compiler, analysis, chip,
];
