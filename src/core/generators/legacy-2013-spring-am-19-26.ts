import { p, strings, table } from './definition';
import { circuitCases, logicChoices, operateGate, spring2013AmDiagram, umlCases } from './legacy-2013-spring-am-01-26-figures';
import { define, knowledge, source, textBody } from './legacy-2013-spring-am-01-26-shared';

const memoryManagementCases = [
  { condition: 'スラッシングが発生しやすい', answer: 0,
    explanation: '仮想記憶方式で多くのプログラムを並行実行すると，それぞれに必要なページを合わせて主記憶に収めにくい。頻繁なページ置換えが処理の大半を占める状態がスラッシングである。実記憶方式ではこのページ置換えは発生しない。' },
  { condition: '必要なページを主記憶と補助記憶の間で入れ替えながら実行し，複数のプログラムの間でページ枠を奪い合いにくい',
    answer: 1, explanation: 'ページを入れ替えるのは仮想記憶方式である。同時に進めるプログラムが少ないほど各プログラムにページ枠を割り当てやすく，ページ枠を奪い合う可能性を低くできる。' },
  { condition: '実行中のプログラムの全体を主記憶に配置し，それぞれが小さいプログラムを多数並行して動かす',
    answer: 2, explanation: '実行中のプログラム全体を主記憶に置くのは実記憶方式である。小さなプログラムを同時に多数動かす構成なので，多重度が大きいものを選ぶ。' },
  { condition: '実行中のプログラムの全体を主記憶に配置し，主記憶の大半を使用するプログラムを少数だけ同時に動かす',
    answer: 3, explanation: '実行中のプログラムの全体を主記憶に置くので実記憶方式である。大きなプログラムを少数だけ同時に動かすので多重度は小さい。' },
] as const;
const memoryManagement = define(19, '管理方式と多重度で変わる動作・ページ競合', memoryManagementCases.length,
  '管理方式と多重度の二軸の組合せを選ぶ。ページ入替えの負荷又は実記憶での主記憶占有と並行実行に条件を変更し、原の列と順序を保つ。', index => {
    const { condition, answer, explanation } = memoryManagementCases[index];
    return { prompt: [p(source[19].prompt.replace('スラッシングが発生しやすい', condition))],
      choices: source[19].choices.map(choice => [table('記憶管理と多重度の組合せ',
        ['主記憶の管理方式', 'プログラムの多重度'], [choice.split('／')])]),
      correctIndex: answer, explanation };
  });

const replacement = knowledge(20, '仮想記憶で採用するページ置換え方式', 'LRU・FIFO・ランダム・NRUの識別。元の置換え動作の説明を保持し、本文で指定する方式を変える。',
  'LRU（Least Recently Used，最も最近使われていないものを選ぶ方式）は，最後に参照された時点が最も古いページを置き換える。FIFOのように主記憶に入った時点を使う方式と区別する。',
  [
    { prompt: source[20].prompt.replace('LRU制御方式', 'FIFO制御方式'), correctIndex: 3,
      explanation: 'FIFO（First In First Out，先入れ先出し）では，最も早く主記憶に入って，最も長く主記憶にあるページを置き換える。最後に参照された時刻は使わない。' },
    { prompt: source[20].prompt.replace('LRU制御方式', 'ランダム置換え方式'), correctIndex: 1,
      explanation: 'ランダム置換え方式は候補の全ページを同じ確率で選択する。読み込んだ順序，最終参照時刻，参照や変更のフラグは選択基準にしない。' },
    { prompt: source[20].prompt.replace('LRU制御方式', 'NRU制御方式'), correctIndex: 0,
      explanation: 'NRU（Not Recently Used，最近使われていないものを優先する方式）は参照・変更フラグでページを分類し，参照なし・変更なしを優先する。LRUのように正確な参照の前後関係を管理しない。' },
  ]);

const backupCases = [[5,100,10,100,5],[4,100,10,100,5],[6,100,10,100,5],[3,120,10,100,5]] as const;
const restore = define(21, 'バックアップ後の故障曜日とフルバックアップ量', backupCases.length,
  '7曜日の媒体、日曜フル、各日増分、最後の媒体が装着済み、各テープ取替え、他時間無視を維持。故障曜日を変え、読出しだけ・フルと増分を二本と誤認した交換回数・初回取替え漏れを誤答にする。', index => {
    const [day, full, readRate, changeTime, daily] = backupCases[index], weekday = '日月火水木金土'[day] + '曜日';
    const read = (full + day * daily) * readRate, correct = read + (day + 1) * changeTime;
    const choices = [read, read + 2 * changeTime,
      read + day * changeTime, correct].map(value => value.toLocaleString('en-US'));
    return { prompt: [p(source[21].prompt.replaceAll('金曜日', weekday)),
      table('バックアップシステムの仕様', ['項目', '仕様'], [
        ['バックアップ媒体', '磁気テープ（各曜日ごとの7本を使用）'], ['フルバックアップを行う曜日', '毎週日曜日'],
        ['増分バックアップを行う曜日', '月曜日〜土曜日の毎日'], ['フルバックアップのデータ量', full + 'Gバイト'],
        ['磁気テープからのリストア時間', readRate + '秒／Gバイト'], ['磁気テープの取替え時間', changeTime + '秒／本'],
        ['変更されるデータ量', daily + 'Gバイト／日'],
      ])], choices: strings(choices), correctIndex: 3,
      explanation: '日曜日のフルバックアップから始め，月曜日から' + weekday + 'まで' + day + '日分の増分を順に復元する。' +
        '読出しは（' + full + '＋' + day + '×' + daily + '）×' + readRate + '＝' + read + '秒。' +
        weekday + 'のテープが最初に付いているので，日曜分を取り付けるところから計' + (day + 1) + '回交換する。合計は' +
        correct.toLocaleString('en-US') + '秒である。' };
  });

const testing = knowledge(22, 'テストの目的と確認する量', '検査で使う手法の名称を選ぶ。動的な実行範囲、実行時条件、模擬実行、実行しない解析の違いを識別する。',
  'テストカバレージ分析は実行された命令，分岐などの割合を測る。アサーションチェッカは実行時に条件を検査し，シミュレータは対象環境を模擬する。静的コード解析はコードを実行せずに調べる。',
  [
    { prompt: 'プログラムのテストにおいて，実行途中でその地点に成立すべき条件が破られていないかを調べるのに使うものはどれか。', correctIndex: 0,
      explanation: 'アサーションチェッカは実行途中でアサーション（成立すると宣言した条件）を評価し，違反を検出する。コードの実行割合を測るものではない。' },
    { prompt: 'プログラムのテストにおいて，実機が使用できないときに，対象の機器や環境の動作を模擬してプログラムを動かすのに使うものはどれか。', correctIndex: 1,
      explanation: 'シミュレータは機器や環境のモデルを使って動作を模擬する。実行の途中条件の検査，実行範囲の集計，コードを実行しない検査とは目的が異なる。' },
    { prompt: 'プログラムのテストにおいて，コードを実行せず，ソースコードを調べて到達不能な文などを検出するのに使うものはどれか。', correctIndex: 2,
      explanation: '静的コード解析は実行せずに制御フローなどを解析する。テストカバレージ分析は実行結果の計測であり，到達不能と未試験とを区別する解析とは異なる。' },
  ]);

const storage = knowledge(23, 'メモリの種類とセルの動作', 'メモリの特徴を選ぶ方向を維持し、保持の条件、リフレッシュ、書込み・消去単位、集積度に関する四択を対象と同期させる。',
  'DRAM（Dynamic Random Access Memory，動的ランダムアクセスメモリ）は電荷を保持する単純なセルを用いるので高集積にできる。電荷が漏れるためリフレッシュが必要で，給電が止まると情報は失われる。',
  [
    { prompt: 'SRAMの特徴はどれか。', correctIndex: 1,
      choices: ['書込み及び消去を一括又はブロック単位で行う。', '給電中にデータを保持するための定期的なリフレッシュが不要である。',
        '電源が遮断された状態でも，記憶した情報を保持することができる。', 'DRAMよりメモリセル構造が単純であり，高集積化に適する。'],
      explanation: 'SRAM（Static Random Access Memory，静的ランダムアクセスメモリ）は給電中に回路の状態を保持する。DRAM（Dynamic Random Access Memory）のようなリフレッシュは不要だが，電源断では情報を失う。セルは一般にDRAMより複雑である。' },
    { prompt: 'NAND型フラッシュメモリの特徴はどれか。', correctIndex: 0,
      choices: ['一般に書込みはページ単位で行い，消去はブロック単位で行う。', '記憶内容を保持するため，DRAMと同じ方式で周期的にセルをリフレッシュする必要がある。',
        '給電を停止すると，記憶した内容は直ちに失われる。', 'SRAMと同じラッチ回路のセルでデータを保持する。'],
      explanation: 'NAND型フラッシュメモリは不揮発性で，ページ単位の書込みと複数ページをまとめたブロック単位の消去を行う。DRAM（Dynamic Random Access Memory）のような周期的リフレッシュやSRAM（Static Random Access Memory）型のラッチは用いない。' },
  ]);

const combinations = [[false,false],[false,true],[true,false],[true,true]] as const;
const logic = define(24, '4素子の組合せ論理回路', circuitCases.length,
  '二入力A・B、一出力Y、四つのゲートと同じ配線・原四択を保持。素子の記号を変え、全4入力組合せの出力を比較する。選択肢に素子名は追記しない。', index => {
    const [first, upper, lower, last] = circuitCases[index];
    const outputs = combinations.map(([a,b]) => {
      const signal = operateGate(first, a, b);
      return operateGate(last, operateGate(upper, a, signal), operateGate(lower, signal, b));
    });
    const correctIndex = logicChoices.findIndex(gate => combinations.every(([a,b], i) => operateGate(gate, a, b) === outputs[i]));
    return { prompt: [p(source[24].prompt), spring2013AmDiagram('circuit', index, '論理回路')],
      choices: [...'アイウエ'].map((mark, option) => [spring2013AmDiagram('gate', option, '選択肢' + mark + 'の回路')]),
      correctIndex, explanation: '各素子を左から順に評価すると，入力（A，B）が（0，0），（0，1），（1，0），（1，1）のとき，' +
        '出力Yは順に' + outputs.map(Number).join('，') + 'となる。この出力に一致するのは' + logicChoices[correctIndex] + 'の記号である。' };
  });

const graphics = knowledge(25, '3次元グラフィックス処理の種類', '対象となる処理の名称だけを選ぶ方向へ変えず、同じ四つの処理の説明から適切な記述を選ぶ。',
  'クリッピングは表示範囲の境界で図形を切り取り，範囲内にある部分だけを残す。レンダリングは映像化，アンチエイリアシングは境界のギザギザの緩和，シェーディングは陰影付けである。',
  [
    { prompt: source[25].prompt.replace('クリッピング', 'レンダリング'), correctIndex: 0,
      explanation: 'レンダリングは形状などのデータを基に最終的な画像を作る処理である。境界での切取り，輪郭のギザギザの緩和，表面の陰影付けとは目的を区別する。' },
    { prompt: source[25].prompt.replace('クリッピング', 'アンチエイリアシング'), correctIndex: 2,
      explanation: 'アンチエイリアシングは図形の境界付近の画素を調整し，有限の画素による階段状の輪郭を目立たなくする。表示範囲外を取り除くクリッピングとは異なる。' },
    { prompt: source[25].prompt.replace('クリッピング', 'シェーディング'), correctIndex: 3,
      explanation: 'シェーディングは光源，面の向きなどに応じて物体の面に陰影を付け，立体感を表す。画素のギザギザを目立たなくする処理ではない。' },
  ]);

const umlExplanations = [
  'プロジェクト・社員・プロジェクト内役割分担の組で参画が一意に定まるので，同じ社員・プロジェクトでも役割が異なれば別の参画を作れる。参画は0件でもよく，部門は1件である。',
  '社員から見た参画の下限が1なので，社員には一つ以上の参画がある。参画はプロジェクト・社員の組で一意なので，同じプロジェクトに異なる役割で二重には参画できない。',
  '社員から見た部門の多重度は1..*なので，複数の部門に所属できる。参画は0件でもよく，同じ社員・プロジェクトの参画は一件までである。',
];
const multiplicity = define(26, 'UMLの関連の多重度と一意制約', umlCases.length,
  '原の五つの箱、四関連、所属方向と制約注記を維持する。社員の参加下限、所属先の上限、一意制約の属性を変える。UML（Unified Modeling Language，統一モデリング言語）の多重度を反対側の端から読む。', index => {
    const { participation, department, key } = umlCases[index];
    const correctIndex = department === '1..*' ? 3 : participation === '1..*' ? 2 : key.includes('役割分担') ? 1 : 0;
    return { prompt: [p(source[26].prompt), spring2013AmDiagram('uml', index, 'UMLデータモデル')],
      choices: strings(source[26].choices), correctIndex,
      explanation: 'UML（Unified Modeling Language，統一モデリング言語）の関連の多重度は，反対側の一つの要素を基準に読む。' + umlExplanations[index] };
  });

export const spring2013Am19To26 = [memoryManagement, replacement, restore, testing, storage, logic, graphics, multiplicity];
