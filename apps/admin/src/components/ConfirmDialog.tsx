import React, { useEffect } from "react";
import { AlertTriangle, Trash2, HelpCircle, X } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: Trash2,
      badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      btnClass: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20",
    },
    warning: {
      icon: AlertTriangle,
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
    },
    primary: {
      icon: HelpCircle,
      badgeClass: "bg-primary/10 text-primary border-primary/20",
      btnClass: "bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs",
    },
  }[variant];

  const IconComponent = iconConfig.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${iconConfig.badgeClass}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="confirm-dialog-title"
                className="text-base font-black text-slate-900 dark:text-white"
              >
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5 ${iconConfig.btnClass}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
