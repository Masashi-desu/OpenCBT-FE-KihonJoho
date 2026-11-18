import { calculations2005AutumnAm0126 } from './legacy-2005-autumn-am-01-26-calculations';
import { knowledge2005AutumnAm0126 } from './legacy-2005-autumn-am-01-26-knowledge';

const questionNumber = (source: string) => Number(source.slice(source.lastIndexOf('-') + 1));
export const legacy2005AutumnAm01To26Definitions = [...calculations2005AutumnAm0126, ...knowledge2005AutumnAm0126]
  .sort((a,b) => questionNumber(a.source) - questionNumber(b.source));
