import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';

export const drawNames=['9-word-format','9-keep-data','9-replacements'] as const;
export type DrawName=typeof drawNames[number];
export const profile=(name:DrawName)=>'legacy-2006-autumn-pm-'+name;
const captions:Record<DrawName,string>={
  '9-word-format':'図1　COMBINE と DIVIDE のデータ形式と結果',
  '9-keep-data':'図2　変更後のデータ形式と結果',
  '9-replacements':'α・βの置換内容',
};
export const exampleWidths=[[8,4],[3,7],[4,12],[1,5]] as const;
export const replacementLines=[
  ['LD    GR7,=#FFFF','SRL   GR7,0,GR2','［d］       ; 元のデータを取り出す。','OR    GR0,GR7','ST    GR0,0,GR1'],
  ['LD    GR7,=#FFFF','SRL   GR7,0,GR4','AND   GR7,0,GR3','［e］       ; データを結合する。','ST    GR5,0,GR3'],
] as const;
export function drawingAlt(name:DrawName,index:number) {
  if(name==='9-replacements') return '処置と変更内容\nαを置換：\n'+replacementLines[0].join('\n')+'\n\nβを置換：\n'+replacementLines[1].join('\n');
  const [m,n]=exampleWidths[index];
  const sample=index===0?'':' 図の幅の例では m＝'+m+'，n＝'+n+'。';
  if(name==='9-word-format') return 'COMBINE：C1 の左 m ビット（網掛け），C2 の左 n ビット（塗りつぶし）。GR0 の左から m ビット，n ビット，残りは0。\nDIVIDE：GR0 の左から m ビット（網掛け）と n ビット（塗りつぶし）。D1 は左 m ビット，D2 は左 n ビット，残りはどちらも0。'+sample;
  return 'GR0 の左から m ビット（網掛け），n ビット（塗りつぶし）。D1 の左 m ビットと D2 の左 n ビットに分割し，各語の残りは元のデータを保持する。'+sample;
}
export const drawing=(name:DrawName,index:number)=>figure(profile(name),[index],captions[name],drawingAlt(name,index));
export const legacy2006AutumnPm0609Figures:readonly BookletFigureDefinition[]=drawNames.map(name=>({
  profile:profile(name),domain:[[0,3]],
  validate(values){ selectCase(values,4); },
  alt:values=>drawingAlt(name,selectCase(values,4)),
}));
