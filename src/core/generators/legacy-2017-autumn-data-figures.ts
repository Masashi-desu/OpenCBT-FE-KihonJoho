import domains from './legacy-2017-autumn-data-figure-domains.json';
export const legacy2017AutumnDataProfiles={logic:'legacy-2017-logic-six-gates',uml:'legacy-2017-uml-departments'} as const;
export function validateLegacy2017AutumnDataFigure(profile:string,values:readonly number[]){
 const domain=domains[profile as keyof typeof domains];
 if(!domain)throw Error('FIGURE_PROFILE');
 if(values.length!==domain.length||values.some((v,i)=>!Number.isInteger(v)||v<domain[i][0]||v>domain[i][1]))throw Error('FIGURE_DOMAIN');
}
export function legacy2017AutumnDataFigureAlt(profile:string,values:readonly number[]){
 validateLegacy2017AutumnDataFigure(profile,values);const[v,part]=values;
 if(profile===legacy2017AutumnDataProfiles.logic){
  if(part===0)return `ディジタル回路。入力Aは上側ANDと上側NOTへ、入力Bは下側ANDと下側NOTへ分岐する。二つのNOTの出力は中央ORの二入力に接続し、中央ORの出力は上下のANDの残る入力へ分岐する。上下のANDの出力を最後の${v===0?'OR':'出力に否定の小円を付けたOR'}へ接続し、その出力がXになる。黒丸はA、B、中央ORの出力の三つの分岐点。`;
  const expressions=['X＝A・B＋（A・B全体の否定）。','X＝A・B＋（Aの否定）・（Bの否定）。','X＝A・（Bの否定）＋（Aの否定）・B。',v===0?'X＝（Aの否定＋B）・（A＋Bの否定）。':'X＝（A＋B）・（Aの否定＋Bの否定）。'];
  return expressions[part-1]+'＋は論理和、・は論理積。';
 }
 const employee=v===2?'0..*':'1..*',manager=v===1?'1':'0..1';
 return `データモデル。上に部門と社員、下に事業部の三クラス。事業部から部門へ中空三角が向く汎化。部門と社員の関連「所属する」は黒三角が左を向き、部門端1、社員端${employee}。部門と事業部の関連「管理する」は黒三角が上を向き、部門端1..*、事業部端${manager}。黒三角は関連名の読み順。`;
}
