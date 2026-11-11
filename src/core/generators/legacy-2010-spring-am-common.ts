import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { Question } from '../types';
import { figure, type GeneratedBody } from './definition';
import { legacy2017AutumnAmCommonHeading } from './legacy-2017-autumn-am-common';

import { spring2012CommonFigure } from './legacy-2012-spring-am-common';

const collection = '2010h22h-fe-am';
const sourceId = `source-ipa-${collection}-qs`;
const title = `${legacy2017AutumnAmCommonHeading}（p.2）`;

// The 2010 spring paper p.2 retains nine logic and two circuit symbols. Its two tables match the independently reviewed 2012 spring notation.
export const spring2010CommonFigure: BookletFigureDefinition = {
  profile: 'legacy-2010-spring-am-23-common-gates',
  domain: [[0, 0]],
  validate() {},
  alt: spring2012CommonFigure.alt,
};

export function spring2010CommonContexts(): NonNullable<GeneratedBody['contexts']> {
  return [{
    title,
    presentation: 'text_figure',
    blocks: [figure(spring2010CommonFigure.profile, [0], '図記号と説明', spring2010CommonFigure.alt([0]))],
  }];
}

export function isSpring2010CommonContext(question: Question, context: Question['contexts'][number]): boolean {
  if (context.title !== title || !question.origin.sourceRefs.some(ref =>
    ref.sourceId === sourceId && ref.locator.year === 2010 && ref.locator.period === '春期' &&
    ref.locator.timeSlot === '午前' && ref.locator.questionNumber)) return false;
  const [block, ...rest] = context.content.blocks;
  if (!block || rest.length) return false;
  if (question.origin.kind === 'official_reprint')
    return context.id === `context-${collection}-common-2` && block.type === 'image' &&
      block.assetId === `asset-ipa-${collection}-common-2` && context.content.attribution.sourceRefs.some(ref =>
        ref.sourceId === sourceId && ref.locator.page === 2 && !ref.locator.questionNumber);
  return block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile === spring2010CommonFigure.profile && block.scene.values.length === 1 && block.scene.values[0] === 0;
}
