import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005AutumnAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2005-autumn-am-27-53';
import { legacy2005AutumnAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2005AutumnAm2753Figures';
import { semantics } from '../../fixtures/legacy-2005-autumn-am-27-53-review';

const params = [0,1,2,3] as const;
const symbols = 'アイウエ';
const numberOf = (source: string) => Number(source.split('-').at(-1));
const found = (number: number) => definitions.find(row => numberOf(row.source) === number)!;
function body(number: number, index: number) { return found(number).build([index]); }
function text(block: Block) {
  assert(block.type === 'paragraph' || block.type === 'code' || block.type === 'heading');
  return block.text;
}
function table(block: Block) {
  assert(block.type === 'table');
  return block;
}
function key(body: GeneratedBody) {
  assert(typeof body.correctIndex === 'number');
  return body.correctIndex;
}
function oneTrue(truth: boolean[], selected: number) {
  assert.deepEqual(truth, [0,1,2,3].map(index => index === selected));
}

test('2005年度秋期午前問27〜53の掲載集合、四条件、元の選択肢数と公式キー', () => {
  const numbers = Array.from({length: 27}, (_, i) => i + 27).filter(number => number !== 34 && number !== 43);
  assert.deepEqual(definitions.map(row => numberOf(row.source)), numbers);
  assert.equal(definitions.length, 25);
  for (const definition of definitions) {
    const outputs = params.map(index => definition.build([index]));
    assert.equal(new Set(outputs.map(item => JSON.stringify(item.prompt))).size, 4, definition.source);
    assert.equal(symbols[key(outputs[0])], definition.sourceAnswer);
    const answers = new Set(outputs.map(item => JSON.stringify(item.choices[key(item)])));
    assert.equal(definition.answerVariation === 'fixed', answers.size === 1, definition.source);
    for (const item of outputs) {
      assert.equal(item.choices.length, 4);
      assert.equal(new Set(item.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert([0,1,2,3].includes(key(item)));
    }
    for (const rejected of [[], [0,1], [-1], [4], [1.5]]) assert.throws(() => definition.build(rejected));
  }
});

test('知識問題は査読固定の用語・条件・誤答の役割・解説の根拠を全選択肢で照合する', () => {
  assert.equal(Object.keys(semantics).length, 20);
  for (const [n, review] of Object.entries(semantics)) for (const index of params) {
    const generated = body(Number(n), index);
    const label = '問' + n + ' 条件' + index;
    assert.match(text(generated.prompt[0]), review.conditions[index], label);
    const roles = index === 0 ? review.roles : review.alternatives?.[index] ?? review.roles;
    const meaning = generated.choices.map(choice => text(choice[0]));
    meaning.forEach((choice, i) => assert.match(choice, roles[i], label + symbols[i]));
    oneTrue(meaning.map(choice => roles[symbols.indexOf(review.answers[index])].test(choice)), key(generated));
    assert.match(generated.explanation, review.mainReason, label);
  }
});

type TaskState = { nextCpu: number; releaseTime: number; remaining: number; finished: boolean };
function runSchedule(shortestHigh: number[], low: number[], canInterrupt: boolean) {
  const plans = [shortestHigh, low];
  const tasks: TaskState[] = plans.map(row => ({ nextCpu: 0, releaseTime: 0, remaining: row[0], finished: false }));
  let active: number | undefined;
  const ticks = [];
  for (let time = 0; !tasks.every(task => task.finished); time++) {
    assert(time < 100);
    if (active === undefined || canInterrupt) {
      const chosen = tasks.findIndex(task => !task.finished && task.releaseTime <= time);
      active = chosen < 0 ? undefined : chosen;
    }
    if (active === undefined) { ticks.push('-'); continue; }
    const task = tasks[active], stages = plans[active];
    ticks.push('AB'[active]);
    task.remaining--;
    if (task.remaining > 0) continue;
    if (task.nextCpu + 2 >= stages.length) task.finished = true;
    else {
      task.releaseTime = time + 1 + stages[task.nextCpu + 1];
      task.nextCpu += 2;
      task.remaining = stages[task.nextCpu];
    }
    active = undefined;
  }
  return ticks.join('');
}

test('問28はCPUの1ミリ秒ごとの独立したスケジュールで両優先方式・全候補を照合する', () => {
  const original = [[3,3,3,3,2], [2,5,2,2,3], [3,2,2,3,2], [3,2,3,1,4], [3,4,2,5,2]];
  const traces = ['AAABB-AAA-BBAABBB', 'AAABBBAAABB-AABB', 'AAABBBAAABBBAABBBB', 'AAABBBAAA-BBAA---BB'];
  for (const index of params) {
    const g = body(28, index), tbl = table(g.prompt[1]);
    assert.deepEqual(tbl.rows.map(row => row.slice(0,2)), [['A','高'], ['B','低'], ['C','低'], ['D','低'], ['E','低']]);
    assert.match(text(g.prompt[0]), /同時.*I\/O は競合せず.*オーバヘッドは無視/);
    assert.match(tbl.columns[2], /ミリ秒/);
    const value = tbl.rows.map(row => {
      assert.equal(row[2].replace(/（\d+）/g, ''), 'CPU → I/O → CPU → I/O → CPU');
      return [...row[2].matchAll(/（([1-5])）/g)].map(m => Number(m[1]));
    });
    if (index === 0) assert.deepEqual(value, original);
    const layout = [true,false].map(preempt => value.slice(1).map(row => runSchedule(value[0], row, preempt)));
    if (index === 0) assert.deepEqual(layout[0], traces);
    assert.deepEqual(g.choices.map(row => text(row[0])), ['B','C','D','E']);
    for (const outcomes of layout) oneTrue(outcomes.map(ticks => !ticks.includes('-')), key(g));
    layout[0].forEach((ticks, i) => assert(g.explanation.includes('BCDE'[i] + 'との組で' +
      (ticks.match(/-/g)?.length ?? 0) + 'ミリ秒')));
  }
});

function transactionResult(start: number, steps: string[]) {
  const writes = ['a4','b4'].sort((a,b) => steps.indexOf(a) - steps.indexOf(b));
  let history: readonly [number, number][] = [[-1,start]];
  for (const label of writes) {
    const operation = label[0];
    const reads = [1,2].map(number => steps.indexOf(operation + number)).map(position =>
      history.filter(([write]) => write < position).at(-1)![1]);
    const written = operation === 'a' ? reads[0] + reads[1] : reads[0] * reads[1];
    history = [...history, [steps.indexOf(label), written]];
  }
  return history.at(-1)![1];
}

test('問29は書込みの時系列を独立に構築し，全ての実行順・読取り・結果を照合する', () => {
  for (const i of params) {
    const g = body(29, i), conditions = text(g.prompt[0]);
    const start = Number(/初期値が(\d+)/.exec(conditions)![1]);
    const target = Number(/最終的な x の値が(\d+)/.exec(conditions)![1]);
    assert.deepEqual([start,target], [[3,12],[4,32],[5,50],[6,12]][i]);
    assert.match(conditions, /同期制御を行わない.*x＝x＋x.*x＝x×x/);
    const rows = table(g.prompt[1]).rows;
    assert.equal(rows.length,4);
    assert.match(rows[2][0], /a3.*e＋f/);
    assert.match(rows[2][1], /b3.*h×i/);
    const results = g.choices.map(choice => {
      const steps = text(choice[0]).split(' → ');
      assert.equal(steps.length,8);
      for (const prefix of ['a','b']) assert.deepEqual(steps.filter(step => step.startsWith(prefix)),
        [1,2,3,4].map(number => prefix + number));
      return transactionResult(start, steps);
    });
    if (i === 0) assert.deepEqual(results,[9,12,18,9]);
    oneTrue(results.map(final => final === target),key(g));
    results.forEach((final,index) => assert(g.explanation.includes(symbols[index] + 'が' + final)));
  }
});

test('問30は機能の観察可能な特徴から組合せの四候補を独立分類する', () => {
  const meanings = [
    [/プログラムの指定.*主記憶に読み込む/,'オーバレイ'],
    [/固定長の単位.*大きなプログラム/,'ページング'],
    [/一時的に停止.*退避.*再ロード/,'スワッピング'],
  ] as const;
  for (const index of params) {
    const g = body(30,index), rows = table(g.prompt[1]).rows;
    const reference = rows.map(([label,description], i) => {
      assert.equal(label,'abc'[i]);
      const hits = meanings.filter(([pattern]) => pattern.test(description));
      assert.equal(hits.length,1);
      return hits[0][1];
    });
    const observed = g.choices.map(choice => table(choice[0]));
    observed.forEach(table => assert.deepEqual(table.columns,['a','b','c']));
    oneTrue(observed.map(table => table.rows[0].join() === reference.join()),key(g));
    assert(reference.every(value => g.explanation.includes(value)));
  }
});

test('問35の稼働／修理／サイクルの式は独立の時間区間と一致し，図のラベルと代替文を表示する', () => {
  const measures: Record<string,number> = { MTBF: (4+8+10)/3, MTTR: (2+2+3)/3,
    '1サイクルの平均時間': (4+2+8+2+10+3)/3 };
  for (const index of params) {
    const g = body(35,index);
    assert.match(text(g.prompt[0]), /tᵢ.*稼働時間.*rᵢ.*修理時間.*n/);
    const matches = g.choices.map(choice => {
      const block = table(choice[0]);
      return block.rows[0].every((formula,j) => {
        const hasUp = formula.includes('tᵢ'), hasRepair = formula.includes('rᵢ');
        assert.match(formula,/^\(Σᵢ₌₁ⁿ .+\)／n$/);
        const up = [4,8,10], repair = [2,2,3];
        const sampled = up.map((interval,k) => (hasUp ? interval : 0) + (hasRepair ? repair[k] : 0));
        return sampled.reduce((sum,time) => sum + time,0)/sampled.length === measures[block.columns[j]];
      });
    });
    oneTrue(matches,key(g));
    assert(g.explanation.includes('平均故障間隔') && g.explanation.includes('平均修理時間'));
    const graphic = g.prompt[1];
    assert(graphic.type === 'diagram' && graphic.scene.kind === 'source_figure');
    const scene = graphic.scene;
    const renderer = renderers.find(renderer => renderer.profile === scene.profile)!;
    const html = renderToStaticMarkup(createElement(renderer.component,{values:scene.values,caption:graphic.caption}));
    assert.match(html,/role="img".*aria-labelledby=".*-title".*aria-describedby=".*-desc"/);
    assert(html.includes('<desc') && html.includes(graphic.alt) && html.includes('tabindex="0"'));
    assert.deepEqual([...html.matchAll(/data-interval="([^"]+)"/g)].map(match => match[1]),['t₁','r₁','t₂','r₂','t₃','r₃','t₄']);
    assert.equal((html.match(/故障発生/g) ?? []).length,3);
  }
});

test('問50の各期間で，月末の補正を含む4年の暦からテープの最大必要本数を独立計算する', () => {
  const dayMs = 864e5;
  for (const i of params) {
    const g = body(50,i), rules = g.prompt.slice(2).map(text).join(' ');
    const months = Number(/常に(\d+)か月前/.exec(rules)![1]);
    assert.equal(months,[6,4,8,5][i]);
    assert.match(rules,/毎月初日（1日）.*フルバックアップ/);
    assert.match(rules,/翌日.*毎日.*差分.*1か月分が1本/);
    assert.match(rules,/同一日が存在しない.*当該月の月末日以降/);
    let largest = 0;
    for (let t = Date.UTC(2004,0,1);t<Date.UTC(2008,0,1);t+=dayMs) {
      const today = new Date(t), year = today.getUTCFullYear(), month = today.getUTCMonth();
      const last = new Date(Date.UTC(year,month-months+1,0)).getUTCDate();
      const since = Date.UTC(year,month-months,Math.min(today.getUTCDate(),last));
      const tapes = new Set<string>();
      for (let day=since;day<=t;day+=dayMs) {
        const point = new Date(day), volume = point.getUTCFullYear()+'-'+point.getUTCMonth();
        tapes.add('F'+volume);
        if (point.getUTCDate()!==1) tapes.add('D'+volume);
      }
      largest = Math.max(largest,tapes.size);
    }
    if (i===0) assert.equal(largest,14);
    const options = g.choices.map(choice => Number(text(choice[0])));
    assert.deepEqual(options,[...options].sort((a,b)=>a-b));
    assert(options.slice(1).every((candidate,j)=>candidate-options[j]===1));
    oneTrue(options.map(option => option === largest),key(g));
    assert(g.explanation.includes(largest+'本'));
  }
});
