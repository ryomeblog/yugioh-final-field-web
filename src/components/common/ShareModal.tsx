import { useState } from "react";
import { Modal } from "@/components/common/Modal";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  warnings: string[];
}

export function ShareModal({
  isOpen,
  onClose,
  url,
  warnings,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="展開を共有">
      {warnings.length > 0 && (
        <div className="mb-3 rounded-md bg-yellow-900/40 px-3 py-2 text-xs text-yellow-300">
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      <p className="mb-2 text-xs text-gray-400">
        以下のURLをコピーして共有してください。
      </p>

      <textarea
        readOnly
        value={url}
        rows={3}
        className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-xs text-gray-300 outline-none"
        onFocus={(e) => e.target.select()}
      />

      <div className="mt-3 flex items-center justify-end gap-2">
        {copied && (
          <span className="text-xs text-green-400">コピーしました</span>
        )}
        <button
          onClick={handleCopy}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
        >
          コピー
        </button>
        <button
          onClick={onClose}
          className="rounded-md bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
        >
          閉じる
        </button>
      </div>
    </Modal>
  );
}
