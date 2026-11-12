import type { GenerationDefinition } from './definition';
import { legacy2008AutumnAm01To26Definitions } from './legacy-2008-autumn-am-01-26';
import { legacy2008AutumnAm27To53Definitions } from './legacy-2008-autumn-am-27-53';
import { legacy2008AutumnAm54To80Definitions } from './legacy-2008-autumn-am-54-80';
import { isAutumn2008CommonContext, autumn2008CommonContexts } from './legacy-2008-autumn-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2008AutumnAm01To26Definitions,
  ...legacy2008AutumnAm27To53Definitions,
  ...legacy2008AutumnAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2008年度秋期の論理回路の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...autumn2008CommonContexts(), ...(body.contexts ?? [])] };
  },
}));

export const autumn2008MorningBooklet = {
  taskId: 'S3-033',
  definitions,
  isCommonContext: isAutumn2008CommonContext,
};
