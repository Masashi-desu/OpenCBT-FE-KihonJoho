import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2005PmLanguageDrafts } from '../src/core/generators/legacy-2005-spring-pm-10-13';
import { digitCharacterNotesTitle } from '../src/core/generators/legacy-2005-spring-pm-13';

const descriptors: Record<number, Pick<Stage3AfternoonQuestionSpec, 'topics' | 'keywords'>> = {
  12: { topics: ['プログラミング', 'Java', '電卓'], keywords: ['イベント', '匿名クラス', 'コンストラクタ', '整数演算', 'ゼロ除算'] },
  13: { topics: ['プログラミング', 'CASL II', '基数変換'], keywords: ['COMET II', '10進数', '補数', 'シフト', '符号フラグ'] },
};
export const spring2005Pm10To13Specs: Stage3AfternoonQuestionSpec[] = spring2005PmLanguageDrafts.map(draft => {
  const { number, definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  return {
    number, title: definition.title, pages: Object.keys(originalPageAlt).map(Number), definition,
    ...descriptors[number], original: draft.original(), originalPageAlt,
    ...(number === 13 ? {
      editorialContextTitles: [digitCharacterNotesTitle],
      editorialContextSources: { [digitCharacterNotesTitle]: [{
        sourceId: 'source-ipa-2005h17h-fe-pm-qs',
        locator: { page: 63, section: 'CASL IIの仕様 1.3節で確認した数字と比較対象の相対関係',
          year: 2005, period: '春期', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後' },
      }] },
    } : {}),
  };
});
