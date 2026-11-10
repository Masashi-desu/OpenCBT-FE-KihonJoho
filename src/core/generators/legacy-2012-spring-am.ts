import type { GenerationDefinition } from './definition';
import { legacy2012SpringAm01To26Definitions } from './legacy-2012-spring-am-01-26';
import { legacy2012SpringAm27To53Definitions } from './legacy-2012-spring-am-27-53';
import { legacy2012SpringAm54To80Definitions } from './legacy-2012-spring-am-54-80';
import { isSpring2012CommonContext, spring2012CommonContexts } from './legacy-2012-spring-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2012SpringAm01To26Definitions, ...legacy2012SpringAm27To53Definitions, ...legacy2012SpringAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2012年度春期の論理回路・回路記号の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...spring2012CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const spring2012MorningBooklet = { taskId: 'S3-019', definitions, isCommonContext: isSpring2012CommonContext };
