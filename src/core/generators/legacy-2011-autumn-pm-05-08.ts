import type { Block } from '../types';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p, table, variableNotes } from './definition';
import { autumn2015PmAnswers, autumn2015PmSingle } from './legacy-2015-autumn-pm-01-04-shared';
import { autumn2011PmPageAssetId, autumn2011PmReference } from './legacy-2011-autumn-pm-materials';
import { caseIndex, channels, dateLabel, marketModel, orderModel, parserModel, scheduleOptions, staffingModel } from './legacy-2011-autumn-pm-05-08-model';
import { drawingAlt, drawings, renderFigure, type DrawingId } from './legacy-2011-autumn-pm-05-08-figures';
import { answerBanks, bankTitles, bookletPages, marks, officialKeys, pageRanges, pairHeaders, scheduleOption, slots, trendRows, type Bank, type Major } from './legacy-2011-autumn-pm-05-08-source';

const referencePages = [3,4] as const;
const referenceTitle = '共通に使用される擬似言語の記述形式';
const slotsLabels = [...'abcdefgh'];
const isPair = (bank:Bank):bank is keyof typeof pairHeaders => Object.hasOwn(pairHeaders,bank);

function answerData(major:Major,index:number,keys:readonly (number|string)[]) {
  const order: Bank[] = [...new Set<Bank>(slots[major])], banks = answerBanks(index);
  const bodies = order.map(bank=>banks[bank].map((text):Block[]=>[
    isPair(bank)?table('空欄の組合せ',[...pairHeaders[bank]],[text.split('｜')]):
    ['8cd','8e','8fg'].includes(bank)?code(text):p(text),
  ]));
  return autumn2015PmAnswers(bodies, slots[major].map((bank,i)=>{
    const bankIndex=order.indexOf(bank), key=keys[i];
    const choice=typeof key==='string'?banks[bank].indexOf(key):key;
    if (!bodies[bankIndex][choice]) throw Error('PARAMETER_CONSTRAINT');
    return autumn2015PmSingle(slotsLabels[i],slotsLabels[i],bankIndex,choice);
  }));
}

function prompt(major:Major,index:number):Block[] {
  const pages=bookletPages(index), [first,last]=pageRanges[major];
  return Array.from({length:last-first+1},(_,i)=>pages[first+i]).join('\n')
    .replace('ている販\n売ルート','ている販売ルート').split('\n')
    .filter(line=>!line.startsWith('#')).map(line=>line.startsWith('§')?renderFigure(line.slice(1) as DrawingId,index):p(line));
}

export function autumn2011Pm0508OriginalPageAlt(major:Major):Record<number,string> {
  const pages=bookletPages(0), banks=answerBanks(0), [first,last]=pageRanges[major];
  return Object.fromEntries(Array.from({length:last-first+1},(_,i)=>{
    const page=first+i;
    const alt=pages[page].split('\n').map(line=>{
      if (line.startsWith('#')) {
        const bank=line.slice(1) as Bank;
        return [bankTitles[bank],...(isPair(bank)?[pairHeaders[bank].join('｜')]:[]), ...banks[bank].map((text,j)=>marks[j]+'　'+text)].join('\n');
      }
      if (!line.startsWith('§')) return line;
      const id=line.slice(1) as DrawingId;
      return drawings[id].caption+'\n'+drawingAlt(id,0);
    }).join('\n\n');
    return [page,alt];
  }));
}

const meta = (major:Major) => ({source:'2011h23a-fe-pm-'+major,sourceAnswer:officialKeys[major].join('／'),reference:[0],version:'3.7.0' as const});
const q5:AfternoonBookletDefinition={
  ...meta(5),title:'書籍の卸売業者の受注システム',
  fields:[field('受注伝票の価格・数量と商品の組合せ条件',0,3)],
  notes:variableNotes+' 印刷／PDF p.21–24。受注伝票の項目と複数明細の関連、単独商品とセット商品の汎化、セット内の部分と全体の記号と向きを維持。受注時の上限、セット商品を構成する単独商品の数の条件、冊数、単価と割引率を連動する。設計図の網掛けクラス名と多重度の省略、派生属性と公開操作を維持する。',
  publicNotes:'受注伝票とクラス図の構成を保ち，受注やセット商品の条件を変更しました。',
  build(values) {
    const i=caseIndex(values), o=orderModel(i);
    return {prompt:prompt(5,i),...answerData(5,i,[0,5,4,o.exact?'2':'2..*',3,0,1]),
      explanation:[
        'a～c：明細が参照するのは商品番号だけではなく，一つの商品オブジェクトである。図2の一部を構成する単独商品がb，それらをまとめるセット商品がc。商品aを上位クラスとしてbとcが特化する。',
        'd：集約の◇は全体であるc側に置く。b側の多重度は，c一つにつき必要な単独商品が'+(o.exact?'ちょうど2種類なので2。':'2種類以上なので2..*。')+
          '受注一つにつき最大'+o.maximum+'種類という上限は，受注明細側の別の関連に付く。',
        'e：受注オブジェクトの番号は'+o.number+'であり，日付と並んで受注に属する数値属性である。商品に付く商品番号や得意先の名称とは区別する。',
        'f，g：受注明細の小計は数量と商品の単価から算出する数値なので，派生を示す／を付ける。受注が各明細の小計を取得して合計できるよう，小計取得()を公開する。明細の数量や商品の単価だけでは小計そのものを取得できない。',
      ].join('\n')};
  },
};

const q6:AfternoonBookletDefinition={
  ...meta(6),title:'プロジェクトの要員計画',
  fields:[field('開発規模・工程別生産性・A社の固定要員数',0,3)],
  notes:variableNotes+' 印刷／PDF p.25–28。2期同規模・同生産性、外部/内部/開発/結合/総合の順、開始時期、固定要員の常時割当とプログラム開発へのA社不参加を保持。開発の配分3～5月と平均人数の端数切上げを守り、工数は人月の整数、生産性は原問と同じ小数第1位。3か月の平準化は同一工程に限定して整数人で成立させる。',
  publicNotes:'各工程の表と開発日程を保ち，開発規模，生産性及び固定要員数を変更しました。',
  build(values) {
    const i=caseIndex(values), s=staffingModel(i);
    const [c]=s.schedule(3,3).idle, [d]=s.schedule(4,4).idle;
    const e=scheduleOptions.findIndex(pair=>s.schedule(pair[0],pair[1]).idle.length===0);
    return {prompt:prompt(6,i),...answerData(6,i,[String(s.efforts[3]),String(s.external),dateLabel(c),dateLabel(d),e,dateLabel(s.at),String(s.peak),2]),
      explanation:[
        'a：結合テストの工数は'+s.size+'÷'+(s.rates[3]/10).toFixed(1)+'＝'+s.efforts[3]+'人月。b：外部設計は'+
          s.efforts[0]+'人月を3か月に配分すると切上げ後で各月'+Math.ceil(s.efforts[0]/3)+'人。そのうちA社が'+s.staff+'人なのでB社は'+s.external+'人。',
        'c，d，e：第二期は平成24年7月に始まる。3か月案では'+dateLabel(c)+'，4か月案では'+dateLabel(d)+
          'に，第一期の作業が既に終わり，第二期はプログラム開発中なのでA社を配置できない。'+
          scheduleOption(scheduleOptions[e])+'案では，第一期の最終月が第二期のプログラム開発の最終月をカバーし，両期の全期間でA社を配置できる。',
        'f，g：最終案で両期の工程別の要員数を月ごとに足す。'+dateLabel(s.at)+'は第一期の結合テスト'+
          Math.ceil(s.efforts[3]/2)+'人と第二期のプログラム開発'+Math.ceil(s.efforts[2]/4)+'人が重なり，'+s.peak+'人で最大になる。',
        'h：前月・ピーク月・翌月の要員数は'+s.nearby.join('，')+'人で，平均は'+s.target+
          '人。第一期の結合テストを'+(s.target-s.nearby[0])+'人分前倒しし，第二期のプログラム開発を'+(s.target-s.nearby[2])+
          '人分後ろ倒しする。それぞれ移動先でも同じ工程が継続する。',
      ].join('\n')};
  },
};

const q7:AfternoonBookletDefinition={
  ...meta(7),title:'販売ルート別の売上及び市場の分析',
  fields:[field('各販売ルートの指標と前年比バブルチャートの軸',0,3)],
  notes:variableNotes+' 印刷／PDF p.29–33。全6ルート×5指標の前年実績／当年見込，値の丸めと重量注記，図1～4の円の位置・面積と軸の区別，図中のa・d，表3の両軸にまたがるe・f，g1/g2とh1/h2の組合せを維持。生成版は販売量とルート別実績を変え，売上金額・市場規模・占有率が整合するように再計算し，前年比図の横軸と縦軸の組合せも変更する。',
  publicNotes:'バブルチャートと組合せ欄の構成を保ち，ルート別の指標と前年比分析図の軸を変更しました。',
  build(values) {
    const i=caseIndex(values), m=marketModel(i);
    const g=channels[m.g1]+'｜'+channels[m.g2];
    const h=trendRows.findIndex(row=>row.every(([a,b,sign],k)=>m.diff[k+4][a]*sign>0&&m.diff[k+4][b]*sign>0));
    return {prompt:prompt(7,i),...answerData(7,i,[channels[m.a],4,2,channels[m.d],...m.axes,g,h]),
      explanation:[
        'a，b，c：図1で最も売上単価が高い［a］は'+channels[m.a]+'で'+m.data[m.a][1][2]+'千円／t。図2で同じ［a］の市場占有率が'+m.data[m.a][1][4]+'％で最も低い。売上数量や市場規模の最小値は別のルートなので，bは市場占有率，cは売上単価となる。',
        'd：図1で売上数量が最大，図2で市場規模が最大の［d］は'+channels[m.d]+'。同じルートの売上単価は'+m.data[m.d][1][2]+'千円／tで最も低い。',
        'e，f：横軸と縦軸の値を（当年見込÷前年実績）×100－100で照合する。円の面積が最も大きい外食の座標と，'+channels[m.g1]+
          'の座標を同時に照合すると，図3は「'+answerBanks(i)['7ef'][m.axes[0]].replace('｜','／')+'」，図4は「'+
          answerBanks(i)['7ef'][m.axes[1]].replace('｜','／')+'」に対応する。',
        'g：'+channels[m.g1]+'は市場規模が約'+Math.round(m.diff[m.g1][3])+'％増え，市場占有率が約'+Math.abs(Math.round(m.diff[m.g1][4]))+
          '％減る。'+channels[m.g2]+'は売上数量が約'+Math.round(m.diff[m.g2][1])+'％増え，売上単価が下がる。',
        'h：外食の売上数量は減少し，市場規模も減少している。加工の売上単価は上昇し，市場占有率も増加している。この両方を満たす組合せを選ぶ。',
      ].join('\n')};
  },
};

const q8:AfternoonBookletDefinition={
  ...meta(8),title:'代入文の構文解析と優先順位に従う変換',
  fields:[field('代入文・構文エラー例・移動例',0,3)],
  fixedReferenceAssetIds:referencePages.map(autumn2011PmPageAssetId),
  notes:variableNotes+' 印刷／PDF p.34–38，共通疑似言語p.3–4。必須問題。配列の開始・終端記号，文字のコード，構文エラーの表，変数・定数の入力域，演算優先順位と左結合を保持。図1で抜出しと置換の範囲，配列の移動例のfrom，3副プログラムの制御線とαを保持する。入力例と誤りの位置を変え，コード・配列・出力例を対応付ける。比較演算子とコピー方向の規約は本文とプログラムの機能を維持するため固定。',
  publicNotes:'疑似言語と配列表示の構造を保ち，代入文，構文誤りの例及び移動対象を変更しました。',
  build(values) {
    const i=caseIndex(values), m=parserModel(i), a=m.errors.indexOf(51), b=m.errors.indexOf(64);
    return {prompt:prompt(8,i),contexts:[autumn2011PmReference(referenceTitle,referencePages)],
      ...answerData(8,i,[a,b,0,1,3,2,1]),
      explanation:[
        'a：'+m.invalid[a]+'では，右辺の定数を読んでいる間に英字が現れるのでerrは51。b：'+m.invalid[b]+
          'では，算術演算子の直後に次の算術演算子が現れるのでerrは64。他の例では演算状態で終端を読んで65，または左辺で算術演算子を読んで24になる。',
        'c：左から調べるときは，同順位の後続演算子で位置を更新しない。初期priorityは10なので，V[i]が現在値を上回るときだけ更新する。',
        'd：右から調べるときは，同順位なら左側の演算子を採用する。初期priorityは11なので，V[i]が現在値以上のときに更新すれば加減算も選べる。',
        'e：左辺，等号，右辺の最初の1文字は算術演算子にならない。等号の位置＋2から調べれば，一文字の項の直後に演算子がある場合も見落とさない。',
        'f，g：後ろへずらすときはtoからfromまで降順，前に詰めるときはfromからtoまで昇順にコピーする。未移動の値を上書きせず，両端を含むので終端マークも移る。例は'+m.moveBefore+'→'+m.moved+'となる。',
      ].join('\n')};
  },
};

export const legacy2011AutumnPm05To08Definitions:readonly AfternoonBookletDefinition[]=[q5,q6,q7,q8];
