import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export const layerNames=['トランスポート層','ネットワーク層','データリンク層'] as const;
const protocols=[
  {labels:['TCP','IP'],positions:[0,1,2,3]},
  {labels:['UDP','IPv6'],positions:[2,1,0,3]},
  {labels:['TCP','IPv4'],positions:[1,3,0,2]},
  {labels:['UDP','IP'],positions:[3,0,1,2]},
];
export function spring2006AmLayers(i:number,option:number) {
  const {labels,positions}=protocols[i];
  const concept=positions[option], [transport,network]=labels;
  return { labels:concept<2?[network,transport]:[transport,network], row:concept%2, protocols:labels };
}
export const spring2006AmDeviceDepth=(i:number)=>[3,1,2,7][i];
export function spring2006AmNormalForm(i:number) {
  const letters=['abcdef','abcfed','bacdfe','bacfed'][i];
  const [a,b,c,d,e,f]=letters;
  const options=[
    [[a,b],[c,d,e],[b,f]], [[a,b,c,d,e],[b,f]],[[a,b,f],[c,d,e],[b,f]], [[a,c,d,e],[b,c,d,e],[b,f]],
  ];
  const order=[[0,1,2,3],[1,0,2,3],[2,3,0,1],[3,2,1,0]][i];
  return {key:[a,b],determinant:b,dependent:f,rows:order.map(j=>options[j])};
}
const visits=[
  {initial:100,steps:[1,3,2,4]}, {initial:75,steps:[1,2,3,4]},
  {initial:215,steps:[2,4,1,3]}, {initial:340,steps:[2,3,1,4]},
];
export const spring2006AmVisit=(i:number)=>visits[i];
type Field={name:string;mark?:'primary'|'foreign'};
type Row={name:string;fields:Field[]};
const field=(name:string,mark?:Field['mark']):Field=>({name,...(mark?{mark}:{})});
const schemas=[
  ['商品','注文','顧客','商品コード','顧客コード','注文コード','商品名','単位','金額','注文数','顧客名','顧客住所'],
  ['書籍','貸出','利用者','書籍コード','利用者コード','貸出コード','書名','分類','価格','貸出日','利用者名','利用者住所'],
  ['機器','予約','社員','機器コード','社員コード','予約コード','機器名','機種','使用料','開始日','社員名','部署名'],
  ['車両','配車','運転手','車両コード','運転手コード','配車コード','車種名','形式','台数','出発時刻','運転手名','連絡先'],
];
export function spring2006AmSchema(i:number):Row[] {
  const [item,link,person,itemKey,personKey,linkKey,title,unit,cost,qty,name,address]=schemas[i];
  return [
    {name:item,fields:[field(itemKey,'primary'),field(title),field(unit),field(cost)]},
    {name:link,fields:[field(linkKey,'primary'),field(itemKey,'foreign'),field(qty),field(personKey,'foreign')]},
    {name:person,fields:[field(personKey,'primary'),field(name),field(address)]},
  ];
}

export const spring2006AmAnalyses=(i:number)=>[[0,1,2,3],[2,0,3,1],[1,3,2,0],[3,2,0,1]][i];
const geometry=[
  '右から左へ枝分かれし，末端が五つ。近い枝同士が右側へ進むにつれ順に合流して一つになる。',
  '横軸と縦軸があり，隙間のない六つの棒が左から右へ低くなる。',
  '縦軸と横軸があり，複数の右下がりの直線が囲む原点側の領域に斜線がある。',
  '右向きの太い横矢印に上下から斜めの枝が集まる。各枝の先に枠があり，さらに短い枝が付く。',
];
const sourceFigures = [
  ...Array.from({length:4},(_,option)=>({suffix:'54-option-'+(option+1),alt:(i:number)=>{
    const {labels,row}=spring2006AmLayers(i,option);
    return layerNames[row]+'に'+labels[0]+'，'+layerNames[row+1]+'に'+labels[1]+'がある。';
  }})),
  {suffix:'57-osi',alt:(i:number)=>{
    const layers=['物理層','データリンク層','ネットワーク層','トランスポート層','セッション層','プレゼンテーション層','アプリケーション層'];
    const depth=spring2006AmDeviceDepth(i);
    return 'ステーション1、2はそれぞれOSIの7層。下から'+layers.join('、')+
      '。データはステーション1から2へ向かう。LANセグメント1と2の間に装置Aがある。装置Aの下からの層は'+
      layers.slice(0,depth).join('、')+'。装置Aではその最上段の層までデータが上がり，他方のLANセグメントへ中継される。';
  }},
  {suffix:'58-dependencies',alt:(i:number)=>{
    const {key,determinant,dependent}=spring2006AmNormalForm(i);
    return 'a〜fの項目を左から並べた依存図。組合せ'+key.join('・')+'から残り4項目を特定する。項目'+determinant+'から項目'+dependent+'へも矢印がある。';
  }},
  ...Array.from({length:4},(_,option)=>({suffix:'58-option-'+(option+1),alt:(i:number)=>'表の項目：'+
    spring2006AmNormalForm(i).rows[option].map(values=>'（'+values.join('、')+'）').join('，')+'。'})),
  {suffix:'61-access',alt:(i:number)=>{
    const {steps:[r1,w1,r2,w2]}=spring2006AmVisit(i);
    return '閲覧者1と2がインターネット経由でサーバに接続する。閲覧者1：'+r1+'でアクセスカウンタを読み込み1を加算し，'+
      w1+'で処理'+r1+'の結果を書き込む。閲覧者2：'+r2+'でアクセスカウンタを読み込み1を加算し，'+
      w2+'で処理'+r2+'の結果を書き込む。';
  }},
  {suffix:'63-keys',alt:(i:number)=>spring2006AmSchema(i).map(row=>row.name+'（'+row.fields.map(item=>item.name+
    (item.mark==='primary'?'〔主キー・実線〕':item.mark==='foreign'?'〔外部キー・破線〕':'')).join('、')+'）').join('。')+'。'},
  ...Array.from({length:4},(_,option)=>({suffix:'75-option-'+(option+1),alt:(i:number)=>geometry[spring2006AmAnalyses(i)[option]]})),
];
function validate(values:number[]) {
  if(values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>3)
    throw new DataError('PARAMETER_CONSTRAINT','2006年度春期旧午前の図の入力が範囲外です');
}
export const legacy2006SpringAm5480Figures=sourceFigures.map(({suffix,alt})=>({
  profile:'legacy-2006-spring-am-'+suffix,domain:[[0,3]] as const,validate,alt:(values:number[])=>{validate(values);return alt(values[0]);},
})) satisfies readonly BookletFigureDefinition[];
export function spring2006Am5480Figure(suffix:string,i:number,caption:string) {
  const definition=legacy2006SpringAm5480Figures.find(row=>row.profile.endsWith('-'+suffix));
  if(!definition) throw new DataError('FIGURE_PROFILE','2006年度春期旧午前の図を特定できません');
  return figure(definition.profile,[i],caption,definition.alt([i]));
}
