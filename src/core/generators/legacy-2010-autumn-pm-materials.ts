import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];

const booklet = '2010h22a-fe-pm';
const caslExcerptPage = 77;

export function autumn2010PmPageAssetId(physicalPage: number): string {
  if (!Number.isSafeInteger(physicalPage) || physicalPage < 3 || physicalPage > 83 || [33, 72, 73, 74].includes(physicalPage))
    throw new DataError('SOURCE_MATERIAL', '2010年度秋期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-${booklet}-p${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function autumn2010PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2010PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
