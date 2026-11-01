import {autumn2016Am4180Cases as cases} from './legacy-2016-autumn-am-41-80-models';
export const autumn2016Am4180Profiles={marketing:'legacy-2016-autumn-am-marketing',bom:'legacy-2016-autumn-am-bom',oc:'legacy-2016-autumn-am-oc',inventory:'legacy-2016-autumn-am-inventory'} as const;
export const autumn2016Am4180FigureDomains={
 [autumn2016Am4180Profiles.marketing]:[[0,0]] as readonly(readonly number[])[],
 [autumn2016Am4180Profiles.bom]:cases.bom.map((v,index)=>[index,...v]),
 [autumn2016Am4180Profiles.oc]:cases.oc.flatMap((v,index)=>[0,1,2,3].map(role=>[role,index,...v])),
 [autumn2016Am4180Profiles.inventory]:cases.inventory.map((v,index)=>[index,...v]),
};
export function autumn2016Am4180FigureAllowed(profile:string,values:readonly number[]):boolean{
 const ds=autumn2016Am4180FigureDomains[profile as keyof typeof autumn2016Am4180FigureDomains];return Boolean(ds?.some(v=>v.length===values.length&&v.every((x,i)=>x===values[i])));
}
export function autumn2016Am4180FigureAlt(profile:string,values:readonly number[]):string{
 if(!autumn2016Am4180FigureAllowed(profile,values))throw Error(Object.hasOwn(autumn2016Am4180FigureDomains,profile)?'FIGURE_VALUE':'FIGURE_PROFILE');
 if(profile===autumn2016Am4180Profiles.marketing)return '左右に並ぶ同じ大きさの二つの枠。左枠の見出しは4Pで，上からProduct（製品），Price（価格），Place（場所），Promotion（販売促進）の四つの小枠。右枠の見出しは4Cで，上からa，b，c，dの四つの小枠。左右で同じ高さの小枠をそれぞれ右向き矢印で結ぶ。';
 if(profile===autumn2016Am4180Profiles.bom){const[,q,b,d,c,s]=values;return `製品Aの部品構成木。最上段Aから左にB（${b}），右にC（${d}）へ分岐する。Bから下段のD（1），E（1），C（${c}）へ分岐する。括弧は上位1個当たりの所要数量であり，生産数量${q}個と在庫${s}個は本文にある。`;}
 if(profile===autumn2016Am4180Profiles.inventory){const[i,m,s,k,x]=values;return `縦軸は在庫量，横軸は時間で，原点に0。上から最大在庫量，発注点K${i?`（${k}個）`:""}，X${i?`（${x}）`:''}，安全在庫量S${i?`（${s}）`:''}の水平線。実線の在庫は最大からSへ減少し，納品aで垂直に最大へ戻り，再びSへ減少して納品bで最大へ戻る。発注a・bは在庫がKになる時点の下にある。発注aから納品aまでを調達期間と示す。発注量Eは最大からSまでの縦の両矢印。Xの破線は納品aの直前の予測を示し，右に左向き矢印と①がある。`;}
 const[role,,...cs]=values;const order=role===0||role===3?[...cs].reverse():cs;
 return `数値目盛なしのOC曲線の図。横軸は右向き，縦軸は上向き，原点に0。三つの曲線は左上から右下へ向かう。${role<2?'曲線は交差せず，左から順に':'曲線は左上付近で互いに交差し，右下側では左から順に'}c＝${order.join('，c＝')}と記されている。`;
}
/** Curves are schematic rendering coordinates, not original N or n measurements. */
export function autumn2016OcGeometry(values:readonly number[]){
 if(!autumn2016Am4180FigureAllowed(autumn2016Am4180Profiles.oc,values))throw Error('FIGURE_VALUE');
 const[role,,...cs]=values;const labels=role===0||role===3?[...cs].reverse():cs;
 return labels.map((label,rank)=>{const end=.5+rank*.22,exponent=Math.log(.1)/Math.log(.17/end);
 const points=Array.from({length:45},(_,i)=>{const x=i/44;let y=0;
  if(role<2){const threshold=cs[rank];for(let k=0;k<=threshold;k++){let choose=1;for(let j=1;j<=k;j++)choose=choose*(6-j+1)/j;y+=choose*x**k*(1-x)**(6-k);}}
  else y=x>=end?0:Math.max(0,(1-(x/end)**exponent)**1.5);
  return[x,y] as const;});return{label,points};});
}
