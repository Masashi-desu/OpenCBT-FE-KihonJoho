import { legacy2007SpringAm01To26Definitions } from './legacy-2007-spring-am-01-26';
import { legacy2007SpringAm27To53Definitions } from './legacy-2007-spring-am-27-53';
import { legacy2007SpringAm54To80Definitions } from './legacy-2007-spring-am-54-80';

export const spring2007MorningBooklet = {
  taskId: 'S3-039',
  definitions: [
    ...legacy2007SpringAm01To26Definitions,
    ...legacy2007SpringAm27To53Definitions,
    ...legacy2007SpringAm54To80Definitions,
  ],
  isCommonContext: () => false,
};
