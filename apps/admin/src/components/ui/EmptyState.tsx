import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "../../lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) => {
  const ActionIcon = action?.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs shadow-primary/20 transition-all cursor-pointer"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};
