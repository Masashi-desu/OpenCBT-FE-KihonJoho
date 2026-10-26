/** Independent worksheet: no production model, answer indices or generator imports. */
import {DatabaseSync} from 'node:sqlite';
export const autumnPm3Worksheet=[{year:2016,count:5,amount:10000,ageYear:2017},{year:2018,count:4,amount:8000,ageYear:2019},{year:2020,count:6,amount:12000,ageYear:2021}] as const;
export const autumnPm3HistoryTexts=['ある時，ある商品をある会員が購入した単価と，その直後に変更された単価との価格差','実際に購入された商品の，販売時点の単価の変遷','全ての商品の，単価の変遷','全ての商品の，直近の単価変更日の前日における単価'];
export const autumnPm3BRows=[['SUM(単価 * 個数)','商品表.単価，販売明細表.個数','年齢，分類'],['SUM(単価 * 個数)','商品表.単価，販売明細表.個数','年齢，分類，合計販売額'],['SUM(販売額)','販売表.販売額','年齢，分類'],['SUM(販売額)','販売表.販売額','年齢，分類，合計販売額'],['SUM(販売時単価 * 個数)','販売明細表.販売時単価，販売明細表.個数','年齢，分類'],['SUM(販売時単価 * 個数)','販売明細表.販売時単価，販売明細表.個数','年齢，分類，合計販売額']];
export const autumnPm3CRows=[['1','2'],['1','3'],['2','2'],['2','3']];
export function frozenAutumnPm3ASql(year:number,count:number,amount:number){const date=`販売表.販売日 >= '${year}-01-01' AND 販売表.販売日 <= '${year}-12-31'`;return[
 `AND ${date}\nAND 商品表.分類 = 'コーヒー'\nAND 商品表.単価 * 販売明細表.個数 >= ${amount}\nGROUP BY 販売表.会員番号\nHAVING COUNT(*) >= ${count}`,
 `AND ${date}\nAND 商品表.分類 = 'コーヒー'\nGROUP BY 販売表.会員番号\nHAVING SUM(商品表.単価 * 販売明細表.個数) >= ${amount}\n  AND COUNT(*) >= ${count}`,
 `AND ${date}\nGROUP BY 販売表.会員番号\nHAVING 商品表.分類 = 'コーヒー'\n  AND SUM(商品表.単価 * 販売明細表.個数) >= ${amount}\n  AND COUNT(*) >= ${count}`,
 `GROUP BY 販売表.会員番号\nHAVING ${date}\n  AND 商品表.分類 = 'コーヒー'\n  AND SUM(販売表.販売額) >= ${amount}\n  AND COUNT(*) >= ${count}`];}
export const normalizeAutumnSql=(s:string)=>s.replaceAll('，',',');
function db(){const d=new DatabaseSync(':memory:');d.exec('CREATE TABLE 会員表(会員番号 TEXT PRIMARY KEY,氏名 TEXT,生年 INTEGER,電話番号 TEXT,郵便番号 TEXT,住所 TEXT); CREATE TABLE 販売表(伝票番号 TEXT PRIMARY KEY,販売日 TEXT,会員番号 TEXT,販売額 INTEGER); CREATE TABLE 商品表(商品番号 TEXT PRIMARY KEY,分類 TEXT,商品名 TEXT,単価 INTEGER); CREATE TABLE 販売明細表(伝票番号 TEXT,商品番号 TEXT,個数 INTEGER,販売時単価 INTEGER,PRIMARY KEY(伝票番号,商品番号));');return d;}
/** SQL standard grouped-column constraint, deliberately separate from permissive SQLite bare columns. */
export function standardAutumnPromotionColumns(fragment:string){const having=fragment.split('HAVING')[1]??'';return !/商品表\.分類|販売表\.販売日/.test(having);}
export function independentAutumnPromotion(sql:string,year:number,minCount:number,minAmount:number){const d=db(),rows:{member:string;date:string;kind:string;amount:number}[]=[];let serial=0;
 d.exec("INSERT INTO 商品表 VALUES('C','コーヒー','coffee',100),('J','ジュース','juice',100)");
 for(const member of['PASS','COUNT','TOTAL','OTHER','OLD','MIX'])d.prepare('INSERT INTO 会員表 VALUES(?,?,1960,?,?,?)').run(member,member,'03-0000','100-0000',member+'住所');
 const add=(member:string,n:number,amount:number,kind='コーヒー',date=year+'-06-01')=>{for(let k=0;k<n;k++){const no='D'+(++serial);d.prepare('INSERT INTO 販売表 VALUES(?,?,?,?)').run(no,date,member,amount);d.prepare('INSERT INTO 販売明細表 VALUES(?,?,?,?)').run(no,kind==='コーヒー'?'C':'J',amount/100,100);rows.push({member,date,kind,amount});}};
 add('PASS',minCount,minAmount/minCount);add('COUNT',minCount-1,4000);add('TOTAL',minCount,1000);add('OTHER',minCount,2000,'ジュース');add('OLD',minCount,2000,'コーヒー',(year-1)+'-12-31');add('MIX',minCount,1000);add('MIX',minCount,10000,'ジュース');
 const grouped=new Map<string,{count:number;sum:number}>();for(const r of rows)if(r.date>=year+'-01-01'&&r.date<=year+'-12-31'&&r.kind==='コーヒー'){const v=grouped.get(r.member)??{count:0,sum:0};v.count++;v.sum+=r.amount;grouped.set(r.member,v);}const expected=[...grouped].filter(([,g])=>g.count>=minCount&&g.sum>=minAmount).map(([id])=>id).sort();
 let actual:string[];try{actual=d.prepare(normalizeAutumnSql(sql)).all().map(r=>String(r.氏名)).sort();}finally{d.close();}return{expected,actual,rows};
}
export function independentAutumnAggregate(sql:string,ageYear:number){const d=db();d.exec("INSERT INTO 会員表 VALUES('A','A',1990,'','',''),('B','B',1980,'','',''); INSERT INTO 商品表 VALUES('C','コーヒー','coffee',999),('J','ジュース','juice',888); ");
 const lines=[{invoice:'D1',member:'A',birth:1990,product:'C',kind:'コーヒー',quantity:2,price:100,total:400},{invoice:'D1',member:'A',birth:1990,product:'J',kind:'ジュース',quantity:1,price:200,total:400},{invoice:'D2',member:'A',birth:1990,product:'C',kind:'コーヒー',quantity:3,price:150,total:450},{invoice:'D3',member:'B',birth:1980,product:'J',kind:'ジュース',quantity:2,price:180,total:360}];
 for(const line of lines){d.prepare('INSERT OR IGNORE INTO 販売表 VALUES(?,?,?,?)').run(line.invoice,ageYear+'-03-01',line.member,line.total);d.prepare('INSERT INTO 販売明細表 VALUES(?,?,?,?)').run(line.invoice,line.product,line.quantity,line.price);}
 d.prepare('INSERT INTO 販売表 VALUES(?,?,?,?)').run('OUT',ageYear+'-07-01','A',99999);d.prepare('INSERT INTO 販売明細表 VALUES(?,?,?,?)').run('OUT','C',1,99999);
 const totals=new Map<string,number>();for(const l of lines){const key=(ageYear-l.birth)+'/'+l.kind;totals.set(key,(totals.get(key)??0)+l.quantity*l.price);}const expected=[...totals].map(([key,sum])=>{const [age,kind]=key.split('/');return{年齢:Number(age),分類:kind,合計販売額:sum};}).sort((a,b)=>a.年齢-b.年齢||b.合計販売額-a.合計販売額);
 const actual=d.prepare(normalizeAutumnSql(sql)).all().map(r=>({...r}));d.close();return{actual,expected};
}
/** Two legal before-opening price histories, identical sold-price/current-price records. */
export function independentAutumnPriceHistories(){const histories=[[1000,1100,1300],[1000,1200,1300]],stored=histories.map(h=>({current:h[2],sales:[{day:1,price:h[0]},{day:3,price:h[2]}]}));return{stored,queries:histories.map(h=>[h[1]-h[0],JSON.stringify([h[0],h[2]]),JSON.stringify(h),h[1]]),truth:[false,true,false,false]};}
/** Minimal dependencies plus concrete zero-stock and never-sold cases. */
export function independentAutumnInventory(){const d=new DatabaseSync(':memory:');d.exec("CREATE TABLE 入荷表(商品番号 TEXT,入荷数 INTEGER);CREATE TABLE 販売明細表(商品番号 TEXT,個数 INTEGER);INSERT INTO 入荷表 VALUES('ZERO',5),('UNSOLD',7),('LIVE',10);INSERT INTO 販売明細表 VALUES('ZERO',5),('LIVE',3);CREATE VIEW ビュー入荷集計表 AS SELECT 商品番号,SUM(入荷数) AS 入荷総数 FROM 入荷表 GROUP BY 商品番号;CREATE VIEW ビュー販売集計表 AS SELECT 商品番号,SUM(個数) AS 販売総数 FROM 販売明細表 GROUP BY 商品番号;");
 const actual=d.prepare('SELECT i.商品番号,i.入荷総数-COALESCE(s.販売総数,0) AS 在庫数 FROM ビュー入荷集計表 i LEFT JOIN ビュー販売集計表 s ON i.商品番号=s.商品番号 ORDER BY i.商品番号').all().map(r=>({...r}));d.close();
 const salesInputs=[['商品番号','個数'],['伝票番号','販売日','会員番号','販売額'],['商品番号','分類','商品名','単価'],['商品番号','入荷総数']];const saleMinimum=Math.min(...salesInputs.map(cols=>cols.includes('商品番号')&&cols.includes('個数')?1:Infinity));
 const stockInputs=[['商品番号','販売総数'],['商品番号','入荷総数']];let stockMinimum=Infinity;for(let mask=1;mask<4;mask++){const columns=stockInputs.flatMap((c,i)=>mask&(1<<i)?c:[]);if(columns.includes('販売総数')&&columns.includes('入荷総数'))stockMinimum=Math.min(stockMinimum,mask.toString(2).replaceAll('0','').length);}return{actual,minimum:[saleMinimum,stockMinimum]};
}
export const autumnPm3OracleReview={status:'author_independent_method_pending_peer_review',scope:'all3conditions/all18choices; original QS13–17 and ANS1; SQLite executes supported statements; standard grouped-column rule rejects SQLite-only bare columns',references:['https://www.sqlite.org/lang_select.html#bare_columns_in_an_aggregate_query','https://www.postgresql.org/docs/current/sql-select.html#SQL-GROUPBY','https://www.postgresql.org/docs/current/sql-select.html#SQL-HAVING']};
