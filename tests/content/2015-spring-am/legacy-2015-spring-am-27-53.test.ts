import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readBookletFigure } from '../../../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2015SpringAm2753Definitions as definitions } from '../../../src/core/generators/legacy-2015-spring-am-27-53';
import { legacy2015SpringAm2753Figures as figures } from '../../../src/core/generators/legacy-2015-spring-am-27-53-figures';
import { legacy2015SpringAm2753Renderers as renderers } from '../../../src/ui/Legacy2015SpringAm2753Figures';

const originalKeys = 'アエイエエイウウイアイウアウイアイイイウウエウウウウイ';
const symbols = 'アイウエ';
const series = (n: number) => {
  const definition = definitions.find(item => item.source === '2015h27h-fe-am-' + n);
  assert(definition);
  return definition;
};
const each = (n: number, check: (body: GeneratedBody, input: number) => void) => {
  const definition = series(n);
  for (let input = 0; input <= definition.fields[0].maximum; input++) check(definition.build([input]), input);
};
const text = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
function options(body: GeneratedBody) {
  return body.choices.map(([block]) => {
    if (block.type === 'table') return block.rows[0].join('／');
    assert(block.type === 'paragraph');
    return block.text;
  });
}
function checkOptions(body: GeneratedBody, evaluate: (choice: string, index: number) => boolean) {
  const choices = options(body);
  assert.equal(new Set(choices).size, 4);
  assert.deepEqual(choices.flatMap((value, i) => evaluate(value, i) ? [i] : []), [body.correctIndex]);
}
function classify<T>(value: string, rows: readonly (readonly [RegExp, T])[]): T {
  const result = rows.filter(([pattern]) => pattern.test(value));
  assert.equal(result.length, 1, value);
  return result[0][1];
}
function verifyCategory<T>(body: GeneratedBody, goal: T, categories: readonly (readonly [RegExp, T])[]) {
  checkOptions(body, option => classify(option, categories) === goal);
}
const unique = (n: number, body: GeneratedBody, matches: number[]) =>
  assert.deepEqual(matches, [body.correctIndex], '問' + n + ' ' + text(body));
function promptTable(body: GeneratedBody, caption: string) {
  const block = body.prompt.find(item => item.type === 'table' && item.caption === caption);
  assert(block?.type === 'table');
  return block;
}
function diagram(body: GeneratedBody) {
  const block = body.prompt.find(item => item.type === 'diagram');
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  return { ...block, scene: block.scene };
}
function markup(body: GeneratedBody) {
  const block = diagram(body);
  const renderer = renderers.find(item => item.profile === block.scene.profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component, { values: block.scene.values, caption: block.caption }));
}

test('2015春午前の問27〜53は公式正答、全有限入力、四択、5図と描画の対応を保持する', () => {
  assert.deepEqual(definitions.map(def => Number(def.source.split('-').at(-1))), Array.from({ length: 27 }, (_, i) => i + 27));
  assert.equal(definitions.map(def => def.sourceAnswer).join(''), originalKeys);
  assert.equal(definitions.map(def => symbols[def.build(def.reference).correctIndex!]).join(''), originalKeys);
  assert.deepEqual(figures.map(fig => fig.profile), renderers.map(renderer => renderer.profile));
  let inputCount = 0;
  for (const definition of definitions) {
    const [field] = definition.fields;
    assert.equal(field.minimum, 0);
    assert(field.maximum >= 1);
    const seen = new Set();
    const number = Number(definition.source.split('-').at(-1));
    each(number, (body, input) => {
      inputCount++;
      assert.deepEqual(definition.build([input]), body);
      assert.equal(body.choices.length, 4);
      assert.equal(body.contexts, undefined);
      assert(body.explanation.length > 30);
      const questionCondition = JSON.stringify(body.prompt);
      assert(!seen.has(questionCondition), definition.source);
      seen.add(questionCondition);
      if (body.prompt.some(block => block.type === 'diagram')) {
        const block = diagram(body);
        const spec = figures.find(figure => figure.profile === block.scene.profile);
        assert(spec);
        assert.equal(readBookletFigure(spec, block.scene.values), block.alt);
        assert.match(markup(body), /<svg/);
      }
    });
    for (const invalid of [[], [-1], [field.maximum + 1], [NaN], [Infinity], [0.5], [0, 0]])
      assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(inputCount, 78);
});

test('問28の全択は勘定コードと同じ取引番号の貸借合計から求める', () => {
  each(28, body => {
    const target = text(body).match(/2015年4月4日に(.+?)勘定に計上/)?.[1];
    assert(target);
    const accounts = new Map(promptTable(body, '勘定').rows.map(([code, name]) => [code, name]));
    const movements = promptTable(body, '移動').rows;
    const [blankCode, blankSide, blankAmount, transaction] = movements[0];
    assert.deepEqual([blankCode, blankSide, blankAmount, transaction], ['a', 'b', '50,000', '0122']);
    assert.deepEqual(promptTable(body, '会計取引').rows, [['0122', '2015-04-04', 'A社'], ['0124', '2015-04-04', 'A社']]);
    const signed = (side: string, value: string) => Number(value.replaceAll(',', '')) * (side === '借方' ? 1 : -1);
    const subtotal = movements.slice(1).filter(row => row[3] === transaction)
      .reduce((total, [, side, value]) => total + signed(side, value), 0);
    checkOptions(body, choice => {
      const [code, side] = choice.split('／');
      assert(accounts.has(code) && ['借方', '貸方'].includes(side));
      return accounts.get(code) === target && subtotal + signed(side, blankAmount) === 0;
    });
    const html = markup(body);
    for (const marker of ['data-uml-association-class', 'data-uml-generalization', 'data-uml-note', '2..*', '一致すること'])
      assert(html.includes(marker), marker);
  });
});

test('問30の三段階を実行できるか、各処理の入力と出力の型で四択を検証する', () => {
  const transitions = new Map([
    ['構文解析', ['text', 'tree']], ['最適化', ['tree', 'plan']], ['コード生成', ['plan', 'bytecode']],
    ['実行コード検証', ['bytecode', 'verified']],
  ]);
  each(30, body => {
    const prepared = text(body).includes('構文解析済みの内部表現');
    assert.match(diagram(body).alt, /箱①，箱②，箱③，実行の箱/);
    assert.deepEqual([...markup(body).matchAll(/data-pipeline-node="([^"]+)"/g)].map(match => match[1]), ['①', '②', '③', '実行']);
    assert(markup(body).includes(prepared ? '解析済みの内部表現' : 'クエリ'));
    checkOptions(body, option => {
      let state = prepared ? 'tree' : 'text';
      for (const name of option.split('／')) {
        const transition = transitions.get(name);
        assert(transition, name);
        if (state !== transition[0]) return false;
        state = transition[1];
      }
      return state === (prepared ? 'verified' : 'bytecode');
    });
  });
});

test('問31の転送秒数と四択の間隔を整数の比で検算する', () => {
  each(31, body => {
    const source = text(body);
    const input = source.match(/(\d+) Mバイトのデータを([\d,]+) ビット／秒.*?伝送効率を(\d+)%/);
    assert(input);
    assert(source.includes('1 Mバイト＝10⁶バイト'));
    const size = BigInt(input[1]), rate = BigInt(input[2].replaceAll(',', '')), efficiency = BigInt(input[3]);
    const bitsByHundred = size * 8n * 1000000n * 100n;
    const values = options(body).map(value => BigInt(value.replaceAll(',', '')));
    assert(values.every((value, i) => value > 0n && (i === 0 || value === values[i - 1] * 2n)));
    checkOptions(body, value => BigInt(value.replaceAll(',', '')) * rate * efficiency === bitsByHundred);
  });
});

test('問36のIPv4四択をCIDRマスクで独立に分類する', () => {
  function binary(ip: string) {
    const octets = ip.split('.').map(Number);
    assert.equal(octets.length, 4);
    assert(octets.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
    return octets.reduce((value, octet) => (value << 8n) + BigInt(octet), 0n);
  }
  const privateRanges = [['10.0.0.0', 8], ['172.16.0.0', 12], ['192.168.0.0', 16]] as const;
  const otherSpecial = [['0.0.0.0', 8], ['100.64.0.0', 10], ['169.254.0.0', 16],
    ['192.0.0.0', 24], ['192.0.2.0', 24], ['198.18.0.0', 15], ['198.51.100.0', 24],
    ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]] as const;
  function contains(network: string, prefix: number, value: string) {
    const hostLength = BigInt(32 - prefix);
    return (binary(value) >> hostLength) === (binary(network) >> hostLength);
  }
  each(36, body => {
    const target = classify(text(body), [
      [/IPv4のグローバルIPアドレス/, 'global'],
      [/IPv4のプライベートIPアドレス/, 'private'],
      [/IPv4のループバックアドレス/, 'loopback'],
    ] as const);
    checkOptions(body, value => {
      const isPrivate = privateRanges.some(([network, prefix]) => contains(network, prefix, value));
      const isLoopback = contains('127.0.0.0', 8, value);
      if (target === 'private') return isPrivate;
      if (target === 'loopback') return isLoopback;
      return !isPrivate && !isLoopback && !otherSpecial.some(([network, prefix]) => contains(network, prefix, value));
    });
  });
});

test('問40の暗号化鍵は図の受信者・秘密鍵に対応する公開鍵を選ぶ', () => {
  each(40, body => {
    const transfer = text(body).match(/([AB])さんから([AB])さんへ/);
    assert(transfer && transfer[1] !== transfer[2]);
    const [, sender, recipient] = transfer;
    const displayed = markup(body);
    assert(displayed.includes(`${sender}さん`));
    assert(displayed.includes(`data-decryption-key="${recipient}さんの秘密鍵"`));
    assert.equal((displayed.match(/marker-end=/g) ?? []).length, 6);
    assert.match(displayed, /鍵Kによって暗号化/);
    assert.match(displayed, /ネットワーク/);
    checkOptions(body, value => value === `${recipient}さんの公開鍵`);
  });
});

test('問44は独立ビットの全割当てを列挙し、試行から必ず成立する択を求める', () => {
  const rights = ['読取り', '書込み', '実行'];
  const modes = [1, 2, 4].flatMap(a => [1, 2, 4].flatMap(b => [1, 2, 4].flatMap(c =>
    new Set([a, b, c]).size === 3 ? [[a, b, c]] : [])));
  const permitted = (mask: number, assignment: number[]) => rights.filter((_, i) => (mask & assignment[i]) !== 0);
  each(44, body => {
    const stem = text(body);
    assert.match(stem, /8進数表現0〜7/);
    assert.match(stem, /① 0を設定したら，読取り，書込み，実行ができなくなってしまった/);
    assert.match(stem, /③ 7を設定したら，読取り，書込み，実行ができるようになった/);
    const caseMatch = stem.match(/② (\d)を設定したら，(読取り|書込み|実行)と(読取り|書込み|実行)はできたが，(読取り|書込み|実行)ができなかった/);
    assert(caseMatch);
    const [, digits, first, second, excluded] = caseMatch;
    const fits = modes.filter(assignment => {
      const actual = permitted(Number(digits), assignment);
      return actual.length === 2 && actual.includes(first) && actual.includes(second) && !actual.includes(excluded);
    });
    assert.equal(fits.length, 2);
    checkOptions(body, option => {
      const entry = option.match(/^(\d)を設定すると，(.+?)ができる。$/);
      assert(entry);
      const expected = entry[2].replace('だけ', '').split('と');
      return fits.every(assignment => {
        const actual = permitted(Number(entry[1]), assignment);
        return expected.length === actual.length && expected.every(right => actual.includes(right));
      });
    });
  });
});

test('問49の原グラフと生成グラフを実際の描画座標で検算する', () => {
  each(49, body => {
    const html = markup(body);
    const d = html.match(/data-bug-curve="true" d="M(\d+) ([\d.]+)C(\d+) ([\d.]+) (\d+) ([\d.]+) (\d+) ([\d.]+)"/);
    assert(d);
    const [x0, y0, x1, y1, x2, y2, x3, y3] = d.slice(1).map(Number);
    assert.deepEqual([x0, x1, x2, x3], [177, 277, 377, 477]);
    assert.deepEqual([y0, y3], [219, 39]);
    assert(html.includes('M177 39h322M477 29v190'));
    const cumulative = (t: number) => y0 - ((1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3 * y3);
    const steps = [0, .25, .5, .75, 1].map(cumulative);
    const increments = steps.slice(1).map((value, i) => value - steps[i]);
    assert(increments.every(value => value > 0));
    const growth = increments.at(-1)! - increments[0];
    checkOptions(body, option => {
      if (option.includes('多くのバグが内在')) return growth > 1;
      if (option.includes('終盤ほど少なく')) return growth < -1;
      if (option.includes('おおむね同じ')) return Math.abs(growth) < 1;
      assert(/順調に終了|シミュレーションが十分|出荷後にバグが発生する確率が低い/.test(option));
      return false;
    });
  });
});

test('問50は表示された条件の全真偽組と網羅集合の最小数を独立に求める', () => {
  each(50, body => {
    const html = markup(body);
    const cond = html.match(/data-coverage-predicate="([^"]+)"/)?.[1];
    assert(cond);
    const predicate = cond.match(/^A(＞|≧)(\d) (かつ|又は) B(＝|≠)(\d)$/);
    assert(predicate);
    const [, compareA, aValue, operator, compareB, bValue] = predicate;
    const cases = new Map();
    for (let a = -2; a <= 6; a++) for (let b = -2; b <= 3; b++) {
      const first = compareA === '＞' ? a > Number(aValue) : a >= Number(aValue);
      const second = compareB === '＝' ? b === Number(bValue) : b !== Number(bValue);
      const branch = operator === 'かつ' ? first && second : first || second;
      cases.set(`${first}:${second}`, { first, second, branch });
    }
    assert.equal(cases.size, 4);
    assert.match(html, /data-branch="true".*data-branch="false".*X←X＋1/);
    const rows = [...cases.values()];
    const counts = new Map<string, number>();
    for (const method of options(body)) {
      const sets = Array.from({ length: 15 }, (_, index) => rows.filter((_, bit) => ((index + 1) & (1 << bit)) !== 0));
      const admitted = sets.filter(chosen => {
        if (method === '条件網羅') return new Set(chosen.map(row => row.first)).size === 2 && new Set(chosen.map(row => row.second)).size === 2;
        if (method === '判定条件網羅') return new Set(chosen.map(row => row.branch)).size === 2;
        if (method === '複数条件網羅') return chosen.length === cases.size;
        assert.equal(method, '命令網羅');
        return chosen.some(row => row.branch);
      });
      counts.set(method, Math.min(...admitted.map(chosen => chosen.length)));
    }
    assert.deepEqual(Object.fromEntries(counts), { 条件網羅: 2, 判定条件網羅: 2, 複数条件網羅: 4, 命令網羅: 1 });
    checkOptions(body, option => counts.get(option) === Math.max(...counts.values()));
  });
});

test('問27・29は通信経路と実際に適用する規約から各択の真偽を確かめる', () => {
  const effects = [[/クライアントとサーバの間/, 'network'], [/ファイルへのアクセス量/, 'file-read'],
    [/メモリ使用量/, 'memory'], [/格納領域/, 'disk']] as const;
  each(27, body => {
    const stem = text(body);
    assert.match(stem, /ストアドプロシージャ.*?利点/);
    const stages = stem.includes('全明細') ? [{ network: 200, storage: 200 }, { network: 1, storage: 200 }]
      : [{ network: 4, storage: 2 }, { network: 2, storage: 2 }];
    assert(stages[1].network < stages[0].network);
    assert.equal(stages[1].storage, stages[0].storage);
    verifyCategory(body, 'network', effects);
  });
  const issues = [[/日付型と文字列型が混在/, 'type'], [/取り得る値の範囲がテーブルによって異なる/, 'range'],
    [/同じ意味で.*ボーナス金額/, 'synonyms'], [/取引先コード.*取引先名.*判別できない/, 'suffix']] as const;
  each(29, body => {
    const stem = text(body);
    assert.match(stem, /命名規約だけでは回避できない/);
    const protection = {
      type: stem.includes('区分語ごとに定めたデータ型にする'),
      range: /定めた値域にする|取り得る値の範囲を定め/.test(stem),
      synonyms: stem.includes('異音同義語や同音異義語が発生しない'),
      suffix: stem.includes('区分語を付与'),
    };
    checkOptions(body, option => !protection[classify(option, issues)]);
  });
});

test('問32〜35の通信動作・装置・IPの幅・規格の全選択肢を独立対応表で検証する', () => {
  each(32, body => {
    const method = classify(text(body), [[/CSMA\/CD/, 'collision'], [/CSMA\/CA/, 'avoid'], [/TDMA/, 'slot']] as const);
    verifyCategory(body, method, [
      [/論理的な順位付け/, 'logic-token'], [/衝突を検出/, 'collision'], [/衝突の可能性を下げ/, 'avoid'],
      [/特殊なフレームを巡回/, 'ring-token'], [/タイムスロットを割り当て/, 'slot'],
    ] as const);
  });
  each(33, body => {
    const anchor = text(body);
    assert.match(anchor, /LAN間接続装置に関する記述/);
    const need = anchor.includes('中継したい') ? anchor.includes('宛先MAC') ? 'frame' : 'packet' : 'general';
    const trueClaims = new Map([
      ['ブリッジ', { kind: 'frame', tests: [/宛先MACアドレス/, /フレームを中継/] }],
      ['リピータ', { kind: 'signal', tests: [/信号を増幅/, /伝送距離を延長/] }],
      ['ルータ', { kind: 'packet', tests: [/宛先IPアドレス/, /パケットの経路/] }],
    ]);
    checkOptions(body, option => {
      const device = option.split('は，')[0];
      if (device === 'ゲートウェイ') {
        assert.match(option, /第1〜3層だけ/);
        return false;
      }
      const row = trueClaims.get(device);
      assert(row, device);
      return (need === 'general' || row.kind === need) && row.tests.every(pattern => pattern.test(option));
    });
  });
  each(34, body => {
    const version = classify(text(body), [[/IPv4/, '10.17.52.82'], [/IPv6/, '2001:0db8:0010:0000:0000:0000:009a:0001']]);
    const split = version.includes(':') ? version.split(':').map(() => 16) : version.split('.').map(() => 8);
    const bits = split.reduce((total, value) => total + value, 0);
    assert.deepEqual(options(body), ['32', '64', '128', '256']);
    checkOptions(body, choice => Number(choice) === bits);
  });
  each(35, body => {
    const role = classify(text(body), [
      [/添付/, 'attachment'], [/静止画像/, 'still'], [/動画/, 'motion'], [/転送/, 'delivery'],
    ] as const);
    verifyCategory(body, role, [[/^JPEG$/, 'still'], [/^MIME$/, 'attachment'], [/^MPEG$/, 'motion'], [/^SMTP$/, 'delivery']] as const);
  });
});

test('問37〜39の操作の場所・署名目的・暗号鍵の関係を選択肢ごとに検証する', () => {
  each(37, body => {
    const mechanism = classify(text(body), [[/キーロガー/, 'keystroke'], [/中間者/, 'relay'], [/アドウェア/, 'advertising']] as const);
    verifyCategory(body, mechanism, [
      [/2者間の経路上/, 'relay'], [/パスワードを収集/, 'keystroke'], [/広告を勝手に表示/, 'advertising'], [/ツールバー/, 'toolbar'],
    ] as const);
  });
  each(38, body => {
    const verifies = text(body).includes('検証鍵の用い方');
    assert.match(text(body), /署名/);
    checkOptions(body, option => {
      if (verifies && /送信者に対応する検証鍵.*受信したメッセージ.*署名を検証.*完全性/.test(option)) return true;
      if (!verifies && /送信者が署名鍵を使って署名を作成.*受信者が送信者を確認/.test(option)) return true;
      assert.match(option, /復号|元のメッセージ|改ざん部位|改ざんされたかを特定|分からないようにする/);
      return false;
    });
  });
  each(39, body => {
    const stem = text(body);
    const relation = classify(stem, [[/同じ鍵/, 'symmetric'], [/異なる鍵/, 'asymmetric']] as const);
    if (relation === 'asymmetric') assert.match(stem, /方式が処理できる長さの範囲内/);
    verifyCategory(body, relation, [
      [/^AES$/, 'symmetric'], [/^PKI$/, 'infrastructure'], [/^RSA$/, 'asymmetric'], [/^SHA-256$/, 'hash'],
    ] as const);
  });
});

test('問41〜43の生体特徴・攻撃先・ファイル改ざん検知を全択で確認する', () => {
  each(41, body => {
    const type = classify(text(body), [[/行動的特徴を用いている/, 'action'], [/身体的特徴を用いている/, 'physical']] as const);
    verifyCategory(body, type, [
      [/血管の分岐点|瞳孔から外側|マニューシャ/, 'physical'], [/筆圧|キー間の時間|関節の動く順序/, 'action'],
    ] as const);
  });
  each(42, body => {
    const behavior = classify(text(body), [
      [/SQLインジェクション/, 'sql'], [/クロスサイトリクエストフォージェリ/, 'request'],
      [/ネットワークワーム/, 'worm'], [/クロスサイトスクリプティング/, 'script'],
    ] as const);
    verifyCategory(body, behavior, [
      [/データベースのデータを不正に取得/, 'sql'], [/その訪問者が意図しない操作/, 'request'],
      [/自己感染を繰り返し/, 'worm'], [/訪問者のブラウザで実行/, 'script'],
    ] as const);
  });
  const oldFile = { content: 'hello', mtime: 7, memory: 52, protocol: 'HTTPS' };
  const modified = { ...oldFile, content: 'jello' };
  const digest = (value: string) => createHash('sha256').update(value).digest('hex');
  each(43, body => {
    assert.match(text(body), /コンテンツの改ざんを検知する方法.*最も有効/);
    const signal = {
      mtime: modified.mtime !== oldFile.mtime, memory: modified.memory !== oldFile.memory,
      protocol: modified.protocol !== oldFile.protocol, content: digest(modified.content) !== digest(oldFile.content),
    };
    checkOptions(body, option => signal[classify(option, [
      [/更新日を保管/, 'mtime'], [/ハッシュ値を保管/, 'content'], [/メモリ使用率/, 'memory'], [/以外の通信がない/, 'protocol'],
    ] as const)]);
  });
});

test('問45〜48の証明書主体・確認手法・図法・is-a関係を四択で判定する', () => {
  each(45, body => {
    const subject = text(body).includes('利用者に発行した') ? 'user' : 'device';
    assert.match(text(body), /ディジタル証明書/);
    verifyCategory(body, subject, [
      [/ウイルスに感染/, 'virus'], [/許可されたデバイス/, 'device'],
      [/対応する利用者が.*アクセスを許可/, 'user'], [/セキュリティパッチ/, 'patch'], [/アプリケーションが最新/, 'app'],
    ] as const);
  });
  each(46, body => {
    const task = classify(text(body), [
      [/実際に攻撃して侵入/, 'intrusion'], [/作成者が設計書.*説明/, 'author'],
      [/レビュー責任者.*役割/, 'formal'], [/以前の試験を再実行/, 'retest'],
    ] as const);
    verifyCategory(body, task, [
      [/^ウォークスルー$/, 'author'], [/^ソフトウェアインスペクション$/, 'formal'],
      [/^ペネトレーションテスト$/, 'intrusion'], [/^リグレッションテスト$/, 'retest'],
    ] as const);
  });
  each(47, body => {
    const kind = classify(text(body), [
      [/UMLのクラス図/, 'class'], [/状態遷移図/, 'state'], [/E-R図/, 'entity'], [/DFD/, 'flow'],
    ] as const);
    verifyCategory(body, kind, [
      [/オブジェクト指向モデル/, 'class'], [/状態が変化/, 'state'], [/実体と関連/, 'entity'], [/データの流れ/, 'flow'],
    ] as const);
  });
  const relations: Record<string, Record<string, string>> = {
    自動車: { エンジン: 'part', 製造番号: 'attribute', タイヤ: 'part', トラック: 'subtype' },
    自転車: { ブレーキ: 'part', 車体番号: 'attribute', チェーン: 'part', 折り畳み自転車: 'subtype' },
    プリンタ: { 用紙トレイ: 'part', 製造番号: 'attribute', 給紙ローラ: 'part', レーザプリンタ: 'subtype' },
  };
  each(48, body => {
    const subject = text(body).match(/“(.+?)”のサブクラス/)?.[1];
    assert(subject && relations[subject]);
    checkOptions(body, option => {
      assert(relations[subject][option], option);
      return relations[subject][option] === 'subtype';
    });
  });
});

test('問51〜53は開発・管理で実施する活動と関係者を全択で照合する', () => {
  each(51, body => {
    const activity = classify(text(body), [
      [/実践することが提唱/, 'pair'], [/実装前に失敗するテスト/, 'test-first'], [/共有のコードへ取り込み/, 'integration'],
    ] as const);
    verifyCategory(body, activity, [
      [/^ペアプログラミング$/, 'pair'], [/^テストファースト$/, 'test-first'], [/^継続的インテグレーション$/, 'integration'],
      [/構造化設計/, 'design'], [/テストツール/, 'tool'], [/ユースケース/, 'use-case'],
    ] as const);
  });
  each(52, body => {
    const relation = classify(text(body), [[/倉庫の移転/, 'external'], [/業務システムの導入/, 'indirect'],
      [/^プロジェクトに関わる/, 'mixed-effect']] as const);
    checkOptions(body, option => {
      const statement = classify(option, [
        [/外部にいることはない|成果の影響を受けなくても必ず/, 'only-internal'],
        [/間接的な関与にとどまることはない/, 'only-direct'], [/個人として特定できることが必要/, 'only-individual'],
        [/利益が増える関係者に限り|変更を歓迎する者だけ/, 'only-benefits'],
        [/利益になる者と不利益になる者/, 'mixed-effect'],
        [/組織外部の委託先や近隣住民も.*影響を受ける/, 'external'],
        [/開発に参加しない利用部門も.*影響を受ける/, 'indirect'],
      ] as const);
      return statement === relation;
    });
  });
  each(53, body => {
    const process = classify(text(body), [
      [/WBS作成/, 'breakdown'], [/コスト見積り/, 'cost'], [/スケジュールを作成/, 'schedule'], [/アクティビティ定義/, 'activities'],
    ] as const);
    verifyCategory(body, process, [
      [/コストを見積もる/, 'cost'], [/階層的に細分化/, 'breakdown'],
      [/スケジュールとして組み立てる/, 'schedule'], [/アクティビティを定義|活動の一覧/, 'activities'],
    ] as const);
  });
});
