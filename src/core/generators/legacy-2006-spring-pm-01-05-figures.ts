import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2006-spring-pm-01-05-shared';
import { customerColumns, salesColumns } from './legacy-2006-spring-pm-01-05-models';

export const profiles = {
  'otp-system': 'legacy-2006-spring-pm-2-otp-system',
  'otp-flow': 'legacy-2006-spring-pm-2-otp-flow',
  'file-layout': 'legacy-2006-spring-pm-5-file-layout',
  'file-flow': 'legacy-2006-spring-pm-5-file-flow',
  'module-tree': 'legacy-2006-spring-pm-5-module-tree',
} as const;
export type FigureKind = keyof typeof profiles;

const models: Record<FigureKind, { count: number; alt: (index: number) => string }> = {
  'otp-system': { count: 1, alt: () =>
    '使い捨てパスワード生成装置、利用者、クライアントPC、ネットワーク、サーバを左から並べる。利用者から装置とPCへの矢印は入力、装置とPCから利用者への矢印は表示。クライアントPCとサーバをネットワークで結ぶ。' },
  'otp-flow': { count: 1, alt: () =>
    '時間は上から下へ進む。縦の順に、利用者からPCへログイン操作、①PCからサーバへ利用者ID、②サーバからPCへパスワード要求、PCから利用者へ表示。利用者から生成装置へK、生成装置から利用者へotp(n)。利用者からPCへパスワード入力、③PCからサーバへotp(n)、④サーバからPCへログイン可否メッセージ、PCから利用者へ表示。' },
  'file-layout': { count: 1, alt: () =>
    '売上伝票ファイルは' + salesColumns.join('、') + '。応募者ファイルは顧客番号。顧客マスタファイルとあて先ファイルはそれぞれ' +
    customerColumns.join('、') + 'を左から並べる。' },
  'file-flow': { count: 1, alt: () =>
    '売上伝票ファイルから前処理を経て中間ファイルへ。中間ファイル、応募者ファイル及び顧客マスタファイルはあて先ファイル作成処理に接続する。あて先ファイル作成処理はあて先ファイルを出力する。' },
  'module-tree': { count: 1, alt: () =>
    'あて先ファイル作成の下に初期処理、主処理、終了処理。主処理は反復し、その直下は処理A、あて先処理、処理Bへの条件分岐。あて先処理の直下にあて先編集、処理C、処理D。' },
};

export const legacy2006SpringPm0105Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as FigureKind[]).map(kind => {
  const { alt, count } = models[kind];
  return {
    profile: profiles[kind], domain: [[0, count - 1]],
    validate(values) { selectCase(values, count - 1); },
    alt(values) { return alt(selectCase(values, count - 1)); },
  };
});

export function draw(kind: FigureKind, index: number, caption: string) {
  const { count, alt } = models[kind];
  selectCase([index], count - 1);
  return { ...figure(profiles[kind], [index], caption, alt(index)), captionPresentation: 'accessible' as const };
}
