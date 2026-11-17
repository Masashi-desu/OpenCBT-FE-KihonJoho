import { calculations2006SpringAm0126 } from './legacy-2006-spring-am-01-26-calculations';
import { knowledge2006SpringAm0126 } from './legacy-2006-spring-am-01-26-knowledge';
export const legacy2006SpringAm01To26Definitions=[...calculations2006SpringAm0126,...knowledge2006SpringAm0126]
 .sort((left,right)=>Number(left.source.split('-').at(-1))-Number(right.source.split('-').at(-1)));
