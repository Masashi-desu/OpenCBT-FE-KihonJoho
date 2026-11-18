import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { originalAlt } from '../src/core/generators/legacy-2005-autumn-pm-01-05-shared';
import { legacy2005AutumnPm01To05Definitions as definitions } from '../src/core/generators/legacy-2005-autumn-pm-01-05';
import { autumn2005Pm1Pages } from '../src/core/generators/legacy-2005-autumn-pm-1';
import { autumn2005Pm2Pages } from '../src/core/generators/legacy-2005-autumn-pm-2';
import { autumn2005Pm3Pages } from '../src/core/generators/legacy-2005-autumn-pm-3';
import { autumn2005Pm4Pages } from '../src/core/generators/legacy-2005-autumn-pm-4';
import { autumn2005Pm5Pages } from '../src/core/generators/legacy-2005-autumn-pm-5';

const spec = [
  {first:4, pages:autumn2005Pm1Pages, topics:['ネットワーク','DNS'],
    keywords:['ネームサーバ','Aレコード','NSレコード','ラウンドロビン','サブネットワーク','GATEWAY']},
  {first:7, pages:autumn2005Pm2Pages, topics:['システム構成','主記憶'],
    keywords:['オーバレイ','セグメント','組込みシステム','モジュールの呼出し','主記憶領域']},
  {first:11, pages:autumn2005Pm3Pages, topics:['セキュリティ','暗号'],
    keywords:['Diffie-Hellman法','DH法','共通かぎ','公開かぎ','中間者攻撃','ディジタル署名']},
  {first:14, pages:autumn2005Pm4Pages, topics:['アルゴリズム','スタック'],
    keywords:['中置表記法','後置表記法','スタック','toPostfix','getPriority','疑似言語']},
  {first:19, pages:autumn2005Pm5Pages, topics:['プログラム設計','ファイル処理'],
    keywords:['人事異動','職務変更','昇級','昇格','社員コード','突合せ','昇格者ファイル','社員表']},
];
export const autumn2005Pm01To05Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition,i)=>{
  const {first,pages,topics,keywords}=spec[i], blocks=pages(0);
  const originalPageAlt=originalAlt(blocks,first);
  if(i===0)originalPageAlt[first]='次の問1から問5までの5問については，全問解答してください。\n'+originalPageAlt[first];
  return {number:i+1,title:definition.title,definition,pages:blocks.map((_,index)=>first+index),
    original:definition.build([...definition.reference]),originalPageAlt,topics,keywords};
});
