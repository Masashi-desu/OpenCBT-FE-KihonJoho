import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2011AutumnPm01To04Definitions as definitions } from '../src/core/generators/legacy-2011-autumn-pm-01-04';
import { legacy2011AutumnPm0104Figures as figures } from '../src/core/generators/legacy-2011-autumn-pm-01-04-figures';
import { legacy2011AutumnPm0104FigureRenderers as renderers } from '../src/ui/Legacy2011AutumnPm0104Figures';
import { autumn2011Pm01To04Specs as specs } from '../scripts/legacy-2011-autumn-pm-01-04-specs';
import reviewed from './fixtures/legacy-2011-autumn-pm-01-04-review.json';

const marks = 'アイウエオカキクケコ';
const conditions = (number: number) => [0, 1, 2, 3].map(value => definitions[number - 1].build([value]));
const prose = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const codeBlocks = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'code' ? [block.text] : []);
function field(body: GeneratedBody, i: number) {
  const part = body.answerParts![i], answer = body.partAnswers![i];
  assert(answer.kind === 'choice');
  assert.equal(answer.partId, part.id);
  const options = part.choiceIds.map(id => {
    const [, n] = /^choice-value-(\d+)$/.exec(id) ?? [];
    const blocks = body.choices[Number(n) - 1];
    assert(blocks?.length === 1 && (blocks[0].type === 'paragraph' || blocks[0].type === 'code'));
    return blocks[0].text;
  });
  const correct = part.choiceIds.indexOf(answer.choiceId);
  assert(correct >= 0 && correct < options.length);
  assert.equal(new Set(options).size, options.length);
  return { label: part.label, options, correct };
}
function matches(body: GeneratedBody, slot: number, condition: (candidate: string, index: number) => boolean) {
  const { options, correct } = field(body, slot);
  const verdicts = options.flatMap((value, i) => condition(value, i) ? [i] : []);
  assert.deepEqual(verdicts, [correct], '欄' + slot + ' ' + JSON.stringify(options));
}
function render(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const figure = figures.find(row => row.profile === profile), renderer = renderers.find(row => row.profile === profile);
  assert(figure && renderer);
  figure.validate(values);
  assert.equal(figure.alt(values), block.alt);
  const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
  assert(markup.includes('data-source-figure="' + profile + '"'));
  assert.match(markup, /tabindex="0"/);
  assert.match(markup, /var\(--image-scale, 1\)/);
  return markup;
}
function diagrams(body: GeneratedBody, text: string) {
  return body.prompt.filter(block => block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile.endsWith(text)).map(render);
}
const monotone = (values: number[]) => values.every((value, i) => i === 0 || values[i - 1] < value);

test('問1〜4の原頁・公式22欄・全16条件の本文、答案形式、実際の正答の違いを確認する', () => {
  assert.equal(definitions.length, 4);
  assert.deepEqual(specs.flatMap(spec => spec.pages), Array.from({ length: 16 }, (_, i) => i + 5));
  assert.deepEqual(reviewed.coverage.held, []);
  let evaluated = 0;
  for (const [i, definition] of definitions.entries()) {
    const row = reviewed.questions[i], spec = specs[i], bodies = conditions(i + 1), baseline = bodies[0];
    assert.equal(definition.source, '2011h23a-fe-pm-' + row.number);
    assert.equal(definition.version, '3.2.0');
    assert.equal(definition.answerVariation, undefined);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(f => [f.minimum, f.maximum]), [[0, 3]]);
    assert.deepEqual(spec.original, baseline);
    assert.deepEqual(spec.pages, row.pages);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), row.pages);
    assert(Object.values(spec.originalPageAlt).every(alt => alt.length > 100));
    if (i === 0) {
      assert.match(spec.originalPageAlt[5], /6問以上マークした場合には，はじめの5問/);
      assert.doesNotMatch(spec.originalPageAlt[8], /終了時刻の両方を含む/);
    }
    assert.equal(definition.sourceAnswer, row.marks.map((value, j) =>
      row.labels[j].replace('設問', '').replace(' ', '') + '=' + value).join('・'));
    assert.deepEqual(baseline.answerParts!.map((_, j) => marks[field(baseline, j).correct]), row.marks);
    const prompts = new Set(), answers = new Set();
    for (const [stage, body] of bodies.entries()) {
      assert.deepEqual(definition.build([stage]), body);
      assert.equal(body.answerParts?.length, row.officialFields);
      assert.equal(body.partAnswers?.length, row.selectionSlots);
      assert(body.explanation.length > 200);
      prompts.add(JSON.stringify(body.prompt.map(block => block.type === 'diagram' ?
        render(block).replace(/<desc\b[^>]*>.*?<\/desc>/gs, '').replace(/aria-description="[^"]*"/g, '') : block)));
      const fields = body.answerParts!.map((_, j) => field(body, j));
      assert.deepEqual(fields.map(x => x.label), row.labels);
      assert.deepEqual(fields.map(x => x.options.length), row.counts);
      answers.add(JSON.stringify(fields.map(x => x.options[x.correct])));
      evaluated += fields.reduce((sum, item) => sum + item.options.length, 0);
    }
    assert.equal(prompts.size, 4);
    assert.equal(answers.size, 4);
    for (const bad of [[], [0, 0], [-1], [4], [1.2], [Number.NaN], Array(1)]) {
      assert.throws(() => definition.build(bad), /PARAMETER_CONSTRAINT/);
    }
    const getter = [0];
    Object.defineProperty(getter, '0', { get() { throw Error('不正なgetterを実行'); } });
    assert.throws(() => definition.build(getter), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(evaluated, 536);
});

test('問1は実図の11点と量子化の半開区間、FSRと標本列の容量を全択で検算する', () => {
  for (const [stage, body] of conditions(1).entries()) {
    const text = prose(body), wave = diagrams(body, 'sampling-quantization');
    assert.match(text, /nビットで量子化するために，FSRを\(2ⁿ−1\)等分/);
    assert.match(text, /N×q−q／2≦v\(tm\)＜N×q＋q／2/);
    assert.match(text, /開始時刻t0と終了時刻の両方を含む/);
    assert.equal(wave.length, 2);
    const [left, right] = wave[1].split('data-wave-panel="quantized"');
    const samples = (markup: string) => [...markup.matchAll(/data-sample="(\d+)" data-tenths="(\d+)"><path[^>]+><\/path><text[^>]+>t\d+<\/text><path d="M([\d.]+) ([\d.]+)l8 8m-8 0 8-8"/g)]
      .map(match => match.slice(1).map(Number));
    const positions = samples(right);
    assert.deepEqual(samples(wave[0]), positions);
    assert.deepEqual(samples(left), positions);
    assert.equal(positions.length, 11);
    assert.deepEqual([...right.matchAll(/data-voltage-level="(\d+)"/g)].map(x => Number(x[1])), [0,1,2,3,4,5,6,7]);
    assert.match(right, /data-axis-break="true"/);
    for (const [i, value, x, y] of positions) {
      assert.equal(x + 4, 55 + 29 * i);
      assert(Math.abs((270 - (y + 4)) / 29 * 10 - value) < 1e-8);
    }
    const levels = positions.map(([, measured]) => {
      const eligible = Array.from({ length: 8 }, (_, i) => i).filter(i => 10 * i - 5 <= measured && measured < 10 * i + 5);
      assert.equal(eligible.length, 1);
      return eligible[0];
    });
    assert.deepEqual([...right.matchAll(/data-quantized-level="(\d+)"[^>]*cy="(\d+)"/g)].map(match => {
      const level = Number(match[1]);
      assert.equal(Number(match[2]), 270 - 29 * level);
      return level;
    }), levels);
    assert.equal(levels[3], 2);
    assert.deepEqual([...diagrams(body, 'sample-codes')[0].matchAll(/data-code-time="(\d+)"[^>]*>([^<]*)<\/td>/g)]
      .map(match => match[2]), [...levels.slice(0,4).map(v => v.toString(2).padStart(3,'0')), '', '', '［a］', '', '', '', '［b］']);
    for (const [slot, sample] of [6, 10].entries()) matches(body, slot, value => /^[01]{3}$/.test(value) && parseInt(value, 2) === levels[sample]);
    const measured = /範囲が0〜(\d+)V.*FSRを(\d+)V.*4ビット.*電圧(\d+\.\d+)…V/.exec(text);
    assert(measured);
    const [fsr, declared, analog] = measured.slice(1).map(Number);
    assert.equal(fsr, declared);
    const accepted = (voltage: number) => Array.from({ length: 16 }, (_, i) => i)
      .filter(i => fsr * (2 * i - 1) <= 30 * voltage && 30 * voltage < fsr * (2 * i + 1));
    const ordinal = accepted(analog);
    assert.equal(ordinal.length, 1);
    assert.deepEqual(accepted(analog + 0.009999), ordinal);
    assert(monotone(field(body, 2).options.map(Number)));
    matches(body, 2, value => Math.abs(Number(value) * 15 - fsr) < 1e-8);
    matches(body, 3, value => Math.abs(Number(value) * 15 - fsr * ordinal[0]) < 1e-8);
    matches(body, 4, value => /^[01]{4}$/.test(value) && parseInt(value, 2) === ordinal[0]);
    const capacity = /FSRが([\d,]+)ミリV.*?(\d+)ミリ秒間隔で(\d+)秒間.*?総データ量を([\d,]+)ビット/.exec(text);
    assert(capacity);
    const [range, interval, seconds, limit] = capacity.slice(1).map(x => Number(x.replaceAll(',', '')));
    const timestamps = [];
    for (let elapsed = 0; elapsed <= seconds * 1000; elapsed += interval) timestamps.push(elapsed);
    assert.equal(timestamps.at(-1), seconds * 1000);
    const allowed = Array.from({ length: 16 }, (_, i) => i + 1).filter(bits => timestamps.length * bits <= limit);
    assert(allowed.length > 0 && allowed.length < 16);
    const bits = allowed.at(-1)!;
    assert(timestamps.length * (bits + 1) > limit);
    assert(monotone(field(body, 5).options.map(Number)));
    matches(body, 5, value => Number(value) * (2 ** bits - 1) === range);
    assert(body.explanation.includes(timestamps.length + '標本') && body.explanation.includes(bits + 'ビット'));
    if (stage === 0) assert.deepEqual([timestamps.length, bits, range], [101, 9, 1022]);
  }
});

test('問2は4択すべてを正規化の参照条件・SQLiteの集計と投影・受注日の境界で照合する', () => {
  for (const body of conditions(2)) {
    const structure = diagrams(body, 'organization-tree');
    assert.equal(structure.length, 2);
    assert.equal([...structure[0].matchAll(/data-department=/g)].length, 3);
    assert.equal([...structure[0].matchAll(/data-section=/g)].length, 0);
    assert.equal([...structure[1].matchAll(/data-section=/g)].length, 6);
    const relations = diagrams(body, 'relation-tables');
    assert.deepEqual(relations.map(markup => (markup.match(/<u>/g) ?? []).length), [2, 2, 3, 1]);
    assert.match(relations[1], /部署コード.*部署名.*従業員番号.*部署コード/s);
    assert.match(relations[2], /部コード.*部名.*課コード.*課名.*部コード.*従業員番号.*課コード/s);
    assert.match(prose(body), /部名と課名の組合せに対して一意の部署コード.*B案では，部名と課名のそれぞれ/s);
    assert.match(prose(body), /複数行を修正.*LIKE述語を使用したデータ依存の検索/s);
    matches(body, 0, candidate => ({
      課名: 1, 氏名: 0, 表名: 0, 部名: 2,
    })[candidate] === 2);
    matches(body, 1, candidate => ({ 関係喪失: false, 検索性能: false, 事前登録: false, 重複更新: true })[candidate] === true);
    matches(body, 2, candidate => ({
      'ある課に属する従業員の氏名の一覧': false, 'ある部に属する従業員の氏名の一覧': true,
      '従業員の氏名の一覧': false, '部署名の一覧': false,
    })[candidate] === true);

    const sql = codeBlocks(body).filter(code => code.includes('［空欄］'));
    assert.equal(sql.length, 3);
    const operation = /, (AVG|MIN|MAX)\(従業員表\.年齢\)/.exec(sql[0])?.[1];
    const target = /従業員公開表\.課コード = '([A-Z]\d{3})'/.exec(sql[2])?.[1];
    const dates = /が，(\d+)年(\d+)月(\d+)日から(\d+)年(\d+)月(\d+)日の期間中/.exec(prose(body));
    assert(operation && target && dates);
    const date = ([year, month, day]: string[]) => year + month.padStart(2, '0') + day.padStart(2, '0');
    const begin = date(dates.slice(1, 4)), end = date(dates.slice(4));
    const employees = [
      { id: 1, section: target, age: 31 }, { id: 2, section: target, age: 35 },
      { id: 3, section: 'OTHER', age: 29 }, { id: 4, section: 'OTHER', age: 33 },
    ];
    const sections = [{ id: target, name: '例示課' }, { id: 'OTHER', name: '例示課' }];
    const neighbor = (value: string, offset: number) => new Date(Date.UTC(
      Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6)) + offset,
    )).toISOString().slice(0, 10).replaceAll('-', '');
    const orders = [
      { person: 1, at: neighbor(begin, -1), total: 10 },
      { person: 1, at: begin, total: 110 },
      { person: 2, at: end, total: 220 },
      { person: 2, at: neighbor(end, 1), total: 20 },
      { person: 3, at: begin, total: 40 },
    ];
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 課表 (課コード TEXT PRIMARY KEY, 課名 TEXT, 部コード TEXT);' +
        'CREATE TABLE 従業員表 (従業員番号 INTEGER PRIMARY KEY, 氏名 TEXT, 課コード TEXT, 内線 TEXT, 入社年月日 TEXT, 住所 TEXT, 自宅電話 TEXT, 年齢 INTEGER);' +
        'CREATE TABLE 受注表 (伝票番号 INTEGER PRIMARY KEY, 受注日 TEXT, 従業員番号 INTEGER, 顧客コード TEXT, 受注額 INTEGER, 納品日 TEXT);');
      for (const item of sections) db.prepare('INSERT INTO 課表 VALUES (?, ?, ?)').run(item.id, item.name, 'ONE');
      for (const item of employees) db.prepare('INSERT INTO 従業員表 VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        item.id, '仮名' + item.id, item.section, '211', '20020401', '社外非公開例', '電話非公開例', item.age);
      for (const [i, item] of orders.entries()) db.prepare('INSERT INTO 受注表 VALUES (?, ?, ?, ?, ?, ?)').run(i + 1, item.at, item.person, 'CUSTOMER', item.total, null);
      const statistic = (ages: number[]) => operation === 'MIN' ? Math.min(...ages) : operation === 'MAX' ? Math.max(...ages) :
        ages.reduce((sum, age) => sum + age, 0) / ages.length;
      const expected = sections.map(section => [
        section.id, section.name, statistic(employees.filter(item => item.section === section.id).map(item => item.age)),
      ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
      const substitute = (statement: string, candidate: string) => statement.replace('［空欄］', candidate)
        .replace(/= ANY\s*\(/, 'IN (');
      matches(body, 3, choice => {
        try {
          const actual = db.prepare(substitute(sql[0], choice)).all().map(row => Object.values(row))
            .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
          return JSON.stringify(actual) === JSON.stringify(expected);
        } catch { return false; }
      });
      const publicColumns = ['従業員番号', '氏名', '課コード', '内線'];
      matches(body, 4, choice => {
        try {
          db.exec(substitute(sql[1], choice));
          const names = db.prepare('PRAGMA table_info(従業員公開表)').all().map(row => row.name);
          const rows = db.prepare('SELECT * FROM 従業員公開表').all();
          return JSON.stringify(names) === JSON.stringify(publicColumns) && rows.length === employees.length;
        } catch { return false; }
        finally { db.exec('DROP VIEW IF EXISTS 従業員公開表'); }
      });
      db.exec('CREATE VIEW 従業員公開表 AS SELECT 従業員番号, 氏名, 課コード, 内線 FROM 従業員表');
      const desired = orders.filter(item => begin <= item.at && item.at <= end && employees.some(emp => emp.id === item.person && emp.section === target))
        .reduce((sum, item) => sum + item.total, 0);
      assert.equal(desired, 330);
      matches(body, 5, choice => {
        const result = db.prepare(substitute(sql[2], choice)).get()!;
        return Object.values(result)[0] === desired;
      });
      assert(body.explanation.includes(target) && body.explanation.includes('両端'));
    } finally { db.close(); }
  }
});

test('問3は実図のアドレスを2進の網部で分け、利用可能ホスト・配置・応答閾値を検算する', () => {
  const binary = (text: string) => text.split('.').map(item => Number(item).toString(2).padStart(8, '0')).join('');
  for (const body of conditions(3)) {
    const text = prose(body), [network] = diagrams(body, 'network-topology'), [ips] = diagrams(body, 'ip-addresses');
    const ports = [...network.matchAll(/data-network-port="\d+" data-ip="([^"]+)"/g)].map(match => match[1]);
    const candidates = [...ips.matchAll(/data-ip-candidate="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ports).size, 5);
    assert.equal(new Set(candidates).size, 10);
    assert.match(text, /各ルータ.*IPアドレス.*同じサブネットマスク.*互いに重複しない/s);
    const validLengths = field(body, 0).options.map(candidate => binary(candidate).replace(/0+$/, '').length);
    const suitable = (length: number) => {
      const [coreA, coreB, a, b, web] = ports.map(value => binary(value).slice(0, length));
      return coreA === coreB && a === web && new Set([coreA, a, b]).size === 3;
    };
    matches(body, 0, (_, i) => suitable(validLengths[i]));
    const prefixLength = validLengths.find(suitable)!;
    const range = binary(ports[2]).slice(0, prefixLength);
    const viable = candidates.filter(value => {
      const digits = binary(value);
      return digits.startsWith(range) && !ports.includes(value) &&
        new Set(digits.slice(prefixLength)).size === 2;
    });
    matches(body, 1, choice => Number(choice) === viable.length);
    assert.match(text, /業務用PCを接続.*ブロードキャストする.*メッセージを中継する装置は設置しない/s);
    assert.match(text, /インターネットと基幹ネットワーク間の直接の通信は遮断したまま/);
    assert.match(network, /社外.*社内.*ファイアウォール.*基幹ネットワーク.*DMZ.*業務用PC/s);
    const topology = new Map([
      ['DMZ', { broadcastFromPc: false, proxyReachesBoth: true }],
      ['基幹ネットワーク', { broadcastFromPc: false, proxyReachesBoth: false }],
      ['ネットワークA', { broadcastFromPc: false, proxyReachesBoth: false }],
      ['ネットワークB', { broadcastFromPc: true, proxyReachesBoth: false }],
    ]);
    matches(body, 2, choice => topology.get(choice)?.broadcastFromPc === true);
    matches(body, 3, choice => topology.get(choice)?.proxyReachesBoth === true);
    const times = /時間を(\d+)としたとき.*ヒットしたときで(\d+)，ヒットしなかったときで(\d+)/.exec(text);
    assert(times && /最小のヒット率/.test(text));
    const [, standard, hit, miss] = times.map(Number);
    const passes = (count: number) => {
      const durations = Array.from({ length: 100 }, (_, i) => i < count ? hit : miss);
      return 2 * durations.reduce((sum, value) => sum + value, 0) <= standard * durations.length;
    };
    const threshold = Array.from({ length: 101 }, (_, n) => n).find(passes)!;
    assert(passes(threshold) && !passes(threshold - 1));
    matches(body, 4, value => Number(value) === threshold);
    assert(body.explanation.includes(threshold + '％'));
  }
});

test('問4は聴取条件・表示した評価表からリスクを再計算し、最小の評価値と破線の3行を確認する', () => {
  const dimension = (sentence: string) => /必要最小限/.test(sentence) ? 4 :
    /部門内だけ|他部門には開示できない/.test(sentence) ? 3 : /社外には公開できない|同業他社に知られてはならない/.test(sentence) ? 2 : 1;
  const influence = (sentence: string) => /影響は大きい/.test(sentence) ? 3 : /影響は小さい/.test(sentence) ? 2 : /影響はない/.test(sentence) ? 1 : NaN;
  for (const body of conditions(4)) {
    const text = prose(body);
    assert.match(text, /該当する基準の値のうちで最も小さいもの/);
    assert.match(text, /年間\S+以上停止することは許されない/);
    assert.match(text, /これらの値以下であれば，そのリスクを保有/);
    const lines = text.split('\n');
    const [generalC, tradingC] = lines.filter(line => line.startsWith('①'));
    const [generalI, tradingI] = lines.filter(line => line.startsWith('②'));
    const [generalAccess, tradingAccess] = lines.filter(line => line.startsWith('③'));
    assert.match(generalAccess, /代替手段での入手/);
    assert.match(tradingAccess, /バッチ処理/);
    const [threats, limits, excerpt] = diagrams(body, 'risk-tables');
    const factors = new Map([...threats.matchAll(/data-threat="([^"]+)"><th[^>]+>[^<]+<\/th><td>(\d+)<\/td><td>([^<]+)<\/td><td>(\d+)<\/td>/g)]
      .map(match => [match[1], { chance: Number(match[2]), type: match[3], weakness: Number(match[4]) }]));
    assert.equal(factors.size, 5);
    const risks = (category: string, score: number) => {
      const factor = factors.get(category);
      assert(factor && Number.isInteger(score));
      return Array.from({ length: factor.chance }, () => Array(factor.weakness).fill(score)).flat().reduce((sum, amount) => sum + amount, 0);
    };
    const calculated = [risks('なりすまし', dimension(generalC)), risks('不正アクセス', dimension(tradingC)), risks('ウイルス感染', influence(tradingI))];
    for (const [slot, result] of calculated.entries()) {
      assert(monotone(field(body, slot).options.map(Number)));
      matches(body, slot, value => Number(value) === result);
    }
    const available = body.prompt.find(block => block.type === 'table' && block.caption.startsWith('表3'));
    assert(available?.type === 'table');
    const minutes = (sentence: string) => {
      const result = /年間(\d+)(時間|分)/.exec(sentence);
      assert(result);
      return Number(result[1]) * (result[2] === '時間' ? 60 : 1);
    };
    const allowed = available.rows.filter(row => minutes(row[0]) < minutes(tradingAccess)).map(row => Number(row[1]));
    assert(allowed.length > 0);
    matches(body, 3, value => Number(value) === Math.min(...allowed));
    const limit = Number(/data-risk-limit="完全性"><th[^>]+>完全性<\/th><td>(\d+)<\/td>/.exec(limits)?.[1]);
    assert(Number.isInteger(limit));
    const categories = ['ウイルス感染','不正アクセス','なりすまし'];
    const risksX = categories.map(category => risks(category, influence(generalI)));
    assert.deepEqual([...excerpt.matchAll(/data-outlined-risk="(?:first|middle|last)"[^>]*>(\d+)<\/td>/g)].map(match => Number(match[1])), risksX);
    const excess = categories.filter((_, i) => risksX[i] > limit);
    assert.equal(excess.length, 1);
    const vulnerability = factors.get(excess[0])?.type;
    matches(body, 4, choice => new Map([
      ['IDS（侵入検知システム）を導入する。', '不正挙動の検知'],
      ['ウイルス対策ソフトを導入する。', 'ウイルス対策ソフト未導入'],
      ['公開鍵暗号を利用する。', '最新推奨暗号の未使用'],
      ['定期メンテナンスの回数を増やす。', 'メンテナンス不足'],
      ['パスワード管理を強化する。', 'パスワード管理の不備'],
    ]).get(choice) === vulnerability);
    assert(body.explanation.includes(limit + 'を超えるのは' + excess[0]));
  }
});

test('管理図7種類の56入力、補助ラベル、入力域と不正値拒否を確認する', () => {
  assert.equal(figures.length, 7);
  assert.deepEqual(figures.map(row => row.profile).sort(), renderers.map(row => row.profile).sort());
  let states = 0;
  for (const figure of figures) {
    const renderer = renderers.find(row => row.profile === figure.profile)!;
    const values = figure.domain.reduce<number[][]>((rows, [min, max]) =>
      rows.flatMap(row => Array.from({ length: max - min + 1 }, (_, i) => [...row, min + i])), [[]]);
    for (const tuple of values) {
      figure.validate(tuple);
      assert(figure.alt(tuple).trim().length > 10);
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: '図表の検証', values: tuple }));
      assert(markup.includes('data-source-figure="' + figure.profile + '"'));
      assert.match(markup, /tabindex="0"/);
      assert.match(markup, /aria-describedby="[^"]+"|aria-description="[^"]+"/);
      states++;
    }
    for (const bad of [[], [-1, 0].slice(0, figure.domain.length), values[0].concat(0), Array(figure.domain.length)])
      assert.throws(() => figure.validate(bad), /FIGURE_PROFILE/);
    const getter = values[0].slice();
    Object.defineProperty(getter, '0', { get() { throw Error('不正な図入力のgetterを実行'); } });
    assert.throws(() => figure.validate(getter), /FIGURE_PROFILE/);
  }
  assert.equal(states, 56);
});
