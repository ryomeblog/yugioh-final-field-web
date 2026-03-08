# データ設計書

## 1. ストレージ方針

| 項目 | 保存先 | 理由 |
|------|--------|------|
| 展開データ (JSON) | IndexedDB | 構造化データの格納に適している |
| 画像キャッシュ | IndexedDB (Blob) | 大容量バイナリの保存に適している |

サーバーレス（ブラウザ完結）アプリのため、すべてのデータはクライアント側に保持する。

## 2. IndexedDB 設計

### データベース名: `yugioh-combo-db`

### Object Store 一覧

| Store名 | keyPath | 説明 |
|---------|---------|------|
| `combos` | `id` | 展開データ |
| `images` | `id` | 画像キャッシュ |

## 3. 型定義

### Combo (展開)

```typescript
interface Combo {
  id: string;              // UUID v4
  title: string;           // 展開タイトル
  startingCards: StartingCard[]; // 初動札 (画像付き)
  steps: ComboStep[];      // 展開ステップ一覧 (順序付き)
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

### StartingCard (初動札)

```typescript
interface StartingCard {
  id: string;       // UUID v4
  imageId: string;  // CachedImage.id への参照
  order: number;    // 表示順序
}
```

### ComboStep (展開ステップ)

```typescript
interface ComboStep {
  id: string;        // UUID v4
  order: number;     // 表示順序 (0始まり)
  text: string;      // 解説テキスト
  board: BoardState; // 盤面状態
}
```

### BoardState (盤面)

```typescript
interface BoardState {
  /**
   * 5x5 グリッド [row][col]
   *
   * Row 0: 相手の魔法・罠ゾーン  [■][■][■][■][■]
   * Row 1: 相手モンスターゾーン   [■][■][■][■][■]
   * Row 2: EXモンスターゾーン     [　][■][　][■][　] (col 0,2,4 は null: 無効セル)
   * Row 3: 自分モンスターゾーン   [■][■][■][■][■]
   * Row 4: 自分の魔法・罠ゾーン  [■][■][■][■][■]
   *
   * 有効セル数: 5 + 5 + 2 + 5 + 5 = 22
   */
  cells: (BoardCell | null)[][];
}
```

### BoardCell (盤面セル)

```typescript
interface BoardCell {
  imageId: string | null;     // 配置された画像ID (null = 空)
  chainNumber: number | null; // チェーン番号 1〜20 (null = チェーンなし)
}
```

### CachedImage (画像キャッシュ)

```typescript
interface CachedImage {
  id: string;        // UUID v4
  fileName: string;  // 元のファイル名
  blob: Blob;        // 画像バイナリデータ
}
```

## 4. 盤面の無効セル定義

```typescript
const DISABLED_CELLS: [number, number][] = [
  [2, 0], [2, 2], [2, 4], // Row 2 の col 0, 2, 4
];
```

初期化時、`DISABLED_CELLS` に該当するセルは `null` で固定する。

## 5. チェーン番号の管理ルール

- チェーン番号は盤面全体で **1〜20** の連番で管理する
- 新規チェーン追加時、現在の最大番号 + 1 を割り当てる
- 途中のチェーンが削除された場合、残りの番号を **昇順で1から振り直す**
- 1つの `ComboStep` 内の盤面でチェーン番号はユニーク

## 6. ZIP ファイル構造

### エクスポート時

```
export.zip
├── data.json           // Combo[] (一覧) または Combo (単体)
└── images/
    ├── {imageId}.png   // 画像ファイル (元のID.拡張子)
    ├── {imageId}.jpg
    └── ...
```

### data.json のスキーマ

```jsonc
{
  "version": 1,
  "combos": [
    {
      "id": "uuid-xxx",
      "title": "天盃龍展開",
      "startingCards": [
        { "id": "uuid-sc1", "imageId": "uuid-img1", "order": 0 }
      ],
      "steps": [
        {
          "id": "uuid-step1",
          "order": 0,
          "text": "天盃龍パイドラを通常召喚",
          "board": {
            "cells": [
              [{ "imageId": null, "chainNumber": null }, ...],
              ...
            ]
          }
        }
      ],
      "createdAt": "2026-03-07T00:00:00.000Z",
      "updatedAt": "2026-03-07T00:00:00.000Z"
    }
  ]
}
```

### インポート時のマージルール

| 条件 | 動作 |
|------|------|
| 既存の展開IDと一致 | 上書き更新 |
| 新規の展開ID | 追加 |
| ZIP内の画像 | IndexedDB の images ストアに保存 |

## 7. 画面遷移とデータフロー

```
[ホーム画面]
  │
  ├── インポート → ZIP解凍 → data.json パース → combos ストアにマージ
  │                                            → images ストアに画像保存
  │
  ├── ダウンロード → 選択した combos + 関連 images → ZIP生成 → ダウンロード
  │
  ├── + ボタン → [展開作成画面]
  │                 │
  │                 ├── 保存 → combos ストアに INSERT
  │                 └── インポート → ZIP → 単体展開反映
  │
  └── カード選択 → [展開詳細画面]
                      │
                      └── 編集 → [展開編集画面]
                                    │
                                    ├── 保存 → combos ストアに UPDATE
                                    ├── 削除 → combos ストアから DELETE
                                    └── ダウンロード → 単体展開 ZIP
```
