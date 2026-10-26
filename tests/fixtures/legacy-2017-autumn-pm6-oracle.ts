/** Independent QS28–32 numeric ledger and integer-rational reference.
 * No production import. Input is the actual displayed 5x6 cost matrix.
 * Costs are thousand yen. Preserve source's final-only percentage rounding.
 */
export const originalCostRows=[
 [3000,3500,2800,3000,4000,4400],
 [1200,1250,1250,1400,1400,1250],
 [500,500,500,500,640,640],
 [200,220,250,240,250,250],
 [1000,1200,1000,1100,1000,1000],
];
export const scaleNumerators=[5,3,4,6];
export function budgetReference(rows:number[][]) {
 if(rows.length!==5||rows.some(r=>r.length!==6||r.some(n=>!Number.isSafeInteger(n)||n<0)))throw Error('INVALID_REFERENCE_INPUT');
 const actual=rows.map(r=>[r[1],r[3],r[5]]),estimated=rows.map(r=>[r[0],r[2],r[4]]);
 const sum=(xs:number[])=>xs.reduce((s,x)=>s+x,0),actualTotals=Array.from({length:3},(_,y)=>sum(actual.map(row=>row[y]))),estimatedTotals=Array.from({length:3},(_,y)=>sum(estimated.map(row=>row[y])));
 const byRule=actual.map((r,i)=>i===0?r[1]:i===2?r[2]:i===3?r[2]+(r[2]-r[1]):sum(r)/3),cost=sum(byRule);
 // Amounts in hundredths of thousand yen avoid intermediate floating-point rates.
 const quote=cost*100/90,requested=quote*90/100;
 const firstSavingHundredths=byRule[0]*5+byRule[4]*10;
 const finalSavingHundredths=byRule[0]*15+byRule[4]*10-byRule[1]*5;
 const finalProfitHundredths=(requested-cost)*100+finalSavingHundredths;
 const tenthsPercent=Math.floor((finalProfitHundredths*10+requested/2)/requested);
 const proportionDirections=byRule.map((n,i)=>Math.sign(n*actualTotals[2]-actual[i][2]*cost));
 const rank=(xs:number[],index:number)=>1+xs.filter(x=>x>xs[index]).length;
 const trendTruth=[
 actual[0].every((n,y)=>2*n>actualTotals[y]),
 actual[1][0]<actual[1][1]&&actual[1][1]<actual[1][2],
 actual[2][1]-actual[2][0]>actual[2][2]-actual[2][1],
 estimated[3][0]>estimated[3][1]&&estimated[3][1]>estimated[3][2]&&actual[3][0]<actual[3][1]&&actual[3][1]<actual[3][2],
 rank(estimated.map(r=>r[0]),4)===2&&rank(actual.map(r=>r[0]),4)===2&&rank(estimated.map(r=>r[2]),4)===3&&rank(actual.map(r=>r[2]),4)===3,
 actualTotals.every((n,y)=>n>estimatedTotals[y]),
 ];
 const match=(up:number[],down:number[])=>up.every(i=>proportionDirections[i]===1)&&down.every(i=>proportionDirections[i]===-1);
 const compositionTruth=[match([1,4],[0,2,3]),match([0,2,3],[1,4]),match([0],[1,2,3,4]),match([1,2,3,4],[0]),match([0,1],[2,3,4]),match([2,3,4],[0,1])];
 const firstProfitHundredths=(requested-cost)*100+firstSavingHundredths;
 const comparison=firstProfitHundredths*10-requested*100;
 return {byRule,cost,quote,requested,firstCost:(cost*100-firstSavingHundredths)/100,finalCost:(cost*100-finalSavingHundredths)/100,tenthsPercent,trendTruth,compositionTruth,
  reductionTruth:[firstSavingHundredths<10*cost,firstSavingHundredths===10*cost,firstSavingHundredths>10*cost],
  marginTruth:[comparison>0,comparison===0,comparison<0&&firstProfitHundredths>0,comparison<0&&firstProfitHundredths===0,comparison<0&&firstProfitHundredths<0],
 };
}
// Independent fixed-role readings of all qualitative options, not generated keys.
export const sourceOptionCounts=[6,6,6,4,3,5,6];
export const officialLabels='カオエエアウエ';
export const originalNumericBanks={a:[220,230,240,250,260,270],c:[5670,6300,6930,7000],f:[5.5,6.1,7.1,7.9,8.0,8.9]};
// Fixed from the visible original answer banks, so a text swap cannot pass by retaining its index.
export const qualitativeBanks={
 trend:[
 '人件費の実績は，3年度とも，各年度の実績の合計の過半を占めている。',
 'サーバ費の実績は，2年度連続で上がっている。',
 'PC費の実績は，2016年度の前年度に対する増分よりも，2017年度の前年度に対する増分の方が小さい。',
 'ネットワーク費の予算は2年度連続で下がっているが，ネットワーク費の実績は2年度連続で上がっている。',
 'その他経費は，各費目中で，予算も実績も2015年度は2番目に大きい費目であったが，2017年度は3番目に大きい費目となっている。',
 '各費目の実績の合計は，3年度とも，各費目の予算の合計を上回っている。',
 ],composition:[
 'サーバ費の割合とその他経費の割合が上がって，それら以外の費目の割合が下がっている',
 'サーバ費の割合とその他経費の割合が下がって，それら以外の費目の割合が上がっている',
 '人件費の割合が上がって，それ以外の費目の割合が下がっている',
 '人件費の割合が下がって，それ以外の費目の割合が上がっている',
 '人件費の割合とサーバ費の割合が上がって，それら以外の費目の割合が下がっている',
 '人件費の割合とサーバ費の割合が下がって，それら以外の費目の割合が上がっている',
 ],reduction:['10%未満の','10%の','10%よりも大きな'],margin:['上がる','変わらない','下がるがゼロ以下にはならない','下がってゼロになる','下がってマイナスになる'],
};
