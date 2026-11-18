import type { Question } from '../types';

const collection = '2004h16a-fe-am';
export const autumn2004SpreadsheetPages = [36, 37, 38] as const;
export const autumn2004SpreadsheetTitle = '表計算ソフトの機能・用語';
export const autumn2004SpreadsheetContextId = `context-${collection}-spreadsheet`;

export const autumn2004SpreadsheetAssetId = (page: typeof autumn2004SpreadsheetPages[number]) =>
  `asset-ipa-${collection}-common-${page}`;

export function isAutumn2004SpreadsheetContext(question: Question, context: Question['contexts'][number]): boolean {
  if (context.title !== autumn2004SpreadsheetTitle || !question.origin.sourceRefs.some(ref =>
    ref.sourceId === `source-ipa-${collection}-qs` && ref.locator.year === 2004 && ref.locator.period === '秋期' &&
    ref.locator.timeSlot === '午前' && ref.locator.questionNumber === '46')) return false;
  const blocks = context.content.blocks;
  if (question.origin.kind === 'official_reprint') {
    return context.id === autumn2004SpreadsheetContextId && blocks.length === autumn2004SpreadsheetPages.length &&
      autumn2004SpreadsheetPages.every((page, index) => {
        const block = blocks[index];
        return block.type === 'image' && block.assetId === autumn2004SpreadsheetAssetId(page);
      });
  }
  return blocks.length > 0 && blocks.every(block => block.type === 'paragraph' || block.type === 'table');
}
