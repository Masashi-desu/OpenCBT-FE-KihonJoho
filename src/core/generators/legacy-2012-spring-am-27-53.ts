import type { GenerationDefinition } from './definition';
import { knowledgeDefinitions } from './legacy-2012-spring-am-27-53-knowledge';
import { criticalPath, equijoin, projection, redundancy, remainingEffort, transferTime } from './legacy-2012-spring-am-27-53-calculations';

export const legacy2012SpringAm27To53Definitions: readonly GenerationDefinition[] = [
  ...knowledgeDefinitions, equijoin, projection, transferTime, redundancy, criticalPath, remainingEffort,
].sort((left, right) => Number(left.source.split('-').at(-1)) - Number(right.source.split('-').at(-1)));
