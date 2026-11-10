/** Independently reviewed discriminators for every offered choice.
 * A role identifies the substantive description in the option, not its
 * position. The test matches the actual text, then applies the case criterion.
 * Text and answers are not copied from a generated output. */
type Witness = readonly [role: string, description: RegExp];
export type ReviewedCase = {
  prompt: RegExp;
  correct: string;
  explanation: RegExp;
  choices: readonly Witness[];
};

function reviewed(choices: readonly Witness[], cases: readonly (readonly [RegExp, string, RegExp])[]): ReviewedCase[] {
  return cases.map(([prompt, correct, explanation]) => ({ prompt, correct, explanation, choices }));
}

const listCases = reviewed([
  ['fixed-array-capacity', /最大長.*未使用|最大長.*使用されない/],
  ['constant-edit-time', /挿入と削除は一定時間/],
  ['sequential-middle-access', /先頭から順番.*要素数に比例/],
  ['link-storage', /次の要素を指し示す.*領域/],
], [
  [/リストを配列で実現した場合/, 'fixed-array-capacity', /最大長分.*未使用領域/],
  [/単方向の連結リストで実現した場合の，領域の使い方/, 'link-storage', /ポインタの領域/],
  [/単方向の連結リストで，中央の要素を読み出すまでの時間/, 'sequential-middle-access', /リンクを順.*要素数に比例/],
]);

const cacheCases = [
  ...reviewed([
    ['cache-to-disk', /^キャッシュメモリから.*磁気ディスクに書き込む/],
    ['disk-to-cache', /^磁気ディスクから.*キャッシュメモリに読み込む/],
    ['memory-to-cache', /^主記憶から.*キャッシュメモリに読み込む/],
    ['disk-cache-to-memory', /^ディスクキャッシュから.*主記憶に読み込む/],
  ], [[/^プロセッサにデータを読み込む時にキャッシュメモリにヒットしなかった場合/, 'memory-to-cache', /主記憶から.*ブロック.*キャッシュ/]]),
  ...reviewed([
    ['l1-to-l2', /^1次キャッシュから.*2次キャッシュに転送/],
    ['ram-to-l1', /^主記憶から.*1次キャッシュに転送/],
    ['ram-to-l2', /^主記憶から.*2次キャッシュに転送/],
    ['l2-to-l1', /^2次キャッシュから.*1次キャッシュに転送/],
  ], [[/1次キャッシュメモリにヒットしなかったが.*2次キャッシュメモリにヒット/, 'l2-to-l1', /2次キャッシュに存在.*1次キャッシュへ補充/]]),
  ...reviewed([
    ['dirty-evict-write-back', /^置換対象のブロックをキャッシュメモリから主記憶へ書き戻す/],
    ['overwrite-with-old-ram', /^置換対象のブロックを主記憶からキャッシュメモリへ読み込む/],
    ['write-new-from-cache', /^新しいブロックをキャッシュメモリから主記憶へ転送する/],
    ['disk-restore', /^置換対象のブロックをディスクキャッシュから主記憶へ読み込む/],
  ], [[/ライトバック方式.*読取りミス.*置換対象.*更新済み.*主記憶に未反映/, 'dirty-evict-write-back', /主記憶へ旧ラインを書き戻してから/]]),
];

const touchCases = reviewed([
  ['infrared-beam', /赤外線ビームが遮られて.*位置を検出/],
  ['electric-field', /表面に電界.*表面電荷の変化/],
  ['resistance-film', /抵抗膜に電圧.*抵抗値の変化/],
  ['conductive-matrix', /マトリックス状に電極スイッチ.*導通した電極/],
], [
  [/^静電容量方式タッチパネルの説明として/, 'electric-field', /電界.*容量が変化/],
  [/^抵抗膜方式タッチパネルの説明として/, 'resistance-film', /抵抗膜が接触.*分圧/],
  [/^赤外線方式タッチパネルの説明として/, 'infrared-beam', /赤外線のビーム.*遮る位置/],
  [/^マトリックススイッチ方式タッチパネルの説明として/, 'conductive-matrix', /スイッチ.*導通する組合せ/],
]);

const faultCases = [
  ...reviewed([
    ['redundancy', /複数台のコンピュータで多重化/],
    ['prefer-fail-safe', /フェールソフト構造ではなく，フェールセーフ構造/],
    ['single-reliable-device', /二重化するのではなく，重要な処理を稼働率が高い装置/],
    ['exclude-hardware', /ハードウェアではなく，ソフトウェア/],
  ], [[/フォールトトレラントシステムの実現方法/, 'redundancy', /別のコンピュータで処理を継続.*多重化/]]),
  ...reviewed([
    ['full-recovery', /故障後も全機能を通常の性能/],
    ['safe-stop', /異常を検知.*危険にさらさないよう全処理を停止/],
    ['degraded-service', /故障した処理を切り離し.*提供機能を減らしても重要な処理を残す/],
    ['all-suspended', /復旧まで全機能を中断/],
  ], [[/フェールソフトなシステムの実現方法/, 'degraded-service', /機能や性能を低下させつつ必要な処理を継続/]]),
  ...reviewed([
    ['normal-output', /同じ出力を維持.*予備装置へ切り替え/],
    ['safe-stop', /制御の異常.*安全側に倒して機器を停止/],
    ['degraded-service', /主要な機能が続くように.*提供する機能を減らす/],
    ['latch-current-output', /故障ログ.*制御出力は異常発生時の状態で固定/],
  ], [[/停止が安全側の状態になる機器を制御する，フェールセーフ/, 'safe-stop', /機器を停止することが安全側/]]),
];

const performanceCases = reviewed([
  ['instruction-latency', /1命令の実行に要する平均時間/],
  ['availability-ratio', /連続して稼働する時間の割合/],
  ['load-capacity', /想定されるトランザクション量.*耐えられるか/],
  ['benchmark', /測定用のソフトウェアを実行.*処理性能を数値化.*他の製品と比較/],
], [
  [/ベンチマークテストの説明/, 'benchmark', /測定用プログラム.*性能を比較/],
  [/稼働率による可用性評価の説明/, 'availability-ratio', /利用可能だった時間の割合/],
  [/性能検証で用いる負荷テストの説明/, 'load-capacity', /負荷として与え.*基準を満たすか/],
]);

const memoryManagementCases = reviewed([
  ['unreleased-allocation', /確保した主記憶が解放されない.*利用可能な部分が減少/],
  ['excessive-paging', /ページングに費やされ.*スループットの極端な低下/],
  ['overlay', /必要になったモジュールを主記憶に取り込む/],
  ['external-fragmentation', /空き領域の総量は足りている.*不連続で散在/],
], [
  [/^メモリリークの説明/, 'unreleased-allocation', /割当てが解放されず/],
  [/スラッシングの説明/, 'excessive-paging', /ページの入替えに処理時間/],
  [/オーバレイ方式の説明/, 'overlay', /同じ領域.*必要になった部分を主記憶/],
  [/外部断片化の説明/, 'external-fragmentation', /離れた小さな領域.*大きな連続領域を確保できなくなる/],
]);

const schedulingCases = reviewed([
  ['run-b-while-a-ready', /^Aの実行中にB.*Aを実行可能状態にしてBを実行/],
  ['run-b-while-a-waits', /^Aの実行中にB.*Aを待ち状態にしてBを実行/],
  ['run-a-while-b-ready', /^Bの実行中にA.*Bを実行可能状態にしてAを実行/],
  ['run-a-while-b-waits', /^Bの実行中にA.*Bを待ち状態にしてAを実行/],
], [
  [/二つのタスクA，Bをスケジューリングする。Aの方がBより優先度が高い/, 'run-a-while-b-ready', /Aの方が高優先.*Bに資源待ちの条件はない/],
  [/二つのタスクA，Bをスケジューリングする。Bの方がAより優先度が高い/, 'run-b-while-a-ready', /Bの方が高優先.*Aに資源待ちの条件はない/],
  [/入出力完了によって待ち状態のタスクが実行可能になる。Aの方がBより優先度が高い/, 'run-a-while-b-ready', /Aの方が高優先.*Bに資源待ちの条件はない/],
]);

const distributionCases = reviewed([
  ['equally-likely-addresses', /^一様分布$/],
  ['waiting-for-first-hit', /^幾何分布$/],
  ['hits-in-fixed-trials', /^二項分布$/],
  ['independent-arrival-count', /^ポアソン分布$/],
], [
  [/格納アドレスに変換したハッシュ値の分布として，理想的/, 'equally-likely-addresses', /アドレスが等確率となる一様分布/],
  [/ハッシュ値が独立.*等確率.*初めて出るまでに調べるレコード数/, 'waiting-for-first-hit', /初回成功までの試行回数の分布は幾何分布/],
  [/ハッシュ値が独立.*等確率.*固定した件数.*ハッシュ値にもつレコード数/, 'hits-in-fixed-trials', /独立試行を固定回数.*二項分布/],
]);

const programCases = reviewed([
  ['compiled-client-applet', /^アプレット$/],
  ['server-servlet', /^サーブレット$/],
  ['text-interpreted-script', /^スクリプト$/],
  ['execution-thread', /^スレッド$/],
], [
  [/^コンパイル済みのオブジェクトコードがサーバに格納.*クライアントへ転送されて実行/, 'compiled-client-applet', /アプレット.*クライアントに転送.*そこで実行/],
  [/Javaで作成.*サーバのコンテナ.*サーバ側でそのプログラムを実行/, 'server-servlet', /サーブレットはJavaのサーバ側/],
  [/命令をテキストファイルに記述した.*処理系がこのファイルを読み取って命令を実行/, 'text-interpreted-script', /テキストを処理系で実行するプログラムをスクリプト/],
]);

const licensingCases = [
  ...reviewed([
    ['only-interface', /インタフェースを開発し，販売/],
    ['internal-use', /改変を他社に委託し，自社内で使用/],
    ['sell-covered-version', /OSSの入手，改変，販売/],
    ['only-tested-product', /性能テストを行った自社開発ソフトウェアを販売/],
  ], [[/^GPLの下で公開されたOSS.*ソースコードを公開しなかった場合にライセンス違反/, 'sell-covered-version', /実行形式を配布する場合.*配布先への対応ソースの提供/]]),
  ...reviewed([
    ['distribute-unchanged-binary', /変更せずに.*実行形式を取引先へ無償で配布/],
    ['internal-modification-only', /自社で改変.*同じ法人の社内環境だけ/],
    ['sell-independent-program', /テストの道具.*独立に開発した別の製品だけ/],
    ['run-only', /社内で実行するだけ.*複製を他者へ渡さない/],
  ], [[/^GNU GPL v2.*対応するソースコードを渡さず，提供の有効な申出も示さないと/, 'distribute-unchanged-binary', /変更の有無や無償かどうかにかかわらず.*実行形式を配布/]]),
  ...reviewed([
    ['bundle-corresponding-source', /同じ媒体で，完全な対応ソースをGPL v2の条件で渡す/],
    ['internal-modification-only', /同じ法人の社内で改変.*社外には複製を渡さない/],
    ['external-with-no-source', /機器を販売.*対応ソースを渡さず，提供の有効な申出も示さない/],
    ['sell-independent-program', /社内の試験だけ.*独立に開発したアプリケーションだけを販売/],
  ], [[/^GNU GPL v2.*対応するソースコードの提供方法に関してライセンス違反/, 'external-with-no-source', /実行形式の配布.*ソースも提供の申出もない/]]),
];

const semiconductorCases = reviewed([
  ['byte-erasable-eeprom', /1バイト単位でデータの消去及び書込み.*電源遮断時もデータ保持/],
  ['flash', /NAND型又はNOR型.*SSD/],
  ['static-ram', /フリップフロップ.*キャッシュメモリ/],
  ['dynamic-ram', /リフレッシュ動作.*主記憶/],
], [
  [/^DRAMの説明/, 'dynamic-ram', /セルに蓄えた電荷.*リフレッシュ/],
  [/^SRAMの説明/, 'static-ram', /フリップフロップで状態を保つ/],
  [/^フラッシュメモリの説明/, 'flash', /電源を切っても記録を保ち.*NAND型やNOR型/],
]);

export const knowledgeCases: Record<number, ReviewedCase[]> = {
  6: listCases, 10: cacheCases, 12: touchCases, 13: faultCases, 16: performanceCases, 17: memoryManagementCases,
  18: schedulingCases, 19: distributionCases, 20: programCases, 21: licensingCases, 23: semiconductorCases,
};
