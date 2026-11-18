import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { originalAlt } from '../src/core/generators/legacy-2005-spring-pm-01-05-shared';
import { spring2005Pm1, spring2005Pm1Pages } from '../src/core/generators/legacy-2005-spring-pm-1';
import { spring2005Pm2, spring2005Pm2Pages } from '../src/core/generators/legacy-2005-spring-pm-2';
import { spring2005Pm4, spring2005Pm4Pages } from '../src/core/generators/legacy-2005-spring-pm-4';
import { spring2005Pm5, spring2005Pm5Pages } from '../src/core/generators/legacy-2005-spring-pm-5';

const spec=[
  {number:1,first:4,pages:spring2005Pm1Pages,definition:spring2005Pm1,topics:['データ構造','リスト'],
    keywords:['線形リスト','ポインタ','連結リスト','併合','主記憶','ROOT']},
  {number:2,first:6,pages:spring2005Pm2Pages,definition:spring2005Pm2,topics:['アルゴリズム','文字列'],
    keywords:['Replace','EOS','文字列置換','照合文字列','後判定繰返し','擬似言語']},
  {number:4,first:12,pages:spring2005Pm4Pages,definition:spring2005Pm4,topics:['アルゴリズム','整列'],
    keywords:['HeapSort','MakeHeap','InitHeap','ヒープ','二分木','昇順','擬似言語']},
  {number:5,first:17,pages:spring2005Pm5Pages,definition:spring2005Pm5,topics:['プログラム設計','ファイル編集'],
    keywords:['時間割','レコード','年次','曜日','時限','表示順','初期化','流れ図']},
];
export const spring2005Pm01To05Specs:Stage3AfternoonQuestionSpec[]=spec.map(item=>{
  const {number,first,pages,definition,topics,keywords}=item, blocks=pages(0);
  const originalPageAlt=originalAlt(blocks,first);
  if(number===1)originalPageAlt[first]='次の問1から問5までの5問については，全問解答してください。\n'+originalPageAlt[first];
  if(number===4)originalPageAlt[16]='問4の設問3。前ページのInitHeapに入れる繰返し条件。\n'+originalPageAlt[16];
  return {number,title:definition.title,definition,original:definition.build([...definition.reference]),
    pages:blocks.map((_,i)=>first+i),originalPageAlt,topics,keywords};
});
