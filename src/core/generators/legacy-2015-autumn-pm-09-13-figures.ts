import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { autumn2015Pm9CaseCount, autumn2015Pm9Panel, autumn2015Pm9Profiles } from './legacy-2015-autumn-pm-9';
import { autumn2015Pm10CaseCount, autumn2015Pm10Panel, autumn2015Pm10Profiles } from './legacy-2015-autumn-pm-10';
import { autumn2015Pm11CaseCount, autumn2015Pm11Panel, autumn2015Pm11Profiles } from './legacy-2015-autumn-pm-11';
import { autumn2015Pm12CaseCount, autumn2015Pm12Panel, autumn2015Pm12Profiles } from './legacy-2015-autumn-pm-12';
import { autumn2015Pm13CaseCount, autumn2015Pm13Panel, autumn2015Pm13Profiles } from './legacy-2015-autumn-pm-13';
import { languagePanelAlt, selectCase, type LanguagePanel } from './legacy-2015-autumn-pm-09-13-support';

type Figure = BookletFigureDefinition & { panel: (values: number[]) => LanguagePanel };
function languageFigures(number: number, count: number, profiles: readonly string[], load: (profile: string, index: number) => LanguagePanel): Figure[] {
  return profiles.map(name => {
    const panel = (values: number[]) => load(name, selectCase(values, count));
    return {
      profile: 'legacy-2015-autumn-pm-' + number + '-' + name, domain: [[0, count - 1]],
      validate(values) { panel(values); },
      alt: values => languagePanelAlt(panel(values)),
      panel,
    };
  });
}

export const legacy2015AutumnPm0913Figures = [
  ...languageFigures(9, autumn2015Pm9CaseCount, autumn2015Pm9Profiles, autumn2015Pm9Panel),
  ...languageFigures(10, autumn2015Pm10CaseCount, autumn2015Pm10Profiles, autumn2015Pm10Panel),
  ...languageFigures(11, autumn2015Pm11CaseCount, autumn2015Pm11Profiles, autumn2015Pm11Panel),
  ...languageFigures(12, autumn2015Pm12CaseCount, autumn2015Pm12Profiles, autumn2015Pm12Panel),
  ...languageFigures(13, autumn2015Pm13CaseCount, autumn2015Pm13Profiles, autumn2015Pm13Panel),
];
