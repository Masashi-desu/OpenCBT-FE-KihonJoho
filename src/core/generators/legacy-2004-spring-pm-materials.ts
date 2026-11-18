import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
const caslExcerptPage = 62;

export function spring2004PmPageAssetId(page: number): string {
  const isQuestionPage = page >= 3 && page <= 59;
  const isSharedReferencePage = page === 2 || (page >= 60 && page <= 65);
  if (!Number.isSafeInteger(page) || !(isQuestionPage || isSharedReferencePage))
    throw new DataError('SOURCE_MATERIAL', '2004年度春期午後の資料範囲と一致しません');
  const suffix = page === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2004h16h-fe-pm-page-${String(page).padStart(3, '0')}${suffix}`;
}

export function spring2004PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: spring2004PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
