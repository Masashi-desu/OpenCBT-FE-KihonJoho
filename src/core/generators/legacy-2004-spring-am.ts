import { legacy2004SpringAm01To26Definitions } from './legacy-2004-spring-am-01-26';
import { legacy2004SpringAm27To53Definitions } from './legacy-2004-spring-am-27-53';
import { legacy2004SpringAm54To80Definitions } from './legacy-2004-spring-am-54-80';

export const spring2004MorningBooklet = {
  taskId: 'S3-051',
  definitions: [
    ...legacy2004SpringAm01To26Definitions,
    ...legacy2004SpringAm27To53Definitions,
    ...legacy2004SpringAm54To80Definitions,
  ],
  isCommonContext: () => false,
};
