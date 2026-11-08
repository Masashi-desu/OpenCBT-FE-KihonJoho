import { p, strings, table } from './definition';
import allBanks from './legacy-2014-autumn-pm-01-04-banks.json';
import { answers, bank, define, marks, single, unordered } from './legacy-2014-autumn-pm-01-04-shared';
import { autumn2014Pm0104Diagram as diagram, autumn2014Pm0104Profiles as f } from './legacy-2014-autumn-pm-01-04-figures';
import { jkCases, jkTruthRows, type Signal } from './legacy-2014-autumn-pm-01-04-models';

const choices=allBanks[1] as {wave:string[];excitation:string[][];counter:Signal[][]};
const pair=(values:readonly string[])=>values.join('，');
const initialExample=jkCases[0].example;
function signal(value:Signal,q:number){return value==='Q'?q:value==='Q̅'?1-q:Number(value);}
function evolve(jk:readonly Signal[],initial=0){
  let q=initial;
  return Array.from({length:4},()=>{
    const j=signal(jk[0],q), k=signal(jk[1],q);
    q=(j*(1-q))+(1-k)*q;
    return q;
  });
}
function counterOptions(i:number){
  const example=pair(jkCases[i].example);
  return choices.counter.map(terms=>pair(terms)===example?initialExample:terms);
}

export function autumn2014Pm2Pages(i:number){
  const {feedback,example}=jkCases[i];
  const formalFeedback=i===0?'図3に示すとおり，JとQ，KとQ̅をそれぞれ同一の値の信号とする回路（端子間を結線する）にクロック信号（CLK）を入力したとき，CLKの立ち下がりでQの値は［a］。ここで，Qの初期値は0とする。':
    '図3に示すとおり，Jに'+feedback[0]+'，Kに'+feedback[1]+'を入力する回路にクロック信号（CLK）を入力したとき，CLKの立ち下がりでQの値は［a］。ここで，Qの初期値は0とする。';
  const k=signal(example[1],0),j=signal(example[0],1);
  const exampleText=i===0?
    '例えば，表3の任意ⱼの値を0，任意ₖの値を1にするためには，Q̅をJの入力に，Kの入力の値を常に1にすればよい。（以下，(J, K)＝(Q̅, 1)と表記する）この構成例を図5に示す。':
    '例えば，表3の任意ⱼの値を'+j+'，任意ₖの値を'+k+'にする一つの構成は，(J, K)＝('+pair(example)+')である。この構成例を図5に示す。';
  return [
    [
      p('次の問2から問7までの6問については，この中から4問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，5問以上マークした場合には，はじめの4問について採点します。'),
      p('問2　JKフリップフロップに関する次の記述を読んで，設問1〜3に答えよ。'),
      p('JKフリップフロップは，二つの信号入力端子JとK，一つのクロック信号入力端子CLK，及び二つの信号出力端子QとQ̅をもつ回路である。図1にJKフリップフロップの記号を示す。'),
      diagram(f.symbol,0,'図1　JKフリップフロップの記号'),
      p('入出力される信号の値は高，低の二つの電圧レベルのいずれかである。クロック信号の値は，周期的に高と低を繰り返す。Qの値は，Q̅の値が高であれば低，低であれば高となる。'),
      p('各入出力端子の信号の値を当該端子記号で表し，信号の値が高の場合を論理値の1，低の場合を論理値の0として表記する。また，信号の値が低から高に変化することを0→1，高から低に変化することを1→0と表記する。'),
      p('CLKの立ち下がり（1→0）時に，その時点でのJ，K，Qの値に基づき，その後のQの値が決定される。この様子を図2に示す。CLKの立ち下がり時刻をt₁，その後のQの値が決定した時刻をt₂として，時刻t₁でのJ，K，Qの値（J₁，K₁，Q₁と表記）と時刻t₂のQの値（Q₂と表記）の関係を表1の真理値表に示す。ここで，時刻t₁とt₂の時間間隔は極めて短く，CLKの1周期に比べても十分に短いものとする。'),
    ],
    [
      diagram(f.edge,0,'図2　CLKの立ち下がりとQの値の変化例'),
      table('表1　真理値表',['J₁','K₁','Q₁','Q₂'],jkTruthRows),
      p('設問1　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p(formalFeedback),
      diagram(f.feedback,i,'図3　JKフリップフロップの応用回路例'),
    ],
    [
      ...bank('解答群',choices.wave),
      p('設問2　表1の真理値表を基に，Q₁からQ₂への変化に着目し，そのときのJ₁，K₁との関係を表2にまとめ直した。表2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      diagram(f.excitation,0,'表2　Qの値の変化とJ₁，K₁の値の関係'),
      table('b，cに関する解答群',['記号','J₁','K₁'],choices.excitation.map((row,j)=>[marks[j],...row])),
      p('設問3　JKフリップフロップ1個を使って，図4のように動作する2進カウンタを構成する。ここで，2進カウンタとは，CLKの1周期ごとにQの値が変化するものである。次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
    ],
    [
      diagram(f.counter,0,'図4　2進カウンタの動作例'),
      p('図4の例では，Qの値は，1回目のCLKの立ち下がりで0→1，2回目のCLKの立ち下がりで1→0に変化し，以降もCLKの立ち下がりごとにこれを繰り返す。'),
      p('表2から，1回目のCLKの立ち下がりのときのJ，K，Qの値の組合せと，2回目のCLKの立ち下がりのときのJ，K，Qの値の組合せが，表3のようであればよいことが分かる。'),
      table('表3　CLKの立ち下がりのときのJ，K，Qの値の組合せ',['時点','J','K','Q'],[
        ['1回目のCLKの立ち下がり','1','任意ₖ','0'],['2回目のCLKの立ち下がり','任意ⱼ','1','1'],
      ]),
      p(exampleText), diagram(f.example,i,'図5　2進カウンタ構成例'),
    ],
    [
      p('同様に，表3の任意ⱼと任意ₖを組み合わせると，他の構成案として次の三つがある。'),
      p('2進カウンタ構成案1　(J, K)＝(［d］)'),
      p('2進カウンタ構成案2　(J, K)＝(［e］)'),
      p('2進カウンタ構成案3　(J, K)＝(［f］)'),
      ...bank('d〜fに関する解答群',counterOptions(i).map(pair)),
    ],
  ];
}

export const legacy2014AutumnPm2Definition=define(2,'JKフリップフロップ',
  '設問1 a=ア、設問2 b=ア・c=エ、設問3 d/e/f=ア・イ・カ（順不同）',
  'JKの入力結線とカウンタ構成例',jkCases.length,
  '図3の入力結線と図5の例を変え、CLK立ち下がりの追跡と他の三つのカウンタ構成を問います。',
  '印刷・物理p.10〜14。4つの立ち下がり、J/K/Q/Q̅、励起条件の任意、既出の構成例を除く三つの順不同を保持。',
  i=>{
    const path=evolve(jkCases[i].feedback).join(''), key=['0000','1111','1000','1010'].indexOf(path);
    const counter=counterOptions(i);
    const correct=counter.flatMap((candidate,j)=>evolve(candidate).join('')==='1010'?[j]:[]);
    if(key<0||correct.length!==3)throw Error('PARAMETER_CONSTRAINT');
    return {
      prompt:autumn2014Pm2Pages(i).flat(),
      ...answers([choices.wave,choices.excitation.map(pair),counter.map(pair)].map(strings),[
        single('a','設問1 a',0,key),single('b','設問2 b',1,0),single('c','設問2 c',1,3),
        unordered(['d','e','f'],['設問3 d','設問3 e','設問3 f'],2,correct),
      ]),
      explanation:'設問1：Qの初期値0から、立ち下がりごとにその時点のQ・Q̅を結線どおりJとKに入力する。四回の立ち下がり後のQは'+
        [...path].join('，')+'。立ち上がりではQを更新しない。\n設問2：Q₁=0ならQ₂はJ₁と同じなので、0を保つにはJ₁=0でK₁は任意。Q₁=1ならQ₂はK₁の反転なので、1を保つにはK₁=0でJ₁は任意。\n'+
        '設問3：Q=0のときJ=1、Q=1のときK=1なら毎周期反転する。構成例('+pair(jkCases[i].example)+')を除いて条件を両方満たすのは'+
        correct.map(j=>'('+pair(counter[j])+')').join('、')+'。三つを順不同で選ぶ。',
    };
  });
