/** Unregistered annual PM8 model. The graph and trace are question data, never
 * a request to execute a program supplied by a question or learner. */
const edgeEnds=[[0,1],[0,2],[0,3],[1,4],[2,4],[2,5],[3,5],[4,6],[5,6]] as const;
const weightCases=[
 [2,8,4,3,2,3,8,9,3],[2,8,4,2,2,3,8,9,3],
 [2,9,4,3,2,2,8,8,3],[3,9,5,3,2,3,8,9,4],
 [2,9,5,4,2,3,8,9,2],[3,9,5,4,1,3,9,8,3],
 [2,8,4,3,1,3,9,8,3],[2,8,5,3,2,3,8,9,3],
] as const;
export type Legacy2017Pm8Trace={point:number;distances:number[];previous:number[];fixed:boolean[]};
export function legacy2017Pm8Model(scenario:number){
 if(!Number.isInteger(scenario)||scenario<0||scenario>=weightCases.length)throw Error("PARAMETER_CONSTRAINT");
 const weights=weightCases[scenario],edges=edgeEnds.map(([from,to],i)=>({from,to,distance:weights[i]})),matrix:number[][]=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>i===j?0:-1));for(const edge of edges)matrix[edge.from][edge.to]=matrix[edge.to][edge.from]=edge.distance;
 const distances=Array(7).fill(Infinity),previous=Array(7).fill(0),fixed=Array(7).fill(false),trace:Legacy2017Pm8Trace[]=[];distances[0]=0;
 while(true){let i=0;while(i<7&&fixed[i])i++;if(i===7)break;for(let j=i+1;j<7;j++)if(!fixed[j]&&distances[j]<distances[i])i=j;const point=i;fixed[point]=true;for(let j=0;j<7;j++)if(matrix[point][j]>0&&!fixed[j]){const newDistance=distances[point]+matrix[point][j];if(newDistance<distances[j]){distances[j]=newDistance;previous[j]=point;}}trace.push({point,distances:[...distances],previous:[...previous],fixed:[...fixed]});}
 const reverse=[6];while(reverse.at(-1)!==0){if(reverse.length>=7)throw Error("ROUTE_CONSTRAINT");reverse.push(previous[reverse.at(-1)!]);}
 const third=trace[2],futureVia2=distances[5],prematureVia2=matrix[0][2]+matrix[2][5],currentVia3=third.distances[5],prematureTo6=third.distances[4]+matrix[4][6];if(trace.slice(0,3).map(t=>t.point).join(",")!=="0,1,3"||!(futureVia2<prematureVia2&&prematureVia2<currentVia3)||third.distances[6]!==Infinity)throw Error("TRACE_CONSTRAINT");
 const fChoices=[futureVia2,prematureVia2,currentVia3].flatMap(value=>[prematureTo6,Infinity].map(last=>[...third.distances.slice(0,5),value,last]));
 const gChoices=[[0,0,0,0,1,3,0],[0,0,0,0,1,3,5],[0,0,0,0,2,2,0],[0,0,0,0,2,2,5],[0,0,4,0,1,2,0],[0,0,4,0,2,2,5]];
 if(new Set(fChoices.map(row=>row.join(","))).size!==6||new Set(gChoices.map(row=>row.join(","))).size!==6)throw Error("CHOICE_CONSTRAINT");
 return {scenario,weights:[...weights],edges,matrix,trace,distance:distances[6],reverse,fChoices,gChoices};
}
export const legacy2017Pm8ArrayText=(values:number[])=>values.map(n=>Number.isFinite(n)?String(n):"∞").join(", ");
