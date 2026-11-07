import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { Question } from '../types';
import { figure, p, table, type GeneratedBody } from './definition';
import {
  legacy2017AutumnAmCommonAlt,
  legacy2017AutumnAmCommonHeading,
  legacy2017AutumnAmCommonPremise,
} from './legacy-2017-autumn-am-common';

const collection = '2015h27a-fe-am';
const title = (page: number) => `${legacy2017AutumnAmCommonHeading}（p.${page}）`;
const columns = ['試験問題での表記', '規格・標準の名称'];
export const autumn2015StandardRows = [
  ['JIS Q 9001', 'JIS Q 9001:2008'],
  ['JIS Q 14001', 'JIS Q 14001:2004'],
  ['JIS Q 15001', 'JIS Q 15001:2006'],
  ['JIS Q 20000-1', 'JIS Q 20000-1:2012'],
  ['JIS Q 20000-2', 'JIS Q 20000-2:2013'],
  ['JIS Q 27000', 'JIS Q 27000:2014'],
  ['JIS Q 27001', 'JIS Q 27001:2014'],
  ['JIS Q 27002', 'JIS Q 27002:2014'],
  ['JIS X 0160', 'JIS X 0160:2012'],
  ['ISO 21500', 'ISO 21500:2012'],
  ['ITIL', 'ITIL 2011 edition'],
  ['PMBOK', 'PMBOK ガイド 第5版'],
  ['共通フレーム', '共通フレーム 2013'],
];
export const autumn2015CommonProfile = 'legacy-2015-autumn-am-23-common-gates';
const gateAlt = legacy2017AutumnAmCommonAlt().replace(
  legacy2017AutumnAmCommonHeading + '。' + legacy2017AutumnAmCommonPremise,
  '2. 論理回路。',
);
export const autumn2015CommonFigure: BookletFigureDefinition = {
  profile: autumn2015CommonProfile,
  domain: [[0, 0]],
  validate() {},
  alt: () => gateAlt,
};

export function autumn2015CommonContexts(): NonNullable<GeneratedBody['contexts']> {
  return [
    { title: title(2), blocks: [p(legacy2017AutumnAmCommonPremise), p('1. 規格・標準'),
      table('規格・標準', [...columns], structuredClone(autumn2015StandardRows))] },
    { title: title(3), presentation: 'text_figure', blocks: [figure(autumn2015CommonProfile, [0], '図記号と説明', gateAlt)] },
  ];
}

export function isAutumn2015CommonContext(question: Question, context: Question['contexts'][number]): boolean {
  if (!question.origin.sourceRefs.some(ref => ref.sourceId === `source-ipa-${collection}-qs` &&
    ref.locator.year === 2015 && ref.locator.period === '秋期' && ref.locator.timeSlot === '午前' && ref.locator.questionNumber)) return false;
  const page = context.title === title(2) ? 2 : context.title === title(3) ? 3 : undefined;
  if (!page) return false;
  const blocks = context.content.blocks;
  if (question.origin.kind === 'official_reprint')
    return context.id === `context-${collection}-common-${page}` && blocks.length === 1 && blocks[0].type === 'image' &&
      blocks[0].assetId === `asset-ipa-${collection}-common-${page}` && context.content.attribution.sourceRefs.some(ref =>
        ref.sourceId === `source-ipa-${collection}-qs` && ref.locator.page === page && !ref.locator.questionNumber);
  if (page === 3) return blocks.length === 1 && blocks[0].type === 'diagram' && blocks[0].scene.kind === 'source_figure' &&
    blocks[0].scene.profile === autumn2015CommonProfile && blocks[0].scene.values.length === 1 && blocks[0].scene.values[0] === 0;
  return blocks.length === 3 && blocks[0].type === 'paragraph' && blocks[0].text === legacy2017AutumnAmCommonPremise &&
    blocks[1].type === 'paragraph' && blocks[1].text === '1. 規格・標準' && blocks[2].type === 'table' &&
    JSON.stringify(blocks[2].columns) === JSON.stringify(columns) && JSON.stringify(blocks[2].rows) === JSON.stringify(autumn2015StandardRows);
}
