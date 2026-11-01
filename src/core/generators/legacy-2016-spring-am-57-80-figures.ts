/** Source-local shapes. Values are drawing inputs, not invented original measurements. */
export const spring2016Am5780Profiles={ppm:'legacy-2016-spring-am-ppm',pareto:'legacy-2016-spring-am-pareto'} as const;
export const spring2016ParetoDomains:readonly(readonly number[])[]=[
 [6,4,2,1,1],[9,5,3,2,1],[10,6,3,2,1],[8,5,3,2,1],
 [12,7,4,2,1],[7,5,4,2,1],[11,8,5,3,1],[10,7,4,3,2],
 [9,6,4,2,1],[8,6,4,3,1],[12,9,5,3,2],[11,7,5,2,1],
];
export type Spring2016ParetoGeometry={bars:number[];line:number[];drawingRange:number;role:number;caseIndex:number};
export function spring2016ParetoGeometry(values:readonly number[]):Spring2016ParetoGeometry{
 const[role,caseIndex]=values;
 if(values.length!==2||!Number.isInteger(role)||role<0||role>3||!Number.isInteger(caseIndex)||!spring2016ParetoDomains[caseIndex])throw Error('FIGURE_VALUE');
 const descending=[...spring2016ParetoDomains[caseIndex]],total=descending.reduce((a,b)=>a+b,0);
 const bars=role===1?[descending[0]*2,descending[0],descending[1],descending[2]]:role===2?[descending[4],descending[3],descending[2]*1.25,descending[1]*1.25,descending[0]*5/3]:role===3?[descending[0]/2,descending[0],descending[0]*2,descending[0],descending[0]/2]:descending;
 const line=role===0||role===2?[0,...bars.map((_,i)=>bars.slice(0,i+1).reduce((a,b)=>a+b,0))]:role===1?[bars[0]*1.25,...bars,0]:[0,...bars.slice(0,-1),0];
 const drawingRange=role===1?line[0]:role===3?bars[2]:role===2?line.at(-1)!:total;return{bars,line,drawingRange,role,caseIndex};
}
export function spring2016Am5780FigureAlt(profile:string,values:readonly number[]):string{
 if(profile===spring2016Am5780Profiles.ppm){if(values.length!==1||values[0]!==0)throw Error('FIGURE_VALUE');return '同じ大きさの四つの領域からなる2行2列のマトリックス。横軸の見出しは「事業の強み（市場シェア）」で左が強、右が弱。縦軸の見出しは枠の左に「事業の魅力度（市場成長率）」と縦書きされ，高・低の表示は枠の右で上が高，下が低。各領域の内部には文字や記号がない。';}
 if(profile!==spring2016Am5780Profiles.pareto)throw Error('FIGURE_PROFILE');
 const g=spring2016ParetoGeometry(values);
 return `横軸と縦軸があり，数値目盛や凡例はない。${g.bars.length}本の接する棒と1本の折れ線。${['棒は左から高い順。折れ線は原点から各棒の右端まで順に上昇し，後半ほど増分が小さい。','棒は左から高い順。折れ線は左上から各棒の右上を経て右下へ減少し，最後の棒の更に右で横軸へ達する。','棒は左から低い順。折れ線は原点から順に上昇し，後半ほど増分が大きい。','棒は中央が最大の山型。折れ線は原点から棒の右端の高さを結び，中央へ上昇した後に横軸へ下降する。'][g.role]}`;
}
