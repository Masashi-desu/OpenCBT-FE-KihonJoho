import {figure} from './definition';
import type {BookletFigureDefinition} from '../booklet-figure-extension-contract';
import {selectCase} from './legacy-2016-autumn-pm-09-13-support';

export type Point=readonly [x:number,y:number];
export type Segment=readonly [from:Point,to:Point];
export const widths=[180,162,216,243];
export const targetFigures=[0,1,3,0];
export const names=['6-koch-steps','6-koch-target','9-oblong'] as const;
export type FigureName=typeof names[number];
const caption:Record<FigureName,string>={
  '6-koch-steps':'図1　コッホ曲線の生成手順',
  '6-koch-target':'図2　描画したい図形',
  '9-oblong':'長方形と対角の二つの頂点',
};
export const profile=(name:FigureName)=>'legacy-2006-spring-pm-'+name;

export function routes(width:number):Segment[][]{
  const nw:Point=[0,0],ne:Point=[width,0],sw:Point=[0,width],se:Point=[width,width];
  return [
    [[nw,sw],[sw,se],[se,ne],[ne,nw]],
    [[nw,ne],[ne,se],[se,sw],[nw,sw]],
    [[nw,ne],[ne,se],[se,sw],[sw,nw]],
    [[nw,ne],[ne,se],[nw,sw],[sw,se]],
    [[ne,se],[se,sw],[sw,nw],[nw,ne]],
  ];
}
const interpolate=(a:Point,b:Point,k:number):Point=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
const join=(from:Point,to:Point):[Point,Point,Point,Point,Point]=>{
  const third=interpolate(from,to,1/3),twoThirds=interpolate(from,to,2/3),mid=interpolate(third,twoThirds,.5);
  const rise:Point=[mid[0]+(twoThirds[1]-third[1])*Math.sqrt(3)/2,mid[1]-(twoThirds[0]-third[0])*Math.sqrt(3)/2];
  return [from,third,rise,twoThirds,to];
};
export function koch(from:Point,to:Point,depth:number):Point[] {
  if(depth===0) return [from,to];
  const points=join(from,to);
  return [...points.slice(0,-1).flatMap((point,i)=>koch(point,points[i+1],depth-1).slice(0,-1)),to];
}

export function description(name:FigureName,condition:number):string {
  if(name==='6-koch-steps') return '①の線分を左から右へ (x1, y1)、(x2, y2) の順に結ぶ。②は中央の三分の一を外側へ出る二辺に置き換え、左から (x3, y3)、上の (x4, y4)、右の (x5, y5) を経て終点へ達する。③は②の四線分に同じ置換えを行い、左右の短い突起と中央の大きな突起の周囲が細分化される。';
  if(name==='6-koch-target') {
    const width=widths[condition], target=targetFigures[condition];
    const sideDescription=[
      '4辺とも突起が正方形の内部に向く。',
      '左辺の突起だけ内部、上辺、右辺、下辺の突起は外部に向く。',
      '',
      '左辺と下辺の突起は内部、上辺と右辺の突起は外部に向く。',
    ];
    return '四隅は左上(0, 0)、右上('+width+', 0)、左下(0, '+width+')、右下('+width+', '+width+')。各辺にコッホ曲線の2回の置換えがある。'+sideDescription[target];
  }
  return '横軸はx、縦軸はy、交点が原点(0, 0)。長方形の辺は二つの軸に平行で、左下の頂点が A (x1, y1)、右上の頂点が B (x2, y2)。';
}
export const drawing=(name:FigureName,index:number)=>figure(profile(name),[index],caption[name],description(name,index));
export const legacy2006SpringPm0609Figures:readonly BookletFigureDefinition[]=names.map(name=>({
  profile:profile(name),domain:[[0,3]],
  validate(values){selectCase(values,4);},alt:values=>description(name,selectCase(values,4)),
}));
