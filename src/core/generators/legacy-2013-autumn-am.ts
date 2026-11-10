import type { GenerationDefinition } from './definition';
import { legacy2013AutumnAm01To26Definitions } from './legacy-2013-autumn-am-01-26';
import { legacy2013AutumnAm27To53Definitions } from './legacy-2013-autumn-am-27-53';
import { legacy2013AutumnAm54To80Definitions } from './legacy-2013-autumn-am-54-80';
import { isAutumn2013CommonContext, autumn2013CommonContexts } from './legacy-2013-autumn-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2013AutumnAm01To26Definitions, ...legacy2013AutumnAm27To53Definitions, ...legacy2013AutumnAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2013年度秋期の規格・標準と論理回路の共通表記p.2–3を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...autumn2013CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const autumn2013MorningBooklet = { taskId: 'S3-013', definitions, isCommonContext: isAutumn2013CommonContext };
