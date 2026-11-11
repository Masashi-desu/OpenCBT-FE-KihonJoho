import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code,field,p,variableNotes } from './definition';
import { autumn2015PmAnswers,autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { spring2010PmPageAssetId, spring2010PmReference } from './legacy-2010-spring-pm-materials';
import { answerBanks,officialKeys,slots,sourcePages,type Bank,type Major } from './legacy-2010-spring-pm-05-08-source';
import { businessAt,caseCount,caseIndex,collection,deliveryAt,deliveryLead,digits,qualityAt,sortAt,sortTrace } from './legacy-2010-spring-pm-05-08-model';
export { spring2010Pm0508OriginalPageAlt } from './legacy-2010-spring-pm-05-08-source';

function answers(major:Major,index:number,positions:readonly number[]){
  const banks=answerBanks(index), order=[...new Set<Bank>(slots[major].map(([,bank])=>bank))];
  const content=order.map(bank=>banks[bank].map((option):Block[]=>[typeof option!=='string'?option:
    bank==='8a'||bank==='8b'||bank==='8c'?code(option):p(option)]));
  const bySlot=slots[major].map(([id,bank],i)=>autumn2015PmSingle(id,Number.isNaN(Number(id))?id:'設問'+id,order.indexOf(bank),positions[i]));
  if(major===6){
    const [a,b,...rest]=bySlot;
    return autumn2015PmAnswers(content,[{ids:[...a.ids,...b.ids],labels:[...a.labels,...b.labels],bank:a.bank,correct:[...a.correct,...b.correct]},...rest]);
  }
  return autumn2015PmAnswers(content,bySlot);
}
const prompt=(major:Major,index:number)=>sourcePages(major,index).flatMap(([,entries])=>
  entries.filter((entry):entry is Block=>!('bank' in entry)));
const common=(major:Major,name:string)=>({
  source:collection+'-'+major,sourceAnswer:officialKeys[major].split('').join('／'),reference:[0],
  version:'3.7.0' as const,fields:[field(name,0,caseCount-1)],
});

const q5:AfternoonBookletDefinition={
  ...common(5,'取扱品・受付上限・日付の条件と配達リストの例'),title:'配達サービスの予約・集計・完了登録',
  notes:variableNotes+' 公式p25–30。1受付1配達先，番号の一意性，受付日以降のリード日数，1業者1地域，日別の上限，配達予定日の前日出力，空白の完了日，4ファイルと中間・集計，元の全図表と解答群を保持。',
  publicNotes:'配達の受付・予約・集計の流れを保ち，取扱品，受付可能数，最短配達日と帳票の例を変更しました。',
  build(values){
    const i=caseIndex(values), c=deliveryAt(i), banks=answerBanks(i);
    const a=banks['5ab'].indexOf(deliveryLead(c.lead)+'以降となる');
    return {prompt:prompt(5,i),...answers(5,i,[a,5,0,0,2,4]),explanation:[
      'a：郵便番号の一致と，配達可能日が'+deliveryLead(c.lead)+'以降という条件を同時に使う。受付日そのものや予約済みの日付との関係だけでは最短日を満たすか判断できない。',
      'b：予約ファイルを同じ業者コードと配達可能日と同じ配達予定日で検索する。別の日を含めると，その日の上限値と比較すべき件数がずれる。',
      'c，d：処理Bで抽出するのは予約ファイルの翌日分。配達先住所・氏名と'+c.item+'番号は受付ファイルにある。両方にある受付番号で整列し，突き合わせる。',
      'e：中間ファイルの1レコードは1配達先の予約に対応する。業者ごとのレコード件数を数える。1件の配達先へ複数の'+c.item+'を届けても，配達先件数は1件である。',
      '設問3：配達完了日を書き込む先は予約ファイル。各予約を一意に特定できる予約番号が必要である。配達予定日や郵便番号で特定すると複数件が一致する場合がある。',
    ].join('\n')};
  },
};
const q6:AfternoonBookletDefinition={
  ...common(6,'開発体制・工程別のバグ件数・予測値'),title:'プロジェクトのバグ摘出率と品質管理',
  notes:variableNotes+' 公式p31–37。別の解答欄a/bのみ順不同，同じ解答群でc/dは単独採点。3グループ・4工程，2種類の分母，予測残存と実績，3曲線と全目盛，最後に四捨五入。',
  publicNotes:'工程別のバグ摘出率と順不同の解答欄を保ち，要員数・摘出件数・予測値を変更しました。',
  build(values){
    const i=caseIndex(values), q=qualityAt(i);
    return {prompt:prompt(6,i),...answers(6,i,[1,3,0,2,1,q.fOptions.indexOf(q.f),q.winner,q.hOptions.indexOf(q.h)]),explanation:[
      'a，b（順不同）：新規メンバの要求仕様の理解不足と，高難度のモジュールの多さは発生件数を増やす要因である。強化したレビューでそれらを発見した。緊急の割込み業務については，この状況で生じた根拠が示されていない。',
      'c：以前の機能と類似するモジュールが多いと，再利用できる設計が増える。d：類似システムで経験の多いメンバは生産性の向上に寄与する。',
      'e：検査項目を進めた終盤で累積摘出件数が横ばいになるグラフはイ。予測値の線に達したかだけで判断せず，終盤の増え方を見る。曲線は品質の安定を判断する材料の一つである。',
      'f：S2の実績総件数は'+q.groups[1].join('＋')+'＝'+q.total[1]+'件。製造での'+q.groups[1][1]+'件を割って百分率とし，四捨五入すると'+q.f+'％。',
      'g，h：設計と製造の摘出件数を足してから同じ実績総件数で割る。G1～G3の順に'+q.early.map(rate=>rate.toFixed(2)+'％').join('，')+
        'なので，最も高いのはG'+(q.winner+1)+'で，合算値を四捨五入すると'+q.h+'％。設計終了時の予測値を分母にした率と足すと基準がそろわない。',
    ].join('\n')};
  },
};
const q7:AfternoonBookletDefinition={
  ...common(7,'弱みの分類・業界構造と収益性のデータ'),title:'SWOT・ファイブフォースと事業の収益性',
  notes:variableNotes+' 公式p38–42。強みの相対比較と資産・業務プロセス，五要因の配置・空欄，3種の率，社内横展開。fの同義のオ・カは原紙面に合わせて残し，いずれも全生成条件で不成立。',
  publicNotes:'事業分析の設問構成を保ち，弱みの並び，業界の条件と各事業の利益額を変更しました。',
  build(values){
    const i=caseIndex(values), c=businessAt(i);
    return {prompt:prompt(7,i),...answers(7,i,[1,c.weakAsset,c.entryEasy?7:6,c.supplierStrong?2:3,c.substitutesMany?0:1,c.answer,3]),explanation:[
      'a：業務改善に役立つことは分かるが，他社の取組みと比較した情報がない。自社内の効果だけでは競合に対する強みを示せない。',
      'b：製品ブランドへの顧客の好感度は無形の資産の評価に関わるので'+digits[c.weakAsset]+'。アプリケーション開発，営業支援，物流は業務の進め方に関する記述である。',
      'c：特殊な設備が'+(c.entryEasy?'不要なら，設備投資の障壁が低く参入しやすい。':'必要なら，設備投資の障壁が高く参入しにくい。')+
        'd：固有の包装資材を扱う供給業者が'+(c.supplierStrong?'少ないため，売り手の交渉力が強い。':'限られるような資材がなければ，代わりの売り手を選びやすい。')+
        'e：栄養補助食品などの代替製品が'+(c.substitutesMany?'多いと，別の製品で同じ需要を満たせる。':'少なければ，同じ需要を満たす別の手段が少ない。'),
      'f：各利益を同じ事業の売上で割る。健康飲料事業の売上総利益率・営業利益率・経常利益率は順に'+
        c.rate[0].map(rate=>(rate*100).toFixed(2)+'％').join('，')+'で，他の2事業と比べると順に'+
        c.rank.split('').map(rank=>rank==='H'?'最高':'最低').join('，')+'となる。',
      'g：清涼飲料事業や加工食品事業で既に活用している営業ネットワークを健康飲料事業へ適用すると，他事業の強みを健康飲料事業へ横展開できる。',
    ].join('\n')};
  },
};
const pseudocodePages = [3, 4] as const;
const q8:AfternoonBookletDefinition={
  fixedReferenceAssetIds:pseudocodePages.map(spring2010PmPageAssetId),
  ...common(8,'整列の図例とαの呼出し履歴の入力配列'),title:'マージソートの分割・再帰・併合',
  notes:variableNotes+' 公式p43–47，共通疑似言語p3–4。0起点，整数商，num≧1，2配列の必要領域，奇数分割，SortとMergeの引数，a/b/c，αの位置，βの範囲，継続宣言・空行・制御線と全コード選択肢。',
  publicNotes:'マージソートの疑似言語と分割・併合の図を保ち，図例と呼出し履歴の入力配列を変更しました。',
  build(values){
    const i=caseIndex(values), trace:number[][]=[];
    sortTrace(sortAt(i).trace,trace);
    return {prompt:prompt(8,i),...answers(8,i,[2,2,0,2,3]),
      contexts:[spring2010PmReference('共通に使用される擬似言語の記述形式',pseudocodePages)],
      explanation:[
        'a：分割と再帰を実行するのはnum＞1のとき。num＝1では整列済みとして戻る。num＝2でも分割する必要がある。',
        'b：slist2の先頭はlistの添字num1である。slist2のi番目に入れる値はlist[num1+i]となる。num2は後半の要素数で，先頭の添字とは役割が異なる。',
        'c：両配列から比較対象が取れる条件はi＜num1かつj＜num2。どちらかを使い切った後は残りのコピーに進む。',
        '設問2：αは各呼出しがMergeを終えた直後に到達する。要素1個ではMergeを実行しない。左側の再帰，右側の再帰，最後に全体の併合を行うので，'+
          trace.map(row=>row.join(',')).join(' → ')+' の順になる。',
        '設問3：βでは既にi+j個を出力している。左側に残りがある場合はj＝num2なのでlist[i+num2]，右側に残りがある場合はi＝num1なのでlist[j+num1]へ格納する。残りの各要素を読み進める間，反対側の添字は固定である。',
      ].join('\n')};
  },
};
export const legacy2010SpringPm05To08Definitions:readonly AfternoonBookletDefinition[]=[q5,q6,q7,q8];
