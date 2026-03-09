# CLAUDE.md

## プロジェクト概要

遊戯王の展開（コンボ）を1ステップずつカード形式で紹介するWebアプリ「遊戯王 展開ログ」。展開はパッケージとしてZIPダウンロード可能。

## 技術スタック

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** (@tailwindcss/vite プラグイン経由)
- **React Router 7** (HashRouter, GitHub Pages 対応)
- **@dnd-kit** (ドラッグ&ドロップ: 並び替え・画像配置)
- **idb** (IndexedDB ラッパー)
- **uuid** (ID 生成)
- **JSZip** + **file-saver** (ZIP生成・ダウンロード)
- **pako** (deflate/inflate 圧縮、URL共有用)
- **vite-plugin-pwa** (PWA対応: Service Worker, マニフェスト自動生成)
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

- GitHub Pages (`base: "/yugioh-final-field-web/"`)
- HashRouter 使用 (GitHub Pages は SPA ルーティング非対応のため)
- GitHub Actions (`.github/workflows/deploy.yml`) で main ブランチ push 時に自動デプロイ
  - `npm ci` → `npm run build` → `actions/upload-pages-artifact` → `actions/deploy-pages`

## PWA

- vite-plugin-pwa (`registerType: "autoUpdate"`) でマニフェスト・Service Worker を自動生成
- アイコン: `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`
- Workbox ランタイムキャッシュ: Neuron カード画像 (`get_image.action`) を CacheFirst で30日間・最大500件キャッシュ
- `display: "standalone"`, `theme_color: "#111827"`

## 状態管理

- React Context + useReducer (ComboContext)
- IndexedDB (idb) で永続化
- 画像は IndexedDB に Blob 保存、表示時に ObjectURL 生成
- 外部URLから追加した画像は Blob を空にして externalUrl を保持し、表示時はそのURLを直接参照 (CORS回避)

## ルーティング

| パス | ページ | 説明 |
|------|--------|------|
| `/` | HomePage | 展開一覧 |
| `/combo/new` | ComboEditPage | 新規作成 |
| `/combo/:id` | ComboDetailPage | 詳細閲覧 |
| `/combo/:id/edit` | ComboEditPage | 編集 |
| `/share?d=<encoded>` | SharedComboPage | URL共有された展開のインポート (IndexedDBに保存後、詳細画面にリダイレクト) |

## ファイル構成

- `src/main.tsx` — エントリー (HashRouter + ComboProvider)
- `src/App.tsx` — ルーティング定義
- `src/types/index.ts` — 型定義 (Combo, ComboStep, BoardState 等)
- `src/db/index.ts` — IndexedDB CRUD (idb ラッパー)
- `src/contexts/comboContextValue.ts` — ComboContext + 型定義 (react-refresh対応で分離)
- `src/contexts/ComboContext.tsx` — ComboProvider (Reducer + IndexedDB同期)
- `src/hooks/useCombo.ts` — useCombo フック (react-refresh対応で分離)
- `src/hooks/useImageCache.ts` — 画像キャッシュ操作 (ObjectURL 管理、外部URL参照)
- `src/hooks/useIsMobile.ts` — レスポンシブ判定 (640px 未満 = モバイル)
- `src/hooks/useTutorial.ts` — チュートリアル状態管理 (localStorage)
- `src/hooks/useZip.ts` — ZIP インポート/エクスポート
- `src/utils/share.ts` — URL共有 エンコード/デコード (pako + Base64url)
- `src/utils/neuron.ts` — Neuron デッキURL解析 (カード画像URL取得、cid抽出)
- `src/components/layout/` — Header
- `src/components/common/` — Modal, ImportModal, DropZone, ConfirmModal, ShareModal
- `src/components/tutorial/` — TutorialOverlay, tutorialSteps
- `src/components/board/` — BoardGrid, BoardMini, ChainBadge
- `src/components/combo/` — ComboCard, StartingCards, StepCard, StepCardReadonly, ImageGallery
- `src/components/home/` — DownloadModal, SettingsModal
- `src/pages/` — HomePage, ComboDetailPage, ComboEditPage, SharedComboPage
- `.github/workflows/deploy.yml` — GitHub Pages 自動デプロイ
- `public/tutorial/` — チュートリアル画像
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` — PWA アイコン
- コンポーネントファイルは PascalCase

## レスポンシブ対応

- ブレークポイント: 640px (Tailwind `sm`)
- 盤面 (BoardGrid): CSS grid `1fr` + `aspect-square` で自動縮小、maxWidth で上限制限
- 画像サイズ: `useIsMobile` フックでモバイル/デスクトップのサイズを切り替え
- ホーム画面: グリッド 1列 (モバイル) → 2列 (デスクトップ)
- 詳細画面: テキスト+盤面が縦並び (モバイル) → 横並び (デスクトップ)

## Neuron連携

- 展開作成・編集画面に NEURON URL 入力欄を配置。取得ボタンでデッキのカード画像を一括取得
- CORSプロキシ (`api.codetabs.com`) 経由でNeuronデッキページのHTMLを取得し、`get_image.action` URLを解析
- 画像URLから `cid` (カードID) を抽出して一意識別に使用
- URL共有時: neuronUrlがある場合は `imgs` に完全URLではなく `cid` のみを格納 (URL短縮)
- 共有URL受信時: Neuron URLから全画像を再取得し `cid→url` マップで解決
- neuronUrlは `Combo.neuronUrl` に保存、`ShareData.n` に格納
- 展開編集画面: 既存展開にneuronUrlがある場合、ページ表示時に自動でNeuron画像を取得 (neuronAutoFetched ref で二重取得防止)
- 画像の一意識別: `extractCid(url)` でcidを抽出し、重複画像を排除

## 画像管理

- 画像は展開ごとに分離管理 (`comboImageIds: Set<string>` を ComboEditPage で保持)
- 画像一覧には現在編集中の展開に属する画像のみ表示
- useImageCache の `saveImage()` で CachedImage を直接保存可能 (blob/externalUrl 両対応)
- ZIP エクスポート時: externalUrl 画像は `data.json` の `externalImages` にメタデータとして格納 (blob は空)
- ZIP インポート時: `externalImages` から復元し、neuronUrl があれば全画像取得 + cid重複排除

## 設計書

- `doc/screen-design.md` — 画面設計 + ワイヤーフレーム
- `doc/data-design.md` — データモデル + ZIP構造
- `doc/component-design.md` — コンポーネントツリー + Props定義
- `doc/state-design.md` — 状態管理 + データフロー
