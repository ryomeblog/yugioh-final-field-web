import { useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  FiPlus,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiLink,
  FiMove,
} from "react-icons/fi";
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

  const handleH = 16;

  return (
    <div
      ref={setNodeRef}
      style={{ width: thumbW, touchAction: "auto" }}
      className={`flex flex-shrink-0 flex-col ${isDragging ? "opacity-50" : ""}`}
    >
      {/* ドラッグハンドル */}
      <div
        {...attributes}
        {...listeners}
        style={{ height: handleH, touchAction: "none" }}
        className="flex cursor-grab items-center justify-center rounded-t bg-gray-600 hover:bg-gray-500"
      >
        <FiMove size={10} className="text-gray-300" />
      </div>
      {/* 画像 */}
      <div
        style={{ width: thumbW, height: thumbH }}
        className="rounded-b bg-gray-700"
      >
        {url && (
          <img
            src={url}
            alt={image.fileName}
            className="h-full w-full rounded-b object-cover"
            draggable={false}
          />
        )}
      </div>
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
  onAddImageFromUrl?: (url: string) => Promise<void>;
  onClearImages?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ImageGallery({
  images,
  getImageUrl,
  onAddImages,
  onAddImageFromUrl,
  onClearImages,
  isOpen,
  onToggle,
}: ImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const isMobile = useIsMobile();

  const thumbW = isMobile ? 48 : 70;
  const thumbH = Math.round(thumbW * CARD_RATIO);

  async function handleUrlSubmit() {
    if (!urlValue.trim() || !onAddImageFromUrl) return;
    setUrlLoading(true);
    setUrlError("");
    try {
      await onAddImageFromUrl(urlValue.trim());
      setUrlValue("");
      setShowUrlInput(false);
    } catch {
      setUrlError("画像の取得に失敗しました");
    } finally {
      setUrlLoading(false);
    }
  }

  // 2行に分割
  const mid = Math.ceil(images.length / 2);
  const row1 = images.slice(0, mid);
  const row2 = images.slice(mid);

  return (
    <div className="border-t border-gray-700 bg-gray-800 pb-2">
      {/* ハンドルバー — タップで開閉 */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2"
      >
        <span className="text-xs font-bold text-gray-400">
          画像一覧 ({images.length})
        </span>
        {isOpen ? (
          <FiChevronDown size={16} className="text-gray-400" />
        ) : (
          <FiChevronUp size={16} className="text-gray-400" />
        )}
      </button>

      {/* コンテンツ — スライドアニメーション */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-2 sm:px-3">
            {/* ツールバー */}
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] text-gray-500">
                D&D で盤面・初動札に配置
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
                >
                  <FiPlus size={12} />
                  追加
                </button>
                {onAddImageFromUrl && (
                  <button
                    onClick={() => setShowUrlInput((v) => !v)}
                    className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
                  >
                    <FiLink size={12} />
                    URL
                  </button>
                )}
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

            {/* URL入力 */}
            {showUrlInput && (
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => {
                    setUrlValue(e.target.value);
                    setUrlError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUrlSubmit();
                  }}
                  placeholder="画像URLを入力..."
                  className="min-w-0 flex-1 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={urlLoading || !urlValue.trim()}
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40"
                >
                  {urlLoading ? "..." : "取得"}
                </button>
                {urlError && (
                  <span className="text-[10px] text-red-400">{urlError}</span>
                )}
              </div>
            )}

            {/* 画像グリッド */}
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
        </div>
      </div>
    </div>
  );
}
