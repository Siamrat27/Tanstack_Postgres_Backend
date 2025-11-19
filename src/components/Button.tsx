import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

const CHULA_PINK = "#E4007E";
const CHULA_PINK_DARK = "#B0005C";

function cx(...args: Array<string | undefined | null | false>) {
  return args.filter(Boolean).join(" ");
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  disabled,
  className,
  style,
  left,
  right,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center rounded-lg font-semibold transition " +
    "focus:outline-none focus-visible:ring-2 select-none " +
    "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

  const sizeCls =
    size === "sm"
      ? "px-3 py-1.5 text-sm"
      : size === "lg"
        ? "px-5 py-2.5 text-base"
        : "px-4 py-2 text-sm";

  const widthCls = fullWidth ? "w-full" : "";

  let variantCls = "";
  let variantStyle: React.CSSProperties | undefined;

  switch (variant) {
    case "primary":
      variantCls = "text-white shadow-sm";
      variantStyle = {
        background: `linear-gradient(90deg, ${CHULA_PINK}, ${CHULA_PINK_DARK})`,
      };
      break;
    case "outline":
      variantCls = "bg-white border hover:bg-rose-50";
      variantStyle = { borderColor: "#E4007E33", color: "#B0005C" };
      break;
    case "danger":
      variantCls = "text-white";
      variantStyle = { background: "#DC2626" };
      break;
    case "ghost":
      variantCls = "hover:bg-rose-50";
      break;
  }

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cx(base, sizeCls, widthCls, variantCls, className)}
      style={{ ...variantStyle, ...style }}
    >
      {loading ? (
        <>
          <span className="mr-2">{children}</span>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        </>
      ) : (
        <>
          {left ? <span className="mr-2">{left}</span> : null}
          {children}
          {right ? <span className="ml-2">{right}</span> : null}
        </>
      )}
    </button>
  );
}
