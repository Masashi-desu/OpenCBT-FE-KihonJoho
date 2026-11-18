import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { originalAlt } from '../src/core/generators/legacy-2004-autumn-pm-01-05-shared';
import { autumn2004Pm2, autumn2004Pm2Pages } from '../src/core/generators/legacy-2004-autumn-pm-2';
import { autumn2004Pm3, autumn2004Pm3Pages } from '../src/core/generators/legacy-2004-autumn-pm-3';
import { autumn2004Pm4, autumn2004Pm4Pages } from '../src/core/generators/legacy-2004-autumn-pm-4';
import { autumn2004Pm5, autumn2004Pm5Pages } from '../src/core/generators/legacy-2004-autumn-pm-5';

const specs=[
  {number:2,first:8,pages:autumn2004Pm2Pages,definition:autumn2004Pm2,topics:['ネットワーク','IPアドレス'],
    keywords:['IPv4','MACアドレス','ルータ','基幹LAN','プロキシ','ポート','FTP','ping']},
  {number:3,first:11,pages:autumn2004Pm3Pages,definition:autumn2004Pm3,topics:['セキュリティ','アクセス制御'],
    keywords:['アクセス権','最小権限','ワイルドカード','grant','ネットワーク接続','辞書']},
  {number:4,first:14,pages:autumn2004Pm4Pages,definition:autumn2004Pm4,topics:['アルゴリズム','基数変換'],
    keywords:['RadixConv','MToInt','IntToN','ToInt','ToStr','擬似言語']},
  {number:5,first:18,pages:autumn2004Pm5Pages,definition:autumn2004Pm5,topics:['プログラム設計','ファイル処理'],
    keywords:['売上順位','集計','安定ソート','商品コード','販売数量','ファイル照合']},
];
export const autumn2004Pm01To05Specs:Stage3AfternoonQuestionSpec[]=specs.map(item=>{
  const {number,first,pages,definition,topics,keywords}=item, blocks=pages(0);
  return {number,title:definition.title,definition,original:definition.build([...definition.reference]),
    pages:blocks.map((_,i)=>first+i),originalPageAlt:originalAlt(blocks,first),topics,keywords};
});
