import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
const caslExcerptPage = 64;

export function autumn2005PmPageAssetId(page: number): string {
  const isQuestionPage = page >= 4 && page <= 61;
  const isSharedReferencePage = page === 2 || page === 3 || (page >= 62 && page <= 67);
  if (!Number.isSafeInteger(page) || !(isQuestionPage || isSharedReferencePage))
    throw new DataError('SOURCE_MATERIAL', '2005年度秋期午後の資料範囲と一致しません');
  const suffix = page === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2005h17a-fe-pm-page-${String(page).padStart(3, '0')}${suffix}`;
}

export function autumn2005PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2005PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
