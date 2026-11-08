import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];

export function spring2014PmPageAssetId(physicalPage: number): string {
  if (!Number.isInteger(physicalPage) || physicalPage < 2 || physicalPage === 3 || physicalPage > 91 ||
    physicalPage === 78 || physicalPage === 79)
    throw new DataError('SOURCE_MATERIAL', '2014年度春期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === 82 ? '-casl-excerpt' : '';
  return `asset-ipa-2014h26h-fe-pm-p${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function spring2014PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: spring2014PmPageAssetId(page),
      caption: page === 2 ? `${title}（PDF p.2）`
        : `${title}（印刷p.${page - 1}／PDF p.${page}${page === 82 ? ' 上部抜粋' : ''}）`,
    })),
  };
}
