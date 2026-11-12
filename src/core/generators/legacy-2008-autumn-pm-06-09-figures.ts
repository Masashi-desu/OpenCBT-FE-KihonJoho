import type {BookletFigureDefinition} from '../booklet-figure-extension-contract';
import {figure} from './definition';
import {selectCase} from './legacy-2016-autumn-pm-09-13-support';
import {copyChanges,copyOutput} from './legacy-2008-autumn-pm-7-model';
import {bookMethod,bookResult} from './legacy-2008-autumn-pm-8-model';

export const drawingIds=['7-output','7-marked','7-changes','8-result','8-method'] as const;
export type DrawingId=typeof drawingIds[number];
export const profile=(id:DrawingId)=>'legacy-2008-autumn-pm-'+id;
const captions:Record<DrawingId,string>={
  '7-output':'図2　集計結果の表示例',
  '7-marked':'図3　プログラム変更後の表示例',
  '7-changes':'表　プログラムの変更内容',
  '8-result':'図1　実行結果',
  '8-method':'図2　クラス PhoneBook に追加したメソッド',
};
export function drawingAlt(id:DrawingId,index:number) {
  switch(id) {
    case '7-output':return copyOutput(index,false);
    case '7-marked':return copyOutput(index,true);
    case '7-changes':return '処置｜変更内容\n'+copyChanges(index).map(([location,change])=>location+'｜\n'+change).join('\n');
    case '8-result':return bookResult(index);
    case '8-method':return bookMethod(index);
  }
}
export const drawing=(id:DrawingId,index:number)=>figure(profile(id),[index],captions[id],drawingAlt(id,index));
export const legacy2008AutumnPm0609Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id),domain:[[0,3]],
  validate(values) {selectCase(values,4);},
  alt:values=>drawingAlt(id,selectCase(values,4)),
}));
