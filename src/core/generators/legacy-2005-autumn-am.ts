import { legacy2005AutumnAm01To26Definitions } from './legacy-2005-autumn-am-01-26';
import { legacy2005AutumnAm27To53Definitions } from './legacy-2005-autumn-am-27-53';
import { legacy2005AutumnAm54To80Definitions } from './legacy-2005-autumn-am-54-80';

export const autumn2005MorningBooklet = {
  taskId: 'S3-045',
  definitions: [
    ...legacy2005AutumnAm01To26Definitions,
    ...legacy2005AutumnAm27To53Definitions,
    ...legacy2005AutumnAm54To80Definitions,
  ],
  isCommonContext: () => false,
};
