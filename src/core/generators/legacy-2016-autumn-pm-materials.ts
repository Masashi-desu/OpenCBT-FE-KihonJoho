import { DataError } from '../errors';
import type { GeneratedBody } from './definition';

/** The character-code table on the whole page73 is not a publication asset. */
export function autumn2016PmPageAssetId(page: number, caslExcerpt = false) {
  if (!Number.isInteger(page) || page < 1 || page > 82 || (page === 73) !== caslExcerpt)
    throw new DataError('SOURCE_MATERIAL', '2016年度秋期午後の確認済み資料範囲と一致しません');
  return `asset-ipa-2016h28a-fe-pm-p${String(page).padStart(3, '0')}${caslExcerpt ? '-casl-excerpt' : ''}`;
}

export function autumn2016PmReference(title: string, pages: readonly number[]): NonNullable<GeneratedBody['contexts']>[number] {
  return { title, presentation: 'text_figure', blocks: pages.map(page => ({ type: 'image',
    assetId: autumn2016PmPageAssetId(page, page === 73), caption: `${title}（原資料p.${page - 1}）` })) };
}
