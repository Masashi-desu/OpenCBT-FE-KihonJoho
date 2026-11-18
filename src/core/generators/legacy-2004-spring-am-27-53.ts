import { calculationDefinitions } from './legacy-2004-spring-am-27-53-calculations';
import { figureDefinitions } from './legacy-2004-spring-am-27-53-figures';
import { knowledgeDefinitions } from './legacy-2004-spring-am-27-53-knowledge';

export const legacy2004SpringAm27To53Definitions = [
  ...calculationDefinitions, ...figureDefinitions, ...knowledgeDefinitions,
].sort((left, right) => Number(left.source.split('-').at(-1)) - Number(right.source.split('-').at(-1)));
