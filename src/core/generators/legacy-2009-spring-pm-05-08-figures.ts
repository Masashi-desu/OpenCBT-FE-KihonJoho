import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { riskAt } from './legacy-2009-spring-pm-6-model';
import { demandAt } from './legacy-2009-spring-pm-7-model';
import { paintChoices,paintExample,paintInput,paintProgram,paintRails,paintTrace,sameColorExamples } from './legacy-2009-spring-pm-8-model';

export const drawingIds=[
  '5-modules','5-sequence','6-formula','6-pert','7-series','7-history','8-example','8-program','8-same',...paintChoices,
] as const;
export type DrawingId=typeof drawingIds[number];
export const profile=(id:DrawingId)=>'legacy-2009-spring-pm-'+id;
const captions={
  '5-modules':'図　プログラムを構成する各モジュール間の関連',
  '5-sequence':'預払トランザクション構成モジュールでの処理順',
  '6-formula':'3点見積法の計算式',
  '6-pert':'表2　3点見積法によるスケジュールリスク分析',
  '7-series':'図　製品 X，Y，Z の過去3年間の需要実績',
  '8-program':'〔プログラム〕',
  '8-same':'図2　1画素，2画素，3画素からなる領域',
  '8-choice-a':'最初の五つの塗替え順',
  '8-choice-i':'最初の五つの塗替え順',
  '8-choice-u':'最初の五つの塗替え順',
  '8-choice-e':'最初の五つの塗替え順',
};
export function drawingCaption(id:DrawingId,index:number) {
  if(id==='8-example') {
    const {start:[r,c],newColor}=paintInput(index);
    return `図1　プログラムの実行例（NC＝${newColor}，VS＝${r}，HS＝${c}の場合）`;
  }
  if(id==='7-history') return '表　製品'+demandAt(index).example+'の過去7か月の需要実績';
  return captions[id];
}
const rowsText=(rows:readonly (readonly number[])[])=>rows.map(row=>row.join('')).join('／');
export function drawingAlt(id:DrawingId,index:number):string {
  switch(id) {
    case '5-modules':return 'ATMは預払トランザクション構成モジュールにつながる。預払トランザクション構成モジュールと月末処理モジュールは，それぞれデータベースとデータベース更新モジュールにつながる。データベース更新モジュールもデータベースにつながる。';
    case '5-sequence':return '［a］→［b］→［c］→処理C。a，b，c は解答欄。';
    case '6-formula':return '平均＝(悲観値＋4×最頻値＋楽観値)÷6。分散＝((悲観値−楽観値)÷6)²。標準偏差＝√分散。開発全体の標準偏差＝√(分散の合計)。';
    case '6-pert':{
      const {rows,variance,sigma}=riskAt(index);
      return '列は作業名，作業日数の悲観値・最頻値・楽観値，平均作業日数，分散，標準偏差。'+
        rows.map((row,i)=>(i===0?'M3の新規開発':'M2の改造')+'：'+row.join('，')).join('。')+
        '。開発全体：作業日数の三つと平均作業日数は網掛けで非表示。分散 '+variance+'，標準偏差 '+sigma+'。';
    }
    case '7-series':{
      const {months}=demandAt(index);
      return '縦軸は需要実績（個）0～400を50刻み，横軸は2006年1月～2008年12月で1，4，7，10月に目盛。数値は図の読取り用（基準の図からは近似値）。'+
        months.map((series,i)=>'。製品'+'XYZ'[i]+'（'+['実線','点線','破線'][i]+'），1月から順に月ごとの値：'+series.join('，')).join('')+'。';
    }
    case '7-history':return '年：2008年。月：6月，7月，8月，9月，10月，11月，12月。需要実績：'+demandAt(index).history.join('，')+'。';
    case '8-example':{
      const {start:[r,c],image,result}=paintExample(index);
      return '実行前と実行後を並べる。各8×8の外側に破線の1画素分がある。左図の第1行第1列が Image[1, 1]。開始点 Image['+r+', '+c+
        '] を太枠で示す。黒1，灰2，白3。上から行ごとに，実行前：'+rowsText(image)+'。実行後：'+rowsText(result)+'。';
    }
    case '8-program':{
      const end=(number:number)=>paintRails.find(rail=>rail.to===number);
      const start=(number:number)=>paintRails.find(rail=>rail.from===number);
      return paintProgram.map(([line,note,indent],i)=>{
        const number=i+1, from=start(number), to=end(number);
        return number+' '+(indent?'　　':'')+(from?(from.kind==='if'?'▲ ':'■ '):'')+
          line+(note?' /* '+note+' */':'')+(to?(to.kind==='if'?'▼':'■'):'');
      }).join('\n');
    }
    case '8-same':return sameColorExamples.map(({rows,start:[r,c]},i)=>
      ['①','②','③'][i]+(i+1)+'画素，'+rows.length+'行'+rows[0].length+'列，灰2・白3で上から '+rowsText(rows)+'，開始点の太枠は第'+r+'行第'+c+'列。').join(' ');
    default:{
      const {image}=paintInput(index);
      const order=paintTrace(index,paintChoices.indexOf(id)).slice(0,5);
      return '黒1，灰2，白3。塗替え前の画素を上から行ごとに '+rowsText(image)+'。黒く塗り替えられた画素内にある1～5の番号の座標は，行・列の順で '+order.map(([r,c])=>'('+r+', '+c+')').join(' → ')+'。';
    }
  }
}
export const drawing=(id:DrawingId,index=0)=>figure(profile(id),[index],drawingCaption(id,index),drawingAlt(id,index));
export const legacy2009SpringPm0508Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id),domain:[[0,3]],
  validate(values) {
    if(values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>3)
      throw new DataError('FIGURE_PROFILE','図の値が登録された入力域と一致しません。');
  },
  alt:([index])=>drawingAlt(id,index),
}));
