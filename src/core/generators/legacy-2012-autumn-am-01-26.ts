import { calculation2012AutumnAm0126 } from './legacy-2012-autumn-am-01-26-calculation';
import { knowledge2012AutumnAm0126 } from './legacy-2012-autumn-am-01-26-knowledge';

const questionNumber = (source: string) => Number(source.slice(source.lastIndexOf('-') + 1));
export const legacy2012AutumnAm01To26Definitions = [...calculation2012AutumnAm0126, ...knowledge2012AutumnAm0126]
  .sort((a, b) => questionNumber(a.source) - questionNumber(b.source));
