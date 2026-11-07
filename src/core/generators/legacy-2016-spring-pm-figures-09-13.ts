import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { spring2016Pm9Figure, spring2016Pm9Profiles } from './legacy-2016-spring-pm-9';
import { spring2016Pm10ChangeTableAlt } from './legacy-2016-spring-pm-10';

export const legacy2016SpringPm0913Figures: BookletFigureDefinition[] = [
  ...spring2016Pm9Profiles.map(name => ({
    profile: 'legacy-2016-spring-pm-9-' + name,
    domain: [[0, 7]] as const,
    validate: (values: number[]) => { spring2016Pm9Figure(name, values); },
    alt: (values: number[]) => spring2016Pm9Figure(name, values).alt,
  })),
  {
    profile: 'legacy-2016-spring-pm-10-change-table',
    domain: [[0, 11]],
    validate: values => { spring2016Pm10ChangeTableAlt(values); },
    alt: spring2016Pm10ChangeTableAlt,
  },
];
