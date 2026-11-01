import type {Scene} from './types';
import {DataError} from './errors';
import {autumn2016CommonAlt,autumn2016CommonProfile} from './generators/legacy-2016-autumn-am-common';
import {legacy2016AutumnAm0140FigureDomains,legacy2016AutumnAm0140FigureAllowed,legacy2016AutumnAm0140FigureAlt} from './generators/legacy-2016-autumn-am-01-40-figures';
import {autumn2016Am4180FigureDomains,autumn2016Am4180FigureAllowed,autumn2016Am4180FigureAlt} from './generators/legacy-2016-autumn-am-41-80-figures';

export const autumn2016FigureDomains:Record<string,number[][]>={
  ...Object.fromEntries(Object.entries({...legacy2016AutumnAm0140FigureDomains,...autumn2016Am4180FigureDomains}).map(([profile,rows])=>{
    if(!rows.length||!rows.every(r=>r.length===rows[0].length&&r.every(Number.isInteger)))throw Error('AUTUMN_2016_FIGURE_DOMAIN');
    return[profile,rows[0].map((_,i)=>[Math.min(...rows.map(r=>r[i])),Math.max(...rows.map(r=>r[i]))])];
  })),
  [autumn2016CommonProfile]:[[0,0]],
};
export const isAutumn2016Figure=(profile:string)=>Object.hasOwn(autumn2016FigureDomains,profile);
export function readAutumn2016Figure(scene:Extract<Scene,{kind:'source_figure'}>):string{
  const fields=autumn2016FigureDomains[scene.profile];
  if(!fields||!Array.isArray(scene.values)||scene.values.length!==fields.length||scene.values.some((v,i)=>
    !Number.isInteger(v)||v<fields[i][0]||v>fields[i][1]))
    throw new DataError('FIGURE_PROFILE','2016年度秋期の登録図の入力域が一致しません');
  if(scene.profile===autumn2016CommonProfile)return autumn2016CommonAlt();
  if(Object.hasOwn(legacy2016AutumnAm0140FigureDomains,scene.profile)){
    if(!legacy2016AutumnAm0140FigureAllowed(scene.profile,scene.values))throw new DataError('FIGURE_PROFILE','2016年度秋期の登録図の条件が一致しません');
    return legacy2016AutumnAm0140FigureAlt(scene.profile,scene.values);
  }
  if(Object.hasOwn(autumn2016Am4180FigureDomains,scene.profile)){
    if(!autumn2016Am4180FigureAllowed(scene.profile,scene.values))throw new DataError('FIGURE_PROFILE','2016年度秋期の登録図の条件が一致しません');
    return autumn2016Am4180FigureAlt(scene.profile,scene.values);
  }
  throw new DataError('FIGURE_PROFILE','2016年度秋期の登録図がありません');
}
