import { useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { FiPlus } from "react-icons/fi";
import type { CachedImage } from "@/types";

interface DraggableImageProps {
  image: CachedImage;
  url: string | null;
}

function DraggableImage({ image, url }: DraggableImageProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `gallery-${image.id}`,
    data: { type: "gallery-image", imageId: image.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`h-12 w-12 flex-shrink-0 cursor-grab rounded bg-gray-700 ${
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

interface ImageGalleryProps {
  images: CachedImage[];
  getImageUrl: (id: string) => string | null;
  onAddImages: (files: FileList) => void;
}

export function ImageGallery({
  images,
  getImageUrl,
  onAddImages,
}: ImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 2行に分割
  const mid = Math.ceil(images.length / 2);
  const row1 = images.slice(0, mid);
  const row2 = images.slice(mid);

  return (
    <div className="border-t border-gray-700 bg-gray-800 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400">
          画像一覧 (D&D で盤面・初動札に配置)
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
        >
          <FiPlus size={12} />
          追加
        </button>
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
      <div className="flex flex-col gap-2 overflow-x-auto">
        <div className="flex gap-2">
          {row1.map((img) => (
            <DraggableImage
              key={img.id}
              image={img}
              url={getImageUrl(img.id)}
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
    </div>
  );
}
