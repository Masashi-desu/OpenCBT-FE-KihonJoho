export const sidebar = [
  { text: 'プロジェクト', items: [
    { text: '仕様の入口', link: '/' },
    { text: '目的・範囲・機能', link: '/overview' },
    { text: '実装・収録データ・配信', link: '/implementation' }
  ] },
  { text: '根拠と取り込み', items: [
    { text: '公式情報の調査結果', link: '/research' },
    { text: '参照資料と調査限界', link: '/references' },
    { text: '問題取り込み・利用条件', link: '/ingestion' },
    { text: '問題作成・可変問題の品質規約', link: '/question-authoring' },
    { text: 'UI資料の参照方針', link: '/ui-reference' }
  ] },
  { text: 'データの仕様', items: [
    { text: 'データモデル・整合性', link: '/data-model' },
    { text: '本文・図表・疑似言語', link: '/content-format' },
    { text: '図描画・問題生成・改変記録', link: '/diagram-generation' },
    { text: '全問題の生成対応', link: '/generation-coverage' },
    { text: 'JSON Schema', link: '/schemas' },
    { text: '全フィールド辞書', link: '/schema-reference' },
    { text: 'JSONサンプル・不正例', link: '/samples' },
    { text: '出題設定・セッション・結果', link: '/sessions' }
  ] },
  { text: '動作と保守', items: [
    { text: '画面・操作・状態遷移', link: '/screens' },
    { text: '出典・改変・権利表示', link: '/attribution' },
    { text: 'アーキテクチャ・安全性', link: '/architecture' },
    { text: '更新・訂正・取り下げ', link: '/maintenance' },
    { text: '受入条件・検証規則', link: '/acceptance' }
  ] },
  { text: 'ドキュメントの運用', items: [
    { text: '起動・編集・検証方法', link: '/contributing' },
    { text: 'ロゴ・ファビコンの生成', link: '/brand-icons' },
    { text: 'OpenGraph・共有資産の管理', link: '/sharing-assets' },
    { text: '今回の検証記録', link: '/verification' },
    { text: '公開前査読・修正', link: '/review' },
    { text: 'ライセンスの適用範囲', link: '/licenses' }
  ] }
];
