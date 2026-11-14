import { legacy2007AutumnAm01To26Definitions } from './legacy-2007-autumn-am-01-26';
import { legacy2007AutumnAm27To53Definitions } from './legacy-2007-autumn-am-27-53';
import { legacy2007AutumnAm54To80Definitions } from './legacy-2007-autumn-am-54-80';

export const autumn2007MorningBooklet = {
  taskId: 'S3-037',
  definitions: [
    ...legacy2007AutumnAm01To26Definitions,
    ...legacy2007AutumnAm27To53Definitions,
    ...legacy2007AutumnAm54To80Definitions,
  ],
  isCommonContext: () => false,
};
