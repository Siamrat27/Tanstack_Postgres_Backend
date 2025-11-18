// /src/components/dropdown.tsx
import * as React from "react";

export type DropdownOption = {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
};

export type DropdownProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  brandColor?: string;
  options?: DropdownOption[];
  containerClassName?: string;
};

const DEFAULT_BRAND = "#E4007E";

const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props} aria-hidden="true">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  (
    {
      id,
      label,
      hint,
      error,
      brandColor = DEFAULT_BRAND,
      options,
      className,
      containerClassName,
      style,
      onFocus,
      onBlur,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    const isDisabled = !!disabled;

    const onFocusWrap: React.FocusEventHandler<HTMLSelectElement> = (e) => {
      if (isDisabled) return;
      e.currentTarget.style.boxShadow = `0 0 0 6px ${brandColor}14`;
      onFocus?.(e);
    };
    const onBlurWrap: React.FocusEventHandler<HTMLSelectElement> = (e) => {
      if (isDisabled) return;
      e.currentTarget.style.boxShadow = `0 0 0 0 rgba(0,0,0,0)`;
      onBlur?.(e);
    };

    const base =
      "w-full appearance-none rounded-xl border bg-white px-3 py-2 pr-9 text-slate-900 outline-none transition";
    const whenDisabled =
      "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200";

    const mergedStyle: React.CSSProperties = {
      ...(isDisabled ? {} : { borderColor: `${brandColor}33` }),
      ...style,
      ...(isDisabled
        ? {
            backgroundColor: "#F8FAFC", // slate-50
            color: "#6B7280", // slate-500
            borderColor: "#E5E7EB", // slate-200
          }
        : {}),
    };

    return (
      <div className={containerClassName}>
        {label ? (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-slate-900"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          <select
            id={id}
            ref={ref}
            disabled={disabled}
            {...rest}
            className={[base, className || "", isDisabled ? whenDisabled : ""]
              .filter(Boolean)
              .join(" ")}
            style={mergedStyle}
            onFocus={onFocusWrap}
            onBlur={onBlurWrap}
            aria-invalid={!!error || undefined}
            aria-describedby={hint ? `${id}-hint` : undefined}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={String(opt.value)}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* custom chevron */}
          <div
            className={`pointer-events-none absolute inset-y-0 right-3 flex items-center ${
              isDisabled ? "opacity-60" : ""
            }`}
          >
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {hint ? (
          <div
            id={id ? `${id}-hint` : undefined}
            className="mt-1 text-xs text-slate-500"
          >
            {hint}
          </div>
        ) : null}

        {error ? (
          <div className="mt-1 text-xs text-rose-600">{error}</div>
        ) : null}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";
export default Dropdown;
