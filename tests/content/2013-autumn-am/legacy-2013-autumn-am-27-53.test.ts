import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2013AutumnAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2013-autumn-am-27-53';
import { legacy2013AutumnAm27To53Source as source } from '../../../src/core/generators/legacy-2013-autumn-am-27-53-source';
import { legacy2013AutumnAm2753Figures as figures } from '../../../src/core/generators/legacy-2013-autumn-am-27-53-figures';
import { legacy2013AutumnAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2013AutumnAm2753Figures';
import { autumn2013KnowledgeFacts as facts } from '../../fixtures/legacy-2013-autumn-am-27-53-facts';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Block } from '../../../src/core/types';

const nums = Array.from({ length: 27 }, (_, i) => i + 27);
const official = 'アエエアイイエウアイウウイエイイウウウイウエアイウエア';
const pages = [13,14,14,14,15,16,16,17,17,17,17,18,18,18,19,19,19,20,21,22,22,23,23,23,24,24,25];
const definition = (number: number) => definitions.find(d => d.source === '2013h25a-fe-am-' + number)!;
const variants = (n: number) => Array.from({ length: definition(n).fields[0].maximum + 1 }, (_, i) => definition(n).build([i]));
type Table = Extract<Block, { type: 'table' }>;
type Diagram = Extract<Block, { type: 'diagram' }>;
const text = (block: Block) => {
  assert.ok('text' in block);
  return block.text;
};
const paragraphs = (body: GeneratedBody) => body.prompt.filter(b => b.type === 'paragraph').map(text).join('\n');
const options = (body: GeneratedBody) => body.choices.map(choice => text(choice[0]));
const asTable = (block: Block): Table => {
  assert.equal(block.type, 'table');
  return block as Table;
};
const asDiagram = (block: Block): Diagram => {
  assert.equal(block.type, 'diagram');
  return block as Diagram;
};
function compareAnswer(body: GeneratedBody, possible: readonly boolean[]) {
  assert.equal(possible.length, 4);
  const correct = possible.flatMap((valid, i) => valid ? [i] : []);
  assert.equal(correct.length, 1);
  assert.equal(body.correctIndex, correct[0]);
}
function classify(value: string, rules: Readonly<Record<string, RegExp>>) {
  const labels = Object.entries(rules).filter(([, rule]) => rule.test(value)).map(([label]) => label);
  assert.equal(labels.length, 1, value + ' → ' + labels.join(','));
  return labels[0];
}

test('問27〜53：27系列、冊子p.13〜25、基準四択と公式解答及び全候補の有効性', () => {
  assert.deepEqual(definitions.map(d => Number(d.source.split('-').at(-1))), nums);
  for (const [index, number] of nums.entries()) {
    const def = definition(number);
    const original = def.build([0]);
    assert.deepEqual(def.reference, [0]);
    assert.equal(def.sourceAnswer, official[index]);
    assert.equal('アイウエ'[original.correctIndex!], official[index]);
    assert.equal(text(original.prompt[0]), source[number].prompt);
    if (![31,45,46].includes(number)) assert.deepEqual(options(original), source[number].choices);
    assert.equal(source[number].page, pages[index]);
    assert.equal(source[number].choices.length, 4);
    const outcomes = variants(number);
    const distinctAnswers = new Set(outcomes.map(body => JSON.stringify(body.choices[body.correctIndex!])));
    assert.ok(distinctAnswers.size > 1, String(number));
    const stems = new Set(outcomes.map(body => JSON.stringify(body.prompt)));
    assert.equal(stems.size, outcomes.length, String(number));
    assert.ok(stems.size >= 3);
    for (const [input, body] of outcomes.entries()) {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(c => JSON.stringify(c))).size, 4);
      assert.ok(body.explanation.length > 40);
      assert.deepEqual(body, def.build([input]));
    }
    for (const invalid of [-1, 0.5, Number.NaN, outcomes.length])
      assert.throws(() => def.build([invalid]), { code: 'PARAMETER_CONSTRAINT' });
    assert.throws(() => def.build([]), { code: 'PARAMETER_CONSTRAINT' });
    assert.throws(() => def.build([0, 0]), { code: 'PARAMETER_CONSTRAINT' });
  }
});

for (const [number, fact] of Object.entries(facts)) {
  test('問' + number + '：独立知識資料で各条件の本文と全四択を検査', () => {
    assert.ok(fact.basis.length > 20);
    for (const body of variants(Number(number))) {
      const target = classify(paragraphs(body), fact.asks);
      const meanings = options(body).map(choice => classify(choice, fact.choices));
      assert.equal(new Set(meanings).size, 4);
      compareAnswer(body, meanings.map(meaning => meaning === target));
    }
  });
}

test('問31：紙面の表と同じ行列を保ち、SQLiteで全変更を実行してからROLLBACK', () => {
  const original = variants(31)[0];
  const originalRows = [
    [['A010','AAA','2,500'], ['B020','NULL','1,000'], ['C030','CCC','4,500']],
    [['A010','AAA','2,500'], ['B020','BBB','1,000'], ['C030','CCC','4,500']],
    [['A010','AAA','2,500'], ['C030','CCC','4,500']],
    [['B020','BBB','1,000']],
  ];
  assert.deepEqual(original.choices.map(([b]) => asTable(b).rows), originalRows);
  const cols = ['商品コード', '商品名', '販売単価'];
  for (const body of variants(31)) {
    const shown = asTable(body.prompt[1]);
    assert.deepEqual(shown.columns, cols);
    const sql = body.prompt[3];
    assert.equal(sql.type, 'code');
    const statement = text(sql);
    assert.match(statement, /^(?:DELETE FROM 商品|UPDATE 商品 SET 販売単価 = \d+) WHERE 商品コード = '[A-Z]\d{3}'$/);
    const rowsOf = (connection: DatabaseSync) => connection.prepare('SELECT 商品コード, 商品名, 販売単価 FROM 商品 ORDER BY 商品コード')
      .all().map(row => [String(row.商品コード), String(row.商品名), Number(row.販売単価).toLocaleString('en-US')]);
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 商品 (商品コード TEXT PRIMARY KEY, 商品名 TEXT, 販売単価 INTEGER)');
      const insert = db.prepare('INSERT INTO 商品 VALUES (?, ?, ?)');
      for (const [id, name, price] of shown.rows) insert.run(id, name, Number(price.replaceAll(',', '')));
      const before = rowsOf(db);
      db.exec('BEGIN');
      db.exec(statement);
      const during = rowsOf(db);
      db.exec('ROLLBACK');
      const after = rowsOf(db);
      assert.deepEqual(before, shown.rows);
      assert.notDeepEqual(during, before);
      assert.deepEqual(after, before);
      const candidates = body.choices.map(([b]) => asTable(b));
      assert.ok(candidates.every(table => table.caption && table.captionPresentation === 'accessible'));
      assert.ok(candidates.every(table => JSON.stringify(table.columns) === JSON.stringify(cols)));
      assert.equal(candidates.filter(({ rows }) => JSON.stringify(rows) === JSON.stringify(during)).length, 1);
      compareAnswer(body, candidates.map(({ rows }) => JSON.stringify(rows) === JSON.stringify(after)));
      assert.match(body.explanation, /ロールバック.*他のトランザクションは更新しない/);
      assert.ok(body.explanation.includes(/'([^']+)'$/.exec(statement)![1]));
    } finally {
      db.close();
    }
  }
});

test('問32：独立した共有・専有互換表を使い、各候補の先行取得と資源待ちを照合', () => {
  const compatibility: Record<string, string[]> = { S: ['S','−'], X: ['−'], '−': ['S','X','−'] };
  const results = new Set<number>();
  for (const body of variants(32)) {
    const table = asTable(body.prompt[1]);
    assert.deepEqual(table.columns, ['トランザクション＼資源', 'A', 'B', 'C']);
    assert.deepEqual(table.rows.map(row => row[0]), ['1','2','3']);
    const locksets = new Map(table.rows.map(([name, ...locks]) => [name, locks]));
    const possible = options(body).map(candidate => {
      const match = /^トランザクション(\d)の後にトランザクション(\d)を開始したとき，トランザクション(\d)の資源待ちはない。$/.exec(candidate);
      assert.ok(match);
      assert.equal(match[2], match[3]);
      return locksets.get(match[1])!.every((held, index) => compatibility[held].includes(locksets.get(match[2])![index]));
    });
    compareAnswer(body, possible);
    assert.match(body.explanation, /SとSは同時に掛けられる/);
    assert.match(paragraphs(body), /開始と同時に.*“−”はロックなし.*“S”は共有.*“X”は専有/);
    results.add(body.correctIndex!);
  }
  assert.deepEqual([...results].sort(), [1, 2]);
});

test('問33：時間候補を実効速度で逆算し、必要バイト数に最も近い値を独立に選ぶ', () => {
  for (const body of variants(33)) {
    const match = /(\d+)kビット／秒.*?(?:(\d+)×)?10⁶バイト.*?(\d+)％/.exec(paragraphs(body));
    assert.ok(match);
    const [rate, capacity, ratePct] = [Number(match[1]), Number(match[2] ?? '1') * 1_000_000, Number(match[3])];
    const values = options(body).map(Number);
    assert.deepEqual(values, [...values].sort((a, b) => a - b));
    const idealSeconds = capacity / (rate * 125);
    assert.ok(Math.abs(values[0] - idealSeconds / (ratePct / 100) / 8) <= 0.1);
    assert.equal(values[1], idealSeconds * ratePct / 100);
    assert.equal(values[2], idealSeconds);
    const byteDistances = values.map(seconds => Math.abs(capacity - seconds * rate * 125 * ratePct / 100));
    compareAnswer(body, byteDistances.map(distance => distance === Math.min(...byteDistances)));
    assert.ok(byteDistances[body.correctIndex!] / capacity < 0.002);
    assert.match(body.explanation, new RegExp('およそ' + values[body.correctIndex!] + '秒'));
  }
});

test('問37：フレーム、IP、TCPのカプセル化から全順列を評価', () => {
  for (const body of variants(37)) {
    const possible = options(body).map(choice => {
      const fields = choice.split('，').map(field =>
        classify(field, { ethernet: /MACアドレス$/, ip: /(?:IPアドレス|プロトコル番号)$/, transport: /ポート番号$/ }));
      assert.equal(new Set(fields).size, 3);
      return fields.join('/') === 'ethernet/ip/transport';
    });
    compareAnswer(body, possible);
    if (paragraphs(body).includes('送信元情報')) assert.ok(options(body).every(option => !option.includes('宛先')));
    if (paragraphs(body).includes('プロトコル番号')) assert.ok(options(body).every(option => option.includes('プロトコル番号')));
  }
});

test('問38：衝突耐性、原像耐性、一定出力長を区別し全記述の真偽を判定', () => {
  for (const body of variants(38)) {
    const choices = options(body);
    assert.match(choices[0], /同じメッセージダイジェスト.*二つの異なるメッセージ/);
    assert.match(choices[1], /メッセージが異なっていても.*全て同じ/);
    assert.match(choices[2], /メッセージダイジェスト.*メッセージを.*復元/);
    assert.match(choices[3], /長さ.*長さ/);
    const truths = choices.map((candidate, i) => {
      if (i === 1) return false;
      if (i === 3) return /よらず一定/.test(candidate);
      return /困難/.test(candidate) && !/容易/.test(candidate);
    });
    compareAnswer(body, truths);
  }
});

test('問44：操作から必要最小の権限の集合を計算する', () => {
  const accessRights: Record<string, number> = { 管理者権限: 7, 更新権限: 2, 参照権限: 1, 参照権限と更新権限: 3 };
  for (const body of variants(44)) {
    const request = classify(text(body.prompt[0]), { read: /^.*検索して表示するアプリ/, write: /検索や表示は行わない/, both: /検索して表示し.*レコードの利用者情報を変更/ });
    const requirement = request === 'read' ? 1 : request === 'write' ? 2 : 3;
    const eligible = options(body).map(choice => accessRights[choice]);
    compareAnswer(body, eligible.map(right => right === requirement));
    assert.match(paragraphs(body), /〔権限の範囲〕.*参照権限.*レコードの参照.*更新権限.*レコードの登録.*管理者権限.*テーブル/s);
  }
});

test('問45：要求と応答の境界ポートのパケットが四表の各ルールに一致するか判定', () => {
  const columns = ['送信元', '宛先', '送信元ポート番号', '宛先ポート番号'];
  const matchPort = (pattern: string, value: number) => /以上$/.test(pattern)
    ? value >= Number(pattern.replace('以上','')) : value === Number(pattern);
  const originalPairs = [
    [['PC','Webサーバ','80','1024以上'], ['Webサーバ','PC','80','1024以上']],
    [['PC','Webサーバ','80','1024以上'], ['Webサーバ','PC','1024以上','80']],
    [['PC','Webサーバ','1024以上','80'], ['Webサーバ','PC','80','1024以上']],
    [['PC','Webサーバ','1024以上','80'], ['Webサーバ','PC','1024以上','80']],
  ];
  assert.deepEqual(variants(45)[0].choices.map(([b]) => asTable(b).rows), originalPairs);
  for (const body of variants(45)) {
    const port = Number(/(\d+)番ポート/.exec(paragraphs(body))![1]);
    const minimum = Number(/(\d+)以上の送信元ポート/.exec(paragraphs(body))?.[1] ?? '1024');
    const possible = body.choices.map(([block]) => {
      const table = asTable(block);
      assert.equal(table.captionPresentation, 'accessible');
      assert.deepEqual(table.columns, columns);
      assert.deepEqual(table.rows.map(row => row.slice(0, 2)), [['PC','Webサーバ'],['Webサーバ','PC']]);
      return [minimum, minimum + 1, 65535].every(client =>
        table.rows.some(([from, to, source, dest]) => from === 'PC' && to === 'Webサーバ' && matchPort(source, client) && matchPort(dest, port))
        && table.rows.some(([from, to, source, dest]) => from === 'Webサーバ' && to === 'PC' && matchPort(source, port) && matchPort(dest, client)));
    });
    compareAnswer(body, possible);
    assert.match(body.explanation, new RegExp(port + '番ポート.*' + minimum + '以上'));
  }
});

test('問46：描画の接続端・線種・方向・多重度から四つのクラス関係を独立に分類', () => {
  const shapes = renderers.find(r => r.profile.endsWith('class-relations'))!;
  const Render = shapes.component;
  for (const body of variants(46)) {
    const relation = classify(paragraphs(body), {
      generalization: /汎化の関係/, composition: /コンポジションの関係/, dependency: /依存の関係/, association: /ではない単純な関連/,
    });
    const options = body.choices.map(([block]) => {
      const diagram = asDiagram(block);
      assert.equal(diagram.scene.kind, 'source_figure');
      if (diagram.scene.kind !== 'source_figure') throw new Error('scene');
      const markup = renderToStaticMarkup(createElement(Render, { values: diagram.scene.values, caption: diagram.caption }));
      assert.match(markup, /aria-describedby=.*<desc/s);
      assert.match(markup, /data-class-name="自動車"/);
      const boxes = markup.match(/data-class-name=/g)!.length;
      if (/data-generalization-triangle/.test(markup)) {
        assert.match(markup, /M161 146V102.*M161 83l-10 19h20Z/s);
        assert.match(markup, /スポーツカー/);
        return 'generalization';
      }
      if (/data-composition-diamonds/.test(markup)) {
        assert.equal(boxes, 3);
        assert.match(markup, /タイヤ.*エンジン/s);
        assert.equal(markup.match(/>\*<\/text>/g)!.length, 2);
        return 'composition';
      }
      if (/stroke-dasharray="4 4"/.test(markup)) {
        assert.match(markup, /ドライバ.*M161 146V83.*marker-end/s);
        return 'dependency';
      }
      assert.equal(boxes, 2);
      assert.equal(markup.match(/>1<\/text>/g)!.length, 2);
      assert.match(markup, /車検証/);
      return 'association';
    });
    compareAnswer(body, options.map(option => option === relation));
  }
});

function finishByEnumeration(days: number[], predecessors: number[][], helperFirst: number, helperLast: number) {
  let frontier = [days];
  for (let day = 1; day <= days.reduce((a,b) => a+b,0); day++) {
    const next = new Map<string, number[]>();
    for (const remaining of frontier) {
      const eligible = remaining.flatMap((time, i) => time > 0 && predecessors[i].every(p => !remaining[p]) ? [i] : []);
      const workerSets = eligible.map(i => [i]);
      if (helperFirst <= day && day <= helperLast)
        for (const i of eligible) for (const j of eligible) if (i < j) workerSets.push([i,j]);
      for (const workers of workerSets) {
        const after = remaining.map((time, i) => time - Number(workers.includes(i)));
        if (after.every(t => t === 0)) return day;
        next.set(after.join(','), after);
      }
    }
    frontier = [...next.values()];
  }
  throw new Error('no finish');
}

function finishLowerBound(days: number[], helperFirst: number, helperLast: number) {
  const helperStart = helperFirst - 1;
  const helperEnd = helperLast;
  function earliestPairEnd(start: number, first: number, second: number) {
    const workload = first + second;
    const baseEnd = start + Math.max(first, second);
    const overlap = (time: number) => Math.max(0, Math.min(time, helperEnd) - Math.max(start, helperStart));
    const capacity = (time: number) => time - start + overlap(time);
    if (capacity(baseEnd) >= workload) return baseEnd;
    if (baseEnd < helperStart && capacity(helperStart) >= workload) return baseEnd + workload - capacity(baseEnd);
    const jointStart = Math.max(baseEnd, helperStart);
    if (jointStart < helperEnd && capacity(helperEnd) >= workload) return jointStart + (workload - capacity(jointStart)) / 2;
    const soleStart = Math.max(baseEnd, helperEnd);
    return soleStart + workload - capacity(soleStart);
  }
  const phaseA = earliestPairEnd(0, days[0], days[1]);
  return earliestPairEnd(phaseA + days[2], days[3], days[4]);
}

test('問53：実際に描画したA〜E・先行関係から一日ごとの割当てを総当たりし最大短縮を検証', () => {
  const Renderer = renderers.find(r => r.profile.endsWith('staffing-network'))!.component;
  for (const body of variants(53)) {
    const diagram = asDiagram(body.prompt[1]);
    assert.equal(diagram.scene.kind, 'source_figure');
    if (diagram.scene.kind !== 'source_figure') throw new Error('scene');
    const markup = renderToStaticMarkup(createElement(Renderer, { values: diagram.scene.values, caption: diagram.caption }));
    const arrows = [...markup.matchAll(/data-activity="([A-E])" data-from="(\d)" data-to="(\d)" data-days="(\d)"/g)];
    assert.deepEqual(arrows.map(match => match.slice(1, 4).join('')), ['A01','B02','C23','D34','E35']);
    const dummy = [...markup.matchAll(/stroke-dasharray="4 4" data-activity-dummy="" data-from="(\d)" data-to="(\d)"/g)];
    assert.deepEqual(dummy.map(match => match.slice(1).join('')), ['12','45']);
    assert.equal(markup.match(/data-activity-label=/g)!.length, 5);
    assert.equal(markup.match(/data-activity-days=/g)!.length, 5);
    assert.match(markup, /data-activity-legend="".*data-activity-legend-end=.*>作業<.*>日数<.*>ダミー作業</s);
    const durations = arrows.map(match => Number(match[4]));
    const [first, last, count] = /(?:^|，)(\d+)日目から(\d+)日目までの(\d+)日間/.exec(paragraphs(body))!.slice(1).map(Number);
    assert.equal(last - first + 1, count);
    assert.match(paragraphs(body), /一つの作業を2人で同時には行えない.*他者から引き継ぐ.*引継ぎによる作業日数の増加はない/);
    function prerequisites(event: string): number[] {
      return [
        ...arrows.flatMap((arrow, i) => arrow[3] === event ? [i] : []),
        ...dummy.flatMap(dummyArrow => dummyArrow[2] === event ? prerequisites(dummyArrow[1]) : []),
      ];
    }
    const dependencies = arrows.map(arrow => prerequisites(arrow[2]).sort((a, b) => a - b));
    assert.deepEqual(dependencies, [[], [], [0,1], [2], [2]]);
    const baseline = finishByEnumeration(durations, dependencies, 0, 0);
    const optimum = finishByEnumeration(durations, dependencies, first, last);
    // The full-day schedule attains the continuous capacity lower bound. Allowing
    // fractional-day handover therefore cannot yield a shorter completion time.
    assert.equal(optimum, finishLowerBound(durations, first, last));
    const values = options(body).map(Number);
    assert.deepEqual(values, [3,4,5,6]);
    compareAnswer(body, values.map(option => option === baseline - optimum));
    assert.match(body.explanation, new RegExp(baseline + '日.*' + optimum + '日目.*' + baseline + '−' + optimum + '＝' + (baseline - optimum)));
  }
});

test('問46・53：全管理図の入力域、意味の代替説明、SVGの実テキストと拡大可能な幅', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const figure of figures) {
    const Renderer = renderers.find(r => r.profile === figure.profile)!.component;
    const [low, high] = figure.domain[0];
    assert.throws(() => figure.validate([low - 1]), { code: 'FIGURE_PROFILE' });
    assert.throws(() => figure.validate([high + 1]), { code: 'FIGURE_PROFILE' });
    for (let index = low; index <= high; index++) {
      const values = [index];
      figure.validate(values);
      const markup = renderToStaticMarkup(createElement(Renderer, { values, caption: '図の題' }));
      assert.match(markup, /<desc[^>]+>/);
      assert.match(markup, /max-width:none/);
      assert.match(markup, /var\(--diagram-ink\)/);
      assert.match(markup, /var\(--image-scale/);
      assert.ok(markup.includes(figure.alt(values)));
    }
  }
});
