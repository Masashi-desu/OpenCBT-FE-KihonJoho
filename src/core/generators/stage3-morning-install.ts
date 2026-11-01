import type { Bundle } from '../types';
import { DataError } from '../errors';
import { additionalDefinition, registerAdditionalDefinitions } from './index';
import { legacy2016SpringFundamentalDefinitions } from './legacy-2016-spring-fundamentals';
import { variableNotes, type GenerationDefinition } from './definition';
import { spring2016CommonContexts } from './legacy-2016-spring-am-common';
import { legacy2016SpringAm0932Definitions } from './legacy-2016-spring-am-09-32';
import { legacy2016SpringAm3356Definitions } from './legacy-2016-spring-am-33-56';
import { legacy2016SpringAm5780Definitions } from './legacy-2016-spring-am-57-80';
import { legacy2016AutumnAm0140Definitions } from './legacy-2016-autumn-am-01-40';
import { legacy2016AutumnAm4180Definitions } from './legacy-2016-autumn-am-41-80';
import { autumn2016CommonContexts } from './legacy-2016-autumn-am-common';

// Implementations are application-owned capabilities. Catalog admission and
// material/answer validation still apply to every requested template.
const sourcePattern = /^generator-source-(2016h28[ha]-fe-am-(?:[1-9]|[1-7]\d|80))$/;
export const isStage3MorningSource=(source:string)=>sourcePattern.test('generator-source-'+source);
export const stage3MorningDefinitions: readonly GenerationDefinition[] = [
  ...legacy2016SpringFundamentalDefinitions,
  ...legacy2016SpringAm0932Definitions,
  ...legacy2016SpringAm3356Definitions(),
  ...legacy2016SpringAm5780Definitions,
].map(d => ({...d, notes:(Number(d.source.split('-').at(-1))<=8?
  variableNotes+' 2016年度春期・旧午前問1〜8。候補番号から有限の実条件へ復号し、原基準0・原4択の役割・注記と図の構成を保つ。':d.notes)+' 2016年度春期の共通表記p2–3を解答前の参照資料に保持する。',
  build:(values:number[])=>{const body=d.build(values);return {...body,contexts:[...spring2016CommonContexts(),...(body.contexts??[])]};}}));

// Keep the published spring declaration stable for its historical observer.
// The installer and subsequent booklet observer use the complete capability list.
export const stage3AutumnMorningDefinitions:readonly GenerationDefinition[]=[
  ...legacy2016AutumnAm0140Definitions(),...legacy2016AutumnAm4180Definitions,
].map(d=>({...d,notes:d.notes+' 2016年度秋期の共通表記p2–3（規格の版、論理回路・回路記号と注記）を解答前の参照資料に保持する。',
  build:(values:number[])=>{const body=d.build(values);return{...body,contexts:[...autumn2016CommonContexts(),...(body.contexts??[])]};}}));
export const stage3AllMorningDefinitions:readonly GenerationDefinition[]=[...stage3MorningDefinitions,...stage3AutumnMorningDefinitions];

export function ensureStage3MorningGenerators(bundle: Bundle, executable?: ReadonlySet<string>) {
  const requested = bundle.templates.filter(t => sourcePattern.test(t.generatorRef.id) &&
    (!executable || executable.has(`${t.id}@${t.revision}`)));
  const missing: GenerationDefinition[] = [];
  for (const template of requested) {
    const source = sourcePattern.exec(template.generatorRef.id)![1];
    const candidates = stage3AllMorningDefinitions.filter(d => d.source === source);
    if (candidates.length !== 1 || (candidates[0].version ?? '3.2.0') !== template.generatorRef.version)
      throw new DataError('GENERATOR_REF', '第三段階の査読済み生成器・版がありません');
    const installed = additionalDefinition(template.generatorRef.id);
    if (installed && installed !== candidates[0])
      throw new DataError('GENERATOR_REF', '第三段階の生成器が重複しています');
    if (!installed && !missing.includes(candidates[0])) missing.push(candidates[0]);
  }
  registerAdditionalDefinitions(missing);
}
