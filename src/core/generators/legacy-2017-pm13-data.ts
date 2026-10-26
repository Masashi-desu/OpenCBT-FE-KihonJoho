export const legacy2017Pm13Groups={
 a:[
 'IF(条件付個数(C3:C10, =料金計算!$A4)=0, 1, null)',
 'IF(条件付個数(C3:C10, =料金計算!$A4)=1, 1, null)',
 'IF(条件付個数(C3:C10, =料金計算!$A4)>1, null, 1)',
 'IF(条件付個数($C3:$C10, =料金計算!$A4)=0, null, 1)',
 'IF(条件付個数($C3:$C10, =料金計算!$A4)=1, null, 1)',
 'IF(条件付個数($C3:$C10, =料金計算!$A4)>1, 1, null)',
 ],
 b:[
 "IF(E4>重量区分!E8, '×', 照合一致(E4, 重量区分!D4:D8, 1))",
 "IF(E4>重量区分!E8, '×', 照合一致(E4, 重量区分!D4:D8, −1))",
 "IF(E4>重量区分!E8, '×', 照合一致(E4, 重量区分!E4:E8, 1))",
 "IF(E4>重量区分!E8, '×', 照合一致(E4, 重量区分!E4:E8, −1))",
 ],
 c:["論理積(G4≠'−', A4≠null)","論理積(論理和(F4='−', F4='×'), A4=null)","論理和(G4='−', 合計(料金表!C16:N16)=0)","論理和(論理積(F4≠'−', F4≠'×'), 合計(料金表!C16:N16)=1)"],
 d:[
 '垂直照合(F4, 料金表!B11:N15, 照合一致(1, 料金表!C16:N16, 0), 0)',
 '垂直照合(照合一致(1, 料金表!C16:N16, 0), 料金表!B11:N15, F4, 0)',
 '表引き(料金表!C11:N15, F4, 照合一致(1, 料金表!C16:N16, 0))',
 '表引き(料金表!C11:N15, 照合一致(1, 料金表!C16:N16, 0), F4)',
 ],
 e:['論理積(work_weight<E9, E10>重量区分!E8)','論理積(work_weight<E10, E10≦重量区分!E8)','論理積(work_weight>E9, E10>重量区分!E8)','論理積(work_weight>E10, E10≦重量区分!E8)'],
 f:['相対(B9, 0, i) ← 相対(B4, 0, i) − 相対(B10, 0, i)','相対(B9, 0, i) ← 相対(B4, 0, i) − 相対(B15, package_no, i)','相対(B9, 0, i) ← 相対(B9, 0, i) − 相対(B10, 0, i)','相対(B9, 0, i) ← 相対(B9, 0, i) − 相対(B15, package_no, i)'],
};
export const legacy2017Pm13Macro=[
 '○マクロ：Package_count','○数値型：package_no, i, j, k, m, work_weight',
 '■i: 0, i≦2, 1','・相対(B9, 0, i) ← 相対(B4, 0, i)','■','・package_no ← 1',
 '■E9>0','・相対(A15, package_no, 0) ← package_no','・相対(F15, package_no, 0) ← F9','・相対(G15, package_no, 0) ← G9','・work_weight ← 0',
 '■i: 0, i≦B9, 1','・B10 ← i','■j: 0, j≦C9, 1','・C10 ← j','■k: 0, k≦D9, 1','・D10 ← k','▲［e］',
 '■m: 0, m≦3, 1','・相対(B15, package_no, m) ← 相対(B10, 0, m)','■','・work_weight ← E10','▼','■','■','■',
 '■i: 0, i≦2, 1','・［f］','■','・package_no ← package_no + 1','■',
];
export const legacy2017Pm13MacroFrames={loops:[[3,5,0],[7,31,0],[12,26,1],[14,25,2],[16,24,3],[19,21,5],[27,29,1]],conditions:[[18,23,4]]};
export const legacy2017Pm13Rates=[[1188,864,756,1188,1296],[1458,1134,1026,1458,1836],[1728,1404,1296,1728,2376],[1998,1674,1566,1998,3186],[2268,1944,1836,2268,3996]];
export const legacy2017Pm13RegionNames=['北海道','北東北','南東北','九州','沖縄'];
export const legacy2017Pm13Prefectures=[['北海道'],['青森県','秋田県','岩手県'],['宮城県','山形県','福島県'],['福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県'],['沖縄県']];
const conditions=[
 {weights:[460,720,1200],boxes:[135,260,415,870,1320],example:[12,6,4],shipping:[10,36,30],destination:'青森県'},
 {weights:[480,700,1100],boxes:[140,250,420,880,1300],example:[10,8,5],shipping:[11,35,29],destination:'宮城県'},
 {weights:[440,760,1240],boxes:[130,270,400,900,1340],example:[12,6,4],shipping:[10,34,28],destination:'沖縄県'},
 {weights:[500,680,1160],boxes:[140,260,420,860,1320],example:[11,7,4],shipping:[12,32,27],destination:'北海道'},
 {weights:[420,740,1220],boxes:[135,255,410,850,1300],example:[13,6,4],shipping:[11,35,30],destination:'福岡県'},
 {weights:[460,700,1180],boxes:[140,270,430,890,1350],example:[12,8,4],shipping:[13,34,28],destination:'青森県'},
 {weights:[480,760,1200],boxes:[130,250,400,860,1310],example:[10,7,4],shipping:[12,36,29],destination:'宮城県'},
 {weights:[440,720,1260],boxes:[140,260,420,880,1340],example:[14,6,4],shipping:[10,33,31],destination:'福岡県'},
];
export type Legacy2017Pm13Package={counts:number[];weight:number;category:number;rate:number};
export function legacy2017Pm13Model(value:number){
 if(!Number.isSafeInteger(value)||value<0||value>7)throw Error('PARAMETER_CONSTRAINT');
 const c=structuredClone(conditions[value]),limits=[2000,5000,10000,20000,30000],upper=limits.map((n,i)=>n-c.boxes[i]),lower=upper.map((_,i)=>i===0?1:upper[i-1]+1),column=legacy2017Pm13Prefectures.findIndex(p=>p.includes(c.destination));
 const weight=(counts:number[])=>counts.reduce((n,x,i)=>n+x*c.weights[i],0),category=(n:number)=>n===0?0:upper.findIndex(u=>n<=u)+1;
 const exampleWeight=weight(c.example),exampleCategory=category(exampleWeight),shippingWeight=weight(c.shipping),remaining=[...c.shipping],packages:Legacy2017Pm13Package[]=[];
 let lastWork=[0,0,0];
 while(weight(remaining)>0){if(packages.length>=10)throw Error('PACKAGE_LIMIT');const prior=weight(remaining),cat=prior>upper[4]?5:category(prior);let best=0,bestCounts=[0,0,0];
  for(let i=0;i<=remaining[0];i++)for(let j=0;j<=remaining[1];j++)for(let k=0;k<=remaining[2];k++){const candidate=[i,j,k],w=weight(candidate);lastWork=candidate;if(best<w&&w<=upper[4]){best=w;bestCounts=candidate;}}
  if(best===0)throw Error('PACKAGE_PROGRESS');packages.push({counts:bestCounts,weight:best,category:cat,rate:legacy2017Pm13Rates[cat-1][column]});bestCounts.forEach((n,i)=>remaining[i]-=n);
 }
 return{...c,limits,lower,upper,column,exampleWeight,exampleCategory,examplePacked:exampleWeight+c.boxes[exampleCategory-1],exampleRate:legacy2017Pm13Rates[exampleCategory-1][column],shippingWeight,packages,remaining,lastWork,lastWorkWeight:weight(lastWork),totalRate:packages.reduce((n,p)=>n+p.rate,0)};
}
export const legacy2017Pm13Profiles=['legacy-2017-pm13-rate-sheet','legacy-2017-pm13-product-sheet','legacy-2017-pm13-weight-sheet','legacy-2017-pm13-calculation-sheet','legacy-2017-pm13-packing-sheet','legacy-2017-pm13-macro','legacy-2017-pm13-a-bank','legacy-2017-pm13-b-bank','legacy-2017-pm13-c-bank','legacy-2017-pm13-d-bank','legacy-2017-pm13-e-bank','legacy-2017-pm13-f-bank','legacy-2017-pm13-a-equation','legacy-2017-pm13-b-equation','legacy-2017-pm13-cd-equation'] as const;
export const legacy2017Pm13SpreadsheetAssetIds=[78,79,80,81,82,83].map(n=>`asset-ipa-2017h29h-fe-pm-13-p${n}`);
export const legacy2017Pm13CommonAssetIds=[3,4].map(n=>`asset-ipa-2017h29h-fe-pm-13-p${n}`);
export const legacy2017Pm13MaterialAssetIds=[...legacy2017Pm13SpreadsheetAssetIds,...legacy2017Pm13CommonAssetIds];
export function legacy2017Pm13Figure(profile:string,values:number[]){
 if(values.length!==1||!legacy2017Pm13Profiles.includes(profile as typeof legacy2017Pm13Profiles[number]))throw Error('PARAMETER_CONSTRAINT');
 const m=legacy2017Pm13Model(values[0]),index=legacy2017Pm13Profiles.indexOf(profile as typeof legacy2017Pm13Profiles[number]),captions=['図1 ワークシート“料金表”の例','図2 ワークシート“商品重量”','図3 ワークシート“重量区分”','図4 ワークシート“料金計算”の例','図5 “梱包作業表”と“梱包指示表”を追加したワークシート“料金計算”の例','マクロ：Package_count',...'abcdef'.split('').map(s=>`${s}に関する解答群`),'セルC16の式','セルF4の式','セルH4の式'];
 const bank=Object.values(legacy2017Pm13Groups)[index-6];
 const equations=['IF(料金計算!$A4=null, null, ［a］)','IF(E4=0, \'−\', ［b］)','IF(［c］, \'−\', ［d］)'];
 const alt=index>=12?equations[index-12]:index>=6?bank.map((s,i)=>'アイウエオカ'[i]+' '+s).join('。'):index===0?'列A/B/C/D/E/省略/M/N、行1〜16。都道府県の表と重量区分1〜5の料金表。省略列は原と同じ省略記号で示す。作業行16は発送先'+m.destination+'の属する表示列だけ1。':index===1?'セルA3〜A5はX/Y/Z、セルB3〜B5の重量gは'+m.weights.join('、')+'。':index===2?'重量区分1〜5の上限gは'+m.limits.join('、')+'。箱重量gは'+m.boxes.join('、')+'。商品の総重量の範囲は'+m.lower.map((n,i)=>`${n}〜${m.upper[i]}`).join('、')+'。':index===3?`発送先${m.destination}、商品数量${m.example.join('、')}、商品総重量${m.exampleWeight}g、重量区分${m.exampleCategory}、梱包後重量${m.examplePacked}g、発送料金${m.exampleRate}円。`:index===4?`発送先${m.destination}、数量${m.shipping.join('、')}、総重量${m.shippingWeight}g、重量区分は×。梱包作業の残数量は全て0、作業数量${m.lastWork.join('、')}、作業重量${m.lastWorkWeight}g。梱包指示は`+m.packages.map((p,i)=>`${i+1}番の数量${p.counts.join('、')}、重量${p.weight}g、区分${p.category}、料金${p.rate}円`).join('。')+`。合計数量${m.shipping.join('、')}、総重量${m.shippingWeight}g、料金合計${m.totalRate}円。`:'原のマクロ全31論理行。7組の繰返し枠、1組の選択枠、矩形空欄e/fを保持。'+legacy2017Pm13Macro.join('\n');
 return{caption:captions[index],alt,model:m,bank};
}
