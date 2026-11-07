import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block, Bundle } from '../src/core/types';
import { Content } from '../src/ui/Content';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2015AutumnAm5480Definitions as definitions } from '../src/core/generators/legacy-2015-autumn-am-54-80';
import { historicalReview, knowledgeReview, reviewedWordingPins, roiReview } from './fixtures/legacy-2015-autumn-am-54-80-knowledge-review';
import originals from './fixtures/legacy-2015-autumn-am-54-80-source-review.json';

const originalRows = originals as Record<string, { page: number; fullAlt?: string; publish?: boolean }>;
const numbers = Array.from({ length: 27 }, (_, i) => i + 54);
const eligible = numbers.filter(number => number !== 55);
const officialKeys = 'エイウアアイウイアエエアウイアアエウエイイエイイウアア';
const labels = 'アイウエ';
const questionNumber = (source: string) => Number(source.split('-').at(-1));
const paragraph = (block: Block) => {
  assert.equal(block.type, 'paragraph');
  return (block as Extract<Block, { type: 'paragraph' }>).text;
};
const optionText = (body: GeneratedBody) => body.choices.map(choice => {
  assert.equal(choice.length, 1);
  return paragraph(choice[0]);
});
const displayedTables = (body: GeneratedBody) =>
  body.prompt.filter((block): block is Extract<Block, { type: 'table' }> => block.type === 'table');
const parseInteger = (value: string) => {
  assert.match(value, /^\d{1,3}(?:,\d{3})*$|^\d+$/u);
  return BigInt(value.replaceAll(',', ''));
};

function calculateRoi(body: GeneratedBody, index: number): boolean[] {
  const stem = paragraph(body.prompt[0]);
  assert.match(stem, /5年間.*ここで，/u);
  assert(stem.endsWith(index === 0 ? roiReview.referenceCondition : roiReview.adaptationCondition));
  assert(!stem.includes(index === 0 ? roiReview.adaptationCondition : roiReview.referenceCondition));
  const tables = displayedTables(body);
  assert.deepEqual(tables.map(block => block.caption), ['a', 'b', 'c', 'd']);
  assert.deepEqual(tables.map(block => block.sourceLabels), ['a', 'b', 'c', 'd'].map(text => [{ position: 'start', text }]));
  const values = tables.map(block => {
    assert.deepEqual(block.columns, ['年目', '0', '1', '2', '3', '4', '5']);
    const [profit, investment] = block.rows;
    assert.equal(block.rows.length, 2);
    assert.equal(profit.length, 7);
    assert.deepEqual(profit.slice(0, 2), ['利益', '']);
    assert.equal(investment[0], '投資額');
    assert.deepEqual(investment.slice(2), ['', '', '', '', '']);
    return { gain: profit.slice(2).reduce((sum, value) => sum + parseInteger(value), 0n), basis: parseInteger(investment[1]) };
  });
  assert(values.every(candidate => candidate.basis > 0n));
  const winner = values.findIndex(candidate => values.every(other =>
    other === candidate || candidate.gain * other.basis > other.gain * candidate.basis,
  ));
  assert(winner >= 0, 'ROI comparison must have exactly one strict maximum');
  assert.match(body.explanation, new RegExp(`最も高いのは${'abcd'[winner]}`, 'u'));
  assert.match(body.explanation, /ROI.*投資利益率.*IRR.*キャッシュフロー.*正味現在価値を0にする割引率/u);
  assert.match(body.explanation, index === 0 ? /原文はIRR/u : /この改変問題では割引率を考慮しない前提/u);
  return optionText(body).map(label => label === 'abcd'[winner]);
}

function calculateTender(body: GeneratedBody): boolean[] {
  const conditions = body.prompt.find((block): block is Extract<Block, { type: 'list' }> => block.type === 'list');
  assert(conditions?.ordered);
  assert.match(conditions.items[0], /価格点（100点満点）及び技術点（100点満点）を合算/u);
  const budgetLine = /^予定価格を([\d,]+)万円とする。予定価格を超える入札は評価対象とならない。$/u.exec(conditions.items[1]);
  assert(budgetLine);
  assert.equal(conditions.items[2], '価格点は次の計算式で算出する。');
  assert(body.prompt.some(block => block.type === 'formula' && block.text === '［1 −（入札価格／予定価格）］×100'));
  const budget = parseInteger(budgetLine[1]);
  const [table] = displayedTables(body);
  assert.deepEqual(table.columns, ['', '入札価格（万円）', '技術点']);
  assert.deepEqual(table.rows.map(([name]) => name), ['A社', 'B社', 'C社', 'D社']);
  const scaled = table.rows.map(([name, rawPrice, rawTechnical]) => {
    const price = parseInteger(rawPrice);
    const technical = parseInteger(rawTechnical);
    assert(technical >= 0n && technical <= 100n);
    return { name, price, score: 100n * (budget - price) + budget * technical };
  });
  const candidates = scaled.filter(candidate => candidate.price <= budget);
  assert(candidates.length > 1 && candidates.length < scaled.length);
  const winner = candidates.find(candidate => candidates.every(other =>
    other === candidate || candidate.score > other.score,
  ));
  assert(winner);
  assert.match(body.explanation, new RegExp(`評価対象のうち最も高い${winner.name}`, 'u'));
  for (const bid of scaled) {
    assert(bid.score % budget === 0n, 'the displayed points require no rounding');
    assert(body.explanation.includes(bid.price > budget ? bid.name + 'が評価対象外' : bid.name + 'が' + bid.score / budget + '点'));
  }
  return optionText(body).map(option => option === winner.name);
}

function checkInvestmentPurpose(body: GeneratedBody): boolean[] {
  const stem = paragraph(body.prompt[0]);
  const requested = /投資目的の([a-d])に当てはまる/u.exec(stem)?.[1];
  assert(requested && stem.includes('ア〜エはa〜dのいずれかに入る'));
  const [table] = displayedTables(body);
  assert.deepEqual(table.columns, ['投資目的', '投資分類', 'KPI']);
  assert.deepEqual(table.rows.map(([label]) => label), ['a', 'b', 'c', 'd']);
  const purposes: Record<string, [RegExp, string]> = {
    業務効率化投資: [/納期の遵守率，月次決算の所要日数/u, '作業プロセスの改善，作業品質の向上'],
    情報活用投資: [/提案事例の登録件数，顧客への提案件数/u, 'ナレッジの可視化，ナレッジの共有'],
    戦略的投資: [/新規事業のROI，新製品の市場シェア/u, 'ビジネスの創出，競争優位の確立'],
    IT基盤投資: [/システムの障害件数，検索の応答時間/u, 'システム維持管理コストの削減，システム性能の向上'],
  };
  for (const [, category, indicators] of table.rows) {
    assert.match(indicators, purposes[category][0]);
  }
  const target = table.rows.find(([label]) => label === requested);
  assert(target);
  const correct = purposes[target[1]][1];
  assert(body.explanation.includes(correct));
  assert.deepEqual(new Set(optionText(body)), new Set(Object.values(purposes).map(([, claim]) => claim)));
  return optionText(body).map(option => option === correct);
}

function calculateDisposal(body: GeneratedBody): boolean[] {
  const stem = paragraph(body.prompt[0]);
  const terms = /平成27年4月に(\d+)万円で購入したPCを(\d+)年後に(\d+)万円で売却.*耐用年数は(\d+)年.*減価償却は定額法.*償却率は0\.250，残存価額は0円/u.exec(stem);
  assert(terms);
  const [, original, elapsed, sale, years] = terms.map(Number);
  assert.equal(years, 4);
  let ledger = original * 10_000;
  const expense = ledger / years;
  for (let year = 0; year < elapsed; year++) ledger -= expense;
  const disposed = Number(sale) * 10_000;
  const loss = ledger - disposed;
  assert(loss > 0);
  const options = optionText(body);
  assert(options.every(option => /^\d+\.\d$/u.test(option)));
  assert.deepEqual(options.slice(1).map((option, i) => Number(option) - Number(options[i])), [0.5, 0.5, 0.5]);
  assert.equal(Number(options.at(-1)) * 10_000, ledger, 'book value is a distractor');
  assert.match(body.explanation, new RegExp(`売却損は${(loss / 10_000).toFixed(1)}万円`, 'u'));
  return options.map(option => Number(option) * 10_000 === loss);
}

function calculateFifo(body: GeneratedBody): boolean[] {
  assert.match(paragraph(body.prompt[0]), /先入先出法.*何千円/u);
  const [table] = displayedTables(body);
  assert.deepEqual(table.columns, ['摘要', '数量（個）', '単価（千円）']);
  assert.deepEqual(table.rows.map(([summary]) => summary), ['期首在庫', '仕入 4月', '仕入 6月', '仕入 7月', '仕入 9月', '期末在庫']);
  const rows = table.rows.slice(0, -1);
  const arrivals = rows.flatMap(([, amount, price]) => Array(Number(parseInteger(amount))).fill(Number(parseInteger(price))) as number[]);
  const [, end, blank] = table.rows[5];
  assert.equal(blank, '');
  const count = Number(parseInteger(end));
  assert(count > 0 && count < arrivals.length);
  const value = arrivals.slice(arrivals.length - count).reduce((sum, price) => sum + price, 0);
  const gross = arrivals.reduce((sum, price) => sum + price, 0);
  assert.equal((gross * count) % arrivals.length, 0);
  const options = optionText(body).map(text => Number(parseInteger(text)));
  assert.deepEqual(options, [Number(rows[1][2]) * count, gross * count / arrivals.length, value, Number(rows[4][2]) * count]);
  assert(options.slice(1).every((option, i) => option - options[i] >= 6));
  assert(body.explanation.includes(`＝${value}千円`));
  return options.map(option => option === value);
}

const independentCalculations: Record<number, (body: GeneratedBody, index: number) => boolean[]> = {
  65: calculateRoi,
  66: calculateTender,
  70: checkInvestmentPurpose,
  77: calculateDisposal,
  78: calculateFifo,
};
function inspect(number: number, index: number, body: GeneratedBody) {
  const calculation = independentCalculations[number];
  let truths: readonly boolean[];
  if (calculation) truths = calculation(body, index);
  else {
    const review = knowledgeReview[number]?.[index];
    assert(review, `missing independent review for ${number}/${index}`);
    const [stem, claims, result, explanation] = review;
    assert(paragraph(body.prompt[0]).includes(stem), `unreviewed stem ${number}/${index}`);
    const actualChoices = optionText(body);
    for (const [position, option] of actualChoices.entries()) {
      assert(option.includes(claims[position]), `unreviewed claim ${number}/${index}/${labels[position]}`);
    }
    const digest = createHash('sha256').update(JSON.stringify([paragraph(body.prompt[0]), actualChoices])).digest('hex');
    assert.equal(digest, reviewedWordingPins[number]?.[index], `unreviewed wording ${number}/${index}`);
    assert.match(body.explanation, new RegExp(explanation, 'u'), `explanation mismatch ${number}/${index}`);
    truths = result;
  }
  assert.equal(truths.length, 4);
  assert.equal(truths.filter(Boolean).length, 1);
  assert.equal(body.correctIndex, truths.indexOf(true));
  assert.equal(new Set(optionText(body)).size, 4);
}

test('2015 autumn morning 54–80 preserves all literal baseline stems, four choices, original tables and the material hold', () => {
  assert.deepEqual(Object.keys(originalRows).map(Number), numbers);
  assert.deepEqual(definitions.map(definition => questionNumber(definition.source)), eligible);
  assert.equal(originalRows['55'].publish, false);
  assert.equal(originalRows['55'].fullAlt, undefined);
  for (const definition of definitions) {
    const number = questionNumber(definition.source);
    const row = originalRows[String(number)];
    assert(row.fullAlt);
    const [stem, ...rest] = row.fullAlt.split('\n');
    const baseline = definition.build(definition.reference);
    assert.equal(paragraph(baseline.prompt[0]), stem.replace(`問${number}。`, ''));
    assert.deepEqual(optionText(baseline), rest.slice(-4).map(choice => choice.slice(2)));
    assert.equal(definition.sourceAnswer, officialKeys[number - 54]);
    assert.equal(baseline.correctIndex, labels.indexOf(definition.sourceAnswer));
  }
  const baselineFor = (n: number) => definitions.find(d => questionNumber(d.source) === n)!.build([0]);
  assert.deepEqual(displayedTables(baselineFor(65)).map(table => table.rows.map(row => row.join('/'))), [
    ['利益//15/30/45/30/15', '投資額/100/////'],
    ['利益//105/75/45/15/0', '投資額/200/////'],
    ['利益//60/75/90/75/60', '投資額/300/////'],
    ['利益//105/105/105/105/105', '投資額/400/////'],
  ]);
  assert.deepEqual(displayedTables(baselineFor(66))[0].rows, [
    ['A社', '700', '50'], ['B社', '800', '65'], ['C社', '900', '80'], ['D社', '1,100', '100'],
  ]);
  assert.deepEqual(displayedTables(baselineFor(78))[0].rows, [
    ['期首在庫', '10', '10'], ['仕入 4月', '1', '11'], ['仕入 6月', '2', '12'],
    ['仕入 7月', '3', '13'], ['仕入 9月', '4', '14'], ['期末在庫', '12', ''],
  ]);
});

test('independent truth checks and numeric oracles cover all 104 source and adapted bodies', () => {
  let count = 0;
  for (const definition of definitions) {
    const number = questionNumber(definition.source);
    const seen = new Set<string>();
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(({ minimum, maximum }) => [minimum, maximum]), [[0, 3]]);
    for (let index = 0; index <= 3; index++) {
      const body = definition.build([index]);
      inspect(number, index, body);
      assert.deepEqual(body, definition.build([index]));
      const visibleCondition = JSON.stringify(body.prompt);
      assert(!seen.has(visibleCondition), `substantive visible condition repeated for ${number}/${index}`);
      seen.add(visibleCondition);
      count++;
    }
    for (const invalid of [[], [-1], [4], [0.5], [NaN], [Infinity], [0, 1]]) {
      assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/u);
    }
  }
  assert.equal(count, 104);
});

test('each question detects a changed key and an unreviewed choice, and retains a new eligible answer after two prior inputs', () => {
  for (const definition of definitions) {
    const number = questionNumber(definition.source);
    const bodies = [0, 1, 2, 3].map(index => definition.build([index]));
    const correctTexts = bodies.map(body => optionText(body)[body.correctIndex!]);
    assert.equal(new Set(correctTexts).size, 4, `correct answer content capacity for ${number}`);
    for (const index of [0, 3]) {
      const body = bodies[index];
      assert.throws(() => inspect(number, index, { ...body, correctIndex: (body.correctIndex! + 1) % 4 }));
      const mutated = structuredClone(body);
      mutated.choices[body.correctIndex!] = [{ type: 'paragraph', text: '検証用の未査読選択肢' }];
      assert.throws(() => inspect(number, index, mutated));
      if (knowledgeReview[number]) {
        const changedMeaning = structuredClone(body);
        changedMeaning.choices[body.correctIndex!] = [{
          type: 'paragraph',
          text: optionText(body)[body.correctIndex!] + ' この説明は成り立たない。',
        }];
        assert.throws(() => inspect(number, index, changedMeaning), /unreviewed wording/u);
      }
    }
  }
});

test('legal cases have dated primary evidence and identify the relevant historical provisions', () => {
  const legal = definitions.filter(definition => [79, 80].includes(questionNumber(definition.source)));
  assert.equal(historicalReview.asOf, '2015-10-18');
  const roi = definitions.find(definition => questionNumber(definition.source) === 65)!;
  assert.match(roi.notes, /原資料p\.29.*基準入力0.*2019年度春期旧午前問65.*改変.*p\.86/u);
  assert.equal(roiReview.irrDefinition.printedPage, 86);
  assert.equal(roiReview.laterQuestion.number, 65);
  assert.match(roiReview.irrDefinition.url, /^https:\/\/www\.mlit\.go\.jp\//u);
  assert.match(roiReview.laterQuestion.url, /^https:\/\/www\.ipa\.go\.jp\//u);
  for (const definition of legal) {
    for (const index of [1, 2, 3]) {
      const stem = paragraph(definition.build([index]).prompt[0]);
      assert.match(stem, /^2015年10月18日時点/u);
      if (questionNumber(definition.source) === 79) {
        assert.match(stem, /の責務の説明として，適切なものはどれか。$/u);
      }
    }
  }
  const cyber = legal[0];
  const laws = legal[1];
  for (const [index, article] of historicalReview.cyber.articleByCase.entries()) {
    assert(cyber.build([index]).explanation.includes(`第${article}条`));
  }
  for (const [index, fact] of historicalReview.purposes.entries()) {
    const actual = laws.build([index]);
    assert(paragraph(actual.prompt[0]).includes(fact.act));
    assert(actual.explanation.includes(`第${fact.article}条`));
    assert.match(fact.evidence, /^https:\/\//u);
  }
});

test('source table labels, blank cells and pre-answer conditions reach the shared Content renderer', () => {
  const bundle = { sources: [], rights: [], assets: [] } as unknown as Bundle;
  const render = (number: number, blocks: Block[]) => renderToStaticMarkup(createElement(Content, {
    content: {
      attribution: {
        origin: 'adapted',
        creatorIds: ['codex'],
        rightsRefs: ['rights-original'],
        sourceRefs: [{
          sourceId: 'source-ipa-2015h27a-fe-am-qs',
          locator: { section: '午前問題', year: 2015, period: '秋期', timeSlot: '午前', questionNumber: String(number) },
        }],
      },
      blocks,
    },
    bundle,
    assetUrls: {},
    showAttribution: false,
  }));
  for (const definition of definitions) {
    const n = questionNumber(definition.source);
    for (let index = 0; index < 4; index++) {
      const body = definition.build([index]);
      const markup = render(n, body.prompt);
      assert(!markup.includes('supplementary-text') && !markup.includes('undefined'));
      assert.equal([...markup.matchAll(/<table(?:>| )/gu)].length, displayedTables(body).length);
      if (n === 65) {
        assert(markup.includes(index === 0 ? roiReview.referenceCondition : roiReview.adaptationCondition));
        assert.equal([...markup.matchAll(/class="source-caption-with-side"/gu)].length, 4);
        assert.match(markup, /<td><\/td>/u);
      }
      if (n === 66) {
        assert.match(markup, /予定価格を超える入札は評価対象とならない。/u);
        assert.match(markup, /入札価格／予定価格/u);
        assert.match(markup, /技術点/u);
      }
      if (n === 70) assert.match(markup, /ア〜エはa〜dのいずれかに入る/u);
      if (n === 74) assert.match(markup, /適切でないもの/u);
      if (n === 78) assert.match(markup, /仕入 4月.*仕入 6月.*仕入 7月.*仕入 9月.*期末在庫/u);
    }
  }
});
