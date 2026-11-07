import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2015SpringAm5480Definitions as definitions } from '../src/core/generators/legacy-2015-spring-am-54-80';
import { legacy2015SpringAm5480Figures } from '../src/core/generators/legacy-2015-spring-am-54-80-figures';
import { legacy2015SpringAm5480Renderers } from '../src/ui/Legacy2015SpringAm5480Figures';
import review from './fixtures/legacy-2015-spring-am-54-80-review.json';

const definition = (question: number) => definitions.find(item => item.source === '2015h27h-fe-am-' + question)!;
const maximum = (question: number) => definition(question).fields[0].maximum;
const item = (question: number, index: number) => definition(question).build([index]);
type Body = ReturnType<typeof item>;
const stem = (body: Body) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const options = (body: Body) => body.choices.map(choice => {
  assert.equal(choice.length, 1);
  const block = choice[0];
  assert.equal(block.type, 'paragraph');
  return block.text;
});
const graph = [
  ['start', 'first', 'A'], ['first', 'second', 'B'], ['first', 'below', 'E'], ['below', 'second', '-'],
  ['second', 'third', 'C'], ['second', 'above', 'G'], ['above', 'third', '-'],
  ['first', 'third', 'F'], ['third', 'fourth', 'D'], ['second', 'fourth', 'H'], ['fourth', 'end', 'I'],
] as const;

test('2015春 午前54〜80の掲載候補24問と101入力の原文・四択・公式キーを照合する', () => {
  assert.deepEqual(definitions.map(value => Number(value.source.split('-').at(-1))), review.questions.map(value => value.number));
  for (const held of review.holds) assert.equal(definitions.some(value => value.source.endsWith('-' + held)), false);
  let cases = 0;
  for (const { number, key, statementHash } of review.questions) {
    const authored = definition(number), original = item(number, 0);
    assert.equal(authored.sourceAnswer, key);
    assert.equal('アイウエ'[original.correctIndex!], key);
    assert.deepEqual(authored.reference, [0]);
    const actual = createHash('sha256').update(JSON.stringify([stem(original), options(original)])).digest('hex');
    assert.equal(actual, statementHash, 'reference must preserve source wording Q' + number);
    const prompts = new Set<string>(), signatures = new Set<string>();
    for (let index = 0; index <= maximum(number); index++) {
      const generated = item(number, index);
      assert.equal(new Set(options(generated)).size, 4);
      assert.equal(generated.contexts, undefined, 'scope wrapper provides only the current booklet references');
      const selected = options(generated)[generated.correctIndex!];
      assert(selected);
      assert.ok(generated.explanation.length > 20);
      prompts.add(JSON.stringify(generated.prompt));
      signatures.add(selected);
      cases++;
    }
    assert.equal(prompts.size, maximum(number) + 1);
    assert.ok(signatures.size >= 2, 'must be able to avoid the last correct answer Q' + number);
    for (const invalid of [[], [-1], [0.5], Array(1), [0, 0], [maximum(number) + 1]]) assert.throws(() => authored.build(invalid));
  }
  assert.equal(cases, 101);
});

type Labels = Record<string, RegExp>;
function classify(text: string, labels: Labels) {
  const matching = Object.entries(labels).filter(([, rule]) => rule.test(text)).map(([meaning]) => meaning);
  assert.equal(matching.length, 1, text);
  return matching[0];
}

const knowledge: Record<number, { targets: Labels; alternatives: Labels }> = {
  55: {
    targets: { operation: /運用者が優先/, business: /利用者が優先/ },
    alternatives: { operation: /運用手順/, business: /業務手順/, software: /仕様/, speed: /性能|目標処理時間/ },
  },
  58: {
    targets: { lifecycle: /TCO/, development: /プログラムを完成させる/, setup: /完成済み.*初期設定/, network: /拠点間回線やルータ/ },
    alternatives: { development: /開発に関わる/, lifecycle: /運用及び維持・管理/, setup: /導入時の費用/, network: /通信・ネットワーク/ },
  },
  59: {
    targets: { control: /ITに係る内部統制/ },
    alternatives: {
      control: /アクセス権を削除|変更履歴を保存し承認|バックアップと復元|データベースの入力・更新/,
      other: /経営計画|人事考課|生産設備|作業台|販売目標|事業目標|備品|説明会|新人研修|倉庫棚/,
    },
  },
  60: {
    targets: { conflicted: /独立性の観点から避けるべき/ },
    alternatives: {
      conflicted: /総務部のAさんが.*総務部|自分の承認|自ら管理する業務/,
      permitted: /外部企業|マーケティング部|監査人に協力|担当経験のない|契約に基づいて|契約条項|独立した立場|ログの形式|被監査部門への質問|社内監査部員|法務担当者の助言|業務に関与しない/,
    },
  },
  61: {
    targets: { enforce: /業務範囲を逸脱する/ },
    alternatives: {
      enforce: /命令|運用部門に代わって変更計画を承認|責任者となって改善を執行/,
      report: /指摘|勧告|緊急性|報告/,
    },
  },
  62: {
    targets: { process: /BPM/, resource: /ERP/, customer: /CRM/, information: /BI/ },
    alternatives: { process: /業務プロセス|業務の流れ/, resource: /経営資源/,
      customer: /顧客/, information: /情報資源|蓄積した情報|蓄積された情報/ },
  },
  63: {
    targets: { workflow: /ワークフロー/, retail: /顧客管理/, interchange: /EDI/, warehouse: /自動倉庫/ },
    alternatives: { workflow: /事務手続/, retail: /割引/, interchange: /データ交換の標準規約/, warehouse: /搬入搬出/ },
  },
  65: {
    targets: { learning: /学習と成長のKPI/, customer: /顧客の視点のKPI/,
      process: /内部業務プロセスの視点のKPI/, financial: /財務の視点のKPI/ },
    alternatives: { learning: /育成/, customer: /満足度/, process: /顧客提案数/, financial: /受注金額/ },
  },
  67: {
    targets: { external: /外部要因はどれか。$/, weakness: /内部要因のうち弱み/,
      opportunity: /外部要因のうち機会/, strength: /内部要因のうち強み/ },
    alternatives: { strength: /営業力|機能面|技術開発力|販売担当者の専門知識/,
      weakness: /品質における弱み|故障率が高い/, threat: /新規参入|競合企業が参入/, opportunity: /新たな顧客層が拡大/ },
  },
  68: {
    targets: { inbound: /購買物流の活動はどれか。$/, production: /製造の活動はどれか。$/,
      outbound: /出荷物流の活動はどれか。$/, marketing: /販売とマーケティングの活動はどれか。$/ },
    alternatives: { inbound: /生地を発注.*検品.*在庫管理/, production: /縫製/,
      outbound: /購入者へ配送/, marketing: /広告宣伝/ },
  },
  69: {
    targets: { cost: /コストプラス/, market: /競争志向/, value: /バリューベース/ },
    alternatives: { cost: /原価|材料費.*労務費/, market: /競合|競争|競争相手/,
      value: /知覚価値|支払意思|感じる価値/, phased: /利益最大.*リスク最小/, discount: /値引き/ },
  },
  70: {
    targets: { knowledge: /ナレッジマネジメント/, flat: /フラット型/, benchmark: /ベンチマーク|ベンチマーキング/, core: /コアコンピタンス/ },
    alternatives: { knowledge: /知識を共有/, flat: /組織の階層/, benchmark: /企業との比較分析/, core: /強みを核/ },
  },
  71: {
    targets: { divide: /ディジタルディバイド/, accessibility: /アクセシビリティ/ },
    alternatives: { divide: /格差のことである/, accessibility: /度合いのことである/,
      inclusion: /整備された環境/, people: /困難な人々/ },
  },
  72: {
    targets: { internal: /庁内の事務手続/, supplier: /G to B/, government: /異なる自治体の間/, citizen: /G to C/ },
    alternatives: { internal: /自治体内で電子決裁/, supplier: /電子調達.*電子入札/,
      government: /自治体間で住民票/, citizen: /電子申請する/ },
  },
  73: {
    targets: { content: /CGM/, auction: /ネットオークション/, mall: /ショッピングモール/, mail: /メールマガジン/ },
    alternatives: { content: /個人が制作したディジタルコンテンツ/, auction: /オークション形式/,
      mall: /個人商店主のオンラインショップ/, mail: /メーリングリスト/ },
  },
  74: {
    targets: { market: /eマーケットプレイス/, retail: /O2O/, supply: /SCM/, interchange: /EDI/ },
    alternatives: { market: /市場を通じて出会い/, retail: /実世界の店舗/, supply: /全体最適/, interchange: /電子的に交換/ },
  },
  75: {
    targets: { environment: /環境対策/, shareholder: /株主に対する説明責任/,
      society: /社会貢献活動の支援/, ethics: /企業倫理の相談体制/ },
    alternatives: { environment: /グリーン購入/, shareholder: /株主に対し/, society: /ボランティア/, ethics: /倫理ヘルプライン/ },
  },
  76: {
    targets: { share: /雇用維持.*雇用機会/, welfare: /福利厚生のメニュー/, transfers: /希望する部署への異動/, balance: /仕事以外の生活/ },
    alternatives: { share: /ワークシェアリング/, welfare: /カフェテリアプラン/, transfers: /フリーエージェント/, balance: /ワークライフバランス/ },
  },
  77: {
    targets: { abc: /ABC分析/, mesh: /メッシュ分析/, panel: /パネル調査/, cross: /クロス集計/ },
    alternatives: { abc: /累計比率/, mesh: /格子状/, panel: /同じパネリスト/, cross: /要因ごとに区分/ },
  },
  79: {
    targets: { malicious: /刑法における.*コンピュータウイルスに関する罪/ },
    alternatives: {
      malicious: /第三者のコンピュータで動作させる目的|第三者のPCで無断で実行|相手に無断でそのPC/,
      defensive: /対策ソフトの開発|自分の隔離された|自分の実験環境/,
      unknowing: /知らず|気付かず/, research: /明示して|明示し(?:，|解析)/,
    },
  },
  80: {
    targets: { jisc: /日本工業標準調査会/, ieee: /IEEE/, jec: /電気規格調査会/, jeita: /電子情報技術産業協会/ },
    alternatives: { jisc: /経済産業省.*工業標準化法.*審議/, ieee: /IEEE規格/, jec: /JEC規格/, jeita: /JEITA規格/ },
  },
};

test('2015春 午前の知識21問は各入力の全択を別の分類条件で検証する', () => {
  assert.equal(Object.keys(knowledge).length, 21);
  for (const [number, { targets, alternatives }] of Object.entries(knowledge)) {
    const q = Number(number);
    for (let index = 0; index <= maximum(q); index++) {
      const generated = item(q, index);
      const expected = classify(stem(generated), targets);
      const marks = options(generated).map(option => {
        const actual = classify(option, alternatives);
        return expected === 'external' ? actual === 'opportunity' || actual === 'threat' : actual === expected;
      });
      assert.deepEqual(marks, options(generated).map((_, position) => position === generated.correctIndex), q + '/' + index);
      if (q === 65) assert.match(stem(generated), /ここで，ソリューションとは.*プロフェッショナルサービスを通して支援する/);
      if (q === 79 || q === 80) {
        if (index === 0) assert.match(generated.explanation, /2015年当時/);
        else assert.match(stem(generated), /2015年当時/);
      }
    }
  }
});

test('2015春 午前54の全経路・ダミー作業・過小と過大の候補値を独立検算する', () => {
  for (let index = 0; index <= maximum(54); index++) {
    const generated = item(54, index);
    const figure = generated.prompt.find(block => block.type === 'diagram');
    assert(figure);
    const durations = Object.fromEntries([...figure.alt.matchAll(/([A-I]) (\d+)日/g)].map(([, task, days]) => [task, Number(days)]));
    assert.equal(Object.keys(durations).length, 9);
    function paths(at: string): string[][] {
      return at === 'end' ? [[]] : graph.filter(([start]) => start === at)
        .flatMap(([, next, task]) => paths(next).map(path => [task, ...path]));
    }
    const all = paths('start');
    const totals = all.map(path => path.reduce((days, task) => days + (durations[task] ?? 0), 0));
    assert.equal(all.length, 7);
    const correct = Math.max(...totals);
    const marks = options(generated).map(Number);
    assert.equal(marks[generated.correctIndex!], correct);
    const wronglySerial = (left: string, right: string) => Math.max(...all.map((path, i) => totals[i] +
      (path.includes(left) ? durations[right] : path.includes(right) ? durations[left] : 0)));
    assert(marks.every(mark => totals.includes(mark) || [wronglySerial('B', 'E'), wronglySerial('C', 'G')].includes(mark)));
    assert(marks.slice(1).every((mark, i) => mark > marks[i] && mark - marks[i] <= 4));
    if (!index) assert.deepEqual(marks, [27, 28, 29, 31]);
  }
});

test('2015春 午前64の3条件を整数の時刻割当てで検算する', () => {
  for (let index = 0; index <= maximum(64); index++) {
    const generated = item(64, index);
    const figure = generated.prompt.find(block => block.type === 'diagram');
    assert(figure);
    const [total, visits, inOffice, preparation, other] = [...figure.alt.matchAll(/(\d+\.\d)時間/g)]
      .map(([, hours]) => Number(hours.replace('.', '')));
    const count = Number(/件数は(\d+)件/.exec(figure.alt)?.[1]);
    const target = Number(/件数を(\d+)件/.exec(stem(generated))?.[1]);
    const saved = Number(/(\d+\.\d)時間短縮/.exec(stem(generated))?.[1].replace('.', ''));
    assert.equal(visits + inOffice, total);
    assert.equal(preparation + other, inOffice);
    const visitSlots = Array<number>(visits / count).fill(1);
    const prepSlots = Array<number>(preparation / count - saved).fill(1);
    const occupied = Array.from({ length: target }).flatMap(() => [...prepSlots, ...visitSlots]).length;
    const difference = other - (total - occupied);
    assert(occupied <= total);
    const alternatives = [preparation - prepSlots.length * target,
      visitSlots.length * (target - count) - count * saved,
      difference, visitSlots.length * (target - count)].sort((a, b) => a - b);
    const choices = options(generated).map(value => Number(value.replace('.', '')));
    assert.deepEqual(choices, alternatives);
    assert.equal(choices[generated.correctIndex!], difference);
    assert(choices.slice(1).every((value, i) => value - choices[i] >= 2));
  }
});

test('2015春 午前78は全6順序で一意に最短となる候補を独立検算する', () => {
  const all = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'];
  for (let index = 0; index <= maximum(78); index++) {
    const generated = item(78, index);
    const figure = generated.prompt.find(block => block.type === 'table');
    assert(figure);
    assert.deepEqual(figure.columns, ['製品＼機械', 'M1', 'M2']);
    assert.deepEqual(figure.rows.map(row => row[0]), ['A', 'B', 'C']);
    const times = new Map(figure.rows.map(([product, first, second]) => [product, [Number(first), Number(second)]]));
    const results = all.map(order => {
      const tasks = [...order].map(product => times.get(product)!);
      // The bottleneck is a prefix on M1 followed by a suffix on M2.
      return Math.max(...tasks.map((_, cut) => tasks.slice(0, cut + 1).reduce((sum, row) => sum + row[0], 0) +
        tasks.slice(cut).reduce((sum, row) => sum + row[1], 0)));
    });
    const finish = Math.min(...results);
    assert.equal(results.filter(value => value === finish).length, 1);
    const order = all[results.indexOf(finish)];
    assert.equal(options(generated)[generated.correctIndex!], [...order].join('→'));
    assert.match(stem(generated), /M1→M2の順.*\n.*別製品を続けてM1で加工/);
    if (!index) assert.deepEqual(results, [20, 22, 18, 19, 22, 19]);
  }
});

test('2015春 午前54・64の描画は図の構成・全データ・代替文を保持する', () => {
  for (const [ordinal, figure] of legacy2015SpringAm5480Figures.entries()) {
    const renderer = legacy2015SpringAm5480Renderers[ordinal];
    assert.equal(renderer.profile, figure.profile);
    for (let index = 0; index <= figure.domain[0][1]; index++) {
      const values = [index];
      figure.validate(values);
      const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: '試験資料' }));
      if (ordinal === 0) {
        assert.equal((markup.match(/data-activity/g) ?? []).length, 9);
        assert.equal((markup.match(/data-dummy/g) ?? []).length, 2);
        assert.equal((markup.match(/<circle/g) ?? []).length, 10);
        assert.match(markup, /ダミー作業/);
        const title = /<title id="([^"]+)">試験資料<\/title>/.exec(markup);
        const description = /<desc id="([^"]+)">([^<]+)<\/desc>/.exec(markup);
        assert(title && description);
        assert(markup.includes(`aria-labelledby="${title[1]}"`));
        assert(markup.includes(`aria-describedby="${description[1]}"`));
        assert.equal(description[2], figure.alt(values));
        const labels = [...markup.matchAll(/<text[^>]*>([A-I])<\/text><text[^>]*>(\d+)<\/text>/g)]
          .map(([, task, duration]) => task + ' ' + duration + '日');
        assert.equal(labels.length, 9);
        for (const label of labels) assert.ok(figure.alt(values).includes(label));
        assert.equal(figure.alt(values), (item(54, index).prompt[1] as { alt: string }).alt);
      } else {
        assert.equal((markup.match(/data-sales-box/g) ?? []).length, 2);
        assert.equal((markup.match(/data-sales-value/g) ?? []).length, 6);
        assert.equal(figure.alt(values), (item(64, index).prompt[1] as { alt: string }).alt);
      }
    }
  }
});
