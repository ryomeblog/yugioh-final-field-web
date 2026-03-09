import { deflate, inflate } from "pako";
import { v4 as uuidv4 } from "uuid";
import type {
  Combo,
  CachedImage,
  ShareData,
  ComboStep,
  StartingCard,
} from "@/types";
import { createEmptyBoard } from "@/types";

const URL_WARN_LENGTH = 4000;

/** Uint8Array → Base64url 文字列 */
function toBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Base64url 文字列 → Uint8Array */
function fromBase64url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Combo → 共有URL を生成 */
export function encodeShareUrl(
  combo: Combo,
  images: CachedImage[],
): { url: string; warnings: string[] } {
  const warnings: string[] = [];

  // 使用中の全 imageId を収集
  const usedIds = new Set<string>();
  for (const sc of combo.startingCards) usedIds.add(sc.imageId);
  for (const step of combo.steps) {
    for (const row of step.board.cells) {
      for (const cell of row) {
        if (cell?.imageId) usedIds.add(cell.imageId);
      }
    }
  }

  // imageId → externalUrl マッピング (blob のみの画像は除外)
  const imgMap = new Map<string, string>();
  let blobOnlyCount = 0;
  for (const id of usedIds) {
    const cached = images.find((img) => img.id === id);
    if (cached?.externalUrl) {
      imgMap.set(id, cached.externalUrl);
    } else {
      blobOnlyCount++;
    }
  }
  if (blobOnlyCount > 0) {
    warnings.push(
      `${blobOnlyCount}枚の画像はURLベースではないため共有に含まれません。URLから追加した画像のみ共有されます。`,
    );
  }

  // imgs 配列と imageId→index マップ
  const imgs: string[] = [];
  const idToIdx = new Map<string, number>();
  for (const [id, url] of imgMap) {
    idToIdx.set(id, imgs.length);
    imgs.push(url);
  }

  // ShareData 構築
  const shareData: ShareData = {
    t: combo.title,
    sc: combo.startingCards
      .sort((a, b) => a.order - b.order)
      .map((sc) => idToIdx.get(sc.imageId) ?? -1)
      .filter((idx) => idx >= 0),
    imgs,
    steps: combo.steps
      .sort((a, b) => a.order - b.order)
      .map((step) => {
        const b: [number, number, number, string?][] = [];
        for (let r = 0; r < step.board.cells.length; r++) {
          for (let c = 0; c < step.board.cells[r].length; c++) {
            const cell = step.board.cells[r][c];
            if (cell?.imageId) {
              const idx = idToIdx.get(cell.imageId);
              if (idx !== undefined) {
                const entry: [number, number, number, string?] = [r, c, idx];
                if (cell.position === "defense") entry.push("d");
                if (cell.chainNumber != null)
                  entry.push(String(cell.chainNumber));
                b.push(entry);
              }
            }
          }
        }
        return { x: step.text, b };
      }),
  };

  // 圧縮 + エンコード
  const json = JSON.stringify(shareData);
  const compressed = deflate(new TextEncoder().encode(json));
  const encoded = toBase64url(compressed);

  const base = window.location.origin + import.meta.env.BASE_URL;
  const url = `${base}#/share?d=${encoded}`;

  if (url.length > URL_WARN_LENGTH) {
    warnings.push(
      `URLが${url.length}文字と長いため、一部のブラウザやSNSで正しく共有できない場合があります。`,
    );
  }

  return { url, warnings };
}

/** エンコード済み文字列 → ShareData */
export function decodeShareData(encoded: string): ShareData {
  const bytes = fromBase64url(encoded);
  const json = new TextDecoder().decode(inflate(bytes));
  const data = JSON.parse(json) as ShareData;
  // 最低限のバリデーション
  if (!data.t && data.t !== "")
    throw new Error("Invalid share data: missing title");
  if (!Array.isArray(data.imgs))
    throw new Error("Invalid share data: missing imgs");
  if (!Array.isArray(data.steps))
    throw new Error("Invalid share data: missing steps");
  return data;
}

/** ShareData → Combo + getImageUrl を生成 (表示用) */
export function shareDataToCombo(data: ShareData): {
  combo: Combo;
  getImageUrl: (id: string) => string | null;
} {
  // 画像ID生成: "share-img-{idx}"
  const imgIds = data.imgs.map((_, i) => `share-img-${i}`);
  const imgUrlMap = new Map<string, string>();
  data.imgs.forEach((url, i) => imgUrlMap.set(imgIds[i], url));

  const now = new Date().toISOString();

  const startingCards: StartingCard[] = data.sc.map((imgIdx, i) => ({
    id: `share-sc-${i}`,
    imageId: imgIds[imgIdx] ?? "",
    order: i,
  }));

  const steps: ComboStep[] = data.steps.map((s, i) => {
    const board = createEmptyBoard();
    for (const entry of s.b) {
      const [r, c, imgIdx, ...rest] = entry;
      if (board.cells[r]?.[c] !== undefined) {
        let position: "attack" | "defense" = "attack";
        let chainNumber: number | null = null;
        for (const v of rest) {
          if (v === "d") position = "defense";
          else if (v != null && !isNaN(Number(v))) chainNumber = Number(v);
        }
        board.cells[r][c] = {
          imageId: imgIds[imgIdx] ?? null,
          chainNumber,
          position,
        };
      }
    }
    return {
      id: `share-step-${i}`,
      order: i,
      text: s.x,
      board,
    };
  });

  const combo: Combo = {
    id: uuidv4(),
    title: data.t,
    startingCards,
    steps,
    createdAt: now,
    updatedAt: now,
  };

  return {
    combo,
    getImageUrl: (id: string) => imgUrlMap.get(id) ?? null,
  };
}
