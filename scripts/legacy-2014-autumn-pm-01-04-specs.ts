import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2014AutumnPm1Definition, autumn2014Pm1Pages } from '../src/core/generators/legacy-2014-autumn-pm-1';
import { legacy2014AutumnPm2Definition, autumn2014Pm2Pages } from '../src/core/generators/legacy-2014-autumn-pm-2';
import { legacy2014AutumnPm3Definition, autumn2014Pm3Pages } from '../src/core/generators/legacy-2014-autumn-pm-3';
import { legacy2014AutumnPm4Definition, autumn2014Pm4Pages } from '../src/core/generators/legacy-2014-autumn-pm-4';
import { originalPageAlt } from '../src/core/generators/legacy-2014-autumn-pm-01-04-shared';

const sourcePages=[autumn2014Pm1Pages,autumn2014Pm2Pages,autumn2014Pm3Pages,autumn2014Pm4Pages];
function spec(number:number,definition:Stage3AfternoonQuestionSpec['definition'],topics:string[],keywords:string[]):Stage3AfternoonQuestionSpec{
  const start=5+(number-1)*5;
  const originalPages=sourcePages[number-1](0);
  return {
    number,title:definition.title,definition,topics,keywords,
    pages:originalPages.map((_,i)=>start+i),
    original:definition.build([...definition.reference]),
    originalPageAlt:originalPageAlt(originalPages,start),
  };
}
export const autumn2014Pm01To04Specs=[
  spec(1,legacy2014AutumnPm1Definition,['情報セキュリティ','ネットワーク'],['HTTPS','パケットフィルタ','SSH','公開鍵認証']),
  spec(2,legacy2014AutumnPm2Definition,['ハードウェア','論理回路'],['JKフリップフロップ','クロック','真理値表','2進カウンタ']),
  spec(3,legacy2014AutumnPm3Definition,['ソフトウェア','スケジューリング'],['ラウンドロビン','到着順','残余処理時間','ターンアラウンド']),
  spec(4,legacy2014AutumnPm4Definition,['データベース','関係データベース'],['書籍貸出','SQL','主キー','NULL','索引']),
];
