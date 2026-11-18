import { p, table } from './definition';
import { body, define, formula, grouping, source, textBody } from './legacy-2004-autumn-am-01-26-shared';
import { draw } from './legacy-2004-autumn-am-01-26-figures';
import { hashCases, logicCases, stateColumns, transitions, tree } from './legacy-2004-autumn-am-01-26-models';

const pairs=(name:string,headers:string[],rows:readonly string[])=>rows.map(row=>[table(name,headers,[row.split('／')])]);
const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);
function fraction(n:number,d:number) {
  const divisor=gcd(n,d);
  return n/divisor+'/'+d/divisor;
}
function fractionalOptions(options:readonly string[]) {
  return options.map(option=>{
    const [n,d]=option.split('/');
    return [formula('\\frac{'+n+'}{'+d+'}',n+'/'+d)];
  });
}
const fractional=define(1,'変換する16進小数の三桁','16進小数を十進数の既約な分数へ直す。原題と同じ3桁・分数四択。桁の取り落としと誤った位置の重みを区別する。',i=>{
  const hex=['248','3A8','1C4','5D8'][i], digits=[...hex].map(d=>parseInt(d,16));
  const n=digits.reduce((total,digit)=>16*total+digit,0), value=fraction(n,16**3);
  const opts=i===0?source[1].choices:[
    fraction(n,16**4),fraction(n,16**3),fraction(digits[1]*16+digits[2],16**3),fraction(n,16**3*2),
  ];
  return body(source[1].prompt.replace('0.248','0.'+hex),fractionalOptions(opts),opts.indexOf(value),
    '小数点以下は16分の1、256分の1、4,096分の1の桁。分母を4,096にそろえると分子は'+
    digits[0]+'×256＋'+digits[1]+'×16＋'+digits[2]+'＝'+n+'なので，約分すると'+value+'。');
});

const stack=define(2,'符号なし固定小数点のビット幅','下位の16進の1桁、論理シフト方向、マスクの組、その繰返しを保持する。2～5桁の範囲で変更する。',i=>{
  const width=[16,8,12,20][i], count=width/4, symbols='x'.repeat(count);
  const fmt=(high:boolean)=>'n AND '+(high?'F'.repeat(count-1)+'0':'0'.repeat(count-1)+'F')+'₁₆';
  const opts=[fmt(false)+'／左に4ビット',fmt(false)+'／右に4ビット',fmt(true)+'／左に4ビット',fmt(true)+'／右に4ビット'];
  const prompt=source[2].prompt.replace('16ビット',width+'ビット').replace('4回',count+'回').replaceAll('xxxx',symbols);
  return body([p(prompt),...source[2].material.split(/(?=（\d）)/).map(p)],pairs('a・bの組合せ',['a','b'],opts),1,
    width+'ビットを下位から4ビットずつ、'+count+'回切り出す。'+fmt(false)+'で下位4ビットだけが残り，'+
    'xを積んだ後に右へ4ビットの論理シフトをすると，次の桁が下位に移る。');
},true);

const multiply=define(3,'十六進の小数4けたと整数倍率','十六進の小数4けたを整数倍し、4桁表記を保つ。桁ずらしと誤った倍率を比較する。',i=>{
  const [input,factor]=[['FEDC',4],['AF62',2],['B7ED',8],['7AC9',4]][i] as [string,number];
  const value=parseInt(input,16);
  const repr=(n:number)=>Math.floor(n/65536).toString(16).toUpperCase()+'.'+(n%65536).toString(16).toUpperCase().padStart(4,'0');
  const ordered=i===1?[factor/2,factor,factor+2,16]:[factor/2,factor+2,factor,16];
  const opts=i===0?source[3].choices:ordered.map(k=>repr(value*k));
  const result=repr(value*factor);
  return textBody(source[3].prompt.replace('FEDC',input).replace('4倍',factor+'倍'),opts,opts.indexOf(result),
    '0.'+input+'は16の4乗を分母として，分子は16進の'+input+'。分子を'+factor+'倍した結果は16進で'+
    (value*factor).toString(16).toUpperCase()+'なので，下から4けたを小数部にして'+result+'。');
});

const eventNotation='ここで，P(X)は事象Xが起こる確率を表し，X∪Y及びX∩Yはそれぞれ事象Xと事象Yの和事象及び積事象を表す。';
const probability=define(5,'二つの事象A・Bの関係と確率の式','独立、排反、包含、余事象関係を変え、同じ確率式選択を維持する。関係から常に成立する一式に限定。',i=>{
  const questions=[source[5].prompt,'事象Aと事象Bが排反であるときに常に成立する式はどれか。'+eventNotation,
    '事象Aが事象Bに含まれるときに常に成立する式はどれか。'+eventNotation,
    '事象Aと事象Bが互いに余事象であるときに常に成立する式はどれか。'+eventNotation];
  const choices=[source[5].choices,source[5].choices,
    ['P(A∩B)＝P(A)','P(A∩B)＝P(B)','P(A∪B)＝P(A)・P(B)','P(A∩B)＝P(A)＋P(B)'],
    ['P(A∪B)＝P(A)・P(B)','P(A∪B)＝P(A)','P(A∩B)＝1','P(A)＋P(B)＝1']][i];
  return textBody(questions[i],choices,[2,1,0,3][i],[
    '独立であれば，一方が起きても他方が起きる確率は変わらない。よって両方が起こる積事象の確率は，各事象の確率の積になる。',
    '排反ではAとBは同時に起こらない。和事象の確率を求めるとき，重なりを引く必要がないのでP(A)＋P(B)になる。',
    'Aが起きる場合は必ずBも起きるので，両方が起きる場合の集合はAそのもの。その確率もP(A)である。',
    '互いに余事象だから必ず、かつ一方だけが起きる。二つの確率の和は1。',
  ][i]);
});

const dice=define(6,'得点が出るさいころの目の範囲','1回の出目、得点0の扱い、期待値の分数4択を保持。生成版では各面の等確率を本文に示す。',i=>{
  const [lo,hi]=[[1,4],[1,3],[2,5],[4,6]][i];
  const count=hi-lo+1,sum=count*(lo+hi)/2, value=fraction(sum,6);
  const variants=[value,fraction(sum,count),fraction(21-sum,6),fraction(sum,5)];
  const opts=i===0?source[6].choices:variants.sort((a,b)=>{
    const [n,d]=a.split('/').map(Number),[m,e]=b.split('/').map(Number);
    return n*e-m*d;
  });
  const question='各面が等確率で出るさいころを投げて，出た目に応じて得点するゲームを行う。出た目が'+lo+'～'+hi+
    'の場合はその目を得点とし，それ以外の目の場合は得点はない。さいころを1回投げたときの得点の期待値は幾らか。';
  return body(i===0?source[6].prompt:question,fractionalOptions(opts),opts.indexOf(value),
    '六つの目は等確率1/6で得点は対象外で0。得点がある目の合計は'+sum+'なので，期待値は'+sum+'÷6＝'+value+'。');
});

const mathematicalCdf=['0.5000','0.6915','0.8413','0.9332','0.9772','0.9938','0.9987','0.9998'];
const mathematicalDensity=['0.3989','0.3521','0.2420','0.1295','0.0540','0.0175','0.0044','0.0009'];
const normal=define(7,'長さの標準偏差・許容誤差と正規分布表の参照行','左右の両側確率と、表の分布関数列と密度列の役割を保持。基準は原表、改変の表は四けた丸めを使う。',i=>{
  const {sigma,tolerance,options}=[
    {sigma:0.5,tolerance:1,options:source[7].choices},
    {sigma:0.8,tolerance:1.2,options:['6.7','13.4','18.4','86.6']},
    {sigma:0.6,tolerance:0.6,options:['15.9','24.2','31.7','68.3']},
    {sigma:0.4,tolerance:1,options:['0.6','1.2','1.8','5.4']},
  ][i];
  const cumulative=[...mathematicalCdf], density=[...mathematicalDensity];
  if(i===0){cumulative[4]='0.9773';density[0]='0.3938';density[3]='0.1296';}
  const z=Math.round(tolerance/sigma*2)/2, cdf=Number(cumulative[2*z]), tail=200*(1-cdf);
  const best=options.find(opt=>options.every(other=>Math.abs(+other-tail)>=Math.abs(+opt-tail)))!;
  return textBody([p(source[7].prompt.replace('0.5 mm',sigma+' mm').replace('±1 mm','±'+tolerance+' mm')),
    table('標準正規分布表',['確率変数','分布関数値','確率密度関数値'],
      cumulative.map((value,k)=>[(k/2).toFixed(2),value,density[k]]))],options,options.indexOf(best),
    '許容範囲の両端は標準化すると±'+z+'。表の累積確率は'+cumulative[2*z]+'なので，上側は1−'+
    cumulative[2*z]+'。分布は左右対称で，不良率は2×(1−'+cumulative[2*z]+')×100＝'+tail.toFixed(2)+'％。最も近いのは'+best+'％。');
},true);

const mask=define(8,'変えない側とビット数、反転のマスク','8ビット、連続区間の一方を保持・他方は反転、二つのマスクと排他的論理和／論理和の四択。',i=>{
  const retained=[2,4,1,3][i], lower=i!==3;
  const preserve=lower?(1<<retained)-1:255^((1<<(8-retained))-1), change=255^preserve;
  const h=(n:number)=>n.toString(16).toUpperCase().padStart(2,'0');
  const prompt='8ビットのデータの'+(lower?'下位':'上位')+retained+'ビットを変化させずに，'+(lower?'上位':'下位')+
    (8-retained)+'ビットのすべてを反転させる論理演算はどれか。';
  const options=[preserve,change].flatMap(n=>['排他的論理和','論理和'].map(type=>'16進数'+h(n)+'と'+type+'をとる。'));
  return textBody(prompt,options,2,'排他的論理和は，相手が0の位置を変えず，相手が1の位置だけを反転する。'+h(change)+
    '（2進数'+change.toString(2).padStart(8,'0')+'）がそのマスク。論理和は1を反転できない。');
},true);

const logic=define(9,'相補な因子と共通の二因子','論理積の項二つを論理和で結ぶ元式の形を保つ。一変数だけ相補な条件を選び，共通因子の積を求める。',i=>{
  const expr=['X・Y・Z＋X̄・Y・Z','X・Y・Z＋X・Ȳ・Z','X・Y・Z＋X・Y・Z̄','X̄・Y・Z＋X̄・Y・Z̄'][i];
  const opts=[source[9].choices,
    ['X・Y・Z','X・Z','X＋Z','Y・Z'],['X・Y','X・Y・Z','X・Z','X＋Y'],
    ['X̄＋Y','Y・Z','X・Y','X̄・Y']][i];
  const target=['Y・Z','X・Z','X・Y','X̄・Y'][i];
  const notations=i===0?source[9].prompt:expr+'と等価な論理式はどれか。ここで，“・”は論理積，“＋”は論理和，上線は変数の否定を表す。';
  return textBody(notations,opts,opts.indexOf(target),'相補な変数のどちらか一方は1なので，その変数と否定の論理和は常に1。'+
    '二項に共通する二つの因子をくくり出して，'+target+'になる。');
});

const checkDigit=define(10,'既知の3桁と検査数字','N₁の係数1、他の係数2・3・4、10を法とする余りと、元・付加後の桁順を維持する。',i=>{
  const [a,b,c,answer]=[[7,6,2,4],[6,1,8,0],[1,8,4,6],[5,2,9,2]][i], weighted=a*2+b*3+c*4, check=(weighted+answer)%10;
  const text=source[10].prompt.replace('N₂＝7，N₃＝6，N₄＝2，C＝4','N₂＝'+a+'，N₃＝'+b+'，N₄＝'+c+'，C＝'+check);
  return textBody([p(text),p('元のデータ：N₁N₂N₃N₄'),
    formula('C=\\operatorname{mod}((N_1\\times1+N_2\\times2+N_3\\times3+N_4\\times4),10)',
      'C＝mod((N₁×1＋N₂×2＋N₃×3＋N₄×4)，10)'),
    p('ここで，mod(x，10)の値は，xを10で割った余り。'),p('検査数字を付加したデータ：N₁N₂N₃N₄C。')],
    source[10].choices,source[10].choices.indexOf(String(answer)),
    '既知の部分は'+a+'×2＋'+b+'×3＋'+c+'×4＝'+weighted+'。N₁を加えた値の余りが'+check+
    'になる0～9の数字は'+answer+'だけである。');
});

function letterClass(char:string) {
  if(char==='△')return 0;
  if(/^[0-9]$/.test(char))return 1;
  if(char==='＋'||char==='−')return 2;
  return char==='.'?3:4;
}
const automaton=define(11,'状態遷移表と検査する四つの入力文字列','初期状態a、eで不合格、空白・数字・符号・小数点・その他を固定。表の一部と解析する文字列を同期する。',i=>{
  const rows=transitions(i);
  const options=[source[11].choices,['4.1','＋2.9','2＋＋5','7.△'],['−07','−.△','.4','6.△'],
    ['2.0','＋20','−17','3.△']][i];
  const sequence=(text:string)=>{
    const states=['a'];
    for(const letter of text) {
      if(states.at(-1)==='e')break;
      states.push(rows[states.at(-1)!.charCodeAt(0)-97][letterClass(letter)]);
    }
    return states;
  };
  const answer=options.findIndex(word=>sequence(word).at(-1)==='e');
  return textBody([p(source[11].prompt),table('現在の状態と入力文字による状態遷移表',['現在の状態',...stateColumns],
    rows.map((row,k)=>['abcd'[k],...row]))],options,answer,
    options[answer]+'を左から読むと，状態は'+sequence(options[answer]).join('→')+'と遷移する。'+
    '入力の途中でeに到達した時点で不合格になり，他の候補ではeに入らない。');
});

const deleteNode=define(12,'二分探索木の値、削除対象と移動候補','木の枝を維持し、実際の値と対象節を変える。別の節を一か所だけ移動し、探索木の全部分木を成立させる。',i=>{
  const {target,options,nodes}=tree(i), drop=nodes.findIndex(node=>node.value===target);
  const descendants=(spot:number,left:boolean)=> {
    const first=nodes.findIndex(node=>node.p===spot&&node.left===left);
    if(first<0)return [];
    const collect=(at:number):number[]=>[nodes[at].value,...nodes.flatMap((node,pos)=>node.p===at?collect(pos):[])];
    return collect(first);
  };
  const wanted=options.find(option=>{
    const at=nodes.findIndex(node=>node.value===option);
    return !nodes.some(node=>node.p===at)&&
      descendants(drop,true).every(value=>value===option||value<option)&&
      descendants(drop,false).every(value=>value===option||value>option);
  })!;
  return textBody([p(source[12].prompt.replace('要素12','要素'+target)),draw('tree',i,'2分探索木')],options,options.indexOf(wanted),
    '移動元に子があると，その子をつなぎ直す作業が別に要る。葉から選び，置き換え後に左部分木より大きく右部分木より小さくなる'+wanted+
    'を移動すると，元の位置の順序関係と二分探索木の条件を保てる。');
});

const hash=define(14,'五桁のキー・法と配列末尾','五桁の和を法で割る方式と0起点を保ち、キー、法、図の範囲を同期する。',i=>{
  const {key,mod,choices}=hashCases[i], sum=[...key].reduce((n,d)=>n+Number(d),0), answer=sum%mod;
  const prompt=source[14].prompt.replaceAll('13',String(mod)).replace('54321',key);
  return textBody([p(prompt),draw('hash-array',i,'ハッシュ値と配列の位置')],choices,choices.findIndex(candidate=>candidate===answer),
    '5けたの和は'+[...key].join('＋')+'＝'+sum+'。これを'+mod+'で割った余りは'+answer+'なので，配列の位置'+answer+'に格納する。');
});

const decision=define(15,'試験の判定基準と四つの条件命題','3科目各100点、経験年数・合計・英語の三条件、決定表のY/N/省略と合格・仮合格・不合格を保持。',i=>{
  const [experience,total,english]=[[5,260,90],[4,240,85],[7,270,95],[6,250,80]][i];
  const opts=[source[15].choices,[
    '労務管理の得点が40未満の者は，不合格になる。','英語の得点が85以上の者は，仮合格か合格になる。',
    '業務経験年数が4以上の者は，仮合格か合格になる。','英語の得点が85未満の者は，不合格になる。',
  ],[
    '英語の得点が95以上の者は，仮合格か合格になる。','経理の得点が100の者は，仮合格か合格になる。',
    '英語の得点が95未満の者は，不合格になる。','業務経験年数が7未満の者は，不合格になる。',
  ],[
    '3科目の合計得点が250以上の者は，仮合格か合格になる。','英語の得点が80以上の者は，合格になる。',
    '合計得点が250以上で，業務経験年数が6以上，英語の得点が80未満の者は，仮合格になる。',
    '業務経験年数が6以上の者は，仮合格か合格になる。',
  ]][i];
  return textBody([p(source[15].prompt),table('試験の合否判定',['条件と結果','規則1','規則2','規則3','規則4'],[
    ['業務経験年数≧'+experience,'Y','Y','Y','N'],['3科目合計得点≧'+total,'Y','Y','N','―'],['英語得点≧'+english,'Y','N','―','―'],
    ['合格','X','―','―','―'],['仮合格','―','X','―','―'],['不合格','―','―','X','X']])],opts,[3,0,3,2][i],[
      '労務管理と英語は各100点までなので，経理が60点未満なら合計は260点未満。規則3又は4で不合格となる。',
      '経理と英語は各100点までなので，労務管理が40点未満なら合計240点に届かず不合格となる。',
      '業務経験が7年以上に届かない場合は規則4に当てはまる。合計や英語の点数を問わず不合格。',
      '経験年数と合計点の条件がYで英語点の条件がNの規則2を適用する。結果の仮合格の行にXがある。',
    ][i]);
});

const circuit=define(17,'3入力の値とAND・ORの接続順','3入力・二つの二入力ゲート・否定とP/Q/Rの構成、凡例と四つの三値組を維持する。',i=>{
  const {inputs:[a,b,c],first,second}=logicCases[i];
  const gate=(kind:string,x:number,y:number)=>kind==='AND'?x&y:x|y;
  const pValue=gate(first,a,b), q=gate(second,pValue,c), r=1-q, key=[pValue,q,r].join('／');
  const options=i===1?['0／0／0','0／1／0','0／0／1','1／0／1']:source[17].choices;
  const stem='図の論理回路において，A＝'+a+'，B＝'+b+'，C＝'+c+
    'のとき，P，Q，Rの値の適切な組合せはどれか。ここで，図の記号はAND回路，OR回路，NOT回路を表す。';
  return body([p(stem),draw('gate-legend',0,'論理回路の記号'),draw('logic-chain',i,'P、Q、Rを出力する論理回路')],
    pairs('P・Q・Rの組合せ',['P','Q','R'],options),options.indexOf(key),
    'AとBの'+first+'でP＝'+pValue+'。PとCの'+second+'でQ＝'+q+'。最後にNOTで反転するのでR＝'+r+'。');
});

const rate=define(19,'GHzで示すクロック周波数と平均クロック／命令','平均CPIで周波数を割って毎秒実行数を求め、万命令へ単位換算する。整数の万命令になる条件に限定。',i=>{
  const [clock,cpi]=[[1,0.8],[1.2,0.6],[0.8,1.6],[1.5,0.75]][i], cycles=Math.round(clock*1e9), speed=Math.round(cycles/cpi), result=speed/10000;
  const opts=i===0?source[19].choices:[Math.round(clock*1000/cpi),Math.round(clock*1e5*cpi),result,Math.round(clock*1e5)]
    .sort((a,b)=>a-b).map(grouping);
  const prompt=source[19].prompt.replace('1 GHz',clock+' GHz').replace('0.8クロック',cpi+'クロック');
  return textBody(prompt,opts,opts.indexOf(grouping(result)),
    clock+' GHzは1秒に'+grouping(cycles)+'クロック。命令当たり平均'+cpi+'クロックだから，1秒に'+
    grouping(speed)+'命令。1万で割ると'+grouping(result)+'万命令。');
});

const bytes=define(24,'セクタのバイト数と番号のビット幅','番号の組合せとセクタ容量の積を用い、512×2²¹バイトを1 Gバイトとする定義を保持。',i=>{
  const [size,width]=[[512,28],[1024,27],[2048,29],[512,30]][i], volume=size*2**width/(512*2**21);
  const prompt='1セクタが'+size+'バイトの磁気ディスクを，'+width+
    'ビットで表すセクタ番号で管理するとき，最大何Gバイトの容量まで管理できることになるか。ここで，512×2²¹を1 Gバイトとする。';
  const choices=i===0?source[24].choices:[volume/4,volume/2,volume,volume*2].map(grouping);
  return textBody(prompt,choices,choices.indexOf(grouping(volume)),
    width+'ビットで指定できるのは2の'+width+'乗セクタ。各'+size+'バイトなので，総量を原題の1 Gバイト分の512×2²¹で割ると'+grouping(volume)+' Gバイト。');
},true);

export const calculations2004AutumnAm0126=[fractional,stack,multiply,probability,dice,normal,mask,logic,checkDigit,automaton,deleteNode,hash,decision,circuit,rate,bytes];
