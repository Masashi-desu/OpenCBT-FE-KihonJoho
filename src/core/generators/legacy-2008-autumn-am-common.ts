import type { Question } from '../types';
import { figure, type GeneratedBody } from './definition';
import { legacy2017AutumnAmCommonAlt, legacy2017AutumnAmCommonHeading,
  legacy2017AutumnAmCommonProfile } from './legacy-2017-autumn-am-common';

const collection = '2008h20a-fe-am';
const sourceId = `source-ipa-${collection}-qs`;
const title = `${legacy2017AutumnAmCommonHeading}（p.2）`;

export const autumn2008CommonAlt = legacy2017AutumnAmCommonAlt;

export function autumn2008CommonContexts(): NonNullable<GeneratedBody['contexts']> {
  return [{
    title,
    presentation: 'text_figure',
    blocks: [figure(legacy2017AutumnAmCommonProfile, [0], '図記号と説明', autumn2008CommonAlt())],
  }];
}

export function isAutumn2008CommonContext(question: Question, context: Question['contexts'][number]): boolean {
  if (context.title !== title || !question.origin.sourceRefs.some(ref =>
    ref.sourceId === sourceId && ref.locator.year === 2008 && ref.locator.period === '秋期' &&
    ref.locator.timeSlot === '午前' && ref.locator.questionNumber)) return false;
  const [block, ...others] = context.content.blocks;
  if (!block || others.length) return false;
  if (question.origin.kind === 'official_reprint')
    return context.id === `context-${collection}-common-2` && block.type === 'image' &&
      block.assetId === `asset-ipa-${collection}-common-2` && context.content.attribution.sourceRefs.some(ref =>
        ref.sourceId === sourceId && ref.locator.page === 2 && !ref.locator.questionNumber);
  return block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile === legacy2017AutumnAmCommonProfile && block.scene.values.length === 1 && block.scene.values[0] === 0;
}
