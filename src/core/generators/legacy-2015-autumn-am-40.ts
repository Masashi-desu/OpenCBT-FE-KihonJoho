import { field, p, strings, type GenerationDefinition, variableNotes } from './definition';

const schemes = {
  jisec: {
    name: 'ITセキュリティ評価及び認証制度（JISEC）',
    description: 'ISO/IEC 15408を用いて，IT製品のセキュリティ機能が要求を満たすかを評価し，評価結果を認証する。',
    distinction: 'アのJISECは，IT製品のセキュリティ機能を評価する。',
  },
  privacyMark: {
    name: 'プライバシーマーク制度',
    description: '事業者ごとの個人情報管理をJIS Q 15001に沿って審査し，適合した事業者にマークの使用を認める。',
    distinction: 'イのプライバシーマーク制度は，事業者の個人情報管理の体制を評価する。',
  },
  isms: {
    name: 'ISMS適合性評価制度',
    description: '組織が情報資産を安全に扱うための管理の仕組みとその運用を，JIS Q 27001を基準に審査し，適合を認証する。',
    distinction: 'ウのISMS適合性評価制度は，組織が定めた範囲で情報セキュリティ管理の仕組みと運用を評価する。',
  },
  jcmvp: {
    name: '暗号モジュール試験及び認証制度（JCMVP）',
    description: '電子政府推奨暗号リストなどにある承認済み機能を実装した暗号モジュールを試験し，鍵などの保護を確認して認証する。',
    distinction: 'エのJCMVPは，暗号モジュールに実装された機能や鍵の保護を評価する。',
  },
} as const;

const choiceOrder = ['jisec', 'privacyMark', 'isms', 'jcmvp'] as const;
const targets = ['isms', 'jisec', 'privacyMark', 'jcmvp'] as const;
const labels = 'アイウエ';

export const legacy2015AutumnAm40: GenerationDefinition = {
  source: '2015h27a-fe-am-40',
  title: 'ISMS適合性評価制度と関連の認証制度',
  fields: [field('問う評価・認証制度', 0, targets.length - 1)],
  reference: [0],
  sourceAnswer: 'ウ',
  version: '3.2.0',
  notes: variableNotes + ' 2015年当時の制度と評価対象の区別を保つ。第三者の定型文を使わず、公開された制度上の事実を基に四択を独立編集する。本文では問う制度を変え、四択の役割と基準順を維持する。',
  build(values) {
    const [index] = values;
    if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= targets.length)
      throw Error('PARAMETER_CONSTRAINT');

    const target = targets[index];
    const correctIndex = choiceOrder.indexOf(target);
    return {
      prompt: [p(`${schemes[target].name}に当てはまる説明はどれか。`)],
      choices: strings(choiceOrder.map(scheme => schemes[scheme].description)),
      correctIndex,
      explanation: `正解は${labels[correctIndex]}。 ${choiceOrder.map(scheme => schemes[scheme].distinction).join('')}`,
    };
  },
};
