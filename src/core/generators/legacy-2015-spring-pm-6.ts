import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, table } from './definition';
import { spring2015Pm0508Banks as banks, spring2015Pm0508Source as source } from './legacy-2015-spring-pm-05-08-source';
import {
  spring2015Pm0508Body as body, spring2015Pm0508Choices as choices, spring2015Pm0508Figure as figure,
  spring2015Pm0508Index as index, spring2015Pm0508Prompt as prompt,
} from './legacy-2015-spring-pm-05-08-shared';

const settings = [
  { members: [2, 3, 4], allMeetings: 2, teamMeetings: 4 },
  { members: [3, 4, 5], allMeetings: 1, teamMeetings: 2 },
  { members: [1, 2, 3], allMeetings: 3, teamMeetings: 3 },
  { members: [2, 4, 5], allMeetings: 3, teamMeetings: 2 },
] as const;
const plan = source['q6-plan'], gw = source['q6-gw'];
const teams = source['q6-org'].children;
const teamCount = teams.length;
const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

export function spring2015Pm6Model(values: number[]) {
  const { members, allMeetings, teamMeetings } = settings[index(values, settings.length)];
  const totalMeetings = allMeetings + teamMeetings * teamCount;
  const directConnections = teamCount + sum(members);
  const meetingRows = plan.subtables[1].rows.map((row, i) =>
    row.map((cell, j) => j !== 3 ? cell : i === 0 ? '月' + allMeetings + '回' : 'チームごとに月' + teamMeetings + '回'));
  return {
    members, allMeetings, teamMeetings, totalMeetings, directConnections,
    subtables: [plan.subtables[0], { ...plan.subtables[1], rows: meetingRows }, plan.subtables[2]],
    bBank: [allMeetings, allMeetings + teamMeetings, teamMeetings * teamCount, totalMeetings].sort((a, b) => a - b),
    cBank: [teamCount, 2 * teamCount, directConnections, 2 * directConnections],
  };
}

const graphAlt = source['q6-edges'].graphs.map(graph => graph.label + '。' +
  graph.edges.map(([a, b]) => a + 'と' + b).join('，') + 'を線で結ぶ。').join('');
const permissionMeaning = (mark: string) => gw.legend[mark as keyof typeof gw.legend];
const gwAlt = gw.rows.map(([i, name, cells]) => i + ' ' + name + '：' +
  ('blank' in cells ? 'PMと三チームのTL・担当者の七列を覆う空欄g' : cells.join('，'))).join('。') +
  '。網掛けは非表示。●は' + gw.legend['●'] + '，○は' + gw.legend['○'] + '，×は' + gw.legend['×'] + '。';
export function spring2015Pm6PermissionsAlt(choices: readonly string[]) {
  return gw.columns.slice(2).map((head, i) => head + '：' + permissionMeaning(choices[i])).join('。') + '。';
}

function build(values: number[]) {
  const m = spring2015Pm6Model(values);
  const blocks = prompt(6, values, id => {
    switch (id) {
      case 'q6-org': return figure(6, 'org', values, source[id].caption, 'PMを頂点とし，' + teams.join('，') + 'が下に接続する。');
      case 'q6-staff': return table(source[id].caption, [...source[id].headers], [
        ['TL（人）', '1', '1', '1'], ['担当者（人）', ...m.members.map(String)],
      ]);
      case 'q6-plan': return figure(6, 'plan', values, plan.caption, '2. 計画。' + m.subtables.map(t =>
        t.heading + '。列は' + t.columns.join('，') + '。' + t.rows.map(row => row.join('／')).join('。') +
        ('note' in t ? '。注記　' + t.note : '')).join('。') + '。');
      case 'q6-edges': return figure(6, 'edges', values, source[id].caption, graphAlt);
      case 'q6-gw': return figure(6, 'gw', values, gw.caption, '列は' + gw.columns.join('，') + '。' + gwAlt);
      default: throw new Error('SOURCE_FORMAT');
    }
  });
  const gChoices = banks[6].g.map((row, option) => [
    figure(6, 'permissions-choice', [...values, option], 'GWの設定ルール', spring2015Pm6PermissionsAlt(row)),
  ]);
  return body(blocks, [
    { id: 'a', choices: choices(banks[6].a) }, { id: 'b', choices: choices(m.bBank) },
    { id: 'c', choices: choices(m.cBank) }, { id: 'd', choices: choices(banks[6].d) },
    { id: 'e', choices: choices(banks[6].e) }, { id: 'f', choices: choices(banks[6].f) },
    { id: 'g', choices: gChoices },
  ], [
    { id: 'a', bank: 'a', correct: 0 }, { id: 'b', bank: 'b', correct: m.bBank.indexOf(m.totalMeetings) },
    { id: 'c', bank: 'c', correct: m.cBank.indexOf(m.directConnections) }, { id: 'd', bank: 'd', correct: 2 },
    { id: 'e', bank: 'e', correct: 1 }, { id: 'f', bank: 'f', correct: 1 },
    { id: 'g', bank: 'g', correct: 2 },
  ],
  '議事録の管理者はPMであり，登録と配布もPMが担う。定期のプロジェクト会議は全体進捗会議の月' +
  m.allMeetings + '回に，' + teamCount + 'チームそれぞれ月' + m.teamMeetings + '回のチーム進捗会議を足して月' + m.totalMeetings +
  '回である。随時の設計検討会と設計書レビューは数えない。方法①はPMとTLの間が' + teamCount + '，TLと各担当者の間が' +
  m.members.join('＋') + 'なので合計' + m.directConnections + '。方法②はPMとTLを含む全メンバの間に同じ数の関係がある。' +
  '方法①を保ち報告履歴も残すには，全担当者からTL，TLからPMの両方を電子メールで報告する。' +
  '計画書は担当者に加えて従来のTLも含む全チームのメンバに配布する。議事録の登録と参照は管理者PMに許可し，配布先の各TLと担当者は参照だけを許可する。');
}

export const legacy2015SpringPm6Definition: AfternoonBookletDefinition = {
  source: '2015h27h-fe-pm-6', title: 'プロジェクトにおけるコミュニケーションの計画',
  version: '3.7.0', reference: [0], fields: [field('会議頻度とチームごとの担当者数', 0, settings.length - 1)],
  sourceAnswer: 'ア／エ／ウ／ウ／イ／イ／ウ',
  notes: '物理28–32／冊子27–31。a/b/c各4択、d/e各3択、f2択、gは七列の4択。PMが文書の管理者、TLと担当者、定期と随時の区別、二者間を一つと数える関係、確認と履歴、GWの記号・網掛け・gの結合を保持。4条件で実際の開催回数とチーム人数を表へバインド。元の数値択の役割と順序を保つため記号位置は固定するが、b/cの正答数値・計算は変化する。',
  publicNotes: 'チームの担当者数と会議の開催頻度を変更し，配布の回数と関係の数を同じ条件から求めます。',
  build,
};
