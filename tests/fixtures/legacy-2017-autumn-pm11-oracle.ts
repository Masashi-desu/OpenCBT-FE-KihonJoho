/** Independent source/condition review. No production generator import. */
export const autumnPm11Review={pages:[58,59,60,61,62,63],apiPages:[76,77,78],counts:[4,4,4,4,4,5,5],indexes:[2,2,3,0,2,1,1],variants:[
 [3,2,1,1000,300,2000],[4,3,1,2000,300,1000],[5,2,1,1500,500,2500],[6,3,2,2400,400,1200],
 [5,4,2,2000,600,4000],[7,4,1,3000,800,1500],[8,5,3,4200,900,2100],[9,6,2,1000,700,3000]],
 secondThirdOptionIndexes:[1,3,1,3,1,3,3,1],
 candidates:[['Character, Comparator<String>','Character, String','String, Comparator<String>','String, String'],['int i = 0; i < orderBys.length; i++','int i = 0; i < table.length; i++','OrderBy orderBy : orderBys','String[] row : table'],['.get(col)','.get(orderBy.col)','[col]','[orderBy.col]'],['!=','<','==','>'],['-order','order','orderBy.isReversed ? -order : order','orderBy.isReversed ? order : -order']],
 compilerRejection:[ [0,1,3],[0,1,3],[0,1,2],[],[] ],
 scope:'Five-row source structure and class/member roles fixed from QS58-63. Conditions proposed independently; correct expected groups and actual Java execution checked separately. API material judgment is a separate root receipt.'};
export type Row=[string,string,string];export type Order={col:number;numeric:boolean;reversed?:boolean};
const integer=(text:string)=>{let n=0;for(const c of text){if(c===',')continue;if(c<'0'||c>'9')throw Error('reference positive integer domain');n=n*10+c.charCodeAt(0)-48;}return n;};
export function autumnPm11Rows(v:number):Row[]{const [hi,mid,lo,a,b,c]=autumnPm11Review.variants[v],money=(n:number)=>n<1000?String(n):`${Math.trunc(n/1000)},${String(n%1000).padStart(3,'0')}`;return[['apple',String(hi),money(a)],['cherry',String(lo),money(a)],['banana',String(lo),money(b)],['banana',String(mid),money(c)],['apple',String(mid),money(b)]];}
/** Recursive stable grouping and repeated minimum selection, not pairwise Array.sort. */
export function autumnPm11PartitionReference(rows:Row[],orders:Order[]):Row[]{
 if(!orders.length)return rows.map(r=>[...r]);const [order,...rest]=orders,buckets=new Map<string|number,Row[]>();
 for(const row of rows){const key=order.numeric?integer(row[order.col]):row[order.col];if(!buckets.has(key))buckets.set(key,[]);buckets.get(key)!.push(row);}
 const remaining=[...buckets.keys()],out:Row[]=[];
 while(remaining.length){let chosen=0;for(let i=1;i<remaining.length;i++)if(order.reversed?remaining[i]>remaining[chosen]:remaining[i]<remaining[chosen])chosen=i;const [key]=remaining.splice(chosen,1);out.push(...autumnPm11PartitionReference(buckets.get(key)!,rest));}
 return out;
}
export function autumnPm11PairSign(a:Row,b:Row,orders:Order[]){for(const order of orders){const x=order.numeric?integer(a[order.col]):a[order.col],y=order.numeric?integer(b[order.col]):b[order.col];if(x!==y){const sign=x<y?-1:1;return order.reversed?-sign:sign;}}return 0;}
export const autumnPm11Orders:Order[][]=[[{col:0,numeric:false},{col:1,numeric:true,reversed:true}],[{col:2,numeric:false},{col:0,numeric:false}],[{col:2,numeric:true},{col:0,numeric:false}]];
