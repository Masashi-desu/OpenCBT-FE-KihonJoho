import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field } from './definition';
import { spring2015Pm0508Banks as banks, spring2015Pm0508Source as source } from './legacy-2015-spring-pm-05-08-source';
import {
  spring2015Pm0508Body as body, spring2015Pm0508Choices as choices, spring2015Pm0508Figure as figure,
  spring2015Pm0508Index as index, spring2015Pm0508Prompt as prompt,
} from './legacy-2015-spring-pm-05-08-shared';

const selectedCells = [
  [[3, 2], [4, 5]],
  [[1, 1], [5, 7]],
  [[5, 2], [3, 6]],
  [[4, 2], [7, 0]],
] as const;
const matrix = source['q5-crud'];
const knownOperations = matrix.rows.map(([entity, operations]) => [entity, operations.map(value =>
  value === '［e］' ? 'C, R, U' : value === '［f］' ? 'C, R, D' : value)] as const);
const operationLabels = banks[5].ef.map(operations => operations.join(', ') || '―');
const explanations = [
  '新規申込の顧客情報では，新規登録C，全名寄せ項目で既登録を調べるR，既登録の契約者の保有契約件数を増やすUが必要である。住所変更に伴う関係顧客情報は，削除対象の関係を参照Rし，旧情報を削除Dし，変更後の関係を登録Cする。解約では関係顧客情報を変更しない。',
  '契約担当情報登録では，担当する社員と契約の組を契約担当へ登録Cする。保全手続情報更新では，帳票出力が完了した保全手続の工程ステータスを帳票出力済みに参照して更新Uする。',
  '新規の顧客情報登録・更新では既契約を対象とする保全手続情報を操作しない。帳票印刷では，保全手続確認書の送付先を得るために契約者の顧客情報を参照Rする。',
  '新規申込の顧客情報登録・更新では，契約者・被保険者・受取人ごとに関係顧客を登録Cする。保険種類マスタの参照Rは契約情報登録で保険種類を確認するために必要である。',
] as const;

export function spring2015Pm5Model(values: number[]) {
  const profile = index(values, selectedCells.length), targets = selectedCells[profile];
  const answer = targets.map(([row, column]) => knownOperations[row][1][column]);
  const rows = knownOperations.map(([entity, operations], row) => [entity, operations.map((operation, column) => {
    const at = targets.findIndex(([r, c]) => r === row && c === column);
    return at < 0 ? operation : at === 0 ? '［e］' : '［f］';
  })] as const);
  return { profile, rows, targets, answer, columns: matrix.columns };
}

const er = source['q5-er'], tree = source['q5-tree'], example = source['q5-customer-example'];
const erAlt = er.entities.map(([name, attrs, pk]) => name + '：' + attrs.map(attr =>
  attr + ((pk as readonly string[]).some(key => attr === key || attr.startsWith(key + '（')) ? '（主キーの実線下線）' : '')).join('，')).join('。') +
  '。1対多の矢印：' + er.edges.map(([from, to]) => from + '→' + to).join('，') + '。';
const treeAlt = tree.root + 'の下に，' + tree.branches.map(([parent, children]) => parent + '（' + children.join('，') + '）').join('，') + '。';
const exampleAlt = '列は' + example.headers.join('，') + '。' + example.rows.map(row =>
  row.slice(0, 4).join('，') + '，' + row[4] + '（下線）').join('。') + '。注記　' + example.note;

function build(values: number[]) {
  const model = spring2015Pm5Model(values);
  const blocks = prompt(5, values, id => {
    if (id === 'q5-customer-example') return figure(5, 'customer-example', values, example.caption, exampleAlt);
    if (id === 'q5-er') return figure(5, 'er', values, er.caption, erAlt);
    if (id === 'q5-tree') return figure(5, 'tree', values, tree.caption, treeAlt);
    if (id === 'q5-crud') return figure(5, 'crud', values, matrix.caption, '列は' + matrix.columns.join('，') + '。' +
      model.rows.map(([entity, row]) => entity + '：' + row.join('／')).join('。') + '。注記　' + matrix.notes);
    throw new Error('SOURCE_FORMAT');
  });
  return body(blocks, [
    { id: 'abcd', choices: choices(banks[5].abcd) },
    { id: 'ef', choices: choices(operationLabels) },
  ], [
    ...[2, 7, 5, 3].map((correct, i) => ({ id: 'abcd'[i], bank: 'abcd', correct })),
    ...model.answer.map((operation, i) => ({ id: 'ef'[i], bank: 'ef', correct: operationLabels.indexOf(operation) })),
  ],
  '契約の主キーは契約番号で，契約担当，関係顧客，保全手続から同じ契約を参照する（a）。保全手続は保全受付番号（b），帳票出力は帳票出力番号（c）で識別する。顧客の主キーは顧客IDで関係顧客へ引き継ぐ（d）。' +
  '関係顧客では契約番号・顧客IDと契約に対する関係の組を保持する。' + explanations[model.profile]);
}

export const legacy2015SpringPm5Definition: AfternoonBookletDefinition = {
  source: '2015h27h-fe-pm-5', title: '営業支援システム',
  version: '3.7.0', reference: [0], fields: [field('CRUDの対象となる機能とエンティティの組', 0, selectedCells.length - 1)],
  sourceAnswer: 'ウ／ク／カ／エ／カ／キ',
  notes: '物理22–27／冊子21–26。a〜d共有8択、e/f共有9択。名寄せ4項目の全一致、契約者件数、複合主キー、1日1回の保全受付、住所変更時の削除・再登録、解約時は関係顧客を変更しない条件、表の注記を保持。e/fで実際に問うエンティティと機能の組を変える。全有効条件のCRUD択は原の9候補を保持する。',
  publicNotes: 'E-R図と機能要件を保ち，CRUD表で操作を答えるエンティティと機能の組を変更しました。',
  build,
};
