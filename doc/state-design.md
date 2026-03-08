# 状態管理設計書

## 方針

- **React Context + useReducer** でグローバル状態を管理
- **IndexedDB (idb)** を永続化レイヤーとして利用
- 認証なし、サーバーレスのため外部 API 呼び出しは不要

## 状態の分類

| カテゴリ | 管理方法 | 説明 |
|---------|---------|------|
| 展開一覧 | Context (ComboContext) | 全展開データ。IndexedDB と同期 |
| 画像キャッシュ | Custom Hook (useImageCache) | IndexedDB の images ストアを操作 |
| 編集中データ | ページローカル state (useState) | 作成・編集画面の一時データ |
| 未保存フラグ | ページローカル state (useState) | isDirty フラグで未保存を検知 |
| UI 状態 | ページローカル state (useState) | モーダル開閉、選択中カード等 |

## ComboContext

### State

```typescript
interface ComboState {
  combos: Combo[];
  isLoading: boolean;
}
```

### Actions

```typescript
type ComboAction =
  | { type: "SET_COMBOS"; payload: Combo[] }
  | { type: "ADD_COMBO"; payload: Combo }
  | { type: "UPDATE_COMBO"; payload: Combo }
  | { type: "DELETE_COMBO"; payload: string }          // id
  | { type: "MERGE_COMBOS"; payload: Combo[] }         // インポート時
  | { type: "SET_LOADING"; payload: boolean };
```

### Provider

```typescript
interface ComboContextValue {
  state: ComboState;
  dispatch: React.Dispatch<ComboAction>;
  // 便利メソッド (dispatch + IndexedDB 同期)
  addCombo: (combo: Combo) => Promise<void>;
  updateCombo: (combo: Combo) => Promise<void>;
  deleteCombo: (id: string) => Promise<void>;
  mergeCombos: (combos: Combo[]) => Promise<void>;
  loadCombos: () => Promise<void>;
}
```

## useImageCache Hook

```typescript
interface UseImageCache {
  images: CachedImage[];
  addImage: (file: File) => Promise<CachedImage>;
  addImageFromBlob: (id: string, fileName: string, blob: Blob) => Promise<void>;
  removeImage: (id: string) => Promise<void>;
  getImageUrl: (id: string) => string | null;  // Object URL
  loadImages: () => Promise<void>;
}
```

画像は IndexedDB に Blob として保存し、表示時に `URL.createObjectURL()` で一時 URL を生成する。
コンポーネントのアンマウント時に `URL.revokeObjectURL()` でメモリを解放する。

## IndexedDB 操作 (db/index.ts)

```typescript
// DB 初期化
function openDB(): Promise<IDBPDatabase>;

// Combos CRUD
function getAllCombos(): Promise<Combo[]>;
function getCombo(id: string): Promise<Combo | undefined>;
function putCombo(combo: Combo): Promise<void>;
function deleteCombo(id: string): Promise<void>;

// Images CRUD
function getAllImages(): Promise<CachedImage[]>;
function getImage(id: string): Promise<CachedImage | undefined>;
function putImage(image: CachedImage): Promise<void>;
function deleteImage(id: string): Promise<void>;
```

## データフロー

### 初回ロード

```
App マウント
  → ComboContext.loadCombos()
    → db.getAllCombos()
      → dispatch({ type: "SET_COMBOS", payload: combos })
```

### 展開の保存 (作成・編集画面)

```
保存ボタン押下
  → comboContext.addCombo(combo) / comboContext.updateCombo(combo)
    → db.putCombo(combo)
    → dispatch({ type: "ADD_COMBO" / "UPDATE_COMBO", payload: combo })
  → isDirty = false
  → navigate (ホーム or 詳細画面)
```

### ZIP インポート (ホーム画面)

```
インポートボタン押下
  → JSZip で ZIP 解凍
  → data.json をパース → Combo[]
  → images/ 内のファイル → CachedImage[]
  → imageCache.addImageFromBlob() で各画像保存
  → comboContext.mergeCombos(combos)
    → 既存 ID 一致 → UPDATE
    → 新規 ID → ADD
    → db.putCombo() (各 combo)
    → dispatch({ type: "MERGE_COMBOS", payload: combos })
  → モーダルを閉じる
```

### ZIP インポート (作成・編集画面)

```
インポートボタン押下
  → JSZip で ZIP 解凍
  → data.json をパース → Combo (単体)
  → images/ 内のファイル → 画像キャッシュに追加
  → 編集中データに反映 (ローカル state 更新)
  → isDirty = true
  → モーダルを閉じる
```

### ZIP ダウンロード (ホーム画面)

```
ダウンロードボタン押下 → モーダル表示
  → 展開を選択
  → ダウンロードボタン押下
    → 選択した combos から使用画像 ID を収集
    → db.getImage() で各画像を取得
    → JSZip で data.json + images/ を生成
    → FileSaver.saveAs() でダウンロード
  → モーダルを閉じる
```

### ZIP ダウンロード (作成・編集画面)

```
DL ボタン押下
  → 現在の編集中 combo から使用画像 ID を収集
  → db.getImage() で各画像を取得
  → JSZip で data.json + images/ を生成
  → FileSaver.saveAs() でダウンロード
```

### 未保存警告

```
戻るボタン押下
  → isDirty === true の場合
    → ConfirmModal を表示
      → 「保存せず戻る」 → navigate(-1) or navigate("/")
      → 「キャンセル」 → モーダルを閉じる
  → isDirty === false の場合
    → そのまま遷移
```

## 画像 URL の管理

画像は IndexedDB に Blob で保存されているため、表示には Object URL が必要。

```typescript
// ImageGallery や BoardCell で使用
const urlMap = useRef<Map<string, string>>(new Map());

function getImageUrl(imageId: string): string {
  if (urlMap.current.has(imageId)) {
    return urlMap.current.get(imageId)!;
  }
  // Blob から URL 生成 (非同期で取得し state 更新)
  return "";
}

// クリーンアップ
useEffect(() => {
  return () => {
    urlMap.current.forEach((url) => URL.revokeObjectURL(url));
  };
}, []);
```
