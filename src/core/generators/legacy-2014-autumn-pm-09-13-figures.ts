import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import {
  autumn2014Pm9Model, autumn2014Pm10Model, autumn2014Pm12Model, autumn2014Pm13Model,
  autumn2014Pm0913CaseCount, station, tenthKm,
} from './legacy-2014-autumn-pm-09-13-models';
import { autumn2014Pm10Changes } from './legacy-2014-autumn-pm-10-source';

type Cell = { text: string; colSpan?: number; code?: boolean; shaded?: boolean };
type Table = { label?: string; headers?: Cell[]; rows: Cell[][]; rowHead?: boolean; chart?: boolean };
export type Autumn2014PmLanguagePanel = { tables: Table[]; notes?: string[]; adjacent?: boolean };
const cell = (value: string | number): Cell => ({ text:String(value) });
const cells = (values: (string | number)[]) => values.map(cell);
const table = (headers: (string|number)[], rows: (string|number)[][]): Table =>
  ({ headers:cells(headers), rows:rows.map(cells), rowHead:true });
const profiles = {
  9: ['attribute','input','differences','usage'],
  10: ['monthly-chart','z-chart','changes'],
  12: ['sort-array','count-array','digits','bcd'],
  13: ['trip','route','bands','units','fare'],
} as const;

export function autumn2014Pm10ChangeCode(index: number) {
  const last = autumn2014Pm10Changes[2];
  if (!autumn2014Pm10Model(index).cumulativePriority) return last;
  return last.replace('COMPUTE IX-LINE = (Z-TOTAL + 499999) / 500000\n    MOVE ALL "@" TO [c]',
    'COMPUTE IX-LINE = (Z-YEAR + 499999) / 500000\n    MOVE ALL "#" TO [c]')
    .replace('[f]\n    COMPUTE IX-LINE = (Z-YEAR + 499999) / 500000\n    MOVE ALL "#" TO [c]',
      '[f]\n    COMPUTE IX-LINE = (Z-TOTAL + 499999) / 500000\n    MOVE ALL "@" TO [c]');
}

function cPanel(name: string,index: number): Autumn2014PmLanguagePanel {
  const { newInput,oldInput,differences,usage } = autumn2014Pm9Model(index);
  if(name === 'attribute') return { tables:[{ rows:[cells(['0','1','0','0','s','o','g','r'])] }] };
  if(name === 'input') {
    const file = (label:string, records:typeof newInput):Table => ({
      label, headers:cells(['利用者ID','利用者名','属性','最終使用日']), rowHead:true,
      rows:records.map(({id,name,attribute,date})=>[cell(id),cell(name),{
        text:attribute.toString(16).toUpperCase().padStart(2,'0'),shaded:true,
      },cell(date)]),
    });
    return { tables:[file('ファイルNewFileのデータ例',newInput),file('ファイルOldFileのデータ例',oldInput)],adjacent:true,
      notes:['注記1　属性の値（網掛け部分）は，16進数で表示している。','注記2　見出し行は，各ファイルには含まれないものとする。'] };
  }
  const isDifference = name === 'differences';
  return { tables:[table(['利用者ID','利用者名',isDifference?'登録内容の差異':'使用状況'],isDifference?differences:usage)],
    notes:['注記　見出し行は，事前に印字されているものとする。'] };
}

function cobolPanel(name: string,index: number): Autumn2014PmLanguagePanel {
  const { months,monthlyRows,zRows } = autumn2014Pm10Model(index);
  if(name === 'changes') return { tables:[{
    headers:cells(['処置','変更内容']), rowHead:true,
    rows:[
      [cell('行番号21と22の間に追加'),{ text:autumn2014Pm10Changes[0],code:true }],
      [cell('行番号24から29を変更'),{ text:autumn2014Pm10Changes[1],code:true }],
      [cell('行番号59から65を変更'),{ text:autumn2014Pm10ChangeCode(index),code:true }],
    ],
  }] };
  const monthly = name === 'monthly-chart';
  const rows = monthly ? Array.from({length:10},(_,i)=>monthlyRows.map(row=>row===10-i?'**':'')) : zRows;
  const rowStep = monthly ? 10 : 50;
  return { tables:[{ chart:true,rowHead:true,headers:cells(['',...(monthly?[...months,...months]:months)]),
    rows:rows.map((row,i)=>cells([(rows.length-i)*rowStep,...row])) }] };
}

function asmPanel(name: string,index: number): Autumn2014PmLanguagePanel {
  const { first,firstSorted,counted,digits,output,bcd } = autumn2014Pm12Model(index);
  if(name === 'sort-array') return { tables:[table(['','実行前','実行後'],first.map((item,i)=>[i===0?'(GR1)+0':'+'+i,item,firstSorted[i]]))] };
  if(name === 'count-array') return { tables:[{rowHead:true,rows:counted.map((item,i)=>cells([i===0?'(GR1)+0':'+'+i,item]))}] };
  if(name === 'digits') return { tables:[table(['入力数字列','出力数字列'],
    digits.map((item,i)=>["'"+item+"'","'"+output[i]+"'"]))] };
  return { tables:[{rows:[cells(bcd)]}] };
}

function farePanel(name: string,index: number): Autumn2014PmLanguagePanel {
  const { from,to,base,line,sections,distance,fare } = autumn2014Pm13Model(index);
  const row = (i:number) => [i+1,station(i),tenthKm(line[i-1]), i>=Math.min(from,to)&&i<Math.max(from,to)?'○':''];
  const [band1,band2,band3] = sections;
  if(name === 'trip') return { tables:[table(['','A','B'],[
    [1,'乗車駅（駅コード）',station(from)],[2,'降車駅（駅コード）',station(to)],
    [3,'乗車距離（km）',tenthKm(distance)],[4,'運賃（円）',fare],
  ])] };
  if(name === 'route') return { tables:[table(['','A','B','C'],[
    [1,'駅コード','隣接駅間距離（km）',''],...[1,2,3,4].map(row),['⋮','⋮','⋮','⋮'],...[30,31,32].map(row),
  ])] };
  if(name === 'bands') return { tables:[table(['区分番号','距離の範囲'],[
    [1,band1.limit+'km以下の範囲'],[2,band1.limit+'kmを超え'+band2.limit+'km以下の範囲'],
    [3,band2.limit+'kmを超え'+band3.limit+'km以下の範囲'],[4,band3.limit+'kmを超える範囲'],
  ])] };
  if(name === 'units') return { tables:[table(['区分番号','単位距離（km）','単位運賃（円）'],
    sections.map((band,i)=>[i+1,band.unit,band.unitPrice]))] };
  return { tables:[{
    headers:cells(['','A','B','C','D','E','F']), rowHead:true,
    rows:[
      cells([1,'','','基本運賃（円）',base,'','']),
      cells([2,'','','','','','']),
      [cell(3),{text:'区分ごとの運賃体系表',colSpan:6}],
      cells([4,'区分番号','上限距離（km）','単位距離（km）','単位運賃（円）','区分距離（km）','区分運賃（円）']),
      ...sections.map((band,i)=>cells([i+5,i+1,band.limit,band.unit,band.unitPrice,tenthKm(band.distance),band.cost])),
    ],
  }] };
}

function describe(panel: Autumn2014PmLanguagePanel) {
  const describeCells = (row: Cell[])=>row.map(({text})=>text).join('｜');
  return [...panel.tables.map(item=>{
    if(item.chart) {
      return item.headers!.slice(1).map((month,column)=>{
        const marks = item.rows.flatMap(([height,...points])=>points[column].text ? [points[column].text+' '+height.text+'万円'] : []);
        return month.text+'月：'+marks.join('，');
      }).join('\n');
    }
    return [item.label,item.headers&&describeCells(item.headers),...item.rows.map(describeCells)].filter(Boolean).join('\n');
  }),...(panel.notes??[])].join('\n');
}

type Figure = BookletFigureDefinition & { panel(values: number[]): Autumn2014PmLanguagePanel };
const loaders: Record<number,(profile:string,index:number)=>Autumn2014PmLanguagePanel> = {
  9:cPanel,10:cobolPanel,12:asmPanel,13:farePanel,
};
export const legacy2014AutumnPm0913Figures: Figure[] = Object.entries(profiles).flatMap(([question,names])=>names.map(name=>{
  const panel = (values:number[]) => loaders[Number(question)](name,selectCase(values,autumn2014Pm0913CaseCount));
  return {
    profile:'legacy-2014-autumn-pm-'+question+'-'+name,domain:[[0,autumn2014Pm0913CaseCount-1]],
    validate:(values:number[])=>{ panel(values); }, alt:(values:number[])=>describe(panel(values)), panel,
  };
}));
