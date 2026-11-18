import { calculations2004AutumnAm0126 } from './legacy-2004-autumn-am-01-26-calculations';
import { knowledge2004AutumnAm0126 } from './legacy-2004-autumn-am-01-26-knowledge';

const numberOf=(source:string)=>Number(source.slice(source.lastIndexOf('-')+1));
export const legacy2004AutumnAm01To26Definitions=[...calculations2004AutumnAm0126,...knowledge2004AutumnAm0126]
  .sort((a,b)=>numberOf(a.source)-numberOf(b.source));
