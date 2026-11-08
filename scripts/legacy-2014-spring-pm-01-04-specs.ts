import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2014SpringPm1Definition, spring2014Pm1Pages } from '../src/core/generators/legacy-2014-spring-pm-1';
import { legacy2014SpringPm2Definition, spring2014Pm2Pages } from '../src/core/generators/legacy-2014-spring-pm-2';
import { legacy2014SpringPm3Definition, spring2014Pm3Pages } from '../src/core/generators/legacy-2014-spring-pm-3';
import { legacy2014SpringPm4Definition, spring2014Pm4Pages } from '../src/core/generators/legacy-2014-spring-pm-4';
import { originalPageAlt } from '../src/core/generators/legacy-2014-spring-pm-01-04-shared';
const sourcePages=[spring2014Pm1Pages,spring2014Pm2Pages,spring2014Pm3Pages,spring2014Pm4Pages];
const firstPhysicalPages=[6,12,16,21];
function spec(number:number,definition:Stage3AfternoonQuestionSpec['definition'],topics:string[],keywords:string[]):Stage3AfternoonQuestionSpec{
  const start=firstPhysicalPages[number-1], originalPages=sourcePages[number-1](0);
  return {number,title:definition.title,definition,topics,keywords,
    pages:originalPages.map((_,i)=>start+i),original:definition.build([...definition.reference]),
    originalPageAlt:originalPageAlt(originalPages,start)};
}
export const spring2014Pm01To04Specs=[
  spec(1,legacy2014SpringPm1Definition,['情報セキュリティ','リスク管理'],['リスクアセスメント','機密性','完全性','可用性','情報資産']),
  spec(2,legacy2014SpringPm2Definition,['ハードウェア','プロセッサ'],['機械語','レジスタ','条件コード','実効アドレス','分岐']),
  spec(3,legacy2014SpringPm3Definition,['ソフトウェア','並列処理'],['マルチプロセッサ','スレッド','共有メモリ','高速化率','ループ分割']),
  spec(4,legacy2014SpringPm4Definition,['ネットワーク','伝送'],['広域Ethernet','転送時間','データリンク層','応答時間','スループット']),
];
