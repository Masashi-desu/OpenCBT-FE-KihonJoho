import { legacy2009AutumnAm01To26Definitions } from './legacy-2009-autumn-am-01-26';
import { legacy2009AutumnAm27To53Definitions } from './legacy-2009-autumn-am-27-53';
import { legacy2009AutumnAm54To80Definitions } from './legacy-2009-autumn-am-54-80';

export const autumn2009MorningBooklet = {
  taskId: 'S3-029',
  definitions: [
    ...legacy2009AutumnAm01To26Definitions,
    ...legacy2009AutumnAm27To53Definitions,
    ...legacy2009AutumnAm54To80Definitions,
  ],
  isCommonContext: () => false,
};
