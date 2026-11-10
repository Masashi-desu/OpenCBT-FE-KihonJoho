import type { GenerationDefinition } from './definition';
import { audio,cohesion,earliest,functionPoints,multiplicity,orderRecord,osiLayers,setAlgebra } from './legacy-2011-autumn-am-27-53-calculations';
import { knowledgeDefinitions } from './legacy-2011-autumn-am-27-53-knowledge';

export const legacy2011AutumnAm27To53Definitions:readonly GenerationDefinition[]=[
  ...knowledgeDefinitions,audio,cohesion,earliest,functionPoints,multiplicity,orderRecord,osiLayers,setAlgebra,
].sort((left,right)=>Number(left.source.split('-').at(-1))-Number(right.source.split('-').at(-1)));
