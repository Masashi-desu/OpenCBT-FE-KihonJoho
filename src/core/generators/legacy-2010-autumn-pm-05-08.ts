import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, table, variableNotes } from './definition';
import { autumn2015PmAnswers, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { autumn2010PmPageAssetId, autumn2010PmReference } from './legacy-2010-autumn-pm-materials';
import { caseCount, caseIndex, collection, companies, financeAt, inventoryAt, multiplyAt, privacyAt } from './legacy-2010-autumn-pm-05-08-model';
import { answerBanks, officialKeys, slots, sourcePages, type Bank, type Major } from './legacy-2010-autumn-pm-05-08-source';
export { autumn2010Pm0508OriginalPageAlt } from './legacy-2010-autumn-pm-05-08-source';

function answers(major:Major,index:number,positions:readonly number[]){
  const banks=answerBanks(index), order=[...new Set<Bank>(slots[major].map(([,bank])=>bank))];
  return autumn2015PmAnswers(order.map(bank=>banks[bank].map((choice):Block[]=>
    [typeof choice==='string'?p(choice):table('空欄の組合せ',[...choice.columns],[[...choice.row]])])),
    slots[major].map(([id,bank],i)=>autumn2015PmSingle(id,major===5?'設問'+id:id,order.indexOf(bank),positions[i])));
}
function prompt(major:Major,index:number){
  const blocks:Block[]=[];
  for(const [,entries] of sourcePages(major,index))for(const entry of entries){
    if('bank' in entry)continue;
    if('continuation' in entry){
      const previous=blocks.pop();
      if(previous?.type!=='paragraph')throw new Error('原資料の継続段落がありません');
      blocks.push(p(previous.text+entry.continuation));
    }else blocks.push(entry);
  }
  return blocks;
}
const common=(major:Major,name:string)=>({
  source:collection+'-'+major,sourceAnswer:officialKeys[major].split('').join('／'),reference:[0],
  version:'3.7.0' as const,fields:[field(name,0,caseCount-1)],
});
const q5:AfternoonBookletDefinition={
  ...common(5,'管理する品目・管理単位・比較の向きとモジュール配置'),title:'先入先出法による棚卸金額計算',
  notes:variableNotes+' 公式p21–25。受入日付が同一となる同一管理番号の複数受入れはない。全順ファイル・整列の優先順位・払出日付を集約後に使わない・0数量非出力・次期への在庫継承・終端最大値・KH/KU/H/U・P1～P3・比較C1/C2を維持。',
  publicNotes:'先入先出法とファイル処理の流れを保ち，品目の管理単位，比較の向き及び空欄位置を変更しました。',
  build(values){
    const i=caseIndex(values), c=inventoryAt(i);
    const reads=[c.processes[0],c.processes[2]].sort(), groups=[['P1'],['P2'],['P3'],['P1','P2'],['P1','P3'],['P2','P3'],['P1','P2','P3']];
    const answer4=groups.findIndex(group=>group.join()===reads.join());
    return {prompt:prompt(5,i),...answers(5,i,[4,5,5,answer4,c.reverse?4:2]),
      explanation:[
        '設問1：まず同一の'+c.key+'を連続させ，その中で受入日付の古い順に並べる。日付を最優先にすると複数の管理番号が混在し，先入先出の順ファイル突合せが成立しない。数量や購入単価は順番の基準にしない。',
        '設問2・3：払出しは'+c.key+'ごとに全期の払出数量を合計する。払出情報に必要なのは払出数量と'+c.key+'だけであり，集計キーも'+c.key+'だけである。受入日付と払出日付を残す必要はない。',
        '設問4：KU＜KHなら，該当する払出しがない受入れレコードを在庫出力し，次の受入れへ進む。数量差が0以下でも現在の受入れは使い切るため，払出し側へ進む前の'+c.processes[2]+'で受入れを読む。したがって受入情報読込みは'+reads.join('，')+'である。'+c.processes[1]+'には残った数量を使った金額集計を置く。',
        '設問5：H←H−Uの後，H＜0なら受入数量が払出数量より多く，残在庫を出力して金額を集計する。H＝0なら両方を使い切り，受入情報と払出情報の両方を読む。H＞0なら受入情報だけを次へ進める。図の比較は'+(c.reverse?'0：HなのでC1は＞，C2は＝':'H：0なのでC1は＜，C2は＝')+'。',
      ].join('\n')};
  },
};
const q6:AfternoonBookletDefinition={
  ...common(6,'委託業務の事業条件と現地調査の順序'),title:'個人データの取扱いを委託する際の安全管理',
  notes:variableNotes+' 公式p26–29。2010年試験当時の経産分野ガイドライン前提。3業務の区分・契約/監督・4種の安全管理措置・必要データだけの暗号送信・鍵管理・監査証跡・権限の問題とリスクを保持。現行の法令条番号への置換はしない。',
  publicNotes:'試験当時の安全管理措置と委託関係の前提を保ち，業務条件と現地調査の項番を変更しました。',
  build(values){
    const i=caseIndex(values), c=privacyAt(i), physical=c.order.indexOf(0);
    return {prompt:prompt(6,i),...answers(6,i,[2,3,0,physical,0,1]),explanation:[
      'a，b：この設問の当時のガイドラインに沿い，安全管理措置を委託先に守らせる事項を契約で定め，業務開始後は個人データの取扱状況を監督する。委託元が委託先の運用担当者を任命したり，委託先の従業者へ直接指揮命令したりする事項ではない。',
      'c：業務②・③を委託すると，'+c.client+'内部の顧客情報へ委託先からアクセスする経路が必要となり，アクセス制御等のシステム改修が必要になる。専用作業室は物理的措置，委託元の常駐や指揮命令はその技術的措置と対応しない。',
      'd：鍵を誰でも使える問題点'+(physical+1)+'は，廃棄する印刷物の物理的な保護の問題である。残りは特権操作・ファイル参照権限・アクセス記録という情報システムの技術的措置である。',
      'e：廃棄箱の鍵を誰でも使えると，個人情報を含む印刷物を持ち出せる。認証機能をう回したことやシステム障害はこの事実から導けない。',
      'f：特権操作とファイルアクセスの記録がないと，だれが何をしたか後から追跡できず，誤操作や不正操作の発見が難しくなる。認証の有無とは別に監査証跡を確保する必要がある。',
    ].join('\n')};
  },
};
const positionOrNone=(flags:readonly boolean[])=>{const found=flags.indexOf(true);return found<0?4:found;};
const q7:AfternoonBookletDefinition={
  ...common(7,'2年度の子会社別業績・為替レート'),title:'為替変動を考慮した子会社の業績評価',
  notes:variableNotes+' 公式p30–32，p33メモは対象外。4社，国内/在外区分，黒字2条件・売上/利益率/ROA全向上・売上/営業利益とも10％以上減少，ROAは経常利益/総資産，円と現地通貨，年度別為替，5指標，8欄を保持。選択肢に該当なしあり。',
  publicNotes:'子会社の評価条件と財務指標の定義を保ち，2年度の業績と為替レートを変更しました。',
  build(values){
    const i=caseIndex(values), f=financeAt(i), excluded=f.eligible.indexOf(false), award=positionOrNone(f.awards), review=positionOrNone(f.reviews);
    return {prompt:prompt(7,i),...answers(7,i,[excluded,3,1,f.trend,1,5,award,review]),explanation:[
      'a：当年度の営業利益と経常利益のどちらかが0以下の'+companies[excluded]+'を除外する。黒字条件は両方について満たす必要があり，経常利益が0でも候補にならない。',
      'b，c：ROA＝（経常利益／売上高）×（売上高／総資産）である。後者は総資産回転率であり，資産を売上に結び付ける効率性を示す。総資産回転期間は逆数である。',
      'd：D社の現地通貨での売上高は'+f.local[0][2].sales+'から'+f.local[1][2].sales+'，営業利益は'+f.local[0][2].operating+'から'+f.local[1][2].operating+
        'となる。日本円の値を各年度のYドル為替レートで割って比較する。',
      'e，f：円換算で一定倍される売上高と営業利益は為替で値が変わる。営業利益率・経常利益率・ROAは分子と分母が同じ為替レートで換算されるため，現地通貨と円で一致する。',
      'g，h：国内2社は円，在外2社は現地通貨で同じ基準を当てはめる。前期の分母を用いた増減比較と，営業利益率・ROAの分数の交差積を比較する。'+
        companies.map((name,j)=>name+'は優秀賞'+(f.awards[j]?'対象':'対象外')+'，要調査'+(f.reviews[j]?'対象':'対象外')).join('。')+
        '。したがって経営優秀賞は'+(award===4?'該当なし':companies[award])+'，要調査対象は'+(review===4?'該当なし':companies[review])+'。',
    ].join('\n')};
  },
};
const pseudocodePages=[3,4] as const;
const q8:AfternoonBookletDefinition={
  fixedReferenceAssetIds:pseudocodePages.map(autumn2010PmPageAssetId),
  ...common(8,'乗算の実行例で用いる符号付き被乗数'),title:'符号付き2進整数の乗算とBoothの方法',
  notes:variableNotes+' 公式p34–38，共通疑似言語p3–4。M/Nは4bit−8..7，M5bit拡張，N8bit拡張，R13bit/10bit，部分演算とoverflow無視，算術右シフトで符号保持，ビット0起点，8/4回ループ，各段番号，継続コメント，網掛け，空欄a6bit/b,c7bit，各選択肢の順序と表現を保持。',
  publicNotes:'2方式の乗算，ビット幅と処理回数を保ち，実行例の被乗数を変更しました。',
  build(values){
    const i=caseIndex(values), c=multiplyAt(i), banks=answerBanks(i);
    const positions=[banks['8a'].indexOf(c.a),banks['8bc'].indexOf(c.b),banks['8bc'].indexOf(c.c),2,4,2,0];
    return {prompt:prompt(8,i),...answers(8,i,positions),
      contexts:[autumn2010PmReference('共通に使用される擬似言語の記述形式',pseudocodePages)],
      explanation:[
        'a：プログラム1でM＝−'+c.m+'を5ビットへ拡張する。初回加算後にR全体を算術右シフトし，上位6ビットは'+c.a+'。右シフト時には符号と同じ1を左から補う。',
        'b：次の加算を上位5ビットに行い，全13ビットをもう一度算術右シフトする。上位7ビットは'+c.b+'となる。部分加算をR全体への符号なし加算と混同しない。',
        'c：プログラム2は初回の下位2ビットが10なのでMを減算する。その後2回の算術右シフトを経た上位7ビットは'+c.c+'。次の下位2ビット01で加算する。2方式の返す8ビットはともに'+c.negative.result+'（−'+(c.m*c.n)+'）となる。',
        'd：乗数NをRの下位へ入れておけば，中間結果のシフトと乗数の次のビットの取出しを同じ右シフトで行える。MやNが1のときでも加算を0回にはできない。',
        'e：N＜0では4ビットの符号ビットが1で，8ビットへ拡張すると上位5ビットがすべて1となる。プログラム1は最低5回加算する。',
        'f：プログラム2の加減算回数は，下位に0を付けたNの隣接ビットが異なる境界の数である。負数4ビットでは最高3回で，−3，−5，−6，−7などで達成する。',
        'g：0111の連続する1は，2⁰＋2¹＋2²＝−2⁰＋2³と表せる。Mを1回減算し，3ビットずらしたMを1回加算するので計2回となる。',
      ].join('\n')};
  },
};
export const legacy2010AutumnPm05To08Definitions:readonly AfternoonBookletDefinition[]=[q5,q6,q7,q8];
