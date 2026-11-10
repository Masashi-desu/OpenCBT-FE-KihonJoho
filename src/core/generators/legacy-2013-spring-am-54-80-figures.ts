import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { spring2013Am5480Source as source } from './legacy-2013-spring-am-54-80-source';
import {
  contractSteps, existingByNewProduct, newProducts, numberJa, oldProducts, profitConstraintRows,
  spring2013AmContractCases, spring2013AmProfitInputs, spring2013AmTransitions,
} from './legacy-2013-spring-am-54-80-models';

export const spring2013Am5480Profiles = {
  transition: 'legacy-2013-spring-am-69-customer-transition',
  profit: 'legacy-2013-spring-am-76-profit-constraints',
  contract: 'legacy-2013-spring-am-80-purchase-timeline',
} as const;

function figureDefinition(profile: string, count: number, describe: (index: number) => string): BookletFigureDefinition {
  return {
    profile,
    domain: [[0, count - 1]],
    validate(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= count) {
        throw new Error('FIGURE_DOMAIN');
      }
    },
    alt(values) {
      this.validate(values);
      return describe(values[0]);
    },
  };
}

export const legacy2013SpringAm5480Figures = [
  figureDefinition(spring2013Am5480Profiles.transition, spring2013AmTransitions.length, index => {
    if (index === 0) return source[69].figure!;
    const data = spring2013AmTransitions[index];
    const existingRows = oldProducts.map((product, row) =>
      [product, numberJa(data.existing[row] * 1000), ...data.rates[row].map(rate => (rate / 10).toFixed(1))].join('｜'));
    return [
      ['商品', '人数', ...newProducts].join('｜'),
      ...existingRows,
      ['既存顧客数', ...newProducts.map((_, to) => numberJa(existingByNewProduct(data, to)))].join('｜'),
      ['新規顧客数', ...data.incoming.map(count => numberJa(count * 1000))].join('｜'),
    ].join('。');
  }),
  figureDefinition(spring2013Am5480Profiles.profit, spring2013AmProfitInputs.length, index =>
    index === 0 ? source[76].figure! : [
      '列は製品A，製品B，制約条件', ...profitConstraintRows(spring2013AmProfitInputs[index]).map(row => row.join('｜')),
    ].join('。')),
  figureDefinition(spring2013Am5480Profiles.contract, spring2013AmContractCases.length, index => {
    if (index === 0) return source[80].figure!;
    const { buyer, seller } = spring2013AmContractCases[index];
    const steps = contractSteps.map(step => {
      const [from, to] = step.buyerSends ? [buyer, seller] : [seller, buyer];
      return ('stage' in step ? step.stage : '') + from + '社から' + to + '社へ' + step.label;
    });
    return `上段は${buyer}社（購入元），下段は${seller}社（購入先），時間は右向き。左から順に${steps.join('，')}。`;
  }),
] as const;
