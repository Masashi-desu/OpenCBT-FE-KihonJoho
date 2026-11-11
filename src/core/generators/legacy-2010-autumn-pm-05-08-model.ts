import { autumn2015PmCase } from './legacy-2015-autumn-pm-01-04-shared';

export const collection = '2010h22a-fe-pm';
export const caseCount = 4;
export const caseIndex = (values: number[]) => autumn2015PmCase(values,caseCount-1);
export const num = (value:number) => value.toLocaleString('ja-JP');
export const circles = ['①','②','③','④'] as const;

const inventoryCases = [
  { company:'T社', item:'部品', key:'部品番号', site:'', reverse:false, processes:['P1','P2','P3'] },
  { company:'V社', item:'消耗品', key:'品目番号', site:'', reverse:true, processes:['P2','P3','P1'] },
  { company:'W社', item:'補修用部品', key:'拠点別部品番号', site:'拠点ごとに同一品目を別の番号で管理する。', reverse:false, processes:['P3','P1','P2'] },
  { company:'S社', item:'原材料', key:'倉庫別原材料番号', site:'倉庫が違えば同一品目でも別の番号で管理する。', reverse:true, processes:['P1','P3','P2'] },
] as const;
export const inventoryAt = (index:number) => inventoryCases[index];
export const inventoryRecordFields = (index:number) => [inventoryAt(index).key,'受入日付','購入単価','受入数量'];

const privacyCases = [
  {client:'X社',vendor:'Y社',service:'会員制の通信販売',reports:'取引明細',members:'約1万人',order:[0,1,2,3]},
  {client:'R社',vendor:'S社',service:'定期購読の通信販売',reports:'購読履歴',members:'約8千人',order:[1,0,2,3]},
  {client:'U社',vendor:'V社',service:'会員向け教材販売',reports:'購入明細',members:'約2万人',order:[2,1,3,0]},
  {client:'K社',vendor:'L社',service:'会員向け機材の貸出し',reports:'貸出明細',members:'約5千人',order:[3,0,1,2]},
] as const;
export const privacyAt = (index:number) => privacyCases[index];

type LocalAccount = readonly [sales:number, operating:number, other:number, assets:number];
type Account = { sales:number; cost:number; operating:number; other:number; ordinary:number; assets:number };
const basePrior: readonly LocalAccount[] = [[32000,3200,-200,30000],[14000,2100,100,8000],[300,15,-1,280],[200,-10,2,180]];
const baseCurrent: readonly LocalAccount[] = [[34000,3300,-100,31000],[12400,1488,812,7900],[330,17,3,300],[240,-2,2,200]];
const rates = [
  [[1,1,100,140],[1,1,70,150]],
  [[1,1,100,120],[1,1,70,130]],
  [[1,1,120,140],[1,1,80,150]],
  [[1,1,100,120],[1,1,60,110]],
] as const;
const years = [[2008,2009],[2007,2008],[2006,2007],[2005,2006]] as const;
const variants: readonly { prior?:readonly LocalAccount[]; current:readonly LocalAccount[] }[] = [
  {current:baseCurrent},
  {prior:[...basePrior.slice(0,3),[200,3,1,180]],current:[[34000,3740,-100,31000],[12400,-1488,812,7900],[320,12,3,300],[240,2,0,200]]},
  {current:[baseCurrent[0],baseCurrent[1],[270,17,3,300],baseCurrent[3]]},
  {prior:[...basePrior.slice(0,3),[200,3,1,180]],current:[[34000,3300,-3300,31000],[13000,1560,440,7900],[360,21,3,320],[240,2,0,200]]},
];
export const companies = ['B社','C社','D社','E社'] as const;
export const accountLabels = ['売上高','製造原価・販管費','営業利益','営業外損益','経常利益','総資産'] as const;
const asAccount = ([sales,operating,other,assets]:LocalAccount,rate:number):Account =>
  ({sales:sales*rate,cost:(sales-operating)*rate,operating:operating*rate,other:other*rate,ordinary:(operating+other)*rate,assets:assets*rate});
export const accountRow = (account:Account) => [
  account.sales,account.cost,account.operating,account.other,account.ordinary,account.assets,
];
export function financeAt(index:number){
  const {prior=basePrior,current}=variants[index], fx=rates[index];
  const local=[prior,current].map(accounts=>accounts.map(account=>asAccount(account,1)));
  const yen=[prior,current].map((accounts,j)=>accounts.map((account,i)=>asAccount(account,fx[j][i])));
  const eligible=local[1].map(account=>account.operating>0&&account.ordinary>0);
  const awards=local[1].map((account,i)=>{
    const old=local[0][i];
    return eligible[i]&&account.sales>old.sales&&account.operating*old.sales>old.operating*account.sales&&
      account.ordinary*old.assets>old.ordinary*account.assets;
  });
  const reviews=local[1].map((account,i)=>{
    const old=local[0][i];
    return account.sales*10<=old.sales*9&&account.operating*10<=old.operating*9;
  });
  const saleUp=local[1][2].sales>local[0][2].sales, profitUp=local[1][2].operating>local[0][2].operating;
  return {year:years[index],fx,local,yen,eligible,awards,reviews,trend:saleUp?(profitUp?0:1):2};
}

export const binary = (value:number,width:number) => (value & ((1<<width)-1)).toString(2).padStart(width,'0');
function signed(value:number,width:number) {
  const modulus=1<<width, word=value&(modulus-1);
  return word>=(modulus>>>1)?word-modulus:word;
}
export function program1(m:number,n:number) {
  let register=n&255;
  const initial=binary(register,13), rows=[];
  for(let i=0;i<8;i++){
    const bit=register&1;
    const afterAdd=bit?signed(register+256*m,13):register;
    register=afterAdd>>1;
    rows.push({bit, afterAdd:binary(afterAdd,13), shifted:binary(register,13)});
  }
  return {initial,rows,result:binary(register,8)};
}
export function program2(m:number,n:number) {
  let register=(n&15)<<1;
  const initial=binary(register,10), rows=[];
  for(let i=0;i<4;i++){
    const low=register&3;
    const updated=signed(register+(low===1?32*m:low===2?-32*m:0),10);
    register=updated>>1;
    rows.push({low,updated:binary(updated,10),shifted:binary(register,10)});
  }
  return {initial,rows,result:binary(register>>1,8)};
}
const multiplicationCases = [5,4,6,7] as const;
export function multiplyAt(index:number){
  const m=multiplicationCases[index], n=3;
  const positive=program1(m,n), negative=program1(-m,n), booth=program2(-m,n);
  return {m,n,positive,negative,booth,
    a:negative.rows[0].shifted.slice(0,6),b:negative.rows[1].shifted.slice(0,7),
    c:booth.rows[1].shifted.slice(0,7)};
}
