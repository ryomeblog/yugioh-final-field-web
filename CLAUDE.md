# CLAUDE.md

## プロジェクト概要

遊戯王の展開（コンボ）を1ステップずつカード形式で紹介するWebアプリ。展開はパッケージとしてZIPダウンロード可能。

## 技術スタック

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** (@tailwindcss/vite プラグイン経由)
- **React Router 7** (BrowserRouter)
- **JSZip** + **file-saver** (ZIP生成・ダウンロード)
- **react-icons** (アイコン)
- **ESLint 9** + **Prettier 3** (eslint-plugin-prettier で統合)

## コマンド

- `npm run dev` — 開発サーバー起動
- `npm run build` — TypeScriptチェック + プロダクションビルド
- `npm run lint` — ESLint実行

## コード規約

- **ダブルクォート** (`"`) を使用
- セミコロンあり、末尾カンマあり
- インデント: スペース2つ
- Prettier + ESLint で自動整形 (保存時)

## パスエイリアス

- `@/*` → `src/*` (tsconfig.app.json + vite.config.ts で設定済み)

## ファイル構成のルール

- エントリー: `src/main.tsx` (BrowserRouter をここで設定)
- スタイル: Tailwind CSS ユーティリティクラスを使用 (`src/index.css` に `@import "tailwindcss"`)
- コンポーネントファイルは PascalCase
