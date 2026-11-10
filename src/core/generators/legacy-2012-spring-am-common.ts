import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { Question } from '../types';
import { figure, type GeneratedBody } from './definition';
import { legacy2017AutumnAmCommonAlt, legacy2017AutumnAmCommonHeading } from './legacy-2017-autumn-am-common';

const collection = '2012h24h-fe-am';
const sourceId = `source-ipa-${collection}-qs`;
const title = `${legacy2017AutumnAmCommonHeading}（p.2）`;
export const spring2012CircuitRows = [
  { id: 'resistor', label: '抵抗（R）' },
  { id: 'ground', label: '接地' },
] as const;

export const spring2012CommonFigure: BookletFigureDefinition = {
  profile: 'legacy-2012-spring-am-25-common-gates',
  domain: [[0, 0]],
  validate() {},
  alt: () => 'Ⅰ．論理回路。' + legacy2017AutumnAmCommonAlt() +
    ' Ⅱ．回路記号。抵抗（R）は左右の端子をジグザグの線で結ぶ。接地は縦線の下の横線に三本の斜線を付ける。',
};

export function spring2012CommonContexts(): NonNullable<GeneratedBody['contexts']> {
  return [{
    title,
    presentation: 'text_figure',
    blocks: [figure(spring2012CommonFigure.profile, [0], '図記号と説明', spring2012CommonFigure.alt([0]))],
  }];
}

export function isSpring2012CommonContext(question: Question, context: Question['contexts'][number]): boolean {
  if (context.title !== title || !question.origin.sourceRefs.some(ref =>
    ref.sourceId === sourceId && ref.locator.year === 2012 && ref.locator.period === '春期' &&
    ref.locator.timeSlot === '午前' && ref.locator.questionNumber)) return false;
  const [block, ...rest] = context.content.blocks;
  if (!block || rest.length) return false;
  if (question.origin.kind === 'official_reprint')
    return context.id === `context-${collection}-common-2` && block.type === 'image' &&
      block.assetId === `asset-ipa-${collection}-common-2` && context.content.attribution.sourceRefs.some(ref =>
        ref.sourceId === sourceId && ref.locator.page === 2 && !ref.locator.questionNumber);
  return block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile === spring2012CommonFigure.profile && block.scene.values.length === 1 && block.scene.values[0] === 0;
}
