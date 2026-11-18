import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];

const caslExcerptPage = 59;

export function spring2006PmPageAssetId(physicalPage: number): string {
  const isScheduledQuestionPage = (physicalPage >= 6 && physicalPage <= 11) ||
    (physicalPage >= 21 && physicalPage <= 56);
  const isSharedReferencePage = physicalPage >= 57 && physicalPage <= 62;
  if (!Number.isSafeInteger(physicalPage) || !(isScheduledQuestionPage || isSharedReferencePage))
    throw new DataError('SOURCE_MATERIAL', '2006年度春期午後の資料範囲と一致しません');
  const suffix = physicalPage === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2006h18h-fe-pm-page-${String(physicalPage).padStart(3, '0')}${suffix}`;
}

export function spring2006PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: spring2006PmPageAssetId(page),
      caption: `${title}（印刷p.${page - 1}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
