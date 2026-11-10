import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, variableNotes } from './definition';
import { autumn2015PmAnswers, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { spring2012PmPageAssetId, spring2012PmReference } from './legacy-2012-spring-pm-materials';
import {
  applicantModel, bitModel, investmentModel, progressModel, spring2012Pm0508Case,
} from './legacy-2012-spring-pm-05-08-model';
import {
  applicantList, bitCostTable, depreciationTable, drawings, spring2012Pm0508Figure, spring2012Pm0508Option, type DrawingId,
} from './legacy-2012-spring-pm-05-08-figures';
import {
  answerBanks, bankOrder, bankTitles, bookletPages, investmentLatex, marks, officialKeys, pageRanges, slots, sortOption, type Bank, type Major,
} from './legacy-2012-spring-pm-05-08-source';

const commonPages = [3,4] as const;
const staticPanels: Record<string, (index:number)=>Block> = {
  '5-example': index=>applicantList(index,false),
  '5-example-extra': index=>applicantList(index,true),
  '7-long-table':depreciationTable,
  '8-cost-table':bitCostTable,
};

function panel(id: string, index: number): Block {
  const staticPanel = staticPanels[id];
  if (staticPanel) return staticPanel(index);
  if (!Object.hasOwn(drawings,id)) throw Error('SOURCE_FORMAT');
  return spring2012Pm0508Figure(id as DrawingId,index);
}

function choiceBlock(id: Bank, text: string, index: number, option: number): Block {
  switch(id) {
    case '5ab': return spring2012Pm0508Option('5-ab-option',index,option);
    case '7b': return spring2012Pm0508Option('7-b-option',index,option);
    case '7c': return spring2012Pm0508Option('7-c-option',index,option);
    case '7a': return { type:'formula', text:investmentLatex[option], alt:text, format:'latex' };
    case '8ab': case '8f': return code(text);
    default: return p(text);
  }
}

function answerData(major:Major,index:number,keys:readonly (number|string)[]) {
  const order:readonly Bank[] = bankOrder[major], banks = answerBanks(index);
  const bodies = order.map(id => banks[id].map((text, option): Block[] => [choiceBlock(id,text,index,option)]));
  return autumn2015PmAnswers(bodies, slots[major].map(([label,bankIndex],i) => {
    const value = keys[i];
    const key = typeof value === 'string' ? banks[order[bankIndex]].indexOf(value) : value;
    if (!bodies[bankIndex][key]) throw Error('PARAMETER_CONSTRAINT');
    return autumn2015PmSingle(label === '設問2' ? 's2' : label,label,bankIndex,key);
  }));
}

function prompt(major:Major,index:number):Block[] {
  const pages=bookletPages(index), [first,last]=pageRanges[major], result:Block[]=[];
  for (let page:number=first;page<=last;page++) for (const line of pages[page].split('\n')) {
    if (line.startsWith('#')) continue;
    if (line.startsWith('§')) result.push(panel(line.slice(1),index));
    else result.push(p(line));
  }
  return result;
}

export function spring2012Pm0508OriginalPageAlt(major:Major):Record<number,string> {
  const pages=bookletPages(0), banks=answerBanks(0), [first,last]=pageRanges[major];
  return Object.fromEntries(Array.from({length:last-first+1},(_,i)=>{
    const page=first+i;
    const alt=pages[page].split('\n').map(line=>{
      if (line.startsWith('#')) {
        const id=line.slice(1) as Bank;
        return [bankTitles[id], ...banks[id].map((text,j)=>marks[j]+'　'+
          (id === '7b' || id === '7c' ? '上から順に' + text.split('｜').join('，') : text))].join('\n');
      }
      if (!line.startsWith('§')) return line;
      const block=panel(line.slice(1),0);
      if (block.type==='diagram') return block.caption+'\n'+block.alt;
      if (block.type==='table') return [...(block.captionPresentation==='accessible'?[]:[block.caption]), ...(block.sourceLabels ?? []).map(label=>label.text),
        block.columns.join('｜'),...block.rows.map(row=>row.join('｜'))].join('\n');
      throw Error('SOURCE_FORMAT');
    }).join('\n\n');
    return [page,alt];
  }));
}

const meta = (major:Major) => ({
  source:'2012h24h-fe-pm-'+major, sourceAnswer:officialKeys[major].join('／'), reference:[0], version:'3.7.0' as const,
});

const q5:AfternoonBookletDefinition={
  ...meta(5), title:'受験者数の集計と出身校別リスト',
  fields:[field('受験者数・学校コード順・同数時の整列順',0,3)],
  notes:variableNotes+' 印刷／PDF p.19–24。順ファイルの学校コード順、同数のときの優先キー、競技順位、指定順位とその他計、突合せ中の整列なし、片側欠落の0と前年度順位の空欄、レコード様式・表1の2列にまたがるa・bを保持。入力と印字における学校コード順を独立に変え、前年度人数の同数時の優先順と例表を更新する。例表に現れない学校は同じ合計と順位を満たす構成で内部だけに補う。',
  publicNotes:'突合せ表とレコード様式を保ち，受験者数やファイル・リストの整列順を変更しました。',
  build(values){
    const i = spring2012Pm0508Case(values), a = applicantModel(i);
    const order = sortOption([['今年度受験者数','降順'],['前年度受験者数',a.previousDirection],['学校コード',a.outputDirection]]);
    return {
      prompt:prompt(5,i), ...answerData(5,i,[3,5,order,3,a.codeDirection==='昇順'?1:0,2]),
      explanation:[
        'a：今年度だけにレコードがあるので，今年度人数はファイル1の当該項目，前年度人数は0。b：前年度だけにレコードがあるので，学校コードはファイル2の当該項目，今年度人数は0になる。',
        '設問2：印字の優先順どおり，今年度受験者数の降順，前年度受験者数の'+a.previousDirection+'，学校コードの'+a.outputDirection+
          'が必要である。同数でも今年度順位は同じで，指定順位より下はその他計に加える。',
        'c：学校別に集計した前年度人数を降順に整列してから順位付けするので，処理2は受験者数の降順への整列。d：処理4は突合せに備え，ファイル1と同じ学校コードの'+a.codeDirection+'に整列する。',
        'e：ファイル9・10には学校コード，今年度受験者数，前年度順位，前年度受験者数が必要である。今年度順位は次の順位付けで生成する。前年度に受験者がいない学校の前年度順位は空欄となる。',
      ].join('\n'),
    };
  },
};

const trendOptions = ['-1,-1','0,1','0,-1','-1,1'];
const q6:AfternoonBookletDefinition={
  ...meta(6), title:'設計工程の進捗率と計画実績工数比',
  fields:[field('メンバ別の第1週実績・残り工数',0,3)],
  notes:variableNotes+' 印刷／PDF p.25–29。4人・3週、平日5日かつ1日8時間、週2は計画工数どおり、残工数は各週末再見積り。三つの式は原位置で分子・分母を括弧で区切って横書きにする。小数第2位を四捨五入する進捗率と小数第3位を四捨五入する計画実績工数比を区別。2人の第2週の遅れ、比1.00以下のチーム、第3週の計画工数未満の残工数からの支援者選択が一意な組を許す。',
  publicNotes:'表の列と計算・四捨五入の規則を保ち，第1週の実績と各週末の残り工数を変更しました。',
  build(values){
    const i = spring2012Pm0508Case(values), m = progressModel(i);
    const late1 = m.delayed[0][0] ? m.delayed[0][0]+'である' : 'いない';
    const late2 = m.delayed[1].join('と');
    const ratio = m.ratios.map(value=>value.toFixed(2)).join('及び');
    return {
      prompt:prompt(6,i), ...answerData(6,i,[late1,late2,trendOptions.indexOf(m.trend.join(',')),ratio,String(m.increased),m.helper]),
      explanation:[
        'a，b：週末の実績進捗率は累積実績÷（累積実績＋残り）×100を小数第1位に丸めて計画値と比較する。第1週の着手者で下回るメンバは'+late1+'。第2週は'+late2+'の2人である。',
        'c：チーム全体は個人の率の平均を使わず表2の合計で計算する。第1週は計画'+m.planTeam[0].toFixed(1)+'％に対し実績'+m.actualTeam[0].toFixed(1)+
          '％，第2週は計画'+m.planTeam[1].toFixed(1)+'％に対し実績'+m.actualTeam[1].toFixed(1)+'％である。',
        'd，e：各週末の累積実績＋残りを計画総工数で割り，小数第2位に丸める。チームは'+ratio+
          'で，いずれも1.00以下。第1週から第2週にメンバ別の比が増えたのは'+m.increased+'名。',
        'f：第3週の計画工数より第2週末の残り工数が少ないメンバを絞り，その中で実績進捗率が最も高い'+m.helper+'が支援を担当する。',
      ].join('\n'),
    };
  },
};

const q7:AfternoonBookletDefinition={
  ...meta(7), title:'正味現在価値による投資採算性の評価',
  fields:[field('一括・分割の投資額・割引率・追加機能の効果',0,3)],
  notes:variableNotes+' 印刷／PDF p.30–34。評価期間2012～2020、基準年n＝0、複利、翌年から4年間の残存0定額償却、法人税40％、小数第2位の四捨五入、網掛け、縦のb・c選択肢、設問3で同じ候補を複数の欄に使用できる条件を保持。投資額・割引率・追加効果を変更する。表1・2の現在価値を年ごとに丸めて合計する。原問の機能追加後NPVは本文の与件とし、派生の与件は2013年から追加の年次効果が続くと明記して計算する。',
  publicNotes:'年ごとの割引と税引き後効果の関係を保ち，投資額・割引率・追加機能の条件を変更しました。',
  build(values){
    const i = spring2012Pm0508Case(values), m = investmentModel(i);
    const lumpWorth = m.addedLump > m.lumpNpv, splitWorth = m.addedSplit > m.splitNpv;
    return {
      prompt:prompt(7,i), ...answerData(7,i,[0,5,0,m.lumpNpv>m.splitNpv?2:3,lumpWorth?splitWorth?1:2:splitWorth?3:0,2,1,2]),
      explanation:[
        'a：正味現在価値（NPV、Net Present Value）は各年のキャッシュを基準時点へ割り引いた合計。現在の金額をn年後に換算すると(1＋r)ⁿ倍になるので，現在価値は将来のCを(1＋r)ⁿで割る。投資年のn＝0では額が変わらない。',
        'b：一括案の2013年の投資後効果は'+m.lumpRows[1].effect+'百万円で，割引率'+m.discount.toFixed(2)+'を用いて割り引くと現在価値は'+m.lumpRows[1].pv+'百万円。',
        'c：分割案の2015年は，2012年の投資だけを減価償却し，償却費は'+m.splitRows[3].depreciation+'百万円。コスト削減額'+m.splitRows[3].saving+
          '百万円から計算した法人税は'+m.splitRows[3].tax+'百万円で，税引き後効果は'+m.splitRows[3].afterTax+'百万円。2015年投資分の償却は翌年から。',
        'd：年別の現在価値を合計すると，一括案'+m.lumpNpv+'百万円，分割案'+m.splitNpv+'百万円となる。どちらも正で，NPVが大きい'+(m.lumpNpv>m.splitNpv?'一括':'分割')+'案を選ぶ。',
        'e：機能追加後の一括案'+m.addedLump+'百万円，分割案'+m.addedSplit+'百万円を，それぞれ同じ投資案の追加前と比較する。'+
          (lumpWorth&&splitWorth?'どちらも上がるので両案で受け入れる。':'どちらも下がるので両案で受け入れない。'),
        'f～h：5年償却では2013～2016年の償却額が下がって法人税が増え，税引き後効果は下がる。2017年は償却額が上がり，税引き後効果は上がる。節税効果が後ろの年に移るため現在価値の合計は小さくなる。再計算したNPVは一括'+m.longNpv[0]+'百万円，分割'+m.longNpv[1]+'百万円。',
      ].join('\n'),
    };
  },
};

const q8:AfternoonBookletDefinition={
  ...meta(8), title:'8ビットのマスク検査と1の個数の計算',
  fields:[field('ビット列・マスク・行ごとの処理量',0,3)],
  fixedReferenceAssetIds:commonPages.map(spring2012PmPageAssetId),
  notes:variableNotes+' 印刷／PDF p.35–39，共通疑似言語p.3–4、問8は必須。ビット番号7～0，8ビット論理型と符号なし減算，非ゼロMask，Mask＝0の修正条件，条件行・終端の処理量対応，論理右シフト，繰返し終了判定，αの矢印と2回目終了時点を保持。修正案3つは同じ字下げと分岐。処理量と図の数値・例のビット列・選択肢・解説を同期する。',
  publicNotes:'疑似言語・分岐・各行の対応を保ち，ビット列と処理量を変更しました。',
  build(values){
    const i = spring2012Pm0508Case(values), m = bitModel(i);
    return {
      prompt:prompt(8,i), contexts:[spring2012PmReference('共通に使用される擬似言語の記述形式',commonPages)],
      ...answerData(8,i,[2,0,1,String(m.max2),String(m.min3),m.second]),
      explanation:[
        'a，b：DataとMaskの論理積でMaskが1の位置だけを残す。結果がMaskと等しければ検査したビットは全て1，結果が0なら全て0，どちらでもなければ0と1が混在している。',
        'c：Mask＝0では両条件が真になる。①はaを先に評価して2，②はbを先に評価して0，③はbで0にしてからaで2に上書きする。既存の非ゼロMaskについても②は判定を保つので，②だけが正しい。',
        'd：プログラム2は8回の繰返しと最後の条件判定を実行する。Dataの全ビットが1のとき，最小処理量'+m.min2+'にCountの加算8回の費用'+
          (m.max2-m.min2)+'が加わって最大'+m.max2+'となる。',
        'e：プログラム3の最小はData＝0。繰返し本体を実行せず，初期代入2行，最初の条件判定，返却だけなので処理量は'+m.min3+'となる。',
        'f：Work−1では最下位の1が0になり，それより下の0が1になる。元のWorkとの論理積を取ると最下位の1だけが消える。'+
          m.trace+'→'+m.first+'→'+m.second+'となり，αを2回実行した時点の値が得られる。',
      ].join('\n'),
    };
  },
};

export const legacy2012SpringPm05To08Definitions:readonly AfternoonBookletDefinition[]=[q5,q6,q7,q8];
