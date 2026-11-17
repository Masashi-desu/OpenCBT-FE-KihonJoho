import { p, table } from './definition';
import { body, define, source, textBody } from './legacy-2006-autumn-am-01-26-shared';
import { draw } from './legacy-2006-autumn-am-01-26-figures';
import { architectureCases, floatCases, gateCases, letters, machineCases, pipelineCases } from './legacy-2006-autumn-am-01-26-model';

const upper=(n:number,width:number)=>n.toString(16).toUpperCase().padStart(width/4,'0');
const group=(n:number)=>n.toLocaleString('en-US');
const maximum=define(1,'ビット幅、1の個数、最大か最小か',4,'符号なし、1の個数の制約と10進整数の数値候補を保持。上位へ集める条件と下位へ集める条件を分ける。',index=>{
 const [width,ones,max]=([[8,4,true],[8,3,false],[10,3,true],[8,5,false]] as const)[index];
 const low=2**ones-1, high=low*2**(width-ones), answer=max?high:low;
 const choices=index?[low,low*2,high/2,high].sort((a,b)=>a-b).map(String):source[1].choices;
 const prompt=index?width+'ビットのデータで1のビット数が'+ones+'であるもののうち，符号なしの2進整数として見たときに'+(max?'最大':'最小')+'になるものを，10進整数として表したものはどれか。':source[1].prompt;
 return textBody(prompt,choices,choices.indexOf(String(answer)),(max?'上位':'下位')+'に'+ones+'個の1を集める。得られる2進数は'+answer.toString(2).padStart(width,'0')+'で，10進整数では'+answer+'である。');
});
const shift=define(2,'左シフトのビット数と加減する元の数',4,'左シフトに続くxの加減と倍率を求める構成。正の元データ・オーバフローなしを保つ。',index=>{
 const [bits,delta]=([[2,1],[3,1],[4,-1],[1,1]] as const)[index], answer=2**bits+delta;
 const choices=index?[answer-2,answer-1,answer,answer+1].map(String):source[2].choices;
 const prompt=source[2].prompt.replace('2ビット左',bits+'ビット左').replace('x を加える',delta===1?'x を加える':'x を引く')
  .replace('シフトによるあふれ',index?'これらの操作によるあふれ':'シフトによるあふれ');
 return textBody(prompt,choices,2,'左へ'+bits+'ビットシフトすると元の値の'+2**bits+'倍になり，元の値を'+(delta===1?'足す':'引く')+'と'+answer+'倍になる。'+(index?'':' 原問はシフトのあふれを除外し，加算も算術として扱う。固定語長で加算があふれて値が折り返す場合の結果は別になる。'));
},true);
const mask=define(3,'検査する2の累乗の倍数',4,'8ビット・マスクの下位と上位・ANDとORを原順で比較。末尾の桁数を変える。',index=>{
 const bits=[4,2,3,5][index], low='0'.repeat(8-bits)+'1'.repeat(bits), high='1'.repeat(8-bits)+'0'.repeat(bits);
 const choices=[low,high].flatMap(value=>['積','和'].map(op=>'x と2進数'+value+'のビットごとの論理'+op+'をとった結果が0である。'));
 return textBody(source[3].prompt.replace('16の倍数',2**bits+'の倍数'),choices,0,'2の'+bits+'乗の倍数では下位'+bits+'ビットがすべて0になる。AND（論理積）で下位だけを取り出して結果が0か調べる。');
},true);
const float=define(4,'仮数幅・指数幅・最大値か最小値か',4,'S/E/Mの原図構成、16進と基数16の値、正/負の極値を保つ。表現形式を独自の範囲で変更。',index=>{
 const {width,exponent,mantissa,bias,negative}=floatCases[index], exp=2**exponent-1,m=2**mantissa-1,sign=2**(width-1), high=exp*2**mantissa;
 const choices=[(exp>>1)*2**mantissa+m,high+m,sign+(exp>>1)*2**mantissa+m,sign+high+m].map(value=>upper(value,width));
 const prompt=source[4].prompt.replace('24ビット',width+'ビット').replace('最大値',negative?'最小値':'最大値')
  .replace('⁻⁶⁴×0.M',bias===64?'⁻⁶⁴×0.M':bias===4?'⁻⁴×0.M':'⁻⁶⁴×0.M');
 return textBody([p(prompt),draw('float',index,'S・E・Mで表す浮動小数点形式')],choices,negative?3:1,
  '絶対値を最大にするには最大の指数'+exp+'と仮数部の全ビット1を用いる。符号ビットを'+Number(negative)+'にすると'+(negative?'負の最低値':'非負の最大値')+'の表現になる。');
});
const fixed=define(5,'符号付き固定小数点数のビット数と極値',4,'2の補数の原表記と16進数四択を維持。幅と最小・最大を可変。小数点位置には依存しない。',index=>{
 const [width,minimum]=([[16,true],[12,false],[8,true],[24,false]] as const)[index], p=2**(width-1);
 const values=[p-1,p,p+1,2*p-1], choices=values.map(value=>upper(value,width));
 return textBody(source[5].prompt.replace('16ビット',width+'ビット').replace('最小値',minimum?'最小値':'最大値'),
 choices,minimum?1:0,'2の補数で最上位の重みは負になる。'+(minimum?'最上位だけを1にすると最小値':'最上位を0、残りを全て1にすると最大値')+'となる。');
});
const chooseGroup=define(7,'選ぶ人数と最低人数条件',4,'同じ組合せの数を問う。全体から最低人数に満たない組を除く。',index=>{
 const [m,w,k,required]=([[3,5,3,1],[4,4,3,1],[4,5,3,2],[3,6,4,1]] as const)[index];
 const combination=(total:number,take:number)=>take<0||take>total?0:Array.from({length:take},(_,i)=>(total-i)/(i+1)).reduce((x,y)=>x*y,1);
 const count=Math.round(Array.from({length:m-required+1},(_,i)=>combination(m,i+required)*combination(w,k-i-required)).reduce((a,b)=>a+b,0));
 const total=Math.round(combination(m+w,k));
 const choices=index?[Math.round(combination(m,w===4?2:1)*combination(w,k-1)),Math.round(combination(w,k)),count,total].map(String):source[7].choices;
 return textBody('男子'+m+'人，女子'+w+'人の中から'+k+'人を選ぶとき，男子が少なくとも'+required+'人含まれる選び方は何通りあるか。',choices,2,
  '男子の人数が'+required+'以上の場合ごとに，男子の選び方と女子の選び方を掛けて合計する。条件を満たすのは'+count+'通りである。');
},true);
const bitAlgorithm=define(8,'下位ビットを使う目的と例',4,'非ゼロ・A−1・XOR・最後の二入力演算。残す対象（最下位1・除いた値・下位ビットをすべて1とする場合・最下位の1を反転した補集合）と例を変える。',index=>{
 const data=[40,76,58,88][index], target=[8,75,59,~(88&(88^(88-1)))&255][index];
 const bits=(n:number)=>n.toString(2).padStart(8,'0');
 const descriptions=['最も右にある1を残し，ほかのビットをすべて0にする','Aから1を引いた結果のビット列に置き換える',
  'Aの1を保ち，最も右にある1より右のビットもすべて1にする','最も右にある1の位置だけを0とし，残りのビットをすべて1にする'];
 const prompt=source[8].prompt.replace(descriptions[0],descriptions[index]).replace('00101000',bits(data)).replace('00001000',bits(target));
 return textBody([p(prompt),
  p('手順1　与えられたビット列 A を符号なしの2進数と見なし，Aから1を引き，結果を B とする。'),
  p('手順2　AとBの排他的論理和（XOR）を求め，結果を C とする。'),
  p('手順3　AとCの［a］を求め，結果を A とする。')],source[8].choices,[2,0,3,1][index],
 'A−1では最右の1から右の範囲だけが反転する。Cはその範囲だけが1になる。最後に'+source[8].choices[[2,0,3,1][index]]+
 'を適用すると，例では'+bits(target)+'になる。');
});
const logical=define(9,'関数Fの8行の真理値',4,'変数三つ、8行の表、否定・積・和の元式群。選択肢の各真理値を別々に出題する。',index=>{
 const trueRows=[[1,2,6,7],[2,6,7],[2,3,6,7],[0,1,4,5]][index];
 const options=source[9].choices;
 const rows=Array.from({length:8},(_,i)=>[...i.toString(2).padStart(3,'0'),String(Number(trueRows.includes(i)))]);
 return textBody([p(source[9].prompt),table('真理値表',['X','Y','Z','F'],rows)],options,[2,0,1,3][index],
  '論理積の各項が1となる行をまとめて論理和を取る。選んだ式だけが行番号を000〜111としたときに '+trueRows.map(i=>i.toString(2).padStart(3,'0')).join('，')+' で1となる。');
});
const substrings=define(10,'全体の長さと部分文字列の最短長',4,'位置が連続する部分列を数える例、最短長以上、和の選択肢を固定。異なる境界で許される開始点を数える。',index=>{
 const [n,min]=([[100,10],[80,8],[100,20],[96,6]] as const)[index], end=n-min+1;
 const options=index?[end-2,end-1,end,n-1].map(value=>'1＋2＋3＋…＋'+(value-1)+'＋'+value):source[10].choices;
 const prompt=source[10].prompt.replace('長さ100', '長さ'+n).replace('c₁₀₀','c'+n.toString().replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[Number(d)])).replace('長さ10以上','長さ'+min+'以上');
 return textBody(prompt,options,2,'長さ'+min+'のものは'+end+'か所から始められ，長くなるごとに開始位置が一つずつ減る。長さ'+n+'は1か所なので，求める式は1から'+end+'までの和である。');
},true);
const automaton=define(11,'遷移図の連続文字と受理までの段数',4,'初期と受理の凡例、戻り矢印と吸収状態、4文字列を保つ。連続長と遷移記号を変える。',index=>{
 const {run,repeat,words}=machineCases[index];
 const target=String(run).repeat(repeat);
 const correct=words.findIndex(word=>word.endsWith(target)&&!word.includes(target+run));
 return textBody([p(source[11].prompt),draw('state-legend',0,'状態の記号'),draw('states',index,'有限オートマトン')],words,correct,
 '受理状態は連続して'+target+'を読み終えたときに達する。その直後にさらに'+run+'を読むと吸収状態に入る。4候補を追うと'+words[correct]+'だけが受理状態で終わる。');
});
const traversal=define(12,'木と式の記法で参照する手順',4,'四則演算の三記法・三式併記と輪郭に沿う巡回図。異なる木に加え、生成版ではどの規則を適切とするかを切り替える。',index=>{
 const prompt=[p(source[12].prompt),draw('tree',index,'木の巡回と三つの記法'),p('各記法で式を書く手順の説明として，適切なものはどれか。')];
 const options=[...source[12].choices];
 if(index===1){ options[0]='前置記法：節に下りたときにそこの記号を書く。'; options[2]='後置記法：節に下りたときにそこの記号を書く。'; }
 if(index===2){ options[1]='中置記法：葉の記号はその葉で，演算子の記号は左の枝から右の枝へ移るときに書く。'; options[2]='後置記法：節に下りたときにそこの記号を書く。'; }
 if(index===3){ options[2]='後置記法：左の枝から右の枝に移るときにそこの記号を書く。'; options[3]=options[3].replace('後置記法','中置記法'); }
 return textBody(prompt,options,letters[index][1],[
 '後置記法は左の部分木，右の部分木，節の順に記号を書く。節から上へ戻る時点なら左右の処理が終わっている。',
 '前置記法ではその節の記号を最初に書き，左と右の部分木を続ける。',
 '中置記法では演算子を左右の項の間に置く。左の処理を終えて右へ移る時点で演算子を書く。',
 '括弧を下るときと上るときに置き，演算子を左右の枝の間に置く規則では，中置記法の式になる。',
 ][index]);
});

const links=define(13,'連結セルの置換対象と新要素',4,'行番号の表と2操作×4候補。置換に先立つ次ポインターの保存が必要。実際に置換する位置を変える。',index=>{
 const places=['東京','品川','名古屋','新大阪','新横浜'], next=[2,3,4,0];
 const old=[2,3,2,3][index], previous=old-1, added=index>=2?6:5, extra='三河安城';
 const names=index>=2?[...places,extra]:places;
 const desired=places.slice(0,4); desired[old-1]=names[added-1];
 const rows=names.map((name,i)=>[String(i+1),'“'+name+'”',String(next[i]??'')]);
 const connection=added+'→A('+previous+',2)';
 const copy='A(A('+previous+',2),2)→A('+added+',2)', wrong='A(A('+old+',2),2)→A('+added+',2)';
 const options=[[connection,copy],[connection,wrong],[copy,connection],[wrong,connection]];
 const prompt=source[13].prompt.replace('東京，新横浜，名古屋，新大阪',desired.join('，'));
 return body([p(prompt),table('配列 A',['行','1','2'],rows)],options.map(option=>[table('操作の順',['第1の操作','第2の操作'],[option])]),2,
 '変更するノードの前行は'+previous+'で，そのリンク先は現在'+old+'である。先に'+old+'のリンクを行'+added+'へコピーし，その後'+previous+'のリンクを'+added+'へ差し替える。');
},true);
const comparisons=define(14,'探索アルゴリズムと比較回数の基準',4,
 '整列配列の2分探索・比較回数の式を問う。二分割、線形走査、初回比較で成功する状況、総探索回数を変え、log nの意味を比較。',index=>{
 const prompts=[source[14].prompt,
 '昇順に整列された n 個のデータが配列に格納されている。探索したい値を配列の先頭から順に探し，値が末尾にあるときの比較回数を求める式はどれか。',
 '昇順に整列された n 個のデータが配列に格納されている。その末尾の値を先頭から順に探す操作を n 回行うときの比較回数を求める式はどれか。',
 '昇順に整列された n 個のデータが配列に格納されている。探索したい値が2分探索の最初の中央要素と一致するとき，探索の比較回数を求める式はどれか。'];
 const options=index===3?['log₂ n','1','n','n²']:source[14].choices;
 return textBody(prompts[index],options,[0,2,3,1][index],[
 '比較のたびに候補の範囲がほぼ半分になる。nから1まで半減する回数はおよそlog₂ nである。',
 '末尾を見つけるまで先頭からn件を調べるため，比較はn回である。',
 '1回の探索にn回の比較が必要であり，n回繰り返すとn²回になる。',
 '2分探索は現在の範囲の中央から調べる。最初に中央要素と一致するため，比較は1回である。',
 ][index]);
});
const storage=define(15,'配列に格納する順と衝突時の試行位置',4,'正の整数、ゼロ初期値、三段階の剰余を保持。全入力で格納可能で，目標は1回目〜3回目・先頭への回り込みで入る。',index=>{
 const cases=[[16,43,73,24,85],[12,22,25,31,74],[17,27,38,26,59],[41,72,84,45,64]];
 const values=cases[index], data=Array<number>(10).fill(0), trace=values.map(value=>{
  const slot=[0,1,4].map(offset=>(value+offset)%10).find(i=>data[i]===0)!; data[slot]=value;return slot;
 });
 const target=values.at(-1)!, end=trace.at(-1)!;
 const options=index?[target%10,(target+1)%10,(target+4)%10,(target+7)%10].sort((a,b)=>a-b).map(x=>'A['+x+']'):source[15].choices;
 const prompt=source[15].prompt.replace('16，43，73，24，85',values.join('，')).replace('85 が',target+' が');
 return textBody([p(prompt),p('〔規則〕'),p('（1）A[k mod 10]＝0 ならば，k → A[k mod 10] とする。'),
  p('（2）（1）で格納できないとき，A[(k＋1) mod 10]＝0 ならば，k → A[(k＋1) mod 10] とする。'),
  p('（3）（2）で格納できないとき，A[(k＋4) mod 10]＝0 ならば，k → A[(k＋4) mod 10] とする。')],options,options.indexOf('A['+end+']'),
  '格納位置は入力順にA['+trace.join(']，A[')+']となる。各入力について空きのある位置を規則の優先順に試す。最後の'+target+'はA['+end+']に入る。');
});
const gate=define(17,'回路入力と各段の基本ゲート',4,'AND・OR・NOTの凡例と三端子P/Q/Rの4群。回路・値を変えて各出力を計算。',index=>{
 const {a,b,c,firstAnd,secondOr}=gateCases[index], pp=firstAnd?a&b:a|b, q=secondOr?pp|c:pp&c, r=1-q;
 const rows=index?[[0,0,1],[0,1,0],[1,0,1],[1,1,0]].map(row=>row.join('；')):source[17].choices;
 return body([p(source[17].prompt.replace('A＝1，B＝0，C＝1','A＝'+a+'，B＝'+b+'，C＝'+c)),p('ここで，次の図はそれぞれAND回路，OR回路，NOT回路を表す。'),
  draw('gates',0,'AND・OR・NOT回路の記号'),draw('circuit',index,'論理回路と入出力')],
 rows.map(row=>[table('値の組合せ',['P','Q','R'],[row.split('；')])]),rows.indexOf([pp,q,r].join('；')),
 '最初のゲートは'+(firstAnd?'AND（論理積）':'OR（論理和）')+'で，P＝'+pp+'になる。PとCを次のゲートで処理するとQ＝'+q+'。NOT（否定回路）で反転してR＝'+r+'になる。');
});
const pipeline=define(18,'各命令のタイミング・許可された開始間隔',4,'F/D/A/R/E各一サイクル、図四択。原問は標準パイプライン、生成版は次のFまでの間隔と段重なりの制約を変更。',index=>{
 const {options,fastest}=pipelineCases[index];
 const requirement=index?' 各段は1サイクルとし，段は同時に一命令だけを処理できる。アドレス資源の使用制約により，ある命令がFを開始してから次の命令がFを開始するまで少なくとも'+fastest+'サイクル必要である。この制約の下で可能な最短の進め方を選べ。':'';
 const answer=options.findIndex(values=>values.every((value,i)=>i===0||value-values[i-1]===fastest));
 return body([p(source[18].prompt+requirement),p(source[18].material.split('。')[0]+'。')],options.map((_,i)=>[draw('pipe',index*4+i,'パイプライン図'+ 'アイウエ'[i])]),answer,
 '最後の命令までの開始間隔が'+fastest+'サイクルであれば，各命令が同じ段を同時に使わず，候補の中で最短の処理となる。同一段の重複や余分な空きがある図は条件に合わない。');
});
const cache=define(20,'キャッシュ・主記憶の容量とCPU別アクセス時間',4,'二CPUの時間を比較し、出題時は命中/ミスの加重平均。可変版で各アクセスの総時間という解釈を明示。小数2桁候補。',index=>{
 const {times}=architectureCases[index], [x,y,m,n]=times, answer=(n-m)/(n-m+x-y);
 const options = [source[20].choices, ['0.50','0.75','0.90','0.95'], ['0.75','0.90','0.95','0.96'], ['0.75','0.90','0.95','0.96']][index];
 const actual=answer.toFixed(2);
 const prompt=source[20].prompt+(index?' ヒット時はキャッシュメモリ，ミス時は主記憶の，表にある各時間をアクセスの総所要時間とする。':'');
 return textBody([p(prompt),draw('architecture',index,'図　構成'),
  table('表　アクセス時間（単位 ナノ秒）',['項目','CPU X','CPU Y'],[['キャッシュメモリ',String(x),String(y)],['主記憶',String(m),String(n)]])],
 options,options.indexOf(actual),'ヒット率をhとすると，CPU Xは'+x+'h＋'+m+'(1−h)，CPU Yは'+y+'h＋'+n+'(1−h)である。ここではキャッシュを確認してから主記憶の時間も別に加える直列モデルではなく，命中とミスのそれぞれの時間を用いる。等式を解くとh＝'+actual+'になる。');
});
const latency=define(22,'磁気ディスクの回転数と平均位置決め時間',4,'原問同様に回転数→1回転→半回転→位置決めとの和。ミリ秒、整数4選択。',index=>{
 const [rpm,seek]=([[4200,5],[6000,4],[3000,6],[7500,5]] as const)[index], round=60000/rpm, expected=Math.round(seek+round/2);
 const options=index?[Math.round(round/2),Math.round(round),expected,Math.round(seek+round)].sort((a,b)=>a-b).map(String):source[22].choices;
 return textBody(source[22].prompt.replace('4,200',group(rpm)).replace('5ミリ秒の',seek+'ミリ秒の'),options,options.indexOf(String(expected)),
 '1回転は60,000÷'+group(rpm)+'ミリ秒。回転の平均待ちは半回転分であり，位置決めの'+seek+'ミリ秒を足すと約'+expected+'ミリ秒である。');
});
const disk=define(23,'データディスクの台数と各位置のデータ配置',4,'制御装置と複数台ディスクの配置図を保持。分割と複製を図の実値で区別。',index=>{
 const prompt=index===0?source[23].prompt:index===1?source[23].prompt.replace('b₀〜b₁₅','b₀〜b₁₄'):
  '図に示すように，同一のデータを複数台の磁気ディスクに格納することを何と呼ぶか。ここで，図中の b に付く番号は元のデータの順番を示す。';
 return textBody([p(prompt),draw('disk',index,'制御装置とデータディスクの配置')],source[23].choices,index<2?0:3,
 index<2?'連続するデータを細分化して異なるディスクへ順次割り当てている。ストライピングにより複数のディスクで並列に読み書きできる。':
 '各ディスクに同じ番号のデータの複製を保持している。ミラーリングによって，一台が故障しても残りのディスクから取得できる。');
});
const pictures=define(26,'縦横画素、画素ごとのビット数、記録メモリ',4,'非圧縮・ビットからバイト、容量÷1枚と端数切捨て。原問と同様の画素数の桁であり、MBの10進/2進両換算で枚数が同じ値になる。',index=>{
 const [width,height,bits,memory]=([[1600,1200,24,8],[1000,1000,24,16],[1200,1000,16,8],[800,1000,8,5]] as const)[index];
 const size=width*height*bits/8, count=Math.floor(memory*1000000/size), options=index?[count-2,count-1,count,count+3].map(String):source[26].choices;
 const prompt=source[26].prompt.replace('1,600',group(width)).replace('1,200',group(height)).replace('24ビット',bits+'ビット').replace('8Mバイト',memory+'Mバイト');
 return textBody(prompt,options,options.indexOf(String(count)),'1枚は'+group(width)+'×'+group(height)+'×'+bits+'÷8＝'+group(size)+'バイトである。容量を1枚の大きさで割り，整数枚に切り捨てると'+count+'枚となる。');
});
export const calculations2006AutumnAm0126=[
 maximum,shift,mask,float,fixed,chooseGroup,bitAlgorithm,logical,substrings,automaton,traversal,links,comparisons,storage,gate,pipeline,cache,latency,disk,pictures,
];
