"use client";

import { useEffect } from "react";
import { adminCommon } from "@/style/style_admin_common";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      <div
        style={adminCommon.modalOverlay}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div style={adminCommon.modalContent}>
        <h2 style={adminCommon.modalTitle}>{title}</h2>
        <p style={adminCommon.modalBody}>{message}</p>
        <div style={adminCommon.modalButtons}>
          <button
            type="button"
            style={adminCommon.modalCancelButton}
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            type="button"
            style={adminCommon.modalDeleteButton}
            onClick={onConfirm}
          >
            削除する
          </button>
        </div>
      </div>
    </>
  );
}

