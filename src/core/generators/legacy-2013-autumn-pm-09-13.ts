import { autumn2013Pm9 } from './legacy-2013-autumn-pm-9';
import { autumn2013Pm10 } from './legacy-2013-autumn-pm-10';
import { autumn2013Pm11 } from './legacy-2013-autumn-pm-11';
import { autumn2013Pm12 } from './legacy-2013-autumn-pm-12';
import { autumn2013Pm13 } from './legacy-2013-autumn-pm-13';

export { autumn2013PmJavaReferenceTitle } from './legacy-2013-autumn-pm-11';
export { autumn2013PmCaslCodesTitle } from './legacy-2013-autumn-pm-12';
export const autumn2013PmLanguageDrafts = [autumn2013Pm9, autumn2013Pm10, autumn2013Pm11, autumn2013Pm12, autumn2013Pm13];
export const legacy2013AutumnPm09To13Definitions = autumn2013PmLanguageDrafts.map(draft => draft.definition);
