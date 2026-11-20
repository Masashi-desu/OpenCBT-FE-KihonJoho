import type { Block } from '../types';
import { code, p, table } from './definition';
import { body, define, source, textBody } from './legacy-2006-spring-am-01-26-shared';
import { draw } from './legacy-2006-spring-am-01-26-figures';
import { floats, multiplyWidths, nandCases, searchCases, triangleCases, vennChoices } from './legacy-2006-spring-am-01-26-model';

const asFormula=(text:string,alt:string):Block=>({type:'formula',text,alt,format:'latex'});
const group=(n:number)=>n.toLocaleString('en-US');
const radix = define(1,'16進小数の整数部と小数部',4,'整数側と小数側それぞれの桁位置を対応させる4式、各6項。16進小数の桁数と項列を保つ。',index=>{
 const hex=['2A.4C','2A.98','54.4C','54.98'][index];
 const prompt=source[1].prompt.replace('2A.4C',hex);
 const expected=parseInt(hex.replace('.',''),16)/256;
 const exponents=[[5,3,1],[6,4,2]].flatMap(high=>[[-2,-5,-6],[-1,-4,-5]].map(low=>[...high,...low]));
 const choices=exponents.map(terms=>[asFormula(terms.map(term=>'2^{'+term+'}').join('+'),terms.map(term=>'2の'+term+'乗').join('＋'))]);
 const match=exponents.findIndex(terms=>terms.reduce((sum,n)=>sum+2**n,0)===expected);
 return body(prompt,choices,match,'1桁の16進数を2進数4桁に換算し、小数点を基準に各1のビットの重みを足す。'+
  hex+'の1の位置に対応するのは、2の'+exponents[match].join('、')+'乗である。');
});
const base=define(2,'数字の列で指定する引き算',4,'3桁・2桁・2桁の引き算、6〜9の基数、使用できる桁と桁の重みを確認。',index=>{
 const [left,right,equal]=[['131','45','53'],['131','45','42'],['131','54','55'],['110','54','45']][index];
 const candidates=[6,7,8,9];
 const m=candidates.findIndex(n=>parseInt(left,n)-parseInt(right,n)===parseInt(equal,n)&&Number([...left+right+equal].sort().at(-1))<n);
 return textBody([p(source[2].prompt),p(left+' − '+right+' ＝ '+equal)],source[2].choices,m,
  '各桁に基数の位置ごとの重みを付ける。'+candidates[m]+'進法では、左辺が'+parseInt(left,candidates[m])+'−'+
  parseInt(right,candidates[m])+'、右辺が'+parseInt(equal,candidates[m])+'となり一致する。');
});
const twos=define(3,'固定小数点表示法の符号表現とビット数',4,'2の補数の範囲を求める原出題。生成版は隣接する符号表現かビット総数を指定し、同じ指数式の範囲四択を保つ。',index=>{
 const choiceSets=[
  [['-2^n','2^{n-1}'],['-2^{n-1}-1','2^{n-1}'],['-2^{n-1}','2^{n-1}-1'],['-2^{n-1}','2^{n-1}']],
  [['-2^{n-1}','2^{n-1}-1'],['-(2^{n-1}-1)','2^{n-1}-1'],['-2^{n-1}-1','2^{n-1}'],['-2^{n-1}','2^{n-1}']],
  [['-(2^{n-1}-1)','2^{n-1}-1'],['-2^{n-1}','2^{n-1}-1'],['-2^{n-1}-1','2^{n-1}'],['-2^n','2^{n-1}']],
  [['-2^n','2^{n-1}'],['-(2^n-1)','2^n-1'],['-2^n-1','2^n'],['-2^n','2^n-1']],
 ];
 const alt=(text:string)=>text.replace(/2\^\{n-1\}/g,'2の（n−1）乗').replace(/2\^n/g,'2のn乗').replaceAll('-','−');
 const [representation,width]=[['2の補数','n'],['1の補数','n'],['符号と絶対値','n'],['2の補数','n＋1']][index];
 const prompt=source[3].prompt.replace('2の補数',representation).replace('n ビット',width+' ビット');
 const choice=index===0?2:index===1?1:index===2?0:3;
 return body(prompt,choiceSets[index].map(([min,max])=>[{type:'formula' as const,format:'unicode' as const,text:[min,max].map(value=>value.replace(/2\^\{n-1\}/g,'2ⁿ⁻¹').replace(/2\^n/g,'2ⁿ').replaceAll('-','−')).join(' 〜 '),alt:alt(min)+'から'+alt(max)+'まで'}]),choice,
  index===0||index===3?'最上位ビットの重みが負であるため、下限は最上位ビットだけを1にした値、上限はそのビットだけを0にした値である。':
  '最上位の1ビットは符号に使う。正の最大値と負の最小値は、絶対値が残るn−1ビットの全1に対応し、符号だけが異なる。');
});
const float=define(4,'正規化する値と候補の指数・符号',4,'S/e/fの1/4/11ビット、仮数先頭1と2の補数の指数を変更せず、値と候補の数値を変える。',index=>{
 const data=floats[index];
 const choices=data.e.map((e,j)=>[draw('float-choices',4*index+j,'正規化したビット列 '+ 'アイウエ'[j])]);
 const match=data.e.findIndex((e,j)=>(data.signs[j]?-1:1)*data.f*2**e===data.value);
 return body([p(source[4].prompt.replace('0.25',String(data.value))),draw('float',0,'16ビット浮動小数点形式')],choices,match,
  '小数点を仮数部の直前に置く。絶対値を '+data.f+'×2の'+data.e[match]+'乗 と表すと、仮数部の先頭が1になる。符号ビットは'+
  data.signs[match]+'、指数の4ビット表現は'+(data.e[match]&15).toString(2).padStart(4,'0')+'である。');
});
const precision=define(5,'仮数のビット幅と各計算の二進指数',4,'二進小数×二の累乗を二項加減し、指数差による情報落ちを問う。仮数は各3～5ビット程度、選択肢を整数だけに簡略化しない。',index=>{
 const widths=[23,20,18,16], width=widths[index];
 const exponents=[
  [[-16,-15],[16,16],[18,-5],[20,21]],
  [[16,-8],[7,8],[12,11],[13,15]],
  [[-9,-8],[17,-6],[3,5],[9,10]],
  [[4,2],[13,11],[17,16],[15,-7]],
 ][index];
 const mantissas=[['10.101','1.001'],['10.101','1.001'],['1.01','1.01'],['1.001','1.1111']];
 const choices=mantissas.map(([a,b],i)=>[asFormula('('+a+')_2\\times2^{'+exponents[i][0]+'}'+(i<2?'-':'+')+'('+b+')_2\\times2^{'+exponents[i][1]+'}',
  '二進数'+a+'×2の'+exponents[i][0]+'乗'+(i<2?'から引く':'に足す')+'二進数'+b+'×2の'+exponents[i][1]+'乗')]);
 const answer=[2,0,1,3][index], gap=Math.abs(exponents[answer][0]-exponents[answer][1]);
 return body(source[5].prompt.replace('23ビット',width+'ビット'),choices,answer,
  '加減算では指数をそろえる。該当式では指数の表示上の差が'+gap+'あり、小さい方を右にずらすとその仮数の有効な桁が'+
  width+'ビットの外に出る。これは情報落ちであり、近い値の減算の相殺による桁落ちとは異なる。');
});
const parity=define(6,'符号の幅と取り除くパリティの位置',4,'指定した1ビットだけを取り除くAND。元のマスク尺度とAND/OR/XORの役割を保つ。',index=>{
 const [width,position]=[[8,7],[8,0],[8,3],[12,11]][index], full=2**width-1;
 const mask=full-2**position, format=(value:number)=>value.toString(16).toUpperCase().padStart(width/4,'0');
 const options=[[15,'AND'],[15,'OR'],[mask,'AND'],[full,'XOR']].map(([value,operation])=>'16進数 '+format(Number(value))+' との '+operation+(operation==='XOR'?'（排他的論理和）':'')+' をとる。');
 const prompt=index===0?source[6].prompt:
  (position===0?'最下位':position===width-1?'最上位':'下位から4番目')+'をパリティビットとする'+width+
  'ビット符号において，パリティの位置を0にして，ビット位置を変えずにパリティビット以外の'+(width-1)+'ビットを得るためのビット演算はどれか。';
 return textBody(prompt,options,2,'パリティの位置だけ0で、それ以外は1のマスク '+format(mask)+' を作る。ANDなら、1の位置の元の値を維持して0の位置だけを消去できる。');
},true);
const venn=define(7,'三つの円の内外と網掛けの領域',4,'各選択肢の集合式と元のVenn図を保持し、円の内外のどこを網掛けにするかを変更する。',index=>{
 const labels=['（A∩B∩C）の補集合とBとの共通部分','A∪BとCの補集合との共通部分',
  'Aに属さずBとCに属する集合と、AとBに属しCに属さない集合の和集合','A∪B∪Cの補集合'];
 const selected=[2,0,1,3][index];
 return body([p(source[7].prompt.replace('X に上線を付けたものは X の補集合','¬X は X の補集合')),draw('venn',index,'網掛けを示すベン図')],
  vennChoices.map((choice,i)=>[asFormula(choice,labels[i])]),selected,
  '各円の内外を分けて、A、B、Cの所属を調べる。表示した網掛けの全領域は「'+labels[selected]+'」に一致する。');
});
const transition=define(9,'状態遷移表の規則と4本の文字列',4,'空白、数字、符号、小数点、その他の列、開始aと不合格e、1文字ずつ処理する構造を保つ。',index=>{
 const rows=['abcde','abede','ebede','aeeee'].map(x=>x.split(''));
 const options=[
  source[9].choices,['＋7','−−1','9.34','.7'],['＋.3','1.4','−2','8.△'],['＋6','−.','7△','△0'],
 ][index];
 if(index)rows[3][1]='b';
 if(index===2)rows[2][3]='e';
 if(index===3)rows[1][0]='e';
 const reject=options.findIndex(candidate=>{
  let state='a';
  for(const char of candidate){
   const input=char==='△'?0:/[0-9]/.test(char)?1:char==='＋'||char==='−'?2:char==='.'?3:4;
   state=rows['abcd'.indexOf(state)][input];
   if(state==='e')return true;
  }
  return false;
 });
 return textBody([p(source[9].prompt),table('状態遷移表',['現在の状態','空白','数字','符号','小数点','その他'],
  rows.map((row,i)=>['abcd'[i],...row]))],options,reject,
  '初期状態aから各文字の列を使って次の状態を読む。'+options[reject]+'は途中でeへ達する。他の文字列は最後までeに入らない。');
});
const postfix=define(10,'括弧付きの四則式と後置表記',4,'代入の位置、5変数、括弧、四演算、4択の順序誤りを保持。固定表現と変数名の置換だけでなく演算箇所を変える。',index=>{
 const [g,h,j,k]=[['＋','×','−','÷'],['−','＋','×','÷'],['×','−','＋','÷'],['÷','×','−','＋']][index];
 const expression='Y＝(A'+g+'B)'+h+'(C'+j+'(D'+k+'E))';
 const valid='YAB'+g+'CDE'+k+j+h+'＝';
 const choices=[valid,'YAB'+g+'C'+j+'DE'+k+h+'＝','YAB'+g+'EDC'+k+j+h+'＝','YBA'+g+'CD'+j+'E'+k+h+'＝'];
 return textBody([p(source[10].prompt),p(expression)],choices,0,
  '各括弧ではオペランドを左から並べて、二項がそろった位置に演算記号を書く。まずAとBを '+g+' で、DとEを'+k+
  'で結び、Cと括弧内の結果を'+j+'で結ぶ。最後に'+h+'を実行してから、Yへの代入記号を置く。');
},true);
const triangle=define(11,'三角グラフ上の4人の点の位置',4,'2図・三角形の辺までの垂線距離・A〜Dの説明4択。点を移し、どの記述が成立するかを軸の入替えだけに頼らず変更。',index=>{
 const [a,b,c,d]=triangleCases[index];
 const matches=[a[1]===100,b[2]>Math.max(b[0],b[1]),c[0]>c[2]&&c[2]>c[1],d[2]===0];
 const selected=matches.indexOf(true);
 return textBody([p(source[11].prompt),draw('triangle-property',0,'図1　正三角形の性質'),draw('triangle-use',index,'図2　三角グラフ')],source[11].choices,selected,
  '各ソフトの使用率は、その名前が付いた辺から点への垂線の長さで読む。辺上ならそのソフトは0％、辺の対頂点なら100％になる。表示した点を比較すると、'+
  source[11].choices[selected]+'が成り立つ。');
});
const structures=define(12,'キューとスタック間で実行する七つの操作',4,'空の2構造、定義済みAPI、7行の手続とa〜dの原択。移し替え手順を変える。',index=>{
 const results=['b','a','c','d'];
 const programs=[
  ['push(a)','push(b)','enq(pop())','enq(c)','push(d)','push(deq())','x ← pop()'],
  ['enq(a)','push(b)','push(c)','enq(pop())','push(d)','push(deq())','x ← pop()'],
  ['push(a)','push(b)','enq(c)','enq(pop())','push(d)','push(deq())','x ← pop()'],
  ['push(a)','enq(b)','push(c)','enq(pop())','push(deq())','push(d)','x ← pop()'],
 ][index];
 return textBody([p(source[12].prompt),code(programs.join('\n'),'pseudocode')],source[12].choices,results[index].charCodeAt(0)-97,
  'キューは先に入れた要素を先に取り出し、スタックは最後に入れた要素を先に取り出す。この順に操作すると最後のpopで取り出すのは'+results[index]+'である。');
});
const sorting=define(13,'処理する六つの3桁の数値',4,'1の位・10の位の2段階、同じグループには到着順で入れる。途中停止と数値全体の整列の誤りを比較。',index=>{
 const inputs=[[180,315,282,410,645,525],[435,120,615,214,830,605],[507,730,323,450,719,602],[520,416,711,625,934,206]][index];
 const options=index===0?source[13].choices:[
  [...inputs].sort((a,b)=>a-b),[...inputs].sort((a,b)=>a%10-b%10),[...inputs].sort((a,b)=>a%100-b%100),[...inputs].sort((a,b)=>b-a),
 ].map(row=>row.join('，'));
 return textBody([p(source[13].prompt.replace('180，315，282，410，645，525',inputs.join('，'))),
  ...source[13].material.replace('ここで，','\nここで，').split(/(?<=。)(?=手順)|\n/g).map(p)],options,2,
  '先に1の位で分け、次に同じ順序を保って10の位で分ける。同じ10の位なら先に確定した1の位の順が残る。100の位を処理していないので、全体は下二桁の昇順になる。');
},true);
const search=define(14,'配列の検索範囲と中央要素の端数処理',4,
 '昇順・添字と比較・探索失敗を0で表す原流れ図を保持。中央の選び方と対象範囲を入力で指定し、候補範囲からはみ出さないことを検算する。',index=>{
 const {from,to,upper}=searchCases[index];
 const statement=source[14].prompt+(index?' 初期の探索範囲は添字'+from+'から'+to+'までとする（n≧5）。候補が偶数個で中央の二要素を選べるときは、添字の'+
 (upper?'大きい':'小さい')+'方を選ぶ。':'');
 const choices=index===0?source[14].choices:[
  '（x＋y）→ m','（x＋y）／2 → m','（x＋y＋1）／2 → m','（y−x）／2 → m',
 ];
 return textBody([p(statement),draw('search',index,'2分探索の流れ図')],choices,upper?2:1,
  '候補範囲は添字xからyなので、中央はxとyの平均で求める。'+(upper?'偶数個なら中央2要素の大きい方を用いるので、和に1を足してから割る。':
  '割算で端数を切り捨てれば、中央に2要素あるとき小さい方を選べる。')+' 比較のたびに中央の要素を次の範囲から除外する。');
});
const multiplication=define(15,'乗数のビット数とレジスタ幅',4,'加算と論理シフトを繰り返す流れ図、aの判定ビットとbの処理対。語長を変え、符号なしの積が収まるようレジスタは少なくとも倍長。',index=>{
 const width=multiplyWidths[index], reg=width*2;
 return body([p(source[15].prompt.replace('16ビット',width+'ビット').replace('32ビット',reg+'ビット')),draw('multiply',index,'シフト加算による乗算の流れ図')],
  source[15].choices.map(option=>[table('処理の組合せ',['a','b'],[option.split('；')])]),0,
  '乗数のビットを下位から1桁ずつ取り出し、1のときに現在の被乗数を累計へ足す。Xを左へ1ビットずらして桁の重みを2倍にし、Yを右へ1ビットずらして次のビットを最下位へ移す。'+
  width+'回で全部の桁を調べる。');
},true);
const circuit=define(16,'各NANDに入る信号の接続',4,'3個のNAND回路と2入力1出力、積・和・両否定の四択。信号の接続を組み替える。',index=>{
 const labels=['XとYの論理積','XとYの論理和','XとYの論理和の否定','XとYの論理積の否定'];
 const options=['X\\cdot Y','X+Y','\\neg(X+Y)','\\neg(X\\cdot Y)'];
 const outputs=options.map((_,j)=>[0,1,2,3].map(i=>{
  const x=Boolean(i&2),y=Boolean(i&1);
  return [x&&y,x||y,!(x||y),!(x&&y)][j];
 }));
 const results=[0,1,2,3].map(i=>{
  const signals:Record<string,boolean>={X:Boolean(i&2),Y:Boolean(i&1)};
  nandCases[index].forEach(([a,b],k)=>{signals[k===2?'Z':'N'+(k+1)]=!(signals[a]&&signals[b]);});
  return signals.Z;
 });
 const match=outputs.findIndex(row=>row.every((v,i)=>v===results[i]));
 return body([p(source[16].prompt.replace('上線付きの X','¬X')),draw('nand-legend',0,'NANDの記号'),draw('nand',index,'NANDで構成された回路')],
  options.map((option,i)=>[asFormula(option,labels[i])]),match,
  'NAND は両入力が1のときだけ0である。同一信号を入れると否定になる。入力（X,Y）＝00、01、10、11のとき、出力は順に'+
  results.map(Number).join('、')+'となるので、'+labels[match]+'である。');
});
const cpi=define(19,'命令ごとの出現頻度とクロック数',4,'3命令区分と百分率の表、2桁小数の四択。加重算術平均、逆数、加重逆数、単純平均の誤り。',index=>{
 const cases=[
  [[50,30,20],[1,2,5]],[[40,40,20],[1,3,5]],[[20,50,30],[1,3,6]],[[30,20,50],[1,2,4]],
 ];
 const [frequency,clocks]=cases[index], total=frequency.reduce((n,value,i)=>n+value*clocks[i],0)/100;
 const options=[1/total,frequency.reduce((sum,n,i)=>sum+n/100/clocks[i],0),total,clocks.reduce((a,b)=>a+b)/3].map(n=>n.toFixed(2));
 return textBody([p(source[19].prompt),table('命令ごとの出現頻度と実行クロック数',['命令','出現頻度（％）','実行クロック数'],
  ['転送','演算','分岐'].map((name,j)=>[name,String(frequency[j]),String(clocks[j])]))],options,2,
  '命令100個を仮定して各区分の実行クロック数を合計すると'+Math.round(total*100)+'クロックとなる。100個で割ると1命令当たり'+total.toFixed(2)+'クロックである。');
},true);
const speed=define(20,'プロセッサのMIPS値',4,'平均命令実行時間、ナノ秒とマイクロ秒の順。10の累乗による単位変換を同程度に保つ。',index=>{
 const mips=[50,25,100,250][index], ns=1000/mips;
 const nsOptions=[ns,mips].sort((a,b)=>a-b).map(n=>n+' ナノ秒');
 const micros=[100/mips,mips/10].sort((a,b)=>a-b).map(n=>n+' マイクロ秒');
 return textBody(source[20].prompt.replace('50MIPS',mips+'MIPS'),
  index?[...nsOptions,...micros]:source[20].choices,nsOptions.indexOf(ns+' ナノ秒'),
  'MIPSは1秒で処理する100万命令の数。処理速度が'+mips+'MIPSなので、1命令の平均は1秒を'+group(mips*1000000)+'で割った'+ns+'ナノ秒である。');
});
const sectors=define(24,'セクタのバイト数、ブロック構成、ファイルのサイズ',4,'二つのファイルを別に一ブロック単位で確保し、管理情報の領域は含めない。切上げ回数・桁数・整数の選択肢は原形。',index=>{
 const [bytes,count,a,b]=[[500,8,2000,9000],[512,4,1500,5000],[1000,6,5000,6100],[400,5,800,4200]][index];
 const choices=[[22,26,28,32],[12,13,16,20],[12,17,18,24],[12,13,15,20]][index];
 const blocks=[Math.ceil(a/(bytes*count)),Math.ceil(b/(bytes*count))], correct=blocks.reduce((x,y)=>x+y)*count;
 const prompt=source[24].prompt.replace('500バイト',group(bytes)+'バイト').replace('セクタ8個','セクタ'+count+'個').replace('2,000バイト',group(a)+'バイト').replace('9,000バイト',group(b)+'バイト');
 return textBody(prompt,choices,choices.indexOf(correct),'1ブロックは'+group(bytes*count)+'バイト。空きがあっても別ファイルは残りを共有しないため、各ファイルに'+
  blocks[0]+'ブロックと'+blocks[1]+'ブロックが必要になる。1ブロック'+count+'セクタなので必要なセクタ数の合計は'+correct+'である。');
});
export const jisCodeReference = () => ({
  id: 'context-2006-spring-am-8-jis-code',
  title: 'JISコードの参考表（独立編集）',
  presentation: 'text_figure' as const,
  blocks: [table('上位と下位の4ビットに対応する文字（Unicode公開マッピング）',
    ['下位4ビット', '上位4ビット 0001', '上位4ビット 0010', '上位4ビット 0011', '上位4ビット 0100'],
    [['0001', '', '', '1', 'A'], ['0010', '', '', '2', 'B'], ['0011', '', '', '3', 'C']])],
});

const jisCode = define(8, '符号を読む二文字の並び', 4,
  '原の上位と下位の4ビットを読む作業と、2文字分の8ビットを並べる四択を保持。独立参考表はUnicode公開マッピングのJIS0201 table 2.0から6件を照合する。',
  index => {
    const [first, second] = ['A2', 'B3', 'C1', '3A'][index];
    const bits = (character: string) => character.charCodeAt(0).toString(2).padStart(8, '0');
    const a = bits(first), b = bits(second);
    const correct = a + '　' + b;
    const alternate = ({ A: 'B', B: 'C', C: 'A', '3': '2' } as Record<string, string>)[first];
    const official = source[8];
    const represent = [a.slice(4) + a.slice(0, 4) + '　' + b.slice(4) + b.slice(0, 4), b + '　' + a, correct, bits(alternate) + '　' + b];
    const rotation = index % represent.length;
    const options = index ? [...represent.slice(rotation), ...represent.slice(0, rotation)] : official.choices;
    const prompt = official.prompt.replace('“A”と“2”', `“${first}”と“${second}”`);
    return {
      ...textBody(prompt, options, options.indexOf(correct),
        first + 'は表の列が' + a.slice(0, 4) + '、行が' + a.slice(4) + 'なので' + a + 'になる。' +
        second + 'も同じ規則で' + b + 'になるので、指定された順番では' + correct + 'となる。'),
      contexts: [jisCodeReference()],
    };
  });

export const calculations2006SpringAm0126=[
  jisCode,
 radix,base,twos,float,precision,parity,venn,transition,postfix,triangle,structures,sorting,
 search,multiplication,circuit,cpi,speed,sectors,
];
