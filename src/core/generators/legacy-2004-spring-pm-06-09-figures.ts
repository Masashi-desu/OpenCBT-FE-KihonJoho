import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';

export const categoryCounts = [13,8,11,15] as const;
const profile = 'legacy-2004-spring-pm-7-record-layout';
export function recordFields(index: number) {
  const item=selectCase([index],6);
  const employee={name:'社員番号',digits:6}, score={name:'英語の点数',digits:3};
  if(item===4)return {fixed:[employee,score]};
  if(item===5)return {fixed:[employee,{name:'区分',digits:2}]};
  const count=categoryCounts[item];
  return {
    fixed:[employee,score], group:'情報処理技術資格情報',
    detail:[{name:'区分領域1',digits:2},{name:'区分領域2',digits:2},{name:'…',digits:0},{name:'区分領域'+count,digits:2}],
  };
}
function description(index: number) {
  const {fixed,group,detail}=recordFields(index);
  const fields=fixed.map(item=>item.name+item.digits+'けた').join('、');
  if(!group||!detail)return '左から'+fields+'。';
  return '左から'+fields+'、'+group+'。'+detail[0].name+'から'+detail.at(-1)!.name+'まで、それぞれ2けた。';
}
export const legacy2004SpringPm0609Figures: readonly BookletFigureDefinition[] = [{
  profile, domain:[[0,5]],
  validate(values){ selectCase(values,6); },
  alt(values){ return description(selectCase(values,6)); },
}];
export function recordLayout(condition: number, kind: number, caption: string) {
  const index=kind===0?condition:3+kind;
  return {...figure(profile,[index],caption,description(index)),captionPresentation:'accessible' as const};
}
