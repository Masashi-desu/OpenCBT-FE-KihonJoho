import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { expressions, hireReport, hrFileLayouts, hrRevisionLines, memory, network, overlays, sequence } from './legacy-2005-autumn-pm-01-05-models';
import { selectCase } from './legacy-2005-autumn-pm-01-05-shared';

export const profiles = {
  'dns-network':'legacy-2005-autumn-pm-1-dns-network',
  'overlay-calls':'legacy-2005-autumn-pm-2-overlay-calls',
  'overlay-order':'legacy-2005-autumn-pm-2-overlay-order',
  'overlay-plan':'legacy-2005-autumn-pm-2-overlay-plan',
  'dh-flow':'legacy-2005-autumn-pm-3-dh-flow',
  'postfix-input':'legacy-2005-autumn-pm-4-postfix-input',
  'hr-report':'legacy-2005-autumn-pm-5-hr-report',
  'hr-create':'legacy-2005-autumn-pm-5-hr-create',
  'hr-update':'legacy-2005-autumn-pm-5-hr-update',
  'hr-layout':'legacy-2005-autumn-pm-5-hr-layout',
  'hr-revised':'legacy-2005-autumn-pm-5-hr-revised',
} as const;
export type FigureKind=keyof typeof profiles;

function describePath(segment:typeof overlays[number]):string {
  const children=segment.children??[];
  return segment.id+'（'+[...segment.modules].join('、')+'）'+(children.length?'の下に'+children.map(describePath).join('、'):'');
}
const rule: Record<FigureKind,{count:number; alt:(i:number)=>string}> = {
  'dns-network':{count:4,alt:i=>{
    const {gateway,web,webSide,clientRows}=network(i);
    return 'example.co.jp内。'+gateway+'ネームサーバは左と右のネットワークを接続する。左に'+clientRows[0].map(row=>row[0]).join('、')+
      'と他のPC、右に'+clientRows[1].map(row=>row[0]).join('、')+'と他のPCが接続される。'+ (webSide===0?'左':'右')+
      'のネットワークに同じドメイン名'+web+'のWebサーバが3台接続される。';
  }},
  'overlay-calls':{count:1,alt:()=> 'AはB、D、Jを呼び出す。BはC、DはE、F、Gを呼び出す。GはH及びIを呼び出す。'},
  'overlay-order':{count:4,alt:i=>'実行順序は'+sequence.join('→')+'。αは'+memory(i).alpha+'の位置を示す。'},
  'overlay-plan':{count:3,alt:i=>'縦方向が主記憶領域。同じ高さの分岐は領域を重ねて使用する。'+describePath(overlays[i])+'。'},
  'dh-flow':{count:1,alt:()=> '共通の公開値pとαを利用者AとBに配る。AからBにYA、BからAにYBを送り、それぞれ相手の公開かぎと自分の秘密かぎでKを求める。Aは平文をKで暗号化して送り、Bは同じKで暗号文を復号して平文を取り出す。'},
  'postfix-input':{count:4,alt:i=>'Exptextの左から右の要素は'+[...expressions[i]].join('、')+'。'},
  'hr-report':{count:4,alt:i=>{
    const {date,rows}=hireReport(i);
    return '人事部、人事異動、'+date+'。社員コードと社員名の後、新、旧の順で部署名・職群・階級・職務名を示す。\n'+
      rows.map(row=>row.slice(0,2).join('／')+'　新：'+row.slice(2,6).join('／')+'　旧：'+row.slice(6).join('／')).join('\n')+'。以下省略。';
  }},
  'hr-create':{count:1,alt:()=> '開始。職務変更ファイルを使う処理1からS1ファイル。整列1でS1を社員コード昇順にしてS2。次に整列2で昇格候補ファイルを社員コード昇順にしてS3。処理2は［a］ファイルとS3を使い昇格者ファイルを作る。処理3は社員表を使ってS4を作る。処理4は［b］ファイルとS4を使い階級更新ファイルを作る。終了。'},
  'hr-update':{count:1,alt:()=> '開始。処理5は階級更新ファイルで社員表を更新。処理6はS2ファイルで社員表を更新。処理7は昇格者ファイルで社員表を更新。処理8は異動ファイルで社員表を更新。処理9は異動ファイル、社員表、部署表、職務表、旧社員表を使い、人事異動の発表資料を作る。終了。'},
  'hr-layout':{count:6,alt:i=>hrFileLayouts[i].map(([name,primary])=>name+(primary?'（主キー）':'')).join('、')+'を左から配置する。'},
  'hr-revised':{count:4,alt:i=> {
    const lines=hrRevisionLines(i);
    return lines.map(line=>line.map(run=>run.text).join('')).join('')+
      '変更部分を波線で示す。'+lines.flat().filter(run=>run.changed).map(run=>'「'+run.text+'」').join('と')+'。';
  }},
};

export const legacy2005AutumnPm0105Figures: readonly BookletFigureDefinition[]= (Object.keys(profiles) as FigureKind[]).map(kind=>{
  const {count,alt}=rule[kind];
  return {profile:profiles[kind],domain:[[0,count-1]],validate(values){selectCase(values,count-1);},alt(values){return alt(selectCase(values,count-1));}};
});
export function draw(kind:FigureKind,index:number,caption:string) {
  const {count,alt}=rule[kind];
  selectCase([index],count-1);
  return {...figure(profiles[kind],[index],caption,alt(index)),captionPresentation:'accessible' as const};
}
