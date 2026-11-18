import { isSpring2005SpreadsheetContext } from './legacy-2005-spring-am-spreadsheet-reference';
import { legacy2005SpringAm01To26Definitions } from './legacy-2005-spring-am-01-26';
import { legacy2005SpringAm27To53Definitions } from './legacy-2005-spring-am-27-53';
import { legacy2005SpringAm54To80Definitions } from './legacy-2005-spring-am-54-80';

export const spring2005MorningBooklet = {
  taskId: 'S3-047',
  definitions: [
    ...legacy2005SpringAm01To26Definitions,
    ...legacy2005SpringAm27To53Definitions,
    ...legacy2005SpringAm54To80Definitions,
  ],
  isCommonContext: isSpring2005SpreadsheetContext,
};
