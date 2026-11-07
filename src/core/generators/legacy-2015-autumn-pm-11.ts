import { field } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { autumn2015PmJavaReference } from './legacy-2015-autumn-pm-materials';
import { buildAutumn2015LanguageBody, selectCase, type LanguagePanel } from './legacy-2015-autumn-pm-09-13-support';

const configurations = [
  [100, 512, 20], [18, 64, 3], [22, 96, 4], [27, 128, 5], [34, 192, 6],
  [39, 256, 7], [44, 320, 8], [51, 384, 9], [63, 448, 10],
];
export const autumn2015Pm11CaseCount = configurations.length;
export const autumn2015Pm11Profiles = ['architecture'] as const;

export function autumn2015Pm11Condition(index: number) {
  const [blockCount, blockSize, capacity] = configurations[index];
  return { blockCount, blockSize, capacity };
}

export function autumn2015Pm11Panel(profile: string): LanguagePanel {
  if (profile !== 'architecture') throw new Error('FIGURE_PROFILE');
  return { kind: 'cache', alt: 'ブロックデバイスのブロック[0]、ブロック[1]、ブロック[2]、…からブロックアクセサへ，ブロックアクセサからアプリケーションへ上向きの矢印。ブロックアクセサと右のキャッシュは双方向の矢印でつながる。[]内はブロックのインデックス値。' };
}

export const legacy2015AutumnPm11Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-11', title: '旧制度・午後：Javaによるブロックデータのキャッシュ管理',
  fields: [field('ブロック数・バイト数・キャッシュ容量の条件番号', 0, autumn2015Pm11CaseCount - 1)], reference: [0], version: '3.7.0',
  answerVariation: 'fixed', sourceAnswer: 'a=ウ，b=ア，c=エ，d=オ，e=イ，f=カ，g=ウ',
  publicNotes: 'ブロックデバイスとFIFO/LRUの処理を保ち，ブロック数・バイト数とキャッシュ上限を変更します。',
  notes: '印刷・PDF p53–58の7欄。0始まり、全バイト0、読取り専用、引数に誤りなし、返却配列の複製を保持。ブロック数・ブロック長・キャッシュ上限を9条件で変更する。参照先の型と削除位置の式は，この数値が変わっても同じ契約を満たす。原付属資料p71–72を掲載せず，必要なAPIの事実を一次資料に基づく独自説明で示す。',
  build(values) {
    const index = selectCase(values, autumn2015Pm11CaseCount);
    const { blockCount, blockSize, capacity } = autumn2015Pm11Condition(index);
    return buildAutumn2015LanguageBody({ number: 11, index, panel: autumn2015Pm11Panel,
      program: (id, text) => {
        if (id === 'q11-program-2') return text.replace('new byte[100][512]', 'new byte[' + blockCount + '][' + blockSize + ']');
        if (id === 'q11-program-4a') return text.replace('CACHE_SIZE = 20;', 'CACHE_SIZE = ' + capacity + ';');
        return text;
      },
      contexts: [autumn2015PmJavaReference()],
      explanation: 'aのblocks[0]は1ブロックの配列なので，この条件ではlengthが' + blockSize + 'になる。blocks.lengthはブロック数' + blockCount + 'である。' +
        'bはFifoとLruに共通のCache型。cは要求したインデックスとの等値比較。dは件数が容量' + capacity + 'に達したことを調べ，eは末尾を表すCACHE_SIZE - 1。' +
        'fはentriesを実装するListBasedCacheであり，Fifoのヒット時は何もしない。Lruではgのentryをオブジェクトとして削除し，先頭に挿し直す。返却時にcloneするので，アプリケーションが返却配列を書き換えてもキャッシュ内のデータは変わらない。' });
  },
};
