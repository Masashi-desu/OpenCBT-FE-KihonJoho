import type { Question } from '../types';

const collection = '2005h17h-fe-am';
export const spring2005SpreadsheetPages = [37, 38, 39] as const;
export const spring2005SpreadsheetTitle = '表計算ソフトの機能・用語';
export const spring2005SpreadsheetContextId = `context-${collection}-spreadsheet`;

export const spring2005SpreadsheetAssetId = (page: typeof spring2005SpreadsheetPages[number]) =>
  `asset-ipa-${collection}-common-${page}`;

export function isSpring2005SpreadsheetContext(question: Question, context: Question['contexts'][number]): boolean {
  if (context.title !== spring2005SpreadsheetTitle || !question.origin.sourceRefs.some(ref =>
    ref.sourceId === `source-ipa-${collection}-qs` && ref.locator.year === 2005 && ref.locator.period === '春期' &&
    ref.locator.timeSlot === '午前' && ref.locator.questionNumber === '39')) return false;
  const blocks = context.content.blocks;
  if (question.origin.kind === 'official_reprint') {
    return context.id === spring2005SpreadsheetContextId && blocks.length === spring2005SpreadsheetPages.length &&
      spring2005SpreadsheetPages.every((page, index) => {
        const block = blocks[index];
        return block.type === 'image' && block.assetId === spring2005SpreadsheetAssetId(page);
      });
  }
  return blocks.length > 0 && blocks.every(block => block.type === 'paragraph' || block.type === 'table');
}
