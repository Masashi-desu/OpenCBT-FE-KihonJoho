import type{BookletFigureDefinition}from'../booklet-figure-extension-contract';
import{panelAlt,type Panel}from'./legacy-2016-autumn-pm-09-13-support';
import{q9Panel,q9Profiles,legacy2016AutumnPm9Definition}from'./legacy-2016-autumn-pm-9';
import{q10Panel,q10Profiles}from'./legacy-2016-autumn-pm-10';
import{q11Panel,q11Profiles}from'./legacy-2016-autumn-pm-11';
import{q12Panel,q12Profiles}from'./legacy-2016-autumn-pm-12';
import{q13Panel,q13Profiles}from'./legacy-2016-autumn-pm-13';
const groups=[{number:9,count:legacy2016AutumnPm9Definition.fields[0].maximum+1,profiles:q9Profiles,panel:q9Panel},{number:10,count:9,profiles:q10Profiles,panel:q10Panel},{number:11,count:9,profiles:q11Profiles,panel:q11Panel},{number:12,count:8,profiles:q12Profiles,panel:q12Panel},{number:13,count:9,profiles:q13Profiles,panel:q13Panel}];
export function legacy2016AutumnPm0913Panel(profile:string,values:number[]):Panel{for(const group of groups){const suffix=profile.slice(`legacy-2016-autumn-pm-${group.number}-`.length);if(profile===`legacy-2016-autumn-pm-${group.number}-${suffix}`&&group.profiles.includes(suffix))return group.panel(suffix,values);}throw Error('FIGURE_PROFILE');}
export const legacy2016AutumnPm0913Figures:BookletFigureDefinition[]=groups.flatMap(group=>group.profiles.map(suffix=>({profile:`legacy-2016-autumn-pm-${group.number}-${suffix}`,domain:[[0,group.count-1]] as const,validate:(values:number[])=>{group.panel(suffix,values);},alt:(values:number[])=>panelAlt(group.panel(suffix,values))})));
