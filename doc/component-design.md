# コンポーネント設計書

## ディレクトリ構成

```
src/
├── main.tsx                          # エントリーポイント (HashRouter)
├── App.tsx                           # ルーティング定義
├── index.css                         # Tailwind CSS エントリー
│
├── types/
│   └── index.ts                      # 型定義 (Combo, ComboStep, BoardState 等)
│
├── db/
│   └── index.ts                      # IndexedDB 操作 (idb ラッパー)
│
├── hooks/
│   ├── useCombo.ts                   # 展開データ CRUD (Context + useReducer)
│   ├── useImageCache.ts             # 画像キャッシュ操作
│   ├── useIsMobile.ts               # レスポンシブ判定 (640px ブレークポイント)
│   ├── useTutorial.ts              # チュートリアル状態管理 (localStorage)
│   └── useZip.ts                    # ZIP インポート/エクスポート
│
├── contexts/
│   └── ComboContext.tsx              # 展開データの Context Provider
│
├── components/
│   ├── layout/
│   │   └── Header.tsx               # 共通ヘッダ
│   │
│   ├── common/
│   │   ├── Modal.tsx                # 汎用モーダル
│   │   ├── ImportModal.tsx          # ZIPインポートモーダル
│   │   ├── DropZone.tsx             # D&D ファイルアップロードゾーン
│   │   ├── ConfirmModal.tsx         # 確認モーダル (未保存警告等)
│   │   └── ShareModal.tsx           # 共有URLモーダル (URL表示+コピー)
│   │
│   ├── board/
│   │   ├── BoardGrid.tsx            # 5x5 盤面グリッド (DroppableCell 内包、セルメニュー付き)
│   │   ├── BoardMini.tsx            # 詳細画面用 縮小盤面 (86:59 比率)
│   │   └── ChainBadge.tsx           # チェーン番号バッジ (SVG)
│   │
│   ├── combo/
│   │   ├── ComboCard.tsx            # ホーム画面の展開カード
│   │   ├── StartingCards.tsx        # 初動札セクション
│   │   ├── StepCard.tsx             # 編集用インタラクティブカード
│   │   ├── StepCardReadonly.tsx     # 詳細画面用 読み取り専用カード
│   │   └── ImageGallery.tsx         # 画面下部 固定画像一覧
│   │
│   ├── tutorial/
│   │   ├── TutorialOverlay.tsx      # チュートリアルモーダル (スライド形式、画像+テキスト)
│   │   └── tutorialSteps.ts         # チュートリアルステップ定義
│   │
│   └── home/
│       ├── DownloadModal.tsx        # ダウンロードモーダル (展開選択)
│       └── SettingsModal.tsx        # 設定モーダル (チュートリアル管理)
│
├── utils/
│   └── share.ts                     # URL共有 エンコード/デコード (pako + Base64url)
│
└── pages/
    ├── HomePage.tsx                  # ホーム画面
    ├── ComboEditPage.tsx            # 展開作成・編集画面 (新規/既存兼用)
    ├── ComboDetailPage.tsx          # 展開詳細画面
    └── SharedComboPage.tsx          # 共有展開画面 (URL共有された展開の閲覧)
```

## コンポーネントツリー

```
App
├── Routes
│   ├── HomePage
│   │   ├── Header [Import, Download, +, 設定]
│   │   ├── ComboCard[] (グリッド)
│   │   ├── ImportModal
│   │   │   └── DropZone
│   │   ├── DownloadModal
│   │   │   └── ComboCard[] (選択式)
│   │   ├── SettingsModal (チュートリアル管理)
│   │   └── TutorialOverlay?
│   │
│   ├── ComboCreatePage / ComboEditPage
│   │   ├── DndContext (ページ全体をラップ、space-y-4の外にgallery配置)
│   │   │   ├── Header [←, Import, DL, 保存, 削除]
│   │   │   ├── TitleInput
│   │   │   ├── StartingCards (バツボタン常時表示)
│   │   │   ├── StepCard[]
│   │   │   │   ├── DragHandle
│   │   │   │   ├── TextArea
│   │   │   │   ├── BoardGrid (isDropTarget=常時true)
│   │   │   │   │   └── DroppableCell[]
│   │   │   │   │       ├── CardImage (攻撃/守備表示対応)
│   │   │   │   │       ├── ChainBadge?
│   │   │   │   │       └── CellMenu (チェーン+/-、攻撃/守備切替)
│   │   │   │   └── DeleteButton
│   │   │   ├── AddStepButton
│   │   │   ├── ImageGallery (fixed bottom, ボトムシート、追加+URL+クリアボタン)
│   │   │   └── DragOverlay (ドラッグ中カード画像)
│   │   ├── ImportModal
│   │   ├── ConfirmModal (未保存警告)
│   │   ├── ConfirmModal (削除確認)
│   │   └── TutorialOverlay?
│   │
│   ├── ComboDetailPage
│   │   ├── Header [←, 共有, DL, 編集, 削除]
│   │   ├── StartingCards (readonly)
│   │   ├── StepCardReadonly[]
│   │   │   ├── Text (左側)
│   │   │   └── BoardMini (右側, 縮小)
│   │   │       └── ChainBadge?
│   │   ├── ConfirmModal (削除確認)
│   │   ├── ShareModal (共有URL表示)
│   │   └── TutorialOverlay?
│   │
│   └── SharedComboPage
│       ├── Header [←, タイトル]
│       ├── DndContext (StartingCards用)
│       │   └── StartingCards (readonly)
│       └── StepCardReadonly[]
│           ├── Text (左側)
│           └── BoardMini (右側, 縮小)
│               └── ChainBadge?
```

## 主要コンポーネント仕様

### Header

| Props | 型 | 説明 |
|-------|----|------|
| title | string | ヘッダタイトル |
| leftAction | ReactNode? | 左側アクション (戻る矢印等) |
| actions | ReactNode? | 右側アクションボタン群 |

### Modal

| Props | 型 | 説明 |
|-------|----|------|
| isOpen | boolean | 表示状態 |
| onClose | () => void | 閉じるコールバック |
| title | string | モーダルタイトル |
| children | ReactNode | モーダル内コンテンツ |

### ImportModal

| Props | 型 | 説明 |
|-------|----|------|
| isOpen | boolean | 表示状態 |
| onClose | () => void | 閉じるコールバック |
| onImport | (file: File) => Promise\<void\> | インポート処理コールバック |

### DropZone

| Props | 型 | 説明 |
|-------|----|------|
| onFileSelect | (file: File) => void | ファイル選択コールバック |
| accept | string | 許可するファイル形式 (例: ".zip") |

### BoardGrid

| Props | 型 | 説明 |
|-------|----|------|
| board | BoardState | 盤面データ |
| editable | boolean | 編集可能かどうか |
| isDropTarget | boolean? | ドロップ対象かどうか (true のときのみセルがハイライト) |
| onCellAction | (row, col, action: CellAction) => void | セルアクションコールバック |
| getImageUrl | (id: string) => string \| null | 画像URL取得 |

CellAction 型:
- `{ type: "chain-add" }` — チェーン追加 (max+1)
- `{ type: "chain-remove" }` — チェーン削除
- `{ type: "chain-set"; value: number }` — チェーン番号設定
- `{ type: "delete" }` — カード削除
- `{ type: "toggle-position" }` — 攻撃/守備切替

セルは正方形。CSS grid `repeat(5, 1fr)` + `aspect-square` でレスポンシブに自動縮小。maxWidth=366px (70px×5+gap) で上限制限。
カード画像はセル内に 86:59 比率で中央配置。守備表示は左に倒す (rotate -90deg)。

### BoardMini

| Props | 型 | 説明 |
|-------|----|------|
| board | BoardState | 盤面データ |
| cellSize | number | セルサイズ (デフォルト: 48, 正方形) |
| getImageUrl | (id: string) => string \| null | 画像URL取得 |

正方形セル。カード画像は 86:59 比率で中央配置。守備表示は左に倒す (rotate -90deg)。

### ChainBadge

| Props | 型 | 説明 |
|-------|----|------|
| number | number | チェーン番号 (1〜20) |
| size | number | バッジサイズ |

### ComboCard

| Props | 型 | 説明 |
|-------|----|------|
| combo | Combo | 展開データ |
| onClick | () => void | クリックコールバック |
| selectable | boolean? | 選択モード (ダウンロードモーダル用) |
| selected | boolean? | 選択状態 |
| onSelect | () => void? | 選択トグルコールバック |

### StartingCards

| Props | 型 | 説明 |
|-------|----|------|
| cards | StartingCard[] | 初動札データ |
| editable | boolean | 編集可能か |
| onAdd | (imageId: string) => void | 画像追加コールバック |
| onRemove | (cardId: string) => void | 画像削除コールバック |

### StepCard

| Props | 型 | 説明 |
|-------|----|------|
| step | ComboStep | ステップデータ |
| index | number | ステップ番号 |
| onTextChange | (text: string) => void | テキスト変更 |
| onBoardChange | (board: BoardState) => void | 盤面変更 |
| onDelete | () => void | 削除コールバック |
| getImageUrl | (id: string) => string \| null | 画像URL取得 |

### StepCardReadonly

| Props | 型 | 説明 |
|-------|----|------|
| step | ComboStep | ステップデータ |
| index | number | ステップ番号 |

### ImageGallery

| Props | 型 | 説明 |
|-------|----|------|
| images | CachedImage[] | 画像一覧 |
| getImageUrl | (id: string) => string \| null | 画像URL取得 |
| onAddImages | (files: FileList) => void | ファイル選択で画像追加 |
| onAddImageFromUrl | ((url: string) => Promise\<void\>)? | URL から画像追加 (省略時はURLボタン非表示) |
| onClearImages | (() => void)? | 画像一覧クリア (省略時はクリアボタン非表示) |
| isOpen | boolean | ボトムシートの開閉状態 |
| onToggle | () => void | ボトムシートの開閉トグル |

### DownloadModal

| Props | 型 | 説明 |
|-------|----|------|
| isOpen | boolean | 表示状態 |
| onClose | () => void | 閉じるコールバック |
| combos | Combo[] | 展開一覧 |
| onDownload | (comboIds: string[]) => Promise\<void\> | ダウンロードコールバック |

### ConfirmModal

| Props | 型 | 説明 |
|-------|----|------|
| isOpen | boolean | 表示状態 |
| onClose | () => void | 閉じるコールバック |
| onConfirm | () => void | 確認コールバック |
| title | string | タイトル |
| message | string | メッセージ |
| confirmLabel | string | 確認ボタンラベル |

### ShareModal

| Props | 型 | 説明 |
|-------|----|------|
| isOpen | boolean | 表示状態 |
| onClose | () => void | 閉じるコールバック |
| url | string | 共有URL |
| warnings | string[] | 警告メッセージ一覧 (blob画像不可、URL長超過等) |
