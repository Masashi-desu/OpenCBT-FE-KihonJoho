export const spring2019Pm13Profiles=['legacy-2019-spring-pm13-sales','legacy-2019-spring-pm13-members','legacy-2019-spring-pm13-ranks','legacy-2019-spring-pm13-classification','legacy-2019-spring-pm13-product','legacy-2019-spring-pm13-macro','legacy-2019-spring-pm13-bank'] as const;
export interface Spring2019Sale {receipt:number;date:string;member:number;product:string;unitPrice:number;quantity:number;amount:number;sequence:number}
export interface Spring2019Member {member:number;amount:number;visits:number;lastDate:string;classification:string;coupon:number}
export interface Spring2019Product {member:number;amount:number;lastDate:string}
export type Spring2019MacroRow={level:number;control:'○'|'・'|'■'|'▲'|'▼';text:string};
export const spring2019Pm13Macro:Spring2019MacroRow[]=[
 {level:0,control:'○',text:'マクロ：manageMembers'},
 {level:0,control:'○',text:'数値型：i，j，k，memNo，index，temp，sumTab[9001, 3]'},
 {level:0,control:'■',text:'i：1，i ≦ 会員管理!E1，1'},
 {level:1,control:'・',text:'sumTab[i, 0] ← 相対(会員管理!A3, i, 0)'},
 {level:1,control:'・',text:'sumTab[i, 1] ← 0'},
 {level:0,control:'■',text:''},
 {level:0,control:'・',text:'sumTab[会員管理!E1 ＋ 1, 1] ← 0'},
 {level:0,control:'■',text:'i：1，i ≦ 会員管理!B1，1'},
 {level:1,control:'▲',text:'相対(販売データ!A1, i, 3) ＝ B1'},
 {level:2,control:'・',text:'memNo ← 相対(販売データ!A1, i, 2)'},
 {level:2,control:'・',text:'index ← 照合一致(memNo, 会員管理!A4:A9002, 0)'},
 {level:2,control:'・',text:'［d］'},
 {level:2,control:'・',text:'sumTab[index, 2] ← 相対(販売データ!A1, i, 1)'},
 {level:1,control:'▼',text:''},
 {level:0,control:'■',text:''},
 {level:0,control:'■',text:'i：1，i ≦ 会員管理!E1，1'},
 {level:1,control:'■',text:'j：1，j ≦ 会員管理!E1 − i，1'},
 {level:2,control:'▲',text:'［e］'},
 {level:3,control:'■',text:'k：0，k ≦ 2，1'},
 {level:4,control:'・',text:'temp ← sumTab[j, k]'},
 {level:4,control:'・',text:'sumTab[j, k] ← sumTab[j ＋ 1, k]'},
 {level:4,control:'・',text:'sumTab[j ＋ 1, k] ← temp'},
 {level:3,control:'■',text:''},
 {level:2,control:'▼',text:''},
 {level:1,control:'■',text:''},
 {level:0,control:'■',text:''},
 {level:0,control:'・',text:'i ← 1'},
 {level:0,control:'■',text:'sumTab[i, 1] ＞ 0'},
 {level:1,control:'■',text:'j：0，j ≦ 2，1'},
 {level:2,control:'・',text:'［f］'},
 {level:1,control:'■',text:''},
 {level:1,control:'・',text:'i ← i ＋ 1'},
 {level:0,control:'■',text:''}
];
export const spring2019Pm13Banks=[
 ['照合検索(A4, 販売データ!C$2:C$9999, 販売データ!A$2:A$9999)','照合検索(A4, 販売データ!C$2:C$9999, 販売データ!B$2:B$9999)','照合検索(A4 ＊ 1000 ＋ 1, 販売データ!H$2:H$9999, 販売データ!A$2:A$9999)','照合検索(A4 ＊ 1000 ＋ 1, 販売データ!H$2:H$9999, 販売データ!B$2:B$9999)','照合検索(A4 ＊ 1000 ＋ C4, 販売データ!H$2:H$9999, 販売データ!A$2:A$9999)','照合検索(A4 ＊ 1000 ＋ C4, 販売データ!H$2:H$9999, 販売データ!B$2:B$9999)'],
 ['照合一致(B4, 分類表!C$4:C$6, 1), 照合一致(C4, 分類表!D$3:F$3, 1)','照合一致(B4, 分類表!D$3:F$3, 1), 照合一致(C4, 分類表!C$4:C$6, 1)','照合一致(C4, 分類表!C$4:C$6, 1), 照合一致(B4, 分類表!D$3:F$3, 1)','照合一致(C4, 分類表!D$3:F$3, 1), 照合一致(B4, 分類表!C$4:C$6, 1)'],
 ['切捨て(B4, −4) ／ 50000 ＊ 1000','切捨て(B4 ＊ 1000, −8) ／ 50000','切捨て(B4 ／ 50000, 0) ＊ 1000','切捨て(B4 ／ 50000 ＊ 1000, 0)','切捨て(B4 ／ 50000 ＊ 1000, −4)'],
 ['sumTab[1, index] ← sumTab[1, index] ＋ 相対(販売データ!A1, i, 6)','sumTab[1, index] ← sumTab[i, index] ＋ 相対(販売データ!A1, index, 6)','sumTab[i, 1] ← sumTab[i, 1] ＋ 相対(販売データ!A1, i, 6)','sumTab[i, 1] ← sumTab[i, 1] ＋ 相対(販売データ!A1, index, 6)','sumTab[index, 1] ← sumTab[index, 1] ＋ 相対(販売データ!A1, i, 6)','sumTab[index, 1] ← sumTab[index, 1] ＋ 相対(販売データ!A1, index, 6)'],
 ['論理積(sumTab[j, 1] ＜ sumTab[j ＋ 1, 1], 論理和(sumTab[j, 1] ＝ sumTab[j ＋ 1, 1], sumTab[j, 2] ＞ sumTab[j ＋ 1, 2]))','論理積(sumTab[j, 1] ＞ sumTab[j ＋ 1, 1], sumTab[j, 2] ＞ sumTab[j ＋ 1, 2])','論理積(sumTab[j, 1] ＞ sumTab[j ＋ 1, 1], 論理和(sumTab[j, 1] ＝ sumTab[j ＋ 1, 1], sumTab[j, 2] ＜ sumTab[j ＋ 1, 2]))','論理和(sumTab[j, 1] ＜ sumTab[j ＋ 1, 1], sumTab[j, 2] ＞ sumTab[j ＋ 1, 2])','論理和(sumTab[j, 1] ＜ sumTab[j ＋ 1, 1], 論理積(sumTab[j, 1] ＝ sumTab[j ＋ 1, 1], sumTab[j, 2] ＞ sumTab[j ＋ 1, 2]))','論理和(sumTab[j, 1] ＞ sumTab[j ＋ 1, 1], 論理積(sumTab[j, 1] ＝ sumTab[j ＋ 1, 1], sumTab[j, 2] ＜ sumTab[j ＋ 1, 2]))'],
 ['相対(A2, i, j) ← sumTab[i, 1]','相対(A2, i, j) ← sumTab[i, j]','相対(A2, i, j＋1) ← sumTab[i, j]','相対(A2, j, i) ← sumTab[j, 1]','相対(A2, j, i) ← sumTab[i, j]','相対(A2, j＋1, i) ← sumTab[j, 1]']
] as const;
const rankClasses=[['C','B','A'],['C','A','S'],['B','A','S']];
const classify=(amount:number,visits:number)=>rankClasses[visits<6?0:visits<12?1:2][amount<40000?0:amount<80000?1:2];
export function spring2019Pm13Data(scenario:number) {
 if(!Number.isInteger(scenario)||scenario<1||scenario>16)throw Error('SPRING2019_PM13_FULL_DATA_DOMAIN');
 const memberNumbers=Array.from({length:531},(_,i)=>1001+i),sales:Spring2019Sale[]=[],products=['ABC1001','BQR4500','CHN5102'],product=products[(scenario-1)%3],buyerCount=531;
 const start=Date.UTC(2018,9,1),end=Date.UTC(2019,2,31),visits=new Map<number,number>();
 let event=0;
 while(sales.length<3333){const count=Math.min(event%7===0?2:1,3333-sales.length),memberIndex=event%7===0?event%11:(event+(scenario-1)*13)%531,member=1001+memberIndex;
  const day=Math.floor(event*181/2915),date=new Date(Math.min(end,start+day*86400000)).toISOString().slice(0,10),prefix=Number(date[3]+date.slice(5,7)+date.slice(8,10))*1000,receipt=prefix+(event%999)+1;
  const sequence=(visits.get(member)??0)+1;visits.set(member,sequence);
  for(let item=0;item<count;item++){const code=item===0&&memberIndex<buyerCount?product:products[(products.indexOf(product)+1+item)%3],unitPrice=100*(12+((event*17+scenario*7+item*11)%(event%7===0?49:469))),quantity=1+(event+item+scenario)%3;sales.push({receipt,date,member,product:code,unitPrice,quantity,amount:unitPrice*quantity,sequence:item===0?member*1000+sequence:0});}
  event++;
 }
 // Two real buyers have equal product totals and different final dates. This
 // exercises the source's secondary date ordering; it is part of the known
 // synthetic input, never an inference about omitted original rows.
 const byBuyer=new Map<number,Spring2019Sale[]>();for(const sale of sales)if(sale.product===product){const group=byBuyer.get(sale.member)??[];group.push(sale);byBuyer.set(sale.member,group);}
 const buyers=[...byBuyer].sort((a,b)=>a[1].at(-1)!.date.localeCompare(b[1].at(-1)!.date)||a[0]-b[0]);
 const tieMembers=[buyers[0][0],buyers.at(-1)![0]],tieAmount=160000+1000*(scenario-1);
 for(const member of tieMembers){const rows=byBuyer.get(member)!,unit=100*Math.floor(tieAmount/(rows.length*100));for(let i=0;i<rows.length;i++){rows[i].quantity=1;rows[i].unitPrice=i===rows.length-1?tieAmount-unit*(rows.length-1):unit;rows[i].amount=rows[i].unitPrice;}}
 const totals=new Map<number,{amount:number;visits:number;lastDate:string}>();for(const sale of sales){const total=totals.get(sale.member)??{amount:0,visits:0,lastDate:''};total.amount+=sale.amount;if(sale.sequence!==0)total.visits++;total.lastDate=sale.date;totals.set(sale.member,total);}
 const members:Spring2019Member[]=memberNumbers.map(member=>{const total=totals.get(member)??{amount:0,visits:0,lastDate:''};return{member,...total,classification:classify(total.amount,total.visits),coupon:Math.floor(total.amount/50000)*1000};});
 const productRows:Spring2019Product[]=[...byBuyer].map(([member,rows])=>({member,amount:rows.reduce((n,s)=>n+s.amount,0),lastDate:rows.at(-1)!.date})).sort((a,b)=>b.amount-a.amount||a.lastDate.localeCompare(b.lastDate)||a.member-b.member);
 return{scenario,product,sales,members,productRows,tieMembers,tieAmount,buyerCount};
}
const format=(n:number)=>n.toLocaleString('en-US');
export function spring2019Pm13Sheets(scenario:number) {
 if(!Number.isInteger(scenario)||scenario<0||scenario>16)throw Error('SPRING2019_PM13_DOMAIN');
 if(scenario===0)return{kind:'partial-source' as const,product:'ABC1001',salesCount:3333,memberCount:531,productCount:223,
  sales:[['2','81001001','2018-10-01','1115','BQR4500','48,000','1','48,000','1115001'],['3','81001002','2018-10-01','1299','CHN5102','2,400','3','7,200','1299001'],['4','81001002','2018-10-01','1299','CAQ5213','8,600','1','8,600','0'],['⋮','⋮','⋮','⋮','⋮','⋮','⋮','⋮','⋮'],['3334','90331015','2019-03-31','1318','ABC1001','16,000','1','16,000','1318014'],['3335','','','','','','','','']],
  members:[['4','1001','198,500','7','2019-03-21','S','3,000'],['5','1002','44,100','6','2019-03-14','A','0'],['6','1003','0','0','','C','0'],['⋮','⋮','⋮','⋮','⋮','⋮','⋮'],['534','1531','12,000','1','2019-03-29','C','0'],['535','','','','','','']],
  productRows:[['3','1067','96,000','2019-02-14'],['4','1318','80,000','2019-03-31'],['⋮','⋮','⋮','⋮'],['225','1327','16,000','2019-03-30']]};
 const data=spring2019Pm13Data(scenario),saleRow=(i:number)=>{const s=data.sales[i];return[String(i+2),String(s.receipt),s.date,String(s.member),s.product,format(s.unitPrice),String(s.quantity),format(s.amount),String(s.sequence)];},memberRow=(i:number)=>{const m=data.members[i];return[String(i+4),String(m.member),format(m.amount),String(m.visits),m.lastDate,m.classification,format(m.coupon)];},productRow=(i:number)=>{const m=data.productRows[i];return[String(i+3),String(m.member),format(m.amount),m.lastDate];};
 return{kind:'complete-synthetic' as const,product:data.product,salesCount:data.sales.length,memberCount:data.members.length,productCount:data.productRows.length,
  sales:[saleRow(0),saleRow(1),saleRow(2),Array(9).fill('⋮'),saleRow(data.sales.length-1),[String(data.sales.length+2),...Array(8).fill('')]],members:[memberRow(0),memberRow(1),memberRow(2),Array(7).fill('⋮'),memberRow(data.members.length-1),[String(data.members.length+4),...Array(6).fill('')]],productRows:[productRow(0),productRow(1),Array(4).fill('⋮'),productRow(data.productRows.length-1)]};
}
export function spring2019Pm13Figure(profile:string,values:number[]){const profileIndex=spring2019Pm13Profiles.indexOf(profile as typeof spring2019Pm13Profiles[number]);if(profileIndex<0||values.length!==2||!Number.isInteger(values[1]))throw Error('SPRING2019_PM13_PROFILE');const sheets=spring2019Pm13Sheets(values[0]);const group=values[1];if(group<0||group>(profileIndex===6?5:0))throw Error('SPRING2019_PM13_GROUP');return{profileIndex,sheets,macro:spring2019Pm13Macro,banks:spring2019Pm13Banks,group};}
