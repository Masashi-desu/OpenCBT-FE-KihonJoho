import type { Block } from '../types';
import { code,p,strings,table } from './definition';
import { finite2010SpringAm2753 as finite,original } from './legacy-2010-spring-am-27-53-shared';
import {
  accessCases,dfdTargets,erEdges,normalOptions,normalizeCases,projectCases,queryCases,renderFigure,taskLinks,
} from './legacy-2010-spring-am-27-53-figures';

const linkCases=[
  {speed:8,efficiency:60,up:1,down:2,client:.4,server:.4},
  {speed:8,efficiency:50,up:1,down:2,client:.2,server:.5},
  {speed:16,efficiency:50,up:2,down:3,client:.3,server:.7},
  {speed:8,efficiency:80,up:2,down:4,client:.4,server:.5},
];
const textDec=(value:number)=>value.toFixed(1);
const accessPrompts=[
  original(35).prompt,
  '既存のISDN回線を利用したサービスで，宅内のアナログ電話機とPC用のシリアル接続機器を接続する。端末の信号をISDNのインタフェースに合わせる装置Aはどれか。',
  '既存のアナログ電話回線を利用し，宅内のPCからプロバイダへ電話番号を使って発呼し，複数PCのIP通信を中継する装置Aはどれか。',
  '同一のEthernetのLANセグメントで，複数の端末を物理層で接続し，受信した信号を他の全ポートへ再生する装置Aはどれか。',
];
const accessExplanations=[
  'スプリッタは電話の音声帯域とADSLの高周波帯域を分離して，各機器を一つの電話回線へつなぐ。ISDN端末変換，アナログ発呼とIPルーティング，LANの集線とは用途が異なる。',
  'ターミナルアダプタは非ISDN端末の信号をISDNへ適合させる。ADSLの周波数分離，電話をかけてIP経路を中継する装置，LANの集線装置ではない。',
  'ダイヤルアップルータは電話回線で接続先へ発呼し，宅内からのIP通信を中継する。周波数分離，ISDNへの端末変換，LANの信号中継だけではこの処理を行わない。',
  'ハブは物理層で複数端末を集線し，ポート間に信号を中継する。電話回線の帯域分離，ISDN端末接続，発呼を伴う経路制御の機器とは異なる。',
];
const counts=[
  {note:'各位置で同じ文字を再使用でき，順番が異なれば別のパスワードとする。',correct:0,reason:'各位置でM通りを独立に選ぶので，Mをn回掛ける。'},
  {note:'同じ文字は二度使えず，順番が異なれば別のパスワードとする。1≦n≦Mとする。',correct:1,reason:'順にM，M−1，…，M−n＋1通りなので，M!／(M−n)!となる。'},
  {note:'このシステムでは同じ文字は二度使えず，文字の順番だけが異なるものは同じパスワードとして照合する。1≦n≦Mとする。',correct:2,reason:'重複しないn文字の並びをn!通りの並べ替えで割ると，M!／(n!(M−n)!)となる。'},
  {note:'このシステムでは同じ文字を再使用でき，文字の順番だけが異なるものは同じパスワードとして照合する。1≦n≦Mとする。',correct:3,reason:'各文字の出現回数の合計がn。n個の印とM−1本の区切りを並べるので，(M＋n−1)!／(n!(M−1)!)となる。'},
];
const permissionCases=[
  {mask:3,allowed:'読取りと書込み',denied:'実行',choices:original(43).choices,correct:1,reason:'3は011なので，実行は残りの100，すなわち4に対応する。'},
  {mask:5,allowed:'読取りと書込み',denied:'実行',choices:[
    '2を設定すると，実行だけができる。','4を設定すると，読取りと書込みができる。','5を設定すると，実行ができる。','6を設定すると，書込みだけができる。',
  ],correct:0,reason:'5は101なので，実行は残りの010，すなわち2に対応する。'},
  {mask:6,allowed:'読取りと書込み',denied:'実行',choices:original(43).choices,correct:3,reason:'6は110で，試行結果のとおり読取りと書込みを許可する。実行は残りの001，すなわち1に対応する。'},
  {mask:5,allowed:'書込みと実行',denied:'読取り',choices:[
    '2を設定すると，実行だけができる。','4を設定すると，読取りだけができる。','5を設定すると，書込みと実行ができる。','6を設定すると，読取りだけができる。',
  ],correct:2,reason:'5は101で，試行結果のとおり書込みと実行を許可する。読取りは残りの010，すなわち2に対応する。'},
];
const dfdOptions=[original(45).choices,original(45).choices,original(45).choices,['外部実体',...original(45).choices.slice(1)]];
const dfdAnswers=[3,1,2,0];
const dfdReason=[
  '円は入力データを処理して出力を作るプロセスである。平行線はデータストア，矢印はデータフロー。アクティビティはこのDFDの円の名称ではない。',
  '2本の平行線はデータストアで，処理の途中で保存したデータを後から取り出す。円はプロセス，矢印はデータフローを表す。',
  '矢印はデータフローで，どの要素からどの要素へデータが流れるかを示す。円はプロセス，平行線はデータストアである。',
  '四角は外部実体で，対象システムの外部にあってデータを出し入れする主体を表す。円，平行線，矢印はそれぞれプロセス，データストア，データフローである。',
];
const prototypeCases=[
  {settled:50,target:90},{settled:75,target:75},{settled:50,target:75},{settled:50,target:85},
];
function projectDays(times:readonly number[]){
  const earliest=Array<number>(9).fill(0);
  for(const [i,[from,to]] of taskLinks.entries())earliest[to]=Math.max(earliest[to],earliest[from]+times[i]);
  return earliest[8];
}
const passwordFormulas=[
  'M^{n}',String.raw`\frac{M!}{(M-n)!}`,String.raw`\frac{M!}{n! (M-n)!}`,String.raw`\frac{(M+n-1)!}{n! (M-1)!}`,
];
const formula=(alt:string,i:number):Block=>({type:'formula',text:passwordFormulas[i],alt,format:'latex'});

export const calculationDefinitions=[
  finite(30,'複合キーの片方にだけ従属する項目',normalizeCases.length,
    '二表の組を選ぶ形式，属性順，複合主キーの下線を保持。片方のキーから決まる属性と複合キーから決まる属性を区別する。',i=>{
      const {ledger,left,right,attribute,quantity,owner}=normalizeCases[i], key=owner==='left'?left:right;
      const source=original(30);
      const condition=i===0?source.prompt:source.prompt.replace('発注伝票',ledger)+' '+attribute+'は'+key+'で決まり，'+quantity+'は'+left+'と'+right+'の組で決まる。';
      return {prompt:[p(condition),renderFigure('30-ledger',i)],choices:normalOptions.map(id=>[renderFigure(id,i)]),correctIndex:2,
        explanation:attribute+'は'+key+'のみに関数従属するので，'+key+'を主キーとする表に置く。'+quantity+'は'+left+'と'+right+
          'の組に依存するので，両列を複合主キーとする明細に置く。アは明細の'+right+'が失われ，イは部分従属が残り，エは'+quantity+'を不要な側にも残している。'};
    }),
  finite(31,'表構成と所属・非所属の照合条件',queryCases.length,
    '主キーの下線，SQLの継続行，外側表と相関の有無を維持。原画像のSQLは原文のまま，基準・生成ではNULLを含まない前提を本文に明示する。',i=>{
      const {outer,inner,match,negated}=queryCases[i], source=original(31);
      const transform=(sql:string)=>sql.replaceAll('商品番号',match).replaceAll('商品',outer).replaceAll('在庫',inner);
      const statement=source.details.split('\n').slice(0,2).join('\n');
      const matchSQL=transform(negated?statement:statement.replace('NOT IN','IN'));
      const question=source.prompt.replace('商品',outer).replace('在庫',inner);
      return {prompt:[p(question),p(inner+'表の'+match+'にはNULLを含まない。'),code(matchSQL,'sql'),renderFigure('31-relations',i)],
        choices:source.choices.map(sql=>[code(transform(sql),'sql')]),correctIndex:negated?3:2,
        explanation:'主問合せは'+outer+'表の行ごとに，'+inner+'表で'+match+'が一致する行'+(negated?'が存在しないとき':'が存在するとき')+
          'に値を返す。ア・イは外側の表が異なり，条件が外側の行に相関していない。'+(negated?'ウは一致する行を返す。':'エは一致しない行を返す。')+
          (i===0?'公式のエ（NOT EXISTS）は照合先にNULLがないときにNOT INと等しい。例えば商品番号が1で在庫側がNULLだけなら，NOT INはUNKNOWNで行を返さず，NOT EXISTSは真で行を返す。原資料ではNULLの可否は明記されていない。':
            negated?'照合先にNULLを含まないので，NOT INと相関NOT EXISTSは同じ判定を行う。':
              '照合先の表に同じ番号が複数行あっても，存在判定は外側の行ごとに1回の判定となる。')};
    }),
  finite(34,'回線速度・伝送効率・上下長・処理時間',linkCases.length,
    '原表の単位と上下方向，回線効率，送受信を合わせた処理時間と距離遅延の除外，選択肢の昇順を保持。',i=>{
      const {speed,efficiency,up,down,client,server}=linkCases[i], source=original(34);
      const t=(up+down)*8/(speed*efficiency/100), processing=client+server, total=t+processing;
      const candidates=i===0?source.choices:[
        (up+down)*8/speed+processing,t,total,t+2*processing,
      ].sort((a,b)=>a-b).map(textDec);
      return {prompt:[p(source.prompt),table('〔条件〕',['項目','条件'],[
        ['クライアントとサーバ間の回線速度',speed+' Mビット／秒'],['伝送効率',efficiency+'％'],
        ['電文長','上り'+up+' Mバイト，下り'+down+' Mバイト'],
        ['クライアントの処理時間','送信，受信を合わせて'+textDec(client)+'秒'],
        ['サーバの処理時間','送信，受信を合わせて'+textDec(server)+'秒'],
      ])],choices:strings(candidates),correctIndex:candidates.indexOf(textDec(total)),
      explanation:'上下合わせて'+(up+down)*8+' Mビットを伝送する。実効速度は'+speed+'×'+efficiency+'／100＝'+speed*efficiency/100+
        ' Mビット／秒なので伝送は'+textDec(t)+'秒。両端の処理時間'+textDec(processing)+'秒を各1回だけ加えると'+textDec(total)+'秒である。'};
    }),
  finite(35,'回線の方式と宅内装置Aの役割',accessCases.length,
    '利用者宅内の枠と装置A，端末2系統と外部回線，4装置名を保ち，回線方式と装置の役割を変更する。',i=>({
      prompt:[p(accessPrompts[i]),renderFigure('35-access',i)],choices:strings(original(35).choices),correctIndex:i,explanation:accessExplanations[i],
    })),
  finite(41,'パスワードの再使用可否と順序の区別',counts.length,
    '文字種類M・文字数nのまま4式の表現を保つ。再使用及び同一性の条件を本文に明示して計数を切り替える。',i=>{
      const {note,correct,reason}=counts[i], source=original(41);
      return {prompt:[p(source.prompt),p(note)],choices:source.choices.map((value,j)=>[formula(value,j)]),correctIndex:correct,
        explanation:reason+' 順序を区別するか，同じ文字を複数回使えるかを本文から判断する。四つの候補はその二条件の異なる組合せを表す。'};
    }),
  finite(43,'8進設定で確認する権限ビットの組',permissionCases.length,
    '0～7の独立3ビット，試行0・中間・7，読取り・書込み・実行と4選択肢の数値順を保つ。POSIXの割当は前提としない。',i=>{
      const {mask,allowed,denied,choices,correct,reason}=permissionCases[i], source=original(43);
      return {prompt:[p(source.prompt),p('〔試行結果〕'),p('① 0を設定したら，読取り，書込み，実行ができなくなってしまった。'),
        p('② '+mask+'を設定したら，'+allowed+'はできたが，'+denied+'ができなかった。'),
        p('③ 7を設定したら，読取り，書込み，実行ができるようになった。')],
        choices:strings(choices),correctIndex:correct,
        explanation:'0ですべて不許可，7ですべて許可なので，各ビットは1が許可である。'+reason+' 1ビットは一つの権限だけを制御する。'};
    }),
  finite(45,'図の中で名称を問う記号',dfdTargets.length,
    '原資料の記号と矢印経路を保ち，本文で対象記号を変える。四角を問う条件では外部実体を選択肢に含める。',i=>({
      prompt:[p(original(45).prompt.replace('“○”','“'+dfdTargets[i]+'”')),renderFigure('45-dfd',i)],
      choices:strings(dfdOptions[i]),correctIndex:dfdAnswers[i],explanation:dfdReason[i],
    })),
  finite(46,'商品・仕入先・発注・明細の多重度',3,
    '原資料の二つの表記法と6実体8関係を保持し，仕入先・発注・明細の接続端の多重度を変更する。',i=>{
      const edges=erEdges(i), multiple=(value:string)=>value!=='1';
      const claims=[!multiple(edges[0][3]),false,!multiple(edges[3][2]),!multiple(edges[2][2])];
      const correct=claims.indexOf(true);
      return {prompt:[p(original(46).prompt),renderFigure('46-notation',i),renderFigure('46-erd',i)],choices:strings(original(46).choices),
        correctIndex:correct,explanation:'多重度は相手側1件に対応する自分側の件数で読む。商品1件に対する仕入先は'+edges[0][3]+
          '，発注1件に対する仕入先は'+edges[3][2]+'，発注1件に対する発注明細は'+edges[2][2]+'。発注明細と納品明細の1対1関係は図にない。'+
          'これらから適切なのは'+('アイウエ'[correct])+'である。'};
    }),
  finite(50,'1回の確定割合と到達目標',prototypeCases.length,
    'その時点の未確定仕様に毎回同じ割合が適用される。1～4回の原選択肢を昇順で固定し，ちょうど目標に達する条件も含める。',i=>{
      const {settled,target}=prototypeCases[i], source=original(50);
      const count=[1,2,3,4].find(n=>100*((100-settled)/100)**n<=100-target)!;
      const remain=(n:number)=>100*((100-settled)/100)**n;
      return {prompt:[p(source.prompt.replace('50％',settled+'％').replace('90％',target+'％'))],choices:strings(source.choices),
        correctIndex:count-1,explanation:'1回ごとに未確定分に'+(100-settled)+'％を掛ける。目標は開始時の未確定分のうち残り'+(100-target)+'％以下である。'+
          (count-1)+'回では残り'+remain(count-1)+'％，'+count+'回では'+remain(count)+'％なので，必要な最少回数は'+count+'回。'};
    }),
  finite(51,'アローダイアグラム上の各作業日数',projectCases.length,
    '9作業と分岐・合流，Eの日数短縮前後，作業名と日数の凡例，短縮日数0～3の昇順を保持。',i=>{
      const {times,shorter}=projectCases[i], source=original(51), before=projectDays(times);
      const after=projectDays(times.map((value,j)=>j===4?shorter:value));
      return {prompt:[p(source.prompt.replace('9日から6日',times[4]+'日から'+shorter+'日')),renderFigure('51-project',i)],
        choices:strings(source.choices),correctIndex:before-after,
        explanation:'各結合点では，その点へ到達する先行作業がすべて終わるのを待つ。到達時刻の最大値を引き継いで終点まで進むと，短縮前は'+
          before+'日，Eを'+shorter+'日とした後は'+after+'日。従ってプロジェクト全体を'+(before-after)+'日短縮できる。'};
    }),
];
