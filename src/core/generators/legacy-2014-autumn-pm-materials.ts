import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];

export function autumn2014PmPageAssetId(physicalPage: number): string {
  if (!Number.isInteger(physicalPage) || physicalPage < 3 || physicalPage > 90 || physicalPage === 70 || physicalPage === 78)
    throw new DataError('SOURCE_MATERIAL', '2014年度秋期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === 81 ? '-casl-excerpt' : '';
  return `asset-ipa-2014h26a-fe-pm-p${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function autumn2014PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2014PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === 81 ? ' 上部抜粋' : ''}）`,
    })),
  };
}
