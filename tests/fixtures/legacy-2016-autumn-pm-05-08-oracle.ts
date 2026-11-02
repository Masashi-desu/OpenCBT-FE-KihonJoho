/** Independent source review and reference solvers. No production generator,
 * answer calculator or correct-choice ID is imported into these expectations. */
export const officialKeys = { 5: ['ウ','ウ','エ','ア','イ'], 6: ['ウ','イ','ウ','ア','イ','イ'], 7: ['エ','ウ','ウ','ケ','ウ','ア','エ'], 8: ['イ','ア','エ','イ','エ','エ'] } as const;
export const expectedCounts = { 5: [5,8,6,6,6], 6: [4,4,4,3,4,4], 7: [4,3,3,10,10,2,4], 8: [4,6,6,6,6,4] } as const;
export const expectedQ5Terms = {
  a: ['延滞日数','延滞料金','貸出期間','貸出料金','登録年月日'],
  cd: ['貸出期間','貸出期間，単価','貸出期間，単価，本日日付','貸出期間，本日日付','単価，返却予定年月日','単価，返却予定年月日，本日日付'],
  e: [['インヘリタンス','カプセル化'],['インヘリタンス','ポリモーフィズム'],['カプセル化','インヘリタンス'],['カプセル化','ポリモーフィズム'],['ポリモーフィズム','インヘリタンス'],['ポリモーフィズム','カプセル化']],
};
export function rentalReference(bundle: boolean, priceScale: number) {
  const assets = [
    {asset: 1, product: 'C529157', days: 1, fee: 130 * priceScale},
    bundle ? {asset: 2, product: 'C529157', days: 1, fee: 130 * priceScale} : {asset: 2, product: 'D700557', days: 2, fee: 200 * priceScale},
    {asset: 3, product: 'B905668', days: 2, fee: 100 * priceScale}, {asset: 4, product: 'B905669', days: 7, fee: 150 * priceScale},
  ];
  const groups = new Map<string, typeof assets>();
  for (const asset of assets) { const key = bundle ? asset.product + '/' + asset.days : String(asset.asset); groups.set(key,[...(groups.get(key) ?? []),asset]); }
  const multiplicities = [1,2,3,4,5].map(id=>[...groups.values()].filter(group=>group.some(asset=>asset.asset===id)).length);
  const b1 = Math.min(...multiplicities)+'..'+Math.max(...multiplicities);
  const b2 = [...groups.values()].some(group=>group.length>1)?'1..*':'1';
  return {assets,groups,multiplicities,total:assets.reduce((sum,x)=>sum+x.fee,0),loanDates:new Set(assets.map(x=>x.days)).size,
    detailCount:groups.size,b1,b2};
}
export class ProductInfo { constructor(readonly productCode:string,readonly name:string) {} summary():string { throw Error('ABSTRACT'); } }
export class CompactDisc extends ProductInfo { constructor(readonly arranger:string,readonly minutes:number){super('C1','音楽');} summary(){return this.arranger+'，'+this.minutes+'分';} }
export class MovieDisc extends ProductInfo { constructor(readonly director:string,readonly actor:string,readonly minutes:number){super('D1','映画');} summary(){return this.director+'，'+this.actor+'，'+this.minutes+'分';} }
export class Book extends ProductInfo { constructor(readonly author:string,readonly pages:number,readonly isbn:string){super('B1','書籍');} summary(){return this.author+'，'+this.pages+'ページ，'+this.isbn;} }
export const qualityRegion = (size:number,tests:number,bugs:number) => bugs>6*size?'Ⅰ':tests<80*size?'Ⅱ':bugs>=4*size?'Ⅲ':'Ⅳ';
export const qualitySatisfied = (size:number,tests:number,bugs:number) => tests>=80*size&&bugs>=4*size&&bugs<=6*size;
export type Fraction = readonly [bigint,bigint];
const gcd=(a:bigint,b:bigint):bigint=>b===0n?a:gcd(b,a%b);
export function fraction(n:bigint|number,d:bigint|number=1):Fraction{let a=BigInt(n),b=BigInt(d);if(b<0){a=-a;b=-b;}const g=gcd(a<0n?-a:a,b);return[a/g,b/g];}
export const add=(a:Fraction,b:Fraction)=>fraction(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);
export const multiply=(a:Fraction,b:Fraction)=>fraction(a[0]*b[0],a[1]*b[1]);
export const divide=(a:Fraction,b:Fraction)=>fraction(a[0]*b[1],a[1]*b[0]);
export const compare=(a:Fraction,b:Fraction)=>a[0]*b[1]<b[0]*a[1]?-1:a[0]*b[1]>b[0]*a[1]?1:0;
export function roundMoney(a:Fraction){const cents=(a[0]*100n*2n+a[1])/(a[1]*2n);return (cents/100n)+'.'+String(cents%100n).padStart(2,'0');}
export function financeReference(scale:number,discount= fraction(1,10),baseDelta=0) {
  const base=fraction(10*scale+baseDelta),flows:Fraction[]=[];
  for(let year=1;year<=7;year++)flows.push(multiply(year===1?base:flows.at(-1)!,year===1?fraction(11,10):year<=4?fraction(21,20):fraction(103,100)));
  const factor=add(fraction(1),discount);let power=fraction(1),value=fraction(0);
  for(const cash of flows){power=multiply(power,factor);value=add(value,divide(cash,power));}
  value=add(value,divide(flows[6],multiply(discount,power)));
  return{base,flows,d:flows[1],e:divide(flows[0],factor),value};
}
/** Declarative formatting by the first activating digit and the positive
 * last-digit boundary. No mutable signif machine is used here. */
export function formatReference(pattern:string,value:string) {
  const positions=[...pattern].flatMap((c,i)=>c==='□'||c==='■'?[i]:[]),digits=value.slice(0,-1),positive=value.endsWith('+'),fill=pattern[0],
    first=[...digits].findIndex((digit,i)=>digit!=='0'||pattern[positions[i]]==='■'&&(!positive||i<digits.length-1));
  return [...pattern].map((char,pos)=>{
    const digitIndex=positions.indexOf(pos);
    if(digitIndex>=0){if(first<0||digitIndex<first)return fill;if(digitIndex===first&&digits[digitIndex]==='0')return fill;return digits[digitIndex];}
    return first>=0&&pos>positions[first]&&(!positive||pos<positions.at(-1)!)?char:fill;
  }).join('');
}
/** The nine reviewed source-table cases. Explicit disjoint predicates are a
 * different reference from the production update implementation. */
export function transitionReference(control:'□'|'■'|'literal',active:boolean,digit:string,next:string){
  const row=control==='literal'?(active?9:8):active?(next==='+'?7:6):digit==='0'?(control==='□'?1:next==='+'?3:2):next==='+'?5:4;
  const replaced = [1,2,3,8].includes(row)?'fill':[4,5,6,7].includes(row)?'digit':'unchanged';
  return{row,replaced,active:[2,4,6,9].includes(row)};
}

export const reviewedQ6Knowledge = {
  a: [ ['品質不良','品質良好','テスト不足である'], ['品質良好','品質不良','テスト不足である'], ['品質不良','品質良好','テストの内容と摘出したバグの内容から品質を評価する'], ['品質良好','品質不良','テストの内容と摘出したバグの内容から品質を評価する'] ],
  c: ['テスト密度は基準を満たしているが，バグ摘出率は基準範囲の下限に満たない','テスト密度は基準を満たしているが，バグ摘出率は基準範囲の上限を超えている','バグ摘出率，テスト密度とも基準を満たしていない','バグ摘出率，テスト密度とも基準を満たしている'],
  d: ['プログラムのソースコードが詳細設計書を正確に反映していることを点検した','プログラムのソースコードに関する記述規定どおりに，プログラムが記述されていることを点検した','プログラムのソースコードに文法上の誤りがないことを点検した'],
  e: ['テストケースが特定の処理の流れを重点的に確認するように作成されている','テストケースが全ての処理の流れを網羅的に確認できるように作成されている','テストケースについて，実データを使用した環境で確認している','テストケースを実行する手順について，正しく定められている'],
  f: ['摘出したバグが修正されていることを確認し','テストの実施が不足している処理の流れに対してテストケースを追加して再度単体テストを実施し','テストの実施方法に問題がないことを確認し','バグを摘出した処理の流れに対して，テストケースを追加して再度単体テストを実施し'],
};
export const reviewedQ7Knowledge = {
  a: ['(1)と(2)の二つだけ','(1)と(3)の二つだけ','(2)と(3)の二つだけ','(1)〜(3)の全て'],
  b: ['本業で得た利益に加えて，銀行からの借入れを増やして投資','本業で得た利益に加えて，手持ちの資産を現金化して債務返済や株主還元','本業で得た利益を投資に回すとともに，債務返済や株主還元'],
  c: ['FCFだけは','売上高営業利益率と総資産経常利益率だけは','売上高営業利益率，総資産経常利益率及びFCFの全てを'],
  f: ['大きく','小さく'],
  g: ['B社がT社の企業価値を算出するときに使っている割引率を0.12に上げる。','T社の2016年度の銀行からの借入れの予測額を減らす。','T社の2016年度の設備投資の予測額を増やす。','T社の2016年度の販管費の予測額を減らす。'],
  moneyCents: [909,984,1000,1003,1050,1082,1100,1103,1155,1210],
};
export const editConditionMeaning:Record<string,(digit:string,next:string)=>boolean> = {
  '“1”≦Value[v] and Value[v]≦“9”':digit=>digit>='1'&&digit<='9',
  'Value[v]＝“0”':digit=>digit==='0',
  'Value[v＋1]＝“－”':(_digit,next)=>next==='-',
  'Value[v＋1]＝“＋”':(_digit,next)=>next==='+',
  'Value[v＋1]≠“－”':(_digit,next)=>next!=='-',
  'Value[v＋1]≠“＋”':(_digit,next)=>next!=='+',
};
