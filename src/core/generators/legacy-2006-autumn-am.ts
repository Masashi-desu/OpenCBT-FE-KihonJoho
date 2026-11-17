import { legacy2006AutumnAm01To26Definitions } from './legacy-2006-autumn-am-01-26';
import { legacy2006AutumnAm27To53Definitions } from './legacy-2006-autumn-am-27-53';
import { legacy2006AutumnAm54To80Definitions } from './legacy-2006-autumn-am-54-80';

export const autumn2006MorningBooklet = {
  taskId: 'S3-041',
  definitions: [
    ...legacy2006AutumnAm01To26Definitions,
    ...legacy2006AutumnAm27To53Definitions,
    ...legacy2006AutumnAm54To80Definitions,
  ],
  isCommonContext: () => false,
};
