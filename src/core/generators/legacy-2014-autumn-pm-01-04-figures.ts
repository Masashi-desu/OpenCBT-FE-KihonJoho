import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { bookRelations, excitationRows, jkCases, networkCases, processNames, processSteps, readyRows, routerLines, schedules } from './legacy-2014-autumn-pm-01-04-models';

const prefix='legacy-2014-autumn-pm-';
export const autumn2014Pm0104Profiles={
  network:prefix+'1-network',router:prefix+'1-router-rules',
  symbol:prefix+'2-jk-symbol',edge:prefix+'2-edge-wave',feedback:prefix+'2-feedback',counter:prefix+'2-counter-wave',example:prefix+'2-counter-example',excitation:prefix+'2-excitation-table',
  fifo:prefix+'3-arrival-queue',roundRobin:prefix+'3-round-robin-queue',states:prefix+'3-process-states',steps:prefix+'3-process-steps',timeline:prefix+'3-timeline',
  oldBooks:prefix+'4-old-books',newBooks:prefix+'4-new-books',
} as const;
const f=autumn2014Pm0104Profiles;
const wires=(j:string,k:string)=>'Jの入力は'+j+'、Kの入力は'+k+'。Q̅はQの反転出力。';
const bookAlt=(i:number,modern:boolean)=>bookRelations(i,modern).map(t=>
  t.name+'。主キーは下線の'+t.columns[t.primary]+'。列は'+t.columns.join('、')+'。'+t.rows.map(row=>row.join('、')+'。').join(''),
).join('\n');
export function autumn2014Pm0104Alt(profile:string,i:number):string{
  switch(profile){
    case f.network:{
      const n=networkCases[i];
      return 'ルータのif0はインターネット、if1はDMZ、if2はLANに接続する。DMZにはWebサーバ（'+n.web+'）とメールサーバ（'+n.mail+'）。LANにはメールマガジン送信サーバ（'+n.mag+'）、会員管理サーバ（'+n.member+'）、業務用PC1（192.168.0.4）から業務用PC100（192.168.0.103）。括弧内はIPアドレス。if0、if1、if2はルータのネットワークインタフェース。';
    }
    case f.router:return '設定9行。\n'+routerLines(i).join('\n');
    case f.symbol:return '矩形の左に上から入力J、CLK、K、右に上から出力QとQ̅（Qの否定）。';
    case f.edge:return '横軸は時間。CLKは0から1、0、1の順。最初の立上がりから次の立上がりまでが1周期。Qは1で始まり、最初のCLKの立下がりで0に変わる例。';
    case f.feedback:return wires(...jkCases[i].feedback)+'CLKには0で始まり、1のパルス4回のクロック信号を入力する。';
    case f.excitation:return '左からJ₁、K₁、Q₁→Q₂。' + excitationRows.map(([j,k,state])=>
      (k?j+'、'+k:j+'はJ₁とK₁にまたがる一つの空欄')+'、'+state+'。').join('')+'任意は0又は1のいずれもあり得る。';
    case f.counter:return '横軸は時間。CLKは0で始まり、1のパルス4回。立下がりから次の立下がりまで1周期。Qは0で始まり、各立下がりで1、0、1、0の順に変化する。';
    case f.example:return 'JKフリップフロップ1個の結線例。'+wires(...jkCases[i].example)+'CLKは左から入力。';
    case f.fifo:return '到着から登録の矢印、実行可能状態の待ち行列（○、省略記号、○、○）、取出しから実行状態の○へ矢印、そこから終了へ矢印。○はプロセス。';
    case f.roundRobin:return '到着から登録、実行可能状態の待ち行列から取出し、実行状態、終了へ矢印。実行から中断して登録位置へ戻る別の矢印。○はプロセス。';
    case f.states:return '生成から実行可能、実行から終了は破線。実線(a)は実行可能から実行、(b)は実行から実行可能、(c)は実行から待ち、(d)は待ちから実行可能。';
    case f.steps:return processSteps(i).map((s,j)=>'①②③④⑤'[j]+' '+s.name).join('→')+'。';
    case f.timeline:return '横軸はミリ秒、30、60、90、120、150、180、210、240に目盛。○は10ミリ秒の実行、－は10ミリ秒の実行可能。90ミリ秒まで記入。'+
      readyRows(i).map((row,j)=>processNames[j]+'：'+row.slice(0,9).map(x=>x||'空欄').join('、')+'。').join('');
    case f.oldBooks:return bookAlt(i,false);
    case f.newBooks:return bookAlt(i,true);
    default:throw Error('FIGURE_PROFILE');
  }
}
const ranges:Record<string,number>={
  [f.network]:networkCases.length-1,[f.router]:networkCases.length-1,[f.feedback]:jkCases.length-1,[f.example]:jkCases.length-1,
  [f.steps]:schedules.length-1,[f.timeline]:schedules.length-1,[f.oldBooks]:2,[f.newBooks]:2,
};
export const legacy2014AutumnPm0104Figures:BookletFigureDefinition[]=Object.values(f).map(profile=>({
  profile,domain:[[0,ranges[profile]??0]],
  validate(values){
    if(values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>(ranges[profile]??0))throw Error('FIGURE_DOMAIN');
  },
  alt:([i])=>autumn2014Pm0104Alt(profile,i),
}));
export function autumn2014Pm0104Diagram(profile:string,index:number,caption:string){
  const d=legacy2014AutumnPm0104Figures.find(f=>f.profile===profile);
  if(!d)throw Error('FIGURE_PROFILE');
  d.validate([index]);
  return figure(profile,[index],caption,d.alt([index]));
}
