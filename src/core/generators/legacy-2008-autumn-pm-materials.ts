import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
const caslExcerptPage = 66;

export function autumn2008PmPageAssetId(physicalPage: number): string {
  if (!Number.isSafeInteger(physicalPage) || physicalPage < 2 || physicalPage > 69)
    throw new DataError('SOURCE_MATERIAL', '2008年度秋期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2008h20a-fe-pm-page-${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function autumn2008PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2008PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
