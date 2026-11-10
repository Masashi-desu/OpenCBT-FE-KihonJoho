import assert from 'node:assert/strict';
import { isIPv6 } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2013AutumnPm01To04Definitions as definitions } from '../src/core/generators/legacy-2013-autumn-pm-01-04';
import { autumn2013Pm0104Profiles as f, legacy2013AutumnPm0104Figures as figures } from '../src/core/generators/legacy-2013-autumn-pm-01-04-figures';
import { legacy2013AutumnPm0104FigureRenderers as renderers } from '../src/ui/Legacy2013AutumnPm0104Figures';
import { autumn2013Pm01To04Specs as specs } from '../scripts/legacy-2013-autumn-pm-01-04-specs';
import { bankSizes, migrationAggregate, normalization, securityFacts, sourceAnswers } from './fixtures/legacy-2013-autumn-pm-01-04-facts';

function bodies(number: number) {
  const definition = definitions[number - 1];
  return Array.from({ length: definition.fields[0].maximum + 1 }, (_, i) => definition.build([i]));
}

function text(block: Block) {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
}

function slot(body: GeneratedBody, index: number) {
  const part = body.answerParts![index];
  const answer = body.partAnswers![index];
  assert(answer.kind === 'choice' && answer.partId === part.id);
  const choices = part.choiceIds.map(id => {
    const choiceIndex = /^choice-value-(\d+)$/.exec(id);
    assert(choiceIndex);
    const [block] = body.choices[Number(choiceIndex[1]) - 1];
    assert(block);
    return block;
  });
  return { choices, correct: part.choiceIds.indexOf(answer.choiceId) };
}

function verify(body: GeneratedBody, index: number, predicate: (block: Block) => boolean) {
  const { choices, correct } = slot(body, index);
  assert.deepEqual(choices.map(predicate), choices.map((_, i) => i === correct), 'slot ' + index);
}

function diagram(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  return { scene: block.scene, caption: block.caption, alt: block.alt };
}
function svg(block: Block) {
  const { scene, caption, alt } = diagram(block);
  const renderer = renderers.find(entry => entry.profile === scene.profile);
  assert(renderer);
  const def = figures.find(entry => entry.profile === scene.profile);
  assert(def);
  def.validate(scene.values);
  assert.equal(def.alt(scene.values), alt);
  return renderToStaticMarkup(createElement(renderer.component, { values: scene.values, caption }));
}
function findDiagram(body: GeneratedBody, profile: string) {
  const block = body.prompt.find(b => b.type === 'diagram' && b.scene.kind === 'source_figure' && b.scene.profile === profile);
  assert(block);
  return block;
}

test('2013秋 午後問1〜4の原頁、25解答欄、全解答群と基準解答を公式資料に照合する', () => {
  const starts = [5, 10, 15, 19], lengths = [5, 5, 4, 4];
  for (const [i, spec] of specs.entries()) {
    assert.equal(spec.definition, definitions[i]);
    assert.deepEqual(spec.pages, Array.from({ length: lengths[i] }, (_, offset) => starts[i] + offset));
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), spec.pages);
    assert(Object.values(spec.originalPageAlt).every(alt => alt.length > 100 && !alt.includes('undefined')));
    const found = bankSizes[i].map((size, j) => {
      const original = slot(spec.original, j);
      assert.equal(original.choices.length, size);
      return 'アイウエオカキクケ'[original.correct];
    }).join('');
    assert.equal(found, sourceAnswers[i]);
    const cases = bodies(i + 1);
    assert.equal(cases.length, 4);
    assert.equal(new Set(cases.map(body => JSON.stringify(body.prompt.map(block =>
      block.type === 'diagram' ? block.scene : block)))).size, 4);
    assert(new Set(cases.map(body => body.partAnswers!.map((_, j) => {
      const { choices, correct } = slot(body, j);
      return JSON.stringify(choices[correct]);
    }).join('|'))).size >= 3);
    for (const body of cases) {
      assert.equal(body.answerParts!.length, bankSizes[i].length);
      assert.equal(body.partAnswers!.length, bankSizes[i].length);
      for (const [j, size] of bankSizes[i].entries()) {
        const { choices, correct } = slot(body, j);
        assert.equal(choices.length, size);
        assert.equal(new Set(choices.map(block => JSON.stringify(block))).size, size);
        assert(correct >= 0);
      }
      assert(body.explanation.length > 60);
    }
    for (const bad of [[], [-1], [4], [0.1], [NaN], [0, 1], Array(1)]) assert.throws(() => spec.definition.build(bad), /PARAMETER_CONSTRAINT/);
  }
  assert.match(specs[0].originalPageAlt[5], /7問については.*5問を選択[\s\S]*6問以上[\s\S]*はじめの5問/);
});

type Pair = readonly [number, number];
const pairs: Pair[] = [[0,0],[0,1],[1,0],[1,1]];
function logical(name: string, x: number, y: number): number {
  switch (name) {
    case 'AND': return Number(x === 1 && y === 1);
    case 'OR': return Number(x === 1 || y === 1);
    case 'XOR': return Number(x !== y);
    case 'NAND': return Number(x !== 1 || y !== 1);
    case 'NOR': return Number(x === 0 && y === 0);
    case 'XNOR': return Number(x === y);
    default: throw Error('unknown operation ' + name);
  }
}
const gatesIn = (html: string) => [...html.matchAll(/data-circuit-gate="([^"]+)"/g)].map(row => row[1]);

test('2013秋 午後問1の描画された合成回路、半加算器、全加算器の全候補を真理値から判定する', () => {
  for (const body of bodies(1)) {
    const conditions = body.prompt.flatMap(b => b.type === 'paragraph' ? [b.text] : []).find(s => s.includes('の論理回路は［a］'));
    const targets = /（1）(\w+)の論理回路は［a］.*\n（2）(\w+)の論理回路は［b］/.exec(conditions ?? '');
    assert(targets);
    for (const index of [0, 1]) verify(body, index, block => {
      const components = gatesIn(svg(block));
      const invertedInputs = components[0] === 'NOT';
      const gate = components[invertedInputs ? 2 : 0];
      assert.deepEqual(components, invertedInputs ? ['NOT','NOT',gate] : [gate,'NOT']);
      return pairs.every(([x,y]) => {
        const intermediate = logical(gate, invertedInputs ? 1 - x : x, invertedInputs ? 1 - y : y);
        return (invertedInputs ? intermediate : 1 - intermediate) === logical(targets[index + 1], x, y);
      });
    });
    const half = svg(findDiagram(body, f.half));
    const [sum,carry] = gatesIn(half);
    assert(sum === 'blank' || carry === 'blank');
    assert(sum !== carry);
    verify(body, 2, block => pairs.every(([x,y]) => logical(text(block),x,y) === (sum === 'blank' ? (x + y) % 2 : Math.trunc((x + y) / 2))));
    const full = svg(findDiagram(body, f.full));
    assert.equal((full.match(/>半加算器<\/text>/g) ?? []).length, 2);
    assert.match(full, /data-circuit-gate="blank"/);
    verify(body, 3, block => pairs.every(([x,y]) => [0,1].every(cin => {
      const low = (x + y) % 2, carry1 = Number(x + y >= 2), carry2 = Number(low + cin >= 2);
      return logical(text(block), carry1, carry2) === Number(x + y + cin >= 2);
    })));
    const truth = svg(findDiagram(body, f.truth));
    const rows = [...truth.matchAll(/<tr([^>]*)>((?:<td>\d<\/td>){5})/g)].map(([, attributes,cells]) => ({
      values: [...cells.matchAll(/<td>(\d)<\/td>/g)].map(cell => Number(cell[1])), beta: /data-beta="true"/.test(attributes),
    }));
    assert.equal(rows.length, 8);
    for (const row of rows) {
      const [cin,x,y,c,z] = row.values;
      assert.equal(c * 2 + z, cin + x + y);
      assert.equal(row.beta, x === y && z !== x);
    }
  }
});

test('2013秋 午後問1のVF・ZF候補は4ビットの符号範囲と16通りの出力で一意に決まる', () => {
  for (const body of bodies(1)) {
    const overflow = svg(findDiagram(body, f.overflow)), zero = svg(findDiagram(body, f.zero));
    assert.deepEqual(gatesIn(overflow), ['blank']);
    assert.deepEqual(gatesIn(zero), ['blank','blank','AND']);
    assert.match(overflow, /桁あふれが生じたときVFの値は1/);
    assert.match(zero, /S1〜S4が全て0のときZFの値は1/);
    const ripple = svg(findDiagram(body, f.ripple));
    assert.deepEqual([...ripple.matchAll(/data-adder-bit="(\d+)"/g)].map(row => Number(row[1])), [1,2,3,4]);
    verify(body, 4, block => Array.from({length:16},(_,a) => a - 8).every(a =>
      Array.from({length:16},(_,b) => b - 8).every(b => {
        const carry3 = Number((a & 7) + (b & 7) >= 8), carry4 = Number((a & 15) + (b & 15) >= 16);
        return logical(text(block), carry3, carry4) === Number(a + b < -8 || a + b > 7);
      })));
    verify(body, 5, block => Array.from({length:16},(_,value) => value).every(value => {
      const first = logical(text(block),value & 1,(value >>> 1) & 1);
      const second = logical(text(block),(value >>> 2) & 1,(value >>> 3) & 1);
      return first * second === Number(value === 0);
    }));
  }
});

test('2013秋 午後問2の全候補を総当たりの件数、正規化と所属履歴の対応で判定する', () => {
  for (const body of bodies(2)) {
    const statement = body.prompt.filter(b => b.type === 'paragraph').map(text).join('\n');
    const [,teams] = /近隣の(\d+)チーム/.exec(statement)!;
    const [,target] = /打撃表\.名称='([^']+)'/.exec(body.prompt.filter(b => b.type === 'code').map(text).join('\n'))!;
    assert.match(statement,/他のチームの全てと1回だけ対戦/);
    assert.match(statement,/移籍して元のチームに戻ることはない/);
    verify(body, 0, block => {
      const option = text(block);
      assert(Object.hasOwn(normalization, option));
      return normalization[option as keyof typeof normalization] === '繰返し項目';
    });
    const participants = Array.from({ length: Number(teams) }, (_, i) => i + 1);
    const games = participants.flatMap(team => participants.filter(opponent => team < opponent).map(opponent => [team,opponent]));
    assert.equal(games.flat().length, new Set(games.map(game => game.join('-'))).size * 2);
    verify(body, 1, block => Number(text(block)) === games.flat().length);
    for (const [index, dependency] of [[4, '試合日時点の所属'], [5, '継続する選手ID']] as const) verify(body, index, block => {
      const option = text(block).replace(target + '数', '対象数');
      assert(Object.hasOwn(migrationAggregate, option));
      return migrationAggregate[option as keyof typeof migrationAggregate] === dependency;
    });
    const tables = body.prompt.filter(b => b.type === 'diagram' && b.scene.kind === 'source_figure' && b.scene.profile === f.baseball).map(svg);
    assert.equal(tables.length, 8);
    assert.deepEqual(tables.map(html => (html.match(/data-primary-key="true"/g) ?? []).length), [1,1,1,2,2,1,2,1]);
    assert.match(tables[3], />0<\/td>[\s\S]*>3<\/td>[\s\S]*>1<\/td>[\s\S]*>1<\/td>/);
  }
});

test('2013秋 午後問2の実際の2本のSQL全択はSQLiteで集約・順序・対象を満たすか判定する', () => {
  for (const body of bodies(2)) {
    const sql = body.prompt.filter(b => b.type === 'code').map(text);
    const teams = sql.find(code => code.includes('［c］')), players = sql.find(code => code.includes('［d1］'));
    assert(teams && players);
    assert.match(players, /\n                     WHERE 打撃表\.名称=/);
    const [,target] = /打撃表\.名称='([^']+)'/.exec(players)!;
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(`
        CREATE TABLE チーム表(チーム番号 TEXT, チーム名 TEXT);
        CREATE TABLE 結果表(チーム番号 TEXT, 勝点 INTEGER, 得点 INTEGER);
        CREATE TABLE 選手表(選手番号 TEXT, 氏名 TEXT);
        CREATE TABLE 打撃表(打撃結果 TEXT, 名称 TEXT);
        CREATE TABLE 打席表(打者 TEXT, 投手 TEXT, 打撃結果 TEXT, 打点 INTEGER);
        INSERT INTO チーム表 VALUES ('01','A'),('02','B'),('03','C');
        INSERT INTO 結果表 VALUES ('01',3,2),('01',1,1),('02',3,4),('02',1,2),('03',3,8),('03',0,0);
        INSERT INTO 選手表 VALUES ('0001','甲'),('0002','乙'),('0003','丙');
        INSERT INTO 打撃表 VALUES ('001','三振'),('002','ヒット'),('003','ホームラン');
      `);
      const expected = [['02','B',4,6],['01','A',4,3],['03','C',3,8]];
      const targetId = ({'三振':'001','ヒット':'002','ホームラン':'003'} as const)[target as '三振'|'ヒット'|'ホームラン'];
      assert(targetId);
      const other = targetId === '003' ? '002' : '003';
      const put = db.prepare('INSERT INTO 打席表 VALUES (?,?,?,?)');
      for (const row of [
        ['0001','0099',targetId,0],['0001','0100',targetId,0],['0002','0100',targetId,3],['0003','0099',other,4],
      ] as const) put.run(...row);
      verify(body, 2, choice => JSON.stringify(db.prepare(teams.replace('［c］',text(choice))).all().map(Object.values)) === JSON.stringify(expected));
      verify(body, 3, choice => {
        const [aggregate, order] = text(choice).split('\n');
        const query = players.replace('［d1］',aggregate).replace('［d2］',order);
        return JSON.stringify(db.prepare(query).all().map(Object.values)) === JSON.stringify([['0001','甲',2],['0002','乙',1]]);
      });
    } finally { db.close(); }
  }
});

const expandV6 = (value: string) => {
  if (!isIPv6(value)) return null;
  const [head,tail] = value.split('::');
  const left = head ? head.split(':') : [], right = tail ? tail.split(':') : [];
  const expanded = tail === undefined ? left : [...left,...Array(8-left.length-right.length).fill('0'),...right];
  return expanded.map(hextet => hextet.padStart(4,'0')).join(':');
};
const compressV6 = (value: string) => new URL('http://[' + value + ']/').hostname.slice(1,-1);

test('2013秋 午後問3の人口換算、6to4のビット連結と最短IPv6表記を全候補で判定する', () => {
  for (const body of bodies(3)) {
    const statement = body.prompt.filter(b => b.type === 'paragraph').map(text).join('\n');
    const [,population] = /世界の人口が約(\d+)億人/.exec(statement)!;
    const quantity = ((1n << 128n) / (BigInt(population) * 100000000n)).toString();
    const rounded = Number(quantity.slice(0,2)) + Number(Number(quantity[2]) >= 5);
    const expected = (rounded / 10).toFixed(1) + '×10^' + (quantity.length - 1);
    verify(body, 0, block => text(block) === expected);
    verify(body, 1, block => Number(text(block)) === 16 + 4 * 8);
    const [,v4] = /(\d+\.\d+\.\d+\.\d+)(?:の場合|を当てはめた場合)/.exec(statement)!;
    const v4Number = v4.split('.').reduce((value,byte) => value * 256n + BigInt(byte),0n);
    const expectedPrefix = ((0x2002n << 112n) | (v4Number << 80n)).toString(16);
    verify(body, 2, block => expandV6(text(block))?.replaceAll(':','') === expectedPrefix);
    const table = body.prompt.find(block => block.type === 'table');
    assert(table?.type === 'table');
    assert.deepEqual(table.rows.map(([a,b],i) => i === 0 ? a : b), ['［d］','［e］','［f］']);
    verify(body, 3, block => text(block) === expandV6(table.rows[0][1]));
    verify(body, 4, block => text(block) === compressV6(table.rows[1][0]));
    verify(body, 5, block => text(block) === compressV6(table.rows[2][0]));
  }
});

test('2013秋 午後問4のDH余りとIPsec/RSAの全候補を判定し、図の方向を照合する', () => {
  for (const body of bodies(4)) {
    const statement = body.prompt.filter(b => b.type === 'paragraph').map(text).join('\n');
    const [,z,x,y] = /図2でZ＝(\d+)，X＝(\d+)，Y＝(\d+)/.exec(statement)!;
    const key = 2n ** (BigInt(x) * BigInt(y)) % BigInt(z);
    verify(body, 0, block => BigInt(text(block)) === key);
    assert.match(body.explanation, new RegExp('同じ' + key + 'になる'));
    const exchange = svg(findDiagram(body,f.exchange)), signature = svg(findDiagram(body,f.signature));
    assert.match(exchange, /M事業所VPNルータ[\s\S]*N事業所VPNルータ/);
    assert.match(exchange, /M236 190H513[\s\S]*M514 231H237/);
    for (const rule of ['X，Yは正の整数','2のX乗','PのQによる剰余','事前に設定された素数']) assert(exchange.includes(rule));
    const [,sender,receiver] = /([MN])事業所（送信側）VPNルータ[\s\S]*?([MN])事業所（受信側）VPNルータ/.exec(signature)!;
    assert.notEqual(sender,receiver);
    assert.match(body.explanation,new RegExp(sender + '事業所が送信側の秘密鍵で作成し，' + receiver + '事業所が送信側の公開鍵で検証'));
    assert.match(signature, /共通鍵で暗号化[\s\S]*ハッシュ値の一致を確認/);
    for (const [index,bank,reason] of [
      [1,securityFacts.keys,'送信側の署名作成'],
      [2,securityFacts.keys,'同じ鍵で暗号化と復号'],
      [3,securityFacts.keys,'送信側が作った署名を検証'],
      [4,securityFacts.layers,'IPパケットの転送と経路選択'],
      [5,securityFacts.outcomes,'ペイロードの機密性'],
      [6,securityFacts.outcomes,'署名によるデータ出所の認証'],
    ] as const) verify(body,index,block => {
      const option = text(block), semantics = bank as Readonly<Record<string,string>>;
      assert(Object.hasOwn(semantics,option));
      return semantics[option] === reason;
    });
  }
});

test('2013秋 午後問1〜4の全登録図は妥当な入力域・読上げ・ズームと表示を持つ', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  let checked = 0;
  for (const figure of figures) {
    const renderer = renderers.find(entry => entry.profile === figure.profile)!;
    const inputs = figure.domain.reduce<number[][]>((prior,[min,max]) =>
      prior.flatMap(row => Array.from({length:max-min+1},(_,i) => [...row,min+i])),[[]]);
    for (const values of inputs) {
      figure.validate(values);
      const alt = figure.alt(values);
      assert(alt.length > 10);
      const html = renderToStaticMarkup(createElement(renderer.component, {values,caption:'表示検査'}));
      assert.match(html, /managed-diagram/);
      if (html.includes('<svg')) {
        assert.match(html, /class="diagram-scroll" tabindex="0"/);
        assert.match(html, /aria-describedby="[^"]+"/);
        assert.match(html, /var\(--diagram-ink\)/);
        assert.match(html, /var\(--image-scale, 1\)/);
        assert.match(html, /<desc\b/);
      } else {
        assert.match(html, /role="group" aria-description="/);
        assert.match(html, /<table\b/);
        assert.match(html, /class="table-scroll" tabindex="0"/);
      }
      assert(!/NaN|undefined/.test(html));
      checked++;
    }
    assert.throws(() => figure.validate([]), /FIGURE_DOMAIN/);
    assert.throws(() => figure.validate(figure.domain.map(([,max]) => max + 1)), /FIGURE_DOMAIN/);
  }
  assert.equal(checked, 51);
});
