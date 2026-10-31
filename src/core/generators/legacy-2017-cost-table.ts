/** Data only for the original four-row, two-level cost table. Unit: people
 * assigned in each month (人), not a rate in people/month. */
export const legacy2017CostProfile="legacy-2017-development-cost-table";
export function legacy2017CostTable(values:number[]){
 if(values.length!==4||values.some(n=>!Number.isInteger(n)||n<0||n>2))throw Error("PARAMETER_CONSTRAINT");
 const purchase=1600+400*values[0],external=3200+300*values[1],create=40+20*values[2],other=80+20*values[3];
 const rows=[
  ["ア","サンプルを購入して社内で改造",String(purchase),"0","0","4","1"],
  ["イ","社外に一括委託","0",String(external),"0","0","0"],
  ["ウ","社内資産を改造","0","0","0","10","3"],
  ["エ","社内で新規作成","0","0","10","0","2"],
 ];return {purchase,external,create,other,rows};
}
export function legacy2017CostTableAlt(values:number[]){const {rows}=legacy2017CostTable(values);return "原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。"+rows.map(r=>r.join("、")).join("。");}
