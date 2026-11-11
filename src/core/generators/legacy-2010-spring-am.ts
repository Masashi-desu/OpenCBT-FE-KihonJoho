import type { GenerationDefinition } from './definition';
import { legacy2010SpringAm01To26Definitions } from './legacy-2010-spring-am-01-26';
import { legacy2010SpringAm27To53Definitions } from './legacy-2010-spring-am-27-53';
import { legacy2010SpringAm54To80Definitions } from './legacy-2010-spring-am-54-80';
import { isSpring2010CommonContext, spring2010CommonContexts } from './legacy-2010-spring-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2010SpringAm01To26Definitions, ...legacy2010SpringAm27To53Definitions, ...legacy2010SpringAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2010年度春期試験の論理回路と回路記号の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...spring2010CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const spring2010MorningBooklet = { taskId: 'S3-027', definitions, isCommonContext: isSpring2010CommonContext };
