import type { GenerationDefinition } from './definition';
import { legacy2010AutumnAm01To26Definitions } from './legacy-2010-autumn-am-01-26';
import { legacy2010AutumnAm27To53Definitions } from './legacy-2010-autumn-am-27-53';
import { legacy2010AutumnAm54To80Definitions } from './legacy-2010-autumn-am-54-80';
import { isAutumn2010CommonContext, autumn2010CommonContexts } from './legacy-2010-autumn-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2010AutumnAm01To26Definitions, ...legacy2010AutumnAm27To53Definitions, ...legacy2010AutumnAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2010年度秋期試験の論理回路の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...autumn2010CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const autumn2010MorningBooklet = { taskId: 'S3-025', definitions, isCommonContext: isAutumn2010CommonContext };
