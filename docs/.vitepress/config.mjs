import { defineConfig } from 'vitepress';
import { sidebar } from './navigation.mjs';

export default defineConfig({
  lang: 'ja-JP',
  title: 'OpenCBT-FE-KihonJoho 仕様書',
  description: 'OpenCBT-FE-KihonJoho — 非公式のFE学習・操作練習環境の仕様',
  cleanUrls: true,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]],
  lastUpdated: false,
  markdown: { lineNumbers: true },
  vite: { server: { host: '127.0.0.1', strictPort: false } },
  themeConfig: {
    nav: [{ text: '仕様を読む', link: '/overview' }, { text: '調査根拠', link: '/references' }, { text: '起動方法', link: '/contributing' }],
    sidebar,
    outline: { level: [2, 3], label: 'このページの目次' },
    docFooter: { prev: '前のページ', next: '次のページ' },
    sidebarMenuLabel: '仕様一覧',
    skipToContentLabel: '本文へ移動',
    lightModeSwitchTitle: '明るいテーマに切り替える',
    darkModeSwitchTitle: '暗いテーマに切り替える',
    returnToTopLabel: '先頭へ',
    darkModeSwitchLabel: '表示テーマ',
    footer: { message: '非公式の学習用プロジェクト。IPA・試験運営事業者の公式サービスではありません。' }
  }
});
