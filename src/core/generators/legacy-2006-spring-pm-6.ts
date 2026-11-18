import {code,p} from './definition';
import {bank,draftQuestion,numbered,type Page} from './legacy-2006-spring-pm-06-09-support';
import {drawing,routes,targetFigures,widths} from './legacy-2006-spring-pm-06-09-figures';

const selectionNotice='次の問6から問9までの4問については，この中から1問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。';
const tests=['dim <= 0','dim <= 1','dim == 1','dim != 0','dim != 1'];
const depths=['dim--','dim - 1','dim','dim + 1','dim++'];
const mainLine=(width:number,depth:number)=>'KochCurve( 0, '+width+', '+width+', '+width+', '+depth+' );';

function program(width:number,original:boolean){
  return numbered([
    '#include <stdio.h>',
    '#include <math.h>',
    '#define PI 3.141593',
    'void DrawLine( int, int, int, int );',
    'void KochCurve( int x1, int y1, int x2, int y2, int dim )',
    '{',
    '    int x3, y3, x4, y4, x5, y5;',
    '    if ( ［a］ )',
    '        DrawLine( x1, y1, x2, y2 );',
    '    else {',
    '        x3 = ( 2 * x1 + x2 ) / 3;',
    '        y3 = ( 2 * y1 + y2 ) / 3;',
    '        x5 = ( x1 + 2 * x2 ) / 3;',
    '        y5 = ( y1 + 2 * y2 ) / 3;',
    '        x4 = x3 + (x5 - x3) * cos(PI/3) + (y5 - y3) * sin(PI/3);',
    '        y4 = y3 - (x5 - x3) * sin(PI/3) + (y5 - y3) * cos(PI/3);',
    '        KochCurve( x1, y1, x3, y3, ［b］ );',
    '        KochCurve( x3, y3, x4, y4, ［b］ );',
    '        KochCurve( x4, y4, x5, y5, ［b］ );',
    '        KochCurve( x5, y5, x2, y2, ［b］ );',
    '    }',
    '}',
    original?'void main()':'int main(void)',
    '{',
    '    '+mainLine(width,1),
    '}',
  ], new Set([4, 8]));
}

export const q6=draftQuestion(6,'C：コッホ曲線の再帰と線分の向き','描画座標と求める四辺の突起方向','設問1 a=ア b=イ／設問2 ア',
  'コッホ曲線の生成手順、三等分、進行方向左側の頂点、整数座標、下向きがy軸正方向、再帰の基底判定と次の深さ、図に対応する4呼出しの5択を保持。四辺の長さと図2の突起の向きを変更する。原版のvoid mainを保持し、生成はint main(void)とする。図は原紙に沿った幾何学的な形で、実行時のint切捨てとPI近似により深さ2では各座標が理想形から4座標単位未満になることを独立に検査し，四辺の向きと線分数も照合する。ウとオは開始辺が違う同向き4辺で、元の順序を保ったまま正答にならない状態とする。',(index,original)=>{
  const width=widths[index], answer=targetFigures[index];
  const options=routes(width).map(steps=>steps.map(([from,to])=>'KochCurve( '+[...from,...to].map(value=>String(value).padStart(3)).join(', ')+', 2 );').join('\n'));
  const pages:Page[]=[
    {page:25,altPrefix:selectionNotice,blocks:[
      p('問6　次の C プログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),p('〔プログラムの説明〕'),
      p('Helge von Koch が考案したコッホ曲線と呼ばれるフラクタル図形を描画する関数 KochCurve である。フラクタル図形は，図形の一部を拡大すると，再び，同様の図形が現れる自己相似性をもち，コッホ曲線はその代表的な図形である。'),
      p('（1）図1の①〜③にコッホ曲線の生成手順を示す。'),drawing('6-koch-steps',index),
      p('①　始点の座標を (x1, y1)，終点を (x2, y2) とする2点を結ぶ線分を引く。'),
      p('②　線分を3等分し，中央の線分を一辺とする正三角形を始点から終点に向かって左側に作り，その頂点座標を求める。始点 (x1, y1) から，正三角形の3頂点 (x3, y3)，(x4, y4)，(x5, y5)，そして終点 (x2, y2) を順番に結んだ四つの線分を引く。'),
    ]},
    {page:26,blocks:[
      p('③　得られた四つの線分それぞれを①の線分とみなし，②の操作を行う。この操作を繰り返して得られるのがコッホ曲線である。'),
      p('（2）関数 DrawLine は，引数で指定された2点を結ぶ線分を描画する関数であり，既に用意されている。関数の仕様は，次のとおりである。'),
      p('呼出し形式：'),code('void DrawLine( int x1, int y1, int x2, int y2 );','c'),
      p('引数： x1 及び y1　線分の始点座標 (x1, y1)　x2 及び y2　線分の終点座標 (x2, y2)'),
      p('返却値： なし'),
      p('（3）関数 KochCurve は，引数で指定された2点（始点及び終点）の座標を基点にしてコッホ曲線を描画する関数であり，仕様は次のとおりである。'),
      p('呼出し形式：'),code('void KochCurve( int x1, int y1, int x2, int y2, int dim );','c'),
      p('引数： x1 及び y1　コッホ曲線の始点座標 (x1, y1)　x2 及び y2　コッホ曲線の終点座標 (x2, y2)　dim　(1)の説明での繰返し回数。0のとき図1の①が描画される。'),
      p('返却値： なし'),
      p('（4）このプログラムを実行すると，図1の②に示すような図形が描画される。また，行番号25を次のとおりに変更して実行すると，③に示すような図形が描画される。'),
      code('25  '+mainLine(width,2),'c'),p('なお，座標軸は，原点 (0, 0) から，右向きを x 軸の正方向，下向きを y 軸の正方向とする。'),
    ]},
    {page:27,blocks:[p('〔プログラム〕'),p('（行番号）'),code(program(width,original),'c'),
      p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')],
      banks:[bank('a',tests,'ア','c',1),bank('b',depths,'イ','c',1)]},
    {page:28,blocks:[p('設問2　図2の図形を描画するためには，関数 main の行番号25をどのように変更すればよいか。正しい答えを，解答群の中から選べ。'),
      drawing('6-koch-target',index)],banks:[bank('s',options,'アイウエオ'[answer],'c',2,'解答群')]},
  ];
  return {pages,explanation:'dim が0以下なら線分を1本引いて終わり，それ以外では4辺を dim − 1 で個別に再帰させる。正三角形の頂点は始点から終点へ向かって左側に作る。図2の座標は下がyの正方向なので，例えば左辺を上から下にたどると曲線は正方形の内側に向く。この方向と各辺の突起位置を四辺とも照合した呼出し列が「'+'アイウエオ'[answer]+'」。'};
});
