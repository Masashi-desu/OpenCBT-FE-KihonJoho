import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];

const booklet = '2013h25a-fe-pm';
const caslExcerptPage = 75;

export function autumn2013PmPageAssetId(physicalPage: number): string {
  if (!Number.isSafeInteger(physicalPage) || physicalPage < 3 || physicalPage > 84 ||
      physicalPage === 71 || physicalPage === 72)
    throw new DataError('SOURCE_MATERIAL', '2013年度秋期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-${booklet}-p${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function autumn2013PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2013PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}
