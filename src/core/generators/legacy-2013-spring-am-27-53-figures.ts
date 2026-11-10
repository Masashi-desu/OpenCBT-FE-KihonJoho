import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const spring2013Am2753Profiles = {
  ftth: 'legacy-2013-spring-am-34-ftth',
} as const;

export const spring2013FtthAlt = () =>
  '利用者宅内には複数のPC、ハブ、装置A、ONUがある。各PCはハブにつながる。ハブから装置A、装置AからONUにつながり、ONUから宅外へ光ファイバケーブル（FTTH）が延びている。';

export const legacy2013SpringAm2753Figures: readonly BookletFigureDefinition[] = [
  { profile: spring2013Am2753Profiles.ftth, domain: [[0, 0]], validate() {}, alt: spring2013FtthAlt },
];
