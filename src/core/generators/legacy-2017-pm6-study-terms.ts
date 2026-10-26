import type{StudyTerm}from'../study-acronyms';import type{Question}from'../types';
export const legacy2017Pm6StudyTerms:StudyTerm[]=[
  {
    "term": "ウォータフォールモデル",
    "meaning": "開発を外部設計，内部設計，プログラム開発，結合テスト，総合テストという工程で進めるという本問の開発方式。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "外部設計",
    "meaning": "利用者や外部システムから見える機能・入出力を具体化する工程。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "内部設計",
    "meaning": "外部から求められる機能を内部のデータや処理でどのように実現するか定める工程。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "プログラム開発（単体テストを含む）",
    "meaning": "プログラムを作成し個々のプログラムの動作を確かめる工程。本問では単体テストをこの工程に含める。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "結合テスト",
    "meaning": "組み合わせたプログラムの連携を確かめる工程。原問の工程区分を，別システム間のインタフェースだけの試験へ狭めない。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "総合テスト",
    "meaning": "構築したシステム全体について必要な機能や動作を確かめる工程。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "工数",
    "meaning": "作業に必要な労力の量。人数と作業期間の積などで表し，期間だけや人数だけとは区別する。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "人月",
    "meaning": "1人が1か月作業する量を表す工数の単位。配置人数（人）と期間（月）を掛けた量で，月当たり人数そのものではない。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "配分月数",
    "meaning": "あらかじめ各工程へ配分した開発期間（月数）。本問では工程ごとに工数をこの月数で割る。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "切上げ",
    "meaning": "端数があるとき必要量を満たす次の整数へ上げること。割り切れる人数へ余分な1を加えない。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "平準化",
    "meaning": "必要人数の月ごとのばらつきを小さくすること。本問の後半は作業量を保って特定の3か月の人数を等しくする。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  },
  {
    "term": "A社・B社，一期・二期，a〜f",
    "meaning": "問題内の会社・開発段階・解答欄の識別子であり，英字略語の展開対象ではない。",
    "sources": [
      "2017h29h-fe-pm-6"
    ]
  }
];
export const legacy2017Pm6StudyTermReview={source:'2017h29h-fe-pm-6',terms:legacy2017Pm6StudyTerms.map(t=>t.term),note:'原五工程/工数/人月/切上げ/平準化を問6だけに対応。会社や欄は略語ではない。1か月4週や非表示人数を補わない。'};
export function isLegacy2017Pm6(q:Question){return q.origin.sourceRefs.length>0&&q.origin.sourceRefs.every(r=>r.sourceId==='source-ipa-2017h29h-fe-pm-6-qs'&&r.locator.year===2017&&r.locator.period==='春期'&&r.locator.timeSlot==='午後'&&r.locator.questionNumber==='6');}
export function pm6Terms(q:Question){return isLegacy2017Pm6(q)?structuredClone(legacy2017Pm6StudyTerms):[];}
