import { p,strings,table } from './definition';
import { finite,original } from './legacy-2008-autumn-am-27-53-shared';
import { branchOperators,drawing,scheduleCases,systemObservations } from './legacy-2008-autumn-am-27-53-figures';

const pagingCases=[
  {rule:'',victim:''},
  {rule:'ページ枠にはP，Q，Rがあり，全て変更済みである。最後に参照した順は古い方からQ，R，Pであり，LRU方式で置き換える。',victim:'Q'},
  {rule:'ページ枠にはP，Q，Rがあり，全て変更済みである。ページを読み込んだ順は古い方からR，P，Qであり，FIFO方式で置き換える。',victim:'R'},
  {rule:'ページ枠にはP，Q，Rがあり，全て変更済みである。参照回数はPが2回，Qが5回，Rが3回であり，参照回数が最も少ないページを置き換える。',victim:'P'},
] as const;
const paging=finite(27,'ページ置換えの規則と常駐ページの記録',
  '空き枠なしの前提、4段階・4択、障害から入出力への方向を保持。LRU、FIFO、参照頻度から書き出すページを変える。',index=>{
    const source=original(27),{rule,victim}=pagingCases[index];
    const prompt=index===0?source.prompt:source.prompt+' '+rule;
    const choices=index===0?source.choices:source.choices.map(choice=>choice.replaceAll('置換え対象ページの決定','置換え対象を'+victim+'に決定')
      .replaceAll('ページアウト',victim+'をページアウト'));
    if(index!==0) {
      const wrong=['P','Q','R'].find(page=>page!==victim)!;
      choices[3]=choices[2].replaceAll(victim+'に決定',wrong+'に決定').replaceAll(victim+'をページアウト',wrong+'をページアウト');
    }
    return {prompt:[p(prompt)],choices:strings(choices),correctIndex:2,explanation:
      '参照したページが主記憶にないため，最初にページフォールトが発生する。空き枠がないので置換え対象'+
      (victim?'（この規則で選ばれる'+victim+'）':'')+'を決定する。対象をページアウトして空いた枠に，要求されたページをページインする。'};
  });

const taskCases=[
  {from:'実行状態',to:'実行可能状態',slot:0},
  {from:'外部',to:'実行可能状態',slot:1},
  {from:'待ち状態',to:'実行可能状態',slot:2},
  {from:'実行状態',to:'待ち状態',slot:3},
] as const;
const transition=finite(29,'タスク状態遷移の対象矢印','同一の状態・6矢印・四つのイベントを保持し、問う矢印の始点と終点を変更。',index=>{
  const source=original(29),{from,to,slot}=taskCases[index];
  const stem=index===0?source.prompt:'図はマルチタスクで動作するコンピュータにおけるタスクの状態遷移を表したものである。'+
    (from==='外部'?'どの状態にもまだ属していないタスクが':from+'のタスクが')+to+'に遷移するのはどれか。';
  return {prompt:[p(stem),drawing('29-state',index)],choices:strings(source.choices),correctIndex:slot,
    explanation:source.choices[slot]+' このとき図の「'+from+' → '+to+'」が起こる。'};
});

const roundRobinCases=[
  {times:[5,10,15],target:1,choices:[15,20,25,30]},
  {times:[18,6,12],target:0,choices:[18,24,30,36]},
  {times:[12,18,6],target:2,choices:[12,18,24,36]},
  {times:[4,16,12],target:2,choices:[16,24,28,32]},
] as const;
const jobs=['A','B','C'];
const schedulingRules=[
  '〔スケジューリング方式〕',
  '(1) 一定時間（これをタイムクウォンタムと呼ぶ）内に処理が終了しなければ，処理を中断させて，待ち行列の最後尾へ回す。',
  '(2) 待ち行列に並んだ順に実行する。',
  '(3) タイムクウォンタムは，ジョブの処理時間に比べて十分に小さい値とする。',
  '(4) ジョブの切替え時間は考慮しないものとする。',
];
const roundRobin=finite(32,'各ジョブの処理時間と完了を観測するジョブ',
  'CPU処理のみ、量子が十分短い、切替え時間無視、三つのジョブ、昇順4択を保持。待ち行列の端数は近似として扱う。',index=>{
    const {times,target,choices}=roundRobinCases[index];
    const targetTime=times[target],contributions=times.map(time=>Math.min(time,targetTime));
    const correct=contributions.reduce((sum,time)=>sum+time,0);
    const stem=index===0?original(32).prompt:'処理はすべてCPU処理である三つのジョブA，B，Cがある。単独で実行したときの処理時間は，'+
      jobs.map((job,i)=>'ジョブ'+job+'が'+times[i]+'分').join('，')+'である。この三つのジョブを次のスケジューリング方式に基づいて同時に実行すると，ジョブ'+
      jobs[target]+'が終了するまでの経過時間はおよそ何分か。';
    return {prompt:[p(stem),...schedulingRules.map(p)],choices:strings(choices.map(String)),correctIndex:choices.findIndex(choice=>choice===correct),
      explanation:'タイムクウォンタムが十分に短いので，終了していないジョブはほぼ均等にCPU時間を得る。ジョブ'+jobs[target]+'が'+targetTime+
        '分のCPU時間を使うまでに，他の各ジョブは自分の必要時間と'+targetTime+'分の小さい方を使う。合計 '+contributions.join('＋')+'＝'+correct+'分である。'};
  });

const mean=(symbols:string[])=>'('+symbols.join('＋')+')/'+symbols.length;
const uptime=finite(34,'観測範囲内で完了した稼働区間と修理区間',
  '故障と復旧の波形、MTBF・MTTRの式の表、四つの式の役割を保持。観測終了時点の差と修理から観測を始める条件で有効区間が変わる。',index=>{
    const {prompt}=original(34);
    const complete=systemObservations[index].filter(([, ,completed])=>completed);
    const runs=complete.filter(([kind])=>kind==='稼働').map(([,label])=>label);
    const repairs=complete.filter(([kind])=>kind==='修理').map(([,label])=>label);
    const t=index===0?'(Σᵢ₌₁ⁿ tᵢ)/n':mean(runs);
    const r=index===0?'(Σᵢ₌₁ⁿ rᵢ)/n':mean(repairs);
    const cycle=index===0?'(Σᵢ₌₁ⁿ (tᵢ＋rᵢ))/n':'('+[...runs,...repairs].join('＋')+')/'+repairs.length;
    return {prompt:[p(index===0?prompt:'システムの稼働モデルが図のように表されるとき，システムのMTBFとMTTRを表した式はどれか。'+
      'ここで，tᵢはシステムの稼働時間，rᵢは修理時間を表す。いずれも観測中に開始し，終了までを確認した区間の算術平均で求め，途中の区間は含めない。'),
      drawing('34-uptime',index)],choices:[[r,t],[t,r],[t,cycle],[cycle,r]].map(row=>[table('MTBFとMTTRの式',['MTBF','MTTR'],[row])]),
      correctIndex:1,explanation:'MTBFは故障と故障の間のうち稼働した時間の平均，MTTRは修理に要した時間の平均である。'+
        (index===0?'稼働時間 tᵢ の平均と，修理時間 rᵢ の平均を別々に取る。':
          '完了した稼働区間は'+runs.length+'個，修理区間は'+repairs.length+'個なので，各時間の和をそれぞれの区間数で割る。')};
  });

const bugCases=[
  {native:48,planted:22,found:16,choices:[6,10,18,22]},
  {native:30,planted:24,found:12,choices:[12,18,24,30]},
  {native:63,planted:28,found:21,choices:[7,14,21,28]},
  {native:60,planted:35,found:20,choices:[15,30,35,45]},
] as const;
const defects=finite(43,'ソフトウェアの発見済みバグ・総埋込み・発見済み埋込みの数',
  '二種類の発見数の比例、残存数、整数4択を保持。基準の48個は公式解答・比例の記述から元来のバグを指す。改変時はこれを明示。',index=>{
    const {native,planted,found,choices}=bugCases[index],remaining=native*(planted-found)/found;
    const stem=index===0?original(43).prompt:'バグ埋込み法によってソフトウェア内に残存するバグを推定する。テストによって現在までに発見されたソフトウェア固有のバグは'+
      native+'個であり，総埋込みバグ'+planted+'個のうち，テストによって発見されたものは'+found+'個であった。あと幾つのバグが潜在していると推定されるか。'+
      'ここで，埋込みバグの発見数とソフトウェアのバグの発見数は比例するものとする。';
    return {prompt:[p(stem)],choices:strings(choices.map(String)),correctIndex:choices.findIndex(choice=>choice===remaining),
      explanation:'発見済みの元来のバグと埋込みバグの比は '+native+'：'+found+'。未発見の埋込みバグは '+planted+'−'+found+'＝'+(planted-found)+
        '個なので，未発見の元来のバグは '+(planted-found)+'×'+native+'÷'+found+'＝'+remaining+'個と推定できる。'};
  });

const branchChoices=[
  [[1],[1,2],[0,3],[1,2,3]],
  [[1],[2,3],[0,2],[0,1,2]],
  [[3],[1,2],[0,3],[1,2,3]],
  [[0],[0,2],[1,3],[0,1,3]],
] as const;
const combinations=[[false,false],[false,true],[true,false],[true,true]] as const;
const decisions=[
  (a:boolean,b:boolean)=>a||b,(a:boolean,b:boolean)=>a&&b,
  (a:boolean,b:boolean)=>a!==b,(a:boolean,b:boolean)=>a&&!b,
];
const coverage=finite(44,'図の論理式と各テストケースの入力',
  '真で命令、偽で迂回する図、判定の両方を通る条件、4択のA/B表と各行数を維持。OR、AND、XOR、A AND NOT Bを比較。',index=>{
    const groups=branchChoices[index];
    const evaluate=(row:number)=>{
      const [a,b]=combinations[row];
      return decisions[index](a,b);
    };
    const accepted=groups.findIndex(rows=>new Set(rows.map(evaluate)).size===2);
    const choices=groups.map(rows=>[table('テストケース',['A','B'],rows.map(row=>combinations[row].map(value=>value?'真':'偽')))]);
    const results=groups[accepted].map(row=>evaluate(row)?'真':'偽');
    return {prompt:[p(original(44).prompt),drawing('44-branch',index)],choices,correctIndex:accepted,
      explanation:'判定条件網羅では，判定式全体の結果が真になる経路と偽になる経路を両方実行する。'+branchOperators[index]+
        ' に対し正答の各行を入力すると，順に '+results.join('，')+' になる。ほかの候補では片方しか実行できない。'};
  });

const staffing=finite(46,'工数・期間と工程別の配分',
  '工程4列と配分2行、工程中の人数一定、単位、人員数の昇順4択を維持。工数÷期間が各工程で整数となるよう選定。',index=>{
    const {duration,effort,work,time,choices}=scheduleCases[index];
    const headcount=work.map((portion,i)=>effort*portion/(duration*time[i]));
    const peak=Math.max(...headcount);
    const stem=index===0?original(46).prompt:'開発期間'+duration+'か月，開発工数'+effort+
      '人月のプロジェクトを計画する。次の配分表を前提とすると，ピーク時の要員は何人となるか。ここで，各工程の開始から終了までの人数は変わらないものとする。';
    return {prompt:[p(stem),drawing('46-allocation',index)],choices:strings(choices.map(String)),correctIndex:choices.findIndex(choice=>choice===peak),
      explanation:'工程ごとに，総工数×工数配分を総期間×期間配分で割る。要件定義，設計，開発・テスト，システムテストの人数は順に'+
        headcount.join('，')+'人なので，ピーク時の要員は'+peak+'人である。'};
  });

const idCases=[
  {pattern:'XXNNN',example:'AZ059',letters:26,range:'A～Z',counts:[317000,383000,447000,512000]},
  {pattern:'XNNNN',example:'J2059',letters:26,range:'A～Z',counts:[96000,134000,172000,210000]},
  {pattern:'XXXNN',example:'ABE59',letters:26,range:'A～Z',counts:[820000,970000,1120000,1270000]},
  {pattern:'XXNNN',example:'AM059',letters:13,range:'A～M',counts:[96000,116000,136000,156000]},
] as const;
const showCount=(value:number)=>value.toLocaleString('en-US');
const identifiers=finite(49,'ID文字数・使用可能文字・発行数の推移',
  '二種の文字、欠番再利用なし、年度累計表、4年度の昇順選択を保持。履歴の増分は原題同様に一定又はほぼ一定。',index=>{
    const {pattern,example,letters,range,counts}=idCases[index];
    const x=pattern.split('X').length-1;
    const capacity=letters**x*10**(pattern.length-x);
    const rate=(counts[3]-counts[0])/3;
    const years=Math.ceil((capacity-counts[3])/rate);
    return {prompt:[p(original(49).prompt),p('〔IDの形式〕'),p(pattern+'（例：'+example+' など）'),
      p('・Xには英大文字（'+range+'の'+letters+'文字）を設定する。'),p('・Nには数字（0～9の10文字）を設定する。'),
      table('〔各年度末における発行済ID数の推移〕',['年度','2004','2005','2006','2007'],[['発行済ID数（累積）',...counts.map(showCount)]])],
      choices:strings(original(49).choices),correctIndex:years-1,
      explanation:'IDは位置ごとの候補数を掛けるので '+letters+'の'+x+'乗×10の'+(pattern.length-x)+'乗＝'+showCount(capacity)+
        '通り。年平均で約'+showCount(rate)+'件増える。2007年度末から'+years+'年目の'+(2007+years)+'年度に枯渇する。脱会分は再利用しない。'};
  });

const networks=[
  {base:[192,168,0,0],mask:[255,255,255,0],shorter:16,printed:'192.168.0.x'},
  {base:[192,168,7,77],mask:[255,255,255,192],shorter:24,printed:'192.168.7.77'},
  {base:[172,16,8,109],mask:[255,255,255,224],shorter:24,printed:'172.16.8.109'},
  {base:[10,11,5,37],mask:[255,255,254,0],shorter:16,printed:'10.11.5.37'},
] as const;
const broadcast=finite(50,'IPアドレスとサブネットマスク',
  'アドレスとマスクからブロードキャストを求める問い、ネットワークアドレスと誤った広いマスクに基づく4択を保持。',index=>{
    const {base,mask,shorter,printed}=networks[index];
    const network=base.map((byte,i)=>byte&mask[i]);
    const bc=network.map((byte,i)=>byte|(255^mask[i]));
    const broad=base.map((byte,i)=>i<shorter/8?byte:255);
    const fourth=bc.join('.');
    const choices=[network.join('.'),fourth,[...broad.slice(0,3),0].join('.'),broad.join('.')];
    return {prompt:[p(index===0?original(50).prompt:'IPアドレスが'+printed+'で，サブネットマスクが'+mask.join('.')+
      'のTCP/IPネットワークで，ブロードキャストアドレスはどれか。')],choices:strings(choices),correctIndex:1,
      explanation:'マスクとのビットごとのANDでネットワークアドレス '+network.join('.')+' を得る。ネットワーク部はそのまま，ホスト部を全て1にすると '+fourth+' になる。'};
  });

export const calculationDefinitions=[paging,transition,roundRobin,uptime,defects,coverage,staffing,identifiers,broadcast];
