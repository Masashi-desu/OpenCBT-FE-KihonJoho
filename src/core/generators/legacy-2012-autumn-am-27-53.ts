import type { GenerationDefinition } from './definition';
import { knowledgeDefinitions } from './legacy-2012-autumn-am-27-53-knowledge';
import {
  bitPermissions, foreignKey, functionPointEffort, lineUse, namingConvention, publicKey, shorten, subnet, updateView,
} from './legacy-2012-autumn-am-27-53-calculations';

const calculations = [namingConvention, updateView, foreignKey, lineUse, subnet, publicKey, bitPermissions, shorten, functionPointEffort];

export const legacy2012AutumnAm27To53Definitions: readonly GenerationDefinition[] = [
  ...knowledgeDefinitions, ...calculations,
].sort((left, right) => Number(left.source.split('-').at(-1)) - Number(right.source.split('-').at(-1)));
