import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { spring2016Pm5Model, spring2016Pm5RecordAlt, spring2016Pm5SequenceAlt, spring2016Pm5StoreFields } from './legacy-2016-spring-pm-5';
import { spring2016Pm7ChartAlt, spring2016Pm7ExampleAlt, spring2016Pm7Model } from './legacy-2016-spring-pm-7';
import { spring2016Pm8Model, spring2016Pm8ScreenAlt, spring2016Pm8SnapshotAlt } from './legacy-2016-spring-pm-8';

type Description = (values: number[]) => string;
function definitions(question: number, maximum: number, descriptions: Record<string, Description>): BookletFigureDefinition[] {
  return Object.entries(descriptions).map(([kind, describe]) => ({
    profile: 'legacy-2016-spring-pm-' + question + '-' + kind,
    domain: [[0, maximum]],
    validate(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > maximum)
        throw new Error('PARAMETER_CONSTRAINT');
    },
    alt: describe,
  }));
}
export const legacy2016SpringPm0508Figures = [
  ...definitions(5, 5, {
    'store-record': () => spring2016Pm5RecordAlt(spring2016Pm5StoreFields),
    'favorite-record': values => spring2016Pm5RecordAlt([...spring2016Pm5Model(values).lookup, 'お気に入り数']),
    'web-sequence': values => spring2016Pm5SequenceAlt(false, spring2016Pm5Model(values).refresh),
    'app-sequence': values => spring2016Pm5SequenceAlt(true, spring2016Pm5Model(values).refresh),
  }),
  ...definitions(7, 5, {
    purchases: () => spring2016Pm7ExampleAlt(false),
    'repeat-purchases': () => spring2016Pm7ExampleAlt(true),
    'bubble-chart': values => spring2016Pm7ChartAlt(spring2016Pm7Model(values).rows),
  }),
  ...definitions(8, 4, {
    'memo-screen': values => spring2016Pm8ScreenAlt(spring2016Pm8Model(values).added),
    'memo-length-example': () => '左から下線付きの6，H，e，l，l，o，!をそれぞれ1バイトに格納する。',
    ...Object.fromEntries(Array.from({ length: 5 }, (_, i) =>
      ['memo-state-' + i, (values: number[]) => spring2016Pm8SnapshotAlt(spring2016Pm8Model(values).snapshots[i])])),
  }),
];
