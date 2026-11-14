import { calculationDefinitions } from './legacy-2007-autumn-am-27-53-calculations';
import { knowledgeDefinitions } from './legacy-2007-autumn-am-27-53-knowledge';
export const legacy2007AutumnAm27To53Definitions = [...calculationDefinitions, ...knowledgeDefinitions]
  .sort((left, right) => Number(left.source.split('-').at(-1)) - Number(right.source.split('-').at(-1)));
