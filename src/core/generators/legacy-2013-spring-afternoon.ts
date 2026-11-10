import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { DataError } from '../errors';
import type { GeneratedBody } from './definition';
import { legacy2013SpringPm01To04Definitions } from './legacy-2013-spring-pm-01-04';
import { legacy2013SpringPm05To08Definitions } from './legacy-2013-spring-pm-05-08';
import { legacy2013SpringPm09To13Definitions } from './legacy-2013-spring-pm-09-13';

const checklistSlots = ['part-s1-choice-1', 'part-s1-choice-2', 'part-s1-choice-3'];

export function spring2013PmChecklist(body: GeneratedBody): GeneratedBody {
  const answers = body.partAnswers;
  const group = answers?.find(key => key.kind === 'unordered');
  if (!answers || !group || group.kind !== 'unordered' || group.partIds.length !== checklistSlots.length ||
    group.partIds.some((id, index) => id !== checklistSlots[index]))
    throw new DataError('ANSWER_PARTS', '2013年度春期午後問7の設問1には三つの選択枠が必要です');
  return { ...body, partAnswers: answers.map(key =>
    key === group ? { ...group, presentation: 'checklist' } : key) };
}

export const legacy2013SpringAfternoonDefinitions: readonly AfternoonBookletDefinition[] = [
  ...legacy2013SpringPm01To04Definitions,
  ...legacy2013SpringPm05To08Definitions.map(definition => definition.source !== '2013h25h-fe-pm-7'
    ? definition : { ...definition, build: (values: number[]) => spring2013PmChecklist(definition.build(values)) }),
  ...legacy2013SpringPm09To13Definitions,
];
