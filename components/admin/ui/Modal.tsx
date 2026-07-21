"use client";

import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ title, onClose, children, width = 520 }: ModalProps) {
  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="admin-modal"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button type="button" className="admin-btn ghost" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}
