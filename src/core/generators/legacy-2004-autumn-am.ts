import { isAutumn2004SpreadsheetContext } from './legacy-2004-autumn-am-spreadsheet-reference';
import { legacy2004AutumnAm01To26Definitions } from './legacy-2004-autumn-am-01-26';
import { legacy2004AutumnAm27To53Definitions } from './legacy-2004-autumn-am-27-53';
import { legacy2004AutumnAm54To80Definitions } from './legacy-2004-autumn-am-54-80';

export const autumn2004MorningBooklet = {
  taskId: 'S3-049',
  definitions: [
    ...legacy2004AutumnAm01To26Definitions,
    ...legacy2004AutumnAm27To53Definitions,
    ...legacy2004AutumnAm54To80Definitions,
  ],
  isCommonContext: isAutumn2004SpreadsheetContext,
};
