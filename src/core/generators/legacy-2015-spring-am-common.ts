import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { Question } from '../types';
import { figure, p, table, type GeneratedBody } from './definition';
import { autumn2015CommonFigure, autumn2015StandardRows } from './legacy-2015-autumn-am-common';
import { legacy2017AutumnAmCommonHeading, legacy2017AutumnAmCommonPremise } from './legacy-2017-autumn-am-common';

const collection = '2015h27h-fe-am';
const title = (page: number) => `${legacy2017AutumnAmCommonHeading}（p.${page}）`;
const columns = ['試験問題での表記', '規格・標準の名称'];
// Source p.2 lists the same thirteen names and versions as the 2015 autumn paper.
// p.3 contains the same nine symbols and inversion note. Keep spring provenance.
export const spring2015StandardRows = autumn2015StandardRows;
export const spring2015CommonFigure: BookletFigureDefinition = {
  ...autumn2015CommonFigure,
  profile: 'legacy-2015-spring-am-23-common-gates',
};

export function spring2015CommonContexts(): NonNullable<GeneratedBody['contexts']> {
  return [
    { title: title(2), blocks: [p(legacy2017AutumnAmCommonPremise), p('1. 規格・標準'),
      table('規格・標準', [...columns], structuredClone(spring2015StandardRows))] },
    { title: title(3), presentation: 'text_figure', blocks: [figure(spring2015CommonFigure.profile, [0], '図記号と説明', spring2015CommonFigure.alt([0]))] },
  ];
}

export function isSpring2015CommonContext(question: Question, context: Question['contexts'][number]): boolean {
  const sourceId = `source-ipa-${collection}-qs`;
  if (!question.origin.sourceRefs.some(ref => ref.sourceId === sourceId && ref.locator.year === 2015 &&
    ref.locator.period === '春期' && ref.locator.timeSlot === '午前' && ref.locator.questionNumber)) return false;
  const page = context.title === title(2) ? 2 : context.title === title(3) ? 3 : undefined;
  if (!page) return false;
  const blocks = context.content.blocks;
  if (question.origin.kind === 'official_reprint')
    return context.id === `context-${collection}-common-${page}` && blocks.length === 1 && blocks[0].type === 'image' &&
      blocks[0].assetId === `asset-ipa-${collection}-common-${page}` && context.content.attribution.sourceRefs.some(ref =>
        ref.sourceId === sourceId && ref.locator.page === page && !ref.locator.questionNumber);
  if (page === 3) return blocks.length === 1 && blocks[0].type === 'diagram' && blocks[0].scene.kind === 'source_figure' &&
    blocks[0].scene.profile === spring2015CommonFigure.profile && blocks[0].scene.values.length === 1 && blocks[0].scene.values[0] === 0;
  return blocks.length === 3 && blocks[0].type === 'paragraph' && blocks[0].text === legacy2017AutumnAmCommonPremise &&
    blocks[1].type === 'paragraph' && blocks[1].text === '1. 規格・標準' && blocks[2].type === 'table' &&
    JSON.stringify(blocks[2].columns) === JSON.stringify(columns) && JSON.stringify(blocks[2].rows) === JSON.stringify(spring2015StandardRows);
}
