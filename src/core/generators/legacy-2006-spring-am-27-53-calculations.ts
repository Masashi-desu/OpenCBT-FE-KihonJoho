import { code,p,strings } from './definition';
import { finite,original } from './legacy-2006-spring-am-27-53-shared';

const fifo=finite(27,'ページ参照順','初期空の3枠で7回参照。スロット格納順、参照ヒットとページインの混同、最後の置換を見落とす誤答を区別する。',index=>{
  const sequences=[[4,3,2,1,3,5,2],[4,2,3,2,3,4,2],[1,2,3,4,2,5,3],[3,1,4,2,1,5,3]];
  const sequence=sequences[index];
  const resident:number[]=[],events:number[]=[];
  for(const page of sequence) {
    if(resident.includes(page)) continue;
    if(resident.length===3) resident.shift();
    resident.push(page);events.push(page);
  }
  const options=index?['3','4','5','6']:original(27).choices;
  return {prompt:[p(original(27).prompt.replace('4→3→2→1→3→5→2',sequence.join('→')))],choices:strings(options),
    correctIndex:options.indexOf(String(events.length)),explanation:'初めて読み込むときにページインする。FIFOでは格納期間の最も長いページから追い出すので，ヒットしても順序は変わらない。ページインは '+events.join('→')+' の '+events.length+' 回。'};
});

const amount=(value:number)=>value.toLocaleString('en-US');
const spool=finite(29,'ジョブの実行時間・ファイル容量・印刷速度','4回連続、多重度1、確保の時点、実行後の印刷、削除の所要なし、1台、並行実行を保持。容量は1〜4ファイルの整数倍を昇順で示す。',index=>{
  const cases=[[20,400,10],[20,200,10],[15,600,10],[25,300,5]];
  const [runtime,size,per100]=cases[index], print=size/100*per100;
  const jobCount=4, starts=Array.from({length:jobCount},(_,i)=>i*runtime);
  const ends:number[]=[];
  for(const t of starts) ends.push(Math.max(t+runtime,ends.at(-1)??0)+print);
  const held=starts.map((t,i)=>ends.slice(0,i).filter(end=>end>t).length+1);
  const peak=Math.max(...held);
  return {prompt:[p(original(29).prompt),p('〔条件〕'),
    p('（1）同一のジョブを4回連続して，多重度1で実行する。'),
    p('（2）ジョブの単独での実行時間は'+runtime+'分である。'),
    p('（3）単独でのジョブは，実行時に'+size+' M バイトの印刷用スプールファイルを確保し，そこに印刷データを出力する。'),
    p('（4）ジョブ実行後，スプールファイルの内容が OS の印刷機能によって処理される。'),
    p('（5）印刷が完了すると，OS はスプールファイルを削除する。ここで，削除時間は考慮しないものとする。'),
    p('（6）プリンタは1台であり，印刷速度は100 M バイト当たり'+per100+'分である。'),
    p('（7）ジョブの実行と印刷処理は並行動作可能で，互いに影響を及ぼさないものとする。')],
    choices:strings(Array.from({length:jobCount},(_,i)=>amount((i+1)*size))),correctIndex:peak-1,
    explanation:'各ジョブは開始時から印刷終了まで領域を使う。印刷は1件 '+print+' 分で，先に用意できたものから印刷すると，各削除時刻は開始後 '+ends.join('，')+' 分。削除と新規確保が同時なら削除後に確保できるので，各ジョブ開始直後の保有数は '+held.join('，')+'。最大の '+peak+' ファイルに '+amount(size*peak)+' M バイト必要になる。'};
});

const quadruples=[
  {sets:[['＊','B','C','T₁'],['／','T₁','D','T₂'],['＋','A','T₂','T₃']],options:original(37).choices,correctIndex:0,explain:'B＊C を一時変数 T₁ に置き，その値を D で割った値を T₂ とする。最後に A を足す。'},
  {sets:[['＋','A','B','T₁'],['＊','T₁','C','T₂'],['－','T₂','D','T₃']],options:['A＋B＊C－D','（A＋B）＊C－D','A＊B＋C－D','（A＋B）＊T₂－D'],correctIndex:1,explain:'A＋B を一時変数 T₁ に置くため，C を掛ける相手は B だけでなく A＋B 全体である。最後に D を引く。'},
  {sets:[['－','B','C','T₁'],['／','A','T₁','T₂'],['＋','T₂','D','T₃']],options:['A／B－C＋D','（A／B－C）＋T₂','A／（B－C）＋D','（A／B）／C＋D'],correctIndex:2,explain:'B－C を T₁ に置き，A を T₁ で割る。最後に D を足す。'},
  {sets:[['＊','A','B','T₁'],['＋','C','D','T₂'],['－','T₁','T₂','T₃']],options:['A＊B－C＋D','A＊（B－C）＋D','A＊B－T₁＋D','A＊B－（C＋D）'],correctIndex:3,explain:'A＊B と C＋D をそれぞれ T₁ と T₂ に置き，前者から後者を引く。'},
];
const expressions=finite(37,'四つ組の演算子と被演算子','4項と3行の一時変数を保持。括弧忘れ、演算と順番の取り違え、一時変数残存を誤答に使う。',index=>{
  const {sets,options,correctIndex,explain}=quadruples[index];
  return {prompt:[p(original(37).prompt),p('（演算子，被演算子1，被演算子2，結果）'),
    p('この形式は，被演算子1と被演算子2に演算子を作用させたものが結果であることを表す。次の一連の四つ組は，どの式を構文解析した結果か。ここで，T₁，T₂，T₃ は一時変数を表す。'),
    code(sets.map(row=>'（'+row.join('，')+'）').join('\n'),'text')],choices:strings(options),correctIndex,explanation:explain};
});
export const calculationDefinitions=[fifo,spool,expressions];
