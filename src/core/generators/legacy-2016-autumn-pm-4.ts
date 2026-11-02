/** IPA H28 autumn afternoon Q4: sequential transfers with cache validation. */
import {field,p,strings,variableNotes,type GeneratedBody} from './definition';
import type {AfternoonBookletDefinition} from './afternoon-booklet-extension-contract';
import type {Block} from '../types';
import {autumn2016Pm0104Case,autumn2016Pm4Cases,autumn2016Pm0104Diagram as draw,autumn2016Pm0104Profiles as profiles} from './legacy-2016-autumn-pm-figures-01-04';
const decimal=(value:number)=>Number(value.toFixed(3)).toString();
const scientific=(value:number)=>value===10000?'10⁴':value%10000===0?String(value/10000)+'×10⁴':String(value/1000)+'×10³';
const formula=(text:string,alt:string):Block=>({type:'formula',format:'latex',text,alt});
const latexBytes=(value:number)=>value===10000?'10^{4}':value%10000===0?`${value/10000}\\times10^{4}`:`${value/1000}\\times10^{3}`;
export function autumn2016Pm4Choices(index:number){
 const c=autumn2016Pm4Cases[index],t=c.milliseconds/1000,cached=c.fixedCount*t,uncached=c.fixedCount*(3*t+c.fixedBytes/c.speed),html=latexBytes(c.htmlBase)+'+'+c.htmlPerItem,image=latexBytes(c.imageBytes);
 return {
  ab:[t,3*t,3*t+c.fixedBytes/c.speed,cached,cached+3*t,2*cached,3*cached,uncached].map(decimal),
  cd:[html,html+'\\times n',image,image+'\\times n',`\\frac{${html}}{e}`,`\\frac{${html}\\times n}{e}`,`\\frac{${image}}{e}`,`\\frac{${image}\\times n}{e}`],
  cdAlt:[`${c.htmlBase}＋${c.htmlPerItem}`,`${c.htmlBase}＋${c.htmlPerItem}×n`,String(c.imageBytes),`${c.imageBytes}×n`, `(${c.htmlBase}＋${c.htmlPerItem})÷e`,`(${c.htmlBase}＋${c.htmlPerItem}×n)÷e`,`${c.imageBytes}÷e`,`${c.imageBytes}×n÷e`],
 };
}
export const legacy2016AutumnPm4Definition:AfternoonBookletDefinition={
 source:'2016h28a-fe-pm-4',title:'Web画面の表示に要するデータ転送時間',version:'3.2.0',fields:[field('転送モデルの往復時間・速度・データ個数とサイズ',0,3)],reference:[0],sourceAnswer:'a=エ，b=ク，c=カ，d=キ',
 publicNotes:'原の逐次転送・キャッシュ確認・固定データと変動データの区別，四つの空欄と分数の解答群を保ち，往復時間，転送速度，個数とデータサイズを変更しています。並列通信や追加の端数処理は導入せず，5秒以内という条件は維持しています。',
 notes:variableNotes+' 原物理18–20頁，4欄16固有択32欄内参照。a/b共通8数値，c/d共通8式。モデル3t+v/eとキャッシュ再転送不要t，逐次実行/他時間無視，固定全件・HTML1件・画像n件を維持。reference原t=.005/e=1e6/固定100×5000/HTML10000+500n/画像25000。4入力はe1/2百万,t5/10ms,固定50/100で，各固定データの転送時間=4tとし，原と同じ3桁以内の小数・同じ誤答役割（1件/往復漏れ/固定データの取違え）を保つ。c/dの前4択は元同様bytes，後4択はeで割ったseconds。式の括弧(3t+d)×nを変更しない。BigInt独立イベント積上げと境界n/n+1で検算する。',
 build(values){
  const i=autumn2016Pm0104Case(values),c=autumn2016Pm4Cases[i],bank=autumn2016Pm4Choices(i),t=c.milliseconds/1000,marks='アイウエオカキク',speed=String(c.speed/1000000)+'×10⁶';
  const prompt=[
   p('問4 Web画面の表示に要するデータ転送時間に関する次の記述を読んで，設問に答えよ。'),
   p('D社は，自社のWebサイトをインターネット上に公開している。'),
   p('D社では，Web画面1ページを構成する全データの転送に掛かる時間を，5秒以内に収めるよう基準を定めている。個々のデータの転送に掛かる時間は，D社が定めたデータ転送時間計算モデルを基に算出する。'),
   p('D社が定めたデータ転送時間計算モデルは，次のとおりである。'),
   p(`(1) ターンアラウンドタイム（ブラウザ，サーバ間で短いメッセージが往復するのに掛かる時間）t＝${decimal(t)}（秒），実効転送速度（サーバ，ブラウザ間におけるデータ転送の速さ）e＝${speed}（バイト／秒）とする。`),
   p('(2) ブラウザはキャッシュ機能をもっている。Web画面を表示する際に，必要なデータがブラウザにキャッシュされているときは，サーバに当該データの再転送の要否確認を要求する。再転送が必要な場合は，応答として当該データが転送される。'),
   p('(3) ブラウザが，サーバに対して要求を送信し始めてから，要求に対する結果の受信が完了するまでに掛かる時間を，表1に示す。'),
   p('(4) 表1に関わる通信処理は逐次実行され，複数の通信処理が並行して行われることはない。また，表1で示した時間以外は無視する。'),
   draw(4,profiles.transfers,0,'表1 要求に対する結果の受信が完了するまでに掛かる時間'),
   p('D社では，自社が取り扱う商品の情報を画像付きで一覧表示する機能（以下，一覧表示機能という）を，Webサイトに付加することにした。'),
   p('一覧表示機能を実現するに当たり，商品情報を一覧表示するWeb画面（以下，一覧表示画面という）1ページで表示する商品情報の最大数を，一覧表示画面を構成するデータの転送に掛かる時間を基に決定したい。一覧表示画面は，表示する商品の数にかかわらずに必要になるデータ（以下，固定データという）と，表示する商品の数に応じてデータサイズや個数が変動するデータ（以下，変動データという）で構成される。'),
   p(`固定データは，JavaScriptファイルやスタイルシート，画面の装飾に使う画像データなど合計${c.fixedCount}個あり，固定データ1個の平均サイズは${scientific(c.fixedBytes)}バイトである。`),
   p(`変動データは，一つのHTML文書データと，表示する商品n個分の画像データから成る。HTML文書データのサイズは，${scientific(c.htmlBase)}＋${c.htmlPerItem}×nバイトである。商品の画像データ1個の平均サイズは${scientific(c.imageBytes)}バイトである。`),
   draw(4,profiles.prose4,0,'設問の本文'),
   draw(4,profiles.prose4,1,'設問の本文'),
   draw(4,profiles.inequality,0,'転送時間の条件式'),
   draw(4,profiles.prose4,2,'設問の本文'),p('a，bに関する解答群'),...bank.ab.map((text,k)=>p(marks[k]+'　'+text)),p('c，dに関する解答群'),...bank.cd.flatMap((text,k)=>[p(marks[k]),formula(text,bank.cdAlt[k])]),
  ];
  const choices=[...strings(bank.ab),...bank.cd.map((text,k)=>[formula(text,bank.cdAlt[k])])],ids=['a','b','c','d'],offsets=[0,0,8,8],indices=[3,7,5,6];
  const overhead=3*c.milliseconds*c.speed/1000,available=5*c.speed-c.fixedCount*(overhead+c.fixedBytes)-overhead-c.htmlBase,perItem=overhead+c.htmlPerItem+c.imageBytes,maxN=Math.floor(available/perItem);
  const explanation=`a：固定データの${c.fixedCount}個は全てキャッシュ済みで，再転送は不要である。1個ごとに確認の往復t＝${decimal(t)}秒を使い，並列には処理しないので，${c.fixedCount}×${decimal(t)}＝${bank.ab[3]}秒。1個分のtや3t，転送があるときの1個分の時間とは区別する。\nb：キャッシュなしの1個は3t＋v/e＝3×${decimal(t)}＋${c.fixedBytes}/${c.speed}＝${bank.ab[2]}秒。全${c.fixedCount}個で${bank.ab[7]}秒となる。固定データの合計bytesだけを速度で割ると，各要求の3tを落としてしまう。\nc：HTMLは1個だけなので，その要求の3tは式に既にある。残るHTML自体の転送は(${c.htmlBase}＋${c.htmlPerItem}×n)/e秒である。nを落とした式やeで割っていないbytesの式ではない。\nd：画像は商品ごとに1個，1個当たり${c.imageBytes}/e秒。外側の括弧全体にnを掛けるので，d自体へさらにnを入れると二重に数える。\n全体は固定データ＋HTMLの要求と転送＋n個の画像要求と転送となる。この条件ではnの最大整数は${maxN}であり，n=${maxN}では5秒以内，n=${maxN+1}では5秒を超える。キャッシュを確認して再転送が必要な場合も，表1では3t＋v/eであり，勝手にtをもう一度加えない。\nHTMLはHyperText Markup Language（Web文書を記述するマークアップ言語）。JavaScriptはプログラミング言語名であり，英字略語の展開名ではない。ここで扱う5秒基準は問題で与えた計算モデルの基準であり，実際のHTTP通信の性能を保証するものではない。`;
  return {prompt,choices,answerParts:ids.map((id,k)=>({id:'part-'+id,label:id,choiceIds:Array.from({length:8},(_,j)=>'choice-value-'+(offsets[k]+j+1))})),partAnswers:ids.map((id,k)=>({kind:'choice' as const,partId:'part-'+id,choiceId:'choice-value-'+(offsets[k]+indices[k]+1)})),explanation} satisfies GeneratedBody;
 }
};
