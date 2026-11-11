import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2013AutumnAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2013-autumn-am-54-80';
import { legacy2013AutumnAm5480Figures as figures } from '../../../src/core/generators/legacy-2013-autumn-am-54-80-figures';
import { legacy2013AutumnAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2013AutumnAm5480Figures';
import { autumn2013AmKnowledgeOracle as knowledge } from '../../fixtures/legacy-2013-autumn-am-54-80-knowledge-oracle';
import review from '../../fixtures/legacy-2013-autumn-am-54-80-review.json';

function definition(number: number) {
  const result = definitions.find(candidate => candidate.source === '2013h25a-fe-am-' + number);
  assert(result);
  return result;
}
function cases(number: number) {
  const item = definition(number);
  return Array.from({ length: item.fields[0].maximum + 1 }, (_, index) => item.build([index]));
}
function stem(body: GeneratedBody) {
  return body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
}
function options(body: GeneratedBody) {
  return body.choices.map(([block]) => {
    assert.equal(block.type, 'paragraph');
    return block.text;
  });
}
function number(value: string) {
  assert.match(value, /^-?[\d,]+$/);
  return Number(value.replaceAll(',', ''));
}
function unique(body: GeneratedBody, correct: boolean[]) {
  assert.deepEqual(correct, body.choices.map((_, index) => index === body.correctIndex));
}
function ordered(body: GeneratedBody) {
  const choices = options(body).map(number);
  assert.deepEqual(choices, [...new Set(choices)].sort((a, b) => a - b));
  return choices;
}
function figure([block]: GeneratedBody['prompt']) {
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  return { caption: block.caption, alt: block.alt, scene: block.scene };
}
function display(block: ReturnType<typeof figure>) {
  const renderer = renderers.find(candidate => candidate.profile === block.scene.profile);
  const definition = figures.find(candidate => candidate.profile === block.scene.profile);
  assert(renderer && definition);
  assert.equal(definition.alt(block.scene.values), block.alt);
  return renderToStaticMarkup(createElement(renderer.component, { values: block.scene.values, caption: block.caption }));
}
function tableRows(markup: string) {
  const [, rows] = /<tbody>([\s\S]+)<\/tbody>/.exec(markup) ?? [];
  assert(rows);
  return [...rows.matchAll(/<tr>([\s\S]+?)<\/tr>/g)].map(([, row]) =>
    [...row.matchAll(/<t[dh][^>]*>([^<]*)<\/t[dh]>/g)].map(([, cell]) => cell));
}

test('2013秋 午前問54〜80は原紙面・公式解答と全100生成条件を保持する', () => {
  assert.deepEqual(review.rightsHolds, []);
  assert.deepEqual(review.records.map(item => item.number), Array.from({ length: 27 }, (_, i) => 54 + i));
  assert.equal(definitions.length, 27);
  assert.equal(review.records.reduce((sum, row) => sum + row.inputs, 0), 100);
  assert.equal(review.records.reduce((sum, row) => sum + row.inputs, 0) * 4, 400);
  assert.equal(review.records[0].page, 25);
  assert.equal(review.records.at(-1)!.page, 37);
  for (const row of review.records) {
    const item = definition(row.number), bodies = cases(row.number);
    const original = item.build([0]);
    assert.deepEqual(item.reference, [0]);
    assert.equal(item.sourceAnswer, row.officialAnswer);
    assert.equal('アイウエ'[original.correctIndex!], row.officialAnswer);
    const originalChoices = row.number === 58
      ? original.choices.map(choice => figure(choice).alt.replace(/^縦軸は利用料金、横軸は使用量。原点は0。/, '').replace(/。$/, ''))
      : options(original);
    const statementHash = createHash('sha256').update(JSON.stringify([stem(original), originalChoices])).digest('hex');
    assert.equal(statementHash, row.statementHash, 'original Q' + row.number);
    assert.equal(bodies.length, row.inputs);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, row.inputs, 'prompt Q' + row.number);
    assert.equal(bodies.every(body => body.explanation.length > 20 && body.choices.length === 4 &&
      new Set(body.choices.map(choice => JSON.stringify(choice))).size === 4), true);
    const answers = new Set(bodies.map(body => JSON.stringify(body.choices[body.correctIndex!])));
    if (row.number === 69) assert.equal(item.answerVariation, 'fixed');
    else assert(answers.size >= 2);
    for (const bad of [[], [-1], [row.inputs], [0, 1], [0.1], [NaN], Array(1)]) {
      assert.throws(() => item.build(bad), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
});

test('2013秋 午前問54は実表の標準日数と各画面の積算で全択を検算する', () => {
  for (const body of cases(54)) {
    const [, small, middle, large, complex, review, rate] =
      /全部で100画面.*単純な画面が(\d+)，中規模かつ普通の画面が(\d+)，大規模かつ普通の画面が(\d+)，大規模かつ複雑な画面が(\d+).*レビューに(\d+)人日.*作業工数の(\d+)％/.exec(stem(body))!.map(Number);
    const markup = display(figure(body.prompt.slice(1)));
    assert.match(markup, /複雑度.*規模/);
    assert.match(markup, /画面当たりの標準作業日数.*単位 人日/);
    const rates = tableRows(markup);
    assert.deepEqual(rates.map(row => row[0]), ['小', '中', '大']);
    assert.equal(small + middle + large + complex, 100);
    const days = [rates[0][1], rates[1][2], rates[2][2], rates[2][3]].flatMap((rate, i) =>
      Array([small, middle, large, complex][i]).fill(Math.round(10 * Number(rate)))).reduce((sum, value) => sum + value, 0) / 10;
    const candidates = ordered(body);
    const managed = (days + review) * rate;
    unique(body, candidates.map(value => (value - days - review) * 100 === managed));
    assert.deepEqual(candidates, [days, days + review, days + review + days * rate / 100, days + review + managed / 100]);
    assert.match(body.explanation, new RegExp('合計' + candidates[3] + '人日'));
  }
});

test('2013秋 午前問58は実際の折れ線と傾きで課金方式を区別する', () => {
  for (const body of cases(58)) {
    const meaning = body.choices.map(choice => {
      const markup = display(figure(choice));
      assert.match(markup, /利用料金<\/text>.*使用量<\/text>/);
      assert.match(markup, />0<\/text>/);
      const [, points] = /<polyline points="([^"]+)"/.exec(markup)!;
      const line = points.split(' ').map(point => point.split(',').map(Number));
      const slopes = line.slice(1).map(([x, y], i) => (line[i][1] - y) / (x - line[i][0]));
      assert(slopes.every(Number.isFinite));
      if (slopes.every(slope => slope < 0)) return 'total-falls';
      if (slopes[0] > 0 && slopes.slice(1).every(slope => slope === 0)) return 'ceiling';
      assert(slopes.every(slope => slope > 0));
      if (slopes.slice(1).every((slope, i) => slope < slopes[i])) return 'regressive';
      assert(slopes.slice(1).every((slope, i) => slope > slopes[i]));
      return 'progressive';
    });
    assert.deepEqual(meaning, ['total-falls', 'ceiling', 'regressive', 'progressive']);
    const [, tariff] = /利用料金を(逓減課金|逓増課金|上限付き従量課金)方式にしたとき/.exec(stem(body))!;
    const asked = tariff === '逓減課金' ? 'regressive' : tariff === '逓増課金' ? 'progressive' : 'ceiling';
    unique(body, meaning.map(role => role === asked));
    const conclusion = { regressive: /傾きが区間ごとに緩やか/, progressive: /傾きは区間を進むたびに急/, ceiling: /合計料金は増えず、水平/ };
    assert.match(body.explanation, conclusion[asked]);
  }
});

test('2013秋 午前問62は四体系から表示済みの三体系を引き、全択を照合する', () => {
  const domains = ['ビジネス', 'データ', 'アプリケーション', 'テクノロジ'].map(label => label + 'アーキテクチャ');
  for (const body of cases(62)) {
    const given = domains.filter(domain => stem(body).includes(domain));
    assert.equal(given.length, 3);
    const candidates = options(body);
    assert.deepEqual(candidates.filter((_, index) => index !== 2),
      ['システムアーキテクチャ', 'ソフトウェアアーキテクチャ', 'バスアーキテクチャ']);
    const [remaining] = domains.filter(domain => !given.includes(domain));
    unique(body, candidates.map(choice => choice === remaining));
    assert(body.explanation.includes(remaining));
  }
});

test('2013秋 午前問69は二つの軸と事業の相対的位置を配分判断に使う', () => {
  for (const [index, body] of cases(69).entries()) {
    const markup = display(figure(body.prompt.slice(1)));
    assert.match(markup, /<rect x="65" y="41" width="174" height="174"/);
    assert.match(markup, /M152 41V215M65 128H239/);
    assert.match(markup, /事業の強み（市場シェア）/);
    assert.match(markup, /事業の魅力度（市場成長率）/);
    const positions = Object.fromEntries([...markup.matchAll(/<text x="(\d+)" y="(\d+)"[^>]+>(高|低|強|弱)<\/text>/g)]
      .map(([, x, y, label]) => [label, [Number(x), Number(y)]]));
    assert(positions.高[1] < positions.低[1] && positions.強[0] < positions.弱[0]);
    const methods = [/プロモーション効果を測定/, /資源配分の優先順位/, /製品の品質を高め/, /季節変動要因や地域的広がり/];
    const candidates = options(body);
    candidates.forEach((option, i) => assert.match(option, methods[i]));
    unique(body, candidates.map(option => methods[1].test(option)));
    assert.match(stem(body), /事業計画や競争優位性を?の?分析/);
    if (index === 1) {
      assert.match(stem(body), /シェアは大きいが成長率の低い.*成長率は高いが市場シェアが小さい/);
      assert.match(body.explanation, /既存事業は左下、新規事業は右上/);
    }
    if (index === 2) {
      assert.match(stem(body), /シェアがともに大きい.*一方の市場だけが高成長/);
      assert.match(body.explanation, /ともに左側.*高成長事業は上.*もう一つの事業は下/);
    }
  }
});

test('2013秋 午前問75は資源制約下の全実行可能な整数の生産数を検算する', () => {
  for (const body of cases(75)) {
    const shown = body.prompt.find(item => item.type === 'table');
    assert(shown);
    assert.deepEqual(shown.columns, ['原料', '製品Xの1個当たりの必要量', '製品Yの1個当たりの必要量', '調達可能量']);
    const [, xProfit, yProfit] = /それぞれ(\d+)円，(\d+)円/.exec(stem(body))!.map(Number);
    const [[ax, ay, availableA], [bx, by, availableB]] = shown.rows.map(row => row.slice(1).map(number));
    let maximum = -Infinity, axisX = -Infinity, axisY = -Infinity;
    let maximumX = -1, maximumY = -1, tied = 0;
    for (let x = 0; x * ax <= availableA && x * bx <= availableB; x++) {
      for (let y = 0; x * ax + y * ay <= availableA && x * bx + y * by <= availableB; y++) {
        const profit = x * xProfit + y * yProfit;
        if (y === 0) axisX = Math.max(axisX, profit);
        if (x === 0) axisY = Math.max(axisY, profit);
        if (profit > maximum) { maximum = profit; maximumX = x; maximumY = y; tied = 1; }
        else if (profit === maximum) tied++;
      }
    }
    assert.equal(tied, 1);
    assert(maximumY * bx + maximumX * by > availableB);
    const candidates = ordered(body);
    unique(body, candidates.map(value => value === maximum));
    assert.deepEqual(candidates, [axisX, axisY, maximum, maximumY * xProfit + maximumX * yProfit].sort((a, b) => a - b));
    assert(candidates.slice(1).every((value, index) => value - candidates[index] >= 800));
    assert.match(body.explanation, new RegExp('Xが' + maximumX + '個、Yが' + maximumY + '個'));
  }
});

test('2013秋 午前問76は特性要因図の終点と枝から原因と結果の向きを独立判定する', () => {
  for (const [index, body] of cases(76).entries()) {
    const markup = display(figure(body.prompt.slice(1)));
    const [, head] = /data-fishbone-head="([ab])"/.exec(markup)!;
    const [, branch] = /data-fishbone-branch="([ab])"/.exec(markup)!;
    assert.notEqual(head, branch);
    assert.match(markup, /M24 42H199.*marker-end=.*M63 108L122 42.*marker-end=/);
    if (index > 0) assert.match(stem(body), new RegExp('現象を' + head + 'とし'));
    const labels = ['原因', '手段', '属性', '目的'];
    const candidates = options(body);
    assert.deepEqual(candidates, labels.map(role => branch + 'は' + head + 'の' + role + 'である。'));
    unique(body, candidates.map(value => value.endsWith('の原因である。')));
    assert(body.explanation.includes(branch + 'は' + head + 'の原因である。'));
  }
});

test('2013秋 午前問77は実表から1個ずつ払い出し、先入先出と他の評価法を照合する', () => {
  for (const body of cases(77)) {
    const markup = display(figure(body.prompt.slice(1)));
    assert.match(markup, /colSpan="2".*受払個数/);
    assert.match(markup, /受入<\/th>.*払出<\/th>/);
    const rows = tableRows(markup);
    assert.deepEqual(rows.map(row => row[0]), ['1日', '5日', '15日', '20日', '25日', '30日']);
    assert.deepEqual(rows.map(row => row[1]), ['前月繰越', '仕入', '売上', '仕入', '売上', '翌月繰越']);
    const queue: number[] = [];
    const receipts: number[] = [];
    let cost = 0, issued = 0;
    for (const [, action, inbound, outbound, value] of rows) {
      if (inbound) {
        const lot = Array<number>(number(inbound)).fill(number(value));
        queue.push(...lot);
        receipts.push(...lot);
      }
      if (action === '売上') {
        for (let i = 0; i < number(outbound); i++) {
          const price = queue.shift();
          assert(price !== undefined);
          cost += price;
          issued++;
        }
      }
      if (action === '翌月繰越') assert.equal(queue.length, number(outbound));
    }
    const candidates = ordered(body);
    unique(body, candidates.map(option => option === cost));
    const receiptTotal = receipts.reduce((sum, price) => sum + price, 0);
    const quantity1 = number(rows[2][3]), quantity2 = number(rows[4][3]);
    const p1 = number(rows[0][2]) * number(rows[0][4]) + number(rows[1][2]) * number(rows[1][4]);
    const n1 = number(rows[0][2]) + number(rows[1][2]);
    const n2 = n1 - quantity1 + number(rows[3][2]);
    const movingNumerator = quantity1 * p1 * n2 +
      quantity2 * (p1 * (n1 - quantity1) + number(rows[3][2]) * number(rows[3][4]) * n1);
    assert.deepEqual(candidates, [cost - 160 * number(rows[0][2]) / 100, cost,
      movingNumerator / (n1 * n2), issued * receiptTotal / receipts.length]);
    assert.match(body.explanation, /翌月繰越は売上に含めない/);
    assert(body.explanation.includes(options(body)[1] + '円'));
  }
});

test('2013秋 午前問78は発注、職務上の作成、分離できない共同寄与から原始的帰属を検証する', () => {
  for (const body of cases(78)) {
    const text = stem(body), choices = options(body);
    assert.match(text, /特段の取決めをせず/);
    assert.match(text, /著作権の原始的帰属はどれか/);
    assert.deepEqual(choices, ['A社とB社が話し合って決定する。', 'A社とB社の共有となる。', 'A社に帰属する。', 'B社に帰属する。']);
    const joint = /共同で作成.*各社従業者が職務上創作的に寄与.*分離して利用できない.*別段の定めはない/.test(text);
    const authorA = /動作試験だけをB社に依頼.*A社の発意で同社従業者が職務上作成.*別段の定めはない/.test(text);
    const authorB = /A社の要求仕様.*プログラム作成をB社に依頼/.test(text);
    assert.equal([joint, authorA, authorB].filter(Boolean).length, 1);
    unique(body, [false, joint, authorA, authorB]);
    assert.match(body.explanation, joint ? /共同著作者.*共有/ : authorA ? /A社が著作者/ : /原始的帰属はB社/);
  }
});

test('2013秋 午前問79は請負側の従業者への指揮を調べ、作業場所・仕様・安全周知を区別する', () => {
  for (const body of cases(79)) {
    const text = stem(body);
    const [, client, contractor] = /^(A社|B社)は(B社|A社)に対して/.exec(text)!;
    assert.match(text, /請負契約/);
    const isIndirect = (choice: string) => /成果物の仕様や納期を取り決め|構内の避難ルールを周知/.test(choice);
    const truth = options(body).map(option => {
      if (isIndirect(option)) return false;
      const original = /^(A社|B社)の従業員が，(?:A社|B社)を作業場所として，(A社|B社)の責任者の指揮命令/.exec(option);
      if (original) return original[1] === contractor && original[2] === client;
      const direct = /^(A社|B社)の責任者が，(B社の従業員|自社の従業員)に.*手順と担当を/.exec(option);
      assert(direct);
      const instructedEmployer = direct[2] === '自社の従業員' ? direct[1] : 'B社';
      return instructedEmployer === contractor && direct[1] === client;
    });
    unique(body, truth);
    assert.match(body.explanation, /指揮命令|指揮している/);
  }
});

test('2013秋 午前問54〜80の知識選択では実際の問いに対する全選択肢の意味を判定する', () => {
  assert.deepEqual(Object.keys(knowledge).map(Number),
    [55,56,57,59,60,61,63,64,65,66,67,68,70,71,72,73,74,80]);
  for (const [key, witnesses] of Object.entries(knowledge)) {
    const n = Number(key), bodies = cases(n);
    assert.equal(bodies.length, witnesses.length);
    for (const [index, body] of bodies.entries()) {
      const shown = stem(body);
      const matched = witnesses.filter(item => item.stem.test(shown));
      assert.equal(matched.length, 1, 'stem Q' + n + ':' + index);
      const [expected] = matched;
      assert.equal(expected, witnesses[index], 'case order Q' + n + ':' + index);
      const allRoles = expected.options.map(([role]) => role);
      assert.equal(new Set(allRoles).size, 4);
      const choices = options(body);
      choices.forEach((option, i) => assert.match(option, expected.options[i][1], 'option Q' + n + ':' + index + ':' + i));
      unique(body, allRoles.map(role => role === expected.askedRole));
      assert.match(body.explanation, expected.explanation, 'explanation Q' + n + ':' + index);
    }
  }
});

test('2013秋 午前問54〜80は管理図5種の全入力を型・描画・読み上げと照合する', () => {
  assert.deepEqual(figures.map(item => item.profile), renderers.map(item => item.profile));
  let count = 0;
  for (const registered of figures) {
    const renderer = renderers.find(item => item.profile === registered.profile)!;
    const [[min, max]] = registered.domain;
    for (const invalid of [[], [-1], [max + 1], [0, 1], [NaN]]) {
      assert.throws(() => registered.validate(invalid));
    }
    for (let value = min; value <= max; value++) {
      const values = [value], description = registered.alt(values);
      const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: '図表の見出し' }));
      assert.match(markup, /managed-diagram source-figure/);
      assert.match(markup, /class="diagram-scroll" tabindex="0"/);
      assert.match(markup, /var\(--diagram-ink\)/);
      assert.match(markup, /var\(--image-scale, 1\)/);
      assert(!markup.includes('NaN'));
      assert(markup.includes(description));
      if (registered.profile.endsWith('-table')) assert(markup.includes('aria-description=') && markup.includes('<table'));
      else assert(markup.includes('aria-describedby=') && markup.includes('<desc'));
      count++;
    }
  }
  assert.equal(count, 18);
});
