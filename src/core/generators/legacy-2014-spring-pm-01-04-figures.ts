import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { displayedParallelIndexRows, ethernetCases, loopPrograms, parallelAssignments, parallelCases, partitionSizes, riskStages, sites, wordFields } from './legacy-2014-spring-pm-01-04-models';

const prefix='legacy-2014-spring-pm-';
export const spring2014Pm0104Profiles={
  risk:prefix+'1-risk-stages',word:prefix+'2-instruction-word',
  parallel:prefix+'3-parallel-process',processor:prefix+'3-shared-memory',split:prefix+'3-split-loop',
  dependence:prefix+'3-loop-dependencies',indirect:prefix+'3-indirect-writes',indices:prefix+'3-ip-answer-table',
  network:prefix+'4-network',sequence:prefix+'4-stop-and-wait',devices:prefix+'4-paired-devices',batch:prefix+'4-batch-sequence',
} as const;
const f=spring2014Pm0104Profiles;
const loopAlt=(i:number,indirect:boolean)=>{
  const c=parallelCases[i], total=indirect?20:c.split, assignment=parallelAssignments[Number(indirect)];
  const groups=indirect?c.groups:Array<number>(4).fill(total/4);
  return (indirect?'プログラム4':'並列実行が可能なループ')+'：iは1から'+total+'まで1ずつ増加。'+assignment+
    '。四つに分割。'+partitionSizes(groups).map(([lo,hi],j)=>'スレッド'+(j+1)+'はiを'+lo+'から'+hi+'まで1ずつ増加し、'+assignment+'。').join('');
};
export function spring2014Pm0104Alt(profile:string,i:number,selection=0):string{
  switch(profile){
    case f.risk:return riskStages.map(([title,...items])=>title+'：'+items.join('、')).join(' → ');
    case f.word:return 'ビット番号15から0の順。'+wordFields.map(([name,hi,lo])=>name+'がビット'+hi+'〜'+lo).join('、')+'。';
    case f.parallel:return 'プログラムAのプロセスは上からデータ作成、計算処理、結果出力。計算処理では計算用のn個のスレッドを生成し、スレッド1、2、…、nがそれぞれ部分計算処理を行う。全スレッドから同期処理へ戻る矢印。';
    case f.processor:return '上段のプログラムAのプロセスにスレッド1、スレッド2、…、スレッドn。それぞれマルチプロセッサ内のCPU1、CPU2、…、CPUnへ矢印。各CPUはバスにつながり、バスに共有メモリがつながる。';
    case f.split:return loopAlt(i,false);
    case f.dependence:return loopPrograms(i).map(([loop,body],j)=>'プログラム'+(j+1)+'：'+loop+'。'+body+'。').join('');
    case f.indirect:return loopAlt(i,true);
    case f.indices:{
      const parts=partitionSizes(parallelCases[i].groups);
      const intro='ipの列はi＝1〜20。スレッドごとの範囲は'+parts.map(([lo,hi])=>lo+'〜'+hi).join('、')+'。';
      return intro+'\n'+displayedParallelIndexRows(i,selection).map(({mark,cells})=>mark+'：'+
        parts.map(([lo,hi])=>cells.slice(lo-1,hi).join('、')).join('／')).join('\n');
    }
    case f.network:{
      const c=ethernetCases[i];
      return '広域Ethernetの四つのアクセスポイント。'+[c.main,c.sapporo,c.osaka,c.hiroshima].map((rate,j)=>
        sites[j]+'へ'+rate+'Mbps').join('、')+'。bpsはビット／秒、数字は契約した回線速度。丸印はアクセスポイント。';
    }
    case f.sequence:return '縦に時間が進む。左がファイルサーバ、右がPC。PCからサーバに読出し要求(1)、サーバからPCにデータブロック(1)、その後同じ向きに読出し要求(2)とデータブロック(2)、読出し要求(3)とデータブロック(3)が続く。読出し要求(1)の送出開始からデータブロック(1)の到着開始までが応答時間。黒い帯はデータブロックの伝送に要する時間。';
    case f.devices:return '左から本社のファイルサーバ、SW、接続装置、広域Ethernet、各営業所の接続装置、SW、PCを順に接続。SWはLANスイッチ。本社と各営業所はそれぞれ破線で囲む。';
    case f.batch:{
      const n=ethernetCases[i].batch;
      return '左からファイルサーバ、本社の接続装置、営業所の接続装置、PCの四つの時間軸。PCの読出し要求(1)が左へ順に伝わる。サーバと本社の接続装置間で要求とブロックを交互に受け渡し、両接続装置間はデータブロック'+n+'個を右へまとめて送る。営業所の接続装置からPCへは読出し要求に応じて1個ずつ送る。次の読出し要求は('+(n+1)+')、サーバ側は続いて('+(n+2)+')。注記：接続装置は、データブロック'+n+'個をまとめて送ることができる。';
    }
    default:throw Error('FIGURE_PROFILE');
  }
}
const maxima:Record<string,number>={
  [f.split]:parallelCases.length-1,[f.dependence]:parallelCases.length-1,[f.indirect]:parallelCases.length-1,
  [f.network]:ethernetCases.length-1,[f.batch]:ethernetCases.length-1,
};
export const legacy2014SpringPm0104Figures:BookletFigureDefinition[]=Object.values(f).map(profile=>{
  const domain:readonly (readonly [number,number])[]=profile===f.indices
    ? [[0,parallelCases.length-1],[0,4]]:[[0,maxima[profile]??0]];
  return {
    profile,domain,
    validate(values){
      if(values.length!==domain.length||domain.some(([minimum,maximum],j)=>
        !Number.isSafeInteger(values[j])||values[j]<minimum||values[j]>maximum))
        throw Error('FIGURE_DOMAIN');
    },
    alt:([i,selection])=>spring2014Pm0104Alt(profile,i,selection),
  };
});
export function spring2014Pm0104Diagram(profile:string,input:number|number[],caption:string) {
  const d=legacy2014SpringPm0104Figures.find(definition=>definition.profile===profile);
  if(!d)throw Error('FIGURE_PROFILE');
  const values=typeof input==='number'?[input]:input;
  d.validate(values);return figure(profile,values,caption,d.alt(values));
}
