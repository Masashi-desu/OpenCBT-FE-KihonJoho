/** Autumn Q5 source candidate. No questionnaire expressions are included.
 * Numeric domains/rules are reviewed facts; generated rows test the same flow. */
export type StressRow=readonly[A:number,B:number,C:number];
export type StressPath='H'|'MH'|'ML'|'L';
export const autumnStressSource='2019r01a-fe-pm-5';
export const autumnStressFacts={counts:{A:17,B:29,C:9,D:2},ratingMinimum:1,ratingMaximum:4,highB:77,middleB:63,highAC:76}as const;
export const autumnStressBanks=[
 [1,2,3],[1,2,4],[1,3,6],[2,4,6],[4,5,6],
 [1,2,3,4],[1,3,4,5],[1,4,5,6],[2,3,4,5],[2,4,5,6],
]as const;
export const autumnStressConditions=['62点以下','62点以上','63点以下','63点以上','63点以上かつ76点以下','63点以上かつ77点以下','75点以下','76点以上']as const;
export const autumnStressOriginalRows:readonly StressRow[]=[[34,63,18],[34,87,27],[34,63,36],[51,87,36],[51,58,36],[51,66,36]];
const basePaths:readonly StressPath[]=['ML','H','ML','H','L','MH'];
const pools:readonly Record<StressPath,readonly StressRow[]>[]=[
 {H:[[34,87,27],[51,87,36]],ML:[[34,63,18],[34,63,36]],L:[[51,58,36]],MH:[[51,66,36]]},
 {H:[[34,82,18],[51,90,27]],ML:[[34,65,27],[51,70,18]],L:[[51,60,36]],MH:[[51,72,36]]},
 {H:[[34,77,27],[51,78,36]],ML:[[51,63,24],[50,76,25]],L:[[51,62,25]],MH:[[51,63,25]]},
];
export function autumnStressClassify(row:StressRow){const[A,B,C]=row;if(![A,B,C].every(Number.isInteger)||A<17||A>68||B<29||B>116||C<9||C>36)throw Error('PARAMETER_CONSTRAINT');const sum=A+C;if(B>=77)return{result:1 as const,region:1 as const,path:'H' as const,sum};if(B<=62)return{result:0 as const,region:0 as const,path:'L' as const,sum};if(sum>=76)return{result:1 as const,region:2 as const,path:'MH' as const,sum};return{result:0 as const,region:0 as const,path:'ML' as const,sum};}
const regionBit=(p:StressPath)=>p==='H'?1:p==='MH'?2:4,pathBit=(p:StressPath)=>({H:1,MH:2,ML:4,L:8})[p];
function cover(paths:readonly StressPath[],mode:'region'|'path',indices:readonly number[]){return indices.reduce((m,n)=>m|(mode==='region'?regionBit:pathBit)(paths[n-1]),0);}
export function autumnStressCover(paths:readonly StressPath[],mode:'region'|'path'){const target=mode==='region'?7:15;let minimum=7;for(let mask=1;mask<64;mask++){const indices=Array.from({length:6},(_,i)=>i+1).filter(n=>(mask&(1<<(n-1)))!==0);if(cover(paths,mode,indices)===target)minimum=Math.min(minimum,indices.length);}const bank=autumnStressBanks.flatMap((indices,i)=>indices.length===minimum&&cover(paths,mode,indices)===target?[i]:[]);return{minimum,bank};}
function permutations(values:readonly StressPath[]):StressPath[][]{if(!values.length)return[[]];const result:StressPath[][]=[];for(const value of new Set(values)){const next=values.slice(),i=next.indexOf(value);next.splice(i,1);for(const suffix of permutations(next))result.push([value,...suffix]);}return result;}
const valid=permutations(basePaths).filter(p=>autumnStressCover(p,'region').bank.length===1&&autumnStressCover(p,'path').bank.length===1);
export const autumnStressCases:readonly(readonly StressPath[])[]=[basePaths,...valid.filter(p=>p.join(',')!==basePaths.join(','))];
export function autumnStressModel(values:readonly number[]){if(values.length!==2||!values.every(Number.isInteger)||values[0]<0||values[0]>=autumnStressCases.length||values[1]<0||values[1]>=pools.length)throw Error('PARAMETER_CONSTRAINT');const paths=autumnStressCases[values[0]],seen:Partial<Record<StressPath,number>>={};const rows=paths.map(p=>{const n=seen[p]??0;seen[p]=n+1;return pools[values[1]][p][n]});for(let i=0;i<6;i++)if(autumnStressClassify(rows[i]).path!==paths[i])throw Error('MODEL_CLASS');const e=autumnStressCover(paths,'region'),f=autumnStressCover(paths,'path');if(e.bank.length!==1||f.bank.length!==1)throw Error('MODEL_BANK');return{rows,paths,e:e.bank[0],f:f.bank[0],regionMinimum:e.minimum,pathMinimum:f.minimum,results:rows.map(autumnStressClassify)};}
export const autumnStressIndependentRatingExample=Array.from({length:9},(_,i)=>({id:'A'+String(i+1).padStart(2,'0'),scores:i<7?[4,3,2,1]:[1,2,3,4],selected:[0,0,1,2,2,0,3,3,2][i],score:[4,4,3,2,2,4,1,4,3][i]}));
export function autumnStressFigureAlt(profile:string,values:readonly number[]){autumnStressModel(values);if(profile==='legacy-2019-autumn-pm5-stress-range')return'横軸は領域A及びCの合計点の和26〜104、縦軸は領域Bの合計点29〜116。範囲①はBが77以上、範囲②はBが63以上76以下かつAとCの和が76以上。①②を網掛けし、それ以外は網掛けしない。';if(profile==='legacy-2019-autumn-pm5-stress-flow')return'開始、判別結果を0にする、Bの合計点を計算する、Bの判定を行う。左の77点以上は判別結果を1として終了。下の空欄aは終了。右の空欄bはAとCの合計点の和を計算し、和を判定する。左の空欄cは判別結果を1として終了。下の空欄dは終了。空欄a〜dは解答する対象。';throw Error('UNKNOWN_AUTUMN_FIGURE');}
