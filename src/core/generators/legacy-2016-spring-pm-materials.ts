import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

export function spring2016PmPageAssetId(page: number, caslExcerpt = false): string {
  if (!Number.isInteger(page) || page < 2 || page > 82 || page === 3 || (page === 73) !== caslExcerpt)
    throw new DataError('SOURCE_MATERIAL', '2016年度春期午後の確認済み資料範囲と一致しません');
  return `asset-ipa-2016h28h-fe-pm-p${String(page).padStart(3, '0')}${caslExcerpt ? '-casl-excerpt' : ''}`;
}

export function spring2016PmReference(title: string, pages: readonly number[]): NonNullable<GeneratedBody['contexts']>[number] {
  return {
    title,
    presentation: 'text_figure',
    blocks: pages.map(page => ({
      type: 'image',
      assetId: spring2016PmPageAssetId(page, page === 73),
      caption: page === 2 ? '公式正誤表（PDF p.2）' : `${title}（冊子 p.${page - 1}）`,
    })),
  };
}
