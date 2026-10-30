import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Content} from '../src/ui/Content';
import type {Attribution, Block, Content as ContentData} from '../src/core/types';
import {fixture} from './fixtures';
import {isLegacy2019SpringNativeText, legacy2019SpringInlineBlanks, Legacy2019SpringNativeText} from '../src/ui/Legacy2019SpringNativeText';

const bundle = fixture();
const mazeIntroduction = '升目を用いて表現された迷路と，迷路上に置かれて外部から操作される駒を表すプログラムである。';
function attribution(number: number): Attribution {
  return {origin: 'adapted', creatorIds: [], rightsRefs: [], sourceRefs: [{
    sourceId: `source-ipa-2019h31h-fe-pm-${number}-qs`,
    locator: {section: `問${number}`, year: 2019, period: '春期', timeSlot: '午後', questionNumber: String(number)},
  }]};
}
function render(a: Attribution, blocks: Block[]) {
  const content: ContentData = {attribution: a, blocks}, before = structuredClone(content);
  const html = renderToStaticMarkup(createElement(Content, {content, bundle, assetUrls: {}, showAttribution: false}));
  assert.deepEqual(content, before);
  return html;
}

test('Q11 original first-masu ruby requires this booklet and major11; the base character and reading remain separate', () => {
  for (const origin of ['official', 'adapted'] as const) {
    const a = attribution(11); a.origin = origin;
    const html = render(a, [{type: 'paragraph', text: mazeIntroduction}]);
    assert(html.includes('<ruby data-source-ruby="2019-spring-pm11-first-masu">升<rt>ます</rt></ruby>目を'));
    assert.equal((html.match(/<ruby /g) ?? []).length, 1);
    assert.equal(html.replace(/<rt>.*?<\/rt>/g, '').replace(/<[^>]*>/g, ''), mazeIntroduction);
  }
  for (let n = 1; n <= 13; n++) if (n !== 11)
    assert(!render(attribution(n), [{type: 'paragraph', text: mazeIntroduction}]).includes('<ruby'));
  const mutations: Array<(a: Attribution) => void> = [
    a => {a.origin = 'original';}, a => {a.sourceRefs = [];},
    a => {a.sourceRefs[0].sourceId = 'source-ipa-2019h31h-fe-pm-11-ans';},
    a => {a.sourceRefs[0].locator.year = 2018;},
    a => {a.sourceRefs[0].locator.period = '秋期';},
    a => {a.sourceRefs[0].locator.timeSlot = '午前';},
    a => {a.sourceRefs[0].locator.questionNumber = '011';},
    a => {a.sourceRefs.push(attribution(10).sourceRefs[0]);},
    a => {delete a.sourceRefs[0].locator.timeSlot;},
  ];
  for (const mutate of mutations) {
    const a = attribution(11); mutate(a);
    assert(!render(a, [{type: 'paragraph', text: mazeIntroduction}]).includes('<ruby'));
  }
  assert(!render(attribution(11), [{type: 'paragraph', text: mazeIntroduction + '升目。'}]).includes('<ruby'));
  assert.equal(isLegacy2019SpringNativeText(mazeIntroduction), false);
  assert.equal(isLegacy2019SpringNativeText(mazeIntroduction, 11), true);
  assert(!renderToStaticMarkup(createElement('code', null, legacy2019SpringInlineBlanks(mazeIntroduction))).includes('<ruby'));
  assert(!renderToStaticMarkup(createElement(Legacy2019SpringNativeText, {text: mazeIntroduction})).includes('<ruby'));
  // Ruby belongs to the source introduction paragraph; program text retains
  // its literal characters even with the same booklet/major attribution.
  const code = render(attribution(11), [{type: 'code', language: 'text', text: mazeIntroduction}]);
  assert(!code.includes('<ruby'));
  assert(code.includes(`<pre><code>${mazeIntroduction}</code></pre>`));
});

test('S205 exact source locators select native headings and compound/anonymous source blanks for each of13 majors', () => {
  for (let number = 1; number <= 13; number++) for (const origin of ['adapted', 'official'] as const) {
    const a = attribution(number); a.origin = origin;
    const html = render(a, [{type: 'paragraph', text: '〔設問1〕'}, {type: 'paragraph', text: '条件［c1］と［c2］，無記名［空欄］及び［設問3］を維持する。'}]);
    assert(html.includes('class="spring2019-source-heading"'));
    assert.equal((html.match(/data-source-blank=/g) ?? []).length, 4);
    assert(html.includes('data-source-blank="c1"'));
    assert(html.includes('data-source-blank="c2"'));
    assert(html.includes('data-source-blank="anonymous" aria-label="空欄"> </span>'));
    assert(html.includes('data-source-blank="設問3" aria-label="設問3の解答欄"> </span>'));
    assert(!html.includes('>空欄</span>'));
    assert(!html.includes('>設問3</span>'));
  }
});

test('S205 source-owned code retains every character and renders blanks inline without executing or inserting paragraph elements', () => {
  const text = 'SELECT id FROM records WHERE code = ［c1］\n// ［c2］\n<script>globalThis.sourceProbe = 1</script>\n';
  const html = render(attribution(3), [{type: 'code', language: 'sql', text}]);
  assert(html.includes('class="spring2019-source-code"'));
  assert(!html.includes('· 表示のみ'));
  assert(html.includes('<pre><code>SELECT id FROM records WHERE code = '));
  assert(html.includes('data-source-blank="c1"'));
  assert(html.includes('data-source-blank="c2"'));
  assert(html.includes('&lt;script&gt;globalThis.sourceProbe = 1&lt;/script&gt;\n</code></pre>'));
  assert(!html.includes('<script>'));
  assert(!/<p(?:\s|>)/u.test(html));
  assert(!html.includes('<details'));
  const visible = html.slice(html.indexOf('<code>') + 6, html.indexOf('</code>'))
    .replace(/<span[^>]*>(.*?)<\/span>/g, (_all, label: string) => `［${label}］`)
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
  assert.equal(visible, text);
});

test('similar text, own prose, mixed or missing locators and every wrong source dimension keep the ordinary Content path', () => {
  const mutations: Array<(a: Attribution) => void> = [
    a => {a.origin = 'original';}, a => {a.sourceRefs = [];},
    a => {a.sourceRefs[0].sourceId = 'source-ipa-2019h31h-fe-pm-1-ans';},
    a => {a.sourceRefs[0].locator.year = 2018;},
    a => {a.sourceRefs[0].locator.period = '秋期';},
    a => {a.sourceRefs[0].locator.timeSlot = '午前';},
    a => {a.sourceRefs[0].locator.questionNumber = '14';},
    a => {a.sourceRefs[0].locator.questionNumber = '01';},
    a => {a.sourceRefs.push(attribution(2).sourceRefs[0]);},
    a => {delete a.sourceRefs[0].locator.timeSlot;},
  ];
  const blocks: Block[] = [{type: 'paragraph', text: '〔設問1〕'}, {type: 'code', language: 'sql', text: 'SELECT ［c1］'}];
  for (const mutate of mutations) {
    const a = attribution(1); mutate(a);
    const html = render(a, blocks);
    assert(!html.includes('spring2019-source-heading'));
    assert(!html.includes('data-source-blank='));
    assert(html.includes('SELECT ［c1］'));
  }
  const ordinary = '前提文の192.168.0.254と−12.50秒を一つの値として読む。';
  assert.equal(render(attribution(1), [{type: 'paragraph', text: ordinary}]),
    render({...attribution(1), origin: 'original'}, [{type: 'paragraph', text: ordinary}]));
});

test('Q3 QS14/16 keep all table cells before the source note and three bottom captions, with no duplicate source note', () => {
  // The source has figure labels under these tables. QS14 places its note
  // between the first table and its figure label; QS16 has no such note.
  const note = '注記 行の並び順はSQL文の出力順と同じである。';
  const figures: Block[] = [
    {type: 'table', caption: '図1 体格推移表', columns: ['年度', '学年', '性別', '平均身長', '最大身長', '最小身長', '平均体重', '最大体重', '最小体重'], rows: [['2019', '1', '男', '152.8', '168.2', '140.4', '48.1', '73.1', '43.6']]},
    {type: 'paragraph', text: note},
    {type: 'table', caption: '図2 身長階級表', columns: ['身長階級', '階級下限', '階級上限'], rows: [['140cm未満', '0.0', '139.9']]},
    {type: 'table', caption: '図3 身長度数分布表', columns: ['身長階級', '人数'], rows: [['140cm未満', '3']]},
  ];
  const html = render(attribution(3), figures);
  assert.equal((html.match(/<table /g) ?? []).length, 3);
  assert.equal((html.match(/<figcaption>/g) ?? []).length, 3);
  assert.equal((html.match(/data-source-table-note=/g) ?? []).length, 1);
  assert.equal(html.split(note).length - 1, 1);
  assert(!html.includes('<caption>'));
  const tables = [...html.matchAll(/<figure class="spring2019-source-table">(.*?)<\/figure>/g)].map(m => m[1]);
  assert.equal(tables.length, 3);
  assert(tables[0].indexOf('</table>') < tables[0].indexOf(note));
  assert(tables[0].indexOf(note) < tables[0].indexOf('<figcaption>図1 体格推移表</figcaption>'));
  for (let i = 0; i < 3; i++) {
    const block = figures[i === 0 ? 0 : i + 1]; assert(block.type === 'table');
    assert(tables[i].indexOf('</table>') < tables[i].indexOf('<figcaption>'));
    assert(tables[i].includes(`aria-label="${block.caption}"`));
    for (const value of [...block.columns, ...block.rows.flat()]) assert(tables[i].includes(value));
  }
  const wrong = render(attribution(2), figures);
  assert(!wrong.includes('spring2019-source-table'));
  assert.equal((wrong.match(/<caption>/g) ?? []).length, 3);
  const altered = structuredClone(figures); assert(altered[1].type === 'paragraph'); altered[1].text += '改変';
  const unmatched = render(attribution(3), altered);
  assert(unmatched.includes('<caption>図1 体格推移表</caption>'));
  assert(unmatched.includes(note + '改変'));
});
