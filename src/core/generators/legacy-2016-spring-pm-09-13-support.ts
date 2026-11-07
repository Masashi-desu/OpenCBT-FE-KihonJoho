import type { Block } from '../types';
import type { GeneratedBody } from './definition';
import { spring2016PmPageAssetId, spring2016PmReference } from './legacy-2016-spring-pm-materials';

export {
  answerBody, choiceBankText, heading, pageAlt, selectCase, selectionInstruction,
} from './legacy-2016-autumn-pm-09-13-support';

export function springLanguageReferences(pages: readonly number[], crop73 = false): {
  assets: string[];
  contexts: NonNullable<GeneratedBody['contexts']>;
} {
  const assets = pages.map(page => spring2016PmPageAssetId(page, crop73 && page === 73));
  return {
    assets,
    contexts: [spring2016PmReference('平成28年度春期 基本情報技術者試験 午後 付属資料', pages)],
  };
}

export function springLanguageDiagram(number: number, name: string, value: number, caption: string, alt: string): Block {
  const prefix = 'legacy-2016-spring-pm-' + number + '-' + name;
  const collection = '2016h28h-fe-pm-' + number;
  return {
    type: 'diagram', id: 'diagram-' + prefix,
    rendererRef: { id: 'renderer-source-figures', version: '1.0.0' },
    caption, alt, scene: { kind: 'source_figure', profile: prefix, values: [value] },
    attribution: {
      origin: 'adapted',
      sourceRefs: [{sourceId: 'source-ipa-' + collection + '-qs', locator: {
        section: '問題', year: 2016, period: '春期', timeSlot: '午後', subject: '旧制度・午後',
        questionNumber: String(number), exam: '基本情報技術者試験',
      }}],
      rightsRefs: ['rights-ipa-' + collection], creatorIds: ['codex'],
    },
  };
}
