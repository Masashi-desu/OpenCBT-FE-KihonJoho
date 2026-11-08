import { p, strings } from './definition';
import type { Block } from '../types';
import data from './legacy-2014-spring-pm-01-04-banks.json';
import { answers, bank, define, marks, single } from './legacy-2014-spring-pm-01-04-shared';
import { parallelCases, parallelIndexRows, partitionSizes } from './legacy-2014-spring-pm-01-04-models';
import { spring2014Pm0104Diagram as diagram, spring2014Pm0104Profiles as profiles } from './legacy-2014-spring-pm-01-04-figures';

const speedFormula:Block={type:'formula',format:'latex',text:'E=\\frac{1}{1-r+\\frac{r}{n}}',
  alt:'Eは、1を、1からrを引きrをnで割った値を足したもの、で割る。'};
function conditions(i:number){
  return data.q3[2].map(choice=>choice.replace(/n$/u,parallelCases[i].extent));
}
function canWriteTogether(row:number[],groups:readonly number[]){
  const writers=new Map<number,number>();
  for(const [thread,[first,last]] of partitionSizes(groups).entries()){
    for(let j=first-1;j<last;j++){
      const old=writers.get(row[j]);
      if(old!==undefined&&old!==thread)return false;
      writers.set(row[j],thread);
    }
  }
  return true;
}

export function spring2014Pm3Pages(i:number) {
  const c=parallelCases[i];
  return [
    [
      p('問3　プログラムの並列実行に関する次の記述を読んで，設問1〜3に答えよ。'),
      p('プログラムを並列に実行する方法として，スレッドを使用した並列実行がある。スレッドを使用した並列実行では，プログラムの中で並列実行が可能な部分を抽出して複数の処理に分割し，分割した処理を別々のスレッドとして同時に実行する。'),
      p('スレッドによる並列実行の例を，図1に示す。プログラムAは，一つのプロセスとして実行され，データ作成，計算処理，結果出力の順に処理が行われる。ここで，計算処理はn個の処理に分割して並列実行が可能であり，分割した処理を異なるスレッドで並列に実行した結果は，スレッドを使わずに計算処理した実行結果と同じであるとする。計算処理では，スレッドの生成と実行を行い，全てのスレッドの終了を同期処理で待つ。各スレッドでは，分割した計算処理（部分計算処理）を行う。'),
      diagram(profiles.parallel,0,'図1　スレッドによる並列実行の例'),
      p('プログラムAを実行するコンピュータの構成は，性能が同じである複数のCPUと各CPUからアクセス可能な共有メモリで構成されているマルチプロセッサとする。生成された複数のスレッドは，異なるCPUに割り当てられて同時に実行され，各スレッドは共有メモリでデータを共有する。マルチプロセッサにおけるスレッドとCPU，共有メモリの関係を，図2に示す。ここで，データを転送するバスの競合は無いものとする。'),
    ],
    [
      diagram(profiles.processor,0,'図2　マルチプロセッサにおけるスレッド実行'),
      p('設問1　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('マルチプロセッサによる並列実行で得られる理想的な高速化率Eは，次の式で求められる。'),
      speedFormula,
      p('n：CPUの数（n≧1）\nr：対象とする処理のうち，並列実行が可能な部分の処理時間の割合（0≦r≦1）'),
      p('図1のプログラムAにおいて，データ作成，計算処理，結果出力の処理時間の割合が'+c.duration.join('：')+
        'の場合，単一のCPUで実行したときと比べた高速化率を'+c.target+'以上にするには，CPUが最低［a］個必要である。ここで，スレッドの生成処理などの並列実行に伴うオーバヘッドは考慮しない。'),
      ...bank('aに関する解答群',data.q3[0]),
    ],
    [
      p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('プログラムの一部を複数の処理に分割して並列に実行するためには，プログラムの中から並列実行が可能な部分を抽出する必要がある。並列実行が可能なループの例を，図3に示す。図3は，このループに関してループを四つに分割し，分割したそれぞれのループの処理をスレッドとして並列実行する場合である。ここで，配列のデータはスレッド間で共有され，変数iはスレッドごとに確保されるものとする。'),
      diagram(profiles.split,i,'図3　並列実行が可能なループの例'),
      p('プログラムの中から並列実行が可能な部分を抽出する場合，並列に実行してもデータの更新と参照の順序が変化しないことを保証する必要がある。図4に示すプログラム1〜3を，iのループに関して複数のループに分割し，分割したそれぞれのループの処理を並列に実行する場合の並列実行可能性について考える。ここで，配列は十分に大きいものとする。'+
        (i===0?'':' 図4ではnを6以上の整数，mを整数とし，0以下を含めて実際に参照する添字は配列の有効範囲にあるものとする。')),
      p('プログラム1は，ループの中で［b］，並列実行できない。プログラム2は，ループの中で［c］，並列実行できない。プログラム3は，mの値が不明の場合には並列実行できないが，［d］であることが保証されていれば並列実行は可能である。'),
    ],
    [
      diagram(profiles.dependence,i,'図4　ループのプログラム1〜3'),
      ...bank('b，cに関する解答群',data.q3[1]),...bank('dに関する解答群',conditions(i)),
    ],
    [
      p('設問3　図5に示すプログラム4は，配列aで更新する要素を示すインデックスの値が配列ipで間接に決定される。この配列aのような更新を含むプログラムは，配列ipの値によっては並列実行できない場合があるので注意が必要である。プログラム4を，図5のようにiのループに関して複数のループに分割し，分割したそれぞれのループの処理をスレッドで並列実行するとき，並列実行可能なip[i]（i＝1，2，…，20）の値として適切な答えを，解答群の中から選べ。'),
      diagram(profiles.indirect,i,'図5　プログラム4の並列実行'),
      diagram(profiles.indices,[i,0],'解答群'),
    ],
  ];
}

export const legacy2014SpringPm3Definition=define(3,'プログラムの並列実行','設問1 a=オ、設問2 b=ア・c=ウ・d=イ、設問3=イ',
  '並列部分の割合・速度目標・ループと各スレッドの範囲',parallelCases.length,
  'CPUの必要数を計算し、配列の参照・更新の順序と、分割したスレッド間の書込み先を比較します。',
  '物理p16〜20、印刷p15〜19。図5は4スレッド、20入力と4候補。同じスレッド内の重複は実行順を崩さず、異なるスレッド間の書込み競合を区別。',i=>{
    const c=parallelCases[i], serial=c.duration[0]+c.duration[2], parallel=c.duration[1];
    const cpu=data.q3[0].findIndex(v=>100*Number(v)>=c.target*(serial*Number(v)+parallel));
    const index=parallelIndexRows(i), safe=index.findIndex(row=>canWriteTogether(row,c.groups));
    return {
      prompt:spring2014Pm3Pages(i).flat(),
      ...answers([strings(data.q3[0]),strings(data.q3[1]),strings(conditions(i)),index.map((_,j)=>[diagram(profiles.indices,[i,j+1],'ipの値')])],[
        single('a','設問1 a',0,cpu),single('b','設問2 b',1,c.reverse?2:0),single('c','設問2 c',1,c.reverse?0:2),
        single('d','設問2 d',2,1),single('3','設問3',3,safe),
      ]),
      explanation:'設問1：処理時間を100として，CPUがn個のときの時間は'+serial+'＋'+parallel+'／n。これが100／'+c.target+
        '以下になる最小の整数nは'+data.q3[0][cpu]+'。\n設問2：a[i−1]は直前の繰返しが書いた値を読む。a[i+1]は次の繰返しが上書きする前の値を読む。'+
        'プログラム3の書込み先は1〜'+c.extent+'なので，m≧'+c.extent+'なら参照先はこの範囲から外れる。ほかの条件は範囲の重なるmを含む。\n'+
        '設問3：ipをスレッドごとに区切り，同じ値が異なる区間に現れるか確認する。'+marks[safe]+'だけ，異なるスレッドの書込み先が重ならない。',
    };
  });
