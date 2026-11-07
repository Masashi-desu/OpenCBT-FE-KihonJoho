import { field } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { autumn2015PmPageAssetId, autumn2015PmReference } from './legacy-2015-autumn-pm-materials';
import { buildAutumn2015LanguageBody, selectCase, type LanguagePanel } from './legacy-2015-autumn-pm-09-13-support';

const cases = [
  [0x5e96, 0xef18, 10], [0x9be1, 0x5970, 4], [0xc8f1, 0x4633, 5], [0x419b, 0xa1dd, 6],
  [0xfc35, 0x5cfe, 7], [0xac37, 0x1c2c, 8], [0xb3a7, 0x31d8, 9], [0x499e, 0x7be8, 11],
];
const referencePages = [73, 74, 75, 76, 77, 78];
const mask = 0xffff;
const binary = (word: number) => word.toString(2).padStart(16, '0').match(/.{4}/g)!.join(' ');
export const autumn2015Pm12CaseCount = cases.length;
export const autumn2015Pm12Profiles = ['bitins', 'input', 'bitinsl'] as const;

export function autumn2015Pm12Condition(index: number) {
  const [a, b, n] = cases[index];
  const shift = 16 - n;
  const lastB = b & ((1 << shift) - 1);
  const leftB = b >>> shift << shift;
  const words = [a >>> n, lastB, a & ((1 << n) - 1), b >>> shift,
    a >>> n << n, b << n & mask, a << shift & mask, leftB];
  return { a, b, n, words, output: [leftB | words[0], lastB | words[6]] };
}

export function autumn2015Pm12Panel(profile: string, index: number): LanguagePanel {
  switch (profile) {
    case 'bitins': return { kind: 'insert-word', alt: 'ビット列Aは16ビットのa。ビット列Bの先頭nビットはb1，残りはb2。Aをb1とb2の境界に挿入し，ビット列Cを左からb1，a，b2とする。' };
    case 'bitinsl': return { kind: 'insert-words', alt: '1語のビット列Xのxを，N語のビット列Yの先頭からmビットの位置へ挿入する。結果のビット列ZはN+1語で，xの始端と終端は語境界とは別の破線。下の表示は語1，語2，…，語N，語N+1。' };
    case 'input': {
      const { a, b } = autumn2015Pm12Condition(index);
      return { kind: 'grid', columns: [], rows: [['ビット列A', binary(a)], ['ビット列B', binary(b)]] };
    }
    default: throw new Error('FIGURE_PROFILE');
  }
}

export const legacy2015AutumnPm12Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-12', title: '旧制度・午後：CASL IIによるビット列の挿入',
  fields: [field('ビット列A・Bと挿入位置の条件番号', 0, autumn2015Pm12CaseCount - 1)], reference: [0], version: '3.7.0',
  sourceAnswer: '設問1 a=ウ，b=ウ／設問2 c=イ，d=キ／設問3 e=イ，f=オ',
  fixedReferenceAssetIds: referencePages.map(autumn2015PmPageAssetId),
  publicNotes: '16ビット語・挿入手順・解答群の役割を保ち，例のビット列と挿入位置を変更します。',
  notes: '印刷・PDF p59–63の6欄。位置nは0〜16、mは0〜16×N、GR1〜GR7の復元・2語への出力を保持。設問2は8例で、候補は全て異なる16ビット列。出力を別のビット列分割と連結で検算。BITINSLの検証は正のN、符号付き比較が有効なオフセット、非重複入出力で行う。p75はJIS X 0201を含まない上部だけを使用。',
  build(values) {
    const index = selectCase(values, autumn2015Pm12CaseCount);
    const { n, words, output } = autumn2015Pm12Condition(index);
    return buildAutumn2015LanguageBody({ number: 12, index, panel: autumn2015Pm12Panel,
      prose: text => text.replace('nが10で', 'nが' + n + 'で'),
      choices: (id, options) => id === 'c,d' ? words.map(binary) : options,
      contexts: [autumn2015PmReference('CASL IIの仕様', referencePages)],
      explanation: 'aは1語の16。GR6は16−n。bでGR0をnだけ論理右シフトするので，GR0はAの左側16−nビットを1語目の右端に持つ。' +
        'GR4はBの右側' + (16 - n) + 'ビットを残しているのでcは' + binary(words[1]) +
        '。GR5はAを' + (16 - n) + 'ビット左に移したためdは' + binary(words[6]) +
        '。OR後は1語目が' + binary(output[0]) + '、2語目が' + binary(output[1]) +
        '。eでは符号付き比較でmが17未満ならJMI INSで挿入処理に移る。挿入対象の1語を消費した後，残りが0ならfのJZE FINでコピーを行わずに終わる。' });
  },
};
