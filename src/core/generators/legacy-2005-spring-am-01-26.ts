import { calculations2005SpringAm0126 } from './legacy-2005-spring-am-01-26-calculations';
import { knowledge2005SpringAm0126 } from './legacy-2005-spring-am-01-26-knowledge';

const questionNumber=(source:string)=>Number(source.slice(source.lastIndexOf('-')+1));
export const legacy2005SpringAm01To26Definitions=[...calculations2005SpringAm0126,...knowledge2005SpringAm0126]
  .sort((a,b)=>questionNumber(a.source)-questionNumber(b.source));
