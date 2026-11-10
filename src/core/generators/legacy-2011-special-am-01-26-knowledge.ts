import { p } from './definition';
import { choiceBody, define, source } from './legacy-2011-special-am-01-26-shared';

const sortNames = ['クイックソート', '選択ソート', '挿入ソート', 'バブルソート'];
const sortEvidence = [
  '基準値を選んで値を分割し，分割した部分に対して同じ処理を繰り返す。',
  '未整列の要素から最小値を選び，その値を順番に確定する。',
  '次の要素を，整列済みの部分の適切な位置に差し込む。',
  '隣接する二つの要素が逆順なら交換する。並び全体を繰り返し走査すると，端から順に要素の位置が確定する。',
];
const sorting = define(8, '説明を選ぶ整列アルゴリズム', sortNames.length,
  '整列の説明を選ぶ形式を維持し，分割・選択・挿入・隣接交換を区別する。', index =>
    choiceBody(source[8].prompt.replace(sortNames[0], sortNames[index]), source[8].choices, source[8].choices[index],
      sortNames[index] + 'では，' + sortEvidence[index]));

const interruptionPrompts = [
  source[9].prompt, '主記憶に必要なページがないことによってページフォールトが発生するものはどれか。',
  '実行中のプログラムがOSのサービスを呼び出すための割込みが発生するものはどれか。',
  '除算エラーを示す内部割込みが発生するものはどれか。',
];
const interruptionChoice = [3, 0, 1, 2];
const interruptionEvidence = [
  '入出力装置の動作終了は，実行中の命令の演算結果と独立した外部事象なので，外部割込みになる。',
  '参照したページが主記憶に存在しなければ，実行中の命令によるメモリアクセスをきっかけにページフォールトが起きる。',
  'システムコール命令の実行は，OSが提供する処理をプログラムから明示的に要求する。',
  'ゼロで除算すると，実行中の命令そのものの実行結果として除算エラーが起きる。',
];
const interruption = define(9, '問われる割込み・例外の種類', interruptionPrompts.length,
  '発生事象を選ぶ方向を維持し，ページフォールト・システムコール・除算エラー・外部I/O完了を分ける。', index =>
    choiceBody(interruptionPrompts[index], source[9].choices, source[9].choices[interruptionChoice[index]], interruptionEvidence[index]));

const accessNames = ['メモリインタリーブ', 'ディスクバッファ', 'キャッシュメモリを使った主記憶アクセス', '処理区間を重ねない直列の主記憶アクセス'];
const accessChoice = [3, 0, 1, 2];
const accessEvidence = [
  '独立した主記憶のグループ（バンク）へ交互にアクセスして処理を重ねる。',
  'CPUと磁気ディスクの間で一時記憶を使い，読み書きの要求とディスク動作を調整する。',
  '主記憶の一部のコピーを高速なキャッシュへ置き，ヒット時に主記憶の読み出しを省く。',
  '各要求のアクセス・読み書き・後処理をすべて終えてから次の要求を始める。',
];
const access = define(12, '説明を選ぶ記憶装置へのアクセス方式', accessNames.length,
  '各方式の対象と仕組みを四つの説明から選ぶ。派生の直列方式は高速化を目的とするとの原問の誤った記述を外し，処理区間の重なりの有無で判定する。', index => {
    const choices = [...source[12].choices];
    if (index) choices[2] = 'アクセス要求，データの読み書き及び後処理をすべて終えてから，次の主記憶アクセスの処理に移る。';
    return choiceBody(accessNames[index] + 'の説明はどれか。', choices, choices[accessChoice[index]], accessEvidence[index]);
  });

const mediaNames = ['RFIDタグ', '磁気ストライプカード', '赤外線による識別タグ', '印刷したバーコードラベル'];
const mediaChoice = [2, 0, 1, 3];
const mediaEvidence = [
  'RFIDタグは電波で読取器と通信する。タグを接触させずに識別情報を読み取れる。',
  '磁気ストライプ上の磁化で記録した情報を，接触式の磁気ヘッドで読み取る。',
  '赤外線による識別タグの読取りでは，光学的な赤外線送受信を用いる。',
  'バーコードラベルのパターンは，反射光の違いを検出するなどして光学的に読み取る。',
];
const media = define(13, '対象とする識別媒体・タグ', mediaNames.length,
  '識別情報の読取方式を四つの説明から選ぶ。派生ではRFIDの電磁波を電波に特定し，赤外線や可視光との重なりを避ける。', index => {
    const choices = [...source[13].choices];
    if (index) choices[2] = '電波を用いて情報を非接触で読み取る。';
    return choiceBody(mediaNames[index] + 'の特徴として，適切なものはどれか。', choices, choices[mediaChoice[index]], mediaEvidence[index]);
  });

const pcmConditions = [[44.1, 0, 0], [48, 1, 1], [32, 2, 1], [96, 1, 2]] as const;
const pcm = define(14, 'PCMのサンプリング周波数・時間・チャンネル数', pcmConditions.length,
  '非圧縮PCMでサンプリング条件を固定してデータ量を決める要素を選ぶ。最高周波数・最大振幅・再生周波数は固定条件下でビット数の乗数にならないため，正答の概念を固定する。', index => {
    const [khz, seconds, channels] = pcmConditions[index];
    const stem = index === 0 ? source[14].prompt :
      'アナログ音声信号を，サンプリング周波数' + khz + ' kHz，' + channels + 'チャンネルの非圧縮PCM方式で' +
      seconds + '秒間ディジタル録音するとき，録音される音声データ量は何によって決まるか。ここで，ヘッダは含めない。';
    const sampleCount = index === 0 ? '1チャンネルにつき1秒に44,100回を標本化する。' :
      '標本の総数は' + khz + '×1,000×' + seconds + '×' + channels + '＝' +
      (khz * 1000 * seconds * channels).toLocaleString('en-US') + 'である。';
    return choiceBody(stem, source[14].choices, source[14].choices[3], sampleCount +
      '非圧縮PCMの音声データ量は，その標本数に1標本当たりの量子化ビット数を掛けた値になる。');
  }, true);

const multiprocessorNames = ['密結合マルチプロセッサシステム', '待機系へ切り替えるデュプレックス構成',
  'ディスクを共用する疎結合マルチプロセッサシステム', '結果を照合するデュアル構成'];
const multiprocessorChoice = [2, 0, 1, 3];
const multiprocessorEvidence = [
  '複数のプロセッサが主記憶を共用し，一つのOSでタスクを配分する。',
  '通常は本稼働系だけが処理し，故障時に待機系へ切り替える。正常時に二つの系で処理結果を照合する必要はない。',
  '各プロセッサを独立したOSで管理し，ディスクは共用する。ジョブ単位で分担できる。',
  '二つのプロセッサで同じ処理を同時に行い，結果を照合する。結果の不一致を検出し，故障系を特定して切り離せば処理を続けられる。',
];
const multiprocessor = define(15, '説明を選ぶシステム構成', multiprocessorNames.length,
  '四つの構成を，待機の有無・OS・共用する記憶・結果照合の違いで判別する。', index =>
    choiceBody(source[15].prompt.replace(multiprocessorNames[0], multiprocessorNames[index]), source[15].choices,
      source[15].choices[multiprocessorChoice[index]], multiprocessorEvidence[index]));

const reliabilityNames = ['フールプルーフ', '故障部の機能を制限して主要機能を残すフェールソフト',
  '故障の発生を予防する定期保守', '装置の二重化によるフォールトトレランス'];
const reliabilityEvidence = [
  '不注意による誤操作を防止する。確定前に操作の確認を求めるのはその一例である。',
  '故障した機能を停止又は縮退させ，健全な部分で主要な機能を続ける。',
  '定期点検と交換で障害発生の確率を下げる。障害が起きた後の切替えとは対象の段階が異なる。',
  '一方が故障しても残る装置で処理を続ける。装置を二重化して同じ機能を維持できるようにする。',
];
const reliability = define(17, '選択対象となる信頼性設計', reliabilityNames.length,
  '操作誤りの防止・機能縮退・発生予防・冗長系継続を区別する。派生では機能縮退を明示する。', index => {
    const choices = [...source[17].choices];
    if (index) choices[1] = 'システムの一部が故障したとき，故障した機能を制限し，正常な部分で主要機能を継続する設計';
    return choiceBody(source[17].prompt.replace('フールプルーフ', reliabilityNames[index]), choices, choices[index], reliabilityEvidence[index]);
  });

const memoryNames = ['ページング方式', 'プログラムの再配置', 'メモリのバンク分割', 'レコードのブロック化'];
const memoryEvidence = [
  '固定長の仮想ページと実メモリ側のページ枠を対応付ける。仮想アドレスのページ番号を対応するページ枠へ変換する。',
  'プログラムが置かれる位置の違いに合わせてアドレスを調整する。配置先が変わっても参照先を正しく指せるようにする。',
  '主記憶を独立に読み書きできる複数のバンクへ分ける。別のバンクに対する操作は並行して行える。',
  '個別のレコードを複数まとめて一つの入出力単位とする。複数レコードを一度の入出力で読み書きできる。',
];
const management = define(20, '説明を選ぶ記憶管理・入出力方式', memoryNames.length,
  '記憶管理・主記憶構成・レコード入出力に関する四つの方式を説明で判別する。', index =>
    choiceBody(source[20].prompt.replace(memoryNames[0], memoryNames[index]), source[20].choices,
      source[20].choices[index], memoryEvidence[index]));

const replacementNames = ['LRUアルゴリズム', 'FIFOアルゴリズム', '直近の一定期間のアクセス頻度が最も小さいページを除く方式',
  '読込み以降の全期間で参照回数が最も少ないページを除くLFU方式'];
const replacementPrompts = [
  source[21].prompt, 'FIFOアルゴリズムで，ページ置換えの判断基準に用いられる項目はどれか。',
  '最近の利用状況だけでページ置換えを判断するため，直近の一定時間に参照が最も少なかったページを除く。この方式で，判断基準に用いられる項目はどれか。',
  'LFU方式で，各ページが主記憶に読み込まれて以降の全期間を対象に，利用が最も少なかったページを除く。判断基準に用いられる項目はどれか。',
];
const replacementEvidence = [
  'LRUは最後の参照が最も古いページを選ぶ。判断に使うのは各ページの直近の参照時刻である。',
  'FIFOは主記憶へ最初に読み込まれたページを先に除く。最近いつ使われたかは判断に使わない。',
  '時間窓より前の参照は捨て，ページごとに窓内の参照頻度を求めて比較する。',
  '読み込まれて以降の参照をページ別に数え続け，累積の参照回数が最少のページを選ぶ。',
];
const replacement = define(21, 'ページを置き換える際の判断方式', replacementNames.length,
  '判断項目を選ぶ形式を維持する。時間窓方式と累積LFUの集計期間，FIFOの読み込み時刻を派生で明示する。', index => {
    const choices = [...source[21].choices];
    if (index) choices[1] = 'ページを主記憶に読み込んだ時刻';
    return choiceBody(replacementPrompts[index], choices, choices[index], replacementEvidence[index]);
  });

const realtimeCases = [
  { prompt: source[22].prompt, task: '応答時間に制約がある組込み処理' },
  { prompt: '組込みのモータ制御装置では，過電流の検出割込みから2ミリ秒以内に駆動を遮断する必要がある。この装置でリアルタイムOSが用いられる理由として，適切なものはどれか。', task: '過電流割込みからの駆動遮断' },
  { prompt: '組込みの制御装置では，1ミリ秒周期でセンサ値を取り込み，次の周期までに制御信号を更新する必要がある。この装置でリアルタイムOSが用いられる理由として，適切なものはどれか。', task: '周期ごとの制御信号更新' },
  { prompt: '組込みの音声処理装置では，再生に間に合うように各音声フレームを決められた時刻までに処理する必要がある。この装置でリアルタイムOSが用いられる理由として，適切なものはどれか。', task: '音声フレームの処理期限' },
];
const realtime = define(22, '組込み機器の処理期限とイベント', realtimeCases.length,
  'RTOSを選ぶ理由を四つの説明から選ぶ。応答期限を守る機構が対象なので，別の機能を正答にする変形を避け，割込み・周期・再生時刻の異なる具体例を使う。', index => {
    const { prompt, task } = realtimeCases[index];
    return choiceBody([p(prompt)], source[22].choices, source[22].choices[1],
      task + 'には，定められた時間内に対象のタスクや割込み処理を実行する仕組みが必要である。' +
      'リアルタイムOSはそのための優先度付きスケジューリングなどを提供する。');
  }, true);

const contactCases = [
  source[26].prompt,
  '組込み装置で，ボタンの接点の状態を一定の時間間隔で観測し，時刻ごとのON，OFFの値を取り出す処理はどれか。',
  '組込み装置で，複数の処理が一つの読取回路を交互に利用し，同じ回路を共用する方式はどれか。',
  '組込み装置で，スイッチの入力イベントを一時記憶にためてから，処理側が順に取り出せるようにする処理はどれか。',
];
const contactChoice = [2, 0, 1, 3];
const contactEvidence = [
  '機械式接点が押下直後に細かく跳ね，短時間で接触と離脱を繰り返すことをチャタリングという。',
  '一定間隔でその時点の信号値を取り出す操作はサンプリングである。',
  '一つの回路資源を複数の処理で共用することはシェアリングである。',
  '処理側が受け取るまでデータを一時領域へ蓄える処理はバッファリングである。',
];
const contact = define(26, 'スイッチ入力を扱う際の現象・処理', contactCases.length,
  'ハードウェア入出力で起きる現象や行う処理に対応する用語を四択から選ぶ。接点の跳ね・時点の観測・資源共有・一時記憶を区別する。', index =>
    choiceBody(contactCases[index], source[26].choices, source[26].choices[contactChoice[index]], contactEvidence[index]));

export const knowledge2011SpecialAm0126 = [sorting, interruption, access, media, pcm, multiprocessor,
  reliability, management, replacement, realtime, contact];
