import { legacy2006SpringAm01To26Definitions } from './legacy-2006-spring-am-01-26';
import { legacy2006SpringAm27To53Definitions } from './legacy-2006-spring-am-27-53';
import { legacy2006SpringAm54To80Definitions } from './legacy-2006-spring-am-54-80';

export const spring2006MorningBooklet = {
  taskId: 'S3-043',
  definitions: [
    ...legacy2006SpringAm01To26Definitions,
    ...legacy2006SpringAm27To53Definitions,
    ...legacy2006SpringAm54To80Definitions,
  ],
  isCommonContext: () => false,
};
