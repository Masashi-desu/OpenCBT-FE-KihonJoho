import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];

const booklet = '2012h24a-fe-pm';
const caslExcerptPage = 81;

export function autumn2012PmPageAssetId(physicalPage: number): string {
  if (!Number.isSafeInteger(physicalPage) || physicalPage < 3 || physicalPage > 90 ||
      physicalPage === 77 || physicalPage === 78)
    throw new DataError('SOURCE_MATERIAL', '2012年度秋期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-${booklet}-p${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function autumn2012PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2012PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
