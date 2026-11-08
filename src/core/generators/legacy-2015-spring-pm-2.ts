import { p, strings } from './definition';
import { jitCases } from './legacy-2015-spring-pm-01-04-models';
import { spring2015Pm0104Diagram as figure, spring2015Pm0104Profiles as profiles } from './legacy-2015-spring-pm-01-04-figures';
import { answers, bank, define, single } from './legacy-2015-spring-pm-01-04-shared';
import allBanks from './legacy-2015-spring-pm-01-04-banks.json';

const choices = allBanks[1] as { compiler: string[]; portability: string[]; time: string[] };
const title = '言語処理系';
const seconds = (nanoseconds: number) => String(nanoseconds / 1_000_000_000);
const quantity = (n: number) => n.toLocaleString('en-US');

function durations(c: typeof jitCases[number]) {
  const interpreted = c.dynamicCount * c.interpretNs;
  const early = (c.compileAt - 1) * interpreted;
  const late = (c.calls - c.compileAt + 1) * c.dynamicCount * c.compiledNs;
  const startup = c.startMs * 1_000_000;
  const compilation = c.staticCount * c.compileMsPerThousand * 1000;
  const all = c.calls * interpreted;
  const mixed = early + late + startup + compilation;
  const candidates = [early + late, startup + compilation + late, early + startup + late, mixed, all, all + late];
  if (new Set(candidates).size !== candidates.length || candidates.some(n => n % 1_000_000)) throw Error('PARAMETER_CONSTRAINT');
  return { candidates: candidates.sort((a, b) => a - b).map(seconds), all, mixed, early, late, startup, compilation };
}

export function spring2015Pm2Pages(index: number) {
  const c = jitCases[index], times = durations(c);
  return [
    [
      p('次の問2から問7までの6問については，この中から4問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，5問以上マークした場合には，はじめの4問について採点します。'),
      p('問2　言語処理系に関する次の記述を読んで，設問1〜3に答えよ。'),
      p('言語処理系とは，プログラム言語（以下，言語という）の文法に従って記述された原始プログラムを読み取り，目的とする計算機で実行するための変換をするか，又は逐次解釈しながら実行するためのソフトウェアである。'),
      p('設問1　言語処理系の種類には，インタプリタやコンパイラなどがある。インタプリタによる実行では，原始プログラムを入力して，逐次解釈しながら実行する（以下，インタプリタ方式という）。コンパイラによる実行では，原始プログラムを入力して，目的とする計算機で実行できるプログラム（以下，実行形式プログラムという）に変換し，その実行形式プログラムを実行する（以下，コンパイラ方式という）。インタプリタ方式とコンパイラ方式を比較したとき，コンパイラ方式の利点として最も適切な答えを，解答群の中から選べ。'),
      ...bank('解答群', choices.compiler),
    ],
    [
      p('設問2　次の記述中の空欄に入れる最も適切な答えを，解答群の中から選べ。'),
      p('原始プログラムを，ソフトウェアによって仮想的に構築した計算機（以下，仮想計算機という）で実行できるコード（以下，中間コードという）に変換し，仮想計算機上で中間コードをインタプリタ方式で実行する方法がある。言語Xで記述された原始プログラムを中間コードに変換し，仮想計算機Vのインタプリタで実行する例を，図1に示す。ここで，異なるOSやハードウェア上で動作する仮想計算機Vを用意することによって，［a］中間コードの形でプログラムを配布することが可能となる。'),
      figure(profiles.virtual, '図1　仮想計算機によるインタプリタ方式の実行例'),
      p('〔図1の説明〕'),
      p('(1) 言語Xで記述された原始プログラムを，仮想計算機Vで実行できる中間コードに変換する（図1①）。'),
      p('(2) 中間コードに変換されたプログラムを仮想計算機Vに入力し，Vのインタプリタで逐次解釈しながら実行する（図1②）。'),
    ],
    [
      ...bank('aに関する解答群', choices.portability),
      p('設問3　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('仮想計算機Vにおけるインタプリタ方式による実行時に，繰り返し実行される処理などの情報（以下，プロファイル情報という）を収集しておき，その内容を解析して，特定の処理の中間コードをプログラムの実行途中で実行形式プログラムに変換し，以後の実行に実行形式プログラムを利用する方法として，図2のような動的コンパイル方式がある。実行形式プログラムを実行途中から利用することによって，以後のプログラムの実行性能の向上が期待できるので，Javaなどの言語処理系で採用されている方式である。'),
      figure(profiles.dynamic, '図2　動的コンパイル方式を適用した処理の流れ'),
      p('〔図2の説明〕'),
      p('(1) 主プログラムと主プログラムから呼び出される関数Fが中間コードに変換されたプログラムがある。'),
      p('(2) 仮想計算機Vのインタプリタは，中間コードを逐次解釈しながら実行する（図2①）。このとき，関数Fが呼び出される回数をプロファイル情報として収集する（図2②）。'),
      p('(3) 仮想計算機Vは，関数Fが呼び出される都度，プロファイル情報を解析し，関数Fを実行形式プログラムに変換するかどうかを判定する。'),
    ],
    [
      p('(4) (3)で変換すると判定した場合，仮想計算機Vは，動的コンパイラを起動して関数Fを実行形式プログラムに変換する（図2③）。'),
      p('(5) (4)で関数Fを変換した後は，関数Fが呼び出されたときには実行形式プログラムが実行される（図2④）。'),
      p('動的コンパイル方式を適用する場合には，実行時間に加えて動的コンパイラの起動時間やコンパイル時間を考慮する必要がある。図2に示す関数Fを，インタプリタ方式で実行した場合と，動的コンパイル方式で実行した場合の実行時間について考える。ここで，各方式の実行条件は，次の条件に示すとおりである。主プログラムから関数Fの呼出し回数が' + quantity(c.calls) + '回のとき，インタプリタ方式の場合の実行時間は［b］秒であり，動的コンパイル方式を適用した場合の実行時間は［c］秒である。'),
      p('〔条件〕'),
      p('・主プログラムの実行時間は考えない。'),
      p('・プロファイル情報を収集する時間と，仮想計算機Vから実行形式プログラムを呼び出すのに必要な処理時間は考えない。'),
      p('・関数Fの中間コードは' + quantity(c.staticCount) + '命令から成り，関数Fが1回呼び出されたときに実行する中間コードの命令数は，' + quantity(c.dynamicCount) + '命令である。'),
      p('・動的コンパイル方式を適用した場合，関数Fが' + c.compileAt + '回目に呼び出されるときに動的コンパイラが起動され，関数Fの中間コードを実行形式プログラムに変換する。'),
      p('・動的コンパイラの起動時間とコンパイル時間は，実行時間に含める。'),
      p('・動的コンパイラの起動時間は' + c.startMs / 1000 + '秒とし，コンパイル時間は，中間コード1,000命令当たりで' + c.compileMsPerThousand / 1000 + '秒とする。'),
      p('・インタプリタによる中間コード1命令の実行時間は' + c.interpretNs + 'ナノ秒とし，中間コード1命令に対応する実行形式プログラムの実行時間は' + c.compiledNs + 'ナノ秒とする。'),
      ...bank('b，cに関する解答群', index === 0 ? choices.time : times.candidates),
    ],
  ];
}

export const legacy2015SpringPm2Definition = define(
  2, title, '設問1=エ、設問2 a=ア、設問3 b=オ・c=エ',
  '呼出し回数・コンパイル発火と処理時間', jitCases.length,
  '仮想計算機の図と四つの解答欄を保ち、関数の呼出し・変換の開始回・命令数と実行時間を変えています。',
  '印刷p.9〜12／物理p.10〜13。原の4欄と6択の順を維持する。静的命令数と呼出し当たり実行数、起動・変換の一度だけの加算を区別。',
  index => {
    const c = jitCases[index], t = durations(c);
    return {
      prompt: spring2015Pm2Pages(index).flat(),
      ...answers([strings(choices.compiler), strings(choices.portability), strings(t.candidates)], [
        single('s1', '設問1', 0, 3), single('a', '設問2 a', 1, 0),
        single('b', '設問3 b', 2, t.candidates.indexOf(seconds(t.all))),
        single('c', '設問3 c', 2, t.candidates.indexOf(seconds(t.mixed))),
      ]),
      explanation: '設問1：事前に目的の計算機に合わせて変換するので，実行時間を短縮する最適化を図れる。対話・直ちに実行・原始プログラムでの確認はここで比較するコンパイラ方式の利点ではない。\n' +
        '設問2：ハードウェアごとに同じ中間コードを実行できるVを用意するので，配布する中間コードは特定のOSやハードウェアに依存しない。\n' +
        'b：' + c.calls + '回すべてで' + quantity(c.dynamicCount) + '命令に' + c.interpretNs + 'ナノ秒を掛けて足すと' + seconds(t.all) + '秒。\n' +
        'c：変換前の' + (c.compileAt - 1) + '回で' + seconds(t.early) + '秒，起動' + seconds(t.startup) + '秒，' +
        quantity(c.staticCount) + '命令のコンパイル' + seconds(t.compilation) + '秒，発火した回を含む残り' +
        (c.calls - c.compileAt + 1) + '回で' + seconds(t.late) + '秒。合計' + seconds(t.mixed) + '秒。',
    };
  },
);
