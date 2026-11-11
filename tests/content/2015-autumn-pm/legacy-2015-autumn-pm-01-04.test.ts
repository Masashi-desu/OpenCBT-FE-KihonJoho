import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { autumn2015Pm01To04Specs as specs } from '../../../scripts/legacy-2015-autumn-pm-01-04-specs';
import { gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import { readBookletFigure } from '../../../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2015AutumnPm0104Figures as figures } from '../../../src/core/generators/legacy-2015-autumn-pm-01-04-figures';
import { legacy2015AutumnPm0104FigureRenderers as renderers } from '../../../src/ui/Legacy2015AutumnPm0104Figures';
import type { Attribution, Block, Question } from '../../../src/core/types';
import review from '../../fixtures/legacy-2015-autumn-pm-01-04-review.json';

const marks = 'アイウエオカキ';
const official = review.questions;
const attribution: Attribution = { origin: 'original', sourceRefs: [], rightsRefs: ['rights-original'], creatorIds: ['codex'] };

function content(q: GeneratedBody, id: string) {
  const choice = q.choices[Number(id.slice('choice-value-'.length)) - 1];
  assert(choice);
  return choice;
}
function bank(q: GeneratedBody, slot: string) {
  const part = q.answerParts?.find(part => part.id === 'part-' + slot);
  assert(part);
  return part.choiceIds.map(id => content(q, id));
}
function first(b: readonly Block[]) {
  assert.equal(b.length, 1);
  return b[0];
}
function plain(b: readonly Block[]) {
  const block = first(b);
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
}
function bankText(q: GeneratedBody, slot: string) { return bank(q, slot).map(plain); }
function correct(q: GeneratedBody, slot: string) {
  const part = q.answerParts!.find(p => p.id === 'part-' + slot)!;
  const answer = q.partAnswers!.find(a => a.kind === 'unordered' ? a.partIds.includes(part.id) : a.partId === part.id);
  assert(answer && answer.kind !== 'no_correct_answer');
  const ids = answer.kind === 'choice' ? [answer.choiceId] : answer.choiceIds;
  return ids.map(id => part.choiceIds.indexOf(id)).sort((a, b) => a - b);
}
function truth(q: GeneratedBody, slot: string, truthValues: boolean[]) {
  assert.equal(truthValues.length, bank(q, slot).length);
  assert.deepEqual(truthValues.flatMap((value, i) => value ? [i] : []), correct(q, slot), slot);
}
function visibleText(block: Block) {
  switch (block.type) {
    case 'paragraph': case 'code': return block.text;
    case 'table': return [block.caption, ...block.columns, ...block.rows.flat()].join('\n');
    case 'diagram': return block.alt;
    default: throw Error('Unexpected block: ' + block.type);
  }
}
function draw(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const scene = block.scene;
  const definition = figures.find(f => f.profile === scene.profile), renderer = renderers.find(f => f.profile === scene.profile);
  assert(definition && renderer);
  assert.equal(readBookletFigure(definition, scene.values), block.alt);
  return renderToStaticMarkup(createElement(renderer.component, { values: scene.values, caption: block.caption }));
}
function sourceDiagram(q: GeneratedBody, suffix: string, caption?: string) {
  const result = q.prompt.find(b => b.type === 'diagram' && b.scene.kind === 'source_figure' && b.scene.profile.endsWith(suffix) &&
    (caption === undefined || b.caption === caption));
  assert(result, suffix + ' ' + caption);
  return result;
}
function readRenderedWord(block: Block) {
  const output = draw(block);
  const bits = [...output.matchAll(/data-word-bit="(\d+|…)"[^>]*><text[^>]*>[^<]+<\/text><text[^>]*>([01]|…)<\/text>/g)];
  assert.deepEqual(bits.map(b => b[1]), ['31','30','29','28','27','26','25','24','23','22','21','20','19','18','17','…','0']);
  assert.equal(bits[15][2], '…');
  return bits.filter(b => b[1] !== '…').reduce((word, [_, position, digit]) => word + Number(digit) * 2 ** Number(position), 0);
}
type SourceWord = {sign:number; exponentBits:string; fractionBits:string};
const sourceWord = (value: SourceWord) => parseInt(String(value.sign) + value.exponentBits + value.fractionBits, 2);

test('原資料16頁・公式22行・全107選択肢を保持し、出典と23解答枠を照合する', () => {
  assert.deepEqual(figures.map(f => f.profile).sort(), renderers.map(r => r.profile).sort());
  for (const [i, spec] of specs.entries()) {
    const expected = official[i], d = spec.definition;
    assert.equal(d.source, review.source + '-' + expected.number);
    assert.deepEqual(spec.pages, expected.pages);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), expected.pages);
    assert(expected.pages.every(page => spec.originalPageAlt[page].length > 100));
    const base = spec.original;
    const actualKeys = base.partAnswers!.map(answer => answer.kind === 'unordered' ? {
      parts: answer.partIds.map(id => id.slice(5)),
      marks: correct(base, answer.partIds[0].slice(5)).map(j => marks[j]),
      kind: 'unordered-distinct',
    } : {
      parts: [answer.partId.slice(5)], marks: correct(base, answer.partId.slice(5)).map(j => marks[j]), kind: 'single',
    });
    assert.deepEqual(actualKeys, expected.officialKey);
    for (const field of expected.fields) {
      const expectedBank = expected.officialBanks[expected.bankIds.indexOf(field.bank)];
      const actual = bank(base, field.id);
      assert.equal(actual.length, expectedBank.length);
      for (const [j, choice] of actual.entries()) {
        const value = expectedBank[j];
        if (i === 1 && field.id === 'c') {
          assert.equal(readRenderedWord(first(choice)), sourceWord(value as SourceWord));
        } else if (i === 1 && field.id === 's1') {
          assert.equal(plain(choice), '(' + value + ')₁₆');
        } else if (i === 0 && field.id === 's3') {
          const block = first(choice);
          assert(block.type === 'table');
          assert.deepEqual(block.rows[0], value);
        } else if (i === 3 && field.id === 'b') {
          const block = first(choice);
          assert(block.type === 'table');
          assert.deepEqual(block.rows.map(([n]) => Number(n.slice(1, -1))), value);
        } else {
          const sep = i === 0 ? '，' : 'と';
          assert.equal(plain(choice), Array.isArray(value) ? value.join(sep) : String(value));
        }
      }
    }
    const original = Object.values(spec.originalPageAlt).join('\n');
    const variants = new Set<string>();
    for (let v = 0; v < expected.finiteConditions; v++) {
      const body = d.build([v]);
      const prompt = body.prompt.map(visibleText).join('\n');
      variants.add(prompt);
      for (const premise of expected.fixedPremises) {
        assert(original.includes(premise), '原資料 ' + premise);
        assert(prompt.includes(premise), '出題 ' + premise);
      }
      assert.deepEqual(body.answerParts, base.answerParts);
      assert(body.explanation.length > 150);
    }
    assert.equal(variants.size, expected.finiteConditions);
    assert.equal(d.fields[0].maximum + 1, expected.finiteConditions);
    const accessor = Object.defineProperty([0], '0', { get: () => 0 });
    const extra = Object.assign([0], { accidental: true });
    for (const input of [[], [NaN], [0.5], [-1], [expected.finiteConditions], [0, 1], new Array(1), accessor, extra]) {
      assert.throws(() => d.build(input), /PARAMETER_CONSTRAINT/);
    }
  }
});

type Log = { who:string; day:number; business:string; operation:'read'|'write'|'download'; amount:number };
function log(who: string, business: string, operation: Log['operation'], amount = 0, day = 1): Log {
  return { who, day, business, operation, amount };
}
function interleavedUpdates(logs: Log[]) {
  // Previous event for each application, including reads on a legal switch
  // back. Other employees' events do not interrupt this employee's sequence.
  const p = logs.filter(x => x.who === 'P');
  const last = new Map<string, number>();
  return p.some((row, i) => {
    const before = last.get(row.business);
    last.set(row.business, i);
    return row.operation === 'write' && before !== undefined && p[before].operation === 'write' && before + 1 < i;
  });
}
function dailyTotal(logs: Log[]) {
  return logs.filter(e => e.who === 'P' && e.day === 1 && e.operation === 'download').reduce((n, e) => n + e.amount, 0);
}

test('問1はログの意味・境界と二つの共有解答群を全12条件で検算する', () => {
  const limits = [5,3,4,6,7,8,9,10,11,12,13,14];
  const legal = [log('P','A','read'),log('P','A','write'),log('P','B','read'),log('P','B','write'),log('P','A','read'),log('P','A','write')];
  const broken = legal.filter((_, i) => i !== 4);
  assert(!interleavedUpdates(legal));
  assert(interleavedUpdates(broken));
  assert(!interleavedUpdates([log('P','A','write'),log('Q','B','write'),log('P','A','write')]));
  for (const [i, limit] of limits.entries()) {
    const body = specs[0].definition.build([i]), prompt = body.prompt.map(visibleText).join('\n');
    assert(prompt.includes('1日に' + limit + 'Mバイトを超えて'));
    truth(body, 'a', bankText(body, 'a').map(option => option.includes('時刻を同期')));
    truth(body, 'b', bankText(body, 'b').map(option => /電子署名|暗号化/.test(option)));
    truth(body, 'c', bankText(body, 'c').map(option => /電子署名|暗号化/.test(option)));
    truth(body, 's2', bankText(body, 's2').map(option => ['端末のIPアドレス','業務ID','社員ID'].every(key => option.includes(key))));
    truth(body, 's3', bank(body, 's3').map(choice => {
      const block = first(choice); assert(block.type === 'table');
      return block.rows[0].join('/') === '可/W';
    }));
    const network = draw(sourceDiagram(body, '-1-network'));
    assert.equal([...network.matchAll(/data-business-server=/g)].length, 4);
    const recipients = new Set([...network.matchAll(/data-log-route="(merge)"/g)].map(m => m[1]));
    truth(body, 's4', bankText(body, 's4').map(option => Number(option) === recipients.size));
    const below = [log('P','A','download',limit - 2),log('P','B','download',1)];
    const equal = [...below, log('P','C','download',1)];
    const above = [...equal, log('P','D','download',1)];
    const separate = [...equal, log('Q','D','download',1), log('P','D','download',1,2)];
    assert.deepEqual([below,equal,above,separate].map(dailyTotal), [limit - 1, limit, limit + 1, limit]);
    const decide = (option: string) => {
      if (option.includes('連続した“更新”')) return interleavedUpdates(broken) && !interleavedUpdates(legal);
      const threshold = option.match(/(\d+)Mバイトを超えた/);
      if (threshold) return dailyTotal(above) > Number(threshold[1]) && [below,equal,separate].every(logs => dailyTotal(logs) <= Number(threshold[1]));
      // A workday with only reads, a normal update after login, or an
      // employee away from an application for 15 minutes are legal.
      assert.match(option, /“参照”のログだけ|“更新”のログが1回以上|“参照”と“更新”のログが連続|15分間/);
      return false;
    };
    truth(body, 's5-first', bankText(body, 's5-first').map(decide));
    truth(body, 's5-second', bankText(body, 's5-second').map(decide));
    assert(body.explanation.includes(limit + 'Mバイト'));
    const q = {
      id: 'test-q1', answerParts: body.answerParts, correctAnswer: { parts:body.partAnswers, attribution },
      choices: body.choices.map((blocks, j) => ({id:'choice-value-' + (j + 1),content:{attribution,blocks}})),
    } as Question;
    const restored = JSON.parse(JSON.stringify(q)) as Question;
    validateAnswerDefinition(restored);
    const unordered = restored.correctAnswer.parts!.filter(a => a.kind === 'unordered');
    assert.equal(unordered.length, 2);
    const [bc, s5] = unordered;
    assert.notDeepEqual(bc.choiceIds, s5.choiceIds);
    for (const pair of unordered) {
      const [first, second] = pair.partIds;
      const part = restored.answerParts!.find(p => p.id === first)!;
      for (const x of part.choiceIds) for (const y of part.choiceIds) {
        const result = gradeAnswer(restored, {selectedPartChoices:{[first]:x,[second]:y}});
        const outcomes = result.parts!.filter(p => pair.partIds.includes(p.partId));
        assert.equal(outcomes.every(o => o.outcome === 'correct'), x !== y && pair.choiceIds.includes(x) && pair.choiceIds.includes(y));
      }
      const result = gradeAnswer(restored, {selectedPartChoices:{[first]:pair.choiceIds[0]}});
      assert.equal(result.parts!.find(p => p.partId === second)!.outcome, 'unanswered');
    }
  }
});

function decode(word: number) {
  const view = new DataView(new ArrayBuffer(4));
  view.setUint32(0, word, false);
  return view.getFloat32(0, false);
}
function encode(value: number) {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, value, false);
  return view.getUint32(0, false);
}
function binaryFraction(text: string) {
  const [whole, fraction = ''] = text.split('.');
  return parseInt(whole, 2) + (parseInt(fraction, 2) || 0) / 2 ** fraction.length;
}
test('問2の表示ビット列と全30択を独立した単精度デコーダで検算する', () => {
  const q = specs[1];
  const originalWords = official[1].originalPromptWords as SourceWord[];
  const samples = [0.625,1.25,1.5,0.75], shown = [0.75,1.5,0.375,0.5];
  const full = [5,4,3,6], scales = [10,5,6];
  for (let i = 0; i < 12; i++) {
    const body = q.definition.build([i]), prompt = body.prompt.map(visibleText).join('\n');
    const s1 = Number(/設問1 ([\d.]+)を単精度表現/.exec(prompt)?.[1]);
    assert.equal(s1, samples[i % 4]);
    truth(body, 's1', bankText(body, 's1').map(s => parseInt(s.slice(1, 3), 16) === (encode(s1) >>> 23)));
    const word = readRenderedWord(sourceDiagram(body, '-2-word', '設問2の単精度表現'));
    assert.equal(decode(word), shown[i % 4]);
    truth(body, 's2', bankText(body, 's2').map(n => Number(n) === decode(word)));
    const a = readRenderedWord(sourceDiagram(body, '-2-word', 'Aの単精度表現'));
    const b = readRenderedWord(sourceDiagram(body, '-2-word', 'Bの単精度表現'));
    if (i === 0) assert.deepEqual([word,a,b], originalWords.map(sourceWord));
    const exponent = full[i % 4];
    assert.equal(decode(a), 1.5 * 2 ** exponent);
    assert.equal(decode(b), -0.5 * decode(a));
    truth(body, 'a', bankText(body, 'a').map(n => binaryFraction(n) * 2 ** exponent === -decode(b)));
    truth(body, 'b', bankText(body, 'b').map(n => 1.5 * 2 ** Number(n) === decode(a) + decode(b)));
    const multiplier = Number(/設問3のAについてA×(\d+)の値/.exec(prompt)?.[1]);
    assert.equal(multiplier, scales[Math.floor(i / 4)]);
    const steps = [...prompt.matchAll(/[①②] A×(\d+)の値を/g)].map(m => Number(m[1]));
    assert.equal(steps[0] + steps[1], multiplier);
    assert(steps.every(n => Number.isInteger(Math.log2(n))));
    const wordChoices = bank(body, 'c').map(choice => readRenderedWord(first(choice)));
    const expected = encode(decode(a) * multiplier);
    assert.equal(new Set(wordChoices).size, 6);
    truth(body, 'c', wordChoices.map(candidate => candidate === expected));
    assert.equal(wordChoices[0] >>> 23, (expected >>> 23) - 127);
    assert.equal(wordChoices[4] >>> 23, (expected >>> 23) + 1);
    for (let j = 0; j < 6; j++) {
      assert.equal(readRenderedWord(sourceDiagram(body, '-2-word', marks[j])), wordChoices[j]);
      assert.equal(wordChoices[j] & 0x1fffe, 0);
    }
    assert(body.explanation.includes(String(decode(a) * multiplier)));
  }
  const format = draw(sourceDiagram(q.original, '-2-fields'));
  for (const key of ['符','号','部','指数部','8ビット','仮数部','23ビット']) assert(format.includes(key));
});

function dateShift(yyyymmdd: string, days: number) {
  const day = new Date(yyyymmdd.slice(0,4) + '-' + yyyymmdd.slice(4,6) + '-' + yyyymmdd.slice(6) + 'T00:00:00Z');
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0,10).replaceAll('-', '');
}

test('問3の表示SQLと全21択を12条件のSQLiteと関係の参照モデルで検算する', () => {
  const bounds = [['20150110','20150120','20150115'],['20160226','20160302','20160229'],
    ['20191229','20200102','20191231'],['20151103','20151109','20151106']];
  const products = [['007551','009220',80,400,400,3],['005183','009223',120,300,500,2],['002460','009224',90,200,450,4]] as const;
  for (let i = 0; i < 12; i++) {
    const body = specs[2].definition.build([i]), prompt = body.prompt.map(visibleText).join('\n');
    const [start,end,mid] = bounds[i % bounds.length];
    const [component,pkg,price,count,pkgPrice,perPackage] = products[Math.floor(i / bounds.length)];
    assert(prompt.includes('部品番号は“' + component + '”'));
    for (const date of [start,end]) {
      const label = Number(date.slice(0,4)) + '年' + Number(date.slice(4,6)) + '月' + Number(date.slice(6)) + '日';
      assert(prompt.includes(label) && body.explanation.includes(label));
    }
    const schema = draw(sourceDiagram(body, '-3-relations', '図1 表の構成とデータの格納例'));
    const packages = draw(sourceDiagram(body, '-3-relations', '図2 パッケージ表の構成とデータの格納例'));
    assert.equal([...schema.matchAll(/data-primary-key=/g)].length, 3);
    assert.equal([...packages.matchAll(/data-primary-key=/g)].length, 3);
    for (const value of [component,String(price),String(count),String(price * count),mid,'0059','000890']) assert(schema.includes('>' + value + '<'));
    for (const value of [pkg,component,String(pkgPrice),String(perPackage),'000058']) assert(packages.includes('>' + value + '<'));
    const queries = body.prompt.flatMap(b => b.type === 'code' && b.text.startsWith('SELECT ') ? [b.text] : []);
    assert.equal(queries.length, 3);
    assert(queries[0].includes("= '" + component + "'") && queries[1].includes('［b］ AND\n      ［a］'));
    assert(queries[2].includes('SELECT ［c］') && queries[2].includes('［b］ AND\n      ［a］'));
    const shipments = [
      ['before','0181',component,2,price*2,dateShift(start,-1)], ['start','0059',component,3,price*3,start],
      ['middle','0181',component,count,price*count,mid], ['end','0302',component,4,price*4,end],
      ['after','0059',component,5,price*5,dateShift(end,1)], ['unrelated','0302','000890',11,1100,end],
      ['pkg','0059',pkg,7,pkgPrice*7,mid], ['pkg-out','0181',pkg,8,pkgPrice*8,dateShift(end,1)],
      ['other-pkg','0302','009221',8,1600,mid],
    ] as const;
    const clients = new Map([['0181','A'],['0059','B'],['0302','C']]);
    const holding = [[pkg,'000058',1],[pkg,component,perPackage],['009221','000890',1]] as const;
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 顧客表(顧客番号 TEXT PRIMARY KEY, 顧客名 TEXT);' +
        'CREATE TABLE 出荷表(出荷番号 TEXT PRIMARY KEY, 顧客番号 TEXT, 部品番号 TEXT, 出荷数 INTEGER, 出荷金額 INTEGER, 出荷日 TEXT);' +
        'CREATE TABLE パッケージ表(部品番号 TEXT NOT NULL, 同梱部品 TEXT NOT NULL, 同梱点数 INTEGER, PRIMARY KEY(部品番号,同梱部品));' +
        'CREATE TABLE 回収表(回収番号 TEXT PRIMARY KEY, 対象出荷番号 TEXT, 回収日 TEXT, 再出荷番号 TEXT);');
      for (const [client,name] of clients) db.prepare('INSERT INTO 顧客表 VALUES (?,?)').run(client,name);
      for (const row of shipments) db.prepare('INSERT INTO 出荷表 VALUES (?,?,?,?,?,?)').run(...row);
      for (const row of holding) db.prepare('INSERT INTO パッケージ表 VALUES (?,?,?)').run(...row);
      assert.throws(() => db.prepare('INSERT INTO パッケージ表 VALUES (?,?,?)').run(...holding[0]));
      assert.throws(() => db.prepare('INSERT INTO パッケージ表 VALUES (?,?,?)').run(pkg,null,1));
      const inPeriod = (date: string) => date >= start && date <= end;
      const qualifying = (id: string) => id === component || holding.some(([owner,contained]) => owner === id && contained === component);
      const direct = shipments.filter(row => row[2] === component && inPeriod(row[5]));
      const all = shipments.filter(row => qualifying(row[2]) && inPeriod(row[5]));
      const expectedRows = (source: typeof direct) => source.map(([id,client,,n,,date]) => [client,clients.get(client),id,date,n]);
      const normalize = (rows: readonly unknown[][]) => rows.map(row => JSON.stringify(row)).sort().join('\n');
      const rows = (sql: string) => db.prepare(sql).all().map(row => Object.values(row));
      const translated = (candidate: string) => candidate.replace(/= ANY\s*\(SELECT /g, 'IN (SELECT ');
      const aBank = bankText(body, 'a'), bBank = bankText(body, 'b');
      truth(body, 'a', aBank.map((candidate, j) => {
        const query = queries[0].replace('［a］', candidate);
        if (j === 1) {
          assert.throws(() => rows(query), /syntax error|no such function/);
          assert.notEqual(normalize(rows(queries[0].replace('［a］', aBank[3]))), normalize(expectedRows(direct)));
          return false;
        }
        const selected = rows(query);
        assert.deepEqual(selected.map(row => row[0]), selected.map(row => row[0]).sort());
        return normalize(selected) === normalize(expectedRows(direct));
      }));
      truth(body, 'b', bBank.map(candidate => {
        const query = queries[1].replace('［a］', aBank[2]).replace('［b］', translated(candidate));
        return normalize(rows(query)) === normalize(expectedRows(all));
      }));
      truth(body, 'c', bankText(body,'c').map(candidate => {
        const query = queries[2].replace('［a］',aBank[2]).replace('［b］',translated(bBank[3])).replace('［c］',candidate);
        return rows(query)[0][0] === all.reduce((sum,row) => sum + row[4],0);
      }));
      const keys: Record<string,string> = { 顧客表:'顧客番号', 出荷表:'出荷番号', パッケージ表:'部品番号＋同梱部品', 部品表:'部品番号' };
      truth(body, 'd', bankText(body,'d').map(name => keys[name] === '出荷番号'));
      const tableFields: Record<string,string[]> = {
        顧客表:['顧客番号'], 出荷表:['出荷日','出荷金額','出荷番号'], パッケージ表:['部品番号','同梱部品'],
        部品表:['部品番号','単価'], 回収表:['対象出荷番号','回収日','再出荷番号'],
      };
      truth(body, 'e', bankText(body,'e').map(candidate => {
        const known = candidate.split('と').flatMap(name => tableFields[name]);
        return ['出荷金額','出荷日','出荷番号','対象出荷番号'].every(field => known.includes(field));
      }));
      db.prepare('INSERT INTO 回収表 VALUES (?,?,?,?)').run('r1','middle',end,'after');
      const month = mid.slice(0,6);
      const expected = shipments.filter(row => row[5].startsWith(month) && row[0] !== 'middle').reduce((n,row)=>n+row[4],0);
      const net = (field: string) => db.prepare('SELECT SUM(出荷金額) AS 合計 FROM 出荷表 WHERE SUBSTR(出荷日,1,6)=? AND NOT EXISTS ' +
        '(SELECT 1 FROM 回収表 WHERE 回収表.' + field + '=出荷表.出荷番号)').get(month)?.合計;
      assert.equal(net('対象出荷番号'), expected);
      assert.notEqual(net('再出荷番号'), expected);
    } finally {
      db.close();
    }
  }
});

function ancestor(domain: string, host: string) {
  const needle = domain.split('.').reverse(), actual = host.split('.').reverse();
  return needle.length <= actual.length && needle.every((label, i) => label === actual[i]);
}

test('問4はセッション・三方式・Cookieの受入と送信を全12条件の表示から独立に検算する', () => {
  const expected = [
    ['www.foo.example.com','www.bar.example.com',[1,2,3],[1]],
    ['www.foo.example.com','foo.example.com',[1,2,3],[1,2]],
    ['www.bar.example.com','orders.www.bar.example.com',[1,5],[1,5]],
    ['api.notfoo.example.com','orders.notfoo.example.com',[5],[5]],
    ['api.shop.example.org','shop.example.org',[4,5],[4,5]],
    ['api.foo.example.com','www.bar.example.com',[1,2],[1]],
    ['api.foo.example.com','www.foo.example.com',[1,2],[1,2]],
    ['foo.example.com','example.com',[1,2],[1]],
    ['www.example.com','www.foo.example.com',[1,4],[1]],
    ['www.foo.example.com','orders.foo.example.com',[1,2,4,5],[1,2]],
    ['shop.example.org','example.org',[1,4,5],[4,5]],
    ['store.api.notfoo.example.com','api.notfoo.example.com',[3,5],[5]],
  ] as const;
  const flow = draw(sourceDiagram(specs[3].original, '-4-purchase'));
  assert.deepEqual([...flow.matchAll(/data-purchase-node="([^"]+)"/g)].map(m=>m[1]),
    ['start','notice','before','login','after','pick','review','order','pay','logout','end']);
  for (const link of ['login-failure','login-success','after-loop','pick-after','order-pay-join','return','direct-logout']) {
    assert(flow.includes('data-purchase-link="' + link + '"'));
  }
  assert.match(flow, /data-purchase-link="return"[^>]*data-crossing="without-connection"/);
  const methodTable = draw(sourceDiagram(specs[3].original, '-4-methods'));
  assert.match(methodTable, /rowSpan="3" data-answer-blank="b">［b］/i);
  assert.equal([...methodTable.matchAll(/data-answer-blank=/g)].length, 1);
  for (const caption of specs[3].original.prompt.filter(b => b.type === 'diagram' && b.scene.kind === 'source_figure' && b.scene.profile.endsWith('-4-html'))) {
    const markup = draw(caption);
    assert.match(markup, /<u>セッションID<\/u>/);
    assert(!markup.includes('<a href') && !markup.includes('<input '));
  }
  assert(!ancestor('foo.example.com','notfoo.example.com'));
  assert(ancestor('foo.example.com','www.foo.example.com'));
  for (const [i, [origin, destination, acceptedNumbers, sentNumbers]] of expected.entries()) {
    const body = specs[3].definition.build([i]), prompt = body.prompt.map(visibleText).join('\n');
    const cookieScenario = prompt.split('\n').find(p => p.includes('クッキーを一つも管理していない'));
    assert(cookieScenario);
    assert.deepEqual([...cookieScenario.matchAll(/http:\/\/([^/]+)\/index.html/g)].map(m => m[1]), [origin,destination]);
    const t = body.prompt.find(block => block.type === 'table' && block.caption.startsWith('表1 クッキー'));
    assert(t?.type === 'table');
    assert.deepEqual(t.rows.map(r => r[0]), ['c1','c2','c3','c4','c5']);
    const accepted = t.rows.filter(([,domain]) => !['com','org'].includes(domain) && ancestor(domain,origin));
    const sent = accepted.filter(([,domain]) => ancestor(domain,destination));
    assert.deepEqual(accepted.map(([id])=>Number(id.slice(1))), [...acceptedNumbers]);
    assert.deepEqual(sent.map(([id])=>Number(id.slice(1))), [...sentNumbers]);
    truth(body, 'a', bankText(body,'a').map(s => s.includes('ログインに成功')));
    truth(body, 's2', bankText(body,'s2').map(s => s.includes('長いランダム')));
    const transports = new Map([[1,{address:false,browserOption:true,anchor:true}],[2,{address:true,browserOption:false,anchor:true}],
      [3,{address:false,browserOption:false,anchor:false}]]);
    truth(body, 'b', bank(body,'b').map(candidate => {
      const block = first(candidate); assert(block.type === 'table');
      const [a,b,c] = block.rows.map(([x]) => transports.get(Number(x.slice(1,-1)))!);
      return a.address && b.browserOption && !c.anchor;
    }));
    truth(body,'c',bankText(body,'c').map(n=>Number(n)===accepted.length));
    truth(body,'d',bankText(body,'d').map(ids=>ids.split('と').sort().join(' ')===sent.map(r=>r[0]).sort().join(' ')));
    for(const id of [origin,destination,...sent.map(r=>r[0])]) assert(body.explanation.includes(id));
  }
});

test('図の値の範囲・読み上げ・見える下線と網掛けを照合する', () => {
  for (const f of figures) {
    assert.throws(() => readBookletFigure(f, []), /図の値/);
    assert.throws(() => readBookletFigure(f, f.domain.map((pair,i) => i === 0 ? pair[1] + 1 : pair[0])), /図の値/);
  }
  const body = specs[0].original;
  const permission = draw(sourceDiagram(body, '-1-permissions'));
  assert.equal([...permission.matchAll(/omitted-cell/g)].length, 3);
  for (const key of ['［d1］','［d2］','Rは参照','Wは書込み']) assert(permission.includes(key));
  const notification = draw(sourceDiagram(body, '-1-underlined', 'ログ管理システムの要件（7）'));
  assert.match(notification, /<u>①ログ集積ファイルに書き込まれたログが一定条件<\/u>/);
  assert.match(draw(sourceDiagram(body, '-1-underlined', '設問5')), /<u>二つ<\/u>/);
});
