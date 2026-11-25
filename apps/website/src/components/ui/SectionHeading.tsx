import React from "react";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center" | "right";
  tone?: "light" | "dark" | "alt" | "brand-gradient";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  tone = "light",
  className = "",
}) => {
  const alignClass =
    align === "left"
      ? "text-left items-start"
      : align === "right"
        ? "text-right items-end"
        : "text-center items-center mx-auto";

  const isDarkTone = tone === "dark" || tone === "brand-gradient";

  // If a highlight word is provided, split and highlight
  let renderedTitle: React.ReactNode = title;
  if (highlight && title.includes(highlight)) {
    const parts = title.split(highlight);
    renderedTitle = (
      <>
        {parts[0]}
        <span className="relative inline-block px-1">
          <span className="relative z-10 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-extrabold">
            {highlight}
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-1.5 left-0 right-0 h-2 bg-primary/15 -rotate-1 rounded-sm -z-0"
          />
        </span>
        {parts.slice(1).join(highlight)}
      </>
    );
  }

  return (
    <div
      className={`flex flex-col max-w-3xl mb-12 sm:mb-16 ${alignClass} ${className}`}
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3.5 border border-primary/20 bg-primary/5 text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>{eyebrow}</span>
        </div>
      )}

      <h2
        className={`font-heading font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[1.15] ${
          isDarkTone ? "text-white" : "text-foreground"
        }`}
      >
        {renderedTitle}
      </h2>

      {description && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed max-w-2xl font-normal ${
            isDarkTone ? "text-white/70" : "text-muted"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
};
