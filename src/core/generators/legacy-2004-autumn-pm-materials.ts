import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
const caslExcerptPage = 60;

export function autumn2004PmPageAssetId(page: number): string {
  const isQuestionPage = page >= 3 && page <= 57;
  const isSharedReferencePage = page === 2 || (page >= 58 && page <= 63);
  if (!Number.isSafeInteger(page) || !(isQuestionPage || isSharedReferencePage))
    throw new DataError('SOURCE_MATERIAL', '2004年度秋期午後の資料範囲と一致しません');
  const suffix = page === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2004h16a-fe-pm-page-${String(page).padStart(3, '0')}${suffix}`;
}

export function autumn2004PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2004PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
