import { p, strings, table } from './definition';
import { autumn2013AmDiagram } from './legacy-2013-autumn-am-01-26-figures';
import { define, knowledge, marks, source, textBody } from './legacy-2013-autumn-am-01-26-shared';

const distribution = knowledge(19, 'ハッシュの出力・初回到達までの回数・到達したレコード件数',
  'レコードのハッシュ値に関する分布を選ぶ方向を維持。値、初回到達までの回数、固定件数での到達数を区別する。',
  'アドレスが等確率となる一様分布なら，特定のアドレスに負荷が偏らない。幾何分布は初回成功までの回数，二項分布は独立した一定回数の試行での成功回数を扱う。', [
    { prompt: '直接編成ファイルで，各レコードのキー値から求めるハッシュ値が独立で，全ての格納アドレスが等確率である。レコードを1件ずつ調べ，指定した一つのアドレスが初めて出るまでに調べるレコード数はどの分布に従うか。',
      correctIndex: 1, explanation: '各レコードで指定アドレスが出る確率は一定である。初めて出るまで独立試行を繰り返すと，失敗が0回，1回，…と続いた後の初回成功までの試行回数の分布は幾何分布となる。' },
    { prompt: '直接編成ファイルで，各レコードのキー値から求めるハッシュ値が独立で，全ての格納アドレスが等確率である。固定した件数のレコードのうち，指定した一つのアドレスをハッシュ値にもつレコード数はどの分布に従うか。',
      correctIndex: 2, explanation: '指定アドレスを得ることを成功とすれば，一定の成功確率をもつ独立試行を固定回数行って成功数を数えるので二項分布になる。' },
  ]);

const execution = knowledge(20, 'プログラムの形式と実行される場所',
  'プログラムの転送・実行の状況から名称を選ぶ。クライアント側のアプレット、サーバ側のサーブレット、インタプリタで実行するスクリプトを区別する。',
  '設問が扱うアプレットは，Java実行環境を備えたクライアントに転送され，そこで実行される。サーブレットはサーバ側で要求を処理する。スレッドは実行の流れの単位である。', [
    { prompt: 'Webアプリケーションで，Javaで作成したプログラムをサーバのコンテナに置き，クライアントから要求を受けたとき，サーバ側でそのプログラムを実行して応答を生成する。このプログラムはどれか。',
      correctIndex: 1, explanation: 'サーブレットはJavaのサーバ側コンポーネントとして，コンテナ上で要求を処理して応答を作る。アプレットのようにコードをクライアントへ転送してそこで実行する方式とは異なる。' },
    { prompt: '管理作業を自動化するため，複数の命令をテキストファイルに記述した。コンパイル済みオブジェクトコードを転送するのではなく，実行側で処理系がこのファイルを読み取って命令を実行する。このプログラムはどれか。',
      correctIndex: 2, explanation: 'このように命令を記述したテキストを処理系で実行するプログラムをスクリプトと呼ぶ。クライアント側のJavaアプレット，サーバ側のJavaサーブレット，実行の流れを表すスレッドとは区別する。' },
  ]);

const licensing = knowledge(21, 'GPL対象プログラムの取扱いと対応ソースの提供',
  'IPAの設例とGNU GPL v2の第2・3項、FSF FAQの組織内利用を照合。違反の選択方向を維持し、社外配布、有償・無償、提供手段を変える。一般公開を必須と誤解させない。',
  '改変したOSS（Open Source Software、オープンソースソフトウェア）自体を販売する設例では，GPL（GNU General Public License）が適用される。実行形式を配布する場合は，配布先への対応ソースの提供など，版で定める手段が必要である。単に社内で利用する場合や，独立したソフトウェアの性能測定に使う場合とは異なる。', [
    { prompt: 'GNU GPL v2が適用されるOSSを使う場合に，対応するソースコードを渡さず，提供の有効な申出も示さないと，その理由でライセンス違反となるものはどれか。',
      choices: ['入手したOSSを変更せずに，その実行形式を取引先へ無償で配布する。',
        'OSSを自社で改変し，複製を同じ法人の社内環境だけで使う。',
        'OSSをテストの道具として使い，独立に開発した別の製品だけを販売する。',
        'OSSを社内で実行するだけで，プログラムの複製を他者へ渡さない。'],
      correctIndex: 0, explanation: '変更の有無や無償かどうかにかかわらず，GPL v2の対象プログラムの実行形式を配布する場合には対応ソースを取得できる条件が必要である。社内利用と独立製品の販売だけでは対象プログラムの配布にならない。' },
    { prompt: 'GNU GPL v2が適用されるOSSを利用した製品について，対応するソースコードの提供方法に関してライセンス違反となるものはどれか。',
      choices: ['対象の実行形式と同じ媒体で，完全な対応ソースをGPL v2の条件で渡す。',
        '対象プログラムを同じ法人の社内で改変して使い，社外には複製を渡さない。',
        '対象の実行形式を組み込んだ機器を販売するが，対応ソースを渡さず，提供の有効な申出も示さない。',
        '対象プログラムを社内の試験だけで利用し，独立に開発したアプリケーションだけを販売する。'],
      correctIndex: 2, explanation: '機器に含めていてもGPL v2対象の実行形式の配布である。完全な対応ソースを添えるなど同ライセンスに従う必要があり，ソースも提供の申出もない設例は条件を満たさない。' },
  ]);

const dacCases = [[0,0,128,2.5], [0,0,64,1.6], [32,0.5,128,2.0]] as const;
const dac = define(22, '測定する二つの入力値と出力電圧', dacCases.length,
  '8ビットのD/A変換器で測った2点の差分を用い、1 LSB当たりの電圧差を分数で求める。256段、最大コード255、512段との混同を誤答にする。', index => {
    const [low, lowVoltage, high, highVoltage] = dacCases[index];
    const step = high - low, difference = highVoltage - lowVoltage;
    const options = [step, 255, 256, 512].map(denominator => difference + '／' + denominator);
    const prompt = source[22].prompt.replace('ディジタル値0を入力したときの出力電圧が0 V',
      'ディジタル値' + low + 'を入力したときの出力電圧が' + lowVoltage + ' V')
      .replace('ディジタル値128を入力したときの出力電圧が2.5 V',
        'ディジタル値' + high + 'を入力したときの出力電圧が' + highVoltage + ' V') +
      (index === 2 ? ' 入力値の差に対する出力電圧の差の比は一定とする。' : '');
    return textBody(prompt, options, 0, 'D/A（Digital-to-Analog、ディジタルからアナログへの変換）の入力値を' +
      step + '増やしたときの電圧差は' + difference + ' Vである。LSB（Least Significant Bit、最下位ビット）に相当する1段の差は，' +
      step + 'で割った' + options[0] + ' Vとなる。');
  });

const memory = knowledge(23, '説明を選ぶメモリ方式',
  '方式名からセル構造・揮発性・用途の説明を選ぶ。DRAM、SRAM、フラッシュメモリを原候補の位置のまま本文で切り替える。',
  'DRAM（Dynamic Random Access Memory、動的随時読出し書込みメモリ）はセルに蓄えた電荷を補うリフレッシュが必要で，主記憶に使われる。フリップフロップで保持するSRAM，電源遮断後も保持するフラッシュやEEPROMとは異なる。', [
    { prompt: 'SRAMの説明として，適切なものはどれか。',
      correctIndex: 2, explanation: 'SRAM（Static Random Access Memory、静的随時読出し書込みメモリ）は電源がある間フリップフロップで状態を保つ。DRAMと異なり定期的なリフレッシュを必要とせず，高速なキャッシュに用いる。' },
    { prompt: 'フラッシュメモリの説明として，適切なものはどれか。',
      correctIndex: 1, explanation: 'フラッシュメモリは電源を切っても記録を保ち，NAND型やNOR型がある。例えばNAND型はSSD（Solid State Drive、半導体記憶装置）に使われる。一般的なフラッシュの消去は1バイトずつでなくブロック単位で行う。' },
  ]);

const powers = [[500,80], [600,75], [450,90]] as const;
const power = define(24, '定格出力と電力効率', powers.length,
  '効率を出力／入力とする電源の入力を整数Wで求める。損失だけ、効率を乗ずる、出力へその積を足す値を昇順に比較する。', index => {
    const [output, percent] = powers[index], multiplied = output * percent / 100;
    const answer = output * 100 / percent;
    const options = [output - multiplied, multiplied, answer, output + multiplied];
    const prompt = source[24].prompt.replaceAll('500 W', output + ' W').replace('80％', percent + '％');
    return textBody(prompt, options.map(String), 2, '効率は出力電力を入力電力で割った値である。入力は' + output +
      ' Wを' + percent + '％で割った' + answer + ' Wとなる。');
  });

const logicCases = [
  ['Ā・B＋A・B̄＋Ā・B̄', 1, 'A＝1かつB＝1のときだけ0になる。論理積（AND）を反転したNAND（NOT AND）に等しい。'],
  ['Ā・B＋A・B̄＋A・B', 2, 'AとBの少なくとも片方が1のときに1になる。論理和（OR）に等しい。'],
  ['A・（Ā・B＋A・B）', 0, '括弧内は（Ā＋A）・B＝Bである。全体はA・B，すなわち論理積（AND）に等しい。'],
  ['Ā・B̄＋A・Ā', 3, 'A・Āは常に0なので全体はĀ・B̄となり，AとBが共に0のときだけ1になる。論理和を反転したNOR（NOT OR）に等しい。'],
] as const;
const gate = define(25, '論理式の論理積・論理和・否定の組合せ', logicCases.length,
  '二入力・一出力の論理式と四つの論理ゲート記号を維持。論理式を変え、入力4通りの出力で等価な回路を選ぶ。', index => {
    const [expression, correctIndex, explanation] = logicCases[index];
    const prompt = source[25].prompt.replace(logicCases[0][0], expression);
    return { prompt: [p(prompt)], choices: [...marks].map((mark, choice) =>
      [autumn2013AmDiagram('gate', choice, '選択肢' + mark + 'の論理回路')]), correctIndex, explanation };
  });

const inputCases = [
  { prompt: source[26].prompt, fields: source[26].choices.map(choice => choice.split('：')),
    correctIndex: 2, explanation: '商品区分はあらかじめ決まった5区分から選ぶので，プルダウンメニューに全候補を表示しやすい。商品番号や商品名は商品ごとに異なり，価格は範囲内の多数の数値を取る。' },
  { prompt: 'ある図書館では，約800冊の資料を取り扱っている。資料データの新規登録画面の入力項目のうち，入力方式としてプルダウンメニューを用いるのが適しているものはどれか。',
    fields: [['所蔵分館', '施設は固定の3分館で，資料を保管する分館を一つ指定する。'],
      ['資料名', '40字以内の日本語項目で，資料ごとに登録する。'],
      ['請求記号', '5桁の英数字項目で，資料ごとに付番する。'],
      ['購入価格', '6桁の数字項目で，範囲は1,000～50,000円である。']],
    correctIndex: 0, explanation: '所蔵分館は固定の3候補から選べる。資料名と請求記号は資料ごとに異なり，購入価格は多数の数値を取るので，単純なプルダウンメニューで全候補を並べる用途に適さない。' },
  { prompt: 'ある商店では，約200品目の商品を取り扱っている。商品データの新規登録画面の入力項目のうち，入力方式としてプルダウンメニューを用いるのが適しているものはどれか。',
    fields: [['商品番号', '5桁の英数字項目で，商品ごとに付番する。'],
      ['商品名', '40字以内の日本語項目で，商品ごとに命名する。'],
      ['仕入先区分', '10字以内の日本語項目で，仕入先が用いる区分名を自由に入力する。'],
      ['価格', '既定の300円，400円，500円のいずれかに限る。']],
    correctIndex: 3, explanation: 'この画面の価格は3種類の固定候補に限られるので，プルダウンメニューにできる。番号・名称や仕入先区分には商品や入力者ごとに異なる値が入る。' },
];
const menu = define(26, '登録対象と項目に許される値の範囲', inputCases.length,
  '項目・様式と規則の解答表を保持する。入力対象、固定選択肢の範囲と該当する行を変更し、四行とア〜エの対応を固定する。', index => {
    const { prompt, fields, correctIndex, explanation } = inputCases[index];
    return { prompt: [p(prompt), table('入力項目の様式と規則', ['', '項目', '様式と規則'],
      fields.map((row, i) => [marks[i], ...row]))], choices: strings(fields.map(([name]) => name)),
      correctIndex, explanation };
  });

export const autumn2013Am19To26 = [distribution, execution, licensing, dac, memory, power, gate, menu];
