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
│   ├── useComboStore.ts              # 展開データ CRUD (Context + useReducer)
│   └── useImageCache.ts             # 画像キャッシュ操作
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
│   │   └── ConfirmModal.tsx         # 確認モーダル (未保存警告等)
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
│   └── home/
│       └── DownloadModal.tsx        # ダウンロードモーダル (展開選択)
│
└── pages/
    ├── HomePage.tsx                  # ホーム画面
    ├── ComboCreatePage.tsx          # 展開作成画面
    ├── ComboEditPage.tsx            # 展開編集画面
    └── ComboDetailPage.tsx          # 展開詳細画面
```

## コンポーネントツリー

```
App
├── Routes
│   ├── HomePage
│   │   ├── Header [Import, Download, +]
│   │   ├── ComboCard[] (グリッド)
│   │   ├── ImportModal
│   │   │   └── DropZone
│   │   └── DownloadModal
│   │       └── ComboCard[] (選択式)
│   │
│   ├── ComboCreatePage / ComboEditPage
│   │   ├── Header [←, Import, DL, 保存, 削除]
│   │   ├── TitleInput
│   │   ├── StartingCards
│   │   ├── DndContext (sortable + DragOverlay)
│   │   │   ├── StepCard[]
│   │   │   │   ├── DragHandle
│   │   │   │   ├── TextArea
│   │   │   │   ├── BoardGrid (isDropTarget=選択中のみ)
│   │   │   │   │   └── DroppableCell[]
│   │   │   │   │       ├── CardImage (攻撃/守備表示対応)
│   │   │   │   │       ├── ChainBadge?
│   │   │   │   │       └── CellMenu (チェーン+/-、攻撃/守備切替)
│   │   │   │   └── DeleteButton
│   │   │   └── DragOverlay (ドラッグ中カード画像)
│   │   ├── AddStepButton
│   │   ├── ImageGallery (fixed bottom)
│   │   ├── ImportModal
│   │   └── ConfirmModal (未保存警告)
│   │
│   └── ComboDetailPage
│       ├── Header [←, 編集]
│       ├── StartingCards (readonly)
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

セルサイズ: 幅44px × 高さ64px (86:59 比率)。守備表示のカードは90度回転して表示。

### BoardMini

| Props | 型 | 説明 |
|-------|----|------|
| board | BoardState | 盤面データ |
| cellWidth | number | セル幅 (デフォルト: 20, 高さは86:59比率で自動計算) |
| getImageUrl | (id: string) => string \| null | 画像URL取得 |

守備表示のカードは90度回転して表示。

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
| isSelected | boolean | 選択状態 |
| onSelect | () => void | 選択コールバック |
| onTextChange | (text: string) => void | テキスト変更 |
| onBoardChange | (board: BoardState) => void | 盤面変更 |
| onDelete | () => void | 削除コールバック |

### StepCardReadonly

| Props | 型 | 説明 |
|-------|----|------|
| step | ComboStep | ステップデータ |
| index | number | ステップ番号 |

### ImageGallery

| Props | 型 | 説明 |
|-------|----|------|
| images | CachedImage[] | 画像一覧 |
| onAddImages | (files: FileList) => void | 画像追加 |

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
