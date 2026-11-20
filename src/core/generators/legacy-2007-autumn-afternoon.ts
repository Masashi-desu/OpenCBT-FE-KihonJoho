import { autumn2007Pm1 } from './legacy-2007-autumn-pm-1';
import { legacy2007AutumnPm01To05Definitions } from './legacy-2007-autumn-pm-01-05';
import { legacy2007AutumnPm06To09Definitions } from './legacy-2007-autumn-pm-06-09';
import { legacy2007AutumnPm10To13Definitions } from './legacy-2007-autumn-pm-10-13';

export const legacy2007AutumnAfternoonDefinitions = [
  autumn2007Pm1,
  ...legacy2007AutumnPm01To05Definitions,
  ...legacy2007AutumnPm06To09Definitions,
  ...legacy2007AutumnPm10To13Definitions,
];
