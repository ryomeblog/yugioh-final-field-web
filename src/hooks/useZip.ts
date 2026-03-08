import { useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { Combo, ExportData, CachedImage } from "@/types";
import * as db from "@/db";

export function useZip() {
  const exportCombos = useCallback(async (combos: Combo[]): Promise<void> => {
    const zip = new JSZip();

    const data: ExportData = { version: 1, combos };
    zip.file("data.json", JSON.stringify(data, null, 2));

    // 使用画像IDを収集
    const imageIds = new Set<string>();
    for (const combo of combos) {
      for (const sc of combo.startingCards) {
        imageIds.add(sc.imageId);
      }
      for (const step of combo.steps) {
        for (const row of step.board.cells) {
          for (const cell of row) {
            if (cell?.imageId) imageIds.add(cell.imageId);
          }
        }
      }
    }

    // 画像をZIPに追加
    const imgFolder = zip.folder("images")!;
    for (const id of imageIds) {
      const img = await db.getImage(id);
      if (img) {
        const ext = img.fileName.split(".").pop() || "png";
        imgFolder.file(`${id}.${ext}`, img.blob);
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "combo-export.zip");
  }, []);

  const importZip = useCallback(
    async (
      file: File,
    ): Promise<{
      combos: Combo[];
      images: { id: string; fileName: string; blob: Blob }[];
    }> => {
      const zip = await JSZip.loadAsync(file);

      // data.json をパース
      const dataFile = zip.file("data.json");
      if (!dataFile) throw new Error("data.json が見つかりません");
      const json = await dataFile.async("text");
      const data: ExportData = JSON.parse(json);

      // 画像を取得
      const images: CachedImage[] = [];
      const imgFolder = zip.folder("images");
      if (imgFolder) {
        const entries: { name: string; file: JSZip.JSZipObject }[] = [];
        imgFolder.forEach((relativePath, file) => {
          if (!file.dir) entries.push({ name: relativePath, file });
        });
        for (const entry of entries) {
          const blob = await entry.file.async("blob");
          const id = entry.name.replace(/\.[^.]+$/, "");
          images.push({ id, fileName: entry.name, blob });
        }
      }

      return { combos: data.combos, images };
    },
    [],
  );

  return { exportCombos, importZip };
}
