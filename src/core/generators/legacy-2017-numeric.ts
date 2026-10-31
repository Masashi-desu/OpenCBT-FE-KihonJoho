import {legacy2017CostProfile,legacy2017CostTable,legacy2017CostTableAlt} from "./legacy-2017-cost-table";
import {code,field,figure,p,strings,table,variableNotes,type GenerationDefinition} from "./definition";
const reject=():never=>{throw Error("PARAMETER_CONSTRAINT");};
const fmt=(n:number)=>Number.isInteger(n)?String(n):String(Number(n.toFixed(1)));
function define(number:number,period:"h"|"a",title:string,sourceAnswer:string,fields:GenerationDefinition["fields"],reference:number[],build:GenerationDefinition["build"],notes:string):GenerationDefinition{
 return {source:`2017h29${period}-fe-am-${number}`,title,sourceAnswer,fields,reference,notes:variableNotes+" "+notes,build:values=>{
  if(values.length!==fields.length||values.some((v,i)=>!Number.isInteger(v)||v<fields[i].minimum||v>fields[i].maximum))reject();
  const b=build(values);if(b.choices.length!==4||new Set(b.choices.map(c=>JSON.stringify(c))).size!==4)reject();return b;
 }};
}
export const legacy2017NumericDefinitions:GenerationDefinition[]=[
 define(6,"h","剰余による再帰関数","イ",[field("共通因数",10,35)],[31],([factor])=>{
  const x=25*factor,y=17*factor;
  return {prompt:[p(`関数f(x, y)が次のとおり定義されているとき、f(${x}, ${y})の値は幾らか。ここで、x mod yはxをyで割った余りを返す。`),code("f(x, y): if y = 0 then return x else return f(y, x mod y)")],choices:strings([0,factor,8*factor,y].map(String)),correctIndex:1,explanation:`剰余を順に求めると、${x} mod ${y}＝${8*factor}、${y} mod ${8*factor}＝${factor}、${8*factor} mod ${factor}＝0。最後の呼出しf(${factor}, 0)は${factor}を返す。この関数はユークリッドの互除法で最大公約数を求める。最初の剰余${8*factor}で処理を止めない。`};
 },"原の再帰定義/余りの定義/4整数択を保持。775/527＝25×31/17×31の比を維持し、同じ3回の剰余で終わる26入力を用いる。商の計算が極端に長くならず、0/最終非零余り/最初の余り/第2引数を区別する。"),
 define(11,"h","RAID1の必要ディスク台数","エ",[field("格納データのTバイト数",3,12),field("1台のTバイト数",1,3)],[4,1],([amount,capacity])=>{
  if(amount%capacity)reject();const n=amount/capacity;if(n<3||n>8)reject();
  return {prompt:[p(`${amount}Tバイトのデータを格納できるようにRAID1の外部記憶装置を構成するとき、フォーマット後の記憶容量が${capacity}Tバイトの磁気記憶装置は少なくとも何台必要か。`)],choices:strings([n,n+1,n+2,n*2].map(String)),correctIndex:3,explanation:`RAID1（Redundant Array of Independent Disksのミラーリング構成）は同じデータを二重に保持する。データ1組に${amount}÷${capacity}＝${n}台分が必要であり、複製を含めると${n}×2＝${n*2}台。記憶容量を複製分にも同時に使えるものとして数えない。`};
 },"データ容量/フォーマット後の1台容量/最少台数を保持。整数台数かつ基準と同じ4択が異なる3〜8台分だけを許可。重複や追加の切上げを避ける。"),
 define(20,"h","D/A変換器の最下位ビットの電圧","ア",[field("分解能のビット数",7,10),field("基準電圧の0.5V単位",1,6)],[8,5],([bits,halfVolts])=>{
  const input=2**(bits-1),v=halfVolts/2;
  return {prompt:[p(`分解能が${bits}ビットのD/A変換器に、ディジタル値0を入力したときの出力電圧が0Vとなり、ディジタル値${input}を入力したときの出力電圧が${fmt(v)}Vとなる場合、最下位の1ビットの変化による当該D/A変換器の出力電圧の変化は何Vか。`)],choices:strings([input,2**bits-1,2**bits,2**(bits+1)].map(d=>`${fmt(v)}/${d}`)),correctIndex:0,explanation:`入力が0から${input}まで増える間の電圧差が${fmt(v)}Vなので、1段階当たりは${fmt(v)}/${input}V。与えられた${fmt(v)}Vを全ビットの最大値での出力と読み替えない。D/AはDigital-to-Analog（ディジタル値からアナログ量への変換）を表す。`};
 },"0入力で0V・中間コードの電圧・分数4択を保持。分解能/電圧を変える全24入力。小数第1位までの与値と2のべきの分母を使い、小数の割算や丸めを解答へ要求しない。"),
 define(23,"h","顧客コードの必要桁数","ア",[field("現在顧客数の1000人単位",4,12),field("年間増加率の10%単位",1,2),field("予測年数",2,3)],[8,2,3],([thousands,rate,years])=>{
  const total=thousands*1000*(10+rate)**years/10**years;let digits=1;while(26**digits<total)digits++;
  return {prompt:[p(`顧客に、A〜Zの英大文字26種類を用いた顧客コードを割り当てたい。現在の顧客総数は${(thousands*1000).toLocaleString("en-US")}人であって、毎年${rate}割ずつ顧客が増えていくものとする。${years}年後まで全顧客にコードを割り当てられるようにするためには、顧客コードは少なくとも何桁必要か。`)],choices:strings([3,4,5,6].map(String)),correctIndex:digits-3,explanation:`${years}年後の顧客数は${thousands*1000}×${fmt(1+rate/10)}の${years}乗＝${total}人。26種類の文字で${digits-1}桁なら${26**(digits-1)}通り、${digits}桁なら${26**digits}通りなので、少なくとも${digits}桁必要となる。年ごとの増加を元の顧客数に対する単純な加算にしない。`};
 },"A〜Z26種類・毎年一定の割の増加・少なくとも何桁という方向/3〜6の4択を保持。36入力で顧客数は整数となるため追加丸めなし。年数2/3・増加率1/2割で元と同程度の累乗比較に限定する。"),
 define(30,"h","伝票データ転送の回線利用率","ウ",[field("毎時件数の10000件単位",8,12),field("1回にまとめる件数",2,4),field("回線速度のMビット毎秒",1,2)],[10,2,1],([count,batch,speed])=>{
  const trueRate=(2000*batch+400)*count*10000/batch*8/3600/(speed*1e6)*100,omitted=2000*count*10000*8/3600/(speed*1e6)*100,duplicated=2400*count*10000*8/3600/(speed*1e6)*100;
  const options=[Number((trueRate/8).toFixed(1)),Math.round(omitted),Math.round(trueRate),Math.round(duplicated)];
  if(options[2]>100||Math.min(...options.filter((_,i)=>i!==2).map(n=>Math.abs(n-options[2])/options[2]))<.04)reject();
  return {prompt:[p(`本社と工場との間を専用線で接続してデータを伝送するシステムがある。このシステムでは2,000バイト/件の伝票データを${batch}件ずつまとめ、それに400バイトのヘッダ情報を付加して送っている。伝票データは1時間に平均${(count*10000).toLocaleString("en-US")}件発生している。回線速度を${speed}Mビット/秒としたとき、回線利用率はおよそ何％か。`)],choices:strings(options.map(fmt)),correctIndex:2,explanation:`毎時の送信量は(${2000*batch}＋400)×${count*10000}/${batch}バイト。ビットへ直して3600秒と${speed*1e6}ビット/秒で割ると約${options[2]}%。約${options[0]}%はバイトからビットへの換算を省いた候補、${options[1]}%はヘッダを省いた候補、${options[3]}%はヘッダを伝票1件ずつ付けた候補。`};
 },"1件2000byte、まとめて400byteヘッダ、毎時件数、Mbit/s、およその百分率4択を保持。原択6.1/44/49/53と同じ表記精度で換算漏れ/ヘッダ漏れ/1件毎ヘッダを区別。丸め後の相対間隔4%以上（原最小4/49の半分程度）と4択一意性を検査する。"),
 define(78,"h","定額法による当期減価償却費","ウ",[field("取得価額の1000千円単位",8,12),field("前期末累計の取得価額に対する10%単位",2,4),field("耐用年数の10年単位",1,2)],[10,3,2],([cost,prior,life])=>{
  const acquired=cost*1000,accumulated=acquired*prior/10,years=life*10,answer=acquired/years;
  return {prompt:[p(`当期の建物の減価償却費を計算すると、何千円になるか。ここで、建物の取得価額は${acquired.toLocaleString("en-US")}千円、前期までの減価償却累計額は${accumulated.toLocaleString("en-US")}千円であり、償却方法は定額法、会計期間は1年間、耐用年数は${years}年とし、残存価額は0円とする。`)],choices:strings([accumulated/years,(acquired-accumulated)/years,answer,(acquired+accumulated)/years].map(String)),correctIndex:2,explanation:`定額法の1年分は(取得価額−残存価額)÷耐用年数＝(${acquired}−0)÷${years}＝${answer}千円。既に償却した累計額${accumulated}千円を取得価額へ足し引きして当期の1年分を変えない。`};
 },"定額法/1年間/残存0円/千円を全入力へ保持。1000千円単位の取得額、20/30/40%の累計、10/20年の全30入力で全4択が整数。元150/350/500/650の累計だけ/未償却残高/取得額/取得＋累計という関係を維持する。"),
 define(9,"a","平均命令時間からMIPS","エ",[field("平均命令時間の種類",0,3)],[0],([kind])=>{
  const ns=[20,25,50,100][kind];
  return {prompt:[p(`平均命令実行時間が${ns}ナノ秒のコンピュータがある。このコンピュータの性能は何MIPSか。`)],choices:strings([100/ns,200/ns,ns,1000/ns].map(String)),correctIndex:3,explanation:`1秒＝10^9ナノ秒なので、毎秒の命令数は10^9÷${ns}。MIPS（Million Instructions Per Second、1秒当たりの百万命令数）はさらに10^6で割り、1000÷${ns}＝${1000/ns}MIPSとなる。時間の数値をそのまま命令数として使わない。`};
 },"原20ns→50MIPS、数値4択5/10/20/50を保持。20/25/50/100nsの4入力では全4択が整数で重複しない。位取りの違いと時間の数値を答える誤りを区別し、元にない小数を導入しない。"),
 define(15,"a","二つの装置を直列接続した稼働率","ア",[field("1台の稼働率の10%単位",7,9),field("時間の倍率",5,10)],[9,5],([tenths,scale])=>{
  const r=tenths/10,mtbf=tenths*scale,mttr=(10-tenths)*scale,options=[r*r,r,(1+r)/2,1-(1-r)**2];
  return {prompt:[p(`MTBFが${mtbf}時間でMTTRが${mttr}時間の装置がある。この装置を二つ直列に接続したシステムの稼働率は幾らか。ここで、各装置の故障は独立とする。`)],choices:strings(options.map(n=>n.toFixed(2))),correctIndex:0,explanation:`MTBF（Mean Time Between Failures、平均故障間隔）とMTTR（Mean Time To Repair、平均修復時間）より1台の稼働率は${mtbf}÷(${mtbf}＋${mttr})＝${r.toFixed(2)}。両方の装置が稼働する必要があり、独立なので積は${r.toFixed(2)}×${r.toFixed(2)}＝${options[0].toFixed(2)}。${options[3].toFixed(2)}は二つを並列にした場合の値である。`};
 },"元のMTBF/MTTR/二つ直列/小数2桁4択を保持。全18入力。生成版だけに故障の独立を明示する前提追加を記録し、原画像は変えない。直列/1台/停止率を半分にする誤計算/並列を区別する。"),
 define(24,"a","重み付き和によるチェックディジット","ア",[field("第1桁",2,8),field("第2桁",1,7),field("第3桁",1,9),field("第4桁",2,9)],[7,3,9,4],([a,b,c,d])=>{
  const data=`${a}${b}${c}${d}`,sum=a+2*b+3*c+4*d,rem=sum%11,check=(11-rem)%10,candidates=[check,rem,d,11-d];
  if(candidates.some(n=>n>9))reject();
  return {prompt:[p(`次の方式によって求められるチェックディジットを付加した結果はどれか。ここで、データを${data}、重み付け定数を1234、基数を11とする。`),p("〔方式〕"),{type:"list",ordered:true,items:["データと重み付け定数の、対応する桁ごとの積を求め、それらの和を求める。","和を基数で割って、余りを求める。","基数から余りを減じ、その結果の1の位をチェックディジットとしてデータの末尾に付加する。"]}],choices:strings(candidates.map(n=>data+n)),correctIndex:0,explanation:`対応する積の和は${a}×1＋${b}×2＋${c}×3＋${d}×4＝${sum}。11で割った余りは${rem}で、11−${rem}＝${11-rem}の1の位${check}を末尾に付加するので${data}${check}。余りや元の最終桁を直接付加せず、方式の3段階を全て適用する。`};
 },"4桁データ/重み1234/基数11/3段階/末尾1桁付加を保持。原の73940/73941/73944/73947は、正しい桁/余り直接/元の末尾/11−元末尾に対応。後二つは原作者の誤答意図と断定せず限定的な役割として明記。追加桁や重複が生じる入力を拒否。全3528候補を独立の桁列計算で検算する。"),
 define(35,"a","IPv4アドレスのネットワークアドレス","イ",[field("ホスト部のビット数",3,6),field("サブネットの番号",1,2),field("ホスト部の値",3,5)],[4,1,3],([bits,block,host])=>{
  const size=2**bits,start=block*size,address=start+host,prefix="10.170.70.";
  return {prompt:[p("次のIPアドレスとサブネットマスクをもつPCがある。このPCのネットワークアドレスとして、適切なものはどれか。"),p(`IPアドレス：${prefix}${address}`),p(`サブネットマスク：255.255.255.${256-size}`)],choices:strings([0,start,start+size-1,255].map(n=>prefix+n)),correctIndex:1,explanation:`IPv4（Internet Protocol version 4、インターネットプロトコル第4版）のネットワークアドレスはIPアドレスとサブネットマスクのビットごとの論理積で求める。最後の${bits}ビットを0にすると${prefix}${start}。${prefix}${start+size-1}はこのサブネットのブロードキャストアドレスである。末尾だけを一律に0や255に変えない。`};
 },"ネットワークアドレスを問う肯定の問い、IP/マスクの二行、同じ接頭辞の4択を保持。/26〜/29の通常サブネット24入力で、マスクのANDを独立検算。/31や/32を混ぜず追加のホスト使用条件を必要としない。"),
 define(52,"a","画面の作成・レビュー・管理の総工数","エ",[field("小単純と中普通の画面数調整の10画面単位",-1,1),field("管理工数率の20%単位",1,3)],[0,1],([shift,rate])=>{
  const counts=[30+shift*10,40-shift*10,20,10],work=counts[0]*.4+counts[1]*.9+counts[2]+counts[3]*1.2,review=5,total=(work+review)*(5+rate)/5,wrong=work*(5+rate)/5+review;
  return {prompt:[p(`全部で100画面から構成されるシステムの画面を作成する。100画面を規模と複雑度で分類したときの内訳は次のとおりである。`),{type:"list",ordered:false,items:[`規模が“小”で、複雑度が“単純”である画面数：${counts[0]}`,`規模が“中”で、複雑度が“普通”である画面数：${counts[1]}`,`規模が“大”で、複雑度が“普通”である画面数：${counts[2]}`,`規模が“大”で、複雑度が“複雑”である画面数：${counts[3]}`]},p(`全ての画面を作成する総工数を、表の作成工数を用いて見積もると何人日になるか。ここで、全部の画面のレビューと修正に5人日を要し、作業の管理にはレビューと修正の工数を含めた作業工数の${rate*20}%を要するものとする。`),table("画面当たりの作成工数（単位 人日）",["規模＼複雑度","単純","普通","複雑"],[["小","0.4","0.6","0.8"],["中","0.6","0.9","1.0"],["大","0.8","1.0","1.2"]])],choices:strings([work,work+review,wrong,total].map(String)),correctIndex:3,explanation:`作成工数は${counts[0]}×0.4＋${counts[1]}×0.9＋20×1.0＋10×1.2＝${work}人日。レビュー・修正5人日を加えた${work+5}人日全体に管理工数${rate*20}%を加え、総工数は${total}人日。管理の対象からレビュー・修正を外すと${wrong}人日となり、必要工数を落とす。`};
 },"100画面、内訳4項、規模×複雑度の3×3工数表、レビュー5、管理率の対象を保持。9入力は全4択が整数。原80/85/101/102の作成のみ/レビュー加算/レビューの管理漏れ/総工数という誤答関係を維持し、新しい丸めを要求しない。"),
 define(66,"a","試作の開発方法別コスト比較","ア",[field("購入費の400万円刻みの種類",0,2),field("委託費の300万円刻みの種類",0,2),field("作成工賃の20万円刻みの種類",0,2),field("改造・評価工賃の20万円刻みの種類",0,2)],[1,1,1,1],([buyKind,externalKind,createKind,otherKind])=>{
  const {purchase,external,create,other}=legacy2017CostTable([buyKind,externalKind,createKind,otherKind]),costs=[purchase+14*other,external,36*other,60*create+4*other];
  const min=Math.min(...costs);if(costs.filter(n=>n===min).length!==1)reject();
  return {prompt:[p(`電化製品に搭載する部品を試作するとき、全体のコストが最も安くなる開発方法はどれか。ここで、各工程の工期は、作成工程が6か月、改造工程が3か月、評価工程が2か月とする。また、1人月当たりのコストは、作成工程が${create}万円、改造工程及び評価工程がそれぞれ${other}万円とする。ただし、人月コスト、購入費及び委託費の三つ以外のコストは考慮しない。`),figure(legacy2017CostProfile,[buyKind,externalKind,createKind,otherKind],"開発方法と費用・月当たりの人数",legacy2017CostTableAlt([buyKind,externalKind,createKind,otherKind]))],choices:strings(["ア","イ","ウ","エ"]),correctIndex:costs.indexOf(min),explanation:`購入費・委託費に、工程ごとの「月当たり人数×工期×1人月コスト」を加える。ア〜エの順に${costs.map(n=>`${n}万円`).join("、")}で、最小は${min}万円の${"アイウエ"[costs.indexOf(min)]}（${["サンプルを購入して社内で改造","社外に一括委託","社内資産を改造","社内で新規作成"][costs.indexOf(min)]}）である。購入や委託だけを比較したり、月当たり人数を総人月と扱ったりしない。`};
 },"4行の開発方法表、3工程、工期、1人月単価、比較対象3費用のみというただし書きを保持。購入/委託/工賃を工程別に変更し、同率最小は拒否する。有効78入力で最小コストと次点の差は最小80万円（原100万円の80%）で、全費用を整数万円で比較できる。原の月当たり人数の単位「人」を保ち、人数×か月で人月へ換算する。ア〜エの表4行自体を解答群として保持し、記号を選ぶ。原表を保持するため当該基準問題はchoiceShuffleAllowed=falseを使い、生成バインドにもこの設定を継承する共有統合が必要。全81候補を3工程の明細積算で独立比較する。"),
 define(78,"a","先入先出法の期末在庫評価","ウ",[field("在庫・仕入個数の倍率",1,3),field("全単価への千円加算",0,2)],[1,0],([scale,add])=>{
  const quantities=[10,1,2,3,4].map(n=>n*scale),prices=[10,11,12,13,14].map(n=>n+add),end=12*scale,answer=scale*(150+12*add),weighted=scale*(138+12*add);
  return {prompt:[p("表から、期末在庫品を先入先出法で評価した場合の期末の在庫評価額は何千円か。"),table("期首在庫と仕入・期末在庫",["摘要","数量（個）","単価（千円）"],[["期首在庫",String(quantities[0]),String(prices[0])],...["4月仕入","6月仕入","7月仕入","9月仕入"].map((label,i)=>[label,String(quantities[i+1]),String(prices[i+1])]),["期末在庫",String(end),""]])],choices:strings([end*prices[1],weighted,answer,end*prices[4]].map(String)),correctIndex:2,explanation:`先入先出法では古いものから払い出すので、期末在庫${end}個は新しい受入分から数える。${quantities[4]}×${prices[4]}＋${quantities[3]}×${prices[3]}＋${quantities[2]}×${prices[2]}＋${quantities[1]}×${prices[1]}＋${2*scale}×${prices[0]}＝${answer}千円。総平均の${weighted}千円や、全てを単一の仕入単価で評価した金額とは異なる。`};
 },"期首・4回の仕入・期末の6行と数量/千円単価の表を保持。全数量1〜3倍、全単価へ0/1/2千円加算の9入力は整数。132/138/150/168の4択は4月単価一律/総平均/FIFO/最終単価一律の関係を保持する。"),
];
