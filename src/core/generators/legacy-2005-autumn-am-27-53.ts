import { calculationDefinitions } from './legacy-2005-autumn-am-27-53-calculations';
import { availabilityDefinitions } from './legacy-2005-autumn-am-27-53-figures';
import { knowledgeDefinitions } from './legacy-2005-autumn-am-27-53-knowledge';

export const legacy2005AutumnAm27To53Definitions = [
  ...calculationDefinitions, ...availabilityDefinitions, ...knowledgeDefinitions,
].sort((left, right) => Number(left.source.split('-').at(-1)) - Number(right.source.split('-').at(-1)));
