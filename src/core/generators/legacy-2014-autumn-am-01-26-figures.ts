import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { am2016FigureAlt } from './legacy-2016-spring-am-09-32-figure-models';
import {
  am2016LogicKinds, am2016Profiles,
} from './legacy-2016-spring-am-09-32-models';

const prefix = 'legacy-2014-autumn-am-';
export const autumn2014Am0126Profiles = {
  tasks: prefix+'17-task-resources',
  logic: prefix+'21-circuit',
  gate: prefix+'21-gate',
  timeline: prefix+'23-operation',
} as const;
const f = autumn2014Am0126Profiles;
export const logicKinds = am2016LogicKinds;
export const logicAdapterProfiles = am2016Profiles;
export const taskCases = [
  [[10,50,60],[40,50,30]], [[45,40,25],[15,55,35]], [[20,30,80],[35,55,35]], [[15,40,30],[35,50,20]],
] as const;
export const operationCases = [
  { tick:30, current:10, on:[1,1,0,1] }, { tick:20, current:12, on:[1,0,1,1] },
  { tick:15, current:8, on:[1,0,0,1] }, { tick:30, current:6, on:[1,0,1,0] },
] as const;

const descriptors: Record<string,{last:number; alt:(index:number)=>string}> = {
  [f.tasks]: {
    last:taskCases.length-1,
    alt:index=>'左からCPU、資源R、CPUの順に実行。'+taskCases[index].map((times,i)=>
      'タスク'+'AB'[i]+'：CPU '+times[0]+'ミリ秒→資源R '+times[1]+'ミリ秒→CPU '+times[2]+'ミリ秒。').join(''),
  },
  [f.logic]:{last:logicKinds.length-1,alt:index=>am2016FigureAlt(am2016Profiles.logic,logicKinds[index])},
  [f.gate]:{last:3,alt:index=>am2016FigureAlt(am2016Profiles.gate,[index])},
  [f.timeline]:{
    last:operationCases.length-1,
    alt:index=>{
      const {tick,on}=operationCases[index];
      return '縦軸は運転・停止、横軸は分。目盛は'+[0,1,2,3,4].map(i=>i*tick).join('、')+'。'+on.map((run,i)=>
        i*tick+'分から'+(i+1)*tick+'分まで'+(run?'運転':'停止')+'。').join('');
    },
  },
};

export const legacy2014AutumnAm0126Figures:BookletFigureDefinition[] = Object.entries(descriptors).map(([profile,d])=>({
  profile,domain:[[0,d.last]],
  validate(values) {
    if(values.length!==1 || !Number.isSafeInteger(values[0]) || values[0]<0 || values[0]>d.last)throw Error('FIGURE_DOMAIN');
  },
  alt:([index])=>d.alt(index),
}));
export function autumn2014Am0126Diagram(profile:string,index:number,caption:string) {
  const d=legacy2014AutumnAm0126Figures.find(f=>f.profile===profile);
  if(!d)throw Error('FIGURE_PROFILE');
  d.validate([index]);
  return figure(profile,[index],caption,d.alt([index]));
}
