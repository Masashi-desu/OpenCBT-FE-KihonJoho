import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2009AutumnAm54To80Definitions } from '../../../src/core/generators/legacy-2009-autumn-am-54-80';
import { legacy2009AutumnAm5480Figures, scatterCases } from '../../../src/core/generators/legacy-2009-autumn-am-54-80-figures';
import { legacy2009AutumnAm5480FigureRenderers } from '../../../src/ui/Legacy2009AutumnAm5480Figures';

const inputCases = [0, 1, 2, 3];
const officialKeys = 'ウアエアアイエウイエイウイエイエウウエイイウエウウウウ';

type Facts = { question: RegExp; truth: readonly [RegExp, RegExp, RegExp, RegExp]; valid: RegExp };
type Goals = readonly [RegExp, RegExp, RegExp, RegExp];
function matchCases(questions: Goals, options: Goals, answers: readonly [number, number, number, number]): Facts[] {
  return questions.map((question, i) => ({ question, truth: options, valid: options[answers[i]] }));
}

const quality: Facts[] = [
  { question: /システム開発における品質管理/, truth: [/サブシステム単位/, /性能は品質管理の対象外/, /すべての成果物/, /自社開発のプログラムだけ/], valid: /すべての成果物/ },
  { question: /受注管理と在庫管理/, truth: [/実際に動かして/, /個別テストに合格した段階/, /ドキュメントは品質管理の対象外/, /処理時間は品質管理の対象外/], valid: /実際に動かして/ },
  { question: /開店までに処理を終える/, truth: [/終わらなくても品質/, /データ量で処理時間を測り/, /手順書に記載するだけ/, /製品の性能は評価の対象外/], valid: /データ量で処理時間を測り/ },
  { question: /市販の検索製品/, truth: [/組み合わせた状態での検査は不要/, /検索時間は評価しない/, /ドキュメントは品質管理の対象外/, /組み込んだシステム全体/], valid: /組み込んだシステム全体/ },
];
const controls: Facts[] = [
  { question: /復旧に該当/, truth: [/職務分離/, /コンティンジェンシープラン/, /パスワード/, /メッセージ認証/], valid: /コンティンジェンシープラン/ },
  { question: /予防に該当/, truth: [/権限を付ける/, /予備機へ切り替える/, /操作ログ/, /署名を照合/], valid: /権限を付ける/ },
  { question: /検知に該当/, truth: [/入退室/, /バックアップを戻す/, /認証失敗の増加/, /職務を分離/], valid: /認証失敗の増加/ },
  { question: /装置の故障が起きた後の復旧/, truth: [/権限を制限/, /装置の応答を監視/, /二人の承認/, /故障後に代替装置/], valid: /故障後に代替装置/ },
];
const frameProcesses: Facts[] = [
  { question: /企画プロセス/, truth: [/業務プロセスや業務ルール/, /移行時期及び移行手順/, /業務の新しい全体像/, /テスト要求事項及び予定/], valid: /業務の新しい全体像/ },
  { question: /要件定義プロセス/, truth: [/入出力及び業務ルール/, /本番切替の順序/, /全体イメージを構想/, /単体でテスト/], valid: /入出力及び業務ルール/ },
  { question: /ソフトウェアの構築工程/, truth: [/利用部門間で合意/, /コードとデータベース/, /事業目標に沿った/, /移行手順を決める/], valid: /コードとデータベース/ },
  { question: /システム移行の準備/, truth: [/業務の要求を新たに定義/, /将来像を構想/, /コードを記述/, /切り替える時期と手順/], valid: /切り替える時期と手順/ },
];
const frameRequirements: Facts[] = [
  { question: /非機能要件に該当/, truth: [/業務上実現すべき要件/, /業務の手順や入出力情報/, /システムの機能/, /信頼性，効率性/], valid: /信頼性，効率性/ },
  { question: /受注システムについて，機能要件/, truth: [/受注を登録/, /応答が2秒/, /与信審査の最終判断/, /引継ぎ漏れ/], valid: /受注を登録/ },
  { question: /倉庫システムについて，非機能要件/, truth: [/引当可能な数量/, /30分以内で業務を再開/, /責任を倉庫責任者/, /販売機会の損失/], valid: /30分以内で業務を再開/ },
  { question: /在庫照会システムについて，非機能要件/, truth: [/取引先向けの在庫を表示/, /翌営業日までに承認/, /応答時間が3秒以内/, /欠品に気付ける業務/], valid: /応答時間が3秒以内/ },
];

const knowledgeFacts: Readonly<Record<number, Facts[]>> = {
  54: quality,
  55: matchCases([/業務に無関係なソフトウェア/, /代わって設定画面を操作/, /利用時間帯を把握/, /更新プログラムを一括/],
    [/^インベントリ収集$/, /^遠隔操作$/, /^稼働管理機能$/, /^ソフトウェア配信$/], [0, 1, 2, 3]),
  57: matchCases([/落雷によって発生する過電圧/, /電力供給が長時間停止/, /一つの敷設経路が切断/, /通信線に誘導された短時間の過電圧/],
    [/サージ保護デバイス/, /自家発電装置/, /経路の異なる2系統/, /制御回路をディジタル化/], [0, 1, 2, 0]),
  58: [
    { question: /監査において発見した問題/, truth: [/監査依頼者に報告/, /利用部門に通報/, /是正するよう命じる/, /自ら是正/], valid: /監査依頼者に報告/ },
    { question: /監査委員会が情報システム部.*退職者のアカウント/, truth: [/利用部門だけに通報/, /監査委員会に報告/, /無効化を命じる/, /監査人がアカウントを無効/], valid: /監査委員会に報告/ },
    { question: /社長が運用部門.*復元手順が長期間/, truth: [/利用者だけに通報/, /復元試験を実施するよう命じる/, /社長に報告/, /監査人が復元試験を実施/], valid: /社長に報告/ },
    { question: /取締役会が開発部門.*承認を受けていない変更/, truth: [/利用部門だけに通報/, /変更の取消しを命じる/, /監査人が本番環境の変更/, /取締役会へ報告/], valid: /取締役会へ報告/ },
  ],
  59: controls,
  60: matchCases([/損害の負担を受容/, /保険会社に負担/, /機能の提供を取りやめ/, /発生確率を下げる/],
    [/^リスク移転$/, /^リスク回避$/, /^リスク低減$/, /^リスク保有$/], [3, 0, 1, 2]),
  62: matchCases([/^BPRを説明/, /^ERPを説明/, /^ベンチマーキングを説明/, /^コアコンピタンスに基づく/],
    [/経営資源の配分を有効かつ総合に計画/, /顧客視点から業務のプロセスを再設計/, /競合相手又は先進企業と比較/, /自社独自のスキルや技術に経営資源を集中/], [1, 0, 2, 3]),
  63: matchCases([/^ASPとは/, /^ハウジング事業者とは/, /^BPO事業者とは/, /^ホスティング事業者とは/],
    [/高速回線や耐震設備/, /業務を外部の事業者が一括して請け負う/, /事業者が所有するサーバの一部/, /アプリケーションシステムの機能をネットワーク経由/], [3, 0, 1, 2]),
  64: matchCases([/^SOAを説明/, /^OSI基本参照モデルを説明/, /^ITサービスマネジメントを説明/, /^SaaSを説明/],
    [/七つの階層/, /サービスを組み合わせてシステム全体/, /品質の継続的な改善/, /ユーザが必要とする機能だけ/], [1, 0, 2, 3]),
  65: frameProcesses,
  66: matchCases([/費用，スケジュール，開発体制，投資効果/, /切り替える時期や手順/, /個別部門を越えて組織全体/, /次年度の運用日程/],
    [/^移行計画$/, /^開発計画$/, /^全体最適化計画$/, /^年間運用計画$/], [1, 0, 2, 3]),
  67: frameRequirements,
  68: matchCases([/受託側が瑕疵担保責任/, /委ねられた法律行為/, /短い所定労働時間の要員を直接雇い/, /他社に残したまま自社が要員を指揮/],
    [/^委任契約$/, /^請負契約$/, /^パート契約$/, /^派遣契約$/], [1, 0, 2, 3]),
  70: matchCases([/^CRMを説明/, /^リテールサポートを説明/, /^ERPを説明/, /^SCMを説明/],
    [/小売店の経営活動を支援/, /経営資源を有効かつ総合的に計画/, /顧客チャネルで情報を共有/, /サプライチェーン全体の効率/], [2, 0, 1, 3]),
  71: matchCases([/WTO加盟国/, /対応する国際規格があり/, /米国の承認された国家規格/, /日本の国家規格/],
    [/^ANSI規格$/, /^IEEE規格$/, /^ISO規格$/, /^JIS規格$/], [2, 2, 0, 3]),
  74: matchCases([/企業間でデータ交換/, /電子証明書を発行/, /通信路で内容の暗号化/, /財務報告の科目や金額をタグ/],
    [/^CA$/, /^EDI$/, /^SSL$/, /^XBRL$/], [1, 0, 2, 3]),
  75: matchCases([/^CIOの果たす/, /利用部門の代表の果たす/, /技術支援部門の果たす/, /プロジェクトマネージャの果たす/],
    [/システム化案を情報システム部門へ提示/, /調査，利用研究，関連部門への教育/, /経営戦略との整合性/, /プロジェクトの運営を管理/], [2, 0, 1, 3]),
  77: matchCases([/減価償却の方法/, /仕入れの都度.*平均単価/, /最後の仕入単価/, /出資割合に応じた額/],
    [/^移動平均法$/, /^最終取得原価法$/, /^定率法$/, /^持分法$/], [2, 0, 1, 3]),
  78: matchCases([/コード化された表現/, /外観のデザインを登録/, /商品の出所を示す名称やロゴ/, /技術的発明を出願/],
    [/^意匠法$/, /^商標法$/, /^著作権法$/, /^特許法$/], [2, 0, 1, 3]),
  79: matchCases([/他人のIDとパスワード/, /通信の秘密を守る義務/, /機器の窃盗を処罰/, /損害賠償責任の制限と発信者情報/],
    [/^刑法$/, /^電気通信事業法$/, /^不正アクセス禁止法$/, /^プロバイダ責任制限法$/], [2, 1, 0, 3]),
};

const manufactureInputs = [
  { hours: 200, proceeds: [1800, 2500, 3000], times: [6, 10, 15], limits: [1000, 900, 500] },
  { hours: 180, proceeds: [1600, 3000, 3300], times: [6, 10, 15], limits: [1000, 600, 500] },
  { hours: 210, proceeds: [1800, 2400, 4800], times: [6, 10, 15], limits: [1000, 900, 400] },
  { hours: 180, proceeds: [1800, 2600, 4200], times: [6, 10, 15], limits: [800, 600, 600] },
];
function enumerateFactory(index: number) {
  const { hours, proceeds, times, limits } = manufactureInputs[index];
  let max = 0;
  for (let x = 0; x <= limits[0]; x++) {
    for (let y = 0; y <= limits[1]; y++) {
      const remaining = hours * 60 - x * times[0] - y * times[1];
      if (remaining < 0) continue;
      const z = Math.min(limits[2], Math.floor(remaining / times[2]));
      max = Math.max(max, x * proceeds[0] + y * proceeds[1] + z * proceeds[2]);
    }
  }
  return max;
}

const componentInputs = [
  { shipping: 300, inventory: [100, 100, 300, 400], recipes: [[3, 2, 0], [0, 1, 2]] },
  { shipping: 400, inventory: [100, 200, 400, 450], recipes: [[2, 1, 0], [0, 2, 1]] },
  { shipping: 350, inventory: [50, 100, 300, 450], recipes: [[2, 2, 0], [0, 2, 1]] },
  { shipping: 450, inventory: [150, 200, 400, 800], recipes: [[3, 1, 0], [0, 1, 2]] },
];
function withdrawMaterials(index: number) {
  const { shipping, inventory, recipes } = componentInputs[index];
  const onHand = [...inventory];
  const missing = [0, 0, 0, 0];
  function withdraw(kind: number) {
    if (onHand[kind] > 0) {
      onHand[kind]--;
      return;
    }
    missing[kind]++;
    for (const [part, qty] of (recipes[kind] ?? []).entries())
      for (let required = 0; required < qty; required++) withdraw(part + 1);
  }
  for (let unit = 0; unit < shipping; unit++) withdraw(0);
  return missing[2];
}

const money = (n: number) => n.toLocaleString('en-US');
const yen = (value: string) => Number(value.replaceAll(',', ''));
function assertNumericChoices(choices: string[], answer: number) {
  const options = choices.map(yen);
  assert.ok(options.every(Number.isSafeInteger));
  assert.ok(options.every((value, i) => i === 0 || options[i - 1] < value), '数値の選択肢は重複せず昇順');
  return options.map(option => option === answer);
}
function assertKnowledge(facts: Facts, prompt: string, choices: string[]) {
  assert.match(prompt, facts.question);
  assert.equal(facts.truth.length, 4);
  for (const choice of choices) assert.equal(facts.truth.filter(fact => fact.test(choice)).length, 1);
  for (const fact of facts.truth) assert.equal(choices.filter(choice => fact.test(choice)).length, 1);
  return choices.map(choice => facts.valid.test(choice));
}

function checkSpecial(number: number, index: number, prompt: string, choices: string[], alt: string) {
  if (number === 69) {
    const [zero, lower, unknown] = [...prompt.matchAll(/設定価格を([0-9,]+)円にすると，需要は([0-9,]+|［a］)/g)];
    assert.ok(zero && lower && unknown);
    assert.equal(zero[2], '0');
    assert.equal(unknown[2], '［a］');
    const atZero = yen(zero[1]), atKnown = yen(lower[1]), atUnknown = yen(unknown[1]), known = yen(lower[2]);
    const gradient = known / (atKnown - atZero);
    const intercept = -gradient * atZero;
    assert.equal(atUnknown * gradient + intercept, [45000, 25000, 40000, 35000][index]);
    assert.ok(choices.slice(1).every((choice, i) => yen(choice) - yen(choices[i]) === 5000));
    return assertNumericChoices(choices, atUnknown * gradient + intercept);
  }
  if (number === 72) {
    const input = manufactureInputs[index];
    assert.match(prompt, new RegExp('月間' + input.hours + '時間まで'));
    assert.ok(alt.includes('製品X，製品Y，製品Z'));
    for (const [label, values] of [
      ['1個当たりの利益（円）', input.proceeds], ['1個当たりの組立て所要時間（分）', input.times], ['月間需要量上限（個）', input.limits],
    ] as const) assert.ok(alt.includes(label + '：' + values.map(money).join('，')));
    return assertNumericChoices(choices, enumerateFactory(index));
  }
  if (number === 73) {
    const { shipping, inventory, recipes } = componentInputs[index];
    assert.ok(prompt.includes(shipping + '個出荷'));
    assert.match(prompt, /ほかの仕掛残，注文残，引当残などはない/);
    assert.ok(alt.includes('構成表（単位 個）') && alt.includes('在庫表（単位 個）'));
    for (const [item, row] of recipes.entries()) {
      const expected = ['a', 'b', 'c'].map((part, i) => part + (row[i] === 0 ? 'は空欄' : 'が' + row[i] + '個')).join('，');
      assert.ok(alt.includes(['A', 'a'][item] + '：' + expected));
    }
    const expectedStock = ['A', 'a', 'b', 'c'].map((part, i) => part + 'が' + inventory[i] + '個').join('，');
    assert.ok(alt.includes(expectedStock));
    return assertNumericChoices(choices, withdrawMaterials(index));
  }
  if (number === 76) {
    const points = scatterCases[index];
    const pointPairScore = points.reduce((total, [x, y], i) =>
      total + points.slice(i + 1).reduce((sum, [xx, yy]) => sum + (x - xx) * (y - yy), 0), 0);
    assert.equal(Math.sign(pointPairScore), [-1, 1, -1, 1][index]);
    assert.match(alt, /横軸x，縦軸y，原点0/);
    assert.doesNotMatch(alt, /相関|傾向|正で|負で/);
    return assertKnowledge({
      question: /製造上のある要因の値xと品質特性の値y/,
      truth: [/2次回帰係数/, /回帰式と同じ/, /相関係数は正/, /相関係数は負/],
      valid: pointPairScore < 0 ? /相関係数は負/ : /相関係数は正/,
    }, prompt, choices);
  }
  if (number === 80) {
    const contracts = [
      ['A社とB社は双方向の矢印で結ばれ，請負契約', 'B社とC社は双方向の矢印で結ばれ，派遣契約'],
      ['A社とB社は双方向の矢印で結ばれ，派遣契約（派遣元：B社，派遣先：A社）', 'B社とC社は双方向の矢印で結ばれ，請負契約'],
      ['A社とB社は双方向の矢印で結ばれ，請負契約', 'B社とC社は双方向の矢印で結ばれ，請負契約'],
      ['B社とA社は双方向の矢印で結ばれ，請負契約', 'A社とC社は双方向の矢印で結ばれ，派遣契約（派遣元：C社，派遣先：A社）'],
    ][index];
    for (const contract of contracts) assert.ok(alt.includes(contract));
    const originalActions: Goals = [/A社の担当者がB社の要員/, /プロジェクトチーム全員/, /B社の担当者がC社の要員に業務の割り振り/, /就業条件の調整/];
    const otherActions: Goals[] = [
      [/A社の担当者がB社の要員に直接/, /プロジェクトチーム全員/, /B社の担当者がC社の要員に直接/, /就業条件を一方的に変更/],
      [/A社の担当者がB社の要員に直接/, /C社の担当者が自社（C社）の要員/, /B社の担当者がC社の要員に直接/, /就業条件を一方的に変更/],
      [/A社の担当者がB社の要員に直接/, /プロジェクトチーム全員/, /B社の担当者がC社の要員に直接/, /A社の担当者がC社の要員に直接/],
    ];
    const roles = index === 0 ? originalActions : otherActions[index - 1];
    return assertKnowledge({ question: /適法な行為はどれか/, truth: roles, valid: roles[[2, 0, 1, 3][index]] }, prompt, choices);
  }
  assert.fail('独立した検算がない問' + number);
}

const expectedQuestions = Array.from({ length: 27 }, (_, i) => 54 + i).filter(number => number !== 56 && number !== 61);
test('2009年秋期旧午前・問54〜80の掲載対象、保留、図登録は一対一', () => {
  assert.deepEqual(legacy2009AutumnAm54To80Definitions.map(definition => Number(definition.source.split('-').at(-1))), expectedQuestions);
  assert.deepEqual(legacy2009AutumnAm5480FigureRenderers.map(renderer => renderer.profile), legacy2009AutumnAm5480Figures.map(figure => figure.profile));
});
for (const definition of legacy2009AutumnAm54To80Definitions) {
  const number = Number(definition.source.split('-').at(-1));
  test('2009年秋期旧午前・問' + number + ' 公式解答、全生成入力、四択の内容', () => {
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.sourceAnswer, officialKeys[number - 54]);
    assert.throws(() => definition.build([4]));
    assert.throws(() => definition.build([-1]));
    assert.throws(() => definition.build([1.5]));
    assert.throws(() => definition.build([]));
    assert.throws(() => definition.build([0, 1]));
    const sourceFormat = definition.build(definition.reference).prompt.map(block => block.type);
    const renderedInputs = new Set<string>();
    for (const index of inputCases) {
      const generated = definition.build([index]);
      assert.deepEqual(generated.prompt.map(block => block.type), sourceFormat, '元の本文・図表の並びを維持する');
      const choices = generated.choices.map(([block]) => {
        assert.ok(block.type === 'paragraph');
        return block.text;
      });
      assert.equal(choices.length, 4);
      assert.equal(new Set(choices).size, 4);
      const prompt = generated.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
      const diagram = generated.prompt.find(block => block.type === 'diagram');
      const alt = diagram?.alt ?? '';
      renderedInputs.add(prompt + '\n' + alt);
      const facts = knowledgeFacts[number]?.[index];
      const matches = facts ? assertKnowledge(facts, prompt, choices) : checkSpecial(number, index, prompt, choices, alt);
      assert.equal(matches.filter(Boolean).length, 1, '内容の一致は一つだけ');
      assert.equal(generated.correctIndex, matches.indexOf(true));
      assert.ok(generated.explanation.length >= 40);
      if (index === 0) assert.equal('アイウエ'[generated.correctIndex!], officialKeys[number - 54]);
      if (diagram) {
        assert.equal(diagram.scene.kind, 'source_figure');
        assert.deepEqual(diagram.scene.values, [index]);
      }
    }
    assert.equal(renderedInputs.size, 4);
  });
}

for (const definition of legacy2009AutumnAm5480Figures) {
  test(definition.profile + ' 全入力で図表・代替説明・登録済み描画を維持する', () => {
    const renderer = legacy2009AutumnAm5480FigureRenderers.find(item => item.profile === definition.profile);
    assert.ok(renderer);
    for (const index of inputCases) {
      const caption = '図表';
      const markup = renderToStaticMarkup(createElement(renderer.component, { values: [index], caption }));
      assert.ok(markup.includes('data-figure-profile="' + definition.profile + '"'));
      assert.ok(markup.includes('tabindex="0"'));
      assert.ok(markup.includes(definition.alt([index])));
      assert.doesNotMatch(markup, /<img\b/);
      if (definition.profile.includes('-72-')) {
        assert.equal(markup.match(/scope="row"/g)?.length, 3);
        assert.equal(markup.match(/<td>/g)?.length, 9);
      } else if (definition.profile.includes('-73-')) {
        assert.equal(markup.match(/<table/g)?.length, 2);
        assert.match(markup, /scope="colgroup" colSpan="3">構成部品/);
        assert.equal(markup.match(/<td><\/td>/g)?.length, 2);
      } else {
        assert.match(markup, /<svg .*role="img"/);
        assert.match(markup, /aria-describedby=/);
        if (definition.profile.includes('-76-')) assert.equal(markup.match(/<circle/g)?.length, scatterCases[index].length);
      }
    }
    assert.throws(() => definition.validate([4]));
    assert.throws(() => definition.validate([1.5]));
    assert.throws(() => definition.validate([1, 2]));
  });
}
