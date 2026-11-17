import { calculationDefinitions } from './legacy-2006-autumn-am-27-53-calculations';
import { knowledgeDefinitions } from './legacy-2006-autumn-am-27-53-knowledge';
import { figureDefinitions } from './legacy-2006-autumn-am-27-53-figures';


export const legacy2006AutumnAm27To53Definitions = [...calculationDefinitions, ...knowledgeDefinitions, ...figureDefinitions]
  .sort((left, right) => Number(left.source.split('-').at(-1)) - Number(right.source.split('-').at(-1)));
