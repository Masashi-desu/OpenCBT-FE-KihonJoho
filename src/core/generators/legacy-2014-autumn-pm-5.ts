import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, table } from './definition';
import {
  autumn2014Pm0508Banks as banks, q5DiagramAlt, q5FHead, q5FTail, q5Table1, q5Table2,
} from './legacy-2014-autumn-pm-05-08-source';
import { answerField, body, choiceBank, promptPages, q0508Figure, selectInput } from './legacy-2014-autumn-pm-05-08-shared';

const models = [{ min: 0, reverse: false }, { min: 1, reverse: false }, { min: 0, reverse: true }] as const;
export const q5CaseCount = models.length;
const captions: Record<string, string> = {
  'q5-ui': '図1　社員検索機能の表示例', 'q5-analysis': '図2　分析のためのクラス図', 'q5-legend': '図2の凡例',
  'q5-list': '図3　組織エントリリストを設計するためのクラス図', 'q5-traversal': '図4　クライアントの走査の例',
  'q5-iterator': '図5　見直し後の設計のためのクラス図',
};

function build(values: number[]) {
  const model = selectInput(values, models);
  const table2 = q5Table2(model.reverse);
  const prompt = promptPages(24, 30, id => {
    if (id === 'q5-f-head') return undefined;
    if (id === 'q5-f-tail') return p(q5FHead + q5FTail);
    if (id === 'q5-list-methods') return table(q5Table1.caption, q5Table1.columns, q5Table1.rows);
    if (id === 'q5-iterator-methods') return table(table2.caption, table2.columns, table2.rows);
    return q0508Figure(id, [0], captions[id], q5DiagramAlt[id]);
  }, text => {
    if (model.min === 1 && text.endsWith('社員は必ず一つの組織だけに属する。'))
      return text + '各組織には，少なくとも1人の社員が直接所属する。';
    if (model.reverse && text.startsWith('（3）共通ライブラリで提供するイテレータは'))
      return text.replace('先頭から順に', '末尾から先頭に向かって');
    return text;
  });
  const count = model.min + '..*';
  return body(prompt, ['5ab', '5cd', '5e', '5f'].map(choiceBank), [
    answerField('a', '5ab', '組織エントリ'), answerField('b', '5ab', '組織'),
    answerField('c', '5cd', count), answerField('d', '5cd', '0..1'),
    answerField('e', '5e', 'リスト自身'), answerField('f', '5f', banks['5f'][0]),
  ], '社員と組織の共通上位型は組織エントリ（a）で，再帰的な集約を持つ下位型は組織（b）である。' +
    '組織が直接持つ組織エントリの数は' + (model.min ? '社員が最低1人いるため1以上' : '0以上') + 'で，上限はない（c=' + count +
    '）。親組織のない組織もあり，子組織と社員は二つの親に属さないので，集約側の多重度は0..1（d）。' +
    'イテレータに渡すのは走査対象のリスト自身（e）。標準の走査は' + (model.reverse ? '末尾から先頭' : '先頭から末尾') +
    'へ進む。別の走査も既存インタフェースを使うため，BaseListのcreateIteratorとBaseIteratorの走査処理を継承先でオーバライドする（f）。' +
    '新メソッドの追加だけでは同じ呼出しから処理が切り替わらない。ListとIteratorはインタフェースで，継承する具体的な既存処理を持たない。');
}

export const legacy2014AutumnPm5Definition: AfternoonBookletDefinition = {
  source: '2014h26a-fe-pm-5', title: '共通ライブラリのオブジェクト指向設計',
  version: '3.7.0', reference: [0], fields: [field('組織の所属条件と標準の走査方向', 0, q5CaseCount - 1)],
  sourceAnswer: 'カ／オ／ウ／イ／エ／ア',
  notes: '物理・冊子p24–30。図1〜5・凡例と網掛け、表1・2、設問2の五つの設計方針、四つの選択肢群、6空欄を保持する。木構造で組織を含む集約側の多重度0..1を固定し、組織が直接保持する要素の最少数と標準の走査方向を変更する。C図など他規格本文は転載していない。',
  publicNotes: '組織に直接所属する社員の条件と、共通イテレータの既定の走査方向を変更しました。',
  build,
};
