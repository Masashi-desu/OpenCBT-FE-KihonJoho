import type { GenerationDefinition } from './definition';
import { legacy2015SpringAm0126Definitions } from './legacy-2015-spring-am-01-26';
import { legacy2015SpringAm2753Definitions } from './legacy-2015-spring-am-27-53';
import { legacy2015SpringAm5480Definitions } from './legacy-2015-spring-am-54-80';
import { isSpring2015CommonContext, spring2015CommonContexts } from './legacy-2015-spring-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2015SpringAm0126Definitions, ...legacy2015SpringAm2753Definitions, ...legacy2015SpringAm5480Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2015年度春期の規格・標準と論理回路の共通表記p.2–3を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...spring2015CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const spring2015MorningBooklet = { taskId: 'S3-007', definitions, isCommonContext: isSpring2015CommonContext };
