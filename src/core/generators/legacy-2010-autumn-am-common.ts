import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { Question } from '../types';
import { figure, type GeneratedBody } from './definition';
import { legacy2017AutumnAmCommonAlt, legacy2017AutumnAmCommonHeading } from './legacy-2017-autumn-am-common';

const collection = '2010h22a-fe-am';
const sourceId = `source-ipa-${collection}-qs`;
const title = `${legacy2017AutumnAmCommonHeading}（p.2）`;

// The 2010 autumn booklet has one common page, with the nine logic symbols and their note.
export const autumn2010CommonFigure: BookletFigureDefinition = {
  profile: 'legacy-2010-autumn-am-24-common-gates',
  domain: [[0, 0]],
  validate() {},
  alt: legacy2017AutumnAmCommonAlt,
};

export function autumn2010CommonContexts(): NonNullable<GeneratedBody['contexts']> {
  return [{
    title,
    presentation: 'text_figure',
    blocks: [figure(autumn2010CommonFigure.profile, [0], '図記号と説明', legacy2017AutumnAmCommonAlt())],
  }];
}

export function isAutumn2010CommonContext(question: Question, context: Question['contexts'][number]): boolean {
  if (context.title !== title || !question.origin.sourceRefs.some(ref =>
    ref.sourceId === sourceId && ref.locator.year === 2010 && ref.locator.period === '秋期' &&
    ref.locator.timeSlot === '午前' && ref.locator.questionNumber)) return false;
  const [block, ...rest] = context.content.blocks;
  if (!block || rest.length) return false;
  if (question.origin.kind === 'official_reprint')
    return context.id === `context-${collection}-common-2` && block.type === 'image' &&
      block.assetId === `asset-ipa-${collection}-common-2` && context.content.attribution.sourceRefs.some(ref =>
        ref.sourceId === sourceId && ref.locator.page === 2 && !ref.locator.questionNumber);
  return block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile === autumn2010CommonFigure.profile && block.scene.values.length === 1 && block.scene.values[0] === 0;
}
