import {DataError} from '../errors';
export const legacy2017AutumnPm6Pages=[28,29,30,31,32] as const;
export const legacy2017AutumnPm6Names=['人件費','サーバ費','PC費','ネットワーク費','その他経費'] as const;
const original=[
 [3000,3500,2800,3000,4000,4400], [1200,1250,1250,1400,1400,1250],
 [500,500,500,500,640,640], [200,220,250,240,250,250], [1000,1200,1000,1100,1000,1000],
];
export function legacy2017AutumnPm6Variant(values:number[]) {
 if(!Array.isArray(values)||Object.getOwnPropertyNames(values).sort().join(',')!=='0,length'||Object.getOwnPropertySymbols(values).length)throw new DataError('GENERATION_PARAMETERS','秋午後問6の条件は整数1個です');
 const d=Object.getOwnPropertyDescriptor(values,'0');if(!d||!Object.hasOwn(d,'value')||!Number.isSafeInteger(d.value)||d.value<0||d.value>3)throw new DataError('GENERATION_PARAMETERS','秋午後問6の条件は0〜3です');return d.value as number;
}
export function legacy2017AutumnPm6Model(values:number[]) {
 const v=legacy2017AutumnPm6Variant(values),numerator=[5,3,4,6][v],scale=(n:number)=>n*numerator/5;
 const costs=original.map(row=>row.map(scale)),totals=Array.from({length:6},(_,c)=>costs.reduce((s,r)=>s+r[c],0));
 const budget=[costs[0][3],(costs[1][1]+costs[1][3]+costs[1][5])/3,costs[2][5],costs[3][5]*2-costs[3][3],(costs[4][1]+costs[4][3]+costs[4][5])/3];
 const total=budget.reduce((s,n)=>s+n,0),price=total*10/9,request=price*9/10;
 const first=[budget[0]*95/100,budget[1],budget[2],budget[3],budget[4]*90/100],automated=[budget[0]*85/100,budget[1]*105/100,budget[2],budget[3],budget[4]*90/100];
 const firstTotal=first.reduce((s,n)=>s+n,0),automatedTotal=automated.reduce((s,n)=>s+n,0);
 return {v,numerator,scale,costs,totals,budget,total,price,request,first,firstTotal,automated,automatedTotal,roundedMargin:Math.round((request-automatedTotal)*1000/request)/10};
}
export const legacy2017AutumnPm6Format=(n:number)=>n.toLocaleString('en-US',{maximumFractionDigits:1});
export function legacy2017AutumnPm6Banks(values:number[]) {const m=legacy2017AutumnPm6Model(values);return [
 [
 '人件費の実績は，3年度とも，各年度の実績の合計の過半を占めている。',
 'サーバ費の実績は，2年度連続で上がっている。',
 'PC費の実績は，2016年度の前年度に対する増分よりも，2017年度の前年度に対する増分の方が小さい。',
 'ネットワーク費の予算は2年度連続で下がっているが，ネットワーク費の実績は2年度連続で上がっている。',
 'その他経費は，各費目中で，予算も実績も2015年度は2番目に大きい費目であったが，2017年度は3番目に大きい費目となっている。',
 '各費目の実績の合計は，3年度とも，各費目の予算の合計を上回っている。',
 ],[220,230,240,250,260,270].map(n=>legacy2017AutumnPm6Format(m.scale(n))),[
 'サーバ費の割合とその他経費の割合が上がって，それら以外の費目の割合が下がっている',
 'サーバ費の割合とその他経費の割合が下がって，それら以外の費目の割合が上がっている',
 '人件費の割合が上がって，それ以外の費目の割合が下がっている',
 '人件費の割合が下がって，それ以外の費目の割合が上がっている',
 '人件費の割合とサーバ費の割合が上がって，それら以外の費目の割合が下がっている',
 '人件費の割合とサーバ費の割合が下がって，それら以外の費目の割合が上がっている',
 ],[5670,6300,6930,7000].map(n=>legacy2017AutumnPm6Format(m.scale(n))),
 ['10%未満の','10%の','10%よりも大きな'],
 ['上がる','変わらない','下がるがゼロ以下にはならない','下がってゼロになる','下がってマイナスになる'],
 ['5.5','6.1','7.1','7.9','8.0','8.9'],
 ];}
export const legacy2017AutumnPm6Units={
 selection:'選択した問題は，選択欄の（選）をマークしてください。マークがない場合は，採点されません。',
 instruction2:'設問2　B社サービスに関する2018年度の予算について次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。',
 comparison:'2018年度の各費目の予算が予算の合計に占める割合を，2017年度の各費目の実績が実績の合計に占める割合と比較すると，［b］。',
 instruction3:'設問3　2018年度の提示価格に関する次の記述中の［ ］に入れる適切な答えを，解答群の中から選べ。',
 pricing:'営業部では，運用サービス部が作成した予算を基に，利益率が10%となるようにB社サービスの提示価格を算出した。2018年度の提示価格は，［c］千円となった。ここで，利益率は，提示価格から予算を引いた額を提示価格で割った値であり，100を乗じて%表示する。',
 reduction:'運用サービス部と営業部で検討した結果，サービスレベルの変更についてB社と合意できれば，その他経費を10%，人件費を5%削減できることが分かった。この場合，2018年度の予算の合計は［d］削減となり，要求価格と同額を提示価格とすると，利益率は［e］。',
 automation:'また，作業の一部を自動化することによって，人件費を先の5%と合わせて15%削減できることが分かった。ただし，この場合には，サーバ費については5%上がる見込みである。運用サービス部では，先のその他経費の10%削減と合わせてB社サービスの2018年度の予算を再度作成した。このとき，提示価格を要求価格と同額にすると，利益率は［f］%になる。ここで，%表示する値は，利益率に100を乗じて小数第2位で四捨五入したものである。',
} as const;
export const legacy2017AutumnPm6Profiles=[
 'legacy-2017-autumn-pm6-selection','legacy-2017-autumn-pm6-table1','legacy-2017-autumn-pm6-instruction2','legacy-2017-autumn-pm6-table2','legacy-2017-autumn-pm6-comparison','legacy-2017-autumn-pm6-instruction3','legacy-2017-autumn-pm6-pricing','legacy-2017-autumn-pm6-reduction','legacy-2017-autumn-pm6-automation',
 'legacy-2017-autumn-pm6-bank-trend','legacy-2017-autumn-pm6-bank-a','legacy-2017-autumn-pm6-bank-b','legacy-2017-autumn-pm6-bank-c','legacy-2017-autumn-pm6-bank-d','legacy-2017-autumn-pm6-bank-e','legacy-2017-autumn-pm6-bank-f',
] as const;
export function legacy2017AutumnPm6Figure(profile:string,values:number[]) {
 const model=legacy2017AutumnPm6Model(values);if(!(legacy2017AutumnPm6Profiles as readonly string[]).includes(profile))throw new DataError('SOURCE_FIGURE','秋午後問6の未登録描画です');
 const kind=profile.slice('legacy-2017-autumn-pm6-'.length),banks=legacy2017AutumnPm6Banks(values),group=['trend','a','b','c','d','e','f'].indexOf(kind.slice(5));
 const caption=kind==='table1'?'表1　B社サービスに関する2015〜2017年度の3年度分の予算と実績':kind==='table2'?'表2　B社サービスに関する2018年度の予算':kind.startsWith('bank-')?group===0?'解答群':kind.slice(5)+'に関する解答群':legacy2017AutumnPm6Units[kind as keyof typeof legacy2017AutumnPm6Units];
 let alt=caption;
 if(kind==='table1')alt+='。単位 千円。'+legacy2017AutumnPm6Names.map((name,i)=>name+'：'+model.costs[i].map(legacy2017AutumnPm6Format).join('，')).join('。')+'。合計：'+model.totals.map(legacy2017AutumnPm6Format).join('，')+'。各年度の予算，実績の順。';
 if(kind==='table2')alt+='。単位 千円。人件費とPC費は網掛けで非表示。サーバ費'+legacy2017AutumnPm6Format(model.budget[1])+'，ネットワーク費は空欄a，その他経費'+legacy2017AutumnPm6Format(model.budget[4])+'，合計'+legacy2017AutumnPm6Format(model.total)+'。注記 網掛けの部分は表示していない。';
 if(kind.startsWith('bank-'))alt+='。'+banks[group].map((x,i)=>'アイウエオカ'[i]+' '+x).join('。');
 return {kind,caption,alt,model,banks,group};
}
