import { calculation2011SpecialAm0126 } from './legacy-2011-special-am-01-26-calculation';
import { knowledge2011SpecialAm0126 } from './legacy-2011-special-am-01-26-knowledge';

const questionNumber = (source: string) => Number(source.slice(source.lastIndexOf('-') + 1));
export const legacy2011SpecialAm01To26Definitions = [...calculation2011SpecialAm0126, ...knowledge2011SpecialAm0126]
  .sort((a, b) => questionNumber(a.source) - questionNumber(b.source));
