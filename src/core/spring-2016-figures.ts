import type { Scene } from './types';
import { DataError } from './errors';
import domains from './generators/legacy-2016-spring-fundamentals-figure-domains.json';
import { spring2016FigureAlt } from './generators/legacy-2016-spring-fundamentals';
import { spring2016CommonProfile, spring2016CommonAlt } from './generators/legacy-2016-spring-am-common';
import { am2016FigureFields, am2016FigureAlt } from './generators/legacy-2016-spring-am-09-32-figure-models';
import { legacy2016SpringAm3356FlowValues, legacy2016SpringAm3356FlowAlt } from './generators/legacy-2016-spring-am-33-56';
import { spring2016Am5780Profiles, spring2016Am5780FigureAlt, spring2016ParetoDomains } from './generators/legacy-2016-spring-am-57-80-figures';

export const spring2016FigureDomains: Record<string, number[][]> = {
  ...Object.fromEntries(Object.entries(domains).map(([profile, domain]) => [profile, domain.fields])),
  [spring2016CommonProfile]: [[0,0]],
  ...am2016FigureFields,
  'legacy-2016-spring-am-49':legacy2016SpringAm3356FlowValues[0].map((_,i)=>[Math.min(...legacy2016SpringAm3356FlowValues.map(v=>v[i])),Math.max(...legacy2016SpringAm3356FlowValues.map(v=>v[i]))]),
  [spring2016Am5780Profiles.ppm]:[[0,0]],
  [spring2016Am5780Profiles.pareto]:[[0,3],[0,spring2016ParetoDomains.length-1]],
};
export const isSpring2016Figure = (profile: string) => Object.hasOwn(spring2016FigureDomains, profile);
export function readSpring2016Figure(scene: Extract<Scene, { kind: 'source_figure' }>) {
  try { return readRegisteredFigure(scene); }
  catch(error) {
    if(error instanceof Error && ['FIGURE_PROFILE','FIGURE_VALUE','PARAMETER_CONSTRAINT'].includes(error.message))
      throw new DataError('FIGURE_PROFILE', '2016年度春期の登録図の入力域が一致しません');
    throw error;
  }
}
function readRegisteredFigure(scene: Extract<Scene, { kind: 'source_figure' }>) {
  if (Object.hasOwn(am2016FigureFields,scene.profile)) return am2016FigureAlt(scene.profile,scene.values);
  if(scene.profile==='legacy-2016-spring-am-49') return legacy2016SpringAm3356FlowAlt(scene.values);
  if(Object.values(spring2016Am5780Profiles).some(p=>p===scene.profile)) return spring2016Am5780FigureAlt(scene.profile,scene.values);
  const fields = spring2016FigureDomains[scene.profile];
  if (!fields || scene.values.length !== fields.length || scene.values.some((v, i) =>
    !Number.isInteger(v) || v < fields[i][0] || v > fields[i][1]))
    throw new DataError('FIGURE_PROFILE', '2016年度春期の登録図の入力域が一致しません');
  return scene.profile===spring2016CommonProfile ? spring2016CommonAlt() : spring2016FigureAlt(scene.profile, scene.values);
}
