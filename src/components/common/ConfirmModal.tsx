import { Modal } from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-6 text-sm text-gray-300">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm text-gray-200 hover:bg-gray-500"
        >
          キャンセル
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
