import {am2016Profiles as P,am2016LanCounts,am2016LogicKinds} from './legacy-2016-spring-am-09-32-models';
export const am2016FigureFields:Record<string,number[][]>={
 [P.lan]:[[2,4],[2,3]], [P.logic]:[[0,3],[0,3],[0,3],[0,3]], [P.gate]:[[0,3]],
};
export function assertAm2016Figure(profile:string,v:number[]) {
 const ranges=am2016FigureFields[profile];
 if(!ranges||v.length!==ranges.length||v.some((x,i)=>!Number.isInteger(x)||x<ranges[i][0]||x>ranges[i][1]))throw Error('FIGURE_PROFILE');
 if(profile===P.lan&&!am2016LanCounts.some(row=>row.every((x,i)=>x===v[i])))throw Error('FIGURE_PROFILE');
 if(profile===P.logic&&!am2016LogicKinds.some(row=>row.every((x,i)=>x===v[i])))throw Error('FIGURE_PROFILE');
}
export function am2016FigureAlt(profile:string,v:number[]) {
 assertAm2016Figure(profile,v);
 if(profile===P.lan)return `水平のLANバスから上へサーバ1台，下へ左からクライアント${v[0]}台，プリンタ${v[1]}台がそれぞれ枝分かれして接続されている。サーバとクライアントは矩形，プリンタは下辺が波形の文書形。`;
 if(profile===P.gate)return `入力AとBを${['OR','AND','XOR','NOR'][v[0]]}ゲートへ入れ，出力Yとする。`;
 const names=v.map(k=>['AND','NAND','OR','NOR'][k]);
 return `入力AとBを第1${names[0]}回路へ入れる。第1回路の出力とAを上側の第2${names[1]}回路へ，第1回路の出力とBを下側の第3${names[2]}回路へ入れる。第2と第3回路の出力を右側の第4${names[3]}回路へ入れ，出力をYとする。接続点は黒丸。第1〜第4は読上げ上の識別であり図には番号を表示しない。`;
}
