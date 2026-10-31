/** Annual source geometry. Curves retain the four original semantic roles;
 * the three sets change their actual curvature, not the labels or order. */
export const legacy2017DevelopmentCurvePaths = [
 [
  'M 95 280 C 200 270 305 210 365 45',
  'M 95 45 C 105 170 190 250 350 280',
  'M 95 280 L 365 45',
  'M 95 280 C 150 260 145 180 200 120 C 250 50 300 45 365 45',
 ],
 [
  'M 95 280 C 190 274 295 235 370 60',
  'M 95 55 C 110 185 210 255 360 280',
  'M 95 280 L 370 65',
  'M 95 280 C 135 265 135 165 190 100 C 235 65 300 60 370 60',
 ],
 [
  'M 95 280 C 210 262 325 170 370 50',
  'M 95 40 C 110 150 175 230 365 280',
  'M 95 280 L 350 40',
  'M 95 280 C 160 270 175 190 220 120 C 265 50 315 40 370 40',
 ],
] as const;

export const legacy2017DevelopmentCurveDescriptions = [
 'テスト消化につれて発見の増え方が加速する右上がりの曲線',
 'テスト消化につれて累積件数が減少する右下がりの曲線',
 'テスト消化に比例して累積件数が増え続ける直線',
 '当初増えた後、追加のバグ発見が少なくなり、累積件数が頭打ちへ近づくS字状の曲線',
] as const;

export const legacy2017DevelopmentCoverageWires = [
 { id:'start-first', d:'M 360 25 L 360 80', head:false },
 { id:'first-true-assign', d:'M 480 130 L 620 130 L 620 175', head:false },
 { id:'first-false-merge', d:'M 360 180 L 360 275', head:false },
 { id:'first-assign-merge', d:'M 620 235 L 620 275 L 360 275', head:true },
 { id:'first-merge-second', d:'M 360 275 L 360 320', head:false },
 { id:'second-true-assign', d:'M 510 370 L 620 370 L 620 415', head:false },
 { id:'second-false-merge', d:'M 360 420 L 360 520', head:false },
 { id:'second-assign-merge', d:'M 620 475 L 620 520 L 360 520', head:true },
 { id:'second-merge-end', d:'M 360 520 L 360 565', head:false },
] as const;
