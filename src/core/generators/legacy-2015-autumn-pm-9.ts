import { field } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { autumn2015Pm9Records, type LogOutputRow } from './legacy-2015-autumn-pm-09-13-source';
import { buildAutumn2015LanguageBody, selectCase, type LanguagePanel } from './legacy-2015-autumn-pm-09-13-support';

export const autumn2015Pm9Profiles = [
  'room-layout', 'record-layout', 'normal-input', 'normal-output', 'missing-input', 'missing-output', 'insertion-table',
] as const;
const missingRoutes = [
  ['11I', '31I', '21O'], ['21I', '31I', '11O'], ['11I', '21I', '31O'],
  ['12I', '31O', '12O'], ['22I', '31I', '31O'], ['11I', '22O', '11O'],
  ['12I', '21I', '31I'], ['31I', '21O', '12O'], ['21I', '22O', '11O'],
];
const refusedDoors = ['22I', '12O', '21I', '11O'];
const recordNote = '破線は項目の区切りを示す。改行文字は表示していない。';
const outputNote = '見出し行は、あらかじめ印字されているものとする。';

function printLog(records: string[][], verify: boolean): LogOutputRow[] {
  const output: LogOutputRow[] = [];
  let previousId = '', level = 0;
  for (const [id, date, time, door, direction, access, name] of records) {
    const first = previousId !== id;
    if (verify && first && level !== 0) output.push({ level: 1, text: '***** Level ' + level + '-->0' });
    if (first) level = 0;
    const header = first ? { id, name } : {};
    const doorLevel = Number(door[0]);
    const entry = doorLevel - (direction === 'I' ? 1 : 0);
    const exit = doorLevel - (direction === 'O' ? 1 : 0);
    const missing = verify && level !== entry;
    if (missing) output.push({ ...header, level: 1, text: '***** Level ' + level + '-->' + entry });
    const stamp = date.slice(4, 6) + '-' + date.slice(6) + ' ' + time.slice(0, 2) + ':' + time.slice(2, 4);
    const event = (access === 'R' ? '(R)' : '') + (direction === 'I' ? 'IN' : 'OUT');
    output.push({ ...(missing ? {} : header), level: doorLevel, text: stamp + ' ' + door + ' ' + event });
    level = access === 'R' ? entry : exit;
    previousId = id;
  }
  if (verify && level !== 0) output.push({ level: 1, text: '***** Level ' + level + '-->0' });
  return output;
}

export const autumn2015Pm9CaseCount = missingRoutes.length;
export function autumn2015Pm9Examples(index: number) {
  if (index === 0) return { normal: autumn2015Pm9Records.normal, missing: autumn2015Pm9Records.missing };
  const day = String(18 + index).padStart(2, '0');
  const normal = autumn2015Pm9Records.normal.input.map((row, i) => {
    const [id, , time, door, direction, access, name] = row;
    const changed = i === 7 ? refusedDoors[index % refusedDoors.length] : door + direction;
    return [id, '201510' + day, time.slice(0, 2) + String(Number(time.slice(2, 4)) + index).padStart(2, '0') + time.slice(4),
      changed.slice(0, 2), changed[2], access, name];
  });
  const missing = missingRoutes[index].map((entry, i) =>
    ['T001', '201510' + day, '10' + String(i * 20 + index).padStart(2, '0') + '24', entry.slice(0, 2), entry[2], 'A', 'Test Use 1']);
  return { normal: { input: normal, output: printLog(normal, false) }, missing: { input: missing, output: printLog(missing, true) } };
}

export function autumn2015Pm9Panel(profile: string, index: number): LanguagePanel {
  const { normal, missing } = autumn2015Pm9Examples(index);
  switch (profile) {
    case 'room-layout': return { kind: 'room', alt: '外部（レベル0）とシステム課オフィス（レベル1）はドア11・12、オフィスとマシンルーム（レベル2）はドア21・22、マシンルームと右上のライブラリ（レベル3）はドア31でつながる。' };
    case 'record-layout': {
      const sample = normal.input[0];
      const example = [ [sample[0]], [sample[1].slice(0, 4), sample[1].slice(4, 6), sample[1].slice(6)],
        sample[2].match(/.{2}/g)!, [sample[3]], [sample[4]], [sample[5]], [sample[6]], ['\\n'] ];
      return { kind: 'record', labels: autumn2015Pm9Records.fields.map(({ label }) => label),
        widths: autumn2015Pm9Records.fields.map(({ widths }) => widths), example };
    }
    case 'normal-input': case 'missing-input':
      return { kind: 'grid', columns: [], rows: profile === 'normal-input' ? normal.input : missing.input, dashed: true, note: recordNote };
    case 'normal-output': case 'missing-output':
      return { kind: 'fixed-output', rows: profile === 'normal-output' ? normal.output : missing.output, note: outputNote };
    case 'insertion-table': return { kind: 'change-table', columns: ['追加位置', '追加する文'],
      rows: autumn2015Pm9Records.insertions.map(([position, text]) => [position + 'の直後', text]),
      note: 'levelは、入退室者が現在いる制限エリアのレベルを表す変数である。' };
    default: throw new Error('FIGURE_PROFILE');
  }
}

export const legacy2015AutumnPm9Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-9', title: '旧制度・午後：Cによる入退室状況の印字',
  fields: [field('入退室ログの条件番号', 0, autumn2015Pm9CaseCount - 1)], reference: [0], version: '3.7.0',
  answerVariation: 'fixed', sourceAnswer: '設問1 a=エ，b=ク，c=ア／設問2 d=オ，e=イ，f=エ，g=イ',
  publicNotes: '固定長の記録とプログラムの構造を保ち，記録日時・拒否箇所・欠落した移動が異なる例を出題します。',
  notes: '印刷・PDF p40–46の7欄。出力列19/39/59、IDの先頭行、拒否時の状態、EOFとID切替を保持。欠落を含むドア経路と拒否の場所を9条件で変える。空欄は規則を実現するC文・行位置であるため，例示を変更しても正答は固定。原入力例と表示例を照合し，別の状態機械とC11で検算。',
  build(values) {
    const index = selectCase(values, autumn2015Pm9CaseCount);
    const gaps = autumn2015Pm9Examples(index).missing.output.filter(({ text }) => text.startsWith('*****')).map(({ text }) => text);
    return buildAutumn2015LanguageBody({ number: 9, index, panel: autumn2015Pm9Panel,
      explanation: 'aはEOFをlogEOFへ格納する。bは今回のカードIDをlastIDへ複写する。配列同士の代入はできない。cはドア番号の十の位から1を引いた回数だけ20桁進めるため，日時の開始位置は19・39・59桁目になる。dは行⑦の直後ならIDの表示処理の後，すべての記録に対して列を調整する前に実行できる。eは行④の直後なら次のID又はEOFを確認できる。fは現在のlevel，gは今回の扉を通過する前にいるはずのbeforeLevel。拒否なら扉を通過しない。この入力例で補う表示は ' + (gaps.join('、') || 'なし') + '。' });
  },
};
