import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { autumn2015PmCase } from './legacy-2015-autumn-pm-01-04-shared';
import { registerCases, wordHex } from './legacy-2007-spring-pm-1-model';
import { assignmentColumns, divisions, organizationColumns } from './legacy-2007-spring-pm-2-model';
import { activities } from './legacy-2007-spring-pm-3-model';
import { sortCases } from './legacy-2007-spring-pm-4-model';
import { fields, mergeCases } from './legacy-2007-spring-pm-5-model';

export const profiles = {
  word:'legacy-2007-spring-pm-1-word', registers:'legacy-2007-spring-pm-1-registers',
  organization:'legacy-2007-spring-pm-2-organization', 'organization-plans':'legacy-2007-spring-pm-2-organization-plans',
  'organization-assignment':'legacy-2007-spring-pm-2-organization-assignment',
  network:'legacy-2007-spring-pm-3-network', sorting:'legacy-2007-spring-pm-4-sorting',
  record:'legacy-2007-spring-pm-5-record', merge:'legacy-2007-spring-pm-5-merge', change:'legacy-2007-spring-pm-5-change',
} as const;
export type FigureKind=keyof typeof profiles;
const schema=(lines:readonly (readonly string[])[])=>lines.map(line=>line[0]+'：'+line.slice(1).join('、')+'。主キーの下線は'+line[1]+'。').join('');
const descriptors:Record<FigureKind,{count:number;alt:(index:number)=>string}>={
  word:{count:1,alt:()=> 'ビット番号15〜8は命令部op、ビット番号7〜0はオペランド部。7〜4がr、3〜0がv。'},
  registers:{count:4,alt:index=>registerCases[index].registers.map((value,i)=>(i+1)+'：'+wordHex(value)).join('、')+'。'},
  organization:{count:1,alt:()=>divisions.map(row=>row.name+'（'+row.code+'）の下に'+row.staff.map(staff=>'（'+staff[0]+'）'+staff[1]).join('、')+'。').join('')},
  'organization-plans':{count:1,alt:()=>schema(organizationColumns)},
  'organization-assignment':{count:1,alt:()=>schema(assignmentColumns)},
  network:{count:1,alt:()=>activities.map(([id,from,to])=>from+'→'+to+' '+id).join('、')+'。5→6は破線のダミー作業。'},
  sorting:{count:4,alt:index=>{
    const {base,rows}=sortCases[index];
    return 'A[]の要素番号'+base+'〜'+(base+6)+'。'+rows.map((row,i)=>'例'+(i+1)+'：'+row.join('，')+'。').join('');
  }},
  record:{count:1,alt:()=>fields.join('、')+'の順のレコード様式。'},
  merge:{count:4,alt:index=>{
    const down=mergeCases[index].order==='降順';
    const limit=down?'最小値':'最大値';
    return '主処理。各ファイルを開く→M入力処理→T入力処理。照合、Kₘ＝'+limit+'かつKₜ＝'+limit+
      'まで繰返す。破線内でKₘとKₜを比較。'+(down?'＞':'＜')+'ならM′を出力しa。＝ならαでTの空白以外の項目をM′の対応する欄に転記し、T入力処理の後でM′を出力しa。'+
      (down?'＜':'＞')+'ならβでTを出力してb。照合を終えたら各ファイルを閉じ、終了。注 M′は作業用記憶。M入力処理：マスタファイルを読み、終わりならKₘ←'+limit+
      '、そうでなければKₘ←Mの会員番号とM′←M。終了。T入力処理：トランザクションファイルを読み、終わりならKₜ←'+limit+
      '、そうでなければKₜ←Tの会員番号。終了。';
  }},
  change:{count:4,alt:index=>{
    const down=mergeCases[index].order==='降順';
    const limit=down?'最小値':'最大値';
    return '主処理。各ファイルを開く→M入力処理→T入力処理。Kₘ＝'+limit+'かつKₜ＝'+limit+
      'まで照合を繰り返す。更新区分を分岐。条件X1は図1の破線内と同じ。条件X2はエラー処理1の後にT入力処理。条件X3はKₘとKₜを照合し，'+
      (down?'＞':'＜')+'のときM′を出力してM入力処理、＝のときT入力処理をしてからM入力処理、'+(down?'＜':'＞')+
      'のときエラー処理2の後にT入力処理。照合終了後、各ファイルを閉じて終了。';
  }},
};
export const legacy2007SpringPm0105Figures:readonly BookletFigureDefinition[]=(Object.keys(profiles) as FigureKind[]).map(kind=>{
  const {count,alt}=descriptors[kind];
  return {profile:profiles[kind],domain:[[0,count-1]],validate(values){autumn2015PmCase(values,count-1);},
    alt(values){return alt(autumn2015PmCase(values,count-1));}};
});
export function draw(kind:FigureKind,index:number,caption:string){
  const {count,alt}=descriptors[kind]; autumn2015PmCase([index],count-1);
  return {...figure(profiles[kind],[index],caption,alt(index)),captionPresentation:'accessible' as const};
}
