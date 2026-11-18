import { p, table } from './definition';
import { body, define, formula, grouping, source, textBody } from './legacy-2005-autumn-am-01-26-shared';
import { draw } from './legacy-2005-autumn-am-01-26-figures';
import { bits, treeArities, xorCases } from './legacy-2005-autumn-am-01-26-model';

const finite = define(1, '変換先の基数と十進小数', '既約分母が変換先の基数の累乗を割り切れるかを判定する。小数の桁幅と四択を保つ。', i => {
  const conditions = [
    [8, source[1].choices], [12, ['0.25','0.45','0.6','0.9']],
    [15, ['0.1','0.3','0.4','0.55']], [18, ['0.6','0.75','0.9','0.4']],
  ] as const;
  const [base, options] = conditions[i];
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const denominators = options.map(value => {
    const digits = value.split('.')[1], scale = 10 ** digits.length;
    return scale / gcd(Number(digits), scale);
  });
  const answer = denominators.findIndex(value => base ** 4 % value === 0);
  return textBody(source[1].prompt.replace('8進数',base+'進数'), options, answer,
    options[answer]+'の既約分母は'+denominators[answer]+'で，'+base+
    'の累乗を割り切る。基数の素因数でない因数が分母に残るものは有限桁にできない。');
});

const keyAddress = define(2, '11進数とみなす五桁のキー', '固定の0.5、4桁の取出しと切捨てを維持。元の十進解釈、基数や取出し位置の誤りと比較する。', i => {
  const key = ['55550','35181','47026','79549'][i];
  const scaled = (value: number) => Math.floor(value % 10000 / 2);
  const proper = parseInt(key,11), correct = scaled(proper);
  const options = i === 0 ? source[2].choices : [correct, scaled(Number(key)), scaled(parseInt(key,12)), Math.floor(proper / 10) % 5000]
    .sort((a,b)=>a-b).map(value=>String(value).padStart(4,'0'));
  const address = String(correct).padStart(4,'0');
  return textBody(source[2].prompt.replace('55550',key), options, options.indexOf(address),
    key+'を11進数として桁の重みを足すと十進数で'+proper+'。下4けたは'+String(proper%10000).padStart(4,'0')+
    'で，0.5倍して小数点以下を切り捨てるとアドレスは'+address+'になる。');
});

const shift = define(3, '左シフトのビット数', 'あふれなしでシフト後の値に元の整数を加える。シフト数の加算や元値の加算漏れを区別する。', i => {
  const distance = [3,4,5,6][i], scale = 2 ** distance, options = [distance+1,scale-1,scale,scale+1];
  return textBody(source[3].prompt.replace('3ビット',distance+'ビット'), options, 3,
    '2進数を左に'+distance+'ビット移すと各桁の位が上がり，あふれがなければ値は'+scale+'倍。さらに元のmを加えるため'+options[3]+'倍である。');
}, true);

const remainder = define(4, '負の被除数と正の法', '非負の剰余という原定義と、負号を外に出す、正負を取り違える、法から差を取る四役を保つ。', i => {
  const [negative, mod] = [[10000,32768],[12000,65536],[990,4096],[3000,8192]][i], adjusted = mod-negative;
  const src = source[4].prompt, boundary=src.indexOf('このm');
  const suffix = src.slice(boundary).replace('10000',String(negative)).replace('32768',String(mod));
  const alternatives = ['−（'+negative+' mod '+mod+'）','（−'+adjusted+'）mod '+mod,negative+' mod '+mod,adjusted+' mod '+mod];
  return textBody([p(src.slice(0,boundary)),formula('n=kp+m\\quad(0\\le m<p)',source[4].material),p(suffix)], alternatives, 3,
    '−'+negative+'＝（−1）×'+mod+'＋'+adjusted+'。'+adjusted+'は0以上'+mod+'未満なので，原定義の剰余は'+adjusted+'である。');
}, true);

const solveTime = define(7, '連立方程式の元数、実測時間と演算速度', '未知数個数の3乗と速度倍率を比較する。割り切れる四条件と原問の10倍刻みを保つ。', i => {
  const [small, large, elapsed, faster] = [[100,1000,2,4],[100,1000,4,5],[200,1000,16,5],[120,1200,3,3]][i];
  const ratio = large/small, time = elapsed*ratio**3/faster, choices=[time/100,time/10,time,time*10];
  const prompt = source[7].prompt.replace('100元',small+'元').replace('2秒',elapsed+'秒')
    .replace('4倍の演算速度',faster+'倍の演算速度').replace('1,000元',grouping(large)+'元');
  return textBody(prompt, choices.map(grouping), 2,
    '未知数は'+ratio+'倍なので同じ速度なら計算に'+ratio**3+'倍の時間がかかる。演算速度が'+faster+'倍なので，'+elapsed+'×'+ratio**3+'÷'+faster+'＝'+time+'秒。');
}, true);

const xorKey = define(8, '装置への入力と変更後の出力・各内部かぎ', '4ビットXOR三段の装置図を保ち、元と変更後の出力を同じ条件から更新する。四択は昇順の四つのビット列。', i => {
  const c = xorCases[i], before=c.input^c.a^c.b^c.c, after=c.input^c.a^c.c^c.target;
  const stem = source[8].prompt.replace('入力ビット列1101','入力ビット列'+bits(c.input)).replace('出力ビット列0100','出力ビット列'+bits(before))
    .replace('出力ビット列が1111','出力ビット列が'+bits(c.target));
  return textBody([p(stem),draw('xor-chain',i,'ユニットA・B・Cの構成')],source[8].choices,source[8].choices.indexOf(bits(after)),
    '各段の排他的論理和を並べると，入力と三つのかぎのXORが出力。変更後のかぎBは'+
    [c.input,c.a,c.c,c.target].map(bits).join(' XOR ')+'＝'+bits(after)+'である。');
});

const nand = define(9, 'NANDだけで表す二変数論理関数', 'X・Yを使うNANDのみの式4択。目標とする二変数の真理値を変え、全四状態の結果を比較する。', i => {
  const operations = ['X OR Y','X AND Y','（NOT X）OR Y','X OR（NOT Y）'];
  const original = source[9].choices;
  const choices = i === 0 ? original : ['X NAND (X NAND Y)',original[1],original[2],'Y NAND (X NAND Y)'];
  const answer = [1,2,0,3][i];
  return textBody(source[9].prompt.replace('X OR Yを',operations[i]+'を'),choices,answer,[
    'X NAND XとY NAND Yはそれぞれの否定。その二つをNANDすると，少なくとも一方が1のときに1となる。',
    'X NAND Yを同じ式とのNANDに入れると，否定がもう一度かかる。二つがともに1のときだけ結果は1。',
    'Xが0なら式全体は1。Xが1なら内側はNOT Yとなるので外側の否定によりYとなる。',
    'Yが0なら式全体は1。Yが1なら内側はNOT Xとなるので外側の否定によりXとなる。',
  ][i]);
});

const pattern = define(10, '英字・数字の並びと繰返し回数', '英大文字と数字の二群、直前一群の0回以上・1回以上、余計な文字の混入を保持。文字種と量指定の位置を変える。', i => {
  const expressions = ['[A-Z]+[0-9]*','[A-Z]*[0-9]+','[0-9]+[A-Z]*','[0-9]*[A-Z]+'];
  const options = [source[10].choices,['KLM','5378','UV8＊','N5D'],['QTX','78＋LM','25GHD','GH205'],['81BD','32101','H22','21＊P']][i];
  const expression = expressions[i], regex = new RegExp('^'+expression+'$','u');
  const answer = options.findIndex(input=>regex.test(input));
  const material = ['[A-Z]は英字1文字を表す。','[0-9]は数字1文字を表す。','＊は直前の正規表現の0回以上の繰返しを表す。','＋は直前の正規表現の1回以上の繰返しを表す。'];
  return textBody([p(source[10].prompt.replace('[A-Z]＋[0-9]＊',expression.replace('+','＋').replace('*','＊'))),...material.map(p)],options,answer,
    '＋の直前の文字種が連続して1文字以上，＊の直前の文字種は続けて0文字以上。指定された順序と文字種に最後まで一致するのは'+options[answer]+'だけである。');
});

const tree = define(12, '木の各節点がもつ子の数', 'すべての葉が同じ深さで各内部節点の子の個数が同じという条件を保つ。全四択が例の深さ2に一致する。', i => {
  const branch = treeArities[i], subtotal = 1+branch+branch**2;
  const count=['二つ','三つ','四つ','五つ'][i];
  const stem=source[12].prompt.replace('二つ',count).replaceAll('2分木',branch+'分木');
  const correct=branch===2?'n=2^{k+1}-1':'n=\\frac{'+branch+'^{k+1}-1}{'+(branch-1)+'}';
  const forms = ['n=k(k+1)+'+(subtotal-6),'n='+branch+'^k+'+(branch+1),correct,'n=(k-1)(k+1)+'+(subtotal-3)];
  const alts = ['n＝k(k＋1)＋'+(subtotal-6),'n＝'+branch+'のk乗＋'+(branch+1),
    'n＝（'+branch+'の（k＋1）乗−1）'+(branch===2?'':'÷'+(branch-1)),'n＝(k−1)(k＋1)＋'+(subtotal-3)];
  return body([p(stem),draw('full-tree',i,'同じ深さに葉をもつ'+branch+'分木の例')],forms.map((form,k)=>[formula(form,alts[k])]),2,
    '深さ0からkまでの節点数は順に1，'+branch+'，'+branch+'の2乗，…，'+branch+'のk乗。総和は等比数列の和の式に一致する。深さ2の例だけでは四択を区別できない。');
}, true);

const recursive = define(15, '再帰関数の二つの引数', 'k＝0、k＝nの端点と内部の加算を保持。nは4〜6、加算負担を大きく増やさない。', i => {
  const [n,k] = [[4,2],[5,2],[6,2],[6,3]][i];
  function visit(a: number,b: number): number { return b === 0 || a === b ? 1 : visit(a-1,b-1)+visit(a-1,b); }
  const answer = visit(n,k),left = visit(n-1,k-1),right = visit(n-1,k);
  const choices = [[3,4,5,6],[4,6,10,12],[10,12,15,20],[10,15,20,21]][i].map(String);
  return textBody([p(source[15].prompt.replace('f(4，2)','f('+n+'，'+k+')')),
    formula('f(n,k)=\\begin{cases}1 &(k=0)\\\\f(n-1,k-1)+f(n-1,k)&(0<k<n)\\\\1 &(k=n)\\end{cases}',source[15].material)],
    choices,choices.indexOf(String(answer)),
    '端のk＝0及びk＝nは1。f('+n+'，'+k+')は，f('+(n-1)+'，'+(k-1)+')とf('+(n-1)+'，'+k+
    ')の和で，'+left+'＋'+right+'＝'+answer+'になる。');
});

const gates = define(16, '出力が1になるビット個数の条件', '各択にある二組のXORと二段目の回路構成・凡例を保持。入力側の個数条件を変え、16通りの真理値で比較する。', i => {
  const conditions = [
    '1の入力数が0個又は偶数個のとき出力が1，奇数個のとき出力が0になる',
    '1の入力数が奇数個のとき出力が1，0個又は偶数個のとき出力が0になる',
    '上側の2ビットと下側の2ビットの両方で1の入力数が1個ずつのとき出力が1，それ以外のとき出力が0になる',
    '上側の2ビットと下側の2ビットのどちらでも1の入力数が0個又は2個のとき出力が1，それ以外のとき出力が0になる',
  ];
  return body([p('4ビットの入力データに対し，'+conditions[i]+'回路はどれか。ここで，図中の記号は次の回路を表す。'),
    draw('gate-legend',0,'AND・OR・XOR・NOT回路の記号')],
    [0,1,2,3].map(choice=>[draw('logic-choice',choice,'論理回路 '+ 'アイウエ'[choice])]), [3,2,0,1][i], [
      '二つずつに分けたXORをもう一度XORすると，全4ビットの1の個数が奇数の場合に1になる。その結果を反転すると偶数個で1。',
      '各XORはその組に1が一つのときだけ1。二組の結果のXORで，全体の個数が奇数のときだけ1になる。',
      '各XORはその組に1が一つのときだけ1。両方が1であることをAND（論理積）で判定する。',
      '各XORはその組に1が一つのときに1。どちらにもそのような組がないことをOR（論理和）の反転で判定する。',
    ][i]);
});

const indexAddress = define(18, 'アドレス表の三つの値', 'インデックス寄与・命令語の指定値・命令の格納場所の三行を保持。四つの組合せを同じ昇順で比較する。', i => {
  const [x,address,location] = [[10,100,1000],[30,240,1800],[80,460,1500],[150,300,1200]][i];
  const options=[x+address,x+location,address+location,x+address+location];
  return textBody([p(source[18].prompt),table('アドレス指定の値',['項目','値'],[
    ['インデックスレジスタの値',String(x)],['命令語のアドレス部の値',String(address)],['命令が格納されているアドレス',String(location)],
  ])],options,0,'インデックス修飾ではアドレス部にインデックスレジスタの値を加える。'+address+'＋'+x+'＝'+(address+x)+'。命令が置かれた番地を基準に足す方式とは異なる。');
}, true);

const performance = define(19, 'CPUの周波数、各命令の所要クロックと出現率', '3種の重み、百分率尺度、整数クロック、概算MIPSの原形式を保つ。割り切れる入力で追加の丸めを避ける。', i => {
  const configurations = [
    [700,[4,8,10],[30,60,10]], [450,[6,10,12],[40,30,30]], [392,[3,6,10],[40,40,20]], [64,[4,6,8],[20,40,40]],
  ] as const;
  const [mhz,clocks,ratios] = configurations[i], weights=clocks.map((cycles,index)=>cycles*ratios[index]);
  const hundred=weights.reduce((sum,value)=>sum+value,0), correct=Math.round(mhz*100/hundred);
  return textBody([p(source[19].prompt.replace('700 MHz',mhz+' MHz')),table('命令実行に必要なクロック数と出現率',
    ['命令の種別','命令実行に必要なクロック数','出現率（％）'],
    ['レジスタ間演算','メモリ・レジスタ間演算','無条件分岐'].map((name,j)=>[name,String(clocks[j]),String(ratios[j])]))],
    source[19].choices,source[19].choices.indexOf(String(correct)),
    'CPU（Central Processing Unit、中央処理装置）が1命令に必要とする平均は（'+weights.join('＋')+'）÷100＝'+hundred/100+
    'クロック。'+mhz+' MHzをこの平均で割って，'+correct+' MIPS（Million Instructions Per Second、毎秒100万命令に相当する単位）。');
});

const access = define(22, '磁気ディスクの回転数、位置決め時間、ブロックとトラックの容量', '十進のkバイト表記、平均回転待ち、転送と位置決めを保持。平均待ちも転送も整数ms。制御時間は無視する。', i => {
  const [rpm,seek,track,block]=[[6000,20,20,4],[3000,18,20,4],[7500,12,40,10],[10000,14,24,8]][i];
  const turn=60000/rpm, transferring=turn*block/track;
  const stem=source[22].prompt.replace('6,000回転',grouping(rpm)+'回転').replace('20ミリ秒',seek+'ミリ秒')
    .replace('記憶容量20 kバイト','記憶容量'+track+' kバイト').replace('1ブロック4 kバイト','1ブロック'+block+' kバイト');
  return textBody(stem,[seek,seek+transferring,seek+turn/2+transferring,seek+turn+transferring],2,
    '1回転は'+turn+'ミリ秒で平均回転待ち時間はその半分の'+turn/2+'ミリ秒。転送はトラックの'+block+'÷'+track+
    'なので'+transferring+'ミリ秒。平均位置決め時間'+seek+'ミリ秒と足して'+(seek+turn/2+transferring)+'ミリ秒。');
}, true);

const capacity = define(23, 'レコード数・長さ、ブロック件数とディスクの各階層容量', 'ブロック末尾の余りを使わない規則を固定。全量を合計してから丸める、端数セクタを切り捨てるなどの誤答を比較する。', i => {
  const [record,tenThousands,perBlock,tracks,sectors,bytes] = [
    [500,50,50,20,25,512],[400,50,50,20,25,512],[600,48,40,20,25,1024],[700,36,30,24,25,512],
  ][i];
  const count=tenThousands*10000, cylinders=tracks*sectors, blocks=count/perBlock, bytesPerBlock=record*perBlock;
  const per=Math.ceil(bytesPerBlock/bytes), correct=Math.ceil(per*blocks/cylinders);
  const choices=[Math.ceil(Math.floor(bytesPerBlock/bytes)*blocks/cylinders),Math.ceil(record*count/bytes/cylinders),correct,
    Math.ceil(Math.ceil(record/bytes)*count/cylinders)];
  const stem=source[23].prompt.replace('500バイト',record+'バイト').replace('50万件',tenThousands+'万件').replace('50レコード',perBlock+'レコード');
  return textBody([p(stem),table('磁気ディスク装置の仕様',['項目','値'],[
    ['トラック数／シリンダ',String(tracks)],['セクタ数／トラック',String(sectors)],['バイト数／セクタ',String(bytes)],
  ])],choices.map(grouping),2,
    '1ブロックは'+grouping(bytesPerBlock)+'バイトなので，末尾に余りが出ても'+per+'セクタを占有する。'+grouping(blocks)+
    'ブロック分は'+grouping(per*blocks)+'セクタ。1シリンダは'+cylinders+'セクタなので，端数を切り上げて'+correct+'シリンダ。');
}, true);

export const calculations2005AutumnAm0126 = [finite,keyAddress,shift,remainder,solveTime,xorKey,nand,pattern,tree,recursive,gates,indexAddress,performance,access,capacity];
