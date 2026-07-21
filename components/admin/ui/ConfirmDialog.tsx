"use client";

import { Modal } from "./Modal";
import { Btn } from "./Btn";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  danger = true,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn onClick={onCancel} disabled={loading}>Cancel</Btn>
        <Btn variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={loading}>
          {loading ? "Working…" : confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
}
