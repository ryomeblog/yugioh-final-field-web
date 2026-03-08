import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
}
