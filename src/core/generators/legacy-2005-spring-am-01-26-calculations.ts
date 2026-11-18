import { p, table } from './definition';
import { body, define, formula, grouping, source, textBody } from './legacy-2005-spring-am-01-26-shared';
import { circuitExpression, draw } from './legacy-2005-spring-am-01-26-figures';
import { circuits, computerAnswerRows, computerCases, computerComponents, conversionCases, parityMachineCases, stackCases,
  treeLabels, treeValues, weatherCases, weatherNames, type Circuit } from './legacy-2005-spring-am-01-26-model';

const pairs=(caption:string, columns:string[],rows:string[][])=>rows.map(row=>[table(caption,columns,[row])]);
const conversion=define(1,'変換先の基数、配列と入力上限','商と余りを代入する4組、下位桁からの順、ループ端の注記を維持し、基数と配列・反復長を同期する。',i=>{
  const {radix,limit,size,array}=conversionCases[i];
  const stem=i===0?source[1].prompt:
    '次の流れ図は，10進整数j（0＜j＜'+limit+'）を'+radix+'進数に変換する処理を表している。'+radix+
    '進数は下位けたから順に，配列の要素'+array+'(1)から'+array+'('+size+')に格納される。流れ図のa及びbに入る処理はどれか。'+
    'ここで，j div '+radix+'はjを'+radix+'で割った商の整数部分を，j mod '+radix+'はjを'+radix+'で割った余りを表す。';
  const choices=source[1].choices.map(option=>option.replaceAll(' 2',' '+radix).replaceAll('NISHIN',array).split('／'));
  return body([p(stem),draw('conversion',i,'基数変換の流れ図')],pairs('aとbの処理',['a','b'],choices),3,
    '今のjを'+radix+'で割った余りが最下位のけたなので，先に'+array+'(k)へ格納する。商をjへ戻せば右端のけたを除ける。'+
    size+'回繰り返して順に格納し，商が0になった後のけたには0が入る。');
},true);

const alternation=define(2,'基数と交互に置く値','2nけた、末尾0、xと1けた右へ移した値の和、二つの指数と−1の組合せを維持する。',i=>{
  const [base,digit]=[[2,1],[3,2],[5,2],[4,3]][i], pattern=String(digit)+'0';
  const stem=i===0?source[2].prompt:'ある自然数xを'+base+'進数で表現すると，'+digit+'と0が交互に並んだ2nけたの'+base+
    '進数'+pattern+pattern+'…'+pattern+'となった。このとき，xに関して成立する式はどれか。';
  const fraction=(value:string)=>base===2?value:'\\frac{'+digit+'('+value+')}{'+(base-1)+'}';
  const descriptions=['2n','2n','2n＋1','2n＋1'];
  const choices=descriptions.map((e,n)=>{
    const subtract=n%2===1;
    const right=base===2?base+'^('+e+')'+(subtract?'−1':''):digit+'×('+base+'^('+e+')'+(subtract?'−1':'')+')/'+(base-1);
    return [formula('x+\\frac{x}{'+base+'}='+fraction(base+'^{'+e.replace('＋','+')+'}'+(subtract?'-1':'')),
      'x＋x/'+base+'＝'+right)];
  });
  return body(stem,choices,1,'xを'+base+'で割ると，元の列と重ならない位置へ'+digit+'が1けたずれる。足すと'+
    digit+'が2n個並ぶため，桁の重みの総和は'+digit+'×（'+base+'の2n乗−1）÷'+(base-1)+'となる。');
},true);

const unsigned=define(3,'ビット幅と補数を表す負数','符号付きの負数と同じビット列を符号なしとみなす。元の符号幅に応じた4役の誤答を使う。',i=>{
  const [width,magnitude]=[[8,100],[7,42],[10,203],[9,151]][i];
  const boundary=2**(width-1), correct=2**width-magnitude;
  return textBody(source[3].prompt.replace('8ビット',width+'ビット').replace('−100','−'+magnitude),
    [boundary-magnitude,magnitude,correct,boundary+magnitude],2,
    width+'ビットの2の補数では負数に'+(2**width)+'を加えた値が，同じビット列を符号なしとして読んだ値になる。'+
    (2**width)+'−'+magnitude+'＝'+correct+'。');
},true);

const coin=define(6,'投げる回数と表の回数','同一コインで指定個数だけ表となる二項モデル。改変条件では表裏の等確率と試行間の独立を明記する。',i=>{
  const [n,k]=[[4,2],[3,1],[4,1],[4,3]][i];
  let count=1;
  for(let a=0;a<k;a++)count=count*(n-a)/(a+1);
  const probability=count/2**n;
  const options=i===0?source[6].choices:[
    [],['0.125','0.25','0.375','0.5'],['0.125','0.25','0.375','0.5'],['0.25','0.375','0.5','0.75'],
  ][i];
  const question='コインを'+n+'回投げたときに，表が'+k+'回だけ出る確率は幾らか。';
  return textBody(i===0?source[6].prompt:'各回の表と裏は等確率で，各回の結果は独立である。'+question,options,options.indexOf(String(probability)),
    '表裏が等確率で投げるたびに独立とすると，'+n+'回の並びは全部で'+(2**n)+'通り。'+k+
    'か所だけ表になる並びは'+count+'通りなので，'+count+'÷'+(2**n)+'＝'+probability+'。');
});

const weather=define(7,'遷移確率の図と二日後の対象状態','三状態の遷移図と二日分の経路を保持。各始点の確率の和は1。翌日の条件は当日の状態で決まる。',i=>{
  const {rates,from,to}=weatherCases[i], terms=rates[from].map((rate,intermediate)=>rate*rates[intermediate][to]);
  const probability=terms.reduce((a,b)=>a+b)/100;
  const opts=[source[7].choices,['0.15','0.3','0.36','0.4'],['0.16','0.2','0.26','0.34'],['0.1','0.16','0.2','0.26']][i];
  const stem=i===0?source[7].prompt:
    '次の図は，ある地方の日単位の天気の移り変わりを示したものであり，数値は，その日の天気によって決まる翌日の天気の変化の確率を表している。ある日の天気が'+
    weatherNames[from]+'のとき，2日後の天気が'+weatherNames[to]+'になる確率は幾らか。';
  return textBody([p(stem),draw('weather',i,'翌日の天気の遷移確率')],opts,opts.indexOf(String(probability)),
    '当日の状態ごとに翌日の確率が決まるモデルで，明日の晴れ・雨・曇りを経由する三経路について，'+
    rates[from].map((rate,index)=>rate/10+'×'+rates[index][to]/10).join('＋')+'＝'+probability+'となる。');
});

const sets=define(8,'差集合の基準集合と和・積の組合せ','三集合の一つを基準とし，残りの和集合又は積集合との差に等しい式を問う。',i=>{
  const conditions=[
    ['S−(T∪R)',source[8].choices,0],
    ['S−(T∩R)',['（S−T）−R','（S−T）∩（S−R）','（S−T）∪（S−R）','（S−T）∪（T−R）'],2],
    ['T−(S∪R)',['（T−S）∪（S−R）','（T−S）−R','（T−S）∪（T−R）','（T−S）∩（S−R）'],1],
    ['R−(S∩T)',['（R−S）∩（R−T）','（R−S）−T','（R−S）∪（S−T）','（R−S）∪（R−T）'],3],
  ] as const;
  const [expression,options,answer]=conditions[i], union=expression.includes('∪');
  return textBody(source[8].prompt.replace('S−(T∪R)',expression),options,answer,
    '元の集合に含まれる要素のうち，除く二集合の'+(union?'どちらにも入らない':'少なくとも片方に入らない')+
    'ものを残す。これは'+options[answer]+'で表せる。');
});

const mask=define(9,'保存するビットの位置・幅とマスク','8ビットを保ち、対象位置を覆う連続した1のマスクと論理積・論理和・排他的論理和・否定論理積を維持する。',i=>{
  const [position,width,hex]=[['下位',4,'0F'],['上位',4,'F0'],['下位',3,'07'],['上位',3,'E0']][i];
  return textBody(source[9].prompt.replace('下位4',position+String(width)),source[9].choices.map(s=>s.replace('0F',String(hex))),0,
    '16進表記'+hex+'は8ビットで'+Number.parseInt(String(hex),16).toString(2).padStart(8,'0')+'。対象のビットには1が立つ。'+
    '論理積では相手が1の位置の0と1がそのまま残る。他の操作は元の値を変える場合がある。');
},true);

const parity=define(10,'偶数・奇数パリティと3つの7ビット文字コード','実データ3つへの先頭1ビット付加と四つの16進表記を保持し、各条件で付けるパリティが異なる。',i=>{
  const [odd,codes]=[
    [false,[0x30,0x3f,0x7a]],[true,[0x42,0x45,0x61]],[false,[0x43,0x51,0x6c]],[true,[0x30,0x51,0x7f]],
  ][i] as [boolean,number[]];
  const bits=codes.map(code=>Number((code.toString(2).split('1').length-1)%2!==Number(odd)));
  const actual=bits.reduce((mask,bit,n)=>mask|(bit<<n),0);
  const hex=(n:number)=>n.toString(16).toUpperCase().padStart(2,'0');
  const line=(mask:number)=>codes.map((byte,n)=>hex(byte|(mask&(1<<n)?128:0))).join('，');
  const arrangements=[actual,actual^1,actual^2,actual^7];
  const sort=arrangements.sort((a,b)=>a-b).map(line), options=i===0?source[10].choices:sort;
  const stem=source[10].prompt.replace('偶数',odd?'奇数':'偶数').replace('30，3F，7A',codes.map(hex).join('，'));
  return textBody(stem,options,options.indexOf(line(actual)),
    '各7ビット内の1の個数を数え，8ビットの全体で'+(odd?'奇数':'偶数')+'個になるように先頭に'+
    bits.join('，')+'を付ける。1を付けると16進表記の先頭側に80を加えるので，結果は'+line(actual)+'。');
});

const machine=define(11,'カウント対象のビットと受理する偶奇','始点、二重丸、二つのラベルが既知で二箇所が空欄の遷移図を維持。数える対象と受理状態を独立に変える。',i=>{
  const {digit,even}=parityMachineCases[i], options=source[11].choices.map(value=>value.split('／'));
  const stem='図は'+digit+'の数が'+(even?'偶数':'奇数')+'個のビット列を受理するオートマトンの状態遷移図であり，“'+
    (even?'偶':'奇')+'”と書かれた二重丸が受理状態を表す。a，bの正しい組合せはどれか。';
  return body([p(stem),draw('automaton',i,'ビット列を受理する状態遷移図')],pairs('aとbの入力',['a','b'],options),digit===1?2:1,
    '数えるビット'+digit+'が入力されるたびに偶奇が切り替わる。別のビットでは変わらない。したがって奇から偶に戻るaは'+
    digit+'，奇に留まるbは'+(1-digit)+'。');
});

const tree=define(12,'9ノードに置く値と四つの候補木','同じ親子構造・四択を維持。割当値を変え、部分木を含む探索範囲から正答を判定する。',i=>{
  const parents=[-1,0,0,1,1,2,2,5,5];
  const valid=(nodes:number[])=>{
    for(let pos=1;pos<nodes.length;pos++) {
      let child=pos;
      while(parents[child]>=0) {
        const parent=parents[child], left=child===parents.indexOf(parent);
        if(left?nodes[pos]>=nodes[parent]:nodes[pos]<=nodes[parent])return false;
        child=parent;
      }
    }
    return true;
  };
  const values=treeValues[i], alternatives=[0,1,2,3], correct=alternatives.findIndex(choice=>valid(treeLabels(i,choice)));
  const stem=i===0?source[12].prompt:'2分探索木として適切なものはどれか。ここで，'+values.join('，')+'の数字は，各ノード（節）の値を表す。';
  return body([p(stem)],alternatives.map(n=>[draw('tree',i*4+n,'木の構造')]),correct,
    '2分探索木では，どの節についても左部分木の全てがその節より小さく，右部分木の全てが大きい。'+
    '「'+'アイウエ'[correct]+'」では，根の値'+treeLabels(i,correct)[0]+'で両部分木が分かれ，各子の下でも同じ関係になる。');
});

const stack=define(13,'PUSH・POPの10命令と最終スタック','命令の順、PUSHの指定番号と5段の値を変更する。最終順に残った初期値・PUSHの番号を突き合わせる。',i=>{
  const {ops,top,target}=stackCases[i];
  const surviving:number[]=[0];
  let order=0;
  for(const op of ops)op==='+'?surviving.push(++order):surviving.pop();
  surviving.reverse();
  const value=top[surviving.indexOf(target)];
  const options=[...top.slice(1)].sort((a,b)=>a-b);
  const stem=source[13].prompt.replace('1番目',target+'番目');
  return textBody([p(stem),draw('instructions',i,'命令の実行順序'),draw('stack',i,'実行後のスタック')],options,options.indexOf(value),
    'POPは直近に入れて残っているデータを取り除く。最後の上からのPUSH番号は'+
    surviving.slice(0,-1).join('，')+'で，最下段は元のデータである。'+target+'番目のPUSHに対応する値は'+value+'。');
});

const search=define(15,'データ数が増加する倍率','2のべきの倍率、最大探索回数の差と倍率を区別する4択。全nで一定になる差を問う。',i=>{
  const power=[2,1,3,4][i], factor=2**power;
  const opts=[source[15].choices,['1回増える。','2回増える。','約2倍になる。','約4倍になる。'],
    ['2回増える。','3回増える。','約3倍になる。','約8倍になる。'],
    ['2回増える。','約4倍になる。','4回増える。','約16倍になる。']][i];
  return textBody(source[15].prompt.replace('4倍',factor+'倍'),opts,opts.indexOf(power+'回増える。'),
    '1回比較するたびに残る対象は最大で約半分になる。n件なら最大⌊log₂ n⌋＋1回。'+
    factor+'倍は先頭から必要な半減を'+power+'回増やすため，最大探索回数は'+power+'回増える。');
});

function signal(gate:Circuit,a:boolean,b:boolean):boolean {
  if(typeof gate==='string')return gate==='A'?a:b;
  const left=signal(gate[1],a,b);
  if(gate[0]==='NOT')return !left;
  const right=signal(gate[2],a,b);
  return gate[0]==='AND'?left&&right:left||right;
}
const logical=define(17,'論理積・論理和・否定の組合せ','AND・OR・NOTの図入り凡例と対象回路、4つの図入り解答を保持。2入力の全組合せで等価性を判定する。',i=>{
  const [target,...options]=circuits[i], values:readonly (readonly [boolean,boolean])[]=[[false,false],[false,true],[true,false],[true,true]];
  const result=values.map(([a,b])=>Number(signal(target,a,b))).join('，');
  const answer=options.findIndex(option=>values.every(([a,b])=>signal(target,a,b)===signal(option,a,b)));
  return body([p(source[17].prompt),draw('gates',0,'論理ゲートの記号'),draw('circuit',i*5,'比較する論理回路')],
    options.map((_,candidate)=>[draw('circuit',i*5+candidate+1,'論理回路の候補')]),answer,
    '比較する回路の式は'+circuitExpression(target)+'。入力（A，B）＝（0，0），（0，1），（1，0），（1，1）の順の出力は'+
    result+'。同じ並びになる回路の式は'+circuitExpression(options[answer])+'だけである。');
});

const performance=define(18,'クロック周波数・命令ごとの所要クロックと出現率','二命令の実行時間（クロック）をCPIとして重み付き平均し、MIPSに直す。整数のMIPSとなる入力に限定する。',i=>{
  const [ghz,one,two,frequency]=[[1,10,5,60],[1.6,12,4,75],[1.2,8,4,50],[0.9,6,10,25]][i];
  const mean=(one*frequency+two*(100-frequency))/100, mhz=1000*ghz, result=Math.round(mhz/mean);
  const opts=i===0?source[18].choices:[Math.round(mhz/Math.max(one,two)),Math.round((mhz/one+mhz/two)/2),result,
    Math.round(mhz/Math.min(one,two))].sort((a,b)=>a-b).map(String);
  const stem=source[18].prompt.replace('1 GHz',ghz+' GHz');
  return textBody([p(stem),table('命令種別と実行時間・頻度',['命令種別','実行時間（クロック）','実行頻度（％）'],
    [['命令1',String(one),String(frequency)],['命令2',String(two),String(100-frequency)]])],opts,opts.indexOf(String(result)),
    '命令1と命令2の出現頻度を重みにして，1命令当たりの平均クロック数（CPI）を求める。'+
    one+'×'+frequency+'％＋'+two+'×'+(100-frequency)+'％＝'+mean+'。'+mhz+' MHz÷'+mean+'＝'+result+' MIPSである。');
});

const disk=define(22,'回転速度・平均シーク時間・トラック容量・ブロック長','一周を回転速度から求め、平均半周待ち、容量比の転送、平均シークを加える。小数1けた以下の正答を維持する。',i=>{
  const [rpm,seek,track,bytes]=[[5000,20,15000,4000],[6000,12,18000,5400],[7500,16,16000,6000],[4000,18,18000,3600]][i];
  const rotation=60000/rpm, wait=rotation/2, transfer=rotation*bytes/track;
  const want=seek+wait+transfer;
  const opts=i===0?source[22].choices:[seek+transfer,seek+wait,want,seek+rotation+transfer].map(x=>String(+x.toFixed(1)));
  const stem='回転速度が'+grouping(rpm)+'回転／分，平均シーク時間が'+seek+'ミリ秒の磁気ディスクがある。'+
    'この磁気ディスクの1トラック当たりの記憶容量は，'+grouping(track)+'バイトである。このとき，1ブロックが'+
    grouping(bytes)+'バイトのデータを，1ブロック転送するために必要な平均アクセス時間は何ミリ秒か。';
  return textBody(stem,opts,opts.indexOf(String(want)),
    '1回転は60,000÷'+grouping(rpm)+'＝'+rotation+'ミリ秒なので平均回転待ちは'+wait+'ミリ秒。転送は'+
    rotation+'×'+grouping(bytes)+'÷'+grouping(track)+'＝'+transfer+'ミリ秒で，平均シークも足すと'+want+'ミリ秒。');
});

const seekOrder=define(23,'現在シリンダ・待ち行列・最初の向き','5条件を保持。現在の方向に要求がなくなるまで順に処理し、各移動量を合計する。',i=>{
  const choices=[
    [100,[120,90,70,80,140,110,60],true],
    [90,[140,70,100,50,130,160,60],false],
    [150,[130,220,160,180,110,145,90],true],
    [200,[120,180,220,240,170,275,245],false],
  ] as const;
  const [start,list,increase]=choices[i];
  const before=list.filter(item=>increase?item>start:item<start).sort((a,b)=>increase?a-b:b-a);
  const after=list.filter(item=>increase?item<start:item>start).sort((a,b)=>increase?b-a:a-b);
  const route=[start,...before,...after], total=route.slice(1).reduce((n,item,k)=>n+Math.abs(item-route[k]),0);
  const opts=i===0?source[23].choices:[
    Math.max(...list)-Math.min(...list),Math.max(...list.map(value=>Math.abs(value-start))),
    total,2*(Math.max(...list)-Math.min(...list)),
  ].sort((a,b)=>a-b).map(String);
  return textBody([p(source[23].prompt.replace('番号100','番号'+start).replace('120，90，70，80，140，110，60',list.join('，'))),
    ...source[23].material.split(/(?=（\d）)/).map(line=>p(increase?line:line.replace('増加する','減少する')))],opts,opts.indexOf(String(total)),
    '新しい要求がなく，要求を並べ替えられるので，'+route.join('→')+'の順で移動する。各区間の差の絶対値の合計は'+total+'シリンダ。');
});

const image=define(25,'画像の縦横・dpi・色のビット深度','cm、dpi、色ビット、Mバイトの原形式を保持。各辺が整数インチとなり画素数の丸めを要しない。',i=>{
  const [w,h,dpi,depth]=[[10,15,600,24],[8,10,300,24],[5,12,600,32],[12,20,300,24]][i];
  const x=w*dpi,y=h*dpi, bytes=x*y*depth/8, result=bytes/1000000;
  const stem=source[25].prompt.replace('25.4cm',+(w*2.54).toFixed(2)+'cm').replace('38.1cm',+(h*2.54).toFixed(2)+'cm')
    .replace('600dpi',dpi+'dpi').replace('24ビット',depth+'ビット');
  const opts=i===0?source[25].choices:[result/dpi,result,result*4,result*8]
    .map(n=>n.toLocaleString('en-US',{maximumFractionDigits:3}));
  return textBody(stem,opts,opts.indexOf(result.toLocaleString('en-US',{maximumFractionDigits:3})),
    '横は'+w+'インチ，縦は'+h+'インチなので，'+grouping(x)+'×'+grouping(y)+'画素。1画素'+depth+'ビットは'+
    depth/8+'バイトで，全体は'+grouping(bytes)+'バイト＝'+result+' Mバイト（Mは100万）。');
},true);

const devices=define(26,'制御・記憶・演算の配置と配線','基本構成の5装置、データと制御の2種類の矢印、a〜cの四つの組合せを保持して内部の配置を変える。',i=>{
  const mode=computerCases[i], options=computerAnswerRows.map(row=>[...row]);
  const correct=[3,0,1,2][i];
  options[correct]=[...mode];
  if(new Set(options.map(row=>row.join(''))).size<4)options[options.findIndex((row,index)=>index!==correct&&row.join('')===mode.join(''))]=[2,0,1];
  return body([p(source[26].prompt),draw('computer',i,'コンピュータの基本構成')],
    pairs('aからcの装置',['a','b','c'],options.map(row=>row.map(role=>computerComponents[role]))),correct,
    '破線の指示を出すのは制御装置，入力・出力・演算のデータが集まるのは記憶装置，記憶装置との間でデータをやり取りして演算するのは演算装置。'+
    '図のa，b，cは順に'+mode.map(role=>computerComponents[role]).join('，')+'。');
});

export const calculations2005SpringAm0126=[conversion,alternation,unsigned,coin,weather,sets,mask,parity,machine,tree,stack,search,logical,performance,disk,seekOrder,image,devices];
