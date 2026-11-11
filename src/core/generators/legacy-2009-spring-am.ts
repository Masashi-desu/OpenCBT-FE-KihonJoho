import type { GenerationDefinition } from './definition';
import { legacy2009SpringAm01To26Definitions } from './legacy-2009-spring-am-01-26';
import { legacy2009SpringAm27To53Definitions } from './legacy-2009-spring-am-27-53';
import { legacy2009SpringAm54To80Definitions } from './legacy-2009-spring-am-54-80';
import { isSpring2009CommonContext, spring2009CommonContexts } from './legacy-2009-spring-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2009SpringAm01To26Definitions,
  ...legacy2009SpringAm27To53Definitions,
  ...legacy2009SpringAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2009年度春期の論理回路の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...spring2009CommonContexts(), ...(body.contexts ?? [])] };
  },
}));

export const spring2009MorningBooklet = {
  taskId: 'S3-031',
  definitions,
  isCommonContext: isSpring2009CommonContext,
};
