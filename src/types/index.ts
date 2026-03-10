export interface Combo {
  id: string;
  title: string;
  neuronUrl?: string;
  startingCards: StartingCard[];
  steps: ComboStep[];
  createdAt: string;
  updatedAt: string;
}

export interface StartingCard {
  id: string;
  imageId: string;
  order: number;
}

export interface ComboStep {
  id: string;
  order: number;
  text: string;
  board: BoardState;
  /** 相手盤面 (row 0,1) を表示するか (デフォルト: true) */
  showOpponentBoard?: boolean;
}

export interface BoardState {
  /**
   * 5x5 グリッド [row][col]
   *
   * Row 0: 相手の魔法・罠ゾーン  [■][■][■][■][■]
   * Row 1: 相手モンスターゾーン   [■][■][■][■][■]
   * Row 2: EXモンスターゾーン     [ ][■][ ][■][ ]
   * Row 3: 自分モンスターゾーン   [■][■][■][■][■]
   * Row 4: 自分の魔法・罠ゾーン  [■][■][■][■][■]
   */
  cells: (BoardCell | null)[][];
}

export interface BoardCell {
  imageId: string | null;
  chainNumber: number | null;
  position?: "attack" | "defense";
}

/** カード比率 (縦:横 = 86:59) */
export const CARD_RATIO = 86 / 59;

export interface CachedImage {
  id: string;
  fileName: string;
  blob: Blob;
  /** 外部画像URL（CORS回避用。設定時はblobではなくこのURLを表示に使う） */
  externalUrl?: string;
}

export const DISABLED_CELLS: [number, number][] = [
  [2, 0],
  [2, 2],
  [2, 4],
];

export function createEmptyBoard(): BoardState {
  const cells: (BoardCell | null)[][] = [];
  for (let row = 0; row < 5; row++) {
    const rowCells: (BoardCell | null)[] = [];
    for (let col = 0; col < 5; col++) {
      const isDisabled = DISABLED_CELLS.some(
        ([r, c]) => r === row && c === col,
      );
      rowCells.push(isDisabled ? null : { imageId: null, chainNumber: null });
    }
    cells.push(rowCells);
  }
  return { cells };
}

export interface ExportData {
  version: number;
  combos: Combo[];
  /** 外部URL画像のメタデータ (blob不要、URLのみで表示する画像) */
  externalImages?: { id: string; fileName: string; externalUrl: string }[];
}

/** URL共有用コンパクトフォーマット */
export interface ShareData {
  /** title */
  t: string;
  /** neuronUrl (optional) */
  n?: string;
  /** startingCards の画像インデックス配列 */
  sc: number[];
  /** 使用画像の externalUrl 一覧 */
  imgs: string[];
  /** steps */
  steps: {
    /** text */
    x: string;
    /** 配置済みセルのみ: [row, col, imgIdx, "d"?] */
    b: [number, number, number, string?][];
  }[];
}
