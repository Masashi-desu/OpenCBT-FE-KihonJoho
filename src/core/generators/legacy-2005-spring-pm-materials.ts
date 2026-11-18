import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
const caslExcerptPage = 63;

export function spring2005PmPageAssetId(page: number): string {
  const isQuestionPage = page >= 4 && page <= 60;
  const isSharedReferencePage = page === 2 || page === 3 || (page >= 61 && page <= 66);
  if (!Number.isSafeInteger(page) || !(isQuestionPage || isSharedReferencePage))
    throw new DataError('SOURCE_MATERIAL', '2005年度春期午後の資料範囲と一致しません');
  const suffix = page === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2005h17h-fe-pm-page-${String(page).padStart(3, '0')}${suffix}`;
}

export function spring2005PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: spring2005PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
