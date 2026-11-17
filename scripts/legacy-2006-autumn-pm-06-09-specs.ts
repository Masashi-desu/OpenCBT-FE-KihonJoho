import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2006Pm0609Drafts } from '../src/core/generators/legacy-2006-autumn-pm-06-09';

const metadata = [
  {number:6,topics:['プログラミング','C','繰返し'],keywords:['数当てゲーム','Hit','Blow','入力検査','二重ループ']},
  {number:7,topics:['プログラミング','COBOL','索引ファイル'],keywords:['電話帳','重複番号','READ','DELETE','WRITE']},
  {number:9,topics:['プログラミング','CASL II','ビット列'],keywords:['結合','分割','左詰め','論理シフト','マスク']},
];
export const autumn2006Pm06To09Specs:Stage3AfternoonQuestionSpec[]=autumn2006Pm0609Drafts.map((draft,i)=>{
  const originalPageAlt=draft.originalPageAlt();
  for(const [page,alt] of Object.entries(originalPageAlt)) {
    const length=[...alt].length;
    if(length<=100||length>2000) throw Error('原資料p.'+page+'の代替テキストが規定外です（'+length+'字）');
  }
  return {title:draft.definition.title,pages:Object.keys(originalPageAlt).map(Number),
    ...metadata[i],definition:draft.definition,original:draft.original(),originalPageAlt};
});
