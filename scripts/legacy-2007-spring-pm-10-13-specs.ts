import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2007PmLanguageDrafts } from '../src/core/generators/legacy-2007-spring-pm-10-13';

const metadata = {
  11: { topics: ['プログラミング', 'COBOL', '保護者名簿のマージ'], keywords: ['昇順', '突合せ', '順ファイル', 'EOF', '学年', '進級'] },
  12: { topics: ['プログラミング', 'Java', '三目並べ'], keywords: ['盤', '列挙型', '例外', '配列', 'undo', '二つ選ぶ'] },
  13: { topics: ['プログラミング', 'CASL II', 'メモリプール'], keywords: ['COMET II', '割当て', '返却', 'レジスタ', 'ビットマスク', 'シフト'] },
};

export const spring2007Pm10To13Specs: Stage3AfternoonQuestionSpec[] = spring2007PmLanguageDrafts.map(draft => {
  const { number, definition } = draft, originalPageAlt = draft.originalPageAlt();
  return { number, title: definition.title, pages: Object.keys(originalPageAlt).map(Number), ...metadata[number as keyof typeof metadata],
    definition, original: draft.original(), originalPageAlt };
});
