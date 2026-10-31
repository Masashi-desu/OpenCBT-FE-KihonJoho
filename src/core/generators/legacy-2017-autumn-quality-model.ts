/** Source-form diagram data; internal point names are never displayed as labels. */
export const legacy2017AutumnQualityProfile='legacy-2017-project-critical-path';
export const qualityCriticalDurations=[
 [2,3,3,1,1,3,4,3,2,2,2,3],
 [2,3,3,2,2,3,4,4,2,2,2,3],
 [2,2,3,1,1,4,4,3,3,2,2,3],
] as const;
export const qualityCriticalNodes=[
 {id:'start',x:55,y:260,name:'左端の結合点'},
 {id:'left',x:170,y:260,name:'中央段左の結合点'},
 {id:'middle',x:305,y:260,name:'中央段の左から二つ目の結合点'},
 {id:'upper',x:305,y:40,name:'上段左の結合点'},
 {id:'center',x:455,y:260,name:'中央段の左から三つ目の結合点'},
 {id:'lower',x:455,y:480,name:'下段の結合点'},
 {id:'topRight',x:605,y:40,name:'上段右の結合点'},
 {id:'right',x:605,y:260,name:'中央段の左から四つ目の結合点'},
 {id:'end',x:755,y:260,name:'右端の結合点'},
] as const;
export const qualityCriticalEdges=[
 ['start','left','A'],['left','upper','B'],['left','middle','C'],['middle','upper','D'],['upper','center','E'],['middle','center','F'],['middle','lower','G'],['center','topRight','H'],['center','right','I'],['lower','right','J'],['topRight','end','K'],['right','end','L'],
] as const;
export function qualityCriticalValues(values:readonly number[]){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>2)throw Error('PARAMETER_CONSTRAINT');return qualityCriticalDurations[values[0]];}
export function qualityCriticalAlt(values:readonly number[]){const w=qualityCriticalValues(values);return '9個の丸とAからLの12本の作業矢印。凡例では矢印の上が作業名、下が所要日数。'+qualityCriticalEdges.map(([a,b,k],i)=>`${qualityCriticalNodes.find(n=>n.id===a)!.name}から${qualityCriticalNodes.find(n=>n.id===b)!.name}へ、作業${k}、${w[i]}日。`).join('');}
export function qualityCriticalSolution(values:readonly number[]){const w=qualityCriticalValues(values),times:Record<string,number>={start:0},paths:Record<string,string[]>={start:['']};
 for(const n of qualityCriticalNodes){if(n.id==='start')continue;const incoming=qualityCriticalEdges.map((e,i)=>({e,i})).filter(({e})=>e[1]===n.id);const max=Math.max(...incoming.map(({e,i})=>times[e[0]]+w[i]));times[n.id]=max;paths[n.id]=incoming.filter(({e,i})=>times[e[0]]+w[i]===max).flatMap(({e})=>paths[e[0]].map(p=>p+e[2]));}
 return {days:times.end,paths:paths.end,weights:Object.fromEntries(qualityCriticalEdges.map((e,i)=>[e[2],w[i]]))};
}
