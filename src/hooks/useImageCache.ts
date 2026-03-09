import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { CachedImage } from "@/types";
import * as db from "@/db";

export function useImageCache() {
  const [images, setImages] = useState<CachedImage[]>([]);
  const urlMap = useRef<Map<string, string>>(new Map());

  const loadImages = useCallback(async () => {
    const imgs = await db.getAllImages();
    setImages(imgs);
    for (const img of imgs) {
      if (!urlMap.current.has(img.id)) {
        urlMap.current.set(
          img.id,
          img.externalUrl ?? URL.createObjectURL(img.blob),
        );
      }
    }
  }, []);

  const addImage = useCallback(async (file: File): Promise<CachedImage> => {
    const id = uuidv4();
    const cached: CachedImage = {
      id,
      fileName: file.name,
      blob: file,
    };
    await db.putImage(cached);
    urlMap.current.set(id, URL.createObjectURL(file));
    setImages((prev) => [...prev, cached]);
    return cached;
  }, []);

  const addImageFromBlob = useCallback(
    async (id: string, fileName: string, blob: Blob): Promise<void> => {
      const cached: CachedImage = { id, fileName, blob };
      await db.putImage(cached);
      urlMap.current.set(id, URL.createObjectURL(blob));
      setImages((prev) => {
        const exists = prev.some((img) => img.id === id);
        return exists
          ? prev.map((img) => (img.id === id ? cached : img))
          : [...prev, cached];
      });
    },
    [],
  );

  const removeImage = useCallback(async (id: string): Promise<void> => {
    await db.deleteImage(id);
    const url = urlMap.current.get(id);
    if (url) {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      urlMap.current.delete(id);
    }
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const clearImages = useCallback(async (): Promise<void> => {
    for (const img of images) {
      await db.deleteImage(img.id);
    }
    urlMap.current.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    urlMap.current.clear();
    setImages([]);
  }, [images]);

  const getImageUrl = useCallback((id: string): string | null => {
    return urlMap.current.get(id) ?? null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    db.getAllImages().then((imgs) => {
      if (cancelled) return;
      setImages(imgs);
      for (const img of imgs) {
        if (!urlMap.current.has(img.id)) {
          urlMap.current.set(
            img.id,
            img.externalUrl ?? URL.createObjectURL(img.blob),
          );
        }
      }
    });
    const map = urlMap.current;
    return () => {
      cancelled = true;
      map.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  /** CachedImage をそのまま保存 (ZIP インポート等で使用) */
  const saveImage = useCallback(async (cached: CachedImage): Promise<void> => {
    await db.putImage(cached);
    urlMap.current.set(
      cached.id,
      cached.externalUrl ?? URL.createObjectURL(cached.blob),
    );
    setImages((prev) => {
      const exists = prev.some((img) => img.id === cached.id);
      return exists
        ? prev.map((img) => (img.id === cached.id ? cached : img))
        : [...prev, cached];
    });
  }, []);

  const addImageFromUrl = useCallback(
    async (externalUrl: string): Promise<CachedImage> => {
      const fileName = externalUrl.split("/").pop()?.split("?")[0] || "image";
      const id = uuidv4();
      // CORS制限を回避するため、blobは空にして外部URLをそのまま参照
      const cached: CachedImage = {
        id,
        fileName,
        blob: new Blob(),
        externalUrl,
      };
      await db.putImage(cached);
      urlMap.current.set(id, externalUrl);
      setImages((prev) => [...prev, cached]);
      return cached;
    },
    [],
  );

  return {
    images,
    addImage,
    addImageFromBlob,
    addImageFromUrl,
    saveImage,
    removeImage,
    clearImages,
    getImageUrl,
    loadImages,
  };
}
