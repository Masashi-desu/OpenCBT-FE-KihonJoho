import { legacy2008SpringAm01To26Definitions } from './legacy-2008-spring-am-01-26';
import { legacy2008SpringAm27To53Definitions } from './legacy-2008-spring-am-27-53';
import { legacy2008SpringAm54To80Definitions } from './legacy-2008-spring-am-54-80';

export const spring2008MorningBooklet = {
  taskId: 'S3-035',
  definitions: [
    ...legacy2008SpringAm01To26Definitions,
    ...legacy2008SpringAm27To53Definitions,
    ...legacy2008SpringAm54To80Definitions,
  ],
  isCommonContext: () => false,
};
