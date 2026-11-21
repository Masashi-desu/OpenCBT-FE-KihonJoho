import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { huffmanCase, huffmanCaseCount } from './legacy-2004-spring-pm-3-model';

export function huffmanTraceColumns(condition: number) {
  const { characters, stages } = huffmanCase(condition);
  const five = stages.get(5)!.map(node => node.count);
  const four = stages.get(4)!.map(node => node.count);
  const three = stages.get(3)!.map(node => node.count);
  const two = stages.get(2)!.map(node => node.count);
  const foursBeforeSort = [...five.slice(0, 3), five[3] + five[4]];
  const threesBeforeSort = [...four.slice(0, 2), four[2] + four[3]];
  return {
    labels: ['', '(1)', '(1)', '(2)', '(1)', '(2)', '(1)', '(2)', '(1)'],
    columns: [
      [...characters.slice(0, 6).map(row => row.symbol + '｜' + row.count), '…'],
      [...characters.slice(0, 6).map(row => String(row.count)), '…'],
      five.map(String), foursBeforeSort.map(String), four.map(String), threesBeforeSort.map(String),
      ['…', '①', '…'], ['…', '②'], two.map(String),
    ],
    fourOrder: foursBeforeSort.map((value, index) => {
      const sameWeight = foursBeforeSort.slice(0, index).filter(weight => weight === value).length;
      return four.indexOf(value) + sameWeight;
    }),
  };
}

export const spring2004Pm3Figure: BookletFigureDefinition = {
  profile: 'legacy-2004-spring-pm-3-merge',
  domain: [[0, huffmanCaseCount - 1]],
  validate() {},
  alt: ([condition]) => {
    const { labels, columns } = huffmanTraceColumns(condition);
    return '文字の種類・出現回数から始め、処理(1)で並べ替え、処理(2)で最後の二つを併合する。' +
      '図の列を左から記す。' + columns.map((column, index) =>
      '列' + (index + 1) + (labels[index] ? ' 手順' + labels[index] : '') + ' ' + column.join('、')).join('。') +
      '。省略箇所は…、答える箇所は①、②で示す。';
  },
};
