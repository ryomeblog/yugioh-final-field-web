import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { ComboCard } from "@/components/combo/ComboCard";
import type { Combo } from "@/types";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  combos: Combo[];
  onDownload: (comboIds: string[]) => Promise<void>;
  getImageUrl?: (id: string) => string | null;
}

export function DownloadModal({
  isOpen,
  onClose,
  combos,
  onDownload,
  getImageUrl,
}: DownloadModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDownload() {
    if (selectedIds.size === 0) return;
    setIsDownloading(true);
    try {
      await onDownload(Array.from(selectedIds));
      setSelectedIds(new Set());
      onClose();
    } finally {
      setIsDownloading(false);
    }
  }

  function handleClose() {
    setSelectedIds(new Set());
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="ダウンロードする展開を選択"
    >
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {combos.map((combo) => (
          <ComboCard
            key={combo.id}
            combo={combo}
            selectable
            selected={selectedIds.has(combo.id)}
            onSelect={() => toggleSelect(combo.id)}
            getImageUrl={getImageUrl}
          />
        ))}
        {combos.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            展開がありません
          </p>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm text-gray-200 hover:bg-gray-500"
        >
          キャンセル
        </button>
        <button
          onClick={handleDownload}
          disabled={selectedIds.size === 0 || isDownloading}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isDownloading ? "生成中..." : "ダウンロード"}
        </button>
      </div>
    </Modal>
  );
}
