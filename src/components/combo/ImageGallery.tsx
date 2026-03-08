import { useRef } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import type { CachedImage } from "@/types";
import { CARD_RATIO } from "@/types";
import { useIsMobile } from "@/hooks/useIsMobile";

function DraggableImage({
  image,
  url,
  thumbW,
  thumbH,
}: {
  image: CachedImage;
  url: string | null;
  thumbW: number;
  thumbH: number;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `gallery-${image.id}`,
    data: { type: "gallery-image", imageId: image.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ width: thumbW, height: thumbH, touchAction: "none" }}
      className={`flex-shrink-0 cursor-grab rounded bg-gray-700 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {url && (
        <img
          src={url}
          alt={image.fileName}
          className="h-full w-full rounded object-cover"
          draggable={false}
        />
      )}
    </div>
  );
}

function DeleteDropZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: "gallery-delete-zone",
    data: { type: "gallery-delete" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full flex-shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
        isOver
          ? "border-red-400 bg-red-900/40 text-red-300"
          : "border-gray-600 bg-gray-900/50 text-gray-500"
      }`}
    >
      <FiTrash2 size={20} />
      <span className="mt-1 text-[10px]">削除</span>
    </div>
  );
}

interface ImageGalleryProps {
  images: CachedImage[];
  getImageUrl: (id: string) => string | null;
  onAddImages: (files: FileList) => void;
  onClearImages?: () => void;
}

export function ImageGallery({
  images,
  getImageUrl,
  onAddImages,
  onClearImages,
}: ImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const thumbW = isMobile ? 48 : 70;
  const thumbH = Math.round(thumbW * CARD_RATIO);

  // 2行に分割
  const mid = Math.ceil(images.length / 2);
  const row1 = images.slice(0, mid);
  const row2 = images.slice(mid);

  return (
    <div className="border-t border-gray-700 bg-gray-800 p-2 sm:p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400">
          画像一覧 (D&D で盤面・初動札に配置)
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
          >
            <FiPlus size={12} />
            追加
          </button>
          {onClearImages && images.length > 0 && (
            <button
              onClick={onClearImages}
              className="flex items-center gap-1 rounded bg-red-900/60 px-2 py-1 text-xs text-red-300 hover:bg-red-800"
            >
              <FiTrash2 size={12} />
              クリア
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) onAddImages(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>
      <div className="flex gap-2">
        {/* 画像一覧 (左4/5) */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-x-auto">
          <div className="flex gap-2">
            {row1.map((img) => (
              <DraggableImage
                key={img.id}
                image={img}
                url={getImageUrl(img.id)}
                thumbW={thumbW}
                thumbH={thumbH}
              />
            ))}
          </div>
          {row2.length > 0 && (
            <div className="flex gap-2">
              {row2.map((img) => (
                <DraggableImage
                  key={img.id}
                  image={img}
                  url={getImageUrl(img.id)}
                  thumbW={thumbW}
                  thumbH={thumbH}
                />
              ))}
            </div>
          )}
          {images.length === 0 && (
            <p className="py-4 text-center text-xs text-gray-600">
              画像を追加してください
            </p>
          )}
        </div>
        {/* 削除ゾーン (右1/5) */}
        {images.length > 0 && (
          <div className="w-1/5 flex-shrink-0">
            <DeleteDropZone />
          </div>
        )}
      </div>
    </div>
  );
}
