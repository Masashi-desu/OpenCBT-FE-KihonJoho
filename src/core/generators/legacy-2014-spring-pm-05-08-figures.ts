import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { q0508FigureAlt, spring2014Pm0508Captions } from './legacy-2014-spring-pm-05-08-alt';
import { q0508FigureProfile } from './legacy-2014-spring-pm-05-08-shared';

export const spring2014Pm0508FigureIds = Object.keys(spring2014Pm0508Captions);
const choiceDomains: Record<string, Array<[number, number]>> = { 'q5-triple': [[0, 2], [0, 7]], 'q7-vertical': [[0, 0], [0, 4]] };

export const legacy2014SpringPm0508Figures: BookletFigureDefinition[] = spring2014Pm0508FigureIds.map(id => {
  const domain = choiceDomains[id] ?? [[0, 2] as [number, number]];
  return {
    profile: q0508FigureProfile(id), domain,
    validate(values) {
      if (values.length !== domain.length || domain.some(([min, max], i) => !Number.isInteger(values[i]) || values[i] < min || values[i] > max))
        throw Error('FIGURE_DOMAIN');
    },
    alt: values => q0508FigureAlt(id, values),
  };
});
