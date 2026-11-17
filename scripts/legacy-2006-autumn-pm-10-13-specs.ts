import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2006PmLanguageDrafts } from '../src/core/generators/legacy-2006-autumn-pm-10-13';
import { autumn2006PmJavaTitle } from '../src/core/generators/legacy-2006-autumn-pm-materials';

const metadata = {
  11: {topics:['プログラミング','COBOL','部品展開'],keywords:['索引ファイル','部品所要数','複合キー','余裕在庫','START']},
  12: {topics:['プログラミング','Java','図書の貸出し'],keywords:['コンストラクタ','例外','Map','Set','貸出上限','最新号']},
  13: {topics:['プログラミング','CASL II','ビット列置換'],keywords:['COMET II','部分一致','マスク','左循環シフト','位置復帰']},
};

export const autumn2006Pm10To13Specs:Stage3AfternoonQuestionSpec[]=autumn2006PmLanguageDrafts.map(draft=>{
  const {number,definition}=draft, originalPageAlt=draft.originalPageAlt();
  if(number===12){
    // Keep all Java rows and line numbers within the asset's accessible text limit.
    originalPageAlt[45]=originalPageAlt[45].replace(/^( *\d+) {2}((?: {4})*)/gm,
      (_,num:string,indent:string)=>num+' '+ '\t'.repeat(indent.length/4))
      .replace(/^( {8,})(?=\S)/gm,spaces=>'\t'.repeat(Math.floor(spaces.length/4))+' '.repeat(spaces.length%4));
  }
  return {number,title:definition.title,pages:Object.keys(originalPageAlt).map(Number),
    ...metadata[number as keyof typeof metadata],definition,original:draft.original(),originalPageAlt,
    ...(number===12?{editorialContextTitles:[autumn2006PmJavaTitle]}:{})};
});
