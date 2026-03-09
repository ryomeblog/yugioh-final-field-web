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

## ルーティング

| パス | ページ | 説明 |
|------|--------|------|
| `/` | HomePage | 展開一覧 |
| `/combo/new` | ComboEditPage | 新規作成 |
| `/combo/:id` | ComboDetailPage | 詳細閲覧 |
| `/combo/:id/edit` | ComboEditPage | 編集 |

## ファイル構成

- `src/main.tsx` — エントリー (HashRouter + ComboProvider)
- `src/App.tsx` — ルーティング定義
- `src/types/index.ts` — 型定義 (Combo, ComboStep, BoardState 等)
- `src/db/index.ts` — IndexedDB CRUD (idb ラッパー)
- `src/contexts/comboContextValue.ts` — ComboContext + 型定義 (react-refresh対応で分離)
- `src/contexts/ComboContext.tsx` — ComboProvider (Reducer + IndexedDB同期)
- `src/hooks/useCombo.ts` — useCombo フック (react-refresh対応で分離)
- `src/hooks/useImageCache.ts` — 画像キャッシュ操作 (ObjectURL 管理)
- `src/hooks/useIsMobile.ts` — レスポンシブ判定 (640px 未満 = モバイル)
- `src/hooks/useTutorial.ts` — チュートリアル状態管理 (localStorage)
- `src/hooks/useZip.ts` — ZIP インポート/エクスポート
- `src/components/layout/` — Header
- `src/components/common/` — Modal, ImportModal, DropZone, ConfirmModal
- `src/components/tutorial/` — TutorialOverlay, tutorialSteps
- `src/components/board/` — BoardGrid, BoardMini, ChainBadge
- `src/components/combo/` — ComboCard, StartingCards, StepCard, StepCardReadonly, ImageGallery
- `src/components/home/` — DownloadModal, SettingsModal
- `src/pages/` — HomePage, ComboDetailPage, ComboEditPage
- コンポーネントファイルは PascalCase

## レスポンシブ対応

- ブレークポイント: 640px (Tailwind `sm`)
- 盤面 (BoardGrid): CSS grid `1fr` + `aspect-square` で自動縮小、maxWidth で上限制限
- 画像サイズ: `useIsMobile` フックでモバイル/デスクトップのサイズを切り替え
- ホーム画面: グリッド 1列 (モバイル) → 2列 (デスクトップ)
- 詳細画面: テキスト+盤面が縦並び (モバイル) → 横並び (デスクトップ)

## 設計書

- `doc/screen-design.md` — 画面設計 + ワイヤーフレーム
- `doc/data-design.md` — データモデル + ZIP構造
- `doc/component-design.md` — コンポーネントツリー + Props定義
- `doc/state-design.md` — 状態管理 + データフロー
