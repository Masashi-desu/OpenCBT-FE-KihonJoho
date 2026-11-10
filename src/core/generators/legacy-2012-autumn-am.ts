import type { GenerationDefinition } from './definition';
import { legacy2012AutumnAm01To26Definitions } from './legacy-2012-autumn-am-01-26';
import { legacy2012AutumnAm27To53Definitions } from './legacy-2012-autumn-am-27-53';
import { legacy2012AutumnAm54To80Definitions } from './legacy-2012-autumn-am-54-80';
import { isAutumn2012CommonContext, autumn2012CommonContexts } from './legacy-2012-autumn-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2012AutumnAm01To26Definitions, ...legacy2012AutumnAm27To53Definitions, ...legacy2012AutumnAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2012年度秋期の論理回路の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...autumn2012CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const autumn2012MorningBooklet = { taskId: 'S3-017', definitions, isCommonContext: isAutumn2012CommonContext };
