import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2005-autumn-pm-01-05-shared';
import { draw } from './legacy-2005-autumn-pm-01-05-figures';
import { memory, moduleNames, overlays, segmentRows } from './legacy-2005-autumn-pm-01-05-models';

function answerBanks(index:number) {
  const {sizes,initial}=memory(index);
  return [[sizes[0]+sizes[1]+sizes[2],sizes[0]+sizes[9],initial-1,initial,initial+1,initial+2,initial+3,initial+4].map(String),
    ['10','11','12','13','14','15'],Array.from({length:10},(_,i)=>String(i+1))];
}
function mapTable(index:number) {
  return table('セグメントと構成モジュール',['セグメント','構成モジュール'],segmentRows(overlays[index]));
}

export function autumn2005Pm2Pages(index:number,print=true) {
  const {sizes,alpha,initial,max,eventCounts}=memory(index);
  const [direct,space,reads]=answerBanks(index);
  return [
    [p('オーバレイに関する次の記述を読んで，設問1，2に答えよ。'),
      p('近年，組込み（embedded）システムに利用されるプログラムの規模拡大に伴い，オーバレイが必要になってきている。オーバレイとは，プログラムを幾つかのオーバレイセグメント（以下，単にセグメントと呼ぶ）に分割しておき，OSがプログラムの実行に必要なモジュールを含むセグメントだけを主記憶領域に読み込んで実行する方法である。'),
      p('（1）10個のモジュールA〜Jで構成されるプログラムがあり，各モジュールは図1に示す呼出し構造になっている。例えば，モジュールGは二つのモジュールH及びIを呼び出す。'),
      draw('overlay-calls',0,'図1　モジュールの呼出し構造'),
      p('（2）このプログラムのモジュールの実行順序は，図2のとおりである。'),
      draw('overlay-order',index,'図2　モジュールの実行順序'),
      p('（3）A〜Jの各モジュールの実行に必要な主記憶領域の大きさは，表のとおりである。なお，セグメントの大きさは，セグメントを構成するモジュールの大きさを合計したものになる。')],
    [table('表　モジュールの大きさ',['モジュール',...moduleNames],[['大きさ（Mバイト）',...sizes.map(String)]]),
      p('設問1　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('プログラムのオーバレイ構造と各セグメントを構成するモジュールを図3に示す。図3は，モジュールDがモジュールAから呼び出されたとき，主記憶領域にセグメントP0及びP2が読み込まれていることを表している。また，セグメントP1，P2及びP3は，主記憶領域の同じ番地を先頭としてそれ以降に読み込まれることを表している。'),
      draw('overlay-plan',0,'図3　オーバレイ構造とセグメント'),mapTable(0),
      p('このプログラムを実行したとき，プログラムの実行が終了するまでに，セグメントはP0，P1，P2，P3の順に，計4回だけ主記憶領域に読み込まれる。図3のオーバレイ構造で実行するのに必要な主記憶領域は，空欄（設問1）Mバイトである。'),
      ...(print?bank('解答群',direct):[])],
    [p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('プログラムの実行時に利用する主記憶領域を減らすことが必要になったので，オーバレイ構造及びセグメントの見直しを行って，図4と図5に示す二つの案を作成した。'),
      draw('overlay-plan',1,'図4　オーバレイ構造とセグメント案1'),mapTable(1),
      draw('overlay-plan',2,'図5　オーバレイ構造とセグメント案2'),mapTable(2),
      p('図3のオーバレイ構造に比べて，プログラムの実行時に利用する主記憶領域を，案1では'+(initial-max[1])+'Mバイト，案2では［a］Mバイト減らすことができる。'),
      ...(print?[p('プログラムを実行したとき，図2中のαの位置にあるモジュール'+alpha+'の実行が終了')]:[])],
    [p((print?'する':'プログラムを実行したとき，図2中のαの位置にあるモジュール'+alpha+'の実行が終了する')+
      'までに主記憶領域にセグメントが読み込まれる回数は，案1では合計'+eventCounts[1].untilAlpha+'回，案2では合計［b］回である。'),
      p('プログラムの実行が終了するまでに主記憶領域にセグメントが読み込まれる回数は，図3のオーバレイ構造に比べて，案1では合計［c］回，案2では合計6回増える。'),
      ...(print?[...bank('aに関する解答群',space),...bank('b，cに関する解答群',reads)]:[])],
  ];
}

export const autumn2005Pm2=define(
  2,'オーバレイと主記憶領域の削減','設問1=エ／a=イ／b=キ／c=エ','モジュールの大きさと途中までの読込み計数位置',
  '呼出し構造、各案の割付けを維持し、モジュールの大きさと図2の計数位置を変更する。',
  'A〜Jの各モジュール、P/Q/R案の階層・セグメントを保持。根から同居する単一路の最大和と、階層ごとの読込み・再読込みを別々に検証。同じ案の情報を図・表・本文で更新。元の答えの目盛りと四欄を保持。',
  index=>{
    const {initial,max,eventCounts,alpha}=memory(index),[direct,space,reads]=answerBanks(index);
    const a=initial-max[2], b=eventCounts[2].untilAlpha, c=eventCounts[1].events.length-eventCounts[0].events.length;
    return {prompt:autumn2005Pm2Pages(index,false).flat(),...answers([strings(direct),strings(space),strings(reads)],[
      single('s1','設問1',0,direct.indexOf(String(initial))),single('a','a',1,space.indexOf(String(a))),
      single('b','b',2,reads.indexOf(String(b))),single('c','c',2,reads.indexOf(String(c))),
    ]),explanation:'最初の構造ではP0に加えて同じ領域を共有するP1、P2、P3のうち最大の領域を確保し，合計'+initial+
      'Mバイト。案2では同居する最長の経路ごとに合計して大きいものを選び，'+max[2]+'Mバイトになり，差は'+a+
      'Mバイト。案2で'+alpha+'の終了までに読み込む回数は'+b+'回。全体では案1が'+eventCounts[1].events.join('→')+
      'の'+eventCounts[1].events.length+'回，図3の構造は4回なので案1は'+c+'回増加する。OS（Operating System、基本ソフトウェア）は必要なセグメントを各共有領域に切り替えて配置する。'};
  },
);
