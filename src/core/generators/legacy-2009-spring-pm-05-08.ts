import { feeBanks,feeDefinition,feePages } from './legacy-2009-spring-pm-5';
import { riskBanks,riskDefinition,riskPages } from './legacy-2009-spring-pm-6';
import { demandBanks,demandDefinition,demandPages } from './legacy-2009-spring-pm-7';
import { paintBanks,paintDefinition,paintPages } from './legacy-2009-spring-pm-8';
import { sourceAlt,type Major } from './legacy-2009-spring-pm-05-08-shared';

export const legacy2009SpringPm05To08Definitions=[feeDefinition,riskDefinition,demandDefinition,paintDefinition];
const pages={5:feePages,6:riskPages,7:demandPages,8:paintPages};
const banks={5:feeBanks,6:riskBanks,7:demandBanks,8:paintBanks};
export const spring2009Pm0508OriginalPageAlt=(major:Major)=>sourceAlt(pages[major](0),banks[major](0));
