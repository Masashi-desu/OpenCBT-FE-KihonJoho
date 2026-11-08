import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { q0508FigureProfile } from './legacy-2014-autumn-pm-05-08-shared';
import {
  autumn2014Pm0508PageAlt, q5DiagramAlt, q8GraphAlt, q8Program,
} from './legacy-2014-autumn-pm-05-08-source';
import { q8CaseCount, q8ChoiceGraphs } from './legacy-2014-autumn-pm-8';

function definition(id: string, count: number, alt: BookletFigureDefinition['alt']): BookletFigureDefinition {
  return {
    profile: q0508FigureProfile(id), domain: [[0, count - 1]],
    validate(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= count)
        throw new Error('FIGURE_DOMAIN');
    },
    alt,
  };
}
export const legacy2014AutumnPm0508Figures: BookletFigureDefinition[] = [
  ...Object.entries(q5DiagramAlt).map(([id, alt]) => definition(id, 1, () => alt)),
  definition('q8-operations', 1, () => autumn2014Pm0508PageAlt[41].split('\n\n').find(p => p.startsWith('図1　文字列'))!),
  definition('q8-example', 1, () => autumn2014Pm0508PageAlt[42].split('\n\n').find(p => p.startsWith('図2　Str1'))!),
  definition('q8-program', 1, () => q8Program),
  ...Array.from({ length: 5 }, (_, i) => definition('q8-choice-' + i, q8CaseCount, values => q8GraphAlt(5, 6, q8ChoiceGraphs(values)[i]))),
];
