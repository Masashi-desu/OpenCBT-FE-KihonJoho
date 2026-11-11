import type { GenerationDefinition } from './definition';
import { calculationDefinitions } from './legacy-2009-autumn-am-27-53-calculations';
import { knowledgeDefinitions } from './legacy-2009-autumn-am-27-53-knowledge';

export const legacy2009AutumnAm27To53Definitions: GenerationDefinition[] =
  [...calculationDefinitions, ...knowledgeDefinitions].sort((left, right) =>
    Number(left.source.split('-').at(-1)) - Number(right.source.split('-').at(-1)));
