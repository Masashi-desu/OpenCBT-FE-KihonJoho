import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, table, variableNotes } from './definition';
import { autumn2015PmAnswers, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { autumn2012PmPageAssetId, autumn2012PmReference } from './legacy-2012-autumn-pm-materials';
import {
  autumn2012Pm0508Case, courseCases, railwayModel, stockModel, tapeState,
} from './legacy-2012-autumn-pm-05-08-model';
import {
  autumn2012Pm0508Figure, courseModules, courses, drawings, stationData, tapeMovements, type DrawingId,
} from './legacy-2012-autumn-pm-05-08-figures';
import {
  answerBanks, bankOrder, bankTitles, bookletPages, marks, officialKeys, pageRanges, slots, type Bank, type Major,
} from './legacy-2012-autumn-pm-05-08-source';

const commonPages = [3, 4] as const;
const companyColumns = ['商品A','商品B'];
const number = (n:number)=>n.toLocaleString('ja-JP');
const structuredBanks = new Set<Bank>(['8e','8f']);

function panel(id: string,index: number): Block {
  if (id==='5-courses') return courses(index);
  if (id==='5-modules') return courseModules;
  if (id==='6-movements') return tapeMovements(index);
  if (id==='8-station-data') return stationData(index);
  if (!Object.hasOwn(drawings,id)) throw Error('SOURCE_FORMAT');
  return autumn2012Pm0508Figure(id as DrawingId,index);
}

function answerData(major:Major,index:number,keys:readonly (number|string)[]) {
  const order:readonly Bank[] = bankOrder[major], bank = answerBanks(index);
  const bodies = order.map(id => bank[id].map((text): Block[] => [
    id==='7s3' ? table('翌日の出荷に備えた業務', companyColumns, [text.split('｜')])
      : structuredBanks.has(id) ? code(text) : p(text),
  ]));
  return autumn2015PmAnswers(bodies, slots[major].map(([label,bankIndex],i) => {
    const value = keys[i];
    const key = typeof value==='string' ? bank[order[bankIndex]].indexOf(value) : value;
    if (!bodies[bankIndex][key]) throw Error('PARAMETER_CONSTRAINT');
    return autumn2015PmSingle(label.startsWith('設問')?'s'+label.slice(2):label,label,bankIndex,key);
  }));
}

function prompt(major:Major,index:number):Block[] {
  const pages=bookletPages(index), [first,last]=pageRanges[major], result:Block[]=[];
  for (let page:number=first;page<=last;page++) for (const line of pages[page].split('\n')) {
    if (line.startsWith('#')) continue;
    if (line.startsWith('§')) result.push(panel(line.slice(1),index));
    else result.push(p(major===6 && line.startsWith('設問') ? line.replace('本文中の下線','本文中の') : line));
  }
  return result;
}

export function autumn2012Pm0508OriginalPageAlt(major:Major):Record<number,string> {
  const pages=bookletPages(0), banks=answerBanks(0), [first,last]=pageRanges[major];
  return Object.fromEntries(Array.from({length:last-first+1},(_,i)=>{
    const page=first+i;
    const alt=pages[page].split('\n').map(line=>{
      if (line.startsWith('#')) {
        const id=line.slice(1) as Bank;
        return [bankTitles[id], ...(id==='7s3'?[companyColumns.join('｜')]:[]),
          ...banks[id].map((text,j)=>marks[j]+'　'+text)].join('\n');
      }
      if (!line.startsWith('§')) return line;
      const block=panel(line.slice(1),0);
      if (block.type==='diagram') return block.caption+'\n'+block.alt;
      if (block.type==='table') return [block.caption,block.columns.join('｜'),...block.rows.map(row=>row.join('｜'))].join('\n');
      throw Error('SOURCE_FORMAT');
    }).join('\n\n');
    return [page,alt];
  }));
}

const meta = (major:Major) => ({
  source:'2012h24a-fe-pm-'+major, sourceAnswer:officialKeys[major].join('／'), reference:[0], version:'3.7.0' as const,
});

const q5:AfternoonBookletDefinition={
  ...meta(5), title:'通信講座の受講管理と修了判定',
  fields:[field('講座の月数・提出回数・点数・割引の条件',0,3)], answerVariation:'fixed',
  notes:variableNotes+' 印刷／PDF p.22–28。月初・前月終了・上級資格の除外、締切日と未提出初期値、受講月数を分母とする平均、全提出と優秀判定のAND、索引順編成と複合キー、判定済み読飛ばし、起算日と年をまたぐ月計算、0と99の境界を保持。初中級の月数、必要提出数、平均点、割引対象月数を同時に変更する。原図の分岐と処理仕様の比較方向・役割を保つと正答位置は固定。順序変更や条件反転は問いの同一性を損なうため採用しない。',
  publicNotes:'図の分岐と解答群を保ち，講座の期間，提出・成績の条件，割引期間を変更しました。',
  build(values){
    const index=autumn2012Pm0508Case(values), c=courseCases[index];
    return {
      prompt:prompt(5,index), ...answerData(5,index,[2,3,4,2,0,3,3]),
      explanation:[
        'a：毎月初めに前月終了分を処理し，判定済みの成績は読み飛ばすので，講座の終了年月日が現在日付より前かを調べる。上級向けは次の受講月数の判定で除外する。',
        'b：提出日が提出期限以前の答案だけを数えて点数を合計する。未提出の提出日は期限翌日で初期化されるので，同じ比較で除外できる。平均の分母は提出回数ではなく受講月数。',
        `c～e：初級${c.beginner}か月では${c.beginnerMinimum}回，中級${c.intermediate}か月では${c.intermediateMinimum}回以上の提出と平均${c.pass}点以上を満たす。さらに平均${c.honor}点以上かつ全て提出したときは優秀，それ以外は合格。`,
        `f，g：現在日の月を起算日の年にそろえるには年の差（現在年－起算年）×12を現在の月に加える。割引対象期間（優秀${c.honorMonths}か月，不合格${c.retryMonths}か月）に起算日の月を足した値から変数mを引くと残存期間になる。負なら図の指示どおり99を設定し，0は置換しない。`,
      ].join('\n'),
    };
  },
};
const q6:AfternoonBookletDefinition={
  ...meta(6), title:'磁気テープの棚卸と貸出管理',
  fields:[field('外部委託・消去・購入・貸出の本数',0,3)],
  notes:variableNotes+' 印刷／PDF p.29–32。前回台帳と今回実地確認の分離、使用済み保管箱への移動は消去完了まで廃棄計上しないこと、社内貸出は搬出に含めないこと、確認中1本を実地確認に含めないこと、複写許可部門と施錠保管を保持。移動本数、報告、同順の数値選択肢を同時に更新する。貸出管理と機密情報保護は原問の権限条件を保つ。',
  publicNotes:'棚卸・貸出・複写の条件を保ち，テープの移動と報告書の本数を変更しました。',
  build(values){
    const index=autumn2012Pm0508Case(values), s=tapeState(index);
    return {
      prompt:prompt(6,index), ...answerData(6,index,[...[s.discarded,s.unused,s.moveSecond,s.loanConfirmed,s.total].map(String),1,3]),
      explanation:[
        `a：消去したのは前回使用済み箱の8本と7月に移した${s.moveFirst}本の計${s.discarded}本。10月に移した${s.moveSecond}本はまだ消去していない。`,
        `b：未使用箱は12＋${s.purchase}－${s.use}＝${s.unused}本。c：消去後の使用済み箱に10月分${s.moveSecond}本が残る。`,
        `d：台帳上の貸出は4＋${s.loan}－${s.returned}＝${s.loanLedger}本。そのうち所在不明1本を除き，${s.loanConfirmed}本を実地確認できた。e：台帳上の棚卸本数は1060＋${s.purchase}－${s.discarded}－${s.shipped}＝${s.total}本。`,
        '設問2：管理主体である運用課が返却予定日を管理し，期限超過なら再申請などを求める。棚卸後まで期限を延ばすことや申請者への一任では管理できない。',
        '設問3：許可されたのは経理部と調査部の社員であり，ヘルプデスク担当者が機密情報を複写し媒体を保持したことが根本の問題である。依頼・報告の媒体や事後報告の有無では複写権限を補えない。',
      ].join('\n'),
    };
  },
};
const q7:AfternoonBookletDefinition={
  ...meta(7), title:'工場の在庫管理と翌日の出荷準備',
  fields:[field('商品Aの検品中在庫・破損数と翌日の出荷予定',0,3)],
  notes:variableNotes+' 印刷／PDF p.33–37。検品中・良品・不良品の流出入、返品の再検品、破損の不良振替、網掛けセル、予定数注記、手順①終了の時点、良品2倍かつ検品中と良品の合計3倍という基準、在庫削減と品質の関係を保持。出荷不足時の手順②と手順③の両立を原解答群は指定しないため、生成例は手順②の不足が生じない範囲に限る。原数値候補の桁と順序、3×3の手配の組合せを固定する。',
  publicNotes:'在庫の移動規則と出荷の判断基準を保ち，検品中在庫，破損数と翌日の出荷予定数を変更しました。',
  build(values){
    const index=autumn2012Pm0508Case(values), s=stockModel(index);
    const actuals=[s.initialInspection,s.damaged19,s.stock20A[2]].map(number);
    const plan=(product:'A'|'B',state:readonly number[],quantity:number,outcome:number)=>
      `商品${product}は良品${number(state[1])}，検品中との合計${number(state[0]+state[1])}。出荷予定${number(quantity)}に対し，基準は良品${number(2*quantity)}以上と合計${number(3*quantity)}以上。`+
      (outcome===0?'基準を満たさないので翌日の生産を手配する。':'両基準を満たすので手配は不要。');
    return {
      prompt:prompt(7,index), ...answerData(7,index,[...actuals,4,s.nextA*3+s.nextB,3,1]),
      explanation:[
        `a：19日の検品中在庫${number(s.stock19A[0])}から同日の生産1,800と返品50を引き，良品1,600と不良品100を足すと${actuals[0]}。`,
        `b：19日の良品は前日3,000＋良品判定1,600－出荷1,700－破損で${number(s.stock19A[1])}になるので，破損は${actuals[1]}。`,
        `c：20日の不良品は前日${number(s.stock19A[2])}に破損${number(s.damaged20)}を加えた${actuals[2]}。不良品判定も廃棄も0。`,
        '設問2：商品Bは20日の生産が0で返品が10，良品判定が140なので，検品中在庫は220から90へ減少した。破損は良品から不良品へ動き，検品中に入らない。',
        '設問3：'+plan('A',s.stock20A,s.plannedA,s.nextA)+plan('B',s.stock20B,s.plannedB,s.nextB),
        '設問4：余剰の良品・検品中在庫を持たなければ棚卸資産が減少し，運転資金に要する現金流出を抑えられる。検品を省略せず，生産手配の基準倍率を引き下げて余分な積み増しを減らす。',
      ].join('\n'),
    };
  },
};
const q8:AfternoonBookletDefinition={
  ...meta(8), title:'鉄道網の全駅間最短距離',
  fields:[field('駅間距離・基幹駅の区間距離・基幹駅数の例',0,3)],
  fixedReferenceAssetIds:commonPages.map(autumn2012PmPageAssetId),
  notes:variableNotes+' 印刷／PDF p.38–43、共通疑似言語p.3–4、問8は必須。N≧2・連結・隣接は一本・対称、距離999未満・添字1・対角0・未確定999、Printの時点、点線枠、制御線と字下げ、基幹駅の次数と区間名の一意性、同端点でも異なる区間を区別、表1の駅当たり5要素、等量は削減に数えないことを保持。路線と距離行列・駅情報表・同順の数値候補・独自解説を同期する。正の整数距離は原の桁数と同程度。段階ごとの最短距離、同区間の直接経路、最小のNを独立に検査する。',
  publicNotes:'路線・疑似言語・空欄を保ち，駅間距離と使用メモリの比較例を変更しました。',
  build(values){
    const index=autumn2012Pm0508Case(values), s=railwayModel(index);
    return {
      prompt:prompt(8,index), contexts:[autumn2012PmReference('共通の擬似言語',commonPages)],
      ...answerData(8,index,[String(s.a),String(s.b),3,2,3,2,String(s.threshold)]),
      explanation:[
        `a，b：Via＝2の段階では中間駅として1と2だけを使える。1→2→3は${s.edges[0]}＋${s.edges[1]}＝${s.a}，3→2→5は${s.edges[1]}＋${s.edges[4]}＝${s.b}。逆方向も同じ値となる。`,
        'c，d：Via，From，Toを各N回走査するので比較の回数はN³に比例する。保存する距離行列の要素はN²個。',
        'e：Fromより大きいToを全て調べて上三角の各組を1度ずつ比較し，更新時に対称な要素へも代入する。対角要素は0のままでよい。',
        'f：同じ両端駅を持つ別区間も存在するので，両端番号の一致では判定できない。Sec[i]＝Sec[j]のときだけ，区間内でToKLの差の絶対値を直接距離として比較に加える。',
        `g：削減条件はN²＞${s.trunkCount}²＋5N。N＝${s.threshold-1}では${(s.threshold-1)**2}と${s.trunkCount**2+5*(s.threshold-1)}で削減できず，N＝${s.threshold}では${s.threshold**2}＞${s.trunkCount**2+5*s.threshold}となる。N≧${s.trunkCount}かつN≧3では差はNが増えると大きくなる。`,
      ].join('\n'),
    };
  },
};

export const legacy2012AutumnPm05To08Definitions:readonly AfternoonBookletDefinition[]=[q5,q6,q7,q8];
