import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';

export const improvementSteps = ['改善目的の確認', 'A', 'B', 'C', 'D', '実施と効果の確認'] as const;

export const improvementFlow: BookletFigureDefinition = {
  profile: 'legacy-2009-spring-am-63-improvement-steps',
  domain: [[0, 3]],
  validate(values) {
    if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > 3)
      throw new DataError('PARAMETER_CONSTRAINT', '2009年度春期旧午前問63の図の入力が範囲外です');
  },
  alt() {
    return improvementSteps.map((step, index) => 'ステップ' + (index + 1) + '：' + step).join(' → ');
  },
};

export const legacy2009SpringAm5480Figures: BookletFigureDefinition[] = [improvementFlow];
