import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export const encryptionCases = [
  { sender: 'A', receiver: 'B', message: '来月転居する予定です。', ciphertext: 'nd359fxj47ac…' },
  { sender: 'B', receiver: 'A', message: '受取日は来週です。', ciphertext: 'qk348pv81zt2…' },
  { sender: 'A', receiver: 'B', message: '集合場所を変更します。', ciphertext: 'ur548dc62sa8…' },
  { sender: 'B', receiver: 'A', message: '資料を金曜に渡します。', ciphertext: 'mh730la93jc4…' },
] as const;

// A, B, C, D, E, F, G, H and I are the nine actual jobs on the source diagram.
// Both unlabelled dashed arrows express predecessor constraints and have zero duration.
export const projectCases = [
  [3, 6, 8, 6, 5, 14, 11, 15, 5],
  [4, 6, 7, 5, 4, 17, 10, 14, 6],
  [3, 4, 8, 6, 7, 13, 10, 15, 5],
  [5, 7, 6, 7, 4, 11, 10, 16, 4],
] as const;

const figures = {
  '42-encryption': {
    count: encryptionCases.length,
    caption: '公開鍵暗号方式による文章の送信',
    alt(index: number) {
      const { sender, receiver, message, ciphertext } = encryptionCases[index];
      return sender + 'さんは「' + message + '」を鍵Kによって暗号化し，「' + ciphertext + '」をネットワークへ送る。' +
        receiver + 'さんは同じ暗号文を受信し，自分の秘密鍵によって復号して「' + message + '」を得る。';
    },
  },
  '51-project': {
    count: projectCases.length,
    caption: '作業A〜Iのアローダイアグラム',
    alt(index: number) {
      const [a, b, c, d, e, f, g, h, i] = projectCases[index];
      return '主列の6節点は左から開始，第2，第3，第4，第5，終了。Aは開始→第2で' + a + '日，Bは第2→第3で' + b +
        '日，Cは第3→第4で' + c + '日，Dは第4→第5で' + d + '日，Iは第5→終了で' + i +
        '日。Eは第2→下の節点で' + e + '日，そこから第3へダミー作業。Fは第2→第4で' + f +
        '日。Gは第3→上の節点で' + g + '日，そこから第4へダミー作業。Hは第3→第5で' + h +
        '日。凡例は実線矢印の上が作業名，下が作業日数。破線矢印はダミー作業。';
    },
  },
};
type FigureId = keyof typeof figures;
const figureIds = Object.keys(figures) as FigureId[];
export const profile = (id: FigureId) => 'legacy-2009-autumn-am-' + id;

export const drawingAlt = (id: FigureId, index: number) => figures[id].alt(index);

export function drawing(id: FigureId, index: number) {
  const { caption, alt } = figures[id];
  return figure(profile(id), [index], caption, alt(index));
}

export const legacy2009AutumnAm2753Figures: readonly BookletFigureDefinition[] = figureIds.map(id => ({
  profile: profile(id),
  domain: [[0, figures[id].count - 1]],
  validate(values) {
    const [index] = values;
    if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= figures[id].count) {
      throw new DataError('FIGURE_PROFILE', '図の値が登録された入力域と一致しません。');
    }
  },
  alt: ([index]) => figures[id].alt(index),
}));
