import type { GenerationDefinition } from './definition';
import { legacy2014SpringAm01To26Definitions } from './legacy-2014-spring-am-01-26';
import { legacy2014SpringAm27To53Definitions } from './legacy-2014-spring-am-27-53';
import { legacy2014SpringAm54To80Definitions } from './legacy-2014-spring-am-54-80';
import { isSpring2014CommonContext, spring2014CommonContexts } from './legacy-2014-spring-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2014SpringAm01To26Definitions, ...legacy2014SpringAm27To53Definitions, ...legacy2014SpringAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2014年度春期の規格・標準と論理回路の共通表記p.2–3を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...spring2014CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const spring2014MorningBooklet = { taskId: 'S3-011', definitions, isCommonContext: isSpring2014CommonContext };
