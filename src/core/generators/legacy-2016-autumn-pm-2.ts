/** IPA H28 autumn afternoon Q2: lexical DFA and five-leaf syntax trees. */
import { field,p,strings,variableNotes,type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { autumn2016Pm0104Case,autumn2016Pm0104Diagram as draw,autumn2016Pm0104Profiles as profiles,autumn2016Pm2Trees,autumn2016PmTreeAlt } from './legacy-2016-autumn-pm-figures-01-04';
export const autumn2016Pm2Expressions=[
 'v op2 w op1 (x op2 y) op1 z',
 'v op2 (w op1 ((x op2 y) op1 z))',
 '(v op2 w) op1 ((x op2 y) op1 z)',
 '(v op2 (w op1 (x op2 y))) op1 z',
] as const;
export const autumn2016Pm2Banks={ab:['.','e','指数部','数字','符号'],c:['式','式 op2 因子','式 op2 項','式 op2 名前'],d:['因子','項','式','名前']};
export const legacy2016AutumnPm2Definition:AfternoonBookletDefinition={
 source:'2016h28a-fe-pm-2',title:'コンパイラの字句解析と構文解析',version:'3.2.0',sourceAnswer:'設問1 a=ア，b=イ／設問2 c=ウ，d=ウ，e=ウ',fields:[field('括弧を含む式の構造',0,3)],reference:[0],
 publicNotes:'符号なし浮動小数点定数の状態遷移図，構文規則，五つの解答欄と原の四つの構文木を保ち，例2の括弧によるまとまりを変更しています。op1がop2より高い優先順位，左からの結合，括弧内の優先という規則を同じ条件として使います。',
 notes:variableNotes+' 原物理10–13頁の全前提/字句規則6行/7状態12遷移（最終3と6）/構文木と帰り掛け評価/五つの空欄を保持。5欄17固有択22欄内参照，a/b共通5択。小数点直後の数字の有無，符号の位置，指数の必須数字，全文読了での受理を独立FSMで照合。cは低優先op2右辺の項，dは括弧内の式を問う。4例は同じ5葉4内部節で括弧の位置を変え，原4木A/B/C/Dへ2/0/1/3と適合する。名前置換や単なる択順変更ではない。追加の算術数値・丸めはない。',
 build(values){
  const i=autumn2016Pm0104Case(values),banks=autumn2016Pm2Banks;
  const optionText=(name:string,options:readonly string[])=>[p(name+'に関する解答群'),...options.map((text,k)=>p('アイウエオ'[k]+'　'+text))];
  const treeChoices=autumn2016Pm2Trees.map((_,k)=>[draw(2,profiles.tree,k,'構文木 '+ 'アイウエ'[k])]);
  const prompt=[
   p('次の問2から問7までの6問については，この中から4問を選択し，選択した問題については，答案用紙の選択欄の○選をマークして解答してください。なお，5問以上マークした場合には，はじめの4問について採点します。'),
   p('問2 コンパイラの字句解析と構文解析に関する次の記述を読んで，設問1，2に答えよ。'),
   p('コンパイラの字句解析では，原始プログラムを文字列として読み込んで，文字列中の文字の並びが字句として認識できるかどうかを解析し，その結果を字句の並びとして出力する。字句とは，原始プログラム中の名前や定数など，構文規則で規定されている文字の並びの最小単位である。構文解析では，字句解析が出力した字句を読み込みながら，字句の並びが構文規則で規定されている文法に合っているかどうかを解析し，その結果を構文木などの中間表現で出力する。'),
   draw(2,profiles.prose2,0,'設問の本文'),
   p('123.や123.4e−1など，構文規則で規定されている符号なし浮動小数点定数を例として字句解析の処理を考える。'),
   p('“→”は，左側の構文要素が右側で定義されることを示す。“｜”は，“又は”を意味する。“［”と“］”で囲まれた部分は，省略可能を意味する。'),
   draw(2,profiles.lexical,0,'〔符号なし浮動小数点定数の構文規則〕'),
   p('構文規則は，状態遷移図で表現することもできる。符号なし浮動小数点定数の構文規則に対する状態遷移図を，図1に示す。字句解析では，文字の並び中の文字を読み込みながら初期状態から状態を遷移させて，文字の並びを読み終えるときの状態が最終状態ならば，その文字の並びは符号なし浮動小数点定数であると判定する。ここで，円の中の数字は状態番号を示す。初期状態の状態番号は0であり，最終状態は二重円で示している。また，文字の並びは左から右に向けて1文字ずつ処理される。'),
   draw(2,profiles.dfa,0,'図1 符号なし浮動小数点定数の構文規則に対する状態遷移図'),...optionText('a，b',banks.ab),
   draw(2,profiles.prose2,1,'設問の本文'),
   p('構文規則で規定されている式を例として，構文解析の処理を考える。式の構文解析では，式を構成する演算子や名前などの字句を，式の左から右に読み込みながら，字句の並びが構文規則で規定されている文法に合っているかどうかを解析し，その結果を構文木として出力する。例えば，2項演算子op，名前v，w，xを構成要素とする式v op w op xは，次の演算順序①，②となるように解析され，その結果は，図2に示す2分木で表現する構文木として出力される。図2の構文木では，深さ優先でたどりながら，帰り掛けに節の演算子を評価する。'),
   p('〔演算順序〕'),p('① vとwに対して演算opを施す。'),p('② ①の結果とxに対して演算opを施す。'),draw(2,profiles.example,0,'図2 式の構文木と演算順序の例'),
   p('式の構文規則では，式の構文を規定するだけでなく，演算子の優先順位も規定する。2項演算子op1とop2，名前v，w，x，y，zを構成要素とする次の構文規則を定義する。ここで，“演算子op1の優先順位は，演算子op2の優先順位よりも高い”とする。これを規定する場合，式の構文規則は次のとおりになる。この構文規則で受理される式の例を，例1に示す。'),
   draw(2,profiles.expression,0,'〔式の構文規則〕'),p('例1：v op2 w op1 x'),
   p('さらに，式の構文に括弧を追加し，“括弧を含む式では，演算の優先順位は，括弧内の演算の方が高い”とする。これを規定する場合，因子の構文規則は次のとおりになる。この構文規則で受理される式の例を，例2に示す。'),
   draw(2,profiles.factor,0,'〔因子の構文規則〕'),p('例2：'+autumn2016Pm2Expressions[i]),
   draw(2,profiles.prose2,2,'設問の本文'),...optionText('c',banks.c),...optionText('d',banks.d),p('eに関する解答群'),...treeChoices.flat(),
  ];
  const choices=[...strings(banks.ab),...strings(banks.c),...strings(banks.d),...treeChoices],parts=['a','b','c','d','e'],offsets=[0,0,5,9,13],counts=[5,5,4,4,4],indices=[0,1,2,2,[2,0,1,3][i]];
  return {prompt,choices,answerParts:parts.map((id,k)=>({id:'part-'+id,label:'設問'+(k<2?'1 ':'2 ')+id,choiceIds:Array.from({length:counts[k]},(_,j)=>'choice-value-'+(offsets[k]+j+1))})),partAnswers:parts.map((id,k)=>({kind:'choice' as const,partId:'part-'+id,choiceId:'choice-value-'+(offsets[k]+indices[k]+1)})),
   explanation:'a：0→2は先頭の小数点を読む遷移なので「.」。2→3で少なくとも1桁を読み，.5などを受理する。0→1は数字なので，数字を重ねて入れたり，先頭へ指数や符号を許す遷移にはしない。b：数字列だけの状態1は最終状態ではない。小数点なしの1e2なども受理するため，1→4は指数開始の「e」である。状態4からは符号を省略して数字で6へ進むか，符号を読んで5を経由し，必ず数字を1桁以上読む。最終状態3と6で読み終えたときだけ受理する。\nc：低い優先順位のop2で式を結ぶ右辺は，高いop1を先にまとめられる「項」でなければならない。したがって「式 op2 項」。因子や名前に限定すると例1の右側のw op1 xをまとめられず，「式」だけではop2を使う式を作れない。d：括弧にはop2も含む式全体を入れられる必要があるので「式」。因子・項・名前だけでは(x op2 y)を表せない。\ne：この条件の例2は '+autumn2016Pm2Expressions[i]+'。括弧を優先し，同じ優先順位では左から結合させると，'+autumn2016PmTreeAlt(autumn2016Pm2Trees[indices[4]])+'となる。正しい木は'+ 'アイウエ'[indices[4]]+'であり，他の木は括弧によるまとまり又は同順位の結合位置が異なる。構文木は値の偶然の一致ではなく，左右の子と演算子の構造で照合する。字句解析は文字から最小単位の字句を取り出す処理，構文解析は字句列の文法と構造を解析する処理である。',
  } satisfies GeneratedBody;
 }
};
