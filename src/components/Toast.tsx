import * as React from "react";

type ToastVariant = "success" | "error" | "info";
type ToastItem = {
  id: number;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  push: (t: Omit<ToastItem, "id">) => void;
  success: (
    message: string,
    opts?: Partial<Omit<ToastItem, "id" | "message" | "variant">>
  ) => void;
  error: (
    message: string,
    opts?: Partial<Omit<ToastItem, "id" | "message" | "variant">>
  ) => void;
  info: (
    message: string,
    opts?: Partial<Omit<ToastItem, "id" | "message" | "variant">>
  ) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(1);

  const remove = React.useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = React.useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = idRef.current++;
      const item: ToastItem = { duration: 3000, ...t, id };
      setToasts((list) => [...list, item]);

      if (item.duration && item.duration > 0) {
        window.setTimeout(() => remove(id), item.duration);
      }
    },
    [remove]
  );

  const success = React.useCallback<ToastContextValue["success"]>(
    (message, opts) => push({ message, variant: "success", ...opts }),
    [push]
  );
  const error = React.useCallback<ToastContextValue["error"]>(
    (message, opts) => push({ message, variant: "error", ...opts }),
    [push]
  );
  const info = React.useCallback<ToastContextValue["info"]>(
    (message, opts) => push({ message, variant: "info", ...opts }),
    [push]
  );

  const clear = React.useCallback(() => setToasts([]), []);

  const value = React.useMemo(
    () => ({ push, success, error, info, remove, clear }),
    [push, success, error, info, remove, clear]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

function Toaster({
  toasts,
  onClose,
}: {
  toasts: ToastItem[];
  onClose: (id: number) => void;
}) {
  // render หลัง mount เท่านั้น กัน hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      className="
        pointer-events-none
        fixed bottom-6 right-6
        z-[9999]
        flex w-full max-w-md flex-col gap-3
      "
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const { variant, title, message } = toast;

  const theme =
    variant === "success"
      ? {
          bg: "bg-emerald-50",
          bd: "border-emerald-200",
          fg: "text-emerald-900",
          icon: "✓",
        }
      : variant === "error"
        ? {
            bg: "bg-red-50",
            bd: "border-red-200",
            fg: "text-red-900",
            icon: "!",
          }
        : {
            bg: "bg-slate-50",
            bd: "border-slate-200",
            fg: "text-slate-900",
            icon: "i",
          };

  return (
    <div
      className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-md ${theme.bg} ${theme.bd}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3.5 px-4 py-3">
        <div
          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${theme.fg}`}
        >
          {theme.icon}
        </div>
        <div className="min-w-0 flex-1">
          {title ? (
            <div className={`text-sm font-semibold ${theme.fg}`}>{title}</div>
          ) : null}
          <div className="text-[0.95rem] text-slate-700">{message}</div>
        </div>
        <button
          onClick={onClose}
          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-black/5 hover:text-slate-700 cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
