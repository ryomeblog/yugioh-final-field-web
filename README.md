# 遊戯王 展開解説アプリ (yugioh-final-field-web)

遊戯王の展開（コンボ）を1ステップずつカード形式で解説するWebアプリケーション。
展開パッケージはZIPファイルとしてダウンロード可能。

## 技術スタック

| カテゴリ | ライブラリ | バージョン | 用途 |
|---------|-----------|-----------|------|
| フレームワーク | React | 19.x | UI構築 |
| ビルドツール | Vite | 7.x | 開発サーバー・バンドル |
| 言語 | TypeScript | 5.9 | 型安全 |
| スタイリング | Tailwind CSS | 4.x | ユーティリティCSS (@tailwindcss/vite) |
| ルーティング | React Router | 7.x | SPA ルーティング (HashRouter) |
| D&D | @dnd-kit | - | ドラッグ&ドロップ (並び替え・画像配置) |
| DB | idb | - | IndexedDB ラッパー |
| UUID | uuid | - | ID 生成 |
| ZIP生成 | JSZip | 3.x | 展開パッケージのZIPダウンロード |
| ファイル保存 | file-saver | 2.x | ブラウザでのファイルダウンロード |
| アイコン | react-icons | - | UIアイコン |
| Lint | ESLint | 9.x | コード品質チェック |
| フォーマッター | Prettier | 3.x | コード自動整形 |

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## Lint & Format

```bash
# ESLint
npm run lint

# Prettier (チェック)
npx prettier --check .

# Prettier (自動修正)
npx prettier --write .
```

## コード規約

- ダブルクォート使用 (`"`)
- セミコロンあり
- 末尾カンマあり (trailing comma)
- インデント: スペース2つ
- VSCode で保存時自動フォーマット有効 (`.vscode/settings.json`)

## デプロイ

GitHub Pages にデプロイ (`base: "/yugioh-final-field/"`)

## 設計書

- [画面設計書](doc/screen-design.md)
- [データ設計書](doc/data-design.md)
- [コンポーネント設計書](doc/component-design.md)
- [状態管理設計書](doc/state-design.md)

## ディレクトリ構成

```
src/
├── main.tsx          # エントリーポイント (HashRouter)
├── index.css         # Tailwind CSS エントリー
├── App.tsx           # ルーティング定義
├── types/            # 型定義
├── db/               # IndexedDB 操作
├── hooks/            # Custom Hooks
├── contexts/         # React Context
├── components/       # UIコンポーネント
│   ├── layout/       # レイアウト
│   ├── common/       # 汎用
│   ├── board/        # 盤面関連
│   ├── combo/        # 展開関連
│   └── home/         # ホーム画面固有
└── pages/            # ページコンポーネント
```

## パスエイリアス

`@/` で `src/` を参照可能:

```tsx
import { Something } from "@/components/Something";
```
