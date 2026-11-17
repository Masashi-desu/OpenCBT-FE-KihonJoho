export const activities = [
  ['S1',1,2,'システム方式設計'],['G1',2,3,'業務プログラムの共通部品の定義'],
  ['G2',3,6,'業務プログラムの機能設計'],['G3',6,7,'業務プログラムの詳細設計'],
  ['G4',7,8,'業務プログラムのコーディング・単体テスト'],['C1',3,5,'共通部品の設計（インタフェース決定）'],
  ['C2',5,7,'共通部品のコーディング・単体テスト'],['H1',2,4,'ハードウェアの調達'],
  ['H2',4,9,'ハードウェアの環境構築'],['S2',8,9,'結合テスト'],['S3',9,10,'実機テスト'],
] as const;
export const durations = [
  [6,2,4,6,6,6,4,15,6,6,4], [5,2,3,4,6,5,8,14,6,6,4],
  [6,2,8,4,5,4,5,16,7,5,4], [6,2,3,4,5,4,4,21,7,5,4],
] as const;
export const paths = [[1,2,3,5,6,7,8,9,10],[1,2,3,5,7,8,9,10],[1,2,3,6,7,8,9,10],[1,2,4,9,10]] as const;
export function pathLength(path: readonly number[], values: readonly number[]) {
  return path.slice(1).reduce((total,next,i)=>{
    const index = activities.findIndex(([,from,to])=>from === path[i] && to === next);
    return total + (index < 0 ? 0 : values[index]);
  },0);
}
