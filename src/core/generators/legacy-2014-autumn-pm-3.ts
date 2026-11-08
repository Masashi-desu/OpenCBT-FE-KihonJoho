import { p, strings, table } from './definition';
import allBanks from './legacy-2014-autumn-pm-01-04-banks.json';
import { answers, bank, define, marks, single } from './legacy-2014-autumn-pm-01-04-shared';
import { autumn2014Pm0104Diagram as diagram, autumn2014Pm0104Profiles as f } from './legacy-2014-autumn-pm-01-04-figures';
import { processNames, processSteps, schedules, shortestRemaining } from './legacy-2014-autumn-pm-01-04-models';

const choices=allBanks[2] as {transitions:number[][];queue:string[];time:number[]};
const tuple=(values:readonly number[])=>values.join('，');
function queueAtD(i:number){
  const {arrivals,lengths,quantum}=schedules[i];
  const queue:number[]=[], remaining:number[]=[...lengths], history:string[]=[];
  let next=0,time=0;
  for(let attempts=0;attempts<30;attempts++){
    while(next<4&&arrivals[next]<=time)queue.push(next++);
    const chosen=queue.shift();
    if(chosen===undefined)throw Error('PARAMETER_CONSTRAINT');
    if(chosen===3)return {time,queue:queue.map(j=>processNames[j]).join(', '),history};
    const slice=Math.min(remaining[chosen],quantum);
    const finish=time+slice;
    while(next<4&&arrivals[next]<finish)queue.push(next++);
    if(next<4&&arrivals[next]===finish)throw Error('PARAMETER_CONSTRAINT');
    history.push(processNames[chosen]+' '+time+'〜'+finish);
    remaining[chosen]-=slice;time=finish;
    if(remaining[chosen]>0)queue.push(chosen);
  }
  throw Error('PARAMETER_CONSTRAINT');
}
function cases(i:number){
  const ioCount=processSteps(i).filter(s=>s.io).length, totalDispatches=ioCount+1;
  const transitions=choices.transitions.map(row=>[totalDispatches,...row.slice(1)]);
  const srt=shortestRemaining(i);
  const time=i===0?choices.time:[...new Set([...srt.turnaround.slice(0,3),...schedules[i].lengths,srt.finish[1],srt.finish[2]])]
    .slice(0,7).sort((a,b)=>a-b);
  if(time.length!==7)throw Error('PARAMETER_CONSTRAINT');
  return {transitions,ioCount,totalDispatches,srt,time};
}

export function autumn2014Pm3Pages(i:number){
  const sched=schedules[i], options=cases(i);
  return [
    [
      p('問3　OSにおけるプロセスのスケジューリングに関する次の記述を読んで，設問1〜3に答えよ。'),
      p('OSの役割の一つとして，プロセスにCPUを割り当てることがある。そして，プロセスにCPUを割り当てる順序（以下，実行順序という）を決定する方式には，次のようなものがある。ここで，プロセスが実行されるコンピュータのCPUは一つであり，CPUは同時に一つのプロセスしか実行できない。'),
      p('(1) 到着順方式'),
      p('プロセスを到着順に待ち行列の末尾に登録する。実行中のプロセスが終了すると，待ち行列の先頭からプロセスを一つ取り出してCPUを割り当て，実行を開始する。到着順方式を図1に示す。待ち行列に登録されているプロセスの状態を実行可能状態，実行中のプロセスの状態を実行状態と呼ぶ。'),
      diagram(f.fifo,0,'図1　到着順方式'),
      p('(2) ラウンドロビン方式'),
      p('プロセスを到着順に待ち行列の末尾に登録する。実行中のプロセスが終了すると，待ち行列の先頭からプロセスを一つ取り出してCPUを割り当て，実行を開始する。また，プロセスの実行中に一定時間（以下，タイムクウォンタムという）が経過したら，実行を中断して，待ち行列の末尾に再登録する。そして，待ち行列の先頭からプロセスを一つ取り出してCPUを割り当て，実行を開始する。ラウンドロビン方式を図2に示す。'),
      diagram(f.roundRobin,0,'図2　ラウンドロビン方式'),
    ],
    [
      p('設問1　プロセスXを到着順方式で実行した場合のプロセスの状態の遷移について考える。プロセスの状態の遷移を図3に示す。図3において，(a)〜(d)の矢印は状態の遷移を示す。プロセスXの処理順序が図4に示す①〜⑤の場合，図3に示す(a)〜(d)の各遷移の発生する回数の組合せとして正しい答えを，解答群の中から選べ。'),
      p('なお，プロセスの実行中にデータの入出力が発生した場合，その実行を中断して待ち状態となり，データの入出力が完了したら実行可能状態となる。ここで，待ち状態のプロセスにはCPUを割り当てないものとする。'),
      diagram(f.states,0,'図3　プロセスの状態の遷移'),
      diagram(f.steps,i,'図4　プロセスXの処理順序'),
    ],
    [
      table('解答群',['記号','(a)','(b)','(c)','(d)'],options.transitions.map((row,j)=>[marks[j],...row.map(String)])),
      p('設問2　ラウンドロビン方式についての，次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('四つのプロセスA〜Dがあり，各プロセスの到着時刻と処理時間を表1に示す。表1において，到着時刻とは，プロセスAが到着して最初に待ち行列に登録された時刻からプロセスB〜Dが到着して最初に待ち行列に登録されるまでの経過時間である。処理時間とは，各プロセスの処理が完了するために必要なCPUの割当時間である。'),
      table('表1　プロセスの到着時刻と処理時間',['プロセス名','到着時刻（ミリ秒）','処理時間（ミリ秒）'],
        processNames.map((name,j)=>[name,String(sched.arrivals[j]),String(sched.lengths[j])])),
      p('タイムクウォンタムが'+sched.quantum+'ミリ秒の場合，プロセスDが最初に実行状態になったときには，待ち行列の先頭から［設問2］の順にプロセスが登録されている。ここで，プロセスAが最初に待ち行列に登録されたとき，実行可能状態，実行状態及び待ち状態にあるプロセスはないものとし，プロセスA〜Dは，実行中にタイムクウォンタムの経過以外で中断することはないものとする。'),
    ],
    [
      p('なお，プロセスの登録と取出し，及び中断の処理に掛かる時間は考えないものとする。'),
      ...bank('解答群',choices.queue),
      p('設問3　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('プロセスの実行順序を決定する別の方式に残余処理時間順方式がある。残余処理時間順方式は，一定の時間ごとに実行状態と実行可能状態にあるプロセスの残余処理時間を比較し，その時間が最も短いプロセスにCPUを割り当てる方式である。ここで，残余処理時間とは，プロセスの残りの処理が完了するまでに必要なCPUの割当時間である。'),
      p('表1に示すプロセスA〜Dを，残余処理時間順方式で実行した場合のターンアラウンドタイムについて考える。ターンアラウンドタイムとは，プロセスが最初に待ち行列に登録されてから処理が完了するまでの時間である。'),
      p('プロセスAが登録されてから10ミリ秒ごとに残余処理時間を比較しながら実行したとき，プロセスA，B，Cのターンアラウンドタイムはそれぞれ［a］ミリ秒，［b］ミリ秒，［c］ミリ秒である。図5には，プロセスAが登録されてから90ミリ秒までのプロセスの状態の遷移を記入してある。ここで，プロセスAが最初に待ち行列に登録されたとき，実行可能状態，実行状態及び待ち状態にあるプロセスはないものとし，プロセスA〜Dは，実行中に残余処理時間の比較結果以外で中断することはないものとする。また，プロセスが到着して待ち行列に登録された時点で，残余処理時間の比較対象となっているものとする。'),
      p('なお，プロセスの登録，取出しと中断の処理，及び残余処理時間の比較処理に掛かる時間は考えないものとする。'),
    ],
    [
      diagram(f.timeline,i,'図5　残余処理時間順方式におけるプロセスの状態の遷移'),
      ...bank('a〜cに関する解答群',options.time),
    ],
  ];
}

export const legacy2014AutumnPm3Definition=define(3,'OSにおけるプロセスのスケジューリング',
  '設問1=ウ、設問2=イ、設問3 a=キ・b=カ・c=ウ','入出力手順・到着時刻・処理時間と量子',schedules.length,
  '入出力の手順とCPUの割当て条件を変え、状態遷移、待ち行列、ターンアラウンドタイムを求めます。',
  '印刷・物理p.15〜19。図1〜5、1CPU、量子・10ミリ秒比較、管理の時間無視を保持。到着と量子切れの同時、最短残余時間の同値は有限条件から除く。図5は最初の90ミリ秒だけ埋め、解答の完了まで示さない。',
  i=>{
    const opts=cases(i), rr=queueAtD(i);
    const correct=opts.transitions.findIndex(row=>tuple(row)===tuple([opts.totalDispatches,0,opts.ioCount,opts.ioCount]));
    return {
      prompt:autumn2014Pm3Pages(i).flat(),
      ...answers([opts.transitions.map(tuple),choices.queue,opts.time.map(String)].map(strings),[
        single('s1','設問1',0,correct),single('s2','設問2',1,choices.queue.indexOf(rr.queue)),
        ...['a','b','c'].map((x,j)=>single(x,'設問3 '+x,2,opts.time.indexOf(opts.srt.turnaround[j]))),
      ]),
      explanation:'設問1：開始時の割当てに加え、各入出力の完了後に再割当てするので(a)は'+opts.totalDispatches+'回。入出力'+opts.ioCount+
        '回のそれぞれで(c)と(d)が1回ずつ起こる。到着順では量子の経過による(b)はない。\n'+
        '設問2：Dより前の実行区間（ミリ秒）は'+rr.history.join('、')+'。区間内に到着したプロセスを先に末尾へ入れ、未完了の実行プロセスを量子切れで再登録する。Dは'+rr.time+
        'ミリ秒で先頭から取り出され、残りは'+rr.queue+'の順。\n'+
        '設問3：10ミリ秒ごとに到着済みで未完了のものから残りが最小のプロセスを選ぶ。A〜Dの完了時刻は'+opts.srt.finish.join('，')+
        'ミリ秒。A・B・Cの各到着時刻を引くと'+opts.srt.turnaround.slice(0,3).join('，')+'ミリ秒になる。',
    };
  });
