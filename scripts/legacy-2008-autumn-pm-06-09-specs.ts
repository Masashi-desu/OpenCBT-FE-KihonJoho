import type {Stage3AfternoonQuestionSpec} from './legacy-afternoon-booklet-records';
import {autumn2008Pm0609Drafts} from '../src/core/generators/legacy-2008-autumn-pm-06-09';

const metadata=[
  {topics:['プログラミング','C','文字列'],keywords:['基数','整数除算','余り','桁区切り','配列','文字列の逆順']},
  {topics:['プログラミング','COBOL','順ファイル'],keywords:['コピー用紙','部署別集計','両面利用','棒グラフ','切上げ']},
  {topics:['プログラミング','Java','オブジェクト指向'],keywords:['電話帳','Map','Set','正規表現','前方一致','HashSet']},
  {topics:['プログラミング','CASL II','ビット演算'],keywords:['COMET II','算術右シフト','論理シフト','マスク','16ビット','レジスタ']},
];
export const autumn2008Pm06To09Specs:Stage3AfternoonQuestionSpec[]=autumn2008Pm0609Drafts.map((draft,i)=>{
  const {definition}=draft,originalPageAlt=draft.originalPageAlt();
  for(const [page,alt] of Object.entries(originalPageAlt)) {
    const length=[...alt].length;
    if(length<=100||length>2000) throw Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return {number:i+6,title:definition.title,pages:Object.keys(originalPageAlt).map(Number),...metadata[i],
    definition,original:draft.original(),originalPageAlt};
});
