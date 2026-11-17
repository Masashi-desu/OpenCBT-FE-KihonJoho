import { p, strings, table } from './definition';
import { answers, bank, define, format, single } from './legacy-2006-autumn-pm-01-05-shared';

const cases = [
  { disks:1200, failures:24, target:100, planned:200, exchange:100000, work:10000, prices:[50000,52500,54000,56000], ratios:[1,1.2,1.6,2], numeric:[0,1,2,5,6,12,24,50] },
  { disks:1600, failures:40, target:200, planned:200, exchange:100000, work:10000, prices:[50000,53000,57500,65000], ratios:[1,1.25,2,2.5], numeric:[0,1,4,8,16,32,40,50] },
  { disks:900, failures:18, target:150, planned:100, exchange:80000, work:10000, prices:[65000,67500,72000,77000], ratios:[1,1.5,2,3], numeric:[0,1,3,6,9,18,50,100] },
  { disks:2000, failures:50, target:100, planned:250, exchange:100000, work:10000, prices:[40000,43000,47000,49500], ratios:[1,1.25,2,2.5], numeric:[0,1,4,10,20,25,40,50] },
] as const;
const names = ['A','B','C','D'];

export function autumn2006Pm1Pages(index:number, print=true) {
  const data=cases[index], example=data.failures/data.ratios[1];
  const pages=[
    [p('ハードディスク装置に関する次の記述を読んで，設問に答えよ。'),
     p('X社は，同型のハードディスク装置'+format(data.disks)+'台で構成されるデータセンタを運営している。このうち，1年当たり平均'+data.failures+'台の装置が故障し，置き換えられる（以下，交換という）。故障によるハードディスク装置の交換には，1台当たり'+data.exchange/10000+'万円の交換費用がかかるが，装置購入費（装置価格）はかからない。'),
     p('また，データセンタを構成するハードディスク装置は，耐用年数に達する前に，毎年'+data.planned+'台ずつ計画的に置き換えられる（以下，入替えという）。この入替台数は，故障の発生数とは無関係である。入替費用は，次式で計算される。作業費は'+data.work/10000+'万円である。'),
     p('入替費用＝（装置価格＋作業費）×入替台数'),
     p('X社は，来年ハードディスク装置の総入替えを行うことになり，新たに利用するハードディスク装置を，表に示す機種の中から選定する。各機種は，MTTF（Mean Time To Failure: 故障までの平均時間）と装置価格が異なる。表中の y は現在使用しているハードディスク装置の MTTF と同じ値である。MTTF は，次式で計算される。'),
     p('MTTF＝延べ稼働時間÷故障台数'),
     table('表　選定候補機種リスト',['機種','装置価格（円）','MTTF（年）'],names.map((name,i)=>[name,format(data.prices[i]),(i?data.ratios[i]+' ':'')+'y'])),
     p('MTTF が y のときの1年当たりの平均故障台数が'+data.failures+'台であることから，データセンタで利用するハードディスク装置を，MTTF が'+data.ratios[1]+' yである機種Bに総入替えすると，1年当たりの平均故障台数は'+data.failures+'÷'+data.ratios[1]+'＝'+example+'（台）になると見込まれる。')],
    [p('設問　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
     p('X社のデータセンタが現在利用しているハードディスク装置の MTTF は，［a］年である。また，ハードディスク装置を，MTTF が'+data.target+'年の機種に総入替えすると，1年当たりの平均故障台数は［b］台になると見込まれる。'),
     p('データセンタで利用するハードディスク装置を，表中のいずれかの機種に総入替えした後の，ハードディスク装置の年間の入替え及び故障による交換にかかる総費用が最も安くなると見込まれる機種は［c］であり，最も高くなる機種は［d］である。総費用は，機種の違いによって，次式で計算される額だけ差が出る。'),
     p('機種の違いによる総費用の差額＝（装置価格の差×入替台数）＋（交換費用×故障台数の差）'),
     p('＝（装置価格の差×'+format(data.planned)+'）＋（'+format(data.exchange)+'×故障台数の差）')],
  ];
  if(print)pages[1].push(...bank('a，bに関する解答群',data.numeric),...bank('c，dに関する解答群',names));
  return pages;
}
export const autumn2006Pm1 = define(1,'ハードディスク装置の故障率と維持費', 'a=ク／b=カ／c=ウ／d=イ',
  '稼働台数、故障台数、MTTF、交換単価と装置別の年間費用',
  'MTTFから平均故障台数を見積もり，年間の交換費用と計画入替費用の合計を比較する。',
  '故障交換では購入費なし、計画入替は故障数と独立、共通作業費を含む。既設値と装置別比率、最小／最大の両方を変える。発問に用いる順序を保持し、整数機の候補間で費用の極値を分離。',
  index=>{
    const data=cases[index];
    const years=data.disks/data.failures, expected=data.disks/data.target;
    const costs=data.prices.map((price,i)=>(price+data.work)*data.planned+data.exchange*(data.failures/data.ratios[i]));
    const min=costs.indexOf(Math.min(...costs)), max=costs.indexOf(Math.max(...costs));
    const numbers:readonly number[]=data.numeric;
    return { prompt:autumn2006Pm1Pages(index,false).flat(),...answers([strings(numbers.map(String)),strings(names)],[
      single('a','a',0,numbers.indexOf(years)),single('b','b',0,numbers.indexOf(expected)),single('c','c',1,min),single('d','d',1,max),
    ]),explanation:'全装置の1年分の延べ稼働は'+format(data.disks)+'台年であり、'+data.failures+'台の故障で割ると MTTF は'+years+'年になる。総入替え後は同じ延べ稼働時間を'+data.target+'年で割り、年'+expected+'台の故障と見込む。年間費には各価格と作業費を合計して'+data.planned+'台分を見込み、故障台数×'+format(data.exchange)+'円を加える。Aから順に'+costs.map(format).join('円、')+'円なので、最安は'+names[min]+'、最高は'+names[max]+'である。'};
  });
