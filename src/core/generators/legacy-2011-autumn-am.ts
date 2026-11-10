import type { GenerationDefinition } from './definition';
import { legacy2011AutumnAm01To26Definitions } from './legacy-2011-autumn-am-01-26';
import { legacy2011AutumnAm27To53Definitions } from './legacy-2011-autumn-am-27-53';
import { legacy2011AutumnAm54To80Definitions } from './legacy-2011-autumn-am-54-80';
import { isAutumn2011CommonContext, autumn2011CommonContexts } from './legacy-2011-autumn-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2011AutumnAm01To26Definitions, ...legacy2011AutumnAm27To53Definitions, ...legacy2011AutumnAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2011年度秋期の論理回路の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...autumn2011CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const autumn2011MorningBooklet = { taskId: 'S3-021', definitions, isCommonContext: isAutumn2011CommonContext };
