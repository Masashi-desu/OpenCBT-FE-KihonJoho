import type { GenerationDefinition } from './definition';
import { legacy2011SpecialAm01To26Definitions } from './legacy-2011-special-am-01-26';
import { legacy2011SpecialAm27To53Definitions } from './legacy-2011-special-am-27-53';
import { legacy2011SpecialAm54To80Definitions } from './legacy-2011-special-am-54-80';
import { isSpecial2011CommonContext, special2011CommonContexts } from './legacy-2011-special-am-common';

const definitions: readonly GenerationDefinition[] = [
  ...legacy2011SpecialAm01To26Definitions, ...legacy2011SpecialAm27To53Definitions, ...legacy2011SpecialAm54To80Definitions,
].map(definition => ({
  ...definition,
  notes: definition.notes + ' 2011年度特別試験の論理回路の共通表記p.2を解答前に参照できる。',
  build(values) {
    const body = definition.build(values);
    return { ...body, contexts: [...special2011CommonContexts(), ...(body.contexts ?? [])] };
  },
}));
export const special2011MorningBooklet = { taskId: 'S3-023', definitions, isCommonContext: isSpecial2011CommonContext };
