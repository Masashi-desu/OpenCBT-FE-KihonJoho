import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2004Pm0609Drafts } from '../src/core/generators/legacy-2004-spring-pm-06-09';

const metadata=[
  {number:7,topics:['プログラミング','COBOL','順ファイル'],keywords:['資格技能','英語点数','社員番号','突き合わせ','HIGH-VALUE']},
  {number:8,topics:['プログラミング','Java','オブジェクト指向'],keywords:['単位変換','インタフェース','Converter','implements','標準入力']},
  {number:9,topics:['プログラミング','CASL II','ビット演算'],keywords:['パリティ','COMET II','レジスタ','XOR','シフト','フラグ']},
];
export const spring2004Pm06To09Specs: Stage3AfternoonQuestionSpec[]=spring2004Pm0609Drafts.map((question,index)=>{
  const originalPageAlt=question.originalPageAlt();
  for(const [page,alt] of Object.entries(originalPageAlt)){
    const length=[...alt].length;
    if(length<=100||length>2000)throw Error('原資料p.'+page+'の代替テキストが規定外です（'+length+'字）');
  }
  return {...metadata[index],title:question.definition.title,pages:Object.keys(originalPageAlt).map(Number),
    definition:question.definition,original:question.original(),originalPageAlt};
});
