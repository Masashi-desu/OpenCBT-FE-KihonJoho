import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2013SpringPm01To04Definitions as definitions } from '../src/core/generators/legacy-2013-spring-pm-01-04';
import { legacy2013SpringPm0104Figures as figures, profiles } from '../src/core/generators/legacy-2013-spring-pm-01-04-figures';
import { legacy2013SpringPm0104FigureRenderers as renderers } from '../src/ui/Legacy2013SpringPm0104Figures';
import review from './fixtures/legacy-2013-spring-pm-01-04-review.json';

type Diagram = Extract<Block, { type: 'diagram' }>;
type Figure = Diagram & { scene: Extract<Diagram['scene'], { kind: 'source_figure' }> };

const cases = [0, 1, 2, 3];
const kana = 'アイウエオカキクケコ';

function visible(body: GeneratedBody) {
  return body.prompt.map(block => {
    if (block.type === 'diagram') return block.alt;
    if (block.type === 'table') return [block.caption, ...block.rows.map(row => row.join('｜'))].join('\n');
    return 'text' in block ? block.text : '';
  }).join('\n');
}
function codes(body: GeneratedBody) {
  return body.prompt.filter(block => block.type === 'code').map(block => block.text);
}
function figure(body: GeneratedBody, profile: string): Figure {
  const block = body.prompt.find((candidate): candidate is Figure =>
    candidate.type === 'diagram' && candidate.scene.kind === 'source_figure' && candidate.scene.profile === profile);
  assert(block, profile);
  return block;
}
function options(body: GeneratedBody, part: number) {
  return body.answerParts![part].choiceIds.map(id => {
    const blocks = body.choices[Number(id.split('-').at(-1)) - 1];
    assert.equal(blocks.length, 1);
    const block = blocks[0];
    assert(block.type === 'paragraph' || block.type === 'code');
    return block.text;
  });
}
function selected(body: GeneratedBody, part: number) {
  const field = body.answerParts![part];
  const answer = body.partAnswers![part];
  assert(answer.kind === 'choice');
  assert.equal(answer.partId, field.id);
  return field.choiceIds.indexOf(answer.choiceId);
}
function correct(body: GeneratedBody, part: number, predicate: (option: string, index: number) => boolean) {
  const choices = options(body, part);
  assert.equal(new Set(choices).size, choices.length);
  const matches = choices.flatMap((choice, index) => predicate(choice, index) ? [index] : []);
  assert.deepEqual(matches, [selected(body, part)]);
}
function expectOptions(body: GeneratedBody, part: number, expected: string[]) {
  assert.deepEqual(options(body, part), expected);
}

test('春期旧午後 問1〜4の全解答欄と解答群が公式の順に対応し、全条件で原形式を保つ', () => {
  for (const [q, definition] of definitions.entries()) {
    const record = review.questions[q];
    assert.equal(definition.source, '2013h25h-fe-pm-' + record.number);
    assert.deepEqual(definition.reference, [0]);
    const promptShape = (body: GeneratedBody) => body.prompt.map(block =>
      block.type === 'diagram' && block.scene.kind === 'source_figure' ? block.scene.profile : block.type);
    const referenceShape = promptShape(definition.build([...definition.reference]));
    const texts = cases.map(index => {
      const body = definition.build([index]);
      assert.deepEqual(promptShape(body), referenceShape, `問${record.number}の本文構成（入力${index}）`);
      assert.deepEqual(body.answerParts!.map(part => part.label), record.labels);
      assert.deepEqual(body.answerParts!.map(part => part.choiceIds.length), record.counts);
      assert.equal(body.partAnswers!.length, record.counts.length);
      assert(body.explanation.length > 100);
      for (const [part, field] of body.answerParts!.entries()) {
        assert(selected(body, part) >= 0);
        assert.equal(new Set(field.choiceIds).size, field.choiceIds.length);
        if (!index) assert.equal(kana[selected(body, part)], record.marks[part]);
      }
      return visible(body);
    });
    assert.equal(new Set(texts).size, cases.length);
    for (const input of [[], [4], [-1], [0.5], [0, 1], [NaN], new Array<number>(1)])
      assert.throws(() => definition.build(input), /PARAMETER_CONSTRAINT/);
  }
});

test('問1のRGBビット・階調・VRAM容量を画面条件から全16進例で独立検算する', () => {
  const orderedColors = ['青', '赤', '黄', '黒', 'シアン', '白', 'マゼンタ', '緑'];
  const light = new Map<string, string>([
    ['', '黒'], ['赤', '赤'], ['緑', '緑'], ['青', '青'],
    ['緑青', 'シアン'], ['赤青', 'マゼンタ'], ['赤緑', '黄'], ['赤緑青', '白'],
  ]);
  function emitted(pattern: string) {
    assert.match(pattern, /^[01]{3}$/);
    return light.get(['赤', '緑', '青'].filter((_, i) => pattern[i] === '1').join(''))!;
  }
  for (const index of cases) {
    const body = definitions[0].build([index]);
    const text = visible(body);
    const secondary = /(.+?)（[^）]+）｜［a］/.exec(figure(body, profiles.colorBits).alt)![1];
    assert.equal((figure(body, profiles.colorBits).alt.match(/（網掛け）/g) ?? []).length, 2);
    expectOptions(body, 0, ['011', '101', '110']);
    correct(body, 0, pattern => emitted(pattern) === secondary);
    const head = [...text.matchAll(/プレーン[123]の先頭ビットが([01])/g)].map(match => match[1]).join('');
    const byteStrings = [...figure(body, profiles.vram).alt.matchAll(/（[赤緑青]）は([0-9A-F]{2})/g)].map(match => match[1]);
    assert.equal(byteStrings.length, 3);
    const nth = Number(/先頭から数えて(\d+)番目/.exec(text)![1]);
    assert(nth >= 1 && nth <= 8);
    const bitAt = byteStrings.map(byte => parseInt(byte, 16).toString(2).padStart(8, '0')[nth - 1]).join('');
    expectOptions(body, 1, orderedColors);
    expectOptions(body, 2, orderedColors);
    correct(body, 1, choice => choice === emitted(head));
    correct(body, 2, choice => choice === emitted(bitAt));
    const plane = /((?:プレーン\d+[と，]?)+)を赤に，((?:プレーン\d+[と，]?)+)を緑に，((?:プレーン\d+[と，]?)+)を青に/.exec(text)!;
    const counts = plane.slice(1).map(assignment => (assignment.match(/プレーン\d+/g) ?? []).length);
    assert.equal(counts[1], counts[2]);
    assert.match(text, new RegExp(counts.reduce((a, b) => a + b, 0) + 'ビットで'));
    const levels = counts.map(count => Array.from({ length: 1 << count }, (_, n) => n).length);
    const display = /縦(\d+)×横(\d+)画素のディスプレイに(\d+)色/.exec(text)!;
    const [height, width, colors] = display.slice(1).map(Number);
    let bits = 0;
    while (1 << bits < colors) bits++;
    const bytes = height * width * bits / 8;
    assert.equal(bytes % 1000, 0);
    assert.match(text, /1kバイトは1,000バイト/);
    for (const part of [3, 4, 5])
      expectOptions(body, part, ['2', '4', '8', '16', '32', '60', '64', '120', '128', '240']);
    correct(body, 3, choice => Number(choice) === levels[1]);
    correct(body, 4, choice => Number(choice) === levels.reduce((a, b) => a * b, 1));
    correct(body, 5, choice => Number(choice) === bytes / 1000);
    assert(body.explanation.includes(bitAt) && body.explanation.includes('＝' + bytes / 1000 + 'kバイト'));
  }
});

function canHandleFault(order: string, resident: string[], request: string) {
  const frames: (string | undefined)[] = [...resident];
  const present = new Set(resident);
  let victim: number | undefined;
  let mapped: number | undefined;
  for (const event of order.split('→')) {
    if (event === '②') {
      victim = frames.findIndex(page => page !== undefined);
    } else if (event === '①' && victim !== undefined) {
      frames[victim] = undefined;
    } else if (event === '④' && victim !== undefined && frames[victim] === undefined) {
      present.delete(resident[victim]);
    } else if (event === '③' && victim !== undefined && !present.has(resident[victim])) {
      frames[victim] = request;
    } else if (event === '⑦' && frames.includes(request)) {
      mapped = frames.indexOf(request);
    } else if (event === '⑤' && mapped !== undefined) {
      present.add(request);
    } else {
      return false;
    }
  }
  return frames.includes(request) && present.has(request) && present.size === resident.length &&
    frames.every(page => page !== undefined && present.has(page));
}

function simulateFifo(trace: number[], capacity: number) {
  const arrival = new Map<number, number>();
  return trace.reduce((faults, page, time) => {
    if (arrival.has(page)) return faults;
    if (arrival.size === capacity) {
      const earliest = Math.min(...arrival.values());
      const evict = [...arrival].find(([, loaded]) => loaded === earliest)![0];
      arrival.delete(evict);
    }
    arrival.set(page, time);
    return faults + 1;
  }, 0);
}

test('問2の用語・全手順候補と5ページ13参照を独立した物理フレームモデルで照合する', () => {
  const policy = [
    ['参照回数が最も少ないページ', 'LFU'],
    ['最も後にページインしたページ', 'LIFO'],
    ['参照されていない時間が最も長いページ', 'LRU'],
  ];
  for (const index of cases) {
    const body = definitions[1].build([index]);
    const text = visible(body);
    const candidatePolicy = policy.filter(([condition]) => text.includes(condition + 'を置換え対象'));
    assert.equal(candidatePolicy.length, 1);
    for (const part of [0, 1]) expectOptions(body, part, ['LFU', 'LIFO', 'LRU', '仮想アドレス空間', '物理アドレス空間']);
    correct(body, 0, choice => choice === '物理アドレス空間');
    correct(body, 1, choice => choice === candidatePolicy[0][1]);
    const [, current, requested] = /物理アドレス空間に(a\d(?:，a\d){2})が存在している状態で(a\d)/.exec(text)!;
    const resident = current.split('，');
    assert(!resident.includes(requested));
    expectOptions(body, 2, ['①→②→③→④→⑤→⑥','①→③→②→④→⑦→⑤','②→①→④→③→⑤→⑥',
      '②→①→④→③→⑦→⑤','②→③→①→④→⑤→⑥','②→③→⑤→⑥→①→④']);
    correct(body, 2, choice => canHandleFault(choice, resident, requested));
    const trace = /仮想ページ番号の並び】\n([1-5→]+)/.exec(text)![1].split('→').map(Number);
    assert.equal(trace.length, 13);
    assert.deepEqual([...new Set(trace)].sort(), [1, 2, 3, 4, 5]);
    assert.match(text, /実行開始時点では，物理アドレス空間にはどのページも存在していない/);
    for (const [part, capacity] of [[3, 3], [4, 4]]) {
      const faults = simulateFifo(trace, capacity);
      expectOptions(body, part, ['8', '9', '10', '11', '12']);
      correct(body, part, choice => Number(choice) === faults);
      assert(body.explanation.includes('物理ページ3個では' + simulateFifo(trace, 3) + '回，4個では' + simulateFifo(trace, 4) + '回'));
    }
    const alt = figure(body, profiles.paging).alt;
    const mapped = [...alt.matchAll(/a([1-5])（仮想ページ([1-5])）は存在ビット1で物理ページ([12])/g)];
    assert.deepEqual(mapped.map(match => match[1]), mapped.map(match => match[2]));
    assert.deepEqual(mapped.map(match => Number(match[3])).sort(), [1, 2]);
    assert.equal((alt.match(/存在ビット0で物理ページ番号の表示なし/g) ?? []).length, 3);
    const frames = /1と2にa(\d)、a(\d)が格納/.exec(alt)!;
    for (const match of mapped) assert.equal(match[1], frames[Number(match[3])]);
  }
});

type Purchase = { member: string; store: string; day: string; amount: number; employee: string | null };
function dateKey(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10).replaceAll('-', '');
}

test('問3の集計・年初の判定・顧客抽出は全SQL選択肢を独立データに実行して照合する', () => {
  const relations = new Map([
    ['会員表', '会員番号'], ['会計表', '会計コード'], ['店舗表', '店舗コード'],
    ['明細表', '会計コード＋メニューコード'], ['メニュー表', 'メニューコード'],
  ]);
  for (const index of cases) {
    const body = definitions[2].build([index]);
    const text = visible(body);
    for (const part of [0, 1]) expectOptions(body, part, [...relations.keys()]);
    correct(body, 0, choice => relations.get(choice) === '会員番号');
    correct(body, 1, choice => relations.get(choice) === '会計コード');
    assert.match(text, /1度は来店したことがある/);
    assert.match(text, /割引後の金額が設定/);
    assert.match(text, /担当美容師としてNULL/);
    const statements = codes(body).filter(sql => sql.startsWith('SELECT'));
    assert.equal(statements.length, 3);
    const [aggregate, dateQuery, employeeQuery] = statements;
    const [, year, month] = /運用を開始した。(\d{4})年(\d{1,2})月について/.exec(text)!.map(Number);
    const start = dateKey(year, month, 1), end = dateKey(year, month + 1, 0);
    const cutoff = dateKey(year + 1, 1, 1);
    const target = /従業員コード“(\d{7})”/.exec(text)![1];
    const employeeFigure = body.prompt.find((block): block is Figure =>
      block.type === 'diagram' && block.scene.kind === 'source_figure' &&
      block.scene.profile === profiles.database && block.scene.values[1] === 2);
    assert(employeeFigure);
    const store = new RegExp(target + '｜[^\n]+｜(\\d{2})$').exec(employeeFigure.alt)![1];
    const anotherStore = store === '01' ? '02' : '01';
    assert(aggregate.includes("'" + start + "' AND '" + end + "'"));
    assert(dateQuery.includes("'" + cutoff + "'"));
    const before = dateKey(year, month, 0), after = dateKey(year, month + 1, 1);
    const members: [string, string | null][] = [['01',target],['02',null],['03',target],['04',null],['05',null],['06',null]];
    const purchases: Purchase[] = [
      { member:'01', store:anotherStore, day:before, amount:999, employee:null },
      { member:'01', store:anotherStore, day:start, amount:600, employee:null },
      { member:'02', store:anotherStore, day:start, amount:1800, employee:target },
      { member:'02', store:anotherStore, day:end, amount:1400, employee:target },
      { member:'02', store:anotherStore, day:after, amount:2600, employee:target },
      { member:'02', store:anotherStore, day:cutoff, amount:2700, employee:target },
      { member:'03', store, day:start, amount:800, employee:target },
      { member:'03', store, day:end, amount:2000, employee:target },
      { member:'04', store, day:cutoff, amount:3300, employee:null },
      { member:'05', store, day:end, amount:300, employee:null },
      { member:'06', store:anotherStore, day:dateKey(year + 1, 1, 2), amount:4200, employee:null },
    ];
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(`CREATE TABLE 店舗表 (店舗コード TEXT PRIMARY KEY, 店舗名 TEXT);
        CREATE TABLE 会員表 (会員番号 TEXT PRIMARY KEY, 氏名 TEXT, 住所 TEXT, 担当美容師 TEXT);
        CREATE TABLE 会計表 (会計コード INTEGER PRIMARY KEY, 会員番号 TEXT, 店舗コード TEXT, 来店日 TEXT, 会計金額 INTEGER, 担当美容師 TEXT);
        CREATE TABLE 従業員表 (従業員コード TEXT PRIMARY KEY, 店舗コード TEXT);`);
      const addStore = db.prepare('INSERT INTO 店舗表 VALUES (?, ?)');
      for (const code of [store, anotherStore]) addStore.run(code, '店舗' + code);
      const addMember = db.prepare('INSERT INTO 会員表 VALUES (?, ?, ?, ?)');
      for (const [id, employee] of members) addMember.run(id, '会員' + id, '住所' + id, employee);
      const addPurchase = db.prepare('INSERT INTO 会計表 VALUES (?, ?, ?, ?, ?, ?)');
      purchases.forEach((item, id) => addPurchase.run(id + 501, item.member, item.store, item.day, item.amount, item.employee));
      db.prepare('INSERT INTO 従業員表 VALUES (?, ?)').run(target, store);
      const referenceSales = [store, anotherStore].sort().map(code => {
        const amounts = purchases.filter(item => item.store === code && item.day >= start && item.day <= end).map(item => item.amount);
        const sales = amounts.reduce((a, b) => a + b, 0);
        return [code, '店舗' + code, sales, amounts.length, sales / amounts.length];
      });
      correct(body, 2, (choice, i) => {
        const sql = aggregate.replace('［c］', () => choice);
        if (i === 0 || i === 2) {
          assert.throws(() => db.prepare(sql).all(), /no such column: 売上金額/);
          return false;
        }
        const actual = db.prepare(sql + ' ORDER BY 店舗表.店舗コード').all().map(row => Object.values(row));
        if (i === 1) {
          const wrongCount = referenceSales.map(([code]) => Math.max(...purchases.flatMap((item, j) =>
            item.store === code && item.day >= start && item.day <= end ? [j + 501] : [])));
          assert.deepEqual(actual.map(row => row[3]), wrongCount);
        }
        return JSON.stringify(actual) === JSON.stringify(referenceSales);
      });
      const actualDates = db.prepare(dateQuery + ' ORDER BY 会員表.会員番号').all().map(row => row.会員番号);
      correct(body, 3, choice => {
        assert(choice.includes(String(year + 1)));
        const before = choice.includes('より前に');
        const needsVisit = choice.includes('1回以上');
        assert(needsVisit || choice.includes('1回も'));
        const matching = members.filter(([id]) => purchases.some(row =>
          row.member === id && (before ? row.day < cutoff : row.day >= cutoff)) === needsVisit).map(([id]) => id);
        return JSON.stringify(actualDates) === JSON.stringify(matching);
      });
      const referenceEmployees = members.filter(([id, employee]) => employee === target || purchases.some(row =>
        row.member === id && row.employee === target)).map(([id]) => [id, '会員' + id, '住所' + id]);
      correct(body, 4, (choice, i) => {
        assert(choice.includes("'" + target + "'"));
        if (i === 3) assert.match(choice, /= ANY \(SELECT 店舗コード FROM 従業員表/);
        // Standard SQL = ANY (one-column subquery) is equivalent to IN.
        const condition = choice.replace('= ANY (SELECT 店舗コード', 'IN (SELECT 店舗コード');
        const actual = db.prepare(employeeQuery.replace('［d］', () => condition) + ' ORDER BY 会員表.会員番号')
          .all().map(row => Object.values(row));
        if (i === 1) assert.deepEqual(actual.map(row => row[0]), ['03']);
        if (i >= 2) assert.deepEqual(actual.map(row => row[0]), ['03', '04', '05']);
        return JSON.stringify(actual) === JSON.stringify(referenceEmployees);
      });
    } finally {
      db.close();
    }
  }
});

test('問4のカード・ログ・状態遷移を表示上の条件と個々の候補で独立に検算する', () => {
  const cardProperties = new Map([
    ['一部が破損しても利用できるICカード', '部分故障後の可用性'],
    ['外部から強い衝撃があっても変形しないICカード', '耐衝撃性'],
    ['内部情報に外部から不正にアクセスできないICカード', '内部情報保護'],
    ['返却後に，再利用できるICカード', '再使用可能性'],
  ]);
  const neededLogFields = ['ICカード利用日時','ICカード読取り装置識別番号','ICカードID','利用者ID'];
  const edge = new Map([['α',['②','⑤']], ['β',['⑤','②']], ['γ',['②','③']], ['δ',['⑤','③']]]);
  for (const index of cases) {
    const body = definitions[3].build([index]);
    const text = visible(body);
    expectOptions(body, 0, [...cardProperties.keys()]);
    correct(body, 0, choice => cardProperties.get(choice) === '内部情報保護');
    correct(body, 1, choice => {
      const columns = choice.split('，');
      assert.equal(new Set(columns).size, columns.length);
      return neededLogFields.every(field => columns.includes(field));
    });
    const retry = /入室時又はパスワードの変更時に，(\d)回連続してパスワードを誤って/.exec(text)![1];
    assert.match(text, new RegExp(retry + '回連続してパスワードを誤って入力した場合，“一時利用停止”'));
    correct(body, 2, choice => choice === retry + '回連続してパスワードを誤入力');
    const graph = figure(body, profiles.security).alt;
    assert.match(graph, /①から④へは空欄a/);
    assert.match(graph, /④から①へはセキュリティ管理者によるパスワード初期化/);
    const waiting = text.includes('待機期間中に協力社員が契約を終了');
    if (waiting) assert.match(text, /待機する期間がある場合，その期間の入室許可の状態は“執務室だけ許可”/);
    else assert.match(text, /協力社員は，プロジェクトに参画している期間中だけ開発室に入室可能/);
    const ending = waiting ? '②' : '⑤';
    expectOptions(body, 3, [...edge.keys()]);
    correct(body, 3, choice => {
      const [from, to] = edge.get(choice)!;
      assert(graph.includes(from + 'から' + to + 'は' + choice));
      return from === ending && to === '③';
    });
    const nodes = ['①仮パスワード','②有効','③返却','④一時利用停止','⑤有効'];
    expectOptions(body, 4, nodes.map(node => node[0]));
    correct(body, 4, choice => {
      const node = nodes.find(candidate => candidate[0] === choice)!;
      assert(graph.includes(choice + 'は' + node.slice(1)));
      return node.endsWith('一時利用停止');
    });
  }
});

const escaped = (text: string) => text.replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[char]!));

test('問1〜4の全図表が登録された代替説明と同じ条件をSVG又はHTMLで表示する', () => {
  assert.deepEqual(renderers.map(renderer => renderer.profile).sort(), figures.map(figure => figure.profile).sort());
  const rendered = new Set<string>();
  for (const definition of definitions) for (const index of cases) {
    const body = definition.build([index]);
    for (const block of body.prompt) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene;
      const definition = figures.find(candidate => candidate.profile === profile)!;
      const renderer = renderers.find(candidate => candidate.profile === profile)!;
      assert.equal(readBookletFigure(definition, values), block.alt);
      assert.throws(() => readBookletFigure(definition, values.map((value, i) => i === 0 ? value + 4 : value)), /入力域/);
      const html = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
      assert(!/NaN|undefined|Infinity|<img/.test(html));
      if (html.includes('<svg')) {
        assert(html.includes('role="img"') && html.includes('aria-describedby='));
        assert.equal(/<desc\b[^>]*>([\s\S]*?)<\/desc>/.exec(html)![1], escaped(block.alt));
        assert(html.includes('class="diagram-scroll" tabindex="0"'));
      } else {
        assert(html.includes('role="group"') && html.includes('aria-description="' + escaped(block.alt) + '"'));
        assert(/<(?:table|ol)\b/.test(html));
      }
      if (profile === profiles.colorBits) assert.equal((html.match(/aria-label="網掛け"/g) ?? []).length, 2);
      if (profile === profiles.vram) for (const [, byte] of block.alt.matchAll(/（[赤緑青]）は([A-F0-9]{2})/g))
        assert(html.includes('>' + byte + '</text>'));
      if (profile === profiles.database) {
        const underlined = [...html.matchAll(/<u data-primary-key="true">([^<]+)<\/u>/g)].map(match => match[1]);
        assert.deepEqual(underlined, [[], ['会員番号','店舗コード','メニューコード','会計コード','会計コード','メニューコード'], ['従業員コード']][values[1]]);
      }
      if (profile === profiles.securityPolicy) {
        assert.equal((html.match(/<li>/g) ?? []).length, 7);
        assert(html.includes('<u>①耐タンパ性をもつもの</u>') && html.includes('<u>②入退室管理システムは入退室のログを収集する。</u>'));
      }
      if (profile === profiles.userInfo) assert(html.includes('<td colSpan="2">（上記以外の利用者情報）<br/>'));
      if (profile === profiles.security) {
        assert.equal((html.match(/data-card-state=/g) ?? []).length, 5);
        for (const label of ['a','α','β','γ','δ','状態','番号','ICカードの状態','入室許可の状態','入室可能な部屋'])
          assert(html.includes('>' + label + '</text>'));
      }
      rendered.add(profile);
    }
  }
  assert.deepEqual([...rendered].sort(), figures.map(figure => figure.profile).sort());
});
