import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { autumn2004Pm10To13Specs as specs } from '../../../scripts/legacy-2004-autumn-pm-10-13-specs';
import { audienceTimeline } from '../../../src/core/generators/legacy-2004-autumn-pm-11';
import { legacy2004AutumnPm1013Figures as figures } from '../../../src/core/generators/legacy-2004-autumn-pm-10-13-figures';
import { legacy2004AutumnPm1013FigureRenderers as renderers } from '../../../src/ui/Legacy2004AutumnPm1013Figures';
import { makeTimer } from '../../fixtures/legacy-2004-autumn-pm-casl-reference';
import { datasets, readListing, referenceRatings, runRatings } from '../../fixtures/legacy-2004-autumn-pm-cobol-reference';

const kana = 'アイウエオカキクケコ';
function answers(body: GeneratedBody) {
  const key: Record<string, string> = {};
  const names: string[] = [];
  const options: Record<string, string[]> = {};
  let label = '';
  for (const entry of body.partAnswers!) {
    assert(entry.kind === 'choice');
    const { id, choiceIds } = body.answerParts!.find(part => part.id === entry.partId)!;
    const name = id.slice(5);
    names.push(name);
    options[name] = choiceIds.map(id => {
      const value = body.choices[Number(id.split('-').at(-1)) - 1][0];
      assert(value.type === 'paragraph' || value.type === 'code');
      return value.text;
    });
    const index = choiceIds.indexOf(entry.choiceId);
    label += kana[index];
    key[name] = options[name][index];
  }
  return { key, names, options, label };
}

const code = (body: GeneratedBody, language: string) => body.prompt.flatMap(
  block => block.type === 'code' && block.language === language ? [block.text] : []);
const cases = (number: number) => {
  const spec = specs.find(spec => spec.number === number)!;
  return [spec.original, ...[0, 1, 2, 3].map(index => spec.definition.build([index]))];
};

test('問11・13は公式11頁・12欄の形式と前提を保持し、各4条件を本文、図、解説へ反映する', () => {
  assert.deepEqual(specs.map(spec => spec.number), [11, 13]);
  const counts = [[7, 7, 7, 7, 7, 4], [8, 8, 6, 7, 6, 6]];
  specs.forEach((spec, index) => {
    assert.deepEqual(spec.pages, index === 0 ? [41, 42, 43, 44, 45, 46] : [53, 54, 55, 56, 57]);
    const official = ['イウアカエイ', 'イキエエイエ'][index];
    assert.equal(spec.definition.sourceAnswer, official);
    assert.equal(answers(spec.original).label, official);
    const all = cases(spec.number);
    assert.equal(new Set(all.slice(1).map(body => JSON.stringify(body.prompt))).size, 4);
    assert.equal(new Set(all.slice(1).map(body => body.explanation)).size, 4);
    for (const body of all) {
      const { options, names } = answers(body);
      assert.deepEqual(names, [...(spec.number === 11 ? 'abcdef' : 'abxycd')]);
      assert.deepEqual(names.map(name => new Set(options[name]).size), counts[index]);
    }
    for (const values of [[], [-1], [0, 1], [0.5], [4]]) assert.throws(() => spec.definition.build(values));
  });
});

test('問11: 開始・終了を含む1分/複数分枠、満視聴、未視聴、終端、空ファイルと全命令候補', () => {
  const expected = [[600, 5, 1], [80, 4, 1], [125, 5, 2], [160, 6, 3], [250, 7, 5]];
  cases(11).forEach((body, index) => {
    const spec = readListing(code(body, 'cobol').join('\n'));
    assert.deepEqual([spec.sample, spec.channelCount, spec.step], expected[index]);
    const data = datasets(spec);
    const expectedRatings = data.map(set => referenceRatings(spec, set));
    assert.equal(expectedRatings[0][2], 1000);
    assert.equal(expectedRatings[0][3], 0);
    assert.deepEqual(expectedRatings.at(-1), [63]); // 6.25% rounds up to 6.3%.
    const { key, names, options } = answers(body);
    for (const name of names) {
      const successful = options[name].filter(choice => {
        try {
          return data.every((set, i) => JSON.stringify(runRatings(spec, set, { ...key, [name]: choice })) === JSON.stringify(expectedRatings[i]));
        } catch { return false; }
      });
      assert.deepEqual(successful, [key[name]], name);
    }
    const [records] = code(body, 'text');
    const slots = records.split('\n').map(row => row.match(/^\d{2}(\d{2})(\d{2})(\d{2})(\d{2})$/)!.slice(1).map(Number));
    const endpoints = slots.map(([h, m, eh, em]) => [h * 60 + m, eh * 60 + em]);
    assert.deepEqual(endpoints.map(([a, b]) => (b - a) / spec.step + 1), [2, 2, 1]);
    assert.equal(endpoints[1][0] - endpoints[0][0], 2 * spec.step);
    assert.equal(endpoints[2][0] - endpoints[1][0], 2 * spec.step);
    if (index > 0) {
      const { channels, headings, segments } = audienceTimeline.panel([index - 1]);
      const timeline = headings.map((time, tick) => {
        const active = segments.find(([, begin, end]) => begin <= tick && tick <= end);
        return active ? [channels[active[0]], time].join('-') : null;
      }).filter(Boolean);
      const recorded = records.split('\n').flatMap(row => {
        const channel = row.slice(0, 2);
        const begin = headings.indexOf(row.slice(2, 6)), end = headings.indexOf(row.slice(6, 10));
        assert(begin >= 0 && end >= begin);
        return headings.slice(begin, end + 1).map(time => channel + '-' + time);
      });
      assert.deepEqual(timeline, recorded);
    }
    assert(body.explanation.includes(String(spec.sample) + '世帯'));
  });
});

const timeString = (seconds: number) => [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
  .map(value => String(value).padStart(2, '0')).join('');
const timeValue = (source: string) => Number(source.slice(0, 2)) * 3600 + Number(source.slice(2, 4)) * 60 + Number(source.slice(4, 6));

function timerParts(body: GeneratedBody) {
  const [first, last, extension, ...relay] = code(body, 'casl2');
  return { timer: first + '\n' + last, relay: relay.join('\n'), extension };
}
const boundaryPairs = [
  [0, 1], [0, 86400], [86399, 86400], [35999, 36000], [99, 3600], [47031, 47031], [3600, 7200], [59, 60], [5407, 5408],
];
const comparisons = [...boundaryPairs, ...Array.from({ length: 84 }, (_, index) => {
  const first = (1847 * (index + 14)) % 86400;
  return [first, first + ((12503 * (index + 1)) % (86401 - first))];
})];
const encPair = ([start, end]: number[]) => [timeString(start), timeString(end)];

test('問13: 行15の実行回数、日末・59秒と59分のけた下がり、a・bの全選択肢、GR1〜GR7とGR0', () => {
  const counts = [4, 1, 2, 3, 5];
  for (const [index, body] of cases(13).entries()) {
    const { timer, relay } = timerParts(body);
    const { key, options } = answers(body);
    const [first, last] = code(body, 'text')[0].match(/\d{6}/g)!;
    const containsOnlyCorrectDiff = (candidate: typeof key) => {
      try {
        const execute = makeTimer(timer, relay, candidate);
        return comparisons.every(pair => {
          const state = execute([encPair(pair)]);
          return state.difference === timeString(pair[1] - pair[0]) && state.restored && state.gr0 === 17;
        });
      } catch { return false; }
    };
    for (const name of ['a', 'b']) {
      assert.deepEqual(options[name].filter(option => containsOnlyCorrectDiff({ ...key, [name]: option })), [key[name]], name);
    }
    const given = makeTimer(timer, relay, key)([[first, last]]);
    assert.equal(given.difference, timeString(timeValue(last) - timeValue(first)));
    assert.equal(given.adjustments, counts[index]);
    assert.deepEqual(options.x.filter(option => Number(option) === given.adjustments), [key.x]);
    assert(body.explanation.includes('計' + counts[index] + '回'));
  }
});

test('問13: 1秒を60・70・80・100等分する2桁の繰下がりと拡張の全選択肢', () => {
  const scales = [100, 60, 70, 80, 100];
  for (const [index, body] of cases(13).entries()) {
    const { timer, relay, extension } = timerParts(body);
    const { key, options } = answers(body);
    const scale = scales[index];
    const firstLine = /^\s+3\s+LD\s+GR4,=(\d+)/.exec(extension)![1];
    const radix = /28\s+ADD\s+DC\s+([^\[]+)\[y\]/.exec(extension)![1];
    const format = (value: number) => timeString(Math.floor(value / scale)) + String(value % scale).padStart(2, '0');
    const probes = [[0, 1], [scale - 1, scale], [9, 10], [19, scale + 1], [86400 * scale - 1, 86400 * scale],
      [3599 * scale + 9, 3600 * scale], [scale - 9, 3603 * scale + 9], [scale - 10, scale]];
    const works = (choice: string) => {
      const changed = timer.replace('GR4,=5 ', 'GR4,=' + firstLine + ' ').replace('0,10,6,10,6,10', radix + choice);
      const execute = makeTimer(changed, relay, key);
      return probes.every(([a, b]) => {
        const state = execute([[format(a), format(b)]]);
        return state.difference === format(b - a) && state.restored;
      });
    };
    assert.deepEqual(options.y.filter(works), [key.y]);
    assert(body.explanation.includes('1秒が' + scale + '目盛'));
  }
});

test('問13: 参加数、先頭・中間・末尾での最短、同着時、全分岐候補とレジスタ復元', () => {
  for (const [index, body] of cases(13).entries()) {
    const { timer, relay } = timerParts(body);
    const { key, options } = answers(body);
    const teams = [9, 4, 6, 7, 9][index];
    assert(relay.includes("CPA     GR7,='" + teams + "'"));
    const scenarios = [
      Array.from({ length: teams }, (_, index) => (index + 1) * 31),
      Array.from({ length: teams }, (_, index) => (teams - index) * 530),
      Array.from({ length: teams }, (_, index) => index === 2 || index === teams - 1 ? 65 : 3605),
      Array.from({ length: teams }, (_, index) => index === teams - 1 ? 3 : 3604),
      Array.from({ length: teams }, () => 3999),
      Array.from({ length: teams }, (_, index) => index === 1 ? 86399 : 86400),
    ];
    const works = (candidate: typeof key) => {
      try {
        const execute = makeTimer(timer, relay, candidate);
        return scenarios.every(durations => {
          const shortest = Math.min(...durations);
          const data = durations.map((duration, i) => {
            const start = Math.min(i * 439, 86400 - duration);
            return encPair([start, start + duration]);
          });
          const state = execute(data);
          return state.restored && state.printed === (durations.indexOf(shortest) + 1) + ' ' + timeString(shortest);
        });
      } catch { return false; }
    };
    for (const name of ['c', 'd']) {
      assert.deepEqual(options[name].filter(option => works({ ...key, [name]: option })), [key[name]], name);
    }
  }
});

test('問13: p60の上部抜粋を含む6頁と数字の独自補足を解答前に表示する', () => {
  for (const body of cases(13)) {
    const [appendix, numbers] = body.contexts!;
    assert.equal(appendix.title, 'CASL IIの仕様');
    assert.deepEqual(appendix.blocks.map(block => block.type === 'image' ? block.assetId : ''),
      [58, 59, 60, 61, 62, 63].map(page => 'asset-ipa-2004h16a-fe-pm-page-0' + page + (page === 60 ? '-casl-excerpt' : '')));
    assert.equal(numbers.title, 'この設問で使う数字文字の符号');
    assert.equal(numbers.presentation, 'text');
    assert.equal(numbers.blocks.length, 1);
    const [content] = numbers.blocks;
    assert(content.type === 'paragraph' && content.text.includes('0030') && !content.text.includes('JIS'));
    for (let digit = 0; digit < 10; ++digit) assert.equal((0x0030 | digit), String(digit).charCodeAt(0));
  }
});

test('生成した視聴タイムラインと時刻形式・引数の4図がアクセス可能なSVGとして各4条件で表示される', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const body of [...cases(11).slice(1), ...cases(13).slice(1)]) {
    const diagrams = body.prompt.filter(block => block.type === 'diagram');
    assert(diagrams.length === 1 || diagrams.length === 3);
    for (const diagram of diagrams) {
      assert(diagram.scene.kind === 'source_figure');
      const { profile, values } = diagram.scene;
      const figure = figures.find(figure => figure.profile === profile)!;
      const renderer = renderers.find(renderer => renderer.profile === profile)!;
      assert.equal(figure.alt(values), diagram.alt);
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: diagram.caption, values }));
      assert(markup.includes('role="img"') && markup.includes('aria-labelledby=') && markup.includes('aria-describedby='));
      assert(markup.includes('>' + diagram.caption + '</title>'));
      assert(markup.includes('>' + diagram.alt + '</desc>'));
      assert(markup.includes('viewBox="0 0 '));
    }
  }
});
