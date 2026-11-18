import { code, p, table } from './definition';
import { body, define, formula, grouping, source, textBody } from './legacy-2004-spring-am-01-26-shared';
import { draw } from './legacy-2004-spring-am-01-26-figures';
import { branchCases, branchGates, diskCases, memoryRows, scans, sumCases } from './legacy-2004-spring-am-01-26-models';

const gcd = (a: number,b: number): number => b ? gcd(b,a%b) : a;
function fraction(n: number,d: number) {
  const common = gcd(n,d);
  return n/common+'/'+d/common;
}
function binomial(n: number,k: number) {
  return Array.from({length:k},(_,i)=>[n-i,i+1]).reduce((value,[numerator,denominator])=>value*numerator/denominator,1);
}

const binaryFraction = define(1,'整数の分子と2の累乗の分母','十進除算の2進小数表示を選ぶ。小数点以下の桁の重みと桁位置を区別する。',i=>{
  const [top,bits] = [[7,5],[11,6],[13,5],[9,6]][i];
  const bottom = 2**bits;
  const render = (n: number,b: number) => '0.'+n.toString(2).padStart(b,'0').replace(/0+$/,'');
  const value = render(top,bits);
  const choices = i===0 ? source[1].choices : [
    render(top-4,bits),render(top-2,bits),value,render(top,bits-1),
  ];
  return textBody(source[1].prompt.replace('7÷32',top+'÷'+bottom),choices,choices.indexOf(value),
    bottom+'＝2の'+bits+'乗。'+top+'の2進表記'+top.toString(2)+'を右へ'+bits+
    '桁ずらし，小数点の直後に必要な0を補うと'+value+'になる。');
},true);
const unknownBase = define(2,'四桁の被除数、一桁の除数、三桁の商','余り0の式と6、7、8、9の比較を固定。すべての候補の基数で数字が有効な入力にする。',i=>{
  const [total,divisor,quotient] = [['1015','5','131'],['1002','2','301'],['1001','3','253'],['1003','3','301']][i];
  const choices = source[2].choices;
  const valid = choices.findIndex(candidate=>{
    const base = Number(candidate);
    return parseInt(total,base)===Number(divisor)*parseInt(quotient,base);
  });
  const base = Number(choices[valid]);
  return textBody([p(source[2].prompt),p(total+'÷'+divisor+'＝'+quotient+'（余り0）')],choices,valid,
    base+'進法では，十進数に直した被除数が'+parseInt(total,base)+'，商が'+parseInt(quotient,base)+'になる。商を'+
    divisor+'倍すると被除数に等しく，ほかの候補の基数では積が一致しない。');
});
const floatParts = define(3,'浮動小数点の係数・べきの底・べき指数を表す記号','符号ではなく浮動小数点表記の各役割を問う。式と仮数・基数・指数の説明候補を連動させる。',i=>{
  const [coefficient,base,exponent] = [['f','r','e'],['e','f','r'],['r','f','e'],['r','e','f']][i];
  const latex='a='+coefficient+'\\times '+base+'^{'+exponent+'}';
  return textBody([p('実数aを次のように表す浮動小数点表記に関する記述として，適切なものはどれか。'),
    formula(latex,'aは'+coefficient+'に'+base+'の'+exponent+'乗を掛けた値。')],source[3].choices,i,
    'べきに掛ける係数'+coefficient+'が仮数，べきの底'+base+'が基数，べき乗の'+exponent+'が指数。');
});
const shift = define(4,'レジスタ内の十六進値と右シフト幅','32ビット幅を維持し、論理右シフト、16ビットの循環右シフト、16ビット切捨ての左シフト、16ビット符号拡張を区別する。',i=>{
  const [hex,amount] = [['ABCD',2],['A7D2',2],['C345',3],['F197',4]][i] as [string,number];
  const input=parseInt(hex,16), lowMask=2**amount-1;
  const right=Math.floor(input/2**amount);
  const toHex=(n:number)=>n.toString(16).toUpperCase().padStart(4,'0');
  const choices=i===0?source[4].choices:[
    toHex(right), toHex(right+(input&lowMask)*(2**(16-amount))),
    toHex((input*2**amount)%65536), toHex(right+lowMask*(2**(16-amount))),
  ].sort();
  return textBody(source[4].prompt.replace('ABCD',hex).replace('2ビットだけ',amount+'ビットだけ'),
    choices,choices.indexOf(toHex(right)),
    '32ビットの右論理シフトでは，下位'+amount+'ビットを捨てて，上位に0を入れる。'+hex+'の符号拡張や循環は行わず，結果は'+toHex(right)+'。');
},true);
const drawBalls = define(6,'色別の球の数、取り出す数、対象色','3色から復元なしの同時抽出で全て指定色となる確率。生成の本文に全組合せの等確率を明示する。',i=>{
  const [each,drawCount,color] = ([[3,3,'白'],[4,3,'赤'],[3,2,'黄'],[5,4,'白']] as const)[i];
  const count=each*3, all=binomial(count,drawCount), win=binomial(each,drawCount);
  const numerator=win, denominator=all;
  const one=each*binomial(count-each,drawCount-1);
  const options = i===0?source[6].choices:[
    fraction(numerator,denominator), fraction(one,denominator),
    fraction(1,3**drawCount), fraction(binomial(each*2,drawCount),denominator),
  ].sort((a,b)=>{
    const [an,ad]=a.split('/').map(Number), [bn,bd]=b.split('/').map(Number);
    return an*bd-bn*ad;
  });
  const prompt=source[6].prompt.replace('3個ずつ',each+'個ずつ')
    .replace('，3個の球を同時に取り出すとき','，'+drawCount+'個の球を同時に取り出すとき')
    .replace('白の球になる',color+'の球になる')+'どの取り出し方も同じ確率とする。';
  const rendered=options.map(option=>{
    const [n,d]=option.split('/');
    return [formula('\\frac{'+n+'}{'+d+'}',option)];
  });
  return body(prompt,rendered,options.indexOf(fraction(numerator,denominator)),
    '全部で'+count+'個から'+drawCount+'個を順不同に選ぶ方法は'+denominator+'通り。'+color+
    'だけから同じ数を選ぶ方法は'+numerator+'通りなので，確率は'+fraction(numerator,denominator)+'。');
},true);

const sumLogic = define(7,'一ビット二つの入力と固定の繰上げ','原題の4入力行と上位・下位の論理式の組を維持。入力の否定と固定の1の加算で上位と下位が変化する。',i=>{
  const {a,b,carry,negateA,negateB}=sumCases[i];
  const negA=negateA?'A':'A̅', negB=negateB?'B':'B̅';
  const xor='('+a+'・'+negB+')＋('+negA+'・'+b+')';
  const xnor='('+a+'＋'+negB+')・('+negA+'＋'+b+')';
  const expressions=[
    [a+'・'+b,xor],[a+'・'+b,xnor],[a+'＋'+b,xor],[a+'＋'+b,xnor],
  ];
  const text=i===0?source[7].prompt:source[7].prompt.replace('数A，Bの和','数'+a+'，'+b+(carry?'及び固定の1':'')+'の和');
  const sourceCaption='表　各入力と二ビットの和';
  return body([p(text),draw('sum-table',i,sourceCaption)],expressions.map(row=>[table('上位・下位を表す論理式',['C','S'],[row])]),
    carry?3:0,carry?
    '固定の1を加えると，'+a+'・'+b+'が共に0のときだけ繰上がらない。上位Cは論理和，下位Sは二入力が等しいとき1。':
    '上位Cは'+a+'と'+b+'が共に1のときだけ1なので論理積。下位Sは二入力の片方だけが1のとき1なので排他的論理和。');
});
const nestedEq = define(8,'比較する二組の整数と求める返却値','内側の二つの比較結果を外側で比較する。整数に関する条件式を四択で選ぶ。',i=>{
  const [a,b,c,d,target]=[['A','B','B','C',1],['A','B','B','C',0],['A','B','A','C',1],['A','C','C','B',0]][i];
  const call='eq(eq('+a+'，'+b+')，eq('+c+'，'+d+'))';
  const left=a+'＝'+b, right=c+'＝'+d, noLeft=a+'≠'+b, noRight=c+'≠'+d;
  const unshared=[a,b,c,d].filter((value,_,all)=>all.indexOf(value)===all.lastIndexOf(value)).join('＝');
  const equal='('+left+'かつ'+right+')又は('+noLeft+'かつ'+noRight+')';
  const differ='('+left+'かつ'+noRight+')又は('+noLeft+'かつ'+right+')';
  const choice = i===0?source[8].choices:target?
    [equal,'('+left+'かつ'+right+')又は('+noLeft+'又は'+noRight+')','('+left+'かつ'+right+')又は'+unshared,
      '('+left+'又は'+right+')又は'+unshared]:
    [equal,differ,left+'又は'+right,unshared];
  return textBody(source[8].prompt.replace('eq(eq(A，B)，eq(B，C))',call).replace('，1が返っ','，'+target+'が返っ'),
    choice,Number(target)===1?0:1,
    '二つの内側の比較はそれぞれ真を1，偽を0で返す。外側が'+target+'になる条件は，内側の結果が'+
    (target?'共に真又は共に偽':'片方だけ真')+'のとき。');
});
const branch = define(9,'AとBの各真偽から到達する二つの出口','A→Bの二段階の判定とexit 1/2を表示し、それと同じ一段の判定を四つの流れ図から選ぶ。',i=>{
  const [ff,ft,tf,tt]=branchCases[i];
  const correct=[1,0,2,3][i], gate=branchGates[correct];
  return body([p(source[9].prompt),draw('branch-tree',i,'流れ図　二つの論理型変数の分岐')],
    branchGates.map((name,index)=>[draw('branch-option',index,'流れ図　A '+name+' B で分岐')]),correct,
    'A，Bが偽・偽，偽・真，真・偽，真・真の順に調べると，出口は'+[ff,ft,tf,tt].join('，')+'。'+
    'exit 1となる組合せはA '+gate+' Bが真となる組合せと一致する。');
});
const codes = define(10,'作る符号の種類の数','2文字を繰り返し使用できる長さ1〜nの符号を数え、最小のnを選ぶ。空列を含めない。',i=>{
  const total=[60,124,28,14][i];
  const length=Math.ceil(Math.log2(total+2))-1;
  const options=i===0?source[10].choices:i===3?['2','3','4','5']:['3','4','5','6'];
  return textBody(source[10].prompt.replace('60通り',total+'通り'),options,options.indexOf(String(length)),
    '長さkの符号は2のk乗通り。長さ1から'+(length-1)+'までの総数は'+(2**length-2)+'通りで足りず，'+
    '長さ'+length+'までなら'+(2**(length+1)-2)+'通りになる。');
});
const stack = define(12,'4個のデータの到着順','一つのスタックの入出力を選ぶ。到着済みデータの保留と取り出しの順を比較する。',i=>{
  const arrival=['ABCD','BACD','DABC','DCAB'][i], options=source[12].choices;
  const feasible=(wanted:string)=>{
    const items:string[]=[];
    let inputIndex=0;
    for(const value of wanted.split('，')){
      while(items.at(-1)!==value&&inputIndex<arrival.length)items.push(arrival[inputIndex++]);
      if(items.pop()!==value)return false;
    }
    return true;
  };
  const correct=options.findIndex(feasible);
  return textBody(source[12].prompt.replace('A，B，C，D',[...arrival].join('，')),options,correct,
    '到着順'+[...arrival].join('，')+'にだけ積めて，出力できるのは一番上の要素だけ。次の出力対象が上になるまで'+
    '到着順に積む。取り出しを最後まで行えるのは'+options[correct]+'。');
});
const hash = define(13,'剰余の除数と衝突する16進データ','同じ長さの9データを順に入れ、既に出現した剰余と同じになる最初のデータを比較する。',i=>{
  const mod=[8,10,12,13][i], values=['1A','35','3B','54','8E','A1','AF','B2','B3'];
  const options=i===3?['54','A1','AF','B3']:source[13].choices;
  const remainders=values.map(value=>parseInt(value,16)%mod);
  const where=remainders.findIndex((remainder,j)=>remainders.indexOf(remainder)<j);
  return textBody(source[13].prompt.replace('mod(データ，8)','mod(データ，'+mod+')'),options,options.indexOf(values[where]),
    '挿入順の剰余は'+remainders.join('，')+'。初めに重なるのは'+values[where]+'と既に挿入した'+
    values[remainders.indexOf(remainders[where])]+'で，どちらも剰余'+remainders[where]+'。');
});
const recursion = define(14,'二つの関数を呼び出す起点の非負整数','条件分岐、FとGの交互呼出し、式中の積と和を維持。nを4～7で変える。',i=>{
  const n=[5,6,4,7][i];
  function f(k:number):number { return k<=1?1:k*g(k-1); }
  function g(k:number):number { return k===0?0:k+f(k-1); }
  const value=f(n);
  const options=[source[14].choices,['84','132','198','210'],['16','24','28','40'],['287','448','497','560']][i];
  const reduced=[];
  for(let k=n;k>1;k-=2)reduced.push('F('+k+')＝'+k+'×('+String(k-1)+'＋F('+(k-2)+'))');
  return textBody([p(source[14].prompt.replace('F(5)','F('+n+')')),code(source[14].material)],
    options,options.indexOf(String(value)),reduced.join('，')+'。終点はF('+(n%2)+')＝1で，戻りながら代入すると'+value+'。');
});
const search = define(15,'走査の始点及び添字の進め方','配列境界を先に判定し、一致時の停止と末端を過ぎるまで一致なしの場合の添字を区別する。',i=>{
  const {reverse,step}=scans[i];
  const text=source[15].prompt.replace('（N＞1）','（N＞1'+(step===2?'で，Nは奇数':'')+'）')+
    (step===2?'この流れ図は奇数番目の要素を調べる。':'');
  const absent=step===1?(reverse?'0':'N＋1'):(reverse?'−1':'N＋2');
  const options=i<2?source[15].choices:[
    'Xと同じ値が配列中にない場合，kには'+absent+'が設定されている。',source[15].choices[1],
    ...(reverse?[source[15].choices[2]]:['Xと同じ値が配列の1番目とN番目の2か所にある場合，kにはNが設定されている。']),
    'Xと同じ値が配列の1番目とN番目の2か所にある場合，kには2が設定されている。',
  ];
  return textBody([p(text),draw('array-search',i,'流れ図　配列内の同値探索')],options,[2,3,0,0][i],
    '境界を確認してから比較し，最初の一致で停止する。走査は'+(reverse?'大きい番号から小さい番号':'小さい番号から大きい番号')+
    'へ'+step+'ずつ進む。両端にある場合は'+(reverse?'N':'1')+'で停止し，一致しない場合は'+absent+'で境界を外れる。');
});
const instructions = define(18,'単位時間当たりの百万命令の数','MIPSを1秒当たり百万命令として解釈する。同じナノ秒とマイクロ秒の四択。',i=>{
  const speed=[50,40,125,80][i], nanoseconds=1000/speed;
  const options=[source[18].choices,['20ナノ秒','25ナノ秒','250ナノ秒','2.5マイクロ秒'],
    ['8ナノ秒','12.5ナノ秒','80ナノ秒','1.25マイクロ秒'],
    ['8ナノ秒','12.5ナノ秒','80ナノ秒','1.25マイクロ秒']][i];
  return textBody(source[18].prompt.replace('50MIPS',speed+'MIPS'),options,options.indexOf(nanoseconds+'ナノ秒'),
    '1秒に'+speed+'×10⁶命令を実行するので，1命令当たりは1÷('+speed+'×10⁶)秒。1秒＝10⁹ナノ秒から'+
    '1,000÷'+speed+'＝'+nanoseconds+'ナノ秒。');
});
const effectiveMemory = define(19,'4組のキャッシュ・主記憶時間・ヒット率','ヒットとミスについて実効時間を比較する。元問題を含め、キャッシュ照合をミス時に足す方法と足さない方法で最小の組を一致させる。',i=>{
  const rows=memoryRows[i];
  const penalty=[0,8,10,16][i];
  const mean=rows.map(([cache,hit,main])=>(cache*hit+(main+penalty)*(100-hit))/100);
  const serial=rows.map(([cache,hit,main])=>(cache*100+(main+penalty)*(100-hit))/100);
  const headers=['キャッシュ（ナノ秒）','ヒット率（％）','主記憶（ナノ秒）'];
  const prompt=source[19].prompt+(penalty?'ただし，主記憶にアクセスするときは，バンクの空きを待つ時間として，表の主記憶アクセス時間に1回当たり'+penalty+'ナノ秒を加える。':'');
  return body(prompt,rows.map(row=>[table('アクセス時間・ヒット率の組',headers,[row.map(String)])]),
    mean.indexOf(Math.min(...mean)),
    (penalty?'主記憶の時間に空き待ちの'+penalty+'ナノ秒を足す。':'')+
    'ヒット時間とミス時の主記憶時間の重み付き平均は，アから順に'+mean.join('，')+'ナノ秒。'+
    'ミスでもキャッシュ照合が先に加わる場合は'+serial.join('，')+'ナノ秒となる。最短の組はどちらの方法でも同じ。');
});
const rotation = define(21,'磁気ディスクの回転数と平均位置決め時間','回転待ちを半回転として位置決め時間に加える。元と同様、その平均に最も近い整数ミリ秒を選ぶ。',i=>{
  const [rpm,seek]=[[4200,5],[3000,4],[7500,6],[6000,2]][i];
  const mean=seek+30000/rpm;
  const choices=source[21].choices;
  const correct=choices.map(value=>Math.abs(Number(value)-mean));
  return textBody(source[21].prompt.replace('4,200',grouping(rpm)).replace('が5ミリ秒','が'+seek+'ミリ秒')+
    '位置決めと平均回転待ちの両方を含める。',
    choices,correct.indexOf(Math.min(...correct)),
    '1回転は60,000÷'+grouping(rpm)+'ミリ秒，平均回転待ちはその半分。位置決めの'+seek+
    'ミリ秒を加えた'+Number(mean.toFixed(2))+'ミリ秒に最も近い選択肢を求める。');
});
const cylinders = define(22,'レコード長、件数、ブロック化、ディスクの仕様','ブロックは複数セクタにまたがり、末尾の余りを次に使えない。ブロック当たりとシリンダ数の切上げを維持する。',i=>{
  const {bytes,count,recordsPerBlock,tracks,sectors,sectorBytes}=diskCases[i];
  const blockBytes=bytes*recordsPerBlock;
  const block=Math.ceil(blockBytes/sectorBytes), countBlocks=count/recordsPerBlock, inCylinder=tracks*sectors;
  const sectorsNeeded=countBlocks*block, needed=Math.ceil(sectorsNeeded/inCylinder);
  const options=i===0?source[22].choices:[
    Math.ceil(count*bytes/(inCylinder*sectorBytes)), Math.floor(sectorsNeeded/inCylinder),
    needed, Math.ceil(count*Math.ceil(bytes/sectorBytes)/inCylinder),
  ].map(String);
  const displayCount=count%10000===0?count/10000+'万':grouping(count);
  return textBody([p(source[22].prompt.replace('200バイト',bytes+'バイト').replace('10万件',displayCount+'件')
    .replace('10レコードを',recordsPerBlock+'レコードを')),
  table('表　磁気ディスク装置の仕様',['項目','値'],[
    ['トラック数／シリンダ',String(tracks)],['セクタ数／トラック',String(sectors)],['バイト数／セクタ',String(sectorBytes)],
  ])],options,options.indexOf(String(needed)),
    '1ブロックは'+grouping(blockBytes)+'バイトなので，末尾の余りを使わないため'+block+'セクタ。'+
    grouping(countBlocks)+'ブロックで'+grouping(sectorsNeeded)+'セクタになる。1シリンダの'+grouping(inCylinder)+
    'セクタで割り切れない端数を切り上げるので，必要なシリンダ数は'+needed+'。');
},true);
export const calculations2004SpringAm0126=[
  binaryFraction,unknownBase,floatParts,shift,drawBalls,sumLogic,nestedEq,branch,codes,stack,hash,
  recursion,search,instructions,effectiveMemory,rotation,cylinders,
];
