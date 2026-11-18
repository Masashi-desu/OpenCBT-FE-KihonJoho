import { calculations2004SpringAm0126 } from './legacy-2004-spring-am-01-26-calculations';
import { knowledge2004SpringAm0126 } from './legacy-2004-spring-am-01-26-knowledge';

const numberOf=(source:string)=>Number(source.slice(source.lastIndexOf('-')+1));
export const legacy2004SpringAm01To26Definitions=[...calculations2004SpringAm0126,...knowledge2004SpringAm0126]
  .sort((a,b)=>numberOf(a.source)-numberOf(b.source));
