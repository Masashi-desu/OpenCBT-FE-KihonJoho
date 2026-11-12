import { define, source, textBody } from './legacy-2008-autumn-am-01-26-shared';

const fractionalRadix = define(2, '比較する基数と有限小数の主張', 4,
  '基数変換の適切な記述を選ぶ原問を保つ。変換先・変換元と，全称／反例の有無を変更する。', index => {
    const cases = [
      [[2, 10, true], [8, 2, false], [8, 10, false], [10, 8, true]],
      [[10, 2, true], [16, 8, true], [4, 2, false], [6, 10, true]],
      [[10, 8, true], [8, 16, false], [10, 16, false], [4, 10, false]],
      [[2, 8, false], [10, 4, true], [8, 10, false], [8, 16, true]],
    ] as const;
    const pairs = cases[index];
    const bases = [...new Set(pairs.flatMap(([from, to]) => [from, to]))].sort((a, b) => a - b);
    const prompt = index === 0 ? source[2].prompt : bases.join('・') + '進数の基数変換に関する記述のうち，適切なものはどれか。';
    const choices = pairs.map(([from, to, always]) => from + '進数の有限小数は，' + to +
      (always ? '進数にしても必ず有限小数になる。' : '進数にすると有限小数にならないこともある。'));
    const [from, to, always] = pairs[index];
    const example = index === 2 ? ' 例えば10進数の0.1は既約分母が10で，16のどのべきでも割り切れない。' : '';
    return textBody(prompt, index === 0 ? source[2].choices : choices, index,
      '有限小数になるためには，既約分母が変換先の基数のべきの約数である必要がある。' +
      from + '進有限小数の既約分母に現れる素因数は' + to + 'の素因数に' +
      (always ? 'すべて含まれるので，変換後も必ず有限小数になる。' : 'すべては含まれないので，有限小数にならない場合がある。') + example);
  });

const floatError = define(4, '数値計算で起きた誤差の状況', 4,
  '浮動小数点演算の誤差名を問う。加減算の桁合わせ、級数の打切り、近い値の差、真値との差へ状況を切り替える。', index => {
    const situations = [
      [source[4].prompt, 2, '指数をそろえると小さい数の有効けたが表現範囲の外に押し出される。これを情報落ちという。'],
      ['無限級数を数値計算する際に，有限個の項までの和で近似したために残りの項の合計分だけ生じる誤差を何というか。', 0,
        '無限に続く手続きを有限の時点で終えることにより生じるので，打切り誤差である。'],
      ['浮動小数点演算でほぼ等しい二つの値の差を求めると，共通する上位のけたが相殺され，結果の有効けた数が減る。この現象を何というか。', 1,
        'ほぼ等しい値の減算で上位桁が相殺され，有効数字の桁数が減る現象はけた落ちである。'],
      ['数値計算で得た近似値と真の値との差の絶対値を表し，真の値で割って正規化しない誤差の指標を何というか。', 3,
        '絶対誤差は真値と近似値の差の絶対値である。真値の絶対値で割れば相対誤差となる。'],
    ] as const;
    const [prompt, correct, explanation] = situations[index];
    return textBody(prompt, source[4].choices, correct, explanation);
  });

const memory = define(16, '半導体メモリの種類', 4,
  '原候補のキャッシュ・紫外線消去・再書込み・ブロック消去に対応するメモリの種類を本文にバインドする。', index => {
    const cases = [
      ['フラッシュメモリ', 3, 'フラッシュメモリは不揮発性であり，電気的な消去をブロック単位で行える。DRAMの周期的な再書込みは，電荷を保持するために行う。'],
      ['SRAM', 0, 'SRAMは記憶回路の状態を保つ方式で，通電中のリフレッシュが不要で高速なため，キャッシュなどに使われる。'],
      ['紫外線消去型EPROM', 1, '紫外線消去型EPROMは，パッケージの窓から紫外線を当てて全内容を消去できる。'],
      ['DRAM', 2, 'DRAMはキャパシタの電荷を利用する。電荷が時間とともに失われるため，周期的なリフレッシュが必要である。'],
    ] as const;
    const [target, correct, explanation] = cases[index];
    return textBody(source[16].prompt.replace('フラッシュメモリ', target), source[16].choices, correct, explanation);
  });

const interrupt = define(18, '割込みを引き起こす実行と装置事象', 4,
  '内部割込みに分類できる事象を選ぶ。プログラムによる例外原因を変え，装置や電源からの通知との区別を保つ。', index => {
    const internalCases = [
      ['通常の除算命令を実行するプログラム', 'ゼロで除算を実行したことによる割込み', 'ゼロ除算'],
      ['未定義の命令を実行し得るプログラム', 'CPUが未定義の命令コードを実行しようとしたことによる割込み', '不正命令'],
      ['ユーザモードで動作するプログラム', 'ユーザモードで許可されない特権命令を実行したことによる割込み', '特権命令の実行例外'],
      ['割込みを要求する専用命令を用いるプログラム', 'プログラム中の割込み要求命令を実行したことによる割込み', 'ソフトウェアが実行した割込み要求命令'],
    ] as const;
    const [program, event, explanation] = internalCases[index];
    const correct = [1, 2, 3, 0][index];
    const choices = source[18].choices.filter((_, i) => i !== 1);
    choices.splice(correct, 0, event);
    return textBody(index === 0 ? source[18].prompt : program + 'が実行されている。内部割込みに分類されるものはどれか。',
      choices, correct, explanation + 'は，実行中のプログラムの命令が直接の原因になる。電源異常，入出力完了，' +
      'メモリパリティエラーは，装置側が通知する外部要因の割込みとして扱う。');
  });

const memoryMethod = define(20, '主記憶の利用又はアクセスを改善する方式', 4,
  '原候補の技法名を保ち，分割並行動作、仮想アドレス空間、高速な複製、CPUを介さない転送の状況を選ぶ。', index => {
    const situations = [
      [source[20].prompt, 3, '主記憶を複数のバンクに分けてアクセスを重ね，連続した読み書きの実効時間を短縮するメモリインタリーブである。'],
      ['主記憶の利用技法として，補助記憶装置を併用し，実際の主記憶よりも大きなアドレス空間をプログラムに提供する方法を何というか。', 0,
        '仮想記憶では必要な部分だけを主記憶に置き，他の部分を補助記憶装置に退避して仮想アドレス空間を実現する。'],
      ['主記憶へのアクセスの高速化の技法として，最近使ったデータの複製をCPUに近い高速な小容量メモリへ置き，再参照時に利用する方法を何というか。', 1,
        'キャッシュメモリ方式は局所性を利用し，再参照がキャッシュに当たれば主記憶へアクセスするより速く処理できる。'],
      ['主記憶と入出力装置の間でデータを転送するとき，CPUが個々のデータを読み書きせず，専用の制御装置がブロック転送を行う方法を何というか。', 2,
        'ダイレクトメモリアクセスではCPUが転送の条件を設定し，実際のデータ転送は専用の制御装置が行う。'],
    ] as const;
    const [prompt, correct, explanation] = situations[index];
    return textBody(prompt, source[20].choices, correct, explanation);
  });

const opticalDisc = define(22, '光ディスクの媒体・記録方式', 4,
  'CD-R・CD-RW・DVD-RAM・DVD-ROMの四候補を保つ。記録層・繰返し書換え・読出し専用などの特徴を本文へバインドする。', index => {
    const cases = [
      [source[22].prompt, 'CD-Rは有機色素層をレーザ光で変化させて記録する追記型の媒体である。CD-RW及びDVD-RAMは記録層の相変化を用いる。'],
      ['CDの規格に従い，記録層の相変化によってデータを記録し，消去と書換えを繰り返せる光ディスクはどれか。',
        'CD-RWは記録層の結晶状態をレーザ光で変え，繰り返し書き換えられるCDである。'],
      ['DVDの規格に従い，相変化型の記録層にセクタ単位で書換えと検証を行える光ディスクはどれか。',
        'DVD-RAMは書換え型DVDで，セクタ単位で書込みと検証ができる。CD-RWはDVDの規格には属さない。'],
      ['DVDの規格に従い，製造時に設けたピットを読み取り，利用者は書き込めない光ディスクはどれか。',
        'DVD-ROMは読み出し専用で，製造時に形成した記録を読む。DVD-RAMは利用者が書き換えられる。'],
    ] as const;
    return textBody(cases[index][0], source[22].choices, index, cases[index][1]);
  });

const usb = define(23, 'USBハブの接続台数・電源・構成・接続時期', 4,
  'USBハブに関する適切な説明を選ぶ。規格上のアドレス数、セルフパワー、上流・下流、動作中の接続を場面に割り当てる。', index => {
    const cases = [
      { prompt: source[23].prompt, choices: source[23].choices, correct: 3,
        explanation: 'USBで機器に割り当てるアドレスは1～127。ハブもアドレスを使うので，ハブと外部機器を合わせた規格上の上限は127台になる。' },
      { prompt: 'セルフパワー方式のUSBハブを介して外部機器を接続する場合，ハブと外部機器の接続・給電の説明として，適切なものはどれか。',
        choices: ['ハブ同士はクロスケーブルで接続する。', 'ハブはACアダプターなどの別電源から電力を得て，下流の機器に供給できる。',
          'ハブを介して，USBのホストとして動く複数のコンピュータ同士を接続できる。', '外部電源もUSB上流ポートの電力も使わずに，下流ポートへ給電できる。'],
        correct: 1, explanation: 'セルフパワー方式のハブは別電源を用いる。下流ポートの給電に利用できる電力は，ハブとUSBの仕様に従う。' },
      { prompt: 'コンピュータ1台のUSBポートに複数の外部機器を接続する場合，USBハブの説明として，適切なものはどれか。',
        choices: ['ハブは一つの上流接続を複数の下流接続に分岐する。', '接続される外部機器は，同じUSBアドレスを共有しなければならない。',
          '上流ポートへ複数のコンピュータを接続して，ホスト間で通信できる。', '下流の機器は，ハブごとに割り当てる1個のUSBアドレスで区別できる。'],
        correct: 0, explanation: 'ハブの上流をホスト側へ接続し，下流に外部機器をつなぐ。機器には別々のUSBアドレスが割り当てられる。' },
      { prompt: 'USBを備えた稼働中のコンピュータにハブと外部機器を追加する場合，USBハブの説明として，適切なものはどれか。',
        choices: ['ハブとコンピュータはクロスケーブルで接続する。', 'ハブの接続前に，必ずコンピュータを停止する必要がある。',
          'USBは動作中の着脱に対応しているので，起動後にもUSBハブを接続できる。', 'ハブは接続時にUSBアドレスを消費しない。'],
        correct: 2, explanation: 'USBはホットプラグに対応し，稼働中の接続を検知して機器を認識する。ハブもUSB機器としてアドレスを消費する。' },
    ];
    const { prompt, choices, correct, explanation } = cases[index];
    return textBody(prompt, choices, correct, explanation);
  });

const ata = define(24, 'ストレージ接続の規格', 4,
  '適切な接続規格の特徴を選ぶ四択。SAS・シリアルATA・パラレルATA・eSATAの互換性や接続形態を切り替える。', index => {
    const cases = [
      { target: 'シリアル ATA', choices: source[24].choices, correct: 3,
        explanation: 'シリアルATAは対応するホスト・装置でホットスワップが可能である。SAS側が対応する場合にSATA装置を使えるが，逆方向の互換性はない。' },
      { target: 'SAS（Serial Attached SCSI）', choices: ['SATAドライブを接続できるSASコントローラがある。',
        'SASコントローラとドライブの間はSCSIのパラレルバスで接続する。', 'パラレルATAとケーブル，コネクタに互換性がある。',
        'すべてのSAS機器は，電源を切っているときにしかドライブを交換できない。'],
        correct: 0, explanation: 'SASはシリアル接続であり，SATAドライブを扱えるSASコントローラがある。SATA側にSASドライブを接続できるという意味ではない。' },
      { target: 'パラレル ATA', choices: ['SASと双方向の互換性がある。', '1本のケーブルで，同じチャネルに2台の装置を接続できる。',
        'シリアルATAとケーブル，コネクタに互換性がある。', '接続方式は稼働中のホットスワップを前提としている。'],
        correct: 1, explanation: 'パラレルATAは一つのチャネルを共有する2台の装置を同じケーブルに接続できる。シリアルATAのポイントツーポイント接続とは異なる。' },
      { target: '外部接続用の eSATA', choices: ['SASと双方向の互換性がある。', '一つの信号ポートから，ドライブを通常のデイジーチェーンで順次つなぐ。',
        '機器の外部接続用のコネクタを使い，コンピュータと外部機器を接続できる。', 'eSATAの信号ケーブルだけで常に外部機器に電源を供給できる。'],
        correct: 2, explanation: 'eSATAはSATAを機器外部の信号接続に使う規格である。標準のeSATA信号ケーブルそのものは外部機器への電力を供給しない。' },
    ];
    const { target, choices, correct, explanation } = cases[index];
    return textBody(source[24].prompt.replace('シリアル ATA', target), choices, correct, explanation);
  });

const display = define(25, '表示装置の種類と発光方式', 4,
  'ガス放電・TFT液晶・有機EL・CRTを元の発光／表示原理の候補へ対応させ，本文の対象を切り替える。', index => {
    const cases = [
      ['プラズマディスプレイパネルの発光方式', 'プラズマディスプレイでは，画素ごとのガス放電で生じる紫外線が蛍光体を励起し，可視光を発生させる。'],
      ['透過型TFT液晶ディスプレイパネルの表示方式', '画素ごとの薄膜トランジスタで液晶を駆動し，背後からの光の透過を制御する。'],
      ['有機ELディスプレイパネルの発光方式', '有機ELでは，有機化合物の薄膜に電圧を加えて電流を流し，各画素の有機化合物を自発光させる。'],
      ['CRTディスプレイの発光方式', 'CRTでは，真空管内の電子銃から放った電子ビームを画面の蛍光体へ当て，その位置を発光させる。'],
    ] as const;
    const [target, explanation] = cases[index];
    return textBody(source[25].prompt.replace('プラズマディスプレイパネルの発光方式', target), source[25].choices, index, explanation);
  });

const printer = define(26, '印刷の方式と比較する性能', 4,
  '印字品質・速度に関する指標の組を選ぶ元の問いを保つ。装置と比較目的を可変にする。', index => {
    const cases = [
      { prompt: source[26].prompt, correct: 0, explanation: 'レーザプリンタでは印刷の解像度をdpi，印刷速度を1分間のページ数（ppm）で示す。' },
      { prompt: 'ドットインパクト方式のシリアルプリンタで，1文字のドット構成と文字を順次印字する速さを比較するための性能指標として，最も適切なものはどれか。',
        correct: 1, explanation: '文字のドット構成は縦横に何ドット使うかで比較し，順次印字の速さは1秒間の文字数で比較する。' },
      { prompt: '1行ずつまとめて印刷するラインプリンタで，行の密度と行単位の印字速度を比較するための性能指標として，最も適切なものはどれか。',
        correct: 2, explanation: '行の密度は行間の間隔に対応し，行単位の印字速度は1秒間又は1分間に印字できる行数で表す。' },
      { prompt: '活字を打ち付けるシリアルプリンタで，取り付けた活字が印字できる文字の範囲と文字単位の印字速度を比較するための指標として，最も適切なものはどれか。',
        correct: 3, explanation: '印字できる文字の種類は活字の文字集合で決まる。文字単位の印字速度は1秒間に印字できる文字数で比較する。' },
    ];
    const { prompt, correct, explanation } = cases[index];
    return textBody(prompt, source[26].choices, correct, explanation);
  });

export const knowledge2008AutumnAm0126 = [
  fractionalRadix, floatError, memory, interrupt, memoryMethod, opticalDisc, usb, ata, display, printer,
];
