export type Pixel=readonly [row:number,column:number];
const base=['22233322','22332222','23322222','23333322','23322332','23222232','23322332','22333322'];
const starts:readonly Pixel[]=[[5,3],[4,4],[6,3],[4,8]];
const directions:readonly Pixel[]=[[-1,0],[0,-1],[1,0],[0,1]];
const leftFirst=[...directions.slice(1),directions[0]];
const neighbors=([row,column]:Pixel,order:readonly Pixel[]):Pixel[]=>order.map(([dv,dh])=>[row+dv,column+dh]);
export const paintChoices=['8-choice-a','8-choice-i','8-choice-u','8-choice-e'] as const;

export function paintInput(index:number) {
  const initial=base.map(row=>Array.from(row,Number));
  const image=initial.map((row,i)=>[row,row.slice().reverse(),initial[7-i],initial.map(other=>other[i])][index]);
  return {image,start:starts[index],newColor:1};
}
export function paintTrace(index:number,option:number):Pixel[] {
  const {image,start,newColor}=paintInput(index);
  const originalColor=image[start[0]-1][start[1]-1];
  const trace:Pixel[]=[];
  function repaint([r,c]:Pixel) {
    if(image[r-1]?.[c-1]!==originalColor) return false;
    image[r-1][c-1]=newColor;
    trace.push([r,c]);
    return true;
  }
  repaint(start);
  if(option===0) {
    function descend(pixel:Pixel) {
      for(const next of neighbors(pixel,leftFirst)) if(repaint(next)) descend(next);
    }
    descend(start);
  } else {
    const pending:Pixel[]=[start];
    const order=option===2?leftFirst:directions;
    while(pending.length) {
      const next=option===3?pending.shift()!:pending.pop()!;
      for(const pixel of neighbors(next,order)) if(repaint(pixel)) pending.push(pixel);
    }
  }
  return trace;
}
export function paintExample(index:number) {
  const input=paintInput(index);
  const result=input.image.map(row=>row.slice());
  for(const [r,c] of paintTrace(index,1)) result[r-1][c-1]=input.newColor;
  return {...input,result};
}
export const sameColorExamples=[
  {rows:[[2,2,2],[2,3,2],[2,2,2]],start:[2,2]},
  {rows:[[2,2,2,2],[2,3,3,2],[2,2,2,2]],start:[2,2]},
  {rows:[[2,2,2,2,2],[2,3,3,3,2],[2,2,2,2,2]],start:[2,3]},
] satisfies readonly {rows:number[][];start:Pixel}[];

type Line=readonly [text:string,note?:string,indent?:1];
export const paintProgram:readonly Line[]=[
  ['○符号なし8ビット整数型: Image[10, 10]','画素の色情報'],
  ['○整数型: VS, HS','開始点は Image[VS, HS]'],
  ['○符号なし8ビット整数型: CC, NC','色 CC の領域を色 NC で塗替え'],
  ['○整数型: More','処理待ちの画素の数'],
  ['○整数型: VPos[64], HPos[64]','処理待ちの画素の位置情報'],
  [''],
  ['○プログラム: Main'],
  ['○整数型: V, H','縦(V)と横(H)方向の添字用'],
  ['○符号なし8ビット整数型: Wall','表示領域の外周に格納する値'],
  [''],
  ['・CC ← Image[VS, HS]','開始点の現在の色を取得'],
  ['CC = NC'],
  ['・Return','処理を終了',1],
  [''],
  ['・Wall ← 0'],
  ['V: 1, V ≦ 8, 1','V を1～8として外周に値を設定'],
  ['・Image[V, 0] ← Wall',undefined,1],
  ['・Image[V, 9] ← Wall',undefined,1],
  [''],
  ['H: 1, H ≦ 8, 1','H を1～8として外周に値を設定'],
  ['・Image[0, H] ← Wall',undefined,1],
  ['・Image[9, H] ← Wall',undefined,1],
  [''],
  ['・More ← 0'],
  ['・CheckAndStack(VS, HS)','開始点を処理待ちの画素として登録'],
  ['More ＞ 0','More＞0 の間，次の処理を繰り返す。'],
  ['・V ← VPos[More]',undefined,1],
  ['・H ← HPos[More]',undefined,1],
  ['・More ← More − 1',undefined,1],
  ['・CheckAndStack(V − 1, H)',undefined,1],
  ['・CheckAndStack(V, H − 1)',undefined,1],
  ['・CheckAndStack(V + 1, H)',undefined,1],
  ['・CheckAndStack(V, H + 1)',undefined,1],
  [''],
  ['・Return','処理を終了'],
  [''],
  ['○副プログラム: CheckAndStack(整数型: Vt, 整数型: Ht)'],
  ['Image[Vt, Ht] = CC','同じ色の領域内か？'],
  ['・Image[Vt, Ht] ← NC',undefined,1],
  ['・More ← More + 1',undefined,1],
  ['・VPos[More] ← Vt',undefined,1],
  ['・HPos[More] ← Ht',undefined,1],
  [''],
  ['・Return','呼出し元へ戻る。'],
];
export const paintRails=[
  {from:12,to:14,kind:'if'},
  {from:16,to:19,kind:'loop'},
  {from:20,to:23,kind:'loop'},
  {from:26,to:34,kind:'loop'},
  {from:38,to:43,kind:'if'},
] as const;
