import type { GenerationDefinition } from './definition';
import { legacy2013SpringAm01To26Definitions } from './legacy-2013-spring-am-01-26';
import { legacy2013SpringAm27To53Definitions } from './legacy-2013-spring-am-27-53';
import { legacy2013SpringAm54To80Definitions } from './legacy-2013-spring-am-54-80';
import { isSpring2013CommonContext, spring2013CommonContexts } from './legacy-2013-spring-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2013SpringAm01To26Definitions, ...legacy2013SpringAm27To53Definitions, ...legacy2013SpringAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2013年度春期の論理回路の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...spring2013CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const spring2013MorningBooklet = { taskId: 'S3-015', definitions, isCommonContext: isSpring2013CommonContext };
