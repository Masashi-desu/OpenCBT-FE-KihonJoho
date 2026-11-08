import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { autumn2014Am5480Source as source } from './legacy-2014-autumn-am-54-80-source';
import { autumn2014Am5480Calculations as calculations } from './legacy-2014-autumn-am-54-80-calculations';
import { autumn2014Am5480Knowledge as knowledge } from './legacy-2014-autumn-am-54-80-knowledge';

const reviewedNotes: Partial<Record<number,string>> = {
  59:'平成16年システム監査基準は当時の役割の事実参照に限り、原問の記述や独自説明と分ける。',
  61:'平成16年システム管理基準の組織横断と個別計画の分類を参照する。外部規定文・原図を含めない。',
  79:'著作権法2条・10条の2014年時点の範囲。2017春79の四択と一致するが、改変は当該時点と事例を明記。',
  80:'民法644・656条の2014年時点を明記。現行648条の2の成果報酬の明文化と契約類型を区別。',
};
export const legacy2014AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number,original])=>{
  const n=Number(number);
  const calculation=calculations[n];
  const count=calculation?.count ?? knowledge[n].variants.length+1;
  const originalIndex='アイウエ'.indexOf(original.key);
  return {
    source:'2014h26a-fe-am-'+n,title:original.title,fields:[field('対象・条件',0,count-1)],reference:[0],
    version:'3.2.0',sourceAnswer:original.key,
    notes:variableNotes+' 原PDF p.'+original.page+'。'+(calculation?.notes ?? reviewedNotes[n] ??
      '原の四択・問いの方向を保ち、説明対象や判断に使う状況を変える。'),
    build(values){
      const index=selectCase(values,count);
      if(calculation)return calculation.build(index);
      const { explanation,variants }=knowledge[n];
      if(index===0)return {prompt:[p(original.prompt)],choices:strings(original.choices),correctIndex:originalIndex,explanation};
      const selected=variants[index-1];
      return {prompt:[p(selected.prompt)],choices:strings(selected.choices??original.choices),correctIndex:selected.correctIndex,
        explanation:selected.explanation};
    },
  };
});
