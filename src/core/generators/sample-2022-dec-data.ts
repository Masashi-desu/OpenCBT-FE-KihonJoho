// Reviewed mathematical configurations from IPA's December 2022 B sample.
// Their displayed provenance/terms are inherited through each question's
// adapted attribution; the implementation's MIT license is not an IPA grant.
export const sampleMinimaxBoards = [
  "XOXXOO...", "XOXXOOO..", "XOXXOO.O.", "XOXXOO..O",
  "XOXXOOOX.", "XOXXOOO.X", "XOXXOOX.O", "XOXXOO.XO",
  "XOXXOOOXO", "XOXXOOOOX", "XOXXOOOXO",
];
export const sampleMinimaxChildren = [[1,2,3],[4,5],[],[6,7],[8],[9],[],[10],[],[],[]];
export const sampleMinimaxQueries = [[0,2],[1,2],[1,0]];
export function sampleMinimaxScore(index: number, reward: number): number {
  const children = sampleMinimaxChildren[index];
  if (children.length) {
    const values = children.map(i => sampleMinimaxScore(i,reward));
    return [1,3].includes(index) ? Math.min(...values) : Math.max(...values);
  }
  const board=sampleMinimaxBoards[index], lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  if(lines.some(line=>line.every(i=>board[i]==="O")))return reward;
  if(lines.some(line=>line.every(i=>board[i]==="X")))return -reward;
  return 0;
}

export function sampleTree14(singleParent: number): number[][] {
  const tree = [[2,3],[4,5],[6,7]]; let leaf = 8;
  for (let parent = 4; parent <= 7; parent++) tree.push(Array.from({length:parent===singleParent?1:2},()=>leaf++));
  return [...tree,...Array.from({length:7},()=>[] as number[])];
}
