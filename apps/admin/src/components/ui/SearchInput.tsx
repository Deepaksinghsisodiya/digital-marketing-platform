import React from "react";
import { Search, X, Command } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  showShortcut?: boolean;
  shortcutKey?: string;
  wrapperClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = "Search...",
      showShortcut = false,
      shortcutKey = "K",
      className,
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const handleClear = () => {
      onChange("");
      if (onClear) onClear();
    };

    return (
      <div className={cn("relative flex items-center w-full", wrapperClassName)}>
        <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none shrink-0" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-xs",
            className,
          )}
          {...props}
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : showShortcut ? (
          <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400 pointer-events-none">
            <Command className="w-2.5 h-2.5" />
            <span>{shortcutKey}</span>
          </div>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
