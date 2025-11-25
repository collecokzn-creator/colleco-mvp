import React from "react";

// Centralized button component enforcing consistent brand styling.
// Variants avoid faded opacity; rely on solid colors + subtle shadow.
// Sizes map to padding & text scale; fullWidth expands horizontally.
// Accepts `as` prop to render Link or other element if needed.
const variantClasses = {
  primary: "bg-brand-orange text-white hover:bg-brand-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange shadow-sm hover:shadow-md",
  secondary: "bg-white text-brand-brown border border-cream-border hover:border-brand-orange hover:bg-cream-hover hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange",
  outline: "bg-transparent text-brand-orange border border-brand-orange hover:bg-brand-orange hover:text-white focus-visible:ring-2 focus-visible:ring-brand-orange",
  subtle: "bg-cream-sand text-brand-brown hover:bg-cream-hover focus-visible:ring-2 focus-visible:ring-brand-orange",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600",
  ghost: "bg-transparent text-brand-brown hover:bg-cream-hover focus-visible:ring-2 focus-visible:ring-brand-orange",
};

const sizeClasses = {
  xs: "text-xs px-2 py-1",
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
  xl: "text-lg px-6 py-3",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled = false,
  type = "button",
  children,
  as: Component = "button",
  ...rest
}) {
  const v = variantClasses[variant] || variantClasses.primary;
  const s = sizeClasses[size] || sizeClasses.md;
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-colors select-none focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed";
  const width = fullWidth ? "w-full" : "";
  const composed = [base, v, s, width, className].filter(Boolean).join(" ");
  return (
    <Component type={Component === "button" ? type : undefined} disabled={disabled} className={composed} {...rest}>
      {children}
    </Component>
  );
}

export default Button;