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
│   │   ├── BoardGrid.tsx            # 5x5 盤面 SVG グリッド
│   │   ├── BoardCell.tsx            # 盤面の1セル
│   │   ├── BoardMini.tsx            # 詳細画面用 縮小盤面
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
│   │   ├── DndContext (sortable)
│   │   │   └── StepCard[]
│   │   │       ├── DragHandle
│   │   │       ├── TextArea
│   │   │       ├── BoardGrid
│   │   │       │   └── BoardCell[]
│   │   │       │       └── ChainBadge?
│   │   │       └── DeleteButton
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
| onCellClick | (row: number, col: number) => void | セルクリックコールバック |
| onDropImage | (row: number, col: number, imageId: string) => void | 画像ドロップコールバック |

### BoardCell

| Props | 型 | 説明 |
|-------|----|------|
| cell | BoardCell \| null | セルデータ (null = 無効セル) |
| row | number | 行番号 |
| col | number | 列番号 |
| editable | boolean | 編集可能か |
| onAction | (action: "chain" \| "delete" \| "close") => void | バッジアクション |

### BoardMini

| Props | 型 | 説明 |
|-------|----|------|
| board | BoardState | 盤面データ |
| cellSize | number | セルサイズ (デフォルト: 20) |

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
