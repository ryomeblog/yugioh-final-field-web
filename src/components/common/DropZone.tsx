import { useState, useRef, type DragEvent } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
}

export function DropZone({ onFileSelect, accept }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange() {
    const file = inputRef.current?.files?.[0];
    if (file) onFileSelect(file);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors ${
        isDragging
          ? "border-blue-400 bg-blue-900/20"
          : "border-gray-600 bg-gray-900/30"
      }`}
    >
      <p className="text-sm text-gray-400">ドラッグ&ドロップ</p>
      <p className="text-xs text-gray-500">または</p>
      <button
        onClick={handleClick}
        className="rounded-md bg-blue-800 px-4 py-1.5 text-sm text-gray-200 hover:bg-blue-700"
      >
        ファイルを選択
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
