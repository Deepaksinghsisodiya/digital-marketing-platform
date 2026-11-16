import React from "react";

export const PanelSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <header className="mb-4">
      <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs text-muted">{description}</p>
      ) : null}
    </header>
    <div className="space-y-4">{children}</div>
  </section>
);

export const FieldRow: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-foreground">
      {label}
      {hint ? <span className="font-normal text-muted">{hint}</span> : null}
    </span>
    {children}
  </label>
);

export const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  type?: "text" | "number";
}> = ({ label, value, onChange, hint, placeholder, type = "text" }) => (
  <FieldRow label={label} hint={hint}>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
    />
  </FieldRow>
);

export const SelectField: React.FC<{
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  hint?: string;
}> = ({ label, value, options, onChange, hint }) => (
  <FieldRow label={label} hint={hint}>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FieldRow>
);

export const ToggleField: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ label, description, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description ? (
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      ) : null}
    </div>
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-disabled"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  </div>
);

export const ColorField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  contrastLabel?: string;
  contrastLevel?: "PASS" | "WARNING" | "FAIL";
  contrastRatio?: number;
}> = ({
  label,
  value,
  onChange,
  onReset,
  contrastLabel,
  contrastLevel,
  contrastRatio,
}) => {
  const swatch = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)
    ? value
    : "#000000";

  return (
    <div data-testid={`color-field-${label}`}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {contrastLabel && contrastLevel ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                contrastLevel === "PASS"
                  ? "bg-success/15 text-success"
                  : contrastLevel === "WARNING"
                    ? "bg-warning/15 text-warning"
                    : "bg-danger/15 text-danger"
              }`}
              title={`${contrastLabel}: ${contrastRatio ?? 0}:1`}
            >
              {contrastLevel} {contrastRatio ?? 0}:1
            </span>
          ) : null}
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="text-[10px] font-medium text-muted underline-offset-2 hover:text-primary hover:underline"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={swatch}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded-lg border border-input bg-surface p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-input bg-surface px-3 py-2 font-mono text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </div>
  );
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
> = ({ variant = "secondary", className = "", ...props }) => {
  const variants: Record<string, string> = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover border-transparent",
    secondary:
      "bg-surface text-foreground border-border hover:bg-surface-elevated",
    ghost: "bg-transparent text-muted border-transparent hover:text-foreground",
    danger: "bg-danger/10 text-danger border-danger/30 hover:bg-danger/20",
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
