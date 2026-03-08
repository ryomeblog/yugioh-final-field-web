import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { Modal } from "./Modal";
import { DropZone } from "./DropZone";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  function handleClose() {
    setFile(null);
    onClose();
  }

  function handleClear() {
    setFile(null);
  }

  async function handleImport() {
    if (!file) return;
    setIsImporting(true);
    try {
      await onImport(file);
      setFile(null);
      onClose();
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="ZIPファイルをインポート"
    >
      <DropZone onFileSelect={setFile} accept=".zip" />

      {file && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-gray-700 px-3 py-2">
          <span className="flex-1 truncate text-sm text-gray-300">
            {file.name} ({(file.size / 1024).toFixed(1)}KB)
          </span>
          <button
            onClick={handleClear}
            className="rounded bg-red-800 p-1.5 text-white hover:bg-red-700"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm text-gray-200 hover:bg-gray-500"
        >
          キャンセル
        </button>
        <button
          onClick={handleImport}
          disabled={!file || isImporting}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isImporting ? "インポート中..." : "インポート"}
        </button>
      </div>
    </Modal>
  );
}
