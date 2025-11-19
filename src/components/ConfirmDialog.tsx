// src/components/ConfirmDialog.tsx
import * as React from "react";
import Button from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      {/* dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-rose-100 bg-white p-5 shadow-xl">
        {title && (
          <h3 className="text-lg font-semibold text-rose-900">{title}</h3>
        )}
        <p className="mt-2 text-sm text-slate-700">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel ?? "ยกเลิก"}
          </Button>
          <Button onClick={onConfirm} loading={loading}>
            {confirmLabel ?? "ยืนยัน"}
          </Button>
        </div>
      </div>
    </div>
  );
}
