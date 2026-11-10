import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import {
  axisPairs, bookNames, bookNumbers, caseIndex, channels, characterCode, endMark, formatted, marketModel, orderModel,
  parserModel, stages, staffingModel, startMark, transitionText,
} from './legacy-2011-autumn-pm-05-08-model';

const lines = (rows:readonly (readonly string[])[]) => rows.map(row=>row.join('｜')).join('\n');
export const profile = (id:string) => 'legacy-2011-autumn-pm-'+id;
export const shaded = '網掛け';
export const orderColumns = ['No','商品番号','商品名','単価','数量','小計'];
export const orderRows = (i:number) => {
  const o=orderModel(i);
  return [
    ...o.quantities.map((qty,k)=>[String(k+1),bookNumbers[k],bookNames[k],formatted(o.prices[k]),String(qty),formatted(o.subtotals[k])]),
    ['4','','','','',''],Array.from({length:6},()=> '⋮'),[String(o.maximum),'','','','',''],
  ];
};
export const objectNodes = (i:number) => {
  const o=orderModel(i);
  const detail = (k:number) => ['受注明細','No＝'+(k+1),'数量＝'+o.quantities[k]];
  const goods = (k:number) => [k===2?'セット商品':'単独商品','番号＝'+bookNumbers[k],'名称＝“'+bookNames[k]+'”','単価＝'+formatted(o.prices[k])];
  return [
    ['受注','番号＝'+o.number,'年月日＝“'+o.date+'”'],['得意先','名称＝“'+o.customer+'”'],
    detail(0),goods(0),detail(1),goods(1),detail(2),goods(2),goods(1),goods(3),
  ];
};
export const objectLinks = [[0,1],[0,2],[0,4],[0,6],[2,3],[4,5],[6,7],[7,8],[7,9]] as const;
export const analysisLegend = [
  '長方形はクラスを表す。長方形の上段はクラス名，中段は属性名，下段は操作名を記述する。ただし，属性名及び操作名は省略できる。クラス間を結ぶ線はクラス間の関連を表す。関連を表す線の終端近くには，クラス間の多重度の範囲をx..yで表す。',
  '関連を表す線の終端の“◇”の記号は部分と全体を表し，左図ではクラスAはクラスCの部分であることを示している。“▷”は汎化関係を表し，左図では上位の一般的な要素クラスAと下位のより特定的な要素クラスBとの間の分類関係を示している。',
];
export const designLegend = [
  '注記1　網掛け部分は表示しない。','注記2　多重度は省略する。',
  '属性名の前にある“／”は，派生要素であることを示している。すなわち，この属性の値は他の属性から計算できる。',
  '属性と操作の前にある“＋”は，全てのクラスから参照可能であることを示し，“－”は自分自身のクラスからだけ参照可能であることを示している。',
];
export const effortRows = (i:number) => {
  const s=staffingModel(i);
  return [
    ['生産性（kステップ／人月）',...s.rates.map(rate=>(rate/10).toFixed(1))],
    ['工数（人月）',...s.efforts.map((n,k)=>k===3?'［a］':String(n))],
    ['配分月数（月）','3','3',shaded,'2','3'],
  ];
};
export const scheduleTable = (i:number) => {
  const s=staffingModel(i);
  const a = s.chosen.calendar.map(([first,second])=>{
    const inSecond = second && second.phase!==2;
    return [first ? first.phase!==2&&!inSecond?s.staff:0 : undefined, second ? inSecond?s.staff:0 : undefined];
  });
  const period = (n:number) => [n?6:0,...[3,3,n?4:5,2,3],n?0:5];
  const people = (type:'a'|'b',n:number) => a.map((counts,m) => {
    if (counts[n]===undefined) return '';
    if (type==='a') return String(counts[n]);
    return !n&&m>=3&&m<=5 ? String(Math.ceil(s.efforts[1]/3)-s.staff) : shaded;
  });
  return {period,people,months:Array.from({length:21},(_,m)=>String(m%12+1))};
};
export const formulaData = {
  '6-work-formula':['各工程の工数（人月）','開発規模（kステップ）','各工程の生産性（kステップ／人月）'],
  '6-head-formula':['各月の平均要員数（人）','各工程の工数（人月）','各工程の配分月数（月）'],
} as const;
export const marketColumns = ['指標','',...channels];
export const marketUnits = ['百万円','t','千円／t','百万円','％'];
export function marketTable(i:number) {
  const m = marketModel(i);
  const labels=['売上金額','売上数量','売上単価','市場規模','市場占有率'];
  return labels.flatMap((label,k)=>[0,1].map(p=>[p?'':label+'（'+marketUnits[k]+'）',p?'当年見込':'前年実績',...m.data.map(row=>formatted(row[p][k]))]));
}
export const axesColumns = ['図','横軸の指標','縦軸の指標','バブルの大きさ'];
export const axisNames = [['売上数量（t）','売上単価（千円／t）'],['市場規模（百万円）','市場占有率（％）'],
  ['横軸の指標','縦軸の指標'],['横軸の指標','縦軸の指標']] as const;
export const chartNames = ['当年売上分析','当年市場分析','前年比分析1','前年比分析2'] as const;
export const currentAxes = [['図1　当年売上分析','売上数量 当年見込（t）','売上単価 当年見込（千円／t）','当年構成比（％）'],
  ['図2　当年市場分析','市場規模 当年見込（百万円）','市場占有率 当年見込（％）','']] as const;
export const priorAxes = [['図3　前年比分析1','［e］','前年構成比（％）'],['図4　前年比分析2','［f］','']] as const;
export function bubblePoints(i:number, chart:number) {
  const m=marketModel(i);
  const [horizontal,vertical] = chart===0 ? [1,2] : chart===1 ? [3,4] : axisPairs[m.axes[chart-2]];
  return m.data.map(([,after],row) => {
    const numbers = chart<2?after:m.diff[row];
    return {x:numbers[horizontal],y:numbers[vertical],share:m.share(row,chart<2?1:0),
      label:chart>=2?channels[row]:row===m.a?'［a］':row===m.d?'［d］':''};
  });
}
export const characterColumns = ['S[i]の内容',startMark,endMark,'英字','数字','=','+, -','*, /'];
export const characterRows = [['V[i]に格納する内容','0','1','2','3','10','11','12']];
export const stateColumns = ['st／S[i]','英字','数字','=','+, -, *, /',endMark];
export const stateRows = ['開始','左辺','代入','変数','定数','演算'].map((state,i)=>['“'+state+'”',...transitionText[i]]);
export const parserArray = (s:string) => [...startMark+s+endMark];
export const parserArrayRows = (i:number) => {
  const cells=parserArray(parserModel(i).statement);
  return [cells,cells.map(c=>String(characterCode(c)))];
};
export const codeBodies = {
  forward:['○整数型関数：プログラム1','○整数型：i, next, priority','・i ← 1     ← α','・next ← 0','・priority ← 10',
    '■ V[i] ≠ 1','│ ▲ ［c］','│ │ ・next ← i','│ │ ・priority ← V[i]','│ ▼','│ ・i ← i ＋ 1','■','・return next'],
  backward:['○整数型関数：プログラム2','○整数型：i, next, priority','・i ← Getpos(S[], "»") － 1','・next ← 0','・priority ← 11',
    '■ V[i] ≠ 0','│ ▲ ［d］','│ │ ・next ← i','│ │ ・priority ← V[i]','│ ▼','│ ・i ← i － 1','■','・return next'],
  move:['○プログラム3(整数型：from, 整数型：move)','○整数型：i, to','・to ← Getpos(S[], "»")','▲ move ＞ 0',
    '│ ■ i: ［f］','│ │ ・S[i＋move] ← S[i]','│ │ ・V[i＋move] ← V[i]','│ ■','▼','▲ move ＜ 0',
    '│ ■ i: ［g］','│ │ ・S[i＋move] ← S[i]','│ │ ・V[i＋move] ← V[i]','│ ■','▼'],
} as const;

const chartAlt = (i:number,start:number) => [start,start+1].map(chart=>{
  const points=bubblePoints(i,chart);
  return '図'+(chart+1)+'　'+chartNames[chart]+'。横軸 '+axisNames[chart][0]+'，縦軸 '+axisNames[chart][1]+'。\n'+
    points.slice().sort((a,b)=>a.x-b.x).map(({x,y,share,label})=>(label?label+'：':'')+x.toFixed(chart<2?0:1)+'，'+
      y.toFixed(chart<2?0:1)+'。バブルの大きさ '+share.toFixed(1)+'％。').join('\n');
}).join('\n\n');

export const drawings = {
  '5-slip':{caption:'図1　受注伝票の例', alt:(i:number)=>{
    const o=orderModel(i);
    return '受注伝票\n受注番号 '+o.number+'，得意先 '+o.customer+'，受注日 '+o.date+'。\n'+
      lines([orderColumns,...orderRows(i)])+'\n合計 '+formatted(o.total);
  }},
  '5-objects':{caption:'図2　オブジェクト図', alt:(i:number)=>
    objectNodes(i).map((n,k)=>(k+1)+'：'+n.join('，')).join('\n')+'\n関連：'+objectLinks.map(([a,b])=>(a+1)+'—'+(b+1)).join('，')},
  '5-analysis':{caption:'図3　分析のためのクラス図', alt:(i:number)=>
    '受注（1..*）—（1）得意先。受注（1，◇）—（1..'+orderModel(i).maximum+'）受注明細（属性：数量）。'+
    '受注明細（0..*）—（1）［a］。［b］と［c］から［a］への汎化。［b］（［d］）—（0..*，◇）［c］。\n'+
    '凡例の図：クラスA（1..*）—（1，◇）クラスC。クラスBからクラスAへの汎化。各クラスの中段に「属性」，下段に「操作」。\n'+analysisLegend.join('\n')},
  '5-design':{caption:'図4　設計のためのクラス図', alt:()=>
    '受注：－［e］，－年月日：文字列，－／合計：数値，＋合計取得()：数値。得意先：－名称：文字列，＋名称取得()：文字列。'+
    '受注明細：－No：数値，－数量：数値，－［f］，＋［g］。受注→得意先，受注（◇）→受注明細。'+
    '受注明細→網掛けの上位クラス。網掛けの下位2クラスから上位クラスへの汎化。下位右（◇）→下位左。\n'+
    designLegend.join('\n')+'\n凡例の図：クラスA，－属性，－／属性，＋操作。'},
  '6-work-formula':{caption:'各工程の工数の式',alt:()=>formulaData['6-work-formula'].join('｜')},
  '6-head-formula':{caption:'各月の平均要員数の式',alt:()=>formulaData['6-head-formula'].join('｜')},
  '6-efforts':{caption:'表1　第一期における各工程の生産性，工数及び配分月数', alt:(i:number)=>lines([['工程',...stages],...effortRows(i)])},
  '6-schedule':{caption:'表2　プログラム開発工程の第一期を5に第二期を4にする開発スケジュール案', alt:(i:number)=>{
    const t=scheduleTable(i);
    return lines([['年','平成24年（12か月）','平成25年（9か月）'],['月',...t.months],
      ['工程 第一期',...t.period(0).map((n,k)=>n?(stages[k-1]??'空欄')+'（'+n+'か月）':'')],
      ['工程 第二期',...t.period(1).map((n,k)=>n?(stages[k-1]??'空欄')+'（'+n+'か月）':'')],
      ['A社の要員数 第一期',...t.people('a',0)],['A社の要員数 第二期',...t.people('a',1)],
      ['B社の要員数 第一期',...t.people('b',0)],['B社の要員数 第二期',...t.people('b',1)]]);
  }},
  '7-data':{caption:'表1　販売ルート別の指標', alt:(i:number)=>lines([marketColumns,...marketTable(i)])},
  '7-current-axes':{caption:'表2　図1及び図2のバブルチャートの説明',alt:()=>lines([axesColumns,...currentAxes])},
  '7-current':{caption:'図1・図2　当年売上分析と当年市場分析',alt:(i:number)=>chartAlt(i,0)},
  '7-prior-axes':{caption:'表3　図3及び図4のバブルチャートの説明',alt:()=>lines([axesColumns,...priorAxes])},
  '7-prior':{caption:'図3・図4　前年比分析1と前年比分析2',alt:(i:number)=>chartAlt(i,2)},
  '8-example':{caption:'代入文と出力結果の例',alt:(i:number)=>'（代入文の例）\n'+parserModel(i).statement+'\n（出力結果の例）\n'+parserModel(i).output.join('\n')},
  '8-arrays':{caption:'配列Sと配列Vの内容の例',alt:(i:number)=>lines(parserArrayRows(i).map((row,k)=>[k?'配列Vの内容':'配列Sの内容',...row]))},
  '8-codes':{caption:'表1　文字とコードの対応',alt:()=>lines([characterColumns,...characterRows])},
  '8-states':{caption:'表2　状態遷移表',alt:()=>lines([stateColumns,...stateRows])},
  '8-invalid':{caption:'文法上の誤りがある代入文①～④',alt:(i:number)=>parserModel(i).invalid.map((s,k)=>'代入文'+'①②③④'[k]+'　'+s).join('\n')},
  '8-next':{caption:'nextの値の例',alt:(i:number)=>'配列S　'+parserArray(parserModel(i).statement).join('｜')+'\n要素番号'+parserModel(i).first+'を指す「↑ next ← '+parserModel(i).first+'」'},
  '8-replace':{caption:'図1　文字列の置換の例',alt:(i:number)=>{
    const m=parserModel(i);
    return '配列S　'+parserArray(m.statement).join('｜')+'\n出力　'+[...m.output[0]].join('｜')+
      '\n配列S　'+parserArray(m.firstReplaced).join('｜')+'\n① 前後の項と演算子の抜出し。② 抜き出した範囲をwk#1で置換。';
  }},
  '8-search':{caption:'副プログラム1及び副プログラム2',alt:()=>
    '〔副プログラム1〕\n'+codeBodies.forward.join('\n')+'\n\n〔副プログラム2〕\n'+codeBodies.backward.join('\n')},
  '8-shift':{caption:'配列Sの移動の例',alt:(i:number)=>{
    const m=parserModel(i);
    return '配列S（移動前）　'+parserArray(m.moveBefore).join('｜')+'\n「↑ from」は要素番号'+m.moveFrom+
      'を指す。\n配列S（移動後）　'+parserArray(m.moved).join('｜')+'\nfrom以降，終端マークまでを左に3桁詰める。';
  }},
  '8-move':{caption:'〔副プログラム3〕',alt:()=>codeBodies.move.join('\n')},
} as const;

export type DrawingId = keyof typeof drawings;
export const drawingIds = Object.keys(drawings) as DrawingId[];
export const legacy2011AutumnPm0508Figures:readonly BookletFigureDefinition[] = drawingIds.map(id=>({
  profile:profile(id),domain:[[0,3]],validate:values=>{caseIndex(values);},
  alt:values=>(drawings[id].alt as (i:number)=>string)(caseIndex(values)),
}));
export const drawingAlt = (id:DrawingId,i:number) => (drawings[id].alt as (i:number)=>string)(i);
export const renderFigure = (id:DrawingId,i:number) => figure(profile(id),[i],drawings[id].caption,drawingAlt(id,i));
