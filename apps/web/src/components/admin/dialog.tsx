"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./form";

/** Native modal <dialog>: focus trapping, Esc to close and the backdrop come from the browser. */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const width = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" }[size];

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
      className={`m-auto w-[calc(100%-2rem)] ${width} rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/40`}
    >
      {open && (
        <div className="flex max-h-[90dvh] flex-col">
          <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
            <h2 id="modal-title" className="text-base font-semibold text-zinc-900">
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-zinc-500 hover:bg-zinc-100">
              <X className="size-5" aria-hidden />
            </button>
          </header>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}

/** Asks before a destructive action. `onConfirm` may be async; the button shows progress. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  pending,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={pending ? () => {} : onClose} title={title} size="sm">
      <div className="text-sm text-zinc-600">{message}</div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} pending={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
