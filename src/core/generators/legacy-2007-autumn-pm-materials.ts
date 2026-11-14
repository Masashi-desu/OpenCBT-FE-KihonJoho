import { DataError } from '../errors';
import { p, table, type GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
const caslExcerptPage = 58;

export function autumn2007PmPageAssetId(physicalPage: number): string {
  if (!Number.isSafeInteger(physicalPage) || physicalPage < 2 || physicalPage === 4 || (physicalPage > 52 && physicalPage < 56) || physicalPage > 61)
    throw new DataError('SOURCE_MATERIAL', '2007年度秋期午後の確認済み資料範囲と一致しません');
  const excerpt = physicalPage === caslExcerptPage ? '-casl-excerpt' : '';
  return `asset-ipa-2007h19a-fe-pm-page-${String(physicalPage).padStart(3, '0')}${excerpt}`;
}

export function autumn2007PmReference(title: string, physicalPages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: physicalPages.map(page => ({
      type: 'image',
      assetId: autumn2007PmPageAssetId(page),
      caption: `${title}（印刷p.${page}／PDF p.${page}${page === caslExcerptPage ? ' 上部抜粋' : ''}）`,
    })),
  };
}

export const autumn2007PmJavaTitle = 'Java APIの参考資料（独立編集）';
const indexed = '位置は0から数える。';

export function autumn2007PmJavaReference(number: 8 | 12): Reference {
  return {
    title: autumn2007PmJavaTitle,
    presentation: 'text',
    blocks: number === 8 ? [
      p('LinkedListは要素を順に保持する。この設問の処理で使う操作を次に示す。' + indexed),
      table('LinkedListの操作', ['呼出し', '結果・条件'], [
        ['new LinkedList<E>()', '空のリストを作る。'],
        ['add(index, element)', '指定位置に挿入し、以降の要素を後ろへずらす。indexが要素数に等しければ末尾に追加する。'],
        ['get(index)', '指定位置の要素を取得する。この呼出しでリストは変化しない。'],
        ['poll()', '先頭要素を取得して取り除く。空ならnullを返す。'],
        ['size()', 'その時点の要素数を返す。'],
      ]),
    ] : [
      p('Iterableが返すIteratorを通して順に読む。Listは登録順を保持し、拡張for文はその順で進む。この設問で使う主な契約を次に示す。'),
      table('反復と文字列の操作', ['呼出し', '結果・条件'], [
        ['iterator()', '対象の要素を順に調べるIteratorを取得する。'],
        ['hasNext()', '次に取得できる要素があればtrue。それだけでは取得位置は進まない。'],
        ['next()', '次の要素を取得して位置を進める。残っていなければNoSuchElementExceptionとなる。'],
        ['remove()', '直前に取得した要素を除く操作。実装が対応しない場合はUnsupportedOperationExceptionとなる。'],
        ['Arrays.asList(要素列)', '指定した順のListを得る。この設問ではその順で読み取る。'],
        ['startsWith(prefix)', '先頭からprefixと同じ並びならtrueとなる。'],
        ['length()', '文字列の長さを返す。'],
        ['charAt(index)', '位置index（0から数える）の文字を取得する。'],
      ]),
    ],
  };
}
