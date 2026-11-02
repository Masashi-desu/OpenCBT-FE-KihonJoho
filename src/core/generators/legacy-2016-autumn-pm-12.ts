/** IPA平成28年度秋期FE午後問12。CASL II表示と有限のリンク操作。 */
import{field,p,code,table,variableNotes,type GeneratedBody}from'./definition';
import type{AfternoonBookletDefinition}from'./afternoon-booklet-extension-contract';
import{selectCase,sourceDiagram,panelAlt,heading,fixedReferences,answerBody,pageAlt,choiceBankText,type Panel,type SourcePage}from'./legacy-2016-autumn-pm-09-13-support';
export const q12Banks={a:['JMI FIN','LAD GR1,1,GR1','LAD GR4,1,GR4','LD GR1,GR2','LD GR1,0,GR2'],b:['LD GR4,0,GR1','LD GR4,0,GR2','ST GR2,0,GR1','ST GR2,0,GR2','ST GR4,0,GR1','ST GR4,0,GR2'],c:['LD GR4,0,GR1','LD GR4,0,GR2','LD GR4,2,GR1','LD GR4,2,GR2','LD GR4,GR1','LD GR4,GR2'],section3:['α1','α2','E1','E2','0']};
export const q12Program1=` 1 LPROC START
 2       RPUSH
 3       LD    GR4,GR2       ; GR4←n
 4 LP    LD    GR2,0,GR1     ; 次の要素をたどる
 5       JZE   FIN          ; n>Nか？
 6       SUBA  GR4,=1
 7       JZE   NEXT         ; 要素nに達したか？
 8       [a]
 9       JUMP  LP
10 NEXT  LD    GR3,LTBL,GR3
11       JUMP  0,GR3         ; 指定された処理にジャンプ
12 LINS  LD    GR4,GR2
13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス
14       [b]
15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定
16       ST    GR0,1,GR2
17       JUMP  FIN
18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス
19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定
20       CALL  EFREE         ; 削除された要素nの領域を解放
21 FIN   RPOP
22       RET
23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル
24       DC    LDEL
25       END`;
export function q12Program2(n:number){return`MAIN  START
      LD    GR0,=1
      LD    GR2,=${n}        ; n=${n}
      LD    GR3,=0
      LAD   GR1,ROOT
      CALL  LPROC
      LD    GR0,=2
      CALL  LPROC
      LD    GR3,=1
      CALL  LPROC
      RET
ROOT  DC    LIST
LIST  DC    E3,#000A        ; リストの最初の要素（要素1）
E1    DC    E2,#000B
E2    DC    #0000,#000D     ; リストの最後の要素
E3    DC    E1,#000C
      END`;}
const candidates=[{n2:3,n3:3},...[2,3].flatMap(n2=>[1,2,3,4].map(n3=>({n2,n3}))).filter(x=>x.n2!==3||x.n3!==3)];
export function q12Input(v:readonly number[]){return {...candidates[selectCase(v,8)]};}
/** Explicit address-free source link model, not a CPU emulator. */
export function q12Links(n:number){const links:Record<string,string>={ROOT:'LIST',LIST:'E3',E3:'E1',E1:'E2',E2:'0'},values:Record<string,number>={LIST:10,E1:11,E2:13,E3:12},freed:string[]=[];let alpha=0;const call=(remove:boolean,value:number)=>{let previous='ROOT',target=links[previous];for(let i=1;i<n&&target!=='0';i++){previous=target;target=links[target];}if(target==='0')return;if(remove){links[previous]=links[target];freed.push(target);delete links[target];delete values[target];}else{const address='α'+(++alpha);links[previous]=address;links[address]=target;values[address]=value;}};call(false,1);call(false,2);call(true,2);const order:string[]=[];for(let at=links.ROOT;at!=='0';at=links[at]){if(order.includes(at))throw Error('LIST_CYCLE');order.push(at);}return{links,values,freed,order,e3:links.E3};}
export const q12Profiles=['generic-list-structure','three-element-list','lproc-program'];
export function q12Panel(suffix:string,v:number[]):Panel{const x=q12Input(v);if(suffix==='generic-list-structure')return{kind:'list',generic:true,n:0};if(suffix==='three-element-list')return{kind:'list',generic:false,n:x.n2};if(suffix==='lproc-program')return{kind:'code',language:'casl2',text:q12Program1};throw Error('FIGURE_PROFILE');}
const refs=fixedReferences([71,72,73,74,75,76],true);
const section2=(n:number)=>['挿入する要素の先頭アドレス',`要素${n-1}の先頭アドレス`,`要素${n}の先頭アドレス`,'0'];
function pages(index:number):SourcePage[]{const x=q12Input([index]);const fig=(s:string,c:string)=>sourceDiagram(12,s,index,c,panelAlt(q12Panel(s,[index])));return[
{page:59,blocks:[p('問12 次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),heading('〔プログラム1の説明〕'),p('リストに対して，要素を挿入又は削除する副プログラムLPROCである。リストの構造を図1に示す。'),fig('generic-list-structure','図1 リストの構造'),p('(1) リストは一つ以上の要素をもち，一つの要素は連続する2語から成る。1語目には次の要素の先頭アドレス（図中では矢印で表す）が，2語目にはその要素の保持する値が格納される。要素は主記憶の0番地以外に配置され，最後の要素の1語目には，次の要素がないことを表すために，0が設定される。'),p('(2) ROOTは1語から成り，最初の要素（要素1）の先頭アドレスが格納される。'),p('(3) 主プログラムは，表1に示す値を各レジスタに設定してLPROCを呼ぶ。'),p('① nは操作対象とする要素が，リストの先頭から何番目かを指定する正の整数である。'),p('② 要素の挿入の場合は，その要素が先頭からn番目となる位置（要素nの直前）に挿入される。削除の場合は，先頭からn番目の要素（要素n）が削除される。'),p('③ nとして，リストの現在の要素の個数Nよりも大きい値が与えられたとき，LPROCは何もせずに呼出し元に戻る。'),table('表1 LPROC呼出し時のレジスタ設定',['操作','GR0','GR1','GR2','GR3'],[['挿入','挿入する値','ROOTのアドレス','n','0'],['削除','−','ROOTのアドレス','n','1']])]},
{page:60,blocks:[p('(4) LPROCは，要素を挿入又は削除するとき，それぞれ別に用意された副プログラムEGET又はEFREEを呼ぶ。'),p('(5) EGETは，挿入される要素に必要な領域を記憶管理領域から割り当てるために呼び出され，新たに割り当てられた，連続する2語から成る領域の先頭アドレスをGR2に設定して呼出し元に返す。'),p('(6) EFREEは，削除された要素の先頭アドレスをGR2に設定して呼び出され，当該要素が使用していた領域を記憶管理領域に戻す。'),p('(7) 副プログラムEGETから戻るとき，GR2以外の汎用レジスタの内容は元に戻す。'),p('(8) 副プログラムEFREEから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),p('(9) 副プログラムLPROCから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),heading('〔プログラム1〕'),fig('lproc-program','プログラム1（行番号）')]},
{page:61,blocks:[p('設問1 プログラム1中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),p(`設問2 図2に示す要素数が3個のリストについて，n=${x.n2}でLPROCを実行し，要素を挿入する。行番号12のラベルLINSの命令を実行するときGR2に格納されている値として，正しい答えを，解答群の中から選べ。`),fig('three-element-list','図2 要素数が3個のリスト')],banks:[choiceBankText('a',q12Banks.a),choiceBankText('b',q12Banks.b),choiceBankText('c',q12Banks.c),choiceBankText('設問2',section2(x.n2))]},
{page:62,blocks:[p('設問3 ラベルLIST以降に格納されている要素数が4個のリストについて，プログラム2のMAINを実行した。実行後のラベルE3で示される番地の内容として，正しい答えを，解答群の中から選べ。ここで，EGETで割り当てられた要素の先頭アドレスは，割り当てられた順に，α1，α2とする。'),heading('〔プログラム2〕'),code(q12Program2(x.n3),'casl2')],banks:[choiceBankText('設問3',q12Banks.section3)]}
];}
export const q12OriginalPageAlt=()=>pageAlt(pages(0));
export function q12Build(v:number[]):GeneratedBody{const i=selectCase(v,8),x=q12Input(v),trace=q12Links(x.n3);return answerBody(pages(i).flatMap(pg=>pg.blocks),[{names:['a'],labels:['設問1 a'],options:q12Banks.a,keys:[3],language:'casl2'},{names:['b'],labels:['設問1 b'],options:q12Banks.b,keys:[2],language:'casl2'},{names:['c'],labels:['設問1 c'],options:q12Banks.c,keys:[1],language:'casl2'},{names:['section2'],labels:['設問2'],options:section2(x.n2),keys:[2]},{names:['section3'],labels:['設問3'],options:q12Banks.section3,keys:[q12Banks.section3.indexOf(trace.e3)]}],`a：GR1は直前要素のリンクが格納された番地を持つ。次へ進むときはGR2の値（今の要素の先頭番地）をGR1へ移す。GR2番地の内容を読むLD GR1,0,GR2とは違う。b：EGET後のGR2は新しい領域なので，ST GR2,0,GR1で直前リンクを新要素へ向ける。その後，新要素の第1語へ元の対象要素GR4，第2語へ挿入値GR0を書く。c：削除対象GR2の第1語をGR4へ読み，直前リンクをその値に付け替えてEFREEする。\n設問2：LINSの先頭命令を実行する直前は，まだEGETを呼んでいない。GR2は要素${x.n2}の先頭番地で，新領域ではない。\n設問3：初期の鎖は宣言順と異なりLIST→E3→E1→E2。n=${x.n3}で2回挿入し同じ位置を削除すると${trace.order.join('→')}→0となり，E3の第1語は${trace.e3}。解放するのは${trace.freed.join('，')}。LPROCがGR1〜GR7を復元するので2・3回目にも同じnとROOT番地が使われる。n>Nは挿入の場合も何もしない。`,refs.contexts);}
export const legacy2016AutumnPm12Definition:AfternoonBookletDefinition={source:'2016h28a-fe-pm-12',title:'旧制度・午後：CASL IIのリスト挿入・削除',fields:[field('条件の選択番号',0,7)],reference:[0],sourceAnswer:'設問1 a=エ，b=ウ，c=イ／設問2 ウ／設問3 ア',version:'3.6.0',publicNotes:'原問題のリンク構造とCASL IIプログラムを維持し，対象要素の位置nを変更します。付属資料は文字コード表を除いたCASL IIの必要部分です。',notes:variableNotes+' 全4頁，5欄，26固有択／26参照。8有限候補，reference0 n2=3,n3=3。JIS表・文字コード依存なし。全命令/注記・GR保存・n>N no-opを保持。独立16bit命令モデルとリスト配列で境界/全択を検算。',fixedReferenceAssetIds:refs.assets,build:q12Build};
