import type { Block } from '../types';
import { code, figure, p, type GeneratedBody } from './definition';
import { answerBody, heading, selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { autumn2015Pm0913Banks, autumn2015Pm0913Source, type LogOutputRow } from './legacy-2015-autumn-pm-09-13-source';

export { selectCase };

export type Worksheet = {
  columns: string[];
  rows: string[][];
  widths: number[];
  merges?: { row: number; column: number; rowSpan: number; colSpan: number }[];
  spacerColumn?: number;
};

export type LanguagePanel =
  | { kind: 'room' | 'cache' | 'insert-word' | 'insert-words'; alt: string }
  | { kind: 'code'; lines: string[]; note?: string }
  | { kind: 'grid'; columns: string[]; rows: string[][]; dashed?: boolean; note?: string }
  | { kind: 'fixed-output'; rows: LogOutputRow[]; note: string }
  | { kind: 'record'; labels: string[]; widths: number[][]; example: string[][] }
  | { kind: 'worksheet'; sheet: Worksheet }
  | { kind: 'change-table'; columns: [string, string]; rows: string[][]; note?: string };

export function languagePanelAlt(panel: LanguagePanel): string {
  switch (panel.kind) {
    case 'room': case 'cache': case 'insert-word': case 'insert-words':
      return panel.alt;
    case 'code':
      return [panel.lines.join('\n'), panel.note].filter(Boolean).join('\n');
    case 'fixed-output':
      return ['1桁目 カードID 名前／19桁目 レベル1／39桁目 レベル2／59桁目 レベル3',
        ...panel.rows.map(({ id, name, level, text }) => (id ? id + ' ' + name + '。' : '') + 'レベル' + level + '：' + text),
        panel.note].join('\n');
    case 'grid': case 'change-table':
      return [panel.columns.join('｜'), ...panel.rows.map(row => row.join('｜')), panel.note].filter(Boolean).join('\n');
    case 'record':
      return panel.labels.map((label, index) =>
        label + ' ' + panel.widths[index].join('桁・') + '桁 ' + panel.example[index].join('｜')).join('\n');
    case 'worksheet':
      return [panel.sheet.columns.join('｜'), ...panel.sheet.rows.map(row => row.join('｜'))].join('\n');
  }
}

type BodySettings = {
  number: number;
  index: number;
  panel: (profile: string, index: number) => LanguagePanel;
  explanation: string;
  prose?: (text: string) => string;
  program?: (id: string, text: string) => string;
  choices?: (id: string, options: string[]) => string[];
  contexts?: GeneratedBody['contexts'];
};

export function buildAutumn2015LanguageBody(settings: BodySettings): GeneratedBody {
  const { number, index, panel, explanation, prose, program, choices, contexts } = settings;
  const collection = '2015h27a-fe-pm-' + number;
  const blocks = autumn2015Pm0913Source[number].map((block): Block => {
    switch (block.kind) {
      case 'prose': return p(prose?.(block.text) ?? block.text);
      case 'heading': return heading(block.text);
      case 'code': return code(program?.(block.id, block.text) ?? block.text, block.language);
      case 'figure': {
        const profile = 'legacy-2015-autumn-pm-' + number + '-' + block.profile;
        const rendered = figure(profile, [index], block.caption, languagePanelAlt(panel(block.profile, index)));
        if (rendered.type !== 'diagram') throw new Error('FIGURE_PROFILE');
        rendered.attribution = {
          origin: 'adapted',
          sourceRefs: [{
            sourceId: 'source-ipa-' + collection + '-qs',
            locator: { section: '問題', year: 2015, period: '秋期', exam: '基本情報技術者試験', timeSlot: '午後',
              subject: '旧制度・午後', questionNumber: String(number) },
          }],
          rightsRefs: ['rights-ipa-' + collection], creatorIds: ['codex'],
        };
        return rendered;
      }
    }
  });
  const banks = autumn2015Pm0913Banks[number].map(bank => ({
    names: bank.fields.map(({ id }) => id),
    labels: bank.fields.map(({ id, section }) => section === null ? id : '設問' + section + ' ' + id),
    options: choices?.(bank.id, bank.options) ?? bank.options,
    keys: bank.fields.map(({ correct }) => correct),
    language: bank.language,
  }));
  return answerBody(blocks, banks, explanation, contexts);
}
