import { calculation2012SpringAm0126 } from './legacy-2012-spring-am-01-26-calculation';
import { knowledge2012SpringAm0126 } from './legacy-2012-spring-am-01-26-knowledge';

const questionNumber = (source: string) => Number(source.slice(source.lastIndexOf('-') + 1));
export const legacy2012SpringAm01To26Definitions = [...calculation2012SpringAm0126, ...knowledge2012SpringAm0126]
  .sort((left, right) => questionNumber(left.source) - questionNumber(right.source));
