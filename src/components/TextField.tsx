// /src/components/TextField.tsx
import * as React from "react";

export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  brandColor?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerClassName?: string;
};

const DEFAULT_BRAND = "#E4007E"; // CHULA_PINK

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      hint,
      error,
      brandColor = DEFAULT_BRAND,
      className,
      left,
      right,
      containerClassName,
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const isDisabled = !!rest.disabled;

    const onFocusWrap: React.FocusEventHandler<HTMLInputElement> = (e) => {
      if (isDisabled) return; // ไม่โชว์ focus ring ตอน disabled
      e.currentTarget.style.boxShadow = `0 0 0 6px ${brandColor}14`;
      onFocus?.(e);
    };
    const onBlurWrap: React.FocusEventHandler<HTMLInputElement> = (e) => {
      if (isDisabled) return;
      e.currentTarget.style.boxShadow = `0 0 0 0 rgba(0,0,0,0)`;
      onBlur?.(e);
    };

    // คลาสพื้นฐาน
    const base =
      "w-full rounded-xl border bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400";
    // คลาสตอน disabled — จะถูกใส่ท้ายสุดเสมอ (ชนะทุกอย่าง)
    const whenDisabled =
      "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200";
    // padding เผื่อ adornments
    const withAdorn = [left ? "pl-9" : "", right ? "pr-9" : ""].join(" ");

    // สไตล์เพิ่มตอน disabled ให้ชนะคลาส (กันโดน theme อื่นทับ)
    const disabledStyles: React.CSSProperties = {
      backgroundColor: "#F8FAFC", // slate-50
      color: "#6B7280", // slate-500
      borderColor: "#E5E7EB", // slate-200
    };

    // ลำดับ merge: (1) ขอบแบรนด์ถ้าไม่ disabled → (2) style ที่ส่งมา → (3) disabledStyles (ทับทั้งหมดตอน disabled)
    const mergedStyle: React.CSSProperties = {
      ...(isDisabled ? {} : { borderColor: `${brandColor}33` }),
      ...style,
      ...(isDisabled ? disabledStyles : {}),
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
          {left ? (
            <div
              className={`absolute inset-y-0 left-3 flex items-center ${
                isDisabled ? "opacity-60" : ""
              }`}
            >
              {left}
            </div>
          ) : null}

          <input
            id={id}
            ref={inputRef}
            {...rest}
            // ใส่คลาสของผู้ใช้ก่อน แล้วปิดท้ายด้วยคลาส disabled ให้ชนะเสมอ
            className={[
              base,
              className || "",
              withAdorn,
              isDisabled ? whenDisabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={mergedStyle}
            onFocus={onFocusWrap}
            onBlur={onBlurWrap}
            aria-invalid={!!error || undefined}
            aria-describedby={hint ? `${id}-hint` : undefined}
          />

          {right ? (
            <div
              className={`absolute inset-y-0 right-3 flex items-center ${
                isDisabled ? "opacity-60" : ""
              }`}
            >
              {right}
            </div>
          ) : null}
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

TextField.displayName = "TextField";

/** Password field พร้อมสวิทช์แสดง/ซ่อน (จะปิดปุ่มเมื่อ disabled) */
export function PasswordField(
  props: Omit<TextFieldProps, "type" | "right"> & {
    eyeLabelShow?: string;
    eyeLabelHide?: string;
  }
) {
  const {
    eyeLabelShow = "แสดง",
    eyeLabelHide = "ซ่อน",
    brandColor,
    disabled,
    ...rest
  } = props;
  const [show, setShow] = React.useState(false);

  const rightToggle = disabled ? null : (
    <button
      type="button"
      aria-pressed={show}
      onClick={() => setShow((s) => !s)}
      className="inline-flex select-none items-center gap-1 text-xs"
      style={{ color: brandColor || DEFAULT_BRAND }}
      tabIndex={-1}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        aria-hidden="true"
      >
        {show ? (
          <path
            d="M3 3l18 18M10.6 10.7A3 3 0 0 0 12 15a3 3 0 0 0 3-3 3 3 0 0 0-3-3c-.5 0-1 .1-1.4.3M6.2 6.7C3.9 8.3 2 12 2 12s3.5 7 10 7c2.1 0 3.9-.5 5.4-1.3M17.8 7.3C19.5 8.3 21 10 22 12c0 0-3.5 7-10 7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </>
        )}
      </svg>
      {show ? eyeLabelHide : eyeLabelShow}
    </button>
  );

  return (
    <TextField
      {...rest}
      type={show ? "text" : "password"}
      brandColor={brandColor}
      disabled={disabled}
      right={rightToggle}
    />
  );
}
