import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Block } from '../../../src/core/types';
import { readBookletFigure } from '../../../src/core/booklet-figure-extension-contract';
import { spring2015Pm01To04Specs as specs } from '../../../scripts/legacy-2015-spring-pm-01-04-specs';
import { legacy2015SpringPm0104Figures as figures } from '../../../src/core/generators/legacy-2015-spring-pm-01-04-figures';
import { legacy2015SpringPm0104FigureRenderers as renderers } from '../../../src/ui/Legacy2015SpringPm0104Figures';
import review from '../../fixtures/legacy-2015-spring-pm-01-04-review.json';

const marks = 'アイウエオカキク';
const blockText = (block: Block) => block.type === 'paragraph' || block.type === 'code' ? block.text :
  block.type === 'diagram' ? block.alt : block.type === 'table' ? block.rows.flat().join(' ') : '';
const stem = (body: GeneratedBody) => body.prompt.map(blockText).join('\n');
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

function parts(body: GeneratedBody) {
  assert(body.answerParts && body.partAnswers);
  return body.answerParts.map((part, i) => {
    const answer = body.partAnswers?.[i];
    assert(answer?.kind === 'choice');
    assert.equal(answer.partId, part.id);
    const options = part.choiceIds.map(id => {
      const match = /^choice-value-(\d+)$/.exec(id);
      assert(match);
      return body.choices[Number(match[1]) - 1].map(blockText).join('\n');
    });
    return { options, key: part.choiceIds.indexOf(answer.choiceId) };
  });
}

function verify(field: ReturnType<typeof parts>[number], satisfied: boolean[]) {
  assert.equal(satisfied.length, field.options.length);
  assert.deepEqual(satisfied.flatMap((value, index) => value ? [index] : []), [field.key]);
}
const all = (number: number) => {
  const def = specs[number - 1].definition;
  return Array.from({ length: def.fields[0].maximum + 1 }, (_, i) => def.build([i]));
};

test('原冊子16頁、18枠、延べ88択の原順、12可変条件と管理図を確認する', () => {
  assert.deepEqual(figures.map(f => f.profile), renderers.map(r => r.profile));
  const seen = new Set<string>();
  let slots = 0, options = 0, conditions = 0;
  for (const [i, spec] of specs.entries()) {
    const audit = review.questions[i];
    assert.equal(spec.definition.source, '2015h27h-fe-pm-' + (i + 1));
    assert.deepEqual(spec.pages, audit.physicalPages);
    assert.deepEqual(audit.printedPages.map(n => n+1), spec.pages);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), spec.pages);
    assert(Object.values(spec.originalPageAlt).every(s => s.length > 300 && !s.includes('choice-value-')));
    const expected = parts(spec.original);
    assert.deepEqual(expected.map(f => marks[f.key]), audit.keys);
    assert.deepEqual(expected.map(f => hash(f.options)), audit.bankSha256);
    slots += expected.length; options += expected.reduce((n, f) => n + f.options.length, 0);
    const instances = all(i + 1);
    assert.equal(instances.length, audit.cases);
    conditions += instances.length;
    assert.equal(new Set(instances.map(stem)).size, instances.length);
    const shape = (body: GeneratedBody) => [body.prompt.map(block => block.type), body.choices.map(c => c.map(b => b.type))];
    for (const instance of instances) {
      assert.deepEqual(shape(instance), shape(spec.original));
      for (const [part, f] of parts(instance).entries()) {
        assert.equal(f.options.length, expected[part].options.length);
        assert.equal(new Set(f.options).size, f.options.length);
      }
      for (const block of instance.prompt) {
        if (block.type !== 'diagram') continue;
        assert(block.scene.kind === 'source_figure');
        const scene = block.scene, figure = figures.find(f => f.profile === scene.profile);
        const renderer = renderers.find(r => r.profile === scene.profile);
        assert(figure && renderer);
        assert.equal(readBookletFigure(figure, scene.values), block.alt);
        if (seen.has(scene.profile)) continue;
        const svg = renderToStaticMarkup(createElement(renderer.component, {values: scene.values, caption: block.caption}));
        assert.match(svg, /<svg[^>]+viewBox=/);
        assert.match(svg, /<desc[^>]*>/);
        assert.match(svg, /aria-describedby=/);
        assert.match(svg, /var\(--image-scale, 1\)/);
        assert.match(svg, /var\(--diagram-ink\)/);
        seen.add(scene.profile);
      }
      assert(instance.explanation.length > 100);
    }
    for (const values of [[],[-1],[instances.length],[0.5],[NaN],[0,1],Array(1),Object.assign([0],{extra:true}),
      Object.defineProperty([0],'0',{get:()=>0})]) {
      assert.throws(() => spec.definition.build(values), /PARAMETER_CONSTRAINT/);
    }
  }
  assert.equal(slots, 18);
  assert.equal(options, 88);
  assert.equal(conditions, 12);
  assert.equal(seen.size, 9);
});

test('問1はTLS経路の集合、攻撃の実行対象、ファイル境界と連続試行を全択で検算する', () => {
  const walk = ['取引先PC','FW3','FW1','RPS','FW1','FW2','Webサーバ'];
  const attacks = new Map([
    ['DoS攻撃','availability'],['SQLインジェクション','db-code'],['クロスサイトスクリプティング','browser-code'],
    ['辞書攻撃','word-list'],['ディレクトリトラバーサル','path-escape'],['トラッシング','discarded-info'],
    ['ブルートフォース攻撃','repeated-passwords'],['ポートスキャン','port-survey'],
  ]);
  for (const body of all(1)) {
    const p = stem(body), [route,a,b,download,incident] = parts(body);
    const routes = body.prompt.find(block => block.type === 'table');
    assert(routes?.type === 'table');
    const limit = p.includes('FW3で終端') ? 1 : p.includes('別のHTTPS接続') ? walk.length - 1 : walk.indexOf('RPS');
    const protectedNumbers = new Set(walk.slice(0,limit).map((name,i) => {
      const next = walk[i+1];
      return routes.rows.find(([, text]) => text.includes(name) && text.includes(next))?.[0];
    }));
    assert(!protectedNumbers.has(undefined));
    verify(route, route.options.map(choice => {
      const numbers = choice.split('，');
      return numbers.length === protectedNumbers.size && numbers.every(n=>protectedNumbers.has(n));
    }));
    assert(p.includes('想定していない操作をDBサーバに実行') && p.includes('Webページ内にスクリプト'));
    assert(a.options.every(text=>attacks.has(text)) && b.options.every(text=>attacks.has(text)));
    verify(a, a.options.map(text => attacks.get(text) === 'db-code'));
    verify(b, b.options.map(text => attacks.get(text) === 'browser-code'));
    const root = '/a/', files = ['/a/order.csv','/b/order.csv','/config'];
    const requests = ['order.csv','../b/order.csv','/config'];
    verify(download, download.options.map(text => {
      const visibleAll = text.includes('全てのフォルダ構成');
      if (visibleAll) return false;
      const downloadPaths = requests.map(input => {
        if (text.includes('絶対パス')) return input.startsWith('/') ? input : '';
        if (text.includes('相対パス')) return input.startsWith('/') ? '' : new URL(input, 'https://local.invalid' + root).pathname;
        return input.includes('/') ? '' : root + input;
      }).filter(path=>files.includes(path));
      return downloadPaths.length === 1 && downloadPaths[0] === root + 'order.csv';
    }));
    assert(p.includes('連続して間違えても利用者IDがロックされない'));
    verify(incident, incident.options.map(text => text.includes('候補を自動で次々と')));
  }
});

test('問2は表示された条件を読み、全呼出しをナノ秒で追跡して6択を検算する', () => {
  for (const body of all(2)) {
    const p = stem(body), [compiler,portable,b,c] = parts(body);
    const read = (pattern: RegExp) => {
      const match = pattern.exec(p);
      assert(match, String(pattern));
      return Number(match[1].replaceAll(',',''));
    };
    const calls = read(/呼出し回数が([\d,]+)回/), at = read(/関数Fが(\d+)回目/);
    const staticCount = read(/中間コードは([\d,]+)命令/), dynamicCount = read(/命令数は，([\d,]+)命令/);
    const nsSlow = read(/実行時間は(\d+)ナノ秒とし/), nsFast = read(/実行時間は(\d+)ナノ秒とする/);
    const boot = BigInt(Math.round(read(/起動時間は([\d.]+)秒/) * 1e9));
    const compile = BigInt(Math.round(read(/1,000命令当たりで([\d.]+)秒/) * 1e9));
    let slow = 0n, dynamic = 0n;
    for (let call=1; call<=calls; call++) {
      slow += BigInt(dynamicCount * nsSlow);
      if (call === at) dynamic += boot + BigInt(staticCount) * compile / 1000n;
      dynamic += BigInt(dynamicCount * (call < at ? nsSlow : nsFast));
    }
    verify(b, b.options.map(option=>BigInt(Math.round(Number(option)*1e9))===slow));
    verify(c, c.options.map(option=>BigInt(Math.round(Number(option)*1e9))===dynamic));
    assert(b.options.every((v,i,a) => i===0 || Number(a[i-1])<Number(v)));
    assert.equal(b.options[c.key], c.options[c.key]);
    assert(p.includes('主プログラムの実行時間は考えない') && p.includes('起動時間とコンパイル時間は，実行時間に含める'));
    assert(body.explanation.includes(b.options[b.key] + '秒') && body.explanation.includes(c.options[c.key] + '秒'));
    verify(compiler, compiler.options.map(text => text.includes('目的とする計算機に対応して') && text.includes('最適化')));
    verify(portable, portable.options.map(text => text.endsWith('依存しない')));
  }
});

const sqlDate = (n: number, shift: number) => {
  const text = String(n);
  const date = new Date(Date.UTC(Number(text.slice(0,4)), Number(text.slice(4,6))-1, Number(text.slice(6))+shift));
  return Number(date.toISOString().slice(0,10).replaceAll('-',''));
};
const valuesSorted = (rows: unknown[][]) => rows.map(row=>JSON.stringify(row)).sort();
test('問3は正規化と三組のSQLを、別解法・SQLite・境界と重複のデータで全択確認する', () => {
  for (const body of all(3)) {
    const [a,b,older,counts,view] = parts(body), p = stem(body);
    const boundary = Number(/(\d{4})年よりも前/.exec(p)?.[1] + '0101');
    const dates = /生年月日が(\d{8})〜(\d{8})/.exec(p);
    assert(dates && Number.isSafeInteger(boundary));
    const from = Number(dates[1]), to = Number(dates[2]);
    const members: [string,string,string,number][] = [
      ['001','01','A',sqlDate(boundary,-2)],['002','01','B',sqlDate(boundary,-1)],
      ['003','02','C',boundary],['004','03','D',sqlDate(boundary,1)],
      ['005','03','E',sqlDate(from,-1)],['006','01','F',from],
      ['007','02','G',20040613],['008','01','H',to],['009','03','I',sqlDate(to,1)],
    ];
    const households = [['01','001','phone1','01'], ['02','003','phone2','01'], ['03','004','phone3','02']];
    const byHousehold = new Map(households.map(row => [row[0],row]));
    const olderExpected = valuesSorted([...new Set(members.filter(m=>m[3]<boundary).map(m=>m[1]))].map(h=>[h]));
    const countsExpected = valuesSorted(['01','02'].map(group => {
      const inGroup = members.filter(m=>byHousehold.get(m[1])?.[3]===group);
      return [group,new Set(inGroup.map(m=>m[1])).size,inGroup.length];
    }));
    const viewExpected = valuesSorted(members.filter(m=>from<=m[3] && m[3]<=to)
      .map(m=>[m[0],m[1],byHousehold.get(m[1])?.[2],m[2],m[3]]));
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 世帯表 (世帯番号 TEXT PRIMARY KEY, 世帯主番号 TEXT, 電話番号 TEXT, 班 TEXT);' +
        'CREATE TABLE 会員表 (会員番号 TEXT PRIMARY KEY, 世帯番号 TEXT, 氏名 TEXT, 生年月日 INTEGER);');
      for (const h of households) db.prepare('INSERT INTO 世帯表 VALUES (?,?,?,?)').run(...h);
      for (const m of members) db.prepare('INSERT INTO 会員表 VALUES (?,?,?,?)').run(...m);
      const actual = (sql: string) => {
        const statement = db.prepare(sql.replace(/= ANY\(/g,'IN ('));
        // Column names can repeat in distractors, so preserve column position.
        (statement as typeof statement & { setReturnArrays(value: boolean): void }).setReturnArrays(true);
        return valuesSorted(statement.all() as unknown as unknown[][]);
      };
      const countFrame = body.prompt.find(block=>block.type==='code' && block.text.includes('［c］'));
      const viewFrame = body.prompt.find(block=>block.type==='code' && block.text.includes('［d］'));
      assert(countFrame?.type==='code' && viewFrame?.type==='code');
      verify(older, older.options.map(sql => JSON.stringify(actual(sql)) === JSON.stringify(olderExpected)));
      verify(counts, counts.options.map(sql => JSON.stringify(actual(countFrame.text.replace('［c］',sql))) === JSON.stringify(countsExpected)));
      verify(view, view.options.map(sql => {
        db.exec(viewFrame.text.replace('［d］',sql).replace(/= ANY\(/g,'IN ('));
        const match = JSON.stringify(actual('SELECT * FROM 子供会表')) === JSON.stringify(viewExpected);
        db.exec('DROP VIEW 子供会表');
        return match;
      }));
    } finally { db.close(); }
    const concepts = new Map([
      ['障害回復のために','recovery'], ['第1正規化に基づいて','atomic-values'],
      ['第2正規化に基づいて','partial-dependency'], ['第3正規化に基づいて','transitive-dependency'],
      ['排他制御のために','locking'],
    ]);
    assert(p.includes('帳票は非正規形') && p.includes('同じ意味を表すデータに対する定義の一意性'));
    assert(a.options.every(text=>concepts.has(text)) && b.options.every(text=>concepts.has(text)));
    verify(a, a.options.map(text=>concepts.get(text)==='atomic-values'));
    verify(b, b.options.map(text=>concepts.get(text)==='transitive-dependency'));
  }
});

test('問4は直接照会・補完・公開優先の遷移、事故と対策3択を検算する', () => {
  for (const body of all(4)) {
    const p = stem(body), [a,b,c,mitigation] = parts(body);
    const forwardFirst = p.includes('参照する前に外部のDNSサーバへ転送');
    const publicShort = !p.includes('外部DNSには“www.bunkyo”の登録がない');
    const privateHosts = new Set(['www.bunkyo.example.co.jp','www.corp']);
    const publicHosts = new Set([publicShort?'www.bunkyo':'portal.bunkyo','www.corp']);
    const resolve = (label: string) => {
      const tried: string[] = [];
      for (const query of [label,label+'.example.co.jp']) {
        tried.push(query);
        const order = forwardFirst && query.endsWith('.corp') ? ['public','private'] : ['private','public'];
        for (const side of order) {
          if ((side==='private'?privateHosts:publicHosts).has(query)) return {side, query, tried};
        }
      }
      return {side:'not-found', query:label, tried};
    };
    const short = resolve('www.bunkyo'), corp = resolve('www.corp');
    assert.equal(short.tried.length, publicShort?1:2);
    verify(a, a.options.map(text =>
      short.side==='private' ? text.includes('A社内のホスト') && text.includes(short.query) :
      short.side==='public' ? text.includes('インターネット上') && text.includes(short.query) : text.includes('エラー')));
    assert(corp.tried.length===1 && corp.query==='www.corp');
    verify(b, b.options.map(text =>
      corp.side==='private' ? text.startsWith('インターネット上の') : text.startsWith('A社内のホスト') && !text.includes('及び')));
    verify(c, c.options.map(text=>text.includes('外部サーバに意図せず')));
    assert(p.includes('適切でない答え'));
    const mitigations = new Map([
      ['各組織独自のTLDの利用を停止する。',{privateSuffix:false, search:true, external:true}],
      ['各組織は，自組織のDNSサーバと外部のDNSサーバとの通信を遮断する。',{privateSuffix:true, search:true, external:false}],
      ['各端末でサーチリストの利用をやめる。',{privateSuffix:true, search:false, external:true}],
    ]);
    verify(mitigation, mitigation.options.map(text=>{
      const effect = mitigations.get(text);
      assert(effect);
      const removesCollisionSource = !effect.privateSuffix || !effect.search;
      return !effect.external || !removesCollisionSource;
    }));
  }
});
