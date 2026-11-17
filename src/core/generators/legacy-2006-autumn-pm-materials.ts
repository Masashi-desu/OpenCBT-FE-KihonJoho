import { DataError } from '../errors';
import { p, table, type GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
const caslExcerptPage = 57;

export function autumn2006PmPageAssetId(physicalPage: number): string {
  const isAdmittedQuestionPage = physicalPage >= 4 && physicalPage <= 51 &&
    (physicalPage < 28 || physicalPage > 30) && (physicalPage < 34 || physicalPage > 37);
  const isCommonNotationPage = physicalPage === 2 || physicalPage === 3;
  const isCaslPage = physicalPage >= 55 && physicalPage <= 60;
  if (!Number.isSafeInteger(physicalPage) || !(isAdmittedQuestionPage || isCommonNotationPage || isCaslPage))
    throw new DataError('SOURCE_MATERIAL', '2006年度秋期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2006h18a-fe-pm-page-${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function autumn2006PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2006PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}

export const autumn2006PmJavaTitle = 'Java APIの参考資料（独立編集）';

export function autumn2006PmJavaReference(number: 12): Reference {
  if (number !== 12)
    throw new DataError('SOURCE_MATERIAL', 'Javaの参考資料は問12が参照します');
  return {
    title: autumn2006PmJavaTitle,
    presentation: 'text',
    blocks: [
      p('図書の登録・貸出・返却に使うコレクションの動作をまとめる。要素を照合するときは、各クラスの等価性の定義に従う。'),
      table('Java APIの操作', ['呼出し', '結果・条件'], [
        ['new HashMap<K,V>() / new HashSet<E>()', 'それぞれ、空のマップ又は空の集合を作る。'],
        ['Map.put(key, value)', 'キーに対応する値を登録する。同じキーがあれば値を更新する。'],
        ['Map.remove(key)', 'キーに対応する項目を除く。キーがなければマップは変わらない。'],
        ['Map.entrySet()', 'マップ内の対応をエントリの集合として参照する。マップの変更はこの集合にも反映される。'],
        ['Map.Entry.getKey() / getValue()', 'エントリに格納されたキー又は値を得る。'],
        ['Set.add(element) / remove(element)', '要素を追加又は除去する。同じ要素を追加しても集合には一つしか保持しない。'],
        ['Set.contains(element)', '等しい要素を集合に含むかを真偽値で返す。'],
      ]),
    ],
  };
}
