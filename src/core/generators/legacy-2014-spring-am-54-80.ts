import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { spring2014Am5480Source as source } from './legacy-2014-spring-am-54-80-source';
import { spring2014Am5480Calculations as calculations } from './legacy-2014-spring-am-54-80-calculations';
import { spring2014Am5480Knowledge as knowledge } from './legacy-2014-spring-am-54-80-knowledge';

const reviewedNotes:Partial<Record<number,string>> = {
  55:'並行稼働の手順と費用の選択肢はどちらも一般に成立するため、各入力では尋ねる観点を明示する。',
  58:'外部専門家による助言と監査人の最終判断、報告先と改善指示、監査対象との独立を区別。',
  60:'当時のシステム管理基準を参照。原問は一般的な機能名の比較、外部資料の原文や図表を含めない。',
  65:'経済産業省平成16年基準 II.1(3) と2007年追補付録2-1 p7を確認。政府側の出典・権利参照を別記し、原問の短い項目以外の外部規定文は使わない。',
  67:'原文は2015秋67と接続語が異なるため別途照合。4つの一般的分類名と独自事例を用い、出版社の定義文や図を使わない。',
  70:'親和図法を予測手法として扱う可変案は採らない。原の手順3項と4択を維持し、横断データ、将来の経路、専門家回答の反復を区別。',
  79:'2014年の瑕疵担保責任と、2020年施行後の契約不適合・履行追完を区別。',
  80:'派遣法44条等に基づく派遣元の届出、派遣先の指揮と実際の休憩、年次有給休暇との区別を出題時点で確認。',
};

export const legacy2014SpringAm54To80Definitions:GenerationDefinition[] = Object.entries(source).map(([number,original])=>{
  const n=Number(number);
  const calculation=calculations[n];
  const count=calculation?.count ?? knowledge[n].variants.length+1;
  return {
    source:'2014h26h-fe-am-'+n,title:original.title,fields:[field('対象・条件',0,count-1)],reference:[0],
    version:'3.2.0',sourceAnswer:original.key,
    notes:variableNotes+' 原PDF p.'+original.page+'。'+(calculation?.notes ?? reviewedNotes[n] ??
      '説明対象や判断に使う状況を変え、原の四択と問いの方向を保つ。'),
    build(values){
      const index=selectCase(values,count);
      if(calculation)return calculation.build(index);
      const {explanation,variants}=knowledge[n];
      const selected=index?variants[index-1]:{
        prompt:original.prompt,choices:original.choices,correctIndex:'アイウエ'.indexOf(original.key),explanation,
      };
      return {prompt:selected.prompt.split('\n').filter(Boolean).map(p),choices:strings(selected.choices??original.choices),
        correctIndex:selected.correctIndex,explanation:selected.explanation};
    },
  };
});
