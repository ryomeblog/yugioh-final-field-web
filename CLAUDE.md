# CLAUDE.md

## プロジェクト概要

遊戯王の展開（コンボ）を1ステップずつカード形式で紹介するWebアプリ。展開はパッケージとしてZIPダウンロード可能。

## 技術スタック

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** (@tailwindcss/vite プラグイン経由)
- **React Router 7** (HashRouter, GitHub Pages 対応)
- **@dnd-kit** (ドラッグ&ドロップ: 並び替え・画像配置)
- **idb** (IndexedDB ラッパー)
- **uuid** (ID 生成)
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

## デプロイ

- GitHub Pages (`base: "/yugioh-final-field/"`)
- HashRouter 使用 (GitHub Pages は SPA ルーティング非対応のため)

## 状態管理

- React Context + useReducer (ComboContext)
- IndexedDB (idb) で永続化
- 画像は IndexedDB に Blob 保存、表示時に ObjectURL 生成

## ファイル構成のルール

- エントリー: `src/main.tsx` (HashRouter をここで設定)
- スタイル: Tailwind CSS ユーティリティクラスを使用 (`src/index.css` に `@import "tailwindcss"`)
- コンポーネントファイルは PascalCase
- ページコンポーネントは `src/pages/` に配置
- 型定義は `src/types/index.ts` に集約

## 設計書

- `doc/screen-design.md` — 画面設計 + ワイヤーフレーム
- `doc/data-design.md` — データモデル + ZIP構造
- `doc/component-design.md` — コンポーネントツリー + Props定義
- `doc/state-design.md` — 状態管理 + データフロー
