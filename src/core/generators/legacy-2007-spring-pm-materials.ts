import { DataError } from '../errors';
import { p, table, type GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
const caslExcerptPage = 57;

export function spring2007PmPageAssetId(physicalPage: number): string {
  if (!Number.isSafeInteger(physicalPage) || physicalPage < 2 || physicalPage === 4 || (physicalPage > 51 && physicalPage < 55) || physicalPage > 60)
    throw new DataError('SOURCE_MATERIAL', '2007年度春期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2007h19h-fe-pm-page-${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function spring2007PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: spring2007PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}

export const spring2007PmJavaTitle = 'Java APIの参考資料（独立編集）';

export function spring2007PmJavaReference(number: 8): Reference {
  if (number !== 8) throw new DataError('SOURCE_MATERIAL', 'Javaの共通資料は問8が参照します');
  return {
    title: spring2007PmJavaTitle,
    presentation: 'text',
    blocks: [
      p('この問題で使う配列の並べ替え、比較と文字列の操作を次にまとめる。比較の返り値は符号で判定する。位置は0から数える。'),
      table('Java APIの操作', ['呼出し', '結果・条件'], [
        ['Map.get(key)', '対応する値を得る。対応がなければnullを返す。値にnullを登録できる場合もある。'],
        ['Map.put(key, value)', 'キーに対応する値を登録する。同じキーが既にあれば値を更新する。'],
        ['new HashMap<K,V>()', '要素をまだ持たないMapを作る。'],
        ['compareTo(other)', '文字列を辞書順で比較する。先なら負、同じなら0、後なら正となる。'],
        ['substring(start, end)', 'startからendの直前までを切り出す。endは切り出した結果に含まない。'],
        ['toLowerCase(Locale.ENGLISH)', '英語ロケールの規則で小文字化する。'],
        ['Arrays.sort(array, comparator)', '比較器が定める順序で配列要素を並べ替える。比較結果が0の要素は元の順序を保つ。'],
        ['Arrays.toString(array)', '順に並べた各要素をコンマと空白で区切り、全体を角括弧で囲った文字列を得る。'],
        ['Comparator.compare(first, second)', 'firstがsecondより先なら負、同じと扱うなら0、後なら正を返す。'],
      ]),
    ],
  };
}
