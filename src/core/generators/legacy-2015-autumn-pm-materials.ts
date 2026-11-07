import { DataError } from '../errors';
import { p, table, type GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];

export function autumn2015PmPageAssetId(page: number): string {
  if (!Number.isInteger(page) || page < 3 || page > 84 || page === 71 || page === 72)
    throw new DataError('SOURCE_MATERIAL', '2015年度秋期午後の確認済み資料範囲と一致しません');
  return `asset-ipa-2015h27a-fe-pm-p${String(page).padStart(3, '0')}${page === 75 ? '-casl-excerpt' : ''}`;
}

export function autumn2015PmReference(title: string, pages: readonly number[]): Reference {
  return {
    title,
    presentation: 'text_figure',
    blocks: pages.map(page => ({
      type: 'image',
      assetId: autumn2015PmPageAssetId(page),
      caption: `${title}（冊子 p.${page}${page === 75 ? ' 上部抜粋' : ''}）`,
    })),
  };
}

export const autumn2015PmJavaTitle = '問11 Java APIの参考資料（編集資料）';

export function autumn2015PmJavaReference(): Reference {
  return {
    title: autumn2015PmJavaTitle,
    blocks: [
      p('List<E>は要素の順番を持つコレクションです。先頭の添字は0です。ArrayList<E>はList<E>を実装し，引数なしのnew ArrayList<>()は要素数0のリストを作ります。'),
      table('List<E>で使う操作', ['呼出し', '動作'], [
        ['add(int index, E element)', 'indexの位置に要素を挿入します。その位置以降の要素の添字が1ずつ増えます。末尾の直後にも挿入できます。'],
        ['remove(int index)', 'indexの要素を取り除いて返します。後ろにあった要素の添字が1ずつ減ります。'],
        ['remove(Object value)', 'valueと等しい最初の要素を取り除きます。取り除いたときにtrue，該当要素がなければfalseを返します。'],
        ['isEmpty()', '要素が0個のときにtrueを返します。'],
        ['size()', '現在の要素数を返します。'],
      ]),
      p('System.arraycopy(src, srcPos, dest, destPos, length)は，srcのsrcPosからlength個の要素を取り出して，destのdestPosから順に書き込みます。同じ配列を両方に渡す場合は，複写先に書き込む前の値を使うため，範囲が重なっていても複写元の要素を順番どおりに取り出せます。'),
    ],
  };
}
