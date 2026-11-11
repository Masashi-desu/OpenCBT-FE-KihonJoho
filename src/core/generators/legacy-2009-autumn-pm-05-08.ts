import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { pageAlt, type Major } from './legacy-2009-autumn-pm-05-08-shared';
import { ticketDefinition, ticketPages } from './legacy-2009-autumn-pm-5';
import { ticketBanks } from './legacy-2009-autumn-pm-5-model';
import { incidentBanks, incidentDefinition, incidentPages } from './legacy-2009-autumn-pm-6';
import { effectBanks, effectDefinition, effectPages } from './legacy-2009-autumn-pm-7';
import { newtonBanks, newtonDefinition, newtonPages } from './legacy-2009-autumn-pm-8';

export const legacy2009AutumnPm05To08Definitions: readonly AfternoonBookletDefinition[] =
  [ticketDefinition, incidentDefinition, effectDefinition, newtonDefinition];

export function autumn2009Pm0508OriginalPageAlt(major: Major) {
  switch (major) {
    case 5: return pageAlt(ticketPages(0),ticketBanks(0));
    case 6: return pageAlt(incidentPages(0),incidentBanks(0));
    case 7: return pageAlt(effectPages(0),effectBanks(0));
    case 8: return pageAlt(newtonPages(0),newtonBanks);
  }
}
