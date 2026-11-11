import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, variableNotes } from './definition';
import { autumn2015PmAnswers, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { special2011PmPageAssetId, special2011PmReference } from './legacy-2011-special-pm-materials';
import { bitText, optionIds, renderFigure } from './legacy-2011-special-pm-05-08-figures';
import { campaignAt, caseCount, caseIndex, collection, combinationAt, evmAt, formatted, marketAt, stages } from './legacy-2011-special-pm-05-08-model';
import { answerBanks, officialKeys, slots, sourcePages, type Bank, type Major } from './legacy-2011-special-pm-05-08-source';
export { special2011Pm0508OriginalPageAlt } from './legacy-2011-special-pm-05-08-source';

function answerData(major:Major,index:number,answers:readonly (number|string)[]) {
  const order = [...new Set<Bank>(slots[major].map(([,bank])=>bank))], banks = answerBanks(index);
  const bodies = order.map(bank=>banks[bank].map((text,j):Block[]=>[
    bank==='8a' ? renderFigure(optionIds[j],index) : p(text),
  ]));
  return autumn2015PmAnswers(bodies,slots[major].map(([id,bank],i)=>{
    const answer = answers[i], option = typeof answer==='string'?banks[bank].indexOf(answer):answer;
    if (!banks[bank][option]) throw Error('PARAMETER_CONSTRAINT');
    return autumn2015PmSingle(id,id==='2'?'設問2':id,order.indexOf(bank),option);
  }));
}
const prompt = (major:Major,index:number):Block[] => sourcePages(major,index)
  .flatMap(([,entries])=>entries.filter((entry):entry is Block=>!('bank' in entry)));
const meta = (major:Major) => ({ source:collection+'-'+major, sourceAnswer:[...officialKeys[major]].join('／'), reference:[0], version:'3.7.0' as const });
const choice = (name:string) => [field(name,0,caseCount-1)];

const q5:AfternoonBookletDefinition = {
  ...meta(5),title:'あて先作成プログラム',
  fields:choice('キャンペーン期間・対象商品範囲・招待券の金額条件'),
  notes:variableNotes+' 印刷・PDF p.22〜26。顧客番号順の順ファイル、期間外読み飛ばし、同一顧客内の応募券集計、全購入額、両券でも1レコード、ガウス記号、合計表の網掛けとα/βを保持。',
  publicNotes:'あて先作成の流れを保ち，期間，対象商品コード及び招待券の金額条件を変更しました。',
  build(values) {
    const i=caseIndex(values), c=campaignAt(i);
    return {
      prompt:prompt(5,i), ...answerData(5,i,[2,5,4,String(c.invitations),String(c.addresses)]),
      explanation:[
        'a：顧客処理が終わってから，対象期間に買った全商品の金額の合計が'+formatted(c.threshold)+'円以上かを判定する。対象商品コードや現在の1レコードだけで判定しない。',
        'b：応募券が1枚以上又は招待券が1枚なら宛先を1件出力する。両方ある顧客も1レコードにまとめる。',
        '設問2：応募券処理は期間内かつ対象コードの各レコードで実行される。既に集めた応募券枚数へ，現在の購入個数を加える。',
        'c，d：期間と商品範囲の両端を含め，顧客ごとに「応募券枚数／購入金額」を集計すると，'+
          [...c.customers].map(([id,{applications,amount}])=>id+'＝'+applications+'枚／'+formatted(amount)+'円').join('，')+
          'となる。招待券は'+c.invitations+'枚，あて先ファイルは'+c.addresses+'件である。',
      ].join('\n'),
    };
  },
};
const referencePages = [3,4] as const;
const referenceTitle = '共通に使用される擬似言語の記述形式';

const q6:AfternoonBookletDefinition = {
  ...meta(6),title:'EVMによるプロジェクトの進捗管理',
  fields:choice('機能数・標準工数・工程別の完了数と実績工数'),
  notes:variableNotes+' 印刷・PDF p.27〜31。各機能は独立、1〜5月の計画、2月外部設計の遅れと3月末完了、工程別PV/AC/EV、SV/CV/CPI、CPIの小数第3位四捨五入、4月の1機能当たりの実績工数とテスト計画を維持。',
  publicNotes:'EVMの指標と予測の前提を保ち，工程別の機能数と標準・実績工数を変更しました。',
  build(values) {
    const i=caseIndex(values), e=evmAt(i), [outer,inner,impl]=e.march;
    const sv = [outer,impl].map(({pv,ev})=>ev-pv);
    const cv = e.march.map(({ac,ev})=>ev-ac);
    const svAnswer = [[0,0],[1,1],[-1,0],[-1,1],[0,1]].findIndex(pair=>pair.every((v,j)=>v===Math.sign(sv[j])));
    return {
      prompt:prompt(6,i), ...answerData(6,i,[formatted(e.feb[0].ev),formatted(inner.pv),svAnswer,
        cv.findIndex(v=>v<0),cv.findIndex(v=>v>0),e.cpi,formatted(e.april),formatted(e.prediction)]),
      explanation:[
        'a：2月末までに外部設計が完了したのは'+(e.complete[0][0]+e.complete[0][1])+'機能なので，標準'+
          e.rates[0]+'を掛け，EVは'+formatted(e.feb[0].ev)+'。b：内部設計の3月末までの予定は'+e.total+
          '機能なので，PVは'+e.total+'×'+e.rates[1]+'＝'+formatted(inner.pv)+'。',
        'c：外部設計・実装のSVは順に'+sv.join('，')+'。d，e：工程別のCVは外部設計，内部設計，実装の順に'+cv.join('，')+
          'なので，負は'+stages[cv.findIndex(v=>v<0)]+'，正は'+stages[cv.findIndex(v=>v>0)]+'。',
        'f：3月末の全工程のEV合計'+formatted(outer.ev+inner.ev+impl.ev)+'をAC合計'+formatted(outer.ac+inner.ac+impl.ac)+
          'で割り，小数第3位を四捨五入すると'+e.cpi+'。',
        'g：内部設計の残り'+(e.total-e.complete[1][1]-e.complete[1][2])+'機能には実績の'+e.actualRates[1]+
          'を，実装の残り'+(e.total-e.complete[2][2])+'機能には実績の'+e.actualRates[2]+'を掛ける。4月の合計は'+
          formatted(e.april)+'。h：これに3月末の累積ACと4・5月のテスト工数'+formatted(e.total*e.rates[3])+
          'を加え，'+formatted(e.prediction)+'となる。',
      ].join('\n'),
    };
  },
};

const q7:AfternoonBookletDefinition = {
  ...meta(7),title:'ゲーム理論を活用した出店戦略',
  fields:choice('消費者セグメント別の月間売上見込み'),
  notes:variableNotes+' 印刷・PDF p.32〜35。店舗種類と4セグメント、非競合は全額・競合は50％ずつ、A社2行とB社3列、利得順（A社，B社）、百万円、戦略と表の空欄を保持。B社の支配戦略とA社の最適応答も可変。',
  publicNotes:'店舗とセグメントの対応及び競合時の配分を保ち，月間売上見込みを変更しました。',
  build(values) {
    const i=caseIndex(values), m=marketAt(i);
    const [station,mall]=m.matrix;
    return {
      prompt:prompt(7,i),...answerData(7,i,[1,3,formatted(station[1][0]),formatted(station[2][0]),formatted(mall[1][0]),m.bestB,m.bestA]),
      explanation:[
        'a：B社が駅ビル内なら1・2，A社が郊外モール内なら3・4を対象にするため，それぞれ独占する。b：両社が駅ビル内なら1・2が重なり，両社が半分ずつ獲得する。',
        'c，d，e：競合するセグメントだけを半分にする。A社が駅ビル内でB社が駅前商店街なら，A社は1を全てと2の半分で'+
          station[1][0]+'百万円。B社が出店しなければ，A社は1・2を全て獲得して'+station[2][0]+
          '百万円。A社が郊外モール内でB社が駅前商店街なら，A社は3の半分と4の全てで'+mall[1][0]+'百万円となる。',
        'f：B社の売上は，A社が駅ビル内なら'+station.map(pair=>pair[1]).join('，')+
          '百万円，郊外モール内なら'+mall.map(pair=>pair[1]).join('，')+'百万円。両方で最大となるのは'+
          answerBanks(i)['7fg'][m.bestB]+'戦略である。g：その列のA社の利得を比較すると'+
          station[m.bestB][0]+'百万円と'+mall[m.bestB][0]+'百万円なので，A社は'+answerBanks(i)['7fg'][m.bestA]+'。',
      ].join('\n'),
    };
  },
};

const q8:AfternoonBookletDefinition = {
  ...meta(8),title:'N個からK個を選ぶ全組合せの生成',
  fields:choice('要素数・選択数・Nextへ渡す配列'),
  fixedReferenceAssetIds:referencePages.map(special2011PmPageAssetId),
  notes:variableNotes+' 印刷・PDF p.36〜39、共通疑似言語p.3〜4。要素番号1起点、配列Sの0/1、初期化の1≦K≦N、Nextの終了、Mainのαの制御線・空行・コメント位置と全ての解答群を保持。',
  publicNotes:'疑似言語の制御線と解答欄の構成を保ち，要素数，選ぶ個数及び実行例の配列を変更しました。',
  build(values) {
    const i=caseIndex(values), s=combinationAt(i);
    return {
      prompt:prompt(8,i),contexts:[special2011PmReference(referenceTitle,referencePages)],
      ...answerData(8,i,[0,3,3,bitText(s.next),'0～'+(s.n-2),'0～'+(s.k-1),bitText(s.last)]),
      explanation:[
        'a：Initが成功した直後の最初の配列も対象である。R＝0のループ内でDumpを先に行い，次にNextを実行すれば，全組合せを重複なく1回ずつ印字する。終了を返したときの配列は再印字しない。',
        'b，c：先頭から初めて見つけた1，0を0，1に変える。交換した要素の左側だけを，Init(S, L-1, C)でC個の1から始まる形に戻す。',
        'd：'+bitText(s.example)+'からこの手順で'+bitText(s.next)+'になる。',
        'e，f：最初の要素がLで，Lは1～'+(s.n-1)+'になり得る。Initに渡るNはL－1なので0～'+
          (s.n-2)+'。交換する対で1個の1を使うので，その前にある1の個数Cは0～'+(s.k-1)+
          '。C＝0のとき，Initは－1を返し配列を変えない。',
        'g：最後は'+bitText(s.last)+'。1，0の対が残っていないのでNextが－1を返し，この配列が保持される。',
      ].join('\n'),
    };
  },
};
export const legacy2011SpecialPm05To08Definitions: readonly AfternoonBookletDefinition[] = [q5,q6,q7,q8];
