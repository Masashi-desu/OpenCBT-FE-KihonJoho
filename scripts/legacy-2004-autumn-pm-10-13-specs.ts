import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2004PmLanguageDrafts } from '../src/core/generators/legacy-2004-autumn-pm-10-13';
import { digitCharacterNotesTitle } from '../src/core/generators/legacy-2004-autumn-pm-13';

const descriptors: Record<number, Pick<Stage3AfternoonQuestionSpec, 'topics' | 'keywords'>> = {
  11: { topics: ['プログラミング', 'COBOL', 'ファイルと集計'],
    keywords: ['視聴率', '順ファイル', 'INITIALIZE', '二次元表', '番組', '小数第1位', 'ROUNDED'] },
  13: { topics: ['プログラミング', 'CASL II', '時刻差'],
    keywords: ['COMET II', 'けた下がり', '文字コード', 'フラグ', '駅伝', '最小値', 'レジスタ'] },
};
export const autumn2004Pm10To13Specs: Stage3AfternoonQuestionSpec[] = autumn2004PmLanguageDrafts.map(draft => {
  const { number, definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  return {
    number, title: definition.title, pages: Object.keys(originalPageAlt).map(Number), definition,
    ...descriptors[number], original: draft.original(), originalPageAlt,
    ...(number === 13 ? {
      editorialContextTitles: [digitCharacterNotesTitle],
      editorialContextSources: { [digitCharacterNotesTitle]: [{
        sourceId: 'source-ipa-2004h16a-fe-pm-qs',
        locator: { page: 60, section: 'CASL IIの仕様 1.3節で確認した数字文字の符号の事実関係',
          year: 2004, period: '秋期', exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後' },
      }] },
    } : {}),
  };
});
