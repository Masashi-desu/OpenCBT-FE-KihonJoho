import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2004PmLanguageDrafts } from '../src/core/generators/legacy-2004-spring-pm-10-13';

const descriptors: Record<number, Pick<Stage3AfternoonQuestionSpec, 'topics' | 'keywords'>> = {
  11: { topics: ['プログラミング', 'COBOL', '月別集計'],
    keywords: ['順ファイル', 'グループ処理', '作業時間', '超過時間', '業務コード', '表', '行番号'] },
  12: { topics: ['プログラミング', 'Java', '反復子'],
    keywords: ['インタフェース', 'String', '二次元配列', 'オーバーロード', '添字', 'null', '例外', '後置インクリメント'] },
};
export const spring2004Pm10To13Specs: Stage3AfternoonQuestionSpec[] = spring2004PmLanguageDrafts.map(draft => {
  const { number, definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  if (number === 11) {
    // Retain all leading indentation and source line numbers in the image description.
    originalPageAlt[49] = originalPageAlt[49].replace(/^(\s*\d+ +)(.*)$/gm,
      (_row, prefix: string, text: string) => prefix + text.replace(/ {2,}/g, ' '));
  }
  return { number, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    definition, ...descriptors[number], original: draft.original(), originalPageAlt };
});
